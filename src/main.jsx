import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createHashRouter, RouterProvider } from 'react-router-dom'
//Faqet
import LandingPage from './pages/LandingPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AddProduct from './pages/AddProduct.jsx';
import SearchProduct from './pages/SearchProduct.jsx';
import RegisterPayment from './pages/RegisterPayment.jsx';
import SearchPayment from './pages/SearchPayment.jsx';
import ReportBroken from './pages/ReportBroken.jsx';
import SearchBroken from './pages/SearchBroken.jsx';
import SearchDebt from './pages/SearchDebt.jsx';
import SearchClient from './pages/SearchClient.jsx';
import CreateInvoice from './pages/CreateInvoice.jsx';
import SearchInvoice from './pages/SearchInvoice.jsx';
import GenerateReport from './pages/GenerateReport.jsx';

const router = createHashRouter([
  {path:'/', element: <LandingPage />},
  {path:'/dashboard', element:<Dashboard />},
  {path: '/addproduct', element: <AddProduct />},
  {path: '/searchproduct', element: <SearchProduct />},
  {path: '/registerpayment', element: <RegisterPayment />},
  {path: '/searchpayment', element: <SearchPayment />},
  {path: '/reportbroken', element: <ReportBroken />},
  {path: '/searchbroken', element: <SearchBroken />},
  {path: '/searchdebt', element:<SearchDebt />},
  {path: '/searchclient', element:<SearchClient />},
  {path: '/createinvoice', element:<CreateInvoice />},
  {path: '/searchinvoice', element:<SearchInvoice />},
  {path: '/generatereport', element:<GenerateReport />}
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
