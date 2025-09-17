"use client";

import { motion } from 'framer-motion';
import { DecorativeHearts } from './HeroDecorativeHearts';
import { FeatureLabels } from './HeroFeatureLabels';
import { Button } from '../ui/button';
import { BookOpen, MessageCircle } from 'lucide-react';
import {useRouter} from '../../../i18n/routing';
import Image from 'next/image';
import heroImage from '../../../public/landing-hero.png';
import {useTranslations} from 'next-intl';

export function HeroSection() {
  const router = useRouter();
  const t = useTranslations('Landing');
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  const buttonVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  const handleLearnSTIs = () => {
    router.push('/stis');
  };

  const handleChatAI = () => {
    router.push('/chat');
  };

  return (
    <section className="min-h-screen max-w-screen flex justify-center items-center relative py-16 px-8 md:px-16 bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-pink-950 dark:via-gray-800 dark:to-teal-950 overflow-hidden">
      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-8 items-center h-full w-full max-w-7xl mx-auto">
        {/* Text Content */}
        <motion.div 
          className="flex flex-col flex-1 gap-8 lg:pr-8 relative w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >

          <motion.h1 
            className="text-4xl text-center lg:text-left md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-gray-100 leading-tight"
            variants={itemVariants}
          >
            {t('hero.titlePrefix')} <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-teal-500 dark:from-rose-400 dark:via-purple-400 dark:to-teal-400 bg-clip-text text-transparent">{t('hero.titleHighlight')}</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg text-center md:text-xl lg:text-left text-gray-600 dark:text-gray-300 leading-relaxed"
            variants={itemVariants}
          >
            {t('hero.subtitle')}
          </motion.p>

          <FeatureLabels variants={itemVariants} />

          <motion.div className="flex flex-col md:flex-row gap-4 justify-center lg:justify-start items-center" variants={buttonVariants}>
            <Button 
              size="lg"
              variant="default"
              className="flex w-full md:w-auto h-full px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-rose-500 via-purple-500 to-teal-500 dark:from-rose-400 dark:via-purple-400 dark:to-teal-400 hover:from-rose-600 hover:via-purple-600 hover:to-teal-600 dark:hover:from-rose-500 dark:hover:via-purple-500 dark:hover:to-teal-500 text-md text-white dark:text-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 items-center space-x-2"
              onClick={handleLearnSTIs}
            >
              <BookOpen size={24} />
              <span>{t('hero.learn')}</span>
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="flex w-full md:w-auto h-full py-3 md:py-4 bg-transparent border-2 border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white text-md dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-400 dark:hover:text-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 items-center space-x-2"
              onClick={handleChatAI}
            >
              <MessageCircle size={24} />
              <span>{t('hero.chat')}</span>
            </Button>
          </motion.div>

          {/* Additional decorative hearts */}
          <DecorativeHearts variant="text" />
        </motion.div>

        <motion.div 
          className="flex-shrink-0 relative"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Main Image Container - Fixed size to prevent shrinking */}
          <motion.div 
            className=""
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={heroImage}
              alt="Diverse group of young people smiling together"
              width={500}
              height={500}
              className="object-cover w-full h-full rounded-3xl"
              priority
              quality={85}
            />
          </motion.div>

          {/* Additional decorative hearts */}
          <DecorativeHearts variant="image" />
        </motion.div>
      </div>
    </section>
  );
}
