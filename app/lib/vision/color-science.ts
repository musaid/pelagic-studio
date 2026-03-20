/**
 * Color science utilities for RGB↔HSL conversion and wavelength mapping.
 */

export function rgbToHsl(
  r: number,
  g: number,
  b: number
): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;

  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;

  if (max === min) {
    return [0, 0, l]; // achromatic
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  if (max === rn) {
    h = (gn - bn) / d + (gn < bn ? 6 : 0);
  } else if (max === gn) {
    h = (bn - rn) / d + 2;
  } else {
    h = (rn - gn) / d + 4;
  }
  h /= 6;

  return [h, s, l];
}

export function hslToRgb(
  h: number,
  s: number,
  l: number
): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

/**
 * Map HSL hue (0-1) to approximate dominant wavelength in nm (380-700nm).
 * This is a piecewise linear approximation of the visible spectrum.
 * Hue 0/1 = red (700nm), going counterclockwise through the spectrum.
 */
export function hueToWavelength(hue: number): number {
  // Hue=0 is red, hue=1/6 is yellow, hue=2/6 is green,
  // hue=3/6 is cyan, hue=4/6 is blue, hue=5/6 is magenta
  // Map to wavelength: red=700, yellow=580, green=520, cyan=490, blue=460, violet=420
  const h = hue * 6; // 0-6 range

  if (h < 1) {
    // Red → Yellow: 700 → 580
    return 700 - h * 120;
  } else if (h < 2) {
    // Yellow → Green: 580 → 520
    return 580 - (h - 1) * 60;
  } else if (h < 3) {
    // Green → Cyan: 520 → 490
    return 520 - (h - 2) * 30;
  } else if (h < 4) {
    // Cyan → Blue: 490 → 460
    return 490 - (h - 3) * 30;
  } else if (h < 5) {
    // Blue → Violet: 460 → 420
    return 460 - (h - 4) * 40;
  } else {
    // Violet → Red (magenta): 420 → 700 (through non-spectral)
    // Blend toward red end
    return 420 + (h - 5) * 280;
  }
}

/**
 * Classify a wavelength into a color category name.
 */
export function wavelengthToCategory(
  wavelength: number
): "blueViolet" | "green" | "redOrange" | "neutral" {
  if (wavelength >= 380 && wavelength < 500) return "blueViolet";
  if (wavelength >= 500 && wavelength < 560) return "green";
  return "redOrange";
}
