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

export async function addClient(formData){
    const res = await window.api.addClient(formData);
    return res;
}

export async function searchClient(data){
    const rows = await window.api.searchClient(data);
    return rows;
}

export async function addInvoice(formData){
    const res = await window.api.addInvoice(formData);
    return res;
}

export async function searchInvoices(formData){
    const rows = await window.api.searchInvoices(formData);
    return rows;
}

export async function printToPDF(htmlContent, options){
    const pdfBuffer = await window.api.printToPDF(htmlContent, options);
    return pdfBuffer;
}

export async function savePDF(pdfBuffer, filename){
    const res = await window.api.savePDF(pdfBuffer, filename);
    return res;
}

export async function getProductsInvoice(faturaID){
    const rows = await window.api.getProductsInvoice(faturaID);
    return rows;
}

export async function getDashboardData(){
    const data = await window.api.getDashboardData();
    return data;
}

export async function getInvoicesWithDebtByID(klientiID){
    const rows = await window.api.getInvoicesWithDebtById(klientiID);
    return rows;
}

export async function addPayment(formData){
    const res = await window.api.addPayment(formData);
    return res;
}

export async function getPaymentsToday(){
    const rows = await window.api.getPaymentsToday();
    return rows;
}

export async function searchPagesa(formData){
    const rows = await window.api.searchPagesa(formData);
    return rows;
}