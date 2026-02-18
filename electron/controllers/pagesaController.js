import Pagesa from '../models/Pagesa.js'
import Fatura from '../models/Fatura.js';
import { getPool } from '../db/db.js';

export async function getPaymentsToday(){
    try{
        const rows = await Pagesa.getToday();
        return rows;
    }catch(err){
        throw new Error('Error getting today\'s payments: ' + err.message);
    }
}

export async function addPagesa(formData){
    const {shumaPaguar, faturaID} = formData;
    
    // Validate input
    if (!faturaID || !shumaPaguar || shumaPaguar <= 0) {
        throw new Error('Invalid payment data: faturaID and positive shumaPaguar are required');
    }

    const pool = getPool();
    const connection = await pool.getConnection();
    
    try {
        // Start transaction
        await connection.beginTransaction();

        // First, get current invoice to check debt
        const [invoiceRows] = await connection.execute(
            'SELECT borxhi, shumaPaguar FROM Fatura WHERE faturaID = ?',
            [faturaID]
        );

        if (invoiceRows.length === 0) {
            throw new Error('Invoice not found');
        }

        const currentDebt = parseFloat(invoiceRows[0].borxhi);
        const paymentAmount = parseFloat(shumaPaguar);

        // Validate payment doesn't exceed debt
        if (paymentAmount > currentDebt) {
            throw new Error(`Payment amount (${paymentAmount}) exceeds debt (${currentDebt})`);
        }

        // Update Fatura's shumaPaguar (this will automatically update borxhi via calculated column)
        await connection.execute(
            'UPDATE Fatura SET shumaPaguar = shumaPaguar + ? WHERE faturaID = ?',
            [paymentAmount, faturaID]
        );

        // Create payment record
        const pagesaID = await Pagesa.Create({shumaPaguar: paymentAmount, faturaID}, connection);

        // Commit transaction
        await connection.commit();
        
        return { success: true, pagesaID };
    } catch (error) {
        // Rollback transaction on error
        await connection.rollback();
        throw error;
    } finally {
        // Release connection
        connection.release();
    }
}

export async function searchPagesa(formData){
    try{
        const { searchParameter, date } = formData;
        const results = await Pagesa.searchPagesa({
            searchParameter: searchParameter || null,
            date: date || null
        });
        return results;
    }catch(err){
        throw new Error('Error searching payments: ' + err.message);
    }
}