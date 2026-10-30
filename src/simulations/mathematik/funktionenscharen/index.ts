import { defineSimulation, drawCard, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, textOn, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import { branchXRange, caseAt, caseIndex, FAMS, inDom, K_MAX, K_MIN, nearestK, sweepK, sweepLength, bounceK, type Branch, type FamKey, type Family } from './model';

const L = (de: string, en: string) => ({ de, en });
type Txt = { de: string; en: string };
type Lng = 'de' | 'en';
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

type Target = Parameters<Surface['addTarget']>[0];
type Ptr = Parameters<Target['pointerDown']>[0];

/** Geschwindigkeit von k beim Abspielen (k-Einheiten pro Sekunde). */
const RUN_SPEED = 0.85;
/** Dauer von „k durchlaufen lassen“ je k-Einheit in ms. */
const SWEEP_MS_PER_K = 620;
/** Werte von k für die blassen Scharkurven. */
const FAN: number[] = Array.from({ length: 13 }, (_, i) => K_MIN + i * 0.5);
/** Anzahl der Schritte der Herleitung der Ortskurve. */
const DV = 4;

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
  get busy(): boolean {
    return this.tw !== null || this.v !== this.goal;
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
    if (Math.abs(this.goal - this.v) <= 1e-6 * (1 + Math.abs(this.goal))) this.v = this.goal;
    return true;
  }
}

/**
 * Texte und Formeln je Schar (Kurzschrift aus formula.ts; „¿“ wird bei
 * verdeckten Ergebnissen zum Platzhalter).
 */
interface Info {
  /** Bildausschnitt */
  x: [number, number];
  y: [number, number];
  term: string;
  d1: string;
  d2: string;
  /** notwendige Bedingung f′ = 0, umgeformt */
  cond: string;
  /** Fälle (gleiche Reihenfolge wie FAMS[…].cases): Bedingung, Ergebnis, kurze Beschriftung auf dem k-Strahl */
  cases: { k: string; res: Txt; short: Txt }[];
  /** Herleitung der Ortskurve in vier Schritten */
  loc: [string, string, string, string];
  /** Probe zu Schritt 2: k aus der x-Koordinate */
  probe: (x: string) => string;
  /** Lücke der Ortskurve (z. B. „x ≠ 0“) */
  gap: string | null;
  /** welche Extrempunkte wandern (Name der Ortskurve) */
  locOf: Txt;
  /** gemeinsame Punkte: Gleichsetzen, Umformen, Ergebnis */
  com: [string, string, string];
  /** Wendepunkte: Bedingung, Ergebnis, Ortskurve (null: keine Ortskurve) */
  wp: [string, string, string | null];
}

const INFO: Record<FamKey, Info> = {
  cub: {
    x: [-3, 3],
    y: [-5, 5],
    term: 'x³ − kx',
    d1: '3x² − k',
    d2: '6x',
    cond: '3x² − k = 0  ⇔  x² = \\f{k}{3}',
    cases: [
      { k: 'k < 0', res: L('f′ₖ(x) = 3x² − k > 0: streng monoton steigend, keine Extrempunkte', 'f′ₖ(x) = 3x² − k > 0: strictly increasing, no extrema'), short: L('keine Extrema', 'no extrema') },
      { k: 'k = 0', res: L('f(x) = x³: Terrassenpunkt (0 | 0)', 'f(x) = x³: saddle point (0, 0)'), short: L('Terrassenpunkt (0 | 0)', 'saddle point (0, 0)') },
      { k: 'k > 0', res: L('Hoch- und Tiefpunkt bei x = ±√(k/3)', 'maximum and minimum at x = ±√(k/3)'), short: L('H und T', 'max. and min.') },
    ],
    loc: ['x_E = ±\\r{\\f{k}{3}}, y_E = ∓\\f{2k}{3} · \\r{\\f{k}{3}}', 'x² = \\f{k}{3}  ⇒  k = 3x²', 'y = x³ − k · x = x³ − 3x² · x', 'y = −2x³'],
    probe: (x) => `3 · (${x})²`,
    gap: 'x ≠ 0',
    locOf: L('Hoch- und Tiefpunkte', 'maxima and minima'),
    com: ['x³ − k₁x = x³ − k₂x', '(k₂ − k₁) · x = 0  ⇒  x = 0', '(0 | 0)'],
    wp: ['f_k″(x) = 6x = 0  ⇒  x = 0', 'W(0 | 0)', null],
  },
  par: {
    x: [-3, 4],
    y: [-8, 4],
    term: 'x² − 2kx + k',
    d1: '2x − 2k',
    d2: '2',
    cond: '2x − 2k = 0  ⇔  x = k',
    cases: [{ k: 'k ∈ ℝ', res: L('immer ein Tiefpunkt T(k | k − k²), denn f″ₖ = 2 > 0', 'always a minimum at (k, k − k²), since f″ₖ = 2 > 0'), short: L('Tiefpunkt', 'minimum') }],
    loc: ['x_E = k, y_E = k − k²', 'k = x', 'y = k − k² = x − x²', 'y = x − x²'],
    probe: (x) => x,
    gap: null,
    locOf: L('Tiefpunkte (Scheitel)', 'minima (vertices)'),
    com: ['x² − 2k₁x + k₁ = x² − 2k₂x + k₂', '(k₂ − k₁) · (2x − 1) = 0  ⇒  x = \\f{1}{2}', '(0,5 | 0,25)'],
    wp: ['f_k″(x) = 2 ≠ 0', '', null],
  },
  exp: {
    x: [-3.5, 6],
    y: [-1.8, 2.2],
    term: 'x · e^{−kx}',
    d1: '(1 − kx) · e^{−kx}',
    d2: 'k · (kx − 2) · e^{−kx}',
    cond: '1 − kx = 0  ⇔  x = \\f{1}{k}  \\t{(k ≠ 0)}',
    cases: [
      { k: 'k < 0', res: L('Tiefpunkt (1/k | 1/(ke))', 'minimum (1/k, 1/(ke))'), short: L('Tiefpunkt', 'minimum') },
      { k: 'k = 0', res: L('f(x) = x: keine Extrempunkte', 'f(x) = x: no extrema'), short: L('keine Extrema', 'no extrema') },
      { k: 'k > 0', res: L('Hochpunkt (1/k | 1/(ke))', 'maximum (1/k, 1/(ke))'), short: L('Hochpunkt', 'maximum') },
    ],
    loc: ['x_E = \\f{1}{k}, y_E = \\f{1}{k · e}', 'x = \\f{1}{k}  ⇒  k = \\f{1}{x}', 'y = \\f{1}{k · e} = \\f{x}{e}', 'y = \\f{x}{e}'],
    probe: (x) => `\\f{1}{${x}}`,
    gap: 'x ≠ 0',
    locOf: L('Hoch- und Tiefpunkte', 'maxima and minima'),
    com: ['x · e^{−k₁x} = x · e^{−k₂x}', 'x · (e^{−k₁x} − e^{−k₂x}) = 0  ⇒  x = 0', '(0 | 0)'],
    wp: ['k(kx − 2) = 0  ⇒  x = \\f{2}{k}', 'W(\\f{2}{k} | \\f{2}{k · e²})', 'y = \\f{x}{e²}'],
  },
  quart: {
    x: [-3, 3],
    y: [-3, 3.5],
    term: 'kx² − x^4',
    d1: '2kx − 4x³',
    d2: '2k − 12x²',
    cond: '2x · (k − 2x²) = 0  ⇔  x = 0 \\t{oder} x² = \\f{k}{2}',
    cases: [
      { k: 'k ≤ 0', res: L('nur ein Hochpunkt H(0 | 0)', 'only one maximum at (0, 0)'), short: L('ein Hochpunkt', 'one maximum') },
      { k: 'k > 0', res: L('H(±√(k/2) | k²/4) und T(0 | 0): M-Form', 'max. at (±√(k/2), k²/4), min. at (0, 0): M shape'), short: L('2 H, 1 T', '2 max., 1 min.') },
    ],
    loc: ['x_E = ±\\r{\\f{k}{2}}, y_E = \\f{k²}{4}', 'x² = \\f{k}{2}  ⇒  k = 2x²', 'y = \\f{k²}{4} = \\f{(2x²)²}{4}', 'y = x^4'],
    probe: (x) => `2 · (${x})²`,
    gap: 'x ≠ 0',
    locOf: L('Hochpunkte', 'maxima'),
    com: ['k₁x² − x^4 = k₂x² − x^4', '(k₁ − k₂) · x² = 0  ⇒  x = 0', '(0 | 0)'],
    wp: ['2k − 12x² = 0  ⇒  x = ±\\r{\\f{k}{6}}  \\t{(k > 0)}', 'W(±\\r{\\f{k}{6}} | \\f{5k²}{36})', 'y = 5x^4'],
  },
  expk: {
    x: [-5, 3],
    y: [-5, 3],
    term: '(x − k) · e^x',
    d1: '(x − k + 1) · e^x',
    d2: '(x − k + 2) · e^x',
    cond: 'x − k + 1 = 0  ⇔  x = k − 1',
    cases: [{ k: 'k ∈ ℝ', res: L('immer ein Tiefpunkt T(k − 1 | −e^(k−1))', 'always a minimum at (k − 1, −e^(k−1))'), short: L('Tiefpunkt', 'minimum') }],
    loc: ['x_E = k − 1, y_E = −e^{k − 1}', 'x = k − 1  ⇒  k = x + 1', 'y = −e^{(x + 1) − 1}', 'y = −e^x'],
    probe: (x) => `${x} + 1`,
    gap: null,
    locOf: L('Tiefpunkte', 'minima'),
    com: ['(x − k₁) · e^x = (x − k₂) · e^x', '(k₂ − k₁) · e^x = 0', ''],
    wp: ['x − k + 2 = 0  ⇒  x = k − 2', 'W(k − 2 | −2e^{k − 2})', 'y = −2e^x'],
  },
};

/** Titel der vier Schritte der Herleitung. */
const DV_TITLES: Txt[] = [
  L('Extrempunkt in Abhängigkeit von k', 'Extremum depending on k'),
  L('x-Koordinate nach k auflösen', 'Solve the x-coordinate for k'),
  L('k in die y-Koordinate einsetzen', 'Substitute k into the y-coordinate'),
  L('Gleichung der Ortskurve', 'Equation of the locus'),
];

/**
 * Funktionenscharen f_k mit dem Parameter k: Im großen Koordinatensystem
 * fächern viele Scharkurven blass auf (Farbverlauf nach k), die aktuelle
 * Kurve f_k ist kräftig. Ihre Extrempunkte sind Perlen, die beim Ändern von k
 * auf der Ortskurve gleiten und eine leuchtende Spur hinterlassen; sie lassen
 * sich direkt ziehen (k folgt). Gemeinsame Punkte aller Scharkurven sind als
 * Knoten markiert, wahlweise auch Wendepunkte und ihre Ortskurve. Unter dem
 * Bild ein k-Strahl als Zeitleiste mit der Fallunterscheidung (ziehbar, mit
 * Abspielknopf: „k läuft“). Rechts bzw. darunter Karten mit Ableitungen,
 * Fallunterscheidung (der aktuelle Fall ist hervorgehoben), der Herleitung
 * der Ortskurve in vier Schritten und der Rechnung zu gemeinsamen Punkten.
 * Mit „Ergebnisse zeigen“ aus wird daraus eine Aufgabe mit Aufdecken.
 */
