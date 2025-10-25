// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title RageNFT
 * @dev Dynamic NFTs that evolve based on bet outcomes
 */
contract RageNFT is ERC721URIStorage, Ownable {
    using Strings for uint256;

    struct NFTMetadata {
        uint256 marketId;
        bool prediction;
        bool resolved;
        bool wonBet;
        uint256 timestamp;
        string matchInfo;
    }

    mapping(uint256 => NFTMetadata) public nftData;
    uint256 private _tokenIds;

    // IPFS base URIs for different states
    string public pendingBaseURI = "ipfs://QmPending/";
    string public trophyBaseURI = "ipfs://QmTrophy/";
    string public roastedBaseURI = "ipfs://QmRoasted/";

    // Authorized minter (PredictionMarket contract)
    address public minter;

    event NFTMinted(uint256 indexed tokenId, address indexed to, uint256 marketId, bool prediction);
    event NFTEvolved(uint256 indexed tokenId, bool won);

    constructor() ERC721("RageBet NFT", "RAGE") Ownable(msg.sender) {}

    modifier onlyMinter() {
        require(msg.sender == minter, "Not authorized minter");
        _;
    }

    /**
     * @dev Set the authorized minter address
     */
    function setMinter(address _minter) external onlyOwner {
        minter = _minter;
    }

    /**
     * @dev Update IPFS base URIs
     */
    function updateBaseURIs(
        string memory _pendingURI,
        string memory _trophyURI,
        string memory _roastedURI
    ) external onlyOwner {
        pendingBaseURI = _pendingURI;
        trophyBaseURI = _trophyURI;
        roastedBaseURI = _roastedURI;
    }

    /**
     * @dev Mint prediction NFT
     */
    function mintPredictionNFT(
        address to,
        uint256 marketId,
        bool prediction,
        string memory matchInfo
    ) external onlyMinter returns (uint256) {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        _safeMint(to, newTokenId);

        nftData[newTokenId] = NFTMetadata({
            marketId: marketId,
            prediction: prediction,
            resolved: false,
            wonBet: false,
            timestamp: block.timestamp,
            matchInfo: matchInfo
        });

        string memory tokenURI = string(abi.encodePacked(pendingBaseURI, newTokenId.toString(), ".json"));
        _setTokenURI(newTokenId, tokenURI);

        emit NFTMinted(newTokenId, to, marketId, prediction);
        return newTokenId;
    }

    /**
     * @dev Evolve NFT based on bet outcome
     */
    function evolveNFT(uint256 tokenId, bool won) external onlyMinter {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(!nftData[tokenId].resolved, "Already resolved");

        nftData[tokenId].resolved = true;
        nftData[tokenId].wonBet = won;

        // Update URI based on outcome
        string memory newBaseURI = won ? trophyBaseURI : roastedBaseURI;
        string memory newTokenURI = string(abi.encodePacked(newBaseURI, tokenId.toString(), ".json"));
        _setTokenURI(tokenId, newTokenURI);

        emit NFTEvolved(tokenId, won);
    }

    /**
     * @dev Get NFT metadata
     */
    function getNFTData(uint256 tokenId) external view returns (NFTMetadata memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return nftData[tokenId];
    }

    /**
     * @dev Get total minted NFTs
     */
    function totalMinted() external view returns (uint256) {
        return _tokenIds;
    }
}
