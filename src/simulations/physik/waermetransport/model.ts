/**
 * Wärmetransport: Wärmeleitung in einem Stab, Wärmeströmung (Konvektion),
 * Wärmestrahlung (Stefan-Boltzmann) und Wärmedämmung einer Hauswand (U-Wert).
 */

export type MaterialId = 'copper' | 'aluminium' | 'iron' | 'glass' | 'brick' | 'wood' | 'polystyrene' | 'air';

/** Wärmeleitfähigkeit λ in W/(m·K), Dichte ρ in kg/m³, spezifische Wärmekapazität c in J/(kg·K) (gerundete Tabellenwerte). */
export const MATERIALS: Record<MaterialId, { lambda: number; rho: number; c: number }> = {
  copper: { lambda: 390, rho: 8900, c: 385 },
  aluminium: { lambda: 220, rho: 2700, c: 900 },
  iron: { lambda: 60, rho: 7900, c: 450 },
  glass: { lambda: 1, rho: 2500, c: 800 },
  brick: { lambda: 0.8, rho: 1800, c: 840 },
  wood: { lambda: 0.13, rho: 600, c: 1600 },
  polystyrene: { lambda: 0.035, rho: 20, c: 1400 },
  air: { lambda: 0.025, rho: 1.2, c: 1005 },
};

/** Temperaturleitfähigkeit a = λ / (ρ c) in m²/s. */
export function diffusivity(m: MaterialId): number {
  const x = MATERIALS[m];
  return x.lambda / (x.rho * x.c);
}

/** Wärmestrom durch eine Schicht im Gleichgewicht: P = λ · A · ΔT / d (W). */
export function conductionPower(lambda: number, area: number, dT: number, d: number): number {
  return (lambda * area * dT) / d;
}

/**
 * Ein Zeitschritt der Wärmeleitungsgleichung ∂T/∂t = a ∂²T/∂x² (explizit, Enden fest).
 * `T` wird überschrieben. Für Stabilität wird intern in Teilschritte zerlegt.
 */
export function conductionStep(T: number[], a: number, dx: number, dt: number): void {
  const n = T.length;
  const maxDt = (0.45 * dx * dx) / a;
  const steps = Math.max(1, Math.ceil(dt / maxDt));
  const h = dt / steps;
  const k = (a * h) / (dx * dx);
  const next = T.slice();
  for (let s = 0; s < steps; s++) {
    for (let i = 1; i < n - 1; i++) next[i] = T[i]! + k * (T[i - 1]! - 2 * T[i]! + T[i + 1]!);
    for (let i = 1; i < n - 1; i++) T[i] = next[i]!;
  }
}

export const SIGMA = 5.670_374e-8;

/** Abgestrahlte Leistung P = ε σ A T⁴ (T in K). */
export function radiatedPower(emissivity: number, area: number, tempK: number): number {
  return emissivity * SIGMA * area * tempK ** 4;
}

/** Netto-Strahlungsleistung zwischen Körper (T) und Umgebung (Tu): ε σ A (T⁴ − Tu⁴). */
export function netRadiation(emissivity: number, area: number, tempK: number, envK: number): number {
  return emissivity * SIGMA * area * (tempK ** 4 - envK ** 4);
}

/** Wärmeübergangswiderstände innen/außen in m²K/W (Bauphysik, Richtwerte). */
export const R_SI = 0.13;
export const R_SE = 0.04;

export interface Layer {
  lambda: number;
  /** Dicke in m */
  d: number;
}

/** U-Wert einer Wand aus Schichten: U = 1 / (R_si + Σ d/λ + R_se) in W/(m²·K). */
export function uValue(layers: readonly Layer[]): number {
  const r = R_SI + R_SE + layers.reduce((s, l) => s + (l.d > 0 ? l.d / l.lambda : 0), 0);
  return 1 / r;
}

/** Temperaturen an den Schichtgrenzen von innen nach außen (Gleichgewicht). */
export function wallTemperatures(layers: readonly Layer[], tIn: number, tOut: number): number[] {
  const u = uValue(layers);
  const q = u * (tIn - tOut);
  const out = [tIn - q * R_SI];
  for (const l of layers) out.push(out[out.length - 1]! - (l.d > 0 ? (q * l.d) / l.lambda : 0));
  return out;
}

