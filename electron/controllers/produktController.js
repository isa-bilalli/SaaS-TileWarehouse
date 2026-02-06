import Product from "../models/Produkt.js";

export async function addProdukt(formData){
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

export async function getTodayProdukt(){
    try{
        const rows = await Product.getToday();
        return rows;
    }catch(err){
        throw new Error(err);
    }
}