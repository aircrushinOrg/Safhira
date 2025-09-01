'use client'

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Hero } from './components/Hero';
import { StigmaBreakingSection } from './components/StigmaBreakingSection';
import { PrevalenceSection } from './components/PrevalenceSection';
import { FeaturesSection } from './components/FeaturesSection';
import { LearningModules } from './components/LearningModules';
import { QuizSection } from './components/QuizSection';
import { ResourcesSection } from './components/ResourcesSection';
import { motion, AnimatePresence } from 'framer-motion';

function AppContent() {
  const [currentSection, setCurrentSection] = useState('home');
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChatOpen = () => {
    router.push('/chat');
  };

  // Update current section based on URL params
  useEffect(() => {
    const section = searchParams.get('section') || 'home';
    setCurrentSection(section);
  }, [searchParams]);

  // Handle section changes and update URL
  const handleSectionChange = (section: string) => {
    const newUrl = section === 'home' ? '/' : `/?section=${section}`;
    router.push(newUrl);
    setCurrentSection(section);
    // Only scroll to top when user intentionally changes sections
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    duration: 0.4
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'home':
        return (
          <motion.div
            key="home"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Hero />
            <StigmaBreakingSection />
            <PrevalenceSection />
            <FeaturesSection />
            <ResourcesSection />
          </motion.div>
        );
      case 'quiz':
        return (
          <motion.div
            key="quiz"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <QuizSection onBack={() => handleSectionChange('home')} />
          </motion.div>
        );
      case 'basics':
      case 'prevention':
      case 'testing':
      case 'myths':
        return (
          <motion.div
            key={currentSection}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <LearningModules onModuleClick={handleSectionChange} currentModule={currentSection} onBack={() => handleSectionChange('home')} />
          </motion.div>
        );
      default:
        return (
          <motion.div
            key="default"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Hero />
            <StigmaBreakingSection />
            <PrevalenceSection />
            <FeaturesSection />
            <ResourcesSection />
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="relative">
        <AnimatePresence mode="wait">
          {renderSection()}
        </AnimatePresence>
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