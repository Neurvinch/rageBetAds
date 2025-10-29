import { useState, useEffect } from 'react';
// import { useWeb3 } from '../hooks/useWeb3';
import {useAccount} from "wagmi"
import { toast } from '../components/Toast';

export default function Profile() {
  const { isConnected, address } = useAccount();
  const [stats, setStats] = useState({
    totalBets: 0,
    wonBets: 0,
    lostBets: 0,
    pendingBets: 0,
    totalWinnings: 0,
    winRate: 0,
    currentStreak: 0,
    bestStreak: 0,
    favoriteLeague: 'Premier League',
    totalSpent: 0,
    nftsOwned: 0
  });
  
  const [achievements, setAchievements] = useState([
    { id: 1, name: 'First Blood', description: 'Place your first bet', icon: '🎯', unlocked: true },
    { id: 2, name: 'Lucky Streak', description: 'Win 3 bets in a row', icon: '🔥', unlocked: false },
    { id: 3, name: 'High Roller', description: 'Place a bet over 100 RAGE', icon: '💎', unlocked: false },
    { id: 4, name: 'AI Believer', description: 'Trust AI 10 times', icon: '🤖', unlocked: true },
    { id: 5, name: 'Contrarian', description: 'Bet against AI 10 times', icon: '🎲', unlocked: false },
    { id: 6, name: 'Century Club', description: 'Place 100 bets', icon: '💯', unlocked: false },
    { id: 7, name: 'Whale', description: 'Win 1000 RAGE total', icon: '🐋', unlocked: false },
    { id: 8, name: 'Perfect Week', description: 'Win all bets in a week', icon: '⭐', unlocked: false },
  ]);

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'bet', match: 'Arsenal vs Chelsea', amount: 50, result: 'won', timestamp: '2 hours ago' },
    { id: 2, type: 'bet', match: 'Real Madrid vs Barcelona', amount: 75, result: 'pending', timestamp: '5 hours ago' },
    { id: 3, type: 'bet', match: 'Bayern vs Dortmund', amount: 30, result: 'lost', timestamp: '1 day ago' },
    { id: 4, type: 'achievement', name: 'AI Believer', timestamp: '2 days ago' },
    { id: 5, type: 'bet', match: 'Liverpool vs Man City', amount: 100, result: 'won', timestamp: '3 days ago' },
  ]);

  useEffect(() => {
    if (isConnected) {
      // Simulate loading stats
      setTimeout(() => {
        setStats({
          totalBets: 42,
          wonBets: 25,
          lostBets: 12,
          pendingBets: 5,
          totalWinnings: 1250,
          winRate: 67.6,
          currentStreak: 3,
          bestStreak: 7,
          favoriteLeague: 'Premier League',
          totalSpent: 850,
          nftsOwned: 15
        });
      }, 500);
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <div className="profile-page">
        <div className="connect-prompt">
          <div className="prompt-icon">🔐</div>
          <h2>Connect Your Wallet</h2>
          <p>Connect your wallet to view your profile and betting history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-gradient">
            {account ? account.slice(2, 4).toUpperCase() : '??'}
          </div>
          <div className="avatar-badge">🏆</div>
        </div>
        <div className="profile-info">
          <h1>Your Profile</h1>
          <p className="wallet-address">{account}</p>
          <div className="profile-stats-quick">
            <div className="quick-stat">
              <span className="stat-value">{stats.totalBets}</span>
              <span className="stat-label">Total Bets</span>
            </div>
            <div className="quick-stat">
              <span className="stat-value">{stats.winRate}%</span>
              <span className="stat-label">Win Rate</span>
            </div>
            <div className="quick-stat">
              <span className="stat-value">{stats.currentStreak}</span>
              <span className="stat-label">Current Streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <h2>📊 Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalWinnings} RAGE</div>
              <div className="stat-label">Total Winnings</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.wonBets}</div>
              <div className="stat-label">Bets Won</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <div className="stat-value">{stats.lostBets}</div>
              <div className="stat-label">Bets Lost</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-value">{stats.pendingBets}</div>
              <div className="stat-label">Pending Bets</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <div className="stat-value">{stats.bestStreak}</div>
              <div className="stat-label">Best Streak</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎨</div>
            <div className="stat-content">
              <div className="stat-value">{stats.nftsOwned}</div>
              <div className="stat-label">NFTs Owned</div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="achievements-section">
        <h2>🏆 Achievements</h2>
        <div className="achievements-grid">
          {achievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-info">
                <div className="achievement-name">{achievement.name}</div>
                <div className="achievement-description">{achievement.description}</div>
              </div>
              {achievement.unlocked && <div className="unlock-badge">✓</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h2>📜 Recent Activity</h2>
        <div className="activity-list">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="activity-item">
              {activity.type === 'bet' ? (
                <>
                  <div className={`activity-icon bet-${activity.result}`}>
                    {activity.result === 'won' ? '🎉' : 
                     activity.result === 'lost' ? '😢' : '⏳'}
                  </div>
                  <div className="activity-details">
                    <div className="activity-title">
                      {activity.result === 'won' ? 'Won Bet' : 
                       activity.result === 'lost' ? 'Lost Bet' : 'Pending Bet'}
                    </div>
                    <div className="activity-description">
                      {activity.match} • {activity.amount} RAGE
                    </div>
                  </div>
                  <div className="activity-time">{activity.timestamp}</div>
                </>
              ) : (
                <>
                  <div className="activity-icon achievement">🏆</div>
                  <div className="activity-details">
                    <div className="activity-title">Achievement Unlocked!</div>
                    <div className="activity-description">{activity.name}</div>
                  </div>
                  <div className="activity-time">{activity.timestamp}</div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
