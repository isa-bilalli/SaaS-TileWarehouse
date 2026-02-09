import {useState, useEffect, useRef} from 'react';
import { searchProduct, isTile as isTileAPI, getTileData } from '../services/electronApi';
import Cancel from '../assets/Cancel.svg'

function InvoiceProductSelector({ onInvoiceItemsChange }){
    const [addModal, setAddModal] = useState(false);
    const [searchParameter, setSearchParameter] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [dropdown, setDropdown] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [isTile, setIsTile] = useState(false);
    const [cmimiTotalProdukt, setCmimiTotalProdukt] = useState(0);
    const [clientStock, setClientStock] = useState(0);
    const [siperfaqjaTotale,setSiperfaqjaTotale]= useState(0);
    const [boxes, setBoxes] = useState(null);
    const [cmimiKatror, setCmimiKatror] = useState(0);
    const [NrInvoice, setNrInvoice] = useState(1); // The NR Column in the invoice to signify which item was added first
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalMessage, setModalMessage] = useState('');


    const [tileData, setTileData] = useState({
        gjatesia:0,
        gjeresia:0,
        pllakaNeKuti:0
    })

    const [invoiceItems, setInvoiceItems] = useState([

    ]);

    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const isSelectingRef = useRef(false);
    const shouldNotifyParentRef = useRef(false);

    useEffect(() => {
            function handleClickOutside(event) {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
                    inputRef.current && !inputRef.current.contains(event.target)) {
                    setDropdown(false);
                }
            }
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, []);

    // Notify parent when invoiceItems changes (but only when we intentionally update it)
    useEffect(() => {
        if(shouldNotifyParentRef.current && onInvoiceItemsChange){
            onInvoiceItemsChange(invoiceItems);
            shouldNotifyParentRef.current = false;
        }
    }, [invoiceItems, onInvoiceItemsChange]);
    
    // Debounced search
    useEffect(() => {
        if(isSelectingRef.current){
            isSelectingRef.current = false;
            return;
        }
        if(debounceTimerRef.current){
            clearTimeout(debounceTimerRef.current);
        }    
        if(searchParameter.trim().length === 0){
            setSearchResult([]);
            setIsSearching(false);
            setDropdown(false);
            return;
        }
        if(searchParameter.trim().length < 2){
            setSearchResult([]);
            setIsSearching(false);
            setDropdown(false);
            return;
        }
        setIsSearching(true);
        setDropdown(true);
        debounceTimerRef.current = setTimeout(async () => {
            try{
                const result = await searchProduct(searchParameter.trim());
                setSearchResult(Array.isArray(result) ? result : []);
            }catch(err){
                console.error('Search error:', err);
                setSearchResult([]);
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

    function addToInvoice(e){
        e.preventDefault();
        
        // Clear any previous messages
        setModalMessage('');
        
        // Validation: Check if product is selected
        if(!selectedProduct){
            setModalMessage('Ju lutem zgjidhni një produkt');
            setIsSubmitting(false);
            return;
        }

        // Validation: Check if price per unit is valid
        if(!selectedProduct.cmimi || selectedProduct.cmimi <= 0){
            setModalMessage('Cmimi për njësi duhet të jetë më i madh se 0');
            setIsSubmitting(false);
            return;
        }

        // Validation: Check total price
        if(!cmimiTotalProdukt || cmimiTotalProdukt <= 0){
            setModalMessage('Cmimi total duhet të jetë më i madh se 0');
            setIsSubmitting(false);
            return;
        }

        // Validation for tiles: Check if boxes are selected
        if(isTile){
            if(!boxes || boxes <= 0){
                setModalMessage('Ju lutem specifikoni numrin e kutive');
                setIsSubmitting(false);
                return;
            }
            if(boxes > selectedProduct.sasia){
                setModalMessage(`Numri i kutive nuk mund të jetë më i madh se sasia e disponueshme (${selectedProduct.sasia})`);
                setIsSubmitting(false);
                return;
            }
        }
        // Validation for normal products: Check if quantity is selected
        else {
            if(!clientStock || clientStock <= 0){
                setModalMessage('Ju lutem specifikoni sasinë');
                setIsSubmitting(false);
                return;
            }
            if(clientStock > selectedProduct.sasia){
                setModalMessage(`Sasia nuk mund të jetë më e madhe se sasia e disponueshme (${selectedProduct.sasia})`);
                setIsSubmitting(false);
                return;
            }
        }

        setIsSubmitting(true);
        const nr = NrInvoice;
        setNrInvoice(NrInvoice + 1);

        const baseData = {
            Nr: nr,
            produktID: selectedProduct.produktID,
            emriProduktit: selectedProduct.emriProduktit,
            cmimiNjesi: selectedProduct.cmimi,
            cmimiProdukt: cmimiTotalProdukt,
            sasiaProduktit:selectedProduct.sasia
        };
        let newItem;

        if(isTile){
            newItem = {
                ...baseData,
                NjesiaMatese: 'Kuti',
                sasiaFatures: boxes
            }
        } else {
            newItem = {
                ...baseData,
                NjesiaMatese: 'Copë',
                sasiaFatures: clientStock
            }
        }
        
        setInvoiceItems(prev => {
            const updatedItems = [...prev, newItem];
            // Mark that we should notify parent after state update
            shouldNotifyParentRef.current = true;
            return updatedItems;
        });
        setModalMessage(''); // Clear message on success
        setAddModal(false);
        setSearchParameter('');
        setClientStock(0);
        setCmimiTotalProdukt(0);
        setSelectedProduct(null);
        setSiperfaqjaTotale(0);
        setBoxes(null);
        setCmimiKatror(0);
        setIsSubmitting(false);
    }

    
    function handleChange(e){
        const value = e.target.value;
        setSearchParameter(value);
    }

    async function handleProductSelect(product){
        isSelectingRef.current = true;
        setModalMessage(''); // Clear any previous error messages
        setSelectedProduct(product);
        const res = await isTileAPI(product.produktID)
        setIsTile(res)
        if(res){
            const {gjatesia, gjeresia, pllakaNeKuti} = await getTileData(product.produktID);
            setTileData({
                gjatesia:gjatesia,
                gjeresia:gjeresia,
                pllakaNeKuti:pllakaNeKuti
            })
            // Calculate coverage area using the fetched data directly
            const siperfaqja = gjatesia * gjeresia;
            const total = siperfaqja * pllakaNeKuti;
            setSiperfaqjaTotale(total);
        }
        setDropdown(false);
        setSearchParameter(product.emriProduktit);
        setSearchResult([]);
        setClientStock(0);
        setCmimiTotalProdukt(0);
        setBoxes(null);
        setCmimiKatror(0);
        if(!res){
            setSiperfaqjaTotale(0);
        }
    }

    function handleCancel(){
        isSelectingRef.current=true;
        setModalMessage(''); // Clear message on cancel
        setAddModal(false);
        setSearchParameter('');
        setClientStock(0);
        setCmimiTotalProdukt(0);
        setSelectedProduct(null);
        setSiperfaqjaTotale(0);
        setBoxes(null);
        setCmimiKatror(0);
    }

    function handleClientStock(e) {
        const bought = Number(e.target.value) || 0;
        setClientStock(bought);
        const cmimi = selectedProduct?.cmimi || 0;
        const total = Math.round(bought * cmimi * 100) / 100;
        setCmimiTotalProdukt(total);
    }

    function handleChangePrice(e){
        const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
        setSelectedProduct({
            ...selectedProduct,
            [e.target.name]: value
        });
        const bought = clientStock || 0;
        const cmimi = Number(value) || 0;
        const total = Math.round(bought * cmimi * 100) / 100;
        setCmimiTotalProdukt(total);
    }

    function handleTileStock(e){
        const bought = Number(e.target.value) || 0;
        setClientStock(bought);
        if(siperfaqjaTotale > 0 && selectedProduct?.sasia){
            const calculatedBoxes = Math.ceil(bought / siperfaqjaTotale);
            const finalBoxes = calculatedBoxes > selectedProduct.sasia ? selectedProduct.sasia : calculatedBoxes;
            setBoxes(finalBoxes);
            // Recalculate prices when boxes change
            if(finalBoxes > 0 && selectedProduct?.cmimi){
                const total = Math.round(finalBoxes * selectedProduct.cmimi * 100) / 100;
                setCmimiTotalProdukt(total);
                const totalArea = siperfaqjaTotale * finalBoxes;
                if(totalArea > 0){
                    const pricePerM2 = Math.round(total / totalArea * 100) / 100;
                    setCmimiKatror(pricePerM2);
                }
            }
        }
    }

    function handleBoxChange(e){
        const value = Number(e.target.value) || 0;
        const maxBoxes = selectedProduct?.sasia || 0;
        const finalValue = value > maxBoxes ? maxBoxes : value;
        setBoxes(finalValue);
        // Recalculate prices when boxes change
        if(finalValue > 0 && selectedProduct?.cmimi && siperfaqjaTotale > 0){
            const total = Math.round(finalValue * selectedProduct.cmimi * 100) / 100;
            setCmimiTotalProdukt(total);
            const totalArea = siperfaqjaTotale * finalValue;
            if(totalArea > 0){
                const pricePerM2 = Math.round(total / totalArea * 100) / 100;
                setCmimiKatror(pricePerM2);
            }
        }
    }

    function handlePrice(){
        if(!boxes || !selectedProduct?.cmimi || siperfaqjaTotale <= 0) return;
        const total = Math.round(boxes * selectedProduct.cmimi * 100) / 100;
        setCmimiTotalProdukt(total);
        const totalArea = siperfaqjaTotale * boxes;
        if(totalArea > 0){
            const finalTotal = Math.round(total/totalArea * 100) /100
            setCmimiKatror(finalTotal);
        }
    }

    function handlePricePerBoxChange(e){
        const value = Number(e.target.value) || 0;
        setSelectedProduct({
            ...selectedProduct,
            cmimi: value
        });
        // Recalculate total and price per m²
        if(boxes && value > 0){
            const total = Math.round(boxes * value * 100) / 100;
            setCmimiTotalProdukt(total);
            const totalArea = siperfaqjaTotale * boxes;
            if(totalArea > 0){
                const pricePerM2 = Math.round(total / totalArea * 100) / 100;
                setCmimiKatror(pricePerM2);
            }
        }
    }

    function handlePricePerM2Change(e){
        const value = Number(e.target.value) || 0;
        setCmimiKatror(value);
        // Recalculate total and price per box
        if(boxes && siperfaqjaTotale > 0 && value > 0){
            const totalArea = siperfaqjaTotale * boxes;
            const total = Math.round(value * totalArea * 100) / 100;
            setCmimiTotalProdukt(total);
            const pricePerBox = Math.round(total / boxes * 100) / 100;
            setSelectedProduct({
                ...selectedProduct,
                cmimi: pricePerBox
            });
        }
    }

    function handleTotalChange(e){
        const value = Number(e.target.value) || 0;
        setCmimiTotalProdukt(value);
        
        // For tiles: recalculate price per box and price per m²
        if(isTile && boxes && value > 0){
            // Calculate price per box
            const pricePerBox = Math.round(value / boxes * 100) / 100;
            setSelectedProduct({
                ...selectedProduct,
                cmimi: pricePerBox
            });
            // Calculate price per m²
            if(siperfaqjaTotale > 0){
                const totalArea = siperfaqjaTotale * boxes;
                if(totalArea > 0){
                    const pricePerM2 = Math.round(value / totalArea * 100) / 100;
                    setCmimiKatror(pricePerM2);
                }
            }
        }
        // For normal products: recalculate price per unit
        else if(!isTile && clientStock && value > 0){
            const pricePerUnit = Math.round(value / clientStock * 100) / 100;
            setSelectedProduct({
                ...selectedProduct,
                cmimi: pricePerUnit
            });
        }
    }

    function deleteFromInvoice(itemNr){
        // Remove the item from invoiceItems
        setInvoiceItems(prev => {
            const updatedItems = prev.filter(item => item.Nr !== itemNr);
            // Renumber the remaining items sequentially
            const renumberedItems = updatedItems.map((item, index) => ({
                ...item,
                Nr: index + 1
            }));
            // Update the invoice number counter
            setNrInvoice(renumberedItems.length + 1);
            // Mark that we should notify parent after state update
            shouldNotifyParentRef.current = true;
            return renumberedItems;
        });
    }

    function handleProductListedChange(itemNr, newQuantity){
        return (e) => {
            const quantity = Number(e.target.value) || 0;
            setInvoiceItems(prev => {
                const itemToUpdate = prev.find(item => item.Nr === itemNr);
                if(!itemToUpdate) return prev;
                const availableStock = itemToUpdate.sasiaProduktit || 0;
                if(quantity > availableStock){
                    return prev;
                }
                if(quantity < 0){
                    return prev;
                }
                const newTotalPrice = Math.round(quantity * itemToUpdate.cmimiNjesi * 100) / 100;

                // Update the item
                const updatedItems = prev.map(item => {
                    if(item.Nr === itemNr){
                        return {
                            ...item,
                            sasiaFatures: quantity,
                            cmimiProdukt: newTotalPrice
                        };
                    }
                    return item;
                });

                // Mark that we should notify parent after state update
                shouldNotifyParentRef.current = true;
                return updatedItems;
            });
        };
    }

    return(
        <div className="bg-white mx-5 mb-5 p-2 rounded-xl flex-1">
            {invoiceItems.length === 0 ? (
                <div></div>
            ) : (
                <div className="overflow-x-auto overflow-y-auto h-82">
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
                                <th className="px-4 py-3 text-center font-semibold border-b border-gray-700">Veprime</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceItems.map((item, index) => {
                                return (
                                    <tr 
                                        key={item.Nr} 
                                        className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                        }`}
                                    >
                                        <td className="px-4 py-3 text-center text-gray-700">{item.Nr}</td>
                                        <td className="px-4 py-3 text-center text-gray-600">{item.produktID}</td>
                                        <td className="px-4 py-3 text-center font-medium text-gray-800">{item.emriProduktit}</td>
                                        <td className="px-4 py-3 text-center text-gray-600">{item.NjesiaMatese}</td>
                                        <td className="px-4 py-3 text-center text-gray-700">
                                            <input 
                                                type='number' 
                                                className='bg-gray-200 p-2 pt-1 rounded-xl h-8 w-14 text-center' 
                                                onChange={handleProductListedChange(item.Nr)} 
                                                value={item.sasiaFatures}
                                                min='0'
                                                max={item.sasiaProduktit || 0}
                                                step='1'
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-700">{Number(item.cmimiNjesi || 0).toFixed(2)}€</td>
                                        <td className="px-4 py-3 text-center font-semibold text-gray-900">{Number(item.cmimiProdukt || 0).toFixed(2)}€</td>
                                        <td className='px-4 py-3 text-center'>
                                            <img 
                                                src={Cancel}  
                                                className='h-12 w-auto hover:scale-105 hover:bg-gray-300 active:scale-95 p-1 rounded-full cursor-pointer mx-auto' 
                                                onClick={() => deleteFromInvoice(item.Nr)}
                                                alt="Fshi produktin"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
            <button className="border mt-2 cursor-pointer w-full border-blue-500 rounded-xl py-3 text-blue-500 hover:bg-gray-100 hover:border-black-600 hover:text-blue-600 active:scale-99 transition-transform duration-50" onClick={() =>{setAddModal(true)}}>+ Shto Produkt  </button>
            {addModal && (
                <div className="fixed top-0 left-0 w-full h-full bg-gray-100/90 flex justify-center items-center z-50">
                    <form className='bg-white p-4 text-center w-100 rounded-xl relative h-110' onSubmit={addToInvoice}>
                        <h1 className="mb-2 font-semibold">Shto Produktin</h1>
                        <div className="relative">
                            <input 
                                ref={inputRef}
                                type="text" 
                                className="bg-gray-100 p-2 rounded-xl w-full" 
                                placeholder="Shkruaj emrin e produktit" 
                                value={searchParameter} 
                                onChange={handleChange}
                                onFocus={() => {
                                    if(searchResult.length > 0 || isSearching){
                                        setDropdown(true);
                                    }
                                }}
                            />
                            {/*Search result dropdown section*/}
                            {dropdown && (searchResult.length > 0 || isSearching || (searchParameter.trim().length >= 2 && searchResult.length === 0)) && (
                                <div ref={dropdownRef} className='absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto mt-1'>
                                    {isSearching ? (
                                        <div className="p-3 text-center text-gray-500">Duke kërkuar...</div>
                                    ) : searchResult.length === 0 ? (
                                        <div className="p-3 text-center text-gray-500">Nuk u gjet asnjë produkt</div>
                                    ) : (
                                        <ul className='py-1'>
                                            {searchResult.map((product) =>(
                                                <li 
                                                    key={product.produktID} 
                                                    onClick={() => handleProductSelect(product)} 
                                                    className='px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors flex flex-row justify-between'
                                                >
                                                    <div className='flex flex-col text-left'>
                                                        <p className="font-medium">{product.emriProduktit}</p>
                                                        <p className="text-sm text-gray-600">Sasia: {product.sasia}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{product.cmimi}€</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            {/*Client Suggestion section */}
                            <div className='mt-2 relative min-h-30'>
                                {/*Produkt Normal */}
                                <div className='flex flex-col'>
                                    <div className={`${selectedProduct && !isTile ? "visible" : "invisible"} absolute inset-0 flex flex-row justify-between mt-10`}>
                                        <div className='flex flex-col'>
                                            <div>
                                                <p className=''>Sasia: {selectedProduct?.sasia}</p>
                                            </div>
                                            <div className='min-w-30'>
                                                <p>Vlera: </p>
                                                <input 
                                                    type='number' 
                                                    value={cmimiTotalProdukt || ''} 
                                                    onChange={handleTotalChange} 
                                                    min='0' 
                                                    step='0.01' 
                                                    className='bg-gray-100 p-2 rounded-xl w-20 font-semibold'
                                                />
                                                <span>€</span>
                                            </div>
                                        </div>
                                        <div className='mr-6'>
                                            <p>Sa kërkon <br/>klienti:</p>
                                            <input className='bg-gray-100 p-2 rounded-xl h-10' type='number' name='clientStock' placeholder='' value={clientStock || ''} onChange={handleClientStock} max={selectedProduct?.sasia} step='1' min='1'></input>
                                        </div>
                                        <div>    
                                            <p>Cmimi për <br/>njësi:</p>
                                            <input type='number' name='cmimi' value={selectedProduct?.cmimi || ''} onChange={handleChangePrice} min='0' step='0.01' className='bg-gray-100 p-2 rounded-xl w-20'></input>€
                                        </div>
                                    </div>
                                </div>
                                {/*Pllaka */}
                                <div className={`${selectedProduct && isTile ? "visible" : "invisible"} absolute inset-0 flex flex-col text-left`}>
                                    <div className='flex flex-row bg-gray-100 p-1 rounded-xl mb-1'>
                                        <p className='mt-1 px-1'>Sa m² Kërkon klienti:</p>
                                        <input className='bg-white p-2 rounded-xl w-19 h-8 mr-1' type='number' name='clientStock' placeholder='' value={clientStock || ''} onChange={handleTileStock} step='1' min='1'></input>
                                        <p className='mt-1'>m²</p>
                                    </div>
                                    <div>
                                        <p className='bg-gray-100 rounded-xl px-2 mb-1'>Sa kuti janë të gatshme:  {selectedProduct?.sasia}</p>
                                        <p className='bg-gray-100 rounded-xl px-2 mb-1'>Sipërfaqja në një kuti: {siperfaqjaTotale}m²</p>
                                        <p className='bg-gray-100 rounded-xl px-2 py-1'>Sa kuti do marrë: <input value={boxes || ''} type='number' className='bg-white p-2 rounded-xl h-8 w-16' onChange={handleBoxChange} max={selectedProduct?.sasia} min='1' step='1'></input> Kuti</p>
                                    </div>
                                    <div className='flex flex-col'>
                                        <div className='flex flex-col justify-evenly text-left mt-1'>
                                            <div className='flex flex-row bg-gray-100 rounded-xl px-2 py-1 justify-between'>
                                                <div className='flex flex-row'>
                                                    <p className='text-sm mt-1'>Cmimi (m²) :</p>
                                                    <input 
                                                        type='number' 
                                                        value={cmimiKatror || ''} 
                                                        onChange={handlePricePerM2Change} 
                                                        min='0' 
                                                        step='0.01' 
                                                        className='bg-white p-2 rounded-xl ml-2 w-18 h-8 '
                                                    />
                                                    <span className='mt-0.5'>€</span>
                                                </div>
                                                <div className='flex flex-row'>
                                                    <p className='text-sm mt-1'>Cmimi (Kuti): </p>
                                                    <input 
                                                    type='number' 
                                                    value={selectedProduct?.cmimi || ''} 
                                                    onChange={handlePricePerBoxChange} 
                                                    min='0' 
                                                    step='0.01' 
                                                    className='bg-white p-2 rounded-xl w-18 h-8'
                                                    />
                                                    <span className='mt-0.5'>€</span>
                                                </div>
                                            </div>
                                            <div className='flex flex-row bg-gray-100 rounded-xl px-2 py-1 mt-1 justify-center'>
                                                <p className='text-sm mt-1'>Totali: </p>
                                                <input 
                                                    type='number' 
                                                    value={cmimiTotalProdukt || ''} 
                                                    onChange={handleTotalChange} 
                                                    min='0' 
                                                    step='0.01' 
                                                    className='bg-white ml-2 p-2 pt-1 rounded-xl w-20 h-8 font-semibold'
                                                />
                                                <span className='mt-1 ml-1'>€</span>
                                            </div>
                                        </div>
                                        {(modalMessage && isTile) && (
                                            <p className='text-center mt-2 font-semibold text-lg text-red-600 bg-red-50 p-2 rounded-xl'>{modalMessage}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/*Modal Message for Normal Products - Between data and buttons*/}
                            <div className='min-h-15 flex items-center justify-center mt-2'>
                                {(modalMessage && !isTile) && (
                                    <p className='text-center font-semibold text-lg text-red-600 bg-red-50 p-2 rounded-xl'>{modalMessage}</p>
                                )}
                            </div>
                        </div>
                        <div className='flex flex-row justify-evenly mt-26'>
                            <button className="bg-gray-800 px-4 py-2 rounded-lg hover:scale-102 active:scale-95 text-white cursor-pointer" onClick={handleCancel} type='button'>Anulo</button>
                            <button className="bg-green-500 px-4 py-2 rounded-lg hover:scale-102 active:scale-95 text-white cursor-pointer" type='submit' disabled={isSubmitting}>Shto</button>
                        </div>

                    </form>
                </div>
            )}
        </div>
    )

}

export default InvoiceProductSelector;