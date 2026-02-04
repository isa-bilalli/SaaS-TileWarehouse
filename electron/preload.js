const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  ping: async () => ipcRenderer.invoke('ping'),
});