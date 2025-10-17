'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface MusicContextType {
  isPlaying: boolean;
  isMuted: boolean;
  toggleMute: () => void;
  play: () => void;
  pause: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toggleMuteRef = useRef<(() => void) | null>(null);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    // Save to sessionStorage AND mark that user has explicitly set a preference
    sessionStorage.setItem('safhira-music-muted', newMutedState.toString());
    sessionStorage.setItem('safhira-music-user-set', 'true');

    if (audioRef.current) {
      // Just toggle the muted property - audio keeps playing but silenced
      audioRef.current.muted = newMutedState;

      // If we're unmuting and the audio isn't playing, start it
      if (!newMutedState && audioRef.current.paused) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.log('Music play prevented:', error.message);
        });
      }
    }
  };

  // Update the ref whenever toggleMute changes
  toggleMuteRef.current = toggleMute;

  const play = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.log('Music play prevented:', error.message);
      });
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Initialize audio and load mute state from sessionStorage
  useEffect(() => {
    // Check if user has explicitly set a music preference
    const userHasSetPreference = sessionStorage.getItem('safhira-music-user-set') === 'true';
    const savedMuteState = sessionStorage.getItem('safhira-music-muted');

    let shouldBeMuted = false;

    if (userHasSetPreference && savedMuteState !== null) {
      // User has explicitly set a preference, respect it
      shouldBeMuted = savedMuteState === 'true';
    } else {
      // First time or no explicit preference, default to unmuted (playing)
      shouldBeMuted = false;
    }

    setIsMuted(shouldBeMuted);

    // Create audio element
    const audio = new Audio('/simulator-music.mp3');
    audio.loop = true;
    audio.volume = 0.3;
    audioRef.current = audio;

    // Set initial mute state
    audio.muted = shouldBeMuted;

    const eventsForUnlock: Array<keyof DocumentEventMap> = ['pointerdown', 'touchstart', 'keydown'];
    let removeGestureUnlock: (() => void) | null = null;

    const detachGestureUnlock = () => {
      if (!removeGestureUnlock) return;
      removeGestureUnlock();
      removeGestureUnlock = null;
    };

    const attemptPlay = () => {
      if (!audioRef.current) return;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        detachGestureUnlock();
      }).catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes('interrupted by a call to pause')) {
          console.log('Music autoplay prevented:', message);
        }
        if (!removeGestureUnlock) {
          const handler = () => {
            attemptPlay();
          };
          eventsForUnlock.forEach((eventName) => {
            document.addEventListener(eventName, handler, { passive: true });
          });
          removeGestureUnlock = () => {
            eventsForUnlock.forEach((eventName) => {
              document.removeEventListener(eventName, handler);
            });
          };
        }
      });
    };

    // Always start playing the audio, but it will be muted if needed
    attemptPlay();

    // Add event listeners
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    // Listen for global toggle events from Phaser scenes
    const handleGlobalToggle = () => {
      if (toggleMuteRef.current) {
        toggleMuteRef.current();
      }
    };
    window.addEventListener('music-toggle-mute', handleGlobalToggle);

    return () => {
      detachGestureUnlock();
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      window.removeEventListener('music-toggle-mute', handleGlobalToggle);
      audio.pause();
      audio.src = '';
    };
  }, []); // Empty dependency array - only run once on mount

  return (
    <MusicContext.Provider value={{
      isPlaying,
      isMuted,
      toggleMute,
      play,
      pause
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}

// Global music controller for Phaser scenes to use
export const GlobalMusicController = {
  toggleMute: () => {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('music-toggle-mute');
      window.dispatchEvent(event);
    }
  },
  isMuted: () => {
    if (typeof window !== 'undefined') {
      const userHasSetPreference = sessionStorage.getItem('safhira-music-user-set') === 'true';
      const savedMuteState = sessionStorage.getItem('safhira-music-muted');

      if (userHasSetPreference && savedMuteState !== null) {
        return savedMuteState === 'true';
      } else {
        // Default to unmuted if no explicit preference
        return false;
      }
    }
    return false;
  }
};
