import React,{useEffect,useState} from 'react'
import { ethers } from "ethers";
import ReCAPTCHA from "react-google-recaptcha";




import DAIABI from "../abis/DAI.json";
import BetABI from "../abis/Bet.json";
import BetOracleABI from "../abis/BetOracle.json";

export default function DeclareResult() {
  const [errorMessage, setErrorMessage] = useState(null);
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [userDAIbalance, setuserDAIbalance] = useState(null);
  const [connButtonText, setConnButtonText] = useState("Connect Wallet");
  const [allBettableEvents, setAllBettableEvents] = useState([]);
  const [eventDetail, setEventDetail] = useState([]);
  const[winner,setwinner]=useState()
  const [captch,setcaptch]=useState(false)



  const DAIContractAddress = process.env.REACT_APP_DAI_CONTRACT_ADDRESS;
  const BetContractAddress = process.env.REACT_APP_Bet_CONTRACT_ADDRESS;
  const BetOracleContractAddress =
    process.env.REACT_APP_BetOracle_CONTRACT_ADDRESS;

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  localStorage.setItem("signer",signer)

  useEffect(() => {
    showBettableEvents();  
    localStorage.setItem("account", defaultAccount);
    console.log(signer);
    for (let i = 0; i < allBettableEvents.length; i++) {
      showEventDetails(allBettableEvents[i]);
    }
    console.log("running")
    
  }, [captch]);

  const verifyCallback=(response)=>{
    if(response){
      setcaptch(true)
    }
  }

 

  const connectWalletHandler = async () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      console.log("MetaMask Here!");

      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((result) => {
          setDefaultAccount(result[0]);
          setConnButtonText("Wallet Connected");
          getAccountBalance(result[0]);
          showBalance();
          showBettableEvents();
        })
        .catch((error) => {
          setErrorMessage(error.message);
        });
    } else {
      console.log("Need to install MetaMask");
      setErrorMessage("Please install MetaMask browser extension to interact");
    }
  };

  // update account, will cause reload the page
  const accountChangedHandler = () => {
    window.location.reload();
  };

  const getAccountBalance = (account) => {
    window.ethereum
      .request({ method: "eth_getBalance", params: [account, "latest"] })
      .then((balance) => {
        setUserBalance(ethers.utils.formatEther(balance));
      })
      .catch((error) => {
        setErrorMessage(error.message);
      });
  };

  const chainChangedHandler = () => {
    // reload the page to avoid any errors with chain change mid use of application
    window.location.reload();
  };
  const handleDeclare=async(winner,id)=>{
      console.log(winner,id)
      const betOracleContract = new ethers.Contract(
        BetOracleContractAddress,
        BetOracleABI,
        signer
      );
      const res = await betOracleContract.declareOutcome(id,3,winner)
      console.log(res)

  }

  const showBalance = async () => {
    await provider.send("eth_requestAccounts", []);
    const signerAddress = await signer.getAddress();
    const daiContract = new ethers.Contract(DAIContractAddress, DAIABI, signer);
    const balance = await daiContract.balanceOf(signerAddress);
    setuserDAIbalance(ethers.utils.formatEther(balance));
    console.log("Balance:", balance);
  };

  const showBettableEvents = async () => {
    const betContract = new ethers.Contract(BetContractAddress, BetABI, signer);
    const events = await betContract.getBettableEvents();
    console.log(events)
    setAllBettableEvents(events);
    
  };

  const showEventDetails = async (eventId) => {
    const betContract = new ethers.Contract(BetContractAddress, BetABI, signer);
    const betOracleContract = new ethers.Contract(
      BetOracleContractAddress,
      BetOracleABI,
      signer
    );
    const event = await betContract.getEvent(eventId);
    //setArray(oldArray => [...oldArray,newValue] );
    setEventDetail((eventDetail) => [...eventDetail, event]);
  };

  // listen for account changes
  window.ethereum.on("accountsChanged", accountChangedHandler);

  window.ethereum.on("chainChanged", chainChangedHandler);

  return (
    <div className="home">
      
        {!captch&&
               <ReCAPTCHA
               sitekey="6LeBO7UcAAAAANpF1DGPjIhK0HjLJvgiQVHKS0in"
               onChange={verifyCallback}
               style={{textAlign:"center"}}
             />}

      <h1>Declare Result</h1>

      {/* <div className="walletCard">
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
      </div> */}

      <div>
        <h3>Events</h3>
        <ul>
          <table class="table">
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Teams</th>
                <th scope="col">Select Winner</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {eventDetail.map((e) => {
                return (
                  <tr key={e.eventId}>
                    <td>{e.name}</td>
                    <td>
                      {e.teamAname} VS {e.teamBname}
                    </td>
                    <td>
                        <select onChange={(e)=>{setwinner(e.target.value)}}>
                            <option > Choose winner</option>
                            <option value="1">{e.teamAname}</option>
                            <option value="2">{e.teamBname}</option>
                        </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          handleDeclare(winner,e.id)
                        }}
                      >
                        Declare
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ul>
      </div>
    </div>
  );
};

