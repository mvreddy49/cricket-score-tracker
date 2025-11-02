// Cricket Score Tracker JavaScript

// Global variables
let matches = JSON.parse(localStorage.getItem('cricket_matches')) || [];
let currentMatch = JSON.parse(localStorage.getItem('current_match')) || null;
let players = JSON.parse(localStorage.getItem('cricket_players')) || [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Set default date to today
    document.getElementById('matchDate').value = new Date().toISOString().split('T')[0];
    
    // Initialize dashboard
    updateDashboard();
    updateLiveScore();
    updateHistory();
    updateStats();
    
    // Setup form submission
    document.getElementById('newMatchForm').addEventListener('submit', createMatch);
});

// Tab switching functionality
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab content
    document.getElementById(tabName).classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Update content based on tab
    switch(tabName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'live-score':
            updateLiveScore();
            break;
        case 'history':
            updateHistory();
            break;
        case 'stats':
            updateStats();
            break;
    }
}

// Player management functions
function addPlayer(containerId) {
    const container = document.getElementById(containerId);
    const currentCount = container.children.length;
    
    if (currentCount >= 11) {
        alert('Maximum 11 players allowed per team!');
        return;
    }
    
    const playerDiv = document.createElement('div');
    playerDiv.className = 'player-input';
    playerDiv.innerHTML = `
        <input type="text" placeholder="Player ${currentCount + 1} name" required>
        <button type="button" onclick="removePlayer(this)">×</button>
    `;
    container.appendChild(playerDiv);
}

function removePlayer(button) {
    const container = button.parentElement.parentElement;
    if (container.children.length > 6) {
        button.parentElement.remove();
        // Update placeholder numbers
        Array.from(container.children).forEach((child, index) => {
            const input = child.querySelector('input');
            if (input.placeholder.includes('Player')) {
                input.placeholder = `Player ${index + 1} name`;
            }
        });
    } else {
        alert('Each team must have at least 6 players for gully cricket!');
    }
}

// Quick fill team with demo players
function fillTeamWithDemoPlayers(containerId) {
    const demoNames = [
        'Rahul', 'Virat', 'Rohit', 'Dhoni', 'Jadeja', 'Hardik', 'Bumrah', 'Shami',
        'Arjun', 'Karan', 'Amit', 'Suraj', 'Ravi', 'Ajay', 'Vikram', 'Sachin',
        'Anil', 'Deepak', 'Manoj', 'Sanjay', 'Raj', 'Dev', 'Akash', 'Nitin'
    ];
    
    const container = document.getElementById(containerId);
    const inputs = container.querySelectorAll('input');
    
    // Shuffle names and fill inputs
    const shuffledNames = [...demoNames].sort(() => Math.random() - 0.5);
    
    inputs.forEach((input, index) => {
        if (index < shuffledNames.length) {
            input.value = shuffledNames[index];
        }
    });
}

