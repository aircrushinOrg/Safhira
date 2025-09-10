'use client'

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import { Play, Pause, ZoomIn, ZoomOut, LocateFixed, BadgeAlert } from 'lucide-react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { stiTypes, type STIType, type Year } from '@/constants/sti-prevalence';
import { useIsMobile } from '../ui/use-mobile';

interface SharedData {
  states: string[];
  diseases: string[];
  incidenceData: { year: number; disease: string; state: string; incidence: number }[];
  years: number[];
  loading: boolean;
}

interface STIChoroplethChartProps {
  sharedData: SharedData;
}

export function STIChoroplethChart({ sharedData }: STIChoroplethChartProps) {
  const [selectedSTI, setSelectedSTI] = useState<STIType>('hiv');
  const [selectedYear, setSelectedYear] = useState<Year>(2017);
  const [geoData, setGeoData] = useState<any>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState({ coordinates: [109.5, 4], zoom: 1 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();
  
  // Use shared data
  const { years, diseases, incidenceData: allIncidenceData, loading } = sharedData; 

  // Filter function to get incidence data by year and disease
  const getFilteredIncidenceData = (year: number, disease: string) => {
    return allIncidenceData.filter(item => 
      item.year === year && item.disease === disease
    );
  };
  
  // Initialize selections when shared data loads
  useEffect(() => {
    if (!loading && years.length > 0 && selectedYear === 2017) {
      setSelectedYear(years[0] as Year);
    }
    if (!loading && diseases.length > 0) {
      setSelectedSTI(diseases[0].toLowerCase().replace(/[^a-z0-9]/g, '') as STIType);
    }
  }, [loading, years, diseases, selectedYear]);

  // Load Malaysia GeoJSON data on mount
  useEffect(() => {
    import('@/public/landing-my-map.json')
      .then(data => {
        const geoJsonData = data.default || data;
        setGeoData(geoJsonData);
      })
      .catch(error => console.error('Error loading map data:', error));
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && years.length > 0) {
      intervalRef.current = setInterval(() => {
        setSelectedYear(prevYear => {
          const currentIndex = years.indexOf(prevYear);
          const nextIndex = (currentIndex + 1) % years.length;
          return years[nextIndex] as Year;
        });
      }, 1200); // Slower transition - 1.2s for smoother viewing
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, years]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const handleZoomIn = () => {
    setPosition(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.3, 8) // Smaller increment for smoother zoom
    }));
  };

  const handleZoomOut = () => {
    setPosition(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.3, 1) // Smaller decrement for smoother zoom
    }));
  };

  const handleRecenter = () => {
    setPosition({
      coordinates: [109.5, 4],
      zoom: 1
    });
  };

  const handleMoveEnd = (position: any) => {
    setPosition(position);
  };

  // Get current data from database instead of static data
  const selectedDiseaseFromDb = diseases.find(d => 
    d.toLowerCase().replace(/[^a-z0-9]/g, '') === selectedSTI
  ) || diseases[0] || 'HIV/AIDS';
  
  const rawCurrentData = getFilteredIncidenceData(selectedYear, selectedDiseaseFromDb);
  
  // Transform database data to match expected structure (state, rate)
  const currentData = rawCurrentData.map(item => ({
    state: item.state,
    rate: item.incidence
  }));
  
  // Calculate min/max rates from all data for the selected disease
  const allRatesForDisease = allIncidenceData
    .filter(item => item.disease === selectedDiseaseFromDb)
    .map(item => item.incidence);
  
  const maxRate = allRatesForDisease.length > 0 ? Math.max(...allRatesForDisease) : 100;
  const minRate = allRatesForDisease.length > 0 ? Math.min(...allRatesForDisease) : 0;

  const normalizeStateName = (geoJsonName: string): string => {
    return geoJsonName;
  };

  // Create a lookup map for state data
  const stateDataMap = currentData.reduce((acc, item) => {
    acc[item.state] = item.rate;
    return acc;
  }, {} as Record<string, number>);

  // Color intensity based on rate
  const getColorIntensity = (rate: number) => {
    const normalized = (rate - minRate) / (maxRate - minRate);
    return Math.max(0.2, Math.min(1, normalized));
  };

  // Get color based on STI type and intensity
  const getStateColor = (stateName: string) => {
    const rate = stateDataMap[stateName] || 0;
    const intensity = getColorIntensity(rate);
    const colors = {
      hiv: `rgba(219, 39, 119, ${intensity})`, // Pink
      gonorrhea: `rgba(37, 99, 235, ${intensity})`, // Blue  
      syphillis: `rgba(147, 51, 234, ${intensity})`, // Purple
      chancroid: `rgba(234, 88, 12, ${intensity})`, // Orange
      aids: `rgba(220, 38, 38, ${intensity})`, // Red
    };
    return colors[selectedSTI];
  };

  // Get gradient colors for legend based on selected STI
  const getLegendGradient = () => {
    const gradients = {
      hiv: 'from-pink-600/10 to-pink-600/100', // Red gradient
      gonorrhea: 'from-blue-600/10 to-blue-600/100', // Blue gradient
      syphillis: 'from-purple-600/10 to-purple-600/100', // Purple gradient
      chancroid: 'from-orange-600/10 to-orange-600/100', // Orange gradient
      aids: 'from-red-600/10 to-red-600/100', // Red gradient
    };
    return gradients[selectedSTI];
  };


  return (
    <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
      <div className="flex flex-col mb-4 justify-center items-center">
        <h3 className="text-center text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          STI Prevalence in Malaysia
        </h3>
        <p className="text-center text-gray-600 dark:text-gray-300 text-sm">
          Incidence rates per 100,000 population by state and year
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-12 mb-2">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select STI
          </label>
          <Select 
            value={selectedSTI} 
            onValueChange={(value) => setSelectedSTI(value as STIType)}>
            <SelectTrigger className="flex bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="flex bg-slate-100 dark:bg-slate-700">
              {Object.entries(stiTypes)
                .sort(([, a], [, b]) => a.localeCompare(b))
                .map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Year: {selectedYear}
            </label>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                onClick={togglePlayback}
                size="sm"
                variant="outline"
                className="flex items-center gap-1 text-xs bg-transparent dark:border-slate-600 dark:hover:bg-slate-700 transition-all duration-200"
              >
                <motion.div
                  key={isPlaying ? 'pause' : 'play'}
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </motion.div>
                <motion.span
                  key={isPlaying ? 'pause-text' : 'play-text'}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {isPlaying ? 'Pause' : 'Play'}
                </motion.span>
              </Button>
            </motion.div>
          </div>
          <Slider
            value={[selectedYear]}
            onValueChange={(value) => {
              setSelectedYear(value[0] as Year);
              if (isPlaying) setIsPlaying(false); // Stop playing when manually changing
            }}
            min={years.length > 0 ? Math.min(...years) : 2017}
            max={years.length > 0 ? Math.max(...years) : 2022}
            step={1}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{years.length > 0 ? Math.min(...years) : 2017}</span>
            <span>{years.length > 0 ? Math.max(...years) : 2022}</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-2">
        <div className="flex flex-col items-end justify-end text-sm text-gray-600 dark:text-gray-400 gap-2 md:gap-2">
          <span className="text-sm text-end">Incidence Rate (per 100,000 people) across All Years</span>
          <div className="flex items-center gap-2">
            <span>{minRate}</span>
            <div className={`w-40 md:w-60 h-3 bg-gradient-to-r ${getLegendGradient()} rounded`}></div>
            <span>{maxRate}</span>
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg relative">
        {/* Zoom Controls */}
        <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              onClick={handleZoomIn}
              size="sm"
              variant="outline"
              className="p-2 bg-white dark:bg-gray-800 dark:border-slate-600 dark:hover:bg-slate-700 shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={position.zoom >= 8}
            >
              <ZoomIn size={16} />
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              onClick={handleZoomOut}
              size="sm"
              variant="outline"
              className="p-2 bg-white dark:bg-gray-800 dark:border-slate-600 dark:hover:bg-slate-700 shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={position.zoom <= 1}
            >
              <ZoomOut size={16} />
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              onClick={handleRecenter}
              size="sm"
              variant="outline"
              className="p-2 bg-white dark:bg-gray-800 dark:border-slate-600 dark:hover:bg-slate-700 shadow-lg hover:shadow-xl transition-all duration-200"
              title="Reset view to center"
            >
              <LocateFixed size={16} />
            </Button>
          </motion.div>
        </div>

        {geoData ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 2200,
                center: [109.5, 4]
              }}
              width={800}
              height={isMobile ? 800: 300}
              className="w-full h-auto"
            >
              <ZoomableGroup
                zoom={position.zoom}
                center={position.coordinates as [number, number]}
                onMoveEnd={handleMoveEnd}
              >
                <Geographies geography={geoData}>
                  {({ geographies }: { geographies: any[] }) =>
                    geographies.map((geo: any) => {
                      const geoJsonStateName = geo.properties.name;
                      const stateName = normalizeStateName(geoJsonStateName);
                      
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={getStateColor(stateName)}
                          stroke="#FFFFFF"
                          strokeWidth={0.8}
                          onMouseEnter={(event) => {
                            setHoveredState(geoJsonStateName);
                            setMousePosition({ x: event.clientX, y: event.clientY });
                          }}
                          onMouseMove={(event) => {
                            setMousePosition({ x: event.clientX, y: event.clientY });
                          }}
                          onMouseLeave={() => setHoveredState(null)}
                          style={{
                            default: {
                              outline: "none",
                            },
                            hover: {
                              fill: getStateColor(stateName),
                              outline: "none",
                              filter: "brightness(2.0)",
                              cursor: "pointer"
                            },
                            pressed: {
                              outline: "none",
                            },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>

            {/* Tooltip for hovered state */}
            {hoveredState && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed bg-black text-white text-sm rounded-lg py-2 px-3 pointer-events-none shadow-lg z-50"
                style={{
                  left: mousePosition.x + 10,
                  top: mousePosition.y - 10,
                  transform: 'translate(0, -100%)'
                }}
              >
                <div className="font-semibold">{hoveredState}</div>
                <div>{stiTypes[selectedSTI] || selectedDiseaseFromDb}: {stateDataMap[normalizeStateName(hoveredState)] || 0}/100k</div>
                <div className="text-gray-300">Year: {selectedYear}</div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading map...</p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="flex justify-around gap-4 mt-4">
        <div className="text-center">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Highest Rate
          </div>
          <div className="text-2xl md:text-3xl font-bold text-rose-500 dark:text-rose-400 mt-2">
            {currentData.length > 0 ? Math.max(...currentData.map(d => d.rate)) : 0}
          </div>
            {currentData.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-500">
                ({currentData.find(d => d.rate === Math.max(...currentData.map(r => r.rate)))?.state})
              </div>
            )}
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Lowest Rate
          </div>
          <div className="text-2xl md:text-3xl font-bold text-teal-500 dark:text-teal-400 mt-2">
            {currentData.length > 0 ? Math.min(...currentData.map(d => d.rate)) : 0}
          </div>
          {currentData.length > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-500">
              ({currentData.find(d => d.rate === Math.min(...currentData.map(r => r.rate)))?.state})
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600 dark:text-gray-400">Average Rate</div>
          <div className="text-2xl md:text-3xl font-bold text-purple-500 dark:text-purple-400 mt-2">
            {currentData.length > 0 ? Math.round(currentData.reduce((sum, d) => sum + d.rate, 0) / currentData.length) : 0}
          </div>
        </div>
      </div>
      
      <div className="flex w-full justify-center mt-6">
        <Card className="p-6 bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 h-full">
          <div className="flex h-full">
            <div className="flex items-start space-x-3">
              <BadgeAlert className="text-teal-500 flex-shrink-0" size={20} />
              <p className="text-teal-700 dark:text-teal-300 text-sm sm:text-base leading-relaxed flex-grow">
                These numbers aren&apos;t just statistics - they represent real people who deserve support and accurate information. This is exactly why safe, stigma-free conversations matter.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Card>
  );
}