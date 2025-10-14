/**
 * STI Services Directory page that helps users find healthcare providers in Malaysia.
 * This page provides a searchable interface for locating providers that offer STI testing, PrEP, and PEP services.
 * Features location-based search, filtering options, and detailed provider information with contact details.
 */
import { Metadata } from 'next';
import { ProviderSearch } from '@/app/components/find-healthcare/ProviderSearch';
import BreadcrumbTrail from '@/app/components/BreadcrumbTrail';
import {getTranslations} from 'next-intl/server';

export const metadata: Metadata = {
  title: 'STI Services Directory | Safhira',
  description: 'Find healthcare providers that offer STI testing, PrEP, and PEP services in Malaysia',
};

export default async function STIServicesPage() {
  const tBreadcrumbs = await getTranslations('Common.breadcrumbs');

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950">
      <section className="px-4 py-8 sm:py-12 md:py-16">
        <div className="container mx-auto max-w-6xl">
          <BreadcrumbTrail
            items={[
              {label: tBreadcrumbs('home'), href: '/'},
              {label: tBreadcrumbs('services')},
            ]}
          />
          <div className="mt-8">
            <ProviderSearch />
          </div>
        </div>
      </section>
    </div>
  );
}
