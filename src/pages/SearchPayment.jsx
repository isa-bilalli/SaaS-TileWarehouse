import Navbar from "../components/Navbar";
import {useState} from 'react';
import SelectDate from "../components/SelectDate";
import { searchPagesa } from "../services/electronApi";

function SearchPayment(){
    const [searchParameter, setSearchParameter] = useState('');
    const [date,setDate] = useState(null)
    const [searchResult,setSearchResult] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    function handleChange(e){
        const  val = e.target.value
        setSearchParameter(val);
    }

    async function handleSubmit(e){
        e.preventDefault();
        setIsSearching(true);
        setIsSubmitting(true);
        try{
            const formData={
                searchParameter: searchParameter.trim() || null,
                date: date || null
            };
            const rows = await searchPagesa(formData);
            setSearchResult(Array.isArray(rows) ? rows : []);
        }catch(err){
            setSearchResult([])
        }finally{
            setIsSearching(false);
            setIsSubmitting(false);
        }
    }


    return(
        <div className="bg-gray-100 h-screen flex flex-col">
            <Navbar />
            <form className="bg-white m-5 rounded-xl p-3 flex flex-col items-center" onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    className="bg-gray-100 p-2 rounded-xl w-full" 
                    placeholder="Shkruaj emrin e klientit" 
                    value={searchParameter}
                    onChange={handleChange}
                />
                <SelectDate onDateChange={setDate} />
                <button type="submit" className="bg-gray-800 text-white p-2 w-20 mt-3 rounded-xl hover:scale-105 active:scale-95" disabled={isSubmitting}>Kerko</button>
            </form>
            {/*Result section*/}
            <div className="bg-white ml-5 mr-5 mb-5 flex-1 rounded-xl p-3 overflow-auto">
                {isSearching ? (
                    <p className="text-center text-gray-500 mt-4">Duke kërkuar...</p>
                ) : searchResult.length === 0 ? (
                    <p className="text-center text-gray-500 mt-4">Nuk u gjet asnjë pagesë</p>
                ) : (
                    <div className="space-y-2">
                        {searchResult.map((payment) => (
                            <div key={payment.pagesaID} className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                <p className="font-semibold text-gray-800">Pagesa ID: {payment.pagesaID}</p>
                                <div className="flex flex-row justify-between mt-2">
                                    <div className="flex flex-col">
                                        <p className="text-sm text-gray-600 leading-3">Klienti: {payment.klientiEmri || 'Anonim'}</p>
                                        <p className="text-sm text-gray-600 leading-4">Fatura ID: {payment.faturaID}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="text-sm font-semibold text-green-600 leading-3">Shuma: {parseFloat(payment.shumaPaguar).toFixed(2)} €</p>
                                        <p className="text-sm text-gray-600 leading-4">
                                            {new Date(payment.createdAt).toLocaleString('sq-AL', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default SearchPayment;