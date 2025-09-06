'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Quote {
  text: string;
  author: string;
  image: string;
}

const quotes: Quote[] = [
  {
    text: "Your Safe Space for Learning Sexual Health",
    author: "John Wooden",
    image: "/landing-hero-1.png"
  },
  {
    text: "Wherever you go, go with all your heart.",
    author: "Confucius",
    image: "/landing-hero-2.png"
  },
  {
    text: "Believe you can and you're halfway there.",
    author: "Theodore Roosevelt",
    image: "/landing-hero-3.png"
  }
];

export function HeroAnimation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [nextIndex, setNextIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const changeSlide = (newIndex: number, slideDirection: 'next' | 'prev' = 'next') => {
    if ((isAnimating && !isInitialLoad) || newIndex === currentIndex) return;
    
    // If it's initial load, allow first manual change
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
    
    setIsAnimating(true);
    setNextIndex(newIndex);
    setDirection(slideDirection);
    
    // Update current index right before the expanding animation completes
    setTimeout(() => {
      setCurrentIndex(newIndex);
    }, 1600); // Right when the new image starts expanding
    
    // Complete animation sequence
    setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
  };

  const nextSlide = () => {
    const newIndex = (currentIndex + 1) % quotes.length;
    changeSlide(newIndex, 'next');
  };

  const prevSlide = () => {
    const newIndex = (currentIndex - 1 + quotes.length) % quotes.length;
    changeSlide(newIndex, 'prev');
  };

  // Initial load animation
  useEffect(() => {
    if (isInitialLoad) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setIsInitialLoad(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isInitialLoad]);

  // Auto-advance disabled - slides only change on user interaction

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-pink-950 dark:via-gray-800 dark:to-teal-950 overflow-hidden">
      {/* Static Background - Always black when transitioning */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-pink-950 dark:via-gray-800 dark:to-teal-950" />

      {/* Current Image - Visible when not animating */}
      {!isAnimating && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center z-10"
            style={{
              backgroundImage: `url('${quotes[currentIndex].image}')`,
              clipPath: "circle(60% at 80% 50%)"
            }}
          />
          <div 
            className="absolute inset-0 bg-gradient-to-b from-rose-700/40 to-teal-500/40 z-20"
            style={{
              clipPath: "circle(60% at 80% 50%)"
            }}
          />
        </>
      )}

      {/* Animation Layers */}
      <AnimatePresence>
        {isAnimating && isInitialLoad && (
          /* Initial Load Animation */
          <>
            <motion.div
              className="absolute inset-0 bg-cover bg-center z-10"
              style={{
                backgroundImage: `url('${quotes[0].image}')`
              }}
              initial={{
                clipPath: "circle(15% at 80% 50%)",
                y: "100%"
              }}
              animate={{
                clipPath: "circle(60% at 80% 50%)",
                y: 0
              }}
              transition={{
                clipPath: { duration: 1.2, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] },
                y: { duration: 1.0, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }
              }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-rose-700/40 to-teal-500/40 z-20"
              initial={{
                clipPath: "circle(15% at 80% 50%)",
                y: "100%"
              }}
              animate={{
                clipPath: "circle(60% at 80% 50%)",
                y: 0
              }}
              transition={{
                clipPath: { duration: 1.2, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] },
                y: { duration: 1.0, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }
              }}
            />
          </>
        )}
        
        {isAnimating && !isInitialLoad && (
          <>
            {/* Current image pinching and sliding out */}
            <motion.div
              className="absolute inset-0 bg-cover bg-center z-10"
              style={{
                backgroundImage: `url('${quotes[currentIndex].image}')`
              }}
              initial={{
                clipPath: "circle(60% at 80% 50%)",
                y: 0
              }}
              animate={{
                clipPath: "circle(15% at 80% 50%)",
                y: direction === 'next' ? "-100%" : "100%"
              }}
              transition={{
                clipPath: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] },
                y: { duration: 1.2, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }
              }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-rose-700/40 to-teal-500/40 z-20"
              initial={{
                clipPath: "circle(60% at 80% 50%)",
                y: 0
              }}
              animate={{
                clipPath: "circle(15% at 80% 50%)",
                y: direction === 'next' ? "-100%" : "100%"
              }}
              transition={{
                clipPath: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] },
                y: { duration: 1.2, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }
              }}
            />
            
            {/* New image sliding in and expanding */}
            <motion.div
              className="absolute inset-0 bg-cover bg-center z-10"
              style={{
                backgroundImage: `url('${quotes[nextIndex].image}')`
              }}
              initial={{
                clipPath: "circle(15% at 80% 50%)",
                y: direction === 'next' ? "100%" : "-100%"
              }}
              animate={{
                clipPath: "circle(60% at 80% 50%)",
                y: 0
              }}
              transition={{
                clipPath: { duration: 1.0, delay: 1.0, ease: [0.25, 0.1, 0.25, 1] },
                y: { duration: 1.0, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }
              }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-rose-700/40 to-teal-500/40 z-20"
              initial={{
                clipPath: "circle(15% at 80% 50%)",
                y: direction === 'next' ? "100%" : "-100%"
              }}
              animate={{
                clipPath: "circle(60% at 80% 50%)",
                y: 0
              }}
              transition={{
                clipPath: { duration: 1.0, delay: 1.0, ease: [0.25, 0.1, 0.25, 1] },
                y: { duration: 1.0, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-50 flex items-center justify-start py-16 px-8 md:px-16">
        <div className="text-left max-w-2xl mr-auto">
          {/* Quote Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 30 }}
              animate={{ 
                opacity: isAnimating ? 0 : 1, 
                y: isAnimating ? 30 : 0 
              }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ 
                duration: 0.3,
                ease: "easeOut" 
              }}
              className="mb-8"
            >
              <blockquote className="text-3xl md:text-5xl lg:text-6xl font-light text-black mb-6 leading-tight">
                "{quotes[currentIndex].text}"
              </blockquote>
              <cite className="text-xl md:text-2xl text-white/80 font-medium">
                - {quotes[currentIndex].author}
              </cite>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {/* <div className="flex items-center space-x-4 mt-8">
            <button
              onClick={prevSlide}
              disabled={isAnimating}
              className="p-4 rounded-full bg-transparent hover:bg-slate-200 dark:hover:bg-slate-100/20 text-slate-900 dark:text-white transition-all duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={32} />
            </button>

            <button
              onClick={nextSlide}
              disabled={isAnimating}
              className="p-4 rounded-full bg-transparent hover:bg-slate-200 dark:hover:bg-slate-100/20 text-slate-900 dark:text-white transition-all duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={32} />
            </button>
          </div> */}

        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 flex space-x-3">
        {quotes.map((_, index) => (
          <button
            key={index}
            onClick={() => changeSlide(index, index > currentIndex ? 'next' : 'prev')}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            disabled={isAnimating}
          />
        ))}
      </div>
    </div>
  );
}