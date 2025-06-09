import { Injectable } from "@angular/core";
import { BehaviorSubject, fromEvent, merge } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class OfflineService {
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  public isOnline$ = this.isOnlineSubject.asObservable();

  constructor() {
    this.initNetworkStatusDetection();
  }

  private initNetworkStatusDetection(): void {
    // Listen to online/offline events
    const online$ = fromEvent(window, "online").pipe(map(() => true));
    const offline$ = fromEvent(window, "offline").pipe(map(() => false));

    merge(online$, offline$).subscribe((isOnline: boolean) => {
      this.isOnlineSubject.next(isOnline);
    });
  }

  get isOnline(): boolean {
    return this.isOnlineSubject.value;
  }

  get isOffline(): boolean {
    return !this.isOnlineSubject.value;
  }
}
