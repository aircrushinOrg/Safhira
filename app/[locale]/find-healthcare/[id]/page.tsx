import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getProviderById } from '@/app/actions/provider-actions';
import { ProviderDetails } from '@/app/components/find-healthcare/ProviderDetails';

interface ProviderDetailsPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export async function generateMetadata({ params }: ProviderDetailsPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);
  const t = await getTranslations('ProviderDetailsPage');
  const tBreadcrumbs = await getTranslations('Common.breadcrumbs');

  if (isNaN(id)) {
    return {
      title: t('metadata.notFound'),
    };
  }

  try {
    const provider = await getProviderById(id);

    if (!provider) {
      return {
        title: t('metadata.notFound'),
      };
    }

    return {
      title: `${provider.name} | ${tBreadcrumbs('services')} | Safhira`,
      description: t('metadata.description', {
        providerName: provider.name,
        stateName: provider.stateName || 'Malaysia'
      }),
    };
  } catch (error) {
    return {
      title: t('metadata.default'),
    };
  }
}

export default async function ProviderDetailsPage({ params }: ProviderDetailsPageProps) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id);
  
  if (isNaN(id)) {
    notFound();
  }

  try {
    const provider = await getProviderById(id);
    
    if (!provider) {
      notFound();
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950">
        <ProviderDetails provider={provider} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching provider details:', error);
    notFound();
  }
}
