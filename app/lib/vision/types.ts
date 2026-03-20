export interface ConeType {
  name: string;
  lambdaMax: number; // Peak sensitivity wavelength in nm
  peakSensitivity: number; // Relative weight (0-1) in visual system
  halfBandwidth: number; // nm, approximate half-max bandwidth
}

export interface SpeciesProfile {
  slug: string;
  name: string;
  scientificName: string;
  cones: ConeType[];
  rodLambdaMax: number;
  description: string;
  citation: string;
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
  type: "process";
  imageData: ImageData;
  species: SpeciesProfile;
  depth: number;
}

export interface WorkerResultMessage {
  type: "result";
  imageData: ImageData;
  stats: ContrastStats;
}

export interface WorkerProgressMessage {
  type: "progress";
  percent: number;
}

export type WorkerMessage =
  | WorkerProcessMessage
  | WorkerResultMessage
  | WorkerProgressMessage;
