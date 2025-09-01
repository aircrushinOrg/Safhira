import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface DecorativeHeartsProps {
  variant: 'text' | 'image';
}

export function DecorativeHearts({ variant }: DecorativeHeartsProps) {
  if (variant === 'text') {
    return (
      <>
        <motion.div
          className="absolute -top-8 -left-4 text-pink-300 dark:text-pink-500"
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Heart size={32} fill="currentColor" />
        </motion.div>
        
        <motion.div
          className="absolute top-4 -right-8 text-teal-300 dark:text-teal-500"
          animate={{ 
            y: [0, -12, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <Heart size={24} fill="currentColor" />
        </motion.div>
      </>
    );
  }

  if (variant === 'image') {
    return (
      <>
        <motion.div
          className="absolute -top-4 right-12 text-rose-300 dark:text-rose-500 z-20"
          animate={{ 
            y: [0, -8, 0],
            rotate: [0, -15, 0]
          }}
          transition={{ 
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          <Heart size={20} fill="currentColor" />
        </motion.div>
        
        <motion.div
          className="absolute bottom-8 -left-4 text-purple-300 dark:text-purple-500 z-20"
          animate={{ 
            y: [0, -6, 0],
            x: [0, 5, 0]
          }}
          transition={{ 
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        >
          <Heart size={18} fill="currentColor" />
        </motion.div>
      </>
    );
  }

  return null;
}