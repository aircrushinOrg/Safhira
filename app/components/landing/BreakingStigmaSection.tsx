'use client'

import { Card } from '../ui/card';
import { Heart, MessageCircle, Users } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

export function BreakingStigmaSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div 
      ref={ref}
      className="bg-white dark:bg-slate-800 overflow-hidden max-w-screen"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <section className="py-8 sm:py-12 lg:py-16 px-8 md:px-16">
        <div className="container mx-auto max-w-7xl">
          
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6">
              Breaking the Silence, <span className="bg-gradient-to-r from-rose-500 via-purple-500 to-teal-500 dark:from-rose-400 dark:via-purple-400 dark:to-teal-400 bg-clip-text text-transparent">Ending the Stigma</span>
            </h1>
            <p className="text-md text-center md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Ever felt like it’s hard to talk about sexual health? Safhira is your space to ask, share, and be heard.              
            </p>
          </div>

          {/* Main Content Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Intro Hook Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="p-6 bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-start space-x-3 mb-4">
                    <MessageCircle className="text-pink-500 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="font-semibold text-pink-800 dark:text-pink-100 mb-3 text-lg sm:text-xl">
                        You&apos;re Not Alone in This
                      </h3>
                    </div>
                  </div>
                  <p className="text-pink-700 dark:text-pink-300 text-sm sm:text-base leading-relaxed flex-grow mb-4">
                    It’s okay to feel unsure or afraid about your sexual health, many people do. But you don’t have to face it by yourself.
                  </p>
                  <div className="flex justify-center mb-4">
                    <Image
                      src="/landing-question.png"
                      alt="People asking questions about sexual health"
                      width={200}
                      height={200}
                      className="w-full max-w-[240px] h-auto"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Empathy & Purpose Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="p-6 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-start space-x-3 mb-4">
                    <Heart className="text-purple-500 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-3 text-lg sm:text-xl">
                        We&apos;re Here for You
                      </h3>
                    </div>
                  </div>
                  <p className="text-purple-700 dark:text-purple-300 text-sm sm:text-base leading-relaxed flex-grow mb-4">
                    Safhira is a safe, kind, and judgment-free space where you can ask anything sexual health related and feel supported.                
                  </p>
                  <div className="flex justify-center mb-4">
                    <Image
                      src="/landing-here-for-you.png"
                      alt="Support and being there for each other"
                      width={200}
                      height={200}
                      className="w-full max-w-[240px] h-auto"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Empowerment Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="p-6 bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-start space-x-3 mb-4">
                    <Users className="text-teal-500 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h3 className="font-semibold text-teal-800 dark:text-teal-200 mb-3 text-lg sm:text-xl">
                        Together, We Break the Silence
                      </h3>
                    </div>
                  </div>
                  <p className="text-teal-700 dark:text-teal-300 text-sm sm:text-base leading-relaxed flex-grow mb-4">
                    When we open up, we break shame. By learning and supporting each other, we make sexual health a normal part of life.
                  </p>
                  <div className="flex justify-center">
                    <Image
                      src="/landing-work-together.png"
                      alt="People working together and supporting each other"
                      width={200}
                      height={200}
                      className="w-full max-w-[240px] h-auto"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}