import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { addProduct, addPllake, getTodayProduct } from "../services/electronApi";

function AddProduct(){
    const [tile, setTile] = useState(false);
    const [submitMessage, setSubmitMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [productData, setProductData] = useState({
        emriProduktit:'',
        cmimi:0.00,
        sasia:0,
    })
    const [tileData, setTileData] = useState({
        emriProduktit:'',
        cmimi:0.00,
        sasia:0,
        gjatesia:0,
        gjeresia:0,
        pllakaNeKuti:0
    })
    const [products, setProducts] = useState([]);
    const loadTodayProducts = async () => {
        try {
            const rows = await getTodayProduct();
            setProducts(rows || []);
        } catch (err) {
            console.error('Error loading today products:', err);
            setProducts([]);
        }
    };
    useEffect(() => {
        loadTodayProducts();
    }, [])
    
    function HandleChange(e){
        let value = e.target.value;
        
        if(e.target.type === "number") {
            const parsed = parseFloat(e.target.value);
            // Handle empty input or NaN
            value = e.target.value === '' ? '' : (isNaN(parsed) ? 0 : parsed);
        }
        if(tile){
            setTileData({
                ...tileData,
                [e.target.name]:value
            });
        }else {
            setProductData({
                ...productData,
                [e.target.name]:value
            })
        }
    }

    async function HandleSubmit(e){
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage('');
        try{
            const payload = tile ? tileData: productData;
            if(!payload.emriProduktit || payload.emriProduktit.trim() === '' || 
               payload.cmimi === null || payload.cmimi === undefined || payload.cmimi <= 0 || 
               payload.sasia === null || payload.sasia === undefined || payload.sasia < 0){
                setSubmitMessage("Mbush te dhenat");
                setIsSubmitting(false);
                return;
            }
            let result;
            if(tile){
                if(payload.gjatesia === null || payload.gjatesia === undefined || payload.gjatesia <= 0 ||
                   payload.gjeresia === null || payload.gjeresia === undefined || payload.gjeresia <= 0 ||
                   payload.pllakaNeKuti === null || payload.pllakaNeKuti === undefined || payload.pllakaNeKuti <= 0){
                    setSubmitMessage("Mbush te dhenat per pllaken");
                    setIsSubmitting(false);
                    return;
                }
                result = await addPllake(payload);
            }else if(!tile){
                result = await addProduct(payload);
            }
            
            // Check if result is null (duplicate detected)
            if(result === null || result === undefined){
                setSubmitMessage('Ky produkt ekziston tashme! Ju lutem perdorni nje emer tjeter.');
                setIsSubmitting(false);
                return;
            }
            
            setSubmitMessage('Produkti u shtua me sukses');
            if(tile){
                setTileData({
                    emriProduktit:'',
                    cmimi:0.00,
                    sasia:0,
                    gjatesia:0,
                    gjeresia:0,
                    pllakaNeKuti:0
                });
            } else {
                setProductData({
                    emriProduktit:'',
                    cmimi:0.00,
                    sasia:0,
                });
            }
            await loadTodayProducts();
        }catch(err){
            // Check if it's a duplicate product error
            if(err.message === 'DUPLICATE_PRODUCT' || err.message?.includes('DUPLICATE')){
                setSubmitMessage('Ky produkt ekziston tashme! Ju lutem perdorni nje emer tjeter.');
            } else {
                setSubmitMessage(`Error: ${err.message || err}`);
            }
        }finally{
            setIsSubmitting(false);
            setTimeout(() => {
                setSubmitMessage('');
            }, 2500);
        }
    }
    
    return(
        <div className="bg-gray-100 h-screen flex flex-col">
            <Navbar />
            <form className="m-5 bg-white p-3 rounded-xl" onSubmit={HandleSubmit}>
                <div className="flex flex-row justify-evenly font-semibold">
                    <button type="button" className={`flex-1 p-2 ${tile ? "rounded-br-lg bg-gray-100":"bg-white"}`} onClick={() => setTile(false)}>
                        Produkt Normal
                    </button>
                    <button type="button" className={`flex-1 p-2 ${tile ? "bg-white":"rounded-bl-lg bg-gray-100"}`} onClick={() => setTile(true)}>
                        Pllake
                    </button>
                </div>
                {!tile &&
                    <div className="flex justify-between">
                        <div>
                            <input type="text" placeholder="Emri i Produktit" name="emriProduktit" value={productData.emriProduktit} className="bg-gray-100 p-2 m-2 mt-4 rounded-lg" onChange={HandleChange}></input>
                            <input type="number" placeholder="Cmimi" name="cmimi" value={productData.cmimi === 0 ? '' : productData.cmimi} className="bg-gray-100 p-2 m-2 mt-4 rounded-lg" step="0.01" min="0" onChange={HandleChange}></input>
                            <input type="number" placeholder="Sasia e gatshme" name="sasia" value={productData.sasia === 0 ? '' : productData.sasia} className="bg-gray-100 p-2 m-2 mt-4 rounded-lg" step="1" min="0" onChange={HandleChange}></input>
                        </div>
                        <div>
                            <button type="submit" className="m-4 rounded-lg bg-gray-800 text-white p-2 active:scale-98" disabled={isSubmitting}>+ Shto Produktin</button>
                        </div>
                    </div>
                }
                {tile &&
                    <div className="flex justify-between">
                        <div>
                            <input type="text" placeholder="Emri i Pllakes" name="emriProduktit" value={tileData.emriProduktit} className="bg-gray-100 m-2 mt-4 p-2 rounded-lg" onChange={HandleChange}></input>
                            <input type="number" placeholder="Cmimi per Kuti" name="cmimi" value={tileData.cmimi === 0 ? '' : tileData.cmimi} className="bg-gray-100 p-2 m-2 mt-4 rounded-lg" step="0.01" min="0" onChange={HandleChange}></input>
                            <input type="number" placeholder="Kuti te gatshme" name="sasia" value={tileData.sasia === 0 ? '' : tileData.sasia} className="bg-gray-100 p-2 m-2 mt-4 rounded-lg" step="1" min="0" onChange={HandleChange}></input>
                            <input type="number" placeholder="Gjatesia (CM)" name="gjatesia" value={tileData.gjatesia === 0 ? '' : tileData.gjatesia} className="bg-gray-100 p-2 m-2 mt-4 rounded-lg" step="1" min="0" onChange={HandleChange}></input>
                            <input type="number" placeholder="Gjeresia (CM)" name="gjeresia" value={tileData.gjeresia === 0 ? '' : tileData.gjeresia} className="bg-gray-100 p-2 m-2 mt-4 rounded-lg" step="1" min="0" onChange={HandleChange}></input>
                            <input type="number" placeholder="Pllaka ne Kuti" name="pllakaNeKuti" value={tileData.pllakaNeKuti === 0 ? '' : tileData.pllakaNeKuti} className="bg-gray-100 p-2 m-2 mt-4 rounded-lg" step="1" min="0" onChange={HandleChange}></input>
                        </div>
                        <div>
                            <button type="submit" className="m-4 rounded-lg bg-gray-800 text-white p-2 active:scale-98" disabled={isSubmitting}>+ Shto Produktin</button>
                        </div>
                    </div>
                    }
                    <h1 className="font-semibold text-center min-h-6 text-green-500">{submitMessage}</h1>
                </form>
            <div className="ml-5 mr-5 mb-5 bg-white p-3 rounded-xl flex-1 overflow-auto">
                <p className="text-center font-semibold mb-3">Produktet e regjistruara sot</p>
                {products.length === 0 ? (
                    <p className="text-center text-gray-500">Nuk ka produkte te regjistruara sot</p>
                ) : (
                    <div className="space-y-2">
                        {products.map((product) => (
                            <div key={product.produktID} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{product.emriProduktit}</p>
                                        <p className="text-sm text-gray-600">Cmimi: {product.cmimi}€ | Sasia: {product.sasia}</p>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {new Date(product.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AddProduct;