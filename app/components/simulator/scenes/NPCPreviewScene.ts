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

    // Add dark overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    overlay.setDepth(0);

    // Create responsive font sizes
    const titleFontSize = width < 600 ? '24px' : width < 800 ? '28px' : '32px';
    const bodyFontSize = width < 600 ? '16px' : width < 800 ? '18px' : '20px';
    const buttonFontSize = width < 600 ? '16px' : '20px';

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
      0x2c3e50
    );
    container.setStrokeStyle(4, 0x7f2be6);
    container.setDepth(1);

    // Title
    const title = this.add.text(containerX, containerY - containerHeight/2 + 60, 'CONVERSATION PREVIEW', {
      fontSize: titleFontSize,
      color: '#7f2be6',
      fontFamily: '"Press Start 2P", monospace'
    });
    title.setOrigin(0.5);
    title.setDepth(2);

    // NPC Portrait (if available)
    const npcSprite = this.add.sprite(containerX, containerY - 80, `simulator-${this.playerGender}-npc-bar`);
    npcSprite.setScale(2);
    npcSprite.setDepth(2);

    // NPC Name
    const npcName = this.add.text(containerX, containerY - 20, this.scenario.npc.name, {
      fontSize: '28px',
      color: '#ffffff',
      fontFamily: '"Press Start 2P", monospace'
    });
    npcName.setOrigin(0.5);
    npcName.setDepth(2);

    // NPC Role
    const npcRole = this.add.text(containerX, containerY + 10, this.scenario.npc.role, {
      fontSize: '16px',
      color: '#bdc3c7',
      fontFamily: '"Press Start 2P", monospace'
    });
    npcRole.setOrigin(0.5);
    npcRole.setDepth(2);

    // Scenario Description
    const description = this.add.text(
      containerX,
      containerY + 50,
      this.scenario.description,
      {
        fontSize: '14px',
        color: '#ecf0f1',
        fontFamily: 'Arial, sans-serif',
        align: 'center',
        wordWrap: { width: containerWidth - 60 }
      }
    );
    description.setOrigin(0.5);
    description.setDepth(2);

    // Buttons
    const startButton = this.add.text(
      containerX - 80,
      containerY + containerHeight/2 - 60,
      'START CONVERSATION',
      {
        fontSize: buttonFontSize,
        color: '#ffffff',
        fontFamily: '"Press Start 2P", monospace'
      }
    );
    startButton.setOrigin(0.5);
    startButton.setDepth(2);

    const cancelButton = this.add.text(
      containerX + 80,
      containerY + containerHeight/2 - 60,
      'CANCEL',
      {
        fontSize: buttonFontSize,
        color: '#ffffff',
        fontFamily: '"Press Start 2P", monospace'
      }
    );
    cancelButton.setOrigin(0.5);
    cancelButton.setDepth(2);

    // Store menu items
    this.menuItems = [startButton, cancelButton];

    // Create selector arrow
    this.selector = this.add.text(0, 0, '>', {
      fontSize: '24px',
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
    this.selector.setPosition(textBounds.left - 30, selectedItem.y);

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