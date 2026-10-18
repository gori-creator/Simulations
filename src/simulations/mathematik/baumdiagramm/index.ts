import { defineSimulation, ease, prefersReducedMotion, roundRect, shade, Surface, text, type Rect } from '../../../sim-core';
import { buildTree, drawPath, eventProb, fadd, frac, fval, inEvent, leaves, parseSel, pathEdges, rawProduct, urnAfter, urnColors, urnTotal, ZERO, type Color, type EventId, type Frac, type TreeNode, type Urn } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;


const EVENTS: { value: EventId; label: { de: string; en: string } }[] = [
  { value: 'none', label: L('kein Ereignis', 'no event') },
  { value: 'same', label: L('alle gleichfarbig', 'all the same colour') },
  { value: 'diff', label: L('alle verschieden', 'all different') },
  { value: 'oneR', label: L('genau eine rote', 'exactly one red') },
  { value: 'minR', label: L('mindestens eine rote', 'at least one red') },
  { value: 'noR', label: L('keine rote', 'no red') },
  { value: 'firstR', label: L('die erste ist rot', 'the first is red') },
  { value: 'custom', label: L('selbst antippen', 'tap your own') },
];

/** Weich gleitender Wert. */
class Glide {
  private from: number;
  private to: number;
  private t0 = 0;
  private ms = 0;
  constructor(
    v: number,
    private readonly reduced: boolean,
  ) {
    this.from = v;
    this.to = v;
  }
  at(now: number): number {
    if (this.ms <= 0) return this.to;
    const u = clamp((now - this.t0) / this.ms, 0, 1);
    return this.from + (this.to - this.from) * ease.inOutCubic(u);
  }
  busy(now: number): boolean {
    return this.ms > 0 && now < this.t0 + this.ms;
  }
  go(to: number, ms = 500): void {
    if (to === this.to) return;
    const now = performance.now();
    this.from = this.at(now);
    this.to = to;
    this.t0 = now;
    this.ms = this.reduced ? 0 : ms;
  }
  snap(v: number): void {
    this.from = this.to = v;
    this.ms = 0;
  }
}

interface NodeGeo {
  node: TreeNode;
  x: number;
  y: number;
  depth: number;
  parent: NodeGeo | null;
}

/**
 * Mehrstufige Zufallsexperimente: Ziehen aus einer Urne mit oder ohne
 * Zurücklegen. Das Baumdiagramm wächst Stufe für Stufe, die Äste tragen
 * Brüche, Pfade und Ereignisse leuchten auf (1. und 2. Pfadregel). Ziehen
 * einzeln (Kugeln fliegen aus der Urne) oder hundertfach – die relativen
 * Häufigkeiten nähern sich den Wahrscheinlichkeiten.
 */
