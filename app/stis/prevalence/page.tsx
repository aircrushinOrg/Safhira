/**
 * STI prevalence data visualization page displaying epidemiological trends and statistics.
 * This page provides interactive charts and maps showing STI rates, demographic breakdowns, and geographical distribution across Malaysia.
 * Features data visualization components with filtering capabilities and educational context about public health trends.
 */
'use client'

import { PrevalenceSection } from '../../components/landing/PrevalenceSection';
import { Button } from '@/app/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import BreadcrumbTrail from '@/app/components/BreadcrumbTrail';
import {useTranslations} from 'next-intl';

export default function STIPrevalencePage() {
  const router = useRouter();
  const tBreadcrumbs = useTranslations('Common.breadcrumbs');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <section className="py-8 sm:py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <BreadcrumbTrail
            items={[
              {label: tBreadcrumbs('home'), href: '/'},
              {label: tBreadcrumbs('stis'), href: '/stis'},
              {label: tBreadcrumbs('stiPrevalence')},
            ]}
          />
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
