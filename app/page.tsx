'use client'

import { useState, useEffect } from 'react';
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
  const [isChatOpen, setIsChatOpen] = useState(false);

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
            <PersonaSection />
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
            <PersonaSection />
            <LearningModules onModuleClick={setCurrentSection} />
            <ResourcesSection />
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header currentSection={currentSection} onSectionChange={setCurrentSection} onChatOpen={() => setIsChatOpen(true)} />
      
      <main className="relative">
        <AnimatePresence mode="wait">
          {renderSection()}
        </AnimatePresence>
      </main>

      <Footer />

      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="relative w-full max-w-6xl h-full max-h-[90vh] m-4 bg-white rounded-lg shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <motion.button
                onClick={() => setIsChatOpen(false)}
                className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
              <iframe
                src="https://udify.app/chat/jR3TCPVG1DjZidxk"
                title="AI Chat Assistant"
                className="w-full h-full min-h-[400px] rounded-lg border-0"
                allow="microphone"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}