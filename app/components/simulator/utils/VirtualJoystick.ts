/**
 * This file defines a VirtualJoystick class for a Phaser-based game.
 * It provides a simple on-screen joystick for touch input, allowing players to control movement.
 * It calculates the force and angle of the joystick based on user interaction.
 */
import * as Phaser from 'phaser';
import { JoystickConfig } from '@/types/game';

export class VirtualJoystick {
  private scene: Phaser.Scene;
  private config: JoystickConfig;
  private joystick: any = null;
  private created: boolean = false;

  constructor(scene: Phaser.Scene, config: JoystickConfig) {
    this.scene = scene;
    this.config = config;
  }

  create(): void {
    // Only create once to prevent duplicate joysticks
    if (!this.created) {
      this.createSimpleJoystick();
      this.created = true;
    }
  }

  private createSimpleJoystick(): void {
    const { x: baseX, y: baseY, radius, forceMin } = this.config;

    const base = this.scene.add.circle(baseX, baseY, radius, 0x7FA3FF, 0.5);
    const thumb = this.scene.add.circle(baseX, baseY, radius / 2, 0xD8E3FF, 0.9);

    base.setScrollFactor(0);
    thumb.setScrollFactor(0);
    base.setDepth(1000);
    thumb.setDepth(1001);

    let isDragging = false;
    let currentAngle = 0;
    let currentForce = 0;

    // Make both base and thumb interactive
    base.setInteractive({ draggable: true });
    thumb.setInteractive({ draggable: true });

    // Use local event listeners for better touch handling
    const onPointerDown = (pointer: Phaser.Input.Pointer) => {
      // Use screen coordinates since joystick is fixed to camera
      const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, baseX, baseY);

      if (distance < radius * 1.5) { // Slightly larger hit area
        isDragging = true;
        updateJoystick(pointer);
      }
    };

    const updateJoystick = (pointer: Phaser.Input.Pointer) => {
      // Calculate angle and distance using screen coordinates
      const dx = pointer.x - baseX;
      const dy = pointer.y - baseY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate angle in DEGREES using atan2, then convert to degrees
      // atan2 returns radians from -PI to PI
      const angleRad = Math.atan2(dy, dx);
      currentAngle = Phaser.Math.RadToDeg(angleRad); // Convert to degrees
      
      // Clamp distance to radius
      const clampedDistance = Math.min(distance, radius);
      currentForce = clampedDistance;

      // Update thumb position (still use radians for cos/sin)
      thumb.x = baseX + Math.cos(angleRad) * clampedDistance;
      thumb.y = baseY + Math.sin(angleRad) * clampedDistance;
    };

    const onPointerMove = (pointer: Phaser.Input.Pointer) => {
      if (isDragging) {
        updateJoystick(pointer);
      }
    };

    const onPointerUp = () => {
      if (isDragging) {
        isDragging = false;
        thumb.x = baseX;
        thumb.y = baseY;
        currentForce = 0;
        currentAngle = 0;
      }
    };

    // Add event listeners to scene input
    this.scene.input.on('pointerdown', onPointerDown);
    this.scene.input.on('pointermove', onPointerMove);
    this.scene.input.on('pointerup', onPointerUp);

    // Create joystick interface compatible with plugin version
    // Use getters to always return current values from closure
    this.joystick = {
      base,
      thumb,
      get force() {
        if (!isDragging || currentForce <= forceMin) return 0;
        return Math.min(currentForce / radius, 1);
      },
      get angle() {
        return currentAngle;
      },
      get forceX() {
        if (!isDragging || currentForce <= forceMin) return 0;
        const normalizedForce = Math.min(currentForce / radius, 1);
        return Math.cos(currentAngle) * normalizedForce;
      },
      get forceY() {
        if (!isDragging || currentForce <= forceMin) return 0;
        const normalizedForce = Math.min(currentForce / radius, 1);
        return Math.sin(currentAngle) * normalizedForce;
      },
      isDragging: () => isDragging,
      // Keep update for compatibility but it's not needed with getters
      update: () => {
        // No-op, values are always fresh via getters
      }
    };
  }

  getForce(): number {
    if (!this.joystick) return 0;

    // Update simple joystick values
    if (typeof this.joystick.update === 'function') {
      this.joystick.update();
    }

    // Handle both plugin joystick and simple joystick
    if (typeof this.joystick.force === 'number') {
      return this.joystick.force;
    } else if (typeof this.joystick.force === 'function') {
      return this.joystick.force();
    } else if (this.joystick.forceX !== undefined && this.joystick.forceY !== undefined) {
      // Plugin joystick has forceX and forceY properties
      return Math.sqrt(this.joystick.forceX * this.joystick.forceX + this.joystick.forceY * this.joystick.forceY);
    }

    return 0;
  }

  getAngle(): number {
    if (!this.joystick) return 0;

    // Update simple joystick values
    if (typeof this.joystick.update === 'function') {
      this.joystick.update();
    }

    // Handle both plugin joystick and simple joystick
    if (typeof this.joystick.angle === 'number') {
      return this.joystick.angle;
    } else if (typeof this.joystick.angle === 'function') {
      const angle = this.joystick.angle();
      return angle;
    }

    return 0;
  }

  // Get X component of the force vector (for horizontal movement)
  getForceX(): number {
    if (!this.joystick) return 0;

    // Update simple joystick values
    if (typeof this.joystick.update === 'function') {
      this.joystick.update();
    }

    if (this.joystick.forceX !== undefined) {
      return this.joystick.forceX;
    }

    // Calculate from angle and force
    const force = this.getForce();
    const angle = this.getAngle();
    return Math.cos(angle) * force;
  }

  // Get Y component of the force vector (for vertical movement)
  getForceY(): number {
    if (!this.joystick) return 0;

    // Update simple joystick values
    if (typeof this.joystick.update === 'function') {
      this.joystick.update();
    }

    if (this.joystick.forceY !== undefined) {
      return this.joystick.forceY;
    }

    // Calculate from angle and force
    const force = this.getForce();
    const angle = this.getAngle();
    return Math.sin(angle) * force;
  }

  isActive(): boolean {
    return this.getForce() > (this.config.forceMin / this.config.radius);
  }

  // Getter for raw joystick object if needed
  getRawJoystick(): any {
    return this.joystick;
  }
}