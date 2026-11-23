/**
 * Rechenlogik „Zeitdilatation und Längenkontraktion“ (spezielle Relativitätstheorie).
 *
 * Grundlage sind Einsteins Postulate: Alle Inertialsysteme sind gleichberechtigt,
 * und Licht hat in jedem von ihnen dieselbe Geschwindigkeit c. Mit β = v/c und
 * dem Lorentzfaktor
 *
 *   γ = 1 / √(1 − β²)   (γ ≥ 1, γ → ∞ für v → c)
 *
 * gelten:
 *   Zeitdilatation:      Δt = γ · Δt₀   (Δt₀: Eigenzeit, gemessen von einer mitbewegten Uhr)
 *   Längenkontraktion:   L  = L₀ / γ    (L₀: Ruhelänge, nur in Bewegungsrichtung)
 *   Gesamtenergie:       E  = γ · m · c² = γ · E₀   (Ruheenergie E₀ = m · c²)
 *   kinetische Energie:  E_kin = (γ − 1) · E₀       (klassisch: ½ · m · v² = ½ · β² · E₀)
 *   Impuls:              p  = γ · m · v,   p · c = γ · β · E₀
 *
 * Lichtuhr: Ein Lichtpuls läuft zwischen zwei Spiegeln im Abstand d hin und her.
 * Im Ruhesystem der Uhr dauert ein Tick Δt₀ = 2d/c. Vom Bahnsteig aus läuft der
 * Puls schräg (der Zug fährt weiter); nach Pythagoras gilt
 *   (c · Δt/2)² = d² + (v · Δt/2)²   →   Δt = γ · Δt₀.
 *
 * Gleichzeitigkeit: Eine Lampe in der Zugmitte blitzt. Im Zug erreicht das Licht
 * beide Enden zugleich (nach L₀/(2c)). Vom Bahnsteig aus läuft das hintere Ende
 * dem Licht entgegen, das vordere davon: t_h = (L/2)/(c + v), t_v = (L/2)/(c − v)
 * mit L = L₀/γ. Der Unterschied ist Δt = γ · v · L₀ / c².
 *
 * Einheiten: SI (m, s, kg, J); Energien von Teilchen in MeV.
 */

/** Lichtgeschwindigkeit im Vakuum in m/s (exakt, Definition des Meters). */
export const C = 299_792_458;
/** Größte einstellbare Geschwindigkeit als Bruchteil von c (Regler). */
export const BETA_MAX = 0.999;
/** Mittlere Lebensdauer eines ruhenden Myons in s (gerundet 2,2 µs, wie im Unterricht). */
export const MUON_TAU = 2.2e-6;
/** Sekunden pro Tag. */
export const DAY = 86_400;

/** Lorentzfaktor γ = 1/√(1 − β²); für |β| ≥ 1 unendlich. */
export function gamma(beta: number): number {
  const b2 = beta * beta;
  return b2 >= 1 ? Infinity : 1 / Math.sqrt(1 - b2);
}

/**
 * γ − 1, auch für sehr kleine β genau (sonst geht der winzige Unterschied bei
 * Alltagsgeschwindigkeiten in der Rundung verloren):
 * γ − 1 = β² / (√(1 − β²) · (1 + √(1 − β²))).
 */
export function gammaMinusOne(beta: number): number {
  const b2 = beta * beta;
  if (b2 >= 1) return Infinity;
  const s = Math.sqrt(1 - b2);
  return b2 / (s * (1 + s));
}

/** Geschwindigkeit β = v/c zu einem Lorentzfaktor γ ≥ 1: β = √(1 − 1/γ²). */
export function betaFromGamma(g: number): number {
  if (!(g >= 1)) return 0;
  return Math.sqrt(1 - 1 / (g * g));
}

/** Zeitdilatation: Δt = γ · Δt₀ (Δt₀ = Eigenzeit der bewegten Uhr). */
export function dilatedTime(t0: number, beta: number): number {
  return gamma(beta) * t0;
}

/** Eigenzeit aus der Zeit im „ruhenden“ System: Δt₀ = Δt / γ. */
export function properTime(t: number, beta: number): number {
  return t / gamma(beta);
}

/** Längenkontraktion: L = L₀ / γ = L₀ · √(1 − β²). */
export function contractedLength(L0: number, beta: number): number {
  const b2 = beta * beta;
  return b2 >= 1 ? 0 : L0 * Math.sqrt(1 - b2);
}

/* ---------- Lichtuhr ---------- */

export interface LightClock {
  /** Dauer eines Ticks (hin und zurück) im Ruhesystem der Uhr: Δt₀ = 2d/c. */
  t0: number;
  /** Dauer desselben Ticks vom Bahnsteig aus: Δt = γ · Δt₀. */
  t: number;
  /** Weg des Lichts pro Hälfte vom Bahnsteig aus (Hypotenuse): c · Δt/2. */
  hyp: number;
  /** Strecke, die der Zug währenddessen fährt (Kathete): v · Δt/2. */
  run: number;
  /** Spiegelabstand d (Kathete). */
  d: number;
}

