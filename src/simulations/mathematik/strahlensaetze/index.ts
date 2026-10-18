import { defineSimulation, prefersReducedMotion, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import { angleBetween, dist, figure, parallel, ratios, shadowLengths, treeHeight, type Figure, type Pt } from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'v' | 'x' | 'baum' | 'teich';
type Vals = Record<string, unknown>;
type Px = [number, number];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const isMode =
  (...m: Mode[]) =>
  (v: Vals) =>
    m.includes(v.mode as Mode);

/** Ausgangslagen, wenn man das Thema von Hand wechselt. */
const START: Record<Mode, Record<string, number | boolean>> = {
  v: { a: 3, b: 4, k: 2, th: 40, par: true },
  x: { a: 4, b: 5, k: 0.75, th: 40, par: true },
  baum: { ht: 12, st: 1.5, el: 35 },
  teich: { w: 24, kt: 4 },
};

/** Ziehbare Elemente. */
type DragId = 'a' | 'b' | 'a2' | 'b2' | 'ray' | 'sun' | 'stick' | 'tree' | 'p2';

/**
 * Strahlensätze an V- und X-Figur: Punkte auf den Strahlen ziehen, die
 * Verhältnisse wandern live in Bruchschreibweise mit; ohne Parallelität
 * zerfallen sie. Dazu zwei Anwendungen: Baumhöhe über den Schatten und die
 * Breite eines Teichs mit der X-Figur.
 */
export default defineSimulation({
  id: 'strahlensaetze',
  dragHint: true,
  layout: { aspect: 1.7, aspectNarrow: 0.56 },
  groups: [
    { id: 'fig', label: L('Figur', 'Figure') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'v', label: L('V-Figur', 'V shape') },
        { value: 'x', label: L('X-Figur', 'X shape') },
        { value: 'baum', label: L('Anwendung: Baumhöhe', 'Application: tree height') },
        { value: 'teich', label: L('Anwendung: Teichbreite', 'Application: width of a pond') },
      ],
      default: 'v',
    },
    { key: 'a', type: 'number', group: 'fig', label: L('|ZA|', 'ZA'), min: 1, max: 8, step: 0.1, default: 3, unit: 'cm', visibleIf: isMode('v', 'x') },
    { key: 'b', type: 'number', group: 'fig', label: L('|ZB|', 'ZB'), min: 1, max: 8, step: 0.1, default: 4, unit: 'cm', visibleIf: isMode('v', 'x') },
    { key: 'k', type: 'number', group: 'fig', label: L('Streckfaktor k = |ZA′| : |ZA|', 'Scale factor k = ZA′ : ZA'), min: 0.2, max: 3, step: 0.05, default: 2, visibleIf: isMode('v', 'x') },
    { key: 'th', type: 'number', group: 'fig', label: L('Winkel zwischen den Strahlen', 'Angle between the rays'), min: 15, max: 120, step: 1, default: 40, unit: '°', visibleIf: isMode('v', 'x') },
    {
      key: 'par',
      type: 'boolean',
      group: 'fig',
      label: L('A′B′ parallel zu AB', 'A′B′ parallel to AB'),
      help: L('Ausschalten, um B′ frei zu verschieben: Gelten die Verhältnisse dann noch?', 'Switch off to move B′ freely: do the ratios still hold?'),
      default: true,
      visibleIf: isMode('v', 'x'),
    },
    { key: 'kb', type: 'number', group: 'fig', label: L('|ZB′| : |ZB|', 'ZB′ : ZB'), min: 0.2, max: 3, step: 0.05, default: 1.6, visibleIf: (v) => isMode('v', 'x')(v) && !v.par },
    { key: 'ht', type: 'number', group: 'fig', label: L('Baumhöhe (wirklich)', 'Tree height (true)'), min: 5, max: 20, step: 0.5, default: 12, unit: 'm', visibleIf: isMode('baum') },
    { key: 'st', type: 'number', group: 'fig', label: L('Stablänge s', 'Stick length s'), min: 1, max: 2.5, step: 0.1, default: 1.5, unit: 'm', visibleIf: isMode('baum') },
    { key: 'el', type: 'number', group: 'fig', label: L('Sonnenhöhe', 'Sun elevation'), min: 20, max: 60, step: 1, default: 35, unit: '°', visibleIf: isMode('baum') },
    { key: 'w', type: 'number', group: 'fig', label: L('Teichbreite (wirklich)', 'Pond width (true)'), min: 8, max: 40, step: 0.5, default: 24, unit: 'm', visibleIf: isMode('teich') },
    { key: 'kt', type: 'number', group: 'fig', label: L('Verkleinerung |ZA| : |ZA′|', 'Reduction ZA : ZA′'), min: 2, max: 6, step: 1, default: 4, visibleIf: isMode('teich') },
    { key: 'show', type: 'boolean', group: 'view', label: L('Ergebnis zeigen', 'Show the result'), help: L('Für Aufgaben ausschalten: Die gesuchte Größe erscheint dann als „?“.', 'Switch off for tasks: the unknown appears as “?”.'), default: true },
    { key: 'tri', type: 'boolean', group: 'view', label: L('Ähnliche Dreiecke einfärben', 'Shade the similar triangles'), default: true, visibleIf: isMode('v', 'x') },
  ],
  readouts: [
    { key: 'r1', label: L('1. Strahlensatz', '1st intercept theorem') },
    { key: 'r2', label: L('2. Strahlensatz', '2nd intercept theorem') },
    { key: 'res', label: L('Ergebnis', 'Result'), spoiler: true },
  ],
  presets: [
    { id: 'v', label: L('V-Figur, k = 2', 'V shape, k = 2'), values: {} },
    { id: 'half', label: L('V-Figur, k = 0,5', 'V shape, k = 0.5'), values: { k: 0.5, a: 6, b: 7 } },
    { id: 'x', label: L('X-Figur', 'X shape'), values: { mode: 'x', a: 4, b: 5, k: 0.75, th: 40 } },
    { id: 'nopar', label: L('Nicht parallel', 'Not parallel'), values: { par: false, kb: 1.4 } },
    { id: 'baum', label: L('Baumhöhe über den Schatten', 'Tree height from shadows'), values: { mode: 'baum', ht: 12, st: 1.5, el: 35 } },
    { id: 'teich', label: L('Breite eines Teichs', 'Width of a pond'), values: { mode: 'teich', w: 24, kt: 4 } },
  ],
  strings: {
    de: {
      canvas: 'Zwei Strahlen mit gemeinsamem Punkt Z werden von zwei Parallelen geschnitten (V- oder X-Figur); die Punkte lassen sich ziehen, die Verhältnisse der Strecken stehen daneben. Dazu zwei Anwendungen: die Höhe eines Baumes über seinen Schatten und die Breite eines Teichs',
      s1T: '1. Strahlensatz',
      s2T: '2. Strahlensatz',
      s1bT: 'Auch so: Abschnitte',
      equal: 'gleich ✓',
      differ: 'verschieden ✗',
      kT: 'Streckfaktor',
      merkeT: 'Merke',
      merkeV: 'Werden zwei Strahlen mit gemeinsamem Anfangspunkt Z von zwei Parallelen geschnitten, so verhalten sich die Abschnitte auf dem einen Strahl wie die entsprechenden Abschnitte auf dem anderen (1. Strahlensatz). Die Abschnitte auf den Parallelen verhalten sich wie die zugehörigen Abschnitte von Z aus (2. Strahlensatz).',
      merkeX: 'Bei der X-Figur liegen die Parallelen auf verschiedenen Seiten von Z. Die Strahlensätze gelten genauso – man misst immer von Z aus.',
      nopT: 'Nicht parallel',
      nop: 'AB und A′B′ sind nicht parallel (Abweichung {d}). Dann gelten die Strahlensätze nicht: Die Verhältnisse sind verschieden. Umgekehrt gilt: Sind die Verhältnisse im 1. Strahlensatz gleich, sind die Geraden parallel.',
      triT: 'Ähnliche Dreiecke',
      tri: 'Das Dreieck ZA′B′ ist eine Vergrößerung (bzw. Verkleinerung) von ZAB mit dem Faktor {k}: gleiche Winkel, alle Seiten mal {k}.',
      baumT: 'Rechnung (2. Strahlensatz)',
      baumIdea: 'Der Sonnenstrahl über die Spitzen von Baum und Stab trifft den Boden in Z. Stab und Baum stehen senkrecht – sie sind parallel.',
      teichT: 'Rechnung (2. Strahlensatz)',
      teichIdea: 'Peile von A über Z und von B über Z. Stecke A′ und B′ so ab, dass |ZA′| = |ZA| : {k} und |ZB′| = |ZB| : {k}. Dann ist A′B′ parallel zu AB.',
      unknown: '?',
      height: 'h',
      stick: 's',
      sun: 'Sonne',
      elev: 'Sonnenhöhe',
      measT: 'Gemessen',
      r1Read: '|ZA′| : |ZA| = {a} ; |ZB′| : |ZB| = {b}',
      r2Read: '|A′B′| : |AB| = {c}',
      resV: 'k = {k}; AB ∥ A′B′',
      resNo: 'nicht parallel – Verhältnisse verschieden',
      resBaum: 'h = s · |ZB′| : |ZB| = {s} · {dt} : {ds} ≈ {h}',
      resTeich: '|AB| = {k} · |A′B′| = {k} · {m} {w}',
      measBaum: 's = {s}, |ZB| = {ds}, |ZB′| = {dt}',
      measTeich: '|A′B′| = {m}',
    },
    en: {
      canvas: 'Two rays from a common point Z cut by two parallel lines (V or X shape); the points can be dragged and the ratios of the segments are shown next to it. Plus two applications: the height of a tree from its shadow and the width of a pond',
      s1T: '1st intercept theorem',
      s2T: '2nd intercept theorem',
      s1bT: 'Also: the pieces',
      equal: 'equal ✓',
      differ: 'different ✗',
      kT: 'Scale factor',
      merkeT: 'Remember',
      merkeV: 'If two rays from a common point Z are cut by two parallel lines, the segments on one ray are in the same ratio as the corresponding segments on the other (1st theorem). The segments on the parallels are in the same ratio as the corresponding segments measured from Z (2nd theorem).',
      merkeX: 'In the X shape the parallels lie on different sides of Z. The theorems hold in the same way – always measure from Z.',
      nopT: 'Not parallel',
      nop: 'AB and A′B′ are not parallel (off by {d}). Then the theorems do not hold: the ratios differ. Conversely, if the ratios of the 1st theorem are equal, the lines are parallel.',
      triT: 'Similar triangles',
      tri: 'Triangle ZA′B′ is an enlargement (or reduction) of ZAB with factor {k}: same angles, every side times {k}.',
      baumT: 'Calculation (2nd theorem)',
      baumIdea: 'The sun ray over the tops of the tree and the stick meets the ground at Z. Stick and tree are vertical – they are parallel.',
      teichT: 'Calculation (2nd theorem)',
      teichIdea: 'Sight from A over Z and from B over Z. Place A′ and B′ so that ZA′ = ZA : {k} and ZB′ = ZB : {k}. Then A′B′ is parallel to AB.',
      unknown: '?',
      height: 'h',
      stick: 's',
      sun: 'Sun',
      elev: 'Sun elevation',
      measT: 'Measured',
      r1Read: 'ZA′ : ZA = {a} ; ZB′ : ZB = {b}',
      r2Read: 'A′B′ : AB = {c}',
      resV: 'k = {k}; AB ∥ A′B′',
      resNo: 'not parallel – the ratios differ',
      resBaum: 'h = s · ZB′ : ZB = {s} · {dt} : {ds} ≈ {h}',
      resTeich: 'AB = {k} · A′B′ = {k} · {m} {w}',
      measBaum: 's = {s}, ZB = {ds}, ZB′ = {dt}',
      measTeich: 'A′B′ = {m}',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    const mode = () => p.mode as Mode;
    const wide = () => surface.width >= 640;
    const F = (w: number, n: number) => (wide() ? w : n);
    const font = (weight: number, size: number) => `${weight} ${size}px ${ctx.theme.font}`;
    const mathF = (size: number) => `italic 700 ${size}px ${ctx.theme.mathFont}`;
    const cm = (v: number) => `${fmt.num(v, 1)} cm`;
    const m1 = (v: number) => `${fmt.num(v, 1)} m`;
    const m2 = (v: number) => `${fmt.num(v, 2)} m`;
    /** „= 24 m“ bzw. „≈ 40 m“ (Messung auf Zentimeter gerundet). */
    const approxM = (v: number) => (Math.abs(v * 10 - Math.round(v * 10)) < 1e-6 ? `= ${m1(v)}` : `≈ ${m1(v)}`);

    const col = {
      r1: () => ctx.theme.series[0]!,
      r2: () => ctx.theme.series[1]!,
      par: () => ctx.theme.series[2]!,
      k: () => ctx.theme.series[4]!,
      bad: () => ctx.theme.series[1]!,
      sun: () => ctx.theme.series[3]!,
    };

    /* ---------- weich nachgeführte Werte ---------- */
    type Shown = { a: number; b: number; th: number; ka: number; kb: number; ht: number; st: number; el: number; w: number; kt: number };
    const target = (): Shown => {
      const sx = mode() === 'x' ? -1 : 1;
      return { a: p.a, b: p.b, th: p.th, ka: sx * p.k, kb: sx * (p.par ? p.k : p.kb), ht: p.ht, st: p.st, el: p.el, w: p.w, kt: p.kt };
    };
    let shown: Shown = target();
    let view: { cx: number; cy: number; s: number } | null = null;
    let lastFrame = performance.now();
    let intro = reduced ? 1 : 0;
    let drag: DragId | null = null;
    let hover: DragId | null = null;

    function stepShown(dt: number): boolean {
      const t = target();
      if (reduced || drag) {
        shown = t;
        return false;
      }
      const k = 1 - Math.exp(-dt * 9);
      let moving = false;
      const next = { ...shown };
      for (const key of Object.keys(t) as (keyof Shown)[]) {
        const d = t[key] - shown[key];
        if (Math.abs(d) > 1e-4 * (1 + Math.abs(t[key]))) {
          next[key] = shown[key] + d * k;
          moving = true;
        } else next[key] = t[key];
      }
      shown = next;
      return moving;
    }

    const fig = (): Figure => figure(shown.a, shown.b, shown.th, shown.ka, shown.kb);
    const figT = (): Figure => {
      const t = target();
      return figure(t.a, t.b, t.th, t.ka, t.kb);
    };

    /* ---------- Aufteilung ---------- */
    type Layout = { stage: Rect; side: Rect | null; below: Rect | null };
    function layout(): Layout {
      const W = surface.width;
      const H = surface.height;
      const gap = wide() ? 12 : 8;
      if (W > H * 1.05) {
        const colW = Math.round(wide() ? clamp(W * 0.36, 270, 340) : clamp(W * 0.4, 210, 270));
        return { stage: { x: 2, y: 2, w: W - colW - gap - 2, h: H - 4 }, side: { x: W - colW, y: 2, w: colW - 2, h: H - 4 }, below: null };
      }
      const sh = Math.round(clamp(W * 0.72, 230, H * 0.52));
      return { stage: { x: 2, y: 2, w: W - 4, h: sh }, side: null, below: { x: 2, y: sh + 2 + gap, w: W - 4, h: H - sh - 4 - gap } };
    }
    function toPx(q: Pt): Px {
      const { stage } = layout();
      const v = view ?? { cx: 0, cy: 0, s: 30 };
      return [stage.x + stage.w / 2 + (q[0] - v.cx) * v.s, stage.y + stage.h / 2 - (q[1] - v.cy) * v.s];
    }
    function toWorld(px: number, py: number): Pt {
      const { stage } = layout();
      const v = view ?? { cx: 0, cy: 0, s: 30 };
      return [v.cx + (px - stage.x - stage.w / 2) / v.s, v.cy - (py - stage.y - stage.h / 2) / v.s];
    }
    const scale = () => (view ? view.s : 30);

    /** Weltbereich, der zu sehen sein soll (aus den Zielwerten, damit die Ansicht ruhig bleibt). */
    function bounds(): [number, number, number, number] {
      const m = mode();
      if (m === 'v' || m === 'x') {
        const f = figT();
        const pts = [f.z, f.a, f.b, f.a2, f.b2];
        return [Math.min(...pts.map((q) => q[0])), Math.min(...pts.map((q) => q[1])), Math.max(...pts.map((q) => q[0])), Math.max(...pts.map((q) => q[1]))];
      }
      if (m === 'baum') {
        const t = target();
        const { dTree } = shadowLengths(t.ht, t.st, t.el);
        return [-1.5, 0, dTree + t.ht * 0.5 + 2.5, Math.max(t.ht + 2.5, 6)];
      }
      const t = target();
      return [-t.w * 0.12, -t.w * 0.9, t.w * 1.12, t.w * 0.48];
    }
    function targetView(): { cx: number; cy: number; s: number } {
      const { stage } = layout();
      const [x0, y0, x1, y1] = bounds();
      const flat = mode() === 'v' || mode() === 'x';
      const app = mode() === 'baum';
      const padX = flat ? F(44, 30) : 6;
      const padT = flat ? F(36, 26) : 6;
      const padB = flat ? F(40, 30) : app ? F(66, 56) : 6;
      const s = Math.min((stage.w - 2 * padX) / Math.max(1, x1 - x0), (stage.h - padT - padB) / Math.max(1, y1 - y0));
      const sc = flat ? clamp(s, 10, F(160, 110)) : s;
      return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 - (padB - padT) / 2 / sc, s: sc };
    }
    function stepView(dt: number): boolean {
      const t = targetView();
      if (!view || reduced) {
        view = t;
        return false;
      }
      if (drag) return false;
      const k = 1 - Math.exp(-dt * 6);
      const d = (Math.abs(t.cx - view.cx) + Math.abs(t.cy - view.cy)) * view.s + Math.abs(t.s - view.s) * 8;
      if (d < 0.3) {
        view = t;
        return false;
      }
      view = { cx: lerp(view.cx, t.cx, k), cy: lerp(view.cy, t.cy, k), s: lerp(view.s, t.s, k) };
      return true;
    }

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const m = mode();
      for (const k of ['r1', 'r2', 'res']) ctx.readout(k, null);
      if (m === 'v' || m === 'x') {
        const f = figT();
        const r = ratios(f);
        ctx.readout('r1', tr('r1Read', { a: fmt.num(r.r1, 2), b: fmt.num(r.r2, 2) }));
        ctx.readout('r2', tr('r2Read', { c: fmt.num(r.r3, 2) }));
        ctx.readout('res', parallel(f, 1e-6) ? tr('resV', { k: fmt.num(p.k, 2) }) : ctx.t('resNo'));
      } else if (m === 'baum') {
        const meas = baumMeasured();
        ctx.readout('r2', tr('measBaum', { s: m1(p.st), ds: m2(meas.ds), dt: m2(meas.dt) }));
        ctx.readout('res', tr('resBaum', { s: m1(p.st), ds: m2(meas.ds), dt: m2(meas.dt), h: m1(treeHeight(p.st, meas.ds, meas.dt)) }));
      } else {
        const mm = Math.round((p.w / p.kt) * 100) / 100;
        ctx.readout('r2', tr('measTeich', { m: m2(mm) }));
        ctx.readout('res', tr('resTeich', { k: p.kt, m: m2(mm), w: approxM(p.kt * mm) }));
      }
    }
    /** Gemessene Abstände (auf 0,1 m gerundet, wie mit dem Maßband). */
    function baumMeasured(): { ds: number; dt: number } {
      const { dStick, dTree } = shadowLengths(p.ht, p.st, p.el);
      return { ds: Math.round(dStick * 100) / 100, dt: Math.round(dTree * 100) / 100 };
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
      str = str.replace(/ ([=:]) /g, ' $1 ').replace(/ (cm|m)([ .,;]|$)/g, ' $1$2');
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
    function chip(R: Rect, label: string, color: string): void {
      const g = surface.g;
      const pad = F(14, 12);
      g.font = font(700, F(12, 11));
      const w = g.measureText(label).width + 18;
      g.fillStyle = withAlpha(color, ctx.theme.dark ? 0.22 : 0.12);
      roundRect(g, R.x + R.w - pad - w, R.y + 6, w, 20, 10);
      g.fill();
      text(g, label, R.x + R.w - pad - w / 2, R.y + 16.5, { font: font(700, F(12, 11)), color });
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
      const { stage } = layout();
      surface.g.font = f;
      const w = surface.g.measureText(str).width / 2 + 5;
      haloText(str, clamp(x, stage.x + w, stage.x + stage.w - w), clamp(y, stage.y + 10, stage.y + stage.h - 10), f, color);
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
    /** Wert-Schild neben einer Strecke (seitlich, weg von `away`). */
    function tagAt(a: Px, b: Px, label: string, color: string, side: 1 | -1, t = 0.5): void {
      const g = surface.g;
      if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 22) return;
      const theme = ctx.theme;
      const mx = lerp(a[0], b[0], t);
      const my = lerp(a[1], b[1], t);
      const [nx, ny] = unit(-(b[1] - a[1]), b[0] - a[0]);
      const f = font(700, F(12, 11));
      g.font = f;
      const w = g.measureText(label).width + 12;
      const h = F(20, 18);
      const off = 6 + Math.abs(nx) * w * 0.5 + Math.abs(ny) * h * 0.5;
      const { stage } = layout();
      const x = clamp(mx + nx * off * side - w / 2, stage.x + 3, stage.x + stage.w - w - 3);
      const y = clamp(my + ny * off * side - h / 2, stage.y + 3, stage.y + stage.h - h - 3);
      g.fillStyle = theme.dark ? '#141b26' : '#ffffff';
      roundRect(g, x, y, w, h, h / 2);
      g.fill();
      g.strokeStyle = withAlpha(color, 0.75);
      g.lineWidth = 1.3;
      g.stroke();
      text(g, label, x + w / 2, y + h / 2 + 0.5, { font: f, color });
    }

    /* ---------- Bruchgleichungen ---------- */
    type Item = { kind: 'frac'; num: string; den: string; cn: string; cd: string; math?: boolean } | { kind: 'txt'; s: string; color: string; bold?: boolean };
    function itemW(it: Item, size: number): number {
      const g = surface.g;
      if (it.kind === 'txt') {
        g.font = font(it.bold ? 800 : 600, size);
        return g.measureText(it.s).width;
      }
      g.font = it.math ? mathF(size) : font(600, size);
      return Math.max(g.measureText(it.num).width, g.measureText(it.den).width) + 6;
    }
    function equation(items: Item[], x: number, cy: number, maxW: number, size0: number): void {
      const g = surface.g;
      const gapW = 7;
      let size = size0;
      const total = (s: number) => items.reduce((acc, it) => acc + itemW(it, s), 0) + gapW * (items.length - 1);
      while (total(size) > maxW && size > 9.5) size -= 0.5;
      let cx = x;
      for (const it of items) {
        const w = itemW(it, size);
        if (it.kind === 'txt') text(g, it.s, cx, cy, { font: font(it.bold ? 800 : 600, size), color: it.color, align: 'left' });
        else {
          const f = it.math ? mathF(size) : font(600, size);
          text(g, it.num, cx + w / 2, cy - size * 0.72, { font: f, color: it.cn });
          text(g, it.den, cx + w / 2, cy + size * 0.78, { font: f, color: it.cd });
          segment([cx + 1, cy], [cx + w - 1, cy], withAlpha(ctx.theme.text, 0.75), 1.3);
        }
        cx += w + gapW;
      }
    }

    /* ---------- Hintergrund ---------- */
    function drawPaper(R: Rect): void {
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
      g.save();
      roundRect(g, R.x, R.y, R.w, R.h, 10);
      g.clip();
      const s = scale();
      const tl = toWorld(R.x, R.y);
      const br = toWorld(R.x + R.w, R.y + R.h);
      const cell = 0.5;
      g.lineWidth = 1;
      for (const major of [false, true]) {
        g.strokeStyle = major ? withAlpha(theme.grid, 0.9) : theme.gridMinor;
        g.beginPath();
        if (major || s * cell >= 6) {
          for (let k = Math.ceil(tl[0] / cell); k * cell <= br[0]; k++) {
            if ((k % 2 === 0) !== major) continue;
            const x = Math.round(toPx([k * cell, 0])[0]) + 0.5;
            g.moveTo(x, R.y);
            g.lineTo(x, R.y + R.h);
          }
          for (let k = Math.ceil(br[1] / cell); k * cell <= tl[1]; k++) {
            if ((k % 2 === 0) !== major) continue;
            const y = Math.round(toPx([0, k * cell])[1]) + 0.5;
            g.moveTo(R.x, y);
            g.lineTo(R.x + R.w, y);
          }
        }
        g.stroke();
      }
      g.restore();
    }

    /* ---------- V- und X-Figur ---------- */
    function handle(q: Px, id: DragId, color: string, label: string, away: Px, filled = false): void {
      const g = surface.g;
      const theme = ctx.theme;
      const active = hover === id || drag === id;
      if (!ctx.locked) {
        g.beginPath();
        g.arc(q[0], q[1], active ? 15 : 12, 0, Math.PI * 2);
        g.fillStyle = withAlpha(color, active ? 0.26 : 0.13);
        g.fill();
      }
      g.beginPath();
      g.arc(q[0], q[1], 5, 0, Math.PI * 2);
      g.fillStyle = filled ? color : theme.bg;
      g.fill();
      g.strokeStyle = filled ? theme.bg : color;
      g.lineWidth = filled ? 2 : 2.6;
      g.stroke();
      const [ux, uy] = unit(away[0], away[1]);
      labelIn(label, q[0] + ux * 18, q[1] + uy * 18, font(800, F(15, 13)), color);
    }

    function drawFigure(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const f = fig();
      const isX = mode() === 'x';
      const z = toPx(f.z);
      const a = toPx(f.a);
      const b = toPx(f.b);
      const a2 = toPx(f.a2);
      const b2 = toPx(f.b2);
      const isPar = parallel(figT(), 1e-6);
      const grow = Math.min(1, intro * 1.4);
      // Strahlen (bzw. Geraden bei der X-Figur) bis zum Rand
      const ray = (dir: Px, color: string) => {
        const L = 4000 * grow;
        segment(isX ? [z[0] - dir[0] * L, z[1] - dir[1] * L] : z, [z[0] + dir[0] * L, z[1] + dir[1] * L], withAlpha(color, 0.45), 1.6);
      };
      const d1 = unit(a[0] - z[0], a[1] - z[1]);
      const d2 = unit(b[0] - z[0], b[1] - z[1]);
      ray(d1, col.r1());
      ray(d2, col.r2());
      // ähnliche Dreiecke
      if (p.tri) {
        const tri = (pts: Px[], color: string, alpha: number) => {
          g.beginPath();
          pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
          g.closePath();
          g.fillStyle = withAlpha(color, alpha);
          g.fill();
        };
        tri([z, a2, b2], col.k(), theme.dark ? 0.14 : 0.08);
        tri([z, a, b], col.k(), theme.dark ? 0.2 : 0.12);
      }
      // Abschnitte auf den Strahlen
      segment(z, a2, withAlpha(col.r1(), 0.55), 5);
      segment(z, a, col.r1(), 5);
      segment(z, b2, withAlpha(col.r2(), 0.55), 5);
      segment(z, b, col.r2(), 5);
      // Parallelen
      const ext = (u: Px, v: Px): [Px, Px] => {
        const [dx, dy] = unit(v[0] - u[0], v[1] - u[1]);
        const e = 26;
        return [
          [u[0] - dx * e, u[1] - dy * e],
          [v[0] + dx * e, v[1] + dy * e],
        ];
      };
      const [p0, p1] = ext(a, b);
      const [q0, q1] = ext(a2, b2);
      segment(p0, p1, withAlpha(col.par(), 0.5), 1.4, [5, 4]);
      segment(q0, q1, withAlpha(isPar ? col.par() : col.bad(), 0.5), 1.4, [5, 4]);
      segment(a, b, col.par(), 3);
      segment(a2, b2, isPar ? col.par() : col.bad(), 3);
      if (isPar) {
        // Parallelmarken (Pfeilspitzen)
        for (const [u, v] of [
          [a, b],
          [a2, b2],
        ] as [Px, Px][]) {
          const [dx, dy] = unit(v[0] - u[0], v[1] - u[1]);
          const m: Px = [(u[0] + v[0]) / 2, (u[1] + v[1]) / 2];
          for (const off of [-3, 3]) {
            const c: Px = [m[0] + dx * off, m[1] + dy * off];
            g.save();
            g.strokeStyle = col.par();
            g.lineWidth = 2;
            g.lineCap = 'round';
            g.beginPath();
            g.moveTo(c[0] - dx * 5 - dy * 4, c[1] - dy * 5 + dx * 4);
            g.lineTo(c[0], c[1]);
            g.lineTo(c[0] - dx * 5 + dy * 4, c[1] - dy * 5 - dx * 4);
            g.stroke();
            g.restore();
          }
        }
      }
      // Maße
      const ft = figT();
      const r1 = col.r1();
      const r2 = col.r2();
      const show = p.show;
      // Schilder auf der Außenseite der Strahlen
      const sideOf = (u: Px, v: Px, other: Px): 1 | -1 => {
        const [nx, ny] = unit(-(v[1] - u[1]), v[0] - u[0]);
        return nx * (other[0] - u[0]) + ny * (other[1] - u[1]) > 0 ? -1 : 1;
      };
      const s1 = sideOf(z, a2, b);
      const s2 = sideOf(z, b2, a);
      tagAt(z, a, cm(dist(ft.z, ft.a)), r1, s1);
      tagAt(z, a2, show ? cm(dist(ft.z, ft.a2)) : '?', r1, s1, isX ? 0.5 : Math.min(0.92, 0.5 + 0.5 / Math.max(1.0001, Math.abs(shown.ka))));
      tagAt(z, b, cm(dist(ft.z, ft.b)), r2, s2);
      tagAt(z, b2, cm(dist(ft.z, ft.b2)), r2, s2, isX ? 0.5 : Math.min(0.92, 0.5 + 0.5 / Math.max(1.0001, Math.abs(shown.kb))));
      const cz: Px = z;
      tagAt(a, b, cm(dist(ft.a, ft.b)), col.par(), sideOf(a, b, cz) === 1 ? -1 : 1);
      tagAt(a2, b2, show ? cm(dist(ft.a2, ft.b2)) : '?', isPar ? col.par() : col.bad(), isX ? (sideOf(a2, b2, cz) === 1 ? -1 : 1) : (sideOf(a2, b2, cz) === 1 ? -1 : 1));
      // Punkte
      dot(z, 5.5, theme.text);
      const zAway: Px = isX ? [d1[1] + d2[1], -(d1[0] + d2[0])] : [-(d1[0] + d2[0]), -(d1[1] + d2[1])];
      const [zx, zy] = unit(zAway[0], zAway[1]);
      labelIn('Z', z[0] + zx * 18, z[1] + zy * 18, font(800, F(15, 13)), theme.text);
      const nUp: Px = [-d1[1], d1[0]];
      handle(a, 'a', r1, 'A', [nUp[0] * -1, nUp[1] * -1]);
      handle(a2, 'a2', r1, 'A′', [nUp[0] * -1, nUp[1] * -1], true);
      const nDn: Px = [d2[1], -d2[0]];
      handle(b, 'b', r2, 'B', [-nDn[0], -nDn[1]]);
      handle(b2, 'b2', isPar ? r2 : col.bad(), 'B′', [-nDn[0], -nDn[1]], true);
      // Griff zum Drehen des ersten Strahls (am Ende, wo Platz ist)
      if (!ctx.locked) {
        const far = Math.max(dist(ft.z, ft.a), dist(ft.z, ft.a2)) + 1.2;
        const rp = toPx([far * Math.cos(rad(shown.th)), far * Math.sin(rad(shown.th))]);
        const active = hover === 'ray' || drag === 'ray';
        g.beginPath();
        g.arc(rp[0], rp[1], active ? 13 : 10, 0, Math.PI * 2);
        g.fillStyle = withAlpha(r1, active ? 0.24 : 0.12);
        g.fill();
        g.save();
        g.translate(rp[0], rp[1]);
        g.rotate(-rad(shown.th) + Math.PI / 2);
        g.strokeStyle = r1;
        g.lineWidth = 2;
        g.lineCap = 'round';
        g.beginPath();
        g.arc(0, 0, 5.5, Math.PI * 0.15, Math.PI * 0.85);
        g.stroke();
        g.restore();
      }
      // Winkel bei Z
      const rr = 26;
      g.beginPath();
      g.arc(z[0], z[1], rr, -rad(shown.th), 0, false);
      g.strokeStyle = withAlpha(theme.text, 0.5);
      g.lineWidth = 1.4;
      g.stroke();
    }

    /* ---------- Anwendung: Baum ---------- */
    function drawTree(base: Px, hPx: number, trunkW: number): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const trunkH = hPx * 0.42;
      const tg = g.createLinearGradient(base[0] - trunkW / 2, 0, base[0] + trunkW / 2, 0);
      tg.addColorStop(0, dark ? '#4a3626' : '#6b4a2e');
      tg.addColorStop(0.5, dark ? '#7a5a3e' : '#9a6c43');
      tg.addColorStop(1, dark ? '#3c2b1e' : '#5a3d25');
      g.fillStyle = tg;
      g.beginPath();
      g.moveTo(base[0] - trunkW * 0.65, base[1]);
      g.lineTo(base[0] - trunkW * 0.35, base[1] - trunkH);
      g.lineTo(base[0] + trunkW * 0.35, base[1] - trunkH);
      g.lineTo(base[0] + trunkW * 0.65, base[1]);
      g.closePath();
      g.fill();
      // Krone aus mehreren Kreisen
      const crownR = hPx * 0.3;
      const cy = base[1] - hPx + crownR;
      const blobs: [number, number, number][] = [
        [0, 0, 1],
        [-0.55, 0.45, 0.78],
        [0.55, 0.45, 0.78],
        [-0.25, 0.85, 0.72],
        [0.3, 0.9, 0.7],
      ];
      for (const [dx, dy, r] of blobs) {
        const x = base[0] + dx * crownR;
        const y = cy + dy * crownR;
        const gr = g.createRadialGradient(x - crownR * 0.3, y - crownR * 0.35, crownR * 0.1, x, y, crownR * r);
        gr.addColorStop(0, dark ? '#4f8a4a' : '#7cc06a');
        gr.addColorStop(1, dark ? '#25502a' : '#3f8a3f');
        g.fillStyle = gr;
        g.beginPath();
        g.arc(x, y, crownR * r, 0, Math.PI * 2);
        g.fill();
      }
    }

    function drawBaum(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const { stage } = layout();
      const el = shown.el;
      const { dStick, dTree } = shadowLengths(shown.ht, shown.st, el);
      // Himmel
      const sky = g.createLinearGradient(0, stage.y, 0, toPx([0, 0])[1]);
      sky.addColorStop(0, theme.dark ? '#0f1a2c' : '#bfe0f7');
      sky.addColorStop(1, theme.dark ? '#1d2b40' : '#eef7fd');
      g.fillStyle = sky;
      g.fillRect(stage.x, stage.y, stage.w, stage.h);
      // Boden
      const gy = toPx([0, 0])[1];
      const gr = g.createLinearGradient(0, gy, 0, stage.y + stage.h);
      gr.addColorStop(0, theme.dark ? '#2c4a2a' : '#a8d58e');
      gr.addColorStop(1, theme.dark ? '#1c321c' : '#7fbf6a');
      g.fillStyle = gr;
      g.fillRect(stage.x, gy, stage.w, stage.y + stage.h - gy);
      // Sonne in Strahlrichtung über dem Baum
      const u: Pt = [Math.cos(rad(el)), Math.sin(rad(el))];
      const topT: Pt = [dTree, shown.ht];
      let k = 2.5;
      let sp = toPx([topT[0] + u[0] * k, topT[1] + u[1] * k]);
      while ((sp[0] > stage.x + stage.w - 30 || sp[1] < stage.y + 30) && k > 0.3) {
        k -= 0.1;
        sp = toPx([topT[0] + u[0] * k, topT[1] + u[1] * k]);
      }
      const sunR = F(20, 15);
      const glow = g.createRadialGradient(sp[0], sp[1], sunR * 0.4, sp[0], sp[1], sunR * 2.8);
      glow.addColorStop(0, 'rgba(255,214,90,0.55)');
      glow.addColorStop(1, 'rgba(255,214,90,0)');
      g.fillStyle = glow;
      g.beginPath();
      g.arc(sp[0], sp[1], sunR * 2.8, 0, Math.PI * 2);
      g.fill();
      const sg = g.createRadialGradient(sp[0] - sunR * 0.3, sp[1] - sunR * 0.3, 2, sp[0], sp[1], sunR);
      sg.addColorStop(0, '#fff6c9');
      sg.addColorStop(1, '#f6b52e');
      g.fillStyle = sg;
      g.beginPath();
      g.arc(sp[0], sp[1], sunR, 0, Math.PI * 2);
      g.fill();
      sunPx = sp;
      if (!ctx.locked && (hover === 'sun' || drag === 'sun')) {
        g.beginPath();
        g.arc(sp[0], sp[1], sunR + 6, 0, Math.PI * 2);
        g.strokeStyle = withAlpha(col.sun(), 0.8);
        g.lineWidth = 2;
        g.stroke();
      }
      const z = toPx([0, 0]);
      const st = toPx([dStick, 0]);
      const stT = toPx([dStick, shown.st]);
      const tb = toPx([dTree, 0]);
      const tt = toPx(topT);
      // Schatten
      g.save();
      g.globalAlpha = 0.35;
      segment(z, tb, theme.dark ? '#000000' : '#2d4a25', F(9, 7));
      g.restore();
      // Baum und Stab
      drawTree(tb, tb[1] - tt[1], Math.max(8, scale() * 0.5));
      const sw = Math.max(4, scale() * 0.09);
      g.save();
      g.lineCap = 'butt';
      segment(st, stT, theme.dark ? '#d9b382' : '#b07a43', sw);
      for (let i = 0; i < 4; i++) {
        const y0 = lerp(st[1], stT[1], i / 4);
        const y1 = lerp(st[1], stT[1], (i + 0.5) / 4);
        segment([st[0], y0], [st[0], y1], i % 2 ? '#ffffff' : '#d94141', sw);
      }
      g.restore();
      // Sonnenstrahl
      segment(sp, z, withAlpha(col.sun(), 0.95), 2.4);
      // Maße
      const show = p.show;
      const meas = baumMeasured();
      const yLine = z[1] + F(22, 18);
      const dimLine = (x0: number, x1: number, y: number, label: string, color: string) => {
        segment([x0, y], [x1, y], color, 1.6);
        segment([x0, y - 5], [x0, y + 5], color, 1.6);
        segment([x1, y - 5], [x1, y + 5], color, 1.6);
        tagAt([x0, y], [x1, y], label, color, 1);
      };
      dimLine(z[0], st[0], yLine, `${q('ZB')} = ${m2(meas.ds)}`, col.r2());
      dimLine(z[0], tb[0], yLine + F(30, 26), `${q('ZB′')} = ${m2(meas.dt)}`, col.r2());
      tagAt(st, stT, `s = ${m1(p.st)}`, col.r1(), 1);
      const hText = show ? `h ≈ ${m1(treeHeight(p.st, meas.ds, meas.dt))}` : 'h = ?';
      segment([tb[0] + Math.max(14, scale() * 0.9), tb[1]], [tb[0] + Math.max(14, scale() * 0.9), tt[1]], col.k(), 1.6, [5, 4]);
      tagAt([tb[0] + Math.max(14, scale() * 0.9), tb[1]], [tb[0] + Math.max(14, scale() * 0.9), tt[1]], hText, col.k(), 1);
      // Punkte
      dot(z, 5, theme.text);
      labelIn('Z', z[0] - 4, z[1] + 14, font(800, F(14, 12.5)), theme.text);
      handle(stT, 'stick', col.r1(), 'A', [-1, -0.6], true);
      labelIn('B', st[0] + 10, st[1] + 11, font(800, F(13, 12)), col.r2());
      handle(tt, 'tree', col.k(), 'A′', [-1, -0.4], true);
      labelIn('B′', tb[0] - 12, tb[1] + 11, font(800, F(13, 12)), col.r2());
      g.beginPath();
      g.arc(z[0], z[1], 24, -rad(el), 0);
      g.strokeStyle = col.sun();
      g.lineWidth = 1.6;
      g.stroke();
      haloText(`${ctx.t('elev')} ${fmt.num(Math.round(el), 0)}°`, sunPx[0] - F(20, 16), sunPx[1] + F(34, 28), font(700, F(12, 11)), col.sun(), 'right');
    }
    let sunPx: Px = [0, 0];

    /* ---------- Anwendung: Teich ---------- */
    function teichGeom() {
      const w = shown.w;
      const A: Pt = [0, 0];
      const B: Pt = [w, 0];
      const Z: Pt = [w * 0.42, -w * 0.62];
      const k = shown.kt;
      const A2: Pt = [Z[0] + (Z[0] - A[0]) / k, Z[1] + (Z[1] - A[1]) / k];
      const B2: Pt = [Z[0] + (Z[0] - B[0]) / k, Z[1] + (Z[1] - B[1]) / k];
      return { A, B, Z, A2, B2 };
    }
    function drawStake(q: Px, color: string): void {
      const g = surface.g;
      const h = F(30, 24);
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.3)';
      g.shadowBlur = 4;
      g.shadowOffsetX = 3;
      g.lineCap = 'butt';
      for (let i = 0; i < 4; i++) segment([q[0], q[1] - (i * h) / 4], [q[0], q[1] - ((i + 1) * h) / 4], i % 2 ? '#ffffff' : color, 4);
      g.restore();
      dot(q, 3, color);
    }
    function drawTeich(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const { stage } = layout();
      const gg = g.createLinearGradient(0, stage.y, 0, stage.y + stage.h);
      gg.addColorStop(0, theme.dark ? '#22391f' : '#b8de9f');
      gg.addColorStop(1, theme.dark ? '#1a2c18' : '#9fd084');
      g.fillStyle = gg;
      g.fillRect(stage.x, stage.y, stage.w, stage.h);
      const t = teichGeom();
      const a = toPx(t.A);
      const b = toPx(t.B);
      // Teich: Ellipse, A und B am Ufer
      const cx = (a[0] + b[0]) / 2;
      const rx = (b[0] - a[0]) / 2;
      const ry = Math.max(rx * 0.55, 24);
      const cyy = a[1] - ry * 0.35;
      g.save();
      g.beginPath();
      g.ellipse(cx, cyy, rx * 1.02, ry, 0, 0, Math.PI * 2);
      const wg = g.createRadialGradient(cx - rx * 0.3, cyy - ry * 0.4, 4, cx, cyy, rx);
      wg.addColorStop(0, theme.dark ? '#2f6a8f' : '#8fd0f0');
      wg.addColorStop(1, theme.dark ? '#1b415c' : '#4aa3d4');
      g.fillStyle = wg;
      g.fill();
      g.strokeStyle = theme.dark ? '#6f8f5e' : '#c9b98a';
      g.lineWidth = 4;
      g.stroke();
      // Wellen
      g.strokeStyle = 'rgba(255,255,255,0.35)';
      g.lineWidth = 1.4;
      for (let i = 0; i < 4; i++) {
        const y = cyy - ry * 0.5 + i * ry * 0.3;
        const x0 = cx - rx * (0.5 - i * 0.08);
        g.beginPath();
        g.moveTo(x0, y);
        g.quadraticCurveTo(x0 + rx * 0.15, y - 4, x0 + rx * 0.3, y);
        g.stroke();
      }
      g.restore();
      const z = toPx(t.Z);
      const a2 = toPx(t.A2);
      const b2 = toPx(t.B2);
      // Peillinien
      segment(a, a2, withAlpha(col.r1(), 0.9), 2, [7, 5]);
      segment(b, b2, withAlpha(col.r2(), 0.9), 2, [7, 5]);
      // gesuchte Breite
      segment(a, b, col.k(), 2.6, [3, 4]);
      tagAt(a, b, p.show ? `|AB| = ${m1(p.w)}` : '|AB| = ?', col.k(), -1);
      // Maßband A′B′
      segment(a2, b2, theme.dark ? '#e6c35a' : '#e0b232', 5);
      segment(a2, b2, withAlpha('#000000', 0.25), 1, [2, 6]);
      const mm = Math.round((p.w / p.kt) * 100) / 100;
      tagAt(a2, b2, `${q('A′B′')} = ${m2(mm)}`, col.par(), 1);
      // Abschnitte von Z aus
      const ratioLab = `|ZA| : |ZA′| = ${p.kt} : 1`;
      tagAt(z, a, ratioLab, col.r1(), -1, 0.55);
      drawStake(a, '#d94141');
      drawStake(b, '#d94141');
      drawStake(z, '#3a6fd9');
      drawStake(a2, '#d94141');
      drawStake(b2, '#d94141');
      labelIn('A', a[0] - 14, a[1] + 4, font(800, F(14, 12.5)), col.r1());
      labelIn('B', b[0] + 14, b[1] + 4, font(800, F(14, 12.5)), col.r2());
      labelIn('Z', z[0] + 14, z[1] - 4, font(800, F(14, 12.5)), theme.text);
      labelIn('A′', a2[0] + 16, a2[1] + 6, font(800, F(14, 12.5)), col.r1());
      labelIn('B′', b2[0] - 16, b2[1] + 6, font(800, F(14, 12.5)), col.r2());
      if (!ctx.locked) {
        const active = hover === 'p2' || drag === 'p2';
        g.beginPath();
        g.arc(a2[0], a2[1], active ? 15 : 12, 0, Math.PI * 2);
        g.fillStyle = withAlpha(col.r1(), active ? 0.28 : 0.14);
        g.fill();
      }
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

    const ZA = () => (ctx.lang === 'de' ? '|ZA|' : 'ZA');
    const q = (s: string) => (ctx.lang === 'de' ? `|${s}|` : s);

    /** Karte mit einem Strahlensatz als Bruchgleichung. */
    function eqSpec(which: 1 | 2 | 3): CardSpec {
      const f = figT();
      const r = ratios(f);
      const ok = parallel(f, 1e-6);
      const pad = F(14, 12);
      const r1 = col.r1();
      const r2 = col.r2();
      const pc = col.par();
      const theme = ctx.theme;
      const show = p.show;
      const fr = (num: string, den: string, cn: string, cd: string): Item => ({ kind: 'frac', num, den, cn, cd });
      const tx = (s: string, color = theme.text, bold = false): Item => ({ kind: 'txt', s, color, bold });
      const val = (v: number) => fmt.num(v, 1);
      const za = dist(f.z, f.a);
      const za2 = dist(f.z, f.a2);
      const zb = dist(f.z, f.b);
      const zb2 = dist(f.z, f.b2);
      const ab = dist(f.a, f.b);
      const ab2 = dist(f.a2, f.b2);
      let rows: Item[][];
      let head: string;
      let good: boolean;
      if (which === 1) {
        head = ctx.t('s1T');
        good = Math.abs(r.r1 - r.r2) < 0.005;
        rows = [
          [fr(q('ZA′'), q('ZA'), r1, r1), tx('='), fr(show ? val(za2) : '?', val(za), r1, r1), tx('≈'), tx(show ? fmt.num(r.r1, 2) : '?', r1, true)],
          [fr(q('ZB′'), q('ZB'), r2, r2), tx('='), fr(val(zb2), val(zb), r2, r2), tx('≈'), tx(fmt.num(r.r2, 2), r2, true)],
        ];
      } else if (which === 2) {
        head = ctx.t('s2T');
        good = Math.abs(r.r3 - r.r1) < 0.005;
        rows = [[fr(q('A′B′'), q('AB'), pc, pc), tx('='), fr(show ? val(ab2) : '?', val(ab), pc, pc), tx('≈'), tx(show ? fmt.num(r.r3, 2) : '?', pc, true)]];
      } else {
        // Abschnitte: |ZA| : |AA′| = |ZB| : |BB′| (nur V-Figur)
        head = ctx.t('s1bT');
        const aa = dist(f.a, f.a2);
        const bb = dist(f.b, f.b2);
        good = Math.abs(za / aa - zb / bb) < 0.005;
        rows = [[fr(ZA(), q('AA′'), r1, r1), tx('='), fr(q('ZB'), q('BB′'), r2, r2), tx('≈'), tx(aa > 0.05 ? fmt.num(za / aa, 2) : '–', theme.text, true)]];
      }
      const rowH = F(46, 42);
      return {
        h: F(32, 28) + rows.length * rowH + 4,
        draw(R) {
          card(R, good && ok ? undefined : col.bad(), good && ok ? 0 : 0.04);
          title(R.x + pad, R.y + 16, head);
          if (show || which === 3) chip(R, good ? ctx.t('equal') : ctx.t('differ'), good ? col.par() : col.bad());
          rows.forEach((it, i) => equation(it, R.x + pad, R.y + F(32, 28) + rowH * (i + 0.5), R.w - 2 * pad, F(14, 13)));
        },
      };
    }

    function kSpec(w: number): CardSpec {
      const f = figT();
      const ok = parallel(f, 1e-6);
      if (!ok) return textSpec(w, ctx.t('nopT'), tr('nop', { d: `${fmt.num(angleBetween(f), 1)}°` }), col.bad());
      return textSpec(w, ctx.t('triT'), tr('tri', { k: fmt.num(p.k, 2) }), col.k());
    }
    const merkeSpec = (w: number) => textSpec(w, ctx.t('merkeT'), ctx.t(mode() === 'x' ? 'merkeX' : 'merkeV'), undefined, true);

    function baumSpec(): CardSpec {
      const pad = F(14, 12);
      const meas = baumMeasured();
      const theme = ctx.theme;
      const fr = (num: string, den: string, cn: string, cd: string): Item => ({ kind: 'frac', num, den, cn, cd });
      const tx = (s: string, color = theme.text, bold = false): Item => ({ kind: 'txt', s, color, bold });
      const h = treeHeight(p.st, meas.ds, meas.dt);
      const rows: Item[][] = [
        [fr('h', 's', col.k(), col.r1()), tx('='), fr(q('ZB′'), q('ZB'), col.r2(), col.r2())],
        [tx('h ='), tx(m1(p.st), col.r1()), tx('·'), fr(m2(meas.dt), m2(meas.ds), col.r2(), col.r2()), tx(p.show ? `≈ ${m1(h)}` : '= ?', col.k(), true)],
      ];
      const rowH = F(46, 42);
      return {
        h: F(32, 28) + rows.length * rowH + 4,
        draw(R) {
          card(R, col.k(), 0.03);
          title(R.x + pad, R.y + 16, ctx.t('baumT'), col.k());
          rows.forEach((it, i) => equation(it, R.x + pad, R.y + F(32, 28) + rowH * (i + 0.5), R.w - 2 * pad, F(14, 13)));
        },
      };
    }
    function teichSpec(): CardSpec {
      const pad = F(14, 12);
      const theme = ctx.theme;
      const mm = Math.round((p.w / p.kt) * 100) / 100;
      const fr = (num: string, den: string, cn: string, cd: string): Item => ({ kind: 'frac', num, den, cn, cd });
      const tx = (s: string, color = theme.text, bold = false): Item => ({ kind: 'txt', s, color, bold });
      const rows: Item[][] = [
        [fr(q('AB'), q('A′B′'), col.k(), col.par()), tx('='), fr(q('ZA'), q('ZA′'), col.r1(), col.r1()), tx('='), tx(String(p.kt), col.r1(), true)],
        [tx(`${q('AB')} = ${p.kt} ·`), tx(m2(mm), col.par()), tx(p.show ? approxM(p.kt * mm) : '= ?', col.k(), true)],
      ];
      const rowH = F(46, 42);
      return {
        h: F(32, 28) + rows.length * rowH + 4,
        draw(R) {
          card(R, col.k(), 0.03);
          title(R.x + pad, R.y + 16, ctx.t('teichT'), col.k());
          rows.forEach((it, i) => equation(it, R.x + pad, R.y + F(32, 28) + rowH * (i + 0.5), R.w - 2 * pad, F(14, 13)));
        },
      };
    }

    /* ---------- Rendern ---------- */
    let hitTargets: { id: DragId; q: Px; r: number }[] = [];
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      const mv1 = stepShown(dt);
      const mv2 = stepView(dt);
      if (intro < 1) intro = Math.min(1, intro + dt * 1.6);
      surface.begin();
      const lay = layout();
      const g = surface.g;
      const m = mode();
      if (m === 'v' || m === 'x') drawPaper(lay.stage);
      g.save();
      roundRect(g, lay.stage.x, lay.stage.y, lay.stage.w, lay.stage.h, 10);
      g.clip();
      if (m === 'v' || m === 'x') drawFigure();
      else if (m === 'baum') drawBaum();
      else drawTeich();
      g.restore();
      g.strokeStyle = ctx.theme.dark ? '#2a3445' : '#d5dce6';
      g.lineWidth = 1;
      roundRect(g, lay.stage.x + 0.5, lay.stage.y + 0.5, lay.stage.w - 1, lay.stage.h - 1, 10);
      g.stroke();
      // Ziehpunkte merken
      hitTargets = [];
      if (m === 'v' || m === 'x') {
        const f = fig();
        hitTargets.push({ id: 'a2', q: toPx(f.a2), r: 18 }, { id: 'b2', q: toPx(f.b2), r: 18 }, { id: 'a', q: toPx(f.a), r: 18 }, { id: 'b', q: toPx(f.b), r: 18 });
        const ft = figT();
        const far = Math.max(dist(ft.z, ft.a), dist(ft.z, ft.a2)) + 1.2;
        hitTargets.push({ id: 'ray', q: toPx([far * Math.cos(rad(shown.th)), far * Math.sin(rad(shown.th))]), r: 16 });
      } else if (m === 'baum') {
        const { dStick, dTree } = shadowLengths(shown.ht, shown.st, shown.el);
        hitTargets.push({ id: 'sun', q: sunPx, r: 30 }, { id: 'stick', q: toPx([dStick, shown.st]), r: 18 }, { id: 'tree', q: toPx([dTree, shown.ht]), r: 22 });
      } else hitTargets.push({ id: 'p2', q: toPx(teichGeom().A2), r: 20 });

      const gap = F(10, 8);
      const box = lay.side ?? lay.below!;
      if (m === 'v' || m === 'x') {
        const makers: ((w: number) => CardSpec | null)[] = [() => eqSpec(1), () => eqSpec(2)];
        if (lay.side && m === 'v') makers.push(() => eqSpec(3));
        makers.push(kSpec, merkeSpec);
        stack(box, makers, gap);
      } else if (m === 'baum') stack(box, [() => baumSpec(), (w) => textSpec(w, ctx.t('merkeT'), ctx.t('baumIdea'), undefined, true)], gap);
      else stack(box, [() => teichSpec(), (w) => textSpec(w, ctx.t('merkeT'), tr('teichIdea', { k: p.kt }), undefined, true)], gap);
      if (mv1 || mv2 || intro < 1) ctx.requestRender();
    }

    /* ---------- Zeiger ---------- */
    function hitAt(px: number, py: number): DragId | null {
      if (ctx.locked) return null;
      let best: DragId | null = null;
      let bd = Infinity;
      for (const h of hitTargets) {
        const d = Math.hypot(px - h.q[0], py - h.q[1]);
        if (d < (wide() ? h.r : h.r + 4) && d < bd) {
          bd = d;
          best = h.id;
        }
      }
      return best;
    }

    /** Länge der Projektion von w auf die Richtung u (Weltkoordinaten). */
    const along = (w: Pt, u: Pt) => w[0] * u[0] + w[1] * u[1];
    const r1d = (v: number) => Math.round(v * 10) / 10;
    const r05 = (v: number) => Math.round(v * 20) / 20;

    function dragTo(id: DragId, w: Pt): void {
      const th = p.th;
      const u1: Pt = [Math.cos(rad(th)), Math.sin(rad(th))];
      const u2: Pt = [1, 0];
      const sx = mode() === 'x' ? -1 : 1;
      switch (id) {
        case 'a':
          ctx.set({ a: r1d(clamp(along(w, u1), 1, 8)) });
          break;
        case 'b':
          ctx.set({ b: r1d(clamp(along(w, u2), 1, 8)) });
          break;
        case 'a2':
          ctx.set({ k: r05(clamp((sx * along(w, u1)) / p.a, 0.2, 3)) });
          break;
        case 'b2':
          if (p.par) ctx.set({ k: r05(clamp((sx * along(w, u2)) / p.b, 0.2, 3)) });
          else ctx.set({ kb: r05(clamp((sx * along(w, u2)) / p.b, 0.2, 3)) });
          break;
        case 'ray': {
          const a = deg(Math.atan2(w[1], w[0]));
          ctx.set({ th: Math.round(clamp(a, 15, 120)) });
          break;
        }
        case 'sun': {
          // Sonnenhöhe aus der Richtung von der Baumspitze zum Zeiger
          const { dTree } = shadowLengths(p.ht, p.st, p.el);
          const a = deg(Math.atan2(w[1] - p.ht, w[0] - dTree));
          ctx.set({ el: Math.round(clamp(a, 20, 60)) });
          break;
        }
        case 'stick':
          ctx.set({ st: r1d(clamp(w[1], 1, 2.5)) });
          break;
        case 'tree':
          ctx.set({ ht: Math.round(clamp(w[1], 5, 20) * 2) / 2 });
          break;
        case 'p2': {
          const t = teichGeom();
          const d = dist(t.Z, t.A);
          const e = dist(t.Z, w);
          ctx.set({ kt: Math.round(clamp(d / Math.max(0.1, e), 2, 6)) });
          break;
        }
      }
    }

    surface.addTarget({
      contains: (px: number, py: number) => drag !== null || hitAt(px, py) !== null,
      pointerDown: (pt: { px: number; py: number }) => {
        const id = hitAt(pt.px, pt.py);
        if (!id) return false;
        drag = id;
        surface.setCursor('grabbing');
        ctx.requestRender();
        return true;
      },
      pointerMove: (pt: { px: number; py: number }) => {
        if (!drag || ctx.locked) return;
        dragTo(drag, toWorld(pt.px, pt.py));
        ctx.requestRender();
      },
      pointerUp: () => {
        drag = null;
        surface.setCursor('');
        ctx.requestRender();
      },
      hover: (pt: { px: number; py: number } | null) => {
        const id = pt ? hitAt(pt.px, pt.py) : null;
        if (id !== hover) {
          hover = id;
          ctx.requestRender();
        }
        surface.setCursor(id ? 'grab' : '');
      },
      wheel: () => false,
    });

    return {
      update(changed, source) {
        if (changed.has('mode') && source === 'input') ctx.set(START[mode()]);
        if (changed.has('par') && source === 'input' && !p.par) ctx.set({ kb: Math.max(0.2, Math.round((p.k - 0.4) * 20) / 20) });
        if (changed.has('mode') || source === 'replace') {
          if (changed.has('mode')) shown = target();
          intro = reduced ? 1 : 0;
          if (changed.has('mode')) view = null;
        }
        updateReadouts();
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
