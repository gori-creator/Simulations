/**
 * Geladene Teilchen in Feldern: Beschleunigung im Längsfeld, Ablenkung im
 * Querfeld, Millikan-Versuch, Zyklotron und Hall-Effekt.
 */

export const E = 1.602176634e-19;
export const ME = 9.1093837e-31;
export const MP = 1.67262192e-27;
export const G = 9.81;

/** Geschwindigkeit nach Durchlaufen der Spannung U aus der Ruhe: ½ m v² = q U. */
export function speedAfter(U: number, q = E, m = ME): number {
  return Math.sqrt((2 * q * U) / m);
}

/**
 * Ablenkung im Plattenkondensator (Länge l, Abstand d, Spannung Ud) für ein
 * Teilchen mit v₀: y(x) = q Ud x² / (2 m d v₀²). Liefert y am Ende und den
 * Austrittswinkel.
 */
export function deflection(Ud: number, d: number, l: number, v0: number, q = E, m = ME): { yEnd: number; angle: number; k: number } {
  const k = (q * Ud) / (2 * m * d * v0 * v0);
  return { k, yEnd: k * l * l, angle: Math.atan(2 * k * l) };
}

/** Öltröpfchen (Radius r, Dichte ρ) schwebt bei U: q · U / d = m · g. Liefert die Ladung. */
export function millikanCharge(r: number, rho: number, U: number, d: number, g = G): number {
  const m = (4 / 3) * Math.PI * r ** 3 * rho;
  return (m * g * d) / U;
}

/** Schwebespannung für ein Tröpfchen mit n Elementarladungen. */
export function floatVoltage(r: number, rho: number, n: number, d: number, g = G): number {
  const m = (4 / 3) * Math.PI * r ** 3 * rho;
  return (m * g * d) / (n * E);
}

/** Zyklotron: Bahnradius r = m v / (q B), Umlauffrequenz f = q B / (2π m) – unabhängig von v. */
export function cyclotron(B: number, v: number, q = E, m = MP): { r: number; f: number } {
  return { r: (m * v) / (q * B), f: (q * B) / (2 * Math.PI * m) };
}

/** Hall-Spannung U_H = B · I / (n · e · d) (d: Dicke des Plättchens in Feldrichtung). */
export function hallVoltage(B: number, I: number, n: number, d: number, q = E): number {
  return (B * I) / (n * q * d);
}

/* ------------------------------------------------------------------ */
/* Massenspektrometer                                                  */
/* ------------------------------------------------------------------ */

/** Atomare Masseneinheit in kg. */
export const U_MASS = 1.66053907e-27;

export type SampleId = 'kohlenstoff' | 'chlor' | 'neon' | 'uran';

export interface Sample {
  id: SampleId;
  /** Massenzahlen der Isotope und ihr natürlicher Anteil (0…1) */
  isotopes: { A: number; share: number }[];
  name: { de: string; en: string };
}

export const SAMPLES: Record<SampleId, Sample> = {
  kohlenstoff: {
    id: 'kohlenstoff',
    isotopes: [
      { A: 12, share: 0.989 },
      { A: 13, share: 0.011 },
    ],
    name: { de: 'Kohlenstoff', en: 'carbon' },
  },
  chlor: {
    id: 'chlor',
    isotopes: [
      { A: 35, share: 0.758 },
      { A: 37, share: 0.242 },
    ],
    name: { de: 'Chlor', en: 'chlorine' },
  },
  neon: {
    id: 'neon',
    isotopes: [
      { A: 20, share: 0.905 },
      { A: 21, share: 0.003 },
      { A: 22, share: 0.092 },
    ],
    name: { de: 'Neon', en: 'neon' },
  },
  uran: {
    id: 'uran',
    isotopes: [
      { A: 235, share: 0.0072 },
      { A: 238, share: 0.9928 },
    ],
    name: { de: 'Uran', en: 'uranium' },
  },
};

/**
 * Wien-Filter: Nur Teilchen mit v = E/B₁ fliegen geradeaus durch gekreuzte
 * Felder. Danach beschreiben sie im Magnetfeld B₂ einen Halbkreis mit
 * r = m·v / (q·B₂) und treffen im Abstand 2r auf den Detektor.
 */
export function wienSpeed(Efield: number, B1: number): number {
  return Efield / B1;
}

export function spectrometerRadius(A: number, v: number, B: number, charge = 1): number {
  return (A * U_MASS * v) / (charge * E * B);
}

/* ------------------------------------------------------------------ */
/* Schraubenbahn (Polarlicht)                                          */
/* ------------------------------------------------------------------ */

