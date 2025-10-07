/**
 * Collision Debugger utility for visualizing collision tiles on the map
 * Provides debug visualization for collision boundaries and blocked areas
 */
import * as Phaser from 'phaser';
import type { CollisionManager } from '../utils/CollisionManager';

export class CollisionDebugger {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private collisionManager: CollisionManager;
  private enabled: boolean = false;

  constructor(scene: Phaser.Scene, collisionManager: CollisionManager) {
    this.scene = scene;
    this.collisionManager = collisionManager;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(5); // Above map but below player
  }

  /**
   * Enable or disable the debug visualization
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.clear();
    } else {
      this.drawCollisionTiles();
    }
  }

  /**
   * Draw all collision tiles with red overlay
   */
  private drawCollisionTiles(): void {
    if (!this.enabled || !this.graphics) return;

    // Clear previous debug graphics
    this.graphics.clear();

    // Get collision map dimensions and tile size
    const mapDimensions = this.collisionManager.getMapDimensions();
    const tileSize = this.collisionManager.getTileSize();

    // Set red color with transparency
    this.graphics.fillStyle(0xff0000, 0.5);

    // Loop through all tiles and draw red squares for collision tiles
    for (let y = 0; y < mapDimensions.height; y++) {
      for (let x = 0; x < mapDimensions.width; x++) {
        const collisionValue = this.collisionManager.getCollisionAt(x, y);
        if (collisionValue === 246) { // Collision tile
          // Convert tile coordinates to world coordinates
          const worldX = x * tileSize;
          const worldY = y * tileSize;

          // Draw red square
          this.graphics.fillRect(worldX, worldY, tileSize, tileSize);
        }
      }
    }
  }

  /**
   * Update the collision debug visualization
   * Call this if collision data changes or needs refresh
   */
  update(): void {
    if (this.enabled) {
      this.drawCollisionTiles();
    }
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
   * Get collision manager instance
   */
  getCollisionManager(): CollisionManager {
    return this.collisionManager;
  }

  /**
   * Get statistics about collision tiles
   */
  getCollisionStats(): { totalTiles: number; collisionTiles: number; percentage: number } {
    const mapDimensions = this.collisionManager.getMapDimensions();
    const totalTiles = mapDimensions.width * mapDimensions.height;
    let collisionTiles = 0;

    for (let y = 0; y < mapDimensions.height; y++) {
      for (let x = 0; x < mapDimensions.width; x++) {
        const collisionValue = this.collisionManager.getCollisionAt(x, y);
        if (collisionValue === 246) {
          collisionTiles++;
        }
      }
    }

    return {
      totalTiles,
      collisionTiles,
      percentage: (collisionTiles / totalTiles) * 100
    };
  }
}