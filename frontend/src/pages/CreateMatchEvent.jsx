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
  const [formData, setFormData] = useState({
    matchId: '',
    team1: '',
    team2: '',
    aiTrashTalk: '',
    aiPrediction: '',
    durationSeconds: 3600,
  });

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

      // Pre-fill the form with the first match's data
      if (data.length > 0) {
        const firstMatch = data[0];
        // Log the first match to verify property names
        console.log('First match data:', firstMatch);

        setFormData({
          matchId: firstMatch.idEvent,
          team1: firstMatch.strHomeTeam || '', // Adjusted property name
          team2: firstMatch.strAwayTeam || '', // Adjusted property name
          aiTrashTalk: firstMatch.aiTrashTalk || 'Default AI Trash Talk', // Added default value
          aiPrediction: firstMatch.aiPrediction || 'Default AI Prediction', // Added default value
          durationSeconds: 3600, // Default to 1 hour
        });
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      alert('Failed to fetch matches. Please check the league ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const createMatchEvent = async () => {
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
        formData.matchId,
        formData.team1,
        formData.team2,
        formData.aiTrashTalk,
        formData.aiPrediction,
        formData.durationSeconds
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
      <h1>Create Match Event</h1>

      <div className="form">
        <label>
          Match ID:
          <input
            type="text"
            name="matchId"
            value={formData.matchId}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Team 1:
          <input
            type="text"
            name="team1"
            value={formData.team1}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Team 2:
          <input
            type="text"
            name="team2"
            value={formData.team2}
            onChange={handleInputChange}
          />
        </label>
        <label>
          AI Trash Talk:
          <input
            type="text"
            name="aiTrashTalk"
            value={formData.aiTrashTalk}
            onChange={handleInputChange}
          />
        </label>
        <label>
          AI Prediction:
          <input
            type="text"
            name="aiPrediction"
            value={formData.aiPrediction}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Duration (seconds):
          <input
            type="number"
            name="durationSeconds"
            value={formData.durationSeconds}
            onChange={handleInputChange}
          />
        </label>
        <button onClick={createMatchEvent}>Create Event</button>
      </div>

      <h2>Upcoming Matches</h2>
      {loading ? (
        <p>Loading matches...</p>
      ) : (
        <div className="matches-list">
          {matches.map((match) => (
            <div key={match.idEvent} className="match-item">
              <h3>{match.team1} vs {match.team2}</h3>
              <p>Date: {new Date(match.dateEvent).toLocaleDateString()}</p>
              <p>Time: {match.strTime}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}