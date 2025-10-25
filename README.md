# 🔥 Rage Bet - AI-Powered Football Prediction Platform

Decentralized prediction market where AI trash-talks football matches and users bet on whether the AI is right or wrong.

## 🎯 Features

- **AI Trash Talk** - Savage predictions powered by real SportsDB match data
- **Decentralized Betting** - $RAGE tokens on Base blockchain  
- **Dynamic NFTs** - Trophy for wins, Roasted for losses
- **Chainlink Oracles** - Verifiable results (NO MOCK DATA)
- **React + Vite** - Fast, modern frontend
- **Remix Ready** - Deploy contracts easily

## 🏗️ Architecture

```
React + Vite Frontend
        │
        ├──────────────┐
        │              │
Smart Contracts    FastAPI Backend
    (Base)         (AI Engine)
        │              │
   Chainlink       SportsDB API
    Oracle
```

## 📦 Project Structure

```
rageBetAds/
├── contracts/              # Solidity contracts (deploy in Remix)
│   ├── AIOracle.sol
│   ├── PredictionMarket.sol
│   ├── RageToken.sol
│   └── RageNFT.sol
├── backend/               # FastAPI backend
│   ├── main.py
│   └── requirements.txt
└── frontend/             # Your React + Vite app
    ├── src/
    │   ├── config/       # Contract ABIs
    │   ├── hooks/        # Web3 hooks
    │   └── components/   # React components
    └── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- MetaMask wallet
- Base Sepolia testnet ETH

### 1. Deploy Smart Contracts (Remix)

1. Go to [Remix IDE](https://remix.ethereum.org/)
2. Upload contracts from `/contracts` folder
3. Compile each contract
4. Deploy in this order:
   - RageToken.sol
   - AIOracle.sol (with LINK token address)
   - RageNFT.sol
   - PredictionMarket.sol (with token addresses)
5. Copy deployed addresses

### 2. Setup Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at http://localhost:8000

### 3. Setup Frontend

```bash
cd frontend
npm install

# Copy .env file and add your contract addresses
cp .env.example .env

# Run dev server
npm run dev
```

Frontend runs at http://localhost:5173

## ⚙️ Configuration

Update `frontend/.env`:
```bash
VITE_API_URL=http://localhost:8000
VITE_PREDICTION_MARKET_ADDRESS=0x...  # From Remix
VITE_RAGE_TOKEN_ADDRESS=0x...
VITE_RAGE_NFT_ADDRESS=0x...
```

## 📝 How to Use

1. **Deploy Contracts** in Remix
2. **Update** contract addresses in `frontend/.env`
3. **Start Backend**: `uvicorn main:app --reload`
4. **Start Frontend**: `npm run dev`
5. **Connect Wallet** in the app
6. **Create Markets** (owner only)
7. **Place Bets** and get NFTs!
8. **Claim Winnings** after resolution

## 🔧 Frontend Integration

Your React app now has:
- `useWeb3()` - Wallet connection hook
- `useContract()` - Contract interaction hook
- `WalletConnect` - Wallet UI component
- Contract ABIs in `src/config/contracts.js`

Example usage:
```jsx
import { useWeb3 } from './hooks/useWeb3';
import WalletConnect from './components/WalletConnect';

function App() {
  const { account, isConnected } = useWeb3();
  
  return (
    <>
      <WalletConnect />
      {isConnected && <p>Connected: {account}</p>}
    </>
  );
}
```

## 🔗 API Endpoints

Backend API (http://localhost:8000/docs):
- `POST /api/trash-talk` - Generate AI predictions
- `GET /api/match/{match_id}` - Get match results
- `GET /api/upcoming/{league_id}` - Upcoming matches
- `POST /chainlink` - Oracle adapter

## 🛠️ Tech Stack

- **Contracts**: Solidity 0.8.20, OpenZeppelin, Chainlink
- **Backend**: Python, FastAPI, SportsDB API
- **Frontend**: React 19, Vite, Ethers.js
- **Blockchain**: Base (EVM)

## 📚 Files Overview

**Smart Contracts** (contracts/):
- `PredictionMarket.sol` - Main betting logic
- `AIOracle.sol` - Chainlink oracle integration
- `RageToken.sol` - ERC20 utility token
- `RageNFT.sol` - Dynamic NFTs

**Backend** (backend/):
- `main.py` - FastAPI server with SportsDB integration
- Real match data, NO MOCKS

**Frontend Integration** (frontend/src/):
- `hooks/useWeb3.js` - Wallet connection
- `hooks/useContract.js` - Contract calls
- `components/WalletConnect.jsx` - UI component
- `config/contracts.js` - ABIs and addresses

## ⚠️ Important Notes

- Deploy contracts in Remix IDE (easier than Hardhat)
- Update contract addresses in `.env` after deployment
- Get Base Sepolia ETH from faucet
- Backend uses real SportsDB API (NO MOCK DATA)
- Install ethers.js: `npm install ethers axios`

## 🚀 That's It!

Simple setup, no Docker, no complex configurations. Just:
1. Deploy in Remix
2. Run backend
3. Run your React app
4. Start betting! 🔥
