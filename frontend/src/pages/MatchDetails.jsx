import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWalletClient } from 'wagmi';
import { sportsService } from '../services/apiService';
import { CONTRACTS } from '../config/contracts';
import PredictionMarketABI from '../../../contracts/PredictionMarket.json';

export default function MatchDetails({ match, onBack }) {
  const { data: walletClient } = useWalletClient();
  const [matchDetails, setMatchDetails] = useState(null);
  const [stats, setStats] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const marketId = 1 || matchDetailsData?.marketId || match?.marketId ;
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

      if (!contract.placeBet) {
        console.error('placeBet function is not defined on the contract.');
        alert('Contract method not available. Please check the contract ABI.');
        return;
      }

      console.log('Calling placeBet with:', { marketId, agreeWithAI, amount });
      const tx = await contract.placeBet(
        1n,
        agreeWithAI,
        ethers.parseUnits(amount.toString(), 18)
      );
      console.log('Transaction sent:', tx);

      if (!tx || !tx.wait) {
        console.error('Transaction object is invalid or missing the wait method:', tx);
        alert('Invalid transaction object. Please check the contract interaction.');
        return;
      }

      await tx.wait();
      console.log('Transaction confirmed:', tx);

      alert('Bet placed successfully!');
    } catch (error) {
      console.error('Error placing bet:', error);
      alert(`Failed to place bet: ${error.message || 'Unknown error'}`);
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
            <div className="bet-options">
              <button className="bet-option home" onClick={() => handleBet(matchDetails.marketId, true, 10)}>
                Bet on {matchDetails.strHomeTeam}
              </button>
              <button className="bet-option draw" onClick={() => handleBet(matchDetails.marketId, false, 10)}>
                Bet on Draw
              </button>
              <button className="bet-option away" onClick={() => handleBet(matchDetails.marketId, false, 10)}>
                Bet on {matchDetails.strAwayTeam}
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
