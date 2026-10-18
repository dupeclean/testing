'use strict';
// The only door between the page and the computer. The page can ask for these
// named actions and nothing else: it never sees a file path it can choose, and
// it has no Node.js access.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('fitslice', {
  isApp: true,
  info: () => ipcRenderer.invoke('app:info'),
  listOrders: () => ipcRenderer.invoke('orders:list'),
  saveOrder: (order) => ipcRenderer.invoke('orders:save', order),
  deleteOrder: (id) => ipcRenderer.invoke('orders:delete', id),
  exportOrder: (payload) => ipcRenderer.invoke('files:exportOrder', payload),
  exportCsv: () => ipcRenderer.invoke('orders:exportCsv'),
  openOrdersFolder: () => ipcRenderer.invoke('app:openOrdersFolder'),
  openOrderFolder: (id) => ipcRenderer.invoke('app:openOrderFolder', id),
  chooseOrdersFolder: () => ipcRenderer.invoke('app:chooseOrdersFolder'),
  onMenu: (cb) => { ipcRenderer.on('menu', (_e, name) => cb(name)); },
});
