export const malaysianStates = [
  'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 
  'Pahang', 'Penang', 'Perak', 'Perlis', 'Sabah', 
  'Sarawak', 'Selangor', 'Terengganu', 'Kuala Lumpur', 
  'Labuan', 'Putrajaya'
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