/**
 * Bahn eines Elektrons, das unter dem Winkel α zum Magnetfeld B fliegt:
 * Kreis mit r = m·v·sin α / (e·B), Ganghöhe h = 2π·m·v·cos α / (e·B).
 */
export function helix(v: number, alphaDeg: number, B: number, q = E, m = ME): { r: number; pitch: number; T: number } {
  const a = (alphaDeg * Math.PI) / 180;
  const T = (2 * Math.PI * m) / (q * B);
  return { r: (m * v * Math.sin(a)) / (q * B), pitch: v * Math.cos(a) * T, T };
}

/* ------------------------------------------------------------------ */
/* Übung                                                               */
/* ------------------------------------------------------------------ */

export type Loc = { de: string; en: string };
export type TaskKind = 'speed' | 'force' | 'millikan' | 'radius' | 'hall' | 'direction' | 'em' | 'circle';

export interface FieldTask {
  kind: TaskKind;
  text: Loc;
  answer: number;
  /** zulässige relative Abweichung (0 = genau) */
  tol: number;
  choices: Loc[] | null;
  solution: Loc;
}

function rng(seed: number): () => number {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Zahl mit Dezimalkomma (de) bzw. Punkt (en). */
export function numText(x: number, lang: 'de' | 'en', d = 2): string {
  const s = String(Math.round(x * 10 ** d) / 10 ** d);
  return lang === 'de' ? s.replace('.', ',') : s;
}

/** Übungsaufgabe Nummer n (gleiche Nummer → gleiche Aufgabe). */
export function makeTask(n: number): FieldTask {
  const r = rng(n * 43 + 11);
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)]!;
  const kinds: TaskKind[] = ['speed', 'direction', 'force', 'millikan', 'radius', 'hall', 'em', 'circle'];
  const kind = kinds[(n - 1) % kinds.length]!;
  const nt = numText;
  if (kind === 'speed') {
    const U = pick([100, 250, 500, 1000, 2000]);
    const v = speedAfter(U) / 1e6;
    return {
      kind,
      text: {
        de: `Ein Elektron wird mit U = ${U} V beschleunigt. Wie schnell ist es danach, in 1000 km/s (also 10⁶ m/s)?`,
        en: `An electron is accelerated through U = ${U} V. How fast is it afterwards, in 1000 km/s (i.e. 10⁶ m/s)?`,
      },
      answer: v,
      tol: 0.02,
      choices: null,
      solution: { de: `v = √(2eU/m) ≈ ${nt(v, 'de', 1)} · 10⁶ m/s`, en: `v = √(2eU/m) ≈ ${nt(v, 'en', 1)} · 10⁶ m/s` },
    };
  }
  if (kind === 'direction') {
    const items: [Loc, number, Loc][] = [
      [
        {
          de: 'Ein Elektron fliegt zwischen zwei Platten; oben ist die Plus-Platte. Wohin wird es abgelenkt?',
          en: 'An electron flies between two plates; the top plate is positive. Where is it deflected?',
        },
        1,
        { de: 'Elektronen sind negativ und werden von der Plus-Platte angezogen.', en: 'Electrons are negative and are attracted by the positive plate.' },
      ],
      [
        {
          de: 'Ein Proton fliegt zwischen zwei Platten; oben ist die Plus-Platte. Wohin wird es abgelenkt?',
          en: 'A proton flies between two plates; the top plate is positive. Where is it deflected?',
        },
        2,
        { de: 'Protonen sind positiv und werden von der Plus-Platte abgestoßen.', en: 'Protons are positive and are repelled by the positive plate.' },
      ],
      [
        {
          de: 'Ein Neutron fliegt zwischen zwei Platten; oben ist die Plus-Platte. Wohin wird es abgelenkt?',
          en: 'A neutron flies between two plates; the top plate is positive. Where is it deflected?',
        },
        3,
        { de: 'Neutronen sind ungeladen – das Feld wirkt nicht auf sie.', en: 'Neutrons have no charge – the field does not act on them.' },
      ],
    ];
    const [t, a, sol] = pick(items);
    return {
      kind,
      text: t,
      answer: a,
      tol: 0,
      choices: [
        { de: 'nach oben', en: 'upwards' },
        { de: 'nach unten', en: 'downwards' },
        { de: 'gar nicht', en: 'not at all' },
      ],
      solution: sol,
    };
  }
  if (kind === 'force') {
    const B = pick([0.1, 0.2, 0.5]);
    const v6 = pick([1, 2, 5]);
    const F = (E * v6 * 1e6 * B) / 1e-14;
    return {
      kind,
      text: {
        de: `Ein Elektron fliegt mit ${v6} · 10⁶ m/s senkrecht durch ein Magnetfeld mit B = ${nt(B, 'de')} T. Wie groß ist die Lorentzkraft in 10⁻¹⁴ N?`,
        en: `An electron flies at ${v6} · 10⁶ m/s perpendicular through a magnetic field with B = ${nt(B, 'en')} T. What is the Lorentz force in 10⁻¹⁴ N?`,
      },
      answer: F,
      tol: 0.02,
      choices: null,
      solution: { de: `F = e·v·B ≈ ${nt(F, 'de', 2)} · 10⁻¹⁴ N`, en: `F = e·v·B ≈ ${nt(F, 'en', 2)} · 10⁻¹⁴ N` },
    };
  }
  if (kind === 'millikan') {
    const k = pick([2, 3, 4, 5]);
    const q = k * 1.6;
    return {
      kind,
      text: {
        de: `Im Millikan-Versuch misst man für ein Tröpfchen die Ladung q = ${nt(q, 'de', 1)} · 10⁻¹⁹ C. Wie viele Elementarladungen trägt es? (e = 1,6 · 10⁻¹⁹ C)`,
        en: `In the Millikan experiment a droplet has the charge q = ${nt(q, 'en', 1)} · 10⁻¹⁹ C. How many elementary charges does it carry? (e = 1.6 · 10⁻¹⁹ C)`,
      },
      answer: k,
      tol: 0,
      choices: null,
      solution: { de: `${nt(q, 'de', 1)} : 1,6 = ${k}. Ladung tritt nur in ganzen Vielfachen von e auf.`, en: `${nt(q, 'en', 1)} / 1.6 = ${k}. Charge only occurs in whole multiples of e.` },
    };
  }
  if (kind === 'radius') {
    const B = pick([0.5, 1]);
    const v6 = pick([1, 2, 4]);
    const rcm = ((MP * v6 * 1e6) / (E * B)) * 100;
    return {
      kind,
      text: {
        de: `Ein Proton fliegt mit ${v6} · 10⁶ m/s senkrecht in ein Magnetfeld mit B = ${nt(B, 'de')} T. Wie groß ist der Bahnradius in cm? (r = m·v / (e·B))`,
        en: `A proton enters a magnetic field with B = ${nt(B, 'en')} T perpendicularly at ${v6} · 10⁶ m/s. What is the radius of its path in cm? (r = m·v / (e·B))`,
      },
      answer: rcm,
      tol: 0.03,
      choices: null,
      solution: {
        de: `r = 1,67 · 10⁻²⁷ kg · ${v6} · 10⁶ m/s : (1,6 · 10⁻¹⁹ C · ${nt(B, 'de')} T) ≈ ${nt(rcm, 'de', 1)} cm`,
        en: `r = 1.67 · 10⁻²⁷ kg · ${v6} · 10⁶ m/s / (1.6 · 10⁻¹⁹ C · ${nt(B, 'en')} T) ≈ ${nt(rcm, 'en', 1)} cm`,
      },
    };
  }
  if (kind === 'em') {
    const U = pick([150, 200, 250]);
    const Bm = pick([1, 1.2, 1.5]);
    const r = fadenRadius(U, Bm * 1e-3);
    const rc = Math.round(r * 1000) / 10;
    const em = (2 * U) / ((Bm * 1e-3) ** 2 * (rc / 100) ** 2) / 1e11;
    return {
      kind,
      text: {
        de: `Im Fadenstrahlrohr kreisen Elektronen (U = ${U} V, B = ${nt(Bm, 'de', 1)} mT) auf einer Bahn mit r = ${nt(rc, 'de', 1)} cm. Wie groß ist e/m in 10¹¹ C/kg? (e/m = 2U / (B² r²))`,
        en: `In the fine-beam tube electrons circle (U = ${U} V, B = ${nt(Bm, 'en', 1)} mT) on a path with r = ${nt(rc, 'en', 1)} cm. What is e/m in 10¹¹ C/kg? (e/m = 2U / (B² r²))`,
      },
      answer: em,
      tol: 0.03,
      choices: null,
      solution: {
        de: `e/m = 2 · ${U} V : ((${nt(Bm, 'de', 1)} · 10⁻³ T)² · (${nt(rc / 100, 'de', 3)} m)²) ≈ ${nt(em, 'de', 2)} · 10¹¹ C/kg`,
        en: `e/m = 2 · ${U} V / ((${nt(Bm, 'en', 1)} · 10⁻³ T)² · (${nt(rc / 100, 'en', 3)} m)²) ≈ ${nt(em, 'en', 2)} · 10¹¹ C/kg`,
      },
    };
  }
  if (kind === 'circle') {
    const q = pick([
      [
        {
          de: 'Im Fadenstrahlrohr wird die Beschleunigungsspannung erhöht. Wie ändert sich der Kreis?',
          en: 'In the fine-beam tube the accelerating voltage is increased. How does the circle change?',
        },
        1,
      ],
      [
        {
          de: 'Im Fadenstrahlrohr wird der Spulenstrom (also B) erhöht. Wie ändert sich der Kreis?',
          en: 'In the fine-beam tube the coil current (and so B) is increased. How does the circle change?',
        },
        2,
      ],
    ] as [Loc, number][]);
    return {
      kind,
      text: q[0],
      answer: q[1],
      tol: 0,
      choices: [
        { de: 'größer', en: 'larger' },
        { de: 'kleiner', en: 'smaller' },
        { de: 'gleich', en: 'the same' },
      ],
      solution: {
        de: 'r = m·v / (e·B): Schnellere Elektronen (mehr Spannung) fliegen größere Kreise, ein stärkeres Feld zwingt sie auf kleinere.',
        en: 'r = m·v / (e·B): faster electrons (more voltage) fly larger circles, a stronger field forces them onto smaller ones.',
      },
    };
  }
  return {
    kind: 'hall',
    text: {
      de: `Wo ist die Hall-Spannung bei gleichem Strom und Magnetfeld größer: in einem Kupferplättchen oder in einem Halbleiterplättchen?`,
      en: 'Where is the Hall voltage larger for the same current and magnetic field: in a copper plate or in a semiconductor plate?',
    },
    answer: 2,
    tol: 0,
    choices: [
      { de: 'Kupfer', en: 'copper' },
      { de: 'Halbleiter', en: 'semiconductor' },
    ],
    solution: {
      de: `U_H = I·B / (n·e·d): Im Halbleiter gibt es viel weniger Ladungsträger (kleines n), sie müssen schneller fließen – die Hall-Spannung ist viel größer.`,
      en: 'U_H = I·B / (n·e·d): a semiconductor has far fewer charge carriers (small n), they have to move faster – the Hall voltage is much larger.',
    },
  };
}

