import { getPool } from '../db/db.js';

class Klienti{
    static async Create(KlientiData){
        const {emriMbiemri, telefoni} = KlientiData;
        const query = `INSERT INTO Klienti (emriMbiemri, telefoni) VALUES (?, ?)`
        const pool = getPool();
        const [result] = await pool.execute(query, [emriMbiemri,telefoni]);
        return result.insertId;
    }
    static async findById(klientiID){
        const query = `SELECT klientiID, emriMbiemri, telefoni FROM Klienti WHERE klientiID = ?`;
        const pool = getPool();
        const [rows] = await pool.execute(query,[klientiID]);
        return rows[0] || null;
    }
}

export default Klienti;