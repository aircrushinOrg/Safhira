'use client'

import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PersonaSection } from './components/PersonaSection';
import { LearningModules } from './components/LearningModules';
import { AIChat } from './components/AIChat';
import { QuizSection } from './components/QuizSection';
import { ResourcesSection } from './components/ResourcesSection';
import { Footer } from './components/Footer';

export default function App() {
  const [currentSection, setCurrentSection] = useState('home');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const renderSection = () => {
    switch (currentSection) {
      case 'home':
        return (
          <>
            <Hero />
            <PersonaSection />
            <LearningModules onModuleClick={setCurrentSection} />
            <ResourcesSection />
          </>
        );
      case 'quiz':
        return <QuizSection onBack={() => setCurrentSection('home')} />;
      case 'basics':
      case 'prevention':
      case 'testing':
      case 'myths':
        return <LearningModules onModuleClick={setCurrentSection} currentModule={currentSection} onBack={() => setCurrentSection('home')} />;
      default:
        return (
          <>
            <Hero />
            <PersonaSection />
            <LearningModules onModuleClick={setCurrentSection} />
            <ResourcesSection />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header currentSection={currentSection} onSectionChange={setCurrentSection} onChatOpen={() => setIsChatOpen(true)} />
      
      <main className="relative">
        {renderSection()}
      </main>

      <Footer />

      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-full max-w-6xl h-full max-h-[90vh] m-4 bg-white rounded-lg shadow-xl">
            <button
              onClick={() => setIsChatOpen(false)}
              className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              src="https://udify.app/chat/jR3TCPVG1DjZidxk"
              style={{ width: '100%', height: '100%', minHeight: '400px' }}
              frameBorder="0"
              allow="microphone"
              className='rounded-lg'            
            />
          </div>
        </div>
      )}
    </div>
  );
}