import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from './useWeb3';
import { CONTRACTS } from '../config/contracts';

export function useContract(address, abi) {
  const { signer, provider } = useWeb3();
  const [contract, setContract] = useState(null);

  useEffect(() => {
    if (address && abi && (signer || provider)) {
      try {
        // Basic validation for address
        if (!address || address === '0x...' || address.length < 10) {
          console.warn('⚠️ Contract address looks invalid or unset:', address);
          setContract(null);
          return;
        }

        const contractInstance = new ethers.Contract(
          address,
          abi,
          signer || provider
        );
        setContract(contractInstance);
        console.log('📄 Contract instance created:', address, 'with signer?', !!signer);
      } catch (error) {
        console.error('Error creating contract instance:', error);
      }
    }
  }, [address, abi, signer, provider]);

  return contract;
}

// Specific hooks for each contract
export function useRageToken() {
  return useContract(CONTRACTS.RAGE_TOKEN.address, CONTRACTS.RAGE_TOKEN.abi);
}

export function useRageNFT() {
  return useContract(CONTRACTS.RAGE_NFT.address, CONTRACTS.RAGE_NFT.abi);
}

export function usePredictionMarketContract() {
  return useContract(CONTRACTS.PREDICTION_MARKET.address, CONTRACTS.PREDICTION_MARKET.abi);
}

