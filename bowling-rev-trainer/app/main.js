'use strict';
const { app, BrowserWindow, ipcMain, dialog, shell, Menu, session } = require('electron');
const fs = require('fs');
const path = require('path');
const { OrderStore, PRODUCTS, UserError } = require('./lib/store');
const { exportOrderFiles } = require('./lib/files');
const { writeAtomic } = require('./lib/atomic');
const { isRendererUrl } = require('./lib/trust');

// Test and portable-use overrides. Normal use never sets these.
if (process.env.ROLLREAD_DATA_DIR) app.setPath('userData', path.resolve(process.env.ROLLREAD_DATA_DIR));

const RENDERER = path.join(__dirname, 'renderer', 'index.html');
let win = null;
let store = null;
let settings = { ordersFolder: null };

function settingsFile() { return path.join(app.getPath('userData'), 'settings.json'); }

// The app was called FitSlice until 26 October 2026, so an earlier install kept its order book in
// %APPDATA%\FitSlice and its print files in Documents\FitSlice Orders. The first start of RollRead
// copies the book (and the settings) across and keeps pointing at the old print-files folder, so
// nothing is lost or moved. Never runs under the test override, and never twice.
let migratedFrom = null;
function migrateFromFitSlice() {
  if (process.env.ROLLREAD_DATA_DIR) return;
  const newDir = app.getPath('userData'), oldDir = path.join(path.dirname(newDir), 'FitSlice');
  try {
    if (oldDir === newDir || fs.existsSync(path.join(newDir, 'orders.json')) || !fs.existsSync(path.join(oldDir, 'orders.json'))) return;
    fs.mkdirSync(newDir, { recursive: true });
    for (const f of ['orders.json', 'orders.json.bak', 'orders.json.seq', 'settings.json'])
      if (fs.existsSync(path.join(oldDir, f))) fs.copyFileSync(path.join(oldDir, f), path.join(newDir, f));
    let s = {};
    try { s = JSON.parse(fs.readFileSync(path.join(newDir, 'settings.json'), 'utf8')); } catch (_) { /* none saved */ }
    const oldOrders = path.join(app.getPath('documents'), 'FitSlice Orders');
    if (!s.ordersFolder && fs.existsSync(oldOrders)) fs.writeFileSync(path.join(newDir, 'settings.json'), JSON.stringify({ ordersFolder: oldOrders }, null, 2));
    migratedFrom = oldDir;
  } catch (e) { console.error('could not carry the FitSlice order book over:', e); }
}

function loadSettings() {
  migrateFromFitSlice();
  try { settings = { ...settings, ...JSON.parse(fs.readFileSync(settingsFile(), 'utf8')) }; } catch (_) { /* first run */ }
  if (process.env.ROLLREAD_ORDERS_DIR) settings.ordersFolder = path.resolve(process.env.ROLLREAD_ORDERS_DIR);
  const fallback = path.join(app.getPath('documents'), 'RollRead Orders');
  if (!settings.ordersFolder) settings.ordersFolder = fallback;
  // a folder saved on another computer (or a drive that is gone) must not break every export
  try { fs.mkdirSync(settings.ordersFolder, { recursive: true }); } catch (_) {
    settings.ordersFolderProblem = `The orders folder ${settings.ordersFolder} could not be used, so ${fallback} is being used instead. Choose another with File > Choose orders folder.`;
    settings.ordersFolder = fallback;
  }
}

function saveSettings() {
  fs.mkdirSync(path.dirname(settingsFile()), { recursive: true });
  fs.writeFileSync(settingsFile(), JSON.stringify({ ordersFolder: settings.ordersFolder }, null, 2));
}

// Only our own page may use the bridge.
function trusted(event) {
  return isRendererUrl(event.senderFrame && event.senderFrame.url, RENDERER);
}

// Plain-language text for the file problems a small shop actually meets.
function friendlyFsError(e) {
  const code = e && e.code;
  if (code === 'ENOSPC') return 'The disk is full, so nothing could be saved. Free some space and try again.';
  if (code === 'EPERM' || code === 'EBUSY' || code === 'EACCES') return `Windows would not let RollRead write ${e.path ? '"' + e.path + '"' : 'there'}. A file may be open in another program (Excel, a slicer, a sync or backup tool), or the folder is protected. Close it and try again. If it is the print-files folder, you can choose another with File > Choose orders folder.`;
  if (code === 'ENOENT' || code === 'ENOTDIR') return 'The orders folder could not be found. It may be on a drive that is not connected. Choose another with File > Choose orders folder.';
  if (code === 'EROFS') return 'That folder is read-only. Choose another with File > Choose orders folder.';
  return null;
}

