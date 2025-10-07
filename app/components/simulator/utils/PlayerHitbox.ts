/**
 * PlayerHitbox utility class for managing player collision boundaries
 * Centralizes hitbox calculations to avoid code duplication
 */
export class PlayerHitbox {
  private static readonly HITBOX_EXPANSION = 20;
  private static readonly CENTER_Y_OFFSET = 20;
  private static readonly TOP_Y_OFFSET = 12;
  private static readonly BOTTOM_Y_OFFSET = 28;

  /**
   * Calculate all hitbox boundaries for the player
   * @param playerX Player's X position
   * @param playerY Player's Y position
   * @returns Object containing all hitbox boundary coordinates
   */
  public static calculateBounds(playerX: number, playerY: number) {
    return {
      left: playerX - this.HITBOX_EXPANSION,
      right: playerX + this.HITBOX_EXPANSION,
      top: playerY + this.TOP_Y_OFFSET - this.HITBOX_EXPANSION,
      bottom: playerY + this.BOTTOM_Y_OFFSET + this.HITBOX_EXPANSION,
      width: this.HITBOX_EXPANSION * 2,
      height: (this.BOTTOM_Y_OFFSET + this.HITBOX_EXPANSION) - (this.TOP_Y_OFFSET - this.HITBOX_EXPANSION)
    };
  }

  /**
   * Generate all collision check points for the player hitbox
   * @param playerX Player's X position
   * @param playerY Player's Y position
   * @returns Array of points to check for collisions
   */
  public static getCollisionCheckPoints(playerX: number, playerY: number) {
    return [
      { x: playerX, y: playerY + this.CENTER_Y_OFFSET }, // Center
      { x: playerX - this.HITBOX_EXPANSION, y: playerY + this.CENTER_Y_OFFSET }, // Left
      { x: playerX + this.HITBOX_EXPANSION, y: playerY + this.CENTER_Y_OFFSET }, // Right
      { x: playerX, y: playerY + this.TOP_Y_OFFSET - this.HITBOX_EXPANSION }, // Top
      { x: playerX, y: playerY + this.BOTTOM_Y_OFFSET + this.HITBOX_EXPANSION }, // Bottom
      { x: playerX - this.HITBOX_EXPANSION, y: playerY + this.TOP_Y_OFFSET - this.HITBOX_EXPANSION }, // Top-Left
      { x: playerX + this.HITBOX_EXPANSION, y: playerY + this.TOP_Y_OFFSET - this.HITBOX_EXPANSION }, // Top-Right
      { x: playerX - this.HITBOX_EXPANSION, y: playerY + this.BOTTOM_Y_OFFSET + this.HITBOX_EXPANSION }, // Bottom-Left
      { x: playerX + this.HITBOX_EXPANSION, y: playerY + this.BOTTOM_Y_OFFSET + this.HITBOX_EXPANSION }, // Bottom-Right
    ];
  }

  /**
   * Get the hitbox expansion value
   * @returns The hitbox expansion in pixels
   */
  public static getExpansion(): number {
    return this.HITBOX_EXPANSION;
  }
}