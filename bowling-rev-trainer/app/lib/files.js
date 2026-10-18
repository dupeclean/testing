'use strict';
// Writing an order's print files into the orders folder.
// The renderer is not trusted with paths: it sends file names and contents only,
// and every name is reduced to a safe base name with an allowed extension.

const fs = require('fs');
const path = require('path');
const { UserError } = require('./store');

const ALLOWED_EXT = new Set(['.stl', '.json', '.txt']);
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

function writeAtomic(file, buf) {
  const tmp = file + '.tmp';
  const fd = fs.openSync(tmp, 'w');
  try { fs.writeSync(fd, buf); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  fs.renameSync(tmp, file);
}

// Returns { dir, files: [names written] }.
function exportOrderFiles(baseDir, order, files) {
  if (!Array.isArray(files) || files.length === 0) throw new UserError('There are no files to export.');
  if (files.length > MAX_FILES) throw new UserError('Too many files in one export.');
  const folder = sanitizeName(`${order.number} ${order.customer && order.customer.name || ''}`.trim(), order.number);
  const dir = path.join(baseDir, folder);
  const resolvedBase = path.resolve(baseDir);
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
  fs.mkdirSync(dir, { recursive: true });
  for (const p of prepared) writeAtomic(path.join(dir, p.name), p.buf);
  return { dir, files: prepared.map(p => p.name) };
}

module.exports = { exportOrderFiles, sanitizeName, safeFileName };