// Create new match
function createMatch(event) {
    event.preventDefault();
    
    const matchName = document.getElementById('matchName').value;
    const team1Name = document.getElementById('team1Name').value;
    const team2Name = document.getElementById('team2Name').value;
    const overs = parseInt(document.getElementById('overs').value);
    const matchDate = document.getElementById('matchDate').value;
    
    // Get players
    const team1Players = Array.from(document.querySelectorAll('#team1Players input'))
        .map(input => input.value.trim())
        .filter(name => name.length > 0);
    
    const team2Players = Array.from(document.querySelectorAll('#team2Players input'))
        .map(input => input.value.trim())
        .filter(name => name.length > 0);
    
    if (team1Players.length < 6 || team2Players.length < 6) {
        alert('Both teams must have at least 6 players for gully cricket!');
        return;
    }
    
    if (team1Players.length > 11 || team2Players.length > 11) {
        alert('Maximum 11 players allowed per team!');
        return;
    }
    
    // Create match object
    const match = {
        id: Date.now(),
        name: matchName,
        date: matchDate,
        overs: overs,
        teams: {
            team1: {
                name: team1Name,
                players: team1Players,
                score: { runs: 0, wickets: 0, overs: 0, balls: 0, extras: 0 },
                batting: true
            },
            team2: {
                name: team2Name,
                players: team2Players,
                score: { runs: 0, wickets: 0, overs: 0, balls: 0, extras: 0 },
                batting: false
            }
        },
        status: 'active',
        innings: 1,
        winner: null,
        ballByBall: []
    };
    
    // Save as current match
    currentMatch = match;
    localStorage.setItem('current_match', JSON.stringify(currentMatch));
    
    // Update players list
    const allPlayers = [...team1Players, ...team2Players];
    allPlayers.forEach(player => {
        if (!players.some(p => p.name === player)) {
            players.push({
                name: player,
                matches: 0,
                runs: 0,
                wickets: 0,
                catches: 0
            });
        }
    });
    localStorage.setItem('cricket_players', JSON.stringify(players));
    
    // Reset form
    document.getElementById('newMatchForm').reset();
    document.getElementById('matchDate').value = new Date().toISOString().split('T')[0];
    
    // Reset player inputs to 6 players each
    const team1HTML = Array.from({length: 6}, (_, i) => `
        <div class="player-input">
            <input type="text" placeholder="Player ${i + 1} name" required>
            <button type="button" onclick="removePlayer(this)">×</button>
        </div>
    `).join('');
    
    const team2HTML = Array.from({length: 6}, (_, i) => `
        <div class="player-input">
            <input type="text" placeholder="Player ${i + 1} name" required>
            <button type="button" onclick="removePlayer(this)">×</button>
        </div>
    `).join('');
    
    document.getElementById('team1Players').innerHTML = team1HTML;
    document.getElementById('team2Players').innerHTML = team2HTML;
    
    alert('Match created successfully! Go to Live Score tab to start tracking.');
    
    // Switch to live score tab
    showTab('live-score');
}

// Live score functions
function updateLiveScore() {
    const noActiveMatch = document.getElementById('noActiveMatch');
    const scoreBoard = document.getElementById('scoreBoard');
    
    if (!currentMatch) {
        noActiveMatch.style.display = 'block';
        scoreBoard.style.display = 'none';
        return;
    }
    
    noActiveMatch.style.display = 'none';
    scoreBoard.style.display = 'block';
    
    // Update match info
    document.getElementById('currentMatchName').textContent = currentMatch.name;
    document.getElementById('currentMatchDate').textContent = new Date(currentMatch.date).toLocaleDateString();
    document.getElementById('currentMatchOvers').textContent = currentMatch.overs;
    
    // Update team names and scores
    const team1 = currentMatch.teams.team1;
    const team2 = currentMatch.teams.team2;
    
    document.getElementById('team1NameDisplay').textContent = team1.name;
    document.getElementById('team2NameDisplay').textContent = team2.name;
    
    document.getElementById('team1Runs').textContent = team1.score.runs;
    document.getElementById('team1Wickets').textContent = team1.score.wickets;
    document.getElementById('team1OversBowled').textContent = `${team1.score.overs}.${team1.score.balls}`;
    document.getElementById('team1Extras').textContent = team1.score.extras;
    
    document.getElementById('team2Runs').textContent = team2.score.runs;
    document.getElementById('team2Wickets').textContent = team2.score.wickets;
    document.getElementById('team2OversBowled').textContent = `${team2.score.overs}.${team2.score.balls}`;
    document.getElementById('team2Extras').textContent = team2.score.extras;
    
    // Update batting team
    const battingTeam = team1.batting ? team1.name : team2.name;
    document.getElementById('battingTeam').textContent = battingTeam;
    
    // Highlight batting team
    document.getElementById('team1Score').classList.toggle('batting', team1.batting);
    document.getElementById('team2Score').classList.toggle('batting', team2.batting);
}

