'use client'

import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function STINotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <section className="py-8 sm:py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <Card className="p-6 sm:p-8 md:p-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-yellow-500" size={24} />
                </div>
              </div>
              
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3 sm:mb-4">
                STI Information Not Found
              </h1>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
                The STI information you&apos;re looking for doesn&apos;t exist or may have been moved. 
                Please check the URL or browse our available STI information below.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link href="/stis" className="w-full sm:w-auto">
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white w-full sm:w-auto text-sm sm:text-base">
                    <ArrowLeft size={16} className="mr-2" />
                    Browse All STIs
                  </Button>
                </Link>
                
                <Link href="/" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto text-sm sm:text-base">
                    Back to Home
                  </Button>
                </Link>
              </div>

              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4 text-sm sm:text-base">
                  Available STI Information:
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <Link href="/stis/chlamydia" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 p-2 rounded hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">
                    Chlamydia
                  </Link>
                  <Link href="/stis/gonorrhea" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 p-2 rounded hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">
                    Gonorrhea
                  </Link>
                  <Link href="/stis/herpes" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 p-2 rounded hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">
                    Herpes
                  </Link>
                  <Link href="/stis/hpv" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 p-2 rounded hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">
                    HPV
                  </Link>
                  <Link href="/stis/hiv" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 p-2 rounded hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">
                    HIV
                  </Link>
                  <Link href="/stis/syphilis" className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 p-2 rounded hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors">
                    Syphilis
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
} 