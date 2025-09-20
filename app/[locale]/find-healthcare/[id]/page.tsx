import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProviderById } from '@/app/database_query_endpoint/provider-actions';
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
  
  if (isNaN(id)) {
    return {
      title: 'Provider Not Found | Safhira',
    };
  }

  try {
    const provider = await getProviderById(id);
    
    if (!provider) {
      return {
        title: 'Provider Not Found | Safhira',
      };
    }

    return {
      title: `${provider.name} | STI Services | Safhira`,
      description: `${provider.name} - Healthcare provider in ${provider.stateName} offering STI testing, PrEP, and PEP services`,
    };
  } catch (error) {
    return {
      title: 'Provider Details | Safhira',
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ProviderDetails provider={provider} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching provider details:', error);
    notFound();
  }
}