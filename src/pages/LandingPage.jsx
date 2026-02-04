import { Link } from "react-router-dom";
import { testPing } from "../services/electronApi";

function LandingPage(){
    return(
        <>
        Landing page
        <Link to="/dashboard">CLICK ME!</Link>
        <button onClick={testPing} >Ping backend</button>
        </>
    )
}

export default LandingPage;