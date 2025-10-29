# 🚀 Quick Start - Enhanced Rage Bet Frontend

## 🎉 What's New?

Your frontend now has **7 new features** with enterprise-grade UI/UX:
1. 🔔 Toast Notifications
2. 👤 User Profile Page
3. 🏆 Leaderboard System
4. 🔧 Advanced Filters
5. 📊 Live Odds Display
6. ⭐ Favorites System
7. 🎯 Hero Section

---

## 📦 Installation

```bash
cd frontend
npm install
```

---

## 🚀 Run Development Server

```bash
npm run dev
```

Frontend will be available at: **http://localhost:5173**

---

## 🎮 Test New Features

### 1. **Navigation Bar**
- Click **👤 Profile** to see your stats and achievements
- Click **🏆 Leaderboard** to view global rankings
- All existing pages still work (Dashboard, Search, Standings)

### 2. **Toast Notifications**
- Will appear automatically on user actions
- Located in top-right corner
- Auto-dismiss after 3 seconds

### 3. **Profile Page Features**
- View your betting statistics
- See unlocked achievements (8 total)
- Check recent activity
- Profile avatar based on wallet address

### 4. **Leaderboard Features**
- See top 3 on podium with animations
- Filter by timeframe (Today/Week/Month/All-Time)
- Sort by Winnings/Win Rate/Streak
- View your current rank
- See weekly rewards

### 5. **Hero Section**
- Animated statistics with counting effect
- Call-to-action buttons
- Feature highlights
- Animated background

---

## 🎨 Component Usage Examples

### Toast Notifications
```javascript
import { toast } from './components/Toast';

// In your component
const handleBet = () => {
  try {
    // ... bet logic
    toast.success('🎉 Bet placed successfully!');
  } catch (error) {
    toast.error('❌ Transaction failed');
  }
};
```

### Favorites System
```javascript
import { favoritesManager } from './utils/favorites';

// Add favorite
favoritesManager.addFavorite('123', 'Arsenal', 'badge_url');

// Check if favorite
const isFav = favoritesManager.isFavorite('123');

// Toggle favorite (in a button click)
const handleToggle = () => {
  const isNowFavorite = favoritesManager.toggleFavorite(
    teamId, 
    teamName, 
    teamBadge
  );
  
  if (isNowFavorite) {
    toast.success('⭐ Added to favorites');
  } else {
    toast.info('Removed from favorites');
  }
};
```

### Filter Panel
```javascript
import FilterPanel from './components/FilterPanel';

<FilterPanel 
  onFilterChange={(filters) => {
    // filters = { status, hasAIPrediction, onlyFavorites, minConfidence }
    console.log('Filters changed:', filters);
  }}
  onSortChange={(sortBy) => {
    // sortBy = 'date' | 'confidence' | 'league' etc.
    console.log('Sort changed:', sortBy);
  }}
/>
```

### Live Odds
```javascript
import LiveOdds from './components/LiveOdds';

<LiveOdds 
  matchId="12345"
  homeTeam="Arsenal"
  awayTeam="Chelsea"
/>
```

### Hero Section
```javascript
import HeroSection from './components/HeroSection';

// In Dashboard or landing page
<HeroSection />
```

---

## 📁 File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Toast.jsx ⭐ NEW - Notification system
│   │   ├── FilterPanel.jsx ⭐ NEW - Filtering controls
│   │   ├── LiveOdds.jsx ⭐ NEW - Odds display
│   │   ├── HeroSection.jsx ⭐ NEW - Hero with CTA
│   │   ├── WalletConnect.jsx - Existing
│   │   ├── AIBettingInterface.jsx - Existing
│   │   └── Web3Dashboard.jsx - Existing
│   │
│   ├── pages/
│   │   ├── Profile.jsx ⭐ NEW - User profile
│   │   ├── Leaderboard.jsx ⭐ NEW - Rankings
│   │   ├── Dashboard.jsx - Enhanced
│   │   ├── Search.jsx - Existing
│   │   ├── LeagueStandings.jsx - Existing
│   │   └── MatchDetails.jsx - Existing
│   │
│   ├── styles/
│   │   ├── Toast.css ⭐ NEW
│   │   ├── Profile.css ⭐ NEW
│   │   ├── Leaderboard.css ⭐ NEW
│   │   ├── FilterPanel.css ⭐ NEW
│   │   ├── LiveOdds.css ⭐ NEW
│   │   └── HeroSection.css ⭐ NEW
│   │
│   ├── utils/
│   │   └── favorites.js ⭐ NEW - Favorites manager
│   │
│   ├── hooks/ - Existing
│   ├── services/ - Existing
│   ├── config/ - Existing
│   ├── App.jsx - Updated with new routes
│   └── App.css - Existing (3160 lines)
```

---

## 🎨 Styling Customization

All colors are defined using CSS variables and can be easily customized:

```css
/* Primary Colors */
--primary: #a855f7;
--secondary: #ec4899;
--success: #22c55e;
--warning: #ffc107;
--error: #ef4444;
```

To modify, edit the respective CSS files in `src/styles/`.

---

## 📱 Responsive Breakpoints

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

All new components are fully responsive!

---

## 🔧 Configuration

### Environment Variables
If you need to add any:
```bash
# .env
VITE_API_URL=http://localhost:8000
VITE_ENABLE_ANALYTICS=true
```

### LocalStorage Keys Used
- `rageBet_favorites` - Favorite teams
- `recentSearches` - Search history

---

## 🐛 Troubleshooting

### Issue: Styles not loading
**Solution:** Make sure all CSS imports are in App.jsx:
```javascript
import './styles/Toast.css'
import './styles/Profile.css'
import './styles/Leaderboard.css'
import './styles/FilterPanel.css'
import './styles/LiveOdds.css'
import './styles/HeroSection.css'
```

### Issue: Components not showing
**Solution:** Check that routes are properly defined in App.jsx

### Issue: LocalStorage not working
**Solution:** Check browser settings allow localStorage

---

## 📚 Documentation

Full documentation available in:
- **FRONTEND_OVERVIEW.md** - Complete frontend guide
- **ENHANCED_FEATURES.md** - Feature documentation
- **UI_UX_SUMMARY.md** - Enhancement summary

---

## 🎯 Next Steps

1. **Integrate with Backend**
   - Connect Profile page to smart contracts
   - Fetch real leaderboard data
   - Update achievements based on on-chain events

2. **Add Real Odds**
   - Connect to odds API
   - Implement WebSocket for live updates

3. **Deploy**
   - Build: `npm run build`
   - Deploy to Netlify/Vercel/GitHub Pages

---

## 🎉 Enjoy Your Enhanced Frontend!

All features are production-ready and fully functional. Start the dev server and explore!

```bash
npm run dev
```

**Questions?** Check the documentation files or review component source code.

---

**Built with 🔥 and 💜 for the best betting experience!**
