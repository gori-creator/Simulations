/**
 * Rechenlogik zu „Dichte, Schwimmen und Auftrieb“ – ohne Zeichencode.
 *
 * Intern wird in SI-Einheiten gerechnet (m, m², m³, kg, kg/m³, N, K, Pa).
 * Die Simulation rechnet für die Anzeige in die Schuleinheiten um
 * (cm, cm³, g, g/cm³, °C). 1 g/cm³ = 1000 kg/m³.
 *
 * Grundgesetze:
 *   Dichte                 ρ = m / V
 *   Gewichtskraft          F_G = m · g
 *   Auftriebskraft         F_A = ρ_Fl · V_verdrängt · g   (Archimedes)
 *   schwimmender Körper    F_A = F_G  →  Eintauchanteil = ρ_K / ρ_Fl
 */

/** Ortsfaktor in N/kg (wie im Unterricht). */
export const G = 9.81;
/** Universelle Gaskonstante in J/(mol·K). */
export const R_GAS = 8.314462618;
/** Mittlere molare Masse trockener Luft in kg/mol. */
export const M_AIR = 0.028964;
/** Normaler Luftdruck auf Meereshöhe in Pa. */
export const P0 = 101325;
/** Nullpunkt der Celsius-Skala in K. */
export const KELVIN = 273.15;

/* ------------------------------------------------------------------ */
/* Stoffe                                                              */
/* ------------------------------------------------------------------ */

export type MaterialId = 'styro' | 'cork' | 'wood' | 'wax' | 'ice' | 'pe' | 'pvc' | 'glass' | 'alu' | 'iron' | 'copper' | 'lead' | 'gold' | 'own';
export type LiquidId = 'fresh' | 'salt' | 'dead' | 'oil' | 'spirit' | 'mercury';

/**
 * Dichten fester Stoffe in g/cm³ (Tabellenwerte bei Raumtemperatur, gerundet).
 * Naturstoffe streuen: Holz etwa 0,4 … 0,9 (hier 0,6), Kork 0,12 … 0,25,
 * Styropor 0,015 … 0,03, Kerzenwachs (Paraffin) 0,88 … 0,92.
 */
export const MATERIAL_DENSITY: Record<Exclude<MaterialId, 'own'>, number> = {
  styro: 0.03,
  cork: 0.24,
  wood: 0.6,
  wax: 0.9,
  ice: 0.917,
  pe: 0.95,
  pvc: 1.38,
  glass: 2.5,
  alu: 2.7,
  iron: 7.87,
  copper: 8.96,
  lead: 11.34,
  gold: 19.32,
};

/** Alle Stoffe der Tabelle (ohne „eigene Dichte“), nach Dichte geordnet. */
export const MATERIALS = (Object.keys(MATERIAL_DENSITY) as Exclude<MaterialId, 'own'>[]).sort((a, b) => MATERIAL_DENSITY[a] - MATERIAL_DENSITY[b]);

/**
 * Dichten von Flüssigkeiten in g/cm³ (bei etwa 20 °C, gerundet). Süßwasser
 * wird wie im Unterricht mit 1,00 g/cm³ gerechnet (genau 0,998 bei 20 °C).
 */
export const LIQUID_DENSITY: Record<LiquidId, number> = {
  spirit: 0.79,
  oil: 0.92,
  fresh: 1.0,
  salt: 1.025,
  dead: 1.24,
  mercury: 13.55,
};

export const LIQUIDS = (Object.keys(LIQUID_DENSITY) as LiquidId[]).sort((a, b) => LIQUID_DENSITY[a] - LIQUID_DENSITY[b]);

/** g/cm³ → kg/m³. */
export const toSI = (gPerCm3: number) => gPerCm3 * 1000;
/** cm³ → m³. */
export const cm3 = (v: number) => v * 1e-6;

/* ------------------------------------------------------------------ */
/* Dichte, Gewichtskraft, Auftrieb                                     */
/* ------------------------------------------------------------------ */

