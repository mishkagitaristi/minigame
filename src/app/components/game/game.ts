import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { GameService } from "../../services/game";
import { FallingObject, GameState } from "../../types/game.types";

@Component({
  selector: "app-game",
  templateUrl: "./game.html",
  styleUrls: ["./game.scss"],
  standalone: true,
})
export class GameComponent implements OnInit, OnDestroy {
  gameState: GameState | null = null;
  private destroy$ = new Subject<void>();

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.gameState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.gameState = state;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener("window:keydown", ["$event"])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.gameState?.isGameRunning) return;

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
}
