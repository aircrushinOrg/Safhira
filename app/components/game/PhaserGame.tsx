'use client';

import { useEffect, useRef, useState } from 'react';
import * as Phaser from 'phaser';
import { createGameConfig } from '@/lib/game/config';

export default function PhaserGame() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Only initialize on client side
    if (typeof window !== 'undefined' && !gameRef.current && containerRef.current) {
      // Detect mobile device
      const isMobileDevice = window.innerWidth < 768;

      // Create responsive game config
      const config = {
        ...createGameConfig(isMobileDevice),
        parent: containerRef.current,
      };

      gameRef.current = new Phaser.Game(config);
    }

    // Cleanup on unmount
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-sky-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 p-4">
      <div className="mb-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Safhira Simulation Game</h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Navigate the world and interact with NPCs to learn about sexual health</p>
      </div>
      <div
        ref={containerRef}
        id="phaser-game-container"
        className="rounded-lg overflow-hidden w-full max-w-[800px]"
        style={{
          maxWidth: '800px',
          width: '100%',
          height: isMobile ? '65vh' : 'auto',
          aspectRatio: isMobile ? 'unset' : '4/3',
          minHeight: isMobile ? '400px' : 'auto',
          maxHeight: isMobile ? '70vh' : 'none',
        }}
      />
    </div>
  );
}
