/**
 * Privacy policy page outlining data collection, usage, and protection practices for the Safhira application.
 * This page provides transparent information about user privacy rights, data handling procedures, and security measures.
 * Features structured legal content with clear sections covering various aspects of data privacy and user rights.
 */
import BreadcrumbTrail from '@/app/components/BreadcrumbTrail';
import {getTranslations} from 'next-intl/server';

export default async function PrivacyPolicyPage() {
  const tBreadcrumbs = await getTranslations('Common.breadcrumbs');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 py-8 sm:py-12 lg:py-16 px-3 sm:px-4">
      <div className="container mx-auto max-w-4xl">
        <BreadcrumbTrail
          items={[
            {label: tBreadcrumbs('home'), href: '/'},
            {label: tBreadcrumbs('privacyPolicy')},
          ]}
        />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">
          Privacy Policy
        </h1>
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p>Privacy policy content will be added here.</p>
        </div>
      </div>
    </div>
  );
}
