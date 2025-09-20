'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ProviderRecord, ProviderSearchFilters, StateOption, getAllStates, searchProvidersWithFilters } from '@/app/actions/provider-actions';
import { ProviderCard } from './ProviderCard';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Card, CardContent } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Search, Filter, X, Loader2, AlertCircle, ChevronLeft, ChevronRight, MapPin, Target } from 'lucide-react';

interface ProviderSearchProps {
  initialProviders?: ProviderRecord[];
}

export function ProviderSearch({ initialProviders = [] }: ProviderSearchProps) {
  const t = useTranslations('ProviderSearch');
  const [providers, setProviders] = useState<ProviderRecord[]>(initialProviders);
  const [states, setStates] = useState<StateOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const distanceOptions = [5, 10, 25, 50, 100];
  const defaultDistance = 25;

  const [filters, setFilters] = useState<ProviderSearchFilters>(() => {
    const baseFilters: ProviderSearchFilters = {
      searchQuery: '',
      stateIds: [],
      providePrep: false,
      providePep: false,
      freeStiScreening: false,
      limit: 18,
      offset: 0,
      maxDistance: defaultDistance,
    };

    // Restore persisted location data
    if (typeof window !== 'undefined') {
      const savedLat = sessionStorage.getItem('safhira-user-latitude');
      const savedLon = sessionStorage.getItem('safhira-user-longitude');
      const savedDistance = sessionStorage.getItem('safhira-max-distance');
      
      if (savedLat && savedLon) {
        baseFilters.userLatitude = parseFloat(savedLat);
        baseFilters.userLongitude = parseFloat(savedLon);
        baseFilters.maxDistance = savedDistance ? parseInt(savedDistance) : defaultDistance;
      }
    }

    return baseFilters;
  });

  // Location-related state with persistence
  const [maxDistance, setMaxDistance] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('safhira-max-distance');
      return saved ? parseInt(saved) : defaultDistance;
    }
    return defaultDistance;
  });
  const [geolocating, setGeolocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [calculatingDistances, setCalculatingDistances] = useState(false);
  const [selectedLocationLabel, setSelectedLocationLabel] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('safhira-location-label') || null;
    }
    return null;
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch states on component mount
  useEffect(() => {
    fetchStates();
    if (initialProviders.length === 0) {
      fetchProviders();
    } else {
      setProviders(initialProviders);
      setTotal(initialProviders.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recalculate distances on mount if location is persisted
  useEffect(() => {
    const shouldRecalculateDistances = 
      typeof filters.userLatitude === 'number' && 
      typeof filters.userLongitude === 'number' && 
      providers.length > 0;

    if (shouldRecalculateDistances) {
      calculateAccurateDistances(
        filters.userLatitude!,
        filters.userLongitude!,
        providers,
        filters.maxDistance
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers.length]);

  const fetchStates = async () => {
    try {
      const statesData = await getAllStates();
      setStates(statesData);
    } catch (err) {
      console.error('Failed to fetch states:', err);
    }
  };

  const fetchProviders = async (newFilters?: ProviderSearchFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const searchFilters = newFilters || filters;
      const data = await searchProvidersWithFilters(searchFilters);
      setProviders(data.providers);
      setTotal(data.total);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching providers');
      setProviders([]);
      setTotal(0);
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters = { ...filters, offset: 0 };
    setFilters(newFilters);
    fetchProviders(newFilters);
  };

  const handleFilterChange = (key: keyof ProviderSearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value, offset: 0 };
    setFilters(newFilters);
  };

  const handleStateToggle = (stateId: number) => {
    const currentStateIds = filters.stateIds || [];
    const newStateIds = currentStateIds.includes(stateId)
      ? currentStateIds.filter(id => id !== stateId)
      : [...currentStateIds, stateId];
    
    handleFilterChange('stateIds', newStateIds);
  };

  const applyLocationFilters = async (
    latitude: number,
    longitude: number,
    label?: string,
  ) => {
    const newFilters = {
      ...filters,
      userLatitude: latitude,
      userLongitude: longitude,
      maxDistance,
      offset: 0,
    };

    // Persist location data to sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('safhira-user-latitude', latitude.toString());
      sessionStorage.setItem('safhira-user-longitude', longitude.toString());
      sessionStorage.setItem('safhira-max-distance', maxDistance.toString());
      if (label) {
        sessionStorage.setItem('safhira-location-label', label);
      }
    }

    setFilters(newFilters);
    setSelectedLocationLabel(label ?? null);
    setLocationError(null);
    setGeolocating(false);

    const data = await fetchProviders(newFilters);
    if (!data) {
      setLocationError(t('location.error'));
      return;
    }

    await calculateAccurateDistances(latitude, longitude, data.providers, newFilters.maxDistance);
  };

  // Enhanced geolocation with Google Maps distance calculation
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(t('location.notSupported'));
      return;
    }

    setGeolocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await applyLocationFilters(latitude, longitude, t('location.currentLocationLabel'));
      },
      (error) => {
        setGeolocating(false);
        setLocationError(t('location.error'));
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleUseCurrentLocation = () => {
    const confirmed = window.confirm(t('location.permissionPrompt'));
    if (!confirmed) {
      setLocationError(t('location.permissionDenied'));
      return;
    }

    setLocationError(null);
    getCurrentLocation();
  };


  const handleMaxDistanceChange = (value: number) => {
    setMaxDistance(value);
    
    // Persist max distance to sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('safhira-max-distance', value.toString());
    }
    
    const newFilters = {
      ...filters,
      maxDistance: value,
      offset: 0,
    };
    setFilters(newFilters);

    if (
      typeof newFilters.userLatitude === 'number' &&
      typeof newFilters.userLongitude === 'number'
    ) {
      void (async () => {
        const data = await fetchProviders(newFilters);
        if (!data) {
          return;
        }

        await calculateAccurateDistances(
          newFilters.userLatitude!,
          newFilters.userLongitude!,
          data.providers,
          newFilters.maxDistance,
        );
      })();
    }
  };

  const calculateAccurateDistances = async (
    userLat: number,
    userLon: number,
    providersList: ProviderRecord[],
    maxDistanceFilter?: number,
  ) => {
    setCalculatingDistances(true);

    try {
      // Calculate haversine distance for providers that have coordinates
      const updatedProviders = providersList.map(provider => {
        if (provider.latitude && provider.longitude) {
          const distance = calculateHaversineDistance(
            userLat,
            userLon,
            provider.latitude,
            provider.longitude
          );
          return {
            ...provider,
            distance: parseFloat(distance.toFixed(1))
          };
        }
        return provider;
      });

      // Sort by distance and apply distance filter
      const filteredAndSorted = updatedProviders
        .filter(p => {
          if (!maxDistanceFilter) return true;
          if (typeof p.distance !== 'number') return true;
          return p.distance <= maxDistanceFilter;
        })
        .sort((a, b) => {
          if (!a.distance && !b.distance) return 0;
          if (!a.distance) return 1;
          if (!b.distance) return -1;
          return a.distance - b.distance;
        });

      setProviders(filteredAndSorted);
      setTotal(filteredAndSorted.length);
    } catch (error) {
      console.error('Error calculating distances:', error);
    } finally {
      setCalculatingDistances(false);
    }
  };

  // Haversine formula to calculate distance between two coordinates
  const calculateHaversineDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const clearLocation = () => {
    // Clear persisted location data from sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('safhira-user-latitude');
      sessionStorage.removeItem('safhira-user-longitude');
      sessionStorage.removeItem('safhira-max-distance');
      sessionStorage.removeItem('safhira-location-label');
    }
    
    setLocationError(null);
    setSelectedLocationLabel(null);
    setMaxDistance(defaultDistance);
    setCalculatingDistances(false);
    setGeolocating(false);
    const newFilters = {
      ...filters,
      userLatitude: undefined,
      userLongitude: undefined,
      maxDistance: defaultDistance,
      offset: 0
    };
    setFilters(newFilters);
    fetchProviders(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: ProviderSearchFilters = {
      searchQuery: '',
      stateIds: [],
      providePrep: false,
      providePep: false,
      freeStiScreening: false,
      limit: 18,
      offset: 0,
      maxDistance: defaultDistance,
    };
    setFilters(clearedFilters);
    setMaxDistance(defaultDistance);
    setSelectedLocationLabel(null);
    setCalculatingDistances(false);
    setLocationError(null);
    setGeolocating(false);
    fetchProviders(clearedFilters);
  };

  const selectedStates = useMemo(() => {
    if (!filters.stateIds || filters.stateIds.length === 0) return [];
    return states.filter(state => filters.stateIds!.includes(state.stateId));
  }, [filters.stateIds, states]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.stateIds && filters.stateIds.length > 0) count++;
    if (filters.providePrep) count++;
    if (filters.providePep) count++;
    if (filters.freeStiScreening) count++;
    return count;
  }, [filters]);

  const totalPages = Math.ceil(total / (filters.limit || 18));
  const currentPage = Math.floor((filters.offset || 0) / (filters.limit || 18)) + 1;

  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * (filters.limit || 18);
    const newFilters = { ...filters, offset: newOffset };
    setFilters(newFilters);
    fetchProviders(newFilters);
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {t('hero.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('hero.subtitle')}
        </p>
        
        {/* Services Legend */}
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            {t('legend.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <div>
                <span className="font-medium text-blue-900 dark:text-blue-100">PrEP:</span>
                <span className="text-blue-700 dark:text-blue-200 ml-1">{t('legend.prep')}</span>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <div>
                <span className="font-medium text-blue-900 dark:text-blue-100">PEP:</span>
                <span className="text-blue-700 dark:text-blue-200 ml-1">{t('legend.pep')}</span>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <div>
                <span className="font-medium text-blue-900 dark:text-blue-100">{t('legend.screening')}:</span>
                <span className="text-blue-700 dark:text-blue-200 ml-1">{t('legend.screeningDesc')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-3 relative">
          {/* Search Input Row */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={t('search.placeholder')}
                value={filters.searchQuery || ''}
                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                className="pl-10 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600"
              />
            </div>
            <Button type="submit" disabled={loading} className="shrink-0">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 sm:hidden" />}
              <span className="hidden sm:inline">{t('search.button')}</span>
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="relative shrink-0"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('search.filters')}</span>
              {activeFiltersCount > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 text-xs shrink-0">{activeFiltersCount}</Badge>
              )}
            </Button>
          </div>
          
          {showFilters && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/20 z-40" 
                onClick={() => setShowFilters(false)}
              />
              
              {/* Filter Dropdown - spans full width */}
              <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">{t('filters.title')}</h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    {t('filters.clearAll')}
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* States Multi-select */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">{t('filters.statesRegions')}</h4>
                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                      {states.map((state) => (
                        <div key={state.stateId} className="flex items-center space-x-2">
                          <Checkbox
                            id={`state-${state.stateId}`}
                            checked={filters.stateIds?.includes(state.stateId) || false}
                            onCheckedChange={() => handleStateToggle(state.stateId)}
                            className="dark:border-white"
                          />
                          <label
                            htmlFor={`state-${state.stateId}`}
                            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {state.stateName}
                          </label>
                        </div>
                      ))}
                    </div>
                    {selectedStates.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {selectedStates.map((state) => (
                          <Badge
                            key={state.stateId}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => handleStateToggle(state.stateId)}
                          >
                            {state.stateName}
                            <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Services */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">{t('filters.availableServices')}</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="prep"
                          checked={filters.providePrep || false}
                          onCheckedChange={(checked) => handleFilterChange('providePrep', checked)}
                          className="dark:border-white"
                        />
                        <label htmlFor="prep" className="text-sm font-normal cursor-pointer">
                          {t('services.prep')}
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="pep"
                          checked={filters.providePep || false}
                          onCheckedChange={(checked) => handleFilterChange('providePep', checked)}
                          className="dark:border-white"
                        />
                        <label htmlFor="pep" className="text-sm font-normal cursor-pointer">
                          {t('services.pep')}
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="screening"
                          checked={filters.freeStiScreening || false}
                          onCheckedChange={(checked) => handleFilterChange('freeStiScreening', checked)}
                          className="dark:border-white"
                        />
                        <label htmlFor="screening" className="text-sm font-normal cursor-pointer">
                          {t('services.freeScreening')}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    fetchProviders();
                    setShowFilters(false);
                  }} 
                  className="w-full mt-6"
                >
                  {t('filters.applyFilters')}
                </Button>
              </div>
            </>
          )}
          
        </form>

        {/* Location Status Box */}
        <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'>
          <CardContent className="pt-6">
            {(typeof filters.userLatitude === 'number' && typeof filters.userLongitude === 'number') ? (
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <div className="flex items-start gap-2 flex-1">
                  <MapPin className="w-4 h-4 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      {selectedLocationLabel || t('location.locationSet')}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      {calculatingDistances
                        ? t('location.calculatingDistances')
                        : t('location.showingNearby', { distance: maxDistance })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {t('location.maxDistance')}
                  </label>
                  <Select value={maxDistance.toString()} onValueChange={(value) => handleMaxDistanceChange(Number(value))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {distanceOptions.map((option) => (
                        <SelectItem key={option} value={option.toString()}>
                          {option} km
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearLocation}
                    className="shrink-0"
                  >
                    <X className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">{t('location.clear')}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                <div className="flex items-start gap-2 flex-1">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {t('location.noLocationSet')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {t('location.enableLocationDescription')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleUseCurrentLocation}
                  disabled={geolocating || calculatingDistances}
                  className="shrink-0"
                >
                  {geolocating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Target className="w-4 h-4 mr-2" />
                  )}
                  <span className="truncate">{geolocating ? t('location.gettingLocation') : t('location.useCurrentLocation')}</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Error */}
        {locationError && (
          <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            {locationError}
          </div>
        )}

      </div>

      {/* Results */}
      <div className="space-y-4">
        {/* Results header */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {loading ? t('status.searching') : total === 1 ? t('status.providersFound', { total }) : t('status.providersFoundPlural', { total })}
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">{t('status.loading')}</span>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {t('error.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <Button onClick={() => fetchProviders()} variant="outline">
                {t('error.tryAgain')}
              </Button>
            </div>
          </div>
        )}

        {/* No results */}
        {!loading && !error && providers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {t('noResults.title')}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {t('noResults.message')}
            </p>
            <Button onClick={clearFilters} variant="outline">
              {t('noResults.clearFilters')}
            </Button>
          </div>
        )}

        {/* Results grid */}
        {!loading && !error && providers.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 !mt-8">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t('pagination.previous')}</span>
                </Button>
                
                <div className="flex items-center space-x-1">
                  {/* Show page numbers with ellipsis for large page counts */}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage > totalPages - 3) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="text-gray-400">...</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={loading}
                        className="w-8 h-8 p-0"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="flex items-center space-x-1"
                >
                  <span>{t('pagination.next')}</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Results summary */}
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              {t('pagination.showing', { 
                start: (currentPage - 1) * (filters.limit || 18) + 1,
                end: Math.min(currentPage * (filters.limit || 18), total),
                total: total
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
