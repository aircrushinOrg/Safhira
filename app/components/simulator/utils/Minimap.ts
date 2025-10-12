/**
 * This file defines a Minimap class for a Phaser-based game.
 * It creates a minimap that displays the player's position and the main camera's viewport.
 * The minimap includes a background, border, player indicator, and viewport rectangle.
 * It also handles updating the minimap elements based on player movement and camera changes.
 */
import * as Phaser from 'phaser';
import { MinimapConfig, NPCInteractionZone } from '@/types/game';

export class Minimap {
  private scene: Phaser.Scene;
  private config: MinimapConfig;
  private camera!: Phaser.Cameras.Scene2D.Camera;
  private background!: Phaser.GameObjects.Rectangle;
  private border!: Phaser.GameObjects.Graphics;
  private playerDot!: Phaser.GameObjects.Text;
  private viewportRect!: Phaser.GameObjects.Graphics;
  private player: Phaser.GameObjects.Sprite;
  private joystick?: any;
  private npcDots: Phaser.GameObjects.Text[] = [];
  private trackedNPCs: NPCInteractionZone[] = [];

  constructor(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite, config: MinimapConfig, joystick?: any) {
    this.scene = scene;
    this.player = player;
    this.config = config;
    this.joystick = joystick;
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
    // Create viewport rectangle that shows main camera view on minimap
    this.viewportRect = this.scene.add.graphics();
    this.viewportRect.setDepth(999); // Below player dot layer
  }

  private createPlayerDot(): void {
    // Create player indicator (red dot) that the minimap camera will render
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
    this.playerDot.setDepth(1001); // Above other layers in minimap
  }

  private setupCameraIgnoreRules(): void {
    // Build list of objects to ignore in minimap camera
    const ignoreList = [
      this.background,
      this.border,
      this.player,
    ];

    // Add joystick objects if joystick exists
    if (this.joystick && this.joystick.base && this.joystick.thumb) {
      ignoreList.push(this.joystick.base, this.joystick.thumb);
    }

    // Add NPC sprites to ignore list (we don't want them visible on minimap, only dots)
    this.trackedNPCs.forEach(npcZone => {
      ignoreList.push(npcZone.sprite);
      if (npcZone.interactionIndicator) {
        ignoreList.push(npcZone.interactionIndicator);
      }
    });

    // Ignore UI elements in minimap camera
    this.camera.ignore(ignoreList);

    // Make the main camera ignore minimap-only objects
    const mainCameraIgnoreList = [
      this.playerDot,
      this.viewportRect,
      ...this.npcDots
    ];

    this.scene.cameras.main.ignore(mainCameraIgnoreList);
  }

  update(): void {
    this.updatePlayerDot();
    this.updateNPCDots();
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

  // Getter methods
  getCamera(): Phaser.Cameras.Scene2D.Camera {
    return this.camera;
  }

  getPlayerDot(): Phaser.GameObjects.Text {
    return this.playerDot;
  }

  getViewportRect(): Phaser.GameObjects.Graphics {
    return this.viewportRect;
  }

  // Method to ignore menu button in minimap camera
  ignoreMenuButton(menuButton: Phaser.GameObjects.Text): void {
    if (this.camera && menuButton) {
      this.camera.ignore(menuButton);
    }
  }

  // Method to ignore minimap instruction in minimap camera
  ignoreMinimapInstruction(instructionText: Phaser.GameObjects.Text): void {
    if (this.camera && instructionText) {
      this.camera.ignore(instructionText);
    }
  }

  // Method to ignore minimap hint icon in minimap camera
  ignoreMinimapHintIcon(hintIcon: Phaser.GameObjects.Image): void {
    if (this.camera && hintIcon) {
      this.camera.ignore(hintIcon);
    }
  }

  // NPC tracking methods
  addNPC(npcZone: NPCInteractionZone): void {
    // Add NPC to tracking list
    this.trackedNPCs.push(npcZone);

    // Create yellow dot for this NPC
    const npcDot = this.scene.add.text(
      npcZone.npc.x,
      npcZone.npc.y,
      '●',
      {
        fontSize: '128px',
        color: '#ffdd00ff', // Yellow color
        stroke: '#ffffffff', // White outline
        strokeThickness: 24,
      }
    );
    npcDot.setOrigin(0.5, 0.5);
    npcDot.setDepth(1000); // Same depth as player dot

    this.npcDots.push(npcDot);

    // Update camera ignore rules to hide the actual NPC sprite but show the dot
    if (this.camera) {
      this.camera.ignore([npcZone.sprite]);
      if (npcZone.interactionIndicator) {
        this.camera.ignore([npcZone.interactionIndicator]);
      }

      // Make main camera ignore the NPC dot
      this.scene.cameras.main.ignore([npcDot]);
    }
  }

  private updateNPCDots(): void {
    // Update positions of all NPC dots to match their NPCs
    this.npcDots.forEach((dot, index) => {
      if (index < this.trackedNPCs.length) {
        const npc = this.trackedNPCs[index];
        dot.setPosition(npc.npc.x, npc.npc.y);
      }
    });
  }

  removeNPC(npcZone: NPCInteractionZone): void {
    const index = this.trackedNPCs.findIndex(tracked => tracked === npcZone);
    if (index >= 0) {
      // Remove from tracking list
      this.trackedNPCs.splice(index, 1);

      // Remove and destroy the corresponding dot
      if (this.npcDots[index]) {
        this.npcDots[index].destroy();
        this.npcDots.splice(index, 1);
      }
    }
  }

  // Get all tracked NPCs
  getTrackedNPCs(): NPCInteractionZone[] {
    return [...this.trackedNPCs];
  }
}