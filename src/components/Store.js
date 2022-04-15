// create a basic functional component to render a array
import React, { useEffect } from "react";
import { useState } from "react";
import { ethers } from "ethers";

import BetABI from "../abis/Bet.json";
import DAIABI from "../abis/DAI.json";

export default function () {
    const BetContractAddress = process.env.REACT_APP_Bet_CONTRACT_ADDRESS;
    const DAIContractAddress = process.env.REACT_APP_DAI_CONTRACT_ADDRESS;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const [tokens, setTokens] = useState([]);
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState(0);
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        getTokens();
    }, []);

    const getTokens = async () => {
        const betContract = new ethers.Contract(BetContractAddress, BetABI, signer);
        const tokens = await betContract.registerdTokens();
        setTokens(tokens);
    };

    const getTokenDetails = async (tokenAddress) => {
        const daiContract = new ethers.Contract(tokenAddress, DAIABI, signer);
        const balance = await daiContract.balanceOf(BetContractAddress);
        const name = await daiContract.name();
        const symbol = await daiContract.symbol();
        setBalance(parseInt((balance._hex).slice(2), 16));
        setName(name);
        setSymbol(symbol);
    };


    return (
        <div>
            <h1>List of tokens Available</h1>
            <ul>
                {tokens.map((token, index) => {
                    return (
                        <li key={index}>
                            <h3>{token}</h3>
                            <button onClick={() => getTokenDetails(token)}>Get Details</button>
                            <ul>
                                <li>{name}</li>
                                <li>{symbol}</li>
                                <li>{balance}</li>
                            </ul>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
