import * as Phaser from 'phaser';
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';
import { PreloadScene } from '../../app/components/game/scenes/PreloadScene';
import { TitleScene } from '../../app/components/game/scenes/TitleScene';
import { GenderSelectionScene } from '../../app/components/game/scenes/GenderSelectionScene';
import { InstructionScene } from '../../app/components/game/scenes/InstructionScene';
import { GameScene } from '../../app/components/game/scenes/GameScene';

// Base configuration for the game
const baseConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-game-container',
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [PreloadScene, TitleScene, GenderSelectionScene, InstructionScene, GameScene],
  pixelArt: true,
  render: {
    pixelArt: true,
    antialias: false,
  },
  plugins: {
    global: [
      {
        key: 'rexVirtualJoystick',
        plugin: VirtualJoystickPlugin,
        start: true,
      },
    ],
  },
};

// Function to create responsive game config
export function createGameConfig(isMobile: boolean = false): Phaser.Types.Core.GameConfig {
  const gameWidth = 800;
  const gameHeight = isMobile ? 1000 : 600;

  return {
    ...baseConfig,
    width: gameWidth,
    height: gameHeight,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: 'phaser-game-container',
      width: gameWidth,
      height: gameHeight,
    },
  };
}

export const gameConfig = createGameConfig(false);
