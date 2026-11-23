/**
 * Rechenlogik „Sterne und Hertzsprung-Russell-Diagramm“.
 *
 * Größen in Sonneneinheiten: Leuchtkraft L in L☉, Radius R in R☉,
 * Masse M in M☉, Temperatur T in Kelvin (Oberflächentemperatur).
 * Stefan-Boltzmann: L = 4π·R²·σ·T⁴, also L/L☉ = (R/R☉)² · (T/T☉)⁴.
 */

export const SIGMA = 5.670374419e-8; // W/(m²·K⁴)
export const L_SUN = 3.828e26; // W (IAU-Nennwert)
export const R_SUN = 6.957e8; // m (IAU-Nennwert)
/** Effektive Temperatur der Sonne aus L☉ und R☉ (≈ 5772 K). */
export const T_SUN = Math.pow(L_SUN / (4 * Math.PI * R_SUN * R_SUN * SIGMA), 0.25);
export const WIEN_B = 2.897771955e-3; // m·K
export const LY_PER_PC = 3.26156;
export const AU = 1.495978707e11; // m
export const LY = 9.4607304725808e15; // m

/** Leuchtkraft in Watt aus Radius (m) und Temperatur (K). */
export const luminosityW = (Rm: number, T: number) => 4 * Math.PI * Rm * Rm * SIGMA * T ** 4;

/** Leuchtkraft in L☉ aus Radius in R☉ und Temperatur in K. */
export const luminosity = (R: number, T: number) => R * R * (T / T_SUN) ** 4;

/** Radius in R☉ aus Leuchtkraft in L☉ und Temperatur in K. */
export const radiusFrom = (L: number, T: number) => Math.sqrt(L) / (T / T_SUN) ** 2;

/** Temperatur aus Leuchtkraft und Radius (Sonneneinheiten). */
export const temperatureFrom = (L: number, R: number) => T_SUN * Math.pow(L / (R * R), 0.25);

/** Wellenlänge des Strahlungsmaximums in nm (Wiensches Verschiebungsgesetz). */
export const wienPeakNm = (T: number) => (WIEN_B / T) * 1e9;

/**
 * Plancksche Strahlung, relative Werte: B_λ(T) ∝ 1/λ⁵ · 1/(e^(hc/λkT) − 1).
 * λ in nm; normiert so, dass die Sonne beim Maximum etwa 1 ergibt.
 */
export function planck(lambdaNm: number, T: number): number {
  const c2 = 1.438776877e-2; // h·c/k in m·K
  const l = lambdaNm * 1e-9;
  const x = c2 / (l * T);
  if (x > 700) return 0;
  const v = 1 / (l ** 5 * (Math.exp(x) - 1));
  const lp = WIEN_B / T_SUN;
  const vSun = 1 / (lp ** 5 * (Math.exp(c2 / (lp * T_SUN)) - 1));
  return v / vSun;
}

/* ------------------------------------------------------------------ */
/* Spektralklassen und Farben                                           */
/* ------------------------------------------------------------------ */

export type SpectralClass = 'O' | 'B' | 'A' | 'F' | 'G' | 'K' | 'M';

/** Grenzen der Spektralklassen (untere Temperatur in K). */
export const CLASS_BOUNDS: readonly [SpectralClass, number][] = [
  ['O', 30000],
  ['B', 10000],
  ['A', 7500],
  ['F', 6000],
  ['G', 5200],
  ['K', 3700],
  ['M', 0],
];

export function spectralClass(T: number): SpectralClass {
  for (const [c, lo] of CLASS_BOUNDS) if (T >= lo) return c;
  return 'M';
}

/**
 * Ungefähre Farbe eines Schwarzen Körpers als RGB (0…255), Näherung nach
 * Tanner Helland. Das ist eine physikalische Farbe (keine Designfarbe).
 */
export function starRGB(T: number): [number, number, number] {
  const t = Math.min(40000, Math.max(1000, T)) / 100;
  let r: number;
  let g: number;
  let b: number;
  if (t <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
    b = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492);
    b = 255;
  }
  const c = (v: number) => Math.round(Math.min(255, Math.max(0, v)));
  return [c(r), c(g), c(b)];
}

