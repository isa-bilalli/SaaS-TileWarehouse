import { ipcMain } from "electron";
import { addInvoice, searchInvoices, getProductsInvoice, getDashboardData, getInvoicesWithDebtByID } from "../controllers/faturaController.js";

export async function addInvoiceHandler(){
    ipcMain.handle('addInvoice', async(event, formData)=>{
        return await addInvoice(formData);
    })
}

export async function searchInvoicesHandler(){
    ipcMain.handle('searchInvoices', async(event, formData)=>{
        return await searchInvoices(formData);
    })
}

export async function getProductsInvoiceHandler(){
    ipcMain.handle('getProductsInvoice', async(event, faturaID)=>{
        return await getProductsInvoice(faturaID);
    })
}

export async function getDashboardDataHandler(){
    ipcMain.handle('getDashboardData', async()=>{
        return await getDashboardData();
    })
}

export async function getInvoicesWithDebtByIDHandler(){
    ipcMain.handle('getInvoicesWithDebtByID', async(event, klientiID)=>{
        return await getInvoicesWithDebtByID(klientiID);
    })
}