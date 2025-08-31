'use client'

import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowLeft, Heart, BookOpen, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

const stiList: STIInfo[] = [
  {
    id: 'chlamydia',
    name: 'Chlamydia',
    type: 'Bacterial',
    severity: 'Medium',
    treatability: 'Curable',
    description: 'One of the most common STIs, often without symptoms but easily treatable with antibiotics.',
    prevalence: 'Very common among young adults'
  },
  {
    id: 'gonorrhea',
    name: 'Gonorrhea',
    type: 'Bacterial',
    severity: 'Medium',
    treatability: 'Curable',
    description: 'Bacterial infection that can affect genitals, rectum, and throat. Curable but some strains are becoming resistant.',
    prevalence: 'Common, especially in urban areas'
  },
  {
    id: 'herpes',
    name: 'Herpes (HSV-1 & HSV-2)',
    type: 'Viral',
    severity: 'Low',
    treatability: 'Manageable',
    description: 'Common viral infection causing periodic outbreaks. Very manageable with modern medications.',
    prevalence: 'Extremely common worldwide'
  },
  {
    id: 'hpv',
    name: 'Human Papillomavirus (HPV)',
    type: 'Viral',
    severity: 'Medium',
    treatability: 'Preventable',
    description: 'Most common STI. Usually clears naturally, but high-risk types can cause cancer. Vaccine available.',
    prevalence: 'Most sexually active people get HPV'
  },
  {
    id: 'hiv',
    name: 'Human Immunodeficiency Virus (HIV)',
    type: 'Viral',
    severity: 'High',
    treatability: 'Manageable',
    description: 'Attacks immune system but highly manageable with modern treatment. People live normal lifespans.',
    prevalence: 'Significant in certain populations'
  },
  {
    id: 'syphilis',
    name: 'Syphilis',
    type: 'Bacterial',
    severity: 'High',
    treatability: 'Curable',
    description: 'Bacterial infection that progresses through stages. Completely curable with early treatment.',
    prevalence: 'Increasing in Malaysia'
  }
];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <section className="py-8 sm:py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6 sm:mb-8">
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center mb-6 sm:mb-8">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">
                  Learn About STIs
                </h1>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Comprehensive, judgment-free information about sexually transmitted infections. 
                  Knowledge empowers you to make informed decisions about your health.
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
                    alt="Medical illustration representing healthcare and medicine"
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
                    You&apos;re Taking a Positive Step
                  </h3>
                  <p className="text-teal-700 dark:text-teal-300 text-sm sm:text-base leading-relaxed">
                    Learning about STIs shows maturity and responsibility. This information is presented 
                    without judgment, recognizing that sexual health is an important part of overall wellbeing. 
                    Remember: having an STI doesn&apos;t reflect your character - it&apos;s simply a health condition 
                    that can be treated or managed.
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
                    Prevention Learning Module
                  </Badge>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    STI Prevention & Safe Sex Practices
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                    Evidence-based, culturally-sensitive information about prevention methods, 
                    safe practices, and respectful communication.
                  </p>
                  <Link href="/stis/prevention">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                      Start Learning
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
                    Community Health Data
                  </Badge>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    STI Prevalence in Malaysia
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 leading-relaxed">
                    Interactive visualizations showing STI prevalence across Malaysian states. 
                    Understand that sexual health concerns are common and treatable.
                  </p>
                  <Link href="/stis/prevalence">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                      View Data
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
                        {sti.severity} Risk
                      </Badge>
                      <Badge className={`${getTreatabilityColor(sti.treatability)} text-xs`} variant="secondary">
                        {sti.treatability}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {sti.type}
                      </Badge>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
                      {sti.description}
                    </p>

                    <div className="mt-auto">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                        <strong>Prevalence:</strong> {sti.prevalence}
                      </p>
                      <Button variant="outline" size="sm" className="w-full text-sm">
                        Learn More
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
              Remember: Getting Help is a Sign of Strength
            </h3>
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3 text-sm sm:text-base">
                  In Malaysia, you can get tested and treated at:
                </h4>
                <ul className="space-y-2 sm:space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  <li className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="leading-relaxed">Government health clinics (free or low-cost)</span>
                  </li>
                  <li className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="leading-relaxed">Government hospitals</span>
                  </li>
                  <li className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="leading-relaxed">Private clinics</span>
                  </li>
                  <li className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="leading-relaxed">NGO health centers</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3 text-sm sm:text-base">
                  Important reminders:
                </h4>
                <ul className="space-y-2 sm:space-y-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  <li className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="leading-relaxed">All treatment is confidential</span>
                  </li>
                  <li className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="leading-relaxed">Healthcare workers are trained to be non-judgmental</span>
                  </li>
                  <li className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="leading-relaxed">Early treatment leads to better outcomes</span>
                  </li>
                  <li className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="leading-relaxed">You deserve respectful, quality care</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
} 