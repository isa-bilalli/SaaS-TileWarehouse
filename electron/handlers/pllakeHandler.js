import { ipcMain } from "electron";
import { addPllake } from "../controllers/PllakaController.js";

export async function addPllakeHandler(){
    ipcMain.handle('addPllake', async (event, formData)=>{
        return await addPllake(formData);
    })
}