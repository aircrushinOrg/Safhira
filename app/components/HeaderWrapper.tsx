'use client'

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Header } from './Header';

export function HeaderWrapper() {
  const [currentSection, setCurrentSection] = useState('home');
  const router = useRouter();
  const pathname = usePathname();

  // Update current section based on pathname
  useEffect(() => {
    if (pathname === '/') {
      setCurrentSection('home');
    } else if (pathname.startsWith('/stis')) {
      setCurrentSection('stis');
    } else if (pathname.startsWith('/chat')) {
      setCurrentSection('chat');
    } else {
      // For other pages, set a default or extract from pathname
      const pathSegments = pathname.split('/').filter(Boolean);
      const section = pathSegments[0] || 'home';
      setCurrentSection(section);
    }
  }, [pathname]);

  const handleChatOpen = () => {
    router.push('/chat');
  };

  const handleSectionChange = (section: string) => {
    // Map known sections to routes without query params
    if (section === 'home') router.push('/');
    else if (section === 'stis') router.push('/stis');
    else if (section === 'quiz') router.push('/quiz');
    else router.push(`/${section}`);
    setCurrentSection(section);
  };

  return (
    <Header
      currentSection={currentSection}
      onSectionChange={handleSectionChange}
      onChatOpen={handleChatOpen}
    />
  );
} 
