import { ipcMain } from "electron";
import { addPagesa, getPaymentsToday } from "../controllers/pagesaController.js";

export async function addPaymentHandler(){
    ipcMain.handle('addPayment', async(event, formData) =>{
        return await addPagesa(formData);
    })
}

export async function getPaymentsTodayHandler(){
    ipcMain.handle('getPaymentsToday', async(event) =>{
        return await getPaymentsToday();
    })
}