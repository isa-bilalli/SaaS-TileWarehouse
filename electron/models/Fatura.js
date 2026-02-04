import { getPool } from "../db/db.js";

class Fatura{
    static async Create(FaturaData){
        const {shumaPaguar, totali, klientiID} = FaturaData;
        const query = `INSERT INTO Fatura (shumaPaguar, totali, klientiID) VALUES (?, ?, ?)`;
        const pool = getPool();
        const [result] = await pool.execute(query, [shumaPaguar, totali, klientiID]);
        return result.insertId;
    }
}

export default Fatura;