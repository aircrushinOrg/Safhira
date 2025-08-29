'use client'

import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeft, Shield, Heart, Users, BookOpen, CheckCircle, Info, Lightbulb, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => router.push('/stis')} className="mb-4">
              <ArrowLeft size={16} className="mr-2" />
              Back to STIs Overview
            </Button>
            
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                STI Prevention & Safe Sex Practices
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Evidence-based, culturally-sensitive information to help you make informed decisions 
                about your sexual health while respecting your personal values and cultural background.
              </p>
            </div>
            
            {/* Cultural Sensitivity Statement */}
            <Card className="p-6 bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 mb-8">
              <div className="flex items-start space-x-3">
                <Heart className="text-teal-500 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-teal-800 dark:text-teal-200 mb-2">
                    Respectful & Inclusive Approach
                  </h3>
                  <p className="text-teal-700 dark:text-teal-300">
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
            <Card className="p-8">
              <Tabs defaultValue="methods" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="methods">Prevention Methods</TabsTrigger>
                  <TabsTrigger value="practices">Safe Sex Practices</TabsTrigger>
                  <TabsTrigger value="communication">Communication</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>

                <TabsContent value="methods" className="mt-8 space-y-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                      <Shield size={24} className="mr-3 text-green-500" />
                      Evidence-Based Prevention Methods
                    </h2>
                    
                    <div className="space-y-6">
                      {preventionMethods.map((method, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Card className="p-6 border-l-4 border-l-green-500">
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                                  {method.title}
                                </h3>
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  {method.effectiveness}
                                </Badge>
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {method.description}
                              </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                                  <Users size={16} className="mr-2 text-blue-500" />
                                  Cultural Considerations
                                </h4>
                                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                                  {method.culturalConsiderations}
                                </p>

                                <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                                  <BookOpen size={16} className="mr-2 text-purple-500" />
                                  Evidence Base
                                </h4>
                                <p className="text-gray-700 dark:text-gray-300 text-sm">
                                  {method.evidence}
                                </p>
                              </div>

                              <div>
                                <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3 flex items-center">
                                  <Lightbulb size={16} className="mr-2 text-yellow-500" />
                                  How to Use Effectively
                                </h4>
                                <ul className="space-y-2">
                                  {method.howToUse.map((step, stepIndex) => (
                                    <li key={stepIndex} className="flex items-start space-x-2">
                                      <CheckCircle size={16} className="text-green-500 mt-1 flex-shrink-0" />
                                      <span className="text-gray-700 dark:text-gray-300 text-sm">{step}</span>
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

                <TabsContent value="practices" className="mt-8">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                      <Heart size={24} className="mr-3 text-pink-500" />
                      Safe Sex Practices Timeline
                    </h2>
                    
                    <div className="space-y-6">
                      {safeSexPractices.map((section, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Card className="p-6">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                              <div className="w-8 h-8 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center mr-3">
                                <span className="text-pink-600 dark:text-pink-400 font-semibold text-sm">
                                  {index + 1}
                                </span>
                              </div>
                              {section.category}
                            </h3>
                            <ul className="space-y-3">
                              {section.practices.map((practice, practiceIndex) => (
                                <li key={practiceIndex} className="flex items-start space-x-3">
                                  <CheckCircle size={16} className="text-pink-500 mt-1 flex-shrink-0" />
                                  <span className="text-gray-700 dark:text-gray-300">{practice}</span>
                                </li>
                              ))}
                            </ul>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    {/* Cultural Adaptation Note */}
                    <Card className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <div className="flex items-start space-x-3">
                        <Info className="text-blue-500 mt-1 flex-shrink-0" size={20} />
                        <div>
                          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                            Adapting to Your Circumstances
                          </h4>
                          <p className="text-blue-700 dark:text-blue-300">
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
                                "{example.example}"
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
                          </div>
                          
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                              Malaysian AIDS Foundation (MAF)
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              Provides counseling, testing, and support services. Offers culturally 
                              sensitive care and education programs.
                            </p>
                          </div>

                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                              University Health Centers
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              Many university health centers offer confidential STI testing and 
                              education specifically designed for young adults.
                            </p>
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
                          </div>
                          
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                              Malaysia Ministry of Health
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              Official Malaysian clinical guidelines for STI prevention and treatment 
                              adapted for local context.
                            </p>
                          </div>

                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">
                              Centers for Disease Control (CDC)
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              International best practices and research evidence for STI prevention 
                              strategies and effectiveness data.
                            </p>
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

          {/* Bottom Navigation */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between">
            <Button variant="outline" onClick={() => router.push('/stis')}>
              <ArrowLeft size={16} className="mr-2" />
              Return to STIs Overview
            </Button>
            <Link href="/chat">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                Get Personalized Guidance
                <MessageCircle size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
