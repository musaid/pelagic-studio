import type { SpeciesProfile, ContrastStats } from './types';
import {
  rgbToHsl,
  hueToWavelength,
  wavelengthToCategory,
} from './color-science';
import { depthTransmittance } from './depth-filter';

/**
 * Govardovskii et al. (2000) visual pigment nomogram template.
 * Returns the relative sensitivity of a visual pigment with peak at lambdaMax
 * to a photon of wavelength lambda.
 */
function govardovskiiResponse(lambda: number, lambdaMax: number): number {
  const x = lambdaMax / lambda;
  const a = 0.8795 + 0.0459 * Math.exp(-((lambdaMax - 300) ** 2) / 11940);
  const A = 69.7;
  const B = 28;
  const b = 0.922;
  const C = -14.9;
  const c = 1.104;
  const D = 0.674;

  const response =
    1 /
    (Math.exp(A * (a - x)) + Math.exp(B * (b - x)) + Math.exp(C * (c - x)) + D);

  return Math.max(0, Math.min(1, response));
}

/**
 * Detect if a pixel is metallic/chrome: high lightness, low saturation.
 */
function isMetallic(h: number, s: number, l: number): boolean {
  return l > 0.65 && s < 0.25;
}

interface ConeResponse {
  response: number;
  weight: number;
  lambdaMax: number;
}

/**
 * Map cone responses to displayable RGB.
 * Dichromats: blue-dominated output (preserves existing tuna rendering).
 * Trichromats: broader palette reflecting the LWS cone contribution.
 */
function mapConeResponseToRgb(
  coneResponses: ConeResponse[],
  perceivedBrightness: number,
  visionType: 'dichromat' | 'trichromat',
): [number, number, number] {
  const sorted = [...coneResponses].sort((a, b) => a.lambdaMax - b.lambdaMax);

  if (visionType === 'dichromat' || sorted.length <= 2) {
    // Dichromat: exact same coefficients as the original tuna-only path
    const violetCone = sorted[0];
    const blueGreenCone = sorted[sorted.length - 1];

    const blueGreenResponse = blueGreenCone.response * blueGreenCone.weight;
    const violetResponse = violetCone.response * violetCone.weight;

    const blueChannel = Math.round(
      perceivedBrightness * 255 * 0.9 + blueGreenResponse * 30,
    );
    const greenChannel = Math.round(
      blueGreenResponse * perceivedBrightness * 180,
    );
    const redChannel = Math.round(violetResponse * perceivedBrightness * 80);

    return [
      Math.min(255, redChannel),
      Math.min(255, greenChannel),
      Math.min(255, blueChannel),
    ];
  }

  // Trichromat: 3 cones sorted [SWS2, RH2, LWS]
  const swCone = sorted[0]; // shortest wavelength — blue
  const mwCone = sorted[1]; // mid wavelength — green
  const lwCone = sorted[2]; // longest wavelength — yellow-green

  const swResponse = swCone.response * swCone.weight;
  const mwResponse = mwCone.response * mwCone.weight;
  const lwResponse = lwCone.response * lwCone.weight;

  // LWS cone adds meaningful warm-color perception
  const blueChannel = Math.round(
    perceivedBrightness * 0.7 * 255 + swResponse * 60,
  );
  const greenChannel = Math.round(
    perceivedBrightness * 80 + mwResponse * 180 + lwResponse * 40,
  );
  const redChannel = Math.round(
    lwResponse * perceivedBrightness * 160 + mwResponse * 30,
  );

  return [
    Math.min(255, redChannel),
    Math.min(255, greenChannel),
    Math.min(255, blueChannel),
  ];
}

/**
 * Compute species-specific visibility weights for each color category.
 * Uses Govardovskii nomogram at representative wavelengths to derive
 * how sensitive the species is to each color band.
 */
function computeVisibilityWeights(species: SpeciesProfile): {
  blueViolet: number;
  green: number;
  redOrange: number;
  metallic: number;
  neutral: number;
} {
  // Representative wavelengths for each color category
  const blueVioletWl = 450;
  const greenWl = 530;
  const redOrangeWl = 620;

  // Compute max weighted cone response at each wavelength
  const responseAt = (wl: number) => {
    let maxResponse = 0;
    for (const cone of species.cones) {
      const r = govardovskiiResponse(wl, cone.lambdaMax) * cone.peakSensitivity;
      maxResponse = Math.max(maxResponse, r);
    }
    return maxResponse;
  };

  return {
    blueViolet: Math.min(1, responseAt(blueVioletWl)),
    green: Math.min(1, responseAt(greenWl)),
    redOrange: Math.min(1, responseAt(redOrangeWl)),
    metallic: 0.85, // broadband reflector — always high
    neutral: 0.5, // broadband — moderate
  };
}

