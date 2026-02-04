import Forward from '../assets/ForwardWhite.png'
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function EmployeeCard(props){
    const { login } = useAuth();
    const navigate = useNavigate();

    function handleClick(){
        login(props.puntori);
        navigate('/dashboard');
    }

    return(
        <div 
            onClick={handleClick}
            className="bg-gray-700 flex mb-2 flex-row items-center justify-between rounded-xl border border-white cursor-pointer hover:bg-gray-600 transition-colors"
        >
            <h1 className='text-2xl pl-5'>{props.name}</h1>
            <img src={Forward} className='scale-40'/>
        </div>
    )
}

export default EmployeeCard;