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
  private static nativeAudioElement: HTMLAudioElement | null = null;
  private static useNativeAudio = false;
  private static muted = false;

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

    // Try native HTML5 audio for better background playback
    MusicController.setupNativeAudio(volume);

    // Set up background audio support
    MusicController.setupBackgroundAudio();

    // Always try to start playback (will fail silently if locked)
    startPlayback();
  }

  private static setupBackgroundAudio(): void {
    if (MusicController.visibilityListenerAdded) return;
    MusicController.visibilityListenerAdded = true;

    // Pre-emptively keep audio context active
    const maintainAudioContext = () => {
      try {
        if (MusicController.track) {
          const soundManager = (MusicController.track as any).manager;
          if (soundManager && soundManager.context && typeof soundManager.context === 'object') {
            const audioContext = soundManager.context as AudioContext;

            // Keep context active with minimal processing
            if (audioContext.state === 'suspended') {
              audioContext.resume().catch(() => {
                // Silent fail
              });
            }

            // Create a minimal audio worklet to keep context alive
            if (audioContext.state === 'running') {
              try {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                gainNode.gain.setValueAtTime(0, audioContext.currentTime); // Silent
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.001); // Very brief
              } catch (e) {
                // Silent fail
              }
            }
          }
        }
      } catch (error) {
        // Silent fail
      }
    };

    // Optimized visibility change handler
    const handleVisibilityChange = () => {
      // Use requestAnimationFrame for smoother handling
      requestAnimationFrame(() => {
        try {
          if (MusicController.track) {
            const soundTrack = MusicController.track as any;

            if (document.hidden) {
              // Page is hidden - maintain audio context immediately
              maintainAudioContext();
            } else {
              // Page is visible again - immediate audio context check and resume if needed
              const soundManager = (MusicController.track as any).manager;
              if (soundManager && soundManager.context && typeof soundManager.context === 'object') {
                const audioContext = soundManager.context as AudioContext;

                // Immediate resume for smoother transition
                if (audioContext.state === 'suspended') {
                  audioContext.resume().then(() => {
                    // Ensure music is playing after resume
                    if (!MusicController.track?.isPlaying && typeof soundTrack.play === 'function') {
                      const playResult = soundTrack.play();
                      if (playResult && typeof playResult === 'object' && 'then' in playResult && 'catch' in playResult) {
                        (playResult as Promise<void>).catch(() => {
                          // Silent fail
                        });
                      }
                    }
                  }).catch(() => {
                    // Silent fail
                  });
                } else if (!MusicController.track?.isPlaying && typeof soundTrack.play === 'function') {
                  // Context is running but music stopped - restart immediately
                  const playResult = soundTrack.play();
                  if (playResult && typeof playResult === 'object' && 'then' in playResult && 'catch' in playResult) {
                    (playResult as Promise<void>).catch(() => {
                      // Silent fail
                    });
                  }
                }
              }
            }
          }
        } catch (error) {
          // Silent fail
        }
      });
    };

    // Listen for visibility change events
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });

    // Use focus/blur for immediate response (more reliable than visibilitychange on some browsers)
    window.addEventListener('blur', () => {
      // Pre-emptively maintain context on blur
      setTimeout(maintainAudioContext, 10); // Small delay to ensure blur is processed
    }, { passive: true });

    window.addEventListener('focus', handleVisibilityChange, { passive: true });

    // More frequent keep-alive for smoother experience
    setInterval(maintainAudioContext, 2000); // Check every 2 seconds instead of 5

    // Additional high-frequency check specifically for tab switching
    setInterval(() => {
      if (!document.hidden && MusicController.track && !MusicController.track.isPlaying) {
        // Tab is active but music isn't playing - quick restart
        const soundTrack = MusicController.track as any;
        if (typeof soundTrack.play === 'function') {
          const playResult = soundTrack.play();
          if (playResult && typeof playResult === 'object' && 'then' in playResult && 'catch' in playResult) {
            (playResult as Promise<void>).catch(() => {
              // Silent fail
            });
          }
        }
      }
    }, 500); // Check every 500ms when tab is active
  }

  private static setupNativeAudio(volume: number): void {
    if (MusicController.nativeAudioElement || MusicController.useNativeAudio) return;

    try {
      // Create native HTML5 audio element for better background playback
      MusicController.nativeAudioElement = new Audio();
      MusicController.nativeAudioElement.loop = true;
      MusicController.nativeAudioElement.volume = volume;
      MusicController.nativeAudioElement.preload = 'auto';

      // Use the same audio file that Phaser loads
      // You'll need to adjust this path to match your actual audio file
      MusicController.nativeAudioElement.src = '/sounds/simulator-music.mp3'; // Adjust path as needed

      // Set up event listeners
      MusicController.nativeAudioElement.addEventListener('canplaythrough', () => {
        // Auto-play once loaded (if user has interacted)
        if (!MusicController.nativeAudioElement?.paused) return;

        MusicController.nativeAudioElement?.play().then(() => {
          console.log('Native audio started successfully');
          MusicController.useNativeAudio = true;

          // Pause Phaser audio to avoid double playback
          if (MusicController.track && MusicController.track.isPlaying) {
            MusicController.track.pause();
          }
        }).catch((error) => {
          console.log('Native audio autoplay prevented:', error.message);
        });
      });

      // Handle errors
      MusicController.nativeAudioElement.addEventListener('error', (e) => {
        console.log('Native audio error:', e);
        MusicController.useNativeAudio = false;
      });

      // Keep playing even when tab is hidden
      document.addEventListener('visibilitychange', () => {
        if (MusicController.useNativeAudio && MusicController.nativeAudioElement) {
          if (document.hidden) {
            // Try to keep playing in background
            if (MusicController.nativeAudioElement.paused) {
              MusicController.nativeAudioElement.play().catch(() => {
                // Silent fail
              });
            }
          }
        }
      });

      // Load the audio
      MusicController.nativeAudioElement.load();

    } catch (error) {
      console.log('Failed to setup native audio:', error);
      MusicController.useNativeAudio = false;
    }
  }

  static stop(): void {
    // Stop Phaser audio
    if (MusicController.track) {
      MusicController.track.stop();
      MusicController.track.destroy();
      MusicController.track = null;
    }

    // Stop native audio
    if (MusicController.nativeAudioElement) {
      MusicController.nativeAudioElement.pause();
      MusicController.nativeAudioElement.currentTime = 0;
      MusicController.nativeAudioElement = null;
    }

    MusicController.useNativeAudio = false;
  }

  static isMuted(): boolean {
    return MusicController.muted;
  }

  static toggleMute(scene?: Phaser.Scene): void {
    MusicController.muted = !MusicController.muted;

    if (MusicController.muted) {
      // Mute the music
      if (MusicController.track) {
        const soundTrack = MusicController.track as any;
        if (typeof soundTrack.setMute === 'function') {
          soundTrack.setMute(true);
        } else if (typeof soundTrack.setVolume === 'function') {
          soundTrack.setVolume(0);
        }
      }

      // Mute native audio
      if (MusicController.nativeAudioElement) {
        MusicController.nativeAudioElement.muted = true;
      }
    } else {
      // Unmute the music
      if (MusicController.track) {
        const soundTrack = MusicController.track as any;
        if (typeof soundTrack.setMute === 'function') {
          soundTrack.setMute(false);
        } else if (typeof soundTrack.setVolume === 'function') {
          soundTrack.setVolume(0.4); // Restore default volume
        }
      }

      // Unmute native audio
      if (MusicController.nativeAudioElement) {
        MusicController.nativeAudioElement.muted = false;
      }
    }
  }
}
