import type { SpeciesProfile, ContrastStats } from "./types";
import {
  rgbToHsl,
  hslToRgb,
  hueToWavelength,
  wavelengthToCategory,
} from "./color-science";
import { depthTransmittance } from "./depth-filter";

/**
 * Govardovskii et al. (2000) visual pigment nomogram template.
 * Returns the relative sensitivity of a visual pigment with peak at lambdaMax
 * to a photon of wavelength lambda.
 *
 * S(λ) = 1 / { exp[A*(a - lambdaMax/λ)] + exp[B*(b - lambdaMax/λ)] + exp[C*(c - lambdaMax/λ)] + D }
 */
function govardovskiiResponse(lambda: number, lambdaMax: number): number {
  const x = lambdaMax / lambda;
  const a =
    0.8795 + 0.0459 * Math.exp(-((lambdaMax - 300) ** 2) / 11940);
  const A = 69.7;
  const B = 28;
  const b = 0.922;
  const C = -14.9;
  const c = 1.104;
  const D = 0.674;

  const response =
    1 /
    (Math.exp(A * (a - x)) +
      Math.exp(B * (b - x)) +
      Math.exp(C * (c - x)) +
      D);

  return Math.max(0, Math.min(1, response));
}

/**
 * Detect if a pixel is metallic/chrome: high lightness, low saturation.
 */
function isMetallic(h: number, s: number, l: number): boolean {
  return l > 0.65 && s < 0.25;
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
  depth: number
): [number, number, number] {
  const [h, s, l] = rgbToHsl(r, g, b);

  // Special case: pure black
  if (l < 0.02) return [0, 0, 0];

  // Special case: metallic/chrome finishes — reflect across all wavelengths
  if (isMetallic(h, s, l)) {
    // High-brightness blue-white (fish sees bright flash)
    const brightness = Math.round(l * 220);
    return [brightness, brightness, Math.min(255, brightness + 20)];
  }

  // Get dominant wavelength from hue
  const dominantWavelength = hueToWavelength(h);

  // For achromatic/neutral pixels (very low saturation), treat as broadband
  if (s < 0.08) {
    // White/grey reflects all wavelengths — tuna sees it as grey-blue
    const blueTint = Math.round(l * 180);
    const brightness = Math.round(l * 150);
    return [brightness, brightness, blueTint];
  }

  // Apply depth attenuation to the incoming light's wavelength
  const depthFactor = depthTransmittance(dominantWavelength, depth);
  const attenuatedLightness = l * depthFactor;

  // Calculate cone responses using Govardovskii nomogram
  let totalWeightedResponse = 0;
  const coneResponses: { response: number; weight: number; lambdaMax: number }[] =
    [];

  for (const cone of species.cones) {
    const raw = govardovskiiResponse(dominantWavelength, cone.lambdaMax);
    const weighted = raw * cone.peakSensitivity;
    coneResponses.push({
      response: raw,
      weight: cone.peakSensitivity,
      lambdaMax: cone.lambdaMax,
    });
    totalWeightedResponse += weighted;
  }

  const maxPossibleResponse = species.cones.reduce(
    (sum, c) => sum + c.peakSensitivity,
    0
  );
  const normalizedResponse = Math.min(
    1,
    totalWeightedResponse / maxPossibleResponse
  );

  // Map cone responses to a displayable blue-dominated color
  // The 485nm cone response maps to a blue-green channel
  // The 426nm cone response maps to a violet-blue channel
  const blueGreenCone = coneResponses.find((c) => c.lambdaMax >= 480) ??
    coneResponses[0];
  const violetCone = coneResponses.find((c) => c.lambdaMax < 450) ??
    coneResponses[coneResponses.length - 1];

  const blueGreenResponse = blueGreenCone.response * blueGreenCone.weight;
  const violetResponse = violetCone.response * violetCone.weight;

  // Compute perceived brightness with depth attenuation applied
  const perceivedBrightness = normalizedResponse * attenuatedLightness;

  // Build output color in the fish's perceived space
  // The output is always blue-dominated; the hue shifts based on relative cone responses
  const blueChannel = Math.round(perceivedBrightness * 255 * 0.9 + blueGreenResponse * 30);
  const greenChannel = Math.round(blueGreenResponse * perceivedBrightness * 180);
  const redChannel = Math.round(violetResponse * perceivedBrightness * 80);

  return [
    Math.min(255, redChannel),
    Math.min(255, greenChannel),
    Math.min(255, blueChannel),
  ];
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
  progressCallback?: (percent: number) => void
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

  const totalPixels = width * height;
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

  // Visibility score: weighted by what tuna can actually see
  // Blue/violet counts fully, green partially, red/orange very little
  // Metallic is good (flash), neutral is moderate
  const visibilityScore = Math.min(
    100,
    Math.round(
      pctBlueViolet * 0.9 +
        pctGreen * 0.4 +
        pctRedOrange * 0.05 +
        pctMetallic * 0.85 +
        pctNeutral * 0.5
    )
  );

  const recommendations = buildRecommendations(
    pctBlueViolet,
    pctGreen,
    pctRedOrange,
    pctMetallic,
    pctNeutral,
    depth,
    visibilityScore
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
  pctBlue: number,
  pctGreen: number,
  pctRedOrange: number,
  pctMetallic: number,
  pctNeutral: number,
  depth: number,
  visibilityScore: number
): string[] {
  const recs: string[] = [];

  if (pctBlue > 20) {
    recs.push("Strong blue-green contrast — highly visible in the 460-500nm range");
  }
  if (pctMetallic > 10) {
    recs.push("Metallic flash preserved — chrome reflects across the full spectrum");
  }
  if (pctGreen > 20) {
    recs.push("Green tones partially visible — some contrast retained at depth");
  }
  if (pctRedOrange > 20) {
    const depthNote =
      depth > 10 ? `below ${depth}m` : "below 10m";
    recs.push(`Red/orange elements appear black ${depthNote} — effectively invisible`);
  }
  if (pctRedOrange > 40) {
    recs.push("Heavy red/orange pigment — consider a blue or silver alternative for depth");
  }
  if (depth > 50 && pctGreen > 15) {
    recs.push("Green contrast diminishes significantly past 50m");
  }
  if (depth > 100) {
    recs.push("At 100m+ only blue-violet wavelengths penetrate — lure silhouette dominates");
  }
  if (visibilityScore < 30) {
    recs.push("Low overall visibility — this color scheme is poorly matched to tuna vision");
  } else if (visibilityScore > 70) {
    recs.push("High visibility score — this lure is well-matched to tuna visual sensitivity");
  }
  if (pctNeutral > 30) {
    recs.push("Neutral/white areas visible as grey-blue through tuna eyes");
  }

  return recs;
}
