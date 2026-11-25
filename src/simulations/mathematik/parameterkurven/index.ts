import { defineSimulation, Plot, Surface } from '../../../sim-core';
import { apex, curvePoint, curveRange, flightTime, G, polarR, polarRange, polarToCart, throwPos, trajectory, type CurveKind, type PolarKind, type Pt } from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'wurf' | 'kurve' | 'polar';
const DEG = Math.PI / 180;

/**
 * Kurven in Parameterdarstellung und Polarkoordinaten: schräger Wurf als
 * Parabelbahn mit dem Parameter Zeit, Kreis, Ellipse, Lissajous-Figuren,
 * Zykloide sowie Spirale, Rosen, Kardioide und Lemniskate.
 */
export default defineSimulation({
  id: 'parameterkurven',
  layout: { aspect: 1.5, aspectNarrow: 0.9 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'wurf', label: L('Wurfparabel', 'Projectile path') },
        { value: 'kurve', label: L('Parameterkurven', 'Parametric curves') },
        { value: 'polar', label: L('Polarkoordinaten', 'Polar coordinates') },
      ],
      default: 'wurf',
      display: 'buttons',
    },
    { key: 'v0', type: 'number', label: L('Abwurfgeschwindigkeit v₀', 'Launch speed v₀'), min: 1, max: 30, step: 0.5, default: 12, unit: 'm/s', visibleIf: (v) => v.mode === 'wurf' },
    { key: 'al', type: 'number', label: L('Abwurfwinkel α', 'Launch angle α'), min: 0, max: 90, step: 1, default: 40, unit: '°', visibleIf: (v) => v.mode === 'wurf' },
    { key: 'h', type: 'number', label: L('Abwurfhöhe h', 'Launch height h'), min: 0, max: 20, step: 0.5, default: 1.5, unit: 'm', visibleIf: (v) => v.mode === 'wurf' },
    {
      key: 'kt',
      type: 'choice',
      label: L('Kurve', 'Curve'),
      options: [
        { value: 'kreis', label: L('Kreis', 'Circle') },
        { value: 'ellipse', label: L('Ellipse', 'Ellipse') },
        { value: 'lissajous', label: L('Lissajous-Figur', 'Lissajous figure') },
        { value: 'zykloide', label: L('Zykloide (Rollkurve)', 'Cycloid') },
      ],
      default: 'ellipse',
      display: 'menu',
      visibleIf: (v) => v.mode === 'kurve',
    },
    { key: 'a', type: 'number', label: L('a', 'a'), min: 0.5, max: 6, step: 0.5, default: 4, visibleIf: (v) => v.mode === 'kurve' && v.kt !== 'lissajous' },
    { key: 'b', type: 'number', label: L('b', 'b'), min: 0.5, max: 6, step: 0.5, default: 2, visibleIf: (v) => v.mode === 'kurve' && v.kt === 'ellipse' },
    { key: 'fa', type: 'number', label: L('Frequenz in x-Richtung', 'Frequency in x-direction'), min: 1, max: 7, step: 1, default: 3, visibleIf: (v) => v.mode === 'kurve' && v.kt === 'lissajous' },
    { key: 'fb', type: 'number', label: L('Frequenz in y-Richtung', 'Frequency in y-direction'), min: 1, max: 7, step: 1, default: 2, visibleIf: (v) => v.mode === 'kurve' && v.kt === 'lissajous' },
    { key: 'ph', type: 'number', label: L('Phasenverschiebung', 'Phase shift'), min: 0, max: 180, step: 5, default: 90, unit: '°', visibleIf: (v) => v.mode === 'kurve' && v.kt === 'lissajous' },
    {
      key: 'pk',
      type: 'choice',
      label: L('Kurve', 'Curve'),
      options: [
        { value: 'kreis', label: L('Kreis r = a', 'Circle r = a') },
        { value: 'spirale', label: L('Archimedische Spirale', 'Archimedean spiral') },
        { value: 'rose', label: L('Rosenkurve r = a·cos(kφ)', 'Rose r = a·cos(kφ)') },
        { value: 'kardioide', label: L('Kardioide (Herzkurve)', 'Cardioid') },
        { value: 'lemniskate', label: L('Lemniskate', 'Lemniscate') },
      ],
      default: 'rose',
      display: 'menu',
      visibleIf: (v) => v.mode === 'polar',
    },
    { key: 'ra', type: 'number', label: L('a', 'a'), min: 0.5, max: 6, step: 0.5, default: 4, visibleIf: (v) => v.mode === 'polar' },
    { key: 'k', type: 'number', label: L('k', 'k'), min: 1, max: 8, step: 1, default: 3, visibleIf: (v) => v.mode === 'polar' && v.pk === 'rose' },
    { key: 'u', type: 'number', label: L('Parameter (Anteil der Bahn)', 'Parameter (share of the path)'), min: 0, max: 1, step: 0.005, default: 0.4 },
  ],
  hint: (v) =>
    v.mode === 'polar'
      ? L('Ein Punkt wird durch Winkel φ und Abstand r vom Ursprung beschrieben. Bei negativem r liegt er auf der Gegenseite.', 'A point is given by its angle φ and its distance r from the origin. If r is negative, it lies on the opposite side.')
      : v.mode === 'kurve'
        ? L('Der Parameter t läuft – x(t) und y(t) geben gemeinsam den Ort an. Die gestrichelten Linien zeigen die beiden Koordinaten.', 'The parameter t runs – x(t) and y(t) together give the position. The dashed lines show the two coordinates.')
        : L('Der Parameter ist die Zeit t. Eliminiert man t, entsteht die Gleichung der Wurfparabel.', 'The parameter is the time t. Eliminating t gives the equation of the parabola.'),
  readouts: [
    { key: 'eq', label: L('Parameterdarstellung', 'Parametric form') },
    { key: 'bahn', label: L('Bahngleichung', 'Equation of the path'), spoiler: true },
    { key: 'pt', label: L('Aktueller Punkt', 'Current point') },
    { key: 'info', label: L('Kenngrößen', 'Key values'), spoiler: true },
  ],
  presets: [
    { id: 'ball', label: L('Ballwurf', 'Throwing a ball'), values: { mode: 'wurf', v0: 12, al: 40, h: 1.5, u: 0.4 } },
    { id: 'w45', label: L('45° vom Boden', '45° from the ground'), values: { mode: 'wurf', v0: 15, al: 45, h: 0, u: 0.5 } },
    { id: 'liss', label: L('Lissajous 3 : 2', 'Lissajous 3 : 2'), values: { mode: 'kurve', kt: 'lissajous', fa: 3, fb: 2, ph: 90, u: 1 } },
    { id: 'zyk', label: L('Zykloide', 'Cycloid'), values: { mode: 'kurve', kt: 'zykloide', a: 1.5, u: 0.6 } },
    { id: 'rose', label: L('Rose mit k = 3', 'Rose with k = 3'), values: { mode: 'polar', pk: 'rose', ra: 4, k: 3, u: 0.7 } },
    { id: 'herz', label: L('Kardioide', 'Cardioid'), values: { mode: 'polar', pk: 'kardioide', ra: 4, u: 0.35 } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatensystem mit einer Kurve, die bis zum aktuellen Parameterwert nachgezeichnet ist, und dem zugehörigen Punkt',
      range: 'Wurfweite ≈ {w} m, Gipfelhöhe ≈ {g} m, Flugzeit ≈ {t} s',
      vertical: 'senkrechter Wurf: x = 0',
      polarPt: 'φ = {phi}°, r = {r}  →  x = r·cos φ ≈ {x}, y = r·sin φ ≈ {y}',
      undef: 'für dieses φ nicht definiert',
      zykInfo: 'Ein Punkt auf einem rollenden Rad mit Radius {a}',
      lissInfo: 'Verhältnis der Frequenzen {a} : {b}',
      ground: 'Boden',
    },
    en: {
      canvas: 'Coordinate system with a curve traced up to the current parameter value and the corresponding point',
      range: 'Range ≈ {w} m, maximum height ≈ {g} m, flight time ≈ {t} s',
      vertical: 'vertical throw: x = 0',
      polarPt: 'φ = {phi}°, r = {r}  →  x = r·cos φ ≈ {x}, y = r·sin φ ≈ {y}',
      undef: 'not defined for this φ',
      zykInfo: 'A point on a rolling wheel of radius {a}',
      lissInfo: 'Ratio of the frequencies {a} : {b}',
      ground: 'ground',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const mode = () => p.mode as Mode;
    const n = (v: number, d = 2) => fmt.num(Math.abs(v) < 1e-9 ? 0 : v, d);
    const sgn = (v: number, d = 2) => (v < 0 ? `− ${n(-v, d)}` : `+ ${n(v, d)}`);

    const plot = new Plot(surface, { x: [-6, 6], y: [-4, 4], equalAspect: true, pan: false, zoom: false, controls: false });

    /** Parameterbereich und aktueller Parameter je Ansicht. */
    function tRange(): [number, number] {
      if (mode() === 'wurf') return [0, flightTime(p.v0, p.al, p.h)];
      if (mode() === 'polar') return polarRange(p.pk as PolarKind);
      return curveRange(p.kt as CurveKind);
    }
    const tNow = () => {
      const [a, b] = tRange();
      return a + p.u * (b - a);
    };
    function pointAt(t: number): Pt | null {
      if (mode() === 'wurf') return throwPos(p.v0, p.al, p.h, t);
      if (mode() === 'polar') {
        const r = polarR(p.pk as PolarKind, p.ra, p.k, t);
        return Number.isNaN(r) ? null : polarToCart(r, t);
      }
      const kind = p.kt as CurveKind;
      return kind === 'lissajous' ? curvePoint(kind, p.fa, p.fb, p.ph, t) : curvePoint(kind, p.a, p.b, 0, t);
    }

    function setRange(): void {
      if (mode() === 'wurf') {
        const T = flightTime(p.v0, p.al, p.h);
        const xEnd = throwPos(p.v0, p.al, p.h, T)[0];
        const top = apex(p.v0, p.al, p.h)[1];
        plot.setRangePadded([-1, Math.max(4, xEnd * 1.08)], [-0.5, Math.max(3, top * 1.15)], { left: 34, right: 14, top: 14, bottom: 24 });
        plot.setAxes({ x: { label: 'x in m' }, y: { label: 'y in m' } });
        return;
      }
      if (mode() === 'kurve' && p.kt === 'zykloide') {
        plot.setRangePadded([-0.5, 4 * Math.PI * p.a + 0.5], [-0.5, 2 * p.a + 0.8], { left: 30, right: 12, top: 12, bottom: 22 });
      } else {
        const R = mode() === 'polar' ? (p.pk === 'spirale' ? 3 * p.ra : p.ra) + 0.6 : p.kt === 'lissajous' ? 4.8 : Math.max(p.a, p.b) + 0.8;
        plot.setRangePadded([-R, R], [-R, R], { left: 30, right: 12, top: 12, bottom: 22 });
      }
      plot.setAxes({ x: { label: 'x' }, y: { label: 'y' } });
    }

    function updateReadouts(): void {
      const show: Record<string, string | null> = {};
      const t = tNow();
      const P = pointAt(t);
      if (mode() === 'wurf') {
        const al = p.al * DEG;
        const vx = p.v0 * Math.cos(al);
        const vy = p.v0 * Math.sin(al);
        show.eq = `x(t) = ${n(vx)}·t;  y(t) = ${n(p.h)} ${sgn(vy)}·t − ${n(G / 2, 3)}·t²`;
        const tj = trajectory(p.v0, p.al, p.h);
        show.bahn = tj ? `y = ${n(tj.c)} ${sgn(tj.b, 3)}·x ${sgn(tj.a, 4)}·x²` : ctx.t('vertical');
        const T = flightTime(p.v0, p.al, p.h);
        show.info = tr('range', { w: n(throwPos(p.v0, p.al, p.h, T)[0], 1), g: n(apex(p.v0, p.al, p.h)[1], 2), t: n(T, 2) });
        show.pt = P ? `t = ${n(t)} s:  P(${n(P[0])} | ${n(P[1])})` : null;
      } else if (mode() === 'kurve') {
        const k = p.kt as CurveKind;
        show.eq =
          k === 'kreis'
            ? `x(t) = ${n(p.a)}·cos t;  y(t) = ${n(p.a)}·sin t`
            : k === 'ellipse'
              ? `x(t) = ${n(p.a)}·cos t;  y(t) = ${n(p.b)}·sin t`
              : k === 'lissajous'
                ? `x(t) = 4·sin(${p.fa}t + ${n(p.ph, 0)}°);  y(t) = 4·sin(${p.fb}t)`
                : `x(t) = ${n(p.a)}·(t − sin t);  y(t) = ${n(p.a)}·(1 − cos t)`;
        show.bahn = k === 'kreis' ? `x² + y² = ${n(p.a * p.a)}` : k === 'ellipse' ? `x²/${n(p.a * p.a)} + y²/${n(p.b * p.b)} = 1` : null;
        show.info = k === 'zykloide' ? tr('zykInfo', { a: n(p.a) }) : k === 'lissajous' ? tr('lissInfo', { a: p.fa, b: p.fb }) : null;
        show.pt = P ? `t = ${n(t)}:  P(${n(P[0])} | ${n(P[1])})` : null;
      } else {
        const kind = p.pk as PolarKind;
        show.eq = kind === 'kreis' ? `r = ${n(p.ra)}` : kind === 'spirale' ? `r = ${n(p.ra)}/(2π)·φ` : kind === 'rose' ? `r = ${n(p.ra)}·cos(${p.k}φ)` : kind === 'kardioide' ? `r = ${n(p.ra / 2)}·(1 + cos φ)` : `r² = ${n(p.ra * p.ra)}·cos(2φ)`;
        const r = polarR(kind, p.ra, p.k, t);
        show.pt = Number.isNaN(r) ? `φ = ${n((t / DEG) % 360, 0)}°: ${ctx.t('undef')}` : tr('polarPt', { phi: n(t / DEG, 0), r: n(r), x: n(P![0]), y: n(P![1]) });
      }
      for (const key of ['eq', 'bahn', 'pt', 'info']) ctx.readout(key, show[key] ?? null);
    }

    function sample(from: number, to: number, steps: number): (Pt | null)[] {
      const out: (Pt | null)[] = [];
      for (let i = 0; i <= steps; i++) out.push(pointAt(from + ((to - from) * i) / steps));
      return out;
    }

    /** Polylinie mit Lücken (null-Punkte trennen Abschnitte). */
    function drawPath(pts: (Pt | null)[], color: string, width: number, alpha?: number): void {
      let seg: Pt[] = [];
      const flush = () => {
        if (seg.length > 1) plot.polyline(seg, { color, width, alpha });
        seg = [];
      };
      for (const q of pts) {
        if (q) seg.push(q);
        else flush();
      }
      flush();
    }

    function draw(): void {
      const th = ctx.theme;
      const c0 = th.series[0]!;
      const c1 = th.series[1]!;
      plot.begin();
      if (mode() === 'polar') {
        // Polarraster
        const R = (p.pk === 'spirale' ? 3 * p.ra : p.ra) + 0.6;
        const step = R > 10 ? 2 : 1;
        for (let r = step; r <= R; r += step) plot.circle(0, 0, r, { stroke: th.grid, width: 1 });
        for (let a = 0; a < 360; a += 30) plot.segment([0, 0], polarToCart(R * 1.5, a * DEG), { color: th.grid, width: 1 });
        plot.axes();
      } else {
        plot.grid({ minor: false });
        plot.axes();
      }
      const [t0, t1] = tRange();
      const t = tNow();
      const N = 600;
      drawPath(sample(t0, t1, N), c0, 2, 0.25);
      drawPath(sample(t0, t, Math.max(2, Math.round(N * p.u))), c0, 3);
      const P = pointAt(t);
      if (mode() === 'wurf') {
        plot.hline(0, { color: th.muted, width: 1.5 });
        const A = apex(p.v0, p.al, p.h);
        plot.point(A[0], A[1], { color: th.series[2]!, radius: 4 });
        if (P) {
          // Geschwindigkeitspfeil (Länge: Weg in 0,25 s)
          const al = p.al * DEG;
          const vx = p.v0 * Math.cos(al);
          const vy = p.v0 * Math.sin(al) - G * t;
          plot.arrow(P, [P[0] + vx * 0.25, P[1] + vy * 0.25], { color: th.series[3]!, width: 2 });
          plot.segment([P[0], 0], P, { color: th.muted, width: 1, dash: [4, 4] });
          plot.segment([0, P[1]], P, { color: th.muted, width: 1, dash: [4, 4] });
        }
      } else if (mode() === 'kurve') {
        if (P) {
          plot.segment([P[0], 0], P, { color: c1, width: 1.5, dash: [4, 4] });
          plot.segment([0, P[1]], P, { color: c1, width: 1.5, dash: [4, 4] });
          plot.point(P[0], 0, { color: c1, radius: 3 });
          plot.point(0, P[1], { color: c1, radius: 3 });
          if (p.kt === 'zykloide') {
            // rollendes Rad
            const cx = p.a * t;
            plot.circle(cx, p.a, p.a, { stroke: th.muted, width: 1.5 });
            plot.segment([cx, p.a], P, { color: th.muted, width: 1.5 });
            plot.point(cx, p.a, { color: th.muted, radius: 3 });
          }
        }
      } else {
        const phiShown = Math.min(t, 2 * Math.PI);
        plot.arc(0, 0, 0.8, 0, phiShown, { stroke: th.series[3]!, width: 2 });
        if (P) plot.segment([0, 0], P, { color: c1, width: 2 });
        else plot.segment([0, 0], polarToCart(p.ra, t), { color: th.muted, width: 1.5, dash: [4, 4] });
      }
      if (P) plot.point(P[0], P[1], { color: c1, radius: 6 });
      plot.end();
    }

    return {
      update() {
        setRange();
        updateReadouts();
      },
      render() {
        surface.begin();
        plot.resize();
        draw();
      },
      destroy: () => surface.destroy(),
    };
  },
});
