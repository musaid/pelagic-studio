export type OpsinClass = 'SWS1' | 'SWS2' | 'RH2' | 'LWS';
export type VisionType = 'dichromat' | 'trichromat';
export type EvidenceLevel =
  | 'direct-msp'
  | 'congeneric-msp'
  | 'genomic-inference';
export type Habitat = 'pelagic' | 'reef' | 'demersal';

export interface Citation {
  short: string;
  species: string;
  method: 'MSP' | 'ERG' | 'genomics';
}

export interface ConeType {
  name: string;
  opsinClass: OpsinClass;
  lambdaMax: number; // Peak sensitivity wavelength in nm
  peakSensitivity: number; // Relative weight (0-1) in visual system
  halfBandwidth: number; // nm, approximate half-max bandwidth
}

export interface SpeciesProfile {
  slug: string;
  name: string;
  scientificName: string;
  visionType: VisionType;
  evidenceLevel: EvidenceLevel;
  habitat: Habitat;
  cones: ConeType[];
  rodLambdaMax: number;
  description: string;
  citations: Citation[];
}

export interface WavelengthAttenuation {
  wavelengthRange: [number, number]; // nm
  attenuationCoeff: number; // per meter (Kd)
}

export interface DepthAttenuation {
  depth: number; // meters
  coefficients: WavelengthAttenuation[];
}

export interface ContrastStats {
  dominantWavelength: number; // estimated dominant wavelength of the lure
  visibilityScore: number; // 0-100
  brightnessRetention: number; // 0-100, % of brightness preserved
  colorCategories: {
    blueViolet: number; // % of pixels
    green: number;
    redOrange: number;
    metallic: number;
    neutral: number;
  };
  recommendations: string[];
}

export interface WorkerProcessMessage {
  type: 'process';
  imageData: ImageData;
  species: SpeciesProfile;
  depth: number;
}

export interface WorkerResultMessage {
  type: 'result';
  imageData: ImageData;
  stats: ContrastStats;
}

export interface WorkerProgressMessage {
  type: 'progress';
  percent: number;
}

export type WorkerMessage =
  | WorkerProcessMessage
  | WorkerResultMessage
  | WorkerProgressMessage;
