import Navbar from "../components/Navbar";
import {useState} from 'react';
import SelectDate from "../components/SelectDate";
import { getProductsInvoice, searchInvoices } from "../services/electronApi";

function SearchInvoice(){
    const [searchParameter,setSearchParamter] = useState('');
    const [date,setDate]= useState(null); // JSON object: {year, month?, day?} or null
    const [searchResult, setSearchResult] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modal, setModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState({});
    const [invoiceProducts, setInvoiceProducts] = useState([]);

    function handleChange(e){
        const value = e.target.value;
        setSearchParamter(value);
    }

    async function handleSubmit(e){
        e.preventDefault();        
        setIsSearching(true);
        setIsSubmitting(true);
        try {
            const formData = {
                searchParameter: searchParameter.trim() || null,
                date: date || null
            };
            const results = await searchInvoices(formData);
            setSearchResult(Array.isArray(results) ? results : []);
        } catch(err) {
            setSearchResult([]);
        } finally {
            setIsSearching(false);
            setIsSubmitting(false);
        }
    }

    async function handleInvoiceSelect(invoice){
        setSelectedInvoice(invoice)
        setModal(true);
        try{
            const res = await getProductsInvoice(invoice.faturaID);
            setInvoiceProducts(Array.isArray(res) ? res : [])
        }catch(err){
            setSelectedInvoice(null);
            setModal(false);
        }
    }

    function handleClose(){
        setModal(false);
        setSelectedInvoice({});
        setInvoiceProducts([]);
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
                    <p className="text-center text-gray-500 mt-4">Nuk u gjet asnje fakturë</p>
                ) : (
                    <div className="space-y-2">
                        {searchResult.map((invoice) => (
                            <div key={invoice.faturaID} className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:scale-101 active:scale-100 cursor-pointer" onClick={() => handleInvoiceSelect(invoice)}>
                                <p className="font-semibold">Fatura ID: {invoice.faturaID}</p>
                                <div className="flex flex-row justify-between">
                                    <div className="flex flex-col">
                                        <p className="text-sm text-gray-600 leading-3">Klienti: {invoice.klientiEmri || 'Anonim'}</p>
                                        <p className="text-sm text-gray-600 leading-4">Totali: {invoice.totali}€</p>
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="text-sm text-gray-600 leading-3">Borxhi: {invoice.borxhi}€</p>
                                        <p className="text-sm text-gray-600 leading-4">Data: {new Date(invoice.createdAt).toLocaleDateString('en-GB')}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {modal && (
                <div className="fixed top-0 left-0 w-full h-full bg-gray-100/90 flex justify-center items-center z-50">
                    <div className="flex flex-col bg-white p-2 rounded-xl w-160 items-center">
                        <p className="font-semibold text-2xl mb-2">Fatura ID: {selectedInvoice.faturaID}</p>
                        <div className="overflow-x-auto overflow-y-auto max-h-96 w-full mb-4">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-800 text-white">
                                        <th className="px-4 py-3 text-center font-semibold border-b border-gray-700">Nr.</th>
                                        <th className="px-4 py-3 text-center font-semibold border-b border-gray-700">ID</th>
                                        <th className="px-4 py-3 text-center font-semibold border-b border-gray-700">Emri i Produktit</th>
                                        <th className="px-4 py-3 text-center font-semibold border-b border-gray-700">Njesia Matëse</th>
                                        <th className="px-4 py-3 text-center font-semibold border-b border-gray-700">Sasia</th>
                                        <th className="px-4 py-3 text-center font-semibold border-b border-gray-700">Cmimi për Njësi</th>
                                        <th className="px-4 py-3 text-center font-semibold border-b border-gray-700">Cmimi Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoiceProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-3 text-center text-gray-500">Nuk ka produkte</td>
                                        </tr>
                                    ) : (
                                        invoiceProducts.map((item, index) => (
                                            <tr key={`${item.produktID}-${item.Nr}-${index}`} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                                <td className="px-4 py-3 text-center text-gray-700">{item.Nr}</td>
                                                <td className="px-4 py-3 text-center text-gray-600">{item.produktID}</td>
                                                <td className="px-4 py-3 text-center font-medium text-gray-800">{item.emriProduktit || 'N/A'}</td>
                                                <td className="px-4 py-3 text-center text-gray-600">{item.NjesiaMatese}</td>
                                                <td className="px-4 py-3 text-center text-gray-700">{item.SasiaProduktit}</td>
                                                <td className="px-4 py-3 text-center text-gray-700">{Number(item.cmimiNjesi || 0).toFixed(2)}€</td>
                                                <td className="px-4 py-3 text-center font-semibold text-gray-900">{Number(item.cmimiTotal || 0).toFixed(2)}€</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={handleClose} className="bg-gray-800 hover:scale-105 active:scale-95 text-white p-2 rounded-xl">Mbyll</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SearchInvoice;