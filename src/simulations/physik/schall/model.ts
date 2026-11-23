/**
 * Rechenlogik für Schall: Frequenz, Periodendauer und Wellenlänge
 * (λ = c/f), Schallgeschwindigkeit in Stoffen und abhängig von der
 * Lufttemperatur, Klangfarbe als Summe von Obertönen, Ton-Namen
 * (gleichstufige Stimmung, a′ = 440 Hz), Schalldruckpegel in dB
 * (Amplitude und Intensität), Abnahme mit der Entfernung, Addition von
 * Pegeln, Hörbereiche, Schwebung und Echo.
 * Geprüft in tests/schall.test.ts.
 */

/** Schallgeschwindigkeit in Luft bei 20 °C (m/s) */
export const C_AIR = 343;
/** Bezugsschalldruck 20 µPa und Bezugsintensität 10⁻¹² W/m² */
export const P0 = 20e-6;
export const I0 = 1e-12;

/* ------------------------------------------------------------------ */
/* Grundgrößen                                                          */
/* ------------------------------------------------------------------ */

/** Periodendauer T = 1/f (s). */
export const period = (f: number) => 1 / f;
/** Wellenlänge λ = c/f (m). */
export const wavelength = (c: number, f: number) => c / f;
/** Frequenz aus Wellenlänge f = c/λ. */
export const freqFromLambda = (c: number, lambda: number) => c / lambda;

/** Schallgeschwindigkeit in trockener Luft bei der Temperatur ϑ in °C: c = 331,3 m/s · √(1 + ϑ/273,15). */
export const soundSpeedAir = (celsius: number) => 331.3 * Math.sqrt(1 + celsius / 273.15);

export interface Medium {
  id: string;
  c: number;
  de: string;
  en: string;
  /** Darstellung der Teilchen: Gas, Flüssigkeit, Festkörper */
  phase: 'gas' | 'liquid' | 'solid';
}
/** Gerundete Lehrbuchwerte (bei etwa 20 °C). */
export const MEDIA: readonly Medium[] = [
  { id: 'air', c: 343, de: 'Luft', en: 'air', phase: 'gas' },
  { id: 'helium', c: 1007, de: 'Helium', en: 'helium', phase: 'gas' },
  { id: 'water', c: 1484, de: 'Wasser', en: 'water', phase: 'liquid' },
  { id: 'wood', c: 3300, de: 'Holz (längs)', en: 'wood (along the grain)', phase: 'solid' },
  { id: 'steel', c: 5100, de: 'Stahl', en: 'steel', phase: 'solid' },
  { id: 'vacuum', c: 0, de: 'Vakuum', en: 'vacuum', phase: 'gas' },
];
export const medium = (id: string): Medium => MEDIA.find((m) => m.id === id) ?? MEDIA[0]!;

/* ------------------------------------------------------------------ */
/* Klangfarbe                                                           */
/* ------------------------------------------------------------------ */

export type Timbre = 'sine' | 'flute' | 'clarinet' | 'violin' | 'square' | 'saw';

/** Amplituden der Teiltöne 1 … n (Grundton = 1). */
export function harmonics(t: Timbre, n = 12): number[] {
  const out: number[] = [];
  for (let k = 1; k <= n; k++) {
    let a = 0;
    switch (t) {
      case 'sine':
        a = k === 1 ? 1 : 0;
        break;
      case 'flute':
        a = [1, 0.45, 0.12, 0.05, 0.02][k - 1] ?? 0;
        break;
      case 'clarinet':
        a = k % 2 === 1 ? 1 / Math.pow(k, 1.1) : 0.04 / k;
        break;
      case 'violin':
        a = (1 / k) * (k === 2 ? 0.9 : k === 3 ? 0.75 : 1);
        break;
      case 'square':
        a = k % 2 === 1 ? 1 / k : 0;
        break;
      case 'saw':
        a = 1 / k;
        break;
    }
    out.push(a);
  }
  return out;
}

/** Normierte Schwingung y(t) (Maximum etwa 1) aus Teiltönen mit Grundfrequenz f. */
export function waveform(t: Timbre, f: number, time: number, h = harmonics(t)): number {
  let y = 0;
  let norm = 0;
  for (let k = 0; k < h.length; k++) {
    const a = h[k]!;
    if (!a) continue;
    y += a * Math.sin(2 * Math.PI * (k + 1) * f * time + (t === 'violin' ? k * 0.4 : 0));
    norm += a;
  }
  return norm ? y / Math.max(norm * (t === 'square' || t === 'saw' ? 0.75 : 0.85), 1) : 0;
}

/* ------------------------------------------------------------------ */
/* Tonnamen                                                             */
/* ------------------------------------------------------------------ */

const NAMES_DE = ['c', 'cis', 'd', 'dis', 'e', 'f', 'fis', 'g', 'gis', 'a', 'ais', 'h'];
const NAMES_EN = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

