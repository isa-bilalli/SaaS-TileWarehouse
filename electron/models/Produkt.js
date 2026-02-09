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
        const query = `SELECT * FROM Produkt WHERE DATE(createdAt) = CURDATE()`;
        const [rows] = await pool.execute(query);
        return rows;
    }
    static async searchProduct(data){
        if(!data || typeof data !== 'string' || data.trim().length === 0){
            return [];
        }
        const query = `SELECT * FROM Produkt WHERE emriProduktit LIKE ? OR searchName LIKE ?`;
        const pool = getPool();
        const search = `%${data}%`;
        const searchLower = `%${data.toLowerCase()}%`;
        const [rows] = await pool.execute(query, [search, searchLower]);
        return rows;        
    }
    static async deleteProduct(data){
        const query = `DELETE FROM Produkt WHERE produktID = ?`;
        const pool = getPool();
        const [res] = await pool.execute(query, [data]);
        return res;
    }
    static async editProduct(formData){
        const { produktID, emriProduktit, cmimi, sasia} = formData;
        if(emriProduktit === undefined || emriProduktit === null){
            throw new Error('emriProduktit is required');
        }
        if(typeof emriProduktit !== 'string'){
            throw new Error(`emriProduktit must be a string, got ${typeof emriProduktit}`);
        }
        if(emriProduktit.trim() === ''){
            throw new Error('emriProduktit cannot be empty');
        }
        const query = `UPDATE Produkt SET emriProduktit = ?, searchName = ?, cmimi = ?, sasia = ? WHERE produktID = ?`
        const pool = getPool();
        const res = await pool.execute(query,[emriProduktit, emriProduktit.toLowerCase(), cmimi, sasia, produktID])
        return res;
    }
    static async reduceStock(produktID, quantity, connection = null){
        const query = `UPDATE Produkt SET sasia = sasia - ? WHERE produktID = ? AND sasia >= ?`;
        const pool = connection || getPool();
        const [result] = await pool.execute(query, [quantity, produktID, quantity]);
        if(result.affectedRows === 0){
            throw new Error(`Insufficient stock for product ${produktID}`);
        }
        return result;
    }
}

export default Product;