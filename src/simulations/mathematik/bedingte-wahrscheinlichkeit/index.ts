import { defineSimulation, ease, offscreenCanvas, prefersReducedMotion, roundRect, shade, Surface, text, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import { assignRoles, naturalCounts, npv, ppv, ppvAfterTwo, rng, secondSetup, setupFromPercent, type Counts, type Role, type TestSetup } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (v: number) => clamp(v, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const N = 1000;
const ROLES: Role[] = ['tp', 'fn', 'fp', 'tn'];
/** Dauer eines Farbwechsels einer Person (ms). */
const COLOR_MS = 420;
/** Dauer einer Bewegung einer Person (ms). */
const MOVE_MS = 900;

/** Weich gleitender Wert (Zahlen zählen, Baum dreht sich). */
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
    const u = clamp01((now - this.t0) / this.ms);
    return this.from + (this.to - this.from) * ease.inOutCubic(u);
  }
  busy(now: number): boolean {
    return this.ms > 0 && now < this.t0 + this.ms;
  }
  get target(): number {
    return this.to;
  }
  go(to: number, ms = 600, delay = 0): void {
    if (to === this.to) return;
    const now = performance.now();
    this.from = this.at(now);
    this.to = to;
    this.t0 = now + delay;
    this.ms = this.reduced ? 0 : ms;
  }
  snap(v: number): void {
    this.from = this.to = v;
    this.ms = 0;
  }
}

/** Eine der 1000 Personen im Symbolbild. */
interface Person {
  u: number;
  v: number;
  role: Role;
  /** Farbwechsel: von cFrom nach cTo ab cT0. */
  cFrom: Role;
  cTo: Role;
  cT0: number;
  /** geplante Farbwechsel (Ablauf: krank/gesund, dann Test). */
  queue: { role: Role; at: number }[];
  /** Platz: Schlüssel des Ziels und Bewegung dorthin. */
  key: string;
  pFrom: [number, number, number] | null;
  pT0: number;
  /** Verzögerung beim Erscheinen (Einstieg). */
  pop: number;
}

type Place = { x: number; y: number; s: number };

/**
 * Bedingte Wahrscheinlichkeit am Beispiel medizinischer Tests: 1000 Personen
 * als Symbole färben sich nacheinander nach krank/gesund und nach dem
 * Testergebnis. „Nur die positiv Getesteten“ blendet alle negativen aus und
 * sortiert die positiven in zwei Gruppen: Der positive Vorhersagewert ist
 * oft überraschend klein (Basisraten-Fehler). Umschaltbar auf den Baum mit
 * natürlichen Häufigkeiten, der sich animiert umkehrt (Satz von Bayes), und
 * auf einen Zweittest nach positivem Ersttest.
 */
