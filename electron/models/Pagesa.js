import { getPool } from "../db/db.js";

class Pagesa{
    static async Create(PagesaData, connection = null){
        const {shumaPaguar, faturaID} = PagesaData;
        const query = `INSERT INTO Pagesa (shumaPaguar, faturaID) VALUES (?, ?)`;
        const pool = connection || getPool();
        const [result] = await pool.execute(query, [shumaPaguar, faturaID]);
        return result.insertId;
    }
    
    static async getToday(){
        const query = `
            SELECT 
                p.pagesaID,
                p.shumaPaguar,
                p.createdAt,
                p.faturaID,
                f.klientiID,
                k.emriMbiemri as klientiEmri
            FROM Pagesa p
            INNER JOIN Fatura f ON p.faturaID = f.faturaID
            LEFT JOIN Klienti k ON f.klientiID = k.klientiID
            WHERE DATE(p.createdAt) = CURDATE()
            ORDER BY p.createdAt DESC
        `;
        const pool = getPool();
        const [rows] = await pool.execute(query);
        return rows;
    }
}

export default Pagesa;