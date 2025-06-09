import { Component, DestroyRef, OnInit, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ScoreEntry, Scoreboard } from "../../interfaces/game.interface";
import { ScoreboardService } from "../../services/scoreboard";

@Component({
  selector: "app-scoreboard",
  templateUrl: "./scoreboard.html",
  styleUrls: ["./scoreboard.scss"],
  standalone: true,
})
export class ScoreboardComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly scoreboardService = inject(ScoreboardService);

  // Current scoreboard state
  scoreboard: Scoreboard | null = null;

  /**
   * Sets up subscription to scoreboard updates
   */
  ngOnInit(): void {
    this.scoreboardService.scoreboard$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((scoreboard) => {
        this.scoreboard = scoreboard;
      });
  }

  /**
   * Handles the reset scoreboard action
   * Shows confirmation dialog before resetting
   */
  onResetScoreboard(): void {
    if (
      confirm(
        "Are you sure you want to reset the scoreboard? This action cannot be undone."
      )
    ) {
      this.scoreboardService.resetScoreboard();
    }
  }

  /**
   * Formats a date into a readable string
   * @param date - The date to format
   * @returns Formatted date string
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  /**
   * Formats game time in seconds to MM:SS format
   * @param seconds - Time in seconds
   * @returns Formatted time string
   */
  formatGameTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  /**
   * Gets the rank emoji or number for a score entry
   * @param index - The index of the score in the list
   * @returns Rank emoji or number string
   */
  getScoreRank(index: number): string {
    const rank = index + 1;
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  }

  /**
   * TrackBy function for ngFor to optimize rendering
   * @param index - The index of the item
   * @param score - The score entry
   * @returns Unique identifier for the score
   */
  trackByScoreId(index: number, score: ScoreEntry): string {
    return score.id;
  }

  /**
   * Gets the best score from the scoreboard
   * @returns The highest score achieved
   */
  getBestScore(): number {
    return this.scoreboardService.getBestScore();
  }

  /**
   * Gets the total number of games played
   * @returns Total number of scores in the scoreboard
   */
  getTotalGamesPlayed(): number {
    return this.scoreboardService.getTotalGamesPlayed();
  }

  /**
   * Checks if there are any scores in the scoreboard
   * @returns True if there are scores to display
   */
  hasScores(): boolean {
    return this.scoreboard ? this.scoreboard.scores.length > 0 : false;
  }
}
