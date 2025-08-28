'use client'

import { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { ArrowLeft, CheckCircle, AlertTriangle, Heart, Shield, Users, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { notFound } from 'next/navigation';

interface STIInfo {
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

const stiData: Record<string, STIInfo> = {
  chlamydia: {
    name: 'Chlamydia',
    type: 'Bacterial',
    severity: 'Medium',
    treatability: 'Curable',
    symptoms: {
      common: [
        'Often no symptoms (70% of women, 50% of men)',
        'May develop symptoms 1-3 weeks after infection'
      ],
      women: [
        'Unusual vaginal discharge',
        'Burning sensation when urinating',
        'Pelvic pain or bleeding between periods',
        'Pain during intercourse'
      ],
      men: [
        'Clear or cloudy discharge from penis',
        'Burning or itching around opening of penis',
        'Pain and swelling in testicles'
      ],
      general: [
        'Rectal pain, discharge, or bleeding (if infected through anal contact)',
        'Throat infection (if infected through oral contact)'
      ]
    },
    transmission: [
      'Vaginal, anal, or oral sex with infected partner',
      'Mother to baby during childbirth',
      'Not spread through casual contact, toilet seats, or sharing clothes'
    ],
    healthEffects: [
      'In women: Can cause pelvic inflammatory disease (PID)',
      'Can lead to infertility in both men and women',
      'Increases risk of HIV infection',
      'Can cause ectopic pregnancy',
      'Eye infections in newborns'
    ],
    prevention: [
      'Use condoms consistently and correctly',
      'Get regular STI testing',
      'Have open communication with partner about sexual health',
      'Limit number of sexual partners'
    ],
    treatment: 'Easily cured with antibiotics (usually azithromycin or doxycycline). Both partners must be treated.',
    malaysianContext: 'Chlamydia is one of the most common STIs among young Malaysians. Free testing is available at government clinics. No shame in seeking treatment - it\'s a responsible health decision.'
  },
  gonorrhea: {
    name: 'Gonorrhea',
    type: 'Bacterial',
    severity: 'Medium',
    treatability: 'Curable',
    symptoms: {
      common: [
        'Many people have no symptoms',
        'Symptoms typically appear 1-14 days after infection'
      ],
      women: [
        'Increased vaginal discharge',
        'Painful urination',
        'Vaginal bleeding between periods',
        'Abdominal or pelvic pain'
      ],
      men: [
        'White, yellow, or green discharge from penis',
        'Painful or burning sensation when urinating',
        'Sometimes pain or swelling in testicles'
      ],
      general: [
        'Rectal symptoms: itching, soreness, bleeding, discharge',
        'Throat infection usually has no symptoms'
      ]
    },
    transmission: [
      'Vaginal, anal, or oral sex with infected person',
      'Mother to baby during delivery',
      'Touching infected genital area then touching eyes'
    ],
    healthEffects: [
      'Can cause pelvic inflammatory disease in women',
      'Infertility in both men and women',
      'Increased HIV risk',
      'Can spread to blood and joints',
      'Serious complications in newborns'
    ],
    prevention: [
      'Consistent condom use',
      'Regular STI screening',
      'Monogamous relationship with tested partner',
      'Open communication about sexual health'
    ],
    treatment: 'Curable with antibiotics, but some strains are becoming resistant. Dual therapy is now standard.',
    malaysianContext: 'Drug-resistant gonorrhea is emerging in Malaysia. Early detection and proper treatment are crucial. All government hospitals provide confidential treatment.'
  },
  herpes: {
    name: 'Herpes (HSV-1 & HSV-2)',
    type: 'Viral',
    severity: 'Low',
    treatability: 'Manageable',
    symptoms: {
      common: [
        'Many people never have symptoms',
        'First outbreak usually most severe',
        'Recurrent outbreaks typically milder and shorter'
      ],
      women: [
        'Painful blisters or sores on genitals',
        'Itching or tingling before outbreak',
        'Painful urination',
        'Unusual vaginal discharge'
      ],
      men: [
        'Painful blisters or sores on penis or surrounding area',
        'Itching or tingling sensation',
        'Painful urination'
      ],
      general: [
        'Flu-like symptoms during first outbreak',
        'Swollen lymph nodes',
        'Body aches and fever'
      ]
    },
    transmission: [
      'Skin-to-skin contact during oral, vaginal, or anal sex',
      'Can spread even when no symptoms are present',
      'HSV-1 (usually oral) can cause genital herpes through oral sex',
      'Mother to baby during delivery'
    ],
    healthEffects: [
      'Usually not serious in healthy adults',
      'Can be serious in people with weakened immune systems',
      'Increases HIV risk',
      'Can cause severe illness in newborns'
    ],
    prevention: [
      'Use condoms, though they don\'t provide complete protection',
      'Avoid sexual contact during outbreaks',
      'Take daily suppressive medication if prescribed',
      'Discuss with partner about herpes status'
    ],
    treatment: 'No cure, but antiviral medications can manage symptoms and reduce outbreaks. Many people live normal, healthy lives.',
    malaysianContext: 'Herpes is very common globally. In Malaysia, support groups and counseling are available. Having herpes doesn\'t define you or your worth.'
  },
  hpv: {
    name: 'Human Papillomavirus (HPV)',
    type: 'Viral',
    severity: 'Medium',
    treatability: 'Preventable',
    symptoms: {
      common: [
        'Most HPV infections have no symptoms',
        'Body\'s immune system often clears HPV naturally',
        'Symptoms depend on HPV type'
      ],
      women: [
        'Genital warts (low-risk types)',
        'Abnormal Pap test results',
        'No symptoms for high-risk types initially'
      ],
      men: [
        'Genital warts on penis or surrounding area',
        'Usually no symptoms for high-risk types'
      ],
      general: [
        'Warts may appear weeks to years after infection',
        'Warts can be small, large, raised, flat, or cauliflower-shaped'
      ]
    },
    transmission: [
      'Sexual contact (vaginal, anal, oral)',
      'Skin-to-skin contact in genital area',
      'Can spread even with condom use',
      'Very common - most sexually active people get HPV'
    ],
    healthEffects: [
      'High-risk types can cause cervical cancer',
      'Can cause other cancers (vulvar, vaginal, penile, anal, throat)',
      'Low-risk types cause genital warts',
      'Usually clears on its own within 2 years'
    ],
    prevention: [
      'HPV vaccine (recommended for ages 9-26, available up to 45)',
      'Regular cervical screening (Pap tests)',
      'Limit number of sexual partners',
      'Use condoms (partial protection)'
    ],
    treatment: 'No treatment for virus itself. Warts can be treated. Regular screening detects cell changes early.',
    malaysianContext: 'HPV vaccine is available in Malaysia for both males and females. Government hospitals provide cervical screening. Vaccination is a smart health investment.'
  },
  hiv: {
    name: 'Human Immunodeficiency Virus (HIV)',
    type: 'Viral',
    severity: 'High',
    treatability: 'Manageable',
    symptoms: {
      common: [
        'Early infection may feel like flu',
        'Many people have no symptoms for years',
        'Symptoms vary greatly between individuals'
      ],
      women: [
        'Recurring vaginal yeast infections',
        'Severe pelvic inflammatory disease',
        'Abnormal Pap test results',
        'Frequent or severe vaginal infections'
      ],
      men: [
        'No specific symptoms different from women',
        'May experience same general symptoms'
      ],
      general: [
        'Fever, headache, muscle aches (early stage)',
        'Swollen lymph nodes',
        'Extreme fatigue',
        'Frequent infections (later stages)'
      ]
    },
    transmission: [
      'Unprotected sexual contact',
      'Sharing needles or syringes',
      'Mother to child during pregnancy, birth, or breastfeeding',
      'Blood transfusions (very rare in Malaysia due to screening)'
    ],
    healthEffects: [
      'Attacks immune system',
      'Without treatment, can progress to AIDS',
      'Increases risk of infections and certain cancers',
      'With treatment, people live near-normal lifespans'
    ],
    prevention: [
      'Use condoms consistently',
      'Get tested regularly and know partner\'s status',
      'PrEP (pre-exposure prophylaxis) for high-risk individuals',
      'Never share needles'
    ],
    treatment: 'Highly effective antiretroviral therapy (ART) available. With treatment, viral load becomes undetectable and untransmittable.',
    malaysianContext: 'HIV treatment and testing are available free at government hospitals in Malaysia. With proper treatment, people with HIV live full, healthy lives. Support services are available nationwide.'
  },
  syphilis: {
    name: 'Syphilis',
    type: 'Bacterial',
    severity: 'High',
    treatability: 'Curable',
    symptoms: {
      common: [
        'Progresses through stages if untreated',
        'Can hide for years between stages',
        'Early treatment prevents complications'
      ],
      women: [
        'Primary: Single, painless sore (chancre)',
        'Secondary: Skin rash, including palms and soles',
        'May cause pregnancy complications'
      ],
      men: [
        'Primary: Single, painless sore on genitals',
        'Secondary: Body rash, flu-like symptoms'
      ],
      general: [
        'Primary: Painless sores at infection site',
        'Secondary: Rash, fever, fatigue, sore throat',
        'Latent: No symptoms but still infectious'
      ]
    },
    transmission: [
      'Direct contact with syphilis sores',
      'Vaginal, anal, or oral sex',
      'Mother to baby during pregnancy',
      'Touching sores during kissing'
    ],
    healthEffects: [
      'Can damage heart, brain, nerves, eyes',
      'In pregnancy: stillbirth, premature birth, birth defects',
      'Increases HIV risk',
      'Late stage can cause death'
    ],
    prevention: [
      'Use condoms correctly and consistently',
      'Regular STI testing',
      'Limit sexual partners',
      'Avoid contact with sores'
    ],
    treatment: 'Completely curable with penicillin. Early treatment prevents serious complications.',
    malaysianContext: 'Syphilis cases are increasing in Malaysia. Regular testing is important, especially during pregnancy. Treatment is available at all government health facilities.'
  }
};

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

export default function STIPage() {
  const router = useRouter();
  const params = useParams();
  const stiId = params.sti as string;
  
  const stiInfo = stiData[stiId];
  
  if (!stiInfo) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <Button variant="ghost" onClick={() => router.push('/stis')} className="mb-4">
              <ArrowLeft size={16} className="mr-2" />
              Back to STIs Overview
            </Button>
            
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">
                {stiInfo.name}
              </h1>
              <div className="flex gap-3">
                <Badge className={getSeverityColor(stiInfo.severity)}>
                  {stiInfo.severity} Risk
                </Badge>
                <Badge className={getTreatabilityColor(stiInfo.treatability)}>
                  {stiInfo.treatability}
                </Badge>
                <Badge variant="outline">
                  {stiInfo.type}
                </Badge>
              </div>
            </div>
            
            {/* Malaysian Context */}
            <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 mb-8">
              <div className="flex items-start space-x-3">
                <Info className="text-blue-500 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                    Malaysian Context
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300">
                    {stiInfo.malaysianContext}
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
              <Tabs defaultValue="symptoms" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
                  <TabsTrigger value="transmission">Transmission</TabsTrigger>
                  <TabsTrigger value="effects">Health Effects</TabsTrigger>
                  <TabsTrigger value="prevention">Prevention</TabsTrigger>
                  <TabsTrigger value="treatment">Treatment</TabsTrigger>
                </TabsList>

                <TabsContent value="symptoms" className="mt-8 space-y-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                        <AlertTriangle size={20} className="mr-3 text-yellow-500" />
                        General Symptoms
                      </h3>
                      <ul className="space-y-3">
                        {stiInfo.symptoms.common.map((symptom, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <CheckCircle size={18} className="text-teal-500 mt-1 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                          Symptoms in Women
                        </h3>
                        <ul className="space-y-3">
                          {stiInfo.symptoms.women.map((symptom, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <CheckCircle size={16} className="text-pink-500 mt-1 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">{symptom}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                          Symptoms in Men
                        </h3>
                        <ul className="space-y-3">
                          {stiInfo.symptoms.men.map((symptom, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <CheckCircle size={16} className="text-blue-500 mt-1 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">{symptom}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {stiInfo.symptoms.general.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                          Other Symptoms
                        </h3>
                        <ul className="space-y-3">
                          {stiInfo.symptoms.general.map((symptom, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <CheckCircle size={16} className="text-purple-500 mt-1 flex-shrink-0" />
                              <span className="text-gray-700 dark:text-gray-300">{symptom}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="transmission" className="mt-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                      <Users size={20} className="mr-3 text-orange-500" />
                      How {stiInfo.name} Spreads
                    </h3>
                    <ul className="space-y-4">
                      {stiInfo.transmission.map((method, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <CheckCircle size={18} className="text-orange-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{method}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="effects" className="mt-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                      <AlertTriangle size={20} className="mr-3 text-red-500" />
                      Potential Health Effects
                    </h3>
                    <ul className="space-y-4">
                      {stiInfo.healthEffects.map((effect, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <CheckCircle size={18} className="text-red-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{effect}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="prevention" className="mt-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                      <Shield size={20} className="mr-3 text-green-500" />
                      Prevention Methods
                    </h3>
                    <ul className="space-y-4">
                      {stiInfo.prevention.map((method, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <CheckCircle size={18} className="text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{method}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="treatment" className="mt-8">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                      <Heart size={20} className="mr-3 text-blue-500" />
                      Treatment Information
                    </h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                        {stiInfo.treatment}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>

          {/* Help Section */}
          <Card className="mt-8 p-6 bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20">
            <div className="flex items-start space-x-3">
              <Heart className="text-teal-500 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  Need Support or Have Questions?
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Remember that seeking information and treatment shows responsibility and self-care. 
                  Healthcare professionals in Malaysia are trained to provide confidential, non-judgmental care.
                </p>
                <Button 
                  onClick={() => router.push('/chat')} 
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Ask Our AI Assistant
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
} 