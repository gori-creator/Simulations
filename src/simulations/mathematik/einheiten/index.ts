import { defineSimulation, ease, prefersReducedMotion, roundRect, shade, Surface, text, type ChoiceParam, type Rect } from '../../../sim-core';
import {
  convert,
  conversionText,
  digitsOf,
  formatDec,
  groupInt,
  illustrationPair,
  inputText,
  mixedText,
  mixedTime,
  parseAmount,
  placeDigits,
  placeLabel,
  QUANTITIES,
  randomTask,
  ratioToDec,
  relationText,
  tableResult,
  tableUnits,
  timeChain,
  unitOf,
  type Conversion,
  type Dec,
  type Lang,
  type Placed,
  type QuantityId,
  type TableUnit,
  type UnitDef,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Loc = { de: string; en: string };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const C30 = Math.cos(Math.PI / 6);

/* ------------------------------------------------------------------ */
/* Parameter                                                           */
/* ------------------------------------------------------------------ */

const FROM_KEY = { len: 'lf', mass: 'mf', time: 'tf', area: 'af', vol: 'vf' } as const;
const TO_KEY = { len: 'lt', mass: 'mt', time: 'tt', area: 'at', vol: 'vt' } as const;

/** Beispielwert, wenn der Größenbereich gewechselt wird. */
const START_VALUE: Record<QuantityId, string> = { len: '3,5', mass: '2,4', time: '135', area: '3,5', vol: '2,5' };

function unitParam<K extends string>(q: QuantityId, key: K, label: Loc, def: string): ChoiceParam<K> {
  return {
    key,
    type: 'choice',
    label,
    options: QUANTITIES[q].units.map((u) => ({ value: u.id, label: L(u.sym, u.sym) })),
    default: def,
    visibleIf: (v) => v.q === q,
  };
}
const FROM_LABEL = L('Einheit der Größe', 'Unit of the quantity');
const TO_LABEL = L('Umrechnen in', 'Convert to');

/** Weich gleitender Wert (Glide wie in den Vorbildern). */
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
  go(to: number, ms = 650): void {
    const now = performance.now();
    if (to === this.to) return;
    this.from = this.at(now);
    this.to = to;
    this.t0 = now;
    this.ms = this.reduced ? 0 : ms;
  }
  snap(v: number): void {
    this.from = v;
    this.to = v;
    this.ms = 0;
  }
}

interface Geo {
  W: number;
  H: number;
  wide: boolean;
  C: Rect;
  panel: Rect;
}

interface Hit {
  id: string;
  r: Rect;
}

/** Was gerade umgerechnet wird (aus den Reglern abgeleitet, zwischengespeichert). */
interface State {
  key: string;
  q: QuantityId;
  value: Dec | null;
  from: UnitDef;
  to: UnitDef;
  conv: Conversion | null;
  /** Einheitentafel (nicht bei der Zeit). */
  units: TableUnit[];
  given: Placed[];
  res: ReturnType<typeof tableResult> | null;
  /** ganze Tafel einschließlich Zusatzspalten */
  colHi: number;
  colLo: number;
  /** Spalten, die zu sehen sein müssen */
  needHi: number;
  needLo: number;
  overflow: boolean;
}

/** Seitenlänge der Flächeneinheiten (für die Beschriftung der Quadrate). */
const AREA_SIDE: Record<string, [number, string]> = { mm2: [1, 'mm'], cm2: [1, 'cm'], dm2: [1, 'dm'], m2: [1, 'm'], a: [10, 'm'], ha: [100, 'm'], km2: [1, 'km'] };
const VOL_SIDE: Record<string, string> = { mm3: 'mm', cm3: 'cm', dm3: 'dm', m3: 'm' };
const LEN_IN_MM: Record<string, number> = { mm: 1, cm: 10, dm: 100, m: 1000, km: 1e6 };

/** Merksätze je Größenbereich. */
const MERKE: Record<QuantityId, Loc> = {
  len: L('Benachbarte Längeneinheiten: Umrechnungszahl 10 – nur von km zu m ist es 1 000.', 'Neighbouring length units: factor 10 – only from km to m it is 1,000.'),
  mass: L('Benachbarte Masseeinheiten: Umrechnungszahl 1 000, also drei Spalten je Einheit.', 'Neighbouring mass units: factor 1,000, so three columns per unit.'),
  time: L('Zeit rechnet nicht im Zehnersystem: 1 d = 24 h, 1 h = 60 min, 1 min = 60 s.', 'Time does not work in tens: 1 d = 24 h, 1 h = 60 min, 1 min = 60 s.'),
  area: L('Benachbarte Flächeneinheiten: Umrechnungszahl 100, also zwei Spalten je Einheit.', 'Neighbouring area units: factor 100, so two columns per unit.'),
  vol: L('Benachbarte Volumeneinheiten: Umrechnungszahl 1 000. 1 dm³ = 1 l, 1 cm³ = 1 ml.', 'Neighbouring volume units: factor 1,000. 1 dm³ = 1 l, 1 cm³ = 1 ml.'),
};

/**
 * Einheiten umrechnen: Eine Größe liegt mit Ziffernkärtchen in der
 * Einheitentafel; beim Umrechnen wandert das Komma Spalte für Spalte, fehlende
 * Nullen werden blass ergänzt. Bei der Zeit eine Umrechnungskette mit
 * 60, 60 und 24. Dazu eine gezeichnete Anschauung (Lineal, Waage, Uhr,
 * Kästchenquadrat, Würfel aus Einheitswürfeln).
 */
