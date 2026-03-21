import type { SpeciesProfile } from './types';

export const yellowfinTuna: SpeciesProfile = {
  slug: 'yellowfin-tuna',
  name: 'Yellowfin Tuna',
  scientificName: 'Thunnus albacares',
  cones: [
    {
      name: 'Twin Cone (Blue-Green)',
      lambdaMax: 485,
      peakSensitivity: 0.85, // Dominant channel
      halfBandwidth: 45,
    },
    {
      name: 'Single Cone (Violet)',
      lambdaMax: 426,
      peakSensitivity: 0.35, // Secondary channel
      halfBandwidth: 35,
    },
  ],
  rodLambdaMax: 483,
  description:
    'Dichromatic vision optimized for the blue open ocean. Highly sensitive to blue-green wavelengths (485nm), with a secondary violet channel (426nm). Effectively blind to red and orange.',
  citation: 'Loew, McFarland & Margulies (2002)',
};

export const allSpecies: SpeciesProfile[] = [yellowfinTuna];

export const comingSoonSpecies: string[] = [
  'Mahi-Mahi',
  'Blue Marlin',
  'Wahoo',
  'Sailfish',
];
