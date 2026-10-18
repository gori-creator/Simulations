import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import { DEG, inverse, ratio, roles, sides, trig, type Fn, type Ref, type RightTriangle } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
type Pt = [number, number];

const C_MIN = 2;
const C_MAX = 10;
const GROW_MS = 4200;

/**
 * Sinus, Kosinus und Tangens als Seitenverhältnisse im rechtwinkligen
 * Dreieck: Ecke B ziehen ändert Winkel und Größe, die Rollen der Seiten
 * (Gegenkathete, Ankathete, Hypotenuse) wechseln mit dem Bezugswinkel.
 * Eine Animation vergrößert und verkleinert das Dreieck – das Verhältnis
 * bleibt gleich, es hängt nur vom Winkel ab. Daneben die Graphen von sin,
 * cos und tan für 0° bis 90° und die Zusammenhänge zwischen ihnen.
 */
export default defineSimulation({
  id: 'sin-cos-tan-dreieck',
  dragHint: true,
  layout: { aspect: 1.62, aspectNarrow: 0.42 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'f',
      type: 'choice',
      label: L('Verhältnis', 'Ratio'),
      options: [
        { value: 'sin', label: L('Sinus', 'Sine') },
        { value: 'cos', label: L('Kosinus', 'Cosine') },
        { value: 'tan', label: L('Tangens', 'Tangent') },
      ],
      default: 'sin',
    },
    {
      key: 'ref',
      type: 'choice',
      label: L('Bezugswinkel', 'Reference angle'),
      options: [
        { value: 'a', label: L('α (bei A)', 'α (at A)') },
        { value: 'b', label: L('β (bei B)', 'β (at B)') },
      ],
      default: 'a',
    },
    { key: 'al', type: 'number', label: L('Winkel α', 'Angle α'), min: 5, max: 85, step: 1, default: 35, unit: '°', help: L('Auch Ecke B ziehen.', 'You can also drag vertex B.') },
    { key: 'c', type: 'number', label: L('Hypotenuse c', 'Hypotenuse c'), min: C_MIN, max: C_MAX, step: 0.5, default: 6, unit: 'cm' },
    { key: 'sim', type: 'boolean', group: 'view', label: L('Ähnliche Dreiecke einzeichnen', 'Draw similar triangles'), default: false },
    { key: 'show', type: 'boolean', group: 'view', label: L('Werte zeigen', 'Show values'), help: L('Aus: Katheten und Seitenverhältnis selbst berechnen.', 'Off: work out the legs and the ratio yourself.'), default: true },
  ],
  actions: [{ id: 'grow', label: L('Dreieck vergrößern und verkleinern', 'Enlarge and shrink the triangle'), primary: true }],
  readouts: [
    { key: 'sides', label: L('Seiten', 'Sides'), spoiler: true },
    { key: 'vals', label: L('Werte', 'Values'), spoiler: true },
  ],
  presets: [
    { id: 'std', label: L('α = 35°, Sinus', 'α = 35°, sine'), values: {} },
    { id: 'w30', label: L('α = 30°: Gegenkathete halb so lang', 'α = 30°: opposite side half as long'), values: { al: 30, c: 6 } },
    { id: 'w45', label: L('α = 45°: tan α = 1', 'α = 45°: tan α = 1'), values: { al: 45, f: 'tan', c: 7 } },
    { id: 'beta', label: L('Bezugswinkel β', 'Reference angle β'), values: { ref: 'b' } },
    { id: 'sim', label: L('Ähnliche Dreiecke', 'Similar triangles'), values: { sim: true, al: 40, c: 9 } },
    { id: 'steep', label: L('Steiler Winkel, Tangens', 'Steep angle, tangent'), values: { al: 70, f: 'tan', c: 8 } },
  ],
  strings: {
    de: {
      canvas: 'Rechtwinkliges Dreieck ABC mit rechtem Winkel bei C und ziehbarer Ecke B; Gegenkathete, Ankathete und Hypotenuse zum gewählten Winkel sind farbig markiert. Daneben das Seitenverhältnis als Bruch, die Graphen von Sinus, Kosinus und Tangens von 0° bis 90° und Zusammenhänge zwischen den drei Werten.',
      opp: 'Gegenkathete',
      adj: 'Ankathete',
      hyp: 'Hypotenuse',
      ratioT: 'Seitenverhältnis',
      graphT: 'Werte für 0° bis 90°',
      relT: 'Zusammenhänge',
      simLine: 'Gleich in allen ähnlichen Dreiecken:',
      inv: 'Umgekehrt:',
      sides: 'a {ea} {a} cm, b {eb} {b} cm, c = {c} cm',
      cm: 'cm',
      growing: 'Größe ändert sich – das Verhältnis bleibt.',
    },
    en: {
      canvas: 'Right triangle ABC with the right angle at C and a draggable vertex B; the opposite side, adjacent side and hypotenuse for the chosen angle are coloured. Next to it the ratio as a fraction, the graphs of sine, cosine and tangent from 0° to 90° and relationships between the three values.',
      opp: 'opposite',
      adj: 'adjacent',
      hyp: 'hypotenuse',
      ratioT: 'Ratio of sides',
      graphT: 'Values from 0° to 90°',
      relT: 'Relationships',
      simLine: 'The same in all similar triangles:',
      inv: 'Conversely:',
      sides: 'a {ea} {a} cm, b {eb} {b} cm, c = {c} cm',
      cm: 'cm',
      growing: 'The size changes – the ratio stays the same.',
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
    const mfont = (size: number) => `italic 700 ${size}px ${th().mathFont}`;
    const fn = () => p.f as Fn;
    const ref = () => p.ref as Ref;

    const col = {
      opp: () => th().series[1]!,
      adj: () => th().series[0]!,
      hyp: () => th().series[4]!,
      ang: () => th().series[3]!,
      sim: () => th().series[2]!,
      curve: (f: Fn) => (f === 'sin' ? th().series[5]! : f === 'cos' ? th().series[2]! : th().series[3]!),
    };

    /* ---------- Zahlen ---------- */
    const n2 = (v: number) => fmt.num(v, 2);
    const n3 = (v: number) => fmt.fixed(v, 3);
    const isExact = (v: number, d: number) => Math.abs(v - Math.round(v * 10 ** d) / 10 ** d) < 1e-9;
    const eq = (v: number, d: number) => (isExact(v, d) ? '=' : '≈');
    const angName = () => (ref() === 'a' ? 'α' : 'β');
    const otherName = () => (ref() === 'a' ? 'β' : 'α');

    /* ---------- Aufteilung ---------- */
    function regions(): { tri: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (!wideLayout()) {
        const ph = Math.round(clamp(w * 0.8, 240, h * 0.4));
        return { tri: { x: 0, y: 0, w, h: ph }, col: { x: 2, y: ph + 6, w: w - 4, h: h - ph - 8 } };
      }
      const cw = Math.round(clamp(w * 0.38, 270, 370));
      return { tri: { x: 0, y: 0, w: w - cw - 10, h }, col: { x: w - cw, y: 2, w: cw - 2, h: h - 4 } };
    }
    const plot = new Plot(surface, { x: [-1, 8], y: [-1, 6], pan: false, zoom: false, controls: false, region: () => regions().tri, xAxis: { label: '' }, yAxis: { label: '' } });

    /* ---------- weiche Anzeige ---------- */
    let shown = { al: p.al, c: p.c, view: Math.max(p.c, 5) };
    let lastFrame = performance.now();
    let dragging = 0;
    const grow = new Tween(GROW_MS, ease.linear);
    let growFrom = p.c;

    /** Hypotenuse während der Animation: ↑ 10 cm, ↓ 2 cm, zurück. */
    function growC(): number {
      const t = grow.value;
      const s = (u: number) => ease.inOutCubic(clamp(u, 0, 1));
      if (t < 1 / 3) return lerp(growFrom, C_MAX, s(t * 3));
      if (t < 2 / 3) return lerp(C_MAX, C_MIN, s(t * 3 - 1));
      return lerp(C_MIN, p.c, s(t * 3 - 2));
    }
    const tri = (): RightTriangle => ({ alpha: shown.al, c: grow.running ? growC() : shown.c });

    /* ---------- Griff ---------- */
    plot.addHandle({
      get: () => {
        const s = sides(tri());
        return [s.b, s.a];
      },
      set: (x, y) => {
        dragging = performance.now();
        const al = clamp(Math.round(Math.atan2(Math.max(y, 0.01), Math.max(x, 0.01)) / DEG), 5, 85);
        const c = clamp(Math.round(Math.hypot(x, y) * 2) / 2, C_MIN, C_MAX);
        ctx.set({ al, c });
      },
      enabled: () => !ctx.locked && !grow.running,
      color: () => th().text,
    });

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const t: RightTriangle = { alpha: p.al, c: p.c };
      const s = sides(t);
      ctx.readout('sides', tr('sides', { a: n2(s.a), b: n2(s.b), c: n2(s.c), ea: eq(s.a, 2), eb: eq(s.b, 2) }));
      const ang = ref() === 'a' ? p.al : 90 - p.al;
      const v = (f: Fn) => `${f} ${ang}° ${eq(trig(f, ang), 3)} ${n3(trig(f, ang))}`;
      ctx.readout('vals', `${v('sin')}; ${v('cos')}; ${v('tan')}`);
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
    function halo(str: string, x: number, y: number, f: string, color: string, align: CanvasTextAlign = 'center', baseline: CanvasTextBaseline = 'middle'): void {
      const g = surface.g;
      g.save();
      g.font = f;
      g.textAlign = align;
      g.textBaseline = baseline;
      g.lineJoin = 'round';
      g.lineWidth = 4;
      g.strokeStyle = th().bg;
      g.strokeText(str, x, y);
      g.fillStyle = color;
      g.fillText(str, x, y);
      g.restore();
    }
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { o: col.opp(), a: col.adj(), h: col.hyp(), k: col.ang(), m: th().muted },
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

    /** Welche Rolle hat welche Seite (bezogen auf den Bezugswinkel)? */
    function roleOf(side: 'a' | 'b' | 'c'): 'opp' | 'adj' | 'hyp' {
      if (side === 'c') return 'hyp';
      if (ref() === 'a') return side === 'a' ? 'opp' : 'adj';
      return side === 'b' ? 'opp' : 'adj';
    }
    /** Steht die Rolle im aktuellen Verhältnis? */
    function inRatio(role: 'opp' | 'adj' | 'hyp'): boolean {
      const f = fn();
      if (f === 'sin') return role !== 'adj';
      if (f === 'cos') return role !== 'opp';
      return role !== 'hyp';
    }

    /* ---------- Dreieck ---------- */
    function fitView(R: Rect, a: number, b: number): void {
      const mL = F(34, 22);
      const mR = F(130, 104);
      const mT = F(30, 24);
      const mB = F(64, 58);
      const aw = Math.max(40, R.w - mL - mR);
      const ah = Math.max(40, R.h - mT - mB);
      const s = Math.min(aw / Math.max(b, 0.6), ah / Math.max(a, 0.6), F(64, 46));
      const x0 = -(mL + (aw - b * s) / 2) / s;
      const y0 = -(mB + (ah - a * s) / 2) / s;
      plot.setRange([x0, x0 + R.w / s], [y0, y0 + R.h / s]);
    }

    function drawTriangle(): void {
      const g = surface.g;
      const theme = th();
      const R = regions().tri;
      const t = tri();
      const s = sides(t);
      // Ansicht: an das größte gezeigte Dreieck angepasst
      const vs = sides({ alpha: shown.al, c: shown.view });
      fitView(R, vs.a, vs.b);
      plot.begin();
      plot.grid();
      const A: Pt = [0, 0];
      const C: Pt = [s.b, 0];
      const B: Pt = [s.b, s.a];
      const P = (q: Pt) => plot.toPx(q[0], q[1]);
      // Fläche
      plot.polygon([A, C, B], { fill: withAlpha(col.ang(), theme.dark ? 0.1 : 0.06) });
      // ähnliche Dreiecke (gemeinsame Ecke am Bezugswinkel)
      if (p.sim) {
        const V = ref() === 'a' ? A : B;
        for (const k of [1 / 3, 2 / 3]) {
          const q1: Pt = [V[0] + (C[0] - V[0]) * k, V[1] + (C[1] - V[1]) * k];
          const q2: Pt = ref() === 'a' ? [V[0] + (B[0] - V[0]) * k, V[1] + (B[1] - V[1]) * k] : [V[0] + (A[0] - V[0]) * k, V[1] + (A[1] - V[1]) * k];
          plot.segment(q1, q2, { color: col.sim(), width: 2, dash: [6, 4] });
          plot.point(q1[0], q1[1], { color: col.sim(), radius: 3 });
          plot.point(q2[0], q2[1], { color: col.sim(), radius: 3 });
        }
      }
      // Seiten
      const sideStyle = (side: 'a' | 'b' | 'c') => {
        const role = roleOf(side);
        const c = col[role]();
        const on = inRatio(role);
        return { color: on ? c : mixColor(c, theme.bg, 0.45), width: on ? 4.5 : 2.5, on, c };
      };
      const sa = sideStyle('a');
      const sb = sideStyle('b');
      const sc = sideStyle('c');
      plot.segment(C, B, { color: sa.color, width: sa.width });
      plot.segment(A, C, { color: sb.color, width: sb.width });
      plot.segment(A, B, { color: sc.color, width: sc.width });
      // rechter Winkel bei C
      const [cx, cy] = P(C);
      const q = 14;
      g.strokeStyle = theme.text;
      g.lineWidth = 1.4;
      g.strokeRect(cx - q, cy - q, q, q);
      g.beginPath();
      g.arc(cx - q / 2, cy - q / 2, 1.8, 0, Math.PI * 2);
      g.fillStyle = theme.text;
      g.fill();
      // Winkel
      const alR = t.alpha * DEG;
      const rA = clamp(Math.min(s.b, s.c) * plot.scale.x * 0.32, 22, 46);
      const rB = clamp(Math.min(s.a, s.c) * plot.scale.x * 0.32, 18, 42);
      const refA = ref() === 'a';
      plot.arcPx(A[0], A[1], rA, 0, alR, { sector: true, fill: withAlpha(col.ang(), refA ? 0.3 : 0.1), stroke: refA ? col.ang() : withAlpha(theme.text, 0.4), width: refA ? 2 : 1.2 });
      plot.arcPx(B[0], B[1], rB, Math.PI + alR, (3 * Math.PI) / 2, { sector: true, fill: withAlpha(col.ang(), refA ? 0.1 : 0.3), stroke: refA ? withAlpha(theme.text, 0.4) : col.ang(), width: refA ? 1.2 : 2 });
      // Winkelbeschriftung
      const [ax, ay] = P(A);
      const [bx, by] = P(B);
      const midA = alR / 2;
      const midB = Math.PI + alR + (Math.PI / 2 - alR) / 2;
      const fA = refA ? mfont(F(15, 13.5)) : mfont(F(13, 12));
      const fB = !refA ? mfont(F(15, 13.5)) : mfont(F(13, 12));
      const al = Math.round(t.alpha);
      const la = refA ? `α = ${al}°` : 'α';
      const lac = refA ? col.ang() : theme.muted;
      const narrowB = cx - ax < 70;
      // flach: unter AC; steil (schmale Ankathete): links von A; sonst im Winkelfeld
      if (t.alpha < 15) halo(la, ax + rA + 6, ay + 6, fA, lac, 'left', 'top');
      else if (narrowB) halo(la, ax - 12, ay + 12, fA, lac, 'right', 'top');
      else halo(la, ax + Math.cos(midA) * (rA + 8), ay - Math.sin(midA) * (rA + 8), fA, lac, 'left');
      const lb = !refA ? `β = ${90 - al}°` : 'β';
      const lbc = !refA ? col.ang() : theme.muted;
      // flach (kurze Kathete a): rechts oberhalb von B
      if (cy - by < 60) halo(lb, bx + 10, by - 14, fB, lbc, 'left', 'bottom');
      else halo(lb, bx + Math.cos(midB) * (rB + 8), by - Math.sin(midB) * (rB + 8), fB, lbc, 'right', 'top');
      // Ecken
      const vf = mfont(F(16, 14));
      halo('A', ax - 10, ay, vf, theme.text, 'right', 'middle');
      halo('C', cx + 8, cy + 4, vf, theme.text, 'left', 'top');
      halo('B', bx - 8, by - 6, vf, theme.text, 'right', 'bottom');
      // Seitenbeschriftungen
      const lenTxt = (v: number, leg = true) => (leg && !p.show ? '= ?' : `${eq(v, 2)} ${n2(v)} ${ctx.t('cm')}`);
      const lf = font(700, F(13, 12));
      const rf = font(700, F(12, 11));
      // a: rechts neben BC
      const ya = Math.min((cy + by) / 2, cy - 30);
      halo(`a ${lenTxt(s.a)}`, cx + 12, ya - 9, lf, sa.on ? sa.c : theme.muted, 'left');
      halo(ctx.t(roleOf('a')), cx + 12, ya + 9, rf, sa.c, 'left');
      // b: unter AC
      // bei schmaler Kathete b rechts unter C, damit links Platz für den Winkel bleibt
      const xb = narrowB ? cx + 12 : (ax + cx) / 2;
      const yb = narrowB ? cy + 30 : cy + 16;
      const alB: CanvasTextAlign = narrowB ? 'left' : 'center';
      halo(`b ${lenTxt(s.b)}`, xb, yb, lf, sb.on ? sb.c : theme.muted, alB);
      halo(ctx.t(roleOf('b')), xb, yb + 17, rf, sb.c, alB);
      // c: entlang AB, außen
      const ang = Math.atan2(-(by - ay), bx - ax);
      g.save();
      g.translate((ax + bx) / 2, (ay + by) / 2);
      g.rotate(-ang);
      halo(`c ${lenTxt(s.c, false)}`, 0, -10, lf, sc.on ? sc.c : theme.muted, 'center', 'bottom');
      halo(ctx.t('hyp'), 0, -26, rf, sc.c, 'center', 'bottom');
      g.restore();
      // Griff-Punkt B
      plot.point(B[0], B[1], { color: theme.text, radius: 6 });
      if (grow.running) halo(ctx.t('growing'), R.x + R.w / 2, R.y + 16, font(700, F(13, 12)), col.sim());
      plot.end();
    }

    /* ---------- Karten ---------- */
    const roleSrc = (role: 'opp' | 'adj' | 'hyp') => `\\c{${role === 'opp' ? 'o' : role === 'adj' ? 'a' : 'h'}}{\\t{${ctx.t(role)}}}`;
    function ratioParts(): { num: 'opp' | 'adj'; den: 'adj' | 'hyp' } {
      const f = fn();
      if (f === 'sin') return { num: 'opp', den: 'hyp' };
      if (f === 'cos') return { num: 'adj', den: 'hyp' };
      return { num: 'opp', den: 'adj' };
    }
    const sideOfRole = (role: 'opp' | 'adj' | 'hyp'): 'a' | 'b' | 'c' => (role === 'hyp' ? 'c' : (['a', 'b'] as const).find((s) => roleOf(s) === role)!);
    const roleKey = (role: 'opp' | 'adj' | 'hyp') => (role === 'opp' ? 'o' : role === 'adj' ? 'a' : 'h');

    function ratioCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R, col.ang(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('ratioT'), col.ang());
      const t = tri();
      const ro = roles(t, ref());
      const { num, den } = ratioParts();
      const vNum = num === 'opp' ? ro.opp : ro.adj;
      const vDen = den === 'hyp' ? ro.hyp : ro.adj;
      const v = ratio(t, ref(), fn());
      const maxW = R.w - 2 * pad;
      const fs = F(17, 15);
      const head = `${fn()} \\c{k}{${angName()}}`;
      const l1 = fitFormula(`${head} = \\f{${roleSrc(num)}}{${roleSrc(den)}}`, maxW, fs);
      let y = R.y + 30 + l1.asc;
      l1.draw(g, R.x + pad, y);
      y += l1.desc + 8;
      const sn = sideOfRole(num);
      const sd = sideOfRole(den);
      const res = p.show ? `${eq(v, 3)} ${n3(v)}` : '= ?';
      const len = (v: number, side: 'a' | 'b' | 'c') => (p.show || side === 'c' ? `${n2(v)} cm` : '?');
      const l2 = fitFormula(`${head} = \\f{\\c{${roleKey(num)}}{${sn}}}{\\c{${roleKey(den)}}{${sd}}} = \\f{${len(vNum, sn)}}{${len(vDen, sd)}} ${res}`, maxW, fs);
      y += l2.asc;
      l2.draw(g, R.x + pad, y);
      y += l2.desc + 14;
      const sf = font(600, F(12, 11));
      if (p.sim) {
        text(g, ctx.t('simLine'), R.x + pad, y, { font: sf, color: col.sim(), align: 'left' });
        y += 18;
        const Q = (v: number) => (p.show ? n2(v) : '?');
        const chain = [1 / 3, 2 / 3, 1].map((k) => `${Q(vNum * k)} : ${Q(vDen * k)}`).join(' = ');
        const l3 = fitFormula(`${chain}${p.show ? ` ${eq(v, 3)} ${n3(v)}` : ''}`, maxW, F(13, 12), theme.text);
        l3.draw(g, R.x + pad, y + 4);
        y += 22;
      }
      if (p.show) {
        const l4 = fitFormula(`\\t{${ctx.t('inv')}} \\c{k}{${angName()}} = ${fn()}^{−1}(${n3(v)}) ≈ ${fmt.num(Math.round(inverse(fn(), Math.round(v * 1000) / 1000) * 10) / 10, 1)}°`, maxW, F(13, 12), theme.muted);
        l4.draw(g, R.x + pad, Math.min(y + 4, R.y + R.h - 10));
      }
    }
    function ratioH(): number {
      const fs = F(17, 15);
      return 30 + fs * 2.3 + 8 + fs * 2.3 + 14 + (p.sim ? 40 : 0) + (p.show ? 18 : 0) + 4;
    }

    function graphCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('graphT'));
      const x0 = R.x + pad + 26;
      const x1 = R.x + R.w - pad - 30;
      const y0 = R.y + 42;
      const y1 = R.y + R.h - 24;
      const yMax = 1.8;
      const X = (deg: number) => lerp(x0, x1, deg / 90);
      const Y = (v: number) => lerp(y1, y0, v / yMax);
      // Gitter
      g.lineWidth = 1;
      for (const v of [0.5, 1, 1.5]) {
        g.strokeStyle = theme.gridMinor;
        g.beginPath();
        g.moveTo(x0, Y(v));
        g.lineTo(x1, Y(v));
        g.stroke();
        text(g, fmt.num(v, 1), x0 - 6, Y(v), { font: font(600, 10.5), color: theme.muted, align: 'right' });
      }
      for (const d of [30, 45, 60, 90]) {
        g.strokeStyle = theme.gridMinor;
        g.beginPath();
        g.moveTo(X(d), y0);
        g.lineTo(X(d), y1);
        g.stroke();
        text(g, `${d}°`, X(d), y1 + 11, { font: font(600, 10.5), color: theme.muted });
      }
      text(g, '0°', X(0), y1 + 11, { font: font(600, 10.5), color: theme.muted });
      g.strokeStyle = withAlpha(theme.text, 0.45);
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x0, y1);
      g.lineTo(x1, y1);
      g.stroke();
      const ang = ref() === 'a' ? tri().alpha : 90 - tri().alpha;
      // Kurven
      const order: Fn[] = (['sin', 'cos', 'tan'] as Fn[]).sort((a, b) => (a === fn() ? 1 : 0) - (b === fn() ? 1 : 0));
      for (const f of order) {
        const on = f === fn();
        const c = col.curve(f);
        g.strokeStyle = on ? c : withAlpha(c, 0.45);
        g.lineWidth = on ? 3 : 1.6;
        g.beginPath();
        let last: Pt = [x0, Y(trig(f, 0))];
        let started = false;
        for (let i = 0; i <= 180; i++) {
          const d = (90 * i) / 180;
          const v = trig(f, d);
          if (!Number.isFinite(v) || v > yMax) break;
          const pt: Pt = [X(d), Y(v)];
          if (started) g.lineTo(pt[0], pt[1]);
          else g.moveTo(pt[0], pt[1]);
          started = true;
          last = pt;
        }
        g.stroke();
        const lx = f === 'cos' ? X(90) + 4 : f === 'tan' ? last[0] - 6 : last[0] + 4;
        const ly = f === 'cos' ? Y(0) - 8 : f === 'tan' ? last[1] + 8 : last[1];
        text(g, f, lx, ly, { font: font(700, on ? 12.5 : 11.5), color: on ? c : withAlpha(c, 0.75), align: f === 'tan' ? 'right' : 'left' });
      }
      // aktueller Winkel
      g.save();
      g.strokeStyle = withAlpha(col.ang(), 0.8);
      g.setLineDash([4, 3]);
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(X(ang), y0);
      g.lineTo(X(ang), y1);
      g.stroke();
      g.restore();
      const v = trig(fn(), ang);
      if (v <= yMax) {
        g.beginPath();
        g.arc(X(ang), Y(v), 5, 0, Math.PI * 2);
        g.fillStyle = col.curve(fn());
        g.fill();
        g.strokeStyle = theme.bg;
        g.lineWidth = 1.5;
        g.stroke();
        if (p.show) halo(n3(v), X(ang) + (ang > 60 ? -8 : 8), Y(v) - 12, font(700, 12), col.curve(fn()), ang > 60 ? 'right' : 'left');
      } else {
        // Wert oberhalb des Bildausschnitts: Pfeil nach oben
        const xa = X(ang);
        g.beginPath();
        g.moveTo(xa, y0 - 1);
        g.lineTo(xa - 6, y0 + 9);
        g.lineTo(xa + 6, y0 + 9);
        g.closePath();
        g.fillStyle = col.curve(fn());
        g.fill();
        if (p.show) halo(`${n3(v)} ↑`, ang > 75 ? xa - 10 : xa + 10, y0 + 6, font(700, 12), col.curve(fn()), ang > 75 ? 'right' : 'left');
      }
      halo(`${angName()} = ${fmt.num(Math.round(ang), 0)}°`, X(ang), y0 - 2, mfont(12), col.ang(), ang > 75 ? 'right' : ang < 15 ? 'left' : 'center');
    }

    function relCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('relT'));
      const ang = ref() === 'a' ? tri().alpha : 90 - tri().alpha;
      const s = trig('sin', ang);
      const c = trig('cos', ang);
      const A = angName();
      const B = otherName();
      const show = p.show;
      const Q = (v: string) => (show ? v : '?');
      const rows: [string, string][] = [
        [`tan ${A} = \\f{sin ${A}}{cos ${A}}`, `${Q(n3(s))} : ${Q(n3(c))} ${show ? eq(s / c, 3) : '='} ${Q(n3(s / c))}`],
        [`(sin ${A})² + (cos ${A})² = 1`, `${Q(n3(s * s))} + ${Q(n3(c * c))} = 1`],
        [`sin ${A} = cos ${B}`, `${B} = 90° − ${A} = ${fmt.num(Math.round(90 - ang), 0)}°`],
      ];
      const maxL = (R.w - 2 * pad) * 0.52;
      const maxR = (R.w - 2 * pad) * 0.46;
      const lh = (R.h - 30) / rows.length;
      rows.forEach(([l, r], i) => {
        const yc = R.y + 28 + lh * (i + 0.5);
        const bl = fitFormula(l, maxL, F(14, 13));
        bl.draw(g, R.x + pad, yc + (bl.asc - bl.desc) / 2);
        const br = fitFormula(r, maxR, F(12.5, 11.5), theme.muted);
        br.draw(g, R.x + R.w - pad - br.w, yc + (br.asc - br.desc) / 2);
      });
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (dragging && now - dragging > 250) dragging = 0;
      const k = reduced || dragging ? 1 : 1 - Math.exp(-dt * 9);
      const kv = reduced ? 1 : 1 - Math.exp(-dt * 4);
      let moving = false;
      const step = (cur: number, goal: number, kk: number) => {
        if (Math.abs(goal - cur) < 1e-3) return goal;
        moving = true;
        return cur + (goal - cur) * kk;
      };
      shown.al = step(shown.al, p.al, k);
      shown.c = step(shown.c, p.c, k);
      const viewGoal = grow.running ? C_MAX : Math.max(p.c, 5);
      if (!dragging) shown.view = step(shown.view, viewGoal, grow.running ? 1 - Math.exp(-dt * 10) : kv);
      surface.begin();
      plot.resize();
      drawTriangle();
      const Cr = regions().col;
      const gap = F(10, 8);
      const rH = ratioH();
      const relH = F(124, 116);
      ratioCard({ x: Cr.x, y: Cr.y, w: Cr.w, h: rH });
      const rest = Cr.h - rH - gap;
      if (rest - relH - gap >= 130) {
        graphCard({ x: Cr.x, y: Cr.y + rH + gap, w: Cr.w, h: rest - relH - gap });
        relCard({ x: Cr.x, y: Cr.y + Cr.h - relH, w: Cr.w, h: relH });
      } else graphCard({ x: Cr.x, y: Cr.y + rH + gap, w: Cr.w, h: rest });
      if (moving || grow.running || dragging) ctx.requestRender();
    }

    return {
      update() {
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (id !== 'grow') return;
        growFrom = shown.c;
        grow.play(reduced ? 1 : GROW_MS);
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
