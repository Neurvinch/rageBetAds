# 🚀 Rage Bet Smart Contracts - Remix Deployment Guide

## 📋 **Pre-Deployment Checklist**

### ✅ **Contract Dependencies**
- **OpenZeppelin Contracts**: Required for ERC20, ERC721, Ownable, ReentrancyGuard
- **Solidity Version**: ^0.8.20
- **Network**: Monad Testnet (Chain ID: 10143)

### ✅ **Contract Files Ready**
1. `RageToken.sol` - ERC20 token contract
2. `RageNFT.sol` - Dynamic NFT contract  
3. `PredictionMarket.sol` - Main prediction market contract

---

## 🎯 **Deployment Order (CRITICAL)**

### **1️⃣ Deploy RageToken.sol**
```solidity
// Constructor: No parameters
constructor() ERC20("RageBet Token", "RAGE") Ownable(msg.sender)
```

### **2️⃣ Deploy RageNFT.sol** 
```solidity
// Constructor: No parameters
constructor() ERC721("RageBet NFT", "RAGE") Ownable(msg.sender)
```

### **3️⃣ Deploy PredictionMarket.sol**
```solidity
// Constructor: Requires RageToken and RageNFT addresses
constructor(address _rageToken, address _nftContract)
```

### **4️⃣ Set Contract Permissions**
```solidity
// Call on RageNFT contract:
setMinter(address predictionMarketAddress)

// Call on PredictionMarket contract:
// (No additional setup needed)
```

---

## 🔧 **Remix Deployment Steps**

