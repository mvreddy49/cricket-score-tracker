// Sample Cricket Data for Gully Matches
// This creates realistic demo data for testing the UI

const DEMO_DATA = {
    // Sample player names (common Indian names for gully cricket)
    players: [
        'Rahul', 'Virat', 'Rohit', 'Dhoni', 'Jadeja', 'Hardik', 'Bumrah', 'Shami',
        'Arjun', 'Karan', 'Amit', 'Suraj', 'Ravi', 'Ajay', 'Vikram', 'Sachin',
        'Anil', 'Deepak', 'Manoj', 'Sanjay', 'Raj', 'Dev', 'Akash', 'Nitin'
    ],
    
    // Team names for gully cricket
    teamNames: [
        'Champions', 'Warriors', 'Kings', 'Riders', 'Eagles', 'Lions', 'Tigers', 'Sharks',
        'Thunders', 'Blasters', 'Crushers', 'Gladiators', 'Mavericks', 'Hurricanes'
    ],

    // Generate random past matches
    generateSampleMatches: function(count = 15) {
        const matches = [];
        const today = new Date();
        
        for (let i = 0; i < count; i++) {
            // Generate date in past 2 months
            const matchDate = new Date(today);
            matchDate.setDate(today.getDate() - Math.floor(Math.random() * 60));
            
            // Random overs (6 or 8)
            const overs = Math.random() > 0.5 ? 6 : 8;
            
            // Random team sizes (6-11 players)
            const team1Size = 6 + Math.floor(Math.random() * 6); // 6-11
            const team2Size = 6 + Math.floor(Math.random() * 6); // 6-11
            
            // Select random players
            const shuffledPlayers = [...this.players].sort(() => Math.random() - 0.5);
            const team1Players = shuffledPlayers.slice(0, team1Size);
            const team2Players = shuffledPlayers.slice(team1Size, team1Size + team2Size);
            
            // Random team names
            const shuffledTeams = [...this.teamNames].sort(() => Math.random() - 0.5);
            const team1Name = shuffledTeams[0];
            const team2Name = shuffledTeams[1];
            
            // Generate realistic scores
            const team1Score = this.generateRealisticScore(overs);
            const team2Score = this.generateRealisticScore(overs, team1Score);
            
            // Determine winner
            let winner;
            if (team1Score.runs > team2Score.runs) {
                winner = team1Name;
            } else if (team2Score.runs > team1Score.runs) {
                winner = team2Name;
            } else {
                winner = 'Draw';
            }
            
            const match = {
                id: Date.now() + i,
                name: `${team1Name} vs ${team2Name}`,
                date: matchDate.toISOString().split('T')[0],
                overs: overs,
                teams: {
                    team1: {
                        name: team1Name,
                        players: team1Players,
                        score: team1Score,
                        batting: false
                    },
                    team2: {
                        name: team2Name,
                        players: team2Players,
                        score: team2Score,
                        batting: false
                    }
                },
                status: 'completed',
                innings: 2,
                winner: winner,
                ballByBall: [],
                completedDate: matchDate.toISOString(),
                createdAt: matchDate.toISOString()
            };
            
            matches.push(match);
        }
        
        return matches.sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    
    // Generate realistic cricket scores
    generateRealisticScore: function(overs, targetScore = null) {
        // Base runs per over for gully cricket (usually higher scoring)
        const baseRunsPerOver = 8 + Math.random() * 6; // 8-14 runs per over
        let totalRuns = Math.floor(overs * baseRunsPerOver);
        
        // Add some randomness
        totalRuns += Math.floor(Math.random() * 20) - 10; // +/- 10 runs
        totalRuns = Math.max(totalRuns, overs * 3); // Minimum 3 runs per over
        
        // If chasing, make it realistic (close finish or comfortable win/loss)
        if (targetScore) {
            const difference = Math.random();
            if (difference < 0.3) {
                // Close finish (within 10 runs)
                totalRuns = targetScore.runs + (Math.floor(Math.random() * 21) - 10);
            } else if (difference < 0.6) {
                // Comfortable win (20+ runs difference)
                totalRuns = targetScore.runs + (Math.floor(Math.random() * 40) + 15);
            } else {
                // Comfortable loss
                totalRuns = targetScore.runs - (Math.floor(Math.random() * 30) + 10);
            }
        }
        
        totalRuns = Math.max(totalRuns, 0);
        
        // Generate wickets (realistic for gully cricket)
        const maxWickets = Math.min(10, Math.floor(Math.random() * 8) + 2); // 2-9 wickets max
        let wickets = Math.floor(Math.random() * (maxWickets + 1));
        
        // If very low score, higher chance of all out
        if (totalRuns < overs * 5) {
            wickets = Math.min(wickets + 3, maxWickets);
        }
        
        // Calculate overs bowled
        let oversBowled = overs;
        let ballsBowled = 0;
        
        // If all out before completing overs
        if (wickets >= maxWickets - 1) {
            oversBowled = Math.floor(Math.random() * overs) + 1;
            ballsBowled = Math.floor(Math.random() * 6);
        }
        
        return {
            runs: totalRuns,
            wickets: wickets,
            overs: oversBowled,
            balls: ballsBowled,
            extras: Math.floor(totalRuns * 0.1) // 10% extras on average
        };
    },
    
    // Generate player statistics based on matches
    generatePlayerStats: function(matches) {
        const playerStats = {};
        
        // Initialize all players
        this.players.forEach(player => {
            playerStats[player] = {
                name: player,
                matches: 0,
                runs: 0,
                wickets: Math.floor(Math.random() * 15), // Random wickets
                catches: Math.floor(Math.random() * 8),  // Random catches
                highestScore: 0,
                average: 0
            };
        });
        
        // Calculate stats from matches
        matches.forEach(match => {
            const allPlayers = [...match.teams.team1.players, ...match.teams.team2.players];
            
            allPlayers.forEach(playerName => {
                if (playerStats[playerName]) {
                    playerStats[playerName].matches++;
                    
                    // Add random runs for this match (realistic distribution)
                    const runsInMatch = this.generatePlayerRunsForMatch();
                    playerStats[playerName].runs += runsInMatch;
                    
                    // Update highest score
                    if (runsInMatch > playerStats[playerName].highestScore) {
                        playerStats[playerName].highestScore = runsInMatch;
                    }
                }
            });
        });
        
        // Calculate averages
        Object.values(playerStats).forEach(player => {
            if (player.matches > 0) {
                player.average = parseFloat((player.runs / player.matches).toFixed(2));
            }
        });
        
        // Return only players who have played matches
        return Object.values(playerStats).filter(player => player.matches > 0);
    },
    
    // Generate realistic individual player runs for a match
    generatePlayerRunsForMatch: function() {
        const random = Math.random();
        
        if (random < 0.2) return 0;           // 20% chance of duck
        if (random < 0.4) return Math.floor(Math.random() * 10) + 1;  // 1-10 runs
        if (random < 0.7) return Math.floor(Math.random() * 20) + 11; // 11-30 runs
        if (random < 0.9) return Math.floor(Math.random() * 30) + 31; // 31-60 runs
        return Math.floor(Math.random() * 40) + 61; // 61-100 runs (rare)
    },
    
    // Create a current active match
    generateActiveMatch: function() {
        const overs = Math.random() > 0.5 ? 6 : 8;
        const team1Size = 6 + Math.floor(Math.random() * 6);
        const team2Size = 6 + Math.floor(Math.random() * 6);
        
        const shuffledPlayers = [...this.players].sort(() => Math.random() - 0.5);
        const team1Players = shuffledPlayers.slice(0, team1Size);
        const team2Players = shuffledPlayers.slice(team1Size, team1Size + team2Size);
        
        const shuffledTeams = [...this.teamNames].sort(() => Math.random() - 0.5);
        
        // Generate current innings score (mid-match)
        const currentOvers = Math.floor(Math.random() * overs) + 1;
        const currentBalls = Math.floor(Math.random() * 6);
        const currentRuns = Math.floor(currentOvers * (8 + Math.random() * 6)) + Math.floor(Math.random() * 15);
        const currentWickets = Math.floor(Math.random() * Math.min(team1Size - 1, 6));
        
        return {
            id: Date.now(),
            name: `${shuffledTeams[0]} vs ${shuffledTeams[1]}`,
            date: new Date().toISOString().split('T')[0],
            overs: overs,
            teams: {
                team1: {
                    name: shuffledTeams[0],
                    players: team1Players,
                    score: {
                        runs: currentRuns,
                        wickets: currentWickets,
                        overs: currentOvers,
                        balls: currentBalls,
                        extras: Math.floor(currentRuns * 0.1)
                    },
                    batting: true
                },
                team2: {
                    name: shuffledTeams[1],
                    players: team2Players,
                    score: {
                        runs: 0,
                        wickets: 0,
                        overs: 0,
                        balls: 0,
                        extras: 0
                    },
                    batting: false
                }
            },
            status: 'active',
            innings: 1,
            winner: null,
            ballByBall: []
        };
    }
};

// Function to load demo data into the app
function loadDemoData() {
    console.log('Loading demo cricket data...');
    
    // Generate sample data
    const sampleMatches = DEMO_DATA.generateSampleMatches(20);
    const samplePlayers = DEMO_DATA.generatePlayerStats(sampleMatches);
    const activeMatch = DEMO_DATA.generateActiveMatch();
    
    // Store in global variables
    matches = sampleMatches;
    players = samplePlayers;
    currentMatch = activeMatch;
    
    // Save to localStorage as backup
    localStorage.setItem('cricket_matches', JSON.stringify(matches));
    localStorage.setItem('cricket_players', JSON.stringify(players));
    localStorage.setItem('current_match', JSON.stringify(currentMatch));
    
    // Update UI immediately
    updateDashboard();
    updateLiveScore();
    updateHistory();
    updateStats();
    
    console.log(`Demo data loaded: ${matches.length} matches, ${players.length} players`);
    
    // Show success message
    showDemoLoadedMessage();
}

// Show demo data loaded message
function showDemoLoadedMessage() {
    const message = document.createElement('div');
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    message.innerHTML = `
        <strong>🏏 Demo Data Loaded!</strong><br>
        • 20 past matches<br>
        • ${players.length} players with stats<br>
        • 1 active match<br>
        <small>Explore all tabs to see the UI in action!</small>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        if (document.body.contains(message)) {
            document.body.removeChild(message);
        }
    }, 8000);
}

// Function to clear demo data
function clearDemoData() {
    if (confirm('Are you sure you want to clear all demo data? This will remove all matches and players.')) {
        matches = [];
        players = [];
        currentMatch = null;
        
        localStorage.removeItem('cricket_matches');
        localStorage.removeItem('cricket_players');
        localStorage.removeItem('current_match');
        
        updateDashboard();
        updateLiveScore();
        updateHistory();
        updateStats();
        
        alert('Demo data cleared successfully!');
    }
}

// Export for use in main script
if (typeof window !== 'undefined') {
    window.DEMO_DATA = DEMO_DATA;
    window.loadDemoData = loadDemoData;
    window.clearDemoData = clearDemoData;
}