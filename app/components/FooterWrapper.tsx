/**
 * Footer wrapper component that conditionally renders the footer based on current route.
 * This component manages footer visibility by hiding it on chat pages where it might interfere with the chat interface.
 * Features intelligent path detection that works with internationalized routing to determine when to show or hide the footer.
 */
'use client'

import {usePathname} from '../../i18n/routing';
import {Footer} from './Footer';
import {locales} from '../../i18n/routing';

export function FooterWrapper() {
  const pathname = usePathname();
  const isChatPath = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return false;
    const [first, ...rest] = segments;
    const pathAfterLocale = (locales as readonly string[]).includes(first) ? `/${rest.join('/')}` : `/${segments.join('/')}`;
    return pathAfterLocale === '/chat' || pathAfterLocale.startsWith('/chat/');
  };
  
  // Don't show footer on chat page
  if (isChatPath()) {
    return null;
  }

  return <Footer />;
} 
