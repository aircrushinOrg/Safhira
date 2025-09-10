import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  BookOpen, 
  Shield, 
  Stethoscope, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import {useTranslations} from 'next-intl';

interface LearningModulesProps {
  onModuleClick: (moduleId: string) => void;
  currentModule?: string;
  onBack?: () => void;
}

const modules = [
  {
    id: 'basics',
    title: 'STI Basics',
    subtitle: 'Understanding types of STIs and symptoms',
    icon: BookOpen,
    color: 'teal',
    duration: '15 min',
    progress: 100,
    topics: ['What are STIs?', 'Types of STIs', 'Common symptoms', 'Transmission rates']
  },
  {
    id: 'prevention',
    title: 'Prevention',
    subtitle: 'Ways to protect yourself and your partner',
    icon: Shield,
    color: 'pink',
    duration: '12 min',
    progress: 75,
    topics: ['Condoms and proper use', 'Vaccination', 'Regular testing', 'Partner communication']
  },
  {
    id: 'testing',
    title: 'Testing & Treatment',
    subtitle: 'Testing process and treatment options',
    icon: Stethoscope,
    color: 'teal',
    duration: '18 min',
    progress: 50,
    topics: ['When to get tested', 'Types of tests', 'Treatment process', 'Clinics in Malaysia']
  },
  {
    id: 'myths',
    title: 'Myths vs Facts',
    subtitle: 'Debunking myths and misconceptions',
    icon: AlertTriangle,
    color: 'pink',
    duration: '10 min',
    progress: 0,
    topics: ['Common myths', 'Scientific facts', 'Social stigma', 'Proper education']
  }
];

const moduleContent = {
  basics: {
    title: 'STI Basics - Understanding Correctly',
    content: [
      {
        section: 'What are STIs?',
        text: 'STIs (Sexually Transmitted Infections) are infections spread through sexual contact. This isn\'t anyone\'s fault, but something that can happen to anyone who is sexually active.',
        points: [
          'STIs can be caused by bacteria, viruses, or parasites',
          'Some STIs don\'t show symptoms in early stages',
          'STIs can be treated and prevented with proper knowledge'
        ]
      },
      {
        section: 'Common Types of STIs',
        text: 'In Malaysia, the most common STIs include:',
        points: [
          'Chlamydia - Can be treated with antibiotics',
          'Gonorrhea - Bacterial infection that can be cured',
          'Herpes - Virus that can be managed with medication',
          'HPV - Virus that can be prevented with vaccines',
          'HIV - Can be controlled with modern treatment'
        ]
      }
    ]
  },
  prevention: {
    title: 'Prevention - Protecting Yourself and Your Partner',
    content: [
      {
        section: 'Proper Condom Use',
        text: 'Condoms are one of the most effective prevention methods:',
        points: [
          'Use a new condom for every sexual encounter',
          'Check expiry date and ensure packaging isn\'t damaged',
          'Put on before any genital contact',
          'Dispose of properly after use'
        ]
      },
      {
        section: 'Communication with Partner',
        text: 'Discussing with your partner is important:',
        points: [
          'Discuss sexual health history honestly',
          'Get tested together for STIs',
          'Respect each other\'s decisions',
          'Emotional support is important'
        ]
      }
    ]
  },
  testing: {
    title: 'Testing & Treatment - Proactive Steps',
    content: [
      {
        section: 'When to Get Tested',
        text: 'STI testing is recommended in the following situations:',
        points: [
          'Before starting a relationship with a new partner',
          'After unprotected sexual contact',
          'If you have suspicious symptoms',
          'Regular testing as prevention (every 6-12 months)'
        ]
      },
      {
        section: 'Testing Locations in Malaysia',
        text: 'STI testing can be done at:',
        points: [
          'Government health clinics - Free or low cost',
          'Government hospitals - Comprehensive care',
          'Private clinics - More privacy',
          'Health NGOs - Specialized support'
        ]
      }
    ]
  },
  myths: {
    title: 'Myths vs Facts - Proper Knowledge',
    content: [
      {
        section: 'Debunking Common Myths',
        text: 'Let\'s correct some misconceptions:',
        points: [
          'MYTH: "STIs only happen to immoral people" - FACT: STIs can happen to anyone who is sexually active',
          'MYTH: "If there are no symptoms, there\'s no STI" - FACT: Many STIs don\'t show early symptoms',
          'MYTH: "STIs can\'t be treated" - FACT: Most STIs can be treated effectively',
          'MYTH: "Condoms provide 100% protection" - FACT: Condoms are very effective but not 100%'
        ]
      }
    ]
  }
};

