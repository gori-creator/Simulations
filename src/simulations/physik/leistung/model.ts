/**
 * Mechanische Arbeit und Leistung beim Treppensteigen und Vergleich mit
 * typischen Leistungen von Geräten und Maschinen.
 */

export const G = 9.81;
/** 1 PS in Watt. */
export const PS = 735.5;

/** Hubarbeit W = m·g·h in J. */
export function work(m: number, h: number): number {
  return m * G * h;
}

/** Leistung P = W/t in W. */
export function power(m: number, h: number, t: number): number {
  return work(m, h) / t;
}

export interface Reference {
  id: string;
  /** Leistung in W. */
  P: number;
  de: string;
  en: string;
}

/** Typische Leistungen zum Vergleich (gerundete Richtwerte). */
export const REFERENCES: readonly Reference[] = [
  { id: 'handy', P: 5, de: 'Handy laden', en: 'charging a phone' },
  { id: 'led', P: 10, de: 'LED-Lampe', en: 'LED lamp' },
  { id: 'dauer', P: 100, de: 'Mensch, stundenlang', en: 'human, for hours' },
  { id: 'pferd', P: 736, de: 'Pferd (1 PS)', en: 'horse (1 hp)' },
  { id: 'koch', P: 2000, de: 'Wasserkocher', en: 'kettle' },
  { id: 'auto', P: 100000, de: 'Auto', en: 'car' },
  { id: 'ice', P: 8000000, de: 'ICE-Zug', en: 'high-speed train' },
];

/* ------------------------------------------------------------------ */
/* Heben mit einem Motor                                               */
/* ------------------------------------------------------------------ */

/** Zeit in s, die ein Motor der Leistung P (W) braucht, um m (kg) um h (m) zu heben. */
export function liftTime(m: number, h: number, P: number): number {
  return work(m, h) / P;
}

/** Hubgeschwindigkeit v = P/(m·g) in m/s (aus P = F·v). */
export function liftSpeed(m: number, P: number): number {
  return P / (m * G);
}

/* ------------------------------------------------------------------ */
/* Energie im Haushalt                                                 */
/* ------------------------------------------------------------------ */

export type DeviceId = 'handy' | 'laptop' | 'tv' | 'staub' | 'kocher' | 'wasch';

export interface Device {
  id: DeviceId;
  P: number;
  de: string;
  en: string;
}

export const DEVICES: Record<DeviceId, Device> = {
  handy: { id: 'handy', P: 15, de: 'Handy laden', en: 'charging a phone' },
  laptop: { id: 'laptop', P: 50, de: 'Laptop', en: 'laptop' },
  tv: { id: 'tv', P: 100, de: 'Fernseher', en: 'TV' },
  staub: { id: 'staub', P: 700, de: 'Staubsauger', en: 'vacuum cleaner' },
  kocher: { id: 'kocher', P: 2000, de: 'Wasserkocher', en: 'kettle' },
  wasch: { id: 'wasch', P: 2200, de: 'Waschmaschine (Heizen)', en: 'washing machine (heating)' },
};

/** Strompreis in € pro kWh (Richtwert). */
export const PRICE_KWH = 0.35;
/** Höhe eines Stockwerks in m. */
export const FLOOR_H = 3;

/** Energie E = P·t in J (t in Minuten). */
export function energyJ(P: number, minutes: number): number {
  return P * minutes * 60;
}

/** Energie in kWh. */
export function toKWh(J: number): number {
  return J / 3.6e6;
}

/** Wie viele Stockwerke müsste eine Person der Masse m hochsteigen, um die Energie E aufzubringen? */
export function floorsFor(J: number, m: number): number {
  return J / work(m, FLOOR_H);
}

/* ------------------------------------------------------------------ */
/* Wasserkraft                                                         */
/* ------------------------------------------------------------------ */

/** Dichte von Wasser in kg/m³. */
export const RHO_WATER = 1000;
/** Wirkungsgrad von Turbine und Generator (Richtwert). */
export const ETA_HYDRO = 0.85;
/** Mittlere Dauerleistung eines Haushalts in W (rund 3500 kWh im Jahr). */
export const HOUSEHOLD_W = 400;

/** Elektrische Leistung eines Wasserkraftwerks: P = η·ρ·Q·g·h (Q in m³/s). */
export function hydroPower(Q: number, h: number, eta = ETA_HYDRO): number {
  return eta * RHO_WATER * Q * G * h;
}

/* ------------------------------------------------------------------ */
/* Übung                                                               */
/* ------------------------------------------------------------------ */

