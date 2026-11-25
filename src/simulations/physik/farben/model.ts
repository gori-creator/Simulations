/**
 * Farben: Zerlegung weißen Lichts am Prisma (Dispersion), additive und
 * subtraktive Farbmischung, Farbfilter (Absorption und Transmission).
 */

/** Brechzahl von Kronglas nach Cauchy, λ in nm. */
export function refractiveIndex(lambdaNm: number): number {
  return 1.5046 + 4200 / (lambdaNm * lambdaNm);
}

/**
 * Gesamtablenkung (rad) eines Strahls durch ein Prisma mit brechendem Winkel
 * `apex` (rad) bei Einfallswinkel `alpha1` (rad) an der ersten Fläche.
 * Liefert NaN bei Totalreflexion an der zweiten Fläche.
 */
export function prismDeviation(n: number, apex: number, alpha1: number): number {
  const beta1 = Math.asin(Math.sin(alpha1) / n);
  const beta2 = apex - beta1;
  const s = n * Math.sin(beta2);
  if (Math.abs(s) > 1) return Number.NaN;
  const alpha2 = Math.asin(s);
  return alpha1 + alpha2 - apex;
}

export type Rgb = readonly [number, number, number];

/** Additive Mischung dreier Lichter (Anteile 0…1), begrenzt auf 1. */
export function additiveMix(r: number, g: number, b: number): Rgb {
  const c = (v: number) => Math.max(0, Math.min(1, v));
  return [c(r), c(g), c(b)];
}

/**
 * Subtraktive Mischung: weißes Licht durch Filter Cyan, Magenta, Gelb
 * (Stärke 0…1). Cyan schluckt Rot, Magenta schluckt Grün, Gelb schluckt Blau.
 */
export function subtractiveMix(c: number, m: number, y: number): Rgb {
  const k = (v: number) => 1 - Math.max(0, Math.min(1, v));
  return [k(c), k(m), k(y)];
}

export type ColorName = 'black' | 'white' | 'grey' | 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue' | 'magenta';

/** Ungefährer Farbname für eine Lichtfarbe (Anteile 0…1). */
export function colorName([r, g, b]: Rgb): ColorName {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 0.12) return 'black';
  const sat = (max - min) / max;
  if (sat < 0.15) return max > 0.85 ? 'white' : 'grey';
  // Farbton in Grad (HSV)
  let h: number;
  if (max === r) h = (60 * ((g - b) / (max - min)) + 360) % 360;
  else if (max === g) h = 60 * ((b - r) / (max - min)) + 120;
  else h = 60 * ((r - g) / (max - min)) + 240;
  if (h < 20 || h >= 330) return 'red';
  if (h < 45) return 'orange';
  if (h < 70) return 'yellow';
  if (h < 160) return 'green';
  if (h < 200) return 'cyan';
  if (h < 265) return 'blue';
  return 'magenta';
}

export type FilterId = 'none' | 'red' | 'green' | 'blue' | 'cyan' | 'magenta' | 'yellow';

/** Durchlässigkeit eines idealisierten Farbfilters für die Wellenlänge λ (nm). */
export function filterPasses(filter: FilterId, lambdaNm: number): boolean {
  const R = lambdaNm >= 600;
  const G = lambdaNm >= 495 && lambdaNm < 600;
  const B = lambdaNm < 495;
  switch (filter) {
    case 'none':
      return true;
    case 'red':
      return R;
    case 'green':
      return G;
    case 'blue':
      return B;
    case 'cyan':
      return G || B;
    case 'magenta':
      return R || B;
    case 'yellow':
      return R || G;
  }
}

/** Spektralfarbe (sRGB, 0–255) für eine Wellenlänge in nm (380–780). */
export function wavelengthToRgb(l: number): [number, number, number] {
  let r = 0;
  let g = 0;
  let b = 0;
  if (l < 440) {
    r = -(l - 440) / 60;
    b = 1;
  } else if (l < 490) {
    g = (l - 440) / 50;
    b = 1;
  } else if (l < 510) {
    g = 1;
    b = -(l - 510) / 20;
  } else if (l < 580) {
    r = (l - 510) / 70;
    g = 1;
  } else if (l < 645) {
    r = 1;
    g = -(l - 645) / 65;
  } else r = 1;
  let k = 1;
  if (l < 420) k = 0.3 + (0.7 * (l - 380)) / 40;
  else if (l > 700) k = 0.3 + (0.7 * (780 - l)) / 80;
  const c = (v: number) => Math.round(255 * Math.pow(Math.max(0, Math.min(1, v * k)), 0.8));
  return [c(r), c(g), c(b)];
}