/** Dichte ρ = m / V (beliebige, zueinander passende Einheiten). */
export function density(mass: number, volume: number): number {
  return mass / volume;
}

/** Masse m = ρ · V (z. B. g/cm³ · cm³ = g). */
export function massOf(rho: number, volume: number): number {
  return rho * volume;
}

/** Gewichtskraft F_G = m · g (m in kg, F in N). */
export function weight(massKg: number): number {
  return massKg * G;
}

/** Auftriebskraft F_A = ρ_Fl · V_verdrängt · g (ρ in kg/m³, V in m³, F in N). */
export function buoyancy(rhoFluid: number, displaced: number): number {
  return rhoFluid * displaced * G;
}

export type FloatState = 'float' | 'hover' | 'sink';

/** Relative Toleranz, innerhalb derer zwei Dichten als gleich gelten (Schweben). */
export const HOVER_TOLERANCE = 1e-9;

/** Schwimmt, schwebt oder sinkt ein Körper der mittleren Dichte ρ_K in der Flüssigkeit ρ_Fl? */
export function floatState(rhoBody: number, rhoFluid: number): FloatState {
  if (Math.abs(rhoBody - rhoFluid) <= HOVER_TOLERANCE * rhoFluid) return 'hover';
  return rhoBody < rhoFluid ? 'float' : 'sink';
}

/** Eintauchanteil eines schwimmenden Quaders (bzw. Volumenanteil unter der Oberfläche): ρ_K / ρ_Fl, höchstens 1. */
export function immersedFraction(rhoBody: number, rhoFluid: number): number {
  return Math.min(1, rhoBody / rhoFluid);
}

/**
 * Scheinbares Gewicht (Anzeige eines Kraftmessers), wenn der Anteil `fraction`
 * des Volumens eingetaucht ist: F = F_G − F_A, nie negativ (dann schwimmt der Körper).
 */
export function apparentWeight(massKg: number, volume: number, rhoFluid: number, fraction = 1): number {
  return Math.max(0, weight(massKg) - buoyancy(rhoFluid, volume * fraction));
}

/* ------------------------------------------------------------------ */
/* Körperformen                                                        */
/* ------------------------------------------------------------------ */

/**
 * Form eines Körpers, so weit sie für den Auftrieb zählt. `depth` ist die Tiefe
 * der Unterkante unter der Flüssigkeitsoberfläche (m); 0 = berührt gerade die
 * Oberfläche, ≥ `height` = ganz eingetaucht.
 */
export interface Shape {
  /** Höhe in m. */
  height: number;
  /** Gesamtvolumen in m³. */
  volume: number;
  /** Eingetauchtes Volumen in m³. */
  submerged(depth: number): number;
  /** Fläche des Körpers in Höhe der Wasserlinie (Wasserlinienfläche) in m². */
  waterplane(depth: number): number;
  /** Querschnitt für den Strömungswiderstand bei senkrechter Bewegung in m². */
  frontal: number;
}

/** Quader L × B × H (L waagerecht im Bild, B in die Tiefe). */
export function box(L: number, B: number, H: number): Shape {
  return {
    height: H,
    volume: L * B * H,
    submerged: (d) => L * B * Math.min(H, Math.max(0, d)),
    waterplane: (d) => (d > 0 && d < H ? L * B : 0),
    frontal: L * B,
  };
}

/** Würfel mit dem Volumen V (Kantenlänge a = ∛V). */
export function cube(volume: number): Shape {
  const a = Math.cbrt(volume);
  return box(a, a, a);
}

/** Volumen einer Kugelkappe der Höhe h aus einer Kugel mit Radius R: π h² (3R − h) / 3. */
export function sphereCap(R: number, h: number): number {
  const x = Math.min(2 * R, Math.max(0, h));
  return (Math.PI * x * x * (3 * R - x)) / 3;
}

