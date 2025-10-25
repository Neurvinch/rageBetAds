# 🔧 Rage Bet - Complete Setup Guide

This guide will walk you through setting up the entire Rage Bet platform from scratch.

## 📋 Prerequisites

### Required Software
- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **Python** 3.11 or higher ([Download](https://www.python.org/))
- **Git** ([Download](https://git-scm.com/))
- **MetaMask** browser extension ([Install](https://metamask.io/))

### Required Accounts
1. **WalletConnect Project** - [Create here](https://cloud.walletconnect.com/)
2. **Base Sepolia Testnet Funds** - [Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
3. **Chainlink Node** (optional for custom oracle)

## 🎯 Step-by-Step Setup

### Step 1: Environment Setup

```bash
# Clone the repository
cd rageBetAds

# Copy environment template
cp .env.example .env
```

Edit `.env` file with your configuration:

```bash
# Essential Configuration
PRIVATE_KEY=your_wallet_private_key_here
WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
BASE_TESTNET_RPC=https://sepolia.base.org

# Chainlink Configuration (get from Chainlink docs)
LINK_TOKEN_ADDRESS=0x...  # Base Sepolia LINK token
CHAINLINK_ORACLE_ADDRESS=0x...
CHAINLINK_JOB_ID=0x...
```

### Step 2: Smart Contract Deployment

```bash
cd contracts

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to Base Sepolia testnet
npx hardhat run scripts/deploy.js --network baseTestnet
```

**Expected Output:**
```
🚀 Deploying Rage Bet Contracts...

Deployer address: 0x...
✅ RageToken deployed to: 0x...
✅ AIOracle deployed to: 0x...
✅ RageNFT deployed to: 0x...
✅ PredictionMarket deployed to: 0x...

📄 Deployment data saved to: deployment-baseTestnet-latest.json
```

**Important:** Copy all contract addresses and save them!

### Step 3: Contract Verification

```bash
# Verify on BaseScan (use addresses from deployment)
npx hardhat verify --network baseTestnet <RAGE_TOKEN_ADDRESS>

npx hardhat verify --network baseTestnet <AI_ORACLE_ADDRESS> \
  "<LINK_TOKEN>" "<CHAINLINK_ORACLE>" "<JOB_ID>" "100000000000000000"

npx hardhat verify --network baseTestnet <RAGE_NFT_ADDRESS>

npx hardhat verify --network baseTestnet <PREDICTION_MARKET_ADDRESS> \
  "<RAGE_TOKEN_ADDRESS>" "<AI_ORACLE_ADDRESS>" "<RAGE_NFT_ADDRESS>"
```

### Step 4: Fund Contracts

You need to fund the AIOracle with LINK tokens:

```bash
# Get LINK tokens from Base Sepolia faucet
# Then send to AIOracle address
```

### Step 5: Backend API Setup

```bash
cd ../backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env if needed (defaults should work)

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Test Backend:**
Visit http://localhost:8000/docs to see API documentation

### Step 6: Frontend Setup

```bash
cd ../web

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

Edit `.env.local` with your deployed contract addresses:

```bash
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x...
NEXT_PUBLIC_RAGE_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_RAGE_NFT_ADDRESS=0x...
NEXT_PUBLIC_AI_ORACLE_ADDRESS=0x...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_CHAIN_ID=84532
```

Start the frontend:

```bash
npm run dev
```

Visit http://localhost:3000 🎉

### Step 7: Configure MetaMask

1. Open MetaMask
2. Click Networks → Add Network
3. Add Base Sepolia:
   - **Network Name:** Base Sepolia
   - **RPC URL:** https://sepolia.base.org
   - **Chain ID:** 84532
   - **Currency Symbol:** ETH
   - **Block Explorer:** https://sepolia.basescan.org

### Step 8: Get Test Tokens

```bash
# Get Base Sepolia ETH from faucet
# Visit: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

# Mint test RAGE tokens
# Use Hardhat console or Remix to call RageToken.mint()
```

### Step 9: Create First Market

You can create a market using Hardhat console:

```bash
cd contracts
npx hardhat console --network baseTestnet
```

Then in console:

```javascript
const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
const market = await PredictionMarket.attach("YOUR_MARKET_ADDRESS");

// Create a test market
await market.createMarket(
  "12345",  // matchId from SportsDB
  "Manchester United",
  "Liverpool",
  "🔥 Man United looking weak! Liverpool about to expose them! AI confidence: 87%",
  "Liverpool to WIN",
  86400  // 24 hours in seconds
);
```

### Step 10: Test Full Flow

1. **Connect Wallet** - Click "Connect Wallet" on frontend
2. **View Markets** - Navigate to Markets page
3. **Place Bet** - Select a market and place a bet
4. **Check NFT** - View your prediction NFT in wallet
5. **Wait for Resolution** - After match ends
6. **Claim Winnings** - If you won, claim your rewards

## 🔧 Troubleshooting

### Issue: Transactions Failing

**Solution:** 
- Check you have enough ETH for gas
- Verify contract addresses are correct
- Ensure token approval is done before betting

### Issue: Backend Not Connecting

**Solution:**
- Check backend is running on port 8000
- Verify CORS settings in `main.py`
- Check firewall settings

### Issue: NFTs Not Showing

**Solution:**
- NFTs may take time to appear in wallet
- Check on BaseScan if NFT was minted
- Import NFT contract address manually in MetaMask

### Issue: Market Creation Fails

**Solution:**
- Ensure you're the contract owner
- Check matchId format from SportsDB
- Verify endTime is in future

## 🚀 Production Deployment

### Backend (Railway/Render)

1. Push code to GitHub
2. Connect to Railway/Render
3. Set environment variables
4. Deploy

### Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd web
vercel --prod
```

### Smart Contracts (Mainnet)

1. Get professional security audit
2. Use multisig wallet for deployment
3. Deploy with same scripts to Base mainnet
4. Verify all contracts
5. Set up monitoring

## 📊 Monitoring

### Contract Events

Monitor contract events on BaseScan:
- MarketCreated
- BetPlaced
- MarketResolved
- WinningsClaimed

### Backend Health

Check backend health:
```bash
curl http://localhost:8000/health
```

### Frontend Analytics

Add Google Analytics or Mixpanel for tracking:
- Wallet connections
- Bet placements
- Market views
- NFT mints

## 🔐 Security Checklist

- [ ] Never commit `.env` file
- [ ] Use hardware wallet for mainnet deployment
- [ ] Enable 2FA on all accounts
- [ ] Set up contract upgrade mechanism
- [ ] Monitor for unusual activity
- [ ] Have emergency pause function
- [ ] Keep private keys secure
- [ ] Regular security audits

## 📚 Next Steps

1. **Add More Markets** - Create markets for upcoming matches
2. **Improve AI** - Fine-tune trash talk generation
3. **Add Features** - Leaderboards, achievements, etc.
4. **Marketing** - Share on Twitter, Discord
5. **Community** - Get feedback and iterate
6. **Scale** - Deploy to mainnet when ready

## 💡 Tips

- Test everything on testnet first
- Start with small markets
- Monitor gas costs
- Engage with community early
- Document everything
- Keep code clean and commented

## 🆘 Need Help?

- Check README.md for general info
- Review contract code comments
- Join our Discord (link in README)
- Open GitHub issue
- Email: support@ragebet.ai

---

**Good luck building! 🔥**

Remember: This is experimental software. Always test thoroughly before mainnet deployment.
