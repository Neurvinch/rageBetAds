import { useState, useEffect } from 'react';

export default function LiveOdds({ matchId, homeTeam, awayTeam }) {
  const [odds, setOdds] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching odds
    setTimeout(() => {
      setOdds({
        home: (Math.random() * 3 + 1).toFixed(2),
        draw: (Math.random() * 2 + 2).toFixed(2),
        away: (Math.random() * 3 + 1).toFixed(2),
        overUnder: (Math.random() * 0.5 + 1.7).toFixed(2),
        trending: Math.random() > 0.5 ? 'home' : 'away',
        volume: Math.floor(Math.random() * 5000) + 1000
      });
      setLoading(false);
    }, 500);
  }, [matchId]);

  if (loading) {
    return (
      <div className="live-odds loading">
        <div className="odds-spinner"></div>
        <span>Loading odds...</span>
      </div>
    );
  }

  return (
    <div className="live-odds">
      <div className="odds-header">
        <span className="odds-title">📊 Live Odds</span>
        <span className="odds-volume">💰 ${odds.volume.toLocaleString()} Volume</span>
      </div>
      
      <div className="odds-grid">
        <div className={`odds-item ${odds.trending === 'home' ? 'trending' : ''}`}>
          <div className="odds-label">{homeTeam}</div>
          <div className="odds-value">{odds.home}x</div>
          {odds.trending === 'home' && <div className="trending-badge">📈</div>}
        </div>
        
        <div className="odds-item">
          <div className="odds-label">Draw</div>
          <div className="odds-value">{odds.draw}x</div>
        </div>
        
        <div className={`odds-item ${odds.trending === 'away' ? 'trending' : ''}`}>
          <div className="odds-label">{awayTeam}</div>
          <div className="odds-value">{odds.away}x</div>
          {odds.trending === 'away' && <div className="trending-badge">📈</div>}
        </div>
      </div>

      <div className="odds-footer">
        <span className="odds-info">Over/Under 2.5: {odds.overUnder}x</span>
        <span className="odds-update">🔄 Live</span>
      </div>
    </div>
  );
}
