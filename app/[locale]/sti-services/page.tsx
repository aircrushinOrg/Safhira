import { Metadata } from 'next';
import { ProviderSearch } from '@/app/components/ProviderSearch';

export const metadata: Metadata = {
  title: 'STI Services Directory | Safhira',
  description: 'Find healthcare providers that offer STI testing, PrEP, and PEP services in Malaysia',
};

export default function STIServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-gray-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 md:py-10">
      <ProviderSearch />
    </div>
  );
}
