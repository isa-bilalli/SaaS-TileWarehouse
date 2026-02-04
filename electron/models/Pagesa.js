import { getPool } from "../db/db.js";

class Pagesa{
    static async Create(PagesaData){
        const {shumaPaguar, faturaID} = PagesaData;
        const query = `INSERT INTO Pagesa (shumaPaguar, faturaID) VALUES (?, ?)`;
        const pool = getPool();
        const [result] = await pool.execute(query, [shumaPaguar, faturaID]);
        return result.insertId;
    }
}

export default Pagesa;