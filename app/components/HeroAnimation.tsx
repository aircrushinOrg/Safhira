'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Bot, BookOpen, Hospital, Lightbulb } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';

interface Quote {
  heading: string;
  headingHighlighted: string;
  subheading: string;
  image: string;
  icon: React.ComponentType<any>;
  buttons?: Array<{
    text: string;
    href: string;
    variant?: 'default' | 'outline';
  }>;
}

const quotes: Quote[] = [
  {
    heading: "Your Safe Space for ",
    headingHighlighted: "Learning Sexual Health",
    subheading: "Explore relationships and reproductive health in a safe, stigma-free environment where your questions are always welcomed.",
    image: "/landing-hero-1.png",
    icon: Heart
  },
  {
    heading: "Your AI-powered ",
    headingHighlighted: "Sexual Health Companion",
    subheading: "Get personalized, confidential answers through our AI chatbot, designed to guide you with empathy and reliable information.",
    image: "/landing-hero-2.png",
    icon: Bot,
    buttons: [
      { text: "Start Chatting", href: "/chat" }
    ]
  },
  {
    heading: "Empowering You with ",
    headingHighlighted: "Knowledge and Support",
    subheading: "Access reliable information on STIs, contraception, and relationships, so you can make informed decisions with confidence.",
    image: "/landing-hero-3.png",
    icon: BookOpen,
    buttons: [
      { text: "STIs Info Hub", href: "/stis" },
      { text: "Living Well with STIs", href: "/living-well-with-sti", variant: "outline" }
    ]
  },
  {
    heading: "Find Nearby Providers for ",
    headingHighlighted: "Sexual Healthcare",
    subheading: "Locate trusted local clinics and services nearby, helping you access sexual healthcare easily when the need arises.",
    image: "/landing-hero-4.png",
    icon: Hospital,
    buttons: [
      { text: "Find Services", href: "/sti-services" }
    ]
  },
  {
    heading: "Myth or Truth? ",
    headingHighlighted: "Find Out Now",
    subheading: "Challenge what you know and uncover the facts about sexual health with our interactive quizzes.",
    image: "/landing-hero-5.png",
    icon: Lightbulb,
    buttons: [
      { text: "Take Quiz", href: "/quiz" }
    ]
  }
];

