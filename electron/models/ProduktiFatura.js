import { getPool } from "../db/db.js";

class ProduktiFatura{
    static async Create(Data, connection = null){
        const {NrList, sasia, cmimiNjesi, cmimiTotal, njesiaMatese, produktID, faturaID} = Data;
        const query = `INSERT INTO ProduktiFatura (NrList, sasia, cmimiNjesi, cmimiTotal, njesiaMatese, produktID, faturaID) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const pool = connection || getPool();
        const [result] = await pool.execute(query, [NrList, sasia, cmimiNjesi, cmimiTotal, njesiaMatese, produktID, faturaID]);
        return result.insertId;
    }
    static async getProductsInvoice(faturaID){
        const query = `
            SELECT 
                pf.NrList as Nr,
                pf.produktID,
                p.emriProduktit,
                pf.njesiaMatese as NjesiaMatese,
                pf.sasia as SasiaProduktit,
                pf.cmimiNjesi,
                pf.cmimiTotal
            FROM ProduktiFatura pf
            INNER JOIN Produkt p ON pf.produktID = p.produktID
            WHERE pf.faturaID = ?
            ORDER BY pf.NrList ASC
        `;
        const pool = getPool();
        const [rows] = await pool.execute(query, [faturaID]);
        return rows;
    }
}

export default ProduktiFatura;