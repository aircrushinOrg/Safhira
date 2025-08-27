'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PersonaSection } from './components/PersonaSection';
import { LearningModules } from './components/LearningModules';
import { AIChat } from './components/AIChat';
import { QuizSection } from './components/QuizSection';
import { ResourcesSection } from './components/ResourcesSection';
import { Footer } from './components/Footer';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [currentSection, setCurrentSection] = useState('home');
  const router = useRouter();

  const handleChatOpen = () => {
    router.push('/chat');
  };

  // 监听currentSection变化，自动滚动到页面顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSection]);

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
            <PersonaSection onChatOpen={handleChatOpen} />
            <LearningModules onModuleClick={setCurrentSection} />
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
            <QuizSection onBack={() => setCurrentSection('home')} />
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
            <LearningModules onModuleClick={setCurrentSection} currentModule={currentSection} onBack={() => setCurrentSection('home')} />
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
            <PersonaSection onChatOpen={handleChatOpen} />
            <LearningModules onModuleClick={setCurrentSection} />
            <ResourcesSection />
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header currentSection={currentSection} onSectionChange={setCurrentSection} onChatOpen={handleChatOpen} />
      
      <main className="relative">
        <AnimatePresence mode="wait">
          {renderSection()}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}