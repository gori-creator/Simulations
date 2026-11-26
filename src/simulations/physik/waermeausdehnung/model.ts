/**
 * Wärmeausdehnung fester, flüssiger und gasförmiger Stoffe sowie die
 * Dichteanomalie des Wassers.
 */

export type SolidId = 'aluminium' | 'copper' | 'steel' | 'glass' | 'invar' | 'concrete';

/** Linearer Ausdehnungskoeffizient α in 1/K (gerundete Tabellenwerte). */
export const ALPHA: Record<SolidId, number> = {
  aluminium: 23e-6,
  copper: 17e-6,
  steel: 12e-6,
  concrete: 12e-6,
  glass: 9e-6,
  invar: 1.2e-6,
};

/** Längenänderung ΔL = α · L₀ · ΔT. */
export function lengthChange(alpha: number, L0: number, dT: number): number {
  return alpha * L0 * dT;
}

/** Volumenausdehnung (näherungsweise γ = 3α bei festen Stoffen). */
export function volumeChange(gamma: number, V0: number, dT: number): number {
  return gamma * V0 * dT;
}

/** Volumenausdehnungskoeffizienten in 1/K (bei etwa 20 °C). */
export const GAMMA_LIQ = { water: 0.21e-3, ethanol: 1.1e-3, mercury: 0.18e-3, oil: 0.7e-3 };

/** Gase bei konstantem Druck: V = V₀ · T / T₀ (Gay-Lussac), etwa 1/273 pro Kelvin. */
export function gasVolume(V0: number, t0C: number, tC: number): number {
  return (V0 * (tC + 273.15)) / (t0C + 273.15);
}

/**
 * Dichte von Wasser in kg/m³ zwischen 0 °C und 100 °C (Näherungsformel nach
 * Tanaka et al. 2001, Atmosphärendruck); für Eis bei 0 °C gilt 916,7 kg/m³.
 */
export function waterDensity(tC: number): number {
  const a1 = -3.983035;
  const a2 = 301.797;
  const a3 = 522528.9;
  const a4 = 69.34881;
  const a5 = 999.97495;
  return a5 * (1 - ((tC + a1) ** 2 * (tC + a2)) / (a3 * (tC + a4)));
}

export const ICE_DENSITY = 916.7;

/* ------------------------------------------------------------------ */
/* Flüssigkeiten und Thermometer                                       */
/* ------------------------------------------------------------------ */

export type LiquidId = 'ethanol' | 'mercury' | 'water';

/**
 * Volumen von 1 L Flüssigkeit (bei 20 °C) bei der Temperatur t in L.
 * Wasser über die Dichte (mit Anomalie), Ethanol und Quecksilber linear.
 */
export function liquidVolume(id: LiquidId, tC: number): number {
  if (id === 'water') return waterDensity(20) / waterDensity(Math.max(0, tC));
  const g = id === 'ethanol' ? GAMMA_LIQ.ethanol : GAMMA_LIQ.mercury;
  return 1 + g * (tC - 20);
}

/**
 * Steighöhe im Thermometer: Die Flüssigkeit im Vorratsgefäß (Volumen V in mm³)
 * dehnt sich um γ · V · ΔT aus und steigt in der Kapillare (Radius r in mm)
 * um Δh = γ · V · ΔT / (π · r²) (in mm).
 */
export function capillaryRise(gamma: number, Vmm3: number, rmm: number, dT: number): number {
  return (gamma * Vmm3 * dT) / (Math.PI * rmm * rmm);
}

/* ------------------------------------------------------------------ */
/* Alltag: Fugen, Schienen, Leitungen                                  */
/* ------------------------------------------------------------------ */

/**
 * Breite einer Dehnungsfuge (m) bei der Temperatur t: Bei T₀ ist sie gap0 breit,
 * das Bauteil der Länge L wird um α · L · (t − T₀) länger. Nie kleiner als 0.
 */
export function gapWidth(alpha: number, L: number, gap0: number, tC: number, t0C = 20): number {
  return Math.max(0, gap0 - lengthChange(alpha, L, tC - t0C));
}

/**
 * Durchhang einer Freileitung (m) zwischen zwei Masten im Abstand `span` (m):
 * Bei T₀ hängt sie f0 durch. Näherung für flache Bögen: Seillänge
 * s ≈ span + 8 f² / (3 · span); das Seil wird um α · s · ΔT länger.
 */
