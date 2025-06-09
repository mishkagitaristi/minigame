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
  private readonly gameService = inject(GameService);
  private readonly destroyRef = inject(DestroyRef);

  gameState: GameState | null = null;

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

  onStopGame(): void {
    this.gameService.stopGame();
  }

  onPauseGame(): void {
    this.gameService.pauseGame();
  }

  onResumeGame(): void {
    this.gameService.resumeGame(true);
  }

  togglePause(): void {
    if (this.gameState?.isPaused) {
      this.onResumeGame();
    } else {
      this.onPauseGame();
    }
  }

  restartGame(): void {
    this.gameService.startGame();
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  trackByObjectId(index: number, obj: FallingObject): string {
    return obj.id;
  }

  startGame(): void {
    this.gameService.startGame();
  }

  isFormValid(): boolean {
    return this.gameService.isFormValid();
  }
}
