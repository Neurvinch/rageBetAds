// Import real contract ABIs
import PredictionMarketABI from '../../../contracts/PredictionMarket.json';
import RageTokenABI from '../../../contracts/RageToken.json';
import RageNFTABI from '../../../contracts/RageNFT.json';

// Contract addresses from environment variables
export const CONTRACTS = {
  PREDICTION_MARKET: {
    address: import.meta.env.VITE_PREDICTION_MARKET_ADDRESS || '0x...',
    abi: PredictionMarketABI,
  },
  RAGE_TOKEN: {
    address: import.meta.env.VITE_RAGE_TOKEN_ADDRESS || '0x...',
    abi: RageTokenABI,
  },
  RAGE_NFT: {
    address: import.meta.env.VITE_RAGE_NFT_ADDRESS || '0x...',
    abi: RageNFTABI,
  },
};

// Network Configuration from environment variables
export const NETWORKS = {
  Monad_Testnet: {
    chainId: import.meta.env.VITE_NETWORK_CHAIN_ID || '10143',
    chainName: import.meta.env.VITE_NETWORK_NAME || 'Monad Testnet',
    rpcUrls: [import.meta.env.VITE_RPC_URL || 'https://testnet-rpc.monad.xyz'],
    blockExplorerUrls: [import.meta.env.VITE_BLOCK_EXPLORER || 'https://testnet.monadexplorer.com'],
    nativeCurrency: {
      name: 'Monad',
      symbol: 'MON',
      decimals: 18,
    },
  }
};

// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Backend API endpoints
export const API_ENDPOINTS = {
  // SportsDB API endpoints
  SCHEDULE: '/api/schedule/next-league',
  LEAGUE_INFO: '/api/lookup/league',
  MATCH_DETAILS: '/api/lookup/event',
  TEAM_SEARCH: '/api/search/teams',
  PLAYER_SEARCH: '/api/search/players',
  VENUE_SEARCH: '/api/search/venues',
  EVENTS_BY_DATE: '/api/events/date',
  
  // AI Prediction endpoints
  AI_GENERATE_PREDICTION: '/ai/generate-prediction',
  AI_GET_PREDICTION: '/ai/predictions',
  
  // NFT endpoints
  NFT_GENERATE_METADATA: '/nft/generate-metadata',
  
  // Community endpoints
  COMMUNITY_VOTE_ROAST: '/community/vote-roast',
  COMMUNITY_ROAST_LEADERBOARD: '/community/roast-leaderboard',
  
  // Oracle endpoints
  ORACLE_RESOLVE_MARKET: '/oracle/resolve-market',
  
  // Health check
  HEALTH: '/health'
};

// SportsDB API Configuration
export const SPORTSDB_CONFIG = {
  BASE_URL: 'https://www.thesportsdb.com/api/v1/json/123',
  ENDPOINTS: {
    SEARCH_TEAMS: 'searchteams.php',
    SEARCH_PLAYERS: 'searchplayers.php',
    SEARCH_EVENTS: 'searchevents.php',
    LOOKUP_TEAM: 'lookupteam.php',
    LOOKUP_PLAYER: 'lookupplayer.php',
    LOOKUP_EVENT: 'lookupevent.php',
    LOOKUP_LEAGUE: 'lookupleague.php',
    LOOKUP_TABLE: 'lookuptable.php',
    EVENTS_NEXT_LEAGUE: 'eventsnextleague.php',
    EVENTS_PAST_LEAGUE: 'eventspastleague.php',
    EVENTS_NEXT_TEAM: 'eventsnext.php',
    EVENTS_LAST_TEAM: 'eventslast.php',
    EVENTS_BY_DATE: 'eventsday.php'
  }
};
