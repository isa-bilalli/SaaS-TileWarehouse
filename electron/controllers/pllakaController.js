import { addProdukt } from './produktController.js';
import Pllaka from '../models/Pllaka.js'

export async function addPllake(formData){
    try{
        const {emriProduktit, cmimi, sasia, gjatesia, gjeresia, pllakaNeKuti} = formData;
        const productForm = {emriProduktit, cmimi, sasia};
        const produktID = await addProdukt(productForm);
        if(produktID === null || produktID === undefined){
            // This should not happen if addProdukt throws error for duplicates
            // But keeping as fallback
            return null;
        }
        const tileForm = {produktID, gjatesia, gjeresia, pllakaNeKuti};
        const final = await Pllaka.Create(tileForm);
        return final;
    }catch(err){
        // Re-throw duplicate error so frontend can handle it
        if(err.message === 'DUPLICATE_PRODUCT'){
            throw err;
        }
        console.log('error during pllakacontroller:', err);
        throw new Error('Error gjate shtimit te pllakes');
    }
}