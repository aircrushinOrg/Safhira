'use client'

import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Heart, BookOpen, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import {Link, useRouter} from '../../i18n/routing';
import {useTranslations} from 'next-intl';
import Image from 'next/image';

interface STIInfo {
  id: string;
  name: string;
  type: 'Bacterial' | 'Viral' | 'Parasitic';
  severity: 'Low' | 'Medium' | 'High';
  treatability: 'Curable' | 'Manageable' | 'Preventable';
  description: string;
  prevalence: string;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

const getTreatabilityColor = (treatability: string) => {
  switch (treatability) {
    case 'Curable': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Manageable': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'Preventable': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export default function STIsPage() {
  const router = useRouter();
  const t = useTranslations('STIs');
  const tPage = useTranslations('STIsPage');
  const tPrev = useTranslations('Prevention');
  const tDetail = useTranslations('STIDetail');

  const stiList = tPage.raw('list') as STIInfo[];
  const whereToGet = tPage.raw('resources.where.items') as string[];
  const reminders = tPage.raw('resources.reminders.items') as string[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <section className="py-8 sm:py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6 sm:mb-8">
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center mb-6 sm:mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">
                  {tPage('hero.title')}
                </h1>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  {tPage('hero.subtitle')}
                </p>
              </div>
              <div className="flex justify-center lg:justify-end order-first lg:order-last">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-48 h-36 sm:w-64 sm:h-48 md:w-72 md:h-64 relative"
                >
                  <Image
                    src="/undraw_medicine_hqqg.svg"
                    alt={tPage('hero.imageAlt')}
                    fill
                    className="object-contain"
                    priority
                  />
                </motion.div>
              </div>
            </div>
            
            {/* Supportive Message */}
            <Card className="p-4 sm:p-6 bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 mb-6 sm:mb-8">
              <div className="flex items-start space-x-3">
                <Heart className="text-teal-500 mt-1 flex-shrink-0" size={18} />
                <div>
                  <h3 className="font-semibold text-teal-800 dark:text-teal-200 mb-2 text-sm sm:text-base">
                    {tPage('support.title')}
                  </h3>
                  <p className="text-teal-700 dark:text-teal-300 text-sm sm:text-base leading-relaxed">
                    {tPage('support.text')}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Featured Learning Modules */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 mb-6 sm:mb-8">
            {/* Prevention Learning Module */}
            <Card className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                  <BookOpen className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mb-2 text-xs">
                    {tPage('modules.prevention.badge')}
                  </Badge>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    {tPrev('hero.title')}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                    {tPrev('hero.subtitle')}
                  </p>
                  <Link href="/stis/prevention">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                      {t('startLearning')}
                      <ChevronRight size={16} className="ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Prevalence Visualization Module */}
            <Card className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                  <Heart className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2 text-xs">
                    {tPage('modules.prevalence.badge')}
                  </Badge>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    {tPage('modules.prevalence.title')}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                    {tPage('modules.prevalence.desc')}
                  </p>
                  <Link href="/stis/prevalence">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                      {t('viewData')}
                      <ChevronRight size={16} className="ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          {/* STI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {stiList.map((sti, index) => (
              <motion.div
                key={sti.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={`/stis/${sti.id}`}>
                  <Card className="p-4 sm:p-6 h-full hover:shadow-lg cursor-pointer bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-2 min-w-0">
                        <BookOpen className="text-teal-500 flex-shrink-0" size={18} />
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                          {sti.name}
                        </h3>
                      </div>
                      <ChevronRight className="text-gray-400 flex-shrink-0" size={18} />
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4">
                      <Badge className={`${getSeverityColor(sti.severity)} text-xs`} variant="secondary">
                        {tPage(`badges.severity.${sti.severity}`)} {tDetail('risk')}
                      </Badge>
                      <Badge className={`${getTreatabilityColor(sti.treatability)} text-xs`} variant="secondary">
                        {tPage(`badges.treatability.${sti.treatability}`)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {tPage(`badges.type.${sti.type}`)}
                      </Badge>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {sti.description}
                    </p>

                    <div className="mt-auto">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                        <strong>{tPage('prevalenceLabel')}:</strong> {sti.prevalence}
                      </p>
                      <Button variant="outline" size="sm" className="w-full text-sm">
                        {t('learnMore')}
                      </Button>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Additional Resources */}
          <Card className="p-4 sm:p-6 md:p-8 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6">
              {tPage('resources.title')}
            </h3>
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3 text-sm sm:text-base">
                  {tPage('resources.where.title')}
                </h4>
                <ul className="space-y-2 sm:space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  {whereToGet.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2 sm:space-x-3">
                      <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3 text-sm sm:text-base">
                  {tPage('resources.reminders.title')}
                </h4>
                <ul className="space-y-2 sm:space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  {reminders.map((item, i) => (
                    <li key={i} className="flex items-start space-x-2 sm:space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
} 
