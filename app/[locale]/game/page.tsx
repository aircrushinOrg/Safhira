'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamic import to load Phaser only on the game page
const PhaserGame = dynamic(() => import('@/app/components/game/PhaserGame'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>        
        <p className="text-gray-600 dark:text-gray-400 text-xl">Loading Safhira Simulation Game...</p>
      </div>
    </div>
  ),
});

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 text-xl">Loading Safhira Simulation Game...</p>
          </div>
        </div>
      }
    >
      <PhaserGame />
    </Suspense>
  );
}
