import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import { correctDigits, FNS, isCycle, iterate, nearestRoot, sequence, type FnKey, type Step } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const KMAX = 10;
const STEP_MS = 1100;

/** Bildausschnitt und Funktionsterm je Funktion. */
const VIEW: Record<FnKey, { x: [number, number]; y: [number, number]; term: string; dterm: string }> = {
  sq2: { x: [-3, 3], y: [-3, 5], term: 'x² − 2', dterm: '2x' },
  cubic: { x: [-1.5, 4], y: [-12, 25], term: 'x³ − 2x − 5', dterm: '3x² − 2' },
  cos: { x: [-1, 2.5], y: [-2.5, 1.5], term: 'cos x − x', dterm: '−sin x − 1' },
  three: { x: [-3, 3], y: [-5, 5], term: 'x³ − 3x + 1', dterm: '3x² − 3' },
  cycle: { x: [-3, 2.5], y: [-4, 7], term: 'x³ − 2x + 2', dterm: '3x² − 2' },
};

/**
 * Newton-Verfahren Schritt für Schritt: Tangente im aktuellen Punkt, ihr
 * Schnittpunkt mit der x-Achse als nächster Näherungswert. Der Startwert ist
 * ziehbar; eine Tabelle zeigt, wie schnell die richtigen Stellen zunehmen.
 * Gegenbeispiele: waagrechte Tangente, Zyklus, Sprung zu einer anderen
 * Nullstelle. Optional zoomt die Ansicht mit.
 */
