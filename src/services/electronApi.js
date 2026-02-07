export async function registerPuntori(formData){
    const res = await window.api.registerPuntori(formData)
    return res;
}

export async function getAllPuntor(){
    const res = await window.api.getAllPuntor();
    return res;
}

export async function addProduct(formData){
    const res = await window.api.addProduct(formData);
    return res;
}

export async function addPllake(formData){
    const res = await window.api.addPllake(formData);
    return res;
}

export async function getTodayProduct(){
    const rows = await window.api.getTodayProduct();
    return rows;
}

export async function searchProduct(data){
    const rows = await window.api.searchProduct(data);
    return rows;
}

export async function deleteProduct(productID){
    const res = await window.api.deleteProduct(productID);
    return res;
}

export async function isTile(productID){
    const res=await window.api.isTile(productID);
    return res;
}

export async function editProduct(formData){
    const res = await window.api.editProduct(formData);
    return res;
}

export async function getTileData(produktID){
    const res=await window.api.getTileData(produktID);
    return res;
}

export async function editTile(formData){
    const res = await window.api.editTile(formData);
    return res;
}