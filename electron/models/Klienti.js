import { getPool } from '../db/db.js';

class Klienti{
    static async Create(KlientiData){
        const {emriMbiemri, telefoni} = KlientiData;
        const query = `INSERT INTO Klienti (emriMbiemri,searchName, telefoni) VALUES (?, ?, ?)`
        const pool = getPool();
        const [result] = await pool.execute(query, [emriMbiemri, emriMbiemri.toLowerCase(), telefoni]);
        return result.insertId;
    }
    static async findById(klientiID){
        const query = `SELECT klientiID, emriMbiemri, telefoni FROM Klienti WHERE klientiID = ?`;
        const pool = getPool();
        const [rows] = await pool.execute(query,[klientiID]);
        return rows[0] || null;
    }
    static async searchClient(data){
        if(!data || typeof data !== 'string' || data.trim().length === 0){
            return [];
        }
        const query = `SELECT * FROM Klienti WHERE emriMbiemri LIKE ? OR searchName LIKE ?`
        const pool = getPool();
        const search = `%${data}%`;
        const searchLower = `%${data.toLowerCase()}%`;
        const [rows] = await pool.execute(query, [search, searchLower]);
        return rows; 
    }
}

export default Klienti;