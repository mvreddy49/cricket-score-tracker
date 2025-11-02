// Google Sheets Integration for Cricket Score Tracker
// Pre-configured with your Google Sheets credentials

const GOOGLE_CONFIG = {
    API_KEY: 'AIzaSyB8vrR-gsOj6uAt8pp9qUwpfZ0l9z3ExVI',
    SHEET_ID: '1r9oZyiQmYox0RywYVoB0NHSkJntZ0sJvvRC5Yj8ElDw',
    SHEET_NAME: 'Sheet1',
    DISCOVERY_DOC: 'https://sheets.googleapis.com/$discovery/rest?version=v4'
};

let gapi;
let isGoogleSheetsReady = false;

// Initialize Google Sheets API
async function initGoogleSheets() {
    try {
        if (typeof window.gapi === 'undefined') {
            console.log('Google API not loaded yet, waiting...');
            setTimeout(initGoogleSheets, 1000);
            return;
        }

        await window.gapi.load('client', initializeGapiClient);
        console.log('Google Sheets integration initialized');
    } catch (error) {
        console.error('Error initializing Google Sheets:', error);
        // Fallback to localStorage
        console.log('Falling back to localStorage');
    }
}

async function initializeGapiClient() {
    try {
        await window.gapi.client.init({
            apiKey: GOOGLE_CONFIG.API_KEY,
            discoveryDocs: [GOOGLE_CONFIG.DISCOVERY_DOC],
        });
        isGoogleSheetsReady = true;
        console.log('Google Sheets API client initialized');
        
        // Test connection
        await testGoogleSheetsConnection();
    } catch (error) {
        console.error('Error initializing Google API client:', error);
        isGoogleSheetsReady = false;
    }
}

// Test Google Sheets connection
async function testGoogleSheetsConnection() {
    try {
        const response = await window.gapi.client.sheets.spreadsheets.get({
            spreadsheetId: GOOGLE_CONFIG.SHEET_ID,
        });
        console.log('Google Sheets connection successful:', response.result.properties.title);
        
        // Initialize sheet structure if needed
        await initializeSheetStructure();
    } catch (error) {
        console.error('Google Sheets connection test failed:', error);
        isGoogleSheetsReady = false;
    }
}

