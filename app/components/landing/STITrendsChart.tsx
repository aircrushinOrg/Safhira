"use client";

import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Card } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Check } from "lucide-react";
import { useTheme } from "next-themes";
import { stiTypes } from '@/constants/sti-prevalence';
import {useTranslations} from 'next-intl';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Set global Chart.js font defaults
ChartJS.defaults.font.family = 'var(--font-poppins), Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif';

interface DataPoint {
  year: number;
  disease: string;
  state: string;
  incidence: number;
}

interface SharedData {
  states: string[];
  diseases: string[];
  incidenceData: DataPoint[];
  years: number[];
  loading: boolean;
}

interface STITrendsChartProps {
  sharedData: SharedData;
}

export default function STITrendsChart({ sharedData }: STITrendsChartProps) {
  const t = useTranslations('Charts');
  const { theme, systemTheme } = useTheme();
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<string>("AIDS");
  const [fontFamily, setFontFamily] = useState<string>('Poppins, sans-serif');
  const [loaded, setLoaded] = useState(false);

  // Determine if we're in dark mode
  const isDarkMode = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  // Get computed font family from DOM
  useEffect(() => {
    const getFontFamily = () => {
      const element = document.createElement('div');
      element.className = 'font-sans';
      document.body.appendChild(element);
      const computedStyle = window.getComputedStyle(element);
      const computedFont = computedStyle.fontFamily;
      document.body.removeChild(element);
      setFontFamily(computedFont || 'Poppins, sans-serif');
    };

    if (typeof window !== 'undefined') {
      getFontFamily();
    }
  }, []);

  // Use shared data
  const { states, diseases, incidenceData: data, loading } = sharedData;

  // Helper function to map display names to database keys
  const getDbKeyFromDisplayName = (displayName: string): string => {
    const entry = Object.entries(stiTypes).find(([, value]) => value === displayName);
    return entry ? entry[0] : displayName;
  };

  // Helper function to map database keys to display names
  const getDisplayNameFromDbKey = (dbKey: string): string => {
    return stiTypes[dbKey as keyof typeof stiTypes] || dbKey;
  };

  // Initialize selections when shared data loads
  useEffect(() => {
    if (!loading && diseases.length > 0 && selectedDisease === "") {
      // Set the first disease using its display name
      const firstDiseaseDisplayName = getDisplayNameFromDbKey(diseases[0]);
      setSelectedDisease(firstDiseaseDisplayName);
    }
    if (!loading && !loaded && states.length > 0 && selectedStates.length === 0) {
      setLoaded(true);
      setSelectedStates([states[0]]);
    }
  }, [loading, diseases, states, selectedDisease, selectedStates.length, loaded]);

  const handleAddState = (state: string) => {
    if (!selectedStates.includes(state)) {
      setSelectedStates([...selectedStates, state]);
    }
  };

  const handleRemoveState = (stateToRemove: string) => {
    setSelectedStates(selectedStates.filter(state => state !== stateToRemove));
  };

  const handleClearAllStates = () => {
    setSelectedStates([]);
  };

  const getChartData = () => {
    if (!selectedDisease) {
      return { labels: [], datasets: [] };
    }

    // If no states selected, show empty chart with available years
    if (selectedStates.length === 0) {
      const allYears = Array.from(new Set(data.map(item => item.year))).sort();
      return {
        labels: allYears,
        datasets: []
      };
    }

    // Convert display name back to database key for filtering
    const dbDisease = getDbKeyFromDisplayName(selectedDisease);
    const filteredData = data.filter(
      item => item.disease === dbDisease && selectedStates.includes(item.state)
    );

    const years = Array.from(new Set(filteredData.map(item => item.year))).sort();
    
    // Enhanced colors that work well in both light and dark modes
    const colors = [
      '#3b82f6', // Blue
      '#ef4444', // Red  
      '#22c55e', // Green
      '#a855f7', // Purple
      '#f59e0b', // Orange
      '#ec4899', // Pink
      '#06b6d4', // Cyan
      '#84cc16', // Lime
      '#f97316', // Orange variant
      '#8b5cf6', // Violet
      '#10b981', // Emerald
      '#f43f5e', // Rose
    ];

    const datasets = selectedStates.map((state, index) => {
      const stateData = filteredData.filter(item => item.state === state);
      const yearlyData = years.map(year => {
        const yearData = stateData.find(item => item.year === year);
        return yearData ? yearData.incidence : 0;
      });

      const color = colors[index % colors.length];
      return {
        label: state,
        data: yearlyData,
        borderColor: color,
        backgroundColor: color + '20', // Add transparency
        borderWidth: 3,
        pointBackgroundColor: color,
        pointBorderColor: isDarkMode ? '#1f2937' : '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        tension: 0.4,
      };
    });

    return {
      labels: years,
      datasets,
    };
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        display: selectedStates.length > 0,
        labels: {
          color: isDarkMode ? '#e5e7eb' : '#374151',
          font: {
            size: 12,
            family: fontFamily,
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: t('trends.axis.y'),
          color: isDarkMode ? '#d1d5db' : '#4b5563',
          font: {
            size: 14,
            family: fontFamily,
          },
        },
        grid: {
          display: true,
          color: isDarkMode ? 'rgba(156, 163, 175, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          font: {
            family: fontFamily,
            size: 12,
          },
        },
      },
      x: {
        title: {
          display: true,
          text: t('trends.axis.x'),
          color: isDarkMode ? '#d1d5db' : '#4b5563',
          font: {
            size: 14,
            family: fontFamily,
          },
        },
        grid: {
          display: true,
          color: isDarkMode ? 'rgba(156, 163, 175, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          font: {
            family: fontFamily,
            size: 12,
          },
        },
      },
    },
  };


  return (
    <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
      <div className="flex flex-col mb-4 justify-center items-center">
        <h3 className="text-center text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {t('trends.title')}
        </h3>
        <p className="text-center text-gray-600 dark:text-gray-300 text-sm">
          {t('trends.subtitle')}
        </p>
      </div>
      <div className="space-y-6">
        {/* Controls Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-end">
          {/* Disease Selection */}
          <div className="flex flex-col flex-1 items-start h-full">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2 mb-3">{t('trends.selectSti')}</label>
            <Select value={selectedDisease} onValueChange={setSelectedDisease}>
              <SelectTrigger className="!h-full w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600">
                <SelectValue placeholder={t('trends.chooseDisease')} />
              </SelectTrigger>
              <SelectContent className="bg-slate-100 dark:bg-slate-700">
                {Object.entries(stiTypes)
                  .sort(([, a], [, b]) => a.localeCompare(b))
                  .map(([key, label]) => (
                    <SelectItem key={key} value={label}>
                      {label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* State Selection */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('trends.selectStates')}</label>
              <Button
                onClick={handleClearAllStates}
                size="sm"
                variant="outline"
                className="flex items-center gap-1 text-xs bg-transparent dark:border-slate-600 dark:hover:bg-slate-700 transition-all duration-200"
                disabled={selectedStates.length === 0}
              >
                {t('trends.clear')}
              </Button>
            </div>
            <Select>
              <SelectTrigger className="!h-auto w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600">
                <SelectValue placeholder={selectedStates.length === 0 ? t('trends.chooseStates') : 
                  <div className="flex flex-wrap gap-1">
                    {selectedStates.map((state) => (
                      <Badge
                        key={state}
                        variant="default"
                        className="text-xs flex items-center gap-1"
                        onClick={() => handleRemoveState(state)}
                      >
                        {state}
                      </Badge>
                    ))}
                </div>
                } />
              </SelectTrigger>
              <SelectContent className="w-full max-w-4xl bg-slate-100 dark:bg-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 max-h-64 overflow-y-auto bg-slate-100 dark:bg-slate-700">
                  {states.map((state) => {
                    const isSelected = selectedStates.includes(state);
                    return (
                      <div
                        key={state}
                        className="flex items-center space-x-2 p-2 hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
                        onClick={() => isSelected ? handleRemoveState(state) : handleAddState(state)}
                      >
                        <div className={`${isSelected ? "bg-black dark:bg-white": ""} flex items-center justify-center w-5 h-5 border border-primary rounded-sm`}>
                          {isSelected && <Check strokeWidth={3} className="text-white font-bold dark:text-slate-700" />}
                        </div>
                        <span className="text-sm truncate">{state}</span>
                      </div>
                    );
                  })}
                </div>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chart */}
        <div className="w-full">
          {selectedDisease ? (
            <div className="min-h-[480px] w-full">
              <Line data={getChartData()} options={chartOptions}/>
            </div>
          ) : (
            <div className="min-h-[480px]  flex items-center justify-center text-muted-foreground">
              {t('trends.selectPrompt')}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
