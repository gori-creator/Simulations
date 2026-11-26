/**
 * Druck: Auflagedruck p = F / A, hydraulische Presse, Schweredruck in
 * Flüssigkeiten und Luftdruck (barometrische Höhenformel, Land-See-Wind).
 */

export const G = 9.81;
/** Luftdruck auf Meereshöhe in hPa */
export const P0 = 1013.25;

/** Druck in Pa aus Kraft (N) und Fläche (m²). */
export function pressure(F: number, A: number): number {
  return F / A;
}

/** Hydraulische Presse: gleicher Druck überall, F₂ = F₁ · A₂ / A₁; der große Kolben bewegt sich um s₂ = s₁ · A₁ / A₂. */
export function hydraulic(F1: number, A1: number, A2: number, s1: number): { p: number; F2: number; s2: number } {
  const p = F1 / A1;
  return { p, F2: p * A2, s2: (s1 * A1) / A2 };
}

/** Schweredruck p = ρ · g · h in Pa (h in m). */
export function hydrostatic(rho: number, h: number, g = G): number {
  return rho * g * h;
}

/** Barometrische Höhenformel (isotherm, Skalenhöhe ≈ 8,4 km): Druck in hPa in der Höhe h (m). */
export function airPressure(h: number, p0 = P0, scale = 8400): number {
  return p0 * Math.exp(-h / scale);
}

/**
 * Land-See-Wind (stark vereinfacht): Die wärmere Fläche erwärmt die Luft
 * darüber, dort entsteht am Boden tiefer Druck. Liefert, wo der Bodenwind
 * hinweht: 'land' (Seewind, tagsüber) oder 'sea' (Landwind, nachts).
 */
export function breeze(tLand: number, tSea: number): 'land' | 'sea' | 'none' {
  if (Math.abs(tLand - tSea) < 0.5) return 'none';
  return tLand > tSea ? 'land' : 'sea';
}

/* ------------------------------------------------------------------ */
/* Verbundene Gefäße, Wasserturm                                       */
/* ------------------------------------------------------------------ */

/**
 * Hydrostatisches Paradoxon: Der Druck am Boden hängt nur von der Füllhöhe ab,
 * nicht von der Form des Gefäßes. Liefert Bodendruck (Pa, ohne Luftdruck) und
 * die Kraft auf eine Bodenfläche A (m²).
 */
export function bottomPressure(rho: number, h: number, A: number, g = G): { p: number; F: number } {
  const p = rho * g * h;
  return { p, F: p * A };
}

/**
 * Wasserturm: Wasserspiegel in der Höhe H (m). Ein Hahn in der Höhe z hat den
 * Überdruck ρ · g · (H − z); liegt er höher als der Wasserspiegel, kommt kein Wasser.
 */
export function tapPressure(H: number, z: number, rho = 1000, g = G): number {
  return Math.max(0, rho * g * (H - z));
}

/**
 * Ausflussgeschwindigkeit aus einem Hahn (Torricelli, ohne Reibung):
 * v = √(2 · g · Δh). Für die Animation der Wasserstrahlen.
 */
export function outflowSpeed(dh: number, g = G): number {
  return dh > 0 ? Math.sqrt(2 * g * dh) : 0;
}

/* ------------------------------------------------------------------ */
/* Druck messen                                                        */
/* ------------------------------------------------------------------ */

/** Höhe einer Flüssigkeitssäule (m), die dem Luftdruck p (hPa) das Gleichgewicht hält. */
export function barometerHeight(pHpa: number, rho: number, g = G): number {
  return (pHpa * 100) / (rho * g);
}

/**
 * Magdeburger Halbkugeln (Radius r in m): Kraft, die man zum Trennen braucht,
 * wenn innen der Druck pIn und außen pOut (beide hPa) herrscht.
 * Maßgeblich ist die Querschnittsfläche π · r².
 */
export function hemisphereForce(r: number, pIn: number, pOut = P0): number {
  return Math.max(0, (pOut - pIn) * 100 * Math.PI * r * r);
}

/* ------------------------------------------------------------------ */
/* Hydraulische Presse: Pumpen                                         */
/* ------------------------------------------------------------------ */

/**
 * Nach n Hüben (je Hub s₁ in m am kleinen Kolben) ist der große Kolben um
 * n · s₁ · A₁ / A₂ gestiegen. Die Arbeit am kleinen Kolben ist gleich der
 * Arbeit am großen (ohne Reibung): F₁ · n · s₁ = F₂ · s₂.
 */
export function pumpLift(n: number, s1: number, A1: number, A2: number): number {
  return (n * s1 * A1) / A2;
}

/* ------------------------------------------------------------------ */
/* Übung                                                               */
/* ------------------------------------------------------------------ */

