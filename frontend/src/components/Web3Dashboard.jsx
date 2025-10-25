import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../hooks/useWeb3';
import { usePredictionMarket } from '../hooks/useContract';

export default function Web3Dashboard() {
  const { account, connectWallet } = useWeb3();
  const { 
    getTokenBalance,
    getUserStats,
    getUserNFTs,
    getMarketCount,
    getMarket,
    loading,
    error 
  } = usePredictionMarket();

  const [tokenBalance, setTokenBalance] = useState('0');
  const [userStats, setUserStats] = useState(null);
  const [userNFTs, setUserNFTs] = useState([]);
  const [marketCount, setMarketCount] = useState(0);
  const [markets, setMarkets] = useState([]);

  useEffect(() => {
    if (account) {
      loadUserData();
    }
  }, [account]);

  const loadUserData = async () => {
    try {
      // Load token balance
      const balance = await getTokenBalance(account);
      setTokenBalance(balance || '0');

      // Load user stats
      const stats = await getUserStats(account);
      setUserStats(stats);

      // Load user NFTs
      const nfts = await getUserNFTs(account);
      setUserNFTs(nfts);

      // Load market count
      const count = await getMarketCount();
      setMarketCount(count);

      // Load recent markets
      const recentMarkets = [];
      for (let i = Math.max(0, count - 5); i < count; i++) {
        try {
          const market = await getMarket(i);
          if (market) {
            recentMarkets.push({ id: i, ...market });
          }
        } catch (err) {
          console.error(`Error loading market ${i}:`, err);
        }
      }
      setMarkets(recentMarkets);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  if (!account) {
    return (
      <div className="web3-dashboard">
        <div className="connect-wallet-section">
          <h2>🔗 Connect Your Wallet</h2>
          <p>Connect your wallet to start betting on AI predictions!</p>
          <button className="connect-wallet-btn" onClick={connectWallet}>
            🦊 Connect MetaMask
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="web3-dashboard">
      <div className="dashboard-header">
        <h2>🎯 Your Rage Bet Dashboard</h2>
        <div className="wallet-info">
          <span className="wallet-address">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Token Balance */}
        <div className="dashboard-card">
          <h3>💰 Token Balance</h3>
          <div className="balance-display">
            <span className="balance-amount">{parseFloat(tokenBalance).toFixed(2)}</span>
            <span className="balance-currency">MON</span>
          </div>
        </div>

        {/* User Stats */}
        {userStats && (
          <div className="dashboard-card">
            <h3>📊 Your Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Bets:</span>
                <span className="stat-value">{userStats.totalBets}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Correct Bets:</span>
                <span className="stat-value">{userStats.correctBets}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Accuracy:</span>
                <span className="stat-value">{userStats.accuracy}%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Winnings:</span>
                <span className="stat-value">{parseFloat(userStats.winnings).toFixed(2)} MON</span>
              </div>
            </div>
            
            {userStats.inHallOfFame && (
              <div className="hall-of-fame">
                <span className="trophy-icon">🏆</span>
                <span className="hall-text">Hall of Fame Member!</span>
              </div>
            )}
            
            {userStats.inHallOfShame && (
              <div className="hall-of-shame">
                <span className="clown-icon">🤡</span>
                <span className="hall-text">Hall of Shame Member!</span>
              </div>
            )}
          </div>
        )}

        {/* User NFTs */}
        <div className="dashboard-card">
          <h3>🎨 Your NFTs ({userNFTs.length})</h3>
          <div className="nft-grid">
            {userNFTs.length === 0 ? (
              <p className="no-nfts">No NFTs yet. Place some bets to earn NFTs!</p>
            ) : (
              userNFTs.map((nft, index) => (
                <div key={index} className="nft-card">
                  <div className="nft-id">#{nft.tokenId}</div>
                  <div className="nft-status">
                    {nft.resolved ? (
                      nft.wonBet ? (
                        <span className="trophy">🏆 Trophy</span>
                      ) : (
                        <span className="roasted">🔥 Roasted</span>
                      )
                    ) : (
                      <span className="pending">⏳ Pending</span>
                    )}
                  </div>
                  <div className="nft-prediction">
                    {nft.prediction ? 'AI Right' : 'AI Wrong'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Markets */}
        <div className="dashboard-card">
          <h3>🏟️ Recent Markets ({marketCount})</h3>
          <div className="markets-list">
            {markets.length === 0 ? (
              <p className="no-markets">No markets available yet.</p>
            ) : (
              markets.map((market) => (
                <div key={market.id} className="market-item">
                  <div className="market-teams">
                    {market.team1} vs {market.team2}
                  </div>
                  <div className="market-status">
                    {market.resolved ? (
                      <span className="resolved">✅ Resolved</span>
                    ) : (
                      <span className="active">🟢 Active</span>
                    )}
                  </div>
                  <div className="market-stakes">
                    <span>Total: {parseFloat(market.totalStake).toFixed(2)} MON</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <span>Loading Web3 data...</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}
    </div>
  );
}