export default defineSimulation({
  id: 'funktionenscharen',
  dragHint: true,
  hint: { de: 'Tipp: Zieh eine rote Perle entlang der Ortskurve – k folgt. ▶ auf dem k-Strahl lässt k laufen, eine blasse Kurve antippen springt zu ihr.', en: 'Tip: Drag a red bead along the locus – k follows. ▶ on the k-axis runs k, tapping a faint curve jumps to it.' },
  animated: true,
  layout: { aspect: 1.2, aspectNarrow: 0.34 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'fam',
      type: 'choice',
      label: L('Schar', 'Family'),
      options: [
        { value: 'cub', label: L('f_k(x) = x³ − kx', 'f_k(x) = x³ − kx') },
        { value: 'par', label: L('f_k(x) = x² − 2kx + k', 'f_k(x) = x² − 2kx + k') },
        { value: 'exp', label: L('f_k(x) = x · e^(−kx)', 'f_k(x) = x · e^(−kx)') },
        { value: 'quart', label: L('f_k(x) = kx² − x⁴', 'f_k(x) = kx² − x⁴') },
        { value: 'expk', label: L('f_k(x) = (x − k) · eˣ', 'f_k(x) = (x − k) · eˣ') },
      ],
      default: 'cub',
    },
    {
      key: 'k',
      type: 'number',
      label: L('Parameter k', 'Parameter k'),
      help: L('Auch einen Extrempunkt ziehen, eine blasse Scharkurve antippen oder den Punkt auf dem k-Strahl ziehen.', 'You can also drag an extremum, tap a faint member of the family or drag the point on the k-axis.'),
      min: K_MIN,
      max: K_MAX,
      step: 0.1,
      default: 1.5,
    },
    {
      key: 'dv',
      type: 'number',
      label: L('Herleitung der Ortskurve: Schritt', 'Derivation of the locus: step'),
      help: L('Auch die Punkte 1 bis 4 in der Karte „Ortskurve“ antippen.', 'You can also tap the dots 1 to 4 on the “Locus” card.'),
      min: 1,
      max: DV,
      step: 1,
      default: DV,
    },
    { key: 'many', type: 'boolean', group: 'view', label: L('Weitere Scharkurven zeigen', 'Show more members of the family'), default: true },
    { key: 'ext', type: 'boolean', group: 'view', label: L('Extrempunkte markieren', 'Mark the extrema'), default: true },
    { key: 'loc', type: 'boolean', group: 'view', label: L('Ortskurve der Extrempunkte', 'Locus of the extrema'), default: true, visibleIf: (v) => v.ext !== false },
    { key: 'wp', type: 'boolean', group: 'view', label: L('Wendepunkte und ihre Ortskurve', 'Points of inflection and their locus'), default: false },
    { key: 'show', type: 'boolean', group: 'view', label: L('Ergebnisse zeigen', 'Show the results'), help: L('Aus: Ableitungen, Extrempunkte, Ortskurve und gemeinsame Punkte selbst bestimmen, danach aufdecken.', 'Off: find derivatives, extrema, locus and common points yourself, then reveal.'), default: true },
  ],
  actions: [
    { id: 'sweep', label: L('k durchlaufen lassen', 'Run through k'), primary: true },
    { id: 'dnext', label: L('Herleitung: nächster Schritt', 'Derivation: next step') },
    { id: 'clear', label: L('Spur löschen', 'Clear the trace') },
    { id: 'reveal', label: L('Ergebnisse aufdecken', 'Reveal the results'), primary: true, visibleIf: (v) => v.show !== true },
  ],
  readouts: [
    { key: 'ext', label: L('Extrempunkte', 'Extrema'), spoiler: true },
    { key: 'loc', label: L('Ortskurve', 'Locus'), spoiler: true },
    { key: 'com', label: L('Gemeinsame Punkte', 'Common points'), spoiler: true },
    { key: 'wp', label: L('Wendepunkte', 'Points of inflection'), spoiler: true },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'cub', label: L('x³ − kx', 'x³ − kx'), values: {} },
    { id: 'cubneg', label: L('x³ − kx mit k < 0: keine Extrema', 'x³ − kx with k < 0: no extrema'), values: { fam: 'cub', k: -1.5 } },
    { id: 'par', label: L('Parabelschar mit gemeinsamem Punkt', 'Parabolas with a common point'), values: { fam: 'par', k: 1 } },
    { id: 'exp', label: L('x · e^(−kx)', 'x · e^(−kx)'), values: { fam: 'exp', k: 1 } },
    { id: 'quart', label: L('kx² − x⁴: M-Form oder umgedrehtes U', 'kx² − x⁴: M shape or upside-down U'), values: { fam: 'quart', k: 2 } },
    { id: 'expk', label: L('(x − k) · eˣ: kein gemeinsamer Punkt', '(x − k) · eˣ: no common point'), values: { fam: 'expk', k: 1 } },
    { id: 'wp', label: L('Wendepunkte von x · e^(−kx)', 'Inflection points of x · e^(−kx)'), values: { fam: 'exp', k: 1, wp: true } },
  ],
  strings: {
    de: {
      canvas:
        'Koordinatensystem mit vielen Graphen einer Funktionenschar f_k (blass, Farbverlauf nach k) und dem Graphen für den gewählten Parameter k (kräftig). Die Extrempunkte sind Perlen, die beim Ändern von k auf ihrer gestrichelten Ortskurve gleiten, eine leuchtende Spur hinterlassen und sich entlang der Ortskurve ziehen lassen. Gemeinsame Punkte aller Scharkurven sind als grüne Knoten markiert, wahlweise auch die Wendepunkte mit ihrer Ortskurve. Darunter ein k-Strahl mit Abspielknopf und der Fallunterscheidung nach k. Daneben Karten mit Scharterm und Ableitungen, Fallunterscheidung, Herleitung der Ortskurve in vier Schritten, Rechnung zu gemeinsamen Punkten und Wendepunkten.',
    },
    en: {
      canvas:
        'Coordinate system with many graphs of a family of functions f_k (faint, coloured by k) and the graph for the chosen parameter k (bold). The extrema are beads that glide along their dashed locus when k changes, leave a glowing trace and can be dragged along the locus. Points common to all members are marked as green nodes, optionally also the points of inflection with their locus. Below it a k-axis with a play button and the case analysis by k. Next to it cards with the family, its derivatives, the case analysis, the derivation of the locus in four steps and the calculation of common points and points of inflection.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const reduced = () => prefersReducedMotion();
    const lang = ctx.lang as Lng;
    const T2 = (de: string, en: string) => (lang === 'de' ? de : en);
    const TX = (t: Txt) => (lang === 'de' ? t.de : t.en);
    const setP = (vals: Record<string, number | boolean | string>) => ctx.set(vals as never);
    const editable = () => !ctx.locked;
    const key = () => p.fam as FamKey;
    const fam = (): Family => FAMS[key()];
    const info = (): Info => INFO[key()];

    /* ---------- Farben (gleiche Farbe = gleiche Größe in Bild, Strahl und Karten) ---------- */
    const col = {
      f: () => th().series[0]!,
      ext: () => th().series[1]!,
      com: () => th().series[2]!,
      loc: () => th().series[3]!,
      wp: () => th().series[4]!,
      fanA: () => th().series[5]!,
    };
    /** Farbe einer Scharkurve: Verlauf von Türkis (k = −3) nach Blau (k = 3). */
    const fanColor = (k: number) => mixColor(col.fanA(), col.f(), clamp01((k - K_MIN) / (K_MAX - K_MIN)));

    /* ---------- Zahlen ---------- */
    const clean = (v: number, d: number) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v);
    const N = (v: number, d = 2) => (Number.isFinite(v) ? fmt.num(clean(v, d), d) : '–');
    const sep = lang === 'de' ? ' | ' : ', ';
    const pt = (x: string, y: string) => `(${x}${sep}${y})`;
    const show = () => p.show;
    /** Wert oder Platzhalter „¿“ (wird als gestrichelter Kasten mit „?“ gezeichnet). */
    const S = (s: string) => (show() ? s : '¿');
    /** englische Fassung der Punktschreibweise in Formeln */
    const P = (src: string) => (lang === 'de' ? src : src.replace(/ \| /g, ', ').replace(/(\d),(\d)/g, '$1.$2'));
    // im Aufgabenmodus neutral „E“, damit die Art des Punktes nicht verraten wird
    // Kürzel im Bild: DE H, T, TP (Terrassenpunkt), W, E (Extrempunkt, verdeckt); EN Max, Min, SP (saddle point), I, Ext
    const kName = (kind: 'max' | 'min' | 'saddle' | 'infl') =>
      kind === 'infl' ? T2('W', 'I') : !p.show ? T2('E', 'Ext') : kind === 'max' ? T2('H', 'Max') : kind === 'min' ? T2('T', 'Min') : T2('TP', 'SP');
    const kLong = (kind: 'max' | 'min' | 'saddle') => (kind === 'max' ? T2('Hochpunkt', 'maximum') : kind === 'min' ? T2('Tiefpunkt', 'minimum') : T2('Terrassenpunkt', 'saddle point'));
    /** k gerundet auf eine Stelle (wie im Regler) */
    const k1 = (k: number) => Math.round(k * 10) / 10;

    /* ---------- Zustand ---------- */
    /** angezeigtes k (gleitet dem Parameter nach bzw. läuft beim Abspielen) */
    const KS = new Chan(p.k);
    /** Bildausschnitt (gleitet beim Wechsel der Schar) */
    const VX0 = new Chan(INFO[key()].x[0]);
    const VX1 = new Chan(INFO[key()].x[1]);
    const VY0 = new Chan(INFO[key()].y[0]);
    const VY1 = new Chan(INFO[key()].y[1]);
    const kMany = new Chan(p.many ? 1 : 0);
    const kExt = new Chan(p.ext ? 1 : 0);
    const kLoc = new Chan(p.loc ? 1 : 0);
    const kWp = new Chan(p.wp ? 1 : 0);
    const kShow = new Chan(p.show ? 1 : 0);
    /** Hervorhebung des aktuellen Falls (Zeilenindex, gleitet) */
    const kCase = new Chan(caseIndex(fam(), p.k));
    /** Sichtbarkeit und „gerade dran“ der Herleitungsschritte */
    const vis = Array.from({ length: DV + 1 }, (_, i) => new Chan(i >= 1 && p.dv >= i ? 1 : 0));
    const foc = Array.from({ length: DV + 1 }, (_, i) => new Chan(p.dv === i ? 1 : 0));
    const dvPos = new Chan(p.dv);
    const cardH = new Map<string, Chan>();
    const chans = () => [KS, VX0, VX1, VY0, VY1, kMany, kExt, kLoc, kWp, kShow, kCase, dvPos, ...vis, ...foc, ...cardH.values()];

    let intro: number | null = null;
    /** Wechsel der Schar: alte Kurven blenden aus, neue fächern auf */
    let famIn: number | null = null;
    let prevFam: { key: FamKey; k: number; t0: number } | null = null;
    /** gerade erreichter Herleitungsschritt (kleine Animation) */
    let story: { step: number; t0: number } | null = null;
    let dvT0 = -1e9;
    let lastDv = p.dv;
    /** Abspielen: Richtung von k */
    let runDir: 1 | -1 = -1;
    /** „k durchlaufen lassen“: eine Runde, danach Pause */
    let sweep: { k0: number; s: number; len: number } | null = null;
    /** Spur: überstrichener k-Bereich und die jüngsten Werte (für den leuchtenden Schweif) */
    let trail: { lo: number; hi: number } | null = null;
    let recent: { k: number; t: number }[] = [];
    let lastTime = performance.now();
    let frameNow = performance.now();
    let frameDt = 0;
    let numsBusy = false;
    let lastDrag = -Infinity;
    let drag: { kind: 'pearl'; b: Branch; off: [number, number] } | { kind: 'strip'; moved: boolean } | null = null;
    let hover: { id: string; px: number; py: number } | null = null;
    const dragging = () => drag !== null || performance.now() - lastDrag < 250;
    const playing = () => ctx.clock.playing;

    /** k, das gerade gezeigt wird */
    const shownK = () => KS.v;

    /* ---------- weich zählende Zahlen ---------- */
    const nums = new Map<string, { c: Chan; at: number }>();
    function cnt(id: string, v: number): number {
      if (!Number.isFinite(v) || reduced()) return v;
      let e = nums.get(id);
      if (!e) {
        e = { c: new Chan(intro !== null ? 0 : v), at: -1 };
        nums.set(id, e);
      }
      if (e.at !== frameNow) {
        e.at = frameNow;
        if (Math.abs(e.c.v - v) > 40 * Math.max(1, Math.abs(v))) e.c.jump(v);
        e.c.follow(v, dragging() || playing() || sweep ? 0.03 : 0.18);
        if (e.c.step(frameNow, frameDt)) numsBusy = true;
      }
      return e.c.v;
    }
    /** gezählte, formatierte Zahl; am Ziel exakt */
    const cN = (id: string, v: number, d = 2) => {
      const s = cnt(id, v);
      return N(Math.abs(s - v) < 1e-9 * Math.max(1, Math.abs(v)) ? v : s, d);
    };

    /* ---------- Aufteilung (nach Breite UND Höhe) ---------- */
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.15;
    const sm = () => surface.width < 560;
    const fs = (big: number, small: number) => (sm() ? small : big);
    const STRIP = () => fs(64, 60);
    function regions(): { plot: Rect; strip: Rect; col: Rect; wide: boolean } {
      const w = surface.width;
      const h = surface.height;
      const sh = STRIP();
      if (isWide()) {
        const cw = Math.round(clamp(w * 0.37, 240, 400));
        const pw = w - cw - 12;
        return { plot: { x: 0, y: 0, w: pw, h: h - sh - 8 }, strip: { x: 0, y: h - sh, w: pw, h: sh }, col: { x: w - cw, y: 0, w: cw, h }, wide: true };
      }
      const ph = Math.round(clamp(w * 0.98, 280, h * 0.42));
      return { plot: { x: 0, y: 0, w, h: ph }, strip: { x: 0, y: ph + 8, w, h: sh }, col: { x: 0, y: ph + sh + 18, w, h: h - ph - sh - 18 }, wide: false };
    }
    const plot = new Plot(surface, { x: [-3, 3], y: [-5, 5], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().plot, xAxis: { label: 'x' }, yAxis: { label: 'y' } });
    const pad = () => ({ left: fs(12, 8), right: fs(12, 8), top: fs(44, 40), bottom: fs(14, 12) });

    function retargetView(now: number, instant: boolean): void {
      const I = info();
      const pairs: [Chan, number][] = [
        [VX0, I.x[0]],
        [VX1, I.x[1]],
        [VY0, I.y[0]],
        [VY1, I.y[1]],
      ];
      for (const [c, goal] of pairs) {
        if (instant || reduced()) c.jump(goal);
        else if (Math.abs(c.goal - goal) > 1e-9) c.glide(goal, 800, 0, now);
      }
    }

    /* ---------- Formeln ---------- */
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { f: col.f(), x: col.ext(), l: col.loc(), c: col.com(), w: col.wp(), m: th().muted, t: th().text },
    });
    /** Gestalteter Platzhalter für verdeckte Ergebnisse: gestrichelte Pille mit „?“. */
    function phBox(size: number, w = size * 2.6): FormulaBox {
      const h = size * 1.3;
      return {
        w,
        asc: h * 0.72,
        desc: h * 0.32,
        draw(g2, x, y) {
          const top = y - h * 0.72;
          g2.save();
          g2.fillStyle = withAlpha(th().muted, th().dark ? 0.14 : 0.09);
          roundRect(g2, x, top, w, h + 1, h / 2);
          g2.fill();
          g2.strokeStyle = withAlpha(th().muted, 0.65);
          g2.lineWidth = 1.1;
          g2.setLineDash([3, 3]);
          roundRect(g2, x + 0.5, top + 0.5, w - 1, h, h / 2);
          g2.stroke();
          g2.setLineDash([]);
          g2.font = `800 ${Math.round(size * 0.92)}px ${th().font}`;
          g2.fillStyle = th().muted;
          g2.textAlign = 'center';
          g2.textBaseline = 'middle';
          g2.fillText('?', x + w / 2, top + h / 2 + 1);
          g2.restore();
        },
      };
    }
    /** Mehrere Kästen nebeneinander (gemeinsame Grundlinie). */
    function hcat(boxes: FormulaBox[], gap = 0): FormulaBox {
      let w = 0;
      let asc = 0;
      let desc = 0;
      boxes.forEach((b, i) => {
        w += b.w + (i ? gap : 0);
        asc = Math.max(asc, b.asc);
        desc = Math.max(desc, b.desc);
      });
      return {
        w,
        asc,
        desc,
        draw(g2, x, y) {
          let cx = x;
          boxes.forEach((b, i) => {
            if (i) cx += gap;
            b.draw(g2, cx, y);
            cx += b.w;
          });
        },
      };
    }
    /** Formel mit Platzhaltern: „¿“ wird zum Kasten mit „?“; Farbbefehle müssen innerhalb eines Stücks geschlossen sein. */
    function fx(src: string, size: number, color = th().text, weight = 600): FormulaBox {
      const g = surface.g;
      if (!src.includes('¿')) return formula(g, src, fstyle(size, color, weight));
      const parts = src.split('¿');
      const boxes: FormulaBox[] = [];
      parts.forEach((s, i) => {
        if (s) boxes.push(formula(g, s, fstyle(size, color, weight)));
        if (i < parts.length - 1) boxes.push(phBox(size));
      });
      return hcat(boxes, size * 0.12);
    }
    function fit(src: string, maxW: number, size: number, color = th().text, weight = 600, minSize = 10.5): FormulaBox {
      let s = size;
      let box = fx(src, s, color, weight);
      while (box.w > maxW && s > minSize) {
        s -= 0.5;
        box = fx(src, s, color, weight);
      }
      return box;
    }
    /** Farbe auf alle Stücke zwischen Platzhaltern verteilen. */
    const C = (k: string, src: string) =>
      src
        .split('¿')
        .map((s) => (s ? `\\c{${k}}{${s}}` : ''))
        .join('¿');

    /** Term der Schar mit eingesetztem k, z. B. x³ − 1,5x. */
    function termK(k: number): string {
      const kk = k1(k);
      const num = (v: number) => N(Math.abs(v), 1);
      const s = (v: number, body: string, first = false) => {
        if (Math.abs(v) < 1e-9) return '';
        const sign = v < 0 ? '−' : first ? '' : '+';
        const c = Math.abs(Math.abs(v) - 1) < 1e-9 && body ? '' : num(v);
        return `${first ? sign : ` ${sign} `}${c}${body}`;
      };
      switch (key()) {
        case 'cub':
          return `x³${s(-kk, 'x')}`;
        case 'par':
          return `x²${s(-2 * kk, 'x')}${s(kk, '')}`;
        case 'exp':
          return Math.abs(kk) < 1e-9 ? 'x' : `x · e^{${kk > 0 ? '−' : ''}${Math.abs(kk) === 1 ? '' : num(kk)}x}`;
        case 'quart':
          return Math.abs(kk) < 1e-9 ? '−x^4' : `${s(kk, 'x²', true)} − x^4`;
        case 'expk':
          return Math.abs(kk) < 1e-9 ? 'x · e^x' : `(x ${kk > 0 ? '−' : '+'} ${num(kk)}) · e^x`;
      }
    }
    /** Index von f mit k (z. B. f_{1,5}); negative k in Klammern nicht nötig */
    const fIdx = (k: number) => `f_{${N(k1(k), 1)}}`;

    /* ---------- Zeichenhilfen ---------- */
    type Align = 'left' | 'center' | 'right';
    type PillOpts = { color?: string; border?: string; align?: Align; size?: number; alpha?: number; bounds?: Rect; weight?: number; dry?: boolean };
    /** Bereits belegte Flächen im Hauptbild (gegen überlappende Beschriftungen). */
    let placed: Rect[] = [];
    const overlapArea = (a: Rect, b: Rect) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    function fpill(x: number, y: number, src: string, opts: PillOpts = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? fs(13, 12);
      const color = opts.color ?? th().text;
      const box = fx(src, size, color, opts.weight ?? 700);
      const align = opts.align ?? 'center';
      let left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      if (opts.bounds) left = clamp(left, opts.bounds.x + 10, opts.bounds.x + opts.bounds.w - box.w - 10);
      let base = y + (box.asc - box.desc) / 2;
      if (opts.bounds) base = clamp(base, opts.bounds.y + box.asc + 7, opts.bounds.y + opts.bounds.h - box.desc - 7);
      const rr = { x: left - 8, y: base - box.asc - 5, w: box.w + 16, h: box.asc + box.desc + 10 };
      const a = opts.alpha ?? 1;
      if (opts.dry || a <= 0.01) return rr;
      g.save();
      g.globalAlpha *= a;
      g.save();
      g.fillStyle = th().dark ? 'rgba(15,20,30,0.9)' : 'rgba(255,255,255,0.94)';
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      roundRect(g, rr.x, rr.y, rr.w, rr.h, Math.min(11, rr.h / 2));
      g.fill();
      g.restore();
      if (opts.border) {
        g.strokeStyle = opts.border;
        g.lineWidth = 1.3;
        roundRect(g, rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1, Math.min(11, rr.h / 2));
        g.stroke();
      }
      box.draw(g, left, base);
      g.restore();
      return rr;
    }
    /** Beschriftung an der ersten freien Wunschstelle (sonst an der mit der kleinsten Überdeckung). */
    function fpillFree(cands: { x: number; y: number; align: Align }[], src: string, opts: PillOpts = {}): Rect {
      let best: { c: (typeof cands)[number]; cost: number } | null = null;
      for (const c of cands) {
        const rr = fpill(c.x, c.y, src, { ...opts, align: c.align, dry: true });
        const cost = placed.reduce((s, q) => s + overlapArea(q, rr), 0);
        if (!best || cost < best.cost - 1e-6) best = { c, cost };
        if (cost === 0) break;
      }
      const c = best!.c;
      const rr = fpill(c.x, c.y, src, { ...opts, align: c.align });
      if ((opts.alpha ?? 1) > 0.05) placed.push(rr);
      return rr;
    }
    function halo(x: number, y: number, color: string, r: number, alpha: number): void {
      if (alpha <= 0.01 || !Number.isFinite(x) || !Number.isFinite(y)) return;
      const g = surface.g;
      g.save();
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, withAlpha(color, 0.42 * alpha));
      grad.addColorStop(1, withAlpha(color, 0));
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
      g.restore();
    }
    /** Perle: Kugel mit Glanzlicht und weichem Schatten (hohl: Ring). */
    function dot(x: number, y: number, color: string, r: number, alpha = 1, hollow = false): void {
      const g = surface.g;
      if (r <= 0.2 || alpha <= 0.01 || !Number.isFinite(x) || !Number.isFinite(y)) return;
      g.save();
      g.globalAlpha *= alpha;
      if (hollow) {
        g.fillStyle = th().bg;
        g.strokeStyle = color;
        g.lineWidth = 2.6;
        g.beginPath();
        g.arc(x, y, r, 0, TAU);
        g.fill();
        g.stroke();
        g.restore();
        return;
      }
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,24,40,0.3)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1.5;
      const grad = g.createRadialGradient(x - r * 0.35, y - r * 0.4, 0.5, x, y, r);
      grad.addColorStop(0, mixColor(color, '#ffffff', 0.5));
      grad.addColorStop(1, color);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
      g.restore();
      g.strokeStyle = th().bg;
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.stroke();
      g.restore();
    }
    /** Raute für Wendepunkte. */
    function diamond(x: number, y: number, color: string, r: number, alpha = 1): void {
      const g = surface.g;
      if (r <= 0.2 || alpha <= 0.01 || !Number.isFinite(x) || !Number.isFinite(y)) return;
      g.save();
      g.globalAlpha *= alpha;
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.25)';
      g.shadowBlur = 5;
      g.shadowOffsetY = 1;
      const grad = g.createLinearGradient(x, y - r, x, y + r);
      grad.addColorStop(0, mixColor(color, '#ffffff', 0.4));
      grad.addColorStop(1, color);
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(x, y - r);
      g.lineTo(x + r, y);
      g.lineTo(x, y + r);
      g.lineTo(x - r, y);
      g.closePath();
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = th().bg;
      g.lineWidth = 1.5;
      g.stroke();
      g.restore();
    }
    /** Kurve in Pixeln (mit weichem Schatten und Glanzlicht). */
    function strokePts(pts: [number, number][], color: string, width: number, opts: { glow?: boolean; dash?: number[]; alpha?: number; shine?: boolean } = {}): void {
      if (pts.length < 2) return;
      const a = opts.alpha ?? 1;
      if (a <= 0.01) return;
      const g = surface.g;
      g.save();
      g.globalAlpha *= a;
      g.lineJoin = 'round';
      g.lineCap = 'round';
      if (opts.dash) g.setLineDash(opts.dash);
      const path = () => {
        g.beginPath();
        let pen = false;
        for (const [x, y] of pts) {
          if (!Number.isFinite(x) || !Number.isFinite(y)) {
            pen = false;
            continue;
          }
          if (pen) g.lineTo(x, y);
          else g.moveTo(x, y);
          pen = true;
        }
      };
      if (opts.glow) {
        g.save();
        g.shadowColor = th().dark ? 'rgba(0,0,0,0.65)' : mixColor(color, '#ffffff', 0.4, 0.55);
        g.shadowBlur = th().dark ? 9 : 7;
        g.shadowOffsetY = 2;
        g.strokeStyle = color;
        g.lineWidth = width;
        path();
        g.stroke();
        g.restore();
      }
      g.strokeStyle = color;
      g.lineWidth = width;
      path();
      g.stroke();
      if (opts.shine && width >= 2.5) {
        g.translate(0, -width * 0.22);
        g.strokeStyle = withAlpha('#ffffff', th().dark ? 0.2 : 0.38);
        g.lineWidth = Math.max(1, width * 0.3);
        path();
        g.stroke();
      }
      g.restore();
    }
    /** Werte einer Funktion als Pixelpunkte; sehr große Werte werden weit außerhalb gekappt. */
    function sample(f: (x: number) => number, x0: number, x1: number, density = 0.8): [number, number][] {
      const out: [number, number][] = [];
      if (!(x1 > x0)) return out;
      const r = plot.rect;
      const n = Math.round(clamp(Math.abs(plot.px(x1) - plot.px(x0)) * density, 12, 900));
      const lim = r.h * 2;
      for (let i = 0; i <= n; i++) {
        const x = x0 + ((x1 - x0) * i) / n;
        const y = f(x);
        out.push([plot.px(x), Number.isFinite(y) ? clamp(plot.py(y), r.y - lim, r.y + r.h + lim) : NaN]);
      }
      return out;
    }
    function guide(x0: number, y0: number, x1: number, y1: number, color: string, alpha: number, dash: number[] = [4, 4]): void {
      if (alpha <= 0.01) return;
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      g.strokeStyle = color;
      g.lineWidth = 1.4;
      g.setLineDash(dash);
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1, y1);
      g.stroke();
      g.restore();
    }
    /** Infokarte im einheitlichen Stil (sim-core). */
    function card(r: Rect, accent?: string): void {
      drawCard(surface.g, r, ctx.theme, accent);
    }
    function cardTitle(R: Rect, title: string, color: string, right?: string): number {
      const g = surface.g;
      const padX = fs(14, 12);
      const ty = R.y + padX + 7;
      g.fillStyle = color;
      g.beginPath();
      g.arc(R.x + padX + 4.5, ty, 4.5, 0, TAU);
      g.fill();
      const rb = right ? formula(g, right, fstyle(fs(12, 11), color, 700)) : null;
      const rw = rb ? rb.w + 12 : 0;
      let tsz = fs(13.5, 12.5);
      g.font = `750 ${tsz}px ${th().font}`;
      const room0 = R.w - 2 * padX - 15 - rw;
      while (g.measureText(title).width > room0 && tsz > 11) {
        tsz -= 0.5;
        g.font = `750 ${tsz}px ${th().font}`;
      }
      let shown = title;
      while (g.measureText(shown).width > room0 && shown.length > 4) shown = `${shown.slice(0, -2).trimEnd()}…`;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = th().text;
      g.fillText(shown, R.x + padX + 15, ty);
      if (rb) rb.draw(g, R.x + R.w - padX - rb.w, ty + (rb.asc - rb.desc) / 2);
      return ty;
    }
    function wrapText(str: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const lines: string[] = [];
      let cur = '';
      for (const w of str.split(' ')) {
        const test = cur ? `${cur} ${w}` : w;
        if (g.measureText(test).width > maxW && cur) {
          lines.push(cur);
          cur = w;
        } else cur = test;
      }
      if (cur) lines.push(cur);
      return lines;
    }

    /* ---------- Einstieg ---------- */
    interface Intro {
      panel: number;
      /** aktuelle Kurve zeichnet sich von links nach rechts */
      draw: number;
      /** Scharkurven fächern auf */
      fan: number;
      /** Perlen ploppen auf */
      pearls: number;
      /** Ortskurve */
      locus: number;
      labels: number;
      cards: number;
      stagger: number;
    }
    const DONE: Intro = { panel: 1, draw: 1, fan: 1, pearls: 1, locus: 1, labels: 1, cards: 1, stagger: 1 };
    function introState(now: number): Intro {
      if (intro === null) return DONE;
      const t = now - intro;
      if (t > 3600) {
        intro = null;
        return DONE;
      }
      return {
        panel: ease.outCubic(clamp01(t / 450)),
        draw: ease.inOutCubic(clamp01((t - 120) / 1000)),
        fan: clamp01((t - 700) / 1300),
        pearls: ease.outBack(clamp01((t - 1150) / 520)),
        locus: ease.inOutCubic(clamp01((t - 1500) / 900)),
        labels: ease.outCubic(clamp01((t - 1900) / 600)),
        cards: clamp01((t - 250) / 900),
        stagger: clamp01((t - 600) / 1600),
      };
    }
    /** Fortschritt nach einem Scharwechsel (Fächer klappt neu auf). */
    const famState = (now: number) => (famIn === null ? 1 : clamp01((now - famIn) / 1100));
    /** Fortschritt eines Teils der Animation von Herleitungsschritt k (ohne laufende Animation: 1). */
    function sk(k: number, delay: number, dur: number, e: (t: number) => number = ease.outCubic): number {
      if (!story || story.step !== k) return 1;
      return e(clamp01((frameNow - story.t0 - delay) / dur));
    }
    const atStory = (k: number, delay: number) => (story && story.step === k ? sk(k, delay, 380) : undefined);

    /* =====================================================================
     * Hauptbild
     * ===================================================================== */
    /** Treffer für den Zeiger (in jedem Bild neu bestimmt). */
    let pearlHits: { x: number; y: number; b: Branch; curve: 'E' | 'W' }[] = [];
    let nodeHits: { x: number; y: number; id: string }[] = [];
    const inView = (x: number, y: number) => x >= plot.bounds.xMin && x <= plot.bounds.xMax && y >= plot.bounds.yMin && y <= plot.bounds.yMax;

    /** Pfeil am Rand für einen Punkt außerhalb des Bildes. */
    function edgeMarker(x: number, y: number, color: string, label: string, alpha: number): void {
      if (!Number.isFinite(x) || !Number.isFinite(y) || alpha <= 0.01) return;
      const r = plot.rect;
      const px = plot.px(x);
      const py = plot.py(y);
      const m = 14;
      const cx = clamp(px, r.x + m, r.x + r.w - m);
      const cy = clamp(py, r.y + m + 30, r.y + r.h - m);
      const ang = Math.atan2(py - cy, px - cx);
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      g.translate(cx, cy);
      g.rotate(ang);
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(9, 0);
      g.lineTo(-5, -7);
      g.lineTo(-5, 7);
      g.closePath();
      g.fill();
      g.restore();
      const lx = cx - Math.cos(ang) * 22;
      const ly = cy - Math.sin(ang) * 18;
      fpillFree([{ x: lx, y: ly, align: 'center' }], `\\c{x}{\\t{${label}}}`, { size: fs(11.5, 11), alpha: alpha * 0.95, bounds: r, color });
    }

    /** Ortskurve (bzw. Wendepunkt-Ortskurve) auf [x0; x1] mit Lücken. */
    function locusPts(f: (x: number) => number, x0: number, x1: number, gaps: number[]): [number, number][] {
      const pts = sample(f, x0, x1, 0.9);
      if (!gaps.length) return pts;
      // an Lücken die Linie kurz unterbrechen
      const out: [number, number][] = [];
      const gx = gaps.map((x) => plot.px(x));
      for (const q of pts) {
        if (gx.some((g0) => Math.abs(q[0] - g0) < 5)) out.push([NaN, NaN]);
        else out.push(q);
      }
      return out;
    }

    /** Überstrichener x-Bereich eines Astes für k ∈ [lo; hi], auf den Bildausschnitt begrenzt. */
    function xRangeIn(b: Branch, lo: number, hi: number): [number, number] | null {
      const r = branchXRange(b, lo, hi);
      if (!r) return null;
      const a = Math.max(r[0], plot.bounds.xMin - 0.5);
      const c = Math.min(r[1], plot.bounds.xMax + 0.5);
      return c > a ? [a, c] : null;
    }

    function drawPlot(now: number, I: Intro): void {
      const g = surface.g;
      const theme = th();
      plot.setRangePadded([VX0.v, VX1.v], [VY0.v, VY1.v], pad());
      plot.resize();
      plot.begin();
      plot.grid();
      plot.axes();
      placed = [];
      pearlHits = [];
      nodeHits = [];
      const r = plot.rect;
      const fa = fam();
      const inf = info();
      const k = shownK();
      const fsP = famState(now);
      const showA = kShow.v;
      const [bx0, bx1] = [plot.bounds.xMin, plot.bounds.xMax];

      // Legende zuerst reservieren, damit andere Beschriftungen ausweichen
      const legSrc = `\\c{f}{${fIdx(k)}(x) = ${termK(k)}}`;
      const legOpts: PillOpts = { align: 'left', size: fs(13.5, 12.5), alpha: I.panel, border: withAlpha(col.f(), 0.5) };
      const legR = fpill(r.x + 10, r.y + 20, legSrc, { ...legOpts, dry: true });
      placed.push(legR);

      // alte Schar blendet aus
      if (prevFam) {
        const t = clamp01((now - prevFam.t0) / 480);
        const of = FAMS[prevFam.key];
        const ok = prevFam.k;
        strokePts(sample((x) => of.f(ok, x), bx0, bx1), col.f(), fs(3.2, 2.8), { alpha: 1 - t });
      }

      // weitere Scharkurven (Fächer, Farbverlauf nach k)
      const manyA = kMany.v * I.panel;
      if (manyA > 0.01) {
        const unfold = Math.min(I.fan, fsP);
        FAN.forEach((kf, idx) => {
          if (Math.abs(kf - k) < 0.05) return;
          const a = clamp01(unfold * 1.9 - (idx / FAN.length) * 0.9);
          if (a <= 0) return;
          const kk = lerp(k, kf, ease.outCubic(a));
          const hl = hover?.id === `fan${idx}`;
          const alpha = (hl ? 0.9 : theme.dark ? 0.36 : 0.28) * a * manyA;
          strokePts(sample((x) => fa.f(kk, x), bx0, bx1, 0.5), fanColor(kf), hl ? 2.6 : 1.5, { alpha });
        });
      }

      // Ortskurve der Extrempunkte (ab Herleitungsschritt 3, wächst vom Extrempunkt aus)
      const locA = kExt.v * kLoc.v * showA * vis[3]!.v * I.locus;
      const movE = fa.branches.filter((b) => b.curve === 'E' && inDom(b.dom, k));
      if (locA > 0.01) {
        const grow = p.dv >= DV ? sk(3, 0, 1) * 1 : sk(3, 150, 1300, ease.inOutCubic);
        const xc = movE.length ? movE[movE.length - 1]!.x(k) : (bx0 + bx1) / 2;
        const span = Math.max(xc - bx0, bx1 - xc) * Math.min(grow, I.locus < 1 ? I.locus : 1);
        const pts = locusPts(fa.locus, Math.max(bx0, xc - span), Math.min(bx1, xc + span), fa.locusGaps);
        strokePts(pts, col.loc(), fs(2.6, 2.3), { dash: [9, 6], alpha: locA * 0.95 });
        // Lücke (z. B. x ≠ 0) als offener Kreis
        for (const gx of fa.locusGaps) {
          const gy = fa.locus(gx);
          if (inView(gx, gy) && Math.abs(gx - xc) <= span) dot(plot.px(gx), plot.py(gy), col.loc(), 4.2, locA, true);
        }
      }

      // Ortskurve der Wendepunkte
      const wA = kWp.v * showA * I.locus;
      if (wA > 0.01 && fa.wlocus) strokePts(sample(fa.wlocus, bx0, bx1, 0.9), col.wp(), fs(2.3, 2), { dash: [2.5, 5], alpha: wA * 0.95 });

      // leuchtende Spur: überstrichener k-Bereich, dazu ein heller Schweif der letzten Bewegung
      if (trail && trail.hi - trail.lo > 1e-6) {
        const kOld = recent.length ? recent[0]!.k : k;
        const tail: [number, number] = [Math.min(kOld, k), Math.max(kOld, k)];
        for (const b of fa.branches) {
          const isE = b.curve === 'E';
          const a = isE ? kExt.v : kWp.v;
          if (a <= 0.01) continue;
          const lf = isE ? fa.locus : fa.wlocus;
          if (!lf) continue;
          const color = isE ? col.loc() : col.wp();
          const xr = xRangeIn(b, trail.lo, trail.hi);
          if (xr) {
            const pts = sample(lf, xr[0], xr[1], 0.9);
            strokePts(pts, color, 10, { alpha: a * (theme.dark ? 0.22 : 0.18) });
            strokePts(pts, color, 3.2, { alpha: a * 0.85, glow: true });
          }
          const xt = tail[1] - tail[0] > 1e-4 ? xRangeIn(b, tail[0], tail[1]) : null;
          if (xt) strokePts(sample(lf, xt[0], xt[1], 0.9), mixColor(color, '#ffffff', theme.dark ? 0.35 : 0.25), 4.4, { alpha: a, glow: true });
        }
      }

      // aktuelle Kurve f_k (beim Einstieg von links nach rechts)
      strokePts(sample((x) => fa.f(k, x), bx0, lerp(bx0, bx1, I.draw)), col.f(), fs(3.6, 3), { glow: true, shine: true, alpha: prevFam ? clamp01((now - prevFam.t0) / 380) : 1 });

      // gemeinsame Punkte aller Scharkurven
      const comA = I.pearls * clamp01(fsP * 2 - 0.6);
      fa.common.forEach(([cx, cy], i) => {
        if (!inView(cx, cy) || comA <= 0.01) return;
        const [px, py] = [plot.px(cx), plot.py(cy)];
        const pulse = intro !== null || famIn !== null ? clamp01(((now - (famIn ?? intro ?? 0)) - 1400) / 1000) : 1;
        if (pulse < 1) {
          g.save();
          g.globalAlpha *= (1 - pulse) * 0.8 * comA;
          g.strokeStyle = col.com();
          g.lineWidth = 2.4;
          g.beginPath();
          g.arc(px, py, 8 + 26 * ease.outCubic(pulse), 0, TAU);
          g.stroke();
          g.restore();
        }
        const hl = hover?.id === `com${i}`;
        halo(px, py, col.com(), hl ? 26 : 18, comA * 0.8);
        dot(px, py, col.com(), (hl ? 7.5 : 6.5) * comA, 1, true);
        nodeHits.push({ x: px, y: py, id: `com${i}` });
        placed.push({ x: px - 9, y: py - 9, w: 18, h: 18 });
      });

      // Wendepunkte
      if (kWp.v > 0.01) {
        const ws = fa.inflections(k);
        ws.forEach((w) => {
          if (!inView(w.x, w.y)) return;
          const [px, py] = [plot.px(w.x), plot.py(w.y)];
          const b = fa.branches.find((q) => q.curve === 'W' && inDom(q.dom, k) && Math.abs(q.x(k) - w.x) < 1e-9);
          const hl = !!b && (hover?.id === `pe${fa.branches.indexOf(b)}` || (drag?.kind === 'pearl' && drag.b === b));
          if (hl) halo(px, py, col.wp(), 24, kWp.v);
          diamond(px, py, col.wp(), (hl ? 8 : 6.8) * I.pearls, kWp.v);
          if (b) pearlHits.push({ x: px, y: py, b, curve: 'W' });
          placed.push({ x: px - 8, y: py - 8, w: 16, h: 16 });
        });
      }

      // Extrempunkte (Perlen)
      const exA = kExt.v;
      const ex = exA > 0.01 ? fa.extrema(k) : [];
      ex.forEach((e) => {
        if (!inView(e.x, e.y)) return;
        const [px, py] = [plot.px(e.x), plot.py(e.y)];
        const b = movE.find((q) => Math.abs(q.x(k) - e.x) < 1e-9);
        const hid = b ? `pe${fa.branches.indexOf(b)}` : '';
        const hl = !!b && (hover?.id === hid || (drag?.kind === 'pearl' && drag.b === b));
        halo(px, py, col.ext(), hl ? 30 : 20, exA * (hl ? 1 : 0.6) * I.pearls);
        dot(px, py, col.ext(), (hl ? 8.5 : 7) * I.pearls, exA, e.kind === 'saddle');
        if (b) pearlHits.push({ x: px, y: py, b, curve: 'E' });
        placed.push({ x: px - 9, y: py - 9, w: 18, h: 18 });
      });

      // Herleitung im Bild: Schritt 1 (Koordinaten an den Achsen), Schritt 2 (Probe für k)
      const f1 = foc[1]!.v * vis[1]!.v * exA * I.labels;
      const f2 = foc[2]!.v * vis[2]!.v * exA * I.labels;
      const [ox, oy] = [clamp(plot.px(0), r.x, r.x + r.w), clamp(plot.py(0), r.y, r.y + r.h)];
      for (const b of movE) {
        const x = b.x(k);
        const y = b.y(k);
        if (!inView(x, y)) continue;
        const [px, py] = [plot.px(x), plot.py(y)];
        if (f1 > 0.01) {
          const e = sk(1, 100, 700, ease.inOutCubic);
          guide(px, py, px, lerp(py, oy, e), col.ext(), f1 * 0.85);
          guide(px, py, lerp(px, ox, e), py, col.ext(), f1 * 0.85);
          const a = f1 * sk(1, 500, 400);
          fpillFree([{ x: px, y: oy + (y > 0 ? 16 : -16), align: 'center' }], C('x', `x_E ${S(`≈ ${cN(`xe${fa.branches.indexOf(b)}`, x)}`)}`), { size: fs(11.5, 11), alpha: a, bounds: r });
          fpillFree([{ x: ox + (x > 0 ? -12 : 12), y: py, align: x > 0 ? 'right' : 'left' }], C('x', `y_E ${S(`≈ ${cN(`ye${fa.branches.indexOf(b)}`, y)}`)}`), { size: fs(11.5, 11), alpha: a, bounds: r });
        }
        if (f2 > 0.01) {
          const a = f2 * sk(2, 250, 450);
          const src = show() ? `k = ${inf.probe(N(x, 2))} ≈ ${N(b.kOfX(x) ?? k, 2)}` : `k = ¿`;
          fpillFree(
            [
              { x: px + 16, y: py - 22, align: 'left' },
              { x: px - 16, y: py - 22, align: 'right' },
              { x: px + 16, y: py + 24, align: 'left' },
              { x: px - 16, y: py + 24, align: 'right' },
            ],
            C('l', src),
            { size: fs(12, 11), alpha: a, bounds: r, border: withAlpha(col.loc(), 0.55) },
          );
        }
      }

      // Beschriftungen der Punkte
      const la = I.labels;
      if (la > 0.01) {
        ex.forEach((e, i) => {
          if (!inView(e.x, e.y)) return;
          const [px, py] = [plot.px(e.x), plot.py(e.y)];
          const src = show() || showA > 0.5 ? `${kName(e.kind)}${P(pt(cN(`ex${i}`, e.x), cN(`ey${i}`, e.y)))}` : `${kName(e.kind)}(¿)`;
          const up = e.kind !== 'min';
          fpillFree(
            [
              { x: px, y: py + (up ? -24 : 24), align: 'center' },
              { x: px + 14, y: py + (up ? -20 : 20), align: 'left' },
              { x: px - 14, y: py + (up ? -20 : 20), align: 'right' },
              { x: px, y: py + (up ? 26 : -26), align: 'center' },
            ],
            C('x', src),
            { size: fs(12.5, 11.5), alpha: la * exA, color: col.ext(), border: withAlpha(col.ext(), 0.5), bounds: r },
          );
        });
        // außerhalb des Bildes: Pfeil am Rand
        ex.forEach((e) => {
          if (!inView(e.x, e.y)) edgeMarker(e.x, e.y, col.ext(), kName(e.kind), la * exA);
        });
        if (kWp.v > 0.01) {
          fa.inflections(k).forEach((w, i) => {
            if (!inView(w.x, w.y)) return;
            const [px, py] = [plot.px(w.x), plot.py(w.y)];
            const src = show() ? `${kName('infl')}${P(pt(cN(`wx${i}`, w.x), cN(`wy${i}`, w.y)))}` : `${kName('infl')}(¿)`;
            const right = w.x >= 0;
            fpillFree(
              [
                { x: px + (right ? 14 : -14), y: py + 20, align: right ? 'left' : 'right' },
                { x: px + (right ? 14 : -14), y: py - 20, align: right ? 'left' : 'right' },
                { x: px, y: py + 26, align: 'center' },
              ],
              C('w', src),
              { size: fs(12, 11), alpha: la * kWp.v, color: col.wp(), border: withAlpha(col.wp(), 0.5), bounds: r },
            );
          });
        }
        // gemeinsame Punkte
        fa.common.forEach(([cx, cy]) => {
          if (!inView(cx, cy)) return;
          const onPt = (kExt.v > 0.5 && ex.some((e) => Math.hypot(e.x - cx, e.y - cy) < 1e-6)) || (kWp.v > 0.5 && fa.inflections(k).some((w) => Math.hypot(w.x - cx, w.y - cy) < 1e-6));
          if (onPt) return;
          const [px, py] = [plot.px(cx), plot.py(cy)];
          const src = show() ? P(pt(N(cx), N(cy))) : '(¿)';
          fpillFree(
            [
              { x: px - 14, y: py + 20, align: 'right' },
              { x: px + 14, y: py + 20, align: 'left' },
              { x: px - 14, y: py - 20, align: 'right' },
              { x: px + 14, y: py - 20, align: 'left' },
            ],
            C('c', src),
            { size: fs(12, 11), alpha: la * comA, color: col.com(), border: withAlpha(col.com(), 0.5), bounds: r },
          );
        });
        // Gleichungen der Ortskurven an freier Stelle
        const locLabel = (f: (x: number) => number, src: string, color: string, a: number) => {
          if (a <= 0.01) return;
          const cands: { x: number; y: number; align: Align }[] = [];
          for (const t of [0.86, 0.14, 0.72, 0.28, 0.6, 0.4]) {
            const x = lerp(bx0, bx1, t);
            const y = f(x);
            if (!inView(x, y)) continue;
            const [px, py] = [plot.px(x), plot.py(y)];
            cands.push({ x: px, y: py - 18, align: 'center' }, { x: px, y: py + 18, align: 'center' });
          }
          if (cands.length) fpillFree(cands, src, { size: fs(12, 11), alpha: a, color, border: withAlpha(color, 0.5), bounds: r });
        };
        if (p.dv >= DV) locLabel(fa.locus, C('l', `${inf.loc[3]}${inf.gap ? `  \\t{(${inf.gap})}` : ''}`), col.loc(), locA * la * sk(4, 200, 500));
        if (fa.wlocus && inf.wp[2]) locLabel(fa.wlocus, C('w', inf.wp[2]), col.wp(), wA * la);
      }

      // Sonderfall: keine Extrempunkte
      if (exA > 0.01 && !fa.extrema(k).length && show()) {
        fpillFree([{ x: r.x + r.w / 2, y: r.y + r.h - 26, align: 'center' }, { x: r.x + r.w / 2, y: r.y + 64, align: 'center' }], `\\c{m}{k = ${N(k1(k), 1)}: \\t{${T2('keine Extrempunkte', 'no extrema')}}}`, { size: fs(12.5, 11.5), alpha: exA * la, bounds: r, border: withAlpha(theme.muted, 0.45) });
      }

      // gezogene blasse Scharkurve: k anzeigen
      if (hover?.id.startsWith('fan')) {
        const kf = FAN[Number(hover.id.slice(3))]!;
        fpill(hover.px + 14, hover.py - 18, `\\c{f}{k = ${N(kf, 1)}}`, { align: 'left', size: fs(12, 11), bounds: r, border: withAlpha(fanColor(kf), 0.8) });
      } else if (hover?.id.startsWith('com')) {
        const txt = fa.touch ? T2('alle Kurven berühren sich hier', 'all curves touch here') : T2('alle Kurven gehen hier durch', 'all curves pass through here');
        fpill(hover.px + 14, hover.py - 22, `\\c{c}{\\t{${txt}}}`, { align: 'left', size: fs(12, 11), bounds: r, border: withAlpha(col.com(), 0.6) });
      }

      // Legende und Hinweise
      fpill(r.x + 10, r.y + 20, legSrc, legOpts);
      if (kShow.v < 0.99 && I.labels > 0.3) {
        const msg = sm() ? T2('Ergebnisse verdeckt', 'Results hidden') : T2('Ergebnisse verdeckt – erst rechnen, dann aufdecken', 'Results hidden – work them out, then reveal');
        fpill(r.x + r.w - 10, r.y + 20 + (legR.x + legR.w > r.x + r.w * 0.45 ? 34 : 0), `\\c{m}{\\t{${msg}}}`, { align: 'right', size: fs(12, 11), alpha: (1 - kShow.v) * I.labels, bounds: r });
      }
      plot.end();
    }

    /* =====================================================================
     * k-Strahl (Zeitleiste) mit Abspielknopf und Fallunterscheidung
     * ===================================================================== */
    function stripGeom(T: Rect): { box: Rect; play: { x: number; y: number; r: number }; x0: number; x1: number; yBar: number; yLab: number; yNum: number } {
      const box = { x: T.x + 2, y: T.y, w: T.w - 4, h: T.h };
      const play = { x: box.x + 28, y: box.y + box.h / 2, r: 16 };
      const x0 = box.x + 66;
      const x1 = box.x + box.w - 24;
      return { box, play, x0, x1, yLab: box.y + 15, yBar: box.y + box.h * 0.5 + 1, yNum: box.y + box.h - 13 };
    }
    const kToX = (G: ReturnType<typeof stripGeom>, k: number) => G.x0 + ((G.x1 - G.x0) * (k - K_MIN)) / (K_MAX - K_MIN);
    const xToK = (G: ReturnType<typeof stripGeom>, x: number) => K_MIN + ((x - G.x0) / (G.x1 - G.x0)) * (K_MAX - K_MIN);
    /** Farbe eines Falls nach Art der Extrempunkte */
    function caseColor(c: { max: number; min: number; saddle: number }): string {
      if (c.saddle) return col.wp();
      if (c.max && c.min) return col.ext();
      if (c.max) return col.ext();
      if (c.min) return col.loc();
      return th().muted;
    }

    function drawStrip(T: Rect, I: Intro): void {
      const g = surface.g;
      const theme = th();
      const G = stripGeom(T);
      const a = I.panel;
      if (a <= 0.01) return;
      const fa = fam();
      const inf = info();
      g.save();
      g.globalAlpha *= a;
      // Hintergrund
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 2;
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      roundRect(g, G.box.x, G.box.y, G.box.w, G.box.h, 18);
      g.fill();
      g.restore();
      g.strokeStyle = theme.dark ? '#273142' : '#e1e6ee';
      g.lineWidth = 1.2;
      roundRect(g, G.box.x + 0.5, G.box.y + 0.5, G.box.w - 1, G.box.h - 1, 18);
      g.stroke();
      // Abspielknopf
      const run = playing() || !!sweep;
      const hp = hover?.id === 'play';
      const pc = col.f();
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : withAlpha(pc, 0.35);
      g.shadowBlur = hp ? 10 : 6;
      g.shadowOffsetY = 1.5;
      const grad = g.createLinearGradient(0, G.play.y - G.play.r, 0, G.play.y + G.play.r);
      grad.addColorStop(0, mixColor(pc, '#ffffff', hp ? 0.3 : 0.18));
      grad.addColorStop(1, pc);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(G.play.x, G.play.y, G.play.r * (hp ? 1.06 : 1), 0, TAU);
      g.fill();
      g.restore();
      g.fillStyle = '#ffffff';
      if (run) {
        g.fillRect(G.play.x - 5, G.play.y - 6, 3.5, 12);
        g.fillRect(G.play.x + 1.5, G.play.y - 6, 3.5, 12);
      } else {
        g.beginPath();
        g.moveTo(G.play.x - 4, G.play.y - 7);
        g.lineTo(G.play.x + 7, G.play.y);
        g.lineTo(G.play.x - 4, G.play.y + 7);
        g.closePath();
        g.fill();
      }
      // Fälle als farbige Abschnitte
      const k = shownK();
      const cur = caseAt(fa, k1(k));
      const bh = 10;
      fa.cases.forEach((c, i) => {
        if (c.at !== undefined) return;
        const xa = kToX(G, c.from);
        const xb = kToX(G, c.to);
        const isCur = c === cur;
        const sc = caseColor(c);
        g.fillStyle = withAlpha(sc, (theme.dark ? 0.32 : 0.2) + (isCur ? 0.2 : 0));
        roundRect(g, xa + 1.5, G.yBar - bh / 2, xb - xa - 3, bh, bh / 2);
        g.fill();
        const label = show() ? TX(inf.cases[i]!.short) : '?';
        g.font = `${isCur ? 750 : 650} ${fs(11.5, 11)}px ${theme.font}`;
        let lab = label;
        while (g.measureText(lab).width > xb - xa - 6 && lab.length > 3) lab = `${lab.slice(0, -2)}…`;
        g.fillStyle = isCur ? mixColor(sc, theme.text, 0.25) : theme.muted;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(lab, (xa + xb) / 2, G.yLab);
      });
      // Sonderwerte (z. B. k = 0)
      fa.cases.forEach((c) => {
        if (c.at === undefined) return;
        const x = kToX(G, c.at);
        dot(x, G.yBar, caseColor(c), 5, 1, c.saddle > 0 || c.max + c.min === 0);
      });
      // überstrichener Bereich (Spur)
      if (trail && trail.hi - trail.lo > 1e-6) {
        g.save();
        g.strokeStyle = withAlpha(col.loc(), 0.9);
        g.lineWidth = 3;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(kToX(G, trail.lo), G.yBar);
        g.lineTo(kToX(G, trail.hi), G.yBar);
        g.stroke();
        g.restore();
      }
      // Skala (blendet unter dem Wert aus)
      const xk = kToX(G, clamp(k, K_MIN, K_MAX));
      const nf = `600 ${fs(11, 11)}px ${theme.font}`;
      for (let v = K_MIN; v <= K_MAX; v++) {
        const x = kToX(G, v);
        g.strokeStyle = withAlpha(theme.text, 0.35);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(x, G.yBar + bh / 2 + 1);
        g.lineTo(x, G.yBar + bh / 2 + 4);
        g.stroke();
        const fade = clamp01((Math.abs(x - xk) - 24) / 14);
        if (fade <= 0.01) continue;
        g.save();
        g.globalAlpha *= fade;
        g.font = nf;
        g.fillStyle = theme.muted;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillText(fmt.num(v, 0), x, G.yNum);
        g.restore();
      }
      g.font = `italic 700 ${fs(13, 12)}px ${theme.mathFont}`;
      g.fillStyle = withAlpha(theme.muted, clamp01((G.x1 - 6 - kToX(G, clamp(k, K_MIN, K_MAX))) / 30));
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillText('k', G.x1 + 9, G.yBar + 1);
      // Knopf an der aktuellen Stelle
      const hk = hover?.id === 'knob' || drag?.kind === 'strip';
      halo(xk, G.yBar, col.f(), hk ? 20 : 14, run ? 1 : 0.6);
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.55)' : withAlpha(col.f(), 0.4);
      g.shadowBlur = 6;
      g.shadowOffsetY = 1;
      g.fillStyle = col.f();
      g.beginPath();
      g.arc(xk, G.yBar, hk ? 9 : 8, 0, TAU);
      g.fill();
      g.restore();
      g.strokeStyle = theme.bg;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(xk, G.yBar, hk ? 9 : 8, 0, TAU);
      g.stroke();
      // Wert unter dem Knopf
      const vs = `k = ${N(k1(k), 1)}`;
      g.font = `750 ${fs(11.5, 11)}px ${theme.font}`;
      const vw = g.measureText(vs).width + 12;
      const vx = clamp(xk - vw / 2, G.x0 - 18, G.x1 + 18 - vw);
      g.fillStyle = withAlpha(col.f(), theme.dark ? 0.3 : 0.14);
      roundRect(g, vx, G.yNum - 8, vw, 16, 8);
      g.fill();
      g.fillStyle = theme.dark ? mixColor(col.f(), '#ffffff', 0.45) : col.f();
      g.textAlign = 'center';
      g.fillText(vs, vx + vw / 2, G.yNum + 0.5);
      g.restore();
    }

    /* =====================================================================
     * Karten
     * ===================================================================== */
    type CardFn = (R: Rect, measure: boolean, compact: boolean) => number;
    type RowSpec = { src: string; color?: string; size?: number; weight?: number; gap?: number; at?: number; hl?: string; text?: boolean; indent?: number };
    const rowH = (b: FormulaBox) => Math.max(b.asc + b.desc, 15);
    const noteRow = (txt: string, size = fs(12, 11), color = th().muted): RowSpec => ({ src: txt, text: true, size, color, gap: 6 });

    /** Zeilen messen bzw. zeichnen (mit gestaffeltem Einblenden und Hervorhebung); gibt die Höhe zurück. */
    function drawRows(R: Rect, y0: number, rows: RowSpec[], draw: boolean, stag: number): number {
      const g = surface.g;
      const padX = fs(14, 12);
      const items = rows.map((r) => {
        const size = r.size ?? fs(13.5, 12.5);
        const maxW = R.w - 2 * padX - 4 - (r.indent ?? 0);
        if (r.text) {
          const font = `${r.weight ?? 550} ${size}px ${th().font}`;
          const lines = wrapText(r.src, maxW, font);
          return { box: null as FormulaBox | null, lines, font, h: lines.length * size * 1.32 };
        }
        const box = fit(r.src, maxW, size, r.color ?? th().text, r.weight ?? 600);
        return { box, lines: [] as string[], font: '', h: rowH(box) };
      });
      const total = items.reduce((s, it, i) => s + it.h + (rows[i]!.gap ?? 8), 0);
      if (!draw) return total;
      let y = y0;
      items.forEach((it, i) => {
        const row = rows[i]!;
        const a = clamp01(row.at ?? clamp01(stag * (rows.length + 2) - i));
        if (y + it.h > R.y + R.h - 2) return;
        g.save();
        g.globalAlpha *= ease.outCubic(a);
        const x = R.x + padX + (row.indent ?? 0);
        if (row.hl) {
          g.fillStyle = withAlpha(row.hl, th().dark ? 0.2 : 0.12);
          roundRect(g, x - 6, y - 3, R.x + R.w - padX - x + 12, it.h + 6, 7);
          g.fill();
        }
        const dx = (1 - ease.outCubic(a)) * 10;
        if (it.box) it.box.draw(g, x + dx, y + it.box.asc);
        else {
          const size = row.size ?? fs(13.5, 12.5);
          g.font = it.font;
          g.fillStyle = row.color ?? th().text;
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          it.lines.forEach((ln, j) => g.fillText(ln, x + dx, y + size * 0.66 + j * size * 1.32));
        }
        g.restore();
        y += it.h + (row.gap ?? 8);
      });
      return total;
    }
    function formulaCard(R: Rect, measure: boolean, title: string, accent: string, rows: RowSpec[], stag: number, right?: string): number {
      const h = 38 + drawRows(R, 0, rows, false, 1) + 4;
      if (measure) return h;
      card(R, accent);
      cardTitle(R, title, accent, right);
      drawRows(R, R.y + 38, rows, true, stag);
      return h;
    }
    function stagger(I: Intro): number {
      if (reduced()) return 1;
      return I.stagger;
    }

    /** Punkte für den aktuellen Wert von k als Formel. */
    function pointsSrc(k: number): string {
      const ex = fam().extrema(k);
      if (!ex.length) return `\\t{${T2('keine Extrempunkte', 'no extrema')}}`;
      return ex.map((e, i) => C('x', show() ? `${kName(e.kind)}${P(pt(cN(`cx${i}`, e.x), cN(`cy${i}`, e.y)))}` : `${kName(e.kind)}(¿)`)).join(';  ');
    }

    /** Scharterm, Ableitungen und die Punkte für das aktuelle k. */
    function famCard(I: Intro): CardFn {
      return (R, measure, compact) => {
        const inf = info();
        const k = shownK();
        const big = fs(14, 13);
        const rows: RowSpec[] = [{ src: C('f', `f_k(x) = ${inf.term}`), size: big }];
        if (!compact) rows.push({ src: `f_k′(x) = ${S(inf.d1)}`, size: fs(13, 12) }, { src: `f_k″(x) = ${S(inf.d2)}`, size: fs(13, 12) });
        rows.push({ src: `\\t{${T2('für', 'for')}} k = ${N(k1(k), 1)}\\t{:}  ${pointsSrc(k)}`, size: fs(13, 12), hl: col.ext() });
        return formulaCard(R, measure, T2('Funktionenschar', 'Family of functions'), col.f(), rows, stagger(I), `\\t{k ∈ [${T2('−3; 3', '−3, 3')}]}`);
      };
    }

    /** Fallunterscheidung nach k; der aktuelle Fall ist hervorgehoben (gleitet). */
    function caseCard(I: Intro): CardFn {
      return (R, measure, compact) => {
        const g = surface.g;
        const theme = th();
        const padX = fs(14, 12);
        const fa = fam();
        const inf = info();
        const size = fs(12.5, 11.5);
        const kf = `750 ${size}px ${theme.font}`;
        const tf = `550 ${size}px ${theme.font}`;
        g.font = kf;
        const kw = Math.max(...inf.cases.map((c) => g.measureText(c.k).width)) + 10;
        const maxW = R.w - 2 * padX - kw - 8;
        const condBox = compact ? null : fit(`\\c{x}{f_k′(x) = 0}  ⇔  ${S(lang === 'de' ? inf.cond : inf.cond.replace('\\t{oder}', '\\t{or}'))}`, R.w - 2 * padX - 4, fs(13, 12));
        const lines = inf.cases.map((c) => {
          const open = show();
          const txt = open ? TX(compact ? c.short : c.res) : T2('Art und Lage der Extrempunkte?', 'type and position of the extrema?');
          return wrapText(txt, maxW, tf);
        });
        const lh = size * 1.32;
        const rowsH = lines.map((l) => l.length * lh + (compact ? 4 : 8));
        const h = 38 + (condBox ? rowH(condBox) + 10 : 0) + rowsH.reduce((s, v) => s + v + 4, 0) + 4;
        if (measure) return h;
        card(R, col.ext());
        cardTitle(R, T2('Fallunterscheidung nach k', 'Case analysis by k'), col.ext());
        const st = stagger(I);
        let y = R.y + 38;
        if (condBox) {
          g.save();
          g.globalAlpha *= ease.outCubic(clamp01(st * 4));
          condBox.draw(g, R.x + padX, y + condBox.asc);
          g.restore();
          y += rowH(condBox) + 10;
        }
        const tops: number[] = [];
        let yy = y;
        rowsH.forEach((rh) => {
          tops.push(yy);
          yy += rh + 4;
        });
        // gleitende Hervorhebung des aktuellen Falls
        const ci = clamp(kCase.v, 0, rowsH.length - 1);
        const i0 = Math.floor(ci);
        const i1 = Math.min(rowsH.length - 1, i0 + 1);
        const t = ci - i0;
        const hy = lerp(tops[i0]!, tops[i1]!, t);
        const hh = lerp(rowsH[i0]!, rowsH[i1]!, t);
        const cur = caseAt(fa, k1(shownK()));
        const hc = caseColor(cur);
        g.fillStyle = withAlpha(hc, theme.dark ? 0.22 : 0.12);
        roundRect(g, R.x + padX - 6, hy - 2, R.w - 2 * padX + 12, hh, 8);
        g.fill();
        g.fillStyle = hc;
        roundRect(g, R.x + padX - 6, hy - 2, 4, hh, 2);
        g.fill();
        inf.cases.forEach((c, i) => {
          const top = tops[i]!;
          if (top + rowsH[i]! > R.y + R.h) return;
          const a = ease.outCubic(clamp01(st * 5 - 1 - i * 0.6));
          const isCur = fa.cases[i] === cur;
          g.save();
          g.globalAlpha *= a;
          g.font = kf;
          g.fillStyle = isCur ? mixColor(caseColor(fa.cases[i]!), theme.text, 0.2) : theme.text;
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          g.fillText(c.k, R.x + padX + 2, top + 4 + lh / 2);
          g.font = tf;
          g.fillStyle = isCur ? theme.text : theme.muted;
          lines[i]!.forEach((ln, j) => g.fillText(ln, R.x + padX + kw, top + 4 + lh / 2 + j * lh));
          g.restore();
        });
        return h;
      };
    }

    /** Hit-Flächen der Schrittpunkte der Herleitung (für das Antippen). */
    let dotHits: { x: number; y: number; r: number; k: number }[] = [];

    /** Herleitung der Ortskurve in vier Schritten. */
    function locCard(I: Intro): CardFn {
      return (R, measure, compact) => {
        const g = surface.g;
        const theme = th();
        const padX = fs(14, 12);
        const inf = info();
        const dv = p.dv;
        const big = fs(13.5, 12.5);
        const rows: RowSpec[] = [];
        const all: RowSpec[] = [
          { src: C('x', S(inf.loc[0])), size: big, at: atStory(1, 200) },
          { src: S(inf.loc[1]), size: big, at: atStory(2, 200) },
          { src: S(inf.loc[2]), size: big, at: atStory(3, 200) },
          { src: show() ? `\\b{${C('l', inf.loc[3])}}${inf.gap ? `  \\t{(${inf.gap})}` : ''}` : 'y = ¿', size: fs(14.5, 13.5), at: atStory(4, 200), hl: col.loc() },
        ];
        const notes: Txt[] = [
          L('Aus f′ₖ(x) = 0 die x-Koordinate bestimmen, dann durch Einsetzen in fₖ die y-Koordinate.', 'Find the x-coordinate from f′ₖ(x) = 0, then the y-coordinate by substituting into fₖ.'),
          L('Die Gleichung für die x-Koordinate nach k umstellen.', 'Rearrange the equation for the x-coordinate to get k.'),
          L('k in die y-Koordinate einsetzen: Der Parameter verschwindet.', 'Substitute k into the y-coordinate: the parameter disappears.'),
          show()
            ? L(`Auf dieser Kurve liegen alle ${inf.locOf.de} der Schar.`, `All ${inf.locOf.en} of the family lie on this curve.`)
            : L('Auf dieser Kurve liegen alle Extrempunkte der Schar.', 'All extreme points of the family lie on this curve.'),
        ];
        for (let i = 0; i < dv; i++) {
          if (compact && i < dv - 1) continue;
          rows.push(all[i]!);
        }
        if (!compact) rows.push(noteRow(TX(notes[dv - 1]!)));
        const tsz = fs(12.5, 11.5);
        const tfont = `700 ${tsz}px ${theme.font}`;
        const head = 38 + 30 + 4 + (compact ? -10 : tsz * 1.3);
        const h = head + drawRows(R, 0, rows, false, 1) + 4;
        if (measure) return h;
        card(R, col.loc());
        cardTitle(R, T2('Ortskurve der Extrempunkte', 'Locus of the extrema'), col.loc(), `\\t{${T2('Schritt', 'Step')} ${dv}/${DV}}`);
        // Fortschritt: vier Punkte zum Antippen
        const yD = R.y + 38 + 10;
        const x0 = R.x + padX + 12;
        const x1 = R.x + R.w - padX - 12;
        const dx = (x1 - x0) / (DV - 1);
        const rr = Math.min(fs(10, 9.5), dx * 0.3);
        g.save();
        g.lineCap = 'round';
        g.strokeStyle = withAlpha(theme.muted, 0.35);
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(x0, yD);
        g.lineTo(x1, yD);
        g.stroke();
        g.strokeStyle = col.loc();
        g.beginPath();
        g.moveTo(x0, yD);
        g.lineTo(x0 + dx * (clamp(dvPos.v, 1, DV) - 1), yD);
        g.stroke();
        g.restore();
        dotHits = [];
        for (let k = 1; k <= DV; k++) {
          const cx = x0 + dx * (k - 1);
          const done = k < dv;
          const cur = k === dv;
          const hov = hover?.id === `dv${k}` && editable();
          const pop = cur ? 1 + 0.18 * (1 - clamp01((frameNow - dvT0) / 450)) : 1;
          const r0 = rr * pop * (hov ? 1.12 : 1);
          if (cur) halo(cx, yD, col.loc(), r0 * 2.3, 0.8);
          g.save();
          if (done || cur) {
            g.fillStyle = cur ? col.loc() : mixColor(col.loc(), theme.bg, 0.25);
            g.beginPath();
            g.arc(cx, yD, r0, 0, TAU);
            g.fill();
          } else {
            g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
            g.strokeStyle = hov ? col.loc() : withAlpha(theme.muted, 0.7);
            g.lineWidth = 1.6;
            g.beginPath();
            g.arc(cx, yD, r0, 0, TAU);
            g.fill();
            g.stroke();
          }
          g.font = `800 ${Math.round(r0 * 1.15)}px ${theme.font}`;
          g.textAlign = 'center';
          g.textBaseline = 'middle';
          g.fillStyle = done || cur ? textOn(cur ? col.loc() : mixColor(col.loc(), theme.bg, 0.25), theme) : theme.muted;
          g.fillText(done ? '✓' : String(k), cx, yD + 0.5);
          g.restore();
          dotHits.push({ x: cx, y: yD, r: Math.max(r0, 14), k });
        }
        g.save();
        g.globalAlpha *= ease.outCubic(clamp01((frameNow - dvT0) / 400)) * (compact ? 0 : 1);
        g.font = tfont;
        g.fillStyle = theme.text;
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        let title = `${dv}. ${TX(DV_TITLES[dv - 1]!)}`;
        while (g.measureText(title).width > R.w - 2 * padX && title.length > 6) title = `${title.slice(0, -2)}…`;
        g.fillText(title, R.x + padX, yD + 24);
        g.restore();
        drawRows(R, R.y + head, rows, true, stagger(I));
        return h;
      };
    }

    /** Gemeinsame Punkte: gleichsetzen, umformen, Ergebnis. */
    function comCard(I: Intro): CardFn {
      return (R, measure, compact) => {
        const fa = fam();
        const inf = info();
        const big = fs(13.5, 12.5);
        const rows: RowSpec[] = [];
        if (!compact) rows.push({ src: `\\t{${T2('Ansatz:', 'Set')}} f_{k₁}(x) = f_{k₂}(x)\\t{,}  k₁ ≠ k₂`, size: fs(12.5, 11.5), color: th().muted });
        if (!compact) rows.push({ src: S(inf.com[0]), size: big });
        if (!compact || !fa.common.length) rows.push({ src: S(inf.com[1]), size: big });
        if (fa.common.length) {
          rows.push({ src: show() ? `\\b{${C('c', P(inf.com[2]))}}  \\t{${T2('für alle k', 'for all k')}}` : '¿', size: fs(14, 13), hl: col.com() });
          if (show() && fa.touch && !compact) rows.push(noteRow(T2('Alle Kurven haben dort dieselbe Steigung: Sie berühren sich.', 'All curves have the same slope there: they touch.')));
        } else {
          rows.push({ src: show() ? `\\t{${T2('nie erfüllt, da', 'never true, since')}} e^x > 0` : '¿', size: big, hl: col.com() });
          if (show() && !compact) rows.push(noteRow(T2('Kein gemeinsamer Punkt: Zwei Scharkurven unterscheiden sich überall um (k₂ − k₁) · eˣ ≠ 0.', 'No common point: two members always differ by (k₂ − k₁) · eˣ ≠ 0.')));
        }
        return formulaCard(R, measure, fa.common.length && show() ? T2('Gemeinsamer Punkt aller Kurven', 'Point common to all curves') : T2('Gemeinsame Punkte?', 'Common points?'), col.com(), rows, stagger(I));
      };
    }

    /** Wendepunkte und ihre Ortskurve. */
    function wpCard(I: Intro): CardFn {
      return (R, measure, compact) => {
        const inf = info();
        const fa = fam();
        const big = fs(13.5, 12.5);
        const rows: RowSpec[] = [];
        if (!compact) rows.push({ src: `f_k″(x) = ${S(inf.d2)}`, size: fs(13, 12) });
        if (!compact || !inf.wp[1]) rows.push({ src: S(inf.wp[0]), size: big });
        if (inf.wp[1]) {
          rows.push({ src: `${C('w', S(P(inf.wp[1].replace(/^W/, kName('infl')))))}${fa.wlocus ? '' : `  \\t{${T2('für alle k', 'for all k')}}`}`, size: big, hl: col.wp() });
          if (inf.wp[2]) rows.push({ src: `\\t{${T2('Ortskurve:', 'locus:')}} ${C('w', S(inf.wp[2]))}`, size: big });
          else if (show() && !compact) rows.push(noteRow(T2('Der Wendepunkt bleibt fest – keine Ortskurve.', 'The point of inflection stays put – no locus.')));
          const ws = fa.inflections(k1(shownK()));
          if (show() && !ws.length) rows.push(noteRow(T2(`Für k = ${N(k1(shownK()), 1)} gibt es keine Wendepunkte.`, `For k = ${N(k1(shownK()), 1)} there are no points of inflection.`)));
        } else rows.push({ src: show() ? `\\t{${T2('keine Wendepunkte für alle k', 'no points of inflection for any k')}}` : '¿', size: big, hl: col.wp() });
        return formulaCard(R, measure, T2('Wendepunkte', 'Points of inflection'), col.wp(), rows, stagger(I));
      };
    }

    function drawColumn(C0: Rect, I: Intro): void {
      const g = surface.g;
      const gap = C0.h < 620 ? 7 : fs(10, 8);
      const list: { id: string; fn: CardFn; alpha: number }[] = [
        { id: 'fam', fn: famCard(I), alpha: 1 },
        { id: 'case', fn: caseCard(I), alpha: 1 },
        { id: 'loc', fn: locCard(I), alpha: 1 },
        { id: 'com', fn: comCard(I), alpha: 1 },
      ];
      if (kWp.v > 0.01) list.push({ id: 'wp', fn: wpCard(I), alpha: kWp.v });
      const two = !regions().wide && C0.w >= 440;
      const colW = two ? (C0.w - gap) / 2 : C0.w;
      const room = (i: number) => ({ x: C0.x, y: C0.y, w: i === 0 || !two ? C0.w : colW, h: C0.h });
      const full = list.map((c, i) => c.fn(room(i), true, false));
      const short = list.map((c, i) => c.fn(room(i), true, true));
      const compactSet = new Set<number>();
      const heightOf = (i: number) => (compactSet.has(i) ? short[i]! : full[i]!);
      const total = () => {
        if (!two) return list.reduce((s, _, i) => s + (heightOf(i) > 0 ? heightOf(i) + gap : 0), -gap);
        let yl = heightOf(0) + gap;
        let yr = yl;
        for (let i = 1; i < list.length; i++) {
          if (heightOf(i) <= 0) continue;
          if (yl <= yr) yl += heightOf(i) + gap;
          else yr += heightOf(i) + gap;
        }
        return Math.max(yl, yr) - gap;
      };
      for (let i = list.length - 1; i >= 0; i--) {
        if (total() <= C0.h + 1) break;
        if (short[i]! < full[i]!) compactSet.add(i);
      }
      // wieder ausführlich, wo der Platz doch reicht (von oben nach unten)
      for (const i of [...compactSet].sort((a, b) => a - b)) {
        compactSet.delete(i);
        if (total() > C0.h + 1) compactSet.add(i);
      }
      let yL = C0.y;
      let yR = C0.y;
      list.forEach((c, i) => {
        const goal = heightOf(i);
        if (goal <= 0) return;
        let x = C0.x;
        let y = yL;
        let w = C0.w;
        if (two && i > 0) {
          const leftCol = yL <= yR;
          x = leftCol ? C0.x : C0.x + colW + gap;
          y = leftCol ? yL : yR;
          w = colW;
        }
        if (y + goal > C0.y + C0.h + 1) return;
        let ch = cardH.get(c.id);
        if (!ch) {
          ch = new Chan(goal);
          cardH.set(c.id, ch);
        }
        if (ch.goal !== goal) {
          if (reduced()) ch.jump(goal);
          else ch.follow(goal, 0.12);
        }
        const hh = Math.min(ch.v, goal + 40);
        const a = clamp01(I.cards * 1.6 - i * 0.22) * c.alpha;
        g.save();
        g.globalAlpha *= ease.outCubic(a);
        g.translate((1 - ease.outCubic(a)) * 18, 0);
        const R = { x, y, w, h: hh };
        g.save();
        g.beginPath();
        g.rect(R.x - 20, R.y - 20, R.w + 40, R.h + 26);
        g.clip();
        c.fn(R, false, compactSet.has(i));
        g.restore();
        g.restore();
        const adv = hh * clamp01(c.alpha * 1.5) + gap;
        if (two && i > 0) {
          if (x === C0.x) yL += adv;
          else yR += adv;
        } else {
          yL += adv;
          yR = yL;
        }
      });
    }

    /* =====================================================================
     * Zeiger: Perlen ziehen, Scharkurven antippen, k-Strahl bedienen
     * ===================================================================== */
    /** nächster Zustandswechsel von k gleitet (Antippen einer Scharkurve) */
    let glideNext = false;
    function hit(px: number, py: number, touch: boolean): string | null {
      const R = regions();
      const T = R.strip;
      if (px >= T.x && px <= T.x + T.w && py >= T.y && py <= T.y + T.h) {
        const G = stripGeom(T);
        if (Math.hypot(px - G.play.x, py - G.play.y) < G.play.r + 6) return 'play';
        if (Math.abs(px - kToX(G, shownK())) < (touch ? 18 : 12) && Math.abs(py - G.yBar) < 18) return 'knob';
        if (px >= G.x0 - 10 && px <= G.x1 + 10) return 'track';
        return null;
      }
      for (const d of dotHits) if (Math.hypot(px - d.x, py - d.y) <= d.r + 4) return `dv${d.k}`;
      const r = plot.rect;
      if (px < r.x || px > r.x + r.w || py < r.y || py > r.y + r.h) return null;
      const rad = touch ? 24 : 15;
      let best: { id: string; d: number } | null = null;
      for (const h of pearlHits) {
        const d = Math.hypot(px - h.x, py - h.y);
        if (d < rad && (!best || d < best.d)) best = { id: `pe${fam().branches.indexOf(h.b)}`, d };
      }
      if (best) return best.id;
      for (const n of nodeHits) if (Math.hypot(px - n.x, py - n.y) < (touch ? 18 : 11)) return n.id;
      if (kMany.v > 0.5) {
        const [wx] = plot.toWorld(px, py);
        const fa = fam();
        let bf: { i: number; d: number } | null = null;
        FAN.forEach((kf, i) => {
          if (Math.abs(kf - shownK()) < 0.05) return;
          const d = Math.abs(plot.py(fa.f(kf, wx)) - py);
          if (d < (touch ? 14 : 9) && (!bf || d < bf.d)) bf = { i, d };
        });
        if (bf) return `fan${(bf as { i: number }).i}`;
      }
      return null;
    }
    const cursorFor = (id: string | null) => (id?.startsWith('pe') ? 'grab' : id === 'play' || id?.startsWith('fan') || id?.startsWith('dv') ? 'pointer' : id === 'knob' || id === 'track' ? 'ew-resize' : id?.startsWith('com') ? 'help' : '');
    function stopRun(): void {
      sweep = null;
      if (ctx.clock.playing) ctx.clock.pause();
    }
    function scrubTo(px: number): void {
      const G = stripGeom(regions().strip);
      lastDrag = performance.now();
      setP({ k: k1(clamp(xToK(G, px), K_MIN, K_MAX)) });
    }
    const target: Target = {
      contains: (px: number, py: number) => hit(px, py, false) !== null,
      pointerDown: (q: Ptr) => {
        const id = hit(q.px, q.py, q.type === 'touch');
        if (!id) return false;
        if (!editable() && !id.startsWith('com')) return false;
        if (id === 'play') {
          if (ctx.clock.playing) ctx.clock.pause();
          else ctx.clock.play();
          ctx.requestRender();
          return true;
        }
        if (id === 'knob' || id === 'track') {
          stopRun();
          drag = { kind: 'strip', moved: false };
          hover = { id: 'knob', px: q.px, py: q.py };
          scrubTo(q.px);
          ctx.requestRender();
          return true;
        }
        if (id.startsWith('dv')) {
          const k = Number(id.slice(2));
          if (k !== p.dv) setP({ dv: k });
          return true;
        }
        if (id.startsWith('pe')) {
          const b = fam().branches[Number(id.slice(2))]!;
          const h = pearlHits.find((ph) => ph.b === b);
          stopRun();
          drag = { kind: 'pearl', b, off: h ? [h.x - q.px, h.y - q.py] : [0, 0] };
          hover = { id, px: q.px, py: q.py };
          surface.setCursor('grabbing');
          ctx.requestRender();
          return true;
        }
        if (id.startsWith('fan')) {
          stopRun();
          glideNext = true;
          setP({ k: FAN[Number(id.slice(3))]! });
          glideNext = false;
          ctx.requestRender();
          return true;
        }
        if (id.startsWith('com')) {
          hover = { id, px: q.px, py: q.py };
          ctx.requestRender();
          return q.type === 'touch';
        }
        return false;
      },
      pointerMove: (q: Ptr) => {
        if (!drag) return;
        lastDrag = performance.now();
        if (drag.kind === 'strip') {
          drag.moved = true;
          scrubTo(q.px);
          ctx.requestRender();
          return;
        }
        const [tx, ty] = plot.toWorld(q.px + drag.off[0], q.py + drag.off[1]);
        const k = nearestK(drag.b, tx, ty, plot.scale.x, plot.scale.y);
        if (k !== null) setP({ k: k1(clamp(k, K_MIN, K_MAX)) });
        ctx.requestRender();
      },
      pointerUp: (q: Ptr) => {
        drag = null;
        const id = hit(q.px, q.py, false);
        hover = id ? { id, px: q.px, py: q.py } : null;
        if (q.type === 'touch' && id?.startsWith('com')) hover = null;
        surface.setCursor(cursorFor(id));
        setLabels();
        ctx.requestRender();
      },
      hover: (q: Ptr | null) => {
        const id = q ? hit(q.px, q.py, false) : null;
        const prev = hover?.id ?? null;
        hover = q && id ? { id, px: q.px, py: q.py } : null;
        surface.setCursor(cursorFor(id));
        if (prev !== id || id?.startsWith('fan') || id?.startsWith('com')) ctx.requestRender();
      },
      wheel: () => false,
    };
    surface.addTarget(target);

    /* ---------- Ergebnisse unter der Bühne ---------- */
    const plain = (src: string) =>
      src
        .replace(/\\f\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')
        .replace(/\^4/g, '⁴')
        .replace(/\^x/g, 'ˣ')
        .replace(/\\t\{([^}]*)\}/g, '$1');
    function updateReadouts(): void {
      const fa = fam();
      const inf = info();
      const k = p.k;
      const ex = fa.extrema(k);
      const none = T2('keine', 'none');
      // Terrassenpunkte sind keine Extrempunkte: „keine (Terrassenpunkt (0 | 0))“
      const exTxt = (list: typeof ex) => list.map((e) => `${kLong(e.kind)} ${fmt.point(clean(e.x, 2), clean(e.y, 2))}`).join('; ');
      const real = ex.filter((e) => e.kind !== 'saddle');
      const sad = ex.filter((e) => e.kind === 'saddle');
      ctx.readout('ext', `${real.length ? exTxt(real) : none}${sad.length ? ` (${exTxt(sad)})` : ''}`);
      ctx.readout('loc', `${plain(inf.loc[3])}${inf.gap ? ` (${inf.gap})` : ''}`);
      ctx.readout('com', fa.common.length ? fa.common.map(([x, y]) => fmt.point(x, y)).join('; ') + (fa.touch ? T2(' (Berührpunkt)', ' (curves touch)') : '') : T2('keiner', 'none'));
      if (p.wp) {
        const ws = fa.inflections(k);
        ctx.readout('wp', ws.length ? ws.map((w) => fmt.point(clean(w.x, 2), clean(w.y, 2))).join('; ') : none);
      } else ctx.readout('wp', null);
    }
    function setLabels(): void {
      ctx.setAction('sweep', { enabled: editable() });
      ctx.setAction('dnext', { enabled: editable(), label: p.dv < DV ? T2(`Herleitung: Schritt ${p.dv + 1}/${DV}`, `Derivation: step ${p.dv + 1}/${DV}`) : T2('Herleitung von vorn', 'Derivation from the start') });
      ctx.setAction('clear', { enabled: editable() && !!trail });
      ctx.setAction('reveal', { enabled: editable() });
    }

    ctx.clock.onChange((on) => {
      if (on) {
        if (ctx.locked) {
          ctx.clock.pause();
          return;
        }
        // an einem Rand: in die andere Richtung starten
        if (KS.v <= K_MIN + 1e-6) runDir = 1;
        else if (KS.v >= K_MAX - 1e-6) runDir = -1;
        KS.jump(KS.v);
      } else {
        // angehalten: k bleibt dort stehen (auf eine Stelle gerundet)
        if (sweep) sweep = null;
        const v = k1(KS.v);
        if (v !== p.k) setP({ k: v });
        else KS.follow(p.k, 0.12);
      }
      setLabels();
      ctx.requestRender();
    });

    /* ---------- Rendern ---------- */
    let lastK = KS.v;
    let hadTrail = false;
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      frameNow = now;
      frameDt = dt;
      numsBusy = false;
      let anim = false;
      for (const c of chans()) if (c.step(now, dt)) anim = true;
      kCase.follow(caseIndex(fam(), k1(KS.v)), 0.12);
      if (story && now - story.t0 > 2600) story = null;
      if (famIn !== null && now - famIn > 1700) famIn = null;
      if (prevFam && now - prevFam.t0 > 520) prevFam = null;
      // Spur und Schweif fortschreiben
      const k = KS.v;
      if (Math.abs(k - lastK) > 1e-7) {
        if (!trail) trail = { lo: Math.min(k, lastK), hi: Math.max(k, lastK) };
        else trail = { lo: Math.min(trail.lo, k), hi: Math.max(trail.hi, k) };
        if (!recent.length) recent.push({ k: lastK, t: now });
        recent.push({ k, t: now });
        lastK = k;
      }
      if (!!trail !== hadTrail) {
        hadTrail = !!trail;
        setLabels();
      }
      recent = recent.filter((r) => now - r.t < 900);
      if (recent.length === 1) recent = [];
      if (intro !== null || story || famIn !== null || prevFam || sweep || playing() || dragging() || recent.length || now - dvT0 < 500) anim = true;
      const I = introState(now);
      const R = regions();
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      g.save();
      g.globalAlpha = I.panel;
      g.translate(0, (1 - I.panel) * 10);
      drawPlot(now, I);
      drawStrip(R.strip, I);
      g.restore();
      drawColumn(R.col, I);
      if (numsBusy) anim = true;
      if (anim) ctx.requestRender();
    }

    let prevKey: FamKey = key();
    return {
      update(changed, source) {
        const now = performance.now();
        const instant = source === 'init' || reduced();
        if (source === 'replace') {
          sweep = null;
          if (ctx.clock.playing) ctx.clock.pause();
          story = null;
          trail = null;
          recent = [];
        }
        // Wechsel der Schar: alte Kurven blenden aus, Fächer klappt neu auf
        if (changed.has('fam') && source !== 'init' && prevKey !== key()) {
          if (!reduced()) {
            prevFam = { key: prevKey, k: KS.v, t0: now };
            famIn = now;
          }
          trail = null;
          recent = [];
          KS.jump(p.k);
          lastK = p.k;
          nums.clear();
        }
        prevKey = key();
        // k gleitet (beim Abspielen läuft es selbst)
        if (!playing() && !sweep) {
          if (instant) KS.jump(p.k);
          else if (source === 'replace') KS.glide(p.k, 850, 0, now);
          else if (glideNext) KS.glide(p.k, 650, 0, now, ease.inOutCubic);
          else if (KS.goal !== p.k) KS.follow(p.k, dragging() ? 0.05 : 0.16);
        }
        if (instant || changed.has('fam')) lastK = KS.v;
        // Herleitungsschritte
        const dv = p.dv;
        if (changed.has('dv') && source !== 'init') {
          dvT0 = now;
          story = !reduced() && dv === lastDv + 1 && source !== 'replace' ? { step: dv, t0: now } : null;
        }
        const forward = dv > lastDv;
        lastDv = dv;
        for (let i = 1; i <= DV; i++) {
          const goal = dv >= i ? 1 : 0;
          const c = vis[i]!;
          if (instant) c.jump(goal);
          else if (c.goal !== goal) c.glide(goal, goal ? 520 : 380, goal && forward && !story ? (i - 1) * 120 : 0, now);
          const fg = dv === i ? 1 : 0;
          if (instant) foc[i]!.jump(fg);
          else if (foc[i]!.goal !== fg) foc[i]!.glide(fg, 500, 0, now);
        }
        if (instant) dvPos.jump(dv);
        else dvPos.glide(dv, 520, 0, now, ease.outCubic);
        const flags: [Chan, boolean, number][] = [
          [kMany, p.many, 600],
          [kExt, p.ext, 450],
          [kLoc, p.loc, 450],
          [kWp, p.wp, 500],
          [kShow, p.show, 900],
        ];
        for (const [c, on, dur] of flags) {
          const goal = on ? 1 : 0;
          if (instant) c.jump(goal);
          else if (c.goal !== goal) c.glide(goal, dur, 0, now);
        }
        retargetView(now, instant);
        if (source === 'init') {
          kCase.jump(caseIndex(fam(), p.k));
          if (!reduced()) intro = now;
        }
        setLabels();
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        if (id === 'sweep') {
          trail = null;
          recent = [];
          if (reduced()) {
            trail = { lo: K_MIN, hi: K_MAX };
          } else {
            const k0 = k1(KS.v);
            sweep = { k0, s: 0, len: sweepLength(k0) };
            if (!ctx.clock.playing) ctx.clock.play();
          }
        } else if (id === 'dnext') setP({ dv: p.dv < DV ? p.dv + 1 : 1 });
        else if (id === 'clear') {
          trail = null;
          recent = [];
        } else if (id === 'reveal') setP({ show: true });
        setLabels();
        ctx.requestRender();
      },
      tick(dt) {
        if (sweep) {
          sweep.s += (dt * 1000) / SWEEP_MS_PER_K;
          const t = sweep.s / sweep.len;
          KS.jump(sweepK(t, sweep.k0));
          if (t >= 1) {
            KS.jump(sweep.k0);
            ctx.clock.pause();
          }
        } else {
          const r = bounceK(KS.v, runDir, RUN_SPEED * dt);
          runDir = r.dir;
          KS.jump(r.k);
        }
        // Regler k in der Seitenleiste mitführen (update greift während des Laufs nicht ein)
        const v = k1(KS.v);
        if (v !== p.k) setP({ k: v });
      },
      resetTime() {
        trail = null;
        recent = [];
        sweep = null;
        setLabels();
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
