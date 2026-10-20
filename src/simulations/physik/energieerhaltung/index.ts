import { clamp, defineSimulation, ease, lerp, offscreenCanvas, Plot, prefersReducedMotion, roundRect, scaledSprite, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  bracket,
  CUSTOM_DEFAULT,
  energiesAt,
  firstPass,
  G,
  goalOf,
  judgeRun,
  liftOffHeight,
  LOOP_RADIUS,
  loopMinHeight,
  loopMinSpeed,
  loopTopForces,
  minStartHeight,
  normalAcceleration,
  placeStart,
  sampleAt,
  simulate,
  speedAtHeight,
  type Goal,
  type Outcome,
  type Run,
  type RunSample,
  type Track,
  type TrackId,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'ride' | 'energy' | 'loop' | 'task';
type PanelKind = 'bars' | 'es' | 'et' | 'forces' | 'series';
type Pt = [number, number];

/** Wagenlänge und -höhe in m (gezeichnet etwas größer als maßstäblich). */
const CAR_LENGTH = 3.2;
const CAR_HEIGHT = 1.7;
/** Parameter, die die Fahrt verändern (dann wird neu gerechnet). */
const PHYSICS = ['track', 'h0', 'mu', 'p1', 'p2', 'p3', 'p4'];
const SUPPORT_KEYS = ['h0', 'p1', 'p2', 'p3', 'p4'] as const;
const MAX_MARKS = 4;

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
  const step = niceStep(x / 4);
  return Math.ceil((x * 1.06) / step - 1e-9) * step;
}

/**
 * Energieerhaltung an der Achterbahn: Ein Wagen rollt über Tal, Hügel,
 * Looping oder eine selbst gebaute Bahn. Vier Ansichten: Fahrt mit
 * Energie-Säulen und Messpunkten, synchrone Energie-Diagramme über dem Weg
 * und der Zeit, Kräfte im Looping und eine Entdeckungsaufgabe mit Messreihe
 * („kleinste Starthöhe finden“).
 */
