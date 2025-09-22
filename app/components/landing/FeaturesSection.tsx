/**
 * Features section component showcasing the main capabilities and benefits of the Safhira platform.
 * This component highlights key features like AI chat, educational resources, provider directory, and interactive learning tools.
 * Features animated cards with icons, descriptions, and call-to-action buttons to guide users to different platform sections.
 */
'use client'

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {useRouter} from '../../../i18n/routing';
import {useTranslations} from 'next-intl';
import { 
  BookOpen, 
  MessageCircle, 
  HelpCircle, 
  MapPin, 
  Monitor, 
  ArrowRight,
  Lock,
  Calendar
} from 'lucide-react';

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const router = useRouter();
  const t = useTranslations('Landing');

  interface AvailableFeature {
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    iconColor: string;
    action: () => void;
    buttonText: string;
    comingSoon?: false;
  }

  interface UpcomingFeature {
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    iconColor: string;
    comingSoon: true;
  }

  type Feature = AvailableFeature | UpcomingFeature;

  const availableFeatures: AvailableFeature[] = [
    {
      id: 'chatbot',
      title: t('features.chatbot.title'),
      description: t('features.chatbot.description'),
      icon: MessageCircle,
      color: 'from-teal-500 to-teal-600 dark:from-teal-400 dark:to-teal-500',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      borderColor: 'border-teal-200 dark:border-teal-800',
      textColor: 'text-teal-700 dark:text-teal-300',
      iconColor: 'text-teal-500',
      action: () => router.push('/chat'),
      buttonText: t('features.chatbot.button')
    },
    {
      id: 'living-well',
      title: t('features.livingWell.title'),
      description: t('features.livingWell.description'),
      icon: Calendar,
      color: 'from-emerald-500 to-emerald-600 dark:from-emerald-400 dark:to-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      textColor: 'text-emerald-700 dark:text-emerald-300',
      iconColor: 'text-emerald-500',
      action: () => router.push('/living-well-with-sti'),
      buttonText: t('features.learnMore')
    },
    {
      id: 'mapper',
      title: t('features.mapper.title'),
      description: t('features.mapper.description'),
      icon: MapPin,
      color: 'from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      textColor: 'text-orange-700 dark:text-orange-300',
      iconColor: 'text-orange-500',
      action: () => router.push('/sti-services'),
      buttonText: t('features.learnMore')
    },
    {
      id: 'education',
      title: t('features.education.title'),
      description: t('features.education.description'),
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      textColor: 'text-purple-700 dark:text-purple-300',
      iconColor: 'text-purple-500',
      action: () => router.push('/stis'),
      buttonText: t('features.education.button')
    },
    {
      id: 'quiz',
      title: t('features.quiz.title'),
      description: t('features.quiz.description'),
      icon: HelpCircle,
      color: 'from-pink-500 to-pink-600 dark:from-pink-400 dark:to-pink-500',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      borderColor: 'border-pink-200 dark:border-pink-800',
      textColor: 'text-pink-700 dark:text-pink-300',
      iconColor: 'text-pink-500',
      action: () => router.push('/quiz'),
      buttonText: t('features.quiz.button')
    }
  ];

  const upcomingFeatures: UpcomingFeature[] = [
    {
      id: 'simulator',
      title: t('features.simulator.title'),
      description: t('features.simulator.description'),
      icon: Monitor,
      color: 'from-indigo-500 to-indigo-600 dark:from-indigo-400 dark:to-indigo-500',
      bgColor: 'bg-gray-100 dark:bg-gray-700/50',
      borderColor: 'border-gray-300 dark:border-gray-600',
      textColor: 'text-gray-600 dark:text-gray-300',
      iconColor: 'text-gray-500',
      comingSoon: true
    }
  ];

  const allFeatures: Feature[] = [...availableFeatures, ...upcomingFeatures];

  return (
    <motion.div 
      ref={ref}
      className="bg-white dark:bg-slate-800 overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <section className="py-8 sm:py-12 lg:py-16 px-8 md:px-16">
        <div className="container mx-auto max-w-7xl">
          
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <motion.h1 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {t('features.title')}
            </motion.h1>
            <motion.p 
              className="text-md text-center md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {t('features.subtitle')}
            </motion.p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {allFeatures.map((feature, index) => {
              const Icon = feature.icon;
              
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: 0.1 + (index * 0.1) }}
                >
                  <Card className={`p-6 h-full transition-all duration-300 ${
                    feature.comingSoon 
                      ? `${feature.bgColor} ${feature.borderColor} opacity-75` 
                      : `${feature.bgColor} ${feature.borderColor} hover:shadow-lg hover:scale-105`
                  }`}>
                    <div className="flex flex-col h-full">
                      {/* Icon and Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                          feature.comingSoon ? 'from-gray-300 to-gray-400' : feature.color
                        } flex items-center justify-center`}>
                          <Icon className="text-white" size={24} />
                        </div>
                        {feature.comingSoon && (
                          <Badge variant="secondary" className="text-xs">
                            <Lock size={12} className="mr-1" />
                            {t('features.comingSoon')}
                          </Badge>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-grow">
                        <h3 className={`font-semibold mb-3 text-lg ${
                          feature.comingSoon ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100'
                        }`}>
                          {feature.title}
                        </h3>
                        <p className={`text-sm leading-relaxed mb-6 ${feature.textColor}`}>
                          {feature.description}
                        </p>
                      </div>

                      {/* Action Button */}
                      <div className="mt-auto">
                        {feature.comingSoon ? (
                          <Button 
                            disabled 
                            className="w-full bg-gray-300 text-gray-500 dark:text-gray-800 cursor-not-allowed"
                          >
                            {t('features.comingSoon')}
                          </Button>
                        ) : (
                          <Button
                            onClick={'action' in feature ? feature.action : undefined}
                            className={`w-full bg-gradient-to-r ${feature.color} hover:opacity-90 text-white dark:text-gray-800 transition-all duration-200 group`}
                          >
                            {'buttonText' in feature ? feature.buttonText : t('features.learnMore')}
                            <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