/** Fläche eines Kreisabschnitts der Höhe h (Kreisradius R). */
export function circleSegment(R: number, h: number): number {
  const x = Math.min(2 * R, Math.max(0, h));
  return R * R * Math.acos((R - x) / R) - (R - x) * Math.sqrt(Math.max(0, 2 * R * x - x * x));
}

/**
 * Liegende Kapsel (Zylinder der Länge `Lc` mit zwei Halbkugeln, Radius R),
 * z. B. ein U-Boot-Rumpf. Volumen π R² Lc + 4/3 π R³.
 */
export function capsule(R: number, Lc: number): Shape {
  return {
    height: 2 * R,
    volume: Math.PI * R * R * Lc + (4 / 3) * Math.PI * R ** 3,
    submerged: (d) => Lc * circleSegment(R, d) + sphereCap(R, d),
    waterplane: (d) => {
      if (d <= 0 || d >= 2 * R) return 0;
      const half = Math.sqrt(Math.max(0, R * R - (R - d) ** 2));
      return 2 * half * Lc + Math.PI * half * half;
    },
    frontal: 2 * R * Lc + Math.PI * R * R,
  };
}

/**
 * Tiefe der Unterkante, bei der ein frei schwimmender Körper der Masse m im
 * Gleichgewicht ist (F_A = F_G), gefunden durch Intervallhalbierung.
 * `null`, wenn er auch ganz eingetaucht zu schwer ist (er sinkt).
 */
