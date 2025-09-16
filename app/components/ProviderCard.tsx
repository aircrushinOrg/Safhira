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
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {provider.name}
          </CardTitle>
          {provider.stateName && (
            <Badge variant="secondary" className="ml-2">
              {provider.stateName}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-start space-x-2">
          <MapPin className="w-4 h-4 mt-1 text-gray-500 flex-shrink-0" />
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {provider.address}
          </p>
        </div>

        {provider.phone && (
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-gray-500" />
            <a 
              href={`tel:${provider.phone}`}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {provider.phone}
            </a>
          </div>
        )}

        {provider.email && (
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <a 
              href={`mailto:${provider.email}`}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {provider.email}
            </a>
          </div>
        )}

        {services.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center space-x-1 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('services.availableServices')}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
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
      </CardContent>
    </Card>
  );
}