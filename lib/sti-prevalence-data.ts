// Mock STI prevalence data for Malaysian states (2010-2022)
// Incidence rates per 100,000 population

export const malaysianStates = [
  'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 
  'Pahang', 'Penang', 'Perak', 'Perlis', 'Sabah', 
  'Sarawak', 'Selangor', 'Terengganu', 'Kuala Lumpur', 
  'Labuan', 'Putrajaya'
];

export const stiTypes = {
  hiv: 'HIV',
  gonorrhea: 'Gonorrhea', 
  syphilis: 'Syphilis'
} as const;

export type STIType = keyof typeof stiTypes;
export type Year = 2010 | 2011 | 2012 | 2013 | 2014 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022;

// Generate realistic mock data based on actual Malaysian epidemiological patterns
const generateSTIData = () => {
  const data: Record<STIType, Record<string, Record<Year, number>>> = {
    hiv: {},
    gonorrhea: {},
    syphilis: {}
  };

  const years: Year[] = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022];

  malaysianStates.forEach(state => {
    // Base rates per 100,000 population (realistic ranges)
    const baseRates = {
      hiv: state === 'Sabah' ? 35 : state === 'Sarawak' ? 25 : state === 'Kuala Lumpur' ? 40 : 
           state === 'Selangor' ? 30 : state === 'Johor' ? 28 : 20,
      gonorrhea: state === 'Kuala Lumpur' ? 85 : state === 'Selangor' ? 75 : 
                 state === 'Penang' ? 70 : state === 'Johor' ? 65 : 45,
      syphilis: state === 'Kuala Lumpur' ? 12 : state === 'Selangor' ? 10 : 
                state === 'Sabah' ? 15 : state === 'Sarawak' ? 13 : 7
    };

    // Initialize state data
    data.hiv[state] = {} as Record<Year, number>;
    data.gonorrhea[state] = {} as Record<Year, number>;
    data.syphilis[state] = {} as Record<Year, number>;

    years.forEach((year, index) => {
      // Simulate trends over time
      const yearFactor = 1 + (Math.sin((year - 2010) * 0.5) * 0.2); // Cyclical variation
      const trendFactor = year < 2015 ? 1.1 : year > 2019 ? 0.9 : 1.0; // General trend
      const covidFactor = year >= 2020 ? 0.8 : 1.0; // COVID-19 impact
      
      // Add some deterministic variation for realism (based on state and year)
      const stateHash = state.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      const randomVariation = 0.8 + ((stateHash + year) % 100) / 250; // Deterministic "random" between 0.8-1.2

      data.hiv[state][year] = Math.round(
        baseRates.hiv * yearFactor * trendFactor * covidFactor * randomVariation
      );
      
      data.gonorrhea[state][year] = Math.round(
        baseRates.gonorrhea * yearFactor * trendFactor * covidFactor * randomVariation
      );
      
      data.syphilis[state][year] = Math.round(
        baseRates.syphilis * yearFactor * trendFactor * covidFactor * randomVariation
      );
    });
  });

  return data;
};

export const stiPrevalenceData = generateSTIData();

// Helper functions
export const getStateData = (sti: STIType, year: Year) => {
  return malaysianStates.map(state => ({
    state,
    rate: stiPrevalenceData[sti][state][year]
  }));
};

export const getMaxRate = (sti: STIType) => {
  let max = 0;
  malaysianStates.forEach(state => {
    const years: Year[] = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022];
    years.forEach(year => {
      const rate = stiPrevalenceData[sti][state][year];
      if (rate > max) max = rate;
    });
  });
  return max;
};

export const getMinRate = (sti: STIType) => {
  let min = Infinity;
  malaysianStates.forEach(state => {
    const years: Year[] = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022];
    years.forEach(year => {
      const rate = stiPrevalenceData[sti][state][year];
      if (rate < min) min = rate;
    });
  });
  return min;
};