export function usePredictionMarket() {
  const contract = usePredictionMarketContract();
  const rageToken = useRageToken();
  const rageNFT = useRageNFT();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getMarket = async (marketId) => {
    if (!contract) return null;
    try {
      setLoading(true);
      const market = await contract.getMarket(marketId);
      return market;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const placeBet = async (marketId, agreeWithAI, amount) => {
    if (!contract || !rageToken) {
      const msg = 'Contracts not initialized. Check contract addresses and wallet connection.';
      console.error(msg, { contract: !!contract, rageToken: !!rageToken });
      throw new Error(msg);
    }
    try {
      setLoading(true);
      
      // Validate amount
      if (!amount || Number(amount) <= 0) throw new Error('Invalid bet amount');

      // Convert amount to wei
      const amountWei = ethers.parseEther(amount.toString());
      
      // First, approve the token transfer
      console.log('🔐 Approving token transfer...', { spender: CONTRACTS.PREDICTION_MARKET.address, amount: amountWei.toString() });
      const approveTx = await rageToken.approve(CONTRACTS.PREDICTION_MARKET.address, amountWei);
      const approveReceipt = await approveTx.wait();
      console.log('✅ Token approval confirmed', approveReceipt.transactionHash);
      
      // Then place the bet
      console.log('🎯 Placing bet...', { marketId, agreeWithAI, amount: amountWei.toString() });
      // Ensure marketId is a number / BigInt (contract expects uint256)
      let marketIdParam = marketId;
      try {
        if (typeof marketId === 'string') {
          if (/^0x/i.test(marketId)) {
            marketIdParam = BigInt(marketId);
          } else {
            marketIdParam = BigInt(Number(marketId));
          }
        } else if (typeof marketId === 'number') {
          marketIdParam = BigInt(marketId);
        }
      } catch (convErr) {
        console.warn('Could not coerce marketId to BigInt, passing as-is:', marketId, convErr);
      }

      const tx = await contract.placeBet(marketIdParam, agreeWithAI, amountWei);
      const receipt = await tx.wait();
      console.log('✅ Bet placed successfully:', receipt.transactionHash);
      
      return { tx, receipt };
    } catch (err) {
      console.error('❌ Error placing bet:', err);
      setError(err.message || String(err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const claimWinnings = async (marketId) => {
    if (!contract) throw new Error('Contract not initialized');
    try {
      setLoading(true);
      const tx = await contract.claimWinnings(marketId);
      await tx.wait();
      return tx;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getMarketCount = async () => {
    if (!contract) return 0;
    try {
      const count = await contract.marketCounter();
      return Number(count);
    } catch (err) {
      setError(err.message);
      return 0;
    }
  };

  const resolveMarket = async (marketId, matchId) => {
    if (!contract) throw new Error('Contract not initialized');
    try {
      setLoading(true);
      // First, call the Web2 oracle to get the result
      const oracleResponse = await fetch('/api/oracle/resolve-market', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          market_id: marketId,
          match_id: matchId,
          ai_was_right: false, // Will be updated by oracle
          home_score: null,
          away_score: null,
          status: 'Unknown'
        }),
      });

      if (!oracleResponse.ok) {
        throw new Error('Oracle resolution failed');
      }

      const oracleData = await oracleResponse.json();
      
      // Now call the smart contract to resolve the market
      const tx = await contract.resolveMarket(marketId, oracleData.ai_was_right);
      await tx.wait();
      return tx;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateAIPrediction = async (matchId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ai/generate-prediction?match_id=${matchId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('AI prediction generation failed');
      }

      const data = await response.json();
      return data.prediction;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateNFTMetadata = async (matchId, userChoice, aiRoast, userAddress) => {
    try {
      setLoading(true);
      const response = await fetch('/api/nft/generate-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          match_id: matchId,
          user_choice: userChoice,
          ai_roast: aiRoast,
          user_address: userAddress
        }),
      });

      if (!response.ok) {
        throw new Error('NFT metadata generation failed');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserStats = async (userAddress) => {
    if (!contract) return null;
    try {
      const stats = await contract.getUserStats(userAddress);
      return {
        correctBets: Number(stats.correctBets),
        totalBets: Number(stats.totalBets),
        winnings: Number(stats.winnings),
        inHallOfFame: stats.inHallOfFame,
        inHallOfShame: stats.inHallOfShame,
        accuracy: Number(stats.accuracy)
      };
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // Token functions
  const getTokenBalance = async (userAddress) => {
    if (!rageToken) return null;
    try {
      const balance = await rageToken.balanceOf(userAddress);
      return ethers.formatEther(balance);
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const getTokenAllowance = async (userAddress, spender) => {
    if (!rageToken) return null;
    try {
      const allowance = await rageToken.allowance(userAddress, spender);
      return ethers.formatEther(allowance);
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  // NFT functions
  const getUserNFTs = async (userAddress) => {
    if (!rageNFT) return [];
    try {
      const balance = await rageNFT.balanceOf(userAddress);
      const nfts = [];
      for (let i = 0; i < Number(balance); i++) {
        try {
          const tokenId = await rageNFT.tokenOfOwnerByIndex(userAddress, i);
          const nftData = await rageNFT.getNFTData(tokenId);
          nfts.push({
            tokenId: Number(tokenId),
            ...nftData
          });
        } catch (err) {
          console.error(`Error fetching NFT ${i}:`, err);
        }
      }
      return nfts;
    } catch (err) {
      setError(err.message);
      return [];
    }
  };

  // Market creation (owner only)
  const createMarket = async (matchId, team1, team2, aiTrashTalk, aiPrediction, durationSeconds) => {
    if (!contract) throw new Error('Contract not initialized');
    try {
      setLoading(true);
      const tx = await contract.createMarket(
        matchId,
        team1,
        team2,
        aiTrashTalk,
        aiPrediction,
        durationSeconds
      );
      const receipt = await tx.wait();
      console.log('✅ Market created:', receipt.transactionHash);
      return { tx, receipt };
    } catch (err) {
      console.error('❌ Error creating market:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    contract,
    rageToken,
    rageNFT,
    loading,
    error,
    getMarket,
    placeBet,
    claimWinnings,
    getMarketCount,
    resolveMarket,
    generateAIPrediction,
    generateNFTMetadata,
    getUserStats,
    getTokenBalance,
    getTokenAllowance,
    getUserNFTs,
    createMarket,
  };
}
