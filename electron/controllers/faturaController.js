import Fatura from "../models/Fatura.js";
import ProduktiFatura from "../models/ProduktiFatura.js";
import Product from "../models/Produkt.js";
import { getPool } from "../db/db.js";

export async function addInvoice(formData){
    const {puntoriID, shumaPaguar, totaliPaZbritje, zbritja, klientiID, products} = formData;
    const faturaPayload = {
        shumaPaguar: shumaPaguar,
        totaliPaZbritje: totaliPaZbritje,
        zbritja: zbritja,
        puntoriID: puntoriID,
        klientiID: klientiID || null
    };
    const cleanedProducts = products.map(product => ({
        NrList: product.Nr,
        sasia: product.sasiaFatures,
        cmimiNjesi: product.cmimiNjesi,
        cmimiTotal: product.cmimiProdukt,
        njesiaMatese: product.NjesiaMatese,
        produktID: product.produktID
    }));

    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
        // Start transaction
        await connection.beginTransaction();

        // Create invoice
        const faturaID = await Fatura.Create(faturaPayload, connection);

        // Create invoice products and update stock
        for (const product of cleanedProducts) {
            // Create ProduktiFatura entry
            await ProduktiFatura.Create({
                ...product,
                faturaID: faturaID
            }, connection);

            // Reduce product stock
            await Product.reduceStock(product.produktID, product.sasia, connection);
        }

        // Commit transaction
        await connection.commit();
        
        return { success: true, faturaID };
    } catch (error) {
        // Rollback transaction on error
        await connection.rollback();
        throw error;
    } finally {
        // Release connection
        connection.release();
    }
}