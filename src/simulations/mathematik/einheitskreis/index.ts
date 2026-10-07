import { defineSimulation, degToRad, formatPiFraction, mod, Plot, radToDeg, Surface, type Rect } from '../../../sim-core';
import { exactTrig, quadrant, tanDefined } from './model';

const L = (de: string, en: string) => ({ de, en });
const TAU = Math.PI * 2;
const ROMAN = ['', 'I', 'II', 'III', 'IV'];

/** Nebeneinander (breit) oder untereinander (schmal)? */
const isWide = (w: number) => w >= 600;
const circleSize = (w: number, h: number) => Math.min(h, w * 0.42);

const circleRegion = (w: number, h: number): Rect => {
  if (!isWide(w)) return { x: 0, y: 0, w, h: h * 0.56 };
  const size = circleSize(w, h);
  return { x: 0, y: (h - size) / 2, w: size, h: size };
};

const graphRegion = (w: number, h: number): Rect => {
  if (!isWide(w)) return { x: 0, y: h * 0.56, w, h: h * 0.44 };
  const size = circleSize(w, h);
  return { x: size, y: 0, w: w - size, h };
};

/**
 * Einheitskreis: Ein Punkt P läuft auf dem Kreis mit Radius 1. Seine
 * Koordinaten sind (cos α | sin α). Rechts entsteht daraus der Graph von
 * Sinus und Kosinus – die waagerechte Hilfslinie zeigt den Zusammenhang.
 */
