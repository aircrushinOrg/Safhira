/**
 * This file defines the GenderSelectionScene class for a Phaser-based game.
 * It provides an interactive scene where players can select their character gender
 * using a vertical menu layout similar to the TitleScene.
 */
import * as Phaser from 'phaser';
import type { PlayerGender } from '../../../../types/game';

export class GenderSelectionScene extends Phaser.Scene {
  private selectedGender: PlayerGender = 'boy';
  private boyButton!: Phaser.GameObjects.Text;
  private girlButton!: Phaser.GameObjects.Text;
  private backButton!: Phaser.GameObjects.Text;
  private selector!: Phaser.GameObjects.Text;
  private characterPreview!: Phaser.GameObjects.Sprite;
  private menuItems: Phaser.GameObjects.Text[] = [];
  private selectedIndex = 0;

  constructor() {
    super({ key: 'GenderSelectionScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // Add background image with smart scaling
    const background = this.add.image(width / 2, height / 2, 'simulator-background');
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

    // Create responsive font sizes based on screen width
    const titleFontSize = width < 600 ? '24px' : width < 800 ? '28px' : '32px';

    // Create title
    const titleText = this.add.text(width / 2, height * 0.2, 'SELECT GENDER', {
      fontSize: titleFontSize,
      color: '#7f2be6',
      fontFamily: '"Press Start 2P", monospace'
    });
    titleText.setOrigin(0.5);
    titleText.setDepth(2);

    // Create character preview
    this.createCharacterPreview(width, height);

    // Create menu items vertically (shifted down for character preview)
    this.boyButton = this.add.text(width / 2, height * 0.6, 'BOY', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace'
    });
    this.boyButton.setOrigin(0.5);
    this.boyButton.setDepth(2);

    this.girlButton = this.add.text(width / 2, height * 0.68, 'GIRL', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace'
    });
    this.girlButton.setOrigin(0.5);
    this.girlButton.setDepth(2);

    this.backButton = this.add.text(width / 2, height * 0.76, 'BACK TO TITLE', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace'
    });
    this.backButton.setOrigin(0.5);
    this.backButton.setDepth(2);

    // Store menu items in array for easy navigation
    this.menuItems = [this.boyButton, this.girlButton, this.backButton];

    // Create selector arrow
    this.selector = this.add.text(0, 0, '>', {
      fontSize: '32px',
      color: '#7f2be6',
      fontFamily: '"Press Start 2P", monospace'
    });
    this.selector.setOrigin(0.5);
    this.selector.setDepth(10);

    // Setup navigation
    this.setupNavigation();
    this.updateSelector();

    // Add visual effects
    this.addVisualEffects();
  }

  private setupNavigation(): void {
    // Arrow key navigation
    this.input.keyboard!.on('keydown-UP', (event: KeyboardEvent) => {
      event.preventDefault();
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      this.updateSelector();
    });

    this.input.keyboard!.on('keydown-DOWN', (event: KeyboardEvent) => {
      event.preventDefault();
      this.selectedIndex = Math.min(this.menuItems.length - 1, this.selectedIndex + 1);
      this.updateSelector();
    });

    // Enter key to confirm selection
    this.input.keyboard!.on('keydown-ENTER', (event: KeyboardEvent) => {
      event.preventDefault();
      this.confirmSelection();
    });

    // Space key to confirm selection
    this.input.keyboard!.on('keydown-SPACE', (event: KeyboardEvent) => {
      event.preventDefault();
      this.confirmSelection();
    });

    // ESC key to go back
    this.input.keyboard!.on('keydown-ESC', (event: KeyboardEvent) => {
      event.preventDefault();
      this.scene.start('TitleScene');
    });

    // Touch/mouse support for menu items
    this.menuItems.forEach((item, index) => {
      item.setInteractive({ useHandCursor: true });

      item.on('pointerover', () => {
        this.selectedIndex = index;
        this.updateSelector();
      });

      item.on('pointerup', () => {
        this.confirmSelection();
      });
    });
  }

  private createCharacterPreview(width: number, height: number): void {
    // Create character preview sprite
    this.characterPreview = this.add.sprite(width / 2, height * 0.38, `player-${this.selectedGender}-idle`, 3);
    this.characterPreview.setScale(2.5); // Make it larger for preview
    this.characterPreview.setDepth(5);

    // Play idle frame
    this.characterPreview.setTexture(`player-${this.selectedGender}-idle`, 3);

    // Add a subtle background circle
    const previewBackground = this.add.circle(width / 2, height * 0.40, 80, 0x34495e, 0.5);
    previewBackground.setDepth(4);
  }

  private updateSelector(): void {
    const selectedItem = this.menuItems[this.selectedIndex];
    // Position selector to the left of the text, accounting for text width
    const textBounds = selectedItem.getBounds();
    this.selector.setPosition(textBounds.left - 20, selectedItem.y);

    // Update text colors to show selection
    this.menuItems.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.setStyle({ color: '#7f2be6' });
      } else {
        item.setStyle({ color: '#ffffff' });
      }
    });

    // Update selected gender based on button selection and update character preview
    const previousGender = this.selectedGender;
    if (this.selectedIndex === 0) {
      this.selectedGender = 'boy';
    } else if (this.selectedIndex === 1) {
      this.selectedGender = 'girl';
    }

    // Update character preview if gender changed
    if (previousGender !== this.selectedGender && this.characterPreview) {
      this.updateCharacterPreview();
    }
  }

  private updateCharacterPreview(): void {
    // Update character preview
    this.characterPreview.setTexture(`player-${this.selectedGender}-idle`, 3);

    // Add a little bounce animation when switching
    this.tweens.add({
      targets: this.characterPreview,
      scaleX: 2.8,
      scaleY: 2.8,
      duration: 150,
      yoyo: true,
      ease: 'Power2'
    });
  }

  private confirmSelection(): void {
    switch (this.selectedIndex) {
      case 0: // Boy
        this.selectedGender = 'boy';
        this.scene.start('GameScene', { playerGender: this.selectedGender });
        break;
      case 1: // Girl
        this.selectedGender = 'girl';
        this.scene.start('GameScene', { playerGender: this.selectedGender });
        break;
      case 2: // Back
        this.scene.start('TitleScene');
        break;
    }
  }

  private addVisualEffects(): void {
    // Add pulsing animation to selector arrow
    this.tweens.add({
      targets: this.selector,
      alpha: 0.3,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // Add subtle glow effect to menu items
    this.tweens.add({
      targets: this.menuItems,
      alpha: 0.9,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // Add subtle floating animation to character preview
    this.tweens.add({
      targets: this.characterPreview,
      y: this.characterPreview.y - 5,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }
}