import axios from 'axios';
import { API_URL, API_ENDPOINTS } from '../config/contracts';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout for AI predictions
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// SportsDB API Services
export const sportsService = {
  // Get upcoming matches for a league
  getUpcomingMatches: async (leagueId) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.SCHEDULE}/${leagueId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming matches:', error);
      throw error;
    }
  },

  // Get league information
  getLeagueInfo: async (leagueId) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.LEAGUE_INFO}/${leagueId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching league info:', error);
      throw error;
    }
  },

  // Get match details
  getMatchDetails: async (matchId) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.MATCH_DETAILS}/${matchId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching match details:', error);
      throw error;
    }
  },

  // Search teams
  searchTeams: async (query) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.TEAM_SEARCH}?q=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error searching teams:', error);
      throw error;
    }
  },

  // Search players
  searchPlayers: async (query) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.PLAYER_SEARCH}?q=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error searching players:', error);
      throw error;
    }
  },

  // Search venues
  searchVenues: async (query) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.VENUE_SEARCH}?q=${query}`);
      return response.data;
    } catch (error) {
      console.error('Error searching venues:', error);
      throw error;
    }
  },

  // Get events by date
  getEventsByDate: async (date, sport = 'Soccer', league = '') => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.EVENTS_BY_DATE}/${date}`, {
        params: { sport, league }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching events by date:', error);
      throw error;
    }
  }
};

// AI Prediction Services
export const aiService = {
  // Generate AI prediction and roast
  generatePrediction: async (matchId) => {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.AI_GENERATE_PREDICTION}?match_id=${matchId}`, {}, {
        timeout: 45000, // 45 seconds for AI predictions
      });
      return response.data;
    } catch (error) {
      console.error('Error generating AI prediction:', error);
      throw error;
    }
  },

  // Get existing AI prediction
  getPrediction: async (matchId) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.AI_GET_PREDICTION}/${matchId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching AI prediction:', error);
      throw error;
    }
  }
};

// NFT Services
export const nftService = {
  // Generate NFT metadata
  generateMetadata: async (matchId, userChoice, aiRoast, userAddress) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.NFT_GENERATE_METADATA, {
        match_id: matchId,
        user_choice: userChoice,
        ai_roast: aiRoast,
        user_address: userAddress
      });
      return response.data;
    } catch (error) {
      console.error('Error generating NFT metadata:', error);
      throw error;
    }
  }
};

// Community Services
export const communityService = {
  // Vote for roast
  voteForRoast: async (matchId, roastId, voterAddress, voteWeight) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.COMMUNITY_VOTE_ROAST, {
        match_id: matchId,
        roast_id: roastId,
        voter_address: voterAddress,
        vote_weight: voteWeight,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error voting for roast:', error);
      throw error;
    }
  },

  // Get roast leaderboard
  getRoastLeaderboard: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.COMMUNITY_ROAST_LEADERBOARD);
      return response.data;
    } catch (error) {
      console.error('Error fetching roast leaderboard:', error);
      throw error;
    }
  }
};

// Oracle Services
export const oracleService = {
  // Resolve market
  resolveMarket: async (marketId, matchId, aiWasRight, homeScore, awayScore, status) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ORACLE_RESOLVE_MARKET, {
        market_id: marketId,
        match_id: matchId,
        ai_was_right: aiWasRight,
        home_score: homeScore,
        away_score: awayScore,
        status: status
      });
      return response.data;
    } catch (error) {
      console.error('Error resolving market:', error);
      throw error;
    }
  }
};

// Health check
export const healthService = {
  checkHealth: async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.HEALTH);
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }
};

// Export all services
export default {
  sportsService,
  aiService,
  nftService,
  communityService,
  oracleService,
  healthService
};


