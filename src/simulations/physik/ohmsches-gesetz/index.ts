import { defineSimulation, ease, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  AMP_RANGES,
  autoRange,
  colorBands,
  fitThroughOrigin,
  glowOf,
  operatingPoint,
  R_COLD,
  U_MAX,
  VOLT_RANGES,
  wireResistance,
  type MysteryId,
  type OperatingPoint,
  type PartKind,
  type PartSpec,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Pt = [number, number];
type Axes = 'IU' | 'UI';

interface Measurement {
  U: number;
  I: number;
  series: number;
}

interface Series {
  key: string;
  kind: PartKind;
  label: string;
  color: number;
}

/** Farben der Messreihen (Indizes in theme.series). */
const SERIES_COLORS = [0, 1, 2, 4, 5, 3];
const MAX_SERIES = 6;

/* ------------------------------------------------------------------ */
/* Hilfen                                                              */
/* ------------------------------------------------------------------ */

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function mixHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => Math.round(mix((pa >> shift) & 255, (pb >> shift) & 255, Math.max(0, Math.min(1, t))));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

function bezier(p0: Pt, c1: Pt, c2: Pt, p3: Pt, n = 26): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    out.push([
      u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p3[1],
    ]);
  }
  return out;
}

/** Farbe einer glühenden Wendel bei der Temperatur T (in K). */
function filamentColor(T: number): string {
  const stops: [number, string][] = [
    [600, '#4a4f57'],
    [950, '#7a1d0c'],
    [1300, '#d0400f'],
    [1800, '#ff8a1f'],
    [2300, '#ffd05a'],
    [2800, '#fff4d6'],
  ];
  if (T <= stops[0]![0]) return stops[0]![1];
  for (let i = 1; i < stops.length; i++) {
    const [t1, c1] = stops[i]!;
    const [t0, c0] = stops[i - 1]!;
    if (T <= t1) return mixHex(c0, c1, (T - t0) / (t1 - t0));
  }
  return stops[stops.length - 1]![1];
}

function haloColor(T: number): [number, number, number] {
  if (T < 1500) return [255, 120, 40];
  if (T < 2200) return [255, 176, 70];
  return [255, 222, 140];
}

/** Kleinste „schöne“ Zahl (1, 2, 2,5, 5 · 10^k) ≥ x. */
function niceStep(x: number): number {
  if (!(x > 0)) return 1;
  const p = 10 ** Math.floor(Math.log10(x));
  const m = x / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * p;
}

/** Obere Grenze eines Diagramms: etwas Luft über x, auf runde Werte. */
function niceTop(x: number): number {
  if (!(x > 0)) return 1;
  const step = niceStep(x / 5);
  return Math.ceil((x * 1.08) / step - 1e-9) * step;
}

/** Farben der Ringe auf Widerständen (0 … 9), Gold für den Multiplikator 0,1. */
const BAND_COLORS = ['#1b1b1b', '#7a4a1e', '#d32f2f', '#ef6c00', '#fbc02d', '#2e7d32', '#1565c0', '#7b1fa2', '#9e9e9e', '#f5f5f5'];
const GOLD = '#c9a43a';

/* ------------------------------------------------------------------ */
/* Simulation                                                          */
/* ------------------------------------------------------------------ */

/**
 * Ohmsches Gesetz: Netzgerät, Bauteil, Amperemeter und Voltmeter mit
 * Zeigern. Messwerte werden in ein I-U- (oder U-I-)Diagramm übernommen; für
 * ohmsche Bauteile ergibt sich eine Ursprungsgerade, die Glühlampe zeigt
 * eine gekrümmte Kennlinie.
 */
