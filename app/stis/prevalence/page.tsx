'use client'

import { PrevalenceSection } from '../../components/landing/PrevalenceSection';
import { Button } from '@/app/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function STIPrevalencePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <section className="py-8 sm:py-12 md:py-16 px-4">
]        <div className="container mx-auto max-w-7xl">
          <Button variant="ghost" onClick={() => router.push('/stis')} className="text-sm sm:text-base">
            <ArrowLeft size={16} className="mr-2" />
            Back to STIs Overview
          </Button>
          <PrevalenceSection />
        </div>
      </section>
    </div>
  );
}
