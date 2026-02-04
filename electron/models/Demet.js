import { getPool } from "../db/db.js";

class Demet{
    static async Create(DemeData){
        const {produktID, sasiaDemtuar, puntoriID} = DemeData;
        const query = `INSERT INTO Demet(produktID, sasiaDemtuar, puntoriID) VALUES (?, ?, ?)`;
        const pool = getPool();
        const [result] = await pool.execute(query, [produktID, sasiaDemtuar, puntoriID]);
        return result.insertId;
    }
}

export default Demet;