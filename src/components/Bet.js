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
      console.log(betContract);
      const event = await betContract.getEvent(id);
      console.log(event);
      setevent(event);
    }
    getEvent(id.id);
  }, []);
  const handleBet =async(id,team,amount)=>{
    const betContract = new ethers.Contract(
        BetContractAddress,
        BetABI,
        signer
      );
      console.log(signer)
      const bet = await betContract.placeBet(id,team,amount)
      console.log(bet)

  }
  return (
    <div>
        <br/>
        <br/>
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
  );
}
