import { ipcMain } from "electron";
import { addProduct, getTodayProduct, searchProduct as searchProductController, deleteProduct, editProduct } from "../controllers/produktController.js";


export async function addProductHandler(){
    ipcMain.handle('addProduct', async (event, formData) =>{
        return await addProduct(formData);
    })
}

export async function getTodayProductHandler(){
    ipcMain.handle('getTodayProduct', async ()=>{
        return await getTodayProduct();
    })
}

export async function searchProductHandler(){
    ipcMain.handle('searchProduct', async (event, data) => {
        return await searchProductController(data);
    })
}

export async function deleteProductHandler(){
    ipcMain.handle('deleteProduct', async(event, data) =>{
        return await deleteProduct(data);
    })
}

export async function editProductHandler(){
    ipcMain.handle('editProduct', async(event, formData) => {
        return await editProduct(formData);
    })
}