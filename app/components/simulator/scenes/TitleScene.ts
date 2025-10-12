/** 
 * This file defines the TitleScene class for a Phaser-based game. 
 * It sets up the title screen with a background image, title text, menu options, and navigation controls. 
 * The scene includes visual effects and responsive design to adapt to different screen sizes.
 */
import * as Phaser from 'phaser';
import { getGameTranslations } from '../utils/gameI18n';
import { MusicController } from '../utils/MusicController';

export class TitleScene extends Phaser.Scene {
  private startButton!: Phaser.GameObjects.Text;
  private instructionButton!: Phaser.GameObjects.Text;
  private selector!: Phaser.GameObjects.Text;
  private titleText!: Phaser.GameObjects.Text;
  private titleShadow!: Phaser.GameObjects.Text;
  private menuItems: Phaser.GameObjects.Text[] = [];
  private selectedIndex = 0;
  private musicToggleButton?: Phaser.GameObjects.Image;

  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    const { title: titleTexts } = getGameTranslations();

    // Add background image
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
    const titleFontSize = width < 600 ? '42px' : '64px';
    const subtitleFontSize = width < 600 ? '20px' : '24px';
    const buttonFontSize = width < 600 ? '16px' : '20px';
    const shadowOffset = width < 600 ? 6 : 8;
    const strokeThickness = width < 600 ? 4 : 6;
    const subtitleYOffset = width < 600 ? 0.33 : 0.35;

    // Create main game title
    this.titleShadow = this.add.text(width / 2, height * 0.25 + shadowOffset, 'SAFHIRA', {
      fontSize: titleFontSize,
      color: '#1a9790', 
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#7f2be6', 
      strokeThickness: strokeThickness
    });
    this.titleShadow.setOrigin(0.5);
    this.titleShadow.setDepth(1);

    this.titleText = this.add.text(width / 2, height * 0.25, 'SAFHIRA', {
      fontSize: titleFontSize,
      color: '#ffacb1',
      fontFamily: '"Press Start 2P", monospace',
      stroke: '#7f2be6',
      strokeThickness: strokeThickness
    });
    this.titleText.setOrigin(0.5);
    this.titleText.setDepth(2);

    // Create subtitle text
    const subtitleText = this.add.text(width / 2, height * subtitleYOffset, titleTexts.subtitle, {
      fontSize: subtitleFontSize,
      color: '#7f2be6',
      fontFamily: '"Press Start 2P", monospace'
    });
    subtitleText.setOrigin(0.5);

    // Create menu items
    this.startButton = this.add.text(width / 2, height * 0.5, titleTexts.start, {
      fontSize: buttonFontSize,
      color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace'
    });
    this.startButton.setOrigin(0.5);

    this.instructionButton = this.add.text(width / 2, height * 0.58, titleTexts.instructions, {
      fontSize: buttonFontSize,
      color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace'
    });
    this.instructionButton.setOrigin(0.5);

    // Store menu items in array for easy navigation
    this.menuItems = [this.startButton, this.instructionButton];

    // Create selector arrow
    this.selector = this.add.text(0, 0, '>', {
      fontSize: '32px',
      color: '#7f2be6',
      fontFamily: '"Press Start 2P", monospace'
    });
    this.selector.setOrigin(0.5);
    this.selector.setDepth(10); // Ensure selector appears on top

    // Setup navigation
    this.setupNavigation();
    this.updateSelector();

    // Add visual effects
    this.addVisualEffects();

    this.createMusicToggle();
    this.updateMusicToggleLabel();

    // Ensure background music persists across scenes
    MusicController.play(this);
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
  }

  private confirmSelection(): void {
    // Navigate to the selected scene
    switch (this.selectedIndex) {
      case 0:
        this.scene.start('GenderSelectionScene');
        break;
      case 1:
        this.scene.start('InstructionScene');
        break;
    }
  }

  private createMusicToggle(): void {
    const iconKey = MusicController.isMuted() ? 'simulator-mute' : 'simulator-unmute';
    this.musicToggleButton = this.add
      .image(
        this.cameras.main.width - 16,
        this.cameras.main.height - 16,
        iconKey
      )
      .setOrigin(1, 1)
      .setScrollFactor(0)
      .setDepth(3000)
      .setScale(1.6)
      .setInteractive({ useHandCursor: true });

    this.musicToggleButton.on('pointerup', () => {
      MusicController.toggleMute(this);
      this.updateMusicToggleLabel();
    });
  }

  private updateMusicToggleLabel(): void {
    if (!this.musicToggleButton) return;
    const iconKey = MusicController.isMuted() ? 'simulator-mute' : 'simulator-unmute';
    this.musicToggleButton.setTexture(iconKey);
  }

  private addVisualEffects(): void {
    // Add animations to title text, shadow, and selector arrow
    this.tweens.add({
      targets: [this.titleText],
      y: this.titleText.y - 10,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    this.tweens.add({
      targets: [this.titleShadow],
      y: this.titleText.y - 2,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    this.tweens.add({
      targets: this.selector,
      alpha: 0.3,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });
  }
}
