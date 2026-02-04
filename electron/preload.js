const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload.js loaded!');

contextBridge.exposeInMainWorld('api', {
  ping: async () => ipcRenderer.invoke('ping'),
});