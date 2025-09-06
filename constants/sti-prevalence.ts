export const malaysianStates = [
  'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 
  'Pahang', 'Pulau Pinang', 'Perak', 'Perlis', 'Sabah', 
  'Sarawak', 'Selangor', 'Terengganu', 'W.P. Kuala Lumpur', 
  'W.P. Labuan', 'Putrajaya'
];

export const stiTypes = {
  hiv: 'HIV',
  gonorrhea: 'Gonorrhea', 
  syphillis: 'Syphilis',
  aids: 'AIDS', 
  chancroid: 'Chancroid',
};

export type STIType = keyof typeof stiTypes;

export type Year = 2017 | 2018 | 2019 | 2020 | 2021 | 2022;