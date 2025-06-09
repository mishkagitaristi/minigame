import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, interval, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import {
  FallingObject,
  GameBounds,
  GameSettings,
  GameState,
  Player,
} from "../interfaces/game.interface";
import { OfflineService } from "./offline";
import { ScoreboardService } from "./scoreboard";
import { WebsocketService } from "./websocket";

@Injectable({
  providedIn: "root",
})
export class GameService {
  private websocketService = inject(WebsocketService);
  private offlineService = inject(OfflineService);
  private scoreboardService = inject(ScoreboardService);

  private gameLoopDestroy$ = new Subject<void>();
  private objectSpawnDestroy$ = new Subject<void>();
  private timerDestroy$ = new Subject<void>();

  private gameBounds: GameBounds = { width: 800, height: 600 };

  private initialGameState: GameState = {
    isGameRunning: false,
    isGameStarted: false,
    isPaused: false,
    isOffline: false,
    pauseReason: null,
    player: {
      id: "player",
      x: 375,
      y: 550,
      width: 50,
      height: 30,
      speed: 5,
    },
    fallingObjects: [],
    score: 0,
    timeRemaining: 0,
    settings: {
      fallingSpeed: 2,
      fallingFrequency: 1000,
      playerSpeed: 5,
      gameTime: 60,
    },
  };

  private gameStateSubject = new BehaviorSubject<GameState>(
    this.initialGameState
  );
  public gameState$ = this.gameStateSubject.asObservable();

  constructor() {
    this.initOfflineDetection();
    this.initTabVisibilityDetection();
  }

  /**
   * Update game settings and restart if necessary
   */
  updateSettings(settings: GameSettings): void {
    const currentState = this.gameStateSubject.value;
    const newState = {
      ...currentState,
      settings,
      player: {
        ...currentState.player,
        speed: settings.playerSpeed,
      },
    };

    this.gameStateSubject.next(newState);

    // Restart game if time setting changed and game was running
    if (
      currentState.isGameRunning &&
      settings.gameTime !== currentState.settings.gameTime
    ) {
      this.stopGame();
      this.startGame();
    }
  }

  /**
   * Start the game
   */
  startGame(): void {
    const currentState = this.gameStateSubject.value;

    if (!this.isFormValid()) {
      console.error("Cannot start game: Form is not valid");
      return;
    }

    const newState: GameState = {
      ...currentState,
      isGameRunning: true,
      isGameStarted: true,
      timeRemaining: currentState.settings.gameTime,
      score: 0,
      fallingObjects: [],
      player: {
        ...currentState.player,
        x: 375, // Reset player position
      },
    };

    this.gameStateSubject.next(newState);
    this.startGameLoop();
    this.startObjectSpawning();
    this.startTimer();
    this.websocketService.startUpdates();

    console.log("Game started with settings:", currentState.settings);
  }

  /**
   * Stop the game
   */
  stopGame(): void {
    this.gameLoopDestroy$.next();
    this.objectSpawnDestroy$.next();
    this.timerDestroy$.next();
    this.websocketService.stopUpdates();

    const currentState = this.gameStateSubject.value;

    // Save score to scoreboard if game was actually started and score > 0
    if (currentState.isGameStarted && currentState.score > 0) {
      const gameTime =
        currentState.settings.gameTime - currentState.timeRemaining;
      this.scoreboardService.addScore(
        currentState.score,
        currentState.settings,
        gameTime
      );
    }

    this.gameStateSubject.next({
      ...currentState,
      isGameRunning: false,
    });

    console.log("Game stopped. Final score:", currentState.score);
  }

  /**
   * Move player left or right
   */
  movePlayer(direction: "left" | "right"): void {
    const currentState = this.gameStateSubject.value;

    if (!currentState.isGameRunning) return;

    const newX =
      direction === "left"
        ? Math.max(0, currentState.player.x - currentState.player.speed)
        : Math.min(
            this.gameBounds.width - currentState.player.width,
            currentState.player.x + currentState.player.speed
          );

    this.gameStateSubject.next({
      ...currentState,
      player: {
        ...currentState.player,
        x: newX,
      },
    });
  }

  /**
   * Check if form is valid (all fields filled)
   */
  public isFormValid(): boolean {
    const settings = this.gameStateSubject.value.settings;
    return (
      settings.fallingSpeed > 0 &&
      settings.fallingFrequency > 0 &&
      settings.playerSpeed > 0 &&
      settings.gameTime > 0
    );
  }

  /**
   * Start the main game loop
   */
  private startGameLoop(): void {
    interval(16) // ~60 FPS
      .pipe(takeUntil(this.gameLoopDestroy$))
      .subscribe(() => {
        this.updateGame();
      });
  }

  /**
   * Start object spawning timer
   */
  private startObjectSpawning(): void {
    const settings = this.gameStateSubject.value.settings;

    interval(settings.fallingFrequency)
      .pipe(takeUntil(this.objectSpawnDestroy$))
      .subscribe(() => {
        this.spawnFallingObject();
      });
  }

  /**
   * Start game timer
   */
  private startTimer(): void {
    interval(1000)
      .pipe(takeUntil(this.timerDestroy$))
      .subscribe(() => {
        const currentState = this.gameStateSubject.value;
        const newTimeRemaining = currentState.timeRemaining - 1;

        if (newTimeRemaining <= 0) {
          this.stopGame();
          return;
        }

        this.gameStateSubject.next({
          ...currentState,
          timeRemaining: newTimeRemaining,
        });

        // Send WebSocket update
        this.websocketService.sendGameState({
          caughtObjects: currentState.score,
          timeRemaining: newTimeRemaining,
        });
      });
  }

