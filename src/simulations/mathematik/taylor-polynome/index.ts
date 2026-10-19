import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import { coefficients, factorial, FNS, lagrangeBound, remainder, taylor, validInterval, type FnKey } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const NMAX = 15;
const RUN_N = 12;
const RUN_STEP_MS = 650;
const INTRO_MS = 1700;

type ViewKey = 'approx' | 'terms' | 'band';

/** Bildausschnitt und Name je Funktion. */
const VIEW: Record<FnKey, { x: [number, number]; y: [number, number]; name: string; plain: string }> = {
  sin: { x: [-7, 7], y: [-3, 3], name: '\\t{sin} x', plain: 'sin x' },
  cos: { x: [-7, 7], y: [-3, 3], name: '\\t{cos} x', plain: 'cos x' },
  exp: { x: [-4, 4], y: [-2, 10], name: 'e^x', plain: 'eˣ' },
  ln: { x: [-1.6, 4], y: [-4, 3], name: '\\t{ln}(1 + x)', plain: 'ln(1 + x)' },
  geo: { x: [-3, 3], y: [-4, 6], name: '\\f{1}{1 − x}', plain: '1/(1 − x)' },
};

/** Hochgestellte Ziffern (für Zehnerpotenzen in Beschriftungen). */
const sup = (s: string) => s.replace('-', '⁻').split('').map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)] ?? c).join('');
const subDigits = (n: number) => String(n).split('').map((d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]).join('');

/**
 * Taylorpolynome in drei Ansichten:
 * – „Näherung“: Tₙ schmiegt sich an der Entwicklungsstelle a an f; Prüfstelle mit Fehler,
 *   Lagrange-Abschätzung und Fehlerdiagramm für n = 0 … 15, Konvergenzintervall.
 * – „Summanden“: Tₙ entsteht Schritt für Schritt aus T₀, T₁, … – der neue Summand
 *   cₙ(x − a)ⁿ wächst ein; eine Tabelle zeigt, wie aus f⁽ᵏ⁾(a) und k! die Koeffizienten werden.
 * – „ε-Schlauch“: Wo weicht Tₙ um weniger als ε von f ab? Der Gültigkeitsbereich wird mit
 *   jedem Grad breiter – bei ln(1 + x) und 1/(1 − x) aber nie breiter als das Konvergenzintervall.
 * Grad erhöhen (mit Überblendung) oder alle Grade durchlaufen lassen; a und x sind ziehbar.
 */
