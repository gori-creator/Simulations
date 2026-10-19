/**
 * Rechenlogik zu den Gasgesetzen (ohne Zeichnen).
 *
 * Einheiten in der Simulation: Druck p in kPa, Volumen V in L, Temperatur T in K,
 * Stoffmenge n in mol. Praktisch: 1 kPa · 1 L = 1 J, deshalb gilt mit
 * R = 8,314 J/(mol·K) direkt p = n · R · T / V (in kPa, wenn V in L).
 *
 * 1. Ideales Gas: allgemeine Gasgleichung p · V = n · R · T und die drei
 *    Zustandsänderungen mit festgehaltener Größe (isotherm, isobar, isochor).
 * 2. Messreihe: kleines Messrauschen, Ausgleichsgerade, Extrapolation auf den
 *    absoluten Nullpunkt, Linearisierung p über 1/V.
 * 3. Teilchenbild: punktförmige Teilchen in einem rechteckigen Zylinder (eben,
 *    zweidimensional) mit beweglichem Kolben. Der Druck ergibt sich aus dem
 *    Impuls, den die Teilchen bei den Stößen an die Wände abgeben; er wird mit
 *    dem idealen Wert N · k · T / A verglichen (Plausibilitätsprüfung).
 */

/** Universelle Gaskonstante in J/(mol·K). */
export const R = 8.314462618;
/** 0 °C in Kelvin. */
export const ZERO_CELSIUS = 273.15;
/** Avogadro-Konstante in 1/mol. */
export const AVOGADRO = 6.02214076e23;
/** Boltzmann-Konstante in J/K. */
export const BOLTZMANN = 1.380649e-23;
/** Normdruck in kPa. */
export const P_NORMAL = 101.325;

/** Einstellbereiche (Regler). */
export const V_MIN = 10;
export const V_MAX = 50;
/** Fassungsvermögen des gezeichneten Zylinders in L (Skala am Glas). */
export const V_CAP = 55;
export const THETA_MIN = -50;
export const THETA_MAX = 250;
export const P_MIN = 50;
export const P_MAX = 300;
export const N_MIN = 0.5;
export const N_MAX = 2;

export type Mode = 'isotherm' | 'isobar' | 'isochor';

/** Celsius → Kelvin. */
export const kelvin = (theta: number): number => theta + ZERO_CELSIUS;
/** Kelvin → Celsius. */
export const celsius = (T: number): number => T - ZERO_CELSIUS;

/** Druck in kPa aus n (mol), T (K) und V (L). */
export function pressure(n: number, T: number, V: number): number {
  return (n * R * T) / V;
}

/** Volumen in L aus n (mol), T (K) und p (kPa). */
export function volume(n: number, T: number, p: number): number {
  return (n * R * T) / p;
}

/** Temperatur in K aus n (mol), p (kPa) und V (L). */
export function temperature(n: number, p: number, V: number): number {
  return (p * V) / (n * R);
}

/** Stoffmenge in mol aus p (kPa), V (L) und T (K). */
export function amount(p: number, V: number, T: number): number {
  return (p * V) / (R * T);
}

export interface GasState {
  /** Druck in kPa. */
  p: number;
  /** Volumen in L. */
  V: number;
  /** Temperatur in K. */
  T: number;
  /**
   * Kolben am Anschlag (nur isobar): −1 unten, +1 oben, 0 frei.
   * Am Anschlag ist der Druck nicht mehr durch das Gewicht festgelegt.
   */
  stop: -1 | 0 | 1;
}

/**
 * Gleichgewichtszustand im jeweiligen Versuch.
 * - isotherm und isochor: V ist vorgegeben (Kolben verschoben bzw. arretiert), p folgt.
 * - isobar: p ist durch das Gewicht auf dem Kolben vorgegeben, V folgt – es sei denn,
 *   der Kolben stößt an einen Anschlag (V_MIN bzw. V_MAX); dann folgt p aus V.
 */
export function equilibrium(mode: Mode, n: number, T: number, V: number, pLoad: number, vMin = V_MIN, vMax = V_MAX): GasState {
  if (mode !== 'isobar') return { p: pressure(n, T, V), V, T, stop: 0 };
  const free = volume(n, T, pLoad);
  if (free > vMax) return { p: pressure(n, T, vMax), V: vMax, T, stop: 1 };
  if (free < vMin) return { p: pressure(n, T, vMin), V: vMin, T, stop: -1 };
  return { p: pLoad, V: free, T, stop: 0 };
}

