import React, { useState } from 'react'
import { ethers } from 'ethers'


const Home = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const [defaultAccount, setDefaultAccount] = useState(null)
  const [userBalance, setUserBalance] = useState(null)
  const [connButtonText, setConnButtonText] = useState('Connect Wallet')
  const poolContractAddress = process.env.REACT_APP_POOL_CONTRACT_ADDRESS
  const daiContractAddress = process.env.REACT_APP_DAI_CONTRACT_ADDRESS

  const connectWalletHandler = async () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      console.log('MetaMask Here!')

      window.ethereum
        .request({ method: 'eth_requestAccounts' })
        .then((result) => {
          setDefaultAccount(result[0])
          setConnButtonText('Wallet Connected')
          getAccountBalance(result[0])
          getDepositorInfo()
          getBorrowerInfo()
          getLoansInfo()
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
      </div>
    </div>
  );
};

export default Home;