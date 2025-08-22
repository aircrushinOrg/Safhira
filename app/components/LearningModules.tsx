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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{content.title}</h1>
            <p className="text-gray-600">Learning with Jun Kang - Accurate and reliable information</p>
          </div>

          <div className="space-y-8">
            {content.content.map((section, index) => (
              <Card key={index} className="p-8 bg-white/80 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{section.section}</h3>
                <p className="text-gray-700 mb-6">{section.text}</p>
                <ul className="space-y-3">
                  {section.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-start space-x-3">
                      <CheckCircle size={16} className="text-teal-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="p-6 bg-gradient-to-r from-pink-100 to-teal-100">
              <h4 className="font-semibold text-gray-800 mb-2">Finished reading?</h4>
              <p className="text-gray-600 mb-4">Test your understanding with a quiz or ask AI if you have questions.</p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => onModuleClick('quiz')} className="bg-teal-600 hover:bg-teal-700">
                  Take Quiz
                </Button>
                <Button variant="outline">
                  Chat with AI
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Learning Modules
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Learn about reproductive health through easy-to-understand modules. 
            Each module is specially designed for Malaysian teens.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {modules.map((module, index) => (
            <Card key={module.id} className="p-6 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onModuleClick(module.id)}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-${module.color}-100`}>
                  <module.icon className={`text-${module.color}-600`} size={24} />
                </div>
                <Badge variant={module.progress === 100 ? 'default' : 'secondary'} className="text-xs">
                  {module.progress === 100 ? 'Completed' : module.progress > 0 ? 'In Progress' : 'New'}
                </Badge>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{module.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{module.subtitle}</p>
              
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>Progress</span>
                  <span>{module.progress}%</span>
                </div>
                <Progress value={module.progress} className="h-2" />
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{module.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users size={12} />
                  <span>With Jun Kang</span>
                </div>
              </div>
              
              <div className="space-y-1 mb-4">
                {module.topics.slice(0, 2).map((topic, topicIndex) => (
                  <div key={topicIndex} className="text-xs text-gray-600 flex items-center space-x-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span>{topic}</span>
                  </div>
                ))}
                {module.topics.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{module.topics.length - 2} more...
                  </div>
                )}
              </div>
              
              <Button variant="outline" size="sm" className="w-full group">
                {module.progress === 0 ? 'Start Learning' : module.progress === 100 ? 'Review' : 'Continue'}
                <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}