/** Antwort prüfen: null bei unlesbarer Eingabe. */
export function checkTask(task: FieldTask, input: string): boolean | null {
  const s = input
    .trim()
    .replace(/\s/g, '')
    .replace(',', '.')
    .replace(/[a-zA-Z]+$/, '');
  if (!/^\d*\.?\d+$/.test(s)) return null;
  const x = Number(s);
  if (task.tol === 0) return x === task.answer;
  return Math.abs(x - task.answer) <= task.tol * Math.abs(task.answer) + 1e-9;
}

/* ------------------------------------------------------------------ */
/* Fadenstrahlrohr: e/m bestimmen                                      */
/* ------------------------------------------------------------------ */

/** Helmholtz-Spulen: B = k · I mit k ≈ 0,78 mT/A (N = 130, R = 15 cm). */
export const HELMHOLTZ_K = (0.715 * 4e-7 * Math.PI * 130) / 0.15;

/** Bahnradius (m) von Elektronen nach der Spannung U im Feld B: r = √(2mU/e) / B. */
export function fadenRadius(U: number, B: number): number {
  return Math.sqrt((2 * ME * U) / E) / B;
}

/** Spezifische Ladung aus Messwerten: e/m = 2U / (B² r²). */
export function specificCharge(U: number, B: number, r: number): number {
  return (2 * U) / (B * B * r * r);
}

/* ------------------------------------------------------------------ */
/* Oszilloskop                                                         */
/* ------------------------------------------------------------------ */

/**
 * Leuchtfleck auf dem Schirm (−1…1) zur Zeit t (in Perioden der x-Ablenkung):
 * x als Sägezahn (Zeitablenkung) oder Sinus, y als Sinus mit Frequenzverhältnis
 * fy : fx und Phasenverschiebung φ (Grad).
 */
export function screenSpot(t: number, saw: boolean, ratio: number, phaseDeg: number, ay: number): [number, number] {
  const x = saw ? 2 * (t - Math.floor(t)) - 1 : Math.sin(2 * Math.PI * t);
  const y = ay * Math.sin(2 * Math.PI * ratio * t + (phaseDeg * Math.PI) / 180);
  return [x, y];
}
