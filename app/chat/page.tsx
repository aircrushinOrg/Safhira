'use client'

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header with back button */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </motion.div>

        {/* Chat interface */}
        <motion.div
          className="w-full max-w-6xl mx-auto h-[calc(100vh-120px)] bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
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
          className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          Safhira may also make mistakes. Please verify important information.
        </motion.p>
      </div>
    </div>
  );
}
