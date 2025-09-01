'use client'

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Header } from './Header';

export function HeaderWrapper() {
  const [currentSection, setCurrentSection] = useState('home');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Update current section based on pathname and URL params
  useEffect(() => {
    // Determine section based on pathname first
    if (pathname === '/') {
      const section = searchParams.get('section') || 'home';
      setCurrentSection(section);
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
  }, [pathname, searchParams]);

  const handleChatOpen = () => {
    router.push('/chat');
  };

  const handleSectionChange = (section: string) => {
    if (pathname !== '/') {
      // If we're not on the home page, navigate to home with section param
      router.push(`/?section=${section}`);
    } else {
      // Update URL with section parameter
      const newUrl = section === 'home' ? '/' : `/?section=${section}`;
      router.push(newUrl);
    }
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