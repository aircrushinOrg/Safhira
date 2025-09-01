'use client';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function ChatAboutPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [-4, 4, -4],
      transition: {
        duration: 3,
        repeat: Infinity
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
        >
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-16 relative"
            variants={itemVariants}
          >
            <div className="inline-flex items-center gap-3 mb-6 p-3 rounded-full bg-primary/5 border border-primary/10">
              <motion.div
                variants={floatingVariants}
                initial="initial"
                animate="animate"
                className="w-8 h-8 text-primary"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9C9 10.1 9.9 11 11 11V13C10.4 13 9.9 13.2 9.5 13.5L7.1 15.9C6.8 16.2 6.8 16.7 7.1 17C7.4 17.3 7.9 17.3 8.2 17L10.6 14.6C10.8 14.4 11.1 14.3 11.4 14.3H12.6C12.9 14.3 13.2 14.4 13.4 14.6L15.8 17C16.1 17.3 16.6 17.3 16.9 17C17.2 16.7 17.2 16.2 16.9 15.9L14.5 13.5C14.1 13.2 13.6 13 13 13V11C14.1 11 15 10.1 15 9Z"/>
                </svg>
              </motion.div>
              <span className="text-sm font-medium text-primary">Advanced AI Assistant</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
              Safhira Chat
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Next-generation AI assistant powered by{' '}
              <span className="text-primary font-semibold">Large Language Models</span>,{' '}
              <span className="text-primary font-semibold">Retrieval-Augmented Generation</span>, and{' '}
              <span className="text-primary font-semibold">Real-time Intelligence</span>
            </p>
          </motion.div>

          {/* Technical Architecture Cards */}
          <motion.div 
            className="grid md:grid-cols-3 gap-8 mb-16"
            variants={itemVariants}
          >
            {/* LLM + RAG Card */}
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"/>
                      <path d="M17.5 18L18.5 20.5L21 21.5L18.5 22.5L17.5 25L16.5 22.5L14 21.5L16.5 20.5L17.5 18Z"/>
                      <path d="M6.5 7L7.5 9.5L10 10.5L7.5 11.5L6.5 14L5.5 11.5L3 10.5L5.5 9.5L6.5 7Z"/>
                    </svg>
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">LLM + RAG System</CardTitle>
                    <CardDescription>Neural Processing Core</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Large Language Model enhanced with Retrieval-Augmented Generation, 
                  over 1 million of tokenized data in our knowledge base of sexual health information.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                    Open Source LLM
                  </span>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                    Vector Search
                  </span>
                  <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
                    Context Injection
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Web Search Card */}
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white"
                    whileHover={{ scale: 1.05, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                      <circle cx="9.5" cy="9.5" r="1.5"/>
                    </svg>
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">Web Search Engine</CardTitle>
                    <CardDescription>Real-time Intelligence</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Powered by Tavily&apos;s advanced search API, providing real-time access to the 
                  latest medical research, health guidelines, and trusted healthcare information 
                  from across the web.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                    Tavily API
                  </span>
                  <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                    Real-time Search
                  </span>
                  <span className="px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs rounded-full">
                    Source Verification
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Google Maps Card */}
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">Location Services</CardTitle>
                    <CardDescription>Geographic Intelligence</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  Google Maps integration enables location-aware recommendations for healthcare 
                  facilities, testing centers, and medical services, providing personalized 
                  geographic assistance.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-full">
                    Google Maps MCP
                  </span>
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full">
                    Location Search
                  </span>
                  <span className="px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-xs rounded-full">
                    Healthcare Finder
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
