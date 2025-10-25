import { useState, useEffect } from 'react';
import { sportsService, aiService } from '../services/apiService';
import AIBettingInterface from '../components/AIBettingInterface';

export default function Dashboard({ onMatchClick }) {
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState('4328'); // Premier League
  const [leagueInfo, setLeagueInfo] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showBettingInterface, setShowBettingInterface] = useState(false);
  const [aiPredictions, setAiPredictions] = useState({});
  const [loadingPredictions, setLoadingPredictions] = useState({});

  const leagues = [
    { id: '4328', name: 'Premier League', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England' },
    { id: '4335', name: 'La Liga', emoji: '🇪🇸', country: 'Spain' },
    { id: '4331', name: 'Bundesliga', emoji: '🇩🇪', country: 'Germany' },
    { id: '4332', name: 'Serie A', emoji: '🇮🇹', country: 'Italy' },
    { id: '4334', name: 'Ligue 1', emoji: '🇫🇷', country: 'France' },
    { id: '4337', name: 'Champions League', emoji: '🏆', country: 'Europe' },
  ];

  useEffect(() => {
    fetchUpcomingMatches();
    fetchLeagueInfo();
  }, [selectedLeague]);

  const fetchUpcomingMatches = async () => {
    try {
      setLoading(true);
      const matches = await sportsService.getUpcomingMatches(selectedLeague);
      console.log('API Response:', matches); // Debug log
      const limitedMatches = matches.slice(0, 12) || [];
      setUpcomingMatches(limitedMatches);
      
      // Load AI predictions for each match
      loadAIPredictions(limitedMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      // Fallback to empty array if API fails
      setUpcomingMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAIPredictions = async (matches) => {
    // Load AI predictions in parallel with a delay to avoid overwhelming the API
    const predictionPromises = matches.slice(0, 6).map(async (match, index) => {
      if (!match.idEvent) return;
      
      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, index * 2000));
      
      setLoadingPredictions(prev => ({ ...prev, [match.idEvent]: true }));
      try {
        const prediction = await aiService.generatePrediction(match.idEvent);
        setAiPredictions(prev => ({ ...prev, [match.idEvent]: prediction.prediction }));
      } catch (error) {
        console.error(`Error loading AI prediction for match ${match.idEvent}:`, error);
        // Set a fallback prediction for failed requests
        setAiPredictions(prev => ({ 
          ...prev, 
          [match.idEvent]: {
            ai_prediction: "AI analysis unavailable",
            ai_roast_loser: "Sorry, AI is taking a coffee break ☕",
            confidence: 0.5
          }
        }));
      } finally {
        setLoadingPredictions(prev => ({ ...prev, [match.idEvent]: false }));
      }
    });
    
    // Don't await all promises to avoid blocking the UI
    Promise.allSettled(predictionPromises);
  };

  const fetchLeagueInfo = async () => {
    try {
      const leagueData = await sportsService.getLeagueInfo(selectedLeague);
      setLeagueInfo(leagueData);
    } catch (error) {
      console.error('Error fetching league info:', error);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5); // HH:MM format
  };

  const getMatchStatus = (match) => {
    if (match.strStatus === 'Not Started') return 'upcoming';
    if (match.strStatus === 'Match Finished') return 'finished';
    if (match.strStatus === 'Live') return 'live';
    return 'scheduled';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return '#ff4444';
      case 'finished': return '#666';
      case 'upcoming': return '#4CAF50';
      default: return '#2196F3';
    }
  };

  const handleBetOnMatch = (match) => {
    setSelectedMatch(match);
    setShowBettingInterface(true);
  };

  const handleCloseBetting = () => {
    setShowBettingInterface(false);
    setSelectedMatch(null);
  };

  return (
    <div className="dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>🔥 Rage Bet Dashboard</h1>
          <p>Choose your league and place your bets on upcoming matches!</p>
          {leagueInfo && (
            <div className="league-info">
              <img src={leagueInfo.strBadge} alt={leagueInfo.strLeague} className="league-badge" />
              <div className="league-details">
                <h3>{leagueInfo.strLeague}</h3>
                <p>{leagueInfo.strCountry} • {leagueInfo.strCurrentSeason}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* League Selector */}
      <div className="league-selector">
        <h3>🏆 Select League</h3>
        <div className="league-grid">
          {leagues.map(league => (
            <button
              key={league.id}
              className={`league-btn ${selectedLeague === league.id ? 'active' : ''}`}
              onClick={() => setSelectedLeague(league.id)}
            >
              <div className="league-emoji">{league.emoji}</div>
              <div className="league-info">
                <div className="league-name">{league.name}</div>
                <div className="league-country">{league.country}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-number">{upcomingMatches.length}</div>
          <div className="stat-label">Upcoming Matches</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{leagues.length}</div>
          <div className="stat-label">Leagues Available</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">24/7</div>
          <div className="stat-label">Live Updates</div>
        </div>
      </div>

      {/* Matches Section */}
      <div className="matches-section">
        <div className="section-header">
          <h2>⚽ Upcoming Matches</h2>
          <div className="view-controls">
            <button className="view-btn active">Grid View</button>
            <button className="view-btn">List View</button>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading matches...</p>
          </div>
        ) : upcomingMatches.length === 0 ? (
          <div className="no-matches">
            <div className="no-matches-icon">⚽</div>
            <h3>No upcoming matches found</h3>
            <p>Try selecting a different league or check back later!</p>
          </div>
        ) : (
          <div className="matches-grid">
            {upcomingMatches.map((match) => {
              const status = getMatchStatus(match);
              const statusColor = getStatusColor(status);
              
              return (
                <div 
                  key={match.idEvent}
                  className={`match-card ${status}`}
                  onClick={() => onMatchClick(match)}
                >
                  {/* Match Header */}
                  <div className="match-header">
                    <div className="match-date-time">
                      <div className="match-date">{formatDate(match.dateEvent)}</div>
                      <div className="match-time">{formatTime(match.strTime)}</div>
                    </div>
                    <div className="match-status" style={{ color: statusColor }}>
                      {status === 'live' ? '🔴 LIVE' : 
                       status === 'finished' ? '✅ FINISHED' : 
                       status === 'upcoming' ? '⏰ UPCOMING' : '📅 SCHEDULED'}
                    </div>
                  </div>

                  {/* Teams */}
                  <div className="match-teams">
                    <div className="team home-team">
                      <div className="team-badge">
                        {match.strHomeTeamBadge && (
                          <img src={match.strHomeTeamBadge} alt={match.strHomeTeam} />
                        )}
                      </div>
                      <div className="team-name">{match.strHomeTeam}</div>
                    </div>
                    
                    <div className="vs-section">
                      <div className="vs">VS</div>
                      {match.intHomeScore !== null && match.intAwayScore !== null && (
                        <div className="score">
                          {match.intHomeScore} - {match.intAwayScore}
                        </div>
                      )}
                    </div>
                    
                    <div className="team away-team">
                      <div className="team-badge">
                        {match.strAwayTeamBadge && (
                          <img src={match.strAwayTeamBadge} alt={match.strAwayTeam} />
                        )}
                      </div>
                      <div className="team-name">{match.strAwayTeam}</div>
                    </div>
                  </div>

                  {/* AI Prediction Section */}
                  {aiPredictions[match.idEvent] && (
                    <div className="ai-prediction-section">
                      <div className="ai-prediction-header">
                        <span className="ai-icon">🤖</span>
                        <span className="ai-title">AI Prediction</span>
                        <span className="confidence-badge">
                          {Math.round(aiPredictions[match.idEvent].confidence * 100)}%
                        </span>
                      </div>
                      <div className="ai-prediction-content">
                        <div className="ai-prediction-text">
                          <strong>AI Says:</strong> {aiPredictions[match.idEvent].ai_prediction}
                        </div>
                        <div className="ai-roast-text">
                          <strong>🔥 Roast:</strong> "{aiPredictions[match.idEvent].ai_roast_loser}"
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fallback for failed AI predictions */}
                  {!loadingPredictions[match.idEvent] && !aiPredictions[match.idEvent] && (
                    <div className="ai-fallback">
                      <div className="ai-fallback-header">
                        <span className="ai-icon">⚠️</span>
                        <span className="ai-title">AI Analysis Unavailable</span>
                      </div>
                      <div className="ai-fallback-content">
                        <p>AI is taking a break. You can still place bets manually!</p>
                        <button 
                          className="retry-ai-btn"
                          onClick={() => {
                            setLoadingPredictions(prev => ({ ...prev, [match.idEvent]: true }));
                            aiService.generatePrediction(match.idEvent)
                              .then(prediction => {
                                setAiPredictions(prev => ({ ...prev, [match.idEvent]: prediction.prediction }));
                              })
                              .catch(error => {
                                console.error('Retry failed:', error);
                              })
                              .finally(() => {
                                setLoadingPredictions(prev => ({ ...prev, [match.idEvent]: false }));
                              });
                          }}
                        >
                          🔄 Retry AI Analysis
                        </button>
                      </div>
                    </div>
                  )}

                  {loadingPredictions[match.idEvent] && (
                    <div className="ai-loading">
                      <div className="loading-spinner"></div>
                      <span>🤖 AI is analyzing... This may take up to 45 seconds</span>
                    </div>
                  )}

                  {/* Match Details */}
                  <div className="match-details">
                    {match.strVenue && (
                      <div className="venue">
                        <span className="venue-icon">📍</span>
                        <span className="venue-name">{match.strVenue}</span>
                      </div>
                    )}
                    {match.strLeague && (
                      <div className="league">
                        <span className="league-icon">🏆</span>
                        <span className="league-name">{match.strLeague}</span>
                      </div>
                    )}
                  </div>

                      {/* Action Buttons */}
                      <div className="match-actions">
                        <button 
                          className="bet-btn primary"
                          onClick={() => handleBetOnMatch(match)}
                          disabled={!aiPredictions[match.idEvent]}
                        >
                          {aiPredictions[match.idEvent] ? '🤖 Bet on AI' : '⏳ AI Analyzing...'}
                        </button>
                        <button 
                          className="bet-btn secondary"
                          onClick={() => onMatchClick(match)}
                        >
                          📊 View Stats
                        </button>
                      </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Betting Interface Modal */}
      {showBettingInterface && selectedMatch && (
        <div className="betting-modal">
          <div className="modal-overlay" onClick={handleCloseBetting}></div>
          <div className="modal-content">
            <div className="modal-header">
              <h2>🤖 AI Betting Interface</h2>
              <button className="close-btn" onClick={handleCloseBetting}>×</button>
            </div>
            <AIBettingInterface 
              key={`ai-betting-${selectedMatch.idEvent}-${Date.now()}`}
              matchId={selectedMatch.idEvent}
              matchData={selectedMatch}
            />
          </div>
        </div>
      )}
    </div>
  );
}
