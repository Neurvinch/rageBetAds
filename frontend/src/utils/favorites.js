// Favorites Management System
const FAVORITES_KEY = 'rageBet_favorites';

export const favoritesManager = {
  // Get all favorites
  getFavorites: () => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  },

  // Add to favorites
  addFavorite: (teamId, teamName, teamBadge) => {
    try {
      const favorites = favoritesManager.getFavorites();
      const exists = favorites.some(fav => fav.id === teamId);
      
      if (!exists) {
        const newFavorite = {
          id: teamId,
          name: teamName,
          badge: teamBadge,
          addedAt: new Date().toISOString()
        };
        favorites.push(newFavorite);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding favorite:', error);
      return false;
    }
  },

  // Remove from favorites
  removeFavorite: (teamId) => {
    try {
      const favorites = favoritesManager.getFavorites();
      const filtered = favorites.filter(fav => fav.id !== teamId);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      return false;
    }
  },

  // Check if team is favorite
  isFavorite: (teamId) => {
    const favorites = favoritesManager.getFavorites();
    return favorites.some(fav => fav.id === teamId);
  },

  // Toggle favorite
  toggleFavorite: (teamId, teamName, teamBadge) => {
    if (favoritesManager.isFavorite(teamId)) {
      favoritesManager.removeFavorite(teamId);
      return false;
    } else {
      favoritesManager.addFavorite(teamId, teamName, teamBadge);
      return true;
    }
  },

  // Clear all favorites
  clearFavorites: () => {
    try {
      localStorage.removeItem(FAVORITES_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing favorites:', error);
      return false;
    }
  }
};
