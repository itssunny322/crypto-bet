import React ,{useState}from "react";
import AddEvent from "./AddEvent";
import DeclareResult from "./DeclareResult";
import AddToken from "./RegisterToken";
export default function AdminPage() {
    const [addEvent,setaddEvent]=useState(false)
    const [addResult,setaddResult]=useState(false)
    const [addToken,setaddToken]=useState(false)
  return (
    <div >
        <br/>
      <div className="container" >
        <div className="row" style={{ marginBottom:"3px"}}>
          <div class="col-sm" onClick={()=>{setaddEvent(!addEvent)}}>Add Event</div>
          <div class="col-sm"onClick={()=>{setaddResult(!addResult)}}>Declare Winner</div>
          <div class="col-sm"onClick={()=>{setaddToken(!addToken)}}>Register Token</div>
        </div>
      </div>
      {addEvent &&
      <AddEvent/>}
         {addResult &&
      <DeclareResult/>}
         {addToken &&
      <AddToken/>}

    </div>
  );
}
