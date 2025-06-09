import { DestroyRef, inject, Injectable } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { interval, Subject } from "rxjs";
import { WebSocketMessage } from "../interfaces/game.interface";

@Injectable({
  providedIn: "root",
})
export class WebsocketService {
  private readonly destroyRef = inject(DestroyRef);
  // Subject to handle game state updates
  private gameStateSubject = new Subject<WebSocketMessage>();

  // Observable that components can subscribe to for game state updates
  public gameState$ = this.gameStateSubject.asObservable();

  /**
   * Starts sending game state updates every second
   * This method is called when the game starts to begin the update cycle
   * The interval will continue until stopUpdates() is called
   */
  startUpdates(): void {
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        // Updates will be triggered by the game service
      });
  }

  /**
   * Sends a game state update to the pseudo-server
   * This method is called by the game service whenever there's a state change
   * @param message - The current game state to be sent
   */
  sendGameState(message: WebSocketMessage): void {
    console.log("Pseudo-WebSocket: Sending game state to server:", message);
    this.gameStateSubject.next(message);
  }

  /**
   * Stops sending updates by completing the destroy$ subject
   * This method is called when the game ends or when cleanup is needed
   */
  stopUpdates(): void {
    this.gameStateSubject.complete();
    console.log("Pseudo-WebSocket: Stopped sending updates");
  }

  /**
   * Lifecycle hook that ensures proper cleanup when the service is destroyed
   * This prevents memory leaks by stopping all ongoing subscriptions
   */
  ngOnDestroy(): void {
    this.stopUpdates();
  }
}
