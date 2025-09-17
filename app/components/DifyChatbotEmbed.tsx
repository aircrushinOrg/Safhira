'use client';

import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
import Script from 'next/script';

export default function DifyChatbotEmbed() {
  const pathname = usePathname() || '/';

  const isChatRoute = /^(?:\/(?:en|ms|zh))?\/chat(?:\/|$)/.test(pathname);

  useEffect(() => {
    const styleId = 'dify-hide-style';
    if (isChatRoute) {
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
  }, [isChatRoute]);

  return (
    <>
      {!isChatRoute && (
        <>
          <Script id="dify-config" strategy="afterInteractive">
            {`
              window.difyChatbotConfig = {
                token: 'jR3TCPVG1DjZidxk',
                inputs: {},
                systemVariables: {},
                userVariables: {},
              };
            `}
          </Script>
          <Script
            src="https://udify.app/embed.min.js"
            id="jR3TCPVG1DjZidxk"
            strategy="afterInteractive"
            defer
          />
        </>
      )}
    </>
  );
}


