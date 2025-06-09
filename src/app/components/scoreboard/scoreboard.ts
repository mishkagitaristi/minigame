import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ScoreboardService } from "../../services/scoreboard";
import { ScoreEntry, Scoreboard } from "../../types/game.types";

@Component({
  selector: "app-scoreboard",
  templateUrl: "./scoreboard.html",
  styleUrls: ["./scoreboard.scss"],
  standalone: true,
})
export class ScoreboardComponent implements OnInit, OnDestroy {
  scoreboard: Scoreboard | null = null;
  private destroy$ = new Subject<void>();

  constructor(private scoreboardService: ScoreboardService) {}

  ngOnInit(): void {
    this.scoreboardService.scoreboard$
      .pipe(takeUntil(this.destroy$))
      .subscribe((scoreboard) => {
        this.scoreboard = scoreboard;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onResetScoreboard(): void {
    if (
      confirm(
        "Are you sure you want to reset the scoreboard? This action cannot be undone."
      )
    ) {
      this.scoreboardService.resetScoreboard();
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  formatGameTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  getScoreRank(index: number): string {
    const rank = index + 1;
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  }

  trackByScoreId(index: number, score: ScoreEntry): string {
    return score.id;
  }

  getBestScore(): number {
    return this.scoreboardService.getBestScore();
  }

  getTotalGamesPlayed(): number {
    return this.scoreboardService.getTotalGamesPlayed();
  }

  hasScores(): boolean {
    return this.scoreboard ? this.scoreboard.scores.length > 0 : false;
  }
}
