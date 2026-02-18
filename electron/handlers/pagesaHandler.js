import { ipcMain } from "electron";
import { addPagesa, getPaymentsToday, searchPagesa } from "../controllers/pagesaController.js";

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

export async function searchPagesaHandler(){
    ipcMain.handle('searchPagesa', async(event, formData)=>{
        return await searchPagesa(formData);
    })
}