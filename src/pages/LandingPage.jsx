import { Link } from "react-router-dom";

function LandingPage(){
    const testPing = async () => {
      const res = await window.api.ping();
      console.log(res);
    };
    const testRun = async() => {
      const res = await window.api.run();
      console.log(res);
    }
    
    return(
        <>
        Landing page
        <Link to="/dashboard">CLICK ME!</Link>
        <button onClick={testRun} >Ping backend</button>
        </>
    )
}

export default LandingPage;