export default defineSimulation({
  id: 'bedingte-wahrscheinlichkeit',
  dragHint: false,
  layout: { aspect: 1.42, aspectNarrow: 0.42 },
  groups: [
    { id: 'test', label: L('Test und Krankheit', 'Test and disease') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'prev',
      type: 'number',
      group: 'test',
      label: L('Anteil der Kranken (Prävalenz)', 'Share of people with the disease (prevalence)'),
      min: 0.1,
      max: 50,
      step: 0.1,
      default: 1,
      unit: '%',
      help: L('Wie verbreitet ist die Krankheit unter den Getesteten?', 'How common is the disease among those tested?'),
    },
    {
      key: 'se',
      type: 'number',
      group: 'test',
      label: L('Sensitivität', 'Sensitivity'),
      min: 50,
      max: 100,
      step: 0.5,
      default: 90,
      unit: '%',
      help: L('Anteil der Kranken, bei denen der Test positiv ausfällt (erkennt Kranke).', 'Share of people with the disease who test positive.'),
    },
    {
      key: 'sp',
      type: 'number',
      group: 'test',
      label: L('Spezifität', 'Specificity'),
      min: 50,
      max: 100,
      step: 0.1,
      default: 91,
      unit: '%',
      help: L('Anteil der Gesunden, bei denen der Test negativ ausfällt (erkennt Gesunde).', 'Share of healthy people who test negative.'),
    },
    {
      key: 'n2',
      type: 'boolean',
      group: 'test',
      label: L('Zweiter Test nach positivem Ersttest', 'Second test after a positive first test'),
      default: false,
      help: L('Getestet werden nur Personen mit positivem Ersttest. Ihr Anteil an Kranken ist der Vorhersagewert des ersten Tests.', 'Only people with a positive first test are tested. Their share of people with the disease is the predictive value of the first test.'),
    },
    {
      key: 'view',
      type: 'choice',
      label: L('Darstellung', 'Representation'),
      options: [
        { value: 'icons', label: L('1000 Personen', '1000 people') },
        { value: 'tree', label: L('Baum mit Häufigkeiten', 'Tree with frequencies') },
      ],
      default: 'icons',
    },
    {
      key: 'dir',
      type: 'choice',
      label: L('Baum beginnt mit', 'Tree starts with'),
      options: [
        { value: 'fwd', label: L('krank / gesund', 'disease / healthy') },
        { value: 'rev', label: L('Testergebnis (umgekehrt)', 'test result (reversed)') },
      ],
      default: 'fwd',
      visibleIf: (v) => v.view === 'tree',
    },
    { key: 'pos', type: 'boolean', group: 'view', label: L('Nur die positiv Getesteten', 'Only those who tested positive'), default: false },
    { key: 'sort', type: 'boolean', group: 'view', label: L('Personen nach Gruppen sortieren', 'Sort people into groups'), default: false, visibleIf: (v) => v.view === 'icons' },
    {
      key: 'show',
      type: 'boolean',
      group: 'view',
      label: L('Ergebnisse anzeigen', 'Show results'),
      default: true,
      help: L('Für Aufgaben ausblenden: Anzahlen und Vorhersagewerte erscheinen als „?“. Prävalenz, Sensitivität und Spezifität bleiben sichtbar.', 'Hide for tasks: counts and predictive values appear as “?”. Prevalence, sensitivity and specificity stay visible.'),
    },
  ],
  actions: [
    { id: 'focus', label: L('Nur die positiv Getesteten', 'Only those who tested positive'), primary: true, visibleIf: (v) => v.view === 'icons' },
    { id: 'flip', label: L('Baum umkehren', 'Reverse the tree'), primary: true, visibleIf: (v) => v.view === 'tree' },
    { id: 'second', label: L('Zweiten Test machen', 'Do a second test') },
    { id: 'replay', label: L('Ablauf neu zeigen', 'Replay the process'), visibleIf: (v) => v.view === 'icons' },
  ],
  readouts: [
    { key: 'groups', label: L('1000 Personen', '1000 people'), spoiler: true },
    { key: 'ppv', label: L('Positiver Vorhersagewert', 'Positive predictive value'), spoiler: true },
    { key: 'npv', label: L('Negativer Vorhersagewert', 'Negative predictive value'), spoiler: true },
    { key: 'two', label: L('Zweiter Test', 'Second test'), spoiler: true },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'start', label: L('Seltene Krankheit (1 %)', 'Rare disease (1 %)'), values: {} },
    { id: 'rapid', label: L('Schnelltest bei geringer Verbreitung (vereinfacht)', 'Rapid test with low prevalence (simplified)'), values: { prev: 0.5, se: 80, sp: 98 } },
    { id: 'mammo', label: L('Mammographie-Screening (vereinfachtes Beispiel)', 'Mammography screening (simplified example)'), values: { prev: 0.8, se: 90, sp: 93 } },
    { id: 'common', label: L('Häufige Krankheit (50 %)', 'Common disease (50 %)'), values: { prev: 50, se: 90, sp: 90 } },
    { id: 'second', label: L('Zweittest nach positivem Ersttest', 'Second test after a positive first test'), values: { n2: true } },
    { id: 'tree', label: L('Umgekehrter Baum (Bayes)', 'Reversed tree (Bayes)'), values: { view: 'tree', dir: 'rev' } },
  ],
  strings: {
    de: { canvas: '1000 Personen als Symbole, gefärbt nach krank oder gesund und nach dem Testergebnis; daneben Sensitivität, Spezifität und Vorhersagewerte. Umschaltbar auf ein Baumdiagramm mit Häufigkeiten und die Formel von Bayes.' },
    en: { canvas: '1000 people as icons, coloured by disease status and test result; next to them sensitivity, specificity and predictive values. Can be switched to a tree diagram with frequencies and Bayes’ formula.' },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const de = ctx.lang === 'de';
    const tt = (d: string, e: string) => (de ? d : e);
    const reduced = prefersReducedMotion();
    const th = () => ctx.theme;
    const alpha = (c: string, a: number) => shade(c, 0, a);
    const font = (w: number, s: number) => `${w} ${s}px ${th().font}`;
    /** Ereignis-Buchstaben (K, K̄ bzw. D, D̄) aufrecht in Formeln. */
    const KS = de ? 'K' : 'D';
    const KB = de ? 'K̄' : 'D̄';
    const Kf = `\\t{${KS}}`;
    const KBf = `\\o{\\t{${KS}}}`;

    /* ---------------- Farben ---------------- */
    const RED = () => th().series[1]!;
    const ORANGE = () => th().series[3]!;
    const ACC = () => th().series[4]!;
    const GRAY = () => th().muted;
    const roleColor = (r: Role) => (r === 'tp' || r === 'fn' ? RED() : r === 'fp' ? ORANGE() : GRAY());
    const cardBg = () => (th().dark ? shade(th().bg, 0.075) : th().bg);

    /* ---------------- Zustand ---------------- */
    const setup = (): TestSetup => {
      const base = setupFromPercent(p.prev, p.se, p.sp);
      return p.n2 ? secondSetup(base) : base;
    };
    const base = (): TestSetup => setupFromPercent(p.prev, p.se, p.sp);
    let counts: Counts = naturalCounts(setup());
    const r0 = rng(20261019);
    const people: Person[] = Array.from({ length: N }, () => ({ u: r0(), v: r0(), role: 'tn' as Role, cFrom: 'tn' as Role, cTo: 'tn' as Role, cT0: -1e9, queue: [], key: '', pFrom: null, pT0: -1e9, pop: 0 }));
    const jitter = Array.from({ length: N }, () => r0());
    let now = performance.now();
    let introT0 = reduced ? -1e9 : now + 150;
    let hoverRole: Role | null = null;
    const G = (v: number) => new Glide(v, reduced);
    const gc: Record<Role, Glide> = { tp: G(0), fn: G(0), fp: G(0), tn: G(0) };
    const gSick = G(0);
    const gPos = G(0);
    const gPpv = G(0);
    const gNpv = G(0);
    const gFocus = G(p.pos ? 1 : 0);
    const gFlip = G(p.dir === 'rev' ? 1 : 0);
    const gView = G(1);
    let viewShown = p.view;
    /** Ablauf (Einfärben in zwei Schritten): Startzeit und Zeitpunkte. */
    let stageT0 = -1e9;
    const STAGE = { sick: 1000, test: 2300, end: 3300 };
    let secondTimer: ReturnType<typeof setTimeout> | null = null;

    /* ---------------- Aufteilung ---------------- */
    const wide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    function regions(): { main: Rect; col: Rect } {
      const W = surface.width;
      const H = surface.height;
      if (wide()) {
        const cw = Math.round(clamp(W * 0.31, 214, 272));
        return { main: { x: 6, y: 6, w: W - cw - 18, h: H - 12 }, col: { x: W - cw - 6, y: 6, w: cw, h: H - 12 } };
      }
      const mh = Math.round(clamp(H - 274, 300, H - 190));
      return { main: { x: 4, y: 4, w: W - 8, h: mh }, col: { x: 4, y: mh + 12, w: W - 8, h: H - mh - 16 } };
    }
    const HEAD = 50;
    /** Legende in einer Reihe (breit) oder als 2 × 2 (schmal, Tablet hoch). */
    const legendOneRow = () => wide() && (regions().main.w - 48) / 4 >= 118;
    function legendRect(): Rect {
      const m = regions().main;
      const h = legendOneRow() ? 52 : 92;
      return { x: m.x + 12, y: m.y + m.h - h - 10, w: m.w - 24, h };
    }
    function gridArea(): Rect {
      const m = regions().main;
      const lg = legendRect();
      return { x: m.x + 12, y: m.y + HEAD, w: m.w - 24, h: lg.y - m.y - HEAD - 10 };
    }

    interface GridGeo {
      x0: number;
      y0: number;
      cell: number;
      cols: number;
      rows: number;
      bc: number;
      br: number;
      gap: number;
      w: number;
      h: number;
    }
    let gridCache: { key: string; geo: GridGeo } | null = null;
    function gridGeo(): GridGeo {
      const a = gridArea();
      const key = `${a.x}|${a.y}|${a.w}|${a.h}`;
      if (gridCache?.key === key) return gridCache.geo;
      const opts: [number, number, number, number][] = [
        [40, 25, 10, 5],
        [25, 40, 5, 10],
        [50, 20, 10, 10],
        [20, 50, 10, 10],
      ];
      let best: GridGeo | null = null;
      for (const [cols, rows, bc, br] of opts) {
        const cell = Math.min(24, a.w / (cols + 0.45 * (cols / bc - 1)), a.h / (rows + 0.45 * (rows / br - 1)));
        if (!best || cell > best.cell) {
          const gap = cell * 0.45;
          const w = cols * cell + (cols / bc - 1) * gap;
          const h = rows * cell + (rows / br - 1) * gap;
          best = { x0: a.x + (a.w - w) / 2, y0: a.y + (a.h - h) / 2, cell, cols, rows, bc, br, gap, w, h };
        }
      }
      gridCache = { key, geo: best! };
      return best!;
    }
    function slotPlace(k: number): Place {
      const gg = gridGeo();
      const col = k % gg.cols;
      const row = Math.floor(k / gg.cols);
      return { x: gg.x0 + col * gg.cell + Math.floor(col / gg.bc) * gg.gap, y: gg.y0 + row * gg.cell + Math.floor(row / gg.br) * gg.gap, s: gg.cell };
    }

    /** Anordnung der positiv Getesteten in zwei Gruppen (unten bündig wie Säulen). */
    interface FocusGeo {
      cell: number;
      ka: number;
      kb: number;
      xa: number;
      xb: number;
      base: number;
      head: Rect;
      wa: number;
      wb: number;
    }
    let focusCache: { key: string; geo: FocusGeo } | null = null;
    function focusGeo(): FocusGeo {
      const a = gridArea();
      const na = counts.tp;
      const nb = counts.fp;
      const key = `${a.x}|${a.y}|${a.w}|${a.h}|${na}|${nb}`;
      if (focusCache?.key === key) return focusCache.geo;
      const headH = 66;
      const availW = a.w - 16;
      const availH = a.h - headH - 30;
      const g0 = gridGeo().cell;
      let res: FocusGeo | null = null;
      for (let cell = Math.min(g0 * 1.7, 28); cell >= 3 && !res; cell -= 0.5) {
        const gap = Math.max(48, cell * 3);
        const maxR = Math.floor(availH / cell);
        for (let R = 1; R <= maxR; R++) {
          const ka = Math.max(1, Math.ceil(na / R));
          const kb = Math.max(1, Math.ceil(nb / R));
          const wa = Math.max(ka * cell, 64);
          const wb = Math.max(kb * cell, 64);
          const width = wa + wb + gap;
          if (width <= availW) {
            const x = a.x + (a.w - width) / 2;
            const rowsUsed = Math.max(Math.ceil(na / ka), Math.ceil(nb / kb), 1);
            const base = a.y + headH + (availH + rowsUsed * cell) / 2;
            res = { cell, ka, kb, xa: x + (wa - ka * cell) / 2, xb: x + wa + gap + (wb - kb * cell) / 2, base, head: { x: a.x, y: a.y, w: a.w, h: headH }, wa, wb };
            break;
          }
        }
      }
      res ??= { cell: 3, ka: 1, kb: 1, xa: a.x, xb: a.x + a.w / 2, base: a.y + a.h - 30, head: { x: a.x, y: a.y, w: a.w, h: headH }, wa: 64, wb: 64 };
      focusCache = { key, geo: res };
      return res;
    }

    /* ---------------- Rollen, Plätze, Farben ---------------- */
    let sortedIndex: number[] = [];
    let groupIndex: number[] = [];
    function recomputeRoles(): void {
      counts = naturalCounts(setup());
      const roles = assignRoles(
        people.map((q) => q.u),
        people.map((q) => q.v),
        counts,
      );
      people.forEach((q, i) => (q.role = roles[i]!));
      // Reihenfolge für „sortiert“ und Platz innerhalb der Gruppe
      const order = ROLES.flatMap((r) => people.map((q, i) => ({ q, i })).filter((o) => o.q.role === r).sort((a, b) => a.q.v - b.q.v));
      sortedIndex = Array<number>(N);
      groupIndex = Array<number>(N);
      const seen: Record<Role, number> = { tp: 0, fn: 0, fp: 0, tn: 0 };
      order.forEach((o, k) => {
        sortedIndex[o.i] = k;
        groupIndex[o.i] = seen[o.q.role]++;
      });
    }

    function placeKey(i: number): string {
      const q = people[i]!;
      if (p.pos && (q.role === 'tp' || q.role === 'fp')) return `f${q.role}${groupIndex[i]}`;
      return `g${p.sort ? sortedIndex[i] : i}`;
    }
    function placeOf(key: string): Place {
      if (key[0] === 'f') {
        const fg = focusGeo();
        const tp = key[2] === 'p' && key[1] === 't';
        const k = Number(key.slice(3));
        const cols = tp ? fg.ka : fg.kb;
        const col = k % cols;
        const row = Math.floor(k / cols);
        return { x: (tp ? fg.xa : fg.xb) + col * fg.cell, y: fg.base - (row + 1) * fg.cell, s: fg.cell };
      }
      return slotPlace(Number(key.slice(1)));
    }
    function placeNow(q: Person): Place {
      const t = placeOf(q.key);
      if (!q.pFrom) return t;
      const e = ease.inOutCubic(clamp01((now - q.pT0) / MOVE_MS));
      if (e >= 1) {
        q.pFrom = null;
        return t;
      }
      // leichter Bogen, damit sich Personen nicht überdecken
      const lift = Math.sin(Math.PI * e) * Math.min(28, Math.hypot(t.x - q.pFrom[0], t.y - q.pFrom[1]) * 0.12);
      return { x: lerp(q.pFrom[0], t.x, e), y: lerp(q.pFrom[1], t.y, e) - lift, s: lerp(q.pFrom[2], t.s, e) };
    }
    function retargetPlaces(snap: boolean): void {
      let k = 0;
      people.forEach((q, i) => {
        const key = placeKey(i);
        if (key === q.key) return;
        if (snap || !q.key || reduced) {
          q.key = key;
          q.pFrom = null;
          return;
        }
        const cur = placeNow(q);
        q.key = key;
        q.pFrom = [cur.x, cur.y, cur.s];
        const mover = key[0] === 'f' || q.role === 'tp' || q.role === 'fp';
        q.pT0 = now + (mover ? Math.min(500, (k++ % 120) * 4) + jitter[i]! * 120 : jitter[i]! * 200);
      });
    }

    /** Aktuell sichtbare Farbe: Gewicht der Zielfarbe (0 … 1). */
    function colorMix(q: Person): number {
      if (reduced) return 1;
      return clamp01((now - q.cT0) / COLOR_MS);
    }
    function setColor(q: Person, role: Role, at: number): void {
      const e = colorMix(q);
      q.cFrom = e < 0.5 ? q.cFrom : q.cTo;
      if (q.cFrom === role && e >= 0.5) {
        q.cTo = role;
        q.cT0 = -1e9;
        return;
      }
      q.cTo = role;
      q.cT0 = at;
    }
    function processQueues(): void {
      for (const q of people) {
        while (q.queue.length && q.queue[0]!.at <= now) {
          const step = q.queue.shift()!;
          setColor(q, step.role, step.at);
        }
      }
    }
    function recolor(snap: boolean): void {
      people.forEach((q, i) => {
        if (q.queue.length) {
          // Ablauf läuft: nur das Endziel anpassen
          const last = q.queue[q.queue.length - 1]!;
          last.role = q.role;
          if (q.queue.length > 1) q.queue[0]!.role = q.role === 'tp' || q.role === 'fn' ? 'tp' : 'tn';
          return;
        }
        if (snap || reduced) {
          q.cFrom = q.cTo = q.role;
          q.cT0 = -1e9;
          return;
        }
        if (q.cTo !== q.role) setColor(q, q.role, now + jitter[i]! * 260);
      });
    }
    /** Ablauf: alle grau → Kranke rot → Testergebnis. */
    function stage(t0: number): void {
      stageT0 = t0;
      people.forEach((q, i) => {
        q.queue = [];
        setColor(q, 'tn', t0);
        const sick = q.role === 'tp' || q.role === 'fn';
        q.queue.push({ role: sick ? 'tp' : 'tn', at: t0 + STAGE.sick + jitter[i]! * 450 });
        q.queue.push({ role: q.role, at: t0 + STAGE.test + jitter[(i * 7) % N]! * 600 });
      });
    }
    function stageInfo(): 'all' | 'sick' | 'test' | 'done' {
      const t = now - stageT0;
      if (t < 0 || t > STAGE.end + 600) return 'done';
      if (t < STAGE.sick) return 'all';
      if (t < STAGE.test) return 'sick';
      return 'test';
    }

    /* ---------------- Sprites der Personen ---------------- */
    const sprites = new Map<string, HTMLCanvasElement>();
    function sprite(role: Role, s: number): HTMLCanvasElement {
      const size = Math.max(3, Math.round(s * 2) / 2);
      const col = roleColor(role);
      const key = `${role}|${size}|${col}|${th().dark ? 1 : 0}|${surface.dpr}`;
      let c = sprites.get(key);
      if (c) return c;
      if (sprites.size > 200) sprites.clear();
      const { canvas, g } = offscreenCanvas(size, size, surface.dpr);
      const dark = th().dark;
      const fill = (() => {
        if (role === 'tn') return alpha(col, dark ? 0.42 : 0.34);
        if (role === 'fn') return alpha(col, dark ? 0.2 : 0.14);
        const gr = g.createLinearGradient(0, 0, 0, size);
        gr.addColorStop(0, shade(col, dark ? 0.18 : 0.22));
        gr.addColorStop(1, shade(col, dark ? -0.1 : -0.16));
        return gr;
      })();
      g.fillStyle = fill;
      g.strokeStyle = col;
      g.lineWidth = Math.max(1, size * 0.08);
      if (size >= 11) {
        const cx = size / 2;
        g.beginPath();
        g.arc(cx, size * 0.27, size * 0.17, 0, Math.PI * 2);
        g.fill();
        if (role === 'fn') g.stroke();
        roundRect(g, size * 0.19, size * 0.5, size * 0.62, size * 0.42, size * 0.2);
        g.fill();
        if (role === 'fn') g.stroke();
      } else {
        g.beginPath();
        g.arc(size / 2, size / 2, size * 0.36, 0, Math.PI * 2);
        g.fill();
        if (role === 'fn') g.stroke();
      }
      // Kranke tragen zusätzlich einen Punkt auf dem Körper: krank/gesund ist
      // so auch ohne Farbunterscheidung (Rot-Grün-Schwäche) erkennbar.
      if (role === 'tp' || role === 'fn') {
        const big = size >= 11;
        g.beginPath();
        g.arc(size / 2, big ? size * 0.71 : size / 2, Math.max(1, size * (big ? 0.1 : 0.13)), 0, Math.PI * 2);
        g.fillStyle = role === 'tp' ? th().bg : col;
        g.fill();
      }
      sprites.set(key, canvas);
      c = canvas;
      return c;
    }

    /* ---------------- Text-Hilfen ---------------- */
    const pct = (v: number, dec?: number) => {
      if (!Number.isFinite(v)) return '–';
      const x = v * 100;
      const d = dec ?? pctDigits(x);
      // geschütztes Leerzeichen: Zahl und % beim Umbrechen nicht trennen
      return `${fmt.num(x, d)}\u00a0%`;
    };
    /** Stellen nach dem Komma für `pct` (wie dort). */
    const pctDigits = (x: number) => (x === 100 || x === 0 ? 0 : x >= 99.9 ? 2 : x >= 1 ? 1 : 2);
    /** „= 9 %“ bei exaktem, „≈ 9,2 %“ bei gerundetem Prozentwert. */
    const pctEq = (v: number) => {
      if (!Number.isFinite(v)) return '= –';
      const x = v * 100;
      const d = pctDigits(x);
      return `${Math.abs(x - Math.round(x * 10 ** d) / 10 ** d) < 1e-9 ? '=' : '≈'} ${pct(v)}`;
    };
    /** Stellen für Anteile mit drei geltenden Ziffern (z. B. 0,0009). */
    const decDigits = (v: number) => clamp(3 - Math.floor(Math.log10(Math.abs(v))) - 1, 1, 6);
    /** Anteil mit sinnvollen Stellen (z. B. 0,0009) für die Bayes-Formel. */
    const dec = (v: number) => (v === 0 ? '0' : fmt.num(v, decDigits(v)));
    /** „=“ oder „≈“, je nachdem, ob `dec` die Zahlen rundet. */
    const decRel = (...vs: number[]) => (vs.every((v) => v === 0 || Math.abs(v - Math.round(v * 10 ** decDigits(v)) / 10 ** decDigits(v)) < 1e-12) ? '=' : '≈');
    /** Anzahl oder „?“, wenn die Ergebnisse für Aufgaben ausgeblendet sind. */
    const hn = (n: number) => (p.show ? `${n}` : '?');
    const roleName = (r: Role) =>
      ({
        tp: tt('richtig positiv', 'true positive'),
        fn: tt('falsch negativ', 'false negative'),
        fp: tt('falsch positiv', 'false positive'),
        tn: tt('richtig negativ', 'true negative'),
      })[r];
    const roleShort = (r: Role) =>
      ({
        tp: tt('krank · Test +', 'ill · test +'),
        fn: tt('krank · Test −', 'ill · test −'),
        fp: tt('gesund · Test +', 'healthy · test +'),
        tn: tt('gesund · Test −', 'healthy · test −'),
      })[r];
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({ size, font: th().font, mathFont: th().mathFont, color, weight, palette: { r: RED(), o: ORANGE(), a: ACC(), m: th().muted } });
    function fit(src: string, maxW: number, size: number, color = th().text, weight = 600, min = 9.5): FormulaBox {
      let s = size;
      let box = formula(surface.g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > min) {
        s -= 0.5;
        box = formula(surface.g, src, fstyle(s, color, weight));
      }
      return box;
    }
    function fitFont(str: string, maxW: number, w: number, size: number, min = 10): number {
      const g = surface.g;
      let s = size;
      g.font = font(w, s);
      while (s > min && g.measureText(str).width > maxW) {
        s -= 0.5;
        g.font = font(w, s);
      }
      return s;
    }
    function wrap(str: string, maxW: number, f: string): string[] {
      const g = surface.g;
      g.font = f;
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

    function card(r: Rect, a = 1): void {
      const g = surface.g;
      const t = th();
      g.save();
      g.globalAlpha = a;
      g.shadowColor = t.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 18;
      g.shadowOffsetY = 4;
      roundRect(g, r.x, r.y, r.w, r.h, 14);
      const grad = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      grad.addColorStop(0, t.dark ? shade(t.bg, 0.075) : t.bg);
      grad.addColorStop(1, t.dark ? shade(t.bg, 0.035) : shade(t.bg, -0.018));
      g.fillStyle = grad;
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = alpha(t.text, t.dark ? 0.1 : 0.07);
      g.stroke();
      g.restore();
    }

    /* ---------------- Kopfzeile ---------------- */
    function drawHeader(m: Rect): void {
      const g = surface.g;
      const t = th();
      const c = counts;
      const st = p.view === 'icons' ? stageInfo() : 'done';
      let title = p.n2 ? tt('2. Test: 1000 Personen mit positivem 1. Test', '2nd test: 1000 people with a positive 1st test') : tt('1000 getestete Personen', '1000 people tested');
      if (p.view === 'tree') title = p.n2 ? tt('2. Test: Baum mit Häufigkeiten', '2nd test: tree with frequencies') : tt('Baum mit natürlichen Häufigkeiten', 'Tree with natural frequencies');
      const sick = Math.round(gSick.at(now));
      const pos = Math.round(gPos.at(now));
      const prevTxt = pct(setup().prev);
      let sub: string;
      if (st === 'all') sub = tt('Wer ist krank? Wie fällt der Test aus?', 'Who has the disease? What does the test say?');
      else if (st === 'sick' && p.show) sub = tt(`${c.sick} davon sind krank (${prevTxt}).`, `${c.sick} of them have the disease (${prevTxt}).`);
      else if (!p.show) sub = p.n2 ? tt(`Anteil Kranker jetzt ${prevTxt} = Vorhersagewert des 1. Tests`, `Share with the disease now ${prevTxt} = predictive value of test 1`) : tt(`Anteil der Kranken ${prevTxt} · Anzahlen ausgeblendet`, `Share with the disease ${prevTxt} · counts hidden`);
      else if (p.n2) sub = tt(`Anteil Kranker jetzt ${prevTxt} = Vorhersagewert des 1. Tests · ${pos} positiv`, `Share with the disease now ${prevTxt} = predictive value of test 1 · ${pos} positive`);
      else sub = tt(`${sick} krank (${prevTxt}) · ${pos} positiv getestet · ${N - pos} negativ`, `${sick} with the disease (${prevTxt}) · ${pos} tested positive · ${N - pos} negative`);
      const fs = fitFont(title, m.w - 28, 800, wide() ? 14.5 : 13.5, 11);
      text(g, title, m.x + 14, m.y + 20, { font: font(800, fs), color: t.text, align: 'left' });
      const ss = fitFont(sub, m.w - 28, 600, 12, 10);
      text(g, sub, m.x + 14, m.y + 38, { font: font(600, ss), color: st === 'sick' ? RED() : t.muted, align: 'left' });
    }

    /* ---------------- Symbolbild ---------------- */
    function drawIcons(alphaAll: number): void {
      const g = surface.g;
      const focus = gFocus.at(now);
      const order = [...Array(N).keys()].sort((a, b) => Number(people[a]!.role === 'tp' || people[a]!.role === 'fp') - Number(people[b]!.role === 'tp' || people[b]!.role === 'fp'));
      // Hintergrund der Gruppen im Fokus
      if (focus > 0.01) drawFocusBack(focus * alphaAll);
      const gg = gridGeo();
      g.save();
      for (const i of order) {
        const q = people[i]!;
        const pl = placeNow(q);
        const positive = q.role === 'tp' || q.role === 'fp';
        let a = alphaAll;
        if (!positive) a *= lerp(1, 0.13, focus);
        if (hoverRole && q.role !== hoverRole) a *= 0.28;
        // Einstieg: Personen erscheinen als Welle
        let sc = 1;
        if (introT0 > 0) {
          const col = i % gg.cols;
          const row = Math.floor(i / gg.cols);
          sc = ease.outBack(clamp01((now - introT0 - (col + row) * 11) / 380));
        }
        if (sc <= 0.01 || a <= 0.005) continue;
        const e = colorMix(q);
        const s = pl.s * sc;
        // kleiner Puls beim Wechsel zu „positiv“ oder „krank“
        const bump = e > 0 && e < 1 && (q.cTo === 'tp' || q.cTo === 'fp') && q.cFrom !== q.cTo ? Math.sin(Math.PI * e) * 0.35 : 0;
        const sz = s * (1 + bump);
        const x = pl.x + (pl.s - sz) / 2;
        const y = pl.y + (pl.s - sz) / 2;
        if (e < 1 && q.cFrom !== q.cTo) {
          g.globalAlpha = a * (1 - e);
          g.drawImage(sprite(q.cFrom, pl.s), x, y, sz, sz);
          g.globalAlpha = a * e;
          g.drawImage(sprite(q.cTo, pl.s), x, y, sz, sz);
        } else {
          g.globalAlpha = a;
          g.drawImage(sprite(q.cTo, pl.s), x, y, sz, sz);
        }
      }
      g.restore();
      if (focus > 0.01) drawFocusFront(focus * alphaAll);
    }

    function drawFocusBack(a: number): void {
      const g = surface.g;
      const fg = focusGeo();
      const area = gridArea();
      g.save();
      g.globalAlpha = a * 0.82;
      g.fillStyle = cardBg();
      roundRect(g, area.x - 4, area.y - 4, area.w + 8, area.h + 8, 12);
      g.fill();
      g.restore();
      // Grundlinie unter den Gruppen
      g.save();
      g.globalAlpha = a;
      g.strokeStyle = alpha(th().text, 0.25);
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(fg.xa - 12, fg.base + 3);
      g.lineTo(fg.xb + fg.kb * fg.cell + 12, fg.base + 3);
      g.stroke();
      if (counts.fp === 0 || counts.tp === 0) {
        // leere Gruppe: gestrichelter Platzhalter
        g.setLineDash([4, 4]);
        g.strokeStyle = alpha(th().text, 0.25);
        const x = counts.tp === 0 ? fg.xa : fg.xb;
        roundRect(g, x - 4, fg.base - 30, 40, 28, 6);
        g.stroke();
      }
      g.restore();
    }

    function drawFocusFront(a: number): void {
      const g = surface.g;
      const t = th();
      const fg = focusGeo();
      const c = counts;
      const tp = Math.round(gc.tp.at(now));
      const fp = Math.round(gc.fp.at(now));
      g.save();
      g.globalAlpha = a;
      // Beschriftungen unter den Gruppen
      const lab = (x: number, w: number, n: number, l1: string, color: string) => {
        text(g, hn(n), x + w / 2, fg.base + 17, { font: font(800, 14), color });
        text(g, l1, x + w / 2, fg.base + 32, { font: font(600, 11), color: t.muted });
      };
      lab(fg.xa, Math.max(fg.ka * fg.cell, c.tp === 0 ? 32 : 0), tp, tt('krank', 'ill'), RED());
      lab(fg.xb, Math.max(fg.kb * fg.cell, c.fp === 0 ? 32 : 0), fp, tt('gesund', 'healthy'), ORANGE());
      // Überschrift: x von y
      const h = fg.head;
      const big = `${hn(tp)} ${tt('von', 'of')} ${hn(tp + fp)}`;
      const bs = fitFont(big, h.w - 20, 800, wide() ? 28 : 24, 16);
      text(g, big, h.x + h.w / 2, h.y + 20, { font: font(800, bs), color: RED() });
      const ppvTxt = p.show ? ` ${pctEq(gPpv.at(now))}` : '';
      const line = tt(`positiv Getesteten sind wirklich krank${ppvTxt}`, `people who tested positive really have the disease${ppvTxt}`);
      const ls = fitFont(line, h.w - 20, 650, 13, 10);
      text(g, line, h.x + h.w / 2, h.y + 46, { font: font(650, ls), color: t.text });
      g.restore();
    }

    /* ---------------- Legende ---------------- */
    function chipRects(): { role: Role; r: Rect }[] {
      const lg = legendRect();
      const gap = 8;
      if (legendOneRow()) {
        const w = (lg.w - 3 * gap) / 4;
        return ROLES.map((role, k) => ({ role, r: { x: lg.x + k * (w + gap), y: lg.y, w, h: lg.h } }));
      }
      const w = (lg.w - gap) / 2;
      const h = (lg.h - 6) / 2;
      // Reihenfolge: oben positiv (tp, fp), unten negativ (fn, tn)
      const pos: Record<Role, [number, number]> = { tp: [0, 0], fp: [1, 0], fn: [0, 1], tn: [1, 1] };
      return ROLES.map((role) => ({ role, r: { x: lg.x + pos[role][0] * (w + gap), y: lg.y + pos[role][1] * (h + 6), w, h } }));
    }
    function drawLegend(a: number): void {
      const g = surface.g;
      const t = th();
      const focus = gFocus.at(now);
      for (const { role, r } of chipRects()) {
        const negative = role === 'fn' || role === 'tn';
        let ca = a * (negative ? lerp(1, 0.4, focus) : 1);
        if (hoverRole && hoverRole !== role) ca *= 0.5;
        g.save();
        g.globalAlpha = ca;
        roundRect(g, r.x, r.y, r.w, r.h, 10);
        g.fillStyle = hoverRole === role ? alpha(roleColor(role), t.dark ? 0.22 : 0.12) : alpha(t.text, t.dark ? 0.05 : 0.03);
        g.fill();
        if (hoverRole === role) {
          g.strokeStyle = alpha(roleColor(role), 0.6);
          g.lineWidth = 1.2;
          g.stroke();
        }
        const is = Math.min(22, r.h - 14);
        g.drawImage(sprite(role, is), r.x + 8, r.y + (r.h - is) / 2, is, is);
        const tx = r.x + 14 + is;
        const n = Math.round(gc[role].at(now));
        const maxW = r.x + r.w - tx - 6;
        g.font = font(800, 15);
        text(g, hn(n), tx, r.y + r.h / 2 - 8, { font: font(800, 15), color: role === 'tn' ? t.text : shade(roleColor(role), t.dark ? 0.2 : -0.1), align: 'left' });
        const l1 = roleName(role);
        const s1 = fitFont(l1, maxW, 700, 11, 9.5);
        text(g, l1, tx, r.y + r.h / 2 + 8, { font: font(700, s1), color: t.muted, align: 'left' });
        g.font = font(800, 15);
        const nw = g.measureText(hn(n)).width;
        g.font = font(600, 10.5);
        const sh = roleShort(role);
        if (g.measureText(sh).width < maxW - nw - 14) text(g, sh, tx + nw + 8, r.y + r.h / 2 - 7.5, { font: font(600, 10.5), color: t.muted, align: 'left' });
        g.restore();
      }
    }

    /* ---------------- Baum ---------------- */
    interface TreeGeo {
      root: [number, number];
      l1x: number;
      l1y: [number, number];
      leafX: number;
      leafY: number[];
      bw: [number, number, number];
      bh: number;
      formula: Rect;
    }
    function treeGeo(): TreeGeo {
      const m = regions().main;
      const fh = wide() ? 138 : 150;
      const formulaR = { x: m.x + 12, y: m.y + m.h - fh - 10, w: m.w - 24, h: fh };
      const top = m.y + HEAD + 4;
      const bot = formulaR.y - 10;
      const rowH = (bot - top) / 4;
      const leafY = [0, 1, 2, 3].map((k) => top + (k + 0.5) * rowH);
      const bh = clamp(rowH * 0.62, 30, 44);
      const W = m.w - 24;
      // schmal (Handy): Kästen kleiner, damit zwischen den Stufen Platz für die Astbeschriftung bleibt
      const narrow = W < 400;
      const bw: [number, number, number] = narrow
        ? [clamp(W * 0.15, 46, 84), clamp(W * 0.2, 60, 110), clamp(W * 0.3, 92, 170)]
        : [clamp(W * 0.15, 52, 84), clamp(W * 0.2, 70, 110), clamp(W * 0.3, 104, 170)];
      const x0 = m.x + 12 + bw[0] / 2;
      const leafX = m.x + m.w - 12 - bw[2] / 2;
      const l1x = lerp(x0 + bw[0] / 2, leafX - bw[2] / 2, narrow ? 0.38 : 0.45);
      return { root: [x0, (leafY[1]! + leafY[2]!) / 2], l1x, l1y: [(leafY[0]! + leafY[1]!) / 2, (leafY[2]! + leafY[3]!) / 2], leafX, leafY, bw, bh, formula: formulaR };
    }
    /** Platz eines Blatts im Vorwärts- (krank zuerst) und im umgekehrten Baum. */
    const LEAF_F: Record<Role, number> = { tp: 0, fn: 1, fp: 2, tn: 3 };
    const LEAF_R: Record<Role, number> = { tp: 0, fp: 1, fn: 2, tn: 3 };

    function nodeBox(x: number, y: number, w: number, h: number, count: string, label: string, color: string, a: number, emph = false, shift = 0): void {
      const g = surface.g;
      const t = th();
      if (a <= 0.01) return;
      g.save();
      g.globalAlpha *= a;
      g.save();
      g.shadowColor = t.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 2;
      roundRect(g, x - w / 2, y - h / 2, w, h, 10);
      g.fillStyle = cardBg();
      g.fill();
      g.restore();
      roundRect(g, x - w / 2, y - h / 2, w, h, 10);
      g.fillStyle = alpha(color, t.dark ? 0.2 : 0.1);
      g.fill();
      g.strokeStyle = alpha(color, emph ? 0.95 : 0.55);
      g.lineWidth = emph ? 2.2 : 1.2;
      g.stroke();
      const cs = fitFont(count, w - 10 - 2 * shift, 800, h >= 38 ? 16 : 14, 11);
      text(g, count, x + shift, y - h * 0.16, { font: font(800, cs), color: t.text });
      const ls = fitFont(label, w - 8 - 2 * shift, 650, 11, 9.5);
      text(g, label, x + shift, y + h * 0.24, { font: font(650, ls), color: t.muted });
      g.restore();
    }
    function edge(a: [number, number], b: [number, number], color: string, width: number, label: string, alphaE: number, glow: boolean, ax: number): void {
      if (alphaE <= 0.01) return;
      const g = surface.g;
      const t = th();
      const mx = lerp(a[0], b[0], 0.5);
      g.save();
      g.globalAlpha *= alphaE;
      g.lineCap = 'round';
      const path = () => {
        g.beginPath();
        g.moveTo(a[0], a[1]);
        g.bezierCurveTo(mx, a[1], mx, b[1], b[0], b[1]);
      };
      if (glow) {
        path();
        g.strokeStyle = alpha(ACC(), t.dark ? 0.35 : 0.22);
        g.lineWidth = width + 9;
        g.stroke();
      }
      path();
      g.strokeStyle = alpha(color, 0.8);
      g.lineWidth = width;
      g.stroke();
      // Beschriftung am Ast
      const fsz = wide() ? 11.5 : 10.5;
      g.font = font(750, fsz);
      const lw = g.measureText(label).width + (wide() ? 12 : 8);
      // Beschriftung zwischen den Kästen halten, wenn der Ast kurz ist
      const lx = clamp(lerp(a[0], b[0], ax), Math.min(a[0], b[0]) + lw / 2, Math.max(Math.min(a[0], b[0]) + lw / 2, Math.max(a[0], b[0]) - lw / 2));
      const tB = Math.abs(b[0] - a[0]) > 1 ? clamp01((lx - a[0]) / (b[0] - a[0])) : ax;
      const ly = lerp(a[1], b[1], tB * tB * (3 - 2 * tB));
      roundRect(g, lx - lw / 2, ly - 9.5, lw, 19, 9.5);
      g.fillStyle = alpha(cardBg(), 0.96);
      g.fill();
      g.strokeStyle = alpha(glow ? ACC() : color, 0.55);
      g.lineWidth = 1;
      g.stroke();
      text(g, label, lx, ly + 0.5, { font: font(750, fsz), color: glow ? ACC() : shade(color, t.dark ? 0.25 : -0.25) });
      g.restore();
    }

    function drawTree(a: number): void {
      const g = surface.g;
      const t = th();
      const tg = treeGeo();
      const f = ease.inOutCubic(gFlip.at(now));
      const s = setup();
      const c = counts;
      const focus = gFocus.at(now) > 0.5 || p.pos;
      const grow = reduced ? 1 : ease.inOutCubic(clamp01((now - viewT0) / 700));
      g.save();
      g.globalAlpha = a;
      const leafPos = (r: Role): [number, number] => {
        const yF = tg.leafY[LEAF_F[r]]!;
        const yR = tg.leafY[LEAF_R[r]]!;
        const swing = r === 'fn' ? 1 : r === 'fp' ? -1 : 0;
        return [tg.leafX + swing * Math.sin(Math.PI * f) * tg.bw[2] * 0.32, lerp(yF, yR, f)];
      };
      const l1 = (k: 0 | 1): [number, number] => [tg.l1x, tg.l1y[k]];
      const P = [s.prev, 1 - s.prev, s.prev * s.se + (1 - s.prev) * (1 - s.sp)];
      const pPos = P[2]!;
      const ppvV = ppv(s);
      const npvV = npv(s);
      const hid = (v: string) => (p.show ? v : '?');
      const w = (v: number) => 1.6 + 5 * clamp01(v);
      const ga = (x: number) => x * grow;
      // Wurzel → erste Stufe (Beschriftung blendet um)
      const firstF = [
        { label: pct(s.prev), w: w(s.prev), col: RED() },
        { label: pct(1 - s.prev), w: w(1 - s.prev), col: GRAY() },
      ];
      const firstR = [
        // ohne Ergebnisse verraten auch die Strichstärken nichts
        { label: hid(pct(pPos)), w: w(p.show ? pPos : 0.5), col: ACC() },
        { label: hid(pct(1 - pPos)), w: w(p.show ? 1 - pPos : 0.5), col: GRAY() },
      ];
      ([0, 1] as const).forEach((k) => {
        const fa = 1 - clamp01(f * 2);
        const ra = clamp01(f * 2 - 1);
        const end = l1(k);
        const tip: [number, number] = [lerp(tg.root[0], end[0], grow), lerp(tg.root[1], end[1], grow)];
        edge(tg.root, tip, firstF[k]!.col, lerp(firstF[k]!.w, firstR[k]!.w, f), firstF[k]!.label, ga(fa), false, 0.55);
        edge(tg.root, tip, firstR[k]!.col, lerp(firstF[k]!.w, firstR[k]!.w, f), firstR[k]!.label, ga(ra), false, 0.55);
        if (fa <= 0.01 && ra <= 0.01) edge(tg.root, tip, GRAY(), 2, '', 0.6 * grow, false, 0.55);
      });
      // zweite Stufe
      const fwdKids: [Role, Role][] = [
        ['tp', 'fn'],
        ['fp', 'tn'],
      ];
      const revKids: [Role, Role][] = [
        ['tp', 'fp'],
        ['fn', 'tn'],
      ];
      const fwdLab: Record<Role, string> = { tp: pct(s.se), fn: pct(1 - s.se), fp: pct(1 - s.sp), tn: pct(s.sp) };
      const revLab: Record<Role, string> = { tp: hid(pct(ppvV)), fp: hid(pct(1 - ppvV)), fn: hid(pct(1 - npvV)), tn: hid(pct(npvV)) };
      const fwdW: Record<Role, number> = { tp: s.se, fn: 1 - s.se, fp: 1 - s.sp, tn: s.sp };
      const revW: Record<Role, number> = p.show ? { tp: ppvV, fp: 1 - ppvV, fn: 1 - npvV, tn: npvV } : { tp: 0.5, fp: 0.5, fn: 0.5, tn: 0.5 };
      const grow2 = reduced ? 1 : ease.inOutCubic(clamp01((now - viewT0 - 350) / 700));
      const drawKids = (kids: [Role, Role][], lab: Record<Role, string>, wt: Record<Role, number>, ea: number, rev: boolean) => {
        kids.forEach((pair, k) => {
          const from = l1(k as 0 | 1);
          pair.forEach((r) => {
            const to = leafPos(r);
            const st: [number, number] = [from[0] + tg.bw[1] / 2, from[1]];
            const en: [number, number] = [to[0] - tg.bw[2] / 2, to[1]];
            const tip: [number, number] = [lerp(st[0], en[0], grow2), lerp(st[1], en[1], grow2)];
            const glow = rev ? r === 'tp' && p.show : focus ? r === 'tp' || r === 'fp' : false;
            edge(st, tip, roleColor(r) === GRAY() ? GRAY() : roleColor(r), w(wt[r]), lab[r], ea * grow2, glow, 0.5);
          });
        });
      };
      drawKids(fwdKids, fwdLab, fwdW, 1 - clamp01(f * 2.2), false);
      drawKids(revKids, revLab, revW, clamp01(f * 2.2 - 1.2), true);
      // Knoten
      nodeBox(tg.root[0], tg.root[1], tg.bw[0], tg.bh, `${N}`, tt('Personen', 'people'), t.text, 1);
      const n1F = [Math.round(gSick.at(now)), N - Math.round(gSick.at(now))];
      const n1R = [Math.round(gPos.at(now)), N - Math.round(gPos.at(now))];
      const labF = [tt('krank', 'ill'), tt('gesund', 'healthy')];
      const labR = [tt('Test positiv', 'test positive'), tt('Test negativ', 'test negative')];
      ([0, 1] as const).forEach((k) => {
        const [x, y] = l1(k);
        const cnt = Math.round(lerp(n1F[k]!, n1R[k]!, f));
        const col = k === 0 ? (f < 0.5 ? RED() : ACC()) : GRAY();
        const lab = f < 0.5 ? labF[k]! : labR[k]!;
        const la = Math.abs(f - 0.5) * 2;
        nodeBox(x, y, tg.bw[1], tg.bh, hn(cnt), lab, col, grow > 0.6 ? 0.35 + 0.65 * la : 0);
      });
      if (grow2 > 0.7) {
        for (const r of ROLES) {
          const [x, y] = leafPos(r);
          const n = Math.round(gc[r].at(now));
          const emph = (focus && (r === 'tp' || r === 'fp')) || hoverRole === r;
          // Personen-Symbol am Blatt (nur, wenn Platz ist; Text rückt dann nach rechts)
          const is = Math.min(18, tg.bh - 14);
          const icon = tg.bw[2] >= 128;
          const shift = icon ? (is + 4) / 2 : 0;
          nodeBox(x, y, tg.bw[2], tg.bh, hn(n), roleShort(r), roleColor(r), hoverRole && hoverRole !== r ? 0.45 : 1, emph, shift);
          if (icon) g.drawImage(sprite(r, is), x - tg.bw[2] / 2 + 7, y - is / 2, is, is);
        }
      }
      g.restore();
      drawBayes(tg.formula, a, c);
    }

    /** Formel von Bayes mit eingesetzten Zahlen. */
    function drawBayes(r: Rect, a: number, c: Counts): void {
      const g = surface.g;
      const t = th();
      const s = setup();
      g.save();
      g.globalAlpha = a;
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.fillStyle = alpha(ACC(), t.dark ? 0.14 : 0.07);
      g.fill();
      g.strokeStyle = alpha(ACC(), 0.3);
      g.lineWidth = 1;
      g.stroke();
      const pad = 12;
      const maxW = r.w - 2 * pad;
      const size = wide() ? 15 : 13;
      const Pp = `P_{+}(${Kf})`;
      const gen = `${Pp} = \\f{P(${Kf}) · P_{${Kf}}(+)}{P(${Kf}) · P_{${Kf}}(+) + P(${KBf}) · P_{${KBf}}(+)}`;
      const num1 = s.prev * s.se;
      const den2 = (1 - s.prev) * (1 - s.sp);
      const pv = ppv(s);
      const res = p.show ? `${pctEq(pv).slice(0, 1)} \\c{a}{\\b{${pct(pv)}}}` : '= ?';
      const step = p.show ? `${decRel(num1, num1 + den2)} \\f{${dec(num1)}}{${dec(num1 + den2)}} ` : '';
      const nums = `= \\f{${dec(s.prev)} · ${dec(s.se)}}{${dec(s.prev)} · ${dec(s.se)} + ${dec(1 - s.prev)} · ${dec(1 - s.sp)}} ${step}${res}`;
      const freq = p.show
        ? `${tt('Häufigkeiten', 'frequencies')}: ${Pp} ≈ \\f{\\c{r}{${c.tp}}}{\\c{r}{${c.tp}} + \\c{o}{${c.fp}}} ${pctEq(c.pos ? c.tp / c.pos : NaN)}`
        : `${tt('Häufigkeiten', 'frequencies')}: ${Pp} ≈ \\f{?}{? + ?}`;
      const boxes = [gen, nums, freq].map((src, k) => fit(src, maxW, k === 2 ? size - 1 : size, k === 2 ? t.muted : t.text, 650, 9));
      const total = boxes.reduce((s2, b) => s2 + b.asc + b.desc, 0);
      // Zeilen gleichmäßig im Kasten verteilen
      const gap = Math.max(2, (r.h - 16 - total) / 4);
      let y = r.y + 8 + gap;
      boxes.forEach((b) => {
        y += b.asc;
        b.draw(g, r.x + pad, y);
        y += b.desc + gap;
      });
      g.restore();
    }
    let viewT0 = -1e9;

    /* ---------------- Kennzahlen-Karte ---------------- */
    function drawFacts(r: Rect): void {
      const g = surface.g;
      const t = th();
      const s = setup();
      const b = base();
      card(r);
      const pad = 14;
      const compact = !wide();
      const x = r.x + pad;
      const w = r.w - 2 * pad;
      let y = r.y + 20;
      /** größere Schrift und Zusatzabstand, wenn die Karte Platz hat */
      const roomy = !compact && r.w >= 236;
      const fs = roomy ? 1.08 : 1;
      const sp = compact ? 0 : clamp((r.h - 410) / 7, 0, 16);
      text(g, tt('Kennzahlen des Tests', 'Test figures'), x, y, { font: font(800, 14 * fs), color: t.text, align: 'left' });
      if (p.n2) {
        g.font = font(800, 11);
        const chip = tt('2. Test', '2nd test');
        const cw = g.measureText(chip).width + 16;
        roundRect(g, r.x + r.w - pad - cw, y - 10, cw, 20, 10);
        g.fillStyle = alpha(ACC(), t.dark ? 0.3 : 0.15);
        g.fill();
        text(g, chip, r.x + r.w - pad - cw / 2, y + 0.5, { font: font(800, 11), color: ACC() });
      }
      y += 14;
      const row = (label: string, sym: string, val: string, color: string, help?: string, rowW = w, rx = x) => {
        const lb = fit(label, rowW * 0.64, 12 * fs, t.text, 650, 10.5);
        lb.draw(g, rx, y + 12);
        const vs = fitFont(val, rowW * 0.36, 800, 14.5 * fs, 11);
        text(g, val, rx + rowW, y + 8, { font: font(800, vs), color, align: 'right' });
        const sb = fit(sym, rowW * 0.62, 11.5 * fs, t.muted, 600, 10.5);
        sb.draw(g, rx, y + 28 * fs);
        if (help && !compact) {
          const hs = fitFont(help, rowW * 0.42, 600, 11, 9.5);
          text(g, help, rx + rowW, y + 26 * fs, { font: font(600, hs), color: t.muted, align: 'right' });
        }
        y += 38 * fs + sp;
      };
      const ppvV = gPpv.at(now);
      const npvV = gNpv.at(now);
      const hid = (v: string) => (p.show ? v : '?');
      if (!compact) {
        row(tt('Prävalenz', 'Prevalence'), `P(${Kf})`, pct(s.prev), RED(), p.n2 ? tt('= Vorhersagewert 1. Test', '= predictive value test 1') : tt('Anteil der Kranken', 'share with disease'));
        row(tt('Sensitivität', 'Sensitivity'), `P_{${Kf}}(+)`, pct(s.se), RED(), tt('erkennt Kranke', 'detects the ill'));
        row(tt('Spezifität', 'Specificity'), `P_{${KBf}}(−)`, pct(s.sp), t.text, tt('erkennt Gesunde', 'clears the healthy'));
        // Trennlinie
        g.strokeStyle = alpha(t.text, 0.12);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + w, y);
        g.stroke();
        y += 12 + sp * 0.6;
        // Positiver Vorhersagewert groß
        text(g, tt('Positiver Vorhersagewert', 'Positive predictive value'), x, y + 6, { font: font(750, fitFont(tt('Positiver Vorhersagewert', 'Positive predictive value'), w, 750, 13 * fs, 10.5)), color: t.text, align: 'left' });
        const sb = fit(`P_{+}(${Kf}) ${tt('– krank, wenn positiv', '– ill if positive')}`, w, 11.5 * fs, t.muted, 600, 10);
        sb.draw(g, x, y + 25 * fs);
        y += 34 * fs;
        const big = hid(pct(ppvV));
        const bs = fitFont(big, w, 800, r.h > 470 ? 40 : 32, 18);
        text(g, big, x, y + bs * 0.55, { font: font(800, bs), color: RED(), align: 'left', baseline: 'middle' });
        y += bs * 1.1 + 4;
        const sent = tt(`${hn(counts.tp)} von ${hn(counts.pos)} positiv Getesteten sind krank.`, `${hn(counts.tp)} of ${hn(counts.pos)} people who tested positive have the disease.`);
        wrap(sent, w, font(600, 12))
          .slice(0, 2)
          .forEach((l) => {
            text(g, l, x, y + 6, { font: font(600, 12), color: t.muted, align: 'left' });
            y += 16;
          });
        y += 8 + sp;
        row(r.w < 280 ? tt('Neg. Vorhersagewert', 'Neg. pred. value') : tt('Negativer Vorhersagewert', 'Negative predictive value'), `P_{−}(${KBf})`, hid(pct(npvV)), t.text);
      } else {
        // Handy: links groß der Vorhersagewert, rechts die Kennzahlen
        const lw = w * 0.46;
        const top = y;
        text(g, tt('Positiver Vorhersagewert', 'Positive pred. value'), x, y + 6, { font: font(750, fitFont(tt('Positiver Vorhersagewert', 'Positive pred. value'), lw, 750, 12, 10.5)), color: t.text, align: 'left' });
        const sb = fit(`P_{+}(${Kf})`, lw, 11, t.muted, 600, 9);
        sb.draw(g, x, y + 23);
        const big = hid(pct(ppvV));
        const bs = fitFont(big, lw, 800, 32, 16);
        text(g, big, x, y + 50, { font: font(800, bs), color: RED(), align: 'left', baseline: 'middle' });
        const sent = tt(`${hn(counts.tp)} von ${hn(counts.pos)} positiv Getesteten sind krank.`, `${hn(counts.tp)} of ${hn(counts.pos)} who tested positive are ill.`);
        let yy = y + 76;
        wrap(sent, lw, font(600, 11))
          .slice(0, 3)
          .forEach((l) => {
            text(g, l, x, yy, { font: font(600, 11), color: t.muted, align: 'left' });
            yy += 14;
          });
        const rx = x + lw + 12;
        const rw = w - lw - 12;
        y = top - 4;
        row(tt('Prävalenz', 'Prevalence'), `P(${Kf})`, pct(s.prev), RED(), undefined, rw, rx);
        y -= 6;
        row(tt('Sensitivität', 'Sensitivity'), `P_{${Kf}}(+)`, pct(s.se), RED(), undefined, rw, rx);
        y -= 6;
        row(tt('Spezifität', 'Specificity'), `P_{${KBf}}(−)`, pct(s.sp), t.text, undefined, rw, rx);
        // negativer Vorhersagewert links unter dem Satz
        yy += 6;
        const nb = fit(`P_{−}(${KBf}) = ${hid(pct(npvV))}`, lw, 12, t.text, 700, 10.5);
        text(g, tt('Negativer Vorhersagewert', 'Negative pred. value'), x, yy, { font: font(650, fitFont(tt('Negativer Vorhersagewert', 'Negative pred. value'), lw, 650, 11, 10)), color: t.muted, align: 'left' });
        nb.draw(g, x, yy + 20);
        yy += 28;
        y = Math.max(y, yy) + 2;
      }
      // Merksatz
      const rare = counts.fp > counts.tp && p.show;
      let msg: string;
      if (p.n2) msg = tt(`Merksatz: Ein zweiter positiver Test hebt den Vorhersagewert von ${pct(ppv(b))} auf ${hid(pct(ppvAfterTwo(b)))}.`, `Key idea: a second positive test raises the predictive value from ${pct(ppv(b))} to ${hid(pct(ppvAfterTwo(b)))}.`);
      else if (!p.show) msg = tt('Tipp: Rechne mit natürlichen Häufigkeiten. Wie viele der 1000 Personen sind krank, wie viele davon positiv – und wie viele Gesunde sind positiv?', 'Tip: work with natural frequencies. How many of the 1000 people are ill, how many of them test positive – and how many healthy people test positive?');
      else if (s.sp >= 1) msg = tt('Merksatz: Ohne falsch positive Ergebnisse (Spezifität 100 %) ist jeder positiv Getestete krank.', 'Key idea: with no false positives (specificity 100 %), everyone who tests positive is ill.');
      else if (rare) msg = tt('Merksatz: Bei einer seltenen Krankheit können die meisten positiven Ergebnisse falsch positiv sein – auch bei einem guten Test. Hier ist das so.', 'Key idea: if a disease is rare, most positive results can be false positives – even with a good test. That is the case here.');
      else msg = tt('Merksatz: Je häufiger die Krankheit unter den Getesteten ist, desto eher bedeutet „positiv“ auch „krank“.', 'Key idea: the more common the disease among those tested, the more likely “positive” really means “ill”.');
      const mf = font(650, roomy ? 12 : 11.5);
      const lines = wrap(msg, w - 16, mf);
      const avail = r.y + r.h - 10 - y;
      const maxLines = Math.max(1, Math.min(lines.length, Math.floor((avail - 14) / 15)));
      const bh = maxLines * 15 + 14;
      const by = Math.min(r.y + r.h - pad - bh + 4, Math.max(y, r.y + r.h - pad - bh + 4));
      if (avail >= 30) {
        roundRect(g, x - 2, by, w + 4, bh, 10);
        g.fillStyle = alpha(rare && !p.n2 ? ORANGE() : ACC(), t.dark ? 0.18 : 0.1);
        g.fill();
        lines.slice(0, maxLines).forEach((l, k) => text(g, l, x + 8, by + 14 + k * 15, { font: mf, color: t.text, align: 'left' }));
      }
    }

    /* ---------------- Zeiger: Gruppe hervorheben ---------------- */
    function roleAt(px: number, py: number): Role | null {
      if (p.view === 'icons') {
        for (const { role, r } of chipRects()) if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) return role;
        return null;
      }
      const tg = treeGeo();
      const f = ease.inOutCubic(gFlip.at(now));
      for (const r of ROLES) {
        const y = lerp(tg.leafY[LEAF_F[r]]!, tg.leafY[LEAF_R[r]]!, f);
        if (Math.abs(px - tg.leafX) <= tg.bw[2] / 2 && Math.abs(py - y) <= tg.bh / 2) return r;
      }
      return null;
    }
    surface.addTarget({
      contains: () => true,
      pointerDown: (pt) => {
        const r = roleAt(pt.px, pt.py);
        hoverRole = r === hoverRole ? null : r;
        ctx.requestRender();
        return r !== null;
      },
      pointerMove: () => undefined,
      pointerUp: () => undefined,
      hover: (pt) => {
        const r = pt ? roleAt(pt.px, pt.py) : null;
        surface.setCursor(r ? 'pointer' : '');
        if (r !== hoverRole) {
          hoverRole = r;
          ctx.requestRender();
        }
      },
      wheel: () => false,
    });

    /* ---------------- Ergebnisse ---------------- */
    const frac = (a: string, b: string) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
    function updateReadouts(): void {
      const c = counts;
      const s = setup();
      const b = base();
      ctx.readout(
        'groups',
        tt(`${c.sick} krank → ${c.tp} positiv, ${c.fn} negativ · ${c.healthy} gesund → ${c.fp} positiv, ${c.tn} negativ`, `${c.sick} ill → ${c.tp} positive, ${c.fn} negative · ${c.healthy} healthy → ${c.fp} positive, ${c.tn} negative`),
      );
      const K = KS;
      ctx.readout('ppv', {
        html: `P<sub>+</sub>(${K}) = ${frac(`${dec(s.prev)} · ${dec(s.se)}`, `${dec(s.prev)} · ${dec(s.se)} + ${dec(1 - s.prev)} · ${dec(1 - s.sp)}`)} ${pctEq(ppv(s)).slice(0, 1)} <strong>${pct(ppv(s))}</strong> &nbsp;(${tt('Häufigkeiten', 'frequencies')}: ${frac(`${c.tp}`, `${c.tp} + ${c.fp}`)})`,
      });
      ctx.readout('npv', { html: `P<sub>−</sub>(${KB}) = ${frac(`${dec((1 - s.prev) * s.sp)}`, `${dec((1 - s.prev) * s.sp)} + ${dec(s.prev * (1 - s.se))}`)} ${pctEq(npv(s)).slice(0, 1)} <strong>${pct(npv(s))}</strong> &nbsp;(${frac(`${c.tn}`, `${c.tn} + ${c.fn}`)})` });
      ctx.readout(
        'two',
        p.n2
          ? tt(`Prävalenz im 2. Test = Vorhersagewert des 1. Tests ${pctEq(ppv(b))} → nach zwei positiven Tests ${pctEq(ppvAfterTwo(b))}`, `Prevalence in the 2nd test = predictive value of the 1st test ${pctEq(ppv(b))} → after two positive tests ${pctEq(ppvAfterTwo(b))}`)
          : tt(`Nach einem zweiten positiven Test: P(krank) ${pctEq(ppvAfterTwo(b))}`, `After a second positive test: P(ill) ${pctEq(ppvAfterTwo(b))}`),
      );
    }

    function syncActions(): void {
      ctx.setAction('focus', { label: p.pos ? L('Alle Personen zeigen', 'Show everyone')[ctx.lang] : L('Nur die positiv Getesteten', 'Only those who tested positive')[ctx.lang] });
      ctx.setAction('second', { label: p.n2 ? L('Zurück zum ersten Test', 'Back to the first test')[ctx.lang] : L('Zweiten Test machen', 'Do a second test')[ctx.lang] });
      ctx.setAction('flip', { label: p.dir === 'rev' ? L('Baum zurückdrehen', 'Turn the tree back')[ctx.lang] : L('Baum umkehren', 'Reverse the tree')[ctx.lang] });
    }

    function syncNumbers(snap: boolean): void {
      const s = setup();
      const pv = ppv(s);
      const nv = npv(s);
      const set = (gl: Glide, v: number, delay = 0) => (snap ? gl.snap(v) : gl.go(v, 700, delay));
      const d = stageT0 > now - 100 ? STAGE.test : 0;
      for (const r of ROLES) set(gc[r], counts[r], d);
      set(gSick, counts.sick, stageT0 > now - 100 ? STAGE.sick : 0);
      set(gPos, counts.pos, d);
      set(gPpv, Number.isFinite(pv) ? pv : 0, d);
      set(gNpv, Number.isFinite(nv) ? nv : 0, d);
    }

    // Start
    recomputeRoles();
    retargetPlaces(true);
    if (reduced) recolor(true);
    else stage(introT0);
    syncNumbers(reduced);
    if (!reduced) {
      // Zahlen zählen beim Einstieg hoch
      for (const r of ROLES) gc[r].snap(0);
      gSick.snap(0);
      gPos.snap(0);
      gPpv.snap(0);
      gNpv.snap(0);
      stageT0 = introT0;
      syncNumbers(false);
    }
    updateReadouts();

    function render(): void {
      now = performance.now();
      processQueues();
      if (p.view !== viewShown) {
        viewShown = p.view;
        gView.snap(0);
        gView.go(1, 450);
        viewT0 = now;
      }
      surface.begin();
      const { main, col } = regions();
      card(main);
      drawHeader(main);
      const va = gView.at(now);
      if (p.view === 'icons') {
        drawIcons(va);
        drawLegend(va);
      } else drawTree(va);
      drawFacts(col);
      if (introT0 > 0 && now - introT0 > 1500) introT0 = -1;
      const busy =
        people.some((q) => q.queue.length > 0 || (q.pFrom !== null) || now - q.cT0 < COLOR_MS) ||
        [gFocus, gFlip, gView, gSick, gPos, gPpv, gNpv, ...ROLES.map((r) => gc[r])].some((x) => x.busy(now)) ||
        introT0 > 0 ||
        now - viewT0 < 1100 ||
        now - stageT0 < STAGE.end + 700;
      if (busy) ctx.requestRender();
    }

    return {
      update(changed, source) {
        now = performance.now();
        const snap = source === 'init';
        if (['prev', 'se', 'sp', 'n2'].some((k) => changed.has(k))) {
          recomputeRoles();
          focusCache = null;
          if (changed.has('n2') && !snap && !reduced && p.view === 'icons') {
            stage(now + 80);
            syncNumbers(false);
          } else {
            recolor(snap);
            syncNumbers(snap);
          }
        }
        if (changed.has('pos')) gFocus.go(p.pos ? 1 : 0, snap ? 0 : 800);
        if (changed.has('dir')) {
          if (snap) gFlip.snap(p.dir === 'rev' ? 1 : 0);
          else gFlip.go(p.dir === 'rev' ? 1 : 0, 1300);
        }
        if (changed.has('view') && source !== 'init') hoverRole = null;
        retargetPlaces(snap);
        syncActions();
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        now = performance.now();
        if (id === 'focus') ctx.set({ pos: !p.pos });
        else if (id === 'flip') ctx.set({ dir: p.dir === 'rev' ? 'fwd' : 'rev' });
        else if (id === 'replay' && !reduced) {
          ctx.set({ pos: false });
          stage(now + 50);
          for (const r of ROLES) gc[r].snap(0);
          gSick.snap(0);
          gPos.snap(0);
          syncNumbers(false);
        } else if (id === 'second') {
          if (secondTimer) clearTimeout(secondTimer);
          secondTimer = null;
          if (p.n2) ctx.set({ n2: false, pos: false });
          else if (p.view === 'icons' && !reduced && !p.pos) {
            // erst die positiv Getesteten sammeln, dann werden sie neu getestet
            ctx.set({ pos: true });
            secondTimer = setTimeout(() => {
              secondTimer = null;
              ctx.set({ n2: true, pos: false });
            }, 1700);
          } else ctx.set({ n2: true, pos: false });
        }
        ctx.requestRender();
      },
      render,
      destroy: () => {
        if (secondTimer) clearTimeout(secondTimer);
        surface.destroy();
      },
    };
  },
});
