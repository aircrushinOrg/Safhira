/**
 * This file defines the GameScene class for a Phaser-based game.
 * It sets up the main game scene with player movement, camera control, minimap, and input handling.
 * The scene supports both keyboard and touch input, including a virtual joystick for mobile devices.
 */
import * as Phaser from 'phaser';
import type { PlayerGender, Direction } from '../../../../types/game';
import { Minimap } from '../nav/Minimap';
import { VirtualJoystick } from '../nav/VirtualJoystick';

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

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { playerGender?: PlayerGender; preservedPosition?: { x: number; y: number } }) {
    this.playerGender = data.playerGender || 'boy';
    this.preservedPosition = data.preservedPosition;
    // Detect if touch device
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    console.log('Touch device detected:', this.isTouchDevice);
    if (this.preservedPosition) {
      console.log('GameScene: Preserving player position:', this.preservedPosition);
    }
  }

  create() {
    // Add the map (no auto-scaling to prevent zoom issues)
    const map = this.add.image(0, 0, 'map').setOrigin(0, 0);

    // Set world bounds to actual map size
    this.physics.world.setBounds(0, 0, map.width, map.height);

    // Create animations BEFORE creating the player sprite
    this.createPlayerAnimations();

    // Create player sprite at starting position (center of map or preserved position)
    const startX = this.preservedPosition?.x || map.width / 2;
    const startY = this.preservedPosition?.y || map.height / 2;
    this.player = this.add.sprite(startX, startY, `player-${this.playerGender}-down`);
    this.player.setScale(1.5); // Make player slightly bigger
    this.player.setDepth(10); // Ensure player is above the map

    // Play initial idle frame
    this.player.play(`${this.playerGender}-idle-down`);

    // Enable physics for player
    this.physics.add.existing(this.player);
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setCollideWorldBounds(true);

    // Log position restoration if applicable
    if (this.preservedPosition) {
      console.log('GameScene: Player position restored to:', { x: startX, y: startY });
    }

    // Setup camera to follow player with smooth following
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, map.width, map.height);

    // Reset camera zoom to 1 (no zoom)
    this.cameras.main.setZoom(1);

    // Create minimap
    this.minimap = new Minimap(this, this.player, {
      width: 200,
      height: 150,
      padding: 10,
      zoom: 0.1
    });
    this.minimap.create(map);

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
        x: this.cameras.main.width - 80,
        y: this.cameras.main.height - 120,
        radius: 65,
        forceMin: 16
      });
      this.virtualJoystick.create();
    }

    // Create menu button
    this.createMenuButton();
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

        console.log('Joystick active:', { 
          angleDeg: degrees, 
          isActive,
          forceX: this.virtualJoystick.getForceX(),
          forceY: this.virtualJoystick.getForceY()
        });

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

    // Update minimap
    this.minimap.update();
  }

}
