const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  registerPuntori: async (formData) => ipcRenderer.invoke('registerPuntori', formData),
  getAllPuntor: async() => ipcRenderer.invoke('getAllPuntor'),
  addPllake: async (formData) => ipcRenderer.invoke('addPllake', formData),
  addProdukt: async (formData) => ipcRenderer.invoke('addProdukt', formData),
  getTodayProdukt: async () => ipcRenderer.invoke('getTodayProdukt')
});