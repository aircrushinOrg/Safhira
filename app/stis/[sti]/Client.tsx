'use client'

import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeft, CheckCircle, AlertTriangle, Heart, Shield, Users, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import {useRouter} from '../../../i18n/routing';
import {useTranslations} from 'next-intl';

export interface STIInfo {
  name: string;
  type: 'Bacterial' | 'Viral' | 'Parasitic';
  severity: 'Low' | 'Medium' | 'High';
  treatability: 'Curable' | 'Manageable' | 'Preventable';
  symptoms: {
    common: string[];
    women: string[];
    men: string[];
    general: string[];
  };
  transmission: string[];
  healthEffects: string[];
  prevention: string[];
  treatment: string;
  malaysianContext: string;
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

export default function STIClient({ stiInfo }: { stiInfo: STIInfo }) {
  const router = useRouter();
  const t = useTranslations('STIDetail');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <section className="py-8 sm:py-12 md:py-16 px-4">
        <div className="container mx-auto">
          <div className="mb-6 sm:mb-8">
            <Button variant="ghost" onClick={() => router.push('/stis')} className="mb-4 text-sm sm:text-base">
              <ArrowLeft size={16} className="mr-2" />
              {t('back')}
            </Button>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">
                {stiInfo.name}
              </h1>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Badge className={`${getSeverityColor(stiInfo.severity)} text-xs sm:text-sm`}>
                  {stiInfo.severity} {t('risk')}
                </Badge>
                <Badge className={`${getTreatabilityColor(stiInfo.treatability)} text-xs sm:text-sm`}>
                  {stiInfo.treatability}
                </Badge>
                <Badge variant="outline" className="text-xs sm:text-sm">
                  {stiInfo.type}
                </Badge>
              </div>
            </div>

            <Card className="p-4 sm:p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 mb-6 sm:mb-8">
              <div className="flex items-start space-x-3">
                <Info className="text-blue-500 mt-1 flex-shrink-0" size={18} />
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 text-sm sm:text-base">
                    {t('malaysianContext')}
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm sm:text-base leading-relaxed">
                    {stiInfo.malaysianContext}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="p-4 sm:p-6 md:p-8">
              <Tabs defaultValue="symptoms" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1 h-auto p-1">
                  <TabsTrigger value="symptoms" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white">
                    {t('tabs.symptoms')}
                  </TabsTrigger>
                  <TabsTrigger value="transmission" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white">
                    {t('tabs.transmission')}
                  </TabsTrigger>
                  <TabsTrigger value="effects" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white">
                    {t('tabs.effects')}
                  </TabsTrigger>
                  <TabsTrigger value="prevention" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white">
                    {t('tabs.prevention')}
                  </TabsTrigger>
                  <TabsTrigger value="treatment" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white">
                    {t('tabs.treatment')}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="symptoms" className="mt-6 sm:mt-8 space-y-6 sm:space-y-8">
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                        <AlertTriangle size={18} className="mr-2 sm:mr-3 text-yellow-500 flex-shrink-0" />
                        General Symptoms
                      </h3>
                      <ul className="space-y-2 sm:space-y-3">
                        {stiInfo.symptoms.common.map((symptom, index) => (
                          <li key={index} className="flex items-start space-x-2 sm:space-x-3">
                            <CheckCircle size={16} className="text-teal-500 mt-1 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                          {t('symptoms.women')}
                        </h3>
                        <ul className="space-y-2 sm:space-y-3">
                          {stiInfo.symptoms.women.map((symptom, index) => (
                            <li key={index} className="flex items-start space-x-2 sm:space-x-3">
                              <CheckCircle size={14} className="text-pink-500 mt-1 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">{symptom}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                          {t('symptoms.men')}
                        </h3>
                        <ul className="space-y-2 sm:space-y-3">
                          {stiInfo.symptoms.men.map((symptom, index) => (
                            <li key={index} className="flex items-start space-x-2 sm:space-x-3">
                              <CheckCircle size={14} className="text-blue-500 mt-1 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">{symptom}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {stiInfo.symptoms.general.length > 0 && (
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                          {t('symptoms.other')}
                        </h3>
                        <ul className="space-y-2 sm:space-y-3">
                          {stiInfo.symptoms.general.map((symptom, index) => (
                            <li key={index} className="flex items-start space-x-2 sm:space-x-3">
                              <CheckCircle size={14} className="text-purple-500 mt-1 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">{symptom}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="transmission" className="mt-6 sm:mt-8">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6 flex items-center">
                      <Users size={18} className="mr-2 sm:mr-3 text-orange-500 flex-shrink-0" />
                      How {stiInfo.name} Spreads
                    </h3>
                    <ul className="space-y-3 sm:space-y-4">
                      {stiInfo.transmission.map((method, index) => (
                        <li key={index} className="flex items-start space-x-2 sm:space-x-3">
                          <CheckCircle size={16} className="text-orange-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">{method}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="effects" className="mt-6 sm:mt-8">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6 flex items-center">
                      <AlertTriangle size={18} className="mr-2 sm:mr-3 text-red-500 flex-shrink-0" />
                      Potential Health Effects
                    </h3>
                    <ul className="space-y-3 sm:space-y-4">
                      {stiInfo.healthEffects.map((effect, index) => (
                        <li key={index} className="flex items-start space-x-2 sm:space-x-3">
                          <CheckCircle size={16} className="text-red-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">{effect}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="prevention" className="mt-6 sm:mt-8">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6 flex items-center">
                      <Shield size={18} className="mr-2 sm:mr-3 text-green-500 flex-shrink-0" />
                      Prevention Methods
                    </h3>
                    <ul className="space-y-3 sm:space-y-4">
                      {stiInfo.prevention.map((method, index) => (
                        <li key={index} className="flex items-start space-x-2 sm:space-x-3">
                          <CheckCircle size={16} className="text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">{method}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="treatment" className="mt-6 sm:mt-8">
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6 flex items-center">
                      <Heart size={18} className="mr-2 sm:mr-3 text-blue-500 flex-shrink-0" />
                      {t('treatment.title')}
                    </h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 sm:p-6 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
                        {stiInfo.treatment}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
          <Card className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20">
            <div className="flex items-start space-x-3">
              <Heart className="text-teal-500 mt-1 flex-shrink-0" size={18} />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 text-sm sm:text-base">
                  {t('support.title')}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm sm:text-base leading-relaxed">
                  {t('support.text')}
                </p>
                <Button 
                  onClick={() => router.push('/chat')} 
                  className="bg-teal-600 hover:bg-teal-700 text-white w-full sm:w-auto text-sm sm:text-base"
                >
                  {t('support.cta')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