// Initialize sheet with proper headers
async function initializeSheetStructure() {
    try {
        // Check if headers exist
        const response = await window.gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_CONFIG.SHEET_ID,
            range: `${GOOGLE_CONFIG.SHEET_NAME}!A1:Z1`,
        });

        if (!response.result.values || response.result.values.length === 0) {
            // Create comprehensive headers for cricket tracking
            const headers = [
                'Timestamp',        // A - When record was created
                'Type',            // B - MATCH or PLAYER
                'MatchId',         // C - Unique match identifier
                'Date',            // D - Match date
                'Team1Name',       // E - First team name
                'Team1Players',    // F - Team1 players (JSON)
                'Team1Score',      // G - Team1 final score
                'Team2Name',       // H - Second team name  
                'Team2Players',    // I - Team2 players (JSON)
                'Team2Score',      // J - Team2 final score
                'Overs',           // K - Match overs
                'Winner',          // L - Winning team
                'Status',          // M - Match status
                'BallByBall',      // N - Complete ball-by-ball data (JSON)
                'PlayerName',      // O - For player stats
                'TotalMatches',    // P - Player matches played
                'TotalRuns',       // Q - Player total runs
                'TotalWickets',    // R - Player total wickets
                'TotalCatches',    // S - Player total catches
                'Innings',         // T - Which innings (1 or 2)
                'OverNumber',      // U - Over number
                'BallNumber',      // V - Ball number in over
                'RunsScored',      // W - Runs on this ball
                'BallType',        // X - Type of ball (runs/wicket/extra)
                'ExtraType'        // Y - Type of extra (wide/noball/bye/legbye)
            ];

            await window.gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: GOOGLE_CONFIG.SHEET_ID,
                range: `${GOOGLE_CONFIG.SHEET_NAME}!A1:Y1`,
                valueInputOption: 'RAW',
                resource: {
                    values: [headers]
                }
            });

            // Format the header row
            await window.gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: GOOGLE_CONFIG.SHEET_ID,
                resource: {
                    requests: [
                        {
                            repeatCell: {
                                range: {
                                    sheetId: 0,
                                    startRowIndex: 0,
                                    endRowIndex: 1,
                                    startColumnIndex: 0,
                                    endColumnIndex: 25
                                },
                                cell: {
                                    userEnteredFormat: {
                                        backgroundColor: { red: 0.2, green: 0.6, blue: 0.9 },
                                        textFormat: { 
                                            foregroundColor: { red: 1, green: 1, blue: 1 },
                                            bold: true
                                        }
                                    }
                                },
                                fields: 'userEnteredFormat(backgroundColor,textFormat)'
                            }
                        }
                    ]
                }
            });

            console.log('✅ Sheet headers created and formatted successfully!');
            
            // Add a sample data row to show format
            const sampleRow = [
                new Date().toISOString(),
                'INFO',
                'setup',
                new Date().toISOString().split('T')[0],
                'Cricket Tracker Setup',
                'Ready for your gully cricket matches!',
                'Ball-by-ball tracking enabled',
                'Google Sheets sync active',
                'Start creating matches!',
                '🏏 Happy Cricket! 🏏',
                '8',
                'Your Team',
                'ready',
                'Every ball will be recorded here',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                ''
            ];

            await window.gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: GOOGLE_CONFIG.SHEET_ID,
                range: `${GOOGLE_CONFIG.SHEET_NAME}!A:Y`,
                valueInputOption: 'RAW',
                resource: {
                    values: [sampleRow]
                }
            });

            console.log('✅ Sample row added to demonstrate format');
        } else {
            console.log('✅ Sheet headers already exist');
        }
    } catch (error) {
        console.error('❌ Error initializing sheet structure:', error);
        // Show user-friendly message
        if (window.alert) {
            alert('Unable to connect to Google Sheets. Please check your API key and sheet permissions.');
        }
    }
}

// Save match to Google Sheets
async function saveMatchToGoogleSheets(match) {
    if (!isGoogleSheetsReady) {
        console.log('Google Sheets not ready, saving to localStorage only');
        return false;
    }

    try {
        const row = [
            new Date().toISOString(),                              // A - Timestamp
            'MATCH',                                               // B - Type
            match.id,                                              // C - MatchId
            match.date,                                            // D - Date
            match.teams.team1.name,                                // E - Team1Name
            JSON.stringify(match.teams.team1.players),             // F - Team1Players
            `${match.teams.team1.score.runs}/${match.teams.team1.score.wickets} (${match.teams.team1.score.overs}.${match.teams.team1.score.balls})`, // G - Team1Score
            match.teams.team2.name,                                // H - Team2Name
            JSON.stringify(match.teams.team2.players),             // I - Team2Players
            `${match.teams.team2.score.runs}/${match.teams.team2.score.wickets} (${match.teams.team2.score.overs}.${match.teams.team2.score.balls})`, // J - Team2Score
            match.overs,                                           // K - Overs
            match.winner || 'In Progress',                         // L - Winner
            match.status,                                          // M - Status
            JSON.stringify(match.ballByBall || []),                // N - BallByBall
            '', '', '', '', '', '', '', '', '', '', ''             // O-Y - Empty fields for match rows
        ];

        await window.gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_CONFIG.SHEET_ID,
            range: `${GOOGLE_CONFIG.SHEET_NAME}!A:Y`,
            valueInputOption: 'RAW',
            resource: {
                values: [row]
            }
        });

        // Also save individual ball data for detailed analysis
        if (match.ballByBall && match.ballByBall.length > 0) {
            await saveBallByBallData(match);
        }

        console.log('✅ Match saved to Google Sheets successfully');
        return true;
    } catch (error) {
        console.error('❌ Error saving match to Google Sheets:', error);
        return false;
    }
}

