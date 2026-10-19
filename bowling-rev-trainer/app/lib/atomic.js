'use strict';
// Small file helpers shared by the order book and the exporter.
// Windows antivirus, indexers and sync clients often hold a file for a moment right after it is
// written; a plain rename then fails with EPERM/EBUSY. Those errors are retried briefly.

const fs = require('fs');

const TRANSIENT = new Set(['EPERM', 'EBUSY', 'EACCES', 'EMFILE', 'ENFILE']);
const sleepBuf = new Int32Array(new SharedArrayBuffer(4));
function sleep(ms) { Atomics.wait(sleepBuf, 0, 0, ms); }

function retrySync(fn, tries = 6) {
  for (let i = 0; ; i++) {
    try { return fn(); } catch (e) {
      if (i >= tries - 1 || !e || !TRANSIENT.has(e.code)) throw e;
      sleep(40 * (i + 1));
    }
  }
}

// write the whole buffer (a single writeSync may write less)
function writeAll(fd, buf) {
  let off = 0;
  while (off < buf.length) off += fs.writeSync(fd, buf, off, buf.length - off);
}

function toBuf(data) { return Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8'); }

// Write `<file>.tmp`, flushed to disk. Returns the temp path (caller renames it into place).
function stage(file, data) {
  const tmp = file + '.tmp';
  const fd = retrySync(() => fs.openSync(tmp, 'w'));
  try { writeAll(fd, toBuf(data)); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
  return tmp;
}

function commit(tmp, file) { retrySync(() => fs.renameSync(tmp, file)); }

// Replace `file` with `data` so a crash leaves either the old or the new content, never half.
function writeAtomic(file, data) {
  const tmp = stage(file, data);
  try { commit(tmp, file); } catch (e) { try { fs.unlinkSync(tmp); } catch (_) { /* ignore */ } throw e; }
}

module.exports = { retrySync, writeAll, stage, commit, writeAtomic, TRANSIENT };