/**
 * Nächster Ton der gleichstufigen Stimmung (a′ = 440 Hz = MIDI 69) und
 * Abweichung in Cent. Oktavlage nach wissenschaftlicher Schreibweise (A4).
 */
export function noteOf(f: number): { midi: number; cents: number; de: string; en: string; f: number } {
  const m = 69 + 12 * Math.log2(f / 440);
  const midi = Math.round(m);
  const cents = Math.round((m - midi) * 100);
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return { midi, cents, de: `${NAMES_DE[pc]}${octave}`, en: `${NAMES_EN[pc]}${octave}`, f: 440 * Math.pow(2, (midi - 69) / 12) };
}

/* ------------------------------------------------------------------ */
/* Pegel                                                                */
/* ------------------------------------------------------------------ */

/** Pegeländerung bei Amplitudenverhältnis (Schalldruck): ΔL = 20·log₁₀(p₂/p₁) dB. */
export const dbFromAmplitude = (ratio: number) => 20 * Math.log10(ratio);
/** Pegeländerung bei Intensitätsverhältnis: ΔL = 10·log₁₀(I₂/I₁) dB. */
export const dbFromIntensity = (ratio: number) => 10 * Math.log10(ratio);
/** Schalldruckpegel aus dem Schalldruck (Pa). */
export const splFromPressure = (p: number) => 20 * Math.log10(p / P0);
/** Schalldruck aus dem Pegel (Pa). */
export const pressureFromSpl = (L: number) => P0 * Math.pow(10, L / 20);
/** Intensität aus dem Pegel (W/m²). */
export const intensityFromSpl = (L: number) => I0 * Math.pow(10, L / 10);
/** Pegel in der Entfernung r₂, wenn in r₁ der Pegel L₁ herrscht (Punktquelle, ungedämpft). */
export const splAtDistance = (L1: number, r1: number, r2: number) => L1 - 20 * Math.log10(r2 / r1);
/** Summenpegel mehrerer unabhängiger Quellen: L = 10·log₁₀(Σ 10^{Lᵢ/10}). */
export const addLevels = (levels: readonly number[]) => 10 * Math.log10(levels.reduce((s, L) => s + Math.pow(10, L / 10), 0));

export interface Noise {
  id: string;
  L: number;
  de: string;
  en: string;
}
/** Typische Schalldruckpegel (gerundete Beispielwerte). */
export const NOISES: readonly Noise[] = [
  { id: 'hear', L: 0, de: 'Hörschwelle', en: 'threshold of hearing' },
  { id: 'leaves', L: 20, de: 'Blätterrauschen', en: 'rustling leaves' },
  { id: 'whisper', L: 30, de: 'Flüstern', en: 'whisper' },
  { id: 'room', L: 40, de: 'ruhige Wohnung', en: 'quiet flat' },
  { id: 'talk', L: 60, de: 'Unterhaltung', en: 'conversation' },
  { id: 'class', L: 70, de: 'laute Klasse', en: 'noisy classroom' },
  { id: 'street', L: 80, de: 'Hauptstraße', en: 'main road' },
  { id: 'headph', L: 95, de: 'laute Kopfhörer', en: 'loud headphones' },
  { id: 'concert', L: 110, de: 'Rockkonzert', en: 'rock concert' },
  { id: 'pain', L: 130, de: 'Schmerzgrenze', en: 'threshold of pain' },
  { id: 'jet', L: 140, de: 'Düsenflugzeug in 30 m', en: 'jet aircraft at 30 m' },
];

/** Gefahr für das Gehör: ab 85 dB(A) bei langer Dauer, ab 120 dB auch kurz. */
export function hearingRisk(L: number): 'safe' | 'long' | 'danger' {
  if (L >= 120) return 'danger';
  if (L >= 85) return 'long';
  return 'safe';
}

/* ------------------------------------------------------------------ */
/* Hörbereiche                                                          */
/* ------------------------------------------------------------------ */

export interface Hearing {
  id: string;
  min: number;
  max: number;
  de: string;
  en: string;
}
/** Hörbereiche (gerundete Lehrbuchwerte in Hz). */
export const HEARING: readonly Hearing[] = [
  { id: 'human', min: 20, max: 20_000, de: 'Mensch', en: 'human' },
  { id: 'dog', min: 15, max: 50_000, de: 'Hund', en: 'dog' },
  { id: 'cat', min: 45, max: 64_000, de: 'Katze', en: 'cat' },
  { id: 'bat', min: 1_000, max: 120_000, de: 'Fledermaus', en: 'bat' },
  { id: 'dolphin', min: 150, max: 150_000, de: 'Delfin', en: 'dolphin' },
  { id: 'elephant', min: 5, max: 12_000, de: 'Elefant', en: 'elephant' },
];

/** Bereich: Infraschall, hörbar (Mensch), Ultraschall. */
export const band = (f: number): 'infra' | 'audible' | 'ultra' => (f < 20 ? 'infra' : f > 20_000 ? 'ultra' : 'audible');