// Save detailed ball-by-ball data
async function saveBallByBallData(match) {
    try {
        const ballRows = [];
        
        match.ballByBall.forEach(ball => {
            const ballRow = [
                new Date().toISOString(),                          // A - Timestamp
                'BALL',                                            // B - Type
                match.id,                                          // C - MatchId
                match.date,                                        // D - Date
                ball.battingTeam,                                  // E - Team1Name (batting team)
                '',                                                // F - Team1Players
                '',                                                // G - Team1Score
                ball.bowlingTeam,                                  // H - Team2Name (bowling team)
                '',                                                // I - Team2Players
                '',                                                // J - Team2Score
                match.overs,                                       // K - Overs
                '',                                                // L - Winner
                '',                                                // M - Status
                ball.description || '',                            // N - BallByBall
                '',                                                // O - PlayerName
                '',                                                // P - TotalMatches
                '',                                                // Q - TotalRuns
                '',                                                // R - TotalWickets
                '',                                                // S - TotalCatches
                ball.innings,                                      // T - Innings
                ball.over,                                         // U - OverNumber
                ball.ball,                                         // V - BallNumber
                ball.runs,                                         // W - RunsScored
                ball.type,                                         // X - BallType
                ball.extraType || ''                               // Y - ExtraType
            ];
            ballRows.push(ballRow);
        });

        if (ballRows.length > 0) {
            await window.gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: GOOGLE_CONFIG.SHEET_ID,
                range: `${GOOGLE_CONFIG.SHEET_NAME}!A:Y`,
                valueInputOption: 'RAW',
                resource: {
                    values: ballRows
                }
            });
            console.log(`✅ ${ballRows.length} ball-by-ball records saved`);
        }
    } catch (error) {
        console.error('❌ Error saving ball-by-ball data:', error);
    }
}

// Save player stats to Google Sheets
async function savePlayerToGoogleSheets(playerName, stats) {
    if (!isGoogleSheetsReady) {
        return false;
    }

    try {
        const row = [
            new Date().toISOString(),                              // A - Timestamp
            'PLAYER',                                              // B - Type
            '',                                                    // C - MatchId
            new Date().toISOString().split('T')[0],                // D - Date
            '',                                                    // E - Team1Name
            '',                                                    // F - Team1Players
            '',                                                    // G - Team1Score
            '',                                                    // H - Team2Name
            '',                                                    // I - Team2Players
            '',                                                    // J - Team2Score
            '',                                                    // K - Overs
            '',                                                    // L - Winner
            '',                                                    // M - Status
            '',                                                    // N - BallByBall
            playerName,                                            // O - PlayerName
            stats.matches || 0,                                    // P - TotalMatches
            stats.runs || 0,                                       // Q - TotalRuns
            stats.wickets || 0,                                    // R - TotalWickets
            stats.catches || 0,                                    // S - TotalCatches
            '', '', '', '', '', ''                                 // T-Y - Empty fields
        ];

        await window.gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: GOOGLE_CONFIG.SHEET_ID,
            range: `${GOOGLE_CONFIG.SHEET_NAME}!A:Y`,
            valueInputOption: 'RAW',
            resource: {
                values: [row]
            }
        });

        console.log('✅ Player stats saved to Google Sheets');
        return true;
    } catch (error) {
        console.error('❌ Error saving player to Google Sheets:', error);
        return false;
    }
}

