/**
 * This file defines a Minimap class for a Phaser-based game.
 * It creates a minimap that displays the player's position and the main camera's viewport.
 * The minimap includes a background, border, player indicator, and viewport rectangle.
 * It also handles updating the minimap elements based on player movement and camera changes.
 */
import * as Phaser from 'phaser';
import { MinimapConfig } from '@/types/game';

export class Minimap {
  private scene: Phaser.Scene;
  private config: MinimapConfig;
  private camera!: Phaser.Cameras.Scene2D.Camera;
  private background!: Phaser.GameObjects.Rectangle;
  private border!: Phaser.GameObjects.Graphics;
  private playerDot!: Phaser.GameObjects.Text;
  private viewportRect!: Phaser.GameObjects.Graphics;
  private player: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite, config: MinimapConfig) {
    this.scene = scene;
    this.player = player;
    this.config = config;
  }

  create(map: Phaser.GameObjects.Image): void {
    const { width: minimapWidth, height: minimapHeight, padding, zoom } = this.config;

    this.createBackground();
    this.createCamera(map, minimapWidth, minimapHeight, padding, zoom);
    this.createBorder(minimapWidth, minimapHeight, padding);
    this.createViewportRect();
    this.createPlayerDot();
    this.setupCameraIgnoreRules();
  }

  private createBackground(): void {
    const { width: minimapWidth, height: minimapHeight, padding } = this.config;

    this.background = this.scene.add.rectangle(
      padding,
      padding,
      minimapWidth,
      minimapHeight,
      0x000000,
      0.9
    );
    this.background.setOrigin(0);
    this.background.setScrollFactor(0);
    this.background.setDepth(999);
  }

  private createCamera(map: Phaser.GameObjects.Image, minimapWidth: number, minimapHeight: number, padding: number, zoom: number): void {
    // Create minimap camera (shows larger area around player)
    this.camera = this.scene.cameras.add(
      padding,
      padding,
      minimapWidth,
      minimapHeight
    );
    this.camera.setZoom(zoom);
    this.camera.setBounds(0, 0, map.width, map.height);
    this.camera.setBackgroundColor(0x0a0a0a);

    // Follow player
    this.camera.startFollow(this.player, true, 0.1, 0.1);

    // Semi-transparent visual effects to simplify the minimap view
    this.camera.setAlpha(0.7);
  }

  private createBorder(minimapWidth: number, minimapHeight: number, padding: number): void {
    // White border around minimap
    this.border = this.scene.add.graphics();
    this.border.lineStyle(3, 0xffffff, 1);
    this.border.strokeRect(padding - 1, padding - 1, minimapWidth + 2, minimapHeight + 2);
    this.border.setScrollFactor(0);
    this.border.setDepth(1002);
  }

  private createViewportRect(): void {
    // Create viewport rectangle as a world object that shows main camera view on minimap
    this.viewportRect = this.scene.add.graphics();
    this.viewportRect.setDepth(999); // Below player dot layer
  }

  private createPlayerDot(): void {
    // Create player indicator (red dot) as a world object that the minimap camera will render
    this.playerDot = this.scene.add.text(
      this.player.x,
      this.player.y,
      '●', 
      {
        fontSize: '128px',
        color: '#ff2525ff',
        stroke: '#ffffffff',
        strokeThickness: 24,
      }
    );
    this.playerDot.setOrigin(0.5, 0.5); // Center the player indicator to match player
    this.playerDot.setDepth(1000); // Above other layers in minimap
  }

  private setupCameraIgnoreRules(): void {
    // Ignore some main camera UI elements in minimap camera 
    this.camera.ignore([
      this.background,
      this.border,
      this.player, // Ignore main player sprite to avoid duplication
    ]);

    // Make the main camera ignore minimap-only objects
    this.scene.cameras.main.ignore([
      this.playerDot,
      this.viewportRect,
    ]);
  }

  update(): void {
    this.updatePlayerDot();
    this.updateViewportRect();
  }

  private updatePlayerDot(): void {
    // Update player dot position to match the player's world position
    this.playerDot.setPosition(this.player.x, this.player.y);
  }

  private updateViewportRect(): void {
    // Update viewport rectangle to show main camera's view area
    const mainCam = this.scene.cameras.main;

    // Get main camera's viewport in world coordinates
    const viewportX = mainCam.scrollX;
    const viewportY = mainCam.scrollY;
    const viewportWidth = mainCam.width;
    const viewportHeight = mainCam.height;

    // Clear previous rectangle and draw new one
    this.viewportRect.clear();
    this.viewportRect.lineStyle(10, 0x00ff00, 1.0); // Green outline
    this.viewportRect.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);

    // Add semi-transparent fill
    this.viewportRect.fillStyle(0x00ff00, 0.1);
    this.viewportRect.fillRect(viewportX, viewportY, viewportWidth, viewportHeight);
  }

  // Getter methods for accessing private properties if needed
  getCamera(): Phaser.Cameras.Scene2D.Camera {
    return this.camera;
  }

  getPlayerDot(): Phaser.GameObjects.Text {
    return this.playerDot;
  }

  getViewportRect(): Phaser.GameObjects.Graphics {
    return this.viewportRect;
  }
}