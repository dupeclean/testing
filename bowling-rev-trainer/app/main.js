'use strict';
const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { OrderStore, PRODUCTS, UserError } = require('./lib/store');
const { exportOrderFiles, sanitizeName } = require('./lib/files');

// Test and portable-use overrides. Normal use never sets these.
if (process.env.FITSLICE_DATA_DIR) app.setPath('userData', path.resolve(process.env.FITSLICE_DATA_DIR));

const RENDERER = path.join(__dirname, 'renderer', 'index.html');
let win = null;
let store = null;
let settings = { ordersFolder: null };

function settingsFile() { return path.join(app.getPath('userData'), 'settings.json'); }

function loadSettings() {
  try { settings = { ...settings, ...JSON.parse(fs.readFileSync(settingsFile(), 'utf8')) }; } catch (_) { /* first run */ }
  if (process.env.FITSLICE_ORDERS_DIR) settings.ordersFolder = path.resolve(process.env.FITSLICE_ORDERS_DIR);
  if (!settings.ordersFolder) settings.ordersFolder = path.join(app.getPath('documents'), 'FitSlice Orders');
}

function saveSettings() {
  fs.mkdirSync(path.dirname(settingsFile()), { recursive: true });
  fs.writeFileSync(settingsFile(), JSON.stringify({ ordersFolder: settings.ordersFolder }, null, 2));
}

// Only our own page may use the bridge.
const RENDERER_URL = pathToFileURL(RENDERER).href.toLowerCase();
function trusted(event) {
  const url = event.senderFrame && event.senderFrame.url;
  return typeof url === 'string' && url.split('#')[0].toLowerCase() === RENDERER_URL;
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
      throw new Error('Something went wrong on this computer while doing that. Check that the orders folder is writable and try again.');
    }
  });
}

function registerIpc() {
  handle('app:info', () => ({
    version: app.getVersion(),
    ordersFolder: settings.ordersFolder,
    dataFolder: app.getPath('userData'),
    products: PRODUCTS,
    recovered: store.recovered,
    stats: store.stats(),
  }));
  handle('orders:list', () => ({ orders: store.list(), stats: store.stats() }));
  handle('orders:save', (order) => ({ order: store.save(order), stats: store.stats() }));
  handle('orders:delete', (id) => ({ deleted: store.delete(String(id)), stats: store.stats() }));
  handle('files:exportOrder', (payload) => {
    const order = store.get(payload && String(payload.orderId));
    if (!order) throw new UserError('Save the order before exporting its files.');
    fs.mkdirSync(settings.ordersFolder, { recursive: true });
    return exportOrderFiles(settings.ordersFolder, order, payload.files);
  });
  handle('orders:exportCsv', () => {
    fs.mkdirSync(settings.ordersFolder, { recursive: true });
    const file = path.join(settings.ordersFolder, 'orders.csv');
    fs.writeFileSync(file, '﻿' + store.toCsv(), 'utf8'); // BOM so Excel reads accents correctly
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
    const dir = path.join(settings.ordersFolder, sanitizeName(`${order.number} ${order.customer.name}`.trim(), order.number));
    if (!fs.existsSync(dir)) throw new UserError('No files have been exported for this order yet.');
    const err = await shell.openPath(dir);
    return { ok: !err, folder: dir, error: err || null };
  });
  handle('app:chooseOrdersFolder', async () => {
    const res = await dialog.showOpenDialog(win, {
      title: 'Choose where order files are saved', defaultPath: settings.ordersFolder,
      properties: ['openDirectory', 'createDirectory'],
    });
    if (res.canceled || !res.filePaths[0]) return { changed: false, folder: settings.ordersFolder };
    settings.ordersFolder = res.filePaths[0];
    saveSettings();
    return { changed: true, folder: settings.ordersFolder };
  });
}

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
    { label: 'View', submenu: [{ role: 'reload' }, { role: 'togglefullscreen' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'resetZoom' }] },
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
    title: 'FitSlice', backgroundColor: '#e9edf0',
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
    store = new OrderStore(path.join(app.getPath('userData'), 'orders.json'));
    registerIpc();
    menu();
    createWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}
