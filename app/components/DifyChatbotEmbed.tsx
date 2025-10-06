/**
 * Dify chatbot embed component that manages the visibility of the chatbot widget based on current route.
 * This component conditionally hides the chatbot bubble on chat pages to avoid duplication and shows it on other pages.
 * Handles dynamic script loading and provides route-aware chatbot integration for the Safhira AI assistant.
 */
'use client';

import {useEffect} from 'react';
import {usePathname} from 'next/navigation';

export default function DifyChatbotEmbed() {
  const pathname = usePathname() || '/';

  const isChatRoute = /^(?:\/(?:en|ms|zh))?\/chat(?:\/|$)/.test(pathname);
  const isSimulatorRoute = /^(?:\/(?:en|ms|zh))?\/simulator(?:\/|$)/.test(pathname);

  const shouldHideChatbot = isChatRoute || isSimulatorRoute;

  useEffect(() => {
    const styleId = 'dify-hide-style';
    if (shouldHideChatbot) {
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `#dify-chatbot-bubble-button, #dify-chatbot-bubble-window { display: none !important; }`;
        document.head.appendChild(style);
      }
    } else {
      const s = document.getElementById(styleId);
      if (s) s.remove();
    }
  }, [shouldHideChatbot]);

  return null;
}