/* ------------------------------------------------------------------ */
/* Entfernung                                                           */
/* ------------------------------------------------------------------ */

/** Entfernung in Parsec aus der Parallaxe in Bogensekunden. */
export const parsecFromParallax = (p: number) => 1 / p;
export const lyFromParallax = (p: number) => LY_PER_PC / p;

/** Absolute Helligkeit aus der Leuchtkraft (M☉ = 4,83 mag). */
export const absMag = (L: number) => 4.83 - 2.5 * Math.log10(L);
/** Scheinbare Helligkeit aus absoluter Helligkeit und Entfernung in pc. */
export const appMag = (M: number, dPc: number) => M + 5 * Math.log10(dPc / 10);

/* ------------------------------------------------------------------ */
/* Hauptreihe                                                           */
/* ------------------------------------------------------------------ */

/** Masse-Leuchtkraft-Beziehung der Hauptreihe (Näherung, stückweise). */
export function msLuminosity(M: number): number {
  if (M < 0.43) return 0.23 * M ** 2.3;
  if (M <= 2) return M ** 4;
  if (M < 55) return 1.4 * M ** 3.5;
  return 32000 * M;
}

/** Radius auf der Hauptreihe (Näherung). */
export const msRadius = (M: number) => (M <= 1 ? M ** 0.8 : M ** 0.57);

/** Oberflächentemperatur auf der Hauptreihe. */
export const msTemperature = (M: number) => temperatureFrom(msLuminosity(M), msRadius(M));

/** Verweildauer auf der Hauptreihe in Milliarden Jahren: t ≈ 10 · M / L. */
export const msLifetime = (M: number) => (10 * M) / msLuminosity(M);

/* ------------------------------------------------------------------ */
/* Lebensweg (schematisch)                                              */
/* ------------------------------------------------------------------ */

export type Phase = 'ms' | 'sub' | 'rgb' | 'hb' | 'agb' | 'pn' | 'wd' | 'rsg' | 'sn' | 'ns' | 'bh';

export interface TrackPoint {
  T: number;
  L: number;
  /** Anteil an der Gesamtzeit des Weges, bis dieser Punkt erreicht ist (0 … 1). */
  t: number;
  phase: Phase;
}

/**
 * Schematischer Entwicklungsweg im HR-Diagramm für eine Anfangsmasse M.
 * Die Zeitanteile sind grob: der größte Teil des Lebens vergeht auf der
 * Hauptreihe. Massereiche Sterne (ab 8 M☉) enden als Supernova.
 */
export function evolutionTrack(M: number): TrackPoint[] {
  const L0 = msLuminosity(M);
  const T0 = msTemperature(M);
  const pts: TrackPoint[] = [];
  const add = (T: number, L: number, t: number, phase: Phase) => pts.push({ T, L, t, phase });
  add(T0, L0, 0, 'ms');
  // Ende der Hauptreihe: etwas heller und kühler
  add(T0 * 0.92, L0 * 1.9, 0.86, 'ms');
  if (M < 8) {
    add(Math.min(T0 * 0.8, 5200), L0 * 2.2, 0.9, 'sub');
    add(4300, Math.max(L0 * 8, 15), 0.94, 'rgb');
    add(3600, Math.max(L0 * 300, 1500), 0.965, 'rgb');
    add(5000, Math.max(L0 * 40, 50), 0.97, 'hb');
    add(5000, Math.max(L0 * 50, 60), 0.985, 'hb');
    add(3300, Math.max(L0 * 600, 4000), 0.993, 'agb');
    add(30000, Math.max(L0 * 600, 4000) * 0.9, 0.996, 'pn');
    add(100000, Math.max(L0 * 300, 2000), 0.997, 'pn');
    add(60000, 2, 0.998, 'wd');
    add(15000, 0.01, 0.9995, 'wd');
    add(7000, 0.0005, 1, 'wd');
  } else {
    add(T0 * 0.5, L0 * 1.3, 0.9, 'rsg');
    add(4500, L0 * 1.5, 0.95, 'rsg');
    add(3500, L0 * 1.6, 0.995, 'rsg');
    add(3500, L0 * 3, 1, 'sn');
  }
  return pts;
}

