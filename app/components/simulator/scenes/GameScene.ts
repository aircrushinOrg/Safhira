/**
 * This file defines the GameScene class for a Phaser-based game.
 * It sets up the main game scene with player movement, camera control, minimap, and input handling.
 * The scene supports both keyboard and touch input, including a virtual joystick for mobile devices.
 */
import * as Phaser from 'phaser';
import type { PlayerGender, Direction, NPCData, NPCInteractionZone } from '../../../../types/game';
import { Minimap } from '../utils/Minimap';
import { VirtualJoystick } from '../utils/VirtualJoystick';
import { CollisionManager } from '../utils/CollisionManager';
import { PlayerHitbox } from '../utils/PlayerHitbox';
import { NPCHitboxDebugger } from '../debugger/NPCHitboxDebugger';
import { CollisionDebugger } from '../debugger/CollisionDebugger';
import { PlayerHitboxDebugger } from '../debugger/PlayerHitboxDebugger';
import { SCENARIO_TEMPLATES } from '../../../../lib/simulator/scenarios';
import type { ScenarioTemplate } from '../../../../lib/simulator/scenarios';
import { getGameTranslations } from '../utils/gameI18n';
import {
  emitConversationOverlayOpen,
  CONVERSATION_OVERLAY_CLOSE_EVENT,
  type ConversationOverlayOpenDetail
} from '../../../../lib/simulator/overlay-events';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private playerGender: PlayerGender = 'boy';
  private currentDirection: Direction = 'down';
  private playerSpeed = 200;
  private isMoving = false;
  private virtualJoystick?: VirtualJoystick;
  private isTouchDevice = false;
  private minimap!: Minimap;
  private menuButton!: Phaser.GameObjects.Text;
  private preservedPosition?: { x: number; y: number };
  private collisionManager: CollisionManager;
  private lastSafePosition: { x: number; y: number } = { x: 0, y: 0 };
  private collisionDebugger!: CollisionDebugger;
  private playerHitboxDebugger!: PlayerHitboxDebugger;
  private npcHitboxDebugger!: NPCHitboxDebugger;
  private npcs: NPCInteractionZone[] = [];
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private enterKey!: Phaser.Input.Keyboard.Key;
  private nearbyNPC: NPCInteractionZone | null = null;
  private overlayActive = false;

  constructor() {
    super({ key: 'GameScene' });
    this.collisionManager = new CollisionManager(32); // 32px tile size
  }

  init(data: { playerGender?: PlayerGender; preservedPosition?: { x: number; y: number } }) {
    this.playerGender = data.playerGender || 'boy';
    this.preservedPosition = data.preservedPosition;
    // Detect if touch device
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    this.overlayActive = false;
  }

  create() {
    // Determine screen size for responsive design
    const screenWidth = this.cameras.main.width;
    const isSmallScreen = screenWidth < 600;
    const isMediumScreen = screenWidth >= 600 && screenWidth < 1000;

    // Add the map (no auto-scaling to prevent zoom issues)
    const map = this.add.image(0, 0, 'map').setOrigin(0, 0);

    // Set world bounds to actual map size
    this.physics.world.setBounds(0, 0, map.width, map.height);

    // Create animations BEFORE creating the player sprite
    this.createPlayerAnimations();
    this.createNPCAnimations();
    this.createInteractionIndicatorAnimation();
    this.npcs = [];

    // Create player sprite at starting position (center of map or preserved position)
    const startX = this.preservedPosition?.x || map.width / 2;
    const startY = this.preservedPosition?.y || map.height / 3;
    this.player = this.add.sprite(startX, startY, `player-${this.playerGender}-down`);
    this.player.setScale(1.5); // Make player slightly bigger
    this.player.setDepth(10); // Ensure player is above the map

    // Set initial safe position
    this.lastSafePosition = { x: startX, y: startY };

    // Play initial idle frame
    this.player.setTexture(`player-${this.playerGender}-idle`, 3);

    // Enable physics for player
    this.physics.add.existing(this.player);
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setCollideWorldBounds(true);

    // Setup camera to follow player with smooth following
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, map.width, map.height);

    // Reset camera zoom to 1 (no zoom)
    this.cameras.main.setZoom(1);

    // Add foreground layer above the player
    const foreground = this.add.image(0, 0, 'simulator-foreground').setOrigin(0, 0);
    foreground.setDepth(15); // Above player (depth 10) but below UI elements

    // Setup keyboard input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasdKeys = {
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Add virtual joystick for touch devices
    if (this.isTouchDevice) {
      this.virtualJoystick = new VirtualJoystick(this, {
        x: isSmallScreen ? this.cameras.main.width / 2 : this.cameras.main.width - 80,
        y: this.cameras.main.height - 160,
        radius: 65,
        forceMin: 16
      });
      this.virtualJoystick.create();
    }

    // Create minimap (smaller only for small screens < 600px width)
    const minimapConfig = {
      width: isSmallScreen ? 160 : isMediumScreen ? 200 : 250,
      height: isSmallScreen ? 120 : isMediumScreen ? 150 : 200,
      padding: isSmallScreen ? 5 : isMediumScreen ? 10 : 15,
      zoom: isSmallScreen ? 0.06 : isMediumScreen ? 0.08 : 0.1,
    };

    this.minimap = new Minimap(this, this.player, minimapConfig, this.virtualJoystick?.getRawJoystick());
    this.minimap.create(map);

    // Create menu button
    const { game: gameTexts } = getGameTranslations();
    this.createMenuButton(gameTexts.menu);

    // Create debug visualizations (Debugging purposes)
    this.collisionDebugger = new CollisionDebugger(this, this.collisionManager);
    this.playerHitboxDebugger = new PlayerHitboxDebugger(this, this.player);
    this.npcHitboxDebugger = new NPCHitboxDebugger(this);

    // Enable/disable debuggers (set to true to enable debugging)
    // this.collisionDebugger.setEnabled(true);
    // this.playerHitboxDebugger.setEnabled(true);
    // this.npcHitboxDebugger.setEnabled(true);

    // Update minimap to ignore menu button
    this.minimap.ignoreMenuButton(this.menuButton);

    // Setup interaction keys (space and enter)
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // Create NPCs based on player gender
    this.createNPCs();

    if (typeof window !== 'undefined') {
      window.addEventListener(CONVERSATION_OVERLAY_CLOSE_EVENT, this.handleOverlayClosed);
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        window.removeEventListener(CONVERSATION_OVERLAY_CLOSE_EVENT, this.handleOverlayClosed);
      });
      this.events.once(Phaser.Scenes.Events.DESTROY, () => {
        window.removeEventListener(CONVERSATION_OVERLAY_CLOSE_EVENT, this.handleOverlayClosed);
      });
    }
  }

  private createMenuButton(label: string): void {
    // Create menu button in top-right corner
    this.menuButton = this.add.text(
      this.cameras.main.width - 20,
      20,
      label,
      {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#34495e',
        padding: { x: 12, y: 6 },
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold'
      }
    );

    // Position from top-right corner
    this.menuButton.setOrigin(1, 0);

    // Make button fixed to camera
    this.menuButton.setScrollFactor(0);

    // Set high depth to appear above everything
    this.menuButton.setDepth(2000);
    this.menuButton.setInteractive({ useHandCursor: true });

    // Add hover effects
    this.menuButton.on('pointerover', () => {
      this.menuButton.setStyle({ backgroundColor: '#2c3e50' });
      this.menuButton.setScale(1.05);
    });

    this.menuButton.on('pointerout', () => {
      this.menuButton.setStyle({ backgroundColor: '#34495e' });
      this.menuButton.setScale(1);
    });

    this.menuButton.on('pointerdown', () => {
      this.menuButton.setScale(0.95);
    });

    this.menuButton.on('pointerup', () => {
      this.menuButton.setScale(1.05);
      this.scene.start('TitleScene');
    });

    // Add keyboard shortcut (ESC key)
    this.input.keyboard!.on('keydown-ESC', () => {
      this.scene.start('TitleScene');
    });
  }


  private createPlayerAnimations() {
    const directions: Direction[] = ['up', 'down', 'left', 'right'];
    const genders: PlayerGender[] = ['boy', 'girl'];

    // Create animations for both genders and all directions
    genders.forEach((gender) => {
      directions.forEach((direction) => {
        const key = `${gender}-walk-${direction}`;
        const textureKey = `player-${gender}-${direction}`;
        const idleTextureKey = `player-${gender}-idle`;

        // Walking animation
        this.anims.create({
          key: key,
          frames: this.anims.generateFrameNumbers(textureKey, { start: 0, end: 5 }),
          frameRate: 10,
          repeat: -1, // Loop indefinitely
        });

        // Idle frame
        this.anims.create({
          key: `${gender}-idle-${direction}`,
          frames: [{ key: idleTextureKey, frame: direction === 'right' ? 0 : direction === 'up' ? 1 : direction === 'left' ? 2 : 3 }],
          frameRate: 1,
        });
      });
    });
  }

  private createNPCAnimations() {
    const spriteKeys = [
      'simulator-boy-npc-bar',
      'simulator-girl-npc-bar',
      'simulator-boy-npc-doctor',
      'simulator-girl-npc-doctor',
      'simulator-both-npc-uni',
    ];

    spriteKeys.forEach((textureKey) => {
      const animationKey = `${textureKey}-idle`;
      if (!this.anims.exists(animationKey)) {
        this.anims.create({
          key: animationKey,
          frames: this.anims.generateFrameNumbers(textureKey, { start: 0, end: 5 }),
          frameRate: 4, // Slower frame rate for idle animation
          repeat: -1, // Loop indefinitely
        });
      }
    });
  }

  private createInteractionIndicatorAnimation() {
    // Create interaction indicator animation using all 6 frames
    this.anims.create({
      key: 'interaction-indicator-anim',
      frames: this.anims.generateFrameNumbers('interaction-indicator', { start: 0, end: 5 }),
      frameRate: 6, // Medium frame rate for indicator animation
      repeat: 0, // Play only once
    });
  }


  update() {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    // Reset velocity
    playerBody.setVelocity(0);
    this.isMoving = false;

    if (this.overlayActive) {
      const idleKey = `${this.playerGender}-idle-${this.currentDirection}`;
      if (this.player.anims.currentAnim?.key !== idleKey) {
        this.player.play(idleKey);
      }
      this.minimap.update();
      return;
    }

    // Handle joystick input on touch devices
    if (this.isTouchDevice && this.virtualJoystick) {
      const isActive = this.virtualJoystick.isActive();

      if (isActive) {
        const degrees = this.virtualJoystick.getAngle(); // Already in degrees

        // Snap to 4 cardinal directions based on angle in degrees
        // 0° = Right, 90° = Down, -90° = Up, ±180° = Left
        
        if (degrees >= -45 && degrees < 45) {
          // Right (between -45° and 45°)
          playerBody.setVelocityX(this.playerSpeed);
          this.currentDirection = 'right';
          this.isMoving = true;
        } else if (degrees >= 45 && degrees < 135) {
          // Down (between 45° and 135°)
          playerBody.setVelocityY(this.playerSpeed);
          this.currentDirection = 'down';
          this.isMoving = true;
        } else if (degrees >= -135 && degrees < -45) {
          // Up (between -135° and -45°)
          playerBody.setVelocityY(-this.playerSpeed);
          this.currentDirection = 'up';
          this.isMoving = true;
        } else {
          // Left (between 135° and 180° OR between -180° and -135°)
          playerBody.setVelocityX(-this.playerSpeed);
          this.currentDirection = 'left';
          this.isMoving = true;
        }
      }
    } else {
      // Handle keyboard input for 4 cardinal directions only
      // Vertical movement takes precedence over horizontal
      if (this.cursors.up.isDown || this.wasdKeys.up.isDown) {
        playerBody.setVelocityY(-this.playerSpeed);
        this.currentDirection = 'up';
        this.isMoving = true;
      } else if (this.cursors.down.isDown || this.wasdKeys.down.isDown) {
        playerBody.setVelocityY(this.playerSpeed);
        this.currentDirection = 'down';
        this.isMoving = true;
      } else if (this.cursors.left.isDown || this.wasdKeys.left.isDown) {
        playerBody.setVelocityX(-this.playerSpeed);
        this.currentDirection = 'left';
        this.isMoving = true;
      } else if (this.cursors.right.isDown || this.wasdKeys.right.isDown) {
        playerBody.setVelocityX(this.playerSpeed);
        this.currentDirection = 'right';
        this.isMoving = true;
      }
    }

    // Update animation based on movement state
    if (this.isMoving) {
      const walkKey = `${this.playerGender}-walk-${this.currentDirection}`;
      if (this.player.anims.currentAnim?.key !== walkKey) {
        this.player.play(walkKey);
      }
    } else {
      const idleKey = `${this.playerGender}-idle-${this.currentDirection}`;
      if (this.player.anims.currentAnim?.key !== idleKey) {
        this.player.play(idleKey);
      }
    }

    // Check if player is in a collision tile and reset if needed
    if (this.isPlayerInCollision()) {
      // Player is in a collision, reset to last safe position
      this.player.setPosition(this.lastSafePosition.x, this.lastSafePosition.y);
    } else {
      // Player is in a safe position, update the last safe position
      this.lastSafePosition = { x: this.player.x, y: this.player.y };
    }

    // Update debug visualizations (if enabled)
    // this.playerHitboxDebugger.update();
    // this.collisionDebugger.update();
    // this.npcHitboxDebugger.update();

    // Update minimap
    this.minimap.update();

    // Update NPC interactions
    this.updateNPCInteractions();

    // Handle interaction input
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      this.handleInteraction();
    }
  }


  private isPlayerInCollision(): boolean {
    // Get player position
    const playerX = this.player.x;
    const playerY = this.player.y;

    // Get collision check points using the PlayerHitbox utility
    const checkPoints = PlayerHitbox.getCollisionCheckPoints(playerX, playerY);

    // If any check point is in a collision, consider the player colliding
    return checkPoints.some(point => this.collisionManager.isColliding(point.x, point.y));
  }

  private createNPCs(): void {
    const npcConfigs = [
      {
        scenarioId: this.playerGender === 'girl' ? 'outside-bar-girl' : 'outside-bar-boy',
        sprite: this.playerGender === 'girl' ? 'simulator-girl-npc-bar' : 'simulator-boy-npc-bar',
      },
      {
        scenarioId: this.playerGender === 'girl' ? 'health-clinic-visit-girl' : 'health-clinic-visit-boy',
        sprite: this.playerGender === 'girl' ? 'simulator-girl-npc-doctor' : 'simulator-boy-npc-doctor',
      },
      {
        scenarioId: 'university-misinformation-both',
        sprite: 'simulator-both-npc-uni',
      },
    ];

    const mapWidth = this.physics.world.bounds.width;
    const mapHeight = this.physics.world.bounds.height;
    const baseY = mapHeight / 3;
    const spacing = 110;
    const resolvedConfigs = npcConfigs
      .map(({ scenarioId, sprite }) => {
        const scenario = SCENARIO_TEMPLATES.find((template) => template.id === scenarioId);
        if (!scenario) {
          return null;
        }
        return { scenario, sprite };
      })
      .filter((value): value is { scenario: ScenarioTemplate; sprite: string } => Boolean(value));

    const startX = resolvedConfigs.length > 0
      ? mapWidth / 2 - ((resolvedConfigs.length - 1) * spacing) / 2
      : mapWidth / 2;

    resolvedConfigs.forEach(({ scenario, sprite }, index) => {
      const x = startX + index * spacing;
      const npcData: NPCData = {
        id: scenario.npc.id,
        name: scenario.npc.name,
        scenarioId: scenario.id,
        x,
        y: baseY,
        sprite,
        interactionRadius: 80,
        isInteractive: true,
      };

      this.createNPC(npcData);
    });
  }

  private createNPC(data: NPCData): void {
    // Create NPC sprite with collision
    const sprite = this.add.sprite(data.x, data.y, data.sprite || 'default-npc');
    sprite.setScale(1.5);
    sprite.setDepth(5);

    // Enable physics for NPC to create collision
    this.physics.add.existing(sprite);
    const npcBody = sprite.body as Phaser.Physics.Arcade.Body;

    // Set smaller hitbox to match the character's body (not the full sprite)
    // Original sprite frame is 32x64, scaled by 1.5 = 48x96
    // Reduce to a much smaller, more realistic collision area
    npcBody.setSize(32, 32); // Much smaller width and height
    npcBody.setOffset(0, 0); // Center the hitbox on the character's lower body/feet

    // Make NPC immovable so player bounces off instead of pushing NPC
    npcBody.setImmovable(true);

    // Set up collision between player and NPC
    this.physics.add.collider(this.player, sprite);

    // Initially disable interactivity - will be enabled when player is near
    // Add click/touch event to open NPCPreviewScene
    sprite.on('pointerdown', () => {
      this.openNPCPreview(data);
    });

    // Start the NPC idle animation
    const animationKey = data.sprite ? `${data.sprite}-idle` : null;
    if (animationKey && this.anims.exists(animationKey)) {
      sprite.play(animationKey);
    } else if (data.sprite) {
      sprite.setTexture(data.sprite, 0);
    }

    // Ensure stored coordinates stay aligned with sprite position
    data.x = sprite.x;
    data.y = sprite.y;

    // Create interaction indicator (initially hidden)
    const indicator = this.add.sprite(data.x, data.y - 50, 'interaction-indicator');
    indicator.setVisible(false);
    indicator.setDepth(20);

    // Start the interaction indicator animation with safety check
    if (indicator.anims && this.anims.exists('interaction-indicator-anim')) {
      indicator.play('interaction-indicator-anim');
    }

    // Add floating animation to indicator
    this.tweens.add({
      targets: indicator,
      y: indicator.y - 10,
      duration: 1000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    const npcZone: NPCInteractionZone = {
      npc: data,
      sprite,
      interactionIndicator: indicator,
      isPlayerNear: false
    };

    this.npcs.push(npcZone);

    // Add NPC to minimap tracking
    this.minimap.addNPC(npcZone);

    // Add NPC to hitbox debugger
    this.npcHitboxDebugger.addNPC(npcZone);
  }

  private updateNPCInteractions(): void {
    const playerX = this.player.x;
    const playerY = this.player.y;

    this.nearbyNPC = null;

    this.npcs.forEach(npcZone => {
      // Safety check: ensure sprite is valid and active
      if (!npcZone.sprite || !npcZone.sprite.active || !npcZone.sprite.scene) {
        return;
      }

      // Use the sprite's actual position instead of stored NPC data coordinates
      const distance = Phaser.Math.Distance.Between(
        playerX, playerY,
        npcZone.sprite.x, npcZone.sprite.y
      );

      const wasNear = npcZone.isPlayerNear;
      const isNear = distance <= (npcZone.npc.interactionRadius || 80);

      npcZone.isPlayerNear = isNear;

      if (isNear) {
        this.nearbyNPC = npcZone;
        // Enable NPC interactivity when player is near (with safety check)
        if (npcZone.sprite.input) {
          npcZone.sprite.setInteractive({ useHandCursor: true });
        } else {
          // Re-enable interactivity if it was disabled
          npcZone.sprite.setInteractive({ useHandCursor: true });
        }
        if (!wasNear && npcZone.interactionIndicator) {
          npcZone.interactionIndicator.setVisible(true);
          // Restart the animation each time the player approaches
          // Safety check to ensure the animation exists before playing
          if (npcZone.interactionIndicator.anims && this.anims.exists('interaction-indicator-anim')) {
            npcZone.interactionIndicator.play('interaction-indicator-anim');
          }
        }
      } else {
        // Disable NPC interactivity when player is not near (with safety check)
        if (npcZone.sprite.input) {
          npcZone.sprite.disableInteractive();
        }
        if (wasNear && npcZone.interactionIndicator) {
          npcZone.interactionIndicator.setVisible(false);
        }
      }
    });
  }


  private handleInteraction(): void {
    if (!this.nearbyNPC || !this.nearbyNPC.npc.isInteractive) return;
    if (this.overlayActive) return;

    this.openNPCPreview(this.nearbyNPC.npc);
  }

  private openNPCPreview(npcData: NPCData): void {
    if (this.overlayActive) {
      return;
    }
    // Get the scenario template for this NPC
    const scenario = SCENARIO_TEMPLATES.find(template =>
      template.id === npcData.scenarioId
    );

    if (!scenario) return;

    const detail: ConversationOverlayOpenDetail = {
      scenario,
      playerGender: this.playerGender,
      playerPosition: { x: this.player.x, y: this.player.y }
    };

    this.overlayActive = true;
    this.setKeyboardControlsEnabled(false);
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setVelocity(0);
    emitConversationOverlayOpen(detail);
  }

  private handleOverlayClosed = () => {
    this.overlayActive = false;
    this.setKeyboardControlsEnabled(true);
  };

  private setKeyboardControlsEnabled(enabled: boolean): void {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }
    keyboard.enabled = enabled;
    if (keyboard.manager) {
      keyboard.manager.enabled = enabled;
    }
    const keyboardWithReset = keyboard as Phaser.Input.Keyboard.KeyboardPlugin & { resetKeys?: () => void };
    if (!enabled && typeof keyboardWithReset.resetKeys === 'function') {
      keyboardWithReset.resetKeys();
    }
  }
}
