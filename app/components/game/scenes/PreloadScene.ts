import * as Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
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

    // Load game map
    this.load.image('map', '/game-map.png');

    // Load boy player sprite sheets
    this.load.spritesheet('player-boy-idle', '/game-boy-idle.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('player-boy-up', '/game-boy-up.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('player-boy-down', '/game-boy-down.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('player-boy-left', '/game-boy-left.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('player-boy-right', '/game-boy-right.png', {
      frameWidth: 32,
      frameHeight: 64,
    });

    // Load girl player sprite sheets
    this.load.spritesheet('player-girl-idle', '/game-girl-idle.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('player-girl-up', '/game-girl-up.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('player-girl-down', '/game-girl-down.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('player-girl-left', '/game-girl-left.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
    this.load.spritesheet('player-girl-right', '/game-girl-right.png', {
      frameWidth: 32,
      frameHeight: 64,
    });
  }

  create() {
    // Start the title scene
    this.scene.start('TitleScene');
  }
}
