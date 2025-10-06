import * as Phaser from 'phaser';
import { JoystickConfig } from '@/types/game';

export class VirtualJoystick {
  private scene: Phaser.Scene;
  private config: JoystickConfig;
  private joystick: any = null;

  constructor(scene: Phaser.Scene, config: JoystickConfig) {
    this.scene = scene;
    this.config = config;
  }

  create(): void {
    const joyStickPlugin = this.scene.plugins.get('rexVirtualJoystick') as any;

    if (!joyStickPlugin) {
      // Fallback: Create simple touch controls without plugin
      this.createSimpleJoystick();
      return;
    }

    this.createPluginJoystick(joyStickPlugin);
  }

  private createPluginJoystick(joyStickPlugin: any): void {
    const { x, y, radius, forceMin } = this.config;

    this.joystick = joyStickPlugin.add(this.scene, {
      x,
      y,
      radius,
      base: this.scene.add.circle(0, 0, radius, 0x888888, 0.5),
      thumb: this.scene.add.circle(0, 0, radius / 2, 0xcccccc, 0.8),
      forceMin,
    });

    // Make joystick fixed to screen (not world)
    this.joystick.base.setScrollFactor(0);
    this.joystick.thumb.setScrollFactor(0);
    this.joystick.setScrollFactor(0);
    this.joystick.base.setDepth(1000);
    this.joystick.thumb.setDepth(1001);
  }

  private createSimpleJoystick(): void {
    const { x: baseX, y: baseY, radius, forceMin } = this.config;

    const base = this.scene.add.circle(baseX, baseY, radius, 0x7FA3FF, 0.7);
    const thumb = this.scene.add.circle(baseX, baseY, radius / 2, 0xD8E3FF, 0.9);

    base.setScrollFactor(0);
    thumb.setScrollFactor(0);
    base.setDepth(1000);
    thumb.setDepth(1001);

    let isDragging = false;

    base.setInteractive();

    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, baseX, baseY);
      if (distance < radius) {
        isDragging = true;
      }
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (isDragging) {
        const angle = Phaser.Math.Angle.Between(baseX, baseY, pointer.x, pointer.y);
        const distance = Math.min(Phaser.Math.Distance.Between(pointer.x, pointer.y, baseX, baseY), radius);
        thumb.x = baseX + Math.cos(angle) * distance;
        thumb.y = baseY + Math.sin(angle) * distance;
      }
    });

    this.scene.input.on('pointerup', () => {
      isDragging = false;
      thumb.x = baseX;
      thumb.y = baseY;
    });

    // Create joystick interface compatible with plugin version
    this.joystick = {
      base,
      thumb,
      force: () => {
        const dx = thumb.x - baseX;
        const dy = thumb.y - baseY;
        return Math.sqrt(dx * dx + dy * dy);
      },
      angle: () => {
        return Phaser.Math.Angle.Between(baseX, baseY, thumb.x, thumb.y);
      },
    };
  }

  getForce(): number {
    if (!this.joystick) return 0;
    return this.joystick.force ? this.joystick.force() : 0;
  }

  getAngle(): number {
    if (!this.joystick) return 0;
    return this.joystick.angle ? this.joystick.angle() : 0;
  }

  isActive(): boolean {
    return this.getForce() > this.config.forceMin;
  }

  // Getter for raw joystick object if needed
  getRawJoystick(): any {
    return this.joystick;
  }
}