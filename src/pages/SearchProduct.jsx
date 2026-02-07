import Navbar from "../components/Navbar";
import { useState, useEffect, useRef } from "react";
import { searchProduct, isTile as isTileAPI, editProduct, getTileData, editTile } from "../services/electronApi";
import Edit from '../assets/Edit.svg';
import Delete from '../assets/Delete.svg';
import { deleteProduct as deleteProductAPI } from "../services/electronApi";

function SearchProduct(){
    const [searchParameter, setSearchParameter] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const debounceTimerRef = useRef(null);
    const isTileRef = useRef(false);
    const [selectedID, setSelectedID] = useState(0);
    const [modalMessage, setModalMessage]= useState('test')
    const [isTile, setIsTile] = useState(true);
    const [isSubmitting, setIsSubmitting]= useState(false);
    const [productData, setProductData] = useState({
        produktID:0,
        emriProduktit:'',
        cmimi:0.00,
        sasia:0
    })
    const [tileData, setTileData] = useState({
        produktID:0,
        emriProduktit:'',
        cmimi:0.00,
        sasia:0,
        gjatesia:0,
        gjeresia:0,
        pllakaNeKuti:0
    })    

    useEffect(() => {
        // Clear previous timer if it exists
        if(debounceTimerRef.current){
            clearTimeout(debounceTimerRef.current);
        }

        // If search is empty, clear results immediately
        if(searchParameter.trim().length === 0){
            setSearchResult([]);
            setIsSearching(false);
            return;
        }

        // Minimum 2 characters before searching (optional - remove if you want to search with 1 char)
        if(searchParameter.trim().length < 2){
            setSearchResult([]);
            setIsSearching(false);
            return;
        }

        // Set loading state
        setIsSearching(true);

        // Debounce: wait 400ms after user stops typing
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

        // Cleanup function to clear timer on unmount or when searchParameter changes
        return () => {
            if(debounceTimerRef.current){
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [searchParameter]);

    function handleChange(e){
        const value = e.target.value;
        setSearchParameter(value);
    }

    function handleInputChange(e){
        let value=e.target.value;
        if(e.target.type === "number") {
            const parsed = parseFloat(e.target.value);
            value = e.target.value === '' ? '' : (isNaN(parsed) ? 0 : parsed);
        }
        if(!isTileRef.current){
            setProductData({
                ...productData,
                [e.target.name]:value
            })
        }else {
            setTileData({
                ...tileData,
                [e.target.name]:value
            })
        }
    }

    async function handleEditIcon(produkt){
        try{
            setSelectedID(produkt.produktID);
            const produktID = produkt.produktID;
            const res = await isTileAPI(produktID)
            setIsTile(res);
            isTileRef.current=res;
            if(!res){
                setProductData({
                    produktID:produktID,
                    emriProduktit:produkt.emriProduktit,
                    cmimi:produkt.cmimi,
                    sasia:produkt.sasia
                })
            }else {
                let {gjatesia, gjeresia, pllakaNeKuti} = await getTileData(produktID);
                gjatesia = gjatesia*100 // Ktheje nga M (backend) ne CM (Front-end)
                gjeresia = gjeresia*100 // ^
                setTileData({
                    produktID:produktID,
                    emriProduktit:produkt.emriProduktit,
                    cmimi:produkt.cmimi,
                    sasia:produkt.sasia,
                    gjatesia:gjatesia,
                    gjeresia:gjeresia,
                    pllakaNeKuti:pllakaNeKuti
                })
            }
            setModalMessage('')
            setIsEditing(true);
        }catch(err){
            console.log('Error', err)
        }
    }

    function handleDeleteIcon(produktID){
        setIsDeleting(true);
        setSelectedID(produktID)
        setModalMessage('')
    }

    async function deleteProduct() {
        if(!selectedID){
            return;
        }
        try{
            const res = await deleteProductAPI(selectedID);
            setModalMessage('Deleted successfully')
            const result = await searchProduct(searchParameter.trim());
            setSearchResult(Array.isArray(result) ? result : []);
            setTimeout(() => {
                setIsDeleting(false);
                setModalMessage('');
            },1500)
        }catch(err){
            console.log('Error',err);
        }
    }

    async function handleSubmit(e){
        e.preventDefault();
        setIsSubmitting(true);
        setModalMessage('');
        try{
            const payload = isTileRef.current ? tileData : productData;
            if(!payload.produktID || !payload.emriProduktit){
                console.log('Te dhenat nuk u ngarkuan ERROR');
                setIsSubmitting(false);
                return;
            }
            if(!payload.emriProduktit || payload.emriProduktit.trim() === '' || 
               payload.cmimi === null || payload.cmimi === undefined || payload.cmimi <= 0 || 
               payload.sasia === null || payload.sasia === undefined || payload.sasia < 0){
                setModalMessage("Mbush te dhenat");
                setIsSubmitting(false);
                return;
            }
            let result;
            if(!isTileRef.current){
                result = await editProduct(payload)
            }else{
                result = await editTile(payload);
            }
            setModalMessage('Produkti u ndryshua me sukses!')
            if(isTileRef.current){
                setTileData({
                    produktID:0,
                    emriProduktit:'',
                    cmimi:0.00,
                    sasia:0,
                    gjatesia:0,
                    gjeresia:0,
                    pllakaNeKuti:0
                })
            }else {
                setProductData({
                    produktID:0,
                    emriProduktit:'',
                    cmimi:0.00,
                    sasia:0
                })
            }
            const res = await searchProduct(searchParameter.trim());
            setSearchResult(Array.isArray(res) ? res : []);
            setTimeout(() => {
                setIsEditing(false);
                setModalMessage('');
                setIsSubmitting(false);
            },1500)
        }catch(err){
            console.log('Error:',err)
            setModalMessage('Error: ' + (err.message || err));
            setIsSubmitting(false);
        }
    }

    return(
        <div className="flex flex-col bg-gray-100 h-screen">
            <Navbar />
            <form className="bg-white m-5 rounded-xl p-3">
                    <input 
                        type="text" 
                        className="bg-gray-100 p-2 rounded-xl w-full" 
                        placeholder="Shkruaj emrin e produktit" 
                        value={searchParameter}
                        onChange={handleChange}
                    />
            </form>
            <div className="bg-white ml-5 mr-5 mb-5 flex-1 rounded-xl p-3 overflow-auto">
                {searchParameter.trim().length === 0 ? (
                    <p className="text-center text-gray-500 mt-4">Shkruani emrin e produktit per te kërkuar</p>
                ) : searchParameter.trim().length < 2 ? (
                    <p className="text-center text-gray-500 mt-4">Shkruani te pakten 2 karaktere per te kërkuar</p>
                ) : isSearching ? (
                    <p className="text-center text-gray-500 mt-4">Duke kërkuar...</p>
                ) : searchResult.length === 0 ? (
                    <p className="text-center text-gray-500 mt-4">Nuk u gjet asnje produkt</p>
                ) : (
                    <div className="space-y-2">
                        {searchResult.map((produkt) => (
                            <div key={produkt.produktID} className="bg-gray-50 p-1 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div className="ml-1">
                                        <p className="font-semibold">{produkt.emriProduktit}</p>
                                        <p className="text-sm text-gray-600">Cmimi: {produkt.cmimi}€ | Sasia: {produkt.sasia}</p>
                                    </div>
                                    <div>
                                        <button type="button" className="hover:scale-105 active:scale-95" onClick={() => handleEditIcon(produkt)}>
                                            <img src={Edit} alt="Edit" className="bg-gray-800 h-12 w-12 p-2 rounded-xl mr-1 mt-2" />
                                        </button>
                                        <button className="hover:scale-105 active:scale-95" onClick={() => handleDeleteIcon(produkt.produktID)} title="Fshi produktin">
                                            <img src={Delete} alt="Delete" className="bg-red-600 h-12 w-12 p-2 rounded-xl ml-1 mr-2" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {isEditing && (isTile ? ((
                <div className="fixed top-0 left-0 w-full h-full bg-gray-100 opacity-90 flex justify-center items-center z-50">
                    <form className="bg-white rounded-xl w-125 flex-col text-center h-105" onSubmit={handleSubmit}>
                        <h2 className="font-bold text-lg pt-4 mb-5">Ndrysho produktin</h2>
                        <div className="flex flex-row justify-evenly mb-5">
                            <div className="ml-4">
                                <h2>Emri i Pllakes</h2>
                                <input type="text" placeholder="Emri i Pllakes" name="emriProduktit" value={tileData.emriProduktit} className="bg-gray-100 m-2 p-2 rounded-lg" onChange={handleInputChange} required></input>
                                <h2>Cmimi per Kuti</h2>
                                <input type="number" placeholder="Cmimi per Kuti" name="cmimi" value={tileData.cmimi === 0 ? '' : tileData.cmimi} className="bg-gray-100 p-2 m-2 rounded-lg" step="0.01" min="0" onChange={handleInputChange} required></input>
                                <h2>Kuti te gatshme</h2>
                                <input type="number" placeholder="Kuti te gatshme" name="sasia" value={tileData.sasia === 0 ? '' : tileData.sasia} className="bg-gray-100 p-2 m-2 rounded-lg" step="1" min="0" onChange={handleInputChange} required></input>
                            </div>
                            <div className="mr-4">
                                <h2>Gjatesia (CM)</h2>
                                <input type="number" placeholder="Gjatesia (CM)" name="gjatesia" value={tileData.gjatesia === 0 ? '' : tileData.gjatesia} className="bg-gray-100 p-2 m-2 rounded-lg" step="1" min="0" onChange={handleInputChange} required></input>
                                <h2>Gjeresia(CM)</h2>
                                <input type="number" placeholder="Gjeresia (CM)" name="gjeresia" value={tileData.gjeresia === 0 ? '' : tileData.gjeresia} className="bg-gray-100 p-2 m-2 rounded-lg" step="1" min="0" onChange={handleInputChange} required></input>
                                <h2>Pllaka ne Kuti</h2>
                                <input type="number" placeholder="Pllaka ne Kuti" name="pllakaNeKuti" value={tileData.pllakaNeKuti === 0 ? '' : tileData.pllakaNeKuti} className="bg-gray-100 p-2 m-2 rounded-lg" step="1" min="0" onChange={handleInputChange} required></input>
                            </div>
                        </div>
                        <h2 className="font-semibold">{modalMessage}</h2>
                        <div className="flex flex-row justify-evenly mt-4 mb-5">
                            <button className="bg-gray-800 px-4 py-2 rounded-lg hover:scale-102 active:scale-95 text-white" type="button" onClick={() =>{setIsEditing(false)}}>Cancel</button>
                            <button className="bg-green-600 px-4 py-2 rounded-lg hover:scale-102 active:scale-95 text-white" type="submit" disabled={isSubmitting}>Ndrysho</button>
                        </div>
                    </form>
                </div>
            )):(
                <div className="fixed top-0 left-0 w-full h-full bg-gray-100 opacity-90 flex justify-center items-center z-50">
                    <form className="bg-white rounded-xl max-w-8l w-75 flex-col text-center h-105" onSubmit={handleSubmit}>
                        <h2 className="font-bold text-lg pt-4 mb-5">Ndrysho produktin</h2>
                        <p className="mt-1">Emri i Produktit</p>
                        <input type="text" placeholder="Emri i Produktit" name="emriProduktit" value={productData.emriProduktit} className="bg-gray-100 p-2 m-2 rounded-lg" onChange={handleInputChange} required></input>
                        <p className="mt-1">Cmimi i Produktit</p>
                        <input type="number" placeholder="Cmimi" name="cmimi" value={productData.cmimi === 0 ? '' : productData.cmimi} className="bg-gray-100 p-2 m-2 rounded-lg" step="0.01" min="0" onChange={handleInputChange} required></input>
                        <p className="mt-1">Sasia e gatshme</p>
                        <input type="number" placeholder="Sasia e gatshme" name="sasia" value={productData.sasia === 0 ? '' : productData.sasia} className="bg-gray-100 p-2 m-2 rounded-lg" step="1" min="0" onChange={handleInputChange} required></input>
                        <h2 className="font-semibold">{modalMessage}</h2>
                        <div className="flex flex-row justify-evenly mt-4 mb-5">
                            <button className="bg-gray-800 px-4 py-2 rounded-lg hover:scale-102 active:scale-95 text-white" type="button" onClick={() =>{setIsEditing(false)}}>Cancel</button>
                            <button className="bg-green-600 px-4 py-2 rounded-lg hover:scale-102 active:scale-95 text-white" type="submit" disabled={isSubmitting}>Ndrysho</button>
                        </div>
                    </form>
                </div>
            ))}
            {isDeleting &&(
                <div className="fixed top-0 left-0 w-full h-full bg-gray-100 opacity-90 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl max-w-8l flex-col text-center h-51">
                        <h2 className="font-bold text-lg pt-4 mb-5">Konfirmo Fshirjen</h2>
                        <p className="mb-5 px-5">A je i sigurt qe te fshish produktin ?</p>
                        <div className="flex flex-row justify-evenly mb-3">
                            <button className="bg-gray-800 px-4 py-2 rounded-lg hover:scale-102 active:scale-95 text-white" type="button" onClick={() =>{setIsDeleting(false)}}>Cancel</button>
                            <button className="bg-red-600 px-4 py-2 rounded-lg hover:scale-102 active:scale-95 text-white" onClick={deleteProduct}>Delete</button>
                        </div>
                        <h2 className="font-semibold">{modalMessage}</h2>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SearchProduct;