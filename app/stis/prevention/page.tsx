'use client'

import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeft, Shield, Heart, Users, BookOpen, CheckCircle, Info, Lightbulb, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface PreventionMethod {
  title: string;
  effectiveness: string;
  description: string;
  culturalConsiderations: string;
  howToUse: string[];
  evidence: string;
}

const preventionMethods: PreventionMethod[] = [
  {
    title: "Barrier Methods (Condoms)",
    effectiveness: "85-98% effective against most STIs",
    description: "Physical barriers that prevent direct contact between partners during sexual activity",
    culturalConsiderations: "Respects personal autonomy and can be used discreetly. Compatible with various cultural and religious perspectives on family planning.",
    howToUse: [
      "Use a new condom for each sexual encounter",
      "Check expiration date and packaging integrity",
      "Leave space at the tip and roll down completely",
      "Remove carefully to prevent spillage",
      "Dispose of responsibly"
    ],
    evidence: "World Health Organization and Centers for Disease Control data consistently show high effectiveness when used correctly and consistently."
  },
  {
    title: "Communication and Consent",
    effectiveness: "Essential foundation for all prevention",
    description: "Open, honest dialogue about sexual health, boundaries, and testing status",
    culturalConsiderations: "Respects cultural values around communication while promoting health. Can be adapted to different cultural communication styles.",
    howToUse: [
      "Discuss STI testing history before intimate contact",
      "Share personal boundaries and comfort levels",
      "Talk about prevention methods you're both comfortable with",
      "Check in regularly about comfort and consent",
      "Approach conversations with respect and care"
    ],
    evidence: "Research shows that couples who communicate about sexual health have lower STI transmission rates and higher relationship satisfaction."
  },
  {
    title: "Regular Testing",
    effectiveness: "Crucial for early detection and treatment",
    description: "Routine screening for STIs based on age, risk factors, and sexual activity",
    culturalConsiderations: "Healthcare is a personal responsibility that benefits both individual and community health. Testing shows care for oneself and partners.",
    howToUse: [
      "Get tested at least annually if sexually active",
      "Test before new relationships when possible",
      "Follow healthcare provider recommendations for frequency",
      "Include testing for multiple STIs, not just HIV",
      "Share results with partners when appropriate"
    ],
    evidence: "Malaysian Ministry of Health and international guidelines recommend regular screening as a cornerstone of STI prevention."
  }
];

const safeSexPractices = [
  {
    category: "Before Sexual Activity",
    practices: [
      "Have open conversations about sexual health and boundaries",
      "Get tested together and share results",
      "Discuss and agree on prevention methods",
      "Ensure both partners feel comfortable and respected",
      "Have protection available and easily accessible"
    ]
  },
  {
    category: "During Sexual Activity",
    practices: [
      "Use barrier methods consistently and correctly",
      "Respect established boundaries and check in with your partner",
      "Avoid practices that increase risk of tissue damage",
      "Use appropriate lubrication to prevent tears",
      "Switch to fresh barriers when changing activities"
    ]
  },
  {
    category: "After Sexual Activity",
    practices: [
      "Proper disposal of used protection",
      "Gentle cleaning without harsh products",
      "Monitor for any unusual symptoms",
      "Maintain open communication about comfort and health",
      "Seek medical attention if concerns arise"
    ]
  }
];

