import { getPool } from "../db/db.js";

class Fatura{
    static async Create(FaturaData, connection = null){
        const {shumaPaguar, totaliPaZbritje, zbritja, puntoriID, klientiID} = FaturaData;
        const query = `INSERT INTO Fatura (shumaPaguar, totaliPaZbritje, zbritja, puntoriID, klientiID) VALUES (?, ?, ?, ?, ?)`;
        const pool = connection || getPool();
        const [result] = await pool.execute(query, [shumaPaguar, totaliPaZbritje, zbritja, puntoriID, klientiID]);
        return result.insertId;
    }
    static async searchInvoices(searchData) {
        const { searchParameter, date } = searchData;
        const pool = getPool();
        
        let query = `
            SELECT f.*, k.emriMbiemri as klientiEmri, p.emriMbiemri as puntoriEmri
            FROM Fatura f
            LEFT JOIN Klienti k ON f.klientiID = k.klientiID
            LEFT JOIN Puntori p ON f.puntoriID = p.puntoriID
            WHERE 1=1
        `;
        const params = [];

        // Add date query if date object is provided
        if (date && date.year) {
            if (date.day && date.month) {
                // Full date: search for specific date
                query += ` AND DATE(f.createdAt) = ?`;
                const isoDate = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
                params.push(isoDate);
            } else if (date.month) {
                // Year + Month: search for all invoices in that month
                query += ` AND YEAR(f.createdAt) = ? AND MONTH(f.createdAt) = ?`;
                params.push(date.year, date.month);
            } else {
                // Year only: search for all invoices in that year
                query += ` AND YEAR(f.createdAt) = ?`;
                params.push(date.year);
            }
        }

        // Add client name search if searchParameter is provided
        if (searchParameter && searchParameter.trim().length > 0) {
            query += ` AND (k.emriMbiemri LIKE ? OR k.searchName LIKE ?)`;
            const searchTerm = `%${searchParameter.trim()}%`;
            params.push(searchTerm, searchTerm.toLowerCase());
        }

        query += ` ORDER BY f.createdAt DESC`;

        const [rows] = await pool.execute(query, params);
        return rows;
    }
    static async getDashboardData(){
        const query = `
            SELECT 
                (SELECT COUNT(*) FROM Fatura WHERE DATE(createdAt) = CURDATE()) AS faturaTeLeshuara,
                (SELECT COALESCE(SUM(totali), 0) FROM Fatura WHERE DATE(createdAt) = CURDATE()) AS shumaFaturuar,
                (
                    -- All payments made today (from Pagesa table) - covers payments for any invoice
                    SELECT COALESCE(SUM(shumaPaguar), 0) 
                    FROM Pagesa 
                    WHERE DATE(createdAt) = CURDATE()
                ) + (
                    -- Initial payments from invoices created today that haven't been recorded in Pagesa
                    -- This is the shumaPaguar that was set at invoice creation
                    -- We calculate it as: current shumaPaguar minus all Pagesa payments made today for those invoices
                    -- This ensures we only count the initial payment, not payments already counted above
                    SELECT COALESCE(SUM(
                        GREATEST(0, f.shumaPaguar - COALESCE((
                            SELECT SUM(p.shumaPaguar) 
                            FROM Pagesa p 
                            WHERE p.faturaID = f.faturaID 
                            AND DATE(p.createdAt) = CURDATE()
                        ), 0))
                    ), 0)
                    FROM Fatura f
                    WHERE DATE(f.createdAt) = CURDATE()
                    AND f.shumaPaguar > 0
                ) AS qarkullimiDitor
        `;
        const pool = getPool();
        const [rows] = await pool.execute(query);
        // Return the first row as an object
        return rows[0] || {
            faturaTeLeshuara: 0,
            shumaFaturuar: 0,
            qarkullimiDitor: 0
        };
    }
    static async getInvoicesWithDebtByID(klientiID){
        const query = `SELECT faturaID, borxhi FROM Fatura where klientiID = ? AND borxhi > 0 ORDER BY createdAt DESC`
        const pool = getPool();
        const [rows] = await pool.execute(query, [klientiID]);
        return rows;
    }
    static async updateTotal(formData){
        const {shumaPaguar, faturaID} = formData;
        const query = `UPDATE Fatura SET shumaPaguar = shumaPaguar + ? WHERE faturaID = ?;`
        const pool = getPool();
        const res = await pool.execute(query, [shumaPaguar,faturaID]);
        return res;
    }
}

export default Fatura;