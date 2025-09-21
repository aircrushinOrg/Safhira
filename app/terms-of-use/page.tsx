import BreadcrumbTrail from '@/app/components/BreadcrumbTrail';
import {getTranslations} from 'next-intl/server';

export default async function TermsOfUsePage() {
  const tBreadcrumbs = await getTranslations('Common.breadcrumbs');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8 sm:py-12 lg:py-16 px-3 sm:px-4">
      <div className="container mx-auto max-w-4xl">
        <BreadcrumbTrail
          items={[
            {label: tBreadcrumbs('home'), href: '/'},
            {label: tBreadcrumbs('termsOfUse')},
          ]}
        />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">
          Terms of Use
        </h1>
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p>Terms of use content will be added here.</p>
        </div>
      </div>
    </div>
  );
}