export type Loc = { de: string; en: string };
export type TaskKind = 'work' | 'power' | 'time' | 'ps' | 'cost' | 'compare' | 'eta' | 'fv';

export interface PowerTask {
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

const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;
/** Zahl mit Dezimalkomma (de) bzw. Punkt (en), ohne Tausendertrennzeichen. */
export function numText(x: number, lang: 'de' | 'en', d = 2): string {
  const s = String(round(x, d));
  return lang === 'de' ? s.replace('.', ',') : s;
}

/** Übungsaufgabe Nummer n (gleiche Nummer → gleiche Aufgabe). */
export function makeTask(n: number): PowerTask {
  const r = rng(n * 89 + 7);
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)]!;
  const kinds: TaskKind[] = ['work', 'power', 'time', 'ps', 'cost', 'compare', 'eta', 'fv'];
  const kind = kinds[(n - 1) % kinds.length]!;
  const nt = numText;
  if (kind === 'work') {
    const m = pick([40, 50, 60, 70, 80]);
    const h = pick([3, 4, 5, 6, 10]);
    const W = work(m, h);
    return {
      kind,
      text: {
        de: `Eine Person (${m} kg) steigt ${h} m hoch. Wie groß ist die Hubarbeit in J? (g = 9,81 N/kg)`,
        en: `A person (${m} kg) climbs ${h} m. How much work is done lifting, in J? (g = 9.81 N/kg)`,
      },
      answer: W,
      tol: 0.02,
      choices: null,
      solution: { de: `W = m·g·h = ${m} kg · 9,81 N/kg · ${h} m ≈ ${nt(W, 'de', 0)} J`, en: `W = m·g·h = ${m} kg · 9.81 N/kg · ${h} m ≈ ${nt(W, 'en', 0)} J` },
    };
  }
  if (kind === 'power') {
    const W = pick([1200, 1800, 2400, 3000, 6000]);
    const t = pick([4, 5, 6, 8, 10, 12]);
    const P = W / t;
    return {
      kind,
      text: {
        de: `Beim Treppenlaufen werden ${W} J Arbeit in ${t} s verrichtet. Wie groß ist die Leistung in W?`,
        en: `Running up the stairs takes ${W} J of work in ${t} s. What is the power in W?`,
      },
      answer: P,
      tol: 0.02,
      choices: null,
      solution: { de: `P = W : t = ${W} J : ${t} s = ${nt(P, 'de', 1)} W`, en: `P = W / t = ${W} J / ${t} s = ${nt(P, 'en', 1)} W` },
    };
  }
  if (kind === 'time') {
    const m = pick([200, 500, 800, 1000]);
    const h = pick([5, 10, 20]);
    const P = pick([2000, 5000, 10000]);
    const t = liftTime(m, h, P);
    return {
      kind,
      text: {
        de: `Ein Kran mit ${P} W Motorleistung hebt ${m} kg um ${h} m. Wie viele Sekunden braucht er mindestens? (g = 9,81 N/kg)`,
        en: `A crane with a ${P} W motor lifts ${m} kg by ${h} m. How many seconds does it take at least? (g = 9.81 N/kg)`,
      },
      answer: t,
      tol: 0.03,
      choices: null,
      solution: { de: `W = ${nt(work(m, h), 'de', 0)} J; t = W : P ≈ ${nt(t, 'de', 1)} s`, en: `W = ${nt(work(m, h), 'en', 0)} J; t = W / P ≈ ${nt(t, 'en', 1)} s` },
    };
  }
  if (kind === 'ps') {
    const P = pick([7355, 14710, 36775, 73550, 110325]);
    const ps = P / PS;
    return {
      kind,
      text: {
        de: `Ein Motor leistet ${nt(P / 1000, 'de', 3)} kW. Wie viel PS sind das? (1 PS ≈ 735,5 W)`,
        en: `An engine delivers ${nt(P / 1000, 'en', 3)} kW. How many horsepower is that? (1 hp ≈ 735.5 W)`,
      },
      answer: ps,
      tol: 0.02,
      choices: null,
      solution: { de: `${P} W : 735,5 W ≈ ${nt(ps, 'de', 0)} PS`, en: `${P} W / 735.5 W ≈ ${nt(ps, 'en', 0)} hp` },
    };
  }
  if (kind === 'cost') {
    const d = pick(['kocher', 'staub', 'tv', 'wasch'] as DeviceId[]);
    const min = pick([30, 60, 90, 120]);
    const kWh = toKWh(energyJ(DEVICES[d].P, min));
    const c = kWh * PRICE_KWH;
    return {
      kind,
      text: {
        de: `${DEVICES[d].de} (${DEVICES[d].P} W) läuft ${min} Minuten. Was kostet das in Euro bei 0,35 € pro kWh?`,
        en: `${DEVICES[d].en[0]!.toUpperCase()}${DEVICES[d].en.slice(1)} (${DEVICES[d].P} W) runs for ${min} minutes. What does it cost in euros at €0.35 per kWh?`,
      },
      answer: c,
      tol: 0.04,
      choices: null,
      solution: {
        de: `E = ${nt(DEVICES[d].P / 1000, 'de', 1)} kW · ${nt(min / 60, 'de', 2)} h = ${nt(kWh, 'de', 2)} kWh; Kosten ≈ ${nt(c, 'de', 2)} €`,
        en: `E = ${nt(DEVICES[d].P / 1000, 'en', 1)} kW · ${nt(min / 60, 'en', 2)} h = ${nt(kWh, 'en', 2)} kWh; cost ≈ €${nt(c, 'en', 2)}`,
      },
    };
  }
  if (kind === 'eta') {
    const d = pick(['gluehlampe', 'led', 'motor', 'auto'] as EffId[]);
    const Pin = pick([40, 60, 100, 1000, 2000].filter((x) => (d === 'gluehlampe' || d === 'led' ? x <= 100 : x >= 1000)));
    const use = EFFICIENCY[d].eta * Pin;
    return {
      kind,
      text: {
        de: `${EFFICIENCY[d].de} nimmt ${Pin} W auf und hat einen Wirkungsgrad von ${nt(EFFICIENCY[d].eta * 100, 'de', 0)} %. Wie viel Watt werden genutzt?`,
        en: `${EFFICIENCY[d].en[0]!.toUpperCase()}${EFFICIENCY[d].en.slice(1)} takes in ${Pin} W and has an efficiency of ${nt(EFFICIENCY[d].eta * 100, 'en', 0)} %. How many watts are put to use?`,
      },
      answer: use,
      tol: 0.02,
      choices: null,
      solution: {
        de: `P_nutz = η · P_auf = ${nt(EFFICIENCY[d].eta, 'de')} · ${Pin} W = ${nt(use, 'de', 1)} W; der Rest wird zu Wärme.`,
        en: `P_useful = η · P_in = ${nt(EFFICIENCY[d].eta, 'en')} · ${Pin} W = ${nt(use, 'en', 1)} W; the rest becomes heat.`,
      },
    };
  }
  if (kind === 'fv') {
    const F = pick([20, 30, 40, 50]);
    const vk = pick([18, 27, 36]);
    const P = F * (vk / 3.6);
    return {
      kind,
      text: {
        de: `Eine Radfahrerin muss gegen eine Kraft von ${F} N antreten und fährt ${vk} km/h. Welche Leistung in W bringt sie auf? (P = F · v)`,
        en: `A cyclist has to push against a force of ${F} N and rides at ${vk} km/h. What power in W does she deliver? (P = F · v)`,
      },
      answer: P,
      tol: 0.02,
      choices: null,
      solution: {
        de: `v = ${vk} km/h : 3,6 = ${nt(vk / 3.6, 'de', 1)} m/s; P = ${F} N · ${nt(vk / 3.6, 'de', 1)} m/s = ${nt(P, 'de', 0)} W`,
        en: `v = ${vk} km/h / 3.6 = ${nt(vk / 3.6, 'en', 1)} m/s; P = ${F} N · ${nt(vk / 3.6, 'en', 1)} m/s = ${nt(P, 'en', 0)} W`,
      },
    };
  }
  // compare: Wer ist leistungsstärker?
  const mA = pick([45, 50, 60]);
  const tA = pick([6, 8, 10]);
  const mB = pick([65, 75, 85]);
  let tB = pick([7, 9, 12, 14]);
  const h = 6;
  if (Math.abs(power(mA, h, tA) - power(mB, h, tB)) < 1) tB += 1;
  const PA = power(mA, h, tA);
  const PB = power(mB, h, tB);
  return {
    kind: 'compare',
    text: {
      de: `Anna (${mA} kg) läuft eine 6 m hohe Treppe in ${tA} s hoch, Ben (${mB} kg) in ${tB} s. Wer hat die größere Leistung?`,
      en: `Anna (${mA} kg) runs up 6 m of stairs in ${tA} s, Ben (${mB} kg) in ${tB} s. Who has the greater power?`,
    },
    answer: PA > PB ? 1 : 2,
    tol: 0,
    choices: [
      { de: 'Anna', en: 'Anna' },
      { de: 'Ben', en: 'Ben' },
    ],
    solution: { de: `Anna: ${nt(PA, 'de', 0)} W, Ben: ${nt(PB, 'de', 0)} W.`, en: `Anna: ${nt(PA, 'en', 0)} W, Ben: ${nt(PB, 'en', 0)} W.` },
  };
}

