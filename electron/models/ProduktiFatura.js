import { getPool } from "../db/db.js";

class ProduktiFatura{
    static async Create(Data, connection = null){
        const {NrList, sasia, cmimiNjesi, cmimiTotal, njesiaMatese, produktID, faturaID} = Data;
        const query = `INSERT INTO ProduktiFatura (NrList, sasia, cmimiNjesi, cmimiTotal, njesiaMatese, produktID, faturaID) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const pool = connection || getPool();
        const [result] = await pool.execute(query, [NrList, sasia, cmimiNjesi, cmimiTotal, njesiaMatese, produktID, faturaID]);
        return result.insertId;
    }
}

export default ProduktiFatura;