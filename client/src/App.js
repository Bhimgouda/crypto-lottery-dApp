import { useEffect, useState } from 'react';
import './App.css';
import { cryptoLotteryABI } from './cryptoLotteryABI';
import Web3 from 'web3';

function App() {
  let [web3,setWeb3] = useState();
  let [contract, setContract] = useState();
  let [currentAccount, setCurrentAccount] = useState();
  let [networkId, setNetworkId] = useState();
  let [participants, setParticpants] = useState([]);

  const contractAddress = "0xD87DEcb9976789e084d2c570a467Ff3E254d6Ed7";


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

  useEffect(()=>{
    if(!web3) return;

    async function getParticipants(){
      let allParticipants= [];
      for(let i=0; i<3; i++){
        const participant = await contract.methods.participants(i).call();
        if(participant !== "0x0000000000000000000000000000000000000000"){
          allParticipants.push(participant);
        }
      }
      setParticpants(allParticipants);
    }
    
    getParticipants()
    
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


  // const seeManagerAddress = async()=>{
  //   if(!contract) return;
  //   const manager = await contract.methods.manager().call();
  //   console.log(manager);
  // }

  const placeBet = async()=>{
    const value = web3.utils.toWei("0.1", "ether")
    try {
      const result = await web3.eth.sendTransaction({
        from: currentAccount,
        to: contractAddress,
        value
      })
      setParticpants([...participants, currentAccount]);

    } catch (error) {
      
    }
    
  }

  return (
    <>
    <div>
      <button onClick={placeBet}>Place Bet</button>
    </div>
    <div>
      {participants.map((p,index)=>(
        <li key={index}>{`Participant ${index+1}: ${p}`}</li>
      ))}
    </div>
    </>
  )

}

export default App;
