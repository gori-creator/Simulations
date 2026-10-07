import { defineSimulation, ease, Plot, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  acceleratedMotion,
  brakingInfo,
  buildPhases,
  displacement,
  extent,
  pathLength,
  phaseIndexAt,
  scheduleMotion,
  stateAt,
  toKmh,
  totalTime,
  uniformMotion,
  type Motion,
  type Phase,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'uni' | 'acc' | 'plan';
type Range = [number, number];
type Pt = [number, number];

/** Sichtbare Bereiche der Diagramme und der Straße (werden beim Umschalten weich überblendet). */
interface View {
  T: number;
  s: Range;
  v: Range;
  a: Range;
  road: Range;
}

/** Abgetastete Graphen für die Überblendung. */
interface Curves {
  T: number;
  s: number[];
  v: number[];
  a: number[];
}

const SAMPLES = 160;
const CAR_LENGTH = 4.5;

/** „Schöne“ Schrittweite (1, 2, 2,5, 5 · 10^k) von mindestens x. */
function niceStep(x: number): number {
  if (!(x > 0)) return 1;
  const p = 10 ** Math.floor(Math.log10(x));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= x - 1e-12) return m * p;
  return 10 * p;
}

/** Wertebereich eines Diagramms: enthält 0, etwas Luft und endet auf runden Werten. */
function niceRange([lo0, hi0]: Range): Range {
  let lo = Math.min(0, lo0);
  let hi = Math.max(0, hi0);
  if (hi - lo < 1e-9) return [-1, 1];
  const step = niceStep((hi - lo) / 6);
  if (hi > 0) hi = Math.ceil((hi + (hi - lo) * 0.06) / step - 1e-9) * step;
  if (lo < 0) lo = -Math.ceil((-lo + (hi - lo) * 0.06) / step - 1e-9) * step;
  return [lo, hi];
}

function lerp(a: number, b: number, u: number): number {
  return a + (b - a) * u;
}