/* ------------------------------------------------------------------ */
/* Abkühlen: Becher, Deckel, Thermoskanne                              */
/* ------------------------------------------------------------------ */

export type ContainerId = 'becher' | 'deckel' | 'doppel' | 'thermos';

/**
 * Abkühlkonstanten k in 1/min (Newton’sches Abkühlungsgesetz) und die
 * ungefähren Anteile der drei Transportarten am Wärmeverlust (Richtwerte
 * für einen Becher Tee mit etwa 0,3 l, Raum 20 °C). „Strömung“ schließt die
 * Verdunstung an der offenen Oberfläche mit ein.
 */
export const CONTAINERS: Record<ContainerId, { k: number; share: { leitung: number; stroemung: number; strahlung: number } }> = {
  becher: { k: 0.024, share: { leitung: 0.25, stroemung: 0.55, strahlung: 0.2 } },
  deckel: { k: 0.014, share: { leitung: 0.4, stroemung: 0.3, strahlung: 0.3 } },
  doppel: { k: 0.008, share: { leitung: 0.3, stroemung: 0.35, strahlung: 0.35 } },
  thermos: { k: 0.0006, share: { leitung: 0.55, stroemung: 0.1, strahlung: 0.35 } },
};

/** Temperatur nach t Minuten: T(t) = T_U + (T₀ − T_U) · e^(−k · t). */
export function cooling(T0: number, Tenv: number, k: number, tMin: number): number {
  return Tenv + (T0 - Tenv) * Math.exp(-k * tMin);
}

/** Zeit in Minuten, bis die Temperatur von T₀ auf T gesunken ist (T zwischen T_U und T₀). */
export function coolingTime(T0: number, Tenv: number, k: number, T: number): number {
  if (T >= T0) return 0;
  if (T <= Tenv) return Infinity;
  return Math.log((T0 - Tenv) / (T - Tenv)) / k;
}

/* ------------------------------------------------------------------ */
/* Fenster                                                             */
/* ------------------------------------------------------------------ */

export type WindowId = 'einfach' | 'doppel' | 'waerme' | 'dreifach';

/** U-Werte von Fenstern in W/(m²·K) (Richtwerte). */
export const WINDOWS: Record<WindowId, number> = { einfach: 5.8, doppel: 2.8, waerme: 1.3, dreifach: 0.7 };

/** Wärmeverlust P = U · A · ΔT in W. */
export function heatLoss(U: number, A: number, dT: number): number {
  return U * A * dT;
}

/** Energie in kWh für eine Leistung P (W) über eine Zahl von Stunden. */
export function energyKWh(P: number, hours: number): number {
  return (P * hours) / 1000;
}

/* ------------------------------------------------------------------ */
/* Übung                                                               */
/* ------------------------------------------------------------------ */

export type Loc = { de: string; en: string };
/* ---------- Mensch: Kleidung und Wind ---------- */

/** Hautfläche eines Erwachsenen (m²) und mittlere Hauttemperatur (°C) */
export const BODY_AREA = 1.8;
export const SKIN_T = 33;
/** Wärmedämmung von 1 clo (m²·K/W) */
export const CLO = 0.155;

/** Wärmeübergang an der Luft (W/(m²·K)): Strahlung etwa 4,7, Strömung je nach Wind. */
export function airTransfer(windMs: number): number {
  return 4.7 + Math.max(3, 8.3 * Math.sqrt(Math.max(0, windMs)));
}

/** Wärmeabgabe des Körpers in W (ohne Schwitzen): P = A · ΔT / (R_Kleidung + R_Luft). */
export function bodyLoss(clo: number, airT: number, windMs: number): number {
  return (BODY_AREA * (SKIN_T - airT)) / (clo * CLO + 1 / airTransfer(windMs));
}

/** Wärme, die der Körper selbst erzeugt (W) */
export const BODY_MAKES: Record<'ruhe' | 'gehen', number> = { ruhe: 100, gehen: 250 };

/* ---------- Sonnenkollektor ---------- */

/** Wirkungsgrad eines Flachkollektors: η = α · τ − U · (T_K − T_L) / G, nicht unter 0. */
export function collectorEfficiency(G: number, tColl: number, tAir: number, glass: boolean, black: boolean): number {
  const alpha = black ? 0.95 : 0.3;
  const tau = glass ? 0.9 : 1;
  const U = glass ? 4 : 12;
  return Math.max(0, alpha * tau - (U * (tColl - tAir)) / G);
}

