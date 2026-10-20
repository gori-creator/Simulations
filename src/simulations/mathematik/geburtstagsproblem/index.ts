import { clamp, defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, seededRandom, Surface, type Rect } from '../../../sim-core';
import { allDifferentSeries, band95, dayOfYear, duplicates, factors, hasMine, hasShared, monthDay, MONTH_LENGTHS, pairs, pApprox, pMine, pShared, randomClass, sharedPairs, smallestN, distinctDays } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const TAU = Math.PI * 2;

type Mode = 'class' | 'sim' | 'calc' | 'pairs';
type Question = 'any' | 'mine';

const MONTHS_DE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG_DE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const MONTHS_LONG_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEK_DE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const WEEK_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const N_MAX = 70;
/** Höchstens so viele Klassen-Kacheln werden im Simulationsbild gezeigt. */
const TILE_MAX = 200;

/** Exponentielles Nachziehen eines angezeigten Werts (dt, tau in s). */
const follow = (v: number, goal: number, dt: number, tau: number) => {
  if (tau <= 0) return goal;
  const nv = v + (goal - v) * (1 - Math.exp(-dt / tau));
  return Math.abs(goal - nv) < 1e-4 * (1 + Math.abs(goal)) ? goal : nv;
};

/** Unterbrechbarer Übergang 0 … 1 (z. B. Wechsel der Ansicht). */
class Glide {
  private from: number;
  private to: number;
  private t0 = 0;
  private ms = 0;
  constructor(v: number) {
    this.from = v;
    this.to = v;
  }
  at(now: number): number {
    if (this.ms <= 0) return this.to;
    const u = clamp01((now - this.t0) / this.ms);
    return this.from + (this.to - this.from) * ease.inOutCubic(u);
  }
  busy(now: number): boolean {
    return this.ms > 0 && now < this.t0 + this.ms;
  }
  go(to: number, ms: number, now: number): void {
    this.from = this.at(now);
    this.to = to;
    this.t0 = now;
    this.ms = ms;
  }
  snap(v: number): void {
    this.from = this.to = v;
    this.ms = 0;
  }
}

interface Stat {
  runs: number;
  hits: number;
  /** Trefferzahl nach jeder Klasse (für die Häufigkeitskurve). */
  hist: number[];
  /** Ergebnis der letzten Klassen (für die Kacheln). */
  tiles: boolean[];
}

interface Runner {
  key: string;
  target: number;
  done: number;
  t0: number;
  dur: number;
}

/**
 * Geburtstagsproblem in vier Ansichten:
 * – Eine Klasse: Geburtstage fliegen in den Jahreskalender, gleiche Tage leuchten.
 * – Viele Klassen: sichtbar ablaufende Simulation, die relative Häufigkeit nähert
 *   sich der Wahrscheinlichkeit (mit 95-%-Trichter).
 * – Rechnung: Personen kommen einzeln, die freien Tage schrumpfen, das Produkt der
 *   Pfadregel entsteht Schritt für Schritt (Gegenereignis „alle verschieden“).
 * – Paare: alle n(n − 1)/2 Paare als Linien, Näherung über die Paare, Vergleich mit
 *   „jemand an meinem Tag“ (nur n Paare).
 * Statt 365 Tagen auch 12 Monate oder 7 Wochentage (Schubfachprinzip).
 */
