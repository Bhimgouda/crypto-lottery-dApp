import { useEffect, useState } from 'react';
import './App.css';
import { cryptoLotteryABI } from './cryptoLotteryABI';
import Web3 from 'web3';
import Participants from './components/Participants';
import { CSSProperties } from "react";
import PulseLoader from "react-spinners/PulseLoader";

const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};


function App() {
  let [web3,setWeb3] = useState();
  let [contract, setContract] = useState();
  let [currentAccount, setCurrentAccount] = useState();
  let [networkId, setNetworkId] = useState(0)
  let [participants, setParticpants] = useState([]);
  let [minValue, setMinValue] = useState();
  let [loading, setLoading] = useState(false);
  let [color, setColor] = useState("#ffffff");
  let [winner, setWinner] = useState();

  const contractAddress = "0x08B3445A1dc4F3ac7fEb048b1a4d91c965DDfB8c";


  useEffect(()=>{
    async function instantiate(){

      // Checking for metamask and instantiate current web3 provider like infura
      if(!window.ethereum) return;

      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance)

      // Request account access from the user
      window.ethereum
      .request({ method: 'eth_requestAccounts' })
      .then((accounts) => {
        setCurrentAccount(accounts[0]);
      })

      // Get networkId from user
      window.ethereum
      .request({method: "eth_chainId"})
      .then((chainId)=>{
        setNetworkId(chainId)
      })

      // Instantiate the contract with the ABI and address
      let newContract = new web3Instance.eth.Contract(cryptoLotteryABI, contractAddress);
      setContract(newContract);

    }

    instantiate()
  },[])


// To get Initial Participants, subscribing to events and min-value to participate in lottery
  useEffect(()=>{
    if(!contract) return;

    async function getParticipants(){
      const totalPlayers = await contract.methods.playersAdded().call();

      let allParticipants= [];
      for(let i=0; i<totalPlayers; i++){
        const participant = await contract.methods.participants(i).call();
        if(participant !== "0x0000000000000000000000000000000000000000"){
          allParticipants.push(participant);
        }
      }
      setParticpants(allParticipants);
    }

    async function getMinValue(){
      let value = await contract.methods.minValue().call();
      value = web3.utils.fromWei(value, "ether");
      setMinValue(value);
    }
    
    getMinValue();
    getParticipants();
    
  },[web3]);


  // Subscribing to events
  useEffect(()=>{
    if(!contract) return;

    contract.events.DeclareWinner()
    .on("connected", (id)=>{
      console.log("connected");
    })
    .on("data", (data)=>{
      let winner = data.returnValues;
      setWinner({address: winner.winnerAddress, participantNumber: winner.winnerIndex, winningAmount: web3.utils.fromWei(winner.winningAmount, "ether")})
    })
    .on("error", (error)=>{
      console.log(error);
    })
  }, [web3, participants, minValue, winner])


  // Monitoring changes with web3
  useEffect(()=>{
    if(!web3) return;

    // To moniter users account switch
    window.ethereum.on("accountsChanged", (accounts)=>{
      setCurrentAccount(accounts[0])
    })

    // To moniter network change
    window.ethereum.on("chainChanged", (chainId)=>{
      setNetworkId(chainId);
      console.log(chainId)
    })

  },[web3]);


  const seeManagerAddress = async()=>{
    if(!contract) return;
    const manager = await contract.methods.manager().call();
    console.log(manager);
  }

  const placeABet = async()=>{
    setLoading(true);
    const value = web3.utils.toWei("0.1", "ether")
    try {
      const result = await web3.eth.sendTransaction({
        from: currentAccount,
        to: contractAddress,
        value
      })
      setParticpants([...participants, currentAccount]);
    } catch (error) {
      console.log(error)
    }

    setLoading(false);
  }

  return (
    <main className='app'>
      <img className='headline-image' src="/images/headline.png"/>
      <section className='app__body'>
      <Participants participants={participants} loading={loading} color="#36d7b7" />
        <p style={{"color": "black"}}>*The Lottery will start as soon as 3rd player place's the bet</p>
          <button disabled={loading ? "true" : ""} className='btn btn--bet' onClick={placeABet}>
            <span style={{"marginRight":"21px"}}>Place a Bet of {minValue} Ether</span> 
          </button>
      </section>
      {winner ? 
          <section className={`app__winner app__overlay`}>
            <p className='app__winner-participant'>{`Participant ${parseInt(winner.participantNumber)+1} wins the Lottery`}</p>
            <p>{`${winner.winningAmount} ether has been transferred to his address - ${winner.address}`}</p>
            <button onClick={()=>window.location.reload()} className='btn'>ENTER IN A NEW ROUND</button>
          </section>
          :
          null
      }
    </main>
  )

}

export default App;
