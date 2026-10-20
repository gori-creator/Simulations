import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, TapTarget, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  classify,
  clampX,
  isCents,
  naiveGuess,
  ruleOfThree,
  scaleY,
  storyBase,
  TAB_IDS,
  TABLES,
  tableXs,
  value,
  X_MAX,
  type Kind,
  type Op,
  type Relation,
  type TabId,
  type Verdict,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Txt = { de: string; en: string };
type Lng = 'de' | 'en';
type Mode = Kind | 'test';
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

/** Ausgangswerte je Situation (beim Umschalten von Hand). */
const START: Record<Kind, { x0: number; x: number }> = {
  dir: { x0: 4, x: 7 },
  ind: { x0: 3, x: 4 },
  lin: { x0: 5, x: 10 },
};

/** Ein angezeigter Wert, der seinem Ziel weich folgt (exponentiell) oder in einem Übergang gleitet. */
class Chan {
  v: number;
  goal: number;
  private tau = 0;
  private tw: { from: number; to: number; t0: number; dur: number; e: (t: number) => number } | null = null;
  constructor(v: number) {
    this.v = v;
    this.goal = v;
  }
  jump(v: number): void {
    this.v = v;
    this.goal = v;
    this.tw = null;
  }
  follow(goal: number, tau: number): void {
    this.tw = null;
    this.goal = goal;
    this.tau = tau;
  }
  glide(goal: number, dur: number, delay: number, now: number, e: (t: number) => number = ease.inOutCubic): void {
    this.goal = goal;
    this.tw = { from: this.v, to: goal, t0: now + delay, dur: Math.max(1, dur), e };
  }
  /** Einen Schritt weiter; true, solange noch Bewegung ist. */
  step(now: number, dt: number): boolean {
    const tw = this.tw;
    if (tw) {
      const t = (now - tw.t0) / tw.dur;
      if (t >= 1) {
        this.v = tw.to;
        this.tw = null;
        return true;
      }
      this.v = lerp(tw.from, tw.to, tw.e(clamp01(t)));
      return true;
    }
    if (this.v === this.goal) return false;
    if (this.tau <= 0) {
      this.v = this.goal;
      return true;
    }
    this.v += (this.goal - this.v) * (1 - Math.exp(-dt / this.tau));
    if (Math.abs(this.goal - this.v) <= 1e-5 * (1 + Math.abs(this.goal))) this.v = this.goal;
    return true;
  }
}

/** Texte je Situation. */
const META: Record<Kind, { title: Txt; xAxis: Txt; yAxis: Txt }> = {
  dir: { title: L('Äpfel auf der Waage', 'Apples on the scales'), xAxis: L('Masse in kg', 'mass in kg'), yAxis: L('Preis in €', 'price in €') },
  ind: { title: L('Pumpen füllen ein Becken', 'Pumps fill a pool'), xAxis: L('Anzahl der Pumpen', 'number of pumps'), yAxis: L('Zeit in h', 'time in h') },
  lin: { title: L('Taxifahrt mit Grundgebühr', 'Taxi ride with a base fare'), xAxis: L('Strecke in km', 'distance in km'), yAxis: L('Preis in €', 'price in €') },
};

/** Texte der Testtabellen. */
const TAB_META: Record<TabId, { title: Txt; text: Txt; xAxis: Txt; yAxis: Txt; xh: Txt; yh: Txt }> = {
  a: {
    title: L('Eintrittskarten', 'Admission tickets'),
    text: L('Im Schwimmbad: Anzahl der Karten und Gesamtpreis.', 'At the swimming pool: number of tickets and total price.'),
    xAxis: L('Anzahl der Karten', 'number of tickets'),
    yAxis: L('Preis in €', 'price in €'),
    xh: L('Karten', 'tickets'),
    yh: L('€', '€'),
  },
  b: {
    title: L('Pizza teilen', 'Sharing pizza'),
    text: L('24 Pizzastücke werden gerecht verteilt: Personen und Stücke pro Person.', '24 slices of pizza are shared fairly: people and slices per person.'),
    xAxis: L('Anzahl der Personen', 'number of people'),
    yAxis: L('Stücke pro Person', 'slices per person'),
    xh: L('Personen', 'people'),
    yh: L('Stücke', 'slices'),
  },
  c: {
    title: L('Ohne Sachzusammenhang', 'Plain numbers'),
    text: L('Nur Zahlen: Gehört zum Doppelten das Doppelte?', 'Just numbers: does double go with double?'),
    xAxis: L('x', 'x'),
    yAxis: L('y', 'y'),
    xh: L('', ''),
    yh: L('', ''),
  },
  d: {
    title: L('Taxi', 'Taxi'),
    text: L('Fahrpreise für verschiedene Strecken – je weiter, desto teurer.', 'Fares for different distances – the further, the dearer.'),
    xAxis: L('Strecke in km', 'distance in km'),
    yAxis: L('Preis in €', 'price in €'),
    xh: L('km', 'km'),
    yh: L('€', '€'),
  },
  e: {
    title: L('Alter und Körpergröße', 'Age and height'),
    text: L('Ungefähre Durchschnittsgröße von Kindern – je älter, desto größer.', 'Approximate average height of children – the older, the taller.'),
    xAxis: L('Alter in Jahren', 'age in years'),
    yAxis: L('Größe in cm', 'height in cm'),
    xh: L('Jahre', 'years'),
    yh: L('cm', 'cm'),
  },
  f: {
    title: L('120 km Fahrt', 'A 120 km trip'),
    text: L('Dieselbe Strecke von 120 km: Geschwindigkeit und Fahrzeit.', 'The same 120 km trip: speed and travel time.'),
    xAxis: L('Geschwindigkeit in km/h', 'speed in km/h'),
    yAxis: L('Fahrzeit in h', 'travel time in h'),
    xh: L('km/h', 'km/h'),
    yh: L('h', 'h'),
  },
};

const VERDICT_NAME: Record<Verdict, Txt> = {
  dir: L('direkt proportional', 'directly proportional'),
  ind: L('indirekt proportional', 'inversely proportional'),
  none: L('weder noch', 'neither'),
};
const VERDICTS: Verdict[] = ['dir', 'ind', 'none'];

/**
 * Direkte und indirekte Proportionalität (Jahrgangsstufen 6–8) in drei
 * synchronen Darstellungen mit gleicher Farbcodierung: gezeichnete
 * Sachsituation (Äpfel auf einer preisrechnenden Waage, Pumpen mit Becken und
 * Stoppuhr, Taxi mit Taxameter), waagerechte Wertetabelle mit Pfeilen
 * („·2 → ·2“ bzw. „·2 → :2“) und Graph (Ursprungsgerade mit
 * Steigungsdreiecken, Hyperbelast mit Rechtecken gleicher Fläche, Gerade mit
 * Grundgebühr). Hauptanimation „Verdoppeln“, Dreisatz Schritt für Schritt
 * (gleiche Richtung / Gegenrichtung, beim Taxi die Falle) und ein Test
 * „Ist das proportional?“ mit sechs Tabellen.
 */