  /**
   * Update game state (move objects, check collisions)
   */
  private updateGame(): void {
    const currentState = this.gameStateSubject.value;

    if (!currentState.isGameRunning) return;

    // Move falling objects
    const updatedObjects = currentState.fallingObjects
      .map((obj) => ({
        ...obj,
        y: obj.y + obj.speed,
      }))
      .filter((obj) => obj.y < this.gameBounds.height); // Remove objects that fell off screen

    // Check collisions
    const { caughtObjects, remainingObjects } = this.checkCollisions(
      updatedObjects,
      currentState.player
    );

    const newScore = currentState.score + caughtObjects.length;

    this.gameStateSubject.next({
      ...currentState,
      fallingObjects: remainingObjects,
      score: newScore,
    });

    // Send WebSocket update for caught objects
    if (caughtObjects.length > 0) {
      this.websocketService.sendGameState({
        caughtObjects: newScore,
        timeRemaining: currentState.timeRemaining,
      });
    }
  }

  /**
   * Spawn a new falling object
   */
  private spawnFallingObject(): void {
    const currentState = this.gameStateSubject.value;

    if (!currentState.isGameRunning) return;

    const newObject: FallingObject = {
      id: `object-${Date.now()}-${Math.random()}`,
      x: Math.random() * (this.gameBounds.width - 30),
      y: 0,
      width: 30,
      height: 30,
      speed: currentState.settings.fallingSpeed,
    };

    this.gameStateSubject.next({
      ...currentState,
      fallingObjects: [...currentState.fallingObjects, newObject],
    });
  }

  /**
   * Check collisions between player and falling objects
   */
  private checkCollisions(
    objects: FallingObject[],
    player: Player
  ): { caughtObjects: FallingObject[]; remainingObjects: FallingObject[] } {
    const caughtObjects: FallingObject[] = [];
    const remainingObjects: FallingObject[] = [];

    objects.forEach((obj) => {
      if (this.isColliding(obj, player)) {
        caughtObjects.push(obj);
      } else {
        remainingObjects.push(obj);
      }
    });

    return { caughtObjects, remainingObjects };
  }

  /**
   * Check if two objects are colliding
   */
  private isColliding(
    obj1: { x: number; y: number; width: number; height: number },
    obj2: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  }

  /**
   * Get game bounds
   */
  getGameBounds(): GameBounds {
    return this.gameBounds;
  }

  /**
   * Initialize offline detection and auto-pause functionality
   */
  private initOfflineDetection(): void {
    this.offlineService.isOnline$.subscribe((isOnline: boolean) => {
      const currentState = this.gameStateSubject.value;

      this.gameStateSubject.next({
        ...currentState,
        isOffline: !isOnline,
      });

      // Auto-pause when offline, auto-resume when back online
      if (!isOnline && currentState.isGameRunning && !currentState.isPaused) {
        this.pauseGame("offline");
      } else if (
        isOnline &&
        currentState.isGameRunning &&
        currentState.isPaused &&
        currentState.pauseReason === "offline"
      ) {
        this.resumeGame();
      }
    });
  }

  /**
   * Initialize tab visibility detection for auto-pause functionality
   */
  private initTabVisibilityDetection(): void {
    // Helper to get current state
    const getState = () => this.gameStateSubject.value;

    // Pause if hidden or blurred
    const tryPause = () => {
      const state = getState();
      if (state.isGameRunning && !state.isPaused && !state.isOffline) {
        this.pauseGame("tab-hidden");
        console.log("Game auto-paused: Tab hidden/blurred");
      }
    };

    // Resume if visible or focused and was paused due to tab
    const tryResume = () => {
      const state = getState();
      if (
        state.isGameRunning &&
        state.isPaused &&
        state.pauseReason === "tab-hidden" &&
        !state.isOffline
      ) {
        this.resumeGame();
        console.log("Game auto-resumed: Tab visible/focused");
      }
    };

    // Page Visibility API
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        tryPause();
      } else {
        // Add a small delay to ensure the tab is fully visible
        setTimeout(tryResume, 100);
      }
    });

    // Window blur/focus
    window.addEventListener("blur", tryPause);
    window.addEventListener("focus", () => {
      // Add a small delay to ensure the window is fully focused
      setTimeout(tryResume, 100);
    });

    // Handle page unload
    window.addEventListener("beforeunload", () => {
      const state = getState();
      if (state.isGameRunning && !state.isPaused) {
        this.pauseGame("tab-hidden");
      }
    });
  }

  /**
   * Pause the game
   */
  pauseGame(reason: "manual" | "offline" | "tab-hidden" = "manual"): void {
    const currentState = this.gameStateSubject.value;
    if (!currentState.isGameRunning || currentState.isPaused) return;

    // Stop game loops but don't reset the game
    this.gameLoopDestroy$.next();
    this.objectSpawnDestroy$.next();
    this.timerDestroy$.next();

    this.gameStateSubject.next({
      ...currentState,
      isPaused: true,
      pauseReason: reason,
    });

    console.log(`Game paused: ${reason}`);
  }

  /**
   * Resume the game
   */
  resumeGame(forceResume: boolean = false): void {
    const currentState = this.gameStateSubject.value;
    if (!currentState.isGameRunning || !currentState.isPaused) return;

    // Only auto-resume if the pause was due to tab visibility or if forced
    if (!forceResume && currentState.pauseReason === "manual") return;

    // Don't resume if offline
    if (currentState.isOffline) return;

    // Restart game loops
    this.startGameLoop();
    this.startObjectSpawning();
    this.startTimer();

    this.gameStateSubject.next({
      ...currentState,
      isPaused: false,
      pauseReason: null,
    });

    console.log("Game resumed");
  }
}
