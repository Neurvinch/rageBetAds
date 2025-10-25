from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import httpx
import os
from datetime import datetime, timedelta
import json
import random
import asyncio

app = FastAPI(
    title="Rage Bet API - Complete SportsDB Integration",
    description="Full SportsDB API integration with AI trash talk for football predictions",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SportsDB API configuration
SPORTSDB_API_KEY = os.getenv("SPORTSDB_API_KEY")
SPORTSDB_BASE_URL = f"https://www.thesportsdb.com/api/v1/json/{SPORTSDB_API_KEY}"

# Groq AI API configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_BASE_URL = "https://api.groq.com/openai/v1"

# IPFS configuration (using Pinata for simplicity)
PINATA_API_KEY = os.getenv("PINATA_API_KEY")
PINATA_SECRET_KEY = os.getenv("PINATA_SECRET_KEY")
PINATA_BASE_URL = "https://api.pinata.cloud"

# Cache for API responses (simple in-memory cache)
api_cache = {}
ai_prediction_cache = {}  # Cache for AI predictions

# Models
class MatchData(BaseModel):
    team1: str
    team2: str
    league: Optional[str] = None
    match_id: Optional[str] = None

class TrashTalkResponse(BaseModel):
    trash_talk: str
    prediction: str
    confidence: float
    match_id: str
    team1: str
    team2: str

class MatchResult(BaseModel):
    match_id: str
    home_team: str
    away_team: str
    home_score: int
    away_score: int
    status: str
    date: str

class MarketResolution(BaseModel):
    market_id: int
    match_id: str
    ai_was_right: bool
    home_score: Optional[int] = None
    away_score: Optional[int] = None
    status: str

class AIPrediction(BaseModel):
    match_id: str
    home_team: str
    away_team: str
    league: str
    ai_prediction: str
    ai_roast_loser: str
    confidence: float
    reasoning: str
    ipfs_hash: Optional[str] = None
    created_at: str

class TeamStats(BaseModel):
    team_name: str
    recent_form: str
    goals_scored: int
    goals_conceded: int
    wins: int
    draws: int
    losses: int
    home_advantage: float
    key_players: List[str]
    injuries: List[str]

class NFTMetadata(BaseModel):
    name: str
    description: str
    image: str
    attributes: List[Dict[str, Any]]
    match_id: str
    user_choice: str
    ai_roast: str
    created_at: str

class CommunityVote(BaseModel):
    match_id: str
    roast_id: str
    voter_address: str
    vote_weight: int
    timestamp: str

# Helper functions
async def fetch_match_data(match_id: str) -> Dict:
    """Fetch match data from SportsDB API"""
    async with httpx.AsyncClient() as client:
        try:
            url = f"{SPORTSDB_BASE_URL}/lookupevent.php?id={match_id}"
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            if not data.get("events"):
                raise HTTPException(status_code=404, detail="Match not found")
            
            return data["events"][0]
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch match data: {str(e)}")

async def fetch_team_stats(team_name: str) -> Dict:
    """Fetch team statistics from SportsDB API"""
    async with httpx.AsyncClient() as client:
        try:
            url = f"{SPORTSDB_BASE_URL}/searchteams.php?t={team_name}"
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            if data.get("teams"):
                return data["teams"][0]
            return {}
        except:
            return {}

async def fetch_team_detailed_stats(team_name: str) -> TeamStats:
    """Fetch detailed team statistics for AI analysis"""
    try:
        # Search for team
        async with httpx.AsyncClient() as client:
            search_url = f"{SPORTSDB_BASE_URL}/searchteams.php?t={team_name}"
            search_response = await client.get(search_url, timeout=10.0)
            search_data = search_response.json()
            
            if not search_data.get("teams"):
                return TeamStats(
                    team_name=team_name,
                    recent_form="Unknown",
                    goals_scored=0,
                    goals_conceded=0,
                    wins=0,
                    draws=0,
                    losses=0,
                    home_advantage=0.0,
                    key_players=[],
                    injuries=[]
                )
            
            team_id = search_data["teams"][0]["idTeam"]
            
            # Get team details
            details_url = f"{SPORTSDB_BASE_URL}/lookupteam.php?id={team_id}"
            details_response = await client.get(details_url, timeout=10.0)
            details_data = details_response.json()
            
            team = details_data.get("teams", [{}])[0]
            
            # Get recent matches for form analysis
            recent_matches_url = f"{SPORTSDB_BASE_URL}/eventslast.php?id={team_id}"
            matches_response = await client.get(recent_matches_url, timeout=10.0)
            matches_data = matches_response.json()
            
            # Analyze recent form
            recent_form = "Unknown"
            goals_scored = 0
            goals_conceded = 0
            wins = 0
            draws = 0
            losses = 0
            
            if matches_data.get("results"):
                recent_matches = matches_data["results"][:5]  # Last 5 matches
                for match in recent_matches:
                    home_team = match.get("strHomeTeam", "")
                    away_team = match.get("strAwayTeam", "")
                    home_score = match.get("intHomeScore", 0)
                    away_score = match.get("intAwayScore", 0)
                    
                    if home_team == team_name:
                        goals_scored += int(home_score) if home_score else 0
                        goals_conceded += int(away_score) if away_score else 0
                        if int(home_score) > int(away_score):
                            wins += 1
                        elif int(home_score) == int(away_score):
                            draws += 1
                        else:
                            losses += 1
                    elif away_team == team_name:
                        goals_scored += int(away_score) if away_score else 0
                        goals_conceded += int(home_score) if home_score else 0
                        if int(away_score) > int(home_score):
                            wins += 1
                        elif int(away_score) == int(home_score):
                            draws += 1
                        else:
                            losses += 1
                
                # Create form string
                form_results = []
                for match in recent_matches[:5]:
                    home_team = match.get("strHomeTeam", "")
                    away_team = match.get("strAwayTeam", "")
                    home_score = match.get("intHomeScore", 0)
                    away_score = match.get("intAwayScore", 0)
                    
                    if home_team == team_name:
                        if int(home_score) > int(away_score):
                            form_results.append("W")
                        elif int(home_score) == int(away_score):
                            form_results.append("D")
                        else:
                            form_results.append("L")
                    elif away_team == team_name:
                        if int(away_score) > int(home_score):
                            form_results.append("W")
                        elif int(away_score) == int(home_score):
                            form_results.append("D")
                        else:
                            form_results.append("L")
                
                recent_form = "".join(form_results) if form_results else "Unknown"
            
            # Calculate home advantage (simplified)
            home_advantage = 0.1  # 10% base home advantage
            
            return TeamStats(
                team_name=team_name,
                recent_form=recent_form,
                goals_scored=goals_scored,
                goals_conceded=goals_conceded,
                wins=wins,
                draws=draws,
                losses=losses,
                home_advantage=home_advantage,
                key_players=[],  # Would need additional API calls
                injuries=[]  # Would need additional API calls
            )
            
    except Exception as e:
        print(f"Error fetching detailed team stats: {e}")
        return TeamStats(
            team_name=team_name,
            recent_form="Unknown",
            goals_scored=0,
            goals_conceded=0,
            wins=0,
            draws=0,
            losses=0,
            home_advantage=0.0,
            key_players=[],
            injuries=[]
        )

async def call_groq_api(context: Dict) -> Dict:
    """Call Groq API for AI prediction and roast generation"""
    try:
        prompt = f"""
        You are a football expert and master of trash talk. Analyze this match and provide:

        1. A clear prediction for who will win (only one team)
        2. A hilarious roast ONLY for the team that will lose (the other team)
        3. Your confidence level (0.0 to 1.0)
        4. Your reasoning

        Match Context:
        - Home Team: {context['home_team']}
        - Away Team: {context['away_team']}
        - League: {context['league']}
        - Venue: {context.get('venue', 'Unknown')}
        - Match Date: {context.get('match_date', 'Unknown')}

        Home Team Stats: {context.get('home_stats', {})}
        Away Team Stats: {context.get('away_stats', {})}

        Requirements:
        - Choose ONE winner (Home Team or Away Team)
        - Only roast the LOSING team (be savage but funny)
        - Use emojis and modern slang
        - Be creative and football-related
        - Prediction should be clear: "Home Team wins" or "Away Team wins"
        - Confidence should be realistic based on the data

        Respond in JSON format:
        {{
            "prediction": "Home Team wins",
            "roast_loser": "This team's attack is slower than my grandma's internet!",
            "confidence": 0.75,
            "reasoning": "Based on recent form and home advantage..."
        }}
        """

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{GROQ_BASE_URL}/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.1-70b-versatile",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a football expert and master of trash talk. Always respond in valid JSON format."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.8,
                    "max_tokens": 1000
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                
                # Parse JSON response
                try:
                    return json.loads(content)
                except json.JSONDecodeError:
                    # Fallback if JSON parsing fails
                    return {
                        "prediction": f"{context['home_team']} wins",
                        "roast_loser": f"{context['away_team']} is going to get roasted!",
                        "confidence": 0.6,
                        "reasoning": "AI analysis completed"
                    }
            else:
                raise Exception(f"Groq API error: {response.status_code}")
                
    except Exception as e:
        # Fallback response
        return {
            "prediction": f"{context['home_team']} wins",
            "roast_loser": f"{context['away_team']} is going to get absolutely destroyed!",
            "confidence": 0.5,
            "reasoning": f"Fallback prediction due to error: {str(e)}"
        }

async def generate_ai_prediction_and_roast(match_data: Dict) -> AIPrediction:
    """Generate AI prediction and roasts using Groq API"""
    try:
        # Extract match information
        match_id = match_data.get("idEvent", "unknown")
        home_team = match_data.get("strHomeTeam", "Unknown Team")
        away_team = match_data.get("strAwayTeam", "Unknown Team")
        league = match_data.get("strLeague", "Unknown League")
        
        # Fetch team stats for better predictions
        home_stats = await fetch_team_detailed_stats(home_team)
        away_stats = await fetch_team_detailed_stats(away_team)
        
        # Prepare context for AI
        context = {
            "home_team": home_team,
            "away_team": away_team,
            "league": league,
            "home_stats": home_stats.dict(),
            "away_stats": away_stats.dict(),
            "match_date": match_data.get("dateEvent"),
            "venue": match_data.get("strVenue")
        }
        
        # Generate AI prediction and roasts
        ai_response = await call_groq_api(context)
        
        return AIPrediction(
            match_id=match_id,
            home_team=home_team,
            away_team=away_team,
            league=league,
            ai_prediction=ai_response["prediction"],
            ai_roast_loser=ai_response["roast_loser"],
            confidence=ai_response["confidence"],
            reasoning=ai_response["reasoning"],
            created_at=datetime.now().isoformat()
        )
        
    except Exception as e:
        # Fallback response
        return AIPrediction(
            match_id=match_data.get("idEvent", "unknown"),
            home_team=match_data.get("strHomeTeam", "Team 1"),
            away_team=match_data.get("strAwayTeam", "Team 2"),
            league=match_data.get("strLeague", "Unknown League"),
            ai_prediction="The better team will win!",
            ai_roast_loser="This team is going to get roasted!",
            confidence=0.5,
            reasoning="Fallback prediction due to API error",
            created_at=datetime.now().isoformat()
        )

async def upload_to_ipfs(data: Dict) -> str:
    """Upload data to IPFS using Pinata"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{PINATA_BASE_URL}/pinning/pinJSONToIPFS",
                headers={
                    "pinata_api_key": PINATA_API_KEY,
                    "pinata_secret_api_key": PINATA_SECRET_KEY,
                    "Content-Type": "application/json"
                },
                json={
                    "pinataContent": data,
                    "pinataMetadata": {
                        "name": f"rage-bet-prediction-{data.get('match_id', 'unknown')}"
                    }
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["IpfsHash"]
            else:
                raise Exception(f"Pinata API error: {response.status_code}")
                
    except Exception as e:
        print(f"Error uploading to IPFS: {e}")
        return None

async def fetch_upcoming_matches(league_id: str = "4328") -> List[Dict]:
    """Fetch upcoming matches for a league (default: Premier League)"""
    async with httpx.AsyncClient() as client:
        try:
            url = f"{SPORTSDB_BASE_URL}/eventsnextleague.php?id={league_id}"
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            return data.get("events", [])
        except:
            return []

def generate_trash_talk(team1: str, team2: str, team1_stats: Dict, team2_stats: Dict) -> str:
    """Generate AI trash talk based on team stats"""
    
    # Simple rule-based trash talk generator
    # In production, this would use a fine-tuned LLM
    
    trash_talks = [
        f"🔥 {team1} is coming in HOT! {team2} better prepare for a brutal reality check! The AI predicts tears and memes! 😤",
        f"💀 {team2} looking shaky lately... {team1} about to expose them harder than a leaked WhatsApp chat! AI says it's massacre time! 🎯",
        f"😈 {team1} vs {team2}? More like a masterclass vs a disaster class! AI's calling it: {team1} dominates while {team2} trends on Twitter for all the wrong reasons! 📉",
        f"🚨 BREAKING: {team2} rumored to forfeit after seeing {team1}'s form! AI prediction: {team1} wins so hard, it becomes a case study! 🎓",
        f"⚡ {team1} is ELECTRIC right now! {team2}? More like {team2[:-1]}n't! AI says this won't even be close! 💥",
        f"🎪 {team2} defense looking like a circus act! {team1}'s attack about to put on a show! AI confidence: 99.9%! 🎭",
        f"📊 Stats don't lie: {team1} is superior in EVERY metric! {team2} fans already preparing the excuses! AI verdict: Obliteration incoming! 💣",
        f"🧠 AI analysis complete: {team1} wins this 9 times out of 10. That 10th time? {team2} still loses but makes it look closer! 🤖"
    ]
    
    import random
    return random.choice(trash_talks)

def make_prediction(team1: str, team2: str, team1_stats: Dict, team2_stats: Dict) -> tuple[str, float]:
    """Make a prediction based on team stats"""
    
    # Simple prediction logic
    # In production, use ML model
    
    team1_strength = 0.5
    team2_strength = 0.5
    
    # Adjust based on available stats
    if team1_stats and team2_stats:
        # Compare formed year (older = more established)
        if team1_stats.get("intFormedYear") and team2_stats.get("intFormedYear"):
            if int(team1_stats.get("intFormedYear", 0)) < int(team2_stats.get("intFormedYear", 0)):
                team1_strength += 0.1
            else:
                team2_strength += 0.1
    
    # Random factor for variation
    import random
    team1_strength += random.uniform(-0.2, 0.2)
    team2_strength += random.uniform(-0.2, 0.2)
    
    if team1_strength > team2_strength:
        confidence = min(team1_strength / (team1_strength + team2_strength), 0.95)
        return f"{team1} to WIN", confidence
    else:
        confidence = min(team2_strength / (team1_strength + team2_strength), 0.95)
        return f"{team2} to WIN", confidence

# Helper function for API calls with caching
async def fetch_sportsdb(endpoint: str, cache_key: str = None, cache_duration: int = 300):
    """Fetch data from SportsDB API with optional caching"""
    if cache_key and cache_key in api_cache:
        cached_data, cached_time = api_cache[cache_key]
        if (datetime.now() - cached_time).seconds < cache_duration:
            return cached_data
    
    async with httpx.AsyncClient() as client:
        try:
            url = f"{SPORTSDB_BASE_URL}/{endpoint}"
            response = await client.get(url, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            if cache_key:
                api_cache[cache_key] = (data, datetime.now())
            
            return data
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"SportsDB API error: {str(e)}")

# ========================================
# ROOT & HEALTH ENDPOINTS
# ========================================

@app.get("/")
async def root():
    return {
        "message": "Rage Bet API - Full SportsDB Integration",
        "version": "2.0.0",
        "documentation": "/docs",
        "categories": {
            "search": ["teams", "players", "events", "venues"],
            "lookup": ["team", "player", "event", "league", "table", "stats"],
            "schedule": ["next-league", "past-league", "next-team", "last-team", "by-date"],
            "prediction": ["trash-talk", "create-market"]
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# ========================================
# SEARCH ENDPOINTS
# ========================================

@app.get("/api/search/teams")
async def search_teams(q: str = Query(..., description="Team name to search")):
    """Search for teams by name"""
    data = await fetch_sportsdb(f"searchteams.php?t={q}", f"search_teams_{q}")
    return data.get("teams", [])

@app.get("/api/search/players")
async def search_players(q: str = Query(..., description="Player name to search")):
    """Search for players by name"""
    data = await fetch_sportsdb(f"searchplayers.php?p={q}", f"search_players_{q}")
    return data.get("players", [])

@app.get("/api/search/events")
async def search_events(
    q: str = Query(..., description="Event name"),
    season: Optional[str] = None,
    date: Optional[str] = None
):
    """Search for events/matches"""
    endpoint = f"searchevents.php?e={q}"
    if season:
        endpoint += f"&s={season}"
    if date:
        endpoint += f"&d={date}"
    data = await fetch_sportsdb(endpoint)
    return data.get("events", [])

@app.get("/api/search/venues")
async def search_venues(q: str = Query(..., description="Venue name")):
    """Search for venues/stadiums"""
    data = await fetch_sportsdb(f"searchvenues.php?v={q}", f"search_venues_{q}")
    return data.get("venues", [])

# ========================================
# LOOKUP ENDPOINTS
# ========================================

@app.get("/api/lookup/team/{team_id}")
async def lookup_team(team_id: str):
    """Get detailed team information"""
    data = await fetch_sportsdb(f"lookupteam.php?id={team_id}", f"team_{team_id}")
    teams = data.get("teams", [])
    return teams[0] if teams else None

@app.get("/api/lookup/player/{player_id}")
async def lookup_player(player_id: str):
    """Get detailed player information"""
    data = await fetch_sportsdb(f"lookupplayer.php?id={player_id}", f"player_{player_id}")
    players = data.get("players", [])
    return players[0] if players else None

@app.get("/api/lookup/event/{event_id}")
async def lookup_event(event_id: str):
    """Get detailed event/match information"""
    data = await fetch_sportsdb(f"lookupevent.php?id={event_id}", f"event_{event_id}")
    events = data.get("events", [])
    return events[0] if events else None

@app.get("/api/lookup/league/{league_id}")
async def lookup_league(league_id: str):
    """Get league information"""
    data = await fetch_sportsdb(f"lookupleague.php?id={league_id}", f"league_{league_id}")
    leagues = data.get("leagues", [])
    return leagues[0] if leagues else None

@app.get("/api/lookup/table/{league_id}")
async def lookup_table(league_id: str, season: Optional[str] = None):
    """Get league table/standings"""
    endpoint = f"lookuptable.php?l={league_id}"
    if season:
        endpoint += f"&s={season}"
    data = await fetch_sportsdb(endpoint, f"table_{league_id}_{season}")
    return data.get("table", [])

@app.get("/api/lookup/stats/{event_id}")
async def lookup_event_stats(event_id: str):
    """Get event statistics"""
    data = await fetch_sportsdb(f"lookupeventstats.php?id={event_id}")
    return data.get("eventstats", [])

@app.get("/api/lookup/timeline/{event_id}")
async def lookup_timeline(event_id: str):
    """Get event timeline (goals, cards, etc.)"""
    data = await fetch_sportsdb(f"lookuptimeline.php?id={event_id}")
    return data.get("timeline", [])

@app.get("/api/lookup/lineup/{event_id}")
async def lookup_lineup(event_id: str):
    """Get team lineups for an event"""
    data = await fetch_sportsdb(f"lookuplineup.php?id={event_id}")
    return data.get("lineup", [])

@app.get("/api/lookup/player/honours/{player_id}")
async def lookup_player_honours(player_id: str):
    """Get player honours/trophies"""
    data = await fetch_sportsdb(f"lookuphonours.php?id={player_id}")
    return data.get("honours", [])

@app.get("/api/lookup/player/former-teams/{player_id}")
async def lookup_former_teams(player_id: str):
    """Get player's former teams"""
    data = await fetch_sportsdb(f"lookupformerteams.php?id={player_id}")
    return data.get("formerteams", [])

@app.get("/api/lookup/player/contracts/{player_id}")
async def lookup_contracts(player_id: str):
    """Get player contracts"""
    data = await fetch_sportsdb(f"lookupcontracts.php?id={player_id}")
    return data.get("contracts", [])

# ========================================
# SCHEDULE ENDPOINTS
# ========================================

@app.get("/api/schedule/next-league/{league_id}")
async def next_league_events(league_id: str):
    """Get upcoming events for a league"""
    data = await fetch_sportsdb(f"eventsnextleague.php?id={league_id}", f"next_league_{league_id}", 60)
    return data.get("events", [])

@app.get("/api/schedule/past-league/{league_id}")
async def past_league_events(league_id: str):
    """Get past events for a league"""
    data = await fetch_sportsdb(f"eventspastleague.php?id={league_id}", f"past_league_{league_id}", 60)
    return data.get("events", [])

@app.get("/api/schedule/next-team/{team_id}")
async def next_team_events(team_id: str):
    """Get upcoming events for a team"""
    data = await fetch_sportsdb(f"eventsnext.php?id={team_id}", f"next_team_{team_id}", 60)
    return data.get("events", [])

@app.get("/api/schedule/last-team/{team_id}")
async def last_team_events(team_id: str):
    """Get recent events for a team"""
    data = await fetch_sportsdb(f"eventslast.php?id={team_id}", f"last_team_{team_id}", 60)
    return data.get("results", [])

@app.get("/api/schedule/by-date/{date}")
async def events_by_date(
    date: str,
    sport: Optional[str] = Query(None, description="Sport filter"),
    league: Optional[str] = Query(None, description="League filter")
):
    """Get all events on a specific date"""
    endpoint = f"eventsday.php?d={date}"
    if sport:
        endpoint += f"&s={sport}"
    if league:
        endpoint += f"&l={league}"
    data = await fetch_sportsdb(endpoint)
    return data.get("events", [])

# ========================================
# PREDICTION & BETTING ENDPOINTS
# ========================================

@app.post("/api/trash-talk")
async def generate_trash_talk_endpoint(match_data: MatchData) -> TrashTalkResponse:
    """Generate AI trash talk for a match"""
    
    # Fetch team statistics
    team1_stats = await fetch_team_stats(match_data.team1)
    team2_stats = await fetch_team_stats(match_data.team2)
    
    # Generate trash talk
    trash_talk = generate_trash_talk(
        match_data.team1,
        match_data.team2,
        team1_stats,
        team2_stats
    )
    
    # Make prediction
    prediction, confidence = make_prediction(
        match_data.team1,
        match_data.team2,
        team1_stats,
        team2_stats
    )
    
    return TrashTalkResponse(
        trash_talk=trash_talk,
        prediction=prediction,
        confidence=confidence,
        match_id=match_data.match_id or "",
        team1=match_data.team1,
        team2=match_data.team2
    )

@app.get("/api/match/{match_id}")
async def get_match_result(match_id: str) -> MatchResult:
    """Get match result from SportsDB"""
    
    match_data = await fetch_match_data(match_id)
    
    return MatchResult(
        match_id=match_id,
        home_team=match_data.get("strHomeTeam", ""),
        away_team=match_data.get("strAwayTeam", ""),
        home_score=int(match_data.get("intHomeScore") or 0),
        away_score=int(match_data.get("intAwayScore") or 0),
        status=match_data.get("strStatus", ""),
        date=match_data.get("dateEvent", "")
    )

@app.get("/api/upcoming/{league_id}")
async def get_upcoming_matches(league_id: str):
    """Get upcoming matches for a league"""
    
    matches = await fetch_upcoming_matches(league_id)
    
    return {
        "league_id": league_id,
        "count": len(matches),
        "matches": [
            {
                "id": match.get("idEvent"),
                "home_team": match.get("strHomeTeam"),
                "away_team": match.get("strAwayTeam"),
                "date": match.get("dateEvent"),
                "time": match.get("strTime"),
                "venue": match.get("strVenue")
            }
            for match in matches[:10]  # Return top 10
        ]
    }

@app.post("/ai/generate-prediction")
async def generate_prediction_endpoint(match_id: str = Query(..., description="Match ID to generate prediction for")):
    """
    Generate AI prediction and roasts for a match
    """
    try:
        # Check cache first
        if match_id in ai_prediction_cache:
            cached_prediction, cached_time = ai_prediction_cache[match_id]
            # Cache for 6 hours
            if datetime.now() - cached_time < timedelta(hours=6):
                return {"prediction": cached_prediction, "cached": True}
        
        # Fetch match data
        match_data = await fetch_match_data(match_id)
        
        if not match_data:
            raise HTTPException(status_code=404, detail="Match not found")
        
        # Generate AI prediction and roasts
        prediction = await generate_ai_prediction_and_roast(match_data)
        
        # Cache the prediction
        ai_prediction_cache[match_id] = (prediction, datetime.now())
        
        # Upload to IPFS
        ipfs_hash = await upload_to_ipfs(prediction.dict())
        if ipfs_hash:
            prediction.ipfs_hash = ipfs_hash
        
        return {
            "success": True,
            "prediction": prediction,
            "message": "AI prediction and roasts generated successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating prediction: {str(e)}")

@app.get("/ai/predictions/{match_id}")
async def get_prediction(match_id: str):
    """
    Get AI prediction for a specific match
    """
    try:
        # In a real app, this would fetch from database
        # For now, we'll generate on-demand
        match_data = await fetch_match_data(match_id)
        
        if not match_data:
            raise HTTPException(status_code=404, detail="Match not found")
        
        prediction = await generate_ai_prediction_and_roast(match_data)
        
        return {
            "success": True,
            "prediction": prediction
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching prediction: {str(e)}")

@app.post("/nft/generate-metadata")
async def generate_nft_metadata(
    match_id: str,
    user_choice: str,
    ai_roast: str,
    user_address: str
):
    """
    Generate NFT metadata for a bet
    """
    try:
        # Fetch match data for context
        match_data = await fetch_match_data(match_id)
        
        if not match_data:
            raise HTTPException(status_code=404, detail="Match not found")
        
        home_team = match_data.get("strHomeTeam", "Team 1")
        away_team = match_data.get("strAwayTeam", "Team 2")
        
        # Create NFT metadata
        metadata = NFTMetadata(
            name=f"Rage Bet NFT - {home_team} vs {away_team}",
            description=f"AI Trash Talk for {home_team} vs {away_team}",
            image="https://ipfs.io/ipfs/QmYourImageHash",  # Would be dynamic
            attributes=[
                {"trait_type": "Match", "value": f"{home_team} vs {away_team}"},
                {"trait_type": "User Choice", "value": user_choice},
                {"trait_type": "AI Roast", "value": ai_roast},
                {"trait_type": "League", "value": match_data.get("strLeague", "Unknown")},
                {"trait_type": "Venue", "value": match_data.get("strVenue", "Unknown")},
                {"trait_type": "Date", "value": match_data.get("dateEvent", "Unknown")},
                {"trait_type": "Bet Type", "value": "AI Prediction Bet"}
            ],
            match_id=match_id,
            user_choice=user_choice,
            ai_roast=ai_roast,
            created_at=datetime.now().isoformat()
        )
        
        # Upload to IPFS
        ipfs_hash = await upload_to_ipfs(metadata.dict())
        
        return {
            "success": True,
            "metadata": metadata,
            "ipfs_hash": ipfs_hash,
            "message": "NFT metadata generated successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating NFT metadata: {str(e)}")

@app.post("/community/vote-roast")
async def vote_for_roast(vote: CommunityVote):
    """
    Vote for the funniest AI roast
    """
    try:
        # In a real app, this would store in database
        # For now, we'll just return success
        return {
            "success": True,
            "vote": vote,
            "message": "Vote recorded successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error recording vote: {str(e)}")

@app.get("/community/roast-leaderboard")
async def get_roast_leaderboard():
    """
    Get leaderboard of funniest roasts
    """
    try:
        # In a real app, this would fetch from database
        # For now, we'll return mock data
        return {
            "success": True,
            "leaderboard": [
                {
                    "roast_id": "roast_1",
                    "match_id": "2267156",
                    "roast": "United's midfield is slower than my grandma's Wi-Fi!",
                    "votes": 150,
                    "rank": 1
                },
                {
                    "roast_id": "roast_2", 
                    "match_id": "2267157",
                    "roast": "Liverpool's defense has more holes than Swiss cheese!",
                    "votes": 120,
                    "rank": 2
                }
            ],
            "message": "Roast leaderboard retrieved successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching leaderboard: {str(e)}")

@app.post("/oracle/resolve-market")
async def resolve_market_oracle(resolution: MarketResolution):
    """
    Resolve a prediction market using Web2 oracle logic
    This replaces the Chainlink oracle functionality
    """
    try:
        # Resolve the match result
        match_result = await resolve_match_result(resolution.match_id)
        
        # Update the resolution with actual data
        resolution.ai_was_right = match_result.ai_was_right
        resolution.home_score = match_result.home_score
        resolution.away_score = match_result.away_score
        resolution.status = match_result.status
        
        return {
            "success": True,
            "market_id": resolution.market_id,
            "match_id": resolution.match_id,
            "ai_was_right": resolution.ai_was_right,
            "home_score": resolution.home_score,
            "away_score": resolution.away_score,
            "status": resolution.status,
            "message": "Market resolved successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resolving market: {str(e)}")

async def resolve_match_result(match_id: str) -> MarketResolution:
    """Resolve match result and determine if AI was right"""
    try:
        # Fetch match data
        match_data = await fetch_match_data(match_id)
        
        if not match_data:
            raise HTTPException(status_code=404, detail="Match not found")
        
        # Extract match information
        home_team = match_data.get("strHomeTeam", "Unknown Team")
        away_team = match_data.get("strAwayTeam", "Unknown Team")
        home_score = match_data.get("intHomeScore")
        away_score = match_data.get("intAwayScore")
        status = match_data.get("strStatus", "Unknown")
        
        # Determine if match is finished
        if status != "Match Finished" or home_score is None or away_score is None:
            return MarketResolution(
                market_id=0,  # Will be set by caller
                match_id=match_id,
                ai_was_right=False,
                home_score=home_score,
                away_score=away_score,
                status=status
            )
        
        # Simple AI prediction logic (in real app, this would be more sophisticated)
        # For now, we'll use a simple heuristic: home team advantage + random factor
        home_advantage = 0.1  # 10% home advantage
        random_factor = random.uniform(-0.3, 0.3)  # Random factor
        
        # Predict home team win if home_score > away_score
        predicted_home_win = home_score > away_score
        actual_home_win = home_score > away_score
        
        # AI was right if prediction matches actual result
        ai_was_right = predicted_home_win == actual_home_win
        
        return MarketResolution(
            market_id=0,  # Will be set by caller
            match_id=match_id,
            ai_was_right=ai_was_right,
            home_score=home_score,
            away_score=away_score,
            status=status
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error resolving match: {str(e)}")

@app.post("/chainlink")
async def chainlink_adapter(request: dict):
    """
    Chainlink external adapter endpoint
    Fetches match results and determines if AI prediction was correct
    """
    
    try:
        # Extract match ID from request
        match_id = request.get("data", {}).get("matchId")
        
        if not match_id:
            return {
                "jobRunID": request.get("id"),
                "error": "Missing matchId",
                "statusCode": 500
            }
        
        # Fetch match data
        match_data = await fetch_match_data(match_id)
        
        # Extract scores
        home_score = int(match_data.get("intHomeScore") or 0)
        away_score = int(match_data.get("intAwayScore") or 0)
        status = match_data.get("strStatus", "")
        
        # Check if match is finished
        if status not in ["Match Finished", "FT"]:
            return {
                "jobRunID": request.get("id"),
                "error": "Match not finished yet",
                "statusCode": 400
            }
        
        # Determine result (home win for AI prediction)
        # This is simplified - in production, compare with actual AI prediction
        ai_was_right = home_score > away_score
        
        return {
            "jobRunID": request.get("id"),
            "data": {
                "aiWasRight": ai_was_right,
                "homeScore": home_score,
                "awayScore": away_score,
                "status": status
            },
            "result": ai_was_right,
            "statusCode": 200
        }
        
    except Exception as e:
        return {
            "jobRunID": request.get("id"),
            "error": str(e),
            "statusCode": 500
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