function addRuns(runs) {
    if (!currentMatch) return;
    
    const battingTeam = currentMatch.teams.team1.batting ? currentMatch.teams.team1 : currentMatch.teams.team2;
    const bowlingTeam = currentMatch.teams.team1.batting ? currentMatch.teams.team2 : currentMatch.teams.team1;
    
    // Determine ball type
    let ballType = 'dot';
    if (runs === 1) ballType = 'single';
    else if (runs === 2) ballType = 'double';
    else if (runs === 3) ballType = 'triple';
    else if (runs === 4) ballType = 'boundary';
    else if (runs === 6) ballType = 'six';
    
    battingTeam.score.runs += runs;
    battingTeam.score.balls++;
    
    // Record detailed ball information
    const ballDetail = {
        innings: currentMatch.innings,
        over: battingTeam.score.overs + 1, // Current over being bowled
        ball: battingTeam.score.balls,
        runs: runs,
        type: ballType,
        isExtra: false,
        extraType: null,
        timestamp: new Date().toISOString(),
        battingTeam: battingTeam.name,
        bowlingTeam: bowlingTeam.name,
        totalRuns: battingTeam.score.runs,
        totalWickets: battingTeam.score.wickets,
        description: `${runs} run${runs !== 1 ? 's' : ''}`
    };
    
    currentMatch.ballByBall.push(ballDetail);
    
    // Complete over check
    if (battingTeam.score.balls === 6) {
        battingTeam.score.overs++;
        battingTeam.score.balls = 0;
    }
    
    // Check if innings should end
    if (battingTeam.score.overs >= currentMatch.overs) {
        endInnings();
        return;
    }
    
    localStorage.setItem('current_match', JSON.stringify(currentMatch));
    updateLiveScore();
    updateBallByBallDisplay();
}

function addWicket() {
    if (!currentMatch) return;
    
    const battingTeam = currentMatch.teams.team1.batting ? currentMatch.teams.team1 : currentMatch.teams.team2;
    const bowlingTeam = currentMatch.teams.team1.batting ? currentMatch.teams.team2 : currentMatch.teams.team1;
    
    battingTeam.score.wickets++;
    battingTeam.score.balls++;
    
    // Record detailed wicket information
    const ballDetail = {
        innings: currentMatch.innings,
        over: battingTeam.score.overs + 1,
        ball: battingTeam.score.balls,
        runs: 0,
        type: 'wicket',
        isExtra: false,
        extraType: null,
        timestamp: new Date().toISOString(),
        battingTeam: battingTeam.name,
        bowlingTeam: bowlingTeam.name,
        totalRuns: battingTeam.score.runs,
        totalWickets: battingTeam.score.wickets,
        description: 'Wicket!'
    };
    
    currentMatch.ballByBall.push(ballDetail);
    
    // Complete over check
    if (battingTeam.score.balls === 6) {
        battingTeam.score.overs++;
        battingTeam.score.balls = 0;
    }
    
    // Check if all out or overs complete
    if (battingTeam.score.wickets >= battingTeam.players.length - 1 || 
        battingTeam.score.overs >= currentMatch.overs) {
        endInnings();
        return;
    }
    
    localStorage.setItem('current_match', JSON.stringify(currentMatch));
    updateLiveScore();
    updateBallByBallDisplay();
}

function addExtra() {
    document.getElementById('extraModal').style.display = 'block';
}

