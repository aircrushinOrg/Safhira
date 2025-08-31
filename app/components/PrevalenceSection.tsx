'use client'

import { Card } from './ui/card';
import { Heart } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { STIChoroplethChart } from './STIChoroplethChart';

export function PrevalenceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.div 
      ref={ref}
      className="bg-slate-50 dark:bg-slate-900"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <section className="py-8 sm:py-12 lg:py-16 px-3 sm:px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6 sm:mb-8">
            <div className="mb-4 sm:mb-6 text-center">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4 px-2">
                STIs Are More Common Than You Think
              </h1>
            </div>
          
            {/* Supportive Context Statement */}
            <Card className="p-4 sm:p-6 bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 mb-6 sm:mb-8">
              <div className="flex items-start space-x-3">
                <Heart className="text-pink-500 mt-1 flex-shrink-0" size={18} />
                <div>
                  <h3 className="font-semibold text-pink-800 dark:text-pink-200 mb-2 text-sm sm:text-base">
                    You&apos;re Not Alone!
                  </h3>
                  <p className="text-pink-700 dark:text-pink-300 text-sm sm:text-base">
                    STIs affect millions of people worldwide, including many in Malaysia. 
                    The truth is, it’s more common than people think but talking about it is rare.
                    These statistics represent real people from all walks of life: students, professionals, parents, and community 
                    members.
                  </p>
                </div>
              </div>
            </Card>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <STIChoroplethChart />
        </motion.div>
        </div>
      </section>
    </motion.div>
  );
}