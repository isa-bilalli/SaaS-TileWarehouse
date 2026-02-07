import { addProduct, editProduct } from './produktController.js';
import Pllaka from '../models/Pllaka.js';
import { getPool } from '../db/db.js';

export async function addPllake(formData){
    try{
        const {emriProduktit, cmimi, sasia, gjatesia, gjeresia, pllakaNeKuti} = formData;
        const productForm = {emriProduktit, cmimi, sasia};
        const produktID = await addProduct(productForm);
        if(produktID === null || produktID === undefined){
            // This should not happen if addProduct throws error for duplicates
            // But keeping as fallback
            return null;
        }
        const tileForm = {produktID, gjatesia, gjeresia, pllakaNeKuti};
        const final = await Pllaka.Create(tileForm);
        return final;
    }catch(err){
        if(err.message === 'DUPLICATE_PRODUCT'){
            throw err;
        }
        throw new Error('Error gjate shtimit te pllakes');
    }
}

export async function isTile(produktID){
    try{
        const res = await Pllaka.isTile(produktID);
        return res;
    }catch(err){
        throw new Error(err);
    }
}

export async function getTileData(produktID){
    try{
        const res = await Pllaka.getTileData(produktID);
        return res;
    }catch(err){
        throw new Error(err);
    }
}

export async function editTile(formData){
    const pool = getPool();
    const connection = await pool.getConnection();
    
    try{
        // Begin transaction
        await connection.beginTransaction();
        
        const {produktID, emriProduktit, cmimi, sasia, gjatesia, gjeresia, pllakaNeKuti} = formData;
        
        // Update product (using transaction connection)
        const productData = {produktID, emriProduktit, cmimi, sasia};
        if(productData.emriProduktit === undefined || productData.emriProduktit === null){
            throw new Error('emriProduktit is required');
        }
        if(typeof productData.emriProduktit !== 'string'){
            throw new Error(`emriProduktit must be a string, got ${typeof productData.emriProduktit}`);
        }
        if(productData.emriProduktit.trim() === ''){
            throw new Error('emriProduktit cannot be empty');
        }
        
        const productQuery = `UPDATE Produkt SET emriProduktit = ?, searchName = ?, cmimi = ?, sasia = ? WHERE produktID = ?`;
        await connection.execute(productQuery, [
            productData.emriProduktit, 
            productData.emriProduktit.toLowerCase(), 
            productData.cmimi, 
            productData.sasia, 
            productData.produktID
        ]);
        
        // Update tile (using transaction connection)
        const tileData = {produktID, gjatesia, gjeresia, pllakaNeKuti};
        const gjatesiaM = gjatesia / 100; // Convert CM to M
        const gjeresiaM = gjeresia / 100;
        const tileQuery = `UPDATE Pllaka SET gjatesia = ?, gjeresia = ?, pllakaNeKuti = ? WHERE produktID = ?`;
        const [tileResult] = await connection.execute(tileQuery, [
            gjatesiaM, 
            gjeresiaM, 
            tileData.pllakaNeKuti, 
            tileData.produktID
        ]);
        
        // Check if tile was actually updated
        if(tileResult.affectedRows === 0){
            throw new Error('Tile not found for this product');
        }
        
        // Commit transaction if both succeed
        await connection.commit();
        return tileResult;
        
    }catch(err){
        // Rollback transaction on any error
        await connection.rollback();
        
        // Preserve original error message (Error 5 fix)
        if(err instanceof Error){
            throw err; // Re-throw Error objects as-is to preserve message
        }
        throw new Error(err.message || err); // Preserve message if it exists
    }finally{
        // Always release connection back to pool
        connection.release();
    }
}