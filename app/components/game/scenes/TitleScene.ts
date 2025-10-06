import * as Phaser from 'phaser';

export class TitleScene extends Phaser.Scene {
  private startButton!: Phaser.GameObjects.Text;
  private instructionButton!: Phaser.GameObjects.Text;
  private selector!: Phaser.GameObjects.Text;
  private menuItems: Phaser.GameObjects.Text[] = [];
  private selectedIndex = 0;

  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    // Get screen dimensions
    const { width, height } = this.cameras.main;

    // Add background image
    const background = this.add.image(width / 2, height / 2, 'game-title');
    background.setDisplaySize(width, height);


    // Create menu items as simple text (no backgrounds)
    this.startButton = this.add.text(width / 2, height * 0.5, 'START GAME', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace'
    });
    this.startButton.setOrigin(0.5);

    this.instructionButton = this.add.text(width / 2, height * 0.6, 'INSTRUCTIONS', {
      fontSize: '24px',
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
  }


  private setupNavigation(): void {
    // Arrow key navigation with preventDefault to stop page scrolling
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
    switch (this.selectedIndex) {
      case 0: // Start Game
        this.scene.start('GenderSelectionScene');
        break;
      case 1: // Instructions
        this.scene.start('InstructionScene');
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
  }
}