export default defineSimulation({
  id: 'baumdiagramm',
  dragHint: false,
  layout: { aspect: 1.6, aspectNarrow: 0.72 },
  groups: [
    { id: 'urn', label: L('Urne', 'Urn') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    { key: 'r', type: 'number', group: 'urn', label: L('rote Kugeln', 'red balls'), min: 0, max: 8, step: 1, default: 3 },
    { key: 'b', type: 'number', group: 'urn', label: L('blaue Kugeln', 'blue balls'), min: 0, max: 8, step: 1, default: 4 },
    { key: 'g', type: 'number', group: 'urn', label: L('grüne Kugeln', 'green balls'), min: 0, max: 6, step: 1, default: 0 },
    { key: 'rep', type: 'boolean', label: L('mit Zurücklegen', 'with replacement'), default: false },
    { key: 'n', type: 'number', label: L('Anzahl der Züge', 'Number of draws'), min: 1, max: 3, step: 1, default: 2, help: L('Mit drei Farben höchstens zwei Züge.', 'With three colours at most two draws.') },
    { key: 'ev', type: 'choice', label: L('Ereignis', 'Event'), options: EVENTS, default: 'none' },
    { key: 'sel', type: 'text', label: L('Gewählte Pfade', 'Selected paths'), default: '', maxLength: 60, placeholder: L('z. B. rb, br', 'e.g. rb, br'), visibleIf: (v) => v.ev === 'custom', help: L('Pfade im Baum antippen; r = rot, b = blau, g = grün.', 'Tap paths in the tree; r = red, b = blue, g = green.') },
    {
      key: 'num',
      type: 'choice',
      group: 'view',
      label: L('Wahrscheinlichkeiten als', 'Probabilities as'),
      options: [
        { value: 'frac', label: L('Bruch', 'fraction') },
        { value: 'dec', label: L('Dezimalzahl', 'decimal') },
        { value: 'pct', label: L('Prozent', 'percent') },
      ],
      default: 'frac',
    },
    { key: 'show', type: 'boolean', group: 'view', label: L('Wahrscheinlichkeiten anzeigen', 'Show probabilities'), default: true },
  ],
  actions: [
    { id: 'draw', label: L('Einmal ziehen', 'Draw once'), primary: true },
    { id: 'many', label: L('100-mal ziehen', 'Draw 100 times') },
    { id: 'clear', label: L('Zähler löschen', 'Clear counts') },
  ],
  readouts: [
    { key: 'path', label: L('Pfad (1. Pfadregel)', 'Path (1st path rule)'), spoiler: true },
    { key: 'ev', label: L('Ereignis (2. Pfadregel)', 'Event (2nd path rule)'), spoiler: true },
    { key: 'sim', label: L('Simulation', 'Simulation') },
  ],
  presets: [
    { id: 'start', label: L('3 rote, 4 blaue, ohne Zurücklegen', '3 red, 4 blue, without replacement'), values: {} },
    { id: 'rep', label: L('Mit Zurücklegen', 'With replacement'), values: { rep: true } },
    { id: 'same', label: L('Gleiche Farbe (2. Pfadregel)', 'Same colour (2nd path rule)'), values: { ev: 'same' } },
    { id: 'min', label: L('Mindestens eine rote: Gegenereignis', 'At least one red: complement'), values: { n: 3, ev: 'minR' } },
    { id: 'three', label: L('Drei Farben', 'Three colours'), values: { r: 2, b: 3, g: 1, ev: 'diff' } },
    { id: 'small', label: L('Kleine Urne: 2 rote, 1 blaue', 'Small urn: 2 red, 1 blue'), values: { r: 2, b: 1, n: 3 } },
  ],
  strings: {
    de: { canvas: 'Urne mit roten, blauen und grünen Kugeln und daneben das Baumdiagramm mit Wahrscheinlichkeiten an den Ästen; Pfade antippbar, Ziehen wird animiert' },
    en: { canvas: 'Urn with red, blue and green balls and next to it the tree diagram with probabilities on its branches; paths can be tapped, draws are animated' },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const lang = ctx.lang;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const tt = (de: string, en: string) => (lang === 'de' ? de : en);
    const alpha = (c: string, a: number) => shade(c, 0, a);
    const font = (w: number, s: number) => `${w} ${s}px ${ctx.theme.font}`;

    /* ---------------- Zustand ---------------- */
    const urn = (): Urn => ({ r: p.r, b: p.b, g: p.g });
    const stagesCap = () => (urnColors(urn()).length > 2 ? 2 : 3);
    const stages = () => {
      const u = urn();
      const cap = Math.min(p.n, stagesCap());
      return p.rep ? cap : Math.max(1, Math.min(cap, urnTotal(u)));
    };
    let tree: TreeNode = buildTree(urn(), stages(), p.rep);
    let leafList: TreeNode[] = leaves(tree);
    let structKey = '';
    let growStart = performance.now() + (reduced ? -1e6 : 120);
    let now = performance.now();
    let hoverPath: string | null = null;
    let pickPath: string | null = null;
    /** Zähler der Simulation je Pfad. */
    let counts = new Map<string, number>();
    let total = 0;
    const bars = new Map<string, Glide>();
    let draw: { path: string; t0: number } | null = null;
    const STEP_MS = 650;
    let burst = -1e9;
    let seed = 12345;
    const rnd = () => {
      // kleiner, schneller Zufallsgenerator (mulberry32)
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    seed = (Date.now() & 0xffff) * 7919;

    function rebuild(): void {
      tree = buildTree(urn(), stages(), p.rep);
      leafList = leaves(tree);
      const key = `${urnColors(urn()).join('')}|${stages()}|${p.rep}`;
      if (key !== structKey) {
        if (structKey) growStart = now + (reduced ? -1e6 : 60);
        structKey = key;
      }
    }

    /* ---------------- Farben, Zahlen ---------------- */
    const ballColor = (c: Color) => (c === 'r' ? ctx.theme.series[1]! : c === 'b' ? ctx.theme.series[0]! : ctx.theme.series[2]!);
    const EV = () => ctx.theme.series[4]!;
    const cardBg = () => (ctx.theme.dark ? shade(ctx.theme.bg, 0.06) : '#ffffff');
    const sel = () => parseSel(p.sel, leafList.map((l) => l.path));
    const inEv = (path: string) => inEvent(p.ev as EventId, path, sel());
    function numText(f: Frac | { n: number; d: number }, reduce = true): string {
      const v = f.n / f.d;
      if (p.num === 'dec') return fmt.num(v, 3);
      if (p.num === 'pct') return `${fmt.num(v * 100, 1)} %`;
      const r = reduce ? frac(f.n, f.d) : f;
      return r.d === 1 ? String(r.n) : `${r.n}/${r.d}`;
    }

    /* ---------------- Aufteilung ---------------- */
    function regions(): { urn: Rect; tree: Rect; wide: boolean } {
      const W = surface.width;
      const H = surface.height;
      const wide = W >= 640 || W >= H * 1.3;
      if (wide) {
        const uw = Math.round(clamp(W * 0.25, 170, 250));
        return { wide, urn: { x: 6, y: 6, w: uw, h: H - 12 }, tree: { x: uw + 14, y: 6, w: W - uw - 20, h: H - 12 } };
      }
      const uh = Math.round(clamp(H * 0.3, 130, 190));
      return { wide, urn: { x: 4, y: 4, w: W - 8, h: uh }, tree: { x: 4, y: uh + 12, w: W - 8, h: H - uh - 16 } };
    }

    function card(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 18;
      g.shadowOffsetY = 4;
      roundRect(g, r.x, r.y, r.w, r.h, 14);
      const grad = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      grad.addColorStop(0, theme.dark ? shade(theme.bg, 0.075) : '#ffffff');
      grad.addColorStop(1, theme.dark ? shade(theme.bg, 0.035) : shade(theme.bg, -0.018));
      g.fillStyle = grad;
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = alpha(theme.text, theme.dark ? 0.1 : 0.07);
      g.stroke();
      g.restore();
    }

    /** Glänzende Kugel. */
    function ball(x: number, y: number, r: number, c: Color, a = 1): void {
      if (r <= 0.3) return;
      const g = surface.g;
      const col = ballColor(c);
      g.save();
      g.globalAlpha *= a;
      g.shadowColor = 'rgba(0,0,0,0.25)';
      g.shadowBlur = r * 0.6;
      g.shadowOffsetY = r * 0.18;
      const grad = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.08, x, y, r);
      grad.addColorStop(0, shade(col, 0.55));
      grad.addColorStop(0.45, col);
      grad.addColorStop(1, shade(col, -0.35));
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fillStyle = grad;
      g.fill();
      g.restore();
    }

    /* ---------------- Urne ---------------- */
    interface UrnGeo {
      jar: Rect;
      r: number;
      slots: { x: number; y: number }[];
      tray: Rect;
    }
    function urnGeo(): UrnGeo {
      const R = regions().urn;
      const wide = regions().wide;
      const jarW = wide ? R.w - 40 : Math.min(R.w * 0.42, 190);
      const jarH = wide ? Math.min(R.h * 0.42, jarW * 1.05) : R.h - 74;
      const jar = { x: R.x + (wide ? 20 : 16), y: R.y + 64, w: jarW, h: jarH };
      const n = Math.max(1, urnTotal(urn()));
      // Kugeln in Reihen von unten nach oben
      const cols = Math.max(3, Math.ceil(Math.sqrt(n * (jar.w / jar.h)) + 0.5));
      const r = Math.min((jar.w - 16) / cols / 2.1, 15);
      const slots: { x: number; y: number }[] = [];
      for (let i = 0; i < 24; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const off = row % 2 ? r * 0.9 : 0;
        slots.push({ x: jar.x + 8 + r + off + col * r * 2.1, y: jar.y + jar.h - 8 - r - row * r * 1.85 });
      }
      const tray = wide ? { x: R.x + 14, y: jar.y + jar.h + 44, w: R.w - 28, h: 54 } : { x: jar.x + jar.w + 20, y: R.y + 64, w: R.w - jar.w - 56, h: 54 };
      return { jar, r, slots, tray };
    }

    /** Kugeln der Urne in fester Reihenfolge (rot, blau, grün). */
    function urnBalls(u: Urn): Color[] {
      return [...Array<Color>(u.r).fill('r'), ...Array<Color>(u.b).fill('b'), ...Array<Color>(u.g).fill('g')];
    }

    function drawUrn(): void {
      const R = regions().urn;
      const theme = ctx.theme;
      const g = surface.g;
      card(R);
      text(g, tt('Urne', 'Urn'), R.x + 14, R.y + 20, { font: font(800, 14), color: theme.text, align: 'left' });
      const u = urn();
      const tot = urnTotal(u);
      text(g, `${tot} ${tot === 1 ? tt('Kugel', 'ball') : tt('Kugeln', 'balls')} · ${p.rep ? tt('mit Zurücklegen', 'with replacement') : tt('ohne Zurücklegen', 'without replacement')}`, R.x + 14, R.y + 38, { font: font(600, 11), color: theme.muted, align: 'left' });
      const G0 = urnGeo();
      const { jar, r, slots, tray } = G0;
      // Glas
      g.save();
      g.beginPath();
      const neck = jar.w * 0.16;
      g.moveTo(jar.x + neck, jar.y - 10);
      g.lineTo(jar.x + jar.w - neck, jar.y - 10);
      g.quadraticCurveTo(jar.x + jar.w - neck + 2, jar.y + 6, jar.x + jar.w, jar.y + 22);
      g.lineTo(jar.x + jar.w, jar.y + jar.h - 14);
      g.quadraticCurveTo(jar.x + jar.w, jar.y + jar.h, jar.x + jar.w - 14, jar.y + jar.h);
      g.lineTo(jar.x + 14, jar.y + jar.h);
      g.quadraticCurveTo(jar.x, jar.y + jar.h, jar.x, jar.y + jar.h - 14);
      g.lineTo(jar.x, jar.y + 22);
      g.quadraticCurveTo(jar.x + neck - 2, jar.y + 6, jar.x + neck, jar.y - 10);
      g.closePath();
      const glass = g.createLinearGradient(jar.x, 0, jar.x + jar.w, 0);
      glass.addColorStop(0, alpha(theme.series[5]!, theme.dark ? 0.16 : 0.1));
      glass.addColorStop(0.5, alpha(theme.series[5]!, theme.dark ? 0.06 : 0.03));
      glass.addColorStop(1, alpha(theme.series[5]!, theme.dark ? 0.16 : 0.1));
      g.fillStyle = glass;
      g.fill();
      g.strokeStyle = alpha(theme.text, theme.dark ? 0.35 : 0.3);
      g.lineWidth = 1.8;
      g.stroke();
      g.restore();
      // Kugeln: während des Ziehens fehlen die schon gezogenen (ohne Zurücklegen)
      const drawn = currentDrawn();
      const shown = draw && !p.rep ? urnAfter(u, drawn.path.slice(0, drawn.k), false) : u;
      const list = urnBalls(shown);
      const growU = reduced ? 1 : clamp((now - growStart + 200) / 500, 0, 1);
      list.slice(0, slots.length).forEach((c, i) => {
        const s = slots[i]!;
        const pop = ease.outBack(clamp(growU * 1.4 - i * 0.03, 0, 1));
        ball(s.x, s.y, r * pop, c);
      });
      // Glanz auf dem Glas
      g.save();
      g.globalAlpha = theme.dark ? 0.12 : 0.35;
      g.fillStyle = '#ffffff';
      roundRect(g, jar.x + 6, jar.y + 26, 6, jar.h * 0.55, 3);
      g.fill();
      g.restore();
      if (tot === 0) text(g, tt('Urne leer', 'Urn empty'), jar.x + jar.w / 2, jar.y + jar.h / 2, { font: font(700, 12), color: theme.muted });
      // Ablage für gezogene Kugeln
      roundRect(g, tray.x, tray.y, tray.w, tray.h, 12);
      g.fillStyle = alpha(theme.text, theme.dark ? 0.06 : 0.04);
      g.fill();
      text(g, tt('gezogen', 'drawn'), tray.x + 10, tray.y + 12, { font: font(700, 10.5), color: theme.muted, align: 'left' });
      const st = stages();
      const tr = Math.min(16, (tray.w - 20) / st / 2.6);
      for (let i = 0; i < st; i++) {
        const sx = tray.x + tray.w / 2 + (i - (st - 1) / 2) * tr * 2.6;
        const sy = tray.y + tray.h / 2 + 7;
        g.save();
        g.setLineDash([3, 3]);
        g.strokeStyle = alpha(theme.text, 0.2);
        g.beginPath();
        g.arc(sx, sy, tr, 0, Math.PI * 2);
        g.stroke();
        g.restore();
        if (draw) {
          const t = (now - draw.t0) / STEP_MS - i;
          if (t > 0 && i < draw.path.length) {
            const u1 = ease.inOutCubic(clamp(t, 0, 1));
            const c = draw.path[i] as Color;
            // Startpunkt: oben aus der Urne
            const fx = jar.x + jar.w / 2;
            const fy = jar.y - 4;
            const x = lerp(fx, sx, u1);
            const y = lerp(fy, sy, u1) - Math.sin(u1 * Math.PI) * 40;
            const fade = 1 - clamp(((now - draw.t0) / STEP_MS - draw.path.length - 1.2) / 0.5, 0, 1);
            ball(x, y, lerp(r, tr, u1), c, fade);
          }
        }
      }
      // Zähler der Simulation
      const wide = regions().wide;
      if (wide) {
        let y = tray.y + tray.h + 26;
        text(g, tt('Simulation', 'Simulation'), R.x + 14, y, { font: font(800, 12.5), color: theme.text, align: 'left' });
        y += 20;
        const pulse = reduced ? 0 : Math.max(0, 1 - (now - burst) / 600);
        text(g, `${total}`, R.x + 14, y + 4, { font: font(800, 22 + pulse * 6), color: theme.text, align: 'left', baseline: 'middle' });
        g.font = font(800, 22);
        const w = g.measureText(`${total}`).width;
        text(g, total === 1 ? tt('Durchgang', 'run') : tt('Durchgänge', 'runs'), R.x + 20 + w, y + 6, { font: font(600, 12), color: theme.muted, align: 'left' });
        y += 26;
        if (p.ev !== 'none' && total > 0) {
          const hits = leafList.filter((l) => inEv(l.path)).reduce((s, l) => s + (counts.get(l.path) ?? 0), 0);
          const msg = `${tt('Ereignis', 'event')}: ${hits} = ${fmt.num((hits / total) * 100, 1)} %`;
          text(g, msg, R.x + 14, y, { font: font(700, 12), color: EV(), align: 'left' });
        } else if (total === 0) {
          const lines = wrapText(tt('Ziehe einmal oder hundertmal: Neben jedem Ergebnis wächst ein Balken mit der relativen Häufigkeit.', 'Draw once or a hundred times: a bar with the relative frequency grows next to each outcome.'), R.w - 28, font(550, 11.5));
          lines.slice(0, 4).forEach((l, i) => text(g, l, R.x + 14, y + i * 15, { font: font(550, 11.5), color: theme.muted, align: 'left' }));
        }
      }
    }

    function wrapText(value: string, maxW: number, f: string): string[] {
      const g = surface.g;
      g.font = f;
      const rows: string[] = [];
      let cur = '';
      for (const w of value.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          rows.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) rows.push(cur);
      return rows;
    }

    /** Wie weit ist die laufende Ziehung (Anzahl schon abgelegter Kugeln)? */
    function currentDrawn(): { path: string; k: number } {
      if (!draw) return { path: '', k: 0 };
      const k = clamp(Math.floor((now - draw.t0) / STEP_MS + 0.5), 0, draw.path.length);
      return { path: draw.path, k };
    }

    /* ---------------- Baum ---------------- */
    interface TreeGeo {
      nodes: NodeGeo[];
      leafRows: { path: string; y: number; x: number }[];
      infoX: number;
      rowH: number;
      R: Rect;
      bottom: number;
    }
    function treeGeo(): TreeGeo {
      const R = regions().tree;
      const nL = leafList.length;
      const st = stages();
      const narrow = R.w < 460;
      const top = R.y + 50;
      const bottom = R.y + R.h - (p.ev !== 'none' || pickPath || hoverPath ? 58 : 14);
      const rowH = (bottom - top) / Math.max(1, nL);
      const infoW = narrow ? Math.min(150, R.w * 0.42) : Math.min(240, R.w * 0.38);
      const x0 = R.x + 22;
      const x1 = R.x + R.w - infoW - 12;
      const colW = (x1 - x0) / st;
      const nodes: NodeGeo[] = [];
      const leafRows: TreeGeo['leafRows'] = [];
      let li = 0;
      const place = (node: TreeNode, depth: number, parent: NodeGeo | null): NodeGeo => {
        const ng: NodeGeo = { node, x: x0 + depth * colW, y: 0, depth, parent };
        nodes.push(ng);
        if (!node.children.length) {
          ng.y = top + (li + 0.5) * rowH;
          li++;
          leafRows.push({ path: node.path, y: ng.y, x: ng.x });
        } else {
          const kids = node.children.map((c) => place(c, depth + 1, ng));
          ng.y = (kids[0]!.y + kids[kids.length - 1]!.y) / 2;
        }
        return ng;
      };
      place(tree, 0, null);
      return { nodes, leafRows, infoX: x1 + 16, rowH, R, bottom };
    }

    function growOf(depth: number): number {
      if (reduced) return 1;
      return ease.inOutCubic(clamp((now - growStart - (depth - 1) * 380) / 520, 0, 1));
    }

    /** Ist der Ast zu `path` Teil der laufenden Ziehung (wie weit)? */
    function drawGlow(path: string): number {
      if (!draw) return 0;
      if (!draw.path.startsWith(path)) return 0;
      const t = (now - draw.t0) / STEP_MS - (path.length - 1);
      const fade = 1 - clamp(((now - draw.t0) / STEP_MS - draw.path.length - 1.2) / 0.5, 0, 1);
      return clamp(t, 0, 1) * fade;
    }

    function drawTree(): void {
      const theme = ctx.theme;
      const g = surface.g;
      const R = regions().tree;
      card(R);
      const tg = treeGeo();
      const narrow = R.w < 460;
      text(g, tt('Baumdiagramm', 'Tree diagram'), R.x + 14, R.y + 20, { font: font(800, 14), color: theme.text, align: 'left' });
      const st = stages();
      // Stufen-Überschriften
      for (let d = 1; d <= st; d++) {
        const xs = tg.nodes.find((n) => n.depth === d)?.x;
        if (xs === undefined) continue;
        text(g, narrow ? `${d}.` : tt(`${d}. Zug`, `draw ${d}`), xs, R.y + 40, { font: font(700, 11), color: theme.muted });
      }
      if (urnTotal(urn()) === 0) {
        text(g, tt('Lege Kugeln in die Urne.', 'Put balls into the urn.'), R.x + R.w / 2, R.y + R.h / 2, { font: font(600, 13), color: theme.muted });
        return;
      }
      const focus = hoverPath ?? pickPath;
      const evOn = p.ev !== 'none';
      // Äste
      for (const n of tg.nodes) {
        if (!n.parent) continue;
        const gr = growOf(n.depth);
        if (gr <= 0) continue;
        const a = n.parent;
        const c = n.node.path[n.node.path.length - 1] as Color;
        const col = ballColor(c);
        const leafPaths = leafList.map((l) => l.path).filter((lp) => lp.startsWith(n.node.path));
        const isFocus = focus !== null && focus.startsWith(n.node.path);
        const isEv = evOn && leafPaths.some((lp) => inEv(lp));
        const glow = drawGlow(n.node.path);
        const bx = lerp(a.x, n.x, gr);
        const by = lerp(a.y, n.y, gr);
        const mx = a.x + (n.x - a.x) * 0.35;
        g.save();
        g.lineCap = 'round';
        const w0 = 1.6 + 4 * fval(frac(n.node.edge.n, n.node.edge.d));
        if (isEv || isFocus || glow > 0) {
          g.strokeStyle = alpha(isFocus || glow > 0 ? theme.text : EV(), theme.dark ? 0.3 : 0.18);
          g.lineWidth = w0 + 8;
          g.beginPath();
          g.moveTo(a.x, a.y);
          g.bezierCurveTo(mx, a.y, mx, by, bx, by);
          g.stroke();
        }
        g.strokeStyle = alpha(col, evOn && !isEv && !isFocus ? 0.35 : 0.85);
        g.lineWidth = w0 + glow * 2;
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.bezierCurveTo(mx, a.y, mx, by, bx, by);
        g.stroke();
        g.restore();
        // Bruch am Ast
        if (gr > 0.9 && p.show) {
          const lx = a.x + (n.x - a.x) * 0.55;
          const ly = a.y + (n.y - a.y) * 0.62;
          const lab = numText(n.node.edge, false);
          const fs = narrow || tg.rowH < 22 ? 10.5 : 12;
          g.font = font(750, fs);
          const lw = g.measureText(lab).width + 10;
          g.save();
          roundRect(g, lx - lw / 2, ly - fs * 0.75, lw, fs * 1.5, fs * 0.75);
          g.fillStyle = alpha(cardBg(), 0.94);
          g.fill();
          g.strokeStyle = alpha(col, 0.5);
          g.lineWidth = 1;
          g.stroke();
          g.restore();
          text(g, lab, lx, ly + 0.5, { font: font(750, fs), color: shade(col, theme.dark ? 0.25 : -0.2) });
        }
      }
      // Knoten
      const nodeR = clamp(tg.rowH * 0.26, 5, 11);
      for (const n of tg.nodes) {
        if (!n.parent) {
          g.fillStyle = theme.text;
          g.beginPath();
          g.arc(n.x, n.y, 4, 0, Math.PI * 2);
          g.fill();
          continue;
        }
        const gr = growOf(n.depth);
        if (gr < 0.85) continue;
        const c = n.node.path[n.node.path.length - 1] as Color;
        ball(n.x, n.y, nodeR * ease.outBack(clamp((gr - 0.85) / 0.15, 0, 1)), c);
      }
      // Ergebnisse rechts: Pfad, Wahrscheinlichkeit, Häufigkeit
      const lastGrow = growOf(st);
      if (lastGrow < 0.9) return;
      for (const row of tg.leafRows) {
        const leaf = leafList.find((l) => l.path === row.path)!;
        const isEv = evOn && inEv(row.path);
        const isFocus = focus === row.path;
        const h = Math.min(tg.rowH - 3, 28);
        const x = tg.infoX;
        const w = R.x + R.w - 10 - x;
        if (isEv || isFocus) {
          g.save();
          roundRect(g, x - 6, row.y - h / 2, w + 2, h, 8);
          g.fillStyle = isFocus ? alpha(theme.text, theme.dark ? 0.12 : 0.07) : alpha(EV(), theme.dark ? 0.22 : 0.12);
          g.fill();
          if (isEv) {
            g.strokeStyle = alpha(EV(), 0.6);
            g.lineWidth = 1.2;
            g.stroke();
          }
          g.restore();
        }
        const br = clamp(h * 0.24, 3.5, 6.5);
        row.path.split('').forEach((c, i) => ball(x + br + i * br * 2.3, row.y, br, c as Color));
        const px = x + br * 2.3 * row.path.length + 6;
        const fs = narrow || tg.rowH < 20 ? 10.5 : 12;
        const prob = p.show ? numText(leaf.prob) : '?';
        text(g, prob, px, row.y + 0.5, { font: font(800, fs), color: isEv ? EV() : theme.text, align: 'left' });
        // Häufigkeit als Balken
        if (total > 0) {
          const bx0 = px + (narrow ? 44 : 58);
          const bw = Math.max(10, x + w - bx0 - 6);
          const rel = bars.get(row.path)?.at(now) ?? 0;
          g.save();
          roundRect(g, bx0, row.y - 4, bw, 8, 4);
          g.fillStyle = alpha(theme.text, 0.07);
          g.fill();
          roundRect(g, bx0, row.y - 4, Math.max(0, bw * rel), 8, 4);
          g.fillStyle = alpha(isEv ? EV() : theme.series[5]!, 0.8);
          g.fill();
          // Markierung: Wahrscheinlichkeit
          const pv = fval(leaf.prob);
          g.strokeStyle = theme.text;
          g.lineWidth = 1.6;
          g.beginPath();
          g.moveTo(bx0 + bw * pv, row.y - 7);
          g.lineTo(bx0 + bw * pv, row.y + 7);
          g.stroke();
          g.restore();
        }
      }
      // Info unten: Pfad oder Ereignis
      drawInfo(tg);
    }

    function drawInfo(tg: TreeGeo): void {
      const R = tg.R;
      const theme = ctx.theme;
      const g = surface.g;
      const focus = hoverPath ?? pickPath;
      const y = R.y + R.h - 30;
      const x = R.x + 14;
      const maxW = R.w - 28;
      let line = '';
      let color = theme.text;
      if (focus && leafList.some((l) => l.path === focus)) {
        line = `P(${pathName(focus)}) = ${pathFormula(focus)}`;
      } else if (p.ev !== 'none') {
        const parts = leafList.filter((l) => inEv(l.path));
        const sum = parts.reduce((s, l) => fadd(s, l.prob), ZERO);
        const label = EVENTS.find((e) => e.value === p.ev)!.label[lang];
        const terms = parts.map((l) => numText(l.prob));
        const short = terms.length > 4 ? [terms[0], terms[1], '…', terms[terms.length - 1]] : terms;
        line = parts.length ? `P(${label}) = ${p.show ? `${short.join(' + ')} = ${numText(sum)}` : '?'}` : `P(${label}) = 0`;
        if (p.show && p.ev === 'minR' && parts.length > 2) {
          const none = leafList.filter((l) => !inEv(l.path)).reduce((s2, l) => fadd(s2, l.prob), ZERO);
          line = `P(${label}) = 1 − P(${tt('keine rote', 'no red')}) = 1 − ${numText(none)} = ${numText(sum)}`;
        }
        color = EV();
      }
      if (!line) return;
      let fs = 13;
      g.font = font(750, fs);
      while (fs > 10 && g.measureText(line).width > maxW - 16) {
        fs -= 0.5;
        g.font = font(750, fs);
      }
      g.save();
      roundRect(g, x - 4, y - 16, Math.min(maxW + 8, g.measureText(line).width + 24), 32, 10);
      g.fillStyle = alpha(color === theme.text ? theme.series[0]! : color, theme.dark ? 0.16 : 0.08);
      g.fill();
      g.restore();
      text(g, line, x + 8, y + 0.5, { font: font(750, fs), color, align: 'left' });
    }

    const NAME: Record<Color, { de: string; en: string }> = { r: L('r', 'r'), b: L('b', 'b'), g: L('g', 'g') };
    const pathName = (path: string) => path.split('').map((c) => NAME[c as Color][lang]).join('');
    function pathFormula(path: string): string {
      const edges = pathEdges(urn(), path, p.rep);
      if (!p.show) return '?';
      const prod = rawProduct(edges);
      const red = frac(prod.n, prod.d);
      if (p.num !== 'frac') return `${edges.map((e) => numText(e, false)).join(' · ')} = ${numText(red)}`;
      const raw = edges.length > 1 ? ` = ${prod.n}/${prod.d}` : '';
      const reducedTxt = red.n !== prod.n ? ` = ${numText(red)}` : '';
      return `${edges.map((e) => `${e.n}/${e.d}`).join(' · ')}${raw}${reducedTxt}`;
    }

    /* ---------------- Zeiger ---------------- */
    function leafAt(px: number, py: number): string | null {
      const R = regions().tree;
      if (px < R.x || px > R.x + R.w || py < R.y || py > R.y + R.h) return null;
      const tg = treeGeo();
      if (growOf(stages()) < 0.9) return null;
      let best: string | null = null;
      let bd = Infinity;
      for (const row of tg.leafRows) {
        const d = Math.abs(py - row.y);
        if (d < tg.rowH / 2 && px > row.x - 30 && d < bd) {
          bd = d;
          best = row.path;
        }
      }
      return best;
    }

    surface.addTarget({
      contains: (px, py) => {
        const R = regions().tree;
        return px >= R.x && px <= R.x + R.w && py >= R.y && py <= R.y + R.h;
      },
      pointerDown: (pt) => {
        const lp = leafAt(pt.px, pt.py);
        if (!lp) {
          if (pickPath) {
            pickPath = null;
            updateReadouts();
            ctx.requestRender();
          }
          return true;
        }
        if (p.ev === 'custom' && !ctx.locked) {
          const cur = sel();
          const next = cur.includes(lp) ? cur.filter((s) => s !== lp) : [...cur, lp];
          ctx.set({ sel: next.join(', ') });
        }
        pickPath = pickPath === lp ? null : lp;
        updateReadouts();
        ctx.requestRender();
        return true;
      },
      pointerMove: () => undefined,
      pointerUp: () => undefined,
      hover: (pt) => {
        const lp = pt ? leafAt(pt.px, pt.py) : null;
        surface.setCursor(lp ? 'pointer' : '');
        if (lp !== hoverPath) {
          hoverPath = lp;
          updateReadouts();
          ctx.requestRender();
        }
      },
      wheel: () => false,
    });

    /* ---------------- Ergebnisse ---------------- */
    function updateReadouts(): void {
      const focus = hoverPath ?? pickPath ?? leafList[0]?.path ?? null;
      ctx.readout('path', focus ? `P(${pathName(focus)}) = ${pathFormula(focus)}` : null);
      if (p.ev !== 'none') {
        const parts = leafList.filter((l) => inEv(l.path));
        const sum = eventProb(tree, p.ev as EventId, sel());
        ctx.readout('ev', parts.length ? `${parts.map((l) => `P(${pathName(l.path)})`).join(' + ')} = ${parts.map((l) => numText(l.prob)).join(' + ')} = ${numText(sum)}` : '0');
      } else ctx.readout('ev', null);
      if (total > 0) {
        const lines = leafList.map((l) => `${pathName(l.path)}: ${counts.get(l.path) ?? 0}`).join(' · ');
        ctx.readout('sim', `${total} ${tt('Durchgänge', 'runs')} – ${lines}`);
      } else ctx.readout('sim', tt('noch nicht gezogen', 'no draws yet'));
    }

    function syncBars(ms = 500): void {
      for (const l of leafList) {
        if (!bars.has(l.path)) bars.set(l.path, new Glide(0, reduced));
        bars.get(l.path)!.go(total > 0 ? (counts.get(l.path) ?? 0) / total : 0, ms);
      }
    }

    function record(path: string): void {
      counts.set(path, (counts.get(path) ?? 0) + 1);
      total++;
    }

    rebuild();
    updateReadouts();

    return {
      update(changed, source) {
        now = performance.now();
        const structural = ['r', 'b', 'g', 'rep', 'n'].some((k) => changed.has(k));
        if (structural) {
          counts = new Map();
          total = 0;
          bars.clear();
          draw = null;
          pickPath = null;
        }
        if (changed.has('ev') && source === 'input' && p.ev !== 'custom' && p.sel) ctx.set({ sel: '' });
        rebuild();
        syncBars(0);
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        now = performance.now();
        if (ctx.locked && id !== 'clear') return;
        if (urnTotal(urn()) === 0) return;
        if (id === 'draw') {
          const path = drawPath(urn(), stages(), p.rep, rnd);
          if (reduced) {
            record(path);
            syncBars(0);
          } else {
            if (draw) {
              record(draw.path);
            }
            draw = { path, t0: now };
          }
          pickPath = null;
        } else if (id === 'many') {
          if (draw) {
            record(draw.path);
            draw = null;
          }
          for (let i = 0; i < 100; i++) record(drawPath(urn(), stages(), p.rep, rnd));
          burst = now;
          syncBars(700);
        } else if (id === 'clear') {
          counts = new Map();
          total = 0;
          draw = null;
          syncBars(400);
        }
        updateReadouts();
        ctx.requestRender();
      },
      render() {
        now = performance.now();
        if (draw && now - draw.t0 > STEP_MS * (draw.path.length + 1.8)) {
          record(draw.path);
          draw = null;
          syncBars(500);
          updateReadouts();
        }
        surface.begin();
        drawUrn();
        drawTree();
        const busy = draw !== null || [...bars.values()].some((b) => b.busy(now)) || (!reduced && now - growStart < 380 * stages() + 900) || now - burst < 700;
        if (busy) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
