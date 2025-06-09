import { Injectable } from "@angular/core";
import { BehaviorSubject, fromEvent, merge } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class OfflineService {
  // BehaviorSubject to track online/offline state
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  // Public observable for components to subscribe to online status changes
  public isOnline$ = this.isOnlineSubject.asObservable();

  constructor() {
    this.initNetworkStatusDetection();
  }

  /**
   * Initializes network status detection by listening to browser's online/offline events
   * This method sets up event listeners that will update the online status in real-time
   */
  private initNetworkStatusDetection(): void {
    // Listen to online/offline events
    const online$ = fromEvent(window, "online").pipe(map(() => true));
    const offline$ = fromEvent(window, "offline").pipe(map(() => false));

    merge(online$, offline$).subscribe((isOnline: boolean) => {
      this.isOnlineSubject.next(isOnline);
    });
  }

  /**
   * Gets the current online status
   * @returns True if the application is currently online
   */
  get isOnline(): boolean {
    return this.isOnlineSubject.value;
  }

  /**
   * Gets the current offline status
   * @returns True if the application is currently offline
   */
  get isOffline(): boolean {
    return !this.isOnlineSubject.value;
  }
}
