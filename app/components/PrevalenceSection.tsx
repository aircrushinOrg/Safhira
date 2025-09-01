'use client'

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
            <div className="mb-4 sm:mb-6 text-center flex flex-col w-full justify-center items-center">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4 px-2">
                The Reality Across Malaysia
              </h1>
              <p className="text-md text-center md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                The conversations we just talked about? They matter more than you might think. Across Malaysia, many young people lack access to judgment-free sexual health information. When we don&apos;t talk openly about these topics, it shows up in the data.
              </p>
            </div>
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