export default defineSimulation({
  id: 'proportional',
  dragHint: true,
  layout: { aspect: 1.2, aspectNarrow: 0.34 },
  groups: [
    { id: 'val', label: L('Werte', 'Values') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'kind',
      type: 'choice',
      label: L('Situation', 'Situation'),
      options: [
        { value: 'dir', label: L('direkt proportional: Äpfel', 'directly proportional: apples') },
        { value: 'ind', label: L('indirekt proportional: Pumpen', 'inversely proportional: pumps') },
        { value: 'lin', label: L('weder noch: Taxi', 'neither: taxi') },
        { value: 'test', label: L('Test: Ist das proportional?', 'Test: is it proportional?') },
      ],
      default: 'dir',
    },
    {
      key: 'tab',
      type: 'choice',
      label: L('Wertetabelle', 'Table of values'),
      options: [
        { value: 'a', label: L('Eintrittskarten', 'Admission tickets') },
        { value: 'b', label: L('Pizza teilen', 'Sharing pizza') },
        { value: 'c', label: L('Nur Zahlen', 'Plain numbers') },
        { value: 'd', label: L('Taxi', 'Taxi') },
        { value: 'e', label: L('Alter und Größe', 'Age and height') },
        { value: 'f', label: L('120 km Fahrt', 'A 120 km trip') },
      ],
      default: 'a',
      visibleIf: (v) => v.kind === 'test',
    },
    { key: 'kd', type: 'number', group: 'val', label: L('Preis pro kg', 'Price per kg'), min: 0.5, max: 5, step: 0.1, default: 2.5, unit: '€', visibleIf: (v) => v.kind === 'dir' },
    { key: 'ki', type: 'number', group: 'val', label: L('Zeit mit einer Pumpe', 'Time with one pump'), min: 6, max: 60, step: 1, default: 12, unit: 'h', visibleIf: (v) => v.kind === 'ind' },
    { key: 'kt', type: 'number', group: 'val', label: L('Preis pro km', 'Price per km'), min: 0.5, max: 4, step: 0.1, default: 2, unit: '€', visibleIf: (v) => v.kind === 'lin' },
    { key: 'b', type: 'number', group: 'val', label: L('Grundgebühr', 'Base fare'), min: 1, max: 6, step: 0.5, default: 3, unit: '€', visibleIf: (v) => v.kind === 'lin' },
    {
      key: 'x0',
      type: 'number',
      group: 'val',
      label: L('bekannte Menge x₀', 'Known amount x₀'),
      help: L('Erste Zeile des Dreisatzes; von hier aus wird verdoppelt.', 'First line of the rule of three; doubling starts here.'),
      min: 0.5,
      max: 12,
      step: 0.5,
      default: 4,
      visibleIf: (v) => v.kind !== 'test',
    },
    {
      key: 'x',
      type: 'number',
      group: 'val',
      label: L('gesuchte Menge x (Punkt P)', 'Wanted amount x (point P)'),
      help: L('Auch P auf dem Graphen ziehen oder eine Spalte der Tabelle antippen.', 'You can also drag P along the graph or tap a column of the table.'),
      min: 0.5,
      max: 12,
      step: 0.5,
      default: 7,
      visibleIf: (v) => v.kind !== 'test',
    },
    {
      key: 'rect',
      type: 'boolean',
      group: 'view',
      label: L('Hilfsfiguren im Graphen', 'Helper shapes in the graph'),
      help: L('Steigungsdreiecke (direkt), Rechtecke gleicher Fläche (indirekt), Strahlen vom Ursprung (Taxi).', 'Slope triangles (direct), rectangles of equal area (inverse), rays from the origin (taxi).'),
      default: true,
    },
    { key: 'show', type: 'boolean', group: 'view', label: L('Lösung zeigen', 'Show the solution'), help: L('Aus: Gesuchte Werte erscheinen als „?“ – im Bild, in der Tabelle und in den Karten.', 'Off: unknown values appear as “?” – in the picture, the table and the cards.'), default: true },
  ],
  actions: [
    { id: 'double', label: L('Verdoppeln', 'Double it'), primary: true, visibleIf: (v) => v.kind !== 'test' },
    { id: 'steps', label: L('Dreisatz Schritt für Schritt', 'Rule of three step by step'), visibleIf: (v) => v.kind !== 'test' },
    { id: 'check', label: L('Tabelle prüfen', 'Check the table'), primary: true, visibleIf: (v) => v.kind === 'test' },
    { id: 'next', label: L('Nächste Tabelle', 'Next table'), visibleIf: (v) => v.kind === 'test' },
  ],
  readouts: [
    { key: 'rule', label: L('Zuordnungsvorschrift', 'Rule'), spoiler: true },
    { key: 'calc', label: L('Dreisatz', 'Rule of three'), spoiler: true },
    { key: 'test', label: L('Kennzeichen', 'Test'), spoiler: true },
    { key: 'dbl', label: L('Verdoppeln', 'Doubling'), spoiler: true },
  ],
  presets: [
    { id: 'apples', label: L('Äpfel: 4 kg kosten 10 €', 'Apples: 4 kg cost €10'), values: {} },
    { id: 'pumps', label: L('Pumpen: 3 Pumpen brauchen 4 h', 'Pumps: 3 pumps take 4 h'), values: { kind: 'ind', ki: 12, x0: 3, x: 4 } },
    { id: 'pool', label: L('Becken: 6 Pumpen brauchen 10 h', 'Pool: 6 pumps take 10 h'), values: { kind: 'ind', ki: 60, x0: 6, x: 4 } },
    { id: 'taxi', label: L('Taxi-Falle: 5 km kosten 13 €', 'Taxi trap: 5 km cost €13'), values: { kind: 'lin', kt: 2, b: 3, x0: 5, x: 10 } },
    { id: 'test', label: L('Test: Pizza teilen', 'Test: sharing pizza'), values: { kind: 'test', tab: 'b', show: false } },
    { id: 'age', label: L('Test-Falle: Alter und Größe', 'Test trap: age and height'), values: { kind: 'test', tab: 'e', show: false } },
  ],
  strings: {
    de: {
      canvas:
        'Oben eine gezeichnete Sachsituation mit Frage: Äpfel auf einer preisrechnenden Waage, Pumpen, die ein Becken füllen, mit Stoppuhr, oder ein Taxi mit Taxameter. Darunter links der Graph der Zuordnung mit ziehbarem Punkt P (Ursprungsgerade, Hyperbelast oder Gerade mit Grundgebühr), rechts die Wertetabelle mit Pfeilen für das Verdoppeln, der Dreisatz Schritt für Schritt und eine Merke-Karte. Im Test wird eine Wertetabelle auf gleiche Quotienten und gleiche Produkte geprüft.',
    },
    en: {
      canvas:
        'At the top a drawn situation with a question: apples on price-computing scales, pumps filling a pool with a stopwatch, or a taxi with a taximeter. Below on the left the graph of the relation with a draggable point P (line through the origin, branch of a hyperbola or a line with a base fare), on the right the table of values with arrows for doubling, the rule of three step by step and a key-fact card. In the test a table of values is checked for equal quotients and equal products.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const pr = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const reduced = () => prefersReducedMotion();
    const lang = ctx.lang as Lng;
    const say = (s: Txt) => s[lang];
    const mode = () => pr.kind as Mode;
    const isTest = () => mode() === 'test';
    /** Art der Zuordnung (im Test nur als Platzhalter „dir“). */
    const kind = (): Kind => (isTest() ? 'dir' : (pr.kind as Kind));
    const tab = () => pr.tab as TabId;
    const kOf = (kk: Kind) => (kk === 'dir' ? pr.kd : kk === 'ind' ? pr.ki : pr.kt);
    const rel = (): Relation => ({ kind: kind(), k: kOf(kind()), b: pr.b });
    const xP = () => clampX(kind(), pr.x);
    const x0P = () => clampX(kind(), pr.x0);
    const show = () => pr.show;

    /* ---------- Farben: gleiche Größe = gleiche Farbe ---------- */
    const col = {
      x: () => th().series[0]!,
      y: () => th().series[4]!,
      k: () => th().series[3]!,
      g: () => th().series[5]!,
      ok: () => th().series[2]!,
      bad: () => th().series[1]!,
    };
    const verdictCol = (v: Verdict) => (v === 'dir' ? col.ok() : v === 'ind' ? col.k() : col.bad());

    /* ---------- Zahlen und Einheiten ---------- */
    const money = (kk: Kind = kind()) => kk !== 'ind';
    /** x-Wert ohne Einheit. */
    const nx = (v: number) => fmt.num(Math.round(v * 100) / 100, 2);
    /** y-Wert ohne Einheit: Geld mit Cent (glatte Euro ohne), Zeit bis 2 Stellen. */
    function ny(v: number, kk: Kind = kind()): string {
      if (!Number.isFinite(v)) return '–';
      const r = Math.round(v * 100) / 100;
      if (money(kk)) return Math.abs(r - Math.round(r)) < 1e-9 ? fmt.num(r, 0) : fmt.fixed(r, 2);
      return fmt.num(r, 2);
    }
    const eur = (s: string) => (lang === 'de' ? `${s} €` : `€${s}`);
    /** x mit Einheit. */
    function xu(v: number, kk: Kind = kind()): string {
      if (kk === 'dir') return `${nx(v)} kg`;
      if (kk === 'ind') return `${nx(v)} ${Math.abs(v - 1) < 1e-9 ? say(L('Pumpe', 'pump')) : say(L('Pumpen', 'pumps'))}`;
      return `${nx(v)} km`;
    }
    /** y mit Einheit; „≈“, wenn nicht exakt auf Hundertstel. */
    function yu(v: number, kk: Kind = kind(), approx = true): string {
      if (!Number.isFinite(v)) return '–';
      const a = approx && !isCents(v) ? '≈ ' : '';
      if (money(kk)) return `${a}${eur(ny(v, kk))}`;
      return `${a}${ny(v, kk)} h`;
    }
    /** Stunden als „3 h 30 min“. */
    function hm(v: number): string {
      const tot = Math.round(v * 60);
      const h = Math.floor(tot / 60);
      const m = tot - h * 60;
      return m === 0 ? `${h} h` : `${h} h ${m} min`;
    }

    /* ---------- angezeigter Zustand ---------- */
    const X = new Chan(xP());
    const K = new Chan(kOf(kind()));
    const B = new Chan(pr.b);
    const RECT = new Chan(pr.rect ? 1 : 0);
    function rangeGoal(): [number, number] {
      if (isTest()) {
        const pts = TABLES[tab()];
        const xm = Math.max(...pts.map(([x]) => x));
        const ym = Math.max(...pts.map(([, y]) => y));
        return [xm * 1.14, ym * 1.2];
      }
      const kk = kind();
      const k = kOf(kk);
      const xm = X_MAX[kk] + 0.6;
      if (kk === 'dir') return [xm, Math.max(4, k * xm) * 1.08];
      if (kk === 'ind') return [xm, k * 1.12];
      return [xm, (k * xm + 2 * pr.b) * 1.05];
    }
    const XM = new Chan(rangeGoal()[0]);
    const YM = new Chan(rangeGoal()[1]);
    const shownRel = (): Relation => ({ kind: kind(), k: K.v, b: B.v });

    let intro: number | null = null;
    let sceneFade: number | null = null;
    let cardFade: number | null = null;
    let tableFade: number | null = null;
    let graphFade: { t0: number; from: Relation | null } | null = null;
    let story: { t0: number; u: number; fs: number[]; startX: number } | null = null;
    let steps: { t0: number } | null = null;
    let chk: { t0: number; n: number } | null = null;
    let fill: { t0: number; dur: number } | null = null;
    let guess: Verdict | null = null;
    let hoverId: string | null = null;
    let lastTime = performance.now();
    let lastDrag = -Infinity;
    let prevMode: Mode = mode();
    let prevRel: Relation = rel();
    const dragging = () => performance.now() - lastDrag < 250;

    /* ---------- Aufteilung ---------- */
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const sm = () => surface.width < 560;
    const fs = (big: number, small: number) => (sm() ? small : big);
    const roomy = () => isWide() && surface.height >= 600;
    function regions(): { scene: Rect; graph: Rect; col: Rect; wide: boolean } {
      const w = surface.width;
      const h = surface.height;
      const gap = 10;
      if (isWide()) {
        const sh = Math.round(clamp(h * 0.29, 128, 196));
        const cw = Math.round(clamp(w * 0.43, 250, 440));
        const lw = w - cw - gap;
        const y1 = sh + gap;
        return { scene: { x: 0, y: 0, w, h: sh }, graph: { x: 0, y: y1, w: lw, h: h - y1 }, col: { x: lw + gap, y: y1, w: cw, h: h - y1 }, wide: true };
      }
      const sh = phoneSceneH();
      const gh = Math.round(clamp(w * 0.86, 260, 380));
      const y2 = sh + gap + gh + gap;
      return { scene: { x: 0, y: 0, w, h: sh }, graph: { x: 0, y: sh + gap, w, h: gh }, col: { x: 0, y: y2, w, h: h - y2 }, wide: false };
    }
    function phoneSceneH(): number {
      const lines = wrapText(question(), surface.width - 24, `600 ${13}px ${th().font}`).length;
      return Math.round(10 + 122 + 10 + Math.min(5, lines) * 13 * 1.32 + 14);
    }

    const plot = new Plot(surface, { x: [0, 10], y: [0, 10], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().graph });

    /* ---------- Formeln ---------- */
    const palette = (): Record<string, string> => ({ x: col.x(), y: col.y(), k: col.k(), g: col.g(), ok: col.ok(), bad: col.bad(), m: th().muted });
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({ size, font: th().font, mathFont: th().mathFont, color, weight, palette: palette() });
    function fit(src: string, maxW: number, size: number, color = th().text, weight = 600): FormulaBox {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > 10.5) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }
    /** Wörter aufrecht setzen (einzelne Buchstaben würden sonst kursiv). */
    const up = (s: string) => `\\t{${s}}`;
    /** Einheit für die Formel-Kurzschrift (h aufrecht). */
    const uf = (s: string) => s.replace(/(^|\s)h(\s|$)/g, '$1\\t{h}$2').replace(/(\d) h\b/g, '$1 \\t{h}');

    /* ---------- Zeichenhilfen ---------- */
    function card(r: Rect, accent?: string): void {
      const g = surface.g;
      const theme = th();
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
      g.fill();
      g.restore();
      if (accent) {
        const grad = g.createLinearGradient(r.x, r.y, r.x, r.y + Math.min(80, r.h));
        grad.addColorStop(0, withAlpha(accent, theme.dark ? 0.14 : 0.08));
        grad.addColorStop(1, withAlpha(accent, 0));
        g.fillStyle = grad;
        roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
        g.fill();
      }
      g.strokeStyle = theme.dark ? '#273142' : '#e1e6ee';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 12);
      g.stroke();
    }

    function cardTitle(R: Rect, title: string, color: string, right?: string): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const ty = R.y + pad + 7;
      g.fillStyle = color;
      g.beginPath();
      g.arc(R.x + pad + 4.5, ty, 4.5, 0, TAU);
      g.fill();
      let tsz = fs(13.5, 12.5);
      const rb = right ? fit(right, R.w * 0.5, fs(12.5, 11.5), color, 700) : null;
      const room0 = R.w - 2 * pad - 15 - (rb ? rb.w + 10 : 0);
      g.font = `750 ${tsz}px ${th().font}`;
      while (g.measureText(title).width > room0 && tsz > 11) {
        tsz -= 0.5;
        g.font = `750 ${tsz}px ${th().font}`;
      }
      let shown = title;
      while (g.measureText(shown).width > room0 && shown.length > 4) shown = `${shown.slice(0, -2).trimEnd()}…`;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = th().text;
      g.fillText(shown, R.x + pad + 15, ty);
      if (rb) rb.draw(g, R.x + R.w - pad - rb.w, ty + (rb.asc - rb.desc) / 2);
      return ty;
    }

    function wrapText(str: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const lines: string[] = [];
      for (const para of str.split('\n')) {
        let cur = '';
        // geschützte Leerzeichen: „10 €“, „4 kg“, „3 h“ nicht trennen
        for (const w of para.replace(/(\d) (€|kg|km|h|min|Pumpen|Pumpe|pumps|pump)\b/g, '$1 $2').replace(/(\d) €/g, '$1 €').split(' ')) {
          const test = cur ? `${cur} ${w}` : w;
          if (g.measureText(test).width > maxW && cur) {
            lines.push(cur);
            cur = w;
          } else cur = test;
        }
        if (cur) lines.push(cur);
      }
      return lines;
    }

    function label(str: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'center', halo = false): void {
      const g = surface.g;
      g.font = font;
      g.textAlign = align;
      g.textBaseline = 'middle';
      if (halo) {
        g.lineWidth = 4;
        g.lineJoin = 'round';
        g.strokeStyle = th().dark ? 'rgba(14,19,27,0.92)' : 'rgba(255,255,255,0.95)';
        g.strokeText(str, x, y);
      }
      g.fillStyle = color;
      g.fillText(str, x, y);
    }

    /** Formel-Pille (Hintergrund, Rand) um den Mittelpunkt (x, y); an `bounds` geklemmt. */
    function fpill(x: number, y: number, src: string, opts: { color?: string; border?: string; size?: number; alpha?: number; bounds?: Rect; scale?: number; fill?: string } = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? fs(13, 12);
      const box = formula(g, src, fstyle(size, opts.color ?? th().text, 700));
      let left = x - box.w / 2;
      let yy = y;
      if (opts.bounds) {
        left = clamp(left, opts.bounds.x + 9, opts.bounds.x + opts.bounds.w - box.w - 9);
        yy = clamp(y, opts.bounds.y + box.asc + 6, opts.bounds.y + opts.bounds.h - box.desc - 6);
      }
      const base = yy + (box.asc - box.desc) / 2;
      const rr = { x: left - 8, y: base - box.asc - 4, w: box.w + 16, h: box.asc + box.desc + 8 };
      const a = opts.alpha ?? 1;
      if (a <= 0.01) return rr;
      g.save();
      g.globalAlpha *= a;
      const sc = opts.scale ?? 1;
      if (sc !== 1) {
        const cx = rr.x + rr.w / 2;
        g.translate(cx, yy);
        g.scale(sc, sc);
        g.translate(-cx, -yy);
      }
      g.save();
      g.fillStyle = opts.fill ?? (th().dark ? 'rgba(15,20,30,0.95)' : 'rgba(255,255,255,0.97)');
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 7;
      g.shadowOffsetY = 2;
      roundRect(g, rr.x, rr.y, rr.w, rr.h, Math.min(11, rr.h / 2));
      g.fill();
      g.restore();
      if (opts.border) {
        g.strokeStyle = opts.border;
        g.lineWidth = 1.4;
        roundRect(g, rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1, Math.min(11, rr.h / 2));
        g.stroke();
      }
      box.draw(g, left, base);
      g.restore();
      return rr;
    }

    /** Gebogener Pfeil von xa nach xb auf Höhe y; dir = −1: Bogen nach oben, 1: nach unten. */
    function arcArrow(xa: number, xb: number, y: number, dir: -1 | 1, height: number, color: string, prog: number, alpha = 1): { x: number; y: number } {
      const g = surface.g;
      const cx = (xa + xb) / 2;
      const cy = y + dir * height * 2;
      const apex = { x: cx, y: y + dir * height };
      if (prog <= 0.001 || alpha <= 0.01) return apex;
      const P = (t: number): [number, number] => [(1 - t) * (1 - t) * xa + 2 * (1 - t) * t * cx + t * t * xb, (1 - t) * (1 - t) * y + 2 * (1 - t) * t * cy + t * t * y];
      g.save();
      g.globalAlpha *= alpha;
      g.strokeStyle = color;
      g.fillStyle = color;
      g.lineWidth = 1.6;
      g.lineCap = 'round';
      g.beginPath();
      const n = 24;
      for (let i = 0; i <= n; i++) {
        const [px, py] = P((i / n) * prog);
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.stroke();
      if (prog > 0.85) {
        const [ex, ey] = P(prog);
        const [bx, by] = P(prog - 0.08);
        const an = Math.atan2(ey - by, ex - bx);
        g.beginPath();
        g.moveTo(ex, ey);
        g.lineTo(ex - Math.cos(an - 0.45) * 7, ey - Math.sin(an - 0.45) * 7);
        g.lineTo(ex - Math.cos(an + 0.45) * 7, ey - Math.sin(an + 0.45) * 7);
        g.closePath();
        g.fill();
      }
      g.restore();
      return apex;
    }

    /** Senkrechter Bogenpfeil zwischen zwei Zeilen (Dreisatz), side −1 links, 1 rechts. */
    function sideArrow(x: number, yA: number, yB: number, side: -1 | 1, color: string, text: string, alpha: number): void {
      if (alpha <= 0.01) return;
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      g.strokeStyle = color;
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(x, yA);
      g.quadraticCurveTo(x + side * 11, (yA + yB) / 2, x, yB);
      g.stroke();
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(x, yB + 1);
      g.lineTo(x + side * 4.5, yB - 5);
      g.lineTo(x - side * 2.5, yB - 5.5);
      g.closePath();
      g.fill();
      const box = formula(g, text, fstyle(fs(12.5, 11.5), color, 750));
      const tx = side < 0 ? x - 14 - box.w : x + 14;
      box.draw(g, tx, (yA + yB) / 2 + (box.asc - box.desc) / 2);
      g.restore();
    }

    const opS = (o: Op) => `${o.op} ${nx(o.f)}`;

    /* =====================================================================
     * Zeitpläne: Einstieg, Verdoppeln, Dreisatz, Prüfen
     * ===================================================================== */
    interface Intro {
      panel: number;
      reveal: number;
      labels: number;
      cards: number;
      stagger: number;
      scene: number;
    }
    const DONE: Intro = { panel: 1, reveal: 1, labels: 1, cards: 1, stagger: 1, scene: 1 };
    function introState(now: number): Intro {
      if (intro === null) return DONE;
      const t = now - intro;
      if (t > 3000) {
        intro = null;
        return DONE;
      }
      return {
        panel: ease.outCubic(clamp01(t / 450)),
        reveal: ease.inOutCubic(clamp01((t - 250) / 1100)),
        labels: ease.outCubic(clamp01((t - 1000) / 600)),
        cards: clamp01((t - 400) / 900),
        stagger: clamp01((t - 800) / 1500),
        scene: ease.outBack(clamp01((t - 150) / 650)),
      };
    }

    const ST_PRE = 700;
    const ST_STEP = 2400;
    const ST_HOLD = 1500;
    const ST_BACK = 900;
    const storyLen = (s: NonNullable<typeof story>) => ST_PRE + (s.fs.length - 1) * ST_STEP + ST_HOLD + ST_BACK;
    interface StoryK {
      on: boolean;
      /** gezeigtes x */
      x: number;
      /** Pfeile je Faktor (Index wie fs): oben, unten */
      arcs: { top: number; bot: number }[];
      /** Ausblenden am Ende */
      out: number;
      /** erreichter Faktor-Index */
      at: number;
    }
    function storyK(now: number): StoryK {
      if (!story) return { on: false, x: X.v, arcs: [], out: 1, at: 0 };
      const s = story;
      const t = now - s.t0;
      const u = s.u;
      const n = s.fs.length;
      const backStart = ST_PRE + (n - 1) * ST_STEP + ST_HOLD;
      let x: number;
      let at = 0;
      if (t < ST_PRE) x = lerp(s.startX, u, ease.inOutCubic(clamp01(t / ST_PRE)));
      else if (t < backStart) {
        const i = Math.min(n - 1, Math.floor((t - ST_PRE) / ST_STEP) + 1);
        const si = ST_PRE + (i - 1) * ST_STEP;
        const m = ease.inOutCubic(clamp01((t - si) / 1000));
        x = lerp(s.fs[i - 1]! * u, s.fs[i]! * u, m);
        at = m >= 1 ? i : i - 1;
      } else {
        x = lerp(s.fs[n - 1]! * u, xP(), ease.inOutCubic(clamp01((t - backStart) / ST_BACK)));
        at = n - 1;
      }
      const arcs = s.fs.map((_, i) => {
        if (i === 0) return { top: 0, bot: 0 };
        const si = ST_PRE + (i - 1) * ST_STEP;
        return { top: clamp01((t - si) / 600), bot: clamp01((t - si - 750) / 600) };
      });
      return { on: true, x, arcs, out: 1 - clamp01((t - backStart) / ST_BACK), at };
    }

    /** Dreisatz: Einblenden der Zeilen (0–2), Pfeile (0–1), Formel; Fokus im Graphen. */
    interface StepsK {
      on: boolean;
      row: [number, number, number];
      arr: [number, number];
      res: number;
      focus: number;
    }
    function stepsK(now: number, k: Intro): StepsK {
      if (!steps) {
        const a = (i: number) => clamp01(k.stagger * 5 - i);
        return { on: false, row: [a(0), a(1.5), a(3)], arr: [a(1), a(2.5)], res: a(3.5), focus: -1 };
      }
      const t = now - steps.t0;
      const e = (t0: number, d = 450) => ease.outCubic(clamp01((t - t0) / d));
      return { on: true, row: [e(0), e(1300), e(2800)], arr: [e(800, 500), e(2300, 500)], res: e(3600, 500), focus: t < 1300 ? 0 : t < 2800 ? 1 : 2 };
    }
    const STEPS_LEN = 6500;

    /** Prüfen im Test: Zellen erscheinen nacheinander. */
    const CK_CELL = 420;
    function chkTimes(n: number): { q0: number; qEnd: number; p0: number; pEnd: number; verdict: number; end: number } {
      const q0 = 300;
      const qEnd = q0 + n * CK_CELL + 150;
      const p0 = qEnd + 500;
      const pEnd = p0 + n * CK_CELL + 150;
      const verdict = pEnd + 500;
      return { q0, qEnd, p0, pEnd, verdict, end: verdict + 2500 };
    }
    interface ChkK {
      on: boolean;
      q: (i: number) => number;
      p: (i: number) => number;
      qMark: number;
      pMark: number;
      verdict: number;
    }
    function chkK(now: number): ChkK {
      if (!chk) {
        const v = show() ? 1 : 0;
        return { on: false, q: () => v, p: () => v, qMark: v, pMark: v, verdict: v };
      }
      const t = now - chk.t0;
      const T = chkTimes(chk.n);
      return {
        on: true,
        q: (i) => ease.outBack(clamp01((t - T.q0 - i * CK_CELL) / 380)),
        p: (i) => ease.outBack(clamp01((t - T.p0 - i * CK_CELL) / 380)),
        qMark: ease.outBack(clamp01((t - T.qEnd) / 400)),
        pMark: ease.outBack(clamp01((t - T.pEnd) / 400)),
        verdict: ease.outBack(clamp01((t - T.verdict) / 550)),
      };
    }

    /** Becken füllt sich (Einstieg, Verdoppeln): Anteil 0…1. */
    function fillK(now: number): number {
      if (!fill) return 1;
      return clamp01((now - fill.t0) / fill.dur);
    }
    function startFill(now: number, delay = 0): void {
      if (reduced() || kind() !== 'ind' || isTest()) {
        fill = null;
        return;
      }
      const y = value(rel(), storyK(now + delay).x);
      fill = { t0: now + delay, dur: clamp(y * 110, 380, 3200) };
    }

    /* =====================================================================
     * Sachsituation
     * ===================================================================== */
    function question(): string {
      if (isTest()) return say(TAB_META[tab()].text);
      const kk = kind();
      const r = rel();
      const x0 = x0P();
      const x = xP();
      const y0 = value(r, x0);
      if (kk === 'dir') return say(L(`${xu(x0)} Äpfel kosten ${yu(y0)}. Wie viel kosten ${xu(x)}?`, `${xu(x0)} of apples cost ${yu(y0)}. How much do ${xu(x)} cost?`));
      if (kk === 'ind') {
        const one = Math.abs(x0 - 1) < 1e-9;
        const de = `${xu(x0)} ${one ? 'füllt' : 'füllen'} das Becken in ${yu(y0)}. Wie lange ${Math.abs(x - 1) < 1e-9 ? 'braucht' : 'brauchen'} ${xu(x)}?`;
        const en = `${xu(x0)} ${one ? 'fills' : 'fill'} the pool in ${yu(y0)}. How long ${Math.abs(x - 1) < 1e-9 ? 'does' : 'do'} ${xu(x)} take?`;
        return say(L(de, en));
      }
      return say(L(`Grundgebühr ${yu(r.b)}, dazu ${yu(r.k)} pro km: ${xu(x0)} kosten ${yu(y0)}. Was kosten ${xu(x)}?`, `Base fare ${yu(r.b)} plus ${yu(r.k)} per km: ${xu(x0)} cost ${yu(y0)}. What do ${xu(x)} cost?`));
    }

    let chipHit: { v: Verdict; r: Rect }[] = [];

    function drawScene(R: Rect, k: Intro, now: number): void {
      const g = surface.g;
      const phone = !regions().wide;
      card(R, isTest() ? col.k() : sceneAccent());
      const pad = fs(14, 10);
      const illW = Math.round(phone ? R.w * 0.5 : clamp(R.w * 0.36, 170, 300));
      const ill: Rect = phone ? { x: R.x + pad, y: R.y + 9, w: illW, h: 122 } : { x: R.x + pad, y: R.y + 8, w: illW, h: R.h - 16 };
      let pop = k.scene;
      if (sceneFade !== null) pop = Math.min(pop, ease.outBack(clamp01((now - sceneFade) / 600)));
      g.save();
      g.globalAlpha *= clamp01(pop * 1.5);
      const cx = ill.x + ill.w / 2;
      const cy = ill.y + ill.h / 2;
      const sc = 0.84 + 0.16 * pop;
      g.translate(cx, cy);
      g.scale(sc, sc);
      g.translate(-cx, -cy);
      const st = storyK(now);
      const xs = st.on ? st.x : X.v;
      const r = shownRel();
      if (isTest()) drawBadge(ill);
      else if (kind() === 'dir') drawScale(ill, xs, value(r, xs), r.k);
      else if (kind() === 'ind') drawPool(ill, xs, value(r, xs), now);
      else drawTaxi(ill, xs, r);
      g.restore();
      // Text: Titel, Frage, farbige Kärtchen
      const fade = sceneFade !== null ? ease.outCubic(clamp01((now - sceneFade - 100) / 500)) : 1;
      g.save();
      g.globalAlpha *= fade * clamp01(k.scene * 1.4);
      const tx = ill.x + ill.w + fs(20, 12);
      const tw = R.x + R.w - pad - tx;
      const tsz = fs(12, 11);
      const tFont = `750 ${tsz}px ${th().font}`;
      const title = isTest() ? say(L('Ist das proportional?', 'Is it proportional?')) : say(META[kind()].title);
      const titleLines = wrapText(title.toUpperCase(), tw, tFont);
      const accent = isTest() ? col.k() : sceneAccent();
      titleLines.slice(0, 2).forEach((ln, i) => label(ln, tx, R.y + pad + 6 + i * (tsz + 3), tFont, accent, 'left'));
      const titleBottom = R.y + pad + 6 + (Math.min(2, titleLines.length) - 1) * (tsz + 3) + tsz;
      const qx = phone ? R.x + pad : tx;
      const qw = phone ? R.w - 2 * pad : tw;
      const qText = isTest() ? `${say(TAB_META[tab()].title)}: ${question()}` : question();
      let qsz = phone ? 13 : roomy() ? 16 : 14;
      let lines = wrapText(qText, qw, `600 ${qsz}px ${th().font}`);
      const chipRoom = 34;
      const tooTall = () => !phone && titleBottom + 6 + lines.length * qsz * 1.32 + chipRoom > R.y + R.h - 4;
      while ((lines.length > (phone ? 5 : 3) || tooTall()) && qsz > 11.5) {
        qsz -= 0.5;
        lines = wrapText(qText, qw, `600 ${qsz}px ${th().font}`);
      }
      const lh = qsz * 1.32;
      const y0 = phone ? ill.y + ill.h + 10 + lh / 2 : titleBottom + 6 + lh / 2;
      lines.forEach((ln, i) => label(ln, qx, y0 + i * lh, `600 ${qsz}px ${th().font}`, th().text, 'left'));
      // Kärtchen
      const chipSz = fs(roomy() ? 13 : 12.5, 11.5);
      chipHit = [];
      if (isTest()) {
        drawVerdictChips(tx, phone ? titleBottom + 18 : Math.min(R.y + R.h - 18, y0 + (lines.length - 0.5) * lh + 19), tw, chipSz, phone, now);
      } else {
        const chips = sceneChips();
        if (phone) {
          let cyy = titleBottom + 17;
          for (const ch of chips) {
            const box = formula(g, ch.src, fstyle(chipSz, ch.c, 700));
            if (cyy > ill.y + ill.h - 6) break;
            fpill(tx + box.w / 2 + 8, cyy, ch.src, { color: ch.c, border: withAlpha(ch.c, ch.unknown ? 1 : 0.5), size: chipSz, fill: ch.unknown ? mixColor(ch.c, th().dark ? '#151c27' : '#ffffff', 0.85) : undefined });
            cyy += 25;
          }
        } else {
          let cxx = tx;
          const py = Math.min(R.y + R.h - 17, y0 + (lines.length - 0.5) * lh + 19);
          for (const ch of chips) {
            const box = formula(g, ch.src, fstyle(chipSz, ch.c, 700));
            if (cxx + box.w + 16 > R.x + R.w - pad) break;
            fpill(cxx + box.w / 2 + 8, py, ch.src, { color: ch.c, border: withAlpha(ch.c, ch.unknown ? 1 : 0.5), size: chipSz, fill: ch.unknown ? mixColor(ch.c, th().dark ? '#151c27' : '#ffffff', 0.85) : undefined });
            cxx += box.w + 16 + 8;
          }
        }
      }
      g.restore();
    }

    function sceneAccent(): string {
      const kk = kind();
      return kk === 'dir' ? col.ok() : kk === 'ind' ? col.x() : col.bad();
    }

    function sceneChips(): { src: string; c: string; unknown: boolean }[] {
      const kk = kind();
      const r = rel();
      const x = xP();
      const y = value(r, x);
      const hide = !show();
      const xs = `\\c{x}{x = ${uf(xu(x))}}`;
      const ys = `\\c{y}{y = ${hide ? '?' : uf(yu(y))}}`;
      if (kk === 'dir') return [{ src: xs, c: col.x(), unknown: false }, { src: ys, c: col.y(), unknown: hide }, { src: `\\c{k}{k = ${hide ? '?' : `${ny(r.k)} €/kg`}}`, c: col.k(), unknown: hide }];
      if (kk === 'ind') return [{ src: xs, c: col.x(), unknown: false }, { src: ys, c: col.y(), unknown: hide }, { src: `\\c{k}{x · y = ${hide ? '?' : uf(`${nx(r.k)} h`)}}`, c: col.k(), unknown: hide }];
      return [{ src: xs, c: col.x(), unknown: false }, { src: ys, c: col.y(), unknown: hide }, { src: `\\c{bad}{${up(say(L('Grundgebühr', 'base fare')))} ${uf(yu(r.b))}}`, c: col.bad(), unknown: false }];
    }

    /** Im Test: drei Kärtchen zum Tippen (Vermutung), nach dem Prüfen mit Ergebnis. */
    function drawVerdictChips(x: number, y: number, w: number, size: number, phone: boolean, now: number): void {
      const g = surface.g;
      const cls = classify(TABLES[tab()]);
      const ck = chkK(now);
      const revealed = ck.verdict > 0.5;
      let cx = x;
      let cy = y;
      for (const v of VERDICTS) {
        const right = v === cls.verdict;
        const mark = revealed ? (right ? ' ✓' : guess === v ? ' ✗' : '') : '';
        const src = `${up(say(VERDICT_NAME[v]))}${mark}`;
        const c = revealed ? (right ? col.ok() : guess === v ? col.bad() : th().muted) : guess === v ? col.k() : th().muted;
        const box = formula(g, src, fstyle(size, c, 700));
        const ww = box.w + 16;
        if (!phone && cx + ww > x + w) {
          cx = x;
          cy += 26;
        }
        const hov = hoverId === `v:${v}` && !ctx.locked;
        const strong = (revealed && right) || guess === v;
        const r = fpill(cx + ww / 2, cy, src, {
          color: c,
          border: withAlpha(c, strong ? 1 : hov ? 0.9 : 0.45),
          size,
          fill: strong ? mixColor(c, th().dark ? '#151c27' : '#ffffff', 0.84) : undefined,
          scale: revealed && right ? 1 + 0.08 * Math.sin(Math.PI * clamp01(ck.verdict)) : 1,
        });
        chipHit.push({ v, r });
        if (phone) cy += 25;
        else cx += ww + 8;
      }
    }

    /** Preisrechnende Waage mit Äpfeln. */
    function drawScale(R: Rect, xs: number, ys: number, k: number): void {
      const g = surface.g;
      const dark = th().dark;
      const bw = Math.min(R.w * 0.96, R.h * 1.55);
      const cx = R.x + R.w / 2;
      const baseH = clamp(bw * 0.27, 40, 58);
      const by = R.y + R.h - baseH - 3;
      // Schatten auf dem Tisch
      g.save();
      g.fillStyle = dark ? 'rgba(0,0,0,0.4)' : 'rgba(16,24,40,0.12)';
      g.beginPath();
      g.ellipse(cx, R.y + R.h - 2, bw * 0.5, 4, 0, 0, TAU);
      g.fill();
      g.restore();
      // Gehäuse
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.18)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 3;
      const body = g.createLinearGradient(0, by, 0, by + baseH);
      body.addColorStop(0, dark ? '#4a5566' : '#f4f6f9');
      body.addColorStop(1, dark ? '#2a323e' : '#c9d1db');
      g.fillStyle = body;
      roundRect(g, cx - bw / 2, by, bw, baseH, 10);
      g.fill();
      g.restore();
      // Anzeige mit drei Feldern: kg, €/kg, €
      const dx = cx - bw / 2 + 7;
      const dw = bw - 14;
      const dy = by + 6;
      const dh = baseH - 12;
      g.fillStyle = dark ? '#0d141c' : '#1d2a35';
      roundRect(g, dx, dy, dw, dh, 6);
      g.fill();
      const fw = dw / 3;
      const vsz = clamp(Math.round(dh * 0.42), 11, 17);
      const lsz = 11;
      const fields: [string, string, string][] = [
        [fmt.fixed(xs, 1), 'kg', mixColor(col.x(), '#ffffff', 0.35)],
        [show() ? fmt.fixed(k, 2) : '?', lang === 'de' ? '€/kg' : '€/kg', mixColor(col.k(), '#ffffff', 0.25)],
        [show() ? fmt.fixed(ys, 2) : '?', '€', mixColor(col.y(), '#ffffff', 0.4)],
      ];
      fields.forEach(([v, u, c], i) => {
        const fx = dx + fw * i + fw / 2;
        if (i > 0) {
          g.strokeStyle = 'rgba(255,255,255,0.12)';
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(dx + fw * i, dy + 5);
          g.lineTo(dx + fw * i, dy + dh - 5);
          g.stroke();
        }
        g.font = `700 ${vsz}px ${MONO}`;
        let s = vsz;
        while (g.measureText(v).width > fw - 8 && s > 10) {
          s -= 0.5;
          g.font = `700 ${s}px ${MONO}`;
        }
        label(v, fx, dy + dh * 0.38, `700 ${s}px ${MONO}`, c);
        if (dh >= 30) label(u, fx, dy + dh * 0.78, `600 ${lsz}px ${th().font}`, 'rgba(230,236,244,0.62)');
      });
      // Säule und Schale
      const pw = bw * 0.9;
      const panY = by - 9;
      g.fillStyle = dark ? '#5a6576' : '#aab4c1';
      g.fillRect(cx - 5, panY, 10, by - panY);
      const pan = g.createLinearGradient(0, panY - 8, 0, panY + 6);
      pan.addColorStop(0, dark ? '#8d98a8' : '#e9edf2');
      pan.addColorStop(1, dark ? '#5d6878' : '#b7c0cc');
      g.fillStyle = pan;
      g.beginPath();
      g.moveTo(cx - pw / 2, panY - 6);
      g.lineTo(cx + pw / 2, panY - 6);
      g.quadraticCurveTo(cx + pw / 2 - 6, panY + 5, cx + pw / 2 - 18, panY + 5);
      g.lineTo(cx - pw / 2 + 18, panY + 5);
      g.quadraticCurveTo(cx - pw / 2 + 6, panY + 5, cx - pw / 2, panY - 6);
      g.closePath();
      g.fill();
      // Äpfel (je 500 g): weich auftauchend, wenn die Masse wächst
      const ar = clamp(pw / 16, 5.5, 12);
      const n = clamp(2 * xs, 0, 20);
      const top = R.y + ar + 2;
      const rows: number[] = [];
      let cap = Math.max(3, Math.floor((pw * 0.88) / (2 * ar)));
      let left = Math.ceil(n);
      while (left > 0 && cap > 0) {
        const m = Math.min(cap, left);
        rows.push(m);
        left -= m;
        cap -= 1;
      }
      let idx = 0;
      rows.forEach((m, j) => {
        const yy = Math.max(top, panY - 6 - ar - j * ar * 1.62);
        for (let i = 0; i < m; i++) {
          const ax = cx + (i - (m - 1) / 2) * ar * 2.02;
          const s = ease.outBack(clamp01(n - idx));
          if (s > 0.01) drawApple(ax, yy, ar * s, idx);
          idx++;
        }
      });
    }

    function drawApple(x: number, y: number, r: number, i: number): void {
      const g = surface.g;
      const green = i % 5 === 3;
      const grad = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
      grad.addColorStop(0, green ? '#d4ec7a' : '#ff8a73');
      grad.addColorStop(0.55, green ? '#8fbf34' : '#e0402f');
      grad.addColorStop(1, green ? '#5d8a1c' : '#9e1f17');
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(x, y - r * 0.72);
      g.bezierCurveTo(x + r * 0.55, y - r * 1.12, x + r * 1.12, y - r * 0.55, x + r * 0.98, y + r * 0.15);
      g.bezierCurveTo(x + r * 0.9, y + r * 0.85, x + r * 0.4, y + r * 1.05, x, y + r * 0.92);
      g.bezierCurveTo(x - r * 0.4, y + r * 1.05, x - r * 0.9, y + r * 0.85, x - r * 0.98, y + r * 0.15);
      g.bezierCurveTo(x - r * 1.12, y - r * 0.55, x - r * 0.55, y - r * 1.12, x, y - r * 0.72);
      g.fill();
      if (r > 4) {
        g.strokeStyle = '#6b4a2b';
        g.lineWidth = Math.max(1, r * 0.13);
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(x, y - r * 0.68);
        g.quadraticCurveTo(x + r * 0.05, y - r * 1.05, x + r * 0.22, y - r * 1.22);
        g.stroke();
        g.fillStyle = '#4f9a3a';
        g.beginPath();
        g.ellipse(x + r * 0.42, y - r * 1.08, r * 0.32, r * 0.14, -0.5, 0, TAU);
        g.fill();
      }
    }

    /** Becken mit Pumpen und Stoppuhr. */
    function drawPool(R: Rect, xs: number, ys: number, now: number): void {
      const g = surface.g;
      const dark = th().dark;
      const lvl = fillK(now);
      const filling = fill !== null && lvl < 1 && now >= fill.t0;
      // Stoppuhr rechts
      const cr = clamp(Math.min(R.h * 0.26, R.w * 0.15), 16, 36);
      const ccx = R.x + R.w - cr - 4;
      const ccy = R.y + cr + 10;
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 2;
      g.fillStyle = dark ? '#2a3442' : '#ffffff';
      g.beginPath();
      g.arc(ccx, ccy, cr, 0, TAU);
      g.fill();
      g.restore();
      g.fillStyle = dark ? '#5a6576' : '#9aa6b5';
      g.fillRect(ccx - 3, ccy - cr - 6, 6, 5);
      g.strokeStyle = withAlpha(col.y(), 0.22);
      g.lineWidth = cr * 0.18;
      g.beginPath();
      g.arc(ccx, ccy, cr * 0.8, 0, TAU);
      g.stroke();
      g.strokeStyle = col.y();
      g.lineCap = 'round';
      g.beginPath();
      g.arc(ccx, ccy, cr * 0.8, -Math.PI / 2, -Math.PI / 2 + lvl * TAU);
      g.stroke();
      g.lineCap = 'butt';
      const an = -Math.PI / 2 + lvl * TAU;
      g.strokeStyle = th().text;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(ccx, ccy);
      g.lineTo(ccx + Math.cos(an) * cr * 0.62, ccy + Math.sin(an) * cr * 0.62);
      g.stroke();
      g.fillStyle = th().text;
      g.beginPath();
      g.arc(ccx, ccy, 2.6, 0, TAU);
      g.fill();
      const tShown = ys * lvl;
      const hTxt = show() ? `${ny(tShown, 'ind')} h` : '? h';
      label(hTxt, ccx, ccy + cr + 14, `800 ${fs(15, 13)}px ${th().font}`, col.y());
      if (show() && !isCents(ys) === false && Math.abs(ys - Math.round(ys)) > 1e-9 && R.h > 120 && !filling) label(hm(ys), ccx, ccy + cr + 30, `600 11px ${th().font}`, th().muted);
      // Becken
      const px0 = R.x + 2;
      const px1 = ccx - cr - 12;
      const top = R.y + R.h * 0.44;
      const bot = R.y + R.h - 4;
      const deck = dark ? '#3b4656' : '#d8dee6';
      g.fillStyle = deck;
      roundRect(g, px0, top - 5, px1 - px0, 7, 3);
      g.fill();
      const bx0 = px0 + 6;
      const bx1 = px1 - 6;
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 2;
      g.fillStyle = dark ? '#1f3140' : '#e8f3fb';
      roundRect(g, bx0, top + 2, bx1 - bx0, bot - top - 2, 6);
      g.fill();
      g.restore();
      // Fliesen
      g.save();
      roundRect(g, bx0, top + 2, bx1 - bx0, bot - top - 2, 6);
      g.clip();
      g.strokeStyle = dark ? 'rgba(160,200,230,0.12)' : 'rgba(80,140,190,0.16)';
      g.lineWidth = 1;
      const tile = 11;
      g.beginPath();
      for (let x = bx0 + tile; x < bx1; x += tile) {
        g.moveTo(x + 0.5, top);
        g.lineTo(x + 0.5, bot);
      }
      for (let y = top + 2 + tile; y < bot; y += tile) {
        g.moveTo(bx0, y + 0.5);
        g.lineTo(bx1, y + 0.5);
      }
      g.stroke();
      // Wasser
      const wh = (bot - top - 6) * lvl;
      if (wh > 0.5) {
        const wy = bot - wh;
        const wg = g.createLinearGradient(0, wy, 0, bot);
        wg.addColorStop(0, dark ? 'rgba(80,170,230,0.75)' : 'rgba(90,180,235,0.78)');
        wg.addColorStop(1, dark ? 'rgba(30,100,170,0.9)' : 'rgba(40,120,200,0.9)');
        g.fillStyle = wg;
        g.beginPath();
        g.moveTo(bx0, bot);
        const ph = filling ? now / 260 : 0;
        for (let x = bx0; x <= bx1; x += 4) g.lineTo(x, wy + Math.sin(x / 9 + ph) * (filling ? 1.6 : 0.9));
        g.lineTo(bx1, bot);
        g.closePath();
        g.fill();
      }
      g.restore();
      // Pumpen auf dem Rand
      const n = Math.max(1, Math.round(xs));
      const fracN = xs - Math.floor(xs);
      const room = px1 - px0 - 6;
      const pw = clamp(room / Math.max(n, 1) - 5, 7, 26);
      const phh = pw * 1.05;
      const step = Math.min(pw + 6, room / Math.max(n, 1));
      const startX = px0 + 4 + (room - step * n) / 2 + (step - pw) / 2;
      const pc = col.x();
      for (let i = 0; i < Math.ceil(xs - 1e-9); i++) {
        const s = i < Math.floor(xs + 1e-9) ? 1 : ease.outBack(clamp01(fracN));
        if (s < 0.02) continue;
        const x = startX + i * step;
        const yb = top - 5;
        g.save();
        g.translate(x + pw / 2, yb);
        g.scale(s, s);
        g.translate(-(x + pw / 2), -yb);
        // Schlauch
        g.strokeStyle = dark ? '#7e8ba0' : '#64748b';
        g.lineWidth = Math.max(1.5, pw * 0.14);
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(x + pw * 0.8, yb - phh * 0.65);
        g.quadraticCurveTo(x + pw * 1.15, yb - phh * 0.7, x + pw * 1.0, yb + 7);
        g.stroke();
        // Wasserstrahl
        if (filling && lvl < 0.995) {
          g.strokeStyle = withAlpha('#4aa8e8', 0.75);
          g.lineWidth = Math.max(1.2, pw * 0.1);
          g.beginPath();
          g.moveTo(x + pw * 1.0, yb + 7);
          g.lineTo(x + pw * 1.0, bot - (bot - top - 6) * lvl);
          g.stroke();
        }
        // Gehäuse
        const grad = g.createLinearGradient(x, yb - phh, x, yb);
        grad.addColorStop(0, mixColor(pc, '#ffffff', 0.35));
        grad.addColorStop(1, mixColor(pc, '#000000', 0.15));
        g.fillStyle = grad;
        roundRect(g, x, yb - phh, pw, phh, Math.min(4, pw * 0.25));
        g.fill();
        g.fillStyle = 'rgba(255,255,255,0.75)';
        g.beginPath();
        g.arc(x + pw * 0.42, yb - phh * 0.5, Math.max(1.5, pw * 0.2), 0, TAU);
        g.fill();
        g.restore();
      }
    }

    /** Taxi auf der Straße mit Taxameter. */
    function drawTaxi(R: Rect, xs: number, r: Relation): void {
      const g = surface.g;
      const dark = th().dark;
      const roadY = R.y + R.h - 42;
      const roadH = 18;
      const rx0 = R.x + 10;
      const rx1 = R.x + R.w - 12;
      const kmX = (v: number) => rx0 + ((rx1 - rx0) * v) / 10;
      // Straße
      g.fillStyle = dark ? '#2b313b' : '#59606b';
      roundRect(g, R.x + 2, roadY, R.w - 4, roadH, 4);
      g.fill();
      g.strokeStyle = 'rgba(255,255,255,0.65)';
      g.lineWidth = 1.5;
      g.setLineDash([7, 6]);
      g.beginPath();
      g.moveTo(R.x + 6, roadY + roadH / 2);
      g.lineTo(R.x + R.w - 6, roadY + roadH / 2);
      g.stroke();
      g.setLineDash([]);
      // gefahrene Strecke
      g.fillStyle = withAlpha(col.x(), dark ? 0.55 : 0.45);
      roundRect(g, kmX(0), roadY + roadH + 3, Math.max(0, kmX(xs) - kmX(0)), 4, 2);
      g.fill();
      // km-Skala
      const every = rx1 - rx0 > 240 ? 1 : 2;
      for (let v = 0; v <= 10; v += every) {
        const x = kmX(v);
        g.strokeStyle = withAlpha(th().muted, 0.7);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(x, roadY + roadH + 2);
        g.lineTo(x, roadY + roadH + 8);
        g.stroke();
        if (v % 2 === 0) label(String(v), x, roadY + roadH + 16, `600 11px ${th().font}`, th().muted);
      }
      label('km', rx1 + 2, roadY + roadH + 16, `600 11px ${th().font}`, th().muted, 'left');
      // Startfahne
      const fx = kmX(0);
      g.strokeStyle = th().text;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(fx, roadY + 2);
      g.lineTo(fx, roadY - 22);
      g.stroke();
      g.fillStyle = col.bad();
      g.beginPath();
      g.moveTo(fx, roadY - 22);
      g.lineTo(fx + 11, roadY - 18);
      g.lineTo(fx, roadY - 14);
      g.closePath();
      g.fill();
      // Auto (Front bei der gefahrenen Strecke)
      const cl = clamp(R.w * 0.2, 40, 64);
      const ch = cl * 0.36;
      const front = kmX(xs);
      const x0 = front - cl;
      const yb = roadY + roadH * 0.45;
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.35)';
      g.shadowBlur = 5;
      g.shadowOffsetY = 2;
      const bg = g.createLinearGradient(0, yb - ch, 0, yb);
      bg.addColorStop(0, '#ffd75e');
      bg.addColorStop(1, '#e3a817');
      g.fillStyle = bg;
      g.beginPath();
      g.moveTo(x0 + 3, yb);
      g.lineTo(x0 + 2, yb - ch * 0.55);
      g.quadraticCurveTo(x0 + 3, yb - ch * 0.62, x0 + cl * 0.2, yb - ch * 0.64);
      g.lineTo(x0 + cl * 0.32, yb - ch);
      g.lineTo(x0 + cl * 0.7, yb - ch);
      g.lineTo(x0 + cl * 0.84, yb - ch * 0.62);
      g.quadraticCurveTo(front - 1, yb - ch * 0.58, front, yb - ch * 0.3);
      g.lineTo(front - 1, yb);
      g.closePath();
      g.fill();
      g.restore();
      // Fenster
      g.fillStyle = dark ? '#9fc4e8' : '#bfe0ff';
      g.beginPath();
      g.moveTo(x0 + cl * 0.35, yb - ch * 0.92);
      g.lineTo(x0 + cl * 0.5, yb - ch * 0.92);
      g.lineTo(x0 + cl * 0.5, yb - ch * 0.64);
      g.lineTo(x0 + cl * 0.26, yb - ch * 0.64);
      g.closePath();
      g.fill();
      g.beginPath();
      g.moveTo(x0 + cl * 0.54, yb - ch * 0.92);
      g.lineTo(x0 + cl * 0.68, yb - ch * 0.92);
      g.lineTo(x0 + cl * 0.79, yb - ch * 0.64);
      g.lineTo(x0 + cl * 0.54, yb - ch * 0.64);
      g.closePath();
      g.fill();
      // Dachschild
      g.fillStyle = '#fff6d6';
      roundRect(g, x0 + cl * 0.4, yb - ch - 6, cl * 0.22, 6, 2);
      g.fill();
      g.strokeStyle = '#2b2f36';
      g.lineWidth = 1;
      g.stroke();
      // Schachbrettband
      for (let i = 0; i < 8; i++) {
        g.fillStyle = i % 2 === 0 ? '#2b2f36' : '#fff6d6';
        g.fillRect(x0 + cl * 0.12 + i * cl * 0.09, yb - ch * 0.42, cl * 0.09, 3);
      }
      // Räder
      for (const wx of [x0 + cl * 0.24, x0 + cl * 0.78]) {
        g.fillStyle = '#1b1f26';
        g.beginPath();
        g.arc(wx, yb, ch * 0.3, 0, TAU);
        g.fill();
        g.fillStyle = '#9aa3ad';
        g.beginPath();
        g.arc(wx, yb, ch * 0.13, 0, TAU);
        g.fill();
      }
      // Taxameter
      const mw = Math.min(R.w * 0.66, 190);
      const mh = Math.min(roadY - R.y - 30, 58);
      const mx = R.x + R.w - mw - 2;
      const my = R.y + 2;
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
      g.shadowBlur = 7;
      g.shadowOffsetY = 2;
      g.fillStyle = dark ? '#0d141c' : '#1d2a35';
      roundRect(g, mx, my, mw, mh, 7);
      g.fill();
      g.restore();
      const lsz = clamp(Math.round(mh / 4.4), 11, 13);
      const lh = (mh - 8) / 3;
      const rows: [string, string, string][] = [
        [say(L('Grundgebühr', 'Base fare')), fmt.fixed(r.b, 2), mixColor(col.bad(), '#ffffff', 0.3)],
        [`${fmt.fixed(xs, 1)} km · ${fmt.fixed(r.k, 2)}`, fmt.fixed(r.k * xs, 2), mixColor(col.x(), '#ffffff', 0.35)],
        [say(L('Summe €', 'Total €')), show() ? fmt.fixed(value(r, xs), 2) : '?', mixColor(col.y(), '#ffffff', 0.4)],
      ];
      rows.forEach(([l, v, c], i) => {
        const yy = my + 4 + lh * (i + 0.5);
        label(l, mx + 8, yy, `${i === 2 ? 800 : 600} ${lsz}px ${MONO}`, i === 1 ? 'rgba(230,236,244,0.85)' : c, 'left');
        label(v, mx + mw - 8, yy, `800 ${lsz}px ${MONO}`, c, 'right');
      });
    }

    /** Test: runde Plakette mit „?“ bzw. dem Ergebnis. */
    function drawBadge(R: Rect): void {
      const g = surface.g;
      const cls = classify(TABLES[tab()]);
      const revealed = chkK(performance.now()).verdict > 0.5;
      const r = Math.min(R.h * 0.42, R.w * 0.3);
      const cx = R.x + R.w / 2;
      const cy = R.y + R.h / 2;
      const c = revealed ? verdictCol(cls.verdict) : col.k();
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.18)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      const grad = g.createRadialGradient(cx - r * 0.35, cy - r * 0.4, 2, cx, cy, r);
      grad.addColorStop(0, mixColor(c, '#ffffff', 0.35));
      grad.addColorStop(1, c);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(cx, cy, r, 0, TAU);
      g.fill();
      g.restore();
      const sym = revealed ? (cls.verdict === 'dir' ? 'y : x' : cls.verdict === 'ind' ? 'x · y' : '≠') : '?';
      const sz = Math.round(sym.length > 2 ? r * 0.48 : r * 1.0);
      label(sym, cx, cy + 1, `800 ${sz}px ${sym.length > 2 ? th().mathFont : th().font}`, '#ffffff');
      // kleine Tabelle als Hintergrund-Motiv links
      const pts = TABLES[tab()];
      const tw = Math.min(R.w * 0.3, 70);
      if (cx - r - tw - 8 > R.x) {
        const tx = R.x + 2;
        const ty = cy - pts.length * 7;
        g.strokeStyle = withAlpha(th().muted, 0.5);
        g.lineWidth = 1;
        for (let i = 0; i <= pts.length; i++) {
          g.beginPath();
          g.moveTo(tx, ty + i * 14);
          g.lineTo(tx + tw, ty + i * 14);
          g.stroke();
        }
        g.beginPath();
        g.moveTo(tx + tw / 2, ty);
        g.lineTo(tx + tw / 2, ty + pts.length * 14);
        g.stroke();
      }
    }

    /* =====================================================================
     * Graph
     * ===================================================================== */
    const PAD = () => ({ left: fs(46, 40), bottom: fs(30, 28), top: fs(30, 28), right: fs(18, 14) });

    function strokeCurve(f: (x: number) => number, x0: number, x1: number, color: string, width: number, alpha: number, glow = true): void {
      if (alpha <= 0.01 || x1 <= x0) return;
      const g = surface.g;
      const ymax = plot.bounds.yMax * 1.3;
      const pts: [number, number][] = [];
      const n = 160;
      for (let i = 0; i <= n; i++) {
        const x = x0 + ((x1 - x0) * i) / n;
        const y = f(x);
        if (!Number.isFinite(y)) continue;
        pts.push([plot.px(x), plot.py(Math.min(y, ymax))]);
      }
      if (pts.length < 2) return;
      g.save();
      g.globalAlpha *= alpha;
      g.lineJoin = 'round';
      g.lineCap = 'round';
      if (glow) {
        g.strokeStyle = withAlpha(color, th().dark ? 0.28 : 0.2);
        g.lineWidth = width + 6;
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.stroke();
      }
      g.strokeStyle = color;
      g.lineWidth = width;
      g.beginPath();
      pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
      g.restore();
    }

    function dot(x: number, y: number, color: string, r: number, alpha = 1, hollow = false): void {
      if (alpha <= 0.01) return;
      const g = surface.g;
      const px = plot.px(x);
      const py = plot.py(y);
      g.save();
      g.globalAlpha *= alpha;
      g.beginPath();
      g.arc(px, py, r, 0, TAU);
      if (hollow) {
        g.fillStyle = th().dark ? '#0f141c' : '#ffffff';
        g.fill();
        g.strokeStyle = color;
        g.lineWidth = 2;
        g.stroke();
      } else {
        g.fillStyle = color;
        g.fill();
        g.strokeStyle = th().dark ? '#0f141c' : '#ffffff';
        g.lineWidth = 1.5;
        g.stroke();
      }
      g.restore();
    }

    function dashed(x0: number, y0: number, x1: number, y1: number, color: string, alpha = 1, width = 1.5): void {
      if (alpha <= 0.01) return;
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      g.strokeStyle = color;
      g.lineWidth = width;
      g.setLineDash([5, 4]);
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1, y1);
      g.stroke();
      g.restore();
    }

    function axisLabels(xl: string, yl: string, alpha: number): void {
      const r = plot.rect;
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      label(yl, plot.px(0) + 10, r.y + 13, `650 ${fs(12, 11)}px ${th().font}`, th().muted, 'left', true);
      label(xl, r.x + r.w - 8, plot.py(0) - 12, `650 ${fs(12, 11)}px ${th().font}`, th().muted, 'right', true);
      g.restore();
    }

    function drawGraph(k: Intro, now: number): void {
      const g = surface.g;
      const theme = th();
      const Rg = regions().graph;
      card(Rg);
      plot.resize();
      const pad = PAD();
      plot.setRangePadded([0, XM.v], [0, YM.v], { left: pad.left + 4, bottom: pad.bottom + 4, top: pad.top + 4, right: pad.right + 4 });
      plot.begin();
      // Kartenhintergrund statt Plot-Hintergrund
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      roundRect(g, Rg.x + 2, Rg.y + 2, Rg.w - 4, Rg.h - 4, 11);
      g.fill();
      g.globalAlpha *= k.panel;
      plot.grid({ minor: false });
      plot.axes();
      let fadeIn = 1;
      if (graphFade) {
        const t = (now - graphFade.t0) / 700;
        if (t >= 1) graphFade = null;
        else fadeIn = ease.inOutCubic(clamp01(t));
      }
      if (graphFade?.from && fadeIn < 1) {
        const old = graphFade.from;
        strokeCurve((x) => value(old, x), old.kind === 'ind' ? 0.05 : 0, XM.v, col.g(), 3, 1 - fadeIn);
      }
      if (isTest()) drawGraphTest(k, now, fadeIn);
      else drawGraphRel(k, now, fadeIn);
      plot.end();
    }

    function drawGraphRel(k: Intro, now: number, fadeIn: number): void {
      const g = surface.g;
      const theme = th();
      const kk = kind();
      const R = shownRel();
      const st = storyK(now);
      const sk = stepsK(now, k);
      const xs = st.on ? st.x : X.v;
      const ys = value(R, xs);
      const hide = !show();
      const reveal = Math.min(k.reveal, fadeIn);
      const xEnd = lerp(0, XM.v, reveal);
      const f = (x: number) => value(R, x);
      const xStart = kk === 'ind' ? Math.max(0.02, R.k / (YM.v * 1.25)) : 0;
      const cols = tableColumns();
      const helper = RECT.v * k.labels;
      const px = plot.px(xs);
      const py = plot.py(ys);
      const x0 = x0P();

      // Hilfsfiguren
      if (!hide && helper > 0.01) {
        g.save();
        g.globalAlpha *= helper;
        if (kk === 'dir') {
          // großes Dreieck unter P
          g.fillStyle = withAlpha(col.k(), theme.dark ? 0.13 : 0.08);
          g.beginPath();
          g.moveTo(plot.px(0), plot.py(0));
          g.lineTo(px, plot.py(0));
          g.lineTo(px, py);
          g.closePath();
          g.fill();
          // Steigungsdreiecke gleicher Form an den Tabellenpunkten: 1 nach rechts, k nach oben
          for (const c of cols) {
            if (c + 1 > XM.v - 0.2) continue;
            stepTriangle(c, R.k, 0.5, false);
          }
          stepTriangle(0, R.k, 1, true);
        } else if (kk === 'ind') {
          for (const c of cols) {
            const yc = f(c);
            if (yc > YM.v * 1.05) continue;
            g.strokeStyle = withAlpha(col.k(), 0.45);
            g.lineWidth = 1.2;
            g.strokeRect(plot.px(0), plot.py(yc), plot.px(c) - plot.px(0), plot.py(0) - plot.py(yc));
          }
          g.fillStyle = withAlpha(col.k(), theme.dark ? 0.2 : 0.13);
          g.fillRect(plot.px(0), py, px - plot.px(0), plot.py(0) - py);
          g.strokeStyle = col.k();
          g.lineWidth = 2;
          g.strokeRect(plot.px(0), py, px - plot.px(0), plot.py(0) - py);
        } else {
          // Strahlen vom Ursprung: verschiedene Steigungen = verschiedene Quotienten
          for (const c of [...cols, xs]) {
            const yc = f(c);
            const sx = XM.v;
            const sy = (yc / c) * sx;
            g.strokeStyle = withAlpha(col.bad(), c === xs ? 0.6 : 0.28);
            g.lineWidth = c === xs ? 1.6 : 1.1;
            g.setLineDash([5, 5]);
            g.beginPath();
            g.moveTo(plot.px(0), plot.py(0));
            g.lineTo(plot.px(sx), plot.py(sy));
            g.stroke();
            g.setLineDash([]);
          }
        }
        g.restore();
      }

      // Graph
      if (!hide) {
        g.save();
        g.beginPath();
        g.rect(plot.rect.x, plot.rect.y, plot.rect.w, plot.rect.h);
        g.clip();
        strokeCurve(f, xStart, Math.max(xStart, xEnd), col.g(), 3, 1);
        g.restore();
      }
      // Grundgebühr
      if (kk === 'lin') {
        dot(0, R.b, col.bad(), 5.5, k.labels);
        if (k.labels > 0.05) fpill(plot.px(0) + 12 + 60, plot.py(R.b) - 16, `\\c{bad}{${up(say(L('Grundgebühr', 'base fare')))} ${uf(yu(R.b, 'lin', false))}}`, { size: fs(12, 11), border: withAlpha(col.bad(), 0.6), alpha: k.labels, bounds: plot.rect });
      }
      // Tabellenpunkte
      for (const c of cols) {
        if (c > xEnd) continue;
        const yc = f(c);
        if (yc > YM.v * 1.02) continue;
        const known = Math.abs(c - x0) < 1e-9;
        if (hide && !known) continue;
        dot(c, yc, col.g(), known ? 5.5 : 4.2, 1, known);
      }
      if (hide) {
        // bekannte Zeile als Punkt, P nur als senkrechte Linie mit „?“
        dot(x0, value(rel(), x0), col.g(), 5.5, 1, true);
        dashed(px, plot.py(0), px, plot.rect.y + 26, col.x(), 0.9);
        fpill(px, plot.rect.y + 22, `\\c{x}{x = ${uf(xu(xs))}}:  \\c{y}{y = ?}`, { size: fs(12.5, 11.5), border: withAlpha(col.x(), 0.6), bounds: plot.rect });
        axisLabels(say(META[kk].xAxis), say(META[kk].yAxis), k.labels);
        return;
      }

      // Verdoppeln: Punkte und Hilfslinien
      if (st.on && story) {
        const s = story;
        for (let i = 0; i < s.fs.length; i++) {
          if (i > st.at && !(i === st.at + 1 && st.arcs[i]!.top > 0)) continue;
          const xi = s.fs[i]! * s.u;
          const yi = f(xi);
          const a = st.out * (i <= st.at ? 1 : st.arcs[i]!.top);
          dashed(plot.px(xi), plot.py(0), plot.px(xi), plot.py(yi), col.x(), 0.7 * a);
          dashed(plot.px(0), plot.py(yi), plot.px(xi), plot.py(yi), col.y(), 0.7 * a);
          dot(xi, yi, col.g(), 5.5, a);
          if (i > 0 && kk === 'lin') {
            // erwarteter (falscher) Wert bei Verdopplung
            const wrong = s.fs[i]! * f(s.u);
            const b = st.arcs[i]!.bot * st.out;
            if (wrong <= YM.v * 1.05) {
              dot(xi, wrong, col.bad(), 6, b, true);
              dashed(plot.px(xi), plot.py(yi), plot.px(xi), plot.py(wrong), col.bad(), 0.8 * b);
              fpill(plot.px(xi) - 8, plot.py(wrong) - 18, `\\c{bad}{${uf(yu(wrong, 'lin', false))}?  ✗}`, { size: fs(12, 11), border: col.bad(), alpha: b, bounds: plot.rect });
            }
          }
          if (i > 0) {
            const lbl = `\\c{x}{·${s.fs[i]}}`;
            fpill(lerp(plot.px(s.u), plot.px(xi), 0.5), plot.py(0) - 14, lbl, { size: fs(12, 11), border: withAlpha(col.x(), 0.6), alpha: st.arcs[i]!.top * st.out, bounds: plot.rect });
          }
        }
      }

      // Dreisatz: Fokus auf bekannter Zeile, Einheit, gesuchter Zeile
      if (sk.on && kk !== 'lin') {
        const fx = sk.focus === 0 ? x0 : sk.focus === 1 ? 1 : xP();
        const fy = f(fx);
        const pulse = 0.5 + 0.5 * Math.sin(now / 140);
        g.save();
        g.strokeStyle = sk.focus === 1 ? col.k() : col.g();
        g.globalAlpha *= 0.35 + 0.4 * pulse;
        g.lineWidth = 2;
        g.beginPath();
        g.arc(plot.px(fx), plot.py(Math.min(fy, YM.v)), 11 + pulse * 4, 0, TAU);
        g.stroke();
        g.restore();
        if (sk.focus === 1 && fy <= YM.v) {
          dashed(plot.px(1), plot.py(0), plot.px(1), plot.py(fy), col.x(), 0.8);
          dashed(plot.px(0), plot.py(fy), plot.px(1), plot.py(fy), col.k(), 0.8);
          dot(1, fy, col.k(), 5.5);
        }
      }

      // P mit Hilfslinien und Achsen-Kärtchen
      const pa = clamp01(k.labels * 1.2);
      dashed(px, plot.py(0), px, py, col.x(), 0.9 * pa, 1.8);
      dashed(plot.px(0), py, px, py, col.y(), 0.9 * pa, 1.8);
      if (kk === 'dir' && helper > 0.05) {
        const src = `\\c{k}{y : x = ${ny(ys)} : ${nx(xs)} = ${fmt.num(Math.round(R.k * 100) / 100, 2)}}`;
        const cxp = lerp(plot.px(0), px, 0.62);
        const cyp = lerp(plot.py(0), py, 0.25);
        fpill(cxp, cyp, src, { size: fs(12.5, 11.5), border: withAlpha(col.k(), 0.7), alpha: helper, bounds: plot.rect });
      } else if (kk === 'ind' && helper > 0.05) {
        const src = `\\c{k}{x · y = ${nx(xs)} · ${ny(ys)} = ${fmt.num(Math.round(xs * ys * 100) / 100, 2)}}`;
        const w = px - plot.px(0);
        const h = plot.py(0) - py;
        const cxp = w > 150 ? plot.px(0) + w / 2 : px + 90;
        const cyp = h > 40 ? py + h / 2 : py - 18;
        fpill(cxp, cyp, src, { size: fs(12.5, 11.5), border: withAlpha(col.k(), 0.7), alpha: helper, bounds: plot.rect });
      } else if (kk === 'lin' && helper > 0.05) {
        const src = `\\c{bad}{y : x = ${ny(ys)} : ${nx(xs)} ≈ ${fmt.num(Math.round((ys / xs) * 100) / 100, 2)}}`;
        fpill(px - 70, py + 26, src, { size: fs(12, 11), border: withAlpha(col.bad(), 0.6), alpha: helper, bounds: plot.rect });
      }
      // Achsen-Kärtchen
      fpill(px, plot.py(0) + 13, `\\c{x}{${nx(xs)}}`, { size: fs(12, 11), border: col.x(), alpha: pa, fill: mixColor(col.x(), theme.dark ? '#151c27' : '#ffffff', 0.86) });
      fpill(plot.px(0) - 4 - 18, py, `\\c{y}{${ny(ys)}}`, { size: fs(12, 11), border: col.y(), alpha: pa, fill: mixColor(col.y(), theme.dark ? '#151c27' : '#ffffff', 0.86), bounds: { x: plot.rect.x, y: plot.rect.y, w: plot.px(0) + 30 - plot.rect.x, h: plot.rect.h } });
      // Punkt P
      g.save();
      g.globalAlpha *= pa;
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.25)';
      g.shadowBlur = 5;
      g.fillStyle = theme.dark ? '#0f141c' : '#ffffff';
      g.beginPath();
      g.arc(px, py, 7, 0, TAU);
      g.fill();
      g.restore();
      g.save();
      g.globalAlpha *= pa;
      g.strokeStyle = col.g();
      g.lineWidth = 3;
      g.beginPath();
      g.arc(px, py, 7, 0, TAU);
      g.stroke();
      g.restore();
      const right = px < plot.rect.x + plot.rect.w * 0.62;
      const lsrc = `P(\\c{x}{${nx(xs)}} | \\c{y}{${ny(ys)}})`;
      const lb = formula(g, lsrc, fstyle(fs(13, 12), th().text, 750));
      fpill(right ? px + 16 + lb.w / 2 + 8 : px - 16 - lb.w / 2 - 8, py - 18, lsrc, { size: fs(13, 12), border: withAlpha(col.g(), 0.8), alpha: pa, bounds: plot.rect });
      axisLabels(say(META[kk].xAxis), say(META[kk].yAxis), k.labels);
    }

    /** Steigungsdreieck: von (x, y(x)) 1 nach rechts und k nach oben. */
    function stepTriangle(x: number, k: number, alpha: number, labels: boolean): void {
      const g = surface.g;
      const y = k * x;
      const ax = plot.px(x);
      const ay = plot.py(y);
      const bx = plot.px(x + 1);
      const cy = plot.py(y + k);
      g.save();
      g.globalAlpha *= alpha;
      g.fillStyle = withAlpha(col.k(), th().dark ? 0.22 : 0.15);
      g.beginPath();
      g.moveTo(ax, ay);
      g.lineTo(bx, ay);
      g.lineTo(bx, cy);
      g.closePath();
      g.fill();
      g.strokeStyle = col.k();
      g.lineWidth = labels ? 2 : 1.4;
      g.beginPath();
      g.moveTo(ax, ay);
      g.lineTo(bx, ay);
      g.lineTo(bx, cy);
      g.stroke();
      g.restore();
      if (labels && bx - ax > 14) {
        label('1', (ax + bx) / 2, ay + 10, `750 ${fs(12, 11)}px ${th().font}`, col.x(), 'center', true);
        label(fmt.num(Math.round(k * 100) / 100, 2), bx + 5, (ay + cy) / 2, `750 ${fs(12, 11)}px ${th().font}`, col.k(), 'left', true);
      }
    }

    function drawGraphTest(k: Intro, now: number, fadeIn: number): void {
      const g = surface.g;
      const theme = th();
      const pts = TABLES[tab()];
      const cls = classify(pts);
      const ck = chkK(now);
      const rev = ck.verdict;
      const meta = TAB_META[tab()];
      const helper = RECT.v * rev;
      // Hilfsfiguren nach dem Prüfen
      if (helper > 0.01) {
        g.save();
        g.globalAlpha *= helper;
        for (const [x, y] of pts) {
          if (cls.verdict === 'ind') {
            g.fillStyle = withAlpha(col.k(), theme.dark ? 0.08 : 0.05);
            g.fillRect(plot.px(0), plot.py(y), plot.px(x) - plot.px(0), plot.py(0) - plot.py(y));
            g.strokeStyle = withAlpha(col.k(), 0.55);
            g.lineWidth = 1.3;
            g.strokeRect(plot.px(0), plot.py(y), plot.px(x) - plot.px(0), plot.py(0) - plot.py(y));
          } else {
            const c = cls.verdict === 'dir' ? col.k() : col.bad();
            g.strokeStyle = withAlpha(c, cls.verdict === 'dir' ? 0.55 : 0.4);
            g.fillStyle = withAlpha(c, theme.dark ? 0.08 : 0.05);
            g.lineWidth = 1.2;
            g.setLineDash(cls.verdict === 'dir' ? [] : [5, 5]);
            g.beginPath();
            g.moveTo(plot.px(0), plot.py(0));
            g.lineTo(plot.px(x), plot.py(0));
            g.lineTo(plot.px(x), plot.py(y));
            g.closePath();
            if (cls.verdict === 'dir') g.fill();
            g.stroke();
            g.setLineDash([]);
          }
        }
        g.restore();
      }
      // Kurve nach dem Prüfen
      if (rev > 0.01) {
        const draw = lerp(0, XM.v, ease.inOutCubic(clamp01(rev)));
        if (cls.verdict === 'dir') strokeCurve((x) => cls.k! * x, 0, draw, col.g(), 3, rev);
        else if (cls.verdict === 'ind') strokeCurve((x) => cls.k! / x, cls.k! / (YM.v * 1.2), draw, col.g(), 3, rev);
        else {
          g.save();
          g.globalAlpha *= rev;
          g.strokeStyle = withAlpha(th().muted, 0.8);
          g.lineWidth = 2;
          g.setLineDash([6, 5]);
          g.beginPath();
          pts.forEach(([x, y], i) => (i ? g.lineTo(plot.px(x), plot.py(y)) : g.moveTo(plot.px(x), plot.py(y))));
          g.stroke();
          g.restore();
        }
      }
      // Punkte
      pts.forEach(([x, y], i) => {
        const a = clamp01(k.reveal * pts.length * 1.2 - i) * fadeIn;
        dot(x, y, col.g(), 5.5, a);
        const right = plot.px(x) < plot.rect.x + plot.rect.w * 0.7;
        if (a > 0.05) label(`(${nx(x)} | ${nx(y)})`, plot.px(x) + (right ? 10 : -10), plot.py(y) - 12, `650 ${fs(12, 11)}px ${theme.font}`, theme.text, right ? 'left' : 'right', true);
      });
      if (rev > 0.3) {
        const vs = say(VERDICT_NAME[cls.verdict]);
        const src = cls.verdict === 'dir' ? `\\c{ok}{${up(vs)}: y = ${nx(cls.k!)} · x}` : cls.verdict === 'ind' ? `\\c{k}{${up(vs)}: y = ${nx(cls.k!)} : x}` : `\\c{bad}{${up(vs)}}`;
        fpill(plot.rect.x + plot.rect.w * 0.62, plot.rect.y + 22, src, { size: fs(12.5, 11.5), border: verdictCol(cls.verdict), alpha: clamp01((rev - 0.3) / 0.7), bounds: plot.rect });
      }
      axisLabels(say(meta.xAxis), say(meta.yAxis), k.labels);
    }

    /* =====================================================================
     * Karten
     * ===================================================================== */
    type CardFn = (R: Rect, measure: boolean) => number;

    /** Spalten der Wertetabelle (ohne die P-Spalte). */
    function tableColumns(): number[] {
      const kk = kind();
      const xs = tableXs(kk, x0P());
      const x0 = x0P();
      if (!xs.some((v) => Math.abs(v - x0) < 1e-9)) xs.push(x0);
      return xs.sort((a, b) => a - b);
    }

    let colHit: { id: string; r: Rect }[] = [];

    function tableCard(k: Intro, now: number): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const test = isTest();
        const pad = fs(14, 12);
        const rowH = fs(25, 23);
        const arcH = test ? 4 : fs(22, 20);
        const nRatio = test ? 2 : 1;
        const hh = 40 + arcH + rowH * 2 + arcH + 6 + rowH * nRatio + fs(24, 22);
        if (measure) return hh;
        const kk = kind();
        const Rs = shownRel();
        const st = storyK(now);
        const ck = chkK(now);
        const hide = !show();
        const tf = tableFade !== null ? ease.outCubic(clamp01((now - tableFade) / 500)) : 1;
        card({ ...R, h: hh }, col.x());
        const ruleSrc = test ? undefined : hide ? undefined : kk === 'dir' ? `y = ${nx(Rs.k)} · x` : kk === 'ind' ? `y = ${nx(Rs.k)} : x` : `y = ${nx(Rs.k)} · x + ${nx(Rs.b)}`;
        cardTitle(R, say(L('Wertetabelle', 'Table of values')), col.x(), ruleSrc ? `\\c{g}{${ruleSrc}}` : undefined);
        // Spalten
        const pts: { x: number; y: number; id: string; isP: boolean }[] = test
          ? TABLES[tab()].map(([x, y], i) => ({ x, y, id: `t${i}`, isP: false }))
          : tableColumns().map((x) => ({ x, y: value(Rs, x), id: `c:${x}`, isP: false }));
        const hw = Math.round(clamp(R.w * 0.22, 60, 96));
        const left = R.x + pad + hw;
        const right = R.x + R.w - pad;
        const pW = test ? 26 : Math.round(clamp((right - left) * 0.19, 46, 70));
        const gapP = test ? 4 : 10;
        const cw = (right - left - pW - gapP) / pts.length;
        const colX = (i: number) => left + cw * (i + 0.5);
        const pX = right - pW / 2;
        const top = R.y + 40 + arcH;
        const yX = top + rowH * 0.5;
        const yY = top + rowH * 1.5;
        const yR0 = top + rowH * 2 + arcH + 6 + rowH * 0.5;
        const vsz = fs(14, 12.5);
        const vf = (w = 700) => `${w} ${vsz}px ${theme.font}`;
        // Zeilenbänder
        g.fillStyle = withAlpha(col.x(), theme.dark ? 0.1 : 0.06);
        roundRect(g, R.x + pad - 4, top, R.w - 2 * pad + 8, rowH, 6);
        g.fill();
        g.fillStyle = withAlpha(col.y(), theme.dark ? 0.1 : 0.06);
        roundRect(g, R.x + pad - 4, top + rowH, R.w - 2 * pad + 8, rowH, 6);
        g.fill();
        g.strokeStyle = theme.dark ? '#273142' : '#e3e8ef';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(left - 4, top + 2);
        g.lineTo(left - 4, yR0 + rowH * (nRatio - 0.5));
        g.stroke();
        // Kopfspalte
        const meta = test ? TAB_META[tab()] : null;
        const xUnit = test ? say(meta!.xh) : kk === 'dir' ? 'kg' : kk === 'ind' ? say(L('Pumpen', 'pumps')) : 'km';
        const yUnit = test ? say(meta!.yh) : kk === 'ind' ? 'h' : '€';
        const head = (v: string, unit: string, y: number, c: string) => {
          const box = formula(g, `\\c{${v}}{\\b{${v}}}`, fstyle(fs(15, 13.5), c, 700));
          box.draw(g, R.x + pad, y + (box.asc - box.desc) / 2);
          if (unit) label(unit, R.x + pad + box.w + 6, y, `600 ${fs(12, 11)}px ${theme.font}`, theme.muted, 'left');
        };
        head('x', xUnit, yX, col.x());
        head('y', yUnit, yY, col.y());
        const ratioRows: ('q' | 'p')[] = test ? ['q', 'p'] : kk === 'ind' ? ['p'] : ['q'];
        ratioRows.forEach((rr, j) => {
          const y = yR0 + j * rowH;
          const c = test ? th().text : kk === 'lin' ? col.bad() : col.k();
          const box = formula(g, rr === 'q' ? '\\b{y : x}' : '\\b{x · y}', fstyle(fs(13.5, 12.5), test ? col.k() : c, 700));
          box.draw(g, R.x + pad, y + (box.asc - box.desc) / 2);
        });
        g.save();
        g.globalAlpha *= tf;
        // Hervorhebung: Hover, bekannte Zeile, Verdoppeln
        colHit = [];
        const x0 = x0P();
        pts.forEach((pt, i) => {
          const cx = colX(i);
          const hov = hoverId === pt.id && !ctx.locked;
          const isKnown = !test && Math.abs(pt.x - x0) < 1e-9;
          const inStory = st.on && story && story.fs.some((f2, j) => j <= st.at && Math.abs(f2 * story!.u - pt.x) < 1e-9);
          if (hov || isKnown || inStory) {
            g.fillStyle = inStory ? withAlpha(col.g(), theme.dark ? 0.24 : 0.16) : hov ? withAlpha(col.x(), 0.14) : withAlpha(col.g(), theme.dark ? 0.12 : 0.08);
            roundRect(g, cx - cw / 2 + 2, top - 2, cw - 4, rowH * 2 + 4, 7);
            g.fill();
          }
          if (!test) colHit.push({ id: pt.id, r: { x: cx - cw / 2, y: top, w: cw, h: rowH * 2 } });
        });
        // Zellen
        const shownX = st.on ? st.x : X.v;
        pts.forEach((pt, i) => {
          const cx = colX(i);
          const a = clamp01(k.stagger * 6 - i * 0.6);
          g.save();
          g.globalAlpha *= ease.outCubic(a);
          label(nx(pt.x), cx, yX, vf(), col.x());
          const known = test || Math.abs(pt.x - x0) < 1e-9;
          label(hide && !known ? '?' : ny(pt.y, test ? 'ind' : kk), cx, yY, vf(), col.y());
          ratioRows.forEach((rr, j) => {
            const y = yR0 + j * rowH;
            const v = rr === 'q' ? pt.y / pt.x : pt.x * pt.y;
            const app = test ? (rr === 'q' ? ck.q(i) : ck.p(i)) : 1;
            if (app <= 0.01 || (hide && !test)) {
              label('?', cx, y, vf(600), withAlpha(theme.muted, 0.7));
              return;
            }
            const c = test ? (rr === 'q' ? (classify(TABLES[tab()]).verdict === 'dir' ? col.ok() : th().text) : classify(TABLES[tab()]).verdict === 'ind' ? col.ok() : th().text) : kk === 'lin' ? col.bad() : col.k();
            g.save();
            g.translate(cx, y);
            g.scale(app, app);
            label(fmt.num(Math.round(v * 100) / 100, 2), 0, 0, vf(), c);
            g.restore();
          });
          g.restore();
        });
        // P-Spalte (nicht im Test)
        if (!test) {
          const yv = value(Rs, shownX);
          g.fillStyle = withAlpha(col.g(), theme.dark ? 0.2 : 0.12);
          roundRect(g, pX - pW / 2, top - 2, pW, rowH * 2 + 4, 7);
          g.fill();
          g.strokeStyle = withAlpha(col.g(), 0.7);
          g.lineWidth = 1.3;
          roundRect(g, pX - pW / 2 + 0.5, top - 1.5, pW - 1, rowH * 2 + 3, 7);
          g.stroke();
          label('P', pX, top - arcH / 2 - 2, `800 ${fs(12, 11)}px ${theme.font}`, col.g());
          label(nx(shownX), pX, yX, vf(800), col.x());
          label(hide ? '?' : ny(yv), pX, yY, vf(800), col.y());
          const v = kk === 'ind' ? shownX * yv : yv / shownX;
          label(hide ? '?' : fmt.num(Math.round(v * 100) / 100, 2), pX, yR0, vf(800), kk === 'lin' ? col.bad() : col.k());
        }
        // Prüfzeichen im Test
        if (test) {
          const cls = classify(TABLES[tab()]);
          const marks: [number, boolean][] = [
            [ck.qMark, cls.verdict === 'dir'],
            [ck.pMark, cls.verdict === 'ind'],
          ];
          marks.forEach(([m, okv], j) => {
            if (m <= 0.01) return;
            g.save();
            g.translate(pX, yR0 + j * rowH);
            g.scale(m, m);
            label(okv ? '✓' : '✗', 0, 0, `800 ${fs(16, 14)}px ${theme.font}`, okv ? col.ok() : col.bad());
            g.restore();
          });
        }
        // Pfeile über und unter der Tabelle
        if (!test && story === null ? true : !test) {
          const { u, factors } = storyBase(kk, x0P());
          const iu = pts.findIndex((pt) => Math.abs(pt.x - u) < 1e-9);
          factors.forEach((f2, j) => {
            if (j === 0) return;
            const iv = pts.findIndex((pt) => Math.abs(pt.x - f2 * u) < 1e-9);
            if (iu < 0 || iv < 0) return;
            let topP: number;
            let botP: number;
            let al: number;
            if (st.on) {
              topP = st.arcs[j]!.top;
              botP = st.arcs[j]!.bot;
              al = st.out;
            } else {
              if (j > 1) return;
              topP = clamp01(k.stagger * 3 - 1);
              botP = topP;
              al = 0.55;
            }
            const xa = colX(iu);
            const xb = colX(iv);
            const hgt = j === 1 ? arcH * 0.5 : arcH * 0.85;
            const apT = arcArrow(xa, xb, top - 3, -1, hgt, col.x(), topP, al);
            const apB = arcArrow(xa, xb, top + rowH * 2 + 3, 1, hgt, kk === 'lin' ? col.bad() : col.y(), botP, al);
            if (topP > 0.3) fpill(apT.x, apT.y, `\\c{x}{·${f2}}`, { size: fs(11.5, 11), alpha: al * clamp01((topP - 0.3) / 0.5), border: withAlpha(col.x(), 0.55) });
            if (botP > 0.3) {
              const sy = scaleY(Rs, u, f2);
              const opY = hide ? '?' : kk === 'dir' ? `·${f2}` : kk === 'ind' ? `:${f2}` : `·${fmt.num(Math.round(sy.fy * 100) / 100, 2)}`;
              const c = kk === 'lin' ? 'bad' : 'y';
              fpill(apB.x, apB.y, `\\c{${c}}{${opY}}`, { size: fs(11.5, 11), alpha: al * clamp01((botP - 0.3) / 0.5), border: withAlpha(kk === 'lin' ? col.bad() : col.y(), 0.55) });
            }
          });
        }
        g.restore();
        // Urteil
        const vy = R.y + hh - fs(15, 14);
        const vfont = `700 ${fs(12.5, 11.5)}px ${theme.font}`;
        if (test) {
          const cls = classify(TABLES[tab()]);
          const a = ck.verdict;
          if (a > 0.01) {
            const txt = cls.verdict === 'dir' ? say(L(`alle Quotienten gleich → direkt proportional, k = ${nx(cls.k!)}`, `all quotients equal → directly proportional, k = ${nx(cls.k!)}`)) : cls.verdict === 'ind' ? say(L(`alle Produkte gleich → indirekt proportional, k = ${nx(cls.k!)}`, `all products equal → inversely proportional, k = ${nx(cls.k!)}`)) : say(L('weder Quotienten noch Produkte gleich → weder noch', 'neither quotients nor products equal → neither'));
            g.save();
            g.globalAlpha *= clamp01(a);
            const lines = wrapText(txt, R.w - 2 * pad, vfont);
            label(lines[0]!, R.x + pad, vy, vfont, verdictCol(cls.verdict), 'left');
            g.restore();
          } else label(say(L('Rechne nach: Quotienten und Produkte', 'Work it out: quotients and products')), R.x + pad, vy, vfont, theme.muted, 'left');
        } else if (hide) label(say(L('Sind alle gleich?', 'Are they all equal?')), R.x + pad, vy, vfont, theme.muted, 'left');
        else {
          const txt = kk === 'dir' ? say(L('alle Quotienten gleich ✓  quotientengleich', 'all quotients equal ✓')) : kk === 'ind' ? say(L('alle Produkte gleich ✓  produktgleich', 'all products equal ✓')) : say(L('Quotienten verschieden ✗  nicht proportional', 'quotients differ ✗  not proportional'));
          label(txt, R.x + pad, vy, vfont, kk === 'lin' ? col.bad() : col.ok(), 'left');
        }
        return hh;
      };
    }

    /** Dreisatz Schritt für Schritt (beim Taxi: die Falle). */
    function stepsCard(k: Intro, now: number): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const kk = kind();
        const pad = fs(14, 12);
        const rowH = roomy() ? 30 : fs(27, 25);
        const noteSz = fs(12, 11);
        const noteFont = `600 ${noteSz}px ${theme.font}`;
        const noteTxt = kk === 'dir'
          ? say(L('Gleiche Richtung: Was links mit x passiert, passiert rechts auch mit y.', 'Same direction: whatever happens to x on the left happens to y on the right.'))
          : kk === 'ind'
            ? say(L('Gegenrichtung: Rechts passiert das Umgekehrte – aus · wird : und aus : wird ·.', 'Opposite direction: the right side does the reverse – · becomes : and : becomes ·.'))
            : say(L('Die Grundgebühr zahlt man nur einmal – darum klappt der Dreisatz hier nicht.', 'The base fare is paid only once – so the rule of three does not work here.'));
        const noteLines = wrapText(noteTxt, R.w - 2 * pad - 14, noteFont);
        const noteH = noteLines.length * noteSz * 1.35 + 10;
        const formH = fs(26, 24);
        const hh = 40 + rowH * 3 + 8 + formH + noteH + 10;
        if (measure) return hh;
        const r = rel();
        const x0 = x0P();
        const x = xP();
        const hide = !show();
        const sk = stepsK(now, k);
        const accent = kk === 'lin' ? col.bad() : kk === 'dir' ? col.ok() : col.k();
        card({ ...R, h: hh }, accent);
        cardTitle(R, kk === 'lin' ? say(L('Vorsicht, Falle!', 'Careful, trap!')) : say(L('Dreisatz', 'Rule of three')), accent, kk === 'lin' ? undefined : `\\c{${kk === 'dir' ? 'ok' : 'k'}}{${up(kk === 'dir' ? say(L('gleiche Richtung', 'same direction')) : say(L('Gegenrichtung', 'opposite direction')))}}`);
        const top = R.y + 40;
        const colEq = R.x + R.w * 0.5;
        const fz = roomy() ? 16 : fs(15, 13.5);
        const cellX = (s: string, cy: number, c: string, a: number) => {
          const b = formula(g, `\\b{${uf(s)}}`, fstyle(fz, c, 750));
          g.save();
          g.globalAlpha *= a;
          b.draw(g, colEq - 16 - b.w, cy + (b.asc - b.desc) / 2);
          g.restore();
        };
        const cellY = (s: string, cy: number, c: string, a: number, strike = false) => {
          const b = formula(g, `\\b{${uf(s)}}`, fstyle(fz, c, 750));
          g.save();
          g.globalAlpha *= a;
          b.draw(g, colEq + 16, cy + (b.asc - b.desc) / 2);
          if (strike) {
            g.strokeStyle = col.bad();
            g.lineWidth = 2;
            g.beginPath();
            g.moveTo(colEq + 12, cy + 1);
            g.lineTo(colEq + 20 + b.w, cy - 2);
            g.stroke();
          }
          g.restore();
          return b.w;
        };
        const eqSign = (cy: number, a: number) => {
          g.save();
          g.globalAlpha *= a;
          label('≙', colEq, cy, `700 ${fz}px ${theme.font}`, theme.muted);
          g.restore();
        };
        const rowBg = (i: number, c: string, a: number) => {
          g.save();
          g.globalAlpha *= a;
          g.fillStyle = withAlpha(c, theme.dark ? 0.16 : 0.09);
          roundRect(g, R.x + pad + 34, top + rowH * i + 2, R.w - 2 * pad - 68, rowH - 4, 8);
          g.fill();
          g.restore();
        };
        const yA = (i: number) => top + rowH * (i + 0.5) + 8;
        const yB = (i: number) => top + rowH * (i + 1.5) - 8;
        if (kk !== 'lin') {
          const r3 = ruleOfThree(r, x0, x)!;
          const [[a0, b0], [, b1], [a2, b2]] = r3.rows;
          rowBg(1, col.k(), sk.row[1]);
          rowBg(2, col.y(), sk.row[2]);
          for (let i = 0; i < 3; i++) {
            const cy = top + rowH * (i + 0.5);
            const a = sk.row[i]!;
            const xv = i === 0 ? a0 : i === 1 ? 1 : a2;
            const yv = i === 0 ? b0 : i === 1 ? b1 : b2;
            cellX(xu(xv), cy, col.x(), a);
            eqSign(cy, a);
            cellY(hide && i > 0 ? '?' : yu(yv), cy, i === 1 ? col.k() : col.y(), a);
          }
          for (let j = 0; j < 2; j++) {
            const a = sk.arr[j]!;
            const lc = col.x();
            const rc = r3.same ? col.y() : col.k();
            sideArrow(R.x + pad + 14, yA(j), yB(j), -1, lc, `\\c{x}{${opS(r3.left[j]!)}}`, a);
            sideArrow(R.x + R.w - pad - 14, yA(j), yB(j), 1, rc, `\\c{${r3.same ? 'y' : 'k'}}{${opS(r3.right[j]!)}}`, a);
          }
          // Rechnung in einer Zeile
          const fy = top + rowH * 3 + 8 + formH / 2;
          const src = hide
            ? `y = ${kk === 'dir' ? 'k · x' : 'k : x'} = ?`
            : kk === 'dir'
              ? `\\c{y}{y} = \\c{k}{k} · \\c{x}{x} = \\c{k}{${ny(r.k)}} · \\c{x}{${nx(x)}} = \\c{y}{\\b{${ny(value(r, x))}}}`
              : `\\c{y}{y} = \\c{k}{k} : \\c{x}{x} = \\c{k}{${nx(r.k)}} : \\c{x}{${nx(x)}} = \\c{y}{\\b{${ny(value(r, x))}}}`;
          const fb = fit(src, R.w - 2 * pad, fs(13.5, 12.5));
          g.save();
          g.globalAlpha *= sk.res;
          fb.draw(g, R.x + pad, fy + (fb.asc - fb.desc) / 2);
          g.restore();
        } else {
          // Taxi: der falsche Dreisatz und die richtige Rechnung
          const y0 = value(r, x0);
          const fct = x / x0;
          const wrong = naiveGuess(r, x0, x);
          const right = value(r, x);
          const rows: [string, string, string, boolean][] = [
            [xu(x0), yu(y0, 'lin', false), col.y(), false],
            ['', '', '', false],
            [xu(x), yu(wrong, 'lin', false), col.bad(), true],
          ];
          rowBg(2, col.bad(), sk.row[2]);
          for (const i of [0, 2]) {
            const cy = top + rowH * (i + 0.5);
            const a = sk.row[i]!;
            cellX(rows[i]![0], cy, col.x(), a);
            eqSign(cy, a);
            const w = cellY(rows[i]![1], cy, rows[i]![2], a, rows[i]![3] && sk.row[2] > 0.5);
            if (i === 2 && sk.row[2] > 0.5) {
              g.save();
              g.globalAlpha *= sk.row[2];
              label('✗', colEq + 26 + w, cy, `800 ${fz}px ${theme.font}`, col.bad(), 'left');
              g.restore();
            }
          }
          const fl = `· ${nx(Math.round(fct * 100) / 100)}`;
          sideArrow(R.x + pad + 14, top + rowH * 0.5 + 8, top + rowH * 2.5 - 8, -1, col.x(), `\\c{x}{${fl}}`, sk.arr[0]);
          sideArrow(R.x + R.w - pad - 14, top + rowH * 0.5 + 8, top + rowH * 2.5 - 8, 1, col.bad(), `\\c{bad}{${fl} ?}`, sk.arr[0]);
          const mid = top + rowH * 1.5;
          g.save();
          g.globalAlpha *= sk.arr[0];
          label(say(L('doppelt so weit – doppelt so teuer?', 'twice as far – twice the price?')).replace(say(L('doppelt so weit – doppelt so teuer?', 'twice as far – twice the price?')), Math.abs(fct - 2) < 1e-9 ? say(L('doppelt so weit – doppelt so teuer?', 'twice as far – twice the price?')) : say(L('proportional gerechnet?', 'worked out proportionally?'))), colEq, mid, `600 ${fs(12, 11)}px ${theme.font}`, theme.muted);
          g.restore();
          const fy = top + rowH * 3 + 8 + formH / 2;
          const src = hide
            ? `\\c{ok}{${up(say(L('richtig', 'right')))}}: ${uf(yu(r.b, 'lin', false))} + ${nx(x)} · ${uf(yu(r.k, 'lin', false))} = ?`
            : `\\c{ok}{${up(say(L('richtig', 'right')))}}: \\c{bad}{${uf(yu(r.b, 'lin', false))}} + \\c{x}{${nx(x)}} · ${uf(yu(r.k, 'lin', false))} = \\c{y}{\\b{${uf(yu(right, 'lin', false))}}} \\c{ok}{✓}`;
          const fb = fit(src, R.w - 2 * pad, fs(13.5, 12.5));
          g.save();
          g.globalAlpha *= sk.res;
          fb.draw(g, R.x + pad, fy + (fb.asc - fb.desc) / 2);
          g.restore();
        }
        // Merkhilfe
        const ny0 = top + rowH * 3 + 8 + formH + 4;
        g.save();
        g.globalAlpha *= sk.res;
        g.fillStyle = withAlpha(accent, theme.dark ? 0.14 : 0.08);
        roundRect(g, R.x + pad - 4, ny0, R.w - 2 * pad + 8, noteH - 4, 8);
        g.fill();
        g.fillStyle = accent;
        roundRect(g, R.x + pad - 4, ny0, 3, noteH - 4, 1.5);
        g.fill();
        noteLines.forEach((ln, i) => label(ln, R.x + pad + 8, ny0 + 5 + noteSz * 0.68 + i * noteSz * 1.35, noteFont, theme.text, 'left'));
        g.restore();
        return hh;
      };
    }

    /** Test: So prüfst du – drei Schritte mit Ergebnis. */
    function howCard(k: Intro, now: number): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const size = fs(12.5, 11.5);
        const font = `550 ${size}px ${theme.font}`;
        const lh = size * 1.36;
        const items = [
          say(L('Quotienten y : x berechnen. Alle gleich? → direkt proportional', 'Work out the quotients y : x. All equal? → directly proportional')),
          say(L('Produkte x · y berechnen. Alle gleich? → indirekt proportional', 'Work out the products x · y. All equal? → inversely proportional')),
          say(L('Sonst: weder noch. „Je mehr – desto mehr“ allein reicht nicht!', 'Otherwise: neither. “The more – the more” alone is not enough!')),
        ];
        const blocks = items.map((s) => wrapText(s, R.w - 2 * pad - 30, font));
        const hh = 40 + blocks.reduce((s, b) => s + b.length * lh + 8, 0) + 6;
        if (measure) return hh;
        const cls = classify(TABLES[tab()]);
        const ck = chkK(now);
        card({ ...R, h: hh }, col.k());
        cardTitle(R, say(L('So prüfst du', 'How to check')), col.k());
        let y = R.y + 40;
        const marks = [ck.qMark, ck.pMark, ck.verdict];
        const okv = [cls.verdict === 'dir', cls.verdict === 'ind', cls.verdict === 'none'];
        blocks.forEach((lines, i) => {
          const a = ease.outCubic(clamp01(k.stagger * 4 - i));
          g.save();
          g.globalAlpha *= a;
          const m = marks[i]!;
          const c = m > 0.5 ? (okv[i] ? col.ok() : theme.muted) : col.k();
          g.fillStyle = m > 0.5 && okv[i] ? withAlpha(col.ok(), 0.18) : withAlpha(c, 0.14);
          g.beginPath();
          g.arc(R.x + pad + 10, y + lh / 2, 10, 0, TAU);
          g.fill();
          label(m > 0.5 ? (okv[i] ? '✓' : '✗') : String(i + 1), R.x + pad + 10, y + lh / 2 + 0.5, `800 ${size}px ${theme.font}`, m > 0.5 ? (okv[i] ? col.ok() : col.bad()) : col.k());
          lines.forEach((ln, j) => label(ln, R.x + pad + 28, y + lh / 2 + j * lh, font, m > 0.5 && !okv[i] ? theme.muted : theme.text, 'left'));
          g.restore();
          y += lines.length * lh + 8;
        });
        return hh;
      };
    }

    /** Merke-Karte passend zur Situation. */
    function noteCard(k: Intro): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const size = roomy() ? 13 : fs(12.5, 11.5);
        const lh = size * 1.36;
        const kk = kind();
        const r = rel();
        const hide = !show();
        const paras: { s: string; color?: string; weight?: number }[] = [];
        if (isTest()) {
          paras.push({ s: say(L('Direkt proportional: y = k · x, Graph ist eine Ursprungsgerade. Indirekt proportional: y = k : x, Graph ist ein Hyperbelast.', 'Directly proportional: y = k · x, the graph is a line through the origin. Inversely proportional: y = k : x, the graph is a branch of a hyperbola.')) });
          paras.push({ s: say(L('Fallen: Grundgebühr (Taxi) und Größen ohne feste Regel (Alter und Größe).', 'Traps: a base fare (taxi) and quantities without a fixed rule (age and height).')), color: col.bad(), weight: 650 });
        } else if (kk === 'dir') {
          paras.push({ s: say(L('Doppelt so viel x → doppelt so viel y. Alle Quotienten y : x sind gleich (quotientengleich).', 'Double x → double y. All quotients y : x are equal.')) });
          paras.push({ s: hide ? say(L('Graph: Halbgerade durch den Ursprung.', 'Graph: a ray through the origin.')) : say(L(`Proportionalitätsfaktor k = ${ny(r.k)} €/kg, also y = ${ny(r.k)} · x. Graph: Halbgerade durch den Ursprung.`, `Constant of proportionality k = ${ny(r.k)} €/kg, so y = ${ny(r.k)} · x. Graph: a ray through the origin.`)), color: col.k(), weight: 650 });
        } else if (kk === 'ind') {
          paras.push({ s: say(L('Doppelt so viel x → halb so viel y. Alle Produkte x · y sind gleich (produktgleich).', 'Double x → half of y. All products x · y are equal.')) });
          paras.push({ s: hide ? say(L('Graph: Hyperbelast. Die Rechtecke unter den Punkten sind gleich groß.', 'Graph: a branch of a hyperbola. The rectangles under the points have the same area.')) : say(L(`x · y = ${nx(r.k)}, also y = ${nx(r.k)} : x. Graph: Hyperbelast – alle Rechtecke unter den Punkten haben die Fläche ${nx(r.k)}.`, `x · y = ${nx(r.k)}, so y = ${nx(r.k)} : x. Graph: a branch of a hyperbola – all rectangles under the points have area ${nx(r.k)}.`)), color: col.k(), weight: 650 });
        } else {
          paras.push({ s: say(L('Je weiter, desto teurer – aber nicht proportional: Bei doppelter Strecke zahlt man nicht das Doppelte.', 'The further, the dearer – but not proportional: twice the distance does not cost twice as much.')) });
          paras.push({ s: say(L('Die Quotienten y : x sind verschieden. Die Gerade geht nicht durch den Ursprung, sondern beginnt bei der Grundgebühr.', 'The quotients y : x differ. The line does not pass through the origin; it starts at the base fare.')), color: col.bad(), weight: 650 });
        }
        const blocks = paras.map((pp) => ({ lines: wrapText(pp.s, R.w - 2 * pad, `${pp.weight ?? 500} ${size}px ${theme.font}`), pp }));
        const hh = 40 + blocks.reduce((sum, b) => sum + b.lines.length * lh + 6, 0) + 6;
        if (measure) return hh;
        const accent = isTest() ? col.k() : kk === 'lin' ? col.bad() : col.ok();
        card({ ...R, h: hh }, accent);
        cardTitle(R, say(L('Merke', 'Key fact')), accent);
        let y = R.y + 40;
        g.save();
        g.globalAlpha *= ease.outCubic(clamp01(k.stagger * 3 - 1.2));
        for (const b of blocks) {
          b.lines.forEach((ln, i) => label(ln, R.x + pad, y + lh / 2 + i * lh, `${b.pp.weight ?? 500} ${size}px ${theme.font}`, b.pp.color ?? theme.text, 'left'));
          y += b.lines.length * lh + 6;
        }
        g.restore();
        return hh;
      };
    }

    function drawCards(C: Rect, k: Intro, now: number): void {
      const g = surface.g;
      const gap = fs(10, 8);
      let fadeK = 1;
      if (cardFade !== null) {
        const t = (now - cardFade) / 520;
        if (t >= 1) cardFade = null;
        else fadeK = clamp01(t);
      }
      const list: CardFn[] = isTest() ? [tableCard(k, now), howCard(k, now), noteCard(k)] : [tableCard(k, now), stepsCard(k, now), noteCard(k)];
      let y = C.y;
      colHit = [];
      list.forEach((fn, i) => {
        const R = { x: C.x, y, w: C.w, h: C.y + C.h - y };
        const hh = fn(R, true);
        if (hh <= 0 || hh > R.h + 1) return;
        g.save();
        const a = clamp01(k.cards * 1.6 - i * 0.25) * clamp01(fadeK * 2.2 - i * 0.35);
        g.globalAlpha *= ease.outCubic(a);
        g.translate((1 - ease.outCubic(a)) * 16, 0);
        fn({ ...R, h: hh }, false);
        g.restore();
        y += hh + gap;
      });
    }

    /* ---------- Ergebnisse ---------- */
    const fr = (a: string, b: string) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
    const v = (s: string) => `<var>${s}</var>`;
    function updateReadouts(): void {
      if (isTest()) {
        const pts = TABLES[tab()];
        const cls = classify(pts);
        ctx.readout('rule', cls.verdict === 'dir' ? { html: `${v('y')} = ${nx(cls.k!)} · ${v('x')} – ${say(VERDICT_NAME.dir)}` } : cls.verdict === 'ind' ? { html: `${v('y')} = ${fr(nx(cls.k!), v('x'))} – ${say(VERDICT_NAME.ind)}` } : say(L('keine proportionale Zuordnung (weder noch)', 'not a proportional relation (neither)')));
        ctx.readout('calc', null);
        ctx.readout('test', { html: `${v('y')} : ${v('x')}: ${cls.quotients.map((q) => fmt.num(Math.round(q * 100) / 100, 2)).join('; ')}<br>${v('x')} · ${v('y')}: ${cls.products.map((q) => fmt.num(Math.round(q * 100) / 100, 2)).join('; ')}` });
        ctx.readout('dbl', null);
        return;
      }
      const kk = kind();
      const r = rel();
      const x0 = x0P();
      const x = xP();
      if (kk === 'dir') ctx.readout('rule', { html: `${v('y')} = ${ny(r.k)} · ${v('x')} (${v('k')} = ${ny(r.k)} €/kg)` });
      else if (kk === 'ind') ctx.readout('rule', { html: `${v('y')} = ${fr(nx(r.k), v('x'))} (${v('x')} · ${v('y')} = ${nx(r.k)})` });
      else ctx.readout('rule', { html: `${v('y')} = ${ny(r.k)} · ${v('x')} + ${ny(r.b)} – ${say(L('nicht proportional (Grundgebühr)', 'not proportional (base fare)'))}` });
      const r3 = ruleOfThree(r, x0, x);
      if (r3) ctx.readout('calc', { html: r3.rows.map(([a, b]) => `${xu(a)} ≙ ${yu(b)}`).join(' → ') });
      else ctx.readout('calc', { html: `${xu(x0)} ≙ ${yu(value(r, x0))}, ${say(L('aber', 'but'))} ${xu(x)} ≙ <strong>${yu(value(r, x))}</strong> (${say(L('nicht', 'not'))} ${yu(naiveGuess(r, x0, x), 'lin', false)})` });
      const y0 = value(r, x0);
      const y1 = value(r, x);
      if (kk === 'dir') ctx.readout('test', { html: `${v('y')} : ${v('x')} = ${ny(y0)} : ${nx(x0)} = ${ny(y1)} : ${nx(x)} = ${ny(r.k)} – ${say(L('quotientengleich', 'equal quotients'))}` });
      else if (kk === 'ind') ctx.readout('test', { html: `${v('x')} · ${v('y')} = ${nx(x0)} · ${ny(y0)} = ${nx(x)} · ${ny(y1)} = ${nx(r.k)} – ${say(L('produktgleich', 'equal products'))}` });
      else ctx.readout('test', { html: `${ny(y0)} : ${nx(x0)} ≈ ${fmt.num(Math.round((y0 / x0) * 100) / 100, 2)}, ${ny(y1)} : ${nx(x)} ≈ ${fmt.num(Math.round((y1 / x) * 100) / 100, 2)} – ${say(L('nicht quotientengleich', 'quotients differ'))}` });
      const { u } = storyBase(kk, x0);
      const sy = scaleY(r, u, 2);
      const opY = kk === 'dir' ? '·2' : kk === 'ind' ? ':2' : `·${fmt.num(Math.round(sy.fy * 100) / 100, 2)}, ${say(L('nicht ·2', 'not ·2'))}`;
      ctx.readout('dbl', { html: `${xu(u)} → ${xu(2 * u)} (·2): ${yu(sy.y0)} → ${yu(sy.y1)} (${opY})` });
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      let anim = false;
      for (const c of [X, K, B, RECT, XM, YM]) if (c.step(now, dt)) anim = true;
      if (story && now - story.t0 > storyLen(story)) story = null;
      if (steps && now - steps.t0 > STEPS_LEN) steps = null;
      if (chk && now - chk.t0 > chkTimes(chk.n).end) chk = null;
      if (fill && now - fill.t0 > fill.dur + 50) fill = null;
      if (story || steps || chk || fill || intro !== null || graphFade || dragging()) anim = true;
      if (sceneFade !== null && now - sceneFade > 800) sceneFade = null;
      if (tableFade !== null && now - tableFade > 600) tableFade = null;
      if (sceneFade !== null || cardFade !== null || tableFade !== null) anim = true;
      const k = introState(now);
      const R = regions();
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      g.save();
      g.globalAlpha = k.panel;
      g.translate(0, (1 - k.panel) * 10);
      drawScene(R.scene, k, now);
      drawGraph(k, now);
      g.restore();
      drawCards(R.col, k, now);
      if (anim) ctx.requestRender();
    }

    /* ---------- Übergänge ---------- */
    function retarget(now: number, source: string, kindChanged: boolean): void {
      const instant = source === 'init' || reduced();
      const targets: [Chan, number][] = [
        [X, xP()],
        [K, kOf(kind())],
        [B, pr.b],
      ];
      for (const [c, val] of targets) {
        if (instant || kindChanged) c.jump(val);
        else if (dragging()) c.follow(val, 0.04);
        else if (source === 'replace') c.glide(val, 850, 0, now);
        else if (Math.abs(c.goal - val) > 1e-12) c.follow(val, 0.14);
      }
      const rv = pr.rect ? 1 : 0;
      if (instant) RECT.jump(rv);
      else if (RECT.goal !== rv) RECT.glide(rv, 450, 0, now);
      const [xm, ym] = rangeGoal();
      if (instant) {
        XM.jump(xm);
        YM.jump(ym);
      } else if (kindChanged || source === 'replace') {
        XM.glide(xm, 750, 0, now);
        YM.glide(ym, 750, 0, now);
      } else {
        XM.follow(xm, 0.25);
        YM.follow(ym, 0.25);
      }
    }

    /* ---------- Zeiger ---------- */
    plot.addHandle({
      get: () => {
        const xs = X.v;
        return [xs, value(shownRel(), xs)];
      },
      set: (x) => {
        lastDrag = performance.now();
        const v2 = clampX(kind(), x);
        if (v2 !== pr.x) ctx.set({ x: v2 });
      },
      axis: 'x',
      enabled: () => !ctx.locked && !isTest() && show() && !story,
      color: () => col.g(),
    });

    new TapTarget(surface, {
      hit: (px, py) => {
        if (ctx.locked) return null;
        if (isTest()) {
          if (chk) return null;
          for (const c of chipHit) if (px >= c.r.x && px <= c.r.x + c.r.w && py >= c.r.y && py <= c.r.y + c.r.h) return `v:${c.v}`;
          return null;
        }
        if (story) return null;
        for (const c of colHit) if (px >= c.r.x && px <= c.r.x + c.r.w && py >= c.r.y && py <= c.r.y + c.r.h) return c.id;
        return null;
      },
      onHover: (id) => {
        if (id !== hoverId) {
          hoverId = id;
          ctx.requestRender();
        }
      },
      onTap: (id) => {
        if (ctx.locked) return;
        if (id.startsWith('v:')) {
          const vv = id.slice(2) as Verdict;
          if (chkK(performance.now()).verdict > 0.5 && show()) {
            // schon aufgelöst: neue Vermutung startet neu verdeckt
            guess = vv;
            ctx.set({ show: false });
          } else guess = vv;
          ctx.requestRender();
          return;
        }
        if (id.startsWith('c:')) {
          const x = Number(id.slice(2));
          if (Number.isFinite(x)) ctx.set({ x: clampX(kind(), x) });
        }
      },
    });

    return {
      update(changed, source) {
        const now = performance.now();
        if (source === 'input' && changed.has('kind') && !isTest()) ctx.set({ ...START[kind()] });
        if (!isTest()) {
          const kk = kind();
          const cx = clampX(kk, pr.x);
          const c0 = clampX(kk, pr.x0);
          if (cx !== pr.x || c0 !== pr.x0) ctx.set({ x: cx, x0: c0 });
        }
        const kindChanged = mode() !== prevMode;
        const tabChanged = changed.has('tab') && isTest();
        if (kindChanged || tabChanged) guess = null;
        if (source === 'input' || source === 'replace') {
          if ([...changed].some((key) => key !== 'show' && key !== 'rect')) {
            story = null;
            steps = null;
            chk = null;
          }
          if (changed.has('show') && isTest()) chk = null;
        }
        retarget(now, source, kindChanged || tabChanged);
        if (source !== 'init' && !reduced()) {
          if (kindChanged || tabChanged || source === 'replace') {
            sceneFade = now;
            cardFade = now;
            graphFade = { t0: now, from: kindChanged && prevMode !== 'test' ? prevRel : null };
          }
          if (kindChanged || changed.has('x0') || source === 'replace') tableFade = now;
          if ((kindChanged || source === 'replace') && kind() === 'ind' && !isTest()) startFill(now, 350);
        }
        if (source === 'init' && !reduced()) {
          intro = now;
          startFill(now, 600);
        }
        prevMode = mode();
        prevRel = rel();
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'double') {
          steps = null;
          if (!pr.show) ctx.set({ show: true });
          if (reduced()) return;
          const { u, factors } = storyBase(kind(), x0P());
          story = { t0: now, u, fs: factors, startX: X.v };
          if (kind() === 'ind') {
            // Becken füllt sich nach jedem Schritt neu – schneller, wenn mehr Pumpen da sind
            const at = (i: number) => (i === 0 ? ST_PRE : ST_PRE + (i - 1) * ST_STEP + 1000);
            factors.forEach((f2, i) => {
              const y = value(rel(), f2 * u);
              const t0 = now + at(i);
              setTimeout(() => {
                if (story && story.t0 === now) {
                  fill = { t0, dur: clamp(y * 110, 380, 3200) };
                  ctx.requestRender();
                }
              }, Math.max(0, at(i) - 5));
            });
          }
        } else if (id === 'steps') {
          story = null;
          if (!pr.show) ctx.set({ show: true });
          if (!reduced()) steps = { t0: now };
        } else if (id === 'check') {
          if (!pr.show) ctx.set({ show: true });
          if (!reduced()) chk = { t0: now, n: TABLES[tab()].length };
        } else if (id === 'next') {
          const i = TAB_IDS.indexOf(tab());
          guess = null;
          ctx.set({ tab: TAB_IDS[(i + 1) % TAB_IDS.length]!, show: false });
          if (!reduced()) {
            sceneFade = now;
            cardFade = now;
            graphFade = { t0: now, from: null };
          }
        }
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
