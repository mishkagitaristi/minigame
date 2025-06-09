import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { GameService } from '../../services/game';
import { GameSettings } from '../../types/game.types';

@Component({
  selector: 'app-game-settings',
  templateUrl: './game-settings.html',
  styleUrls: ['./game-settings.scss'],
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true,
})
export class GameSettingsComponent implements OnInit, OnDestroy {
  settingsForm!: FormGroup;
  private destroy$ = new Subject<void>();

  // Default settings constant for reset functionality
  private readonly defaultSettings: GameSettings = {
    fallingSpeed: 2,
    fallingFrequency: 1000,
    playerSpeed: 5,
    gameTime: 60,
  };

  constructor(private fb: FormBuilder, private gameService: GameService) {}

  ngOnInit(): void {
    this.initForm();
    this.subscribeToFormChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.settingsForm = this.fb.group({
      fallingSpeed: [
        this.defaultSettings.fallingSpeed,
        [Validators.required, Validators.min(0.1), Validators.max(10)],
      ],
      fallingFrequency: [
        this.defaultSettings.fallingFrequency,
        [Validators.required, Validators.min(100), Validators.max(5000)],
      ],
      playerSpeed: [
        this.defaultSettings.playerSpeed,
        [Validators.required, Validators.min(1), Validators.max(20)],
      ],
      gameTime: [
        this.defaultSettings.gameTime,
        [Validators.required, Validators.min(10), Validators.max(300)],
      ],
    });
  }

  private subscribeToFormChanges(): void {
    this.settingsForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((settings: GameSettings) => {
        if (this.settingsForm.valid) {
          this.gameService.updateSettings(settings);
        }
      });
  }

  get fallingSpeed() {
    return this.settingsForm.get('fallingSpeed');
  }
  get fallingFrequency() {
    return this.settingsForm.get('fallingFrequency');
  }
  get playerSpeed() {
    return this.settingsForm.get('playerSpeed');
  }
  get gameTime() {
    return this.settingsForm.get('gameTime');
  }

  isFormValid(): boolean {
    return this.settingsForm.valid;
  }

  onStartGame(): void {
    if (this.isFormValid()) {
      this.gameService.startGame();
    }
  }

  resetToDefaults(): void {
    this.settingsForm.patchValue(this.defaultSettings);
    this.settingsForm.markAsUntouched();
  }
}
