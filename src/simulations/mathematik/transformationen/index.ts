import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import { anchors, asymptotes, base, keyPoints, mapPoint, stages, transformed, type Base, type Trafo } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
type Key = 'a' | 'b' | 'c' | 'd';

/** Klammern um zusammengesetzte Ausdrücke (für Potenzen). */
const par = (u: string) => (u === 'x' ? u : `(${u})`);

/** Grundfunktionen mit Term (Kurzschrift der Formeln) und Name. */
const BASES: Record<Base, { f: (inner: string) => string; name: { de: string; en: string } }> = {
  sq: { f: (u) => `${par(u)}^2`, name: L('Normalparabel', 'Square') },
  cub: { f: (u) => `${par(u)}^3`, name: L('Kubikfunktion', 'Cube') },
  sqrt: { f: (u) => `\\r{${u}}`, name: L('Wurzelfunktion', 'Square root') },
  abs: { f: (u) => `|${u}|`, name: L('Betragsfunktion', 'Absolute value') },
  inv: { f: (u) => `\\f{1}{${u}}`, name: L('Kehrwertfunktion', 'Reciprocal') },
  sin: { f: (u) => `\\t{sin}(${u})`, name: L('Sinusfunktion', 'Sine') },
  exp: { f: (u) => `2^{${u}}`, name: L('Exponentialfunktion', 'Exponential') },
};

/**
 * Transformationen von Graphen: g(x) = a · f(b(x − c)) + d für sieben
 * Grundfunktionen. Zwei Griffe am Graphen (Ankerpunkt verschiebt, Formpunkt
 * streckt), markante Punkte mit Abbildungspfeilen und eine
 * Schritt-für-Schritt-Animation f → f(bx) → f(b(x − c)) → a·… → … + d.
 */
