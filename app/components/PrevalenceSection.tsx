'use client'

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, BarChart3, TrendingUp, Users, Heart, Info, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { 
  prevalenceByState, 
  yearlyTrends, 
  ageGroupData, 
  globalComparison
} from '../../lib/prevalence-data';

// Custom tooltip component for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="font-medium text-gray-800 dark:text-gray-200">{label}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} className="text-sm text-gray-700 dark:text-gray-300">
            {pld.dataKey}: {pld.value} {pld.dataKey.includes('percentage') ? '%' : 'per 100,000'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface PrevalenceSectionProps {
  showNavigation?: boolean;
  showCallToAction?: boolean;
  isFullPage?: boolean;
  className?: string;
}

export function PrevalenceSection({ 
  showNavigation = false, 
  showCallToAction = false, 
  isFullPage = false,
  className = ""
}: PrevalenceSectionProps) {
  const router = useRouter();
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const handleStateClick = (data: any) => {
    setSelectedState(data.state);
  };

  const handleHealthcareDirectoryClick = () => {
    // Get user's location and search for nearby STI testing centers in Google Maps
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Open Google Maps with search for STI testing centers near user's location
          const searchQuery = 'STI testing clinic health center Malaysia';
          const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}/@${latitude},${longitude},12z`;
          window.open(mapsUrl, '_blank');
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Fallback: Open Google Maps with general search for Malaysia STI testing
          const searchQuery = 'STI testing clinic health center Malaysia';
          const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
          window.open(mapsUrl, '_blank');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      // Fallback for browsers without geolocation support
      const searchQuery = 'STI testing clinic health center Malaysia';
      const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const sectionClass = isFullPage 
    ? "min-h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    : "";

  const containerClass = isFullPage ? "py-16 px-4" : "py-16 px-4";

  return (
    <div className={`${sectionClass} ${className}`}>
      <section className={containerClass}>
        <div className="container mx-auto max-w-7xl">
          <div className="mb-8">
            {showNavigation && (
              <Button variant="ghost" onClick={() => router.push('/stis')} className="mb-4">
                <ArrowLeft size={16} className="mr-2" />
                Back to STIs Overview
              </Button>
            )}
            
            <div className="mb-6 text-center">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                STI Prevalence in Malaysia
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Understanding the scale of STIs in our community helps reduce stigma and 
                shows that sexual health concerns are common and treatable.
              </p>
            </div>
          
          {/* Supportive Context Statement */}
          <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 mb-8">
            <div className="flex items-start space-x-3">
              <Heart className="text-blue-500 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  You&apos;re Not Alone: Understanding Community Health
                </h3>
                <p className="text-blue-700 dark:text-blue-300 mb-3">
                  STIs affect millions of people worldwide, including many in Malaysia. These statistics 
                  represent real people from all walks of life—students, professionals, parents, and community 
                  members—who have successfully received treatment and care.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-blue-500" />
                    <span className="text-blue-700 dark:text-blue-300 text-sm">Most STIs are easily treatable</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-blue-500" />
                    <span className="text-blue-700 dark:text-blue-300 text-sm">Testing is confidential & accessible</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-blue-500" />
                    <span className="text-blue-700 dark:text-blue-300 text-sm">Healthcare providers are trained to help</span>
                  </div>
                </div>
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
            <Tabs defaultValue="by-state" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="by-state">By State/Region</TabsTrigger>
                <TabsTrigger value="trends">Trends Over Time</TabsTrigger>
                <TabsTrigger value="demographics">Age Groups</TabsTrigger>
                <TabsTrigger value="context">Regional Context</TabsTrigger>
              </TabsList>

              <TabsContent value="by-state" className="mt-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                      <BarChart3 size={24} className="mr-3 text-purple-500" />
                      STI Prevalence by Malaysian State (per 100,000 population)
                    </h2>
                    <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      2023 Data
                    </Badge>
                  </div>

                  <Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={prevalenceByState} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="state" 
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar 
                          dataKey="chlamydia" 
                          fill="#8b5cf6" 
                          name="Chlamydia"
                          onClick={handleStateClick}
                        />
                        <Bar 
                          dataKey="gonorrhea" 
                          fill="#06b6d4" 
                          name="Gonorrhea"
                          onClick={handleStateClick}
                        />
                        <Bar 
                          dataKey="syphilis" 
                          fill="#ef4444" 
                          name="Syphilis"
                          onClick={handleStateClick}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  {selectedState && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
                        <h3 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-3">
                          {selectedState} State Details
                        </h3>
                        {(() => {
                          const stateData = prevalenceByState.find(s => s.state === selectedState);
                          if (!stateData) return null;
                          
                          return (
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-indigo-700 dark:text-indigo-300 text-sm mb-2">
                                  <strong>Population:</strong> {stateData.population} million people
                                </p>
                                <p className="text-indigo-700 dark:text-indigo-300 text-sm mb-2">
                                  <strong>Total estimated cases:</strong> ~{Math.round((stateData.chlamydia + stateData.gonorrhea + stateData.syphilis) * stateData.population * 10)} people
                                </p>
                              </div>
                              <div>
                                <p className="text-indigo-700 dark:text-indigo-300 text-sm">
                                  Remember: These numbers represent your neighbors, colleagues, and community members 
                                  who have received or are receiving quality healthcare. STI testing and treatment 
                                  are routine medical services available throughout Malaysia.
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                      </Card>
                    </motion.div>
                  )}

                  <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <div className="flex items-start space-x-3">
                      <Info className="text-green-500 mt-1 flex-shrink-0" size={20} />
                      <div>
                        <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                          Understanding These Numbers
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4 text-green-700 dark:text-green-300 text-sm">
                          <div>
                            <p className="mb-2">
                              • Higher numbers in urban areas (KL, Selangor) often reflect better healthcare 
                              access and more comprehensive testing programs
                            </p>
                            <p className="mb-2">
                              • These rates are similar to other developed countries in Southeast Asia
                            </p>
                          </div>
                          <div>
                            <p className="mb-2">
                              • Most of these infections are completely curable with standard antibiotics
                            </p>
                            <p className="mb-2">
                              • Early detection through testing prevents complications and further transmission
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="trends" className="mt-8">
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center mb-6">
                    <TrendingUp size={24} className="mr-3 text-green-500" />
                    STI Testing and Detection Trends (2019-2023)
                  </h2>

                  <div className="grid lg:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                        Detection Rates Over Time
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={yearlyTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="chlamydia" 
                            stroke="#8b5cf6" 
                            strokeWidth={3}
                            name="Chlamydia"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="gonorrhea" 
                            stroke="#06b6d4" 
                            strokeWidth={3}
                            name="Gonorrhea"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="syphilis" 
                            stroke="#ef4444" 
                            strokeWidth={3}
                            name="Syphilis"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Card>

                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                        Total Tests Conducted
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={yearlyTrends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip 
                            formatter={(value: any) => [value.toLocaleString(), 'Total Tests']}
                            labelFormatter={(label) => `Year: ${label}`}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="totalTests" 
                            stroke="#10b981" 
                            fill="#10b981"
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Card>
                  </div>

                  <Card className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="text-yellow-500 mt-1 flex-shrink-0" size={20} />
                      <div>
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                          Positive Trends in Malaysian STI Care
                        </h4>
                        <div className="grid md:grid-cols-3 gap-4 text-yellow-700 dark:text-yellow-300 text-sm">
                          <div>
                            <p className="font-medium mb-1">📈 Increased Testing</p>
                            <p>Testing increased by 24% from 2019 to 2023, showing more people are taking charge of their health</p>
                          </div>
                          <div>
                            <p className="font-medium mb-1">🏥 Better Access</p>
                            <p>Government clinics now offer more convenient, confidential testing options</p>
                          </div>
                          <div>
                            <p className="font-medium mb-1">💊 Improved Treatment</p>
                            <p>New treatment protocols mean faster recovery and better outcomes</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="demographics" className="mt-8">
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center mb-6">
                    <Users size={24} className="mr-3 text-orange-500" />
                    Age Group Distribution of STI Cases
                  </h2>

                  <div className="grid lg:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                        Percentage by Age Group
                      </h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={ageGroupData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ ageGroup, percentage }) => `${ageGroup}: ${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="percentage"
                          >
                            {ageGroupData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Card>

                                          <Card className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                          Estimated Cases by Age Group
                        </h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart 
                            data={ageGroupData} 
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="ageGroup" />
                            <YAxis />
                            <Tooltip 
                              formatter={(value: any) => [value.toLocaleString(), 'Estimated Cases']}
                            />
                            <Bar dataKey="cases">
                              {ageGroupData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </Card>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {[
                      {
                        age: "20-24 years",
                        insight: "Peak testing age - many people become sexually active and prioritize health screening",
                        tip: "Regular testing becomes part of responsible adult healthcare"
                      },
                      {
                        age: "25-29 years", 
                        insight: "High awareness period - career-focused individuals taking charge of their health",
                        tip: "Often coincides with serious relationships and family planning"
                      },
                      {
                        age: "30+ years",
                        insight: "Lower rates but consistent testing - shows STI prevention is lifelong",
                        tip: "Demonstrates that sexual health matters at every life stage"
                      }
                    ].map((item, index) => (
                      <Card key={index} className="p-4 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
                        <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">
                          {item.age}
                        </h4>
                        <p className="text-orange-700 dark:text-orange-300 text-sm mb-2">
                          {item.insight}
                        </p>
                        <p className="text-orange-600 dark:text-orange-400 text-xs font-medium">
                          💡 {item.tip}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="context" className="mt-8">
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 flex items-center mb-6">
                    <BarChart3 size={24} className="mr-3 text-blue-500" />
                    Malaysia in Regional Context
                  </h2>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                      Comparative STI Rates (per 100,000 population)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart 
                        data={globalComparison} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="country" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={12}
                        />
                        <YAxis />
                        <Tooltip 
                          formatter={(value: any) => [value, 'Rate per 100,000']}
                        />
                        <Bar dataKey="rate">
                          {globalComparison.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                        🌏 Regional Perspective
                      </h3>
                      <ul className="space-y-2 text-blue-700 dark:text-blue-300 text-sm">
                        <li>• Malaysia&apos;s rates are comparable to other developed Southeast Asian countries</li>
                        <li>• Urban areas show patterns similar to Singapore and major Thai cities</li>
                        <li>• Detection rates reflect strong healthcare infrastructure</li>
                        <li>• Regional cooperation improves cross-border health initiatives</li>
                      </ul>
                    </Card>

                    <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                      <h3 className="font-semibold text-green-800 dark:text-green-200 mb-3">
                        🏥 Healthcare System Strengths
                      </h3>
                      <ul className="space-y-2 text-green-700 dark:text-green-300 text-sm">
                        <li>• Free STI testing at government health clinics nationwide</li>
                        <li>• Well-trained healthcare providers with updated protocols</li>
                        <li>• Confidential treatment respecting patient privacy</li>
                        <li>• Integration with university and community health programs</li>
                      </ul>
                    </Card>
                  </div>

                  <Card className="p-6 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                    <div className="text-center">
                      <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-3">
                        🤝 Community Health is Everyone&apos;s Health
                      </h3>
                      <p className="text-purple-700 dark:text-purple-300 mb-4">
                        These statistics represent a community where people care about their health and have 
                        access to quality medical care. Every person who gets tested, treated, and shares 
                        accurate information helps create a healthier, more informed society.
                      </p>
                      <div className="grid md:grid-cols-3 gap-4 mt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">720,000+</div>
                          <div className="text-sm text-purple-700 dark:text-purple-300">People tested in 2023</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">98%+</div>
                          <div className="text-sm text-purple-700 dark:text-purple-300">Treatment success rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">500+</div>
                          <div className="text-sm text-purple-700 dark:text-purple-300">Healthcare facilities offering STI services</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>

        {/* Bottom Call-to-Action */}
        {showCallToAction && (
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <Card className="p-6 bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800">
              <h3 className="font-semibold text-teal-800 dark:text-teal-200 mb-3">
                📍 Find Testing Near You
              </h3>
              <p className="text-teal-700 dark:text-teal-300 text-sm mb-4">
                STI testing is available at government clinics, university health centers, 
                and private practices throughout Malaysia. Most services are free or low-cost.
              </p>
              <Button 
                variant="outline" 
                className="border-teal-300 text-teal-700 hover:bg-teal-100 dark:border-teal-700 dark:text-teal-300"
                onClick={handleHealthcareDirectoryClick}
              >
                Healthcare Directory
              </Button>
            </Card>

            <Card className="p-6 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
              <h3 className="font-semibold text-indigo-800 dark:text-indigo-200 mb-3">
                💬 Need Personalized Guidance?
              </h3>
              <p className="text-indigo-700 dark:text-indigo-300 text-sm mb-4">
                Our AI assistant can provide confidential, personalized information about 
                STI testing, treatment options, and local resources.
              </p>
              <Link href="/chat">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Chat with AI Assistant
                </Button>
              </Link>
            </Card>
          </div>
        )}

        {/* Navigation */}
        {showNavigation && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between">
            <Button variant="outline" onClick={() => router.push('/stis')}>
              <ArrowLeft size={16} className="mr-2" />
              Back to STIs Overview
            </Button>
            <Link href="/stis/prevention">
              <Button variant="outline">
                Learn About Prevention
                <ArrowLeft size={16} className="ml-2 rotate-180" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
    </div>
  );
}
