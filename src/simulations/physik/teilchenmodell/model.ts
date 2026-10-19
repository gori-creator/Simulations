/**
 * Rechenlogik zum Teilchenmodell (ohne Zeichnen).
 *
 * 1. Wärmelehre im Großen: Eine Wasserprobe (0,5 kg) wird mit konstanter
 *    Leistung geheizt oder gekühlt. Aus der zugeführten Energie folgen
 *    Temperatur und Anteile fest/flüssig/gasförmig. Beim Schmelzen und Sieden
 *    bleibt die Temperatur konstant, bis die Schmelz- bzw. Verdampfungswärme
 *    zugeführt ist (Plateaus im Temperatur-Zeit-Diagramm).
 * 2. Teilchen im Kleinen: vereinfachte Molekulardynamik in der Ebene. Alle
 *    Teilchen stoßen sich ab; Teilchen im Festkörper sind über Federn an
 *    Gitterplätze gebunden, Teilchen in der Flüssigkeit ziehen sich an und
 *    sammeln sich unten, Teilchen im Gas fliegen frei. Ein Thermostat hält die
 *    mittlere Bewegungsenergie proportional zur absoluten Temperatur.
 * 3. Diffusion: Teilchen auf einem dicht gepackten Gitter tauschen zufällig
 *    mit Nachbarn die Plätze. Die Tauschrate wächst mit der Temperatur wie die
 *    Diffusionskonstante von Wasser (Stokes-Einstein: D ~ T/η).
 */

/** 0 °C in Kelvin. */
export const ZERO_CELSIUS = 273.15;
/** Boltzmann-Konstante in J/K. */
export const BOLTZMANN = 1.380649e-23;

export interface Substance {
  /** Schmelz- und Siedetemperatur in °C (bei Normaldruck). */
  melt: number;
  boil: number;
  /** Spezifische Wärmekapazitäten in J/(kg·K). */
  cSolid: number;
  cLiquid: number;
  cGas: number;
  /** Spezifische Schmelz- und Verdampfungswärme in J/kg. */
  latentMelt: number;
  latentBoil: number;
  /** Masse eines Teilchens (Moleküls) in kg. */
  molecule: number;
}

/** Wasser (Tabellenwerte, gerundet). */
export const WATER: Substance = {
  melt: 0,
  boil: 100,
  cSolid: 2100,
  cLiquid: 4190,
  cGas: 2000,
  latentMelt: 334e3,
  latentBoil: 2257e3,
  molecule: 2.9915e-26, // 18,015 u
};

/** Masse der Probe in kg. */
export const SAMPLE_MASS = 0.5;
/** Einstellbarer Temperaturbereich in °C. */
export const THETA_MIN = -30;
export const THETA_MAX = 130;

export type Phase = 'solid' | 'melting' | 'liquid' | 'boiling' | 'gas';

export interface PhaseState {
  /** Temperatur in °C. */
  theta: number;
  /** Anteile 0 … 1 (Summe 1). */
  solid: number;
  liquid: number;
  gas: number;
  phase: Phase;
}

/** Grenzen der Energie-Abschnitte (Bezug: Eis bei der Schmelztemperatur, H = 0). */
function levels(sub: Substance, m: number): { h1: number; h2: number; h3: number } {
  const h1 = m * sub.latentMelt;
  const h2 = h1 + m * sub.cLiquid * (sub.boil - sub.melt);
  const h3 = h2 + m * sub.latentBoil;
  return { h1, h2, h3 };
}

/**
 * Innere Energie H (in J) einer Probe, die vollständig in einem Zustand ist:
 * bis zur Schmelztemperatur fest, bis zur Siedetemperatur flüssig, darüber gasförmig.
 */
export function enthalpy(theta: number, sub: Substance = WATER, m = SAMPLE_MASS): number {
  if (theta <= sub.melt) return m * sub.cSolid * (theta - sub.melt);
  const { h1, h3 } = levels(sub, m);
  if (theta <= sub.boil) return h1 + m * sub.cLiquid * (theta - sub.melt);
  return h3 + m * sub.cGas * (theta - sub.boil);
}

