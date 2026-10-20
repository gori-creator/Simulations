import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import { analyze, degree, evalPoly, poleSides, value, type Analysis, type Poly, type Rational } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const XR = 6.5;
const YR = 6;
const RUN_MS = 7000;

/**
 * Gebrochen-rationale Funktionen aus Linearfaktoren: Nullstellen des Zählers
 * und des Nenners lassen sich auf der x-Achse bzw. am oberen Rand ziehen.
 * Daraus ergeben sich Definitionsmenge, Nullstellen, Polstellen (mit oder
 * ohne Vorzeichenwechsel), behebbare Lücken und die Asymptote bzw.
 * Näherungskurve für x → ±∞ (Polynomdivision).
 */
export default defineSimulation({
  id: 'polstellen-asymptoten',
  dragHint: true,
  layout: { aspect: 1.62, aspectNarrow: 0.48 },
  groups: [
    { id: 'num', label: L('Zähler', 'Numerator') },
    { id: 'den', label: L('Nenner', 'Denominator') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    { key: 'a', type: 'number', group: 'num', label: L('Faktor a', 'Factor a'), min: -3, max: 3, step: 0.5, default: 1 },
    { key: 'zn', type: 'number', group: 'num', label: L('Zählergrad (Anzahl Linearfaktoren)', 'Degree of numerator (linear factors)'), min: 0, max: 3, step: 1, default: 1 },
    { key: 'z1', type: 'number', group: 'num', label: L('Nullstelle z₁', 'Zero z₁'), min: -5, max: 5, step: 0.5, default: 1, visibleIf: (v) => (v.zn as number) >= 1 },
    { key: 'z2', type: 'number', group: 'num', label: L('Nullstelle z₂', 'Zero z₂'), min: -5, max: 5, step: 0.5, default: -1, visibleIf: (v) => (v.zn as number) >= 2 },
    { key: 'z3', type: 'number', group: 'num', label: L('Nullstelle z₃', 'Zero z₃'), min: -5, max: 5, step: 0.5, default: 3, visibleIf: (v) => (v.zn as number) >= 3 },
    { key: 'pn', type: 'number', group: 'den', label: L('Nennergrad', 'Degree of denominator'), min: 1, max: 2, step: 1, default: 1 },
    { key: 'p1', type: 'number', group: 'den', label: L('Nennernullstelle p₁', 'Zero of denominator p₁'), min: -5, max: 5, step: 0.5, default: -2 },
    { key: 'p2', type: 'number', group: 'den', label: L('Nennernullstelle p₂', 'Zero of denominator p₂'), min: -5, max: 5, step: 0.5, default: 2, visibleIf: (v) => (v.pn as number) >= 2 },
    { key: 'asy', type: 'boolean', group: 'view', label: L('Asymptoten zeichnen', 'Draw the asymptotes'), default: true },
    { key: 'show', type: 'boolean', group: 'view', label: L('Eigenschaften zeigen', 'Show the properties'), help: L('Aus: Definitionsmenge, Polstellen und Asymptote selbst bestimmen.', 'Off: find the domain, poles and asymptote yourself.'), default: true },
  ],
  actions: [{ id: 'run', label: L('Punkt entlanglaufen lassen', 'Let a point run along the graph'), primary: true }],
  readouts: [
    { key: 'term', label: L('Funktionsterm', 'Function'), spoiler: true },
    { key: 'dom', label: L('Definitionsmenge', 'Domain'), spoiler: true },
    { key: 'asym', label: L('Asymptote', 'Asymptote'), spoiler: true },
  ],
  presets: [
    { id: 'std', label: L('Eine Polstelle, y = 1', 'One pole, y = 1'), values: {} },
    { id: 'two', label: L('Zwei Polstellen', 'Two poles'), values: { zn: 2, z1: -1, z2: 3, pn: 2, p1: -3, p2: 1, a: 1 } },
    { id: 'double', label: L('Doppelte Polstelle: ohne VZW', 'Double pole: no sign change'), values: { zn: 0, a: 2, pn: 2, p1: 1, p2: 1 } },
    { id: 'hole', label: L('Behebbare Lücke', 'Removable gap'), values: { zn: 2, z1: 1, z2: -1, pn: 1, p1: 1 } },
    { id: 'zero', label: L('Asymptote y = 0', 'Asymptote y = 0'), values: { zn: 1, z1: 0, pn: 2, p1: -2, p2: 2, a: 2 } },
    { id: 'oblique', label: L('Schräge Asymptote', 'Oblique asymptote'), values: { zn: 2, z1: 1, z2: -1, pn: 1, p1: 2 } },
    { id: 'curve', label: L('Zählergrad 3: Näherungsparabel', 'Degree 3 on top: approximating parabola'), values: { zn: 3, z1: -2, z2: 0, z3: 2, pn: 1, p1: -1, a: 0.5 } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatensystem mit dem Graphen einer gebrochen-rationalen Funktion. Nullstellen des Zählers als ziehbare Punkte auf der x-Achse, Nullstellen des Nenners als ziehbare Marken am oberen Rand; senkrechte Asymptoten an den Polstellen, waagrechte oder schräge Asymptote bzw. Näherungskurve, Löcher an behebbaren Lücken. Daneben Funktionsterm, Polynomdivision und Eigenschaften.',
      termT: 'Funktionsterm',
      propT: 'Eigenschaften',
      dom: 'Definitionsmenge',
      zeros: 'Nullstellen',
      poles: 'Polstellen',
      holes: 'Behebbare Lücke',
      asym: 'Für x → ±∞',
      none: 'keine',
      vzw: 'mit VZW',
      novzw: 'ohne VZW',
      simple: 'einfach',
      double: 'doppelt',
      triple: 'dreifach',
      hole: 'Loch bei {p}',
      kZero: 'waagrechte Asymptote y = 0 (Zählergrad < Nennergrad)',
      kConst: 'waagrechte Asymptote y = {v} (Zählergrad = Nennergrad)',
      kObl: 'schräge Asymptote (Zählergrad = Nennergrad + 1)',
      kCurve: 'keine Asymptote, aber Näherungskurve (Zählergrad > Nennergrad + 1)',
      aZero: 'a = 0: f ist überall (wo definiert) null.',
      dist: 'Abstand zur Asymptote ≈ {d}',
      near: 'Annäherung an x = {p}',
      asyLine: 'Asymptote',
      curveLine: 'Näherungskurve',
    },
    en: {
      canvas: 'Coordinate system with the graph of a rational function. Zeros of the numerator as draggable points on the x-axis, zeros of the denominator as draggable markers at the top; vertical asymptotes at the poles, a horizontal or oblique asymptote or an approximating curve, holes at removable gaps. Next to it the function, the polynomial division and the properties.',
      termT: 'Function',
      propT: 'Properties',
      dom: 'Domain',
      zeros: 'Zeros',
      poles: 'Poles',
      holes: 'Removable gap',
      asym: 'For x → ±∞',
      none: 'none',
      vzw: 'with sign change',
      novzw: 'without sign change',
      simple: 'simple',
      double: 'double',
      triple: 'triple',
      hole: 'hole at {p}',
      kZero: 'horizontal asymptote y = 0 (degree of numerator < degree of denominator)',
      kConst: 'horizontal asymptote y = {v} (equal degrees)',
      kObl: 'oblique asymptote (degree of numerator = degree of denominator + 1)',
      kCurve: 'no asymptote, but an approximating curve (degree of numerator > degree of denominator + 1)',
      aZero: 'a = 0: f is zero wherever it is defined.',
      dist: 'distance to the asymptote ≈ {d}',
      near: 'approaching x = {p}',
      asyLine: 'asymptote',
      curveLine: 'approximating curve',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    const wideLayout = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const F = (w: number, n: number) => (surface.width >= 640 ? w : n);
    const font = (weight: number, size: number) => `${weight} ${size}px ${th().font}`;

    const col = {
      f: () => th().series[0]!,
      zero: () => th().series[2]!,
      pole: () => th().series[1]!,
      asym: () => th().series[4]!,
      P: () => th().series[3]!,
    };

    /* ---------- Funktion ---------- */
    const ZK = ['z1', 'z2', 'z3'] as const;
    const PK = ['p1', 'p2'] as const;
    const rational = (): Rational => ({
      a: p.a,
      zeros: ZK.slice(0, p.zn).map((k) => p[k] as number),
      poles: PK.slice(0, p.pn).map((k) => p[k] as number),
    });
    let A: Analysis = analyze(rational());

    /* ---------- Zahlen und Terme ---------- */
    const n = (v: number) => fmt.num(Math.abs(v) < 1e-9 ? 0 : v, 2);
    const Q = (s: string) => (p.show ? s : '?');
    /** Linearfaktor (x − r) als Text. */
    const lin = (r: number) => (Math.abs(r) < 1e-9 ? 'x' : `(x ${r > 0 ? '−' : '+'} ${n(Math.abs(r))})`);
    /** Polynom als Text, z. B. 0,5x² − 2x + 1. */
    function polyStr(c: Poly): string {
      const d = degree(c);
      if (d < 0) return '0';
      const parts: string[] = [];
      for (let i = d; i >= 0; i--) {
        const v = c[i]!;
        if (Math.abs(v) < 1e-9) continue;
        const abs = Math.abs(v);
        const coef = i > 0 && Math.abs(abs - 1) < 1e-9 ? '' : n(abs);
        const xs = i === 0 ? '' : i === 1 ? 'x' : `x^${i}`;
        const sign = v < 0 ? '−' : '+';
        parts.push(parts.length ? ` ${sign} ${coef}${xs}` : `${v < 0 ? '−' : ''}${coef}${xs}`);
      }
      return parts.join('') || '0';
    }
    function factoredSrc(): string {
      const f = rational();
      const lead = f.a === 1 ? '' : f.a === -1 ? '−' : n(f.a);
      const top = f.zeros.length && f.a !== 0 ? `${lead}${f.zeros.map(lin).join('')}` : n(f.a);
      const sortedPoles = [...f.poles];
      const bot = sortedPoles.length === 2 && Math.abs(sortedPoles[0]! - sortedPoles[1]!) < 1e-9 ? `${lin(sortedPoles[0]!).replace(/^x$/, 'x')}^2` : sortedPoles.map(lin).join('');
      // einzelner Nennerfaktor ohne Klammer
      const botClean = sortedPoles.length === 1 ? bot.replace(/^\((.*)\)$/, '$1') : bot;
      return `f(x) = \\f{${top}}{${botClean}}`;
    }
    const asymLabel = (): string => (A.kind === 'zero' ? 'y = 0' : `y = ${polyStr(A.asym)}`);

    /* ---------- Aufteilung ---------- */
    function regions(): { plot: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (!wideLayout()) {
        const ph = Math.round(clamp(w * 0.9, 260, h * 0.48));
        return { plot: { x: 0, y: 0, w, h: ph }, col: { x: 2, y: ph + 6, w: w - 4, h: h - ph - 8 } };
      }
      const cw = Math.round(clamp(w * 0.4, 280, 390));
      return { plot: { x: 0, y: 0, w: w - cw - 10, h }, col: { x: w - cw, y: 2, w: cw - 2, h: h - 4 } };
    }
    const plot = new Plot(surface, { x: [-XR, XR], y: [-YR, YR], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().plot });

    /* ---------- Griffe ---------- */
    let dragging = 0;
    const snap = (x: number) => clamp(Math.round(x * 2) / 2, -5, 5);
    ZK.forEach((k, i) => {
      plot.addHandle({
        get: () => [p[k] as number, 0],
        set: (x) => {
          dragging = performance.now();
          ctx.set({ [k]: snap(x) });
        },
        axis: 'x',
        enabled: () => !ctx.locked && p.zn > i,
        color: () => col.zero(),
      });
    });
    const poleY = () => plot.bounds.yMax - 16 / plot.scale.y;
    PK.forEach((k, i) => {
      plot.addHandle({
        get: () => [p[k] as number, poleY()],
        set: (x) => {
          dragging = performance.now();
          ctx.set({ [k]: snap(x) });
        },
        axis: 'x',
        enabled: () => !ctx.locked && p.pn > i,
        color: () => col.pole(),
      });
    });

    /* ---------- Ergebnisse ---------- */
    const plain = (s: string) => s.replace(/\^2/g, '²').replace(/\^3/g, '³');
    function updateReadouts(): void {
      ctx.readout('term', plain(`f(x) = (${polyStr(A.num)}) / (${polyStr(A.den)})`));
      ctx.readout('dom', A.gaps.length ? `ℝ \\ {${A.gaps.map(n).join('; ')}}` : 'ℝ');
      ctx.readout('asym', plain(A.kind === 'curve' ? `${ctx.t('curveLine')}: ${asymLabel()}` : asymLabel()));
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
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { z: col.zero(), p: col.pole(), s: col.asym(), f: col.f(), m: th().muted },
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
    function line(src: string, x: number, y: number, maxW: number, size: number, color = th().text): number {
      const box = fitFormula(src, maxW, size, color);
      box.draw(surface.g, x, y + box.asc);
      return y + box.asc + box.desc;
    }
    /** Beschriftung im Plot mit Hintergrund. */
    function tag(x: number, y: number, src: string, color: string, align: 'left' | 'center' | 'right' = 'left', size = F(13, 12)): void {
      const g = surface.g;
      const box = formula(g, src, fstyle(size, color, 700));
      const r = plot.rect;
      let left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      left = clamp(left, r.x + 4, r.x + r.w - box.w - 4);
      const base = clamp(y + (box.asc - box.desc) / 2, r.y + box.asc + 4, r.y + r.h - box.desc - 4);
      g.save();
      g.globalAlpha = 0.88;
      g.fillStyle = th().bg;
      roundRect(g, left - 4, base - box.asc - 2, box.w + 8, box.asc + box.desc + 4, 6);
      g.fill();
      g.globalAlpha = 1;
      box.draw(g, left, base);
      g.restore();
    }

    /* ---------- Weiche Übergänge ---------- */
    let shownF: Rational = rational();
    let lastFrame = performance.now();
    const intro = new Tween(900, ease.outCubic);
    const run = new Tween(RUN_MS, ease.linear);

    function stepShown(dt: number): boolean {
      const goal = rational();
      if (goal.zeros.length !== shownF.zeros.length || goal.poles.length !== shownF.poles.length || dragging || reduced) {
        shownF = goal;
        return false;
      }
      const k = 1 - Math.exp(-dt * 10);
      let moving = false;
      const mv = (cur: number, g: number) => {
        if (Math.abs(g - cur) < 1e-3) return g;
        moving = true;
        return cur + (g - cur) * k;
      };
      shownF = { a: mv(shownF.a, goal.a), zeros: shownF.zeros.map((z, i) => mv(z, goal.zeros[i]!)), poles: shownF.poles.map((q, i) => mv(q, goal.poles[i]!)) };
      return moving;
    }

    /* ---------- Plot ---------- */
    function drawPlot(): void {
      const g = surface.g;
      const theme = th();
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const settled = shownF.zeros.every((z, i) => Math.abs(z - rational().zeros[i]!) < 1e-6) && shownF.poles.every((q, i) => Math.abs(q - rational().poles[i]!) < 1e-6) && Math.abs(shownF.a - p.a) < 1e-6;
      const SA = settled ? A : analyze(shownF);
      const f = (x: number) => value(shownF, x);
      // Asymptoten
      if (p.asy) {
        for (const q of SA.poles) {
          const px = plot.px(q.x);
          g.save();
          g.strokeStyle = col.pole();
          g.lineWidth = 2;
          g.setLineDash([7, 5]);
          g.beginPath();
          g.moveTo(px, r.y);
          g.lineTo(px, r.y + r.h);
          g.stroke();
          g.restore();
          if (p.show) tag(px + 6, r.y + r.h - 16, `x = ${n(q.x)}`, col.pole(), 'left', F(12.5, 11.5));
        }
        if (shownF.a !== 0) {
          g.save();
          g.setLineDash([9, 6]);
          plot.fn((x) => evalPoly(SA.asym, x), { color: col.asym(), width: 2 });
          g.restore();
          if (p.show) {
            // Beschriftung am rechten Rand, über bzw. unter der Linie
            const xr = plot.bounds.xMax - 0.3;
            const yr = evalPoly(SA.asym, xr);
            const above = f(xr) < yr;
            tag(r.x + r.w - 8, plot.py(yr) + (above ? -14 : 14), SA.kind === 'curve' ? `\\t{${ctx.t('curveLine')}}` : asymLabel(), col.asym(), 'right', F(13, 12));
          }
        }
      }
      // Graph je Teilintervall
      const reveal = intro.running ? intro.value : 1;
      const { xMin, xMax } = plot.bounds;
      const to = lerp(xMin, xMax, reveal);
      const cuts = [xMin, ...SA.gaps.filter((x) => x > xMin && x < xMax), xMax];
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.f(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 5;
      for (let i = 0; i < cuts.length - 1; i++) {
        const a0 = cuts[i]! + (i > 0 ? 1e-4 : 0);
        const b0 = Math.min(cuts[i + 1]! - (i < cuts.length - 2 ? 1e-4 : 0), to);
        if (b0 > a0) plot.fn(f, { color: col.f(), width: 3, from: a0, to: b0 });
      }
      g.restore();
      // Löcher
      for (const h of SA.holes) {
        if (Number.isFinite(h.y)) plot.point(h.x, h.y, { color: col.f(), radius: 5.5, hollow: true });
      }
      // Nullstellen-Griffe (Zähler)
      for (let i = 0; i < p.zn; i++) {
        const z = rational().zeros[i]!;
        const isHole = A.holes.some((h) => Math.abs(h.x - z) < 1e-9) || A.poles.some((q) => Math.abs(q.x - z) < 1e-9);
        plot.point(z, 0, { color: col.zero(), radius: 6.5, hollow: isHole });
      }
      // Nenner-Marken oben
      const yT = poleY();
      for (let i = 0; i < p.pn; i++) {
        const q = rational().poles[i]!;
        const [px, py] = plot.toPx(q, yT);
        g.save();
        g.fillStyle = col.pole();
        g.beginPath();
        g.moveTo(px - 8, py - 7);
        g.lineTo(px + 8, py - 7);
        g.lineTo(px, py + 7);
        g.closePath();
        g.fill();
        g.strokeStyle = theme.bg;
        g.lineWidth = 1.5;
        g.stroke();
        g.restore();
        const dup = i === 1 && Math.abs(q - rational().poles[0]!) < 1e-9;
        if (!dup) tag(px + 10, py, `\\c{p}{p_${i + 1}}`, col.pole(), 'left', F(12, 11));
        else tag(px + 10, py, '\\c{p}{p_1 = p_2}', col.pole(), 'left', F(12, 11));
      }
      // laufender Punkt
      if (run.running) {
        const x = lerp(xMin + 0.2, xMax - 0.2, run.value);
        const y = f(x);
        if (Number.isFinite(y)) {
          const px = plot.px(x);
          const py = clamp(plot.py(y), r.y + 6, r.y + r.h - 6);
          const ya = evalPoly(SA.asym, x);
          if (p.asy && shownF.a !== 0 && SA.kind !== 'curve') {
            g.save();
            g.strokeStyle = col.P();
            g.lineWidth = 2;
            g.beginPath();
            g.moveTo(px, py);
            g.lineTo(px, clamp(plot.py(ya), r.y, r.y + r.h));
            g.stroke();
            g.restore();
          }
          g.beginPath();
          g.arc(px, py, 6, 0, Math.PI * 2);
          g.fillStyle = col.P();
          g.fill();
          g.strokeStyle = theme.bg;
          g.lineWidth = 2;
          g.stroke();
          const yv = Math.abs(y) > 999 ? fmt.num(y, 0) : n(y);
          const lab = `x = ${fmt.num(x, 1)}, f(x) ≈ ${yv}`;
          tag(px + 10, py + (py < r.y + 40 ? 24 : -22), lab, col.P(), x > xMax - 3 ? 'right' : 'left', F(12.5, 11.5));
          if (p.asy && shownF.a !== 0 && SA.kind !== 'curve' && Math.abs(y - ya) < 50) tag(px + 10, py + (py < r.y + 40 ? 46 : -44), tr('dist', { d: n(Math.abs(y - ya)) }), col.P(), x > xMax - 3 ? 'right' : 'left', F(12, 11));
        }
      }
      plot.end();
    }

    /* ---------- Karten ---------- */
    function termCard(R: Rect): number {
      const pad = F(14, 12);
      const maxW = R.w - 2 * pad;
      const fs = F(16, 14.5);
      // Höhe vorab bestimmen
      const lines: string[] = [factoredSrc(), `\\t{ } = \\f{${polyStr(A.num)}}{${polyStr(A.den)}}`];
      if (p.show && A.kind !== 'zero' && p.a !== 0) {
        const restZero = degree(A.rest) < 0;
        lines.push(restZero ? `\\t{ } = \\c{s}{${polyStr(A.asym)}}` : `\\t{ } = \\c{s}{${polyStr(A.asym)}} + \\f{${polyStr(A.rest)}}{${polyStr(A.den)}}`);
      }
      const g = surface.g;
      const boxes = lines.map((s) => fitFormula(s, maxW, fs));
      const h = 28 + boxes.reduce((s, b) => s + b.asc + b.desc + 8, 0) + 4;
      if (R.h <= 0) return h;
      card({ ...R, h }, col.f(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('termT'), col.f());
      let y = R.y + 28;
      for (const b of boxes) {
        b.draw(g, R.x + pad, y + b.asc);
        y += b.asc + b.desc + 8;
      }
      return h;
    }

    function propCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('propT'));
      const maxW = R.w - 2 * pad;
      const fs = F(13, 12);
      const lab = font(700, F(12, 11));
      let y = R.y + 28;
      const row = (label: string, src: string, color = theme.text) => {
        if (y > R.y + R.h - 16) return;
        text(g, label, R.x + pad, y + 8, { font: lab, color: theme.muted, align: 'left' });
        y += 16;
        y = line(src, R.x + pad + 8, y, maxW - 8, fs, color) + 8;
      };
      const kName = (k: number) => ctx.t(k === 1 ? 'simple' : k === 2 ? 'double' : 'triple');
      row(ctx.t('dom'), Q(A.gaps.length ? `D = ℝ \\ {${A.gaps.map(n).join('; ')}}` : 'D = ℝ'));
      if (p.a === 0) {
        row(ctx.t('zeros'), `\\t{${ctx.t('aZero')}}`);
      } else row(ctx.t('zeros'), Q(A.zeros.length ? A.zeros.map((z) => `\\c{z}{x = ${n(z.x)}} \\t{(${kName(z.k)})}`).join(', ') : `\\t{${ctx.t('none')}}`));
      row(ctx.t('poles'), Q(A.poles.length ? A.poles.map((q) => `\\c{p}{x = ${n(q.x)}} \\t{(${ctx.t(q.signChange ? 'vzw' : 'novzw')})}`).join(', ') : `\\t{${ctx.t('none')}}`));
      if (A.holes.length) row(ctx.t('holes'), Q(A.holes.map((h) => `\\t{${tr('hole', { p: `(${n(h.x)} | ${n(h.y)})` })}}`).join(', ')));
      // Verhalten an den Polstellen
      if (p.show && p.a !== 0) {
        const f = rational();
        for (const q of A.poles) {
          const s = poleSides(f, q.x);
          const inf = (v: number) => (v > 0 ? '+∞' : '−∞');
          row(tr('near', { p: n(q.x) }), `x → ${n(q.x)}^{−}: f(x) → ${inf(s.left)};   x → ${n(q.x)}^{+}: f(x) → ${inf(s.right)}`);
        }
      }
      // Asymptote
      const kTxt = p.a === 0 ? '' : A.kind === 'zero' ? ctx.t('kZero') : A.kind === 'const' ? tr('kConst', { v: n(A.asym[0] ?? 0) }) : A.kind === 'oblique' ? ctx.t('kObl') : ctx.t('kCurve');
      if (kTxt && y < R.y + R.h - 30) {
        text(g, ctx.t('asym'), R.x + pad, y + 8, { font: lab, color: theme.muted, align: 'left' });
        y += 18;
        if (!p.show) {
          line('?', R.x + pad + 8, y, maxW, fs);
          return;
        }
        const f = font(600, F(12.5, 11.5));
        for (const rowTxt of wrap(kTxt, maxW - 8, f)) {
          text(g, rowTxt, R.x + pad + 8, y + 7, { font: f, color: col.asym(), align: 'left' });
          y += 16;
        }
        if (A.kind === 'oblique' || A.kind === 'curve') line(`\\c{s}{${asymLabel()}}`, R.x + pad + 8, y + 2, maxW - 8, fs);
      }
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (dragging && now - dragging > 250) dragging = 0;
      const moving = stepShown(dt);
      surface.begin();
      plot.resize();
      drawPlot();
      const C = regions().col;
      const gap = F(10, 8);
      const th1 = termCard({ ...C, h: 0 });
      termCard({ x: C.x, y: C.y, w: C.w, h: th1 });
      propCard({ x: C.x, y: C.y + th1 + gap, w: C.w, h: C.h - th1 - gap });
      if (moving || intro.running || run.running || dragging) ctx.requestRender();
    }

    return {
      update(changed, source) {
        if (changed.has('zn') || changed.has('pn') || source === 'replace') intro.play(reduced ? 1 : 900);
        A = analyze(rational());
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (id !== 'run') return;
        run.play(reduced ? 1 : RUN_MS);
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
