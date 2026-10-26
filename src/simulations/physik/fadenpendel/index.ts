import { clamp, defineSimulation, drawLabStand, ease, FixedStepper, lerp, Plot, prefersReducedMotion, roundRect, scaledSprite, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  amplitudeForDeviation,
  amplitudeHalfLife,
  crossingTime,
  energies,
  exactPeriod,
  fitSeries,
  forces,
  harmonic,
  maxSpeed,
  periodFactor,
  PLANETS,
  reactionError,
  releaseEnergy,
  seriesFactor,
  slackAngle,
  smallAnglePeriod,
  speedAt,
  step,
  tension,
  toDeg,
  toRad,
  type PlanetId,
  type State,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'swing' | 'graphs' | 'period' | 'large' | 'phase';
type PanelKind = 'bars' | 'phi' | 'et' | 'tl' | 't2l' | 'tf' | 'fs' | 'ps' | 'env';
type ArrowMode = 'v' | 'F' | 'off';
type Pt = [number, number];

/** Abstand der gespeicherten Messwerte (Simulationszeit) in s und Größe des Speichers. */
const SAMPLE = 0.01;
const MAX_HIST = 6000;
/** Parameter, die die Bewegung verändern (dann beginnt sie neu). */
const PHYSICS = ['l', 'amp', 'planet', 'damping'];
/** Anzahl der gestoppten Schwingungen in der Messreihe. */
const MEASURE_N = 10;
/** Amplitude, ab der die Kleinwinkelnäherung um mehr als 1 % abweicht (≈ 22,8°). */
const ONE_PERCENT = toDeg(amplitudeForDeviation(0.01));
const TAU = 2 * Math.PI;

/** „Schöne“ Schrittweite (1, 2, 2,5, 5 · 10^k) von mindestens x. */
function niceStep(x: number): number {
  if (!(x > 0)) return 1;
  const q = 10 ** Math.floor(Math.log10(x));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * q >= x - 1e-12) return m * q;
  return 10 * q;
}

/** Obere Grenze eines Diagramms: etwas Luft über x, auf runde Werte. */
function niceTop(x: number): number {
  if (!(x > 0)) return 1;
  const s = niceStep(x / 4);
  return Math.ceil((x * 1.06) / s - 1e-9) * s;
}

/** Zeitfenster der mitlaufenden Diagramme: etwa drei Perioden, auf glatte Werte gerundet. */
function niceWindow(T: number): number {
  const want = 3.3 * T;
  for (const w of [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30]) if (w >= want) return w;
  return 40;
}

/** Messwertspeicher: Zeit, Auslenkung und Winkelgeschwindigkeit seit dem Loslassen. */
class History {
  t: number[] = [];
  phi: number[] = [];
  w: number[] = [];

  clear(): void {
    this.t = [];
    this.phi = [];
    this.w = [];
  }

  push(t: number, s: State): void {
    this.t.push(t);
    this.phi.push(s[0]);
    this.w.push(s[1]);
    if (this.t.length > MAX_HIST + 500) {
      this.t = this.t.slice(500);
      this.phi = this.phi.slice(500);
      this.w = this.w.slice(500);
    }
  }

  get size(): number {
    return this.t.length;
  }

  first(): number {
    return this.t[0] ?? 0;
  }

  /** Index des ersten Werts mit Zeit ≥ tt. */
  indexAt(tt: number): number {
    let lo = 0;
    let hi = Math.max(0, this.t.length - 1);
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.t[mid]! < tt) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  /** Zustand zur Zeit tt (linear interpoliert). */
  stateAt(tt: number): [number, number] | null {
    if (!this.t.length) return null;
    const i = this.indexAt(tt);
    const j = Math.max(0, i - 1);
    const t0 = this.t[j]!;
    const t1 = this.t[i]!;
    const u = t1 > t0 ? clamp((tt - t0) / (t1 - t0), 0, 1) : 0;
    return [lerp(this.phi[j]!, this.phi[i]!, u), lerp(this.w[j]!, this.w[i]!, u)];
  }
}

interface Geo {
  r: Rect;
  small: boolean;
  /** Aufhängepunkt (Pixel), Pendellänge in Pixeln, Radius der Kugel. */
  cx: number;
  cy: number;
  Lpx: number;
  R: number;
  tableY: number;
  /** waagerechte Ausdehnung der Schwingung in Pixeln (für das Stativ). */
  ex: number;
}

/**
 * Fadenpendel: Kugel auslenken (ziehen) und loslassen. Fünf Ansichten:
 * Pendel mit Winkelmesser, Geschwindigkeits- und Kraftpfeilen und
 * Energie-Säulen; mitlaufende Diagramme φ(t) und E(t) mit dem
 * „Geisterpendel“ der Kleinwinkelnäherung; Messreihe T über l und T² über l
 * (g bestimmen, Planeten vergleichen); große Auslenkung mit exakter
 * Periodendauer und Fadenkraft; Phasendiagramm und Einhüllende der Dämpfung.
 */
