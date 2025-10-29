import { useState } from 'react'
import './App.css'
import './styles/Toast.css'
import './styles/Profile.css'
import './styles/Leaderboard.css'
import './styles/FilterPanel.css'
import './styles/LiveOdds.css'
import './styles/HeroSection.css'
import Toast from './components/Toast'
import Dashboard from './pages/Dashboard'
import Search from './pages/Search'
import LeagueStandings from './pages/LeagueStandings'
import MatchDetails from './pages/MatchDetails'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'
import {ConnectButton} from "@rainbow-me/rainbowkit"

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [selectedMatch, setSelectedMatch] = useState(null)

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onMatchClick={(match) => {
          setSelectedMatch(match)
          setCurrentPage('match')
        }} />
      case 'search':
        return <Search />
      case 'standings':
        return <LeagueStandings />
      case 'leaderboard':
        return <Leaderboard />
      case 'profile':
        return <Profile />
      case 'match':
        return <MatchDetails match={selectedMatch} onBack={() => setCurrentPage('dashboard')} />
      default:
        return <Dashboard />
    }
  }

  return (
    <>
      <Toast />
      <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-brand">
          <span className="fire-emoji">🔥</span>
          <h1>Rage Bet</h1>
        </div>
        <div className="nav-links">
          <button 
            className={currentPage === 'dashboard' ? 'active' : ''}
            onClick={() => setCurrentPage('dashboard')}
          >
            🏠 Dashboard
          </button>
          <button 
            className={currentPage === 'search' ? 'active' : ''}
            onClick={() => setCurrentPage('search')}
          >
            🔍 Search
          </button>
          <button 
            className={currentPage === 'standings' ? 'active' : ''}
            onClick={() => setCurrentPage('standings')}
          >
            📊 Standings
          </button>
          <button 
            className={currentPage === 'leaderboard' ? 'active' : ''}
            onClick={() => setCurrentPage('leaderboard')}
          >
            🏆 Leaderboard
          </button>
          <button 
            className={currentPage === 'profile' ? 'active' : ''}
            onClick={() => setCurrentPage('profile')}
          >
            👤 Profile
          </button>
        </div>
        <div className="nav-wallet">
         <ConnectButton/>
        </div>
      </nav>

      {/* Page Content */}
      <main className="main-content">
        {renderPage()}
      </main>
      </div>
    </>
  )
}

export default App
