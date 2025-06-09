# Angular Slots/Catch Game

A modern, responsive slots/catch game built with Angular 17+, featuring a character that catches falling objects. The game includes advanced features like offline detection, auto-pause functionality, scoreboard system, and beautiful UI/UX design.

## 🎮 Game Features

### Core Gameplay
- **Objective**: Control a character to catch falling green objects
- **Movement**: Use arrow keys (← →) or WASD keys to move the player
- **Scoring**: Earn points for each object caught
- **Time Limit**: Configurable game duration with real-time countdown
- **Responsive Design**: Optimized for various screen sizes

### Advanced Features
- **Offline Detection**: Game automatically pauses when internet connection is lost
- **Tab Visibility Auto-Pause**: Game pauses when switching browser tabs or minimizing window
- **Manual Pause/Resume**: Press Space or Escape to pause/resume anytime
- **Scoreboard System**: Persistent high scores with timestamps and game settings
- **Customizable Settings**: Adjust falling speed, frequency, player speed, and game duration
- **Real-time WebSocket Integration**: Live game state synchronization (optional)
- **Cross-browser Compatibility**: Works on Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### UI/UX Enhancements
- **Beautiful Gradients**: Modern gradient backgrounds and UI elements
- **Smooth Animations**: Fluid player movement and visual effects
- **Visual Overlays**: Informative pause screens with contextual messages
- **Responsive Controls**: Touch-friendly buttons and keyboard shortcuts
- **Medal System**: 🥇🥈🥉 rankings for top scoreboard entries
- **Loading States**: Smooth transitions between game states

## 🚀 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/slots-game.git
   cd slots-game
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   ng serve
   ```

4. **Open your browser** and navigate to `http://localhost:4200`

## 🎯 How to Play

1. **Start a Game**: Click the "Start Game" button from the main menu
2. **Move Your Character**: 
   - Use arrow keys (← →) to move left and right
   - Or use A/D keys for movement
3. **Catch Objects**: Position your character under falling green objects to catch them
4. **Earn Points**: Each caught object increases your score
5. **Watch the Timer**: Game ends when time runs out
6. **Pause Anytime**: Press Space or Escape to pause/resume
7. **View Scores**: Check the scoreboard to see your best performances

## 🎮 Controls Reference

| Control | Action |
|---------|--------|
| `←` / `→` | Move player left/right |
| `A` / `D` | Alternative movement keys |
| `Space` | Pause/Resume game |
| `Escape` | Pause/Resume game |

### Auto-Pause Triggers
- **Tab Switch**: Game automatically pauses when switching browser tabs
- **Window Minimize**: Game pauses when browser window is minimized  
- **Internet Loss**: Game pauses when offline, resumes when connection restored

## ⚙️ Game Settings

Customize your game experience with these configurable options:

- **Falling Speed** (1-10): How fast objects fall from the top
- **Falling Frequency** (500-3000ms): Time between new objects spawning
- **Player Speed** (1-10): How fast the player character moves
- **Game Time** (30-300 seconds): Total duration of each game

**Quick Reset**: Use the "Reset to Defaults" button to restore original settings.

## 🏆 Scoreboard System

### Features
- **Top 10 Scores**: Displays the highest scoring games
- **Detailed Tracking**: Shows score, timestamp, and game settings for each entry
- **Medal Rankings**: Gold 🥇, Silver 🥈, Bronze 🥉 for top 3 scores
- **Statistics**: View your best score and total games played
- **Data Persistence**: Scores saved in browser local storage
- **Reset Option**: Clear all scores with confirmation dialog

### Score Calculation
- Each caught object = 1 point
- Scores are only saved for completed games (score > 0)
- Game settings are recorded with each score for reference

## 🔧 Technical Architecture

### Core Services
- **GameService**: Main game engine with state management
- **OfflineService**: Network connectivity detection
- **ScoreboardService**: Score persistence and management  
- **WebsocketService**: Real-time communication (optional)

### Component Structure
- **GameComponent**: Main game interface and controls
- **GameSettingsComponent**: Configuration panel with form validation
- **ScoreboardComponent**: Score display and management

### Technologies Used
- **Frontend**: Angular 17+, TypeScript, SCSS
- **State Management**: RxJS Observables and BehaviorSubjects
- **Testing**: Jest testing framework
- **Build Tool**: Angular CLI with Webpack
- **Browser APIs**: Page Visibility API, Online/Offline Detection

## 🌐 Browser Compatibility

| Browser | Minimum Version | Features Supported |
|---------|----------------|-------------------|
| Chrome | 90+ | All features |
| Firefox | 88+ | All features |
| Safari | 14+ | All features |
| Edge | 90+ | All features |

## 🧪 Testing

Run the test suite:

```bash
npm test
```

The project uses Jest for unit testing with comprehensive coverage of:
- Game logic and state management
- Service functionality and integration
- Component behavior and user interactions
- Edge cases and error handling

## 📦 Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory, optimized for production deployment.