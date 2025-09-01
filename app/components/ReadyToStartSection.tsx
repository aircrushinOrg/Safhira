'use client'

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Shield, Heart, UserCheck } from 'lucide-react';

export function ReadyToStartSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div 
      ref={ref}
      className="bg-gradient-to-br from-pink-50 via-white to-white dark:from-pink-950/50 dark:via-gray-800 dark:to-gray-900 text-gray-800 dark:text-white overflow-hidden relative"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Floating Hearts Animation - Similar to Hero */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 text-pink-600/30 dark:text-pink-400/20"
          animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Heart size={24} />
        </motion.div>
        <motion.div
          className="absolute top-32 right-16 text-teal-600/30 dark:text-teal-400/20"
          animate={{ y: [0, -15, 0], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          <Heart size={20} />
        </motion.div>
        <motion.div
          className="absolute bottom-24 left-20 text-purple-600/30 dark:text-purple-400/20"
          animate={{ y: [0, -25, 0], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        >
          <Heart size={18} />
        </motion.div>
        <motion.div
          className="absolute bottom-40 right-12 text-pink-600/30 dark:text-pink-400/20"
          animate={{ y: [0, -18, 0], rotate: [0, -6, 6, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <Heart size={22} />
        </motion.div>
      </div>

      {/* Geometric Shapes */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-16 right-24 w-12 h-12 border border-teal-600/40 dark:border-teal-300/40 rounded-full"></div>
        <div className="absolute bottom-32 left-16 w-8 h-8 border border-pink-600/40 dark:border-pink-300/40 rounded-full"></div>
        <div className="absolute top-1/2 left-8 w-6 h-6 bg-purple-600/30 dark:bg-purple-200/30 rounded-full"></div>
        <div className="absolute bottom-16 right-32 w-10 h-10 bg-teal-600/20 dark:bg-teal-200/20 rounded-full"></div>
      </div>

      <section className="py-12 lg:py-24 px-3 sm:px-4 relative">
        <div className="container mx-auto max-w-6xl">
          
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <motion.h1 
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-6 sm:mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Safhira Is Here <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-teal-500 dark:from-rose-400 dark:via-purple-400 dark:to-teal-400 bg-clip-text text-transparent">When You&apos;re Ready</span>
            </motion.h1>
          </div>

          {/* Main Content with Supporting Graphics */}
          <motion.div 
            className="max-w-5xl mx-auto text-center mb-8 sm:mb-12 relative"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >

            <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-gray-700 dark:text-gray-300 mb-6 sm:mb-8">
              Sexual health shouldn&apos;t be something you figure out alone or feel ashamed about. Whether you&apos;re young or old, questioning or confident, every Malaysian deserves access to judgment-free information and support.
            </p>
          </motion.div>

          {/* Visual Separator */}
          <motion.div 
            className="flex items-center justify-center mb-8 sm:mb-12"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={isInView ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent max-w-md"></div>
            <div className="mx-6 text-rose-500 dark:text-rose-400">
              <Heart size={16} fill="currentColor" />
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent max-w-md"></div>
          </motion.div>

          {/* Enhanced Trust Indicators */}
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-8 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800/30 dark:to-blue-700/30 rounded-full flex items-center justify-center mb-3">
                <UserCheck size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-6">Supported by Malaysian health professionals</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 dark:from-teal-800/30 dark:to-teal-700/30 rounded-full flex items-center justify-center mb-3">
                <Shield size={24} className="text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-6">Completely anonymous - no data stored</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-800/30 dark:to-pink-700/30 rounded-full flex items-center justify-center mb-3">
                <Heart size={24} className="text-pink-600 dark:text-pink-400" />
              </div>
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-6">Questions welcomed, judgment left at the door</span>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}