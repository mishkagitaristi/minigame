import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { fromEvent } from "rxjs";
import { filter } from "rxjs/operators";
import { FallingObject, GameState } from "../../interfaces/game.interface";
import { GameService } from "../../services/game";

@Component({
  selector: "app-game",
  templateUrl: "./game.html",
  styleUrls: ["./game.scss"],
  standalone: true,
})
export class GameComponent implements OnInit {
  // Inject required services
  private readonly gameService = inject(GameService);
  private readonly destroyRef = inject(DestroyRef);

  // Current game state
  gameState: GameState | null = null;

  /**
   * Sets up game state subscription and keyboard event handling
   */
  ngOnInit(): void {
    this.gameService.gameState$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        this.gameState = state;
      });

    // Setup keyboard event handling using RxJS
    fromEvent<KeyboardEvent>(window, "keydown")
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(() => this.gameState?.isGameRunning ?? false)
      )
      .subscribe((event) => {
        switch (event.key) {
          case "ArrowLeft":
          case "a":
          case "A":
            event.preventDefault();
            this.gameService.movePlayer("left");
            break;
          case "ArrowRight":
          case "d":
          case "D":
            event.preventDefault();
            this.gameService.movePlayer("right");
            break;
          case " ":
          case "Escape":
            event.preventDefault();
            this.togglePause();
            break;
        }
      });
  }

  /**
   * Handles the stop game action
   */
  onStopGame(): void {
    this.gameService.stopGame();
  }

  /**
   * Handles the pause game action
   */
  onPauseGame(): void {
    this.gameService.pauseGame();
  }

  /**
   * Handles the resume game action
   * Forces resume regardless of pause reason
   */
  onResumeGame(): void {
    this.gameService.resumeGame(true);
  }

  /**
   * Toggles the game pause state
   */
  togglePause(): void {
    if (this.gameState?.isPaused) {
      this.onResumeGame();
    } else {
      this.onPauseGame();
    }
  }

  /**
   * Restarts the game
   */
  restartGame(): void {
    this.gameService.startGame();
  }

  /**
   * Formats time in seconds to MM:SS format
   * @param seconds - Time in seconds
   * @returns Formatted time string
   */
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  /**
   * TrackBy function for ngFor to optimize rendering of falling objects
   * @param index - The index of the object
   * @param obj - The falling object
   * @returns Unique identifier for the object
   */
  trackByObjectId(index: number, obj: FallingObject): string {
    return obj.id;
  }

  /**
   * Starts the game
   */
  startGame(): void {
    this.gameService.startGame();
  }

  /**
   * Checks if the game settings form is valid
   * @returns True if the form is valid
   */
  isFormValid(): boolean {
    return this.gameService.isFormValid();
  }
}
