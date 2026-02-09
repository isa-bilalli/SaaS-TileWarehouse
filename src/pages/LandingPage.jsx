import EmployeeCard from "../components/EmployeeCard";
import {useState, useEffect} from 'react';
import { registerPuntori, getAllPuntor } from "../services/electronApi";

function LandingPage(){
    const [puntoret, setPuntoret] = useState([]);
    const [formData, setFormData] = useState({
        emriMbiemri:''
    });

    const [Error, setError] = useState('');

    useEffect(() => {
        loadPuntoret();
    }, []);

    async function loadPuntoret(){
        try{
            const data = await getAllPuntor();
            setPuntoret(data || []);
        }catch(err){
            console.error('Error loading Puntoret:', err);
            setError('Failed to load workers');
        }
    }

    function HandleChange(e){
        setError('');
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    async function HandleSubmit(e){
        e.preventDefault();
        if(!formData.emriMbiemri){
            setError('Shkruani emrin')
            return;
        }
        try{
            await registerPuntori(formData);
            setFormData({emriMbiemri:''});
            await loadPuntoret(); // Reload the list after adding
        }catch(err){
            setError(err.message || 'Nuk mund te krijohet!');
        }
    }
    return(
        <div className="flex justify-center items-center h-screen text-center text-white bg-gray-900">
            <div className="bg-gray-800 p-4 pr-10 pl-10 rounded-xl border border-white"> 
                <h1 className="mb-4 select-none"><span className="text-5xl leading-none font-bold">ARTA</span><br/><span className="text-2xl font-bold">COMMERCE</span></h1>
                {puntoret.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 select-none">Nuk ka puntore te regjistruar</div>
                ) : (
                    puntoret.map((puntori) => (
                        <EmployeeCard 
                            key={puntori.puntoriID} 
                            name={puntori.emriMbiemri} 
                            puntori={puntori}
                        />
                    ))
                )}
                <form className="mt-2 flex flex-col" onSubmit={HandleSubmit}>
                    <input type="text" name="emriMbiemri" value={formData.emriMbiemri} className="bg-gray-700 border p-3 rounded-xl border-white text-white" placeholder="Shkruaje emrin e puntorit!" onChange={HandleChange}></input>
                    <button type='submit' className="mt-4 p-1 bg-gray-700 font-bold text-xl rounded-xl border border-white hover:scale-102 transition-duration-500">Shto</button>
                    <h1 className="text-red-500 mt-2">{Error}</h1>
                </form>  
            </div>
        </div>
    )
}

export default LandingPage;