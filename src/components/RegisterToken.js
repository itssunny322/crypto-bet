import React, { useState } from 'react'
import { ethers } from "ethers";

import DAIABI from "../abis/DAI.json";
import BetABI from "../abis/Bet.json";
import BetOracleABI from "../abis/BetOracle.json";

export default function AddToken() {
    const[address,setAddress]=useState()
    const DAIContractAddress = process.env.REACT_APP_DAI_CONTRACT_ADDRESS;
    const BetContractAddress = process.env.REACT_APP_Bet_CONTRACT_ADDRESS;
    const BetOracleContractAddress =
      process.env.REACT_APP_BetOracle_CONTRACT_ADDRESS;
  
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const handleClick=async(address)=>{
        console.log("submit")
        const betContract = new ethers.Contract(
          BetContractAddress,
          BetABI,
          signer
        );
        const res = await betContract.registerNewToken(address)
        console.log(res)
  
    }

  return (
    <div>
        <h3>Register token</h3>
        <div style={{border:'1px solid black'}} className='container'>
        <br/>
            <form>
                <input placeholder='Enter token address' onChange={(e)=>{setAddress(e.target.value)}}/>
            </form>
            <br/>
            <button className='btn btn-primary' onClick={()=>{handleClick(address)}}>Add</button>
            <br/>
            <br/>
        </div>
    </div>
  )
}