/** Antwort prüfen: null bei unlesbarer Eingabe. */
export function checkTask(task: PowerTask, input: string): boolean | null {
  const s = input
    .trim()
    .replace(/\s/g, '')
    .replace(',', '.')
    .replace(/[a-zA-Z€]+$/, '');
  if (!/^\d*\.?\d+$/.test(s)) return null;
  const x = Number(s);
  if (task.tol === 0) return x === task.answer;
  // Geldbeträge werden auf Cent gerundet eingegeben
  if (task.kind === 'cost' && Math.abs(x - task.answer) <= 0.0051) return true;
  return Math.abs(x - task.answer) <= task.tol * Math.abs(task.answer) + 1e-9;
}

/* ------------------------------------------------------------------ */
/* Fahrrad: P = F · v                                                  */
/* ------------------------------------------------------------------ */

/** Rollwiderstandsbeiwert, Luftdichte und Stirnfläche · c_w (Richtwerte für ein Stadtrad). */
export const BIKE = { cr: 0.006, rho: 1.2, cda: 0.5 } as const;

/** Kräfte (N) beim Radfahren mit Masse m (kg), Steigung s (in %) und Tempo v (m/s). */
export function bikeForces(m: number, slopePct: number, v: number): { hang: number; roll: number; air: number; total: number } {
  const th = Math.atan(slopePct / 100);
  const hang = m * G * Math.sin(th);
  const roll = BIKE.cr * m * G * Math.cos(th);
  const air = 0.5 * BIKE.rho * BIKE.cda * v * v;
  return { hang, roll, air, total: hang + roll + air };
}

