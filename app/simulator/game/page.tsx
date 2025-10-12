'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';

const GameEmbed = dynamic(() => import('@/app/components/simulator/GameEmbed'), {
  ssr: false,
  loading: () => <LoadingState />,
});

function LoadingState() {
  const t = useTranslations('Simulator.game');

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
        <p className="text-xl text-gray-600 dark:text-gray-400">{t('loading')}</p>
      </div>
    </div>
  );
}

// Custom hook to get header height dynamically
function useHeaderHeight() {
  const [headerHeight, setHeaderHeight] = useState(88); // Default fallback height (5.5rem = 88px)

  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector('header');
      if (header) {
        const height = header.getBoundingClientRect().height;
        setHeaderHeight(height);
      }
    };

    // Update on mount
    updateHeaderHeight();

    // Update on resize
    window.addEventListener('resize', updateHeaderHeight);

    // Use ResizeObserver for more accurate header size changes
    const header = document.querySelector('header');
    let resizeObserver: ResizeObserver | null = null;

    if (header && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(updateHeaderHeight);
      resizeObserver.observe(header);
    }

    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  return headerHeight;
}

export default function SimulatorGamePage() {
  const headerHeight = useHeaderHeight();

  return (
    <div className="w-full" style={{ height: `calc(100vh - ${headerHeight}px)` }}>
      <Suspense fallback={<LoadingState />}>
        <div className="relative h-full w-full">
          <GameEmbed />
        </div>
      </Suspense>
    </div>
  );
}
