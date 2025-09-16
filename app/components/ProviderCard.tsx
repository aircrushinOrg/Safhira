'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ProviderRecord } from '@/app/database_query_endpoint/provider-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { MapPin, Phone, Mail, CheckCircle } from 'lucide-react';

interface ProviderCardProps {
  provider: ProviderRecord;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const t = useTranslations('ProviderCard');
  const services = [];
  if (provider.providesPrep) services.push(t('services.prep'));
  if (provider.providesPep) services.push(t('services.pep'));
  if (provider.freeStiScreening) services.push(t('services.freeScreening'));

  return (
    <Card className="w-full h-full hover:shadow-lg cursor-pointer bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-shadow p-4 sm:p-6">
      <div>
        <div className="flex flex-col gap-6">
          <CardTitle className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 leading-tight mb-4">
            {provider.name}
          </CardTitle>
          {provider.stateName && (
            <Badge variant="secondary" className="text-xs mb-4 dark:bg-black">
              {provider.stateName}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-start space-x-2 sm:space-x-3">
          <MapPin className="w-4 h-4 mt-1 text-teal-500 flex-shrink-0" />
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {provider.address}
          </p>
        </div>

        {provider.phone && (
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Phone className="w-4 h-4 text-teal-500" />
            <a 
              href={`tel:${provider.phone}`}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 leading-relaxed"
            >
              {provider.phone}
            </a>
          </div>
        )}

        {provider.email && (
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Mail className="w-4 h-4 text-teal-500" />
            <a 
              href={`mailto:${provider.email}`}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 leading-relaxed"
            >
              {provider.email}
            </a>
          </div>
        )}

        {services.length > 0 && (
          <div className="pt-2 mt-auto">
            <div className="flex items-center space-x-1 sm:space-x-2 mb-3">
              <CheckCircle className="w-4 h-4 text-teal-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('services.availableServices')}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {services.map((service, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                >
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}