function handle(channel, fn) {
  ipcMain.handle(channel, async (event, ...args) => {
    if (!trusted(event)) throw new Error('Blocked request from an untrusted page.');
    try {
      return await fn(...args);
    } catch (e) {
      // Plain-language messages for expected problems; anything else is logged and summarized.
      if (e instanceof UserError) throw new Error(e.message);
      console.error(`[${channel}]`, e);
      throw new Error(friendlyFsError(e) || 'Something went wrong on this computer while doing that. Check that the orders folder is writable and try again.');
    }
  });
}

// When this build was made: the package's own timestamp (the asar when packaged, main.js from source), so
// a support question can tell which build a window belongs to. Shown in the title bar and on the job sheet.
function buildStamp() {
  try {
    // Electron's fs shim presents app.asar as a folder with a made-up timestamp (the launch time), so
    // the archive's real modification time has to come from the unpatched fs
    const d = app.isPackaged ? require('original-fs').statSync(path.join(process.resourcesPath, 'app.asar')).mtime : fs.statSync(__filename).mtime;
    const two = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())} ${two(d.getHours())}:${two(d.getMinutes())}`;
  } catch (e) { return 'unknown'; }
}

function registerIpc() {
  handle('app:info', () => ({
    version: app.getVersion(),
    built: buildStamp(),
    ordersFolder: settings.ordersFolder,
    dataFolder: app.getPath('userData'),
    products: PRODUCTS,
    recovered: [store.recovered, settings.ordersFolderProblem].filter(Boolean).join(' ') || null,
    stats: store.stats(),
  }));
  handle('orders:list', () => ({ orders: store.list(), stats: store.stats() }));
  handle('orders:save', (order) => ({ order: store.save(order), stats: store.stats() }));
  handle('orders:delete', async (id) => {
    const order = store.get(String(id));
    if (!order) return { deleted: false, stats: store.stats() };
    // the confirmation is a native dialog, so no double-click or stray keypress can delete an order
    const { response } = await dialog.showMessageBox(win, {
      type: 'warning', buttons: ['Delete order', 'Keep it'], defaultId: 1, cancelId: 1, noLink: true,
      message: `Delete ${order.number} (${order.customer.name})?`,
      detail: 'It is removed from the order book and cannot be brought back. Files already exported for it are not touched.',
    });
    if (response !== 0) return { deleted: false, cancelled: true, stats: store.stats() };
    return { deleted: store.delete(order.id), stats: store.stats() };
  });
  handle('files:exportOrder', (payload) => {
    const order = store.get(payload && String(payload.orderId));
    if (!order) throw new UserError('Save the order before exporting its files.');
    fs.mkdirSync(settings.ordersFolder, { recursive: true });
    const r = exportOrderFiles(settings.ordersFolder, order, payload.files);
    store.recordExport(order.id, { folder: r.folder, files: r.files });
    return r;
  });
  handle('orders:exportCsv', () => {
    fs.mkdirSync(settings.ordersFolder, { recursive: true });
    const file = path.join(settings.ordersFolder, 'orders.csv');
    try {
      writeAtomic(file, '\uFEFF' + store.toCsv()); // BOM so Excel reads accents correctly
    } catch (e) {
      if (e && (e.code === 'EBUSY' || e.code === 'EPERM' || e.code === 'EACCES')) throw new UserError(`The spreadsheet ${file} is open in another program, probably Excel. Close it and export again.`);
      throw e;
    }
    return { file };
  });
  handle('app:openOrdersFolder', async () => {
    fs.mkdirSync(settings.ordersFolder, { recursive: true });
    const err = await shell.openPath(settings.ordersFolder);
    return { ok: !err, folder: settings.ordersFolder, error: err || null };
  });
  handle('app:openOrderFolder', async (id) => {
    const order = store.get(String(id));
    if (!order) throw new UserError('That order was not found.');
    if (!order.exportFolder) throw new UserError('No files have been exported for this order yet.');
    const dir = path.join(settings.ordersFolder, order.exportFolder);
    if (!isInside(settings.ordersFolder, dir)) throw new UserError('That order folder is not inside the orders folder.');
    if (!fs.existsSync(dir)) throw new UserError(`The folder for this order (${dir}) is missing. It may have been moved or deleted, or the orders folder was changed. Export the print files again to recreate it.`);
    const err = await shell.openPath(dir);
    if (err) throw new UserError(`Windows could not open the folder ${dir}: ${err}`);
    return { ok: true, folder: dir, error: null };
  });
  handle('app:chooseOrdersFolder', async () => {
    const res = await dialog.showOpenDialog(win, {
      title: 'Choose where order files are saved', defaultPath: settings.ordersFolder,
      properties: ['openDirectory', 'createDirectory'],
    });
    if (res.canceled || !res.filePaths[0]) return { changed: false, folder: settings.ordersFolder };
    settings.ordersFolder = res.filePaths[0];
    settings.ordersFolderProblem = null;
    saveSettings();
    return { changed: true, folder: settings.ordersFolder };
  });
}

function isInside(base, target) { return path.dirname(path.resolve(target)) === path.resolve(base); }

function menu() {
  const send = (name) => () => win && win.webContents.send('menu', name);
  const template = [
    { label: 'File', submenu: [
      { label: 'New order', accelerator: 'CmdOrCtrl+N', click: send('new-order') },
      { label: 'Orders', accelerator: 'CmdOrCtrl+O', click: send('open-orders') },
      { type: 'separator' },
      { label: 'Open orders folder', click: send('open-folder') },
      { label: 'Choose orders folder…', click: send('choose-folder') },
      { label: 'Export orders to spreadsheet (CSV)', click: send('export-csv') },
      { type: 'separator' },
      process.platform === 'darwin' ? { role: 'close' } : { role: 'quit' },
    ] },
    { label: 'View', submenu: [{ role: 'togglefullscreen' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'resetZoom' }] },
    { label: 'Help', submenu: [
      { label: 'Where is my data?', click: send('about-data') },
    ] },
  ];
  if (process.platform === 'darwin') template.unshift({ label: app.name, submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'quit' }] });
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
  win = new BrowserWindow({
    width: 1440, height: 920, minWidth: 900, minHeight: 640,
    title: 'RollRead', backgroundColor: '#e9edf0',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false, sandbox: true,
      webSecurity: true, allowRunningInsecureContent: false,
    },
  });
  // The page never navigates and never opens windows; downloads from the page's own buttons still work.
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (e, url) => { if (url !== win.webContents.getURL()) e.preventDefault(); });
  win.webContents.session.setPermissionRequestHandler((_wc, _perm, cb) => cb(false));
  // unsaved order or drill-sheet edits: ask before the window closes or reloads
  win.webContents.on('will-prevent-unload', (e) => {
    const choice = dialog.showMessageBoxSync(win, {
      type: 'question', buttons: ['Close without saving', 'Go back'], defaultId: 1, cancelId: 1, noLink: true,
      message: 'You have changes that are not saved.', detail: 'Choose Go back, then Save order to keep them.',
    });
    if (choice === 0) e.preventDefault();
  });
  win.webContents.on('render-process-gone', (_e, details) => {
    console.error('renderer gone:', details.reason);
    dialog.showMessageBoxSync(win, { type: 'error', message: 'The RollRead window stopped working.', detail: 'Your saved orders are safe. The window will reopen; anything you had typed but not saved is lost.' });
    if (win && !win.isDestroyed()) win.loadFile(RENDERER);
  });
  win.loadFile(RENDERER);
  win.on('closed', () => { win = null; });
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.whenReady().then(() => {
    loadSettings();
    // Nothing in this app talks to the network. The page's policy already forbids it; this also
    // stops Chromium itself (spell-check dictionary download) and refuses any non-local request.
    const ses = session.defaultSession;
    ses.setSpellCheckerEnabled(false);
    ses.setSpellCheckerLanguages([]);
    ses.webRequest.onBeforeRequest((details, cb) => cb({ cancel: !/^(file|data|blob):/i.test(details.url) }));
    try {
      store = new OrderStore(path.join(app.getPath('userData'), 'orders.json'));
    } catch (e) {
      dialog.showErrorBox('RollRead could not open your order book', e instanceof UserError ? e.message : `${e && e.message || e}`);
      app.quit();
      return;
    }
    registerIpc();
    if (migratedFrom) dialog.showMessageBox({ type: 'info', title: 'RollRead', message: 'Your order book was carried over from FitSlice.', detail: `The orders were copied from ${migratedFrom}; the old copy is untouched. Print files keep going to your existing orders folder. New orders are numbered RR-; the FS- numbers already issued stay as they are.` });
    menu();
    createWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}
