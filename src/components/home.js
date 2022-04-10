import React, { useState } from 'react'
import { ethers } from 'ethers'

import DAIABI from '../abis/DAI.json'
import BetABI from '../abis/Bet.json'
import BetOracleABI from '../abis/BetOracle.json'


const Home = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const [defaultAccount, setDefaultAccount] = useState(null)
  const [userBalance, setUserBalance] = useState(null)
  const [userDAIbalance, setuserDAIbalance] = useState(null)
  const [connButtonText, setConnButtonText] = useState('Connect Wallet')
  const [allBettableEvents, setAllBettableEvents] = useState([])

  const DAIContractAddress = process.env.REACT_APP_DAI_CONTRACT_ADDRESS
  const BetContractAddress = process.env.REACT_APP_Bet_CONTRACT_ADDRESS
  const BetOracleContractAddress = process.env.REACT_APP_BetOracle_CONTRACT_ADDRESS

  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  const connectWalletHandler = async () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      console.log('MetaMask Here!')

      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((result) => {
          setDefaultAccount(result[0])
          setConnButtonText('Wallet Connected')
          getAccountBalance(result[0])
          showBalance()
          showBettableEvents()
        })
        .catch((error) => {
          setErrorMessage(error.message)
        })
    } else {
      console.log('Need to install MetaMask')
      setErrorMessage('Please install MetaMask browser extension to interact')
    }
  }

  // update account, will cause reload the page
  const accountChangedHandler = () => {
    window.location.reload()
  }

  const getAccountBalance = (account) => {
    window.ethereum
      .request({ method: 'eth_getBalance', params: [account, 'latest'] })
      .then((balance) => {
        setUserBalance(ethers.utils.formatEther(balance))
      })
      .catch((error) => {
        setErrorMessage(error.message)
      })
  }

  const chainChangedHandler = () => {
    // reload the page to avoid any errors with chain change mid use of application
    window.location.reload()
  }

  const showBalance = async () => {
    await provider.send('eth_requestAccounts', [])
    const signerAddress = await signer.getAddress()
    const daiContract = new ethers.Contract(DAIContractAddress, DAIABI, signer)
    const balance = await daiContract.balanceOf(signerAddress)
    setuserDAIbalance(ethers.utils.formatEther(balance))
    console.log('Balance:', balance)
  }

  const showBettableEvents = async () => {
    const betContract = new ethers.Contract(
      BetContractAddress,
      BetABI,
      signer
    )
    const betOracleContract = new ethers.Contract(
      BetOracleContractAddress,
      BetOracleABI,
      signer
    )
    const events = await betContract.getBettableEvents()
    console.log('Events:', events)
    setAllBettableEvents(events)
  }

  const showEventDetails = async (eventId) => {
    const betContract = new ethers.Contract(
      BetContractAddress,
      BetABI,
      signer
    )
    const betOracleContract = new ethers.Contract(
      BetOracleContractAddress,
      BetOracleABI,
      signer
    )
    const event = await betContract.getEvent(eventId)
    const eventDetails = await betOracleContract.getEventDetails(eventId)
    console.log('Event:', event)
    console.log('Event Details:', eventDetails)
  }  

  // listen for account changes
  window.ethereum.on('accountsChanged', accountChangedHandler)

  window.ethereum.on('chainChanged', chainChangedHandler)

  return (
    <div className="home">
      <h1>Circle Bet</h1>

      <div className="walletCard">
        <button onClick={connectWalletHandler}>{connButtonText}</button>
        <div className="accountDisplay">
          <h3>Address: {defaultAccount}</h3>
        </div>
        <div className="balanceDisplay">
          <h3>Balance (Eth): {userBalance}</h3>
        </div>
        <div className="balanceDisplay">
          <h3>Balance (DAI): {userDAIbalance}</h3>
        </div>
      </div>

      <div className="eventsDisplay">
        <h3>Bettable Events</h3>
        <ul>
          {allBettableEvents.map((event) => {
            return (
              <li key={event.id}>
                <button onClick={() => showEventDetails(event.id)}>
                  {event.name}
                  {event.id}
                  {event.date}
                  {event.teamAname}
                  {event.teamBname}
                  {event.outcome}
                  {event.winner}
                </button>

              </li>
            )
          })}
        </ul>
      </div>


    </div>
  );
};

export default Home;