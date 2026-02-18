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
    static async searchPagesa(searchData){
        const { searchParameter, date } = searchData;
        const pool = getPool();
        
        let query = `
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
            WHERE 1=1
        `;
        const params = [];

        // Add date query if date object is provided
        if (date && date.year) {
            if (date.day && date.month) {
                // Full date: search for specific date
                query += ` AND DATE(p.createdAt) = ?`;
                const isoDate = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
                params.push(isoDate);
            } else if (date.month) {
                // Year + Month: search for all payments in that month
                query += ` AND YEAR(p.createdAt) = ? AND MONTH(p.createdAt) = ?`;
                params.push(date.year, date.month);
            } else {
                // Year only: search for all payments in that year
                query += ` AND YEAR(p.createdAt) = ?`;
                params.push(date.year);
            }
        }

        // Add client name search if searchParameter is provided
        if (searchParameter && searchParameter.trim().length > 0) {
            query += ` AND (k.emriMbiemri LIKE ? OR k.searchName LIKE ?)`;
            const searchTerm = `%${searchParameter.trim()}%`;
            params.push(searchTerm, searchTerm.toLowerCase());
        }

        query += ` ORDER BY p.createdAt DESC`;

        const [rows] = await pool.execute(query, params);
        return rows;
    }
}

export default Pagesa;