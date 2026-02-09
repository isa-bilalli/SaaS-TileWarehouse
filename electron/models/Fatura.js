import { getPool } from "../db/db.js";

class Fatura{
    static async Create(FaturaData, connection = null){
        const {shumaPaguar, totaliPaZbritje, zbritja, puntoriID, klientiID} = FaturaData;
        const query = `INSERT INTO Fatura (shumaPaguar, totaliPaZbritje, zbritja, puntoriID, klientiID) VALUES (?, ?, ?, ?, ?)`;
        const pool = connection || getPool();
        const [result] = await pool.execute(query, [shumaPaguar, totaliPaZbritje, zbritja, puntoriID, klientiID]);
        return result.insertId;
    }
}

export default Fatura;