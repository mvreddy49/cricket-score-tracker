# Cricket Score Tracker 🏏

Ball-by-ball cricket scoring for gully matches with Google Sheets sync!

## ✨ Features
- **Ball-by-ball tracking** with visual scorecard
- **Google Sheets integration** for cloud backup  
- **Mobile-friendly** interface
- **6-8 over matches** perfect for gully cricket
- **No-argument scoring** - every delivery recorded!

## 🚀 Quick Start
1. Open `index.html` in browser
2. Click "Load Demo Data" to see sample matches
3. Create new match and start scoring!

## 📊 Ball-by-Ball Colors
- 🔴 **W** = Wickets
- 🟢 **4** = Fours
- 🟡 **6** = Sixes  
- 🔵 **Wd/Nb/B/Lb** = Extras
- ⚫ **•** = Dot balls
- � **1,2,3** = Regular runs

## ☁️ Google Sheets Sync
Automatically syncs all match data to your Google Sheet for backup and sharing with your cricket team!

**Perfect for settling cricket arguments!** 🏏⚾

## 🆓 FREE Hosting Options (Lifetime Free)

### 1. GitHub Pages (Recommended) ⭐
**Best for: Static websites (perfect for this app)**
- **Cost**: Completely FREE forever
- **Storage**: Unlimited for public repos
- **Custom Domain**: Free SSL certificates
- **Steps**:
  1. Create GitHub account (free)
  2. Create new repository named `cricket-score-tracker`
  3. Upload your files
  4. Go to Settings > Pages
  5. Select source as "Deploy from branch"
  6. Your site will be available at: `https://yourusername.github.io/cricket-score-tracker`

### 2. Netlify
**Best for: Easy deployment with forms**
- **Cost**: FREE (100GB bandwidth/month)
- **Features**: Drag & drop deployment, form handling
- **Steps**:
  1. Visit netlify.com
  2. Sign up with GitHub/Google
  3. Drag and drop your project folder
  4. Get instant live URL

### 3. Vercel
**Best for: Modern deployment**
- **Cost**: FREE for personal projects
- **Features**: Fast CDN, easy deployments
- **Steps**:
  1. Visit vercel.com
  2. Sign up with GitHub
  3. Import your project
  4. Auto-deploy on every change

### 4. Firebase Hosting + Firestore (Advanced)
**Best for: Real-time features and cloud sync**
- **Cost**: FREE tier (1GB storage, 10GB transfer/month)
- **Features**: Real-time database, user authentication
- **Steps**:
  1. Create Firebase project
  2. Enable Firestore database
  3. Deploy using Firebase CLI

### 5. Surge.sh
**Best for: Simple command-line deployment**
- **Cost**: FREE for unlimited sites
- **Steps**:
  ```bash
  npm install -g surge
  surge
  ```

## 📁 Project Structure

```
cricket-score-tracker/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## 🎮 How to Use

### 🪄 Quick Demo (Try First!)
1. Open the website
2. Click **"Load Demo Data"** button in header
3. Explore all tabs to see 20+ matches with realistic data
4. Perfect for gully cricket: 6-8 overs, 6-11 players per team!

### Creating a Match
1. Go to "New Match" tab  
2. Choose 6 or 8 overs (default gully cricket format)
3. Use "Quick Fill" buttons to populate player names
4. Each team: 6-11 players (starts with 6, add more as needed)
5. Click "Create Match"

### Live Score Tracking
1. Go to "Live Score" tab (after creating a match)
2. Use the run buttons to add runs (0, 1, 2, 3, 4, 6)
3. Click "Wicket" when a player gets out
4. Click "Extra" for wides, no-balls, byes, leg-byes
5. Click "End Innings" to switch between teams
6. Click "Finish Match" when the game is complete

### Viewing Statistics
- **Dashboard**: Overview of all matches and current status
- **History**: Filter and search through past matches
- **Stats**: View top performers and team statistics

## 💾 Data Storage

- All data is stored locally in your browser using localStorage
- No internet required after initial load
- Data persists between browser sessions
- Export/import feature for data backup

## 🔧 Customization

### Adding More Features
The code is well-organized and easy to extend:

- **New Statistics**: Add functions in the `updateStats()` section
- **Different Match Formats**: Modify the overs selection in HTML
- **Player Profiles**: Extend the player object in `script.js`
- **Score Validation**: Add rules in the scoring functions

### Styling Changes
- Modify `styles.css` for different colors/themes
- The design uses CSS Grid and Flexbox for responsiveness
- Easy to customize for team colors or branding

## 📱 Mobile Support

The app is fully responsive and works great on:
- Mobile phones (portrait/landscape)
- Tablets
- Desktop computers
- Touch and keyboard interfaces

## 🔒 Privacy & Security

- No data is sent to external servers
- All information stays on your device
- No user registration or login required
- Open source - you can see exactly what it does

## 🚀 Advanced Deployment (Optional)

### Custom Domain (Free)
1. Use GitHub Pages or Netlify
2. Register free domain at Freenom (.tk, .ml, .ga domains)
3. Point domain to your hosting service
4. Enable HTTPS (automatic on most platforms)

### PWA (Progressive Web App)
Add these files to make it installable on mobile:

**manifest.json**:
```json
{
  "name": "Cricket Score Tracker",
  "short_name": "Cricket Tracker",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#667eea",
  "theme_color": "#2c5530",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## 🤝 Contributing

Feel free to modify and improve the code:
- Add new features
- Fix bugs
- Improve the design
- Add more statistics

## 📞 Support

This is a simple, self-contained web application. If you need help:
1. Check the browser console for any errors
2. Ensure all three files are in the same folder
3. Make sure you're opening `index.html` in a modern browser

## 🏆 Perfect for Gully Cricket!

This app is specifically designed for informal cricket matches:
- Quick match setup
- Simple scoring interface
- No complex rules or validations
- Focus on fun and friendship
- Keep track of your weekly games
- See who's the best performer in your group!

---

**Happy Cricket! 🏏**

*May the best team win, and may all your matches be memorable!*