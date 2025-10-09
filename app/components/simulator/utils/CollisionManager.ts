import { collisions } from '../../../../lib/simulator/collisions';

/**
 * CollisionManager handles collision detection for the game world.
 * It provides methods to check if positions are passable based on the collision map.
 */
export class CollisionManager {
  private readonly tileSize: number;
  private readonly collisionMap: number[][];

  constructor(tileSize: number = 32) {
    this.tileSize = tileSize;
    this.collisionMap = collisions;
  }

  /**
   * Checks if a specific world coordinate has a collision
   * @param x World x coordinate
   * @param y World y coordinate
   * @returns true if there's a collision, false if passable
   */
  public isColliding(x: number, y: number): boolean {
    // Convert world coordinates to tile coordinates
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);

    // Check bounds
    if (tileY < 0 || tileY >= this.collisionMap.length || tileX < 0 || tileX >= this.collisionMap[0].length) {
      return true; // Out of bounds = collision
    }

    // Check if tile has collision (246 = collision, 0 = passable)
    return this.collisionMap[tileY][tileX] === 246;
  }

  /**
   * Checks if a sprite can move to a specific position
   * @param x Target world x coordinate
   * @param y Target world y coordinate
   * @param spriteWidth Width of the sprite
   * @param spriteHeight Height of the sprite
   * @returns true if the sprite can move there, false if blocked
   */
  public canMoveToPosition(x: number, y: number, spriteWidth: number, spriteHeight: number): boolean {
    // Check if the destination tile is passable
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);

    // Check bounds first
    if (tileY < 0 || tileY >= this.collisionMap.length || tileX < 0 || tileX >= this.collisionMap[0].length) {
      return false; // Out of bounds = can't move
    }

    // Check if destination tile is passable (0 = passable, 246 = collision)
    return this.collisionMap[tileY][tileX] === 0;
  }

  /**
   * Checks if a sprite can move to a position with a simpler bounding box check
   * @param x Target world x coordinate
   * @param y Target world y coordinate
   * @param spriteWidth Width of the sprite (unused in simple version)
   * @param spriteHeight Height of the sprite (unused in simple version)
   * @returns true if the sprite can move there, false if blocked
   */
  public canMoveToPositionSimple(x: number, y: number, spriteWidth: number, spriteHeight: number): boolean {
    // Simple center point check
    return !this.isColliding(x, y);
  }

  /**
   * Gets the collision value at a specific tile coordinate
   * @param tileX Tile x coordinate
   * @param tileY Tile y coordinate
   * @returns The collision value (0 = passable, 246 = collision, or undefined if out of bounds)
   */
  public getCollisionAt(tileX: number, tileY: number): number | undefined {
    if (tileY < 0 || tileY >= this.collisionMap.length || tileX < 0 || tileX >= this.collisionMap[0].length) {
      return undefined;
    }
    return this.collisionMap[tileY][tileX];
  }

  /**
   * Converts world coordinates to tile coordinates
   * @param worldX World x coordinate
   * @param worldY World y coordinate
   * @returns Object with tileX and tileY
   */
  public worldToTile(worldX: number, worldY: number): { tileX: number; tileY: number } {
    return {
      tileX: Math.floor(worldX / this.tileSize),
      tileY: Math.floor(worldY / this.tileSize)
    };
  }

  /**
   * Converts tile coordinates to world coordinates
   * @param tileX Tile x coordinate
   * @param tileY Tile y coordinate
   * @returns Object with worldX and worldY (center of the tile)
   */
  public tileToWorld(tileX: number, tileY: number): { worldX: number; worldY: number } {
    return {
      worldX: (tileX * this.tileSize) + (this.tileSize / 2),
      worldY: (tileY * this.tileSize) + (this.tileSize / 2)
    };
  }

  /**
   * Gets the dimensions of the collision map
   * @returns Object with width and height in tiles
   */
  public getMapDimensions(): { width: number; height: number } {
    return {
      width: this.collisionMap[0]?.length || 0,
      height: this.collisionMap.length
    };
  }

  /**
   * Gets the tile size used by this collision manager
   * @returns The tile size in pixels
   */
  public getTileSize(): number {
    return this.tileSize;
  }
}