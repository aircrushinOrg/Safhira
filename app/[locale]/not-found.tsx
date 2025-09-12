'use client'

import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Home, Search, MessageCircle, BookOpen } from 'lucide-react';
import {Link} from '../../i18n/routing';
import { motion } from 'framer-motion';
import {useTranslations} from 'next-intl';
import Image from 'next/image';

export default function NotFound() {
  const t = useTranslations('NotFound');
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
                  src="/undraw_medicine_hqqg.svg"
                  alt="Medical illustration"
                  width={200}
                  height={200}
                  className="w-48 h-48 md:w-64 md:h-64"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                404
              </h1>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
                {t('title', { default: 'Page Not Found' })}
              </h2>
            </motion.div>

            <motion.div variants={itemVariants}>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
                {t('description', { default: "The page you're looking for doesn't exist or may have been moved. Don't worry, we're here to help you find what you need for your sexual health journey." })}
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Link href="/" className="w-full">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                    <Home size={16} className="mr-2" />
                    {t('home')}
                  </Button>
                </Link>
                
                <Link href="/stis" className="w-full">
                  <Button variant="outline" className="w-full">
                    <BookOpen size={16} className="mr-2" />
                    {t('learnStis')}
                  </Button>
                </Link>
                
                <Link href="/chat" className="w-full">
                  <Button variant="outline" className="w-full">
                    <MessageCircle size={16} className="mr-2" />
                    {t('chatAi')}
                  </Button>
                </Link>

                <Link href="/quiz" className="w-full">
                  <Button variant="secondary" className="w-full">
                    <Search size={16} className="mr-2" />
                    {t('takeQuiz')}
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
                  {t('popular')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <Link 
                    href="/stis" 
                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 p-2 rounded hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                  >
                    {t('stiBasics')}
                  </Link>
                  <Link 
                    href="/stis/prevention" 
                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 p-2 rounded hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                  >
                    {t('prevention')}
                  </Link>
                  <Link 
                    href="/rights" 
                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 p-2 rounded hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                  >
                    {t('testing')}
                  </Link>
                  <Link 
                    href="/quiz" 
                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 p-2 rounded hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                  >
                    {t('mythsFacts')}
                  </Link>
                  <Link 
                    href="/stis/chlamydia" 
                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 p-2 rounded hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                  >
                    {t('chlamydia')}
                  </Link>
                  <Link 
                    href="/stis/hiv" 
                    className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 p-2 rounded hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                  >
                    {t('hiv')}
                  </Link>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Need immediate help? Our AI assistant is available 24/7 to answer your questions about sexual health.
                </p>
              </div>
            </motion.div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

