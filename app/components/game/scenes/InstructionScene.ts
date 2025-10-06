/**
 * This file defines the InstructionScene class for a Phaser-based game.
 * It provides an instruction screen that guides players on how to play the game.
 * The scene includes sections on movement, interaction, and minimap usage, along with navigation buttons and keyboard shortcuts.
 */
import * as Phaser from 'phaser';

export class InstructionScene extends Phaser.Scene {
  private backButton!: Phaser.GameObjects.Text;
  private startButton!: Phaser.GameObjects.Text;
  private isTouchDevice = false;

  constructor() {
    super({ key: 'InstructionScene' });
  }

  init() {
    // Detect if touch device
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  create() {
    // Create instructions scene
    this.cameras.main.setBackgroundColor('#34495e');

    const { width, height } = this.cameras.main;

    const titleText = this.add.text(width / 2, height * 0.1, 'HOW TO PLAY', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    });
    titleText.setOrigin(0.5);

    this.createMovementSection(width, height);
    this.createInteractionSection(width, height);
    this.createMinimapSection(width, height);

    this.createNavigationButtons(width, height);

    this.setupKeyboardControls();
  }

  private createMovementSection(width: number, height: number): void {
    // Movement section
    const movementTitle = this.add.text(width * 0.1, height * 0.25, 'MOVEMENT', {
      fontSize: '24px',
      color: '#e74c3c',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    });

    let movementText: string;
    if (this.isTouchDevice) {
      movementText = '• Use the virtual joystick in the bottom-left corner\n• Drag the joystick to move your character\n• Release to stop moving';
    } else {
      movementText = '• Use WASD keys or Arrow keys to move\n• W / ↑ : Move up\n• S / ↓ : Move down\n• A / ← : Move left\n• D / → : Move right';
    }

    const movementInstructions = this.add.text(width * 0.1, height * 0.3, movementText, {
      fontSize: '18px',
      color: '#bdc3c7',
      fontFamily: 'Arial, sans-serif',
      lineSpacing: 5
    });
  }

  private createInteractionSection(width: number, height: number): void {
    // Interaction section
    const interactionTitle = this.add.text(width * 0.1, height * 0.5, 'INTERACTION', {
      fontSize: '24px',
      color: '#f39c12',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    });

    const interactionText = 'Walk up to NPCs (Non-Player Characters) to interact\n NPCs may have quests, information, or items for you\n Your character will automatically face the direction you move';

    const interactionInstructions = this.add.text(width * 0.1, height * 0.55, interactionText, {
      fontSize: '18px',
      color: '#bdc3c7',
      fontFamily: 'Arial, sans-serif',
      lineSpacing: 5
    });
  }

  private createMinimapSection(width: number, height: number): void {
    // Minimap section
    const minimapTitle = this.add.text(width * 0.1, height * 0.7, 'MINIMAP', {
      fontSize: '24px',
      color: '#9b59b6',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    });

    const minimapText = 'The minimap in the top-left shows your surroundings\n Red dot: Your character position\n Green rectangle: Your current view area\n Use it to navigate the game world';

    const minimapInstructions = this.add.text(width * 0.1, height * 0.75, minimapText, {
      fontSize: '18px',
      color: '#bdc3c7',
      fontFamily: 'Arial, sans-serif',
      lineSpacing: 5
    });
  }

  private createNavigationButtons(width: number, height: number): void {
    // Back to Title button
    this.backButton = this.add.text(width * 0.2, height * 0.9, 'BACK TO TITLE', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#95a5a6',
      padding: { x: 15, y: 8 },
      fontFamily: 'Arial, sans-serif'
    });
    this.backButton.setOrigin(0.5);
    this.backButton.setInteractive({ useHandCursor: true });

    // Start Game button
    this.startButton = this.add.text(width * 0.8, height * 0.9, 'START GAME', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#27ae60',
      padding: { x: 15, y: 8 },
      fontFamily: 'Arial, sans-serif'
    });
    this.startButton.setOrigin(0.5);
    this.startButton.setInteractive({ useHandCursor: true });

    this.setupButtonInteractions();
  }

  private setupButtonInteractions(): void {
    // Back button interactions
    this.backButton.on('pointerover', () => {
      this.backButton.setStyle({ backgroundColor: '#7f8c8d' });
      this.backButton.setScale(1.05);
    });

    this.backButton.on('pointerout', () => {
      this.backButton.setStyle({ backgroundColor: '#95a5a6' });
      this.backButton.setScale(1);
    });

    this.backButton.on('pointerdown', () => {
      this.backButton.setScale(0.95);
    });

    this.backButton.on('pointerup', () => {
      this.backButton.setScale(1.05);
      this.scene.start('TitleScene');
    });

    // Start button interactions
    this.startButton.on('pointerover', () => {
      this.startButton.setStyle({ backgroundColor: '#229954' });
      this.startButton.setScale(1.05);
    });

    this.startButton.on('pointerout', () => {
      this.startButton.setStyle({ backgroundColor: '#27ae60' });
      this.startButton.setScale(1);
    });

    this.startButton.on('pointerdown', () => {
      this.startButton.setScale(0.95);
    });

    this.startButton.on('pointerup', () => {
      this.startButton.setScale(1.05);
      this.scene.start('GameScene', { playerGender: 'girl' });
    });
  }

  private setupKeyboardControls(): void {
    // Keyboard shortcuts
    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.start('TitleScene');
    });

    this.input.keyboard!.on('keydown-ENTER', () => {
      this.scene.start('GameScene', { playerGender: 'girl' });
    });

    this.input.keyboard!.on('keydown-SPACE', () => {
      this.scene.start('GameScene', { playerGender: 'girl' });
    });

    // Add keyboard hint
    const keyboardHint = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height * 0.95,
      this.isTouchDevice ? 'Tap buttons to navigate' : 'ESC: Back to Title | ENTER/SPACE: Start Game',
      {
        fontSize: '14px',
        color: '#7f8c8d',
        fontFamily: 'Arial, sans-serif'
      }
    );
    keyboardHint.setOrigin(0.5);
  }
}