/** Kollektorfläche in m² */
export const COLLECTOR_AREA = 2;

export type TaskKind = 'which' | 'cond' | 'loss' | 'rad4' | 'kwh' | 'which2' | 'window' | 'cool' | 'body' | 'solar';

export interface HeatTask {
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

/** Situationen zum Zuordnen: 1 = Leitung, 2 = Strömung, 3 = Strahlung. */
const SITUATIONS: { de: string; en: string; kind: 1 | 2 | 3 }[] = [
  { de: 'Ein Metalllöffel im heißen Tee wird am Griff warm.', en: 'A metal spoon in hot tea gets warm at the handle.', kind: 1 },
  { de: 'Die Pfanne auf der Herdplatte wird heiß.', en: 'The pan on the hotplate gets hot.', kind: 1 },
  { de: 'Barfuß fühlen sich Fliesen kälter an als ein Teppich.', en: 'Barefoot, tiles feel colder than a carpet.', kind: 1 },
  { de: 'Ein Heizkörper wärmt das ganze Zimmer.', en: 'A radiator warms the whole room.', kind: 2 },
  { de: 'Warme Luft über dem Lagerfeuer steigt nach oben.', en: 'Warm air above a campfire rises.', kind: 2 },
  { de: 'Der Golfstrom bringt warmes Wasser nach Europa.', en: 'The Gulf Stream carries warm water to Europe.', kind: 2 },
  { de: 'Die Sonne wärmt die Erde durch den leeren Weltraum.', en: 'The Sun warms the Earth through empty space.', kind: 3 },
  { de: 'Vor einem Kaminfeuer wird das Gesicht warm, obwohl die Luft kühl ist.', en: 'In front of a fireplace your face gets warm although the air is cool.', kind: 3 },
  { de: 'Ein schwarzes Auto heizt sich in der Sonne stärker auf als ein weißes.', en: 'A black car heats up more in the sun than a white one.', kind: 3 },
];

const KIND_NAME: Record<1 | 2 | 3, Loc> = {
  1: { de: 'Wärmeleitung: Die Wärme wandert durch den Stoff von Teilchen zu Teilchen.', en: 'Conduction: heat passes through the material from particle to particle.' },
  2: { de: 'Wärmeströmung: Ein warmer Stoff (Luft, Wasser) bewegt sich und nimmt die Wärme mit.', en: 'Convection: a warm substance (air, water) moves and carries the heat with it.' },
  3: { de: 'Wärmestrahlung: Die Wärme kommt als Strahlung, auch ohne Stoff dazwischen.', en: 'Radiation: heat arrives as radiation, even with no material in between.' },
};

/** Übungsaufgabe Nummer n; die Arten wechseln reihum, Zahlen zufällig, aber fest je Nummer. */
export function makeTask(n: number): HeatTask {
  const r = rng(n * 173 + 11);
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)]!;
  const kinds: TaskKind[] = ['which', 'cond', 'loss', 'which2', 'rad4', 'kwh', 'window', 'cool', 'body', 'solar'];
  const kind = kinds[(n - 1) % kinds.length]!;
  if (kind === 'which' || kind === 'which2') {
    const it = pick(SITUATIONS);
    return {
      kind,
      text: {
        de: `Welche Art des Wärmetransports ist das? „${it.de}“ (1 = Leitung, 2 = Strömung, 3 = Strahlung)`,
        en: `Which kind of heat transfer is this? “${it.en}” (1 = conduction, 2 = convection, 3 = radiation)`,
      },
      answer: it.kind,
      unit: '',
      tol: 0,
      solution: KIND_NAME[it.kind],
    };
  }
  if (kind === 'cond') {
    const lam = pick([0.8, 1, 0.13, 0.035]);
    const A = pick([1, 2, 5, 10]);
    const d = pick([0.1, 0.2, 0.25]);
    const dT = pick([10, 20, 25]);
    const P = conductionPower(lam, A, dT, d);
    return {
      kind,
      text: {
        de: `Durch eine ${de(d * 100, 0)} cm dicke Schicht (λ = ${de(lam, 3)} W/(m · K), Fläche ${de(A)} m²) fließt Wärme bei ${de(dT)} K Temperaturunterschied. Wie groß ist der Wärmestrom in W?`,
        en: `Heat flows through a layer ${en(d * 100, 0)} cm thick (λ = ${en(lam, 3)} W/(m · K), area ${en(A)} m²) with a temperature difference of ${en(dT)} K. What is the heat flow in W?`,
      },
      answer: P,
      unit: 'W',
      tol: 0.02,
      solution: {
        de: `P = λ · A · ΔT : d = ${de(lam, 3)} · ${de(A)} · ${de(dT)} : ${de(d)} ≈ ${de(P, 1)} W`,
        en: `P = λ · A · ΔT / d = ${en(lam, 3)} · ${en(A)} · ${en(dT)} / ${en(d)} ≈ ${en(P, 1)} W`,
      },
    };
  }
  if (kind === 'loss') {
    const U = pick([0.2, 0.25, 1.4, 1.5]);
    const A = pick([10, 20, 50]);
    const dT = pick([20, 25, 30]);
    const P = heatLoss(U, A, dT);
    return {
      kind,
      text: {
        de: `Eine Wand (${de(A)} m², U = ${de(U)} W/(m² · K)) trennt 20 °C innen von ${de(20 - dT)} °C außen. Wie groß ist der Wärmeverlust in W?`,
        en: `A wall (${en(A)} m², U = ${en(U)} W/(m² · K)) separates 20 °C inside from ${en(20 - dT)} °C outside. What is the heat loss in W?`,
      },
      answer: P,
      unit: 'W',
      tol: 0.02,
      solution: { de: `P = U · A · ΔT = ${de(U)} · ${de(A)} · ${de(dT)} W = ${de(P, 1)} W`, en: `P = U · A · ΔT = ${en(U)} · ${en(A)} · ${en(dT)} W = ${en(P, 1)} W` },
    };
  }
  if (kind === 'rad4') {
    const f = pick([2, 3]);
    return {
      kind,
      text: {
        de: `Ein Körper wird von 300 K auf ${300 * f} K erhitzt. Um welchen Faktor steigt die abgestrahlte Leistung?`,
        en: `A body is heated from 300 K to ${300 * f} K. By what factor does the radiated power increase?`,
      },
      answer: f ** 4,
      unit: '',
      tol: 0.001,
      solution: {
        de: `P ~ T⁴: (${f})⁴ = ${f ** 4} – die ${f}-fache Temperatur in Kelvin bringt die ${f ** 4}-fache Strahlung.`,
        en: `P ∝ T⁴: (${f})⁴ = ${f ** 4} – ${f} times the kelvin temperature gives ${f ** 4} times the radiation.`,
      },
    };
  }
  if (kind === 'kwh') {
    const P = pick([500, 800, 1200, 1500]);
    const h = pick([10, 24]);
    const E = energyKWh(P, h);
    return {
      kind,
      text: { de: `Durch eine Wand gehen ständig ${de(P)} W verloren. Wie viele kWh sind das in ${h} Stunden?`, en: `A wall loses ${en(P)} W all the time. How many kWh is that in ${h} hours?` },
      answer: E,
      unit: 'kWh',
      tol: 0.01,
      solution: { de: `E = P · t = ${de(P)} W · ${h} h = ${de(P * h, 0)} Wh = ${de(E, 2)} kWh`, en: `E = P · t = ${en(P)} W · ${h} h = ${en(P * h, 0)} Wh = ${en(E, 2)} kWh` },
    };
  }
  if (kind === 'window') {
    const A = pick([2, 3, 4]);
    const dT = pick([20, 25, 30]);
    const saved = heatLoss(WINDOWS.einfach - WINDOWS.dreifach, A, dT);
    return {
      kind,
      text: {
        de: `Ein Fenster mit ${de(A)} m² Einfachglas (U = 5,8 W/(m² · K)) wird durch Dreifachglas (U = 0,7 W/(m² · K)) ersetzt. Wie viele Watt Wärmeverlust spart man bei ${de(dT)} K Temperaturunterschied?`,
        en: `A window of ${en(A)} m² single glazing (U = 5.8 W/(m² · K)) is replaced by triple glazing (U = 0.7 W/(m² · K)). How many watts of heat loss are saved at a temperature difference of ${en(dT)} K?`,
      },
      answer: saved,
      unit: 'W',
      tol: 0.02,
      solution: { de: `ΔP = (5,8 − 0,7) · ${de(A)} · ${de(dT)} W = ${de(saved, 0)} W`, en: `ΔP = (5.8 − 0.7) · ${en(A)} · ${en(dT)} W = ${en(saved, 0)} W` },
    };
  }
  if (kind === 'body') {
    const Ta = pick([0, 5, 10, 15]);
    const R = pick([0.2, 0.25, 0.3, 0.4]);
    const P = (BODY_AREA * (SKIN_T - Ta)) / R;
    return {
      kind,
      text: {
        de: `Die Haut (1,8 m², 33 °C) ist mit Kleidung und Luftschicht zusammen ${de(R)} m²·K/W gedämmt. Draußen sind es ${de(Ta)} °C. Wie viel Wärme gibt der Körper ab (in W)?`,
        en: `The skin (1.8 m², 33 °C) is insulated by clothing and the air layer by ${en(R)} m²·K/W in total. Outside it is ${en(Ta)} °C. How much heat does the body give off (in W)?`,
      },
      answer: P,
      unit: 'W',
      tol: 0.02,
      solution: { de: `P = A · ΔT / R = 1,8 · ${de(SKIN_T - Ta)} / ${de(R)} W ≈ ${de(P, 0)} W`, en: `P = A · ΔT / R = 1.8 · ${en(SKIN_T - Ta)} / ${en(R)} W ≈ ${en(P, 0)} W` },
    };
  }
  if (kind === 'solar') {
    const G = pick([600, 800, 1000]);
    const dT = pick([20, 30, 40, 50]);
    const eta = 0.85 - (4 * dT) / G;
    const P = eta * G * COLLECTOR_AREA;
    return {
      kind,
      text: {
        de: `Ein Sonnenkollektor (2 m²) hat den Wirkungsgrad η = 0,85 − 4 · ΔT / G. Die Sonne liefert G = ${G} W/m², das Wasser ist ${dT} K wärmer als die Luft. Welche Leistung nimmt das Wasser auf (in W)?`,
        en: `A solar collector (2 m²) has the efficiency η = 0.85 − 4 · ΔT / G. The sun delivers G = ${G} W/m², the water is ${dT} K warmer than the air. What power does the water take up (in W)?`,
      },
      answer: P,
      unit: 'W',
      tol: 0.02,
      solution: { de: `η = 0,85 − 4 · ${dT} / ${G} ≈ ${de(eta, 3)}; P = η · G · A ≈ ${de(P, 0)} W`, en: `η = 0.85 − 4 · ${dT} / ${G} ≈ ${en(eta, 3)}; P = η · G · A ≈ ${en(P, 0)} W` },
    };
  }
  const T0 = pick([80, 90]);
  const k = pick([0.02, 0.025]);
  const t = pick([10, 20, 30]);
  const T = cooling(T0, 20, k, t);
  return {
    kind: 'cool',
    text: {
      de: `Tee mit ${de(T0)} °C kühlt im Raum (20 °C) nach T = 20 °C + (${de(T0)} °C − 20 °C) · e^(−${de(k, 3)} · t) ab (t in Minuten). Wie warm ist er nach ${t} Minuten (in °C)?`,
      en: `Tea at ${en(T0)} °C cools in a room (20 °C) as T = 20 °C + (${en(T0)} °C − 20 °C) · e^(−${en(k, 3)} · t) (t in minutes). How warm is it after ${t} minutes (in °C)?`,
    },
    answer: T,
    unit: '°C',
    tol: 0.01,
    solution: { de: `T = 20 + ${de(T0 - 20)} · e^(−${de(k * t, 2)}) ≈ ${de(T, 1)} °C`, en: `T = 20 + ${en(T0 - 20)} · e^(−${en(k * t, 2)}) ≈ ${en(T, 1)} °C` },
  };
}

export function parseAnswer(input: string): number | null {
  const s = input
    .trim()
    .replace(/\s/g, '')
    .replace('−', '-')
    .replace(',', '.')
    .replace(/[a-zA-Z/²°]+$/, '');
  if (!s || !/^-?\d*\.?\d+(e-?\d+)?$/.test(s)) return null;
  return Number(s);
}

export function checkTask(task: HeatTask, input: string): boolean | null {
  const x = parseAnswer(input);
  if (x === null) return null;
  if (task.tol === 0) return x === task.answer;
  return Math.abs(x - task.answer) <= task.tol * Math.abs(task.answer) + 1e-9;
}
