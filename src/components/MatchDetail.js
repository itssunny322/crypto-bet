import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ethers, wordlists } from "ethers";
import { Link } from "react-router-dom";

import DAIABI from "../abis/DAI.json";
import BetABI from "../abis/Bet.json";
import BetOracleABI from "../abis/BetOracle.json";

export default function MatchDetail(props) {
  const [oddA, setOddA] = useState(0);
  const [oddB, setOddB] = useState(0);
  const [event, setevent] = useState();

  const DAIContractAddress = process.env.REACT_APP_DAI_CONTRACT_ADDRESS;
  const BetContractAddress = process.env.REACT_APP_Bet_CONTRACT_ADDRESS;
  const BetOracleContractAddress =
    process.env.REACT_APP_BetOracle_CONTRACT_ADDRESS;

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const id = useParams();

  useEffect(() => {
    const showbetOdds = async (eventId) => {
      const betOracleContract = new ethers.Contract(
        BetContractAddress,
        BetABI,
        signer
      );
      const betOddsA = await betOracleContract.getOddsA(eventId);
      const a = parseInt(betOddsA._hex.slice(2), 16);
      const realvalA = a / 100;
      setOddA(realvalA);
      const betOddsB = await betOracleContract.getOddsB(eventId);
      const b = parseInt(betOddsB._hex.slice(2), 16);
      const realvalB = b / 100;
      setOddB(realvalB);
      const event = await betOracleContract.getEvent(eventId);
      console.log(event);
      setevent(event);
    };
    showbetOdds(id.id);
  }, []);

  return (
    <div>
      {console.log("oddA", oddA, "oddB", oddB, "id", id, event)}
      <h2>Match Detail</h2>
      {event && oddA &&
      <table class="table">
      <thead>
        <tr>
          <th scope="col">Category</th>
          <th scope="col">Teams</th>
          <th scope="col">oddA</th>
          <th scope="col">oddB</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        <tr>
            <td>{event.name}</td>
            <td>{event.teamAname} VS {event.teamBname}</td>
            <td>{oddA}</td>
            <td>{oddB}</td>
            <button className="btn btn-success"><Link to={"/bet/"+event.id} className="btn btn-success" >Bet</Link></button>
        </tr>
        
      </tbody>
    </table>
      }

    </div>
  );
}
