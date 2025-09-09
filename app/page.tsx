'use client'

import { Suspense } from 'react';
import { HeroSection } from './components/landing/HeroSection';
import { BreakingStigmaSection } from './components/landing/BreakingStigmaSection';
import { PrevalenceSection } from './components/landing/PrevalenceSection';
import { FeaturesSection } from './components/landing/FeaturesSection';
import { FinalNoteSection } from './components/landing/FinalNoteSection';
import { motion } from 'framer-motion';

function AppContent() {
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    duration: 0.4
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="relative">
        <motion.div
          key="home"
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          <HeroSection />
          <BreakingStigmaSection />
          <PrevalenceSection />
          <FeaturesSection />
          <FinalNoteSection />
        </motion.div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    }>
      <AppContent />
    </Suspense>
  );
}
