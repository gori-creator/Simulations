import { defineSimulation, ease, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha } from '../../../sim-core';
import {
  approxText,
  compareTariffs,
  frac,
  fracText,
  fromGeneral,
  fromNormal,
  fromTariff,
  generalText,
  isExactDecimal,
  niceMax,
  normalOf,
  normalText,
  pointText,
  reduce,
  satisfies,
  solve,
  value,
  type Frac,
  type Line,
  type Solution,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Form = 'normal' | 'general' | 'tarif';
const isForm = (f: Form) => (v: Record<string, unknown>) => v.form === f;

/** Gerade als Richtung (Winkel der Normalen) und Abstand vom Ursprung – zum weichen Überblenden. */
interface Geom {
  phi: number;
  d: number;
}

function geomOf(l: Line): Geom {
  const n = Math.hypot(l.a, l.b) || 1;
  return { phi: Math.atan2(l.b, l.a), d: l.c / n };
}

function mixGeom(g0: Geom, g1: Geom, t: number): Geom {
  let { phi, d } = g1;
  // kürzeste Drehung (eine Gerade ist nach einer halben Drehung wieder dieselbe)
  while (phi - g0.phi > Math.PI / 2) {
    phi -= Math.PI;
    d = -d;
  }
  while (phi - g0.phi < -Math.PI / 2) {
    phi += Math.PI;
    d = -d;
  }
  return { phi: g0.phi + (phi - g0.phi) * t, d: g0.d + (d - g0.d) * t };
}

/**
 * Lineare Gleichungssysteme grafisch lösen: zwei Geraden, ihr Schnittpunkt
 * und die drei Fälle (eine, keine, unendlich viele Lösungen). Gleichungen in
 * Normalform oder allgemeiner Form, dazu ein Tarifvergleich als Sachkontext.
 */
export default defineSimulation({
  id: 'lgs-grafisch',
  dragHint: true,
  layout: { aspect: 1.5, aspectNarrow: 0.88 },
  groups: [
    { id: 'eq1', label: L('Gleichung I', 'Equation I') },
    { id: 'eq2', label: L('Gleichung II', 'Equation II') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'form',
      type: 'choice',
      label: L('Gleichungen', 'Equations'),
      options: [
        { value: 'normal', label: L('y = mx + t', 'y = mx + c') },
        { value: 'general', label: L('ax + by = c', 'ax + by = c') },
        { value: 'tarif', label: L('Handytarife', 'Phone tariffs') },
      ],
      default: 'normal',
    },
    { key: 'm1', type: 'number', group: 'eq1', label: L('Steigung m₁', 'Slope m₁'), min: -5, max: 5, step: 0.25, default: 2, visibleIf: isForm('normal') },
    { key: 't1', type: 'number', group: 'eq1', label: L('y-Achsenabschnitt t₁', 'y-intercept c₁'), min: -10, max: 10, step: 0.5, default: -1, visibleIf: isForm('normal') },
    { key: 'a1', type: 'number', group: 'eq1', label: L('a₁ (vor x)', 'a₁ (with x)'), min: -9, max: 9, step: 1, default: 2, visibleIf: isForm('general') },
    { key: 'b1', type: 'number', group: 'eq1', label: L('b₁ (vor y)', 'b₁ (with y)'), min: -9, max: 9, step: 1, default: 1, visibleIf: isForm('general') },
    { key: 'c1', type: 'number', group: 'eq1', label: L('c₁ (rechte Seite)', 'c₁ (right-hand side)'), min: -20, max: 20, step: 1, default: 5, visibleIf: isForm('general') },
    { key: 'g1', type: 'number', group: 'eq1', label: L('Tarif A: Grundgebühr', 'Tariff A: monthly fee'), min: 0, max: 30, step: 0.5, default: 10, unit: '€', visibleIf: isForm('tarif') },
    { key: 'p1', type: 'number', group: 'eq1', label: L('Tarif A: Preis pro Minute', 'Tariff A: price per minute'), min: 0, max: 40, step: 1, default: 5, unit: 'ct', visibleIf: isForm('tarif') },
    { key: 'm2', type: 'number', group: 'eq2', label: L('Steigung m₂', 'Slope m₂'), min: -5, max: 5, step: 0.25, default: -1, visibleIf: isForm('normal') },
    { key: 't2', type: 'number', group: 'eq2', label: L('y-Achsenabschnitt t₂', 'y-intercept c₂'), min: -10, max: 10, step: 0.5, default: 5, visibleIf: isForm('normal') },
    { key: 'a2', type: 'number', group: 'eq2', label: L('a₂ (vor x)', 'a₂ (with x)'), min: -9, max: 9, step: 1, default: 1, visibleIf: isForm('general') },
    { key: 'b2', type: 'number', group: 'eq2', label: L('b₂ (vor y)', 'b₂ (with y)'), min: -9, max: 9, step: 1, default: -1, visibleIf: isForm('general') },
    { key: 'c2', type: 'number', group: 'eq2', label: L('c₂ (rechte Seite)', 'c₂ (right-hand side)'), min: -20, max: 20, step: 1, default: 1, visibleIf: isForm('general') },
    { key: 'g2', type: 'number', group: 'eq2', label: L('Tarif B: Grundgebühr', 'Tariff B: monthly fee'), min: 0, max: 30, step: 0.5, default: 4, unit: '€', visibleIf: isForm('tarif') },
    { key: 'p2', type: 'number', group: 'eq2', label: L('Tarif B: Preis pro Minute', 'Tariff B: price per minute'), min: 0, max: 40, step: 1, default: 11, unit: 'ct', visibleIf: isForm('tarif') },
    { key: 'read', type: 'boolean', group: 'view', label: L('Koordinaten ablesen (Hilfslinien)', 'Read off coordinates (guides)'), default: true },
    { key: 'tri', type: 'boolean', group: 'view', label: L('Steigungsdreiecke', 'Slope triangles'), default: false, visibleIf: (v) => v.form !== 'general' },
  ],
  actions: [
    { id: 'probe', label: L('Probe durch Einsetzen', 'Check by substituting'), primary: true },
    { id: 'fit', label: L('Schnittpunkt ins Bild', 'Show the intersection') },
  ],
  readouts: [
    { key: 'sys', label: L('Gleichungssystem', 'System of equations') },
    { key: 'case', label: L('Lage der Geraden', 'Relative position'), spoiler: true },
    { key: 'sol', label: L('Lösungsmenge', 'Solution set'), spoiler: true },
    { key: 'calc', label: L('Rechnerisch (Gleichsetzen)', 'Algebraically (equating)'), spoiler: true },
    { key: 'probe', label: L('Probe', 'Check'), spoiler: true },
    { key: 'tarif', label: L('Welcher Tarif lohnt sich?', 'Which tariff is cheaper?'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Genau eine Lösung', 'Exactly one solution'), values: {} },
    { id: 'parallel', label: L('Parallele Geraden', 'Parallel lines'), values: { m1: 0.5, t1: 1, m2: 0.5, t2: -2 } },
    { id: 'identical', label: L('Identische Geraden', 'Identical lines'), values: { form: 'general', a1: 2, b1: -1, c1: 1, a2: -4, b2: 2, c2: -2 } },
    { id: 'general', label: L('Allgemeine Form', 'General form'), values: { form: 'general' } },
    { id: 'fraction', label: L('Krummer Schnittpunkt', 'Awkward intersection'), values: { m1: 1, t1: 0, m2: -0.5, t2: 2 } },
    { id: 'tarif', label: L('Handytarife vergleichen', 'Comparing phone tariffs'), values: { form: 'tarif' } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatensystem mit zwei Geraden und ihrem Schnittpunkt',
      unique: 'Genau eine Lösung: Die Geraden schneiden sich in S{p}.',
      uniqueApprox: 'Genau eine Lösung: S ≈ {approx} – exakt S{p}. Grafisch nur ungefähr ablesbar!',
      parallel: 'Keine Lösung: Die Geraden sind parallel (gleiche Steigung, verschiedene y-Achsenabschnitte).',
      parallelV: 'Keine Lösung: Die Geraden sind parallel.',
      identical: 'Unendlich viele Lösungen: Die Geraden sind identisch – jeder Punkt der Geraden löst beide Gleichungen.',
      invalid: 'Eine der Gleichungen beschreibt keine Gerade (a und b sind beide 0).',
      caseUnique: 'Die Geraden schneiden sich – genau eine Lösung.',
      caseParallel: 'Die Geraden sind parallel und verschieden – keine Lösung.',
      caseIdentical: 'Die Geraden sind identisch – unendlich viele Lösungen.',
      solAll: 'L = {(x | y) | {eq}}: alle Punkte der Geraden',
      probeTitle: 'Probe mit S{p}',
      probeHint: 'Probe: Erst ab genau einem Schnittpunkt möglich.',
      outside: 'S liegt außerhalb',
      axisX: 'Zeit in min',
      axisY: 'Kosten in €',
      tarifA: 'Tarif A',
      tarifB: 'Tarif B',
      cross: 'Bis {min} min ist Tarif {below} günstiger, ab {min} min Tarif {above}. Bei {min} min kosten beide {cost} €.',
      always: 'Tarif {t} ist bei jeder Gesprächszeit günstiger (oder gleich teuer).',
      same: 'Beide Tarife sind gleich.',
      perMin: '{g} € + {p} ct pro min',
      vertical: 'senkrecht – keine Normalform',
      equate: 'Gleichsetzen',
    },
    en: {
      canvas: 'Coordinate plane with two lines and their point of intersection',
      unique: 'Exactly one solution: the lines intersect at S{p}.',
      uniqueApprox: 'Exactly one solution: S ≈ {approx} – exactly S{p}. Only approximately readable from the graph!',
      parallel: 'No solution: the lines are parallel (same slope, different y-intercepts).',
      parallelV: 'No solution: the lines are parallel.',
      identical: 'Infinitely many solutions: the lines coincide – every point on the line solves both equations.',
      invalid: 'One of the equations does not describe a line (a and b are both 0).',
      caseUnique: 'The lines intersect – exactly one solution.',
      caseParallel: 'The lines are parallel and distinct – no solution.',
      caseIdentical: 'The lines are identical – infinitely many solutions.',
      solAll: 'all points (x, y) with {eq}',
      probeTitle: 'Check with S{p}',
      probeHint: 'A check needs exactly one point of intersection.',
      outside: 'S is outside',
      axisX: 'time in min',
      axisY: 'cost in €',
      tarifA: 'Tariff A',
      tarifB: 'Tariff B',
      cross: 'Up to {min} min tariff {below} is cheaper, above {min} min tariff {above}. At {min} min both cost €{cost}.',
      always: 'Tariff {t} is cheaper (or equal) for every call time.',
      same: 'Both tariffs are the same.',
      perMin: '€{g} + {p} ct per min',
      vertical: 'vertical – no slope-intercept form',
      equate: 'Equating',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const lang = ctx.lang;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    const form = () => p.form as Form;
    /** Höhe des Streifens unter dem Koordinatensystem für die Aussage zur Lösung. */
    const strip = () => (surface.width < 600 ? 56 : 48);
    const plot = new Plot(surface, { x: [-8, 8], y: [-6, 8], equalAspect: false, region: (w, h) => ({ x: 0, y: 0, w, h: h - strip() }) });
    const reduced = prefersReducedMotion();

    function lines(): [Line, Line] {
      if (form() === 'general') return [fromGeneral(p.a1, p.b1, p.c1), fromGeneral(p.a2, p.b2, p.c2)];
      if (form() === 'tarif') return [fromTariff(p.g1, p.p1), fromTariff(p.g2, p.p2)];
      return [fromNormal(p.m1, p.t1), fromNormal(p.m2, p.t2)];
    }

    /* ---------- Zustand ---------- */
    let sol: Solution = solve(...lines());
    let shown: [Geom, Geom] = [geomOf(lines()[0]), geomOf(lines()[1])];
    let from: [Geom, Geom] = shown;
    const morph = new Tween(700, ease.inOutCubic);
    const pop = new Tween(600, ease.outBack);
    const probeTween = new Tween(1400, ease.linear);
    let probeOn = false;
    let viewKey = '';

    /* ---------- Ansicht ---------- */
    const narrow = () => surface.width < 600;

    function tariffView(): { x: number; y: number } {
      const c = compareTariffs(p.g1, p.p1, p.g2, p.p2);
      const xm = niceMax(c.kind === 'cross' ? Math.max(c.minutes * 1.6, 60) : 200);
      const ym = niceMax(Math.max(p.g1 + (p.p1 * xm) / 100, p.g2 + (p.p2 * xm) / 100, 5) * 1.08);
      return { x: xm, y: ym };
    }

    /** Ansicht passend setzen (gleiche Einheiten bei x und y außer beim Tarifvergleich). */
    function fitView(includeS: boolean): void {
      const r = plot.rect;
      if (form() === 'tarif') {
        const v = range;
        plot.setAxes({ x: { label: ctx.t('axisX'), minStep: 1 }, y: { label: ctx.t('axisY') } });
        plot.setRangePadded([0, v.x], [0, v.y], { left: narrow() ? 34 : 42, bottom: 22, top: 26, right: 16 });
        return;
      }
      plot.setAxes({ x: { label: 'x' }, y: { label: 'y' } });
      let cx = 0;
      let cy = 1;
      let half = narrow() ? 7 : 9;
      if (includeS && sol.kind === 'unique') {
        const sx = value(sol.x);
        const sy = value(sol.y);
        const aspect = r.h / Math.max(1, r.w);
        if (Math.abs(sx) > half * 0.85 || Math.abs(sy - cy) > half * aspect * 0.85) {
          cx = sx / 2;
          cy = sy / 2;
          half = Math.max(Math.abs(sx - cx) / 0.8 + 2, Math.abs(sy - cy) / (0.8 * aspect) + 2, half);
        }
      }
      const aspect = r.h / Math.max(1, r.w);
      plot.setRange([cx - half, cx + half], [cy - half * aspect, cy + half * aspect]);
    }

    /* ---------- Ziehpunkte ---------- */
    const editable = (f: Form) => () => !ctx.locked && form() === f && !morph.running;
    const color1 = () => ctx.theme.series[0]!;
    const color2 = () => ctx.theme.series[1]!;
    // Normalform: y-Achsenabschnitt und Steigungspunkt
    plot.addHandle({ get: () => [0, p.t1], set: (_x, y) => ctx.set({ t1: y }), axis: 'y', enabled: editable('normal'), color: color1 });
    plot.addHandle({ get: () => [1, p.t1 + p.m1], set: (_x, y) => ctx.set({ m1: y - p.t1 }), axis: 'y', enabled: editable('normal'), color: color1 });
    plot.addHandle({ get: () => [0, p.t2], set: (_x, y) => ctx.set({ t2: y }), axis: 'y', enabled: editable('normal'), color: color2 });
    plot.addHandle({ get: () => [1, p.t2 + p.m2], set: (_x, y) => ctx.set({ m2: y - p.t2 }), axis: 'y', enabled: editable('normal'), color: color2 });
    // Allgemeine Form: Verschieben (ändert c)
    const shiftPoint = (a: number, b: number, c: number): [number, number] => (b !== 0 ? [0, c / b] : a !== 0 ? [c / a, 0] : [NaN, NaN]);
    plot.addHandle({
      get: () => shiftPoint(p.a1, p.b1, p.c1),
      set: (x, y) => ctx.set({ c1: p.b1 !== 0 ? Math.round(p.b1 * y) : Math.round(p.a1 * x) }),
      enabled: () => editable('general')() && (p.a1 !== 0 || p.b1 !== 0),
      color: color1,
    });
    plot.addHandle({
      get: () => shiftPoint(p.a2, p.b2, p.c2),
      set: (x, y) => ctx.set({ c2: p.b2 !== 0 ? Math.round(p.b2 * y) : Math.round(p.a2 * x) }),
      enabled: () => editable('general')() && (p.a2 !== 0 || p.b2 !== 0),
      color: color2,
    });
    // Tarife: Grundgebühr und Minutenpreis
    /** Sichtbarer Bereich beim Tarifvergleich (nur bei Bedienung der Regler neu bestimmt, nicht beim Ziehen). */
    let range = tariffView();
    const priceX = () => range.x * 0.7;
    plot.addHandle({ get: () => [0, p.g1], set: (_x, y) => ctx.set({ g1: y }), axis: 'y', enabled: editable('tarif'), color: color1 });
    plot.addHandle({ get: () => [priceX(), p.g1 + (p.p1 * priceX()) / 100], set: (_x, y) => ctx.set({ p1: ((y - p.g1) * 100) / priceX() }), axis: 'y', enabled: editable('tarif'), color: color1 });
    plot.addHandle({ get: () => [0, p.g2], set: (_x, y) => ctx.set({ g2: y }), axis: 'y', enabled: editable('tarif'), color: color2 });
    plot.addHandle({ get: () => [priceX() * 0.85, p.g2 + (p.p2 * priceX() * 0.85) / 100], set: (_x, y) => ctx.set({ p2: ((y - p.g2) * 100) / (priceX() * 0.85) }), axis: 'y', enabled: editable('tarif'), color: color2 });

    /* ---------- Texte ---------- */
    const pt = (x: Frac, y: Frac) => pointText(x, y, lang);
    const exact = (f: Frac) => isExactDecimal(f);

    function eqText(i: 0 | 1): string {
      const l = lines()[i];
      if (form() === 'general') return generalText(l, lang);
      if (form() === 'tarif') {
        const g = i === 0 ? p.g1 : p.g2;
        const pr = i === 0 ? p.p1 : p.p2;
        const m = fmt.num(pr / 100, 2);
        return `y = ${m}x + ${fmt.num(g, 2)}`;
      }
      return normalText(l, lang);
    }

    const htmlEq = (s: string) => s.replace(/([xy])/g, '<var>$1</var>');

    /** Einsetzen eines Werts in einen Term „k · x“ mit Klammer bei negativen Zahlen. */
    const paren = (f: Frac) => (f.num < 0 ? `(${fracText(f, lang)})` : fracText(f, lang));

    function probeLine(i: 0 | 1, x: Frac, y: Frac): { text: string; ok: boolean } {
      const l = lines()[i];
      const ok = satisfies(l, x, y);
      const name = form() === 'tarif' ? (i === 0 ? 'A' : 'B') : i === 0 ? 'I' : 'II';
      if (form() === 'general') {
        const parts: string[] = [];
        if (l.a !== 0) parts.push(`${l.a === 1 ? '' : l.a === -1 ? '−' : `${fracText(frac(l.a), lang)} · `}${l.a === 1 || l.a === -1 ? paren(x) : paren(x)}`);
        if (l.b !== 0) {
          const k = Math.abs(l.b);
          const body = `${k === 1 ? '' : `${k} · `}${paren(y)}`;
          parts.push(parts.length ? `${l.b < 0 ? ' − ' : ' + '}${body}` : `${l.b < 0 ? '−' : ''}${body}`);
        }
        return { text: `${name}: ${parts.join('')} = ${fracText(frac(l.c), lang)} ${ok ? '✓' : '✗'}`, ok };
      }
      // Normalform bzw. Tarif: y-Wert berechnen
      const n = normalOf(l);
      if (n.kind !== 'normal') return { text: `${name}: –`, ok };
      const m = n.m;
      let rhs: string;
      if (form() === 'tarif') {
        const g = i === 0 ? p.g1 : p.g2;
        const pr = i === 0 ? p.p1 : p.p2;
        rhs = `${fmt.num(g, 2)} + ${fmt.num(pr / 100, 2)} · ${paren(x)}`;
      } else {
        const mx = m.num === 0 ? '' : m.num === m.den ? paren(x) : m.num === -m.den ? `−${paren(x)}` : `${fracText(m, lang)} · ${paren(x)}`;
        const t = n.t;
        rhs = mx ? `${mx}${t.num === 0 ? '' : t.num < 0 ? ` − ${fracText({ num: -t.num, den: t.den }, lang)}` : ` + ${fracText(t, lang)}`}` : fracText(t, lang);
      }
      return { text: `${name}: ${rhs} = ${fracText(y, lang)} ${ok ? '✓' : '✗'}`, ok };
    }

    function updateReadouts(): void {
      const [l1, l2] = lines();
      const names = form() === 'tarif' ? [ctx.t('tarifA'), ctx.t('tarifB')] : ['I', 'II'];
      const extra = (l: Line) => (form() === 'general' ? ` ⇔ ${normalOf(l).kind === 'normal' ? htmlEq(normalText(l, lang)) : ctx.t('vertical')}` : '');
      ctx.readout('sys', { html: `${names[0]}: ${htmlEq(eqText(0))}${extra(l1)}<br>${names[1]}: ${htmlEq(eqText(1))}${extra(l2)}` });
      if (sol.kind === 'unique') {
        ctx.readout('case', ctx.t('caseUnique'));
        ctx.readout('sol', `L = {${pt(sol.x, sol.y)}}`);
        ctx.readout('probe', `${probeLine(0, sol.x, sol.y).text} · ${probeLine(1, sol.x, sol.y).text}`);
      } else {
        ctx.readout('case', sol.kind === 'invalid' ? ctx.t('invalid') : ctx.t(sol.kind === 'parallel' ? 'caseParallel' : 'caseIdentical'));
        ctx.readout('sol', sol.kind === 'parallel' ? 'L = { }' : sol.kind === 'identical' ? tr('solAll', { eq: normalText(l1, lang) }) : null);
        ctx.readout('probe', null);
      }
      // Gleichsetzungsverfahren (beide Gleichungen nach y aufgelöst)
      const n1 = normalOf(l1);
      const n2 = normalOf(l2);
      if (sol.kind === 'unique' && n1.kind === 'normal' && n2.kind === 'normal') {
        const dm = frac(n1.m.num * n2.m.den - n2.m.num * n1.m.den, n1.m.den * n2.m.den);
        const dt = frac(n2.t.num * n1.t.den - n1.t.num * n2.t.den, n1.t.den * n2.t.den);
        const rhs = (l: Line) => normalText(l, lang).replace(/^y = /, '');
        const k = dm.num === dm.den ? 'x' : `${fracText(dm, lang)}${exact(dm) ? '' : ' '}x`;
        ctx.readout('calc', { html: htmlEq(`${rhs(l1)} = ${rhs(l2)} ⇒ ${k} = ${fracText(dt, lang)} ⇒ x = ${fracText(sol.x, lang)}, y = ${fracText(sol.y, lang)}`) });
      } else ctx.readout('calc', null);
      if (form() === 'tarif') {
        const c = compareTariffs(p.g1, p.p1, p.g2, p.p2);
        if (c.kind === 'cross') {
          const below = c.cheaperBelow === 1 ? 'A' : 'B';
          ctx.readout('tarif', tr('cross', { min: fmt.num(c.minutes, 1), below, above: below === 'A' ? 'B' : 'A', cost: fmt.fixed(c.cost, 2) }));
        } else ctx.readout('tarif', c.kind === 'same' ? ctx.t('same') : tr('always', { t: c.cheaper === 1 ? 'A' : 'B' }));
      } else ctx.readout('tarif', null);
      ctx.setAction('probe', { enabled: sol.kind === 'unique' });
    }

    /* ---------- Zeichnen ---------- */
    function mathText(s: string, x: number, y: number, size: number, color: string, align: 'left' | 'right' | 'center' = 'left', weight = 600): number {
      const g = surface.g;
      const theme = ctx.theme;
      const parts = s.split(/([xy])/).filter((q) => q.length);
      const fonts = parts.map((q) => (q === 'x' || q === 'y' ? `italic ${size * 1.12}px ${theme.mathFont}` : `${weight} ${size}px ${theme.font}`));
      const widths = parts.map((q, i) => {
        g.font = fonts[i]!;
        return g.measureText(q).width;
      });
      const total = widths.reduce((a, b) => a + b, 0);
      let cx = align === 'left' ? x : align === 'right' ? x - total : x - total / 2;
      parts.forEach((q, i) => {
        text(g, q, cx, y, { font: fonts[i]!, color, align: 'left', baseline: 'middle' });
        cx += widths[i]!;
      });
      return total;
    }

    function mathWidth(s: string, size: number, weight = 600): number {
      const g = surface.g;
      return s
        .split(/([xy])/)
        .filter((q) => q.length)
        .reduce((sum, q) => {
          g.font = q === 'x' || q === 'y' ? `italic ${size * 1.12}px ${ctx.theme.mathFont}` : `${weight} ${size}px ${ctx.theme.font}`;
          return sum + g.measureText(q).width;
        }, 0);
    }

    function card(x: number, y: number, w: number, h: number, accent?: string): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 2;
      g.fillStyle = theme.dark ? 'rgba(20,27,38,0.95)' : 'rgba(255,255,255,0.96)';
      roundRect(g, x, y, w, h, 10);
      g.fill();
      g.restore();
      g.strokeStyle = accent ? withAlpha(accent, 0.55) : theme.dark ? '#2b3545' : '#dde3ea';
      g.lineWidth = 1.2;
      roundRect(g, x + 0.5, y + 0.5, w - 1, h - 1, 10);
      g.stroke();
    }

    /** Zwei Punkte einer Geraden aus der Darstellung (Winkel, Abstand). */
    function geomPoints(gm: Geom): [[number, number], [number, number]] {
      const nx = Math.cos(gm.phi);
      const ny = Math.sin(gm.phi);
      const p0: [number, number] = [nx * gm.d, ny * gm.d];
      return [p0, [p0[0] - ny, p0[1] + nx]];
    }

    /** Wo eine Gerade den Rand des sichtbaren Bereichs (mit Abstand) verlässt – für die Beschriftung. */
    function labelSpot(gm: Geom, other: [number, number] | null): [number, number] | null {
      const b = plot.bounds;
      const mx = 30 / plot.scale.x;
      const my = 22 / plot.scale.y;
      const [p0, p1] = geomPoints(gm);
      const dx = p1[0] - p0[0];
      const dy = p1[1] - p0[1];
      const cands: [number, number][] = [];
      const box = { x0: b.xMin + mx, x1: b.xMax - mx, y0: b.yMin + my, y1: b.yMax - my };
      for (const xv of [box.x1, box.x0]) if (Math.abs(dx) > 1e-9) cands.push([xv, p0[1] + ((xv - p0[0]) / dx) * dy]);
      for (const yv of [box.y1, box.y0]) if (Math.abs(dy) > 1e-9) cands.push([p0[0] + ((yv - p0[1]) / dy) * dx, yv]);
      const r = plot.rect;
      const sPx = sol.kind === 'unique' ? plot.toPx(value(sol.x), value(sol.y)) : null;
      const free = ([x, y]: [number, number]) => {
        const [px, py] = plot.toPx(x, y);
        // nicht unter den Zoom-Knöpfen und nicht direkt am Schnittpunkt
        if (px > r.x + r.w - 56 && py < r.y + 128) return false;
        return !sPx || Math.hypot(px - sPx[0], py - sPx[1]) > 70;
      };
      const all = cands.filter(([x, y]) => x >= box.x0 - 1e-6 && x <= box.x1 + 1e-6 && y >= box.y0 - 1e-6 && y <= box.y1 + 1e-6);
      const inside = all.filter(free).length ? all.filter(free) : all;
      if (!inside.length) return null;
      // Bevorzugt rechts oben und nicht am selben Fleck wie die andere Beschriftung
      inside.sort((u, v) => v[0] + v[1] * 0.3 - (u[0] + u[1] * 0.3));
      if (other) {
        const far = inside.find((q) => Math.hypot((q[0] - other[0]) * plot.scale.x, (q[1] - other[1]) * plot.scale.y) > 40);
        if (far) return far;
      }
      return inside[0]!;
    }

    function drawLegend(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const r = plot.rect;
      const small = narrow();
      const fs = small ? 13 : 15;
      const names = form() === 'tarif' ? ['A', 'B'] : ['I', 'II'];
      const rows: { name: string; eq: string; sub?: string; color: string }[] = [0, 1].map((i) => {
        const l = lines()[i as 0 | 1];
        let sub: string | undefined;
        if (form() === 'general') sub = normalOf(l).kind === 'normal' ? `⇔ ${normalText(l, lang)}` : ctx.t('vertical');
        if (form() === 'tarif') sub = tr('perMin', { g: fmt.num(i === 0 ? p.g1 : p.g2, 2), p: fmt.num(i === 0 ? p.p1 : p.p2, 0) });
        return { name: names[i]!, eq: eqText(i as 0 | 1), sub, color: i === 0 ? color1() : color2() };
      });
      const nameW = small ? 26 : 30;
      const w = Math.max(...rows.map((q) => Math.max(mathWidth(q.eq, fs), q.sub ? mathWidth(q.sub, fs * 0.8, 500) : 0))) + nameW + 22;
      const rowH = rows.some((q) => q.sub) ? fs * 2.55 : fs * 1.75;
      const h = rows.length * rowH + 10;
      // Beim Tarifvergleich rechts neben der y-Achse und unter ihrer Beschriftung
      const x = form() === 'tarif' ? Math.max(r.x + 10, plot.px(0) + 12) : r.x + 10;
      const y = form() === 'tarif' ? r.y + 30 : r.y + 10;
      card(x, y, w, h);
      rows.forEach((q, i) => {
        const cy = y + 5 + i * rowH + (q.sub ? fs * 0.85 : rowH / 2);
        g.fillStyle = q.color;
        roundRect(g, x + 9, cy - fs * 0.62, nameW - 6, fs * 1.24, 5);
        g.fill();
        text(g, q.name, x + 9 + (nameW - 6) / 2, cy + 0.5, { font: `800 ${fs * 0.82}px ${theme.font}`, color: '#ffffff' });
        mathText(q.eq, x + nameW + 12, cy, fs, theme.text);
        if (q.sub) mathText(q.sub, x + nameW + 12, cy + fs * 1.15, fs * 0.8, theme.muted, 'left', 500);
      });
    }

    function drawBanner(now: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const pr = plot.rect;
      const r = { x: pr.x, y: pr.y + pr.h, w: pr.w, h: strip() };
      const small = narrow();
      let msg: string;
      let color: string;
      if (sol.kind === 'unique') {
        const p0 = pt(sol.x, sol.y);
        const ok = exact(sol.x) && exact(sol.y);
        msg = ok ? tr('unique', { p: p0 }) : tr('uniqueApprox', { p: p0, approx: lang === 'de' ? `(${approxText(sol.x, lang)} | ${approxText(sol.y, lang)})` : `(${approxText(sol.x, lang)}, ${approxText(sol.y, lang)})` });
        color = theme.series[2]!;
      } else if (sol.kind === 'parallel') {
        const vertical = lines()[0].b === 0;
        msg = ctx.t(vertical ? 'parallelV' : 'parallel');
        color = theme.series[3]!;
      } else if (sol.kind === 'identical') {
        msg = ctx.t('identical');
        color = theme.series[4]!;
      } else {
        msg = ctx.t('invalid');
        color = theme.series[1]!;
      }
      const fs = small ? 11.5 : 13;
      g.font = `650 ${fs}px ${theme.font}`;
      const maxW = r.w - 40;
      const rows: string[] = [];
      let line = '';
      for (const wd of msg.split(' ')) {
        const test = line ? `${line} ${wd}` : wd;
        if (g.measureText(test).width > maxW && line) {
          rows.push(line);
          line = wd;
        } else line = test;
      }
      if (line) rows.push(line);
      const lh = fs * 1.32;
      const w = Math.max(...rows.map((q) => g.measureText(q).width)) + 34;
      const h = rows.length * lh + 14;
      const x = r.x + (r.w - w) / 2;
      const y = r.y + (r.h - h) / 2 + 2;
      const appear = pop.running ? Math.min(1, pop.t * 1.6) : 1;
      g.save();
      g.globalAlpha = appear;
      card(x, y, w, h, color);
      g.fillStyle = withAlpha(color, theme.dark ? 0.15 : 0.08);
      roundRect(g, x, y, w, h, 10);
      g.fill();
      g.fillStyle = color;
      g.beginPath();
      g.arc(x + 13, y + h / 2, 4, 0, Math.PI * 2);
      g.fill();
      rows.forEach((q, i) => text(g, q, x + 23, y + 7 + lh * (i + 0.5), { font: `650 ${fs}px ${theme.font}`, color: theme.text, align: 'left' }));
      g.restore();
      void now;
    }

    function drawProbe(): void {
      if (!probeOn || sol.kind !== 'unique') return;
      const g = surface.g;
      const theme = ctx.theme;
      const r = plot.rect;
      const small = narrow();
      const fs = small ? 12.5 : 14.5;
      const title = tr('probeTitle', { p: pt(sol.x, sol.y) });
      const rows = [probeLine(0, sol.x, sol.y), probeLine(1, sol.x, sol.y)];
      const w = Math.max(mathWidth(title, fs * 0.92, 700), ...rows.map((q) => mathWidth(q.text, fs))) + 26;
      const h = fs * 1.6 * 3 + 8;
      const x = small ? r.x + 10 : r.x + r.w - w - 54;
      const y = small ? r.y + r.h - h - 10 : r.y + 10;
      const t = probeTween.t;
      card(x, y, w, h, theme.series[2]);
      mathText(title, x + 13, y + 4 + fs * 0.8, fs * 0.92, theme.muted, 'left', 700);
      rows.forEach((q, i) => {
        const k = reduced ? 1 : Math.min(1, Math.max(0, (t - 0.15 - i * 0.3) / 0.3));
        if (k <= 0) return;
        g.globalAlpha = k;
        mathText(q.text, x + 13 + (1 - k) * 12, y + 4 + fs * 0.8 + (i + 1) * fs * 1.6, fs, q.ok ? theme.text : theme.series[1]!);
        g.globalAlpha = 1;
      });
    }

    function render(): void {
      const now = performance.now();
      const theme = ctx.theme;
      const key = `${surface.width}x${surface.height}|${form()}|${form() === 'tarif' ? `${range.x}:${range.y}` : ''}`;
      if (key !== viewKey) {
        viewKey = key;
        fitView(true);
      }
      surface.begin();
      const g = plot.begin();
      plot.grid();
      plot.axes();
      const tMorph = morph.value;
      const target: [Geom, Geom] = [geomOf(lines()[0]), geomOf(lines()[1])];
      shown = morph.running ? [mixGeom(from[0], target[0], tMorph), mixGeom(from[1], target[1], tMorph)] : target;
      const [l1, l2] = lines();
      const settled = !morph.running;

      // Parallele Geraden: Streifen dazwischen
      if (settled && sol.kind === 'parallel') {
        const b = plot.bounds;
        const pad = (b.xMax - b.xMin) * 0.5;
        if (l1.b !== 0) {
          const xs = [b.xMin - pad, b.xMax + pad];
          const y1 = (x: number) => (l1.c - l1.a * x) / l1.b;
          const y2 = (x: number) => (l2.c - l2.a * x) / l2.b;
          plot.polygon(
            [
              [xs[0]!, y1(xs[0]!)],
              [xs[1]!, y1(xs[1]!)],
              [xs[1]!, y2(xs[1]!)],
              [xs[0]!, y2(xs[0]!)],
            ],
            { fill: theme.series[3], alpha: 0.09 },
          );
        } else {
          const xa = l1.c / l1.a;
          const xb = l2.c / l2.a;
          plot.polygon(
            [
              [xa, b.yMin - 10],
              [xb, b.yMin - 10],
              [xb, b.yMax + 10],
              [xa, b.yMax + 10],
            ],
            { fill: theme.series[3], alpha: 0.09 },
          );
        }
      }

      // Steigungsdreiecke (Normalform und Tarif)
      if (p.tri && form() !== 'general' && settled) {
        const unit = form() === 'tarif' ? niceMax(range.x / 5) : 1;
        [l1, l2].forEach((l, i) => {
          const n = normalOf(l);
          if (n.kind !== 'normal') return;
          const m = value(n.m);
          const t = value(n.t);
          const x0 = form() === 'tarif' ? (i === 0 ? unit : 3 * unit) : 0;
          const c = i === 0 ? color1() : color2();
          const y0 = m * x0 + t;
          const y1 = m * (x0 + unit) + t;
          plot.polygon(
            [
              [x0, y0],
              [x0 + unit, y0],
              [x0 + unit, y1],
            ],
            { fill: c, alpha: 0.12, stroke: c, width: 1.5 },
          );
          const dyText = form() === 'tarif' ? `${fmt.num(m * unit, 2)} €` : fmt.num(m * unit, 2);
          plot.text(x0 + unit, (y0 + y1) / 2, dyText, { color: c, size: 12, weight: '600', offset: [6, 0], baseline: 'middle' });
          plot.text(x0 + unit / 2, y0, form() === 'tarif' ? `${fmt.num(unit, 0)} min` : '1', { color: c, size: 12, weight: '600', align: 'center', baseline: m >= 0 ? 'top' : 'bottom', offset: [0, m >= 0 ? 4 : -4] });
        });
      }

      // Geraden
      const [a1, b1] = geomPoints(shown[0]);
      const [a2, b2] = geomPoints(shown[1]);
      const identical = settled && sol.kind === 'identical';
      if (sol.kind !== 'invalid' || l1.a !== 0 || l1.b !== 0) plot.line(a1, b1, { color: color1(), width: identical ? 5 : 3 });
      if (sol.kind !== 'invalid' || l2.a !== 0 || l2.b !== 0) plot.line(a2, b2, { color: color2(), width: identical ? 5 : 3, dash: identical ? [14, 14] : undefined });

      // Beschriftung der Geraden
      const names = form() === 'tarif' ? ['A', 'B'] : ['I', 'II'];
      const s1 = labelSpot(shown[0], null);
      const s2 = labelSpot(shown[1], s1);
      [s1, s2].forEach((spot, i) => {
        if (!spot) return;
        const c = i === 0 ? color1() : color2();
        const [px, py] = plot.toPx(spot[0], spot[1]);
        g.save();
        g.beginPath();
        g.arc(px, py, 13, 0, Math.PI * 2);
        g.fillStyle = theme.dark ? '#141b26' : '#ffffff';
        g.fill();
        g.strokeStyle = c;
        g.lineWidth = 2;
        g.stroke();
        g.restore();
        text(g, names[i]!, px, py + 0.5, { font: `800 ${names[i]!.length > 1 ? 11 : 13}px ${theme.font}`, color: c });
      });

      // Schnittpunkt
      if (settled && sol.kind === 'unique') {
        const sx = value(sol.x);
        const sy = value(sol.y);
        const [px, py] = plot.toPx(sx, sy);
        const r = plot.rect;
        const visible = px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
        const green = theme.series[2]!;
        if (visible) {
          if (p.read) {
            plot.segment([sx, sy], [sx, 0], { color: green, width: 1.6, dash: [5, 4] });
            plot.segment([sx, sy], [0, sy], { color: green, width: 1.6, dash: [5, 4] });
            const xl = exact(sol.x) ? fracText(sol.x, lang) : `≈ ${approxText(sol.x, lang)}`;
            const yl = exact(sol.y) ? fracText(sol.y, lang) : `≈ ${approxText(sol.y, lang)}`;
            const [ax, ay] = plot.toPx(sx, 0);
            const [bx, by] = plot.toPx(0, sy);
            tag(ax, ay + (sy >= 0 ? 14 : -14), xl, green);
            tag(bx + (sx >= 0 ? -6 : 6), by, yl, green, sx >= 0 ? 'right' : 'left');
          }
          const k = pop.running ? Math.max(0, pop.value) : 1;
          const pulse = reduced ? 0 : (Math.sin(now / 420) + 1) / 2;
          g.beginPath();
          g.arc(px, py, (12 + pulse * 5) * k, 0, Math.PI * 2);
          g.fillStyle = withAlpha(green, 0.16);
          g.fill();
          g.beginPath();
          g.arc(px, py, 7 * k, 0, Math.PI * 2);
          g.fillStyle = green;
          g.fill();
          g.lineWidth = 2;
          g.strokeStyle = theme.bg;
          g.stroke();
          const label = exact(sol.x) && exact(sol.y) ? `S${pt(sol.x, sol.y)}` : `S ≈ ${lang === 'de' ? `(${approxText(sol.x, lang)} | ${approxText(sol.y, lang)})` : `(${approxText(sol.x, lang)}, ${approxText(sol.y, lang)})`}`;
          g.font = `800 14px ${theme.font}`;
          const tw = g.measureText(label).width + 16;
          // Beschriftung in die Ecke, in der keine Gerade verläuft
          const right = px + tw + 18 < r.x + r.w;
          const up = py - 34 > r.y;
          const lx = right ? px + 12 : px - 12 - tw;
          const ly = up ? py - 34 : py + 12;
          card(lx, ly, tw, 24, green);
          text(g, label, lx + tw / 2, ly + 12.5, { font: `800 14px ${theme.font}`, color: green });
        } else {
          // Pfeil am Rand in Richtung des Schnittpunkts
          const cx = r.x + r.w / 2;
          const cy = r.y + r.h / 2;
          const ang = Math.atan2(py - cy, px - cx);
          const ex = Math.max(r.x + 30, Math.min(r.x + r.w - 30, cx + Math.cos(ang) * r.w));
          const ey = Math.max(r.y + 30, Math.min(r.y + r.h - 30, cy + Math.sin(ang) * r.h));
          g.save();
          g.translate(ex, ey);
          g.rotate(ang);
          g.fillStyle = green;
          g.beginPath();
          g.moveTo(14, 0);
          g.lineTo(-6, -9);
          g.lineTo(-6, 9);
          g.closePath();
          g.fill();
          g.restore();
          const label = `${ctx.t('outside')}: ${pt(sol.x, sol.y)}`;
          g.font = `700 12px ${theme.font}`;
          const tw = g.measureText(label).width + 14;
          const lx = Math.max(r.x + 8, Math.min(r.x + r.w - tw - 8, ex - tw / 2));
          const ly = ey + (Math.sin(ang) > 0 ? -38 : 16);
          card(lx, ly, tw, 22, green);
          text(g, label, lx + tw / 2, ly + 11.5, { font: `700 12px ${theme.font}`, color: green });
        }
      }

      plot.end();
      drawLegend();
      drawBanner(now);
      drawProbe();
      if (morph.running || pop.running || probeTween.running || (sol.kind === 'unique' && !reduced)) ctx.requestRender();
    }

    function tag(x: number, y: number, label: string, color: string, align: 'center' | 'left' | 'right' = 'center'): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.font = `700 12px ${theme.font}`;
      const w = g.measureText(label).width + 12;
      const left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
      g.fillStyle = theme.dark ? '#141b26' : '#ffffff';
      roundRect(g, left, y - 10, w, 20, 6);
      g.fill();
      g.strokeStyle = withAlpha(color, 0.7);
      g.lineWidth = 1.2;
      g.stroke();
      text(g, label, left + w / 2, y + 0.5, { font: `700 12px ${theme.font}`, color });
    }

    /** Umrechnen beim Wechsel der Darstellung (nur bei Bedienung von Hand). */
    function convert(prev: Form): void {
      const next = form();
      if (prev === 'normal' && next === 'general') {
        const out: Record<string, number> = {};
        const ok = [0, 1].every((i) => {
          let l = reduce(fromNormal(i === 0 ? p.m1 : p.m2, i === 0 ? p.t1 : p.t2));
          if (l.a < 0 || (l.a === 0 && l.b < 0)) l = { a: -l.a, b: -l.b, c: -l.c };
          const fits = Math.abs(l.a) <= 9 && Math.abs(l.b) <= 9 && Math.abs(l.c) <= 20;
          if (fits) Object.assign(out, i === 0 ? { a1: l.a, b1: l.b, c1: l.c } : { a2: l.a, b2: l.b, c2: l.c });
          return fits;
        });
        if (ok) ctx.set(out);
      } else if (prev === 'general' && next === 'normal') {
        const out: Record<string, number> = {};
        [0, 1].forEach((i) => {
          const n = normalOf(lines()[i as 0 | 1]);
          if (n.kind === 'normal') Object.assign(out, i === 0 ? { m1: value(n.m), t1: value(n.t) } : { m2: value(n.m), t2: value(n.t) });
        });
        ctx.set(out);
      }
    }

    let lastForm = form();
    let lastSol: Solution = sol;

    return {
      update(changed, source) {
        if (changed.has('form') && source === 'input') convert(lastForm);
        if (source !== 'sim') range = tariffView();
        const before = shown;
        sol = solve(...lines());
        if (source === 'replace' && !reduced) {
          from = before;
          morph.play();
          pop.play();
        } else if (sol.kind !== lastSol.kind) pop.play();
        if (changed.has('form') || source === 'replace' || source === 'init') {
          viewKey = '';
          probeOn = false;
        }
        if (source === 'replace' || changed.has('form')) plot.resetView();
        if (sol.kind !== 'unique') probeOn = false;
        lastForm = form();
        lastSol = sol;
        updateReadouts();
      },

      action(id) {
        if (id === 'probe' && sol.kind === 'unique') {
          probeOn = true;
          probeTween.play();
        } else if (id === 'fit') {
          fitView(true);
        }
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
