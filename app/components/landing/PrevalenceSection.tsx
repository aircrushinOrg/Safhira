/**
 * Prevalence section component displaying interactive STI epidemiological data and statistics for Malaysia.
 * This component features dynamic charts, choropleth maps, and trend analysis for STI prevalence data visualization.
 * Integrates multiple chart types with filtering capabilities to help users understand public health trends and geographical patterns.
 */
'use client'

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { STIChoroplethChart } from './STIChoroplethChart';
import STITrendsChart from './STITrendsChart';
import { Card, CardContent } from '../ui/card';
import { getAllUniqueStates, getAllUniqueDiseases, getAllYearDiseaseIncidences } from '../../actions/prevalence-actions';
import {useTranslations} from 'next-intl';

interface SharedData {
  states: string[];
  diseases: string[];
  incidenceData: { year: number; disease: string; state: string; incidence: number }[];
  years: number[];
  loading: boolean;
}

export function PrevalenceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [activeTab, setActiveTab] = useState("choropleth");
  const t = useTranslations('Landing');
  
  // Shared data state
  const [sharedData, setSharedData] = useState<SharedData>({
    states: [],
    diseases: [],
    incidenceData: [],
    years: [],
    loading: true,
  });

  // Fetch data once when component mounts
  useEffect(() => {
    const fetchSharedData = async () => {
      try {
        const [statesData, diseasesData, incidenceData] = await Promise.all([
          getAllUniqueStates(),
          getAllUniqueDiseases(),
          getAllYearDiseaseIncidences()
        ]);
        
        // Extract unique years from incidence data
        const years = Array.from(new Set(incidenceData.map(item => item.year))).sort();
        
        setSharedData({
          states: statesData,
          diseases: diseasesData,
          incidenceData,
          years,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching shared data:", error);
        setSharedData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchSharedData();
  }, []);

  return (
    <motion.div 
      ref={ref}
      className="bg-slate-50 dark:bg-slate-900"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <section className="py-8 sm:py-12 lg:py-16 px-8 md:px-16">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6 sm:mb-8">
            <div className="mb-4 sm:mb-6 text-center flex flex-col w-full justify-center items-center">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4 px-2">
                {t('prevalence.title')}
              </h1>
              <p className="text-md text-center md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('prevalence.subtitle')}
              </p>
            </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {sharedData.loading ? (
            <Card className="w-full bg-white dark:bg-gray-800 shadow-lg">
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">{t('prevalence.loading')}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="w-full">
              {/* Custom Tab Navigation with Sliding Indicator */}
              <div className="relative bg-slate-100 dark:bg-gray-800 rounded-full p-1 mb-6 inline-flex w-full">
                {/* Sliding Background Indicator */}
                <motion.div
                  className="absolute top-1 bottom-1 bg-white dark:bg-slate-700 shadow-sm rounded-full"
                  animate={{
                    x: activeTab === "choropleth" ? "0%" : "100%"
                  }}
                  transition={{
                    type: "tween",
                    ease: "easeInOut",
                    duration: 0.3
                  }}
                  style={{ width: "calc(50% - 4px)" }}
                />
                
                {/* Tab Buttons */}
                <button
                  onClick={() => setActiveTab("choropleth")}
                  className={`relative z-10 flex-1 text-sm sm:text-md px-4 py-2 rounded-full transition-colors duration-200 ${
                    activeTab === "choropleth" 
                      ? "text-gray-800 dark:text-gray-100 font-medium" 
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                  }`}
                >
                  {t('prevalence.tabPrevalence')}
                </button>
                
                <button
                  onClick={() => setActiveTab("trends")}
                  className={`relative z-10 flex-1 text-sm sm:text-md px-4 py-2 rounded-full transition-colors duration-200 ${
                    activeTab === "trends" 
                      ? "text-gray-800 dark:text-gray-100 font-medium" 
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                  }`}
                >
                  {t('prevalence.tabTrends')}
                </button>
              </div>
              
              {/* Tab Content */}
              <div className="space-y-4">
                {activeTab === "choropleth" ? (
                  <STIChoroplethChart sharedData={sharedData} />
                ) : (
                  <STITrendsChart sharedData={sharedData} />
                )}
              </div>
            </div>
          )}
        </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