export default defineSimulation({
  id: 'einheiten',
  layout: { aspect: 1.6, aspectNarrow: 0.6 },
  params: [
    {
      key: 'q',
      type: 'choice',
      label: L('Größe', 'Quantity'),
      options: [
        { value: 'len', label: L('Länge', 'Length') },
        { value: 'mass', label: L('Masse', 'Mass') },
        { value: 'time', label: L('Zeit', 'Time') },
        { value: 'area', label: L('Fläche', 'Area') },
        { value: 'vol', label: L('Volumen', 'Volume') },
      ],
      default: 'len',
    },
    {
      key: 'v',
      type: 'text',
      label: L('Maßzahl', 'Number'),
      default: '3,5',
      maxLength: 16,
      placeholder: L('z. B. 3,5 oder 250', 'e.g. 3.5 or 250'),
      help: L('Zahl mit Dezimalkomma; Leerzeichen zum Gliedern sind erlaubt.', 'A number with a decimal point; spaces for grouping are allowed.'),
    },
    unitParam('len', 'lf', FROM_LABEL, 'km'),
    unitParam('len', 'lt', TO_LABEL, 'm'),
    unitParam('mass', 'mf', FROM_LABEL, 't'),
    unitParam('mass', 'mt', TO_LABEL, 'kg'),
    unitParam('time', 'tf', FROM_LABEL, 'min'),
    unitParam('time', 'tt', TO_LABEL, 'h'),
    unitParam('area', 'af', FROM_LABEL, 'm2'),
    unitParam('area', 'at', TO_LABEL, 'dm2'),
    unitParam('vol', 'vf', FROM_LABEL, 'l'),
    unitParam('vol', 'vt', TO_LABEL, 'ml'),
    {
      key: 'show',
      type: 'boolean',
      label: L('Ergebnis sofort anzeigen', 'Show the result right away'),
      default: true,
      help: L('Ausgeschaltet erst selbst rechnen, dann „Umrechnen“ antippen.', 'When off, work it out first, then tap “Convert”.'),
    },
  ],
  actions: [
    { id: 'go', label: L('Umrechnen', 'Convert'), primary: true },
    { id: 'task', label: L('Neue Aufgabe', 'New task') },
    { id: 'swap', label: L('Rückweg ⇄', 'Way back ⇄') },
  ],
  readouts: [
    { key: 'task', label: L('Aufgabe', 'Task') },
    { key: 'res', label: L('Ergebnis', 'Result'), spoiler: true },
    { key: 'how', label: L('So geht’s', 'How it works'), spoiler: true },
    { key: 'rel', label: L('Umrechnungszahl', 'Conversion factor'), spoiler: true },
    { key: 'mixed', label: L('Gemischte Schreibweise', 'Mixed units'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('3,5 km in m', '3.5 km to m'), values: {} },
    { id: 'bigger', label: L('250 cm in m (größere Einheit)', '250 cm to m (larger unit)'), values: { v: '250', lf: 'cm', lt: 'm' } },
    { id: 'zeros', label: L('45 g in kg (Nullen ergänzen)', '45 g to kg (add zeros)'), values: { q: 'mass', v: '45', mf: 'g', mt: 'kg' } },
    { id: 'area', label: L('3,5 m² in dm²', '3.5 m² to dm²'), values: { q: 'area', v: '3,5', af: 'm2', at: 'dm2' } },
    { id: 'litre', label: L('2,5 l in ml', '2.5 l to ml'), values: { q: 'vol', v: '2,5', vf: 'l', vt: 'ml' } },
    { id: 'time', label: L('135 min = 2 h 15 min', '135 min = 2 h 15 min'), values: { q: 'time', v: '135', tf: 'min', tt: 'h' } },
  ],
  strings: {
    de: { canvas: 'Einheitentafel mit Ziffernkärtchen, in der beim Umrechnen das Komma Spalte für Spalte wandert; bei der Zeit eine Umrechnungskette; daneben eine Anschauung mit Lineal, Waage, Uhr, Kästchenquadrat oder Würfel' },
    en: { canvas: 'Unit conversion chart with digit cards in which the decimal point moves column by column; for time a conversion chain; next to it an illustration with ruler, balance, clock, grid square or cube' },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const pv = p as unknown as Record<string, string>;
    const lang = ctx.lang as Lang;
    const reduced = prefersReducedMotion();
    const T = (l: Loc) => l[lang];
    const tt = (de: string, en: string) => (lang === 'de' ? de : en);
    const alpha = (c: string, a: number) => shade(c, 0, a);
    const fd = (d: Dec) => formatDec(d, lang);
    const gi = (n: number | bigint) => groupInt(String(n), lang);

    let now = performance.now();
    let geo: Geo | null = null;
    let hits: Hit[] = [];
    let hover: string | null = null;

    /* ---------------- Zeitablauf ---------------- */
    const DROP = 420;
    const STAGGER = 70;
    let sceneStart = now + (reduced ? -1e6 : 40);
    const sceneA = () => (reduced ? 1 : ease.outCubic(clamp((now - sceneStart) / 450, 0, 1)));
    /** Ab hier fallen die Ziffernkärtchen in die Tafel. */
    let layAt = now + 200;
    /** Ab hier wandert das Komma (null: wartet auf „Umrechnen“). */
    let hopAt: number | null = null;
    /** Ab hier läuft die Anschauung. */
    let illAt = now + 350;
    let illKey = '';
    let revealed = p.show;
    let taskPending = false;
    const winHi = new Glide(0, reduced);
    const winLo = new Glide(0, reduced);
    let winInit = false;

    /* ---------------- Zustand ---------------- */
    let state: State | null = null;
    function getState(): State {
      const q = p.q as QuantityId;
      const fromId = pv[FROM_KEY[q]]!;
      const toId = pv[TO_KEY[q]]!;
      const key = `${q}|${p.v}|${fromId}|${toId}`;
      if (state && state.key === key) return state;
      const def = QUANTITIES[q];
      const from = unitOf(q, fromId) ?? def.units[0]!;
      const to = unitOf(q, toId) ?? def.units[1]!;
      const value = parseAmount(p.v);
      const conv = value ? convert(q, value, from.id, to.id) : null;
      const units = def.decimal ? tableUnits(q) : [];
      let given: Placed[] = [];
      let res: State['res'] = null;
      let colHi = 0;
      let colLo = 0;
      let needHi = 0;
      let needLo = 0;
      let overflow = false;
      if (def.decimal && units.length) {
        colHi = units[0]!.hi;
        colLo = 0;
        const fu = units.find((t) => t.unit.exp === from.exp)!;
        const tu = units.find((t) => t.unit.exp === to.exp)!;
        needHi = Math.max(fu.hi, tu.hi);
        needLo = Math.min(fu.lo, tu.lo, Math.max(0, from.exp - 1), Math.max(0, to.exp - 1));
        if (value) {
          given = placeDigits(value, from.exp);
          res = tableResult(value, from.exp, to.exp);
          const cols = [...given.map((g) => g.col), res.hi, res.lo];
          needHi = Math.max(needHi, ...cols);
          needLo = Math.min(needLo, ...cols);
          if (needHi > colHi + 3 || needLo < colLo - 4) overflow = true;
          colHi = Math.max(colHi, Math.min(needHi, colHi + 3));
          colLo = Math.min(colLo, Math.max(needLo, colLo - 4));
          needHi = Math.min(needHi, colHi);
          needLo = Math.max(needLo, colLo);
        }
      }
      state = { key, q, value, from, to, conv, units, given, res, colHi, colLo, needHi, needLo, overflow };
      return state;
    }

    /* ---------------- Zeiten der Animation ---------------- */
    const layEnd = (st: State) => layAt + Math.max(1, st.given.length || 1) * STAGGER + DROP;
    function hopTiming(st: State): { n: number; hop: number; start: number; end: number; zerosEnd: number; resEnd: number } {
      const n = st.q === 'time' ? timeSteps(st).length : Math.abs(st.conv?.shift ?? 0);
      const hop = st.q === 'time' ? 780 : n ? clamp(2400 / n, 300, 520) : 0;
      const start = hopAt ?? Infinity;
      const end = start + n * hop;
      return { n, hop, start, end, zerosEnd: end + 500, resEnd: end + 1000 };
    }
    function timeSteps(st: State) {
      return st.value ? timeChain(st.value, st.from.id, st.to.id) : [];
    }

    /** Neu legen (Zahl oder Ausgangseinheit geändert) und ggf. danach umrechnen. */
    function relay(delay = 120): void {
      now = performance.now();
      layAt = now + (reduced ? -1e6 : delay);
      const st = getState();
      hopAt = revealed ? (reduced ? -1e6 : layEnd(st) + 180) : null;
    }
    /** Nur die Zieleinheit geändert: Kärtchen bleiben liegen, das Komma wandert neu. */
    function rehop(delay = 200): void {
      now = performance.now();
      const st = getState();
      hopAt = revealed ? (reduced ? -1e6 : Math.max(now + delay, layEnd(st) + 120)) : null;
    }
    function restartIllustration(st: State): void {
      const pair = illustrationPair(st.q, st.from.id, st.to.id);
      const key = `${st.q}|${pair.big.id}|${pair.small.id}`;
      if (key !== illKey) {
        illKey = key;
        illAt = performance.now() + (reduced ? -1e6 : 250);
      }
    }

    /* ---------------- Zeichenhelfer ---------------- */
    const font = (w: number, s: number) => `${w} ${s}px ${ctx.theme.font}`;
    const cardBg = () => (ctx.theme.dark ? shade(ctx.theme.bg, 0.06) : '#ffffff');
    const cFrom = () => shade(ctx.theme.series[0]!, ctx.theme.dark ? 0.15 : -0.1);
    const cTo = () => shade(ctx.theme.series[3]!, ctx.theme.dark ? 0.1 : -0.12);

    function halo(value: string, x: number, y: number, f: string, color: string, align: CanvasTextAlign = 'center', a = 1): void {
      const g = surface.g;
      if (a <= 0.01) return;
      g.save();
      g.globalAlpha *= a;
      g.font = f;
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      g.lineWidth = 4;
      g.strokeStyle = alpha(cardBg(), 0.92);
      g.strokeText(value, x, y);
      g.fillStyle = color;
      g.fillText(value, x, y);
      g.restore();
    }

    function measure(str: string, f: string): number {
      surface.g.font = f;
      return surface.g.measureText(str).width;
    }

    function wrap(value: string, maxW: number, f: string): string[] {
      const rows: string[] = [];
      let cur = '';
      for (const w of value.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (measure(next, f) > maxW && cur) {
          rows.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) rows.push(cur);
      return rows;
    }

    /** Schrift so verkleinern, dass der Text in maxW passt. */
    function fitSize(str: string, weight: number, size: number, maxW: number, min = 11): number {
      const w = measure(str, font(weight, size));
      return w <= maxW ? size : Math.max(min, Math.floor((size * maxW) / w));
    }

    function card(r: Rect, radius = 16): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 20;
      g.shadowOffsetY = 5;
      roundRect(g, r.x, r.y, r.w, r.h, radius);
      const grad = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      grad.addColorStop(0, theme.dark ? shade(theme.bg, 0.075) : '#ffffff');
      grad.addColorStop(1, theme.dark ? shade(theme.bg, 0.035) : shade(theme.bg, -0.018));
      g.fillStyle = grad;
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = alpha(theme.text, theme.dark ? 0.1 : 0.07);
      g.lineWidth = 1;
      g.stroke();
      g.restore();
    }

    const addHit = (id: string, r: Rect) => hits.push({ id, r });
    const hitAt = (px: number, py: number): Hit | null => {
      for (let i = hits.length - 1; i >= 0; i--) {
        const h = hits[i]!;
        if (px >= h.r.x && px <= h.r.x + h.r.w && py >= h.r.y && py <= h.r.y + h.r.h) return h;
      }
      return null;
    };

    /** Kette farbiger Textstücke mittig (verkleinert, wenn zu breit). Liefert die Lage der Stücke. */
    function richLine(parts: { s: string; c: string; w?: number; box?: boolean }[], cx: number, y: number, size: number, maxW: number, a = 1): { x: number; w: number }[] {
      const g = surface.g;
      let total = parts.reduce((acc, pt) => acc + measure(pt.s, font(pt.w ?? 800, size)), 0);
      let s = size;
      if (total > maxW) {
        s = Math.max(11, (size * maxW) / total);
        total = parts.reduce((acc, pt) => acc + measure(pt.s, font(pt.w ?? 800, s)), 0);
      }
      let x = cx - total / 2;
      const out: { x: number; w: number }[] = [];
      g.save();
      g.globalAlpha *= a;
      for (const pt of parts) {
        const f = font(pt.w ?? 800, s);
        const w = measure(pt.s, f);
        if (pt.box) {
          g.save();
          g.setLineDash([4, 3]);
          g.strokeStyle = alpha(pt.c, 0.8);
          g.lineWidth = 1.6;
          roundRect(g, x - 4, y - s * 0.62, w + 8, s * 1.24, 6);
          g.stroke();
          g.restore();
        }
        text(g, pt.s, x, y, { font: f, color: pt.c, align: 'left' });
        out.push({ x, w });
        x += w;
      }
      g.restore();
      return out;
    }

    /* ---------------- Geometrie ---------------- */
    function computeGeo(): Geo {
      const W = surface.width;
      const H = surface.height;
      const wide = W >= 640 || W >= H * 1.3;
      if (wide) {
        const pw = Math.round(clamp(W * 0.3, 210, 330));
        return { W, H, wide, C: { x: 6, y: 6, w: W - pw - 20, h: H - 12 }, panel: { x: W - pw - 6, y: 6, w: pw, h: H - 12 } };
      }
      const ch = Math.round(H * 0.56);
      return { W, H, wide, C: { x: 4, y: 4, w: W - 8, h: ch }, panel: { x: 4, y: ch + 12, w: W - 8, h: H - ch - 16 } };
    }

    /* ================================================================== */
    /* Einheitentafel                                                      */
    /* ================================================================== */

    /** Sichtbarer Spaltenbereich: ganze Tafel, auf schmalen Flächen ein Ausschnitt aus ganzen Einheiten. */
    function windowFor(st: State, innerW: number, wide: boolean): [number, number] {
      const minCol = wide ? 34 : 29;
      const maxCols = Math.max(4, Math.floor(innerW / minCol));
      if (st.colHi - st.colLo + 1 <= maxCols) return [st.colHi, st.colLo];
      const top = (c: number) => st.units.find((t) => c >= t.lo && c <= t.hi)?.hi ?? c;
      const bottom = (c: number) => st.units.find((t) => c >= t.lo && c <= t.hi)?.lo ?? c;
      let hi = top(st.needHi);
      let lo = bottom(st.needLo);
      let up = true;
      for (let guard = 0; guard < 20; guard++) {
        const canUp = hi < st.colHi;
        const canDown = lo > st.colLo;
        if (!canUp && !canDown) break;
        const tryUp = (up && canUp) || !canDown;
        const nHi = tryUp ? Math.min(st.colHi, top(hi + 1)) : hi;
        const nLo = tryUp ? lo : Math.max(st.colLo, bottom(lo - 1));
        if (nHi - nLo + 1 > maxCols) {
          if (tryUp && canDown) {
            up = false;
            const dLo = Math.max(st.colLo, bottom(lo - 1));
            if (hi - dLo + 1 <= maxCols) lo = dLo;
          }
          break;
        }
        hi = nHi;
        lo = nLo;
        up = !up;
      }
      return [hi, lo];
    }

    interface TabLayout {
      T: Rect;
      hi: number;
      lo: number;
      colW: number;
      x: (col: number) => number;
      headY: number;
      headH: number;
      subY: number;
      subH: number;
      cardY: number;
      cardH: number;
      arcH: number;
    }

    function drawTable(gm: Geo, st: State): void {
      const g = surface.g;
      const theme = ctx.theme;
      const C = gm.C;
      card(C);
      const sA = sceneA();
      g.save();
      g.globalAlpha = sA;
      const small = C.w < 470;
      const pad = small ? 10 : 18;
      const head = `${T(QUANTITIES[st.q].name)} · ${tt('Einheitentafel', 'unit chart')}`;
      text(g, head, C.x + pad, C.y + 20, { font: font(750, small ? 11.5 : 12.5), color: theme.muted, align: 'left' });

      if (!st.value || !st.conv) {
        const msg = tt('Bitte eine Zahl eingeben, z. B. 3,5 oder 250.', 'Please enter a number, e.g. 3.5 or 250.');
        wrap(msg, C.w - 60, font(650, 14)).forEach((r, i) => text(g, r, C.x + C.w / 2, C.y + C.h * 0.45 + i * 20, { font: font(650, 14), color: theme.muted }));
        g.restore();
        return;
      }

      // senkrechte Aufteilung
      const innerW = C.w - 2 * pad;
      const [wh, wl] = windowFor(st, innerW, gm.wide);
      if (!winInit) {
        winHi.snap(wh);
        winLo.snap(wl);
        winInit = true;
      } else {
        winHi.go(wh);
        winLo.go(wl);
      }
      const hi = winHi.at(now);
      const lo = winLo.at(now);
      const colW = innerW / (hi - lo + 1);
      const headH = small ? 30 : 40;
      const subH = small ? 18 : 22;
      const cardH = clamp(colW * 1.18, 34, small ? 46 : 68);
      const arcH = clamp(colW * 0.42, 12, 24);
      const eqSize = small ? 22 : clamp(C.w / 17, 24, 40);
      const bridgeH = small ? 26 : 34;
      const blockH = 26 + bridgeH + headH + 4 + subH + cardH + 10 + arcH + 26 + 18 + eqSize + 44;
      const top0 = C.y + 34;
      const startY = top0 + Math.max(0, (C.y + C.h - 8 - top0 - blockH) / 2);
      const statusY = startY + 10;
      const headY = startY + 28 + bridgeH;
      const subY = headY + headH + 4;
      const cardY = subY + subH;
      const T0: Rect = { x: C.x + pad, y: headY, w: innerW, h: cardY + cardH - headY };
      const lay: TabLayout = { T: T0, hi, lo, colW, x: (col) => T0.x + (hi - col) * colW, headY, headH, subY, subH, cardY, cardH, arcH };

      const tm = hopTiming(st);
      const shift = st.conv.shift;
      const n = tm.n;
      const t = now;
      const hopsDone = t >= tm.start ? Math.min(n, Math.floor((t - tm.start) / Math.max(1, tm.hop))) : 0;
      const hopU = n && t >= tm.start && t < tm.end ? ((t - tm.start) % tm.hop) / tm.hop : 0;
      const zerosA = clamp((t - tm.end) / 450, 0, 1);
      const resA = clamp((t - tm.end - 200) / 500, 0, 1);
      const done = t >= tm.end;
      const moved = Math.min(n, hopsDone + (hopU > 0.5 ? 1 : 0));

      // Spalten zeichnen (beschnitten auf die Tafel, Ränder weich ausgeblendet)
      g.save();
      g.beginPath();
      g.rect(T0.x - 12, headY - bridgeH - 4, T0.w + 24, cardY + cardH + arcH + 40 - headY + bridgeH);
      g.clip();
      drawBridges(st, lay, hopAt === null || t < tm.start ? -1 : hopsDone + ease.inOutCubic(hopU), bridgeH);
      drawColumns(st, lay, done ? 1 : 0);
      drawCards(st, lay, zerosA, resA, done);
      drawComma(st, lay, tm, hopsDone, hopU);
      g.restore();
      // weiche Ränder, wenn ein Ausschnitt gezeigt wird
      if (lay.hi < st.colHi - 0.01) edgeFade(T0.x - 3, headY, cardY + cardH + 4 - headY, 1);
      if (lay.lo > st.colLo + 0.01) edgeFade(T0.x + T0.w + 3, headY, cardY + cardH + 4 - headY, -1);

      // Statuszeile über der Tafel
      const dirText = shift > 0 ? tt('nach rechts', 'to the right') : tt('nach links', 'to the left');
      const places = (k: number) => `${k} ${k === 1 ? tt('Stelle', 'place') : tt('Stellen', 'places')}`;
      let status: string;
      let statusC = theme.muted;
      if (hopAt === null) status = tt('Wohin wandert das Komma? Dann „Umrechnen“ antippen.', 'Where does the point move? Then tap “Convert”.');
      else if (t < tm.start) status = tt('Die Zahl liegt in der Tafel – die Einerstelle in der Spalte der Einheit.', 'The number sits in the chart – its ones digit in the unit’s column.');
      else if (n === 0) {
        status = st.from.id === st.to.id ? tt('Gleiche Einheit – das Komma bleibt stehen.', 'Same unit – the point stays put.') : tt('Gleiche Spalte – das Komma bleibt stehen.', 'Same column – the point stays put.');
        statusC = cTo();
      } else if (!done) {
        status = `${tt('Komma', 'Point')} ${places(moved)} ${dirText}`;
        statusC = cTo();
      } else {
        const f = gi(st.conv.factor);
        status = shift > 0 ? `${places(n)} ${dirText} = ${tt('mal', 'times')} ${f}` : `${places(n)} ${dirText} = ${tt('geteilt durch', 'divided by')} ${f}`;
        statusC = cTo();
      }
      halo(status, C.x + C.w / 2, statusY, font(750, fitSize(status, 750, small ? 12.5 : 14, C.w - 24)), statusC);

      // Gleichung
      const eqY = cardY + cardH + 10 + arcH + 26 + 14 + eqSize / 2;
      drawEquation(st, C, eqY, eqSize, resA);
      // Erläuterung darunter
      const notes: string[] = [];
      if (resA > 0) notes.push(`${tt('Umrechnungszahl', 'Conversion factor')}: ${relationText(st.q, st.from, st.to, lang)}`);
      if (st.q === 'vol') notes.push('1 dm³ = 1 l · 1 cm³ = 1 ml');
      if (st.overflow) notes.push(tt('Die Zahl ist zu lang für die Tafel – nur ein Ausschnitt ist zu sehen.', 'The number is too long for the chart – only part of it is shown.'));
      notes.forEach((s, i) => halo(s, C.x + C.w / 2, eqY + eqSize * 0.5 + 18 + i * 18, font(650, fitSize(s, 650, small ? 11.5 : 12.5, C.w - 24)), theme.muted, 'center', i === 0 && resA > 0 ? resA : 1));
      g.restore();
    }

    function edgeFade(x: number, y: number, h: number, dir: 1 | -1): void {
      const g = surface.g;
      const w = 26;
      const grad = g.createLinearGradient(x, 0, x + dir * w, 0);
      grad.addColorStop(0, alpha(cardBg(), 1));
      grad.addColorStop(1, alpha(cardBg(), 0));
      g.fillStyle = grad;
      g.fillRect(dir > 0 ? x : x - w, y - 2, w, h + 4);
    }

    /**
     * Umrechnungszahlen als kleine Bögen über den Einheiten-Köpfen
     * (km ⌒1 000⌒ m ⌒10⌒ dm …). Auf dem Weg der Umrechnung färben sie sich
     * mit dem wandernden Komma ein und bekommen „·“ bzw. „:“.
     */
    function drawBridges(st: State, lay: TabLayout, prog: number, bridgeH: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const toC = cTo();
      const conv = st.conv!;
      const shift = conv.shift;
      const fromE = st.from.exp;
      const toE = st.to.exp;
      const center = (u: TableUnit) => (lay.x(u.hi) + lay.x(u.lo) + lay.colW) / 2;
      const y = lay.headY - 6;
      for (let i = 0; i < st.units.length - 1; i++) {
        const A = st.units[i]!;
        const B = st.units[i + 1]!;
        const xa = center(A);
        const xb = center(B);
        if (xa < lay.T.x - 2 || xb > lay.T.x + lay.T.w + 2) continue;
        const factor = 10 ** (A.unit.exp - B.unit.exp);
        // liegt der Schritt auf dem Weg? Dann wie weit ist das Komma schon?
        const hiE = Math.max(fromE, toE);
        const loE = Math.min(fromE, toE);
        const onPath = A.unit.exp <= hiE && B.unit.exp >= loE && shift !== 0;
        let f = 0;
        if (onPath && prog >= 0) {
          const before = shift > 0 ? fromE - A.unit.exp : B.unit.exp - fromE;
          f = clamp((prog - before) / (A.unit.exp - B.unit.exp), 0, 1);
        }
        const peak = bridgeH * 0.55;
        const col = f > 0 ? toC : alpha(theme.muted, onPath ? 0.75 : 0.45);
        const pt = (u: number): [number, number] => [lerp(xa + 6, xb - 6, u), y - Math.sin(Math.PI * u) * peak];
        g.save();
        g.lineCap = 'round';
        g.strokeStyle = onPath ? alpha(toC, theme.dark ? 0.35 : 0.3) : alpha(theme.muted, theme.dark ? 0.4 : 0.32);
        g.lineWidth = 1.5;
        g.beginPath();
        for (let k = 0; k <= 18; k++) {
          const [px, py] = pt(k / 18);
          if (k) g.lineTo(px, py);
          else g.moveTo(px, py);
        }
        g.stroke();
        if (f > 0) {
          g.strokeStyle = toC;
          g.lineWidth = 2.5;
          g.beginPath();
          for (let k = 0; k <= 18; k++) {
            const u = shift > 0 ? (k / 18) * f : 1 - (k / 18) * f;
            const [px, py] = pt(u);
            if (k) g.lineTo(px, py);
            else g.moveTo(px, py);
          }
          g.stroke();
        }
        g.restore();
        const lab = `${onPath && f > 0 ? (shift > 0 ? '· ' : ': ') : ''}${gi(factor)}`;
        const fs = clamp(lay.colW * 0.36, 11, 13);
        const w = measure(lab, font(800, fs));
        if (w > xb - xa + 8) continue;
        const [lx, ly] = pt(0.5);
        halo(lab, lx, ly - 1, font(800, fs), f > 0 ? toC : col);
      }
    }

    function drawColumns(st: State, lay: TabLayout, doneA: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const { colW, headY, headH, subY, subH, cardY, cardH } = lay;
      const fromC = cFrom();
      const toC = cTo();
      const c0 = Math.ceil(lay.lo - 1);
      const c1 = Math.floor(lay.hi + 1);
      const ownerOf = (c: number) => st.units.find((u) => c >= u.lo && c <= u.hi) ?? null;
      // Einheiten-Köpfe
      const segs: { u: TableUnit | null; hi: number; lo: number }[] = [];
      for (const u of st.units) segs.push({ u, hi: u.hi, lo: u.lo });
      if (st.colHi > st.units[0]!.hi) segs.unshift({ u: null, hi: st.colHi, lo: st.units[0]!.hi + 1 });
      if (st.colLo < 0) segs.push({ u: null, hi: -1, lo: st.colLo });
      for (const s of segs) {
        if (s.lo > c1 || s.hi < c0) continue;
        const x0 = lay.x(s.hi) + 2;
        const x1 = lay.x(s.lo) + colW - 2;
        const isFrom = s.u && s.u.unit.exp === st.from.exp;
        const isTo = s.u && s.u.unit.exp === st.to.exp;
        const hot = s.u && hover === `unit:${s.u.unit.id}`;
        const col = isTo ? toC : isFrom ? fromC : theme.muted;
        g.save();
        roundRect(g, x0, headY, x1 - x0, headH, 9);
        const grad = g.createLinearGradient(0, headY, 0, headY + headH);
        const base = isTo ? 0.22 : isFrom ? 0.18 : theme.dark ? 0.08 : 0.06;
        grad.addColorStop(0, alpha(col, base + (hot ? 0.08 : 0) + 0.04));
        grad.addColorStop(1, alpha(col, base + (hot ? 0.08 : 0)));
        g.fillStyle = grad;
        g.fill();
        if (isTo || isFrom || hot) {
          g.strokeStyle = alpha(col, isTo || isFrom ? 0.65 : 0.35);
          g.lineWidth = isTo ? 1.8 : 1.2;
          g.stroke();
        }
        g.restore();
        // Beschriftung
        const cx = (x0 + x1) / 2;
        const w = x1 - x0;
        if (s.u) {
          const sym = s.u.unit.sym;
          const alias = st.q === 'vol' ? (s.u.unit.id === 'dm3' ? 'l' : s.u.unit.id === 'cm3' ? 'ml' : '') : '';
          const size = clamp(headH * 0.5, 12, 17);
          const lab = alias && measure(`${sym} | ${alias}`, font(800, size)) < w - 6 ? `${sym} | ${alias}` : sym;
          const fs = fitSize(lab, 800, size, w - 4, 10);
          text(g, lab, cx, headY + headH / 2 + 1, { font: font(800, fs), color: isTo || isFrom ? shade(col, theme.dark ? 0.1 : -0.05) : theme.text });
          addHit(`unit:${s.u.unit.id}`, { x: x0, y: headY, w: x1 - x0, h: cardY + cardH - headY });
        }
      }
      // Stellenwerte unter den Einheiten
      for (let c = c0; c <= c1; c++) {
        if (c > st.colHi || c < st.colLo) continue;
        const x = lay.x(c);
        const lab = placeLabel(st.q, c, lang);
        if (lab && measure(lab, font(700, 11)) < colW - 2) text(g, lab, x + colW / 2, subY + subH / 2, { font: font(700, clamp(colW * 0.3, 11, 12.5)), color: alpha(theme.muted, 0.9) });
      }
      // Spaltenfächer
      for (let c = c0; c <= c1; c++) {
        if (c > st.colHi || c < st.colLo) continue;
        const x = lay.x(c);
        const own = ownerOf(c);
        const isTo = own && own.unit.exp === st.to.exp;
        const isFrom = own && own.unit.exp === st.from.exp;
        g.fillStyle = isTo ? alpha(toC, (theme.dark ? 0.08 : 0.05) * (0.6 + 0.4 * doneA)) : isFrom ? alpha(fromC, theme.dark ? 0.07 : 0.04) : alpha(theme.text, theme.dark ? 0.035 : 0.022);
        g.fillRect(x + 1, cardY - 2, colW - 2, cardH + 4);
      }
      // Trennlinien: dünn zwischen Spalten, kräftig zwischen Einheiten
      for (let c = c0; c <= c1 + 1; c++) {
        if (c > st.colHi + 1 || c < st.colLo) continue;
        const x = Math.round(lay.x(c) + colW) + 0.5;
        const unitEdge = st.units.some((u) => u.lo === c) || c === st.colLo || c === st.colHi + 1 || c === 0;
        g.strokeStyle = alpha(theme.text, unitEdge ? (theme.dark ? 0.32 : 0.26) : theme.dark ? 0.12 : 0.09);
        g.lineWidth = unitEdge ? 1.5 : 1;
        g.beginPath();
        g.moveTo(x, unitEdge ? headY + headH + 4 : subY + 2);
        g.lineTo(x, cardY + cardH + 2);
        g.stroke();
      }
    }

    function digitCard(x: number, y: number, w: number, h: number, digit: string, opts: { color: string; border: string; borderW: number; a: number; dashed?: boolean; ghost?: boolean; scale?: number }): void {
      const g = surface.g;
      const theme = ctx.theme;
      if (opts.a <= 0.01) return;
      g.save();
      g.globalAlpha *= opts.a;
      const s = opts.scale ?? 1;
      const cx = x + w / 2;
      const cy = y + h / 2;
      g.translate(cx, cy);
      g.scale(s, s);
      const r = Math.min(8, w * 0.2);
      if (!opts.ghost) {
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.14)';
        g.shadowBlur = 6;
        g.shadowOffsetY = 2;
        roundRect(g, -w / 2, -h / 2, w, h, r);
        const grad = g.createLinearGradient(0, -h / 2, 0, h / 2);
        grad.addColorStop(0, theme.dark ? shade(theme.bg, 0.16) : '#ffffff');
        grad.addColorStop(1, theme.dark ? shade(theme.bg, 0.1) : shade(theme.bg, -0.03));
        g.fillStyle = grad;
        g.fill();
        g.shadowColor = 'transparent';
      } else {
        roundRect(g, -w / 2, -h / 2, w, h, r);
        g.fillStyle = alpha(theme.text, theme.dark ? 0.04 : 0.025);
        g.fill();
      }
      if (opts.dashed) g.setLineDash([4, 3]);
      g.strokeStyle = opts.border;
      g.lineWidth = opts.borderW;
      roundRect(g, -w / 2, -h / 2, w, h, r);
      g.stroke();
      g.setLineDash([]);
      text(g, digit, 0, 1, { font: font(800, clamp(h * 0.56, 15, 32)), color: opts.color });
      g.restore();
    }

    function drawCards(st: State, lay: TabLayout, zerosA: number, resA: number, done: boolean): void {
      const theme = ctx.theme;
      const { colW, cardY, cardH } = lay;
      const w = Math.max(10, colW - 6);
      const res = st.res!;
      const toC = cTo();
      const fromC = cFrom();
      const inResult = (c: number) => c <= res.hi && c >= res.lo;
      // blass ergänzte Nullen
      res.cells
        .filter((c) => c.added)
        .forEach((c, i) => {
          const a = clamp(zerosA * 1.6 - i * 0.12, 0, 1);
          if (a <= 0) return;
          digitCard(lay.x(c.col) + 3, cardY, w, cardH, '0', {
            color: alpha(theme.muted, 0.85),
            border: alpha(resA > 0.5 ? toC : theme.muted, 0.55),
            borderW: 1.3,
            a,
            dashed: true,
            ghost: true,
            scale: 0.7 + 0.3 * ease.outBack(a),
          });
        });
      // Kärtchen der Zahl (fallen nacheinander herein)
      st.given.forEach((pl, i) => {
        const u = clamp((now - layAt - i * STAGGER) / DROP, 0, 1);
        if (u <= 0) return;
        const drop = (1 - ease.outCubic(u)) * -38;
        const fade = !inResult(pl.col) ? zerosA : 0;
        const isRes = done && inResult(pl.col);
        digitCard(lay.x(pl.col) + 3, cardY + drop, w, cardH, pl.digit, {
          color: fade > 0.5 ? alpha(theme.muted, 0.7) : isRes && resA > 0.5 ? shade(toC, theme.dark ? 0.1 : -0.1) : theme.text,
          border: isRes ? alpha(toC, 0.35 + 0.45 * resA) : alpha(fromC, 0.55),
          borderW: isRes && resA > 0.5 ? 1.8 : 1.3,
          a: clamp(u * 1.8, 0, 1) * (1 - 0.72 * fade),
          dashed: fade > 0.5,
        });
      });
    }

    function drawComma(st: State, lay: TabLayout, tm: ReturnType<typeof hopTiming>, hopsDone: number, hopU: number): void {
      const g = surface.g;
      const { colW, cardY, cardH, arcH } = lay;
      const shift = st.conv!.shift;
      const n = tm.n;
      const dir = shift > 0 ? 1 : -1; // nach rechts: Spalte wird kleiner
      // Komma rechts der Spalte b: x = linke Kante der Spalte b − 1
      const bx = (b: number) => lay.x(b - 1);
      const b0 = st.from.exp;
      const commaA = clamp((now - layEnd(st) + 200) / 300, 0, 1);
      if (commaA <= 0) return;
      const cExp = cTo();
      const baseY = cardY + cardH - 3;
      // Sprungbögen unter den Kärtchen
      for (let i = 0; i < n; i++) {
        const shown = i < hopsDone ? 1 : i === hopsDone && hopU > 0 ? ease.inOutCubic(hopU) : 0;
        if (shown <= 0) continue;
        const a0 = bx(b0 - dir * i);
        const a1 = bx(b0 - dir * (i + 1));
        g.save();
        g.strokeStyle = cExp;
        g.lineWidth = 2;
        g.lineCap = 'round';
        g.beginPath();
        const steps = 16;
        for (let q = 0; q <= steps; q++) {
          const u = (q / steps) * shown;
          const x = lerp(a0, a1, u);
          const y = baseY + 9 + Math.sin(Math.PI * u) * arcH;
          if (q === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.stroke();
        if (shown >= 1) {
          g.fillStyle = cExp;
          g.beginPath();
          g.moveTo(a1, baseY + 7);
          g.lineTo(a1 - dir * 6, baseY + 15);
          g.lineTo(a1 + dir * 1.5, baseY + 16);
          g.closePath();
          g.fill();
        }
        g.restore();
        if (shown >= 1 && colW >= 18) halo(String(i + 1), (a0 + a1) / 2, baseY + 9 + arcH + 10, font(800, clamp(colW * 0.3, 11, 13)), cExp);
      }
      // senkrechte Kommalinie und das Komma selbst
      const pos = b0 - dir * (hopsDone + ease.inOutCubic(hopU));
      const xk = bx(pos);
      const ky = baseY + Math.sin(Math.PI * hopU) * arcH;
      g.save();
      g.globalAlpha *= commaA;
      g.setLineDash([5, 4]);
      g.strokeStyle = alpha(cExp, 0.55);
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(xk, lay.subY + 1);
      g.lineTo(xk, cardY - 3);
      g.stroke();
      g.setLineDash([]);
      g.shadowColor = alpha(cExp, 0.5);
      g.shadowBlur = 8;
      g.fillStyle = cExp;
      const cr = clamp(colW * 0.11, 3.4, 6);
      g.beginPath();
      g.arc(xk, ky, cr, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.moveTo(xk + cr * 0.75, ky + cr * 0.3);
      g.quadraticCurveTo(xk + cr * 0.5, ky + cr * 2.3, xk - cr * 0.9, ky + cr * 2.7);
      g.lineTo(xk - cr * 0.4, ky + cr * 1.3);
      g.closePath();
      g.fill();
      g.restore();
    }

    /** „3,5 km = 3 500 m“ bzw. „3,5 km = ? m“. */
    function drawEquation(st: State, C: Rect, y: number, size: number, resA: number): void {
      const theme = ctx.theme;
      const conv = st.conv!;
      const fromC = cFrom();
      const toC = cTo();
      const left = [
        { s: `${fd(conv.value)} `, c: theme.text },
        { s: conv.from.sym, c: fromC },
        { s: conv.exact || resA < 0.5 ? ' = ' : ' ≈ ', c: theme.muted },
      ];
      if (resA <= 0.02) {
        richLine([...left, { s: '\u2009', c: toC }, { s: '?', c: toC, box: true }, { s: `\u2009 ${conv.to.sym}`, c: toC }], C.x + C.w / 2, y, size, C.w - 30);
        return;
      }
      const right = [
        { s: `${fd(conv.result)} `, c: shade(toC, theme.dark ? 0.05 : -0.08) },
        { s: conv.to.sym, c: toC },
      ];
      const g = surface.g;
      g.save();
      richLine([...left, ...right], C.x + C.w / 2, y + (1 - ease.outCubic(resA)) * 6, size, C.w - 30, 0.25 + 0.75 * resA);
      g.restore();
    }

    /* ================================================================== */
    /* Zeit: Umrechnungskette                                              */
    /* ================================================================== */

    function drawTime(gm: Geo, st: State): void {
      const g = surface.g;
      const theme = ctx.theme;
      const C = gm.C;
      card(C);
      g.save();
      g.globalAlpha = sceneA();
      const small = C.w < 470;
      const pad = small ? 10 : 18;
      text(g, `${tt('Zeit', 'Time')} · ${tt('Umrechnungskette', 'conversion chain')}`, C.x + pad, C.y + 20, { font: font(750, small ? 11.5 : 12.5), color: theme.muted, align: 'left' });
      if (!st.value || !st.conv) {
        const msg = tt('Bitte eine Zahl eingeben, z. B. 135 oder 2,5.', 'Please enter a number, e.g. 135 or 2.5.');
        wrap(msg, C.w - 60, font(650, 14)).forEach((r, i) => text(g, r, C.x + C.w / 2, C.y + C.h * 0.45 + i * 20, { font: font(650, 14), color: theme.muted }));
        g.restore();
        return;
      }
      const units = [...QUANTITIES.time.units].reverse(); // d, h, min, s
      const steps = timeSteps(st);
      const tm = hopTiming(st);
      const t = now;
      const fromI = units.findIndex((u) => u.id === st.from.id);
      const toI = units.findIndex((u) => u.id === st.to.id);
      const dir = toI > fromI ? 1 : -1;
      const stepsDone = t >= tm.start ? Math.min(tm.n, Math.floor((t - tm.start) / tm.hop)) : 0;
      const stepU = tm.n && t >= tm.start && t < tm.end ? ((t - tm.start) % tm.hop) / tm.hop : 0;
      const done = t >= tm.end;
      const resA = clamp((t - tm.end - 150) / 500, 0, 1);

      const rr = clamp(C.w / 15, 21, 34);
      const eqSize = small ? 21 : clamp(C.w / 20, 22, 34);
      const blockH = 26 + 34 + 2 * rr + 34 + 48 + 34 + eqSize + 50;
      const top0 = C.y + 34;
      const startY = top0 + Math.max(0, (C.y + C.h - 8 - top0 - blockH) / 2);
      const statusY = startY + 10;
      const cy = startY + 26 + 34 + rr;
      const x0 = C.x + pad + rr + 8;
      const x1 = C.x + C.w - pad - rr - 8;
      const sx = (i: number) => lerp(x0, x1, i / 3);
      const FACT = [24, 60, 60];
      const NAMES: Loc[] = [L('Tag', 'day'), L('Stunde', 'hour'), L('Minute', 'minute'), L('Sekunde', 'second')];
      const fromC = cFrom();
      const toC = cTo();

      // Pfeile zwischen den Stationen: oben „· f“ (in die kleinere Einheit), unten „: f“
      for (let i = 0; i < 3; i++) {
        const a = sx(i) + rr + 4;
        const b = sx(i + 1) - rr - 4;
        for (const down of [true, false]) {
          // aktiver Schritt?
          const k = dir > 0 ? i - fromI : fromI - 1 - i;
          const onPath = down === dir > 0 && k >= 0 && k < tm.n;
          const prog = onPath ? (k < stepsDone ? 1 : k === stepsDone && stepU > 0 ? ease.inOutCubic(stepU) : 0) : 0;
          const yA = down ? cy - rr * 0.35 : cy + rr * 0.35;
          const bend = down ? -rr * 0.9 : rr * 0.9;
          const col = onPath ? toC : alpha(theme.muted, 0.55);
          g.save();
          g.strokeStyle = onPath ? alpha(toC, 0.3) : alpha(theme.muted, theme.dark ? 0.35 : 0.3);
          g.lineWidth = 2;
          g.lineCap = 'round';
          const pt = (u: number): [number, number] => {
            const xa = down ? lerp(a, b, u) : lerp(b, a, u);
            return [xa, yA + bend * 4 * u * (1 - u)];
          };
          g.beginPath();
          for (let s = 0; s <= 20; s++) {
            const [px, py] = pt(s / 20);
            if (s === 0) g.moveTo(px, py);
            else g.lineTo(px, py);
          }
          g.stroke();
          if (prog > 0) {
            g.strokeStyle = toC;
            g.lineWidth = 3;
            g.beginPath();
            for (let s = 0; s <= 20; s++) {
              const [px, py] = pt((s / 20) * prog);
              if (s === 0) g.moveTo(px, py);
              else g.lineTo(px, py);
            }
            g.stroke();
          }
          // Spitze
          const [ex, ey] = pt(1);
          const [qx, qy] = pt(0.92);
          const ang = Math.atan2(ey - qy, ex - qx);
          g.fillStyle = prog >= 1 ? toC : onPath ? alpha(toC, 0.45) : alpha(theme.muted, 0.45);
          g.beginPath();
          g.moveTo(ex + Math.cos(ang) * 3, ey + Math.sin(ang) * 3);
          g.lineTo(ex + Math.cos(ang + 2.5) * 8, ey + Math.sin(ang + 2.5) * 8);
          g.lineTo(ex + Math.cos(ang - 2.5) * 8, ey + Math.sin(ang - 2.5) * 8);
          g.closePath();
          g.fill();
          g.restore();
          const [lx, ly] = pt(0.5);
          const lab = `${down ? '·' : ':'} ${FACT[i]}`;
          const pop = prog > 0 && prog < 1 ? 1 + 0.15 * Math.sin(Math.PI * prog) : 1;
          halo(lab, lx, ly + (down ? -11 : 12), font(800, Math.round((small ? 12 : 13.5) * pop)), onPath && prog > 0 ? toC : col);
          // Token auf dem Weg
          if (onPath && prog > 0 && prog < 1) {
            const [tx, ty] = pt(prog);
            g.save();
            g.shadowColor = alpha(toC, 0.6);
            g.shadowBlur = 10;
            g.fillStyle = toC;
            g.beginPath();
            g.arc(tx, ty, 6, 0, Math.PI * 2);
            g.fill();
            g.restore();
          }
        }
      }
      // Stationen
      units.forEach((u, i) => {
        const x = sx(i);
        const isFrom = i === fromI;
        const isTo = i === toI;
        const reached = dir > 0 ? i > fromI && i - fromI <= stepsDone : i < fromI && fromI - i <= stepsDone;
        const col = isTo && (done || reached) ? toC : isFrom ? fromC : reached ? toC : theme.muted;
        const hot = hover === `unit:${u.id}`;
        g.save();
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.15)';
        g.shadowBlur = 10;
        g.shadowOffsetY = 3;
        g.beginPath();
        g.arc(x, cy, rr * (hot ? 1.05 : 1), 0, Math.PI * 2);
        const grad = g.createRadialGradient(x - rr * 0.35, cy - rr * 0.4, rr * 0.1, x, cy, rr);
        grad.addColorStop(0, theme.dark ? shade(theme.bg, 0.2) : '#ffffff');
        grad.addColorStop(1, theme.dark ? shade(theme.bg, 0.1) : shade(theme.bg, -0.05));
        g.fillStyle = grad;
        g.fill();
        g.shadowColor = 'transparent';
        g.strokeStyle = isFrom || isTo || reached ? col : alpha(theme.text, 0.18);
        g.lineWidth = isFrom || isTo ? 2.5 : 1.5;
        g.stroke();
        g.restore();
        text(g, u.sym, x, cy + 1, { font: font(800, clamp(rr * 0.62, 13, 20)), color: isFrom || isTo || reached ? col : theme.text });
        text(g, T(NAMES[i]!), x, cy - rr - 12, { font: font(650, small ? 11 : 12), color: theme.muted });
        addHit(`unit:${u.id}`, { x: x - rr - 6, y: cy - rr - 22, w: 2 * rr + 12, h: 2 * rr + 30 });
        // Wert an der Station
        let val: string | null = null;
        let isApprox = false;
        if (isFrom) val = fd(st.value!);
        else if (reached || (done && isTo)) {
          const k = Math.abs(i - fromI) - 1;
          const step = steps[k];
          if (step) {
            const r = ratioToDec(step.value, 3);
            val = fd(r.dec);
            isApprox = !r.exact;
          }
        }
        if (val !== null) {
          const appear = isFrom ? clamp((now - layAt) / 400, 0, 1) : 1;
          const s = `${isApprox ? '≈ ' : ''}${val} ${u.sym}`;
          const fs = fitSize(s, 800, small ? 12.5 : 14, (x1 - x0) / 3 - 8);
          const w = measure(s, font(800, fs)) + 14;
          const by = cy + rr + 14;
          g.save();
          g.globalAlpha *= appear;
          roundRect(g, x - w / 2, by, w, 26, 8);
          g.fillStyle = alpha(isFrom ? fromC : toC, theme.dark ? 0.2 : 0.11);
          g.fill();
          g.strokeStyle = alpha(isFrom ? fromC : toC, 0.5);
          g.lineWidth = 1.2;
          g.stroke();
          text(g, s, x, by + 13.5, { font: font(800, fs), color: isFrom ? shade(fromC, theme.dark ? 0.1 : -0.1) : shade(toC, theme.dark ? 0.1 : -0.1) });
          g.restore();
        }
      });
      // Statuszeile
      let status: string;
      let statusC = theme.muted;
      if (hopAt === null) status = tt('Mal oder geteilt – und durch welche Zahl? Dann „Umrechnen“ antippen.', 'Multiply or divide – and by what? Then tap “Convert”.');
      else if (t < tm.start) status = tt('Zeit rechnet nicht mit 10: 1 d = 24 h, 1 h = 60 min, 1 min = 60 s.', 'Time does not use tens: 1 d = 24 h, 1 h = 60 min, 1 min = 60 s.');
      else if (tm.n === 0) status = tt('Gleiche Einheit – nichts zu rechnen.', 'Same unit – nothing to calculate.');
      else {
        const k = Math.min(tm.n - 1, stepsDone);
        const step = steps[k]!;
        status = step.multiply
          ? tt(`In die kleinere Einheit: mal ${step.factor}`, `To the smaller unit: times ${step.factor}`)
          : tt(`In die größere Einheit: geteilt durch ${step.factor}`, `To the larger unit: divided by ${step.factor}`);
        statusC = toC;
      }
      halo(status, C.x + C.w / 2, statusY, font(750, fitSize(status, 750, small ? 12.5 : 14, C.w - 24)), statusC);

      // Gleichung und gemischte Schreibweise
      const eqY = cy + rr + 14 + 26 + 40 + eqSize / 2;
      drawEquation(st, C, eqY, eqSize, resA);
      const big = st.from.exp >= st.to.exp ? st.from : st.to;
      const inBig = st.from === big ? st.value! : st.conv.result;
      const mixed = st.from.id !== st.to.id && (digitsOf(inBig).frac !== '' || !st.conv.exact) ? mixedTime(st.value!, st.from.id, st.to.id) : null;
      if (mixed && mixed.length > 1 && resA > 0) {
        const s = `= ${mixedText(mixed, lang)}`;
        halo(s, C.x + C.w / 2, eqY + eqSize * 0.5 + 22, font(800, fitSize(s, 800, small ? 16 : 19, C.w - 30)), shade(toC, theme.dark ? 0.05 : -0.08), 'center', resA);
      }
      const note = !st.conv.exact ? tt('Das Ergebnis geht nicht auf und ist gerundet.', 'The result does not come out exactly and is rounded.') : '';
      if (note && resA > 0) halo(note, C.x + C.w / 2, eqY + eqSize * 0.5 + 46, font(650, fitSize(note, 650, small ? 11.5 : 12.5, C.w - 24)), theme.muted, 'center', resA);
      g.restore();
    }

    /* ================================================================== */
    /* Anschauung                                                          */
    /* ================================================================== */

    function drawPanel(gm: Geo, st: State): void {
      const R = gm.panel;
      const g = surface.g;
      const theme = ctx.theme;
      card(R);
      g.save();
      roundRect(g, R.x, R.y, R.w, R.h, 16);
      g.clip();
      g.globalAlpha = sceneA();
      const pair = illustrationPair(st.q, st.from.id, st.to.id);
      const small = !gm.wide;
      const pad = 14;
      text(g, tt('Anschauung', 'Picture it'), R.x + pad, R.y + 18, { font: font(750, 12), color: theme.muted, align: 'left' });
      const smallSym = pair.small.sym;
      const cap = `1 ${pair.big.sym} = ${gi(pair.factor)} ${smallSym}`;
      const capSize = fitSize(cap, 800, small ? 16 : 18, R.w - 2 * pad);
      const capY = small ? R.y + 18 : R.y + 42;
      text(g, cap, small ? R.x + R.w - pad : R.x + R.w / 2, capY, { font: font(800, capSize), color: theme.text, align: small ? 'right' : 'center' });
      // Merkkasten (nur, wenn genug Platz ist)
      const merke = T(MERKE[st.q]);
      const mf = font(600, 12);
      const mRows = gm.wide && R.h >= 330 ? wrap(merke, R.w - 2 * pad - 16, mf) : [];
      const mH = mRows.length ? mRows.length * 16 + 34 : 0;
      if (mH) {
        const my = R.y + R.h - mH - 10;
        roundRect(g, R.x + pad - 4, my, R.w - 2 * pad + 8, mH, 12);
        g.fillStyle = alpha(illColor(st.q), theme.dark ? 0.14 : 0.08);
        g.fill();
        g.strokeStyle = alpha(illColor(st.q), 0.3);
        g.lineWidth = 1;
        g.stroke();
        text(g, tt('Merke', 'Remember'), R.x + pad + 6, my + 15, { font: font(800, 12), color: shade(illColor(st.q), theme.dark ? 0.2 : -0.2), align: 'left' });
        mRows.forEach((row, i) => text(g, row, R.x + pad + 6, my + 33 + i * 16, { font: mf, color: theme.text, align: 'left' }));
      }
      const countY = R.y + R.h - mH - (mH ? 32 : 20);
      const ill: Rect = { x: R.x + 8, y: R.y + (small ? 32 : 62), w: R.w - 16, h: countY - 18 - (R.y + (small ? 32 : 62)) };
      const dur = st.q === 'mass' ? 3200 : 2800;
      const u = reduced ? 1 : clamp((now - illAt) / dur, 0, 1);
      let count = '';
      if (st.q === 'len') count = drawRuler(ill, pair, u);
      else if (st.q === 'area') count = drawSquare(ill, pair, u);
      else if (st.q === 'vol') count = drawCube(ill, pair, u);
      else if (st.q === 'mass') count = drawBalance(ill, pair, u);
      else count = drawClock(ill, pair, u);
      const color = illColor(st.q);
      const cs = fitSize(count, 800, 15, R.w - 2 * pad - 20);
      const cw = measure(count, font(800, cs)) + 24;
      roundRect(g, R.x + R.w / 2 - cw / 2, countY - 13, cw, 26, 13);
      g.fillStyle = alpha(color, theme.dark ? 0.2 : 0.1);
      g.fill();
      text(g, count, R.x + R.w / 2, countY + 0.5, { font: font(800, cs), color: shade(color, theme.dark ? 0.2 : -0.2) });
      g.restore();
    }

    function illColor(q: QuantityId): string {
      const s = ctx.theme.series;
      return q === 'len' ? s[0]! : q === 'area' ? s[2]! : q === 'vol' ? s[5]! : q === 'mass' ? s[4]! : s[1]!;
    }

    /** Lineal: 1 große Einheit, unterteilt in kleine; ein Messband wächst darüber. */
    function drawRuler(R: Rect, pair: ReturnType<typeof illustrationPair>, u: number): string {
      const g = surface.g;
      const theme = ctx.theme;
      const F = pair.factor;
      const color = illColor('len');
      const rh = clamp(R.h * 0.3, 44, 84);
      const rx = R.x + 8;
      const rw = R.w - 16;
      const ry = R.y + R.h * 0.56 - rh / 2;
      const x0 = rx + 16;
      const x1 = rx + rw - 16;
      // Linealkörper
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.55)' : 'rgba(60,45,10,0.22)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 4;
      roundRect(g, rx, ry, rw, rh, 6);
      const grad = g.createLinearGradient(0, ry, 0, ry + rh);
      grad.addColorStop(0, theme.dark ? '#7a6a3a' : '#fbefc4');
      grad.addColorStop(1, theme.dark ? '#5a4c26' : '#efd486');
      g.fillStyle = grad;
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = theme.dark ? 'rgba(255,240,200,0.25)' : 'rgba(120,90,20,0.35)';
      g.lineWidth = 1;
      g.stroke();
      g.restore();
      // Striche
      const span = x1 - x0;
      const major = F / 10;
      let minor = 1;
      while ((span / F) * minor < 3) minor *= 10;
      const ink = theme.dark ? '#f3e9c8' : '#3d3222';
      const passed = u * F;
      for (let i = 0; i <= F; i += minor) {
        const x = Math.round(x0 + (span * i) / F) + 0.5;
        const isMajor = i % major === 0;
        const isHalf = i % (major * 5) === 0;
        const len = isMajor ? (isHalf ? rh * 0.5 : rh * 0.36) : rh * 0.2;
        g.strokeStyle = i <= passed + 1e-9 ? shade(color, theme.dark ? 0.25 : -0.1) : alpha(ink, isMajor ? 0.85 : 0.5);
        g.lineWidth = isMajor ? 1.6 : 1;
        g.beginPath();
        g.moveTo(x, ry + 1);
        g.lineTo(x, ry + 1 + len);
        g.stroke();
      }
      // Zahlen an den Hauptstrichen (in der kleinen Einheit)
      const fN = font(700, 11);
      let every = 1;
      for (const e of [1, 2, 5, 10]) {
        every = e;
        if (measure(gi(F), fN) + 6 <= (span / 10) * e) break;
      }
      for (let k = 0; k <= 10; k += every) {
        const x = x0 + (span * k) / 10;
        text(g, gi(k * major), x, ry + rh * 0.72, { font: fN, color: alpha(ink, 0.9) });
      }
      text(g, `${tt('Zahlen in', 'numbers in')} ${pair.small.sym}`, rx + rw, ry + rh + 12, { font: font(650, 11), color: theme.muted, align: 'right' });
      // Messband
      const e = ease.inOutCubic(u);
      const bw = span * e;
      const by = ry - 22;
      if (bw > 0.5) {
        g.save();
        roundRect(g, x0, by, Math.max(4, bw), 10, 5);
        const bg = g.createLinearGradient(0, by, 0, by + 10);
        bg.addColorStop(0, shade(color, 0.25));
        bg.addColorStop(1, color);
        g.fillStyle = bg;
        g.shadowColor = alpha(color, 0.4);
        g.shadowBlur = 6;
        g.fill();
        g.restore();
        g.strokeStyle = alpha(color, 0.6);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(x0 + bw, by + 10);
        g.lineTo(x0 + bw, ry);
        g.stroke();
      }
      // Klammer „1 große Einheit“
      const endA = clamp((u - 0.85) / 0.15, 0, 1);
      if (endA > 0) {
        g.save();
        g.globalAlpha *= endA;
        g.strokeStyle = shade(color, theme.dark ? 0.2 : -0.15);
        g.lineWidth = 1.6;
        const yb = by - 10;
        g.beginPath();
        g.moveTo(x0, yb + 6);
        g.lineTo(x0, yb);
        g.lineTo(x1, yb);
        g.lineTo(x1, yb + 6);
        g.stroke();
        g.restore();
        halo(`1 ${pair.big.sym}`, (x0 + x1) / 2, by - 10, font(800, 13), shade(color, theme.dark ? 0.2 : -0.15), 'center', endA);
      }
      // Beispiel aus dem Alltag
      const mm = LEN_IN_MM[pair.big.id] ?? 1;
      const hint = mm === 10 ? tt('etwa so breit wie ein Fingernagel', 'about as wide as a fingernail') : mm === 100 ? tt('etwa so breit wie eine Hand', 'about the width of a hand') : mm === 1000 ? tt('ein großer Schritt', 'one big step') : mm === 1e6 ? tt('etwa 12 Minuten zu Fuß', 'about a 12-minute walk') : '';
      if (hint) text(g, `1 ${pair.big.sym}: ${hint}`, R.x + R.w / 2, ry + rh + 34, { font: font(600, fitSize(`1 ${pair.big.sym}: ${hint}`, 600, 11.5, R.w - 8)), color: theme.muted });
      return `${gi(Math.round(F * e))} ${pair.small.sym}`;
    }

    /** Quadrat aus 10 × 10 Kästchen, die Reihe für Reihe gefüllt werden. */
    function drawSquare(R: Rect, pair: ReturnType<typeof illustrationPair>, u: number): string {
      const g = surface.g;
      const theme = ctx.theme;
      const F = pair.factor;
      const color = illColor('area');
      const S = Math.max(60, Math.min(R.w - 56, R.h - 40));
      const x0 = R.x + (R.w - S) / 2 + 8;
      const y0 = R.y + (R.h - S) / 2 - 6;
      const cell = S / 10;
      // Papier
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 4;
      g.fillStyle = theme.dark ? shade(theme.bg, 0.12) : '#ffffff';
      g.fillRect(x0, y0, S, S);
      g.restore();
      // gefüllte Kästchen
      const filled = u * 100;
      for (let i = 0; i < 100; i++) {
        const a = clamp(filled - i, 0, 1);
        if (a <= 0) break;
        const cx = x0 + (i % 10) * cell;
        const cy = y0 + Math.floor(i / 10) * cell;
        const s = 0.55 + 0.45 * ease.outBack(a);
        const gr = g.createLinearGradient(cx, cy, cx + cell, cy + cell);
        gr.addColorStop(0, alpha(shade(color, 0.2), theme.dark ? 0.55 : 0.5));
        gr.addColorStop(1, alpha(color, theme.dark ? 0.5 : 0.42));
        g.fillStyle = gr;
        g.fillRect(cx + (cell * (1 - s)) / 2, cy + (cell * (1 - s)) / 2, cell * s, cell * s);
      }
      // feine Unterteilung (1 m² = 10 000 cm²)
      if (F > 100 && cell / 10 >= 2.4) {
        g.strokeStyle = alpha(theme.text, theme.dark ? 0.1 : 0.08);
        g.lineWidth = 0.6;
        g.beginPath();
        for (let i = 1; i < 100; i++) {
          if (i % 10 === 0) continue;
          const x = Math.round(x0 + (S * i) / 100) + 0.5;
          const y = Math.round(y0 + (S * i) / 100) + 0.5;
          g.moveTo(x, y0);
          g.lineTo(x, y0 + S);
          g.moveTo(x0, y);
          g.lineTo(x0 + S, y);
        }
        g.stroke();
      }
      g.strokeStyle = alpha(theme.text, theme.dark ? 0.35 : 0.3);
      g.lineWidth = 1;
      g.beginPath();
      for (let i = 1; i < 10; i++) {
        const x = Math.round(x0 + i * cell) + 0.5;
        const y = Math.round(y0 + i * cell) + 0.5;
        g.moveTo(x, y0);
        g.lineTo(x, y0 + S);
        g.moveTo(x0, y);
        g.lineTo(x0 + S, y);
      }
      g.stroke();
      g.strokeStyle = shade(color, theme.dark ? 0.2 : -0.2);
      g.lineWidth = 2.2;
      g.strokeRect(x0, y0, S, S);
      // ein Kästchen hervorheben
      const one = F === 100 ? `1 ${pair.small.sym}` : `${gi(F / 100)} ${pair.small.sym}`;
      g.strokeStyle = shade(color, theme.dark ? 0.35 : -0.3);
      g.lineWidth = 2;
      g.strokeRect(x0 + 0.5, y0 + 0.5, cell, cell);
      halo(one, x0 + cell * 1.25, y0 + cell * 0.5, font(800, 11.5), shade(color, theme.dark ? 0.3 : -0.3), 'left');
      // Seitenlänge
      const [bv, bu] = AREA_SIDE[pair.big.id] ?? [1, ''];
      const [sv, su] = AREA_SIDE[pair.small.id] ?? [1, ''];
      const count = Math.round(Math.sqrt(F));
      const side = bu === su ? `${gi(bv)} ${bu}` : `${gi(bv)} ${bu} = ${gi(count * sv)} ${su}`;
      text(g, side, x0 + S / 2, y0 + S + 14, { font: font(700, 12), color: theme.muted });
      g.save();
      g.translate(x0 - 12, y0 + S / 2);
      g.rotate(-Math.PI / 2);
      text(g, side, 0, 0, { font: font(700, 12), color: theme.muted });
      g.restore();
      return `${gi(Math.min(100, Math.floor(filled + 1e-9)) * (F / 100))} ${pair.small.sym}`;
    }

    /** Würfel aus 10 · 10 · 10 kleinen Würfeln, Reihe für Reihe, Schicht für Schicht. */
    function drawCube(R: Rect, pair: ReturnType<typeof illustrationPair>, u: number): string {
      const g = surface.g;
      const theme = ctx.theme;
      const color = illColor('vol');
      const s = Math.max(4, Math.min((R.w - 30) / (20 * C30), (R.h - 34) / 20));
      const cx = R.x + R.w / 2;
      const cy = R.y + R.h / 2 - 6;
      const P = (x: number, y: number, z: number): [number, number] => [cx + (x - y) * s * C30, cy + (x + y) * s * 0.5 - z * s - 0 + 0];
      const ink = alpha(theme.dark ? '#000000' : '#0b2a33', theme.dark ? 0.45 : 0.35);
      const top = shade(color, theme.dark ? 0.15 : 0.45);
      const left = shade(color, theme.dark ? -0.05 : 0.15);
      const right = shade(color, theme.dark ? -0.3 : -0.12);
      const poly = (pts: [number, number][], fill: string | null, stroke: string | null, w = 1) => {
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.closePath();
        if (fill) {
          g.fillStyle = fill;
          g.fill();
        }
        if (stroke) {
          g.strokeStyle = stroke;
          g.lineWidth = w;
          g.stroke();
        }
      };
      /** Quader [x0,x1]×[y0,y1]×[z0,z1] mit Gitterlinien im Abstand 1. */
      const box = (xa: number, xb: number, ya: number, yb: number, za: number, zb: number, a = 1) => {
        g.save();
        g.globalAlpha *= a;
        poly([P(xa, ya, zb), P(xb, ya, zb), P(xb, yb, zb), P(xa, yb, zb)], top, null);
        poly([P(xa, yb, za), P(xb, yb, za), P(xb, yb, zb), P(xa, yb, zb)], left, null);
        poly([P(xb, ya, za), P(xb, yb, za), P(xb, yb, zb), P(xb, ya, zb)], right, null);
        g.strokeStyle = ink;
        g.lineWidth = 0.8;
        g.beginPath();
        const line = (a0: [number, number], b0: [number, number]) => {
          g.moveTo(a0[0], a0[1]);
          g.lineTo(b0[0], b0[1]);
        };
        for (let x = xa; x <= xb; x++) {
          line(P(x, ya, zb), P(x, yb, zb));
          line(P(x, yb, za), P(x, yb, zb));
        }
        for (let y = ya; y <= yb; y++) {
          line(P(xa, y, zb), P(xb, y, zb));
          line(P(xb, y, za), P(xb, y, zb));
        }
        for (let z = za; z <= zb; z++) {
          line(P(xa, yb, z), P(xb, yb, z));
          line(P(xb, ya, z), P(xb, yb, z));
        }
        g.stroke();
        g.restore();
      };
      // Schatten und Umriss des ganzen Würfels
      g.save();
      g.fillStyle = theme.dark ? 'rgba(0,0,0,0.35)' : 'rgba(16,24,40,0.10)';
      poly([P(0, 0, 0), P(10, 0, 0), P(10, 10, 0), P(0, 10, 0)].map(([x, y]) => [x + 6, y + 4] as [number, number]), theme.dark ? 'rgba(0,0,0,0.35)' : 'rgba(16,24,40,0.10)', null);
      g.restore();
      g.save();
      g.setLineDash([4, 4]);
      const ghost = alpha(theme.text, theme.dark ? 0.35 : 0.3);
      poly([P(0, 0, 10), P(10, 0, 10), P(10, 10, 10), P(0, 10, 10)], alpha(color, 0.05), ghost, 1.2);
      poly([P(0, 10, 0), P(10, 10, 0), P(10, 10, 10), P(0, 10, 10)], alpha(color, 0.04), ghost, 1.2);
      poly([P(10, 0, 0), P(10, 10, 0), P(10, 10, 10), P(10, 0, 10)], alpha(color, 0.06), ghost, 1.2);
      g.restore();
      // Füllung: 100 Reihen zu je 10 Würfeln
      const rows = u * 100;
      const full = Math.floor(rows / 10);
      const inLayer = rows - full * 10;
      if (full > 0) box(0, 10, 0, 10, 0, Math.min(10, full));
      if (full < 10) {
        for (let y = 0; y < 10; y++) {
          const a = clamp(inLayer - y, 0, 1);
          if (a <= 0) break;
          const drop = (1 - ease.outCubic(a)) * 2.5;
          box(0, 10, y, y + 1, full + drop, full + 1 + drop, clamp(a * 2, 0, 1));
        }
      }
      // Kante beschriften
      const side = VOL_SIDE[pair.big.id] ?? '';
      const sideS = VOL_SIDE[pair.small.id] ?? '';
      const [, ey] = P(10, 10, 0);
      halo(`${tt('Kante', 'edge')}: 1 ${side} = 10 ${sideS}`, cx, Math.min(R.y + R.h - 6, ey + 14), font(700, 12), theme.muted);
      const n = Math.min(1000, Math.floor(rows + 1e-9) * 10);
      return `${gi(n)} ${pair.small.sym}${pair.big.id === 'dm3' && u >= 1 ? ' = 1 l' : ''}`;
    }

    /** Balkenwaage: links 1 große Einheit, rechts kommen 10 Gewichte zu je F/10 dazu. */
    function drawBalance(R: Rect, pair: ReturnType<typeof illustrationPair>, u: number): string {
      const g = surface.g;
      const theme = ctx.theme;
      const color = illColor('mass');
      const F = pair.factor;
      const cx = R.x + R.w / 2;
      const bl = Math.max(46, Math.min(R.w * 0.31, R.h * 0.8, 130));
      const sl = bl * 0.62;
      const pw = bl * 0.92;
      const total = sl + bl * 0.62 + 10;
      const pivotY = R.y + Math.max(24, (R.h - total) / 2 + 8);
      const baseY = Math.min(R.y + R.h - 4, pivotY + sl + bl * 0.62);
      // Gewichte rechts: Ankunftszeit je Gewicht
      const arrive = (i: number) => clamp((u * 11 - i - 0.6) / 0.6, 0, 1);
      let mR = 0;
      for (let i = 0; i < 10; i++) mR += ease.outCubic(arrive(i));
      const theta = -0.2 * (1 - mR / 10);
      const steel = theme.dark ? ['#6b7380', '#3d434c'] : ['#e3e7ee', '#9aa3b0'];
      // Fuß und Säule
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.18)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      const fg = g.createLinearGradient(0, baseY - 14, 0, baseY);
      fg.addColorStop(0, steel[0]!);
      fg.addColorStop(1, steel[1]!);
      g.fillStyle = fg;
      roundRect(g, cx - bl * 0.55, baseY - 12, bl * 1.1, 12, 5);
      g.fill();
      const pg = g.createLinearGradient(cx - 5, 0, cx + 5, 0);
      pg.addColorStop(0, steel[1]!);
      pg.addColorStop(0.5, steel[0]!);
      pg.addColorStop(1, steel[1]!);
      g.fillStyle = pg;
      g.fillRect(cx - 4, pivotY, 8, baseY - 12 - pivotY);
      g.restore();
      // Balken
      const ex = Math.cos(theta) * bl;
      const ey = Math.sin(theta) * bl;
      const L0: [number, number] = [cx - ex, pivotY - ey];
      const R0: [number, number] = [cx + ex, pivotY + ey];
      g.save();
      g.lineCap = 'round';
      g.strokeStyle = steel[1]!;
      g.lineWidth = 7;
      g.beginPath();
      g.moveTo(L0[0], L0[1]);
      g.lineTo(R0[0], R0[1]);
      g.stroke();
      g.strokeStyle = steel[0]!;
      g.lineWidth = 3;
      g.stroke();
      // Zeiger
      g.strokeStyle = mR > 9.95 ? color : alpha(theme.text, 0.6);
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(cx, pivotY);
      g.lineTo(cx + Math.sin(theta) * 22, pivotY - Math.cos(theta) * 22);
      g.stroke();
      g.fillStyle = steel[1]!;
      g.beginPath();
      g.arc(cx, pivotY, 6, 0, Math.PI * 2);
      g.fill();
      g.restore();
      // Schalen
      const pan = (ax: number, ay: number): number => {
        const py = ay + sl;
        g.save();
        g.strokeStyle = alpha(theme.text, 0.45);
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(ax, ay);
        g.lineTo(ax - pw / 2, py);
        g.moveTo(ax, ay);
        g.lineTo(ax + pw / 2, py);
        g.stroke();
        g.beginPath();
        g.moveTo(ax - pw / 2 - 4, py);
        g.quadraticCurveTo(ax, py + 16, ax + pw / 2 + 4, py);
        g.closePath();
        const sg = g.createLinearGradient(0, py, 0, py + 10);
        sg.addColorStop(0, steel[0]!);
        sg.addColorStop(1, steel[1]!);
        g.fillStyle = sg;
        g.fill();
        g.restore();
        return py;
      };
      const pyL = pan(L0[0], L0[1]);
      const pyR = pan(R0[0], R0[1]);
      // Gewichtsstück (Zylinder mit Knauf), Messing
      const weight = (x: number, yb: number, w: number, h: number, label: string) => {
        g.save();
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(60,40,0,0.25)';
        g.shadowBlur = 4;
        g.shadowOffsetY = 1.5;
        const brass = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
        brass.addColorStop(0, theme.dark ? '#8a6a22' : '#b8892c');
        brass.addColorStop(0.4, theme.dark ? '#d9b660' : '#f2d27a');
        brass.addColorStop(1, theme.dark ? '#6e5418' : '#9a7020');
        g.fillStyle = brass;
        roundRect(g, x - w / 2, yb - h, w, h, Math.min(4, w * 0.15));
        g.fill();
        g.shadowColor = 'transparent';
        roundRect(g, x - w * 0.18, yb - h - h * 0.28, w * 0.36, h * 0.3, w * 0.1);
        g.fill();
        g.restore();
        if (label) text(g, label, x, yb - h / 2, { font: font(800, clamp(w * 0.28, 11, 15)), color: theme.dark ? '#2b2006' : '#3d2c05' });
      };
      const bigW = Math.min(pw * 0.62, 64);
      weight(L0[0], pyL + 4, bigW, bigW * 0.62, `1 ${pair.big.sym}`);
      // kleine Gewichte: 2 Reihen zu 5
      const sw = (pw - 10) / 5.4;
      const sh = sw * 0.9;
      for (let i = 0; i < 10; i++) {
        const a = arrive(i);
        const startT = clamp((u * 11 - i) / 0.6, 0, 1);
        if (startT <= 0) continue;
        const row = Math.floor(i / 5);
        const col = i % 5;
        const tx = R0[0] + (col - 2) * (sw + 1.5);
        const tyEnd = pyR + 4 - row * (sh * 1.32);
        const ty = tyEnd - (1 - ease.inCubic(Math.max(a, 0.001))) * (sl + 30) * (a < 1 ? 1 : 0);
        g.save();
        g.globalAlpha *= clamp(startT * 2, 0, 1);
        weight(tx, a >= 1 ? tyEnd : ty, sw, sh, '');
        g.restore();
      }
      const per = `${gi(F / 10)} ${pair.small.sym}`;
      halo(`${tt('je', 'each')} ${per}`, R0[0], Math.min(pyR + 26, R.y + R.h - 26), font(700, 11.5), theme.muted);
      if (mR > 9.95) halo('=', cx, pivotY + 34, font(800, 18), shade(color, theme.dark ? 0.2 : -0.1));
      return `${gi(Math.round(mR) * (F / 10))} ${pair.small.sym}`;
    }

    /** Uhr: ein Zeiger läuft einmal (bzw. zweimal) herum. */
    function drawClock(R: Rect, pair: ReturnType<typeof illustrationPair>, u: number): string {
      const g = surface.g;
      const theme = ctx.theme;
      const color = illColor('time');
      const r = Math.max(30, Math.min(R.w * 0.38, R.h * 0.44));
      const cx = R.x + R.w / 2;
      const cy = R.y + R.h / 2;
      const e = ease.inOutCubic(u);
      // Gehäuse
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,24,40,0.2)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 4;
      g.beginPath();
      g.arc(cx, cy, r + 6, 0, Math.PI * 2);
      const rim = g.createLinearGradient(0, cy - r, 0, cy + r);
      rim.addColorStop(0, theme.dark ? '#5b6370' : '#d5dae2');
      rim.addColorStop(1, theme.dark ? '#2c3139' : '#8f98a6');
      g.fillStyle = rim;
      g.fill();
      g.restore();
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      const face = g.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r);
      face.addColorStop(0, theme.dark ? shade(theme.bg, 0.22) : '#ffffff');
      face.addColorStop(1, theme.dark ? shade(theme.bg, 0.12) : '#eef1f5');
      g.fillStyle = face;
      g.fill();
      // vergangene Zeit als Sektor
      const laps = pair.big.id === 'd' ? 2 : 1;
      const turn = e * laps;
      const lap = Math.min(laps - 1, Math.floor(turn));
      const frac = turn - lap;
      if (lap > 0) {
        g.fillStyle = alpha(color, theme.dark ? 0.14 : 0.08);
        g.beginPath();
        g.arc(cx, cy, r - 3, 0, Math.PI * 2);
        g.fill();
      }
      if (frac > 0.001) {
        g.fillStyle = alpha(color, (theme.dark ? 0.22 : 0.14) * (u >= 1 && laps === 1 ? 0.6 : 1));
        g.beginPath();
        g.moveTo(cx, cy);
        g.arc(cx, cy, r - 3, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
        g.closePath();
        g.fill();
      }
      // Striche und Zahlen
      const ink = theme.dark ? '#e7ebf2' : '#1f2733';
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * Math.PI * 2;
        const big = i % 5 === 0;
        const r0 = r - (big ? 10 : 5);
        g.strokeStyle = alpha(ink, big ? 0.85 : 0.4);
        g.lineWidth = big ? 2 : 1;
        g.beginPath();
        g.moveTo(cx + Math.sin(a) * r0, cy - Math.cos(a) * r0);
        g.lineTo(cx + Math.sin(a) * (r - 3), cy - Math.cos(a) * (r - 3));
        g.stroke();
      }
      const fs = clamp(r * 0.17, 11, 16);
      for (let h = 1; h <= 12; h++) {
        const a = (h / 12) * Math.PI * 2;
        text(g, String(h), cx + Math.sin(a) * (r - 20 - fs * 0.2), cy - Math.cos(a) * (r - 20 - fs * 0.2) + 1, { font: font(700, fs), color: alpha(ink, 0.85) });
      }
      const hand = (ang: number, len: number, w: number, col: string) => {
        g.save();
        g.strokeStyle = col;
        g.lineWidth = w;
        g.lineCap = 'round';
        g.shadowColor = 'rgba(0,0,0,0.25)';
        g.shadowBlur = 3;
        g.shadowOffsetY = 1;
        g.beginPath();
        g.moveTo(cx - Math.sin(ang) * len * 0.12, cy + Math.cos(ang) * len * 0.12);
        g.lineTo(cx + Math.sin(ang) * len, cy - Math.cos(ang) * len);
        g.stroke();
        g.restore();
      };
      const twoPi = Math.PI * 2;
      let count = 0;
      if (pair.big.id === 'h') {
        hand((e / 12) * twoPi, r * 0.5, 5, ink);
        hand(e * twoPi, r * 0.78, 3.5, shade(color, theme.dark ? 0.1 : -0.1));
        count = Math.round(e * 60);
      } else if (pair.big.id === 'min') {
        hand((e / 60) * twoPi, r * 0.78, 3.5, ink);
        hand(e * twoPi, r * 0.85, 2, shade(color, theme.dark ? 0.1 : -0.1));
        count = Math.round(e * 60);
      } else {
        hand(turn * twoPi, r * 0.55, 5, shade(color, theme.dark ? 0.1 : -0.1));
        count = Math.round(e * 24);
        if (u > 0) halo(lap === 0 ? tt('1. Runde: 12 h', '1st lap: 12 h') : tt('2. Runde: 24 h', '2nd lap: 24 h'), cx, cy + r * 0.42, font(700, 11.5), theme.muted);
      }
      g.fillStyle = ink;
      g.beginPath();
      g.arc(cx, cy, 4, 0, Math.PI * 2);
      g.fill();
      return `${count} ${pair.small.sym}`;
    }

    /* ================================================================== */
    /* Ergebnisse                                                          */
    /* ================================================================== */

    function updateReadouts(): void {
      const st = getState();
      const all = ['task', 'res', 'how', 'rel', 'mixed'];
      const shown = new Set<string>();
      if (!st.value || !st.conv) {
        ctx.readout('task', tt('Keine gültige Zahl', 'Not a valid number'));
        shown.add('task');
      } else {
        const c = st.conv;
        ctx.readout('task', `${fd(c.value)} ${c.from.sym} = ? ${c.to.sym}`);
        ctx.readout('res', conversionText(c, lang));
        let how: string;
        if (st.q === 'time') {
          const steps = timeSteps(st);
          if (!steps.length) how = tt('gleiche Einheit', 'same unit');
          else {
            const ops = steps.map((s) => `${s.multiply ? '·' : ':'} ${s.factor}`).join(' ');
            how = `${fd(c.value)} ${ops} ${c.exact ? '=' : '≈'} ${fd(c.result)}`;
          }
        } else if (c.shift === 0) how = tt('Komma bleibt stehen', 'the point stays put');
        else {
          const k = Math.abs(c.shift);
          how = `${tt('Komma', 'Point')} ${k} ${k === 1 ? tt('Stelle', 'place') : tt('Stellen', 'places')} ${c.shift > 0 ? tt('nach rechts', 'to the right') : tt('nach links', 'to the left')} (${c.shift > 0 ? '·' : ':'} ${gi(c.factor)})`;
        }
        ctx.readout('how', how);
        let rel = relationText(st.q, c.from, c.to, lang);
        if (st.q === 'vol' && (c.from.aliasOf || c.to.aliasOf)) rel += ' · 1 dm³ = 1 l · 1 cm³ = 1 ml';
        ctx.readout('rel', rel);
        shown.add('task').add('res').add('how').add('rel');
        if (st.q === 'time' && c.from.id !== c.to.id) {
          const mixed = mixedTime(c.value, c.from.id, c.to.id);
          if (mixed.length > 1) {
            ctx.readout('mixed', mixedText(mixed, lang));
            shown.add('mixed');
          }
        }
      }
      for (const key of all) if (!shown.has(key)) ctx.readout(key, null);
    }

    function updateActions(): void {
      const st = getState();
      ctx.setAction('go', { enabled: !ctx.locked && !!st.conv });
      ctx.setAction('task', { enabled: !ctx.locked });
      ctx.setAction('swap', { enabled: !ctx.locked && !!st.conv && st.conv.exact });
    }

    /* ================================================================== */
    /* Zeiger                                                              */
    /* ================================================================== */

    surface.addTarget({
      contains: (px, py) => geo !== null && hitAt(px, py) !== null,
      pointerDown: (pt) => {
        if (ctx.locked) return false;
        const h = hitAt(pt.px, pt.py);
        if (!h) return false;
        if (h.id.startsWith('unit:')) {
          const q = p.q as QuantityId;
          const id = h.id.slice(5);
          if (pv[TO_KEY[q]] !== id) ctx.set({ [TO_KEY[q]]: id } as never);
          else {
            revealed = true;
            rehop(80);
            ctx.requestRender();
          }
          return true;
        }
        return false;
      },
      pointerMove: () => {},
      pointerUp: () => {},
      hover: (pt) => {
        const h = pt && !ctx.locked ? hitAt(pt.px, pt.py) : null;
        const id = h?.id ?? null;
        if (id !== hover) {
          hover = id;
          ctx.requestRender();
        }
        surface.setCursor(id ? 'pointer' : '');
      },
      wheel: () => false,
    });

    /* ================================================================== */
    /* Ablauf                                                              */
    /* ================================================================== */

    let shownQ = p.q;
    relay(260);
    restartIllustration(getState());
    updateReadouts();
    updateActions();

    return {
      update(changed, source) {
        now = performance.now();
        const q = p.q as QuantityId;
        if (changed.has('q') && source === 'input') {
          ctx.set({ v: START_VALUE[q].replace(',', lang === 'de' ? ',' : '.') });
        }
        if (changed.has('show') && source !== 'init') revealed = p.show;
        if (taskPending) {
          revealed = false;
          taskPending = false;
        } else if (source !== 'init' && (changed.has('v') || changed.has('q') || changed.has(FROM_KEY[q]) || changed.has(TO_KEY[q]))) {
          if (p.show) revealed = true;
          else if (source === 'replace') revealed = false;
        }
        if (changed.has('q') && p.q !== shownQ && source !== 'init') {
          shownQ = p.q;
          sceneStart = now + (reduced ? -1e6 : 30);
          winInit = false;
        }
        if (source !== 'init') {
          const relaid = changed.has('v') || changed.has('q') || changed.has(FROM_KEY[q]);
          if (relaid) relay(changed.has('q') ? 260 : 120);
          else if (changed.has(TO_KEY[q]) || changed.has('show')) rehop();
          restartIllustration(getState());
        }
        updateReadouts();
        updateActions();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        now = performance.now();
        const q = p.q as QuantityId;
        if (id === 'go') {
          revealed = true;
          const st = getState();
          hopAt = reduced ? -1e6 : Math.max(now + 150, layEnd(st) + 120);
          illAt = reduced ? -1e6 : now + 150;
        } else if (id === 'task') {
          const tk = randomTask(q, Math.random);
          taskPending = true;
          revealed = false;
          ctx.set({ v: inputText(tk.value, lang), [FROM_KEY[q]]: tk.from, [TO_KEY[q]]: tk.to } as never);
          setTimeout(() => (taskPending = false), 0);
          relay(120);
        } else if (id === 'swap') {
          const st = getState();
          if (st.conv && st.conv.exact) ctx.set({ v: inputText(st.conv.result, lang), [FROM_KEY[q]]: st.to.id, [TO_KEY[q]]: st.from.id } as never);
        }
        updateActions();
        ctx.requestRender();
      },

      render() {
        now = performance.now();
        if (!geo || geo.W !== surface.width || geo.H !== surface.height) geo = computeGeo();
        hits = [];
        surface.begin();
        const st = getState();
        if (st.q === 'time') drawTime(geo, st);
        else drawTable(geo, st);
        drawPanel(geo, st);
        const tm = hopTiming(st);
        const busy =
          now - sceneStart < 500 ||
          now < layEnd(st) + 400 ||
          (hopAt !== null && now < tm.resEnd + 300) ||
          now < illAt + 3400 ||
          winHi.busy(now) ||
          winLo.busy(now);
        if (busy) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
