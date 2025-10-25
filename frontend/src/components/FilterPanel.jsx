import { useState } from 'react';

export default function FilterPanel({ onFilterChange, onSortChange }) {
  const [filters, setFilters] = useState({
    status: 'all',
    hasAIPrediction: false,
    onlyFavorites: false,
    minConfidence: 0
  });

  const [sortBy, setSortBy] = useState('date');

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    onSortChange(value);
  };

  const resetFilters = () => {
    const defaultFilters = {
      status: 'all',
      hasAIPrediction: false,
      onlyFavorites: false,
      minConfidence: 0
    };
    setFilters(defaultFilters);
    setSortBy('date');
    onFilterChange(defaultFilters);
    onSortChange('date');
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>🔧 Filters & Sorting</h3>
        <button className="reset-btn" onClick={resetFilters}>
          🔄 Reset
        </button>
      </div>

      <div className="filter-content">
        {/* Status Filter */}
        <div className="filter-group">
          <label>Match Status</label>
          <div className="filter-options">
            <button
              className={`filter-option ${filters.status === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('status', 'all')}
            >
              All
            </button>
            <button
              className={`filter-option ${filters.status === 'upcoming' ? 'active' : ''}`}
              onClick={() => handleFilterChange('status', 'upcoming')}
            >
              ⏰ Upcoming
            </button>
            <button
              className={`filter-option ${filters.status === 'live' ? 'active' : ''}`}
              onClick={() => handleFilterChange('status', 'live')}
            >
              🔴 Live
            </button>
            <button
              className={`filter-option ${filters.status === 'finished' ? 'active' : ''}`}
              onClick={() => handleFilterChange('status', 'finished')}
            >
              ✅ Finished
            </button>
          </div>
        </div>

        {/* AI Prediction Filter */}
        <div className="filter-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.hasAIPrediction}
              onChange={(e) => handleFilterChange('hasAIPrediction', e.target.checked)}
            />
            <span>🤖 Only with AI Predictions</span>
          </label>
        </div>

        {/* Favorites Filter */}
        <div className="filter-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.onlyFavorites}
              onChange={(e) => handleFilterChange('onlyFavorites', e.target.checked)}
            />
            <span>⭐ Only Favorite Teams</span>
          </label>
        </div>

        {/* Confidence Filter */}
        <div className="filter-group">
          <label>
            Min AI Confidence: <span className="confidence-value">{filters.minConfidence}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={filters.minConfidence}
            onChange={(e) => handleFilterChange('minConfidence', parseInt(e.target.value))}
            className="confidence-slider"
          />
        </div>

        {/* Sort Options */}
        <div className="filter-group">
          <label>Sort By</label>
          <select 
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="sort-select"
          >
            <option value="date">📅 Date (Earliest First)</option>
            <option value="date-desc">📅 Date (Latest First)</option>
            <option value="confidence">🎯 AI Confidence (High to Low)</option>
            <option value="confidence-asc">🎯 AI Confidence (Low to High)</option>
            <option value="league">🏆 League Name</option>
          </select>
        </div>
      </div>
    </div>
  );
}
