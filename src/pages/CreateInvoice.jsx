import Navbar from "../components/Navbar";
import InvoiceProductSelector from "../components/InvoiceProductSelector";
import { useAuth } from "../contexts/AuthContext";
import {useState, useEffect, useRef} from 'react';
import { addClient, searchClient, addInvoice } from "../services/electronApi";
import { generateInvoicePDF } from "../utils/printInvoice";
import InvoicePrintView from "../components/InvoicePrintView";

function CreateInvoice(){
    const {currentPuntori} = useAuth();
    const [searchParameter, setSearchParameter] = useState('')
    const [searchResults, setSearchResults] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [modal, setModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [debt, setDebt] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const debounceTimerRef = useRef(null);
    const isSelectingClientRef = useRef(false); // Track when we're programmatically selecting a client
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const [klienti, setKlienti] = useState({
        emriMbiemri:'',
        telefoni:''
    })

    const [faturaData, setFaturaData] = useState({
        puntoriID:currentPuntori.puntoriID,
        shumaPaguar:0,
        totaliPaZbritje:0,
        zbritja:0,
        totali:0,
        klientiID:null,
        products: []
    })
    
    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
                inputRef.current && !inputRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Debounced search
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

        // Skip search if we're programmatically selecting a client
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
        const value = e.target.value;
        setSearchParameter(value);
        setSelectedClient(null); // Clear selection when typing
        setFaturaData(prev => ({
            ...prev,
            klientiID: null
        }));
    }
    
    function handleClientSelect(client){
        isSelectingClientRef.current = true; // Mark that we're programmatically selecting
        setSelectedClient(client);
        setFaturaData(prev => ({
            ...prev,
            klientiID: client.klientiID
        }));
        setSearchParameter(client.emriMbiemri);
        setShowDropdown(false);
        setSearchResults([]);
    }

    function handleAddClientClick(){
        setModal(true);
        setSearchParameter('');
        setSelectedClient(null);
    }

    function handleClientChange(e){
        setKlienti({
            ...klienti,
            [e.target.name]:e.target.value
        })
    }

    async function handleSubmitClient(e){
        try{
            e.preventDefault();
            setIsSubmitting(true);
            setModalMessage(''); // Clear previous messages
            const res = await addClient(klienti);
            setModalMessage('Klienti u shtua me sukses!');
            // Refresh search if there's a search parameter
            if(searchParameter.trim().length >= 2){
                const result = await searchClient(searchParameter.trim());
                setSearchResults(Array.isArray(result) ? result : []);
            }
            setTimeout(() => {
                setModal(false);
                setModalMessage('');
                setIsSubmitting(false);
                setKlienti({emriMbiemri:'', telefoni:''});
            }, 2000);
        }catch(err){
            setModalMessage('Klienti nuk u shtua! Gabim: ' + (err.message || 'E panjohur'));
            setIsSubmitting(false);
        }
    }

    function handleDiscount(e){
        const value = Number(e.target.value) || 0;
        if(value > faturaData.totaliPaZbritje || value < 0){
            setErrorMsg('Vlera e zbritjes nuk pranohet!')
            return;
        }
        setFaturaData(prev =>({
            ...prev,
            zbritja: value,
            totali: prev.totaliPaZbritje - value
        }))
    }

    function handlePayment(e){  
        const payment = Number(e.target.value) ||0;
        if(payment < faturaData.totali){
            setDebt(true)
        }else {
            setDebt(false)
        }
        setFaturaData(prev=>({
            ...prev,
            shumaPaguar:payment
        }))
    }

    async function handleSubmit(){
        setIsSubmitting(true);

        if(!faturaData.products || faturaData.products.length === 0){
            setErrorMsg('Duhet të shtoni të paktën një produkt!');
            setIsSubmitting(false);
            return;
        }
        if(!faturaData.puntoriID){
            setErrorMsg('Puntori nuk është zgjedhur!');
            setIsSubmitting(false);
            return;
        }
        if(!faturaData.totaliPaZbritje || faturaData.totaliPaZbritje <= 0){
            setErrorMsg('Totali i fakturës duhet të jetë më i madh se 0!');
            setIsSubmitting(false);
            return;
        }
        if(faturaData.zbritja < 0){
            setErrorMsg('Zbritja nuk mund të jetë negative!');
            setIsSubmitting(false);
            return;
        }
        if(faturaData.zbritja > faturaData.totaliPaZbritje){
            setErrorMsg('Zbritja nuk mund të jetë më e madhe se totali!');
            setIsSubmitting(false);
            return;
        }
        if(faturaData.totali < 0){
            setErrorMsg('Totali final nuk mund të jetë negative!');
            setIsSubmitting(false);
            return;
        }
        if(faturaData.shumaPaguar < 0){
            setErrorMsg('Pagesa nuk mund të jetë negative!');
            setIsSubmitting(false);
            return;
        }
        if(faturaData.totali > faturaData.shumaPaguar && !faturaData.klientiID){
            setErrorMsg('Nuk mund të lëshosh faturë me borxh pa klient të regjistruar!');
            setIsSubmitting(false);
            return;
        }
        try{
            // Clean payload - only send necessary data to backend
            const cleanedPayload = {
                puntoriID: faturaData.puntoriID,
                shumaPaguar: faturaData.shumaPaguar,
                totaliPaZbritje: faturaData.totaliPaZbritje,
                zbritja: faturaData.zbritja,
                klientiID: faturaData.klientiID || null,
                products: faturaData.products.map(product => ({
                    Nr: product.Nr,
                    sasiaFatures: product.sasiaFatures,
                    cmimiNjesi: product.cmimiNjesi,
                    cmimiProdukt: product.cmimiProdukt,
                    NjesiaMatese: product.NjesiaMatese,
                    produktID: product.produktID
                }))
            };
            
            const res = await addInvoice(cleanedPayload);
            
            // Update faturaData with the actual invoice ID from the database
            if(res && res.success && res.faturaID){
                setFaturaData(prev => ({
                    ...prev,
                    faturaID: res.faturaID
                }));
            }
            
            setErrorMsg('Fatura u shtua me sukses!');
            setIsSubmitting(false);
        }catch(err){
            setErrorMsg(err.message || 'Gabim në shtimin e faturës. Provo përsëri.');
            setIsSubmitting(false);
        }
    }

    async function handlePrintInvoice(){
        if(!faturaData.products || faturaData.products.length === 0){
            setErrorMsg('Nuk ka produkte për të printuar!');
            return;
        }

        try {
            setErrorMsg('Duke krijuar PDF...');
            
            // Generate invoice ID: use actual ID if exists, otherwise use timestamp
            const invoiceId = faturaData.faturaID && faturaData.faturaID !== 'DRAFT' 
                ? faturaData.faturaID 
                : `TEMP-${Date.now()}`;
            
            // Prepare invoice data for printing
            const printData = {
                faturaID: invoiceId,
                klienti: selectedClient ? {
                    emriMbiemri: selectedClient.emriMbiemri,
                    telefoni: selectedClient.telefoni || ''
                } : null,
                products: faturaData.products,
                totaliPaZbritje: faturaData.totaliPaZbritje,
                zbritja: faturaData.zbritja,
                totali: faturaData.totali,
                shumaPaguar: faturaData.shumaPaguar,
                borxhi: faturaData.totali - faturaData.shumaPaguar
            };
            
            const filename = `Fatura-${invoiceId}-${new Date().toISOString().split('T')[0]}.pdf`;            
            const result = await generateInvoicePDF(printData, InvoicePrintView, filename, currentPuntori);
            
            if(result && result.success){
                setErrorMsg(`PDF u krijua me sukses!`);
            } else if(result && result.canceled){
                setErrorMsg('Ruajtja e PDF u anulua.');
            } else {
                setErrorMsg('PDF u krijua me sukses!');
            }
        } catch(err) {
            setErrorMsg(`Gabim në krijimin e PDF`);
        }
    }

    return(
        <div className="bg-gray-100 h-screen flex flex-col">
            <Navbar />
            <div className="bg-white m-5 rounded-xl flex flex-row items-center justify-between">
                <div className="ml-5 p-4">
                    <h2 className="font-semibold text-xl">Puntori:</h2>
                    <p className="font-semibold text-xl">{currentPuntori?.emriMbiemri}</p>
                </div>
                <div className="">
                    <h1 className="text-6xl font-semibold ml-33">Fakturë</h1>
                </div>
                <div className="text-center items-center flex flex-col mr-5 relative">
                    <label className="font-semibold mt-1">Kërko Klientin</label>
                    <div className="relative w-60">
                        <input 
                            ref={inputRef}
                            type="text" 
                            className="bg-gray-100 p-2 rounded-xl w-full mb-2 focus:outline-none focus:ring-2 focus:ring-gray-800" 
                            placeholder="Shkruaj emrin e klientit" 
                            value={searchParameter} 
                            onChange={handleChange}
                            onFocus={() => {
                                if(searchResults.length > 0 || isSearching){
                                    setShowDropdown(true);
                                }
                            }}
                        />
                        {selectedClient && (
                            <div className="text-xs text-gray-600 mb-1">
                                <span className="font-semibold">Zgjedhur:</span> {selectedClient.emriMbiemri} - {selectedClient.telefoni}
                            </div>
                        )}
                        {showDropdown && (searchResults.length > 0 || isSearching || (searchParameter.trim().length >= 2 && searchResults.length === 0)) && (
                            <div 
                                ref={dropdownRef}
                                className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto mt-1"
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
                    <button 
                        type="button" 
                        className="bg-gray-800 text-white w-40 mb-2 rounded-xl py-2 hover:scale-102 active:scale-95 cursor-pointer" 
                        onClick={handleAddClientClick}
                    >
                        + Shto klient të ri
                    </button>
                </div>
            </div>
            {modal && (
                <div className="fixed top-0 left-0 w-full h-full bg-gray-100/90 flex justify-center items-center z-50">
                    <form className="flex flex-col text-center bg-white rounded-xl h-62" onSubmit={handleSubmitClient}>
                        <h2 className="font-semibold text-lg py-2 px-8">Shto Klientin</h2>
                        <input type="text" placeholder="Emri i klientit te ri" className="bg-gray-100 p-2 m-2 rounded-lg" name="emriMbiemri" onChange={handleClientChange}></input>
                        <input type="text" placeholder="Numri i Telefonit" className="bg-gray-100 p-2 m-2 rounded-lg" name="telefoni" onChange={handleClientChange}></input>
                        <div>
                            <button type="button" onClick={()=> {
                                setModal(false);
                                setModalMessage('');
                                setKlienti({emriMbiemri:'', telefoni:''});
                            }} className="bg-gray-800 px-4 py-2 rounded-lg hover:scale-102 active:scale-95 text-white m-2 cursor-pointer">Anulo</button>
                            <button type="submit" className="bg-green-600 px-4 py-2 rounded-lg hover:scale-102 active:scale-95 text-white m-2 cursor-pointer" disabled={isSubmitting}>Shto</button>
                        </div>
                        <div className="min-h-7.5 flex items-center justify-center pb-3">
                            {modalMessage && (
                                <p className={`font-semibold ${modalMessage.includes('sukses') ? 'text-green-600' : 'text-red-600'}`}>{modalMessage}</p>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {/*INVOICE CREATOR*/}
            <InvoiceProductSelector onInvoiceItemsChange={(items) => {
                // Calculate total from the new items array (not from state)
                const total = items.reduce((sum, item) => sum + (Number(item.cmimiProdukt) || 0), 0);
                
                // If products array is empty, reset discount and payment
                if(items.length === 0){
                    setFaturaData(prev => ({
                        ...prev,
                        totaliPaZbritje: 0,
                        zbritja: 0,
                        totali: 0,
                        shumaPaguar: 0,
                        products: items
                    }));
                } else {
                    setFaturaData(prev => ({
                        ...prev,
                        totaliPaZbritje: total,
                        totali: total - (prev.zbritja || 0),
                        products: items
                    }));
                }
            }} />
            {/*INVOICE SUBMITTER SECTION */}
            <div className="bg-white h-40 mx-5 mb-5 rounded-xl flex flex-row justify-between">
                {/*MISC SECTION, PRINT BUTTON */}
                <div className="ml-10 flex items-center">
                    <button 
                        onClick={handlePrintInvoice} 
                        disabled={!faturaData.products || faturaData.products.length === 0}
                        className="bg-gray-800 text-white px-6 py-3 rounded-xl hover:bg-gray-800 cursor-pointer active:scale-95 transition-transform duration-100 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Printo Faturën
                    </button>
                </div>
                {/*CREATE INVOICE SECTION */}
                <div className="flex flex-col justify-center items-center ml-54">
                    <button onClick={handleSubmit} disabled={isSubmitting} className="bg-gray-800 text-white cursor-pointer px-8 py-6 rounded-xl hover:scale-102 active:scale-99 transition-transform duration-100 text-4xl">Shto Fakturën</button>
                    <div className="min-h-7.5 mt-1 flex items-center justify-center">
                        {errorMsg && (
                            <p className="font-semibold">{errorMsg}</p>
                        )}
                    </div>
                </div>
                {/*payment info section */}
                <div className="flex flex-col items-center justify-center mr-10">
                    <div className="flex flex-row items-center justify-center">
                        <div className="flex flex-col items-center justify-center">
                            <h2 className="text-lg">Totali i fakturës:</h2>
                            <p className="font-semibold">{(faturaData.totaliPaZbritje || 0).toFixed(2)}€</p>
                        </div>
                        <div className="flex flex-col items-center justify-center ml-8">
                            <h2 className="text-lg">Zbritje:</h2>
                            <input 
                                type="number" 
                                onChange={handleDiscount} 
                                value={faturaData?.zbritja || ''} 
                                className="bg-gray-100 rounded-xl w-20 px-2 text-center" 
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <div className="flex flex-row items-center justify-center">
                            <div className="flex flex-col items-center justify-center">
                                <h2 className="text-lg">Shuma Totale:</h2>
                                <p className="font-semibold">{(faturaData.totali || 0).toFixed(2)}€</p>
                            </div>
                            <div className="flex flex-col items-center justify-center ml-10">
                                <h2 className="text-lg">Paguar:</h2>
                                <input 
                                    type="number" 
                                    onChange={handlePayment} 
                                    value={faturaData.shumaPaguar || ''} 
                                    className="bg-gray-100 rounded-xl w-20 px-2 text-center" 
                                    min="0"
                                    step="0.01"
                                    max={faturaData.totali}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreateInvoice;