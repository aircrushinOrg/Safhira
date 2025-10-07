/**
 * Player Hitbox Debugger utility for visualizing player collision boundaries
 * Provides debug visualization for player hitbox, collision points, and movement bounds
 */
import * as Phaser from 'phaser';
import { PlayerHitbox } from '../utils/PlayerHitbox';

export class PlayerHitboxDebugger {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private player: Phaser.GameObjects.Sprite;
  private enabled: boolean = false;

  constructor(scene: Phaser.Scene, player: Phaser.GameObjects.Sprite) {
    this.scene = scene;
    this.player = player;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(20); // Above player (depth 10) and foreground (depth 15)
  }

  /**
   * Enable or disable the debug visualization
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.clear();
    }
  }

  /**
   * Update and redraw the player hitbox visualization
   * Should be called every frame from the game loop when enabled
   */
  update(): void {
    if (!this.enabled || !this.graphics || !this.player) return;

    // Clear previous debug graphics
    this.graphics.clear();

    // Draw hitbox visualization
    this.drawPlayerHitbox();
    this.drawCollisionCheckPoints();
  }

  /**
   * Draw the main player hitbox rectangle
   */
  private drawPlayerHitbox(): void {
    // Set yellow color for the hitbox outline
    this.graphics.lineStyle(2, 0xffff00, 1); // Yellow, 2px thick, full opacity

    // Get player position
    const playerX = this.player.x;
    const playerY = this.player.y;

    // Calculate hitbox bounds using the PlayerHitbox utility
    const bounds = PlayerHitbox.calculateBounds(playerX, playerY);

    // Draw yellow rectangle around the player hitbox
    this.graphics.strokeRect(bounds.left, bounds.top, bounds.width, bounds.height);

    // Add a border effect for better visibility
    this.graphics.lineStyle(1, 0xffff00, 0.5);
    this.graphics.strokeRect(
      bounds.left - 2,
      bounds.top - 2,
      bounds.width + 4,
      bounds.height + 4
    );
  }

  /**
   * Draw collision check points as small circles
   */
  private drawCollisionCheckPoints(): void {
    // Set yellow fill for collision points
    this.graphics.fillStyle(0xffff00, 0.8); // Yellow with some transparency

    // Get player position
    const playerX = this.player.x;
    const playerY = this.player.y;

    // Get collision check points using the PlayerHitbox utility
    const checkPoints = PlayerHitbox.getCollisionCheckPoints(playerX, playerY);

    // Draw small circles at each collision check point
    checkPoints.forEach((point, index) => {
      this.graphics.fillCircle(point.x, point.y, 3);

      // Optional: Add labels to identify each check point
      if (this.isDetailedMode()) {
        this.drawCheckPointLabel(point.x, point.y, index);
      }
    });

    // Draw center point of player
    this.graphics.fillStyle(0xff0000, 1); // Red center point
    this.graphics.fillCircle(playerX, playerY, 2);
  }

  /**
   * Draw labels for collision check points (for detailed debugging)
   */
  private drawCheckPointLabel(x: number, y: number, index: number): void {
    // Create temporary text for debugging (not recommended for production)
    const label = this.scene.add.text(x + 5, y - 5, `${index}`, {
      fontSize: '10px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 2, y: 1 }
    });
    label.setDepth(25);

    // Auto-remove after a frame to prevent memory leaks
    this.scene.time.delayedCall(16, () => {
      if (label && label.destroy) {
        label.destroy();
      }
    });
  }

  /**
   * Check if detailed debugging mode is enabled
   */
  private isDetailedMode(): boolean {
    // Could be controlled by a flag or game setting
    return false; // Disable by default to avoid clutter
  }

  /**
   * Clear all debug graphics
   */
  clear(): void {
    if (this.graphics) {
      this.graphics.clear();
    }
  }

  /**
   * Destroy the debugger and clean up resources
   */
  destroy(): void {
    this.clear();
    if (this.graphics) {
      this.graphics.destroy();
    }
  }

  /**
   * Check if debug visualization is currently enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get the current player bounds for external use
   */
  getCurrentBounds(): { left: number; top: number; width: number; height: number } {
    return PlayerHitbox.calculateBounds(this.player.x, this.player.y);
  }

  /**
   * Get current collision check points for external use
   */
  getCurrentCheckPoints(): { x: number; y: number }[] {
    return PlayerHitbox.getCollisionCheckPoints(this.player.x, this.player.y);
  }

  /**
   * Enable/disable detailed mode with check point labels
   */
  setDetailedMode(enabled: boolean): void {
    // Future implementation for toggling detailed debugging
  }
}