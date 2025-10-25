import { useWeb3 } from '../hooks/useWeb3';

export default function WalletConnect() {
  const {
    account,
    isConnecting,
    error,
    connectWallet,
    disconnect,
    isConnected,
    switchNetwork,
  } = useWeb3();

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="wallet-connect">
      {error && <div className="error-message">{error}</div>}
      
      {!isConnected ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="connect-button"
        >
          {isConnecting ? 'Connecting...' : '🔗 Connect Wallet'}
        </button>
      ) : (
        <div className="wallet-info">
          <div className="address">{formatAddress(account)}</div>
          <button onClick={disconnect} className="disconnect-button">
            Disconnect
          </button>
        </div>
      )}

      {isConnected && (
        <div className="network-switcher">
          <button onClick={() => switchNetwork('Monad_Testnet')}>
            Monad Testnet
          </button>
        </div>
      )}
    </div>
  );
}