/**
 * Process a single pixel through the species vision model at a given depth.
 * Returns [r, g, b] output.
 */
function processPixel(
  r: number,
  g: number,
  b: number,
  species: SpeciesProfile,
  depth: number,
): [number, number, number] {
  const [h, s, l] = rgbToHsl(r, g, b);

  // Special case: pure black
  if (l < 0.02) return [0, 0, 0];

  // Special case: metallic/chrome finishes — reflect across all wavelengths
  if (isMetallic(h, s, l)) {
    const brightness = Math.round(l * 220);
    return [brightness, brightness, Math.min(255, brightness + 20)];
  }

  // Get dominant wavelength from hue
  const dominantWavelength = hueToWavelength(h);

  // For achromatic/neutral pixels (very low saturation), treat as broadband
  if (s < 0.08) {
    const blueTint = Math.round(l * 180);
    const brightness = Math.round(l * 150);
    return [brightness, brightness, blueTint];
  }

  // Apply depth attenuation to the incoming light's wavelength
  const depthFactor = depthTransmittance(dominantWavelength, depth);
  const attenuatedLightness = l * depthFactor;

  // Calculate cone responses using Govardovskii nomogram
  let totalWeightedResponse = 0;
  const coneResponses: ConeResponse[] = [];

  for (const cone of species.cones) {
    const raw = govardovskiiResponse(dominantWavelength, cone.lambdaMax);
    coneResponses.push({
      response: raw,
      weight: cone.peakSensitivity,
      lambdaMax: cone.lambdaMax,
    });
    totalWeightedResponse += raw * cone.peakSensitivity;
  }

  const maxPossibleResponse = species.cones.reduce(
    (sum, c) => sum + c.peakSensitivity,
    0,
  );
  const normalizedResponse = Math.min(
    1,
    totalWeightedResponse / maxPossibleResponse,
  );

  const perceivedBrightness = normalizedResponse * attenuatedLightness;

  return mapConeResponseToRgb(
    coneResponses,
    perceivedBrightness,
    species.visionType,
  );
}

/**
 * Process an entire ImageData buffer through the species vision model.
 * Returns processed ImageData and contrast statistics.
 * Calls progressCallback with 0-100 every ~5% of rows processed.
 */