/** Endzustand nach der Anfangsmasse. */
export function remnant(M: number): 'wd' | 'ns' | 'bh' {
  if (M < 8) return 'wd';
  if (M < 25) return 'ns';
  return 'bh';
}

/** Punkt auf dem Weg zum Zeitanteil u (0 … 1), logarithmisch interpoliert. */
export function trackAt(track: readonly TrackPoint[], u: number): TrackPoint {
  if (u <= 0) return track[0]!;
  for (let i = 1; i < track.length; i++) {
    const a = track[i - 1]!;
    const b = track[i]!;
    if (u <= b.t) {
      const s = b.t > a.t ? (u - a.t) / (b.t - a.t) : 1;
      return {
        T: Math.exp(Math.log(a.T) + s * (Math.log(b.T) - Math.log(a.T))),
        L: Math.exp(Math.log(a.L) + s * (Math.log(b.L) - Math.log(a.L))),
        t: u,
        phase: s < 1 ? b.phase : b.phase,
      };
    }
  }
  return track.at(-1)!;
}

/* ------------------------------------------------------------------ */
/* Bekannte Sterne (gerundete Werte)                                    */
/* ------------------------------------------------------------------ */

export interface Star {
  id: string;
  de: string;
  en: string;
  /** Temperatur in K */
  T: number;
  /** Leuchtkraft in L☉ */
  L: number;
  /** Entfernung in Lichtjahren (0 = Sonne) */
  ly: number;
}

/** Gerundete Literaturwerte; der Radius folgt aus L und T. */
export const STARS: readonly Star[] = [
  { id: 'sun', de: 'Sonne', en: 'Sun', T: 5772, L: 1, ly: 0 },
  { id: 'sirius', de: 'Sirius A', en: 'Sirius A', T: 9940, L: 25.4, ly: 8.6 },
  { id: 'siriusb', de: 'Sirius B', en: 'Sirius B', T: 25000, L: 0.056, ly: 8.6 },
  { id: 'proxima', de: 'Proxima Centauri', en: 'Proxima Centauri', T: 3042, L: 0.0017, ly: 4.24 },
  { id: 'barnard', de: 'Barnards Pfeilstern', en: 'Barnard’s Star', T: 3134, L: 0.0035, ly: 5.96 },
  { id: 'altair', de: 'Altair', en: 'Altair', T: 7700, L: 10.6, ly: 16.7 },
  { id: 'vega', de: 'Wega', en: 'Vega', T: 9600, L: 40, ly: 25 },
  { id: 'procyon', de: 'Prokyon A', en: 'Procyon A', T: 6530, L: 6.9, ly: 11.5 },
  { id: 'arcturus', de: 'Arktur', en: 'Arcturus', T: 4290, L: 170, ly: 36.7 },
  { id: 'aldebaran', de: 'Aldebaran', en: 'Aldebaran', T: 3900, L: 440, ly: 65 },
  { id: 'polaris', de: 'Polarstern', en: 'Polaris', T: 6000, L: 1260, ly: 430 },
  { id: 'spica', de: 'Spica', en: 'Spica', T: 25300, L: 20500, ly: 250 },
  { id: 'betelgeuse', de: 'Beteigeuze', en: 'Betelgeuse', T: 3500, L: 100000, ly: 550 },
  { id: 'antares', de: 'Antares', en: 'Antares', T: 3570, L: 75900, ly: 550 },
  { id: 'rigel', de: 'Rigel', en: 'Rigel', T: 12100, L: 120000, ly: 860 },
  { id: 'deneb', de: 'Deneb', en: 'Deneb', T: 8500, L: 196000, ly: 2600 },
];

export const starById = (id: string) => STARS.find((s) => s.id === id);

/** Gebiet im HR-Diagramm, in dem ein Stern liegt. */
export type Region = 'ms' | 'giant' | 'supergiant' | 'wd';
export function regionOf(T: number, L: number): Region {
  const R = radiusFrom(L, T);
  if (R < 0.05) return 'wd';
  if (L > 8000 && R > 20) return 'supergiant';
  // Hauptreihe: Leuchtkraft passt zur Temperatur (± Faktor 10 um die Näherung)
  const Lms = msLumAtT(T);
  if (L < Lms * 12) return 'ms';
  return 'giant';
}

