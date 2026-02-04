import Puntori from '../models/Puntori.js'

export async function registerPuntori(formData){
    try{
        const res = await Puntori.create(formData);
        return res;
    }catch(err){
        throw new Error(err);
    }
}

export async function getAllPuntor(){
    try{
        const res = await Puntori.getAll();
        return res;
    }catch(err){
        throw new Error(err)
    }
}