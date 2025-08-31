'use client'

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Play, Pause } from 'lucide-react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { 
  getStateData, 
  getMaxRate, 
  getMinRate, 
  stiTypes, 
  type STIType, 
  type Year 
} from '@/lib/sti-prevalence-data';

export function STIChoroplethChart() {
  const [selectedSTI, setSelectedSTI] = useState<STIType>('hiv');
  const [selectedYear, setSelectedYear] = useState<Year>(2010);
  const [geoData, setGeoData] = useState<any>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load Malaysia GeoJSON data
  useEffect(() => {
    import('@/app/data/my.json')
      .then(data => {
        const geoJsonData = data.default || data;
        setGeoData(geoJsonData);
      })
      .catch(error => console.error('Error loading map data:', error));
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setSelectedYear(prevYear => {
          const years: Year[] = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022];
          const currentIndex = years.indexOf(prevYear);
          const nextIndex = (currentIndex + 1) % years.length;
          return years[nextIndex];
        });
      }, 800); // Change year every 800ms
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
  }, [isPlaying]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const currentData = getStateData(selectedSTI, selectedYear);
  const maxRate = getMaxRate(selectedSTI);
  const minRate = getMinRate(selectedSTI);

  // Map GeoJSON state names to our data state names
  const stateNameMapping: Record<string, string> = {
    'Pulau Pinang': 'Penang',
    // All other names match exactly
  };

  const normalizeStateName = (geoJsonName: string): string => {
    return stateNameMapping[geoJsonName] || geoJsonName;
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
      hiv: `rgba(220, 38, 38, ${intensity})`, // Red
      gonorrhea: `rgba(37, 99, 235, ${intensity})`, // Blue  
      syphilis: `rgba(147, 51, 234, ${intensity})` // Purple
    };
    return colors[selectedSTI];
  };

  // Get gradient colors for legend based on selected STI
  const getLegendGradient = () => {
    const gradients = {
      hiv: 'from-red-600/10 to-red-600/100', // Red gradient
      gonorrhea: 'from-blue-600/10 to-blue-600/100', // Blue gradient
      syphilis: 'from-purple-600/10 to-purple-600/100' // Purple gradient
    };
    return gradients[selectedSTI];
  };


  return (
    <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
      <div className="flex flex-col mb-4 justify-center items-center">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          STI Prevalence in Malaysia
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
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
            <SelectTrigger className="flex bg-slate-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="flex bg-slate-100 dark:bg-gray-700">
              {Object.entries(stiTypes).map(([key, label]) => (
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
            <Button
              onClick={togglePlayback}
              size="sm"
              variant="outline"
              className="flex items-center gap-1 text-xs"
            >
              {isPlaying ? (
                <>
                  <Pause size={14} />
                  Pause
                </>
              ) : (
                <>
                  <Play size={14} />
                  Play
                </>
              )}
            </Button>
          </div>
          <Slider
            value={[selectedYear]}
            onValueChange={(value) => {
              setSelectedYear(value[0] as Year);
              if (isPlaying) setIsPlaying(false); // Stop playing when manually changing
            }}
            min={2010}
            max={2022}
            step={1}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>2010</span>
            <span>2022</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-2">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Incidence Rate (per 100,000 people) across All Years</span>
          <div className="flex items-center gap-2">
            <span>{minRate}</span>
            <div className={`w-60 h-3 bg-gradient-to-r ${getLegendGradient()} rounded`}></div>
            <span>{maxRate}</span>
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="bg-blue-50 dark:bg-blue-950/50 p-4 rounded-lg relative">
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
                center: [109, 4]
              }}
              width={800}
              height={300}
              className="w-full h-auto"
            >
              <ZoomableGroup>
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
                <div>{stiTypes[selectedSTI]}: {stateDataMap[normalizeStateName(hoveredState)] || 0}/100k</div>
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
      <div className="flex justify-around gap-4">
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-rose-500 dark:text-rose-400">
            {Math.max(...currentData.map(d => d.rate))}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Highest Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-teal-500 dark:text-teal-400">
            {Math.min(...currentData.map(d => d.rate))}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Lowest Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl md:text-3xl font-bold text-purple-500 dark:text-purple-400">
            {Math.round(currentData.reduce((sum, d) => sum + d.rate, 0) / currentData.length)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Average Rate</div>
        </div>
      </div>
    </Card>
  );
}