function addExtraRuns(runs, type) {
    if (!currentMatch) return;
    
    const battingTeam = currentMatch.teams.team1.batting ? currentMatch.teams.team1 : currentMatch.teams.team2;
    const bowlingTeam = currentMatch.teams.team1.batting ? currentMatch.teams.team2 : currentMatch.teams.team1;
    
    battingTeam.score.runs += runs;
    battingTeam.score.extras += runs;
    
    let ballNumber = battingTeam.score.balls;
    let isLegalDelivery = true;
    
    // Wide and no-ball don't count as balls bowled
    if (type !== 'wide' && type !== 'noball') {
        battingTeam.score.balls++;
        ballNumber = battingTeam.score.balls;
    } else {
        isLegalDelivery = false;
        // For extras that don't count as legal deliveries, ball number stays same
        ballNumber = battingTeam.score.balls + 1;
    }
    
    // Record detailed extra information
    const ballDetail = {
        innings: currentMatch.innings,
        over: battingTeam.score.overs + 1,
        ball: ballNumber,
        runs: runs,
        type: type,
        isExtra: true,
        extraType: type,
        isLegalDelivery: isLegalDelivery,
        timestamp: new Date().toISOString(),
        battingTeam: battingTeam.name,
        bowlingTeam: bowlingTeam.name,
        totalRuns: battingTeam.score.runs,
        totalWickets: battingTeam.score.wickets,
        description: `${runs} ${type}${runs > 1 ? 's' : ''}`
    };
    
    currentMatch.ballByBall.push(ballDetail);
    
    // Complete over check (only for legal deliveries)
    if (isLegalDelivery && battingTeam.score.balls === 6) {
        battingTeam.score.overs++;
        battingTeam.score.balls = 0;
    }
    
    // Check if overs complete
    if (battingTeam.score.overs >= currentMatch.overs) {
        endInnings();
        return;
    }
    
    localStorage.setItem('current_match', JSON.stringify(currentMatch));
    updateLiveScore();
    updateBallByBallDisplay();
    closeModal();
}

function closeModal() {
    document.getElementById('extraModal').style.display = 'none';
}

function endInnings() {
    if (!currentMatch) return;
    
    if (currentMatch.innings === 1) {
        // Switch innings
        currentMatch.teams.team1.batting = !currentMatch.teams.team1.batting;
        currentMatch.teams.team2.batting = !currentMatch.teams.team2.batting;
        currentMatch.innings = 2;
        
        alert(`End of ${currentMatch.teams.team1.batting ? currentMatch.teams.team1.name : currentMatch.teams.team2.name}'s innings. ${currentMatch.teams.team1.batting ? currentMatch.teams.team1.name : currentMatch.teams.team2.name} needs ${(currentMatch.teams.team1.batting ? currentMatch.teams.team2.score.runs : currentMatch.teams.team1.score.runs) + 1} runs to win.`);
    } else {
        // Match finished
        finishMatch();
        return;
    }
    
    localStorage.setItem('current_match', JSON.stringify(currentMatch));
    updateLiveScore();
}

function finishMatch() {
    if (!currentMatch) return;
    
    // Determine winner
    const team1Score = currentMatch.teams.team1.score.runs;
    const team2Score = currentMatch.teams.team2.score.runs;
    
    if (team1Score > team2Score) {
        currentMatch.winner = currentMatch.teams.team1.name;
    } else if (team2Score > team1Score) {
        currentMatch.winner = currentMatch.teams.team2.name;
    } else {
        currentMatch.winner = 'Draw';
    }
    
    currentMatch.status = 'completed';
    currentMatch.completedDate = new Date().toISOString();
    
    // Add to matches history
    matches.unshift(currentMatch);
    localStorage.setItem('cricket_matches', JSON.stringify(matches));
    
    // Update player stats
    updatePlayerStats(currentMatch);
    
    // Clear current match
    currentMatch = null;
    localStorage.removeItem('current_match');
    
    alert(`Match finished! Winner: ${matches[0].winner}`);
    
    updateDashboard();
    updateLiveScore();
    updateHistory();
    updateStats();
}

function resetMatch() {
    if (!currentMatch) return;
    
    if (confirm('Are you sure you want to reset the current match? All score data will be lost.')) {
        currentMatch = null;
        localStorage.removeItem('current_match');
        updateLiveScore();
        updateDashboard();
    }
}

