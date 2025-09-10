'use client'

import {useState, useEffect} from 'react';
import {useRouter, usePathname} from '../../i18n/routing';
import {Header} from './Header';
import {locales} from '../../i18n/routing';

export function HeaderWrapper() {
  const [currentSection, setCurrentSection] = useState('home');
  const router = useRouter();
  const pathname = usePathname();

  const stripLocale = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return '/';
    const [first, ...rest] = segments;
    return (locales as readonly string[]).includes(first) ? `/${rest.join('/')}` || '/' : `/${segments.join('/')}`;
  };

  // Update current section based on pathname
  useEffect(() => {
    const normalized = stripLocale(pathname);
    if (normalized === '/') {
      setCurrentSection('home');
    } else if (normalized.startsWith('/stis')) {
      setCurrentSection('stis');
    } else if (normalized.startsWith('/chat')) {
      setCurrentSection('chat');
    } else {
      // For other pages, set a default or extract from pathname
      const pathSegments = normalized.split('/').filter(Boolean);
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
