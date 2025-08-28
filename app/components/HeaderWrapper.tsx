'use client'

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Header } from './Header';

export function HeaderWrapper() {
  const [currentSection, setCurrentSection] = useState('home');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Update current section based on URL params
  useEffect(() => {
    const section = searchParams.get('section') || 'home';
    setCurrentSection(section);
  }, [searchParams]);

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