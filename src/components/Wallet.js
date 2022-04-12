import React from "react";
import { useState,useEffect } from "react";
import { ethers } from "ethers";

import DAIABI from "../abis/DAI.json";
import BetABI from "../abis/Bet.json";

export default function () {
    const [amount,setamount]=useState(0)
    const [acountDetail,setaccountDetail]= useState([])
    const [depositedAmount,setDepositedAmount]=useState(0)
    const [balanceLost,setBalanceLost]=useState(0)
    const [balanceAvailable,setBalanceAvailable]=useState(0)
    const [balanceWithdrawn,setBalanceWithdrawn]=useState(0)
    const [ongoingBetAmount,setOngoingBetAmount]=useState(0)

    const factor = 1000000000000000000;

    const DAIContractAddress = process.env.REACT_APP_DAI_CONTRACT_ADDRESS;
    const BetContractAddress = process.env.REACT_APP_Bet_CONTRACT_ADDRESS;


    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    useEffect(()=>{
        async function getDetail(){
            if(localStorage.getItem("account")!== null){
                let account = localStorage.getItem("account")
                const betContract = new ethers.Contract(BetContractAddress, BetABI, signer);
                const accountDetails = await betContract.userTokenBal(account);
                setaccountDetail(accountDetails)
            }
            else{
                alert("Please connect wallet")
                window.location.href= "/"
            }
        }
        getDetail();
        setBalanceDetails();

    },[])

  const depositHandler = async (amount) => {
    let toWei = ethers.utils.formatEther(amount)
    const daiContract = new ethers.Contract(DAIContractAddress, DAIABI, signer);
    const approvetx = await daiContract.approve(BetContractAddress,amount );
    await approvetx.wait();

    const betContract = new ethers.Contract(BetContractAddress, BetABI, signer);
    const tx = await betContract.deposit(DAIContractAddress, amount);
  };

  const WithdrawHandler = async(amount)=>{
      const daiContract = new ethers.Contract(DAIContractAddress, DAIABI, signer);
      const betContract = new ethers.Contract(BetContractAddress, BetABI, signer);
      const tx = await betContract.withdrawAmount(amount);

  }
  const mode=(e)=>{
      if(e.target.value ==="Deposit"){
        depositHandler(amount)
      }
      if(e.target.value === "Withdraw"){
          WithdrawHandler(amount)
      }

  }

  const setBalanceDetails = async () => {
    let account = localStorage.getItem("account")
    const betContract = new ethers.Contract(BetContractAddress, BetABI, signer);
    const accountDetails = await betContract.userTokenBal(account);
    setaccountDetail(accountDetails)

    if(accountDetails[0] === undefined){
      console.log("undefined")
  }
  else{
    console.log("everything is defined")
      setDepositedAmount(parseInt((accountDetails[0]._hex).slice(2), 16))
      setBalanceAvailable(parseInt((accountDetails[1]._hex).slice(2), 16))
      setBalanceLost(parseInt((accountDetails[2]._hex).slice(2), 16))
      setBalanceWithdrawn(parseInt((accountDetails[3]._hex).slice(2), 16))
      setOngoingBetAmount(parseInt((accountDetails[4]._hex).slice(2), 16))

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
      <th scope="col">Deposited Amount</th>
      <th scope="col">Balance Lost</th>
      <th scope="col">Balance Available</th>
      <th scope="col">Balance Withdrawn</th>
      <th scope="col">Ongoing Bet Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">{depositedAmount}</th>
      <td>{balanceLost}</td>
      <td>{balanceAvailable}</td>
      <td>{balanceWithdrawn}</td>
      <td>{ongoingBetAmount}</td>
    </tr>
  </tbody>
</table>
    </div>
  );
}
