const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  ping: async () => ipcRenderer.invoke('ping'),
  registerPuntori: async (formData) => ipcRenderer.invoke('registerPuntori', formData),
  getAllPuntor: async() => ipcRenderer.invoke('getAllPuntor')
});