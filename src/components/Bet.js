import React from "react";
import { useParams } from "react-router-dom";
import { ethers, wordlists } from "ethers";

import DAIABI from "../abis/DAI.json";
import BetABI from "../abis/Bet.json";
import BetOracleABI from "../abis/BetOracle.json";
import { useEffect, useState } from "react";

export default function Bet() {
  const [event, setevent] = useState();
  const [team, setteam] = useState();
  const [amountToBet, setamount] = useState();
  const [tokens, setTokens] = useState([]);
  const [selectToken, setselectedtoken] = useState();

  const DAIContractAddress = process.env.REACT_APP_DAI_CONTRACT_ADDRESS;
  const BetContractAddress = process.env.REACT_APP_Bet_CONTRACT_ADDRESS;
  const BetOracleContractAddress =
    process.env.REACT_APP_BetOracle_CONTRACT_ADDRESS;

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const id = useParams();

  useEffect(() => {
    async function getEvent(id) {
      console.log(id);
      console.log(signer);
      const betContract = new ethers.Contract(
        BetContractAddress,
        BetABI,
        signer
      );
      const event = await betContract.getEvent(id);
      console.log(event);
      setevent(event);
      getTokens();
    }
    getEvent(id.id);
  }, []);

  const handleBet =async(id,team,amount)=>{
    const betContract = new ethers.Contract(
        BetContractAddress,
        BetABI,
        signer
      );
      const bet = await betContract.placeBet(id,team,amount)

  }

  const handleFlashBet =async(id,team,amount,selectToken)=>{
    const betContract = new ethers.Contract(
        BetContractAddress,
        BetABI,
        signer
      );
      console.log(id,team,amount,selectToken)
      const bet = await betContract.flashBet(id,team,amount,selectToken)
      console.log(bet)
    }

  const getTokens = async () => {
    const betContract = new ethers.Contract(BetContractAddress, BetABI, signer);
    const tokensnames = [];
    const tokens = await betContract.registerdTokens();
    for(let i=0;i<tokens.length;i++){
      const daiContract = new ethers.Contract(tokens[i], DAIABI, signer);
      const name = await daiContract.name();
      tokensnames.push(name);
    }
    setTokens(tokensnames);
  };    

  return (
    <div>
      <div>
        <br/>
        <br/>
        <h3>Bet</h3>
    {event &&
      <form > 
      <lebel>Select Team:</lebel>
      <select onChange={(e)=>{setteam(e.target.value)}}>
        <option> Select a team</option>
        <option value="0">{event.teamAname}</option>
        <option value="1">{event.teamBname}</option>
      </select>
      <br/>
      <br/>
      <label>Enetr Amount:</label>
      <input placeholder="Enter Amount" onChange={(e)=>{setamount(e.target.value)}}/>
      
    </form>}
    <br/>
    <br/>
    <button className="btn btn-primary" type="submit" onClick={()=>{handleBet(id.id,team,amountToBet)}}>Submit</button>
    </div>

    <div>
        <br/>
        <br/>
        <h3>FlashBet</h3>
    {event &&
      <form > 
      <lebel>Select Team:</lebel>
      <select onChange={(e)=>{setteam(e.target.value)}}>
        <option> Select a team</option>
        <option value="0">{event.teamAname}</option>
        <option value="1">{event.teamBname}</option>
      </select>
      <br/>
      <br/>
      <lebel>Select Token:</lebel>
      <select onChange={(e)=>{setselectedtoken(e.target.value)}}>
        <option> Select a token</option>
        {tokens.map((token,index)=>{
          return <option value={index}>{token}</option>
        })}
      </select>
      <br/>
      <br/>
      <label>Enetr Amount:</label>
      <input placeholder="Enter Amount" onChange={(e)=>{setamount(e.target.value)}}/>
      
    </form>}
    <br/>
    <br/>
    <button className="btn btn-primary" type="submit" onClick={()=>{handleFlashBet(id.id,team,amountToBet,selectToken)}}>Submit</button>
    </div>
    
    </div>
  );
}
