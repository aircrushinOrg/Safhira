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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 md:py-10">
      <div className="mx-auto w-full max-w-7xl px-6 pb-2">
        <BreadcrumbTrail
          items={[
            {label: tBreadcrumbs('home'), href: '/'},
            {label: tBreadcrumbs('services')},
          ]}
        />
      </div>
      <ProviderSearch />
    </div>
  );
}
