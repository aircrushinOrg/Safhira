'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ProviderRecord, ProviderSearchFilters, StateOption, getAllStates, searchProvidersWithFilters } from '@/app/database_query_endpoint/provider-actions';
import { ProviderCard } from './ProviderCard';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Checkbox } from '@/app/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Search, Filter, X, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<ProviderSearchFilters>({
    searchQuery: '',
    stateIds: [],
    providePrep: false,
    providePep: false,
    freeStiScreening: false,
    limit: 18,
    offset: 0,
  });

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching providers');
      setProviders([]);
      setTotal(0);
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

  const clearFilters = () => {
    const clearedFilters: ProviderSearchFilters = {
      searchQuery: '',
      stateIds: [],
      providePrep: false,
      providePep: false,
      freeStiScreening: false,
      limit: 18,
      offset: 0,
    };
    setFilters(clearedFilters);
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
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
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
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('search.button')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="w-4 h-4 mr-2" />
            {t('search.filters')}
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 text-xs">{activeFiltersCount}</Badge>
            )}
          </Button>
        </form>

        {/* Filters Panel */}
        {showFilters && (
          <Card className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm'>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-semibold">{t('filters.title')}</CardTitle>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  {t('filters.clearAll')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* States Multi-select */}
              <div>
                <h3 className="text-sm font-medium mb-3">{t('filters.statesRegions')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
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
                <h3 className="text-sm font-medium mb-3">{t('filters.availableServices')}</h3>
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

              <Button onClick={() => fetchProviders()} className="w-full">
                {t('filters.applyFilters')}
              </Button>
            </CardContent>
          </Card>
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