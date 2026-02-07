import { getPool } from '../db/db.js';

class Pllaka{
    static async Create(PllakaData){
        const {produktID, gjatesia, gjeresia, pllakaNeKuti} = PllakaData;
        const gjatesiaM = gjatesia/100; //Gjatesia kthehet nga CM -> M
        const gjeresiaM = gjeresia/100;
        const query = `INSERT INTO Pllaka (produktID, gjatesia, gjeresia, pllakaNeKuti) VALUES (?, ?, ?, ?)`
        const pool = getPool();
        const [result] = await pool.execute(query, [produktID, gjatesiaM, gjeresiaM, pllakaNeKuti]);
        return produktID;
    }
    static async isTile(produktID){
        const query = `SELECT 1 FROM Pllaka WHERE produktID = ? LIMIT 1`;
        const pool = getPool();
        const [rows] = await pool.execute(query, [produktID]);
        return rows.length > 0
    }
    static async getTileData(produktID){
        const query = `SELECT gjatesia, gjeresia, pllakaNeKuti FROM Pllaka WHERE produktID = ?`
        const pool = getPool();
        const [rows] = await pool.execute(query,[produktID]);
        return rows[0] || null;
    }
    static async editTile(tileData){
        const {produktID, gjatesia, gjeresia, pllakaNeKuti} = tileData;
        const gjatesiaM = gjatesia/100; //KONVERTO NGA CM NE M
        const gjeresiaM= gjeresia/100;
        const query=`UPDATE Pllaka SET gjatesia = ?, gjeresia = ?, pllakaNeKuti = ? WHERE produktID = ?`
        const pool = getPool();
        const res = await pool.execute(query,[gjatesiaM, gjeresiaM,pllakaNeKuti,produktID]);
        return res;
    }
}

export default Pllaka;
