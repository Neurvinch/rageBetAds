import { useState, useEffect } from 'react';
import { useWeb3 } from '../hooks/useWeb3';

export default function HeroSection() {
  const { isConnected, connectWallet } = useWeb3();
  const [stats, setStats] = useState({
    totalBets: 0,
    activeBettors: 0,
    totalVolume: 0,
    biggestWin: 0
  });

  useEffect(() => {
    // Simulate animated counter
    const interval = setInterval(() => {
      setStats(prev => ({
        totalBets: Math.min(prev.totalBets + 137, 15847),
        activeBettors: Math.min(prev.activeBettors + 12, 2456),
        totalVolume: Math.min(prev.totalVolume + 5420, 847230),
        biggestWin: Math.min(prev.biggestWin + 89, 12500)
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-section">
      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-badge">🔥 AI-Powered Predictions</div>
          <h1 className="hero-title">
            Bet Smart with <span className="gradient-text">AI Predictions</span>
          </h1>
          <p className="hero-description">
            Challenge the AI, trust your instincts, and win big with decentralized betting on the blockchain.
            Get savage AI predictions with real-time match data.
          </p>
          <div className="hero-actions">
            {!isConnected ? (
              <button className="hero-btn primary" onClick={connectWallet}>
                🚀 Start Betting Now
              </button>
            ) : (
              <button className="hero-btn primary">
                ⚡ Place Your Bet
              </button>
            )}
            <button className="hero-btn secondary">
              📖 How It Works
            </button>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat-card animated">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{stats.totalBets.toLocaleString()}</div>
            <div className="stat-label">Total Bets Placed</div>
          </div>
          <div className="stat-card animated">
            <div className="stat-icon">👥</div>
            <div className="stat-value">{stats.activeBettors.toLocaleString()}</div>
            <div className="stat-label">Active Bettors</div>
          </div>
          <div className="stat-card animated">
            <div className="stat-icon">💰</div>
            <div className="stat-value">${stats.totalVolume.toLocaleString()}</div>
            <div className="stat-label">Total Volume</div>
          </div>
          <div className="stat-card animated">
            <div className="stat-icon">🏆</div>
            <div className="stat-value">${stats.biggestWin.toLocaleString()}</div>
            <div className="stat-label">Biggest Win</div>
          </div>
        </div>
      </div>

      <div className="hero-features">
        <div className="feature-card">
          <div className="feature-icon">🤖</div>
          <h3>AI-Powered Analysis</h3>
          <p>Advanced algorithms analyze team stats, form, and historical data</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⛓️</div>
          <h3>Decentralized & Fair</h3>
          <p>Smart contracts ensure transparent and tamper-proof betting</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎨</div>
          <h3>Dynamic NFT Rewards</h3>
          <p>Earn unique NFTs - Trophy for wins, Roasted for losses</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔥</div>
          <h3>Savage Trash Talk</h3>
          <p>AI roasts losing teams with hilarious predictions</p>
        </div>
      </div>

      <div className="hero-background">
        <div className="hero-circle circle-1"></div>
        <div className="hero-circle circle-2"></div>
        <div className="hero-circle circle-3"></div>
      </div>
    </div>
  );
}
