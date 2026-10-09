import { clamp, defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, TapTarget, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  agreedDigits,
  bisectStep,
  caseOf,
  decimalsOf,
  diffAt,
  evalFn,
  exactText,
  isCompound,
  isShortDecimal,
  isSimple,
  nextInterval,
  numText,
  polyOf,
  polyParts,
  polySub,
  rootText,
  roundTo,
  solveEquation,
  startInterval,
  substParts,
  termParts,
  type BisectStep,
  type Case,
  type Fn,
  type Interval,
  type Kind,
  type Part,
  type Root,
  type Solution,
  type Span,
} from './model';

const L = (de: string, en: string) => ({ de, en });

const KIND_OPTIONS = [
  { value: 'lin', label: L('Gerade', 'Line') },
  { value: 'quad', label: L('Parabel', 'Parabola') },
  { value: 'hyp', label: L('Hyperbel', 'Hyperbola') },
  { value: 'abs', label: L('Betrag', '|x|') },
] as const;

const KIND_HELP = L(
  'Gerade: mx + t · Parabel: a(x − d)² + e · Hyperbel: a/(x − d) + e · Betrag: a·|x − d| + e',
  'Line: mx + c · parabola: a(x − d)² + e · hyperbola: a/(x − d) + e · absolute value: a·|x − d| + e',
);

/** Regler einer Seite (Schlüssel mit Index 1 = links, 2 = rechts). */
function sideParams<S extends '1' | '2'>(s: S, kindKey: 'f' | 'g', group: string, def: { kind: Kind; m: number; t: number; a: number; d: number; e: number }) {
  const isLin = (v: Record<string, unknown>) => v[kindKey] === 'lin';
  const notLin = (v: Record<string, unknown>) => v[kindKey] !== 'lin';
  const sub = s === '1' ? '₁' : '₂';
  return [
    { key: kindKey, type: 'choice', group, label: L('Funktionsart', 'Type of function'), options: KIND_OPTIONS, default: def.kind, help: KIND_HELP },
    { key: `m${s}`, type: 'number', group, label: L(`Steigung m${sub}`, `Slope m${sub}`), min: -5, max: 5, step: 0.25, default: def.m, visibleIf: isLin },
    { key: `t${s}`, type: 'number', group, label: L(`y-Achsenabschnitt t${sub}`, `y-intercept c${sub}`), min: -8, max: 8, step: 0.25, default: def.t, visibleIf: isLin },
    { key: `a${s}`, type: 'number', group, label: L(`Faktor a${sub}`, `Factor a${sub}`), min: -4, max: 4, step: 0.25, default: def.a, visibleIf: notLin },
    { key: `d${s}`, type: 'number', group, label: L(`Verschiebung in x-Richtung d${sub}`, `Shift in x-direction d${sub}`), min: -6, max: 6, step: 0.25, default: def.d, visibleIf: notLin },
    { key: `e${s}`, type: 'number', group, label: L(`Verschiebung in y-Richtung e${sub}`, `Shift in y-direction e${sub}`), min: -6, max: 6, step: 0.25, default: def.e, visibleIf: notLin },
  ] as const;
}

/** Formelbausteine für den Satz im Bild (zusätzlich: kursive Namen und Farbwechsel). */
type Tok = Part | { k: 'v'; s: string } | { k: 'col'; c: string; inner: Tok[] };

/** Gesetzter Formelteil: Maße und Zeichenfunktion. */
interface Laid {
  w: number;
  asc: number;
  desc: number;
  paint(x: number, base: number, color: string): void;
}

/** Sichtbarer Ausschnitt: Mitte und Breite in x-Richtung (Höhe folgt aus dem Seitenverhältnis). */
interface View {
  cx: number;
  cy: number;
  w: number;
}

interface Bisection {
  /** Index der Lösung in sol.roots. */
  idx: number;
  iv: Interval;
  steps: BisectStep[];
  done: boolean;
}

const MAX_STEPS = 14;

/**
 * Gleichungen grafisch lösen: Beide Seiten f(x) und g(x) werden als Graphen
 * gezeichnet, die Lösungen sind die x-Koordinaten der Schnittpunkte. Mit
 * Differenzfunktion h = f − g (die Schnittpunkte „fallen“ auf die x-Achse)
 * und Intervallhalbierung mit Zoom zum Annähern krummer Lösungen.
 */
