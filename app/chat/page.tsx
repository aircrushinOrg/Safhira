'use client'

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { Info } from 'lucide-react';

export default function ChatPage() {
  const [isIframeLoading, setIsIframeLoading] = useState(true);

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
          <div className="h-full relative">
            {isIframeLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 z-10">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">Loading chat...</p>
                </div>
              </div>
            )}
            <iframe
              src="https://udify.app/chat/jR3TCPVG1DjZidxk"
              title="Safhira AI"
              className="w-full h-full border-0"
              allow="microphone"
              onLoad={() => setIsIframeLoading(false)}
            />
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

        {/* Floating About Button */}
        <Link href="/chat/about">
          <motion.button
            className="hidden md:flex fixed bottom-12 md:bottom-16 right-6 md:right-8 w-8 h-8 md:w-10 md:h-10 bg-teal-500 hover:bg-teal-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 items-center justify-center z-50"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Info className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
        </Link>
      </div>
    </div>
  );
}
