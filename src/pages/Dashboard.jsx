import Navbar from '../components/Navbar.jsx';
import Card from '../components/Card.jsx';
import Product from '../assets/Product.svg';
import Euro from '../assets/Euro.svg';
import Broken from '../assets/Broken.svg';
import Search from '../assets/Search.svg';
import Debt from '../assets/Debt.svg';
import Invoice from '../assets/Invoice.svg';
import Report from '../assets/Report.svg';
import {useEffect, useState} from 'react';
import { getDashboardData } from '../services/electronApi.js';

function Dashboard() {
    const [data,setData] = useState({
        faturaTeLeshuara:0,
        shumaFaturuar:0,
        qarkullimiDitor:0
    })

    useEffect(()=>{
        setDashboardData()
    }, [])

    async function setDashboardData(){
        try{
            const {faturaTeLeshuara, shumaFaturuar, qarkullimiDitor} = await getDashboardData()
            setData({
                faturaTeLeshuara:faturaTeLeshuara,
                shumaFaturuar:shumaFaturuar,
                qarkullimiDitor:qarkullimiDitor
            })
        }catch(err){
            setData({
                faturaTeLeshuara:0,
                shumaFaturuar:0,
                qarkullimiDitor:0
            })
        }
    }

    return (
        <div className='bg-gray-100 min-h-screen min-w-screen flex flex-col items-center'>
            <Navbar />
            <div className='flex flex-row flex-wrap justify-center'>
                <Card icon={Product} title="Shto Produkt" link="/addproduct"/>
                <Card icon={Search} title="Kërko Produktet" link="/searchproduct"/>
                <Card icon={Euro} title="Regjistro Pagesë" link="/registerpayment"/>
                <Card icon={Search} title="Shfleto Pagesat" link="/searchpayment"/>
                <Card icon={Broken} title="Raporto Dëme" link="/reportbroken"/>
                <Card icon={Search} title="Shfleto Dëmet" link="/searchbroken"/>
                <Card icon={Debt} title="Shfleto Borxhet" link="/searchdebt"/>
                <Card icon={Search} title="Kërko Klient" link="/searchclient"/>
                <Card icon={Invoice} title="Krijo Fakturë" link="/createinvoice"/>
                <Card icon={Search} title="Shfleto Fakturat" link="/searchinvoice"/>
                <Card icon={Report} title="Gjenero Raporte" link="/generatereport"/>
            </div>
            <div className='bg-gray-800 mt-5 w-full max-w-4xl mx-auto text-white rounded-xl p-2 select-none'>
                <h1 className='font-semibold text-2xl sm:text-3xl text-center pt-2'>PASQYRA DITORE</h1>
                <p className='text-lg sm:text-xl ml-3'>Fatura te leshuara: {data.faturaTeLeshuara}</p>
                <p className='text-lg sm:text-xl ml-3'>Shuma e faturuar: {data.shumaFaturuar}€</p>
                <p className='text-lg sm:text-xl ml-3 pb-3'>Qarkullimi Ditor: <span className={`${(data.qarkullimiDitor <0 ) ? `text-red-500`:`text-[#00FF00]`}`}>{data.qarkullimiDitor}€</span></p>
            </div>
        </div>
    )
}

export default Dashboard;