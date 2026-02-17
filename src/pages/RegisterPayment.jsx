import Navbar from '../components/Navbar.jsx';
import {useState, useEffect, useRef} from 'react'
import { getInvoicesWithDebtByID, searchClient, addPayment, getPaymentsToday } from '../services/electronApi.js';

function RegisterPayment(){
    const [searchParameter, setSearchParameter] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [payments, setPayments] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState({
        faturaID:null,
        borxhi:0 
    });
    const [paymentData, setPaymentData] = useState({
        shumaPaguar:0,
        faturaID:null
    })

    const dropdownRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const inputRef = useRef(null);
    const isSelectingClientRef = useRef(false);

    useEffect(() => {
        async function fetchPayments(){
            try{
                const rows = await getPaymentsToday();
                setPayments(rows);
            }catch(err){
                console.error('Error fetching payments:', err);
                setPayments([]);
            }
        }
        fetchPayments();
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (showDropdown && 
                dropdownRef.current && !dropdownRef.current.contains(event.target) && 
                inputRef.current && !inputRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    useEffect(() => {
            if(debounceTimerRef.current){
                clearTimeout(debounceTimerRef.current);
            }
    
            if(searchParameter.trim().length === 0){
                setSearchResults([]);
                setIsSearching(false);
                setShowDropdown(false);
                return;
            }
            if(isSelectingClientRef.current){
                isSelectingClientRef.current = false;
                return;
            }
    
            if(searchParameter.trim().length < 2){
                setSearchResults([]);
                setIsSearching(false);
                setShowDropdown(false);
                return;
            }
    
            setIsSearching(true);
            setShowDropdown(true);
    
            debounceTimerRef.current = setTimeout(async () => {
                try{
                    const result = await searchClient(searchParameter.trim());
                    setSearchResults(Array.isArray(result) ? result : []);
                }catch(err){
                    setSearchResults([]);
                }finally{
                    setIsSearching(false);
                }
            }, 400);
    
            return () => {
                if(debounceTimerRef.current){
                    clearTimeout(debounceTimerRef.current);
                }
            };
        }, [searchParameter]);


    function handleChange(e){
        setSearchParameter(e.target.value)
        setSelectedClient(null);
        setSelectedInvoice({
            faturaID:null,
            borxhi:0 
        });
        setPaymentData({
            shumaPaguar:0,
            faturaID:null
        })
        setErrorMessage('')
    }

    async function handleClientSelect(client){
        isSelectingClientRef.current = true;
        setSelectedClient(client);
        setSearchParameter(client.emriMbiemri);
        setShowDropdown(false);
        setSearchResults([]);
        const res = await getInvoicesWithDebtByID(client.klientiID);
        setInvoices(res);
        // Reset selected invoice when client changes
        setSelectedInvoice({
            faturaID: null,
            borxhi: 0
        });
    }

    function handleInvoiceChange(e){
        const selectedFaturaID = parseInt(e.target.value);
        if(selectedFaturaID){
            const invoice = invoices.find(inv => inv.faturaID === selectedFaturaID);
            if(invoice){
                setSelectedInvoice({
                    faturaID: invoice.faturaID,
                    borxhi: invoice.borxhi
                });
                setPaymentData({
                ...paymentData,
                faturaID:invoice.faturaID
                })
            }
        } else {
            setSelectedInvoice({
                faturaID: null,
                borxhi: 0
            });
            setPaymentData({
                shumaPaguar:0,
                faturaID:null
            })
        }
    }

    function handleValueChange(e){
        setPaymentData({
            ...paymentData,
            [e.target.name]:e.target.value
        })
    }

    async function handleSubmit(e){
        e.preventDefault();
        
        // Validate payment data
        if (!paymentData.faturaID || !paymentData.shumaPaguar || parseFloat(paymentData.shumaPaguar) <= 0) {
            setErrorMessage('Ju lutem plotesoni te gjitha fushat!');
            return;
        }
        if(paymentData.shumaPaguar > selectedInvoice.borxhi){
            setErrorMessage('Nuk mund te paguash me shume se borxhin aktual!');
            return;
        }
        try{
            const res = await addPayment(paymentData);
            setErrorMessage('Pagesa u shtua me sukses!');
            
            // Reset form on success
            setPaymentData({
                shumaPaguar:0,
                faturaID:null
            });
            setSelectedInvoice({
                faturaID: null,
                borxhi: 0
            });
            setSelectedClient(null);
            setSearchParameter('');
            
            // Refresh invoices to show updated debt
            if (selectedClient?.klientiID) {
                const res = await getInvoicesWithDebtByID(selectedClient.klientiID);
                setInvoices(res);
            }
            
            // Refresh payments list
            const updatedPayments = await getPaymentsToday();
            setPayments(updatedPayments);
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                setErrorMessage('');
            }, 3000);
        }catch(err){
            setErrorMessage(err.message || 'Error duke shtuar pagesen!');
            // Clear error message after 5 seconds
            setTimeout(() => {
                setErrorMessage('');
            }, 5000);
        }
    }
    return(
        <div className='bg-gray-100 h-screen flex flex-col'>
            <Navbar />
            <form className='bg-white m-5 p-2 rounded-lg flex flex-row items-center justify-between' onSubmit={handleSubmit}>
                <div className='flex flex-row'>
                    {/*EMRI INPUT */}
                    <div className='pl-2'>
                        <p className='pl-2'>Emri i Klientit:</p>
                        <input 
                                    ref={inputRef}
                                    type="text" 
                                    className="bg-gray-100 p-2 rounded-xl w-full mb-2 focus:outline-none focus:ring-2 focus:ring-gray-800" 
                                    placeholder="Shkruaj emrin e klientit" 
                                    value={searchParameter} 
                                    onChange={handleChange}
                        />
                        {showDropdown && (searchResults.length > 0 || isSearching || (searchParameter.trim().length >= 2 && searchResults.length === 0)) && (
                                <div 
                                    ref={dropdownRef}
                                    className="absolute z-50 w-49 pl-0.5 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto mt-1"
                                >
                                    {isSearching ? (
                                        <div className="p-3 text-center text-gray-500">Duke kërkuar...</div>
                                    ) : searchResults.length === 0 ? (
                                        <div className="p-3 text-center text-gray-500">Nuk u gjet asnjë klient</div>
                                    ) : (
                                        <ul className="py-1">
                                            {searchResults.map((client) => (
                                                <li 
                                                    key={client.klientiID}
                                                    onClick={() => handleClientSelect(client)}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                                                >
                                                    <div className="font-medium">{client.emriMbiemri}</div>
                                                    <div className="text-sm text-gray-600">{client.telefoni}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                    </div>
                    {/*FATURA CHOICE */}
                    <div className='ml-5 pt-6'>
                        {selectedClient?.klientiID && (
                            <div className=''>
                                <select 
                                    className='bg-gray-100 p-2 rounded-xl'
                                    value={selectedInvoice.faturaID || ""}
                                    onChange={handleInvoiceChange}
                                >
                                    <option value="">Zgjidh Faturen</option>
                                    {invoices.map((invoice) =>(
                                        <option key={invoice.faturaID} value={invoice.faturaID}>
                                            Fatura ID: {invoice.faturaID} - Borxhi: {parseFloat(invoice.borxhi).toFixed(2)} €
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    {/*BORXHI AKTUAL, PAGESA INPUT */}
                    <div className='ml-5 '>
                        {selectedInvoice?.faturaID && (
                            <div className='text-center'>
                                <p>Shuma e Paguar:</p>
                                <input 
                                    type='number' 
                                    step="0.01"
                                    min="0"
                                    className="bg-gray-100 p-2 rounded-xl w-18 mb-2 focus:outline-none focus:ring-2 focus:ring-gray-800" 
                                    placeholder="0.00" 
                                    value={paymentData.shumaPaguar || ''}
                                    onChange={handleValueChange} 
                                    name='shumaPaguar'
                                /> €
                            </div>
                        )}
                    </div>
                    <p className='m-5 font-semibold pt-2'>{errorMessage}</p>
                </div>
                <button type='submit' className='bg-gray-800 text-white px-4 py-2 mr-2 rounded-lg hover:scale-105 active:scale-95 transition-transform duration-150'>Shto</button>
            </form>
            {/*REGISTERED PAYMENTS FOR TODAY SECTION */}
            <div className='bg-white flex-1 mb-5 mx-5 rounded-lg p-4 overflow-auto'>
                <h2 className='text-xl font-semibold mb-4 text-center'>Pagesat e Sotme</h2>
                {payments.length === 0 ? (
                    <p className="text-center text-gray-500 mt-4">Nuk ka pagesa sot</p>
                ) : (
                    <div className="space-y-2">
                        {payments.map((payment) => (
                            <div key={payment.pagesaID} className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                <p className="font-semibold text-gray-800">Pagesa ID: {payment.pagesaID}</p>
                                <div className="flex flex-row justify-between mt-2">
                                    <div className="flex flex-col">
                                        <p className="text-sm text-gray-600">Klienti: {payment.klientiEmri || 'Anonim'}</p>
                                        <p className="text-sm text-gray-600">Fatura ID: {payment.faturaID}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="text-sm font-semibold text-green-600">Shuma: {parseFloat(payment.shumaPaguar).toFixed(2)} €</p>
                                        <p className="text-sm text-gray-600">
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

export default RegisterPayment;