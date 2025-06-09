
import { Component, DestroyRef, inject, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { GameSettings } from "../../interfaces/game.interface";
import { GameService } from "../../services/game";

@Component({
  selector: "app-game-settings",
  templateUrl: "./game-settings.html",
  styleUrls: ["./game-settings.scss"],
  imports: [ReactiveFormsModule],
  standalone: true,
})
export class GameSettingsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly gameService = inject(GameService);
  settingsForm!: FormGroup;

  // Default settings constant for reset functionality
  private readonly defaultSettings: GameSettings = {
    fallingSpeed: 2,
    fallingFrequency: 1000,
    playerSpeed: 5,
    gameTime: 60,
  };

  ngOnInit(): void {
    this.initForm();
    this.subscribeToFormChanges();
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
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((settings: GameSettings) => {
        if (this.settingsForm.valid) {
          this.gameService.updateSettings(settings);
        }
      });
  }

  get fallingSpeed() {
    return this.settingsForm.get("fallingSpeed");
  }
  get fallingFrequency() {
    return this.settingsForm.get("fallingFrequency");
  }
  get playerSpeed() {
    return this.settingsForm.get("playerSpeed");
  }
  get gameTime() {
    return this.settingsForm.get("gameTime");
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
