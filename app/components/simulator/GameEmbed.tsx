/**
 * This file defines the GameEmbed component that integrates a Phaser game into a React application.
 * It handles client-side rendering, responsive resizing, and scroll event management to ensure
 * a seamless gaming experience within a web page.
 */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import * as Phaser from 'phaser';
import { createGameConfig } from '@/lib/simulator/config';
import { getLocalizedScenarioTemplate } from '@/lib/simulator/scenarios';
import type { ScenarioLocale, ScenarioTemplate } from '@/lib/simulator/scenarios';
import type { PlayerGender } from '@/types/game';
import {
  CONVERSATION_OVERLAY_OPEN_EVENT,
  emitConversationOverlayClose,
  type ConversationOverlayOpenDetail,
} from '@/lib/simulator/overlay-events';
import { GameConversationOverlay } from '@/app/components/simulator/GameConversationOverlay';
import { MusicController } from '@/app/components/simulator/utils/MusicController';
import { setGameTranslations, type GameTranslations } from '@/app/components/simulator/utils/gameI18n';

export default function GameEmbed() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const unlockButtonRef = useRef<HTMLButtonElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [overlayState, setOverlayState] = useState<{
    open: boolean;
    stage: 'preview' | 'chat';
    template: ScenarioTemplate | null;
    playerGender: PlayerGender;
    chatKey: string;
  }>({
    open: false,
    stage: 'preview',
    template: null,
    playerGender: 'boy',
    chatKey: 'initial',
  });
  const locale = useLocale();
  const tGame = useTranslations('Simulator.gameScenes');
  const scenarioLocale = useMemo<ScenarioLocale>(() => {
    return ['en', 'ms', 'zh'].includes(locale) ? (locale as ScenarioLocale) : 'en';
  }, [locale]);
  const gameTranslations = useMemo<GameTranslations>(() => ({
    preload: {
      loading: tGame('preload.loading'),
    },
    title: {
      subtitle: tGame('title.subtitle'),
      start: tGame('title.start'),
      instructions: tGame('title.instructions'),
    },
    gender: {
      title: tGame('gender.title'),
      boy: tGame('gender.boy'),
      girl: tGame('gender.girl'),
      back: tGame('gender.back'),
    },
    instruction: {
      title: tGame('instruction.title'),
      sections: {
        movement: {
          title: tGame('instruction.sections.movement.title'),
          keyboard: tGame('instruction.sections.movement.keyboard'),
          keyboardShortened: tGame('instruction.sections.movement.keyboardShortened'),
          touch: tGame('instruction.sections.movement.touch'),
          touchShortened: tGame('instruction.sections.movement.touchShortened'),
        },
        interaction: {
          title: tGame('instruction.sections.interaction.title'),
          keyboard: tGame('instruction.sections.interaction.keyboard'),
          keyboardShortened: tGame('instruction.sections.interaction.keyboardShortened'),
          touch: tGame('instruction.sections.interaction.touch'),
          touchShortened: tGame('instruction.sections.interaction.touchShortened'),
        },
        minimap: {
          title: tGame('instruction.sections.minimap.title'),
          description: tGame('instruction.sections.minimap.description'),
        },
      },
      back: tGame('instruction.back'),
    },
    game: {
      menu: tGame('game.menu'),
    },
  }), [tGame]);

  useEffect(() => {
    setGameTranslations(gameTranslations);
  }, [gameTranslations]);

  // Attempt to unlock audio on any page interaction (very early)
  useEffect(() => {
    const unlockAudio = () => {
      if (gameRef.current) {
        const activeScenes = gameRef.current.scene.getScenes(true);
        if (activeScenes.length > 0) {
          const currentScene = activeScenes[0];
          MusicController.play(currentScene);
        }
      }
    };

    // Listen for very early page interactions
    const earlyUnlock = () => {
      unlockAudio();
      // Remove listeners after first use
      document.removeEventListener('touchstart', earlyUnlock);
      document.removeEventListener('mousedown', earlyUnlock);
      document.removeEventListener('click', earlyUnlock);
      document.removeEventListener('keydown', earlyUnlock);
    };

    document.addEventListener('touchstart', earlyUnlock, { once: true, passive: true });
    document.addEventListener('mousedown', earlyUnlock, { once: true, passive: true });
    document.addEventListener('click', earlyUnlock, { once: true, passive: true });
    document.addEventListener('keydown', earlyUnlock, { once: true, passive: true });

    return () => {
      document.removeEventListener('touchstart', earlyUnlock);
      document.removeEventListener('mousedown', earlyUnlock);
      document.removeEventListener('click', earlyUnlock);
      document.removeEventListener('keydown', earlyUnlock);
    };
  }, []);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Function to reload the simulator
  const reloadSimulator = () => {
    // Clean up existing game instance
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }

    // Reset state and trigger re-initialization
    setHasLoadError(false);
    setIsLoading(true);
  };

  const closeOverlay = useCallback(() => {
    setOverlayState((prev) => ({
      open: false,
      stage: 'preview',
      template: null,
      playerGender: prev.playerGender,
      chatKey: `${Date.now()}`,
    }));
    emitConversationOverlayClose();
  }, []);

  const handleOverlayStageChange = useCallback((stage: 'preview' | 'chat') => {
    setOverlayState((prev) => ({
      ...prev,
      stage,
      chatKey: stage === 'chat' ? `${prev.template?.id ?? 'chat'}-${Date.now()}` : prev.chatKey,
    }));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOpen = (event: Event) => {
      const customEvent = event as CustomEvent<ConversationOverlayOpenDetail>;
      const detail = customEvent.detail;
      if (!detail) return;
      const localizedTemplate = getLocalizedScenarioTemplate(detail.scenario.id, scenarioLocale) ?? detail.scenario;
      setOverlayState({
        open: true,
        stage: 'preview',
        template: localizedTemplate,
        playerGender: detail.playerGender,
        chatKey: `${detail.scenario.id}-${Date.now()}`,
      });
    };

    window.addEventListener(CONVERSATION_OVERLAY_OPEN_EVENT, handleOpen);

    return () => {
      window.removeEventListener(CONVERSATION_OVERLAY_OPEN_EVENT, handleOpen);
    };
  }, [scenarioLocale]);

  useEffect(() => {
    if (!overlayState.open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeOverlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [overlayState.open, closeOverlay]);

  useEffect(() => {
    const keyboard = gameRef.current?.input?.keyboard;
    if (!keyboard) return;

    const previousEnabled = keyboard.enabled;
    const previousManagerEnabled = keyboard.manager ? keyboard.manager.enabled : undefined;

    if (overlayState.open) {
      keyboard.enabled = false;
      if (keyboard.manager) {
        keyboard.manager.enabled = false;
      }
      if (typeof (keyboard as any).resetKeys === 'function') {
        (keyboard as any).resetKeys();
      }
    } else {
      keyboard.enabled = true;
      if (keyboard.manager) {
        keyboard.manager.enabled = true;
      }
    }

    return () => {
      if (!keyboard) return;
      keyboard.enabled = previousEnabled;
      if (keyboard.manager && typeof previousManagerEnabled === 'boolean') {
        keyboard.manager.enabled = previousManagerEnabled;
      }
    };
  }, [overlayState.open]);

  // Function to simulate error (for testing only)
  const simulateError = () => {
    setIsLoading(false);
    setHasLoadError(true);
  };

  // Handle audio unlock button click
  const handleAudioUnlock = useCallback(() => {
    if (!audioUnlocked && gameRef.current) {
      const activeScenes = gameRef.current.scene.getScenes(true);
      if (activeScenes.length > 0) {
        const currentScene = activeScenes[0];
        MusicController.play(currentScene);
        setAudioUnlocked(true);
      }
    }
  }, [audioUnlocked]);

  useEffect(() => {
    // Only initialize on client side after isClient is true
    if (isClient && typeof window !== 'undefined' && !gameRef.current && containerRef.current) {
      try {
        setIsLoading(true);
        setHasLoadError(false);

        // Create responsive game config
        const config = {
          ...createGameConfig(),
          parent: containerRef.current,
        };

        gameRef.current = new Phaser.Game(config);

        // Add error handling for game events
        if (gameRef.current) {
          // Listen for ready event to know when game has loaded successfully
          gameRef.current.events.once('ready', () => {
            setIsLoading(false);
            setHasLoadError(false);

            // Attempt to auto-unlock audio by programmatically clicking the unlock button
            setTimeout(() => {
              try {
                if (unlockButtonRef.current) {
                  // Trigger a real DOM click event on our invisible button
                  unlockButtonRef.current.click();
                }
              } catch (error) {
                console.log('Auto-unlock failed:', error);
              }
            }, 100); // Small delay to ensure game is fully ready
          });

          // Set a timeout to catch cases where the game never loads
          const loadTimeout = setTimeout(() => {
            if (isLoading) {
              setIsLoading(false);
              setHasLoadError(true);
              console.error('Game failed to load within timeout');
            }
          }, 10000); // 10 second timeout

          // Clear timeout if component unmounts
          return () => {
            clearTimeout(loadTimeout);
          };
        }
      } catch (error) {
        console.error('Failed to initialize game:', error);
        setIsLoading(false);
        setHasLoadError(true);
      }
    }

    return () => {
      MusicController.stop();
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [isClient, isLoading]);

  // Handle window and container resize to adapt game size
  useEffect(() => {
    // Only run resize handling when client-side
    if (!isClient) return;
    let resizeTimeout: NodeJS.Timeout | null = null;

    const handleResize = () => {
      if (gameRef.current && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;

        if (containerWidth > 0 && containerHeight > 0) {
          if (resizeTimeout) {
            clearTimeout(resizeTimeout);
          }

          // Debounce the scene restart to avoid too frequent restarts
          resizeTimeout = setTimeout(() => {
            if (!gameRef.current) return;

            // Resize the game to match container
            gameRef.current.scale.resize(containerWidth, containerHeight);
            gameRef.current.scale.refresh();

            // Get the currently active scene
            const activeScenes = gameRef.current.scene.getScenes(true);
            if (activeScenes.length > 0) {
              const currentScene = activeScenes[0];
              const currentSceneKey = currentScene.scene.key;

              // Store player position if this is the GameScene
              let playerPosition = null;
              let playerGender = null;
              if (currentSceneKey === 'GameScene' && (currentScene as any).player) {
                playerPosition = {
                  x: (currentScene as any).player.x,
                  y: (currentScene as any).player.y
                };
                playerGender = (currentScene as any).playerGender;
              }

              gameRef.current.scene.stop(currentSceneKey);

              // Start the scene with preserved data
              if (currentSceneKey === 'GameScene' && playerPosition) {
                gameRef.current.scene.start(currentSceneKey, {
                  playerGender: playerGender,
                  preservedPosition: playerPosition
                });
              } else {
                gameRef.current.scene.start(currentSceneKey);
              }
            }
          }, 300);
        }
      }
    };

    // Add window resize listener
    window.addEventListener('resize', handleResize);

    // Use ResizeObserver for more precise container size changes
    let resizeObserver: ResizeObserver | null = null;
    if (containerRef.current && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          // Trigger resize handling
          handleResize();
        }
      });
      resizeObserver.observe(containerRef.current);
    }

    // Initial resize to ensure proper sizing (no restart needed on initial load)
    setTimeout(() => {
      if (gameRef.current && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        if (containerWidth > 0 && containerHeight > 0) {
          gameRef.current.scale.resize(containerWidth, containerHeight);
          gameRef.current.scale.refresh();
        }
      }
    }, 50);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, [isClient]);

  // Handle scroll events to pass through the game canvas and unlock audio on first interaction
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Prevent the game from consuming the wheel event
      e.stopPropagation();

      // Manually scroll the page
      window.scrollBy({
        top: e.deltaY,
        left: e.deltaX,
        behavior: 'auto'
      });
    };

    // Handle first interaction to unlock audio context early
    const handleFirstInteraction = () => {
      if (gameRef.current) {
        // Try to unlock audio on any game interaction
        const activeScenes = gameRef.current.scene.getScenes(true);
        if (activeScenes.length > 0) {
          const currentScene = activeScenes[0];
          // Try to start music immediately on interaction
          if (currentScene.sound && currentScene.sound.locked) {
            // The MusicController will handle unlocking when ready
            MusicController.play(currentScene);
          }
        }
      }
    };

    const attachScrollListener = () => {
      const container = containerRef.current;
      if (container) {
        // Find the canvas element created by Phaser
        const canvas = container.querySelector('canvas');
        if (canvas) {
          canvas.addEventListener('wheel', handleWheel, {
            capture: true,
            passive: false
          });

          container.addEventListener('wheel', handleWheel, {
            capture: true,
            passive: false
          });

          // Add interaction listeners to unlock audio early
          canvas.addEventListener('click', handleFirstInteraction, { once: true });
          canvas.addEventListener('touchstart', handleFirstInteraction, { once: true });
          canvas.addEventListener('keydown', handleFirstInteraction, { once: true });

          return () => {
            canvas.removeEventListener('wheel', handleWheel, { capture: true });
            container.removeEventListener('wheel', handleWheel, { capture: true });
            canvas.removeEventListener('click', handleFirstInteraction);
            canvas.removeEventListener('touchstart', handleFirstInteraction);
            canvas.removeEventListener('keydown', handleFirstInteraction);
          };
        }
      }
      return null;
    };

    // Try to attach immediately
    let cleanup = attachScrollListener();

    // If canvas not found, try again after Phaser initializes
    if (!cleanup) {
      const interval = setInterval(() => {
        cleanup = attachScrollListener();
        if (cleanup) {
          clearInterval(interval);
        }
      }, 100);

      // Cleanup interval after 5 seconds if still not found
      const timeout = setTimeout(() => clearInterval(interval), 5000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
        cleanup?.();
      };
    }

    return cleanup;
  }, []);

  return (
    <div className="w-full h-full bg-gray-900 relative">
      {/* Error State */}
      {hasLoadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-center text-white max-w-md mx-auto px-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4 text-red-400">Failed to Load Simulator</h2>
            <p className="text-gray-300 mb-6">
              We&apos;re sorry, but the simulator failed to load properly. This could be due to a
              network issue or a temporary problem with the game assets.
            </p>
            <button
              onClick={reloadSimulator}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Reload Simulator
            </button>
            <p className="text-sm text-gray-400 mt-4">
              If the problem persists, please refresh the page or try again later.
            </p>
          </div>
        </div>
      )}

      {/* Game Container */}
      <div
        ref={containerRef}
        id="phaser-simulator-container"
        className="w-full h-full"
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'auto',
          touchAction: 'pan-y',
          opacity: (isLoading || hasLoadError) ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />

      {/* Invisible audio unlock button - triggered programmatically */}
      <button
        ref={unlockButtonRef}
        onClick={handleAudioUnlock}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1,
        }}
        aria-hidden="true"
        tabIndex={-1}
      >
        Unlock Audio
      </button>

      <GameConversationOverlay
        open={overlayState.open}
        stage={overlayState.stage}
        template={overlayState.template}
        playerGender={overlayState.playerGender}
        chatKey={overlayState.chatKey}
        onClose={closeOverlay}
        onStageChange={handleOverlayStageChange}
      />

      {/* Error loading button - Remove later */}
      {/* {!hasLoadError && !isLoading && (
        <button
          onClick={simulateError}
          className="absolute bottom-12 left-8 bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 rounded z-20"
          title="Simulate Error (Dev Only)"
        >
          Test Load Error
        </button>
      )} */}
    </div>
  );
}
