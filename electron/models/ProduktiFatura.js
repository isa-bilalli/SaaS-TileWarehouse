import { getPool } from "../db/db.js";

class ProduktiFatura{
    static async Create(Data){
        const {sasia, cmimiPer, produktID, faturaID} = Data;
        const query = `INSERT INTO ProduktiFatura (sasia, cmimiPer, produktID, faturaID) VALUES (?, ?, ?, ?)`;
        const pool = getPool();
        const [result] = await pool.execute(query, [sasia, cmimiPer, produktID, faturaID]);
        return result.insertId;
    }
}

export default ProduktiFatura;