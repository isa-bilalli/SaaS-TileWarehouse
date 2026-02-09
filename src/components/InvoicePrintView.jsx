import { useAuth } from "../contexts/AuthContext";

function InvoicePrintView({ invoiceData, currentPuntori: propPuntori }) {
  // Use prop if provided (for PDF generation), otherwise try to use context
  let currentPuntori = propPuntori;
  
  // Only use useAuth if propPuntori is not provided (when used in normal React tree)
  if (!currentPuntori) {
    try {
      const authContext = useAuth();
      currentPuntori = authContext?.currentPuntori;
    } catch (error) {
      // If useAuth fails (outside AuthProvider), use a fallback
      currentPuntori = { emriMbiemri: 'N/A' };
    }
  }

  // Dummy data for preview - replace with invoiceData prop when ready
  const dummyData = {
    faturaID: 123,
    klienti: {
      emriMbiemri: "",
      telefoni: ""
    },
    products: [
      {
        Nr: 1,
        emriProduktit: "Pllakë Ceramike 30x60",
        NjesiaMatese: "Kuti",
        sasiaFatures: 5,
        cmimiNjesi: 25.50,
        cmimiProdukt: 127.50
      },
      {
        Nr: 2,
        emriProduktit: "Cimento Portland",
        NjesiaMatese: "Copë",
        sasiaFatures: 10,
        cmimiNjesi: 8.75,
        cmimiProdukt: 87.50
      },
      {
        Nr: 3,
        emriProduktit: "Pllakë Bathroom 20x20",
        NjesiaMatese: "Kuti",
        sasiaFatures: 3,
        cmimiNjesi: 18.00,
        cmimiProdukt: 54.00
      }
    ],
    totaliPaZbritje: 269.00,
    zbritja: 10.00,
    totali: 259.00,
    shumaPaguar: 200.00,
    borxhi: 59.00
  };

  // Use invoiceData if provided, otherwise use dummyData
  const data = invoiceData || dummyData;

  const albanianMonths = [
    "Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor",
    "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor"
  ];

  function getTime() {
    const date = new Date();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  function getDate() {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = albanianMonths[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  }

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex flex-row justify-between items-center text-center leading-none mt-2">
        <div className="mb-4 ml-5">
          <p className="text-lg font-semibold">
            Fatura Nr: <span className="font-normal">#{data.faturaID || 'N/A'}</span>
          </p>
        </div>

        <h1 className="font-semibold">
          <span className="text-6xl">ARTA</span> <br />
          <span className="text-3xl">COMMERCE</span>
        </h1>

        <p className="mr-5">
          Data: <br/> {getDate()} <br />
          {getTime()}
        </p>
      </header>

      {/* Body Section */}
      <div className="flex flex-col mt-8 px-5">
        {/* Client and Employee Information */}
        <div className="mb-6 border-b-2 border-gray-800 pb-4 flex flex-row justify-between">
          {/* Client Information */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Klienti:</h2>
            {data.klienti && data.klienti.emriMbiemri ? (
              <>
                <p className="text-lg">{data.klienti.emriMbiemri}</p>
                {data.klienti.telefoni && (
                  <p className="text-base text-gray-700">Tel: {data.klienti.telefoni}</p>
                )}
              </>
            ) : (
              <p className="text-lg text-gray-500">Klient i përgjithshëm</p>
            )}
          </div>

          {/* Employee Information */}
          <div className="text-right">
            <h2 className="text-xl font-semibold mb-2">Puntori:</h2>
            <p className="text-lg">{currentPuntori.emriMbiemri}</p>
          </div>
        </div>

        {/* Products Table */}
        <div className="mb-6">
          <table className="w-full border-collapse border-2 border-gray-800">
            <thead>
              <tr className="bg-gray-200">
                <th className="border-2 border-gray-800 px-3 py-2 text-left font-semibold">Nr.</th>
                <th className="border-2 border-gray-800 px-3 py-2 text-left font-semibold">Emri i Produktit</th>
                <th className="border-2 border-gray-800 px-3 py-2 text-center font-semibold">Njësia</th>
                <th className="border-2 border-gray-800 px-3 py-2 text-center font-semibold">Sasia</th>
                <th className="border-2 border-gray-800 px-3 py-2 text-right font-semibold">Cmimi për Njësi</th>
                <th className="border-2 border-gray-800 px-3 py-2 text-right font-semibold">Cmimi Total</th>
              </tr>
            </thead>
            <tbody>
              {data.products && data.products.length > 0 ? (
                data.products.map((product) => (
                  <tr key={product.Nr} className="hover:bg-gray-50">
                    <td className="border-2 border-gray-800 px-3 py-2">{product.Nr}</td>
                    <td className="border-2 border-gray-800 px-3 py-2">{product.emriProduktit}</td>
                    <td className="border-2 border-gray-800 px-3 py-2 text-center">{product.NjesiaMatese}</td>
                    <td className="border-2 border-gray-800 px-3 py-2 text-center">{product.sasiaFatures}</td>
                    <td className="border-2 border-gray-800 px-3 py-2 text-right">{Number(product.cmimiNjesi || 0).toFixed(2)}€</td>
                    <td className="border-2 border-gray-800 px-3 py-2 text-right font-semibold">{Number(product.cmimiProdukt || 0).toFixed(2)}€</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="border-2 border-gray-800 px-3 py-4 text-center text-gray-500">
                    Nuk ka produkte
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex flex-col items-end mb-6">
          <div className="w-80 border-2 border-gray-800">
            <div className="flex justify-between px-4 py-2 border-b-2 border-gray-800">
              <span className="font-semibold">Totali pa Zbritje:</span>
              <span>{Number(data.totaliPaZbritje || 0).toFixed(2)}€</span>
            </div>
            <div className="flex justify-between px-4 py-2 border-b-2 border-gray-800">
              <span className="font-semibold">Zbritje:</span>
              <span>{Number(data.zbritja || 0).toFixed(2)}€</span>
            </div>
            <div className="flex justify-between px-4 py-2 border-b-2 border-gray-800 bg-gray-100">
              <span className="font-bold text-lg">Totali:</span>
              <span className="font-bold text-lg">{Number(data.totali || 0).toFixed(2)}€</span>
            </div>
            <div className="flex justify-between px-4 py-2 border-b-2 border-gray-800">
              <span className="font-semibold">Paguar:</span>
              <span>{Number(data.shumaPaguar || 0).toFixed(2)}€</span>
            </div>
            {data.borxhi !== undefined && data.borxhi !== null && Number(data.borxhi) > 0 && (
              <div className="flex justify-between px-4 py-2 bg-red-50">
                <span className="font-semibold text-red-700">Borxhi:</span>
                <span className="font-semibold text-red-700">{Number(data.borxhi).toFixed(2)}€</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvoicePrintView;