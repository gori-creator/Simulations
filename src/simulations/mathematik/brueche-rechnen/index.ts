import { defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, softShadow, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { compare, crossCancel, divide, measure, mixed, multiply, reciprocal, reduce, type Fraction } from './model';
import { drawFrac, drawRich, fill, fr, fracWidth, richHeight, type TextToken, type Token } from './rich';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Abschnitt [a, b] einer Animation (0 … 1) auf 0 … 1 abbilden. */
const seg = (u: number, a: number, b: number) => clamp((u - a) / (b - a), 0, 1);

type Mode = 'mal' | 'durch';
/** Größter Wert eines Bruchs (Ganze im Bild). */
const MAXV = 3;

/** Baustein einer Rechenzeile. */
type FItem =
  | { k: 'frac'; z: string; n: string; color: string; newZ?: string; newN?: string }
  | { k: 'op'; s: string }
  | { k: 'num'; s: string; color: string }
  | { k: 'mixed'; whole: string; z: string; n: string; color: string };

interface Hit {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  r?: number;
  cursor?: string;
}

interface MsgLine {
  tokens: Token[];
  color?: string;
}

/**
 * Brüche multiplizieren und dividieren: Rechteckmodell (senkrechte und
 * waagrechte Streifen, die Überlappung ist das Produkt; Griffe zum Ziehen),
 * Kürzen über Kreuz vor dem Ausmultiplizieren, Division als Messen
 * („Wie oft passt … in …?“) mit gemeinsamem Nenner und die Kehrwert-Regel.
 */
export default defineSimulation({
  id: 'brueche-rechnen',
  dragHint: true,
  layout: { aspect: 1.4, aspectNarrow: 0.5 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Rechenart', 'Operation'),
      options: [
        { value: 'mal', label: L('Multiplizieren', 'Multiply') },
        { value: 'durch', label: L('Dividieren', 'Divide') },
      ],
      default: 'mal',
    },
    { key: 'z1', type: 'number', label: L('Erster Bruch: Zähler', 'First fraction: numerator'), min: 1, max: 36, step: 1, default: 2 },
    { key: 'n1', type: 'number', label: L('Erster Bruch: Nenner', 'First fraction: denominator'), min: 1, max: 12, step: 1, default: 3 },
    { key: 'z2', type: 'number', label: L('Zweiter Bruch: Zähler', 'Second fraction: numerator'), min: 1, max: 36, step: 1, default: 3 },
    { key: 'n2', type: 'number', label: L('Zweiter Bruch: Nenner', 'Second fraction: denominator'), min: 1, max: 12, step: 1, default: 4 },
    {
      key: 'kurz',
      type: 'boolean',
      label: L('Vor dem Ausmultiplizieren kürzen', 'Cancel before multiplying'),
      help: L('Zähler und Nenner werden – auch über Kreuz – gekürzt, bevor man multipliziert.', 'Numerators and denominators are cancelled – also diagonally – before multiplying.'),
      default: false,
      visibleIf: (v) => v.mode === 'mal',
    },
  ],
  actions: [
    { id: 'build', label: L('Aufbauen', 'Build up'), primary: true, visibleIf: (v) => v.mode === 'mal' },
    { id: 'swap', label: L('Faktoren tauschen', 'Swap factors'), visibleIf: (v) => v.mode === 'mal' },
    { id: 'measure', label: L('Messen', 'Measure'), primary: true, visibleIf: (v) => v.mode === 'durch' },
  ],
  readouts: [
    { key: 'prod', label: L('Produkt', 'Product'), spoiler: true },
    { key: 'cells', label: L('Felder', 'Cells'), spoiler: true },
    { key: 'quot', label: L('Quotient', 'Quotient'), spoiler: true },
    { key: 'common', label: L('Gleichnamig', 'Common denominator'), spoiler: true },
    { key: 'recip', label: L('Kehrwert des Divisors', 'Reciprocal of the divisor') },
  ],
  presets: [
    { id: 'start', label: L('2/3 · 3/4', '2/3 · 3/4'), values: {} },
    { id: 'small', label: L('Mal macht kleiner: 1/2 · 1/3', 'Times makes smaller: 1/2 · 1/3'), values: { z1: 1, n1: 2, z2: 1, n2: 3 } },
    { id: 'big', label: L('Größer als 1: 3/2 · 4/5', 'Greater than 1: 3/2 · 4/5'), values: { z1: 3, n1: 2, z2: 4, n2: 5 } },
    { id: 'cancel', label: L('Über Kreuz kürzen: 4/9 · 3/8', 'Cancel diagonally: 4/9 · 3/8'), values: { z1: 4, n1: 9, z2: 3, n2: 8, kurz: true } },
    { id: 'div', label: L('3/4 : 2/3 messen', 'Measure 3/4 ÷ 2/3'), values: { mode: 'durch', z1: 3, n1: 4, z2: 2, n2: 3 } },
    { id: 'pizza', label: L('2 : 2/3 (Pizza teilen)', '2 ÷ 2/3 (sharing pizza)'), values: { mode: 'durch', z1: 2, n1: 1, z2: 2, n2: 3 } },
  ],
  strings: {
    de: {
      canvas: 'Rechteckmodell für das Multiplizieren zweier Brüche bzw. Messen mit Streifen für das Dividieren',
      divSign: ':',
      calc: 'Rechnung',
      vonLine: '{x} von {y} ist {r}.',
      timesLine: '{x}-mal {y} ist {r}.',
      cellsLine: 'Ein Ganzes hat {b} · {d} = {bd} Felder, gefärbt sind {a} · {c} = {ac} Felder.',
      cellsMany: 'Ein Ganzes hat {b} · {d} = {bd} Felder, gefärbt sind {a} · {c} = {ac} Felder – mehr als ein Ganzes.',
      rule: 'Zähler mal Zähler, Nenner mal Nenner.',
      smaller: '{x} ist kleiner als 1 – das Ergebnis ist kleiner als {y}.',
      larger: '{x} ist größer als 1 – das Ergebnis ist größer als {y}.',
      equalOne: '{x} ist gleich 1 – das Ergebnis ist {y}.',
      crossNone: 'Hier lässt sich vor dem Multiplizieren nichts kürzen.',
      crossPair: '{p} und {q} durch {g}',
      crossLine: 'Vorher gekürzt: {list}. Danach sind die Zahlen kleiner – das Ergebnis ist gleich.',
      unit: '1 Ganzes',
      note: 'Merke',
      dragTip: 'Ziehe an den runden Griffen am Rand des Quadrats, um die Brüche zu verändern.',
      measTitle: 'Wie oft passt {c} in {a}?',
      kwTitle: 'Kehrwert: Wie oft passt {c} in 1?',
      rowCommon: 'Gleichnamig',
      rowRecip: 'Mit dem Kehrwert',
      fitsMany: '{c} passt {k}-mal ganz in {a}, dazu noch {r} des Streifens.',
      fitsExact: '{c} passt genau {k}-mal in {a}.',
      fitsNone: '{c} passt nicht ganz in {a} – nur {r} des Streifens.',
      pieces: '{a} sind {A} {name}, {c} sind {C} {name}. Also {A} : {C}.',
      piecesSame: 'Gleich große Stücke: {A} : {C}.',
      kwText: 'In 1 passt {c} genau {r}-mal. In {a} passt es {a}-mal so oft: {a} · {r}.',
      times: '-mal',
      strip: 'Streifen',
      ofStrip: 'des Streifens',
    },
    en: {
      canvas: 'Area model for multiplying two fractions and measuring with strips for dividing',
      divSign: '÷',
      calc: 'Calculation',
      vonLine: '{x} of {y} is {r}.',
      timesLine: '{x} times {y} is {r}.',
      cellsLine: 'One whole has {b} · {d} = {bd} cells, {a} · {c} = {ac} cells are shaded.',
      cellsMany: 'One whole has {b} · {d} = {bd} cells, {a} · {c} = {ac} cells are shaded – more than one whole.',
      rule: 'Numerator times numerator, denominator times denominator.',
      smaller: '{x} is less than 1 – the result is less than {y}.',
      larger: '{x} is greater than 1 – the result is greater than {y}.',
      equalOne: '{x} equals 1 – the result is {y}.',
      crossNone: 'Nothing can be cancelled before multiplying here.',
      crossPair: '{p} and {q} by {g}',
      crossLine: 'Cancelled first: {list}. The numbers get smaller – the result is the same.',
      unit: '1 whole',
      note: 'Remember',
      dragTip: 'Drag the round handles at the edge of the square to change the fractions.',
      measTitle: 'How often does {c} fit into {a}?',
      kwTitle: 'Reciprocal: how often does {c} fit into 1?',
      rowCommon: 'Common denominator',
      rowRecip: 'With the reciprocal',
      fitsMany: '{c} fits {k} times into {a}, plus {r} of the strip.',
      fitsExact: '{c} fits exactly {k} times into {a}.',
      fitsNone: '{c} does not fit into {a} completely – only {r} of the strip.',
      pieces: '{a} is {A} {name}, {c} is {C} {name}. So {A} ÷ {C}.',
      piecesSame: 'Pieces of equal size: {A} ÷ {C}.',
      kwText: '{c} fits into 1 exactly {r} times. Into {a} it fits {a} times as often: {a} · {r}.',
      times: ' times',
      strip: 'strip',
      ofStrip: 'of the strip',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const lang = ctx.lang;
    const reduced = prefersReducedMotion();
    const rich = (key: string, vars: Record<string, string | number | Token | Token[]>, base: Partial<TextToken> = {}) => fill(ctx.t(key), vars, base);
    const mode = () => p.mode as Mode;
    const isWide = () => surface.width >= 600;
    const F = () => ctx.theme.font;
    const colA = () => ctx.theme.series[0]!;
    const colB = () => ctx.theme.series[3]!;
    const colP = () => ctx.theme.series[4]!;
    const alpha = (c: string, a: number) => mixColor(c, c, 0, a);
    const bold = (t: string, color?: string): Token => ({ t, bold: true, color });
    /** Bruch als Baustein; Nenner 1 als ganze Zahl. */
    const frT = (z: number, n: number, color?: string): Token => (n === 1 ? bold(String(z), color) : fr(z, n, color));
    const msgSize = () => (surface.width >= 780 ? 13 : 12);
    const X1 = (): Fraction => ({ z: p.z1, n: p.n1 });
    const X2 = (): Fraction => ({ z: p.z2, n: p.n2 });

    let hits: Hit[] = [];
    let hover: string | null = null;
    let drag: 'hA' | 'hC' | null = null;
    let lastNow = performance.now();

    /* ================================================================ */
    /* Zeichenbausteine                                                 */
    /* ================================================================ */

    function card(r: Rect): void {
      const g = surface.g;
      const T = ctx.theme;
      g.save();
      softShadow(g, T.dark, 12, 3);
      g.fillStyle = T.bg;
      roundRect(g, r.x, r.y, r.w, r.h, 14);
      g.fill();
      g.restore();
      g.strokeStyle = withAlpha(T.text, T.dark ? 0.14 : 0.1);
      g.lineWidth = 1;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 14);
      g.stroke();
    }

    function panel(r: Rect): void {
      const g = surface.g;
      g.fillStyle = withAlpha(ctx.theme.text, ctx.theme.dark ? 0.045 : 0.028);
      roundRect(g, r.x, r.y, r.w, r.h, 14);
      g.fill();
    }

    function smallCaps(label: string, x: number, y: number): void {
      text(surface.g, label.toUpperCase(), x, y, { font: `800 ${isWide() ? 11 : 10.5}px ${F()}`, color: ctx.theme.muted, align: 'left' });
    }

    function messageHeight(w: number, lines: MsgLine[], size: number): number {
      return lines.reduce((h, line) => h + richHeight(surface.g, line.tokens, size, F(), w) + 3, 0);
    }

    function message(r: Rect, lines: MsgLine[], size: number, align: 'center' | 'left' = 'left'): number {
      const g = surface.g;
      let y = r.y;
      for (const line of lines) {
        y += drawRich(g, line.tokens, align === 'center' ? r.x + r.w / 2 : r.x, y, { size, font: F(), color: line.color ?? ctx.theme.text, maxW: r.w, align });
        y += 3;
      }
      return y - r.y;
    }

    /** Breite eines Bausteins der Rechenzeile. */
    function itemWidth(it: FItem, size: number): number {
      const g = surface.g;
      if (it.k === 'frac') return fracWidth(g, it.z, it.n, size, F()) + (it.newZ || it.newN ? size * 0.62 : 0) + 2;
      if (it.k === 'op') return size * (it.s === '=' ? 1.3 : 1.1);
      if (it.k === 'num') {
        g.font = `800 ${size}px ${F()}`;
        return g.measureText(it.s).width + 4;
      }
      g.font = `800 ${size}px ${F()}`;
      return g.measureText(it.whole).width + 3 + fracWidth(g, it.z, it.n, size * 0.8, F()) + 2;
    }

    /**
     * Rechenzeile (Brüche, Rechenzeichen, gemischte Zahlen) zentriert bzw.
     * linksbündig zeichnen; die Schrift wird verkleinert, bis sie passt.
     * Gibt die Mittelpunkte der Bausteine zurück (für Hilfslinien).
     */
    function drawRow(items: FItem[], x: number, cy: number, maxW: number, maxSize: number, minSize: number, align: 'center' | 'left' = 'center'): { xs: number[]; size: number } {
      const g = surface.g;
      const T = ctx.theme;
      let size = maxSize;
      let ws = items.map((it) => itemWidth(it, size));
      while (size > minSize && ws.reduce((s, v) => s + v, 0) > maxW) {
        size -= 1;
        ws = items.map((it) => itemWidth(it, size));
      }
      const total = ws.reduce((s, v) => s + v, 0);
      let px = align === 'center' ? x - total / 2 : x;
      const xs: number[] = [];
      items.forEach((it, i) => {
        const w = ws[i]!;
        if (it.k === 'frac') {
          const fw = fracWidth(g, it.z, it.n, size, F());
          const cx = px + fw / 2 + 1;
          xs.push(cx);
          drawFrac(g, cx, cy, it.z, it.n, size, it.color, F());
          const gap = size * 0.2;
          const cap = size * 0.73;
          const strike = (s: string, top: number) => {
            g.font = `800 ${size}px ${F()}`;
            const tw = g.measureText(s).width;
            g.strokeStyle = colP();
            g.lineWidth = Math.max(1.6, size * 0.07);
            g.lineCap = 'round';
            g.beginPath();
            g.moveTo(cx - tw / 2 - 2, top + cap + 1);
            g.lineTo(cx + tw / 2 + 2, top - 1);
            g.stroke();
          };
          const small = `800 ${Math.round(size * 0.56)}px ${F()}`;
          if (it.newZ) {
            strike(it.z, cy - gap - cap);
            text(g, it.newZ, cx + fw / 2 + 2, cy - gap - cap + size * 0.08, { font: small, color: colP(), align: 'left' });
          }
          if (it.newN) {
            strike(it.n, cy + gap);
            text(g, it.newN, cx + fw / 2 + 2, cy + gap + cap + size * 0.06, { font: small, color: colP(), align: 'left' });
          }
        } else if (it.k === 'op') {
          xs.push(px + w / 2);
          text(g, it.s, px + w / 2, cy + 1, { font: `700 ${size}px ${F()}`, color: T.muted });
        } else if (it.k === 'num') {
          xs.push(px + w / 2);
          text(g, it.s, px + w / 2, cy + 1, { font: `800 ${size}px ${F()}`, color: it.color });
        } else {
          g.font = `800 ${size}px ${F()}`;
          const ww = g.measureText(it.whole).width;
          xs.push(px + w / 2);
          text(g, it.whole, px + ww / 2, cy + 1, { font: `800 ${size}px ${F()}`, color: it.color });
          const fw = fracWidth(g, it.z, it.n, size * 0.8, F());
          drawFrac(g, px + ww + 3 + fw / 2, cy, it.z, it.n, size * 0.8, it.color, F());
        }
        px += w;
      });
      return { xs, size };
    }

    const fItem = (f: Fraction, color: string): FItem => (f.n === 1 ? { k: 'num', s: String(f.z), color } : { k: 'frac', z: String(f.z), n: String(f.n), color });
    const op = (s: string): FItem => ({ k: 'op', s });
    /** Ergebnis als Bruch, ggf. zusätzlich als ganze bzw. gemischte Zahl. */
    function resultItems(f: Fraction, color: string): FItem[] {
      const r = reduce(f);
      if (r.n === 1) return [{ k: 'num', s: String(r.z), color }];
      const out: FItem[] = [fItem(r, color)];
      if (r.z > r.n) {
        const m = mixed(r);
        out.push(op('='), { k: 'mixed', whole: String(m.whole), z: String(m.rest.z), n: String(m.rest.n), color });
      }
      return out;
    }

    /** Diagonal schraffierte Fläche. */
    function hatch(x: number, y: number, w: number, h: number, color: string, gap = 6): void {
      const g = surface.g;
      g.save();
      g.beginPath();
      g.rect(x, y, w, h);
      g.clip();
      g.strokeStyle = color;
      g.lineWidth = 1.4;
      g.beginPath();
      for (let k = x - h; k < x + w; k += gap) {
        g.moveTo(k, y + h);
        g.lineTo(k + h, y);
      }
      g.stroke();
      g.restore();
    }

    /* ================================================================ */
    /* Multiplizieren: Rechteckmodell                                   */
    /* ================================================================ */

    const buildTween = new Tween(2600, ease.linear);
    const disp = { a: p.z1 / p.n1, c: p.z2 / p.n2 };
    let dispSnap = true;

    function malCardLines(): MsgLine[] {
      const T = ctx.theme;
      const x = X1();
      const y = X2();
      const pr = multiply(x, y);
      const lines: MsgLine[] = [];
      const fx = frT(x.z, x.n, colA());
      const fy = frT(y.z, y.n, colB());
      const res = reduce(pr.raw);
      const fres = res.n === 1 ? bold(String(res.z), colP()) : frT(res.z, res.n, colP());
      // „von“ passt für Anteile (kleiner als 1), sonst „-mal“
      lines.push({ tokens: rich(compare(x, { z: 1, n: 1 }) < 0 ? 'vonLine' : 'timesLine', { x: fx, y: fy, r: fres }) });
      const vars = { b: bold(String(x.n), colA()), d: bold(String(y.n), colB()), bd: bold(String(pr.raw.n)), a: bold(String(x.z), colA()), c: bold(String(y.z), colB()), ac: bold(String(pr.raw.z), colP()) };
      lines.push({ tokens: rich(pr.raw.z > pr.raw.n ? 'cellsMany' : 'cellsLine', vars) });
      const c1 = compare(x, { z: 1, n: 1 });
      lines.push({ tokens: rich(c1 < 0 ? 'smaller' : c1 > 0 ? 'larger' : 'equalOne', { x: fx, y: fy }), color: T.muted });
      if (p.kurz) {
        const cc = crossCancel(x, y);
        const pairs: Token[] = [];
        const add = (pp: number, q: number, g0: number) => {
          if (g0 <= 1) return;
          if (pairs.length) pairs.push({ t: '; ' });
          pairs.push(...rich('crossPair', { p: bold(String(pp)), q: bold(String(q)), g: bold(String(g0), colP()) }));
        };
        add(x.z, x.n, cc.gx);
        add(y.z, y.n, cc.gy);
        add(x.z / cc.gx, y.n / cc.gy, cc.g1);
        add(y.z / cc.gy, x.n / cc.gx, cc.g2);
        lines.push(pairs.length ? { tokens: rich('crossLine', { list: pairs }) } : { tokens: [{ t: ctx.t('crossNone') }], color: T.muted });
      } else lines.push({ tokens: [{ t: ctx.t('rule') }], color: T.muted });
      return lines;
    }

    function malRowItems(): FItem[] {
      const x = X1();
      const y = X2();
      const T = ctx.theme;
      const pr = multiply(x, y);
      const items: FItem[] = [];
      if (p.kurz) {
        const cc = crossCancel(x, y);
        const ch = (a: number, b: number) => (a !== b ? String(b) : undefined);
        items.push({ k: 'frac', z: String(x.z), n: String(x.n), color: colA(), newZ: ch(x.z, cc.x.z), newN: ch(x.n, cc.x.n) });
        items.push(op('·'));
        items.push({ k: 'frac', z: String(y.z), n: String(y.n), color: colB(), newZ: ch(y.z, cc.y.z), newN: ch(y.n, cc.y.n) });
        items.push(op('='));
        items.push({ k: 'frac', z: `${cc.x.z} · ${cc.y.z}`, n: `${cc.x.n} · ${cc.y.n}`, color: T.text });
        items.push(op('='), ...resultItems(cc.result, colP()));
        return items;
      }
      items.push(fItem(x, colA()), op('·'), fItem(y, colB()), op('='));
      items.push({ k: 'frac', z: `${x.z} · ${y.z}`, n: `${x.n} · ${y.n}`, color: T.text });
      items.push(op('='), fItem(pr.raw, colP()));
      const r = reduce(pr.raw);
      if (r.z !== pr.raw.z || r.n === 1 || r.z > r.n) {
        if (r.n === 1 || r.z !== pr.raw.z) items.push(op('='), ...resultItems(pr.raw, colP()));
        else items.push(op('='), ...resultItems(pr.raw, colP()).slice(2));
      }
      return items;
    }

    /** Höhe des Rechenkopfs (mit Platz für die kleinen Zahlen beim Kürzen). */
    const headH = () => (p.kurz ? 104 : 94);

    function malGeo() {
      const W = surface.width;
      const H = surface.height;
      const wide = isWide();
      if (wide) {
        const aw = Math.round(W * (W >= 780 ? 0.55 : 0.5));
        return { wide, area: { x: 8, y: 8, w: aw - 8, h: H - 16 } as Rect, card: { x: aw + 10, y: 14, w: W - aw - 24, h: H - 28 } as Rect };
      }
      const cw = W - 16;
      const ch = headH() + messageHeight(cw - 28, malCardLines(), msgSize()) + 14;
      const cardR: Rect = { x: 8, y: 8, w: cw, h: ch };
      return { wide, card: cardR, area: { x: 2, y: cardR.y + ch + 6, w: W - 4, h: H - (cardR.y + ch + 6) - 4 } as Rect };
    }

    function gridGeo(area: Rect) {
      const wide = isWide();
      const a = p.z1 / p.n1;
      const c = p.z2 / p.n2;
      const Uw = clamp(Math.ceil(a - 1e-9), 1, MAXV);
      const Uh = clamp(Math.ceil(c - 1e-9), 1, MAXV);
      const padL = wide ? 70 : 60;
      const padB = wide ? 70 : 62;
      const padT = 18;
      const padR = wide ? 22 : 14;
      const s = Math.min((area.w - padL - padR) / Uw, (area.h - padT - padB) / Uh);
      const gw = s * Uw;
      const gh = s * Uh;
      const ox = area.x + padL + (area.w - padL - padR - gw) / 2;
      // schmal: eher oben (näher an der Rechnung), breit: mittig
      const extra = area.h - padT - padB - gh;
      const oy = area.y + padT + extra * (wide ? 0.5 : 0.1) + gh;
      return { Uw, Uh, s, ox, oy, gw, gh };
    }

    function drawMal(dt: number): boolean {
      const g = surface.g;
      const T = ctx.theme;
      const geo = malGeo();
      const { wide, area } = geo;
      const G = gridGeo(area);
      const { s, ox, oy, gw, gh, Uw, Uh } = G;
      const b = p.n1;
      const d = p.n2;
      // angezeigte Werte gleiten zum Ziel
      const ta = p.z1 / p.n1;
      const tc = p.z2 / p.n2;
      let moving = false;
      if (dispSnap || reduced || drag) {
        disp.a = ta;
        disp.c = tc;
        dispSnap = false;
      } else {
        const k = 1 - Math.exp(-dt * 12);
        disp.a += (ta - disp.a) * k;
        disp.c += (tc - disp.c) * k;
        if (Math.abs(ta - disp.a) < 0.001 && Math.abs(tc - disp.c) < 0.001) {
          disp.a = ta;
          disp.c = tc;
        } else moving = true;
      }
      const u = buildTween.running ? buildTween.t : 1;
      const phA = seg(u, 0.02, 0.3);
      const phC = seg(u, 0.32, 0.6);
      const phP = seg(u, 0.62, 0.76);
      const phN = seg(u, 0.74, 1);
      const A = disp.a * ease.inOutCubic(phA);
      const C = disp.c * ease.inOutCubic(phC);
      // Papier der Ganzen
      g.save();
      softShadow(g, T.dark, 14, 4);
      g.fillStyle = T.bg;
      g.fillRect(ox, oy - gh, gw, gh);
      g.restore();
      // Streifen der Faktoren
      g.fillStyle = alpha(colA(), T.dark ? 0.3 : 0.2);
      g.fillRect(ox, oy - gh, A * s, gh);
      g.fillStyle = alpha(colB(), T.dark ? 0.3 : 0.2);
      g.fillRect(ox, oy - C * s, gw, C * s);
      // Überlappung = Produkt
      if (phP > 0) {
        const grad = g.createLinearGradient(0, oy - disp.c * s, 0, oy);
        grad.addColorStop(0, alpha(colP(), 0.78 * phP));
        grad.addColorStop(1, alpha(colP(), 0.92 * phP));
        g.fillStyle = grad;
        g.fillRect(ox, oy - C * s, A * s, C * s);
      }
      // Feldlinien
      g.lineWidth = 1;
      for (let i = 1; i < Uw * b; i++) {
        if (i % b === 0) continue;
        const x = ox + (i * s) / b;
        const inProd = phP > 0.5 && x < ox + A * s - 0.5;
        g.strokeStyle = alpha(colA(), T.dark ? 0.45 : 0.35);
        g.beginPath();
        g.moveTo(x, oy - gh);
        g.lineTo(x, inProd ? oy - C * s : oy);
        g.stroke();
        if (inProd) {
          g.strokeStyle = alpha('#ffffff', 0.75);
          g.beginPath();
          g.moveTo(x, oy - C * s);
          g.lineTo(x, oy);
          g.stroke();
        }
      }
      for (let j = 1; j < Uh * d; j++) {
        if (j % d === 0) continue;
        const y = oy - (j * s) / d;
        const inProd = phP > 0.5 && y > oy - C * s + 0.5;
        g.strokeStyle = alpha(colB(), T.dark ? 0.45 : 0.4);
        g.beginPath();
        g.moveTo(inProd ? ox + A * s : ox, y);
        g.lineTo(ox + gw, y);
        g.stroke();
        if (inProd) {
          g.strokeStyle = alpha('#ffffff', 0.75);
          g.beginPath();
          g.moveTo(ox, y);
          g.lineTo(ox + A * s, y);
          g.stroke();
        }
      }
      // Grenzen der Ganzen
      g.strokeStyle = alpha(T.text, 0.7);
      g.lineWidth = 2.2;
      for (let i = 1; i < Uw; i++) {
        g.beginPath();
        g.moveTo(ox + i * s, oy - gh);
        g.lineTo(ox + i * s, oy);
        g.stroke();
      }
      for (let j = 1; j < Uh; j++) {
        g.beginPath();
        g.moveTo(ox, oy - j * s);
        g.lineTo(ox + gw, oy - j * s);
        g.stroke();
      }
      g.strokeRect(ox, oy - gh, gw, gh);
      // Umriss des Produkts
      if (phP > 0) {
        g.strokeStyle = alpha(colP(), phP);
        g.lineWidth = 2.6;
        g.strokeRect(ox, oy - C * s, A * s, C * s);
      }
      // Felder nummerieren
      const cw = s / b;
      const chh = s / d;
      const cells = p.z1 * p.z2;
      if (phN > 0 && Math.min(cw, chh) >= 15 && cells <= 120 && !moving) {
        const fs = Math.min(13, Math.min(cw, chh) * 0.42);
        let k = 0;
        for (let j = 0; j < p.z2; j++)
          for (let i = 0; i < p.z1; i++) {
            k++;
            const appear = clamp(phN * cells - (k - 1), 0, 1);
            if (appear <= 0) continue;
            g.save();
            g.globalAlpha = appear;
            text(g, String(k), ox + (i + 0.5) * cw, oy - (j + 0.5) * chh + 0.5, { font: `750 ${fs}px ${F()}`, color: '#ffffff' });
            g.restore();
          }
      }
      // Achsen: Ganze
      const fsU = wide ? 11.5 : 11;
      for (let i = 0; i <= Uw; i++) text(g, String(i), ox + i * s, oy + 13, { font: `700 ${fsU}px ${F()}`, color: T.muted });
      for (let j = 1; j <= Uh; j++) text(g, String(j), ox - 12, oy - j * s, { font: `700 ${fsU}px ${F()}`, color: T.muted, align: 'right' });
      // Klammern mit den Faktoren
      const bxY = oy + 27;
      const bA = disp.a * s * ease.inOutCubic(phA);
      if (bA > 2) {
        g.strokeStyle = colA();
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(ox, bxY - 5);
        g.lineTo(ox, bxY);
        g.lineTo(ox + bA, bxY);
        g.lineTo(ox + bA, bxY - 5);
        g.stroke();
        g.save();
        g.globalAlpha = phA;
        if (p.n1 === 1) text(g, String(p.z1), ox + bA / 2, bxY + 16, { font: `800 ${wide ? 18 : 16}px ${F()}`, color: colA() });
        else drawFrac(g, ox + bA / 2, bxY + 21, String(p.z1), String(p.n1), wide ? 17 : 15, colA(), F());
        g.restore();
      }
      const byX = ox - 30;
      const bC = disp.c * s * ease.inOutCubic(phC);
      if (bC > 2) {
        g.strokeStyle = colB();
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(byX + 5, oy);
        g.lineTo(byX, oy);
        g.lineTo(byX, oy - bC);
        g.lineTo(byX + 5, oy - bC);
        g.stroke();
        g.save();
        g.globalAlpha = phC;
        const fs = wide ? 17 : 15;
        const fw = fracWidth(g, String(p.z2), String(p.n2), fs, F());
        g.fillStyle = T.bg;
        g.fillRect(byX - fw / 2 - 4, oy - bC / 2 - fs, fw + 8, fs * 2);
        if (p.n2 === 1) text(g, String(p.z2), byX - 1, oy - bC / 2, { font: `800 ${fs + 1}px ${F()}`, color: colB() });
        else drawFrac(g, byX - 1, oy - bC / 2, String(p.z2), String(p.n2), fs, colB(), F());
        g.restore();
      }
      // Produkt-Plakette in der Fläche
      if (phP > 0.9 && !drag) {
        const pr = multiply(X1(), X2());
        const fs = wide ? 15 : 13;
        const fw = fracWidth(g, String(pr.raw.z), String(pr.raw.n), fs, F()) + 14;
        const fh = fs * 2.5;
        const px = ox + (disp.a * s) / 2;
        const py = oy - (disp.c * s) / 2;
        const showPill = disp.a * s > fw + 10 && disp.c * s > fh + 10 && (Math.min(cw, chh) < 15 || cells > 120);
        if (showPill) {
          g.save();
          softShadow(g, T.dark, 8, 2);
          g.fillStyle = T.bg;
          roundRect(g, px - fw / 2, py - fh / 2, fw, fh, 9);
          g.fill();
          g.restore();
          drawFrac(g, px, py, String(pr.raw.z), String(pr.raw.n), fs, colP(), F());
        }
      }
      // Griffe
      const handle = (id: string, x: number, y: number, color: string) => {
        const hov = hover === id || drag === id;
        g.save();
        softShadow(g, T.dark, hov ? 10 : 6, 2);
        g.fillStyle = color;
        g.beginPath();
        g.arc(x, y, hov ? 10.5 : 9, 0, Math.PI * 2);
        g.fill();
        g.restore();
        g.strokeStyle = '#ffffff';
        g.lineWidth = 2.4;
        g.beginPath();
        g.arc(x, y, hov ? 10.5 : 9, 0, Math.PI * 2);
        g.stroke();
        // kleine Pfeile als Hinweis auf die Zugrichtung
        g.fillStyle = '#ffffff';
        const horiz = id === 'hA';
        for (const sgn of [-1, 1]) {
          g.beginPath();
          if (horiz) {
            g.moveTo(x + sgn * 5.5, y);
            g.lineTo(x + sgn * 2, y - 3);
            g.lineTo(x + sgn * 2, y + 3);
          } else {
            g.moveTo(x, y + sgn * 5.5);
            g.lineTo(x - 3, y + sgn * 2);
            g.lineTo(x + 3, y + sgn * 2);
          }
          g.closePath();
          g.fill();
        }
        if (!ctx.locked) hits.push({ id, x, y, w: 0, h: 0, r: 16, cursor: horiz ? 'ew-resize' : 'ns-resize' });
      };
      if (phA >= 1) handle('hA', ox + disp.a * s, oy, colA());
      if (phC >= 1) handle('hC', ox, oy - disp.c * s, colB());
      lastGrid = G;
      // schmal: Hinweis zum Ziehen unter dem Bild, wenn Platz ist
      if (!wide && !ctx.locked) {
        const hint: MsgLine[] = [{ tokens: [{ t: ctx.t('dragTip') }], color: T.muted }];
        const hh = messageHeight(area.w - 32, hint, 11.5);
        if (area.y + area.h - hh - 8 > oy + 78) message({ x: area.x + 16, y: Math.min(area.y + area.h - hh - 8, oy + 92), w: area.w - 32, h: hh }, hint, 11.5, 'center');
      }
      // Karte
      drawMalCard(geo.card, wide);
      return buildTween.running || moving;
    }

    let lastGrid: ReturnType<typeof gridGeo> | null = null;

    /** Rechenkarte; breit: oben die Rechnung, darunter ein Merke-Feld. */
    function drawMalCard(R: Rect, wide: boolean): void {
      const g = surface.g;
      const T = ctx.theme;
      const size = msgSize();
      const lines = malCardLines();
      const hh = headH();
      const head = (r: Rect) => {
        smallCaps(ctx.t('calc'), r.x + 16, r.y + 20);
        drawRow(malRowItems(), r.x + r.w / 2, r.y + (p.kurz ? 64 : 58), r.w - 28, wide ? 30 : 24, 13);
        g.strokeStyle = withAlpha(T.text, 0.1);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(r.x + 16, r.y + hh - 4);
        g.lineTo(r.x + r.w - 16, r.y + hh - 4);
        g.stroke();
      };
      if (!wide) {
        card(R);
        head(R);
        message({ x: R.x + 14, y: R.y + hh + 4, w: R.w - 28, h: 0 }, lines, size);
        return;
      }
      // oben: Rechnung, „von“ und Felder zählen
      const top = lines.slice(0, 2);
      const rest = lines.slice(2);
      const tw = R.w - 32;
      const topH = hh + 8 + top.reduce((h, l) => h + messageHeight(tw, [l], size) + 8, 0) + 6;
      const c1: Rect = { x: R.x, y: R.y, w: R.w, h: topH };
      card(c1);
      head(c1);
      let y = c1.y + hh + 8;
      for (const line of top) y += message({ x: R.x + 16, y, w: tw, h: 0 }, [line], size) + 8;
      // darunter: Merke-Feld
      const hint: MsgLine[] = ctx.locked ? [] : [{ tokens: [{ t: ctx.t('dragTip') }], color: T.muted }];
      const restH = 30 + rest.reduce((h, l) => h + messageHeight(tw, [l], size) + 8, 0) + 6;
      const c2: Rect = { x: R.x, y: c1.y + c1.h + 12, w: R.w, h: restH };
      panel(c2);
      smallCaps(ctx.t('note'), c2.x + 16, c2.y + 18);
      y = c2.y + 30;
      for (const line of rest) y += message({ x: R.x + 16, y, w: tw, h: 0 }, [line], size) + 8;
      const hh2 = messageHeight(tw, hint, size - 0.5);
      if (hint.length && c2.y + c2.h + 14 + hh2 < R.y + R.h) message({ x: R.x + 16, y: R.y + R.h - hh2, w: tw, h: hh2 }, hint, size - 0.5);
    }

    /* ================================================================ */
    /* Dividieren: Messen mit Streifen, Kehrwert                        */
    /* ================================================================ */

    const measureTween = new Tween(3000, ease.linear);

    function durchGeo() {
      const W = surface.width;
      const H = surface.height;
      const wide = isWide();
      const pad = wide ? 12 : 8;
      const ch = wide ? 124 : 150;
      const cardR: Rect = { x: pad, y: pad, w: W - 2 * pad, h: ch };
      const rest = H - ch - 3 * pad - pad;
      if (wide && W < 780) {
        // mittlere Breite: Messen und Kehrwert nebeneinander
        const top = cardR.y + ch + pad;
        const mw = Math.round((W - 3 * pad) * 0.6);
        const hh = H - pad - top;
        return { wide, stackedKw: true, card: cardR, meas: { x: pad, y: top, w: mw, h: hh } as Rect, kw: { x: 2 * pad + mw, y: top, w: W - 3 * pad - mw, h: hh } as Rect };
      }
      const mh = Math.round(rest * (wide ? 0.62 : 0.58));
      const meas: Rect = { x: pad, y: cardR.y + ch + pad, w: W - 2 * pad, h: mh };
      const kw: Rect = { x: pad, y: meas.y + mh + pad, w: W - 2 * pad, h: H - pad - (meas.y + mh + pad) };
      return { wide, stackedKw: !wide, card: cardR, meas, kw };
    }

    function durchRows(): { label: string; items: FItem[] }[] {
      const x = X1();
      const y = X2();
      const m = measure(x, y);
      const dv = divide(x, y);
      const ds = ctx.t('divSign');
      const r1: FItem[] = [fItem(x, colA()), op(ds), fItem(y, colB()), op('=')];
      if (!(x.n === m.N && y.n === m.N)) r1.push(fItem({ z: m.A, n: m.N }, colA()), op(ds), fItem({ z: m.C, n: m.N }, colB()), op('='));
      r1.push({ k: 'num', s: String(m.A), color: colA() }, op(ds), { k: 'num', s: String(m.C), color: colB() }, op('='));
      r1.push(...resultItems({ z: m.A, n: m.C }, colP()));
      const r2: FItem[] = [fItem(x, colA()), op(ds), fItem(y, colB()), op('='), fItem(x, colA()), op('·'), fItem(dv.viaReciprocal, colB()), op('=')];
      r2.push({ k: 'frac', z: `${x.z} · ${y.n}`, n: `${x.n} · ${y.z}`, color: ctx.theme.text }, op('='));
      const red = reduce(dv.raw);
      if (red.z !== dv.raw.z && red.n !== 1) r2.push(fItem(dv.raw, colP()), op('='));
      r2.push(...resultItems(dv.raw, colP()));
      return [
        { label: ctx.t('rowCommon'), items: r1 },
        { label: ctx.t('rowRecip'), items: r2 },
      ];
    }

    function drawDurchCard(R: Rect, wide: boolean): void {
      const g = surface.g;
      card(R);
      const rows = durchRows();
      if (wide) {
        const lw = 130;
        rows.forEach((row, i) => {
          const cy = R.y + 33 + i * 58;
          smallCaps(row.label, R.x + 16, cy);
          drawRow(row.items, R.x + lw + 10, cy, R.w - lw - 26, 26, 13, 'left');
        });
        g.strokeStyle = withAlpha(ctx.theme.text, 0.08);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(R.x + 16, R.y + R.h / 2);
        g.lineTo(R.x + R.w - 16, R.y + R.h / 2);
        g.stroke();
      } else {
        rows.forEach((row, i) => {
          const top = R.y + 10 + i * 70;
          smallCaps(row.label, R.x + 14, top + 8);
          drawRow(row.items, R.x + R.w / 2, top + 40, R.w - 24, 20, 11);
        });
      }
    }

    /** Messszene: Bruch als Balken, Streifen des Divisors nacheinander angelegt. */
    function drawMeasure(R: Rect, wide: boolean): void {
      const g = surface.g;
      const T = ctx.theme;
      const x = X1();
      const y = X2();
      const m = measure(x, y);
      const A = x.z / x.n;
      const C = y.z / y.n;
      panel(R);
      const title = rich('measTitle', { c: frT(y.z, y.n, colB()), a: frT(x.z, x.n, colA()) }, { bold: true });
      const tsz = wide ? 14 : 12.5;
      const titleH = drawRich(g, title, R.x + 16, R.y + 8, { size: tsz, font: F(), color: T.text, maxW: R.w - 32, align: 'left' });
      const U = clamp(Math.ceil(Math.max(A, C, 1) - 1e-9), 1, MAXV);
      const labW = wide ? 54 : 40;
      const x0 = R.x + labW;
      const x1 = R.x + R.w - (wide ? 24 : 14);
      const uw = (x1 - x0) / U;
      const X = (v: number) => x0 + v * uw;
      // Fußzeile
      const msg = measureMessage();
      const fsz = msgSize();
      const fh = messageHeight(R.w - 32, msg, fsz);
      const top = R.y + 8 + titleH + 10;
      const gap = wide ? 12 : 10;
      const pillH = m.restParts > 0 ? 32 : 8;
      const axisH = 30;
      const room = R.y + R.h - fh - 14 - top;
      const bh = clamp((room - gap - pillH - axisH) / 2, 16, wide ? 36 : 30);
      const block = 2 * bh + gap + pillH + axisH;
      const yA = top + Math.max(0, (room - block) / 2);
      const yS = yA + bh + gap;
      const yAxis = yS + bh + pillH + 10;
      // alles innerhalb des Felds halten (Streifen können über das Ende hinausragen)
      g.save();
      roundRect(g, R.x, R.y, R.w, R.h, 14);
      g.clip();
      const u = measureTween.running ? measureTween.t : 1;
      const nStrips = m.full + (m.restParts > 0 ? 1 : 0);
      // Zeitplan der Animation: Balken, dann Streifen einer nach dem anderen, dann gemeinsame Teilung
      const tStrip0 = 0.12;
      const tStripsEnd = 0.78;
      const per = nStrips > 0 ? (tStripsEnd - tStrip0) / nStrips : 0;
      const phBar = seg(u, 0, 0.12);
      const phCommon = seg(u, 0.8, 1);
      // Spur der Ganzen
      g.fillStyle = withAlpha(T.text, T.dark ? 0.06 : 0.045);
      roundRect(g, X(0), yA, X(U) - X(0), bh, 6);
      g.fill();
      roundRect(g, X(0), yS, X(U) - X(0), bh, 6);
      g.fill();
      // Dividend
      const aw = (X(A) - X(0)) * ease.outCubic(phBar);
      g.save();
      roundRect(g, X(0), yA, Math.max(0.1, aw), bh, 6);
      g.clip();
      const grad = g.createLinearGradient(0, yA, 0, yA + bh);
      grad.addColorStop(0, alpha(colA(), 0.75));
      grad.addColorStop(1, colA());
      g.fillStyle = grad;
      g.fillRect(X(0), yA, aw, bh);
      g.strokeStyle = alpha('#ffffff', 0.85);
      g.lineWidth = 1.6;
      for (let i = 1; i < x.z; i++) {
        const xx = X(i / x.n);
        g.beginPath();
        g.moveTo(xx, yA);
        g.lineTo(xx, yA + bh);
        g.stroke();
      }
      g.restore();
      const sideLabel = (f: Fraction, cy: number, color: string) => {
        const fs = wide ? 15 : 13;
        if (f.n === 1) text(g, String(f.z), R.x + labW / 2, cy + 0.5, { font: `800 ${fs + 3}px ${F()}`, color });
        else drawFrac(g, R.x + labW / 2, cy, String(f.z), String(f.n), fs, color, F());
      };
      sideLabel(x, yA + bh / 2, colA());
      sideLabel(y, yS + bh / 2, colB());
      // Streifen
      const sw = C * uw;
      for (let k = 0; k < nStrips; k++) {
        const t0 = tStrip0 + k * per;
        const pk = measureTween.running ? ease.inOutCubic(seg(u, t0, t0 + per * 0.85)) : 1;
        if (pk <= 0) continue;
        const partial = k === m.full;
        const from = k === 0 ? X(0) - sw * 0.25 : X((k - 1) * C);
        const sx = lerp(from, X(k * C), pk);
        const lift = k === 0 ? (1 - pk) * 14 : Math.sin(Math.PI * pk) * 10;
        const sy = yS - lift;
        g.save();
        g.globalAlpha = k === 0 ? pk : 1;
        if (partial) {
          // ganzer Streifen gestrichelt, passender Teil schraffiert
          const fillW = (A - m.full * C) * uw;
          const settled = pk >= 1;
          g.fillStyle = alpha(colB(), T.dark ? 0.22 : 0.14);
          roundRect(g, sx, sy, settled ? fillW : sw, bh, 5);
          g.fill();
          if (settled) hatch(sx, sy, fillW, bh, alpha(colB(), 0.85), 6);
          g.setLineDash([5, 4]);
          g.strokeStyle = alpha(colB(), 0.9);
          g.lineWidth = 1.6;
          roundRect(g, sx, sy, sw, bh, 5);
          g.stroke();
          g.setLineDash([]);
        } else {
          g.save();
          softShadow(g, T.dark, 6, 2);
          const sg = g.createLinearGradient(0, sy, 0, sy + bh);
          sg.addColorStop(0, alpha(colB(), 0.78));
          sg.addColorStop(1, colB());
          g.fillStyle = sg;
          roundRect(g, sx, sy, sw, bh, 5);
          g.fill();
          g.restore();
        }
        // Teilung des Streifens in 1/d
        g.strokeStyle = partial ? alpha(colB(), 0.5) : alpha('#ffffff', 0.85);
        g.lineWidth = 1.4;
        for (let i = 1; i < y.z; i++) {
          const xx = sx + (i / y.n) * uw;
          g.beginPath();
          g.moveTo(xx, sy + 2);
          g.lineTo(xx, sy + bh - 2);
          g.stroke();
        }
        // Nummer des Streifens als Plakette links im Streifen
        const br = Math.min(9.5, bh * 0.34);
        if (!partial && sw >= 2 * br + 8) {
          g.fillStyle = alpha('#ffffff', 0.92);
          g.beginPath();
          g.arc(sx + br + 5, sy + bh / 2, br, 0, Math.PI * 2);
          g.fill();
          text(g, String(k + 1), sx + br + 5, sy + bh / 2 + 0.5, { font: `800 ${Math.round(br * 1.2)}px ${F()}`, color: colB() });
        }
        g.restore();
      }
      // Rest als Anteil des Streifens
      if (m.restParts > 0 && (!measureTween.running || u >= tStripsEnd)) {
        const sx = X(m.full * C);
        const fillW = (A - m.full * C) * uw;
        const fs = wide ? 12 : 11;
        const tok: Token[] = [frT(m.restOfStrip.z, m.restOfStrip.n, colB()), { t: ` ${ctx.t('ofStrip')}`, color: colB(), bold: true }];
        const tw = fracWidth(g, String(m.restOfStrip.z), String(m.restOfStrip.n), fs * 0.82, F()) + (() => {
          g.font = `750 ${fs}px ${F()}`;
          return g.measureText(` ${ctx.t('ofStrip')}`).width;
        })() + 16;
        const cx = clamp(sx + fillW / 2, R.x + tw / 2 + 6, R.x + R.w - tw / 2 - 6);
        const cy = yS + bh + 4 + fs;
        g.save();
        softShadow(g, T.dark, 6, 2);
        g.fillStyle = T.bg;
        roundRect(g, cx - tw / 2, cy - fs * 1.1, tw, fs * 2.2, fs * 1.1);
        g.fill();
        g.restore();
        g.strokeStyle = alpha(colB(), 0.7);
        g.lineWidth = 1.2;
        roundRect(g, cx - tw / 2, cy - fs * 1.1, tw, fs * 2.2, fs * 1.1);
        g.stroke();
        drawRich(g, tok, cx, cy - fs * 0.98, { size: fs, font: F(), color: colB(), maxW: 400, align: 'center' });
      }
      // gemeinsame Teilung (gleichnamig): feine Striche in beiden Reihen
      const tick = uw / m.N;
      if (phCommon > 0 && tick >= 4) {
        g.save();
        g.globalAlpha = phCommon;
        g.strokeStyle = colP();
        g.lineWidth = 1.2;
        for (let i = 1; i < U * m.N; i++) {
          const xx = X(i / m.N);
          for (const yy of [yA, yS]) {
            g.beginPath();
            g.moveTo(xx, yy - 4);
            g.lineTo(xx, yy);
            g.stroke();
          }
        }
        g.restore();
      }
      // Zahlenstrahl unter den Streifen (nur Ganze, um die Rest-Plakette nicht zu stören)
      {
        g.strokeStyle = T.axis;
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(X(0), yAxis);
        g.lineTo(X(U) + 8, yAxis);
        g.stroke();
        for (let k = 0; k <= U; k++) {
          g.beginPath();
          g.moveTo(X(k), yAxis - 5);
          g.lineTo(X(k), yAxis + 5);
          g.stroke();
          text(g, String(k), X(k), yAxis + 14, { font: `700 ${wide ? 11.5 : 11}px ${F()}`, color: T.muted });
        }
      }
      g.restore();
      message({ x: R.x + 16, y: R.y + R.h - fh - 8, w: R.w - 32, h: fh }, msg, fsz);
    }

    function measureMessage(): MsgLine[] {
      const x = X1();
      const y = X2();
      const m = measure(x, y);
      const fa = frT(x.z, x.n, colA());
      const fc = frT(y.z, y.n, colB());
      const fres = frT(m.restOfStrip.z, m.restOfStrip.n, colB());
      const first =
        m.restParts === 0
          ? rich('fitsExact', { c: fc, a: fa, k: bold(String(m.full), colP()) })
          : m.full === 0
            ? rich('fitsNone', { c: fc, a: fa, r: fres })
            : rich('fitsMany', { c: fc, a: fa, k: bold(String(m.full), colP()), r: fres });
      const name = denomName(m.N);
      const second =
        x.n === m.N && y.n === m.N
          ? rich('piecesSame', { A: bold(String(m.A), colA()), C: bold(String(m.C), colB()) })
          : rich('pieces', { a: fa, c: fc, A: bold(String(m.A), colA()), C: bold(String(m.C), colB()), name: bold(name, colP()) });
      return [{ tokens: first }, { tokens: second, color: ctx.theme.muted }];
    }

    /** Name der Bruchteile (Zwölftel, twelfths …), sonst „N-tel“. */
    function denomName(n: number): string {
      if (lang === 'de') {
        const w = ['', 'Ganze', 'Halbe', 'Drittel', 'Viertel', 'Fünftel', 'Sechstel', 'Siebtel', 'Achtel', 'Neuntel', 'Zehntel', 'Elftel', 'Zwölftel'];
        if (n < w.length) return w[n]!;
        if (n < 20) return `${['', '', '', 'Drei', 'Vier', 'Fünf', 'Sechs', 'Sieb', 'Acht', 'Neun'][n - 10] ?? ''}zehntel`;
        return `${n}-tel`;
      }
      const e = ['', 'wholes', 'halves', 'thirds', 'quarters', 'fifths', 'sixths', 'sevenths', 'eighths', 'ninths', 'tenths', 'elevenths', 'twelfths'];
      return n < e.length ? e[n]! : `${n}ths`;
    }

    /** Kehrwert-Szene: Wie oft passt der Divisor in 1? */
    function drawRecip(R: Rect, wide: boolean): void {
      const g = surface.g;
      const T = ctx.theme;
      const x = X1();
      const y = X2();
      const C = y.z / y.n;
      const rc = reciprocal(y);
      panel(R);
      const title = rich('kwTitle', { c: frT(y.z, y.n, colB()) }, { bold: true });
      const titleH = drawRich(g, title, R.x + 16, R.y + 8, { size: wide ? 13.5 : 12.5, font: F(), color: T.text, maxW: wide ? R.w * 0.55 : R.w - 32, align: 'left' });
      const msg: MsgLine[] = [{ tokens: rich('kwText', { c: frT(y.z, y.n, colB()), r: rc.n === 1 ? bold(String(rc.z), colB()) : frT(rc.z, rc.n, colB()), a: frT(x.z, x.n, colA()) }) }];
      const fsz = msgSize();
      const textW = wide ? Math.min(330, R.w * 0.42) : R.w - 32;
      const fh = messageHeight(textW, msg, fsz);
      // Bildbereich
      const sceneW = wide ? R.w - textW - 56 : R.w - 32;
      const sx0 = R.x + 22;
      const top = R.y + 8 + titleH + 6;
      const bh = clamp((R.h - (wide ? 60 : 150)) / 3.2, 16, wide ? 30 : 24);
      const unitPx = Math.min(sceneW - 10, (sceneW - 10) / Math.max(1, C));
      const X = (v: number) => sx0 + v * unitPx;
      const yU = top + 4;
      const yS = yU + bh + 8;
      g.save();
      g.beginPath();
      g.rect(R.x, R.y, sx0 - R.x + sceneW, R.h);
      g.clip();
      // Einheit
      g.fillStyle = withAlpha(T.text, T.dark ? 0.16 : 0.1);
      roundRect(g, X(0), yU, unitPx, bh, 5);
      g.fill();
      g.strokeStyle = withAlpha(T.text, 0.55);
      g.lineWidth = 1.4;
      roundRect(g, X(0), yU, unitPx, bh, 5);
      g.stroke();
      text(g, ctx.t('unit'), X(0.5), yU + bh / 2 + 0.5, { font: `750 ${wide ? 11.5 : 10.5}px ${F()}`, color: T.text });
      // Streifen
      const full = Math.floor(y.n / y.z);
      const restZ = y.n - full * y.z;
      const sw = C * unitPx;
      for (let k = 0; k < full; k++) {
        const sx = X(k * C);
        g.fillStyle = colB();
        roundRect(g, sx + 0.5, yS, sw - 1, bh, 4);
        g.fill();
        if (sw > 14) text(g, String(k + 1), sx + sw / 2, yS + bh / 2 + 0.5, { font: `800 ${Math.min(12, bh * 0.55)}px ${F()}`, color: '#ffffff' });
      }
      if (restZ > 0) {
        const sx = X(full * C);
        const fillW = (1 - full * C) * unitPx;
        g.fillStyle = alpha(colB(), T.dark ? 0.22 : 0.14);
        roundRect(g, sx, yS, fillW, bh, 4);
        g.fill();
        hatch(sx, yS, fillW, bh, alpha(colB(), 0.85), 5);
        g.setLineDash([4, 4]);
        g.strokeStyle = alpha(colB(), 0.9);
        g.lineWidth = 1.4;
        roundRect(g, sx, yS, sw, bh, 4);
        g.stroke();
        g.setLineDash([]);
      }
      g.restore();
      // Ergebnis 1 : c/d = d/c rechts neben bzw. unter dem Bild
      const items: FItem[] = [{ k: 'num', s: '1', color: T.text }, op(ctx.t('divSign')), fItem(y, colB()), op('='), ...resultItems(rc, colB())];
      if (wide) {
        const tx = R.x + R.w - textW - 16;
        drawRow(items, tx, R.y + 26 + 6, textW, 20, 12, 'left');
        message({ x: tx, y: R.y + 54, w: textW, h: fh }, msg, fsz);
      } else {
        const ry = yS + bh + 26;
        drawRow(items, R.x + R.w / 2, ry, R.w - 32, 18, 11);
        message({ x: R.x + 16, y: ry + 26, w: R.w - 32, h: fh }, msg, fsz);
      }
    }

    function drawDurch(): boolean {
      const geo = durchGeo();
      drawDurchCard(geo.card, geo.wide);
      drawMeasure(geo.meas, geo.wide);
      drawRecip(geo.kw, !geo.stackedKw);
      return measureTween.running;
    }

    /* ================================================================ */
    /* Ergebnisse                                                       */
    /* ================================================================ */
    const frac = (z: number | string, n: number | string) => `<span class="frac"><span>${z}</span><span>${n}</span></span>`;
    /** Bruch als HTML, Nenner 1 als ganze Zahl. */
    const fracH = (f: Fraction) => (f.n === 1 ? String(f.z) : frac(f.z, f.n));
    const fracR = (f: Fraction) => {
      const r = reduce(f);
      if (r.n === 1) return String(r.z);
      if (r.z > r.n) {
        const m = mixed(r);
        return `${frac(r.z, r.n)} = ${m.whole} ${frac(m.rest.z, m.rest.n)}`;
      }
      return frac(r.z, r.n);
    };

    function updateReadouts(): void {
      const x = X1();
      const y = X2();
      const ds = ctx.t('divSign');
      if (mode() === 'mal') {
        const pr = multiply(x, y);
        const r = reduce(pr.raw);
        const parts = [`${fracH(x)} · ${fracH(y)}`, frac(pr.raw.z, pr.raw.n)];
        if (r.n === 1) parts.push(String(r.z));
        else {
          if (r.z !== pr.raw.z) parts.push(frac(r.z, r.n));
          if (r.z > r.n) {
            const mx = mixed(r);
            parts.push(`${mx.whole} ${frac(mx.rest.z, mx.rest.n)}`);
          }
        }
        ctx.readout('prod', { html: parts.join(' = ') });
        ctx.readout('cells', lang === 'de' ? `${pr.cells} Felder; ein Ganzes hat ${pr.cellsPerWhole} Felder` : `${pr.cells} cells; one whole has ${pr.cellsPerWhole} cells`);
        ctx.readout('quot', null);
        ctx.readout('common', null);
        ctx.readout('recip', null);
      } else {
        const m = measure(x, y);
        const dv = divide(x, y);
        ctx.readout('prod', null);
        ctx.readout('cells', null);
        ctx.readout('quot', { html: `${fracH(x)} ${ds} ${fracH(y)} = ${fracH(x)} · ${fracH(dv.viaReciprocal)} = ${fracR(dv.raw)}` });
        ctx.readout('common', { html: `${frac(m.A, m.N)} ${ds} ${frac(m.C, m.N)} = ${m.A} ${ds} ${m.C}` });
        ctx.readout('recip', { html: `${fracH(y)} → ${fracH(dv.viaReciprocal)}` });
      }
    }

    /* ---------- Zeiger ---------- */
    function hitAt(px: number, py: number): Hit | null {
      for (let i = hits.length - 1; i >= 0; i--) {
        const h = hits[i]!;
        if (h.r !== undefined) {
          if (Math.hypot(px - h.x, py - h.y) <= h.r) return h;
        } else if (px >= h.x && px <= h.x + h.w && py >= h.y && py <= h.y + h.h) return h;
      }
      return null;
    }

    function dragTo(px: number, py: number): void {
      const G = lastGrid;
      if (!G || ctx.locked) return;
      if (drag === 'hA') {
        const a = clamp(Math.round(((px - G.ox) / G.s) * p.n1), 1, MAXV * p.n1);
        if (a !== p.z1) ctx.set({ z1: a });
      } else if (drag === 'hC') {
        const c = clamp(Math.round(((G.oy - py) / G.s) * p.n2), 1, MAXV * p.n2);
        if (c !== p.z2) ctx.set({ z2: c });
      }
    }

    surface.addTarget({
      contains: (px: number, py: number) => hitAt(px, py) !== null,
      pointerDown: (pt: { px: number; py: number }) => {
        const h = hitAt(pt.px, pt.py);
        if (!h) return false;
        if ((h.id === 'hA' || h.id === 'hC') && !ctx.locked) {
          drag = h.id;
          buildTween.finish();
        }
        ctx.requestRender();
        return true;
      },
      pointerMove: (pt: { px: number; py: number }) => {
        if (!drag) return;
        dragTo(pt.px, pt.py);
        ctx.requestRender();
      },
      pointerUp: () => {
        drag = null;
        ctx.requestRender();
      },
      hover: (pt: { px: number; py: number } | null) => {
        const h = pt ? hitAt(pt.px, pt.py) : null;
        const id = h ? h.id : null;
        if (id !== hover) {
          hover = id;
          ctx.requestRender();
        }
        surface.setCursor(h ? (h.cursor ?? 'pointer') : '');
      },
      wheel: () => false,
    });

    return {
      update(changed, source) {
        // höchstens drei Ganze
        if (source === 'input') {
          if (p.z1 > MAXV * p.n1) ctx.set({ z1: MAXV * p.n1 });
          if (p.z2 > MAXV * p.n2) ctx.set({ z2: MAXV * p.n2 });
        }
        if (changed.has('mode') || source === 'replace' || source === 'init') {
          dispSnap = true;
          buildTween.finish();
          measureTween.finish();
        }
        if (mode() === 'durch' && ['z1', 'n1', 'z2', 'n2'].some((k) => changed.has(k)) && source !== 'init') measureTween.finish();
        updateReadouts();
      },

      action(id) {
        if (id === 'build') {
          buildTween.play(reduced ? 0 : 2600);
        } else if (id === 'swap') {
          if (!ctx.locked) ctx.set({ z1: p.z2, n1: p.n2, z2: p.z1, n2: p.n1 });
        } else if (id === 'measure') {
          const m = measure(X1(), X2());
          const n = m.full + (m.restParts > 0 ? 1 : 0);
          measureTween.play(900 + 600 * Math.min(n, 12) + 700);
        }
        ctx.requestRender();
      },

      render() {
        const now = performance.now();
        const dt = Math.min(0.1, (now - lastNow) / 1000);
        lastNow = now;
        hits = [];
        surface.begin();
        const anim = mode() === 'mal' ? drawMal(dt) : drawDurch();
        if (anim) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
