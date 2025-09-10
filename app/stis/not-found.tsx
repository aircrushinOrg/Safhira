'use client'

import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import {Link} from '../../i18n/routing';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function STINotFound() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div 
        className="container mx-auto px-4 py-8 md:py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-8 md:p-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
            <motion.div variants={itemVariants}>
              <div className="flex justify-center mb-6">
                <Image
                  src="/undraw_doctors.svg"
                  alt="Doctors illustration"
                  width={200}
                  height={200}
                  className="w-48 h-48 md:w-56 md:h-56"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-yellow-500" size={32} />
                </div>
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                STI Information Not Found
              </h1>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                The STI information you&apos;re looking for doesn&apos;t exist or may have been moved. 
                Please check the URL or browse our available STI information below.
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link href="/stis" className="w-full sm:w-auto">
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white w-full sm:w-auto">
                    <ArrowLeft size={16} className="mr-2" />
                    Browse All STIs
                  </Button>
                </Link>
                
                <Link href="/" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Home size={16} className="mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-6">
                  Available STI Information:
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Chlamydia', href: '/stis/chlamydia' },
                    { name: 'Gonorrhea', href: '/stis/gonorrhea' },
                    { name: 'Herpes', href: '/stis/herpes' },
                    { name: 'HPV', href: '/stis/hpv' },
                    { name: 'HIV', href: '/stis/hiv' },
                    { name: 'Syphilis', href: '/stis/syphilis' }
                  ].map((sti, index) => (
                    <motion.div 
                      key={sti.name}
                      variants={itemVariants}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link 
                        href={sti.href} 
                        className="block text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 p-3 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-800"
                      >
                        <span className="font-medium">{sti.name}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Can&apos;t find what you&apos;re looking for? Try our AI assistant for personalized sexual health information.
                </p>
              </div>
            </motion.div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
} 
