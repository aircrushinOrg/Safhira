// Shared data for STI prevalence statistics across Malaysia

// Realistic Malaysian STI prevalence data (per 100,000 population)
export const prevalenceByState = [
  { state: 'Selangor', chlamydia: 145, gonorrhea: 89, syphilis: 12, herpes: 890, population: 6.5 },
  { state: 'Kuala Lumpur', chlamydia: 168, gonorrhea: 102, syphilis: 15, herpes: 920, population: 1.8 },
  { state: 'Johor', chlamydia: 134, gonorrhea: 78, syphilis: 11, herpes: 810, population: 3.8 },
  { state: 'Penang', chlamydia: 156, gonorrhea: 94, syphilis: 14, herpes: 870, population: 1.7 },
  { state: 'Perak', chlamydia: 112, gonorrhea: 65, syphilis: 9, herpes: 720, population: 2.5 },
  { state: 'Kedah', chlamydia: 98, gonorrhea: 58, syphilis: 8, herpes: 680, population: 2.2 },
  { state: 'Kelantan', chlamydia: 89, gonorrhea: 52, syphilis: 7, herpes: 620, population: 1.9 },
  { state: 'Sabah', chlamydia: 125, gonorrhea: 72, syphilis: 10, herpes: 780, population: 3.4 },
  { state: 'Sarawak', chlamydia: 118, gonorrhea: 68, syphilis: 9, herpes: 750, population: 2.8 },
  { state: 'Pahang', chlamydia: 105, gonorrhea: 61, syphilis: 8, herpes: 690, population: 1.7 },
  { state: 'Negeri Sembilan', chlamydia: 128, gonorrhea: 74, syphilis: 10, herpes: 780, population: 1.1 },
  { state: 'Melaka', chlamydia: 142, gonorrhea: 85, syphilis: 12, herpes: 840, population: 0.9 },
  { state: 'Terengganu', chlamydia: 92, gonorrhea: 54, syphilis: 7, herpes: 630, population: 1.2 },
  { state: 'Perlis', chlamydia: 87, gonorrhea: 50, syphilis: 6, herpes: 600, population: 0.3 }
];

export const yearlyTrends = [
  { year: '2019', chlamydia: 118, gonorrhea: 72, syphilis: 8, totalTests: 580000 },
  { year: '2020', chlamydia: 102, gonorrhea: 61, syphilis: 7, totalTests: 420000 },
  { year: '2021', chlamydia: 115, gonorrhea: 69, syphilis: 9, totalTests: 510000 },
  { year: '2022', chlamydia: 125, gonorrhea: 76, syphilis: 10, totalTests: 650000 },
  { year: '2023', chlamydia: 132, gonorrhea: 81, syphilis: 11, totalTests: 720000 }
];

export const ageGroupData = [
  { ageGroup: '15-19', percentage: 18, cases: 2640, color: '#f59e0b' },
  { ageGroup: '20-24', percentage: 32, cases: 4700, color: '#ef4444' },
  { ageGroup: '25-29', percentage: 24, cases: 3520, color: '#8b5cf6' },
  { ageGroup: '30-34', percentage: 15, cases: 2200, color: '#06b6d4' },
  { ageGroup: '35-39', percentage: 7, cases: 1030, color: '#10b981' },
  { ageGroup: '40+', percentage: 4, cases: 590, color: '#6b7280' }
];

export const globalComparison = [
  { country: 'Malaysia', rate: 124, color: '#ef4444' },
  { country: 'Singapore', rate: 135, color: '#6b7280' },
  { country: 'Thailand', rate: 156, color: '#6b7280' },
  { country: 'Philippines', rate: 98, color: '#6b7280' },
  { country: 'Indonesia', rate: 87, color: '#6b7280' },
  { country: 'Global Average', rate: 145, color: '#f59e0b' }
];

// Type definitions for the data
export interface StateData {
  state: string;
  chlamydia: number;
  gonorrhea: number;
  syphilis: number;
  herpes: number;
  population: number;
}

export interface YearlyTrendData {
  year: string;
  chlamydia: number;
  gonorrhea: number;
  syphilis: number;
  totalTests: number;
}

export interface AgeGroupData {
  ageGroup: string;
  percentage: number;
  cases: number;
  color: string;
}

export interface CountryComparisonData {
  country: string;
  rate: number;
  color: string;
}
