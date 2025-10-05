import * as Phaser from 'phaser';

export class TitleScene extends Phaser.Scene {
  private startButton!: Phaser.GameObjects.Text;
  private instructionButton!: Phaser.GameObjects.Text;
  private titleText!: Phaser.GameObjects.Text;
  private isTouchDevice = false;

  constructor() {
    super({ key: 'TitleScene' });
  }

  init() {
    // Detect if touch device
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  create() {
    // Add background color
    this.cameras.main.setBackgroundColor('#2c3e50');

    // Get screen dimensions
    const { width, height } = this.cameras.main;

    // Create title text
    this.titleText = this.add.text(width / 2, height * 0.3, 'SAFHIRA', {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    });
    this.titleText.setOrigin(0.5);

    // Add subtitle
    const subtitleText = this.add.text(width / 2, height * 0.4, 'Adventure Game', {
      fontSize: '24px',
      color: '#bdc3c7',
      fontFamily: 'Arial, sans-serif'
    });
    subtitleText.setOrigin(0.5);

    // Create Start Game button
    this.startButton = this.add.text(width / 2, height * 0.6, 'START GAME', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#e74c3c',
      padding: { x: 20, y: 10 },
      fontFamily: 'Arial, sans-serif'
    });
    this.startButton.setOrigin(0.5);
    this.startButton.setInteractive({ useHandCursor: true });

    // Create Instructions button
    this.instructionButton = this.add.text(width / 2, height * 0.75, 'INSTRUCTIONS', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#3498db',
      padding: { x: 15, y: 8 },
      fontFamily: 'Arial, sans-serif'
    });
    this.instructionButton.setOrigin(0.5);
    this.instructionButton.setInteractive({ useHandCursor: true });

    // Add button interactions
    this.setupButtonInteractions();

    // Add some visual flair
    this.addVisualEffects();
  }


  private setupButtonInteractions(): void {
    // Start button interactions
    this.startButton.on('pointerover', () => {
      this.startButton.setStyle({ backgroundColor: '#c0392b' });
      this.startButton.setScale(1.05);
    });

    this.startButton.on('pointerout', () => {
      this.startButton.setStyle({ backgroundColor: '#e74c3c' });
      this.startButton.setScale(1);
    });

    this.startButton.on('pointerdown', () => {
      this.startButton.setScale(0.95);
    });

    this.startButton.on('pointerup', () => {
      this.startButton.setScale(1.05);
      this.scene.start('GenderSelectionScene');
    });

    // Instruction button interactions
    this.instructionButton.on('pointerover', () => {
      this.instructionButton.setStyle({ backgroundColor: '#2980b9' });
      this.instructionButton.setScale(1.05);
    });

    this.instructionButton.on('pointerout', () => {
      this.instructionButton.setStyle({ backgroundColor: '#3498db' });
      this.instructionButton.setScale(1);
    });

    this.instructionButton.on('pointerdown', () => {
      this.instructionButton.setScale(0.95);
    });

    this.instructionButton.on('pointerup', () => {
      this.instructionButton.setScale(1.05);
      this.scene.start('InstructionScene');
    });

    // Keyboard support
    this.input.keyboard!.on('keydown-ENTER', () => {
      this.scene.start('GenderSelectionScene');
    });

    this.input.keyboard!.on('keydown-I', () => {
      this.scene.start('InstructionScene');
    });
  }

  private addVisualEffects(): void {
    // Add floating animation to title
    this.tweens.add({
      targets: this.titleText,
      y: this.titleText.y - 10,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // Add subtle glow effect to buttons
    this.tweens.add({
      targets: [this.startButton, this.instructionButton],
      alpha: 0.8,
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // Add keyboard hints
    const keyboardHint = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height * 0.9,
      this.isTouchDevice ? 'Tap buttons to navigate' : 'Press ENTER to start • Press I for instructions',
      {
        fontSize: '16px',
        color: '#95a5a6',
        fontFamily: 'Arial, sans-serif'
      }
    );
    keyboardHint.setOrigin(0.5);
  }
}