// Load data from Google Sheets
async function loadDataFromGoogleSheets() {
    if (!isGoogleSheetsReady) {
        return null;
    }

    try {
        const response = await window.gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: GOOGLE_CONFIG.SHEET_ID,
            range: `${GOOGLE_CONFIG.SHEET_NAME}!A2:S1000`, // Skip header row
        });

        if (!response.result.values) {
            return { matches: [], players: [] };
        }

        const matches = [];
        const players = [];

        response.result.values.forEach(row => {
            if (row[1] === 'MATCH' && row[2]) { // Match data
                try {
                    const match = {
                        id: row[2],
                        date: row[3],
                        teams: {
                            team1: {
                                name: row[4],
                                players: JSON.parse(row[5] || '[]'),
                                score: parseScore(row[6])
                            },
                            team2: {
                                name: row[7],
                                players: JSON.parse(row[8] || '[]'),
                                score: parseScore(row[9])
                            }
                        },
                        overs: parseInt(row[10]) || 6,
                        winner: row[11] === 'In Progress' ? null : row[11],
                        status: row[12] || 'completed',
                        ballByBall: JSON.parse(row[13] || '[]')
                    };
                    matches.push(match);
                } catch (e) {
                    console.warn('Error parsing match row:', row, e);
                }
            } else if (row[1] === 'PLAYER' && row[14]) { // Player data
                try {
                    const player = {
                        name: row[14],
                        matches: parseInt(row[15]) || 0,
                        runs: parseInt(row[16]) || 0,
                        wickets: parseInt(row[17]) || 0,
                        catches: parseInt(row[18]) || 0
                    };
                    players.push(player);
                } catch (e) {
                    console.warn('Error parsing player row:', row, e);
                }
            }
        });

        console.log(`Loaded ${matches.length} matches and ${players.length} players from Google Sheets`);
        return { matches, players };
    } catch (error) {
        console.error('Error loading data from Google Sheets:', error);
        return null;
    }
}

// Helper function to parse score string like "45/3 (6.2)"
function parseScore(scoreStr) {
    if (!scoreStr) return { runs: 0, wickets: 0, overs: 0, balls: 0, extras: 0 };
    
    try {
        const parts = scoreStr.split(' ');
        const [runs, wickets] = parts[0].split('/').map(x => parseInt(x) || 0);
        const oversPart = parts[1] ? parts[1].replace(/[()]/g, '') : '0.0';
        const [overs, balls] = oversPart.split('.').map(x => parseInt(x) || 0);
        
        return { runs, wickets, overs, balls, extras: 0 };
    } catch (e) {
        return { runs: 0, wickets: 0, overs: 0, balls: 0, extras: 0 };
    }
}

// Override the existing save functions to use Google Sheets
const originalSaveMatch = window.saveMatchData || function() {};
const originalSavePlayer = window.savePlayerData || function() {};

// Enhanced save functions with Google Sheets sync
window.saveMatchData = function(match) {
    // Save locally first
    originalSaveMatch(match);
    
    // Then sync to Google Sheets
    saveMatchToGoogleSheets(match);
};

window.savePlayerData = function(playerName, stats) {
    // Save locally first  
    originalSavePlayer(playerName, stats);
    
    // Then sync to Google Sheets
    savePlayerToGoogleSheets(playerName, stats);
};

// Sync data from Google Sheets on app load
window.syncFromGoogleSheets = async function() {
    const data = await loadDataFromGoogleSheets();
    if (data) {
        // Merge with local data
        const localMatches = JSON.parse(localStorage.getItem('cricket_matches') || '[]');
        const localPlayers = JSON.parse(localStorage.getItem('cricket_players') || '[]');
        
        // Update local storage with cloud data
        localStorage.setItem('cricket_matches', JSON.stringify(data.matches));
        localStorage.setItem('cricket_players', JSON.stringify(data.players));
        
        // Refresh UI
        if (window.updateDashboard) window.updateDashboard();
        if (window.updateHistory) window.updateHistory();
        if (window.updateStats) window.updateStats();
        
        console.log('Data synced from Google Sheets');
    }
};

// Auto-sync on page load
window.addEventListener('load', () => {
    setTimeout(() => {
        if (isGoogleSheetsReady) {
            window.syncFromGoogleSheets();
        }
    }, 2000);
});

console.log('Google Sheets integration loaded with your credentials');