'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { OrderStore, PRODUCTS } = require('../lib/store');
const { exportOrderFiles, sanitizeName, safeFileName } = require('../lib/files');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'fitslice-'));
const FIT = { part: 'puck', hand: 'right', span_middle: 104.8, span_ring: 100, thumb_d: 23, middle_d: 15.9, ring_d: 16.7,
  bridge: 12.7, thumb_fwd: 0, thumb_lat: -0.125, middle_fwd: 0.75, middle_lat: 0.25, ring_fwd: 0.75, ring_lat: -0.25,
  thumb_through: true, weight_pocket: true, lanyard: true };
const input = (over = {}) => ({ customer: { name: 'Jordan Lee', email: 'j@example.com' }, product: 'pair', fit: FIT, ...over });

test('saves, numbers and reloads orders', () => {
  const dir = tmp();
  const a = new OrderStore(path.join(dir, 'orders.json'));
  const o1 = a.save(input());
  const o2 = a.save(input({ customer: { name: 'Sam Ortiz' }, product: 'puck' }));
  assert.equal(o1.number, 'FS-0001'); assert.equal(o2.number, 'FS-0002');
  assert.equal(o1.price, PRODUCTS.pair.price);
  const b = new OrderStore(path.join(dir, 'orders.json'));
  assert.equal(b.list().length, 2);
  assert.equal(b.list()[0].number, 'FS-0002');
  assert.equal(b.get(o1.id).fit.middle_fwd, 0.75);
});

test('numbers are never reused after a delete', () => {
  const s = new OrderStore(path.join(tmp(), 'orders.json'));
  const o1 = s.save(input()); s.delete(o1.id);
  assert.equal(s.save(input()).number, 'FS-0002');
});

test('updates keep number and creation time', () => {
  const s = new OrderStore(path.join(tmp(), 'orders.json'));
  const o = s.save(input());
  const u = s.save({ ...input(), id: o.id, status: 'printing', price: 99.5 });
  assert.equal(u.number, o.number); assert.equal(u.createdAt, o.createdAt);
  assert.equal(u.status, 'printing'); assert.equal(u.price, 99.5);
  assert.equal(s.list().length, 1);
});

