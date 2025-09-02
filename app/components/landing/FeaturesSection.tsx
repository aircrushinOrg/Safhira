'use client'

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  MessageCircle, 
  HelpCircle, 
  MapPin, 
  Monitor, 
  ArrowRight,
  Lock
} from 'lucide-react';

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const router = useRouter();

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
      title: 'Private AI Assistant',
      description: 'Get judgment-free guidance on sexual health questions. Available 24/7 in a completely private environment.',
      icon: MessageCircle,
      color: 'from-teal-500 to-teal-600 dark:from-teal-400 dark:to-teal-500',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      borderColor: 'border-teal-200 dark:border-teal-800',
      textColor: 'text-teal-700 dark:text-teal-300',
      iconColor: 'text-teal-500',
      action: () => router.push('/chat'),
      buttonText: 'Start Conversation'
    },
    {
      id: 'education',
      title: 'STI Education Hub',
      description: 'Comprehensive, medically-accurate information about sexually transmitted infections in Malaysia.',
      icon: BookOpen,
      color: 'from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      textColor: 'text-purple-700 dark:text-purple-300',
      iconColor: 'text-purple-500',
      action: () => router.push('/stis'),
      buttonText: 'Explore Education'
    }
  ];

  const upcomingFeatures: UpcomingFeature[] = [
    {
      id: 'quiz',
      title: 'Myth vs Truth Quiz',
      description: 'Test your knowledge and debunk common misconceptions about sexual health.',
      icon: HelpCircle,
      color: 'from-pink-500 to-pink-600 dark:from-pink-400 dark:to-pink-500',
      bgColor: 'bg-gray-100 dark:bg-gray-700/50',
      borderColor: 'border-gray-300 dark:border-gray-600',
      textColor: 'text-gray-600 dark:text-gray-300',
      iconColor: 'text-gray-500',
      comingSoon: true
    },
    {
      id: 'mapper',
      title: 'Clinic Mapper',
      description: 'Find nearby sexual health clinics and testing centers with privacy ratings.',
      icon: MapPin,
      color: 'from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500',
      bgColor: 'bg-gray-100 dark:bg-gray-700/50',
      borderColor: 'border-gray-300 dark:border-gray-600',
      textColor: 'text-gray-600 dark:text-gray-300',
      iconColor: 'text-gray-500',
      comingSoon: true
    },
    {
      id: 'simulator',
      title: 'Conversation Simulator',
      description: 'Practice discussing sexual health topics with healthcare providers in a safe environment.',
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
              How We&apos;re Breaking Down Barriers
            </motion.h1>
            <motion.p 
              className="text-md text-center md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              We built a safe space where young Malaysians reach out about sexual health without fear of judgment. Here&apos;s how we support you:
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
                            Launching Soon
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
                            Launching Soon
                          </Button>
                        ) : (
                          <Button
                            onClick={'action' in feature ? feature.action : undefined}
                            className={`w-full bg-gradient-to-r ${feature.color} hover:opacity-90 text-white dark:text-gray-800 transition-all duration-200 group`}
                          >
                            {'buttonText' in feature ? feature.buttonText : 'Learn More'}
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