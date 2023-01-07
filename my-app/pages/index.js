import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useEffect, useRef, useState } from 'react';
import Web3Modal from "web3modal";
import { providers, Contract } from "ethers";
import { WHITELIST_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [numOfWhitelisted, setNumOfWhitelisted] = useState(0);
  const [joinedWhiteList , setJoinedWhitelist] = useState(false)
  const [loading, setLoading] = useState(false)
  const web3ModalRef = useRef();
  const getProviderOrSigner = async(needSigner = false) => {
    try{
      const provider = await web3ModalRef.current.connect(); //only read provider
      const web3Provider = new providers.Web3Provider(provider);
      const {chainId} = await web3Provider.getNetwork();
      if (chainId !== 5) {
        window.alert("Change the network to Goerli");
        throw new Error("Change network to Goerli");
      }
      if(needSigner){
        const signer  = web3Provider.getSigner();
        console.log("connect p and s")
        return signer;
      }
      console.log("connect p and s")
      return web3Provider;
    }catch(err){
      console.log(err);
    }
  };

const addAddressToWhitelist = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // call the addAddressToWhitelist from the contract
      const tx = await whitelistContract.addAddressToWhitelist();
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      // get the updated number of addresses in the whitelist
      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    } catch (err) {
      console.error(err);
    }
  };

  const checkIfAddressIsWhitelisted = async () =>{
    try{
      const signer = getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );

      const address = await signer.getAddress();
      const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
        address
      );
      setJoinedWhitelist(_joinedWhitelist)
    }catch(err){

    }
  }

  const getNumberOfWhitelisted = async () => {
    try {
      const provider = await getProviderOrSigner();

      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );

      console.log("contract connect")
      const _numberOfWhitelisted =
        await whitelistContract.numAddressesWhitelisted();
        console.log("contract connecesdcccct")

        setNumOfWhitelisted(_numberOfWhitelisted);
    } catch (err) {
      console.error(err);
    }
  };

  const renderButton = ()=>{
    if(walletConnected){
      if(joinedWhiteList){
        return(
          <div className={styles.description}>
          Thanks for joining whitelist
        </div>
        )
      } else if(loading){
          return (
            <button className={styles.button}>
              Loading ...
            </button>
          )
      }
      else{
        return (
          <button onClick={addAddressToWhitelist} className={styles.button}>
            Join The Whitelist
          </button>
        )
      }
    }else{
      <button onClick={connectWallet} className={styles.button}>
        Connect Your Wallet
      </button>
    }
  }

  const connectWallet = async ()=>{
    try{
      await getProviderOrSigner();
      setWalletConnected(true);
      checkIfAddressIsWhitelisted();
      getNumberOfWhitelisted();
    }catch(err){
      console.log(err);
    }
  }
  useEffect(() => {
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnected])
  
  return (
    <div>
      <Head>
        <title>WhiteList Dapp</title>
        <meta name="description" content='Whitelist-Dapp'/>
      </Head>
      <div className={styles.main}>
        <h1 className={styles.title}>
          Welcome To Crypto Devs
        </h1>
        <div className={styles.description}>
          {numOfWhitelisted} have already joined the whitelist
        </div>
        {renderButton()}
        <div>
          <img className={styles.image} src="./crypto-devs.svg"/>
        </div>
      </div>
      <footer className={styles.footer}>
        Made with by &#10084; Crypto Devs
      </footer>
    </div>
  )
}