/* ------------------------------------------------------------------ */
/* Schwebung und Echo                                                   */
/* ------------------------------------------------------------------ */

/** Schwebungsfrequenz |f₁ − f₂|. */
export const beatFreq = (f1: number, f2: number) => Math.abs(f1 - f2);
/** Überlagerung zweier gleich lauter Töne. */
export const twoTones = (f1: number, f2: number, t: number) => 0.5 * (Math.sin(2 * Math.PI * f1 * t) + Math.sin(2 * Math.PI * f2 * t));
/** Einhüllende der Schwebung |cos(π·(f₁ − f₂)·t)|. */
export const beatEnvelope = (f1: number, f2: number, t: number) => Math.abs(Math.cos(Math.PI * (f1 - f2) * t));

/** Laufzeit des Echos t = 2d/c. */
export const echoTime = (d: number, c: number) => (2 * d) / c;
/** Entfernung aus der Laufzeit d = c·t/2. */
export const echoDistance = (t: number, c: number) => (c * t) / 2;
/** Mindestabstand, damit man das Echo getrennt hört (≈ 0,1 s Laufzeit). */
export const echoMinDistance = (c: number, tMin = 0.1) => echoDistance(tMin, c);

/* ------------------------------------------------------------------ */
/* Teilchenmodell der Längswelle                                        */
/* ------------------------------------------------------------------ */

/**
 * Auslenkung eines Luftteilchens an der Ruhelage x (m) zur Zeit t:
 * s = s₀·sin(2π(f·t − x/λ)). Die Druckschwankung ist um λ/4 versetzt:
 * Δp ∝ −∂s/∂x = (2π/λ)·s₀·cos(…).
 */
export function displacement(x: number, t: number, f: number, lambda: number, s0: number): number {
  return s0 * Math.sin(2 * Math.PI * (f * t - x / lambda));
}
export function pressureDev(x: number, t: number, f: number, lambda: number): number {
  return Math.cos(2 * Math.PI * (f * t - x / lambda));
}

/* ------------------------------------------------------------------ */
/* Hörschwelle                                                          */
/* ------------------------------------------------------------------ */

/**
 * Hörschwelle eines jungen, gesunden Menschen in dB (Näherung nach
 * Terhardt): T(f) = 3,64·f⁻⁰·⁸ − 6,5·e^(−0,6·(f − 3,3)²) + 10⁻³·f⁴, f in kHz.
 * Am empfindlichsten um 3 bis 4 kHz.
 */
export function hearingThreshold(fHz: number): number {
  const f = fHz / 1000;
  return 3.64 * Math.pow(f, -0.8) - 6.5 * Math.exp(-0.6 * (f - 3.3) ** 2) + 1e-3 * f ** 4;
}
/** Hörbar, wenn der Pegel über der Hörschwelle liegt und f im Hörbereich ist. */
export const audible = (fHz: number, L: number) => fHz >= 16 && fHz <= 20_000 && L > hearingThreshold(fHz);

/* ------------------------------------------------------------------ */
/* Schallquellen: Saite und Pfeife                                      */
/* ------------------------------------------------------------------ */

/**
 * Eigenfrequenz einer Saite: f_n = n/(2L)·√(F/μ) mit Länge L (m),
 * Spannkraft F (N) und Masse pro Länge μ (kg/m).
 */
export const stringFreq = (L: number, F: number, mu: number, n = 1) => (n / (2 * L)) * Math.sqrt(F / mu);
/** Wellengeschwindigkeit auf der Saite c = √(F/μ). */
export const stringSpeed = (F: number, mu: number) => Math.sqrt(F / mu);
/** Spannkraft für eine gewünschte Grundfrequenz F = μ·(2Lf)². */
export const tensionFor = (L: number, f: number, mu: number) => mu * (2 * L * f) ** 2;

/**
 * Eigenfrequenzen einer Pfeife der Länge L: offen (beide Enden offen)
 * f_n = n·c/(2L), gedackt (ein Ende zu) nur ungerade Vielfache
 * f_k = (2k − 1)·c/(4L). n bzw. k = 1, 2, 3, …
 */
export function pipeFreq(L: number, c: number, open: boolean, n = 1): number {
  return open ? (n * c) / (2 * L) : ((2 * n - 1) * c) / (4 * L);
}

/** Masse pro Länge einiger Saiten (Beispielwerte, kg/m). */
export const STRINGS: readonly { id: string; mu: number; de: string; en: string }[] = [
  { id: 'e1', mu: 0.4e-3, de: 'dünne Stahlsaite (Gitarre e′)', en: 'thin steel string (guitar e′)' },
  { id: 'a', mu: 3.5e-3, de: 'mittlere Saite (Gitarre A)', en: 'medium string (guitar A)' },
  { id: 'E', mu: 6.4e-3, de: 'dicke Saite (Gitarre E)', en: 'thick string (guitar E)' },
];
