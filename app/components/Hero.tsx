import { motion } from 'framer-motion';
import { DecorativeHearts } from './DecorativeHearts';
import { FeatureLabels } from './FeatureLabels';
import { Button } from './ui/button';
import { BookOpen, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export function Hero() {
  const router = useRouter();
  
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
    <section className="min-h-screen max-w-screen flex justify-center items-center relative py-16 px-4 bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-pink-950 dark:via-gray-800 dark:to-teal-950 overflow-hidden">
      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-8 items-center h-full w-full max-w-7xl mx-auto px-4">
        {/* Left Side - Text Content */}
        <motion.div 
          className="flex flex-col flex-1 gap-8 lg:pr-8 relative"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Decorative Hearts around text */}
          <DecorativeHearts variant="text" />

          <motion.h1 
            className="text-4xl text-center lg:text-left md:text-5xl lg:text-6xl font-bold text-gray-800 dark:text-gray-100 leading-tight"
            variants={itemVariants}
          >
            Your Safe Space for <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-teal-500 dark:from-rose-400 dark:via-purple-400 dark:to-teal-400 bg-clip-text text-transparent">Sexual Health</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg text-center md:text-xl lg:text-left text-gray-600 dark:text-gray-300 leading-relaxed"
            variants={itemVariants}
          >
            Built for young Malaysians, we&apos;re making conversations about relationships, consent, and reproductive health feel normal, kind, and stigma-free.
          </motion.p>

          <FeatureLabels variants={itemVariants} />

          <motion.div className="flex flex-row gap-4 justify-center lg:justify-start items-center" variants={buttonVariants}>
            <Button 
              size="lg"
              variant="default"
              className="px-6 py-6 md:py-8 bg-gradient-to-r from-rose-500 via-purple-500 to-teal-500 dark:from-rose-400 dark:via-purple-400 dark:to-teal-400 hover:from-rose-600 hover:via-purple-600 hover:to-teal-600 dark:hover:from-rose-500 dark:hover:via-purple-500 dark:hover:to-teal-500 text-md text-white dark:text-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
              onClick={handleLearnSTIs}
            >
              <BookOpen size={24} />
              <span>Learn About STIs</span>
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="px-6 py-6 md:py-8 bg-transparent border-2 border-pink-500 text-pink-600 hover:bg-pink-500 hover:text-white text-md dark:border-pink-400 dark:text-pink-400 dark:hover:bg-pink-400 dark:hover:text-slate-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
              onClick={handleChatAI}
            >
              <MessageCircle size={24} />
              <span>Chat with AI</span>
            </Button>
          </motion.div>
        </motion.div>

        {/* Right Side - Image */}
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
              src="/hero.png"
              alt="Diverse group of young people smiling together"
              width={500}
              height={500}
              className="object-cover w-full h-full rounded-3xl"
            />
          </motion.div>

          {/* Additional decorative hearts */}
          <DecorativeHearts variant="image" />
        </motion.div>
      </div>
    </section>
  );
}