// Dashboard functions
function updateDashboard() {
    document.getElementById('totalMatches').textContent = matches.length;
    document.getElementById('activeMatch').textContent = currentMatch ? currentMatch.name : 'None';
    document.getElementById('lastWinner').textContent = matches.length > 0 ? matches[0].winner : '-';
    document.getElementById('totalPlayers').textContent = players.length;
    
    // Update recent matches
    const recentMatchesList = document.getElementById('recentMatchesList');
    if (matches.length === 0) {
        recentMatchesList.innerHTML = '<p class="no-data">No matches played yet. Start by creating a new match!</p>';
    } else {
        const recentMatches = matches.slice(0, 5);
        recentMatchesList.innerHTML = recentMatches.map(match => `
            <div class="match-item">
                <h4>${match.name}</h4>
                <div class="match-details">
                    <div><strong>Date:</strong> ${new Date(match.date).toLocaleDateString()}</div>
                    <div><strong>Teams:</strong> ${match.teams.team1.name} vs ${match.teams.team2.name}</div>
                    <div><strong>Winner:</strong> ${match.winner}</div>
                    <div><strong>Score:</strong> ${match.teams.team1.score.runs}/${match.teams.team1.score.wickets} - ${match.teams.team2.score.runs}/${match.teams.team2.score.wickets}</div>
                </div>
            </div>
        `).join('');
    }
}

// History functions
function updateHistory() {
    const matchHistory = document.getElementById('matchHistory');
    
    if (matches.length === 0) {
        matchHistory.innerHTML = '<p class="no-data">No match history available.</p>';
        return;
    }
    
    const matchesHtml = matches.map(match => `
        <div class="match-item">
            <h4>${match.name}</h4>
            <div class="match-details">
                <div><strong>Date:</strong> ${new Date(match.date).toLocaleDateString()}</div>
                <div><strong>Teams:</strong> ${match.teams.team1.name} vs ${match.teams.team2.name}</div>
                <div><strong>Overs:</strong> ${match.overs} per side</div>
                <div><strong>Winner:</strong> ${match.winner}</div>
                <div><strong>Final Score:</strong> ${match.teams.team1.name}: ${match.teams.team1.score.runs}/${match.teams.team1.score.wickets} (${match.teams.team1.score.overs}.${match.teams.team1.score.balls}) | ${match.teams.team2.name}: ${match.teams.team2.score.runs}/${match.teams.team2.score.wickets} (${match.teams.team2.score.overs}.${match.teams.team2.score.balls})</div>
                <div><strong>Status:</strong> ${match.status}</div>
            </div>
        </div>
    `).join('');
    
    matchHistory.innerHTML = matchesHtml;
}