### **Step 1: Setup Remix**
1. Go to [remix.ethereum.org](https://remix.ethereum.org)
2. Create new workspace: "RageBet"
3. Upload contract files to `contracts/` folder

### **Step 2: Install Dependencies**
1. Go to **File Manager** → **Create New File** → `remix_dependencies.json`
2. Add OpenZeppelin contracts:
```json
{
  "dependencies": {
    "@openzeppelin/contracts": "^4.9.0"
  }
}
```

### **Step 3: Configure Network**
1. Go to **Deploy & Run Transactions**
2. Select **Injected Provider - MetaMask**
3. Add Monad Testnet to MetaMask:
   - **Network Name**: Monad Testnet
   - **RPC URL**: `https://testnet-rpc.monad.xyz`
   - **Chain ID**: `10143`
   - **Currency Symbol**: `MON`
   - **Block Explorer**: `https://testnet.monadexplorer.com`

### **Step 4: Deploy Contracts**

#### **🚀 Deploy RageToken.sol**
1. Select `RageToken.sol` in file explorer
2. Click **Compile** (should show ✅)
3. Go to **Deploy & Run Transactions**
4. Select `RageToken` from dropdown
5. Click **Deploy** (no constructor parameters)
6. **Copy the contract address** ⚠️

#### **🚀 Deploy RageNFT.sol**
1. Select `RageNFT.sol` in file explorer
2. Click **Compile** (should show ✅)
3. Go to **Deploy & Run Transactions**
4. Select `RageNFT` from dropdown
5. Click **Deploy** (no constructor parameters)
6. **Copy the contract address** ⚠️

#### **🚀 Deploy PredictionMarket.sol**
1. Select `PredictionMarket.sol` in file explorer
2. Click **Compile** (should show ✅)
3. Go to **Deploy & Run Transactions**
4. Select `PredictionMarket` from dropdown
5. **Constructor Parameters**:
   - `_rageToken`: [RageToken contract address]
   - `_nftContract`: [RageNFT contract address]
6. Click **Deploy**
7. **Copy the contract address** ⚠️

### **Step 5: Set Permissions**
1. **In RageNFT contract**:
   - Find `setMinter` function
   - Enter PredictionMarket contract address
   - Click **transact**

---

## 📝 **Contract Addresses (Update After Deployment)**

After deployment, update these addresses in `frontend/src/config/contracts.js`:

```javascript
export const CONTRACTS = {
  PREDICTION_MARKET: {
    address: '0x...', // ← Update with deployed address
    abi: [...]
  },
  RAGE_TOKEN: {
    address: '0x...', // ← Update with deployed address  
    abi: [...]
  },
  RAGE_NFT: {
    address: '0x...', // ← Update with deployed address
    abi: [...]
  }
};
```

---

## 🧪 **Testing Deployment**

### **Test RageToken**
```javascript
// Check total supply
await rageToken.totalSupply()
// Should return: 1000000000000000000000000000 (1 billion tokens)

// Check balance
await rageToken.balanceOf(deployerAddress)
// Should return: 1000000000000000000000000000
```

### **Test RageNFT**
```javascript
// Check name and symbol
await rageNFT.name() // Should return: "RageBet NFT"
await rageNFT.symbol() // Should return: "RAGE"

// Check minter
await rageNFT.minter() // Should return: PredictionMarket address
```

### **Test PredictionMarket**
```javascript
// Check token and NFT addresses
await predictionMarket.rageToken() // Should return: RageToken address
await predictionMarket.nftContract() // Should return: RageNFT address

// Check market counter
await predictionMarket.marketCounter() // Should return: 0
```

---

## ⚠️ **Common Issues & Solutions**

### **Issue 1: "Contract not found"**
- **Solution**: Make sure all contracts are compiled successfully
- **Check**: Green checkmark next to contract names

### **Issue 2: "Insufficient funds"**
- **Solution**: Get testnet MON tokens from faucet
- **Faucet**: [Monad Testnet Faucet](https://testnet-faucet.monad.xyz)

### **Issue 3: "Transaction failed"**
- **Solution**: Check gas limit (set to 3,000,000)
- **Check**: Network connection and MetaMask

### **Issue 4: "Constructor parameters"**
- **Solution**: Deploy in correct order (Token → NFT → Market)
- **Check**: Use correct contract addresses

---

## 🔗 **Network Configuration**

### **Monad Testnet Details**
- **Chain ID**: 10143
- **RPC URL**: `https://testnet-rpc.monad.xyz`
- **Block Explorer**: `https://testnet.monadexplorer.com`
- **Currency**: MON
- **Gas Price**: Auto

### **MetaMask Setup**
1. Open MetaMask
2. Click **Networks** → **Add Network**
3. Enter Monad Testnet details
4. Save and switch to Monad Testnet

---

## 📊 **Post-Deployment Verification**

### **✅ Contract Verification Checklist**
- [ ] RageToken deployed and minted 1B tokens
- [ ] RageNFT deployed with correct permissions
- [ ] PredictionMarket deployed with correct dependencies
- [ ] RageNFT minter set to PredictionMarket address
- [ ] All contracts verified on block explorer
- [ ] Frontend config updated with new addresses

### **✅ Functionality Tests**
- [ ] Create test market
- [ ] Place test bet
- [ ] Mint test NFT
- [ ] Check user stats
- [ ] Verify Hall of Fame/Shame logic

---

## 🚨 **Security Notes**

### **⚠️ Important Security Considerations**
1. **Private Keys**: Never share private keys or seed phrases
2. **Testnet Only**: These contracts are for testing only
3. **Gas Limits**: Set appropriate gas limits for transactions
4. **Verification**: Verify contracts on block explorer after deployment
5. **Permissions**: Double-check minter permissions are set correctly

### **🔒 Access Control**
- **Owner**: Can create markets, resolve markets, update fees
- **Minter**: Only PredictionMarket can mint NFTs
- **Users**: Can place bets, claim winnings, view stats

---

## 📞 **Support**

If you encounter issues during deployment:
1. Check the **Remix console** for error messages
2. Verify **MetaMask** is connected to Monad Testnet
3. Ensure **gas limits** are sufficient
4. Check **contract addresses** are correct
5. Verify **OpenZeppelin dependencies** are installed

---

## 🎉 **Ready for Launch!**

Once all contracts are deployed and verified:
1. Update frontend configuration with contract addresses
2. Test the complete flow in the application
3. Create your first prediction market
4. Start betting on AI predictions! 🚀⚽🏆

**Good luck with your deployment!** 🎯
