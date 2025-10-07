/**
 * This file defines the InstructionScene class for a Phaser-based game.
 * It provides an instruction screen that guides players on how to play the game.
 * The scene includes sections on movement, interaction, and minimap usage, along with navigation buttons and keyboard shortcuts.
 */
import * as Phaser from 'phaser';

export class InstructionScene extends Phaser.Scene {
  private backButton!: Phaser.GameObjects.Text;
  private selector!: Phaser.GameObjects.Text;
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

    // Add semi-transparent overlay for better text readability
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
    overlay.setDepth(1);

    // Create responsive font sizes based on screen width
    const isSmallScreen = width < 600;
    const isMediumScreen = width >= 600 && width < 900;
    const titleFontSize = isSmallScreen ? '24px' : isMediumScreen ? '28px' : '32px';

    const titleText = this.add.text(width / 2, height * 0.1, 'HOW TO PLAY', {
      fontSize: titleFontSize,
      color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace'
    });

    // Create selector arrow
    this.selector = this.add.text(0, 0, '>', {
      fontSize: titleFontSize,
      color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace'
    });
    this.selector.setOrigin(0.5);
    this.selector.setDepth(10); // Ensure selector appears on top

    const selectorX = isSmallScreen ? width / 2 - 115 : width / 2 - 155;
    this.selector.setPosition(selectorX, height * 0.88);

    titleText.setOrigin(0.5);
    titleText.setDepth(2);

    this.createMovementSection(width, height, isSmallScreen, isMediumScreen);
    this.createInteractionSection(width, height, isSmallScreen, isMediumScreen);
    this.createMinimapSection(width, height, isSmallScreen, isMediumScreen);

    this.createNavigationButtons(width, height, isSmallScreen);

    this.setupKeyboardControls(isSmallScreen);

    this.addVisualEffects();
  }

  private createMovementSection(width: number, height: number, isSmallScreen: boolean, isMediumScreen: boolean): void {
    // Movement section
    const headerFontSize = isSmallScreen ? '14px' : isMediumScreen ? '16px' : '18px';
    const textFontSize = isSmallScreen ? '10px' : isMediumScreen ? '12px' : '14px';

    const movementTitle = this.add.text(width * 0.1, height * 0.2, 'MOVEMENT', {
      fontSize: headerFontSize,
      color: '#e74c3c',
      fontFamily: '"Press Start 2P", monospace'
    });
    movementTitle.setDepth(2);

    let movementText: string;
    if (this.isTouchDevice) {
      movementText = '* Drag the joystick to move your character \n* Move in four directions: Up, Down, Left, Right \n* Release to stop moving';
    } else {
      movementText = '* W / UP key : Move up \n* S / DOWN key : Move down \n* A / LEFT key : Move left \n* D / RIGHT key : Move right';
    }

    const movementInstructions = this.add.text(width * 0.1, height * 0.25, movementText, {
      fontSize: textFontSize,
      color: '#bdc3c7',
      fontFamily: '"Press Start 2P", monospace',
      lineSpacing: isSmallScreen ? 6 : 8,
      wordWrap: { width: width * 0.85 }
    });
    movementInstructions.setDepth(2);
  }

  private createInteractionSection(width: number, height: number, isSmallScreen: boolean, isMediumScreen: boolean): void {
    // Interaction section
    const headerFontSize = isSmallScreen ? '14px' : isMediumScreen ? '16px' : '18px';
    const textFontSize = isSmallScreen ? '10px' : isMediumScreen ? '12px' : '14px';

    const interactionTitle = this.add.text(width * 0.1, height * 0.41, 'INTERACTION', {
      fontSize: headerFontSize,
      color: '#f39c12',
      fontFamily: '"Press Start 2P", monospace'
    });
    interactionTitle.setDepth(2);

    const interactionText = '* Walk up to NPCs and press SPACE / ENTER to interact \n* Different NPCs have different scenarios';

    const interactionInstructions = this.add.text(width * 0.1, height * 0.46, interactionText, {
      fontSize: textFontSize,
      color: '#bdc3c7',
      fontFamily: '"Press Start 2P", monospace',
      lineSpacing: isSmallScreen ? 6 : 8,
      wordWrap: { width: width * 0.85 }
    });
    interactionInstructions.setDepth(2);
  }

  private createMinimapSection(width: number, height: number, isSmallScreen: boolean, isMediumScreen: boolean): void {
    // Minimap section
    const headerFontSize = isSmallScreen ? '14px' : isMediumScreen ? '16px' : '18px';
    const textFontSize = isSmallScreen ? '10px' : isMediumScreen ? '12px' : '14px';

    const minimapTitle = this.add.text(width * 0.1, height * 0.62, 'MINIMAP', {
      fontSize: headerFontSize,
      color: '#9b59b6',
      fontFamily: '"Press Start 2P", monospace'
    });
    minimapTitle.setDepth(2);

    const minimapText = '* Minimap in top-left shows your surroundings \n* Red dot: Your character \n* Yellow dot: NPCs \n* Green rectangle: Your current view area';

    const minimapInstructions = this.add.text(width * 0.1, height * 0.67, minimapText, {
      fontSize: textFontSize,
      color: '#bdc3c7',
      fontFamily: '"Press Start 2P", monospace',
      lineSpacing: isSmallScreen ? 6 : 8,
      wordWrap: { width: width * 0.85 }
    });
    minimapInstructions.setDepth(2);
  }

  private createNavigationButtons(width: number, height: number, isSmallScreen: boolean): void {
    // Back to Title button
    const buttonFontSize = isSmallScreen ? '14px' : '20px';

    this.backButton = this.add.text(width / 2, height * 0.88, 'BACK TO TITLE', {
      fontSize: buttonFontSize,
      color: '#ffffff',
      padding: { x: isSmallScreen ? 10 : 15, y: isSmallScreen ? 6 : 8 },
      fontFamily: '"Press Start 2P", monospace'
    });
    this.backButton.setOrigin(0.5);
    this.backButton.setInteractive({ useHandCursor: true });
    this.backButton.setDepth(2);

    this.setupButtonInteractions();
  }

  private setupButtonInteractions(): void {
    this.backButton.on('pointerup', () => {
      this.scene.start('TitleScene');
    });
  }

  private setupKeyboardControls(isSmallScreen: boolean): void {
    // Keyboard shortcuts
    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.start('TitleScene');
    });

    this.input.keyboard!.on('keydown-ENTER', (event: KeyboardEvent) => {
      event.preventDefault();
      this.scene.start('TitleScene');
    });

    this.input.keyboard!.on('keydown-SPACE', (event: KeyboardEvent) => {
      event.preventDefault();
      this.scene.start('TitleScene');
    });

    this.input.keyboard!.on('keydown-UP', (event: KeyboardEvent) => {
      event.preventDefault();
    });

    this.input.keyboard!.on('keydown-DOWN', (event: KeyboardEvent) => {
      event.preventDefault();
    });
  }

  private addVisualEffects(): void {
    // Add animations to selector arrow
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