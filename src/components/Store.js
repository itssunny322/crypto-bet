// create a basic functional component to render a array
import React, { useEffect } from "react";
import { useState } from "react";
import { ethers } from "ethers";

import BetABI from "../abis/Bet.json";
import DAIABI from "../abis/DAI.json";
import ReCAPTCHA from "react-google-recaptcha";

export default function () {
    const BetContractAddress = process.env.REACT_APP_Bet_CONTRACT_ADDRESS;
    const DAIContractAddress = process.env.REACT_APP_DAI_CONTRACT_ADDRESS;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const [tokens, setTokens] = useState([]);
    const [name, setName] = useState([]);
    const [symbol, setSymbol] = useState([]);
    const [balance, setBalance] = useState([]);
    const [captch,setcaptch]=useState(false)
    const[obj,setobj]=useState([])
    

    useEffect(() => {
        getTokens();
        for(let i=0;i<= tokens.length;i++){
            getTokenDetails(tokens[i])
        }
       
    },[captch]);
    useEffect(()=>{
        let s=[]
        for (let i = 0; i < tokens.length; i++) {
            let a= tokens[i]
       
            getTokenDetails(a).then(function(res){return res}).then(function(data){s=data
                let o={};
            o["token"]=a;
            let bal = parseInt((data.bal._hex).slice(2), 16)
            let symbol = data.symbol
            let name= data.name
            o["bal"]=bal;
            o["name"]=name;
            o["symbol"]=symbol;
            setobj((obj)=>[...obj,o])
    }) 
    
        }
        
          
    
      },[captch])

  const verifyCallback=(response)=>{
    if(response){
      setcaptch(true)
    }
  }


    const getTokens = async () => {
        const betContract = new ethers.Contract(BetContractAddress, BetABI, signer);
        const token = await betContract.registerdTokens();
        setTokens(token);
    };

    const getTokenDetails = async (tokenAddress) => {
        
        const daiContract = new ethers.Contract(tokenAddress, DAIABI, signer);
        const balance = await daiContract.balanceOf(BetContractAddress);
        const name = await daiContract.name();
        const symbol = await daiContract.symbol();
        setBalance(parseInt((balance._hex).slice(2), 16));
        setName(name);
        setSymbol(symbol);
        const res={"name":name,"symbol":symbol,"bal":balance}
        return res
    };


    return (
        <div>
               {!captch&&
               <ReCAPTCHA
               sitekey="6LeBO7UcAAAAANpF1DGPjIhK0HjLJvgiQVHKS0in"
               onChange={verifyCallback}
               style={{textAlign:"center"}}
             />}
             
          {obj && captch && <table class="table">
            <thead>
              <tr>
                <th scope="col">Token</th>
                <th scope="col">Name</th>
                <th scope="col">Symbol</th>
                <th scope="col">Balance</th>
              </tr>
            </thead>
            <tbody>
                {obj.map(i=>{
                    return(
                        <tr key={i}>
                            <td>{i.token}</td>
                            <td>{i.name}</td>
                            <td>{i.symbol}</td>
                            <td>{i.bal}</td>
                        </tr>
                    )
                })}
                </tbody>
                </table>}

            
        </div>
    );
}