export type Loc = { de: string; en: string };
/**
 * Strohhalm: Wie hoch drückt der äußere Luftdruck eine Flüssigkeit, wenn im
 * Mund ein Unterdruck von dpHpa (hPa) herrscht? h = Δp / (ρ · g) in m.
 */
export function strawHeight(dpHpa: number, rho: number, g = G): number {
  return (dpHpa * 100) / (rho * g);
}

/** 1 mmHg in Pa */
export const MMHG = 133.322;
/** Dichte von Blut in kg/m³ */
export const BLOOD_RHO = 1060;

/**
 * Blutdruck an einer Stelle, die dh (m) unter dem Herzen liegt (negativ: über dem
 * Herzen), in mmHg: p = p_Herz + ρ · g · dh.
 */
export function bloodPressureAt(pHeartMmHg: number, dh: number, g = G): number {
  return pHeartMmHg + (BLOOD_RHO * g * dh) / MMHG;
}

export type TaskKind = 'pFA' | 'Fpa' | 'hyd' | 'depth' | 'depthInv' | 'unit' | 'baro' | 'paradox' | 'hemi' | 'straw' | 'blood';

export interface PressureTask {
  kind: TaskKind;
  text: Loc;
  answer: number;
  unit: string;
  tol: number;
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

const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;
const de = (x: number, d = 2) => round(x, d).toString().replace('.', ',');
const en = (x: number, d = 2) => round(x, d).toString();

/** Übungsaufgabe Nummer n; die Arten wechseln reihum, Zahlen zufällig, aber fest je Nummer. */
export function makeTask(n: number, g = G): PressureTask {
  const r = rng(n * 131 + 7);
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)]!;
  const kinds: TaskKind[] = ['pFA', 'depth', 'hyd', 'unit', 'Fpa', 'depthInv', 'paradox', 'baro', 'hemi', 'straw', 'blood'];
  const kind = kinds[(n - 1) % kinds.length]!;
  if (kind === 'pFA') {
    const F = pick([600, 700, 800, 900]);
    const A = pick([0.02, 0.03, 0.04, 0.2, 0.3]);
    const p = F / A;
    return {
      kind,
      text: {
        de: `Eine Person (Gewichtskraft ${de(F)} N) steht auf einer Fläche von ${de(A)} m². Wie groß ist der Druck in Pa?`,
        en: `A person (weight ${en(F)} N) stands on an area of ${en(A)} m². What is the pressure in Pa?`,
      },
      answer: p,
      unit: 'Pa',
      tol: 0.02,
      solution: { de: `p = F : A = ${de(F)} N : ${de(A)} m² = ${de(p, 0)} Pa`, en: `p = F / A = ${en(F)} N / ${en(A)} m² = ${en(p, 0)} Pa` },
    };
  }
  if (kind === 'Fpa') {
    const p = pick([2, 2.5, 3, 6, 8]);
    const A = pick([0.01, 0.02, 0.05]);
    const F = p * 1e5 * A;
    return {
      kind,
      text: {
        de: `In einem Zylinder herrscht ein Überdruck von ${de(p)} bar. Welche Kraft (in N) wirkt auf einen Kolben mit ${de(A)} m²? (1 bar = 100 000 Pa)`,
        en: `A cylinder has an overpressure of ${en(p)} bar. What force (in N) acts on a piston of ${en(A)} m²? (1 bar = 100 000 Pa)`,
      },
      answer: F,
      unit: 'N',
      tol: 0.02,
      solution: { de: `F = p · A = ${de(p * 1e5, 0)} Pa · ${de(A)} m² = ${de(F, 0)} N`, en: `F = p · A = ${en(p * 1e5, 0)} Pa · ${en(A)} m² = ${en(F, 0)} N` },
    };
  }
  if (kind === 'hyd') {
    const F1 = pick([50, 100, 150, 200]);
    const A1 = pick([2, 4, 5]);
    const k = pick([20, 25, 40, 50]);
    const A2 = A1 * k;
    const F2 = F1 * k;
    return {
      kind,
      text: {
        de: `Hydraulische Presse: kleiner Kolben ${de(A1)} cm², großer Kolben ${de(A2)} cm². Am kleinen Kolben drückt man mit ${de(F1)} N. Welche Kraft (in N) wirkt am großen Kolben?`,
        en: `Hydraulic press: small piston ${en(A1)} cm², large piston ${en(A2)} cm². You push the small piston with ${en(F1)} N. What force (in N) acts on the large piston?`,
      },
      answer: F2,
      unit: 'N',
      tol: 0.02,
      solution: { de: `Gleicher Druck: F₂ = F₁ · A₂ : A₁ = ${de(F1)} N · ${de(k)} = ${de(F2)} N`, en: `Same pressure: F₂ = F₁ · A₂ / A₁ = ${en(F1)} N · ${en(k)} = ${en(F2)} N` },
    };
  }
  if (kind === 'depth') {
    const h = pick([5, 10, 15, 20, 30]);
    const p = (1000 * g * h) / 1e5;
    return {
      kind,
      text: {
        de: `Wie groß ist der Schweredruck des Wassers in ${de(h)} m Tiefe, in bar? (ρ = 1000 kg/m³, g = 9,81 m/s², ohne Luftdruck)`,
        en: `What is the water pressure at a depth of ${en(h)} m, in bar? (ρ = 1000 kg/m³, g = 9.81 m/s², without air pressure)`,
      },
      answer: p,
      unit: 'bar',
      tol: 0.02,
      solution: { de: `p = ρ · g · h = 1000 · 9,81 · ${de(h)} Pa ≈ ${de(p * 1e5, 0)} Pa ≈ ${de(p)} bar`, en: `p = ρ · g · h = 1000 · 9.81 · ${en(h)} Pa ≈ ${en(p * 1e5, 0)} Pa ≈ ${en(p)} bar` },
    };
  }
  if (kind === 'depthInv') {
    const pTot = pick([2, 3, 4, 5]);
    const h = ((pTot - 1) * 1e5) / (1000 * g);
    return {
      kind,
      text: {
        de: `Ein Taucher misst insgesamt ${de(pTot)} bar (Luftdruck 1 bar eingerechnet). In welcher Tiefe (in m) ist er ungefähr? (ρ = 1000 kg/m³, g = 9,81 m/s²)`,
        en: `A diver measures ${en(pTot)} bar in total (including 1 bar of air pressure). At about what depth (in m) is the diver? (ρ = 1000 kg/m³, g = 9.81 m/s²)`,
      },
      answer: h,
      unit: 'm',
      tol: 0.03,
      solution: {
        de: `Wasserdruck ${de(pTot - 1)} bar = ${de((pTot - 1) * 1e5, 0)} Pa; h = p : (ρ · g) ≈ ${de(h, 1)} m`,
        en: `Water pressure ${en(pTot - 1)} bar = ${en((pTot - 1) * 1e5, 0)} Pa; h = p / (ρ · g) ≈ ${en(h, 1)} m`,
      },
    };
  }
  if (kind === 'unit') {
    const v = pick([1013, 950, 1020, 870, 300]);
    return {
      kind,
      text: { de: `Rechne ${de(v)} hPa in bar um.`, en: `Convert ${en(v)} hPa to bar.` },
      answer: v / 1000,
      unit: 'bar',
      tol: 0.005,
      solution: {
        de: `1 hPa = 100 Pa und 1 bar = 100 000 Pa = 1000 hPa, also ${de(v)} hPa = ${de(v / 1000, 3)} bar`,
        en: `1 hPa = 100 Pa and 1 bar = 100 000 Pa = 1000 hPa, so ${en(v)} hPa = ${en(v / 1000, 3)} bar`,
      },
    };
  }
  if (kind === 'paradox') {
    const h = pick([0.2, 0.3, 0.5]);
    const p = 1000 * g * h;
    return {
      kind,
      text: {
        de: `Drei Gefäße – eine schmale Röhre, ein Eimer und eine breite Schüssel – sind alle ${de(h * 100, 0)} cm hoch mit Wasser gefüllt. Wie groß ist der Wasserdruck am Boden des Eimers in Pa? (g = 9,81 m/s²)`,
        en: `Three vessels – a narrow tube, a bucket and a wide bowl – are all filled with water to ${en(h * 100, 0)} cm. What is the water pressure at the bottom of the bucket, in Pa? (g = 9.81 m/s²)`,
      },
      answer: p,
      unit: 'Pa',
      tol: 0.02,
      solution: {
        de: `Nur die Höhe zählt (hydrostatisches Paradoxon): p = ρ · g · h = 1000 · 9,81 · ${de(h)} Pa ≈ ${de(p, 0)} Pa – in allen drei Gefäßen gleich.`,
        en: `Only the height counts (hydrostatic paradox): p = ρ · g · h = 1000 · 9.81 · ${en(h)} Pa ≈ ${en(p, 0)} Pa – the same in all three vessels.`,
      },
    };
  }
  if (kind === 'baro') {
    const pa = pick([1013, 1000, 980, 1030]);
    const h = barometerHeight(pa, 1000, g);
    return {
      kind,
      text: {
        de: `Wie hoch (in m) wäre die Säule eines Wasserbarometers bei ${de(pa)} hPa Luftdruck? (ρ = 1000 kg/m³, g = 9,81 m/s²)`,
        en: `How tall (in m) would the column of a water barometer be at an air pressure of ${en(pa)} hPa? (ρ = 1000 kg/m³, g = 9.81 m/s²)`,
      },
      answer: h,
      unit: 'm',
      tol: 0.02,
      solution: {
        de: `h = p : (ρ · g) = ${de(pa * 100, 0)} Pa : (1000 · 9,81) ≈ ${de(h, 2)} m – darum nimmt man Quecksilber.`,
        en: `h = p / (ρ · g) = ${en(pa * 100, 0)} Pa / (1000 · 9.81) ≈ ${en(h, 2)} m – that is why mercury is used.`,
      },
    };
  }
  if (kind === 'straw') {
    const dp = pick([20, 40, 50, 80, 100]);
    const h = strawHeight(dp, 1000, g) * 100;
    return {
      kind,
      text: {
        de: `Beim Saugen am Strohhalm sinkt der Druck im Mund um ${dp} hPa unter den Luftdruck. Wie hoch (in cm) drückt der Luftdruck das Wasser im Halm höchstens?`,
        en: `When sucking on a straw the pressure in the mouth drops ${dp} hPa below air pressure. How high (in cm) can the air pressure push the water up the straw at most?`,
      },
      answer: h,
      unit: 'cm',
      tol: 0.02,
      solution: {
        de: `h = Δp : (ρ · g) = ${dp * 100} Pa : (1000 · 9,81) ≈ ${de(h / 100, 2)} m ≈ ${de(h, 0)} cm`,
        en: `h = Δp / (ρ · g) = ${dp * 100} Pa / (1000 · 9.81) ≈ ${en(h / 100, 2)} m ≈ ${en(h, 0)} cm`,
      },
    };
  }
  if (kind === 'blood') {
    const ph = pick([100, 110, 120, 130]);
    const dh = pick([1, 1.2, 1.3]);
    const pf = bloodPressureAt(ph, dh, g);
    return {
      kind,
      text: {
        de: `Am Herzen beträgt der Blutdruck ${ph} mmHg. Die Füße liegen beim Stehen ${de(dh, 1)} m tiefer. Wie groß ist der Blutdruck dort (in mmHg)? Blut: ρ = 1060 kg/m³, 1 mmHg ≈ 133 Pa.`,
        en: `At the heart the blood pressure is ${ph} mmHg. When standing, the feet are ${en(dh, 1)} m lower. What is the blood pressure there (in mmHg)? Blood: ρ = 1060 kg/m³, 1 mmHg ≈ 133 Pa.`,
      },
      answer: pf,
      unit: 'mmHg',
      tol: 0.02,
      solution: {
        de: `Δp = ρ · g · h = 1060 · 9,81 · ${de(dh, 1)} Pa ≈ ${de(BLOOD_RHO * g * dh, 0)} Pa ≈ ${de(pf - ph, 0)} mmHg; p ≈ ${de(pf, 0)} mmHg`,
        en: `Δp = ρ · g · h = 1060 · 9.81 · ${en(dh, 1)} Pa ≈ ${en(BLOOD_RHO * g * dh, 0)} Pa ≈ ${en(pf - ph, 0)} mmHg; p ≈ ${en(pf, 0)} mmHg`,
      },
    };
  }
  const rr = pick([0.1, 0.2, 0.25]);
  const F = hemisphereForce(rr, 0, 1000);
  return {
    kind: 'hemi',
    text: {
      de: `Zwei Halbkugeln mit ${de(rr * 100, 0)} cm Radius werden luftleer gepumpt. Mit welcher Kraft (in N) drückt der Luftdruck (1000 hPa) sie zusammen? Maßgeblich ist die Kreisfläche π · r².`,
      en: `Two hemispheres of radius ${en(rr * 100, 0)} cm are pumped empty. With what force (in N) does the air pressure (1000 hPa) press them together? The circle area π · r² counts.`,
    },
    answer: F,
    unit: 'N',
    tol: 0.02,
    solution: {
      de: `A = π · (${de(rr)} m)² ≈ ${de(Math.PI * rr * rr, 4)} m²; F = p · A = 100 000 Pa · A ≈ ${de(F, 0)} N`,
      en: `A = π · (${en(rr)} m)² ≈ ${en(Math.PI * rr * rr, 4)} m²; F = p · A = 100 000 Pa · A ≈ ${en(F, 0)} N`,
    },
  };
}

/** Liest eine Zahl mit Komma oder Punkt (Tausenderpunkte im Deutschen werden nicht erkannt). */
export function parseAnswer(input: string): number | null {
  const s = input
    .trim()
    .replace(/\s/g, '')
    .replace('−', '-')
    .replace(',', '.')
    .replace(/[a-zA-Z/²³]+$/, '');
  if (!s || !/^-?\d*\.?\d+(e-?\d+)?$/.test(s)) return null;
  return Number(s);
}

export function checkTask(task: PressureTask, input: string): boolean | null {
  const x = parseAnswer(input);
  if (x === null) return null;
  return Math.abs(x - task.answer) <= task.tol * Math.abs(task.answer) + 1e-9;
}
