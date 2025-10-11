/**
 * This file defines the PreloadScene class for a Phaser-based game.
 * It handles the loading of game assets and displays a loading bar to indicate progress.
 * Once loading is complete, it transitions to the TitleScene.
 */
import * as Phaser from 'phaser';
import { getGameTranslations } from '../utils/gameI18n';
import { MusicController } from '../utils/MusicController';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const { preload: preloadTexts } = getGameTranslations();

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: preloadTexts.loading,
      style: {
        font: '20px monospace',
        color: '#ffffff',
      },
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2,
      text: '0%',
      style: {
        font: '18px monospace',
        color: '#ffffff',
      },
    });
    percentText.setOrigin(0.5, 0.5);

    // Update loading bar
    this.load.on('progress', (value: number) => {
      percentText.setText(parseInt((value * 100).toString()) + '%');
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // Load game assets
    this.load.image('map', '/simulator-map.png');
    this.load.image('simulator-background', '/simulator-background.png');
    this.load.image('simulator-foreground', '/simulator-foreground.png');
    this.load.audio('simulator-music', '/simulator-music.mp3');

    // Load boy player sprite sheets
    this.load.spritesheet('player-boy-idle', '/simulator-boy-idle.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('player-boy-up', '/simulator-boy-up.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('player-boy-down', '/simulator-boy-down.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('player-boy-left', '/simulator-boy-left.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('player-boy-right', '/simulator-boy-right.png', {
      frameWidth: 32,
      frameHeight: 64,
    });

    // Load girl player sprite sheets
    this.load.spritesheet('player-girl-idle', '/simulator-girl-idle.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('player-girl-up', '/simulator-girl-up.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('player-girl-down', '/simulator-girl-down.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('player-girl-left', '/simulator-girl-left.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('player-girl-right', '/simulator-girl-right.png', {
      frameWidth: 32,
      frameHeight: 64,
    });

    // Load NPC sprites as sprite sheets (6 frames for idle animation)
    this.load.spritesheet('simulator-boy-npc-bar', '/simulator-boy-npc-bar.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('simulator-girl-npc-bar', '/simulator-girl-npc-bar.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('simulator-girl-npc-doctor', '/simulator-girl-npc-doctor.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('simulator-boy-npc-doctor', '/simulator-boy-npc-doctor.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('simulator-both-npc-uni', '/simulator-both-npc-uni.png', {
      frameWidth: 32,
      frameHeight: 64,
    });

    // Load interaction indicator spritesheet (6 frames for animation)
    this.load.spritesheet('interaction-indicator', '/simulator-interaction-indicator.png', {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    // Try to start music as early as possible (will set up unlock listeners if needed)
    MusicController.play(this);

    // Start the title scene
    this.scene.start('TitleScene');
  }
}
