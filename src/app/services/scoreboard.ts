import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import {
  GameSettings,
  ScoreEntry,
  Scoreboard,
} from "../interfaces/game.interface";

@Injectable({
  providedIn: "root",
})
export class ScoreboardService {
  // Key used for storing scoreboard data in localStorage
  private readonly STORAGE_KEY = "slots-game-scoreboard";
  // Maximum number of scores to keep in the scoreboard
  private readonly MAX_SCORES = 10;

  // BehaviorSubject to handle scoreboard state with initial value from localStorage
  private scoreboardSubject = new BehaviorSubject<Scoreboard>(
    this.loadScoreboard()
  );
  // Public observable for components to subscribe to scoreboard updates
  public scoreboard$ = this.scoreboardSubject.asObservable();

  /**
   * Adds a new score entry to the scoreboard
   * This method is called when a game ends to record the player's score
   * @param score - The final score achieved
   * @param gameSettings - The settings used during the game
   * @param gameTime - The time taken to complete the game
   */
  addScore(score: number, gameSettings: GameSettings, gameTime: number): void {
    const newEntry: ScoreEntry = {
      id: `score-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
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

    console.log("New score added:", newEntry);
  }

  /**
   * Resets the scoreboard by clearing all scores
   * This method is called when the user wants to start fresh
   */
  resetScoreboard(): void {
    const emptyScoreboard: Scoreboard = {
      scores: [],
      lastUpdated: new Date(),
    };

    this.scoreboardSubject.next(emptyScoreboard);
    this.saveScoreboard(emptyScoreboard);
    console.log("Scoreboard reset");
  }

  /**
   * Gets the current scoreboard state
   * @returns The current scoreboard object
   */
  getScoreboard(): Scoreboard {
    return this.scoreboardSubject.value;
  }

  /**
   * Gets the top N scores from the scoreboard
   * @param count - Number of top scores to retrieve (default: 5)
   * @returns Array of top score entries
   */
  getTopScores(count: number = 5): ScoreEntry[] {
    return this.scoreboardSubject.value.scores.slice(0, count);
  }

  /**
   * Checks if a score qualifies for the top scores list
   * @param score - The score to check
   * @returns True if the score qualifies for the top scores
   */
  isHighScore(score: number): boolean {
    const scores = this.scoreboardSubject.value.scores;
    return (
      scores.length < this.MAX_SCORES ||
      score > scores[scores.length - 1]?.score
    );
  }

  /**
   * Gets the best score achieved so far
   * @returns The highest score in the scoreboard
   */
  getBestScore(): number {
    const scores = this.scoreboardSubject.value.scores;
    return scores.length > 0 ? scores[0].score : 0;
  }

  /**
   * Gets the total number of games played
   * @returns The number of scores in the scoreboard
   */
  getTotalGamesPlayed(): number {
    return this.scoreboardSubject.value.scores.length;
  }

  /**
   * Loads the scoreboard from localStorage
   * This method is called during service initialization
   * @returns The loaded scoreboard or an empty one if none exists
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
      console.error("Error loading scoreboard:", error);
    }

    return {
      scores: [],
      lastUpdated: new Date(),
    };
  }

  /**
   * Saves the current scoreboard to localStorage
   * This method is called whenever the scoreboard is updated
   * @param scoreboard - The scoreboard to save
   */
  private saveScoreboard(scoreboard: Scoreboard): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scoreboard));
    } catch (error) {
      console.error("Error saving scoreboard:", error);
    }
  }
}
