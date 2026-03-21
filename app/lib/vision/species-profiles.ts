import type { SpeciesProfile } from './types';

export const yellowfinTuna: SpeciesProfile = {
  slug: 'yellowfin-tuna',
  name: 'Yellowfin Tuna',
  scientificName: 'Thunnus albacares',
  visionType: 'dichromat',
  evidenceLevel: 'direct-msp',
  habitat: 'pelagic',
  cones: [
    {
      name: 'Twin Cone (Blue-Green)',
      opsinClass: 'RH2',
      lambdaMax: 485,
      peakSensitivity: 0.85,
      halfBandwidth: 45,
    },
    {
      name: 'Single Cone (Violet)',
      opsinClass: 'SWS2',
      lambdaMax: 426,
      peakSensitivity: 0.35,
      halfBandwidth: 35,
    },
  ],
  rodLambdaMax: 483,
  description:
    'Dichromatic vision optimized for the blue open ocean. Highly sensitive to blue-green wavelengths (485nm), with a secondary violet channel (426nm). Effectively blind to red and orange.',
  citations: [
    {
      short: 'Loew, McFarland & Margulies (2002)',
      species: 'Thunnus albacares',
      method: 'MSP',
    },
  ],
};

export const giantTrevally: SpeciesProfile = {
  slug: 'giant-trevally',
  name: 'Giant Trevally',
  scientificName: 'Caranx ignobilis',
  visionType: 'dichromat',
  evidenceLevel: 'congeneric-msp',
  habitat: 'pelagic',
  cones: [
    {
      name: 'Twin Cone (Blue-Green)',
      opsinClass: 'RH2',
      lambdaMax: 495,
      peakSensitivity: 0.85,
      halfBandwidth: 45,
    },
    {
      name: 'Single Cone (Blue)',
      opsinClass: 'SWS2',
      lambdaMax: 430,
      peakSensitivity: 0.35,
      halfBandwidth: 35,
    },
  ],
  rodLambdaMax: 495,
  description:
    'Dichromatic vision similar to tuna but ~10nm green-shifted. Peak sensitivity at 495nm (blue-green) with a secondary blue channel (430nm). Hunts reef edges and open water — blind to red/orange.',
  citations: [
    {
      short: 'Nagloo, Hart & Collin (2016)',
      species: 'Seriola lalandi',
      method: 'MSP',
    },
    {
      short: 'Nakamura et al. (2013)',
      species: 'Thunnus orientalis',
      method: 'genomics',
    },
  ],
};

export const redSnapper: SpeciesProfile = {
  slug: 'red-snapper',
  name: 'Red Snapper',
  scientificName: 'Lutjanus campechanus',
  visionType: 'trichromat',
  evidenceLevel: 'congeneric-msp',
  habitat: 'reef',
  cones: [
    {
      name: 'Double Cone (Green)',
      opsinClass: 'RH2',
      lambdaMax: 520,
      peakSensitivity: 0.7,
      halfBandwidth: 45,
    },
    {
      name: 'Double Cone (Yellow-Green)',
      opsinClass: 'LWS',
      lambdaMax: 555,
      peakSensitivity: 0.6,
      halfBandwidth: 50,
    },
    {
      name: 'Single Cone (Blue)',
      opsinClass: 'SWS2',
      lambdaMax: 440,
      peakSensitivity: 0.3,
      halfBandwidth: 35,
    },
  ],
  rodLambdaMax: 497,
  description:
    'Trichromatic vision with three cone types spanning blue to yellow-green. Can perceive greens, yellows, and some oranges that tuna cannot see. LWS cone (555nm) enables warm-color detection at shallow depths.',
  citations: [
    {
      short: 'Lythgoe et al. (1994)',
      species: 'Lutjanus spp. (12 GBR species)',
      method: 'MSP',
    },
    {
      short: 'Hu et al. (2021)',
      species: 'Lutjanus erythropterus',
      method: 'genomics',
    },
  ],
};

export const coralGrouper: SpeciesProfile = {
  slug: 'coral-grouper',
  name: 'Coral Grouper',
  scientificName: 'Plectropomus leopardus',
  visionType: 'trichromat',
  evidenceLevel: 'genomic-inference',
  habitat: 'reef',
  cones: [
    {
      name: 'Double Cone (Green)',
      opsinClass: 'RH2',
      lambdaMax: 515,
      peakSensitivity: 0.65,
      halfBandwidth: 45,
    },
    {
      name: 'Double Cone (Yellow-Green)',
      opsinClass: 'LWS',
      lambdaMax: 555,
      peakSensitivity: 0.55,
      halfBandwidth: 50,
    },
    {
      name: 'Single Cone (Blue)',
      opsinClass: 'SWS2',
      lambdaMax: 440,
      peakSensitivity: 0.3,
      halfBandwidth: 35,
    },
  ],
  rodLambdaMax: 500,
  description:
    'Trichromatic reef ambush predator. Broad spectral sensitivity from blue (440nm) through green (515nm) to yellow-green (555nm). Adapted for low-light reef structures — contrast and flash may matter more than color at depth.',
  citations: [
    {
      short: 'Kim et al. (2015)',
      species: 'Epinephelus bruneus',
      method: 'ERG',
    },
    {
      short: 'Kim et al. (2015)',
      species: 'Epinephelus bruneus',
      method: 'genomics',
    },
    {
      short: 'Cortesi et al. (2020)',
      species: 'Epinephelidae (reef fish survey)',
      method: 'genomics',
    },
  ],
};

export const allSpecies: SpeciesProfile[] = [
  yellowfinTuna,
  giantTrevally,
  redSnapper,
  coralGrouper,
];

export const comingSoonSpecies: string[] = [
  'Mahi-Mahi',
  'Blue Marlin',
  'Wahoo',
  'Sailfish',
];
