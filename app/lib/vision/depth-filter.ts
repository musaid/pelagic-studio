import type { WavelengthAttenuation } from "./types";

/**
 * Diffuse attenuation coefficients Kd (per meter) for Jerlov Type I (clear open ocean) water.
 * Source: Jerlov (1976), adapted from oceanographic references.
 * I(d) = I(0) * exp(-Kd * d)
 */
export const jerlovTypeI: WavelengthAttenuation[] = [
  { wavelengthRange: [380, 420], attenuationCoeff: 0.040 }, // UV-Violet: moderate
  { wavelengthRange: [420, 460], attenuationCoeff: 0.025 }, // Violet-Blue: low (most penetrating)
  { wavelengthRange: [460, 500], attenuationCoeff: 0.020 }, // Blue: lowest attenuation
  { wavelengthRange: [500, 540], attenuationCoeff: 0.030 }, // Blue-Green: low
  { wavelengthRange: [540, 580], attenuationCoeff: 0.065 }, // Green-Yellow: moderate
  { wavelengthRange: [580, 620], attenuationCoeff: 0.130 }, // Yellow-Orange: high
  { wavelengthRange: [620, 660], attenuationCoeff: 0.290 }, // Orange-Red: very high
  { wavelengthRange: [660, 700], attenuationCoeff: 0.430 }, // Red: extreme
];

/**
 * Get the attenuation coefficient for a given wavelength.
 */
function getAttenuationCoeff(wavelength: number): number {
  for (const band of jerlovTypeI) {
    const [low, high] = band.wavelengthRange;
    if (wavelength >= low && wavelength < high) {
      return band.attenuationCoeff;
    }
  }
  // Outside visible range — use boundary values
  if (wavelength < 380) return jerlovTypeI[0].attenuationCoeff;
  return jerlovTypeI[jerlovTypeI.length - 1].attenuationCoeff;
}

/**
 * Calculate the fraction of surface light remaining at a given depth for a wavelength.
 * Returns a value 0-1.
 */
export function depthTransmittance(wavelength: number, depth: number): number {
  if (depth <= 0) return 1.0;
  const kd = getAttenuationCoeff(wavelength);
  return Math.exp(-kd * depth);
}
