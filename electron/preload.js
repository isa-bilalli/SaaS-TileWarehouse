const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  registerPuntori: async (formData) => ipcRenderer.invoke('registerPuntori', formData),
  getAllPuntor: async() => ipcRenderer.invoke('getAllPuntor'),
  addPllake: async (formData) => ipcRenderer.invoke('addPllake', formData),
  addProduct: async (formData) => ipcRenderer.invoke('addProduct', formData),
  getTodayProduct: async () => ipcRenderer.invoke('getTodayProduct'),
  searchProduct: async(data) => ipcRenderer.invoke('searchProduct', data),
  deleteProduct: async(data) => ipcRenderer.invoke('deleteProduct', data),
  isTile: async(data) => ipcRenderer.invoke('isTile', data),
  editProduct: async (formData) => ipcRenderer.invoke('editProduct', formData),
  getTileData: async(data) => ipcRenderer.invoke('getTileData', data),
  editTile: async(formData) => ipcRenderer.invoke('editTile', formData)
});