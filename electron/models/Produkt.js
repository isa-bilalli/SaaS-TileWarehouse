import { getPool } from '../db/db.js'

class Product{
    static async Create(ProductData){
        const {emriProduktit, cmimi, sasia} = ProductData;
        const query = `INSERT INTO Produkt (emriProduktit, searchName, cmimi, sasia) VALUES (?, ?, ?, ?)`;
        const pool = getPool();
        const [result] = await pool.execute(query, [emriProduktit, emriProduktit.toLowerCase(), cmimi, sasia]);
        return result.insertId;
    }
    static async findById(produktID){
        const query = `SELECT produktID, emriProduktit, cmimi, sasia from Produkt WHERE produktID = ?`
        const pool = getPool();
        const [rows] = await pool.execute(query, [produktID]);
        return rows[0] || null;
    }
    static async egziston(ProductData){
        const {emriProduktit, cmimi, sasia} = ProductData;
        const query = `SELECT * FROM Produkt WHERE searchName = ?`;
        const pool = getPool();
        const [rows] = await pool.execute(query, [emriProduktit.toLowerCase()]);
        if(rows.length > 0){
            return true;
        } else {
            return false;
        }
    }
    static async getToday() {
        const pool = getPool();
        // Use MySQL's DATE() function to compare only the date part
        // This is more reliable and handles timezone issues better
        const query = `SELECT * FROM Produkt WHERE DATE(createdAt) = CURDATE()`;
        const [rows] = await pool.execute(query);
        return rows;
    }
}

export default Product;