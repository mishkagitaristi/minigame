import { Injectable } from '@angular/core';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WebSocketMessage } from '../types/game.types';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private destroy$ = new Subject<void>();
  private gameStateSubject = new Subject<WebSocketMessage>();

  public gameState$ = this.gameStateSubject.asObservable();

  constructor() {}

  /**
   * Start sending game state updates every second
   */
  startUpdates(): void {
    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Updates will be triggered by the game service
      });
  }

  /**
   * Send game state update to pseudo-server
   */
  sendGameState(message: WebSocketMessage): void {
    console.log('Pseudo-WebSocket: Sending game state to server:', message);
    this.gameStateSubject.next(message);
  }

  /**
   * Stop sending updates
   */
  stopUpdates(): void {
    this.destroy$.next();
    console.log('Pseudo-WebSocket: Stopped sending updates');
  }

  /**
   * Clean up on service destruction
   */
  ngOnDestroy(): void {
    this.stopUpdates();
  }
}
