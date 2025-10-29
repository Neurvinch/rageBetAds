import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWalletClient } from 'wagmi';
import { sportsService } from '../services/apiService';
import { CONTRACTS } from '../config/contracts';
import PredictionMarketABI from '../../../contracts/PredictionMarket.json';
import RageTokenABI from '../../../contracts/RageToken.json';

export default function MatchDetails({ match, onBack }) {
  const { data: walletClient } = useWalletClient();
  const [matchDetails, setMatchDetails] = useState(null);
  const [stats, setStats] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rageBalance, setRageBalance] = useState(null);

  useEffect(() => {
    if (match) {
      fetchMatchData();
    }
  }, [match]);

  const fetchMatchData = async () => {
    try {
      setLoading(true);
      const matchDetailsData = await sportsService.getMatchDetails(match.idEvent);

      // Ensure marketId is set
      const marketId = 2n || matchDetailsData?.marketId || match?.marketId ;
      if (!marketId) {
        console.warn('marketId is missing in match details.');
      }

      setMatchDetails({ ...matchDetailsData, marketId } || match);
      setStats([]); // Stats endpoint not implemented yet
      setTimeline([]); // Timeline endpoint not implemented yet
    } catch (error) {
      console.error('Error fetching match data:', error);
      setMatchDetails(match); // Fallback to original match data
    } finally {
      setLoading(false);
    }
  };

  const handleBet = async (marketId, agreeWithAI, amount) => {
    try {
      if (!walletClient) {
        console.error('Wallet client is not connected.');
        alert('Please connect your wallet first.');
        return;
      }

      console.log('Initializing provider with walletClient:', walletClient);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      console.log('Signer initialized:', signer);

      const contract = new ethers.Contract(
        CONTRACTS.PREDICTION_MARKET.address,
        PredictionMarketABI,
        signer
      );
      console.log('Contract instance created:', contract);

      // Check market status before placing bet
      const market = await contract.getMarket(marketId);
      console.log('Market details:', market);

      if (market.resolved) {
        alert('This market has already been resolved.');
        return;
      }

      if (Date.now() / 1000 >= market.endTime) {
        alert('This market is closed for betting.');
        return;
      }

      if (!contract.placeBet) {
        console.error('placeBet function is not defined on the contract.');
        alert('Contract method not available. Please check the contract ABI.');
        return;
      }

      // Initialize RageToken contract
      const rageToken = new ethers.Contract(
        CONTRACTS.RAGE_TOKEN.address,
        RageTokenABI,
        signer
      );

      // Convert amount to RAGE token units (18 decimals)
      const amountInRage = ethers.parseUnits(amount.toString(), 18);
      console.log('Amount in RAGE:', amountInRage);

      // Check RAGE token balance
      const userAddress = await signer.getAddress();
      const balance = await rageToken.balanceOf(userAddress);
      setRageBalance(balance);
      console.log('Balance check:', {
        userAddress,
        balance: balance.toString(),
        balanceInEther: ethers.formatUnits(balance, 18),
        amountInRage: amountInRage.toString(),
        amountInEther: ethers.formatUnits(amountInRage, 18),
      });
      
      if (balance < amountInRage) {
        alert(`Insufficient RAGE token balance. You have ${ethers.formatUnits(balance, 18)} RAGE, but need ${ethers.formatUnits(amountInRage, 18)} RAGE`);
        return;
      }

      // Check if contract is approved to spend RAGE tokens
      const allowance = await rageToken.allowance(await signer.getAddress(), CONTRACTS.PREDICTION_MARKET.address);
      console.log('Current allowance:', allowance);

      if (allowance < amountInRage) {
        console.log('Approving RAGE tokens...');
        const approveTx = await rageToken.approve(CONTRACTS.PREDICTION_MARKET.address, ethers.MaxUint256);
        await approveTx.wait();
        console.log('Approval confirmed');
      }

      console.log('Calling placeBet with:', { marketId, agreeWithAI, amountInRage });

      // Estimate gas first to check if the transaction will fail
      try {
        await contract.placeBet.estimateGas(marketId, agreeWithAI, amountInRage);
      } catch (gasError) {
        const errorMessage = gasError.message.toLowerCase();
        if (errorMessage.includes('market closed')) {
          alert('This market is closed for betting.');
        } else if (errorMessage.includes('already placed bet')) {
          alert('You have already placed a bet on this market.');
        } else {
          alert(`Transaction will fail: ${gasError.message}`);
        }
        return;
      }

      const tx = await contract.placeBet(marketId, agreeWithAI, amountInRage);
      console.log('Transaction sent:', tx, { marketId, agreeWithAI, amountInRage });

      await tx.wait();
      console.log('Transaction confirmed:', tx);

      alert('Bet placed successfully!');
    } catch (error) {
      console.error('Error placing bet:', {
        error,
        marketId,
        agreeWithAI,
        amount,
        contractAddress: CONTRACTS.PREDICTION_MARKET.address,
      });

      // Parse the error message for user-friendly display
      let errorMessage = 'Unknown error occurred';
      if (error.message) {
        if (error.message.includes('Market closed')) {
          errorMessage = 'This market is closed for betting';
        } else if (error.message.includes('Already placed bet')) {
          errorMessage = 'You have already placed a bet on this market';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds to place this bet';
        } else {
          errorMessage = error.message;
        }
      }
      alert(`Failed to place bet: ${errorMessage}`);
    }
  };

  if (!match) {
    return <div>No match selected</div>;
  }

  return (
    <div className="match-details-page">
      <button onClick={onBack} className="back-btn">
        ← Back to Matches
      </button>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading match details...</p>
        </div>
      ) : (
        <>
          {/* Match Header */}
          <div className="match-header">
            <div className="match-info">
              <div className="match-league">
                {matchDetails.strLeague}
              </div>
              <div className="match-date">
                {new Date(matchDetails.dateEvent).toLocaleDateString()} - {matchDetails.strTime}
              </div>
            </div>

            <div className="match-scoreboard">
              <div className="team home">
                {matchDetails.strHomeTeamBadge && (
                  <img src={matchDetails.strHomeTeamBadge} alt={matchDetails.strHomeTeam} />
                )}
                <h2>{matchDetails.strHomeTeam}</h2>
              </div>

              <div className="score">
                {matchDetails.intHomeScore !== null ? (
                  <>
                    <span className="score-number">{matchDetails.intHomeScore}</span>
                    <span className="separator">-</span>
                    <span className="score-number">{matchDetails.intAwayScore}</span>
                  </>
                ) : (
                  <span className="vs-text">VS</span>
                )}
              </div>

              <div className="team away">
                {matchDetails.strAwayTeamBadge && (
                  <img src={matchDetails.strAwayTeamBadge} alt={matchDetails.strAwayTeam} />
                )}
                <h2>{matchDetails.strAwayTeam}</h2>
              </div>
            </div>

            {matchDetails.strVenue && (
              <div className="match-venue">
                📍 {matchDetails.strVenue}
              </div>
            )}
          </div>

          {/* Betting Section */}
          <div className="betting-section">
            <h3>🔥 Place Your Bet</h3>
            <p>Your balance: {rageBalance ? ethers.formatUnits(rageBalance, 18) : '0'} RAGE</p>
            <div className="bet-options">
              <button className="bet-option home" onClick={() => handleBet(matchDetails.marketId, true, "0.000000000000001")}>
                Bet 0.000000000000001 RAGE on {matchDetails.strHomeTeam}
              </button>
              <button className="bet-option draw" onClick={() => handleBet(matchDetails.marketId, false, "0.000000000000001")}>
                Bet 0.000000000000001 RAGE on Draw
              </button>
              <button className="bet-option away" onClick={() => handleBet(matchDetails.marketId, false, "0.000000000000001")}>
                Bet 0.000000000000001 RAGE on {matchDetails.strAwayTeam}
              </button>
            </div>
          </div>

          {/* Match Stats */}
          {stats.length > 0 && (
            <div className="match-stats">
              <h3>📊 Match Statistics</h3>
              <div className="stats-list">
                {stats.map((stat, index) => (
                  <div key={index} className="stat-item">
                    <div className="stat-bar">
                      <div className="home-bar" style={{ width: `${(stat.intHome / (stat.intHome + stat.intAway)) * 100}%` }}>
                        {stat.intHome}
                      </div>
                      <div className="away-bar" style={{ width: `${(stat.intAway / (stat.intHome + stat.intAway)) * 100}%` }}>
                        {stat.intAway}
                      </div>
                    </div>
                    <div className="stat-label">{stat.strStat}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {timeline.length > 0 && (
            <div className="match-timeline">
              <h3>⏱️ Match Timeline</h3>
              <div className="timeline-list">
                {timeline.map((event, index) => (
                  <div key={index} className={`timeline-event ${event.strTimeline.toLowerCase()}`}>
                    <div className="event-time">{event.intTime}'</div>
                    <div className="event-icon">
                      {event.strTimeline === 'Goal' ? '⚽' : 
                       event.strTimeline === 'Card' ? '🟨' : '📋'}
                    </div>
                    <div className="event-details">
                      <strong>{event.strPlayer}</strong>
                      <span>{event.strTimelineDetail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
