import { ipcMain } from "electron";
import { addInvoice } from "../controllers/faturaController.js";

export async function addInvoiceHandler(){
    ipcMain.handle('addInvoice', async(event, formData)=>{
        return await addInvoice(formData);
    })
}