export function equilibriumDepth(shape: Shape, massKg: number, rhoFluid: number): number | null {
  const need = massKg / rhoFluid; // nötiges verdrängtes Volumen
  if (need > shape.volume * (1 + 1e-12)) return null;
  if (need >= shape.volume) return shape.height;
  let lo = 0;
  let hi = shape.height;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (shape.submerged(mid) < need) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/* ------------------------------------------------------------------ */
/* Becken: Wasserstand                                                 */
/* ------------------------------------------------------------------ */

/**
 * Wasserstand (m über dem Boden) in einem Becken mit Grundfläche A, das das
 * Flüssigkeitsvolumen V0 enthält, wenn die Unterkante des Körpers bei z liegt.
 * Der Stand hängt vom eingetauchten Volumen ab und umgekehrt; gelöst durch
 * Intervallhalbierung (h · A = V0 + V_eingetaucht(h − z)).
 */
export function tankLevel(V0: number, A: number, shape: Shape, z: number): number {
  let lo = V0 / A;
  let hi = (V0 + shape.volume) / A;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (mid * A < V0 + shape.submerged(mid - z)) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/* ------------------------------------------------------------------ */
/* Bewegung eines Körpers im Becken (gedämpft)                         */
/* ------------------------------------------------------------------ */

export interface Motion {
  /** Höhe der Unterkante über dem Beckenboden in m. */
  z: number;
  /** Geschwindigkeit nach oben in m/s. */
  v: number;
}

export interface TankBody {
  massKg: number;
  shape: Shape;
}

export interface Tank {
  /** Grundfläche in m². */
  area: number;
  /** Flüssigkeitsvolumen in m³. */
  liquid: number;
  /** Dichte der Flüssigkeit in kg/m³. */
  rho: number;
}

/** Beiwert der „mitbewegten“ Flüssigkeit (hydrodynamische Zusatzmasse), etwa wie bei einem Würfel. */
export const ADDED_MASS = 0.6;
/** Widerstandsbeiwert bei senkrechter Bewegung (Würfel, Platte quer zur Strömung ≈ 1,05). */
export const DRAG_CW = 1.05;
/** Dämpfungsgrad des Auf-und-ab-Schwingens an der Oberfläche (Wellenabstrahlung, frei gewählt). */
export const SURFACE_DAMPING = 0.16;
/** Stoßzahl beim Aufsetzen auf dem Boden. */
export const RESTITUTION = 0.18;

/** Kräfte auf den Körper (N, nach oben positiv) und Wasserstand bei der Lage z. */
export function bodyForces(body: TankBody, tank: Tank, z: number): { level: number; depth: number; displaced: number; FG: number; FA: number } {
  const level = tankLevel(tank.liquid, tank.area, body.shape, z);
  const depth = level - z;
  const displaced = body.shape.submerged(depth);
  return {
    level,
    depth,
    displaced,
    FG: weight(body.massKg),
    FA: buoyancy(tank.rho, displaced),
  };
}

/**
 * Ein Zeitschritt h (s) der Bewegung: Gewichtskraft, Auftrieb, Strömungswiderstand
 * (quadratisch), Dämpfung an der Oberfläche und Zusatzmasse der mitbewegten
 * Flüssigkeit. Halbimplizites Euler-Verfahren; der Boden ist hart.
 */
export function stepBody(body: TankBody, tank: Tank, m: Motion, h: number): Motion {
  const f = bodyForces(body, tank, m.z);
  const sub = f.displaced / body.shape.volume;
  const mAdd = ADDED_MASS * tank.rho * f.displaced;
  const mEff = body.massKg + mAdd;
  const drag = 0.5 * tank.rho * DRAG_CW * body.shape.frontal * sub * m.v * Math.abs(m.v);
  const wp = body.shape.waterplane(f.depth);
  const damp = wp > 0 ? 2 * SURFACE_DAMPING * Math.sqrt(tank.rho * G * wp * mEff) * m.v : 0;
  const a = (f.FA - f.FG - drag - damp) / mEff;
  let v = m.v + a * h;
  let z = m.z + v * h;
  if (z < 0) {
    z = 0;
    v = v < 0 ? -v * RESTITUTION : v;
    if (Math.abs(v) < 0.02) v = 0;
  }
  return { z, v };
}

/* ------------------------------------------------------------------ */
/* Wellen im Becken                                                    */
/* ------------------------------------------------------------------ */

/**
 * Kreisfrequenz der n-ten stehenden Welle (Eigenschwingung) in einem Becken
 * der Breite W bei der Wassertiefe d: k = nπ/W, ω = √(g·k·tanh(k·d)).
 */
export function sloshOmega(n: number, W: number, d: number): number {
  const k = (n * Math.PI) / W;
  return Math.sqrt(G * k * Math.tanh(k * d));
}

/* ------------------------------------------------------------------ */
/* Stahlschiff                                                         */
/* ------------------------------------------------------------------ */

/** Dichte von Stahl in kg/m³. */
export const STEEL = 7870;

/**
 * Spielzeugschiff aus Stahlblech: offener Rumpf L × B × H (außen) und Masse
 * des Rumpfs. Zum Vergleich hat derselbe Stahl als Würfel nur das Volumen
 * m / ρ_Stahl.
 */
export const SHIP = { L: 0.2, B: 0.1, H: 0.06, hullKg: 0.3 };

export interface ShipState {
  /** Gesamtmasse (Rumpf + Ladung) in kg. */
  massKg: number;
  /** Mittlere Dichte (Masse durch Außenvolumen) in kg/m³. */
  meanDensity: number;
  /** Tiefgang in m (oder null, wenn das Schiff vollläuft und sinkt). */
  draught: number | null;
  /** Freibord (Abstand Wasserlinie – Bordwand) in m. */
  freeboard: number | null;
  /** Größte Zuladung in kg, bevor Wasser über die Bordwand läuft. */
  maxLoad: number;
}

/** Schwimmlage des Stahlschiffs mit der Ladung `loadKg` in der Flüssigkeit ρ. */
export function shipState(loadKg: number, rhoFluid: number): ShipState {
  const shape = box(SHIP.L, SHIP.B, SHIP.H);
  const massKg = SHIP.hullKg + loadKg;
  const draught = equilibriumDepth(shape, massKg, rhoFluid);
  return {
    massKg,
    meanDensity: massKg / shape.volume,
    draught,
    freeboard: draught === null ? null : SHIP.H - draught,
    maxLoad: rhoFluid * shape.volume - SHIP.hullKg,
  };
}

/** Innenraum des offenen Rumpfs in m³ (Blech dünn, vereinfacht = Außenvolumen). */
export const SHIP_INNER = SHIP.L * SHIP.B * SHIP.H;

/**
 * Wasser, das über die Bordwand ins Schiff läuft (m³/s), wenn die Oberfläche
 * `head` (m) über der Bordwand steht – Überfallformel Q = C · U · √(2g) · h^1,5
 * mit dem Umfang U = 2 (L + B) und C ≈ 0,4.
 */
export function shipInflow(head: number): number {
  if (head <= 0) return 0;
  return 0.4 * 2 * (SHIP.L + SHIP.B) * Math.sqrt(2 * G) * head ** 1.5;
}

/** Volumen des Rumpfstahls (als Klumpen) in m³. */
export function steelVolume(massKg = SHIP.hullKg): number {
  return massKg / STEEL;
}

/* ------------------------------------------------------------------ */
/* U-Boot                                                              */
/* ------------------------------------------------------------------ */

/**
 * Modell-U-Boot: Kapsel (Radius 3,5 cm, Zylinderteil ≈ 10,9 cm, Volumen genau
 * 600 cm³) mit 450 g Rumpfmasse und einer Tauchzelle von 300 cm³. Geflutet nimmt
 * sie Wasser auf, das U-Boot wird schwerer; halb geflutet schwebt es in Süßwasser.
 */
const SUB_R = 0.035;
export const SUB = {
  R: SUB_R,
  Lc: (600e-6 - (4 / 3) * Math.PI * SUB_R ** 3) / (Math.PI * SUB_R * SUB_R),
  hullKg: 0.45,
  tank: 300e-6,
};

export function subShape(): Shape {
  return capsule(SUB.R, SUB.Lc);
}

/** Masse des U-Boots in kg, wenn die Tauchzelle zum Anteil `fill` (0 … 1) geflutet ist. */
export function subMass(fill: number, rhoFluid: number): number {
  return SUB.hullKg + Math.min(1, Math.max(0, fill)) * SUB.tank * rhoFluid;
}

/** Füllung der Tauchzelle (0 … 1), bei der das U-Boot schwebt; `null`, wenn das nicht möglich ist. */
export function hoverFill(rhoFluid: number): number | null {
  const f = (rhoFluid * subShape().volume - SUB.hullKg) / (SUB.tank * rhoFluid);
  return f >= 0 && f <= 1 ? f : null;
}

/* ------------------------------------------------------------------ */
/* Überlaufgefäß (Archimedes)                                          */
/* ------------------------------------------------------------------ */

/**
 * Überlaufgefäß: zylindrisches Gefäß (Grundfläche A) mit Ausguss in der Höhe
 * `spout`. Was über den Ausguss steigt, läuft in den Auffangbecher.
 */
export interface Overflow {
  /** Flüssigkeit im Gefäß in m³. */
  inside: number;
  /** Flüssigkeit im Auffangbecher in m³. */
  caught: number;
}

/** Zeitkonstante des Auslaufens in s (Wasser über dem Ausguss läuft weitgehend in dieser Zeit ab). */
export const SPOUT_TAU = 0.2;

/** Flüssigkeitsstand im Überlaufgefäß, wenn die Unterkante des Körpers bei z liegt. */
export function overflowLevel(o: Overflow, area: number, shape: Shape, z: number): number {
  return tankLevel(o.inside, area, shape, z);
}

/**
 * Ein Zeitschritt h (s): Steht die Flüssigkeit höher als der Ausguss, läuft der
 * Überschuss in den Becher (Volumen bleibt erhalten).
 */
export function stepOverflow(o: Overflow, area: number, spout: number, shape: Shape, z: number, h: number): Overflow {
  const level = overflowLevel(o, area, shape, z);
  if (level <= spout) return o;
  const excess = (level - spout) * area;
  // kleine Reste (unter 0,5 cm³) laufen auf einmal ab, damit der Stand zur Ruhe kommt
  const out = excess < 5e-7 ? excess : Math.min(excess, (excess * h) / SPOUT_TAU);
  return { inside: o.inside - out, caught: o.caught + out };
}

/** Kleinster üblicher Messbereich eines Kraftmessers (in N), der die Kraft F noch anzeigt. */
export function meterRange(F: number): number {
  const ranges = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500];
  return ranges.find((r) => F <= r * (1 + 1e-9)) ?? 500;
}

/* ------------------------------------------------------------------ */
/* Dichte bestimmen                                                    */
/* ------------------------------------------------------------------ */

/** Ablesung am Messzylinder (ml) mit der Anfangsfüllung V1, wenn der Körper das Volumen V (cm³) verdrängt. */
export function cylinderReading(V1: number, displaced: number): number {
  return V1 + displaced;
}

/**
 * Verdrängtes Volumen (cm³) im Messzylinder: ganz untergetaucht das ganze
 * Volumen; schwimmt der Körper frei, nur so viel, wie seiner Masse an Wasser
 * entspricht (m / ρ_W).
 */
export function displacedInCylinder(rhoBody: number, volume: number, rhoWater: number, pushedUnder: boolean): number {
  if (pushedUnder || rhoBody >= rhoWater) return volume;
  return (rhoBody * volume) / rhoWater;
}

/** Stoff der Tabelle mit der Dichte, die dem Messwert am nächsten liegt (Vergleich über das Verhältnis). */
export function identify(rho: number): Exclude<MaterialId, 'own'> {
  let best = MATERIALS[0]!;
  let err = Infinity;
  for (const id of MATERIALS) {
    const e = Math.abs(Math.log(rho / MATERIAL_DENSITY[id]));
    if (e < err) {
      err = e;
      best = id;
    }
  }
  return best;
}

/* ------------------------------------------------------------------ */
/* Heißluftballon                                                      */
/* ------------------------------------------------------------------ */

/** Luftdichte nach der Gasgleichung: ρ = p · M / (R · T) (p in Pa, T in K, ρ in kg/m³). */
export function airDensity(p: number, T: number): number {
  return (p * M_AIR) / (R_GAS * T);
}

/** Skalenhöhe der Atmosphäre H = R·T / (M·g) in m (bei überall gleicher Temperatur T). */
export function scaleHeight(T: number): number {
  return (R_GAS * T) / (M_AIR * G);
}

/**
 * Luftdruck in der Höhe h (m) nach der barometrischen Höhenformel für eine
 * Atmosphäre gleicher Temperatur: p = p0 · e^(−h/H).
 */
export function pressureAt(h: number, T: number, p0 = P0): number {
  return p0 * Math.exp(-h / scaleHeight(T));
}

/** Masse von Hülle, Korb, Brenner und Gasflaschen in kg (wächst mit der Hüllengröße; Erfahrungswert). */
export function balloonEquipment(V: number): number {
  return 65 + 0.1 * V;
}

export interface BalloonForces {
  /** Luftdichte außen und innen in kg/m³. */
  rhoOut: number;
  rhoIn: number;
  /** Auftrieb F_A = ρ_außen · V · g. */
  FA: number;
  /** Gewichtskraft der warmen Luft in der Hülle. */
  FAir: number;
  /** Gewichtskraft von Ballon und Zuladung. */
  FLoad: number;
  /** Resultierende Kraft nach oben (N). */
  net: number;
  /** Tragkraft (ρ_außen − ρ_innen) · V in kg, also was die warme Luft tragen kann. */
  liftKg: number;
}

/**
 * Kräfte am Heißluftballon (Hülle unten offen, innen derselbe Druck wie außen):
 * Auftrieb der verdrängten Außenluft gegen die Gewichtskraft der warmen Luft
 * und die Gewichtskraft von Ballon und Zuladung.
 */
export function balloonForces(V: number, TOut: number, TIn: number, loadKg: number, h = 0): BalloonForces {
  const p = pressureAt(h, TOut);
  const rhoOut = airDensity(p, TOut);
  const rhoIn = airDensity(p, TIn);
  const FA = rhoOut * V * G;
  const FAir = rhoIn * V * G;
  const FLoad = (balloonEquipment(V) + loadKg) * G;
  return {
    rhoOut,
    rhoIn,
    FA,
    FAir,
    FLoad,
    net: FA - FAir - FLoad,
    liftKg: (rhoOut - rhoIn) * V,
  };
}

/**
 * Höhe, in der der Ballon schwebt (Auftrieb = Gewichtskraft), in m. Die Tragkraft
 * nimmt wie der Luftdruck mit e^(−h/H) ab: h = H · ln(Tragkraft am Boden / Masse).
 * 0, wenn er am Boden bleibt.
 */
export function equilibriumAltitude(V: number, TOut: number, TIn: number, loadKg: number): number {
  const lift0 = balloonForces(V, TOut, TIn, loadKg).liftKg;
  const mass = balloonEquipment(V) + loadKg;
  if (lift0 <= mass) return 0;
  return scaleHeight(TOut) * Math.log(lift0 / mass);
}

/** Innentemperatur in K, ab der der Ballon am Boden abhebt. */
export function liftOffTemperature(V: number, TOut: number, loadKg: number): number {
  const rhoOut = airDensity(P0, TOut);
  const rhoIn = rhoOut - (balloonEquipment(V) + loadKg) / V;
  return rhoIn > 0 ? (P0 * M_AIR) / (R_GAS * rhoIn) : Infinity;
}

/** Radius einer Kugel mit dem Volumen V (Näherung für die Hülle). */
export function sphereRadius(V: number): number {
  return Math.cbrt((3 * V) / (4 * Math.PI));
}

export interface BalloonMotion {
  /** Höhe in m. */
  h: number;
  /** Steiggeschwindigkeit in m/s. */
  v: number;
  /** Innentemperatur in K (folgt dem Brenner verzögert). */
  TIn: number;
}

/** Zeitkonstante, mit der die Innentemperatur dem eingestellten Wert folgt (s). */
export const HEAT_TAU = 25;
/** Widerstandsbeiwert der Hülle und zusätzliche lineare Dämpfung in N·s/m (frei gewählt, damit er ruhig einschwebt). */
export const BALLOON_CW = 0.5;
export const BALLOON_DAMP = 160;

/**
 * Ein Zeitschritt h (s) der senkrechten Bewegung des Ballons. Bewegt werden
 * Ballon, Zuladung, die Luft in der Hülle und mitbewegte Außenluft (Zusatzmasse
 * ½ · ρ · V wie bei einer Kugel). Am Boden steht er, bis der Auftrieb reicht.
 */
export function stepBalloon(m: BalloonMotion, V: number, TOut: number, TTarget: number, loadKg: number, h: number): BalloonMotion {
  const TIn = m.TIn + ((TTarget - m.TIn) * h) / HEAT_TAU;
  const f = balloonForces(V, TOut, TIn, loadKg, m.h);
  const mass = balloonEquipment(V) + loadKg + f.rhoIn * V + 0.5 * f.rhoOut * V;
  const r = sphereRadius(V);
  const drag = 0.5 * f.rhoOut * BALLOON_CW * Math.PI * r * r * m.v * Math.abs(m.v) + BALLOON_DAMP * m.v;
  let v = m.v + ((f.net - drag) / mass) * h;
  let alt = m.h + v * h;
  if (alt <= 0) {
    alt = 0;
    v = Math.max(0, v);
  }
  return { h: alt, v, TIn };
}