export default function STIPreventionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <section className="py-8 sm:py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-6 sm:mb-8">
            <Button variant="ghost" onClick={() => router.push('/stis')} className="mb-4 text-sm sm:text-base">
              <ArrowLeft size={16} className="mr-2" />
              Back to STIs Overview
            </Button>
            
            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">
                  STI Prevention & Safe Sex Practices
                </h1>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Evidence-based, culturally-sensitive information to help you make informed decisions 
                  about your sexual health while respecting your personal values and cultural background.
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
                    Respectful & Inclusive Approach
                  </h3>
                  <p className="text-teal-700 dark:text-teal-300 text-sm sm:text-base leading-relaxed">
                    This information is presented with respect for diverse cultural backgrounds, 
                    religious beliefs, and personal values. Sexual health decisions are deeply personal, 
                    and everyone deserves access to accurate information without judgment. 
                    You can adapt these practices to align with your values and circumstances.
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
            <Card className="p-4 sm:p-6 md:p-8">
              <Tabs defaultValue="methods" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 h-auto p-1">
                  <TabsTrigger value="methods" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white">
                    Prevention Methods
                  </TabsTrigger>
                  <TabsTrigger value="practices" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white">
                    Safe Sex Practices
                  </TabsTrigger>
                  <TabsTrigger value="communication" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white">
                    Communication
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="text-xs sm:text-sm px-2 py-2 data-[state=active]:bg-white">
                    Resources
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="methods" className="mt-6 sm:mt-8 space-y-6 sm:space-y-8">
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4 sm:mb-6 flex items-center">
                      <Shield size={20} className="mr-2 sm:mr-3 text-green-500 flex-shrink-0" />
                      Evidence-Based Prevention Methods
                    </h2>
                    
                    <div className="space-y-4 sm:space-y-6">
                      {preventionMethods.map((method, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Card className="p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
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
                                    Cultural Considerations
                                  </h4>
                                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                    {method.culturalConsiderations}
                                  </p>
                                </div>

                                <div>
                                  <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3 flex items-center text-sm sm:text-base">
                                    <BookOpen size={16} className="mr-2 text-purple-500 flex-shrink-0" />
                                    Evidence Base
                                  </h4>
                                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                    {method.evidence}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3 flex items-center text-sm sm:text-base">
                                  <Lightbulb size={16} className="mr-2 text-yellow-500 flex-shrink-0" />
                                  How to Use Effectively
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
                      Safe Sex Practices Timeline
                    </h2>
                    
                    <div className="space-y-4 sm:space-y-6">
                      {safeSexPractices.map((section, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Card className="p-4 sm:p-6">
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
                            Adapting to Your Circumstances
                          </h4>
                          <p className="text-blue-700 dark:text-blue-300 text-sm sm:text-base leading-relaxed">
                            These practices can be adapted to fit your cultural background, relationship style, 
                            and personal comfort level. The key principles—communication, respect, and protection—
                            remain consistent while allowing for personal and cultural variations in implementation.
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
                      Respectful Communication About Sexual Health
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                          Starting the Conversation
                        </h3>
                        <ul className="space-y-3">
                          {[
                            "Choose a comfortable, private setting",
                            "Approach the topic when you're both relaxed",
                            "Use 'I' statements to express your feelings",
                            "Be honest about your own health and testing history",
                            "Listen actively and respect your partner's responses"
                          ].map((tip, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <CheckCircle size={16} className="text-blue-500 mt-1 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>

                      <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                          Sample Conversation Starters
                        </h3>
                        <div className="space-y-4">
                          {[
                            {
                              situation: "Discussing testing",
                              example: "I care about both our health. When was your last STI test? I had mine [timeframe] and everything was clear."
                            },
                            {
                              situation: "Talking about protection",
                              example: "I'd feel more comfortable using protection. How do you feel about that?"
                            },
                            {
                              situation: "Setting boundaries",
                              example: "I'm comfortable with [specific activities] but would prefer to wait on [other activities]. What are your thoughts?"
                            }
                          ].map((example, index) => (
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
                        Cultural Sensitivity in Communication
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                            Respecting Different Communication Styles
                          </h4>
                          <ul className="space-y-2 text-green-700 dark:text-green-300 text-sm">
                            <li>• Some cultures prefer indirect communication</li>
                            <li>• Others value very direct, explicit discussions</li>
                            <li>• Non-verbal cues may be equally important</li>
                            <li>• Time and patience may be needed for comfort</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                            Navigating Cultural Differences
                          </h4>
                          <ul className="space-y-2 text-green-700 dark:text-green-300 text-sm">
                            <li>• Acknowledge different backgrounds respectfully</li>
                            <li>• Find common ground in health and care</li>
                            <li>• Respect religious or cultural considerations</li>
                            <li>• Seek understanding rather than judgment</li>
                          </ul>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="resources" className="mt-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                      <BookOpen size={24} className="mr-3 text-purple-500" />
                      Additional Resources & Support
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                      <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                          Malaysia-Specific Resources
                        </h3>
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                              Government Health Clinics
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              Free or low-cost STI testing and treatment available at all government 
                              health clinics nationwide. Services are confidential and professional.
                            </p>
                            <div className="mt-3">
                              <a
                                href="https://www.moh.gov.my/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                              >
                                Ministry of Health Malaysia (MOH) – Official Portal
                              </a>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                              Malaysian AIDS Foundation (MAF)
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              Provides counseling, testing, and support services. Offers culturally 
                              sensitive care and education programs.
                            </p>
                            <div className="mt-3">
                              <a
                                href="https://maf.org.my/V2/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                              >
                                Malaysian AIDS Foundation (MAF) – Official Site
                              </a>
                            </div>
                          </div>

                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                              University Health Centers
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              Many university health centers offer confidential STI testing and 
                              education specifically designed for young adults.
                            </p>
                            <div className="mt-3">
                              <a
                                href="https://www.mohe.gov.my/en"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                              >
                                Ministry of Higher Education (MOHE) – Official Portal
                              </a>
                            </div>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                          Evidence Sources & Guidelines
                        </h3>
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                              World Health Organization (WHO)
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              Global standards for STI prevention and treatment guidelines that 
                              inform this content.
                            </p>
                            <div className="mt-3 space-y-1">
                              <a
                                href="https://www.who.int/health-topics/sexually-transmitted-infections"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-blue-600 dark:text-blue-400 text-sm hover:underline"
                              >
                                WHO – Sexually Transmitted Infections (STIs)
                              </a>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                              Malaysia Ministry of Health
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              Official Malaysian clinical guidelines for STI prevention and treatment 
                              adapted for local context.
                            </p>
                            <div className="mt-3 space-y-1">
                              <a
                                href="https://www.moh.gov.my/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-blue-600 dark:text-blue-400 text-sm hover:underline"
                              >
                                MOH – Official Portal
                              </a>
                            </div>
                          </div>

                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                              Centers for Disease Control (CDC)
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              International best practices and research evidence for STI prevention 
                              strategies and effectiveness data.
                            </p>
                            <div className="mt-3 space-y-1">
                              <a
                                href="https://www.cdc.gov/sti/index.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-blue-600 dark:text-blue-400 text-sm hover:underline"
                              >
                                CDC – Sexually Transmitted Infections (STIs)
                              </a>
                              <a
                                href="https://www.cdc.gov/std/treatment-guidelines/default.htm"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-blue-600 dark:text-blue-400 text-sm hover:underline"
                              >
                                CDC – STI Treatment Guidelines (2021)
                              </a>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>

                    <Card className="mt-8 p-6 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                      <div className="text-center">
                        <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">
                          Need Personalized Guidance?
                        </h3>
                        <p className="text-purple-700 dark:text-purple-300 mb-4">
                          Our AI assistant can provide personalized, confidential guidance about STI prevention 
                          that respects your specific circumstances and cultural background.
                        </p>
                        <Link href="/chat">
                          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                            Chat with Our AI Assistant
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
