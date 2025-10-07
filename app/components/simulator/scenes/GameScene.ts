/**
 * This file defines the GameScene class for a Phaser-based game.
 * It sets up the main game scene with player movement, camera control, minimap, and input handling.
 * The scene supports both keyboard and touch input, including a virtual joystick for mobile devices.
 */
import * as Phaser from 'phaser';
import type { PlayerGender, Direction } from '../../../../types/game';
import { Minimap } from '../nav/Minimap';
import { VirtualJoystick } from '../nav/VirtualJoystick';
import { CollisionManager } from '../utils/CollisionManager';

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
  private playerSpeed = 160;
  private isMoving = false;
  private virtualJoystick?: VirtualJoystick;
  private isTouchDevice = false;
  private minimap!: Minimap;
  private menuButton!: Phaser.GameObjects.Text;
  private preservedPosition?: { x: number; y: number };
  private collisionManager: CollisionManager;
  private lastSafePosition: { x: number; y: number } = { x: 0, y: 0 };
  private collisionDebugGraphics?: Phaser.GameObjects.Graphics;
  private playerHitboxDebugGraphics?: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'GameScene' });
    this.collisionManager = new CollisionManager(32); // 32px tile size
  }

  init(data: { playerGender?: PlayerGender; preservedPosition?: { x: number; y: number } }) {
    this.playerGender = data.playerGender || 'boy';
    this.preservedPosition = data.preservedPosition;
    // Detect if touch device
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
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
    this.createMenuButton();

    // Create collision debug visualization
    this.createCollisionDebug();

    // Create player hitbox debug visualization
    this.createPlayerHitboxDebug();

    // Update minimap to ignore menu button
    this.minimap.ignoreMenuButton(this.menuButton);
  }

  private createMenuButton(): void {
    // Create menu button in top-right corner
    this.menuButton = this.add.text(
      this.cameras.main.width - 20,
      20,
      'MENU',
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

  private createCollisionDebug(): void {
    // Create graphics object for collision debug visualization
    this.collisionDebugGraphics = this.add.graphics();
    this.collisionDebugGraphics.setDepth(5); // Above map but below player

    // Get collision map dimensions and tile size
    const mapDimensions = this.collisionManager.getMapDimensions();
    const tileSize = this.collisionManager.getTileSize();

    // Set red color with some transparency
    this.collisionDebugGraphics.fillStyle(0xff0000, 0.5);

    // Loop through all tiles and draw red squares for collision tiles
    for (let y = 0; y < mapDimensions.height; y++) {
      for (let x = 0; x < mapDimensions.width; x++) {
        const collisionValue = this.collisionManager.getCollisionAt(x, y);
        if (collisionValue === 246) { // Collision tile
          // Convert tile coordinates to world coordinates
          const worldX = x * tileSize;
          const worldY = y * tileSize;

          // Draw red square
          this.collisionDebugGraphics.fillRect(worldX, worldY, tileSize, tileSize);
        }
      }
    }
  }

  private createPlayerHitboxDebug(): void {
    // Create graphics object for player hitbox debug visualization
    this.playerHitboxDebugGraphics = this.add.graphics();
    this.playerHitboxDebugGraphics.setDepth(20); // Above player (depth 10) and foreground (depth 15)
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


  update() {
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    // Reset velocity
    playerBody.setVelocity(0);
    this.isMoving = false;

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

    // Update player hitbox debug visualization
    this.updatePlayerHitboxDebug();

    // Update minimap
    this.minimap.update();
  }

  private updatePlayerHitboxDebug(): void {
    if (!this.playerHitboxDebugGraphics) return;

    // Clear previous debug graphics
    this.playerHitboxDebugGraphics.clear();

    // Set yellow color with transparency for the hitbox outline
    this.playerHitboxDebugGraphics.lineStyle(2, 0xffff00, 1); // Yellow, 2px thick, full opacity

    // Get player position
    const playerX = this.player.x;
    const playerY = this.player.y;

    // Define the same hitbox dimensions as used in collision detection
    const hitboxExpansion = 20;

    // Calculate hitbox bounds based on the collision detection logic
    const hitboxLeft = playerX - hitboxExpansion;
    const hitboxRight = playerX + hitboxExpansion;
    const hitboxTop = playerY + 12 - hitboxExpansion;
    const hitboxBottom = playerY + 28 + hitboxExpansion;

    // Draw yellow rectangle around the player hitbox
    const hitboxWidth = hitboxRight - hitboxLeft;
    const hitboxHeight = hitboxBottom - hitboxTop;
    this.playerHitboxDebugGraphics.strokeRect(hitboxLeft, hitboxTop, hitboxWidth, hitboxHeight);

    // Also draw small circles at the collision check points for reference
    this.playerHitboxDebugGraphics.fillStyle(0xffff00, 0.8); // Yellow with some transparency
    const checkPoints = [
      { x: playerX, y: playerY + 20}, // Center
      { x: playerX - hitboxExpansion, y: playerY + 20}, // Left
      { x: playerX + hitboxExpansion, y: playerY + 20}, // Right
      { x: playerX, y: playerY + 12 - hitboxExpansion }, // Top
      { x: playerX, y: playerY + 28 + hitboxExpansion }, // Bottom
      { x: playerX - hitboxExpansion, y: playerY + 12 - hitboxExpansion }, // Top-Left
      { x: playerX + hitboxExpansion, y: playerY + 12 - hitboxExpansion }, // Top-Right
      { x: playerX - hitboxExpansion, y: playerY + 28 + hitboxExpansion }, // Bottom-Left
      { x: playerX + hitboxExpansion, y: playerY + 28 + hitboxExpansion }, // Bottom-Right
    ];

    checkPoints.forEach(point => {
      this.playerHitboxDebugGraphics!.fillCircle(point.x, point.y, 3);
    });
  }

  private isPlayerInCollision(): boolean {
    // Create an expanded hitbox around the player
    const hitboxExpansion = 20; // Pixels to expand the hitbox
    const playerX = this.player.x;
    const playerY = this.player.y;

    // Check multiple points around the player to create a larger collision area
    const checkPoints = [
      { x: playerX, y: playerY + 20}, // Center
      { x: playerX - hitboxExpansion, y: playerY + 20}, // Left
      { x: playerX + hitboxExpansion, y: playerY + 20}, // Right
      { x: playerX, y: playerY + 12 - hitboxExpansion }, // Top
      { x: playerX, y: playerY + 28 + hitboxExpansion }, // Bottom
      { x: playerX - hitboxExpansion, y: playerY + 12 - hitboxExpansion }, // Top-Left
      { x: playerX + hitboxExpansion, y: playerY + 12 - hitboxExpansion }, // Top-Right
      { x: playerX - hitboxExpansion, y: playerY + 28 + hitboxExpansion }, // Bottom-Left
      { x: playerX + hitboxExpansion, y: playerY + 28 + hitboxExpansion }, // Bottom-Right
    ];

    // If any check point is in a collision, consider the player colliding
    return checkPoints.some(point => this.collisionManager.isColliding(point.x, point.y));
  }
}
