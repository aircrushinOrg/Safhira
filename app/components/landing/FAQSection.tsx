/**
 * FAQ section component providing answers to common questions about STI education, privacy, and platform usage.
 * This component features an accordion interface with categorized questions covering medical, privacy, and platform concerns.
 * Designed to address user concerns and provide clear, accessible information about sexual health topics and platform policies.
 */
'use client'

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { Card } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { HelpCircle, ShieldCheck, Lock, Info, MessageCircle, Stethoscope } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const t = useTranslations('Landing');

  const sexualFaqKeys = ['q1', 'q2', 'q3', 'q4', 'q5'] as const;
  const websiteFaqKeys = ['q1', 'q2', 'q3', 'q4'] as const;

  const sexualIcon = <HelpCircle className="text-pink-500" size={18} />;
  const websiteIcon = <Info className="text-indigo-500" size={18} />;

  return (
    <motion.div
      ref={ref}
      className="bg-white dark:bg-slate-800 overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <section className="py-8 sm:py-12 lg:py-16 px-8 md:px-16">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <motion.h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {t('faq.title')}
            </motion.h2>
            <motion.p
              className="text-md text-center md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t('faq.subtitle')}
            </motion.p>
          </div>

          {/* FAQ Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Sexual Health FAQ */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <Card className="p-6 bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 h-full">
                <div className="flex items-center gap-2 mb-4">
                  {sexualIcon}
                  <h3 className="font-semibold text-pink-800 dark:text-pink-100 text-lg">
                    {t('faq.categories.sexual')}
                  </h3>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {sexualFaqKeys.map((k) => (
                    <AccordionItem key={k} value={`sexual-${k}`}>
                      <AccordionTrigger className="text-pink-800 dark:text-pink-100">
                        {t(`faq.items.sexual.${k}.q`) as string}
                      </AccordionTrigger>
                      <AccordionContent className="text-pink-700 dark:text-pink-300">
                        {t(`faq.items.sexual.${k}.a`) as string}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            </motion.div>

            {/* Website FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              <Card className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 h-full">
                <div className="flex items-center gap-2 mb-4">
                  {websiteIcon}
                  <h3 className="font-semibold text-indigo-800 dark:text-indigo-100 text-lg">
                    {t('faq.categories.website')}
                  </h3>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {websiteFaqKeys.map((k) => (
                    <AccordionItem key={k} value={`website-${k}`}>
                      <AccordionTrigger className="text-indigo-800 dark:text-indigo-100">
                        {t(`faq.items.website.${k}.q`) as string}
                      </AccordionTrigger>
                      <AccordionContent className="text-indigo-700 dark:text-indigo-300">
                        {t(`faq.items.website.${k}.a`) as string}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                <Link href="/chat" className="block mt-6">
                  <div className="rounded-lg border border-indigo-200/60 dark:border-indigo-800/60 bg-white/60 dark:bg-slate-900/40 p-4 hover:bg-indigo-50/80 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <MessageCircle className="text-indigo-500" size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-indigo-800 dark:text-indigo-200 font-medium">
                          {t('faq.more.title')}
                        </p>
                        <p className="text-sm text-indigo-700 dark:text-indigo-300">
                          {t('faq.more.subtitle')}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