export function cableSag(span: number, f0: number, alpha: number, tC: number, t0C = 20): number {
  const s0 = span + (8 * f0 * f0) / (3 * span);
  const s = s0 * (1 + alpha * (tC - t0C));
  return Math.sqrt(Math.max(0, ((s - span) * 3 * span) / 8));
}

/* ------------------------------------------------------------------ */
/* Bimetall-Thermostat                                                 */
/* ------------------------------------------------------------------ */

/**
 * Krümmung eines Bimetallstreifens: Die Spitze eines Streifens der Länge L
 * (Dicke d) biegt sich um etwa y = 3 · Δα · ΔT · L² / (4 · d) aus
 * (beide Schichten gleich dick und gleich steif).
 */
export function bimetalDeflection(dAlpha: number, dT: number, L: number, d: number): number {
  return (3 * dAlpha * dT * L * L) / (4 * d);
}

/**
 * Ein Zeitschritt des Thermostaten (z. B. Bügeleisen): Heizt, solange er
 * eingeschaltet ist, kühlt immer zur Umgebung hin ab. Der Bimetallschalter
 * öffnet bei set + hyst/2 und schließt bei set − hyst/2.
 */
export function thermostatStep(
  state: { T: number; on: boolean },
  dt: number,
  opts: { set: number; hyst: number; heat: number; k: number; env: number },
): { T: number; on: boolean } {
  const dTdt = (state.on ? opts.heat : 0) - opts.k * (state.T - opts.env);
  const T = state.T + dTdt * dt;
  let on = state.on;
  if (on && T >= opts.set + opts.hyst / 2) on = false;
  else if (!on && T <= opts.set - opts.hyst / 2) on = true;
  return { T, on };
}

/* ------------------------------------------------------------------ */
/* Übung                                                               */
/* ------------------------------------------------------------------ */

export type Loc = { de: string; en: string };
export type TaskKind = 'dL' | 'gap' | 'gas' | 'anomaly' | 'mat' | 'L0' | 'rail' | 'which';

