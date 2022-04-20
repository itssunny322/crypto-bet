import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import DAIABI from "../abis/DAI.json";
import BetABI from "../abis/Bet.json";
import BetOracleABI from "../abis/BetOracle.json";

export default function BetHistory() {
  const [event, setEvent] = useState([]);
  const [bet, setBet] = useState();
  const [obj, setobj] = useState([]);
  const [count, setcount] = useState(0);
  const DAIContractAddress = process.env.REACT_APP_DAI_CONTRACT_ADDRESS;
  const BetContractAddress = process.env.REACT_APP_Bet_CONTRACT_ADDRESS;
  let b;
  const BetOracleContractAddress =
    process.env.REACT_APP_BetOracle_CONTRACT_ADDRESS;

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  let temp = [];
  useEffect(() => {
    async function getBets() {
      let eve = [];

      const betContract = new ethers.Contract(
        BetContractAddress,
        BetABI,
        signer
      );
      const bet = await betContract.fetchBetHistory();
      setBet(bet);
      

      for (let i = 0; i < bet.length; i++) {
        
        const match = await betContract.getEvent(bet[i].eventId);
        eve.push(match);
      }
      setEvent(eve);
    }

    getBets();
  

    //setEvent((event) => [...event, match]);
    
    
  }, []);
  useEffect(()=>{
    let s=[]

    for (let i = 0; i < event.length; i++) {
      let a= bet[i]
      console.log(a)
      let b = event[i]
      var food = Object.assign({}, a, b);
      s.push(food)
      //setobj((obj)=>[...obj,food])

    }
    setobj(s)
    

  },[event])
  return (
    <div>
      {console.log(obj)}
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Match</th>
            <th scope="col">Team</th>
            <th scope="col">Amount</th>
            <th scope="col">Result</th>
          </tr>
        </thead>

        <tbody>
          {obj &&
            obj.map((i) => {
              return (
                <tr>
                  <td>{i.name}</td>
                  <td>
                    {i.teamAname} vs {i.teamBname}
                  </td>
                  <td>{i.team ==0? i.teamAname: i.teamBname}</td>
                  <td>{ parseInt(i.amount._hex.slice(2), 16)}</td>
                  <td>{ i.outcome ==3 ? (i.winner==i.team ?"win": "lose"):("Result not declared")}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
      
    </div>
  );
}