export function LearningModules({ onModuleClick, currentModule, onBack }: LearningModulesProps) {
  const t = useTranslations('Learning');
  if (currentModule && moduleContent[currentModule as keyof typeof moduleContent]) {
    const content = moduleContent[currentModule as keyof typeof moduleContent];
    
    return (
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <Button variant="ghost" onClick={onBack} className="mb-4">
              <ArrowLeft size={16} className="mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{content.title}</h1>
            <p className="text-gray-600 dark:text-gray-300">Learning with Jun Kang - Accurate and reliable information</p>
          </div>

          <div className="space-y-8">
            {content.content.map((section, index) => (
              <Card key={index} className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">{section.section}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">{section.text}</p>
                <ul className="space-y-3">
                  {section.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start space-x-3">
                      <CheckCircle size={16} className="text-teal-500 dark:text-teal-400 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{point}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="p-6 bg-gradient-to-r from-pink-100 to-teal-100 dark:from-pink-900/30 dark:to-teal-900/30">
              <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{t('finished')}</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{t('prompt')}</p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => onModuleClick('quiz')} className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-700">
                  {t('takeQuiz')}
                </Button>
                <Button variant="outline">
                  {t('chatAi')}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  const titleVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerVariants}
        >
          <motion.h2 
            className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4"
            variants={titleVariants}
          >
            Learning Modules
          </motion.h2>
          <motion.p 
            className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            variants={titleVariants}
          >
            Learn about reproductive health through easy-to-understand modules. 
            Each module is specially designed for Malaysian teens.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              variants={cardVariants}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer h-full"
                    onClick={() => onModuleClick(module.id)}>
                <div className="flex items-start justify-between mb-4">
                  <motion.div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center bg-${module.color}-100 dark:bg-${module.color}-900`}
                    whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
                  >
                    <module.icon className={`text-${module.color}-600 dark:text-${module.color}-400`} size={24} />
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <Badge variant={module.progress === 100 ? 'default' : 'secondary'} className="text-xs">
                      {module.progress === 100 ? 'Completed' : module.progress > 0 ? 'In Progress' : 'New'}
                    </Badge>
                  </motion.div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{module.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{module.subtitle}</p>
                
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                    <span>Progress</span>
                    <span>{module.progress}%</span>
                  </div>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    style={{ originX: 0 }}
                  >
                    <Progress value={module.progress} className="h-2" />
                  </motion.div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <motion.div 
                    className="flex items-center space-x-1"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <Clock size={12} />
                    <span>{module.duration}</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center space-x-1"
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <Users size={12} />
                    <span>With Jun Kang</span>
                  </motion.div>
                </div>
                
                <motion.div 
                  className="space-y-1 mb-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  {module.topics.slice(0, 2).map((topic, topicIndex) => (
                    <motion.div 
                      key={topicIndex} 
                      className="text-xs text-gray-600 dark:text-gray-400 flex items-center space-x-2"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + topicIndex * 0.1, duration: 0.4 }}
                    >
                      <motion.div 
                        className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: 0.8 + topicIndex * 0.1, duration: 0.4 }}
                      ></motion.div>
                      <span>{topic}</span>
                    </motion.div>
                  ))}
                  {module.topics.length > 2 && (
                    <motion.div 
                      className="text-xs text-gray-500 dark:text-gray-400"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 1, duration: 0.4 }}
                    >
                      +{module.topics.length - 2} more...
                    </motion.div>
                  )}
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline" size="sm" className="w-full group">
                    {module.progress === 0 ? t('startLearning') : module.progress === 100 ? t('review') : t('continue')}
                    <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
