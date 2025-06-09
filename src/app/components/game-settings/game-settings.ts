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
  // Inject required services and utilities
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly gameService = inject(GameService);
  // Form group for game settings
  settingsForm!: FormGroup;

  // Default settings constant for reset functionality
  private readonly defaultSettings: GameSettings = {
    fallingSpeed: 2,
    fallingFrequency: 1000,
    playerSpeed: 5,
    gameTime: 60,
  };

  /**
   * Sets up the form and subscribes to changes
   */
  ngOnInit(): void {
    this.initForm();
    this.subscribeToFormChanges();
  }

  /**
   * Initializes the settings form with default values and validators
   */
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

  /**
   * Subscribes to form changes and updates game settings when valid
   */
  private subscribeToFormChanges(): void {
    this.settingsForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((settings: GameSettings) => {
        if (this.settingsForm.valid) {
          this.gameService.updateSettings(settings);
        }
      });
  }

  /**
   * Getter for falling speed form control
   */
  get fallingSpeed() {
    return this.settingsForm.get("fallingSpeed");
  }

  /**
   * Getter for falling frequency form control
   */
  get fallingFrequency() {
    return this.settingsForm.get("fallingFrequency");
  }

  /**
   * Getter for player speed form control
   */
  get playerSpeed() {
    return this.settingsForm.get("playerSpeed");
  }

  /**
   * Getter for game time form control
   */
  get gameTime() {
    return this.settingsForm.get("gameTime");
  }

  /**
   * Checks if the form is valid
   * @returns True if all form controls are valid
   */
  isFormValid(): boolean {
    return this.settingsForm.valid;
  }

  /**
   * Handles the start game action
   * Only starts if the form is valid
   */
  onStartGame(): void {
    if (this.isFormValid()) {
      this.gameService.startGame();
    }
  }

  /**
   * Resets the form to default settings
   */
  resetToDefaults(): void {
    this.settingsForm.patchValue(this.defaultSettings);
    this.settingsForm.markAsUntouched();
  }
}