/** Lichtuhr mit Spiegelabstand d (in m) bei der Geschwindigkeit β. */
export function lightClock(d: number, beta: number): LightClock {
  const t0 = (2 * d) / C;
  const t = gamma(beta) * t0;
  return { t0, t, hyp: (C * t) / 2, run: (beta * C * t) / 2, d };
}

/**
 * Lage des Lichtpulses in der Lichtuhr nach der Zeit τ (Eigenzeit, in Ticks
 * gemessen): Höhe zwischen 0 (unterer Spiegel) und 1 (oberer Spiegel), Dreieck-
 * schwingung mit der Periode 1.
 */
export function pulseHeight(ticks: number): number {
  const u = ticks - Math.floor(ticks);
  return u < 0.5 ? 2 * u : 2 - 2 * u;
}

/* ---------- Relativität der Gleichzeitigkeit ---------- */

export interface Simultaneity {
  /** Im Zug: Licht erreicht beide Enden nach L₀/(2c). */
  tTrain: number;
  /** Vom Bahnsteig: Ankunft am hinteren Ende (L/2)/(c + v). */
  tBack: number;
  /** Vom Bahnsteig: Ankunft am vorderen Ende (L/2)/(c − v). */
  tFront: number;
  /** Zeitunterschied tFront − tBack = γ · v · L₀ / c². */
  dt: number;
  /** Länge des Zuges vom Bahnsteig aus L = L₀/γ. */
  L: number;
}

/** Lampe in der Mitte eines Zuges der Ruhelänge L₀ blitzt (β ≥ 0, Zug fährt nach vorn). */
export function simultaneity(L0: number, beta: number): Simultaneity {
  const L = contractedLength(L0, beta);
  const half = L / 2;
  const tBack = half / (C * (1 + beta));
  const tFront = beta >= 1 ? Infinity : half / (C * (1 - beta));
  return { tTrain: L0 / (2 * C), tBack, tFront, dt: (gamma(beta) * beta * L0) / C, L };
}

/* ---------- Myonen in der Atmosphäre ---------- */

/** Mittlere Flugstrecke bis zum Zerfall: β · c · γ · τ (mit Zeitdilatation) bzw. β · c · τ (klassisch). */
export function meanFlight(beta: number, tau = MUON_TAU, relativistic = true): number {
  return beta * C * tau * (relativistic ? gamma(beta) : 1);
}

/** Flugzeit für die Höhe h (m) im System der Erde: t = h / v. */
export function flightTime(h: number, beta: number): number {
  return beta > 0 ? h / (beta * C) : Infinity;
}

/**
 * Anteil der Myonen, die nach der Höhe h noch nicht zerfallen sind:
 * N/N₀ = exp(−t/(γ·τ)) mit t = h/v (mit Zeitdilatation) bzw. exp(−t/τ) (klassisch).
 * Gleichwertig im System des Myons: Eigenzeit h/(γ·v) für die verkürzte Strecke h/γ.
 */
export function survival(h: number, beta: number, tau = MUON_TAU, relativistic = true): number {
  if (beta <= 0) return h > 0 ? 0 : 1;
  return Math.exp(-h / meanFlight(beta, tau, relativistic));
}

/* ---------- Energie und Impuls ---------- */

export interface Particle {
  id: 'e' | 'mu' | 'p';
  /** Ruheenergie E₀ = m·c² in MeV (CODATA 2018, gerundet). */
  e0: number;
  /** Masse in kg. */
  m: number;
}

export const PARTICLES: Record<Particle['id'], Particle> = {
  e: { id: 'e', e0: 0.51099895, m: 9.1093837e-31 },
  mu: { id: 'mu', e0: 105.6583755, m: 1.883531627e-28 },
  p: { id: 'p', e0: 938.27208816, m: 1.67262192e-27 },
};

export interface Energies {
  /** Lorentzfaktor. */
  g: number;
  /** Ruheenergie E₀ = m·c². */
  e0: number;
  /** Gesamtenergie E = γ · E₀. */
  e: number;
  /** kinetische Energie (γ − 1) · E₀. */
  kin: number;
  /** klassische kinetische Energie ½ · β² · E₀ (= ½ m v²). */
  kinClassic: number;
  /** p · c = γ · β · E₀ (Impuls in MeV/c). */
  pc: number;
}

/** Energien eines Teilchens der Ruheenergie e0 (beliebige Energieeinheit) bei β. */
export function energies(e0: number, beta: number): Energies {
  const g = gamma(beta);
  return { g, e0, e: g * e0, kin: gammaMinusOne(beta) * e0, kinClassic: 0.5 * beta * beta * e0, pc: g * beta * e0 };
}

/** Geschwindigkeit β, bei der die kinetische Energie den Wert kin (gleiche Einheit wie e0) hat. */
export function betaFromKinetic(e0: number, kin: number): number {
  return betaFromGamma(1 + Math.max(0, kin) / e0);
}

/* ---------- Beispiele aus Alltag und Forschung ---------- */