/** Leuchtkraft der Hauptreihe bei der Temperatur T (Umkehrung über die Masse, Bisektion). */
export function msLumAtT(T: number): number {
  let lo = 0.08;
  let hi = 120;
  for (let i = 0; i < 80; i++) {
    const mid = Math.sqrt(lo * hi);
    if (msTemperature(mid) < T) lo = mid;
    else hi = mid;
  }
  return msLuminosity(Math.sqrt(lo * hi));
}

/* ------------------------------------------------------------------ */
/* Erzeugte Sternpopulation für den Hintergrund                         */
/* ------------------------------------------------------------------ */

export function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

/** Normalverteilte Zufallszahl (Box-Muller). */
const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r());

/** Viele erfundene, aber typisch verteilte Sterne (T, L). */
export function population(n: number, seed: number): { T: number; L: number }[] {
  const r = rng(seed);
  const out: { T: number; L: number }[] = [];
  for (let i = 0; i < n; i++) {
    const u = r();
    if (u < 0.72) {
      // Hauptreihe: Masse log-gleichverteilt (etwas mehr kleine Sterne)
      const M = Math.exp(Math.log(0.12) + Math.pow(r(), 1.4) * (Math.log(40) - Math.log(0.12)));
      out.push({ T: msTemperature(M) * Math.exp(gauss(r) * 0.03), L: msLuminosity(M) * Math.exp(gauss(r) * 0.25) });
    } else if (u < 0.88) {
      // Riesenast
      const T = 3400 + r() * 1800;
      out.push({ T, L: Math.exp(Math.log(15) + r() * Math.log(80)) * (5200 / T) ** 1.5 });
    } else if (u < 0.93) {
      // Überriesen
      out.push({ T: Math.exp(Math.log(3400) + r() * Math.log(25000 / 3400)), L: Math.exp(Math.log(8000) + r() * Math.log(40)) });
    } else {
      // Weiße Zwerge
      const T = Math.exp(Math.log(5000) + r() * Math.log(40000 / 5000));
      const R = 0.008 + r() * 0.01;
      out.push({ T, L: luminosity(R, T) });
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Übung: Sterne einordnen                                              */
/* ------------------------------------------------------------------ */

export interface QuizStar {
  T: number;
  R: number;
  L: number;
  region: Region;
}

/** Erfundener Stern für Runde n: Gebiet zufällig, Werte typisch für das Gebiet. */
export function quizStar(n: number): QuizStar {
  const r = rng(500 + n * 104729);
  const kinds: Region[] = ['ms', 'giant', 'supergiant', 'wd'];
  const region = kinds[Math.floor(r() * 4)]!;
  let T: number;
  let R: number;
  if (region === 'ms') {
    const M = Math.exp(Math.log(0.3) + r() * Math.log(15 / 0.3));
    T = msTemperature(M);
    R = msRadius(M);
  } else if (region === 'giant') {
    T = 3600 + r() * 1300;
    R = 12 + r() * 40;
  } else if (region === 'supergiant') {
    T = r() < 0.5 ? 3500 + r() * 800 : 9000 + r() * 12000;
    R = T < 5000 ? 400 + r() * 600 : 40 + r() * 60;
  } else {
    T = 8000 + r() * 22000;
    R = 0.009 + r() * 0.008;
  }
  T = Math.round(T / 100) * 100;
  R = R >= 10 ? Math.round(R) : R >= 1 ? Math.round(R * 10) / 10 : Math.round(R * 1000) / 1000;
  return { T, R, L: luminosity(R, T), region };
}

/** Strahlung pro Quadratmeter Oberfläche (σ·T⁴) in MW/m². */
export const surfaceFluxMW = (T: number) => (SIGMA * T ** 4) / 1e6;

/** Mit bloßem Auge sichtbar (dunkler Himmel): scheinbare Helligkeit bis etwa 6 mag. */
export const nakedEye = (m: number) => m <= 6;

/** Wie viele Sonnen dem Volumen nach in einen Stern mit Radius R passen (R³). */
export const sunsInside = (R: number) => R ** 3;
