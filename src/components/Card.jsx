import Forward from '../assets/Forward.svg';
import { NavLink } from 'react-router-dom'; 

function Card(props) {
    return(
        <NavLink to={props.link}>
            <div className="bg-white mt-5 ml-5 p-5 rounded-xl hover:scale-105 transition-transform flex flex-col items-center w-40">
                <img src={props.icon} className='mb-2 pointer-events-none select-none'/>
                <h1 className='font-semibold'>{props.title}</h1>
                <img src={Forward} className='pointer-events-none select-none'/>
            </div>
        </NavLink>
    )
}

export default Card;