/**
 * This file defines the configuration for a Phaser-based game. 
 * It sets up the game's scenes, scaling, input handling, and plugins to ensure optimal performance across different devices and screen sizes.
 */
import * as Phaser from 'phaser';
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js';
import { PreloadScene } from '../../app/components/simulator/scenes/PreloadScene';
import { TitleScene } from '../../app/components/simulator/scenes/TitleScene';
import { GenderSelectionScene } from '../../app/components/simulator/scenes/GenderSelectionScene';
import { InstructionScene } from '../../app/components/simulator/scenes/InstructionScene';
import { GameScene } from '../../app/components/simulator/scenes/GameScene';
import { NPCPreviewScene } from '../../app/components/simulator/scenes/NPCPreviewScene';
import { ConversationScene } from '../../app/components/simulator/scenes/ConversationScene';

// Base configuration for the game
const baseConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'phaser-simulator-container',
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [PreloadScene, TitleScene, GenderSelectionScene, InstructionScene, GameScene, NPCPreviewScene, ConversationScene],
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
export function createGameConfig(): Phaser.Types.Core.GameConfig {
  return {
    ...baseConfig,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: 'phaser-simulator-container',
      width: '100%',
      height: '100%',
      fullscreenTarget: 'phaser-simulator-container',
      expandParent: true,
    },
    input: {
      // Allow page scrolling by preventing default on certain events
      windowEvents: false,
      mouse: {
        preventDefaultWheel: false,
      },
    },
    dom: {
      createContainer: true,
    },
  };
}

export const gameConfig = createGameConfig();
