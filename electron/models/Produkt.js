import { getPool } from '../db/db.js'

class Product{
    static async Create(ProductData){
        const {emriProduktit, cmimi, sasia} = ProductData;
        const query = `INSERT INTO Produkt (emriProduktit, cmimi, sasia) VALUES (?, ?, ?)`;
        const pool = getPool();
        const [result] = await pool.execute(query, [emriProduktit, cmimi, sasia]);
        return result.insertId;
    }
    static async findById(produktID){
        const query = `SELECT produktID, emriProduktit, cmimi, sasia from Produkt WHERE produktID = ?`
        const pool = getPool();
        const [rows] = await pool.execute(query, [produktID]);
        return rows[0] || null;
    }
}

export default Product;