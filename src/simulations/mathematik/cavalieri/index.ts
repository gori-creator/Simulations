import { convexHull2D, defineSimulation, ease, lightIntensity, mixColor, Plot, prefersReducedMotion, roundRect, Surface, Tween, vec3, View3D, type Rect, type Vec2, type Vec3 } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  areaAt,
  axisRange,
  baseExtent,
  bodyHeight,
  buildSlabs,
  isSquare,
  section,
  sphereParts,
  splitSlabs,
  stackVolumeFormula,
  volume,
  type BodyKind,
  type Dims,
  type Shear,
  type Slab,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Reglerwert für „unendlich viele Scheiben“ (glatter Körper). */
const N_INF = 50;
const nOf = (v: number) => (v >= N_INF ? Infinity : v);
/** Stücke, aus denen der glatte Körper gezeichnet wird. */
const SMOOTH = 56;

interface CardLine {
  f: string;
  swatch?: string;
  bold?: boolean;
  muted?: boolean;
}

/** Wert, der seinem Ziel weich (exponentiell) folgt – für Zahlen, Ebene, Kamera. */
class Follow {
  constructor(public v: number) {}
  /** Schritt um dt Sekunden; gibt zurück, ob noch Bewegung ist. */
  step(target: number, dt: number, tau: number): boolean {
    if (tau <= 0 || !Number.isFinite(this.v) || !Number.isFinite(target)) {
      this.v = target;
      return false;
    }
    this.v += (target - this.v) * (1 - Math.exp(-dt / tau));
    if (Math.abs(target - this.v) <= 1e-4 * (1 + Math.abs(target))) {
      this.v = target;
      return false;
    }
    return true;
  }
}

/** Übergang der Scheiben von einer alten zu einer neuen Form (Welle von unten nach oben). */
interface Morph {
  prev: [Slab[], Slab[]];
  prevH: number;
  t0: number;
  dur: number;
  /** Gesamte Verzögerung von der untersten bis zur obersten Scheibe (ms). */
  spread: number;
}

/**
 * Prinzip von Cavalieri: zwei Scheibenstapel (Münzen, Spielkarten) in 3D,
 * einer gerade, einer geschert oder gebogen; eine verschiebbare Schnittebene
 * zeigt in jeder Höhe gleich große Querschnitte. Dazu das Diagramm A(z) mit
 * den Scheiben als Balken und als Höhepunkt das Kugelvolumen (Halbkugel neben
 * Zylinder ohne Kegel).
 */
