import { Metadata } from 'next';
import { ProviderSearch } from '@/app/components/ProviderSearch';

export const metadata: Metadata = {
  title: 'Healthcare Provider Directory | Safhira',
  description: 'Find healthcare providers that offer STI testing, PrEP, and PEP services in Malaysia',
};

export default function ProvidersPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ProviderSearch />
    </div>
  );
}