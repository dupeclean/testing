'use strict';
// Writing an order's print files into the orders folder.
// The renderer is not trusted with paths: it sends file names and contents only,
// and every name is reduced to a safe base name with an allowed extension.

const fs = require('fs');
const path = require('path');
const { UserError } = require('./store');
const { retrySync, stage, commit } = require('./atomic');

const ALLOWED_EXT = new Set(['.stl', '.3mf', '.json', '.txt', '.pdf']);   // .3mf: the ball's two-colour file for Bambu Studio
const MAX_FILES = 12;
const MAX_BYTES = 100 * 1024 * 1024;
const RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

function sanitizeName(s, fallback = 'customer') {
  let out = String(s == null ? '' : s)
    .replace(/[\u0000-\u001f\u007f<>:"/\\|?*]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/-{2,}/g, '-')
    .replace(/^[ .-]+|[ .]+$/g, '')
    .slice(0, 80)
    .replace(/[ .]+$/g, '');
  if (!out || RESERVED.test(out.split('.')[0])) out = fallback;
  return out;
}

function safeFileName(name) {
  const base = path.basename(String(name || '').replace(/\\/g, '/'));
  const ext = path.extname(base).toLowerCase();
  if (!ALLOWED_EXT.has(ext)) throw new UserError(`Files of type "${ext || 'none'}" cannot be exported.`);
  const stem = sanitizeName(path.basename(base, path.extname(base)), 'file');
  return stem + ext;
}

function toBuffer(data) {
  if (typeof data === 'string') return Buffer.from(data, 'utf8');
  if (ArrayBuffer.isView(data)) return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  if (data instanceof ArrayBuffer) return Buffer.from(data);
  throw new UserError('A file had unreadable contents.');
}

// A name that is already one safe folder name (as produced by sanitizeName) directly inside baseDir.
function isSafeFolder(baseDir, name) {
  if (typeof name !== 'string' || !name || sanitizeName(name, '') !== name) return false;
  return path.dirname(path.resolve(baseDir, name)) === path.resolve(baseDir);
}

function stamp() { return new Date().toISOString().replace(/[-:]/g, '').replace(/\..*/, ''); }

// Writes an order's files into `<baseDir>/<folder>` and returns { dir, folder, files, superseded }.
//  - The folder name is chosen once ("FS-0001 Jordan Lee") and then kept (order.exportFolder),
//    so fixing a typo in the customer's name later never strands the files.
//  - All files are staged as .tmp first and renamed only once every one was written, so a failure
//    cannot leave a mix of new and old files.
//  - Files from an earlier export of this order that are not part of this export are moved to a
//    "superseded" subfolder, so the folder always holds exactly the current print files.
function exportOrderFiles(baseDir, order, files) {
  if (!Array.isArray(files) || files.length === 0) throw new UserError('There are no files to export.');
  if (files.length > MAX_FILES) throw new UserError('Too many files in one export.');
  const resolvedBase = path.resolve(baseDir);
  const folder = isSafeFolder(baseDir, order.exportFolder)
    ? order.exportFolder
    : sanitizeName(`${order.number} ${order.customer && order.customer.name || ''}`.trim(), order.number);
  const dir = path.join(baseDir, folder);
  if (path.dirname(path.resolve(dir)) !== resolvedBase) throw new UserError('Unsafe export folder.');
  const prepared = files.map(f => {
    const buf = toBuffer(f && f.data);
    if (buf.length === 0 || buf.length > MAX_BYTES) throw new UserError('A file was empty or too large.');
    return { name: safeFileName(f && f.name), buf };
  });
  const names = new Set();
  for (const p of prepared) {
    if (names.has(p.name.toLowerCase())) throw new UserError('Two files have the same name.');
    names.add(p.name.toLowerCase());
  }
  retrySync(() => fs.mkdirSync(dir, { recursive: true }));

  const staged = [];
  try {
    for (const p of prepared) staged.push({ tmp: stage(path.join(dir, p.name), p.buf), file: path.join(dir, p.name) });
  } catch (e) {
    for (const q of prepared) { try { fs.unlinkSync(path.join(dir, q.name + '.tmp')); } catch (_) { /* not created */ } }
    throw e;
  }
  const done = [];
  try {
    for (const s of staged) { commit(s.tmp, s.file); done.push(path.basename(s.file)); }
  } catch (e) {
    for (const s of staged) { try { fs.unlinkSync(s.tmp); } catch (_) { /* already renamed or never created */ } }
    if (e && ['EPERM', 'EBUSY', 'EACCES'].includes(e.code)) {
      throw new UserError(`Windows would not let RollRead replace ${e.path ? '"' + path.basename(e.path) + '"' : 'a file'} in the order folder. It is probably open in another program (a slicer, Explorer's preview, a sync tool). ${done.length} of ${staged.length} files had been replaced (${done.join(', ') || 'none'}). Close the other program and export again; nothing needs cleaning up.`);
    }
    throw e;
  }

  const superseded = [];
  const previous = Array.isArray(order.exportFiles) ? order.exportFiles : [];
  for (const old of previous) {
    if (names.has(String(old).toLowerCase()) || path.basename(String(old)) !== old) continue;
    const from = path.join(dir, old);
    if (!fs.existsSync(from)) continue;
    const to = path.join(dir, 'superseded');
    fs.mkdirSync(to, { recursive: true });
    retrySync(() => fs.renameSync(from, path.join(to, `${stamp()} ${old}`)));
    superseded.push(old);
  }
  return { dir, folder, files: prepared.map(p => p.name), superseded };
}

module.exports = { exportOrderFiles, sanitizeName, safeFileName, isSafeFolder };
