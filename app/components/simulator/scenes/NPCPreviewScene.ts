/**
 * This file defines the NPCPreviewScene class for a Phaser-based game.
 * It shows a preview of the NPC including their name and description,
 * allowing the player to confirm if they want to start a conversation.
 */
import * as Phaser from 'phaser';
import type { PlayerGender } from '../../../../types/game';
import type { ScenarioTemplate } from '../../../../lib/simulator/scenarios';

interface NPCPreviewData {
  scenario: ScenarioTemplate;
  playerGender: PlayerGender;
  playerPosition: { x: number; y: number };
}

export class NPCPreviewScene extends Phaser.Scene {
  private scenario!: ScenarioTemplate;
  private playerGender!: PlayerGender;
  private playerPosition!: { x: number; y: number };
  private menuItems: Phaser.GameObjects.Text[] = [];
  private selectedIndex = 0;
  private selector!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'NPCPreviewScene' });
  }

  init(data: NPCPreviewData) {
    this.scenario = data.scenario;
    this.playerGender = data.playerGender;
    this.playerPosition = data.playerPosition;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Add background image with smart scaling (same as InstructionScene)
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

    // Create responsive font sizes
    const isSmallScreen = width < 600;
    const isMediumScreen = width >= 600 && width < 800;
    const titleFontSize = isSmallScreen ? '24px' : isMediumScreen  ? '28px' : '32px';
    const subtitleFontSize = isSmallScreen ? '14px' : isMediumScreen ? '16px' : '20px';
    const bodyFontSize = isSmallScreen ? '20px' : '28px';
    const buttonFontSize = isSmallScreen ? '16px' : '20px';

    // Create main container
    const containerWidth = Math.min(width * 0.9, 600);
    const containerHeight = Math.min(height * 0.8, 500);
    const containerX = width / 2;
    const containerY = height / 2;

    // Background container
    const container = this.add.rectangle(
      containerX,
      containerY,
      containerWidth,
      containerHeight,
      0xffffff,
      0
    );
    container.setStrokeStyle(4, 0xAD6BFF);
    container.setDepth(2);

    // Title
    const title = this.add.text(containerX, containerY - containerHeight/2 + 60, 'NPC PREVIEW', {
      fontSize: titleFontSize,
      color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace'
    });
    title.setOrigin(0.5);
    title.setDepth(3);

    // NPC Portrait (if available)
    const npcSprite = this.add.sprite(containerX, containerY - 100, `simulator-${this.playerGender}-npc-bar`);
    npcSprite.setScale(2);
    npcSprite.setDepth(3);

    // NPC Name
    const npcName = this.add.text(containerX, containerY - 40, this.scenario.npc.name, {
      fontSize: titleFontSize,
      color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace'
    });
    npcName.setOrigin(0.5);
    npcName.setDepth(3);

    // NPC Role
    const npcRole = this.add.text(containerX, containerY - 10, this.scenario.npc.role, {
      fontSize: subtitleFontSize,
      color: '#AD6BFF',
      fontFamily: '"Press Start 2P", monospace'
    });
    npcRole.setOrigin(0.5);
    npcRole.setDepth(3);

    // Scenario Description
    const description = this.add.text(
      containerX,
      containerY + 50,
      this.scenario.description,
      {
        fontSize: bodyFontSize,
        color: '#ecf0f1',
        fontFamily: '"VT323", sans-serif',
        align: 'center',
        wordWrap: { width: containerWidth - 60 }
      }
    );
    description.setOrigin(0.5);
    description.setDepth(3);

    // Buttons
    const startButton = this.add.text(
      containerX,
      containerY + 130,
      'START CHAT',
      {
        fontSize: buttonFontSize,
        color: '#ffffff',
        fontFamily: '"Press Start 2P", monospace'
      }
    );
    startButton.setOrigin(0.5);
    startButton.setDepth(3);

    const cancelButton = this.add.text(
      containerX,
      containerY + 180,
      'CANCEL',
      {
        fontSize: buttonFontSize,
        color: '#ffffff',
        fontFamily: '"Press Start 2P", monospace'
      }
    );
    cancelButton.setOrigin(0.5);
    cancelButton.setDepth(3);

    // Store menu items
    this.menuItems = [startButton, cancelButton];

    // Create selector arrow
    this.selector = this.add.text(0, 0, '>', {
      fontSize: titleFontSize,
      color: '#AD6BFF',
      fontFamily: '"Press Start 2P", monospace'
    });
    this.selector.setOrigin(0.5);
    this.selector.setDepth(4);

    // Setup navigation
    this.setupNavigation();
    this.updateSelector();

    // Add visual effects
    this.addVisualEffects();
  }

  private setupNavigation(): void {
    // Arrow key navigation
    this.input.keyboard!.on('keydown-LEFT', (event: KeyboardEvent) => {
      event.preventDefault();
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      this.updateSelector();
    });

    this.input.keyboard!.on('keydown-RIGHT', (event: KeyboardEvent) => {
      event.preventDefault();
      this.selectedIndex = Math.min(this.menuItems.length - 1, this.selectedIndex + 1);
      this.updateSelector();
    });

    // Enter key to confirm selection
    this.input.keyboard!.on('keydown-ENTER', (event: KeyboardEvent) => {
      event.preventDefault();
      this.confirmSelection();
    });

    // ESC key to cancel
    this.input.keyboard!.on('keydown-ESC', (event: KeyboardEvent) => {
      event.preventDefault();
      this.returnToGame();
    });

    // Space key to confirm (same as Enter)
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
    // Position selector to the left of the text
    const textBounds = selectedItem.getBounds();
    this.selector.setPosition(textBounds.left - 20, selectedItem.y);

    // Update text colors to show selection
    this.menuItems.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.setStyle({ color: '#AD6BFF' });
      } else {
        item.setStyle({ color: '#ffffff' });
      }
    });
  }

  private confirmSelection(): void {
    switch (this.selectedIndex) {
      case 0: // Start Conversation
        this.scene.start('ConversationScene', {
          scenario: this.scenario,
          playerGender: this.playerGender,
          playerPosition: this.playerPosition
        });
        break;
      case 1: // Cancel
        this.returnToGame();
        break;
    }
  }

  private returnToGame(): void {
    this.scene.start('GameScene', {
      playerGender: this.playerGender,
      preservedPosition: this.playerPosition
    });
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