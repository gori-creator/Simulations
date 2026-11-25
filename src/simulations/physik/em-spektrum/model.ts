/**
 * Elektromagnetisches Spektrum: Bereiche, Frequenz und Photonenenergie,
 * Hertz’scher Dipol (λ/2-Antenne) sowie Amplituden- und Frequenzmodulation.
 */

export const C_LIGHT = 299_792_458;
export const PLANCK = 6.626_070_15e-34;
export const E_CHARGE = 1.602_176_634e-19;

export type RegionId = 'radio' | 'micro' | 'ir' | 'visible' | 'uv' | 'xray' | 'gamma';

/** Bereiche mit Wellenlängen-Grenzen in m (von, bis); die Grenzen sind fließend. */
export const REGIONS: readonly { id: RegionId; min: number; max: number }[] = [
  { id: 'gamma', min: 1e-15, max: 1e-11 },
  { id: 'xray', min: 1e-11, max: 1e-8 },
  { id: 'uv', min: 1e-8, max: 380e-9 },
  { id: 'visible', min: 380e-9, max: 780e-9 },
  { id: 'ir', min: 780e-9, max: 1e-3 },
  { id: 'micro', min: 1e-3, max: 1 },
  { id: 'radio', min: 1, max: 1e5 },
];

/** Bereich, zu dem die Wellenlänge λ (m) gehört. */
export function regionOf(lambda: number): RegionId {
  for (const r of REGIONS) if (lambda >= r.min && lambda < r.max) return r.id;
  return lambda < 1e-15 ? 'gamma' : 'radio';
}

/** Frequenz f = c / λ in Hz. */
export function frequencyOf(lambda: number): number {
  return C_LIGHT / lambda;
}

/** Photonenenergie E = h · f in eV. */
export function photonEnergyEv(lambda: number): number {
  return (PLANCK * frequencyOf(lambda)) / E_CHARGE;
}

/** Ionisierend ab etwa 10 eV (fernes UV): genug Energie, um Elektronen aus Atomen zu lösen. */
export function isIonizing(lambda: number): boolean {
  return photonEnergyEv(lambda) >= 10;
}

/** Wellenlänge λ = c / f in m. */
export function wavelengthOf(f: number): number {
  return C_LIGHT / f;
}

/** Länge eines Hertz’schen Dipols in Grundschwingung: l = λ / 2. */
export function dipoleLength(f: number): number {
  return wavelengthOf(f) / 2;
}

/** Amplitudenmodulation: (1 + m · sin(ω_s t)) · sin(ω_t t). */
export function am(t: number, fc: number, fs: number, m: number): number {
  return (1 + m * Math.sin(2 * Math.PI * fs * t)) * Math.sin(2 * Math.PI * fc * t);
}

/** Frequenzmodulation mit Hub Δf: sin(2π fc t − (Δf/fs) · cos(2π fs t)). */
export function fm(t: number, fc: number, fs: number, df: number): number {
  return Math.sin(2 * Math.PI * fc * t - (df / fs) * Math.cos(2 * Math.PI * fs * t));
}

/** Momentane Frequenz der FM-Schwingung. */
export function fmInstantFrequency(t: number, fc: number, fs: number, df: number): number {
  return fc + df * Math.sin(2 * Math.PI * fs * t);
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
