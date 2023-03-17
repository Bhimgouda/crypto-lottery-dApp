import { useEffect, useState } from 'react';
import './App.css';
import { cryptoLotteryABI } from './cryptoLotteryABI';
import Web3 from 'web3';
import Participants from './components/Participants';

function App() {
  let [web3,setWeb3] = useState();
  let [contract, setContract] = useState();
  let [currentAccount, setCurrentAccount] = useState();
  let [networkId, setNetworkId] = useState();
  let [participants, setParticpants] = useState([]);
  let [minValue, setMinValue] = useState();

  const contractAddress = "0x188122714b47E78c39A283DFea6De89b1755C5A9";


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
      let newContract= new web3Instance.eth.Contract(cryptoLotteryABI, contractAddress);
      setContract(newContract);
    }

    instantiate()
  },[])


// To get Initial Participants and min-value to participate in lottery
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

  // Monitoring changes with web3
  useEffect(()=>{
    if(!web3) return;

    // To moniter users account switch
    window.ethereum.on("accountsChanged", (accounts)=>{
      setCurrentAccount(accounts[0])
      console.log(accounts[0]) // Update
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
    const value = web3.utils.toWei("0.1", "ether")
    try {
      const result = await web3.eth.sendTransaction({
        from: currentAccount,
        to: contractAddress,
        value
      })

      if(participants.length < 2){
        setParticpants([...participants, currentAccount]);
      }
      else setParticpants([]);

    } catch (error) {
      
    }
    
  }

  return (
    <main className='app'>
      <img className='headline-image' src="/images/Try-your-Luck-3-17-2023.png"/>
      <Participants participants={participants} />
      <div>
        <button className='btn btn--bet' onClick={placeABet}>Place a Bet of {minValue} Ether</button>
      </div>
    </main>
  )

}

export default App;
