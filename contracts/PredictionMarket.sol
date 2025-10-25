// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RageNFT.sol";

/**
 * @title PredictionMarket
 * @dev Main contract for football prediction markets with AI trash talk
 */
contract PredictionMarket is ReentrancyGuard, Ownable {
    
    struct Market {
        uint256 marketId;
        string matchId;
        string team1;
        string team2;
        string aiTrashTalk;
        string aiPrediction;
        uint256 totalStake;
        uint256 agreeStake;
        uint256 disagreeStake;
        uint256 endTime;
        bool resolved;
        bool aiWasRight;
    }

    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => uint256)) public userStakes;
    mapping(uint256 => mapping(address => bool)) public userPredictions;
    mapping(uint256 => mapping(address => bool)) public hasClaimed;
    mapping(uint256 => mapping(address => uint256[])) public userNFTs;
    mapping(address => uint256) public userCorrectBets;
    mapping(address => uint256) public userTotalBets;
    mapping(address => uint256) public userWinnings;
    mapping(address => bool) public isInHallOfFame;
    mapping(address => bool) public isInHallOfShame;

    IERC20 public rageToken;
    RageNFT public nftContract;

    uint256 public marketCounter;
    uint256 public platformFeePercentage = 2; // 2% platform fee

    event MarketCreated(
        uint256 indexed marketId,
        string matchId,
        string team1,
        string team2,
        string aiTrashTalk,
        uint256 endTime
    );
    event BetPlaced(
        address indexed user,
        uint256 indexed marketId,
        uint256 amount,
        bool agreeWithAI,
        uint256 nftTokenId
    );
    event MarketResolved(uint256 indexed marketId, bool aiWasRight);
    event WinningsClaimed(address indexed user, uint256 indexed marketId, uint256 amount);
    event HallOfFameUpdated(address indexed user, bool inducted);
    event HallOfShameUpdated(address indexed user, bool inducted);
    event UserStatsUpdated(address indexed user, uint256 correctBets, uint256 totalBets, uint256 winnings);

    constructor(
        address _rageToken,
        address _nftContract
    ) Ownable(msg.sender) {
        rageToken = IERC20(_rageToken);
        nftContract = RageNFT(_nftContract);
    }

    /**
     * @dev Create a new prediction market
     */
    function createMarket(
        string memory matchId,
        string memory team1,
        string memory team2,
        string memory aiTrashTalk,
        string memory aiPrediction,
        uint256 durationSeconds
    ) external onlyOwner returns (uint256) {
        require(durationSeconds > 0, "Invalid duration");

        uint256 marketId = marketCounter++;
        markets[marketId] = Market({
            marketId: marketId,
            matchId: matchId,
            team1: team1,
            team2: team2,
            aiTrashTalk: aiTrashTalk,
            aiPrediction: aiPrediction,
            totalStake: 0,
            agreeStake: 0,
            disagreeStake: 0,
            endTime: block.timestamp + durationSeconds,
            resolved: false,
            aiWasRight: false
        });

        emit MarketCreated(marketId, matchId, team1, team2, aiTrashTalk, block.timestamp + durationSeconds);
        return marketId;
    }

    /**
     * @dev Resolve market manually (Web2 backend will call this)
     */
    function resolveMarket(uint256 marketId, bool aiWasRight) external onlyOwner {
        require(markets[marketId].marketId == marketId, "Market does not exist");
        require(!markets[marketId].resolved, "Already resolved");
        require(block.timestamp >= markets[marketId].endTime, "Market still open");

        markets[marketId].resolved = true;
        markets[marketId].aiWasRight = aiWasRight;

        emit MarketResolved(marketId, aiWasRight);
    }

    /**
     * @dev Place a bet on a market
     */
    function placeBet(
        uint256 marketId,
        bool agreeWithAI,
        uint256 amount
    ) external nonReentrant {
        require(markets[marketId].marketId == marketId, "Market does not exist");
        require(!markets[marketId].resolved, "Market resolved");
        require(block.timestamp < markets[marketId].endTime, "Market closed");
        require(amount > 0, "Invalid amount");
        require(userStakes[marketId][msg.sender] == 0, "Already placed bet");

        bool success = rageToken.transferFrom(msg.sender, address(this), amount);
        require(success, "Transfer failed");

        userStakes[marketId][msg.sender] = amount;
        userPredictions[marketId][msg.sender] = agreeWithAI;
        markets[marketId].totalStake += amount;
        
        // Update user stats
        userTotalBets[msg.sender]++;

        if (agreeWithAI) {
            markets[marketId].agreeStake += amount;
        } else {
            markets[marketId].disagreeStake += amount;
        }

        // Mint NFT for this prediction
        string memory matchInfo = string(
            abi.encodePacked(
                markets[marketId].team1,
                " vs ",
                markets[marketId].team2
            )
        );
        
        uint256 nftTokenId = nftContract.mintPredictionNFT(
            msg.sender,
            marketId,
            agreeWithAI,
            matchInfo
        );

        userNFTs[marketId][msg.sender].push(nftTokenId);

        emit BetPlaced(msg.sender, marketId, amount, agreeWithAI, nftTokenId);
    }

    /**
     * @dev Claim winnings after market resolution
     */
    function claimWinnings(uint256 marketId) external nonReentrant {
        require(markets[marketId].resolved, "Not resolved");
        require(!hasClaimed[marketId][msg.sender], "Already claimed");

        uint256 stake = userStakes[marketId][msg.sender];
        require(stake > 0, "No stake");

        bool userPrediction = userPredictions[marketId][msg.sender];
        bool aiWasRight = markets[marketId].aiWasRight;
        require(userPrediction == aiWasRight, "Wrong prediction");

        uint256 totalPool = markets[marketId].totalStake;
        uint256 platformFee = (totalPool * platformFeePercentage) / 100;
        uint256 winnerPool = totalPool - platformFee;

        uint256 totalWinnerStake = aiWasRight ? 
            markets[marketId].agreeStake : 
            markets[marketId].disagreeStake;

        require(totalWinnerStake > 0, "No winners");

        uint256 winnings = (stake * winnerPool) / totalWinnerStake;

        hasClaimed[marketId][msg.sender] = true;

        // Update user stats
        userCorrectBets[msg.sender]++;
        userWinnings[msg.sender] += winnings;
        
        // Check for Hall of Fame induction (80%+ accuracy with 10+ bets)
        if (userTotalBets[msg.sender] >= 10 && 
            (userCorrectBets[msg.sender] * 100) / userTotalBets[msg.sender] >= 80 &&
            !isInHallOfFame[msg.sender]) {
            isInHallOfFame[msg.sender] = true;
            emit HallOfFameUpdated(msg.sender, true);
        }
        
        // Check for Hall of Shame induction (20% or less accuracy with 10+ bets)
        if (userTotalBets[msg.sender] >= 10 && 
            (userCorrectBets[msg.sender] * 100) / userTotalBets[msg.sender] <= 20 &&
            !isInHallOfShame[msg.sender]) {
            isInHallOfShame[msg.sender] = true;
            emit HallOfShameUpdated(msg.sender, true);
        }

        // Evolve NFT to trophy state
        uint256[] memory nfts = userNFTs[marketId][msg.sender];
        for (uint256 i = 0; i < nfts.length; i++) {
            nftContract.evolveNFT(nfts[i], true);
        }

        bool success = rageToken.transfer(msg.sender, winnings);
        require(success, "Transfer failed");

        emit WinningsClaimed(msg.sender, marketId, winnings);
        emit UserStatsUpdated(msg.sender, userCorrectBets[msg.sender], userTotalBets[msg.sender], userWinnings[msg.sender]);
    }

    /**
     * @dev Evolve NFTs for losers (called by anyone)
     */
    function evolveLoserNFTs(uint256 marketId, address user) external {
        require(markets[marketId].resolved, "Not resolved");
        
        bool userPrediction = userPredictions[marketId][user];
        bool aiWasRight = markets[marketId].aiWasRight;
        
        if (userPrediction != aiWasRight) {
            uint256[] memory nfts = userNFTs[marketId][user];
            for (uint256 i = 0; i < nfts.length; i++) {
                nftContract.evolveNFT(nfts[i], false);
            }
        }
    }

    /**
     * @dev Get market details
     */
    function getMarket(uint256 marketId) external view returns (Market memory) {
        return markets[marketId];
    }

    /**
     * @dev Get user's NFTs for a market
     */
    function getUserNFTs(uint256 marketId, address user) external view returns (uint256[] memory) {
        return userNFTs[marketId][user];
    }

    /**
     * @dev Calculate current odds
     */
    function getOdds(uint256 marketId) external view returns (uint256 agreeOdds, uint256 disagreeOdds) {
        Market memory market = markets[marketId];
        
        if (market.totalStake == 0) {
            return (100, 100); // 1:1 odds initially
        }

        // Calculate odds as percentage returns
        agreeOdds = market.agreeStake > 0 ? 
            (market.totalStake * 100) / market.agreeStake : 200;
        disagreeOdds = market.disagreeStake > 0 ? 
            (market.totalStake * 100) / market.disagreeStake : 200;
    }

    /**
     * @dev Get user statistics
     */
    function getUserStats(address user) external view returns (
        uint256 correctBets,
        uint256 totalBets,
        uint256 winnings,
        bool inHallOfFame,
        bool inHallOfShame,
        uint256 accuracy
    ) {
        correctBets = userCorrectBets[user];
        totalBets = userTotalBets[user];
        winnings = userWinnings[user];
        inHallOfFame = isInHallOfFame[user];
        inHallOfShame = isInHallOfShame[user];
        accuracy = totalBets > 0 ? (correctBets * 100) / totalBets : 0;
    }

    /**
     * @dev Get Hall of Fame members (simplified - in real app would be more complex)
     */
    function isHallOfFameMember(address user) external view returns (bool) {
        return isInHallOfFame[user];
    }

    /**
     * @dev Get Hall of Shame members (simplified - in real app would be more complex)
     */
    function isHallOfShameMember(address user) external view returns (bool) {
        return isInHallOfShame[user];
    }

    /**
     * @dev Update platform fee
     */
    function updatePlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 10, "Fee too high");
        platformFeePercentage = newFee;
    }

    /**
     * @dev Withdraw platform fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = rageToken.balanceOf(address(this));
        // Calculate unclaimed funds
        uint256 totalUnclaimed = 0;
        for (uint256 i = 0; i < marketCounter; i++) {
            if (markets[i].resolved) {
                totalUnclaimed += markets[i].totalStake;
            }
        }
        
        uint256 withdrawable = balance > totalUnclaimed ? balance - totalUnclaimed : 0;
        require(withdrawable > 0, "No fees to withdraw");
        
        bool success = rageToken.transfer(msg.sender, withdrawable);
        require(success, "Transfer failed");
    }
}