export default defineSimulation({
  id: 'taylor-polynome',
  dragHint: true,
  layout: { aspect: 1.62, aspectNarrow: 0.46 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'view',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'approx', label: L('Näherung', 'Approximation') },
        { value: 'terms', label: L('Summanden', 'Terms') },
        { value: 'band', label: L('ε-Schlauch', 'ε-band') },
      ],
      default: 'approx',
    },
    {
      key: 'fn',
      type: 'choice',
      label: L('Funktion', 'Function'),
      options: [
        { value: 'sin', label: L('sin x', 'sin x') },
        { value: 'cos', label: L('cos x', 'cos x') },
        { value: 'exp', label: L('eˣ', 'eˣ') },
        { value: 'ln', label: L('ln(1 + x)', 'ln(1 + x)') },
        { value: 'geo', label: L('1/(1 − x)', '1/(1 − x)') },
      ],
      default: 'sin',
    },
    { key: 'n', type: 'number', label: L('Grad n', 'Degree n'), min: 0, max: NMAX, step: 1, default: 3 },
    { key: 'a', type: 'number', label: L('Entwicklungsstelle a', 'Centre a'), min: -3.2, max: 3.2, step: 0.1, default: 0, help: L('Auch den Punkt auf dem Graphen ziehen.', 'You can also drag the point on the graph.') },
    {
      key: 'x',
      type: 'number',
      label: L('Prüfstelle x', 'Test point x'),
      min: -6,
      max: 6,
      step: 0.1,
      default: 2,
      visibleIf: (v) => v.view === 'approx',
    },
    {
      key: 'eps',
      type: 'choice',
      label: L('Toleranz ε', 'Tolerance ε'),
      options: [
        { value: '0.5', label: L('0,5', '0.5') },
        { value: '0.1', label: L('0,1', '0.1') },
        { value: '0.01', label: L('0,01', '0.01') },
        { value: '0.001', label: L('0,001', '0.001') },
      ],
      default: '0.1',
      help: L('Wo gilt |f(x) − Tₙ(x)| < ε?', 'Where does |f(x) − Tₙ(x)| < ε hold?'),
      visibleIf: (v) => v.view === 'band',
    },
    { key: 'err', type: 'boolean', group: 'view', label: L('Fehler und Konvergenzbereich zeigen', 'Show error and interval of convergence'), default: true },
    { key: 'show', type: 'boolean', group: 'view', label: L('Koeffizienten zeigen', 'Show the coefficients'), help: L('Aus: Taylorpolynom selbst aufstellen.', 'Off: set up the Taylor polynomial yourself.'), default: true },
  ],
  actions: [
    { id: 'up', label: L('Grad erhöhen', 'Increase degree'), primary: true },
    { id: 'down', label: L('Grad senken', 'Decrease degree') },
    { id: 'run', label: L('Alle Grade durchlaufen', 'Run through all degrees') },
  ],
  readouts: [
    { key: 'poly', label: L('Taylorpolynom', 'Taylor polynomial'), spoiler: true },
    { key: 'err', label: L('Fehler an der Prüfstelle', 'Error at the test point'), spoiler: true },
    { key: 'valid', label: L('Gültigkeitsbereich', 'Range of validity'), spoiler: true },
  ],
  presets: [
    { id: 'sin', label: L('sin x um 0', 'sin x about 0'), values: {} },
    { id: 'exp', label: L('eˣ: Näherung für e', 'eˣ: approximating e'), values: { fn: 'exp', n: 4, a: 0, x: 1 } },
    { id: 'terms', label: L('Summand für Summand: sin x', 'Term by term: sin x'), values: { view: 'terms', fn: 'sin', n: 5, a: 0 } },
    { id: 'cos', label: L('cos x um π', 'cos x about π'), values: { fn: 'cos', n: 2, a: 3.1, x: 2 } },
    { id: 'band', label: L('ε-Schlauch: eˣ', 'ε-band: eˣ'), values: { view: 'band', fn: 'exp', n: 4, a: 0, eps: '0.01' } },
    { id: 'ln', label: L('ln(1 + x): nur für |x| < 1', 'ln(1 + x): only for |x| < 1'), values: { fn: 'ln', n: 6, a: 0, x: 1.5 } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatensystem mit dem Graphen von f und dem Taylorpolynom Tₙ zur Entwicklungsstelle a (ziehbar). Ansicht Näherung: Prüfstelle x mit Fehler und Konvergenzintervall. Ansicht Summanden: die Polynome T₀ bis Tₙ und der neueste Summand, daneben die Tabelle der Ableitungen und Koeffizienten. Ansicht ε-Schlauch: der Bereich, in dem Tₙ um weniger als ε von f abweicht.',
      polyT: 'Taylorpolynom',
      errT: 'Fehler an der Prüfstelle',
      coefT: 'Vom Ableitungswert zum Koeffizienten',
      bandT: 'Gültigkeitsbereich: |f(x) − Tₙ(x)| < ε',
      conv: 'Konvergenzintervall: |x − a| < {r}',
      convAll: 'Konvergiert für alle x.',
      outside: 'x liegt außerhalb – der Fehler wächst mit n!',
      chart: 'Fehler |f(x) − Tₙ(x)| für n = 0 … 15',
      widthChart: 'Breite des Bereichs für n = 0 … 15',
      lagrange: 'Lagrange-Abschätzung',
      lagrangeNone: 'Hier keine einfache Fehlerschranke.',
      dom: 'nicht definiert',
      newTerm: 'neuer Summand',
      match: 'Bei a stimmen f und Tₙ in Wert und {n} Ableitungen überein.',
      none: 'Nirgends – selbst bei a nicht (ε zu klein?)',
      width: 'Breite',
      capped: 'am Rand des Bildausschnitts abgeschnitten',
      convLimit: 'Für wachsendes n bleibt der Bereich im Konvergenzintervall.',
    },
    en: {
      canvas: 'Coordinate system with the graph of f and the Taylor polynomial Tₙ about the centre a (draggable). Approximation view: test point x with error and interval of convergence. Terms view: the polynomials T₀ to Tₙ and the newest term, next to it the table of derivatives and coefficients. ε-band view: the range in which Tₙ differs from f by less than ε.',
      polyT: 'Taylor polynomial',
      errT: 'Error at the test point',
      coefT: 'From derivative to coefficient',
      bandT: 'Range of validity: |f(x) − Tₙ(x)| < ε',
      conv: 'interval of convergence: |x − a| < {r}',
      convAll: 'Converges for all x.',
      outside: 'x lies outside – the error grows with n!',
      chart: 'error |f(x) − Tₙ(x)| for n = 0 … 15',
      widthChart: 'width of the range for n = 0 … 15',
      lagrange: 'Lagrange bound',
      lagrangeNone: 'No simple error bound here.',
      dom: 'not defined',
      newTerm: 'new term',
      match: 'At a, f and Tₙ agree in value and {n} derivatives.',
      none: 'Nowhere – not even at a (ε too small?)',
      width: 'width',
      capped: 'cut off at the edge of the picture',
      convLimit: 'As n grows, the range stays within the interval of convergence.',
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
    const key = () => p.fn as FnKey;
    const fn = () => FNS[key()];
    const view = () => p.view as ViewKey;
    const eps = () => Number(p.eps);
    /** Entwicklungsstelle im zulässigen Bereich der Funktion. */
    const aEff = () => clamp(p.a, fn().aMin, fn().aMax);

    const col = {
      f: () => th().series[0]!,
      T: () => th().series[3]!,
      a: () => th().series[4]!,
      x: () => th().series[1]!,
      conv: () => th().series[2]!,
      band: () => th().series[5]!,
    };

    /* ---------- Zahlen und Terme ---------- */
    const n2 = (v: number) => fmt.num(v, 2);
    /** Zahl kompakt: Dezimalzahl oder Zehnerpotenz-Schreibweise für sehr große/kleine Werte. */
    function small(v: number): string {
      if (v === 0) return '0';
      if (Math.abs(v) >= 1e-3 && Math.abs(v) < 1e6) return fmt.num(v, 4);
      const e = Math.floor(Math.log10(Math.abs(v)));
      const m = v / 10 ** e;
      return `${fmt.num(m, 2)} · 10${sup(String(e))}`;
    }
    /** Koeffizient als Formel: exakter Bruch, wenn möglich, sonst Dezimalzahl. */
    function coefSrc(c: number, k: number): { sign: number; body: string } {
      const sign = c < 0 ? -1 : 1;
      const v = Math.abs(c);
      for (const den of [1, k || 1, factorial(k)]) {
        const num = v * den;
        if (Math.round(num) >= 1 && Math.abs(num - Math.round(num)) < 1e-9 && Math.round(num) <= 9999 && den <= 1e7) {
          const nn = Math.round(num);
          if (den === 1) return { sign, body: String(nn) };
          return { sign, body: `\\f{${nn}}{${den}}` };
        }
      }
      return { sign, body: v < 1e-3 ? small(v) : fmt.num(v, 3) };
    }
    function powSrc(a: number, k: number): string {
      const base = Math.abs(a) < 1e-9 ? 'x' : `(x ${a > 0 ? '−' : '+'} ${fmt.num(Math.abs(a), 1)})`;
      if (k === 0) return '';
      return k === 1 ? base : `${base}^${k}`;
    }
    function termSrc(c: number, k: number, a: number, first: boolean): string {
      const { sign, body } = coefSrc(c, k);
      const pw = powSrc(a, k);
      const coef = pw && body === '1' ? '' : body;
      const term = pw ? `${coef}${coef && !coef.startsWith('\\f') ? ' · ' : ''}${pw}` : body;
      return first ? `${sign < 0 ? '−' : ''}${term}` : ` ${sign < 0 ? '−' : '+'} ${term}`;
    }
    /** Tₙ als Formelquelle (höchstens `maxTerms` Summanden ≠ 0, dann „+ …“). */
    function polySrc(n: number, maxTerms: number): string {
      const a = aEff();
      const c = coefficients(fn(), a, n);
      const parts: string[] = [];
      let more = false;
      for (let k = 0; k <= n; k++) {
        if (c[k] === 0) continue;
        if (parts.length >= maxTerms) {
          more = true;
          break;
        }
        parts.push(termSrc(c[k]!, k, a, parts.length === 0));
      }
      if (!parts.length) return '0';
      return parts.join('') + (more ? ' + …' : '');
    }
    const plain = (s: string) =>
      s
        .replace(/\\f\{([^}]*)\}\{([^}]*)\}/g, '($1/$2)')
        .replace(/\\t\{([^}]*)\}/g, '$1')
        .replace(/\^(\d+)/g, (_m, d: string) => d.split('').map((c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]).join(''));

    /* ---------- Aufteilung ---------- */
    function regions(): { plot: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (!wideLayout()) {
        const ph = Math.round(clamp(w * 0.85, 250, h * 0.44));
        return { plot: { x: 0, y: 0, w, h: ph }, col: { x: 2, y: ph + 6, w: w - 4, h: h - ph - 8 } };
      }
      const cw = Math.round(clamp(w * 0.4, 280, 400));
      return { plot: { x: 0, y: 0, w: w - cw - 10, h }, col: { x: w - cw, y: 2, w: cw - 2, h: h - 4 } };
    }
    const plot = new Plot(surface, { x: [-7, 7], y: [-3, 3], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().plot });

    /* ---------- Zustand und Übergänge ---------- */
    let shownA = aEff();
    let lastFrame = performance.now();
    let dragging = 0;
    let lastN = p.n;
    const blend = new Tween(650, ease.inOutCubic);
    let blendFrom = p.n;
    const run = new Tween(RUN_N * RUN_STEP_MS, ease.linear);
    let runPending = false;
    const intro = new Tween(INTRO_MS, ease.linear);
    const swap = new Tween(450, ease.outCubic);
    /** Angezeigte Ränder des Gültigkeitsbereichs (gleiten weich zum Zielwert). */
    let shownBand: [number, number] | null = null;

    /** Angezeigter Grad (beim Durchlaufen) und Überblendung zwischen zwei Graden. */
    function shownPoly(x: number): number {
      const a = shownA;
      if (run.running) {
        const t = run.value * RUN_N;
        const k = Math.floor(t);
        const u = ease.inOutCubic(clamp((t - k) / 0.6, 0, 1));
        return lerp(taylor(fn(), a, k, x), taylor(fn(), a, Math.min(k + 1, NMAX), x), u);
      }
      if (blend.running) return lerp(taylor(fn(), a, blendFrom, x), taylor(fn(), a, p.n, x), blend.value);
      return taylor(fn(), a, p.n, x);
    }
    const shownN = () => (run.running ? Math.min(RUN_N, Math.round(run.value * RUN_N)) : p.n);
    /** Einstieg: 0 … 1 in Phasen (Graph von f zeichnet sich, dann wächst Tₙ von a aus, dann Beschriftungen). */
    const phase = (from: number, to: number) => (intro.running ? ease.outCubic(clamp((intro.t - from) / (to - from), 0, 1)) : 1);

    /* ---------- Gültigkeitsbereich (zwischengespeichert) ---------- */
    const bandCache = new Map<string, [number, number]>();
    function bandFor(n: number, a = aEff()): [number, number] {
      const k = `${key()}|${a.toFixed(3)}|${n}|${p.eps}`;
      let v = bandCache.get(k);
      if (!v) {
        const [lo, hi] = VIEW[key()].x;
        v = validInterval(fn(), a, n, eps(), lo, hi);
        if (bandCache.size > 600) bandCache.clear();
        bandCache.set(k, v);
      }
      return v;
    }

    /* ---------- Griffe ---------- */
    plot.addHandle({
      get: () => [shownA, fn().f(shownA)],
      set: (x) => {
        dragging = performance.now();
        ctx.set({ a: Math.round(clamp(x, fn().aMin, fn().aMax) * 10) / 10 });
      },
      axis: 'x',
      enabled: () => !ctx.locked && !run.running,
      color: () => col.a(),
    });
    plot.addHandle({
      get: () => [p.x, 0],
      set: (x) => {
        dragging = performance.now();
        ctx.set({ x: Math.round(clamp(x, -6, 6) * 10) / 10 });
      },
      axis: 'x',
      enabled: () => !ctx.locked && p.err && view() === 'approx',
      color: () => col.x(),
    });

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      ctx.readout('poly', `T${subDigits(p.n)}(x) = ${plain(polySrc(p.n, 6))}`);
      if (view() === 'approx') {
        const r = remainder(fn(), aEff(), p.n, p.x);
        ctx.readout('err', Number.isFinite(r) ? `f(${n2(p.x)}) − T${subDigits(p.n)}(${n2(p.x)}) ≈ ${small(r)}` : ctx.t('dom'));
      } else ctx.readout('err', null);
      if (view() === 'band') {
        const [l, r] = bandFor(p.n);
        ctx.readout('valid', r - l < 1e-9 ? ctx.t('none') : `${n2(l)} < x < ${n2(r)} (${ctx.t('width')} ${n2(r - l)}) für ε = ${fmt.num(eps(), 3)}`);
      } else ctx.readout('valid', null);
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
    /** Zerlegt einen Text in Zeilen, die höchstens maxW breit sind (Schrift wird dafür ggf. etwas kleiner). */
    function wrapLines(str: string, maxW: number, size: number, weight: number): { lines: string[]; size: number } {
      const g = surface.g;
      let s = size;
      g.font = font(weight, s);
      while (g.measureText(str).width > maxW && s > 10) {
        s -= 0.5;
        g.font = font(weight, s);
      }
      if (g.measureText(str).width <= maxW) return { lines: [str], size: s };
      const lines: string[] = [];
      let cur = '';
      for (const w of str.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          lines.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) lines.push(cur);
      return { lines, size: s };
    }
    /** Zeichnet einen ggf. umbrochenen Text ab Oberkante y; liefert die verbrauchte Höhe. */
    function para(str: string, x: number, y: number, maxW: number, size: number, color: string, weight = 600): number {
      const { lines, size: s } = wrapLines(str, maxW, size, weight);
      lines.forEach((ln, i) => text(surface.g, ln, x, y + s * 0.6 + i * (s + 3), { font: font(weight, s), color, align: 'left' }));
      return lines.length * (s + 3) + 2;
    }
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { f: col.f(), T: col.T(), a: col.a(), x: col.x(), c: col.conv(), b: col.band(), m: th().muted },
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
      g.globalAlpha *= 0.88;
      g.fillStyle = th().bg;
      roundRect(g, left - 4, base - box.asc - 2, box.w + 8, box.asc + box.desc + 4, 6);
      g.fill();
      g.globalAlpha /= 0.88;
      box.draw(g, left, base);
      g.restore();
    }
    /** Zeichnet `draw` nur innerhalb des Streifens [x0, x1] (Pixel) der Plotfläche. */
    function clipped(x0: number, x1: number, draw: () => void): void {
      const g = surface.g;
      const r = plot.rect;
      g.save();
      g.beginPath();
      g.rect(x0, r.y - 2, Math.max(0, x1 - x0), r.h + 4);
      g.clip();
      draw();
      g.restore();
    }
    function drawF(width = 3): void {
      const f = fn();
      if (key() === 'geo') {
        plot.fn(f.f, { color: col.f(), width, to: 1 - 1e-3 });
        plot.fn(f.f, { color: col.f(), width, from: 1 + 1e-3 });
      } else plot.fn(f.f, { color: col.f(), width, from: key() === 'ln' ? -1 + 1e-4 : undefined });
    }

    /* ---------- Plot ---------- */
    function drawPlot(): void {
      const g = surface.g;
      const theme = th();
      const v = VIEW[key()];
      plot.setRange(v.x, v.y);
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const f = fn();
      const a = shownA;
      const [ax] = plot.toPx(a, 0);
      const pF = phase(0, 0.45);
      const pT = phase(0.35, 0.85);
      const pL = phase(0.6, 1);
      const sw = swap.running ? swap.value : 1;

      // Konvergenzintervall (Ansichten Näherung und ε-Schlauch)
      const R = f.radius(a);
      if (p.err && Number.isFinite(R) && view() !== 'terms') {
        const x0 = plot.px(a - R);
        const x1 = plot.px(a + R);
        g.save();
        g.globalAlpha = pL;
        g.fillStyle = withAlpha(col.conv(), theme.dark ? 0.12 : 0.08);
        g.fillRect(Math.max(r.x, x0), r.y, Math.min(r.x + r.w, x1) - Math.max(r.x, x0), r.h);
        g.strokeStyle = withAlpha(col.conv(), 0.7);
        g.setLineDash([6, 5]);
        g.lineWidth = 1.5;
        g.beginPath();
        for (const xx of [x0, x1]) {
          if (xx > r.x && xx < r.x + r.w) {
            g.moveTo(xx, r.y);
            g.lineTo(xx, r.y + r.h);
          }
        }
        g.stroke();
        g.restore();
      }

      // ε-Schlauch um f und Gültigkeitsbereich
      if (view() === 'band') {
        const e = eps();
        g.save();
        g.globalAlpha = sw * pL;
        // Schlauch: mindestens 3 px breit, damit er auch bei kleinem ε sichtbar bleibt
        const minHalf = 1.5 / plot.scale.y;
        const half = Math.max(e, minHalf);
        const xs0 = key() === 'ln' ? -1 + 1e-3 : v.x[0];
        g.fillStyle = withAlpha(col.band(), theme.dark ? 0.22 : 0.16);
        const pieces: [number, number][] = key() === 'geo' ? [[v.x[0], 1 - 1e-2], [1 + 1e-2, v.x[1]]] : [[xs0, v.x[1]]];
        for (const [from, to] of pieces) {
          g.beginPath();
          const N = 220;
          for (let i = 0; i <= N; i++) {
            const xx = from + ((to - from) * i) / N;
            const [px, py] = plot.toPx(xx, f.f(xx) + half);
            if (i === 0) g.moveTo(px, clamp(py, r.y - 50, r.y + r.h + 50));
            else g.lineTo(px, clamp(py, r.y - 50, r.y + r.h + 50));
          }
          for (let i = N; i >= 0; i--) {
            const xx = from + ((to - from) * i) / N;
            const [px, py] = plot.toPx(xx, f.f(xx) - half);
            g.lineTo(px, clamp(py, r.y - 50, r.y + r.h + 50));
          }
          g.closePath();
          g.fill();
        }
        // Gültigkeitsbereich als Streifen und auf der x-Achse
        if (shownBand && shownBand[1] - shownBand[0] > 1e-6) {
          const [l, rr] = shownBand;
          const x0 = plot.px(l);
          const x1 = plot.px(rr);
          g.fillStyle = withAlpha(col.band(), theme.dark ? 0.1 : 0.07);
          g.fillRect(x0, r.y, x1 - x0, r.h);
          const y0 = plot.py(0);
          const yb = clamp(y0, r.y + 8, r.y + r.h - 8);
          g.strokeStyle = col.band();
          g.lineWidth = 6;
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(x0, yb);
          g.lineTo(x1, yb);
          g.stroke();
          for (const xx of [x0, x1]) {
            g.lineWidth = 2;
            g.setLineDash([4, 4]);
            g.beginPath();
            g.moveTo(xx, r.y);
            g.lineTo(xx, r.y + r.h);
            g.stroke();
            g.setLineDash([]);
          }
          if (pL > 0.5) {
            tag(x0 - 4, yb - 16, `\\c{b}{${n2(l)}}`, col.band(), 'right', F(12.5, 11.5));
            tag(x1 + 4, yb - 16, `\\c{b}{${n2(rr)}}`, col.band(), 'left', F(12.5, 11.5));
          }
        }
        g.restore();
      }

      // f: zeichnet sich beim Einstieg von links nach rechts
      clipped(r.x, r.x + r.w * pF, () => {
        g.save();
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.f(), '#ffffff', 0.5, 0.6);
        g.shadowBlur = 5;
        drawF();
        g.restore();
      });

      // Tₙ (und in der Ansicht „Summanden“ die Vorgänger T₀ … Tₙ₋₁): wächst beim Einstieg von a aus
      const spread = Math.max(ax - r.x, r.x + r.w - ax) * pT;
      clipped(ax - spread, ax + spread, () => {
        if (view() === 'terms') {
          const n = shownN();
          g.save();
          g.globalAlpha = sw;
          for (let k = 0; k < n; k++) {
            const t = n <= 1 ? 1 : k / (n - 1);
            plot.fn((x) => taylor(f, a, k, x), { color: withAlpha(mixColor(col.a(), col.T(), t), 0.25 + 0.35 * t), width: 1.4 });
          }
          // neuester Summand cₙ(x − a)ⁿ als eigene Kurve; wächst bei Gradwechsel ein
          const c = coefficients(f, a, n)[n]!;
          const grow = blend.running && p.n > blendFrom ? blend.value : 1;
          if (c !== 0) plot.fn((x) => grow * c * (x - a) ** n, { color: col.a(), width: 2.2, dash: [2, 4] });
          g.restore();
        }
        g.save();
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)';
        g.shadowBlur = 4;
        plot.fn(shownPoly, { color: col.T(), width: 3, dash: [9, 5] });
        g.restore();
      });

      // Fehler an der Prüfstelle
      if (p.err && view() === 'approx') {
        g.save();
        g.globalAlpha = sw * pL;
        const x = p.x;
        const yf = f.f(x);
        const yt = shownPoly(x);
        const [px] = plot.toPx(x, 0);
        if (Number.isFinite(yf)) {
          const pf = clamp(plot.py(yf), r.y - 4, r.y + r.h + 4);
          const pt = clamp(plot.py(yt), r.y - 4, r.y + r.h + 4);
          g.strokeStyle = col.x();
          g.lineWidth = 3;
          g.beginPath();
          g.moveTo(px, pf);
          g.lineTo(px, pt);
          g.stroke();
          plot.point(x, yf, { color: col.f(), radius: 4 });
          if (Number.isFinite(yt) && Math.abs(yt) < 1e6) plot.point(x, yt, { color: col.T(), radius: 4 });
        }
        plot.segment([x, 0], [x, Number.isFinite(yf) ? yf : 0], { color: withAlpha(col.x(), 0.5), width: 1.2, dash: [3, 3] });
        plot.point(x, 0, { color: col.x(), radius: 6.5 });
        tag(px + 8, plot.py(0) + 14, '\\c{x}{x}', col.x(), 'left', F(13, 12));
        g.restore();
      }

      // Entwicklungsstelle
      g.save();
      g.globalAlpha = Math.max(pF, 0.001);
      plot.segment([a, 0], [a, f.f(a)], { color: withAlpha(col.a(), 0.6), width: 1.4, dash: [4, 4] });
      const pop = intro.running ? ease.outBack(phase(0.3, 0.55)) : 1;
      plot.point(a, f.f(a), { color: col.a(), radius: 7 * pop });
      g.restore();
      const [axp, ayp] = plot.toPx(a, f.f(a));
      g.save();
      g.globalAlpha = pL;
      tag(axp + 10, ayp - 16, `\\c{a}{a = ${fmt.num(a, 1)}}`, col.a(), 'left', F(13, 12));
      // Legende
      tag(r.x + 8, r.y + 14, `\\c{f}{f(x) = ${v.name}}`, col.f(), 'left', F(13.5, 12.5));
      tag(r.x + 8, r.y + 40, `\\c{T}{T_{${shownN()}}(x)}`, col.T(), 'left', F(13.5, 12.5));
      if (view() === 'terms' && shownN() > 0 && p.show) {
        const c = coefficients(f, a, shownN())[shownN()]!;
        if (c !== 0) tag(r.x + 8, r.y + 66, `\\c{a}{${ctx.t('newTerm')}: ${termSrc(c, shownN(), a, true)}}`, col.a(), 'left', F(12.5, 11.5));
      }
      if (view() === 'band') tag(r.x + 8, r.y + 66, `\\c{b}{f ± ε,  ε = ${fmt.num(eps(), 3)}}`, col.band(), 'left', F(12.5, 11.5));
      g.restore();
      plot.end();
    }

    /* ---------- Karten ---------- */
    function polyCard(R: Rect): number {
      const g = surface.g;
      const pad = F(14, 12);
      const maxW = R.w - 2 * pad;
      const fs = F(15, 13.5);
      const rows: string[] = ['T_n(x) = \\c{m}{\\t{Σ}} \\f{f^{(k)}(a)}{k!} · (x − a)^k'];
      const n = shownN();
      if (p.show) {
        let m = n > 6 ? 4 : 6;
        let src = `\\c{T}{T_{${n}}(x)} = ${polySrc(n, m)}`;
        while (m > 2 && formula(g, src, fstyle(fs)).w > maxW * 1.2) {
          m--;
          src = `\\c{T}{T_{${n}}(x)} = ${polySrc(n, m)}`;
        }
        rows.push(src);
      } else rows.push(`\\c{T}{T_{${n}}(x)} = ?`);
      const boxes = rows.map((src) => fitFormula(src, maxW, fs));
      const h = 30 + boxes.reduce((s, b) => s + b.asc + b.desc + 10, 0) + 2;
      if (R.h <= 0) return h;
      card({ ...R, h }, col.T(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('polyT'), col.T());
      let y = R.y + 30;
      for (const b of boxes) {
        b.draw(g, R.x + pad, y + b.asc);
        y += b.asc + b.desc + 10;
      }
      return h;
    }

    function errCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('errT'));
      const f = fn();
      const a = aEff();
      const x = p.x;
      const n = shownN();
      const yf = f.f(x);
      const yt = shownPoly(x);
      const fs = F(13.5, 12.5);
      let y = R.y + 30;
      const maxW = R.w - 2 * pad;
      const line = (src: string, color = theme.text) => {
        const b = fitFormula(src, maxW, fs, color);
        b.draw(g, R.x + pad, y + b.asc);
        y += b.asc + b.desc + 6;
      };
      if (!Number.isFinite(yf)) line(`f(${n2(x)}) \\t{${ctx.t('dom')}}`, theme.muted);
      else {
        // Ohne Koeffizienten (Aufgabenmodus) keine Werte verraten, die gerechnet werden sollen
        const hide = !p.show;
        line(`\\c{f}{f(${n2(x)}) ≈ ${hide ? '?' : small(yf)}},   \\c{T}{T_{${n}}(${n2(x)}) ≈ ${hide ? '?' : small(yt)}}`);
        line(`\\c{x}{|f(x) − T_{${n}}(x)| ≈ ${hide ? '?' : small(Math.abs(yf - yt))}}`);
        const lb = hide ? null : lagrangeBound(key(), a, p.n, x);
        if (hide) y += 4;
        else if (lb !== null) {
          const M = key() === 'exp' ? `e^{${fmt.num(Math.max(a, x), 1)}}` : '1';
          line(`\\c{m}{\\t{${ctx.t('lagrange')}}: ≤ ${M} · \\f{|x − a|^{${p.n + 1}}}{${p.n + 1}!} ≈ ${small(lb)}}`, theme.muted);
        } else {
          y += para(ctx.t('lagrangeNone'), R.x + pad, y, maxW, F(11.5, 10.5), theme.muted);
        }
      }
      const Rr = f.radius(a);
      const inside = !Number.isFinite(Rr) || Math.abs(x - a) < Rr;
      const conv = Number.isFinite(Rr) ? tr('conv', { r: fmt.num(Rr, 1) }) : ctx.t('convAll');
      y += para(conv, R.x + pad, y, maxW, F(12, 11), col.conv()) + 2;
      if (!inside) y += para(ctx.t('outside'), R.x + pad, y, maxW, F(12, 11), col.x(), 700) + 2;
      // Fehlerdiagramm (logarithmisch); Balken wachsen beim Einstieg
      const top = y + 28;
      const bottom = R.y + R.h - 22;
      if (bottom - top < 50 || !Number.isFinite(yf) || !p.show) return;
      text(g, ctx.t('chart'), R.x + pad, top - 8, { font: font(600, F(11.5, 10.5)), color: theme.muted, align: 'left' });
      const errs = Array.from({ length: NMAX + 1 }, (_, k) => Math.abs(remainder(f, a, k, x)));
      const lg = errs.map((e) => (e > 0 ? Math.log10(e) : -16));
      const hi = Math.max(1, Math.ceil(Math.max(...lg)));
      const lo = Math.min(-6, Math.floor(Math.min(...lg)));
      const x0 = R.x + pad + 30;
      const x1 = R.x + R.w - pad;
      const bw = (x1 - x0) / (NMAX + 1);
      const Y = (v: number) => lerp(bottom, top, (v - lo) / (hi - lo));
      g.strokeStyle = theme.gridMinor;
      g.lineWidth = 1;
      for (let e = lo; e <= hi; e += Math.max(1, Math.round((hi - lo) / 4))) {
        g.beginPath();
        g.moveTo(x0, Y(e));
        g.lineTo(x1, Y(e));
        g.stroke();
        text(g, `10${sup(String(e))}`, x0 - 4, Y(e), { font: font(600, 9.5), color: theme.muted, align: 'right' });
      }
      const grow = phase(0.5, 1);
      lg.forEach((v, k) => {
        const full = Y(Math.max(lo, v));
        const yy = lerp(bottom, full, grow);
        const on = k === n;
        g.fillStyle = on ? col.x() : withAlpha(col.x(), 0.35);
        roundRect(g, x0 + k * bw + 1.5, yy, bw - 3, bottom - yy, Math.min(3, (bw - 3) / 2));
        g.fill();
        if (k % 5 === 0 || on) text(g, String(k), x0 + (k + 0.5) * bw, bottom + 9, { font: font(on ? 700 : 600, 10), color: on ? col.x() : theme.muted });
      });
    }

    /** Tabelle k | f⁽ᵏ⁾(a) | k! | cₖ – zeigt, woher die Koeffizienten kommen. */
    function coefCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R, col.a(), 0.02);
      title(R.x + pad, R.y + 16, ctx.t('coefT'), col.a());
      const f = fn();
      const a = aEff();
      const n = shownN();
      const c = coefficients(f, a, n);
      const fs = F(13, 12);
      const rowH = F(26, 23);
      const cols = [R.x + pad, R.x + pad + R.w * 0.13, R.x + pad + R.w * 0.45, R.x + pad + R.w * 0.66];
      let y = R.y + 40;
      const head = ['k', 'f^{(k)}(a)', 'k!', 'c_k = \\f{f^{(k)}(a)}{k!}'];
      head.forEach((s, i) => {
        const b = fitFormula(`\\c{m}{${s}}`, R.w * 0.32, F(12, 11));
        b.draw(g, cols[i]!, y + b.asc / 2);
      });
      y += F(22, 20);
      g.strokeStyle = theme.dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(R.x + pad, y - 8);
      g.lineTo(R.x + R.w - pad, y - 8);
      g.stroke();
      // Platz für die Zeilen; bei vielen Graden nur die letzten zeigen
      const foot = wrapLines(tr('match', { n }), R.w - 2 * pad, F(11.5, 10.5), 600);
      const footer = 22 + foot.lines.length * (foot.size + 3);
      const maxRows = Math.max(2, Math.floor((R.y + R.h - footer - y) / rowH));
      const first = Math.max(0, n + 1 - maxRows);
      if (first > 0) {
        text(g, '⋮', cols[0]! + 4, y + 4, { font: font(700, 14), color: theme.muted, align: 'left' });
        y += rowH * 0.7;
      }
      for (let k = Math.max(first, first > 0 ? first + 1 : 0); k <= n; k++) {
        const newest = k === n;
        const fade = newest && blend.running && p.n > blendFrom ? blend.value : 1;
        g.save();
        g.globalAlpha = fade;
        if (newest) {
          g.fillStyle = withAlpha(col.a(), theme.dark ? 0.18 : 0.1);
          roundRect(g, R.x + pad - 6, y - rowH / 2 + 2, R.w - 2 * pad + 12, rowH - 2, 7);
          g.fill();
        }
        const d = f.d(k, a);
        const dz = Math.abs(d) < 1e-12;
        const hideRow = !p.show;
        const cells = [
          String(k),
          hideRow ? '?' : dz ? '0' : small(d),
          factorial(k) < 1e6 ? String(factorial(k)) : small(factorial(k)),
          hideRow ? '?' : c[k] === 0 ? '0' : termSrc(c[k]!, k, 0, true).replace(/ · x(\^\d+)?$|x(\^\d+)?$/, '') || '1',
        ];
        cells.forEach((s, i) => {
          const color = i === 3 ? (dz ? theme.muted : col.T()) : dz && i === 1 ? theme.muted : theme.text;
          const b = fitFormula(s, R.w * (i === 3 ? 0.3 : 0.28), fs, color, newest ? 700 : 600);
          b.draw(g, cols[i]!, y + (b.asc - b.desc) / 2);
        });
        g.restore();
        y += rowH;
      }
      para(tr('match', { n }), R.x + pad, R.y + R.h - footer + 8, R.w - 2 * pad, F(11.5, 10.5), theme.muted);
    }

    /** Gültigkeitsbereich: Ränder, Breite und Breite für alle Grade. */
    function bandCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R, col.band(), 0.02);
      title(R.x + pad, R.y + 16, ctx.t('bandT'), col.band());
      const fs = F(14, 12.5);
      let y = R.y + 34;
      const maxW = R.w - 2 * pad;
      const n = p.n;
      const [l, r] = shownBand ?? bandFor(n);
      const line = (src: string, color = theme.text) => {
        const b = fitFormula(src, maxW, fs, color);
        b.draw(g, R.x + pad, y + b.asc);
        y += b.asc + b.desc + 7;
      };
      if (r - l < 1e-6) line(`\\c{x}{\\t{${ctx.t('none')}}}`);
      else {
        line(`\\c{b}{${n2(l)} < x < ${n2(r)}}`);
        line(`\\t{${ctx.t('width')}}: ${n2(r - l)}   (n = ${n}, ε = ${fmt.num(eps(), 3)})`, theme.muted);
        const [vx0, vx1] = VIEW[key()].x;
        if (Math.abs(l - vx0) < 1e-6 || Math.abs(r - vx1) < 1e-6) {
          y += para(ctx.t('capped'), R.x + pad, y, maxW, F(11, 10), theme.muted);
        }
      }
      const Rr = fn().radius(aEff());
      if (Number.isFinite(Rr)) {
        y += para(`${tr('conv', { r: fmt.num(Rr, 1) })}. ${ctx.t('convLimit')}`, R.x + pad, y, maxW, F(11.5, 10.5), col.conv()) + 4;
      }
      // Breite für alle Grade
      const top = y + 26;
      const bottom = R.y + R.h - 22;
      if (bottom - top < 50) return;
      text(g, ctx.t('widthChart'), R.x + pad, top - 10, { font: font(600, F(11.5, 10.5)), color: theme.muted, align: 'left' });
      const widths = Array.from({ length: NMAX + 1 }, (_, k) => {
        const [a0, a1] = bandFor(k);
        return a1 - a0;
      });
      const [vx0, vx1] = VIEW[key()].x;
      const maxW2 = vx1 - vx0;
      const x0 = R.x + pad + 26;
      const x1 = R.x + R.w - pad;
      const bw = (x1 - x0) / (NMAX + 1);
      const Y = (v: number) => lerp(bottom, top, v / maxW2);
      g.strokeStyle = theme.gridMinor;
      g.lineWidth = 1;
      for (const v of [0, maxW2 / 2, maxW2]) {
        g.beginPath();
        g.moveTo(x0, Y(v));
        g.lineTo(x1, Y(v));
        g.stroke();
        text(g, fmt.num(v, 0), x0 - 4, Y(v), { font: font(600, 9.5), color: theme.muted, align: 'right' });
      }
      if (Number.isFinite(Rr)) {
        const yc = Y(Math.min(2 * Rr, maxW2));
        g.strokeStyle = col.conv();
        g.setLineDash([5, 4]);
        g.beginPath();
        g.moveTo(x0, yc);
        g.lineTo(x1, yc);
        g.stroke();
        g.setLineDash([]);
      }
      const grow = phase(0.5, 1) * (swap.running ? swap.value : 1);
      widths.forEach((w, k) => {
        const yy = lerp(bottom, Y(w), grow);
        const on = k === n;
        g.fillStyle = on ? col.band() : withAlpha(col.band(), 0.35);
        roundRect(g, x0 + k * bw + 1.5, yy, bw - 3, Math.max(0, bottom - yy), Math.min(3, (bw - 3) / 2));
        g.fill();
        if (k % 5 === 0 || on) text(g, String(k), x0 + (k + 0.5) * bw, bottom + 9, { font: font(on ? 700 : 600, 10), color: on ? col.band() : theme.muted });
      });
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (dragging && now - dragging > 250) dragging = 0;
      let moving = false;
      const goalA = aEff();
      if (dragging || reduced || Math.abs(goalA - shownA) < 1e-3) shownA = goalA;
      else {
        shownA += (goalA - shownA) * (1 - Math.exp(-dt * 9));
        moving = true;
      }
      if (view() === 'band') {
        const goal = bandFor(p.n);
        if (!shownBand || reduced || dragging) shownBand = goal;
        else {
          const k = 1 - Math.exp(-dt * 8);
          const next: [number, number] = [shownBand[0] + (goal[0] - shownBand[0]) * k, shownBand[1] + (goal[1] - shownBand[1]) * k];
          if (Math.abs(next[0] - goal[0]) + Math.abs(next[1] - goal[1]) < 1e-3) shownBand = goal;
          else {
            shownBand = next;
            moving = true;
          }
        }
      }
      surface.begin();
      plot.resize();
      drawPlot();
      const C = regions().col;
      const gap = F(10, 8);
      const h1 = polyCard({ ...C, h: 0 });
      polyCard({ x: C.x, y: C.y, w: C.w, h: h1 });
      const rest = { x: C.x, y: C.y + h1 + gap, w: C.w, h: Math.min(C.h - h1 - gap, wideLayout() ? C.h : 300) };
      if (rest.h > 90) {
        const g = surface.g;
        g.save();
        g.globalAlpha = (swap.running ? swap.value : 1) * phase(0.3, 0.8);
        if (swap.running) g.translate(0, (1 - swap.value) * 12);
        if (view() === 'approx' && p.err) errCard(rest);
        else if (view() === 'terms') coefCard(rest);
        else if (view() === 'band') bandCard(rest);
        g.restore();
      }
      if (moving || dragging || blend.running || run.running || intro.running || swap.running) ctx.requestRender();
      else if (runPending) {
        runPending = false;
        lastN = RUN_N;
        ctx.set({ n: RUN_N });
      }
    }

    return {
      update(changed, source) {
        if (changed.has('fn') && source === 'input' && Math.abs(aEff() - p.a) > 1e-9) ctx.set({ a: aEff() });
        if (source === 'init') {
          intro.play();
          lastN = p.n;
        } else {
          if (changed.has('fn')) {
            shownBand = null;
            shownA = aEff();
            intro.play(1100);
          }
          if (changed.has('view')) {
            shownBand = null;
            swap.play();
          }
          if (changed.has('eps')) shownBand = shownBand ?? null;
          if (changed.has('n') && !run.running && p.n !== lastN) {
            blendFrom = lastN;
            blend.play();
          }
        }
        lastN = p.n;
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        if (id === 'up') {
          if (p.n < NMAX) ctx.set({ n: p.n + 1 });
        } else if (id === 'down') {
          if (p.n > 0) ctx.set({ n: p.n - 1 });
        } else if (id === 'run') {
          blend.finish();
          run.play(reduced ? 1 : RUN_N * RUN_STEP_MS);
          runPending = true;
        }
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