/** Isotherme Zustandsänderung (Boyle-Mariotte): p₁ · V₁ = p₂ · V₂. */
export function isothermal(s: GasState, V2: number): GasState {
  return { p: (s.p * s.V) / V2, V: V2, T: s.T, stop: 0 };
}

/** Isobare Zustandsänderung (Gay-Lussac): V₁ / T₁ = V₂ / T₂. */
export function isobaric(s: GasState, T2: number): GasState {
  return { p: s.p, V: (s.V * T2) / s.T, T: T2, stop: 0 };
}

/** Isochore Zustandsänderung (Amontons): p₁ / T₁ = p₂ / T₂. */
export function isochoric(s: GasState, T2: number): GasState {
  return { p: (s.p * T2) / s.T, V: s.V, T: T2, stop: 0 };
}

/** Größe, die im Versuch konstant bleibt, und der zugehörige konstante Ausdruck. */
export function invariant(mode: Mode, s: Pick<GasState, 'p' | 'V' | 'T'>): number {
  if (mode === 'isotherm') return s.p * s.V;
  if (mode === 'isobar') return s.V / s.T;
  return s.p / s.T;
}

/** Messbereiche des Manometers in kPa. */
export const GAUGE_RANGES = [100, 150, 200, 250, 300, 400, 500, 600, 800, 1000];

/** Kleinster Messbereich, der den Wert (mit 5 % Reserve) fasst. */
export function rangeFor(pMax: number): number {
  for (const r of GAUGE_RANGES) if (r >= pMax * 1.05) return r;
  return GAUGE_RANGES[GAUGE_RANGES.length - 1]!;
}

/**
 * Messbereich für einen Versuch: so gewählt, dass er sich beim Durchführen
 * des Versuchs (Kolben schieben bzw. Heizen) nicht ändert.
 */
export function gaugeRange(mode: Mode, n: number, T: number, V: number, pLoad: number): number {
  if (mode === 'isotherm') return rangeFor(pressure(n, T, V_MIN));
  if (mode === 'isochor') return rangeFor(pressure(n, kelvin(THETA_MAX), V));
  return rangeFor(Math.max(pLoad * 1.2, equilibrium('isobar', n, kelvin(THETA_MAX), V, pLoad).p));
}

/* ------------------------------------------------------------------ */
/* Messreihe und Auswertung                                            */
/* ------------------------------------------------------------------ */

/** Messwert mit relativem Messrauschen (Normalverteilung, Standardabweichung `rel`). */
export function noisy(value: number, rel: number, rand: () => number): number {
  if (rel <= 0) return value;
  const u = Math.max(1e-12, rand());
  const v = rand();
  return value * (1 + rel * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v));
}

export interface LineFit {
  /** Steigung und Achsenabschnitt von y = m · x + b. */
  m: number;
  b: number;
}

/** Ausgleichsgerade (kleinste Quadrate); null bei weniger als zwei verschiedenen x-Werten. */
export function fitLine(points: readonly (readonly [number, number])[]): LineFit | null {
  const k = points.length;
  if (k < 2) return null;
  let sx = 0;
  let sy = 0;
  for (const [x, y] of points) {
    sx += x;
    sy += y;
  }
  const mx = sx / k;
  const my = sy / k;
  let sxx = 0;
  let sxy = 0;
  for (const [x, y] of points) {
    sxx += (x - mx) ** 2;
    sxy += (x - mx) * (y - my);
  }
  if (sxx < 1e-12) return null;
  const m = sxy / sxx;
  return { m, b: my - m * mx };
}

/** Nullstelle der Ausgleichsgeraden (Extrapolation, z. B. auf V = 0). */
export function xIntercept(fit: LineFit): number {
  return fit.m === 0 ? NaN : -fit.b / fit.m;
}

/** Ursprungsgerade y = c · x (kleinste Quadrate); null ohne Werte. */
export function fitOrigin(points: readonly (readonly [number, number])[]): number | null {
  let sxy = 0;
  let sxx = 0;
  for (const [x, y] of points) {
    sxy += x * y;
    sxx += x * x;
  }
  return sxx > 0 ? sxy / sxx : null;
}

/**
 * Hyperbel p = c / V durch Messwerte (Linearisierung: p über 1/V ist eine
 * Ursprungsgerade mit der Steigung c = p · V).
 */
export function fitHyperbola(points: readonly { p: number; V: number }[]): number | null {
  return fitOrigin(points.map((q) => [1 / q.V, q.p] as const));
}

/* ------------------------------------------------------------------ */
/* Teilchenbild                                                        */
/* ------------------------------------------------------------------ */

/** Teilchen im Bild je mol Gas (Modell!). */
export const PARTICLES_PER_MOL = 24;

