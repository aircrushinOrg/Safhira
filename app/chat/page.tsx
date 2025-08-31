'use client'

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useIframeManager } from '../components/IframeManager';

export default function ChatPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isIframeTransferred, setIsIframeTransferred] = useState(false);
  const { transferIframe, isIframeLoaded, createPreloadedIframe } = useIframeManager();

  useEffect(() => {
    if (!containerRef.current) return;

    // 尝试使用预加载的iframe
    const success = transferIframe('chat-iframe-container', 'preloaded-chat-iframe');
    
    if (success) {
      setIsIframeTransferred(true);
    } else {
      // 如果预加载的iframe不可用，创建新的iframe
      const iframe = document.createElement('iframe');
      iframe.src = 'https://udify.app/chat/jR3TCPVG1DjZidxk';
      iframe.title = 'Safhira AI';
      iframe.className = 'w-full h-full border-0';
      iframe.allow = 'microphone';
      
      containerRef.current.appendChild(iframe);
      setIsIframeTransferred(true);
    }
  }, [transferIframe]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-4 md:py-6 pb-12 md:pb-8">
        {/* Chat interface */}
        <motion.div
          className="w-full max-w-7xl mx-auto h-[calc(100vh-200px)] md:h-[calc(100vh-160px)] bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div 
            ref={containerRef}
            id="chat-iframe-container" 
            className="h-full"
          >
            {!isIframeTransferred && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">Loading chat...</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.p 
          className="fixed bottom-0 left-0 right-0 p-3 md:p-4 text-center text-xs md:text-sm text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          Safhira may also make mistakes. Please verify important information.
        </motion.p>
      </div>
    </div>
  );
}
