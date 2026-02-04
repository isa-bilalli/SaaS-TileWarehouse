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
}

export default Pllaka;