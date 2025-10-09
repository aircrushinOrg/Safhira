/**
 * NPC Hitbox Debugger utility for visualizing NPC collision boundaries
 * Provides debug visualization for NPC physics bodies, sprite boundaries, and collision areas
 */
import * as Phaser from 'phaser';
import type { NPCInteractionZone } from '../../../../types/game';

export class NPCHitboxDebugger {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private npcs: NPCInteractionZone[] = [];
  private enabled: boolean = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(20); // Above most game objects for visibility
  }

  /**
   * Enable or disable the debug visualization
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      this.clear();
    } else {
      this.npcs.forEach(npcZone => {
        this.drawNPCHitbox(npcZone);
      });
    }
  }

  /**
   * Add an NPC to be tracked for debug visualization
   */
  addNPC(npcZone: NPCInteractionZone): void {
    if (!this.npcs.includes(npcZone)) {
      this.npcs.push(npcZone);
    }
  }

  /**
   * Remove an NPC from debug tracking
   */
  removeNPC(npcZone: NPCInteractionZone): void {
    const index = this.npcs.indexOf(npcZone);
    if (index >= 0) {
      this.npcs.splice(index, 1);
    }
  }

  /**
   * Clear all NPCs from debug tracking
   */
  clearNPCs(): void {
    this.npcs = [];
  }

  /**
   * Update and redraw all debug visualizations
   * Should be called every frame from the game loop
   */
  update(): void {
    if (!this.enabled || !this.graphics) return;

    // Clear previous debug graphics
    this.graphics.clear();

    // Draw hitbox for each tracked NPC
    this.npcs.forEach(npcZone => {
      this.drawNPCHitbox(npcZone);
    });
  }

  /**
   * Draw debug visualization for a single NPC
   */
  private drawNPCHitbox(npcZone: NPCInteractionZone): void {
    const npcBody = npcZone.sprite.body as Phaser.Physics.Arcade.Body;

    if (!npcBody) return;

    // 1. Draw main physics body collision rectangle (cyan)
    this.graphics.lineStyle(2, 0x00ffff, 1); // Cyan, 2px thick, full opacity
    this.graphics.strokeRect(
      npcBody.x,
      npcBody.y,
      npcBody.width,
      npcBody.height
    );

    // 2. Draw enhanced border for better visibility
    this.graphics.lineStyle(1, 0x00ffff, 1);
    this.graphics.strokeRect(
      npcBody.x - 2,
      npcBody.y - 2,
      npcBody.width + 4,
      npcBody.height + 4
    );

    // 3. Draw center point of collision area
    this.graphics.fillStyle(0x00ffff, 1);
    this.graphics.fillCircle(
      npcBody.center.x,
      npcBody.center.y,
      4
    );

    // 4. Draw sprite boundary for comparison (green, semi-transparent)
    this.graphics.lineStyle(1, 0x00ff00, 0.5);
    const spriteBounds = npcZone.sprite.getBounds();
    this.graphics.strokeRect(
      spriteBounds.x,
      spriteBounds.y,
      spriteBounds.width,
      spriteBounds.height
    );

    // 5. Draw interaction radius (orange, dashed effect)
    if (npcZone.npc.interactionRadius && npcZone.npc.interactionRadius > 0) {
      this.graphics.lineStyle(1, 0xffa500, 0.3);
      this.graphics.strokeCircle(
        npcZone.npc.x,
        npcZone.npc.y,
        npcZone.npc.interactionRadius
      );
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
    this.npcs = [];
  }

  /**
   * Get the current list of tracked NPCs
   */
  getTrackedNPCs(): NPCInteractionZone[] {
    return [...this.npcs];
  }

  /**
   * Check if debug visualization is currently enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}