export default defineSimulation({
  id: 'fadenpendel',
  animated: true,
  dragHint: true,
  hint: (v: { readonly mode?: unknown }) =>
    v.mode === 'period'
      ? L('Tipp: Länge wählen (auch durch Antippen eines Diagramms), dann „10 Schwingungen stoppen“.', 'Tip: choose the length (or tap a graph), then “Time 10 oscillations”.')
      : v.mode === 'large'
        ? L('Tipp: Kugel zur Seite ziehen und loslassen – oder im Diagramm T/T₀ den Winkel antippen.', 'Tip: drag the bob aside and let go – or tap an angle in the T/T₀ graph.')
        : v.mode === 'graphs'
          ? L('Tipp: Kugel zur Seite ziehen und loslassen. Diagramm antippen: Zeitmarke setzen.', 'Tip: drag the bob aside and let go. Tap a graph to set a time marker.')
          : L('Tipp: Kugel mit Maus oder Finger zur Seite ziehen und loslassen.', 'Tip: drag the bob aside with the mouse or a finger and let go.'),
  layout: { aspect: 1.75, aspectNarrow: 0.62 },
  groups: [
    { id: 'world', label: L('Ort und Reibung', 'Location and friction') },
    { id: 'measure', label: L('Messung', 'Measurement') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'swing', label: L('Pendel', 'Pendulum') },
        { value: 'graphs', label: L('Diagramme', 'Graphs') },
        { value: 'period', label: L('Periodendauer messen', 'Measure the period') },
        { value: 'large', label: L('Große Auslenkung', 'Large amplitude') },
        { value: 'phase', label: L('Phasendiagramm und Dämpfung', 'Phase diagram and damping') },
      ],
      default: 'swing',
    },
    { key: 'l', type: 'number', label: L('Pendellänge l', 'Length l'), min: 0.2, max: 2.5, step: 0.01, default: 1, unit: 'm' },
    {
      key: 'amp',
      type: 'number',
      label: L('Auslenkung beim Loslassen φ₀', 'Release angle φ₀'),
      help: L('Oder: die Kugel im Bild zur Seite ziehen und loslassen.', 'Or: drag the bob aside in the picture and let go.'),
      min: -170,
      max: 170,
      step: 1,
      default: 20,
      unit: '°',
    },
    { key: 'm', type: 'number', label: L('Masse m', 'Mass m'), min: 0.1, max: 2, step: 0.1, default: 0.5, unit: 'kg' },
    {
      key: 'planet',
      type: 'choice',
      group: 'world',
      label: L('Ort', 'Location'),
      options: [
        { value: 'erde', label: L('Erde', 'Earth') },
        { value: 'mond', label: L('Mond', 'Moon') },
        { value: 'mars', label: L('Mars', 'Mars') },
        { value: 'jupiter', label: L('Jupiter', 'Jupiter') },
      ],
      default: 'erde',
    },
    {
      key: 'damping',
      type: 'number',
      group: 'world',
      label: L('Dämpfung k', 'Damping k'),
      help: L('Reibung bremst das Pendel proportional zur Geschwindigkeit. Die Amplitude nimmt dann mit e^(−γ·t) ab, mit γ = k/2.', 'Friction slows the pendulum in proportion to its speed. The amplitude then decreases as e^(−γ·t) with γ = k/2.'),
      min: 0,
      max: 0.5,
      step: 0.01,
      default: 0,
      unit: '1/s',
    },
    {
      key: 'react',
      type: 'boolean',
      group: 'measure',
      label: L('Handstoppung mit Reaktionszeit', 'Hand timing with reaction time'),
      help: L('Beim Starten und Stoppen der Uhr entsteht ein kleiner zufälliger Fehler – wie bei einer echten Messung.', 'Starting and stopping the watch adds a small random error – like a real measurement.'),
      default: true,
      visibleIf: (v) => v.mode === 'period',
    },
    { key: 'compare', type: 'boolean', group: 'view', label: L('Vergleich: Kleinwinkelnäherung', 'Compare: small-angle approximation'), default: false },
    { key: 'energy', type: 'boolean', group: 'view', label: L('Energien anzeigen', 'Show energies'), default: true, visibleIf: (v) => v.mode === 'swing' },
    {
      key: 'arrows',
      type: 'choice',
      group: 'view',
      label: L('Pfeile an der Kugel', 'Arrows on the bob'),
      options: [
        { value: 'v', label: L('Geschwindigkeit', 'velocity') },
        { value: 'F', label: L('Kräfte', 'forces') },
        { value: 'off', label: L('keine', 'none') },
      ],
      default: 'v',
    },
    { key: 'slow', type: 'boolean', group: 'view', label: L('Zeitlupe', 'Slow motion'), default: false },
  ],
  actions: [
    { id: 'release', label: L('Loslassen', 'Release'), primary: true },
    { id: 'measure', label: L('10 Schwingungen stoppen', 'Time 10 oscillations'), visibleIf: (v) => v.mode === 'period' },
    { id: 'clear', label: L('Messreihe löschen', 'Clear the measurements'), visibleIf: (v) => v.mode === 'period' },
  ],
  images: { bob: 'pendelkugel.webp', stand: 'stativ.webp' },
  readouts: [
    { key: 'formula', label: L('Periodendauer (Kleinwinkelnäherung)', 'Period (small-angle approximation)'), spoiler: true },
    { key: 'exact', label: L('Periodendauer bei φ₀ (exakt)', 'Period at φ₀ (exact)'), spoiler: true },
    { key: 'measured', label: L('Gemessene Periodendauer', 'Measured period'), spoiler: true },
    { key: 'series', label: L('Messreihe', 'Series of measurements') },
    { key: 'fit', label: L('Auswertung: g aus der Steigung', 'Evaluation: g from the slope'), spoiler: true },
    { key: 'large', label: L('Große Auslenkung', 'Large amplitude') },
    { key: 'damp', label: L('Dämpfung', 'Damping') },
    { key: 'en', label: L('Energie', 'Energy'), spoiler: true },
    { key: 'forces', label: L('Kräfte (momentan)', 'Forces (right now)') },
    { key: 'now', label: L('Momentan', 'Right now') },
  ],
  presets: [
    { id: 'start', label: L('Kleine Auslenkung', 'Small amplitude'), values: {} },
    { id: 'large', label: L('Große Auslenkung im Vergleich', 'Large amplitude compared'), values: { mode: 'large', amp: 120, compare: true } },
    { id: 'graphs', label: L('Diagramme: Näherung läuft davon', 'Graphs: the approximation drifts'), values: { mode: 'graphs', amp: 70, compare: true } },
    { id: 'measure', label: L('Messreihe: g bestimmen', 'Measurements: determine g'), values: { mode: 'period', amp: 6 } },
    { id: 'seconds', label: L('Sekundenpendel', 'Seconds pendulum'), values: { l: 0.99 } },
    { id: 'moon', label: L('Auf dem Mond', 'On the Moon'), values: { planet: 'mond' } },
    { id: 'damped', label: L('Gedämpft im Phasendiagramm', 'Damped in the phase diagram'), values: { mode: 'phase', amp: 40, damping: 0.2 } },
  ],
  strings: {
    de: {
      canvas: 'Fadenpendel am Stativ mit Winkelmesser und je nach Ansicht Energie-Säulen, Diagrammen der Auslenkung und Energie über der Zeit, Messreihe der Periodendauer, Periodendauer bei großer Auslenkung oder Phasendiagramm',
      erde: 'Erde',
      mond: 'Mond',
      mars: 'Mars',
      jupiter: 'Jupiter',
      axisT: 't in s',
      axisL: 'l in m',
      axisA: 'φ₀ in °',
      axisPhi: 'φ in °',
      tPhi: 'Auslenkung φ(t) in °',
      tEt: 'Energie in J',
      tTl: 'Messreihe: T in s über l',
      tT2l: 'T² in s² über l',
      tTf: 'Verlängerung T/T_{0} über φ_{0}',
      tFs: 'Fadenkraft F_{S}/(m · g) über φ',
      tPs: 'Phasendiagramm: v in m/s über φ',
      tEnv: 'φ(t) in ° und Einhüllende',
      tBars: 'Energie in J',
      pot: 'Lage',
      kin: 'Bewegung',
      heat: 'innere',
      total: 'Summe',
      mass: 'm = {m} kg',
      approx: 'Kleinwinkelnäherung',
      approxShort: 'Näherung',
      exactCurve: 'exakt',
      series2: '1 + φ_{0}²/16 + …',
      onePct: '< 1 %',
      slack: 'F_{S} < 0: Faden wäre schlaff',
      slackShort: 'Faden schlaff',
      push: 'Stange drückt',
      fG: 'F_{G}',
      fR: 'F_{R}',
      fS: 'F_{S}',
      weightLine: 'F_{S} = F_{G}',
      lLabel: 'l = {l} m',
      hLabel: 'h = {h}',
      vLabel: 'v = {v} m/s',
      T0: 'T_{0} = {t} s',
      TT: 'T = {t} s',
      Tmeas: 'T ≈ {t} s',
      factor: 'T = {f} · T_{0}',
      bottom: 'unten: {f} · m · g',
      env: '±φ_{0} · e^(−γ·t)',
      half: 't½ = {t} s',
      speedup: 'Zeitraffer ×{f}',
      watch: '{t} s · n = {n}',
      watchDone: '10 · T = {t} s',
      slope: 'k = {k} s²/m → g = {g} m/s²',
      found: 'g ≈ {g} m/s² (Tabelle: {g0} m/s²)',
      seriesEmpty: 'Hier erscheinen die Messpunkte.',
      seriesHint: 'Drücke „10 Schwingungen stoppen“ – dann l ändern.',
      tapL: 'Antippen: Länge wählen',
      scrubHint: 'Diagramm antippen: Zeitmarke',
      hZero: 'φ₀ = 0°: Das Pendel hängt still – keine Schwingung. Kugel zur Seite ziehen!',
      hRod: '|φ₀| > 90°: Ein Faden würde schlaff – gerechnet wird mit einer starren Stange.',
      hRodShort: '|φ₀| > 90°: starre Stange statt Faden',
      hSeconds: 'Sekundenpendel: T₀ ≈ 2,00 s – jede Halbschwingung dauert 1 s.',
      hPlanet: '{p}: g = {g} m/s² → T₀ ist {f}-mal so lang wie auf der Erde.',
      hMass: 'Masse ×{f}: T bleibt {t} s, alle Energien ×{f}',
      hSmall: 'Für die Messreihe kleine Auslenkung wählen (bis etwa 10°).',
      hOnePct: 'Bis φ₀ ≈ 22,8° weicht T um weniger als 1 % von T₀ ab.',
      hClosed: 'k = 0: Die Bahn schließt sich – die Energie bleibt erhalten.',
      hMeasure: 'Messung läuft: Die Uhr stoppt nach 10 vollen Schwingungen.',
      formula: '<var>T</var><sub>0</sub> = 2π · √(<var>l</var> / <var>g</var>) = 2π · √({l} m / {g} m/s²) ≈ <strong>{t} s</strong> · <var>f</var> = 1/<var>T</var><sub>0</sub> ≈ {f} Hz',
      exactText: '<var>T</var> = <var>T</var><sub>0</sub> / AGM(1; cos(<var>φ</var><sub>0</sub>/2)) ≈ <strong>{t} s</strong> – {d} % länger als die Näherung',
      exactZero: 'φ₀ = 0°: keine Schwingung',
      measuredText: '<strong>{t} s</strong> (Zeit zwischen zwei Rückkehren zum Startpunkt)',
      measuring: 'erscheint nach der ersten vollen Schwingung',
      noSwing: 'keine Schwingung',
      thNr: 'Nr.',
      thPlace: 'Ort',
      fitText: '{p}: <var>T</var>² = <var>k</var> · <var>l</var> mit <var>k</var> ≈ {k} s²/m → <var>g</var> = 4π²/<var>k</var> ≈ <strong>{g} m/s²</strong> ({n} Längen)',
      fitNone: 'Miss bei mindestens zwei verschiedenen Längen. Dann ergibt die Steigung von <var>T</var>² über <var>l</var> den Ortsfaktor.',
      seriesNone: 'Noch keine Messung. Drücke „10 Schwingungen stoppen“.',
      largeText: '<var>T</var>/<var>T</var><sub>0</sub> = 1 / AGM(1; cos({a}°/2)) ≈ <strong>{f}</strong> · Reihe 1 + <var>φ</var><sub>0</sub>²/16 + 11<var>φ</var><sub>0</sub>⁴/3072 ≈ {s}<br>Abweichung über 1 % ab <var>φ</var><sub>0</sub> ≈ 22,8°',
      largeSlack: '<br>Fadenkraft im tiefsten Punkt <var>F</var><sub>S</sub> = <var>m</var> · <var>g</var> · (3 − 2 · cos <var>φ</var><sub>0</sub>) ≈ {fs} N · schlaff wäre ein Faden ab |<var>φ</var>| ≈ {s}°',
      largeTight: '<br>Fadenkraft im tiefsten Punkt <var>F</var><sub>S</sub> = <var>m</var> · <var>g</var> · (3 − 2 · cos <var>φ</var><sub>0</sub>) ≈ {fs} N · der Faden bleibt gespannt',
      dampText: 'Einhüllende ±<var>φ</var><sub>0</sub> · e<sup>−<var>γ</var>·<var>t</var></sup> mit <var>γ</var> = <var>k</var>/2 = {g} 1/s · Halbwertszeit der Amplitude <var>t</var><sub>½</sub> = ln 2 / <var>γ</var> ≈ <strong>{h} s</strong><br>pro Periode bleiben e<sup>−2<var>γ</var><var>T</var></sup> ≈ {p} % der Energie',
      dampNone: '<var>γ</var> = 0: keine Dämpfung – die Amplitude bleibt gleich.',
      enText: '<var>E</var><sub>pot</sub> = <var>m</var> · <var>g</var> · <var>l</var> · (1 − cos <var>φ</var><sub>0</sub>) = {e} J (<var>h</var> = {h} m)<br><var>v</var><sub>max</sub> = √(2 · <var>g</var> · <var>h</var>) ≈ <strong>{v} m/s</strong> im tiefsten Punkt (ohne Dämpfung)',
      forcesText: '<var>F</var><sub>G</sub> = <var>m</var> · <var>g</var> = {fg} N · Rückstellkraft <var>F</var><sub>R</sub> = <var>m</var> · <var>g</var> · sin <var>φ</var> = {fr} N<br>Fadenkraft <var>F</var><sub>S</sub> = <var>m</var> · <var>g</var> · cos <var>φ</var> + <var>m</var> · <var>v</var>²/<var>l</var> = {fs} N',
      now: 't = {t} s · φ = {phi}° · v = {v} m/s · E_pot = {pot} J · E_kin = {kin} J',
    },
    en: {
      canvas: 'Simple pendulum on a stand with a protractor and, depending on the view, energy bars, graphs of angle and energy against time, a series of period measurements, the period at large amplitude or a phase diagram',
      erde: 'Earth',
      mond: 'Moon',
      mars: 'Mars',
      jupiter: 'Jupiter',
      axisT: 't in s',
      axisL: 'l in m',
      axisA: 'φ₀ in °',
      axisPhi: 'φ in °',
      tPhi: 'Angle φ(t) in °',
      tEt: 'Energy in J',
      tTl: 'Measurements: T in s against l',
      tT2l: 'T² in s² against l',
      tTf: 'Lengthening T/T_{0} against φ_{0}',
      tFs: 'Tension F_{T}/(m · g) against φ',
      tPs: 'Phase diagram: v in m/s against φ',
      tEnv: 'φ(t) in ° and envelope',
      tBars: 'Energy in J',
      pot: 'potential',
      kin: 'kinetic',
      heat: 'internal',
      total: 'total',
      mass: 'm = {m} kg',
      approx: 'small-angle approximation',
      approxShort: 'approximation',
      exactCurve: 'exact',
      series2: '1 + φ_{0}²/16 + …',
      onePct: '< 1 %',
      slack: 'F_{T} < 0: a string would go slack',
      slackShort: 'string slack',
      push: 'rod pushes',
      fG: 'F_{g}',
      fR: 'F_{r}',
      fS: 'F_{T}',
      weightLine: 'F_{T} = F_{g}',
      lLabel: 'l = {l} m',
      hLabel: 'h = {h}',
      vLabel: 'v = {v} m/s',
      T0: 'T_{0} = {t} s',
      TT: 'T = {t} s',
      Tmeas: 'T ≈ {t} s',
      factor: 'T = {f} · T_{0}',
      bottom: 'bottom: {f} · m · g',
      env: '±φ_{0} · e^(−γ·t)',
      half: 't½ = {t} s',
      speedup: 'time-lapse ×{f}',
      watch: '{t} s · n = {n}',
      watchDone: '10 · T = {t} s',
      slope: 'k = {k} s²/m → g = {g} m/s²',
      found: 'g ≈ {g} m/s² (table: {g0} m/s²)',
      seriesEmpty: 'The measured points appear here.',
      seriesHint: 'Press “Time 10 oscillations” – then change l.',
      tapL: 'Tap: choose the length',
      scrubHint: 'Tap a graph: time marker',
      hZero: 'φ₀ = 0°: the pendulum hangs at rest – no oscillation. Drag the bob aside!',
      hRod: '|φ₀| > 90°: a string would go slack – a rigid rod is used instead.',
      hRodShort: '|φ₀| > 90°: rigid rod instead of a string',
      hSeconds: 'Seconds pendulum: T₀ ≈ 2.00 s – each half swing takes 1 s.',
      hPlanet: '{p}: g = {g} m/s² → T₀ is {f} times as long as on Earth.',
      hMass: 'Mass ×{f}: T stays {t} s, all energies ×{f}',
      hSmall: 'Choose a small amplitude for the measurements (up to about 10°).',
      hOnePct: 'Up to φ₀ ≈ 22.8° T differs from T₀ by less than 1 %.',
      hClosed: 'k = 0: the path closes – energy is conserved.',
      hMeasure: 'Measuring: the watch stops after 10 full oscillations.',
      formula: '<var>T</var><sub>0</sub> = 2π · √(<var>l</var> / <var>g</var>) = 2π · √({l} m / {g} m/s²) ≈ <strong>{t} s</strong> · <var>f</var> = 1/<var>T</var><sub>0</sub> ≈ {f} Hz',
      exactText: '<var>T</var> = <var>T</var><sub>0</sub> / AGM(1, cos(<var>φ</var><sub>0</sub>/2)) ≈ <strong>{t} s</strong> – {d} % longer than the approximation',
      exactZero: 'φ₀ = 0°: no oscillation',
      measuredText: '<strong>{t} s</strong> (time between two returns to the starting point)',
      measuring: 'appears after the first full oscillation',
      noSwing: 'no oscillation',
      thNr: 'no.',
      thPlace: 'place',
      fitText: '{p}: <var>T</var>² = <var>k</var> · <var>l</var> with <var>k</var> ≈ {k} s²/m → <var>g</var> = 4π²/<var>k</var> ≈ <strong>{g} m/s²</strong> ({n} lengths)',
      fitNone: 'Measure at least two different lengths. The slope of <var>T</var>² against <var>l</var> then gives g.',
      seriesNone: 'No measurement yet. Press “Time 10 oscillations”.',
      largeText: '<var>T</var>/<var>T</var><sub>0</sub> = 1 / AGM(1, cos({a}°/2)) ≈ <strong>{f}</strong> · series 1 + <var>φ</var><sub>0</sub>²/16 + 11<var>φ</var><sub>0</sub>⁴/3072 ≈ {s}<br>deviation above 1 % from <var>φ</var><sub>0</sub> ≈ 22.8°',
      largeSlack: '<br>tension at the bottom <var>F</var><sub>T</sub> = <var>m</var> · <var>g</var> · (3 − 2 · cos <var>φ</var><sub>0</sub>) ≈ {fs} N · a string would go slack from |<var>φ</var>| ≈ {s}°',
      largeTight: '<br>tension at the bottom <var>F</var><sub>T</sub> = <var>m</var> · <var>g</var> · (3 − 2 · cos <var>φ</var><sub>0</sub>) ≈ {fs} N · the string stays taut',
      dampText: 'envelope ±<var>φ</var><sub>0</sub> · e<sup>−<var>γ</var>·<var>t</var></sup> with <var>γ</var> = <var>k</var>/2 = {g} 1/s · half-life of the amplitude <var>t</var><sub>½</sub> = ln 2 / <var>γ</var> ≈ <strong>{h} s</strong><br>per period e<sup>−2<var>γ</var><var>T</var></sup> ≈ {p} % of the energy remains',
      dampNone: '<var>γ</var> = 0: no damping – the amplitude stays the same.',
      enText: '<var>E</var><sub>pot</sub> = <var>m</var> · <var>g</var> · <var>l</var> · (1 − cos <var>φ</var><sub>0</sub>) = {e} J (<var>h</var> = {h} m)<br><var>v</var><sub>max</sub> = √(2 · <var>g</var> · <var>h</var>) ≈ <strong>{v} m/s</strong> at the lowest point (without damping)',
      forcesText: '<var>F</var><sub>g</sub> = <var>m</var> · <var>g</var> = {fg} N · restoring force <var>F</var><sub>r</sub> = <var>m</var> · <var>g</var> · sin <var>φ</var> = {fr} N<br>tension <var>F</var><sub>T</sub> = <var>m</var> · <var>g</var> · cos <var>φ</var> + <var>m</var> · <var>v</var>²/<var>l</var> = {fs} N',
      now: 't = {t} s · φ = {phi}° · v = {v} m/s · E_pot = {pot} J · E_kin = {kin} J',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (all: string, k: string) => vars[k] ?? all);
    const n = (v: number, d: number) => fmt.fixed(v, d);
    const mode = () => p.mode as Mode;
    const arrows = () => p.arrows as ArrowMode;
    const planetId = () => p.planet as PlanetId;
    const g = () => PLANETS[planetId()].g;
    const amp = () => toRad(p.amp);
    const T0 = () => smallAnglePeriod(p.l, g());
    const Tex = () => exactPeriod(p.l, g(), amp());
    const rod = () => Math.abs(p.amp) > 90;
    const C = {
      phi: () => ctx.theme.series[5]!,
      ghost: () => ctx.theme.series[4]!,
      pot: () => ctx.theme.series[0]!,
      kin: () => ctx.theme.series[3]!,
      heat: () => ctx.theme.series[1]!,
      good: () => ctx.theme.series[2]!,
      fG: () => ctx.theme.series[2]!,
      fR: () => ctx.theme.series[1]!,
      fS: () => ctx.theme.series[0]!,
    };
    const PLANET_COLOR: Record<PlanetId, () => string> = {
      erde: () => ctx.theme.series[0]!,
      mond: () => ctx.theme.series[5]!,
      mars: () => ctx.theme.series[1]!,
      jupiter: () => ctx.theme.series[3]!,
    };

    /* ---------- Aufteilung der Bühne (gleitet beim Wechsel der Ansicht) ---------- */
    const panelsOf = (m: Mode): PanelKind[] =>
      m === 'swing' ? (p.energy ? ['bars'] : []) : m === 'graphs' ? ['phi', 'et'] : m === 'period' ? ['tl', 't2l'] : m === 'large' ? ['tf', 'fs'] : ['ps', 'env'];
    const wide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const splitTarget = () => {
      const m = mode();
      if (!panelsOf(m).length) return 1;
      if (wide()) return m === 'swing' ? clamp(1 - 250 / surface.width, 0.6, 0.78) : surface.width < 760 ? 0.47 : 0.5;
      return m === 'swing' ? 0.64 : 0.47;
    };
    let split = -1;
    const HIDDEN: Rect = { x: -20, y: -20, w: 1, h: 1 };

    function regions(): { scene: Rect; panels: Rect[] } {
      const w = surface.width;
      const h = surface.height;
      const s = split < 0 ? splitTarget() : split;
      const kinds = panelsOf(mode());
      const gap = 8;
      if (wide()) {
        const sw = Math.round(w * s);
        const scene: Rect = { x: 0, y: 0, w: sw >= w - 4 ? w : sw, h };
        const col: Rect = { x: sw + 10, y: 0, w: w - sw - 10, h };
        if (col.w < 30 || !kinds.length) return { scene, panels: [] };
        return { scene, panels: stack(col, kinds.length, gap) };
      }
      const sh = Math.round(h * s);
      const scene: Rect = { x: 0, y: 0, w, h: sh >= h - 4 ? h : sh };
      const rest: Rect = { x: 0, y: sh + gap, w, h: h - sh - gap };
      if (rest.h < 30 || !kinds.length) return { scene, panels: [] };
      return { scene, panels: stack(rest, kinds.length, gap) };
    }

    function stack(r: Rect, count: number, gap: number): Rect[] {
      const each = (r.h - gap * (count - 1)) / count;
      return Array.from({ length: count }, (_, i) => ({ x: r.x, y: r.y + i * (each + gap), w: r.w, h: each }));
    }

    const charts = [0, 1].map(
      (i) =>
        new Plot(surface, {
          x: [0, 1],
          y: [0, 1],
          equalAspect: false,
          pan: false,
          zoom: false,
          controls: false,
          region: () => regions().panels[i] ?? HIDDEN,
          xAxis: { label: '' },
          yAxis: { label: '' },
        }),
    );

    /* ---------- Zustand ---------- */
    let state: [number, number] = [amp(), 0];
    let t = 0;
    let nextSample = SAMPLE;
    const hist = new History();
    const stepper = new FixedStepper(0.0005);
    /** Zeitpunkte, zu denen das Pendel wieder am Startumkehrpunkt ist (erster Eintrag: 0). */
    let returns: number[] = [0];
    let scrub: number | null = null;
    let series: { l: number; T: number; planet: PlanetId; reading: number }[] = [];
    let meas: { err: number; speed: number; done: boolean; reading: number } | null = null;
    let transient: { text: string; until: number } | null = null;
    let lastMass = p.m;
    let disp = { pot: 0, kin: 0, heat: 0, T0: T0(), phi: amp() };
    let view: { cx: number; cy: number; Lpx: number } | null = null;
    let geo: Geo | null = null;
    let drag: { moved: boolean; x: number; y: number } | null = null;
    let hover = false;
    let lastFrame = performance.now();

    // Übergänge
    const intro = new Tween(1200, ease.outCubic);
    const fade = new Tween(520, ease.inOutCubic);
    const countPop = new Tween(420, ease.outBack);
    const resultPop = new Tween(650, ease.outBack);

    function restart(): void {
      state = [amp(), 0];
      t = 0;
      nextSample = SAMPLE;
      hist.clear();
      hist.push(0, state);
      stepper.reset();
      returns = [0];
      scrub = null;
      meas = null;
    }

    /** Angezeigter Zustand: live oder an der Zeitmarke. */
    function now(): { t: number; s: State } {
      if (scrub !== null) {
        const s = hist.stateAt(scrub);
        if (s) return { t: scrub, s };
      }
      return { t, s: state };
    }
    /** Abklingkonstante γ: Der Schlüssel `damping` ist wie bisher k in φ̈ = −(g/l)·sin φ − k·φ̇, also γ = k/2. */
    const gam = () => p.damping / 2;
    const ghostAt = (tt: number) => harmonic(tt, amp(), p.l, g(), gam())[0];
    const e0 = () => releaseEnergy(amp(), p.l, g(), p.m);
    const measuring = () => meas !== null && !meas.done;

    /* ---------- Ergebnisse ---------- */
    function updateNow(): void {
      const v = now();
      const e = energies(v.s, p.l, g(), p.m);
      ctx.readout('now', tr('now', { t: fmt.fixed(v.t, 2), phi: n(toDeg(v.s[0]), 1), v: n(e.speed, 2), pot: n(e.pot, 3), kin: n(e.kin, 3) }));
      if (arrows() === 'F') {
        const f = forces(v.s, p.l, g(), p.m);
        ctx.readout('forces', { html: tr('forcesText', { fg: n(f.weight, 2), fr: n(Math.abs(f.restoring), 2), fs: n(f.tension, 2) }) });
      } else ctx.readout('forces', null);
    }

    function updateMeasured(): void {
      if (p.amp === 0) ctx.readout('measured', ctx.t('noSwing'));
      else if (returns.length >= 2) ctx.readout('measured', { html: tr('measuredText', { t: fmt.fixed(returns[returns.length - 1]! - returns[returns.length - 2]!, 3) }) });
      else ctx.readout('measured', ctx.t('measuring'));
    }

    function updateReadouts(): void {
      const m = mode();
      const t0 = T0();
      ctx.readout('formula', { html: tr('formula', { l: n(p.l, 2), g: n(g(), 2), t: fmt.fixed(t0, 3), f: n(1 / t0, 3) }) });
      if (p.amp === 0) ctx.readout('exact', ctx.t('exactZero'));
      else ctx.readout('exact', { html: tr('exactText', { t: fmt.fixed(Tex(), 3), d: n((Tex() / t0 - 1) * 100, 1) }) });
      updateMeasured();
      // Messreihe
      if (m === 'period') {
        if (!series.length) ctx.readout('series', ctx.t('seriesNone'));
        else {
          const rows = series
            .map((q, i) => `<tr${i === series.length - 1 ? ' class="is-current"' : ''}><td>${i + 1}</td><td>${ctx.t(q.planet)}</td><td>${n(q.l, 2)} m</td><td>${fmt.fixed(q.reading, 2)} s</td><td>${fmt.fixed(q.T, 3)} s</td><td>${fmt.fixed(q.T * q.T, 3)} s²</td></tr>`)
            .join('');
          ctx.readout('series', { html: `<table class="mini-table"><tr><th>${ctx.t('thNr')}</th><th>${ctx.t('thPlace')}</th><th><var>l</var></th><th>10 · <var>T</var></th><th><var>T</var></th><th><var>T</var>²</th></tr>${rows}</table>` });
        }
        const fits = (Object.keys(PLANETS) as PlanetId[])
          .map((id) => ({ id, fit: fitSeries(series.filter((q) => q.planet === id)) }))
          .filter((q) => q.fit !== null)
          .map((q) => tr('fitText', { p: ctx.t(q.id), k: n(q.fit!.slope, 3), g: n(q.fit!.g, 2), n: String(q.fit!.lengths) }));
        ctx.readout('fit', { html: fits.length ? fits.join('<br>') : ctx.t('fitNone') });
      } else {
        ctx.readout('series', null);
        ctx.readout('fit', null);
      }
      // Große Auslenkung
      if (m === 'large') {
        const a = Math.abs(amp());
        let html = tr('largeText', { a: n(Math.abs(p.amp), 0), f: n(periodFactor(a), 4), s: n(seriesFactor(a), 4) });
        const slack = slackAngle(a);
        const fs = tension(0, a, g(), p.m);
        html += slack !== null ? tr('largeSlack', { fs: n(fs, 2), s: n(toDeg(slack), 1) }) : tr('largeTight', { fs: n(fs, 2) });
        ctx.readout('large', { html });
      } else ctx.readout('large', null);
      // Dämpfung
      if (m === 'phase' || p.damping > 0) {
        if (p.damping > 0) ctx.readout('damp', { html: tr('dampText', { g: n(gam(), 3), h: n(amplitudeHalfLife(gam()), 1), p: n(Math.exp(-2 * gam() * Tex()) * 100, 1) }) });
        else ctx.readout('damp', { html: ctx.t('dampNone') });
      } else ctx.readout('damp', null);
      // Energie
      const h0 = p.l * (1 - Math.cos(amp()));
      ctx.readout('en', { html: tr('enText', { e: fmt.sig(e0(), 3), h: fmt.sig(h0, 3), v: fmt.sig(maxSpeed(amp(), p.l, g()), 3) }) });
      ctx.setAction('measure', { enabled: !ctx.locked && p.amp !== 0 && !measuring() });
      ctx.setAction('clear', { enabled: !ctx.locked && series.length > 0 });
      updateNow();
    }

    /* ---------- Zeichenhilfen ---------- */
    /** Text mit tiefgestellten Teilen: „F_{S} = 3 N“. */
    function parts(str: string): { t: string; sub: boolean }[] {
      const out: { t: string; sub: boolean }[] = [];
      const re = /_\{([^}]*)\}/g;
      let last = 0;
      let mm: RegExpExecArray | null;
      while ((mm = re.exec(str))) {
        if (mm.index > last) out.push({ t: str.slice(last, mm.index), sub: false });
        out.push({ t: mm[1]!, sub: true });
        last = re.lastIndex;
      }
      if (last < str.length) out.push({ t: str.slice(last), sub: false });
      return out;
    }

    function richWidth(str: string, size: number, weight = 700): number {
      const gx = surface.g;
      return parts(str).reduce((w, q) => {
        gx.font = `${weight} ${q.sub ? Math.round(size * 0.74) : size}px ${ctx.theme.font}`;
        return w + gx.measureText(q.t).width;
      }, 0);
    }

    function richText(str: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center', halo = true, weight = 700): number {
      const gx = surface.g;
      const theme = ctx.theme;
      const list = parts(str);
      const total = richWidth(str, size, weight);
      const start = align === 'left' ? x : align === 'right' ? x - total : x - total / 2;
      gx.textAlign = 'left';
      gx.textBaseline = 'middle';
      for (const pass of halo ? [0, 1] : [1]) {
        let cx = start;
        for (const q of list) {
          const s = q.sub ? Math.round(size * 0.74) : size;
          gx.font = `${weight} ${s}px ${theme.font}`;
          const yy = y + (q.sub ? size * 0.3 : 0);
          if (pass === 0) {
            gx.lineWidth = 3.5;
            gx.lineJoin = 'round';
            gx.strokeStyle = theme.dark ? 'rgba(16,22,31,0.85)' : 'rgba(250,251,252,0.92)';
            gx.strokeText(q.t, cx, yy);
          } else {
            gx.fillStyle = color;
            gx.fillText(q.t, cx, yy);
          }
          cx += gx.measureText(q.t).width;
        }
      }
      return total;
    }

    /** Beschriftung, die innerhalb des Rechtecks r bleibt. */
    function clampedText(str: string, x: number, y: number, size: number, color: string, r: Rect, align: CanvasTextAlign = 'center', weight = 700): void {
      const w = richWidth(str, size, weight);
      let left = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      left = clamp(left, r.x + 6, r.x + r.w - w - 6);
      richText(str, left, clamp(y, r.y + size, r.y + r.h - size), size, color, 'left', true, weight);
    }

    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, solid?: string): { w: number; h: number } {
      const gx = surface.g;
      const theme = ctx.theme;
      const w = richWidth(label, size) + 16;
      const h = size + 11;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      gx.save();
      gx.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      gx.shadowBlur = 6;
      gx.shadowOffsetY = 1;
      gx.fillStyle = solid ?? (theme.dark ? 'rgba(16,22,31,0.9)' : 'rgba(255,255,255,0.94)');
      roundRect(gx, x0, y, w, h, h / 2);
      gx.fill();
      gx.restore();
      if (!solid) {
        gx.strokeStyle = withAlpha(color, 0.45);
        gx.lineWidth = 1;
        roundRect(gx, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        gx.stroke();
      }
      richText(label, x0 + w / 2, y + h / 2 + 0.5, size, solid ? '#ffffff' : color, 'center', false);
      return { w, h };
    }

    function frame(r: Rect): void {
      const gx = surface.g;
      gx.save();
      gx.strokeStyle = ctx.theme.dark ? '#273142' : '#dfe4ec';
      gx.lineWidth = 1.2;
      roundRect(gx, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      gx.stroke();
      gx.restore();
    }

    function card(r: Rect): void {
      const gx = surface.g;
      const theme = ctx.theme;
      gx.save();
      gx.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      gx.shadowBlur = 12;
      gx.shadowOffsetY = 3;
      gx.fillStyle = theme.bg;
      roundRect(gx, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
      gx.fill();
      gx.restore();
      frame(r);
    }

    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 10, dash: number[] = []): void {
      const gx = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 2) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const h = Math.min(head, len * 0.6);
      gx.save();
      gx.strokeStyle = color;
      gx.lineWidth = width;
      gx.lineCap = 'round';
      gx.setLineDash(dash);
      gx.beginPath();
      gx.moveTo(x0, y0);
      gx.lineTo(x1 - ux * h * 0.7, y1 - uy * h * 0.7);
      gx.stroke();
      gx.setLineDash([]);
      gx.fillStyle = color;
      gx.beginPath();
      gx.moveTo(x1, y1);
      gx.lineTo(x1 - ux * h - uy * h * 0.5, y1 - uy * h + ux * h * 0.5);
      gx.lineTo(x1 - ux * h + uy * h * 0.5, y1 - uy * h - ux * h * 0.5);
      gx.closePath();
      gx.fill();
      gx.restore();
    }

    function titleChip(R: Rect, label: string, color: string, right?: string, rightColor?: string): void {
      const gx = surface.g;
      const small = R.w < 300;
      const fs = small ? 11 : 12;
      const x = R.x + 8;
      const y = R.y + 6;
      const w = richWidth(label, fs) + 14;
      gx.fillStyle = ctx.theme.dark ? 'rgba(16,22,31,0.9)' : 'rgba(255,255,255,0.94)';
      roundRect(gx, x, y, w, fs + 9, 6);
      gx.fill();
      richText(label, x + 7, y + (fs + 9) / 2 + 0.5, fs, color, 'left', false);
      if (right) {
        const wr = richWidth(right, fs - 0.5, 600);
        if (x + w + wr + 16 < R.x + R.w) {
          gx.fillStyle = ctx.theme.dark ? 'rgba(16,22,31,0.9)' : 'rgba(255,255,255,0.94)';
          roundRect(gx, R.x + R.w - 16 - wr, y, wr + 12, fs + 9, 6);
          gx.fill();
          richText(right, R.x + R.w - 10, y + (fs + 9) / 2 + 0.5, fs - 0.5, rightColor ?? ctx.theme.muted, 'right', false, 600);
        }
      }
    }

    function chartPad(R: Rect): { left: number; right: number; top: number; bottom: number } {
      const small = R.w < 300;
      return { left: small ? 40 : 48, right: small ? 12 : 16, top: small ? 32 : 36, bottom: small ? 24 : 28 };
    }

    /** Wert mit passender Stellenzahl in J. */
    const joule = (v: number, ref = e0()) => n(v, ref < 0.1 ? 4 : ref < 1 ? 3 : ref < 10 ? 2 : 1);

    /* ---------- Szene: sichtbarer Bereich ---------- */
    function bobRadius(small: boolean): number {
      return (9 + 6 * Math.cbrt(p.m)) * (small ? 0.85 : 1);
    }

    /** Zeilen der Anzeigen oben in der Szene (Werte, Legende, Hinweise). */
    const chipRows = () => 2 + Math.min(2, hints().length);

    function targetView(r: Rect): { cx: number; cy: number; Lpx: number } {
      const small = r.w < 520;
      const R = bobRadius(small);
      const a = Math.min(Math.PI, Math.abs(amp()));
      const ex = Math.max(0.42, a >= Math.PI / 2 ? 1 : Math.sin(a));
      const up = a > Math.PI / 2 ? -Math.cos(a) : 0;
      const tableY = r.y + r.h - (small ? 16 : 20);
      const PT = 8 + chipRows() * (small ? 28 : 29) + 6 + (up > 0 ? R : 0);
      const PB = r.y + r.h - tableY + R + (small ? 8 : 14);
      const standW = small ? 30 : 46;
      const PS = R + (small ? 12 : 20);
      // Maßstab: bis 1,25 m maßstäblich, längere Pendel füllen die Höhe
      const lRef = Math.max(p.l, 1.25);
      const fitW = (r.w - standW - 2 * PS) / (2 * ex * lRef);
      const fitH = (r.h - PT - PB) / ((1 + up) * lRef);
      const s = Math.max(20, Math.min(fitW, fitH));
      const Lpx = s * p.l;
      const cx = r.x + PS + Math.max(ex * Lpx, (r.w - standW - 2 * PS) / 2);
      const free = Math.max(0, r.h - PT - PB - (1 + up) * Lpx);
      const cy = r.y + PT + up * Lpx + free * 0.25;
      return { cx, cy, Lpx };
    }

    function stepView(r: Rect, dt: number): boolean {
      const target = targetView(r);
      if (!view || prefersReducedMotion()) {
        view = target;
        return false;
      }
      const u = 1 - Math.exp(-dt * 8);
      view = { cx: lerp(view.cx, target.cx, u), cy: lerp(view.cy, target.cy, u), Lpx: Math.exp(lerp(Math.log(view.Lpx), Math.log(target.Lpx), u)) };
      const done = Math.abs(view.cx - target.cx) < 0.3 && Math.abs(view.cy - target.cy) < 0.3 && Math.abs(view.Lpx - target.Lpx) < 0.3;
      if (done) view = target;
      return !done;
    }

    function buildGeo(r: Rect): Geo {
      const small = r.w < 520;
      const v = view ?? targetView(r);
      const a = Math.min(Math.PI, Math.abs(amp()));
      return {
        r,
        small,
        cx: v.cx,
        cy: v.cy,
        Lpx: v.Lpx,
        R: Math.min(bobRadius(small), v.Lpx * 0.3),
        tableY: r.y + r.h - (small ? 16 : 20),
        ex: v.Lpx * Math.max(0.42, a >= Math.PI / 2 ? 1 : Math.sin(a)),
      };
    }

    const bobAt = (g0: Geo, phi: number, grow = 1): Pt => [g0.cx + g0.Lpx * grow * Math.sin(phi), g0.cy + g0.Lpx * grow * Math.cos(phi)];

    /* ---------- Szene: Raum, Stativ, Winkelmesser ---------- */
    function drawRoom(g0: Geo): void {
      const gx = surface.g;
      const r = g0.r;
      const dark = ctx.theme.dark;
      const wall = gx.createLinearGradient(0, r.y, 0, r.y + r.h);
      wall.addColorStop(0, dark ? '#172131' : '#f1f4f8');
      wall.addColorStop(1, dark ? '#101824' : '#e1e7ee');
      gx.fillStyle = wall;
      gx.fillRect(r.x, r.y, r.w, r.h);
      // weicher Lichtfleck hinter dem Pendel
      const glow = gx.createRadialGradient(g0.cx, g0.cy + g0.Lpx * 0.55, 10, g0.cx, g0.cy + g0.Lpx * 0.55, Math.max(80, g0.Lpx * 1.1));
      glow.addColorStop(0, dark ? 'rgba(80,110,160,0.16)' : 'rgba(255,255,255,0.75)');
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      gx.fillStyle = glow;
      gx.fillRect(r.x, r.y, r.w, r.h);
      const table = gx.createLinearGradient(0, g0.tableY, 0, r.y + r.h);
      table.addColorStop(0, dark ? '#4a3a2b' : '#c49a6c');
      table.addColorStop(1, dark ? '#33281e' : '#9c7349');
      gx.fillStyle = table;
      gx.fillRect(r.x, g0.tableY, r.w, r.y + r.h - g0.tableY);
      gx.fillStyle = 'rgba(255,255,255,0.22)';
      gx.fillRect(r.x, g0.tableY, r.w, 1.5);
    }

    function drawStand(g0: Geo): void {
      const gx = surface.g;
      const dark = ctx.theme.dark;
      const rodX = Math.min(g0.r.x + g0.r.w - (g0.small ? 14 : 22), g0.cx + Math.max(g0.ex, g0.Lpx * 0.42) + g0.R + 24);
      const img = ctx.images.get('stand');
      const sc = g0.small ? 0.46 : 0.58;
      if (img && drawLabStand(gx, img, { rodX, armY: g0.cy - 4 * sc, armTo: g0.cx - 6, floorY: g0.tableY + (g0.small ? 9 : 12), scale: sc, dpr: surface.dpr, dark })) return;
      // gezeichnetes Stativ: Fuß, Stange, Ausleger, Klemme
      const metal = gx.createLinearGradient(rodX - 4, 0, rodX + 4, 0);
      metal.addColorStop(0, '#5d6570');
      metal.addColorStop(0.45, '#d5dae1');
      metal.addColorStop(1, '#5d6570');
      gx.save();
      gx.shadowColor = 'rgba(0,0,0,0.25)';
      gx.shadowBlur = 6;
      gx.shadowOffsetX = 2;
      gx.fillStyle = dark ? '#2b3340' : '#3c4552';
      roundRect(gx, rodX - 40, g0.tableY - 8, 64, 9, 3);
      gx.fill();
      gx.fillStyle = metal;
      gx.fillRect(rodX - 4, g0.cy - 18, 8, g0.tableY - 8 - (g0.cy - 18));
      const arm = gx.createLinearGradient(0, g0.cy - 4, 0, g0.cy + 4);
      arm.addColorStop(0, '#d5dae1');
      arm.addColorStop(1, '#5d6570');
      gx.fillStyle = arm;
      gx.fillRect(g0.cx - 10, g0.cy - 4, rodX - g0.cx + 10, 7);
      gx.restore();
      gx.fillStyle = dark ? '#6b7584' : '#4a5361';
      roundRect(gx, rodX - 9, g0.cy - 9, 18, 18, 3);
      gx.fill();
    }

    function drawProtractor(g0: Geo, alpha: number): void {
      const gx = surface.g;
      const theme = ctx.theme;
      const rp = clamp(g0.Lpx * 0.42, 34, 112);
      if (rp > g0.Lpx - g0.R - 4) return;
      const span = toRad(clamp(Math.max(90, Math.abs(p.amp) + 12), 90, 180));
      const a0 = Math.PI / 2 - span;
      const a1 = Math.PI / 2 + span;
      gx.save();
      gx.globalAlpha *= alpha;
      gx.fillStyle = withAlpha(theme.dark ? '#9fb4d0' : '#4a6a9a', theme.dark ? 0.08 : 0.06);
      gx.beginPath();
      gx.moveTo(g0.cx, g0.cy);
      gx.arc(g0.cx, g0.cy, rp, a0, a1);
      gx.closePath();
      gx.fill();
      gx.strokeStyle = withAlpha(theme.text, 0.35);
      gx.lineWidth = 1.2;
      gx.beginPath();
      gx.arc(g0.cx, g0.cy, rp, a0, a1);
      gx.stroke();
      // Teilstriche alle 5° bzw. 10°, Zahlen alle 30°
      const fine = rp >= 80;
      for (let d = -180; d <= 180; d += 5) {
        const ph = toRad(d);
        if (Math.abs(ph) > span + 1e-9 || (!fine && d % 10 !== 0)) continue;
        const big = d % 30 === 0;
        const len = big ? 9 : d % 10 === 0 ? 6 : 3.5;
        const ux = Math.sin(ph);
        const uy = Math.cos(ph);
        gx.beginPath();
        gx.moveTo(g0.cx + ux * rp, g0.cy + uy * rp);
        gx.lineTo(g0.cx + ux * (rp - len), g0.cy + uy * (rp - len));
        gx.stroke();
        if (big && rp >= 58 && d !== 0 && Math.abs(d) <= 150 && Math.abs(ph) < span - 0.09) text(gx, `${Math.abs(d)}°`, g0.cx + ux * (rp - 19), g0.cy + uy * (rp - 19), { font: `600 11px ${theme.font}`, color: theme.muted });
      }
      gx.restore();
    }

    /* ---------- Szene: Pendel ---------- */
    function drawThread(g0: Geo, phi: number, alpha: number, grow: number, ghost: boolean): void {
      const gx = surface.g;
      const dark = ctx.theme.dark;
      const [bx, by] = bobAt(g0, phi, grow);
      gx.save();
      gx.globalAlpha *= alpha;
      gx.lineCap = 'round';
      if (rod() && !ghost) {
        // starre Stange (Modell für |φ₀| > 90°)
        gx.strokeStyle = dark ? '#8f99a8' : '#59626f';
        gx.lineWidth = 4.5;
        gx.beginPath();
        gx.moveTo(g0.cx, g0.cy);
        gx.lineTo(bx, by);
        gx.stroke();
        gx.strokeStyle = 'rgba(255,255,255,0.45)';
        gx.lineWidth = 1.2;
        gx.stroke();
      } else {
        gx.strokeStyle = ghost ? C.ghost() : dark ? '#c9d1dc' : '#3a4250';
        gx.lineWidth = ghost ? 1.4 : 1.7;
        if (ghost) gx.setLineDash([5, 4]);
        gx.beginPath();
        gx.moveTo(g0.cx, g0.cy);
        gx.lineTo(bx, by);
        gx.stroke();
      }
      gx.restore();
    }

    function drawBob(g0: Geo, phi: number, alpha: number, grow: number, scale: number, ghost: boolean): void {
      const gx = surface.g;
      const [bx, by] = bobAt(g0, phi, grow);
      const R = g0.R * scale;
      if (R < 0.5) return;
      gx.save();
      gx.globalAlpha *= alpha;
      if (ghost) {
        gx.fillStyle = withAlpha(C.ghost(), 0.22);
        gx.strokeStyle = C.ghost();
        gx.lineWidth = 2;
        gx.setLineDash([4, 3]);
        gx.beginPath();
        gx.arc(bx, by, R, 0, TAU);
        gx.fill();
        gx.stroke();
        gx.restore();
        return;
      }
      // Hervorhebung beim Überfahren/Ziehen
      if (!ctx.locked && (hover || drag)) {
        gx.fillStyle = withAlpha(C.phi(), drag ? 0.28 : 0.18);
        gx.beginPath();
        gx.arc(bx, by, R + 8, 0, TAU);
        gx.fill();
      }
      gx.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,45,0.35)';
      gx.shadowBlur = 9;
      gx.shadowOffsetY = 3;
      const img = ctx.images.get('bob');
      if (img) gx.drawImage(scaledSprite(img, 2 * R, 2 * R, surface.dpr), bx - R, by - R, 2 * R, 2 * R);
      else {
        const grad = gx.createRadialGradient(bx - R * 0.38, by - R * 0.4, R * 0.08, bx, by, R);
        grad.addColorStop(0, '#fff6d6');
        grad.addColorStop(0.4, '#e2b44a');
        grad.addColorStop(1, '#6b4c12');
        gx.fillStyle = grad;
        gx.beginPath();
        gx.arc(bx, by, R, 0, TAU);
        gx.fill();
      }
      gx.restore();
    }

    /** Schatten der Kugel auf dem Tisch (je höher, desto blasser). */
    function drawShadow(g0: Geo, phi: number, grow: number): void {
      const gx = surface.g;
      const [bx, by] = bobAt(g0, phi, grow);
      const d = Math.max(0, g0.tableY - by);
      const k = clamp(1 - d / (g0.r.h * 0.9), 0.15, 1);
      gx.save();
      gx.fillStyle = `rgba(0,0,0,${0.22 * k})`;
      gx.beginPath();
      gx.ellipse(bx, g0.tableY + 3, g0.R * (1.6 - 0.5 * k), 3 + 2 * k, 0, 0, TAU);
      gx.fill();
      gx.restore();
    }

    function drawPathArc(g0: Geo): void {
      if (p.amp === 0) return;
      const gx = surface.g;
      const a = Math.min(Math.PI, Math.abs(amp()));
      gx.save();
      gx.strokeStyle = withAlpha(ctx.theme.text, 0.35);
      gx.lineWidth = 1.4;
      gx.setLineDash([4, 5]);
      gx.beginPath();
      gx.arc(g0.cx, g0.cy, g0.Lpx, Math.PI / 2 - a, Math.PI / 2 + a);
      gx.stroke();
      // Lot
      gx.strokeStyle = withAlpha(ctx.theme.text, 0.3);
      gx.setLineDash([3, 4]);
      gx.lineWidth = 1;
      gx.beginPath();
      gx.moveTo(g0.cx, g0.cy);
      gx.lineTo(g0.cx, g0.cy + g0.Lpx + g0.R + 10);
      gx.stroke();
      gx.restore();
    }

    /** Leuchtspur der letzten halben Sekunde. */
    function drawTrail(g0: Geo, tView: number): void {
      if (hist.size < 3 || tView <= 0) return;
      const gx = surface.g;
      const i1 = hist.indexAt(tView);
      const i0 = hist.indexAt(tView - 0.5);
      if (i1 - i0 < 2) return;
      gx.save();
      gx.lineCap = 'round';
      for (let i = i0 + 1; i <= i1; i++) {
        const u = (i - i0) / (i1 - i0);
        const [x0, y0] = bobAt(g0, hist.phi[i - 1]!);
        const [x1, y1] = bobAt(g0, hist.phi[i]!);
        gx.strokeStyle = withAlpha(C.phi(), 0.5 * u);
        gx.lineWidth = 2 + 4 * u;
        gx.beginPath();
        gx.moveTo(x0, y0);
        gx.lineTo(x1, y1);
        gx.stroke();
      }
      gx.restore();
    }

    function drawAngle(g0: Geo, phi: number): void {
      if (Math.abs(phi) < 0.01) return;
      const gx = surface.g;
      const rr = clamp(g0.Lpx * 0.25, 22, 56);
      const a0 = Math.PI / 2;
      const a1 = Math.PI / 2 - phi;
      gx.save();
      gx.fillStyle = withAlpha(C.phi(), 0.18);
      gx.strokeStyle = C.phi();
      gx.lineWidth = 2;
      gx.beginPath();
      gx.moveTo(g0.cx, g0.cy);
      gx.arc(g0.cx, g0.cy, rr, Math.min(a0, a1), Math.max(a0, a1));
      gx.closePath();
      gx.fill();
      gx.beginPath();
      gx.arc(g0.cx, g0.cy, rr, Math.min(a0, a1), Math.max(a0, a1));
      gx.stroke();
      gx.restore();
      const mid = phi / 2;
      // Beschriftung außerhalb des Winkelmessers
      const rp = clamp(g0.Lpx * 0.42, 34, 112);
      const lr = (rp > g0.Lpx - g0.R - 4 ? rr : rp) + (g0.small ? 16 : 20);
      const label = `φ = ${n(toDeg(phi), 0)}°`;
      // kleine Winkel: Beschriftung auf der anderen Seite des Lots (dort ist Platz)
      if (Math.abs(phi) < 0.6) clampedText(label, g0.cx - Math.sign(phi) * 8, g0.cy + lr, g0.small ? 11 : 12.5, C.phi(), g0.r, phi > 0 ? 'right' : 'left');
      else clampedText(label, g0.cx + lr * Math.sin(mid), g0.cy + lr * Math.cos(mid), g0.small ? 11 : 12.5, C.phi(), g0.r, 'center');
    }

    /** Länge l längs des Fadens (gedreht, gut lesbar). */
    function drawLengthLabel(g0: Geo, phi: number, grow: number): void {
      if (g0.Lpx * grow < 110) return;
      const gx = surface.g;
      let ang = Math.PI / 2 - phi;
      // Text nie auf dem Kopf
      let rot = ang;
      if (rot > Math.PI / 2) rot -= Math.PI;
      if (rot < -Math.PI / 2) rot += Math.PI;
      const mx = g0.cx + g0.Lpx * grow * 0.62 * Math.sin(phi);
      const my = g0.cy + g0.Lpx * grow * 0.62 * Math.cos(phi);
      // auf der Seite zum Lot hin versetzt
      const side = (phi >= 0 ? -1 : 1) * (Math.abs(phi) < 0.6 ? -1 : 1);
      ang = phi;
      const ox = side * Math.cos(ang) * 12;
      const oy = -side * Math.sin(ang) * 12;
      gx.save();
      gx.translate(mx + ox, my + oy);
      gx.rotate(rot);
      richText(tr('lLabel', { l: n(p.l, 2) }), 0, 0, g0.small ? 11 : 12, ctx.theme.muted, 'center', true, 650);
      gx.restore();
    }

    /** Höhe h über dem tiefsten Punkt (zur Lageenergie). */
    function drawHeight(g0: Geo, phi: number): void {
      const gx = surface.g;
      const theme = ctx.theme;
      const [bx, by] = bobAt(g0, phi);
      const low = g0.cy + g0.Lpx;
      gx.save();
      gx.strokeStyle = withAlpha(C.pot(), 0.6);
      gx.lineWidth = 1.2;
      gx.setLineDash([5, 4]);
      gx.beginPath();
      gx.moveTo(Math.min(g0.cx, bx) - 30, low);
      gx.lineTo(Math.max(g0.cx, bx) + 30, low);
      gx.stroke();
      gx.setLineDash([]);
      const hPx = low - by;
      if (hPx > 6) {
        const x = bx + (phi >= 0 ? 1 : -1) * (g0.R + 12);
        gx.strokeStyle = C.pot();
        gx.lineWidth = 1.8;
        gx.beginPath();
        gx.moveTo(x, low);
        gx.lineTo(x, by);
        gx.moveTo(x - 4, low);
        gx.lineTo(x + 4, low);
        gx.moveTo(x - 4, by);
        gx.lineTo(x + 4, by);
        gx.stroke();
        const h = p.l * (1 - Math.cos(phi));
        const hs = h < 1 ? `${n(h * 100, 1)} cm` : `${n(h, 2)} m`;
        clampedText(tr('hLabel', { h: hs }), x + (phi >= 0 ? 8 : -8), (low + by) / 2, g0.small ? 11 : 12, C.pot(), g0.r, phi >= 0 ? 'left' : 'right');
      }
      gx.restore();
      void theme;
    }

    function drawVelocity(g0: Geo, s: State): void {
      const v = p.l * s[1];
      if (Math.abs(v) < 0.02) return;
      const [bx, by] = bobAt(g0, s[0]);
      const vmax = Math.max(0.05, maxSpeed(amp(), p.l, g()));
      const k = Math.min(30, (g0.small ? 64 : 84) / vmax);
      const ex = bx + Math.cos(s[0]) * v * k;
      const ey = by - Math.sin(s[0]) * v * k;
      arrowPx(bx, by, ex, ey, C.kin(), 3.2, 11);
      if (Math.abs(v * k) > 26) clampedText(tr('vLabel', { v: n(Math.abs(v), 2) }), ex + (ex >= bx ? 8 : -8), ey - 14, g0.small ? 11 : 12, C.kin(), g0.r, ex >= bx ? 'left' : 'right');
    }

    function drawForces(g0: Geo, s: State): void {
      const f = forces(s, p.l, g(), p.m);
      const [bx, by] = bobAt(g0, s[0]);
      const a = Math.min(Math.PI, Math.abs(amp()));
      const maxT = Math.max(f.weight, tension(0, a, g(), p.m));
      const k = Math.min((g0.small ? 44 : 56) / f.weight, (g0.small ? 120 : 150) / maxT);
      const fs = g0.small ? 11 : 12;
      const sin = Math.sin(s[0]);
      const cos = Math.cos(s[0]);
      // Gewichtskraft und ihre Zerlegung
      const gyEnd = by + f.weight * k;
      const rx = bx + sin * f.radial * k;
      const ry = by + cos * f.radial * k;
      const tx = bx - f.weight * sin * cos * k;
      const ty = by + f.weight * sin * sin * k;
      const gx = surface.g;
      gx.save();
      gx.strokeStyle = withAlpha(ctx.theme.text, 0.35);
      gx.lineWidth = 1;
      gx.setLineDash([3, 3]);
      gx.beginPath();
      gx.moveTo(rx, ry);
      gx.lineTo(bx, gyEnd);
      gx.lineTo(tx, ty);
      gx.stroke();
      gx.restore();
      arrowPx(bx, by, rx, ry, withAlpha(ctx.theme.text, 0.55), 2, 8, [4, 3]);
      arrowPx(bx, by, bx, gyEnd, C.fG(), 3, 10);
      if (Math.abs(f.restoring) * k > 4) arrowPx(bx, by, tx, ty, C.fR(), 3, 10);
      // Faden- bzw. Stangenkraft
      const T = f.tension;
      const sx = bx - sin * T * k;
      const sy = by - cos * T * k;
      arrowPx(bx, by, sx, sy, C.fS(), 3.2, 11, T < 0 ? [5, 4] : []);
      clampedText(ctx.t('fG'), bx + 8, gyEnd + 4, fs, C.fG(), g0.r, 'left');
      if (Math.abs(f.restoring) * k > 14) clampedText(ctx.t('fR'), tx + (tx < bx ? -8 : 8), ty + 6, fs, C.fR(), g0.r, tx < bx ? 'right' : 'left');
      if (Math.abs(T) * k > 10) clampedText(T < 0 ? `${ctx.t('fS')} · ${ctx.t('push')}` : ctx.t('fS'), sx + (sx >= bx ? 8 : -8), sy - 8, fs, C.fS(), g0.r, sx >= bx ? 'left' : 'right');
    }

    /* ---------- Szene: Anzeigen ---------- */
    function hints(): { text: string; color: string }[] {
      const out: { text: string; color: string }[] = [];
      const theme = ctx.theme;
      const m = mode();
      const small = (geo?.r.w ?? surface.width) < 520;
      if (transient && transient.until > performance.now()) out.push({ text: transient.text, color: theme.series[4]! });
      if (p.amp === 0) out.push({ text: ctx.t('hZero'), color: theme.series[4]! });
      if (rod()) out.push({ text: ctx.t(small ? 'hRodShort' : 'hRod'), color: C.heat() });
      if (m === 'period' && measuring()) out.push({ text: ctx.t('hMeasure'), color: C.good() });
      else if (m === 'period' && Math.abs(p.amp) > 15) out.push({ text: ctx.t('hSmall'), color: C.heat() });
      if (planetId() === 'erde' && Math.abs(T0() - 2) < 0.005 && !ctx.isHidden('formula')) out.push({ text: ctx.t('hSeconds'), color: C.good() });
      if (planetId() !== 'erde' && (m === 'swing' || m === 'graphs') && !ctx.isHidden('formula')) out.push({ text: tr('hPlanet', { p: ctx.t(planetId()), g: n(g(), 2), f: n(Math.sqrt(PLANETS.erde.g / g()), 2) }), color: theme.series[4]! });
      if (m === 'large' && Math.abs(p.amp) > 0 && Math.abs(p.amp) < ONE_PERCENT) out.push({ text: ctx.t('hOnePct'), color: C.good() });
      if (m === 'phase' && p.damping === 0 && p.amp !== 0) out.push({ text: ctx.t('hClosed'), color: theme.muted });
      return out.slice(0, 2);
    }

    function drawWatch(r: Rect, y: number, size: number): void {
      if (!meas) return;
      const gx = surface.g;
      const theme = ctx.theme;
      const run = !meas.done;
      const color = run ? C.good() : theme.text;
      const label = run ? tr('watch', { t: fmt.fixed(t, 2), n: String(Math.min(MEASURE_N, returns.length - 1)) }) : tr('watchDone', { t: fmt.fixed(meas.reading, 2) });
      const k = run ? (countPop.running ? 1 + 0.08 * Math.sin(Math.PI * countPop.t) : 1) : resultPop.running ? resultPop.value : 1;
      const icon = size + 6;
      const w = richWidth(label, size) + icon + 24;
      const h = size + 11;
      const x0 = r.x + 8;
      gx.save();
      gx.translate(x0 + w / 2, y + h / 2);
      gx.scale(k, k);
      gx.translate(-(x0 + w / 2), -(y + h / 2));
      gx.save();
      gx.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.12)';
      gx.shadowBlur = 6;
      gx.fillStyle = run ? (theme.dark ? 'rgba(16,22,31,0.92)' : 'rgba(255,255,255,0.96)') : C.good();
      roundRect(gx, x0, y, w, h, h / 2);
      gx.fill();
      gx.restore();
      if (run) {
        gx.strokeStyle = withAlpha(C.good(), 0.7);
        gx.lineWidth = 1.6;
        roundRect(gx, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        gx.stroke();
      }
      const ix = x0 + 8 + icon / 2;
      const iy = y + h / 2 + 1;
      const ir = icon / 2 - 2;
      const ic = run ? color : '#ffffff';
      gx.strokeStyle = ic;
      gx.lineWidth = 1.6;
      gx.beginPath();
      gx.arc(ix, iy, ir, 0, TAU);
      gx.moveTo(ix, iy - ir - 1);
      gx.lineTo(ix, iy - ir - 3.5);
      gx.stroke();
      const ang = ((run ? t : meas.reading) % 1) * TAU - Math.PI / 2;
      gx.beginPath();
      gx.moveTo(ix, iy);
      gx.lineTo(ix + Math.cos(ang) * (ir - 1.5), iy + Math.sin(ang) * (ir - 1.5));
      gx.stroke();
      richText(label, x0 + 14 + icon, y + h / 2 + 0.5, size, ic, 'left', false);
      gx.restore();
    }

    function drawChips(g0: Geo, s: State, tView: number): void {
      const r = g0.r;
      const theme = ctx.theme;
      const small = g0.small;
      const size = small ? 11 : 12;
      const row = size + 17;
      const e = energies(s, p.l, g(), p.m);
      let x = r.x + 8;
      x += pill(x, r.y + 8, `t = ${fmt.fixed(tView, 2)} s`, scrub !== null ? C.ghost() : theme.text, 'left', size).w + 6;
      x += pill(x, r.y + 8, `φ = ${n(toDeg(s[0]), 1)}°`, C.phi(), 'left', size).w + 6;
      if (!small) pill(x, r.y + 8, `v = ${n(e.speed, 2)} m/s`, C.kin(), 'left', size);
      pill(r.x + r.w - 8, r.y + 8, tr('T0', { t: ctx.isHidden('formula') ? '?' : fmt.fixed(disp.T0, 2) }), theme.text, 'right', size);
      // zweite Zeile: Legende bzw. Stoppuhr links, Ort rechts
      const y2 = r.y + 8 + row;
      const gLabel = `${small ? '' : `${ctx.t(planetId())} · `}g = ${n(g(), 2)} m/s²`;
      pill(r.x + r.w - 8, y2, gLabel, planetId() === 'erde' ? theme.muted : theme.series[4]!, 'right', size);
      if (meas && mode() === 'period') drawWatch(r, y2, size);
      else if (p.compare) pill(r.x + 8, y2, `- - ${ctx.t(small ? 'approxShort' : 'approx')}`, C.ghost(), 'left', size);
      else if (meas === null && mode() === 'period' && p.amp !== 0 && ctx.clock.playing && !ctx.isHidden('exact')) pill(r.x + 8, y2, tr('Tmeas', { t: fmt.fixed(Tex(), 2) }), theme.muted, 'left', size);
      // Hinweise
      hints().forEach((h, i) => {
        const maxW = r.w - 20;
        const full = richWidth(h.text, size) + 16;
        const label = full > maxW ? h.text.slice(0, Math.max(8, Math.floor((h.text.length * maxW) / full) - 2)) + '…' : h.text;
        pill(r.x + r.w / 2, r.y + 8 + row * (i + 2), label, h.color, 'center', size);
      });
      if (meas && !meas.done && meas.speed > 1) pill(r.x + 8, g0.tableY - 30, tr('speedup', { f: String(meas.speed) }), theme.muted, 'left', size);
    }

    function drawScene(r: Rect): void {
      const g0 = geo!;
      const theme = ctx.theme;
      const gx = surface.g;
      const v = now();
      gx.save();
      roundRect(gx, r.x, r.y, r.w, r.h, 12);
      gx.clip();
      drawRoom(g0);
      drawStand(g0);
      const it = intro.running ? intro.t : 1;
      const grow = intro.running ? 0.15 + 0.85 * ease.outBack(clamp(it / 0.8, 0, 1)) : 1;
      const pop = intro.running ? clamp((it - 0.1) / 0.5, 0, 1) : 1;
      drawProtractor(g0, intro.running ? clamp(it * 1.6, 0, 1) : 1);
      drawPathArc(g0);
      const phi = disp.phi;
      if (mode() === 'swing' && p.energy && !intro.running && p.amp !== 0) drawHeight(g0, phi);
      drawShadow(g0, phi, grow);
      if (p.compare && p.amp !== 0) {
        const gh = ghostAt(v.t);
        drawThread(g0, gh, 0.75 * pop, grow, true);
        drawBob(g0, gh, 0.9 * pop, grow, 1, true);
      }
      drawTrail(g0, v.t);
      drawThread(g0, phi, 1, grow, false);
      // Aufhängepunkt
      gx.fillStyle = theme.dark ? '#c3cbd6' : '#3c4552';
      gx.beginPath();
      gx.arc(g0.cx, g0.cy, 3.5, 0, TAU);
      gx.fill();
      drawBob(g0, phi, pop, grow, ease.outBack(pop), false);
      if (!intro.running) {
        drawAngle(g0, phi);
        drawLengthLabel(g0, phi, grow);
        const shown: State = [phi, v.s[1]];
        if (arrows() === 'v') drawVelocity(g0, shown);
        else if (arrows() === 'F') drawForces(g0, shown);
      }
      drawChips(g0, [phi, v.s[1]], v.t);
      if (scrub !== null && !g0.small) richText(ctx.t('scrubHint'), r.x + r.w / 2, g0.tableY + (r.y + r.h - g0.tableY) / 2, 11, '#ffffff', 'center', false, 600);
      gx.restore();
      frame(r);
    }

    /* ---------- Feld: Energie-Säulen ---------- */
    function drawBars(R: Rect, alpha: number): void {
      const gx = surface.g;
      const theme = ctx.theme;
      gx.save();
      gx.globalAlpha *= alpha;
      card(R);
      const grow = intro.running ? ease.outCubic(clamp((intro.t - 0.2) / 0.8, 0, 1)) : 1;
      const E0 = Math.max(1e-9, e0());
      const items: [string, string, number, string][] = [
        ['E_{pot}', ctx.t('pot'), disp.pot * grow, C.pot()],
        ['E_{kin}', ctx.t('kin'), disp.kin * grow, C.kin()],
        [ctx.lang === 'de' ? 'W_{R}' : 'W_{f}', ctx.t('heat'), disp.heat * grow, C.heat()],
      ];
      const sum = items.reduce((a, q) => a + q[2], 0);
      const vertical = R.h > R.w * 0.85;
      const pad = 14;
      richText(ctx.t('tBars'), R.x + pad, R.y + 18, 12.5, theme.text, 'left', false);
      richText(tr('mass', { m: n(p.m, 1) }), R.x + R.w - pad, R.y + 18, 12, theme.muted, 'right', false, 600);
      if (p.amp === 0) {
        richText(ctx.t('noSwing'), R.x + R.w / 2, R.y + R.h / 2, 12, theme.muted, 'center', false, 600);
        gx.restore();
        return;
      }
      if (vertical) {
        let top = R.y + 40;
        // Formeln über den Säulen
        if (R.h > 360) {
          const st = now().s;
          const e = energies(st, p.l, g(), p.m);
          const hs = e.height < 1 ? `${n(e.height * 100, 1)} cm` : `${n(e.height, 2)} m`;
          richText(`E_{pot} = m · g · h`, R.x + pad, top + 4, 11.5, C.pot(), 'left', false, 650);
          richText(`h = ${hs}`, R.x + R.w - pad, top + 4, 11.5, theme.text, 'right', false, 650);
          richText(`E_{kin} = ½ · m · v²`, R.x + pad, top + 24, 11.5, C.kin(), 'left', false, 650);
          richText(`v = ${n(e.speed, 2)} m/s`, R.x + R.w - pad, top + 24, 11.5, theme.text, 'right', false, 650);
          top += 46;
        }
        const bottom = R.y + R.h - 46;
        const slot = (R.w - pad * 2) / 4;
        const barW = Math.min(40, slot * 0.6);
        const hgt = (v: number) => ((bottom - top - 22) * Math.max(0, v)) / E0;
        const yTop = bottom - hgt(E0);
        gx.strokeStyle = withAlpha(theme.text, 0.35);
        gx.setLineDash([4, 4]);
        gx.lineWidth = 1.2;
        gx.beginPath();
        gx.moveTo(R.x + pad, yTop);
        gx.lineTo(R.x + R.w - pad, yTop);
        gx.stroke();
        gx.setLineDash([]);
        items.forEach(([sym, word, value, color], i) => {
          const x = R.x + pad + slot * i + (slot - barW) / 2;
          const h = hgt(value);
          const grad = gx.createLinearGradient(x, 0, x + barW, 0);
          grad.addColorStop(0, color);
          grad.addColorStop(1, withAlpha(color, 0.75));
          gx.fillStyle = grad;
          roundRect(gx, x, bottom - h, barW, Math.max(1, h), 4);
          gx.fill();
          text(gx, joule(value), x + barW / 2, bottom - h - 10, { font: `700 11.5px ${theme.font}`, color: theme.text });
          richText(sym, x + barW / 2, bottom + 14, 12.5, color, 'center', false);
          gx.font = `600 11px ${theme.font}`;
          if (gx.measureText(word).width < slot - 4) text(gx, word, x + barW / 2, bottom + 31, { font: `600 11px ${theme.font}`, color: theme.muted });
        });
        const x = R.x + pad + slot * 3 + (slot - barW) / 2;
        let y = bottom;
        for (const [, , value, color] of items) {
          const h = hgt(value);
          gx.fillStyle = color;
          gx.fillRect(x, y - h, barW, h);
          y -= h;
        }
        gx.strokeStyle = theme.text;
        gx.lineWidth = 1.4;
        gx.strokeRect(x + 0.5, yTop + 0.5, barW - 1, bottom - yTop);
        text(gx, joule(sum), x + barW / 2, yTop - 10, { font: `700 11.5px ${theme.font}`, color: theme.text });
        text(gx, ctx.t('total'), x + barW / 2, bottom + 14, { font: `700 12px ${theme.font}`, color: theme.text });
        gx.strokeStyle = theme.axis;
        gx.lineWidth = 1;
        gx.beginPath();
        gx.moveTo(R.x + pad, bottom + 0.5);
        gx.lineTo(R.x + R.w - pad, bottom + 0.5);
        gx.stroke();
      } else {
        const rows = [...items, ['Σ', ctx.t('total'), sum, theme.text] as [string, string, number, string]];
        const y0 = R.y + 32;
        const rowH = Math.min(30, (R.h - 40) / rows.length);
        const labelW = 52;
        const valW = 70;
        const bx = R.x + pad + labelW;
        const bw = R.w - pad * 2 - labelW - valW;
        rows.forEach(([sym, , value, color], i) => {
          const y = y0 + i * rowH;
          richText(sym, bx - 8, y + rowH / 2, 12, color, 'right', false);
          gx.fillStyle = withAlpha(theme.muted, 0.13);
          roundRect(gx, bx, y + 4, bw, rowH - 8, 4);
          gx.fill();
          if (i < 3) {
            gx.fillStyle = color;
            roundRect(gx, bx, y + 4, Math.max(0, Math.min(bw, (value / E0) * bw)), rowH - 8, 4);
            gx.fill();
          } else {
            let xx = bx;
            gx.save();
            roundRect(gx, bx, y + 4, bw, rowH - 8, 4);
            gx.clip();
            for (const [, , v2, c2] of items) {
              const w = (v2 / E0) * bw;
              gx.fillStyle = c2;
              gx.fillRect(xx, y + 4, w, rowH - 8);
              xx += w;
            }
            gx.restore();
          }
          text(gx, `${joule(value)} J`, bx + bw + 6, y + rowH / 2, { font: `${i === 3 ? 700 : 600} 12px ${theme.font}`, color: theme.text, align: 'left' });
        });
      }
      gx.restore();
    }

    /* ---------- Diagramme: φ(t) und E(t) ---------- */
    const windowNow = () => {
      const W = niceWindow(Tex() || T0());
      const tv = now().t;
      return { W, t0: Math.max(0, Math.max(t, tv) - 0.86 * W) };
    };

    /** Punkte aus dem Speicher zwischen tA und tB (ausgedünnt auf etwa maxPts). */
    function histPts(tA: number, tB: number, f: (i: number) => number, maxPts = 600): Pt[] {
      const i0 = Math.max(0, hist.indexAt(tA) - 1);
      const i1 = Math.min(hist.size - 1, hist.indexAt(tB));
      const stride = Math.max(1, Math.floor((i1 - i0) / maxPts));
      const pts: Pt[] = [];
      for (let i = i0; i <= i1; i += stride) pts.push([hist.t[i]!, f(i)]);
      if (pts.length && pts[pts.length - 1]![0] !== hist.t[i1]) pts.push([hist.t[i1]!, f(i1)]);
      return pts;
    }

    function drawPhiChart(plot: Plot, R: Rect): void {
      const theme = ctx.theme;
      const { W, t0 } = windowNow();
      const v = now();
      const range = Math.max(5, Math.abs(p.amp)) * 1.2;
      plot.setAxes({ x: { label: ctx.t('axisT') } });
      plot.setRangePadded([t0, t0 + W], [-range, range], chartPad(R));
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const tEnd = t;
      // Bezugslinien ±φ₀
      if (p.amp !== 0) {
        for (const sg of [-1, 1]) plot.hline(sg * Math.abs(p.amp), { color: theme.muted, width: 1, dash: [3, 5], alpha: 0.7 });
        plot.textPx(plot.rect.x + plot.rect.w - 4, plot.py(-Math.abs(p.amp)) + 9, `±${n(Math.abs(p.amp), 0)}°`, { color: theme.muted, size: 11, weight: '600', align: 'right', baseline: 'middle' });
      }
      // Rückkehrzeiten (volle Perioden)
      for (const q of returns) if (q > t0 && q <= tEnd) plot.vline(q, { color: theme.muted, width: 1, dash: [2, 4], alpha: 0.7 });
      if (p.compare && p.amp !== 0) {
        const pts: Pt[] = [];
        for (let k = 0; k <= 240; k++) {
          const tt = t0 + ((tEnd - t0) * k) / 240;
          pts.push([tt, toDeg(ghostAt(tt))]);
        }
        plot.polyline(pts, { color: C.ghost(), width: 2, dash: [6, 4], alpha: 0.85 });
      }
      plot.polyline(
        histPts(t0, tEnd, (i) => toDeg(hist.phi[i]!)),
        { color: C.phi(), width: 2.6 },
      );
      // Klammer T zwischen den beiden letzten Rückkehren
      const inWin = returns.filter((q) => q >= t0 && q <= tEnd);
      if (inWin.length >= 2) {
        const a = inWin[inWin.length - 2]!;
        const b = inWin[inWin.length - 1]!;
        const y = range * 0.9;
        plot.segment([a, y], [b, y], { color: theme.text, width: 1.4 });
        for (const q of [a, b]) plot.segment([q, y - range * 0.06], [q, y + range * 0.05], { color: theme.text, width: 1.4 });
        const w = plot.px(b) - plot.px(a);
        plot.text((a + b) / 2, y, w > 70 && !ctx.isHidden('measured') ? tr('Tmeas', { t: fmt.fixed(b - a, 2) }) : 'T', { color: theme.text, size: R.w < 300 ? 11 : 12, weight: 'bold', align: 'center', offset: [0, 11] });
      }
      plot.vline(v.t, { color: scrub !== null ? C.ghost() : theme.text, width: scrub !== null ? 2 : 1.3, alpha: 0.55 });
      if (p.compare && p.amp !== 0) plot.point(v.t, toDeg(ghostAt(v.t)), { color: C.ghost(), radius: 4, hollow: true });
      plot.point(v.t, toDeg(v.s[0]), { color: C.phi(), radius: 5.5 });
      plot.end();
      const right = p.compare ? `- - ${ctx.t('approxShort')}` : returns.length >= 2 && !ctx.isHidden('measured') ? tr('Tmeas', { t: fmt.fixed(returns[returns.length - 1]! - returns[returns.length - 2]!, 3) }) : undefined;
      titleChip(R, ctx.t('tPhi'), C.phi(), right, p.compare ? C.ghost() : theme.text);
    }

    function drawEtChart(plot: Plot, R: Rect): void {
      const theme = ctx.theme;
      const { W, t0 } = windowNow();
      const v = now();
      const E0 = Math.max(1e-9, e0());
      plot.setAxes({ x: { label: ctx.t('axisT') } });
      plot.setRangePadded([t0, t0 + W], [0, niceTop(E0)], chartPad(R));
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const pts = histPts(t0, t, (i) => i, 420);
      const layers = pts.map(([tt, i]) => {
        const e = energies([hist.phi[i]!, hist.w[i]!], p.l, g(), p.m);
        return { t: tt, a: e.pot, b: e.pot + e.kin };
      });
      const band = (lo: (q: (typeof layers)[0]) => number, hi: (q: (typeof layers)[0]) => number, color: string, alpha: number) => {
        if (layers.length < 2) return;
        plot.polygon([...layers.map((q) => [q.t, hi(q)] as Pt), ...[...layers].reverse().map((q) => [q.t, lo(q)] as Pt)], { fill: color, alpha });
      };
      const reveal = fade.running ? fade.value : 1;
      band(() => 0, (q) => q.a, C.pot(), 0.8 * reveal);
      band((q) => q.a, (q) => q.b, C.kin(), 0.8 * reveal);
      band((q) => q.b, () => E0, C.heat(), 0.55 * reveal);
      plot.hline(E0, { color: theme.text, width: 1.5, dash: [6, 4], alpha: 0.8 });
      const e = energies(v.s, p.l, g(), p.m);
      plot.vline(v.t, { color: scrub !== null ? C.ghost() : theme.text, width: 1.3, alpha: 0.55 });
      plot.point(v.t, e.pot, { color: C.pot(), radius: 4 });
      plot.point(v.t, e.pot + e.kin, { color: C.kin(), radius: 4 });
      plot.end();
      titleChip(R, ctx.t('tEt'), theme.text, R.w < 300 ? undefined : `E_{pot} + E_{kin} = ${joule(e.pot + e.kin)} J`, theme.text);
      // Legende
      if (R.h > 140) {
        const lg: [string, string][] = [
          ['E_{pot}', C.pot()],
          ['E_{kin}', C.kin()],
        ];
        if (p.damping > 0) lg.push([ctx.lang === 'de' ? 'W_{R}' : 'W_{f}', C.heat()]);
        let lx = plot.rect.x + 8;
        const ly = R.y + 44;
        const gx = surface.g;
        for (const [label, color] of lg) {
          gx.fillStyle = color;
          roundRect(gx, lx, ly - 5, 10, 10, 2);
          gx.fill();
          lx += 14 + richText(label, lx + 14, ly, 11.5, theme.text, 'left') + 12;
        }
      }
    }

    /* ---------- Diagramme: Messreihe ---------- */
    function seriesTop(kind: 'tl' | 't2l'): number {
      const used = new Set<PlanetId>([planetId(), ...series.map((q) => q.planet)]);
      let top = 0;
      for (const id of used) {
        const T = smallAnglePeriod(2.5, PLANETS[id].g) * 1.02;
        top = Math.max(top, kind === 'tl' ? T : T * T);
      }
      for (const q of series) top = Math.max(top, kind === 'tl' ? q.T : q.T * q.T);
      return niceTop(top);
    }

    function drawSeriesChart(kind: 'tl' | 't2l', plot: Plot, R: Rect): void {
      const theme = ctx.theme;
      const small = R.w < 300;
      const fs = small ? 11 : 12;
      const top = seriesTop(kind);
      plot.setAxes({ x: { label: ctx.t('axisL') } });
      plot.setRangePadded([0, 2.5], [0, top], chartPad(R));
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const ids = (Object.keys(PLANETS) as PlanetId[]).filter((id) => series.some((q) => q.planet === id));
      // Auswertung: Ursprungsgerade (T² über l) bzw. Wurzelkurve (T über l)
      for (const id of ids) {
        const fit = fitSeries(series.filter((q) => q.planet === id));
        if (!fit) continue;
        const color = PLANET_COLOR[id]();
        if (kind === 't2l') plot.segment([0, 0], [2.5, 2.5 * fit.slope], { color, width: 2, dash: [6, 4], alpha: 0.85 });
        else if (fit.lengths >= 3) {
          const pts: Pt[] = [];
          for (let l = 0; l <= 2.5001; l += 0.025) pts.push([l, Math.sqrt(fit.slope * l)]);
          plot.polyline(pts, { color, width: 2, dash: [6, 4], alpha: 0.85 });
        }
      }
      plot.vline(p.l, { color: theme.text, width: 1.3, alpha: 0.4 });
      series.forEach((q, i) => {
        const last = i === series.length - 1;
        const u = last && resultPop.running ? resultPop.value : 1;
        plot.point(q.l, kind === 'tl' ? q.T : q.T * q.T, { color: PLANET_COLOR[q.planet](), radius: 5.5 * u });
      });
      plot.end();
      if (kind === 'tl') {
        titleChip(R, ctx.t('tTl'), theme.text, small ? undefined : ctx.t('tapL'));
        if (!series.length) {
          richText(ctx.t('seriesEmpty'), R.x + R.w / 2, R.y + R.h * 0.42, fs, theme.muted, 'center', true, 600);
          if (R.w > 280) richText(ctx.t('seriesHint'), R.x + R.w / 2, R.y + R.h * 0.42 + 20, fs - 0.5, theme.muted, 'center', true, 500);
        }
      } else {
        // Steigung und g je Ort
        const fits = ids.map((id) => ({ id, fit: fitSeries(series.filter((q) => q.planet === id)) })).filter((q) => q.fit);
        const cur = fits.find((q) => q.id === planetId()) ?? fits[fits.length - 1];
        titleChip(R, ctx.t('tT2l'), theme.text, cur && !small && !ctx.isHidden('fit') ? tr('slope', { k: n(cur.fit!.slope, 3), g: n(cur.fit!.g, 2) }) : undefined, cur ? PLANET_COLOR[cur.id]() : undefined);
        // Rückmeldung, sobald drei Längen gemessen sind
        if (cur && cur.fit!.lengths >= 3 && !ctx.isHidden('fit')) {
          const u = resultPop.running ? resultPop.value : 1;
          const gx = surface.g;
          gx.save();
          gx.translate(plot.rect.x + plot.rect.w * 0.5, R.y + R.h * 0.42);
          gx.scale(u, u);
          const label = tr('found', { g: n(cur.fit!.g, 2), g0: n(PLANETS[cur.id].g, 2) });
          const fits2 = richWidth(label, fs) + 20 < R.w - 24;
          pill(0, -12, fits2 ? label : `g ≈ ${n(cur.fit!.g, 2)} m/s²`, PLANET_COLOR[cur.id](), 'center', fs, PLANET_COLOR[cur.id]());
          gx.restore();
        }
      }
      // Legende der Orte
      if (ids.length > 1 || (ids.length === 1 && ids[0] !== 'erde')) {
        let lx = plot.rect.x + 8;
        const ly = R.y + 44;
        const gx = surface.g;
        for (const id of ids) {
          gx.fillStyle = PLANET_COLOR[id]();
          gx.beginPath();
          gx.arc(lx + 5, ly, 5, 0, TAU);
          gx.fill();
          lx += 14 + richText(ctx.t(id), lx + 14, ly, 11.5, theme.text, 'left') + 12;
        }
      }
    }

    /* ---------- Diagramme: große Auslenkung ---------- */
    function drawFactorChart(plot: Plot, R: Rect): void {
      const theme = ctx.theme;
      const small = R.w < 300;
      const fs = small ? 11 : 12;
      plot.setAxes({ x: { label: ctx.t('axisA') } });
      plot.setRangePadded([0, 180], [0.75, 2.6], chartPad(R));
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      // Bereich, in dem die Näherung genauer als 1 % ist
      plot.polygon(
        [
          [0, 0.75],
          [ONE_PERCENT, 0.75],
          [ONE_PERCENT, 2.6],
          [0, 2.6],
        ],
        { fill: withAlpha(C.good(), 0.13) },
      );
      const reveal = fade.running ? fade.value : 1;
      const exact: Pt[] = [];
      const ser: Pt[] = [];
      for (let d = 0; d <= 175 * reveal + 1e-9; d += 1) {
        exact.push([d, periodFactor(toRad(d))]);
        ser.push([d, seriesFactor(toRad(d))]);
      }
      plot.hline(1, { color: C.ghost(), width: 2, dash: [6, 4] });
      plot.polyline(ser, { color: theme.muted, width: 1.8, dash: [3, 4] });
      plot.polyline(exact, { color: theme.text, width: 2.8 });
      const a = Math.abs(p.amp);
      const f = periodFactor(toRad(a));
      plot.vline(a, { color: C.phi(), width: 1.4, alpha: 0.6 });
      plot.point(a, f, { color: C.phi(), radius: 6 });
      plot.end();
      // Beschriftungen
      richText(ctx.t('onePct'), plot.px(ONE_PERCENT / 2), plot.py(2.45), fs, C.good(), 'center', true, 700);
      richText(ctx.t(R.w < 420 ? 'approxShort' : 'approx'), plot.px(172), plot.py(1) - 11, fs, C.ghost(), 'right', true, 650);
      if (R.w >= 420) richText(ctx.t('series2'), plot.px(176), plot.py(seriesFactor(toRad(176))) + 16, fs - 0.5, theme.muted, 'right', true, 600);
      richText(ctx.t('exactCurve'), plot.px(160) - 6, plot.py(periodFactor(toRad(160))), fs, theme.text, 'right', true, 700);
      const label = ctx.isHidden('exact') ? 'T = ? · T_{0}' : tr('factor', { f: n(f, 3) });
      const lx = plot.px(a) + (a > 110 ? -10 : 10);
      clampedText(label, lx, plot.py(f) - 14, fs, C.phi(), plot.rect, a > 110 ? 'right' : 'left');
      titleChip(R, ctx.t('tTf'), theme.text, small || ctx.isHidden('exact') ? undefined : tr('TT', { t: fmt.fixed(Tex(), 3) }), C.phi());
    }

    function drawTensionChart(plot: Plot, R: Rect): void {
      const theme = ctx.theme;
      const small = R.w < 300;
      const fs = small ? 11 : 12;
      const a0 = Math.min(Math.PI, Math.abs(amp()));
      const A = Math.max(5, toDeg(a0)) * 1.08;
      const ca = Math.cos(a0);
      const fmax = 3 - 2 * ca;
      const fmin = Math.min(-0.2, ca);
      plot.setAxes({ x: { label: ctx.t('axisPhi') } });
      plot.setRangePadded([-A, A], [slackAngle(a0) !== null ? fmin - 1.1 : -0.5, Math.max(1.5, fmax) * 1.12], chartPad(R));
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const pts: Pt[] = [];
      const deg = toDeg(a0);
      for (let k = 0; k <= 200; k++) {
        const d = -deg + (2 * deg * k) / 200;
        pts.push([d, 3 * Math.cos(toRad(d)) - 2 * ca]);
      }
      // negative Fadenkraft: Faden wäre schlaff
      const slack = slackAngle(a0);
      if (slack !== null) {
        const s = toDeg(slack);
        for (const sg of [-1, 1]) {
          const part = pts.filter(([d]) => sg * d >= s);
          if (part.length > 1) plot.polygon([...part, [part[part.length - 1]![0], 0], [part[0]![0], 0]], { fill: withAlpha(C.heat(), 0.25) });
        }
      }
      plot.hline(1, { color: C.fG(), width: 1.6, dash: [5, 4] });
      plot.polyline(pts, { color: C.fS(), width: 2.8 });
      const v = now();
      const f = forces(v.s, p.l, g(), p.m);
      const y = f.tension / f.weight;
      plot.vline(toDeg(v.s[0]), { color: C.phi(), width: 1.3, alpha: 0.55 });
      plot.point(toDeg(v.s[0]), y, { color: y < 0 ? C.heat() : C.fS(), radius: 6 });
      plot.end();
      richText(ctx.t('weightLine'), plot.rect.x + 8, plot.py(1) - 11, fs, C.fG(), 'left', true, 650);
      if (slack !== null) richText(ctx.t(small ? 'slackShort' : 'slack'), plot.px(0), plot.py(fmin - 0.65), fs, C.heat(), 'center', true, 700);
      titleChip(R, ctx.t('tFs'), C.fS(), small ? undefined : tr('bottom', { f: n(fmax, 2) }), theme.text);
    }

    /* ---------- Diagramme: Phasendiagramm und Einhüllende ---------- */
    function drawPhaseChart(plot: Plot, R: Rect): void {
      const theme = ctx.theme;
      const a0 = Math.min(Math.PI, Math.abs(amp()));
      const A = Math.min(185, Math.max(5, toDeg(a0)) * 1.18);
      const vmax = Math.max(0.05, maxSpeed(a0, p.l, g()));
      plot.setAxes({ x: { label: ctx.t('axisPhi') } });
      plot.setRangePadded([-A, A], [-vmax * 1.25, vmax * 1.25], chartPad(R));
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      // Bahnen gleicher Energie (ohne Dämpfung): v = ±√(2gl(cos φ − cos φ_a))
      const orbit = (aa: number): Pt[][] => {
        const up: Pt[] = [];
        const dn: Pt[] = [];
        const dmax = toDeg(aa);
        for (let k = 0; k <= 120; k++) {
          const d = -dmax + (2 * dmax * k) / 120;
          const s = speedAt(toRad(d), aa, p.l, g());
          if (!Number.isFinite(s)) continue;
          up.push([d, s]);
          dn.push([d, -s]);
        }
        return [up, dn];
      };
      if (a0 > 0.01) {
        for (const f of [0.25, 0.5, 0.75]) for (const q of orbit(a0 * f)) plot.polyline(q, { color: theme.muted, width: 1, alpha: 0.45 });
        for (const q of orbit(a0)) plot.polyline(q, { color: theme.text, width: 1.4, dash: [5, 4], alpha: 0.6 });
      }
      const v = now();
      const pts = histPts(0, v.t, (i) => i, 1500).map(([, i]) => [toDeg(hist.phi[i]!), p.l * hist.w[i]!] as Pt);
      plot.polyline(pts, { color: C.phi(), width: 2.2 });
      plot.point(toDeg(v.s[0]), p.l * v.s[1], { color: C.phi(), radius: 6 });
      plot.end();
      const e = energies(v.s, p.l, g(), p.m);
      titleChip(R, ctx.t('tPs'), C.phi(), R.w < 300 ? undefined : `E = ${joule(e.pot + e.kin)} J`, theme.text);
    }

    function drawEnvelopeChart(plot: Plot, R: Rect): void {
      const theme = ctx.theme;
      const gam = p.damping / 2;
      const v = now();
      const T = Tex() || T0();
      let t0 = 0;
      let W: number;
      if (gam > 0) W = clamp(niceTop(3 / gam), niceWindow(T), 60);
      else {
        W = niceWindow(T);
        t0 = Math.max(0, t - 0.86 * W);
      }
      const A = Math.max(5, Math.abs(p.amp));
      plot.setAxes({ x: { label: ctx.t('axisT') } });
      plot.setRangePadded([t0, t0 + W], [-A * 1.2, A * 1.2], chartPad(R));
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      if (p.amp !== 0) {
        const up: Pt[] = [];
        for (let k = 0; k <= 160; k++) {
          const tt = t0 + (W * k) / 160;
          up.push([tt, A * Math.exp(-gam * tt)]);
        }
        plot.polygon([...up, ...[...up].reverse().map(([x, y]) => [x, -y] as Pt)], { fill: withAlpha(C.ghost(), 0.08) });
        plot.polyline(up, { color: C.ghost(), width: 1.8, dash: [6, 4] });
        plot.polyline(
          up.map(([x, y]) => [x, -y] as Pt),
          { color: C.ghost(), width: 1.8, dash: [6, 4] },
        );
        const th = amplitudeHalfLife(gam);
        if (th < t0 + W) {
          plot.segment([th, 0], [th, A / 2], { color: theme.text, width: 1.2, dash: [3, 3], alpha: 0.7 });
          plot.point(th, A / 2, { color: theme.text, radius: 4, hollow: true });
          plot.text(th, A / 2, tr('half', { t: n(th, 1) }), { color: theme.text, size: R.w < 300 ? 11 : 12, weight: 'bold', align: 'left', offset: [7, -9] });
        }
      }
      plot.polyline(
        histPts(t0, v.t, (i) => toDeg(hist.phi[i]!), 900),
        { color: C.phi(), width: 2.4 },
      );
      plot.point(v.t, toDeg(v.s[0]), { color: C.phi(), radius: 5 });
      plot.end();
      titleChip(R, ctx.t('tEnv'), C.phi(), R.w < 300 ? undefined : ctx.t('env'), C.ghost());
    }

    function drawPanels(reg: { panels: Rect[] }): void {
      const kinds = panelsOf(mode());
      const alpha = fade.running ? fade.value : 1;
      const gx = surface.g;
      kinds.forEach((kind, i) => {
        const R = reg.panels[i];
        if (!R || R.w < 60 || R.h < 50) return;
        if (kind === 'bars') {
          drawBars(R, alpha);
          return;
        }
        gx.save();
        gx.globalAlpha = alpha * (intro.running ? clamp(intro.t * 1.5, 0, 1) : 1);
        card(R);
        const plot = charts[i]!;
        if (kind === 'phi') drawPhiChart(plot, R);
        else if (kind === 'et') drawEtChart(plot, R);
        else if (kind === 'tl' || kind === 't2l') drawSeriesChart(kind, plot, R);
        else if (kind === 'tf') drawFactorChart(plot, R);
        else if (kind === 'fs') drawTensionChart(plot, R);
        else if (kind === 'ps') drawPhaseChart(plot, R);
        else drawEnvelopeChart(plot, R);
        gx.restore();
      });
    }

    /* ---------- Bedienung: Kugel ziehen ---------- */
    function hitBob(px: number, py: number): boolean {
      if (!geo || ctx.locked || measuring()) return false;
      const [bx, by] = bobAt(geo, disp.phi);
      return Math.hypot(px - bx, py - by) <= geo.R + 10;
    }

    surface.addTarget({
      contains: (px: number, py: number) => hitBob(px, py),
      pointerDown: (q: { px: number; py: number }) => {
        if (!hitBob(q.px, q.py)) return false;
        ctx.clock.pause();
        scrub = null;
        drag = { moved: false, x: q.px, y: q.py };
        surface.setCursor('grabbing');
        ctx.requestRender();
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (!drag || !geo) return;
        if (!drag.moved && Math.hypot(q.px - drag.x, q.py - drag.y) < 3) return;
        drag.moved = true;
        const ang = toDeg(Math.atan2(q.px - geo.cx, q.py - geo.cy));
        ctx.set({ amp: clamp(Math.round(ang), -170, 170) });
      },
      pointerUp: () => {
        const moved = drag?.moved ?? false;
        drag = null;
        surface.setCursor(hover ? 'grab' : '');
        // Loslassen: das Pendel schwingt aus der neuen Auslenkung
        if (moved && !ctx.locked && p.amp !== 0) {
          restart();
          disp.phi = state[0];
          updateReadouts();
          ctx.clock.play();
        }
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const h = q ? hitBob(q.px, q.py) : false;
        if (h !== hover) {
          hover = h;
          ctx.requestRender();
        }
        surface.setCursor(h ? 'grab' : '');
      },
      wheel: () => false,
    });

    /* ---------- Bedienung: Diagramme antippen ---------- */
    function inRect(r: Rect, px: number, py: number): boolean {
      return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
    }

    function panelHit(px: number, py: number): number {
      const kinds = panelsOf(mode());
      return regions().panels.findIndex((r, i) => {
        const k = kinds[i];
        if (!inRect(r, px, py)) return false;
        if (k === 'phi' || k === 'et') return hist.size > 2;
        if (k === 'tl' || k === 't2l') return !measuring();
        return k === 'tf';
      });
    }

    let chartDrag = -1;
    function chartSet(i: number, px: number): void {
      const kind = panelsOf(mode())[i];
      const x = charts[i]!.toWorld(px, 0)[0];
      if (kind === 'phi' || kind === 'et') {
        ctx.clock.pause();
        scrub = clamp(x, Math.max(hist.first(), windowNow().t0), t);
        updateNow();
      } else if (kind === 'tl' || kind === 't2l') ctx.set({ l: clamp(x, 0.2, 2.5) });
      else if (kind === 'tf') ctx.set({ amp: (p.amp < 0 ? -1 : 1) * clamp(Math.round(x), 0, 170) });
      ctx.requestRender();
    }

    surface.addTarget({
      contains: (px: number, py: number) => !ctx.locked && panelHit(px, py) >= 0,
      pointerDown: (q: { px: number; py: number }) => {
        const i = panelHit(q.px, q.py);
        if (i < 0 || ctx.locked) return false;
        chartDrag = i;
        chartSet(i, q.px);
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (chartDrag >= 0) chartSet(chartDrag, q.px);
      },
      pointerUp: () => {
        chartDrag = -1;
      },
      hover: (q: { px: number; py: number } | null) => {
        const i = q ? panelHit(q.px, q.py) : -1;
        surface.setCursor(i >= 0 ? 'ew-resize' : '');
      },
      wheel: () => false,
    });

    const offClock = ctx.clock.onChange((playing) => {
      if (playing && scrub !== null) {
        scrub = null;
        updateNow();
      }
    });

    /* ---------- Messung ---------- */
    function startMeasurement(): void {
      restart();
      disp.phi = state[0];
      // Zeitraffer, damit 10 Schwingungen höchstens etwa 8 s dauern
      const speed = clamp(Math.round((MEASURE_N * Tex()) / 8), 1, 6);
      meas = { err: p.react ? reactionError(Math.random) : 0, speed, done: false, reading: 0 };
      updateReadouts();
      ctx.clock.play();
    }

    function onReturn(): void {
      if (!meas || meas.done) return;
      const count = returns.length - 1;
      countPop.play();
      if (count >= MEASURE_N) {
        const reading = Math.max(0.1, returns[MEASURE_N]! + meas.err);
        meas.done = true;
        meas.reading = reading;
        series.push({ l: p.l, T: reading / MEASURE_N, planet: planetId(), reading });
        resultPop.play();
        updateReadouts();
      }
    }

    restart();
    intro.play();
    disp = { pot: e0(), kin: 0, heat: 0, T0: T0(), phi: amp() };

    return {
      update(changed, source) {
        const physics = source === 'init' || source === 'replace' || PHYSICS.some((key) => changed.has(key));
        if (physics) {
          restart();
          if (source === 'init' || source === 'replace') ctx.clock.pause();
        }
        if (source === 'init' || source === 'replace') {
          series = [];
          split = -1;
        }
        if (changed.has('m') && source === 'input' && !physics) {
          const f = p.m / lastMass;
          if (Math.abs(f - 1) > 0.01) transient = { text: tr('hMass', { f: fmt.num(f, 2), t: fmt.fixed(Tex() || T0(), 2) }), until: performance.now() + 3400 };
        }
        lastMass = p.m;
        if (changed.has('mode')) scrub = null;
        if (changed.has('mode') && source !== 'init') fade.play();
        updateReadouts();
      },

      action(id) {
        if (id === 'release') {
          restart();
          disp.phi = state[0];
          updateReadouts();
          ctx.clock.play();
        } else if (id === 'measure') {
          if (ctx.locked || p.amp === 0) return;
          startMeasurement();
        } else if (id === 'clear') {
          if (ctx.locked) return;
          series = [];
          updateReadouts();
          ctx.requestRender();
        }
      },

      tick(dt) {
        if (drag) return;
        const speed = meas && !meas.done ? meas.speed : p.slow ? 0.25 : 1;
        const side = Math.sign(p.amp);
        let returned = false;
        stepper.run(dt * speed, (h) => {
          const w0 = side * state[1];
          state = step(state, p.l, g(), gam(), h);
          t += h;
          const w1 = side * state[1];
          // Rückkehr zum Startumkehrpunkt: eine volle Schwingung
          if (w0 > 0 && w1 <= 0) {
            returns.push(crossingTime(t - h, w0, t, w1));
            if (returns.length > 400) returns = returns.slice(-200);
            returned = true;
            onReturn();
          }
          if (t >= nextSample - 1e-9) {
            hist.push(t, state);
            nextSample += SAMPLE;
          }
        });
        if (returned) updateMeasured();
        updateNow();
      },

      resetTime() {
        restart();
        updateReadouts();
      },

      render() {
        const nowMs = performance.now();
        const dt = Math.min(0.1, (nowMs - lastFrame) / 1000);
        lastFrame = nowMs;
        const st = splitTarget();
        if (split < 0 || prefersReducedMotion()) split = st;
        else {
          split += (st - split) * (1 - Math.exp(-dt * 9));
          if (Math.abs(split - st) < 0.002) split = st;
        }
        // Läuft ein Übergang zu Beginn des Bildes, folgt sicher noch eins (sonst fehlt das Endbild)
        const animating = intro.running || fade.running || countPop.running || resultPop.running;
        const reg = regions();
        for (const c of charts) c.resize();
        const moving = stepView(reg.scene, dt);
        // Weiche Zahlen und Bewegungen nur bei Einstellungsänderungen; während das Pendel
        // schwingt, zeigen Säulen und Winkel genau den aktuellen Wert.
        const live = ctx.clock.playing || t > 0 || drag !== null || scrub !== null;
        const k = prefersReducedMotion() ? 1 : 1 - Math.exp(-dt * 12);
        const v = now();
        const e = energies(v.s, p.l, g(), p.m);
        const heat = Math.max(0, e0() - e.pot - e.kin);
        const ke = live ? 1 : k;
        disp.pot = lerp(disp.pot, e.pot, ke);
        disp.kin = lerp(disp.kin, e.kin, ke);
        disp.heat = lerp(disp.heat, heat, ke);
        disp.T0 = lerp(disp.T0, T0(), k);
        disp.phi = live ? v.s[0] : lerp(disp.phi, v.s[0], k);
        const settling =
          Math.abs(disp.pot - e.pot) + Math.abs(disp.kin - e.kin) + Math.abs(disp.heat - heat) > Math.max(1e-6, e0() * 0.002) || Math.abs(disp.T0 - T0()) > 0.0005 || Math.abs(disp.phi - v.s[0]) > 0.001;
        if (!settling) {
          disp.T0 = T0();
          disp.phi = v.s[0];
        }
        geo = buildGeo(reg.scene);
        surface.begin();
        drawScene(reg.scene);
        drawPanels(reg);
        const busy = moving || settling || split !== st || animating || intro.running || fade.running || countPop.running || resultPop.running || (transient !== null && transient.until > nowMs);
        if (busy) ctx.requestRender();
      },

      destroy: () => {
        offClock();
        surface.destroy();
      },
    };
  },
});
