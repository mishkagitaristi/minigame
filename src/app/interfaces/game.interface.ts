export interface GameSettings {
  fallingSpeed: number;
  fallingFrequency: number;
  playerSpeed: number;
  gameTime: number;
}

export interface GameObject {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player extends GameObject {
  speed: number;
}

export interface FallingObject extends GameObject {
  speed: number;
}

export interface GameState {
  isGameRunning: boolean;
  isGameStarted: boolean;
  isPaused: boolean;
  isOffline: boolean;
  pauseReason: 'manual' | 'offline' | 'tab-hidden' | null;
  player: Player;
  fallingObjects: FallingObject[];
  score: number;
  timeRemaining: number;
  settings: GameSettings;
}

export interface WebSocketMessage {
  caughtObjects: number;
  timeRemaining: number;
}

export interface GameBounds {
  width: number;
  height: number;
}

export interface ScoreEntry {
  id: string;
  score: number;
  timestamp: Date;
  gameSettings: GameSettings;
  gameTime: number;
}

export interface Scoreboard {
  scores: ScoreEntry[];
  lastUpdated: Date;
}
