import * as Phaser from 'phaser';
import type { PlayerGender } from '../../../../types/game';

export class GenderSelectionScene extends Phaser.Scene {
  private selectedGender: PlayerGender = 'boy';
  private boyButton!: Phaser.GameObjects.Text;
  private girlButton!: Phaser.GameObjects.Text;
  private confirmButton!: Phaser.GameObjects.Text;
  private backButton!: Phaser.GameObjects.Text;
  private characterPreview!: Phaser.GameObjects.Sprite;
  private isTouchDevice = false;

  constructor() {
    super({ key: 'GenderSelectionScene' });
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

    // Create title
    const titleText = this.add.text(width / 2, height * 0.15, 'Choose Your Character', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
      fontFamily: 'Arial, sans-serif'
    });
    titleText.setOrigin(0.5);

    // Create subtitle
    const subtitleText = this.add.text(width / 2, height * 0.25, 'Select your character gender', {
      fontSize: '20px',
      color: '#bdc3c7',
      fontFamily: 'Arial, sans-serif'
    });
    subtitleText.setOrigin(0.5);

    // Create character preview
    this.createCharacterPreview(width, height);

    // Create gender selection buttons
    this.createGenderButtons(width, height);

    // Create navigation buttons
    this.createNavigationButtons(width, height);

    // Add visual effects
    this.addVisualEffects();
  }

  private createCharacterPreview(width: number, height: number): void {
    // Create character preview sprite
    this.characterPreview = this.add.sprite(width / 2, height * 0.5, `player-${this.selectedGender}-idle`, 3);
    this.characterPreview.setScale(3); // Make it larger for preview
    this.characterPreview.setDepth(10);

    // Play idle frame
    this.characterPreview.play(`${this.selectedGender}-idle-down`);

    // Add a subtle background circle
    const previewBackground = this.add.circle(width / 2, height * 0.5, 80, 0x34495e, 0.8);
    previewBackground.setDepth(5);
  }

  private createGenderButtons(width: number, height: number): void {
    // Create Boy button
    this.boyButton = this.add.text(width / 2 - 120, height * 0.7, 'BOY', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: this.selectedGender === 'boy' ? '#276faeff' : '#7f8c8d',
      padding: { x: 20, y: 12 },
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    });
    this.boyButton.setOrigin(0.5);
    this.boyButton.setInteractive({ useHandCursor: true });

    // Create Girl button
    this.girlButton = this.add.text(width / 2 + 120, height * 0.7, 'GIRL', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: this.selectedGender === 'girl' ? '#276faeff' : '#7f8c8d',
      padding: { x: 20, y: 12 },
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold'
    });
    this.girlButton.setOrigin(0.5);
    this.girlButton.setInteractive({ useHandCursor: true });

    this.setupGenderButtonInteractions();
  }

  private createNavigationButtons(width: number, height: number): void {
    // Back button
    this.backButton = this.add.text(width * 0.2, height * 0.85, 'BACK', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#95a5a6',
      padding: { x: 15, y: 8 },
      fontFamily: 'Arial, sans-serif'
    });
    this.backButton.setOrigin(0.5);
    this.backButton.setInteractive({ useHandCursor: true });

    // Confirm button
    this.confirmButton = this.add.text(width * 0.8, height * 0.85, 'CONFIRM', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#27ae60',
      padding: { x: 15, y: 8 },
      fontFamily: 'Arial, sans-serif'
    });
    this.confirmButton.setOrigin(0.5);
    this.confirmButton.setInteractive({ useHandCursor: true });

    this.setupNavigationButtonInteractions();
  }

  private setupGenderButtonInteractions(): void {
    // Boy button interactions
    this.boyButton.on('pointerover', () => {
      this.boyButton.setScale(1.05);
    });

    this.boyButton.on('pointerout', () => {
      this.boyButton.setScale(1);
    });

    this.boyButton.on('pointerdown', () => {
      this.boyButton.setScale(0.95);
    });

    this.boyButton.on('pointerup', () => {
      this.boyButton.setScale(1.05);
      this.selectGender('boy');
    });

    // Girl button interactions
    this.girlButton.on('pointerover', () => {
      this.girlButton.setScale(1.05);
    });

    this.girlButton.on('pointerout', () => {
      this.girlButton.setScale(1);
    });

    this.girlButton.on('pointerdown', () => {
      this.girlButton.setScale(0.95);
    });

    this.girlButton.on('pointerup', () => {
      this.girlButton.setScale(1.05);
      this.selectGender('girl');
    });
  }

  private setupNavigationButtonInteractions(): void {
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

    // Confirm button interactions
    this.confirmButton.on('pointerover', () => {
      this.confirmButton.setStyle({ backgroundColor: '#229954' });
      this.confirmButton.setScale(1.05);
    });

    this.confirmButton.on('pointerout', () => {
      this.confirmButton.setStyle({ backgroundColor: '#27ae60' });
      this.confirmButton.setScale(1);
    });

    this.confirmButton.on('pointerdown', () => {
      this.confirmButton.setScale(0.95);
    });

    this.confirmButton.on('pointerup', () => {
      this.confirmButton.setScale(1.05);
      this.scene.start('GameScene', { playerGender: this.selectedGender });
    });

    // Keyboard shortcuts
    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.start('TitleScene');
    });

    this.input.keyboard!.on('keydown-ENTER', () => {
      this.scene.start('GameScene', { playerGender: this.selectedGender });
    });

    this.input.keyboard!.on('keydown-SPACE', () => {
      this.scene.start('GameScene', { playerGender: this.selectedGender });
    });
  }

  private selectGender(gender: PlayerGender): void {
    this.selectedGender = gender;

    // Update button styles
    this.boyButton.setStyle({
      backgroundColor: gender === 'boy' ? '#276faeff' : '#7f8c8d'
    });

    this.girlButton.setStyle({
      backgroundColor: gender === 'girl' ? '#276faeff' : '#7f8c8d'
    });

    // Update character preview
    this.characterPreview.setTexture(`player-${gender}-idle`, 3);
    this.characterPreview.play(`${gender}-idle-down`);

    // Add a little animation when switching
    this.tweens.add({
      targets: this.characterPreview,
      scaleX: 3.2,
      scaleY: 3.2,
      duration: 150,
      yoyo: true,
      ease: 'Power2'
    });
  }

  private addVisualEffects(): void {
    // Add subtle bounce animation to character preview
    this.tweens.add({
      targets: this.characterPreview,
      y: this.characterPreview.y - 7,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // Add keyboard hints
    const keyboardHint = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height * 0.95,
      this.isTouchDevice ? 'Tap to select and confirm' : 'ESC: Back | ENTER/SPACE: Confirm',
      {
        fontSize: '14px',
        color: '#95a5a6',
        fontFamily: 'Arial, sans-serif'
      }
    );
    keyboardHint.setOrigin(0.5);
  }
}