import { ipcMain } from "electron";
import { addProdukt, getTodayProdukt } from "../controllers/produktController.js";


export async function addProduktHandler(){
    ipcMain.handle('addProdukt', async (event, formData) =>{
        return await addProdukt(formData);
    })
}

export async function getTodayProduktHandler(){
    ipcMain.handle('getTodayProdukt', async ()=>{
        return await getTodayProdukt();
    })
}