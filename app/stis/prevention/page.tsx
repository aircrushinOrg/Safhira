'use client'

import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeft, Shield, Heart, Users, BookOpen, CheckCircle, Info, Lightbulb, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import {useRouter} from '../../../i18n/routing';
import {Link} from '../../../i18n/routing';
import Image from 'next/image';
import {useTranslations} from 'next-intl';

interface PreventionMethod {
  title: string;
  effectiveness: string;
  description: string;
  culturalConsiderations: string;
  howToUse: string[];
  evidence: string;
}

// Localized prevention methods are loaded from messages

// Localized safe sex practices are loaded from messages

export default function STIPreventionPage() {
  const router = useRouter();
  const t = useTranslations('Prevention');
  const tDetail = useTranslations('STIDetail');
  const preventionMethods = t.raw('lists.methods') as PreventionMethod[];
  const safeSexPractices = t.raw('lists.practices') as { category: string; practices: string[] }[];
  const commTips = t.raw('comm.tips') as string[];
  const commSamples = t.raw('comm.samples') as { situation: string; example: string }[];
  const commStyles = t.raw('comm.styles') as string[];
  const commNavigate = t.raw('comm.navigate') as string[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <section className="py-8 sm:py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6 sm:mb-8">
            <Button variant="ghost" onClick={() => router.push('/stis')} className="mb-4 text-sm sm:text-base">
              <ArrowLeft size={16} className="mr-2" />
              {tDetail('back')}
            </Button>
            
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">
                  {t('hero.title')}
                </h1>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t('hero.subtitle')}
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
                    src="/undraw_doctors.svg"
                    alt="Medical professionals providing healthcare guidance and support"
                    fill
                    className="object-contain"
                    priority
                  />
                </motion.div>
              </div>
            </div>
            
            {/* Cultural Sensitivity Statement */}
            <Card className="p-4 sm:p-6 bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 mb-6 sm:mb-8">
              <div className="flex items-start space-x-3">
                <Heart className="text-teal-500 mt-1 flex-shrink-0" size={18} />
                <div>
                  <h3 className="font-semibold text-teal-800 dark:text-teal-200 mb-2 text-sm sm:text-base">
                    {t('cultural.title')}
                  </h3>
                  <p className="text-teal-700 dark:text-teal-300 text-sm sm:text-base leading-relaxed">
                    {t('cultural.text')}
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
            <Card className="p-4 sm:p-6 md:p-8 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <Tabs defaultValue="methods" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 h-auto p-1 bg-gray-100 dark:bg-gray-800">
                  <TabsTrigger value="methods" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100">
                    {t('tabs.methods')}
                  </TabsTrigger>
                  <TabsTrigger value="practices" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100">
                    {t('tabs.practices')}
                  </TabsTrigger>
                  <TabsTrigger value="communication" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100">
                    {t('tabs.communication')}
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100">
                    {t('tabs.resources')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="methods" className="mt-6 sm:mt-8 space-y-6 sm:space-y-8">
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6 flex items-center">
                      <Shield size={20} className="mr-2 sm:mr-3 text-green-500 flex-shrink-0" />
                      {t('methods.heading')}
                    </h2>
                    
                    <div className="space-y-4 sm:space-y-6">
                      {preventionMethods.map((method, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Card className="p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <div className="mb-4">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100">
                                  {method.title}
                                </h3>
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 self-start text-xs sm:text-sm">
                                  {method.effectiveness}
                                </Badge>
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-4 leading-relaxed">
                                {method.description}
                              </p>
                            </div>

                            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3 flex items-center text-sm sm:text-base">
                                    <Users size={16} className="mr-2 text-blue-500 flex-shrink-0" />
                                    {t('methods.cultural')}
                                  </h4>
                                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                    {method.culturalConsiderations}
                                  </p>
                                </div>

                                <div>
                                  <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3 flex items-center text-sm sm:text-base">
                                    <BookOpen size={16} className="mr-2 text-purple-500 flex-shrink-0" />
                                    {t('methods.evidence')}
                                  </h4>
                                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                    {method.evidence}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3 flex items-center text-sm sm:text-base">
                                  <Lightbulb size={16} className="mr-2 text-yellow-500 flex-shrink-0" />
                                  {t('methods.how')}
                                </h4>
                                <ul className="space-y-2 sm:space-y-3">
                                  {method.howToUse.map((step, stepIndex) => (
                                    <li key={stepIndex} className="flex items-start space-x-2 sm:space-x-3">
                                      <CheckCircle size={14} className="text-green-500 mt-1 flex-shrink-0" />
                                      <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{step}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="practices" className="mt-6 sm:mt-8">
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6 flex items-center">
                      <Heart size={20} className="mr-2 sm:mr-3 text-pink-500 flex-shrink-0" />
                      {t('practices.heading')}
                    </h2>
                    
                    <div className="space-y-4 sm:space-y-6">
                      {safeSexPractices.map((section, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Card className="p-4 sm:p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                                <span className="text-pink-600 dark:text-pink-400 font-semibold text-xs sm:text-sm">
                                  {index + 1}
                                </span>
                              </div>
                              <span className="text-sm sm:text-lg leading-tight">{section.category}</span>
                            </h3>
                            <ul className="space-y-2 sm:space-y-3">
                              {section.practices.map((practice, practiceIndex) => (
                                <li key={practiceIndex} className="flex items-start space-x-2 sm:space-x-3">
                                  <CheckCircle size={14} className="text-pink-500 mt-1 flex-shrink-0" />
                                  <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">{practice}</span>
                                </li>
                              ))}
                            </ul>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    {/* Cultural Adaptation Note */}
                    <Card className="mt-6 sm:mt-8 p-4 sm:p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <div className="flex items-start space-x-3">
                        <Info className="text-blue-500 mt-1 flex-shrink-0" size={18} />
                        <div>
                          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 text-sm sm:text-base">
                            {t('adapt.title')}
                          </h4>
                          <p className="text-blue-700 dark:text-blue-300 text-sm sm:text-base leading-relaxed">
                            {t('adapt.text')}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="communication" className="mt-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                      <MessageCircle size={24} className="mr-3 text-blue-500" />
                      {t('comm.heading')}
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                          {t('comm.start')}
                        </h3>
                        <ul className="space-y-3">
                          {commTips.map((tip, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <CheckCircle size={16} className="text-blue-500 mt-1 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>

                      <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                          {t('comm.samples')}
                        </h3>
                        <div className="space-y-4">
                          {commSamples.map((example, index) => (
                            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <p className="font-medium text-gray-800 dark:text-gray-100 text-sm mb-1">
                                {example.situation}:
                              </p>
                              <p className="text-gray-700 dark:text-gray-300 text-sm italic">
                                &quot;{example.example}&quot;
                              </p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>

                    <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                      <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">
                        {t('comm.cultural')}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                            {t('comm.styles')}
                          </h4>
                          <ul className="space-y-2 text-green-700 dark:text-green-300 text-sm">{commNavigate.map((item, idx) => (<li key={idx}>{item}</li>))}</ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                            {t('comm.navigate')}
                          </h4>
                          <ul className="space-y-2 text-green-700 dark:text-green-300 text-sm">{commStyles.map((item, idx) => (<li key={idx}>{item}</li>))}</ul>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="resources" className="mt-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                      <BookOpen size={24} className="mr-3 text-purple-500" />
                      {t('resources.heading')}
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                      <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                          {t('resources.local')}
                        </h3>
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">{t('resources.extra.moh.title')}</h4>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">{t('resources.extra.moh.desc')}</p>
                            <div className="mt-3">
                              <a
                                href="https://www.moh.gov.my/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                              >
                                {t('resources.extra.moh.link')}
                              </a>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">{t('resources.extra.maf.title')}</h4>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">{t('resources.extra.maf.desc')}</p>
                            <div className="mt-3">
                              <a
                                href="https://maf.org.my/V2/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                              >
                                {t('resources.extra.maf.link')}
                              </a>
                            </div>
                          </div>

                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">{t('resources.extra.uni.title')}</h4>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">{t('resources.extra.uni.desc')}</p>
                            <div className="mt-3">
                              <a
                                href="https://www.mohe.gov.my/en"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                              >
                                {t('resources.extra.uni.link')}
                              </a>
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{t('resources.evidence.heading')}</h3>
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                              {t('resources.evidence.who.title')}
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">{t('resources.evidence.who.desc')}</p>
                            <div className="mt-3 space-y-1">
                              <a
                                href="https://www.who.int/health-topics/sexually-transmitted-infections"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-blue-600 dark:text-blue-400 text-sm hover:underline"
                              >
                                {t('resources.evidence.who.links.0')}
                              </a>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                              {t('resources.evidence.moh.title')}
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">{t('resources.evidence.moh.desc')}</p>
                            <div className="mt-3 space-y-1">
                              <a
                                href="https://www.moh.gov.my/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-blue-600 dark:text-blue-400 text-sm hover:underline"
                              >
                                {t('resources.evidence.moh.links.0')}
                              </a>
                            </div>
                          </div>

                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                              {t('resources.evidence.cdc.title')}
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">{t('resources.evidence.cdc.desc')}</p>
                            <div className="mt-3 space-y-1">
                              <a
                                href="https://www.cdc.gov/sti/index.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-blue-600 dark:text-blue-400 text-sm hover:underline"
                              >
                                {t('resources.evidence.cdc.links.0')}
                              </a>
                              <a
                                href="https://www.cdc.gov/std/treatment-guidelines/default.htm"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-blue-600 dark:text-blue-400 text-sm hover:underline"
                              >
                                {t('resources.evidence.cdc.links.1')}
                              </a>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>

                    <Card className="mt-8 p-6 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                      <div className="text-center">
                        <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">
                          {t('personal.title')}
                        </h3>
                        <p className="text-purple-700 dark:text-purple-300 mb-4">
                          {t('personal.text')}
                        </p>
                        <Link href="/chat">
                          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                            {t('personal.button')}
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