function filterHistory() {
    const searchTerm = document.getElementById('searchHistory').value.toLowerCase();
    const filterResult = document.getElementById('filterByResult').value;
    
    let filteredMatches = matches;
    
    if (searchTerm) {
        filteredMatches = filteredMatches.filter(match => 
            match.name.toLowerCase().includes(searchTerm) ||
            match.teams.team1.name.toLowerCase().includes(searchTerm) ||
            match.teams.team2.name.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filterResult !== 'all') {
        filteredMatches = filteredMatches.filter(match => match.status === filterResult);
    }
    
    const matchHistory = document.getElementById('matchHistory');
    if (filteredMatches.length === 0) {
        matchHistory.innerHTML = '<p class="no-data">No matches found matching your criteria.</p>';
        return;
    }
    
    const matchesHtml = filteredMatches.map(match => `
        <div class="match-item">
            <h4>${match.name}</h4>
            <div class="match-details">
                <div><strong>Date:</strong> ${new Date(match.date).toLocaleDateString()}</div>
                <div><strong>Teams:</strong> ${match.teams.team1.name} vs ${match.teams.team2.name}</div>
                <div><strong>Winner:</strong> ${match.winner}</div>
                <div><strong>Score:</strong> ${match.teams.team1.score.runs}/${match.teams.team1.score.wickets} - ${match.teams.team2.score.runs}/${match.teams.team2.score.wickets}</div>
            </div>
        </div>
    `).join('');
    
    matchHistory.innerHTML = matchesHtml;
}

// Stats functions
function updateStats() {
    updateTopPerformers();
    updateTeamPerformance();
}

function updateTopPerformers() {
    const topPerformers = document.getElementById('topPerformers');
    
    if (players.length === 0) {
        topPerformers.innerHTML = '<p class="no-data">Play some matches to see statistics!</p>';
        return;
    }
    
    // Sort players by runs
    const topScorers = [...players].sort((a, b) => b.runs - a.runs).slice(0, 5);
    
    const performersHtml = `
        <h4>Top Run Scorers</h4>
        ${topScorers.map((player, index) => `
            <div style="padding: 10px; margin: 5px 0; background: #f0f0f0; border-radius: 5px;">
                ${index + 1}. ${player.name} - ${player.runs} runs (${player.matches} matches)
            </div>
        `).join('')}
    `;
    
    topPerformers.innerHTML = performersHtml;
}

function updateTeamPerformance() {
    const teamPerformance = document.getElementById('teamPerformance');
    
    if (matches.length === 0) {
        teamPerformance.innerHTML = '<p class="no-data">Play some matches to see team statistics!</p>';
        return;
    }
    
    // Calculate team wins
    const teamWins = {};
    matches.forEach(match => {
        if (match.winner && match.winner !== 'Draw') {
            teamWins[match.winner] = (teamWins[match.winner] || 0) + 1;
        }
    });
    
    const sortedTeams = Object.entries(teamWins).sort((a, b) => b[1] - a[1]);
    
    const teamsHtml = `
        <h4>Team Win Statistics</h4>
        ${sortedTeams.map(([team, wins], index) => `
            <div style="padding: 10px; margin: 5px 0; background: #f0f0f0; border-radius: 5px;">
                ${index + 1}. ${team} - ${wins} wins
            </div>
        `).join('')}
        <div style="margin-top: 15px; padding: 10px; background: #e8f5e8; border-radius: 5px;">
            <strong>Total Matches Played:</strong> ${matches.length}
        </div>
    `;
    
    teamPerformance.innerHTML = teamsHtml;
}

function updatePlayerStats(match) {
    // Update player match counts
    const allMatchPlayers = [...match.teams.team1.players, ...match.teams.team2.players];
    
    allMatchPlayers.forEach(playerName => {
        const player = players.find(p => p.name === playerName);
        if (player) {
            player.matches++;
        }
    });
    
    // In a real implementation, you would track individual player scores per match
    // For now, we'll just update match counts
    localStorage.setItem('cricket_players', JSON.stringify(players));
}

// Utility functions
function exportData() {
    const data = {
        matches: matches,
        players: players,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `cricket-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.matches && data.players) {
                matches = data.matches;
                players = data.players;
                
                localStorage.setItem('cricket_matches', JSON.stringify(matches));
                localStorage.setItem('cricket_players', JSON.stringify(players));
                
                updateDashboard();
                updateHistory();
                updateStats();
                
                alert('Data imported successfully!');
            } else {
                alert('Invalid data format!');
            }
        } catch (error) {
            alert('Error importing data: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                showTab('dashboard');
                break;
            case '2':
                e.preventDefault();
                showTab('new-match');
                break;
            case '3':
                e.preventDefault();
                showTab('live-score');
                break;
            case '4':
                e.preventDefault();
                showTab('history');
                break;
            case '5':
                e.preventDefault();
                showTab('stats');
                break;
        }
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('extraModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Ball-by-ball scorecard functions
function updateBallByBallDisplay() {
    if (!currentMatch || !currentMatch.ballByBall || currentMatch.ballByBall.length === 0) {
        document.getElementById('currentOversDisplay').innerHTML = '<p class="no-data">No balls bowled yet. Start scoring to see ball-by-ball details!</p>';
        return;
    }
    
    // Group balls by innings and over
    const inningsData = {};
    
    currentMatch.ballByBall.forEach(ball => {
        const innings = ball.innings;
        const over = ball.over;
        
        if (!inningsData[innings]) {
            inningsData[innings] = {};
        }
        if (!inningsData[innings][over]) {
            inningsData[innings][over] = [];
        }
        inningsData[innings][over].push(ball);
    });
    
    // Update current innings
    updateInningsDisplay('currentOversDisplay', inningsData[currentMatch.innings], currentMatch.innings);
    
    // Update previous innings if it exists
    if (currentMatch.innings === 2 && inningsData[1]) {
        updateInningsDisplay('previousOversDisplay', inningsData[1], 1);
    }
}

function updateInningsDisplay(containerId, inningsData, inningsNumber) {
    const container = document.getElementById(containerId);
    
    if (!inningsData || Object.keys(inningsData).length === 0) {
        container.innerHTML = `<p class="no-data">${inningsNumber === 1 ? 'First' : 'Second'} innings data will appear here.</p>`;
        return;
    }
    
    let html = '';
    
    // Display each over
    Object.keys(inningsData).sort((a, b) => parseInt(a) - parseInt(b)).forEach(overNum => {
        const balls = inningsData[overNum];
        html += `<div class="over-section">
            <h4>Over ${overNum}</h4>
            <div class="balls-row">`;
                
        balls.forEach(ball => {
            let ballClass = 'ball';
            let ballText = ball.runs.toString();
            
            if (ball.type === 'wicket') {
                ballClass += ' ball-wicket';
                ballText = 'W';
            } else if (ball.isExtra) {
                ballClass += ' ball-extra';
                ballText = ball.runs + (ball.extraType === 'wide' ? 'Wd' : 
                         ball.extraType === 'noball' ? 'Nb' : 
                         ball.extraType === 'bye' ? 'B' : 'Lb');
            } else if (ball.runs === 4) {
                ballClass += ' ball-four';
                ballText = '4';
            } else if (ball.runs === 6) {
                ballClass += ' ball-six';
                ballText = '6';
            } else if (ball.runs === 0) {
                ballClass += ' ball-dot';
                ballText = '•';
            }
            
            html += `<span class="${ballClass}" title="${ball.description || ''}">${ballText}</span>`;
        });
        
        // Calculate over summary
        const overRuns = balls.reduce((total, ball) => total + ball.runs, 0);
        const overExtras = balls.filter(ball => ball.isExtra).length;
        const overWickets = balls.filter(ball => ball.type === 'wicket').length;
        
        html += `</div>
            <div class="over-summary">
                Runs: ${overRuns} | Extras: ${overExtras} | Wickets: ${overWickets}
            </div>
        </div>`;
    });
    
    container.innerHTML = html;
}

function showScorecardTab(tabType) {
    // Handle scorecard tab switching
    const scorecardTabs = document.querySelectorAll('.scorecard-tab');
    const scorecardContents = document.querySelectorAll('.scorecard-content');
    
    scorecardTabs.forEach(tab => tab.classList.remove('active'));
    scorecardContents.forEach(content => content.classList.remove('active'));
    
    if (tabType === 'current') {
        document.querySelector('[onclick="showScorecardTab(\'current\')"]').classList.add('active');
        document.getElementById('currentInningsCard').classList.add('active');
    } else if (tabType === 'previous') {
        document.querySelector('[onclick="showScorecardTab(\'previous\')"]').classList.add('active');
        document.getElementById('previousInningsCard').classList.add('active');
    }
    
    updateBallByBallDisplay();
}

function toggleScorecard() {
    const scorecardDiv = document.getElementById('ballByBallCard');
    if (scorecardDiv.style.display === 'none') {
        scorecardDiv.style.display = 'block';
        updateBallByBallDisplay();
    } else {
        scorecardDiv.style.display = 'none';
    }
}