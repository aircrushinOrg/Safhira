'use client';

import dynamic from 'next/dynamic';
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

export default function SimulatorGamePage() {
  return (
    <div className="h-[90vh] w-full md:h-[92vh]">
      <Suspense fallback={<LoadingState />}>
        <div className="relative h-full w-full">
          <GameEmbed />
        </div>
      </Suspense>
    </div>
  );
}
