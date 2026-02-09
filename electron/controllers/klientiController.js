import Klienti from '../models/Klienti.js'

export async function addClient(formData){
    const res = await Klienti.Create(formData);
    return res;
}

export async function searchClient(data){
    try{
        const rows = await Klienti.searchClient(data);
        return rows;
    }catch(err){
        throw new Error(err);
    }
}