function lerpRange(a: Range, b: Range, u: number): Range {
  return [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
}

/**
 * Bewegungsdiagramme: Ein Auto fährt gleichförmig, gleichmäßig beschleunigt
 * oder nach einem Fahrplan aus drei Abschnitten. Gleichzeitig entstehen das
 * t-s-, das t-v- und das t-a-Diagramm. Steigungsdreiecke zeigen v = Δs/Δt
 * bzw. a = Δv/Δt, die Fläche unter dem t-v-Graphen die Ortsänderung Δs.
 */
export default defineSimulation({
  id: 'bewegungsdiagramme',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.12, aspectNarrow: 0.5 },
  groups: [
    { id: 'leg1', label: L('Abschnitt 1', 'Section 1') },
    { id: 'leg2', label: L('Abschnitt 2', 'Section 2') },
    { id: 'leg3', label: L('Abschnitt 3', 'Section 3') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Bewegung', 'Motion'),
      options: [
        { value: 'uni', label: L('gleichförmig', 'uniform') },
        { value: 'acc', label: L('beschleunigt', 'accelerated') },
        { value: 'plan', label: L('Fahrplan', 'Schedule') },
      ],
      default: 'uni',
    },
    { key: 's0', type: 'number', label: L('Startort s₀', 'Starting position s₀'), min: -100, max: 100, step: 5, default: 0, unit: 'm' },
    {
      key: 'v',
      type: 'number',
      label: L('Geschwindigkeit v', 'Velocity v'),
      help: L('Negative Werte: Das Auto fährt rückwärts (nach links).', 'Negative values: the car moves backwards (to the left).'),
      min: -20,
      max: 40,
      step: 0.5,
      default: 10,
      unit: 'm/s',
      visibleIf: (v) => v.mode === 'uni',
    },
    {
      key: 'v0',
      type: 'number',
      label: L('Anfangsgeschwindigkeit v₀', 'Initial velocity v₀'),
      min: -20,
      max: 40,
      step: 0.5,
      default: 0,
      unit: 'm/s',
      visibleIf: (v) => v.mode !== 'uni',
    },
    {
      key: 'a',
      type: 'number',
      label: L('Beschleunigung a', 'Acceleration a'),
      help: L('Zeigt a gegen die Fahrtrichtung, bremst das Auto bis zum Stillstand.', 'If a points against the direction of motion, the car brakes until it stops.'),
      min: -8,
      max: 6,
      step: 0.1,
      default: 2,
      unit: 'm/s²',
      visibleIf: (v) => v.mode === 'acc',
    },
    { key: 'T', type: 'number', label: L('Dauer der Fahrt', 'Duration of the trip'), min: 1, max: 30, step: 0.5, default: 10, unit: 's', visibleIf: (v) => v.mode !== 'plan' },
    { key: 'v1', type: 'number', group: 'leg1', label: L('Geschwindigkeit am Ende v₁', 'Velocity at the end v₁'), min: -20, max: 40, step: 0.5, default: 15, unit: 'm/s', visibleIf: (v) => v.mode === 'plan' },
    { key: 't1', type: 'number', group: 'leg1', label: L('Dauer Δt₁', 'Duration Δt₁'), min: 0.5, max: 20, step: 0.5, default: 5, unit: 's', visibleIf: (v) => v.mode === 'plan' },
    { key: 'v2', type: 'number', group: 'leg2', label: L('Geschwindigkeit am Ende v₂', 'Velocity at the end v₂'), min: -20, max: 40, step: 0.5, default: 15, unit: 'm/s', visibleIf: (v) => v.mode === 'plan' },
    { key: 't2', type: 'number', group: 'leg2', label: L('Dauer Δt₂', 'Duration Δt₂'), min: 0.5, max: 20, step: 0.5, default: 10, unit: 's', visibleIf: (v) => v.mode === 'plan' },
    { key: 'v3', type: 'number', group: 'leg3', label: L('Geschwindigkeit am Ende v₃', 'Velocity at the end v₃'), min: -20, max: 40, step: 0.5, default: 0, unit: 'm/s', visibleIf: (v) => v.mode === 'plan' },
    { key: 't3', type: 'number', group: 'leg3', label: L('Dauer Δt₃', 'Duration Δt₃'), min: 0.5, max: 20, step: 0.5, default: 5, unit: 's', visibleIf: (v) => v.mode === 'plan' },
    { key: 'area', type: 'boolean', group: 'view', label: L('Fläche unter dem t-v-Graphen (Ortsänderung Δs)', 'Area under the v–t graph (displacement Δs)'), default: true },
    { key: 'slope', type: 'boolean', group: 'view', label: L('Steigungsdreiecke', 'Slope triangles'), default: true },
    { key: 'strobe', type: 'boolean', group: 'view', label: L('Stroboskop (Positionen in gleichen Zeitabständen)', 'Stroboscope (positions at equal time intervals)'), default: true },
    { key: 'ta', type: 'boolean', group: 'view', label: L('t-a-Diagramm', 'a–t graph'), default: true },
    { key: 'pre', type: 'boolean', group: 'view', label: L('Graphen schon vor der Fahrt zeigen', 'Show the graphs before the trip'), default: true },
    { key: 'slow', type: 'boolean', group: 'view', label: L('Zeitlupe', 'Slow motion'), default: false },
  ],
  actions: [{ id: 'go', label: L('Losfahren', 'Start'), primary: true }],
  readouts: [
    { key: 'now', label: L('Momentan', 'Right now') },
    { key: 'law', label: L('Bewegungsgesetz', 'Equations of motion') },
    { key: 'trip', label: L('Ganze Fahrt', 'Whole trip'), spoiler: true },
    { key: 'brake', label: L('Bremsen bis zum Stillstand', 'Braking to a stop'), spoiler: true },
    { key: 'table', label: L('Abschnitte', 'Sections'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Gleichförmig mit 10 m/s', 'Uniform at 10 m/s'), values: {} },
    { id: 'back', label: L('Rückwärts fahren', 'Driving backwards'), values: { v: -5, s0: 50 } },
    { id: 'acc', label: L('Anfahren mit 2 m/s²', 'Accelerating at 2 m/s²'), values: { mode: 'acc' } },
    { id: 'brake', label: L('Bremsen bis zum Stillstand', 'Braking to a stop'), values: { mode: 'acc', v0: 20, a: -4, T: 8 } },
    { id: 'plan', label: L('Anfahren – Fahren – Bremsen', 'Speed up – cruise – brake'), values: { mode: 'plan' } },
    { id: 'return', label: L('Hin und zurück', 'There and back'), values: { mode: 'plan', v1: 8, t1: 4, v2: -8, t2: 8, v3: 0, t3: 4 } },
  ],
  strings: {
    de: {
      canvas: 'Auto auf einer Straße mit Maßband, darunter t-s-, t-v- und t-a-Diagramm mit Zeitmarke',
      ts: 's in m',
      tv: 'v in m/s',
      ta: 'a in m/s²',
      time: 't in s',
      road: 's in m',
      start: 'Start',
      slopeV: 'Steigung: v = Δs / Δt = {ds} / {dt} = {v}',
      slopeVShort: 'v = {ds} / {dt} = {v}',
      slopeA: 'Steigung: a = Δv / Δt = {dv} / {dt} = {a}',
      slopeAShort: 'a = {dv} / {dt} = {a}',
      areaS: 'Fläche: Δs = {ds}',
      areaSShort: 'Δs = {ds}',
      now: 't = {t} s · s = {s} m · v = {v} m/s ({kmh} km/h) · a = {a} m/s²',
      tripText: 'Ortsänderung Δs = {ds} m in {T} s · Durchschnittsgeschwindigkeit v̄ = Δs/Δt = {vm} m/s',
      tripPath: ' · zurückgelegter Weg {path} m (Richtungswechsel!)',
      brakeText: 'Bremszeit t = |v₀|/|a| = {t} s · Bremsweg s = v₀²/(2·|a|) = {s} m',
      planLaw: 'In jedem Abschnitt gilt a = Δv / Δt; die Fläche unter dem t-v-Graphen ist die Ortsänderung Δs.',
      thSection: 'Abschnitt',
      thDuration: 'Δt',
      thV: 'v am Ende',
      thA: 'a',
      thDs: 'Δs',
      stand: 'steht',
    },
    en: {
      canvas: 'Car on a road with a measuring tape, below it the distance–time, velocity–time and acceleration–time graphs with a time marker',
      ts: 's in m',
      tv: 'v in m/s',
      ta: 'a in m/s²',
      time: 't in s',
      road: 's in m',
      start: 'Start',
      slopeV: 'Slope: v = Δs / Δt = {ds} / {dt} = {v}',
      slopeVShort: 'v = {ds} / {dt} = {v}',
      slopeA: 'Slope: a = Δv / Δt = {dv} / {dt} = {a}',
      slopeAShort: 'a = {dv} / {dt} = {a}',
      areaS: 'Area: Δs = {ds}',
      areaSShort: 'Δs = {ds}',
      now: 't = {t} s · s = {s} m · v = {v} m/s ({kmh} km/h) · a = {a} m/s²',
      tripText: 'Displacement Δs = {ds} m in {T} s · average velocity v̄ = Δs/Δt = {vm} m/s',
      tripPath: ' · distance travelled {path} m (change of direction!)',
      brakeText: 'Braking time t = |v₀|/|a| = {t} s · braking distance s = v₀²/(2·|a|) = {s} m',
      planLaw: 'In each section a = Δv / Δt; the area under the v–t graph is the displacement Δs.',
      thSection: 'Section',
      thDuration: 'Δt',
      thV: 'v at the end',
      thA: 'a',
      thDs: 'Δs',
      stand: 'at rest',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const mode = () => p.mode as Mode;
    const narrow = () => surface.width < 560;

    /* ---------- Aufteilung der Bühne ---------- */
    function regions(): { scene: Rect; ts: Rect; tv: Rect; ta: Rect | null } {
      const w = surface.width;
      const h = surface.height;
      const sceneH = Math.round(Math.max(narrow() ? 136 : 176, h * (narrow() ? 0.21 : 0.27)));
      const gap = 8;
      const top = sceneH + gap;
      const rest = h - top;
      const weights = p.ta ? [0.41, 0.34, 0.25] : [0.55, 0.45];
      const total = rest - gap * (weights.length - 1);
      const hs = weights.map((k) => Math.round(total * k));
      const ts: Rect = { x: 0, y: top, w, h: hs[0]! };
      const tv: Rect = { x: 0, y: ts.y + ts.h + gap, w, h: hs[1]! };
      const ta: Rect | null = p.ta ? { x: 0, y: tv.y + tv.h + gap, w, h: h - (tv.y + tv.h + gap) } : null;
      return { scene: { x: 0, y: 0, w, h: sceneH }, ts, tv, ta };
    }

    const chartOptions = (key: 'ts' | 'tv' | 'ta', label: string) => ({
      x: [0, 10] as const,
      y: [0, 10] as const,
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (_w: number, _h: number) => regions()[key] ?? { x: 0, y: 0, w: 1, h: 1 },
      xAxis: { label: ctx.t('time') },
      yAxis: { label },
    });
    const plotS = new Plot(surface, chartOptions('ts', ctx.t('ts')));
    const plotV = new Plot(surface, chartOptions('tv', ctx.t('tv')));
    const plotA = new Plot(surface, chartOptions('ta', ctx.t('ta')));
    const pad = () => ({ left: narrow() ? 44 : 54, right: narrow() ? 38 : 46, top: 24, bottom: 20 });

    /* ---------- Zustand ---------- */
    let motion: Motion = uniformMotion(0, 10, 10);
    let phases: Phase[] = buildPhases(motion);
    let T = totalTime(phases);
    let t = 0;
    let view: View = tightView();
    let loose = false;
    const morph = new Tween(480, ease.inOutCubic);
    let fromView: View = view;
    let fromCurves: Curves | null = null;
    let toCurves: Curves | null = null;
    /** Zuletzt bekannte Fahrtrichtung (für das Auto, wenn es steht). */
    let facing = 1;

    function buildMotion(): Motion {
      if (mode() === 'uni') return uniformMotion(p.s0, p.v, p.T);
      if (mode() === 'acc') return acceleratedMotion(p.s0, p.v0, p.a, p.T);
      return scheduleMotion(p.s0, p.v0, [
        { v: p.v1, duration: p.t1 },
        { v: p.v2, duration: p.t2 },
        { v: p.v3, duration: p.t3 },
      ]);
    }

    function roadRange(): Range {
      let [lo, hi] = extent(phases, 's');
      if (hi - lo < 20) {
        const c = (lo + hi) / 2;
        lo = c - 10;
        hi = c + 10;
      }
      return [lo, hi];
    }

    function tightView(): View {
      return { T, s: niceRange(extent(phases, 's')), v: niceRange(extent(phases, 'v')), a: niceRange(extent(phases, 'a')), road: roadRange() };
    }

    function sampleCurves(): Curves {
      const s: number[] = [];
      const v: number[] = [];
      const a: number[] = [];
      for (let i = 0; i <= SAMPLES; i++) {
        const st = stateAt(phases, (T * i) / SAMPLES);
        s.push(st.s);
        v.push(st.v);
        a.push(st.a);
      }
      return { T, s, v, a };
    }

    function shownView(): View {
      if (!morph.running) return view;
      const u = morph.value;
      return {
        T: lerp(fromView.T, view.T, u),
        s: lerpRange(fromView.s, view.s, u),
        v: lerpRange(fromView.v, view.v, u),
        a: lerpRange(fromView.a, view.a, u),
        road: lerpRange(fromView.road, view.road, u),
      };
    }

    function shownCurves(): Curves | null {
      if (!morph.running || !fromCurves || !toCurves) return null;
      const u = morph.value;
      const mix = (x: number[], y: number[]) => x.map((q, i) => lerp(q, y[i]!, u));
      return { T: lerp(fromCurves.T, toCurves.T, u), s: mix(fromCurves.s, toCurves.s), v: mix(fromCurves.v, toCurves.v), a: mix(fromCurves.a, toCurves.a) };
    }

    /** Überblendung vom gerade Sichtbaren zum neuen Zustand starten. */
    function startMorph(before: { view: View; curves: Curves }, next: View): void {
      fromView = before.view;
      fromCurves = before.curves;
      view = next;
      toCurves = sampleCurves();
      morph.play();
    }

    function snapshot(): { view: View; curves: Curves } {
      return { view: shownView(), curves: shownCurves() ?? sampleCurves() };
    }

    /** Fahrtrichtung zur Zeit t (steht das Auto, die zuletzt gefahrene). */
    function direction(time: number): number {
      const v = stateAt(phases, time).v;
      if (Math.abs(v) > 1e-6) return Math.sign(v);
      const before = stateAt(phases, Math.max(0, time - 0.05)).v;
      if (Math.abs(before) > 1e-6) return Math.sign(before);
      const after = stateAt(phases, time + 0.05).v;
      if (Math.abs(after) > 1e-6) return Math.sign(after);
      return facing;
    }

    /** Zeitabstand der Stroboskop-Marken (höchstens etwa 12 Marken). */
    function strobeStep(): number {
      for (const dt of [0.5, 1, 2, 2.5, 5, 10]) if (T / dt <= 12.01) return dt;
      return 10;
    }

    /** Δt der Steigungsdreiecke: etwa ein Fünftel der Fahrzeit, auf runde Werte. */
    function slopeStep(): number {
      const target = T / 5;
      const options = [0.5, 1, 2, 2.5, 5, 10];
      let best = options[0]!;
      for (const o of options) if (Math.abs(Math.log(o / target)) < Math.abs(Math.log(best / target))) best = o;
      return Math.min(best, T);
    }

    /* ---------- Ergebnisse ---------- */
    const unit = (value: number, decimals: number, u: string) => `${fmt.num(value, decimals)} ${u}`;
    const v_ = (name: string, sub = '') => `<var>${name}</var>${sub}`;

    function updateNow(): void {
      const st = stateAt(phases, t);
      ctx.readout(
        'now',
        tr('now', { t: fmt.fixed(t, 2), s: fmt.num(st.s, 1), v: fmt.num(st.v, 1), kmh: fmt.num(Math.abs(toKmh(st.v)), 0), a: fmt.num(st.a, 2) }),
      );
    }

    function updateReadouts(): void {
      updateNow();
      const m = mode();
      const s0 = unit(p.s0, 0, 'm');
      if (m === 'uni') {
        ctx.readout('law', {
          html: `${v_('s')}(${v_('t')}) = ${v_('s', '₀')} + ${v_('v')} · ${v_('t')} = ${s0} + ${unit(p.v, 1, 'm/s')} · ${v_('t')}<br>${v_('v')} = ${unit(p.v, 1, 'm/s')} = ${ctx.lang === 'de' ? 'konstant' : 'constant'}, ${v_('a')} = 0`,
        });
      } else if (m === 'acc') {
        const half = fmt.num(p.a / 2, 2);
        ctx.readout('law', {
          html: `${v_('s')}(${v_('t')}) = ${v_('s', '₀')} + ${v_('v', '₀')} · ${v_('t')} + ½ · ${v_('a')} · ${v_('t')}² = ${s0} + ${unit(p.v0, 1, 'm/s')} · ${v_('t')} + ${half} m/s² · ${v_('t')}²<br>${v_('v')}(${v_('t')}) = ${v_('v', '₀')} + ${v_('a')} · ${v_('t')} = ${unit(p.v0, 1, 'm/s')} + ${unit(p.a, 1, 'm/s²')} · ${v_('t')}`,
        });
      } else {
        ctx.readout('law', ctx.t('planLaw'));
      }
      const ds = displacement(phases, T);
      const path = pathLength(phases, T);
      ctx.readout('trip', tr('tripText', { ds: fmt.num(ds, 1), T: fmt.num(T, 1), vm: fmt.num(ds / T, 2) }) + (Math.abs(path - Math.abs(ds)) > 0.05 ? tr('tripPath', { path: fmt.num(path, 1) }) : ''));
      const brake = m === 'acc' ? brakingInfo(p.v0, p.a) : null;
      ctx.readout('brake', brake ? tr('brakeText', { t: fmt.num(brake.time, 2), s: fmt.num(brake.distance, 1) }) : null);
      if (m === 'plan') {
        const legs = [
          [p.t1, p.v1],
          [p.t2, p.v2],
          [p.t3, p.v3],
        ];
        const rows = phases
          .map((ph, i) => {
            const dsI = ph.v0 * (ph.t1 - ph.t0) + 0.5 * ph.a * (ph.t1 - ph.t0) ** 2;
            return `<tr><td>${i + 1}</td><td>${unit(legs[i]![0]!, 1, 's')}</td><td>${unit(legs[i]![1]!, 1, 'm/s')}</td><td>${unit(ph.a, 2, 'm/s²')}</td><td>${unit(dsI, 1, 'm')}</td></tr>`;
          })
          .join('');
        ctx.readout('table', {
          html: `<table class="mini-table"><tr><th>${ctx.t('thSection')}</th><th>${ctx.t('thDuration')}</th><th>${ctx.t('thV')}</th><th>${ctx.t('thA')}</th><th>${ctx.t('thDs')}</th></tr>${rows}</table>`,
        });
      } else ctx.readout('table', null);
    }

    /* ---------- Ziehbare Punkte ---------- */
    const editable = () => !ctx.locked;
    const cum = (i: number) => [0, p.t1, p.t1 + p.t2, p.t1 + p.t2 + p.t3][i]!;
    const legV = (i: number) => [p.v0, p.v1, p.v2, p.v3][i]!;

    // Zeitmarke oben im t-s-Diagramm: Zeit vor- und zurückspulen
    plotS.addHandle({
      get: () => [t, plotS.toWorld(0, plotS.rect.y + 9)[1]],
      set: (x) => {
        ctx.clock.pause();
        t = Math.max(0, Math.min(T, x));
        updateNow();
      },
      axis: 'x',
      color: () => ctx.theme.text,
    });
    plotS.addHandle({ get: () => [0, p.s0], set: (_x, y) => ctx.set({ s0: y }), axis: 'y', enabled: editable, color: () => ctx.theme.series[0]! });
    plotV.addHandle({ get: () => [T / 2, p.v], set: (_x, y) => ctx.set({ v: y }), axis: 'y', enabled: () => editable() && mode() === 'uni', color: () => ctx.theme.series[3]! });
    plotV.addHandle({ get: () => [0, p.v0], set: (_x, y) => ctx.set({ v0: y }), axis: 'y', enabled: () => editable() && mode() !== 'uni', color: () => ctx.theme.series[3]! });
    plotA.addHandle({
      get: () => [Math.min(T, phases[0] ? phases[0].t1 : T) / 2, p.a],
      set: (_x, y) => ctx.set({ a: y }),
      axis: 'y',
      enabled: () => editable() && mode() === 'acc' && p.ta,
      color: () => ctx.theme.series[4]!,
    });
    for (const i of [1, 2, 3] as const) {
      plotV.addHandle({
        get: () => [cum(i), legV(i)],
        set: (x, y) => {
          const duration = Math.max(0.5, x - cum(i - 1));
          ctx.set({ [`v${i}`]: y, [`t${i}`]: duration } as Partial<typeof p>);
        },
        enabled: () => editable() && mode() === 'plan',
        color: () => ctx.theme.series[3]!,
      });
    }

    // Nach dem Ziehen die Diagramme wieder passend einpassen
    const refit = () => {
      if (!loose) return;
      loose = false;
      startMorph(snapshot(), tightView());
      ctx.requestRender();
    };
    surface.canvas.addEventListener('pointerup', refit);
    surface.canvas.addEventListener('pointercancel', refit);

    /* ---------- Zeichnen: Straße ---------- */
    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12): number {
      const g = surface.g;
      const theme = ctx.theme;
      g.font = `700 ${size}px ${theme.font}`;
      const w = g.measureText(label).width + 16;
      const h = size + 11;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1;
      g.fillStyle = theme.dark ? 'rgba(16,22,31,0.88)' : 'rgba(255,255,255,0.92)';
      roundRect(g, x0, y, w, h, h / 2);
      g.fill();
      g.restore();
      g.strokeStyle = withAlpha(color, 0.45);
      g.lineWidth = 1;
      roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
      g.stroke();
      text(g, label, x0 + w / 2, y + h / 2 + 0.5, { font: `700 ${size}px ${theme.font}`, color });
      return w;
    }

    /**
     * Auto in Seitenansicht; Ursprung = Mitte am Boden, Blick nach rechts
     * (dir = −1: nach links). `wheel` ist der Drehwinkel der Räder.
     */
    function paintCar(g: CanvasRenderingContext2D, len: number, dir: number, wheel: number, shadow: boolean): void {
      const theme = ctx.theme;
      const r = len * 0.115;
      g.save();
      g.scale(dir, 1);
      if (shadow) {
        g.save();
        g.fillStyle = 'rgba(0,0,0,0.3)';
        g.filter = 'blur(3px)';
        g.beginPath();
        g.ellipse(0, -1, len * 0.5, len * 0.045, 0, 0, Math.PI * 2);
        g.fill();
        g.restore();
      }
      // Kabine mit Fenstern
      const cabin = () => {
        g.beginPath();
        g.moveTo(-len * 0.31, -len * 0.31);
        g.quadraticCurveTo(-len * 0.24, -len * 0.5, -len * 0.16, -len * 0.505);
        g.lineTo(len * 0.07, -len * 0.505);
        g.quadraticCurveTo(len * 0.15, -len * 0.5, len * 0.31, -len * 0.31);
        g.closePath();
      };
      const body = g.createLinearGradient(0, -len * 0.5, 0, -len * 0.1);
      body.addColorStop(0, '#f2665f');
      body.addColorStop(0.55, '#d6332c');
      body.addColorStop(1, '#a11f1a');
      cabin();
      g.fillStyle = body;
      g.fill();
      const glass = g.createLinearGradient(0, -len * 0.48, 0, -len * 0.32);
      glass.addColorStop(0, theme.dark ? '#a9c8e6' : '#d9ecfb');
      glass.addColorStop(1, theme.dark ? '#5d7c9c' : '#8db6dc');
      g.fillStyle = glass;
      g.beginPath();
      g.moveTo(-len * 0.27, -len * 0.32);
      g.quadraticCurveTo(-len * 0.22, -len * 0.465, -len * 0.15, -len * 0.47);
      g.lineTo(-len * 0.05, -len * 0.47);
      g.lineTo(-len * 0.05, -len * 0.32);
      g.closePath();
      g.fill();
      g.beginPath();
      g.moveTo(-len * 0.015, -len * 0.32);
      g.lineTo(-len * 0.015, -len * 0.47);
      g.lineTo(len * 0.065, -len * 0.47);
      g.quadraticCurveTo(len * 0.13, -len * 0.465, len * 0.25, -len * 0.32);
      g.closePath();
      g.fill();
      // Karosserie
      g.fillStyle = body;
      roundRect(g, -len * 0.5, -len * 0.34, len, len * 0.22, len * 0.07);
      g.fill();
      // Glanzlinie und Türfuge
      g.strokeStyle = 'rgba(255,255,255,0.35)';
      g.lineWidth = Math.max(1, len * 0.012);
      g.beginPath();
      g.moveTo(-len * 0.44, -len * 0.3);
      g.lineTo(len * 0.44, -len * 0.3);
      g.stroke();
      g.strokeStyle = 'rgba(80,10,8,0.45)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(-len * 0.03, -len * 0.33);
      g.lineTo(-len * 0.03, -len * 0.14);
      g.stroke();
      // Scheinwerfer und Rücklicht
      g.fillStyle = '#ffe9a3';
      g.beginPath();
      g.ellipse(len * 0.475, -len * 0.27, len * 0.03, len * 0.022, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#7a0d0a';
      g.fillRect(-len * 0.5, -len * 0.29, len * 0.035, len * 0.04);
      // Radkästen und Räder
      for (const x of [-len * 0.3, len * 0.3]) {
        g.fillStyle = '#2a1414';
        g.beginPath();
        g.arc(x, -r, r * 1.22, Math.PI, 0);
        g.fill();
        g.fillStyle = '#1d2027';
        g.beginPath();
        g.arc(x, -r, r, 0, Math.PI * 2);
        g.fill();
        const rim = g.createRadialGradient(x - r * 0.2, -r - r * 0.2, 1, x, -r, r * 0.62);
        rim.addColorStop(0, '#f4f6f9');
        rim.addColorStop(1, '#9aa2ad');
        g.fillStyle = rim;
        g.beginPath();
        g.arc(x, -r, r * 0.6, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = '#5f6670';
        g.lineWidth = Math.max(1, r * 0.13);
        g.lineCap = 'round';
        for (let k = 0; k < 5; k++) {
          const ang = wheel + (k * 2 * Math.PI) / 5;
          g.beginPath();
          g.moveTo(x + Math.cos(ang) * r * 0.12, -r + Math.sin(ang) * r * 0.12);
          g.lineTo(x + Math.cos(ang) * r * 0.5, -r + Math.sin(ang) * r * 0.5);
          g.stroke();
        }
      }
      // Messpunkt (der „Ort“ des Autos)
      g.fillStyle = '#ffffff';
      g.beginPath();
      g.arc(0, -len * 0.23, Math.max(2.5, len * 0.035), 0, Math.PI * 2);
      g.fill();
      g.fillStyle = theme.series[0]!;
      g.beginPath();
      g.arc(0, -len * 0.23, Math.max(1.5, len * 0.022), 0, Math.PI * 2);
      g.fill();
      g.restore();
    }

    /** Vorgezeichnetes Auto für die Stroboskop-Bilder (sonst überlagern sich die halbdurchsichtigen Teile). */
    const sprites = new Map<string, HTMLCanvasElement>();
    function carSprite(len: number, dir: number): HTMLCanvasElement {
      const dpr = surface.dpr;
      const key = `${Math.round(len)}|${dir}|${ctx.theme.dark}|${dpr}|${ctx.theme.series[0]}`;
      const cached = sprites.get(key);
      if (cached) return cached;
      if (sprites.size > 6) sprites.clear();
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(len * 1.1 * dpr);
      canvas.height = Math.ceil(len * 0.6 * dpr);
      const g = canvas.getContext('2d')!;
      g.scale(dpr, dpr);
      g.translate(len * 0.55, len * 0.58);
      paintCar(g, len, dir, 0, false);
      sprites.set(key, canvas);
      return canvas;
    }

    function drawCar(cx: number, ground: number, len: number, dir: number, wheel: number, ghost = 0): void {
      const g = surface.g;
      if (ghost > 0) {
        g.save();
        g.globalAlpha = ghost;
        g.drawImage(carSprite(len, dir), cx - len * 0.55, ground - len * 0.58, len * 1.1, len * 0.6);
        g.restore();
        return;
      }
      g.save();
      g.translate(cx, ground);
      paintCar(g, len, dir, wheel, true);
      g.restore();
    }

    function drawScene(r: Rect, v: View): void {
      const g = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const small = narrow();
      g.save();
      g.beginPath();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();

      const tapeH = small ? 30 : 36;
      const rulerY = r.y + r.h - tapeH;
      const roadH = Math.max(small ? 26 : 32, Math.round(r.h * 0.2));
      const roadTop = rulerY - roadH;
      // Himmel
      const sky = g.createLinearGradient(0, r.y, 0, roadTop);
      sky.addColorStop(0, dark ? '#0c1729' : '#9fd0f6');
      sky.addColorStop(1, dark ? '#22324a' : '#eef8ff');
      g.fillStyle = sky;
      g.fillRect(r.x, r.y, r.w, roadTop - r.y);
      // Hügel im Hintergrund
      const hills = (amp: number, base: number, phase: number, color: string) => {
        g.fillStyle = color;
        g.beginPath();
        g.moveTo(r.x, roadTop);
        for (let x = 0; x <= r.w + 8; x += 8) {
          const y = base - amp * (0.55 + 0.45 * Math.sin(x / 97 + phase) * Math.sin(x / 41 + phase * 2));
          g.lineTo(r.x + x, y);
        }
        g.lineTo(r.x + r.w, roadTop);
        g.closePath();
        g.fill();
      };
      const skyH = roadTop - r.y;
      if (dark) {
        // Sterne
        g.fillStyle = 'rgba(255,255,255,0.7)';
        for (let i = 0; i < 40; i++) {
          const sxp = r.x + ((i * 97.31) % r.w);
          const syp = r.y + ((i * 37.7) % (skyH * 0.6));
          g.fillRect(sxp, syp, i % 6 === 0 ? 2 : 1, i % 6 === 0 ? 2 : 1);
        }
      }
      // Wolken
      g.fillStyle = dark ? 'rgba(160,180,210,0.10)' : 'rgba(255,255,255,0.85)';
      for (const [fx, fy, k] of [
        [0.2, 0.34, 1],
        [0.56, 0.2, 0.8],
        [0.86, 0.4, 1.1],
      ] as const) {
        const cx = r.x + fx * r.w;
        const cy = r.y + fy * skyH + 8;
        const u = (small ? 9 : 12) * k;
        g.beginPath();
        g.ellipse(cx, cy, u * 2.4, u * 0.9, 0, 0, Math.PI * 2);
        g.ellipse(cx - u * 0.9, cy - u * 0.5, u * 1.1, u, 0, 0, Math.PI * 2);
        g.ellipse(cx + u * 0.6, cy - u * 0.7, u * 1.3, u * 1.15, 0, 0, Math.PI * 2);
        g.fill();
      }
      hills(skyH * 0.42, roadTop, 0.7, dark ? '#1b2b42' : '#c6dfc6');
      hills(skyH * 0.24, roadTop, 2.1, dark ? '#1f3a2a' : '#9fca93');
      // Bäume am Straßenrand
      for (let i = 0; i < 11; i++) {
        const x = r.x + ((i * 0.618 + 0.07) % 1) * r.w;
        const size = (small ? 7 : 9) + (i % 3) * 2.5;
        g.fillStyle = dark ? '#3b2d22' : '#7b5a3c';
        g.fillRect(x - 1.5, roadTop - size * 0.9, 3, size * 0.9);
        g.fillStyle = dark ? (i % 2 ? '#24503a' : '#2c5a3a') : i % 2 ? '#4f9a4a' : '#5aa654';
        g.beginPath();
        g.arc(x, roadTop - size * 1.2, size * 0.75, 0, Math.PI * 2);
        g.fill();
      }
      // Straße
      const asphalt = g.createLinearGradient(0, roadTop, 0, rulerY);
      asphalt.addColorStop(0, dark ? '#3a3f48' : '#60666f');
      asphalt.addColorStop(1, dark ? '#2b2f36' : '#454a52');
      g.fillStyle = asphalt;
      g.fillRect(r.x, roadTop, r.w, roadH);
      g.fillStyle = 'rgba(255,255,255,0.75)';
      g.fillRect(r.x, roadTop + 2, r.w, 1.5);
      g.fillRect(r.x, rulerY - 3.5, r.w, 1.5);
      g.fillStyle = 'rgba(255,255,255,0.5)';
      for (let x = r.x + 6; x < r.x + r.w; x += 34) g.fillRect(x, roadTop + roadH * 0.42 - 1, 18, 2);

      // Abbildung Ort → Pixel (das Auto wird größer als maßstäblich gezeichnet)
      const padX = 10;
      const span = v.road[1] - v.road[0];
      const est = (r.w - 2 * padX) / span;
      const len = Math.max(small ? 52 : 74, Math.min(small ? 72 : 110, CAR_LENGTH * est));
      const innerL = r.x + padX + len / 2 + 4;
      const innerR = r.x + r.w - padX - len / 2 - 4;
      const scale = (innerR - innerL) / span;
      const sx = (s: number) => innerL + (s - v.road[0]) * scale;
      const carGround = roadTop + roadH * 0.8;

      // Maßband
      const tape = g.createLinearGradient(0, rulerY, 0, rulerY + tapeH);
      tape.addColorStop(0, dark ? '#c9a23a' : '#f7d35e');
      tape.addColorStop(1, dark ? '#a8862c' : '#e8bb3c');
      g.fillStyle = tape;
      g.fillRect(r.x, rulerY, r.w, tapeH);
      g.fillStyle = 'rgba(0,0,0,0.18)';
      g.fillRect(r.x, rulerY, r.w, 1.5);
      const step = niceStep((small ? 52 : 64) / scale);
      const mantissa = Math.round((step / 10 ** Math.floor(Math.log10(step))) * 10) / 10;
      const minor = step / (mantissa === 2 ? 4 : 5);
      const sMin = v.road[0] + (r.x - innerL) / scale;
      const sMax = v.road[0] + (r.x + r.w - innerL) / scale;
      const ink = '#3d2f0c';
      g.strokeStyle = ink;
      g.lineWidth = 1;
      g.beginPath();
      for (let k = Math.ceil(sMin / minor); k * minor <= sMax; k++) {
        const s = k * minor;
        const x = Math.round(sx(s)) + 0.5;
        const major = Math.abs(s / step - Math.round(s / step)) < 1e-6;
        g.moveTo(x, rulerY);
        g.lineTo(x, rulerY + (major ? 10 : 5));
      }
      g.stroke();
      const decimals = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
      const labelY = rulerY + 10 + (tapeH - 10) / 2;
      const unitLabel = ctx.t('road');
      g.font = `700 ${small ? 10.5 : 11}px ${theme.font}`;
      const unitW = g.measureText(unitLabel).width;
      for (let k = Math.ceil(sMin / step); k * step <= sMax; k++) {
        const x = sx(k * step);
        if (x > r.x + r.w - unitW - 24 || x < r.x + 8) continue;
        text(g, fmt.num(k * step, decimals), x, labelY, { font: `600 ${small ? 10.5 : 11}px ${theme.font}`, color: ink });
      }
      text(g, unitLabel, r.x + r.w - 8, labelY, { font: `700 ${small ? 10.5 : 11}px ${theme.font}`, color: ink, align: 'right' });

      const st = stateAt(phases, t);
      const s0 = phases[0]?.s0 ?? 0;
      // Ortsänderung Δs als Band am oberen Rand des Maßbands
      if (Math.abs(st.s - s0) > 1e-6) {
        const x0 = sx(Math.min(s0, st.s));
        g.fillStyle = withAlpha(theme.series[0]!, 0.7);
        g.fillRect(x0, rulerY, sx(Math.max(s0, st.s)) - x0, 4);
      }
      // Startlinie (kariert)
      const xs0 = sx(s0);
      const cell = 4;
      for (let y = roadTop + 4, row = 0; y < rulerY - 4; y += cell, row++) {
        for (let c = 0; c < 2; c++) {
          g.fillStyle = (row + c) % 2 ? 'rgba(20,20,20,0.85)' : 'rgba(255,255,255,0.92)';
          g.fillRect(xs0 - cell + c * cell, y, cell, Math.min(cell, rulerY - 4 - y));
        }
      }

      // Stroboskop: Auto in gleichen Zeitabständen
      const roof = carGround - len * 0.52;
      if (p.strobe && !morph.running) {
        const dt = strobeStep();
        let lastLabel = -Infinity;
        const halo = dark ? 'rgba(12,23,41,0.85)' : 'rgba(238,248,255,0.9)';
        for (let k = 0; k * dt <= t + 1e-9; k++) {
          const q = stateAt(phases, k * dt);
          const x = sx(q.s);
          drawCar(x, carGround, len, direction(k * dt), 0, 0.26);
          g.fillStyle = theme.series[0]!;
          g.beginPath();
          g.moveTo(x, rulerY + 6);
          g.lineTo(x - 4.5, rulerY);
          g.lineTo(x + 4.5, rulerY);
          g.closePath();
          g.fill();
          if (Math.abs(x - lastLabel) > (small ? 28 : 32)) {
            lastLabel = x;
            const label = `${fmt.num(k * dt, 1)} s`;
            g.font = `700 ${small ? 10 : 11}px ${theme.font}`;
            g.textAlign = 'center';
            g.textBaseline = 'bottom';
            g.lineWidth = 3;
            g.lineJoin = 'round';
            g.strokeStyle = halo;
            g.strokeText(label, x, roof - 3);
            g.fillStyle = theme.muted;
            g.fillText(label, x, roof - 3);
          }
        }
      }

      // Auto mit Messpunkt und Lot auf das Maßband
      const dir = direction(t);
      facing = dir;
      const x = sx(st.s);
      g.strokeStyle = withAlpha(theme.series[0]!, 0.9);
      g.lineWidth = 1.5;
      g.setLineDash([3, 3]);
      g.beginPath();
      g.moveTo(x, carGround - len * 0.23);
      g.lineTo(x, rulerY);
      g.stroke();
      g.setLineDash([]);
      drawCar(x, carGround, len, dir, ((st.s - s0) * scale) / (len * 0.115));
      g.fillStyle = theme.series[0]!;
      g.beginPath();
      g.moveTo(x, rulerY + 11);
      g.lineTo(x - 7, rulerY);
      g.lineTo(x + 7, rulerY);
      g.closePath();
      g.fill();

      // Anzeigen: Zeit, Ort und Tacho
      const size = small ? 11.5 : 13;
      const tLabel = `t = ${fmt.fixed(t, 1)} s`;
      const sLabel = `s = ${fmt.num(st.s, 1)} m`;
      const vLabel = small ? `v = ${fmt.num(st.v, 1)} m/s` : `v = ${fmt.num(st.v, 1)} m/s (${fmt.num(Math.abs(toKmh(st.v)), 0)} km/h)`;
      const w1 = pill(r.x + 8, r.y + 8, tLabel, theme.text, 'left', size);
      pill(r.x + 8 + w1 + 6, r.y + 8, sLabel, theme.series[0]!, 'left', size);
      pill(r.x + r.w - 8, r.y + 8, vLabel, theme.series[3]!, 'right', size);
      g.restore();
    }

    /* ---------- Zeichnen: Diagramme ---------- */
    type Key = 's' | 'v' | 'a';
    const COLOR: Record<Key, () => string> = { s: () => ctx.theme.series[0]!, v: () => ctx.theme.series[3]!, a: () => ctx.theme.series[4]! };
    const valueAt = (key: Key, time: number) => stateAt(phases, time)[key];

    /** Exakter Graph von 0 bis `to` (Parabelstücke fein abgetastet, Sprünge von a als eigene Teile). */
    function exactPoints(plot: Plot, key: Key, to: number): Pt[][] {
      const out: Pt[][] = [];
      let current: Pt[] = [];
      for (const ph of phases) {
        if (ph.t0 > to) break;
        const end = Math.min(to, ph.t1);
        if (key === 'a') {
          if (current.length) {
            out.push(current);
            current = [];
          }
          out.push([
            [ph.t0, ph.a],
            [end, ph.a],
          ]);
          continue;
        }
        const n = key === 's' && ph.a !== 0 ? Math.max(2, Math.ceil(((end - ph.t0) * plot.scale.x) / 3)) : 1;
        for (let i = current.length ? 1 : 0; i <= n; i++) {
          const time = ph.t0 + ((end - ph.t0) * i) / n;
          current.push([time, valueAt(key, time)]);
        }
      }
      if (current.length) out.push(current);
      return out;
    }

    function drawCurve(plot: Plot, key: Key, curves: Curves | null): void {
      const color = COLOR[key]();
      if (curves) {
        const list = curves[key];
        const pts = list.map((y, i) => [(curves.T * i) / SAMPLES, y] as Pt);
        plot.polyline(pts, { color, width: 2.5, alpha: 0.75 });
        return;
      }
      const parts = exactPoints(plot, key, p.pre ? T : t);
      const done = exactPoints(plot, key, t);
      if (p.pre) for (const part of parts) plot.polyline(part, { color, width: 2, alpha: 0.4, dash: [6, 5] });
      for (const part of done) plot.polyline(part, { color, width: 3 });
      // Sprünge von a gestrichelt verbinden
      if (key === 'a') {
        const upto = p.pre ? T : t;
        for (let i = 1; i < phases.length; i++) {
          const ph = phases[i]!;
          if (ph.t0 > upto) break;
          plot.segment([ph.t0, phases[i - 1]!.a], [ph.t0, ph.a], { color, width: 1.5, dash: [3, 3], alpha: ph.t0 <= t ? 0.9 : 0.4 });
        }
      }
    }

    /** Liegt der Graph eher links oben frei? Dann Hinweise oben links, sonst oben rechts. */
    function freeCorner(key: Key, y: Range): 'left' | 'right' {
      let left = -Infinity;
      let right = -Infinity;
      for (let i = 0; i <= 20; i++) {
        const time = (T * i) / 20;
        const q = (valueAt(key, time) - y[0]) / (y[1] - y[0]);
        if (i <= 8) left = Math.max(left, q);
        if (i >= 12) right = Math.max(right, q);
      }
      return left <= right ? 'left' : 'right';
    }

    function drawPills(plot: Plot, corner: 'left' | 'right', items: [string, string][]): void {
      const r = plot.rect;
      const size = narrow() ? 11 : 12;
      let y = r.y + (corner === 'left' ? 26 : 6);
      for (const [label, color] of items) {
        if (corner === 'left') pill(r.x + pad().left + 12, y, label, color, 'left', size);
        else pill(r.x + r.w - 10, y, label, color, 'right', size);
        y += size + 15;
      }
    }

    function slopeTriangle(plot: Plot, key: 's' | 'v', resultColor: string): { d: number; dt: number; rate: number } | null {
      const dt = slopeStep();
      if (!(dt > 0) || T <= 0) return null;
      const st = stateAt(phases, t);
      const value = key === 's' ? st.s : st.v;
      const rate = key === 's' ? st.v : st.a;
      // Ohne Steigung (Auto steht bzw. a = 0) wäre das Dreieck nur ein Strich
      if (Math.abs(rate) < 1e-9) return null;
      // Dreieck möglichst ganz im aktuellen Abschnitt (dort ist die Steigung konstant bzw. die Tangente sinnvoll)
      const ph = phases[Math.max(0, phaseIndexAt(phases, t))]!;
      const fits = (from: number) => from >= ph.t0 - 1e-9 && from + dt <= ph.t1 + 1e-9;
      const forward = fits(t) || (!fits(t - dt) && t + dt <= T + 1e-9);
      const t0 = forward ? t : t - dt;
      const y0 = forward ? value : value - rate * dt;
      const a: Pt = [t0, y0];
      const b: Pt = [t0 + dt, y0];
      const c: Pt = [t0 + dt, y0 + rate * dt];
      // Tangente (bei gleichförmiger Bewegung liegt sie auf dem Graphen)
      const l0 = Math.max(0, t - dt * 1.35);
      const l1 = Math.min(T, t + dt * 1.35);
      plot.segment([l0, value + rate * (l0 - t)], [l1, value + rate * (l1 - t)], { color: resultColor, width: 1.5, dash: [5, 4], alpha: 0.85 });
      plot.polygon([a, b, c], { fill: resultColor, alpha: 0.13, stroke: resultColor, width: 1.8 });
      const small = narrow() ? 10.5 : 11.5;
      const unitDelta = key === 's' ? 'm' : 'm/s';
      if (Math.abs(plot.px(b[0]) - plot.px(a[0])) > 30) {
        // Unter der waagerechten Kathete – außer sie liegt auf der t-Achse (dort stehen die Zahlen), dann darüber
        const onAxis = rate >= 0 && Math.abs(plot.py(y0) - plot.py(0)) < 18;
        const below = rate >= 0 && !onAxis;
        const xl = onAxis ? a[0] + 0.62 * dt : (a[0] + b[0]) / 2;
        plot.text(xl, y0, `Δt = ${fmt.num(dt, 2)} s`, { color: resultColor, size: small, weight: '600', align: 'center', baseline: below ? 'top' : 'bottom', offset: [0, below ? 4 : -4] });
      }
      if (Math.abs(plot.py(c[1]) - plot.py(b[1])) > 16) {
        // vorwärts: Beschriftung rechts neben der senkrechten Kathete, rückwärts links davon (rechts geht der Graph weiter)
        plot.text(b[0], (b[1] + c[1]) / 2, `${key === 's' ? 'Δs' : 'Δv'} = ${fmt.num(rate * dt, 2)} ${unitDelta}`, {
          color: resultColor,
          size: small,
          weight: '600',
          align: forward ? 'left' : 'right',
          baseline: 'middle',
          offset: [forward ? 6 : -6, 0],
        });
      }
      return { d: rate * dt, dt, rate };
    }

    /**
     * Werte an der senkrechten Achse beschriften, die die automatische
     * Einteilung auslässt (im flachen t-a-Diagramm sonst oft gar keine Zahl).
     */
    function levelLabels(plot: Plot, values: number[]): void {
      const g = surface.g;
      const theme = ctx.theme;
      const axisStep = (() => {
        const raw = 56 / plot.scale.y;
        const base = 10 ** Math.floor(Math.log10(raw));
        const m = raw / base;
        return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * base;
      })();
      const { yMin, yMax } = plot.bounds;
      const taken: number[] = [];
      for (let k = Math.ceil(yMin / axisStep); k * axisStep <= yMax; k++) taken.push(plot.py(k * axisStep));
      const x = plot.px(0);
      for (const value of [...new Set(values.map((q) => Math.round(q * 100) / 100))]) {
        if (Math.abs(value) < 1e-9) continue;
        const y = plot.py(value);
        if (taken.some((q) => Math.abs(q - y) < 18)) continue;
        taken.push(y);
        g.strokeStyle = theme.axis;
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(x - 4, Math.round(y) + 0.5);
        g.lineTo(x + 4, Math.round(y) + 0.5);
        g.stroke();
        plot.textPx(x - 7, y, fmt.num(value, 2), { color: theme.muted, size: 12, align: 'right', baseline: 'middle', halo: true });
      }
    }

    function drawChart(plot: Plot, key: Key, v: View, curves: Curves | null): void {
      const theme = ctx.theme;
      const range = v[key];
      plot.setRangePadded([0, Math.max(v.T, 0.5)], range, pad());
      const g = plot.begin();
      plot.grid({ minor: false });
      // Abschnittsgrenzen
      if (!curves && phases.length > 1) for (const ph of phases.slice(1)) plot.vline(ph.t0, { color: theme.muted, width: 1, dash: [2, 4], alpha: 0.7 });

      // Fläche unter dem t-v-Graphen bis zur aktuellen Zeit
      let areaLabel: [string, string] | null = null;
      if (key === 'v' && p.area && !curves && t > 1e-6) {
        const pts: Pt[] = [[0, 0]];
        for (const part of exactPoints(plot, 'v', t)) pts.push(...part);
        pts.push([t, 0]);
        plot.polygon(pts, { fill: theme.series[0], alpha: 0.2 });
        const ds = displacement(phases, t);
        areaLabel = [tr(narrow() ? 'areaSShort' : 'areaS', { ds: `${fmt.num(ds, 1)} m` }), theme.series[0]!];
      }

      plot.axes();
      drawCurve(plot, key, curves);

      // Stroboskop-Punkte im t-s-Diagramm
      if (key === 's' && p.strobe && !curves) {
        const dt = strobeStep();
        for (let k = 0; k * dt <= t + 1e-9; k++) plot.point(k * dt, valueAt('s', k * dt), { color: theme.series[0], radius: 3.5, hollow: true });
      }

      const pills: [string, string][] = [];
      if (!curves && p.slope && key !== 'a') {
        const res = slopeTriangle(plot, key, key === 's' ? theme.series[3]! : theme.series[4]!);
        if (res && key === 's') {
          pills.push([tr(narrow() ? 'slopeVShort' : 'slopeV', { ds: `${fmt.num(res.d, 2)} m`, dt: `${fmt.num(res.dt, 2)} s`, v: `${fmt.num(res.rate, 2)} m/s` }), theme.series[3]!]);
        }
        if (res && key === 'v') {
          pills.push([tr(narrow() ? 'slopeAShort' : 'slopeA', { dv: `${fmt.num(res.d, 2)} m/s`, dt: `${fmt.num(res.dt, 2)} s`, a: `${fmt.num(res.rate, 2)} m/s²` }), theme.series[4]!]);
        }
      }
      if (areaLabel) pills.unshift(areaLabel);

      // Zeitmarke mit Punkt auf dem Graphen
      if (!curves) {
        const value = valueAt(key, t);
        plot.vline(t, { color: theme.text, width: 1.5, alpha: 0.4 });
        plot.point(t, value, { color: COLOR[key](), radius: 6 });
      }
      if (key === 's') {
        // Griff der Zeitmarke
        const x = plot.px(t);
        const y = plot.rect.y + 2;
        g.fillStyle = theme.text;
        g.beginPath();
        g.moveTo(x - 7, y);
        g.lineTo(x + 7, y);
        g.lineTo(x, y + 9);
        g.closePath();
        g.fill();
      }
      if (key === 'a' && !curves) levelLabels(plot, phases.map((ph) => ph.a));
      if (pills.length) drawPills(plot, freeCorner(key, range), pills);
      plot.end();
      // Rahmen
      const r = plot.rect;
      g.save();
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 10);
      g.stroke();
      g.restore();
    }

    /* ---------- Ablauf ---------- */
    function rebuild(): void {
      motion = buildMotion();
      phases = buildPhases(motion);
      T = totalTime(phases);
      t = Math.min(t, T);
    }

    const MOTION_KEYS = ['mode', 's0', 'v', 'v0', 'a', 'T', 'v1', 't1', 'v2', 't2', 'v3', 't3'];

    return {
      update(changed, source) {
        const before = snapshot();
        rebuild();
        if (source === 'replace') {
          t = 0;
          ctx.clock.pause();
        }
        const tight = tightView();
        const motionChanged = MOTION_KEYS.some((k) => changed.has(k));
        if (source === 'init') view = tight;
        else if (source === 'sim') {
          // Beim Ziehen bleiben die Achsen stehen (sonst „rutscht“ der Griff); danach weich einpassen
          loose = JSON.stringify(view) !== JSON.stringify(tight);
          morph.finish();
        } else if (motionChanged) startMorph(before, tight);
        updateReadouts();
      },

      action(id) {
        if (id === 'go') {
          t = 0;
          ctx.clock.play();
        }
      },

      tick(dt) {
        if (t >= T) t = 0;
        t = Math.min(T, t + dt * (p.slow ? 0.25 : 1));
        if (t >= T) ctx.clock.pause();
        updateNow();
      },

      resetTime() {
        t = 0;
        updateNow();
      },

      render() {
        const reg = regions();
        // Aufteilung kann sich ändern (t-a-Diagramm ein/aus) – Bereiche neu bestimmen
        plotS.resize();
        plotV.resize();
        plotA.resize();
        const v = shownView();
        const curves = shownCurves();
        surface.begin();
        drawScene(reg.scene, v);
        drawChart(plotS, 's', v, curves);
        drawChart(plotV, 'v', v, curves);
        if (reg.ta) drawChart(plotA, 'a', v, curves);
        if (morph.running) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
