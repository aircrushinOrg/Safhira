import type * as Phaser from 'phaser';

/**
 * Singleton music controller so the background track persists across scene transitions.
 */
export class MusicController {
  private static track: Phaser.Sound.BaseSound | null = null;
  private static readonly KEY = 'simulator-music';
  private static unlocking = false;
  private static initialized = false;
  private static visibilityListenerAdded = false;

  static play(scene: Phaser.Scene, { volume = 0.4 } = {}): void {
    const startPlayback = () => {
      try {
        if (!scene.sound.get(MusicController.KEY)) {
          MusicController.track = scene.sound.add(MusicController.KEY, {
            loop: true,
            volume,
          });

          // Try to play immediately
          const playResult = MusicController.track.play();

          // Handle play promise if it exists (Web Audio API)
          if (playResult && typeof playResult === 'object' && 'then' in playResult && 'catch' in playResult) {
            (playResult as Promise<void>).catch((error: any) => {
              console.log('Music autoplay prevented:', error.message);
              // Music will be unlocked with user interaction
            });
          }
        } else {
          MusicController.track = scene.sound.get(MusicController.KEY) ?? null;
          if (MusicController.track) {
            // Cast to any to access Phaser sound methods that might not be on BaseSound interface
            const soundTrack = MusicController.track as any;
            if (typeof soundTrack.setLoop === 'function') {
              soundTrack.setLoop(true);
            }
            if (typeof soundTrack.setVolume === 'function') {
              soundTrack.setVolume(volume);
            }
            if (!MusicController.track.isPlaying) {
              const playResult = MusicController.track.play();
              if (playResult && typeof playResult === 'object' && 'then' in playResult && 'catch' in playResult) {
                (playResult as Promise<void>).catch((error: any) => {
                  console.log('Music resume prevented:', error.message);
                });
              }
            }
          }
        }
      } catch (error) {
        console.log('Music playback error:', error);
      }
    };

    // Try to unlock audio context immediately with multiple techniques
    const tryEarlyUnlock = async () => {
      try {
        // Safely access WebAudio context if available
        const soundManager = scene.sound as any;
        if (soundManager && soundManager.context && typeof soundManager.context === 'object') {
          const audioContext = soundManager.context as AudioContext;

          // Force resume the audio context
          if (audioContext.state === 'suspended') {
            await audioContext.resume();
          }

          // Try multiple unlock techniques
          // 1. Create and play a silent audio buffer
          const buffer = audioContext.createBuffer(1, 1, 22050);
          const source = audioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContext.destination);
          source.start(0);

          // 2. Try creating an oscillator and playing it briefly
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.001);

          // 3. Try to decode empty audio data
          const emptyBuffer = new ArrayBuffer(44);
          try {
            await audioContext.decodeAudioData(emptyBuffer.slice(0));
          } catch (e) {
            // Expected to fail, but might help unlock
          }
        }
      } catch (error) {
        // Silent fail - browser restrictions
      }
    };

    // Initialize unlock mechanism only once
    if (!MusicController.initialized) {
      MusicController.initialized = true;

      // Try immediate unlock
      tryEarlyUnlock();

      // Set up interaction listeners
      const unlock = () => {
        tryEarlyUnlock().then(() => {
          startPlayback();
        });

        // Clean up listeners
        document.removeEventListener('pointerdown', unlock);
        document.removeEventListener('keydown', unlock);
        document.removeEventListener('touchstart', unlock);
        document.removeEventListener('click', unlock);
        document.removeEventListener('touchend', unlock);
        document.removeEventListener('mousedown', unlock);
        MusicController.unlocking = false;
      };

      if (scene.sound.locked) {
        MusicController.unlocking = true;

        // Listen for ANY user interaction on the entire document
        document.addEventListener('pointerdown', unlock, { once: true, passive: true });
        document.addEventListener('keydown', unlock, { once: true, passive: true });
        document.addEventListener('touchstart', unlock, { once: true, passive: true });
        document.addEventListener('click', unlock, { once: true, passive: true });
        document.addEventListener('touchend', unlock, { once: true, passive: true });
        document.addEventListener('mousedown', unlock, { once: true, passive: true });

        // Also listen for Phaser's unlock event
        scene.sound.once('unlocked', unlock);
      }
    }

    // Set up background audio support
    MusicController.setupBackgroundAudio();

    // Always try to start playback (will fail silently if locked)
    startPlayback();
  }

  private static setupBackgroundAudio(): void {
    if (MusicController.visibilityListenerAdded) return;
    MusicController.visibilityListenerAdded = true;

    // Handle page visibility changes to keep music playing in background
    const handleVisibilityChange = () => {
      try {
        if (MusicController.track) {
          const soundTrack = MusicController.track as any;

          if (document.hidden) {
            // Page is hidden - try to keep music playing
            // Force the audio context to stay active
            const soundManager = (MusicController.track as any).manager;
            if (soundManager && soundManager.context && typeof soundManager.context === 'object') {
              const audioContext = soundManager.context as AudioContext;
              if (audioContext.state === 'suspended') {
                audioContext.resume().catch(() => {
                  // Silent fail - some browsers may not allow this
                });
              }
            }

            // Ensure the track keeps playing
            if (!MusicController.track.isPlaying && typeof soundTrack.play === 'function') {
              const playResult = soundTrack.play();
              if (playResult && typeof playResult === 'object' && 'then' in playResult && 'catch' in playResult) {
                (playResult as Promise<void>).catch(() => {
                  // Silent fail - browser may prevent background audio
                });
              }
            }
          } else {
            // Page is visible again - ensure music is still playing
            if (!MusicController.track.isPlaying && typeof soundTrack.play === 'function') {
              const playResult = soundTrack.play();
              if (playResult && typeof playResult === 'object' && 'then' in playResult && 'catch' in playResult) {
                (playResult as Promise<void>).catch(() => {
                  // Silent fail
                });
              }
            }
          }
        }
      } catch (error) {
        // Silent fail - background audio restrictions
      }
    };

    // Listen for visibility change events
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Additional event listeners for different browser implementations
    window.addEventListener('blur', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    // Prevent audio context from being suspended during inactivity
    const keepAlive = () => {
      try {
        if (MusicController.track) {
          const soundManager = (MusicController.track as any).manager;
          if (soundManager && soundManager.context && typeof soundManager.context === 'object') {
            const audioContext = soundManager.context as AudioContext;
            if (audioContext.state === 'suspended') {
              audioContext.resume().catch(() => {
                // Silent fail
              });
            }
          }
        }
      } catch (error) {
        // Silent fail
      }
    };

    // Keep audio context alive with periodic checks
    setInterval(keepAlive, 5000); // Check every 5 seconds
  }

  static stop(): void {
    if (MusicController.track) {
      MusicController.track.stop();
      MusicController.track.destroy();
      MusicController.track = null;
    }
  }
}
