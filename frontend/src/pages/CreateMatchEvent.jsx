import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWalletClient } from 'wagmi';
import { sportsService } from '../services/apiService';
import { CONTRACTS } from '../config/contracts';
import PredictionMarketABI from '../../../contracts/PredictionMarket.json';

export default function CreateMatchEvent() {
  const { data: walletClient } = useWalletClient();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);

      const leagueId = '4328'; // Replace with a valid default league ID
      console.log('Fetching matches for league ID:', leagueId);

      const data = await sportsService.getUpcomingMatches(leagueId);
      setMatches(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
      alert('Failed to fetch matches. Please check the league ID.');
    } finally {
      setLoading(false);
    }
  };

  const createMatchEvent = async (match) => {
    try {
      if (!walletClient) {
        alert('Please connect your wallet first.');
        return;
      }

      const provider = new ethers.BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACTS.PREDICTION_MARKET.address,
        PredictionMarketABI,
        signer
      );

      const tx = await contract.createMarket(
        match.idEvent,
        match.team1,
        match.team2,
        match.aiTrashTalk || '',
        match.aiPrediction || '',
        match.durationSeconds || 3600 // Default to 1 hour
      );

      await tx.wait();
      alert('Match event created successfully!');
    } catch (error) {
      console.error('Error creating match event:', error);
      alert(`Failed to create match event: ${error.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="create-match-event-page">
      <h1>Upcoming Matches</h1>
      {loading ? (
        <p>Loading matches...</p>
      ) : (
        <div className="matches-list">
          {matches.map((match) => (
            <div key={match.idEvent} className="match-item">
              <h3>{match.team1} vs {match.team2}</h3>
              <p>Date: {new Date(match.dateEvent).toLocaleDateString()}</p>
              <p>Time: {match.strTime}</p>
              <button onClick={() => createMatchEvent(match)}>Create Event</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}