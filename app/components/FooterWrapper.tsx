'use client'

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

export function FooterWrapper() {
  const pathname = usePathname();
  
  // Don't show footer on chat page
  if (pathname === '/chat') {
    return null;
  }

  return <Footer />;
} 