/** Temperatur und Anteile der Zustände zur Energie H. */
export function phaseState(H: number, sub: Substance = WATER, m = SAMPLE_MASS): PhaseState {
  const { h1, h2, h3 } = levels(sub, m);
  if (H <= 0) return { theta: sub.melt + H / (m * sub.cSolid), solid: 1, liquid: 0, gas: 0, phase: 'solid' };
  if (H < h1) {
    const f = H / h1;
    return { theta: sub.melt, solid: 1 - f, liquid: f, gas: 0, phase: 'melting' };
  }
  if (H <= h2) return { theta: sub.melt + (H - h1) / (m * sub.cLiquid), solid: 0, liquid: 1, gas: 0, phase: 'liquid' };
  if (H < h3) {
    const f = (H - h2) / (m * sub.latentBoil);
    return { theta: sub.boil, solid: 0, liquid: 1 - f, gas: f, phase: 'boiling' };
  }
  return { theta: sub.boil + (H - h3) / (m * sub.cGas), solid: 0, liquid: 0, gas: 1, phase: 'gas' };
}

/** Energie für Schmelzen bzw. Verdampfen der ganzen Probe in J. */
export function latentHeats(sub: Substance = WATER, m = SAMPLE_MASS): { melt: number; boil: number } {
  return { melt: m * sub.latentMelt, boil: m * sub.latentBoil };
}

/** Celsius → Kelvin. */
export const kelvin = (theta: number): number => theta + ZERO_CELSIUS;

/** Mittlere Bewegungsenergie eines Teilchens in J: E = 3/2 · k · T. */
export function meanKineticEnergy(theta: number): number {
  return 1.5 * BOLTZMANN * Math.max(0, kelvin(theta));
}

/** Mittlere Geschwindigkeit der Teilchen (Gas, Maxwell-Verteilung) in m/s. */
export function meanSpeed(theta: number, molecule = WATER.molecule): number {
  return Math.sqrt((8 * BOLTZMANN * Math.max(0, kelvin(theta))) / (Math.PI * molecule));
}

/**
 * Häufigkeitsdichte der Geschwindigkeiten im ebenen Modell (Rayleigh-Verteilung)
 * mit dem Mittelwert `mean`; Einheit 1/(m/s).
 */
export function speedDensity(v: number, mean: number): number {
  if (v <= 0 || mean <= 0) return 0;
  return ((Math.PI * v) / (2 * mean * mean)) * Math.exp((-Math.PI * v * v) / (4 * mean * mean));
}

/* ------------------------------------------------------------------ */
/* Molekulardynamik (Längen in Teilchendurchmessern, Masse 1)          */
/* ------------------------------------------------------------------ */

export const SOLID = 0;
export const LIQUID = 1;
export const GAS = 2;

/** Konstanten des Teilchenmodells (Einheiten: Teilchendurchmesser, Sekunden im Bild). */
export const MD = {
  /** Federhärte der Abstoßung bei Berührung. */
  repulsion: 3000,
  /** Federhärte der Bindung an den Gitterplatz (Festkörper). */
  tether: 900,
  /** Tiefe und Reichweite der Anziehung (Flüssigkeit, Festkörper). */
  cohesion: 6,
  cohesionRange: 1.5,
  /** „Schwere“ der Flüssigkeit: hält sie unten im Gefäß. */
  gravity: 60,
  /** Gitterabstand im Festkörper. */
  spacing: 1.12,
  /** Effektivwert der Geschwindigkeit bei 0 °C. */
  v0: 4,
};

/** Effektivwert der Geschwindigkeit im Bild (Durchmesser pro Sekunde) – proportional zu √T. */
export function thermalSpeed(theta: number): number {
  return MD.v0 * Math.sqrt(Math.max(0, kelvin(theta)) / ZERO_CELSIUS);
}

/** „k·T“ im Modell (Masse 1, Ebene): mittlere Bewegungsenergie pro Teilchen. */
export function modelKT(theta: number): number {
  const v = thermalSpeed(theta);
  return (v * v) / 2;
}

/**
 * Umrechnung Bild → Wirklichkeit: Faktor in (m/s) pro (Durchmesser/s), so gewählt,
 * dass die mittlere Geschwindigkeit im Modell der von Wassermolekülen entspricht.
 */
export const SPEED_SCALE = meanSpeed(0) / ((MD.v0 * Math.sqrt(Math.PI)) / 2);

export interface Site {
  x: number;
  y: number;
}

/**
 * Gitterplätze eines Kristalls (Dreiecksgitter) unten in der Mitte des Gefäßes,
 * sortiert in der Reihenfolge des Erstarrens: unten in der Mitte zuerst,
 * oben am Rand zuletzt (dort schmilzt der Kristall zuerst).
 */
