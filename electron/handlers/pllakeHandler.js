import { ipcMain } from "electron";
import { addPllake, isTile, getTileData, editTile} from "../controllers/PllakaController.js";

export async function addPllakeHandler(){
    ipcMain.handle('addPllake', async (event, formData)=>{
        return await addPllake(formData);
    })
}

export async function isTileHandler(){
    ipcMain.handle('isTile', async(event, data)=>{
        return await isTile(data);
    })
}

export async function getTileDataHandler(){
    ipcMain.handle('getTileData', async(event, data) =>{
        return await getTileData(data);
    })
}

export async function editTileHandler(){
    ipcMain.handle('editTile', async(event, formData)=>{
        return await editTile(formData);
    })
}