export function processImageData(
  imageData: ImageData,
  species: SpeciesProfile,
  depth: number,
  progressCallback?: (percent: number) => void,
): { imageData: ImageData; stats: ContrastStats } {
  const { width, height, data } = imageData;
  const outputData = new Uint8ClampedArray(data.length);

  const colorCounts = {
    blueViolet: 0,
    green: 0,
    redOrange: 0,
    metallic: 0,
    neutral: 0,
  };

  let totalOriginalBrightness = 0;
  let totalProcessedBrightness = 0;
  let wavelengthSum = 0;
  let wavelengthCount = 0;

  const progressInterval = Math.max(1, Math.floor(height / 20));

  for (let y = 0; y < height; y++) {
    if (progressCallback && y % progressInterval === 0) {
      progressCallback(Math.round((y / height) * 95));
    }

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      const [outR, outG, outB] = processPixel(r, g, b, species, depth);

      outputData[idx] = outR;
      outputData[idx + 1] = outG;
      outputData[idx + 2] = outB;
      outputData[idx + 3] = a;

      // Accumulate stats
      const origL = (r + g + b) / 3;
      const processedL = (outR + outG + outB) / 3;
      totalOriginalBrightness += origL;
      totalProcessedBrightness += processedL;

      // Color category classification
      const [h, s, l] = rgbToHsl(r, g, b);
      if (l < 0.02) {
        // skip near-black
      } else if (isMetallic(h, s, l)) {
        colorCounts.metallic++;
      } else if (s < 0.08) {
        colorCounts.neutral++;
      } else {
        const wl = hueToWavelength(h);
        wavelengthSum += wl;
        wavelengthCount++;
        const cat = wavelengthToCategory(wl);
        colorCounts[cat]++;
      }
    }
  }

  progressCallback?.(100);

  const outputImageData = new ImageData(outputData, width, height);

  const categorizedPixels =
    colorCounts.blueViolet +
    colorCounts.green +
    colorCounts.redOrange +
    colorCounts.metallic +
    colorCounts.neutral;

  const safeDiv = (n: number) =>
    categorizedPixels > 0 ? Math.round((n / categorizedPixels) * 100) : 0;

  const pctBlueViolet = safeDiv(colorCounts.blueViolet);
  const pctGreen = safeDiv(colorCounts.green);
  const pctRedOrange = safeDiv(colorCounts.redOrange);
  const pctMetallic = safeDiv(colorCounts.metallic);
  const pctNeutral = safeDiv(colorCounts.neutral);

  const dominantWavelength =
    wavelengthCount > 0 ? Math.round(wavelengthSum / wavelengthCount) : 485;

  const brightnessRetention =
    totalOriginalBrightness > 0
      ? Math.round((totalProcessedBrightness / totalOriginalBrightness) * 100)
      : 0;

  // Species-adaptive visibility scoring
  const weights = computeVisibilityWeights(species);
  const visibilityScore = Math.min(
    100,
    Math.round(
      pctBlueViolet * weights.blueViolet +
        pctGreen * weights.green +
        pctRedOrange * weights.redOrange +
        pctMetallic * weights.metallic +
        pctNeutral * weights.neutral,
    ),
  );

  const recommendations = buildRecommendations(
    species,
    weights,
    pctBlueViolet,
    pctGreen,
    pctRedOrange,
    pctMetallic,
    pctNeutral,
    depth,
    visibilityScore,
  );

  return {
    imageData: outputImageData,
    stats: {
      dominantWavelength,
      visibilityScore,
      brightnessRetention,
      colorCategories: {
        blueViolet: pctBlueViolet,
        green: pctGreen,
        redOrange: pctRedOrange,
        metallic: pctMetallic,
        neutral: pctNeutral,
      },
      recommendations,
    },
  };
}

function buildRecommendations(
  species: SpeciesProfile,
  weights: ReturnType<typeof computeVisibilityWeights>,
  pctBlue: number,
  pctGreen: number,
  pctRedOrange: number,
  pctMetallic: number,
  pctNeutral: number,
  depth: number,
  visibilityScore: number,
): string[] {
  const recs: string[] = [];
  const canSeeRed = weights.redOrange > 0.2;
  const canSeeGreen = weights.green > 0.5;

  if (pctBlue > 20) {
    recs.push(
      'Strong blue-green contrast — highly visible in the 460-500nm range',
    );
  }
  if (pctMetallic > 10) {
    recs.push(
      'Metallic flash preserved — chrome reflects across the full spectrum',
    );
  }
  if (pctGreen > 20) {
    if (canSeeGreen) {
      recs.push(
        `Green tones well within ${species.name} sensitivity — strong contrast`,
      );
    } else {
      recs.push(
        'Green tones partially visible — some contrast retained at depth',
      );
    }
  }
  if (pctRedOrange > 20) {
    if (canSeeRed) {
      if (depth > 15) {
        recs.push(
          `Red/orange visible to ${species.name} at shallow depths but attenuated by water below ~15m`,
        );
      } else {
        recs.push(
          `Red/orange visible to ${species.name} — LWS cone sensitivity at shallow depth`,
        );
      }
    } else {
      const depthNote = depth > 10 ? `below ${depth}m` : 'below 10m';
      recs.push(
        `Red/orange elements appear black ${depthNote} — effectively invisible`,
      );
    }
  }
  if (pctRedOrange > 40 && !canSeeRed) {
    recs.push(
      'Heavy red/orange pigment — consider a blue or silver alternative for depth',
    );
  }
  if (depth > 50 && pctGreen > 15) {
    recs.push('Green contrast diminishes significantly past 50m');
  }
  if (depth > 100) {
    recs.push(
      'At 100m+ only blue-violet wavelengths penetrate — lure silhouette dominates',
    );
  }
  if (visibilityScore < 30) {
    recs.push(
      `Low overall visibility — this color scheme is poorly matched to ${species.name} vision`,
    );
  } else if (visibilityScore > 70) {
    recs.push(
      `High visibility score — this lure is well-matched to ${species.name} visual sensitivity`,
    );
  }
  if (pctNeutral > 30) {
    recs.push(
      `Neutral/white areas visible as grey-blue through ${species.name} eyes`,
    );
  }

  return recs;
}
