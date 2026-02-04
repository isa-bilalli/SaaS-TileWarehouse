import { getPool } from '../db/db.js'

class Puntori{

    static async create(puntoriData){
        const {emriMbiemri} = puntoriData;
        const query = `INSERT INTO Puntori (emriMbiemri) VALUES (?)`
        const pool = getPool();
        const [result] = await pool.execute(query, [emriMbiemri]);
        return result.insertId;
    }
    static async findById(puntoriID){
        const query = `SELECT puntoriID, emriMbiemri FROM Puntori WHERE puntoriID = ?`;
        const pool = getPool();
        const [rows] = await pool.execute(query, [puntoriID]);
        return rows[0] || null;
    }
    static async getAll(){
        const query = `SELECT puntoriID, emriMbiemri FROM Puntori ORDER BY emriMbiemri`;
        const pool = getPool();
        const [rows] = await pool.execute(query);
        return rows;
    }
}

export default Puntori;