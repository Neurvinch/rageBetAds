import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { usePredictionMarket } from '../hooks/useContract';
import { CONTRACTS } from '../config/contracts';
import { aiService, nftService } from '../services/apiService';

export default function AIBettingInterface({ matchId, matchData }) {
  console.log('🤖 AIBettingInterface v2.0 rendered with matchId:', matchId);
  
  const { account, connectWallet } = useWeb3();
  const { 
    placeBet, 
    getTokenBalance,
    loading, 
    error 
  } = usePredictionMarket();
  
  const [aiPrediction, setAiPrediction] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [userChoice, setUserChoice] = useState(null);
  const [showPrediction, setShowPrediction] = useState(false);
  const [tokenBalance, setTokenBalance] = useState('0');
  const [marketId, setMarketId] = useState(null);

  useEffect(() => {
    if (matchId && !aiPrediction) {
      loadAIPrediction();
    }
  }, [matchId]);

  useEffect(() => {
    if (account) {
      loadTokenBalance();
      // Quick connectivity check: log contract address and market count
      (async () => {
        try {
          const count = await getMarketCount();
          console.log('🔗 PredictionMarket address:', CONTRACTS.PREDICTION_MARKET.address, 'marketCounter:', count);
        } catch (err) {
          console.warn('Connectivity check failed:', err);
        }
      })();
    }
  }, [account]);

  const loadAIPrediction = async () => {
    try {
      const response = await aiService.generatePrediction(matchId);
      setAiPrediction(response.prediction);
    } catch (err) {
      console.error('Error loading AI prediction:', err);
    }
  };

  const loadTokenBalance = async () => {
    try {
      const balance = await getTokenBalance(account);
      setTokenBalance(balance || '0');
    } catch (err) {
      console.error('Error loading token balance:', err);
    }
  };

  const handleBet = async (agreeWithAI) => {
    if (!account) {
      // Prompt user to connect wallet, then continue the flow automatically
      await connectWallet();

      // Try to read the connected account directly in case state hasn't updated yet
      try {
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            // proceed with the newly connected account
            console.log('Wallet connected:', accounts[0]);
          } else {
            // user did not connect - stop
            return;
          }
        }
      } catch (err) {
        console.error('Error checking connected accounts after connectWallet:', err);
        return;
      }
    }

    if (!betAmount || betAmount <= 0) {
      alert('Please enter a valid bet amount');
      return;
    }

    if (parseFloat(betAmount) > parseFloat(tokenBalance)) {
      alert(`Insufficient balance! You have ${tokenBalance} MON tokens`);
      return;
    }

    try {
      // For now, we'll use matchId as marketId (in real app, you'd create markets first)
      const marketId = matchId; // This should be the actual market ID from contract
      
      console.log('🎯 Placing bet with real contract...');
      const result = await placeBet(marketId, agreeWithAI, betAmount);
      
      console.log('✅ Bet placed successfully!', result.receipt.transactionHash);
      
      // Generate NFT metadata for the receipt
      const metadataResponse = await nftService.generateMetadata(
        matchId,
        agreeWithAI ? 'AI is Right' : 'AI is Wrong',
        aiPrediction.ai_roast_loser,
        account
      );

      alert(`🎉 Bet placed successfully!\nTransaction: ${result.receipt.transactionHash}\nNFT Metadata: ${metadataResponse.ipfs_hash}`);
      
      // Refresh token balance
      await loadTokenBalance();
      
    } catch (err) {
      console.error('Error placing bet:', err);
      alert('Error placing bet: ' + err.message);
    }
  };

  if (!aiPrediction) {
    return (
      <div className="ai-betting-loading">
        <div className="loading-spinner"></div>
        <p>🤖 AI is analyzing the match...</p>
      </div>
    );
  }

  return (
    <div className="ai-betting-interface">
      {/* AI Prediction Display */}
      <div className="ai-prediction-card">
        <div className="prediction-header">
          <h3>🤖 AI Prediction</h3>
          <div className="confidence-badge">
            {Math.round(aiPrediction.confidence * 100)}% Confidence
          </div>
        </div>
        
        <div className="prediction-content">
          <div className="prediction-result">
            <h4>AI Says: {aiPrediction.ai_prediction}</h4>
            <p className="ai-reasoning">{aiPrediction.reasoning}</p>
          </div>
          
          <div className="roast-section">
            <h5>🔥 AI Roast for the Losing Team:</h5>
            <div className="roast-text">
              "{aiPrediction.ai_roast_loser}"
            </div>
          </div>
        </div>
      </div>

      {/* Betting Interface */}
      <div className="betting-interface">
        <h3>💰 Place Your Bet</h3>
        <p><strong>NEW AI BETTING SYSTEM:</strong> Bet on whether the AI's prediction will be correct or not. You're not betting on which team wins, but on whether the AI is right!</p>
        
        <div className="bet-options">
          <div className="betting-system-notice">
            <p>🎯 <strong>NEW SYSTEM:</strong> You're betting on AI accuracy, not match outcomes!</p>
          </div>
          
          <button 
            className={`bet-option ${userChoice === true ? 'selected' : ''}`}
            onClick={() => setUserChoice(true)}
          >
            <div className="option-icon">✅</div>
            <div className="option-text">
              <h4>AI is Right</h4>
              <p>I think the AI prediction is correct</p>
            </div>
          </button>
          
          <button 
            className={`bet-option ${userChoice === false ? 'selected' : ''}`}
            onClick={() => setUserChoice(false)}
          >
            <div className="option-icon">❌</div>
            <div className="option-text">
              <h4>AI is Wrong</h4>
              <p>I think the AI prediction is wrong</p>
            </div>
          </button>
        </div>

        {userChoice !== null && (
          <div className="bet-amount-section">
            <div className="token-balance">
              <span>💰 Your Balance: {parseFloat(tokenBalance).toFixed(2)} MON</span>
            </div>
            
            <label htmlFor="betAmount">Bet Amount (MON tokens):</label>
            <input
              id="betAmount"
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              max={tokenBalance}
            />
            
            <button 
              className="place-bet-btn"
              onClick={() => handleBet(userChoice)}
              disabled={loading || !betAmount || parseFloat(betAmount) > parseFloat(tokenBalance)}
            >
              {loading ? '🔄 Placing Bet...' : '🎯 Place Bet'}
            </button>
          </div>
        )}

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}
      </div>

      {/* Match Info */}
      <div className="match-info">
        <h4>📊 Match Details</h4>
        <div className="match-details">
          <div className="team-info">
            <span className="team-name">{matchData?.home_team || aiPrediction.home_team}</span>
            <span className="vs">VS</span>
            <span className="team-name">{matchData?.away_team || aiPrediction.away_team}</span>
          </div>
          <div className="league-info">
            <span>🏆 {aiPrediction.league}</span>
            <span>📅 {matchData?.date || 'TBD'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
