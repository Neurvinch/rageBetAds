import { useState, useEffect } from 'react';
import { useWeb3 } from '../hooks/useWeb3';

export default function Leaderboard() {
  const { account } = useWeb3();
  const [timeframe, setTimeframe] = useState('all-time');
  const [category, setCategory] = useState('winnings');
  
  const [leaderboardData, setLeaderboardData] = useState([
    { rank: 1, address: '0x1234...5678', username: 'CryptoPro', winnings: 5420, bets: 156, winRate: 72.4, streak: 12, avatar: '👑' },
    { rank: 2, address: '0x8765...4321', username: 'BetMaster', winnings: 4830, bets: 142, winRate: 68.3, streak: 8, avatar: '🔥' },
    { rank: 3, address: '0xABCD...EFGH', username: 'LuckyPunter', winnings: 4250, bets: 98, winRate: 75.5, streak: 15, avatar: '💎' },
    { rank: 4, address: '0x9876...1234', username: 'AITruster', winnings: 3890, bets: 178, winRate: 64.0, streak: 5, avatar: '🤖' },
    { rank: 5, address: '0xDEAD...BEEF', username: 'WhaleBetter', winnings: 3650, bets: 89, winRate: 79.8, streak: 22, avatar: '🐋' },
    { rank: 6, address: '0x1111...2222', username: 'StatsGuru', winnings: 3420, bets: 203, winRate: 61.1, streak: 3, avatar: '📊' },
    { rank: 7, address: '0x3333...4444', username: 'RiskyPlayer', winnings: 3150, bets: 256, winRate: 58.6, streak: 1, avatar: '🎲' },
    { rank: 8, address: '0x5555...6666', username: 'SafeBetter', winnings: 2980, bets: 124, winRate: 69.4, streak: 7, avatar: '🛡️' },
    { rank: 9, address: '0x7777...8888', username: 'MoonShot', winnings: 2750, bets: 167, winRate: 63.5, streak: 4, avatar: '🚀' },
    { rank: 10, address: '0x9999...0000', username: 'DiamondHands', winnings: 2580, bets: 145, winRate: 66.2, streak: 9, avatar: '💪' },
  ]);

  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    // Simulate finding user's rank
    if (account) {
      setUserRank({
        rank: 156,
        address: account,
        username: 'You',
        winnings: 850,
        bets: 42,
        winRate: 67.6,
        streak: 3,
        avatar: '👤'
      });
    }
  }, [account]);

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getStreakClass = (streak) => {
    if (streak >= 15) return 'streak-legendary';
    if (streak >= 10) return 'streak-epic';
    if (streak >= 5) return 'streak-good';
    return 'streak-normal';
  };

  return (
    <div className="leaderboard-page">
      {/* Header */}
      <div className="leaderboard-header">
        <div className="header-content">
          <h1>🏆 Leaderboard</h1>
          <p>Compete with the best bettors and climb the ranks!</p>
        </div>
      </div>

      {/* Filters */}
      <div className="leaderboard-filters">
        <div className="filter-group">
          <label>Timeframe</label>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${timeframe === 'today' ? 'active' : ''}`}
              onClick={() => setTimeframe('today')}
            >
              Today
            </button>
            <button 
              className={`filter-btn ${timeframe === 'week' ? 'active' : ''}`}
              onClick={() => setTimeframe('week')}
            >
              This Week
            </button>
            <button 
              className={`filter-btn ${timeframe === 'month' ? 'active' : ''}`}
              onClick={() => setTimeframe('month')}
            >
              This Month
            </button>
            <button 
              className={`filter-btn ${timeframe === 'all-time' ? 'active' : ''}`}
              onClick={() => setTimeframe('all-time')}
            >
              All Time
            </button>
          </div>
        </div>

        <div className="filter-group">
          <label>Category</label>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${category === 'winnings' ? 'active' : ''}`}
              onClick={() => setCategory('winnings')}
            >
              💰 Winnings
            </button>
            <button 
              className={`filter-btn ${category === 'winrate' ? 'active' : ''}`}
              onClick={() => setCategory('winrate')}
            >
              📈 Win Rate
            </button>
            <button 
              className={`filter-btn ${category === 'streak' ? 'active' : ''}`}
              onClick={() => setCategory('streak')}
            >
              🔥 Streak
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="podium-section">
        <div className="podium-container">
          <div className="podium-place second">
            <div className="podium-avatar">{leaderboardData[1]?.avatar}</div>
            <div className="podium-medal">🥈</div>
            <div className="podium-info">
              <div className="podium-username">{leaderboardData[1]?.username}</div>
              <div className="podium-stat">{leaderboardData[1]?.winnings} RAGE</div>
            </div>
            <div className="podium-height podium-2"></div>
          </div>

          <div className="podium-place first">
            <div className="podium-crown">👑</div>
            <div className="podium-avatar champion">{leaderboardData[0]?.avatar}</div>
            <div className="podium-medal">🥇</div>
            <div className="podium-info">
              <div className="podium-username">{leaderboardData[0]?.username}</div>
              <div className="podium-stat">{leaderboardData[0]?.winnings} RAGE</div>
            </div>
            <div className="podium-height podium-1"></div>
          </div>

          <div className="podium-place third">
            <div className="podium-avatar">{leaderboardData[2]?.avatar}</div>
            <div className="podium-medal">🥉</div>
            <div className="podium-info">
              <div className="podium-username">{leaderboardData[2]?.username}</div>
              <div className="podium-stat">{leaderboardData[2]?.winnings} RAGE</div>
            </div>
            <div className="podium-height podium-3"></div>
          </div>
        </div>
      </div>

      {/* Your Rank Card */}
      {userRank && (
        <div className="your-rank-card">
          <div className="rank-badge">#{userRank.rank}</div>
          <div className="rank-info">
            <div className="rank-title">Your Current Rank</div>
            <div className="rank-stats">
              <span>{userRank.winnings} RAGE</span>
              <span>•</span>
              <span>{userRank.winRate}% Win Rate</span>
              <span>•</span>
              <span>{userRank.bets} Bets</span>
            </div>
          </div>
          <div className="rank-cta">
            <button className="rank-btn">Climb Higher 🚀</button>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="leaderboard-table-section">
        <h2>📊 Full Rankings</h2>
        <div className="leaderboard-table-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Total Winnings</th>
                <th>Total Bets</th>
                <th>Win Rate</th>
                <th>Current Streak</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((player) => (
                <tr 
                  key={player.rank}
                  className={player.rank <= 3 ? `top-${player.rank}` : ''}
                >
                  <td className="rank-cell">
                    <span className="rank-display">{getMedalEmoji(player.rank)}</span>
                  </td>
                  <td className="player-cell">
                    <div className="player-info">
                      <span className="player-avatar">{player.avatar}</span>
                      <div className="player-details">
                        <div className="player-username">{player.username}</div>
                        <div className="player-address">{player.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="winnings-cell">
                    <span className="winnings-amount">{player.winnings} RAGE</span>
                  </td>
                  <td className="bets-cell">{player.bets}</td>
                  <td className="winrate-cell">
                    <div className="winrate-display">
                      <span className={`winrate-value ${player.winRate >= 70 ? 'high' : player.winRate >= 60 ? 'medium' : 'low'}`}>
                        {player.winRate}%
                      </span>
                      <div className="winrate-bar">
                        <div 
                          className="winrate-fill"
                          style={{ width: `${player.winRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="streak-cell">
                    <span className={`streak-badge ${getStreakClass(player.streak)}`}>
                      🔥 {player.streak}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rewards Info */}
      <div className="rewards-section">
        <h2>🎁 Weekly Rewards</h2>
        <div className="rewards-grid">
          <div className="reward-card gold">
            <div className="reward-rank">🥇 1st Place</div>
            <div className="reward-amount">1000 RAGE</div>
            <div className="reward-description">+ Legendary NFT</div>
          </div>
          <div className="reward-card silver">
            <div className="reward-rank">🥈 2nd Place</div>
            <div className="reward-amount">500 RAGE</div>
            <div className="reward-description">+ Epic NFT</div>
          </div>
          <div className="reward-card bronze">
            <div className="reward-rank">🥉 3rd Place</div>
            <div className="reward-amount">250 RAGE</div>
            <div className="reward-description">+ Rare NFT</div>
          </div>
          <div className="reward-card top10">
            <div className="reward-rank">🏆 Top 10</div>
            <div className="reward-amount">100 RAGE</div>
            <div className="reward-description">+ Common NFT</div>
          </div>
        </div>
      </div>
    </div>
  );
}