export default defineSimulation({
  id: 'cavalieri',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.52 },
  groups: [
    { id: 'shape', label: L('Zweiter Körper', 'Second solid') },
    { id: 'size', label: L('Maße in cm', 'Dimensions in cm') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'body',
      type: 'choice',
      label: L('Vergleich', 'Comparison'),
      options: [
        { value: 'zyl', label: L('Zylinder (Münzen)', 'Cylinder (coins)') },
        { value: 'prisma', label: L('Prisma (Spielkarten)', 'Prism (playing cards)') },
        { value: 'kegel', label: L('Kegel', 'Cone') },
        { value: 'pyr', label: L('Pyramide', 'Pyramid') },
        { value: 'kugel', label: L('Kugelvolumen', 'Volume of a sphere') },
      ],
      default: 'zyl',
    },
    {
      key: 'z',
      type: 'number',
      label: L('Höhe der Schnittebene z', 'Height of the cutting plane z'),
      help: L('Auch direkt am Griff der Ebene oder im Diagramm ziehen.', 'You can also drag the handle on the plane or in the chart.'),
      min: 0,
      max: 8,
      step: 0.1,
      default: 2,
      unit: 'cm',
    },
    {
      key: 'n',
      type: 'number',
      label: L('Anzahl der Scheiben n', 'Number of slices n'),
      help: L('Ganz rechts: unendlich viele, unendlich dünne Scheiben (glatter Körper).', 'Far right: infinitely many, infinitely thin slices (smooth solid).'),
      min: 2,
      max: N_INF,
      step: 1,
      default: 12,
      display: (v, lang) => (v >= N_INF ? (lang === 'de' ? '∞ (glatt)' : '∞ (smooth)') : String(v)),
    },
    {
      key: 's',
      type: 'number',
      group: 'shape',
      label: L('Verschiebung oben s', 'Shift at the top s'),
      help: L('Wie weit Deckfläche bzw. Spitze zur Seite rutscht (Griff oben ziehen).', 'How far the top face or apex slides sideways (drag the top handle).'),
      min: -4,
      max: 4,
      step: 0.25,
      default: 2,
      unit: 'cm',
      visibleIf: (v) => v.body !== 'kugel',
    },
    {
      key: 'k',
      type: 'number',
      group: 'shape',
      label: L('Biegung k', 'Bend k'),
      help: L('Ausbauchung in halber Höhe (mittleren Griff ziehen).', 'Bulge at half height (drag the middle handle).'),
      min: -3,
      max: 3,
      step: 0.25,
      default: 0,
      unit: 'cm',
      visibleIf: (v) => v.body !== 'kugel',
    },
    { key: 'r', type: 'number', group: 'size', label: L('Radius r', 'Radius r'), min: 1, max: 4, step: 0.5, default: 3, unit: 'cm', visibleIf: (v) => v.body === 'zyl' || v.body === 'kegel' || v.body === 'kugel' },
    { key: 'a', type: 'number', group: 'size', label: L('Grundkante a', 'Base edge a'), min: 1, max: 6, step: 0.5, default: 4, unit: 'cm', visibleIf: (v) => v.body === 'prisma' || v.body === 'pyr' },
    { key: 'h', type: 'number', group: 'size', label: L('Höhe h', 'Height h'), min: 2, max: 8, step: 0.5, default: 5, unit: 'cm', visibleIf: (v) => v.body !== 'kugel' },
    { key: 'calc', type: 'boolean', group: 'view', label: L('Werte im Bild', 'Values in the picture'), help: L('Zahlenwerte von Querschnitten und Volumen im Bild zeigen.', 'Show the values of cross-sections and volume in the picture.'), default: true },
    { key: 'cut', type: 'boolean', group: 'view', label: L('Schnitt aufklappen', 'Open the cut'), help: L('Hebt den Teil über der Ebene etwas an, damit man die Querschnitte sieht.', 'Lifts the part above the plane a little so the cross-sections can be seen.'), default: true },
  ],
  actions: [
    { id: 'sweep', label: L('Ebene durchfahren', 'Sweep the plane'), primary: true },
    { id: 'shape', label: L('Gerade stellen', 'Straighten'), visibleIf: (v) => v.body !== 'kugel' },
  ],
  readouts: [
    { key: 'A', label: L('Querschnitte in Höhe z', 'Cross-sections at height z'), spoiler: true },
    { key: 'V', label: L('Volumen', 'Volume'), spoiler: true },
    { key: 'stack', label: L('Scheibenstapel', 'Stack of slices'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Münzstapel: gerade und schief', 'Stack of coins: straight and oblique'), values: {} },
    { id: 'bent', label: L('Gebogener Münzstapel', 'Bent stack of coins'), values: { s: 1, k: 2.5, n: 20 } },
    { id: 'cards', label: L('Spielkarten: schiefes Prisma', 'Playing cards: oblique prism'), values: { body: 'prisma', s: 3, n: 24, z: 3 } },
    { id: 'cone', label: L('Kegel: Spitze verschieben', 'Cone: moving the apex'), values: { body: 'kegel', s: 3, n: N_INF } },
    { id: 'pyr', label: L('Schiefe Pyramide', 'Oblique pyramid'), values: { body: 'pyr', a: 5, h: 6, s: -3, n: 10, z: 2.5 } },
    { id: 'sphere', label: L('Kugelvolumen nach Cavalieri', 'Sphere volume by Cavalieri'), values: { body: 'kugel', n: 10, z: 1.5 } },
  ],
  strings: {
    de: {
      canvas: 'Drehbare 3D-Ansicht zweier Scheibenstapel (gerade und schief bzw. Halbkugel und Zylinder ohne Kegel) mit verschiebbarer Schnittebene, daneben die Querschnittsfläche in Abhängigkeit von der Höhe',
      zyl1: 'gerader Zylinder',
      zyl2: 'schiefer Zylinder',
      zyl3: 'gebogener Zylinder',
      prisma1: 'gerades Prisma',
      prisma2: 'schiefes Prisma',
      prisma3: 'gebogenes Prisma',
      kegel1: 'gerader Kegel',
      kegel2: 'schiefer Kegel',
      kegel3: 'gebogener Kegel',
      pyr1: 'gerade Pyramide',
      pyr2: 'schiefe Pyramide',
      pyr3: 'gebogene Pyramide',
      kugel1: 'Halbkugel',
      kugel2: 'Zylinder ohne Kegel',
      kugel2s: 'Restkörper',
      title: 'Schnitt in Höhe z = {z} cm',
      equal: 'A_1 = A_2 in jeder Höhe ⇒ V_1 = V_2',
      slices: '{n} Scheiben: V_{Stapel} ≈ {v} cm³',
      smooth: 'n → ∞: Stapel = Körper',
      chart: 'Querschnittsfläche A(z)',
      axisA: 'A in cm²',
      axisZ: 'z in cm',
      straighten: 'Gerade stellen',
      oblique: 'Schief stellen',
      sweep: 'Ebene durchfahren',
      bars: 'Balken = Scheiben',
    },
    en: {
      canvas: 'Rotatable 3D view of two stacks of slices (straight and oblique, or hemisphere and cylinder without cone) with a movable cutting plane, next to it the cross-sectional area as a function of height',
      zyl1: 'right cylinder',
      zyl2: 'oblique cylinder',
      zyl3: 'bent cylinder',
      prisma1: 'right prism',
      prisma2: 'oblique prism',
      prisma3: 'bent prism',
      kegel1: 'right cone',
      kegel2: 'oblique cone',
      kegel3: 'bent cone',
      pyr1: 'right pyramid',
      pyr2: 'oblique pyramid',
      pyr3: 'bent pyramid',
      kugel1: 'hemisphere',
      kugel2: 'cylinder without cone',
      kugel2s: 'remaining solid',
      title: 'Cut at height z = {z} cm',
      equal: 'A_1 = A_2 at every height ⇒ V_1 = V_2',
      slices: '{n} slices: V_{stack} ≈ {v} cm³',
      smooth: 'n → ∞: stack = solid',
      chart: 'Cross-sectional area A(z)',
      axisA: 'A in cm²',
      axisZ: 'z in cm',
      straighten: 'Straighten',
      oblique: 'Make oblique',
      sweep: 'Sweep the plane',
      bars: 'bars = slices',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (all, k: string) => (k in vars ? String(vars[k]) : all));
    const num = (v: number, d = 2) => fmt.num(v, d);
    const reduced = () => prefersReducedMotion();
    const th = () => ctx.theme;

    /* ---------- Aufteilung der Zeichenfläche ---------- */

    const narrow = () => surface.width < 640 && surface.height > surface.width * 0.9;
    function rects(): { scene: Rect; card: Rect; chart: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (narrow()) {
        const topH = Math.round(h * 0.48);
        const cardH = Math.round(h * 0.25);
        return {
          scene: { x: 0, y: 0, w, h: topH },
          card: { x: 4, y: topH + 4, w: w - 8, h: cardH },
          chart: { x: 4, y: topH + cardH + 12, w: w - 8, h: h - topH - cardH - 16 },
        };
      }
      const colW = Math.round(Math.min(310, Math.max(196, w * 0.3)));
      const x = w - colW;
      const chartH = Math.round(Math.min(h * 0.46, Math.max(150, h * 0.42)));
      return {
        scene: { x: 0, y: 0, w: x - 4, h },
        card: { x, y: 8, w: colW - 8, h: h - chartH - 24 },
        chart: { x, y: h - chartH - 8, w: colW - 8, h: chartH },
      };
    }
    const textSize = () => {
      const w = surface.width;
      return narrow() ? 12 : w < 700 ? 11.5 : w < 860 ? 12.5 : 13.5;
    };

    const view = new View3D(surface, { azimuth: 20, elevation: 20, elevationLimits: [6, 70], region: () => rects().scene });
    const plot = new Plot(surface, {
      x: [0, 1],
      y: [0, 1],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: () => chartPlotRect(),
      xAxis: { label: ctx.t('axisA') },
      yAxis: { label: ctx.t('axisZ') },
    });
    function chartPlotRect(): Rect {
      const c = rects().chart;
      return { x: c.x + 4, y: c.y + 30, w: c.w - 10, h: c.h - 36 };
    }

    /* ---------- Zustand ---------- */

    let kind = p.body as BodyKind;
    const dims = (): Dims => ({ r: p.r, a: p.a, h: p.h });
    const shear = (): Shear => (kind === 'kugel' ? { s: 0, k: 0 } : { s: p.s, k: p.k });
    let target: [Slab[], Slab[]] = [[], []];
    /** Höhe, für die `target` gebaut ist. */
    let targetH = 1;
    /** Querschnitte ausgeblendet (bis der Stapel aufgebaut ist). */
    let secHidden = false;
    let morph: Morph | null = null;
    /** Aufbau Scheibe für Scheibe (Einstieg, Wechsel des Vergleichs). */
    let build: { t0: number; per: number; dur: number } | null = null;
    /** Einblenden („Wachsen“) der Querschnitte. */
    const grow = new Tween(650, ease.outBack);
    /** Durchfahren der Ebene: Ziel­höhe in Abhängigkeit von der Zeit. */
    let sweep: { t0: number; from: number } | null = null;
    let lastHandle = -Infinity;
    let dragSlow = false;
    let lastTime = performance.now();

    // weich folgende Größen
    const zF = new Follow(p.z);
    const liftF = new Follow(0);
    const y2F = new Follow(0);
    const rF = new Follow(p.r);
    const aF = new Follow(p.a);
    const hF = new Follow(p.h);
    const nums = { A: new Follow(0), V: new Follow(0), S: new Follow(0), z: new Follow(p.z) };
    let frame: { target: Vec3; radius: number } | null = null;

    const H = () => bodyHeight(kind, dims());
    const dimsShown = (): Dims => ({ r: rF.v, a: aF.v, h: hF.v });
    const Hshown = () => bodyHeight(kind, dimsShown());
    const zEff = () => Math.max(0, Math.min(H(), p.z));

    function rebuildTarget(): void {
      const d = dims();
      const n = nOf(p.n);
      target = [buildSlabs(kind, d, 1, n, undefined, SMOOTH), buildSlabs(kind, d, 2, n, shear(), SMOOTH)];
      targetH = H();
    }

    /** Wert eines Stapels in der relativen Höhe u (Mittelpunkt, Außen- und Innenmaß). */
    function sample(slabs: readonly Slab[], Hs: number, u: number): { c: number; o: number; i: number } {
      const z = u * Hs;
      let s = slabs[slabs.length - 1]!;
      for (const q of slabs) {
        if (z <= q.z1 + 1e-9) {
          s = q;
          break;
        }
      }
      const t = s.z1 > s.z0 ? clamp01((z - s.z0) / (s.z1 - s.z0)) : 0;
      return { c: lerp(s.c0, s.c1, t), o: lerp(s.o0, s.o1, t), i: lerp(s.i0, s.i1, t) };
    }

    /** Gezeigte Scheiben (während eines Übergangs zwischen alter und neuer Form). */
    function shown(now: number): [Slab[], Slab[]] {
      if (!morph) return target;
      const m = morph;
      const Ht = targetH;
      let running = false;
      const out = target.map((slabs, b) => {
        const prev = m.prev[b]!;
        const count = slabs.length;
        return slabs.map((s, i) => {
          const delay = count > 1 ? (m.spread * i) / (count - 1) : 0;
          const raw = clamp01((now - m.t0 - delay) / m.dur);
          if (raw < 1) running = true;
          const e = ease.inOutCubic(raw);
          if (e >= 1) return s;
          const u0 = s.z0 / Ht;
          const u1 = s.z1 / Ht;
          const straight = s.c0 === s.c1 && s.o0 === s.o1 && s.i0 === s.i1;
          const a = sample(prev, m.prevH, straight ? (u0 + u1) / 2 : u0 + 1e-6);
          const bb = straight ? a : sample(prev, m.prevH, u1 - 1e-6);
          const Hm = lerp(m.prevH, Ht, e);
          return {
            ...s,
            z0: u0 * Hm,
            z1: u1 * Hm,
            c0: lerp(a.c, s.c0, e),
            c1: lerp(bb.c, s.c1, e),
            o0: lerp(a.o, s.o0, e),
            o1: lerp(bb.o, s.o1, e),
            i0: lerp(a.i, s.i0, e),
            i1: lerp(bb.i, s.i1, e),
          };
        });
      }) as [Slab[], Slab[]];
      if (!running) morph = null;
      return out;
    }

    /** Neuen Übergang beginnen: alte Form ist die gerade gezeigte. */
    function startMorph(dur: number, spread: number): void {
      const now = performance.now();
      const prev = shown(now);
      const Hp = prev[0]!.length ? prev[0]![prev[0]!.length - 1]!.z1 : targetH;
      if (reduced()) {
        morph = null;
        return;
      }
      morph = { prev: [prev[0].map((s) => ({ ...s })), prev[1].map((s) => ({ ...s }))], prevH: Hp, t0: now, dur, spread };
    }

    function startBuild(): void {
      if (reduced()) {
        build = null;
        secHidden = false;
        grow.finish();
        return;
      }
      secHidden = true;
      const count = target[0].length;
      const total = Math.min(1500, 260 + count * 70);
      build = { t0: performance.now(), per: count > 1 ? total / count : 0, dur: 520 };
    }
    const buildEnd = () => (build ? build.per * target[0].length + build.dur : 0);

    /* ---------- Farben ---------- */

    const C = () => {
      const s = th().series;
      return { b1: s[0]!, b2: s[4]!, sec: s[3]!, plane: s[5]! };
    };
    const tint = (c: string) => (th().dark ? mixColor(c, '#0b1220', 0.12) : mixColor(c, '#ffffff', 0.1));
    const edgeOf = (c: string, k = 1) => mixColor(c, '#05080f', (th().dark ? 0.5 : 0.42) * k);
    const pillBg = () => (th().dark ? 'rgba(15,20,30,0.86)' : 'rgba(255,255,255,0.9)');

    /** Beleuchtete Farbe für eine Fläche mit Normale n (Weltkoordinaten). */
    function lit(base: string, n: Vec3): string {
      const i = lightIntensity(view.camera.dirToView(n));
      const pivot = 0.74;
      return i >= pivot ? mixColor(base, '#ffffff', ((i - pivot) / (1 - pivot)) * 0.3) : mixColor(base, '#000000', ((pivot - i) / (pivot - 0.45)) * 0.32);
    }

    /* ---------- Formeln, Karten ---------- */

    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({ size, font: th().font, mathFont: th().mathFont, color, weight });

    function fitFormula(src: string, maxW: number, size: number, color: string, weight: number): FormulaBox {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > 9.5) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }

    function cardFrame(r: Rect): void {
      const g = surface.g;
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 3;
      g.fillStyle = th().dark ? 'rgba(21,28,39,0.96)' : 'rgba(255,255,255,0.96)';
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.fill();
      g.restore();
      g.strokeStyle = th().dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
    }

    /** Karte mit Titel und Formelzeilen, in das Rechteck eingepasst (Schrift notfalls kleiner). */
    function drawCard(r: Rect, title: string, lines: CardLine[]): void {
      const g = surface.g;
      const pad = narrow() ? 10 : 13;
      const sw = 16;
      const inner = r.w - 2 * pad;
      let size = textSize();
      let layout: { titleBox: FormulaBox; boxes: FormulaBox[]; lineHs: number[]; total: number } | null = null;
      for (; size >= 9.5; size -= 0.5) {
        const titleBox = fitFormula(title, inner, size + 3, th().text, 800);
        const boxes = lines.map((l) => fitFormula(l.f, inner - (l.swatch ? sw : 0), size, l.muted ? th().muted : th().text, l.bold ? 800 : 600));
        const lineHs = boxes.map((b) => Math.max(size * 1.5, b.asc + b.desc + 6));
        const total = pad + titleBox.asc + titleBox.desc + 8 + lineHs.reduce((a, b) => a + b, 0) + pad - 4;
        layout = { titleBox, boxes, lineHs, total };
        if (total <= r.h) break;
      }
      if (!layout) return;
      const h = Math.min(r.h, layout.total);
      cardFrame({ x: r.x, y: r.y, w: r.w, h });
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, h);
      g.clip();
      let cy = r.y + pad + layout.titleBox.asc;
      layout.titleBox.draw(g, r.x + pad, cy);
      cy += layout.titleBox.desc + 8;
      layout.boxes.forEach((b, i) => {
        const lh = layout!.lineHs[i]!;
        const line = lines[i]!;
        const base = cy + lh / 2 + (b.asc - b.desc) / 2;
        if (line.swatch) {
          g.fillStyle = line.swatch;
          roundRect(g, r.x + pad, cy + lh / 2 - 5, 10, 10, 3);
          g.fill();
        }
        b.draw(g, r.x + pad + (line.swatch ? sw : 0), base);
        cy += lh;
      });
      g.restore();
    }

    /** Formel in einem Schild an einer Pixelposition. */
    function pill(x: number, y: number, src: string, color: string, align: 'left' | 'center' | 'right', size: number, border?: string): Rect {
      const g = surface.g;
      const box = formula(g, src, fstyle(size, color, 700));
      const left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      const base = y + (box.asc - box.desc) / 2;
      const rr = { x: left - 7, y: base - box.asc - 4, w: box.w + 14, h: box.asc + box.desc + 8 };
      g.save();
      g.fillStyle = pillBg();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.4)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1;
      roundRect(g, rr.x, rr.y, rr.w, rr.h, 9);
      g.fill();
      g.restore();
      if (border) {
        g.strokeStyle = border;
        g.lineWidth = 1.4;
        roundRect(g, rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1, 9);
        g.stroke();
      }
      box.draw(g, left, base);
      return rr;
    }

    /* ---------- Griffe ---------- */

    const editable = () => !ctx.locked && !sweep;
    const grab = () => {
      lastHandle = performance.now();
      dragSlow = false;
    };
    // Schnittebene (am linken Rand der Ebene)
    view.addHandle({
      get: () => [0, planeY0(), zF.v],
      set: (q) => {
        grab();
        ctx.set({ z: Math.max(0, Math.min(H(), q[2])) });
      },
      axis: [0, 0, 1],
      enabled: editable,
      color: () => C().sec,
    });
    // Deckfläche bzw. Spitze von Körper 2
    view.addHandle({
      get: () => [0, y2F.v + p.s, H() + liftF.v],
      set: (q) => {
        grab();
        ctx.set({ s: Math.max(-4, Math.min(4, q[1] - y2F.v)) });
      },
      axis: [0, 1, 0],
      enabled: () => editable() && kind !== 'kugel',
      color: () => C().b2,
    });
    // Biegung in halber Höhe
    view.addHandle({
      get: () => [0, y2F.v + p.s / 2 + p.k, H() / 2 + (H() / 2 >= zF.v ? liftF.v : 0)],
      set: (q) => {
        grab();
        ctx.set({ k: Math.max(-3, Math.min(3, q[1] - y2F.v - p.s / 2)) });
      },
      axis: [0, 1, 0],
      enabled: () => editable() && kind !== 'kugel',
      color: () => C().b2,
    });
    // im Diagramm: Höhe ziehen
    plot.addHandle({
      get: () => [areaAt(kind, dimsShown(), zF.v), zF.v],
      set: (_x, y) => {
        grab();
        ctx.set({ z: Math.max(0, Math.min(H(), y)) });
      },
      axis: 'y',
      enabled: editable,
      color: () => C().sec,
    });

    /* ---------- Lage der Körper ---------- */

    const ext = () => {
      const d = dimsShown();
      const e = baseExtent(kind, d);
      return isSquare(kind) ? e * 1.12 : e;
    };
    const gapW = () => Math.max(1.2, ext() * 0.5 + 0.8);
    const y1 = () => -(gapW() / 2 + ext());
    const planeY0 = () => y1() - ext() - 0.6;

    function offsetRange(slabs: readonly Slab[]): [number, number] {
      let lo = 0;
      let hi = 0;
      for (const s of slabs) {
        lo = Math.min(lo, s.c0, s.c1);
        hi = Math.max(hi, s.c0, s.c1);
      }
      return [lo, hi];
    }
    const y2Goal = () => {
      const [lo] = kind === 'kugel' ? [0] : axisRange(shear());
      return gapW() / 2 + ext() + Math.max(0, -lo);
    };

    /* ---------- Zeichnen der Scheiben ---------- */

    interface Piece {
      slab: Slab;
      which: 1 | 2;
      y: number;
      dz: number;
      alpha: number;
      /** Oberste Scheibe ihres Teils (Deckfläche immer zeichnen). */
      top: boolean;
      finite: boolean;
    }

    const SEG = 44;
    const COS = Array.from({ length: SEG }, (_, j) => Math.cos((2 * Math.PI * j) / SEG));
    const SIN = Array.from({ length: SEG }, (_, j) => Math.sin((2 * Math.PI * j) / SEG));

    function ring(y: number, z: number, r: number): Vec3[] {
      return COS.map((c, j) => [r * c, y + r * SIN[j]!, z] as Vec3);
    }
    function squarePts(y: number, z: number, o: number): Vec3[] {
      return [
        [o, y - o, z],
        [o, y + o, z],
        [-o, y + o, z],
        [-o, y - o, z],
      ];
    }
    const px = (q: Vec3) => view.toPx(q) as unknown as Vec2;
    function path(g: CanvasRenderingContext2D, pts: readonly Vec2[], close = true): void {
      pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])));
      if (close) g.closePath();
    }

    function bodyColor(which: 1 | 2, slab: Slab, finite: boolean): string {
      const c = C();
      const base = tint(which === 1 ? c.b1 : c.b2);
      if (!finite || slab.index % 2 === 0) return base;
      return th().dark ? mixColor(base, '#000000', 0.16) : mixColor(base, '#ffffff', 0.2);
    }

    /** Waagerechte Blickrichtung (zur Kamera) und rechts. */
    function horizontalAxes(): { f: Vec3; rt: Vec3 } {
      const cam = view.camera;
      return { f: vec3.normalize([cam.back[0], cam.back[1], 0]), rt: vec3.normalize([cam.right[0], cam.right[1], 0]) };
    }

    /** Horizontaler Verlauf für eine runde Mantelfläche (Licht wie bei den 3D-Flächen). */
    function sideGradient(g: CanvasRenderingContext2D, x0: number, x1: number, base: string, inside = false): CanvasGradient {
      const { f, rt } = horizontalAxes();
      const grad = g.createLinearGradient(x0, 0, Math.max(x0 + 1, x1), 0);
      for (let j = 0; j <= 8; j++) {
        const phi = -Math.PI / 2 + (Math.PI * j) / 8;
        const sn = Math.sin(phi);
        const cs = Math.cos(phi);
        const n: Vec3 = inside ? vec3.add(vec3.scale(f, cs), vec3.scale(rt, -sn)) : vec3.add(vec3.scale(f, cs), vec3.scale(rt, sn));
        grad.addColorStop((1 + sn) / 2, lit(base, n));
      }
      return grad;
    }

    function drawRound(g: CanvasRenderingContext2D, P: Piece, camZ: number): void {
      const s = P.slab;
      const z0 = s.z0 + P.dz;
      const z1 = s.z1 + P.dz;
      const base = bodyColor(P.which, s, P.finite);
      const bot = ring(P.y + s.c0, z0, s.o0).map(px);
      const top = ring(P.y + s.c1, z1, s.o1).map(px);
      const seeTop = camZ > z1;
      const hasHole = s.i0 > 1e-4 || s.i1 > 1e-4;
      const hull = convexHull2D([...bot, ...top]);
      if (hull.length < 3) return;
      let minX = Infinity;
      let maxX = -Infinity;
      for (const q of hull) {
        minX = Math.min(minX, q[0]);
        maxX = Math.max(maxX, q[0]);
      }
      g.save();
      g.globalAlpha = P.alpha;
      // Mantel
      g.beginPath();
      path(g, hull);
      if (seeTop && hasHole) path(g, top);
      g.fillStyle = sideGradient(g, minX, maxX, base);
      g.fill('evenodd');
      if (P.alpha >= 1 && !hasHole) {
        g.strokeStyle = g.fillStyle;
        g.lineWidth = 0.8;
        g.stroke();
      }
      // Trennlinie zur Scheibe darunter (vordere Hälfte des unteren Rands)
      const thick = Math.abs(top[0]![1] - bot[0]![1]);
      if (P.finite && thick > 1.6) {
        const { f } = horizontalAxes();
        const front: Vec2[] = [];
        const cam = view.camera.position;
        COS.forEach((c, j) => {
          const q: Vec3 = [s.o0 * c, P.y + s.c0 + s.o0 * SIN[j]!, z0];
          const outward: Vec3 = [c, SIN[j]!, 0];
          if (vec3.dot(outward, vec3.sub(cam, q)) > 0 || vec3.dot(outward, f) > -0.05) front.push(bot[j]!);
        });
        if (front.length > 1) {
          // Punkte entlang des Bogens ordnen
          front.sort((u, v) => u[0] - v[0]);
          g.beginPath();
          path(g, front, false);
          g.strokeStyle = edgeOf(base, 0.7);
          g.globalAlpha = P.alpha * Math.min(0.75, 0.25 + thick / 14);
          g.lineWidth = 1;
          g.stroke();
          g.globalAlpha = P.alpha;
        }
      }
      if (seeTop) {
        const topColor = lit(base, [0, 0, 1]);
        if (hasHole) {
          const holeTop = ring(P.y + s.c1, z1, s.i1).map(px);
          const holeBot = ring(P.y + s.c0, z0, s.i0).map(px);
          // Innenwand (hinten), durch das Loch sichtbar
          g.save();
          g.beginPath();
          path(g, holeTop);
          g.clip();
          const ih = convexHull2D([...holeTop, ...holeBot]);
          let a0 = Infinity;
          let a1 = -Infinity;
          for (const q of ih) {
            a0 = Math.min(a0, q[0]);
            a1 = Math.max(a1, q[0]);
          }
          g.beginPath();
          path(g, ih);
          if (s.i0 > 1e-4) path(g, holeBot);
          g.fillStyle = sideGradient(g, a0, a1, mixColor(base, '#000000', 0.12), true);
          g.fill('evenodd');
          g.restore();
          g.beginPath();
          path(g, top);
          path(g, holeTop);
          g.fillStyle = topColor;
          g.fill('evenodd');
          g.beginPath();
          path(g, holeTop);
          g.strokeStyle = edgeOf(base, 0.6);
          g.lineWidth = 0.9;
          g.globalAlpha = P.alpha * 0.6;
          g.stroke();
          g.globalAlpha = P.alpha;
        } else if (P.finite || P.top) {
          g.beginPath();
          path(g, top);
          g.fillStyle = topColor;
          g.fill();
        }
        if (P.finite || P.top) {
          g.beginPath();
          path(g, top);
          g.strokeStyle = edgeOf(base, 0.75);
          g.lineWidth = P.top ? 1.4 : 0.9;
          g.globalAlpha = P.alpha * (P.top ? 0.9 : Math.min(0.55, 0.15 + thick / 16));
          g.stroke();
        }
      } else if (camZ < z0 && P.top) {
        // von unten: Bodenfläche
        g.beginPath();
        path(g, bot);
        g.fillStyle = lit(base, [0, 0, -1]);
        g.fill();
      }
      g.restore();
    }

    function drawSquare(g: CanvasRenderingContext2D, P: Piece, camZ: number): void {
      const s = P.slab;
      const z0 = s.z0 + P.dz;
      const z1 = s.z1 + P.dz;
      const base = bodyColor(P.which, s, P.finite);
      const b3 = squarePts(P.y + s.c0, z0, s.o0);
      const t3 = squarePts(P.y + s.c1, z1, s.o1);
      const cam = view.camera;
      const mid: Vec3 = [0, P.y + (s.c0 + s.c1) / 2, (z0 + z1) / 2];
      const thick = Math.abs(px(t3[0]!)[1] - px(b3[0]!)[1]);
      g.save();
      g.globalAlpha = P.alpha;
      g.lineJoin = 'round';
      for (let k = 0; k < 4; k++) {
        const quad = [b3[k]!, b3[(k + 1) % 4]!, t3[(k + 1) % 4]!, t3[k]!];
        let n = vec3.normal(quad);
        const cen = vec3.centroid(quad);
        if (vec3.dot(n, vec3.sub(cen, mid)) < 0) n = vec3.scale(n, -1);
        if (!cam.facing(n, cen)) continue;
        const pts = quad.map(px);
        g.beginPath();
        path(g, pts);
        const col = lit(base, n);
        g.fillStyle = col;
        g.fill();
        g.strokeStyle = col;
        g.lineWidth = 0.8;
        g.stroke();
        if (P.finite && thick > 1.6) {
          // untere Kante als Trennlinie, senkrechte Kanten fein
          g.beginPath();
          path(g, [pts[0]!, pts[1]!], false);
          g.strokeStyle = edgeOf(base, 0.7);
          g.globalAlpha = P.alpha * Math.min(0.7, 0.25 + thick / 14);
          g.lineWidth = 1;
          g.stroke();
          g.globalAlpha = P.alpha;
        }
        g.beginPath();
        path(g, [pts[1]!, pts[2]!], false);
        g.strokeStyle = edgeOf(base, 0.5);
        g.globalAlpha = P.alpha * 0.35;
        g.lineWidth = 0.8;
        g.stroke();
        g.globalAlpha = P.alpha;
      }
      if (camZ > z1 && (P.finite || P.top)) {
        const pts = t3.map(px);
        g.beginPath();
        path(g, pts);
        g.fillStyle = lit(base, [0, 0, 1]);
        g.fill();
        g.strokeStyle = edgeOf(base, 0.75);
        g.lineWidth = P.top ? 1.4 : 0.9;
        g.globalAlpha = P.alpha * (P.top ? 0.9 : Math.min(0.55, 0.15 + thick / 16));
        g.stroke();
      } else if (camZ < z0 && P.top) {
        g.beginPath();
        path(g, b3.map(px));
        g.fillStyle = lit(base, [0, 0, -1]);
        g.fill();
      }
      g.restore();
    }

    /** Querschnitt in der Höhe zc (orange, schraffiert, wächst beim Einblenden). */
    function drawSection(g: CanvasRenderingContext2D, y: number, c: number, outer: number, inner: number, scale: number): void {
      if (outer <= 1e-4 || scale <= 0.001) return;
      const zc = zF.v;
      const col = C().sec;
      const o = outer * scale;
      const i = inner * scale;
      const outerPts = (isSquare(kind) ? squarePts(y + c, zc, o) : ring(y + c, zc, o)).map(px);
      const innerPts = i > 1e-4 ? ring(y + c, zc, i).map(px) : null;
      g.save();
      g.beginPath();
      path(g, outerPts);
      if (innerPts) path(g, innerPts);
      g.fillStyle = mixColor(lit(col, [0, 0, 1]), th().dark ? '#000000' : '#ffffff', th().dark ? 0.08 : 0.12);
      g.globalAlpha = Math.min(1, scale * 1.4);
      g.fill('evenodd');
      // Schraffur
      g.clip('evenodd');
      let x0 = Infinity;
      let x1 = -Infinity;
      let yy0 = Infinity;
      let yy1 = -Infinity;
      for (const q of outerPts) {
        x0 = Math.min(x0, q[0]);
        x1 = Math.max(x1, q[0]);
        yy0 = Math.min(yy0, q[1]);
        yy1 = Math.max(yy1, q[1]);
      }
      g.strokeStyle = th().dark ? mixColor(col, '#000000', 0.35) : mixColor(col, '#ffffff', 0.45);
      g.lineWidth = 1.2;
      g.globalAlpha = 0.55 * Math.min(1, scale);
      g.beginPath();
      for (let x = x0 - (yy1 - yy0); x < x1; x += 7) {
        g.moveTo(x, yy1);
        g.lineTo(x + (yy1 - yy0), yy0);
      }
      g.stroke();
      g.restore();
      g.save();
      g.beginPath();
      path(g, outerPts);
      if (innerPts) path(g, innerPts);
      g.strokeStyle = edgeOf(col, 0.8);
      g.lineWidth = 1.8;
      g.globalAlpha = Math.min(1, scale * 1.4);
      g.stroke();
      g.restore();
    }

    /* ---------- Bildausschnitt ---------- */

    function goalFrame(): { target: Vec3; radius: number } {
      const sc = rects().scene;
      const e = ext();
      const [, hi] = kind === 'kugel' ? [0, 0] : axisRange({ s: p.s, k: p.k });
      const yl = planeY0() - 0.2;
      const yr = y2Goal() + hi + e + 0.6;
      const top = H() + (p.cut ? liftGoal() : 0);
      const halfY = (yr - yl) / 2 + e * 0.25;
      const halfZ = top / 2 + 0.35;
      const m = Math.min(sc.w, sc.h) * 0.92;
      const radius = Math.max((halfY * m) / (sc.w * 0.94), (halfZ * m) / (sc.h * (narrow() ? 0.66 : 0.7))) * 1.05;
      return { target: [0, (yl + yr) / 2, top * 0.47], radius };
    }
    const liftGoal = () => 0.13 * H() + 0.35;

    function viewFor(b: BodyKind): { azimuth: number; elevation: number } {
      if (b === 'kugel') return { azimuth: 26, elevation: 30 };
      if (b === 'prisma' || b === 'pyr') return { azimuth: 30, elevation: 24 };
      return { azimuth: 26, elevation: 25 };
    }

    /* ---------- Hauptszene ---------- */

    function drawScene(now: number): { anim: boolean } {
      let anim = false;
      const g = surface.g;
      const c = C();
      const Hs = Hshown();
      const zc = Math.max(0, Math.min(Hs, zF.v));
      const lift = liftF.v;
      const [sl1, sl2] = shown(now);
      if (morph) anim = true;
      const finite = Number.isFinite(nOf(p.n));
      const e = ext();
      const Y1 = y1();
      const Y2 = y2F.v;
      const camZ = view.camera.position[2];

      // Boden, Schatten
      const [lo2, hi2] = offsetRange(sl2);
      const G = Math.ceil(e + 2);
      view.grid({ min: [-G, Math.floor(planeY0() - 1)], max: [G, Math.ceil(Y2 + hi2 + e + 2)], step: 1, color: th().gridMinor });
      const foot = (y: number, slabs: readonly Slab[]) => {
        const pts: Vec3[] = [];
        for (const s of [slabs[0], slabs[slabs.length - 1]]) {
          if (!s) continue;
          for (const q of ring(y + s.c0, 0, Math.max(s.o0, 0.05))) pts.push(q);
          for (const q of ring(y + s.c1, 0, Math.max(s.o1 * 0.6, 0.05))) pts.push(q);
        }
        return pts;
      };
      const bshadow = build ? clamp01((now - build.t0) / Math.max(1, buildEnd())) : 1;
      view.shadow(foot(Y1, sl1), { alpha: 0.2 * (0.4 + 0.6 * bshadow), blur: 22, spread: 1.06 });
      view.shadow(foot(Y2, sl2), { alpha: 0.2 * (0.4 + 0.6 * bshadow), blur: 22, spread: 1.06 });
      void lo2;

      // Teile bilden (unterhalb der Ebene, oberhalb angehoben)
      type Item = { zLo: number; zHi: number; depth: number; draw: () => void };
      const items: Item[] = [];
      const pieces = (slabs: readonly Slab[], which: 1 | 2, y: number) => {
        const { below, above } = splitSlabs(slabs, zc);
        const add = (list: Slab[], part: 'below' | 'above') => {
          list.forEach((s, idx) => {
            let dz = part === 'above' ? lift : 0;
            let alpha = 1;
            if (build) {
              const t = clamp01((now - build.t0 - build.per * s.index) / build.dur);
              if (t < 1) anim = true;
              const drop = (1 - ease.outCubic(t)) * (0.45 * Hs + 1.2);
              dz += drop;
              alpha = clamp01(t * 2.2);
              if (alpha <= 0) return;
            }
            const P: Piece = { slab: s, which, y, dz, alpha, top: idx === list.length - 1, finite };
            const mid: Vec3 = [0, y + (s.c0 + s.c1) / 2, (s.z0 + s.z1) / 2 + dz];
            items.push({ zLo: s.z0 + dz, zHi: s.z1 + dz, depth: view.camera.project(mid).depth, draw: () => (isSquare(kind) ? drawSquare(g, P, camZ) : drawRound(g, P, camZ)) });
          });
        };
        add(below, 'below');
        add(above, 'above');
      };
      pieces(sl1, 1, Y1);
      pieces(sl2, 2, Y2);

      // Ebene und Querschnitte
      const d = dimsShown();
      const sec1 = section(kind, d, 1, zc);
      const sec2 = section(kind, d, 2, zc);
      const c2 = sl2.length ? sample(sl2, Hs, Hs > 0 ? zc / Hs : 0).c : 0;
      const yR = Y2 + hi2 + e + 0.6;
      const X = e + 0.7;
      const planeShow = build ? clamp01((now - build.t0 - buildEnd() * 0.6) / 500) : 1;
      const gs = secHidden ? 0 : grow.running ? grow.value : 1;
      if (grow.running) anim = true;
      items.push({
        zLo: zc,
        zHi: zc,
        depth: 0,
        draw: () => {
          if (planeShow > 0) {
            const corners: Vec3[] = [
              [X, planeY0(), zc],
              [X, yR, zc],
              [-X, yR, zc],
              [-X, planeY0(), zc],
            ];
            const pts = corners.map(px);
            g.save();
            g.globalAlpha = planeShow;
            g.beginPath();
            path(g, pts);
            const pg = g.createLinearGradient(pts[3]![0], pts[3]![1], pts[1]![0], pts[1]![1]);
            pg.addColorStop(0, mixColor(c.plane, th().bg, 0.35, th().dark ? 0.2 : 0.16));
            pg.addColorStop(1, mixColor(c.plane, th().bg, 0.55, th().dark ? 0.12 : 0.09));
            g.fillStyle = pg;
            g.fill();
            g.strokeStyle = mixColor(c.plane, th().bg, 0.15, 0.75);
            g.lineWidth = 1.4;
            g.stroke();
            // Glanzkante vorn
            g.beginPath();
            path(g, [pts[3]!, pts[0]!, pts[1]!], false);
            g.strokeStyle = mixColor(c.plane, '#ffffff', 0.35, 0.9);
            g.lineWidth = 2;
            g.stroke();
            g.restore();
          }
          drawSection(g, Y1, 0, sec1.outer, sec1.inner, gs);
          drawSection(g, Y2, c2, sec2.outer, sec2.inner, gs);
        },
      });

      // Malerreihenfolge für waagerechte Schichten
      const belowCam = items.filter((it) => it.zHi <= camZ).sort((a, b) => a.zLo - b.zLo || b.depth - a.depth);
      const aboveCam = items.filter((it) => it.zLo >= camZ && it.zHi > camZ).sort((a, b) => b.zHi - a.zHi || b.depth - a.depth);
      const straddle = items.filter((it) => it.zHi > camZ && it.zLo < camZ).sort((a, b) => b.depth - a.depth);
      for (const it of [...belowCam, ...aboveCam, ...straddle]) it.draw();

      drawOverlays(now, { Y1, Y2, zc, lift, Hs, sec1, sec2, c2, sl1, sl2, planeShow, gs });
      return { anim };
    }

    /** Beschriftungen, Maße und Griffpunkte über der Szene. */
    function drawOverlays(now: number, o: { Y1: number; Y2: number; zc: number; lift: number; Hs: number; sec1: { outer: number }; sec2: { outer: number }; c2: number; sl1: Slab[]; sl2: Slab[]; planeShow: number; gs: number }): void {
      const c = C();
      const size = textSize();
      const e = ext();
      const sc = rects().scene;
      const topZ = o.Hs + o.lift;
      const ready = !build || now - build.t0 > buildEnd() * 0.75;
      // gleiche Höhe: gestrichelte Linie über beide Körper, senkrechte Höhe bei Körper 2
      const t1 = o.sl1[o.sl1.length - 1];
      const t2 = o.sl2[o.sl2.length - 1];
      if (ready && t1 && t2) {
        const A: Vec3 = [0, o.Y1 + t1.c1, topZ];
        const B: Vec3 = [0, o.Y2 + (kind === 'kugel' ? 0 : p.s), topZ];
        view.segment(A, B, { color: th().muted, width: 1.3, dash: [5, 5], alpha: 0.8, layer: 'front' });
        if (kind !== 'kugel' && Math.abs(p.s) > 0.05) {
          const F: Vec3 = [0, B[1], 0];
          view.segment(B, F, { color: th().muted, width: 1.3, dash: [5, 5], alpha: 0.8, layer: 'front' });
          const k = 10 / Math.max(1e-6, view.pixelsPerUnit(F));
          const sgn = Math.sign(p.s) || 1;
          view.polyline(
            [
              [0, F[1] - sgn * k, 0],
              [0, F[1] - sgn * k, k],
              [0, F[1], k],
            ],
            { color: th().muted, width: 1.3, layer: 'front' },
          );
        }
        view.label(vec3.lerp(A, B, 0.5), `h = ${num(o.Hs)} cm`, { color: th().muted, size: size - 0.5, weight: '600', offset: [0, -11], baseline: 'middle' });
      }
      // Höhe der Ebene am linken Rand
      if (o.planeShow > 0.5) {
        const Pf: Vec3 = [0, planeY0(), 0];
        const Pz: Vec3 = [0, planeY0(), o.zc];
        view.segment(Pf, Pz, { color: c.sec, width: 1.8, dash: [4, 4], layer: 'front' });
        view.point(Pz, { color: c.sec, radius: 6.5, layer: 'front' });
        view.custom(
          Pz,
          (g) => {
            const [x, y] = view.toPx(Pz);
            pill(Math.max(sc.x + 50, x), y - 24, `z = ${num(nums.z.v, 1)} cm`, th().text, 'center', size, c.sec);
            void g;
          },
          'front',
        );
      }
      // Griffe von Körper 2
      if (kind !== 'kugel' && ready && editable()) {
        const top: Vec3 = [0, o.Y2 + p.s, topZ];
        const midZ = o.Hs / 2 + (o.Hs / 2 >= o.zc ? o.lift : 0);
        const mid: Vec3 = [0, o.Y2 + p.s / 2 + p.k, midZ];
        view.point(top, { color: c.b2, radius: 6.5, layer: 'front' });
        view.point(mid, { color: c.b2, radius: 4.5, hollow: true, layer: 'front' });
        if (now - lastHandle > 4000) {
          const len = 0.55 + e * 0.12;
          view.arrow(vec3.add(top, [0, 0.35, 0]), vec3.add(top, [0, 0.35 + len, 0]), { color: c.b2, width: 1.8, head: 8, alpha: 0.75, layer: 'front' });
          view.arrow(vec3.add(top, [0, -0.35, 0]), vec3.add(top, [0, -0.35 - len, 0]), { color: c.b2, width: 1.8, head: 8, alpha: 0.75, layer: 'front' });
        }
      }
      // Namen und Querschnittsflächen unter den Körpern
      const nameOf = (which: 1 | 2) => {
        if (kind === 'kugel') return ctx.t(which === 1 ? 'kugel1' : sc.w < 380 ? 'kugel2s' : 'kugel2');
        if (which === 1) return ctx.t(`${kind}1`);
        if (Math.abs(p.k) > 0.01) return ctx.t(`${kind}3`);
        return ctx.t(Math.abs(p.s) > 0.01 ? `${kind}2` : `${kind}1`);
      };
      const showA = sc.w >= 360;
      const A = nums.A.v;
      for (const which of [1, 2] as const) {
        const y = which === 1 ? o.Y1 : o.Y2;
        const at: Vec3 = [e * 1.05, y, 0];
        const col = which === 1 ? c.b1 : c.b2;
        view.custom(
          at,
          (g) => {
            const [x, yy] = view.toPx(at);
            const nameBox = formula(g, nameOf(which), fstyle(size, edgeOf(col, th().dark ? -0.6 : 0.35), 800));
            const lx = Math.max(sc.x + 6, Math.min(sc.x + sc.w - nameBox.w - 6, x - nameBox.w / 2));
            nameBox.draw(g, lx, yy + 24);
            if (showA && ready && p.calc) pill(lx + nameBox.w / 2, yy + 46, `A_${which} ${A < 1e-6 ? '=' : '≈'} ${num(A)} cm²`, th().text, 'center', size - 0.5, c.sec);
          },
          'front',
        );
      }
      // Gleichheitszeichen zwischen den Querschnitten
      if (ready && o.planeShow > 0.5) {
        const a: Vec3 = [0, o.Y1 + o.sec1.outer, o.zc];
        const b: Vec3 = [0, o.Y2 + o.c2 - o.sec2.outer, o.zc];
        const m = vec3.lerp(a, b, 0.5);
        view.custom(
          m,
          (g) => {
            const [x, y] = view.toPx(m);
            const r = 11 * Math.max(0.01, o.gs);
            g.save();
            g.beginPath();
            g.arc(x, y, r, 0, Math.PI * 2);
            g.fillStyle = c.sec;
            g.shadowColor = th().dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
            g.shadowBlur = 6;
            g.fill();
            g.restore();
            g.save();
            g.strokeStyle = '#ffffff';
            g.lineWidth = 2.2 * o.gs;
            g.lineCap = 'round';
            g.beginPath();
            g.moveTo(x - 5 * o.gs, y - 3 * o.gs);
            g.lineTo(x + 5 * o.gs, y - 3 * o.gs);
            g.moveTo(x - 5 * o.gs, y + 3 * o.gs);
            g.lineTo(x + 5 * o.gs, y + 3 * o.gs);
            g.stroke();
            g.restore();
          },
          'front',
        );
      }
    }

    /* ---------- Diagramm A(z) ---------- */

    function drawChart(now: number): void {
      const g = surface.g;
      const cr = rects().chart;
      const c = C();
      const d = dimsShown();
      const Hs = Hshown();
      const Amax = Math.max(1e-6, areaAt(kind, d, 0));
      cardFrame(cr);
      const size = textSize();
      const title = fitFormula(ctx.t('chart'), cr.w - 24, size, th().text, 800);
      title.draw(g, cr.x + 12, cr.y + 12 + title.asc);
      if (Number.isFinite(nOf(p.n))) {
        const note = formula(g, ctx.t('bars'), fstyle(11, th().muted, 500));
        if (title.w + note.w + 34 < cr.w) note.draw(g, cr.x + cr.w - 12 - note.w, cr.y + 12 + title.asc);
      }
      plot.setRangePadded([0, Amax * 1.12], [0, Hs * 1.04], { left: 34, bottom: 28, top: 22, right: 34 });
      const pr = plot.rect;
      g.save();
      g.beginPath();
      g.rect(pr.x, pr.y, pr.w, pr.h);
      g.clip();
      plot.grid();
      const [sl1] = shown(now);
      const finite = Number.isFinite(nOf(p.n));
      const area = (s: Slab, end: 0 | 1) => {
        const o = end ? s.o1 : s.o0;
        const i = end ? s.i1 : s.i0;
        return isSquare(kind) ? 4 * o * o : Math.PI * (o * o - i * i);
      };
      if (finite) {
        const fill = th().dark ? mixColor(c.b1, th().bg, 0.55) : mixColor(c.b1, '#ffffff', 0.72);
        const build1 = build;
        sl1.forEach((s) => {
          let k = 1;
          if (build1) k = ease.outCubic(clamp01((now - build1.t0 - build1.per * s.index) / build1.dur));
          if (k <= 0) return;
          const w = area(s, 0) * k;
          plot.polygon(
            [
              [0, s.z0],
              [w, s.z0],
              [w, s.z1],
              [0, s.z1],
            ],
            { fill, stroke: mixColor(c.b1, th().bg, 0.2, 0.55), width: 1 },
          );
        });
      }
      plot.parametric((t) => areaAt(kind, d, t), (t) => t, 0, Hs, { color: c.b1, width: 3, samples: 120 });
      plot.parametric((t) => areaAt(kind, d, t, 2, shear()), (t) => t, 0, Hs, { color: c.b2, width: 2.4, dash: [6, 5], samples: 120 });
      const zc = Math.max(0, Math.min(Hs, zF.v));
      const Az = areaAt(kind, d, zc);
      plot.segment([0, zc], [Az, zc], { color: c.sec, width: 2.6 });
      plot.segment([Az, zc], [Amax * 1.12, zc], { color: c.sec, width: 1.2, dash: [3, 4], alpha: 0.6 });
      plot.axes();
      plot.point(Az, zc, { color: c.sec, radius: 5.5 });
      plot.end();
    }

    /* ---------- Karte ---------- */

    function cardLines(): { title: string; lines: CardLine[] } {
      const c = C();
      const A = num(nums.A.v);
      const V = num(nums.V.v);
      const z = num(nums.z.v, 1);
      const eqA = nums.A.v < 1e-6 ? '=' : '≈';
      /** Zahlenwert nur mit „Rechnung im Bild“ (Aufgabenlinks setzen calc=0). */
      const q = (rel: string, val: string, unit: string) => (p.calc ? ` ${rel} ${val} ${unit}` : '');
      const lines: CardLine[] = [];
      const n = nOf(p.n);
      const stackLine: CardLine = Number.isFinite(n) ? { f: tr('slices', { n, v: num(nums.S.v) }), muted: true } : { f: ctx.t('smooth'), muted: true };
      const nar = narrow();
      if (kind === 'kugel') {
        const de = ctx.lang === 'de';
        lines.push({ f: `A_1 = π(r² − z²)${q(eqA, A, 'cm²')}`, swatch: c.b1 }, { f: `A_2 = πr² − πz²${q(eqA, A, 'cm²')}`, swatch: c.b2 }, { f: ctx.t('equal'), bold: true });
        if (!narrow()) lines.push({ f: de ? 'V_2 = V_{Zylinder} − V_{Kegel}' : 'V_2 = V_{cylinder} − V_{cone}', muted: true });
        lines.push({ f: `V_1 = πr³ − \\f{1}{3}πr³ = \\f{2}{3}πr³${q('≈', V, 'cm³')}` });
        lines.push({ f: `V_{${de ? 'Kugel' : 'sphere'}} = 2 · \\f{2}{3}πr³ = \\f{4}{3}πr³${q('≈', num(2 * nums.V.v), 'cm³')}`, bold: true });
        if (!nar && p.calc) lines.push(stackLine);
        return { title: tr('title', { z }), lines };
      }
      const formulaA: Record<string, string> = { zyl: 'πr²', prisma: 'a²', kegel: 'πρ²', pyr: 'b²' };
      const fa = formulaA[kind]!;
      if (kind === 'kegel' || kind === 'pyr') {
        const sym = kind === 'kegel' ? 'ρ' : 'b';
        const full = kind === 'kegel' ? 'r' : 'a';
        const v = kind === 'kegel' ? section(kind, dimsShown(), 1, zF.v).outer : 2 * section(kind, dimsShown(), 1, zF.v).outer;
        lines.push({ f: `${sym} = ${full} · \\f{h − z}{h}${q(v < 1e-6 ? '=' : '≈', num(v), 'cm')}`, muted: true });
      }
      lines.push({ f: `A_1 = ${fa}${q(eqA, A, 'cm²')}`, swatch: c.b1 }, { f: `A_2 = ${fa}${q(eqA, A, 'cm²')}`, swatch: c.b2 }, { f: ctx.t('equal'), bold: true });
      const Vf: Record<string, string> = { zyl: 'πr² · h', prisma: 'a² · h', kegel: '\\f{1}{3} · πr² · h', pyr: '\\f{1}{3} · a² · h' };
      lines.push({ f: `V = ${Vf[kind]}${q(kind === 'prisma' && Number.isInteger(volume(kind, dims()) * 100) ? '=' : '≈', V, 'cm³')}`, bold: true });
      if (p.calc) lines.push(stackLine);
      return { title: tr('title', { z }), lines };
    }

    /* ---------- Ergebnisse (Text) ---------- */

    function updateReadouts(): void {
      const d = dims();
      const z = zEff();
      const A = areaAt(kind, d, z);
      const V = volume(kind, d);
      const n = nOf(p.n);
      const v = (x: string, sub = '') => `<var>${x}</var>${sub ? `<sub>${sub}</sub>` : ''}`;
      const third = '<span class="frac"><span>1</span><span>3</span></span>';
      const two3 = '<span class="frac"><span>2</span><span>3</span></span>';
      const four3 = '<span class="frac"><span>4</span><span>3</span></span>';
      const cm = (x: number, dd = 2) => `${num(x, dd)} cm`;
      const de = ctx.lang === 'de';
      let Ahtml: string;
      if (kind === 'kugel') {
        Ahtml = `${v('A', '1')} = π(${v('r')}² − ${v('z')}²) = π · ((${cm(d.r)})² − (${cm(z)})²) ≈ <strong>${num(A)} cm²</strong><br>${v('A', '2')} = π${v('r')}² − π${v('z')}² ≈ <strong>${num(A)} cm²</strong>`;
      } else if (kind === 'zyl' || kind === 'prisma') {
        const f = kind === 'zyl' ? `π${v('r')}² = π · (${cm(d.r)})²` : `${v('a')}² = (${cm(d.a)})²`;
        Ahtml = `${v('A', '1')} = ${v('A', '2')} = ${f} ${kind === 'zyl' ? '≈' : '='} <strong>${num(A)} cm²</strong> (${de ? 'in jeder Höhe' : 'at every height'})`;
      } else {
        const sec = section(kind, d, 1, z);
        const len = kind === 'kegel' ? sec.outer : 2 * sec.outer;
        const sym = kind === 'kegel' ? 'ρ' : 'b';
        const full = kind === 'kegel' ? 'r' : 'a';
        Ahtml = `${v(sym)} = ${v(full)} · (${v('h')} − ${v('z')}) : ${v('h')} ≈ ${cm(len)}, ${v('A', '1')} = ${v('A', '2')} = ${kind === 'kegel' ? `π${v('ρ')}²` : `${v('b')}²`} ≈ <strong>${num(A)} cm²</strong>`;
      }
      ctx.readout('A', { html: Ahtml });
      let Vhtml: string;
      if (kind === 'kugel') {
        const sp = sphereParts(d.r);
        Vhtml = `${v('V', de ? 'Halbkugel' : 'hemisphere')} = ${v('V', de ? 'Zylinder' : 'cylinder')} − ${v('V', de ? 'Kegel' : 'cone')} = π${v('r')}³ − ${third}π${v('r')}³ = ${two3}π${v('r')}³ ≈ <strong>${num(sp.hemisphere)} cm³</strong><br>${v('V', de ? 'Kugel' : 'sphere')} = ${four3}π${v('r')}³ = ${four3} · π · (${cm(d.r)})³ ≈ <strong>${num(sp.sphere)} cm³</strong>`;
      } else {
        const f: Record<string, string> = {
          zyl: `π${v('r')}² · ${v('h')} = π · (${cm(d.r)})² · ${cm(d.h)}`,
          prisma: `${v('a')}² · ${v('h')} = (${cm(d.a)})² · ${cm(d.h)}`,
          kegel: `${third} · π${v('r')}² · ${v('h')} = ${third} · π · (${cm(d.r)})² · ${cm(d.h)}`,
          pyr: `${third} · ${v('a')}² · ${v('h')} = ${third} · (${cm(d.a)})² · ${cm(d.h)}`,
        };
        Vhtml = `${v('V', '1')} = ${v('V', '2')} = ${f[kind]} ≈ <strong>${num(V)} cm³</strong>`;
      }
      ctx.readout('V', { html: Vhtml });
      if (Number.isFinite(n)) {
        const Vs = stackVolumeFormula(kind, d, n);
        const dev = ((Vs - V) / V) * 100;
        ctx.readout('stack', {
          html: `${n} ${de ? 'Scheiben der Dicke' : 'slices of thickness'} ${cm(H() / n)}: ${v('V', de ? 'Stapel' : 'stack')} ≈ <strong>${num(Vs)} cm³</strong>${Math.abs(dev) > 0.005 ? ` (${dev > 0 ? '+' : ''}${num(dev, 1)} %)` : ''}`,
        });
      } else ctx.readout('stack', { html: de ? 'unendlich viele, unendlich dünne Scheiben: der Stapel ist der Körper' : 'infinitely many, infinitely thin slices: the stack is the solid' });
    }

    function syncActions(): void {
      const straight = Math.abs(p.s) < 0.01 && Math.abs(p.k) < 0.01;
      ctx.setAction('shape', { label: ctx.t(straight ? 'oblique' : 'straighten') });
    }

    /* ---------- Bild ---------- */

    const SWEEP_DOWN = 0.7;
    const SWEEP_UP = 2.8;
    const SWEEP_BACK = 1.0;
    function sweepZ(now: number): number | null {
      if (!sweep) return null;
      const t = (now - sweep.t0) / 1000;
      const Hm = H();
      if (t < SWEEP_DOWN) return sweep.from * (1 - ease.inOutCubic(t / SWEEP_DOWN));
      if (t < SWEEP_DOWN + SWEEP_UP) return Hm * ease.inOutCubic((t - SWEEP_DOWN) / SWEEP_UP);
      if (t < SWEEP_DOWN + SWEEP_UP + SWEEP_BACK) return lerp(Hm, sweep.from, ease.inOutCubic((t - SWEEP_DOWN - SWEEP_UP) / SWEEP_BACK));
      sweep = null;
      return null;
    }

    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      const rm = reduced();
      const dragging = now - lastHandle < 350;
      let anim = false;

      // weiche Größen fortschreiben
      const sz = sweepZ(now);
      if (sz !== null) {
        zF.v = sz;
        anim = true;
      } else anim = zF.step(zEff(), dt, rm ? 0 : dragging ? 0.05 : 0.16) || anim;
      anim = liftF.step(p.cut ? liftGoal() : 0, dt, rm ? 0 : 0.22) || anim;
      anim = rF.step(p.r, dt, rm ? 0 : 0.2) || anim;
      anim = aF.step(p.a, dt, rm ? 0 : 0.2) || anim;
      anim = hF.step(p.h, dt, rm ? 0 : 0.2) || anim;
      if (!dragging) anim = y2F.step(y2Goal(), dt, rm ? 0 : 0.3) || anim;
      else anim = true;
      const d = dimsShown();
      const zShownNow = Math.max(0, Math.min(Hshown(), zF.v));
      const n = nOf(p.n);
      anim = nums.A.step(areaAt(kind, d, zShownNow), dt, 0) || anim;
      anim = nums.z.step(zShownNow, dt, 0) || anim;
      anim = nums.V.step(volume(kind, d), dt, rm ? 0 : 0.28) || anim;
      anim = nums.S.step(Number.isFinite(n) ? stackVolumeFormula(kind, d, n) : volume(kind, d), dt, rm ? 0 : 0.28) || anim;
      if (build && now - build.t0 > buildEnd() + 50) {
        build = null;
        secHidden = false;
        grow.play();
      }

      const goal = goalFrame();
      if (!frame) frame = goal;
      if (!dragging) {
        const k = rm ? 1 : 1 - Math.exp(-dt / 0.28);
        frame = { target: vec3.lerp(frame.target, goal.target, k), radius: frame.radius + (goal.radius - frame.radius) * k };
        if (vec3.distance(frame.target, goal.target) > 0.003 || Math.abs(frame.radius - goal.radius) > 0.003) anim = true;
      } else anim = true;
      view.setScene({ target: frame.target, radius: frame.radius, anchor: [0.5, narrow() ? 0.5 : 0.48] });

      const g = surface.begin();
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      plot.resize();
      view.begin();
      const res = drawScene(now);
      view.end();
      drawChart(now);
      const { title, lines } = cardLines();
      drawCard(rects().card, title, lines);
      if (anim || res.anim || build || sweep) ctx.requestRender();
    }

    /* ---------- Aktionen ---------- */

    function startSweep(): void {
      if (reduced()) return;
      sweep = { t0: performance.now(), from: zEff() };
      ctx.requestRender();
    }

    rebuildTarget();
    y2F.v = y2Goal();
    liftF.v = p.cut ? liftGoal() : 0;
    startBuild();

    return {
      update(changed, source) {
        const kindChanged = changed.has('body');
        if (kindChanged) kind = p.body as BodyKind;
        if (changed.has('h') && source === 'input' && p.z > p.h) ctx.set({ z: p.h });
        if (kindChanged && source === 'input' && p.z > H()) ctx.set({ z: Math.round(H() * 4) / 10 });
        const shapeKeys = ['n', 's', 'k', 'r', 'a', 'h'].some((k) => changed.has(k));
        if (kindChanged || source === 'init') {
          rebuildTarget();
          morph = null;
          if (source !== 'init') {
            sweep = null;
            rF.v = p.r;
            aF.v = p.a;
            hF.v = p.h;
            startBuild();
          }
        } else if (shapeKeys) {
          const slow = dragSlow || source === 'replace';
          const handle = performance.now() - lastHandle < 350;
          if (handle) startMorph(260, Math.min(160, 8 * target[0].length));
          else if (slow) startMorph(720, 620);
          else startMorph(420, 360);
          dragSlow = false;
          rebuildTarget();
        }
        if (changed.has('cut') && p.cut && source !== 'init') grow.play();
        if (kindChanged || source === 'init' || source === 'replace') {
          const v = viewFor(kind);
          view.setInitialView(v);
          if (source === 'init') view.setCamera(v);
          else view.animateTo(v, 1100);
        }
        syncActions();
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'sweep') startSweep();
        else if (id === 'shape') {
          const straight = Math.abs(p.s) < 0.01 && Math.abs(p.k) < 0.01;
          dragSlow = true;
          ctx.set(straight ? { s: 2.5, k: 0 } : { s: 0, k: 0 });
        }
      },

      resetView: () => view.resetView(true),

      render,

      destroy: () => surface.destroy(),
    };
  },
});