export default defineSimulation({
  id: 'transformationen',
  dragHint: true,
  layout: { aspect: 1.62, aspectNarrow: 0.5 },
  groups: [
    { id: 'par', label: L('Parameter', 'Parameters') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'f',
      type: 'choice',
      label: L('Grundfunktion f', 'Basic function f'),
      options: [
        { value: 'sq', label: L('x²', 'x²') },
        { value: 'cub', label: L('x³', 'x³') },
        { value: 'sqrt', label: L('√x', '√x') },
        { value: 'abs', label: L('|x|', '|x|') },
        { value: 'inv', label: L('1/x', '1/x') },
        { value: 'sin', label: L('sin x', 'sin x') },
        { value: 'exp', label: L('2ˣ', '2ˣ') },
      ],
      default: 'sq',
    },
    { key: 'a', type: 'number', group: 'par', label: L('a (Streckung in y-Richtung)', 'a (vertical stretch)'), min: -3, max: 3, step: 0.1, default: 2 },
    { key: 'b', type: 'number', group: 'par', label: L('b (Streckung in x-Richtung, Faktor 1/b)', 'b (horizontal stretch, factor 1/b)'), min: -3, max: 3, step: 0.1, default: 1 },
    { key: 'c', type: 'number', group: 'par', label: L('c (Verschiebung in x-Richtung)', 'c (horizontal shift)'), min: -5, max: 5, step: 0.1, default: 1 },
    { key: 'd', type: 'number', group: 'par', label: L('d (Verschiebung in y-Richtung)', 'd (vertical shift)'), min: -5, max: 5, step: 0.1, default: -2 },
    { key: 'base', type: 'boolean', group: 'view', label: L('Grundfunktion f zeigen', 'Show the basic function f'), default: true },
    { key: 'pts', type: 'boolean', group: 'view', label: L('Markante Punkte mit Pfeilen', 'Key points with arrows'), default: true },
    { key: 'info', type: 'boolean', group: 'view', label: L('Term und Wirkung zeigen', 'Show the term and the effects'), help: L('Aus: für Aufgaben „Welcher Term gehört zum Graphen?“', 'Off: for tasks “Which term belongs to the graph?”'), default: true },
  ],
  actions: [{ id: 'steps', label: L('Schritt für Schritt', 'Step by step'), primary: true }],
  readouts: [
    { key: 'g', label: L('Funktionsterm', 'Function'), spoiler: true },
    { key: 'map', label: L('Punkte', 'Points'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Verschobene, gestreckte Parabel', 'Shifted, stretched parabola'), values: {} },
    { id: 'mirror', label: L('Spiegeln an der x-Achse', 'Reflecting in the x-axis'), values: { a: -1, b: 1, c: 0, d: 0 } },
    { id: 'sqrt', label: L('Wurzel: Spiegeln an der y-Achse', 'Square root: reflecting in the y-axis'), values: { f: 'sqrt', a: 1, b: -1, c: 2, d: 0 } },
    { id: 'sin', label: L('Sinus: Periode und Amplitude', 'Sine: period and amplitude'), values: { f: 'sin', a: 2, b: 2, c: 0, d: 1 } },
    { id: 'inv', label: L('Hyperbel verschieben', 'Shifting a hyperbola'), values: { f: 'inv', a: 2, b: 1, c: -1, d: 1 } },
    { id: 'exp', label: L('Exponentialfunktion', 'Exponential function'), values: { f: 'exp', a: -1, b: 1, c: 1, d: 3 } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatensystem mit dem Graphen einer Grundfunktion f (blass) und ihrem Bild g(x) = a · f(b(x − c)) + d; markante Punkte sind mit Pfeilen verbunden, zwei Punkte am Graphen lassen sich ziehen. Daneben Term, Wirkung der Parameter und Abbildung der Punkte.',
      termT: 'Funktionsterm',
      effT: 'Wirkung der Parameter',
      mapT: 'Punkte',
      mapRule: '(x | y) wird zu (x/b + c | a·y + d)',
      hidden: 'Welche Werte haben a, b, c und d? Vergleiche g mit der Grundfunktion f.',
      aNone: 'a = 1: keine Streckung in y-Richtung',
      aStretch: 'Streckung in y-Richtung mit Faktor {v}',
      aSquash: 'Stauchung in y-Richtung mit Faktor {v}',
      aMirror: ' und Spiegelung an der x-Achse',
      aMirrorOnly: 'Spiegelung an der x-Achse',
      bNone: 'b = 1: keine Streckung in x-Richtung',
      bStretch: 'Streckung in x-Richtung mit Faktor {v}',
      bSquash: 'Stauchung in x-Richtung mit Faktor {v}',
      bMirror: ' und Spiegelung an der y-Achse',
      bMirrorOnly: 'Spiegelung an der y-Achse',
      cNone: 'c = 0: keine Verschiebung in x-Richtung',
      cRight: 'Verschiebung um {v} nach rechts',
      cLeft: 'Verschiebung um {v} nach links',
      dNone: 'd = 0: keine Verschiebung in y-Richtung',
      dUp: 'Verschiebung um {v} nach oben',
      dDown: 'Verschiebung um {v} nach unten',
      step0: 'Grundfunktion f',
      step1: '① Streckung/Spiegelung in x-Richtung (b)',
      step2: '② Verschiebung in x-Richtung (c)',
      step3: '③ Streckung/Spiegelung in y-Richtung (a)',
      step4: '④ Verschiebung in y-Richtung (d)',
      order: 'Reihenfolge: erst b, dann c, dann a, dann d.',
      ex: 'Beispiel: {p} → {q}',
      b0: 'b = 0 ist nicht erlaubt.',
    },
    en: {
      canvas: 'Coordinate system with the graph of a basic function f (faint) and its image g(x) = a · f(b(x − c)) + d; key points are joined by arrows and two points on the graph can be dragged. Next to it the term, the effect of the parameters and the mapping of points.',
      termT: 'Function',
      effT: 'Effect of the parameters',
      mapT: 'Points',
      mapRule: '(x | y) becomes (x/b + c | a·y + d)',
      hidden: 'What are a, b, c and d? Compare g with the basic function f.',
      aNone: 'a = 1: no vertical stretch',
      aStretch: 'vertical stretch by factor {v}',
      aSquash: 'vertical compression by factor {v}',
      aMirror: ' and reflection in the x-axis',
      aMirrorOnly: 'reflection in the x-axis',
      bNone: 'b = 1: no horizontal stretch',
      bStretch: 'horizontal stretch by factor {v}',
      bSquash: 'horizontal compression by factor {v}',
      bMirror: ' and reflection in the y-axis',
      bMirrorOnly: 'reflection in the y-axis',
      cNone: 'c = 0: no horizontal shift',
      cRight: 'shift {v} to the right',
      cLeft: 'shift {v} to the left',
      dNone: 'd = 0: no vertical shift',
      dUp: 'shift {v} up',
      dDown: 'shift {v} down',
      step0: 'Basic function f',
      step1: '① horizontal stretch/reflection (b)',
      step2: '② horizontal shift (c)',
      step3: '③ vertical stretch/reflection (a)',
      step4: '④ vertical shift (d)',
      order: 'Order: first b, then c, then a, then d.',
      ex: 'Example: {p} → {q}',
      b0: 'b = 0 is not allowed.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    const wide = () => surface.width >= 640;
    const F = (w: number, n: number) => (wide() ? w : n);
    const font = (weight: number, size: number) => `${weight} ${size}px ${th().font}`;
    const narrow = () => surface.width < 640 && surface.height > surface.width * 0.9;
    const kind = () => p.f as Base;

    const col = {
      f: () => th().muted,
      g: () => th().series[0]!,
      a: () => th().series[1]!,
      b: () => th().series[3]!,
      c: () => th().series[2]!,
      d: () => th().series[4]!,
      pts: () => th().series[5]!,
    };
    const colOf = (k: Key) => col[k]();

    /* ---------- Aufteilung ---------- */
    function regions(): { plot: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (narrow()) {
        const ph = Math.round(clamp(w * 0.8, 240, h * 0.5));
        return { plot: { x: 0, y: 0, w, h: ph }, col: { x: 2, y: ph + 8, w: w - 4, h: h - ph - 10 } };
      }
      const colW = Math.round(clamp(w * 0.35, 240, 340));
      return { plot: { x: 0, y: 0, w: w - colW - 10, h }, col: { x: w - colW, y: 2, w: colW - 2, h: h - 4 } };
    }
    const plot = new Plot(surface, { x: [-7, 7], y: [-5, 6], pan: false, zoom: false, controls: false, region: () => regions().plot, xAxis: { label: 'x' }, yAxis: { label: 'y' } });

    /* ---------- Zustand ---------- */
    const bOf = (v: number) => (Math.abs(v) < 0.05 ? (v < 0 ? -0.1 : 0.1) : v);
    const target = (): Trafo => ({ a: p.a, b: bOf(p.b), c: p.c, d: p.d });
    // b gleitet über s = 1/b (Spiegelung wird als „Umklappen“ sichtbar)
    let sh = { a: p.a, s: 1 / bOf(p.b), c: p.c, d: p.d };
    const shownT = (): Trafo => ({ a: sh.a, b: Math.abs(sh.s) < 1e-3 ? 1e3 : 1 / sh.s, c: sh.c, d: sh.d });
    let story: { t0: number; to: Trafo } | null = null;
    const STEP = 1500;
    const PAUSE = 450;
    let lastFrame = performance.now();
    let dragging = 0;
    let intro = reduced ? 1 : 0;

    function storyState(now: number): { t: Trafo; stage: number; local: number; prev: Trafo } {
      const s = story!;
      const st = stages(s.to);
      const el = now - s.t0 - 700;
      if (el < 0) return { t: st[0]!, stage: 0, local: 0, prev: st[0]! };
      const k = Math.floor(el / (STEP + PAUSE));
      if (k >= 4) return { t: st[4]!, stage: 4, local: 1, prev: st[3]! };
      const local = ease.inOutCubic(clamp((el - k * (STEP + PAUSE)) / STEP, 0, 1));
      const from = st[k]!;
      const to = st[k + 1]!;
      const sFrom = 1 / from.b;
      const sTo = 1 / to.b;
      const s1 = lerp(sFrom, sTo, local);
      return {
        t: { a: lerp(from.a, to.a, local), b: Math.abs(s1) < 1e-3 ? 1e3 : 1 / s1, c: lerp(from.c, to.c, local), d: lerp(from.d, to.d, local) },
        stage: k + 1,
        local,
        prev: from,
      };
    }
    const storyEnd = () => 700 + 4 * (STEP + PAUSE) + 600;

    function step(dt: number, now: number): boolean {
      if (story && now - story.t0 > storyEnd()) {
        story = null;
        const t = target();
        sh = { a: t.a, s: 1 / t.b, c: t.c, d: t.d };
      }
      if (story) return true;
      const t = target();
      const goal = { a: t.a, s: 1 / t.b, c: t.c, d: t.d };
      const k = reduced || dragging ? 1 : 1 - Math.exp(-dt * 8);
      let moving = false;
      const next = { ...sh };
      for (const key of Object.keys(goal) as (keyof typeof goal)[]) {
        const dd = goal[key] - sh[key];
        if (Math.abs(dd) > 1e-4) {
          next[key] = sh[key] + dd * k;
          moving = true;
        } else next[key] = goal[key];
      }
      sh = next;
      return moving;
    }

    /* ---------- Griffe ---------- */
    const r1 = (v: number) => Math.round(v * 10) / 10;
    plot.addHandle({
      get: () => {
        const { p0 } = anchors(kind());
        return mapPoint(shownT(), p0[0], p0[1]);
      },
      set: (x, y) => {
        dragging = performance.now();
        const t = target();
        const { p0 } = anchors(kind());
        ctx.set({ c: r1(clamp(x - p0[0] / t.b, -5, 5)), d: r1(clamp(y - t.a * p0[1], -5, 5)) });
      },
      enabled: () => !ctx.locked && !story,
      color: () => col.c(),
    });
    plot.addHandle({
      get: () => {
        const { p1 } = anchors(kind());
        return mapPoint(shownT(), p1[0], p1[1]);
      },
      set: (x, y) => {
        dragging = performance.now();
        const t = target();
        const { p1 } = anchors(kind());
        const dx = x - t.c;
        const vals: Record<string, number> = {};
        if (Math.abs(dx) > 0.08) vals.b = r1(clamp(p1[0] / dx, -3, 3));
        if (Math.abs(vals.b ?? 1) < 0.1) vals.b = (vals.b ?? 1) < 0 ? -0.1 : 0.1;
        vals.a = r1(clamp((y - t.d) / p1[1], -3, 3));
        ctx.set(vals);
      },
      enabled: () => !ctx.locked && !story,
      color: () => col.a(),
    });

    /* ---------- Formeln ---------- */
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { a: col.a(), b: col.b(), c: col.c(), d: col.d(), g: col.g() },
    });
    function fitFormula(src: string, maxW: number, size: number, color = th().text, weight = 600) {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > 9.5) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }
    const n1 = (v: number) => fmt.num(v, 1);
    const n2 = (v: number) => fmt.num(v, 2);
    /** Konkreter Term mit farbigen Zahlen, z. B. g(x) = 2 · (x − 1)² − 2. */
    function termSrc(t: Trafo, colored = true): string {
      const C = (k: Key, s: string) => (colored ? `\\c{${k}}{${s}}` : s);
      const inner0 = t.c === 0 ? 'x' : `x ${t.c > 0 ? '−' : '+'} ${C('c', n1(Math.abs(t.c)))}`;
      let inner: string;
      if (t.b === 1) inner = inner0;
      else if (t.b === -1) inner = t.c === 0 ? '−x' : `−(${inner0})`;
      else inner = t.c === 0 ? `${C('b', n1(t.b))}x` : `${C('b', n1(t.b))}(${inner0})`;
      const fx = BASES[kind()].f(inner);
      let s = 'g(x) = ';
      if (t.a === -1) s += '−';
      else if (t.a !== 1) s += `${C('a', n1(t.a))} · `;
      s += fx;
      if (t.d !== 0) s += ` ${t.d > 0 ? '+' : '−'} ${C('d', n1(Math.abs(t.d)))}`;
      return s;
    }
    const generalSrc = () => `g(x) = \\c{a}{a} · ${BASES[kind()].f('\\c{b}{b}(x − \\c{c}{c})')} + \\c{d}{d}`;

    function effect(k: Key, t: Trafo): string {
      const v = t[k];
      if (k === 'a') {
        if (v === 1) return ctx.t('aNone');
        const m = Math.abs(v);
        if (m === 1) return ctx.t('aMirrorOnly');
        return tr(m > 1 ? 'aStretch' : 'aSquash', { v: n2(m) }) + (v < 0 ? ctx.t('aMirror') : '');
      }
      if (k === 'b') {
        if (v === 1) return ctx.t('bNone');
        const m = Math.abs(v);
        if (m === 1) return ctx.t('bMirrorOnly');
        return tr(m > 1 ? 'bSquash' : 'bStretch', { v: n2(1 / m) }) + (v < 0 ? ctx.t('bMirror') : '');
      }
      if (k === 'c') return v === 0 ? ctx.t('cNone') : tr(v > 0 ? 'cRight' : 'cLeft', { v: n1(Math.abs(v)) });
      return v === 0 ? ctx.t('dNone') : tr(v > 0 ? 'dUp' : 'dDown', { v: n1(Math.abs(v)) });
    }

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const t = target();
      const html = termSrc(t, false)
        .replace(/\\r\{([^}]*)\}/g, '√($1)')
        .replace(/\\f\{1\}\{([^}]*)\}/g, '1/($1)')
        .replace(/\\t\{sin\}/g, 'sin')
        .replace(/\^\{([^}]*)\}/g, '<sup>$1</sup>')
        .replace(/\^(\d)/g, '<sup>$1</sup>')
        .replace(/\bx\b/g, '<var>x</var>')
        .replace(/\bg\(/g, '<var>g</var>(');
      ctx.readout('g', { html });
      const [x0, y0] = anchors(kind()).p1;
      const [x1, y1] = mapPoint(t, x0, y0);
      ctx.readout('map', tr('ex', { p: fmt.point(r1(x0 * 100) / 100, y0), q: fmt.point(Math.round(x1 * 100) / 100, Math.round(y1 * 100) / 100) }));
      ctx.setAction('steps', { enabled: !ctx.locked });
    }

    /* ---------- Bausteine ---------- */
    function card(r: Rect, accent?: string, tint = 0): void {
      const g = surface.g;
      const theme = th();
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
      g.strokeStyle = accent ? withAlpha(accent, 0.55) : theme.dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
    }
    function title(x: number, y: number, label: string, color = th().muted): void {
      text(surface.g, label, x, y, { font: font(700, F(12, 11)), color, align: 'left' });
    }
    function wrap(str: string, maxW: number, f: string): string[] {
      const g = surface.g;
      g.font = f;
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
    function pill(x: number, y: number, label: string, color: string): void {
      const g = surface.g;
      const f = font(700, F(12.5, 11.5));
      g.font = f;
      const w = g.measureText(label).width + 18;
      const h = 24;
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      g.fillStyle = th().dark ? 'rgba(15,20,30,0.92)' : 'rgba(255,255,255,0.95)';
      roundRect(g, x, y, w, h, 12);
      g.fill();
      g.restore();
      g.strokeStyle = withAlpha(color, 0.7);
      g.lineWidth = 1.3;
      roundRect(g, x + 0.5, y + 0.5, w - 1, h - 1, 12);
      g.stroke();
      text(g, label, x + w / 2, y + h / 2 + 0.5, { font: f, color });
    }
    function arrow(x0: number, y0: number, x1: number, y1: number, color: string, alpha: number): void {
      const g = surface.g;
      const L2 = Math.hypot(x1 - x0, y1 - y0);
      if (L2 < 14) return;
      const ux = (x1 - x0) / L2;
      const uy = (y1 - y0) / L2;
      const sx = x0 + ux * 7;
      const sy = y0 + uy * 7;
      const ex = x1 - ux * 8;
      const ey = y1 - uy * 8;
      g.save();
      g.globalAlpha = alpha;
      g.strokeStyle = color;
      g.fillStyle = color;
      g.lineWidth = 1.6;
      g.setLineDash([4, 4]);
      g.beginPath();
      g.moveTo(sx, sy);
      g.lineTo(ex, ey);
      g.stroke();
      g.setLineDash([]);
      g.beginPath();
      g.moveTo(ex + ux * 2, ey + uy * 2);
      g.lineTo(ex - ux * 7 - uy * 4, ey - uy * 7 + ux * 4);
      g.lineTo(ex - ux * 7 + uy * 4, ey - uy * 7 - ux * 4);
      g.closePath();
      g.fill();
      g.restore();
    }

    /* ---------- Plot ---------- */
    function drawPlot(now: number): void {
      const g = surface.g;
      const theme = th();
      plot.begin();
      plot.grid();
      plot.axes();
      const k = kind();
      const st = story ? storyState(now) : null;
      const t = st ? st.t : shownT();
      const r = plot.rect;
      // Grundfunktion
      if (p.base) plot.fn((x) => base(k, x), { color: withAlpha(col.f(), 0.9), width: 2, dash: [6, 5] });
      // vorige Stufe als Geist während der Schrittfolge
      if (st && st.stage > 0) plot.fn((x) => transformed(k, st.prev, x), { color: withAlpha(col.g(), 0.35), width: 2, dash: [3, 4] });
      // Asymptoten
      const as = asymptotes(k, t);
      g.save();
      g.strokeStyle = withAlpha(col.d(), 0.8);
      g.lineWidth = 1.6;
      g.setLineDash([7, 5]);
      if (as.x !== undefined) {
        const x = plot.px(as.x);
        g.beginPath();
        g.moveTo(x, r.y);
        g.lineTo(x, r.y + r.h);
        g.stroke();
      }
      if (as.y !== undefined) {
        const y = plot.py(as.y);
        g.beginPath();
        g.moveTo(r.x, y);
        g.lineTo(r.x + r.w, y);
        g.stroke();
      }
      g.restore();
      // Bildgraph (wächst beim Start von links nach rechts)
      const { xMin, xMax } = plot.bounds;
      const to = lerp(xMin, xMax, ease.inOutCubic(intro));
      if (Math.abs(1 / t.b) > 0.01) {
        g.save();
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.g(), '#ffffff', 0.5, 0.6);
        g.shadowBlur = 6;
        plot.fn((x) => transformed(k, t, x), { color: col.g(), width: 3.2, to });
        g.restore();
      }
      // markante Punkte und Abbildungspfeile
      if (p.pts && intro >= 1) {
        for (const [x, y] of keyPoints(k)) {
          const [X, Y] = mapPoint(t, x, y);
          const a0 = [plot.px(x), plot.py(y)] as const;
          const a1 = [plot.px(X), plot.py(Y)] as const;
          if (p.base) {
            arrow(a0[0], a0[1], a1[0], a1[1], col.pts(), 0.75);
            plot.point(x, y, { color: withAlpha(col.f(), 0.9), radius: 3.5 });
          }
          plot.point(X, Y, { color: col.pts(), radius: 4.2 });
        }
      }
      // Beschriftung der Graphen
      if (p.base) {
        const xl = k === 'sqrt' ? 5 : k === 'exp' ? 2.2 : k === 'sin' ? 2.2 : k === 'inv' ? 0.45 : 1.6;
        const yl = base(k, xl);
        if (Number.isFinite(yl)) plot.text(xl, yl, 'f', { color: col.f(), size: 15, weight: 'bold', math: true, offset: [8, -2], align: 'left' });
      }
      // Stufe der Schrittfolge
      if (st) pill(r.x + 10, r.y + 10, ctx.t(`step${st.stage}`), st.stage === 0 ? col.f() : colOf((['b', 'b', 'c', 'a', 'd'] as Key[])[st.stage]!));
      plot.end();
    }

    /* ---------- Karten ---------- */
    function termCard(R: Rect): void {
      const g = surface.g;
      const pad = F(14, 12);
      card(R, col.g(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('termT'), col.g());
      text(g, BASES[kind()].name[ctx.lang], R.x + R.w - pad, R.y + 16, { font: font(600, 11), color: th().muted, align: 'right' });
      const b0 = fitFormula(generalSrc(), R.w - 2 * pad, F(14, 13), th().muted, 600);
      b0.draw(g, R.x + pad, R.y + 32 + b0.asc);
      if (p.info) {
        const b1 = fitFormula(termSrc(target()), R.w - 2 * pad, F(17, 15), th().text, 700);
        b1.draw(g, R.x + pad, R.y + 32 + b0.asc + b0.desc + 12 + b1.asc);
      } else {
        const f = font(500, F(12.5, 12));
        wrap(ctx.t('hidden'), R.w - 2 * pad, f).forEach((row, i) => text(g, row, R.x + pad, R.y + 32 + b0.asc + b0.desc + 18 + i * 16, { font: f, color: th().text, align: 'left' }));
      }
    }

    function effCard(R: Rect, now: number): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('effT'));
      const t = target();
      const st = story ? storyState(now) : null;
      const order: Key[] = ['b', 'c', 'a', 'd'];
      const f = font(500, F(12.5, 11.5));
      const lh = F(16, 15);
      let y = R.y + 30;
      order.forEach((k, i) => {
        const rows = wrap(p.info ? effect(k, t) : '?', R.w - 2 * pad - 44, f);
        const h = rows.length * lh + 8;
        const active = st && st.stage === i + 1;
        const done = st && st.stage > i + 1;
        if (active) {
          g.fillStyle = withAlpha(colOf(k), theme.dark ? 0.18 : 0.1);
          roundRect(g, R.x + pad - 4, y - 2, R.w - 2 * pad + 8, h, 8);
          g.fill();
        }
        // farbige Plakette mit Parameter
        g.fillStyle = withAlpha(colOf(k), active || done || !st ? 0.9 : 0.35);
        roundRect(g, R.x + pad, y + 1, 30, 20, 10);
        g.fill();
        text(g, k, R.x + pad + 15, y + 11.5, { font: `italic 700 14px ${theme.mathFont}`, color: theme.dark ? '#10161f' : '#ffffff' });
        rows.forEach((row, j) => text(g, row, R.x + pad + 40, y + 11 + j * lh, { font: f, color: st && !active && !done ? theme.muted : theme.text, align: 'left' }));
        y += h + 2;
      });
      const of = font(600, F(11.5, 11));
      wrap(ctx.t('order'), R.w - 2 * pad, of).forEach((row, j) => text(g, row, R.x + pad, y + 8 + j * 14, { font: of, color: theme.muted, align: 'left' }));
    }
    function effH(w: number): number {
      const f = font(500, F(12.5, 11.5));
      const lh = F(16, 15);
      const t = target();
      let h = 30;
      for (const k of ['b', 'c', 'a', 'd'] as Key[]) h += wrap(p.info ? effect(k, t) : '?', w - 2 * F(14, 12) - 44, f).length * lh + 10;
      return h + 8 + wrap(ctx.t('order'), w - 2 * F(14, 12), font(600, F(11.5, 11))).length * 14 + 6;
    }

    function mapCard(R: Rect): void {
      const g = surface.g;
      const pad = F(14, 12);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('mapT'));
      const b = fitFormula('(x | y) \\t{→} (\\f{x}{\\c{b}{b}} + \\c{c}{c} | \\c{a}{a} · y + \\c{d}{d})', R.w - 2 * pad, F(14, 13), th().text, 650);
      b.draw(g, R.x + pad, R.y + 30 + b.asc);
      if (p.info) {
        const t = target();
        const [x0, y0] = anchors(kind()).p1;
        const [x1, y1] = mapPoint(t, x0, y0);
        const pt = (x: number, y: number) => `(${fmt.num(Math.round(x * 100) / 100, 2)} | ${fmt.num(Math.round(y * 100) / 100, 2)})`;
        const src = kind() === 'sin' ? `(\\f{π}{2} | 1) \\t{→} ${pt(x1, y1)}` : `${pt(x0, y0)} \\t{→} ${pt(x1, y1)}`;
        const b2 = fitFormula(src, R.w - 2 * pad, F(13, 12), col.pts(), 650);
        b2.draw(g, R.x + pad, R.y + 30 + b.asc + b.desc + 10 + b2.asc);
      }
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (dragging && now - dragging > 250) dragging = 0;
      const moving = step(dt, now);
      if (intro < 1) intro = Math.min(1, intro + dt * 1.1);
      surface.begin();
      plot.resize();
      drawPlot(now);
      const R = regions().col;
      const gap = F(10, 8);
      const tH = F(100, 92);
      termCard({ x: R.x, y: R.y, w: R.w, h: tH });
      const eH = effH(R.w);
      const mH = F(92, 84);
      const rest = R.h - tH - gap;
      if (rest >= eH + gap + mH) {
        effCard({ x: R.x, y: R.y + tH + gap, w: R.w, h: rest - mH - gap }, now);
        mapCard({ x: R.x, y: R.y + R.h - mH, w: R.w, h: mH });
      } else effCard({ x: R.x, y: R.y + tH + gap, w: R.w, h: Math.max(eH, rest) }, now);
      if (moving || story || intro < 1 || dragging) ctx.requestRender();
      if (!story && wasStory) updateReadouts();
      wasStory = !!story;
    }
    let wasStory = false;

    return {
      update(changed, source) {
        if (changed.has('b') && p.b === 0 && source === 'input') ctx.set({ b: 0.1 });
        if (source === 'replace') story = null;
        if (changed.has('f')) {
          story = null;
          intro = reduced ? 1 : 0;
          const t = target();
          sh = { a: t.a, s: 1 / t.b, c: t.c, d: t.d };
        }
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        if (id === 'steps') {
          story = reduced ? null : { t0: performance.now(), to: target() };
          ctx.requestRender();
        }
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
