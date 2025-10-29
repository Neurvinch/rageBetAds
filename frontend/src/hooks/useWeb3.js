// import { useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import { NETWORKS } from '../config/contracts';
// import {useWalletClient,useAccount} from "wagmi";

// export function useWeb3() {
//   const [account, setAccount] = useState(null);
//   const {data: walletClient} = useWalletClient()
//   const{address, isConnected} = useAccount();
//   const [provider, setProvider] = useState(null);
//   const [signer, setSigner] = useState(null);
//   const [chainId, setChainId] = useState(null);
//   const [isConnecting, setIsConnecting] = useState(false);
//   const [error, setError] = useState(null);

//   // Check if wallet is already connected
//   useEffect(() => {
//     if (window.ethereum) {
//       window.ethereum
//         .request({ method: 'eth_accounts' })
//         .then((accounts) => {
//           if (accounts.length > 0) {
//             connectWallet();
//           }
//         });

//       // Listen for account changes
//       window.ethereum.on('accountsChanged', handleAccountsChanged);
//       window.ethereum.on('chainChanged', handleChainChanged);

//       return () => {
//         window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
//         window.ethereum.removeListener('chainChanged', handleChainChanged);
//       };
//     }
//   }, []);

//   const handleAccountsChanged = (accounts) => {
//     if (accounts.length === 0) {
//       disconnect();
//     } else {
//       setAccount(accounts[0]);
//     }
//   };

//   const handleChainChanged = () => {
//     window.location.reload();
//   };

//   const connectWallet = async () => {
//     if (!window.ethereum) {
//       setError('MetaMask is not installed. Please install it to use this app.');
//       return;
//     }

//     try {
//       setIsConnecting(true);
//       setError(null);

//       // Request account access
//       const accounts = await window.ethereum.request({
//         method: 'eth_requestAccounts',
//       });

//       // Create provider and signer
//       const web3Provider = new ethers.BrowserProvider(walletClient);
//       const web3Signer = await web3Provider.getSigner();
//       const network = await web3Provider.getNetwork();

//       setAccount(accounts[0]);
//       setProvider(web3Provider);
//       setSigner(web3Signer);
//       setChainId(network.chainId.toString());
//     } catch (err) {
//       console.error('Error connecting wallet:', err);
//       setError(err.message);
//     } finally {
//       setIsConnecting(false);
//     }
//   };

//   const disconnect = () => {
//     setAccount(null);
//     setProvider(null);
//     setSigner(null);
//     setChainId(null);
//   };

//   const switchNetwork = async (networkName) => {
//     const network = NETWORKS[networkName];
//     if (!network) {
//       setError('Network not supported');
//       return;
//     }

//     try {
//       await window.ethereum.request({
//         method: 'wallet_switchEthereumChain',
//         params: [{ chainId: network.chainId }],
//       });
//     } catch (switchError) {
//       // This error code indicates that the chain has not been added to MetaMask
//       if (switchError.code === 4902) {
//         try {
//           await window.ethereum.request({
//             method: 'wallet_addEthereumChain',
//             params: [network],
//           });
//         } catch (addError) {
//           setError('Failed to add network');
//         }
//       } else {
//         setError('Failed to switch network');
//       }
//     }
//   };

//   // Function to listen for MarketCreated event
//   const listenForMarketCreated = (contract) => {
//     contract.on('MarketCreated', (marketId, matchId, team1, team2, aiTrashTalk, endTime) => {
//       console.log('MarketCreated event detected:', {
//         marketId: marketId.toString(),
//         matchId,
//         team1,
//         team2,
//         aiTrashTalk,
//         endTime: new Date(endTime * 1000).toISOString(),
//       });
//     });
//   };

//   return {
//     account,
//     provider,
//     signer,
//     chainId,
//     isConnecting,
//     error,
//     connectWallet,
//     disconnect,
//     switchNetwork,
//     isConnected: !!account,
//     listenForMarketCreated,
//   };
// }