export default defineSimulation({
  id: 'geburtstagsproblem',
  dragHint: true,
  layout: { aspect: 1.55, aspectNarrow: 0.56 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'class', label: L('Eine Klasse', 'One class') },
        { value: 'sim', label: L('Viele Klassen', 'Many classes') },
        { value: 'calc', label: L('Rechnung', 'Calculation') },
        { value: 'pairs', label: L('Paare', 'Pairs') },
      ],
      default: 'class',
    },
    { key: 'n', type: 'number', label: L('Personen in der Klasse', 'People in the class'), help: L('Auch direkt im Diagramm ziehen.', 'You can also drag in the chart.'), min: 2, max: N_MAX, step: 1, default: 25 },
    {
      key: 'd',
      type: 'choice',
      label: L('Gleich heißt', 'Same means'),
      options: [
        { value: '365', label: L('gleicher Tag (365)', 'same day (365)') },
        { value: '12', label: L('gleicher Monat (12)', 'same month (12)') },
        { value: '7', label: L('gleicher Wochentag (7)', 'same weekday (7)') },
      ],
      default: '365',
    },
    {
      key: 'q',
      type: 'choice',
      label: L('Frage', 'Question'),
      options: [
        { value: 'any', label: L('Haben zwei am selben Tag Geburtstag?', 'Do two share a birthday?') },
        { value: 'mine', label: L('Hat jemand an meinem Geburtstag Geburtstag?', 'Does anyone share my birthday?') },
      ],
      default: 'any',
    },
    { key: 'me', type: 'number', label: L('Mein Geburtstag (Tag im Jahr)', 'My birthday (day of the year)'), min: 1, max: 365, step: 1, default: 135, visibleIf: (v) => v.q === 'mine' || v.both === true, help: L('1 = 1. Januar, 365 = 31. Dezember. Oder im Kalender antippen.', '1 = 1 January, 365 = 31 December. Or tap the calendar.') },
    { key: 'curve', type: 'boolean', group: 'view', label: L('Wahrscheinlichkeiten anzeigen', 'Show probabilities'), help: L('Aus: Werte durch „?“ ersetzt (für Aufgaben).', 'Off: values replaced by “?” (for tasks).'), default: true },
    { key: 'both', type: 'boolean', group: 'view', label: L('Beide Fragen vergleichen', 'Compare both questions'), default: false },
  ],
  actions: [
    { id: 'one', label: L('Neue Klasse', 'New class'), primary: true, visibleIf: (v) => v.mode === 'class' || v.mode === 'pairs' },
    { id: 'many', label: L('100 Klassen', '100 classes'), visibleIf: (v) => v.mode === 'class' || v.mode === 'sim' },
    { id: 'k1000', label: L('1000 Klassen', '1000 classes'), visibleIf: (v) => v.mode === 'sim' },
    { id: 'step', label: L('Noch einmal Schritt für Schritt', 'Step by step again'), visibleIf: (v) => v.mode === 'calc' },
    { id: 'clear', label: L('Zähler löschen', 'Clear counts'), visibleIf: (v) => v.mode === 'class' || v.mode === 'sim' },
  ],
  readouts: [
    { key: 'p', label: L('Wahrscheinlichkeit', 'Probability'), spoiler: true },
    { key: 'sim', label: L('Simulation', 'Simulation') },
    { key: 'class', label: L('Diese Klasse', 'This class') },
  ],
  presets: [
    { id: 'start', label: L('Klasse mit 25', 'Class of 25'), values: {} },
    { id: 'n23', label: L('Ab 23 über 50 %', 'From 23 above 50 %'), values: { n: 23 } },
    { id: 'sim', label: L('1000 Klassen simulieren', 'Simulate 1000 classes'), values: { mode: 'sim', n: 23 } },
    { id: 'calc', label: L('Rechnung mit Gegenereignis', 'Calculation via complement'), values: { mode: 'calc', n: 23 } },
    { id: 'pairs', label: L('23 Personen, 253 Paare', '23 people, 253 pairs'), values: { mode: 'pairs', n: 23 } },
    { id: 'months', label: L('Gleicher Monat: 5 Personen', 'Same month: 5 people'), values: { d: '12', n: 5 } },
    { id: 'pigeon', label: L('13 Personen: Monat sicher gleich', '13 people: month surely shared'), values: { d: '12', n: 13 } },
    { id: 'mine', label: L('Mein Geburtstag', 'My birthday'), values: { q: 'mine', both: true } },
  ],
  strings: {
    de: { canvas: 'Geburtstagsproblem: links eine Klasse im Jahreskalender (gleiche Tage hervorgehoben), eine Simulation vieler Klassen, die schrittweise Rechnung mit dem Gegenereignis oder alle Paare als Linien; rechts die Wahrscheinlichkeit in Abhängigkeit von der Klassengröße und die Rechnung.' },
    en: { canvas: 'Birthday problem: on the left a class in a year calendar (shared days highlighted), a simulation of many classes, the step-by-step calculation via the complement, or all pairs as lines; on the right the probability depending on the class size and the calculation.' },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const de = ctx.lang === 'de';
    const tt = (d: string, e: string) => (de ? d : e);
    const reduced = () => prefersReducedMotion();
    const MONTHS = de ? MONTHS_DE : MONTHS_EN;
    const MONTHS_LONG = de ? MONTHS_LONG_DE : MONTHS_LONG_EN;
    const WEEK = de ? WEEK_DE : WEEK_EN;

    const mode = () => p.mode as Mode;
    const q = () => p.q as Question;
    const days = () => Number(p.d) || 365;
    /** „Mein“ Tag als Fach (Tag im Jahr, Monat oder Wochentag). */
    const mySlot = () => {
      const d = days();
      if (d === 12) return monthDay(p.me - 1).month;
      if (d === 7) return (p.me - 1) % 7;
      return p.me - 1;
    };
    const showMine = () => q() === 'mine' || p.both;
    const pAny = (n: number) => pShared(n, days());
    const pMy = (n: number) => pMine(n, days());
    const pOf = (n: number) => (q() === 'mine' ? pMy(n) : pAny(n));
    const hitOf = (b: readonly number[]) => (q() === 'mine' ? hasMine(b, mySlot()) : hasShared(b));

    /* ---------- Farben ---------- */
    const C = () => {
      const s = th().series;
      return { any: s[0]!, hit: s[1]!, ok: s[2]!, mine: s[3]!, approx: s[4]!, band: s[5]! };
    };
    const pillBg = () => (th().dark ? 'rgba(15,20,30,0.92)' : 'rgba(255,255,255,0.95)');

    /* ---------- Zustand ---------- */
    let rnd = seededRandom((Date.now() ^ 0x5bd1e995) >>> 0);
    let cls: number[] = randomClass(p.n, rnd, days());
    let clsT0 = performance.now() + (reduced() ? -1e6 : 250);
    const stats = new Map<string, Stat>();
    const statKey = () => `${p.n}|${q()}|${q() === 'mine' ? mySlot() : ''}|${days()}`;
    const statNow = () => stats.get(statKey());
    let runner: Runner | null = null;
    let burst = -1e9;
    let calcOrder: number[] = distinctDays(p.n, rnd, days());
    let calcT0 = performance.now();
    let pairFocus: number | null = null;
    let hoverSlot: number | null = null;
    let dragN = false;

    // weich nachgeführte Anzeigewerte
    const curveAny = Array.from({ length: N_MAX + 1 }, (_, n) => pAny(n));
    const curveMine = Array.from({ length: N_MAX + 1 }, (_, n) => pMy(n));
    const curveApprox = Array.from({ length: N_MAX + 1 }, (_, n) => pApprox(n, days()));
    const xMaxFor = () => {
      if (mode() === 'calc') return Math.min(N_MAX, Math.max(days() === 365 ? 25 : days() + 3, p.n + 2));
      return days() === 365 ? N_MAX : Math.min(N_MAX, Math.max(days() === 12 ? 16 : 10, p.n + 1));
    };
    let xMaxS = xMaxFor();
    let nS = p.n;
    let pS = pOf(p.n);
    let hS = 0;
    const view = new Glide(1);
    let prevMode: Mode = mode();
    let curMode: Mode = mode();
    let intro: number | null = reduced() ? null : performance.now();
    let lastTime = performance.now();
    let cardT0 = -1e9;

    function record(b: readonly number[]): void {
      const k = statKey();
      const s = stats.get(k) ?? { runs: 0, hits: 0, hist: [], tiles: [] };
      s.runs++;
      const hit = hitOf(b);
      if (hit) s.hits++;
      if (s.hist.length < 20000) s.hist.push(s.hits);
      s.tiles.push(hit);
      if (s.tiles.length > TILE_MAX) s.tiles.splice(0, s.tiles.length - TILE_MAX);
      stats.set(k, s);
    }

    function newClass(now: number, fly = true): void {
      cls = randomClass(p.n, rnd, days());
      clsT0 = fly && !reduced() ? now : -1e6;
      pairFocus = null;
      record(cls);
    }

    function startRunner(count: number, now: number): void {
      runner = { key: statKey(), target: count, done: 0, t0: now, dur: reduced() ? 0 : count >= 1000 ? 4200 : 2600 };
      stepRunner(now);
    }
    function stepRunner(now: number): void {
      if (!runner) return;
      if (runner.key !== statKey()) {
        runner = null;
        return;
      }
      const u = runner.dur <= 0 ? 1 : clamp01((now - runner.t0) / runner.dur);
      const due = Math.round(runner.target * ease.inOutCubic(u));
      while (runner.done < due) {
        const b = randomClass(p.n, rnd, days());
        record(b);
        cls = b;
        runner.done++;
      }
      clsT0 = -1e6;
      burst = now;
      if (u >= 1) {
        runner = null;
        updateReadouts();
        syncActions();
      }
    }

    function restartCalc(now: number): void {
      calcOrder = distinctDays(p.n, rnd, days());
      calcT0 = now + (reduced() ? -1e9 : 350);
    }
    /** Schrittdauer der Rechnung (ms pro Person). */
    const stepMs = () => Math.max(110, Math.min(520, 7000 / Math.max(1, p.n)));
    /** Wie viele Personen in der Rechnung schon da sind (gebrochen, für weiche Übergänge). */
    const calcK = (now: number) => (reduced() ? Math.min(p.n, days()) : clamp((now - calcT0) / stepMs(), 0, Math.min(p.n, days())));

    /* ---------- Aufteilung ---------- */
    const wide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    function regions(): { vis: Rect; chart: Rect; info: Rect } {
      const W = surface.width;
      const H = surface.height;
      if (wide()) {
        const vw = Math.round(W * 0.55);
        const x = vw + 10;
        const ch = Math.round(H * 0.58);
        return { vis: { x: 0, y: 0, w: vw, h: H }, chart: { x, y: 0, w: W - x, h: ch }, info: { x, y: ch + 10, w: W - x, h: H - ch - 10 } };
      }
      const vh = Math.round(H * 0.42);
      const ch = Math.round(H * 0.3);
      return { vis: { x: 0, y: 0, w: W, h: vh }, chart: { x: 0, y: vh + 10, w: W, h: ch }, info: { x: 0, y: vh + ch + 20, w: W, h: H - vh - ch - 20 } };
    }
    const baseSize = () => (wide() ? (surface.width < 900 ? 12 : 13) : 12);

    /* ---------- Text mit Hoch-/Tiefstellung und Brüchen ---------- */
    // \f{Zähler}{Nenner}, ^{hoch}, _{tief}
    type Seg = { k: 't' | 'sup' | 'sub'; s: string } | { k: 'frac'; a: string; b: string };
    function parse(src: string): Seg[] {
      const out: Seg[] = [];
      let i = 0;
      let buf = '';
      const flush = () => {
        if (buf) out.push({ k: 't', s: buf });
        buf = '';
      };
      const group = (): string => {
        if (src[i] !== '{') return '';
        let depth = 0;
        const start = i + 1;
        for (; i < src.length; i++) {
          if (src[i] === '{') depth++;
          else if (src[i] === '}') {
            depth--;
            if (depth === 0) {
              const s = src.slice(start, i);
              i++;
              return s;
            }
          }
        }
        return src.slice(start);
      };
      while (i < src.length) {
        const c = src[i]!;
        if (c === '\\' && src[i + 1] === 'f' && src[i + 2] === '{') {
          flush();
          i += 2;
          const a = group();
          const b = group();
          out.push({ k: 'frac', a, b });
        } else if ((c === '^' || c === '_') && src[i + 1] === '{') {
          flush();
          i++;
          out.push({ k: c === '^' ? 'sup' : 'sub', s: group() });
        } else {
          buf += c;
          i++;
        }
      }
      flush();
      return out;
    }
    const fontOf = (size: number, weight: number) => `${weight} ${size}px ${th().font}`;
    function measure(src: string, size: number, weight = 650): { w: number; tall: boolean } {
      const g = surface.g;
      let w = 0;
      let tall = false;
      for (const s of parse(src)) {
        if (s.k === 'frac') {
          g.font = fontOf(size * 0.82, weight);
          w += Math.max(g.measureText(s.a).width, g.measureText(s.b).width) + 6;
          tall = true;
        } else {
          g.font = fontOf(s.k === 't' ? size : size * 0.72, weight);
          w += g.measureText(s.s).width;
        }
      }
      return { w, tall };
    }
    function rich(src: string, x: number, y: number, size: number, color: string, align: 'left' | 'center' | 'right' = 'left', weight = 650): number {
      const g = surface.g;
      const { w } = measure(src, size, weight);
      let cx = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.fillStyle = color;
      g.strokeStyle = color;
      g.textBaseline = 'middle';
      g.textAlign = 'left';
      for (const s of parse(src)) {
        if (s.k === 'frac') {
          g.font = fontOf(size * 0.82, weight);
          const fw = Math.max(g.measureText(s.a).width, g.measureText(s.b).width) + 6;
          g.textAlign = 'center';
          g.fillText(s.a, cx + fw / 2, y - size * 0.5);
          g.fillText(s.b, cx + fw / 2, y + size * 0.55);
          g.textAlign = 'left';
          g.lineWidth = 1.1;
          g.beginPath();
          g.moveTo(cx + 1, y + 0.5);
          g.lineTo(cx + fw - 1, y + 0.5);
          g.stroke();
          cx += fw;
        } else {
          const sz = s.k === 't' ? size : size * 0.72;
          g.font = fontOf(sz, weight);
          const dy = s.k === 'sup' ? -size * 0.38 : s.k === 'sub' ? size * 0.3 : 0;
          g.fillText(s.s, cx, y + dy);
          cx += g.measureText(s.s).width;
        }
      }
      return w;
    }
    /** Schrift verkleinern, bis der Text in die Breite passt. */
    function fitSize(src: string, maxW: number, size: number, weight = 650, min = 9.5): number {
      let s = size;
      while (s > min && measure(src, s, weight).w > maxW) s -= 0.5;
      return s;
    }

    function cardFrame(r: Rect, alpha: number): void {
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 3;
      g.fillStyle = th().dark ? 'rgba(21,28,39,0.96)' : 'rgba(255,255,255,0.97)';
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = th().dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1;
      roundRect(g, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 12);
      g.stroke();
      g.restore();
    }

    function pill(x: number, y: number, src: string, color: string, opts: { align?: 'left' | 'center' | 'right'; size?: number; fill?: boolean; clampTo?: Rect } = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? baseSize() - 0.5;
      const w = measure(src, size, 750).w + 18;
      const h = size + 12;
      let x0 = opts.align === 'left' ? x : opts.align === 'right' ? x - w : x - w / 2;
      if (opts.clampTo) x0 = clamp(x0, opts.clampTo.x + 6, opts.clampTo.x + opts.clampTo.w - 6 - w);
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      g.fillStyle = opts.fill ? color : pillBg();
      roundRect(g, x0, y - h / 2, w, h, h / 2);
      g.fill();
      g.restore();
      if (!opts.fill) {
        g.strokeStyle = mixColor(color, th().bg, 0.35);
        g.lineWidth = 1.2;
        roundRect(g, x0 + 0.5, y - h / 2 + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      rich(src, x0 + 9, y + 0.5, size, opts.fill ? '#ffffff' : color, 'left', 750);
      return { x: x0, y: y - h / 2, w, h };
    }

    function ball(x: number, y: number, r: number, col: string, alpha = 1): void {
      if (r < 0.3) return;
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      const grad = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
      grad.addColorStop(0, mixColor(col, '#ffffff', 0.5));
      grad.addColorStop(1, col);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
      g.restore();
    }

    /* ---------- Zahlen ---------- */
    const pct = (v: number, d = 1) => `${fmt.fixed(v * 100, d)} %`;
    const shownPct = (v: number, d = 1) => (p.curve ? pct(v, d) : '?');
    const slotName = (s: number) => {
      const d = days();
      if (d === 12) return MONTHS_LONG[s] ?? '';
      if (d === 7) return WEEK[s] ?? '';
      const md = monthDay(s);
      return de ? `${md.day}. ${MONTHS[md.month]}` : `${MONTHS[md.month]} ${md.day}`;
    };
    const unitWord = (plural: boolean) => {
      const d = days();
      if (d === 12) return plural ? tt('Monate', 'months') : tt('Monat', 'month');
      if (d === 7) return plural ? tt('Wochentage', 'weekdays') : tt('Wochentag', 'weekday');
      return plural ? tt('Tage', 'days') : tt('Tag', 'day');
    };

    /* ---------- Fächer: Kalender (365) oder Kästen (12/7) ---------- */
    interface SlotGeo {
      pos: (s: number) => { x: number; y: number };
      r: number;
      /** Kasten eines Fachs (nur bei 12/7). */
      box?: (s: number) => Rect;
      hit: (px: number, py: number) => number | null;
    }
    function slotGeo(R: Rect, top: number, bottom: number): SlotGeo {
      const d = days();
      const small = R.w < 440;
      if (d === 365) {
        const left = R.x + (small ? 32 : 42);
        const t0 = R.y + top;
        const cw = (R.x + R.w - 12 - left) / 31;
        const chh = (R.y + R.h - bottom - t0) / 12;
        const r = Math.max(1.6, Math.min(cw * 0.44, chh * 0.36));
        const pos = (s: number) => {
          const md = monthDay(s);
          return { x: left + (md.day - 0.5) * cw, y: t0 + md.month * chh + chh / 2 };
        };
        const hit = (px: number, py: number) => {
          const m = Math.floor((py - t0) / chh);
          const dd = Math.floor((px - left) / cw) + 1;
          if (m < 0 || m > 11 || dd < 1 || dd > MONTH_LENGTHS[m]!) return null;
          return dayOfYear(m, dd);
        };
        return { pos, r, hit };
      }
      const cols = d === 12 ? (R.w > R.h * 1.15 ? 4 : 3) : R.w > 360 ? 7 : 4;
      const rows = Math.ceil(d / cols);
      const gx = R.x + 12;
      const gy = R.y + top;
      const gw = R.w - 24;
      const gh = R.y + R.h - bottom - gy;
      const bw = gw / cols;
      const bh = gh / rows;
      const box = (s: number): Rect => ({ x: gx + (s % cols) * bw + 3, y: gy + Math.floor(s / cols) * bh + 3, w: bw - 6, h: bh - 6 });
      const pos = (s: number) => {
        const b = box(s);
        return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
      };
      const hit = (px: number, py: number) => {
        const c = Math.floor((px - gx) / bw);
        const rr = Math.floor((py - gy) / bh);
        const s = rr * cols + c;
        if (c < 0 || c >= cols || rr < 0 || s >= d) return null;
        return s;
      };
      return { pos, r: Math.min(bw, bh) * 0.12, box, hit };
    }

    /** Fächer zeichnen; `items` = Personen (Fach, Ankunft 0 … 1, Farbe). */
    function drawSlots(R: Rect, top: number, bottom: number, items: { s: number; a: number; col: string }[], opts: { dupGlow?: Map<number, number>; pulse?: number; occupiedGrey?: boolean } = {}): void {
      const g = surface.g;
      const d = days();
      const geo = slotGeo(R, top, bottom);
      const small = R.w < 440;
      const size = small ? 10 : 11;
      const c = C();
      if (d === 365) {
        // Raster
        const left = R.x + (small ? 32 : 42);
        const t0 = R.y + top;
        const cw = (R.x + R.w - 12 - left) / 31;
        const chh = (R.y + R.h - bottom - t0) / 12;
        for (let m = 0; m < 12; m++) {
          const y = t0 + m * chh + chh / 2;
          g.font = fontOf(size, 700);
          g.fillStyle = th().muted;
          g.textAlign = 'right';
          g.textBaseline = 'middle';
          g.fillText(MONTHS[m]!, left - 6, y);
          g.fillStyle = mixColor(th().text, th().bg, th().dark ? 0.86 : 0.9);
          for (let dd = 1; dd <= MONTH_LENGTHS[m]!; dd++) {
            g.beginPath();
            g.arc(left + (dd - 0.5) * cw, y, Math.max(1.1, geo.r * 0.32), 0, TAU);
            g.fill();
          }
        }
        g.font = fontOf(9.5, 600);
        g.fillStyle = th().muted;
        g.textAlign = 'center';
        for (let dd = 1; dd <= 31; dd++) if (dd === 1 || dd % 5 === 0) g.fillText(String(dd), left + (dd - 0.5) * cw, t0 - 7);
        // Hover
        if (hoverSlot !== null && hoverSlot < 365) {
          const ps = geo.pos(hoverSlot);
          g.strokeStyle = mixColor(th().text, th().bg, 0.4);
          g.lineWidth = 1.2;
          g.beginPath();
          g.arc(ps.x, ps.y, geo.r + 3, 0, TAU);
          g.stroke();
        }
      } else {
        const counts = new Map<number, number>();
        for (const it of items) if (it.a > 0) counts.set(it.s, (counts.get(it.s) ?? 0) + 1);
        for (let s = 0; s < d; s++) {
          const b = geo.box!(s);
          const cnt = counts.get(s) ?? 0;
          const dup = (opts.dupGlow?.get(s) ?? 0) >= 2;
          g.save();
          g.fillStyle = dup ? mixColor(c.hit, th().bg, 0, th().dark ? 0.2 : 0.1) : mixColor(th().text, th().bg, 0, th().dark ? 0.05 : 0.035);
          roundRect(g, b.x, b.y, b.w, b.h, 10);
          g.fill();
          g.strokeStyle = dup ? mixColor(c.hit, th().bg, 0.2) : hoverSlot === s ? th().muted : mixColor(th().text, th().bg, 0.82);
          g.lineWidth = dup ? 2 : 1;
          roundRect(g, b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1, 10);
          g.stroke();
          g.restore();
          g.font = fontOf(size, 750);
          g.fillStyle = th().muted;
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          g.fillText(d === 12 ? MONTHS[s]! : WEEK[s]!, b.x + 8, b.y + 12);
          if (cnt > 0) {
            g.textAlign = 'right';
            g.fillStyle = dup ? c.hit : th().muted;
            g.fillText(`${cnt}×`, b.x + b.w - 8, b.y + 12);
          }
        }
      }
      // Personen
      const seen = new Map<number, number>();
      const maxPer = Math.max(1, ...[...duplicates(items.map((it) => it.s)).values()]);
      for (const it of items) {
        if (it.a <= 0) continue;
        const k = seen.get(it.s) ?? 0;
        seen.set(it.s, k + 1);
        const e = ease.outBack(clamp01(it.a));
        const fall = (1 - ease.outCubic(clamp01(it.a))) * 34;
        if (d === 365) {
          const ps = geo.pos(it.s);
          ball(ps.x, ps.y - fall - k * geo.r * 0.55, Math.max(0.5, geo.r * e), it.col, clamp01(it.a * 2));
        } else {
          const b = geo.box!(it.s);
          // im Kasten in einem Raster anordnen
          const inner = { x: b.x + 6, y: b.y + 22, w: b.w - 12, h: b.h - 28 };
          const per = Math.max(maxPer, 1);
          const cols = Math.max(1, Math.ceil(Math.sqrt((per * inner.w) / Math.max(1, inner.h))));
          const rowsN = Math.ceil(per / cols);
          const cell = Math.min(inner.w / cols, inner.h / rowsN, 30);
          const ox = inner.x + (inner.w - cols * cell) / 2;
          const x = ox + (k % cols) * cell + cell / 2;
          const y = inner.y + inner.h - (Math.floor(k / cols) + 0.5) * cell;
          ball(x, y - fall, Math.max(0.5, cell * 0.38 * e), it.col, clamp01(it.a * 2));
        }
      }
      // Ringe um gemeinsame Tage (nur Kalender)
      if (d === 365 && opts.dupGlow) {
        const pu = opts.pulse ?? 0;
        for (const [s, cnt] of opts.dupGlow) {
          if (cnt < 2) continue;
          const ps = geo.pos(s);
          g.save();
          g.strokeStyle = mixColor(c.hit, th().bg, 0, 0.55 + 0.4 * pu);
          g.lineWidth = 2;
          g.beginPath();
          g.arc(ps.x, ps.y - (cnt - 1) * geo.r * 0.27, geo.r + 3 + pu * 2, 0, TAU);
          g.stroke();
          g.restore();
          if (geo.r > 4.2) {
            const right = ps.x + geo.r + 22 < R.x + R.w;
            rich(`×${cnt}`, right ? ps.x + geo.r + 5 : ps.x - geo.r - 5, ps.y - geo.r, 9.5, c.hit, right ? 'left' : 'right', 800);
          }
        }
      }
      // mein Tag
      if (showMine()) {
        const s = mySlot();
        const c2 = c.mine;
        if (d === 365) {
          const ps = geo.pos(s);
          g.save();
          g.strokeStyle = c2;
          g.lineWidth = 2;
          g.setLineDash([3, 2]);
          g.beginPath();
          g.arc(ps.x, ps.y, geo.r + 4.5, 0, TAU);
          g.stroke();
          g.restore();
          rich('★', ps.x, ps.y - geo.r - 10, 11, c2, 'center', 800);
        } else {
          const b = geo.box!(s);
          g.save();
          g.strokeStyle = c2;
          g.lineWidth = 2;
          g.setLineDash([4, 3]);
          roundRect(g, b.x - 2, b.y - 2, b.w + 4, b.h + 4, 12);
          g.stroke();
          g.restore();
          rich(`★ ${tt('ich', 'me')}`, b.x + b.w / 2, b.y + 12, 10.5, c2, 'center', 800);
        }
      }
    }

    /* ---------- Ansicht 1: eine Klasse ---------- */
    function arrive(i: number, now: number, n: number): number {
      if (reduced() || clsT0 < 0) return 1;
      const per = Math.min(60, 1400 / Math.max(1, n));
      return clamp01((now - clsT0 - i * per) / 380);
    }
    const arriveEnd = (n: number) => Math.min(60, 1400 / Math.max(1, n)) * n + 380;
    const allArrived = (now: number) => reduced() || clsT0 < 0 || now - clsT0 > arriveEnd(cls.length);

    function drawClass(R: Rect, alpha: number, now: number): void {
      const g = surface.g;
      const c = C();
      const small = R.w < 440;
      g.save();
      g.globalAlpha *= alpha;
      const title = days() === 365 ? tt('Geburtstage der Klasse', 'Birthdays in the class') : days() === 12 ? tt('Geburtsmonate der Klasse', 'Birth months in the class') : tt('Geburts-Wochentage der Klasse', 'Weekdays of birth in the class');
      rich(title, R.x + 14, R.y + 20, small ? 13 : 14, th().text, 'left', 800);
      const dups = duplicates(cls);
      const done = allArrived(now);
      const pulse = reduced() ? 0 : (Math.sin(now / 260) + 1) / 2;
      const items = cls.map((s, i) => {
        const isDup = (dups.get(s) ?? 0) >= 2 && (q() === 'any' || s === mySlot());
        const isMine = s === mySlot() && showMine();
        return { s, a: arrive(i, now, cls.length), col: isDup && done ? c.hit : isMine && done ? c.mine : c.any };
      });
      drawSlots(R, days() === 365 ? 44 : 34, 42, items, { dupGlow: done ? (q() === 'any' ? dups : new Map([...dups].filter(([s]) => s === mySlot()))) : undefined, pulse });
      // Ergebnis-Schild unten
      if (done) {
        const hit = hitOf(cls);
        const msg =
          q() === 'mine'
            ? hit
              ? tt(`Jemand hat an meinem ${unitWord(false)} Geburtstag!`, `Someone shares my ${unitWord(false)}!`)
              : tt(`Niemand an meinem ${unitWord(false)}`, `Nobody on my ${unitWord(false)}`)
            : hit
              ? tt(`${dups.size} gemeinsame${dups.size === 1 ? 'r' : ''} ${unitWord(dups.size !== 1)}!`, `${dups.size} shared ${unitWord(dups.size !== 1)}!`)
              : tt('Alle verschieden', 'All different');
        const pop = reduced() || clsT0 < 0 ? 1 : ease.outBack(clamp01((now - clsT0 - arriveEnd(cls.length)) / 400));
        g.save();
        const w = measure(msg, 12, 800).w + 20;
        g.translate(R.x + 14 + w / 2, R.y + R.h - 20);
        g.scale(pop, pop);
        g.fillStyle = hit ? c.hit : c.ok;
        roundRect(g, -w / 2, -12, w, 24, 12);
        g.fill();
        rich(msg, 0, 0.5, 12, '#ffffff', 'center', 800);
        g.restore();
      }
      // Personen und Paare bzw. Schubfachprinzip
      if (cls.length > days()) {
        pill(R.x + R.w - 14, R.y + R.h - 20, tt(`${cls.length} > ${days()}: sicher gleich`, `${cls.length} > ${days()}: surely shared`), c.hit, { align: 'right', size: small ? 10.5 : 11.5 });
      } else if (!small || days() !== 365) {
        const info = tt(`${cls.length} Personen · ${fmt.num(pairs(cls.length), 0)} Paare`, `${cls.length} people · ${fmt.num(pairs(cls.length), 0)} pairs`);
        rich(info, R.x + R.w - 14, R.y + R.h - 20, 11, th().muted, 'right', 650);
      }
      // Hover-Hinweis
      if (hoverSlot !== null && hoverSlot < days()) {
        const cnt = cls.filter((s) => s === hoverSlot).length;
        const geo = slotGeo(R, days() === 365 ? 44 : 34, 42);
        const ps = geo.pos(hoverSlot);
        const label = `${slotName(hoverSlot)}: ${cnt} ${cnt === 1 ? tt('Person', 'person') : tt('Personen', 'people')}`;
        pill(ps.x, Math.max(R.y + 40, ps.y - (days() === 365 ? 22 : 0)), label, th().text, { clampTo: R, size: 11 });
      }
      g.restore();
    }

    /* ---------- Ansicht 2: viele Klassen ---------- */
    function drawSim(R: Rect, alpha: number, now: number): void {
      const g = surface.g;
      const c = C();
      const small = R.w < 440;
      g.save();
      g.globalAlpha *= alpha;
      rich(tt('Simulation: viele Klassen', 'Simulation: many classes'), R.x + 14, R.y + 20, small ? 13 : 14, th().text, 'left', 800);
      const s = statNow();
      const runs = s?.runs ?? 0;
      const hits = s?.hits ?? 0;
      // Kopfzeile mit Zählern (zählen weich mit)
      const hTxt = runs ? fmt.num(hS * 100, 1) : '–';
      const line = q() === 'mine' ? tt(`${hits} von ${runs} Klassen: jemand an meinem ${unitWord(false)}`, `${hits} of ${runs} classes: someone on my ${unitWord(false)}`) : tt(`${hits} von ${runs} Klassen mit gemeinsamem ${unitWord(false)}`, `${hits} of ${runs} classes with a shared ${unitWord(false)}`);
      const fs = fitSize(line, R.w - 28, small ? 11.5 : 12.5, 700);
      rich(line, R.x + 14, R.y + 44, fs, th().text, 'left', 700);
      // Kacheln
      const top = R.y + 62;
      const bottom = R.y + R.h - (small ? 78 : 92);
      const gw = R.w - 28;
      const gh = bottom - top;
      const tiles = s?.tiles ?? [];
      const cols = Math.max(10, Math.min(25, Math.round(Math.sqrt((TILE_MAX * gw) / Math.max(1, gh)))));
      const rowsN = Math.ceil(TILE_MAX / cols);
      const cell = Math.min(gw / cols, gh / rowsN);
      const ox = R.x + 14 + (gw - cols * cell) / 2;
      const oy = top + (gh - rowsN * cell) / 2;
      const off = Math.max(0, runs - tiles.length);
      for (let i = 0; i < TILE_MAX; i++) {
        const x = ox + (i % cols) * cell;
        const y = oy + Math.floor(i / cols) * cell;
        const t = tiles[i];
        if (t === undefined) {
          g.strokeStyle = mixColor(th().text, th().bg, 0.88);
          g.lineWidth = 1;
          roundRect(g, x + 1.5, y + 1.5, cell - 3, cell - 3, Math.min(4, cell / 4));
          g.stroke();
          continue;
        }
        // neue Kacheln springen herein
        const age = i === tiles.length - 1 && !reduced() ? clamp01((now - burst) / 260) : 1;
        const sc = i === tiles.length - 1 ? ease.outBack(age) : 1;
        const col = t ? c.hit : c.ok;
        const sz = (cell - 3) * sc;
        g.fillStyle = mixColor(col, th().bg, t ? 0.05 : 0.25);
        roundRect(g, x + cell / 2 - sz / 2, y + cell / 2 - sz / 2, sz, sz, Math.min(4, cell / 4));
        g.fill();
      }
      if (!runs) rich(tt('Starte mit „100 Klassen“ oder „1000 Klassen“.', 'Start with “100 classes” or “1000 classes”.'), R.x + R.w / 2, (top + bottom) / 2, small ? 11 : 12, th().muted, 'center', 650);
      if (off > 0) rich(tt(`(die letzten ${tiles.length} von ${runs} Klassen)`, `(the last ${tiles.length} of ${runs} classes)`), R.x + R.w - 14, R.y + 20, 10.5, th().muted, 'right', 600);
      // Vergleichsbalken: Häufigkeit und Wahrscheinlichkeit
      const by = R.y + R.h - (small ? 62 : 72);
      const bx = R.x + 14 + (small ? 92 : 112);
      const bw = R.w - 28 - (small ? 92 : 112) - (small ? 56 : 64);
      const rows: [string, number, string, string][] = [
        [tt('Häufigkeit h', 'frequency h'), runs ? hS : 0, c.hit, runs ? `${hTxt} %` : '–'],
        [tt('Wahrsch. P', 'probability P'), p.curve ? pS : 0, c.any, shownPct(pOf(p.n))],
      ];
      rows.forEach(([lab, v, col, val], i) => {
        const y = by + i * (small ? 24 : 28);
        rich(lab, R.x + 14, y, small ? 10.5 : 11.5, th().muted, 'left', 700);
        g.fillStyle = mixColor(th().text, th().bg, 0, th().dark ? 0.12 : 0.07);
        roundRect(g, bx, y - 6, bw, 12, 6);
        g.fill();
        if (v > 0) {
          g.fillStyle = col;
          roundRect(g, bx, y - 6, Math.max(6, bw * v), 12, 6);
          g.fill();
        }
        rich(val, R.x + R.w - 14, y, small ? 11 : 12, col, 'right', 800);
      });
      // Fortschritt
      if (runner) {
        const u = runner.target ? runner.done / runner.target : 1;
        g.fillStyle = mixColor(c.hit, th().bg, 0, 0.2);
        roundRect(g, R.x + 14, R.y + 52, R.w - 28, 3, 1.5);
        g.fill();
        g.fillStyle = c.hit;
        roundRect(g, R.x + 14, R.y + 52, Math.max(3, (R.w - 28) * u), 3, 1.5);
        g.fill();
      }
      g.restore();
    }

    /* ---------- Ansicht 3: Rechnung mit Gegenereignis ---------- */
    function drawCalc(R: Rect, alpha: number, now: number): void {
      const g = surface.g;
      const c = C();
      const small = R.w < 440;
      const d = days();
      const n = Math.min(p.n, d);
      const k = calcK(now);
      const kInt = Math.floor(k + 1e-9);
      g.save();
      g.globalAlpha *= alpha;
      rich(tt('Personen kommen einzeln', 'People arrive one by one'), R.x + 14, R.y + 20, small ? 13 : 14, th().text, 'left', 800);
      // Schrittanzeige oben
      const cur = Math.min(n, Math.max(1, Math.ceil(k)));
      const free = d - (cur - 1);
      const fsz = small ? 12 : 13.5;
      if (p.n > d && k >= d - 1e-9) {
        pill(R.x + 14, R.y + 50, tt(`Person ${d + 1} findet keinen freien ${unitWord(false)}!`, `Person ${d + 1} finds no free ${unitWord(false)}!`), c.hit, { align: 'left', size: small ? 11 : 12, fill: true });
      } else {
        const stepSrc = tt(`Person ${cur} muss einen freien ${unitWord(false)} treffen:  \\f{${free}}{${d}}`, `Person ${cur} must hit a free ${unitWord(false)}:  \\f{${free}}{${d}}`);
        rich(stepSrc, R.x + 14, R.y + 50, fitSize(stepSrc, R.w - 28, fsz, 700), th().text, 'left', 700);
      }
      const items = calcOrder.slice(0, n).map((s, i) => {
        const a = reduced() ? 1 : clamp01((k - i) * 1.6);
        return { s, a, col: i === kInt && k < n ? c.mine : c.any };
      });
      drawSlots(R, d === 365 ? 82 : 70, small ? 64 : 70, items, {});
      // freie Fächer und Produkt unten
      const prod = allDifferentSeries(kInt, d)[kInt] ?? 1;
      const freeNow = d - Math.min(kInt, d);
      const y1 = R.y + R.h - (small ? 42 : 46);
      const y2 = R.y + R.h - (small ? 18 : 20);
      rich(tt(`freie ${unitWord(true)}: ${freeNow} von ${d}`, `free ${unitWord(true)}: ${freeNow} of ${d}`), R.x + 14, y1, small ? 11 : 12, th().muted, 'left', 700);
      const ptxt = p.curve ? fmt.fixed(prod, 4) : '?';
      const src = tt(`P(alle ${kInt} verschieden) = ${ptxt}`, `P(all ${kInt} different) = ${ptxt}`);
      rich(src, R.x + 14, y2, fitSize(src, R.w - 28, small ? 12.5 : 14, 800), c.any, 'left', 800);
      // Fortschrittsbalken der freien Tage
      const bx = R.x + R.w * 0.52;
      const bw = R.x + R.w - 14 - bx;
      g.fillStyle = mixColor(th().text, th().bg, 0, th().dark ? 0.12 : 0.07);
      roundRect(g, bx, y1 - 5, bw, 10, 5);
      g.fill();
      g.fillStyle = c.ok;
      roundRect(g, bx, y1 - 5, Math.max(5, (bw * (d - Math.min(k, d))) / d), 10, 5);
      g.fill();
      g.restore();
    }

    /* ---------- Ansicht 4: Paare ---------- */
    interface PairGeo {
      cx: number;
      cy: number;
      rad: number;
      pos: (i: number) => { x: number; y: number };
      dot: number;
    }
    function pairGeo(R: Rect): PairGeo {
      const cx = R.x + R.w / 2;
      const cy = R.y + R.h / 2 + 6;
      const rad = Math.max(30, Math.min(R.w / 2 - 34, R.h / 2 - 48));
      const n = p.n;
      const pos = (i: number) => {
        const a = -Math.PI / 2 + (i / n) * TAU;
        return { x: cx + rad * Math.cos(a), y: cy + rad * Math.sin(a) };
      };
      return { cx, cy, rad, pos, dot: Math.max(3, Math.min(10, (TAU * rad) / n / 3)) };
    }
    function drawPairs(R: Rect, alpha: number, now: number): void {
      const g = surface.g;
      const c = C();
      const small = R.w < 440;
      const n = p.n;
      const G = pairGeo(R);
      const mine = q() === 'mine';
      g.save();
      g.globalAlpha *= alpha;
      rich(mine ? tt(`Ich und ${n} andere: ${n} Paare`, `Me and ${n} others: ${n} pairs`) : tt(`${n} Personen: ${fmt.num(pairs(n), 0)} Paare`, `${n} people: ${fmt.num(pairs(n), 0)} pairs`), R.x + 14, R.y + 20, small ? 13 : 14, th().text, 'left', 800);
      const grow = reduced() || intro === null ? 1 : clamp01((now - (intro ?? 0) - 300) / 1200);
      const dups = duplicates(cls);
      const same = (i: number, j: number) => cls[i] !== undefined && cls[i] === cls[j];
      const lineCol = mixColor(c.any, th().bg, th().dark ? 0.35 : 0.3);
      if (mine) {
        // nur die Speichen zu mir
        for (let i = 0; i < n; i++) {
          const ps = G.pos(i);
          const hit = cls[i] === mySlot();
          g.strokeStyle = hit ? c.hit : mixColor(c.mine, th().bg, 0.35);
          g.lineWidth = hit ? 3 : 1.3;
          g.globalAlpha = alpha * (hit ? 1 : 0.75) * grow;
          g.beginPath();
          g.moveTo(G.cx, G.cy);
          g.lineTo(ps.x, ps.y);
          g.stroke();
        }
        g.globalAlpha = alpha;
        ball(G.cx, G.cy, Math.max(10, G.dot * 1.7), c.mine);
        rich(tt('ich', 'me'), G.cx, G.cy + Math.max(10, G.dot * 1.7) + 10, 11, c.mine, 'center', 800);
      } else {
        const total = pairs(n);
        const base = clamp(1.6 - total / 900, 0.12, 0.6);
        g.lineWidth = 1;
        for (let i = 0; i < n; i++) {
          for (let j = i + 1; j < n; j++) {
            const focus = pairFocus === i || pairFocus === j;
            if (same(i, j)) continue;
            const a = pairFocus === null ? base : focus ? 0.9 : base * 0.35;
            g.globalAlpha = alpha * a * grow;
            g.strokeStyle = focus ? c.any : lineCol;
            g.lineWidth = focus ? 1.6 : 1;
            const pi = G.pos(i);
            const pj = G.pos(j);
            g.beginPath();
            g.moveTo(pi.x, pi.y);
            g.lineTo(pi.x + (pj.x - pi.x) * grow, pi.y + (pj.y - pi.y) * grow);
            g.stroke();
          }
        }
        // Paare mit gleichem Tag rot und dick
        g.globalAlpha = alpha;
        for (let i = 0; i < n; i++)
          for (let j = i + 1; j < n; j++) {
            if (!same(i, j)) continue;
            const pi = G.pos(i);
            const pj = G.pos(j);
            g.strokeStyle = c.hit;
            g.lineWidth = 3.2;
            g.beginPath();
            g.moveTo(pi.x, pi.y);
            g.lineTo(pj.x, pj.y);
            g.stroke();
          }
      }
      g.globalAlpha = alpha;
      for (let i = 0; i < n; i++) {
        const ps = G.pos(i);
        const isDup = mine ? cls[i] === mySlot() : (dups.get(cls[i] ?? -1) ?? 0) >= 2;
        ball(ps.x, ps.y, G.dot * (pairFocus === i ? 1.35 : 1), isDup ? c.hit : c.any);
        if (G.dot >= 7 && n <= 30) rich(String(i + 1), ps.x + (ps.x - G.cx) * (G.dot + 8) / G.rad, ps.y + (ps.y - G.cy) * (G.dot + 8) / G.rad, 9.5, th().muted, 'center', 700);
      }
      // Fußzeile
      const sp = mine ? cls.filter((s) => s === mySlot()).length : sharedPairs(cls);
      const foot = mine
        ? tt(`Treffer in dieser Klasse: ${sp}`, `matches in this class: ${sp}`)
        : tt(`Paare mit gleichem ${unitWord(false)} in dieser Klasse: ${sp}`, `pairs with the same ${unitWord(false)} in this class: ${sp}`);
      rich(foot, R.x + 14, R.y + R.h - 18, fitSize(foot, R.w - 28, small ? 11 : 12, 700), sp > 0 ? c.hit : th().muted, 'left', 700);
      if (pairFocus !== null && !mine) {
        const ps = G.pos(pairFocus);
        pill(ps.x, ps.y - G.dot - 18, tt(`Person ${pairFocus + 1}: ${n - 1} Paare`, `person ${pairFocus + 1}: ${n - 1} pairs`), c.any, { clampTo: R, size: 11 });
      } else if (!small && !mine) rich(tt('Person antippen', 'tap a person'), R.x + R.w - 14, R.y + 20, 10.5, th().muted, 'right', 600);
      g.restore();
    }

    /* ---------- Diagramm ---------- */
    function chartInner(R: Rect): Rect {
      const left = 46;
      const top = 54;
      return { x: R.x + left, y: R.y + top, w: R.w - left - 18, h: R.h - top - 30 };
    }
    function drawChart(R: Rect, alpha: number, now: number, grow: number): void {
      const g = surface.g;
      const c = C();
      const A = chartInner(R);
      const md = mode();
      g.save();
      g.globalAlpha *= alpha;
      cardFrame(R, 1);
      if (A.w < 60 || A.h < 40) {
        g.restore();
        return;
      }
      const size = baseSize();
      const isSim = md === 'sim';
      const s = statNow();
      // x-Bereich
      const xMax = isSim ? Math.max(100, niceUp(s?.runs ?? 0)) : xMaxS;
      const X = (x: number) => A.x + (x / xMax) * A.w;
      const Y = (v: number) => A.y + A.h - v * A.h;
      // Titel
      const title = isSim
        ? tt('Relative Häufigkeit nach N Klassen', 'Relative frequency after N classes')
        : md === 'calc'
          ? tt('Nach k Personen: alle verschieden / mind. zwei gleich', 'After k people: all different / at least two equal')
          : q() === 'mine'
            ? tt(`P(jemand an meinem ${unitWord(false)})`, `P(someone on my ${unitWord(false)})`)
            : tt(`P(mindestens zwei am selben ${unitWord(false)})`, `P(at least two on the same ${unitWord(false)})`);
      rich(title, R.x + 14, R.y + 20, fitSize(title, R.w - 28, size + 0.5, 800), th().text, 'left', 800);
      if (!isSim) {
        const src = `n = ${p.n}:  `;
        const w0 = rich(src, R.x + 14, R.y + 40, size, th().muted, 'left', 700);
        const big = md === 'calc' ? `${tt('mind. zwei gleich', 'at least two equal')} ${shownPct(pAny(p.n))}` : shownPct(pS, 1);
        rich(p.curve ? (md === 'calc' ? big : pct(pS, 1)) : '?', R.x + 14 + w0, R.y + 40, size + 3, md === 'calc' ? c.hit : q() === 'mine' ? c.mine : c.any, 'left', 800);
        const sAny = statNow();
        if (md === 'class' && sAny && sAny.runs) {
          const simTxt = tt(`Sim.: ${sAny.hits}/${sAny.runs}`, `sim.: ${sAny.hits}/${sAny.runs}`);
          rich(simTxt, R.x + R.w - 16, R.y + 40, size - 1, th().muted, 'right', 700);
        }
      } else {
        const runs = s?.runs ?? 0;
        rich(`N = ${fmt.num(runs, 0)}`, R.x + 14, R.y + 40, size, th().muted, 'left', 700);
      }
      // Gitter
      g.lineWidth = 1;
      for (const v of [0, 0.25, 0.5, 0.75, 1]) {
        g.strokeStyle = v === 0 ? th().axis : th().grid;
        g.beginPath();
        g.moveTo(A.x, Math.round(Y(v)) + 0.5);
        g.lineTo(A.x + A.w, Math.round(Y(v)) + 0.5);
        g.stroke();
        rich(`${fmt.num(v * 100, 0)} %`, A.x - 6, Y(v), size - 2, th().muted, 'right', 600);
      }
      // x-Teilung
      const step = niceStep(xMax / (A.w > 300 ? 7 : 4));
      for (let x = 0; x <= xMax + 1e-9; x += step) {
        g.strokeStyle = th().grid;
        g.beginPath();
        g.moveTo(Math.round(X(x)) + 0.5, A.y + A.h);
        g.lineTo(Math.round(X(x)) + 0.5, A.y + A.h + 4);
        g.stroke();
        if (X(x) < A.x + A.w - 18) rich(fmt.num(x, 0), X(x), A.y + A.h + 14, size - 2, th().muted, 'center', 600);
      }
      rich(isSim ? 'N' : md === 'calc' ? 'k' : 'n', A.x + A.w + 8, A.y + A.h + 14, size - 1, th().muted, 'center', 700);
      // 50-%-Linie
      g.save();
      g.setLineDash([5, 5]);
      g.strokeStyle = th().muted;
      g.beginPath();
      g.moveTo(A.x, Y(0.5) + 0.5);
      g.lineTo(A.x + A.w, Y(0.5) + 0.5);
      g.stroke();
      g.restore();
      g.save();
      g.beginPath();
      g.rect(A.x - 2, A.y - 14, A.w + 4, A.h + 16);
      g.clip();
      if (isSim) drawSimChart(A, X, Y, now);
      else if (md === 'calc') drawCalcChart(A, X, Y, now);
      else drawCurves(A, X, Y, grow);
      g.restore();
      if (!isSim) drawNMarker(R, A, X, Y);
      g.restore();
    }

    const niceStep = (raw: number) => {
      const e = 10 ** Math.floor(Math.log10(Math.max(1e-9, raw)));
      const f = raw / e;
      return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * e;
    };
    function niceUp(v: number): number {
      if (v <= 100) return 100;
      const e = 10 ** Math.floor(Math.log10(v));
      for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * e >= v) return m * e;
      return 10 * e;
    }

    function polyline(pts: [number, number][], col: string, width: number, dash?: number[]): void {
      const g = surface.g;
      g.save();
      g.strokeStyle = col;
      g.lineWidth = width;
      g.lineJoin = 'round';
      g.lineCap = 'round';
      if (dash) g.setLineDash(dash);
      g.beginPath();
      pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
      g.restore();
    }

    function drawCurves(A: Rect, X: (x: number) => number, Y: (v: number) => number, grow: number): void {
      const g = surface.g;
      const c = C();
      const xm = Math.min(N_MAX, Math.ceil(xMaxS));
      const upto = 1 + (xm - 1) * grow;
      const ptsOf = (arr: number[]) => {
        const out: [number, number][] = [];
        for (let n = 1; n <= xm && n <= upto + 1e-9; n++) out.push([X(n), Y(arr[n]!)]);
        return out;
      };
      const showAny = q() === 'any' || p.both;
      if (!p.curve) {
        rich(tt('Kurve ausgeblendet', 'curve hidden'), A.x + A.w / 2, A.y + A.h * 0.3, baseSize() - 1, th().muted, 'center', 650);
        return;
      }
      if (mode() === 'pairs' && showAny) polyline(ptsOf(curveApprox), c.approx, 2, [6, 4]);
      if (showAny) polyline(ptsOf(curveAny), c.any, q() === 'any' ? 3 : 2);
      if (showMine()) polyline(ptsOf(curveMine), c.mine, q() === 'mine' ? 3 : 2, q() === 'mine' ? undefined : [6, 4]);
      // Punkte bei wenigen n
      const unit = A.w / xMaxS;
      if (unit >= 14) {
        for (let n = 1; n <= xm; n++) {
          if (showAny) {
            g.fillStyle = c.any;
            g.beginPath();
            g.arc(X(n), Y(curveAny[n]!), 3, 0, TAU);
            g.fill();
          }
        }
      }
      // Schubfachprinzip: ab d + 1 sicher
      if (days() < 365 && days() + 1 <= xMaxS) {
        const x = X(days() + 1);
        g.save();
        g.strokeStyle = c.hit;
        g.setLineDash([3, 3]);
        g.beginPath();
        g.moveTo(x, A.y);
        g.lineTo(x, A.y + A.h);
        g.stroke();
        g.restore();
        rich(`n = ${days() + 1}: 100 %`, x - 6, A.y + A.h * 0.42, baseSize() - 2, c.hit, 'right', 750);
      }
      // n mit 50 %
      const f = q() === 'mine' ? pMy : pAny;
      const n50 = smallestN(0.5, f, 2000);
      if (n50 <= xMaxS) {
        const x = X(n50);
        g.save();
        g.strokeStyle = mixColor(q() === 'mine' ? c.mine : c.any, th().bg, 0.3);
        g.setLineDash([3, 4]);
        g.beginPath();
        g.moveTo(x, Y(0.5));
        g.lineTo(x, A.y + A.h);
        g.stroke();
        g.restore();
        const leftSide = p.n >= n50 && p.n - n50 < 6;
        rich(`n = ${n50}`, leftSide ? x - 5 : x + 5, Y(0.5) + 12, baseSize() - 2, q() === 'mine' ? c.mine : c.any, leftSide ? 'right' : 'left', 800);
      } else if (q() === 'mine' && days() === 365) {
        rich(tt(`über 50 % erst ab n = ${n50}`, `above 50 % only from n = ${n50}`), A.x + A.w - 4, Y(0.5) - 10, baseSize() - 2, c.mine, 'right', 750);
      }
      if (mode() === 'pairs' && showAny) {
        rich(tt('Näherung über Paare', 'approximation via pairs'), A.x + A.w - 4, Y(0.12), baseSize() - 2, c.approx, 'right', 700);
      }
      // Simulationspunkt (nur bei „eine Klasse“)
      const s = statNow();
      if (mode() === 'class' && s && s.runs) {
        g.strokeStyle = th().text;
        g.lineWidth = 2;
        g.beginPath();
        g.arc(X(p.n), Y(hS), 5.5, 0, TAU);
        g.stroke();
      }
    }

    function drawNMarker(R: Rect, A: Rect, X: (x: number) => number, Y: (v: number) => number): void {
      const g = surface.g;
      const c = C();
      const md = mode();
      const col = md === 'calc' ? c.hit : q() === 'mine' ? c.mine : c.any;
      const x = X(Math.min(nS, xMaxS));
      const v = md === 'calc' ? pAny(p.n) : pS;
      const y = p.curve ? Y(v) : A.y + A.h;
      g.save();
      g.strokeStyle = col;
      g.lineWidth = 1.5;
      g.setLineDash([4, 3]);
      g.beginPath();
      g.moveTo(x, A.y + A.h);
      g.lineTo(x, Math.max(A.y, y));
      g.stroke();
      g.restore();
      // Griff unter der Achse
      const lab = `n = ${p.n}`;
      const w = measure(lab, baseSize() - 0.5, 800).w + 18;
      const hh = baseSize() + 9;
      const bx = clamp(x - w / 2, R.x + 6, R.x + R.w - w - 6);
      const by = A.y + A.h + 4;
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.22)';
      g.shadowBlur = dragN ? 12 : 6;
      g.fillStyle = col;
      roundRect(g, bx, by, w, hh, hh / 2);
      g.fill();
      g.restore();
      rich(lab, bx + w / 2, by + hh / 2 + 0.5, baseSize() - 0.5, '#ffffff', 'center', 800);
      if (p.curve && md !== 'calc') {
        g.fillStyle = col;
        g.beginPath();
        g.arc(x, y, 5.5, 0, TAU);
        g.fill();
        g.strokeStyle = th().bg;
        g.lineWidth = 2;
        g.stroke();
      }
    }

    function drawSimChart(A: Rect, X: (x: number) => number, Y: (v: number) => number, now: number): void {
      const g = surface.g;
      const c = C();
      const s = statNow();
      const P = pOf(p.n);
      const runs = s?.runs ?? 0;
      const xMax = Math.max(100, niceUp(runs));
      // 95-%-Trichter
      if (p.curve) {
        g.save();
        g.fillStyle = mixColor(c.band, th().bg, 0, th().dark ? 0.22 : 0.14);
        g.beginPath();
        const steps = 120;
        for (let i = 0; i <= steps; i++) {
          const N = Math.max(1, (xMax * i) / steps);
          const [, hi] = band95(P, N);
          if (i === 0) g.moveTo(X(N), Y(hi));
          else g.lineTo(X(N), Y(hi));
        }
        for (let i = steps; i >= 0; i--) {
          const N = Math.max(1, (xMax * i) / steps);
          const [lo] = band95(P, N);
          g.lineTo(X(N), Y(lo));
        }
        g.closePath();
        g.fill();
        g.restore();
        polyline(
          [
            [X(0), Y(P)],
            [X(xMax), Y(P)],
          ],
          c.any,
          2,
        );
        rich(`P = ${pct(P, 1)}`, A.x + A.w - 4, Y(P) - (P > 0.85 ? -12 : 11), baseSize() - 1.5, c.any, 'right', 800);
        rich(tt('95-%-Bereich', '95 % range'), A.x + A.w - 4, Y(clamp(P - 0.2, 0.06, 0.9)), baseSize() - 2.5, c.band, 'right', 700);
      }
      // Häufigkeitskurve
      if (s && s.hist.length) {
        const pts: [number, number][] = [];
        const len = s.hist.length;
        const stride = Math.max(1, Math.floor(len / 600));
        for (let i = 0; i < len; i += stride) pts.push([X(i + 1), Y(s.hist[i]! / (i + 1))]);
        pts.push([X(len), Y(s.hist[len - 1]! / len)]);
        polyline(pts, c.hit, 2.2);
        g.fillStyle = c.hit;
        g.beginPath();
        g.arc(X(len), Y(hS), 5, 0, TAU);
        g.fill();
      } else {
        rich(tt('noch keine Klassen', 'no classes yet'), A.x + A.w / 2, A.y + A.h * 0.25, baseSize() - 1, th().muted, 'center', 650);
      }
      void now;
    }

    function drawCalcChart(A: Rect, X: (x: number) => number, _Y: (v: number) => number, now: number): void {
      const g = surface.g;
      const c = C();
      const d = days();
      const n = p.n;
      const k = calcK(now);
      const series = allDifferentSeries(Math.min(n, xMaxS), d);
      const unit = A.w / xMaxS;
      const bw = Math.max(1.5, unit * 0.72);
      for (let i = 1; i <= Math.min(n, Math.floor(xMaxS)); i++) {
        const show = i <= d ? clamp01(k - (i - 1)) : clamp01(k - (d - 1));
        if (show <= 0) continue;
        const v = series[i] ?? 0;
        const x = X(i) - bw / 2;
        const top = A.y + A.h - A.h * show;
        // unten: alle verschieden (blau), oben: mindestens zwei gleich (rot)
        const hb = A.h * v * show;
        g.fillStyle = mixColor(c.hit, th().bg, i === Math.ceil(k) ? 0 : 0.35);
        g.fillRect(x, top, bw, A.h * show - hb);
        g.fillStyle = mixColor(c.any, th().bg, i === Math.ceil(k) ? 0 : 0.3);
        g.fillRect(x, A.y + A.h - hb, bw, hb);
      }
      // Legende (mit Hintergrund, oben rechts)
      const lw = Math.max(measure(tt('alle verschieden', 'all different'), baseSize() - 2, 700).w, measure(tt('mind. zwei gleich', 'at least two equal'), baseSize() - 2, 700).w) + 30;
      const lx = A.x + A.w - lw;
      const ly = A.y + 10;
      g.fillStyle = pillBg();
      roundRect(g, lx - 6, ly - 10, lw + 4, 38, 8);
      g.fill();
      g.fillStyle = c.any;
      g.fillRect(lx, ly - 5, 10, 10);
      rich(tt('alle verschieden', 'all different'), lx + 15, ly, baseSize() - 2, th().text, 'left', 700);
      g.fillStyle = c.hit;
      g.fillRect(lx, ly + 11, 10, 10);
      rich(tt('mind. zwei gleich', 'at least two equal'), lx + 15, ly + 16, baseSize() - 2, th().text, 'left', 700);
    }

    /* ---------- Rechenkarte ---------- */
    function drawInfo(R: Rect, alpha: number, now: number): void {
      const g = surface.g;
      const c = C();
      g.save();
      g.globalAlpha *= alpha;
      cardFrame(R, 1);
      const pad = 14;
      const d = days();
      const n = p.n;
      const show = p.curve;
      const fade = reduced() ? 1 : clamp01((now - cardT0) / 450);
      const rows: { src: string; col: string; w?: number }[] = [];
      const md = mode();
      const prodSrc = (nn: number) => {
        if (nn > d) return `\\f{${d}}{${d}} · … · \\f{1}{${d}} · \\f{0}{${d}}`;
        if (nn <= 4) return Array.from({ length: nn }, (_, i) => `\\f{${d - i}}{${d}}`).join(' · ');
        return `\\f{${d}}{${d}} · \\f{${d - 1}}{${d}} · … · \\f{${d - nn + 1}}{${d}}`;
      };
      if (md === 'sim') {
        const s = statNow();
        const P = pOf(n);
        rows.push({ src: tt('relative Häufigkeit h = \\f{Treffer}{Klassen}', 'relative frequency h = \\f{hits}{classes}'), col: th().text });
        rows.push({ src: s && s.runs ? `h = \\f{${s.hits}}{${s.runs}} ≈ ${fmt.fixed(s.hits / s.runs, 3)}` : tt('h: noch keine Klasse', 'h: no class yet'), col: c.hit });
        rows.push({ src: `P = ${show ? fmt.fixed(P, 3) : '?'}`, col: c.any });
        if (s && s.runs && show) {
          const [lo, hi] = band95(P, s.runs);
          rows.push({ src: tt(`95-%-Bereich bei N = ${s.runs}: ${fmt.fixed(lo, 3)} bis ${fmt.fixed(hi, 3)}`, `95 % range for N = ${s.runs}: ${fmt.fixed(lo, 3)} to ${fmt.fixed(hi, 3)}`), col: th().muted });
        } else rows.push({ src: tt('Je mehr Klassen, desto näher liegt h an P.', 'The more classes, the closer h is to P.'), col: th().muted });
      } else if (md === 'pairs') {
        if (q() === 'mine') {
          rows.push({ src: tt(`Paare mit mir: n = ${n}`, `pairs with me: n = ${n}`), col: th().text });
          rows.push({ src: tt(`pro Paar: P(gleich) = \\f{1}{${d}}`, `per pair: P(same) = \\f{1}{${d}}`), col: th().text });
          rows.push({ src: `P = 1 − (\\f{${d - 1}}{${d}})^{${n}} = ${show ? pct(pMy(n), 2) : '?'}`, col: c.mine });
          rows.push({ src: tt(`zum Vergleich: ${fmt.num(pairs(n + 1), 0)} Paare in der ganzen Gruppe`, `compare: ${fmt.num(pairs(n + 1), 0)} pairs in the whole group`), col: th().muted });
        } else {
          rows.push({ src: tt(`Paare: \\f{n · (n − 1)}{2} = \\f{${n} · ${n - 1}}{2} = ${fmt.num(pairs(n), 0)}`, `pairs: \\f{n · (n − 1)}{2} = \\f{${n} · ${n - 1}}{2} = ${fmt.num(pairs(n), 0)}`), col: th().text });
          rows.push({ src: tt(`pro Paar: P(gleich) = \\f{1}{${d}}`, `per pair: P(same) = \\f{1}{${d}}`), col: th().text });
          rows.push({ src: tt(`Näherung: 1 − (\\f{${d - 1}}{${d}})^{${fmt.num(pairs(n), 0)}} ≈ ${show ? pct(pApprox(n, d), 1) : '?'}`, `approx.: 1 − (\\f{${d - 1}}{${d}})^{${fmt.num(pairs(n), 0)}} ≈ ${show ? pct(pApprox(n, d), 1) : '?'}`), col: c.approx });
          rows.push({ src: tt(`exakt: ${show ? pct(pAny(n), 1) : '?'}`, `exact: ${show ? pct(pAny(n), 1) : '?'}`), col: c.any });
        }
      } else if (q() === 'mine' && md === 'class') {
        rows.push({ src: tt(`Niemand an meinem ${unitWord(false)}: (\\f{${d - 1}}{${d}})^{${n}}`, `Nobody on my ${unitWord(false)}: (\\f{${d - 1}}{${d}})^{${n}}`), col: th().text });
        rows.push({ src: `P = 1 − (\\f{${d - 1}}{${d}})^{${n}} ${show ? `≈ ${pct(pMy(n), 2)}` : '= ?'}`, col: c.mine });
        rows.push({ src: classLine(), col: th().muted });
      } else {
        rows.push({ src: tt(`P(alle verschieden) = ${prodSrc(n)}`, `P(all different) = ${prodSrc(n)}`), col: th().text });
        const pa = allDifferentSeries(Math.min(n, d + 1), d)[Math.min(n, d + 1)] ?? 0;
        rows.push({ src: `P(${tt('mind. zwei gleich', 'at least two equal')}) = 1 − ${show ? fmt.fixed(pa, 4) : '?'} ${show ? `= ${pct(1 - pa, 2)}` : ''}`, col: md === 'calc' ? c.hit : c.any });
        if (md === 'calc') {
          const fs = factors(Math.min(n, d), d);
          const kk = Math.min(Math.floor(calcK(now)), fs.length);
          rows.push({ src: tt(`Faktor für Person k: \\f{${d} − k + 1}{${d}}`, `factor for person k: \\f{${d} − k + 1}{${d}}`), col: th().muted });
          if (kk > 0 && kk < fs.length) rows.push({ src: tt(`bisher ${kk} Faktoren`, `${kk} factors so far`), col: th().muted });
        } else rows.push({ src: classLine(), col: th().muted });
      }
      const lh = clamp((R.h - 2 * pad) / rows.length, 18, 40);
      let y = R.y + pad + lh / 2;
      rows.forEach((row, i) => {
        const a = clamp01(fade * (rows.length + 1) - i);
        const s = fitSize(row.src, R.w - 2 * pad, Math.min(baseSize() + 0.5, lh * 0.5), 650, 9);
        g.save();
        g.globalAlpha *= 0.15 + 0.85 * ease.outCubic(a);
        rich(row.src, R.x + pad + (1 - ease.outCubic(a)) * 8, y, s, row.col, 'left', 650);
        g.restore();
        y += lh;
      });
      g.restore();
    }

    function classLine(): string {
      const dups = duplicates(cls);
      if (q() === 'mine') {
        const k = cls.filter((s) => s === mySlot()).length;
        return k ? tt(`Diese Klasse: ${k}× an meinem ${unitWord(false)} (${slotName(mySlot())})`, `This class: ${k}× on my ${unitWord(false)} (${slotName(mySlot())})`) : tt(`Diese Klasse: niemand an ${slotName(mySlot())}`, `This class: nobody on ${slotName(mySlot())}`);
      }
      if (!dups.size) return tt('Diese Klasse: alle verschieden', 'This class: all different');
      const list = [...dups.entries()].slice(0, 3).map(([s, k]) => `${slotName(s)} (${k}×)`);
      return tt(`Diese Klasse: ${list.join(', ')}${dups.size > 3 ? ' …' : ''}`, `This class: ${list.join(', ')}${dups.size > 3 ? ' …' : ''}`);
    }

    /* ---------- Ergebnisse (Text) ---------- */
    function updateReadouts(): void {
      const n = p.n;
      const d = days();
      if (q() === 'mine') ctx.readout('p', { html: `<var>P</var> = 1 − (<span class="frac"><span>${d - 1}</span><span>${d}</span></span>)<sup>${n}</sup> ≈ ${fmt.num(pMy(n) * 100, 2)} %` });
      else if (n > d) ctx.readout('p', { html: tt(`<var>n</var> = ${n} > ${d}: <var>P</var> = 1 (Schubfachprinzip)`, `<var>n</var> = ${n} > ${d}: <var>P</var> = 1 (pigeonhole principle)`) });
      else ctx.readout('p', { html: `<var>P</var> = 1 − <span class="frac"><span>${d} · ${d - 1} · … · ${d - n + 1}</span><span>${d}<sup>${n}</sup></span></span> ≈ ${fmt.num(pAny(n) * 100, 2)} %` });
      const s = statNow();
      ctx.readout('sim', s && s.runs ? tt(`${s.hits} von ${s.runs} Klassen = ${fmt.num((s.hits / s.runs) * 100, 1)} %`, `${s.hits} of ${s.runs} classes = ${fmt.num((s.hits / s.runs) * 100, 1)} %`) : tt('noch keine Klasse simuliert', 'no class simulated yet'));
      ctx.readout('class', classLine().replace(/^Diese Klasse: |^This class: /, ''));
    }
    function syncActions(): void {
      const busy = !!runner;
      ctx.setAction('one', { enabled: !ctx.locked && !busy });
      ctx.setAction('many', { enabled: !ctx.locked && !busy });
      ctx.setAction('k1000', { enabled: !ctx.locked && !busy });
      ctx.setAction('step', { enabled: !ctx.locked });
      ctx.setAction('clear', { enabled: !ctx.locked && !busy && !!statNow()?.runs });
    }

    /* ---------- Zeiger ---------- */
    const inRect = (r: Rect, px: number, py: number) => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
    function nAt(px: number): number {
      const A = chartInner(regions().chart);
      return clamp(Math.round(((px - A.x) / A.w) * xMaxS), 2, N_MAX);
    }
    function visHit(px: number, py: number): { kind: 'slot'; s: number } | { kind: 'person'; i: number } | null {
      const R = regions().vis;
      if (!inRect(R, px, py)) return null;
      const md = mode();
      if (md === 'class') {
        const s = slotGeo(R, days() === 365 ? 44 : 34, 42).hit(px, py);
        return s === null ? null : { kind: 'slot', s };
      }
      if (md === 'pairs' && q() === 'any') {
        const G = pairGeo(R);
        let best = -1;
        let bd = Math.max(14, G.dot + 6);
        for (let i = 0; i < p.n; i++) {
          const ps = G.pos(i);
          const dd = Math.hypot(px - ps.x, py - ps.y);
          if (dd < bd) {
            bd = dd;
            best = i;
          }
        }
        return best >= 0 ? { kind: 'person', i: best } : null;
      }
      return null;
    }
    surface.addTarget({
      contains: (px, py) => (mode() !== 'sim' && inRect(regions().chart, px, py)) || visHit(px, py) !== null,
      pointerDown: (pt) => {
        if (ctx.locked) return false;
        if (mode() !== 'sim' && inRect(regions().chart, pt.px, pt.py)) {
          dragN = true;
          surface.setCursor('ew-resize');
          const n = nAt(pt.px);
          if (n !== p.n) ctx.set({ n });
          ctx.requestRender();
          return true;
        }
        const h = visHit(pt.px, pt.py);
        if (!h) return false;
        if (h.kind === 'slot') {
          const d = days();
          const me = d === 365 ? h.s + 1 : d === 12 ? dayOfYear(h.s, 15) + 1 : h.s + 1;
          if (showMine()) ctx.set({ me });
          hoverSlot = h.s;
        } else pairFocus = pairFocus === h.i ? null : h.i;
        ctx.requestRender();
        return true;
      },
      pointerMove: (pt) => {
        if (!dragN) return;
        const n = nAt(pt.px);
        if (n !== p.n) ctx.set({ n });
      },
      pointerUp: () => {
        dragN = false;
        surface.setCursor('');
        ctx.requestRender();
      },
      hover: (pt) => {
        let hs: number | null = null;
        let cursor = '';
        if (pt && !ctx.locked) {
          if (mode() !== 'sim' && inRect(regions().chart, pt.px, pt.py)) cursor = 'ew-resize';
          const h = visHit(pt.px, pt.py);
          if (h?.kind === 'slot') {
            hs = h.s;
            if (showMine()) cursor = 'pointer';
          } else if (h?.kind === 'person') cursor = 'pointer';
        }
        surface.setCursor(cursor);
        if (hs !== hoverSlot) {
          hoverSlot = hs;
          ctx.requestRender();
        }
      },
      wheel: () => false,
    });

    /* ---------- Ablauf ---------- */
    function stepState(now: number, dt: number): boolean {
      let anim = false;
      const tau = reduced() ? 0 : 0.18;
      const d = days();
      for (let n = 0; n <= N_MAX; n++) {
        const a = curveAny[n]!;
        const m = curveMine[n]!;
        const ap = curveApprox[n]!;
        curveAny[n] = follow(a, pShared(n, d), dt, tau);
        curveMine[n] = follow(m, pMine(n, d), dt, tau);
        curveApprox[n] = follow(ap, pApprox(n, d), dt, tau);
        if (curveAny[n] !== pShared(n, d) || curveMine[n] !== pMine(n, d) || curveApprox[n] !== pApprox(n, d)) anim = true;
      }
      const xg = xMaxFor();
      xMaxS = follow(xMaxS, xg, dt, tau);
      nS = follow(nS, p.n, dt, dragN || reduced() ? 0 : 0.1);
      const pg = pOf(p.n);
      pS = follow(pS, pg, dt, reduced() ? 0 : 0.2);
      const s = statNow();
      const hg = s && s.runs ? s.hits / s.runs : 0;
      hS = follow(hS, hg, dt, reduced() ? 0 : 0.15);
      if (xMaxS !== xg || nS !== p.n || pS !== pg || hS !== hg) anim = true;
      if (runner) {
        stepRunner(now);
        anim = true;
        updateReadouts();
      }
      if (view.busy(now) || now - cardT0 < 700) anim = true;
      if (mode() === 'calc' && calcK(now) < Math.min(p.n, d)) anim = true;
      if (!allArrived(now) || now - burst < 400) anim = true;
      // gemeinsame Tage pulsieren ein paar Sekunden lang
      if (!reduced() && mode() === 'class' && clsT0 > 0 && now - clsT0 < 6000 && hitOf(cls)) anim = true;
      return anim;
    }

    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      let anim = stepState(now, dt);
      let kVis = 1;
      let kChart = 1;
      let kInfo = 1;
      let grow = 1;
      if (intro !== null) {
        const t = now - intro;
        if (t > 2200) intro = null;
        else {
          anim = true;
          kVis = ease.outCubic(clamp01(t / 500));
          kChart = ease.outCubic(clamp01((t - 150) / 550));
          kInfo = ease.outCubic(clamp01((t - 300) / 550));
          grow = ease.inOutCubic(clamp01((t - 300) / 1300));
        }
      }
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      const reg = regions();
      // linke Ansicht: alte blendet aus, neue ein
      const u = view.at(now);
      cardFrame(reg.vis, kVis);
      g.save();
      g.beginPath();
      g.rect(reg.vis.x, reg.vis.y, reg.vis.w, reg.vis.h);
      g.clip();
      if (u < 1 && prevMode !== mode()) drawVis(prevMode, { ...reg.vis, x: reg.vis.x - u * 16 }, (1 - u) * kVis, now);
      drawVis(mode(), { ...reg.vis, x: reg.vis.x + (1 - u) * 16 }, u * kVis, now);
      g.restore();
      const slide = (1 - kChart) * 14;
      drawChart({ ...reg.chart, x: reg.chart.x + slide }, kChart, now, grow);
      drawInfo({ ...reg.info, x: reg.info.x + (1 - kInfo) * 14 }, kInfo, now);
      if (anim) ctx.requestRender();
    }
    function drawVis(m: Mode, R: Rect, alpha: number, now: number): void {
      if (alpha <= 0.01) return;
      if (m === 'class') drawClass(R, alpha, now);
      else if (m === 'sim') drawSim(R, alpha, now);
      else if (m === 'calc') drawCalc(R, alpha, now);
      else drawPairs(R, alpha, now);
    }

    updateReadouts();
    syncActions();

    return {
      update(changed, source) {
        const now = performance.now();
        if (changed.has('mode') && source !== 'init' && mode() !== curMode) {
          prevMode = curMode;
          curMode = mode();
          if (reduced()) view.snap(1);
          else {
            view.snap(0);
            view.go(1, 520, now);
          }
          if (mode() === 'calc') restartCalc(now);
          cardT0 = now;
        }
        if (changed.has('d') && source !== 'init') {
          cls = randomClass(p.n, rnd, days());
          clsT0 = reduced() ? -1e6 : now;
          restartCalc(now);
          cardT0 = now;
        }
        if (changed.has('n') && !changed.has('d') && cls.length !== p.n && source !== 'init') {
          // Klasse anpassen: Personen kommen dazu oder gehen
          if (p.n > cls.length) cls = [...cls, ...randomClass(p.n - cls.length, rnd, days())];
          else cls = cls.slice(0, p.n);
          if (source !== 'input' && source !== 'sim') clsT0 = reduced() ? -1e6 : now;
          pairFocus = null;
          if (mode() === 'calc') {
            const extra = distinctDays(days(), rnd, days()).filter((s) => !calcOrder.includes(s));
            calcOrder = [...calcOrder, ...extra].slice(0, Math.min(p.n, days()));
            // beim Ziehen sofort vollständig, bei Beispielen neu Schritt für Schritt
            if (source === 'replace') restartCalc(now);
            else calcT0 = -1e9;
          }
        }
        if (source === 'init' && mode() === 'calc') restartCalc(now);
        if (source === 'replace') cardT0 = now;
        if (runner && runner.key !== statKey()) runner = null;
        updateReadouts();
        syncActions();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'one' && !runner) newClass(now);
        else if (id === 'many' && !runner) startRunner(100, now);
        else if (id === 'k1000' && !runner) startRunner(1000, now);
        else if (id === 'step') restartCalc(now);
        else if (id === 'clear') {
          stats.delete(statKey());
          rnd = seededRandom((Date.now() ^ 0x2545f491) >>> 0);
          hS = 0;
        }
        updateReadouts();
        syncActions();
        ctx.requestRender();
      },

      render,
      destroy: () => surface.destroy(),
    };
  },
});
