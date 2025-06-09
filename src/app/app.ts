import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameSettingsComponent } from './components/game-settings/game-settings';
import { GameComponent } from './components/game/game';
import { ScoreboardComponent } from './components/scoreboard/scoreboard';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    GameSettingsComponent,
    GameComponent,
    ScoreboardComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  title = 'Spribe Slots Game';
}
