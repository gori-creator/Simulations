import { defineSimulation, ease, prefersReducedMotion, roundRect, shade, Surface, text, type Rect } from '../../../sim-core';
import { CONTEXT_DATA, eventCells, eventCount, independent, reduce, table, treeBranches, vennGeometry, type Cells, type EventId } from './model';

const L = (de: string, en: string) => ({ de, en });
type Loc = { de: string; en: string };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type Ctx = 'pet' | 'club' | 'abc';

const CTX_TEXT: Record<Ctx, { title: Loc; A: Loc; B: Loc }> = {
  pet: { title: L('Klasse 9a', 'Class 9a'), A: L('Haustier', 'pet'), B: L('Geschwister', 'siblings') },
  club: { title: L('200 Jugendliche', '200 teenagers'), A: L('Sportverein', 'sports club'), B: L('Instrument', 'instrument') },
  abc: { title: L('Ereignisse A und B', 'Events A and B'), A: L('A', 'A'), B: L('B', 'B') },
};

const EVENTS: { value: EventId; label: Loc; sym: string }[] = [
  { value: 'none', label: L('keins', 'none'), sym: '' },
  { value: 'A', label: L('A', 'A'), sym: 'A' },
  { value: 'B', label: L('B', 'B'), sym: 'B' },
  { value: 'nA', label: L('nicht A (Ā)', 'not A (Ā)'), sym: 'Ā' },
  { value: 'AB', label: L('A und B (A ∩ B)', 'A and B (A ∩ B)'), sym: 'A ∩ B' },
  { value: 'AuB', label: L('A oder B (A ∪ B)', 'A or B (A ∪ B)'), sym: 'A ∪ B' },
  { value: 'AnB', label: L('A, aber nicht B', 'A but not B'), sym: 'A ∩ B̄' },
  { value: 'xor', label: L('genau eins von beiden', 'exactly one of them'), sym: '(A ∩ B̄) ∪ (Ā ∩ B)' },
  { value: 'none2', label: L('keins von beiden', 'neither'), sym: 'Ā ∩ B̄' },
];

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
  go(to: number, ms = 550): void {
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

const cellParam = <K extends string>(key: K, label: Loc, def: number) => ({ key, type: 'number' as const, group: 'data', label, min: 0, max: 99, step: 1, default: def });

/**
 * Vierfeldertafel, Baumdiagramm und flächentreues Mengendiagramm zeigen
 * dieselben Daten – synchron: Wer über eine Zelle fährt, sieht dieselbe
 * Teilmenge in allen drei Darstellungen. Ereignisse (Schnitt, Vereinigung,
 * Gegenereignis …) leuchten überall auf, der Additionssatz rechnet mit.
 */
export default defineSimulation({
  id: 'vierfeldertafel',
  dragHint: false,
  layout: { aspect: 1.6, aspectNarrow: 0.5 },
  groups: [
    { id: 'data', label: L('Anzahlen', 'Counts') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'ctx',
      type: 'choice',
      label: L('Beispiel', 'Example'),
      options: [
        { value: 'pet', label: L('Haustier und Geschwister', 'Pet and siblings') },
        { value: 'club', label: L('Sportverein und Instrument', 'Sports club and instrument') },
        { value: 'abc', label: L('allgemein A und B', 'general A and B') },
      ],
      default: 'pet',
    },
    { key: 'ev', type: 'choice', label: L('Ereignis', 'Event'), options: EVENTS.map((e) => ({ value: e.value, label: e.label })), default: 'AuB' },
    cellParam('c1', L('A und B', 'A and B'), 10),
    cellParam('c2', L('A, nicht B', 'A, not B'), 4),
    cellParam('c3', L('nicht A, B', 'not A, B'), 9),
    cellParam('c4', L('weder A noch B', 'neither A nor B'), 7),
    {
      key: 'order',
      type: 'choice',
      group: 'view',
      label: L('Baum beginnt mit', 'Tree starts with'),
      options: [
        { value: 'AB', label: L('A', 'A') },
        { value: 'BA', label: L('B', 'B') },
      ],
      default: 'AB',
    },
    {
      key: 'num',
      type: 'choice',
      group: 'view',
      label: L('Darstellung', 'Show as'),
      options: [
        { value: 'abs', label: L('Anzahlen', 'counts') },
        { value: 'frac', label: L('Brüche', 'fractions') },
        { value: 'pct', label: L('Prozent', 'percent') },
      ],
      default: 'abs',
    },
    { key: 'show', type: 'boolean', group: 'view', label: L('Innere Felder anzeigen', 'Show inner cells'), default: true, help: L('Für Aufgaben ausblenden: Dann sind nur die Randsummen und einige Werte sichtbar.', 'Hide for tasks: then only the totals are visible.') },
  ],
  readouts: [
    { key: 'ev', label: L('Ereignis', 'Event'), spoiler: true },
    { key: 'add', label: L('Additionssatz', 'Addition rule'), spoiler: true },
    { key: 'cond', label: L('Bedingte Wahrscheinlichkeit', 'Conditional probability'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('A oder B: Additionssatz', 'A or B: addition rule'), values: {} },
    { id: 'both', label: L('A und B', 'A and B'), values: { ev: 'AB' } },
    { id: 'not', label: L('Gegenereignis', 'Complement'), values: { ev: 'nA' } },
    { id: 'reverse', label: L('Umgekehrter Baum', 'Reversed tree'), values: { order: 'BA', ev: 'AB' } },
    { id: 'club', label: L('200 Jugendliche in Prozent', '200 teenagers in percent'), values: { ctx: 'club', c1: 46, c2: 34, c3: 52, c4: 68, num: 'pct', ev: 'xor' } },
    { id: 'indep', label: L('Unabhängig', 'Independent'), values: { ctx: 'abc', c1: 12, c2: 18, c3: 8, c4: 12, ev: 'AB' } },
  ],
  strings: {
    de: { canvas: 'Vierfeldertafel, Mengendiagramm mit zwei Kreisen und Baumdiagramm derselben Daten; Felder und Pfade sind synchron hervorgehoben' },
    en: { canvas: 'Two-way table, Venn diagram with two circles and tree diagram of the same data; cells and paths are highlighted in sync' },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const lang = ctx.lang;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const T = (l: Loc) => l[lang];
    const tt = (de: string, en: string) => (lang === 'de' ? de : en);
    const alpha = (c: string, a: number) => shade(c, 0, a);
    const font = (w: number, s: number) => `${w} ${s}px ${ctx.theme.font}`;
    const G = (v: number) => new Glide(v, reduced);
    const cx = () => CTX_TEXT[p.ctx as Ctx];

    const cells = (): Cells => [p.c1, p.c2, p.c3, p.c4];
    const gc = [G(p.c1), G(p.c2), G(p.c3), G(p.c4)];
    const shown = (now: number): Cells => [gc[0]!.at(now), gc[1]!.at(now), gc[2]!.at(now), gc[3]!.at(now)];
    let now = performance.now();
    const introStart = now + (reduced ? -1e6 : 100);
    let hover: number | null = null;
    let lastOrder = p.order;
    let orderSwitch = -1e9;

    /* ---------------- Aufteilung ---------------- */
    function regions(): { table: Rect; venn: Rect; tree: Rect; wide: boolean } {
      const W = surface.width;
      const H = surface.height;
      const wide = W >= 640 || W >= H * 1.3;
      if (wide) {
        const lw = Math.round(W * 0.47);
        const th = Math.round((H - 12) * 0.46);
        return { wide, table: { x: 6, y: 6, w: lw, h: th }, venn: { x: 6, y: th + 14, w: lw, h: H - th - 20 }, tree: { x: lw + 14, y: 6, w: W - lw - 20, h: H - 12 } };
      }
      const th = Math.round(H * 0.3);
      const vh = Math.round(H * 0.3);
      return { wide, table: { x: 4, y: 4, w: W - 8, h: th }, venn: { x: 4, y: th + 10, w: W - 8, h: vh }, tree: { x: 4, y: th + vh + 16, w: W - 8, h: H - th - vh - 20 } };
    }

    /* ---------------- Farben, Zahlen ---------------- */
    const CA = () => ctx.theme.series[0]!;
    const CB = () => ctx.theme.series[3]!;
    const EV = () => ctx.theme.series[4]!;
    const evMask = () => eventCells(p.ev as EventId);
    const N = () => table(cells()).N;
    function val(k: number, n = N()): string {
      if (p.num === 'abs') return fmt.num(k, 0);
      if (n <= 0) return '–';
      if (p.num === 'pct') return `${fmt.num((k / n) * 100, 1)} %`;
      const r = reduce(k, n);
      return r.d === 1 ? String(r.n) : `${r.n}/${r.d}`;
    }
    /** Bedingter Anteil am Ast (ungekürzt als „k/n“ bzw. Prozent). */
    function branch(k: number, n: number): string {
      if (n <= 0) return '–';
      if (p.num === 'pct') return `${fmt.num((k / n) * 100, 1)} %`;
      return `${k}/${n}`;
    }

    function card(r: Rect, title: string): void {
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
      text(g, title, r.x + 14, r.y + 18, { font: font(800, 13), color: theme.text, align: 'left' });
    }

    /* ---------------- Vierfeldertafel ---------------- */
    interface TableGeo {
      x0: number;
      y0: number;
      cw: number;
      rh: number;
      hw: number;
    }
    function tableGeo(): TableGeo {
      const R = regions().table;
      const hw = clamp(R.w * 0.26, 70, 130);
      const cw = (R.w - 28 - hw) / 3;
            const rh2 = clamp((R.h - 62) / 3, 20, 50);
      return { x0: R.x + 14, y0: Math.max(R.y + 56, R.y + 50 + (R.h - 56 - rh2 * 3) / 2), cw, rh: rh2, hw };
    }

    function drawTable(): void {
      const R = regions().table;
      const theme = ctx.theme;
      const g = surface.g;
      card(R, tt('Vierfeldertafel', 'Two-way table'));
      text(g, T(cx().title), R.x + R.w - 14, R.y + 18, { font: font(600, 11), color: theme.muted, align: 'right' });
      const tg = tableGeo();
      const c = cells();
      const t = table(c);
      const mask = evMask();
      const colX = (j: number) => tg.x0 + tg.hw + j * tg.cw;
      const rowY = (i: number) => tg.y0 + i * tg.rh;
      // Kopfzeile
      const headSym = ['B', 'B̄', 'Σ'];
      headSym.forEach((h, j) => {
        text(g, h, colX(j) + tg.cw / 2, tg.y0 - 8, { font: font(800, 12), color: j < 2 ? CB() : theme.muted });
      });
      // Legende: was A und B bedeuten
      if (p.ctx !== 'abc') {
        const leg = `A: ${T(cx().A)} · B: ${T(cx().B)}`;
        text(g, leg, R.x + 14, R.y + 36, { font: font(600, 11), color: theme.muted, align: 'left' });
      }
      const rowsL = [T(cx().A), `${tt('nicht', 'not')} ${T(cx().A)}`, tt('gesamt', 'total')];
      const rowsSym = ['A', 'Ā', 'Σ'];
      const values = [
        [c[0], c[1], t.A],
        [c[2], c[3], t.nA],
        [t.B, t.nB, t.N],
      ];
      for (let i = 0; i < 3; i++) {
        text(g, rowsSym[i]!, tg.x0 + 4, rowY(i) + tg.rh / 2, { font: font(800, 12), color: i < 2 ? CA() : theme.muted, align: 'left' });
        if (tg.hw >= 100 && i < 2) text(g, rowsL[i]!, tg.x0 + 20, rowY(i) + tg.rh / 2, { font: font(600, 11), color: theme.muted, align: 'left' });
        for (let j = 0; j < 3; j++) {
          const x = colX(j) + 2;
          const y = rowY(i) + 2;
          const w = tg.cw - 4;
          const h = tg.rh - 4;
          const inner = i < 2 && j < 2;
          const ci = i * 2 + j;
          const isEv = inner && mask[ci];
          const isHover = inner && hover === ci;
          roundRect(g, x, y, w, h, 8);
          g.fillStyle = isEv ? alpha(EV(), theme.dark ? 0.32 : 0.18) : inner ? alpha(theme.text, theme.dark ? 0.06 : 0.035) : alpha(theme.text, theme.dark ? 0.03 : 0.015);
          g.fill();
          if (isHover || isEv) {
            g.strokeStyle = isHover ? theme.text : alpha(EV(), 0.7);
            g.lineWidth = isHover ? 2 : 1.2;
            g.stroke();
          }
          const v = values[i]![j]!;
          const hidden = inner && !p.show;
          text(g, hidden ? '?' : val(v), x + w / 2, y + h / 2 + 0.5, { font: font(inner ? 800 : 650, tg.rh < 30 ? 12 : 14), color: inner ? theme.text : theme.muted });
        }
      }
      // Trennlinie vor den Summen
      g.strokeStyle = alpha(theme.text, 0.2);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(colX(2), tg.y0);
      g.lineTo(colX(2), tg.y0 + tg.rh * 3);
      g.moveTo(colX(0), rowY(2));
      g.lineTo(colX(3), rowY(2));
      g.stroke();
    }

    /* ---------------- Mengendiagramm ---------------- */
    interface VennGeo {
      box: Rect;
      ax: number;
      bx: number;
      y: number;
      rA: number;
      rB: number;
    }
    function vennGeo(): VennGeo {
      const R = regions().venn;
      const box = { x: R.x + 14, y: R.y + 30, w: R.w - 28, h: R.h - 40 };
      const c = shown(now);
      const area = box.w * box.h * 0.62;
      const vg = vennGeometry(c, area);
      // Kreise dürfen nicht über den Rand: notfalls verkleinern
      const span = vg.rA + vg.d + vg.rB;
      const k = Math.min(1, (box.w - 24) / Math.max(1, span), (box.h - 16) / Math.max(1, 2 * Math.max(vg.rA, vg.rB)));
      const rA = vg.rA * k;
      const rB = vg.rB * k;
      const d = vg.d * k;
      // ganze Figur (linker Rand von A bis rechter Rand von B) mittig in Ω
      const left = box.x + box.w / 2 - (rA + d + rB) / 2;
      const ax = left + rA;
      return { box, ax, bx: ax + d, y: box.y + box.h / 2, rA, rB };
    }

    function drawVenn(): void {
      const R = regions().venn;
      const theme = ctx.theme;
      const g = surface.g;
      card(R, tt('Mengendiagramm', 'Venn diagram'));
      const v = vennGeo();
      const grow = reduced ? 1 : ease.outCubic(clamp((now - introStart) / 700, 0, 1));
      const { box } = v;
      // Grundmenge Ω
      roundRect(g, box.x, box.y, box.w, box.h, 10);
      g.fillStyle = alpha(theme.text, theme.dark ? 0.04 : 0.025);
      g.fill();
      g.strokeStyle = alpha(theme.text, 0.25);
      g.lineWidth = 1.2;
      g.stroke();
      text(g, 'Ω', box.x + 12, box.y + 12, { font: `italic 700 13px ${theme.mathFont}`, color: theme.muted });
      const rA = v.rA * grow;
      const rB = v.rB * grow;
      const circleA = () => {
        g.beginPath();
        g.arc(v.ax, v.y, Math.max(0.1, rA), 0, Math.PI * 2);
      };
      const circleB = () => {
        g.beginPath();
        g.arc(v.bx, v.y, Math.max(0.1, rB), 0, Math.PI * 2);
      };
      // Ereignis-Flächen über Clipping (Zelle für Zelle)
      const mask = evMask();
      const fillCell = (ci: number, color: string) => {
        g.save();
        g.beginPath();
        g.rect(box.x, box.y, box.w, box.h);
        g.clip();
        const inA = ci === 0 || ci === 1;
        const inB = ci === 0 || ci === 2;
        // in A bzw. außerhalb von A
        g.beginPath();
        if (inA) g.arc(v.ax, v.y, Math.max(0.1, rA), 0, Math.PI * 2);
        else {
          g.rect(box.x, box.y, box.w, box.h);
          g.arc(v.ax, v.y, Math.max(0.1, rA), 0, Math.PI * 2, true);
        }
        g.clip('evenodd');
        g.beginPath();
        if (inB) g.arc(v.bx, v.y, Math.max(0.1, rB), 0, Math.PI * 2);
        else {
          g.rect(box.x, box.y, box.w, box.h);
          g.arc(v.bx, v.y, Math.max(0.1, rB), 0, Math.PI * 2, true);
        }
        g.clip('evenodd');
        g.fillStyle = color;
        g.fillRect(box.x, box.y, box.w, box.h);
        g.restore();
      };
      // Grundfarben der Kreise
      g.save();
      circleA();
      g.fillStyle = alpha(CA(), theme.dark ? 0.2 : 0.14);
      g.fill();
      circleB();
      g.fillStyle = alpha(CB(), theme.dark ? 0.2 : 0.14);
      g.fill();
      g.restore();
      for (let ci = 0; ci < 4; ci++) {
        if (mask[ci]) fillCell(ci, alpha(EV(), theme.dark ? 0.42 : 0.3));
        if (hover === ci) fillCell(ci, alpha(theme.text, theme.dark ? 0.18 : 0.12));
      }
      g.save();
      g.lineWidth = 2.2;
      circleA();
      g.strokeStyle = CA();
      g.stroke();
      circleB();
      g.strokeStyle = CB();
      g.stroke();
      g.restore();
      // Beschriftungen der Kreise und Zahlen in den Teilflächen
      if (grow > 0.8 && table(cells()).N === 0) {
        text(g, tt('Noch keine Daten – stelle die Anzahlen ein.', 'No data yet – set the counts.'), box.x + box.w / 2, box.y + box.h / 2, { font: font(600, 12), color: theme.muted });
      } else if (grow > 0.8) {
        g.font = font(800, 12);
        const la = Math.max(box.x + 8 + g.measureText(T(cx().A)).width, v.ax - rA * 0.7);
        const lb = Math.min(box.x + box.w - 8 - g.measureText(T(cx().B)).width, v.bx + rB * 0.7);
        if (rA > 2) text(g, T(cx().A), la, Math.max(box.y + 12, v.y - rA * 0.85 - 2), { font: font(800, 12), color: CA(), align: 'right' });
        if (rB > 2) text(g, T(cx().B), lb, Math.max(box.y + 12, v.y - rB * 0.85 - 2), { font: font(800, 12), color: CB(), align: 'left' });
        const c = cells();
        const hidden = !p.show;
        const left = Math.min(v.ax - rA * 0.45, (v.ax - rA + Math.min(v.bx - rB, v.ax + rA)) / 2);
        const right = Math.max(v.bx + rB * 0.45, (Math.max(v.ax + rA, v.bx - rB) + v.bx + rB) / 2);
        const midX = (Math.max(v.ax - rA, v.bx - rB) + Math.min(v.ax + rA, v.bx + rB)) / 2;
        const f = font(800, 12.5);
        if (c[1] > 0) text(g, hidden ? '?' : val(c[1]), left, v.y, { font: f, color: theme.text });
        if (c[2] > 0) text(g, hidden ? '?' : val(c[2]), right, v.y, { font: f, color: theme.text });
        if (c[0] > 0) text(g, hidden ? '?' : val(c[0]), midX, v.y, { font: f, color: theme.text });
        text(g, hidden ? '?' : val(c[3]), box.x + box.w - 14, box.y + box.h - 12, { font: f, color: theme.text, align: 'right' });
      }
    }

    /** Teilfläche des Mengendiagramms unter dem Zeiger (Zellenindex). */
    function vennCellAt(px: number, py: number): number | null {
      const v = vennGeo();
      const b = v.box;
      if (px < b.x || px > b.x + b.w || py < b.y || py > b.y + b.h) return null;
      const inA = Math.hypot(px - v.ax, py - v.y) <= v.rA;
      const inB = Math.hypot(px - v.bx, py - v.y) <= v.rB;
      return inA ? (inB ? 0 : 1) : inB ? 2 : 3;
    }

    /* ---------------- Baum ---------------- */
    interface TreeGeo {
      root: { x: number; y: number };
      mid: { x: number; y: number }[];
      leaf: { x: number; y: number }[];
      infoX: number;
    }
    function treeGeo(): TreeGeo {
      const R = regions().tree;
      const top = R.y + 44;
      const bot = R.y + R.h - 64;
      const rowH = (bot - top) / 4;
      const leafY = [0, 1, 2, 3].map((i) => top + (i + 0.5) * rowH);
      const x0 = R.x + 26;
      const infoW = Math.min(150, R.w * 0.34);
      const x2 = R.x + R.w - infoW - 10;
      const x1 = (x0 + x2) / 2;
      return { root: { x: x0, y: (leafY[1]! + leafY[2]!) / 2 }, mid: [{ x: x1, y: (leafY[0]! + leafY[1]!) / 2 }, { x: x1, y: (leafY[2]! + leafY[3]!) / 2 }], leaf: leafY.map((y) => ({ x: x2, y })), infoX: x2 + 14 };
    }

    function drawTree(): void {
      const R = regions().tree;
      const theme = ctx.theme;
      const g = surface.g;
      card(R, tt('Baumdiagramm', 'Tree diagram'));
      const tg = treeGeo();
      const order = p.order as 'AB' | 'BA';
      const c = cells();
      const br = treeBranches(c, order);
      const mask = evMask();
      const sw = reduced ? 1 : clamp((now - orderSwitch) / 500, 0, 1);
      const fade = sw < 0.5 ? 1 - sw * 2 : (sw - 0.5) * 2;
      const firstNames = order === 'AB' ? ['A', 'Ā'] : ['B', 'B̄'];
      const secondNames = order === 'AB' ? ['B', 'B̄'] : ['A', 'Ā'];
      const firstCol = order === 'AB' ? CA() : CB();
      const secondCol = order === 'AB' ? CB() : CA();
      const grow = reduced ? 1 : ease.inOutCubic(clamp((now - introStart - 150) / 700, 0, 1));
      g.save();
      g.globalAlpha = sw < 1 ? fade : 1;
      const edge = (a: { x: number; y: number }, b: { x: number; y: number }, col: string, hl: number, label: string, ev: boolean, w = 1) => {
        const mx = a.x + (b.x - a.x) * 0.4;
        const bx = a.x + (b.x - a.x) * grow;
        const by = a.y + (b.y - a.y) * grow;
        g.save();
        g.lineCap = 'round';
        if (ev || hl > 0) {
          g.strokeStyle = alpha(hl > 0 ? theme.text : EV(), theme.dark ? 0.3 : 0.18);
          g.lineWidth = 9;
          g.beginPath();
          g.moveTo(a.x, a.y);
          g.bezierCurveTo(mx, a.y, mx, by, bx, by);
          g.stroke();
        }
        g.strokeStyle = alpha(col, 0.85);
        g.lineWidth = 1.5 + 3.5 * w;
        g.beginPath();
        g.moveTo(a.x, a.y);
        g.bezierCurveTo(mx, a.y, mx, by, bx, by);
        g.stroke();
        g.restore();
        if (grow > 0.9) {
          const lx = a.x + (b.x - a.x) * 0.55;
          const ly = a.y + (b.y - a.y) * 0.6;
          g.font = font(750, 11.5);
          const lw = g.measureText(label).width + 10;
          roundRect(g, lx - lw / 2, ly - 9, lw, 18, 9);
          g.fillStyle = alpha(ctx.theme.dark ? shade(theme.bg, 0.1) : '#ffffff', 0.95);
          g.fill();
          g.strokeStyle = alpha(col, 0.5);
          g.lineWidth = 1;
          g.stroke();
          text(g, label, lx, ly + 0.5, { font: font(750, 11.5), color: shade(col, theme.dark ? 0.25 : -0.2) });
        }
      };
      const hidden = !p.show;
      for (let i = 0; i < 2; i++) {
        const f = br.first[i]!;
        const kids = [0, 1].map((j) => br.leafCells[i * 2 + j]!);
        const ev = kids.some((ci) => mask[ci]);
        const hl = kids.includes(hover ?? -1) ? 1 : 0;
        edge(tg.root, tg.mid[i]!, firstCol, hl, branch(f.k, f.n), ev, f.n ? f.k / f.n : 0);
        for (let j = 0; j < 2; j++) {
          const s = br.second[i]![j]!;
          const ci = br.leafCells[i * 2 + j]!;
          edge(tg.mid[i]!, tg.leaf[i * 2 + j]!, secondCol, hover === ci ? 1 : 0, hidden ? '?' : branch(s.k, s.n), mask[ci]!, s.n ? s.k / s.n : 0);
        }
      }
      // Knoten mit Namen
      const node = (pt: { x: number; y: number }, name: string, col: string) => {
        g.beginPath();
        g.arc(pt.x, pt.y, 11, 0, Math.PI * 2);
        g.fillStyle = col;
        g.fill();
        text(g, name, pt.x, pt.y + 0.5, { font: font(800, 11), color: '#ffffff' });
      };
      g.fillStyle = theme.text;
      g.beginPath();
      g.arc(tg.root.x, tg.root.y, 4, 0, Math.PI * 2);
      g.fill();
      if (grow > 0.9) {
        tg.mid.forEach((m, i) => node(m, firstNames[i]!, firstCol));
        tg.leaf.forEach((lf, k) => node(lf, secondNames[k % 2]!, secondCol));
        // Blätter: Schnittmenge und Wert
        tg.leaf.forEach((lf, k) => {
          const ci = br.leafCells[k]!;
          const isEv = mask[ci]!;
          const isHover = hover === ci;
          const x = tg.infoX;
          const w = R.x + R.w - 10 - x;
          if (isEv || isHover) {
            roundRect(g, x - 4, lf.y - 13, w, 26, 8);
            g.fillStyle = isHover ? alpha(theme.text, theme.dark ? 0.12 : 0.07) : alpha(EV(), theme.dark ? 0.22 : 0.12);
            g.fill();
          }
          const nm = order === 'AB' ? ['A ∩ B', 'A ∩ B̄', 'Ā ∩ B', 'Ā ∩ B̄'][k]! : ['B ∩ A', 'B ∩ Ā', 'B̄ ∩ A', 'B̄ ∩ Ā'][k]!;
          text(g, nm, x + 4, lf.y, { font: font(700, 11.5), color: theme.muted, align: 'left' });
          text(g, hidden ? '?' : val(c[ci]!), x + w - 6, lf.y, { font: font(800, 12.5), color: isEv ? EV() : theme.text, align: 'right' });
        });
      }
      g.restore();
      drawFormula(R);
    }

    /** Rechnung zum gewählten Ereignis unten im Baum-Kasten. */
    function drawFormula(R: Rect): void {
      const theme = ctx.theme;
      const g = surface.g;
      const ev = p.ev as EventId;
      if (ev === 'none') return;
      const sym = EVENTS.find((e) => e.value === ev)!.sym;
      const c = cells();
      const t = table(c);
      let line = '';
      if (!p.show) line = `P(${sym}) = ?`;
      else if (ev === 'AuB') line = `P(A ∪ B) = P(A) + P(B) − P(A ∩ B) = ${val(t.A)} + ${val(t.B)} − ${val(c[0])} = ${val(t.A + t.B - c[0])}`;
      else if (ev === 'nA') line = `P(Ā) = 1 − P(A) = 1 − ${val(t.A)} = ${val(t.nA)}`;
      else line = `P(${sym}) = ${val(eventCount(c, ev))}${p.num === 'abs' ? ` / ${t.N} = ${reduceText(eventCount(c, ev), t.N)}` : ''}`;
      if (p.num === 'abs' && p.show && (ev === 'AuB' || ev === 'nA')) line += ` ${tt('Fälle', 'cases')}`;
      const y = R.y + R.h - 30;
      let fs = 12.5;
      g.font = font(750, fs);
      while (fs > 9.5 && g.measureText(line).width > R.w - 40) {
        fs -= 0.5;
        g.font = font(750, fs);
      }
      const w = Math.min(R.w - 20, g.measureText(line).width + 22);
      roundRect(g, R.x + 10, y - 15, w, 30, 10);
      g.fillStyle = alpha(EV(), theme.dark ? 0.18 : 0.09);
      g.fill();
      text(g, line, R.x + 21, y + 0.5, { font: font(750, fs), color: EV(), align: 'left' });
    }
    const reduceText = (k: number, n: number) => {
      const r = reduce(k, n);
      return `${r.d === 1 ? r.n : `${r.n}/${r.d}`} ≈ ${fmt.num(n ? (k / n) * 100 : 0, 1)} %`;
    };

    /* ---------------- Zeiger: synchrones Hervorheben ---------------- */
    function cellAt(px: number, py: number): number | null {
      const tr = regions().table;
      if (px >= tr.x && px <= tr.x + tr.w && py >= tr.y && py <= tr.y + tr.h) {
        const tg = tableGeo();
        const j = Math.floor((px - tg.x0 - tg.hw) / tg.cw);
        const i = Math.floor((py - tg.y0) / tg.rh);
        return i >= 0 && i < 2 && j >= 0 && j < 2 ? i * 2 + j : null;
      }
      const vc = vennCellAt(px, py);
      if (vc !== null) return vc;
      const R = regions().tree;
      if (px >= R.x && px <= R.x + R.w && py >= R.y && py <= R.y + R.h) {
        const tg = treeGeo();
        const br = treeBranches(cells(), p.order as 'AB' | 'BA');
        let best: number | null = null;
        let bd = 18;
        tg.leaf.forEach((lf, k) => {
          const d = Math.abs(py - lf.y);
          if (d < bd && px > tg.mid[0]!.x) {
            bd = d;
            best = br.leafCells[k]!;
          }
        });
        return best;
      }
      return null;
    }

    surface.addTarget({
      contains: () => true,
      pointerDown: (pt) => {
        const ci = cellAt(pt.px, pt.py);
        hover = ci === hover ? null : ci;
        updateReadouts();
        ctx.requestRender();
        return true;
      },
      pointerMove: () => undefined,
      pointerUp: () => undefined,
      hover: (pt) => {
        const ci = pt ? cellAt(pt.px, pt.py) : null;
        surface.setCursor(ci !== null ? 'pointer' : '');
        if (ci !== hover) {
          hover = ci;
          updateReadouts();
          ctx.requestRender();
        }
      },
      wheel: () => false,
    });

    /* ---------------- Ergebnisse ---------------- */
    function updateReadouts(): void {
      const c = cells();
      const t = table(c);
      const ev = p.ev as EventId;
      const nTxt = (k: number) => `${k}/${t.N} ≈ ${fmt.num(t.N ? (k / t.N) * 100 : 0, 1)} %`;
      ctx.readout('ev', ev === 'none' ? null : `P(${EVENTS.find((e) => e.value === ev)!.sym}) = ${nTxt(eventCount(c, ev))}`);
      ctx.readout('add', `P(A ∪ B) = ${t.A}/${t.N} + ${t.B}/${t.N} − ${c[0]}/${t.N} = ${nTxt(t.A + t.B - c[0])}`);
      const cond = t.A ? `P_A(B) = ${c[0]}/${t.A} ≈ ${fmt.num((c[0] / t.A) * 100, 1)} %` : 'P_A(B): –';
      const condB = t.B ? `P_B(A) = ${c[0]}/${t.B} ≈ ${fmt.num((c[0] / t.B) * 100, 1)} %` : 'P_B(A): –';
      ctx.readout('cond', `${cond} · ${condB}${independent(c) && t.N ? tt(' · A und B sind unabhängig', ' · A and B are independent') : ''}`);
    }

    function retarget(snap = false): void {
      [p.c1, p.c2, p.c3, p.c4].forEach((v, i) => (snap ? gc[i]!.snap(v) : gc[i]!.go(v)));
    }

    retarget(true);
    updateReadouts();

    return {
      update(changed, source) {
        now = performance.now();
        if (source === 'input' && changed.has('ctx')) {
          const d = CONTEXT_DATA[p.ctx as Ctx];
          ctx.set({ c1: d[0], c2: d[1], c3: d[2], c4: d[3] });
        }
        if (p.order !== lastOrder) {
          lastOrder = p.order;
          orderSwitch = reduced ? -1e9 : now - 250;
        }
        retarget(source === 'init');
        updateReadouts();
        ctx.requestRender();
      },
      render() {
        now = performance.now();
        surface.begin();
        drawTable();
        drawVenn();
        drawTree();
        const busy = gc.some((x) => x.busy(now)) || now - orderSwitch < 520 || (!reduced && now - introStart < 900);
        if (busy) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
