import { defineSimulation, ease, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  altitudeFeet,
  angles,
  bisectorFoot,
  centroid,
  circumcenter,
  degenerate,
  dist,
  incenter,
  inradius,
  kind,
  midpoints,
  onSegment,
  orthocenter,
  touchPoints,
  type Pt,
  type Tri,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'ms' | 'wh' | 'sh' | 'h' | 'eu';
type Px = [number, number];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const W = 16;
const H = 12;

/**
 * Die besonderen Linien im Dreieck: Mittelsenkrechten mit Umkreis,
 * Winkelhalbierende mit Inkreis, Seitenhalbierende mit Schwerpunkt, Höhen mit
 * Höhenschnittpunkt und die Euler-Gerade. Das Dreieck lässt sich an den Ecken
 * ziehen; beim Wechsel wachsen die Linien nacheinander ins Bild.
 */
export default defineSimulation({
  id: 'besondere-linien',
  dragHint: true,
  layout: { aspect: 1.9, aspectNarrow: 0.52 },
  groups: [
    { id: 'pts', label: L('Ecken (in cm)', 'Vertices (in cm)') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'm',
      type: 'choice',
      label: L('Linien', 'Lines'),
      options: [
        { value: 'ms', label: L('Mittelsenkrechten → Umkreis', 'Perpendicular bisectors → circumcircle') },
        { value: 'wh', label: L('Winkelhalbierende → Inkreis', 'Angle bisectors → incircle') },
        { value: 'sh', label: L('Seitenhalbierende → Schwerpunkt', 'Medians → centroid') },
        { value: 'h', label: L('Höhen → Höhenschnittpunkt', 'Altitudes → orthocentre') },
        { value: 'eu', label: L('Euler-Gerade', 'Euler line') },
      ],
      default: 'ms',
    },
    { key: 'ax', type: 'number', group: 'pts', label: L('A: x', 'A: x'), min: 0.5, max: W - 0.5, step: 0.1, default: 3, unit: 'cm' },
    { key: 'ay', type: 'number', group: 'pts', label: L('A: y', 'A: y'), min: 0.5, max: H - 0.5, step: 0.1, default: 2, unit: 'cm' },
    { key: 'bx', type: 'number', group: 'pts', label: L('B: x', 'B: x'), min: 0.5, max: W - 0.5, step: 0.1, default: 12.5, unit: 'cm' },
    { key: 'by', type: 'number', group: 'pts', label: L('B: y', 'B: y'), min: 0.5, max: H - 0.5, step: 0.1, default: 2.5, unit: 'cm' },
    { key: 'cx', type: 'number', group: 'pts', label: L('C: x', 'C: x'), min: 0.5, max: W - 0.5, step: 0.1, default: 7, unit: 'cm' },
    { key: 'cy', type: 'number', group: 'pts', label: L('C: y', 'C: y'), min: 0.5, max: H - 0.5, step: 0.1, default: 9.5, unit: 'cm' },
    { key: 'pt', type: 'boolean', group: 'view', label: L('Schnittpunkt und Kreis zeigen', 'Show the point and the circle'), help: L('Aus: Die Linien selbst untersuchen – schneiden sie sich in einem Punkt?', 'Off: explore the lines yourself – do they meet in one point?'), default: true },
    { key: 'aux', type: 'boolean', group: 'view', label: L('Hilfslinien und Maße', 'Helper lines and measures'), default: true },
  ],
  actions: [{ id: 'redraw', label: L('Linien neu zeichnen', 'Draw the lines again') }],
  readouts: [
    { key: 'pt', label: L('Schnittpunkt', 'Point'), spoiler: true },
    { key: 'prop', label: L('Eigenschaft', 'Property'), spoiler: true },
    { key: 'kind', label: L('Dreieck', 'Triangle') },
  ],
  presets: [
    { id: 'spitz', label: L('Spitzwinkliges Dreieck', 'Acute triangle'), values: {} },
    { id: 'stumpf', label: L('Stumpfwinklig: Umkreis', 'Obtuse: circumcircle'), values: { ax: 2, ay: 2.5, bx: 14, by: 2.5, cx: 5, cy: 5.5 } },
    { id: 'recht', label: L('Rechtwinklig: Höhen', 'Right-angled: altitudes'), values: { m: 'h', ax: 3, ay: 2, bx: 13, by: 2, cx: 3, cy: 8.5 } },
    { id: 'inkreis', label: L('Inkreis', 'Incircle'), values: { m: 'wh', ax: 2.5, ay: 1.5, bx: 13.5, by: 2, cx: 8.5, cy: 9 } },
    { id: 'schwer', label: L('Schwerpunkt 2 : 1', 'Centroid 2 : 1'), values: { m: 'sh', ax: 2, ay: 1.5, bx: 14, by: 3, cx: 6, cy: 9 } },
    { id: 'gleich', label: L('Gleichseitig: alle Punkte fallen zusammen', 'Equilateral: all points coincide'), values: { m: 'eu', ax: 4, ay: 1.5, bx: 12, by: 1.5, cx: 8, cy: 8.4 } },
  ],
  strings: {
    de: {
      canvas: 'Karopapier mit einem Dreieck ABC, dessen Ecken man ziehen kann, und wahlweise den Mittelsenkrechten mit Umkreis, den Winkelhalbierenden mit Inkreis, den Seitenhalbierenden mit Schwerpunkt, den Höhen mit Höhenschnittpunkt oder der Euler-Geraden',
      nameU: 'Umkreismittelpunkt U',
      nameI: 'Inkreismittelpunkt I',
      nameS: 'Schwerpunkt S',
      nameH: 'Höhenschnittpunkt H',
      nameE: 'Euler-Gerade',
      propU: 'U ist von allen drei Ecken gleich weit entfernt.',
      propI: 'I ist von allen drei Seiten gleich weit entfernt.',
      propS: 'S teilt jede Seitenhalbierende im Verhältnis 2 : 1.',
      propH: 'Die drei Höhen (oder ihre Verlängerungen) schneiden sich in H.',
      propE: 'U, S und H liegen auf einer Geraden; S teilt [HU] im Verhältnis 2 : 1.',
      merkeT: 'Merke',
      merkeU: 'Die Mittelsenkrechten der drei Seiten schneiden sich in einem Punkt U. Er ist von A, B und C gleich weit entfernt und ist der Mittelpunkt des Umkreises.',
      merkeI: 'Die Winkelhalbierenden der drei Innenwinkel schneiden sich in einem Punkt I. Er ist von allen drei Seiten gleich weit entfernt und ist der Mittelpunkt des Inkreises, der jede Seite berührt.',
      merkeS: 'Eine Seitenhalbierende verbindet eine Ecke mit dem Mittelpunkt der Gegenseite. Die drei Seitenhalbierenden schneiden sich im Schwerpunkt S – dort lässt sich ein Dreieck aus Pappe auf einer Nadelspitze balancieren.',
      merkeH: 'Eine Höhe ist das Lot von einer Ecke auf die Gegenseite (oder ihre Verlängerung). Die drei Höhen schneiden sich in einem Punkt H. Beim rechtwinkligen Dreieck ist H die Ecke mit dem rechten Winkel.',
      merkeE: 'In jedem nicht gleichseitigen Dreieck liegen U, S und H auf einer Geraden, der Euler-Geraden. Im gleichseitigen Dreieck fallen alle besonderen Punkte zusammen.',
      whereT: 'Wo liegt {p}?',
      kSpitz: 'spitzwinklig',
      kRecht: 'rechtwinklig',
      kStumpf: 'stumpfwinklig',
      wIn: 'innen',
      wSide: 'auf der Seite',
      wCorner: 'in der Ecke',
      wOut: 'außen',
      always: 'Liegt immer innerhalb des Dreiecks.',
      distT: 'Abstände von {p}',
      ratioT: 'Teilung der Seitenhalbierenden',
      eulerT: 'Abstände auf der Euler-Geraden',
      hiddenT: 'Was fällt dir auf?',
      hidden: 'Schneiden sich alle drei Linien in einem Punkt? Ziehe die Ecken – bleibt das so? Schalte dann „Schnittpunkt und Kreis zeigen“ ein.',
      degen: 'A, B und C liegen (fast) auf einer Geraden – das ist kein Dreieck.',
      offPaper: '{p} liegt außerhalb des Blattes.',
      equi: 'Gleichseitig: U, I, S und H fallen zusammen.',
      ptRead: '{p} {c}',
      kindRead: '{k}; α ≈ {a}, β ≈ {b}, γ ≈ {g}',
      eqTag: 'alle gleich',
      balance: 'balanciert',
      in: 'innen',
      out: 'außen',
      onSide: 'auf dem Rand',
    },
    en: {
      canvas: 'Squared paper with a triangle ABC whose vertices can be dragged, showing either the perpendicular bisectors with the circumcircle, the angle bisectors with the incircle, the medians with the centroid, the altitudes with the orthocentre or the Euler line',
      nameU: 'Circumcentre U',
      nameI: 'Incentre I',
      nameS: 'Centroid S',
      nameH: 'Orthocentre H',
      nameE: 'Euler line',
      propU: 'U is equally far from all three vertices.',
      propI: 'I is equally far from all three sides.',
      propS: 'S divides every median in the ratio 2 : 1.',
      propH: 'The three altitudes (or their extensions) meet at H.',
      propE: 'U, S and H lie on one line; S divides HU in the ratio 2 : 1.',
      merkeT: 'Remember',
      merkeU: 'The perpendicular bisectors of the three sides meet at one point U. It is equally far from A, B and C and is the centre of the circumcircle.',
      merkeI: 'The bisectors of the three interior angles meet at one point I. It is equally far from all sides and is the centre of the incircle, which touches every side.',
      merkeS: 'A median joins a vertex to the midpoint of the opposite side. The three medians meet at the centroid S – a cardboard triangle balances on a pin there.',
      merkeH: 'An altitude is the perpendicular from a vertex to the opposite side (or its extension). The three altitudes meet at one point H. In a right triangle, H is the vertex with the right angle.',
      merkeE: 'In every triangle that is not equilateral, U, S and H lie on one line, the Euler line. In an equilateral triangle all special points coincide.',
      whereT: 'Where is {p}?',
      kSpitz: 'acute',
      kRecht: 'right',
      kStumpf: 'obtuse',
      wIn: 'inside',
      wSide: 'on a side',
      wCorner: 'at a vertex',
      wOut: 'outside',
      always: 'Always lies inside the triangle.',
      distT: 'Distances from {p}',
      ratioT: 'How S divides the medians',
      eulerT: 'Distances on the Euler line',
      hiddenT: 'What do you notice?',
      hidden: 'Do all three lines meet at one point? Drag the vertices – does that stay true? Then switch on “Show the point and the circle”.',
      degen: 'A, B and C lie (almost) on one line – that is not a triangle.',
      offPaper: '{p} lies off the sheet.',
      equi: 'Equilateral: U, I, S and H coincide.',
      ptRead: '{p} {c}',
      kindRead: '{k}; α ≈ {a}, β ≈ {b}, γ ≈ {g}',
      eqTag: 'all equal',
      balance: 'balances',
      in: 'inside',
      out: 'outside',
      onSide: 'on the boundary',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    const mode = () => p.m as Mode;
    const wide = () => surface.width >= 640;
    const F = (w: number, n: number) => (wide() ? w : n);
    const font = (weight: number, size: number) => `${weight} ${size}px ${ctx.theme.font}`;
    const cm = (v: number) => `${fmt.num(v, 1)} cm`;

    const col = {
      v: () => [ctx.theme.series[0]!, ctx.theme.series[1]!, ctx.theme.series[5]!],
      pt: () => ctx.theme.series[4]!,
      u: () => ctx.theme.series[4]!,
      s: () => ctx.theme.series[3]!,
      h: () => ctx.theme.series[2]!,
      right: () => ctx.theme.series[2]!,
    };

    const tri = (): Tri => [
      [p.ax, p.ay],
      [p.bx, p.by],
      [p.cx, p.cy],
    ];

    /* ---------- Zustand ---------- */
    const grow = new Tween(1700, ease.linear);
    let hits: { id: string; r: Rect }[] = [];
    let hover: string | null = null;
    let drag: 0 | 1 | 2 | null = null;

    /* ---------- Aufteilung ---------- */
    type Layout = { paper: Rect; cell: number; side: Rect | null; below: Rect | null };
    function layout(): Layout {
      const Wd = surface.width;
      const Ht = surface.height;
      const gap = wide() ? 12 : 8;
      if (Wd > Ht * 1.05) {
        const colW = Math.round(wide() ? clamp(Wd * 0.34, 260, 330) : clamp(Wd * 0.38, 200, 260));
        const leftW = Wd - colW - gap;
        const cell = Math.min((leftW - 4) / W, (Ht - 4) / H);
        const pw = cell * W;
        const ph = cell * H;
        return { paper: { x: Math.round((leftW - pw) / 2), y: Math.round((Ht - ph) / 2), w: pw, h: ph }, cell, side: { x: Wd - colW, y: 2, w: colW - 2, h: Ht - 4 }, below: null };
      }
      const cell = (Wd - 4) / W;
      const ph = cell * H;
      return { paper: { x: 2, y: 2, w: Wd - 4, h: ph }, cell, side: null, below: { x: 2, y: ph + 2 + gap, w: Wd - 4, h: Ht - ph - 4 - gap } };
    }
    function toPx(q: Pt): Px {
      const { paper, cell } = layout();
      return [paper.x + q[0] * cell, paper.y + (H - q[1]) * cell];
    }
    function toWorld(px: number, py: number): Pt {
      const { paper, cell } = layout();
      return [(px - paper.x) / cell, H - (py - paper.y) / cell];
    }

    /* ---------- Zahlen ---------- */
    const ptText = (q: Pt) => fmt.point(Math.round(q[0] * 10) / 10, Math.round(q[1] * 10) / 10);

    function updateReadouts(): void {
      const t = tri();
      ctx.readout('pt', null);
      ctx.readout('prop', null);
      if (degenerate(t, 0.05)) {
        ctx.readout('kind', ctx.t('degen'));
        return;
      }
      const [a, b, g] = angles(t);
      const k = kind(t, 0.05);
      ctx.readout('kind', tr('kindRead', { k: ctx.t(k === 'spitz' ? 'kSpitz' : k === 'recht' ? 'kRecht' : 'kStumpf'), a: `${fmt.num(a, 1)}°`, b: `${fmt.num(b, 1)}°`, g: `${fmt.num(g, 1)}°` }));
      const m = mode();
      if (m === 'ms') {
        const u = circumcenter(t)!;
        ctx.readout('pt', tr('ptRead', { p: 'U', c: ptText(u) }));
        ctx.readout('prop', `r = |UA| = |UB| = |UC| ≈ ${cm(dist(u, t[0]))}`);
      } else if (m === 'wh') {
        const i = incenter(t);
        ctx.readout('pt', tr('ptRead', { p: 'I', c: ptText(i) }));
        ctx.readout('prop', `ρ ≈ ${cm(inradius(t))}`);
      } else if (m === 'sh') {
        const s = centroid(t);
        ctx.readout('pt', tr('ptRead', { p: 'S', c: ptText(s) }));
        ctx.readout('prop', ctx.t('propS'));
      } else if (m === 'h') {
        const h = orthocenter(t)!;
        ctx.readout('pt', tr('ptRead', { p: 'H', c: ptText(h) }));
        ctx.readout('prop', ctx.t('propH'));
      } else {
        const u = circumcenter(t)!;
        const s = centroid(t);
        const h = orthocenter(t)!;
        ctx.readout('pt', `U ${ptText(u)}, S ${ptText(s)}, H ${ptText(h)}`);
        ctx.readout('prop', `|HS| ≈ ${cm(dist(h, s))}, |SU| ≈ ${cm(dist(s, u))}`);
      }
      ctx.setAction('redraw', { enabled: !ctx.locked });
    }

    /* ---------- Bausteine ---------- */
    function card(r: Rect, accent?: string, tint = 0): void {
      const g = surface.g;
      const theme = ctx.theme;
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
    function wrap(str: string, maxW: number, f: string): string[] {
      const g = surface.g;
      g.font = f;
      str = str.replace(/ ([=:]) /g, ' $1 ').replace(/ (cm)/g, ' $1');
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
    function textRows(rows: string[], x: number, y: number, lh: number, f: string, color: string): number {
      rows.forEach((row, i) => text(surface.g, row, x, y + i * lh, { font: f, color, align: 'left', baseline: 'middle' }));
      return rows.length * lh;
    }
    function title(x: number, y: number, label: string, color = ctx.theme.muted): void {
      text(surface.g, label, x, y, { font: font(700, F(12, 11)), color, align: 'left' });
    }
    function haloText(str: string, x: number, y: number, f: string, color: string, align: CanvasTextAlign = 'center'): void {
      const g = surface.g;
      g.save();
      g.font = f;
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      g.lineWidth = 4;
      g.strokeStyle = ctx.theme.bg;
      g.strokeText(str, x, y);
      g.fillStyle = color;
      g.fillText(str, x, y);
      g.restore();
    }
    function labelIn(str: string, x: number, y: number, f: string, color: string): void {
      const { paper } = layout();
      surface.g.font = f;
      const w = surface.g.measureText(str).width / 2 + 5;
      haloText(str, clamp(x, paper.x + w, paper.x + paper.w - w), clamp(y, paper.y + 10, paper.y + paper.h - 10), f, color);
    }
    function unit(dx: number, dy: number): Px {
      const l = Math.hypot(dx, dy) || 1;
      return [dx / l, dy / l];
    }
    function segment(a: Px, b: Px, color: string, width: number, dash?: number[]): void {
      const g = surface.g;
      g.save();
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      if (dash) g.setLineDash(dash);
      g.beginPath();
      g.moveTo(a[0], a[1]);
      g.lineTo(b[0], b[1]);
      g.stroke();
      g.restore();
    }
    function dot(q: Px, r: number, color: string): void {
      const g = surface.g;
      g.beginPath();
      g.arc(q[0], q[1], r, 0, Math.PI * 2);
      g.fillStyle = color;
      g.fill();
    }
    function ticks(mx: number, my: number, d: Px, n: number, color: string, len = 5.5): void {
      const g = surface.g;
      const nx = -d[1];
      const ny = d[0];
      g.save();
      g.strokeStyle = color;
      g.lineWidth = 2;
      g.lineCap = 'round';
      for (let k = 0; k < n; k++) {
        const off = (k - (n - 1) / 2) * 4.5;
        g.beginPath();
        g.moveTo(mx + d[0] * off - nx * len, my + d[1] * off - ny * len);
        g.lineTo(mx + d[0] * off + nx * len, my + d[1] * off + ny * len);
        g.stroke();
      }
      g.restore();
    }
    function rightMark(z: Px, d1: Px, d2: Px, color: string, r = 10): void {
      const g = surface.g;
      const a1 = Math.atan2(d1[1], d1[0]);
      let diff = Math.atan2(d2[1], d2[0]) - a1;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      g.save();
      g.beginPath();
      g.moveTo(z[0], z[1]);
      g.arc(z[0], z[1], r, a1, a1 + diff, diff < 0);
      g.closePath();
      g.fillStyle = withAlpha(color, 0.16);
      g.fill();
      g.beginPath();
      g.arc(z[0], z[1], r, a1, a1 + diff, diff < 0);
      g.strokeStyle = color;
      g.lineWidth = 1.5;
      g.stroke();
      const m = a1 + diff / 2;
      dot([z[0] + Math.cos(m) * r * 0.5, z[1] + Math.sin(m) * r * 0.5], 1.7, color);
      g.restore();
    }
    /** Gerade durch a mit Pixelrichtung d, gezeichnet ab Parameter s0 bis s1 (Pixel), Anteil t. */
    function growLine(a: Px, d: Px, s0: number, s1: number, t: number, color: string, width: number, dash?: number[]): void {
      if (t <= 0) return;
      const e = ease.inOutCubic(clamp(t, 0, 1));
      const sMid = (s0 + s1) / 2;
      const h = ((s1 - s0) / 2) * e;
      segment([a[0] + d[0] * (sMid - h), a[1] + d[1] * (sMid - h)], [a[0] + d[0] * (sMid + h), a[1] + d[1] * (sMid + h)], color, width, dash);
    }
    /** Gerade durch a mit Richtung d über die ganze Zeichenfläche (Parameterbereich in Pixeln). */
    function lineRange(a: Px, d: Px): [number, number] {
      const { paper } = layout();
      let t0 = -Infinity;
      let t1 = Infinity;
      const lim: [number, number, number, number][] = [
        [d[0], a[0], paper.x, paper.x + paper.w],
        [d[1], a[1], paper.y, paper.y + paper.h],
      ];
      for (const [dd, s, lo, hi] of lim) {
        if (Math.abs(dd) < 1e-9) continue;
        let u0 = (lo - s) / dd;
        let u1 = (hi - s) / dd;
        if (u0 > u1) [u0, u1] = [u1, u0];
        t0 = Math.max(t0, u0);
        t1 = Math.min(t1, u1);
      }
      if (!Number.isFinite(t0) || !Number.isFinite(t1) || t1 < t0) return [-1, 1];
      return [t0, t1];
    }

    /** Zeitanteil der i-ten Linie (gestaffelt) bzw. des Schnittpunkts. */
    const lineT = (i: number) => (reduced ? 1 : clamp((grow.t * 1.7 - i * 0.28) / 0.75, 0, 1));
    const pointT = () => (reduced ? 1 : clamp((grow.t - 0.72) / 0.28, 0, 1));

    /* ---------- Papier ---------- */
    function drawPaper(R: Rect, cell: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.bg;
      roundRect(g, R.x, R.y, R.w, R.h, 10);
      g.fill();
      g.restore();
      g.lineWidth = 1;
      for (const major of [false, true]) {
        g.strokeStyle = major ? withAlpha(theme.grid, 0.9) : theme.gridMinor;
        g.beginPath();
        for (let k = 1; k < W * 2; k++) {
          if ((k % 2 === 0) !== major) continue;
          const x = Math.round(R.x + (k / 2) * cell) + 0.5;
          g.moveTo(x, R.y);
          g.lineTo(x, R.y + R.h);
        }
        for (let k = 1; k < H * 2; k++) {
          if ((k % 2 === 0) !== major) continue;
          const y = Math.round(R.y + (k / 2) * cell) + 0.5;
          g.moveTo(R.x, y);
          g.lineTo(R.x + R.w, y);
        }
        g.stroke();
      }
    }

    /* ---------- Figur ---------- */
    let pointLabelAvoid: Px[] = [];

    function drawTriangle(px: [Px, Px, Px]): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.beginPath();
      px.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
      g.fillStyle = withAlpha(theme.text, theme.dark ? 0.08 : 0.045);
      g.fill();
      g.strokeStyle = theme.text;
      g.lineWidth = 2.6;
      g.lineJoin = 'round';
      g.stroke();
      g.restore();
    }

    /** Besonderer Punkt mit Namen; außerhalb des Blattes ein Pfeil am Rand. */
    function specialPoint(q: Pt, name: string, color: string, sc: number, avoid: Px[]): void {
      const g = surface.g;
      const theme = ctx.theme;
      const { paper } = layout();
      const pq = toPx(q);
      const insideP = pq[0] > paper.x + 4 && pq[0] < paper.x + paper.w - 4 && pq[1] > paper.y + 4 && pq[1] < paper.y + paper.h - 4;
      if (!insideP) {
        const inset = 16;
        const e: Px = [clamp(pq[0], paper.x + inset, paper.x + paper.w - inset), clamp(pq[1], paper.y + inset, paper.y + paper.h - inset)];
        const d = unit(pq[0] - e[0], pq[1] - e[1]);
        const tip: Px = [e[0] + d[0] * 9, e[1] + d[1] * 9];
        g.save();
        g.globalAlpha = sc;
        segment([e[0] - d[0] * 7, e[1] - d[1] * 7], tip, color, 2.6);
        g.beginPath();
        g.moveTo(tip[0] + d[0] * 3, tip[1] + d[1] * 3);
        g.lineTo(tip[0] - d[0] * 6 - d[1] * 6, tip[1] - d[1] * 6 + d[0] * 6);
        g.lineTo(tip[0] - d[0] * 6 + d[1] * 6, tip[1] - d[1] * 6 - d[0] * 6);
        g.closePath();
        g.fillStyle = color;
        g.fill();
        haloText(name, e[0] - d[0] * 20 + d[1] * 14, e[1] - d[1] * 20 - d[0] * 14, font(800, F(15, 13)), color);
        g.restore();
        return;
      }
      const s = ease.outBack(clamp(sc, 0, 1));
      if (s <= 0) return;
      g.save();
      g.translate(pq[0], pq[1]);
      g.scale(s, s);
      g.beginPath();
      g.arc(0, 0, 11, 0, Math.PI * 2);
      g.fillStyle = withAlpha(color, 0.18);
      g.fill();
      g.beginPath();
      g.arc(0, 0, 5.5, 0, Math.PI * 2);
      g.fillStyle = color;
      g.fill();
      g.strokeStyle = theme.bg;
      g.lineWidth = 2;
      g.stroke();
      g.restore();
      // Name in die freieste Richtung
      let bx = 0;
      let by = 0;
      for (const a of avoid) {
        const [ux, uy] = unit(a[0] - pq[0], a[1] - pq[1]);
        bx -= ux;
        by -= uy;
      }
      let [dx, dy] = unit(bx || 0.7, by || -0.7);
      if (Math.hypot(bx, by) < 0.2) [dx, dy] = [0.7, -0.7];
      g.save();
      g.globalAlpha = clamp(sc * 1.5, 0, 1);
      labelIn(name, pq[0] + dx * 19, pq[1] + dy * 19, font(800, F(15, 13)), color);
      g.restore();
      pointLabelAvoid.push(pq);
    }

    function drawMS(t: Tri, px: [Px, Px, Px]): void {
      const cv = col.v();
      const mids = midpoints(t);
      const u = circumcenter(t);
      // Mittelsenkrechte der Seite i (gegenüber Ecke i), Farbe der Gegenecke
      for (let i = 0; i < 3; i++) {
        const a = px[(i + 1) % 3]!;
        const b = px[(i + 2) % 3]!;
        const m = toPx(mids[i]!);
        const d = unit(-(b[1] - a[1]), b[0] - a[0]);
        const [s0, s1] = lineRange(m, d);
        const lt = lineT(i);
        growLine(m, d, s0, s1, lt, withAlpha(cv[i]!, 0.9), 2.2);
        if (p.aux && lt >= 1) {
          const toB = unit(b[0] - m[0], b[1] - m[1]);
          const third = px[i]!;
          const inn: Px = d[0] * (third[0] - m[0]) + d[1] * (third[1] - m[1]) >= 0 ? d : [-d[0], -d[1]];
          rightMark(m, toB, inn, cv[i]!, F(9, 8));
          ticks((a[0] + m[0]) / 2, (a[1] + m[1]) / 2, toB, i + 1, cv[i]!);
          ticks((b[0] + m[0]) / 2, (b[1] + m[1]) / 2, toB, i + 1, cv[i]!);
          dot(m, 2.6, cv[i]!);
        }
      }
      if (!u || !p.pt) return;
      const pt = pointT();
      if (pt <= 0) return;
      const pu = toPx(u);
      const r = dist(u, t[0]) * layout().cell;
      const g = surface.g;
      g.save();
      g.beginPath();
      g.arc(pu[0], pu[1], r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ease.inOutCubic(pt));
      g.strokeStyle = col.u();
      g.lineWidth = 2.6;
      g.stroke();
      g.restore();
      if (p.aux) {
        g.save();
        g.globalAlpha = pt;
        px.forEach((q) => {
          segment(pu, q, withAlpha(col.u(), 0.75), 1.6, [6, 5]);
          ticks((pu[0] + q[0]) / 2, (pu[1] + q[1]) / 2, unit(q[0] - pu[0], q[1] - pu[1]), 1, col.u());
        });
        g.restore();
      }
      specialPoint(u, 'U', col.u(), pt, px);
    }

    function drawWH(t: Tri, px: [Px, Px, Px]): void {
      const cv = col.v();
      const i0 = incenter(t);
      const pi = toPx(i0);
      const ang = angles(t);
      const g = surface.g;
      for (let i = 0; i < 3; i++) {
        const v = px[i]!;
        const f = toPx(bisectorFoot(t, i as 0 | 1 | 2));
        const d = unit(f[0] - v[0], f[1] - v[1]);
        const len = Math.hypot(f[0] - v[0], f[1] - v[1]);
        const lt = lineT(i);
        // Winkelhalbierende als Strecke bis zur Gegenseite (ein Stück darüber hinaus)
        if (lt > 0) {
          const e = ease.inOutCubic(lt);
          segment(v, [v[0] + d[0] * len * e, v[1] + d[1] * len * e], withAlpha(cv[i]!, 0.9), 2.2);
        }
        if (p.aux && lt >= 1) {
          // zwei gleiche Teilwinkel
          const a = px[(i + 1) % 3]!;
          const b = px[(i + 2) % 3]!;
          const aa = Math.atan2(a[1] - v[1], a[0] - v[0]);
          const ab = Math.atan2(b[1] - v[1], b[0] - v[0]);
          const am = Math.atan2(d[1], d[0]);
          const r = F(24, 20) - (ang[i]! > 100 ? 4 : 0);
          for (const [x0, x1] of [
            [aa, am],
            [am, ab],
          ] as [number, number][]) {
            let diff = x1 - x0;
            while (diff > Math.PI) diff -= 2 * Math.PI;
            while (diff < -Math.PI) diff += 2 * Math.PI;
            g.beginPath();
            g.moveTo(v[0], v[1]);
            g.arc(v[0], v[1], r, x0, x0 + diff, diff < 0);
            g.closePath();
            g.fillStyle = withAlpha(cv[i]!, ctx.theme.dark ? 0.24 : 0.15);
            g.fill();
            g.beginPath();
            g.arc(v[0], v[1], r, x0, x0 + diff, diff < 0);
            g.strokeStyle = cv[i]!;
            g.lineWidth = 1.5;
            g.stroke();
            const mm = x0 + diff / 2;
            segment([v[0] + Math.cos(mm) * (r - 4), v[1] + Math.sin(mm) * (r - 4)], [v[0] + Math.cos(mm) * (r + 4), v[1] + Math.sin(mm) * (r + 4)], cv[i]!, 1.5);
          }
        }
      }
      if (!p.pt) return;
      const pt = pointT();
      if (pt <= 0) return;
      const rho = inradius(t) * layout().cell;
      g.save();
      g.beginPath();
      g.arc(pi[0], pi[1], rho, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ease.inOutCubic(pt));
      g.strokeStyle = col.pt();
      g.lineWidth = 2.6;
      g.stroke();
      if (p.aux) {
        g.globalAlpha = pt;
        touchPoints(t).forEach((q, i) => {
          const pq = toPx(q);
          segment(pi, pq, withAlpha(col.pt(), 0.8), 1.6, [6, 5]);
          const a = px[(i + 1) % 3]!;
          rightMark(pq, unit(a[0] - pq[0], a[1] - pq[1]), unit(pi[0] - pq[0], pi[1] - pq[1]), col.pt(), F(8, 7));
          ticks((pi[0] + pq[0]) / 2, (pi[1] + pq[1]) / 2, unit(pq[0] - pi[0], pq[1] - pi[1]), 1, col.pt());
          dot(pq, 2.6, col.pt());
        });
      }
      g.restore();
      specialPoint(i0, 'I', col.pt(), pt, px);
    }

    function drawSH(t: Tri, px: [Px, Px, Px]): void {
      const cv = col.v();
      const mids = midpoints(t);
      const s = centroid(t);
      for (let i = 0; i < 3; i++) {
        const v = px[i]!;
        const m = toPx(mids[i]!);
        const lt = lineT(i);
        if (lt > 0) {
          const e = ease.inOutCubic(lt);
          segment(v, [lerp(v[0], m[0], e), lerp(v[1], m[1], e)], withAlpha(cv[i]!, 0.9), 2.2);
        }
        if (p.aux && lt >= 1) {
          const a = px[(i + 1) % 3]!;
          const b = px[(i + 2) % 3]!;
          const ab = unit(b[0] - a[0], b[1] - a[1]);
          ticks((a[0] + m[0]) / 2, (a[1] + m[1]) / 2, ab, i + 1, cv[i]!);
          ticks((b[0] + m[0]) / 2, (b[1] + m[1]) / 2, ab, i + 1, cv[i]!);
          dot(m, 3, cv[i]!);
          const pt = pointT();
          if (p.pt && pt > 0) {
            // Teilung 2 : 1 als Perlen: zwei Abschnitte Ecke–S, einer S–M
            const g = surface.g;
            g.save();
            g.globalAlpha = pt;
            for (const k of [1 / 3, 2 / 3]) dot([lerp(v[0], m[0], k), lerp(v[1], m[1], k)], 2.4, cv[i]!);
            g.restore();
          }
        }
      }
      if (!p.pt) return;
      const pt = pointT();
      if (pt <= 0) return;
      specialPoint(s, 'S', col.s(), pt, px);
    }

    function drawH(t: Tri, px: [Px, Px, Px]): void {
      const cv = col.v();
      const feet = altitudeFeet(t);
      const h = orthocenter(t);
      for (let i = 0; i < 3; i++) {
        const v = px[i]!;
        const a = px[(i + 1) % 3]!;
        const b = px[(i + 2) % 3]!;
        const f = toPx(feet[i]!);
        const lt = lineT(i);
        const onSeg = onSegment(feet[i]!, t[(i + 1) % 3]!, t[(i + 2) % 3]!);
        if (lt > 0) {
          // Verlängerung der Seite, falls der Fußpunkt außerhalb liegt
          if (!onSeg && p.aux) {
            const near = Math.hypot(f[0] - a[0], f[1] - a[1]) < Math.hypot(f[0] - b[0], f[1] - b[1]) ? a : b;
            segment(near, [lerp(near[0], f[0], ease.inOutCubic(lt)), lerp(near[1], f[1], ease.inOutCubic(lt))], withAlpha(ctx.theme.text, 0.5), 1.5, [5, 4]);
          }
          const e = ease.inOutCubic(lt);
          segment(v, [lerp(v[0], f[0], e), lerp(v[1], f[1], e)], withAlpha(cv[i]!, 0.9), 2.2);
        }
        if (lt >= 1 && Math.hypot(f[0] - v[0], f[1] - v[1]) > 3) {
          if (p.aux) rightMark(f, unit(v[0] - f[0], v[1] - f[1]), unit(a[0] - f[0], a[1] - f[1]), cv[i]!, F(9, 8));
          dot(f, 2.6, cv[i]!);
        }
      }
      if (!h || !p.pt) return;
      const pt = pointT();
      if (pt <= 0) return;
      // Verlängerungen der Höhen bis H (bei stumpfen Dreiecken außerhalb)
      if (kind(t, 0.05) === 'stumpf') {
        const g = surface.g;
        g.save();
        g.globalAlpha = pt;
        const ph = toPx(h);
        for (let i = 0; i < 3; i++) segment(px[i]!, ph, withAlpha(cv[i]!, 0.7), 1.6, [5, 4]);
        g.restore();
      }
      specialPoint(h, 'H', col.h(), pt, px);
    }

    function drawEU(t: Tri, px: [Px, Px, Px]): void {
      const u = circumcenter(t);
      const h = orthocenter(t);
      const s = centroid(t);
      if (!u || !h) return;
      const pu = toPx(u);
      const ph = toPx(h);
      const lt = lineT(0);
      const same = dist(u, h) < 0.05;
      if (!same && lt > 0) {
        const d = unit(ph[0] - pu[0], ph[1] - pu[1]);
        const [s0, s1] = lineRange(pu, d);
        growLine(pu, d, s0, s1, lt, withAlpha(col.s(), 0.95), 2.6);
        if (p.aux && lt >= 1) {
          // Teilung |HS| = 2·|SU| mit Strichen
          const ps = toPx(s);
          ticks(lerp(ph[0], ps[0], 0.5), lerp(ph[1], ps[1], 0.5), d, 2, col.s());
          ticks(lerp(ps[0], pu[0], 0.5), lerp(ps[1], pu[1], 0.5), d, 1, col.s());
        }
      }
      if (p.aux) {
        // zarte Hilfslinien: Umkreis
        const g = surface.g;
        g.save();
        g.globalAlpha = 0.6 * lineT(1);
        g.beginPath();
        g.arc(pu[0], pu[1], dist(u, t[0]) * layout().cell, 0, Math.PI * 2);
        g.strokeStyle = withAlpha(col.u(), 0.6);
        g.setLineDash([4, 5]);
        g.lineWidth = 1.4;
        g.stroke();
        g.restore();
      }
      if (!p.pt) return;
      const pt = pointT();
      const av = [...px];
      specialPoint(u, 'U', col.u(), clamp(pt * 3, 0, 1), av);
      specialPoint(s, 'S', col.s(), clamp(pt * 3 - 0.8, 0, 1), [...av, pu]);
      specialPoint(h, 'H', col.h(), clamp(pt * 3 - 1.6, 0, 1), [...av, pu, toPx(s)]);
      if (same) {
        const i0 = incenter(t);
        specialPoint(i0, '', col.pt(), pt, av);
      }
    }

    function drawVertices(px: [Px, Px, Px]): void {
      const g = surface.g;
      const theme = ctx.theme;
      const cx = (px[0][0] + px[1][0] + px[2][0]) / 3;
      const cy = (px[0][1] + px[1][1] + px[2][1]) / 3;
      const cv = col.v();
      px.forEach((q, i) => {
        const id = String(i);
        const active = hover === id || drag === i;
        if (!ctx.locked) {
          g.beginPath();
          g.arc(q[0], q[1], active ? 15 : 12, 0, Math.PI * 2);
          g.fillStyle = withAlpha(cv[i]!, active ? 0.26 : 0.13);
          g.fill();
        }
        g.beginPath();
        g.arc(q[0], q[1], 5, 0, Math.PI * 2);
        g.fillStyle = theme.bg;
        g.fill();
        g.strokeStyle = cv[i]!;
        g.lineWidth = 2.6;
        g.stroke();
        const [ux, uy] = unit(q[0] - cx, q[1] - cy);
        labelIn('ABC'[i]!, q[0] + ux * 19, q[1] + uy * 19, font(800, F(15, 13)), cv[i]!);
      });
    }

    /* ---------- Karten ---------- */
    interface CardSpec {
      h: number;
      draw: (r: Rect) => void;
      grow?: boolean;
    }
    function stack(R: Rect, makers: ((w: number) => CardSpec | CardSpec[] | null)[], gap: number): void {
      const placed: { c: CardSpec; h: number }[] = [];
      let used = 0;
      for (const make of makers) {
        const opt = make(R.w);
        if (!opt) continue;
        for (const c of Array.isArray(opt) ? opt : [opt]) {
          const need = used + (placed.length ? gap : 0) + c.h;
          if (need <= R.h + 0.5) {
            placed.push({ c, h: c.h });
            used = need;
            break;
          }
        }
      }
      const gi = placed.map((x) => !!x.c.grow).lastIndexOf(true);
      if (gi >= 0) placed[gi]!.h += Math.max(0, R.h - used);
      let y = R.y;
      for (const { c, h } of placed) {
        c.draw({ x: R.x, y, w: R.w, h });
        y += h + gap;
      }
    }

    function textSpec(w: number, head: string, body: string, accent?: string, grow = false): CardSpec {
      const pad = F(14, 12);
      const f = font(500, F(12.5, 12));
      const lh = F(17, 16);
      const rows = wrap(body, w - 2 * pad, f);
      return {
        h: F(31, 28) + rows.length * lh + F(9, 7),
        grow,
        draw(R) {
          card(R, accent, accent ? 0.04 : 0);
          title(R.x + pad, R.y + 16, head, accent ?? ctx.theme.muted);
          textRows(rows, R.x + pad, R.y + F(31, 28) + lh / 2, lh, f, ctx.theme.text);
        },
      };
    }

    const nameKey: Record<Mode, string> = { ms: 'nameU', wh: 'nameI', sh: 'nameS', h: 'nameH', eu: 'nameE' };
    const merkeKey: Record<Mode, string> = { ms: 'merkeU', wh: 'merkeI', sh: 'merkeS', h: 'merkeH', eu: 'merkeE' };

    /** Messkarte: drei Balken (Abstände bzw. Teilverhältnisse). */
    function measureSpec(): CardSpec | null {
      const t = tri();
      if (degenerate(t, 0.05) || !p.pt) return null;
      const g = surface.g;
      const theme = ctx.theme;
      const pad = F(14, 12);
      const m = mode();
      const cv = col.v();
      let head = '';
      let rows: { name: string; parts: number[]; label: string; color: string }[] = [];
      let tag = '';
      if (m === 'ms') {
        const u = circumcenter(t)!;
        head = tr('distT', { p: 'U' });
        rows = t.map((q, i) => ({ name: `|U${'ABC'[i]}|`, parts: [dist(u, q)], label: cm(dist(u, q)), color: cv[i]! }));
        tag = ctx.t('eqTag');
      } else if (m === 'wh') {
        const i0 = incenter(t);
        head = tr('distT', { p: 'I' });
        const tp = touchPoints(t);
        rows = tp.map((q, i) => ({ name: ['a', 'b', 'c'][i]!, parts: [dist(i0, q)], label: cm(dist(i0, q)), color: cv[i]! }));
        tag = ctx.t('eqTag');
      } else if (m === 'sh') {
        const s = centroid(t);
        const mids = midpoints(t);
        head = ctx.t('ratioT');
        rows = t.map((q, i) => {
          const d1 = dist(q, s);
          const d2 = dist(s, mids[i]!);
          return { name: `s${['a', 'b', 'c'][i]}`, parts: [d1, d2], label: `${fmt.num(d1, 1)} : ${fmt.num(d2, 1)}`, color: cv[i]! };
        });
        tag = '2 : 1';
      } else if (m === 'eu') {
        const u = circumcenter(t)!;
        const s = centroid(t);
        const h = orthocenter(t)!;
        head = ctx.t('eulerT');
        rows = [{ name: 'H–S–U', parts: [dist(h, s), dist(s, u)], label: `${fmt.num(dist(h, s), 1)} : ${fmt.num(dist(s, u), 1)}`, color: col.s() }];
        tag = '2 : 1';
      } else return null;
      const rowH = F(24, 21);
      const h = F(30, 27) + rows.length * rowH + F(8, 6);
      return {
        h,
        draw(R) {
          card(R);
          title(R.x + pad, R.y + 16, head);
          g.font = font(700, F(12, 11));
          const tw = g.measureText(tag).width + 18;
          g.fillStyle = withAlpha(col.right(), theme.dark ? 0.22 : 0.12);
          roundRect(g, R.x + R.w - pad - tw, R.y + 6, tw, 20, 10);
          g.fill();
          text(g, tag, R.x + R.w - pad - tw / 2, R.y + 16.5, { font: font(700, F(12, 11)), color: col.right() });
          let y = R.y + F(30, 27);
          g.font = font(600, F(12.5, 12));
          const valW = Math.max(...rows.map((r) => g.measureText(r.label).width)) + 12;
          const nameW = 44;
          const barW = R.w - 2 * pad - nameW - valW;
          const maxV = Math.max(...rows.map((r) => r.parts.reduce((a, b) => a + b, 0)), 0.1);
          for (const r of rows) {
            const yy = y + rowH / 2;
            text(g, r.name, R.x + pad, yy, { font: font(700, F(12.5, 12)), color: r.color, align: 'left' });
            let x = R.x + pad + nameW;
            const bh = F(11, 9);
            r.parts.forEach((v, k) => {
              const bw = Math.max(3, (v / maxV) * barW - (k ? 0 : 2));
              g.fillStyle = k === 0 ? r.color : withAlpha(r.color, 0.4);
              roundRect(g, x, yy - bh / 2, bw, bh, bh / 2);
              g.fill();
              x += bw + 2;
            });
            text(g, r.label, R.x + R.w - pad, yy, { font: font(600, F(12.5, 12)), color: theme.text, align: 'right' });
            y += rowH;
          }
        },
      };
    }

    /** Drei kleine Dreiecke: wo liegt der Punkt? */
    function whereSpec(): CardSpec | null {
      const m = mode();
      if (m === 'eu') return null;
      const t = tri();
      if (degenerate(t, 0.05)) return null;
      const g = surface.g;
      const theme = ctx.theme;
      const pad = F(14, 12);
      const cur = kind(t, 0.05);
      const name = m === 'ms' ? 'U' : m === 'wh' ? 'I' : m === 'sh' ? 'S' : 'H';
      const color = m === 'ms' ? col.u() : m === 'wh' ? col.pt() : m === 'sh' ? col.s() : col.h();
      const top = F(29, 26);
      const lab = 34;
      const always = m === 'wh' || m === 'sh';
      const h = top + 56 + lab + 6;
      const shapes: { k: 'spitz' | 'recht' | 'stumpf'; v: Tri }[] = [
        { k: 'spitz', v: [[0, 0], [10, 0.6], [4.2, 7.5]] },
        { k: 'recht', v: [[0, 0], [9, 0], [0, 6]] },
        { k: 'stumpf', v: [[0, 0], [11, 0], [2.6, 2.6]] },
      ];
      const pointOf = (v: Tri): Pt => (m === 'ms' ? circumcenter(v)! : m === 'wh' ? incenter(v) : m === 'sh' ? centroid(v) : orthocenter(v)!);
      const whereOf = (k: string): string => {
        if (always) return ctx.t('wIn');
        if (k === 'spitz') return ctx.t('wIn');
        if (k === 'stumpf') return ctx.t('wOut');
        return ctx.t(m === 'ms' ? 'wSide' : 'wCorner');
      };
      return {
        h,
        draw(R) {
          card(R);
          title(R.x + pad, R.y + 16, tr('whereT', { p: name }));
          const small = (R.w - 2 * pad) / 3 < 92;
          const colW = (R.w - 2 * pad) / 3;
          const ih = R.y + R.h - lab - 6 - (R.y + top);
          shapes.forEach((sh, i) => {
            const cx = R.x + pad + colW * (i + 0.5);
            const isCur = p.pt && sh.k === cur;
            if (isCur) {
              g.fillStyle = withAlpha(color, theme.dark ? 0.16 : 0.09);
              roundRect(g, R.x + pad + colW * i + 3, R.y + top - 4, colW - 6, R.h - top - 2, 9);
              g.fill();
            }
            const q = pointOf(sh.v);
            // Rahmen der Darstellung: Dreieck und Punkt
            const pts = [...sh.v, q];
            const x0 = Math.min(...pts.map((z) => z[0]));
            const x1 = Math.max(...pts.map((z) => z[0]));
            const y0 = Math.min(...pts.map((z) => z[1]));
            const y1 = Math.max(...pts.map((z) => z[1]));
            const sc = Math.min((colW - 18) / (x1 - x0), (ih - 8) / (y1 - y0));
            const cy = R.y + top + ih / 2;
            const mp = (z: Pt): Px => [cx + (z[0] - (x0 + x1) / 2) * sc, cy - (z[1] - (y0 + y1) / 2) * sc];
            g.beginPath();
            sh.v.map(mp).forEach(([x, y], j) => (j ? g.lineTo(x, y) : g.moveTo(x, y)));
            g.closePath();
            g.fillStyle = isCur ? withAlpha(color, 0.12) : withAlpha(theme.text, 0.05);
            g.fill();
            g.strokeStyle = isCur ? theme.text : withAlpha(theme.text, 0.55);
            g.lineWidth = 1.6;
            g.lineJoin = 'round';
            g.stroke();
            dot(mp(q), 3.4, isCur ? color : withAlpha(theme.text, 0.45));
            text(g, ctx.t(sh.k === 'spitz' ? 'kSpitz' : sh.k === 'recht' ? 'kRecht' : 'kStumpf'), cx, R.y + R.h - lab + 6, { font: font(isCur ? 800 : 600, small ? 10 : 11.5), color: isCur ? theme.text : theme.muted });
            text(g, whereOf(sh.k), cx, R.y + R.h - lab + 22, { font: font(500, small ? 9.5 : 11), color: isCur ? color : theme.muted });
          });
        },
      };
    }

    function infoSpec(w: number): CardSpec {
      const t = tri();
      const m = mode();
      if (degenerate(t, 0.05)) return textSpec(w, ctx.t('nameE'), ctx.t('degen'), ctx.theme.series[1]);
      if (!p.pt) return textSpec(w, ctx.t('hiddenT'), ctx.t('hidden'), col.pt());
      const isEq = m === 'eu' && dist(circumcenter(t)!, orthocenter(t)!) < 0.05;
      const prop = isEq ? ctx.t('equi') : ctx.t({ ms: 'propU', wh: 'propI', sh: 'propS', h: 'propH', eu: 'propE' }[m]);
      return textSpec(w, ctx.t(nameKey[m]), prop, m === 'ms' ? col.u() : m === 'wh' ? col.pt() : m === 'sh' ? col.s() : m === 'h' ? col.h() : col.s());
    }
    const merkeSpec = (w: number) => textSpec(w, ctx.t('merkeT'), ctx.t(merkeKey[mode()]), undefined, true);

    /* ---------- Rendern ---------- */
    function render(): void {
      hits = [];
      pointLabelAvoid = [];
      surface.begin();
      const lay = layout();
      const g = surface.g;
      drawPaper(lay.paper, lay.cell);
      g.save();
      roundRect(g, lay.paper.x, lay.paper.y, lay.paper.w, lay.paper.h, 10);
      g.clip();
      const t = tri();
      const px = t.map(toPx) as [Px, Px, Px];
      drawTriangle(px);
      if (!degenerate(t, 0.05)) {
        const m = mode();
        if (m === 'ms') drawMS(t, px);
        else if (m === 'wh') drawWH(t, px);
        else if (m === 'sh') drawSH(t, px);
        else if (m === 'h') drawH(t, px);
        else drawEU(t, px);
      }
      drawVertices(px);
      g.restore();
      g.strokeStyle = ctx.theme.dark ? '#2a3445' : '#d5dce6';
      g.lineWidth = 1;
      roundRect(g, lay.paper.x + 0.5, lay.paper.y + 0.5, lay.paper.w - 1, lay.paper.h - 1, 10);
      g.stroke();
      const gap = F(10, 8);
      if (lay.side) stack(lay.side, [infoSpec, measureSpec, whereSpec, merkeSpec], gap);
      else if (lay.below) stack(lay.below, [infoSpec, measureSpec, whereSpec, merkeSpec], gap);
      if (grow.running) ctx.requestRender();
    }

    /* ---------- Zeiger ---------- */
    function hitAt(px: number, py: number): string | null {
      for (let i = hits.length - 1; i >= 0; i--) {
        const h = hits[i]!;
        if (px >= h.r.x && px <= h.r.x + h.r.w && py >= h.r.y && py <= h.r.y + h.r.h) return h.id;
      }
      if (ctx.locked) return null;
      const R = wide() ? 18 : 22;
      let best: string | null = null;
      let bd = Infinity;
      tri().forEach((q, i) => {
        const [x, y] = toPx(q);
        const d = Math.hypot(px - x, py - y);
        if (d < R && d < bd) {
          bd = d;
          best = String(i);
        }
      });
      return best;
    }

    surface.addTarget({
      contains: (px: number, py: number) => drag !== null || hitAt(px, py) !== null,
      pointerDown: (q: { px: number; py: number }) => {
        const id = hitAt(q.px, q.py);
        if (id === null) return false;
        drag = Number(id) as 0 | 1 | 2;
        surface.setCursor('grabbing');
        ctx.requestRender();
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (drag === null || ctx.locked) return;
        const w = toWorld(q.px, q.py);
        // auf halbe Zentimeter einrasten (Kästchen), am Rand halten
        const x = clamp(Math.round(w[0] * 2) / 2, 0.5, W - 0.5);
        const y = clamp(Math.round(w[1] * 2) / 2, 0.5, H - 0.5);
        const k = ['a', 'b', 'c'][drag]!;
        const others = tri().filter((_, i) => i !== drag);
        if (others.some((o) => Math.abs(o[0] - x) < 1e-9 && Math.abs(o[1] - y) < 1e-9)) return;
        ctx.set({ [`${k}x`]: x, [`${k}y`]: y });
      },
      pointerUp: () => {
        drag = null;
        surface.setCursor('');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const id = q ? hitAt(q.px, q.py) : null;
        if (id !== hover) {
          hover = id;
          ctx.requestRender();
        }
        surface.setCursor(id === null ? '' : 'grab');
      },
      wheel: () => false,
    });

    function replay(): void {
      grow.play();
      ctx.requestRender();
    }
    replay();

    return {
      update(changed, source) {
        if (changed.has('m') || source === 'replace' || (changed.has('pt') && p.pt)) replay();
        updateReadouts();
      },
      action(id) {
        if (ctx.locked) return;
        if (id === 'redraw') replay();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
