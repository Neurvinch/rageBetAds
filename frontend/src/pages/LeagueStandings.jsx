import { useState, useEffect } from 'react';
import { sportsService } from '../services/apiService';

export default function LeagueStandings() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState('4328');
  const [season, setSeason] = useState('2025-2026');
  const [leagueInfo, setLeagueInfo] = useState(null);

  const leagues = [
    { id: '4328', name: 'Premier League', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England' },
    { id: '4335', name: 'La Liga', emoji: '🇪🇸', country: 'Spain' },
    { id: '4331', name: 'Bundesliga', emoji: '🇩🇪', country: 'Germany' },
    { id: '4332', name: 'Serie A', emoji: '🇮🇹', country: 'Italy' },
    { id: '4334', name: 'Ligue 1', emoji: '🇫🇷', country: 'France' },
    { id: '4337', name: 'Champions League', emoji: '🏆', country: 'Europe' },
  ];

  useEffect(() => {
    fetchStandings();
    fetchLeagueInfo();
  }, [selectedLeague, season]);

  const fetchStandings = async () => {
    try {
      setLoading(true);
      const standingsData = await sportsService.getLeagueInfo(selectedLeague);
      setStandings(standingsData || []);
    } catch (error) {
      console.error('Error fetching standings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeagueInfo = async () => {
    try {
      const leagueData = await sportsService.getLeagueInfo(selectedLeague);
      setLeagueInfo(leagueData);
    } catch (error) {
      console.error('Error fetching league info:', error);
    }
  };

  const getRankColor = (rank) => {
    if (rank <= 4) return '#4CAF50'; // Champions League
    if (rank <= 6) return '#FF9800'; // Europa League
    if (rank <= 17) return '#2196F3'; // Safe
    return '#f44336'; // Relegation
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 4) return '🏆';
    if (rank <= 6) return '🏅';
    return '';
  };

  return (
    <div className="standings-page">
      {/* Header Section */}
      <div className="standings-header">
        <div className="header-content">
          <h1>📊 League Standings</h1>
          <p>Track your favorite teams' performance and league positions</p>
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

      {/* Season Selector */}
      <div className="season-selector">
        <h3>📅 Season</h3>
        <div className="season-controls">
          <button 
            className={`season-btn ${season === '2024-2025' ? 'active' : ''}`}
            onClick={() => setSeason('2024-2025')}
          >
            2024-2025
          </button>
          <button 
            className={`season-btn ${season === '2023-2024' ? 'active' : ''}`}
            onClick={() => setSeason('2023-2024')}
          >
            2023-2024
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-item">
          <div className="stat-number">{standings.length}</div>
          <div className="stat-label">Teams</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{standings.length > 0 ? standings[0]?.intPlayed || 0 : 0}</div>
          <div className="stat-label">Games Played</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">{standings.length > 0 ? standings[0]?.intPoints || 0 : 0}</div>
          <div className="stat-label">Max Points</div>
        </div>
      </div>

      {/* Standings Table */}
      <div className="standings-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading standings...</p>
          </div>
        ) : standings.length === 0 ? (
          <div className="no-standings">
            <div className="no-standings-icon">📊</div>
            <h3>No standings data available</h3>
            <p>Try selecting a different league or season!</p>
          </div>
        ) : (
          <div className="standings-table-container">
          <table className="standings-table">
            <thead>
              <tr>
                  <th className="rank-col">#</th>
                  <th className="team-col">Team</th>
                  <th className="stat-col">P</th>
                  <th className="stat-col">W</th>
                  <th className="stat-col">D</th>
                  <th className="stat-col">L</th>
                  <th className="stat-col">GF</th>
                  <th className="stat-col">GA</th>
                  <th className="stat-col">GD</th>
                  <th className="points-col">Pts</th>
                  <th className="form-col">Form</th>
              </tr>
            </thead>
            <tbody>
                {standings.map((team, index) => {
                  const rank = team.intRank || index + 1;
                  const rankColor = getRankColor(rank);
                  const rankBadge = getRankBadge(rank);
                  
                  return (
                    <tr key={team.idTeam} className={`standings-row rank-${rank}`}>
                      <td className="rank-cell">
                        <div className="rank-container" style={{ color: rankColor }}>
                          <span className="rank-badge">{rankBadge}</span>
                          <span className="rank-number">{rank}</span>
                        </div>
                      </td>
                      <td className="team-cell">
                        <div className="team-container">
                          <div className="team-badge">
                            {team.strBadge && (
                              <img src={team.strBadge} alt={team.strTeam} />
                            )}
                          </div>
                          <div className="team-info">
                            <div className="team-name">{team.strTeam}</div>
                            <div className="team-form">
                              {team.strForm && team.strForm.split('').slice(0, 5).map((result, i) => (
                                <span key={i} className={`form-result ${result.toLowerCase()}`}>
                                  {result}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="stat-cell">{team.intPlayed || '-'}</td>
                      <td className="stat-cell wins">{team.intWin || '-'}</td>
                      <td className="stat-cell draws">{team.intDraw || '-'}</td>
                      <td className="stat-cell losses">{team.intLoss || '-'}</td>
                      <td className="stat-cell">{team.intGoalsFor || '-'}</td>
                      <td className="stat-cell">{team.intGoalsAgainst || '-'}</td>
                      <td className={`stat-cell goal-diff ${team.intGoalDifference >= 0 ? 'positive' : 'negative'}`}>
                        {team.intGoalDifference >= 0 ? '+' : ''}{team.intGoalDifference || '-'}
                      </td>
                      <td className="points-cell">
                        <div className="points-container">
                          <span className="points-number">{team.intPoints || '-'}</span>
                          {rank <= 4 && <span className="champions-league">UCL</span>}
                          {rank > 4 && rank <= 6 && <span className="europa-league">UEL</span>}
                          {rank > 17 && <span className="relegation">REL</span>}
                        </div>
                  </td>
                      <td className="form-cell">
                        <div className="form-indicator">
                          {team.strForm && team.strForm.split('').slice(0, 5).map((result, i) => (
                            <div key={i} className={`form-dot ${result.toLowerCase()}`}></div>
                          ))}
                        </div>
                  </td>
                </tr>
                  );
                })}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="standings-legend">
        <h4>Legend</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-color champions"></span>
            <span>Champions League (1-4)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color europa"></span>
            <span>Europa League (5-6)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color safe"></span>
            <span>Safe (7-17)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color relegation"></span>
            <span>Relegation (18-20)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
