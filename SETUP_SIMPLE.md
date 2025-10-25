# Simple Setup Guide

## Step 1: Deploy Contracts (Remix)

1. Go to https://remix.ethereum.org/
2. Create new files and copy contracts:
   - `AIOracle.sol`
   - `RageToken.sol`
   - `RageNFT.sol`
   - `PredictionMarket.sol`

3. Compile each (Solidity 0.8.20)

4. Deploy on Base Sepolia:
   - Connect MetaMask
   - Switch to Base Sepolia network
   - Deploy RageToken first
   - Deploy AIOracle (need LINK token address)
   - Deploy RageNFT
   - Deploy PredictionMarket (needs all addresses above)

5. After deploying PredictionMarket:
   - Call `rageNFT.setMinter(predictionMarketAddress)`

6. **Save all addresses!**

## Step 2: Setup Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Test: http://localhost:8000/docs

## Step 3: Configure Frontend

```bash
cd frontend

# Create .env file
copy .env.example .env

# Edit .env and add your contract addresses:
VITE_PREDICTION_MARKET_ADDRESS=0x...
VITE_RAGE_TOKEN_ADDRESS=0x...
VITE_RAGE_NFT_ADDRESS=0x...

# Install dependencies
npm install

# Start dev server
npm run dev
```

## Step 4: Test It!

1. Open http://localhost:5173
2. Connect MetaMask
3. Switch to Base Sepolia
4. You should see "Connected" with your address

## Usage

### Create a Market (Owner Only)

In Remix, call `PredictionMarket.createMarket()`:
```
matchId: "12345"
team1: "Man United"
team2: "Liverpool"
aiTrashTalk: "🔥 Man United getting roasted! AI says Liverpool dominates!"
aiPrediction: "Liverpool to WIN"
durationSeconds: 86400  (24 hours)
```

### Place a Bet (Frontend)

```javascript
import { usePredictionMarket } from './hooks/useContract';
import { CONTRACTS } from './config/contracts';
import { ethers } from 'ethers';

// In your component:
const { placeBet } = usePredictionMarket(
  CONTRACTS.PREDICTION_MARKET.address,
  CONTRACTS.PREDICTION_MARKET.abi
);

// First approve tokens
const amount = ethers.parseEther("100"); // 100 RAGE
await rageToken.approve(predictionMarketAddress, amount);

// Then place bet
await placeBet(0, true, amount); // marketId=0, agree=true, amount
```

## Troubleshooting

**"Insufficient funds"**
- Get Base Sepolia ETH from faucet

**"Contract not deployed"**
- Check your contract addresses in `.env`
- Make sure you're on Base Sepolia network

**"Transaction failed"**
- Approve RAGE tokens first
- Check you have enough gas

**Backend not connecting**
- Make sure it's running on port 8000
- Check CORS is enabled

## That's It!

Keep it simple:
- Contracts in Remix
- Backend in terminal
- Frontend in your React app
- No Docker, no Hardhat complexity!