export function HeroAnimation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [nextIndex, setNextIndex] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [autoplayKey, setAutoplayKey] = useState(0);
  const [progress, setProgress] = useState(0);

  const changeSlide = useCallback((newIndex: number, slideDirection: 'next' | 'prev' = 'next', isManual: boolean = false) => {
    if ((isAnimating && !isInitialLoad) || newIndex === currentIndex) return;
    
    // If it's initial load, allow first manual change
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
    
    // Reset autoplay timer if manual interaction
    if (isManual) {
      setAutoplayKey(prev => prev + 1);
      setProgress(0);
    }
    
    setIsAnimating(true);
    setNextIndex(newIndex);
    setDirection(slideDirection);
    
    // Update current index just before animation completes
    setTimeout(() => {
      setCurrentIndex(newIndex);
    }, 1900); // Just before animation completes
    
    // Complete animation sequence
    setTimeout(() => {
      setIsAnimating(false);
      setProgress(0);
    }, 2000);
  }, [isAnimating, isInitialLoad, currentIndex]);

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

  // Autoplay functionality
  useEffect(() => {
    if (isInitialLoad || isAnimating) return;
    
    setProgress(0);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / 50); // 30 intervals over 3 seconds
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 100);
    
    const autoplayTimer = setTimeout(() => {
      const newIndex = (currentIndex + 1) % quotes.length;
      changeSlide(newIndex, 'next');
    }, 5000); // Change slide every 5 seconds
    
    return () => {
      clearTimeout(autoplayTimer);
      clearInterval(progressInterval);
    };
  }, [currentIndex, isAnimating, isInitialLoad, autoplayKey, changeSlide]);

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
              opacity: 1.0,
              clipPath: "circle(150% at 80% 50%)"
            }}
          />
          <div 
            className="absolute inset-0 bg-gradient-to-b from-rose-700/20 to-teal-500/20 z-20"
            style={{
              clipPath: "circle(150% at 80% 50%)"
            }}
          />
        </>
      )}

      {/* Animation Layers */}
      <AnimatePresence>
        {isAnimating && isInitialLoad && (
          /* Initial Load Animation */
          <React.Fragment key="initial-load">
            <motion.div
              className="absolute inset-0 bg-cover bg-center z-10"
              style={{
                backgroundImage: `url('${quotes[0].image}')`,
                opacity: 1.0,
              }}
              initial={{
                clipPath: "circle(15% at 80% 50%)",
                y: "100%"
              }}
              animate={{
                clipPath: "circle(150% at 80% 50%)",
                y: 0
              }}
              transition={{
                clipPath: { duration: 1.2, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] },
                y: { duration: 1.0, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }
              }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-rose-700/20 to-teal-500/20 z-20"
              initial={{
                clipPath: "circle(15% at 80% 50%)",
                y: "100%"
              }}
              animate={{
                clipPath: "circle(150% at 80% 50%)",
                y: 0
              }}
              transition={{
                clipPath: { duration: 1.2, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] },
                y: { duration: 1.0, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }
              }}
            />
          </React.Fragment>
        )}
        
        {isAnimating && !isInitialLoad && (
          <React.Fragment key={`transition-${nextIndex}`}>
            {/* Current image pinching and sliding out */}
            <motion.div
              className="absolute inset-0 bg-cover bg-center z-10"
              style={{
                backgroundImage: `url('${quotes[currentIndex].image}')`,
                opacity: 1.0,
              }}
              initial={{
                clipPath: "circle(150% at 80% 50%)",
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
              className="absolute inset-0 bg-gradient-to-b from-rose-700/20 to-teal-500/20 z-20"
              initial={{
                clipPath: "circle(150% at 80% 50%)",
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
                backgroundImage: `url('${quotes[nextIndex].image}')`,
                opacity: 1.0,
              }}
              initial={{
                clipPath: "circle(15% at 80% 50%)",
                y: direction === 'next' ? "100%" : "-100%"
              }}
              animate={{
                clipPath: "circle(150% at 80% 50%)",
                y: 0
              }}
              transition={{
                clipPath: { duration: 1.0, delay: 1.0, ease: [0.25, 0.1, 0.25, 1] },
                y: { duration: 1.0, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }
              }}
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-rose-700/20 to-teal-500/20 z-20"
              initial={{
                clipPath: "circle(15% at 80% 50%)",
                y: direction === 'next' ? "100%" : "-100%"
              }}
              animate={{
                clipPath: "circle(150% at 80% 50%)",
                y: 0
              }}
              transition={{
                clipPath: { duration: 1.0, delay: 1.0, ease: [0.25, 0.1, 0.25, 1] },
                y: { duration: 1.0, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }
              }}
            />
          </React.Fragment>
        )}
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="absolute inset-0 z-50 flex w-screen items-center justify-center py-16 px-8 md:px-16">
        <div className="text-center md:max-w-4xl">
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
              <div className="flex flex-col items-center mb-6">
                {React.createElement(quotes[currentIndex].icon, {
                  className: "w-12 h-12 md:w-16 md:h-16 mb-4 text-purple-400"
                })}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight text-center">
                  {quotes[currentIndex].heading}
                  <br />
                  <span className="bg-gradient-to-r from-rose-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">{quotes[currentIndex].headingHighlighted}</span>
                </h1>
              </div>
              <h2 className="text-lg md:text-xl text-white/80 font-normal mb-6">
                {quotes[currentIndex].subheading}
              </h2>
              
              {/* Dynamic Buttons */}
              {quotes[currentIndex].buttons && (
                <div className={`flex gap-4 justify-center ${quotes[currentIndex].buttons!.length > 1 ? 'flex-col sm:flex-row' : ''}`}>
                  {quotes[currentIndex].buttons!.map((button, index) => (
                    <Link key={index} href={button.href} className="w-full md:w-auto">
                      <Button 
                        className={
                          button.variant === 'outline' 
                            ? "bg-transparent border-2 border-white text-white hover:bg-purple-400 font-medium px-4 md:px-6 py-3 md:py-4 w-full h-full text-lg"
                            : "bg-gradient-to-r from-rose-400 via-purple-400 to-teal-400 hover:from-rose-500 hover:via-purple-500 hover:to-teal-500 text-white border-0 font-medium px-4 md:px-6 py-3 md:py-4 w-full h-full text-lg transition-all duration-200"
                        }
                      >
                        {button.text}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Dots and Progress Bar */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center space-y-4">
        {/* Progress Bar */}
        {!isInitialLoad && !isAnimating && (
          <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-400 rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        
        {/* Navigation Dots */}
        <div className="flex space-x-3">
          {quotes.map((_, index) => (
            <button
              key={index}
              onClick={() => changeSlide(index, index > currentIndex ? 'next' : 'prev', true)}
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
    </div>
  );
}