export function latticeSites(cols: number, rows: number, width: number, spacing = MD.spacing): Site[] {
  const out: (Site & { key: number })[] = [];
  const cx = width / 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = cx + (c - (cols - 1) / 2 + (r % 2 ? 0.25 : -0.25)) * spacing;
      const y = 0.5 + 0.04 + r * spacing * 0.866;
      out.push({ x, y, key: r + (0.55 * Math.abs(x - cx)) / spacing + 0.001 * c });
    }
  }
  out.sort((a, b) => a.key - b.key);
  return out.map(({ x, y }) => ({ x, y }));
}

/** Zufallszahl mit Normalverteilung (Box-Muller). */
export function gauss(rand: () => number): number {
  const u = Math.max(1e-12, rand());
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export interface StepOptions {
  /** Ziel-„k·T“ des Thermostats; ohne Angabe: kein Thermostat (Energie bleibt erhalten). */
  kT?: number;
  /** Zeitkonstante des Thermostats in s. */
  tau?: number;
  /** Rate zufälliger Neuauslosung einzelner Geschwindigkeiten (pro Teilchen und s). */
  shuffle?: number;
}

/**
 * Teilchen in einem rechteckigen Gefäß (Breite × Höhe, Höhe = Kolben).
 * Rollen: SOLID (Feder zum Gitterplatz), LIQUID (Anziehung + Schwere), GAS (frei).
 * Beim Wechsel der Rolle gleiten die Kräfte weich auf die neuen Werte.
 */
export class ParticleBox {
  readonly n: number;
  readonly x: Float64Array;
  readonly y: Float64Array;
  readonly vx: Float64Array;
  readonly vy: Float64Array;
  readonly fx: Float64Array;
  readonly fy: Float64Array;
  readonly role: Uint8Array;
  /** Gitterplatz eines festen Teilchens (−1: keiner). */
  readonly site: Int16Array;
  /** Stärke von Gitterfeder, Schwere und Anziehung (0 … 1, gleitet zur Rolle). */
  readonly tether: Float64Array;
  readonly grav: Float64Array;
  readonly coh: Float64Array;
  /** Besetzer der Gitterplätze; besetzt sind immer die ersten `solidCount` Plätze. */
  readonly owner: Int16Array;
  solidCount = 0;
  potential = 0;
  /** Weiche Rollenwechsel (false: Kräfte springen, z. B. für Tests). */
  ramp = true;

  constructor(
    n: number,
    public width: number,
    public height: number,
    readonly sites: Site[],
    private readonly rand: () => number,
  ) {
    this.n = n;
    this.x = new Float64Array(n);
    this.y = new Float64Array(n);
    this.vx = new Float64Array(n);
    this.vy = new Float64Array(n);
    this.fx = new Float64Array(n);
    this.fy = new Float64Array(n);
    this.role = new Uint8Array(n).fill(GAS);
    this.site = new Int16Array(n).fill(-1);
    this.tether = new Float64Array(n);
    this.grav = new Float64Array(n);
    this.coh = new Float64Array(n);
    this.owner = new Int16Array(sites.length).fill(-1);
  }

  /** Höhe, bis zu der Festkörper und Flüssigkeit reichen (für die Kolbenlage). */
  condensedHeight(): number {
    const area = this.n * MD.spacing * MD.spacing * 0.866;
    return area / this.width + 0.5;
  }

  /**
   * Startaufstellung: `nSolid` Teilchen auf den Gitterplätzen, dann die
   * Flüssigkeit auf weiteren Plätzen darüber, das Gas zufällig verteilt.
   */
  arrange(nSolid: number, nGas: number, kT: number): void {
    const n = this.n;
    nSolid = Math.max(0, Math.min(n, nSolid));
    nGas = Math.max(0, Math.min(n - nSolid, nGas));
    this.owner.fill(-1);
    this.solidCount = nSolid;
    const nLiquid = n - nSolid - nGas;
    let k = 0;
    for (let i = 0; i < n; i++) {
      this.site[i] = -1;
      if (i < nSolid + nLiquid && k < this.sites.length) {
        const s = this.sites[k]!;
        this.x[i] = s.x + (i < nSolid ? 0 : (this.rand() - 0.5) * 0.1);
        this.y[i] = s.y;
        if (i < nSolid) {
          this.owner[k] = i;
          this.site[i] = k;
        }
        k++;
        this.role[i] = i < nSolid ? SOLID : LIQUID;
      } else {
        this.role[i] = GAS;
        const y0 = Math.min(this.height - 1, this.condensedHeight() * ((n - nGas) / n) + 0.8);
        let best: [number, number] = [0.5 + this.rand() * (this.width - 1), y0 + this.rand() * (this.height - 0.5 - y0)];
        for (let tries = 0; tries < 60; tries++) {
          const cand: [number, number] = [0.5 + this.rand() * (this.width - 1), y0 + this.rand() * Math.max(0, this.height - 0.5 - y0)];
          let ok = true;
          for (let j = 0; j < i; j++) {
            if ((this.x[j]! - cand[0]) ** 2 + (this.y[j]! - cand[1]) ** 2 < 1.1) {
              ok = false;
              break;
            }
          }
          best = cand;
          if (ok) break;
        }
        this.x[i] = best[0];
        this.y[i] = best[1];
      }
      const r = this.role[i]!;
      this.tether[i] = r === SOLID ? 1 : 0;
      this.grav[i] = r === LIQUID ? 1 : 0;
      this.coh[i] = r === GAS ? 0 : 1;
      const s = Math.sqrt(Math.max(0, kT));
      this.vx[i] = gauss(this.rand) * s;
      this.vy[i] = gauss(this.rand) * s;
    }
    this.computeForces();
  }

  /** Anzahl der Teilchen mit einer Rolle. */
  count(role: number): number {
    let c = 0;
    for (let i = 0; i < this.n; i++) if (this.role[i] === role) c++;
    return c;
  }

  /**
   * Rollen an die Zielanzahl anpassen: Schmelzen (oberste Plätze am Rand zuerst),
   * Erstarren (nächstes freies Gitterplätzchen holt sich das nächste Teilchen),
   * Verdampfen (oberstes flüssiges Teilchen) und Kondensieren (unterstes Gasteilchen).
   */
  syncRoles(nSolid: number, nGas: number, kT: number): void {
    const n = this.n;
    nSolid = Math.max(0, Math.min(n, this.sites.length, nSolid));
    nGas = Math.max(0, Math.min(n - nSolid, nGas));
    while (this.solidCount > nSolid) {
      this.solidCount--;
      const i = this.owner[this.solidCount]!;
      this.owner[this.solidCount] = -1;
      if (i >= 0) {
        this.site[i] = -1;
        this.role[i] = LIQUID;
      }
    }
    while (this.solidCount < nSolid) {
      const s = this.sites[this.solidCount]!;
      let best = -1;
      let bd = Infinity;
      for (const want of [LIQUID, GAS]) {
        for (let i = 0; i < n; i++) {
          if (this.role[i] !== want) continue;
          const d = (this.x[i]! - s.x) ** 2 + (this.y[i]! - s.y) ** 2;
          if (d < bd) {
            bd = d;
            best = i;
          }
        }
        if (best >= 0) break;
      }
      if (best < 0) break;
      this.role[best] = SOLID;
      this.site[best] = this.solidCount;
      this.owner[this.solidCount] = best;
      this.solidCount++;
    }
    let gas = this.count(GAS);
    while (gas < nGas) {
      let best = -1;
      for (let i = 0; i < n; i++) if (this.role[i] === LIQUID && (best < 0 || this.y[i]! > this.y[best]!)) best = i;
      if (best < 0) break;
      this.role[best] = GAS;
      const s = Math.sqrt(Math.max(0, kT));
      this.vx[best] = gauss(this.rand) * s * 0.6;
      this.vy[best] = Math.sqrt(2) * s * (1.1 + 0.3 * this.rand());
      gas++;
    }
    while (gas > nGas) {
      let best = -1;
      for (let i = 0; i < n; i++) if (this.role[i] === GAS && (best < 0 || this.y[i]! < this.y[best]!)) best = i;
      if (best < 0) break;
      this.role[best] = LIQUID;
      gas--;
    }
  }

  /** Kräfte berechnen; Rückgabe: Lageenergie (Abstoßung, Anziehung, Schwere, Federn). */
  computeForces(): number {
    const { n, x, y, fx, fy, coh } = this;
    const K = MD.repulsion;
    const eps = MD.cohesion;
    const rc = MD.cohesionRange;
    const rc2 = rc * rc;
    const wl = rc - 1;
    let U = 0;
    fx.fill(0);
    fy.fill(0);
    for (let i = 0; i < n; i++) {
      const xi = x[i]!;
      const yi = y[i]!;
      const ci = coh[i]!;
      for (let j = i + 1; j < n; j++) {
        const dx = x[j]! - xi;
        const dy = y[j]! - yi;
        const r2 = dx * dx + dy * dy;
        if (r2 >= rc2) continue;
        const r = Math.sqrt(r2) || 1e-9;
        let f = 0;
        if (r < 1) {
          f += K * (1 - r);
          U += 0.5 * K * (1 - r) * (1 - r);
        }
        const c = Math.min(ci, coh[j]!);
        if (c > 0) {
          if (r <= 1) U -= eps * c;
          else {
            const s = (r - 1) / wl;
            U -= eps * c * 0.5 * (1 + Math.cos(Math.PI * s));
            f -= ((eps * c * 0.5 * Math.PI) / wl) * Math.sin(Math.PI * s);
          }
        }
        if (f !== 0) {
          const ux = (f * dx) / r;
          const uy = (f * dy) / r;
          fx[j]! += ux;
          fy[j]! += uy;
          fx[i]! -= ux;
          fy[i]! -= uy;
        }
      }
    }
    const g = MD.gravity;
    const kt = MD.tether;
    for (let i = 0; i < n; i++) {
      const gi = this.grav[i]!;
      if (gi > 0) {
        fy[i]! -= g * gi;
        U += g * gi * y[i]!;
      }
      const ti = this.tether[i]!;
      const s = this.site[i]!;
      if (ti > 0 && s >= 0) {
        const site = this.sites[s]!;
        const dx = x[i]! - site.x;
        const dy = y[i]! - site.y;
        fx[i]! -= kt * ti * dx;
        fy[i]! -= kt * ti * dy;
        U += 0.5 * kt * ti * (dx * dx + dy * dy);
      }
    }
    this.potential = U;
    return U;
  }

  /** Bewegungsenergie (Masse 1). */
  kinetic(): number {
    let e = 0;
    for (let i = 0; i < this.n; i++) e += 0.5 * (this.vx[i]! ** 2 + this.vy[i]! ** 2);
    return e;
  }

  totalEnergy(): number {
    return this.kinetic() + this.potential;
  }

  /** Ein Zeitschritt h (Geschwindigkeits-Verlet), danach optional Thermostat. */
  step(h: number, opts: StepOptions = {}): void {
    const { n, x, y, vx, vy, fx, fy } = this;
    if (this.ramp) {
      for (let i = 0; i < n; i++) {
        const r = this.role[i]!;
        const tT = r === SOLID ? 1 : 0;
        const tG = r === LIQUID ? 1 : 0;
        const tC = r === GAS ? 0 : 1;
        const t0 = this.tether[i]!;
        this.tether[i] = tT > t0 ? Math.min(tT, t0 + h / 0.7) : Math.max(tT, t0 - h / 0.2);
        const g0 = this.grav[i]!;
        this.grav[i] = tG > g0 ? Math.min(tG, g0 + h / 0.35) : Math.max(tG, g0 - h / 0.25);
        const c0 = this.coh[i]!;
        this.coh[i] = tC > c0 ? Math.min(tC, c0 + h / 0.3) : Math.max(tC, c0 - h / 0.15);
        // Teilchen, die gerade einen Gitterplatz einnehmen, kommen gedämpft zur Ruhe
        if (r === SOLID && this.tether[i]! < 1) {
          vx[i]! *= 1 - 5 * h;
          vy[i]! *= 1 - 5 * h;
        }
      }
    }
    const top = this.height - 0.5;
    const right = this.width - 0.5;
    for (let i = 0; i < n; i++) {
      vx[i]! += 0.5 * h * fx[i]!;
      vy[i]! += 0.5 * h * fy[i]!;
      let xi = x[i]! + h * vx[i]!;
      let yi = y[i]! + h * vy[i]!;
      // elastische Wände (Boden, Seiten, Kolben)
      if (xi < 0.5) {
        xi = 1 - xi;
        vx[i] = Math.abs(vx[i]!);
      } else if (xi > right) {
        xi = 2 * right - xi;
        vx[i] = -Math.abs(vx[i]!);
      }
      if (yi < 0.5) {
        yi = 1 - yi;
        vy[i] = Math.abs(vy[i]!);
      } else if (yi > top) {
        yi = Math.max(0.5, 2 * top - yi);
        vy[i] = -Math.abs(vy[i]!);
      }
      x[i] = Math.min(right, Math.max(0.5, xi));
      y[i] = Math.min(Math.max(0.5, top), Math.max(0.5, yi));
    }
    this.computeForces();
    for (let i = 0; i < n; i++) {
      vx[i]! += 0.5 * h * fx[i]!;
      vy[i]! += 0.5 * h * fy[i]!;
    }
    if (opts.kT !== undefined) this.thermostat(h, opts.kT, opts.tau ?? 0.4, opts.shuffle ?? 0.4);
  }

  /** Berendsen-Thermostat (mittlere Bewegungsenergie = n · kT) und gelegentliches Neuauslosen. */
  private thermostat(h: number, kT: number, tau: number, shuffle: number): void {
    const n = this.n;
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

/* ------------------------------------------------------------------ */
/* Diffusion                                                           */
/* ------------------------------------------------------------------ */

/**
 * Viskosität von Wasser in Pa·s (Näherung nach Vogel:
 * η = A · 10^(B/(T − C)), gut zwischen 0 °C und 100 °C).
 */
export function waterViscosity(theta: number): number {
  return 2.414e-5 * 10 ** (247.8 / (kelvin(theta) - 140));
}

/** Wie viel schneller als bei 20 °C diffundiert ein Stoff in Wasser? D ~ T/η (Stokes-Einstein). */
export function diffusionFactor(theta: number): number {
  return (kelvin(theta) / kelvin(20)) * (waterViscosity(20) / waterViscosity(theta));
}

/** Tauschrate je Nachbarpaar bei 20 °C (pro Sekunde im Bild). */
export const SWAP_RATE_20 = 0.5;

/** Tauschrate je Nachbarpaar bei der Temperatur θ. */
export function swapRate(theta: number): number {
  return SWAP_RATE_20 * diffusionFactor(theta);
}

/**
 * Dicht gepackte Teilchen auf einem Dreiecksgitter (cols × rows). Teilchen
 * tauschen zufällig mit Nachbarn die Plätze. `field` ist der Erwartungswert der
 * Tinte je Platz; er folgt genau der Diffusionsgleichung auf dem Gitter.
 */
export class SwapLattice {
  readonly n: number;
  /** Lage der Plätze (Abstand 1, y nach oben). */
  readonly px: Float64Array;
  readonly py: Float64Array;
  /** Nachbarpaare als Folge (a, b, a, b, …). */
  readonly bonds: Int32Array;
  /** Teilchen auf Platz k. */
  readonly at: Int32Array;
  /** Platz von Teilchen i. */
  readonly where: Int32Array;
  /** Ist Teilchen i Tinte? */
  readonly ink: Uint8Array;
  /** Erwartete Tinte je Platz. */
  readonly field: Float64Array;
  private readonly scratch: Float64Array;
  readonly width: number;
  readonly height: number;
  private tv0 = 1;

  constructor(
    readonly cols: number,
    readonly rows: number,
  ) {
    const n = cols * rows;
    this.n = n;
    this.px = new Float64Array(n);
    this.py = new Float64Array(n);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const k = r * cols + c;
        this.px[k] = 0.5 + c + (r % 2 ? 0.5 : 0);
        this.py[k] = 0.5 + r * 0.866;
      }
    }
    this.width = cols + 0.5;
    this.height = (rows - 1) * 0.866 + 1;
    const list: number[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const k = r * cols + c;
        if (c + 1 < cols) list.push(k, k + 1);
        if (r + 1 < rows) {
          // Nachbarn in der Reihe darüber (versetzte Reihen)
          const odd = r % 2 === 1;
          const a = odd ? c : c - 1;
          const b = odd ? c + 1 : c;
          for (const cc of [a, b]) if (cc >= 0 && cc < cols) list.push(k, (r + 1) * cols + cc);
        }
      }
    }
    this.bonds = Int32Array.from(list);
    this.at = new Int32Array(n);
    this.where = new Int32Array(n);
    for (let k = 0; k < n; k++) {
      this.at[k] = k;
      this.where[k] = k;
    }
    this.ink = new Uint8Array(n);
    this.field = new Float64Array(n);
    this.scratch = new Float64Array(n);
  }

  get bondCount(): number {
    return this.bonds.length / 2;
  }

  /** Tinte eintropfen: die `count` Teilchen am nächsten an (cx, cy) werden Tinte. */
  drop(cx: number, cy: number, count: number): void {
    const order = Array.from({ length: this.n }, (_, k) => k).sort(
      (a, b) => (this.px[a]! - cx) ** 2 + (this.py[a]! - cy) ** 2 - ((this.px[b]! - cx) ** 2 + (this.py[b]! - cy) ** 2),
    );
    this.ink.fill(0);
    this.field.fill(0);
    for (let q = 0; q < Math.min(count, this.n); q++) {
      const k = order[q]!;
      this.ink[this.at[k]!] = 1;
      this.field[k] = 1;
    }
    this.tv0 = 1;
    this.tv0 = Math.max(1e-9, this.unmixed(this.field));
  }

  /** Plätze zweier Teilchen tauschen (Paar Nummer b). */
  swap(b: number): void {
    const k1 = this.bonds[2 * b]!;
    const k2 = this.bonds[2 * b + 1]!;
    const i1 = this.at[k1]!;
    const i2 = this.at[k2]!;
    this.at[k1] = i2;
    this.at[k2] = i1;
    this.where[i1] = k2;
    this.where[i2] = k1;
  }

  /** Erwartungswert weiterrechnen: dc/dt = rate · Σ (Nachbar − eigener Wert). */
  evolve(dt: number, rate: number): void {
    if (dt <= 0 || rate <= 0) return;
    const steps = Math.max(1, Math.ceil((dt * rate * 6) / 0.3));
    const h = (dt * rate) / steps;
    const c = this.field;
    const d = this.scratch;
    const B = this.bonds;
    for (let s = 0; s < steps; s++) {
      d.fill(0);
      for (let b = 0; b < B.length; b += 2) {
        const k1 = B[b]!;
        const k2 = B[b + 1]!;
        const q = c[k2]! - c[k1]!;
        d[k1]! += q;
        d[k2]! -= q;
      }
      for (let k = 0; k < this.n; k++) c[k]! += h * d[k]!;
    }
  }

  /** Ungleichverteilung (Totalvariation über 3 × 3 Felder; 0 = gleichmäßig verteilt). */
  unmixed(values: ArrayLike<number>, cells = 3): number {
    const cnt = new Float64Array(cells * cells);
    const amt = new Float64Array(cells * cells);
    let total = 0;
    for (let k = 0; k < this.n; k++) {
      const cx = Math.min(cells - 1, Math.floor((this.px[k]! / this.width) * cells));
      const cy = Math.min(cells - 1, Math.floor((this.py[k]! / this.height) * cells));
      const q = cy * cells + cx;
      cnt[q]! += 1;
      amt[q]! += values[k]!;
      total += values[k]!;
    }
    if (total <= 0) return 0;
    let tv = 0;
    for (let q = 0; q < cells * cells; q++) tv += Math.abs(amt[q]! / total - cnt[q]! / this.n);
    return tv / 2;
  }

  /** Durchmischung 0 … 1 des Erwartungswerts (0 direkt nach dem Eintropfen, 1 = gleichmäßig). */
  mixing(): number {
    return Math.max(0, Math.min(1, 1 - this.unmixed(this.field) / this.tv0));
  }

  /** Durchmischung der tatsächlichen Teilchen (schwankt zufällig um den Erwartungswert). */
  mixingOfParticles(): number {
    const occ = new Float64Array(this.n);
    for (let k = 0; k < this.n; k++) occ[k] = this.ink[this.at[k]!]!;
    return Math.max(0, Math.min(1, 1 - this.unmixed(occ) / this.tv0));
  }
}

/** Zeit (s im Bild), bis die erwartete Durchmischung `level` erreicht (Gitter wie angegeben). */
export function timeToMix(cols: number, rows: number, inkCount: number, theta: number, level = 0.9, dropAt?: [number, number]): number {
  const lat = new SwapLattice(cols, rows);
  const [cx, cy] = dropAt ?? [lat.width / 2, lat.height - 1.6];
  lat.drop(cx, cy, inkCount);
  const rate = swapRate(theta);
  const h = 0.05;
  let t = 0;
  while (lat.mixing() < level && t < 3600) {
    lat.evolve(h, rate);
    t += h;
  }
  return t;
}
