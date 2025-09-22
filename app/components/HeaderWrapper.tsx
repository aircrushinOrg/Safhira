/**
 * Header wrapper component that manages navigation state and provides routing integration for the main header.
 * This component tracks the current page section and handles navigation events while supporting internationalization routing.
 * Features intelligent section detection based on URL paths and provides chat functionality integration.
 */
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
      return;
    }

    if (normalized.startsWith('/stis')) {
      setCurrentSection('stis');
      return;
    }

    if (normalized.startsWith('/living-well-with-sti')) {
      setCurrentSection('living-well-with-sti');
      return;
    }

    if (normalized.startsWith('/find-healthcare')) {
      setCurrentSection('providers');
      return;
    }

    if (normalized.startsWith('/quiz')) {
      setCurrentSection('quiz');
      return;
    }

    if (normalized.startsWith('/chat')) {
      setCurrentSection('chat');
      return;
    }

    // For other pages, fall back to the first path segment
    const pathSegments = normalized.split('/').filter(Boolean);
    const section = pathSegments[0] || 'home';
    setCurrentSection(section);
  }, [pathname]);

  const handleChatOpen = () => {
    router.push('/chat');
  };

  const handleSectionChange = (section: string) => {
    // Map known sections to routes without query params
    if (section === 'home') router.push('/');
    else if (section === 'stis') router.push('/stis');
    else if (section === 'quiz') router.push('/quiz');
    else if (section === 'providers') router.push('/find-healthcare');
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
