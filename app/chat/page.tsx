'use client'

import { motion } from 'framer-motion';

export default function ChatPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Chat interface */}
        <motion.div
          className="w-full max-w-6xl mx-auto h-[calc(100vh-200px)] bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="h-full">
            <iframe
              src="https://udify.app/chat/jR3TCPVG1DjZidxk"
              title="Safhira AI"
              className="w-full h-full border-0"
              allow="microphone"
            />
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.p 
          className="fixed bottom-0 left-0 right-0 p-4 text-center text-sm text-gray-500 dark:text-gray-400"
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
