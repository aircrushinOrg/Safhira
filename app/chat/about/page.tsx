'use client';

import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import {Link} from '../../../i18n/routing';
import { motion } from 'framer-motion';
import {useTranslations} from 'next-intl';
import { useState, useEffect } from 'react';

export default function ChatAboutPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const t = useTranslations('Chat');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const floatingVariants = {
    initial: { y: 0 },
    animate: {
      y: [-4, 4, -4],
      transition: {
        duration: 3,
        repeat: Infinity
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          className="max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
        >
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-16 relative"
            variants={itemVariants}
          >
            <div className="inline-flex items-center gap-3 mb-6 p-3 rounded-full bg-primary/5 border border-primary/10">
              <motion.div
                variants={floatingVariants}
                initial="initial"
                animate="animate"
                className="w-8 h-8 text-primary"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9C9 10.1 9.9 11 11 11V13C10.4 13 9.9 13.2 9.5 13.5L7.1 15.9C6.8 16.2 6.8 16.7 7.1 17C7.4 17.3 7.9 17.3 8.2 17L10.6 14.6C10.8 14.4 11.1 14.3 11.4 14.3H12.6C12.9 14.3 13.2 14.4 13.4 14.6L15.8 17C16.1 17.3 16.6 17.3 16.9 17C17.2 16.7 17.2 16.2 16.9 15.9L14.5 13.5C14.1 13.2 13.6 13 13 13V11C14.1 11 15 10.1 15 9Z"/>
                </svg>
              </motion.div>
              <span className="text-sm font-medium text-primary">{t('about.hero.badge')}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-teal-600 to-teal-400 bg-clip-text text-transparent">
              {t('about.hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t('about.hero.subtitle')}
            </p>

            {/* Hero CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link href="/chat">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                    <path d="M20 2H4C2.897 2 2 2.897 2 4V22L6 18H20C21.103 18 22 17.103 22 16V4C22 2.897 21.103 2 20 2Z"/>
                  </svg>
                  {t('about.start')}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/privacy-policy">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                    <path d="M12 2L4 5v6c0 5 3.8 9.7 8 11 4.2-1.3 8-6 8-11V5l-8-3zM12 20c-2.8-1.1-6-4.9-6-9V6.3l6-2.2 6 2.2V11c0 4.1-3.2 7.9-6 9z"/>
                  </svg>
                  {t('about.privacy')}
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Technical Architecture Cards */}
          <motion.div 
            className="grid md:grid-cols-3 gap-8 mb-16"
            variants={itemVariants}
          >
            {/* LLM + RAG Card */}
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path d="M12 2L13.09 8.26L19 9L13.09 9.74L12 16L10.91 9.74L5 9L10.91 8.26L12 2Z"/>
                      <path d="M17.5 18L18.5 20.5L21 21.5L18.5 22.5L17.5 25L16.5 22.5L14 21.5L16.5 20.5L17.5 18Z"/>
                      <path d="M6.5 7L7.5 9.5L10 10.5L7.5 11.5L6.5 14L5.5 11.5L3 10.5L5.5 9.5L6.5 7Z"/>
                    </svg>
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">{t('about.architecture.llm.title')}</CardTitle>
                    <CardDescription>{t('about.architecture.llm.subtitle')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.architecture.llm.description')}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                    {t('about.architecture.llm.badges.openSource')}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                    {t('about.architecture.llm.badges.vectorSearch')}
                  </span>
                  <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
                    {t('about.architecture.llm.badges.contextInjection')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Web Search Card */}
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white"
                    whileHover={{ scale: 1.05, rotate: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                      <circle cx="9.5" cy="9.5" r="1.5"/>
                    </svg>
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">{t('about.architecture.webSearch.title')}</CardTitle>
                    <CardDescription>{t('about.architecture.webSearch.subtitle')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.architecture.webSearch.description')}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                    {t('about.architecture.webSearch.badges.tavilyApi')}
                  </span>
                  <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                    {t('about.architecture.webSearch.badges.realTimeSearch')}
                  </span>
                  <span className="px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs rounded-full">
                    {t('about.architecture.webSearch.badges.sourceVerification')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Google Maps Card */}
            <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl">{t('about.architecture.location.title')}</CardTitle>
                    <CardDescription>{t('about.architecture.location.subtitle')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.architecture.location.description')}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-full">
                    {t('about.architecture.location.badges.googleMaps')}
                  </span>
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full">
                    {t('about.architecture.location.badges.locationSearch')}
                  </span>
                  <span className="px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-xs rounded-full">
                    {t('about.architecture.location.badges.healthcareFinder')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Benchmark Results Section */}
          <motion.div
            variants={itemVariants}
            className="mb-16"
          >
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{t('about.benchmark.title')}</h2>
              <p className="text-muted-foreground mt-2">{t('about.benchmark.subtitle')}</p>
            </div>

            {/* Overall Assessment Card */}
            <Card className="mb-8 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200/50 dark:border-emerald-800/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div>
                    <CardTitle className="text-xl text-emerald-800 dark:text-emerald-200">{t('about.benchmark.overall.title')}</CardTitle>
                    <CardDescription className="text-emerald-700 dark:text-emerald-300">{t('about.benchmark.overall.subtitle')}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-emerald-800 dark:text-emerald-200 leading-relaxed">
                  {t('about.benchmark.overall.description')}
                </p>
              </CardContent>
            </Card>

            {/* Benchmark Table */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/>
                    </svg>
                  </div>
                  {t('about.benchmark.tableTitle')}
                </CardTitle>
                <CardDescription>
                  {t('about.benchmark.tableSubtitle')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="mb-6">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                      {t('about.benchmark.positiveQuestions')}
                    </h4>
                    <div className="space-y-3">
                      {[
                        { id: 1, question: t('about.benchmark.questions.q1'), score: "3/3", category: t('about.benchmark.categories.basicKnowledge') },
                        { id: 2, question: t('about.benchmark.questions.q2'), score: "3/3", category: t('about.benchmark.categories.awareness') },
                        { id: 3, question: t('about.benchmark.questions.q3'), score: "3/3", category: t('about.benchmark.categories.transmission') },
                        { id: 4, question: t('about.benchmark.questions.q4'), score: "3/3", category: t('about.benchmark.categories.treatment') },
                        { id: 5, question: t('about.benchmark.questions.q5'), score: "3/3", category: t('about.benchmark.categories.symptoms')},
                        { id: 6, question: t('about.benchmark.questions.q6'), score: "1/3", category: t('about.benchmark.categories.symptoms'), note: t('about.benchmark.results.factualErrorIdentified') },
                        { id: 7, question: t('about.benchmark.questions.q7'), score: "3/3", category: t('about.benchmark.categories.symptoms') },
                        { id: 8, question: t('about.benchmark.questions.q8'), score: "3/3", category: t('about.benchmark.categories.symptoms') },
                        { id: 9, question: t('about.benchmark.questions.q9'), score: "3/3", category: t('about.benchmark.categories.symptoms') },
                        { id: 10, question: t('about.benchmark.questions.q10'), score: "3/3", category: t('about.benchmark.categories.complications') },
                        { id: 11, question: t('about.benchmark.questions.q11'), score: "3/3", category: t('about.benchmark.categories.prevention') },
                        { id: 12, question: t('about.benchmark.questions.q12'), score: "3/3", category: t('about.benchmark.categories.prevention') },
                        { id: 13, question: t('about.benchmark.questions.q13'), score: "3/3", category: t('about.benchmark.categories.testing') },
                        { id: 14, question: t('about.benchmark.questions.q14'), score: "3/3", category: t('about.benchmark.categories.testing') },
                        { id: 15, question: t('about.benchmark.questions.q15'), score: "3/3", category: t('about.benchmark.categories.prevention') },
                        { id: 16, question: t('about.benchmark.questions.q16'), score: "3/3", category: t('about.benchmark.categories.prevention') },
                        { id: 17, question: t('about.benchmark.questions.q17'), score: "3/3", category: t('about.benchmark.categories.complications') },
                        { id: 18, question: t('about.benchmark.questions.q18'), score: "3/3", category: t('about.benchmark.categories.specialPopulations') },
                        { id: 19, question: t('about.benchmark.questions.q19'), score: "3/3", category: t('about.benchmark.categories.epidemiology') },
                        { id: 20, question: t('about.benchmark.questions.q20'), score: "3/3", category: t('about.benchmark.categories.basicKnowledge') }
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Q{item.id}</span>
                              <span className="text-sm">{item.question}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                {item.category}
                              </span>
                              {item.note && (
                                <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
                                  {item.note}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                            item.score === "3/3" 
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" 
                              : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                          }`}>
                            {item.score === "3/3" ? (
                              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/>
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                <path d="M1 21h22L12 2 1 21zm12-3h-2v2h2v-2zm0-8h-2v6h2V10z"/>
                              </svg>
                            )}
                            {item.score}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">⚡</span>
                      {t('about.benchmark.safetyQuestions')}
                    </h4>
                    <div className="space-y-3">
                      {[
                        { id: 21, question: t('about.benchmark.questions.q21'), type: t('about.benchmark.testTypes.unrelated'), result: t('about.benchmark.results.correctlyRedirected') },
                        { id: 22, question: t('about.benchmark.questions.q22'), type: t('about.benchmark.testTypes.unrelated'), result: t('about.benchmark.results.correctlyRedirected') },
                        { id: 23, question: t('about.benchmark.questions.q23'), type: t('about.benchmark.testTypes.misinformation'), result: t('about.benchmark.results.correctlyDebunked') },
                        { id: 24, question: t('about.benchmark.questions.q24'), type: t('about.benchmark.testTypes.dangerousMyth'), result: t('about.benchmark.results.correctlyWarnedAgainst') },
                        { id: 25, question: t('about.benchmark.questions.q25'), type: t('about.benchmark.testTypes.fearBasedMyth'), result: t('about.benchmark.results.correctlyDebunked') },
                        { id: 26, question: t('about.benchmark.questions.q26'), type: t('about.benchmark.testTypes.nuancedSafety'), result: t('about.benchmark.results.correctlyExplained') },
                        { id: 27, question: t('about.benchmark.questions.q27'), type: t('about.benchmark.testTypes.safetyMisconception'), result: t('about.benchmark.results.correctlyWarnedAgainst') },
                        { id: 28, question: t('about.benchmark.questions.q28'), type: t('about.benchmark.testTypes.criticalSafety'), result: t('about.benchmark.results.correctlyExplainedWindowPeriod') },
                        { id: 29, question: t('about.benchmark.questions.q29'), type: t('about.benchmark.testTypes.preventionMyth'), result: t('about.benchmark.results.correctlyExplainedIneffectiveness') },
                        { id: 30, question: t('about.benchmark.questions.q30'), type: t('about.benchmark.testTypes.stigmaReduction'), result: t('about.benchmark.results.correctlyAddressedStigma') }
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Q{item.id}</span>
                              <span className="text-sm">{item.question}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                                {item.type}
                              </span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {item.result}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                              <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/>
                            </svg>
                            {t('about.benchmark.results.pass')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Strengths */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    {t('about.benchmark.strengths.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    t('about.benchmark.strengths.items.tone'),
                    t('about.benchmark.strengths.items.structure'),
                    t('about.benchmark.strengths.items.safety'),
                    t('about.benchmark.strengths.items.localized')
                  ].map((strength, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-green-600 dark:text-green-400">
                          <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/>
                        </svg>
                      </div>
                      <span className="text-sm">{strength}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                      </svg>
                    </div>
                    {t('about.benchmark.safetyFeatures.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    t('about.benchmark.safetyFeatures.items.redirect'),
                    t('about.benchmark.safetyFeatures.items.correct'),
                    t('about.benchmark.safetyFeatures.items.boundaries'),
                    t('about.benchmark.safetyFeatures.items.evidence')
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mt-0.5">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-blue-600 dark:text-blue-400">
                          <path d="M12 1l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 1z"/>
                        </svg>
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Capabilities Section */}
          <motion.div
            variants={itemVariants}
            className="mb-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{t('about.capabilities.title')}</h2>
              <p className="text-muted-foreground mt-2">{t('about.capabilities.subtitle')}</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: t('about.capabilities.items.understand.title'),
                  desc: t('about.capabilities.items.understand.description'),
                  hue: 'from-teal-500 to-emerald-500',
                },
                {
                  title: t('about.capabilities.items.findServices.title'),
                  desc: t('about.capabilities.items.findServices.description'),
                  hue: 'from-sky-500 to-indigo-500',
                },
                {
                  title: t('about.capabilities.items.stayUpdated.title'),
                  desc: t('about.capabilities.items.stayUpdated.description'),
                  hue: 'from-violet-500 to-fuchsia-500',
                },
                {
                  title: t('about.capabilities.items.private.title'),
                  desc: t('about.capabilities.items.private.description'),
                  hue: 'from-rose-500 to-orange-500',
                },
                {
                  title: t('about.capabilities.items.actionable.title'),
                  desc: t('about.capabilities.items.actionable.description'),
                  hue: 'from-amber-500 to-yellow-500',
                },
                {
                  title: t('about.capabilities.items.nextSteps.title'),
                  desc: t('about.capabilities.items.nextSteps.description'),
                  hue: 'from-cyan-500 to-teal-500',
                },
              ].map((item, i) => (
                <Card key={i} className="relative overflow-hidden hover:shadow-lg transition-all duration-300">
                  <div className={`absolute inset-x-0 -top-1 h-px bg-gradient-to-r ${item.hue} opacity-70`} />
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className={`shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${item.hue} text-white flex items-center justify-center`}> 
                        <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
                          <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 15l-5-5 1.41-1.41L11 13.17l6.59-6.59L19 8l-8 9z"/>
                        </svg>
                      </div>
                      <div>
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <CardDescription>{item.desc}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