export interface ExpansionTask {
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
const de = (x: number, d = 2) => round(x, d).toString().replace('.', ',').replace('-', '−');
const en = (x: number, d = 2) => round(x, d).toString().replace('-', '−');

const NAMES: Record<SolidId, Loc> = {
  aluminium: { de: 'Aluminium', en: 'aluminium' },
  copper: { de: 'Kupfer', en: 'copper' },
  steel: { de: 'Stahl', en: 'steel' },
  concrete: { de: 'Beton', en: 'concrete' },
  glass: { de: 'Glas', en: 'glass' },
  invar: { de: 'Invar', en: 'Invar' },
};

/** Übungsaufgabe Nummer n; die Arten wechseln reihum, Zahlen zufällig, aber fest je Nummer. */
export function makeTask(n: number): ExpansionTask {
  const r = rng(n * 211 + 5);
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)]!;
  const kinds: TaskKind[] = ['dL', 'anomaly', 'gap', 'gas', 'mat', 'L0', 'rail', 'which'];
  const kind = kinds[(n - 1) % kinds.length]!;
  if (kind === 'dL') {
    const m = pick(['aluminium', 'copper', 'steel'] as SolidId[]);
    const L = pick([1, 2, 5, 10]);
    const dT = pick([20, 40, 50, 80]);
    const d = lengthChange(ALPHA[m], L, dT) * 1000;
    return {
      kind,
      text: { de: `Ein ${de(L)} m langer Stab aus ${NAMES[m].de} (α = ${de(ALPHA[m] * 1e6)} · 10⁻⁶ 1/K) wird um ${de(dT)} K erwärmt. Um wie viele Millimeter wird er länger?`, en: `A ${en(L)} m rod of ${NAMES[m].en} (α = ${en(ALPHA[m] * 1e6)} · 10⁻⁶ 1/K) is heated by ${en(dT)} K. By how many millimetres does it get longer?` },
      answer: d,
      unit: 'mm',
      tol: 0.02,
      solution: { de: `ΔL = α · L₀ · ΔT = ${de(ALPHA[m] * 1e6)} · 10⁻⁶ · ${de(L)} m · ${de(dT)} = ${de(d / 1000, 5)} m = ${de(d, 2)} mm`, en: `ΔL = α · L₀ · ΔT = ${en(ALPHA[m] * 1e6)} · 10⁻⁶ · ${en(L)} m · ${en(dT)} = ${en(d / 1000, 5)} m = ${en(d, 2)} mm` },
    };
  }
  if (kind === 'gap') {
    const L = pick([50, 100, 200]);
    const t = pick([40, 45, 50]);
    const need = lengthChange(ALPHA.steel, L, t - 20) * 1000;
    return {
      kind,
      text: { de: `Eine Stahlbrücke ist bei 20 °C ${de(L)} m lang. Wie breit (in mm) muss die Dehnungsfuge mindestens sein, damit sie bei ${de(t)} °C nicht zusammenstößt? (α = 12 · 10⁻⁶ 1/K)`, en: `A steel bridge is ${en(L)} m long at 20 °C. How wide (in mm) must the expansion joint be at least so that it does not close at ${en(t)} °C? (α = 12 · 10⁻⁶ 1/K)` },
      answer: need,
      unit: 'mm',
      tol: 0.02,
      solution: { de: `ΔL = 12 · 10⁻⁶ · ${de(L)} m · ${de(t - 20)} K = ${de(need, 1)} mm`, en: `ΔL = 12 · 10⁻⁶ · ${en(L)} m · ${en(t - 20)} K = ${en(need, 1)} mm` },
    };
  }
  if (kind === 'gas') {
    const V0 = pick([1, 2, 5]);
    const t = pick([50, 80, 100, -20]);
    const V = gasVolume(V0, 20, t);
    return {
      kind,
      text: { de: `${de(V0)} L Luft (20 °C) werden bei gleichem Druck auf ${de(t)} °C gebracht. Wie groß ist das Volumen danach in L? (V ~ T in Kelvin)`, en: `${en(V0)} L of air (20 °C) are brought to ${en(t)} °C at constant pressure. What is the volume afterwards in L? (V ∝ T in kelvin)` },
      answer: V,
      unit: 'L',
      tol: 0.01,
      solution: { de: `V = V₀ · T : T₀ = ${de(V0)} L · ${de(t + 273.15, 2)} K : 293,15 K ≈ ${de(V, 3)} L`, en: `V = V₀ · T / T₀ = ${en(V0)} L · ${en(t + 273.15, 2)} K / 293.15 K ≈ ${en(V, 3)} L` },
    };
  }
  if (kind === 'anomaly') {
    return {
      kind,
      text: { de: 'Bei welcher Temperatur (in °C) hat Wasser die größte Dichte?', en: 'At what temperature (in °C) does water have its greatest density?' },
      answer: 4,
      unit: '°C',
      tol: 0.05,
      solution: { de: 'Bei etwa 4 °C (genauer 3,98 °C). Darum hat der Grund eines zugefrorenen Sees 4 °C.', en: 'At about 4 °C (more precisely 3.98 °C). That is why the bottom of a frozen lake is at 4 °C.' },
    };
  }
  if (kind === 'mat') {
    const L = pick([1, 2]);
    const dT = pick([50, 100]);
    const ratio = ALPHA.aluminium / ALPHA.invar;
    return {
      kind,
      text: { de: `Ein Aluminium- und ein Invarstab (je ${de(L)} m) werden um ${de(dT)} K erwärmt. Wie viele Male mehr dehnt sich der Aluminiumstab aus? (α_Al = 23 · 10⁻⁶ 1/K, α_Invar = 1,2 · 10⁻⁶ 1/K)`, en: `An aluminium rod and an Invar rod (${en(L)} m each) are heated by ${en(dT)} K. How many times more does the aluminium rod expand? (α_Al = 23 · 10⁻⁶ 1/K, α_Invar = 1.2 · 10⁻⁶ 1/K)` },
      answer: ratio,
      unit: '',
      tol: 0.02,
      solution: { de: `Gleiche Länge und gleiches ΔT: Verhältnis der α-Werte 23 : 1,2 ≈ ${de(ratio, 1)}`, en: `Same length and same ΔT: ratio of the α values 23 / 1.2 ≈ ${en(ratio, 1)}` },
    };
  }
  if (kind === 'L0') {
    const d = pick([6, 12, 24]);
    const dT = pick([20, 40, 50]);
    const L = d / 1000 / (ALPHA.steel * dT);
    return {
      kind,
      text: { de: `Ein Stahlträger wird bei ${de(dT)} K Erwärmung ${de(d)} mm länger. Wie lang (in m) ist er? (α = 12 · 10⁻⁶ 1/K)`, en: `A steel girder gets ${en(d)} mm longer when heated by ${en(dT)} K. How long (in m) is it? (α = 12 · 10⁻⁶ 1/K)` },
      answer: L,
      unit: 'm',
      tol: 0.02,
      solution: { de: `L₀ = ΔL : (α · ΔT) = ${de(d / 1000, 3)} m : (12 · 10⁻⁶ · ${de(dT)}) = ${de(L, 1)} m`, en: `L₀ = ΔL / (α · ΔT) = ${en(d / 1000, 3)} m / (12 · 10⁻⁶ · ${en(dT)}) = ${en(L, 1)} m` },
    };
  }
  if (kind === 'rail') {
    const L = pick([15, 30, 60]);
    const lo = pick([-20, -15, -10]);
    const hi = pick([40, 50]);
    const d = lengthChange(ALPHA.steel, L, hi - lo) * 1000;
    return {
      kind,
      text: { de: `Eine ${de(L)} m lange Stahlschiene erlebt im Jahr Temperaturen von ${de(lo)} °C bis ${de(hi)} °C. Um wie viele Millimeter ändert sich ihre Länge zwischen Winter und Sommer? (α = 12 · 10⁻⁶ 1/K)`, en: `A ${en(L)} m steel rail sees temperatures from ${en(lo)} °C to ${en(hi)} °C during the year. By how many millimetres does its length change between winter and summer? (α = 12 · 10⁻⁶ 1/K)` },
      answer: d,
      unit: 'mm',
      tol: 0.02,
      solution: { de: `ΔT = ${de(hi - lo)} K; ΔL = 12 · 10⁻⁶ · ${de(L)} m · ${de(hi - lo)} K = ${de(d, 1)} mm`, en: `ΔT = ${en(hi - lo)} K; ΔL = 12 · 10⁻⁶ · ${en(L)} m · ${en(hi - lo)} K = ${en(d, 1)} mm` },
    };
  }
  const items: { de: string; en: string; a: 1 | 2 | 3 }[] = [
    { de: 'Ein Topf mit Wasser wird randvoll erhitzt und läuft über.', en: 'A pot filled to the brim with water is heated and overflows.', a: 2 },
    { de: 'Ein Ball, der im Winter draußen lag, ist schlaff.', en: 'A ball left outside in winter is soft.', a: 3 },
    { de: 'Ein Deckel aus Metall auf einem Glas lässt sich unter heißem Wasser leichter öffnen.', en: 'A metal lid on a jar is easier to open under hot water.', a: 1 },
    { de: 'Im Sommer hängen Stromleitungen tiefer durch.', en: 'In summer power lines sag lower.', a: 1 },
    { de: 'Im Thermometer steigt der rote Alkohol.', en: 'The red alcohol in a thermometer rises.', a: 2 },
    { de: 'Ein Heißluftballon steigt, wenn die Luft darin erwärmt wird.', en: 'A hot-air balloon rises when the air inside is heated.', a: 3 },
  ];
  const it = pick(items);
  return {
    kind: 'which',
    text: { de: `Was dehnt sich hier aus? „${it.de}“ (1 = fester Körper, 2 = Flüssigkeit, 3 = Gas)`, en: `What expands here? “${it.en}” (1 = solid, 2 = liquid, 3 = gas)` },
    answer: it.a,
    unit: '',
    tol: 0,
    solution: {
      de: it.a === 1 ? 'Ein fester Körper (Metall) dehnt sich aus.' : it.a === 2 ? 'Eine Flüssigkeit dehnt sich aus – stärker als feste Stoffe.' : 'Ein Gas dehnt sich aus – viel stärker als feste und flüssige Stoffe (bzw. zieht sich bei Kälte zusammen).',
      en: it.a === 1 ? 'A solid (metal) expands.' : it.a === 2 ? 'A liquid expands – more than solids.' : 'A gas expands – much more than solids and liquids (or contracts in the cold).',
    },
  };
}

export function parseAnswer(input: string): number | null {
  const s = input.trim().replace(/\s/g, '').replace('−', '-').replace(',', '.').replace(/[a-zA-Z/²³°]+$/, '');
  if (!s || !/^-?\d*\.?\d+(e-?\d+)?$/.test(s)) return null;
  return Number(s);
}

export function checkTask(task: ExpansionTask, input: string): boolean | null {
  const x = parseAnswer(input);
  if (x === null) return null;
  if (task.tol === 0) return x === task.answer;
  return Math.abs(x - task.answer) <= task.tol * Math.abs(task.answer) + 1e-9;
}