export default defineSimulation({
  id: 'einheitskreis',
  animated: true,
  dragHint: true,
  layout: { aspect: 2.25, aspectNarrow: 0.78 },
  groups: [
    { id: 'show', label: L('Anzeige', 'Display') },
    { id: 'anim', label: L('Animation', 'Animation') },
  ],
  params: [
    { key: 'angle', type: 'number', label: L('Winkel α', 'Angle α'), min: 0, max: 360, step: 0.5, default: 30, unit: '°' },
    {
      key: 'unit',
      type: 'choice',
      label: L('Winkelmaß der Graph-Achse', 'Angle unit of the graph axis'),
      options: [
        { value: 'deg', label: L('Gradmaß', 'Degrees') },
        { value: 'rad', label: L('Bogenmaß', 'Radians') },
      ],
      default: 'deg',
    },
    { key: 'sin', type: 'boolean', group: 'show', label: L('Sinus', 'Sine'), default: true },
    { key: 'cos', type: 'boolean', group: 'show', label: L('Kosinus', 'Cosine'), default: true },
    { key: 'tan', type: 'boolean', group: 'show', label: L('Tangens', 'Tangent'), default: false },
    { key: 'snap', type: 'boolean', group: 'show', label: L('Beim Ziehen auf 5°-Schritte einrasten', 'Snap to 5° steps when dragging'), default: true },
    { key: 'speed', type: 'number', group: 'anim', label: L('Geschwindigkeit', 'Speed'), min: 5, max: 120, step: 5, default: 30, unit: '°/s' },
  ],
  readouts: [
    { key: 'angle', label: L('Winkel', 'Angle') },
    { key: 'sin', label: L('Sinus', 'Sine'), spoiler: true },
    { key: 'cos', label: L('Kosinus', 'Cosine'), spoiler: true },
    { key: 'tan', label: L('Tangens', 'Tangent'), spoiler: true },
    { key: 'quadrant', label: L('Quadrant', 'Quadrant') },
    { key: 'pyth', label: L('Trigonometrischer Pythagoras', 'Pythagorean identity'), spoiler: true },
  ],
  presets: [
    { id: '30', label: L('30°', '30°'), values: { angle: 30 } },
    { id: '45', label: L('45°', '45°'), values: { angle: 45 } },
    { id: '60', label: L('60°', '60°'), values: { angle: 60 } },
    { id: '150', label: L('150° (II. Quadrant)', '150° (2nd quadrant)'), values: { angle: 150 } },
    { id: 'rad', label: L('Bogenmaß', 'Radians'), values: { angle: 90, unit: 'rad' } },
    { id: 'tan', label: L('Mit Tangens', 'With tangent'), values: { angle: 40, tan: true, cos: false } },
  ],
  strings: {
    de: {
      canvas: 'Einheitskreis mit Punkt P und daneben die Graphen von Sinus und Kosinus',
      undefined: 'nicht definiert (cos α = 0)',
      onAxis: 'Punkt liegt auf einer Achse',
      quadrant: 'Quadrant',
    },
    en: {
      canvas: 'Unit circle with point P and the graphs of sine and cosine next to it',
      undefined: 'undefined (cos α = 0)',
      onAxis: 'the point lies on an axis',
      quadrant: 'quadrant',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const circle = new Plot(surface, {
      x: [-1.35, 1.35],
      y: [-1.35, 1.35],
      region: circleRegion,
      pan: false,
      zoom: false,
    });
    const graph = new Plot(surface, {
      x: [-0.35, TAU + 0.35],
      y: [-1.5, 1.5],
      equalAspect: false,
      region: graphRegion,
      pan: false,
      zoom: false,
      xAxis: { degrees: true, label: 'α' },
    });
    const p = ctx.params;
    const fmt = ctx.fmt;
    const editable = () => !ctx.locked;
    const color = {
      sin: () => ctx.theme.series[1]!,
      cos: () => ctx.theme.series[0]!,
      tan: () => ctx.theme.series[2]!,
      angle: () => ctx.theme.series[3]!,
    };

    /** Fließkomma-Winkel für ruckelfreie Animation (der Parameter ist auf 0,5° gerundet). */
    let phi = p.angle;
    let lastSize = '';

    const setAngle = (deg: number) => {
      let value = mod(deg, 360);
      if (p.snap) value = Math.round(value / 5) * 5;
      phi = value;
      ctx.set({ angle: value });
    };

    circle.addHandle({
      get: () => {
        const r = degToRad(phi);
        return [Math.cos(r), Math.sin(r)];
      },
      set: (x, y) => setAngle(radToDeg(Math.atan2(y, x))),
      enabled: editable,
      color: () => ctx.theme.text,
    });
    graph.addHandle({
      get: () => {
        const r = degToRad(phi);
        return [r, p.sin || !p.cos ? Math.sin(r) : Math.cos(r)];
      },
      set: (x) => setAngle(radToDeg(Math.min(TAU, Math.max(0, x)))),
      axis: 'x',
      enabled: editable,
      color: () => (p.sin || !p.cos ? color.sin() : color.cos()),
    });

    function trigText(fn: 'sin' | 'cos' | 'tan', deg: number, value: number): string {
      const exact = exactTrig(deg, fn);
      if (exact === '0' || exact === '1' || exact === '−1') return `${fn} α = ${exact}`;
      if (exact) return `${fn} α = ${exact} ≈ ${fmt.num(value, 3)}`;
      return `${fn} α ≈ ${fmt.num(value, 3)}`;
    }

    function layout(): void {
      const key = `${surface.width}x${surface.height}`;
      if (key === lastSize) return;
      lastSize = key;
      const { width: w, height: h } = surface;
      const k = isWide(w) ? (1.35 * h) / circleSize(w, h) : 1.5;
      graph.setRange([-0.35, TAU + 0.35], [-k, k]);
    }

    return {
      update(changed) {
        if (changed.has('angle') && Math.abs(p.angle - phi) > 0.3) phi = p.angle;
        if (changed.has('unit')) graph.setAxes({ x: { degrees: p.unit === 'deg', pi: p.unit === 'rad', label: 'α' } });

        const deg = p.angle;
        const rad = degToRad(deg);
        const piText = formatPiFraction(rad);
        const radText = piText && piText !== '0' ? `${piText} ≈ ${fmt.num(rad, 3)}` : fmt.num(rad, 3);
        ctx.readout(
          'angle',
          p.unit === 'deg' ? `α = ${fmt.num(deg, 1)}° ≙ ${radText}` : `α = ${radText} ≙ ${fmt.num(deg, 1)}°`,
        );
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        ctx.readout('sin', trigText('sin', deg, s));
        ctx.readout('cos', trigText('cos', deg, c));
        ctx.readout('tan', !p.tan ? null : tanDefined(deg) ? trigText('tan', deg, s / c) : `tan α: ${ctx.t('undefined')}`);
        const q = quadrant(deg);
        const sign = (v: number) => (v > 0 ? '> 0' : '< 0');
        ctx.readout(
          'quadrant',
          q === 0 ? ctx.t('onAxis') : `${ROMAN[q]}. ${ctx.t('quadrant')} (sin α ${sign(s)}, cos α ${sign(c)})`,
        );
        ctx.readout('pyth', `sin²α + cos²α = ${fmt.num(s * s, 3)} + ${fmt.num(c * c, 3)} = 1`);
      },

      tick(dt) {
        phi = mod(phi + p.speed * dt, 360);
        ctx.set({ angle: Math.round(phi * 2) / 2 });
      },

      resetTime() {
        setAngle(0);
      },

      render() {
        layout();
        const rad = degToRad(phi);
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        const g = surface.begin();
        const muted = ctx.theme.muted;

        /* ---- Einheitskreis ---- */
        circle.begin();
        circle.grid({ minor: false });
        circle.axes();
        circle.circle(0, 0, 1, { stroke: muted, width: 2 });

        circle.arcPx(0, 0, 30, 0, rad, { fill: color.angle(), alpha: 0.18, sector: true });
        circle.arcPx(0, 0, 30, 0, rad, { stroke: color.angle(), width: 2 });
        const mid = rad / 2;
        const [ax, ay] = circle.toPx(0, 0);
        circle.textPx(ax + Math.cos(mid) * 44, ay - Math.sin(mid) * 44, 'α', {
          color: color.angle(),
          math: true,
          size: 16,
          align: 'center',
          baseline: 'middle',
        });

        if (p.tan && tanDefined(phi)) {
          const t = Math.max(-3, Math.min(3, s / c));
          circle.vline(1, { color: color.tan(), width: 1, dash: [3, 5], alpha: 0.6 });
          circle.segment([0, 0], [1, t], { color: color.tan(), width: 1.5, dash: [5, 5] });
          circle.segment([1, 0], [1, t], { color: color.tan(), width: 4 });
          circle.text(1, t / 2, 'tan α', { color: color.tan(), baseline: 'middle', offset: [8, 0], weight: '600', size: 13 });
        }
        if (p.cos) {
          circle.segment([0, 0], [c, 0], { color: color.cos(), width: 4 });
          circle.text(c / 2, 0, 'cos α', { color: color.cos(), align: 'center', baseline: s >= 0 ? 'top' : 'bottom', offset: [0, s >= 0 ? 22 : -8], weight: '600', size: 13 });
        }
        if (p.sin) {
          circle.segment([c, 0], [c, s], { color: color.sin(), width: 4 });
          circle.text(c, s / 2, 'sin α', { color: color.sin(), align: c >= 0 ? 'left' : 'right', baseline: 'middle', offset: [c >= 0 ? 8 : -8, 0], weight: '600', size: 13 });
        }
        circle.segment([0, 0], [c, s], { color: ctx.theme.text, width: 2 });
        circle.point(c, s, { color: ctx.theme.text, radius: 6 });
        circle.text(c, s, 'P', { math: true, size: 17, align: c >= 0 ? 'left' : 'right', offset: [c >= 0 ? 10 : -10, s >= 0 ? -10 : 20] });
        circle.end();

        /* ---- Graphen ---- */
        graph.begin();
        graph.grid({ minor: false });
        graph.axes();
        graph.vline(rad, { color: muted, width: 1, dash: [4, 4] });
        const curves: ['sin' | 'cos' | 'tan', (x: number) => number][] = [];
        if (p.tan) curves.push(['tan', Math.tan]);
        if (p.cos) curves.push(['cos', Math.cos]);
        if (p.sin) curves.push(['sin', Math.sin]);
        for (const [name, f] of curves) {
          const col = color[name]();
          graph.fn(f, { color: col, width: 2, alpha: 0.3, from: 0, to: TAU });
          graph.fn(f, { color: col, width: 3, from: 0, to: rad });
          if (name !== 'tan' || tanDefined(phi)) graph.point(rad, f(rad), { color: col, radius: 5 });
        }
        graph.end();

        /* ---- Verbindungslinie und Trennlinie (nur nebeneinander) ---- */
        if (isWide(surface.width)) {
          const r = graph.rect;
          g.strokeStyle = ctx.theme.grid;
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(r.x + 0.5, 0);
          g.lineTo(r.x + 0.5, surface.height);
          g.stroke();
          if (p.sin) {
            const [x1, y1] = circle.toPx(c, s);
            const [x2, y2] = graph.toPx(rad, s);
            g.save();
            g.strokeStyle = color.sin();
            g.globalAlpha = 0.7;
            g.setLineDash([5, 5]);
            g.lineWidth = 1.5;
            g.beginPath();
            g.moveTo(x1, y1);
            g.lineTo(x2, y2);
            g.stroke();
            g.restore();
          }
        }
      },

      destroy: () => surface.destroy(),
    };
  },
});
