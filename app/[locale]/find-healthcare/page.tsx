import { Metadata } from 'next';
import { ProviderSearch } from '@/app/components/find-healthcare/ProviderSearch';

export const metadata: Metadata = {
  title: 'STI Services Directory | Safhira',
  description: 'Find healthcare providers that offer STI testing, PrEP, and PEP services in Malaysia',
};

export default function STIServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:py-10">
      <ProviderSearch />
    </div>
  );
}