export default defineSimulation({
  id: 'ohmsches-gesetz',
  layout: { aspect: 1.6, aspectNarrow: 0.56 },
  dragHint: true,
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'part',
      type: 'choice',
      label: L('Bauteil', 'Component'),
      options: [
        { value: 'res', label: L('Widerstand', 'Resistor') },
        { value: 'mys', label: L('Unbekannter Widerstand', 'Unknown resistor') },
        { value: 'lamp', label: L('Glühlampe', 'Light bulb') },
        { value: 'wire', label: L('Konstantandraht', 'Constantan wire') },
      ],
      default: 'res',
    },
    { key: 'R', type: 'number', label: L('Widerstand R', 'Resistance R'), min: 10, max: 200, step: 1, default: 47, unit: 'Ω', visibleIf: (v) => v.part === 'res' },
    {
      key: 'X',
      type: 'choice',
      label: L('Welcher Widerstand?', 'Which resistor?'),
      options: [
        { value: 'A', label: L('A', 'A') },
        { value: 'B', label: L('B', 'B') },
        { value: 'C', label: L('C', 'C') },
      ],
      default: 'A',
      visibleIf: (v) => v.part === 'mys',
    },
    { key: 'l', type: 'number', label: L('Länge l des Drahtes', 'Length l of the wire'), min: 0.1, max: 2, step: 0.1, default: 1, unit: 'm', visibleIf: (v) => v.part === 'wire' },
    { key: 'A', type: 'number', label: L('Querschnittsfläche A', 'Cross-sectional area A'), min: 0.05, max: 0.5, step: 0.05, default: 0.1, unit: 'mm²', visibleIf: (v) => v.part === 'wire' },
    {
      key: 'U',
      type: 'number',
      label: L('Spannung am Netzgerät', 'Voltage of the power supply'),
      help: L('Oder: den Drehknopf am Netzgerät ziehen.', 'Or drag the knob of the power supply.'),
      min: 0,
      max: U_MAX,
      step: 0.1,
      default: 6,
      unit: 'V',
    },
    {
      key: 'axes',
      type: 'choice',
      group: 'view',
      label: L('Diagramm', 'Graph'),
      options: [
        { value: 'IU', label: L('I-U-Kennlinie (I über U)', 'I–U characteristic (I against U)') },
        { value: 'UI', label: L('U-I-Diagramm (U über I)', 'U–I graph (U against I)') },
      ],
      default: 'IU',
    },
    { key: 'fit', type: 'boolean', group: 'view', label: L('Ausgleichsgerade durch den Ursprung', 'Best-fit line through the origin'), default: true },
    { key: 'plan', type: 'boolean', group: 'view', label: L('Schaltplan', 'Circuit diagram'), default: true },
  ],
  actions: [
    { id: 'measure', label: L('Messwert aufnehmen', 'Record a data point'), primary: true },
    { id: 'auto', label: L('Messreihe automatisch', 'Automatic series') },
    { id: 'clear', label: L('Messwerte löschen', 'Clear data') },
  ],
  readouts: [
    { key: 'now', label: L('Messgeräte zeigen', 'The meters show') },
    { key: 'R', label: L('Widerstand', 'Resistance'), spoiler: true },
    { key: 'law', label: L('Ohmsches Gesetz', 'Ohm’s law') },
    { key: 'wire', label: L('Widerstand des Drahtes', 'Resistance of the wire'), spoiler: true },
    { key: 'fit', label: L('Auswertung der Messreihe', 'Analysis of the series'), spoiler: true },
    { key: 'table', label: L('Messtabelle', 'Table of measurements') },
    { key: 'limit', label: L('Netzgerät', 'Power supply') },
  ],
  presets: [
    { id: 'start', label: L('Widerstand 47 Ω', 'Resistor 47 Ω'), values: {} },
    { id: 'big', label: L('Widerstand 150 Ω', 'Resistor 150 Ω'), values: { R: 150 } },
    { id: 'lamp', label: L('Glühlampe', 'Light bulb'), values: { part: 'lamp' } },
    { id: 'wire', label: L('Konstantandraht', 'Constantan wire'), values: { part: 'wire', U: 2 } },
    { id: 'mys', label: L('Unbekannter Widerstand', 'Unknown resistor'), values: { part: 'mys', X: 'B' } },
    { id: 'ui', label: L('U-I-Diagramm: Steigung = R', 'U–I graph: slope = R'), values: { axes: 'UI' } },
  ],
  strings: {
    de: {
      canvas: 'Netzgerät mit Drehknopf, Amperemeter und Voltmeter mit Zeigern und ein Bauteil (Widerstand, Glühlampe oder Konstantandraht); daneben das Diagramm mit den Messpunkten',
      supply: 'Netzgerät',
      cc: 'I-Begrenzung',
      turn: 'drehen',
      plan: 'Schaltplan',
      axisU: 'U in V',
      axisI: 'I in A',
      empty: 'Spannung einstellen und „Messwert aufnehmen“ drücken.',
      res: 'R = {R} Ω',
      mys: 'Widerstand {X}',
      lamp: 'Glühlampe 12 V / 0,25 A',
      lampShort: 'Glühlampe',
      wire: 'Draht: l = {l} m, A = {A} mm²',
      wireShort: 'Konstantan, l = {l} m',
      fitLabel: 'R ≈ {R} Ω',
      now: 'U = {U} V · I = {I} A',
      nowLamp: 'U = {U} V · I = {I} A · Wendel ≈ {C} °C',
      nowZero: 'U = 0 V · I = 0 A',
      rOhm: 'Für die Glühlampe gilt das ohmsche Gesetz nicht: Ihr Widerstand wächst mit der Temperatur der Wendel – die Kennlinie ist gekrümmt.',
      rRes: 'Die Stromstärke I ist proportional zur Spannung U: Die Kennlinie ist eine Ursprungsgerade, der Widerstand R = U / I ist konstant.',
      rWire: 'Konstantan ändert seinen Widerstand beim Erwärmen kaum – der Draht ist ein ohmscher Leiter. R wächst mit der Länge l und sinkt mit der Querschnittsfläche A.',
      wireText: 'R = ρ · l / A = 0,49 Ω·mm²/m · {l} m / {A} mm² ≈ {R} Ω (Durchmesser d ≈ {d} mm)',
      fitText: 'Steigung der Ausgleichsgeraden: R ≈ {R} Ω (aus {n} Messpunkten)',
      fitFew: 'Für die Ausgleichsgerade fehlen noch Messpunkte.',
      lampFit: 'Der Widerstand R = U / I steigt von {R0} Ω (kalte Wendel) auf {R1} Ω bei {U} V.',
      lampFew: 'Nimm mehrere Messwerte bei verschiedenen Spannungen auf.',
      thU: 'U in V',
      thI: 'I in A',
      thR: 'U / I in Ω',
      none: 'Noch keine Messwerte für dieses Bauteil.',
      limited: 'Strombegrenzung aktiv: Das Netzgerät liefert höchstens 2 A. Die Spannung am Bauteil ist deshalb kleiner als eingestellt – das Voltmeter zeigt sie an.',
    },
    en: {
      canvas: 'Power supply with a knob, ammeter and voltmeter with pointers and a component (resistor, light bulb or constantan wire); next to it the graph of the data points',
      supply: 'Power supply',
      cc: 'I limit',
      turn: 'turn',
      plan: 'Circuit diagram',
      axisU: 'U in V',
      axisI: 'I in A',
      empty: 'Set a voltage and press “Record a data point”.',
      res: 'R = {R} Ω',
      mys: 'Resistor {X}',
      lamp: 'Bulb 12 V / 0.25 A',
      lampShort: 'Light bulb',
      wire: 'Wire: l = {l} m, A = {A} mm²',
      wireShort: 'Constantan, l = {l} m',
      fitLabel: 'R ≈ {R} Ω',
      now: 'U = {U} V · I = {I} A',
      nowLamp: 'U = {U} V · I = {I} A · filament ≈ {C} °C',
      nowZero: 'U = 0 V · I = 0 A',
      rOhm: 'Ohm’s law does not apply to the bulb: its resistance increases with the temperature of the filament – the characteristic is curved.',
      rRes: 'The current I is proportional to the voltage U: the characteristic is a straight line through the origin, the resistance R = U / I is constant.',
      rWire: 'The resistance of constantan hardly changes when it warms up – the wire is an ohmic conductor. R increases with the length l and decreases with the cross-sectional area A.',
      wireText: 'R = ρ · l / A = 0.49 Ω·mm²/m · {l} m / {A} mm² ≈ {R} Ω (diameter d ≈ {d} mm)',
      fitText: 'Slope of the best-fit line: R ≈ {R} Ω (from {n} data points)',
      fitFew: 'More data points are needed for the best-fit line.',
      lampFit: 'The resistance R = U / I rises from {R0} Ω (cold filament) to {R1} Ω at {U} V.',
      lampFew: 'Record several data points at different voltages.',
      thU: 'U in V',
      thI: 'I in A',
      thR: 'U / I in Ω',
      none: 'No data for this component yet.',
      limited: 'Current limit active: the supply delivers at most 2 A. The voltage across the component is therefore lower than set – the voltmeter shows it.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const g = surface.g;
    const tr = (key: string, vars: Record<string, string> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const narrow = () => surface.width < 640;
    const axes = () => p.axes as Axes;
    const reduced = prefersReducedMotion();

    const spec = (): PartSpec => ({ kind: p.part as PartKind, R: p.R, mystery: p.X as MysteryId, l: p.l, A: p.A });

    /* ---------- Aufteilung ---------- */
    function regions(): { exp: Rect; chart: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (!narrow()) {
        const ew = Math.round(w * 0.53);
        return { exp: { x: 0, y: 0, w: ew, h }, chart: { x: ew + 10, y: 0, w: w - ew - 10, h } };
      }
      const eh = Math.round(h * 0.56);
      return { exp: { x: 0, y: 0, w, h: eh }, chart: { x: 0, y: eh + 10, w, h: h - eh - 10 } };
    }

    const chart = new Plot(surface, {
      x: [0, 12],
      y: [0, 1],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: () => regions().chart,
    });

    /* ---------- Zustand ---------- */
    let op: OperatingPoint = operatingPoint(spec(), p.U);
    let points: Measurement[] = [];
    let series: Series[] = [];
    const pop = new Tween(450, ease.outBack);
    const needles = {
      A: { range: autoRange(op.I, AMP_RANGES, 1) as number, pos: 0, vel: 0 },
      V: { range: autoRange(op.U, VOLT_RANGES, 10) as number, pos: 0, vel: 0 },
    };
    let auto: { next: number; wait: number } | null = null;
    let knobUsed = false;
    let lastFrame = performance.now();
    /** Weich nachgeführte Achsenbereiche des Diagramms. */
    let viewX = 0;
    let viewY = 0;

    function seriesFor(): Series {
      const s = spec();
      const key = s.kind === 'res' ? `res:${p.R}` : s.kind === 'mys' ? `mys:${p.X}` : s.kind === 'wire' ? `wire:${p.l}:${p.A}` : 'lamp';
      let found = series.find((q) => q.key === key);
      if (!found) {
        const label =
          s.kind === 'res'
            ? tr('res', { R: fmt.num(p.R, 0) })
            : s.kind === 'mys'
              ? tr('mys', { X: p.X })
              : s.kind === 'wire'
                ? tr('wire', { l: fmt.num(p.l, 1), A: fmt.num(p.A, 2) })
                : ctx.t('lampShort');
        const used = new Set(series.map((q) => q.color));
        const color = SERIES_COLORS.find((c) => !used.has(c)) ?? SERIES_COLORS[series.length % SERIES_COLORS.length]!;
        found = { key, kind: s.kind, label, color };
        series = [...series, found];
        if (series.length > MAX_SERIES) {
          // älteste Messreihe verwerfen
          series = series.slice(1);
          points = points.filter((q) => q.series !== 0).map((q) => ({ ...q, series: q.series - 1 }));
        }
      }
      return found;
    }

    function record(): void {
      const sr = seriesFor();
      const idx = series.indexOf(sr);
      if (points.some((q) => q.series === idx && Math.abs(q.U - op.U) < 1e-6)) return;
      points = [...points, { U: op.U, I: op.I, series: idx }].slice(-80);
      pop.play();
      updateReadouts();
    }

    /* ---------- Ergebnisse ---------- */
    const fmtI = (I: number) => fmt.fixed(I, I < 1 ? 3 : 2);

    function updateNow(): void {
      if (op.U < 1e-6) ctx.readout('now', ctx.t('nowZero'));
      else if (p.part === 'lamp') ctx.readout('now', tr('nowLamp', { U: fmt.fixed(op.U, 2), I: fmtI(op.I), C: fmt.num(Math.round((op.T - 273) / 10) * 10, 0) }));
      else ctx.readout('now', tr('now', { U: fmt.fixed(op.U, 2), I: fmtI(op.I) }));
    }

    function updateReadouts(): void {
      updateNow();
      const kind = p.part as PartKind;
      if (op.U > 1e-6 && op.R !== null) {
        const frac = (a: string, b: string) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
        ctx.readout('R', { html: `<var>R</var> = ${frac('<var>U</var>', '<var>I</var>')} = ${frac(`${fmt.fixed(op.U, 2)} V`, `${fmtI(op.I)} A`)} ≈ <strong>${fmt.num(op.R, op.R < 10 ? 2 : 1)} Ω</strong>` });
      } else ctx.readout('R', null);
      ctx.readout('law', ctx.t(kind === 'lamp' ? 'rOhm' : kind === 'wire' ? 'rWire' : 'rRes'));
      if (kind === 'wire') {
        const R = wireResistance(p.l, p.A);
        const d = Math.sqrt((4 * p.A) / Math.PI);
        ctx.readout('wire', tr('wireText', { l: fmt.num(p.l, 1), A: fmt.num(p.A, 2), R: fmt.num(R, R < 1 ? 3 : 2), d: fmt.num(d, 2) }));
      } else ctx.readout('wire', null);

      const sr = series.find((q) => q.key === seriesFor().key)!;
      const idx = series.indexOf(sr);
      const mine = points.filter((q) => q.series === idx).sort((a, b) => a.U - b.U);
      if (kind === 'lamp') {
        if (mine.length >= 2) {
          const last = mine[mine.length - 1]!;
          ctx.readout('fit', tr('lampFit', { R0: fmt.num(R_COLD, 1), R1: fmt.num(last.U / last.I, 1), U: fmt.num(last.U, 1) }));
        } else ctx.readout('fit', ctx.t('lampFew'));
      } else {
        const k = fitThroughOrigin(mine.map((q) => ({ x: q.U, y: q.I })));
        ctx.readout('fit', k && mine.length >= 2 ? tr('fitText', { R: fmt.num(1 / k, 1 / k < 10 ? 2 : 1), n: String(mine.length) }) : ctx.t('fitFew'));
      }
      if (mine.length) {
        const rows = mine
          .map((q) => `<tr><td>${fmt.fixed(q.U, 2)}</td><td>${fmtI(q.I)}</td><td>${q.U > 1e-6 ? fmt.num(q.U / q.I, q.U / q.I < 10 ? 2 : 1) : '–'}</td></tr>`)
          .join('');
        ctx.readout('table', { html: `<table class="mini-table"><tr><th>${ctx.t('thU')}</th><th>${ctx.t('thI')}</th><th>${ctx.t('thR')}</th></tr>${rows}</table>` });
      } else ctx.readout('table', ctx.t('none'));
      ctx.readout('limit', op.limited ? ctx.t('limited') : null);
      ctx.setAction('measure', { enabled: !auto });
      ctx.setAction('clear', { enabled: points.length > 0 });
    }

    /* ---------- Geometrie des Versuchsaufbaus ---------- */
    interface Geo {
      r: Rect;
      s: number;
      at: (x: number, y: number) => Pt;
      ammeter: Pt;
      voltmeter: Pt;
      supply: Pt;
      knob: Pt;
      knobR: number;
      sPlus: Pt;
      sMinus: Pt;
      board: Pt;
      t1: Pt;
      t2: Pt;
      planRect: Rect | null;
    }

    function geo(r: Rect): Geo {
      const showPlan = p.plan;
      const DW = 400;
      const DH = showPlan ? 470 : 345;
      const s = Math.max(0.55, Math.min(1.5, Math.min(r.w / DW, r.h / DH)));
      const ox = r.x + (r.w - DW * s) / 2;
      const oy = r.y + (r.h - DH * s) / 2;
      const at = (x: number, y: number): Pt => [ox + x * s, oy + y * s];
      const lampMode = p.part === 'lamp';
      const boardY = lampMode ? 262 : 252;
      const board = at(282, boardY);
      const t1 = at(200, boardY + 12);
      // Beim Draht greift eine Klemme den Draht bei der Länge l ab.
      const t2 = p.part === 'wire' ? at(206 + (p.l / 2) * 160, boardY + 12) : at(364, boardY + 12);
      return {
        r,
        s,
        at,
        ammeter: at(105, 80),
        voltmeter: at(295, 80),
        supply: at(90, 264),
        knob: at(64, 284),
        knobR: 27 * s,
        sPlus: at(140, 246),
        sMinus: at(140, 300),
        board,
        t1,
        t2,
        planRect: showPlan ? { x: at(40, 0)[0], y: at(0, 364)[1], w: 320 * s, h: 98 * s } : null,
      };
    }

    /* ---------- Drehknopf ziehen ---------- */
    let G: Geo | null = null;
    let knobDrag = false;
    let knobHover = false;
    const knobHit = (px: number, py: number) => !!G && Math.hypot(px - G.knob[0], py - G.knob[1]) <= G.knobR + 14;
    function setFromPointer(px: number, py: number): void {
      if (!G) return;
      const ang = (Math.atan2(px - G.knob[0], -(py - G.knob[1])) * 180) / Math.PI;
      const a = Math.max(-135, Math.min(135, ang));
      const U = ((a + 135) / 270) * U_MAX;
      ctx.set({ U: Math.round(U * 10) / 10 });
    }
    surface.addTarget({
      contains: (px, py) => knobHit(px, py),
      pointerDown: (q) => {
        if (ctx.locked || !knobHit(q.px, q.py)) return false;
        knobDrag = true;
        knobUsed = true;
        auto = null;
        setFromPointer(q.px, q.py);
        surface.setCursor('grabbing');
        ctx.requestRender();
        return true;
      },
      pointerMove: (q) => {
        if (knobDrag) setFromPointer(q.px, q.py);
      },
      pointerUp: () => {
        knobDrag = false;
        surface.setCursor('grab');
        ctx.requestRender();
      },
      hover: (q) => {
        const h = !!q && knobHit(q.px, q.py) && !ctx.locked;
        if (h !== knobHover) {
          knobHover = h;
          ctx.requestRender();
        }
        surface.setCursor(h ? 'grab' : '');
      },
      wheel: () => false,
    });

    /* ---------- Zeichenhilfen ---------- */
    function shadowOn(blur: number, dy: number, alpha = 1): void {
      const dark = ctx.theme.dark;
      g.shadowColor = dark ? `rgba(0,0,0,${0.55 * alpha})` : `rgba(16,24,40,${0.22 * alpha})`;
      g.shadowBlur = blur;
      g.shadowOffsetY = dy;
    }

    function metalGradient(x0: number, x1: number, light = '#e9edf2', dark = '#7d8693'): CanvasGradient {
      const m = g.createLinearGradient(x0, 0, x1, 0);
      m.addColorStop(0, dark);
      m.addColorStop(0.45, light);
      m.addColorStop(1, dark);
      return m;
    }

    function screw(x: number, y: number, rad: number): void {
      const gr = g.createRadialGradient(x - rad * 0.35, y - rad * 0.35, rad * 0.1, x, y, rad);
      gr.addColorStop(0, '#fff1c2');
      gr.addColorStop(0.5, '#d6ac4e');
      gr.addColorStop(1, '#7a5718');
      g.fillStyle = gr;
      g.beginPath();
      g.arc(x, y, rad, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(70,45,10,0.75)';
      g.lineWidth = Math.max(1, rad * 0.22);
      g.beginPath();
      g.moveTo(x - rad * 0.55, y + rad * 0.2);
      g.lineTo(x + rad * 0.55, y - rad * 0.2);
      g.stroke();
    }

    /** Buchse mit farbigem Ring (rot = Plus, schwarz/blau = Minus). */
    function socket(x: number, y: number, s: number, color: string): void {
      g.fillStyle = color;
      g.beginPath();
      g.arc(x, y, 7 * s, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.25)';
      g.beginPath();
      g.arc(x - 1.5 * s, y - 1.5 * s, 4.5 * s, Math.PI, Math.PI * 1.6);
      g.lineTo(x, y);
      g.fill();
      g.fillStyle = '#0d0f12';
      g.beginPath();
      g.arc(x, y, 3.2 * s, 0, Math.PI * 2);
      g.fill();
    }

    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12): void {
      const theme = ctx.theme;
      g.font = `700 ${size}px ${theme.font}`;
      const w = g.measureText(label).width + 16;
      const h = size + 10;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1;
      g.fillStyle = theme.dark ? 'rgba(16,22,31,0.92)' : 'rgba(255,255,255,0.95)';
      roundRect(g, x0, y, w, h, h / 2);
      g.fill();
      g.restore();
      g.strokeStyle = withAlpha(color, 0.5);
      g.lineWidth = 1;
      roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
      g.stroke();
      text(g, label, x0 + w / 2, y + h / 2 + 0.5, { font: `700 ${size}px ${theme.font}`, color });
    }

    function cable(pts: Pt[], color: string, s: number, width = 6): void {
      const w = width * s;
      const trace = (dx = 0, dy = 0) => {
        g.beginPath();
        pts.forEach(([x, y], i) => (i === 0 ? g.moveTo(x + dx, y + dy) : g.lineTo(x + dx, y + dy)));
      };
      g.save();
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.strokeStyle = ctx.theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.16)';
      g.lineWidth = w;
      trace(1.5 * s, 3.5 * s);
      g.stroke();
      g.strokeStyle = color;
      trace();
      g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.28)';
      g.lineWidth = Math.max(1, w * 0.22);
      trace(-0.5 * s, -1.4 * s);
      g.stroke();
      g.restore();
    }

    /* ---------- Bauteile ---------- */
    function drawMeter(c: Pt, s: number, kind: 'A' | 'V'): void {
      const theme = ctx.theme;
      const n = kind === 'A' ? needles.A : needles.V;
      const [cx, cy] = c;
      const W = 172 * s;
      const H = 136 * s;
      // Gehäuse
      g.save();
      shadowOn(14 * s, 5 * s);
      const body = g.createLinearGradient(0, cy - H / 2, 0, cy + H / 2);
      body.addColorStop(0, theme.dark ? '#4a5568' : '#4b5666');
      body.addColorStop(1, theme.dark ? '#283040' : '#2b3340');
      g.fillStyle = body;
      roundRect(g, cx - W / 2, cy - H / 2, W, H, 12 * s);
      g.fill();
      g.restore();
      g.fillStyle = 'rgba(255,255,255,0.12)';
      roundRect(g, cx - W / 2 + 3 * s, cy - H / 2 + 2 * s, W - 6 * s, 3 * s, 2 * s);
      g.fill();
      // Skalenfenster
      const fx = cx - 78 * s;
      const fy = cy - 60 * s;
      const fw = 156 * s;
      const fh = 92 * s;
      const face = g.createLinearGradient(0, fy, 0, fy + fh);
      face.addColorStop(0, '#fffdf6');
      face.addColorStop(1, '#efe9d8');
      g.fillStyle = face;
      roundRect(g, fx, fy, fw, fh, 7 * s);
      g.fill();
      // Skala
      const pivot: Pt = [cx, fy + fh + 6 * s];
      const R = 76 * s;
      const a0 = (-48 * Math.PI) / 180;
      const a1 = (48 * Math.PI) / 180;
      const angleOf = (f: number) => a0 + (a1 - a0) * f;
      const range = n.range;
      // Einheit: kleine Stromstärken in mA
      const mA = kind === 'A' && range < 1;
      const scaleMax = mA ? range * 1000 : range;
      const major = scaleMax === 3 || scaleMax === 300 ? scaleMax / 3 : scaleMax === 30 ? 5 : scaleMax / 5;
      const minor = scaleMax === 3 || scaleMax === 300 ? major / 10 : scaleMax === 30 ? 1 : major / 4;
      g.save();
      roundRect(g, fx, fy, fw, fh, 7 * s);
      g.clip();
      const ink = '#2a2a2a';
      g.strokeStyle = ink;
      g.lineCap = 'butt';
      g.lineWidth = 1.2 * s;
      g.beginPath();
      g.arc(pivot[0], pivot[1], R, -Math.PI / 2 + a0, -Math.PI / 2 + a1);
      g.stroke();
      // Spiegelbogen
      g.strokeStyle = 'rgba(160,170,185,0.55)';
      g.lineWidth = 3 * s;
      g.beginPath();
      g.arc(pivot[0], pivot[1], R - 10 * s, -Math.PI / 2 + a0, -Math.PI / 2 + a1);
      g.stroke();
      const steps = Math.round(scaleMax / minor);
      for (let i = 0; i <= steps; i++) {
        const v = i * minor;
        const isMajor = Math.abs(v / major - Math.round(v / major)) < 1e-6;
        const half = !isMajor && Math.abs(v / (major / 2) - Math.round(v / (major / 2))) < 1e-6;
        const a = angleOf(v / scaleMax) - Math.PI / 2;
        const len = (isMajor ? 9 : half ? 6.5 : 4) * s;
        g.strokeStyle = ink;
        g.lineWidth = (isMajor ? 1.4 : 0.9) * s;
        g.beginPath();
        g.moveTo(pivot[0] + Math.cos(a) * R, pivot[1] + Math.sin(a) * R);
        g.lineTo(pivot[0] + Math.cos(a) * (R + len), pivot[1] + Math.sin(a) * (R + len));
        g.stroke();
        if (isMajor) {
          const lr = R + 17 * s;
          const label = fmt.num(v, v < 1 && v > 0 ? 1 : 0);
          text(g, label, pivot[0] + Math.cos(a) * lr, pivot[1] + Math.sin(a) * lr, { font: `600 ${Math.max(9, Math.round(10 * s))}px ${theme.font}`, color: ink });
        }
      }
      // Einheit groß
      text(g, mA ? 'mA' : kind, cx, fy + fh - 22 * s, { font: `800 ${Math.round(17 * s)}px ${theme.font}`, color: kind === 'A' ? '#b3261e' : '#1d4f91' });
      // Zeiger
      const f = Math.max(-0.03, Math.min(1.06, n.pos));
      const a = angleOf(f) - Math.PI / 2;
      g.strokeStyle = '#c62828';
      g.lineWidth = 1.6 * s;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(pivot[0] - Math.cos(a) * 8 * s, pivot[1] - Math.sin(a) * 8 * s);
      g.lineTo(pivot[0] + Math.cos(a) * (R + 6 * s), pivot[1] + Math.sin(a) * (R + 6 * s));
      g.stroke();
      g.restore();
      // Abdeckung des Drehpunkts
      g.fillStyle = '#20252d';
      roundRect(g, cx - 30 * s, fy + fh - 4 * s, 60 * s, 10 * s, 3 * s);
      g.fill();
      g.fillStyle = metalGradient(pivot[0] - 5 * s, pivot[0] + 5 * s);
      g.beginPath();
      g.arc(pivot[0], fy + fh + 1 * s, 4 * s, 0, Math.PI * 2);
      g.fill();
      // Glas-Reflex
      const glare = g.createLinearGradient(fx, fy, fx + fw * 0.6, fy + fh);
      glare.addColorStop(0, 'rgba(255,255,255,0.35)');
      glare.addColorStop(0.4, 'rgba(255,255,255,0)');
      g.fillStyle = glare;
      roundRect(g, fx, fy, fw, fh, 7 * s);
      g.fill();
      // Messbereich und Buchsen
      const rangeLabel = mA ? `${fmt.num(range * 1000, 0)} mA` : `${fmt.num(range, range < 1 ? 1 : 0)} ${kind}`;
      text(g, `0 … ${rangeLabel}`, cx, cy + 50 * s, { font: `600 ${Math.max(9, Math.round(9.5 * s))}px ${theme.font}`, color: 'rgba(235,240,248,0.85)' });
      socket(cx - 54 * s, cy + 52 * s, s, '#c62828');
      socket(cx + 54 * s, cy + 52 * s, s, '#1c1f24');
      text(g, '+', cx - 54 * s, cy + 39 * s, { font: `800 ${Math.round(11 * s)}px ${theme.font}`, color: '#ffb4ab' });
      text(g, 'COM', cx + 54 * s, cy + 39 * s, { font: `700 ${Math.max(8, Math.round(8.5 * s))}px ${theme.font}`, color: 'rgba(235,240,248,0.75)' });
      if (Math.abs(n.pos) > 1.02) {
        // Überlauf (kurzzeitig beim Umschalten)
        g.fillStyle = withAlpha(theme.series[1]!, 0.9);
        g.beginPath();
        g.arc(cx + W / 2 - 12 * s, cy - H / 2 + 12 * s, 4 * s, 0, Math.PI * 2);
        g.fill();
      }
    }

    function meterSockets(c: Pt, s: number): { plus: Pt; com: Pt } {
      return { plus: [c[0] - 54 * s, c[1] + 52 * s], com: [c[0] + 54 * s, c[1] + 52 * s] };
    }

    function drawSupply(Gx: Geo): void {
      const { s, supply, knob, knobR } = Gx;
      const theme = ctx.theme;
      const [cx, cy] = supply;
      const W = 160 * s;
      const H = 128 * s;
      g.save();
      shadowOn(14 * s, 5 * s);
      const body = g.createLinearGradient(0, cy - H / 2, 0, cy + H / 2);
      body.addColorStop(0, theme.dark ? '#505a6a' : '#5a6575');
      body.addColorStop(1, theme.dark ? '#2a313d' : '#323a47');
      g.fillStyle = body;
      roundRect(g, cx - W / 2, cy - H / 2, W, H, 10 * s);
      g.fill();
      g.restore();
      g.fillStyle = 'rgba(255,255,255,0.12)';
      roundRect(g, cx - W / 2 + 3 * s, cy - H / 2 + 2 * s, W - 6 * s, 3 * s, 2 * s);
      g.fill();
      text(g, ctx.t('supply'), cx - W / 2 + 10 * s, cy - H / 2 + 15 * s, { font: `700 ${Math.max(9, Math.round(10.5 * s))}px ${theme.font}`, color: 'rgba(240,244,250,0.92)', align: 'left' });
      // Skala um den Drehknopf
      const [kx, ky] = knob;
      const ring = knobR + 7 * s;
      for (let v = 0; v <= 12; v++) {
        const a = ((-135 + (v / 12) * 270) * Math.PI) / 180 - Math.PI / 2;
        const major = v % 2 === 0;
        g.strokeStyle = 'rgba(240,244,250,0.8)';
        g.lineWidth = (major ? 1.4 : 0.9) * s;
        g.beginPath();
        g.moveTo(kx + Math.cos(a) * ring, ky + Math.sin(a) * ring);
        g.lineTo(kx + Math.cos(a) * (ring + (major ? 6 : 3.5) * s), ky + Math.sin(a) * (ring + (major ? 6 : 3.5) * s));
        g.stroke();
        if (major && v % 4 === 0) text(g, String(v), kx + Math.cos(a) * (ring + 13 * s), ky + Math.sin(a) * (ring + 13 * s), { font: `700 ${Math.max(8, Math.round(9 * s))}px ${theme.font}`, color: 'rgba(240,244,250,0.85)' });
      }
      // Knopf
      if (knobHover || knobDrag) {
        g.fillStyle = withAlpha(theme.series[0]!, knobDrag ? 0.32 : 0.2);
        g.beginPath();
        g.arc(kx, ky, knobR + 5 * s, 0, Math.PI * 2);
        g.fill();
      }
      g.save();
      shadowOn(8 * s, 3 * s);
      const kg = g.createRadialGradient(kx - knobR * 0.35, ky - knobR * 0.4, knobR * 0.1, kx, ky, knobR);
      kg.addColorStop(0, '#5b6472');
      kg.addColorStop(1, '#14181e');
      g.fillStyle = kg;
      g.beginPath();
      g.arc(kx, ky, knobR, 0, Math.PI * 2);
      g.fill();
      g.restore();
      // Griffrillen
      g.strokeStyle = 'rgba(255,255,255,0.12)';
      g.lineWidth = 1.2 * s;
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        g.beginPath();
        g.moveTo(kx + Math.cos(a) * knobR * 0.86, ky + Math.sin(a) * knobR * 0.86);
        g.lineTo(kx + Math.cos(a) * knobR * 0.98, ky + Math.sin(a) * knobR * 0.98);
        g.stroke();
      }
      g.fillStyle = metalGradient(kx - knobR * 0.6, kx + knobR * 0.6, '#f3f5f8', '#8f98a4');
      g.beginPath();
      g.arc(kx, ky, knobR * 0.62, 0, Math.PI * 2);
      g.fill();
      const ka = ((-135 + (p.U / U_MAX) * 270) * Math.PI) / 180 - Math.PI / 2;
      g.strokeStyle = '#e8590c';
      g.lineWidth = 3 * s;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(kx + Math.cos(ka) * knobR * 0.25, ky + Math.sin(ka) * knobR * 0.25);
      g.lineTo(kx + Math.cos(ka) * knobR * 0.92, ky + Math.sin(ka) * knobR * 0.92);
      g.stroke();
      // Hinweis zum Drehen
      if (!knobUsed && !ctx.locked) {
        const pulse = reduced ? 0.6 : 0.5 + 0.5 * Math.sin(performance.now() / 280);
        g.strokeStyle = withAlpha(theme.series[0]!, 0.3 + 0.45 * pulse);
        g.lineWidth = 2;
        g.beginPath();
        g.arc(kx, ky, knobR + 18 * s + 2 * pulse, -Math.PI * 0.95, -Math.PI * 0.55);
        g.stroke();
        const tip = -Math.PI * 0.55;
        const rr = knobR + 18 * s + 2 * pulse;
        const tx = kx + Math.cos(tip) * rr;
        const ty = ky + Math.sin(tip) * rr;
        g.fillStyle = withAlpha(theme.series[0]!, 0.3 + 0.45 * pulse);
        g.beginPath();
        g.moveTo(tx + 6, ty);
        g.lineTo(tx - 3, ty - 5);
        g.lineTo(tx - 3, ty + 5);
        g.closePath();
        g.fill();
      }
      // Buchsen und Lampe für die Strombegrenzung
      socket(Gx.sPlus[0], Gx.sPlus[1], s, '#c62828');
      socket(Gx.sMinus[0], Gx.sMinus[1], s, '#1c1f24');
      text(g, '+', Gx.sPlus[0] - 13 * s, Gx.sPlus[1], { font: `800 ${Math.round(12 * s)}px ${theme.font}`, color: '#ffb4ab' });
      text(g, '−', Gx.sMinus[0] - 13 * s, Gx.sMinus[1], { font: `800 ${Math.round(12 * s)}px ${theme.font}`, color: 'rgba(235,240,248,0.8)' });
      const led: Pt = [Gx.sPlus[0], cy - H / 2 + 16 * s];
      g.save();
      if (op.limited) {
        g.shadowColor = 'rgba(255,80,40,0.9)';
        g.shadowBlur = 10 * s;
      }
      g.fillStyle = op.limited ? '#ff5a3c' : '#5a2a24';
      g.beginPath();
      g.arc(led[0], led[1], 3.6 * s, 0, Math.PI * 2);
      g.fill();
      g.restore();
      // Beschriftung links neben der Lampe – oder darunter, wenn sie den Titel berühren würde
      const ccFont = `600 ${Math.max(8, Math.round(8 * s))}px ${theme.font}`;
      g.font = ccFont;
      const ccW = g.measureText(ctx.t('cc')).width;
      g.font = `700 ${Math.max(9, Math.round(10.5 * s))}px ${theme.font}`;
      const titleRight = cx - W / 2 + 10 * s + g.measureText(ctx.t('supply')).width;
      const ccColor = op.limited ? '#ffb4ab' : 'rgba(235,240,248,0.55)';
      if (led[0] - 8 * s - ccW > titleRight + 6) text(g, ctx.t('cc'), led[0] - 8 * s, led[1], { font: ccFont, color: ccColor, align: 'right' });
      else text(g, ctx.t('cc'), led[0] + 5 * s, led[1] + 11 * s, { font: ccFont, color: ccColor, align: 'right' });
    }

    function drawBoard(Gx: Geo): void {
      const { s, board } = Gx;
      const dark = ctx.theme.dark;
      const W = 196 * s;
      const H = 34 * s;
      const [cx] = board;
      const cy = Gx.t1[1];
      g.save();
      shadowOn(10 * s, 4 * s);
      const gr = g.createLinearGradient(0, cy - H / 2, 0, cy + H / 2);
      gr.addColorStop(0, dark ? '#4a5463' : '#5b6574');
      gr.addColorStop(1, dark ? '#2c333e' : '#363e4a');
      g.fillStyle = gr;
      roundRect(g, cx - W / 2, cy - H / 2, W, H, 6 * s);
      g.fill();
      g.restore();
      g.fillStyle = 'rgba(255,255,255,0.16)';
      roundRect(g, cx - W / 2 + 2 * s, cy - H / 2 + 1.5 * s, W - 4 * s, 2 * s, s);
      g.fill();
    }

    function drawResistor(Gx: Geo, mystery: boolean): void {
      const { s, t1, t2 } = Gx;
      const cx = (t1[0] + t2[0]) / 2;
      const cy = t1[1] - 26 * s;
      const bw = 78 * s;
      const bh = 24 * s;
      // Anschlussdrähte
      g.strokeStyle = metalGradient(0, 0, '#e9edf2', '#9aa3ae');
      g.strokeStyle = '#a9b1bc';
      g.lineWidth = 2.2 * s;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.beginPath();
      g.moveTo(t1[0], t1[1]);
      g.lineTo(t1[0] + 6 * s, cy);
      g.lineTo(cx - bw / 2, cy);
      g.moveTo(t2[0], t2[1]);
      g.lineTo(t2[0] - 6 * s, cy);
      g.lineTo(cx + bw / 2, cy);
      g.stroke();
      // Körper (Metallschicht, blau)
      g.save();
      shadowOn(6 * s, 3 * s, 0.8);
      const body = g.createLinearGradient(0, cy - bh / 2, 0, cy + bh / 2);
      if (mystery) {
        body.addColorStop(0, '#8a8f98');
        body.addColorStop(0.45, '#5c616a');
        body.addColorStop(1, '#3a3e45');
      } else {
        body.addColorStop(0, '#a8cdf0');
        body.addColorStop(0.45, '#5b93c9');
        body.addColorStop(1, '#2e5d8c');
      }
      g.fillStyle = body;
      g.beginPath();
      const ex = bh * 0.55;
      g.moveTo(cx - bw / 2 + ex, cy - bh / 2);
      g.lineTo(cx + bw / 2 - ex, cy - bh / 2);
      g.bezierCurveTo(cx + bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2, cx + bw / 2 - ex, cy + bh / 2);
      g.lineTo(cx - bw / 2 + ex, cy + bh / 2);
      g.bezierCurveTo(cx - bw / 2, cy + bh / 2, cx - bw / 2, cy - bh / 2, cx - bw / 2 + ex, cy - bh / 2);
      g.closePath();
      g.fill();
      g.restore();
      if (mystery) {
        g.fillStyle = '#fffdf6';
        roundRect(g, cx - 14 * s, cy - 9 * s, 28 * s, 18 * s, 3 * s);
        g.fill();
        text(g, String(p.X), cx, cy + 0.5, { font: `800 ${Math.round(13 * s)}px ${ctx.theme.font}`, color: '#1d1d1d' });
        return;
      }
      // Farbringe
      const [d1, d2, d3, k] = colorBands(p.R);
      const bands = [BAND_COLORS[d1]!, BAND_COLORS[d2]!, BAND_COLORS[d3]!, k < 0 ? GOLD : BAND_COLORS[k]!, BAND_COLORS[1]!];
      const xs = [-0.3, -0.17, -0.04, 0.09, 0.3];
      bands.forEach((c, i) => {
        g.fillStyle = c;
        const x = cx + xs[i]! * bw;
        g.fillRect(x - 3 * s, cy - bh / 2 + (i === 0 || i === 4 ? 1.5 * s : 0), 6 * s, bh - (i === 0 || i === 4 ? 3 * s : 0));
      });
      const gloss = g.createLinearGradient(0, cy - bh / 2, 0, cy + bh / 2);
      gloss.addColorStop(0, 'rgba(255,255,255,0.35)');
      gloss.addColorStop(0.3, 'rgba(255,255,255,0)');
      gloss.addColorStop(1, 'rgba(0,0,0,0.15)');
      g.fillStyle = gloss;
      g.fillRect(cx - bw / 2 + ex * 0.5, cy - bh / 2, bw - ex, bh);
    }

    function drawLamp(Gx: Geo): void {
      const { s, t1, t2 } = Gx;
      const T = op.T;
      const glow = glowOf(T);
      const cx = (t1[0] + t2[0]) / 2;
      const baseTop = t1[1] - 14 * s;
      // Leitungen zur Fassung
      g.strokeStyle = '#a9b1bc';
      g.lineWidth = 2.2 * s;
      g.beginPath();
      g.moveTo(t1[0], t1[1]);
      g.lineTo(cx - 14 * s, baseTop + 6 * s);
      g.moveTo(t2[0], t2[1]);
      g.lineTo(cx + 14 * s, baseTop + 6 * s);
      g.stroke();
      const fw = 38 * s;
      const fh = 18 * s;
      g.save();
      shadowOn(6 * s, 2 * s, 0.8);
      const fass = g.createLinearGradient(cx - fw / 2, 0, cx + fw / 2, 0);
      fass.addColorStop(0, '#1d2128');
      fass.addColorStop(0.45, '#5a626e');
      fass.addColorStop(1, '#1d2128');
      g.fillStyle = fass;
      roundRect(g, cx - fw / 2, baseTop - fh, fw, fh + 4 * s, 3 * s);
      g.fill();
      g.restore();
      const thTop = baseTop - fh - 15 * s;
      g.fillStyle = metalGradient(cx - 12 * s, cx + 12 * s);
      roundRect(g, cx - 12 * s, thTop, 24 * s, 16 * s, 2 * s);
      g.fill();
      g.strokeStyle = 'rgba(60,66,76,0.55)';
      g.lineWidth = 1.1 * s;
      for (let k = 1; k < 4; k++) {
        g.beginPath();
        g.moveTo(cx - 12 * s, thTop + k * 4 * s);
        g.lineTo(cx + 12 * s, thTop + k * 4 * s - 1.5 * s);
        g.stroke();
      }
      const bulbR = 27 * s;
      const bc: Pt = [cx, thTop - bulbR * 0.85];
      if (glow > 0.005) {
        const [hr, hg, hb] = haloColor(T);
        const k = Math.min(1, glow);
        const Rh = bulbR * (1.5 + 3 * k);
        const halo = g.createRadialGradient(bc[0], bc[1], bulbR * 0.3, bc[0], bc[1], Rh);
        halo.addColorStop(0, `rgba(${hr},${hg},${hb},${0.55 * k})`);
        halo.addColorStop(0.35, `rgba(${hr},${hg},${hb},${0.2 * k})`);
        halo.addColorStop(1, `rgba(${hr},${hg},${hb},0)`);
        g.fillStyle = halo;
        g.fillRect(bc[0] - Rh, bc[1] - Rh, 2 * Rh, 2 * Rh);
      }
      const bulbPath = () => {
        g.beginPath();
        g.moveTo(cx - 11 * s, thTop + 1 * s);
        g.bezierCurveTo(cx - 11 * s, thTop - 6 * s, cx - bulbR, bc[1] + bulbR * 0.7, cx - bulbR, bc[1]);
        g.arc(bc[0], bc[1], bulbR, Math.PI, 0);
        g.bezierCurveTo(cx + bulbR, bc[1] + bulbR * 0.7, cx + 11 * s, thTop - 6 * s, cx + 11 * s, thTop + 1 * s);
        g.closePath();
      };
      const dark = ctx.theme.dark;
      const glass = g.createRadialGradient(bc[0] - bulbR * 0.3, bc[1] - bulbR * 0.3, bulbR * 0.1, bc[0], bc[1], bulbR * 1.3);
      if (glow > 0.02) {
        const k = Math.min(1, glow);
        glass.addColorStop(0, `rgba(255,250,225,${0.35 + 0.55 * k})`);
        glass.addColorStop(1, `rgba(255,214,140,${0.18 + 0.4 * k})`);
      } else {
        glass.addColorStop(0, dark ? 'rgba(230,240,255,0.28)' : 'rgba(255,255,255,0.75)');
        glass.addColorStop(1, dark ? 'rgba(160,180,210,0.16)' : 'rgba(190,205,225,0.45)');
      }
      bulbPath();
      g.fillStyle = glass;
      g.fill();
      const fy = bc[1] + 2 * s;
      g.strokeStyle = dark ? '#9aa3af' : '#6c7480';
      g.lineWidth = 1.1 * s;
      g.beginPath();
      g.moveTo(cx - 4 * s, thTop + 2 * s);
      g.lineTo(cx - 12 * s, fy);
      g.moveTo(cx + 4 * s, thTop + 2 * s);
      g.lineTo(cx + 12 * s, fy);
      g.stroke();
      const fc = filamentColor(T);
      g.save();
      if (glow > 0.05) {
        g.shadowColor = fc;
        g.shadowBlur = 12 * s * Math.min(1, glow);
      }
      g.strokeStyle = fc;
      g.lineWidth = 1.6 * s;
      g.beginPath();
      for (let k = 0; k <= 44; k++) {
        const u = k / 44;
        const x = cx - 12 * s + 24 * s * u;
        const y = fy - Math.abs(Math.sin(u * Math.PI * 8)) * 3 * s;
        if (k === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
      g.restore();
      bulbPath();
      g.strokeStyle = dark ? 'rgba(220,230,245,0.45)' : 'rgba(110,125,145,0.55)';
      g.lineWidth = 1.2 * s;
      g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.75)';
      g.lineWidth = 2 * s;
      g.lineCap = 'round';
      g.beginPath();
      g.arc(bc[0], bc[1], bulbR * 0.72, Math.PI * 1.08, Math.PI * 1.38);
      g.stroke();
    }

    /** Konstantandraht auf einer Messleiste; eine Klemme greift ihn bei der Länge l ab. */
    function drawWire(Gx: Geo): void {
      const { s, t1, at } = Gx;
      const theme = ctx.theme;
      const y = t1[1] - 20 * s;
      const x0 = at(206, 0)[0];
      const x1 = at(366, 0)[0];
      // Messleiste mit Teilung
      const ly = t1[1] - 9 * s;
      const wood = g.createLinearGradient(0, ly - 5 * s, 0, ly + 5 * s);
      wood.addColorStop(0, '#f8e7a8');
      wood.addColorStop(1, '#e2c26f');
      g.fillStyle = wood;
      roundRect(g, x0 - 8 * s, ly - 5 * s, x1 - x0 + 16 * s, 11 * s, 2 * s);
      g.fill();
      g.strokeStyle = '#5a4510';
      g.lineWidth = 0.8 * s;
      g.beginPath();
      for (let k = 0; k <= 20; k++) {
        const x = x0 + ((x1 - x0) * k) / 20;
        g.moveTo(x, ly - 5 * s);
        g.lineTo(x, ly - 5 * s + (k % 5 === 0 ? 5 : 2.5) * s);
      }
      g.stroke();
      for (const m of [0, 0.5, 1, 1.5, 2]) {
        text(g, fmt.num(m, 1), x0 + ((x1 - x0) * m) / 2, ly + 2.2 * s, { font: `700 ${Math.max(7, Math.round(7 * s))}px ${theme.font}`, color: '#5a4510' });
      }
      // Pfosten
      for (const x of [x0, x1]) {
        g.fillStyle = metalGradient(x - 3 * s, x + 3 * s);
        g.fillRect(x - 2.5 * s, y - 4 * s, 5 * s, 12 * s);
      }
      // Draht (Dicke übertrieben, wächst mit dem Durchmesser)
      const d = Math.sqrt((4 * p.A) / Math.PI);
      const wpx = Math.max(1.2, (1 + d * 4.2) * s);
      const xl = Gx.t2[0];
      const wire = g.createLinearGradient(0, y - wpx, 0, y + wpx);
      wire.addColorStop(0, '#f0e2c8');
      wire.addColorStop(0.5, '#b89f7a');
      wire.addColorStop(1, '#7d6744');
      g.strokeStyle = wire;
      g.lineWidth = wpx;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x0, y);
      g.lineTo(x1, y);
      g.stroke();
      // nicht durchflossener Teil blasser
      g.strokeStyle = withAlpha(theme.bg, 0.45);
      g.beginPath();
      g.moveTo(xl + 4 * s, y);
      g.lineTo(x1, y);
      g.stroke();
      // Anschluss links
      g.strokeStyle = '#a9b1bc';
      g.lineWidth = 2 * s;
      g.beginPath();
      g.moveTo(t1[0], t1[1]);
      g.lineTo(x0, y + 4 * s);
      g.stroke();
      // Abgreifklemme
      g.save();
      shadowOn(5 * s, 2 * s, 0.8);
      g.fillStyle = '#2b313a';
      roundRect(g, xl - 6 * s, y - 9 * s, 12 * s, 26 * s, 3 * s);
      g.fill();
      g.restore();
      g.fillStyle = metalGradient(xl - 5 * s, xl + 5 * s);
      g.fillRect(xl - 4.5 * s, y - 3 * s, 9 * s, 6 * s);
      // Maßpfeil l
      g.strokeStyle = theme.series[3]!;
      g.fillStyle = theme.series[3]!;
      g.lineWidth = 1.5;
      const ay = y - 15 * s;
      g.beginPath();
      g.moveTo(x0, ay);
      g.lineTo(xl, ay);
      g.stroke();
      for (const [x, dir] of [
        [x0, 1],
        [xl, -1],
      ] as const) {
        g.beginPath();
        g.moveTo(x, ay);
        g.lineTo(x + dir * 5, ay - 3);
        g.lineTo(x + dir * 5, ay + 3);
        g.closePath();
        g.fill();
      }
      text(g, `l = ${fmt.num(p.l, 1)} m`, (x0 + xl) / 2 + (xl - x0 < 50 * s ? 30 * s : 0), ay - 9 * s, { font: `700 ${Math.max(10, Math.round(11 * s))}px ${theme.font}`, color: theme.series[3]! });
      text(g, `A = ${fmt.num(p.A, 2)} mm²`, x0 + 2 * s, y + 46 * s, { font: `600 ${Math.max(10, Math.round(10.5 * s))}px ${theme.font}`, color: theme.muted, align: 'left' });
    }

    function drawTerminals(Gx: Geo): void {
      const { s, t1, t2 } = Gx;
      for (const q of [t1, t2]) {
        if (q === t2 && p.part === 'wire') continue;
        g.fillStyle = '#1a1e24';
        g.beginPath();
        g.arc(q[0], q[1], 7 * s, 0, Math.PI * 2);
        g.fill();
        screw(q[0], q[1], 5 * s);
      }
    }

    function drawPlan(rc: Rect, s: number): void {
      const theme = ctx.theme;
      g.save();
      g.fillStyle = theme.dark ? 'rgba(18,26,37,0.92)' : 'rgba(251,252,254,0.95)';
      roundRect(g, rc.x, rc.y, rc.w, rc.h, 10);
      g.fill();
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      roundRect(g, rc.x + 0.5, rc.y + 0.5, rc.w - 1, rc.h - 1, 10);
      g.stroke();
      text(g, ctx.t('plan'), rc.x + 10, rc.y + 13, { font: `700 ${narrow() ? 10.5 : 11}px ${theme.font}`, color: theme.muted, align: 'left' });
      const ink = theme.text;
      const k = Math.min(s, 1.2);
      const xL = rc.x + rc.w * 0.16;
      const xR = rc.x + rc.w * 0.9;
      const yT = rc.y + rc.h * 0.36;
      const yB = rc.y + rc.h * 0.86;
      const xA = rc.x + rc.w * 0.34;
      const xC = rc.x + rc.w * 0.64;
      const nL = xC - 30 * k;
      const nR = xC + 30 * k;
      const yV = rc.y + rc.h * 0.62;
      g.strokeStyle = ink;
      g.fillStyle = ink;
      g.lineWidth = 1.8;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      const ln = (pts: Pt[]) => {
        g.beginPath();
        pts.forEach(([x, y], i) => (i === 0 ? g.moveTo(x, y) : g.lineTo(x, y)));
        g.stroke();
      };
      const yS = (yT + yB) / 2;
      // Leitungen
      ln([
        [xL, yS - 4 * k],
        [xL, yT],
        [xA - 9 * k, yT],
      ]);
      ln([
        [xA + 9 * k, yT],
        [xC - 12 * k, yT],
      ]);
      ln([
        [xC + 12 * k, yT],
        [xR, yT],
        [xR, yB],
        [xL, yB],
        [xL, yS + 4 * k],
      ]);
      // Quelle (Pluspol oben)
      ln([
        [xL - 10 * k, yS - 4 * k],
        [xL + 10 * k, yS - 4 * k],
      ]);
      g.lineWidth = 4.2;
      g.lineCap = 'butt';
      ln([
        [xL - 5 * k, yS + 4 * k],
        [xL + 5 * k, yS + 4 * k],
      ]);
      g.lineWidth = 1.8;
      g.lineCap = 'round';
      text(g, 'U', xL - 18 * k, yS, { font: `italic 700 ${Math.round(12 * k)}px ${theme.mathFont}`, color: ink });
      // Messgeräte (Kreis mit Buchstabe)
      const meter = (x: number, y: number, letter: string) => {
        g.fillStyle = theme.dark ? '#121a25' : '#fbfcfe';
        g.beginPath();
        g.arc(x, y, 9 * k, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        text(g, letter, x, y + 0.5, { font: `700 ${Math.round(11 * k)}px ${theme.font}`, color: ink });
      };
      meter(xA, yT, 'A');
      // Bauteil
      if (p.part === 'lamp') {
        g.fillStyle = theme.dark ? '#121a25' : '#fbfcfe';
        g.beginPath();
        g.arc(xC, yT, 9 * k, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        const q = 9 * k * Math.SQRT1_2;
        ln([
          [xC - q, yT - q],
          [xC + q, yT + q],
        ]);
        ln([
          [xC + q, yT - q],
          [xC - q, yT + q],
        ]);
        ln([
          [xC - 12 * k, yT],
          [xC - 9 * k, yT],
        ]);
        ln([
          [xC + 9 * k, yT],
          [xC + 12 * k, yT],
        ]);
      } else {
        g.fillStyle = theme.dark ? '#121a25' : '#fbfcfe';
        g.fillRect(xC - 12 * k, yT - 4.5 * k, 24 * k, 9 * k);
        g.strokeRect(xC - 12 * k, yT - 4.5 * k, 24 * k, 9 * k);
      }
      // Voltmeter parallel zum Bauteil
      ln([
        [nL, yT],
        [nL, yV],
        [xC - 9 * k, yV],
      ]);
      ln([
        [xC + 9 * k, yV],
        [nR, yV],
        [nR, yT],
      ]);
      meter(xC, yV, 'V');
      g.fillStyle = ink;
      for (const x of [nL, nR]) {
        g.beginPath();
        g.arc(x, yT, 2.6, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
    }

    function drawExperiment(r: Rect): void {
      const theme = ctx.theme;
      const dark = theme.dark;
      const Gx = geo(r);
      G = Gx;
      const { s } = Gx;
      g.save();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      const bg = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      bg.addColorStop(0, dark ? '#1b2533' : '#eef2f6');
      bg.addColorStop(1, dark ? '#131b26' : '#dfe6ee');
      g.fillStyle = bg;
      g.fillRect(r.x, r.y, r.w, r.h);

      const A = meterSockets(Gx.ammeter, s);
      const V = meterSockets(Gx.voltmeter, s);
      drawBoard(Gx);
      // Leitungen (unter den Geräten)
      const red = '#d23b32';
      const blue = '#2f6fd6';
      cable(bezier(Gx.sPlus, [Gx.sPlus[0] + 34 * s, Gx.sPlus[1] - 30 * s], [A.plus[0], A.plus[1] + 70 * s], A.plus), red, s);
      cable(bezier(A.com, [A.com[0], A.com[1] + 60 * s], [Gx.t1[0] - 40 * s, Gx.t1[1] - 10 * s], Gx.t1), red, s);
      cable(bezier(Gx.t2, [Gx.t2[0] + 10 * s, Gx.t2[1] + 70 * s], [Gx.sMinus[0] + 90 * s, Gx.sMinus[1] + 40 * s], Gx.sMinus), blue, s);
      cable(bezier(V.plus, [V.plus[0], V.plus[1] + 55 * s], [Gx.t1[0] + 20 * s, Gx.t1[1] - 60 * s], Gx.t1), '#e8590c', s, 4.5);
      cable(bezier(V.com, [V.com[0], V.com[1] + 55 * s], [Gx.t2[0] + 20 * s, Gx.t2[1] - 60 * s], Gx.t2), '#1c6bb0', s, 4.5);
      // Bauteil
      if (p.part === 'lamp') drawLamp(Gx);
      else if (p.part === 'wire') drawWire(Gx);
      else drawResistor(Gx, p.part === 'mys');
      drawTerminals(Gx);
      // Stecker auf den Anschlüssen
      for (const q of [Gx.t1, Gx.t2, A.plus, A.com, V.plus, V.com, Gx.sPlus, Gx.sMinus]) {
        g.fillStyle = metalGradient(q[0] - 3 * s, q[0] + 3 * s);
        g.beginPath();
        g.arc(q[0], q[1], 3 * s, 0, Math.PI * 2);
        g.fill();
      }
      drawMeter(Gx.ammeter, s, 'A');
      drawMeter(Gx.voltmeter, s, 'V');
      drawSupply(Gx);
      // Beschriftung des Bauteils
      const sz = narrow() ? 11 : 12;
      const label = p.part === 'res' ? tr('res', { R: fmt.num(p.R, 0) }) : p.part === 'mys' ? tr('mys', { X: p.X }) : p.part === 'lamp' ? ctx.t('lamp') : `${ctx.t('wireShort').replace('{l}', fmt.num(p.l, 1))}`;
      if (p.part !== 'wire') pill(Gx.board[0], Gx.t1[1] + 22 * s, label, theme.muted, 'center', sz);
      if (Gx.planRect) drawPlan(Gx.planRect, s);
      g.restore();
    }

    /* ---------- Diagramm ---------- */
    function drawChart(dt: number): void {
      const theme = ctx.theme;
      const iu = axes() === 'IU';
      // Bereich: bis 12 V und bis zur größten Stromstärke (aktuelles Bauteil bei 12 V oder Messpunkte)
      const iMaxNow = operatingPoint(spec(), U_MAX).I;
      const iTarget = niceTop(Math.max(iMaxNow, ...points.map((q) => q.I), 0.05));
      const uTarget = U_MAX + 1;
      viewY = viewY > 0 && !reduced ? viewY + (iTarget - viewY) * Math.min(1, dt * 6) : iTarget;
      if (Math.abs(viewY - iTarget) < iTarget * 1e-3) viewY = iTarget;
      viewX = uTarget;
      const xMax = iu ? viewX : viewY;
      const yMax = iu ? viewY : viewX;
      const small = narrow();
      chart.setRangePadded([0, xMax], [0, yMax], { left: small ? 48 : 54, right: small ? 30 : 38, top: 26, bottom: 22 });
      chart.setAxes({ x: { label: ctx.t(iu ? 'axisU' : 'axisI') }, y: { label: ctx.t(iu ? 'axisI' : 'axisU') } });
      const gx = chart.begin();
      chart.grid();
      chart.axes();
      const pt = (U: number, I: number): Pt => (iu ? [U, I] : [I, U]);
      // Messreihen
      series.forEach((sr, idx) => {
        const color = theme.series[sr.color]!;
        const mine = points.filter((q) => q.series === idx).sort((a, b) => a.U - b.U);
        if (!mine.length) return;
        if (sr.kind === 'lamp') {
          if (mine.length >= 2) chart.polyline([pt(0, 0), ...mine.map((q) => pt(q.U, q.I))], { color, width: 2, alpha: 0.75 });
        } else if (p.fit && mine.length >= 2) {
          const k = fitThroughOrigin(mine.map((q) => ({ x: q.U, y: q.I })));
          if (k) {
            const R = 1 / k;
            const uAxis = iu ? xMax : yMax;
            const iAxis = iu ? yMax : xMax;
            const uBig = Math.max(uAxis, iAxis * R) * 1.5;
            chart.segment(pt(0, 0), pt(uBig, uBig / R), { color, width: 2, alpha: 0.85 });
            // Beschriftung kurz vor dem Rand des sichtbaren Bereichs
            const uLab = Math.min(uAxis, iAxis * R) * 0.86;
            const lp = pt(uLab, uLab / R);
            chart.text(lp[0], lp[1], tr('fitLabel', { R: fmt.num(R, R < 10 ? 2 : 0) }), { color, size: 12, weight: 'bold', align: 'right', baseline: 'bottom', offset: [-6, -6] });
          }
        }
        mine.forEach((q) => {
          const last = q === points[points.length - 1];
          const rad = last && pop.running ? 5.5 * Math.max(0.2, pop.value) : 5;
          const [x, y] = pt(q.U, q.I);
          chart.point(x, y, { color, radius: rad });
        });
      });
      // aktueller Arbeitspunkt
      const cur = pt(op.U, op.I);
      const curSeries = series.find((q) => q.key === currentKey());
      chart.arcPx(cur[0], cur[1], 8, 0, Math.PI * 2, { stroke: curSeries ? theme.series[curSeries.color] : theme.text, width: 2.2 });
      // Legende
      const r = chart.rect;
      let ly = r.y + 30;
      const lx = r.x + (small ? 56 : 64);
      gx.font = `600 ${small ? 11 : 12}px ${theme.font}`;
      series.forEach((sr, idx) => {
        if (!points.some((q) => q.series === idx)) return;
        const color = theme.series[sr.color]!;
        const w = gx.measureText(sr.label).width;
        gx.fillStyle = theme.dark ? 'rgba(16,22,31,0.85)' : 'rgba(255,255,255,0.88)';
        roundRect(gx, lx - 4, ly - 9, w + 24, 18, 6);
        gx.fill();
        gx.fillStyle = color;
        gx.beginPath();
        gx.arc(lx + 5, ly, 4.5, 0, Math.PI * 2);
        gx.fill();
        text(gx, sr.label, lx + 15, ly + 0.5, { font: `600 ${small ? 11 : 12}px ${theme.font}`, color: theme.text, align: 'left' });
        ly += 21;
      });
      if (!points.length) {
        const size = small ? 12 : 13;
        gx.font = `600 ${size}px ${theme.font}`;
        const maxW = r.w - 110;
        const lines: string[] = [];
        for (const word of ctx.t('empty').split(' ')) {
          const last = lines[lines.length - 1];
          if (last !== undefined && gx.measureText(`${last} ${word}`).width <= maxW) lines[lines.length - 1] = `${last} ${word}`;
          else lines.push(word);
        }
        lines.forEach((line, i) => chart.textPx(r.x + r.w / 2 + 22, r.y + 46 + i * (size + 5), line, { color: theme.muted, size, weight: '600', align: 'center', baseline: 'middle' }));
      }
      chart.end();
      gx.save();
      gx.strokeStyle = theme.grid;
      gx.lineWidth = 1;
      roundRect(gx, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 10);
      gx.stroke();
      gx.restore();
    }

    function currentKey(): string {
      const k = p.part as PartKind;
      return k === 'res' ? `res:${p.R}` : k === 'mys' ? `mys:${p.X}` : k === 'wire' ? `wire:${p.l}:${p.A}` : 'lamp';
    }

    /* ---------- Zeiger ---------- */
    function stepNeedles(dt: number): boolean {
      const targets = { A: op.I, V: op.U };
      let moving = false;
      for (const kind of ['A', 'V'] as const) {
        const n = needles[kind];
        n.range = autoRange(targets[kind], kind === 'A' ? AMP_RANGES : VOLT_RANGES, n.range);
        const target = targets[kind] / n.range;
        if (reduced) {
          n.pos = target;
          n.vel = 0;
          continue;
        }
        const w0 = 15;
        const zeta = 0.5;
        const h = 1 / 240;
        let t = dt;
        while (t > 1e-6) {
          const hh = Math.min(h, t);
          const a = -w0 * w0 * (n.pos - target) - 2 * zeta * w0 * n.vel;
          n.vel += a * hh;
          n.pos += n.vel * hh;
          t -= hh;
        }
        if (Math.abs(n.pos - target) < 1e-4 && Math.abs(n.vel) < 1e-3) {
          n.pos = target;
          n.vel = 0;
        } else moving = true;
      }
      return moving;
    }

    function settled(): boolean {
      return Math.abs(needles.A.vel) < 0.02 && Math.abs(needles.V.vel) < 0.02 && Math.abs(needles.A.pos - op.I / needles.A.range) < 0.004 && Math.abs(needles.V.pos - op.U / needles.V.range) < 0.004;
    }

    // Anfangsstellung der Zeiger
    needles.A.pos = op.I / needles.A.range;
    needles.V.pos = op.U / needles.V.range;

    return {
      update() {
        op = operatingPoint(spec(), p.U);
        updateReadouts();
        lastFrame = performance.now();
      },

      action(id) {
        if (id === 'measure') record();
        else if (id === 'clear') {
          points = [];
          series = [];
          auto = null;
          updateReadouts();
        } else if (id === 'auto') {
          if (ctx.locked) return;
          const sr = seriesFor();
          const idx = series.indexOf(sr);
          points = points.filter((q) => q.series !== idx);
          auto = { next: 0, wait: performance.now() + 250 };
          ctx.set({ U: 0 });
          updateReadouts();
        }
        lastFrame = performance.now();
        ctx.requestRender();
      },

      render() {
        const now = performance.now();
        const dt = Math.min(0.05, (now - lastFrame) / 1000);
        lastFrame = now;
        const moving = stepNeedles(dt);
        // Automatische Messreihe: Spannung in 1-V-Schritten erhöhen, nach dem Einschwingen messen
        if (auto && now >= auto.wait && settled() && Math.abs(p.U - auto.next) < 1e-6) {
          record();
          if (auto.next >= U_MAX) auto = null;
          else {
            auto.next = Math.min(U_MAX, auto.next + (p.part === 'lamp' ? 1 : 2));
            auto.wait = now + 200;
            ctx.set({ U: auto.next });
          }
          updateReadouts();
        }
        const reg = regions();
        chart.resize();
        surface.begin();
        drawExperiment(reg.exp);
        drawChart(dt);
        const hint = !knobUsed && !ctx.locked && !reduced;
        if (moving || pop.running || auto || hint || knobDrag || Math.abs(viewY - niceTop(Math.max(operatingPoint(spec(), U_MAX).I, ...points.map((q) => q.I), 0.05))) > 1e-9) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
