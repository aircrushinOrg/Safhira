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
        <AIChat onClose={() => setIsChatOpen(false)} />
      )}
    </div>
  );
}