/** Anzahl der gezeichneten Teilchen zur Stoffmenge n. */
export function particleCount(n: number): number {
  return Math.max(1, Math.round(PARTICLES_PER_MOL * n));
}

/** „k·T“ im Modell (Masse 1) bei 0 °C: mittleres Geschwindigkeitsquadrat je Richtung. */
export const MODEL_KT0 = 12;

/** „k·T“ im Modell zur Temperatur T (in K); proportional zu T. */
export function modelKT(T: number): number {
  return (MODEL_KT0 * Math.max(0, T)) / ZERO_CELSIUS;
}

/** Druck eines idealen Gases in der Ebene: p = N · k · T / A. */
export function idealPressure2D(N: number, kT: number, area: number): number {
  return area > 0 ? (N * kT) / area : 0;
}

/** Mittlere Geschwindigkeit von Gasteilchen (Maxwell-Verteilung) in m/s; M in kg/mol. */
export function meanSpeed(T: number, M: number): number {
  return Math.sqrt((8 * R * Math.max(0, T)) / (Math.PI * M));
}

/** Molare Masse von Stickstoff N₂ in kg/mol (Hauptbestandteil der Luft). */
export const M_N2 = 0.028014;

/** Zufallszahl mit Normalverteilung (Box-Muller). */
export function gauss(rand: () => number): number {
  const u = Math.max(1e-12, rand());
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Wand, an der ein Stoß stattfand. */
export const WALL_LEFT = 0;
export const WALL_RIGHT = 1;
export const WALL_BOTTOM = 2;
export const WALL_PISTON = 3;

export interface GasStepOptions {
  /** Ziel-„k·T“ des Thermostats (Wärmebad bzw. Heizplatte). */
  kT: number;
  /** Geschwindigkeit des Kolbens (nach oben positiv), Einheiten pro Sekunde. */
  pistonSpeed?: number;
  /** Zeitkonstante des Thermostats in s. */
  tau?: number;
  /** Rate, mit der einzelne Geschwindigkeiten neu ausgelost werden (pro Teilchen und s). */
  shuffle?: number;
  /** Rückmeldung je Wandstoß (Lage und Wand), z. B. zum Aufblitzen. */
  onHit?: (x: number, y: number, wall: number) => void;
}

/**
 * Punktförmige Teilchen (ideales Gas) in einem Rechteck der Breite `width` und
 * der Höhe `height` (Kolben oben). Die Mittelpunkte bleiben um `radius` von den
 * Wänden entfernt, damit die gezeichneten Kugeln die Wand berühren.
 * Untereinander stoßen die Teilchen nicht; ein Thermostat (die Wand zum
 * Wärmebad) hält die mittlere Bewegungsenergie bei n · k · T und lost einzelne
 * Geschwindigkeiten neu aus (Maxwell-Verteilung).
 */
export class GasBox {
  readonly cap: number;
  readonly x: Float64Array;
  readonly y: Float64Array;
  readonly vx: Float64Array;
  readonly vy: Float64Array;
  /** Anzahl der aktiven Teilchen (die ersten `count`). */
  count = 0;
  /** Summe der an die Wände abgegebenen Impulse (Masse 1) seit dem letzten Zurücksetzen. */
  impulse = 0;
  /** Dauer der Impulsmessung in s. */
  measured = 0;
  /** Zeitintegral der wirksamen Wandlänge (für den Druck). */
  perimeterTime = 0;

  constructor(
    cap: number,
    public width: number,
    public height: number,
    readonly radius: number,
    private readonly rand: () => number,
  ) {
    this.cap = cap;
    this.x = new Float64Array(cap);
    this.y = new Float64Array(cap);
    this.vx = new Float64Array(cap);
    this.vy = new Float64Array(cap);
  }

  /** Fläche, in der sich die Teilchenmittelpunkte bewegen. */
  area(): number {
    return Math.max(0, this.width - 2 * this.radius) * Math.max(0, this.height - 2 * this.radius);
  }

  /** Wirksame Wandlänge (Umfang des Bereichs der Mittelpunkte). */
  perimeter(): number {
    return 2 * Math.max(0, this.width - 2 * this.radius) + 2 * Math.max(0, this.height - 2 * this.radius);
  }

  /** Anzahl ändern: neue Teilchen zufällig verteilt mit thermischer Geschwindigkeit; Rückgabe: Index des ersten neuen. */
  setCount(n: number, kT: number): number {
    n = Math.max(0, Math.min(this.cap, Math.round(n)));
    const first = this.count;
    const s = Math.sqrt(Math.max(0, kT));
    const r = this.radius;
    for (let i = this.count; i < n; i++) {
      this.x[i] = r + this.rand() * Math.max(0, this.width - 2 * r);
      this.y[i] = r + this.rand() * Math.max(0, this.height - 2 * r);
      this.vx[i] = gauss(this.rand) * s;
      this.vy[i] = gauss(this.rand) * s;
    }
    this.count = n;
    return first;
  }

  /** Bewegungsenergie aller aktiven Teilchen (Masse 1). */
  kinetic(): number {
    let e = 0;
    for (let i = 0; i < this.count; i++) e += 0.5 * (this.vx[i]! ** 2 + this.vy[i]! ** 2);
    return e;
  }

  /** Impulsmessung neu beginnen. */
  resetMeasurement(): void {
    this.impulse = 0;
    this.measured = 0;
    this.perimeterTime = 0;
  }

  /** Gemessener Druck in der Ebene: Impuls je Wandlänge und Zeit. */
  measuredPressure(): number {
    return this.perimeterTime > 0 ? this.impulse / this.perimeterTime : 0;
  }

  /**
   * Kolben auf eine neue Höhe setzen, ohne Zeit vergehen zu lassen (z. B. bei
   * angehaltener Uhr): die Teilchen werden in der Höhe mitgestaucht bzw. gedehnt.
   */
  squeeze(height: number): void {
    const r = this.radius;
    const old = Math.max(1e-6, this.height - 2 * r);
    const now = Math.max(1e-6, height - 2 * r);
    for (let i = 0; i < this.count; i++) this.y[i] = r + ((this.y[i]! - r) * now) / old;
    this.height = height;
  }

  /** Ein Zeitschritt h: freier Flug, elastische Wandstöße (Kolben ggf. bewegt), Thermostat. */
  step(h: number, opts: GasStepOptions): void {
    const { x, y, vx, vy } = this;
    const r = this.radius;
    const u = opts.pistonSpeed ?? 0;
    const left = r;
    const right = this.width - r;
    const bottom = r;
    this.height += u * h;
    const top = Math.max(bottom + 1e-3, this.height - r);
    let J = 0;
    for (let i = 0; i < this.count; i++) {
      let xi = x[i]! + h * vx[i]!;
      let yi = y[i]! + h * vy[i]!;
      if (xi < left) {
        xi = 2 * left - xi;
        J += 2 * Math.abs(vx[i]!);
        vx[i] = Math.abs(vx[i]!);
        opts.onHit?.(left, yi, WALL_LEFT);
      } else if (xi > right) {
        xi = 2 * right - xi;
        J += 2 * Math.abs(vx[i]!);
        vx[i] = -Math.abs(vx[i]!);
        opts.onHit?.(right, yi, WALL_RIGHT);
      }
      if (yi < bottom) {
        yi = 2 * bottom - yi;
        J += 2 * Math.abs(vy[i]!);
        vy[i] = Math.abs(vy[i]!);
        opts.onHit?.(xi, bottom, WALL_BOTTOM);
      } else if (yi > top) {
        // Stoß an den (bewegten) Kolben: Relativgeschwindigkeit kehrt sich um
        const rel = vy[i]! - u;
        if (rel > 0) {
          J += 2 * rel;
          vy[i] = u - rel;
          opts.onHit?.(xi, top, WALL_PISTON);
        }
        yi = Math.max(bottom, 2 * top - yi);
      }
      x[i] = Math.min(right, Math.max(left, xi));
      y[i] = Math.min(top, Math.max(bottom, yi));
    }
    this.impulse += J;
    this.measured += h;
    this.perimeterTime += this.perimeter() * h;
    this.thermostat(h, opts.kT, opts.tau ?? 0.3, opts.shuffle ?? 0.6);
  }

  /** Berendsen-Thermostat (mittlere Bewegungsenergie = count · kT) und gelegentliches Neuauslosen. */
  private thermostat(h: number, kT: number, tau: number, shuffle: number): void {
    const n = this.count;
    if (n === 0) return;
    const ke = this.kinetic();
    const target = n * kT;
    if (ke > 1e-12) {
      const lam = Math.sqrt(Math.min(1.21, Math.max(0.81, 1 + (h / tau) * (target / ke - 1))));
      for (let i = 0; i < n; i++) {
        this.vx[i]! *= lam;
        this.vy[i]! *= lam;
      }
    }
    const s = Math.sqrt(Math.max(0, kT));
    for (let i = 0; i < n; i++) {
      if (this.rand() < shuffle * h) {
        this.vx[i] = gauss(this.rand) * s;
        this.vy[i] = gauss(this.rand) * s;
      }
    }
  }
}
