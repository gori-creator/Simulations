import { defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, shade, Surface, text, type Rect } from '../../../sim-core';
import {
  ANGLE_IDS,
  alphaFromGiven,
  doubleAngles,
  explain,
  intersect,
  isParallel,
  isSupplementary,
  makeTask,
  norm180,
  norm360,
  partner,
  relation,
  type AngleId,
  type Relation,
  type Step,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const rad = (deg: number) => (deg * Math.PI) / 180;
const isMode = (m: string) => (v: Record<string, unknown>) => v.mode === m;

type Mode = 'kreuz' | 'doppel' | 'aufgabe';
type Rel3 = 'stufen' | 'wechsel' | 'nachbar';
/** Winkel der einfachen Kreuzung (α, β, γ, δ) bzw. der Doppelkreuzung (α₁ … δ₂). */
type Id = 'a' | 'b' | 'c' | 'd' | AngleId;
type Pt = [number, number];

const GREEK: Record<string, string> = { a: 'α', b: 'β', c: 'γ', d: 'δ' };
const SUB: Record<string, string> = { '1': '₁', '2': '₂' };
const angleName = (id: Id) => GREEK[id[0]!]! + (id.length > 1 ? SUB[id[1]!]! : '');
const ID_OPTIONS = ANGLE_IDS.map((id) => ({ value: id, label: L(angleName(id), angleName(id)) }));

/** Ein Winkelfeld: Scheitel (Pixel), Startrichtung und Größe in Grad (gegen den Uhrzeigersinn). */
interface Sector {
  id: Id;
  V: Pt;
  from: number;
  sweep: number;
  /** Ganzzahliger Wert (für Texte). */
  value: number;
  r: number;
  color: string;
}

interface Anim {
  kind: 'vert' | 'supp' | 'shift' | 'turn';
  x: Id;
  y: Id;
  t0: number;
}

type Drag = { kind: 'kg' } | { kind: 'kh' } | { kind: 'dg' } | { kind: 'dh' } | { kind: 'ds' };

/**
 * Winkel an Geradenkreuzungen: zwei sich schneidende Geraden mit Scheitel- und
 * Nebenwinkeln, eine Doppelkreuzung (g, h und die Querlinie s) mit Stufen-,
 * Wechsel- und Nachbarwinkeln – animiert durch Drehen und Verschieben – und
 * ein Aufgabenmodus, in dem man die Winkel antippt und begründet.
 */
export default defineSimulation({
  id: 'winkel-geradenkreuzung',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.56 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'kreuz', label: L('Zwei Geraden', 'Two lines') },
        { value: 'doppel', label: L('Doppelkreuzung', 'Transversal') },
        { value: 'aufgabe', label: L('Aufgabe', 'Exercise') },
      ],
      default: 'kreuz',
    },
    { key: 'w', type: 'number', label: L('Schnittwinkel α', 'Angle α'), min: 1, max: 179, step: 1, default: 65, unit: '°', visibleIf: isMode('kreuz') },
    {
      key: 'a',
      type: 'number',
      label: L('Lage der Geraden g', 'Direction of line g'),
      min: 0,
      max: 359,
      step: 1,
      default: 20,
      unit: '°',
      help: L('Dreht die ganze Kreuzung.', 'Rotates the whole crossing.'),
      visibleIf: isMode('kreuz'),
    },
    { key: 'g', type: 'number', label: L('Winkel α₁ an g', 'Angle α₁ at g'), min: 1, max: 179, step: 1, default: 50, unit: '°', visibleIf: isMode('doppel') },
    {
      key: 'par',
      type: 'boolean',
      label: L('g ∥ h', 'g ∥ h'),
      help: L('h rastet parallel zu g ein.', 'h snaps parallel to g.'),
      default: true,
      visibleIf: isMode('doppel'),
    },
    { key: 'h', type: 'number', label: L('Winkel α₂ an h', 'Angle α₂ at h'), min: 1, max: 179, step: 1, default: 58, unit: '°', visibleIf: (v) => v.mode === 'doppel' && !v.par },
    { key: 's', type: 'number', label: L('Lage der Querlinie s', 'Direction of the transversal s'), min: 25, max: 155, step: 1, default: 70, unit: '°', visibleIf: isMode('doppel') },
    {
      key: 'rel',
      type: 'choice',
      label: L('Winkelpaar', 'Pair of angles'),
      options: [
        { value: 'stufen', label: L('Stufenwinkel (F)', 'Corresponding (F)') },
        { value: 'wechsel', label: L('Wechselwinkel (Z)', 'Alternate (Z)') },
        { value: 'nachbar', label: L('Nachbarwinkel (E)', 'Co-interior (C)') },
      ],
      default: 'stufen',
      visibleIf: isMode('doppel'),
    },
    { key: 'gi', type: 'choice', label: L('Gegebener Winkel', 'Given angle'), options: ID_OPTIONS, default: 'b2', visibleIf: isMode('aufgabe') },
    { key: 'gv', type: 'number', label: L('Seine Größe', 'Its size'), min: 25, max: 155, step: 5, default: 70, unit: '°', visibleIf: isMode('aufgabe') },
    { key: 'tg', type: 'number', label: L('Neigung der Geraden g', 'Tilt of line g'), min: -15, max: 15, step: 5, default: 5, unit: '°', visibleIf: isMode('aufgabe') },
    { key: 'vals', type: 'boolean', group: 'view', label: L('Alle Winkelgrößen zeigen', 'Show all angle sizes'), help: L('Aus: Nur α bzw. α₁ ist gegeben, die anderen Winkel sind gesucht.', 'Off: only α or α₁ is given, the other angles are to be found.'), default: true, visibleIf: (v) => v.mode !== 'aufgabe' },
  ],
  actions: [
    { id: 'supp', label: L('Nebenwinkel zusammenlegen', 'Join adjacent angles'), primary: true, visibleIf: isMode('kreuz') },
    { id: 'vert', label: L('Scheitelwinkel drehen', 'Turn vertical angle'), visibleIf: isMode('kreuz') },
    { id: 'shift', label: L('Entlang s verschieben', 'Slide along s'), primary: true, visibleIf: (v) => v.mode === 'doppel' && v.rel !== 'wechsel' },
    { id: 'turn', label: L('Um 180° drehen', 'Turn by 180°'), primary: true, visibleIf: (v) => v.mode === 'doppel' && v.rel === 'wechsel' },
    { id: 'all', label: L('Alle aufdecken', 'Reveal all'), visibleIf: isMode('aufgabe') },
    { id: 'new', label: L('Neue Aufgabe', 'New exercise'), primary: true, visibleIf: isMode('aufgabe') },
  ],
  readouts: [
    { key: 'given', label: L('Gegeben', 'Given') },
    { key: 'angles', label: L('Winkel', 'Angles'), spoiler: true },
    { key: 'pair', label: L('Beziehung', 'Relation'), spoiler: true },
    { key: 'prog', label: L('Fortschritt', 'Progress') },
  ],
  resultsParam: 'vals',
  presets: [
    { id: 'start', label: L('Zwei Geraden schneiden sich', 'Two intersecting lines'), values: {} },
    { id: 'recht', label: L('Senkrechte Geraden', 'Perpendicular lines'), values: { w: 90, a: 0 } },
    { id: 'flach', label: L('Fast parallel', 'Almost parallel'), values: { w: 8, a: 15 } },
    { id: 'par', label: L('Stufenwinkel an Parallelen', 'Corresponding angles at parallels'), values: { mode: 'doppel' } },
    { id: 'wechsel', label: L('Wechselwinkel an Parallelen', 'Alternate angles at parallels'), values: { mode: 'doppel', rel: 'wechsel', g: 62, s: 60 } },
    { id: 'nicht', label: L('g und h nicht parallel', 'g and h not parallel'), values: { mode: 'doppel', par: false, g: 50, h: 58 } },
    { id: 'aufgabe', label: L('Winkel begründen', 'Give reasons'), values: { mode: 'aufgabe' } },
  ],
  strings: {
    de: {
      canvas: 'Zwei sich schneidende Geraden mit farbigen Winkelbögen, eine Doppelkreuzung zweier Geraden mit einer Querlinie und eine Seitenleiste mit Winkelgrößen und Begründungen',
    },
    en: {
      canvas: 'Two intersecting lines with coloured angle arcs, two lines crossed by a transversal and a side panel with angle sizes and reasons',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const de = ctx.lang === 'de';
    const tt = (d: string, e: string) => (de ? d : e);
    const mode = () => p.mode as Mode;
    const font = (w: number, s: number) => `${w} ${s}px ${ctx.theme.font}`;
    const mfont = (s: number) => `italic 700 ${s}px ${ctx.theme.mathFont}`;
    const alpha = (c: string, a: number) => shade(c, 0, a);
    const deg = (v: number) => `${fmt.num(v, 0)}°`;
    const onColor = () => (ctx.theme.dark ? '#0f1520' : '#ffffff');

    /* ---------------- weich gleitende Werte ---------------- */
    class Glide {
      private from: number;
      private to: number;
      private t0 = 0;
      private ms = 0;
      private fn: (t: number) => number = ease.inOutCubic;
      constructor(v: number) {
        this.from = v;
        this.to = v;
      }
      at(t: number): number {
        if (this.ms <= 0) return this.to;
        const u = clamp((t - this.t0) / this.ms, 0, 1);
        return this.from + (this.to - this.from) * this.fn(u);
      }
      busy(t: number): boolean {
        return this.ms > 0 && t < this.t0 + this.ms;
      }
      go(to: number, ms = 650, fn: (t: number) => number = ease.inOutCubic): void {
        const t = performance.now();
        if (to === this.to && !this.busy(t)) return;
        this.from = this.at(t);
        this.to = to;
        this.t0 = t;
        this.ms = reduced ? 0 : ms;
        this.fn = fn;
      }
      /** Für Richtungen: auf dem kürzeren Weg drehen (modulo 360°). */
      goAngle(to: number, ms = 650): void {
        const cur = this.at(performance.now());
        const d = ((((to - cur) % 360) + 540) % 360) - 180;
        this.go(cur + d, ms);
      }
      snap(v: number): void {
        this.from = v;
        this.to = v;
        this.ms = 0;
      }
    }

    let now = performance.now();
    const prog = (t0: number, ms: number) => (reduced ? 1 : clamp((now - t0) / ms, 0, 1));

    // Kreuzung
    const gA = new Glide(p.a);
    const gW = new Glide(p.w);
    // Doppelkreuzung / Aufgabe
    const effS = () => (mode() === 'aufgabe' ? p.tg + alphaFromGiven(p.gi as AngleId, p.gv) : p.s);
    const effG = () => (mode() === 'aufgabe' ? alphaFromGiven(p.gi as AngleId, p.gv) : p.g);
    const effH = () => (mode() === 'aufgabe' || p.par ? effG() : p.h);
    const gS = new Glide(effS());
    const gG = new Glide(effG());
    const gH = new Glide(effH());
    const gPar = new Glide(mode() !== 'kreuz' && isParallel(effG(), effH()) ? 1 : 0);

    let introAt = now + (reduced ? -1e6 : 60);
    let drag: Drag | null = null;
    let hover: string | null = null;
    /** Zuletzt gezogenes Ende der Geraden (0 oder 180°): Griffe bleiben dort, wo man sie losgelassen hat. */
    let endH = 0;
    let endDG = 0;
    let endDH = 180;
    let selK: Id = 'a';
    let selD: AngleId = 'a1';
    let anim: Anim | null = null;
    // Aufgabe
    let known = new Map<AngleId, number>();
    let lastSteps: Step[] = [];
    let lastTarget: AngleId | null = null;
    let lastAt = 0;

    /* ---------------- Aufteilung ---------------- */
    interface Geo {
      W: number;
      H: number;
      wide: boolean;
      C: Rect;
      panel: Rect;
    }
    function computeGeo(): Geo {
      const W = surface.width;
      const H = surface.height;
      const wide = W >= 640 || W >= H * 1.3;
      if (wide) {
        const pw = Math.round(clamp(W * 0.31, 228, 330));
        return { W, H, wide, C: { x: 4, y: 4, w: W - pw - 18, h: H - 8 }, panel: { x: W - pw - 4, y: 4, w: pw, h: H - 8 } };
      }
      const ch = Math.round(Math.min(W * 1.02, H * 0.6));
      return { W, H, wide, C: { x: 2, y: 2, w: W - 4, h: ch }, panel: { x: 2, y: ch + 10, w: W - 4, h: H - ch - 12 } };
    }
    let geo: Geo = computeGeo();
    const small = () => !geo.wide || geo.W < 760;

    /* ---------------- Hilfen ---------------- */
    function measure(str: string, f: string): number {
      surface.g.font = f;
      return surface.g.measureText(str).width;
    }
    function wrap(str: string, maxW: number, f: string): string[] {
      const rows: string[] = [];
      let cur = '';
      for (const w of str.replace(/ ([=−+≠]) /g, ' $1 ').split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (measure(next, f) > maxW && cur) {
          rows.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) rows.push(cur);
      return rows;
    }
    const pol = (o: Pt, d: number, r: number): Pt => [o[0] + r * Math.cos(rad(d)), o[1] - r * Math.sin(rad(d))];
    const pointerDir = (o: Pt, px: number, py: number) => norm360((Math.atan2(-(py - o[1]), px - o[0]) * 180) / Math.PI);
    /** Abstand vom Punkt o in Richtung d bis zum (eingerückten) Rand von R. */
    function exitDist(o: Pt, d: number, R: Rect, inset: number): number {
      const c = Math.cos(rad(d));
      const s = -Math.sin(rad(d));
      let t = Infinity;
      if (c > 1e-9) t = Math.min(t, (R.x + R.w - inset - o[0]) / c);
      if (c < -1e-9) t = Math.min(t, (R.x + inset - o[0]) / c);
      if (s > 1e-9) t = Math.min(t, (R.y + R.h - inset - o[1]) / s);
      if (s < -1e-9) t = Math.min(t, (R.y + inset - o[1]) / s);
      return Math.max(0, t);
    }
    function halo(str: string, x: number, y: number, f: string, color: string, a = 1, align: CanvasTextAlign = 'center'): void {
      const g = surface.g;
      if (a <= 0.01) return;
      g.save();
      g.globalAlpha *= a;
      g.font = f;
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      g.lineWidth = 5;
      g.strokeStyle = alpha(ctx.theme.bg, 0.92);
      g.strokeText(str, x, y);
      g.fillStyle = color;
      g.fillText(str, x, y);
      g.restore();
    }
    function pill(label: string, x: number, y: number, fill: string, color: string, size: number, a = 1, scale = 1): void {
      const g = surface.g;
      if (a <= 0.01) return;
      const f = font(800, size);
      const w = measure(label, f) + size * 1.3;
      const h = size * 1.9;
      g.save();
      g.globalAlpha *= a;
      g.translate(x, y);
      g.scale(scale, scale);
      g.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.22)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      g.fillStyle = fill;
      roundRect(g, -w / 2, -h / 2, w, h, h / 2);
      g.fill();
      g.shadowColor = 'transparent';
      text(g, label, 0, 0.5, { font: f, color });
      g.restore();
    }
    /** Hinweis-Etikett unten in der Szene, auf die Breite eingepasst. */
    function scenePill(label: string, color: string, a: number, scale = 1): void {
      const C = geo.C;
      let size = small() ? 12.5 : 14;
      while (size > 10.5 && measure(label, font(800, size)) + size * 1.3 > C.w - 24) size -= 0.5;
      pill(label, C.x + C.w / 2, C.y + C.h - (small() ? 22 : 28), color, onColor(), size, a, scale);
    }

    /* ---------------- Farben ---------------- */
    const cA = () => ctx.theme.series[0]!;
    const cB = () => ctx.theme.series[3]!;
    const cA2 = () => ctx.theme.series[5]!;
    const cB2 = () => ctx.theme.series[4]!;
    const cWarn = () => ctx.theme.series[1]!;
    const cOk = () => ctx.theme.series[2]!;

    /** Weich überblendete Farben je Winkel (gleich große Winkel bekommen dieselbe Farbe). */
    const colorState = new Map<string, { from: string; to: string; t0: number }>();
    function smoothColor(key: string, target: string): string {
      const st = colorState.get(key);
      if (!st) {
        colorState.set(key, { from: target, to: target, t0: 0 });
        return target;
      }
      const u = reduced ? 1 : clamp((now - st.t0) / 450, 0, 1);
      const cur = u >= 1 ? st.to : mixColor(st.from, st.to, ease.inOutCubic(u));
      if (st.to !== target) {
        st.from = cur;
        st.to = target;
        st.t0 = now;
        return cur;
      }
      return cur;
    }
    const colorsBusy = () => !reduced && [...colorState.values()].some((s) => now - s.t0 < 450);

    /** Zielfarbe nach der Größe: α₁-Größe blau, ihr Nebenwinkel orange, andere Größen türkis/lila. */
    function targetColor(value: number, w: number): string {
      if (value === w) return cA();
      if (value === 180 - w) return w === 90 ? cA() : cB();
      if (value <= 90) return cA2();
      return cB2();
    }

    /* ---------------- Geometrie ---------------- */
    function arcR(value: number, base: number): number {
      return base * (value < 40 ? 1 + ((40 - value) / 40) * 0.75 : 1);
    }
    /** Die vier Winkelfelder einer Kreuzung: Gerade mit Richtung θ, zweite Gerade unter dem Winkel w dazu. */
    function sectors(V: Pt, theta: number, w: number, ids: [Id, Id, Id, Id], base: number, colorW: number): Sector[] {
      const wi = Math.round(w);
      const vals = [wi, 180 - wi, wi, 180 - wi];
      const froms = [theta, theta + w, theta + 180, theta + 180 + w];
      const sweeps = [w, 180 - w, w, 180 - w];
      return ids.map((id, i) => ({
        id,
        V,
        from: froms[i]!,
        sweep: sweeps[i]!,
        value: vals[i]!,
        r: arcR(sweeps[i]!, base),
        color: smoothColor(`${mode()}:${id}`, targetColor(vals[i]!, colorW)),
      }));
    }

    interface Scene {
      lines: { o: Pt; d: number; name: string }[];
      secs: Sector[];
      S1: Pt;
      S2: Pt;
      M: Pt;
      dG: number;
      dH: number;
      sig: number;
      base: number;
      handles: { id: string; at: Pt; color: string }[];
    }

    function kreuzScene(): Scene {
      const C = geo.C;
      const S: Pt = [C.x + C.w / 2, C.y + C.h / 2 - (small() ? 8 : 14)];
      const m = Math.min(C.w, C.h);
      const base = clamp(m * 0.15, 30, 74);
      const a = gA.at(now);
      const w = gW.at(now);
      const secs = sectors(S, a, w, ['a', 'b', 'c', 'd'], base, Math.round(w));
      const hr = Math.min(m * 0.42, exitDist(S, a, C, 0) - 44);
      const hh = Math.min(m * 0.42, exitDist(S, a + w + endH, C, 0) - 44);
      return {
        lines: [
          { o: S, d: a, name: 'g' },
          { o: S, d: a + w, name: 'h' },
        ],
        secs,
        S1: S,
        S2: S,
        M: S,
        dG: a,
        dH: a + w,
        sig: 0,
        base,
        handles: [
          { id: 'kg', at: pol(S, a, hr), color: ctx.theme.text },
          { id: 'kh', at: pol(S, a + w + endH, hh), color: ctx.theme.text },
        ],
      };
    }

    function doppelScene(): Scene {
      const C = geo.C;
      const M: Pt = [C.x + C.w / 2, C.y + C.h / 2 - (small() ? 6 : 12)];
      const sig = gS.at(now);
      const w = gG.at(now);
      const v = gH.at(now);
      const sn = Math.max(0.35, Math.sin(rad(sig)));
      const cs = Math.max(0.01, Math.abs(Math.cos(rad(sig))));
      const d = Math.min((C.h * 0.25) / sn, (C.w * 0.3) / cs);
      const S1 = pol(M, sig + 180, d);
      const S2 = pol(M, sig, d);
      const m = Math.min(C.w, C.h);
      const base = clamp(m * 0.1, 24, 50);
      const dG = sig - w;
      const dH = sig - v;
      const wi = Math.round(w);
      const secs = [
        ...sectors(S1, dG, w, ['a1', 'b1', 'c1', 'd1'], base, wi),
        ...sectors(S2, dH, v, ['a2', 'b2', 'c2', 'd2'], base, wi),
      ];
      const handles: Scene['handles'] = [];
      if (mode() === 'doppel') {
        handles.push({ id: 'dg', at: pol(S1, dG + endDG, Math.min(d * 1.25, exitDist(S1, dG + endDG, C, 26))), color: ctx.theme.text });
        handles.push({ id: 'dh', at: pol(S2, dH + endDH, Math.min(d * 1.25, exitDist(S2, dH + endDH, C, 26))), color: ctx.theme.text });
        handles.push({ id: 'ds', at: pol(M, sig, Math.min(d * 1.6, exitDist(M, sig, C, 0) - 50)), color: ctx.theme.text });
      }
      return {
        lines: [
          { o: S1, d: dG, name: 'g' },
          { o: S2, d: dH, name: 'h' },
          { o: M, d: sig, name: 's' },
        ],
        secs,
        S1,
        S2,
        M,
        dG,
        dH,
        sig,
        base,
        handles,
      };
    }

    let scene: Scene = kreuzScene();

    /* ---------------- Zeichnen: Szene ---------------- */
    function drawPaper(R: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      g.save();
      g.shadowColor = th.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 16;
      g.shadowOffsetY = 4;
      g.fillStyle = th.bg;
      roundRect(g, R.x + 2, R.y + 2, R.w - 4, R.h - 4, 14);
      g.fill();
      g.restore();
      g.save();
      roundRect(g, R.x + 2, R.y + 2, R.w - 4, R.h - 4, 14);
      g.clip();
      const grad = g.createRadialGradient(R.x + R.w / 2, R.y + R.h / 2, 10, R.x + R.w / 2, R.y + R.h / 2, Math.max(R.w, R.h) * 0.7);
      grad.addColorStop(0, alpha(th.series[0]!, th.dark ? 0.05 : 0.025));
      grad.addColorStop(1, alpha(th.series[0]!, 0));
      g.fillStyle = grad;
      g.fillRect(R.x, R.y, R.w, R.h);
      const k = clamp(Math.min(R.w, R.h) / 22, 14, 26);
      const cx = R.x + R.w / 2;
      const cy = R.y + R.h / 2;
      g.lineWidth = 1;
      g.strokeStyle = th.gridMinor;
      g.beginPath();
      for (let x = cx - Math.ceil((cx - R.x) / k) * k; x <= R.x + R.w; x += k) {
        g.moveTo(Math.round(x) + 0.5, R.y);
        g.lineTo(Math.round(x) + 0.5, R.y + R.h);
      }
      for (let y = cy - Math.ceil((cy - R.y) / k) * k; y <= R.y + R.h; y += k) {
        g.moveTo(R.x, Math.round(y) + 0.5);
        g.lineTo(R.x + R.w, Math.round(y) + 0.5);
      }
      g.stroke();
      g.restore();
      g.strokeStyle = th.dark ? '#2a3445' : '#d5dce6';
      g.lineWidth = 1;
      roundRect(g, R.x + 2.5, R.y + 2.5, R.w - 5, R.h - 5, 14);
      g.stroke();
    }

    function clipScene(): void {
      const C = geo.C;
      roundRect(surface.g, C.x + 3, C.y + 3, C.w - 6, C.h - 6, 13);
      surface.g.clip();
    }

    /** Gerade durch o in Richtung d, beim Einstieg von o aus wachsend (f = 0 … 1). */
    function drawLine(o: Pt, d: number, f: number, color: string, width = 3.2, a = 1): void {
      const g = surface.g;
      if (f <= 0) return;
      const len = (geo.C.w + geo.C.h) * f;
      const p0 = pol(o, d + 180, len);
      const p1 = pol(o, d, len);
      g.save();
      g.globalAlpha *= a;
      g.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 5;
      g.shadowOffsetY = 1.5;
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(p0[0], p0[1]);
      g.lineTo(p1[0], p1[1]);
      g.stroke();
      g.restore();
    }

    function sectorPath(V: Pt, from: number, sweep: number, r: number): void {
      const g = surface.g;
      g.beginPath();
      g.moveTo(V[0], V[1]);
      g.arc(V[0], V[1], r, -rad(from), -rad(from + sweep), true);
      g.closePath();
    }

    /** Winkelfeld mit Bogen; beim Einstieg wächst der Bogen (u = 0 … 1). */
    function drawSector(s: Sector, u: number, a: number, strong: boolean, glow = 0): void {
      const g = surface.g;
      const th = ctx.theme;
      if (u <= 0 || a <= 0.01) return;
      const sweep = s.sweep * u;
      const r = s.r * (strong ? 1.06 : 1);
      g.save();
      g.globalAlpha *= a;
      if (glow > 0) {
        g.shadowColor = alpha(s.color, 0.8 * glow);
        g.shadowBlur = 16 * glow;
      }
      sectorPath(s.V, s.from, sweep, r);
      const grad = g.createRadialGradient(s.V[0], s.V[1], 0, s.V[0], s.V[1], r);
      const base = strong ? (th.dark ? 0.42 : 0.3) : th.dark ? 0.26 : 0.17;
      grad.addColorStop(0, alpha(s.color, base * 0.55));
      grad.addColorStop(1, alpha(s.color, base));
      g.fillStyle = grad;
      g.fill();
      g.shadowColor = 'transparent';
      g.beginPath();
      g.arc(s.V[0], s.V[1], r, -rad(s.from), -rad(s.from + sweep), true);
      g.strokeStyle = s.color;
      g.lineWidth = strong ? 3.2 : 2.4;
      g.lineCap = 'round';
      g.stroke();
      // Rechter Winkel: Punkt im Winkelfeld
      if (s.value === 90 && u >= 1) {
        const [dx, dy] = pol(s.V, s.from + 45, r * 0.3);
        g.beginPath();
        g.arc(dx, dy, 3, 0, Math.PI * 2);
        g.fillStyle = s.color;
        g.fill();
      }
      g.restore();
    }

    /** Beschriftung eines Winkels: Buchstabe im Winkelfeld, Größe außerhalb des Bogens. */
    function drawSectorLabel(s: Sector, a: number, valueText: string | null, scale = 1, color = s.color, boxed = false): void {
      if (a <= 0.01) return;
      const sm = small();
      const mid = s.from + s.sweep / 2;
      const half = rad(Math.max(0.5, s.sweep / 2));
      const name = angleName(s.id);
      const lf = mfont(sm ? 15 : 17);
      const vf = font(800, sm ? 12 : 13.5);
      const maxR = Math.min(geo.C.w, geo.C.h) * 0.42;
      const nameW = measure(name, lf);
      const inside = Math.max(s.value === 90 ? s.r * 0.74 : s.r * 0.6, (nameW / 2 + 3) / Math.sin(half));
      const g = surface.g;
      const at = (r: number) => pol(s.V, mid, r);
      g.save();
      if (scale !== 1) {
        const [cx, cy] = at(s.r);
        g.translate(cx, cy);
        g.scale(scale, scale);
        g.translate(-cx, -cy);
      }
      if (inside <= s.r * 0.88) {
        const [x, y] = at(inside);
        halo(name, x, y, lf, color, a);
        if (valueText) {
          const vw = measure(valueText, vf) + (boxed ? 14 : 0);
          const r2 = clamp(Math.max(s.r + 6 + vw * 0.45, (vw / 2 + 4) / Math.sin(half)), s.r + 12, maxR);
          const [vx, vy] = at(r2);
          if (boxed) pill(valueText, vx, vy, color, onColor(), sm ? 12 : 13.5, a);
          else halo(valueText, vx, vy, vf, color, a);
        }
      } else {
        // kleines Winkelfeld: alles außerhalb des Bogens
        const label = valueText ? `${name} ${valueText}` : name;
        const f = valueText ? vf : lf;
        const lw = measure(label, f);
        const r2 = s.sweep < 24 ? s.r + 14 + lw * 0.5 : clamp(Math.max(s.r + 8 + lw * 0.5, (lw / 2 + 4) / Math.sin(half)), s.r + 12, maxR);
        let [x, y] = at(r2);
        if (s.sweep < 24) {
          // sehr kleiner Winkel: neben das schmale Winkelfeld rücken
          const [ox, oy] = pol([0, 0], mid + 90, r2 * Math.sin(half) + 12);
          x += ox;
          y += oy;
        }
        if (valueText) {
          const nf = mfont(sm ? 14 : 15.5);
          const w1 = measure(name, nf);
          const w2 = measure(` ${valueText}`, vf);
          halo(name, x - (w1 + w2) / 2, y, nf, color, a, 'left');
          halo(` ${valueText}`, x - (w1 + w2) / 2 + w1, y + 0.5, vf, color, a, 'left');
        } else halo(label, x, y, f, color, a);
      }
      g.restore();
    }

    function drawLineName(o: Pt, d: number, name: string, a: number, side = 1): void {
      const C = geo.C;
      const t = exitDist(o, d, C, 18);
      const [x, y] = pol(o, d, Math.max(0, t - 6));
      const n = d + 90 * side;
      const [nx, ny] = [Math.cos(rad(n)) * 13, -Math.sin(rad(n)) * 13];
      halo(name, clamp(x + nx, C.x + 14, C.x + C.w - 14), clamp(y + ny, C.y + 14, C.y + C.h - 14), mfont(small() ? 18 : 21), ctx.theme.text, a);
    }

    /** Pfeilmarkierung für parallele Geraden. */
    function drawChevron(o: Pt, d: number, at: number, a: number): void {
      if (a <= 0.01) return;
      const g = surface.g;
      const s = small() ? 7 : 8.5;
      g.save();
      g.globalAlpha *= a;
      g.strokeStyle = ctx.theme.text;
      g.lineWidth = 2.6;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      for (const off of [0, s * 0.9]) {
        const t = pol(o, d, at - off);
        const l = pol(t, d + 150, s);
        const r = pol(t, d - 150, s);
        g.beginPath();
        g.moveTo(l[0], l[1]);
        g.lineTo(t[0], t[1]);
        g.lineTo(r[0], r[1]);
        g.stroke();
      }
      g.restore();
    }

    function drawHandle(h: Scene['handles'][number], a: number): void {
      if (a <= 0.01 || ctx.locked) return;
      const g = surface.g;
      const th = ctx.theme;
      const on = hover === h.id || drag?.kind === h.id;
      const [x, y] = h.at;
      g.save();
      g.globalAlpha *= a;
      g.beginPath();
      g.arc(x, y, on ? 17 : 14, 0, Math.PI * 2);
      g.fillStyle = alpha(th.series[0]!, on ? 0.24 : 0.13);
      g.fill();
      g.shadowColor = th.dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.25)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 2;
      g.beginPath();
      g.arc(x, y, on ? 8.5 : 7.5, 0, Math.PI * 2);
      g.fillStyle = th.dark ? '#e8eef7' : '#ffffff';
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = th.series[0]!;
      g.lineWidth = 2.6;
      g.stroke();
      g.beginPath();
      g.arc(x, y, 2.4, 0, Math.PI * 2);
      g.fillStyle = th.series[0]!;
      g.fill();
      g.restore();
    }

    function drawVertex(V: Pt, a: number): void {
      const g = surface.g;
      g.save();
      g.globalAlpha *= a;
      g.beginPath();
      g.arc(V[0], V[1], 4.6, 0, Math.PI * 2);
      g.fillStyle = ctx.theme.text;
      g.fill();
      g.strokeStyle = ctx.theme.bg;
      g.lineWidth = 1.5;
      g.stroke();
      g.restore();
    }

    const animMs = (k: Anim['kind']) => (k === 'supp' ? 2400 : k === 'vert' ? 1500 : 1700);
    const animT = (an: Anim) => prog(an.t0, animMs(an.kind));

    /* ---------- einfache Kreuzung ---------- */
    function drawKreuz(): void {
      const sc = scene;
      const th = ctx.theme;
      const lineF = ease.outCubic(prog(introAt, 700));
      const g = surface.g;
      g.save();
      clipScene();
      const an = anim && (anim.kind === 'vert' || anim.kind === 'supp') ? anim : null;
      // Winkelfelder
      sc.secs.forEach((s, i) => {
        const u = ease.outCubic(prog(introAt + 380 + i * 110, 520));
        let off = 0;
        let strong = s.id === selK;
        let glow = 0;
        if (an && (s.id === an.x || s.id === an.y)) {
          const t = animT(an);
          strong = true;
          if (an.kind === 'supp') {
            const bump = t < 0.25 ? ease.outCubic(t / 0.25) : t < 0.42 ? 1 : t < 0.6 ? 1 - ease.inOutCubic((t - 0.42) / 0.18) : 0;
            off = bump * (small() ? 18 : 26);
          } else if (s.id === an.y) glow = t >= 1 ? Math.max(0, 1 - prog(an.t0 + animMs(an.kind), 900)) : 0;
        }
        if (off > 0) {
          const [dx, dy] = pol([0, 0], s.from + s.sweep / 2, off);
          g.save();
          g.translate(dx, dy);
          drawSector(s, u, 1, strong, glow);
          g.restore();
        } else drawSector(s, u, 1, strong, glow);
      });
      // Gestreckter Winkel beim Zusammenlegen
      if (an && an.kind === 'supp') {
        const t = animT(an);
        const sx = sc.secs.find((s) => s.id === an.x)!;
        const u = ease.inOutCubic(clamp((t - 0.6) / 0.3, 0, 1));
        if (u > 0) {
          const r = Math.max(sc.secs.find((s) => s.id === an.y)!.r, sx.r) + 9;
          const col = th.series[2]!;
          g.save();
          g.strokeStyle = col;
          g.lineWidth = 4;
          g.lineCap = 'round';
          g.beginPath();
          g.arc(sx.V[0], sx.V[1], r, -rad(sx.from), -rad(sx.from + 180 * u), true);
          g.stroke();
          // der gestreckte Winkel liegt auf einer Geraden
          const p0 = pol(sx.V, sx.from, r + 26);
          const p1 = pol(sx.V, sx.from + 180, (r + 26) * u);
          g.globalAlpha = 0.85;
          g.lineWidth = 6;
          g.strokeStyle = alpha(col, 0.55);
          g.beginPath();
          g.moveTo(p0[0], p0[1]);
          g.lineTo(sx.V[0], sx.V[1]);
          g.lineTo(p1[0], p1[1]);
          g.stroke();
          g.restore();
        }
      }
      for (const l of sc.lines) drawLine(l.o, l.d, lineF, th.text);
      // Drehender Scheitelwinkel
      if (an && an.kind === 'vert') {
        const t = animT(an);
        const sx = sc.secs.find((s) => s.id === an.x)!;
        const k = ease.inOutCubic(t);
        drawGhostSector(sx, sx.V, 180 * k, Math.min(1, t * 4) * (t >= 1 ? Math.max(0, 1 - prog(an.t0 + animMs(an.kind), 700)) : 1));
      }
      drawVertex(sc.S1, lineF);
      const labA = ease.outCubic(prog(introAt + 700, 500));
      {
        const hd = sc.dH + endH;
        const dlt = ((((hd - sc.dG) % 360) + 540) % 360) - 180;
        const gs = Math.abs(dlt) < 90 ? (dlt > 0 ? -1 : 1) : -1;
        drawLineName(sc.S1, sc.dG, 'g', labA, gs);
        drawLineName(sc.S1, hd, 'h', labA, -gs);
      }
      sc.secs.forEach((s, i) => {
        const a = ease.outCubic(prog(introAt + 650 + i * 110, 420));
        const v = gW.at(now);
        const val = s.id === 'a' || s.id === 'c' ? v : 180 - v;
        drawSectorLabel(s, a, p.vals || s.id === 'a' ? deg(Math.round(val)) : '?', 1, p.vals || s.id === 'a' ? s.color : ctx.theme.muted);
      });
      for (const h of sc.handles) drawHandle(h, labA);
      g.restore();
      // Etiketten nach den Aktionen
      if (an) {
        const t = animT(an);
        const sx = sc.secs.find((s) => s.id === an.x)!;
        const sy = sc.secs.find((s) => s.id === an.y)!;
        const pa = an.kind === 'supp' ? clamp((t - 0.8) / 0.2, 0, 1) : clamp((t - 0.85) / 0.15, 0, 1);
        if (pa > 0) {
          const lab =
            an.kind === 'supp'
              ? `${angleName(sx.id)} + ${angleName(sy.id)} = ${deg(sx.value)} + ${deg(sy.value)} = 180°`
              : `${angleName(sx.id)} = ${angleName(sy.id)} = ${deg(sx.value)}`;
          scenePill(lab, an.kind === 'supp' ? th.series[2]! : sx.color, ease.outCubic(pa), 0.85 + 0.15 * ease.outBack(pa));
        }
      }
    }

    /** Kopie eines Winkelfelds, um den Punkt V gedreht. */
    function drawGhostSector(s: Sector, V: Pt, rot: number, a: number): void {
      if (a <= 0.01) return;
      const g = surface.g;
      const th = ctx.theme;
      g.save();
      g.globalAlpha *= a;
      g.shadowColor = th.dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,24,40,0.25)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 4;
      sectorPath(V, s.from + rot, s.sweep, s.r * 1.08);
      g.fillStyle = alpha(s.color, th.dark ? 0.55 : 0.42);
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = s.color;
      g.lineWidth = 3;
      g.stroke();
      g.restore();
    }

    /* ---------- Doppelkreuzung ---------- */
    /** Ohne „Alle Winkelgrößen zeigen“ gegeben: α₁, bei g ∦ h zusätzlich α₂ (eigener Regler). */
    const isGivenD = (id: AngleId) => id === 'a1' || (id === 'a2' && !p.par);
    /** Die beiden hervorgehobenen Winkel (ausgewählter Winkel und sein Partner). */
    function pairD(): [AngleId, AngleId] {
      const rel = p.rel as Rel3;
      return [selD, partner(selD, rel)];
    }

    /** Figur (F, Z, E) als breites, weiches Band entlang der beteiligten Halbgeraden. */
    function drawFigure(x: Sector, y: Sector, color: string, a: number): void {
      if (a <= 0.01) return;
      const g = surface.g;
      const sc = scene;
      const L = Math.max(sc.base * 3.2, 70);
      // Halbgerade der Geraden (g bzw. h) und Teil von s je Winkel
      const lineRay = (s: Sector) => {
        const isA = s.id[0] === 'a' || s.id[0] === 'd';
        const dl = s.id[1] === '1' ? sc.dG : sc.dH;
        return isA ? dl : dl + 180;
      };
      const up = (s: Sector) => s.id[0] === 'a' || s.id[0] === 'b';
      const ext = L * 0.75;
      const ends: Pt[] = [];
      // s-Stück: von S₁ (ggf. darunter verlängert) bis S₂ (ggf. darüber verlängert)
      const usesBelow1 = [x, y].some((s) => s.id[1] === '1' && !up(s));
      const usesAbove2 = [x, y].some((s) => s.id[1] === '2' && up(s));
      const sFrom = usesBelow1 ? pol(sc.S1, sc.sig + 180, ext) : sc.S1;
      const sTo = usesAbove2 ? pol(sc.S2, sc.sig, ext) : sc.S2;
      ends.push(sFrom, sTo);
      g.save();
      g.globalAlpha *= a;
      g.strokeStyle = alpha(color, ctx.theme.dark ? 0.32 : 0.22);
      g.lineWidth = small() ? 11 : 14;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.beginPath();
      g.moveTo(sFrom[0], sFrom[1]);
      g.lineTo(sTo[0], sTo[1]);
      for (const s of [x, y]) {
        const e = pol(s.V, lineRay(s), L);
        g.moveTo(s.V[0], s.V[1]);
        g.lineTo(e[0], e[1]);
      }
      g.stroke();
      g.restore();
    }

    /** Kopie der Kreuzung an g bzw. h (Gerade, Stück von s, Winkelfelder) für Verschieben/Drehen. */
    function drawGhostCrossing(src: 1 | 2, V: Pt, rot: number, a: number, mark: AngleId): void {
      if (a <= 0.01) return;
      const g = surface.g;
      const th = ctx.theme;
      const sc = scene;
      const dl = src === 1 ? sc.dG : sc.dH;
      const L = Math.max(sc.base * 3.4, 80);
      g.save();
      g.globalAlpha *= a;
      // Linienstücke
      g.strokeStyle = alpha(th.text, 0.6);
      g.lineWidth = 2.6;
      g.lineCap = 'round';
      g.setLineDash([9, 6]);
      for (const d0 of [dl + rot, sc.sig + rot]) {
        const p0 = pol(V, d0, L);
        const p1 = pol(V, d0 + 180, L);
        g.beginPath();
        g.moveTo(p0[0], p0[1]);
        g.lineTo(p1[0], p1[1]);
        g.stroke();
      }
      g.setLineDash([]);
      for (const s of sc.secs) {
        if (s.id[1] !== String(src)) continue;
        if (s.id === mark) {
          g.save();
          g.shadowColor = th.dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,24,40,0.25)';
          g.shadowBlur = 12;
          g.shadowOffsetY = 4;
          sectorPath(V, s.from + rot, s.sweep, s.r * 1.08);
          g.fillStyle = alpha(s.color, th.dark ? 0.55 : 0.42);
          g.fill();
          g.restore();
          sectorPath(V, s.from + rot, s.sweep, s.r * 1.08);
          g.strokeStyle = s.color;
          g.lineWidth = 3;
          g.stroke();
        } else {
          g.beginPath();
          g.arc(V[0], V[1], s.r, -rad(s.from + rot), -rad(s.from + rot + s.sweep), true);
          g.strokeStyle = alpha(s.color, 0.5);
          g.lineWidth = 1.8;
          g.stroke();
        }
      }
      g.beginPath();
      g.arc(V[0], V[1], 4, 0, Math.PI * 2);
      g.fillStyle = alpha(th.text, 0.7);
      g.fill();
      g.restore();
    }

    function drawDoppel(): void {
      const sc = scene;
      const th = ctx.theme;
      const g = surface.g;
      const isTask = mode() === 'aufgabe';
      const lineF = ease.outCubic(prog(introAt, 750));
      const [px, py] = pairD();
      const an = anim && (anim.kind === 'shift' || anim.kind === 'turn') ? anim : null;
      const parA = gPar.at(now);
      g.save();
      clipScene();
      // Figur
      if (!isTask) {
        const sx = sc.secs.find((s) => s.id === px)!;
        const sy = sc.secs.find((s) => s.id === py)!;
        drawFigure(sx, sy, sx.color, ease.outCubic(prog(introAt + 900, 600)));
      } else if (lastSteps.length && lastTarget) {
        const fa = ease.outCubic(prog(lastAt, 500));
        for (const st of lastSteps) {
          if (st.rel === 'scheitel' || st.rel === 'neben') continue;
          const sx = sc.secs.find((s) => s.id === st.from)!;
          const sy = sc.secs.find((s) => s.id === st.to)!;
          drawFigure(sx, sy, sy.color, fa);
        }
      }
      // Winkelfelder
      sc.secs.forEach((s, i) => {
        const u = ease.outCubic(prog(introAt + 420 + i * 85, 520));
        let a = 1;
        let strong = false;
        if (!isTask) {
          const inPair = s.id === px || s.id === py;
          a = inPair ? 1 : 0.42;
          strong = inPair;
        } else {
          const id = s.id as AngleId;
          strong = id === p.gi || id === lastTarget || lastSteps.some((st) => st.from === id || st.to === id);
          const kt = known.get(id);
          const shown = id === p.gi || (kt !== undefined && now >= kt);
          a = shown ? 1 : 0.6;
          // Unbekannte Winkel grau: die Farbe würde sonst die Lösung verraten
          drawSector({ ...s, color: smoothColor(`rev:${id}`, shown ? s.color : th.muted) }, u, a, strong && shown);
          return;
        }
        drawSector(s, u, a, strong);
      });
      // Zielmarkierung nach dem Verschieben/Drehen: Unterschied bei nicht parallelen Geraden
      for (const l of sc.lines) drawLine(l.o, l.d, lineF, th.text, l.name === 's' ? 3 : 3.2);
      // Nicht parallel: Schnittpunkt von g und h, falls er im Bild liegt
      const X = intersect([sc.S1[0], -sc.S1[1]], sc.dG, [sc.S2[0], -sc.S2[1]], sc.dH);
      if (X && (1 - parA) > 0.01) {
        const C = geo.C;
        const [xx, xy] = [X[0], -X[1]];
        if (xx > C.x + 12 && xx < C.x + C.w - 12 && xy > C.y + 12 && xy < C.y + C.h - 12) {
          g.save();
          g.globalAlpha = (1 - parA) * lineF;
          g.beginPath();
          g.arc(xx, xy, 6, 0, Math.PI * 2);
          g.fillStyle = th.bg;
          g.fill();
          g.strokeStyle = cWarn();
          g.lineWidth = 2.6;
          g.stroke();
          g.restore();
        }
      }
      // Pfeile für parallele Geraden
      const chevA = parA * ease.outCubic(prog(introAt + 900, 500));
      if (chevA > 0.01) {
        const t1 = Math.min(exitDist(sc.S1, sc.dG, geo.C, 20) * 0.62, Math.hypot(sc.S2[0] - sc.S1[0], sc.S2[1] - sc.S1[1]) * 1.25);
        drawChevron(sc.S1, sc.dG, t1, chevA);
        drawChevron(sc.S2, sc.dH, t1, chevA);
      }
      // Animation: Kopie der Kreuzung wandert
      if (an) {
        const t = animT(an);
        const k = ease.inOutCubic(t);
        const src = an.x[1] === '1' ? 1 : 2;
        const A = src === 1 ? sc.S1 : sc.S2;
        const B = src === 1 ? sc.S2 : sc.S1;
        const fade = t >= 1 ? 1 : Math.min(1, t * 5);
        if (an.kind === 'shift') {
          const V: Pt = [A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k];
          drawGhostCrossing(src, V, 0, fade, an.x as AngleId);
        } else {
          const ang = 180 * k;
          const rx = A[0] - sc.M[0];
          const ry = A[1] - sc.M[1];
          const c = Math.cos(rad(ang));
          const s = Math.sin(rad(ang));
          // Drehung im mathematischen Sinn (Bildschirm-y zeigt nach unten)
          const V: Pt = [sc.M[0] + rx * c + ry * s, sc.M[1] - rx * s + ry * c];
          drawGhostCrossing(src, V, ang, fade, an.x as AngleId);
          // Drehpunkt
          g.save();
          g.globalAlpha = fade;
          g.strokeStyle = th.series[4]!;
          g.lineWidth = 2;
          g.beginPath();
          g.arc(sc.M[0], sc.M[1], 6, 0, Math.PI * 2);
          g.stroke();
          g.beginPath();
          g.arc(sc.M[0], sc.M[1], 2, 0, Math.PI * 2);
          g.fillStyle = th.series[4]!;
          g.fill();
          g.restore();
        }
        // Unterschied zur echten Geraden, wenn nicht parallel
        if (t >= 1 && !isParallel(Math.round(gG.at(now)), Math.round(gH.at(now)))) {
          const da = prog(an.t0 + animMs(an.kind), 500);
          const from = src === 1 ? sc.dG : sc.dH;
          const to = src === 1 ? sc.dH : sc.dG;
          const r = sc.base * 2.6;
          const right = an.x[0] === 'a' || an.x[0] === 'd';
          const off = an.kind === 'turn' ? (right ? 180 : 0) : right ? 0 : 180;
          const lo = Math.min(from, to) + off;
          const diff = Math.abs(from - to);
          g.save();
          g.globalAlpha = ease.outCubic(da);
          sectorPath(B, lo, diff, r);
          g.fillStyle = alpha(cWarn(), 0.28);
          g.fill();
          g.beginPath();
          g.arc(B[0], B[1], r, -rad(lo), -rad(lo + diff), true);
          g.strokeStyle = cWarn();
          g.lineWidth = 3;
          g.stroke();
          g.restore();
          const [lx, ly] = pol(B, lo + diff / 2, r + 20);
          halo(deg(Math.round(diff)), lx, ly, font(800, small() ? 12.5 : 14), cWarn(), ease.outCubic(da));
        }
      }
      drawVertex(sc.S1, lineF);
      drawVertex(sc.S2, lineF);
      const labA = ease.outCubic(prog(introAt + 760, 500));
      for (const l of sc.lines) drawLineName(l.o, l.name === 'g' ? l.d + endDG : l.name === 'h' ? l.d + endDH : l.d, l.name, labA);
      sc.secs.forEach((s, i) => {
        const a0 = ease.outCubic(prog(introAt + 760 + i * 70, 420));
        const id = s.id as AngleId;
        if (isTask) {
          const isGiven = id === p.gi;
          const kt = known.get(id);
          const shown = isGiven || (kt !== undefined && now >= kt);
          const pop = kt !== undefined && !isGiven ? 0.6 + 0.4 * ease.outBack(prog(kt, 450)) : 1;
          drawSectorLabel(s, a0, shown ? deg(s.value) : '?', shown ? pop : 1, smoothColor(`rev:${id}`, shown ? s.color : th.muted), isGiven);
          return;
        }
        const dim = s.id === px || s.id === py ? 1 : 0.6;
        const raw = s.id[1] === '1' ? gG.at(now) : gH.at(now);
        const val = s.id[0] === 'a' || s.id[0] === 'c' ? raw : 180 - raw;
        const shownD = p.vals || isGivenD(id);
        drawSectorLabel(s, a0 * dim, shownD ? deg(Math.round(val)) : '?', 1, shownD ? s.color : th.muted);
      });
      for (const h of sc.handles) drawHandle(h, labA);
      g.restore();
      // Hinweis nach der Aktion
      if (an) {
        const t = animT(an);
        const pa = clamp((t - 0.88) / 0.12, 0, 1);
        if (pa > 0) {
          const vals = doubleAngles(Math.round(gG.at(now)), Math.round(gH.at(now)));
          const par = isParallel(vals.a1, vals.a2);
          const x = an.x as AngleId;
          const y = an.y as AngleId;
          const rel = relation(x, y)!;
          let lab: string;
          let col: string;
          if (!par) {
            lab = isSupplementary(rel)
              ? tt(`Nicht parallel: ${angleName(x)} + ${angleName(y)} = ${vals[x] + vals[y]}° ≠ 180°`, `Not parallel: ${angleName(x)} + ${angleName(y)} = ${vals[x] + vals[y]}° ≠ 180°`)
              : tt(`Nicht parallel: ${angleName(x)} = ${vals[x]}° ≠ ${angleName(y)} = ${vals[y]}°`, `Not parallel: ${angleName(x)} = ${vals[x]}° ≠ ${angleName(y)} = ${vals[y]}°`);
            col = cWarn();
          } else if (isSupplementary(rel)) {
            lab = `${angleName(x)} + ${angleName(y)} = ${vals[x]}° + ${vals[y]}° = 180°`;
            col = cOk();
          } else {
            lab = `${angleName(x)} = ${angleName(y)} = ${vals[x]}°`;
            col = sc.secs.find((s) => s.id === x)!.color;
          }
          scenePill(lab, col, ease.outCubic(pa), 0.85 + 0.15 * ease.outBack(pa));
        }
      }
    }

    /* ---------------- Seitenleiste ---------------- */
    interface Seg {
      t: string;
      c?: string;
      w?: number;
    }
    type Item =
      | { kind: 'title'; text: string; color?: string }
      | { kind: 'rich'; segs: Seg[]; size: number; a?: number }
      | { kind: 'big'; segs: Seg[]; size: number; pop?: number }
      | { kind: 'note'; text: string; color?: string; weight?: number }
      | { kind: 'chips'; chips: { id: string; label: string; active: boolean; color: string }[] }
      | { kind: 'gap'; h: number };
    interface CardSpec {
      items: Item[];
      accent?: string;
      tint?: number;
    }
    interface Hit {
      id: string;
      x: number;
      y: number;
      w: number;
      h: number;
    }
    let hits: Hit[] = [];
    const noteSize = () => (small() ? 11.5 : 12.5);

    function segWidth(segs: Seg[], size: number, weight: number): number {
      return segs.reduce((s, x) => s + measure(x.t, font(x.w ?? weight, size)), 0);
    }
    function drawSegs(segs: Seg[], x: number, y: number, size: number, weight: number, maxW: number): void {
      let s = size;
      const w0 = segWidth(segs, s, weight);
      if (w0 > maxW) s = Math.max(10.5, (s * maxW) / w0);
      let cx = x;
      for (const sg of segs) {
        const f = font(sg.w ?? weight, s);
        text(surface.g, sg.t, cx, y, { font: f, color: sg.c ?? ctx.theme.text, align: 'left' });
        cx += measure(sg.t, f);
      }
    }
    function chipRows(chips: { id: string; label: string; active: boolean; color: string }[], w: number) {
      const f = font(750, small() ? 11.5 : 12);
      const rows: { id: string; label: string; active: boolean; color: string; x: number; w: number }[][] = [[]];
      let x = 0;
      for (const c of chips) {
        const cw = measure(c.label, f) + 18;
        if (x + cw > w && rows[rows.length - 1]!.length) {
          rows.push([]);
          x = 0;
        }
        rows[rows.length - 1]!.push({ ...c, x, w: cw });
        x += cw + 6;
      }
      return rows;
    }
    function itemHeight(it: Item, w: number): number {
      switch (it.kind) {
        case 'title':
          return 21;
        case 'rich':
          return it.size * 1.55;
        case 'big':
          return it.size * 1.45;
        case 'note':
          return wrap(it.text, w, font(it.weight ?? 600, noteSize())).length * noteSize() * 1.38 + 4;
        case 'chips':
          return chipRows(it.chips, w).length * 30 + 4;
        case 'gap':
          return it.h;
      }
    }
    function drawItem(it: Item, x: number, y: number, w: number): number {
      const g = surface.g;
      const th = ctx.theme;
      const h = itemHeight(it, w);
      switch (it.kind) {
        case 'title':
          text(g, it.text, x, y + 9, { font: font(750, small() ? 11 : 12), color: it.color ?? th.muted, align: 'left' });
          break;
        case 'rich': {
          const a = it.a ?? 1;
          if (a <= 0.01) break;
          g.save();
          g.globalAlpha *= a;
          drawSegs(it.segs, x, y + h / 2, it.size, 650, w);
          g.restore();
          break;
        }
        case 'big': {
          g.save();
          const k = it.pop ?? 1;
          g.translate(x, y + h / 2);
          g.scale(k, k);
          drawSegs(it.segs, 0, 0, it.size, 800, w / k);
          g.restore();
          break;
        }
        case 'note': {
          const f = font(it.weight ?? 600, noteSize());
          wrap(it.text, w, f).forEach((row, i) => text(g, row, x, y + noteSize() * 0.75 + i * noteSize() * 1.38, { font: f, color: it.color ?? th.muted, align: 'left' }));
          break;
        }
        case 'chips': {
          const f = font(750, small() ? 11.5 : 12);
          chipRows(it.chips, w).forEach((row, ri) => {
            for (const c of row) {
              const cy = y + ri * 30 + 2;
              const hot = hover === c.id;
              roundRect(g, x + c.x, cy, c.w, 25, 12.5);
              g.fillStyle = c.active ? alpha(c.color, th.dark ? 0.34 : 0.16) : hot ? alpha(th.text, 0.08) : alpha(th.text, th.dark ? 0.05 : 0.035);
              g.fill();
              g.strokeStyle = c.active ? c.color : alpha(th.text, hot ? 0.35 : 0.15);
              g.lineWidth = c.active ? 1.6 : 1;
              g.stroke();
              text(g, c.label, x + c.x + c.w / 2, cy + 13, { font: f, color: c.active ? c.color : th.text });
              if (!ctx.locked) hits.push({ id: c.id, x: x + c.x, y: cy, w: c.w, h: 25 });
            }
          });
          break;
        }
        case 'gap':
          break;
      }
      return h;
    }
    function card(r: Rect, accent?: string, tint = 0): void {
      const g = surface.g;
      const th = ctx.theme;
      g.save();
      g.shadowColor = th.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 18;
      g.shadowOffsetY = 4;
      roundRect(g, r.x, r.y, r.w, r.h, 14);
      const grad = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      grad.addColorStop(0, th.dark ? shade(th.bg, 0.075) : '#ffffff');
      grad.addColorStop(1, th.dark ? shade(th.bg, 0.035) : shade(th.bg, -0.018));
      g.fillStyle = grad;
      g.fill();
      g.shadowColor = 'transparent';
      if (accent && tint > 0) {
        g.fillStyle = alpha(accent, th.dark ? tint * 1.6 : tint);
        g.fill();
      }
      g.strokeStyle = accent ? alpha(accent, 0.45) : alpha(th.text, th.dark ? 0.1 : 0.07);
      g.lineWidth = 1;
      g.stroke();
      g.restore();
    }
    const cardPad = () => (small() ? 10 : 14);
    function cardHeight(c: CardSpec, inner: number): number {
      return c.items.reduce((s, it) => s + itemHeight(it, inner), 0) + cardPad() + 8;
    }
    function drawCards(R: Rect, cards: CardSpec[]): void {
      const pad = cardPad();
      const gap = small() ? 8 : 10;
      const inner = R.w - 2 * pad;
      const heights = cards.map((c) => cardHeight(c, inner));
      // Mindesthöhe: Titel und erster Eintrag
      const minH = (c: CardSpec) => pad + 8 + c.items.slice(0, 2).reduce((s, it) => s + itemHeight(it, inner), 0);
      let y = R.y;
      for (let i = 0; i < cards.length; i++) {
        const c = cards[i]!;
        const rest = R.y + R.h - y;
        if (rest < minH(c)) break;
        let h = heights[i]!;
        const next = cards[i + 1];
        const last = !next || rest - h - gap < minH(next);
        if (h > rest || last) h = rest;
        card({ x: R.x, y, w: R.w, h }, c.accent, c.tint ?? 0);
        let yy = y + pad - 2;
        for (const it of c.items) {
          if (yy + itemHeight(it, inner) > y + h + 2) break;
          yy += drawItem(it, R.x + pad, yy, inner);
        }
        if (last) break;
        y += h + gap;
      }
    }

    const sz = () => (small() ? 13 : 14.5);
    const bigSz = () => (small() ? 19 : 23);

    function kreuzCards(): CardSpec[] {
      const w = Math.round(gW.at(now));
      const b = 180 - w;
      const A = cA();
      const B = w === 90 ? cA() : cB();
      const sv = (id: Id) => (id === 'a' || id === 'c' ? w : b);
      const col = (id: Id) => (id === 'a' || id === 'c' ? A : B);
      const nb = (id: Id): [Id, Id] => {
        const o: Id[] = ['a', 'b', 'c', 'd'];
        const i = o.indexOf(id);
        return [o[(i + 1) % 4]!, o[(i + 3) % 4]!];
      };
      const opp = (id: Id): Id => (['a', 'b', 'c', 'd'] as Id[])[(['a', 'b', 'c', 'd'].indexOf(id) + 2) % 4]!;
      const s = selK;
      const [n1, n2] = nb(s);
      const hv = !p.vals;
      const right = w === 90 && !hv;
      const chipF = font(750, small() ? 11.5 : 12);
      const short = (['a', 'b', 'c', 'd'] as Id[]).reduce((acc, id) => acc + measure(`${angleName(id)} = ${deg(sv(id))}`, chipF) + 24, 0) > geo.panel.w - 2 * cardPad();
      const c1: CardSpec = {
        accent: A,
        tint: 0.04,
        items: [
          { kind: 'title', text: tt('Winkel am Schnittpunkt', 'Angles at the intersection') },
          ...(hv
            ? ([
                { kind: 'big', size: bigSz(), segs: [{ t: `α = ${deg(w)}`, c: A }] },
                { kind: 'big', size: bigSz(), segs: [{ t: 'β, γ, δ = ?', c: ctx.theme.muted }] },
                { kind: 'rich', size: sz() - 1.5, segs: [{ t: tt('α + β + γ + δ = 360°', 'α + β + γ + δ = 360°'), c: ctx.theme.muted, w: 600 }] },
              ] as Item[])
            : ([
                { kind: 'big', size: bigSz(), segs: [{ t: 'α = γ = ', c: A }, { t: deg(w), c: A }] },
                { kind: 'big', size: bigSz(), segs: [{ t: 'β = δ = ', c: B }, { t: deg(b), c: B }] },
                { kind: 'rich', size: sz() - 1.5, segs: [{ t: `${deg(w)} + ${deg(b)} + ${deg(w)} + ${deg(b)} = 360°`, c: ctx.theme.muted, w: 600 }] },
              ] as Item[])),
        ],
      };
      if (right) c1.items.push({ kind: 'note', text: tt('Die Geraden stehen senkrecht aufeinander: g ⊥ h, alle vier Winkel sind rechte Winkel.', 'The lines are perpendicular: g ⊥ h, all four angles are right angles.'), color: A, weight: 700 });
      const c2: CardSpec = {
        items: [
          { kind: 'title', text: tt('Winkel antippen', 'Tap an angle') },
          {
            kind: 'chips',
            chips: (['a', 'b', 'c', 'd'] as Id[]).map((id) => ({ id: `k:${id}`, label: short ? angleName(id) : `${angleName(id)} = ${hv && id !== 'a' ? '?' : deg(sv(id))}`, active: id === s, color: col(id) })),
          },
          { kind: 'gap', h: 4 },
          { kind: 'rich', size: sz(), segs: [{ t: tt('Scheitelwinkel: ', 'Vertical angles: '), w: 700 }, { t: `${angleName(s)} = ${angleName(opp(s))}`, c: col(s), w: 800 }] },
          { kind: 'rich', size: sz(), segs: [{ t: tt('Nebenwinkel: ', 'Adjacent angles: '), w: 700 }, { t: `${angleName(s)} + ${angleName(n1)} = 180°`, c: ctx.theme.series[2]!, w: 800 }] },
          ...(hv
            ? ([{ kind: 'note', text: tt('Berechne die fehlenden Winkel – „Alle Winkelgrößen zeigen“ verrät die Lösung.', 'Work out the missing angles – “Show all angle sizes” reveals the solution.') }] as Item[])
            : ([
                { kind: 'rich', size: sz() - 1, segs: [{ t: `${angleName(n1)} = 180° − ${deg(sv(s))} = ${deg(sv(n1))}`, c: col(n1), w: 650 }] },
                { kind: 'rich', size: sz() - 1, segs: [{ t: tt(`ebenso ${angleName(n2)} = ${deg(sv(n2))}`, `likewise ${angleName(n2)} = ${deg(sv(n2))}`), c: ctx.theme.muted, w: 600 }] },
              ] as Item[])),
        ],
      };
      const c3: CardSpec = {
        items: [
          { kind: 'title', text: tt('Merke', 'Remember') },
          { kind: 'note', text: tt('Scheitelwinkel liegen sich am Schnittpunkt gegenüber und sind gleich groß.', 'Vertical angles lie opposite each other and are equal.'), color: ctx.theme.text },
          { kind: 'note', text: tt('Nebenwinkel liegen nebeneinander an einer Geraden und ergänzen sich zu 180°.', 'Adjacent angles lie side by side on a line and add up to 180°.'), color: ctx.theme.text },
        ],
      };
      return [c1, c2, c3];
    }

    const REL_NAME: Record<Relation, { de: string; en: string }> = {
      scheitel: L('Scheitelwinkel', 'vertical angles'),
      neben: L('Nebenwinkel', 'adjacent angles'),
      stufen: L('Stufenwinkel', 'corresponding angles'),
      wechsel: L('Wechselwinkel', 'alternate angles'),
      nachbar: L('Nachbarwinkel', 'co-interior angles'),
    };
    const relName = (r: Relation) => REL_NAME[r][ctx.lang];

    function doppelCards(): CardSpec[] {
      const th = ctx.theme;
      const w = Math.round(gG.at(now));
      const v = Math.round(gH.at(now));
      const vals = doubleAngles(w, v);
      const par = isParallel(w, v);
      const colOf = (id: AngleId) => scene.secs.find((s) => s.id === id)?.color ?? th.text;
      const rel = p.rel as Rel3;
      const hv = !p.vals;
      const [x, y] = pairD();
      const row = (k: '1' | '2', name: string): Item => ({
        kind: 'rich',
        size: sz(),
        segs: [
          { t: `${name}:  `, c: th.muted, w: 700 },
          ...(hv
            ? k === '1'
              ? [{ t: `α₁ = ${vals.a1}°`, c: colOf('a1'), w: 800 }, { t: tt('   übrige: ?', '   others: ?'), c: th.muted, w: 700 }]
              : isGivenD('a2')
                ? [{ t: `α₂ = ${vals.a2}°`, c: colOf('a2'), w: 800 }, { t: tt('   übrige: ?', '   others: ?'), c: th.muted, w: 700 }]
                : [{ t: '?', c: th.muted, w: 800 }]
            : [
                { t: `α${SUB[k]} = γ${SUB[k]} = ${vals[`a${k}` as AngleId]}°`, c: colOf(`a${k}` as AngleId), w: 800 },
                { t: '   ' },
                { t: `β${SUB[k]} = δ${SUB[k]} = ${vals[`b${k}` as AngleId]}°`, c: colOf(`b${k}` as AngleId), w: 800 },
              ]),
        ],
      });
      // Ohne Werte bei g ∦ h ist „parallel?“ gerade die Frage: kein Urteil vorwegnehmen
      const open = hv && !p.par;
      const status: Item = open
        ? { kind: 'rich', size: sz() - 0.5, segs: [{ t: tt('g ∥ h ?', 'g ∥ h ?'), c: th.muted, w: 800 }] }
        : par
        ? { kind: 'rich', size: sz() - 0.5, segs: [{ t: tt('g ∥ h  ✓  parallel', 'g ∥ h  ✓  parallel'), c: cOk(), w: 800 }] }
        : { kind: 'rich', size: sz() - 0.5, segs: [{ t: tt(`g ∦ h: Unterschied ${Math.abs(w - v)}°`, `g ∦ h: difference ${Math.abs(w - v)}°`), c: cWarn(), w: 800 }] };
      const c1: CardSpec = { items: [{ kind: 'title', text: tt('Winkel an g und h', 'Angles at g and h') }, row('1', 'g'), row('2', 'h'), status] };
      const supp = rel === 'nachbar';
      const eq: Item = open
        ? { kind: 'big', size: bigSz() - 2, segs: [{ t: supp ? `${angleName(x)} + ${angleName(y)} = ?` : `${angleName(x)} = ${angleName(y)} ?`, c: th.muted }] }
        : hv
        ? { kind: 'big', size: bigSz() - 2, segs: [{ t: supp ? `${angleName(x)} + ${angleName(y)} = ${par ? '180°' : '?'}` : `${angleName(x)} ${par ? '=' : '≠'} ${angleName(y)}`, c: par ? colOf(x) : cWarn() }] }
        : supp
        ? { kind: 'big', size: bigSz() - 2, segs: [{ t: `${angleName(x)} + ${angleName(y)} = `, c: colOf(x) }, { t: `${vals[x] + vals[y]}°`, c: par ? cOk() : cWarn() }] }
        : par
          ? { kind: 'big', size: bigSz(), segs: [{ t: `${angleName(x)} = ${angleName(y)} = ${vals[x]}°`, c: colOf(x) }] }
          : { kind: 'big', size: bigSz() - 2, segs: [{ t: `${angleName(x)} = ${vals[x]}°`, c: colOf(x) }, { t: '  ≠  ', c: cWarn() }, { t: `${angleName(y)} = ${vals[y]}°`, c: colOf(y) }] };
      const fig = { stufen: 'F', wechsel: 'Z', nachbar: 'E' }[rel];
      const rule = {
        stufen: tt('Stufenwinkel liegen an beiden Kreuzungen an der gleichen Stelle (F-Figur).', 'Corresponding angles are in the same position at both crossings (F shape).'),
        wechsel: tt('Wechselwinkel liegen auf verschiedenen Seiten von s, beide zwischen g und h oder beide außen (Z-Figur).', 'Alternate angles lie on opposite sides of s, both between g and h or both outside (Z shape).'),
        nachbar: tt('Nachbarwinkel liegen auf derselben Seite von s, beide zwischen g und h oder beide außen (E-Figur).', 'Co-interior angles lie on the same side of s, both between g and h or both outside (C shape).'),
      }[rel];
      const c2: CardSpec = {
        accent: open ? th.series[0]! : par ? colOf(x) : cWarn(),
        tint: 0.04,
        items: [
          { kind: 'title', text: tt(`${relName(rel)} (${fig}-Figur)`, `${relName(rel)} (${fig} shape)`) },
          {
            kind: 'chips',
            chips: (['stufen', 'wechsel', 'nachbar'] as Rel3[]).map((r) => ({ id: `r:${r}`, label: tt(`${{ stufen: 'F', wechsel: 'Z', nachbar: 'E' }[r]}-Figur`, `${{ stufen: 'F', wechsel: 'Z', nachbar: 'C' }[r]} shape`), active: r === rel, color: th.series[0]! })),
          },
          eq,
          {
            kind: 'note',
            text: open
              ? tt('Vergleiche die gegebenen Winkel: Sind g und h parallel?', 'Compare the given angles: are g and h parallel?')
              : par
              ? supp
                ? tt('An parallelen Geraden ergänzen sich Nachbarwinkel zu 180°.', 'At parallel lines co-interior angles add up to 180°.')
                : tt(`An parallelen Geraden sind ${relName(rel)} gleich groß.`, `At parallel lines ${relName(rel)} are equal.`)
              : tt('Nur bei parallelen Geraden gleich – hier sind g und h nicht parallel.', 'Only equal for parallel lines – here g and h are not parallel.'),
            color: par || open ? th.muted : cWarn(),
            weight: par || open ? 600 : 700,
          },
        ],
      };
      const c3: CardSpec = {
        items: [
          { kind: 'title', text: tt('Lage', 'Position') },
          { kind: 'note', text: rule, color: th.text },
          { kind: 'note', text: tt('Tippe im Bild einen Winkel an, um ein anderes Paar zu sehen.', 'Tap an angle in the picture to see another pair.') },
        ],
      };
      return [c1, c2, c3];
    }

    function stepText(st: Step, vals: Record<AngleId, number>): string {
      const rn = relName(st.rel);
      if (isSupplementary(st.rel)) return `${angleName(st.to)} = 180° − ${angleName(st.from)} = ${vals[st.to]}°  (${rn})`;
      return `${angleName(st.to)} = ${angleName(st.from)} = ${vals[st.to]}°  (${rn})`;
    }

    function aufgabeCards(): CardSpec[] {
      const th = ctx.theme;
      const w = alphaFromGiven(p.gi as AngleId, p.gv);
      const vals = doubleAngles(w, w);
      const gi = p.gi as AngleId;
      const done = [...known.entries()].filter(([, t]) => now >= t).length;
      const all = done >= 7;
      const c1: CardSpec = {
        accent: th.series[0]!,
        tint: 0.04,
        items: [
          { kind: 'title', text: tt('Aufgabe', 'Exercise') },
          { kind: 'rich', size: sz(), segs: [{ t: tt('g ∥ h. Gegeben: ', 'g ∥ h. Given: '), w: 650 }, { t: `${angleName(gi)} = ${p.gv}°`, c: scene.secs.find((s) => s.id === gi)?.color ?? th.text, w: 800 }] },
          { kind: 'note', text: tt('Bestimme alle anderen Winkel. Tippe einen Winkel mit „?“ an – die Begründung erscheint hier.', 'Find all the other angles. Tap an angle marked “?” – the reason appears here.'), color: th.text },
          { kind: 'rich', size: sz() - 1, segs: [{ t: tt(`${done} von 7 Winkeln bestimmt`, `${done} of 7 angles found`), c: all ? cOk() : th.muted, w: 750 }] },
        ],
      };
      const items: Item[] = [{ kind: 'title', text: tt('Begründung', 'Reason') }];
      if (lastTarget && lastSteps.length) {
        const a = ease.outCubic(prog(lastAt, 400));
        lastSteps.forEach((st, i) => items.push({ kind: 'rich', size: sz() - 0.5, a: clamp(a * 2 - i * 0.6, 0, 1), segs: [{ t: stepText(st, vals), c: scene.secs.find((s) => s.id === st.to)?.color ?? th.text, w: 750 }] }));
      } else items.push({ kind: 'note', text: tt('Noch kein Winkel angetippt.', 'No angle tapped yet.') });
      if (all) items.push({ kind: 'rich', size: sz(), segs: [{ t: tt('Alle Winkel bestimmt!  ✓', 'All angles found!  ✓'), c: cOk(), w: 800 }] });
      const c2: CardSpec = { items };
      const c3: CardSpec = {
        items: [
          { kind: 'title', text: tt('Werkzeuge', 'Tools') },
          { kind: 'note', text: tt('Scheitelwinkel gleich · Nebenwinkel 180° · an Parallelen: Stufenwinkel und Wechselwinkel gleich, Nachbarwinkel 180°.', 'Vertical angles equal · adjacent angles 180° · at parallels: corresponding and alternate angles equal, co-interior angles 180°.'), color: th.text },
        ],
      };
      return [c1, c2, c3];
    }

    /* ---------------- Ergebnisse ---------------- */
    function updateReadouts(): void {
      const m = mode();
      if (m === 'kreuz') {
        const w = p.w;
        ctx.readout('given', null);
        ctx.readout('prog', null);
        ctx.readout('angles', `α = γ = ${deg(w)}, β = δ = ${deg(180 - w)}`);
        ctx.readout('pair', tt(`Nebenwinkel: α + β = ${deg(w)} + ${deg(180 - w)} = 180°; Scheitelwinkel: α = γ`, `Adjacent: α + β = ${deg(w)} + ${deg(180 - w)} = 180°; vertical: α = γ`));
        return;
      }
      const w = effG();
      const v = effH();
      const vals = doubleAngles(w, v);
      const table = (show: (id: AngleId) => boolean) =>
        `<table class="mini-table"><tr><th></th><th>α</th><th>β</th><th>γ</th><th>δ</th></tr>` +
        (['1', '2'] as const)
          .map((k) => `<tr><td>${k === '1' ? 'g' : 'h'}</td>${(['a', 'b', 'c', 'd'] as const).map((l) => `<td>${show(`${l}${k}` as AngleId) ? deg(vals[`${l}${k}` as AngleId]) : '?'}</td>`).join('')}</tr>`)
          .join('') +
        `</table>`;
      if (m === 'doppel') {
        ctx.readout('given', null);
        ctx.readout('prog', null);
        ctx.readout('angles', { html: table(() => true) });
        const [x, y] = pairD();
        const rel = relation(x, y)!;
        const par = isParallel(w, v);
        const rn = relName(rel);
        const eqs = isSupplementary(rel) ? `${angleName(x)} + ${angleName(y)} = ${vals[x] + vals[y]}°` : par ? `${angleName(x)} = ${angleName(y)} = ${vals[x]}°` : `${angleName(x)} = ${vals[x]}° ≠ ${angleName(y)} = ${vals[y]}°`;
        ctx.readout('pair', `${rn[0]!.toUpperCase()}${rn.slice(1)}: ${eqs}${par ? '' : tt(' (g ∦ h)', ' (g ∦ h)')}`);
        return;
      }
      const gi = p.gi as AngleId;
      ctx.readout('given', tt(`g ∥ h, ${angleName(gi)} = ${p.gv}°`, `g ∥ h, ${angleName(gi)} = ${p.gv}°`));
      ctx.readout('angles', { html: table((id) => id === gi || known.has(id)) });
      ctx.readout('pair', lastTarget && lastSteps.length ? lastSteps.map((st) => stepText(st, vals)).join('; ') : null);
      ctx.readout('prog', tt(`${known.size} von 7 Winkeln aufgedeckt`, `${known.size} of 7 angles revealed`));
    }

    /* ---------------- Zeiger ---------------- */
    function sectorAt(px: number, py: number): Id | null {
      let best: Id | null = null;
      let bestD = Infinity;
      for (const s of scene.secs) {
        const d = Math.hypot(px - s.V[0], py - s.V[1]);
        if (d < 5 || d > Math.max(s.r * 1.9, 46)) continue;
        const dirP = pointerDir(s.V, px, py);
        const rel = norm360(dirP - s.from);
        if (rel <= s.sweep && d < bestD) {
          best = s.id;
          bestD = d;
        }
      }
      return best;
    }

    function hitAt(px: number, py: number): string | null {
      for (let i = hits.length - 1; i >= 0; i--) {
        const h = hits[i]!;
        if (px >= h.x && px <= h.x + h.w && py >= h.y && py <= h.y + h.h) return h.id;
      }
      const C = geo.C;
      if (px < C.x || px > C.x + C.w || py < C.y || py > C.y + C.h) return null;
      if (!ctx.locked) {
        for (const h of scene.handles) if (Math.hypot(px - h.at[0], py - h.at[1]) < 20) return h.id;
      }
      const sid = sectorAt(px, py);
      if (sid) {
        if (mode() === 'aufgabe') return sid === p.gi ? null : `t:${sid}`;
        return `${mode() === 'kreuz' ? 'k' : 'd'}:${sid}`;
      }
      return null;
    }

    const MIN_W = 1;
    const MAX_W = 179;
    /** Winkel nach dem Ziehen: an 0°/180° nicht umspringen, sondern am Rand stehen bleiben. */
    function edgeSafe(raw: number, prev: number): number {
      const r = Math.round(raw);
      if (r < MIN_W || r > MAX_W) return prev > 90 ? MAX_W : MIN_W;
      return r;
    }

    function dragTo(px: number, py: number): void {
      if (!drag || ctx.locked) return;
      const sc = scene;
      if (drag.kind === 'kg') {
        const phi = pointerDir(sc.S1, px, py);
        const hd = p.a + p.w;
        const na = Math.round(phi) % 360;
        const nw = edgeSafe(norm180(hd - na), p.w);
        // g so legen, dass h liegen bleibt – auf der Seite, an der gezogen wird
        let aa = norm360(Math.round(hd - nw));
        const dd = norm360(aa - na);
        if (dd > 90 && dd < 270) aa = norm360(aa + 180);
        ctx.set({ a: aa % 360, w: nw });
      } else if (drag.kind === 'kh') {
        const raw = norm360(pointerDir(sc.S1, px, py) - p.a);
        endH = raw >= 180 ? 180 : 0;
        ctx.set({ w: edgeSafe(raw % 180, p.w) });
      } else if (drag.kind === 'dg') {
        const phi = pointerDir(sc.S1, px, py);
        const raw = norm180(p.s - phi);
        endDG = norm360(phi - (p.s - raw)) > 90 && norm360(phi - (p.s - raw)) < 270 ? 180 : 0;
        ctx.set({ g: edgeSafe(raw, p.g) });
      } else if (drag.kind === 'dh') {
        const phi = pointerDir(sc.S2, px, py);
        const raw = norm180(p.s - phi);
        endDH = norm360(phi - (p.s - raw)) > 90 && norm360(phi - (p.s - raw)) < 270 ? 180 : 0;
        const nh = edgeSafe(raw, p.par ? p.g : p.h);
        ctx.set(p.par ? { par: false, h: nh } : { h: nh });
      } else if (drag.kind === 'ds') {
        let phi = pointerDir(sc.M, px, py);
        if (phi > 180) phi -= 180;
        const ns = clamp(Math.round(phi), 25, 155);
        const ds = ns - p.s;
        if (ds === 0) return;
        ctx.set({ s: ns, g: clamp(p.g + ds, MIN_W, MAX_W), h: clamp(p.h + ds, MIN_W, MAX_W) });
      }
    }

    function tap(id: string): void {
      if (id.startsWith('k:')) {
        selK = id.slice(2) as Id;
        anim = null;
      } else if (id.startsWith('d:')) {
        const nid = id.slice(2) as AngleId;
        selD = nid;
        anim = null;
      } else if (id.startsWith('r:')) {
        if (!ctx.locked) ctx.set({ rel: id.slice(2) as Rel3 });
      } else if (id.startsWith('t:')) {
        reveal(id.slice(2) as AngleId);
      }
      updateReadouts();
      ctx.requestRender();
    }

    /** Tastatur wie Antippen: Winkel wählen (Aufgabe: gesuchten Winkel aufdecken). */
    function updateKeyTargets(): void {
      const m = mode();
      const de = ctx.lang === 'de';
      ctx.setKeyTargets(
        scene.secs
          .filter((sc) => !(m === 'aufgabe' && sc.id === p.gi))
          .map((sc) => {
            const id = m === 'aufgabe' ? `t:${sc.id}` : `${m === 'kreuz' ? 'k' : 'd'}:${sc.id}`;
            const r = Math.max(sc.r, 18);
            const label = m === 'aufgabe' ? (de ? `Winkel ${angleName(sc.id)} bestimmen` : `Find angle ${angleName(sc.id)}`) : `${de ? 'Winkel' : 'Angle'} ${angleName(sc.id)}`;
            return { id, label, rect: { x: sc.V[0] - r, y: sc.V[1] - r, w: 2 * r, h: 2 * r }, activate: () => tap(id) };
          }),
      );
    }

    function reveal(id: AngleId): void {
      const gi = p.gi as AngleId;
      if (id === gi) return;
      const knownIds = [...known.keys()];
      lastSteps = explain(gi, id, knownIds);
      lastTarget = id;
      lastAt = performance.now();
      if (!known.has(id)) known.set(id, lastAt);
    }

    surface.addTarget({
      contains: (px: number, py: number) => drag !== null || hitAt(px, py) !== null,
      pointerDown: (q: { px: number; py: number }) => {
        const id = hitAt(q.px, q.py);
        if (!id) return false;
        if (id === 'kg' || id === 'kh' || id === 'dg' || id === 'dh' || id === 'ds') {
          drag = { kind: id };
          anim = null;
          surface.setCursor('grabbing');
          ctx.requestRender();
          return true;
        }
        tap(id);
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (!drag) return;
        dragTo(q.px, q.py);
        ctx.requestRender();
      },
      pointerUp: () => {
        if (!drag) return;
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
        if (drag) return;
        surface.setCursor(!id ? '' : id.length === 2 && !id.includes(':') ? 'grab' : 'pointer');
      },
      wheel: () => false,
    });

    /* ---------------- Ablauf ---------------- */
    function syncGlides(source: string): void {
      const ms = drag ? 0 : source === 'replace' ? 900 : 600;
      const go = (gl: Glide, v: number) => (ms === 0 ? gl.snap(v) : gl.go(v, ms));
      if (ms === 0) gA.snap(p.a);
      else gA.goAngle(p.a, ms);
      go(gW, p.w);
      go(gS, effS());
      go(gG, effG());
      go(gH, effH());
      gPar.go(isParallel(effG(), effH()) ? 1 : 0, 450);
    }

    function startAnim(kind: Anim['kind']): void {
      if (mode() === 'kreuz') {
        const o: Id[] = ['a', 'b', 'c', 'd'];
        const i = o.indexOf(selK);
        anim = { kind, x: selK, y: kind === 'vert' ? o[(i + 2) % 4]! : o[(i + 1) % 4]!, t0: performance.now() };
      } else {
        const [x, y] = pairD();
        anim = { kind, x, y, t0: performance.now() };
      }
    }

    function resetTask(): void {
      known = new Map();
      lastSteps = [];
      lastTarget = null;
    }

    let shownMode = mode();
    updateReadouts();

    return {
      update(changed, source) {
        now = performance.now();
        if (changed.has('mode') && mode() !== shownMode) {
          shownMode = mode();
          anim = null;
          if (source !== 'init') {
            introAt = now + (reduced ? -1e6 : 40);
            const v = { a: p.a, w: p.w, s: effS(), g: effG(), h: effH() };
            gA.snap(v.a);
            gW.snap(v.w);
            gS.snap(v.s);
            gG.snap(v.g);
            gH.snap(v.h);
            gPar.snap(isParallel(v.g, v.h) ? 1 : 0);
          }
        }
        if (source === 'input' && changed.has('par') && !p.par && p.h === p.g) ctx.set({ h: clamp(p.g + 8, MIN_W, MAX_W) });
        if (['gi', 'gv', 'tg'].some((k) => changed.has(k)) || source === 'replace') resetTask();
        if (source !== 'init' && !drag && ['a', 'w', 'g', 'h', 's', 'par', 'rel', 'gi', 'gv', 'tg'].some((k) => changed.has(k))) anim = null;
        if (source !== 'init') syncGlides(source);
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        now = performance.now();
        if (id === 'supp' || id === 'vert' || id === 'shift' || id === 'turn') startAnim(id);
        else if (id === 'new') {
          const t = makeTask(Math.random, { given: p.gi as AngleId, value: p.gv, tilt: p.tg });
          ctx.set({ gi: t.given, gv: t.value, tg: t.tilt });
        } else if (id === 'all') {
          let i = 0;
          for (const a of ANGLE_IDS) {
            if (a === p.gi || known.has(a)) continue;
            known.set(a, now + (reduced ? 0 : i * 170));
            i++;
          }
          lastSteps = [];
          lastTarget = null;
        }
        updateReadouts();
        ctx.requestRender();
      },

      render() {
        now = performance.now();
        if (geo.W !== surface.width || geo.H !== surface.height) geo = computeGeo();
        hits = [];
        surface.begin();
        const m = mode();
        scene = m === 'kreuz' ? kreuzScene() : doppelScene();
        drawPaper(geo.C);
        if (m === 'kreuz') drawKreuz();
        else drawDoppel();
        const cards = m === 'kreuz' ? kreuzCards() : m === 'doppel' ? doppelCards() : aufgabeCards();
        const g = surface.g;
        g.save();
        g.globalAlpha = ease.outCubic(prog(introAt, 500));
        drawCards(geo.panel, cards);
        g.restore();
        updateKeyTargets();
        let busy = now < introAt + 1700 || gA.busy(now) || gW.busy(now) || gS.busy(now) || gG.busy(now) || gH.busy(now) || gPar.busy(now) || colorsBusy();
        if (anim && now < anim.t0 + animMs(anim.kind) + 1000) busy = true;
        if (m === 'aufgabe' && ([...known.values()].some((t) => now < t + 500) || now < lastAt + 800)) busy = true;
        if (busy) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
