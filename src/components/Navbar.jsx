import Back from '../assets/Back.svg';
import { useLocation, Link } from 'react-router-dom';
import PowerOff from '../assets/PowerOff.svg'

function Navbar() {
    const location = useLocation(); 
    return (
        <>
         <nav className="min-w-screen bg-gray-800 p-4 text-white select-none">
            {location.pathname !== '/dashboard' && <Link to="/dashboard"><img src={Back} alt="Back Icon" className=" h-12 w-12 p-2 rounded-full absolute top-6 hover:scale-110 hover:bg-gray-700"/></Link>}
            <h1 className="text-4xl leading-none font-bold text-center">ARTA</h1>
            <h1 className="text-xl font-bold text-center">COMMERCE</h1>
            {location.pathname =='/dashboard' && <img src={PowerOff} alt='Log Out icon' className='h-12 w-12 p-2 rounded-full scale-130 absolute top-6 right-6 hover:scale-140 hover:bg-gray-700'/>}
         </nav>
        </>
    )
}

export default Navbar;