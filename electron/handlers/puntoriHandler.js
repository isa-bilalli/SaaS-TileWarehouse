import { ipcMain } from "electron";
import { registerPuntori, getAllPuntor } from "../controllers/puntoriController.js";


export function registerPuntoriHandler() {
    ipcMain.handle('registerPuntori', async (event, formData) =>{
        return await registerPuntori(formData);
    })
}

export function getAllPuntorHandler(){
    ipcMain.handle('getAllPuntor', async() =>{
        return await getAllPuntor();
    })
}