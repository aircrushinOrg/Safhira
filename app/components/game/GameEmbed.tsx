/**
 * This file defines the GameEmbed component that integrates a Phaser game into a React application.
 * It handles client-side rendering, responsive resizing, and scroll event management to ensure
 * a seamless gaming experience within a web page.
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import * as Phaser from 'phaser';
import { createGameConfig } from '@/lib/game/config';

export default function GameEmbed() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only initialize on client side after isClient is true
    if (isClient && typeof window !== 'undefined' && !gameRef.current && containerRef.current) {
      // Create responsive game config
      const config = {
        ...createGameConfig(),
        parent: containerRef.current,
      };

      gameRef.current = new Phaser.Game(config);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [isClient]);

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

              console.log('Restarting scene:', currentSceneKey, 'with new size:', containerWidth, 'x', containerHeight);

              // Store player position if this is the GameScene
              let playerPosition = null;
              let playerGender = null;
              if (currentSceneKey === 'GameScene' && (currentScene as any).player) {
                playerPosition = {
                  x: (currentScene as any).player.x,
                  y: (currentScene as any).player.y
                };
                playerGender = (currentScene as any).playerGender;
                console.log('Storing player position:', playerPosition, 'gender:', playerGender);
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

  // Handle scroll events to pass through the game canvas
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

          console.log('Scroll listeners attached to canvas and container');

          return () => {
            canvas.removeEventListener('wheel', handleWheel, { capture: true });
            container.removeEventListener('wheel', handleWheel, { capture: true });
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
    <div className="w-full h-full bg-gray-900">
      <div
        ref={containerRef}
        id="phaser-game-container"
        className="w-full h-full"
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'auto',
          touchAction: 'pan-y',
        }}
      />
    </div>
  );
}
