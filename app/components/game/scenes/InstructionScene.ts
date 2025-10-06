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
    const { width, height } = this.cameras.main;

    // Add background image with smart scaling
    const background = this.add.image(width / 2, height / 2, 'game-background');
    const imageWidth = background.width;
    const imageHeight = background.height;

    // Calculate scale ratios
    const scaleX = width / imageWidth;
    const scaleY = height / imageHeight;

    // Smart scaling logic
    if (width < imageWidth || height < imageHeight) {
      background.setScale(1.0);

      // Ensure the image covers the screen by using the larger scale if needed
      const minScale = Math.max(scaleX, scaleY);
      if (minScale > 1.0) {
        background.setScale(minScale);
      }

      // Focus towards bottom center of image
      const scaledImageHeight = background.height * background.scaleY;
      const excessHeight = scaledImageHeight - height;
      if (excessHeight > 0) {
        background.y = (height / 2) - (excessHeight * 0.3);
      }
    } else {
      // Screen is bigger than image - resize to fill
      const fillScale = Math.max(scaleX, scaleY);
      background.setScale(fillScale);

      const scaledImageHeight = background.height * fillScale;
      const excessHeight = scaledImageHeight - height;
      if (excessHeight > 0) {
        background.y = (height / 2) - (excessHeight * 0.3);
      }
    }

    // Add semi-transparent overlay for better text readability
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
    overlay.setDepth(1);

    const titleText = this.add.text(width / 2, height * 0.1, 'HOW TO PLAY', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace'
    });
    titleText.setOrigin(0.5);
    titleText.setDepth(2);

    this.createMovementSection(width, height);
    this.createInteractionSection(width, height);
    this.createMinimapSection(width, height);

    this.createNavigationButtons(width, height);

    this.setupKeyboardControls();
  }

  private createMovementSection(width: number, height: number): void {
    // Movement section
    const movementTitle = this.add.text(width * 0.1, height * 0.25, 'MOVEMENT', {
      fontSize: '18px',
      color: '#e74c3c',
      fontFamily: '"Press Start 2P", monospace'
    });
    movementTitle.setDepth(2);

    let movementText: string;
    if (this.isTouchDevice) {
      movementText = '* Use the virtual joystick\n  in the bottom-right corner\n* Drag the joystick to move\n  your character\n* Release to stop moving';
    } else {
      movementText = '* Use WASD keys or Arrow keys\n* W / UP : Move up\n* S / DOWN : Move down\n* A / LEFT : Move left\n* D / RIGHT : Move right';
    }

    const movementInstructions = this.add.text(width * 0.1, height * 0.3, movementText, {
      fontSize: '14px',
      color: '#bdc3c7',
      fontFamily: '"Press Start 2P", monospace',
      lineSpacing: 8
    });
    movementInstructions.setDepth(2);
  }

  private createInteractionSection(width: number, height: number): void {
    // Interaction section
    const interactionTitle = this.add.text(width * 0.1, height * 0.5, 'INTERACTION', {
      fontSize: '18px',
      color: '#f39c12',
      fontFamily: '"Press Start 2P", monospace'
    });
    interactionTitle.setDepth(2);

    const interactionText = '* Walk up to NPCs to interact\n* NPCs may have quests,\n  information, or items\n* Your character faces the\n  direction you move';

    const interactionInstructions = this.add.text(width * 0.1, height * 0.55, interactionText, {
      fontSize: '14px',
      color: '#bdc3c7',
      fontFamily: '"Press Start 2P", monospace',
      lineSpacing: 8
    });
    interactionInstructions.setDepth(2);
  }

  private createMinimapSection(width: number, height: number): void {
    // Minimap section
    const minimapTitle = this.add.text(width * 0.1, height * 0.7, 'MINIMAP', {
      fontSize: '18px',
      color: '#9b59b6',
      fontFamily: '"Press Start 2P", monospace'
    });
    minimapTitle.setDepth(2);

    const minimapText = '* Minimap in top-left shows\n  your surroundings\n* Red dot: Your character\n* Green rectangle:\n  Your current view area\n* Use it to navigate';

    const minimapInstructions = this.add.text(width * 0.1, height * 0.75, minimapText, {
      fontSize: '14px',
      color: '#bdc3c7',
      fontFamily: '"Press Start 2P", monospace',
      lineSpacing: 8
    });
    minimapInstructions.setDepth(2);
  }

  private createNavigationButtons(width: number, height: number): void {
    // Back to Title button
    this.backButton = this.add.text(width * 0.2, height * 0.9, 'BACK TO TITLE', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#95a5a6',
      padding: { x: 15, y: 8 },
      fontFamily: '"Press Start 2P", monospace'
    });
    this.backButton.setOrigin(0.5);
    this.backButton.setInteractive({ useHandCursor: true });
    this.backButton.setDepth(2);

    // Start Game button
    this.startButton = this.add.text(width * 0.8, height * 0.9, 'START GAME', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#27ae60',
      padding: { x: 15, y: 8 },
      fontFamily: '"Press Start 2P", monospace'
    });
    this.startButton.setOrigin(0.5);
    this.startButton.setInteractive({ useHandCursor: true });
    this.startButton.setDepth(2);

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
        fontSize: '12px',
        color: '#7f8c8d',
        fontFamily: '"Press Start 2P", monospace'
      }
    );
    keyboardHint.setOrigin(0.5);
    keyboardHint.setDepth(2);
  }
}