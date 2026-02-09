import { ipcMain } from "electron";
import { addClient, searchClient } from "../controllers/klientiController.js";

export async function addClientHandler(){
    ipcMain.handle('addClient', async (event, formData)=>{
        return await addClient(formData);
    })
}

export async function searchClientHandler(){
    ipcMain.handle('searchClient', async (event, data) => {
        return await searchClient(data);
    })
}