/** Benötigte Leistung (W) am Pedal: P = F · v. */
export function bikePower(m: number, slopePct: number, v: number): number {
  return bikeForces(m, slopePct, v).total * v;
}

/** Höchsttempo (m/s) bei gegebener Leistung (Bisektion). */
export function bikeSpeedFor(P: number, m: number, slopePct: number): number {
  let lo = 0;
  let hi = 30;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (bikePower(m, slopePct, mid) > P) hi = mid;
    else lo = mid;
  }
  return lo;
}

/* ------------------------------------------------------------------ */
/* Wirkungsgrad                                                        */
/* ------------------------------------------------------------------ */

export type EffId = 'gluehlampe' | 'led' | 'motor' | 'auto' | 'kohle' | 'solar' | 'mensch';

/** Typische Wirkungsgrade (Richtwerte) mit Art der Nutzenergie. */
export const EFFICIENCY: Record<EffId, { eta: number; de: string; en: string; useDe: string; useEn: string }> = {
  gluehlampe: { eta: 0.05, de: 'Eine Glühlampe', en: 'an incandescent bulb', useDe: 'Licht', useEn: 'light' },
  led: { eta: 0.4, de: 'Eine LED-Lampe', en: 'an LED lamp', useDe: 'Licht', useEn: 'light' },
  motor: { eta: 0.9, de: 'Ein Elektromotor', en: 'an electric motor', useDe: 'Bewegung', useEn: 'motion' },
  auto: { eta: 0.3, de: 'Ein Benzinmotor', en: 'a petrol engine', useDe: 'Bewegung', useEn: 'motion' },
  kohle: { eta: 0.4, de: 'Ein Kohlekraftwerk', en: 'a coal power plant', useDe: 'Strom', useEn: 'electricity' },
  solar: { eta: 0.2, de: 'Eine Solarzelle', en: 'a solar cell', useDe: 'Strom', useEn: 'electricity' },
  mensch: { eta: 0.25, de: 'Der Mensch (Muskeln)', en: 'the human body (muscles)', useDe: 'Bewegung', useEn: 'motion' },
};

/** Nutzleistung und Verlust (W) bei Eingangsleistung P_in. */
export function efficiencySplit(id: EffId, Pin: number): { use: number; loss: number } {
  const use = EFFICIENCY[id].eta * Pin;
  return { use, loss: Pin - use };
}
