import React from "react";
import { useState,useEffect } from "react";
import { ethers } from "ethers";

import DAIABI from "../abis/DAI.json";
import BetABI from "../abis/Bet.json";
import BetOracleABI from "../abis/BetOracle.json";

export default function () {
    const [amount,setamount]=useState(0)
    const [acountDetail,setaccountDetail]= useState()
    const factor = 1000000000000000000;

    const DAIContractAddress = process.env.REACT_APP_DAI_CONTRACT_ADDRESS;
    const BetContractAddress = process.env.REACT_APP_Bet_CONTRACT_ADDRESS;
    const BetOracleContractAddress =
      process.env.REACT_APP_BetOracle_CONTRACT_ADDRESS;
  
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    useEffect(()=>{
        async function getDetail(){
            if(localStorage.getItem("account")!== null){
                let account = localStorage.getItem("account")
                const betContract = new ethers.Contract(BetContractAddress, BetABI, signer);
                const betOracleContract = new ethers.Contract(
                  BetOracleContractAddress,
                  BetOracleABI,
                  signer
                );
                const accountDetails = await betContract.userTokenBal(account);
                setaccountDetail(accountDetails)
            }
            else{
                alert("Please connect wallet")
                window.location.href= "/"
            }
        }
        getDetail();

    },[])
  const depositHandler = async (amount) => {
    let toWei = ethers.utils.formatEther(amount)
    console.log(toWei,amount)
    
    const daiContract = new ethers.Contract(DAIContractAddress, DAIABI, signer);
    console.log(BetContractAddress);
    console.log(DAIContractAddress);
    const approvetx = await daiContract.approve(BetContractAddress,amount );
    await approvetx.wait();
    console.log("Approval:", approvetx);

    const betContract = new ethers.Contract(BetContractAddress, BetABI, signer);
    const tx = await betContract.deposit(DAIContractAddress, amount);
    console.log("Deposit:", tx);
  };
  const WithdrawHandler = async(amount)=>{
      console.log("withdraw", amount)
      const daiContract = new ethers.Contract(DAIContractAddress, DAIABI, signer);
      console.log(BetContractAddress);
      console.log(DAIContractAddress);
      const betContract = new ethers.Contract(BetContractAddress, BetABI, signer);
      const tx = await betContract.withdrawAmount(amount);
      console.log("Withdraw:", tx);

  }
  const mode=(e)=>{
      if(e.target.value ==="Deposit"){
        depositHandler(amount)
      }
      if(e.target.value === "Withdraw"){
          WithdrawHandler(amount)
      }

  }
  return (
    <div className="depositCard">
      <h3>Deposit DAI</h3>
      <input type="number" placeholder="Amount in Wei"  onChange={(e)=>{setamount(e.target.value )}}/>
      <select onChange={(e)=>mode(e)} style={{height: 30}}>
          <option>Select</option>
          <option value="Deposit">Deposit</option>
          <option value="Withdraw">Withdraw</option>
      </select>
      {/* //<button onClick={() => depositHandler(amount)}>Deposit</button> */}
      <h2 >Account Detail</h2>
      <table class="table">
  <thead>
    <tr>
      <th scope="col">Balance Available</th>
      <th scope="col">Balance Lost</th>
      <th scope="col">Deposited Amount</th>
      <th scope="col">Balance Withdrawn</th>
      <th scope="col">Ongoing Bet Amount</th>
    </tr>
  </thead>
  <tbody>
      {console.log(acountDetail)}
    {/* <tr>
      <th scope="row">{acountDetail.balanceAvailable}</th>
      <td>{acountDetail.balanceLost}</td>
      <td>{acountDetail.balanceWithdrawn}</td>
      <td>{acountDetail.ongoingBetAmount}</td>
    </tr> */}
  </tbody>
</table>

    </div>
  );
}