test('rejects bad input with plain messages', () => {
  const s = new OrderStore(path.join(tmp(), 'orders.json'));
  assert.throws(() => s.save(input({ customer: { name: '  ' } })), /customer's name/);
  assert.throws(() => s.save(input({ product: 'nope' })), /product/);
  assert.throws(() => s.save(input({ status: 'weird' })), /status/);
  assert.throws(() => s.save(input({ price: -5 })), /price/);
  assert.throws(() => s.save(input({ fit: { ...FIT, hand: 'both' } })), /hand/);
  assert.throws(() => s.save(input({ fit: { ...FIT, thumb_d: 999 } })), /outside the range/);
  assert.throws(() => s.save(input({ id: 'missing-id' })), /no longer exists/);
});

test('drops unknown fit fields and strips control characters', () => {
  const s = new OrderStore(path.join(tmp(), 'orders.json'));
  const o = s.save(input({ customer: { name: 'A\u0000B\u0007C' }, fit: { ...FIT, evil: '__proto__', constructor: 1 } }));
  assert.equal(o.customer.name, 'ABC');
  assert.equal('evil' in o.fit, false);
  assert.equal(Object.getPrototypeOf(o.fit), Object.prototype);
});

test('survives a corrupt order book by restoring the backup', () => {
  const dir = tmp(); const file = path.join(dir, 'orders.json');
  const s = new OrderStore(file);
  s.save(input()); s.save(input({ customer: { name: 'Second' } }));
  fs.writeFileSync(file, '{ this is not json');
  const r = new OrderStore(file);
  assert.ok(r.recovered && /backup was restored/.test(r.recovered));
  assert.equal(r.list().length >= 1, true);
  assert.ok(fs.readdirSync(dir).some(n => n.includes('.corrupt-')));
});

test('starts empty and says so when there is no backup either', () => {
  const dir = tmp(); const file = path.join(dir, 'orders.json');
  fs.writeFileSync(file, 'garbage');
  const r = new OrderStore(file);
  assert.equal(r.list().length, 0); assert.match(r.recovered, /no backup/);
});

test('a leftover temp file from a crash does not break loading', () => {
  const dir = tmp(); const file = path.join(dir, 'orders.json');
  const s = new OrderStore(file); s.save(input());
  fs.writeFileSync(file + '.tmp', '{"half written');
  assert.equal(new OrderStore(file).list().length, 1);
});

test('CSV quotes fields and neutralizes spreadsheet formulas', () => {
  const s = new OrderStore(path.join(tmp(), 'orders.json'));
  s.save(input({ customer: { name: '=HYPERLINK("http://x","hi")' }, notes: 'line1\nline2, "quoted"' }));
  const csv = s.toCsv();
  assert.match(csv, /'=HYPERLINK/);
  assert.match(csv, /"line1\nline2, ""quoted"""/);
  assert.match(csv, /FS-0001/);
  // negative numbers in numeric columns are not treated as formulas
  assert.equal(/'-/.test(csv.split('\r\n')[1].split(',').slice(11, 13).join(',')), false);
});

test('stats count revenue except orders on hold', () => {
  const s = new OrderStore(path.join(tmp(), 'orders.json'));
  s.save(input({ product: 'pair' })); s.save(input({ product: 'puck', status: 'hold' })); s.save(input({ product: 'fitkit' }));
  const st = s.stats();
  assert.equal(st.orders, 3); assert.equal(st.revenue, 119 + 24); assert.equal(st.byStatus.hold, 1);
});

test('sanitizeName blocks traversal, reserved names and odd characters', () => {
  assert.equal(sanitizeName('../../etc/passwd'), 'etc-passwd');
  assert.equal(sanitizeName('CON'), 'customer');
  assert.equal(sanitizeName('nul.txt'), 'customer');
  assert.equal(sanitizeName('  Jo<>:"/\\|?*hn  '), 'Jo-hn');
  assert.equal(sanitizeName(''), 'customer');
  assert.ok(sanitizeName('x'.repeat(500)).length <= 80);
});

test('safeFileName allows only stl/json/txt and strips paths', () => {
  assert.equal(safeFileName('../../x/rev_puck.STL'), 'rev_puck.stl');
  assert.equal(safeFileName('C:\\Windows\\fit_sheet.json'), 'fit_sheet.json');
  assert.throws(() => safeFileName('run.exe'), /cannot be exported/);
  assert.throws(() => safeFileName('noext'), /cannot be exported/);
});

test('exportOrderFiles writes into <base>/<number name>/ and nowhere else', () => {
  const base = tmp();
  const order = { number: 'FS-0007', customer: { name: '../../Jordan' } };
  const r = exportOrderFiles(base, order, [
    { name: '../../evil/rev_puck.stl', data: new Uint8Array([1, 2, 3]) },
    { name: 'fit_sheet.json', data: '{"ok":true}' },
  ]);
  assert.equal(path.dirname(r.dir), base);
  assert.deepEqual(r.files.sort(), ['fit_sheet.json', 'rev_puck.stl']);
  assert.equal(fs.readFileSync(path.join(r.dir, 'rev_puck.stl')).length, 3);
  assert.equal(fs.existsSync(path.join(base, '..', 'evil')), false);
  assert.equal(fs.readdirSync(r.dir).some(n => n.endsWith('.tmp')), false);
});

test('exportOrderFiles rejects empty, duplicate and oversize requests', () => {
  const base = tmp(); const order = { number: 'FS-0001', customer: { name: 'A' } };
  assert.throws(() => exportOrderFiles(base, order, []), /no files/);
  assert.throws(() => exportOrderFiles(base, order, [{ name: 'a.stl', data: new Uint8Array(0) }]), /empty or too large/);
  assert.throws(() => exportOrderFiles(base, order, [{ name: 'a.stl', data: 'x' }, { name: 'A.STL', data: 'y' }]), /same name/);
  assert.throws(() => exportOrderFiles(base, order, Array.from({ length: 13 }, (_, i) => ({ name: `f${i}.stl`, data: 'x' }))), /Too many/);
});