export default defineSimulation({
  id: 'newton-verfahren',
  dragHint: true,
  layout: { aspect: 1.62, aspectNarrow: 0.5 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'fn',
      type: 'choice',
      label: L('Funktion', 'Function'),
      options: [
        { value: 'sq2', label: L('f(x) = x² − 2 (√2)', 'f(x) = x² − 2 (√2)') },
        { value: 'cubic', label: L('f(x) = x³ − 2x − 5 (Newtons Beispiel)', 'f(x) = x³ − 2x − 5 (Newton’s example)') },
        { value: 'cos', label: L('f(x) = cos x − x', 'f(x) = cos x − x') },
        { value: 'three', label: L('f(x) = x³ − 3x + 1 (drei Nullstellen)', 'f(x) = x³ − 3x + 1 (three zeros)') },
        { value: 'cycle', label: L('f(x) = x³ − 2x + 2', 'f(x) = x³ − 2x + 2') },
      ],
      default: 'sq2',
    },
    { key: 'x0', type: 'number', label: L('Startwert x₀', 'Starting value x₀'), min: -3, max: 4, step: 0.1, default: 1, help: L('Auch x₀ auf der x-Achse ziehen.', 'You can also drag x₀ along the x-axis.') },
    { key: 'k', type: 'number', label: L('Anzahl Schritte', 'Number of steps'), min: 0, max: KMAX, step: 1, default: 1 },
    { key: 'zoom', type: 'boolean', group: 'view', label: L('Ansicht mitzoomen', 'Zoom in with the steps'), default: false },
    { key: 'show', type: 'boolean', group: 'view', label: L('Werte zeigen', 'Show values'), help: L('Aus: Näherungswerte selbst berechnen.', 'Off: work out the approximations yourself.'), default: true },
  ],
  actions: [
    { id: 'step', label: L('Nächster Schritt', 'Next step'), primary: true },
    { id: 'restart', label: L('Neu starten', 'Start again') },
  ],
  readouts: [
    { key: 'xk', label: L('Näherungswert', 'Approximation'), spoiler: true },
    { key: 'fxk', label: L('Funktionswert', 'Function value'), spoiler: true },
  ],
  presets: [
    { id: 'sqrt2', label: L('√2 mit x₀ = 1', '√2 with x₀ = 1'), values: {} },
    { id: 'newton', label: L('Newtons Beispiel', 'Newton’s example'), values: { fn: 'cubic', x0: 2, k: 2 } },
    { id: 'cos', label: L('cos x = x', 'cos x = x'), values: { fn: 'cos', x0: 1, k: 2 } },
    { id: 'jump', label: L('Startwert entscheidet', 'The start value matters'), values: { fn: 'three', x0: 0.9, k: 1 } },
    { id: 'cycle', label: L('Zyklus: hin und her', 'Cycle: back and forth'), values: { fn: 'cycle', x0: 0, k: 3 } },
    { id: 'flat', label: L('Waagrechte Tangente', 'Horizontal tangent'), values: { fn: 'sq2', x0: 0, k: 1 } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatensystem mit dem Graphen von f, einem ziehbaren Startwert x₀ auf der x-Achse und den Tangenten des Newton-Verfahrens, deren Schnittpunkte mit der x-Achse die nächsten Näherungswerte liefern. Daneben die Rechnung für den aktuellen Schritt und eine Tabelle der Näherungswerte.',
      calcT: 'Newton-Schritt',
      tabT: 'Näherungswerte',
      start: 'Startwert gewählt – drücke „Nächster Schritt“.',
      flat: 'Waagrechte Tangente (f′(x) = 0): Sie schneidet die x-Achse nicht – das Verfahren bricht ab.',
      far: 'Der nächste Wert liegt sehr weit weg – das Verfahren läuft davon.',
      cycle: 'Die Werte springen hin und her (Zyklus) – das Verfahren findet keine Nullstelle.',
      conv: 'Grün: richtige Nachkommastellen. Ihre Anzahl verdoppelt sich ungefähr mit jedem Schritt.',
      other: 'Achtung: Die Folge läuft zu einer anderen Nullstelle als der nächstgelegenen.',
      tangent: 'Tangente',
    },
    en: {
      canvas: 'Coordinate system with the graph of f, a draggable starting value x₀ on the x-axis and the tangents of Newton’s method, whose x-intercepts give the next approximations. Next to it the calculation for the current step and a table of approximations.',
      calcT: 'Newton step',
      tabT: 'Approximations',
      start: 'Starting value chosen – press “Next step”.',
      flat: 'Horizontal tangent (f′(x) = 0): it does not cross the x-axis – the method stops.',
      far: 'The next value is very far away – the method runs off.',
      cycle: 'The values jump back and forth (cycle) – the method does not find a zero.',
      conv: 'Green: correct decimal places. Their number roughly doubles with every step.',
      other: 'Note: the sequence runs to a different zero than the nearest one.',
      tangent: 'tangent',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const th = () => ctx.theme;
    const wideLayout = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const F = (w: number, n: number) => (surface.width >= 640 ? w : n);
    const font = (weight: number, size: number) => `${weight} ${size}px ${th().font}`;
    const key = () => p.fn as FnKey;
    const fn = () => FNS[key()];

    const col = {
      f: () => th().series[0]!,
      tan: () => th().series[3]!,
      x: () => th().series[1]!,
      ok: () => th().series[2]!,
      bad: () => th().series[1]!,
    };

    const n = (v: number, d = 4) => fmt.num(v, d);
    const Q = (s: string) => (p.show ? s : '?');
    const steps = (): Step[] => iterate(fn(), p.x0, p.k);
    const xs = (): number[] => sequence(fn(), p.x0, p.k);

    /* ---------- Aufteilung ---------- */
    function regions(): { plot: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (!wideLayout()) {
        const ph = Math.round(clamp(w * 0.85, 250, h * 0.46));
        return { plot: { x: 0, y: 0, w, h: ph }, col: { x: 2, y: ph + 6, w: w - 4, h: h - ph - 8 } };
      }
      const cw = Math.round(clamp(w * 0.4, 280, 390));
      return { plot: { x: 0, y: 0, w: w - cw - 10, h }, col: { x: w - cw, y: 2, w: cw - 2, h: h - 4 } };
    }
    const plot = new Plot(surface, { x: [-3, 3], y: [-3, 5], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().plot });

    /* ---------- Ansicht (weich, optional mitzoomend) ---------- */
    const view = { x0: VIEW.sq2.x[0], x1: VIEW.sq2.x[1], y0: VIEW.sq2.y[0], y1: VIEW.sq2.y[1] };
    let viewFn: FnKey | null = null;
    function viewGoal(): typeof view {
      const v = VIEW[key()];
      const base = { x0: v.x[0], x1: v.x[1], y0: v.y[0], y1: v.y[1] };
      if (!p.zoom) return base;
      const seq = xs();
      if (seq.length < 2) return base;
      const a = seq[seq.length - 1]!;
      const b = seq[seq.length - 2]!;
      const w = clamp(Math.abs(a - b) * 2.2, 1e-6, (v.x[1] - v.x[0]) / 2);
      const f = fn();
      const fa = f.f(b);
      const ylo = Math.min(0, fa);
      const yhi = Math.max(0, fa);
      const pad = Math.max((yhi - ylo) * 0.35, 1e-7);
      return { x0: (a + b) / 2 - w, x1: (a + b) / 2 + w, y0: ylo - pad, y1: yhi + pad };
    }

    /* ---------- Griff ---------- */
    let dragging = 0;
    plot.addHandle({
      get: () => [p.x0, 0],
      set: (x) => {
        dragging = performance.now();
        ctx.set({ x0: Math.round(clamp(x, -3, 4) * 10) / 10 });
      },
      axis: 'x',
      enabled: () => !ctx.locked && !p.zoom,
      color: () => col.x(),
    });

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const seq = xs();
      const last = seq[seq.length - 1]!;
      const exact = Math.abs(last - Math.round(last * 1e8) / 1e8) < 1e-12;
      ctx.readout('xk', `x${sub(seq.length - 1)} ${exact ? '=' : '≈'} ${exact ? fmt.num(last, 8) : fmt.fixed(last, 8)}`);
      const fl = fn().f(last);
      ctx.readout('fxk', `f(x${sub(seq.length - 1)}) ${Math.abs(fl - Math.round(fl * 1e6) / 1e6) < 1e-12 ? '=' : '≈'} ${small(fl)}`);
    }
    const SUB = '₀₁₂₃₄₅₆₇₈₉';
    const sub = (i: number) => String(i).split('').map((d) => SUB[Number(d)]).join('');
    function small(v: number): string {
      if (v === 0) return '0';
      if (Math.abs(v) >= 1e-4) return fmt.num(v, 6);
      const e = Math.floor(Math.log10(Math.abs(v)));
      const m = v / 10 ** e;
      return `${fmt.num(m, 2)} · 10${String(e).replace('-', '⁻').split('').map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)] ?? c).join('')}`;
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
      palette: { f: col.f(), t: col.tan(), x: col.x(), g: col.ok(), m: th().muted },
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

    /* ---------- Animation ---------- */
    let lastFrame = performance.now();
    const stepT = new Tween(STEP_MS, ease.linear);
    /** Fortschritt des zuletzt hinzugekommenen Schritts (1 = fertig gezeichnet). */
    const lastProgress = () => (stepT.running ? stepT.value : 1);

    /* ---------- Plot ---------- */
    function drawPlot(): void {
      const g = surface.g;
      const theme = th();
      plot.setRange([view.x0, view.x1], [view.y0, view.y1]);
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const f = fn();
      // Graph
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.f(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 5;
      plot.fn(f.f, { color: col.f(), width: 3 });
      g.restore();
      const st = steps();
      const seq = xs();
      // Tangenten und Lote
      st.forEach((s, i) => {
        const isLast = i === st.length - 1;
        const t = isLast ? lastProgress() : 1;
        const old = !isLast;
        const alpha = old ? 0.4 : 1;
        // senkrechtes Lot von (x_i | 0) zum Graphen (Teil 1 der Animation)
        const t1 = clamp(t / 0.35, 0, 1);
        if (Math.abs(s.fx) > 0) plot.segment([s.x, 0], [s.x, s.fx * ease.outCubic(t1)], { color: withAlpha(theme.text, 0.55 * alpha + 0.1), width: 1.5, dash: [4, 4] });
        if (t1 < 1) return;
        plot.point(s.x, s.fx, { color: withAlpha(col.f(), alpha), radius: old ? 3.5 : 5 });
        // Tangente (Teil 2): vom Kurvenpunkt zum Schnittpunkt mit der x-Achse, dazu leicht verlängert
        const t2 = clamp((t - 0.35) / 0.65, 0, 1);
        const m = s.dfx;
        const tanF = (x: number) => s.fx + m * (x - s.x);
        if (s.next === null) {
          // waagrechte Tangente
          plot.line([s.x, s.fx], [s.x + 1, s.fx], { color: col.bad(), width: 2.4 });
          return;
        }
        const span = (view.x1 - view.x0) * 0.08;
        const dir = Math.sign(s.next - s.x) || 1;
        const a = s.x - dir * span;
        const b = lerp(s.x, s.next + dir * span, ease.inOutCubic(t2));
        plot.segment([a, tanF(a)], [b, tanF(b)], { color: withAlpha(col.tan(), old ? 0.45 : 1), width: old ? 1.6 : 2.6 });
        if (t2 >= 1) {
          plot.point(s.next, 0, { color: withAlpha(col.x(), old ? 0.6 : 1), radius: old ? 4 : 5.5 });
        }
      });
      // Beschriftung der Näherungswerte auf der x-Achse (nur sichtbare, mit Mindestabstand)
      const placed: number[] = [];
      for (let i = seq.length - 1; i >= 0; i--) {
        const isNew = i === seq.length - 1 && i > 0;
        if (isNew && lastProgress() < 1) continue;
        const px = plot.px(seq[i]!);
        if (px < r.x || px > r.x + r.w) continue;
        if (placed.some((q) => Math.abs(q - px) < 34)) continue;
        placed.push(px);
        const below = (st[i]?.fx ?? f.f(seq[i]!)) > 0;
        tag(px, plot.py(0) + (below ? 16 : -16), `\\c{x}{x_${i}}`, col.x(), 'center', F(13, 12));
      }
      // Startwert-Griff
      plot.point(p.x0, 0, { color: col.x(), radius: 7 });
      // aktuelle Tangente beschriften
      const lastS = st[st.length - 1];
      if (lastS && lastS.next !== null && lastProgress() >= 1) {
        const xm = lerp(lastS.x, lastS.next, 0.5);
        const ym = lastS.fx + lastS.dfx * (xm - lastS.x);
        const [px, py] = plot.toPx(xm, ym);
        if (px > r.x + 20 && px < r.x + r.w - 20 && py > r.y + 10 && py < r.y + r.h - 10) tag(px + 10, py - 12, `\\c{t}{\\t{${ctx.t('tangent')}}}`, col.tan(), 'left', F(12, 11));
      }
      plot.end();
    }

    /* ---------- Karten ---------- */
    function calcCard(R: Rect): number {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      const maxW = R.w - 2 * pad;
      const v = VIEW[key()];
      const st = steps();
      const seq = xs();
      const fs = F(15, 13.5);
      const rows: string[] = [`\\c{f}{f(x) = ${v.term}},   \\c{t}{f′(x) = ${v.dterm}}`, 'x_{n+1} = x_n − \\f{f(x_n)}{f′(x_n)}'];
      const s = st[st.length - 1];
      let note = '';
      if (!s) note = ctx.t('start');
      else {
        const i = st.length - 1;
        if (s.next === null) note = ctx.t('flat');
        else {
          rows.push(`\\c{x}{x_${i + 1}} = ${n(s.x)} − \\f{${Q(n(s.fx))}}{${Q(n(s.dfx))}} ${p.show && Math.abs(s.next - Math.round(s.next * 1e4) / 1e4) > 1e-12 ? '≈' : '='} \\c{x}{${Q(n(s.next))}}`);
          if (s.status === 'far') note = ctx.t('far');
          else if (isCycle(seq)) note = ctx.t('cycle');
        }
      }
      const boxes = rows.map((src) => fitFormula(src, maxW, fs));
      const f = font(600, F(12.5, 11.5));
      const noteRows = note ? wrap(note, maxW, f) : [];
      const h = 30 + boxes.reduce((sum, b) => sum + b.asc + b.desc + 8, 0) + noteRows.length * 16 + 6;
      if (R.h <= 0) return h;
      card({ ...R, h }, col.tan(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('calcT'), col.tan());
      let y = R.y + 28;
      for (const b of boxes) {
        b.draw(g, R.x + pad, y + b.asc);
        y += b.asc + b.desc + 8;
      }
      for (const row of noteRows) {
        text(g, row, R.x + pad, y + 6, { font: f, color: s && (s.next === null || s.status === 'far' || isCycle(seq)) ? col.bad() : theme.muted, align: 'left' });
        y += 16;
      }
      return h;
    }

    function tableCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('tabT'));
      const seq = xs();
      const f = fn();
      const fm = `600 ${F(13, 12)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      const fl = font(700, F(12, 11));
      const c0 = R.x + pad;
      const c1 = R.x + pad + F(34, 30);
      const c2 = R.x + R.w - pad;
      const hy = R.y + 36;
      text(g, 'n', c0, hy, { font: `italic 700 ${F(13, 12)}px ${theme.mathFont}`, color: theme.muted, align: 'left' });
      text(g, 'xₙ', c1, hy, { font: `italic 700 ${F(13, 12)}px ${theme.mathFont}`, color: theme.muted, align: 'left' });
      text(g, 'f(xₙ)', c2, hy, { font: `italic 700 ${F(13, 12)}px ${theme.mathFont}`, color: theme.muted, align: 'right' });
      const noteH = 34;
      const lh = Math.min(F(21, 19), (R.h - 52 - noteH) / Math.max(1, seq.length));
      if (lh < 12) return;
      const target = nearestRoot(f, seq[seq.length - 1]!);
      const otherRoot = Math.abs(target - nearestRoot(f, p.x0)) > 1e-6 && seq.length > 2;
      seq.forEach((x, i) => {
        const y = hy + 12 + lh * (i + 0.5);
        if (y > R.y + R.h - noteH) return;
        const isNew = i === seq.length - 1 && i > 0 && lastProgress() < 1;
        text(g, String(i), c0, y, { font: fl, color: theme.muted, align: 'left' });
        if (!p.show && i > 0) {
          text(g, '?', c1, y, { font: fm, color: theme.text, align: 'left' });
          return;
        }
        if (Math.abs(x) > 1e5) {
          text(g, '…', c1, y, { font: fm, color: col.bad(), align: 'left' });
          return;
        }
        const s = fmt.fixed(x, 10);
        // richtige Stellen grün
        const dig = Math.abs(x - target) < 0.5 ? correctDigits(f, x, 10) : -1;
        const sep = s.search(/[.,]/);
        const okLen = dig < 0 ? 0 : sep + 1 + dig;
        g.font = fm;
        const okPart = s.slice(0, okLen);
        const rest = s.slice(okLen);
        g.save();
        g.globalAlpha = isNew ? lastProgress() : 1;
        text(g, okPart, c1, y, { font: fm, color: col.ok(), align: 'left' });
        text(g, rest, c1 + g.measureText(okPart).width, y, { font: fm, color: theme.text, align: 'left' });
        text(g, small(f.f(x)), c2, y, { font: font(600, F(12, 11)), color: theme.muted, align: 'right' });
        g.restore();
      });
      const nf = font(600, F(11.5, 10.5));
      const note = isCycle(seq) || steps().some((st) => st.next === null || st.status !== 'ok') ? '' : otherRoot ? ctx.t('other') : ctx.t('conv');
      wrap(note, R.w - 2 * pad, nf)
        .slice(0, 2)
        .forEach((row, i) => text(g, row, R.x + pad, R.y + R.h - noteH + 8 + i * 14, { font: nf, color: otherRoot ? col.bad() : theme.muted, align: 'left' }));
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (dragging && now - dragging > 250) dragging = 0;
      const goal = viewGoal();
      let moving = false;
      if (viewFn !== key() || reduced) {
        Object.assign(view, goal);
        viewFn = key();
      } else {
        // im Zoom logarithmisch nähern, damit auch winzige Ausschnitte flüssig erreicht werden
        const k = 1 - Math.exp(-dt * 4);
        const cx = (view.x0 + view.x1) / 2;
        const cy = (view.y0 + view.y1) / 2;
        const gx = (goal.x0 + goal.x1) / 2;
        const gy = (goal.y0 + goal.y1) / 2;
        const w = view.x1 - view.x0;
        const h = view.y1 - view.y0;
        const gw = goal.x1 - goal.x0;
        const gh = goal.y1 - goal.y0;
        const nw = w * Math.exp(Math.log(gw / w) * k);
        const nh = h * Math.exp(Math.log(gh / h) * k);
        const ncx = cx + (gx - cx) * k;
        const ncy = cy + (gy - cy) * k;
        if (Math.abs(Math.log(gw / w)) < 1e-3 && Math.abs(Math.log(gh / h)) < 1e-3 && Math.abs(gx - cx) < gw * 1e-3 && Math.abs(gy - cy) < gh * 1e-3) Object.assign(view, goal);
        else {
          Object.assign(view, { x0: ncx - nw / 2, x1: ncx + nw / 2, y0: ncy - nh / 2, y1: ncy + nh / 2 });
          moving = true;
        }
      }
      surface.begin();
      plot.resize();
      drawPlot();
      const C = regions().col;
      const gap = F(10, 8);
      const h1 = calcCard({ ...C, h: 0 });
      calcCard({ x: C.x, y: C.y, w: C.w, h: h1 });
      // Tabelle nur so hoch wie nötig
      const need = 52 + Math.max(3, xs().length) * F(21, 19) + 40;
      if (C.h - h1 - gap > 100) tableCard({ x: C.x, y: C.y + h1 + gap, w: C.w, h: Math.min(C.h - h1 - gap, wideLayout() ? C.h : need) });
      if (moving || dragging || stepT.running) ctx.requestRender();
    }

    return {
      update() {
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (id === 'restart') {
          ctx.set({ k: 0 });
          return;
        }
        if (id !== 'step') return;
        const st = steps();
        const last = st[st.length - 1];
        if (p.k >= KMAX || (last && (last.next === null || last.status !== 'ok'))) return;
        ctx.set({ k: p.k + 1 });
        stepT.play(reduced ? 1 : STEP_MS);
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
