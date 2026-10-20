import { defineSimulation, drawLabStand, ease, FixedStepper, Plot, prefersReducedMotion, roundRect, scaledSprite, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { acceleration, dampedOmega, dampedPeriod, energies, equilibriumExtension, forces, initialState, omega0, period, phasor, step, type State } from './model';

const L = (de: string, en: string) => ({ de, en });
/** Länge der ungedehnten Feder in m. */
const L0 = 0.12;
/** Abstand der gespeicherten Messwerte (Simulationszeit) in s. */
const SAMPLE = 1 / 240;
const DEG = Math.PI / 180;
const TAU = 2 * Math.PI;

type GraphKey = 'y' | 'v' | 'a';
type EnergyMode = 'off' | 'osc' | 'full';
type VecMode = 'va' | 'F' | 'off';

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** Zeitfenster der Diagramme: etwa drei Perioden, auf „glatte“ Werte gerundet. */
function niceWindow(T: number): number {
  const want = 3.3 * T;
  for (const w of [2, 3, 4, 5, 6, 8, 10]) if (w >= want) return w;
  return 12;
}

/** Messwertspeicher: Zeit, Elongation und Geschwindigkeit beider Pendel. */
class History {
  t: number[] = [];
  ya: number[] = [];
  va: number[] = [];
  yb: number[] = [];
  vb: number[] = [];
  head = 0;

  clear(): void {
    this.t = [];
    this.ya = [];
    this.va = [];
    this.yb = [];
    this.vb = [];
    this.head = 0;
  }

  push(t: number, a: State, b: State): void {
    this.t.push(t);
    this.ya.push(a[0]);
    this.va.push(a[1]);
    this.yb.push(b[0]);
    this.vb.push(b[1]);
  }

  get size(): number {
    return this.t.length - this.head;
  }

  /** Alte Werte verwerfen (bis kurz vor tMin). */
  trim(tMin: number): void {
    while (this.head < this.t.length - 2 && this.t[this.head + 1]! < tMin) this.head++;
    if (this.head > 4000) {
      this.t = this.t.slice(this.head);
      this.ya = this.ya.slice(this.head);
      this.va = this.va.slice(this.head);
      this.yb = this.yb.slice(this.head);
      this.vb = this.vb.slice(this.head);
      this.head = 0;
    }
  }

  first(): number {
    return this.t[this.head] ?? 0;
  }

  /** Index des ersten Werts mit Zeit ≥ tt. */
  indexAt(tt: number): number {
    let lo = this.head;
    let hi = this.t.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.t[mid]! < tt) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  /** Zustände beider Pendel zur Zeit tt (linear interpoliert). */
  stateAt(tt: number): { a: [number, number]; b: [number, number] } | null {
    if (this.size < 1) return null;
    const i = this.indexAt(tt);
    const j = Math.max(this.head, i - 1);
    const t0 = this.t[j]!;
    const t1 = this.t[i]!;
    const s = t1 > t0 ? clamp((tt - t0) / (t1 - t0), 0, 1) : 0;
    const mix = (arr: number[]) => arr[j]! + (arr[i]! - arr[j]!) * s;
    return { a: [mix(this.ya), mix(this.va)], b: [mix(this.yb), mix(this.vb)] };
  }
}

/** Lage des Körpers im Foto gewicht.webp (161 × 410 px): Haken oben, darunter der Zylinder. */
const MASS_IMG = { w: 161, h: 410, cx: 79.5, bodyTop: 100, body: 310, bodyAspect: 310 / 158, hookShare: 100 / 310 };

interface Pend {
  /** Mitte des Körpers (x) in Pixeln. */
  x: number;
  m: number;
  D: number;
  s0: number;
  mw: number;
  mh: number;
  /** Aufhängepunkt (y) und Stativstange (x). */
  sup: number;
  rod: number;
  /** +1: Pfeile/Beschriftung rechts vom Körper, −1: links. */
  side: 1 | -1;
}

interface Geo {
  r: Rect;
  small: boolean;
  k: number;
  yEq: number;
  tableY: number;
  rulerX: number;
  rulerW: number;
  rulerTop: number;
  rulerBot: number;
  hook: number;
  pend: Pend[];
  /** Zeigerdiagramm: Mittelpunkt und Radius (Pixel). */
  cx: number;
  R: number;
  arrowsW: number;
}

interface Layout {
  scene: Rect;
  charts: Partial<Record<GraphKey, Rect>>;
  chartArea: Rect;
  energy: Rect | null;
  tall: boolean;
}

/**
 * Federpendel: senkrecht an einer Schraubenfeder schwingender Körper mit
 * Maßstab, Zeigerdiagramm, synchronen y(t)-, v(t)- und a(t)-Diagrammen mit
 * Zeitmarke, Energiebalken, Stoppuhr, Dämpfung und Vergleichspendel.
 */
export default defineSimulation({
  id: 'federpendel',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.32, aspectNarrow: 0.46 },
  groups: [
    { id: 'start', label: L('Anfangsbedingung', 'Initial condition') },
    { id: 'cmp', label: L('Vergleichspendel B', 'Comparison pendulum B') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    { key: 'm', type: 'number', label: L('Masse m', 'Mass m'), min: 0.1, max: 1, step: 0.05, default: 0.5, unit: 'kg' },
    { key: 'D', type: 'number', label: L('Federhärte D', 'Spring constant D'), min: 10, max: 60, step: 1, default: 20, unit: 'N/m' },
    {
      key: 'damp',
      type: 'number',
      label: L('Dämpfung δ', 'Damping δ'),
      help: L('Abklingkonstante: Die Amplitude nimmt mit e^(−δ·t) ab.', 'Decay constant: the amplitude decreases as e^(−δ·t).'),
      min: 0,
      max: 2,
      step: 0.05,
      default: 0,
      unit: '1/s',
    },
    {
      key: 'amp',
      type: 'number',
      group: 'start',
      label: L('Amplitude ŷ', 'Amplitude ŷ'),
      help: L('Oder: Körper nach oben oder unten ziehen und loslassen.', 'Or: pull the body up or down and let go.'),
      min: 1,
      max: 10,
      step: 0.5,
      default: 8,
      unit: 'cm',
    },
    {
      key: 'phi',
      type: 'number',
      group: 'start',
      label: L('Nullphasenwinkel φ₀', 'Initial phase φ₀'),
      help: L('−90°: nach unten gezogen und losgelassen; 0°: aus der Ruhelage nach oben angestoßen. Oder: Zeiger ziehen.', '−90°: pulled down and released; 0°: pushed upwards from the equilibrium position. Or drag the phasor.'),
      min: -180,
      max: 180,
      step: 15,
      default: -90,
      unit: '°',
    },
    { key: 'cmp', type: 'boolean', group: 'cmp', label: L('Zweites Pendel zum Vergleich', 'Second pendulum for comparison'), default: false },
    { key: 'm2', type: 'number', group: 'cmp', label: L('Masse m_B', 'Mass m_B'), min: 0.1, max: 1, step: 0.05, default: 1, unit: 'kg', visibleIf: (v) => v.cmp === true },
    { key: 'D2', type: 'number', group: 'cmp', label: L('Federhärte D_B', 'Spring constant D_B'), min: 10, max: 60, step: 1, default: 20, unit: 'N/m', visibleIf: (v) => v.cmp === true },
    {
      key: 'graphs',
      type: 'choice',
      group: 'view',
      label: L('Diagramme', 'Graphs'),
      options: [
        { value: 'y', label: L('y(t)', 'y(t)') },
        { value: 'yv', label: L('y(t), v(t)', 'y(t), v(t)') },
        { value: 'yva', label: L('y(t), v(t), a(t)', 'y(t), v(t), a(t)') },
      ],
      default: 'yva',
    },
    {
      key: 'energy',
      type: 'choice',
      group: 'view',
      label: L('Energie', 'Energy'),
      options: [
        { value: 'off', label: L('aus', 'off') },
        { value: 'osc', label: L('½·D·y² und ½·m·v²', '½·D·y² and ½·m·v²') },
        { value: 'full', label: L('Spann-, Lage-, Bewegungsenergie', 'elastic, gravitational, kinetic') },
      ],
      default: 'osc',
    },
    {
      key: 'vec',
      type: 'choice',
      group: 'view',
      label: L('Pfeile am Körper', 'Arrows on the body'),
      options: [
        { value: 'va', label: L('v und a', 'v and a') },
        { value: 'F', label: L('Kräfte', 'forces') },
        { value: 'off', label: L('keine', 'none') },
      ],
      default: 'va',
    },
    { key: 'phasor', type: 'boolean', group: 'view', label: L('Zeigerdiagramm', 'Phasor diagram'), default: true },
    { key: 'per', type: 'boolean', group: 'view', label: L('Periodendauer anzeigen', 'Show the period'), default: true },
    { key: 'slow', type: 'boolean', group: 'view', label: L('Zeitlupe', 'Slow motion'), default: false },
  ],
  actions: [
    { id: 'go', label: L('Start', 'Start'), primary: true },
    { id: 'watch', label: L('Stoppuhr starten', 'Start stopwatch') },
  ],
  images: { stand: 'stativ.webp', mass: 'gewicht.webp' },
  readouts: [
    { key: 'T', label: L('Periodendauer', 'Period'), spoiler: true },
    { key: 'eq', label: L('Ruhelage', 'Equilibrium position') },
    { key: 'law', label: L('Zeit-Elongation-Gesetz', 'Displacement–time law'), spoiler: true },
    { key: 'watch', label: L('Stoppuhr', 'Stopwatch') },
    { key: 'cmp', label: L('Vergleich', 'Comparison'), spoiler: true },
    { key: 'now', label: L('Momentan', 'Right now') },
  ],
  resultsParam: 'per',
  presets: [
    { id: 'start', label: L('Nach unten ziehen und loslassen', 'Pull down and release'), values: {} },
    { id: 'mass', label: L('Vierfache Masse im Vergleich', 'Four times the mass compared'), values: { cmp: true, m: 0.25, m2: 1, D2: 20 } },
    { id: 'stiff', label: L('Vierfache Federhärte im Vergleich', 'Four times as stiff compared'), values: { cmp: true, m: 0.3, D: 10, m2: 0.3, D2: 40 } },
    { id: 'push', label: L('Aus der Ruhelage angestoßen (φ₀ = 0°)', 'Pushed from equilibrium (φ₀ = 0°)'), values: { phi: 0 } },
    { id: 'damped', label: L('Gedämpfte Schwingung', 'Damped oscillation'), values: { damp: 0.3, amp: 8, graphs: 'y' } },
    { id: 'energy', label: L('Kräfte und Energieformen', 'Forces and forms of energy'), values: { energy: 'full', vec: 'F', graphs: 'yv' } },
  ],
  strings: {
    de: {
      canvas: 'Senkrechtes Federpendel am Stativ mit Maßstab und Zeigerdiagramm, daneben Diagramme von Elongation, Geschwindigkeit und Beschleunigung über der Zeit sowie Energiebalken',
      axisT: 't in s',
      axisY: 'y in cm',
      axisV: 'v in m/s',
      axisA: 'a in m/s²',
      rest: 'Ruhelage',
      cm: 'cm',
      energy: 'Energie',
      energyA: 'Energie (Pendel A)',
      ePot: 'E_[pot] = ½·D·y²',
      eKin: 'E_[kin] = ½·m·v²',
      ePotS: 'E_[pot]',
      eKinS: 'E_[kin]',
      eSpring: 'Spannenergie',
      eGrav: 'Lageenergie',
      eKinL: 'Bewegungsenergie',
      eSpringS: 'E_[Spann]',
      eGravS: 'E_[Lage]',
      eSum: 'Summe',
      eLoss: 'innere Energie',
      watch: 'Stoppuhr',
      periods: 'n = {n}',
      scrub: 'Zeitmarke',
      scrubHint: 'Diagramm antippen: Zeitmarke setzen',
      T: 'T = {T} s',
      TAB: 'T_[A] = {a} s · T_[B] = {b} s',
      Tshort: 'T ≈ {T} s',
      Tlabel: 'T',
      pendA: 'A',
      pendB: 'B',
      FF: 'F_[F]',
      FG: 'F_[G]',
      FR: 'F_[R]',
      lawText: '<var>y</var>(<var>t</var>) = <var>ŷ</var> · sin(<var>ω</var> · <var>t</var> + <var>φ</var>₀) = {amp} cm · sin({w} 1/s · <var>t</var>{phi})<br><var>v̂</var> = <var>ŷ</var> · <var>ω</var> ≈ {v} m/s · <var>â</var> = <var>ŷ</var> · <var>ω</var>² ≈ {a} m/s²',
      lawDamped: '<var>y</var>(<var>t</var>) = <var>ŷ</var> · e<sup>−<var>δ</var>·<var>t</var></sup> · sin(<var>ω</var><sub>d</sub> · <var>t</var> + <var>φ</var>₀) = {amp} cm · e<sup>−{d}·<var>t</var></sup> · sin({w} 1/s · <var>t</var>{phi})',
      eqText: '<var>s</var>₀ = <span class="frac"><span><var>m</var> · <var>g</var></span><span><var>D</var></span></span> = <span class="frac"><span>{m} kg · 9,81 N/kg</span><span>{D} N/m</span></span> ≈ <strong>{s} cm</strong> Dehnung; dort gilt <var>F</var><sub>F</sub> = <var>F</var><sub>G</sub>.',
      TText: '<var>T</var> = 2π · √(<var>m</var> / <var>D</var>) = 2π · √({m} kg / {D} N/m) ≈ <strong>{T} s</strong><br><var>f</var> = 1/<var>T</var> ≈ {f} Hz · <var>ω</var> = 2π/<var>T</var> ≈ {w} 1/s',
      TDamped: '<br>gedämpft: <var>T</var><sub>d</sub> = 2π / √(<var>ω</var>₀² − <var>δ</var>²) ≈ {Td} s',
      watchIdle: 'Starte die Stoppuhr und stoppe sie nach einigen vollen Perioden (wenn der Zeiger wieder die Startmarke erreicht).',
      watchRun: 'läuft: {t} s · {n} volle Perioden',
      watchDone: '{n} Perioden in <var>t</var> = {t} s → <var>T</var> = <var>t</var> / {n} ≈ <strong>{T} s</strong>',
      watchNone: 'Gestoppt nach {t} s – noch keine volle Periode.',
      watchOff: 'Gestoppt nach {t} s und {n} vollen Perioden; der Zeiger war nicht genau an der Startmarke.',
      cmpText: '<var>T</var><sub>B</sub> ≈ {Tb} s; <var>T</var><sub>B</sub> : <var>T</var><sub>A</sub> = √(<var>m</var><sub>B</sub> · <var>D</var><sub>A</sub> / (<var>m</var><sub>A</sub> · <var>D</var><sub>B</sub>)) ≈ <strong>{r}</strong>',
      now: 't = {t} s · y = {y} cm · v = {v} m/s · a = {a} m/s²',
      nowScrub: 'Zeitmarke t = {t} s · y = {y} cm · v = {v} m/s · a = {a} m/s²',
      startLabel: 'Stoppuhr starten',
      stopLabel: 'Stoppuhr stoppen',
    },
    en: {
      canvas: 'Vertical spring pendulum on a stand with a scale and a phasor diagram, next to it graphs of displacement, velocity and acceleration against time and energy bars',
      axisT: 't in s',
      axisY: 'y in cm',
      axisV: 'v in m/s',
      axisA: 'a in m/s²',
      rest: 'equilibrium',
      cm: 'cm',
      energy: 'Energy',
      energyA: 'Energy (pendulum A)',
      ePot: 'E_[pot] = ½·D·y²',
      eKin: 'E_[kin] = ½·m·v²',
      ePotS: 'E_[pot]',
      eKinS: 'E_[kin]',
      eSpring: 'elastic energy',
      eGrav: 'grav. energy',
      eKinL: 'kinetic energy',
      eSpringS: 'E_[el]',
      eGravS: 'E_[grav]',
      eSum: 'total',
      eLoss: 'internal energy',
      watch: 'Stopwatch',
      periods: 'n = {n}',
      scrub: 'time marker',
      scrubHint: 'Tap a graph to set the time marker',
      T: 'T = {T} s',
      TAB: 'T_[A] = {a} s · T_[B] = {b} s',
      Tshort: 'T ≈ {T} s',
      Tlabel: 'T',
      pendA: 'A',
      pendB: 'B',
      FF: 'F_[s]',
      FG: 'F_[g]',
      FR: 'F_[r]',
      lawText: '<var>y</var>(<var>t</var>) = <var>ŷ</var> · sin(<var>ω</var> · <var>t</var> + <var>φ</var>₀) = {amp} cm · sin({w} 1/s · <var>t</var>{phi})<br><var>v̂</var> = <var>ŷ</var> · <var>ω</var> ≈ {v} m/s · <var>â</var> = <var>ŷ</var> · <var>ω</var>² ≈ {a} m/s²',
      lawDamped: '<var>y</var>(<var>t</var>) = <var>ŷ</var> · e<sup>−<var>δ</var>·<var>t</var></sup> · sin(<var>ω</var><sub>d</sub> · <var>t</var> + <var>φ</var>₀) = {amp} cm · e<sup>−{d}·<var>t</var></sup> · sin({w} 1/s · <var>t</var>{phi})',
      eqText: '<var>s</var>₀ = <span class="frac"><span><var>m</var> · <var>g</var></span><span><var>D</var></span></span> = <span class="frac"><span>{m} kg · 9.81 N/kg</span><span>{D} N/m</span></span> ≈ <strong>{s} cm</strong> extension; there <var>F</var><sub>s</sub> = <var>F</var><sub>g</sub>.',
      TText: '<var>T</var> = 2π · √(<var>m</var> / <var>D</var>) = 2π · √({m} kg / {D} N/m) ≈ <strong>{T} s</strong><br><var>f</var> = 1/<var>T</var> ≈ {f} Hz · <var>ω</var> = 2π/<var>T</var> ≈ {w} 1/s',
      TDamped: '<br>damped: <var>T</var><sub>d</sub> = 2π / √(<var>ω</var>₀² − <var>δ</var>²) ≈ {Td} s',
      watchIdle: 'Start the stopwatch and stop it after a few full periods (when the phasor reaches the start mark again).',
      watchRun: 'running: {t} s · {n} full periods',
      watchDone: '{n} periods in <var>t</var> = {t} s → <var>T</var> = <var>t</var> / {n} ≈ <strong>{T} s</strong>',
      watchNone: 'Stopped after {t} s – not a full period yet.',
      watchOff: 'Stopped after {t} s and {n} full periods; the phasor was not exactly at the start mark.',
      cmpText: '<var>T</var><sub>B</sub> ≈ {Tb} s; <var>T</var><sub>B</sub> : <var>T</var><sub>A</sub> = √(<var>m</var><sub>B</sub> · <var>D</var><sub>A</sub> / (<var>m</var><sub>A</sub> · <var>D</var><sub>B</sub>)) ≈ <strong>{r}</strong>',
      now: 't = {t} s · y = {y} cm · v = {v} m/s · a = {a} m/s²',
      nowScrub: 'time marker t = {t} s · y = {y} cm · v = {v} m/s · a = {a} m/s²',
      startLabel: 'Start stopwatch',
      stopLabel: 'Stop stopwatch',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const small = () => surface.width < 700;
    const yColor = () => ctx.theme.series[0]!;
    const vColor = () => ctx.theme.series[3]!;
    const aColor = () => ctx.theme.series[4]!;
    const COLOR: Record<GraphKey, () => string> = { y: yColor, v: vColor, a: aColor };

    /* ---------- Größen ---------- */
    const mB = () => (p.cmp ? p.m2 : p.m);
    const DB = () => (p.cmp ? p.D2 : p.D);
    const graphs = (): GraphKey[] => (p.graphs === 'y' ? ['y'] : p.graphs === 'yv' ? ['y', 'v'] : ['y', 'v', 'a']);
    const energyMode = () => p.energy as EnergyMode;
    const vecMode = () => p.vec as VecMode;
    const ampM = () => p.amp / 100;
    const maxT = () => Math.max(period(p.m, p.D), p.cmp ? period(mB(), DB()) : 0);

    /* ---------- Aufteilung der Bühne ---------- */
    function computeLayout(): Layout {
      const w = surface.width;
      const h = surface.height;
      const sm = small();
      const tall = w < 640 && h > w * 0.9;
      const em = energyMode();
      const rowH = sm ? 19 : 21;
      const eh = em === 'off' ? 0 : (em === 'full' ? 4 : 3) * rowH + (sm ? 36 : 40);
      let scene: Rect;
      let col: Rect;
      if (!tall) {
        const sw = Math.round(w * (w < 760 ? 0.55 : 0.52));
        scene = { x: 0, y: 0, w: sw, h };
        col = { x: sw + 10, y: 0, w: w - sw - 10, h };
      } else {
        const sh = Math.round(h * 0.5);
        scene = { x: 0, y: 0, w, h: sh };
        col = { x: 0, y: sh + 8, w, h: h - sh - 8 };
      }
      const energy = eh ? { x: col.x, y: col.y + col.h - eh, w: col.w, h: eh } : null;
      const area: Rect = { x: col.x, y: col.y, w: col.w, h: col.h - (eh ? eh + 8 : 0) };
      const keys = graphs();
      const gap = 8;
      const each = (area.h - gap * (keys.length - 1)) / keys.length;
      const charts: Partial<Record<GraphKey, Rect>> = {};
      keys.forEach((key, i) => {
        charts[key] = { x: area.x, y: area.y + i * (each + gap), w: area.w, h: each };
      });
      return { scene, charts, chartArea: area, energy, tall };
    }
    let lay = computeLayout();

    const HIDDEN: Rect = { x: -10, y: -10, w: 1, h: 1 };
    const makePlot = (key: GraphKey) =>
      new Plot(surface, {
        x: [0, 4],
        y: [-1, 1],
        equalAspect: false,
        pan: false,
        zoom: false,
        controls: false,
        region: () => lay.charts[key] ?? HIDDEN,
        xAxis: { label: ctx.t('axisT') },
        yAxis: { label: '', numbers: false },
      });
    const plots: Record<GraphKey, Plot> = { y: makePlot('y'), v: makePlot('v'), a: makePlot('a') };

    /* ---------- Zustand ---------- */
    let sA: State = [0, 0];
    let sB: State = [0, 0];
    let t = 0;
    let nextSample = 0;
    const hist = new History();
    const stepper = new FixedStepper(0.001);
    /** Aufsummierter Phasenwinkel von Pendel A (für die Stoppuhr). */
    let phaseAcc = 0;
    let lastPhase = 0;
    /** Anfangsenergie (Bezug für die Energiebalken) und Bezugsniveau der Lageenergie. */
    let e0 = 1;
    let yRef = 0;
    let scrub: number | null = null;
    let watch: { state: 'idle' | 'run' | 'done'; t0: number; ph0: number; t: number; n: number; exact: boolean } = { state: 'idle', t0: 0, ph0: 0, t: 0, n: 0, exact: true };
    const pop = new Tween(450, ease.outBack);
    let kView = 0;
    let lastFrame = performance.now();
    let geo: Geo | null = null;
    let drag: { kind: 'mass' | 'phasor'; moved: boolean; x: number; y: number } | null = null;
    let hoverKind: 'mass' | 'phasor' | null = null;

    function restart(): void {
      sA = initialState(ampM(), p.phi * DEG, p.m, p.D, p.damp);
      sB = initialState(ampM(), p.phi * DEG, mB(), DB(), p.damp);
      t = 0;
      nextSample = SAMPLE;
      hist.clear();
      hist.push(0, sA, sB);
      stepper.reset();
      phaseAcc = phasor(sA, p.m, p.D, p.damp).phase;
      lastPhase = phaseAcc;
      yRef = -ampM();
      const e = energies(sA, p.m, p.D, yRef);
      e0 = energyMode() === 'full' ? e.spring + e.grav + e.kin : e.osc + e.kin;
      scrub = null;
      watch = { state: 'idle', t0: 0, ph0: 0, t: 0, n: 0, exact: true };
    }

    /** Angezeigter Zustand: live oder an der Zeitmarke. */
    function view(): { t: number; a: State; b: State } {
      if (scrub !== null) {
        const s = hist.stateAt(scrub);
        if (s) return { t: scrub, a: s.a, b: s.b };
      }
      return { t, a: sA, b: sB };
    }

    /* ---------- Ergebnisse ---------- */
    const n = (v: number, d: number) => fmt.num(v, d);

    function phiText(): string {
      if (p.phi === 0) return '';
      const s = fmt.pi(Math.abs(p.phi) * DEG);
      return ` ${p.phi < 0 ? '−' : '+'} ${s}`;
    }

    function updateNow(): void {
      const v = view();
      const a = acceleration(v.a, p.m, p.D, p.damp);
      ctx.readout('now', tr(scrub !== null ? 'nowScrub' : 'now', { t: fmt.fixed(v.t, 2), y: n(v.a[0] * 100, 1), v: n(v.a[1], 2), a: n(a, 2) }));
    }

    function updateWatch(): void {
      if (watch.state === 'idle') ctx.readout('watch', ctx.t('watchIdle'));
      else if (watch.state === 'run') ctx.readout('watch', tr('watchRun', { t: fmt.fixed(watch.t, 2), n: String(watch.n) }));
      else if (watch.n < 1) ctx.readout('watch', tr('watchNone', { t: fmt.fixed(watch.t, 2) }));
      else ctx.readout('watch', { html: tr('watchDone', { t: fmt.fixed(watch.t, 2), n: String(watch.n), T: n(watch.t / watch.n, 3) }) + (watch.exact ? '' : `<br>${tr('watchOff', { t: fmt.fixed(watch.t, 2), n: String(watch.n) })}`) });
      ctx.setAction('watch', { label: ctx.t(watch.state === 'run' ? 'stopLabel' : 'startLabel'), enabled: !ctx.locked });
    }

    function updateReadouts(): void {
      const T = period(p.m, p.D);
      const w = omega0(p.m, p.D);
      let html = tr('TText', { m: n(p.m, 2), D: n(p.D, 0), T: n(T, 3), f: n(1 / T, 2), w: n(w, 2) });
      if (p.damp > 0) html += tr('TDamped', { Td: n(dampedPeriod(p.m, p.D, p.damp), 3) });
      ctx.readout('T', { html });
      ctx.readout('eq', { html: tr('eqText', { m: n(p.m, 2), D: n(p.D, 0), s: n(equilibriumExtension(p.m, p.D) * 100, 1) }) });
      if (p.damp > 0) ctx.readout('law', { html: tr('lawDamped', { amp: n(p.amp, 1), d: n(p.damp, 2), w: n(dampedOmega(p.m, p.D, p.damp), 2), phi: phiText() }) });
      else ctx.readout('law', { html: tr('lawText', { amp: n(p.amp, 1), w: n(w, 2), phi: phiText(), v: n(ampM() * w, 2), a: n(ampM() * w * w, 2) }) });
      if (p.cmp) {
        const Tb = period(mB(), DB());
        ctx.readout('cmp', { html: tr('cmpText', { Tb: n(Tb, 3), r: n(Tb / T, 2) }) });
      } else ctx.readout('cmp', null);
      updateWatch();
      updateNow();
    }

    /* ---------- Geometrie der Szene ---------- */
    function massSize(m: number, sm: boolean): { w: number; h: number } {
      const w = (24 + 20 * Math.cbrt(m)) * (sm ? 0.82 : 1);
      // Foto des Hakengewichts: schlanker Zylinder (Seitenverhältnis des Bildes)
      if (ctx.images.get('mass')) return { w: w * 0.8, h: w * 0.8 * MASS_IMG.bodyAspect };
      return { w, h: w * 0.82 };
    }

    /** Waagerechte Anordnung (ohne Maßstab k). */
    function placeX(r: Rect, sm: boolean): { rodA: number; rulerX: number; rulerW: number; xA: number; xB: number; rodB: number; cx: number; space: number; arrowsW: number } {
      const pad = sm ? 8 : 12;
      const rulerW = sm ? 22 : 26;
      const arrowsW = vecMode() === 'off' ? 0 : sm ? 32 : 40;
      const ma = massSize(p.m, sm);
      const mb = massSize(mB(), sm);
      let rodA = r.x + pad + 4;
      let xA: number;
      let xB = 0;
      let rodB = 0;
      if (p.phasor || p.cmp) xA = rodA + 14 + rulerW + 10 + ma.w / 2;
      else {
        xA = r.x + r.w * 0.5;
        rodA = Math.max(rodA, xA - ma.w / 2 - 10 - rulerW - 60);
      }
      const left = xA + ma.w / 2 + arrowsW + 6;
      let right = r.x + r.w - pad;
      if (p.cmp) {
        rodB = r.x + r.w - pad - 4;
        xB = p.phasor ? rodB - 14 - mb.w / 2 - 6 : Math.max(left + mb.w / 2 + arrowsW + 30, r.x + r.w * 0.66);
        right = xB - mb.w / 2 - arrowsW - 6;
      }
      const rulerX = xA - ma.w / 2 - 10 - rulerW / 2;
      return { rodA, rulerX, rulerW, xA, xB, rodB, cx: (left + right) / 2, space: right - left, arrowsW };
    }

    function verticalFrame(r: Rect, sm: boolean): { top: number; bottom: number; tableY: number; hook: number } {
      const tableY = r.y + r.h - (sm ? 16 : 20);
      // Mit Foto: Platz für den Haken des schwersten Körpers
      const hook = ctx.images.get('mass') ? Math.ceil(Math.max(...pendList().map((q) => massSize(q.m, sm).h)) * MASS_IMG.hookShare) : sm ? 7 : 9;
      return { top: r.y + (sm ? 46 : 54), bottom: tableY - 10, tableY, hook };
    }

    function pendList(): { m: number; D: number }[] {
      return p.cmp ? [{ m: p.m, D: p.D }, { m: mB(), D: DB() }] : [{ m: p.m, D: p.D }];
    }

    /** Maßstab (Pixel pro m), damit alles in die Szene passt. */
    function kTarget(r: Rect): number {
      const sm = small();
      const vf = verticalFrame(r, sm);
      const ampV = Math.max(ampM(), 0.02);
      const list = pendList();
      const mhMax = Math.max(...list.map((q) => massSize(q.m, sm).h));
      let k = Infinity;
      for (const q of list) {
        const mh = massSize(q.m, sm).h;
        const room = vf.bottom - vf.top - mh / 2 - vf.hook - mhMax / 2;
        k = Math.min(k, room / (L0 + equilibriumExtension(q.m, q.D) + ampV));
      }
      if (p.phasor) {
        const hx = placeX(r, sm);
        k = Math.min(k, Math.max(18, hx.space / 2 - (sm ? 8 : 14)) / ampM());
      }
      return Math.max(40, k);
    }

    function buildGeo(r: Rect, k: number): Geo {
      const sm = small();
      const vf = verticalFrame(r, sm);
      const hx = placeX(r, sm);
      const list = pendList();
      const ampV = Math.max(ampM(), 0.02);
      const sizes = list.map((q) => massSize(q.m, sm));
      const mhMax = Math.max(...sizes.map((s) => s.h));
      const upper = Math.max(...list.map((q, i) => sizes[i]!.h / 2 + vf.hook + (L0 + equilibriumExtension(q.m, q.D)) * k));
      const lower = ampV * k + mhMax / 2;
      const slack = Math.max(0, vf.bottom - vf.top - upper - lower);
      const yEq = vf.top + upper + slack * 0.45;
      const pend: Pend[] = list.map((q, i) => {
        const s0 = equilibriumExtension(q.m, q.D);
        const size = sizes[i]!;
        return {
          x: i === 0 ? hx.xA : hx.xB,
          m: q.m,
          D: q.D,
          s0,
          mw: size.w,
          mh: size.h,
          sup: yEq - size.h / 2 - vf.hook - (L0 + s0) * k,
          rod: i === 0 ? hx.rodA : hx.rodB,
          side: i === 0 ? 1 : -1,
        };
      });
      const span = ampV * k + (sm ? 14 : 18);
      return {
        r,
        small: sm,
        k,
        yEq,
        tableY: vf.tableY,
        rulerX: hx.rulerX,
        rulerW: hx.rulerW,
        rulerTop: yEq - span,
        rulerBot: yEq + span,
        hook: vf.hook,
        pend,
        cx: hx.cx,
        R: ampM() * k,
        arrowsW: hx.arrowsW,
      };
    }

    /* ---------- Zeiger: Körper und Zeigerspitze ziehen, Diagramm antippen ---------- */
    function phasorTip(g0: Geo, s: State, m: number, D: number): [number, number] {
      const ph = phasor(s, m, D, p.damp);
      const len = ph.amp * g0.k;
      return [g0.cx + len * Math.cos(ph.phase), g0.yEq - len * Math.sin(ph.phase)];
    }

    function hitScene(px: number, py: number): 'mass' | 'phasor' | null {
      if (!geo) return null;
      const v = view();
      if (p.phasor) {
        const [tx, ty] = phasorTip(geo, v.a, p.m, p.D);
        if (Math.hypot(px - tx, py - ty) < 16) return 'phasor';
      }
      const A = geo.pend[0]!;
      const yc = geo.yEq - v.a[0] * geo.k;
      if (Math.abs(px - A.x) <= A.mw / 2 + 8 && Math.abs(py - yc) <= A.mh / 2 + 10) return 'mass';
      return null;
    }

    surface.addTarget({
      contains: (px: number, py: number) => !ctx.locked && hitScene(px, py) !== null,
      pointerDown: (q: { px: number; py: number }) => {
        const kind = hitScene(q.px, q.py);
        if (!kind || ctx.locked) return false;
        ctx.clock.pause();
        scrub = null;
        drag = { kind, moved: false, x: q.px, y: q.py };
        surface.setCursor('grabbing');
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (!drag || !geo) return;
        if (!drag.moved && Math.hypot(q.px - drag.x, q.py - drag.y) < 3) return;
        drag.moved = true;
        if (drag.kind === 'mass') {
          const y = (geo.yEq - q.py) / geo.k;
          ctx.set({ amp: clamp(Math.abs(y) * 100, 1, 10), phi: y >= 0 ? 90 : -90 });
        } else {
          const dx = q.px - geo.cx;
          const dy = geo.yEq - q.py;
          const ang = Math.atan2(dy, dx) / DEG;
          ctx.set({ amp: clamp((Math.hypot(dx, dy) / geo.k) * 100, 1, 10), phi: ang > 172.5 ? -180 : ang });
        }
      },
      pointerUp: () => {
        const moved = drag?.moved ?? false;
        drag = null;
        surface.setCursor(hoverKind ? 'grab' : '');
        if (moved && !ctx.locked) ctx.clock.play();
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const kind = q ? hitScene(q.px, q.py) : null;
        if (kind !== hoverKind) {
          hoverKind = kind;
          ctx.requestRender();
        }
        surface.setCursor(kind ? 'grab' : '');
      },
      wheel: () => false,
    });

    // Zeitmarke: Diagramme antippen oder darüberziehen (hält die Bewegung an)
    const window0 = () => {
      const W = niceWindow(maxT());
      return { W, t0: Math.max(0, t - 0.86 * W) };
    };
    function setScrub(px: number): void {
      const plot = plots[graphs()[0]!];
      const tt = plot.toWorld(px, 0)[0];
      const { t0 } = window0();
      scrub = clamp(tt, Math.max(t0, hist.first()), t);
      updateNow();
      ctx.requestRender();
    }
    const inArea = (px: number, py: number) => {
      const a = lay.chartArea;
      return px >= a.x && px <= a.x + a.w && py >= a.y && py <= a.y + a.h;
    };
    surface.addTarget({
      contains: (px: number, py: number) => !ctx.locked && hist.size > 2 && inArea(px, py),
      pointerDown: (q: { px: number; py: number }) => {
        if (ctx.locked || hist.size <= 2) return false;
        ctx.clock.pause();
        setScrub(q.px);
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => setScrub(q.px),
      pointerUp: () => {},
      hover: (q: { px: number; py: number } | null) => surface.setCursor(q ? 'ew-resize' : ''),
      wheel: () => false,
    });

    const offClock = ctx.clock.onChange((playing) => {
      if (playing && scrub !== null) {
        scrub = null;
        updateNow();
      }
    });

    /* ---------- Zeichenhilfen ---------- */
    /** Text mit tiefgestellten Teilen: „F_[G]“. */
    function parts(str: string): { t: string; sub: boolean }[] {
      const out: { t: string; sub: boolean }[] = [];
      const re = /_\[([^\]]*)\]/g;
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
      const g = surface.g;
      return parts(str).reduce((w, q) => {
        g.font = `${weight} ${q.sub ? Math.round(size * 0.74) : size}px ${ctx.theme.font}`;
        return w + g.measureText(q.t).width;
      }, 0);
    }

    function richText(str: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center', halo = true, weight = 700): number {
      const g = surface.g;
      const theme = ctx.theme;
      const list = parts(str);
      const total = richWidth(str, size, weight);
      const start = align === 'left' ? x : align === 'right' ? x - total : x - total / 2;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      for (const pass of halo ? [0, 1] : [1]) {
        let cx = start;
        for (const q of list) {
          const s = q.sub ? Math.round(size * 0.74) : size;
          g.font = `${weight} ${s}px ${theme.font}`;
          const yy = y + (q.sub ? size * 0.3 : 0);
          if (pass === 0) {
            g.lineWidth = 3.5;
            g.lineJoin = 'round';
            g.strokeStyle = theme.dark ? 'rgba(16,22,31,0.85)' : 'rgba(250,251,252,0.92)';
            g.strokeText(q.t, cx, yy);
          } else {
            g.fillStyle = color;
            g.fillText(q.t, cx, yy);
          }
          cx += g.measureText(q.t).width;
        }
      }
      return total;
    }

    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, fill?: string): number {
      const g = surface.g;
      const theme = ctx.theme;
      const w = richWidth(label, size) + 16;
      const h = size + 11;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1;
      g.fillStyle = fill ?? (theme.dark ? 'rgba(16,22,31,0.9)' : 'rgba(255,255,255,0.94)');
      roundRect(g, x0, y, w, h, h / 2);
      g.fill();
      g.restore();
      if (!fill) {
        g.strokeStyle = withAlpha(color, 0.45);
        g.lineWidth = 1;
        roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      richText(label, x0 + w / 2, y + h / 2 + 0.5, size, fill ? '#ffffff' : color, 'center', false);
      return w;
    }

    function card(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.bg;
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
      g.fill();
      g.restore();
      g.strokeStyle = theme.dark ? '#273142' : '#e1e6ee';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 12);
      g.stroke();
    }

    /** Senkrechter Pfeil in Pixeln (von y0 nach y1). */
    function vArrow(x: number, y0: number, y1: number, color: string, width: number): void {
      const g = surface.g;
      const len = Math.abs(y1 - y0);
      if (len < 3) return;
      const dir = Math.sign(y1 - y0);
      const head = Math.min(10, len * 0.6);
      g.strokeStyle = color;
      g.fillStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x, y0);
      g.lineTo(x, y1 - dir * head * 0.7);
      g.stroke();
      g.beginPath();
      g.moveTo(x, y1);
      g.lineTo(x - head * 0.55, y1 - dir * head);
      g.lineTo(x + head * 0.55, y1 - dir * head);
      g.closePath();
      g.fill();
    }

    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 10): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 2) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const h = Math.min(head, len * 0.6);
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1 - ux * h * 0.7, y1 - uy * h * 0.7);
      g.stroke();
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - ux * h - uy * h * 0.5, y1 - uy * h + ux * h * 0.5);
      g.lineTo(x1 - ux * h + uy * h * 0.5, y1 - uy * h - ux * h * 0.5);
      g.closePath();
      g.fill();
    }

    /* ---------- Szene ---------- */
    const metal = (x0: number, w: number) => {
      const m = surface.g.createLinearGradient(x0, 0, x0 + w, 0);
      m.addColorStop(0, '#5d6570');
      m.addColorStop(0.45, '#d5dae1');
      m.addColorStop(1, '#5d6570');
      return m;
    };

    /** Schraubenfeder von y0 bis y1. */
    function drawSpring(cx: number, y0: number, y1: number, coils: number, R: number): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const lead = 6;
      const top = y0 + lead;
      const bot = y1 - lead;
      const per = 18;
      const total = coils * per;
      const pos = (i: number): [number, number, number] => {
        const ph = (i / per) * TAU;
        return [cx + R * Math.sin(ph), top + ((bot - top) * i) / total + R * 0.22 * Math.cos(ph), Math.cos(ph)];
      };
      const steel = dark ? '#c3cbd6' : '#8f99a6';
      const back = dark ? '#5b6573' : '#5e6874';
      g.save();
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.strokeStyle = steel;
      g.lineWidth = 2.2;
      g.beginPath();
      g.moveTo(cx, y0);
      g.lineTo(cx, top);
      g.moveTo(cx, bot);
      g.lineTo(cx, y1);
      g.stroke();
      for (const front of [false, true]) {
        g.strokeStyle = front ? steel : back;
        g.lineWidth = front ? 2.4 : 1.6;
        g.beginPath();
        let pen = false;
        for (let i = 0; i <= total; i++) {
          const [px, py, depth] = pos(i);
          if (depth >= 0 !== front) {
            pen = false;
            continue;
          }
          if (!pen) {
            const [qx, qy] = pos(Math.max(0, i - 1));
            g.moveTo(qx, qy);
            pen = true;
          }
          g.lineTo(px, py);
        }
        g.stroke();
      }
      g.strokeStyle = 'rgba(255,255,255,0.45)';
      g.lineWidth = 0.9;
      g.beginPath();
      for (let i = 0; i <= total; i++) {
        const [px, py, depth] = pos(i);
        if (depth > 0.55) g.lineTo(px - 0.6, py - 0.8);
        else g.moveTo(px - 0.6, py - 0.8);
      }
      g.stroke();
      g.restore();
    }

    /** Massestück aus Messing mit Haken; (x, y) = Mitte. */
    function drawMass(x: number, y: number, w: number, h: number, hook: number, label: string, highlight: number): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const top = y - h / 2;
      const img = ctx.images.get('mass');
      if (img) {
        // Foto: Körper (ohne Haken) füllt w × h, der Haken sitzt darüber
        const k = h / MASS_IMG.body;
        const iw = MASS_IMG.w * k;
        const ih = MASS_IMG.h * k;
        const imgTop = top - MASS_IMG.bodyTop * k;
        if (hook > MASS_IMG.bodyTop * k + 0.5) {
          g.strokeStyle = dark ? '#c3cbd6' : '#5d6570';
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(x, top - hook);
          g.lineTo(x, imgTop + 4 * k);
          g.stroke();
        }
        if (highlight > 0) {
          g.fillStyle = withAlpha(ctx.theme.series[0]!, 0.14 + 0.12 * highlight);
          g.beginPath();
          g.ellipse(x, y, w / 2 + 9 + 3 * highlight, h / 2 + 9 + 3 * highlight, 0, 0, TAU);
          g.fill();
        }
        g.save();
        g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(20,30,45,0.3)';
        g.shadowBlur = 8;
        g.shadowOffsetX = 2;
        g.shadowOffsetY = 3;
        g.drawImage(scaledSprite(img, iw, ih, surface.dpr), x - MASS_IMG.cx * k, imgTop, iw, ih);
        g.restore();
        g.font = `700 ${w > 30 ? 10 : 9}px ${ctx.theme.font}`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.lineWidth = 3;
        g.lineJoin = 'round';
        g.strokeStyle = 'rgba(255,238,190,0.9)';
        g.strokeText(label, x, y + h * 0.1);
        g.fillStyle = '#3d2a06';
        g.fillText(label, x, y + h * 0.1);
        return;
      }
      // Öse, in die die Feder eingehängt ist
      g.strokeStyle = dark ? '#c3cbd6' : '#5d6570';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x, top);
      g.lineTo(x, top - hook * 0.45);
      g.stroke();
      g.beginPath();
      g.ellipse(x, top - hook * 0.72, 2.6, hook * 0.3, 0, 0, TAU);
      g.stroke();
      if (highlight > 0) {
        g.fillStyle = withAlpha(ctx.theme.series[0]!, 0.14 + 0.12 * highlight);
        g.beginPath();
        g.ellipse(x, y, w / 2 + 9 + 3 * highlight, h / 2 + 9 + 3 * highlight, 0, 0, TAU);
        g.fill();
      }
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(20,30,45,0.3)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 3;
      const brass = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
      brass.addColorStop(0, '#8d6a24');
      brass.addColorStop(0.3, '#f0d27a');
      brass.addColorStop(0.55, '#d4ad4c');
      brass.addColorStop(1, '#7c5b1c');
      g.fillStyle = brass;
      roundRect(g, x - w / 2, top, w, h, 4);
      g.fill();
      g.restore();
      // Deckel- und Bodenkante
      const cap = Math.max(3, h * 0.16);
      g.fillStyle = 'rgba(255,255,255,0.28)';
      roundRect(g, x - w / 2 + 1.5, top + 1.5, w - 3, cap, 2);
      g.fill();
      g.fillStyle = 'rgba(0,0,0,0.16)';
      g.fillRect(x - w / 2 + 2, top + h - 3.5, w - 4, 2);
      text(g, label, x, y + cap * 0.35, { font: `700 ${w > 40 ? 10.5 : 9.5}px ${ctx.theme.font}`, color: '#3d2a06' });
    }

    function drawStand(rod: number, armY: number, armTo: number, tableY: number, side: 1 | -1): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const img = ctx.images.get('stand');
      const sc = small() ? 0.46 : 0.55;
      // Fuß etwas nach vorn auf die Tischplatte gesetzt (Perspektive), damit er weniger Höhe einnimmt
      if (img && drawLabStand(g, img, { rodX: rod, armY: armY - 4 * sc, armTo: armTo + side * 8, floorY: tableY + (small() ? 10 : 13), scale: sc, dpr: surface.dpr, dark })) return;
      // Fuß
      g.fillStyle = dark ? '#2b3340' : '#3c4552';
      roundRect(g, side === 1 ? rod - 14 : rod - 46, tableY - 7, 60, 8, 3);
      g.fill();
      // Stange
      g.fillStyle = metal(rod - 4, 8);
      g.fillRect(rod - 4, armY - 16, 8, tableY - 7 - (armY - 16));
      // Ausleger
      const arm = g.createLinearGradient(0, armY - 4, 0, armY + 4);
      arm.addColorStop(0, '#d5dae1');
      arm.addColorStop(1, '#5d6570');
      g.fillStyle = arm;
      const x0 = Math.min(rod, armTo);
      const x1 = Math.max(rod, armTo);
      g.fillRect(x0, armY - 4, x1 - x0 + (side === 1 ? 10 : -10) * 0 + 8, 7);
      g.fillStyle = dark ? '#6b7584' : '#4a5361';
      roundRect(g, rod - 9, armY - 9, 18, 18, 3);
      g.fill();
    }

    function drawRuler(g0: Geo): void {
      const g = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const rx = g0.rulerX;
      const half = g0.rulerW / 2;
      const top = g0.rulerTop;
      const bot = g0.rulerBot;
      // Halter vom Stativ zum Maßstab
      const A = g0.pend[0]!;
      const holder = g.createLinearGradient(0, top + 4, 0, top + 10);
      holder.addColorStop(0, '#d5dae1');
      holder.addColorStop(1, '#5d6570');
      g.fillStyle = holder;
      g.fillRect(A.rod, top + 4, rx - A.rod, 6);
      g.fillStyle = dark ? '#6b7584' : '#4a5361';
      roundRect(g, A.rod - 7, top, 14, 14, 3);
      g.fill();
      const wood = g.createLinearGradient(rx - half, 0, rx + half, 0);
      wood.addColorStop(0, dark ? '#d8c27f' : '#f8e7a8');
      wood.addColorStop(1, dark ? '#b9a25e' : '#e8cd7a');
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.2)';
      g.shadowBlur = 5;
      g.shadowOffsetX = 1;
      g.shadowOffsetY = 2;
      g.fillStyle = wood;
      roundRect(g, rx - half, top, g0.rulerW, bot - top, 3);
      g.fill();
      g.restore();
      const ink = '#3d2f0c';
      const pxPerCm = g0.k / 100;
      const multipleOf = (a: number, b: number) => Math.abs(a / b - Math.round(a / b)) < 1e-9;
      // Beschriftung alle 1, 2, 5, … cm (mindestens 17 px Abstand), feinere Striche als Teiler davon
      const labelEvery = [1, 2, 5, 10, 20, 50].find((q) => q * pxPerCm >= 17) ?? 50;
      const divisors = [0.5, 1, 2, 5, 10, 20, 50].filter((q) => q <= labelEvery && multipleOf(labelEvery, q));
      const minor = divisors.find((q) => q * pxPerCm >= 4) ?? labelEvery;
      const major = divisors.find((q) => q * pxPerCm >= 9 && multipleOf(q, minor) && q > minor) ?? labelEvery;
      const range = (g0.yEq - top - 6) / pxPerCm;
      g.strokeStyle = ink;
      g.lineWidth = 1;
      g.beginPath();
      for (let c = -Math.floor(range / minor) * minor; c <= range + 1e-9; c += minor) {
        const y = Math.round(g0.yEq - c * pxPerCm) + 0.5;
        const isMajor = multipleOf(c, major);
        g.moveTo(rx + half, y);
        g.lineTo(rx + half - (isMajor ? 8 : 4.5), y);
      }
      g.stroke();
      const fs = g0.small ? 9 : 10;
      for (let c = -Math.floor(range / labelEvery) * labelEvery; c <= range + 1e-9; c += labelEvery) {
        const y = g0.yEq - c * pxPerCm;
        if (y < top + 8 || y > bot - 6) continue;
        const label = c === 0 ? '0' : `${c > 0 ? '+' : '−'}${fmt.num(Math.abs(c), 1)}`;
        text(g, label, rx - 1, y, { font: `700 ${fs}px ${theme.font}`, color: ink, align: 'center' });
      }
      text(g, ctx.t('cm'), rx, top - 7, { font: `700 ${fs}px ${theme.font}`, color: theme.muted });
    }

    function drawScene(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const g0 = geo!;
      const sm = g0.small;
      const v = view();
      g.save();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      // Wand und Tisch
      const wall = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      wall.addColorStop(0, dark ? '#172131' : '#f1f4f8');
      wall.addColorStop(1, dark ? '#101824' : '#e1e7ee');
      g.fillStyle = wall;
      g.fillRect(r.x, r.y, r.w, r.h);
      const table = g.createLinearGradient(0, g0.tableY, 0, r.y + r.h);
      table.addColorStop(0, dark ? '#4a3a2b' : '#c49a6c');
      table.addColorStop(1, dark ? '#33281e' : '#9c7349');
      g.fillStyle = table;
      g.fillRect(r.x, g0.tableY, r.w, r.y + r.h - g0.tableY);
      g.fillStyle = 'rgba(255,255,255,0.22)';
      g.fillRect(r.x, g0.tableY, r.w, 1.5);

      // Stative
      for (const q of g0.pend) drawStand(q.rod, q.sup, q.x, g0.tableY, q.side);
      drawRuler(g0);

      // Ruhelage
      const restColor = withAlpha(theme.text, dark ? 0.45 : 0.4);
      g.strokeStyle = restColor;
      g.lineWidth = 1.2;
      g.setLineDash([5, 5]);
      g.beginPath();
      const restRight = p.cmp ? g0.pend[1]!.x + g0.pend[1]!.mw / 2 + 4 : p.phasor ? g0.cx + g0.R + 14 : g0.pend[0]!.x + g0.pend[0]!.mw / 2 + 24;
      g.moveTo(g0.rulerX + g0.rulerW / 2 + 2, g0.yEq);
      g.lineTo(restRight, g0.yEq);
      g.stroke();
      g.setLineDash([]);

      g0.pend.forEach((q, i) => drawSpringInfo(g0, q, i));
      // Zeigerdiagramm
      if (p.phasor) drawPhasor(g0, v);
      // Beschriftung der Ruhelage (im Zeigerkreis links unter der Linie)
      if (p.phasor) {
        const rs = sm ? 10.5 : 11.5;
        if (richWidth(ctx.t('rest'), rs, 600) < g0.R - 22) richText(ctx.t('rest'), g0.cx - g0.R + 5, g0.yEq + (sm ? 10 : 11), rs, theme.muted, 'left', true, 600);
        else richText(ctx.t('rest'), g0.cx - 16, g0.yEq + g0.R + (sm ? 12 : 14), rs, theme.muted, 'right', true, 600);
      }
      else richText(ctx.t('rest'), g0.pend[0]!.x + g0.pend[0]!.mw / 2 + g0.arrowsW + 10, g0.yEq - 9, sm ? 10.5 : 11.5, theme.muted, 'left', true, 600);

      // Pendel
      g0.pend.forEach((q, i) => {
        const s = i === 0 ? v.a : v.b;
        const yc = g0.yEq - s[0] * g0.k;
        const topMass = yc - q.mh / 2 - g0.hook;
        // Aufhängung am Ausleger
        g.fillStyle = dark ? '#8a94a3' : '#4a5361';
        roundRect(g, q.x - 4, q.sup - 1, 8, 5, 1.5);
        g.fill();
        drawSpring(q.x, q.sup, topMass, sm ? 12 : 14, sm ? 8 : 10);
        const hl = i === 0 && !ctx.locked ? (drag?.kind === 'mass' ? 1 : hoverKind === 'mass' ? 0.6 : 0.25) : 0;
        drawMass(q.x, yc, q.mw, q.mh, g0.hook, `${fmt.num(q.m * 1000, 0)} g`, hl);
        // Zeiger am Maßstab (nur Pendel A)
        if (i === 0) {
          g.strokeStyle = withAlpha(yColor(), 0.9);
          g.lineWidth = 1.6;
          g.beginPath();
          g.moveTo(q.x - q.mw / 2 - 2, yc);
          g.lineTo(g0.rulerX + g0.rulerW / 2 + 2, yc);
          g.stroke();
          g.fillStyle = yColor();
          g.beginPath();
          g.moveTo(g0.rulerX + g0.rulerW / 2, yc);
          g.lineTo(g0.rulerX + g0.rulerW / 2 + 7, yc - 4);
          g.lineTo(g0.rulerX + g0.rulerW / 2 + 7, yc + 4);
          g.closePath();
          g.fill();
        }
        drawVectors(q, s, yc);
      });

      // Anzeigen oben
      const size = sm ? 11 : 12;
      const w1 = pill(r.x + 8, r.y + 8, `t = ${fmt.fixed(v.t, 2)} s`, scrub !== null ? aColor() : theme.text, 'left', size);
      let right = r.x + r.w - 8;
      if (p.per) {
        const label = p.cmp ? tr('TAB', { a: fmt.fixed(period(p.m, p.D), 2), b: fmt.fixed(period(mB(), DB()), 2) }) : tr('T', { T: fmt.fixed(period(p.m, p.D), 2) });
        right -= pill(right, r.y + 8, label, theme.text, 'right', size) + 6;
      }
      if (watch.state !== 'idle') drawWatchPill(r, r.x + 8 + w1 + 6, right, size);
      if (scrub !== null && !sm) text(g, ctx.t('scrubHint'), r.x + r.w / 2, r.y + r.h - 8, { font: `600 10.5px ${theme.font}`, color: 'rgba(255,255,255,0.85)' });
      g.restore();
    }

    /** Beschriftung neben der Feder: Name, Federhärte und Maßlinien für L₀ und s₀ (Ruhelage). */
    function drawSpringInfo(g0: Geo, q: Pend, i: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const sm = g0.small;
      const side = q.side;
      const x = Math.round(q.x + side * (sm ? 15 : 20)) + 0.5;
      const yA = q.sup;
      const yB = q.sup + L0 * g0.k;
      const yC = g0.yEq - q.mh / 2 - g0.hook;
      const align: CanvasTextAlign = side === 1 ? 'left' : 'right';
      const lx = x + side * 6;
      const fs = sm ? 10.5 : 11.5;
      const s0c = theme.series[2]!;
      const s0Text = `s_[0] = ${n(q.s0 * 100, 1)} cm`;
      // höchste Lage der Oberkante des Körpers: darüber ist Platz für die Beschriftung von s₀
      const highest = yC - ampM() * g0.k - (vecMode() === 'off' ? 6 : 14);
      const roomy = highest > yA + (sm ? 40 : 46);
      const head = `${p.cmp ? `${ctx.t(i === 0 ? 'pendA' : 'pendB')}: ` : ''}D = ${n(q.D, 0)} N/m`;
      const hw = richText(head, lx, yA + (sm ? 11 : 13), sm ? 11 : 12, theme.text, align);
      if (!roomy) richText(s0Text, lx + side * (hw + 8), yA + (sm ? 11 : 13), fs, s0c, align, true, 700);
      const tick = (y: number, color: string) => {
        g.strokeStyle = color;
        g.lineWidth = 1.3;
        g.beginPath();
        g.moveTo(x - 4, y);
        g.lineTo(x + 4, y);
        g.stroke();
      };
      const top = yA + (sm ? 22 : 26);
      if (yB - top > 10) {
        g.strokeStyle = withAlpha(theme.text, 0.4);
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(x, top);
        g.lineTo(x, yB);
        g.stroke();
        const s0Label = Math.min((yB + yC) / 2, highest);
        if (roomy && yB - top > 26 && s0Label - (top + yB) / 2 > 18) richText(sm ? 'L_[0]' : `L_[0] = ${n(L0 * 100, 0)} cm`, lx, (top + yB) / 2, fs, theme.muted, align, true, 650);
      }
      tick(yB, withAlpha(theme.text, 0.5));
      g.strokeStyle = s0c;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x, yB);
      g.lineTo(x, yC);
      g.stroke();
      tick(yC, s0c);
      // Beschriftung oberhalb der höchsten Lage des Körpers, damit er sie nicht verdeckt
      if (roomy) richText(s0Text, lx, Math.min((yB + yC) / 2, highest), fs, s0c, align, true, 700);
    }

    function drawWatchPill(r: Rect, left: number, right: number, size: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const run = watch.state === 'run';
      const color = run ? theme.series[2]! : theme.text;
      const timeStr = `${fmt.fixed(watch.t, 2)} s`;
      const countStr = tr('periods', { n: String(watch.n) });
      g.font = `700 ${size}px ${theme.font}`;
      const icon = size + 6;
      const w = icon + 8 + g.measureText(timeStr).width + 10 + g.measureText(countStr).width + 16;
      const h = size + 11;
      let x0 = Math.min(right - w, Math.max(left, (r.x + r.w) / 2 - w / 2));
      let y0 = r.y + 8;
      if (x0 < left) {
        x0 = r.x + 8;
        y0 = r.y + 8 + h + 6;
      }
      const k = pop.running ? 1 + 0.08 * Math.sin(Math.PI * pop.t) : 1;
      g.save();
      g.translate(x0 + w / 2, y0 + h / 2);
      g.scale(k, k);
      g.translate(-(x0 + w / 2), -(y0 + h / 2));
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1;
      g.fillStyle = theme.dark ? 'rgba(16,22,31,0.92)' : 'rgba(255,255,255,0.96)';
      roundRect(g, x0, y0, w, h, h / 2);
      g.fill();
      g.restore();
      g.strokeStyle = withAlpha(run ? theme.series[2]! : theme.muted, 0.7);
      g.lineWidth = run ? 1.6 : 1;
      roundRect(g, x0 + 0.5, y0 + 0.5, w - 1, h - 1, h / 2);
      g.stroke();
      // Stoppuhr-Symbol
      const ix = x0 + 8 + icon / 2;
      const iy = y0 + h / 2 + 1;
      const ir = icon / 2 - 2;
      g.strokeStyle = color;
      g.lineWidth = 1.6;
      g.beginPath();
      g.arc(ix, iy, ir, 0, TAU);
      g.stroke();
      g.beginPath();
      g.moveTo(ix, iy - ir - 1);
      g.lineTo(ix, iy - ir - 3.5);
      g.moveTo(ix - 2.5, iy - ir - 3.5);
      g.lineTo(ix + 2.5, iy - ir - 3.5);
      g.stroke();
      const ang = (watch.t % 1) * TAU - Math.PI / 2;
      g.beginPath();
      g.moveTo(ix, iy);
      g.lineTo(ix + Math.cos(ang) * (ir - 1.5), iy + Math.sin(ang) * (ir - 1.5));
      g.stroke();
      let tx = x0 + 8 + icon + 8;
      text(g, timeStr, tx, y0 + h / 2 + 0.5, { font: `700 ${size}px ${theme.font}`, color, align: 'left' });
      tx += g.measureText(timeStr).width + 10;
      text(g, countStr, tx, y0 + h / 2 + 0.5, { font: `700 ${size}px ${theme.font}`, color: theme.muted, align: 'left' });
      g.restore();
    }

    function drawPhasor(g0: Geo, v: { a: State; b: State }): void {
      const g = surface.g;
      const theme = ctx.theme;
      const sm = g0.small;
      const cx = g0.cx;
      const cy = g0.yEq;
      const R = g0.R;
      // Bezugskreis
      g.fillStyle = withAlpha(yColor(), theme.dark ? 0.07 : 0.05);
      g.beginPath();
      g.arc(cx, cy, R, 0, TAU);
      g.fill();
      g.strokeStyle = withAlpha(theme.text, 0.35);
      g.lineWidth = 1.3;
      g.setLineDash([4, 4]);
      g.stroke();
      g.setLineDash([]);
      // senkrechte Achse (y)
      g.strokeStyle = withAlpha(theme.text, 0.25);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(cx, cy - R - 8);
      g.lineTo(cx, cy + R + 8);
      g.stroke();
      // Drehsinn
      const ra = R + (sm ? 7 : 9);
      g.strokeStyle = theme.muted;
      g.lineWidth = 1.4;
      g.beginPath();
      g.arc(cx, cy, ra, -Math.PI * 0.42, -Math.PI * 0.18);
      g.stroke();
      const ea = -Math.PI * 0.42;
      const ex = cx + ra * Math.cos(ea);
      const ey = cy + ra * Math.sin(ea);
      g.fillStyle = theme.muted;
      g.beginPath();
      g.moveTo(ex - 1, ey - 1);
      g.lineTo(ex + 6, ey - 3.5);
      g.lineTo(ex + 3.5, ey + 4.5);
      g.closePath();
      g.fill();
      text(g, 'ω', cx + (ra + 9) * Math.cos(-Math.PI * 0.3), cy + (ra + 9) * Math.sin(-Math.PI * 0.3), { font: `italic 600 ${sm ? 12 : 13}px ${theme.mathFont}`, color: theme.muted });
      // Startmarke der Stoppuhr
      if (watch.state !== 'idle') {
        const a0 = watch.ph0;
        g.strokeStyle = theme.series[2]!;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(cx + (R - 6) * Math.cos(a0), cy - (R - 6) * Math.sin(a0));
        g.lineTo(cx + (R + 6) * Math.cos(a0), cy - (R + 6) * Math.sin(a0));
        g.stroke();
      }
      const list: [State, number, number, boolean][] = [[v.a, p.m, p.D, false]];
      if (p.cmp) list.push([v.b, mB(), DB(), true]);
      // B zuerst, A darüber
      for (const [s, m, D, isB] of [...list].reverse()) {
        const ph = phasor(s, m, D, p.damp);
        const len = ph.amp * g0.k;
        const tx = cx + len * Math.cos(ph.phase);
        const ty = cy - len * Math.sin(ph.phase);
        const target = isB ? g0.pend[1]! : g0.pend[0]!;
        // Projektion zum Körper
        g.strokeStyle = withAlpha(yColor(), 0.7);
        g.lineWidth = 1.3;
        g.setLineDash([3, 4]);
        g.beginPath();
        g.moveTo(tx, ty);
        g.lineTo(target.x + (isB ? -1 : 1) * (target.mw / 2 + 2), ty);
        g.stroke();
        g.setLineDash([]);
        // Elongation als senkrechte Komponente
        g.strokeStyle = withAlpha(yColor(), isB ? 0.45 : 0.75);
        g.lineWidth = isB ? 3 : 4;
        g.lineCap = 'butt';
        g.beginPath();
        g.moveTo(tx, cy);
        g.lineTo(tx, ty);
        g.stroke();
        g.lineCap = 'round';
        // Winkel φ (nur A)
        if (!isB && len > 30) {
          let a = ph.phase % TAU;
          if (a < 0) a += TAU;
          const rr = Math.min(sm ? 14 : 18, len * 0.45);
          g.fillStyle = withAlpha(aColor(), 0.16);
          g.strokeStyle = aColor();
          g.lineWidth = 1.5;
          g.beginPath();
          g.moveTo(cx, cy);
          g.arc(cx, cy, rr, 0, -a, true);
          g.closePath();
          g.fill();
          g.beginPath();
          g.arc(cx, cy, rr, 0, -a, true);
          g.stroke();
          const mid = a / 2;
          const lr = rr + (sm ? 8 : 10);
          text(g, 'φ', cx + lr * Math.cos(mid), cy - lr * Math.sin(mid), { font: `italic 700 ${sm ? 12 : 14}px ${theme.mathFont}`, color: aColor() });
        }
        // Zeiger
        if (isB) {
          g.save();
          g.setLineDash([5, 4]);
          g.strokeStyle = yColor();
          g.lineWidth = 2.2;
          g.beginPath();
          g.moveTo(cx, cy);
          g.lineTo(tx, ty);
          g.stroke();
          g.restore();
          g.fillStyle = yColor();
          g.beginPath();
          g.arc(tx, ty, 3.2, 0, TAU);
          g.fill();
          richText(ctx.t('pendB'), tx + (tx >= cx ? 8 : -8), ty + (ty <= cy ? -8 : 8), sm ? 11 : 12, yColor(), tx >= cx ? 'left' : 'right');
        } else {
          arrowPx(cx, cy, tx, ty, yColor(), sm ? 2.6 : 3, sm ? 9 : 11);
          if (!ctx.locked) {
            const hl = drag?.kind === 'phasor' ? 1 : hoverKind === 'phasor' ? 0.6 : 0.25;
            g.fillStyle = withAlpha(yColor(), 0.15 + 0.15 * hl);
            g.beginPath();
            g.arc(tx, ty, 10 + 3 * hl, 0, TAU);
            g.fill();
          }
        }
      }
      // Mittelpunkt
      g.fillStyle = theme.text;
      g.beginPath();
      g.arc(cx, cy, 2.6, 0, TAU);
      g.fill();
    }

    function drawVectors(q: Pend, s: State, yc: number): void {
      const mode = vecMode();
      if (mode === 'off') return;
      const g0 = geo!;
      const sm = g0.small;
      const theme = ctx.theme;
      const x0 = q.x + q.side * (q.mw / 2 + (sm ? 9 : 11));
      const dx = q.side * (sm ? 14 : 17);
      const lab = sm ? 11 : 12;
      const labelAt = (x: number, y: number, str: string, color: string, below: boolean) => richText(str, x, y + (below ? 9 : -9), lab, color, 'center');
      if (mode === 'va') {
        const w = omega0(q.m, q.D);
        const vMax = ampM() * w;
        const aMax = ampM() * w * w;
        const Lmax = sm ? 30 : 40;
        const vv = s[1];
        const aa = acceleration(s, q.m, q.D, p.damp);
        const lv = (vv / vMax) * Lmax;
        const la = (aa / aMax) * Lmax;
        vArrow(x0, yc, yc - lv, vColor(), sm ? 2.6 : 3);
        vArrow(x0 + dx, yc, yc - la, aColor(), sm ? 2.6 : 3);
        if (Math.abs(lv) > 8) text(surface.g, 'v', x0, yc - lv - Math.sign(lv) * 9, { font: `italic 700 ${lab + 1}px ${theme.font}`, color: vColor() });
        if (Math.abs(la) > 8) text(surface.g, 'a', x0 + dx, yc - la - Math.sign(la) * 9, { font: `italic 700 ${lab + 1}px ${theme.font}`, color: aColor() });
        return;
      }
      // Kräfte: Federkraft und Gewichtskraft (beide an der Oberkante angesetzt, damit die Gewichtskraft
      // auch im unteren Umkehrpunkt über dem Tisch endet) und resultierende Kraft im Schwerpunkt
      const f = forces(s[0], q.m, q.D);
      const weight = q.m * 9.81;
      const topY = yc - q.mh / 2;
      const room = g0.tableY - 8 - (g0.yEq + ampM() * g0.k - q.mh / 2);
      const k = Math.min((sm ? 46 : 60) / (weight + q.D * ampM()), Math.max(20, room) / weight);
      const red = theme.series[1]!;
      const blue = theme.series[0]!;
      vArrow(x0, topY, topY - f.spring * k, blue, sm ? 2.6 : 3);
      vArrow(x0 + dx, topY, topY - f.weight * k, red, sm ? 2.6 : 3);
      vArrow(x0 + 2 * dx, yc, yc - f.net * k, aColor(), sm ? 2.6 : 3);
      labelAt(x0, topY - f.spring * k, ctx.t('FF'), blue, false);
      labelAt(x0 + dx, topY - f.weight * k, ctx.t('FG'), red, true);
      if (Math.abs(f.net * k) > 6) labelAt(x0 + 2 * dx, yc - f.net * k, ctx.t('FR'), aColor(), f.net < 0);
    }

    /* ---------- Diagramme ---------- */
    function valueOf(key: GraphKey, y: number, v: number, m: number, D: number): number {
      if (key === 'y') return y * 100;
      if (key === 'v') return v;
      return acceleration([y, v], m, D, p.damp);
    }

    function drawChart(key: GraphKey, R0: Rect): void {
      const plot = plots[key];
      const theme = ctx.theme;
      const sm = small();
      const color = COLOR[key]();
      const { W, t0 } = window0();
      const wA = omega0(p.m, p.D);
      const wB = p.cmp ? omega0(mB(), DB()) : wA;
      const w = Math.max(wA, wB);
      const ymax = key === 'y' ? p.amp : key === 'v' ? ampM() * w : ampM() * w * w;
      const range = ymax * 1.22;
      plot.setRangePadded([t0, t0 + W], [-range, range], { left: sm ? 40 : 46, right: 10, top: 8, bottom: 6 });
      const g = plot.begin();
      plot.grid({ minor: false });
      // eigene Teilung der Hochachse: ±Schritt (und ±2·Schritt), Schritt ≤ Höchstwert
      const p10 = 10 ** Math.floor(Math.log10(ymax));
      const stepY = ([5, 2, 1].map((f) => f * p10).find((s) => s <= ymax * (1 + 1e-9)) ?? p10);
      const ticks = [-2, -1, 1, 2].map((k) => k * stepY).filter((yy) => Math.abs(yy) < range * 0.97);
      for (const yy of ticks) plot.hline(yy, { color: theme.grid, width: 1 });
      plot.axes();
      if (t0 > 0) plot.vline(t0, { color: theme.axis, width: 1.5 });
      const gutter = plot.px(t0);
      const dec = Math.max(0, -Math.floor(Math.log10(stepY) + 1e-9));
      // eng beieinander: nur den positiven Wert beschriften (die Null steht am Ursprung)
      const tight = Math.abs(plot.py(stepY) - plot.py(0)) < 32;
      const labelled = ticks.filter((yy) => !tight || yy > 0);
      for (const yy of t0 > 0 ? [...labelled, 0] : labelled) plot.textPx(gutter - 6, plot.py(yy), fmt.num(yy, dec), { color: theme.muted, size: 12, align: 'right', baseline: 'middle' });
      // Kurven (B gestrichelt, A durchgezogen)
      const r = plot.rect;
      const i0 = hist.indexAt(t0 - 0.05);
      const count = hist.t.length - i0;
      const stride = Math.max(1, Math.floor(count / (r.w * 1.5)));
      const curve = (isB: boolean): [number, number][] => {
        const pts: [number, number][] = [];
        const m = isB ? mB() : p.m;
        const D = isB ? DB() : p.D;
        const ys = isB ? hist.yb : hist.ya;
        const vs = isB ? hist.vb : hist.va;
        for (let i = i0; i < hist.t.length; i += stride) pts.push([hist.t[i]!, valueOf(key, ys[i]!, vs[i]!, m, D)]);
        const last = hist.t.length - 1;
        if (last >= i0 && (last - i0) % stride !== 0) pts.push([hist.t[last]!, valueOf(key, ys[last]!, vs[last]!, m, D)]);
        return pts;
      };
      if (p.cmp) plot.polyline(curve(true), { color, width: 2, dash: [6, 4], alpha: 0.75 });
      plot.polyline(curve(false), { color, width: 2.6 });
      // Periodendauer markieren (nur y, Pendel A)
      // Zeitmarke
      const v = view();
      const tm = v.t;
      // Etikett der Achse (Lage wird für Ausweichregeln gebraucht)
      const fsz = sm ? 11 : 12;
      const chipH = sm ? 18 : 20;
      const name = ctx.t(key === 'y' ? 'axisY' : key === 'v' ? 'axisV' : 'axisA');
      g.font = `700 ${fsz}px ${theme.font}`;
      const nameW = g.measureText(name).width + 12;
      const legend = p.cmp && key === graphs()[0];
      const legW = legend ? 86 : 0;
      const chip: Rect = { x: gutter + 6, y: r.y + 5, w: nameW + legW, h: chipH };
      if (key === 'y' && p.per && !p.cmp && scrub === null) drawPeriodMark(plot, range, chip.x + chip.w + 6, plot.px(tm) - 64);
      plot.segment([tm, -range * 2], [tm, range * 2], { color: scrub !== null ? aColor() : theme.muted, width: scrub !== null ? 2 : 1.2, dash: scrub !== null ? [] : [4, 4], alpha: 0.9 });
      const valA = valueOf(key, v.a[0], v.a[1], p.m, p.D);
      if (p.cmp) plot.point(tm, valueOf(key, v.b[0], v.b[1], mB(), DB()), { color, radius: 4, hollow: true });
      plot.point(tm, valA, { color, radius: 5 });
      // Achsenbeschriftung (und Legende A/B) als Etikett
      g.fillStyle = theme.dark ? 'rgba(16,22,31,0.88)' : 'rgba(255,255,255,0.92)';
      roundRect(g, chip.x, chip.y, chip.w, chip.h, 6);
      g.fill();
      const cyc = chip.y + chipH / 2 + 0.5;
      text(g, name, chip.x + 6, cyc, { font: `700 ${fsz}px ${theme.font}`, color, align: 'left' });
      if (legend) {
        const lx = chip.x + nameW + 4;
        g.strokeStyle = theme.text;
        g.lineWidth = 2.4;
        g.beginPath();
        g.moveTo(lx, cyc);
        g.lineTo(lx + 16, cyc);
        g.stroke();
        text(g, ctx.t('pendA'), lx + 20, cyc, { font: `700 ${fsz}px ${theme.font}`, color: theme.text, align: 'left' });
        g.setLineDash([5, 3]);
        g.beginPath();
        g.moveTo(lx + 38, cyc);
        g.lineTo(lx + 54, cyc);
        g.stroke();
        g.setLineDash([]);
        text(g, ctx.t('pendB'), lx + 58, cyc, { font: `700 ${fsz}px ${theme.font}`, color: theme.text, align: 'left' });
      }
      // Wert an der Zeitmarke (weicht dem Etikett aus)
      const unit = key === 'y' ? 'cm' : key === 'v' ? 'm/s' : 'm/s²';
      const label = `${n(valA, key === 'y' ? 1 : 2)} ${unit}`.replace(/^-/, '−');
      g.font = `bold ${fsz}px ${theme.font}`;
      const labW = g.measureText(label).width;
      const pxm = plot.px(tm);
      const pyv = plot.py(valA);
      const rightSide = pxm < r.x + r.w - labW - 16;
      const lx0 = rightSide ? pxm + 8 : pxm - 8 - labW;
      // Platz der Achsenbeschriftung „t in s“ (rechts über der Zeitachse)
      g.font = `600 13px ${theme.font}`;
      const tW = g.measureText(ctx.t('axisT')).width;
      const axisPy = plot.py(0);
      const tBox: Rect = { x: r.x + r.w - 8 - tW, y: axisPy - 22, w: tW + 4, h: 18 };
      const hits = (box: Rect, o: Rect) => box.x < o.x + o.w && o.x < box.x + box.w && box.y < o.y + o.h && o.y < box.y + box.h;
      const fits = (base: number) => {
        const box = { x: lx0 - 2, y: base - fsz, w: labW + 4, h: fsz + 3 };
        return !hits(box, chip) && !hits(box, tBox);
      };
      let base = valA >= 0 ? pyv - 8 : pyv + fsz + 6;
      if (!fits(base)) base = valA >= 0 ? pyv + fsz + 6 : pyv - 8;
      base = clamp(base, r.y + fsz + 2, r.y + r.h - 4);
      plot.textPx(lx0, base, label, { color, size: fsz, weight: 'bold', align: 'left' });
      plot.end();
      g.save();
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      roundRect(g, R0.x + 0.5, R0.y + 0.5, R0.w - 1, R0.h - 1, 10);
      g.stroke();
      g.restore();
    }

    /** Klammer „T“ zwischen den beiden letzten Hochpunkten von y(t). */
    function drawPeriodMark(plot: Plot, range: number, pxMin: number, pxMax: number): void {
      const theme = ctx.theme;
      const { t0 } = window0();
      const peaks: number[] = [];
      const i0 = Math.max(hist.head + 1, hist.indexAt(t0));
      const minHeight = ampM() * 0.06;
      for (let i = hist.t.length - 2; i >= i0 && peaks.length < 2; i--) {
        const a = hist.ya[i - 1]!;
        const b = hist.ya[i]!;
        const c = hist.ya[i + 1]!;
        if (b > a && b >= c && b > minHeight) {
          // Scheitel einer Parabel durch drei Punkte
          const den = a - 2 * b + c;
          const off = den !== 0 ? (0.5 * (a - c)) / den : 0;
          const tp = hist.t[i]! + off * SAMPLE;
          const px = plot.px(tp);
          if (px > pxMax) continue;
          if (px < pxMin) break;
          peaks.push(tp);
        }
      }
      if (peaks.length < 2) return;
      const [t2, t1] = peaks as [number, number];
      const y = range * 0.93;
      const color = theme.text;
      plot.segment([t1, y], [t2, y], { color, width: 1.4 });
      for (const tt of [t1, t2]) plot.segment([tt, y - range * 0.07], [tt, y + range * 0.05], { color, width: 1.4 });
      const px1 = plot.px(t1);
      const px2 = plot.px(t2);
      const py = plot.py(y);
      const g = surface.g;
      g.fillStyle = color;
      for (const [x, dir] of [
        [px1, 1],
        [px2, -1],
      ] as const) {
        g.beginPath();
        g.moveTo(x, py);
        g.lineTo(x + dir * 7, py - 3.5);
        g.lineTo(x + dir * 7, py + 3.5);
        g.closePath();
        g.fill();
      }
      const label = px2 - px1 > 70 ? tr('Tshort', { T: fmt.fixed(t2 - t1, 2) }) : ctx.t('Tlabel');
      plot.textPx((px1 + px2) / 2, py + 4, label, { color, size: small() ? 11 : 12, weight: 'bold', align: 'center', baseline: 'top' });
    }

    /* ---------- Energie ---------- */
    function drawEnergy(R0: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const sm = small();
      card(R0);
      const pad = sm ? 10 : 14;
      const v = view();
      const e = energies(v.a, p.m, p.D, yRef);
      const full = energyMode() === 'full';
      richText(ctx.t(p.cmp ? 'energyA' : 'energy'), R0.x + pad, R0.y + (sm ? 14 : 16), sm ? 11.5 : 12.5, theme.text, 'left', false);
      const blue = theme.series[0]!;
      const green = theme.series[2]!;
      const orange = vColor();
      const red = theme.series[1]!;
      const rows: [string, number, string][] = full
        ? [
            [ctx.t(sm ? 'eSpringS' : 'eSpring'), e.spring, blue],
            [ctx.t(sm ? 'eGravS' : 'eGrav'), e.grav, green],
            [ctx.t(sm ? 'eKinS' : 'eKinL'), e.kin, orange],
          ]
        : [
            [ctx.t(sm ? 'ePotS' : 'ePot'), e.osc, blue],
            [ctx.t(sm ? 'eKinS' : 'eKin'), e.kin, orange],
          ];
      const sum = rows.reduce((s, q) => s + q[1], 0);
      const loss = Math.max(0, e0 - sum);
      const rowH = sm ? 19 : 21;
      const y0 = R0.y + (sm ? 28 : 32);
      const labelW = Math.min(sm ? 74 : 150, R0.w * 0.36);
      const valW = sm ? 58 : 66;
      const bx = R0.x + pad + labelW;
      const bw = R0.w - pad * 2 - labelW - valW;
      const scale = bw / Math.max(e0, 1e-9);
      const fs = sm ? 11 : 12;
      const digits = e0 < 0.1 ? 4 : 3;
      rows.forEach(([label, value, color], i) => {
        const y = y0 + i * rowH;
        richText(label, bx - 8, y + rowH / 2, fs, theme.muted, 'right', false, 650);
        g.fillStyle = withAlpha(theme.muted, 0.13);
        roundRect(g, bx, y + 4, bw, rowH - 8, 4);
        g.fill();
        g.fillStyle = color;
        roundRect(g, bx, y + 4, Math.max(0, Math.min(bw, value * scale)), rowH - 8, 4);
        g.fill();
        text(g, `${fmt.num(value, digits)} J`, bx + bw + 6, y + rowH / 2, { font: `600 ${fs}px ${theme.font}`, color: theme.text, align: 'left' });
      });
      // Summe als gestapelter Balken
      const y = y0 + rows.length * rowH;
      richText(ctx.t('eSum'), bx - 8, y + rowH / 2, fs, theme.text, 'right', false, 700);
      g.save();
      roundRect(g, bx, y + 3, bw, rowH - 6, 4);
      g.clip();
      g.fillStyle = withAlpha(theme.muted, 0.13);
      g.fillRect(bx, y + 3, bw, rowH - 6);
      let x = bx;
      for (const [, value, color] of rows) {
        const w = value * scale;
        g.fillStyle = color;
        g.fillRect(x, y + 3, w, rowH - 6);
        x += w;
      }
      if (loss > e0 * 1e-4) {
        g.fillStyle = withAlpha(red, 0.75);
        g.fillRect(x, y + 3, loss * scale, rowH - 6);
      }
      g.restore();
      g.strokeStyle = withAlpha(theme.text, 0.5);
      g.lineWidth = 1;
      roundRect(g, bx + 0.5, y + 3.5, bw - 1, rowH - 7, 4);
      g.stroke();
      text(g, `${fmt.num(sum, digits)} J`, bx + bw + 6, y + rowH / 2, { font: `700 ${fs}px ${theme.font}`, color: theme.text, align: 'left' });
      if (p.damp > 0) {
        // Legende: innere Energie (durch Reibung umgewandelt)
        const lbl = `${ctx.t('eLoss')}: ${fmt.num(loss, digits)} J`;
        g.font = `600 ${fs - 1}px ${theme.font}`;
        const lw2 = g.measureText(lbl).width;
        const lx = R0.x + R0.w - pad - lw2;
        const ly = R0.y + (sm ? 14 : 16);
        g.fillStyle = withAlpha(red, 0.75);
        roundRect(g, lx - 15, ly - 4, 10, 8, 2);
        g.fill();
        text(g, lbl, lx, ly, { font: `600 ${fs - 1}px ${theme.font}`, color: theme.muted, align: 'left' });
      }
    }

    /* ---------- Ablauf ---------- */
    /** Phasenwinkel (aufsummiert) beim Start der Stoppuhr. */
    let ph0Acc = 0;
    function startStopWatch(): void {
      if (watch.state === 'run') {
        const turns = (phaseAcc - ph0Acc) / TAU;
        const nn = Math.floor(turns + 1e-9);
        const frac = turns - nn;
        watch = { ...watch, state: 'done', t: t - watch.t0, n: nn, exact: frac < 0.06 || frac > 0.94 };
        if (frac > 0.94) watch.n = nn + 1;
      } else {
        scrub = null;
        ph0Acc = phaseAcc;
        let a = phaseAcc % TAU;
        if (a < 0) a += TAU;
        watch = { state: 'run', t0: t, ph0: a, t: 0, n: 0, exact: true };
        if (!ctx.clock.playing) ctx.clock.play();
      }
      pop.play();
      updateWatch();
      ctx.requestRender();
    }

    restart();

    return {
      update(changed, source) {
        const restartKeys = ['m', 'D', 'amp', 'phi', 'cmp', 'm2', 'D2'];
        // Dämpfung vor dem Start: Anfangszustand neu berechnen (sonst läuft die Bewegung einfach weiter)
        const dampAtStart = changed.has('damp') && t === 0;
        if (source === 'init' || source === 'replace' || dampAtStart || restartKeys.some((key) => changed.has(key))) {
          restart();
          if (source === 'init' || source === 'replace') {
            ctx.clock.pause();
            kView = 0;
          }
        }
        if (changed.has('energy')) {
          const e = energies(initialState(ampM(), p.phi * DEG, p.m, p.D, p.damp), p.m, p.D, yRef);
          e0 = energyMode() === 'full' ? e.spring + e.grav + e.kin : e.osc + e.kin;
        }
        lay = computeLayout();
        for (const key of ['y', 'v', 'a'] as const) plots[key].resize();
        updateReadouts();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'go') {
          restart();
          updateReadouts();
          ctx.clock.play();
        } else if (id === 'watch') startStopWatch();
      },

      tick(dt) {
        if (drag) return;
        const h = dt * (p.slow ? 0.25 : 1);
        const mb = mB();
        const Db = DB();
        stepper.run(h, (hh) => {
          sA = step(sA, p.m, p.D, p.damp, hh);
          sB = step(sB, mb, Db, p.damp, hh);
          t += hh;
          const ph = phasor(sA, p.m, p.D, p.damp).phase;
          let d = ph - lastPhase;
          if (d > Math.PI) d -= TAU;
          if (d < -Math.PI) d += TAU;
          phaseAcc += d;
          lastPhase = ph;
          if (t >= nextSample - 1e-9) {
            hist.push(t, sA, sB);
            nextSample += SAMPLE;
          }
        });
        hist.trim(t - niceWindow(maxT()) - 0.5);
        if (watch.state === 'run') {
          watch.t = t - watch.t0;
          const nn = Math.floor((phaseAcc - ph0Acc) / TAU + 1e-9);
          if (nn !== watch.n) {
            watch.n = nn;
            pop.play();
          }
          updateWatch();
        }
        updateNow();
      },

      resetTime() {
        restart();
        updateReadouts();
      },

      render() {
        const now = performance.now();
        const dt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        lay = computeLayout();
        const target = kTarget(lay.scene);
        if (kView <= 0 || prefersReducedMotion()) kView = target;
        else if (!drag) {
          kView += (target - kView) * Math.min(1, dt * 7);
          if (Math.abs(kView - target) < 0.5) kView = target;
        }
        geo = buildGeo(lay.scene, kView);
        for (const key of ['y', 'v', 'a'] as const) plots[key].resize();
        surface.begin();
        drawScene(lay.scene);
        for (const key of graphs()) drawChart(key, lay.charts[key]!);
        if (lay.energy) drawEnergy(lay.energy);
        if (kView !== target || pop.running) ctx.requestRender();
      },

      destroy: () => {
        offClock();
        surface.destroy();
      },
    };
  },
});
