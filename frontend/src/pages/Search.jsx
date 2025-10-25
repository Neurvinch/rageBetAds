import { useState, useEffect } from 'react';
import { sportsService } from '../services/apiService';

export default function Search() {
  const [searchType, setSearchType] = useState('teams');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [filters, setFilters] = useState({
    league: '',
    country: '',
    position: ''
  });

  // Pre-searched trending items
  const trendingSearches = {
    teams: [
      { query: 'Arsenal', icon: '⚽', description: 'Premier League' },
      { query: 'Real Madrid', icon: '👑', description: 'La Liga' },
      { query: 'Bayern Munich', icon: '🏆', description: 'Bundesliga' },
      { query: 'Manchester City', icon: '💎', description: 'Premier League' },
      { query: 'Barcelona', icon: '🔵', description: 'La Liga' },
      { query: 'Liverpool', icon: '🔴', description: 'Premier League' }
    ],
    players: [
      { query: 'Lionel Messi', icon: '⭐', description: 'Inter Miami' },
      { query: 'Cristiano Ronaldo', icon: '👑', description: 'Al Nassr' },
      { query: 'Kylian Mbappe', icon: '⚡', description: 'Real Madrid' },
      { query: 'Erling Haaland', icon: '💪', description: 'Manchester City' },
      { query: 'Neymar', icon: '🎭', description: 'Al Hilal' },
      { query: 'Kevin De Bruyne', icon: '🎯', description: 'Manchester City' }
    ],
    events: [
      { query: 'Champions League', icon: '🏆', description: 'European Competition' },
      { query: 'World Cup', icon: '🌍', description: 'International' },
      { query: 'Premier League', icon: '⚽', description: 'English League' },
      { query: 'El Clasico', icon: '⚔️', description: 'Real vs Barcelona' },
      { query: 'Derby', icon: '🔥', description: 'Local Rivalries' },
      { query: 'Final', icon: '🏟️', description: 'Championship Matches' }
    ],
    venues: [
      { query: 'Wembley Stadium', icon: '🏟️', description: 'London, England' },
      { query: 'Camp Nou', icon: '🔵', description: 'Barcelona, Spain' },
      { query: 'Santiago Bernabeu', icon: '👑', description: 'Madrid, Spain' },
      { query: 'Old Trafford', icon: '🔴', description: 'Manchester, England' },
      { query: 'Allianz Arena', icon: '⚡', description: 'Munich, Germany' },
      { query: 'San Siro', icon: '⚫', description: 'Milan, Italy' }
    ]
  };

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      let searchResults = [];
      
      // Use appropriate service method based on search type
      switch (searchType) {
        case 'teams':
          searchResults = await sportsService.searchTeams(query);
          break;
        case 'players':
          searchResults = await sportsService.searchPlayers(query);
          break;
        case 'venues':
          searchResults = await sportsService.searchVenues(query);
          break;
        default:
          searchResults = [];
      }
      
      // Apply filters
      const filteredResults = applyFilters(searchResults);
      setResults(filteredResults);
      
      // Save to recent searches
      const newSearch = {
        query,
        type: searchType,
        timestamp: new Date().toISOString(),
        resultCount: filteredResults.length
      };
      
      const updatedRecent = [newSearch, ...recentSearches.filter(s => s.query !== query)].slice(0, 5);
      setRecentSearches(updatedRecent);
      localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
      
    } catch (error) {
      console.error('Error searching:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data) => {
    return data.filter(item => {
      if (filters.league && item.strLeague && !item.strLeague.toLowerCase().includes(filters.league.toLowerCase())) {
        return false;
      }
      if (filters.country && item.strCountry && !item.strCountry.toLowerCase().includes(filters.country.toLowerCase())) {
        return false;
      }
      if (filters.position && item.strPosition && !item.strPosition.toLowerCase().includes(filters.position.toLowerCase())) {
        return false;
      }
      return true;
    });
  };

  const handleRecentSearch = (recent) => {
    setQuery(recent.query);
    setSearchType(recent.type);
    handleSearch({ preventDefault: () => {} });
  };

  const clearFilters = () => {
    setFilters({ league: '', country: '', position: '' });
  };

  const handleTrendingSearch = (trendingItem) => {
    setQuery(trendingItem.query);
    handleSearch({ preventDefault: () => {} });
  };

  const renderResult = (item) => {
    switch (searchType) {
      case 'teams':
        return (
          <div key={item.idTeam} className="result-card team-card">
            <div className="card-header">
              <div className="team-badge">
                {item.strBadge && <img src={item.strBadge} alt={item.strTeam} />}
              </div>
              <div className="team-info">
              <h3>{item.strTeam}</h3>
                <p className="team-league">{item.strLeague}</p>
              </div>
            </div>
            <div className="card-details">
              <div className="detail-item">
                <span className="detail-icon">🏟️</span>
                <span className="detail-text">{item.strStadium || 'Unknown Stadium'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">👥</span>
                <span className="detail-text">Capacity: {item.intStadiumCapacity?.toLocaleString() || 'Unknown'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">🌍</span>
                <span className="detail-text">{item.strCountry || 'Unknown Country'}</span>
              </div>
              {item.intFormedYear && (
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <span className="detail-text">Founded: {item.intFormedYear}</span>
                </div>
              )}
            </div>
            <div className="card-actions">
              <button className="action-btn primary">View Details</button>
              <button className="action-btn secondary">Follow Team</button>
            </div>
          </div>
        );
      case 'players':
        return (
          <div key={item.idPlayer} className="result-card player-card">
            <div className="card-header">
              <div className="player-image">
                {item.strThumb && <img src={item.strThumb} alt={item.strPlayer} />}
              </div>
              <div className="player-info">
              <h3>{item.strPlayer}</h3>
                <p className="player-team">{item.strTeam}</p>
              </div>
            </div>
            <div className="card-details">
              <div className="detail-item">
                <span className="detail-icon">🎯</span>
                <span className="detail-text">{item.strPosition || 'Unknown Position'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">🏳️</span>
                <span className="detail-text">{item.strNationality || 'Unknown Nationality'}</span>
              </div>
              {item.strHeight && (
                <div className="detail-item">
                  <span className="detail-icon">📏</span>
                  <span className="detail-text">Height: {item.strHeight}</span>
                </div>
              )}
              {item.strWeight && (
                <div className="detail-item">
                  <span className="detail-icon">⚖️</span>
                  <span className="detail-text">Weight: {item.strWeight}</span>
                </div>
              )}
            </div>
            <div className="card-actions">
              <button className="action-btn primary">View Profile</button>
              <button className="action-btn secondary">Track Player</button>
            </div>
          </div>
        );
      case 'events':
        return (
          <div key={item.idEvent} className="result-card event-card">
            <div className="card-header">
              <div className="event-info">
              <h3>{item.strEvent}</h3>
                <p className="event-league">{item.strLeague}</p>
              </div>
              <div className="event-status">
                {item.strStatus === 'Not Started' ? '⏰' : 
                 item.strStatus === 'Match Finished' ? '✅' : 
                 item.strStatus === 'Live' ? '🔴' : '📅'}
              </div>
            </div>
            <div className="card-details">
              <div className="detail-item">
                <span className="detail-icon">📅</span>
                <span className="detail-text">{item.dateEvent} {item.strTime}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">🏟️</span>
                <span className="detail-text">{item.strVenue || 'Unknown Venue'}</span>
              </div>
              {item.intHomeScore !== null && item.intAwayScore !== null && (
                <div className="detail-item score">
                  <span className="detail-icon">⚽</span>
                  <span className="detail-text">{item.intHomeScore} - {item.intAwayScore}</span>
                </div>
              )}
            </div>
            <div className="card-actions">
              <button className="action-btn primary">View Match</button>
              <button className="action-btn secondary">Place Bet</button>
            </div>
          </div>
        );
      case 'venues':
        return (
          <div key={item.idVenue} className="result-card venue-card">
            <div className="card-header">
              <div className="venue-image">
                {item.strThumb && <img src={item.strThumb} alt={item.strVenue} />}
              </div>
              <div className="venue-info">
              <h3>{item.strVenue}</h3>
                <p className="venue-location">{item.strLocation}</p>
              </div>
            </div>
            <div className="card-details">
              <div className="detail-item">
                <span className="detail-icon">👥</span>
                <span className="detail-text">Capacity: {item.intCapacity?.toLocaleString() || 'Unknown'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">🌍</span>
                <span className="detail-text">{item.strCountry || 'Unknown Country'}</span>
              </div>
              {item.intFormedYear && (
                <div className="detail-item">
                  <span className="detail-icon">🏗️</span>
                  <span className="detail-text">Built: {item.intFormedYear}</span>
                </div>
              )}
            </div>
            <div className="card-actions">
              <button className="action-btn primary">View Details</button>
              <button className="action-btn secondary">Get Directions</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="search-page">
      {/* Header Section */}
      <div className="search-header">
        <div className="header-content">
          <h1>🔍 Search</h1>
          <p>Find teams, players, matches, and venues from around the world</p>
        </div>
      </div>

      {/* Search Type Selector */}
      <div className="search-type-selector">
        <h3>🔍 What are you looking for?</h3>
        <div className="type-grid">
          {[
            { type: 'teams', icon: '⚽', label: 'Teams', description: 'Football clubs and organizations' },
            { type: 'players', icon: '👤', label: 'Players', description: 'Individual football players' },
            { type: 'events', icon: '🏆', label: 'Matches', description: 'Games and competitions' },
            { type: 'venues', icon: '🏟️', label: 'Venues', description: 'Stadiums and arenas' }
          ].map(({ type, icon, label, description }) => (
          <button
            key={type}
            className={`type-btn ${searchType === type ? 'active' : ''}`}
            onClick={() => {
              setSearchType(type);
              setResults([]);
                setQuery('');
              }}
            >
              <div className="type-icon">{icon}</div>
              <div className="type-info">
                <div className="type-label">{label}</div>
                <div className="type-description">{description}</div>
              </div>
          </button>
        ))}
        </div>
      </div>

      {/* Search Form */}
      <div className="search-form-container">
      <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search for ${searchType}...`}
          className="search-input"
        />
        <button type="submit" className="search-btn" disabled={loading}>
          {loading ? '🔄' : '🔍'} Search
        </button>
          </div>
      </form>

        {/* Trending Searches */}
        <div className="trending-searches">
          <h4>🔥 Trending {searchType.charAt(0).toUpperCase() + searchType.slice(1)}</h4>
          <div className="trending-grid">
            {trendingSearches[searchType].map((item, index) => (
              <button
                key={index}
                className="trending-item"
                onClick={() => handleTrendingSearch(item)}
              >
                <div className="trending-icon">{item.icon}</div>
                <div className="trending-info">
                  <div className="trending-query">{item.query}</div>
                  <div className="trending-description">{item.description}</div>
                </div>
                <div className="trending-arrow">→</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="recent-searches">
            <h4>🕒 Recent Searches</h4>
            <div className="recent-list">
              {recentSearches.map((recent, index) => (
                <button
                  key={index}
                  className="recent-item"
                  onClick={() => handleRecentSearch(recent)}
                >
                  <span className="recent-icon">
                    {recent.type === 'teams' ? '⚽' : 
                     recent.type === 'players' ? '👤' : 
                     recent.type === 'events' ? '🏆' : '🏟️'}
                  </span>
                  <span className="recent-query">{recent.query}</span>
                  <span className="recent-count">({recent.resultCount} results)</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      {results.length > 0 && (
        <div className="filters-section">
          <h4>🔧 Filters</h4>
          <div className="filters-grid">
            <div className="filter-group">
              <label>League</label>
              <input
                type="text"
                value={filters.league}
                onChange={(e) => setFilters({...filters, league: e.target.value})}
                placeholder="Filter by league..."
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>Country</label>
              <input
                type="text"
                value={filters.country}
                onChange={(e) => setFilters({...filters, country: e.target.value})}
                placeholder="Filter by country..."
                className="filter-input"
              />
            </div>
            <div className="filter-group">
              <label>Position</label>
              <input
                type="text"
                value={filters.position}
                onChange={(e) => setFilters({...filters, position: e.target.value})}
                placeholder="Filter by position..."
                className="filter-input"
              />
            </div>
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="search-results">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Searching...</p>
          </div>
        ) : results.length === 0 && query ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No results found for "{query}"</h3>
            <p>Try adjusting your search terms or filters</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="results-header">
              <h3>Search Results ({results.length})</h3>
              <div className="results-info">
                Found {results.length} {searchType} matching your search
              </div>
            </div>
            <div className="results-grid">
              {results.map(renderResult)}
            </div>
          </>
        ) : (
          <div className="search-prompt">
            <div className="prompt-icon">🔍</div>
            <h3>Start Searching</h3>
            <p>Enter a search term above to find {searchType}</p>
          </div>
        )}
      </div>
    </div>
  );
}
