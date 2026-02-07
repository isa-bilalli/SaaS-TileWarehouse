import Product from "../models/Produkt.js";

export async function addProduct(formData){
    try{
        const dup = await Product.egziston(formData);
        if(dup){
            throw new Error('DUPLICATE_PRODUCT');
        }
        const res = await Product.Create(formData);
        return res;
    }catch(err){
        // Re-throw duplicate error so frontend can handle it
        if(err.message === 'DUPLICATE_PRODUCT'){
            throw err;
        }
        console.log('error during product add:', err);
        throw new Error('Error gjate shtimit te produktit');
    }
}

export async function getTodayProduct(){
    try{
        const rows = await Product.getToday();
        return rows;
    }catch(err){
        throw new Error(err);
    }
}

export async function searchProduct(data){
    try{
        const rows = await Product.searchProduct(data);
        return rows;
    }catch(err){
        throw new Error(err);
    }
}

export async function deleteProduct(data){
    try{
        const res = await Product.deleteProduct(data)
        return res;
    }catch(err){
        throw new Error(err);
    }
}

export async function editProduct(formData){
    try{
        const res = await Product.editProduct(formData);
        return res;
    }
    catch(err){
        console.log('editProduct controller error:', err); // Debug log
        throw new Error(err);
    }
}