export interface Example {
  id: 'ice' | 'jet' | 'gps' | 'iss' | 'earth' | 'probe' | 'tube' | 'muon' | 'lhc';
  /** Geschwindigkeit in m/s. */
  v: number;
  /** Name. */
  label: { de: string; en: string };
  /** Kurzname für die Beschriftung im Diagramm. */
  short: { de: string; en: string };
  /** Kurze Erklärung. */
  note: { de: string; en: string };
}

/**
 * Typische Geschwindigkeiten (gerundete Richtwerte). LHC: Protonen mit 6,8 TeV
 * (γ ≈ 7250), Elektronenröhre: Elektronen nach 25 kV (γ ≈ 1,05).
 */
export const EXAMPLES: readonly Example[] = [
  { id: 'ice', v: 300 / 3.6, short: { de: 'ICE', en: 'train' }, label: { de: 'ICE (300 km/h)', en: 'High-speed train (300 km/h)' }, note: { de: 'schnellster Zug in Deutschland', en: 'fastest trains in Germany' } },
  { id: 'jet', v: 250, short: { de: 'Flugzeug', en: 'airliner' }, label: { de: 'Verkehrsflugzeug', en: 'Airliner' }, note: { de: 'rund 900 km/h', en: 'about 900 km/h' } },
  { id: 'gps', v: 3874, short: { de: 'GPS', en: 'GPS' }, label: { de: 'GPS-Satellit', en: 'GPS satellite' }, note: { de: 'Bahn in 20 200 km Höhe', en: 'orbit at 20,200 km' } },
  { id: 'iss', v: 7660, short: { de: 'ISS', en: 'ISS' }, label: { de: 'ISS', en: 'ISS' }, note: { de: 'Raumstation in 400 km Höhe', en: 'space station at 400 km' } },
  { id: 'earth', v: 29_780, short: { de: 'Erde', en: 'Earth' }, label: { de: 'Erde um die Sonne', en: 'Earth around the Sun' }, note: { de: 'Bahngeschwindigkeit', en: 'orbital speed' } },
  { id: 'probe', v: 191_700, short: { de: 'Sonde', en: 'probe' }, label: { de: 'Parker Solar Probe', en: 'Parker Solar Probe' }, note: { de: 'schnellste Raumsonde (2024)', en: 'fastest spacecraft (2024)' } },
  { id: 'tube', v: 0.302 * C, short: { de: 'Röhre', en: 'tube' }, label: { de: 'Elektron in einer Röhre', en: 'Electron in a tube' }, note: { de: 'nach 25 kV Beschleunigungsspannung', en: 'after a 25 kV accelerating voltage' } },
  { id: 'muon', v: 0.998 * C, short: { de: 'Myon', en: 'muon' }, label: { de: 'Myon aus der Höhenstrahlung', en: 'Cosmic-ray muon' }, note: { de: 'entsteht in etwa 10 km Höhe', en: 'created at about 10 km altitude' } },
  { id: 'lhc', v: C * betaFromGamma(6800 / 0.93827208816 + 1), short: { de: 'LHC', en: 'LHC' }, label: { de: 'Proton im LHC', en: 'Proton in the LHC' }, note: { de: '6,8 TeV kinetische Energie', en: '6.8 TeV kinetic energy' } },
];

/** Wie viel geht eine bewegte Uhr pro Tag gegenüber einer ruhenden nach? (γ − 1)/γ · 1 Tag, in s. */
export function lagPerDay(v: number): number {
  const b = v / C;
  return (gammaMinusOne(b) / gamma(b)) * DAY;
}

/* ---------- Zahlen in Zehnerpotenz-Schreibweise ---------- */

export interface Sci {
  /** Mantisse 1 ≤ |m| < 10 (gerundet auf `digits` Nachkommastellen). */
  m: number;
  /** Exponent zur Basis 10. */
  e: number;
}

/** Zerlegt x in m · 10^e (gerundet; 9,996 → 1,00 · 10¹). */
export function sci(x: number, digits = 1): Sci {
  if (x === 0 || !Number.isFinite(x)) return { m: x, e: 0 };
  let e = Math.floor(Math.log10(Math.abs(x)));
  let m = x / 10 ** e;
  const f = 10 ** digits;
  m = Math.round(m * f) / f;
  if (Math.abs(m) >= 10) {
    m /= 10;
    e += 1;
  }
  return { m, e };
}

/** „Schöne“ Schrittweite (1, 2, 5 · 10^k) von mindestens x. */
export function niceStep(x: number): number {
  if (!(x > 0)) return 1;
  const p = 10 ** Math.floor(Math.log10(x));
  for (const k of [1, 2, 5, 10]) if (k * p >= x * (1 - 1e-9)) return k * p;
  return 10 * p;
}

/** Obergrenze der γ-Achse: mindestens 2, sonst etwas Luft über γ, auf ganze Zahlen bzw. Schritte gerundet. */
export function gammaAxisTop(g: number): number {
  const want = Math.max(2, g * 1.18 + 0.2);
  const step = niceStep(want / 5);
  return Math.ceil(want / step - 1e-9) * step;
}
