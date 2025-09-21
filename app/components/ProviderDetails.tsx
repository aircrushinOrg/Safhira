'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ProviderRecord } from '@/app/database_query_endpoint/provider-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Separator } from '@/app/components/ui/separator';
import { 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  ArrowLeft, 
  ExternalLink,
  Navigation
} from 'lucide-react';
import BreadcrumbTrail from './BreadcrumbTrail';

interface ProviderDetailsProps {
  provider: ProviderRecord;
}

export function ProviderDetails({ provider }: ProviderDetailsProps) {
  const t = useTranslations('ProviderDetails');
  const tBreadcrumbs = useTranslations('Common.breadcrumbs');
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const services = [];
  if (provider.providesPrep) services.push(t('services.prep'));
  if (provider.providesPep) services.push(t('services.pep'));
  if (provider.freeStiScreening) services.push(t('services.freeScreening'));

  // Generate Google Maps embed URL
  const getMapEmbedUrl = () => {
    if (!isClient) return null;
    
    // Use the API key from the environment - client-side environment variable
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return null;

    // If we have googlePlaceId, use it for more accurate location
    if (provider.googlePlaceId) {
      return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=place_id:${provider.googlePlaceId}&zoom=15`;
    }
    
    // Fallback to coordinates if available
    if (provider.latitude && provider.longitude) {
      return `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${provider.latitude},${provider.longitude}&zoom=15`;
    }
    
    // Final fallback to search by name and address
    const query = encodeURIComponent(`${provider.name} ${provider.address}`);
    return `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${query}&zoom=15`;
  };

  // Generate Google Maps link for external viewing
  const getGoogleMapsLink = () => {
    if (provider.googlePlaceId) {
      return `https://www.google.com/maps/place/?q=place_id:${provider.googlePlaceId}`;
    }
    
    if (provider.latitude && provider.longitude) {
      return `https://www.google.com/maps?q=${provider.latitude},${provider.longitude}`;
    }
    
    const query = encodeURIComponent(`${provider.name} ${provider.address}`);
    return `https://www.google.com/maps/search/${query}`;
  };

  const mapEmbedUrl = getMapEmbedUrl();
  const mapsLink = getGoogleMapsLink();

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <BreadcrumbTrail
        items={[
          {label: tBreadcrumbs('home'), href: '/'},
          {label: tBreadcrumbs('services'), href: '/sti-services'},
          {label: provider.name},
        ]}
      />
      {/* Header */}
      <div className="mb-6">
        <Link 
          href="/sti-services"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('navigation.backToServices')}
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {provider.name}
            </h1>
            {provider.stateName && (
              <Badge variant="secondary" className="text-sm">
                {provider.stateName}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Provider Information Card */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-teal-500" />
              {t('info.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Address */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('info.address')}
              </h3>
              <p className="text-gray-900 dark:text-gray-100">
                {provider.address}
              </p>
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('info.contact')}
              </h3>
              
              {provider.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  <a 
                    href={`tel:${provider.phone}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {provider.phone}
                  </a>
                </div>
              )}

              {provider.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-teal-500 flex-shrink-0" />
                  <a 
                    href={`mailto:${provider.email}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 break-all"
                  >
                    {provider.email}
                  </a>
                </div>
              )}

              {!provider.phone && !provider.email && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {t('info.noContact')}
                </p>
              )}
            </div>

            <Separator />

            {/* Services */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('services.title')}
              </h3>
              
              {services.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-teal-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('services.available')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {services.map((service, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                      >
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {t('services.noServices')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Map Card */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center">
              <Navigation className="w-5 h-5 mr-2 text-teal-500" />
              {t('map.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isClient && mapEmbedUrl ? (
              <div className="space-y-4">
                <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <iframe
                    src={mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Map showing location of ${provider.name}`}
                  />
                </div>
                
                {/* <Button 
                  asChild 
                  className="w-full"
                  variant="outline"
                >
                  <a 
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {t('map.viewInGoogleMaps')}
                  </a>
                </Button> */}
              </div>
            ) : (
              <div className="w-full h-64 sm:h-80 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {t('map.notAvailable')}
                  </p>
                  {mapsLink && (
                    <Button 
                      asChild 
                      className="mt-3"
                      variant="outline"
                      size="sm"
                    >
                      <a 
                        href={mapsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {t('map.searchInGoogleMaps')}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