export default defineSimulation({
  id: 'energieerhaltung',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.7, aspectNarrow: 0.6 },
  groups: [
    { id: 'custom', label: L('Eigene Bahn', 'Custom track') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'ride', label: L('Fahrt', 'Ride') },
        { value: 'energy', label: L('Energie-Diagramme', 'Energy graphs') },
        { value: 'loop', label: L('Looping-Kräfte', 'Loop forces') },
        { value: 'task', label: L('Mindesthöhe finden', 'Find the minimum height') },
      ],
      default: 'ride',
    },
    {
      key: 'track',
      type: 'choice',
      label: L('Bahn', 'Track'),
      options: [
        { value: 'tal', label: L('Tal', 'Valley') },
        { value: 'huegel', label: L('Hügel', 'Hills') },
        { value: 'looping', label: L('Looping', 'Loop') },
        { value: 'eigen', label: L('Eigene Bahn', 'Custom') },
      ],
      default: 'huegel',
    },
    {
      key: 'h0',
      type: 'number',
      label: L('Starthöhe h₀', 'Starting height h₀'),
      help: L('Oder: den Wagen vor der Fahrt an der Startrampe ziehen.', 'Or: drag the car along the starting ramp before the ride.'),
      min: 2,
      max: 26,
      step: 0.5,
      default: 20,
      unit: 'm',
    },
    { key: 'm', type: 'number', label: L('Masse des Wagens m', 'Mass of the car m'), min: 100, max: 800, step: 50, default: 400, unit: 'kg' },
    {
      key: 'mu',
      type: 'number',
      label: L('Reibungszahl μ', 'Friction coefficient μ'),
      help: L('0 bedeutet: keine Reibung (Idealfall).', '0 means: no friction (ideal case).'),
      min: 0,
      max: 0.06,
      step: 0.005,
      default: 0,
    },
    { key: 'p1', type: 'number', group: 'custom', label: L('Höhe Punkt 1', 'Height of point 1'), help: L('Oder: die Punkte im Bild ziehen.', 'Or: drag the points in the picture.'), min: 0, max: 26, step: 0.5, default: CUSTOM_DEFAULT[1], unit: 'm', visibleIf: (v) => v.track === 'eigen' },
    { key: 'p2', type: 'number', group: 'custom', label: L('Höhe Punkt 2', 'Height of point 2'), min: 0, max: 26, step: 0.5, default: CUSTOM_DEFAULT[2], unit: 'm', visibleIf: (v) => v.track === 'eigen' },
    { key: 'p3', type: 'number', group: 'custom', label: L('Höhe Punkt 3', 'Height of point 3'), min: 0, max: 26, step: 0.5, default: CUSTOM_DEFAULT[3], unit: 'm', visibleIf: (v) => v.track === 'eigen' },
    { key: 'p4', type: 'number', group: 'custom', label: L('Höhe Punkt 4', 'Height of point 4'), min: 0, max: 26, step: 0.5, default: CUSTOM_DEFAULT[4], unit: 'm', visibleIf: (v) => v.track === 'eigen' },
    { key: 'bars', type: 'boolean', group: 'view', label: L('Energie-Säulen', 'Energy bars'), default: true, visibleIf: (v) => v.mode === 'ride' },
    { key: 'level', type: 'boolean', group: 'view', label: L('Linie in Starthöhe', 'Line at the starting height'), default: true },
    { key: 'vel', type: 'boolean', group: 'view', label: L('Geschwindigkeitspfeil', 'Velocity arrow'), default: true },
    { key: 'slow', type: 'boolean', group: 'view', label: L('Zeitlupe', 'Slow motion'), default: false },
  ],
  actions: [
    { id: 'start', label: L('Losfahren', 'Go'), primary: true },
    { id: 'clear', label: L('Messpunkte löschen', 'Clear the measuring points'), visibleIf: (v) => v.mode === 'ride' || v.mode === 'energy' || v.mode === 'task' },
  ],
  images: { car: 'wagen.webp', sky: 'himmel.webp', land: 'landschaft.webp' },
  readouts: [
    { key: 'motion', label: L('Höhe und Geschwindigkeit', 'Height and speed') },
    { key: 'energy', label: L('Energien', 'Energies') },
    { key: 'marks', label: L('Messpunkte', 'Measuring points') },
    { key: 'series', label: L('Messreihe', 'Series of measurements') },
    { key: 'vmax', label: L('Höchstgeschwindigkeit ohne Reibung', 'Top speed without friction'), spoiler: true },
    { key: 'loop', label: L('Looping', 'Loop'), spoiler: true },
    { key: 'goal', label: L('Theorie zur Aufgabe', 'Theory for the task'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Hügel ohne Reibung', 'Hills without friction'), values: {} },
    { id: 'friction', label: L('Mit Reibung', 'With friction'), values: { mu: 0.03 } },
    { id: 'valley', label: L('Tal: hin und her', 'Valley: back and forth'), values: { track: 'tal', h0: 15 } },
    { id: 'graphs', label: L('Energie-Diagramme mit Reibung', 'Energy graphs with friction'), values: { mode: 'energy', track: 'tal', h0: 15, mu: 0.02 } },
    { id: 'loop', label: L('Looping', 'Loop'), values: { mode: 'loop', track: 'looping', h0: 20 } },
    { id: 'loopLow', label: L('Looping: zu niedrig gestartet', 'Loop: start too low'), values: { mode: 'loop', track: 'looping', h0: 13 } },
    { id: 'custom', label: L('Eigene Bahn bauen', 'Build your own track'), values: { track: 'eigen' } },
    { id: 'task', label: L('Aufgabe: kleinste Starthöhe für den Looping', 'Task: smallest starting height for the loop'), values: { mode: 'task', track: 'looping', h0: 10 } },
  ],
  strings: {
    de: {
      canvas: 'Achterbahn mit Wagen, Linie in Starthöhe und je nach Ansicht Energie-Säulen, Energie-Diagrammen, Kräften im Looping oder einer Messreihe',
      pot: 'Lage',
      kin: 'Bewegung',
      heat: 'Wärme',
      total: 'Summe',
      kJ: 'Energie in kJ',
      mass: 'm = {m} kg',
      motion: 'h = {h} m · v = {v} m/s ({kmh} km/h) · t = {t} s',
      energy: '<var>E</var><sub>pot</sub> = <var>m</var> · <var>g</var> · <var>h</var> = {pot} kJ · <var>E</var><sub>kin</sub> = ½ · <var>m</var> · <var>v</var>² = {kin} kJ<br>Reibungswärme <var>W</var><sub>R</sub> = {heat} kJ · Summe = <strong>{sum} kJ</strong>',
      vmax: '<var>v</var> = √(2 · <var>g</var> · Δ<var>h</var>) = √(2 · 9,81 m/s² · {dh} m) ≈ <strong>{v} m/s</strong> ({kmh} km/h) im tiefsten Punkt',
      loopText: 'nötig oben: <var>v</var><sub>min</sub> = √(<var>g</var> · <var>r</var>) = {vmin} m/s · Mindesthöhe ohne Reibung 2,5 · <var>r</var> = {hmin} m (<var>r</var> = {r} m)',
      loopTop: '<br>aus {h} m: oben <var>v</var> = √(2<var>g</var>(<var>h</var>₀ − 2<var>r</var>)) ≈ {v} m/s · <var>F</var><sub>G</sub> = {fg} kN, <var>F</var><sub>Z</sub> = <var>m</var><var>v</var>²/<var>r</var> = {fz} kN, Schiene <var>F</var><sub>N</sub> = {fn} kN',
      loopLift: '<br>aus {h} m: Ohne Sicherung fiele der Wagen in <var>h</var> = (2<var>h</var>₀ + <var>r</var>)/3 ≈ {y} m heraus.',
      loopNone: '<br>aus {h} m: Der Wagen kommt nicht über die Höhe des Mittelpunkts – er rollt zurück.',
      loopFric: '<br>mit μ = {mu}: kleinste Starthöhe ≈ {h} m',
      goalLoop: 'Ohne Reibung: <var>h</var><sub>min</sub> = 2,5 · <var>r</var> = 15 m (oben <var>v</var>² = <var>g</var> · <var>r</var>).',
      goalHill: 'Ohne Reibung genügt jede Starthöhe über dem Hügel: <var>h</var>₀ > {y} m.',
      goalFric: ' Mit μ = {mu} gerechnet: <var>h</var><sub>min</sub> ≈ <strong>{h} m</strong>.',
      goalNone: ' Mit μ = {mu} reicht auch 26 m nicht.',
      thH: 'h₀',
      thRes: 'Ergebnis',
      thV: 'v oben',
      thNr: 'Nr.',
      thHere: 'h',
      thVel: 'v',
      ok: 'schafft es',
      fail: 'nicht geschafft',
      notReached: 'nicht erreicht',
      seriesNone: 'Noch keine Fahrt. Stelle h₀ ein und drücke „Losfahren“.',
      marksNone: 'Tippe auf die Schiene, um Messpunkte zu setzen.',
      level: 'Starthöhe h₀ = {h} m',
      turn: 'Umkehrpunkt',
      axisS: 's in m',
      axisT: 't in s',
      axisH: 'h₀ in m',
      tEs: 'Energie über dem Weg s',
      tEt: 'Energie über der Zeit t',
      tForces: 'Kräfte oben im Looping',
      tSeries: 'Messreihe: Geschwindigkeit oben',
      tSeriesHill: 'Messreihe: Geschwindigkeit auf dem Hügel',
      kN: 'F in kN',
      vAxis: 'v in m/s',
      eAxis: 'E in kJ',
      gap: 'E_{kin}',
      lost: 'W_{R}',
      fG: 'F_{G} = m · g',
      fZ: 'F_{Z} = m · v² / r',
      hmin: 'h_{min} = 2,5 · r = 15 m',
      hminShort: 'h_{min} = 15 m',
      falls: 'fällt heraus',
      noTop: 'kommt nicht hoch',
      vmin: 'v_{min} = √(g · r)',
      found: 'Gefunden: h_{min} liegt zwischen {lo} m und {hi} m',
      foundTheory: 'Theorie ohne Reibung: 2,5 · r = 15 m',
      bracketing: 'eingegrenzt: {lo} m … {hi} m',
      seriesEmpty: 'Jede Fahrt erscheint hier als Punkt.',
      seriesHint: 'Tippe hier, um h₀ zu wählen.',
      lift: 'Ohne Sicherungsbügel fiele der Wagen hier heraus!',
      liftShort: 'Würde herausfallen!',
      air: 'Airtime: Der Wagen würde kurz abheben.',
      hMu0: 'μ = 0: Die Gesamtenergie bleibt konstant.',
      hRest: 'Wagen steht: {p} % der Anfangsenergie sind jetzt Reibungswärme.',
      hTurn: 'Umkehrpunkt wieder genau in h₀ = {h} m',
      hMass: 'Masse ×{f}: v bleibt gleich, alle Energien ×{f}',
      hNear: 'Knapp verfehlt: {d} m zu niedrig',
      hFlat: 'Der Wagen rollt nicht los: Der Start ist zu flach.',
      hTal: 'Wähle Hügel, Looping oder eine eigene Bahn mit Hügel.',
      hLoopTrack: 'Diese Ansicht zeigt den Looping.',
      hPick: 'Stelle h₀ ein und drücke „Losfahren“.',
      hGoalLoop: 'Ziel: Looping ohne Herausfallen',
      hGoalHill: 'Ziel: über den Hügel ({y} m)',
      clearMarks: 'Messpunkte löschen',
      clearSeries: 'Messreihe löschen',
      top: 'oben: v = {v} m/s',
      topNone: 'oben nicht erreicht',
      speed: 'v = {v} m/s',
      kmh: '{v} km/h',
      point: 'Punkt {n}',
      start: 'Start',
      balance: 'E_{pot} + E_{kin} + W_{R} = konstant',
    },
    en: {
      canvas: 'Roller coaster with a car, a line at the starting height and, depending on the view, energy bars, energy graphs, forces in the loop or a series of measurements',
      pot: 'potential',
      kin: 'kinetic',
      heat: 'heat',
      total: 'total',
      kJ: 'Energy in kJ',
      mass: 'm = {m} kg',
      motion: 'h = {h} m · v = {v} m/s ({kmh} km/h) · t = {t} s',
      energy: '<var>E</var><sub>pot</sub> = <var>m</var> · <var>g</var> · <var>h</var> = {pot} kJ · <var>E</var><sub>kin</sub> = ½ · <var>m</var> · <var>v</var>² = {kin} kJ<br>heat from friction <var>W</var><sub>f</sub> = {heat} kJ · total = <strong>{sum} kJ</strong>',
      vmax: '<var>v</var> = √(2 · <var>g</var> · Δ<var>h</var>) = √(2 · 9.81 m/s² · {dh} m) ≈ <strong>{v} m/s</strong> ({kmh} km/h) at the lowest point',
      loopText: 'needed at the top: <var>v</var><sub>min</sub> = √(<var>g</var> · <var>r</var>) = {vmin} m/s · minimum height without friction 2.5 · <var>r</var> = {hmin} m (<var>r</var> = {r} m)',
      loopTop: '<br>from {h} m: at the top <var>v</var> = √(2<var>g</var>(<var>h</var>₀ − 2<var>r</var>)) ≈ {v} m/s · <var>F</var><sub>g</sub> = {fg} kN, <var>F</var><sub>c</sub> = <var>m</var><var>v</var>²/<var>r</var> = {fz} kN, track <var>F</var><sub>N</sub> = {fn} kN',
      loopLift: '<br>from {h} m: without safety bars the car would fall out at <var>h</var> = (2<var>h</var>₀ + <var>r</var>)/3 ≈ {y} m.',
      loopNone: '<br>from {h} m: the car does not get above the height of the centre – it rolls back.',
      loopFric: '<br>with μ = {mu}: smallest starting height ≈ {h} m',
      goalLoop: 'Without friction: <var>h</var><sub>min</sub> = 2.5 · <var>r</var> = 15 m (at the top <var>v</var>² = <var>g</var> · <var>r</var>).',
      goalHill: 'Without friction any starting height above the hill is enough: <var>h</var>₀ > {y} m.',
      goalFric: ' Computed with μ = {mu}: <var>h</var><sub>min</sub> ≈ <strong>{h} m</strong>.',
      goalNone: ' With μ = {mu} even 26 m is not enough.',
      thH: 'h₀',
      thRes: 'result',
      thV: 'v at top',
      thNr: 'no.',
      thHere: 'h',
      thVel: 'v',
      ok: 'made it',
      fail: 'failed',
      notReached: 'not reached',
      seriesNone: 'No ride yet. Set h₀ and press “Go”.',
      marksNone: 'Tap the track to set measuring points.',
      level: 'starting height h₀ = {h} m',
      turn: 'turning point',
      axisS: 's in m',
      axisT: 't in s',
      axisH: 'h₀ in m',
      tEs: 'Energy along the path s',
      tEt: 'Energy against time t',
      tForces: 'Forces at the top of the loop',
      tSeries: 'Measurements: speed at the top',
      tSeriesHill: 'Measurements: speed on the hill',
      kN: 'F in kN',
      vAxis: 'v in m/s',
      eAxis: 'E in kJ',
      gap: 'E_{kin}',
      lost: 'W_{f}',
      fG: 'F_{g} = m · g',
      fZ: 'F_{c} = m · v² / r',
      hmin: 'h_{min} = 2.5 · r = 15 m',
      hminShort: 'h_{min} = 15 m',
      falls: 'falls out',
      noTop: 'does not get up',
      vmin: 'v_{min} = √(g · r)',
      found: 'Found: h_{min} lies between {lo} m and {hi} m',
      foundTheory: 'Theory without friction: 2.5 · r = 15 m',
      bracketing: 'narrowed down: {lo} m … {hi} m',
      seriesEmpty: 'Each ride appears here as a point.',
      seriesHint: 'Tap here to choose h₀.',
      lift: 'Without safety bars the car would fall out here!',
      liftShort: 'Would fall out!',
      air: 'Airtime: the car would briefly lift off.',
      hMu0: 'μ = 0: the total energy stays constant.',
      hRest: 'Car at rest: {p} % of the initial energy is now heat from friction.',
      hTurn: 'Turning point again exactly at h₀ = {h} m',
      hMass: 'Mass ×{f}: v stays the same, all energies ×{f}',
      hNear: 'Just missed: {d} m too low',
      hFlat: 'The car does not start rolling: the start is too flat.',
      hTal: 'Choose hills, the loop or a custom track with a hill.',
      hLoopTrack: 'This view shows the loop.',
      hPick: 'Set h₀ and press “Go”.',
      hGoalLoop: 'Goal: through the loop without falling out',
      hGoalHill: 'Goal: over the hill ({y} m)',
      clearMarks: 'Clear the measuring points',
      clearSeries: 'Clear the measurements',
      top: 'top: v = {v} m/s',
      topNone: 'top not reached',
      speed: 'v = {v} m/s',
      kmh: '{v} km/h',
      point: 'point {n}',
      start: 'start',
      balance: 'E_{pot} + E_{kin} + W_{f} = constant',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (all: string, k: string) => vars[k] ?? all);
    const n = (v: number, d: number) => fmt.num(v, d);
    const mode = () => p.mode as Mode;
    const trackId = () => p.track as TrackId;
    const customHeights = () => [p.h0, p.p1, p.p2, p.p3, p.p4];
    const C = {
      pot: () => ctx.theme.series[0]!,
      kin: () => ctx.theme.series[3]!,
      heat: () => ctx.theme.series[1]!,
      good: () => ctx.theme.series[2]!,
      mech: () => ctx.theme.series[4]!,
      level: () => ctx.theme.series[5]!,
    };

    /* ---------- Aufteilung der Bühne (gleitet beim Wechsel der Ansicht) ---------- */
    const panelsOf = (m: Mode): PanelKind[] => (m === 'ride' ? (p.bars ? ['bars'] : []) : m === 'energy' ? ['es', 'et'] : m === 'loop' ? ['forces'] : ['series']);
    const wide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const smallChart = (R: Rect) => R.w < 340;
    const splitTarget = () => {
      const m = mode();
      const kinds = panelsOf(m);
      if (!kinds.length) return 1;
      if (wide()) return m === 'ride' ? clamp(1 - 238 / surface.width, 0.6, 0.76) : m === 'energy' ? 0.54 : m === 'loop' ? 0.6 : 0.58;
      return m === 'ride' ? 0.58 : m === 'energy' ? 0.46 : 0.54;
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

    /* ---------- Koordinatensysteme ---------- */
    const scene = new Plot(surface, { x: [-40, 40], y: [-2, 30], pan: false, zoom: false, controls: false, region: () => regions().scene });
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
    let track: Track = placeStart(trackId(), p.h0, customHeights()).track;
    let s0 = 0;
    /** Tatsächliche Starthöhe (auf der Bahn). */
    let startH = p.h0;
    let run: Run = simulate(track, 0, 0, { tMax: 0.1 });
    let t = 0;
    let goal: Goal | null = null;
    /** Profil der Lageenergie pro kg über s (für das Diagramm). */
    let profile: Pt[] = [];
    let bbox = { x0: -40, x1: 40, y1: 28 };
    let oldTrack: Track | null = null;
    let marks: { s: number; pop: Tween }[] = [];
    let series: { h0: number; ok: boolean; v: number | null }[] = [];
    let pending: { h0: number; outcome: Outcome; at: number; v: number | null } | null = null;
    let found = false;
    let threshold: { key: string; h: number | null } | null = null;
    let transient: { text: string; until: number } | null = null;
    let disp = { pot: 0, kin: 0, heat: 0 };
    let view: { x0: number; y0: number; s: number } | null = null;
    let dragging = false;
    let lastFrame = performance.now();
    let hoverKind: string | null = null;

    // Übergänge
    const intro = new Tween(1300, ease.outCubic);
    const fade = new Tween(520, ease.inOutCubic);
    const trackFade = new Tween(650, ease.inOutCubic);
    const resultPop = new Tween(650, ease.outBack);
    const liftPop = new Tween(700, ease.outCubic);
    const turnPop = new Tween(600, ease.outBack);

    /** Zustand der Fahrt zur Zeit t. */
    const now = (): RunSample => sampleAt(run, t);
    const energies = (st: { s: number; v: number; w: number }) => energiesAt(track, st, p.m);
    const e0 = () => p.m * G * startH;

    function compute(): void {
      const placed = placeStart(trackId(), p.h0, customHeights());
      track = placed.track;
      s0 = placed.s0;
      startH = placed.h;
      const mu = p.mu;
      run = simulate(track, s0, mu, { tMax: mu > 0 ? 90 : 24 });
      goal = goalOf(track);
      const step = Math.max(1, Math.floor(track.points.length / 360));
      profile = track.points.filter((_, i) => i % step === 0 || i === track.points.length - 1).map((q) => [q.s, q.y] as Pt);
      fitBox();
    }

    /** Inhalt des sichtbaren Bereichs: ganze Bahn, bei Looping-Ansichten nur Anfahrt und Kreis. */
    function fitBox(): void {
      const f = track.features;
      if ((mode() === 'loop' || mode() === 'task') && f.loopEnd !== undefined) {
        // Looping-Ansicht: nah an den Kreis heran; Aufgabe: Startstelle bleibt sichtbar (zum Ziehen)
        bbox = { x0: track.at(s0).x - 3, x1: mode() === 'loop' ? 13 : 22, y1: Math.max(startH, 2 * LOOP_RADIUS) + 1.5 };
        return;
      }
      const xs = track.points.map((q) => q.x);
      bbox = { x0: Math.min(...xs), x1: Math.max(...xs), y1: Math.max(track.maxHeight, startH) };
    }

    /* ---------- Sichtbarer Bereich (gleiche Einheiten, Boden unten) ---------- */
    function targetView(): { x0: number; y0: number; s: number } {
      const r = scene.rect;
      const small = r.w < 520;
      const PL = small ? 8 : 16;
      const PR = small ? 8 : 16;
      const PT = small ? 58 : 66;
      const PB = small ? 14 : 22;
      const yMin = -0.9;
      const spanX = bbox.x1 - bbox.x0 + 4;
      const spanY = bbox.y1 + 1.2 - yMin;
      const s = Math.max(1e-3, Math.min((r.w - PL - PR) / spanX, (r.h - PT - PB) / spanY));
      const x0 = bbox.x0 - 2 - (r.w - PL - PR - spanX * s) / 2 / s - PL / s;
      return { x0, y0: yMin - PB / s, s };
    }

    function applyView(): void {
      if (!view) return;
      const r = scene.rect;
      scene.setRange([view.x0, view.x0 + r.w / view.s], [view.y0, view.y0 + r.h / view.s]);
    }

    function stepView(dt: number): boolean {
      const target = targetView();
      if (!view || prefersReducedMotion() || dragging) {
        view = target;
        applyView();
        return false;
      }
      const u = 1 - Math.exp(-dt * 7);
      const ls = Math.log(view.s) + (Math.log(target.s) - Math.log(view.s)) * u;
      const pl = -view.x0 * view.s + (-target.x0 * target.s + view.x0 * view.s) * u;
      const pb = -view.y0 * view.s + (-target.y0 * target.s + view.y0 * view.s) * u;
      const s = Math.exp(ls);
      view = { x0: -pl / s, y0: -pb / s, s };
      const done = Math.abs(ls - Math.log(target.s)) < 0.002 && Math.abs(pl + target.x0 * target.s) < 0.3 && Math.abs(pb + target.y0 * target.s) < 0.3;
      if (done) view = target;
      applyView();
      return !done;
    }

    /* ---------- Aufgabe und Grenzwert ---------- */
    const thresholdKey = () => `${trackId()}|${p.mu}|${trackId() === 'eigen' ? customHeights().slice(1).join(',') : ''}`;

    /** Kleinste Starthöhe für das Ziel (mit Reibung numerisch, wird gecacht). */
    function minHeight(): number | null {
      if (!goal) return null;
      const key = thresholdKey();
      if (threshold?.key === key) return threshold.h;
      if (goal === 'loop' && p.mu === 0) threshold = { key, h: loopMinHeight() };
      else {
        const id = trackId();
        const custom = customHeights();
        threshold = { key, h: minStartHeight((h0) => placeStart(id, h0, custom), p.mu, goal) };
      }
      return threshold.h;
    }

    /** Ergebnis der aktuellen Fahrt und der Zeitpunkt, an dem es feststeht. */
    function evaluate(): { outcome: Outcome; at: number; v: number | null } {
      if (!goal) return { outcome: 'none', at: 0, v: null };
      const outcome = judgeRun(track, run, goal);
      const target = goal === 'loop' ? track.features.loopTop! : track.crest!.s;
      const pass = firstPass(run, target);
      if (outcome === 'ok') {
        const end = goal === 'loop' ? firstPass(run, track.features.loopEnd!) : firstPass(run, target + 0.05);
        return { outcome, at: (end ?? pass)?.t ?? run.end, v: pass ? Math.abs(pass.v) : null };
      }
      const at = Math.min(run.liftOff && goal === 'loop' ? run.liftOff.t + 0.6 : Infinity, run.turns[0]?.t ?? Infinity, run.end);
      return { outcome, at, v: null };
    }

    function addResult(): void {
      if (!pending) return;
      const { h0, outcome, v } = pending;
      pending = null;
      if (outcome === 'none') return;
      series = series.filter((q) => Math.abs(q.h0 - h0) > 1e-9);
      series.push({ h0, ok: outcome === 'ok', v });
      const wasFound = found;
      found = bracket(series) !== null;
      if (found && !wasFound) minHeight();
      resultPop.play();
      updateReadouts();
    }

    /* ---------- Ergebnisse ---------- */
    function updateNow(): void {
      const st = now();
      const y = track.at(st.s).y;
      const v = Math.abs(st.v);
      ctx.readout('motion', tr('motion', { h: n(y, 1), v: n(v, 1), kmh: n(v * 3.6, 0), t: fmt.fixed(t, 1) }));
      const e = energies(st);
      const kj = (x: number) => n(x / 1000, 1);
      ctx.readout('energy', { html: tr('energy', { pot: kj(e.pot), kin: kj(e.kin), heat: kj(e.heat), sum: kj(e.total) }) });
    }

    function markValues(s: number): { y: number; pass: RunSample | null } {
      return { y: track.at(s).y, pass: firstPass(run, s) };
    }

    function updateReadouts(): void {
      const m = mode();
      const dh = Math.max(0, startH - track.minHeight);
      const vmax = speedAtHeight(startH, track.minHeight) ?? 0;
      ctx.readout('vmax', { html: tr('vmax', { dh: n(dh, 1), v: n(vmax, 2), kmh: n(vmax * 3.6, 0) }) });
      // Looping
      if (trackId() === 'looping') {
        let html = tr('loopText', { vmin: n(loopMinSpeed(), 2), hmin: n(loopMinHeight(), 1), r: n(LOOP_RADIUS, 0) });
        const f = loopTopForces(p.m, startH);
        const lift = liftOffHeight(startH);
        if (f && f.normal >= 0) html += tr('loopTop', { h: n(startH, 1), v: n(Math.sqrt(2 * G * (startH - 2 * LOOP_RADIUS)), 2), fg: n(f.weight / 1000, 2), fz: n(f.centripetal / 1000, 2), fn: n(f.normal / 1000, 2) });
        else if (lift !== null) html += tr('loopLift', { h: n(startH, 1), y: n(lift, 2) });
        else html += tr('loopNone', { h: n(startH, 1) });
        if (p.mu > 0 && (m === 'loop' || m === 'task')) {
          const hm = minHeight();
          if (hm !== null) html += tr('loopFric', { mu: n(p.mu, 3), h: n(hm, 1) });
        }
        ctx.readout('loop', { html });
      } else ctx.readout('loop', null);
      // Messpunkte
      if (m === 'ride' || m === 'energy') {
        if (!marks.length) ctx.readout('marks', ctx.t('marksNone'));
        else {
          const rows = marks
            .map((mk, i) => {
              const { y, pass } = markValues(mk.s);
              const e = pass ? energies(pass) : null;
              const cells = pass && e ? [`${n(Math.abs(pass.v), 2)} m/s`, `${n(e.pot / 1000, 1)} kJ`, `${n(e.kin / 1000, 1)} kJ`] : [ctx.t('notReached'), '–', '–'];
              return `<tr><td>${i + 1}</td><td>${n(y, 1)} m</td>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`;
            })
            .join('');
          ctx.readout('marks', { html: `<table class="mini-table"><tr><th>${ctx.t('thNr')}</th><th><var>h</var></th><th><var>v</var></th><th><var>E</var><sub>pot</sub></th><th><var>E</var><sub>kin</sub></th></tr>${rows}</table>` });
        }
      } else ctx.readout('marks', null);
      // Messreihe und Theorie
      if (m === 'task') {
        if (!series.length) ctx.readout('series', ctx.t('seriesNone'));
        else {
          const rows = [...series]
            .sort((a, b) => a.h0 - b.h0)
            .map((q) => `<tr><td>${n(q.h0, 1)} m</td><td>${ctx.t(q.ok ? 'ok' : 'fail')}</td><td>${q.v !== null ? `${n(q.v, 2)} m/s` : '–'}</td></tr>`)
            .join('');
          ctx.readout('series', { html: `<table class="mini-table"><tr><th><var>h</var>₀</th><th>${ctx.t('thRes')}</th><th>${ctx.t('thV')}</th></tr>${rows}</table>` });
        }
        if (goal) {
          let html = goal === 'loop' ? ctx.t('goalLoop') : tr('goalHill', { y: n(track.crest!.y, 1) });
          if (p.mu > 0) {
            const hm = minHeight();
            html += hm !== null ? tr('goalFric', { mu: n(p.mu, 3), h: n(hm, 1) }) : tr('goalNone', { mu: n(p.mu, 3) });
          }
          ctx.readout('goal', { html });
        } else ctx.readout('goal', null);
      } else {
        ctx.readout('series', null);
        ctx.readout('goal', null);
      }
      ctx.setAction('clear', { label: ctx.t(m === 'task' ? 'clearSeries' : 'clearMarks'), enabled: !ctx.locked && (m === 'task' ? series.length > 0 : marks.length > 0) });
      updateNow();
    }

    /* ---------- Zeichenhilfen ---------- */
    /** Text mit tiefgestellten Teilen: „E_{pot} = 3 kJ“. */
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

    /** Beschriftung, die innerhalb des Rechtecks r bleibt. */
    function clampedText(str: string, x: number, y: number, size: number, color: string, r: Rect, align: CanvasTextAlign = 'center', weight = 700): void {
      const w = richWidth(str, size, weight);
      let left = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      left = clamp(left, r.x + 6, r.x + r.w - w - 6);
      richText(str, left, clamp(y, r.y + size, r.y + r.h - size), size, color, 'left', true, weight);
    }

    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, solid?: string): { w: number; h: number } {
      const g = surface.g;
      const theme = ctx.theme;
      const w = richWidth(label, size) + 16;
      const h = size + 11;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1;
      g.fillStyle = solid ?? (theme.dark ? 'rgba(16,22,31,0.9)' : 'rgba(255,255,255,0.94)');
      roundRect(g, x0, y, w, h, h / 2);
      g.fill();
      g.restore();
      if (!solid) {
        g.strokeStyle = withAlpha(color, 0.45);
        g.lineWidth = 1;
        roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      richText(label, x0 + w / 2, y + h / 2 + 0.5, size, solid ? '#ffffff' : color, 'center', false);
      return { w, h };
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
      frame(r);
    }

    function frame(r: Rect): void {
      const g = surface.g;
      g.save();
      g.strokeStyle = ctx.theme.dark ? '#273142' : '#dfe4ec';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
      g.restore();
    }

    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 10, dash: number[] = []): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 2) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const h = Math.min(head, len * 0.6);
      g.save();
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.setLineDash(dash);
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1 - ux * h * 0.7, y1 - uy * h * 0.7);
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - ux * h - uy * h * 0.5, y1 - uy * h + ux * h * 0.5);
      g.lineTo(x1 - ux * h + uy * h * 0.5, y1 - uy * h - ux * h * 0.5);
      g.closePath();
      g.fill();
      g.restore();
    }

    function titleChip(R: Rect, label: string, color: string, right?: string, rightColor?: string): void {
      const g = surface.g;
      const small = R.w < 300;
      const fs = small ? 11 : 12;
      const x = R.x + 8;
      const y = R.y + 6;
      const w = richWidth(label, fs) + 14;
      g.fillStyle = ctx.theme.dark ? 'rgba(16,22,31,0.9)' : 'rgba(255,255,255,0.94)';
      roundRect(g, x, y, w, fs + 9, 6);
      g.fill();
      richText(label, x + 7, y + (fs + 9) / 2 + 0.5, fs, color, 'left', false);
      if (right) {
        const wr = richWidth(right, fs - 0.5, 600);
        if (x + w + wr + 16 < R.x + R.w) richText(right, R.x + R.w - 10, y + (fs + 9) / 2 + 0.5, fs - 0.5, rightColor ?? ctx.theme.muted, 'right', false, 600);
      }
    }

    /* ---------- Szene: Himmel, Landschaft, Boden ---------- */
    let landCache: { key: string; canvas: HTMLCanvasElement } | null = null;
    /** Parklandschaft (Foto mit durchsichtigem Himmel), vorab skaliert; im Dunkelmodus abgedunkelt. */
    function landSprite(img: HTMLImageElement, w: number, h: number, dark: boolean): HTMLCanvasElement {
      const key = `${Math.round(w)}|${Math.round(h)}|${surface.dpr}|${dark ? 1 : 0}`;
      if (landCache?.key === key) return landCache.canvas;
      const base = scaledSprite(img, w, h, surface.dpr);
      let canvas = base;
      if (dark) {
        const off = offscreenCanvas(w, h, surface.dpr);
        off.g.drawImage(base, 0, 0, w, h);
        off.g.globalCompositeOperation = 'source-atop';
        off.g.fillStyle = 'rgba(5,10,25,0.5)';
        off.g.fillRect(0, 0, w, h);
        canvas = off.canvas;
      }
      landCache = { key, canvas };
      return canvas;
    }

    function drawBackground(r: Rect): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const groundY = scene.py(-0.6);
      const sky = ctx.images.get('sky');
      const land = ctx.images.get('land');
      if (sky) {
        const k = Math.max(r.w / sky.width, (groundY - r.y) / sky.height);
        const w = sky.width * k;
        const h = sky.height * k;
        g.drawImage(scaledSprite(sky, w, h, surface.dpr), r.x + (r.w - w) / 2, groundY - h, w, h);
        if (dark) {
          g.fillStyle = 'rgba(5,10,25,0.55)';
          g.fillRect(r.x, r.y, r.w, groundY - r.y);
        }
      } else {
        const grad = g.createLinearGradient(0, r.y, 0, groundY);
        grad.addColorStop(0, dark ? '#0f1b30' : '#8cc4f2');
        grad.addColorStop(1, dark ? '#22324d' : '#e6f3ff');
        g.fillStyle = grad;
        g.fillRect(r.x, r.y, r.w, groundY - r.y);
        // ferne Hügel als Ersatz für das Foto
        g.fillStyle = dark ? 'rgba(60,100,70,0.35)' : 'rgba(80,140,90,0.3)';
        g.beginPath();
        g.moveTo(r.x, groundY);
        for (let x = 0; x <= r.w; x += 8) g.lineTo(r.x + x, groundY - 16 - 10 * Math.sin(x / 80) - 6 * Math.sin(x / 27 + 1));
        g.lineTo(r.x + r.w, groundY);
        g.fill();
      }
      if (land) {
        const w = r.w;
        const h = (w * land.height) / land.width;
        g.drawImage(landSprite(land, w, h, dark), r.x, groundY + 6 - h, w, h);
      }
      const ground = g.createLinearGradient(0, groundY, 0, r.y + r.h);
      ground.addColorStop(0, dark ? '#2f4a2a' : '#6db357');
      ground.addColorStop(1, dark ? '#1d2e1a' : '#3f7a33');
      g.fillStyle = ground;
      g.fillRect(r.x, groundY, r.w, r.y + r.h - groundY);
      g.fillStyle = 'rgba(255,255,255,0.18)';
      g.fillRect(r.x, groundY, r.w, 1.5);
    }

    /* ---------- Szene: Bahn ---------- */
    function inLoop(tk: Track, q: { s: number; y: number }): boolean {
      const f = tk.features;
      return f.loopStart !== undefined && q.s > f.loopStart + 0.3 && q.s < f.loopEnd! - 0.3 && q.y > 0.4;
    }

    function drawTrack(tk: Track, alpha: number, reveal: number): void {
      const g = surface.g;
      const pts = tk.points;
      const dark = ctx.theme.dark;
      const sMax = tk.length * reveal;
      const groundY = scene.py(-0.6);
      g.save();
      g.globalAlpha *= alpha;
      // Stützen
      g.strokeStyle = dark ? 'rgba(170,180,195,0.5)' : 'rgba(90,100,115,0.55)';
      g.lineWidth = 2;
      g.lineCap = 'round';
      let nextX = -Infinity;
      for (const q of pts) {
        if (q.s > sMax) break;
        if (q.x < nextX || Math.cos(q.theta) < 0.2 || q.y < 0.3 || inLoop(tk, q)) continue;
        nextX = q.x + 2.6;
        const [px, py] = scene.toPx(q.x, q.y);
        g.beginPath();
        g.moveTo(px, py + 4);
        g.lineTo(px, groundY);
        g.stroke();
      }
      // Schwellen
      g.strokeStyle = dark ? '#8d6e57' : '#6b4b33';
      g.lineWidth = 2.6;
      let nextS = 0;
      for (const q of pts) {
        if (q.s > sMax) break;
        if (q.s < nextS) continue;
        nextS = q.s + Math.max(0.9, 7 / Math.max(1, scene.scale.x));
        const [px, py] = scene.toPx(q.x, q.y);
        const nx = -Math.sin(q.theta);
        const ny = Math.cos(q.theta);
        g.beginPath();
        g.moveTo(px - nx * 5, py + ny * 5);
        g.lineTo(px + nx * 2, py - ny * 2);
        g.stroke();
      }
      // Schienen
      const rail = (offset: number, color: string, width: number) => {
        g.strokeStyle = color;
        g.lineWidth = width;
        g.lineJoin = 'round';
        g.beginPath();
        let first = true;
        for (const q of pts) {
          if (q.s > sMax) break;
          const [px, py] = scene.toPx(q.x, q.y);
          const x = px - Math.sin(q.theta) * offset;
          const y = py - Math.cos(q.theta) * offset;
          if (first) g.moveTo(x, y);
          else g.lineTo(x, y);
          first = false;
        }
        g.stroke();
      };
      rail(-4, dark ? '#c43f3f' : '#b3261e', 4);
      rail(0, dark ? '#e4e8ee' : '#3b4252', 3);
      // Prellböcke
      if (reveal >= 1) {
        for (const q of [pts[0]!, pts[pts.length - 1]!]) {
          const [px, py] = scene.toPx(q.x, q.y);
          g.fillStyle = '#e8b931';
          roundRect(g, px - 4, py - 14, 8, 14, 2);
          g.fill();
        }
      }
      g.restore();
    }

    /** Griffe der eigenen Bahn (Start und Punkte 1–4). */
    function drawSupports(r: Rect): void {
      if (trackId() !== 'eigen') return;
      const g = surface.g;
      const theme = ctx.theme;
      const sup = track.features.supports ?? [];
      const idle = editable();
      const small = r.w < 520;
      sup.forEach((s, i) => {
        if (i === 0) return;
        const q = track.at(s);
        const [px, py] = scene.toPx(q.x, q.y);
        const hot = hoverKind === `sup${i}`;
        g.save();
        g.shadowColor = 'rgba(0,0,0,0.3)';
        g.shadowBlur = 5;
        g.fillStyle = idle ? C.mech() : withAlpha(C.mech(), 0.55);
        g.beginPath();
        g.arc(px, py - 2, hot ? 10 : 8, 0, Math.PI * 2);
        g.fill();
        g.restore();
        g.strokeStyle = '#ffffff';
        g.lineWidth = 2;
        g.beginPath();
        g.arc(px, py - 2, hot ? 10 : 8, 0, Math.PI * 2);
        g.stroke();
        text(g, String(i), px, py - 1.5, { font: `700 11px ${theme.font}`, color: '#ffffff' });
        clampedText(`${n(q.y, 1)} m`, px, py + (q.y > 1.5 ? 20 : -20), small ? 11 : 12, C.mech(), r, 'center');
      });
    }

    /* ---------- Szene: Wagen ---------- */
    function carSize(): { len: number; hgt: number } {
      const len = Math.max(CAR_LENGTH * scene.scale.x * 1.6, scene.rect.w < 520 ? 34 : 44);
      return { len, hgt: len * (CAR_HEIGHT / CAR_LENGTH) };
    }

    function carCenter(s: number): Pt {
      const q = track.at(s);
      const { hgt } = carSize();
      const [px, py] = scene.toPx(q.x, q.y);
      return [px - Math.sin(q.theta) * hgt * 0.5, py - Math.cos(q.theta) * hgt * 0.5];
    }

    function drawCar(s: number, alpha = 1, lift = 0): void {
      const g = surface.g;
      const q = track.at(s);
      const { len, hgt } = carSize();
      const [px, py] = scene.toPx(q.x, q.y);
      g.save();
      g.globalAlpha *= alpha;
      g.translate(px, py - lift);
      g.rotate(-q.theta);
      g.shadowColor = 'rgba(0,0,0,0.3)';
      g.shadowBlur = 6;
      const img = ctx.images.get('car');
      if (img) g.drawImage(scaledSprite(img, len, hgt, surface.dpr), -len / 2, -hgt - 1, len, hgt);
      else {
        const body = g.createLinearGradient(0, -hgt, 0, 0);
        body.addColorStop(0, '#ff6b5e');
        body.addColorStop(1, '#c4271c');
        g.fillStyle = body;
        roundRect(g, -len / 2, -hgt * 0.78, len, hgt * 0.55, hgt * 0.15);
        g.fill();
        g.shadowColor = 'transparent';
        g.fillStyle = '#e8b931';
        g.fillRect(-len * 0.42, -hgt * 0.56, len * 0.84, hgt * 0.06);
        g.strokeStyle = '#2b2f36';
        g.lineWidth = Math.max(1.5, hgt * 0.06);
        for (const x of [-len * 0.22, len * 0.12]) {
          g.beginPath();
          g.arc(x, -hgt * 0.78, hgt * 0.18, Math.PI, Math.PI * 1.9);
          g.stroke();
        }
        g.fillStyle = '#2b2f36';
        for (const x of [-len * 0.3, len * 0.3]) {
          g.beginPath();
          g.arc(x, -hgt * 0.16, hgt * 0.16, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = '#9aa3ad';
          g.beginPath();
          g.arc(x, -hgt * 0.16, hgt * 0.06, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = '#2b2f36';
        }
      }
      g.restore();
    }

    /** Darf man den Wagen bzw. die Bahn gerade verändern? */
    const editable = () => !ctx.locked && !ctx.clock.playing && t === 0;

    function drawVelocity(r: Rect, st: RunSample): void {
      if (!p.vel || Math.abs(st.v) < 0.05) return;
      const q = track.at(st.s);
      const [cx, cy] = carCenter(st.s);
      const k = clamp(Math.min(r.w, r.h) * 0.007, 2.2, 3.6);
      const len = st.v * k;
      const ex = cx + Math.cos(q.theta) * len;
      const ey = cy - Math.sin(q.theta) * len;
      arrowPx(cx, cy, ex, ey, C.kin(), 3.2, 11);
      const small = r.w < 520;
      if (Math.abs(len) > 26) clampedText(tr('speed', { v: n(Math.abs(st.v), 1) }), ex + (len > 0 ? 8 : -8) * Math.sign(Math.cos(q.theta) || 1), ey - 20, small ? 11 : 12, C.kin(), r, len * Math.cos(q.theta) >= 0 ? 'left' : 'right');
    }

    /* ---------- Szene: Starthöhe, Umkehrpunkte, Messpunkte ---------- */
    function drawLevel(r: Rect): void {
      if (!p.level) return;
      const g = surface.g;
      const y = scene.py(startH);
      const mech = e0() > 0 ? 1 - now().w / (G * startH) : 1;
      g.save();
      g.strokeStyle = withAlpha(C.level(), 0.9);
      g.lineWidth = 1.6;
      g.setLineDash([8, 6]);
      g.beginPath();
      g.moveTo(r.x, y);
      g.lineTo(r.x + r.w, y);
      g.stroke();
      // Mit Reibung: erreichbare Höhe (Energie ohne Wärme) als zweite Linie
      if (p.mu > 0 && t > 0 && mech < 0.995) {
        const y2 = scene.py(startH * mech + track.minHeight * (1 - mech));
        g.strokeStyle = withAlpha(C.heat(), 0.7);
        g.setLineDash([3, 5]);
        g.beginPath();
        g.moveTo(r.x, y2);
        g.lineTo(r.x + r.w, y2);
        g.stroke();
      }
      g.restore();
      const small = r.w < 520;
      const lx = mode() === 'loop' || mode() === 'task' ? r.x + r.w * 0.3 : r.x + r.w / 2;
      clampedText(tr('level', { h: n(startH, 1) }), lx, y - 11, small ? 11 : 12, C.level(), r, 'center');
    }

    function drawTurns(r: Rect): void {
      if (mode() === 'task') return;
      const g = surface.g;
      const list = run.turns.filter((q) => q.t <= t + 1e-9).slice(-2);
      list.forEach((q, i) => {
        const last = i === list.length - 1;
        const u = last && turnPop.running ? turnPop.value : 1;
        const p0 = track.at(q.s);
        const [px, py] = scene.toPx(p0.x, p0.y);
        g.save();
        g.fillStyle = C.level();
        g.strokeStyle = '#ffffff';
        g.lineWidth = 1.5;
        g.beginPath();
        g.arc(px, py, 5 * u, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        g.restore();
        if (last && r.w > 360) clampedText(`${ctx.t('turn')} ${n(q.y, 1)} m`, px, py - 50, 11, C.level(), r, 'center', 600);
      });
    }

    function drawMarks(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const small = r.w < 520;
      marks.forEach((mk, i) => {
        const u = mk.pop.running ? mk.pop.value : 1;
        const q = track.at(mk.s);
        const [px, py] = scene.toPx(q.x, q.y);
        const nx = -Math.sin(q.theta);
        const ny = -Math.cos(q.theta);
        const off = 26 * u;
        const hx = px + nx * off;
        const hy = py + ny * off;
        g.save();
        g.strokeStyle = withAlpha(theme.text, 0.7);
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(px, py);
        g.lineTo(hx, hy);
        g.stroke();
        g.fillStyle = theme.text;
        g.beginPath();
        g.arc(px, py, 3, 0, Math.PI * 2);
        g.fill();
        g.shadowColor = 'rgba(0,0,0,0.3)';
        g.shadowBlur = 5;
        g.fillStyle = theme.dark ? '#e6eaf0' : '#2b3340';
        g.beginPath();
        g.arc(hx, hy, 9 * u, 0, Math.PI * 2);
        g.fill();
        g.restore();
        text(g, String(i + 1), hx, hy + 0.5, { font: `700 11px ${theme.font}`, color: theme.dark ? '#16202c' : '#ffffff' });
        // Kärtchen mit h und v (auf schmalen Bühnen nur in der Tabelle)
        if (small || u < 0.6) return;
        const { y, pass } = markValues(mk.s);
        const line1 = `h = ${n(y, 1)} m`;
        const line2 = pass ? `v = ${n(Math.abs(pass.v), 1)} m/s` : ctx.t('notReached');
        g.font = `600 11.5px ${theme.font}`;
        const w = Math.max(g.measureText(line1).width, g.measureText(line2).width) + 16;
        const h = 36;
        const left = hx > r.x + r.w - w - 24;
        const bx = clamp(left ? hx - 14 - w : hx + 14, r.x + 6, r.x + r.w - w - 6);
        const by = clamp(hy - h / 2, r.y + 60, r.y + r.h - h - 6);
        g.save();
        g.globalAlpha *= clamp((u - 0.6) / 0.4, 0, 1);
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
        g.shadowBlur = 6;
        g.fillStyle = theme.dark ? 'rgba(16,22,31,0.9)' : 'rgba(255,255,255,0.94)';
        roundRect(g, bx, by, w, h, 8);
        g.fill();
        g.restore();
        text(g, line1, bx + 8, by + 11, { font: `600 11.5px ${theme.font}`, color: C.pot(), align: 'left' });
        text(g, line2, bx + 8, by + 25, { font: `600 11.5px ${theme.font}`, color: pass ? C.kin() : theme.muted, align: 'left' });
      });
    }

    /* ---------- Szene: Looping (Kräfte, Abheben, Wurfparabel) ---------- */
    function drawLoopForces(r: Rect, st: RunSample): void {
      if (mode() !== 'loop' || !track.features.loopStart) return;
      const q = track.at(st.s);
      if (!inLoop(track, { s: st.s, y: q.y })) return;
      const [cx, cy] = carCenter(st.s);
      const kpx = 26 / (G * p.m);
      const nAcc = normalAcceleration(track, st.s, st.v, G);
      const small = r.w < 520;
      const fs = small ? 11 : 12;
      // Gewichtskraft nach unten
      arrowPx(cx, cy, cx, cy + G * p.m * kpx, C.good(), 3, 10);
      clampedText('F_{G}', cx + 8, cy + G * p.m * kpx - 4, fs, C.good(), r, 'left');
      // Kraft der Schiene: zum Mittelpunkt (senkrecht zur Bahn)
      const nx = -Math.sin(q.theta);
      const ny = -Math.cos(q.theta);
      const fn = Math.max(-2.5 * G, Math.min(3.5 * G, nAcc)) * p.m * kpx;
      if (Math.abs(fn) > 2) {
        const ex = cx + nx * fn;
        const ey = cy + ny * fn;
        arrowPx(cx, cy, ex, ey, nAcc >= 0 ? C.pot() : C.heat(), 3, 10, nAcc >= 0 ? [] : [5, 4]);
        clampedText('F_{N}', ex + nx * 12, ey + ny * 12, fs, nAcc >= 0 ? C.pot() : C.heat(), r, 'center');
      }
    }

    function drawLiftOff(r: Rect): void {
      const lo = run.liftOff;
      if (!lo || t < lo.t || !track.features.loopStart) return;
      const g = surface.g;
      const u = liftPop.running ? liftPop.value : 1;
      const [px, py] = scene.toPx(lo.x, lo.y);
      // Wurfparabel ohne Sicherung (bis zum Boden bzw. höchstens 2 s)
      const pts: Pt[] = [];
      for (let k = 0; k <= 60; k++) {
        const tt = (2 * k * u) / 60;
        const x = lo.x + lo.vx * tt;
        const y = lo.y + lo.vy * tt - 0.5 * G * tt * tt;
        pts.push([x, y]);
        if (y < 0) break;
      }
      g.save();
      g.strokeStyle = withAlpha(C.heat(), 0.85);
      g.lineWidth = 2.4;
      g.setLineDash([6, 5]);
      g.beginPath();
      pts.forEach(([x, y], i) => (i ? g.lineTo(scene.px(x), scene.py(Math.max(0, y))) : g.moveTo(scene.px(x), scene.py(y))));
      g.stroke();
      g.setLineDash([]);
      g.strokeStyle = C.heat();
      g.lineWidth = 2.5;
      g.beginPath();
      g.arc(px, py, 7 + 10 * (1 - u), 0, Math.PI * 2);
      g.stroke();
      g.restore();
      clampedText(`h = ${n(lo.y, 1)} m`, px + 12, py - 12, r.w < 520 ? 11 : 12, C.heat(), r, 'left');
    }

    /** Ziel der Aufgabe bzw. höchster Punkt des Loopings mit Geschwindigkeit. */
    function drawTopFlag(r: Rect): void {
      const m = mode();
      if (m !== 'loop' && m !== 'task') return;
      const target = goal === 'loop' ? track.features.loopTop : goal === 'hill' ? track.crest?.s : undefined;
      if (target === undefined) return;
      const q = track.at(target);
      const [px, py] = scene.toPx(q.x, q.y);
      const g = surface.g;
      const small = r.w < 520;
      // Fahne
      g.save();
      g.strokeStyle = ctx.theme.text;
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(px, py - 4);
      g.lineTo(px, py - 30);
      g.stroke();
      g.fillStyle = C.good();
      g.beginPath();
      g.moveTo(px, py - 30);
      g.lineTo(px + 14, py - 25);
      g.lineTo(px, py - 20);
      g.closePath();
      g.fill();
      g.restore();
      if (m === 'loop') {
        const pass = firstPass(run, target);
        const reached = pass && t >= pass.t && (!run.liftOff || run.liftOff.t > pass.t);
        const label = reached ? tr('top', { v: n(Math.abs(pass.v), 2) }) : t > 0 && (run.liftOff ? t >= run.liftOff.t : run.turns[0] && t >= run.turns[0].t) ? ctx.t('topNone') : `v_{min} = ${n(loopMinSpeed(), 2)} m/s`;
        clampedText(label, px, py - 42, small ? 11 : 12, reached ? C.good() : ctx.theme.text, r, 'center');
      }
    }

    /* ---------- Szene: Anzeigen ---------- */
    function hints(st: RunSample): { text: string; color: string; solid?: boolean }[] {
      const out: { text: string; color: string; solid?: boolean }[] = [];
      const theme = ctx.theme;
      const m = mode();
      const nowMs = performance.now();
      if (transient && transient.until > nowMs) out.push({ text: transient.text, color: theme.series[4]! });
      if (run.liftOff && t >= run.liftOff.t) {
        if (track.features.loopStart) out.push({ text: ctx.t(scene.rect.w < 560 ? 'liftShort' : 'lift'), color: C.heat(), solid: true });
        else if (t < run.liftOff.t + 2.5) out.push({ text: ctx.t('air'), color: theme.series[4]! });
      }
      if (m === 'task' && !goal) out.push({ text: ctx.t('hTal'), color: theme.series[4]! });
      if (run.samples.length > 3 && run.samples.every((q) => q.v === 0)) out.push({ text: ctx.t('hFlat'), color: theme.series[4]! });
      else if (run.rest && t >= run.end - 1e-9 && p.mu > 0) {
        const share = now().w / Math.max(1e-9, G * startH);
        out.push({ text: tr('hRest', { p: n(Math.min(100, share * 100), 0) }), color: C.heat() });
      }
      // Looping knapp verfehlt
      if (goal === 'loop' && (m === 'loop' || m === 'task') && run.liftOff && t >= run.liftOff.t) {
        const hm = p.mu === 0 ? loopMinHeight() : threshold?.key === thresholdKey() ? threshold.h : null;
        if (hm !== null && hm - startH > 0 && hm - startH <= 1.5) out.push({ text: tr('hNear', { d: n(hm - startH, 1) }), color: C.heat() });
      }
      // Umkehrpunkt ohne Reibung
      const turn = run.turns.filter((q) => q.t <= t).pop();
      if (p.mu === 0 && turn && t - turn.t < 2 && !run.liftOff && m !== 'task') out.push({ text: tr('hTurn', { h: n(turn.y, 1) }), color: C.level() });
      if (!out.length && p.mu === 0 && m !== 'task' && st.s >= 0) out.push({ text: ctx.t('hMu0'), color: theme.muted });
      if (m === 'task' && goal && !out.length && t === 0) out.push({ text: goal === 'loop' ? ctx.t('hGoalLoop') : tr('hGoalHill', { y: n(track.crest!.y, 1) }), color: C.good() });
      return out.slice(0, 2);
    }

    function drawChips(r: Rect, st: RunSample): void {
      const theme = ctx.theme;
      const small = r.w < 520;
      const size = small ? 11 : 12;
      const v = Math.abs(st.v);
      const tw = pill(r.x + 8, r.y + 8, `t = ${fmt.fixed(t, 1)} s`, theme.text, 'left', size).w;
      pill(r.x + 8 + tw + 6, r.y + 8, `v = ${n(v, 1)} m/s${small ? '' : ` · ${tr('kmh', { v: n(v * 3.6, 0) })}`}`, C.kin(), 'left', size);
      pill(r.x + r.w - 8, r.y + 8, `μ = ${n(p.mu, 3)}`, p.mu > 0 ? C.heat() : theme.text, 'right', size);
      const list = hints(st);
      const row = size + 17;
      list.forEach((h, i) => {
        const g = surface.g;
        const pop = i === 0 && h.solid && liftPop.running ? 0.85 + 0.15 * liftPop.value : 1;
        g.save();
        const cx = r.x + r.w / 2;
        const cy = r.y + 8 + row * (i + 1);
        g.translate(cx, cy);
        g.scale(pop, pop);
        const maxW = r.w - 20;
        const label = richWidth(h.text, size) + 16 > maxW ? h.text.slice(0, Math.max(8, Math.floor((h.text.length * maxW) / (richWidth(h.text, size) + 16)) - 2)) + '…' : h.text;
        pill(0, 0, label, h.color, 'center', size, h.solid ? h.color : undefined);
        g.restore();
      });
    }

    function drawScene(r: Rect): void {
      const theme = ctx.theme;
      const g = scene.begin();
      g.save();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      drawBackground(r);
      const st = now();
      const reveal = intro.running ? clamp(intro.value * 1.25, 0, 1) : 1;
      if (oldTrack && trackFade.running) drawTrack(oldTrack, 1 - trackFade.value, 1);
      drawLevel(r);
      drawTrack(track, trackFade.running ? trackFade.value : 1, reveal);
      drawSupports(r);
      drawTurns(r);
      drawLiftOff(r);
      drawTopFlag(r);
      if (mode() === 'ride' || mode() === 'energy') drawMarks(r);
      // Wagen: fällt beim Laden sanft auf die Schiene
      const drop = intro.running ? (1 - ease.outBack(clamp((intro.t - 0.35) / 0.65, 0, 1))) * 40 : 0;
      const carAlpha = intro.running ? clamp((intro.t - 0.3) / 0.3, 0, 1) : 1;
      if (editable() && (hoverKind === 'cart' || hoverKind === 'sup0')) {
        const [cx, cy] = carCenter(st.s);
        g.save();
        g.strokeStyle = withAlpha(theme.series[3]!, 0.7);
        g.lineWidth = 2;
        g.setLineDash([4, 4]);
        g.beginPath();
        g.arc(cx, cy, carSize().len * 0.62, 0, Math.PI * 2);
        g.stroke();
        g.restore();
      }
      drawCar(st.s, carAlpha, drop);
      if (!intro.running) {
        drawVelocity(r, st);
        drawLoopForces(r, st);
      }
      drawChips(r, st);
      g.restore();
      scene.end();
      g.strokeStyle = theme.dark ? '#273142' : '#dfe4ec';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
    }

    /* ---------- Feld: Energie-Säulen und Tacho ---------- */
    function drawSpeedometer(cx: number, cy: number, rad: number, v: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const vmax = Math.max(10, Math.sqrt(2 * G * Math.max(1, startH - track.minHeight)) * 3.6);
      const max = Math.ceil(vmax / 20) * 20;
      const kmh = v * 3.6;
      const a0 = Math.PI * 0.75;
      const a1 = Math.PI * 2.25;
      g.save();
      g.strokeStyle = withAlpha(theme.muted, 0.35);
      g.lineWidth = 6;
      g.lineCap = 'round';
      g.beginPath();
      g.arc(cx, cy, rad, a0, a1);
      g.stroke();
      g.strokeStyle = C.kin();
      g.beginPath();
      g.arc(cx, cy, rad, a0, a0 + ((a1 - a0) * Math.min(kmh, max)) / max);
      g.stroke();
      const stepK = rad < 50 ? (max > 80 ? 40 : 20) : max > 80 ? 20 : 10;
      for (let k = 0; k <= max; k += stepK) {
        const a = a0 + ((a1 - a0) * k) / max;
        text(g, String(k), cx + Math.cos(a) * (rad - 15), cy + Math.sin(a) * (rad - 15), { font: `600 11px ${theme.font}`, color: theme.muted });
      }
      const a = a0 + ((a1 - a0) * Math.min(kmh, max)) / max;
      g.strokeStyle = theme.text;
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(cx + Math.cos(a) * (rad - 6), cy + Math.sin(a) * (rad - 6));
      g.stroke();
      g.fillStyle = theme.text;
      g.beginPath();
      g.arc(cx, cy, 4, 0, Math.PI * 2);
      g.fill();
      g.restore();
      text(g, `${n(kmh, 0)} km/h`, cx, cy + rad * 0.72, { font: `700 13px ${theme.font}`, color: theme.text });
    }

    function drawBars(R: Rect, alpha: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= alpha;
      card(R);
      const grow = intro.running ? ease.outCubic(clamp((intro.t - 0.2) / 0.8, 0, 1)) : 1;
      const E0 = Math.max(1, e0());
      const items: [string, string, number, string][] = [
        ['E_{pot}', ctx.t('pot'), disp.pot * grow, C.pot()],
        ['E_{kin}', ctx.t('kin'), disp.kin * grow, C.kin()],
        [ctx.lang === 'de' ? 'W_{R}' : 'W_{f}', ctx.t('heat'), disp.heat * grow, C.heat()],
      ];
      const sum = items.reduce((a, q) => a + q[2], 0);
      const vertical = R.h > R.w * 0.85;
      const pad = 14;
      richText(ctx.t('kJ'), R.x + pad, R.y + 18, 12.5, theme.text, 'left', false);
      richText(tr('mass', { m: n(p.m, 0) }), R.x + R.w - pad, R.y + 18, 12, theme.muted, 'right', false, 600);
      if (vertical) {
        let top = R.y + 40;
        if (R.h > 400 && R.w >= 200) {
          const rad = Math.min(58, (R.h - 300) / 2.4, R.w * 0.26);
          drawSpeedometer(R.x + R.w / 2, top + rad + 4, rad, Math.abs(now().v));
          top += rad * 2 + 26;
        }
        const bottom = R.y + R.h - 46;
        const slot = (R.w - pad * 2) / 4;
        const barW = Math.min(40, slot * 0.6);
        const hgt = (v: number) => ((bottom - top - 22) * Math.max(0, v)) / E0;
        // Linie der Anfangsenergie
        const yTop = bottom - hgt(E0);
        g.strokeStyle = withAlpha(theme.text, 0.35);
        g.setLineDash([4, 4]);
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(R.x + pad, yTop);
        g.lineTo(R.x + R.w - pad, yTop);
        g.stroke();
        g.setLineDash([]);
        items.forEach(([sym, word, value, color], i) => {
          const x = R.x + pad + slot * i + (slot - barW) / 2;
          const h = hgt(value);
          const grad = g.createLinearGradient(x, 0, x + barW, 0);
          grad.addColorStop(0, color);
          grad.addColorStop(1, withAlpha(color, 0.75));
          g.fillStyle = grad;
          roundRect(g, x, bottom - h, barW, Math.max(1, h), 4);
          g.fill();
          text(g, n(value / 1000, 1), x + barW / 2, bottom - h - 10, { font: `700 12px ${theme.font}`, color: theme.text });
          richText(sym, x + barW / 2, bottom + 14, 12.5, color, 'center', false);
          g.font = `600 11px ${theme.font}`;
          if (g.measureText(word).width < slot - 4) text(g, word, x + barW / 2, bottom + 31, { font: `600 11px ${theme.font}`, color: theme.muted });
        });
        // Gesamtsäule (gestapelt)
        const x = R.x + pad + slot * 3 + (slot - barW) / 2;
        let y = bottom;
        for (const [, , value, color] of items) {
          const h = hgt(value);
          g.fillStyle = color;
          g.fillRect(x, y - h, barW, h);
          y -= h;
        }
        g.strokeStyle = theme.text;
        g.lineWidth = 1.4;
        g.strokeRect(x + 0.5, yTop + 0.5, barW - 1, bottom - yTop);
        text(g, n(sum / 1000, 1), x + barW / 2, yTop - 10, { font: `700 12px ${theme.font}`, color: theme.text });
        text(g, ctx.t('total'), x + barW / 2, bottom + 14, { font: `700 12px ${theme.font}`, color: theme.text });
        g.strokeStyle = theme.axis;
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(R.x + pad, bottom + 0.5);
        g.lineTo(R.x + R.w - pad, bottom + 0.5);
        g.stroke();
      } else {
        // waagerechte Balken (Handy)
        const rows = [...items, ['Σ', ctx.t('total'), sum, theme.text] as [string, string, number, string]];
        const y0 = R.y + 32;
        const rowH = Math.min(32, (R.h - 64) / rows.length);
        const labelW = 52;
        const valW = 64;
        const bx = R.x + pad + labelW;
        const bw = R.w - pad * 2 - labelW - valW;
        rows.forEach(([sym, , value, color], i) => {
          const y = y0 + i * rowH;
          richText(sym, bx - 8, y + rowH / 2, 12, color, 'right', false);
          g.fillStyle = withAlpha(theme.muted, 0.13);
          roundRect(g, bx, y + 4, bw, rowH - 8, 4);
          g.fill();
          if (i < 3) {
            g.fillStyle = color;
            roundRect(g, bx, y + 4, Math.max(0, Math.min(bw, (value / E0) * bw)), rowH - 8, 4);
            g.fill();
          } else {
            let x = bx;
            g.save();
            roundRect(g, bx, y + 4, bw, rowH - 8, 4);
            g.clip();
            for (const [, , v2, c2] of items) {
              const w = (v2 / E0) * bw;
              g.fillStyle = c2;
              g.fillRect(x, y + 4, w, rowH - 8);
              x += w;
            }
            g.restore();
          }
          text(g, `${n(value / 1000, 1)} kJ`, bx + bw + 6, y + rowH / 2, { font: `${i === 3 ? 700 : 600} 12px ${theme.font}`, color: theme.text, align: 'left' });
        });
        // Bilanz und Tempo unter den Balken
        const yb = y0 + rows.length * rowH + 16;
        if (yb < R.y + R.h - 10) {
          richText(ctx.t('balance'), R.x + pad, yb, 12, theme.muted, 'left', false, 600);
          richText(tr('kmh', { v: n(Math.abs(now().v) * 3.6, 0) }), R.x + R.w - pad, yb, 12, C.kin(), 'right', false);
        }
      }
      g.restore();
    }

    /* ---------- Diagramme ---------- */
    function chartPad(R: Rect): { left: number; right: number; top: number; bottom: number } {
      const small = R.w < 300;
      return { left: small ? 38 : 46, right: small ? 12 : 16, top: small ? 32 : 36, bottom: small ? 24 : 28 };
    }

    /** Energie über dem Weg s: Lageenergie als „Energieberg“, waagerechte Linie der Gesamtenergie. */
    function drawEsChart(plot: Plot, R: Rect): void {
      const theme = ctx.theme;
      const mg = (p.m * G) / 1000;
      const st = now();
      const e = energies(st);
      const top = niceTop(mg * Math.max(bbox.y1, startH) * 1.02);
      plot.setAxes({ x: { label: ctx.t('axisS') } });
      plot.setRangePadded([0, track.length], [0, top], chartPad(R));
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const potPts = profile.map(([s, y]) => [s, y * mg] as Pt);
      plot.polygon([[0, 0], ...potPts, [track.length, 0]], { fill: withAlpha(C.pot(), 0.16) });
      plot.polyline(potPts, { color: C.pot(), width: 2.4 });
      const E0 = e0() / 1000;
      // Anfangsenergie und momentane mechanische Energie
      plot.hline(E0, { color: theme.text, width: 1.4, dash: [6, 5], alpha: 0.7 });
      const mech = (e.pot + e.kin) / 1000;
      // Verlauf der mechanischen Energie bis jetzt (mit Reibung: Treppe nach unten)
      if (p.mu > 0 && t > 0) {
        const pts: Pt[] = [];
        for (const q of run.samples) {
          if (q.t > t) break;
          const ee = energies(q);
          pts.push([q.s, (ee.pot + ee.kin) / 1000]);
        }
        plot.polyline(pts, { color: C.mech(), width: 1.6, alpha: 0.75 });
      }
      plot.hline(mech, { color: C.mech(), width: 1.8, alpha: 0.85 });
      // Klammern: E_kin (zwischen Berg und Linie) und Reibungswärme (darüber)
      const potNow = e.pot / 1000;
      plot.segment([st.s, potNow], [st.s, mech], { color: C.kin(), width: 4 });
      if (E0 - mech > top * 0.01) plot.segment([st.s, mech], [st.s, E0], { color: C.heat(), width: 4, alpha: 0.85 });
      // Messpunkte
      marks.forEach((mk, i) => {
        plot.vline(mk.s, { color: theme.text, width: 1, dash: [2, 4], alpha: 0.6 });
        plot.text(mk.s, top, String(i + 1), { color: theme.text, size: 11, weight: 'bold', align: 'center', offset: [0, 10] });
      });
      plot.point(st.s, potNow, { color: C.pot(), radius: 5 });
      plot.point(st.s, mech, { color: C.mech(), radius: 4.5 });
      plot.end();
      const small = R.w < 300;
      const px = plot.px(st.s);
      const lx = px + 8 < R.x + R.w - 70 ? px + 8 : px - 8;
      const al: CanvasTextAlign = px + 8 < R.x + R.w - 70 ? 'left' : 'right';
      if (Math.abs(plot.py(mech) - plot.py(potNow)) > 18) richText(ctx.t('gap'), lx, (plot.py(mech) + plot.py(potNow)) / 2, small ? 11 : 12, C.kin(), al);
      if (Math.abs(plot.py(E0) - plot.py(mech)) > 18) richText(ctx.t('lost'), lx, (plot.py(E0) + plot.py(mech)) / 2, small ? 11 : 12, C.heat(), al);
      titleChip(R, ctx.t('tEs'), theme.text, ctx.t('eAxis'));
      frame(R);
    }

    /** Energie über der Zeit: gestapelte Bänder E_pot, E_kin, W_R – oben immer E₀. */
    function drawEtChart(plot: Plot, R: Rect): void {
      const theme = ctx.theme;
      const W = Math.max(0.5, Math.min(run.end, 24));
      const t0 = clamp(t - 0.8 * W, 0, Math.max(0, run.end - W));
      const T = t0 + W;
      const E0 = e0() / 1000;
      plot.setAxes({ x: { label: ctx.t('axisT') } });
      plot.setRangePadded([t0, T], [0, niceTop(E0)], chartPad(R));
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const stepN = Math.max(1, Math.floor((run.samples.length * Math.min(1, W / Math.max(run.end, 1e-9))) / 420));
      const list = run.samples.filter((q, i) => q.t >= t0 - 0.1 && q.t <= T + 0.1 && (i % stepN === 0 || i === run.samples.length - 1));
      const layers = list.map((q) => {
        const e = energies(q);
        return { t: q.t, a: e.pot / 1000, b: (e.pot + e.kin) / 1000, c: e.total / 1000 };
      });
      const band = (lo: (q: (typeof layers)[0]) => number, hi: (q: (typeof layers)[0]) => number, color: string, from: number, to: number, alpha: number) => {
        const part = layers.filter((q) => q.t >= from - 1e-9 && q.t <= to + 1e-9);
        if (part.length < 2) return;
        plot.polygon([...part.map((q) => [q.t, hi(q)] as Pt), ...part.reverse().map((q) => [q.t, lo(q)] as Pt)], { fill: color, alpha });
      };
      const reveal = fade.running ? fade.value : 1;
      const cut = Math.min(t, T);
      for (const [from, to, alpha] of [
        [cut, T, 0.1],
        [0, cut, 0.85],
      ] as const) {
        band(() => 0, (q) => q.a, C.pot(), from, to, alpha * reveal);
        band((q) => q.a, (q) => q.b, C.kin(), from, to, alpha * reveal);
        band((q) => q.b, (q) => q.c, C.heat(), from, to, alpha * reveal);
      }
      plot.hline(E0, { color: theme.text, width: 1.6, dash: [6, 4], alpha: 0.8 });
      plot.vline(cut, { color: theme.text, width: 1.6, alpha: 0.55 });
      const e = energies(now());
      plot.point(cut, e.pot / 1000, { color: C.pot(), radius: 4 });
      plot.point(cut, (e.pot + e.kin) / 1000, { color: C.kin(), radius: 4 });
      plot.end();
      const small = R.w < 300;
      // Legende rechts im Titel
      titleChip(R, ctx.t('tEt'), theme.text, small ? undefined : `${ctx.t('total')} = ${n(e.total / 1000, 1)} kJ`, theme.text);
      const lg = [
        ['E_{pot}', C.pot()],
        ['E_{kin}', C.kin()],
        [ctx.lang === 'de' ? 'W_{R}' : 'W_{f}', C.heat()],
      ] as const;
      let lx = plot.px(t0) + 8;
      const ly = R.y + 44;
      if (R.h > 150)
        for (const [label, color] of lg) {
          const g = surface.g;
          g.fillStyle = color;
          roundRect(g, lx, ly - 5, 10, 10, 2);
          g.fill();
          lx += 14 + richText(label, lx + 14, ly, 11.5, theme.text, 'left') + 12;
        }
      frame(R);
    }

    /** Kräfte im höchsten Punkt in Abhängigkeit von der Starthöhe (ohne Reibung). */
    function drawForcesChart(plot: Plot, R: Rect): void {
      const theme = ctx.theme;
      const r = LOOP_RADIUS;
      const fG = (p.m * G) / 1000;
      const fZ = (h0: number) => (h0 >= 2 * r ? (p.m * 2 * G * (h0 - 2 * r)) / r / 1000 : NaN);
      const top = niceTop(Math.max(fZ(26), fG * 1.4));
      plot.setAxes({ x: { label: ctx.t('axisH') } });
      plot.setRangePadded([0, 26], [0, top], { ...chartPad(R), top: smallChart(R) ? 56 : chartPad(R).top });
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const hmin = loopMinHeight();
      // Bereiche: kommt nicht hoch / fällt heraus
      plot.polygon(
        [
          [2 * r, 0],
          [hmin, 0],
          [hmin, top],
          [2 * r, top],
        ],
        { fill: withAlpha(C.heat(), 0.12) },
      );
      plot.polygon(
        [
          [0, 0],
          [2 * r, 0],
          [2 * r, top],
          [0, top],
        ],
        { fill: withAlpha(theme.muted, 0.1) },
      );
      plot.hline(fG, { color: C.good(), width: 2.6 });
      const pts: Pt[] = [];
      for (let h = 2 * r; h <= 26.001; h += 0.25) pts.push([h, fZ(h)]);
      plot.polyline(pts, { color: C.heat(), width: 2.8 });
      plot.segment([hmin, 0], [hmin, fG], { color: theme.text, width: 1.2, dash: [4, 4] });
      plot.point(hmin, fG, { color: theme.text, radius: 4.5, hollow: true });
      const h0 = startH;
      plot.vline(h0, { color: C.level(), width: 1.6, alpha: 0.7 });
      plot.point(h0, fG, { color: C.good(), radius: 5 });
      if (h0 >= 2 * r) plot.point(h0, fZ(h0), { color: C.heat(), radius: 5.5 });
      plot.end();
      const small = smallChart(R);
      const fs = small ? 11 : 12;
      // Beschriftungen
      const gy = plot.py(fG);
      richText(ctx.t('fG'), plot.px(26) - 4, gy + 14, fs, C.good(), 'right');
      const zx = plot.px(22);
      richText(ctx.t('fZ'), zx - 6, plot.py(fZ(22)) - 12, fs, C.heat(), 'right');
      richText(ctx.t(small ? 'hminShort' : 'hmin'), plot.px(hmin) + 6, plot.py(fG) - 34, fs, theme.text, 'left');
      const midY = plot.py(top * 0.82);
      if (plot.px(2 * r) - plot.px(0) > 70) richText(ctx.t('noTop'), (plot.px(0) + plot.px(2 * r)) / 2, midY, 11, theme.muted, 'center', true, 600);
      if (plot.px(hmin) - plot.px(2 * r) > 46) {
        const g = surface.g;
        g.save();
        g.translate((plot.px(2 * r) + plot.px(hmin)) / 2, midY);
        g.rotate(-Math.PI / 2);
        richText(ctx.t('falls'), 0, 0, 11, C.heat(), 'center', true, 600);
        g.restore();
      }
      const f = loopTopForces(p.m, h0);
      const right = f ? `h₀ = ${n(h0, 1)} m: ${n(f.centripetal / 1000, 1)} kN ${f.normal >= 0 ? '≥' : '<'} ${n(f.weight / 1000, 1)} kN` : `h₀ = ${n(h0, 1)} m`;
      titleChip(R, ctx.t('tForces'), theme.text, small ? undefined : right, f && f.normal >= 0 ? C.good() : C.heat());
      if (small) richText(right, R.x + 14, R.y + 36, 11, f && f.normal >= 0 ? C.good() : C.heat(), 'left', true, 600);
      frame(R);
    }

    /** Messreihe der Entdeckungsaufgabe: Starthöhe → Geschwindigkeit am Ziel (Misserfolg: Kreuz bei 0). */
    function drawSeriesChart(plot: Plot, R: Rect): void {
      const theme = ctx.theme;
      const small = R.w < 300;
      const fs = small ? 11 : 12;
      const goalY = goal === 'loop' ? 2 * LOOP_RADIUS : (track.crest?.y ?? 0);
      const vTop = Math.sqrt(2 * G * Math.max(0, 26 - goalY));
      const top = niceTop(Math.max(vTop, goal === 'loop' ? loopMinSpeed() * 1.4 : 4, ...series.map((q) => q.v ?? 0)));
      plot.setAxes({ x: { label: ctx.t('axisH') } });
      plot.setRangePadded([0, 26], [0, top], chartPad(R));
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const br = bracket(series);
      if (br) plot.polygon([[br.lo, 0], [br.hi, 0], [br.hi, top], [br.lo, top]], { fill: withAlpha(C.good(), 0.18) });
      if (goal === 'loop') {
        plot.hline(loopMinSpeed(), { color: theme.text, width: 1.2, dash: [5, 4], alpha: 0.7 });
        if (!small) richText(`v_{min} = ${n(loopMinSpeed(), 2)} m/s`, plot.px(0.6), plot.py(loopMinSpeed()) - 10, 11, theme.text, 'left', true, 600);
      }
      // Theorie erst nach dem Eingrenzen
      if (found && goal) {
        const hm = goal === 'loop' ? loopMinHeight() : goalY;
        const pts: Pt[] = [];
        for (let h = hm; h <= 26.001; h += 0.25) pts.push([h, Math.sqrt(2 * G * (h - goalY))]);
        plot.polyline(pts, { color: C.good(), width: 2, dash: [6, 4], alpha: 0.8 });
      }
      plot.vline(startH, { color: C.level(), width: 1.5, alpha: 0.6 });
      series.forEach((q, i) => {
        const last = i === series.length - 1;
        const u = last && resultPop.running ? resultPop.value : 1;
        if (q.ok) plot.point(q.h0, q.v ?? 0, { color: C.good(), radius: 5.5 * u });
        else {
          const [x, y] = plot.toPx(q.h0, 0);
          const g = surface.g;
          const k = 5 * u;
          g.strokeStyle = C.heat();
          g.lineWidth = 2.6;
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(x - k, y - k - 6);
          g.lineTo(x + k, y + k - 6);
          g.moveTo(x + k, y - k - 6);
          g.lineTo(x - k, y + k - 6);
          g.stroke();
        }
      });
      plot.end();
      const title = ctx.t(goal === 'hill' ? 'tSeriesHill' : 'tSeries');
      const lo = br ? tr('bracketing', { lo: n(br.lo, 1), hi: n(br.hi, 1) }) : undefined;
      titleChip(R, title, theme.text, small ? undefined : lo, C.good());
      if (!series.length) {
        const cx = R.x + R.w / 2;
        richText(ctx.t('seriesEmpty'), cx, R.y + R.h * 0.45, fs, theme.muted, 'center', true, 600);
        richText(ctx.t('seriesHint'), cx, R.y + R.h * 0.45 + 20, fs - 0.5, theme.muted, 'center', true, 500);
      }
      // Rückmeldung „Gefunden“
      if (found && br) {
        const u = resultPop.running ? resultPop.value : 1;
        const g = surface.g;
        g.save();
        g.translate(R.x + R.w / 2, R.y + 50);
        g.scale(u, u);
        const label = tr('found', { lo: n(br.lo, 1), hi: n(br.hi, 1) });
        const fits = richWidth(label, fs) + 20 < R.w - 16;
        pill(0, -2, fits ? label : tr('bracketing', { lo: n(br.lo, 1), hi: n(br.hi, 1) }), C.good(), 'center', fs, C.good());
        g.restore();
        if (goal === 'loop' && p.mu === 0 && R.h > 170) richText(ctx.t('foundTheory'), R.x + R.w / 2, R.y + 84, fs - 0.5, theme.text, 'center', true, 600);
      }
      frame(R);
    }

    function drawPanels(reg: { panels: Rect[] }): void {
      const kinds = panelsOf(mode());
      const alpha = fade.running ? fade.value : 1;
      const g = surface.g;
      kinds.forEach((kind, i) => {
        const R = reg.panels[i];
        if (!R || R.w < 60 || R.h < 50) return;
        if (kind === 'bars') {
          drawBars(R, alpha);
          return;
        }
        g.save();
        g.globalAlpha = alpha;
        card(R);
        const plot = charts[i]!;
        if (kind === 'es') drawEsChart(plot, R);
        else if (kind === 'et') drawEtChart(plot, R);
        else if (kind === 'forces') drawForcesChart(plot, R);
        else drawSeriesChart(plot, R);
        g.restore();
      });
    }

    /* ---------- Bedienung im Bild ---------- */
    function nearTrack(px: number, py: number): { s: number; d: number } {
      let best = { s: 0, d: Infinity };
      for (const q of track.points) {
        const d = Math.hypot(scene.px(q.x) - px, scene.py(q.y) - py);
        if (d < best.d) best = { s: q.s, d };
      }
      return best;
    }

    function inRect(r: Rect, px: number, py: number): boolean {
      return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
    }

    /** Was liegt unter dem Zeiger? cart, sup1…sup4, mark<i>, track */
    function hitScene(px: number, py: number): string | null {
      if (ctx.locked || !inRect(regions().scene, px, py)) return null;
      const st = now();
      if (editable()) {
        if (trackId() === 'eigen') {
          const sup = track.features.supports ?? [];
          for (let i = 1; i < sup.length; i++) {
            const q = track.at(sup[i]!);
            if (Math.hypot(scene.px(q.x) - px, scene.py(q.y) - 2 - py) < 15) return `sup${i}`;
          }
        }
        const [cx, cy] = carCenter(st.s);
        if (Math.hypot(cx - px, cy - py) < carSize().len * 0.6) return trackId() === 'eigen' ? 'sup0' : 'cart';
      }
      if (mode() === 'ride' || mode() === 'energy') {
        for (let i = 0; i < marks.length; i++) {
          const q = track.at(marks[i]!.s);
          const nx = -Math.sin(q.theta);
          const ny = -Math.cos(q.theta);
          if (Math.hypot(scene.px(q.x) + nx * 26 - px, scene.py(q.y) + ny * 26 - py) < 12) return `mark${i}`;
        }
        if (nearTrack(px, py).d < 12) return 'track';
      }
      return null;
    }

    function toggleMark(s: number): void {
      const i = marks.findIndex((mk) => Math.abs(mk.s - s) < 1.5);
      if (i >= 0) marks.splice(i, 1);
      else {
        if (marks.length >= MAX_MARKS) marks.shift();
        const pop = new Tween(520, ease.outBack);
        pop.play();
        marks.push({ s, pop });
        marks.sort((a, b) => a.s - b.s);
      }
      updateReadouts();
      ctx.requestRender();
    }

    let grab: { kind: string; x: number; y: number; moved: boolean } | null = null;
    surface.addTarget({
      contains: (px: number, py: number) => hitScene(px, py) !== null,
      pointerDown: (q: { px: number; py: number }) => {
        const kind = hitScene(q.px, q.py);
        if (!kind) return false;
        grab = { kind, x: q.px, y: q.py, moved: false };
        if (kind === 'cart' || kind.startsWith('sup')) {
          dragging = true;
          surface.setCursor('grabbing');
        }
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (!grab) return;
        if (!grab.moved && Math.hypot(q.px - grab.x, q.py - grab.y) < 3) return;
        grab.moved = true;
        const [wx, wy] = scene.toWorld(q.px, q.py);
        if (grab.kind === 'cart') {
          // nur entlang der Startrampe (bis zum ersten Tal)
          const best = track.nearest(wx, wy, 0, track.firstValley);
          ctx.set({ h0: clamp(track.at(best.s).y, 2, 26) });
        } else if (grab.kind.startsWith('sup')) {
          const i = Number(grab.kind.slice(3));
          const key = SUPPORT_KEYS[i]!;
          ctx.set({ [key]: clamp(wy, i === 0 ? 2 : 0, 26) });
        }
      },
      pointerUp: () => {
        const g0 = grab;
        grab = null;
        if (dragging) {
          dragging = false;
          updateReadouts();
        }
        if (g0 && !g0.moved && !ctx.locked) {
          if (g0.kind === 'track') toggleMark(nearTrack(g0.x, g0.y).s);
          else if (g0.kind.startsWith('mark')) {
            marks.splice(Number(g0.kind.slice(4)), 1);
            updateReadouts();
          }
        }
        surface.setCursor('');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const kind = q ? hitScene(q.px, q.py) : null;
        if (kind !== hoverKind) {
          hoverKind = kind;
          ctx.requestRender();
        }
        surface.setCursor(kind === 'cart' || kind?.startsWith('sup') ? 'grab' : kind ? 'pointer' : '');
      },
      wheel: () => false,
    });

    // Diagramme antippen: Zeit wählen (E über t), Messpunkt setzen (E über s), Starthöhe wählen (Kräfte, Messreihe)
    function panelHit(px: number, py: number): number {
      const kinds = panelsOf(mode());
      const reg = regions().panels;
      return reg.findIndex((r, i) => kinds[i] !== 'bars' && inRect(r, px, py));
    }
    let chartDrag = -1;
    function chartSet(i: number, px: number, first: boolean): void {
      const kind = panelsOf(mode())[i];
      const x = charts[i]!.toWorld(px, 0)[0];
      if (kind === 'et') {
        ctx.clock.pause();
        t = clamp(x, 0, run.end);
        updateNow();
      } else if (kind === 'es' && first) toggleMark(clamp(x, 0, track.length));
      else if ((kind === 'forces' || kind === 'series') && !ctx.clock.playing) {
        ctx.set({ h0: clamp(x, 2, 26) });
      }
      ctx.requestRender();
    }
    surface.addTarget({
      contains: (px: number, py: number) => !ctx.locked && panelHit(px, py) >= 0,
      pointerDown: (q: { px: number; py: number }) => {
        const i = panelHit(q.px, q.py);
        if (i < 0 || ctx.locked) return false;
        chartDrag = i;
        chartSet(i, q.px, true);
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (chartDrag >= 0) chartSet(chartDrag, q.px, false);
      },
      pointerUp: () => {
        chartDrag = -1;
      },
      hover: (q: { px: number; py: number } | null) => {
        const i = q ? panelHit(q.px, q.py) : -1;
        const kind = i >= 0 ? panelsOf(mode())[i] : null;
        surface.setCursor(kind === 'es' ? 'pointer' : kind ? 'ew-resize' : '');
      },
      wheel: () => false,
    });

    /* ---------- Ablauf ---------- */
    function resetMotion(): void {
      t = 0;
      pending = null;
      liftPop.finish();
      turnPop.finish();
    }

    compute();
    intro.play();
    disp = { pot: e0(), kin: 0, heat: 0 };

    return {
      update(changed, source) {
        const physics = source === 'init' || source === 'replace' || PHYSICS.some((key) => changed.has(key));
        if (physics) {
          const before = track;
          const trackChanged = changed.has('track') || source === 'replace';
          compute();
          ctx.clock.pause();
          resetMotion();
          if (trackChanged && source !== 'init' && before !== track) {
            oldTrack = before;
            trackFade.play();
            marks = [];
          }
          if (changed.has('track') || changed.has('mu') || source === 'replace' || source === 'init' || (trackId() === 'eigen' && ['p1', 'p2', 'p3', 'p4'].some((k) => changed.has(k)))) {
            series = [];
            found = false;
          }
        }
        // Wechsel in die Looping-Ansicht: Looping-Bahn wählen; Aufgabe: Bahn mit Ziel
        if (changed.has('mode') && source === 'input') {
          if (mode() === 'loop' && trackId() !== 'looping') ctx.set({ track: 'looping' });
          if (mode() === 'task' && trackId() === 'tal') ctx.set({ track: 'looping' });
        }
        if (changed.has('m') && source === 'input' && !physics) {
          const prev = disp.pot + disp.kin + disp.heat;
          const f = prev > 0 ? energies(now()).total / prev : 1;
          if (Math.abs(f - 1) > 0.01) transient = { text: tr('hMass', { f: n(f, 2) }), until: performance.now() + 3200 };
        }
        if (changed.has('mode')) fitBox();
        if (changed.has('mode') && source !== 'init') fade.play();
        if (source === 'init' || source === 'replace') split = -1;
        updateReadouts();
      },

      action(id) {
        if (id === 'start') {
          resetMotion();
          if (mode() === 'task' && goal) pending = { h0: startH, ...evaluate() };
          ctx.clock.play();
        } else if (id === 'clear') {
          if (ctx.locked) return;
          if (mode() === 'task') {
            series = [];
            found = false;
          } else marks = [];
          updateReadouts();
          ctx.requestRender();
        }
      },

      tick(dt) {
        if (run.end <= 0) {
          ctx.clock.pause();
          return;
        }
        if (t >= run.end) resetMotion();
        if (t === 0 && mode() === 'task' && goal && !pending) pending = { h0: startH, ...evaluate() };
        const before = t;
        t = Math.min(run.end, t + dt * (p.slow ? 0.25 : 1));
        if (run.liftOff && before < run.liftOff.t && t >= run.liftOff.t) liftPop.play();
        if (run.turns.some((q) => before < q.t && t >= q.t)) turnPop.play();
        if (pending && t >= pending.at) addResult();
        if (t >= run.end) {
          if (pending) addResult();
          ctx.clock.pause();
        }
        updateNow();
      },

      resetTime() {
        resetMotion();
        updateNow();
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
        const reg = regions();
        scene.resize();
        for (const c of charts) c.resize();
        const moving = stepView(dt);
        // Säulen zählen weich zum neuen Wert, wenn sich die Einstellung ändert; während der Fahrt
        // zeigen sie genau den aktuellen Wert (sonst passen Tacho und Säulen nicht zusammen)
        const e = energies(now());
        const k = prefersReducedMotion() || ctx.clock.playing ? 1 : 1 - Math.exp(-dt * 16);
        disp = { pot: lerp(disp.pot, e.pot, k), kin: lerp(disp.kin, e.kin, k), heat: lerp(disp.heat, e.heat, k) };
        const settling = Math.abs(disp.pot - e.pot) + Math.abs(disp.kin - e.kin) + Math.abs(disp.heat - e.heat) > e.total * 0.002;
        // Grenzwert erst nach dem Ziehen berechnen (Bisektion braucht einen Moment)
        if (!dragging && p.mu > 0 && (mode() === 'task' || mode() === 'loop') && goal && threshold?.key !== thresholdKey()) {
          minHeight();
          updateReadouts();
        }
        surface.begin();
        drawScene(reg.scene);
        drawPanels(reg);
        const busy =
          moving || settling || split !== st || intro.running || fade.running || trackFade.running || resultPop.running || liftPop.running || turnPop.running || marks.some((mk) => mk.pop.running) || (transient !== null && transient.until > nowMs);
        if (!trackFade.running) oldTrack = null;
        if (busy) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
