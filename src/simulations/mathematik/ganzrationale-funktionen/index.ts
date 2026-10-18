import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import { degree, endBehaviour, evaluate, expand, mergeRoots, signChart, zeroKind, type Root } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const X0 = -5.5;
const X1 = 5.5;

/**
 * Ganzrationale Funktionen in Linearfaktordarstellung: Nullstellen auf der
 * x-Achse ziehen, Vielfachheit wählen, Leitkoeffizient am Graphen ziehen.
 * Das Bild zeigt Schnitt-, Berühr- und Terrassenpunkte, die Vorzeichen­
 * bereiche und das Randverhalten; daneben Term (faktorisiert und
 * ausmultipliziert), Nullstellenliste und die vier Typen des Randverhaltens.
 */
export default defineSimulation({
  id: 'ganzrationale-funktionen',
  dragHint: true,
  layout: { aspect: 1.62, aspectNarrow: 0.5 },
  groups: [
    { id: 'zeros', label: L('Nullstellen', 'Zeros') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    { key: 'a', type: 'number', label: L('Leitkoeffizient a', 'Leading coefficient a'), min: -3, max: 3, step: 0.1, default: 0.5, help: L('Auch am Punkt rechts auf dem Graphen ziehen. a = 0 ist nicht erlaubt.', 'You can also drag the point on the right of the graph. a = 0 is not allowed.') },
    { key: 'z', type: 'number', group: 'zeros', label: L('Anzahl der Nullstellen', 'Number of zeros'), min: 1, max: 3, step: 1, default: 3 },
    { key: 'x1', type: 'number', group: 'zeros', label: L('x₁', 'x₁'), min: -4, max: 4, step: 0.5, default: -2 },
    { key: 'm1', type: 'number', group: 'zeros', label: L('Vielfachheit von x₁', 'Multiplicity of x₁'), min: 1, max: 3, step: 1, default: 1 },
    { key: 'x2', type: 'number', group: 'zeros', label: L('x₂', 'x₂'), min: -4, max: 4, step: 0.5, default: 0.5, visibleIf: (v) => (v.z as number) >= 2 },
    { key: 'm2', type: 'number', group: 'zeros', label: L('Vielfachheit von x₂', 'Multiplicity of x₂'), min: 1, max: 3, step: 1, default: 1, visibleIf: (v) => (v.z as number) >= 2 },
    { key: 'x3', type: 'number', group: 'zeros', label: L('x₃', 'x₃'), min: -4, max: 4, step: 0.5, default: 3, visibleIf: (v) => (v.z as number) >= 3 },
    { key: 'm3', type: 'number', group: 'zeros', label: L('Vielfachheit von x₃', 'Multiplicity of x₃'), min: 1, max: 3, step: 1, default: 1, visibleIf: (v) => (v.z as number) >= 3 },
    { key: 'sign', type: 'boolean', group: 'view', label: L('Vorzeichenbereiche färben', 'Shade where f is positive/negative'), default: true },
    { key: 'ends', type: 'boolean', group: 'view', label: L('Randverhalten (Pfeile)', 'End behaviour (arrows)'), default: true },
    { key: 'info', type: 'boolean', group: 'view', label: L('Term und Eigenschaften zeigen', 'Show the term and properties'), help: L('Aus: für Aufgaben „Welcher Term passt zum Graphen?“', 'Off: for tasks “Which term fits the graph?”'), default: true },
  ],
  readouts: [
    { key: 'term', label: L('Linearfaktoren', 'Factored form'), spoiler: true },
    { key: 'norm', label: L('Normalform', 'Expanded form'), spoiler: true },
    { key: 'deg', label: L('Grad und Leitkoeffizient', 'Degree and leading coefficient'), spoiler: true },
    { key: 'zeros', label: L('Nullstellen', 'Zeros'), spoiler: true },
    { key: 'ends', label: L('Randverhalten', 'End behaviour'), spoiler: true },
  ],
  presets: [
    { id: 'three', label: L('Drei einfache Nullstellen', 'Three simple zeros'), values: {} },
    { id: 'double', label: L('Doppelte Nullstelle: Berührpunkt', 'Double zero: touching point'), values: { z: 2, x1: -2, m1: 2, x2: 2, m2: 1, a: 0.5 } },
    { id: 'triple', label: L('Dreifache Nullstelle: Terrassenpunkt', 'Triple zero: terrace point'), values: { z: 2, x1: 1, m1: 3, x2: -3, m2: 1, a: 0.3 } },
    { id: 'w', label: L('Grad 4: W-Form', 'Degree 4: W shape'), values: { z: 3, x1: -3, m1: 1, x2: 0, m2: 2, x3: 3, m3: 1, a: 0.2 } },
    { id: 'neg', label: L('a negativ', 'Negative a'), values: { z: 3, x1: -3, m1: 1, x2: -0.5, m2: 1, x3: 2.5, m3: 1, a: -0.4 } },
    { id: 'cube', label: L('f(x) = x³', 'f(x) = x³'), values: { z: 1, x1: 0, m1: 3, a: 1 } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatensystem mit dem Graphen einer ganzrationalen Funktion in Linearfaktoren; die Nullstellen lassen sich auf der x-Achse ziehen, der Leitkoeffizient am Graphen. Daneben Term, Nullstellen mit Vielfachheit und Randverhalten.',
      termT: 'Funktionsterm',
      zerosT: 'Nullstellen',
      endsT: 'Randverhalten',
      signT: 'Vorzeichen von f',
      degree: 'Grad {n}',
      lead: 'a {s} 0',
      cross: 'einfach: Schnittpunkt mit Vorzeichenwechsel',
      touch: 'doppelt: Berührpunkt, kein Vorzeichenwechsel',
      terrace: 'dreifach: Terrassenpunkt mit Vorzeichenwechsel',
      quad: '{m}-fach: Berührpunkt, kein Vorzeichenwechsel',
      odd: '{m}-fach: Terrassenpunkt mit Vorzeichenwechsel',
      crossS: 'einfach',
      touchS: 'doppelt',
      terraceS: 'dreifach',
      multS: '{m}-fach',
      merged: 'Zusammengefallen: Vielfachheiten addieren sich.',
      evenPos: 'n gerade, a > 0',
      evenNeg: 'n gerade, a < 0',
      oddPos: 'n ungerade, a > 0',
      oddNeg: 'n ungerade, a < 0',
      endsText: 'x → −∞: f(x) → {l}∞;  x → +∞: f(x) → {r}∞',
      hidden: 'Welcher Term passt? Schätze Nullstellen, Vielfachheiten und das Vorzeichen von a.',
      lim: 'f(x) → {s}∞',
      yint: 'f(0) = {v}',
      degRead: 'Grad {n}, Leitkoeffizient a = {a}',
    },
    en: {
      canvas: 'Coordinate system with the graph of a polynomial function in factored form; the zeros can be dragged along the x-axis, the leading coefficient on the graph. Next to it the term, the zeros with multiplicity and the end behaviour.',
      termT: 'Function',
      zerosT: 'Zeros',
      endsT: 'End behaviour',
      signT: 'Sign of f',
      degree: 'degree {n}',
      lead: 'a {s} 0',
      cross: 'simple: crosses the axis, sign changes',
      touch: 'double: touches the axis, no sign change',
      terrace: 'triple: terrace point, sign changes',
      quad: 'multiplicity {m}: touches, no sign change',
      odd: 'multiplicity {m}: terrace point, sign changes',
      crossS: 'simple',
      touchS: 'double',
      terraceS: 'triple',
      multS: '×{m}',
      merged: 'Zeros merged: multiplicities add up.',
      evenPos: 'n even, a > 0',
      evenNeg: 'n even, a < 0',
      oddPos: 'n odd, a > 0',
      oddNeg: 'n odd, a < 0',
      endsText: 'x → −∞: f(x) → {l}∞;  x → +∞: f(x) → {r}∞',
      hidden: 'Which term fits? Estimate the zeros, multiplicities and the sign of a.',
      lim: 'f(x) → {s}∞',
      yint: 'f(0) = {v}',
      degRead: 'degree {n}, leading coefficient a = {a}',
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

    const col = {
      f: () => th().series[4]!,
      roots: () => [th().series[0]!, th().series[3]!, th().series[5]!],
      pos: () => th().series[2]!,
      neg: () => th().series[1]!,
      lead: () => th().series[4]!,
    };

    /* ---------- Aufteilung ---------- */
    function regions(): { plot: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (narrow()) {
        const ph = Math.round(clamp(w * 0.8, 240, h * 0.5));
        return { plot: { x: 0, y: 0, w, h: ph }, col: { x: 2, y: ph + 8, w: w - 4, h: h - ph - 10 } };
      }
      const colW = Math.round(clamp(w * 0.34, 230, 330));
      return { plot: { x: 0, y: 0, w: w - colW - 10, h }, col: { x: w - colW, y: 2, w: colW - 2, h: h - 4 } };
    }
    const plot = new Plot(surface, { x: [X0, X1], y: [-5, 5], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().plot, xAxis: { label: 'x' }, yAxis: { label: 'y' } });

    /* ---------- Zustand (weich nachgeführt) ---------- */
    const rawRoots = (): Root[] => {
      const r: Root[] = [{ x: p.x1, m: p.m1 }];
      if (p.z >= 2) r.push({ x: p.x2, m: p.m2 });
      if (p.z >= 3) r.push({ x: p.x3, m: p.m3 });
      return r;
    };
    const aOf = (v: number) => (Math.abs(v) < 0.05 ? (v < 0 ? -0.1 : 0.1) : v);
    let shown = { xs: [p.x1, p.x2, p.x3], ms: [p.m1, p.m2, p.m3], a: aOf(p.a), y0: -5, y1: 5 };
    let lastFrame = performance.now();
    let reveal = reduced ? 1 : 0;
    let dragging = 0;

    /** Angezeigte (gleitende) Nullstellen; die Vielfachheit gleitet als reelle Hochzahl. */
    const shownRoots = (): Root[] => {
      const r: Root[] = [{ x: shown.xs[0]!, m: shown.ms[0]! }];
      if (p.z >= 2) r.push({ x: shown.xs[1]!, m: shown.ms[1]! });
      if (p.z >= 3) r.push({ x: shown.xs[2]!, m: shown.ms[2]! });
      return r;
    };
    /** f mit gleitenden Hochzahlen: |x − xᵢ|^m mit Vorzeichen, damit Übergänge stetig bleiben. */
    const fShown = (x: number): number => {
      let v = shown.a;
      for (const r of shownRoots()) {
        const d = x - r.x;
        const mi = Math.round(r.m);
        if (Math.abs(r.m - mi) < 1e-6) v *= d ** mi;
        else {
          // Mischung der beiden Nachbar-Hochzahlen (stetiger Übergang)
          const lo = Math.floor(r.m);
          const t = r.m - lo;
          v *= lerp(d ** lo, d ** (lo + 1), t);
        }
      }
      return v;
    };
    const fTrue = (x: number) => evaluate(aOf(p.a), rawRoots(), x);

    /** Gewünschter y-Bereich: alle Nullstellen und lokalen Ausschläge gut sichtbar. */
    function yTarget(): [number, number] {
      const rs = mergeRoots(rawRoots());
      const lo = Math.max(X0, Math.min(...rs.map((r) => r.x)) - 0.8);
      const hi = Math.min(X1, Math.max(xh(), ...rs.map((r) => r.x)) + 0.25);
      let mn = 0;
      let mx = 0;
      for (let i = 0; i <= 200; i++) {
        const x = lo + ((hi - lo) * i) / 200;
        const v = fTrue(x);
        mn = Math.min(mn, v);
        mx = Math.max(mx, v);
      }
      const span = Math.max(mx - mn, 4);
      const pad = span * 0.18;
      let y0 = mn - pad;
      let y1 = mx + pad;
      if (y1 - y0 < 6) {
        const c = (y0 + y1) / 2;
        y0 = c - 3;
        y1 = c + 3;
      }
      return [clamp(y0, -400, -1), clamp(y1, 1, 400)];
    }

    function step(dt: number): boolean {
      const k = reduced || dragging > 0 ? 1 : 1 - Math.exp(-dt * 9);
      const kr = reduced ? 1 : 1 - Math.exp(-dt * 5);
      const [ty0, ty1] = yTarget();
      const goal = { xs: [p.x1, p.x2, p.x3], ms: [p.m1, p.m2, p.m3], a: aOf(p.a) };
      let moving = false;
      const app = (v: number, g: number, kk: number) => {
        const d = g - v;
        if (Math.abs(d) < 1e-4 * (1 + Math.abs(g))) return g;
        moving = true;
        return v + d * kk;
      };
      if (!dragging) xhShown = app(xhShown, xh(), k);
      shown = {
        xs: shown.xs.map((v, i) => app(v, goal.xs[i]!, k)),
        ms: shown.ms.map((v, i) => app(v, goal.ms[i]!, reduced ? 1 : 1 - Math.exp(-dt * 7))),
        a: app(shown.a, goal.a, k),
        y0: app(shown.y0, ty0, dragging > 0 ? kr * 0.6 : kr),
        y1: app(shown.y1, ty1, dragging > 0 ? kr * 0.6 : kr),
      };
      return moving;
    }

    /** Stelle des Griffs für den Leitkoeffizienten: rechts der größten Nullstelle. */
    function xh(): number {
      const mx = Math.max(...rawRoots().map((r) => r.x));
      return clamp(mx + 0.6, -3.5, 5);
    }
    let xhShown = xh();

    /* ---------- Griffe ---------- */
    (['x1', 'x2', 'x3'] as const).forEach((key, i) => {
      plot.addHandle({
        get: () => [shown.xs[i]!, 0],
        set: (x) => {
          dragging = performance.now();
          ctx.set({ [key]: Math.round(clamp(x, -4, 4) * 2) / 2 });
        },
        axis: 'x',
        enabled: () => !ctx.locked && p.z > i,
        color: () => col.roots()[i]!,
      });
    });
    plot.addHandle({
      get: () => [xhShown, fShown(xhShown)],
      set: (_x, y) => {
        dragging = performance.now();
        const g = evaluate(1, rawRoots(), xhShown);
        if (Math.abs(g) < 1e-9) return;
        let a = Math.round(clamp(y / g, -3, 3) * 10) / 10;
        if (a === 0) a = y / g < 0 ? -0.1 : 0.1;
        ctx.set({ a });
      },
      axis: 'y',
      enabled: () => !ctx.locked,
      color: () => col.lead(),
    });

    /* ---------- Formeln ---------- */
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { r0: col.roots()[0]!, r1: col.roots()[1]!, r2: col.roots()[2]!, f: col.f() },
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
    const num = (v: number) => fmt.num(v, 2);
    /** (x − 2), (x + 1,5) bzw. x */
    const factor = (x: number) => (x === 0 ? 'x' : `(x ${x > 0 ? '−' : '+'} ${fmt.num(Math.abs(x), 1)})`);

    function factoredSrc(colored: boolean): string {
      const a = aOf(p.a);
      const parts: string[] = [];
      rawRoots().forEach((r, i) => {
        const base = factor(r.x);
        const pow = r.m > 1 ? (base === 'x' ? `x^${r.m}` : `${base}^${r.m}`) : base;
        parts.push(colored ? `\\c{r${i}}{${pow}}` : pow);
      });
      const lead = a === 1 ? '' : a === -1 ? '−' : `${fmt.num(a, 1)} · `;
      return `f(x) = ${lead}${parts.join(' · ')}`;
    }
    function normalSrc(): string {
      const c = expand(aOf(p.a), rawRoots());
      const terms: string[] = [];
      for (let k = c.length - 1; k >= 0; k--) {
        const v = Math.round(c[k]! * 1000) / 1000;
        if (v === 0) continue;
        const abs = Math.abs(v);
        const coef = abs === 1 && k > 0 ? '' : num(abs);
        const xp = k === 0 ? '' : k === 1 ? 'x' : `x^${k}`;
        const sign = v < 0 ? '−' : '+';
        terms.push(terms.length === 0 ? `${v < 0 ? '−' : ''}${coef}${xp}` : `${sign} ${coef}${xp}`);
      }
      return `f(x) = ${terms.join(' ') || '0'}`;
    }

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const rs = mergeRoots(rawRoots());
      const n = degree(rs);
      const a = aOf(p.a);
      const html = (src: string) =>
        src
          .replace(/\\c\{r\d\}\{([^}]*)\}/g, '$1')
          .replace(/\^(\d+)/g, '<sup>$1</sup>')
          .replace(/\bx\b/g, '<var>x</var>')
          .replace(/\bf\(/g, '<var>f</var>(');
      ctx.readout('term', { html: html(factoredSrc(false)) });
      ctx.readout('norm', { html: html(normalSrc()) });
      ctx.readout('deg', tr('degRead', { n, a: fmt.num(a, 1) }));
      ctx.readout('zeros', rs.map((r) => `x = ${fmt.num(r.x, 1)} (${kindShort(r.m)})`).join('; '));
      const e = endBehaviour(a, n);
      ctx.readout('ends', tr('endsText', { l: e.left > 0 ? '+' : '−', r: e.right > 0 ? '+' : '−' }));
    }
    function kindShort(m: number): string {
      if (m === 1) return ctx.t('crossS');
      if (m === 2) return ctx.t('touchS');
      if (m === 3) return ctx.t('terraceS');
      return tr('multS', { m });
    }
    function kindLong(m: number): string {
      const k = zeroKind(m);
      if (m <= 3) return ctx.t(k);
      return tr(m % 2 === 0 ? 'quad' : 'odd', { m });
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
    function label(x: number, y: number, src: string, color: string, align: 'left' | 'center' | 'right' = 'left', size = F(13, 12), alpha = 1): void {
      const g = surface.g;
      const box = formula(g, src, fstyle(size, color, 700));
      const r = plot.rect;
      let left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      left = clamp(left, r.x + 4, r.x + r.w - box.w - 4);
      const base = y + (box.asc - box.desc) / 2;
      g.save();
      g.globalAlpha = alpha * 0.85;
      g.fillStyle = th().bg;
      roundRect(g, left - 4, base - box.asc - 2, box.w + 8, box.asc + box.desc + 4, 6);
      g.fill();
      g.globalAlpha = alpha;
      box.draw(g, left, base);
      g.restore();
    }

    /* ---------- Plot ---------- */
    function drawPlot(): void {
      const g = surface.g;
      const theme = th();
      plot.setRange([X0, X1], [shown.y0, shown.y1]);
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const xEnd = lerp(X0, X1, ease.inOutCubic(reveal));
      const roots = shownRoots();
      const merged = mergeRoots(rawRoots());
      // Vorzeichenbereiche
      if (p.sign) {
        const pos = (x: number) => Math.max(0, fShown(x));
        const neg = (x: number) => Math.min(0, fShown(x));
        const clampY = (v: number) => clamp(v, shown.y0 - 10, shown.y1 + 10);
        plot.fillBetween((x) => clampY(pos(x)), () => 0, X0, xEnd, { fill: withAlpha(col.pos(), theme.dark ? 0.2 : 0.13) });
        plot.fillBetween((x) => clampY(neg(x)), () => 0, X0, xEnd, { fill: withAlpha(col.neg(), theme.dark ? 0.2 : 0.13) });
      }
      // Graph mit leichtem Leuchten
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.f(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 6;
      plot.fn(fShown, { color: col.f(), width: 3, to: xEnd });
      g.restore();
      // Verhalten an den Nullstellen: kurzes farbiges Stück des Graphen
      const sx = plot.scale.x;
      roots.forEach((rt, i) => {
        if (rt.x > xEnd) return;
        const w = 34 / sx;
        plot.fn(fShown, { color: col.roots()[i]!, width: 5.5, from: rt.x - w, to: Math.min(xEnd, rt.x + w), alpha: 0.85 });
      });
      // Randverhalten
      if (p.ends && reveal >= 1) {
        const n = degree(merged);
        const e = endBehaviour(aOf(p.a), n);
        for (const [side, s] of [
          [-1, e.left],
          [1, e.right],
        ] as const) {
          const xa = side < 0 ? X0 + 0.3 : X1 - 0.3;
          // Stelle, an der der Graph den Rand verlässt (oder das Ende)
          let x = xa;
          for (let k = 0; k <= 60; k++) {
            const xx = side < 0 ? lerp(X0, 0, k / 60) : lerp(X1, 0, k / 60);
            const y = fShown(xx);
            if (y < shown.y1 && y > shown.y0) {
              x = xx;
              break;
            }
          }
          const y = clamp(fShown(x), shown.y0, shown.y1);
          const px = plot.px(x);
          const py = plot.py(y);
          const ay = clamp(py + (s > 0 ? -1 : 1) * 4, r.y + 14, r.y + r.h - 14);
          const ax = clamp(px, r.x + 18, r.x + r.w - 18);
          const tip: [number, number] = [ax + side * 8, s > 0 ? Math.max(r.y + 6, ay - 26) : Math.min(r.y + r.h - 6, ay + 26)];
          g.save();
          g.strokeStyle = col.f();
          g.fillStyle = col.f();
          g.lineWidth = 2.4;
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(ax, ay);
          g.lineTo(tip[0], tip[1]);
          g.stroke();
          const ang = Math.atan2(tip[1] - ay, tip[0] - ax);
          g.translate(tip[0], tip[1]);
          g.rotate(ang);
          g.beginPath();
          g.moveTo(5, 0);
          g.lineTo(-6, -5);
          g.lineTo(-3, 0);
          g.lineTo(-6, 5);
          g.closePath();
          g.fill();
          g.restore();
          if (p.info) label(tip[0] - side * 6, tip[1] + (s > 0 ? 12 : -12), tr('lim', { s: s > 0 ? '+' : '−' }), col.f(), side < 0 ? 'left' : 'right', F(12.5, 11.5));
        }
      }
      // Beschriftung der Nullstellen
      if (p.info && reveal >= 1) {
        const used: number[] = [];
        merged.forEach((rt) => {
          const idx = rawRoots().findIndex((q) => Math.abs(q.x - rt.x) < 1e-9);
          const c = col.roots()[Math.max(0, idx)]!;
          const px = plot.px(rt.x);
          const above = fShown(rt.x + 0.3) < 0 || fShown(rt.x - 0.3) < 0;
          let py = plot.py(0) + (above ? -22 : 22);
          if (used.some((u) => Math.abs(u - px) < 70)) py += above ? -20 : 20;
          used.push(px);
          label(px, py, `${fmt.num(rt.x, 1)} \\t{(${kindShort(rt.m)})}`, c, 'center', F(12, 11));
        });
      }
      plot.end();
    }

    /* ---------- Karten ---------- */
    function termCard(R: Rect): number {
      const g = surface.g;
      const pad = F(14, 12);
      card(R, col.f(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('termT'), col.f());
      if (!p.info) {
        const f = font(500, F(12.5, 12));
        wrap(ctx.t('hidden'), R.w - 2 * pad, f).forEach((row, i) => text(g, row, R.x + pad, R.y + 38 + i * 16, { font: f, color: th().text, align: 'left' }));
        return R.h;
      }
      const b1 = fitFormula(factoredSrc(true), R.w - 2 * pad, F(16, 14.5), th().text, 650);
      b1.draw(g, R.x + pad, R.y + 34 + b1.asc);
      const b2 = fitFormula(normalSrc(), R.w - 2 * pad, F(13.5, 12.5), th().muted, 600);
      b2.draw(g, R.x + pad, R.y + 34 + b1.asc + b1.desc + 10 + b2.asc);
      const n = degree(mergeRoots(rawRoots()));
      const chipT = `${tr('degree', { n })} · ${tr('lead', { s: p.a > 0 ? '>' : '<' })}`;
      text(g, chipT, R.x + R.w - pad, R.y + 16, { font: font(700, F(12, 11)), color: col.f(), align: 'right' });
      return R.h;
    }
    const termH = () => (p.info ? 34 + 22 + 10 + 18 + 14 : 74);

    function zerosCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('zerosT'));
      const raw = rawRoots();
      const merged = mergeRoots(raw);
      const lh = F(17, 16);
      let y = R.y + 32;
      const f = font(500, F(12, 11.5));
      merged.forEach((rt) => {
        const idx = raw.findIndex((q) => Math.abs(q.x - rt.x) < 1e-9);
        const c = col.roots()[Math.max(0, idx)]!;
        g.beginPath();
        g.arc(R.x + pad + 6, y + 8, 5.5, 0, Math.PI * 2);
        g.fillStyle = c;
        g.fill();
        text(g, p.info ? `x = ${fmt.num(rt.x, 1)}` : 'x = ?', R.x + pad + 18, y + 8, { font: font(700, F(13, 12)), color: c, align: 'left' });
        const rows = wrap(p.info ? kindLong(rt.m) : '?', R.w - 2 * pad - 92, f);
        rows.forEach((row, k) => text(g, row, R.x + pad + 90, y + 8 + k * lh, { font: f, color: theme.text, align: 'left' }));
        y += Math.max(1, rows.length) * lh + 6;
      });
      if (merged.length < raw.length) text(g, ctx.t('merged'), R.x + pad, y + 6, { font: font(600, 11), color: theme.muted, align: 'left' });
      // Vorzeichenleiste
      const sy = R.y + R.h - 26;
      const x0 = R.x + pad;
      const x1 = R.x + R.w - pad;
      const signs = signChart(aOf(p.a), raw);
      const xs = merged.map((rt) => lerp(x0, x1, (rt.x - X0) / (X1 - X0)));
      const bounds = [x0, ...xs, x1];
      for (let i = 0; i < signs.length; i++) {
        const a = bounds[i]!;
        const b = bounds[i + 1]!;
        const s = signs[i]!;
        g.fillStyle = withAlpha(s > 0 ? col.pos() : col.neg(), theme.dark ? 0.35 : 0.22);
        roundRect(g, a + 1, sy - 9, Math.max(2, b - a - 2), 18, 6);
        g.fill();
        if (b - a > 16) text(g, p.info ? (s > 0 ? '+' : '−') : '?', (a + b) / 2, sy + 0.5, { font: font(800, 13), color: s > 0 ? col.pos() : col.neg() });
      }
      xs.forEach((x, i) => {
        const idx = raw.findIndex((q) => Math.abs(q.x - merged[i]!.x) < 1e-9);
        g.beginPath();
        g.arc(x, sy, 4, 0, Math.PI * 2);
        g.fillStyle = col.roots()[Math.max(0, idx)]!;
        g.fill();
      });
      text(g, ctx.t('signT'), x0, sy - 18, { font: font(600, 11), color: theme.muted, align: 'left' });
    }
    const zerosH = () => {
      const merged = mergeRoots(rawRoots());
      const lh = F(17, 16);
      const f = font(500, F(12, 11.5));
      let h = 32;
      for (const rt of merged) h += Math.max(1, wrap(p.info ? kindLong(rt.m) : '?', regions().col.w - 2 * F(14, 12) - 92, f).length) * lh + 6;
      if (merged.length < rawRoots().length) h += 18;
      return h + 58;
    };

    /** Vier Typen des Randverhaltens als kleine Skizzen; der aktuelle ist hervorgehoben. */
    function endsCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('endsT'));
      const n = degree(mergeRoots(rawRoots()));
      const types: { even: boolean; pos: boolean; key: string }[] = [
        { even: true, pos: true, key: 'evenPos' },
        { even: true, pos: false, key: 'evenNeg' },
        { even: false, pos: true, key: 'oddPos' },
        { even: false, pos: false, key: 'oddNeg' },
      ];
      const cols = 4;
      const cw = (R.w - 2 * pad) / cols;
      const top = R.y + 28;
      const bh = R.h - 28 - 34;
      types.forEach((t, i) => {
        const cur = p.info && t.even === (n % 2 === 0) && t.pos === p.a > 0;
        const bx = R.x + pad + i * cw;
        if (cur) {
          g.fillStyle = withAlpha(col.f(), theme.dark ? 0.18 : 0.1);
          roundRect(g, bx + 2, top, cw - 4, R.h - 34, 8);
          g.fill();
        }
        const cx = bx + cw / 2;
        const cy = top + bh / 2 + 2;
        const sw = cw * 0.34;
        const sh = Math.min(bh * 0.38, 22);
        const ys = (u: number) => {
          // Skizze: gerade → u², ungerade → u³ (u in −1…1)
          const v = t.even ? u * u * 2 - 1 : u * u * u;
          return cy - (t.pos ? v : -v) * sh;
        };
        g.save();
        g.strokeStyle = withAlpha(theme.text, 0.25);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(cx - sw - 4, cy);
        g.lineTo(cx + sw + 4, cy);
        g.stroke();
        g.strokeStyle = cur ? col.f() : withAlpha(theme.text, 0.5);
        g.lineWidth = cur ? 2.6 : 1.8;
        g.lineCap = 'round';
        g.beginPath();
        for (let k = 0; k <= 30; k++) {
          const u = -1 + (2 * k) / 30;
          const x = cx + u * sw;
          const y = ys(u);
          if (k) g.lineTo(x, y);
          else g.moveTo(x, y);
        }
        g.stroke();
        g.restore();
        const fsz = cw < 70 ? 9.5 : 10.5;
        const [l1, l2] = ctx.t(t.key).split(', ');
        text(g, l1 ?? '', cx, R.y + R.h - 24, { font: font(cur ? 800 : 600, fsz), color: cur ? theme.text : theme.muted });
        text(g, l2 ?? '', cx, R.y + R.h - 11, { font: font(cur ? 800 : 600, fsz), color: cur ? col.f() : theme.muted });
      });
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (dragging && now - dragging > 250) dragging = 0;
      const moving = step(dt);
      if (reveal < 1) reveal = Math.min(1, reveal + dt * 0.8);
      surface.begin();
      plot.resize();
      drawPlot();
      const R = regions().col;
      const gap = F(10, 8);
      const tH = termH();
      termCard({ x: R.x, y: R.y, w: R.w, h: tH });
      const zH = zerosH();
      const eH = Math.max(84, Math.min(130, R.h - tH - zH - 2 * gap));
      zerosCard({ x: R.x, y: R.y + tH + gap, w: R.w, h: Math.max(zH, R.h - tH - eH - 2 * gap) });
      if (R.h - tH - zH - 2 * gap >= 84) endsCard({ x: R.x, y: R.y + R.h - eH, w: R.w, h: eH });
      if (moving || reveal < 1 || dragging) ctx.requestRender();
    }

    return {
      update(changed, source) {
        if (source === 'replace' && !reduced) reveal = 0;
        if (changed.has('a') && p.a === 0 && source === 'input') ctx.set({ a: 0.1 });
        updateReadouts();
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
