import { defineSimulation, ease, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { exactAt, heronSteps, isPerfectSquare, nestInterval } from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'heron' | 'nest';
type Px = [number, number];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const HERON_MAX = 6;
const NEST_MAX = 7;

/**
 * Quadratwurzeln: Heron-Verfahren als Folge flächengleicher Rechtecke, die
 * sich animiert zum Quadrat formen (Mittelwert der Seiten), und
 * Intervallschachtelung auf einem Zahlenstrahl mit Lupe, die von Stelle zu
 * Stelle zehnfach vergrößert. Tabellen zeigen, wie schnell die Stellen
 * stimmen.
 */
export default defineSimulation({
  id: 'quadratwurzel',
  layout: { aspect: 1.7, aspectNarrow: 0.56 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Verfahren', 'Method'),
      options: [
        { value: 'heron', label: L('Heron-Verfahren (Rechtecke)', 'Heron’s method (rectangles)') },
        { value: 'nest', label: L('Intervallschachtelung', 'Nested intervals') },
      ],
      default: 'heron',
    },
    { key: 'a', type: 'number', label: L('Radikand a (Fläche)', 'Radicand a (area)'), min: 1, max: 200, step: 1, default: 2 },
    { key: 'x0', type: 'number', label: L('Startlänge x₀', 'Starting length x₀'), min: 1, max: 20, step: 0.5, default: 2, visibleIf: (v) => v.mode === 'heron', help: L('Das Start-Rechteck hat die Seiten x₀ und a/x₀.', 'The starting rectangle has the sides x₀ and a/x₀.') },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Einheitsquadrate', 'Unit squares'), default: true, visibleIf: (v) => v.mode === 'heron' },
  ],
  actions: [
    { id: 'next', label: L('Nächster Schritt', 'Next step'), primary: true },
    { id: 'play', label: L('Alles abspielen', 'Play all') },
    { id: 'restart', label: L('Von vorn', 'Start again') },
  ],
  readouts: [
    { key: 'now', label: L('Aktueller Schritt', 'Current step') },
    { key: 'root', label: L('Wurzel', 'Root'), spoiler: true },
  ],
  presets: [
    { id: 'two', label: L('√2 mit Heron', '√2 with Heron'), values: {} },
    { id: 'ten', label: L('√10, Start bei 10', '√10, start at 10'), values: { a: 10, x0: 10 } },
    { id: 'square', label: L('Quadratzahl: √49', 'Perfect square: √49'), values: { a: 49, x0: 14 } },
    { id: 'nest2', label: L('√2 einschachteln', 'Nesting √2'), values: { mode: 'nest', a: 2 } },
    { id: 'nest3', label: L('√3 einschachteln', 'Nesting √3'), values: { mode: 'nest', a: 3 } },
    { id: 'nest25', label: L('Quadratzahl: √25', 'Perfect square: √25'), values: { mode: 'nest', a: 25 } },
  ],
  strings: {
    de: {
      canvas: 'Heron-Verfahren: Rechtecke mit gleichem Flächeninhalt werden Schritt für Schritt quadratischer, bis ihre Seitenlänge der Quadratwurzel entspricht; Intervallschachtelung: Ein Zahlenstrahl wird mit jeder Stelle zehnfach vergrößert. Daneben eine Tabelle der Schritte.',
      tabH: 'Heron-Verfahren',
      tabN: 'Intervallschachtelung',
      ideaT: 'Idee',
      ideaH: 'Ein Rechteck mit Fläche a soll ein Quadrat werden. Neue Länge = Mittelwert aus Länge und Breite; die Breite ergibt sich aus a : Länge. Die Fläche bleibt immer a.',
      ideaN: '√a liegt zwischen zwei Zahlen, deren Quadrate a einschließen. Mit jeder weiteren Stelle wird das Intervall zehnmal kürzer.',
      irrT: 'Ist √2 ein Bruch?',
      irr: 'Nein: √2 ist irrational. Seine Dezimaldarstellung bricht nie ab und wird nie periodisch – jede Intervallschachtelung geht unendlich weiter.',
      exactT: 'Genau getroffen',
      exact: '√{a} = {r} ist eine endliche Dezimalzahl: Das Intervall schrumpft auf einen Punkt.',
      perfect: '{a} ist eine Quadratzahl: √{a} = {r}.',
      len: 'Länge',
      wid: 'Breite',
      area: 'A = {a}',
      step0: 'Start: Rechteck {x} × {y}',
      stepN: 'Schritt {n}: x = ({x} + {y}) : 2 = {r}',
      nestStep: '{lo} < √{a} < {hi}, weil {lo2} < {a} < {hi2}',
      nestExact: '√{a} = {lo}, weil {lo}² = {a}',
      digits: 'richtige Stellen',
      now: 'Schritt {n}',
      rootRead: '√{a} ≈ {r}',
      startHint: 'Mit „Nächster Schritt“ wird das Rechteck quadratischer.',
      zoom: 'Lupe: zehnfach vergrößert',
    },
    en: {
      canvas: 'Heron’s method: rectangles of equal area become more and more square until their side equals the square root; nested intervals: a number line is magnified tenfold with every digit. Next to it a table of the steps.',
      tabH: 'Heron’s method',
      tabN: 'Nested intervals',
      ideaT: 'Idea',
      ideaH: 'A rectangle with area a should become a square. New length = mean of length and width; the width is a : length. The area always stays a.',
      ideaN: '√a lies between two numbers whose squares enclose a. With every further digit the interval becomes ten times shorter.',
      irrT: 'Is √2 a fraction?',
      irr: 'No: √2 is irrational. Its decimal expansion never ends and never repeats – any nesting goes on forever.',
      exactT: 'Hit exactly',
      exact: '√{a} = {r} is a terminating decimal: the interval shrinks to a point.',
      perfect: '{a} is a perfect square: √{a} = {r}.',
      len: 'length',
      wid: 'width',
      area: 'A = {a}',
      step0: 'Start: rectangle {x} × {y}',
      stepN: 'Step {n}: x = ({x} + {y}) : 2 = {r}',
      nestStep: '{lo} < √{a} < {hi}, because {lo2} < {a} < {hi2}',
      nestExact: '√{a} = {lo}, because {lo}² = {a}',
      digits: 'correct digits',
      now: 'Step {n}',
      rootRead: '√{a} ≈ {r}',
      startHint: 'Press “Next step” to make the rectangle more square.',
      zoom: 'Magnifier: ×10',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    const mode = () => p.mode as Mode;
    const wideLayout = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const F = (w: number, n: number) => (surface.width >= 640 ? w : n);
    const font = (weight: number, size: number) => `${weight} ${size}px ${th().font}`;

    const col = {
      x: () => th().series[0]!,
      y: () => th().series[3]!,
      sq: () => th().series[2]!,
      rt: () => th().series[4]!,
      lo: () => th().series[0]!,
      hi: () => th().series[1]!,
    };

    /* ---------- Zustand ---------- */
    let step = 0;
    const move = new Tween(1100, ease.inOutCubic);
    let from = 0;
    let autoPlay = false;
    let lastStepEnd = 0;
    const maxStep = () => (mode() === 'heron' ? HERON_MAX : NEST_MAX);
    const steps = () => heronSteps(p.a, p.x0, HERON_MAX);
    const root = () => Math.sqrt(p.a);
    /** Angezeigte Werte (gleiten bei Änderungen von a und x₀). */
    let shown = { a: p.a, x0: p.x0 };
    let lastFrame = performance.now();
    let intro = reduced ? 1 : 0;

    function nextStep(): void {
      if (step >= maxStep() || move.running) return;
      from = step;
      step++;
      move.play();
      updateReadouts();
      ctx.requestRender();
    }
    function restart(): void {
      autoPlay = false;
      from = step;
      step = 0;
      move.play();
      updateReadouts();
      ctx.requestRender();
    }

    /* ---------- Aufteilung ---------- */
    type Lay = { stage: Rect; col: Rect };
    function layout(): Lay {
      const w = surface.width;
      const h = surface.height;
      const gap = F(12, 8);
      if (wideLayout()) {
        const cw = Math.round(clamp(w * 0.38, 250, 360));
        return { stage: { x: 2, y: 2, w: w - cw - gap - 2, h: h - 4 }, col: { x: w - cw, y: 2, w: cw - 2, h: h - 4 } };
      }
      const sh = Math.round(clamp(h * 0.48, 220, 340));
      return { stage: { x: 2, y: 2, w: w - 4, h: sh }, col: { x: 2, y: sh + gap, w: w - 4, h: h - sh - gap - 2 } };
    }

    /* ---------- Zahlen ---------- */
    const dec = (v: number, d: number) => fmt.fixed(v, d);
    /** Anzahl übereinstimmender Nachkommastellen von v mit √a (höchstens 9). */
    function goodDigits(v: number): number {
      const r = root();
      for (let d = 9; d >= 0; d--) if (Math.floor(v * 10 ** d) === Math.floor(r * 10 ** d) && Math.abs(v - r) < 10 ** -d) return d;
      return -1;
    }

    function updateReadouts(): void {
      if (mode() === 'heron') {
        const s = steps();
        if (step === 0) ctx.readout('now', tr('step0', { x: fmt.num(s[0]!.x, 4), y: fmt.num(s[0]!.y, 4) }));
        else ctx.readout('now', tr('stepN', { n: step, x: fmt.num(s[step - 1]!.x, 6), y: fmt.num(s[step - 1]!.y, 6), r: fmt.num(s[step]!.x, 9) }));
      } else {
        const [lo, hi] = nestInterval(p.a, step);
        if (exactAt(p.a, step)) ctx.readout('now', tr('nestExact', { a: p.a, lo: fmt.num(lo, step) }));
        else ctx.readout('now', tr('nestStep', { a: p.a, lo: dec(lo, step), hi: dec(hi, step), lo2: fmt.num(lo * lo, 2 * step), hi2: fmt.num(hi * hi, 2 * step) }));
      }
      ctx.readout('root', tr('rootRead', { a: p.a, r: fmt.num(root(), 9) }));
      ctx.setAction('next', { enabled: !ctx.locked && step < maxStep() });
      ctx.setAction('play', { enabled: !ctx.locked });
      ctx.setAction('restart', { enabled: !ctx.locked && step > 0 });
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
    function halo(str: string, x: number, y: number, f: string, color: string, align: CanvasTextAlign = 'center'): void {
      const g = surface.g;
      g.save();
      g.font = f;
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      g.lineWidth = 4;
      g.strokeStyle = th().bg;
      g.strokeText(str, x, y);
      g.fillStyle = color;
      g.fillText(str, x, y);
      g.restore();
    }
    function textSpecH(w: number, body: string): number {
      return F(31, 28) + wrap(body, w - 2 * F(14, 12), font(500, F(12.5, 12))).length * F(17, 16) + 8;
    }
    function textCard(R: Rect, head: string, body: string, accent?: string): void {
      const pad = F(14, 12);
      const f = font(500, F(12.5, 12));
      card(R, accent, accent ? 0.04 : 0);
      title(R.x + pad, R.y + 16, head, accent ?? th().muted);
      wrap(body, R.w - 2 * pad, f).forEach((row, i) => text(surface.g, row, R.x + pad, R.y + F(31, 28) + F(17, 16) * (i + 0.5), { font: f, color: th().text, align: 'left' }));
    }

    /* ---------- Heron ---------- */
    function drawHeron(R: Rect): void {
      const g = surface.g;
      const theme = th();
      card(R);
      const s = heronSteps(shown.a, shown.x0, HERON_MAX);
      const t = move.running ? move.value : 1;
      // Länge geometrisch interpolieren, Breite = a / Länge (Fläche bleibt a)
      const xa = s[from]!.x;
      const xb = s[step]!.x;
      const x = Math.exp(lerp(Math.log(xa), Math.log(xb), t));
      const y = shown.a / x;
      // Maßstab nach dem aktuellen (und vorigen) Rechteck, weich nachgeführt
      const rootA = Math.sqrt(shown.a);
      const maxW = Math.max(s[from]!.x, s[step]!.x, rootA);
      const maxH = Math.max(s[from]!.y, s[step]!.y, rootA);
      const pad = F(46, 34);
      const scGoal = Math.min((R.w - pad * 2) / maxW, (R.h - pad * 2 - 10) / maxH);
      heronScale = heronScale <= 0 || reduced ? scGoal : Math.exp(lerp(Math.log(heronScale), Math.log(scGoal), frameK));
      if (Math.abs(heronScale - scGoal) > 0.01 * scGoal) scaleMoving = true;
      const sc = heronScale;
      const ox = R.x + pad + (R.w - 2 * pad - maxW * sc) / 2;
      const oy = R.y + R.h - pad + (-(R.h - 2 * pad - maxH * sc) / 2) + 6;
      const P = (u: number, v: number): Px => [ox + u * sc, oy - v * sc];
      // Zielquadrat
      const r = Math.sqrt(shown.a);
      const [qx, qy] = P(0, r);
      g.save();
      g.setLineDash([6, 5]);
      g.strokeStyle = withAlpha(col.sq(), 0.85);
      g.lineWidth = 2;
      g.strokeRect(qx, qy, r * sc, r * sc);
      g.restore();
      // frühere Rechtecke als zarte Umrisse
      for (let i = 0; i < Math.min(step, s.length); i++) {
        const q = s[i]!;
        const [a0, b0] = P(0, q.y);
        g.save();
        g.strokeStyle = withAlpha(theme.text, 0.18);
        g.lineWidth = 1.2;
        g.strokeRect(a0, b0, q.x * sc, q.y * sc);
        g.restore();
      }
      // aktuelles Rechteck
      const [rx, ry] = P(0, y);
      const rw = x * sc * Math.min(1, intro * 1.5);
      const rh = y * sc;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.18)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 4;
      const grad = g.createLinearGradient(rx, ry, rx + rw, ry + rh);
      grad.addColorStop(0, withAlpha(col.x(), theme.dark ? 0.42 : 0.28));
      grad.addColorStop(1, withAlpha(col.y(), theme.dark ? 0.42 : 0.28));
      g.fillStyle = grad;
      g.fillRect(rx, ry, rw, rh);
      g.restore();
      // Einheitsquadrate (nur sinnvoll, wenn groß genug)
      if (p.grid && sc >= 9) {
        g.save();
        g.beginPath();
        g.rect(rx, ry, rw, rh);
        g.clip();
        g.strokeStyle = withAlpha(theme.text, 0.18);
        g.lineWidth = 1;
        g.beginPath();
        for (let u = 1; u < x; u++) {
          g.moveTo(ox + u * sc, ry);
          g.lineTo(ox + u * sc, ry + rh);
        }
        for (let v = 1; v < y; v++) {
          g.moveTo(rx, oy - v * sc);
          g.lineTo(rx + rw, oy - v * sc);
        }
        g.stroke();
        g.restore();
      }
      g.strokeStyle = theme.text;
      g.lineWidth = 2.4;
      g.strokeRect(rx, ry, rw, rh);
      // Seiten beschriften
      const lf = font(700, F(13.5, 12.5));
      const d = s[step] && !move.running ? 4 : 3;
      halo(`x = ${fmt.num(x, d)}`, rx + rw / 2, oy + 16, lf, col.x());
      g.font = lf;
      const yl = `${ctx.lang === 'de' ? 'a : x' : 'a : x'} = ${fmt.num(y, d)}`;
      const ylw = g.measureText(yl).width;
      if (rx + rw + 10 + ylw < R.x + R.w - 6) halo(yl, rx + rw + 10, ry + rh / 2, lf, col.y(), 'left');
      else halo(yl, rx + rw - 8, ry - 14, lf, col.y(), 'right');
      // Fläche
      if (rw > 70 && rh > 30) halo(tr('area', { a: shown.a }), rx + rw / 2, ry + rh / 2, font(800, F(16, 14)), theme.text);
      // √a am Zielquadrat
      halo(`√${p.a} ≈ ${fmt.num(r, 4)}`, qx, qy - 12, font(700, F(12.5, 11.5)), col.sq(), 'left');
      // Hinweis vor dem ersten Schritt
      if (step === 0 && !move.running) {
        const hf = font(600, F(12.5, 11.5));
        halo(ctx.t('startHint'), R.x + R.w / 2, R.y + 18, hf, theme.muted);
      }
    }

    /* ---------- Intervallschachtelung ---------- */
    function drawNest(R: Rect): void {
      const g = surface.g;
      const theme = th();
      card(R);
      const a = shown.a;
      const t = move.running ? move.value : 1;
      const k = step;
      const pad = F(30, 18);
      const x0 = R.x + pad;
      const x1 = R.x + R.w - pad;
      // obere Zeile: Stufe k − 1 (grob), untere Zeile: Stufe k (Lupe)
      const yTop = R.y + R.h * 0.3;
      const yBot = R.y + R.h * 0.68;
      const kk = Math.max(0, k - 1);
      const [pl, ph] = k === 0 ? [Math.floor(Math.sqrt(a)) - 1, Math.floor(Math.sqrt(a)) + 2] : nestInterval(a, kk);
      const [cl, ch] = nestInterval(a, k);
      const exact = exactAt(a, k);
      const rt = Math.sqrt(a);
      const line = (y: number, lo: number, hi: number, sub: number, hiLo: number, hiHi: number, decimals: number, alpha: number) => {
        const X = (v: number) => lerp(x0, x1, (v - lo) / (hi - lo));
        g.save();
        g.globalAlpha = alpha;
        g.strokeStyle = theme.text;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x0 - 8, y);
        g.lineTo(x1 + 8, y);
        g.stroke();
        // markiertes Teilintervall
        const ha = X(hiLo);
        const hb = X(hiHi);
        if (hiHi > hiLo) {
          g.fillStyle = withAlpha(col.rt(), theme.dark ? 0.35 : 0.22);
          roundRect(g, ha, y - 9, Math.max(3, hb - ha), 18, 4);
          g.fill();
          g.strokeStyle = col.rt();
          g.lineWidth = 1.6;
          g.stroke();
        }
        // Teilstriche
        const n = Math.round((hi - lo) / sub);
        const lf = font(600, F(11.5, 10));
        g.font = lf;
        const lw = g.measureText(fmt.fixed(hi, decimals)).width + 10;
        const sp = (x1 - x0) / n;
        const every = [1, 2, 5, 10].find((e) => e * sp >= lw) ?? 10;
        for (let i = 0; i <= n; i++) {
          const v = lo + i * sub;
          const x = X(v);
          g.strokeStyle = withAlpha(theme.text, 0.7);
          g.lineWidth = 1.2;
          g.beginPath();
          g.moveTo(x, y - 6);
          g.lineTo(x, y + 6);
          g.stroke();
          if (i % every === 0 || i === n) text(g, fmt.fixed(v, decimals), i === 0 ? x - 4 : i === n ? x + 4 : x, y + 18, { font: lf, color: theme.muted, align: i === 0 ? 'left' : i === n ? 'right' : 'center' });
        }
        // √a als Punkt
        if (rt >= lo && rt <= hi) {
          const x = X(rt);
          g.beginPath();
          g.arc(x, y, 5.5, 0, Math.PI * 2);
          g.fillStyle = col.rt();
          g.fill();
          g.strokeStyle = theme.bg;
          g.lineWidth = 2;
          g.stroke();
          halo(`√${p.a}`, x, y - 18, font(800, F(13, 12)), col.rt());
        }
        g.restore();
        return X;
      };
      // Stufen: obere Zeile zeigt [pl, ph] mit Teilung ph−pl / 10 (bei k = 0 ganze Zahlen)
      const subTop = k === 0 ? 1 : 10 ** -k;
      const XT = line(yTop, pl, ph, subTop, cl, exact ? cl : ch, k === 0 ? 0 : k, intro);
      // untere Zeile: Lupe auf [cl, ch], Teilung 10^−(k+1)
      const subBot = 10 ** -(k + 1);
      const [nl, nh] = nestInterval(a, k + 1);
      g.save();
      g.globalAlpha = exact ? 0 : t;
      // Lupen-Linien
      g.strokeStyle = withAlpha(col.rt(), 0.45);
      g.lineWidth = 1.2;
      g.setLineDash([4, 4]);
      g.beginPath();
      g.moveTo(XT(cl), yTop + 9);
      g.lineTo(x0, yBot - 12);
      g.moveTo(XT(ch), yTop + 9);
      g.lineTo(x1, yBot - 12);
      g.stroke();
      g.setLineDash([]);
      g.restore();
      if (!exact) line(yBot, cl, ch, subBot, nl, nh, k + 1, t);
      if (!exact) text(g, ctx.t('zoom'), R.x + R.w - pad, yBot - 30, { font: font(600, 11), color: theme.muted, align: 'right' });
      // Ungleichungskette unten
      const f = font(700, F(14, 12.5));
      const lo2 = cl * cl;
      const hi2 = ch * ch;
      const s = exact ? `${fmt.num(cl, k)}² = ${fmt.num(a, 0)}  ⇒  √${p.a} = ${fmt.num(cl, k)}` : `${fmt.fixed(cl, k)}² = ${fmt.num(lo2, 2 * k)} < ${p.a} < ${fmt.num(hi2, 2 * k)} = ${fmt.fixed(ch, k)}²`;
      g.font = f;
      let size = F(14, 12.5);
      while (g.measureText(s).width > R.w - 2 * pad && size > 10) {
        size -= 0.5;
        g.font = font(700, size);
      }
      text(g, s, R.x + R.w / 2, R.y + R.h - F(22, 18), { font: font(700, size), color: exact ? col.sq() : theme.text });
    }

    /* ---------- Tabelle ---------- */
    function tableCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      const isH = mode() === 'heron';
      card(R, col.rt(), 0.02);
      title(R.x + pad, R.y + 16, ctx.t(isH ? 'tabH' : 'tabN'), col.rt());
      const n = maxStep();
      const lh = Math.min(F(24, 21), (R.h - 50) / (n + 1));
      const top = R.y + 40;
      const fh = font(700, F(11.5, 10.5));
      const fv = `500 ${F(12.5, 11.5)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      const fvB = `700 ${F(12.5, 11.5)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      const c0 = R.x + pad;
      const c1 = R.x + pad + 26;
      const c2 = R.x + pad + (R.w - 2 * pad) * 0.56;
      text(g, 'n', c0, top - 8, { font: fh, color: theme.muted, align: 'left' });
      text(g, isH ? 'x' : (ctx.lang === 'de' ? 'untere Grenze' : 'lower bound'), c1, top - 8, { font: fh, color: theme.muted, align: 'left' });
      text(g, isH ? 'a : x' : (ctx.lang === 'de' ? 'obere Grenze' : 'upper bound'), c2, top - 8, { font: fh, color: theme.muted, align: 'left' });
      /** Zahl mit fett gesetzten richtigen Stellen. */
      const num = (v: number, decimals: number, x: number, y: number, color: string) => {
        const sv = dec(v, decimals);
        const gd = goodDigits(v);
        const comma = sv.indexOf(',') >= 0 ? sv.indexOf(',') : sv.indexOf('.');
        const cut = comma < 0 ? sv.length : gd < 0 ? 0 : Math.min(sv.length, comma + 1 + gd);
        const a = sv.slice(0, cut);
        const b = sv.slice(cut);
        g.font = fvB;
        const wa = g.measureText(a).width;
        text(g, a, x, y, { font: fvB, color, align: 'left' });
        text(g, b, x + wa, y, { font: fv, color: withAlpha(theme.text, 0.6), align: 'left' });
      };
      const s = steps();
      for (let i = 0; i <= Math.min(step, n); i++) {
        const y = top + 6 + lh * (i + 0.5);
        const cur = i === step;
        const appear = cur && move.running ? move.value : 1;
        g.save();
        g.globalAlpha = appear;
        if (cur) {
          g.fillStyle = withAlpha(col.rt(), theme.dark ? 0.18 : 0.1);
          roundRect(g, R.x + pad - 6, y - lh / 2 + 1, R.w - 2 * pad + 12, lh - 2, 6);
          g.fill();
        }
        text(g, String(i), c0, y, { font: font(700, F(12.5, 11.5)), color: theme.muted, align: 'left' });
        if (isH) {
          const q = s[i]!;
          num(q.x, 9, c1, y, col.x());
          num(q.y, 9, c2, y, col.y());
        } else {
          const [lo, hi] = nestInterval(p.a, i);
          text(g, dec(lo, i), c1, y, { font: fvB, color: col.lo(), align: 'left' });
          text(g, exactAt(p.a, i) ? '=' : dec(hi, i), c2, y, { font: fvB, color: col.hi(), align: 'left' });
        }
        g.restore();
      }
      if (isH) text(g, `${ctx.t('digits')}: ${Math.max(0, goodDigits(s[Math.min(step, n)]!.x))}`, R.x + R.w - pad, R.y + 16, { font: font(600, 11), color: theme.muted, align: 'right' });
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      let moving = false;
      const k = reduced ? 1 : 1 - Math.exp(-dt * 7);
      for (const key of ['a', 'x0'] as const) {
        const goal = p[key];
        if (Math.abs(shown[key] - goal) > 1e-3) {
          shown = { ...shown, [key]: shown[key] + (goal - shown[key]) * k };
          moving = true;
        } else shown = { ...shown, [key]: goal };
      }
      if (intro < 1) intro = Math.min(1, intro + dt * 1.6);
      frameK = 1 - Math.exp(-dt * 5);
      scaleMoving = false;
      surface.begin();
      const lay = layout();
      if (mode() === 'heron') drawHeron(lay.stage);
      else drawNest(lay.stage);
      const C = lay.col;
      const gap = F(10, 8);
      const isH = mode() === 'heron';
      const sq = isPerfectSquare(p.a);
      const exactNow = !isH && exactAt(p.a, step);
      const infoHead = exactNow ? ctx.t('exactT') : !isH && p.a === 2 ? ctx.t('irrT') : ctx.t('ideaT');
      const infoBody = exactNow
        ? tr('exact', { a: p.a, r: fmt.num(Math.sqrt(p.a), 6) })
        : sq && isH
          ? `${ctx.t('ideaH')} ${tr('perfect', { a: p.a, r: fmt.num(Math.sqrt(p.a), 0) })}`
          : !isH && p.a === 2
            ? ctx.t('irr')
            : ctx.t(isH ? 'ideaH' : 'ideaN');
      const ih = textSpecH(C.w, infoBody);
      if (C.h - ih - gap >= 150) {
        tableCard({ x: C.x, y: C.y, w: C.w, h: C.h - ih - gap });
        textCard({ x: C.x, y: C.y + C.h - ih, w: C.w, h: ih }, infoHead, infoBody, exactNow ? col.sq() : undefined);
      } else tableCard(C);
      // automatisch weiter
      if (autoPlay && !move.running) {
        if (step >= maxStep() || (!isH && exactAt(p.a, step))) autoPlay = false;
        else if (now - lastStepEnd > 500) nextStep();
      }
      if (!move.running && wasMoving) lastStepEnd = now;
      wasMoving = move.running;
      if (moving || move.running || autoPlay || intro < 1 || scaleMoving) ctx.requestRender();
    }
    let wasMoving = false;
    let heronScale = 0;
    let frameK = 1;
    let scaleMoving = false;

    return {
      update(changed, source) {
        if (changed.has('mode') || source === 'replace') {
          step = 0;
          from = 0;
          autoPlay = false;
          intro = reduced ? 1 : 0;
          shown = { a: p.a, x0: p.x0 };
        }
        if (mode() === 'heron' && p.x0 > p.a && source === 'input' && changed.has('a')) ctx.set({ x0: Math.min(20, Math.max(1, Math.round(p.a))) });
        if (!move.running) from = step;
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        if (id === 'next') {
          autoPlay = false;
          if (mode() === 'nest' && exactAt(p.a, step)) return;
          nextStep();
        } else if (id === 'play') {
          if (step >= maxStep()) restart();
          autoPlay = true;
        } else if (id === 'restart') restart();
        updateReadouts();
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
