import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GameSettings, ScoreEntry, Scoreboard } from '../types/game.types';

@Injectable({
  providedIn: 'root',
})
export class ScoreboardService {
  private readonly STORAGE_KEY = 'slots-game-scoreboard';
  private readonly MAX_SCORES = 10; // Keep top 10 scores

  private scoreboardSubject = new BehaviorSubject<Scoreboard>(
    this.loadScoreboard()
  );
  public scoreboard$ = this.scoreboardSubject.asObservable();

  constructor() {}

  /**
   * Add a new score entry to the scoreboard
   */
  addScore(score: number, gameSettings: GameSettings, gameTime: number): void {
    const newEntry: ScoreEntry = {
      id: `score-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      score,
      timestamp: new Date(),
      gameSettings: { ...gameSettings },
      gameTime,
    };

    const currentScoreboard = this.scoreboardSubject.value;
    const updatedScores = [...currentScoreboard.scores, newEntry]
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, this.MAX_SCORES); // Keep only top scores

    const updatedScoreboard: Scoreboard = {
      scores: updatedScores,
      lastUpdated: new Date(),
    };

    this.scoreboardSubject.next(updatedScoreboard);
    this.saveScoreboard(updatedScoreboard);

    console.log('New score added:', newEntry);
  }

  /**
   * Reset the scoreboard (clear all scores)
   */
  resetScoreboard(): void {
    const emptyScoreboard: Scoreboard = {
      scores: [],
      lastUpdated: new Date(),
    };

    this.scoreboardSubject.next(emptyScoreboard);
    this.saveScoreboard(emptyScoreboard);
    console.log('Scoreboard reset');
  }

  /**
   * Get the current scoreboard
   */
  getScoreboard(): Scoreboard {
    return this.scoreboardSubject.value;
  }

  /**
   * Get top N scores
   */
  getTopScores(count: number = 5): ScoreEntry[] {
    return this.scoreboardSubject.value.scores.slice(0, count);
  }

  /**
   * Check if a score qualifies for the top scores
   */
  isHighScore(score: number): boolean {
    const scores = this.scoreboardSubject.value.scores;
    return (
      scores.length < this.MAX_SCORES ||
      score > scores[scores.length - 1]?.score
    );
  }

  /**
   * Get player's best score
   */
  getBestScore(): number {
    const scores = this.scoreboardSubject.value.scores;
    return scores.length > 0 ? scores[0].score : 0;
  }

  /**
   * Get total games played
   */
  getTotalGamesPlayed(): number {
    return this.scoreboardSubject.value.scores.length;
  }

  /**
   * Load scoreboard from localStorage
   */
  private loadScoreboard(): Scoreboard {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const scores = parsed.scores.map((score: ScoreEntry) => ({
          ...score,
          timestamp: new Date(score.timestamp),
        }));
        return {
          scores,
          lastUpdated: new Date(parsed.lastUpdated),
        };
      }
    } catch (error) {
      console.error('Error loading scoreboard:', error);
    }

    // Return empty scoreboard if none exists or error occurred
    return {
      scores: [],
      lastUpdated: new Date(),
    };
  }

  /**
   * Save scoreboard to localStorage
   */
  private saveScoreboard(scoreboard: Scoreboard): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scoreboard));
    } catch (error) {
      console.error('Error saving scoreboard:', error);
    }
  }
}
