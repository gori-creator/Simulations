import { defineSimulation, ease, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import { angles, area2, circumcenter, circumradius, DEG, foot, minAngle, sides, sineQuotients, type Pt, type Tri } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
type Mode = 'sin' | 'cos';

const W = 12;
const H = 8;

/**
 * Sinussatz und Kosinussatz an einem Dreieck mit ziehbaren Ecken.
 * Sinussatz: Die drei Quotienten Seite : Sinus des Gegenwinkels sind gleich –
 * und gleich dem Durchmesser des Umkreises; Beweisidee über die Höhe h_c.
 * Kosinussatz: c² = a² + b² − 2ab · cos γ als „korrigierter Pythagoras“ mit
 * Balken für a², b², den Korrekturterm und c²; Beweisidee über die Höhe h_a.
 */
export default defineSimulation({
  id: 'sinussatz-kosinussatz',
  dragHint: true,
  layout: { aspect: 1.62, aspectNarrow: 0.55 },
  groups: [
    { id: 'pts', label: L('Ecken (in cm)', 'Vertices (in cm)') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'm',
      type: 'choice',
      label: L('Satz', 'Law'),
      options: [
        { value: 'sin', label: L('Sinussatz', 'Law of sines') },
        { value: 'cos', label: L('Kosinussatz', 'Law of cosines') },
      ],
      default: 'sin',
    },
    { key: 'ax', type: 'number', group: 'pts', label: L('A: x', 'A: x'), min: 0, max: W, step: 0.1, default: 1, unit: 'cm' },
    { key: 'ay', type: 'number', group: 'pts', label: L('A: y', 'A: y'), min: 0, max: H, step: 0.1, default: 1, unit: 'cm' },
    { key: 'bx', type: 'number', group: 'pts', label: L('B: x', 'B: x'), min: 0, max: W, step: 0.1, default: 10, unit: 'cm' },
    { key: 'by', type: 'number', group: 'pts', label: L('B: y', 'B: y'), min: 0, max: H, step: 0.1, default: 1, unit: 'cm' },
    { key: 'cx', type: 'number', group: 'pts', label: L('C: x', 'C: x'), min: 0, max: W, step: 0.1, default: 4, unit: 'cm' },
    { key: 'cy', type: 'number', group: 'pts', label: L('C: y', 'C: y'), min: 0, max: H, step: 0.1, default: 6, unit: 'cm' },
    { key: 'h', type: 'boolean', group: 'view', label: L('Beweisidee (Höhe)', 'Proof idea (altitude)'), default: true },
    { key: 'k', type: 'boolean', group: 'view', label: L('Umkreis zeigen', 'Show the circumcircle'), default: true, visibleIf: (v) => v.m === 'sin' },
    { key: 'show', type: 'boolean', group: 'view', label: L('Werte zeigen', 'Show values'), help: L('Aus: Seiten und Winkel selbst berechnen.', 'Off: work out sides and angles yourself.'), default: true },
  ],
  actions: [{ id: 'rand', label: L('Neues Dreieck', 'New triangle'), primary: true }],
  readouts: [
    { key: 'sides', label: L('Seiten', 'Sides'), spoiler: true },
    { key: 'angles', label: L('Winkel', 'Angles'), spoiler: true },
    { key: 'law', label: L('Satz', 'Law'), spoiler: true },
  ],
  presets: [
    { id: 'std', label: L('Spitzwinkliges Dreieck', 'Acute triangle'), values: {} },
    { id: 'obt', label: L('Stumpfer Winkel γ', 'Obtuse angle γ'), values: { m: 'cos', ax: 0.5, ay: 1, bx: 11.5, by: 1, cx: 4, cy: 3.5 } },
    { id: 'pyth', label: L('γ = 90°: Pythagoras', 'γ = 90°: Pythagoras'), values: { m: 'cos', ax: 2, ay: 7, bx: 10, by: 1, cx: 2, cy: 1 } },
    { id: 'acute', label: L('Kosinussatz, spitzer Winkel γ', 'Law of cosines, acute γ'), values: { m: 'cos' } },
    { id: 'obtSin', label: L('Sinussatz mit stumpfem Winkel', 'Law of sines with an obtuse angle'), values: { ax: 1, ay: 1, bx: 7, by: 1, cx: 10, cy: 4 } },
  ],
  strings: {
    de: {
      canvas: 'Dreieck ABC mit ziehbaren Ecken, Seiten a, b, c und Winkeln α, β, γ. Beim Sinussatz mit Umkreis und Höhe h_c, daneben die drei Quotienten Seite durch Sinus des Gegenwinkels. Beim Kosinussatz mit Höhe h_a und Balken für a², b², den Korrekturterm 2ab · cos γ und c².',
      sinT: 'Sinussatz',
      cosT: 'Kosinussatz',
      proofT: 'Beweisidee: Höhe',
      invT: 'Umgestellt: Winkel aus drei Seiten',
      barsT: 'c² im Vergleich zu a² + b²',
      diam: 'Umkreisdurchmesser 2r',
      lt: 'γ < 90°: c² ist kleiner als a² + b².',
      eq: 'γ = 90°: c² = a² + b² (Pythagoras).',
      gt: 'γ > 90°: c² ist größer als a² + b².',
      obt: '{w} stumpf: sin {w} = sin(180° − {w})',
      flat: 'Das Dreieck ist zu flach – ziehe eine Ecke weiter weg.',
      corr: 'Korrektur',
    },
    en: {
      canvas: 'Triangle ABC with draggable vertices, sides a, b, c and angles α, β, γ. For the law of sines with the circumcircle and the altitude h_c, next to it the three quotients side divided by the sine of the opposite angle. For the law of cosines with the altitude h_a and bars for a², b², the correction 2ab · cos γ and c².',
      sinT: 'Law of sines',
      cosT: 'Law of cosines',
      proofT: 'Proof idea: altitude',
      invT: 'Rearranged: angle from three sides',
      barsT: 'c² compared with a² + b²',
      diam: 'circumcircle diameter 2r',
      lt: 'γ < 90°: c² is smaller than a² + b².',
      eq: 'γ = 90°: c² = a² + b² (Pythagoras).',
      gt: 'γ > 90°: c² is larger than a² + b².',
      obt: '{w} obtuse: sin {w} = sin(180° − {w})',
      flat: 'The triangle is too flat – drag a vertex further away.',
      corr: 'correction',
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
    const mode = () => p.m as Mode;

    const col = {
      a: () => th().series[0]!,
      b: () => th().series[1]!,
      c: () => th().series[2]!,
      h: () => th().series[3]!,
      circ: () => th().series[4]!,
    };
    const sideCol = [col.a, col.b, col.c];
    const NAMES = ['a', 'b', 'c'] as const;
    const ANG = ['α', 'β', 'γ'] as const;
    const VERT = ['A', 'B', 'C'] as const;

    /* ---------- Zahlen ---------- */
    const n1 = (v: number) => fmt.num(v, 1);
    const n2 = (v: number) => fmt.num(v, 2);
    const isExact = (v: number, d: number) => Math.abs(v - Math.round(v * 10 ** d) / 10 ** d) < 1e-7;
    const eq = (v: number, d: number) => (isExact(v, d) ? '=' : '≈');
    const Q = (s: string) => (p.show ? s : '?');
    /** Bei „Werte zeigen“ aus: nur die gegebenen Größen (Kosinussatz: a, b, γ; Sinussatz: a, α, β). */
    const known = (name: string) => p.show || (mode() === 'cos' ? ['a', 'b', 'γ'] : ['a', 'α', 'β']).includes(name);
    const K = (name: string, str: string) => (known(name) ? str : '?');

    /* ---------- Dreieck (weich nachgeführt) ---------- */
    const goalTri = (): Tri => [
      [p.ax, p.ay],
      [p.bx, p.by],
      [p.cx, p.cy],
    ];
    let shown: [number, number][] = goalTri().map((q) => [q[0], q[1]]);
    let lastFrame = performance.now();
    let dragging = 0;
    const intro = new Tween(900, ease.outCubic);
    const tri = (): Tri => shown as unknown as Tri;
    const flat = (t: Tri) => Math.abs(area2(t)) < 0.6 || minAngle(t) < 5;

    /* ---------- Aufteilung ---------- */
    function regions(): { plot: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (!wideLayout()) {
        const ph = Math.round(clamp(w * 0.72, 230, h * 0.42));
        return { plot: { x: 0, y: 0, w, h: ph }, col: { x: 2, y: ph + 6, w: w - 4, h: h - ph - 8 } };
      }
      const cw = Math.round(clamp(w * 0.38, 270, 370));
      return { plot: { x: 0, y: 0, w: w - cw - 10, h }, col: { x: w - cw, y: 2, w: cw - 2, h: h - 4 } };
    }
    const plot = new Plot(surface, { x: [-0.8, W + 0.8], y: [-0.8, H + 0.8], pan: false, zoom: false, controls: false, region: () => regions().plot, xAxis: { label: '' }, yAxis: { label: '' } });

    /* ---------- Griffe ---------- */
    const keys: [string, string][] = [
      ['ax', 'ay'],
      ['bx', 'by'],
      ['cx', 'cy'],
    ];
    keys.forEach(([kx, ky], i) => {
      plot.addHandle({
        get: () => shown[i]!,
        set: (x, y) => {
          dragging = performance.now();
          const nx = Math.round(clamp(x, 0, W) * 10) / 10;
          const ny = Math.round(clamp(y, 0, H) * 10) / 10;
          ctx.set({ [kx]: nx, [ky]: ny });
        },
        enabled: () => !ctx.locked,
        color: () => th().text,
      });
    });

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const t = goalTri();
      if (flat(t)) {
        ctx.readout('sides', '–');
        ctx.readout('angles', '–');
        ctx.readout('law', ctx.t('flat'));
        return;
      }
      const s = sides(t);
      const w = angles(t);
      ctx.readout('sides', s.map((v, i) => `${NAMES[i]} ${eq(v, 2)} ${n2(v)} cm`).join(', '));
      ctx.readout('angles', w.map((v, i) => `${ANG[i]} ${eq(v, 1)} ${n1(v)}°`).join(', '));
      if (mode() === 'sin') {
        const q = sineQuotients(t);
        ctx.readout('law', `a : sin α ≈ b : sin β ≈ c : sin γ ≈ ${n2(q[0])} cm = 2r`);
      } else {
        const [a, b, c] = s;
        ctx.readout('law', `c² = ${n2(a)}² + ${n2(b)}² − 2 · ${n2(a)} · ${n2(b)} · cos ${n1(w[2])}° ${eq(c * c, 2)} ${n2(c * c)} cm²`);
      }
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
      palette: { a: col.a(), b: col.b(), c: col.c(), h: col.h(), r: col.circ(), m: th().muted },
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
    /** Formelzeile zeichnen; gibt die neue y-Position (unter der Zeile) zurück. */
    function line(src: string, x: number, y: number, maxW: number, size: number, color = th().text): number {
      const box = fitFormula(src, maxW, size, color);
      box.draw(surface.g, x, y + box.asc);
      return y + box.asc + box.desc;
    }

    /* ---------- Zeichnung ---------- */
    function fitView(t: Tri): void {
      let x0 = -0.6;
      let x1 = W + 0.6;
      let y0 = -0.6;
      let y1 = H + 0.6;
      if (mode() === 'sin' && p.k && !flat(t)) {
        const U = circumcenter(t);
        const r = circumradius(t);
        x0 = Math.min(x0, Math.max(U[0] - r, -6) - 0.3);
        x1 = Math.max(x1, Math.min(U[0] + r, W + 6) + 0.3);
        y0 = Math.min(y0, Math.max(U[1] - r, -5) - 0.3);
        y1 = Math.max(y1, Math.min(U[1] + r, H + 5) + 0.3);
      }
      const goal = { x0, x1, y0, y1 };
      view.moving = false;
      for (const key of ['x0', 'x1', 'y0', 'y1'] as const) {
        const d = goal[key] - view[key];
        if (Math.abs(d) < 1e-3) view[key] = goal[key];
        else {
          view[key] += d * view.k;
          view.moving = true;
        }
      }
      plot.setRange([view.x0, view.x1], [view.y0, view.y1]);
    }
    const view = { x0: -0.6, x1: W + 0.6, y0: -0.6, y1: H + 0.6, k: 1, moving: false };

    function angleArc(t: Tri, i: number, w: number, strong: boolean): void {
      const V = t[i]!;
      const P1 = t[(i + 1) % 3]!;
      const P2 = t[(i + 2) % 3]!;
      const a1 = Math.atan2(P1[1] - V[1], P1[0] - V[0]);
      const a2 = Math.atan2(P2[1] - V[1], P2[0] - V[0]);
      let from = a1;
      let d = a2 - a1;
      while (d <= -Math.PI) d += 2 * Math.PI;
      while (d > Math.PI) d -= 2 * Math.PI;
      if (d < 0) {
        from = a2;
        d = -d;
      }
      const c = sideCol[i]!();
      const s = sides(t);
      const rpx = clamp(Math.min(s[(i + 1) % 3]!, s[(i + 2) % 3]!) * plot.scale.x * 0.28, 16, 34);
      plot.arcPx(V[0], V[1], rpx, from, from + d, { sector: true, fill: withAlpha(c, strong ? 0.3 : 0.14), stroke: c, width: strong ? 2 : 1.2 });
      const mid = from + d / 2;
      const [vx, vy] = plot.toPx(V[0], V[1]);
      const lr = rpx + F(22, 18);
      const lab = known(ANG[i]!) ? `${ANG[i]} ${eq(w, 1)} ${n1(w)}°` : `${ANG[i]} = ?`;
      const fa = mfont(F(13, 12));
      if (w > 100) {
        // stumpfer Winkel: Beschriftung außen, gegenüber der Winkelöffnung
        const g = surface.g;
        g.font = fa;
        const tw = g.measureText(lab).width;
        const dir = mid + Math.PI;
        const dd = 24 + Math.abs(Math.cos(dir)) * (tw / 2) + Math.abs(Math.sin(dir)) * 6;
        halo(lab, vx + Math.cos(dir) * dd, vy - Math.sin(dir) * dd, fa, c);
      } else halo(lab, vx + Math.cos(mid) * lr, vy - Math.sin(mid) * lr, fa, c);
    }

    function drawTriangle(): void {
      const g = surface.g;
      const theme = th();
      const t = tri();
      fitView(t);
      plot.begin();
      plot.grid();
      const reveal = intro.running ? intro.value : 1;
      const s = sides(t);
      const w = angles(t);
      const bad = flat(t);
      const cen: Pt = [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3];
      // Umkreis (Sinussatz)
      if (mode() === 'sin' && p.k && !bad) {
        const U = circumcenter(t);
        const r = circumradius(t);
        g.save();
        g.globalAlpha = reveal;
        plot.circle(U[0], U[1], r, { stroke: withAlpha(col.circ(), 0.8), width: 1.8, dash: [6, 5] });
        // Durchmesser durch C
        const C = t[2];
        const D: Pt = [2 * U[0] - C[0], 2 * U[1] - C[1]];
        plot.segment(C, D, { color: col.circ(), width: 2 });
        plot.point(U[0], U[1], { color: col.circ(), radius: 4 });
        const [dx, dy] = plot.toPx((U[0] + D[0]) / 2, (U[1] + D[1]) / 2);
        halo(p.show ? `2r ${eq(2 * r, 2)} ${n2(2 * r)} cm` : '2r = ?', dx + 8, dy, font(700, F(12.5, 11.5)), col.circ(), 'left');
        g.restore();
      }
      // Fläche und Seiten
      plot.polygon(t as unknown as Pt[], { fill: withAlpha(theme.text, theme.dark ? 0.06 : 0.04) });
      // Höhe (Beweisidee)
      if (p.h && !bad) {
        // Sinussatz: h_c von C auf AB; Kosinussatz: h_a von A auf BC
        const [Pv, Q1, Q2, name] = mode() === 'sin' ? [t[2], t[0], t[1], 'h_c'] : [t[0], t[2], t[1], 'h_a'];
        const f = foot(Pv, Q1, Q2);
        g.save();
        g.globalAlpha = reveal;
        // Verlängerung der Seite, falls der Fußpunkt außerhalb liegt
        if (f.t < 0) plot.segment(Q1, f.at, { color: withAlpha(theme.text, 0.5), width: 1.5, dash: [4, 4] });
        if (f.t > 1) plot.segment(Q2, f.at, { color: withAlpha(theme.text, 0.5), width: 1.5, dash: [4, 4] });
        plot.segment(Pv, f.at, { color: col.h(), width: 2.5, dash: [7, 4] });
        // rechter Winkel am Fußpunkt
        const [fx, fy] = plot.toPx(f.at[0], f.at[1]);
        const [px2, py2] = plot.toPx(Pv[0], Pv[1]);
        const [qx, qy] = plot.toPx(Q2[0], Q2[1]);
        const [q1x, q1y] = plot.toPx(Q1[0], Q1[1]);
        const ul = Math.hypot(px2 - fx, py2 - fy) || 1;
        const u = [(px2 - fx) / ul, (py2 - fy) / ul];
        const vx0 = qx - q1x;
        const vy0 = qy - q1y;
        const vl = Math.hypot(vx0, vy0) || 1;
        const v = [vx0 / vl, vy0 / vl];
        const sq = 10;
        g.strokeStyle = col.h();
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(fx + u[0]! * sq, fy + u[1]! * sq);
        g.lineTo(fx + u[0]! * sq + v[0]! * sq, fy + u[1]! * sq + v[1]! * sq);
        g.lineTo(fx + v[0]! * sq, fy + v[1]! * sq);
        g.stroke();
        const [hx, hy] = plot.toPx((Pv[0] + f.at[0]) / 2, (Pv[1] + f.at[1]) / 2);
        const hb = fitFormula(`\\c{h}{${name}}`, 60, F(16, 14));
        hb.draw(g, hx + 8, hy + (hb.asc - hb.desc) / 2);
        // Kosinussatz: Abschnitt C–Fußpunkt = b · cos γ
        if (mode() === 'cos') {
          const C = t[2];
          const cd = s[1] * Math.cos(w[2] * DEG);
          if (Math.abs(cd) * plot.scale.x > 14) {
            plot.segment(C, f.at, { color: col.c(), width: 5, alpha: 0.5 });
            const [mx, my] = plot.toPx((C[0] + f.at[0]) / 2, (C[1] + f.at[1]) / 2);
            // senkrecht zur Seite a, auf der Seite ohne A
            const [cx2, cy2] = plot.toPx(C[0], C[1]);
            const [ax2, ay2] = plot.toPx(t[0][0], t[0][1]);
            let nx = -(fy - cy2);
            let ny = fx - cx2;
            const nl = Math.hypot(nx, ny) || 1;
            nx /= nl;
            ny /= nl;
            // stumpfes γ: Winkelbeschriftung liegt außen, Abschnitt deshalb zur Seite von A beschriften
            if ((nx * (ax2 - mx) + ny * (ay2 - my) > 0) !== w[2] > 100) {
              nx = -nx;
              ny = -ny;
            }
            const lab = `b · cos γ${p.show ? ` ${eq(Math.abs(cd), 2)} ${n2(Math.abs(cd))}` : ''}`;
            halo(lab, mx + nx * 16, my + ny * 16, font(700, F(12, 11)), col.c(), nx > 0.35 ? 'left' : nx < -0.35 ? 'right' : 'center');
          }
        }
        g.restore();
      }
      // Seiten
      for (let i = 0; i < 3; i++) {
        const P1 = t[(i + 1) % 3]!;
        const P2 = t[(i + 2) % 3]!;
        plot.segment(P1, P2, { color: sideCol[i]!(), width: 3.5 });
      }
      // Winkel
      if (!bad) {
        for (let i = 0; i < 3; i++) angleArc(t, i, w[i]!, mode() === 'sin' || i === 2);
      }
      // Seitenbeschriftung (außen)
      const [gx, gy] = plot.toPx(cen[0], cen[1]);
      for (let i = 0; i < 3; i++) {
        const P1 = t[(i + 1) % 3]!;
        const P2 = t[(i + 2) % 3]!;
        const [mx, my] = plot.toPx((P1[0] + P2[0]) / 2, (P1[1] + P2[1]) / 2);
        // Normale nach außen
        const [x1, y1] = plot.toPx(P1[0], P1[1]);
        const [x2, y2] = plot.toPx(P2[0], P2[1]);
        let nx = -(y2 - y1);
        let ny = x2 - x1;
        const nl = Math.hypot(nx, ny) || 1;
        nx /= nl;
        ny /= nl;
        if (nx * (mx - gx) + ny * (my - gy) < 0) {
          nx = -nx;
          ny = -ny;
        }
        const lab = known(NAMES[i]!) ? `${NAMES[i]} ${eq(s[i]!, 2)} ${n2(s[i]!)} cm` : `${NAMES[i]} = ?`;
        const off = F(18, 15);
        halo(lab, mx + nx * off, my + ny * off, font(700, F(13, 12)), sideCol[i]!(), nx > 0.35 ? 'left' : nx < -0.35 ? 'right' : 'center');
      }
      // Ecken
      for (let i = 0; i < 3; i++) {
        const V = t[i]!;
        const [vx, vy] = plot.toPx(V[0], V[1]);
        // bei stumpfem Winkel liegt außen schon die Winkelbeschriftung: Ecke seitlich daneben
        const obt = !bad && w[i]! > 100;
        const dx = obt ? -(vy - gy) : vx - gx;
        const dy = obt ? vx - gx : vy - gy;
        const dl = Math.hypot(dx, dy) || 1;
        halo(VERT[i]!, vx + (dx / dl) * 16, vy + (dy / dl) * 16, mfont(F(16, 14)), theme.text);
        plot.point(V[0], V[1], { color: theme.text, radius: 5 });
      }
      if (bad) {
        const R = regions().plot;
        halo(ctx.t('flat'), R.x + R.w / 2, R.y + 18, font(700, F(13, 12)), col.b());
      }
      plot.end();
    }

    /* ---------- Karten: Sinussatz ---------- */
    function sinCard(R: Rect): void {
      const theme = th();
      const pad = F(14, 12);
      card(R, col.circ(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('sinT'), col.circ());
      const t = tri();
      const maxW = R.w - 2 * pad;
      let y = R.y + 28;
      y = line('\\f{\\c{a}{a}}{sin \\c{a}{α}} = \\f{\\c{b}{b}}{sin \\c{b}{β}} = \\f{\\c{c}{c}}{sin \\c{c}{γ}} = \\c{r}{2r}', R.x + pad, y, maxW, F(17, 15)) + 10;
      if (flat(t)) return;
      const s = sides(t);
      const w = angles(t);
      const q = sineQuotients(t);
      const fs = F(13.5, 12.5);
      for (let i = 0; i < 3; i++) {
        const k = NAMES[i]!;
        y = line(`\\c{${k}}{${K(k, n2(s[i]!))}} : sin ${K(ANG[i]!, n1(w[i]!))}° ≈ ${K(k, n2(s[i]!))} : ${K(ANG[i]!, fmt.fixed(Math.sin(w[i]! * DEG), 3))} ≈ ${Q(n2(q[i]!))}`, R.x + pad, y, maxW, fs) + 6;
      }
      const r2 = 2 * circumradius(t);
      line(`\\c{r}{\\t{${ctx.t('diam')}}} ≈ \\c{r}{${Q(n2(r2))} cm}`, R.x + pad, y + 2, maxW, fs, theme.text);
    }
    const sinH = () => 28 + F(17, 15) * 2.4 + 10 + 3 * (F(13.5, 12.5) * 1.3 + 6) + F(13.5, 12.5) * 1.3 + 18;

    function sinProof(R: Rect): void {
      const pad = F(14, 12);
      card(R, col.h(), 0.03);
      title(R.x + pad, R.y + 16, `${ctx.t('proofT')} h_c`, col.h());
      const t = tri();
      if (flat(t)) return;
      const s = sides(t);
      const w = angles(t);
      const maxW = R.w - 2 * pad;
      const fs = F(14, 12.5);
      let y = R.y + 30;
      const hc = s[1] * Math.sin(w[0] * DEG);
      y = line(`\\c{h}{h_c} = \\c{b}{b} · sin \\c{a}{α} ${p.show ? `≈ ${n2(s[1])} · ${fmt.fixed(Math.sin(w[0] * DEG), 3)} ≈ ${n2(hc)}` : ''}`, R.x + pad, y, maxW, fs) + 6;
      y = line(`\\c{h}{h_c} = \\c{a}{a} · sin \\c{b}{β} ${p.show ? `≈ ${n2(s[0])} · ${fmt.fixed(Math.sin(w[1] * DEG), 3)} ≈ ${n2(hc)}` : ''}`, R.x + pad, y, maxW, fs) + 8;
      y = line(`⇒ \\c{a}{a} · sin \\c{b}{β} = \\c{b}{b} · sin \\c{a}{α}   ⇒   \\f{\\c{a}{a}}{sin \\c{a}{α}} = \\f{\\c{b}{b}}{sin \\c{b}{β}}`, R.x + pad, y, maxW, fs) + 6;
      const obt = w[0] > 90 ? 'α' : w[1] > 90 ? 'β' : '';
      if (obt) line(`\\t{${tr('obt', { w: obt })}}`, R.x + pad, y, maxW, F(12, 11), th().muted);
    }
    const sinProofH = () => 30 + 2 * (F(14, 12.5) * 1.3 + 6) + F(14, 12.5) * 2.4 + 8 + 22;

    /* ---------- Karten: Kosinussatz ---------- */
    function cosCard(R: Rect): void {
      const pad = F(14, 12);
      card(R, col.c(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('cosT'), col.c());
      const t = tri();
      const maxW = R.w - 2 * pad;
      let y = R.y + 30;
      y = line('\\c{c}{c}² = \\c{a}{a}² + \\c{b}{b}² − 2\\c{a}{a}\\c{b}{b} · cos \\c{c}{γ}', R.x + pad, y, maxW, F(17, 15)) + 10;
      if (flat(t)) return;
      const s = sides(t);
      const w = angles(t);
      const [a, b, c] = s;
      const fs = F(13.5, 12.5);
      const corr = 2 * a * b * Math.cos(w[2] * DEG);
      y = line(`\\c{c}{c}² = ${n2(a)}² + ${n2(b)}² − 2 · ${n2(a)} · ${n2(b)} · cos ${n1(w[2])}°`, R.x + pad, y, maxW, fs) + 6;
      const ex = isExact(a * a, 2) && isExact(b * b, 2) && isExact(corr, 2);
      y = line(`\\c{c}{c}² ${ex ? '=' : '≈'} ${Q(n2(a * a))} + ${Q(n2(b * b))} ${corr >= 0 ? '−' : '+'} ${Q(n2(Math.abs(corr)))} ${ex ? '=' : '≈'} ${Q(n2(c * c))}`, R.x + pad, y, maxW, fs) + 6;
      y = line(`\\c{c}{c} ${p.show ? eq(c, 2) : '='} ${Q(n2(c))} cm`, R.x + pad, y, maxW, fs) + 12;
      title(R.x + pad, y + 2, ctx.t('invT'));
      y += 12;
      line(`cos \\c{c}{γ} = \\f{\\c{a}{a}² + \\c{b}{b}² − \\c{c}{c}²}{2\\c{a}{a}\\c{b}{b}} ${p.show ? `${eq(Math.cos(w[2] * DEG), 3)} ${fmt.fixed(Math.cos(w[2] * DEG), 3)}  ⇒  γ ${eq(w[2], 1)} ${n1(w[2])}°` : ''}`, R.x + pad, y, maxW, fs);
    }
    const cosH = () => 30 + F(17, 15) * 1.4 + 10 + 3 * (F(13.5, 12.5) * 1.3 + 6) + 18 + F(13.5, 12.5) * 2.6 + 10;

    function barsCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('barsT'));
      const t = tri();
      if (flat(t)) return;
      const s = sides(t);
      const w = angles(t);
      const [a, b, c] = s;
      const corr = 2 * a * b * Math.cos(w[2] * DEG);
      const total = Math.max(a * a + b * b, c * c, a * a + b * b - corr);
      const x0 = R.x + pad + F(62, 56);
      const x1 = R.x + R.w - pad - 4;
      const X = (v: number) => x0 + ((x1 - x0) * v) / (total * 1.02);
      const bh = clamp((R.h - 60) / 3 - 10, 12, 24);
      const y1 = R.y + 32;
      const y2 = y1 + bh + 14;
      const y3 = y2 + bh + 14;
      const bar = (from: number, to: number, y: number, c0: string, alpha = 0.75, dash = false) => {
        g.save();
        g.fillStyle = withAlpha(c0, theme.dark ? alpha * 0.9 : alpha);
        roundRect(g, X(Math.min(from, to)), y, Math.max(2, Math.abs(X(to) - X(from))), bh, 4);
        g.fill();
        if (dash) {
          g.strokeStyle = c0;
          g.setLineDash([4, 3]);
          g.lineWidth = 1.5;
          roundRect(g, X(Math.min(from, to)), y, Math.max(2, Math.abs(X(to) - X(from))), bh, 4);
          g.stroke();
        }
        g.restore();
      };
      const lf = mfont(F(13, 12));
      // Zeile 1: a² + b²
      text(g, 'a² + b²', R.x + pad, y1 + bh / 2, { font: lf, color: theme.muted, align: 'left' });
      bar(0, a * a, y1, col.a());
      bar(a * a, a * a + b * b, y1, col.b());
      // Zeile 2: Korrektur
      text(g, ctx.t('corr'), R.x + pad, y2 + bh / 2, { font: font(600, F(11, 10)), color: theme.muted, align: 'left' });
      if (Math.abs(corr) > 1e-6) bar(a * a + b * b, a * a + b * b - corr, y2, col.h(), 0.35, true);
      const cl = `−2ab · cos γ${p.show ? (Math.abs(corr) < 0.05 ? ' = 0' : ` ≈ ${corr >= 0 ? '−' : '+'}${n1(Math.abs(corr))}`) : ''}`;
      const xc = X(Math.min(a * a + b * b, a * a + b * b - corr));
      halo(cl, xc - 6, y2 + bh / 2, font(700, F(12, 11)), col.h(), 'right');
      // Zeile 3: c²
      text(g, 'c²', R.x + pad, y3 + bh / 2, { font: lf, color: theme.muted, align: 'left' });
      bar(0, c * c, y3, col.c());
      if (p.show) halo(n1(c * c), X(c * c) + 6, y3 + bh / 2, font(700, F(12, 11)), col.c(), X(c * c) + 50 > x1 ? 'right' : 'left');
      // Vergleich
      const gm = w[2];
      const key = Math.abs(gm - 90) < 0.05 ? 'eq' : gm < 90 ? 'lt' : 'gt';
      text(g, ctx.t(key), R.x + pad, Math.min(y3 + bh + 22, R.y + R.h - 12), { font: font(700, F(12, 11)), color: key === 'eq' ? col.c() : theme.text, align: 'left' });
      // Hilfslinie a² + b²
      g.save();
      g.strokeStyle = withAlpha(theme.text, 0.35);
      g.setLineDash([3, 3]);
      g.beginPath();
      g.moveTo(X(a * a + b * b), y1);
      g.lineTo(X(a * a + b * b), y3 + bh);
      g.stroke();
      g.restore();
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (dragging && now - dragging > 250) dragging = 0;
      const k = reduced || dragging ? 1 : 1 - Math.exp(-dt * 9);
      view.k = reduced ? 1 : 1 - Math.exp(-dt * 6);
      let moving = false;
      const goal = goalTri();
      shown = shown.map((q, i) => {
        const gq = goal[i]!;
        const d = Math.hypot(gq[0] - q[0], gq[1] - q[1]);
        if (d < 1e-3) return [gq[0], gq[1]];
        moving = true;
        return [q[0] + (gq[0] - q[0]) * k, q[1] + (gq[1] - q[1]) * k];
      });
      surface.begin();
      plot.resize();
      drawTriangle();
      const Cr = regions().col;
      const gap = F(10, 8);
      if (mode() === 'sin') {
        const h1 = sinH();
        sinCard({ x: Cr.x, y: Cr.y, w: Cr.w, h: h1 });
        if (p.h) {
          const h2 = sinProofH();
          if (Cr.h - h1 - gap >= h2 && !flat(tri())) sinProof({ x: Cr.x, y: Cr.y + h1 + gap, w: Cr.w, h: h2 });
        }
      } else {
        const h1 = cosH();
        cosCard({ x: Cr.x, y: Cr.y, w: Cr.w, h: h1 });
        const rest = Cr.h - h1 - gap;
        if (rest >= 130) barsCard({ x: Cr.x, y: Cr.y + h1 + gap, w: Cr.w, h: Math.min(rest, F(170, 160)) });
      }
      if (moving || dragging || intro.running || view.moving) ctx.requestRender();
    }

    function randomTriangle(): void {
      for (let n = 0; n < 200; n++) {
        const r = () => Math.round(Math.random() * 10) / 10;
        const t: Tri = [
          [0.5 + r() * 4, 0.5 + r() * 3],
          [7 + r() * 4.5, 0.5 + r() * 3],
          [1 + r() * 10, 4 + r() * 3.5],
        ];
        if (minAngle(t) >= 25 && Math.abs(area2(t)) > 20) {
          ctx.set({ ax: t[0][0], ay: t[0][1], bx: t[1][0], by: t[1][1], cx: t[2][0], cy: t[2][1] });
          return;
        }
      }
    }

    return {
      update(changed) {
        if (changed.has('m') || changed.has('h')) intro.play();
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (id === 'rand') randomTriangle();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