export default defineSimulation({
  id: 'gleichungen-grafisch',
  dragHint: true,
  layout: { aspect: 1.5, aspectNarrow: 0.6 },
  groups: [
    { id: 'left', label: L('Linke Seite f(x)', 'Left-hand side f(x)') },
    { id: 'right', label: L('Rechte Seite g(x)', 'Right-hand side g(x)') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    ...sideParams('1', 'f', 'left', { kind: 'quad', m: 2, t: -1, a: 1, d: 0, e: -1 }),
    ...sideParams('2', 'g', 'right', { kind: 'lin', m: 0.5, t: 2, a: -0.5, d: 1, e: 3 }),
    { key: 'diff', type: 'boolean', group: 'view', label: L('Als Nullstellen von h(x) = f(x) − g(x)', 'As zeros of h(x) = f(x) − g(x)'), default: false },
    { key: 'drop', type: 'boolean', group: 'view', label: L('Lote auf die x-Achse', 'Drop lines to the x-axis'), default: true },
    { key: 'show', type: 'boolean', group: 'view', label: L('Lösungen anzeigen', 'Show solutions'), default: true },
  ],
  actions: [
    { id: 'bisect', label: L('Lösung annähern', 'Approximate a solution'), primary: true },
    { id: 'overview', label: L('Zur Übersicht', 'Back to overview') },
  ],
  readouts: [
    { key: 'eq', label: L('Gleichung', 'Equation') },
    { key: 'case', label: L('Anzahl der Lösungen', 'Number of solutions'), spoiler: true },
    { key: 'sol', label: L('Lösungsmenge', 'Solution set'), spoiler: true },
    { key: 'probe', label: L('Probe', 'Check'), spoiler: true },
    { key: 'bis', label: L('Intervallhalbierung', 'Bisection') },
  ],
  presets: [
    { id: 'start', label: L('Parabel und Gerade', 'Parabola and line'), values: {} },
    { id: 'touch', label: L('Berührpunkt', 'Touching point'), values: { e1: 0, m2: 2, t2: -1 } },
    { id: 'none', label: L('Keine Lösung', 'No solution'), values: { a1: 0.5, e1: 2, m2: 1, t2: 0 } },
    { id: 'hyp', label: L('Bruchgleichung', 'Fractional equation'), values: { f: 'hyp', a1: 2, d1: 1, e1: 0, m2: 1, t2: 0 } },
    { id: 'sqrt2', label: L('√2 annähern', 'Approximating √2'), values: { e1: 0, m2: 0, t2: 2 } },
    { id: 'abs', label: L('Betragsgleichung', 'Absolute value equation'), values: { f: 'abs', a1: 1, d1: 1, e1: 0, m2: 0.5, t2: 1 } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatensystem mit den Graphen der beiden Seiten einer Gleichung; die Lösungen sind die x-Koordinaten der Schnittpunkte',
      eqTitle: 'Gleichung',
      solTitle: 'Lösungen',
      bisTitle: 'Intervallhalbierung für {x}',
      c_none: 'keine Lösung',
      c_one: 'eine Lösung',
      c_touch: 'eine Lösung (Berührpunkt)',
      c_two: 'zwei Lösungen',
      c_many: '{n} Lösungen',
      c_infinite: 'unendlich viele Lösungen',
      l_none: 'Die Graphen haben keinen gemeinsamen Punkt – die Gleichung hat keine Lösung.',
      l_one: 'Die Graphen schneiden sich in genau einem Punkt – eine Lösung.',
      l_touch: 'Die Graphen berühren sich in genau einem Punkt – eine Lösung.',
      l_two: 'Die Graphen schneiden sich in zwei Punkten – zwei Lösungen.',
      l_many: 'Die Graphen haben {n} gemeinsame Punkte – {n} Lösungen.',
      l_infinite: 'Die Graphen fallen (teilweise) zusammen – unendlich viele Lösungen.',
      hidden: 'Lösungen ausgeblendet',
      hiddenHint: 'Lies die x-Koordinaten der Schnittpunkte selbst ab.',
      noneHint: 'Kein gemeinsamer Punkt – also gibt es kein x mit f(x) = g(x).',
      infHint: 'Wo die Graphen zusammenfallen, ist jedes x eine Lösung.',
      rule: 'Lösung = x-Koordinate eines Schnittpunkts',
      ruleDiff: 'Lösung = Nullstelle von h',
      touch: 'Berührpunkt',
      touchHint: 'Berührpunkt: f − g wechselt hier nicht das Vorzeichen – keine Intervallhalbierung möglich.',
      tapHint: 'Tippe auf einen Schnittpunkt, um ihn auszuwählen.',
      approach: '{x} annähern',
      approachAny: 'Lösung annähern',
      halve: 'Intervall halbieren',
      colN: 'n',
      colInt: 'Intervall',
      colM: 'Mitte m',
      colSign: 'f − g',
      colSignH: 'h(m)',
      hit: 'Treffer: Die Mitte {m} ist genau die Lösung.',
      sure: 'Sicher: {x} ≈ {v}',
      sureNone: 'Noch keine Stelle sicher.',
      between: '{a} < {x} < {b}',
      domain: 'D = ℝ \\ {{gaps}}',
      outside: 'außerhalb',
      hDef: 'h(x) = f(x) − g(x)',
      zeroOfH: 'Gesucht: h(x) = 0',
      probeLine: 'x = {x}: f({x}) = {f} und g({x}) = {g} ✓',
      probeTitle: 'Probe mit {x}',
      probeOk: '✓ Beide Seiten haben denselben Wert.',
      probeNear: 'Nur ungefähr gleich – {x} ist gerundet.',
      probeApprox: 'x ≈ {x}: f({x}) ≈ {f} und g({x}) ≈ {g}',
      setPrefix: 'L =',
      setSep: '; ',
      keepLeft: 'links',
      keepRight: 'rechts',
      a0: 'a = 0: kein {kind}, sondern eine Parallele zur x-Achse',
      kindQuad: 'Parabel',
      kindHyp: 'Hyperbel',
      kindAbs: 'Betragsgraph',
    },
    en: {
      canvas: 'Coordinate plane with the graphs of both sides of an equation; the solutions are the x-coordinates of the points of intersection',
      eqTitle: 'Equation',
      solTitle: 'Solutions',
      bisTitle: 'Bisection for {x}',
      c_none: 'no solution',
      c_one: 'one solution',
      c_touch: 'one solution (touching point)',
      c_two: 'two solutions',
      c_many: '{n} solutions',
      c_infinite: 'infinitely many solutions',
      l_none: 'The graphs have no point in common – the equation has no solution.',
      l_one: 'The graphs intersect in exactly one point – one solution.',
      l_touch: 'The graphs touch in exactly one point – one solution.',
      l_two: 'The graphs intersect in two points – two solutions.',
      l_many: 'The graphs have {n} points in common – {n} solutions.',
      l_infinite: 'The graphs (partly) coincide – infinitely many solutions.',
      hidden: 'Solutions hidden',
      hiddenHint: 'Read off the x-coordinates of the intersections yourself.',
      noneHint: 'No common point – so there is no x with f(x) = g(x).',
      infHint: 'Where the graphs coincide, every x is a solution.',
      rule: 'solution = x-coordinate of an intersection',
      ruleDiff: 'solution = zero of h',
      touch: 'touching point',
      touchHint: 'Touching point: f − g does not change sign here – bisection is not possible.',
      tapHint: 'Tap a point of intersection to select it.',
      approach: 'Approximate {x}',
      approachAny: 'Approximate a solution',
      halve: 'Halve the interval',
      colN: 'n',
      colInt: 'interval',
      colM: 'midpoint m',
      colSign: 'f − g',
      colSignH: 'h(m)',
      hit: 'Hit: the midpoint {m} is exactly the solution.',
      sure: 'Certain: {x} ≈ {v}',
      sureNone: 'No decimal place certain yet.',
      between: '{a} < {x} < {b}',
      domain: 'D = ℝ \\ {{gaps}}',
      outside: 'outside',
      hDef: 'h(x) = f(x) − g(x)',
      zeroOfH: 'Find: h(x) = 0',
      probeLine: 'x = {x}: f({x}) = {f} and g({x}) = {g} ✓',
      probeTitle: 'Check with {x}',
      probeOk: '✓ Both sides have the same value.',
      probeNear: 'Only approximately equal – {x} is rounded.',
      probeApprox: 'x ≈ {x}: f({x}) ≈ {f} and g({x}) ≈ {g}',
      setPrefix: 'S =',
      setSep: ', ',
      keepLeft: 'left',
      keepRight: 'right',
      a0: 'a = 0: not a {kind} but a line parallel to the x-axis',
      kindQuad: 'parabola',
      kindHyp: 'hyperbola',
      kindAbs: 'V-shaped graph',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const lang = ctx.lang;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    const narrow = () => surface.width < 640;
    const sub = (i: number) => String(i + 1).replace(/[0-9]/g, (c) => '₀₁₂₃₄₅₆₇₈₉'[Number(c)]!);
    const xName = (i: number) => `x${sub(i)}`;

    /* ---------- Seiten der Gleichung ---------- */
    const fnF = (): Fn => ({ kind: p.f as Kind, m: p.m1, t: p.t1, a: p.a1, d: p.d1, e: p.e1 });
    const fnG = (): Fn => ({ kind: p.g as Kind, m: p.m2, t: p.t2, a: p.a2, d: p.d2, e: p.e2 });
    const hAt = (x: number) => diffAt(fnF(), fnG(), x);
    const colF = () => ctx.theme.series[0]!;
    const colG = () => ctx.theme.series[1]!;
    const colS = () => ctx.theme.series[2]!;
    const colB = () => ctx.theme.series[3]!;
    const colH = () => ctx.theme.series[4]!;

    /* ---------- Zustand ---------- */
    let sol: Solution = solveEquation(fnF(), fnG());
    let kase: Case = caseOf(sol);
    let sel = 0;
    let hover: number | null = null;
    let bis: Bisection | null = null;
    let message: string | null = null;
    /** Anteil der Differenzdarstellung (0: f und g, 1: h und x-Achse). */
    let diffFrom = p.diff ? 1 : 0;
    let diffTo = diffFrom;
    const morph = new Tween(950, ease.inOutCubic);
    const pop = new Tween(650, ease.outBack);
    const zoomTw = new Tween(750, ease.inOutCubic);
    const bandTw = new Tween(520, ease.inOutCubic);
    let zoomFrom: View = { cx: 0, cy: 1.5, w: 12 };
    let zoomTo: View = zoomFrom;
    let bandFrom: Interval = { a: 0, b: 0 };
    let viewKey = '';

    const diffT = () => diffFrom + (diffTo - diffFrom) * morph.value;
    const crossing = (i: number) => !!sol.roots[i] && !sol.roots[i]!.touch;

    /* ---------- Aufteilung der Zeichenfläche ---------- */
    function regions(): { plot: Rect; panel: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (!narrow()) {
        const pw = Math.round(clamp(w * 0.33, 236, 310));
        return { plot: { x: 0, y: 0, w: w - pw - 12, h }, panel: { x: w - pw, y: 0, w: pw, h } };
      }
      const ph = Math.round(Math.min(w * 1.02, h * 0.6));
      return { plot: { x: 0, y: 0, w, h: ph }, panel: { x: 0, y: ph + 8, w, h: h - ph - 8 } };
    }

    function insetRect(): Rect {
      if (!bis) return { x: -500, y: -500, w: 1, h: 1 };
      const r = regions().plot;
      const w = Math.round(clamp(r.w * 0.3, 104, 168));
      const h = Math.round(w * 0.74);
      return { x: r.x + 10, y: r.y + 10, w, h };
    }

    const plot = new Plot(surface, { x: [-6, 6], y: [-4.5, 7.5], region: () => regions().plot });
    const mini = new Plot(surface, { x: [-6.5, 6.5], y: [-5, 8], region: () => insetRect(), pan: false, zoom: false, controls: false, xAxis: { numbers: false, label: '' }, yAxis: { numbers: false, label: '' } });

    /* ---------- Ansicht ---------- */
    function overview(): View {
      return narrow() ? { cx: 0, cy: 1.2, w: 11 } : { cx: 0, cy: 1.5, w: 13 };
    }

    function applyView(v: View): void {
      const r = plot.rect;
      const k = r.h / Math.max(1, r.w);
      plot.setRange([v.cx - v.w / 2, v.cx + v.w / 2], [v.cy - (v.w / 2) * k, v.cy + (v.w / 2) * k]);
    }

    function currentView(): View {
      const b = plot.bounds;
      return { cx: (b.xMin + b.xMax) / 2, cy: (b.yMin + b.yMax) / 2, w: b.xMax - b.xMin };
    }

    function mixView(a: View, b: View, t: number): View {
      // Breite logarithmisch überblenden: gleichmäßiges Zoomgefühl
      const w = Math.exp(Math.log(a.w) + (Math.log(b.w) - Math.log(a.w)) * t);
      // Mitte so, dass sie sich im Verhältnis zur Breite bewegt
      const s = Math.abs(b.w - a.w) < 1e-12 ? t : (w - a.w) / (b.w - a.w);
      return { cx: a.cx + (b.cx - a.cx) * s, cy: a.cy + (b.cy - a.cy) * s, w };
    }

    function zoomToView(v: View): void {
      zoomFrom = currentView();
      zoomTo = v;
      zoomTw.play();
      ctx.requestRender();
    }

    /** Ausschnitt für die Intervallhalbierung: Intervall in der Mitte, ein Drittel der Breite. */
    function bisView(iv: Interval, idx: number): View {
      const root = sol.roots[idx];
      const w = Math.max(3 * (iv.b - iv.a), 2e-4);
      const yc = diffTo === 1 ? 0 : (root?.y ?? 0);
      return { cx: (iv.a + iv.b) / 2, cy: yc, w };
    }

    /* ---------- Ziehpunkte ---------- */
    const editable = (side: 'f' | 'g', lin: boolean) => () => !ctx.locked && diffT() === 0 && !morph.running && (p[side] === 'lin') === lin;
    const handlePoints = (): [number, number][] => {
      const pts: [number, number][] = [];
      for (const [side, f] of [
        ['f', fnF()],
        ['g', fnG()],
      ] as const) {
        if (!editable(side, f.kind === 'lin')()) continue;
        if (f.kind === 'lin') pts.push([0, f.t], [1, f.t + f.m]);
        else pts.push([f.d, f.e], [f.d + 1, f.e + f.a]);
      }
      return pts;
    };
    // Gerade: y-Achsenabschnitt und „1 nach rechts, m nach oben“
    plot.addHandle({ get: () => [0, p.t1], set: (_x, y) => ctx.set({ t1: y }), axis: 'y', enabled: editable('f', true), color: colF });
    plot.addHandle({ get: () => [1, p.t1 + p.m1], set: (_x, y) => ctx.set({ m1: y - p.t1 }), axis: 'y', enabled: editable('f', true), color: colF });
    plot.addHandle({ get: () => [0, p.t2], set: (_x, y) => ctx.set({ t2: y }), axis: 'y', enabled: editable('g', true), color: colG });
    plot.addHandle({ get: () => [1, p.t2 + p.m2], set: (_x, y) => ctx.set({ m2: y - p.t2 }), axis: 'y', enabled: editable('g', true), color: colG });
    // Parabel, Hyperbel, Betrag: Scheitel/Mittelpunkt (d | e) und Formpunkt (d + 1 | e + a)
    plot.addHandle({ get: () => [p.d1, p.e1], set: (x, y) => ctx.set({ d1: x, e1: y }), enabled: editable('f', false), color: colF });
    plot.addHandle({ get: () => [p.d1 + 1, p.e1 + p.a1], set: (_x, y) => ctx.set({ a1: y - p.e1 }), axis: 'y', enabled: editable('f', false), color: colF });
    plot.addHandle({ get: () => [p.d2, p.e2], set: (x, y) => ctx.set({ d2: x, e2: y }), enabled: editable('g', false), color: colG });
    plot.addHandle({ get: () => [p.d2 + 1, p.e2 + p.a2], set: (_x, y) => ctx.set({ a2: y - p.e2 }), axis: 'y', enabled: editable('g', false), color: colG });

    /* ---------- Antippen der Schnittpunkte ---------- */
    function markerPx(i: number): [number, number] | null {
      const r = sol.roots[i];
      if (!r) return null;
      const t = diffT();
      return plot.toPx(r.x, r.y * (1 - t));
    }

    function rootAt(px: number, py: number): number | null {
      if (!p.show || morph.running) return null;
      const pr = plot.rect;
      if (px < pr.x || px > pr.x + pr.w || py < pr.y || py > pr.y + pr.h) return null;
      // Ziehpunkte haben Vorrang
      if (handlePoints().some(([x, y]) => Math.hypot(plot.px(x) - px, plot.py(y) - py) < 16)) return null;
      let best: number | null = null;
      let bestD = 20;
      sol.roots.forEach((_, i) => {
        const m = markerPx(i);
        if (!m) return;
        const d = Math.hypot(m[0] - px, m[1] - py);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      return best;
    }

    new TapTarget(surface, {
      hit: (px, py) => {
        if (ctx.locked) return null;
        const i = rootAt(px, py);
        return i === null ? null : String(i);
      },
      onTap: (id) => selectRoot(Number(id)),
      onHover: (id) => {
        hover = id === null ? null : Number(id);
      },
    });

    function selectRoot(i: number): void {
      if (!sol.roots[i]) return;
      const changed = sel !== i;
      sel = i;
      message = sol.roots[i]!.touch ? ctx.t('touchHint') : null;
      if (bis && changed) {
        if (crossing(i)) startBisection();
        else endBisection();
      }
      pop.play();
      syncActions();
      updateReadouts();
    }

    /** Standardauswahl: zuerst eine „krumme“ Lösung (lohnt die Näherung), sonst die erste Schnittstelle. */
    function defaultSel(): number {
      const idx = sol.roots.map((r) => !r.touch && !isSimple(r.exact)).lastIndexOf(true);
      if (idx >= 0) return idx;
      const c = sol.roots.findIndex((r) => !r.touch);
      return c >= 0 ? c : 0;
    }

    /* ---------- Intervallhalbierung ---------- */
    function avoidPoints(): number[] {
      return [...sol.gaps, ...sol.roots.map((r) => r.x)];
    }

    function startBisection(): void {
      const r = sol.roots[sel];
      if (!r || r.touch) return;
      const iv = startInterval(hAt, r.x, avoidPoints());
      if (!iv) return;
      bis = { idx: sel, iv, steps: [], done: false };
      bandFrom = iv;
      bandTw.finish();
      message = null;
      zoomToView(bisView(iv, sel));
    }

    function halve(): void {
      if (!bis || bis.done) return;
      const step = bisectStep(hAt, bis.iv);
      bis.steps.push(step);
      bandFrom = bis.iv;
      bis.iv = nextInterval(step);
      bandTw.play();
      if (step.keep === 'hit' || bis.steps.length >= MAX_STEPS) bis.done = true;
      zoomToView(bisView(step.keep === 'hit' ? { a: step.a, b: step.b } : bis.iv, bis.idx));
    }

    function endBisection(animate = true): void {
      if (!bis) return;
      bis = null;
      if (animate) zoomToView(overview());
      else {
        zoomTw.finish();
        viewKey = '';
      }
    }

    function syncActions(): void {
      const r = sol.roots[sel];
      const canStart = !!r && !r.touch && kase !== 'infinite' && !ctx.locked;
      if (!bis) ctx.setAction('bisect', { enabled: canStart, label: canStart && p.show ? tr('approach', { x: xName(sel) }) : ctx.t('approachAny') });
      else ctx.setAction('bisect', { enabled: !bis.done && !ctx.locked, label: ctx.t('halve') });
      ctx.setAction('overview', { enabled: !!bis || plot.isViewChanged });
    }

    /* ---------- Texte ---------- */
    const n = (v: number, dec = 2) => numText(v, lang, dec);
    const setSep = () => ctx.t('setSep');

    function exactOrApprox(r: Root): string {
      if (r.exact) {
        const ex = exactText(r.exact, lang);
        return isSimple(r.exact) ? ex : `${ex} ≈ ${n(r.x)}`;
      }
      return `≈ ${n(r.x)}`;
    }

    /** Bedingung eines Bereichs: „x ≥ 0“, „0 ≤ x ≤ 2“. */
    function spanCond(s: Span): string {
      if (!Number.isFinite(s.to)) return `x ${s.fromIn ? '≥' : '>'} ${n(s.from, 3)}`;
      if (!Number.isFinite(s.from)) return `x ${s.toIn ? '≤' : '<'} ${n(s.to, 3)}`;
      return `${n(s.from, 3)} ${s.fromIn ? '≤' : '<'} x ${s.toIn ? '≤' : '<'} ${n(s.to, 3)}`;
    }

    function solutionSetText(): string {
      const prefix = ctx.t('setPrefix');
      const rootList = (rs: Root[]) => rs.map((r) => (r.exact && !isSimple(r.exact) ? exactText(r.exact, lang) : rootText(r, lang))).join(setSep());
      if (kase === 'infinite') {
        const sp = sol.spans;
        const joined = sp.every((s, i) => i === 0 || (sp[i - 1]!.to === s.from && sol.gaps.includes(s.from)));
        if (joined && sp[0]!.from === -Infinity && sp[sp.length - 1]!.to === Infinity) {
          const gaps = [...new Set(sol.gaps)].filter((v) => sp.some((s, i) => i > 0 && s.from === v));
          return gaps.length ? `${prefix} ℝ \\ {${gaps.map((v) => n(v, 3)).join(setSep())}}` : `${prefix} ℝ`;
        }
        const parts = sp.map((s) => `{x | ${spanCond(s)}}`);
        if (sol.roots.length) parts.push(`{${rootList(sol.roots)}}`);
        return `${prefix} ${parts.join(' ∪ ')}`;
      }
      if (!sol.roots.length) return `${prefix} { }`;
      return `${prefix} {${rootList(sol.roots)}}`;
    }

    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    function partsHtml(parts: Part[]): string {
      return parts
        .map((q) => {
          switch (q.k) {
            case 't':
              return esc(q.s);
            case 'x':
              return '<var>x</var>';
            case 'sup':
              return `<sup>${esc(q.s)}</sup>`;
            case 'frac':
              return `<span class="frac"><span>${partsHtml(q.num)}</span><span>${partsHtml(q.den)}</span></span>`;
            case 'abs':
              return `|${partsHtml(q.inner)}|`;
          }
        })
        .join('');
    }

    /** Term von h = f − g (ausmultipliziert, wenn beide Seiten Polynome sind). */
    function hParts(): Part[] {
      const pf = polyOf(fnF());
      const pg = polyOf(fnG());
      if (pf && pg) return polyParts(polySub(pf, pg), lang);
      const g = termParts(fnG(), lang);
      return [...termParts(fnF(), lang), { k: 't', s: ' − ' }, ...(isCompound(fnG()) ? [{ k: 't', s: '(' } as Part, ...g, { k: 't', s: ')' } as Part] : g)];
    }

    function updateReadouts(): void {
      const f = fnF();
      const g = fnG();
      ctx.readout('eq', {
        html: `<span style="color: var(--series-1)">${partsHtml(termParts(f, lang))}</span> = <span style="color: var(--series-2)">${partsHtml(termParts(g, lang))}</span>${sol.gaps.length ? ` &nbsp;(${esc(tr('domain', { gaps: [...new Set(sol.gaps)].map((v) => n(v, 3)).join(setSep()) }))})` : ''}`,
      });
      ctx.readout('case', tr(`l_${kase}`, { n: sol.roots.length }));
      ctx.readout('sol', solutionSetText());
      const probes = sol.roots.slice(0, 3).map((r) => {
        const xs = r.exact && isSimple(r.exact) ? n(r.x, 3) : n(r.x, 2);
        const exact = !!r.exact && isSimple(r.exact) && isShortDecimal(evalFn(f, r.x)) && isShortDecimal(evalFn(g, r.x));
        const xv = exact ? r.x : roundTo(r.x, 2);
        return tr(exact ? 'probeLine' : 'probeApprox', { x: xs, f: n(evalFn(f, xv), 3), g: n(evalFn(g, xv), 3) });
      });
      ctx.readout('probe', probes.length ? probes.join(' · ') : null);
      if (bis) {
        const head = `<tr><th>${ctx.t('colN')}</th><th>${ctx.t('colInt')}</th><th>${ctx.t('colM')}</th><th>${esc(ctx.t(diffTo === 1 ? 'colSignH' : 'colSign'))}</th></tr>`;
        const rows = bis.steps
          .slice(-6)
          .map((s) => `<tr><td>${bis!.steps.indexOf(s)}</td><td>[${ivNum(s.a, 'a')}; ${ivNum(s.b, 'b')}]</td><td>${ivNum(s.m, 'm')}</td><td>${s.keep === 'hit' ? '0' : s.hm > 0 ? '+' : '−'}</td></tr>`)
          .join('');
        const cur = `<tr class="is-current"><td>${bis.steps.length}</td><td>[${ivNum(bis.iv.a, 'a')}; ${ivNum(bis.iv.b, 'b')}]</td><td></td><td></td></tr>`;
        ctx.readout('bis', { html: `<table class="mini-table">${head}${rows}${bis.done && bis.steps[bis.steps.length - 1]?.keep === 'hit' ? '' : cur}</table>` });
      } else ctx.readout('bis', null);
    }

    /** Intervallgrenze mit passender Stellenzahl. */
    /**
     * Zahl einer Intervallhalbierung: exakt bis 5 Nachkommastellen; sonst
     * linke Grenze ab-, rechte Grenze aufgerundet (das Intervall bleibt gültig),
     * die Mitte mit „≈“.
     */
    function ivNum(v: number, mode: 'a' | 'b' | 'm'): string {
      const dec = decimalsOf(v, 6);
      if (Math.abs(roundTo(v, dec) - v) < 1e-12) return numText(v, lang, dec);
      if (mode === 'a') return numText(Math.floor(v * 1e5) / 1e5, lang, 5);
      if (mode === 'b') return numText(Math.ceil(v * 1e5) / 1e5, lang, 5);
      return `≈ ${numText(v, lang, 5)}`;
    }

    /* ---------- Formelsatz ---------- */
    function lay(parts: Tok[], size: number, weight = 650): Laid {
      const g = surface.g;
      const theme = ctx.theme;
      const items = parts.map((q): Laid => {
        switch (q.k) {
          case 't': {
            const font = `${weight} ${size}px ${theme.font}`;
            g.font = font;
            const w = g.measureText(q.s).width;
            return { w, asc: size * 0.74, desc: size * 0.24, paint: (x, b, c) => text(g, q.s, x, b, { font, color: c, align: 'left', baseline: 'alphabetic' }) };
          }
          case 'x':
          case 'v': {
            const s = q.k === 'x' ? 'x' : q.s;
            const font = `italic ${size * 1.12}px ${theme.mathFont}`;
            g.font = font;
            const w = g.measureText(s).width + size * 0.06;
            return { w, asc: size * 0.74, desc: size * 0.26, paint: (x, b, c) => text(g, s, x, b, { font, color: c, align: 'left', baseline: 'alphabetic' }) };
          }
          case 'sup': {
            const fs = size * 0.68;
            const font = `${weight} ${fs}px ${theme.font}`;
            g.font = font;
            const w = g.measureText(q.s).width + size * 0.05;
            const rise = size * 0.42;
            return { w, asc: rise + fs * 0.74, desc: 0, paint: (x, b, c) => text(g, q.s, x + size * 0.03, b - rise, { font, color: c, align: 'left', baseline: 'alphabetic' }) };
          }
          case 'frac': {
            const fs = size * 0.84;
            const num = lay(q.num, fs, weight);
            const den = lay(q.den, fs, weight);
            const pad = size * 0.14;
            const w = Math.max(num.w, den.w) + pad * 2;
            const axis = size * 0.3;
            const gap = size * 0.12;
            return {
              w: w + size * 0.08,
              asc: axis + gap + num.desc + num.asc,
              desc: -axis + gap + den.asc + den.desc,
              paint: (x, b, c) => {
                const yb = b - axis;
                num.paint(x + (w - num.w) / 2, yb - gap - num.desc, c);
                den.paint(x + (w - den.w) / 2, yb + gap + den.asc, c);
                g.strokeStyle = c;
                g.lineWidth = Math.max(1.2, size * 0.075);
                g.beginPath();
                g.moveTo(x + 1, yb);
                g.lineTo(x + w - 1, yb);
                g.stroke();
              },
            };
          }
          case 'abs': {
            const inner = lay(q.inner, size, weight);
            const pad = size * 0.22;
            return {
              w: inner.w + pad * 2,
              asc: inner.asc + 2,
              desc: inner.desc + 2,
              paint: (x, b, c) => {
                g.strokeStyle = c;
                g.lineWidth = Math.max(1.3, size * 0.08);
                g.lineCap = 'round';
                g.beginPath();
                g.moveTo(x + pad * 0.45, b - inner.asc - 1);
                g.lineTo(x + pad * 0.45, b + inner.desc + 1);
                g.moveTo(x + inner.w + pad * 1.55, b - inner.asc - 1);
                g.lineTo(x + inner.w + pad * 1.55, b + inner.desc + 1);
                g.stroke();
                inner.paint(x + pad, b, c);
              },
            };
          }
          case 'col': {
            const inner = lay(q.inner, size, weight);
            return { ...inner, paint: (x, b) => inner.paint(x, b, q.c) };
          }
        }
      });
      return {
        w: items.reduce((s, i) => s + i.w, 0),
        asc: Math.max(size * 0.74, ...items.map((i) => i.asc)),
        desc: Math.max(size * 0.24, ...items.map((i) => i.desc)),
        paint: (x, b, c) => {
          let cx = x;
          for (const i of items) {
            i.paint(cx, b, c);
            cx += i.w;
          }
        },
      };
    }

    /** Formel auf eine Breite einpassen (Schrift höchstens bis minSize verkleinern). */
    function layFit(parts: Tok[], size: number, maxW: number, minSize = 11, weight = 650): Laid {
      let l = lay(parts, size, weight);
      if (l.w > maxW) l = lay(parts, Math.max(minSize, (size * maxW) / l.w), weight);
      return l;
    }

    const tk = (s: string): Tok => ({ k: 't', s });
    const vk = (s: string): Tok => ({ k: 'v', s });
    const col = (c: string, inner: Tok[]): Tok => ({ k: 'col', c, inner });
    /** „f(x)“ als Bausteine. */
    const fx = (name: string): Tok[] => [vk(name), tk('('), { k: 'x' }, tk(')')];

    /* ---------- Bausteine: Karten, Schildchen ---------- */
    function card(r: Rect, accent?: string, tint = 0): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.fill();
      g.restore();
      if (accent && tint > 0) {
        g.fillStyle = withAlpha(accent, theme.dark ? tint * 1.6 : tint);
        roundRect(g, r.x, r.y, r.w, r.h, 12);
        g.fill();
      }
      g.strokeStyle = accent ? withAlpha(accent, 0.5) : theme.dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
    }

    /** Schildchen mit Rahmen (z. B. x-Werte an der Achse). */
    function tag(x: number, y: number, label: string, color: string, align: 'center' | 'left' | 'right' = 'center', size = 12, filled = false): Rect {
      const g = surface.g;
      const theme = ctx.theme;
      const font = `700 ${size}px ${theme.font}`;
      g.font = font;
      const w = g.measureText(label).width + size;
      const h = size + 9;
      const left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.4)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 5;
      g.shadowOffsetY = 1;
      g.fillStyle = filled ? color : theme.dark ? '#141b26' : '#ffffff';
      roundRect(g, left, y - h / 2, w, h, h / 2);
      g.fill();
      g.restore();
      if (!filled) {
        g.strokeStyle = withAlpha(color, 0.75);
        g.lineWidth = 1.3;
        roundRect(g, left + 0.5, y - h / 2 + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      text(g, label, left + w / 2, y + 0.5, { font, color: filled ? '#ffffff' : color });
      return { x: left, y: y - h / 2, w, h };
    }

    function wrap(str: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const rows: string[] = [];
      let cur = '';
      for (const w of str.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          rows.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) rows.push(cur);
      return rows;
    }

    /* ---------- Zeichnen: Graphen ---------- */
    /** Graph ohne senkrechte Linien an Polstellen. */
    function curve(target: Plot, f: (x: number) => number, color: string, width: number, poles: readonly number[], alpha = 1, dash?: number[], range?: [number, number]): void {
      const b = target.bounds;
      const lo = Math.max(b.xMin, range?.[0] ?? -Infinity);
      const hi = Math.min(b.xMax, range?.[1] ?? Infinity);
      if (!(hi > lo)) return;
      const cuts = [...new Set(poles)].filter((v) => v > lo && v < hi).sort((u, v) => u - v);
      const eps = (b.xMax - b.xMin) * 1e-7;
      const edges = [lo, ...cuts.flatMap((c) => [c - eps, c + eps]), hi];
      for (let i = 0; i + 1 < edges.length; i += 2) target.fn(f, { color, width, alpha, dash, from: edges[i]!, to: edges[i + 1]! });
    }

    function drawGraphs(t: number): void {
      const f = fnF();
      const g = fnG();
      const poles = sol.gaps;
      // Asymptoten der Hyperbeln (blenden beim Übergang aus)
      if (t < 1) {
        for (const [fn, c] of [
          [f, colF()],
          [g, colG()],
        ] as const) {
          if (fn.kind !== 'hyp') continue;
          plot.hline(fn.e, { color: c, width: 1.4, dash: [6, 5], alpha: 0.55 * (1 - t) });
        }
      }
      // Senkrechte Asymptoten bleiben (auch h = f − g hat dort eine Polstelle)
      for (const v of new Set(poles)) plot.vline(v, { color: t > 0 ? mixColor(colF(), colH(), t) : f.kind === 'hyp' && f.d === v ? colF() : colG(), width: 1.4, dash: [6, 5], alpha: 0.55 });
      // g: wandert auf die x-Achse
      if (t < 1) curve(plot, (x) => evalFn(g, x) * (1 - t), colG(), 3.2, poles, 1 - 0.7 * t);
      // f bzw. h = f − g
      const c = t > 0 ? mixColor(colF(), colH(), t) : colF();
      curve(plot, (x) => evalFn(f, x) - t * evalFn(g, x), c, 3.4, poles);
      // Bei der Differenz: x-Achse betont (hier ist „g = 0“)
      if (t > 0.98) plot.hline(0, { color: withAlpha(colG(), 0.5), width: 2.4, dash: [10, 7] });
    }

    /** Wo ein Graph den sichtbaren Bereich verlässt (für die Beschriftung „f“, „g“). */
    function labelSpot(fn: (x: number) => number, avoid: [number, number][]): [number, number] | null {
      const r = plot.rect;
      const top = r.y + (bis ? 42 : 22);
      const bottom = r.y + r.h - (bis ? 70 : 26);
      const axisY = plot.py(0);
      const ins = insetRect();
      for (let px = r.x + r.w - 22; px > r.x + 40; px -= 5) {
        const x = plot.toWorld(px, 0)[0];
        const y = fn(x);
        if (!Number.isFinite(y)) continue;
        const py = plot.py(y);
        if (py < top || py > bottom) continue;
        if (px > r.x + r.w - 58 && py < r.y + 130) continue;
        if (px > r.x + r.w - 44 && Math.abs(py - axisY) < 22) continue;
        if (px > ins.x - 14 && px < ins.x + ins.w + 14 && py > ins.y - 14 && py < ins.y + ins.h + 14) continue;
        if (avoid.some(([ax, ay]) => Math.hypot(ax - px, ay - py) < 34)) continue;
        return [px, py];
      }
      return null;
    }

    function badge(px: number, py: number, name: string, color: string, alpha = 1): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha = alpha;
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.15)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1;
      g.beginPath();
      g.arc(px, py, 13, 0, Math.PI * 2);
      g.fillStyle = theme.dark ? '#141b26' : '#ffffff';
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = color;
      g.lineWidth = 2.2;
      g.stroke();
      text(g, name, px - 0.5, py + 1, { font: `italic 700 17px ${theme.mathFont}`, color });
      g.restore();
    }

    function drawLabels(t: number): void {
      const f = fnF();
      const g = fnG();
      const avoid: [number, number][] = [];
      sol.roots.forEach((_, i) => {
        const m = markerPx(i);
        if (m) avoid.push(m);
      });
      const hf = (x: number) => evalFn(f, x) - t * evalFn(g, x);
      const sf = labelSpot(hf, avoid);
      if (sf) avoid.push(sf);
      const sg = t < 0.6 ? labelSpot((x) => evalFn(g, x) * (1 - t), avoid) : null;
      if (sg) badge(sg[0], sg[1], 'g', colG(), 1 - t / 0.6);
      if (sf) badge(sf[0], sf[1], t > 0.5 ? 'h' : 'f', t > 0 ? mixColor(colF(), colH(), t) : colF());
    }

    /* ---------- Zeichnen: Schnittpunkte und Lote ---------- */
    function drawRoots(t: number, now: number): void {
      if (!p.show) return;
      const g = surface.g;
      const theme = ctx.theme;
      const r = plot.rect;
      const green = colS();
      const k = pop.running ? Math.max(0, pop.value) : 1;
      const axisY = clamp(plot.py(0), r.y + 14, r.y + r.h - 14);
      const tags: Rect[] = [];
      // Zusammenfallende Bereiche als breites, helles Band auf den Graphen
      for (const s of sol.spans) {
        const from = Math.max(s.from, plot.bounds.xMin);
        const to = Math.min(s.to, plot.bounds.xMax);
        if (!(to > from)) continue;
        curve(plot, (x) => evalFn(fnF(), x) - t * evalFn(fnG(), x), withAlpha(green, 0.35), 11, sol.gaps, 1, undefined, [from, to]);
        for (const [end, isIn] of [
          [s.from, s.fromIn],
          [s.to, s.toIn],
        ] as const) {
          if (!Number.isFinite(end) || !isIn) continue;
          plot.point(end, evalFn(fnF(), end) - t * evalFn(fnG(), end), { color: green, radius: 6.5 });
        }
      }
      sol.roots.forEach((root, i) => {
        const y = root.y * (1 - t);
        const [px, py] = plot.toPx(root.x, y);
        const inside = px >= r.x - 2 && px <= r.x + r.w + 2 && py >= r.y - 2 && py <= r.y + r.h + 2;
        if (!inside) {
          if (bis) return;
          // Pfeil am Rand in Richtung der Lösung
          const cx = clamp(px, r.x + 22, r.x + r.w - 22);
          const cy = clamp(py, r.y + 22, r.y + r.h - 22);
          const ang = Math.atan2(py - cy, px - cx);
          g.save();
          g.translate(cx, cy);
          g.rotate(ang);
          g.fillStyle = green;
          g.beginPath();
          g.moveTo(11, 0);
          g.lineTo(-5, -7);
          g.lineTo(-5, 7);
          g.closePath();
          g.fill();
          g.restore();
          tag(clamp(cx - Math.cos(ang) * 18, r.x + 40, r.x + r.w - 40), cy - Math.sin(ang) * 18 + (Math.sin(ang) > 0.3 ? -16 : Math.sin(ang) < -0.3 ? 16 : 0), `${xName(i)} ${rootText(root, lang).startsWith('≈') ? '' : '= '}${rootText(root, lang)}`, green, 'center', 11);
          return;
        }
        // Lot auf die x-Achse
        if (p.drop && !bis && Math.abs(py - axisY) > 3) {
          g.save();
          g.strokeStyle = green;
          g.globalAlpha = 0.85;
          g.lineWidth = 1.7;
          g.setLineDash([5, 4]);
          g.beginPath();
          g.moveTo(px, py);
          g.lineTo(px, axisY);
          g.stroke();
          g.restore();
          // Fußpunkt auf der x-Achse
          g.beginPath();
          g.arc(px, axisY, 3.6, 0, Math.PI * 2);
          g.fillStyle = green;
          g.fill();
        }
        // x-Wert an der Achse (Lösung!)
        if ((p.drop || t > 0.98) && !bis) {
          const below = root.y * (1 - t) >= 0;
          const off = 17 + 8 * t;
          let ty = axisY + (below ? off : -off);
          const label = `${xName(i)} ${rootText(root, lang).startsWith('≈') ? '' : '= '}${rootText(root, lang)}`;
          g.font = `700 12px ${theme.font}`;
          const w = g.measureText(label).width + 12;
          const tx = clamp(px, r.x + w / 2 + 4, r.x + r.w - w / 2 - 4);
          // Überlappung mit dem vorigen Schildchen vermeiden
          for (const q of tags) {
            if (Math.abs(q.y + q.h / 2 - ty) < 20 && tx - w / 2 < q.x + q.w + 4 && tx + w / 2 > q.x - 4) ty += below ? 23 : -23;
          }
          tags.push(tag(tx, ty, label, green));
        }
        // Punkt
        const selected = i === sel && (bis !== null || sol.roots.length > 1);
        const hov = hover === i;
        const pulse = reduced || !selected ? 0 : (Math.sin(now / 380) + 1) / 2;
        g.beginPath();
        g.arc(px, py, (12 + pulse * 5 + (hov ? 3 : 0)) * k, 0, Math.PI * 2);
        g.fillStyle = withAlpha(green, selected || hov ? 0.2 : 0.13);
        g.fill();
        if (root.touch) {
          g.beginPath();
          g.arc(px, py, 7.5 * k, 0, Math.PI * 2);
          g.fillStyle = theme.bg;
          g.fill();
          g.lineWidth = 3;
          g.strokeStyle = green;
          g.stroke();
          g.beginPath();
          g.arc(px, py, 2.6 * k, 0, Math.PI * 2);
          g.fillStyle = green;
          g.fill();
          if (t < 0.5) tag(px, py - 26, ctx.t('touch'), green, 'center', 11);
        } else {
          g.beginPath();
          g.arc(px, py, 7 * k, 0, Math.PI * 2);
          g.fillStyle = green;
          g.fill();
          g.lineWidth = 2;
          g.strokeStyle = theme.bg;
          g.stroke();
        }
        if (selected) {
          g.beginPath();
          g.arc(px, py, 11 * k, 0, Math.PI * 2);
          g.lineWidth = 1.6;
          g.strokeStyle = withAlpha(green, 0.8);
          g.stroke();
        }
      });
    }

    /* ---------- Zeichnen: Intervall der Halbierung ---------- */
    function shownInterval(): Interval | null {
      if (!bis) return null;
      const k = bandTw.value;
      const to = bis.done && bis.steps[bis.steps.length - 1]?.keep === 'hit' ? bis.iv : bis.iv;
      return { a: bandFrom.a + (to.a - bandFrom.a) * k, b: bandFrom.b + (to.b - bandFrom.b) * k };
    }

    function drawBand(t: number): void {
      const iv = shownInterval();
      if (!bis || !iv) return;
      const g = surface.g;
      const r = plot.rect;
      const orange = colB();
      const pa = plot.px(iv.a);
      const pb = plot.px(iv.b);
      const hit = bis.done && bis.steps[bis.steps.length - 1]?.keep === 'hit';
      // Band
      g.save();
      const grad = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      grad.addColorStop(0, withAlpha(orange, 0.05));
      grad.addColorStop(0.5, withAlpha(orange, 0.13));
      grad.addColorStop(1, withAlpha(orange, 0.05));
      g.fillStyle = grad;
      g.fillRect(pa, r.y, Math.max(1.5, pb - pa), r.h);
      g.strokeStyle = withAlpha(orange, 0.9);
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(Math.round(pa) + 0.5, r.y);
      g.lineTo(Math.round(pa) + 0.5, r.y + r.h);
      g.moveTo(Math.round(pb) + 0.5, r.y);
      g.lineTo(Math.round(pb) + 0.5, r.y + r.h);
      g.stroke();
      g.restore();
      if (bandTw.running) return;
      if (hit) {
        const last = bis.steps[bis.steps.length - 1]!;
        plot.vline(last.m, { color: colS(), width: 2.4 });
        tag(plot.px(last.m), r.y + r.h - 44, `${xName(bis.idx)} = ${ivNum(last.m, 'm')}`, colS(), 'center', 12, true);
        return;
      }
      // Mitte m (nächster Schritt)
      const f = fnF();
      const gg = fnG();
      const val = (x: number, which: 'f' | 'g') => (which === 'f' ? evalFn(f, x) - t * evalFn(gg, x) : evalFn(gg, x) * (1 - t));
      const m = (iv.a + iv.b) / 2;
      if (!hit) {
        plot.vline(m, { color: orange, width: 1.4, dash: [4, 4], alpha: 0.8 });
      }
      // Abstand von f und g an den Rändern (orange Lote zwischen den Graphen)
      for (const x of [iv.a, iv.b]) {
        const yf = val(x, 'f');
        const yg = val(x, 'g');
        const [px, pf] = plot.toPx(x, yf);
        const pg = plot.py(yg);
        g.save();
        g.strokeStyle = orange;
        g.lineWidth = 2.6;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(px, pf);
        g.lineTo(px, pg);
        g.stroke();
        g.restore();
        plot.point(x, yf, { color: t > 0.5 ? colH() : colF(), radius: 4.5 });
        if (t < 0.98) plot.point(x, yg, { color: colG(), radius: 4.5 });
      }
      // Grenzen a, b unten, daneben das Vorzeichen von f − g; Mitte m oben
      const by = r.y + r.h - 44;
      const ta = tag(pa - 7, by, `a = ${ivNum(iv.a, 'a')}`, orange, 'right', 11.5);
      signDot(ta.x - 15, by, hAt(iv.a));
      const tb = tag(pb + 7, by, `b = ${ivNum(iv.b, 'b')}`, orange, 'left', 11.5);
      signDot(tb.x + tb.w + 15, by, hAt(iv.b));
      if (!hit) tag(plot.px(m), r.y + 16, `m ${ivNum(m, 'm').startsWith('≈') ? '' : '= '}${ivNum(m, 'm')}`, orange, 'center', 11.5);
    }

    /** Runder Knopf mit dem Vorzeichen von f − g (blau: f oben, rot: g oben). */
    function signDot(x: number, y: number, v: number): void {
      const g = surface.g;
      const c = v > 0 ? colF() : v < 0 ? colG() : colS();
      g.save();
      g.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.4)' : 'rgba(16,24,40,0.15)';
      g.shadowBlur = 5;
      g.shadowOffsetY = 1;
      g.beginPath();
      g.arc(x, y, 10, 0, Math.PI * 2);
      g.fillStyle = c;
      g.fill();
      g.restore();
      text(g, v > 0 ? '+' : v < 0 ? '−' : '0', x, y + 0.5, { font: `800 15px ${ctx.theme.font}`, color: '#ffffff' });
    }

    /* ---------- Zeichnen: Übersicht (Lupe) ---------- */
    function drawInset(t: number): void {
      if (!bis) return;
      mini.resize();
      const R = insetRect();
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.2)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.bg;
      roundRect(g, R.x, R.y, R.w, R.h, 10);
      g.fill();
      g.restore();
      g.save();
      roundRect(g, R.x, R.y, R.w, R.h, 10);
      g.clip();
      mini.begin();
      mini.grid({ minor: false });
      mini.axes();
      const f = fnF();
      const gg = fnG();
      if (t < 1) curve(mini, (x) => evalFn(gg, x) * (1 - t), colG(), 2, sol.gaps, 1 - 0.7 * t);
      curve(mini, (x) => evalFn(f, x) - t * evalFn(gg, x), t > 0 ? mixColor(colF(), colH(), t) : colF(), 2.2, sol.gaps);
      // Ausschnitt des Hauptbilds
      const b = plot.bounds;
      const [x0, y0] = mini.toPx(b.xMin, b.yMax);
      const [x1, y1] = mini.toPx(b.xMax, b.yMin);
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      const orange = colB();
      if (x1 - x0 > 7) {
        g.fillStyle = withAlpha(orange, 0.14);
        g.fillRect(x0, y0, x1 - x0, y1 - y0);
        g.strokeStyle = orange;
        g.lineWidth = 1.6;
        g.strokeRect(x0, y0, x1 - x0, y1 - y0);
      }
      // Lupe
      g.strokeStyle = orange;
      g.lineWidth = 2.4;
      g.beginPath();
      g.arc(cx, cy, 8, 0, Math.PI * 2);
      g.stroke();
      g.lineWidth = 3.2;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(cx + 6, cy + 6);
      g.lineTo(cx + 12, cy + 12);
      g.stroke();
      mini.end();
      g.restore();
      g.strokeStyle = theme.dark ? '#2b3545' : '#cfd7e2';
      g.lineWidth = 1.2;
      roundRect(g, R.x + 0.5, R.y + 0.5, R.w - 1, R.h - 1, 10);
      g.stroke();
      // Vergrößerung
      const zoom = 13 / Math.max(1e-9, b.xMax - b.xMin);
      if (zoom >= 1.5) {
        const label = `${zoom >= 100 ? fmt.num(Math.round(zoom), 0) : fmt.num(zoom, 1)}×`;
        tag(R.x + R.w - 8, R.y + R.h - 13, label, orange, 'right', 10.5);
      }
    }

    /* ---------- Zeichnen: Karten rechts bzw. unten ---------- */
    interface Row {
      h: number;
      draw(x: number, y: number, w: number): void;
    }

    function titleRow(label: string, color?: string): Row {
      const fs = narrow() ? 11 : 12;
      return {
        h: fs + 8,
        draw: (x, y) => text(surface.g, label.toUpperCase(), x, y + fs / 2 + 2, { font: `750 ${fs}px ${ctx.theme.font}`, color: color ?? ctx.theme.muted, align: 'left' }),
      };
    }

    function formulaRow(parts: Tok[], size: number, maxW: number, color: string, extraH = 0): Row {
      const l = layFit(parts, size, maxW);
      return { h: l.asc + l.desc + 8 + extraH, draw: (x, y) => l.paint(x, y + 4 + l.asc + extraH / 2, color) };
    }

    function noteRow(str: string, maxW: number, color?: string, size?: number): Row {
      const fs = size ?? (narrow() ? 11.5 : 12.5);
      const font = `600 ${fs}px ${ctx.theme.font}`;
      const rows = wrap(str, maxW, font);
      return {
        h: rows.length * fs * 1.32 + 4,
        draw: (x, y) => rows.forEach((row, i) => text(surface.g, row, x, y + fs * 0.72 + 2 + i * fs * 1.32, { font, color: color ?? ctx.theme.muted, align: 'left' })),
      };
    }

    function pillRow(label: string, color: string): Row {
      const fs = narrow() ? 12 : 13;
      return {
        h: fs + 14,
        draw: (x, y) => {
          const g = surface.g;
          const font = `750 ${fs}px ${ctx.theme.font}`;
          g.font = font;
          const w = g.measureText(label).width + 22;
          const kk = pop.running ? clamp(pop.value, 0.6, 1.2) : 1;
          g.save();
          g.translate(x + w / 2, y + (fs + 10) / 2 + 1);
          g.scale(kk, kk);
          g.fillStyle = withAlpha(color, ctx.theme.dark ? 0.24 : 0.13);
          roundRect(g, -w / 2, -(fs + 10) / 2, w, fs + 10, (fs + 10) / 2);
          g.fill();
          g.strokeStyle = withAlpha(color, 0.6);
          g.lineWidth = 1.2;
          g.stroke();
          text(g, label, 0, 0.5, { font, color });
          g.restore();
        },
      };
    }

    function gapRow(h: number): Row {
      return { h, draw: () => {} };
    }

    function equationCard(w: number, compact: boolean): Row[] {
      const theme = ctx.theme;
      const t = diffTo;
      const f = fnF();
      const g = fnG();
      const fs = compact ? 15 : 17;
      const rows: Row[] = [titleRow(ctx.t('eqTitle'))];
      const fT = termParts(f, lang) as Tok[];
      const gT = termParts(g, lang) as Tok[];
      if (!compact) {
        rows.push(formulaRow([col(colF(), fx('f')), tk(' = '), col(colF(), fT)], fs, w, theme.text));
        rows.push(formulaRow([col(colG(), fx('g')), tk(' = '), col(colG(), gT)], fs, w, theme.text));
        rows.push(gapRow(2));
      }
      rows.push(formulaRow([col(colF(), fT), tk(' = '), col(colG(), gT)], compact ? 16 : 19, w, theme.text));
      if (sol.gaps.length) rows.push(noteRow(tr('domain', { gaps: [...new Set(sol.gaps)].map((v) => n(v, 3)).join(setSep()) }), w));
      for (const [fn, side] of [
        [f, 'f'],
        [g, 'g'],
      ] as const) {
        if (fn.kind !== 'lin' && fn.a === 0 && !compact) rows.push(noteRow(`${side}: ${tr('a0', { kind: ctx.t(fn.kind === 'quad' ? 'kindQuad' : fn.kind === 'hyp' ? 'kindHyp' : 'kindAbs') })}`, w));
      }
      if (t === 1) {
        rows.push(gapRow(4));
        rows.push(formulaRow([col(colH(), fx('h')), tk(' = '), col(colH(), hParts() as Tok[]), tk(' = 0')], compact ? 14 : 16, w, theme.text));
        if (!compact) rows.push(noteRow(ctx.t('ruleDiff'), w));
      }
      return rows;
    }

    function solutionCard(w: number, compact: boolean): Row[] {
      const theme = ctx.theme;
      const rows: Row[] = [titleRow(ctx.t('solTitle'), colS())];
      if (!p.show) {
        rows.push(noteRow(ctx.t('hidden'), w, theme.text, compact ? 13 : 14));
        rows.push(noteRow(ctx.t('hiddenHint'), w));
        return rows;
      }
      const caseColor = kase === 'none' ? colB() : kase === 'infinite' ? colH() : colS();
      rows.push(pillRow(tr(`c_${kase}`, { n: sol.roots.length }), caseColor));
      if (kase === 'none') rows.push(noteRow(ctx.t('noneHint'), w));
      if (kase === 'infinite') rows.push(noteRow(ctx.t('infHint'), w));
      const fs = compact ? 14 : 16;
      const maxRows = compact ? (sol.roots.length > 2 ? 0 : 2) : 4;
      sol.roots.slice(0, maxRows).forEach((r, i) => {
        const val = exactOrApprox(r);
        const parts: Tok[] = [vk('x'), { k: 't', s: `${sub(i)} ${val.startsWith('≈') ? '' : '= '}${val}` }];
        const l = layFit(parts, fs, w - 26);
        const selected = i === sel && sol.roots.length > 1;
        rows.push({
          h: l.asc + l.desc + 10,
          draw: (x, y, ww) => {
            const g = surface.g;
            if (selected) {
              g.fillStyle = withAlpha(colS(), theme.dark ? 0.16 : 0.09);
              roundRect(g, x - 6, y + 1, ww + 12, l.asc + l.desc + 8, 7);
              g.fill();
            }
            const cy = y + 5 + l.asc - fs * 0.32;
            g.beginPath();
            g.arc(x + 7, cy, r.touch ? 5 : 5.5, 0, Math.PI * 2);
            if (r.touch) {
              g.lineWidth = 2.2;
              g.strokeStyle = colS();
              g.stroke();
            } else {
              g.fillStyle = colS();
              g.fill();
            }
            l.paint(x + 20, y + 5 + l.asc, theme.text);
          },
        });
      });
      if (sol.roots.length > maxRows && maxRows > 0) rows.push(noteRow('…', w));
      rows.push(formulaRow([tk(solutionSetText())], compact ? 13 : 14, w, theme.text));
      if (!compact) {
        if (message) rows.push(noteRow(message, w, colB()));
        else if (sol.roots.length > 1 && !bis) rows.push(noteRow(ctx.t('tapHint'), w));
        else if (sol.roots.length) rows.push(noteRow(ctx.t(diffTo === 1 ? 'ruleDiff' : 'rule'), w));
      } else if (message) rows.push(noteRow(message, w, colB()));
      return rows;
    }

    function bisectCard(w: number, compact: boolean, maxShown: number): Row[] {
      if (!bis) return [];
      const theme = ctx.theme;
      const g = surface.g;
      const orange = colB();
      const rows: Row[] = [titleRow(tr('bisTitle', { x: xName(bis.idx) }), orange)];
      // Erledigte Schritte und – solange nicht fertig – das aktuelle Intervall mit der nächsten Mitte
      type Line = { i: number; a: number; b: number; m: number; sign: '+' | '−' | '0' | '?' };
      const all: Line[] = bis.steps.map((st, i) => ({ i, a: st.a, b: st.b, m: st.m, sign: st.keep === 'hit' ? '0' : st.hm > 0 ? '+' : '−' }));
      if (!bis.done) all.push({ i: bis.steps.length, a: bis.iv.a, b: bis.iv.b, m: (bis.iv.a + bis.iv.b) / 2, sign: '?' });
      const shown = all.slice(-Math.max(1, maxShown));
      const cells = shown.map((q) => [String(q.i), `[${ivNum(q.a, 'a')}; ${ivNum(q.b, 'b')}]`, ivNum(q.m, 'm')]);
      const head = [ctx.t('colN'), ctx.t('colInt'), ctx.t('colM'), ctx.t(diffTo === 1 ? 'colSignH' : 'colSign')];
      // Spaltenbreiten messen, Schrift notfalls verkleinern
      let fs = compact ? 11.5 : 12.5;
      const widths = (size: number) => {
        g.font = `600 ${size}px ${theme.font}`;
        const col = (j: number) => Math.max(g.measureText(head[j]!).width, ...cells.map((c) => g.measureText(c[j]!).width));
        return [col(0), col(1), col(2), Math.max(16, g.measureText(head[3]!).width)];
      };
      let ws = widths(fs);
      const need = ws.reduce((a, b) => a + b, 0) + 3 * 8;
      if (need > w) {
        fs = Math.max(9.5, fs * (w - 24) / (need - 24));
        ws = widths(fs);
      }
      const gapW = Math.max(6, (w - ws.reduce((a, b) => a + b, 0)) / 3);
      const xs = [0, ws[0]! + gapW, ws[0]! + ws[1]! + 2 * gapW, w - ws[3]!];
      const font = `600 ${fs}px ${theme.font}`;
      const bold = `750 ${fs}px ${theme.font}`;
      const rh = fs * 1.62;
      rows.push({
        h: rh,
        draw: (x, y) => head.forEach((hd, j) => text(g, hd, x + xs[j]!, y + rh / 2, { font: bold, color: theme.muted, align: 'left' })),
      });
      shown.forEach((q, k) => {
        const c = cells[k]!;
        const current = q.sign === '?';
        rows.push({
          h: rh,
          draw: (x, y, ww) => {
            if (current) {
              g.fillStyle = withAlpha(orange, theme.dark ? 0.16 : 0.1);
              roundRect(g, x - 5, y + 1, ww + 10, rh - 1, 5);
              g.fill();
            }
            g.strokeStyle = theme.dark ? '#253041' : '#edf0f4';
            g.lineWidth = 1;
            g.beginPath();
            g.moveTo(x, y + 0.5);
            g.lineTo(x + ww, y + 0.5);
            g.stroke();
            const cy = y + rh / 2 + 0.5;
            text(g, c[0]!, x, cy, { font, color: theme.muted, align: 'left' });
            text(g, c[1]!, x + xs[1]!, cy, { font, color: theme.text, align: 'left' });
            text(g, c[2]!, x + xs[2]!, cy, { font, color: orange, align: 'left' });
            const sc = q.sign === '0' ? colS() : q.sign === '+' ? colF() : q.sign === '−' ? colG() : theme.muted;
            text(g, q.sign, x + xs[3]! + ws[3]! / 2, cy, { font: `800 ${fs + 2}px ${theme.font}`, color: sc, align: 'center' });
          },
        });
      });
      // Aktuelles Intervall und gesicherte Stellen
      const last = bis.steps[bis.steps.length - 1];
      if (last?.keep === 'hit') rows.push(noteRow(tr('hit', { m: ivNum(last.m, 'm') }), w, colS(), compact ? 12 : 13));
      else {
        const iv = bis.iv;
        rows.push(formulaRow([tk(tr('between', { a: ivNum(iv.a, 'a'), x: xName(bis.idx), b: ivNum(iv.b, 'b') }))], compact ? 13 : 14, w, theme.text));
        const k = agreedDigits(iv.a, iv.b);
        rows.push(noteRow(k >= 0 ? tr('sure', { x: xName(bis.idx), v: numText((iv.a + iv.b) / 2, lang, k) }) : ctx.t('sureNone'), w, k >= 0 ? colS() : theme.muted, compact ? 12 : 13));
      }
      return rows;
    }

    /** Intervallhalbierung mit so vielen Tabellenzeilen, wie in die Höhe passen. */
    function bisectFit(w: number, compact: boolean, maxH: number, pad: number): Row[] {
      for (let k = compact ? 4 : 6; k >= 1; k--) {
        const rows = bisectCard(w, compact, k);
        if (rowsHeight(rows) + pad * 2 - 4 <= maxH || k === 1) return rows;
      }
      return [];
    }

    /** Probe: Lösung in beide Seiten einsetzen. */
    function probeCard(w: number): Row[] {
      const r = sol.roots[sel];
      if (!r || !p.show || kase === 'infinite') return [];
      const theme = ctx.theme;
      const f = fnF();
      const g = fnG();
      const simple = !!r.exact && isSimple(r.exact);
      const xv = simple ? n(r.x, 3) : n(r.x, 2);
      const xNum = simple ? r.x : roundTo(r.x, 2);
      const hasX = (parts: Part[]): boolean => parts.some((q) => q.k === 'x' || (q.k === 'frac' && (hasX(q.num) || hasX(q.den))) || (q.k === 'abs' && hasX(q.inner)));
      const rows: Row[] = [titleRow(tr('probeTitle', { x: `${xName(sel)} ${simple ? '=' : '≈'} ${xv}` }), colS())];
      const vals: number[] = [];
      for (const [fn, name, c] of [
        [f, 'f', colF()],
        [g, 'g', colG()],
      ] as const) {
        const v = evalFn(fn, xNum);
        vals.push(v);
        const parts = termParts(fn, lang);
        const res = `${isShortDecimal(v) ? ' = ' : ' ≈ '}${n(v, 3)}`;
        const toks: Tok[] = [col(c, [vk(name), tk(`(${xv})`)])];
        if (hasX(parts)) toks.push(tk(' = '), ...(substParts(parts, xv) as Tok[]));
        toks.push(tk(res));
        rows.push(formulaRow(toks, 15, w, theme.text));
      }
      const same = simple && Math.abs(vals[0]! - vals[1]!) < 1e-9;
      rows.push(noteRow(same ? ctx.t('probeOk') : tr('probeNear', { x: xName(sel) }), w, same ? colS() : theme.muted));
      return rows;
    }

    function rowsHeight(rows: Row[]): number {
      return rows.reduce((s, r) => s + r.h, 0);
    }

    function drawCard(R: Rect, rows: Row[], pad: number, accent?: string, tint = 0): void {
      card(R, accent, tint);
      let y = R.y + pad - 2;
      for (const row of rows) {
        row.draw(R.x + pad, y, R.w - 2 * pad);
        y += row.h;
      }
    }

    function drawPanel(R: Rect): void {
      const pad = narrow() ? 10 : 13;
      const gap = narrow() ? 8 : 10;
      const inner = R.w - 2 * pad;
      if (!narrow()) {
        let y = R.y;
        const eq = equationCard(inner, false);
        const eh = rowsHeight(eq) + pad * 2 - 4;
        drawCard({ x: R.x, y, w: R.w, h: eh }, eq, pad);
        y += eh + gap;
        const sc = solutionCard(inner, !!bis);
        const sh = rowsHeight(sc) + pad * 2 - 4;
        drawCard({ x: R.x, y, w: R.w, h: sh }, sc, pad, colS(), 0.035);
        y += sh + gap;
        const bc = bis ? bisectFit(inner, false, R.y + R.h - y, pad) : [];
        if (bc.length) drawCard({ x: R.x, y, w: R.w, h: Math.min(rowsHeight(bc) + pad * 2 - 4, R.y + R.h - y) }, bc, pad, colB(), 0.035);
        else {
          const pc = probeCard(inner);
          const ph = rowsHeight(pc) + pad * 2 - 4;
          if (pc.length && y + ph <= R.y + R.h) drawCard({ x: R.x, y, w: R.w, h: ph }, pc, pad);
        }
        return;
      }
      // Handy: Gleichung oben über die ganze Breite, darunter Lösungen bzw. Intervallhalbierung
      let y = R.y;
      const eq = equationCard(inner, true);
      const eh = rowsHeight(eq) + pad * 2 - 4;
      drawCard({ x: R.x, y, w: R.w, h: eh }, eq, pad);
      y += eh + gap;
      const rest = R.y + R.h - y;
      if (bis) {
        const bc = bisectFit(inner, true, rest, pad);
        drawCard({ x: R.x, y, w: R.w, h: Math.min(rest, rowsHeight(bc) + pad * 2 - 4) }, bc, pad, colB(), 0.035);
      } else {
        const sc = solutionCard(inner, true);
        drawCard({ x: R.x, y, w: R.w, h: Math.min(rest, rowsHeight(sc) + pad * 2 - 4) }, sc, pad, colS(), 0.035);
      }
    }

    /* ---------- Hauptzeichnung ---------- */
    function render(): void {
      const now = performance.now();
      const reg = regions();
      plot.resize();
      const key = `${surface.width}x${surface.height}`;
      if (key !== viewKey) {
        viewKey = key;
        applyView(bis ? bisView(bis.iv, bis.idx) : overview());
      }
      if (zoomTw.running) applyView(mixView(zoomFrom, zoomTo, zoomTw.value));
      else if (zoomTo !== zoomFrom) {
        applyView(zoomTo);
        zoomFrom = zoomTo;
      }
      const t = diffT();
      surface.begin();
      plot.begin();
      plot.grid();
      plot.axes();
      drawBand(t);
      drawGraphs(t);
      drawRoots(t, now);
      plot.end();
      drawLabels(t);
      drawInset(t);
      drawPanel(reg.panel);
      syncOverview();
      const pulsing = !reduced && p.show && sol.roots.length > 0 && (bis !== null || sol.roots.length > 1);
      if (morph.running || pop.running || zoomTw.running || bandTw.running || pulsing) ctx.requestRender();
    }

    let overviewEnabled = false;
    function syncOverview(): void {
      const want = !!bis || plot.isViewChanged;
      if (want !== overviewEnabled) {
        overviewEnabled = want;
        ctx.setAction('overview', { enabled: want });
      }
    }

    let lastCase: Case = kase;
    const sideKeys = ['f', 'm1', 't1', 'a1', 'd1', 'e1', 'g', 'm2', 't2', 'a2', 'd2', 'e2'];

    return {
      update(changed, source) {
        const sidesChanged = sideKeys.some((k) => changed.has(k));
        if (sidesChanged || source === 'init' || source === 'replace') {
          sol = solveEquation(fnF(), fnG());
          kase = caseOf(sol);
          if (kase !== lastCase || source === 'replace') pop.play();
          lastCase = kase;
          if (source === 'init' || source === 'replace' || sel >= sol.roots.length) sel = defaultSel();
          message = null;
        }
        if (source === 'init' || source === 'replace') {
          // Vollständiger Zustand: Übersicht, Darstellung ohne Übergang
          bis = null;
          zoomTw.finish();
          zoomTo = zoomFrom = overview();
          viewKey = '';
          diffFrom = diffTo = p.diff ? 1 : 0;
          morph.finish();
        } else {
          if (sidesChanged && bis) endBisection(true);
          if (changed.has('diff')) {
            diffFrom = diffT();
            diffTo = p.diff ? 1 : 0;
            morph.play();
            if (bis) zoomToView(bisView(bis.iv, bis.idx));
          }
        }
        syncActions();
        updateReadouts();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'bisect') {
          if (!bis) startBisection();
          else halve();
        } else if (id === 'overview') {
          if (bis) endBisection(true);
          else zoomToView(overview());
        }
        syncActions();
        updateReadouts();
        ctx.requestRender();
      },

      resetView() {
        viewKey = '';
      },

      render,
      destroy: () => surface.destroy(),
    };
  },
});
