import { clamp, defineSimulation, ease, formatPiFraction, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  compile,
  derivative,
  findExtrema,
  findHoles,
  findIntersections,
  findZeros,
  fitRange,
  fnLabel,
  intExponent,
  numberText,
  paramsIn,
  parseTerm,
  termText,
  traceFunction,
  type Break,
  type Env,
  type Extremum,
  type Fn1,
  type Hole,
  type Node,
  type ParseError,
  type ParseResult,
  type Root,
} from './model';

const L = (de: string, en: string) => ({ de, en });

type Slot = 'f' | 'g' | 'h';
const SLOTS: readonly Slot[] = ['f', 'g', 'h'];
/** Reihenfarbe je Funktion: f blau, g grün, h lila (rot bleibt für Fehler, orange für Schnittpunkte). */
const SERIES: Record<Slot, number> = { f: 0, g: 2, h: 4 };

const usesParam = (name: 'a' | 'b') => (v: Record<string, unknown>) => SLOTS.some((s) => paramsIn(String(v[s] ?? '')).includes(name));
const traceOn = (v: Record<string, unknown>) => v.sp !== 'off';

/** Gesetzter Formelteil: Maße und Zeichenfunktion. */
interface Box {
  w: number;
  asc: number;
  desc: number;
  paint(x: number, base: number, color: string): void;
}

/** Zustand einer Funktion f, g oder h. */
interface SlotState {
  src: string;
  res: ParseResult;
  /** Ausgewertete Funktion (mit den aktuellen Parametern) oder null. */
  fn: Fn1 | null;
  /** Rohfunktion mit Parametern (für die Schar). */
  raw: ((x: number, env: Env) => number) | null;
  /** Letzter gültiger Term (wird bei Tippfehlern blass weiter gezeigt). */
  stale: Fn1 | null;
  /** Überblenden vom alten zum neuen Graphen. */
  morph: { from: Fn1; to: Fn1; start: number } | null;
  version: number;
  trig: boolean;
}

interface Cached {
  key: string;
  segs: number[][];
  /** Dieselben Linienzüge in Pixeln (für Treffer und Zeichnen). */
  px: Float64Array[];
  breaks: Break[];
}

type Marker =
  | { kind: 'zero'; slot: Slot; x: number; y: number; touch: boolean }
  | { kind: 'max' | 'min'; slot: Slot; x: number; y: number }
  | { kind: 'cross'; slot: Slot; other: Slot; x: number; y: number; touch: boolean }
  | { kind: 'hole'; slot: Slot; x: number; y: number };

interface Analysis {
  key: string;
  zeros: Record<Slot, Root[] | 'all' | null>;
  extrema: Record<Slot, Extremum[] | null>;
  crosses: { a: Slot; b: Slot; pts: { x: number; y: number; touch: boolean }[]; same: boolean }[];
  holes: Record<Slot, Hole[]>;
  markers: Marker[];
}

const MORPH_MS = 480;
const FAMILY = [-3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3];

/**
 * Funktionsplotter: bis zu drei eigene Terme (sicherer Parser ohne eval) als
 * Graphen – mit Zoomen und Verschieben, Spur zum Ziehen am Graphen,
 * Wertetabelle, näherungsweise markierten Nullstellen, Schnitt- und
 * Extrempunkten, Polstellen ohne senkrechte Verbindungslinien und Scharen.
 */
export default defineSimulation({
  id: 'funktionsplotter',
  dragHint: true,
  layout: { aspect: 1.5, aspectNarrow: 0.5 },
  groups: [
    { id: 'terms', label: L('Terme', 'Expressions') },
    { id: 'par', label: L('Parameter', 'Parameters') },
    { id: 'pts', label: L('Besondere Punkte', 'Special points') },
    { id: 'trace', label: L('Spur und Wertetabelle', 'Trace and table of values') },
    { id: 'win', label: L('Ausschnitt', 'Window') },
  ],
  params: [
    {
      key: 'f',
      type: 'text',
      group: 'terms',
      label: L('f(x) =', 'f(x) ='),
      default: 'x^2 - 2',
      maxLength: 60,
      placeholder: L('z. B. x^2 - 2', 'e.g. x^2 - 2'),
      help: L(
        'Rechenzeichen + - * / ^, implizites Mal wie 2x oder 3(x + 1), Dezimalkomma 0,5. Funktionen: sin, cos, tan, sqrt (√), abs oder |x|, exp, ln, lg, log_2. Konstanten π (pi) und e, Parameter a und b.',
        'Operators + - * / ^, implicit multiplication like 2x or 3(x + 1), decimals 0.5. Functions: sin, cos, tan, sqrt (√), abs or |x|, exp, ln, lg, log_2. Constants π (pi) and e, parameters a and b.',
      ),
    },
    { key: 'g', type: 'text', group: 'terms', label: L('g(x) =', 'g(x) ='), default: '2sin(x)', maxLength: 60, placeholder: L('z. B. 2sin(x)', 'e.g. 2sin(x)') },
    { key: 'h', type: 'text', group: 'terms', label: L('h(x) =', 'h(x) ='), default: '', maxLength: 60, placeholder: L('z. B. 1/(x - 1)', 'e.g. 1/(x - 1)') },
    { key: 'a', type: 'number', group: 'par', label: L('Parameter a', 'Parameter a'), min: -5, max: 5, step: 0.1, default: 1, visibleIf: usesParam('a') },
    { key: 'b', type: 'number', group: 'par', label: L('Parameter b', 'Parameter b'), min: -5, max: 5, step: 0.1, default: 1, visibleIf: usesParam('b') },
    { key: 'sch', type: 'boolean', group: 'par', label: L('Schar zeichnen: a = −3; −2,5; …; 3', 'Draw the family: a = −3, −2.5, …, 3'), default: false, visibleIf: usesParam('a') },
    { key: 'nst', type: 'boolean', group: 'pts', label: L('Nullstellen', 'Zeros'), default: true },
    { key: 'ext', type: 'boolean', group: 'pts', label: L('Hoch- und Tiefpunkte', 'Maxima and minima'), default: false },
    { key: 'sct', type: 'boolean', group: 'pts', label: L('Schnittpunkte der Graphen', 'Intersections of the graphs'), default: true },
    { key: 'asy', type: 'boolean', group: 'pts', label: L('Polstellen und Definitionslücken', 'Poles and gaps in the domain'), default: true },
    {
      key: 'sp',
      type: 'choice',
      group: 'trace',
      label: L('Spur auf', 'Trace on'),
      options: [
        { value: 'f', label: L('f', 'f') },
        { value: 'g', label: L('g', 'g') },
        { value: 'h', label: L('h', 'h') },
        { value: 'off', label: L('aus', 'off') },
      ],
      default: 'f',
      help: L('Ziehe den Punkt am Graphen entlang oder tippe auf einen Graphen.', 'Drag the point along the graph or tap a graph.'),
    },
    { key: 'tx', type: 'number', group: 'trace', label: L('Spur bei x =', 'Trace at x ='), min: -50, max: 50, step: 0.01, default: 1, visibleIf: traceOn },
    { key: 'tg', type: 'boolean', group: 'trace', label: L('Tangente im Spurpunkt', 'Tangent at the traced point'), default: false, visibleIf: traceOn },
    { key: 'tab', type: 'boolean', group: 'trace', label: L('Wertetabelle im Bild', 'Table of values in the picture'), default: true },
    { key: 'x0', type: 'number', group: 'trace', label: L('Tabelle ab x =', 'Table from x ='), min: -50, max: 50, step: 0.25, default: -3 },
    { key: 'dx', type: 'number', group: 'trace', label: L('Schrittweite Δx', 'Step Δx'), min: 0.05, max: 10, step: 0.05, default: 1 },
    { key: 'x1', type: 'number', group: 'win', label: L('x von', 'x from'), min: -100, max: 100, step: 0.5, default: -6 },
    { key: 'x2', type: 'number', group: 'win', label: L('x bis', 'x to'), min: -100, max: 100, step: 0.5, default: 6 },
    { key: 'y1', type: 'number', group: 'win', label: L('y von', 'y from'), min: -100, max: 100, step: 0.5, default: -4 },
    { key: 'y2', type: 'number', group: 'win', label: L('y bis', 'y to'), min: -100, max: 100, step: 0.5, default: 4 },
    { key: 'eq', type: 'boolean', group: 'win', label: L('Gleiche Einheiten auf beiden Achsen', 'Same units on both axes'), default: true },
    { key: 'pi', type: 'boolean', group: 'win', label: L('x-Achse in Vielfachen von π', 'x-axis in multiples of π'), default: false },
  ],
  actions: [
    { id: 'fit', label: L('Graphen einpassen', 'Fit the graphs'), primary: true },
    { id: 'home', label: L('Standardausschnitt', 'Standard window') },
  ],
  readouts: [
    { key: 'terms', label: L('Terme', 'Expressions') },
    { key: 'trace', label: L('Spur', 'Trace') },
    { key: 'nst', label: L('Nullstellen (im Ausschnitt)', 'Zeros (in the window)'), spoiler: true },
    { key: 'ext', label: L('Hoch- und Tiefpunkte (im Ausschnitt)', 'Maxima and minima (in the window)'), spoiler: true },
    { key: 'sct', label: L('Schnittpunkte (im Ausschnitt)', 'Intersections (in the window)'), spoiler: true },
    { key: 'gaps', label: L('Polstellen und Definitionslücken (im Ausschnitt)', 'Poles and gaps (in the window)'), spoiler: true },
    { key: 'table', label: L('Wertetabelle', 'Table of values') },
  ],
  presets: [
    { id: 'start', label: L('Parabel und Sinus', 'Parabola and sine'), values: {} },
    { id: 'family', label: L('Parabelschar', 'Family of parabolas'), values: { f: 'a x^2', g: '', a: 0.5, sch: true, sct: false } },
    { id: 'sine', label: L('Sinus strecken', 'Stretching the sine'), values: { f: 'sin(x)', g: '2sin(x)', h: 'sin(2x)', nst: false, sct: false, pi: true, x1: -6.5, x2: 6.5, y1: -3, y2: 3, eq: false, tx: 1.57 } },
    { id: 'race', label: L('x² gegen 2ˣ', 'x² versus 2ˣ'), values: { f: 'x^2', g: '2^x', nst: false, x1: -3, x2: 5, y1: -2, y2: 18, eq: false, tx: 3 } },
    { id: 'rational', label: L('Gebrochen-rational', 'Rational function'), values: { f: '(x^2 - 1)/(x^2 - 4)', g: '', ext: true, x1: -5, x2: 5, y1: -4, y2: 4, tx: 3 } },
    { id: 'cubic', label: L('Ganzrational: x³ − 3x', 'Polynomial: x³ − 3x'), values: { f: 'x^3 - 3x', g: 'x', ext: true, x1: -4, x2: 4, y1: -4, y2: 4, tx: -1 } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatensystem mit den Graphen der eingegebenen Funktionen f, g und h, dazu Spurpunkt, besondere Punkte und Wertetabelle',
      termsTitle: 'Terme',
      traceTitle: 'Spur',
      tableTitle: 'Wertetabelle',
      empty: 'leer',
      emptyPlot: 'Gib bei f(x) einen Term ein – z. B. x^2 - 2, sin(x) oder 1/x.',
      allErrors: 'Der Term enthält noch einen Fehler – siehe rechts.',
      allErrorsNarrow: 'Der Term enthält noch einen Fehler – siehe unten.',
      allErrorsN: 'Die Terme enthalten noch Fehler – siehe rechts.',
      allErrorsNNarrow: 'Die Terme enthalten noch Fehler – siehe unten.',
      undefinedAt: '{f}({x}) ist nicht definiert.',
      outside: 'Der Spurpunkt liegt außerhalb des Ausschnitts.',
      traceOff: 'Spur ausgeschaltet',
      traceNone: 'Für {f} ist noch kein gültiger Term eingegeben.',
      slope: 'Steigung der Tangente: m {rel} {m}',
      noSlope: 'Hier gibt es keine Tangente (Knick oder Lücke).',
      tapHint: 'Ziehe den Punkt am Graphen entlang oder tippe auf einen Graphen.',
      family: 'Schar: a = −3 … 3 (blass), a = {a} (kräftig)',
      zero: 'x {rel} {x}',
      max: 'H{rel}({x} | {y})',
      min: 'T{rel}({x} | {y})',
      cross: 'S{rel}({x} | {y})',
      hole: 'Lücke ({x} | {y})',
      maxWord: 'Hochpunkt',
      minWord: 'Tiefpunkt',
      none: 'keine',
      allZero: '{f} ist überall 0',
      same: '{a} und {b} haben denselben Graphen',
      pole: 'Polstelle bei x {rel} {x}',
      edge: 'Rand der Definitionsmenge bei x {rel} {x}',
      jump: 'Sprungstelle bei x {rel} {x}',
      holeAt: 'Definitionslücke bei x = {x}, Loch im Graphen bei ({x} | {y})',
      notDef: '–',
      sep: '; ',
      andSep: ' · ',
      eqSign: '=',
      touchNote: '(Berührstelle)',
      e_badChar: 'Das Zeichen „{a}“ kann ich nicht lesen.',
      e_equals: 'Gib nur den Term ein – ohne „=“, z. B. x^2 statt x^2 = 4.',
      e_unknownName: '„{a}“ kenne ich nicht. Erlaubt sind sin, cos, tan, sqrt (√), abs, exp, ln, lg, log, π (pi), e, x sowie die Parameter a und b.',
      e_unknownNameHint: '„{a}“ kenne ich nicht – meintest du „{b}“?',
      e_yVar: 'Der Term darf kein y enthalten: Gib nur die rechte Seite ein, z. B. x^2 statt y = x^2.',
      e_otherVar: 'Die Variable „{a}“ gibt es hier nicht – verwende x (und die Parameter a und b).',
      e_decimal: 'Nach dem Komma fehlen die Nachkommastellen.',
      e_numTooLong: 'Die Zahl ist zu lang (höchstens 12 Ziffern).',
      e_expectOperand: 'Nach „{a}“ fehlt noch etwas – eine Zahl, x oder eine Klammer.',
      e_startOperator: 'Vor „{a}“ fehlt eine Zahl oder x.',
      e_missingOp: 'Zwischen „{a}“ und „{b}“ fehlt ein Rechenzeichen, z. B. * oder ^.',
      e_varDigit: '„{a}{b}“ ist mehrdeutig: Meintest du {a}^{b} oder {b}{a}?',
      e_unclosed: 'Zur Klammer „{a}“ fehlt die schließende Klammer.',
      e_unexpectedClose: 'Zur Klammer „{a}“ gibt es keine öffnende Klammer.',
      e_mismatch: 'Die Klammer „{a}“ wird mit „{b}“ geschlossen.',
      e_emptyParens: 'In der Klammer steht nichts.',
      e_fnNoArg: 'Nach „{a}“ fehlt das Argument, z. B. {a}(x).',
      e_absUnclosed: 'Der Betragsstrich „|“ wird nicht geschlossen.',
      e_emptyAbs: 'Zwischen den Betragsstrichen steht nichts.',
      e_logBase: 'Die Basis des Logarithmus muss positiv und ungleich 1 sein, z. B. log_2(x).',
      e_tooLong: 'Der Term ist zu lang.',
      e_tooDeep: 'Der Term ist zu tief verschachtelt.',
    },
    en: {
      canvas: 'Coordinate plane with the graphs of the functions f, g and h you typed in, plus a traced point, special points and a table of values',
      termsTitle: 'Expressions',
      traceTitle: 'Trace',
      tableTitle: 'Table of values',
      empty: 'empty',
      emptyPlot: 'Type an expression for f(x) – e.g. x^2 - 2, sin(x) or 1/x.',
      allErrors: 'The expression still contains a mistake – see the right.',
      allErrorsNarrow: 'The expression still contains a mistake – see below.',
      allErrorsN: 'The expressions still contain mistakes – see the right.',
      allErrorsNNarrow: 'The expressions still contain mistakes – see below.',
      undefinedAt: '{f}({x}) is not defined.',
      outside: 'The traced point is outside the window.',
      traceOff: 'Trace switched off',
      traceNone: 'There is no valid expression for {f} yet.',
      slope: 'Slope of the tangent: m {rel} {m}',
      noSlope: 'There is no tangent here (corner or gap).',
      tapHint: 'Drag the point along the graph or tap a graph.',
      family: 'Family: a = −3 … 3 (pale), a = {a} (bold)',
      zero: 'x {rel} {x}',
      max: 'max{rel}({x}, {y})',
      min: 'min{rel}({x}, {y})',
      cross: '{rel}({x}, {y})',
      hole: 'hole ({x}, {y})',
      maxWord: 'maximum',
      minWord: 'minimum',
      none: 'none',
      allZero: '{f} is 0 everywhere',
      same: '{a} and {b} have the same graph',
      pole: 'pole at x {rel} {x}',
      edge: 'end of the domain at x {rel} {x}',
      jump: 'jump at x {rel} {x}',
      holeAt: 'gap in the domain at x = {x}, hole in the graph at ({x}, {y})',
      notDef: '–',
      sep: ', ',
      andSep: ' · ',
      eqSign: '=',
      touchNote: '(touching)',
      e_badChar: 'I cannot read the character “{a}”.',
      e_equals: 'Type the expression only – without “=”, e.g. x^2 instead of x^2 = 4.',
      e_unknownName: 'I do not know “{a}”. Allowed are sin, cos, tan, sqrt (√), abs, exp, ln, lg, log, π (pi), e, x and the parameters a and b.',
      e_unknownNameHint: 'I do not know “{a}” – did you mean “{b}”?',
      e_yVar: 'The expression must not contain y: type the right-hand side only, e.g. x^2 instead of y = x^2.',
      e_otherVar: 'There is no variable “{a}” here – use x (and the parameters a and b).',
      e_decimal: 'Digits are missing after the decimal point.',
      e_numTooLong: 'The number is too long (at most 12 digits).',
      e_expectOperand: 'Something is missing after “{a}” – a number, x or a bracket.',
      e_startOperator: 'A number or x is missing before “{a}”.',
      e_missingOp: 'An operator is missing between “{a}” and “{b}”, e.g. * or ^.',
      e_varDigit: '“{a}{b}” is ambiguous: did you mean {a}^{b} or {b}{a}?',
      e_unclosed: 'The bracket “{a}” is never closed.',
      e_unexpectedClose: 'The bracket “{a}” has no opening bracket.',
      e_mismatch: 'The bracket “{a}” is closed with “{b}”.',
      e_emptyParens: 'There is nothing inside the brackets.',
      e_fnNoArg: 'The argument is missing after “{a}”, e.g. {a}(x).',
      e_absUnclosed: 'The absolute value bar “|” is never closed.',
      e_emptyAbs: 'There is nothing between the absolute value bars.',
      e_logBase: 'The base of the logarithm must be positive and not 1, e.g. log_2(x).',
      e_tooLong: 'The expression is too long.',
      e_tooDeep: 'The expression is nested too deeply.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const lang = ctx.lang;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    /** Handy-Layout nur bei schmaler und hoher Fläche (Tablets mit 560–640 px breiter, flacher Fläche bleiben beim Desktop-Layout). */
    const narrow = () => surface.width < 640 && surface.height > surface.width * 0.9;
    const colOf = (s: Slot) => ctx.theme.series[SERIES[s]]!;
    const orange = () => ctx.theme.series[3]!;
    const red = () => ctx.theme.series[1]!;
    const env = (): Env => ({ a: p.a, b: p.b });

    /* ---------- Zahlen ---------- */
    /** Runden wie in der Schule (bei 5 vom Nullpunkt weg). */
    const round = (v: number, d = 2) => (Math.sign(v) * Math.round(Math.abs(v) * 10 ** d + 1e-9)) / 10 ** d;
    const nf = (v: number, d = 2) => fmt.num(round(v, d), d);
    const isRounded = (v: number, d = 2) => Math.abs(round(v, d) - v) > 1e-9 * Math.max(1, Math.abs(v));
    const rel = (...vs: number[]) => (vs.some((v) => isRounded(v)) ? '≈' : '=');
    /** x-Wert, bei Winkelfunktionen als Vielfaches von π, wenn das passt. */
    const xNice = (x: number, trig: boolean) => {
      if (trig && Math.abs(x) > 1e-9) {
        const pf = formatPiFraction(x, [1, 2, 3, 4, 6]);
        if (pf && Math.abs(x) >= 0.5) return pf.replace('-', '−');
      }
      return nf(x);
    };

    /* ---------- Terme ---------- */
    const state: Record<Slot, SlotState> = {
      f: blankSlot(),
      g: blankSlot(),
      h: blankSlot(),
    };

    function blankSlot(): SlotState {
      return { src: '', res: { ok: 'empty' }, fn: null, raw: null, stale: null, morph: null, version: 0, trig: false };
    }

    /** Liest die Terme neu ein; `animate`: alter Graph fließt in den neuen über. */
    function readTerms(animate: boolean): boolean {
      let any = false;
      for (const s of SLOTS) {
        const st = state[s];
        const src = String(p[s] ?? '');
        if (src === st.src && st.version > 0) continue;
        const before = shown(s);
        st.src = src;
        st.res = parseTerm(src);
        st.version++;
        any = true;
        if (st.res.ok === true) {
          st.raw = compile(st.res.term.node);
          st.trig = st.res.term.trig;
          st.stale = null;
        } else {
          // Tippfehler: den letzten gültigen Graphen blass stehen lassen; leer: weg damit
          if (st.res.ok === false && st.raw) st.stale = shown(s);
          if (st.res.ok === 'empty') st.stale = null;
          st.raw = null;
          st.trig = false;
        }
        bindSlot(s);
        if (animate && !reduced && before && st.fn) st.morph = { from: before, to: st.fn, start: performance.now() };
        else st.morph = null;
      }
      return any;
    }

    /** Funktion mit den aktuellen Parametern a, b. */
    function bindSlot(s: Slot): void {
      const st = state[s];
      const raw = st.raw;
      if (!raw) {
        st.fn = null;
        return;
      }
      const e = env();
      st.fn = (x) => raw(x, e);
      if (st.morph) st.morph.to = st.fn;
    }

    /** Was gerade gezeichnet wird (beim Überblenden eine Mischung). */
    function shown(s: Slot): Fn1 | null {
      const st = state[s];
      if (!st.fn) return null;
      const m = st.morph;
      if (!m) return st.fn;
      const k = ease.inOutCubic(clamp((performance.now() - m.start) / MORPH_MS, 0, 1));
      if (k >= 1) return st.fn;
      const from = m.from;
      const to = m.to;
      return (x) => {
        const yb = to(x);
        const ya = from(x);
        if (!Number.isFinite(ya)) return yb;
        if (!Number.isFinite(yb)) return NaN;
        return ya + (yb - ya) * k;
      };
    }

    const morphing = () => SLOTS.some((s) => {
      const m = state[s].morph;
      return !!m && performance.now() - m.start < MORPH_MS;
    });
    const valid = () => SLOTS.filter((s) => !!state[s].fn);

    /* ---------- Aufteilung ---------- */
    function regions(): { plot: Rect; panel: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (!narrow()) {
        const pw = Math.round(clamp(w * 0.34, 250, 330));
        return { plot: { x: 0, y: 0, w: w - pw - 12, h }, panel: { x: w - pw, y: 0, w: pw, h } };
      }
      const ph = Math.round(Math.min(w * 0.94, h * 0.47));
      return { plot: { x: 0, y: 0, w, h: ph }, panel: { x: 0, y: ph + 10, w, h: h - ph - 10 } };
    }

    const plot = new Plot(surface, { x: [-6, 6], y: [-4, 4], equalAspect: false, region: () => regions().plot });

    /* ---------- Ausschnitt ---------- */
    interface View {
      x: [number, number];
      y: [number, number];
    }

    /** Sichtbarer Bereich aus den Reglern (bei gleichen Einheiten wird eine Richtung erweitert). */
    function windowView(): View {
      let [x1, x2] = p.x1 <= p.x2 ? [p.x1, p.x2] : [p.x2, p.x1];
      let [y1, y2] = p.y1 <= p.y2 ? [p.y1, p.y2] : [p.y2, p.y1];
      if (x2 - x1 < 0.5) x2 = x1 + 0.5;
      if (y2 - y1 < 0.5) y2 = y1 + 0.5;
      if (!p.eq) return { x: [x1, x2], y: [y1, y2] };
      const r = plot.rect;
      const s = Math.min(r.w / (x2 - x1), r.h / (y2 - y1));
      const cx = (x1 + x2) / 2;
      const cy = (y1 + y2) / 2;
      const hw = r.w / s / 2;
      const hh = r.h / s / 2;
      return { x: [cx - hw, cx + hw], y: [cy - hh, cy + hh] };
    }

    function currentView(): View {
      const b = plot.bounds;
      return { x: [b.xMin, b.xMax], y: [b.yMin, b.yMax] };
    }

    /** Ausschnitte überblenden: Breite/Höhe logarithmisch, Mitte linear. */
    function mixView(a: View, b: View, t: number): View {
      const mix = (u: [number, number], v: [number, number]): [number, number] => {
        const wu = u[1] - u[0];
        const wv = v[1] - v[0];
        const w = Math.exp(Math.log(wu) + (Math.log(wv) - Math.log(wu)) * t);
        const c = (u[0] + u[1]) / 2 + ((v[0] + v[1]) / 2 - (u[0] + u[1]) / 2) * t;
        return [c - w / 2, c + w / 2];
      };
      return { x: mix(a.x, b.x), y: mix(a.y, b.y) };
    }

    const viewTw = new Tween(560, ease.inOutCubic);
    let viewFrom: View = { x: [-6, 6], y: [-4, 4] };
    let viewTo: View = viewFrom;
    let viewKey = '';
    let viewPending: 'now' | 'tween' | null = 'now';

    /* ---------- Spur ---------- */
    /** Genaue Stelle der Spur (der Regler speichert auf 0,01 gerundet). */
    let traceX = p.tx;
    let dragSlot: Slot | null = null;
    let hoverSlot: Slot | null = null;
    let selected: Marker | null = null;
    const tracePop = new Tween(420, ease.outBack);
    const markPop = new Tween(520, ease.outBack);
    const traceSlot = (): Slot | null => (p.sp === 'off' ? null : (p.sp as Slot));

    /* ---------- Abtasten (zwischengespeichert) ---------- */
    const cache: Record<Slot, Cached | null> = { f: null, g: null, h: null };
    const famCache: Record<Slot, { key: string; px: Float64Array[] }[] | null> = { f: null, g: null, h: null };
    let famKey: Record<Slot, string> = { f: '', g: '', h: '' };

    const boundsKey = () => {
      const b = plot.bounds;
      const r = plot.rect;
      return `${b.xMin.toFixed(6)},${b.xMax.toFixed(6)},${b.yMin.toFixed(6)},${b.yMax.toFixed(6)},${r.x},${r.y},${r.w},${r.h}`;
    };

    function toPx(segs: number[][]): Float64Array[] {
      return segs.map((sg) => {
        const out = new Float64Array(sg.length);
        for (let i = 0; i < sg.length; i += 2) {
          out[i] = plot.px(sg[i]!);
          out[i + 1] = plot.py(sg[i + 1]!);
        }
        return out;
      });
    }

    function samples(): number {
      return Math.round(clamp(plot.rect.w, 200, 900));
    }

    function traced(s: Slot): Cached | null {
      const st = state[s];
      const fn = shown(s) ?? st.stale;
      if (!fn) return null;
      const m = st.morph;
      const k = m ? Math.min(1, (performance.now() - m.start) / MORPH_MS) : 1;
      const key = `${boundsKey()}|${st.version}|${p.a}|${p.b}|${k.toFixed(3)}|${st.fn ? 1 : 0}`;
      const c = cache[s];
      if (c && c.key === key) return c;
      const b = plot.bounds;
      const t = traceFunction(fn, b.xMin, b.xMax, b.yMin, b.yMax, samples());
      const out: Cached = { key, segs: t.segments, px: toPx(t.segments), breaks: t.breaks };
      cache[s] = out;
      return out;
    }

    function family(s: Slot): { key: string; px: Float64Array[] }[] | null {
      const st = state[s];
      if (!p.sch || !st.raw || st.res.ok !== true || !st.res.term.params.includes('a')) return null;
      const key = `${boundsKey()}|${st.version}|${p.b}|${p.a}`;
      if (famKey[s] === key && famCache[s]) return famCache[s];
      const raw = st.raw;
      const b = plot.bounds;
      const list = FAMILY.filter((a) => Math.abs(a - p.a) > 1e-9).map((a) => {
        const e = { a, b: p.b };
        const t = traceFunction((x) => raw(x, e), b.xMin, b.xMax, b.yMin, b.yMax, Math.round(samples() / 2));
        return { key: String(a), px: toPx(t.segments) };
      });
      famCache[s] = list;
      famKey = { ...famKey, [s]: key };
      return list;
    }

    /* ---------- Besondere Punkte ---------- */
    let analysis: Analysis | null = null;

    function analyze(): Analysis {
      const b = plot.bounds;
      const key = `${boundsKey()}|${SLOTS.map((s) => state[s].version).join(',')}|${p.a}|${p.b}`;
      if (analysis && analysis.key === key) return analysis;
      const H = b.yMax - b.yMin;
      const n = Math.round(clamp(plot.rect.w * 1.4, 400, 1100));
      const zeros: Analysis['zeros'] = { f: null, g: null, h: null };
      const extrema: Analysis['extrema'] = { f: null, g: null, h: null };
      const holes: Analysis['holes'] = { f: [], g: [], h: [] };
      const markers: Marker[] = [];
      for (const s of SLOTS) {
        const fn = state[s].fn;
        if (!fn) continue;
        const z = findZeros(fn, b.xMin, b.xMax, n, H);
        zeros[s] = z.everywhere ? 'all' : z.roots;
        if (!z.everywhere) for (const r of z.roots) markers.push({ kind: 'zero', slot: s, x: r.x, y: 0, touch: r.touch });
        const e = findExtrema(fn, b.xMin, b.xMax, n, H);
        extrema[s] = e;
        for (const q of e) markers.push({ kind: q.kind, slot: s, x: q.x, y: q.y });
        holes[s] = findHoles(fn, b.xMin, b.xMax, (b.xMax - b.xMin) > 80 ? 1 : 0.25);
        for (const q of holes[s]) markers.push({ kind: 'hole', slot: s, x: q.x, y: q.y });
      }
      const crosses: Analysis['crosses'] = [];
      const vs = valid();
      for (let i = 0; i < vs.length; i++)
        for (let j = i + 1; j < vs.length; j++) {
          const A = vs[i]!;
          const B = vs[j]!;
          const r = findIntersections(state[A].fn!, state[B].fn!, b.xMin, b.xMax, n, H);
          crosses.push({ a: A, b: B, pts: r.points, same: r.same });
          for (const q of r.points) markers.push({ kind: 'cross', slot: A, other: B, x: q.x, y: q.y, touch: q.touch });
        }
      analysis = { key, zeros, extrema, crosses, holes, markers };
      return analysis;
    }

    const markerOn = (m: Marker) => (m.kind === 'zero' ? p.nst : m.kind === 'cross' ? p.sct : m.kind === 'hole' ? p.asy : p.ext);

    /* ---------- Formelsatz ---------- */
    const upFont = (s: number, w = 600) => `${w} ${s}px ${ctx.theme.font}`;
    const itFont = (s: number) => `italic ${s * 1.12}px ${ctx.theme.mathFont}`;

    function tbox(str: string, font: string, s: number, extra = 0): Box {
      const g = surface.g;
      g.font = font;
      const w = g.measureText(str).width + extra;
      return { w, asc: s * 0.74, desc: s * 0.24, paint: (x, b, c) => text(g, str, x, b, { font, color: c, align: 'left', baseline: 'alphabetic' }) };
    }

    function row(items: Box[]): Box {
      return {
        w: items.reduce((a, i) => a + i.w, 0),
        asc: Math.max(0, ...items.map((i) => i.asc)),
        desc: Math.max(0, ...items.map((i) => i.desc)),
        paint: (x, b, c) => {
          let cx = x;
          for (const i of items) {
            i.paint(cx, b, c);
            cx += i.w;
          }
        },
      };
    }

    const gap = (w: number): Box => ({ w, asc: 0, desc: 0, paint: () => {} });

    function parens(inner: Box, s: number, open = '(', close = ')'): Box {
      const g = surface.g;
      const hgt = inner.asc + inner.desc;
      if (hgt <= s * 1.2) {
        const o = tbox(open, upFont(s, 500), s);
        const c = tbox(close, upFont(s, 500), s);
        return row([o, gap(s * 0.04), inner, gap(s * 0.04), c]);
      }
      // Große Klammern um Brüche: als Bögen gezeichnet
      const pw = s * 0.42;
      const top = inner.asc + s * 0.06;
      const bot = inner.desc + s * 0.06;
      const stroke = (x: number, b: number, c: string, dir: 1 | -1) => {
        g.save();
        g.strokeStyle = c;
        g.lineWidth = Math.max(1.3, s * 0.075);
        g.lineCap = 'round';
        g.beginPath();
        if (open === '[') {
          const x0 = dir === 1 ? x + pw * 0.75 : x + pw * 0.25;
          const x1 = dir === 1 ? x + pw * 0.3 : x + pw * 0.7;
          g.moveTo(x0, b - top);
          g.lineTo(x1, b - top);
          g.lineTo(x1, b + bot);
          g.lineTo(x0, b + bot);
        } else {
          const xo = dir === 1 ? x + pw * 0.78 : x + pw * 0.22;
          const xi = dir === 1 ? x + pw * 0.12 : x + pw * 0.88;
          g.moveTo(xo, b - top);
          g.quadraticCurveTo(xi, b - (top - bot) / 2, xo, b + bot);
        }
        g.stroke();
        g.restore();
      };
      return {
        w: inner.w + 2 * pw,
        asc: top + 1,
        desc: bot + 1,
        paint: (x, b, c) => {
          stroke(x, b, c, 1);
          inner.paint(x + pw, b, c);
          stroke(x + pw + inner.w, b, c, -1);
        },
      };
    }

    function frac(num: Box, den: Box, s: number): Box {
      const g = surface.g;
      const pad = s * 0.14;
      const w = Math.max(num.w, den.w) + pad * 2;
      const axis = s * 0.3;
      const gp = s * 0.13;
      return {
        w: w + s * 0.1,
        asc: axis + gp + num.desc + num.asc,
        desc: -axis + gp + den.asc + den.desc,
        paint: (x, b, c) => {
          const yb = b - axis;
          num.paint(x + s * 0.05 + (w - num.w) / 2, yb - gp - num.desc, c);
          den.paint(x + s * 0.05 + (w - den.w) / 2, yb + gp + den.asc, c);
          g.strokeStyle = c;
          g.lineWidth = Math.max(1.1, s * 0.07);
          g.beginPath();
          g.moveTo(x + s * 0.05 + 1, yb);
          g.lineTo(x + s * 0.05 + w - 1, yb);
          g.stroke();
        },
      };
    }

    function supBox(base: Box, exp: Box, s: number): Box {
      const rise = s * 0.42 + Math.max(0, base.asc - s * 0.8) * 0.85;
      return {
        w: base.w + exp.w + s * 0.05,
        asc: Math.max(base.asc, rise + exp.asc),
        desc: Math.max(base.desc, exp.desc - rise),
        paint: (x, b, c) => {
          base.paint(x, b, c);
          exp.paint(x + base.w + s * 0.04, b - rise, c);
        },
      };
    }

    function subBox(base: Box, sub: Box, s: number): Box {
      const drop = s * 0.24;
      return {
        w: base.w + sub.w + s * 0.03,
        asc: base.asc,
        desc: Math.max(base.desc, sub.desc + drop),
        paint: (x, b, c) => {
          base.paint(x, b, c);
          sub.paint(x + base.w + s * 0.02, b + drop, c);
        },
      };
    }

    function radical(inner: Box, s: number): Box {
      const g = surface.g;
      const lead = s * 0.62;
      const over = s * 0.16;
      return {
        w: lead + inner.w + s * 0.12,
        asc: inner.asc + over + 2,
        desc: inner.desc + 1,
        paint: (x, b, c) => {
          const top = b - inner.asc - over;
          g.save();
          g.strokeStyle = c;
          g.lineWidth = Math.max(1.2, s * 0.07);
          g.lineJoin = 'round';
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(x + s * 0.04, b - s * 0.26);
          g.lineTo(x + s * 0.17, b - s * 0.33);
          g.lineTo(x + s * 0.34, b + inner.desc);
          g.lineTo(x + lead - s * 0.04, top);
          g.lineTo(x + lead + inner.w + s * 0.08, top);
          g.stroke();
          g.restore();
          inner.paint(x + lead, b, c);
        },
      };
    }

    function bars(inner: Box, s: number): Box {
      const g = surface.g;
      const pad = s * 0.2;
      return {
        w: inner.w + pad * 2,
        asc: inner.asc + 2,
        desc: inner.desc + 2,
        paint: (x, b, c) => {
          g.save();
          g.strokeStyle = c;
          g.lineWidth = Math.max(1.2, s * 0.075);
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(x + pad * 0.4, b - inner.asc - 1);
          g.lineTo(x + pad * 0.4, b + inner.desc + 1);
          g.moveTo(x + inner.w + pad * 1.6, b - inner.asc - 1);
          g.lineTo(x + inner.w + pad * 1.6, b + inner.desc + 1);
          g.stroke();
          g.restore();
          inner.paint(x + pad, b, c);
        },
      };
    }

    /** Ein Knoten als gesetzte Formel. `strip`: eigene Klammern weglassen (Bruch, Hochzahl, Wurzel). */
    function lay(n: Node, s: number, inSup: boolean, strip = false): Box {
      const core = layCore(n, s, inSup);
      if (!n.br || strip) return core;
      return n.br === '(' ? parens(core, s) : parens(core, s, '[', ']');
    }

    /** Negatives ohne eigene Klammer in Klammern setzen (x − (−2), 2 · (−3)). */
    function layWrapNeg(n: Node, s: number, inSup: boolean): Box {
      return n.k === 'neg' && !n.br ? parens(layCore(n, s, inSup), s) : lay(n, s, inSup);
    }

    function layCore(n: Node, s: number, inSup: boolean): Box {
      const op = (str: string) => tbox(str, upFont(s, 500), s);
      switch (n.k) {
        case 'num':
          return tbox(numberText(n.s, lang), upFont(s), s);
        case 'x':
          return tbox('x', itFont(s), s, s * 0.06);
        case 'par':
          return tbox(n.name, itFont(s), s, s * 0.06);
        case 'const':
          return n.name === 'pi' ? tbox('π', `${s * 1.08}px ${ctx.theme.mathFont}`, s, s * 0.04) : tbox('e', itFont(s), s, s * 0.04);
        case 'neg':
          return row([op('−'), gap(s * 0.04), layWrapNeg(n.arg, s, inSup)]);
        case 'add':
          return row([lay(n.l, s, inSup), op(n.op === '+' ? ' + ' : ' − '), layWrapNeg(n.r, s, inSup)]);
        case 'mul': {
          if (n.op === '/' && !inSup) return frac(lay(n.l, s * 0.86, false, true), lay(n.r, s * 0.86, false, true), s);
          if (n.op === '/') return row([lay(n.l, s, true), op('/'), lay(n.r, s, true)]);
          if (n.op === ':') return row([lay(n.l, s, inSup), op(' : '), layWrapNeg(n.r, s, inSup)]);
          if (!n.implicit) return row([lay(n.l, s, inSup), op(' · '), layWrapNeg(n.r, s, inSup)]);
          const spaced = (n.r.k === 'call' && !n.r.sym) || (n.l.k === 'call' && !n.l.sym && !n.l.br);
          return row([lay(n.l, s, inSup), gap(spaced ? s * 0.2 : s * 0.02), lay(n.r, s, inSup)]);
        }
        case 'pow': {
          const base = lay(n.base, s, inSup);
          const e = lay(n.exp, s * 0.7, true, true);
          return supBox(base, e, s);
        }
        case 'abs':
          return bars(lay(n.arg, s, inSup, true), s);
        case 'call': {
          if (n.fn === 'sqrt') return radical(lay(n.arg, s, inSup, true), s);
          let name: Box = tbox(n.fn === 'log' && n.logBase !== undefined ? 'log' : fnLabel(n), upFont(s, 500), s);
          if (n.fn === 'log' && n.logBase !== undefined) name = subBox(name, tbox(numberText(String(n.logBase), lang), upFont(s * 0.68), s * 0.68), s);
          if (n.power) {
            const pw = intExponent(n.power);
            name = supBox(name, pw !== null ? tbox((pw < 0 ? '−' : '') + String(Math.abs(pw)), upFont(s * 0.7), s * 0.7) : lay(n.power, s * 0.7, true, true), s);
          }
          return row([name, gap(s * 0.04), parens(lay(n.arg, s, inSup, true), s)]);
        }
      }
    }

    /** Formel auf eine Breite einpassen (Schrift höchstens bis minSize verkleinern). */
    function layFit(n: Node, size: number, maxW: number, minSize = 11): Box | null {
      let b = lay(n, size, false);
      if (b.w > maxW) {
        const s2 = (size * maxW) / b.w;
        if (s2 < minSize) return null;
        b = lay(n, s2, false);
      }
      return b;
    }

    /* ---------- Bausteine: Karten, Schildchen ---------- */
    function card(r: Rect, accent?: string, tint = 0): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.fill();
      g.restore();
      if (accent && tint > 0) {
        g.fillStyle = withAlpha(accent, theme.dark ? tint * 1.6 : tint);
        roundRect(g, r.x, r.y, r.w, r.h, 12);
        g.fill();
      }
      g.strokeStyle = accent ? withAlpha(accent, 0.45) : theme.dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
    }

    function tag(x: number, y: number, label: string, color: string, align: 'center' | 'left' | 'right' = 'center', size = 12, filled = false, draw = true): Rect {
      const g = surface.g;
      const theme = ctx.theme;
      const font = `700 ${size}px ${theme.font}`;
      g.font = font;
      const w = g.measureText(label).width + size;
      const h = size + 9;
      const left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
      const rect = { x: left, y: y - h / 2, w, h };
      if (!draw) return rect;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.4)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 5;
      g.shadowOffsetY = 1;
      g.fillStyle = filled ? color : theme.dark ? '#141b26' : '#ffffff';
      roundRect(g, left, y - h / 2, w, h, h / 2);
      g.fill();
      g.restore();
      if (!filled) {
        g.strokeStyle = withAlpha(color, 0.75);
        g.lineWidth = 1.3;
        roundRect(g, left + 0.5, y - h / 2 + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      text(g, label, left + w / 2, y + 0.5, { font, color: filled ? '#ffffff' : color });
      return rect;
    }

    function wrap(str: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const rows: string[] = [];
      let line = '';
      for (const w of str.split(' ')) {
        const next = line ? `${line} ${w}` : w;
        if (g.measureText(next).width > maxW && line) {
          rows.push(line);
          line = w;
        } else line = next;
      }
      if (line) rows.push(line);
      return rows;
    }

    /** Runde Plakette mit dem Funktionsnamen. */
    function nameBadge(px: number, py: number, name: string, color: string, r = 12, alpha = 1): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha = alpha;
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.15)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1;
      g.beginPath();
      g.arc(px, py, r, 0, Math.PI * 2);
      g.fillStyle = theme.dark ? '#141b26' : '#ffffff';
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = color;
      g.lineWidth = 2.2;
      g.stroke();
      text(g, name, px - 0.5, py + 1, { font: `italic 700 ${Math.round(r * 1.3)}px ${theme.mathFont}`, color });
      g.restore();
    }

    /* ---------- Zeichnen: Graphen ---------- */
    function strokePaths(paths: Float64Array[], color: string, width: number, alpha = 1, dash?: number[], glow = false): void {
      const g = surface.g;
      g.save();
      g.globalAlpha = alpha;
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineJoin = 'round';
      g.lineCap = 'round';
      if (dash) g.setLineDash(dash);
      if (glow) {
        g.shadowColor = withAlpha(color, ctx.theme.dark ? 0.55 : 0.35);
        g.shadowBlur = 6;
      }
      g.beginPath();
      for (const a of paths) {
        if (a.length === 2) {
          g.moveTo(a[0]! - 0.01, a[1]!);
          g.lineTo(a[0]! + 0.01, a[1]!);
          continue;
        }
        g.moveTo(a[0]!, a[1]!);
        for (let i = 2; i < a.length; i += 2) g.lineTo(a[i]!, a[i + 1]!);
      }
      g.stroke();
      g.restore();
    }

    function drawGraphs(): void {
      const r = plot.rect;
      // Scharen zuerst (blass)
      for (const s of SLOTS) {
        const fam = family(s);
        if (!fam) continue;
        for (const m of fam) strokePaths(m.px, colOf(s), 1.5, Number(m.key) === 0 ? 0.18 : 0.26);
      }
      // Senkrechte Asymptoten an Polstellen
      if (p.asy && !morphing()) {
        for (const s of SLOTS) {
          const c = state[s].fn ? traced(s) : null;
          if (!c) continue;
          for (const b of c.breaks) {
            if (b.kind !== 'pole') continue;
            const x = plot.px(b.x);
            if (x < r.x || x > r.x + r.w) continue;
            const g = surface.g;
            g.save();
            g.strokeStyle = withAlpha(colOf(s), 0.6);
            g.lineWidth = 1.4;
            g.setLineDash([6, 5]);
            g.beginPath();
            g.moveTo(Math.round(x) + 0.5, r.y);
            g.lineTo(Math.round(x) + 0.5, r.y + r.h);
            g.stroke();
            g.restore();
          }
        }
      }
      for (const s of SLOTS) {
        const st = state[s];
        const c = traced(s);
        if (!c) continue;
        if (!st.fn) {
          // Tippfehler: alter Graph blass und gestrichelt
          strokePaths(c.px, colOf(s), 2, 0.35, [7, 6]);
          continue;
        }
        const hi = hoverSlot === s || dragSlot === s;
        strokePaths(c.px, colOf(s), hi ? 4 : 3.1, 1, undefined, true);
      }
    }

    /**
     * Platz für die Namensplakette: möglichst weit rechts, knapp über dem
     * Graphen, frei von anderen Graphen, Marken, Achsenbeschriftungen und den
     * Zoom-Knöpfen.
     */
    function labelSpot(paths: Float64Array[], avoid: [number, number][], others: Float64Array[][], rects: Rect[]): [number, number] | null {
      const r = plot.rect;
      const axisY = plot.py(0);
      const axisX = plot.px(0);
      const cands: [number, number][] = [];
      for (const a of paths) for (let i = 0; i < a.length; i += 2) cands.push([a[i]!, a[i + 1]!]);
      cands.sort((u, v) => v[0] - u[0]);
      let lastX = Infinity;
      for (const [px, py] of cands) {
        if (lastX - px < 4) continue;
        lastX = px;
        for (const [dx, dy] of OFFSETS) {
          const bx = px + dx;
          const by = py + dy;
          if (bx > r.x + r.w - 18 || bx < r.x + 28) continue;
          if (by < r.y + 16 || by > r.y + r.h - 16) continue;
          if (bx > r.x + r.w - 58 && by < r.y + 124) continue; // Zoom-Knöpfe
          if (Math.abs(by - axisY) < 26) continue; // Zahlen an der x-Achse
          if (Math.abs(bx - axisX) < 30 && by < r.y + 40) continue; // Beschriftung y
          if (avoid.some(([ax, ay]) => Math.hypot(ax - bx, ay - by) < 28)) continue;
          if (rects.some((q) => pointIn([bx, by], q, 14))) continue;
          if (distToPaths(paths, bx, by) < 11) continue;
          if (others.some((o) => distToPaths(o, bx, by) < 16 || distToPaths(o, px, py) < 14)) continue;
          return [bx, by];
        }
      }
      return null;
    }

    /** Versatz der Plakette gegenüber dem Graphen (bei steilen Graphen seitlich). */
    const OFFSETS: [number, number][] = [
      [0, -19],
      [0, 19],
      [19, 0],
      [-19, 0],
      [14, -14],
      [-14, -14],
      [14, 14],
      [-14, 14],
    ];

    function drawNames(avoid: [number, number][], rects: Rect[]): void {
      const paths = SLOTS.map((s) => (state[s].fn ? (traced(s)?.px ?? null) : null));
      SLOTS.forEach((s, i) => {
        const own = paths[i];
        if (!own) return;
        const others = paths.filter((q, j): q is Float64Array[] => j !== i && !!q);
        const spot = labelSpot(own, avoid, others, rects) ?? labelSpot(own, avoid, [], rects);
        if (!spot) return;
        avoid.push(spot);
        nameBadge(spot[0], spot[1], s, colOf(s));
      });
    }

    /* ---------- Zeichnen: besondere Punkte ---------- */
    function markerText(m: Marker): string {
      const trig = state[m.slot].trig || (m.kind === 'cross' && state[m.other].trig);
      const xs = p.pi ? xNice(m.x, trig) : nf(m.x);
      const xr = p.pi && xs.includes('π') ? false : isRounded(m.x);
      switch (m.kind) {
        case 'zero':
          return tr('zero', { rel: xr ? '≈' : '=', x: xs });
        case 'max':
        case 'min':
        case 'cross': {
          const approx = xr || isRounded(m.y);
          // Englisch: Schnittpunkte ohne Buchstaben (P ist der Spurpunkt)
          const relStr = lang === 'en' && m.kind === 'cross' ? (approx ? '≈ ' : '') : approx ? ' ≈ ' : lang === 'de' ? '' : ' ';
          return tr(m.kind, { rel: relStr, x: xs, y: nf(m.y) });
        }
        case 'hole':
          return tr('hole', { x: xs, y: nf(m.y) });
      }
    }

    function drawMarker(m: Marker, k: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const [px, py] = plot.toPx(m.x, m.y);
      const c = m.kind === 'cross' ? orange() : colOf(m.slot);
      const sel = selected && selected.kind === m.kind && Math.abs(selected.x - m.x) < 1e-9 && selected.slot === m.slot;
      g.save();
      g.translate(px, py);
      g.scale(k, k);
      g.beginPath();
      g.arc(0, 0, sel ? 15 : 11, 0, Math.PI * 2);
      g.fillStyle = withAlpha(c, sel ? 0.24 : 0.14);
      g.fill();
      if (m.kind === 'max' || m.kind === 'min') {
        g.beginPath();
        g.moveTo(0, -7.5);
        g.lineTo(7.5, 0);
        g.lineTo(0, 7.5);
        g.lineTo(-7.5, 0);
        g.closePath();
        g.fillStyle = c;
        g.fill();
        g.lineWidth = 2;
        g.strokeStyle = theme.bg;
        g.stroke();
      } else if (m.kind === 'hole' || ((m.kind === 'zero' || m.kind === 'cross') && m.touch)) {
        g.beginPath();
        g.arc(0, 0, 5.5, 0, Math.PI * 2);
        g.fillStyle = theme.bg;
        g.fill();
        g.lineWidth = 2.6;
        g.strokeStyle = c;
        g.stroke();
        if (m.kind !== 'hole') {
          g.beginPath();
          g.arc(0, 0, 2.2, 0, Math.PI * 2);
          g.fillStyle = c;
          g.fill();
        }
      } else {
        g.beginPath();
        g.arc(0, 0, 6, 0, Math.PI * 2);
        g.fillStyle = c;
        g.fill();
        g.lineWidth = 2;
        g.strokeStyle = theme.bg;
        g.stroke();
      }
      g.restore();
    }

    /** Sichtbare Marken mit Beschriftung (ohne Überlappungen). */
    function drawMarkers(avoid: [number, number][]): Rect[] {
      if (morphing()) return [];
      const an = analyze();
      const r = plot.rect;
      const k = markPop.running ? clamp(markPop.value, 0, 1.25) : 1;
      const list = an.markers.filter(markerOn).filter((m) => {
        const [px, py] = plot.toPx(m.x, m.y);
        return px >= r.x - 4 && px <= r.x + r.w + 4 && py >= r.y - 4 && py <= r.y + r.h + 4;
      });
      for (const m of list) {
        drawMarker(m, k);
        avoid.push(plot.toPx(m.x, m.y));
      }
      const used: Rect[] = [];
      if (markPop.running) return used;
      const ctrl = controlsRect();
      // Beschriftungen: ausgewählte Marke zuerst, dann Schnitt-, Extrem-, Lücken- und Nullstellen
      const rank = (m: Marker) => (isSel(m) ? 0 : m.kind === 'cross' ? 1 : m.kind === 'max' || m.kind === 'min' ? 2 : m.kind === 'hole' ? 3 : 4);
      const order = [...list].sort((u, v) => rank(u) - rank(v) || u.x - v.x);
      const crowded = list.length > 9;
      const labeled: [number, number][] = [];
      for (const m of order) {
        if (crowded && !isSel(m)) continue;
        if (traceMarker && sameMarker(traceMarker, m)) continue;
        const [px, py] = plot.toPx(m.x, m.y);
        // Mehrere Marken an derselben Stelle (z. B. Nullstelle von f und g im Ursprung): nur einmal beschriften
        if (labeled.some(([lx, ly]) => Math.hypot(lx - px, ly - py) < 4)) continue;
        if (traceMarker && Math.hypot(plot.px(traceMarker.x) - px, plot.py(traceMarker.y) - py) < 4) continue;
        const label = markerText(m);
        const c = m.kind === 'cross' ? orange() : colOf(m.slot);
        const above = m.kind !== 'min';
        const tries: [number, number, 'left' | 'right' | 'center'][] = [
          [px, above ? py - 20 : py + 20, 'center'],
          [px + 10, above ? py - 18 : py + 18, 'left'],
          [px - 10, above ? py - 18 : py + 18, 'right'],
          [px, above ? py + 20 : py - 20, 'center'],
          [px + 12, py, 'left'],
          [px - 12, py, 'right'],
        ];
        for (const [tx, ty, al] of tries) {
          const rect = tag(tx, ty, label, c, al, 11, false, false);
          if (rect.x < r.x + 2 || rect.x + rect.w > r.x + r.w - 2 || rect.y < r.y + 2 || rect.y + rect.h > r.y + r.h - 2) continue;
          if (used.some((u) => overlap(u, rect, 3)) || overlap(ctrl, rect, 2)) continue;
          if (list.some((o) => o !== m && pointIn(plot.toPx(o.x, o.y), rect, 6))) continue;
          if (tracePxRect && overlap(tracePxRect, rect, 3)) continue;
          tag(tx, ty, label, c, al, 11, isSel(m));
          used.push(rect);
          labeled.push([px, py]);
          break;
        }
      }
      return used;
    }

    /** Bereich der Zoom-Knöpfe oben rechts (dort keine Beschriftungen). */
    const controlsRect = (): Rect => {
      const r = plot.rect;
      return { x: r.x + r.w - 50, y: r.y, w: 50, h: 124 };
    };
    const sameMarker = (u: Marker, v: Marker) => u.kind === v.kind && u.slot === v.slot && Math.abs(u.x - v.x) < 1e-9;
    const isSel = (m: Marker) => !!selected && sameMarker(selected, m);
    const overlap = (a: Rect, b: Rect, pad = 0) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;
    const pointIn = ([x, y]: [number, number], rr: Rect, pad = 0) => x > rr.x - pad && x < rr.x + rr.w + pad && y > rr.y - pad && y < rr.y + rr.h + pad;

    /* ---------- Zeichnen: Spur ---------- */
    let tracePxRect: Rect | null = null;
    /** Marke, auf der die Spur gerade liegt (dann trägt das Spur-Schild ihren Namen). */
    let traceMarker: Marker | null = null;

    function markerAtTrace(s: Slot, x: number): Marker | null {
      if (!analysis) return null;
      const hits = analysis.markers.filter((m) => markerOn(m) && (m.slot === s || (m.kind === 'cross' && m.other === s)) && Math.abs(m.x - x) <= 1e-7 * Math.max(1, Math.abs(x)));
      const rank = (m: Marker) => (m.kind === 'cross' ? 0 : m.kind === 'max' || m.kind === 'min' ? 1 : 2);
      return hits.sort((u, v) => rank(u) - rank(v))[0] ?? null;
    }

    function traceInfo(): { slot: Slot; fn: Fn1; x: number; y: number } | null {
      const s = traceSlot();
      if (!s) return null;
      const fn = state[s].fn;
      if (!fn) return null;
      return { slot: s, fn, x: traceX, y: fn(traceX) };
    }

    /** Spurpunkt-Beschriftung vorab bestimmen (die Marken weichen ihr aus). */
    function planTraceLabel(): { label: string; x: number; y: number; align: 'left' | 'right' } | null {
      const t = traceInfo();
      if (!t || !Number.isFinite(t.y) || morphing()) return null;
      const r = plot.rect;
      const [px, py] = plot.toPx(t.x, t.y);
      if (px < r.x || px > r.x + r.w || py < r.y || py > r.y + r.h) return null;
      const sep = lang === 'de' ? ' | ' : ', ';
      analyze();
      traceMarker = markerAtTrace(t.slot, t.x);
      const named = traceMarker && traceMarker.kind !== 'hole' && traceMarker.kind !== 'zero';
      const label = named ? markerText(traceMarker!) : `P${rel(t.x, t.y) === '≈' ? ' ≈ ' : ''}(${nf(t.x)}${sep}${nf(t.y)})`;
      const ctrl = controlsRect();
      let best: { x: number; y: number; align: 'left' | 'right'; rect: Rect } | null = null;
      const prefRight = px < r.x + r.w - 150;
      for (const right of [prefRight, !prefRight]) {
        for (const up of [py > r.y + 60, py <= r.y + 60]) {
          const x = right ? px + 14 : px - 14;
          const y = up ? py - 22 : py + 24;
          const rect = tag(x, y, label, colOf(t.slot), right ? 'left' : 'right', 12, false, false);
          const inside = rect.x >= r.x + 2 && rect.x + rect.w <= r.x + r.w - 2 && rect.y >= r.y + 2 && rect.y + rect.h <= r.y + r.h - 2;
          if (!best) best = { x, y, align: right ? 'left' : 'right', rect };
          if (inside && !overlap(ctrl, rect, 2)) {
            best = { x, y, align: right ? 'left' : 'right', rect };
            tracePxRect = rect;
            return { label, x, y, align: best.align };
          }
        }
      }
      tracePxRect = best!.rect;
      return { label, x: best!.x, y: best!.y, align: best!.align };
    }

    function drawTrace(plan: ReturnType<typeof planTraceLabel>): void {
      const s = traceSlot();
      if (!s || !state[s].fn || morphing()) return;
      const g = surface.g;
      const theme = ctx.theme;
      const r = plot.rect;
      const fn = state[s].fn!;
      const c = colOf(s);
      const x = traceX;
      const y = fn(x);
      const px = plot.px(x);
      if (px < r.x - 2 || px > r.x + r.w + 2) return;
      const ax = clamp(plot.py(0), r.y, r.y + r.h);
      const ay = clamp(plot.px(0), r.x, r.x + r.w);
      if (!Number.isFinite(y)) {
        // Nicht definiert: gestrichelte Senkrechte und hohler Punkt auf der x-Achse
        g.save();
        g.strokeStyle = withAlpha(theme.muted, 0.7);
        g.lineWidth = 1.5;
        g.setLineDash([4, 5]);
        g.beginPath();
        g.moveTo(px, r.y);
        g.lineTo(px, r.y + r.h);
        g.stroke();
        g.restore();
        g.beginPath();
        g.arc(px, ax, 6, 0, Math.PI * 2);
        g.fillStyle = theme.bg;
        g.fill();
        g.lineWidth = 2.4;
        g.strokeStyle = c;
        g.stroke();
        tag(clamp(px, r.x + 70, r.x + r.w - 70), clamp(ax - 22, r.y + 14, r.y + r.h - 14), tr('undefinedAt', { f: s, x: nf(x) }), c, 'center', 11);
        return;
      }
      const py = plot.py(y);
      // Tangente
      if (p.tg) {
        const m = derivative(fn, x);
        if (m !== null) {
          const b = plot.bounds;
          const span = (b.xMax - b.xMin) * 2;
          g.save();
          g.strokeStyle = withAlpha(c, 0.85);
          g.lineWidth = 2;
          g.setLineDash([10, 6]);
          g.beginPath();
          g.moveTo(plot.px(x - span), plot.py(y - m * span));
          g.lineTo(plot.px(x + span), plot.py(y + m * span));
          g.stroke();
          g.restore();
        }
      }
      // Hilfslinien zu den Achsen
      g.save();
      g.strokeStyle = withAlpha(c, 0.75);
      g.lineWidth = 1.5;
      g.setLineDash([5, 4]);
      g.beginPath();
      g.moveTo(px, clamp(py, r.y, r.y + r.h));
      g.lineTo(px, ax);
      g.moveTo(clamp(px, r.x, r.x + r.w), py);
      g.lineTo(ay, py);
      g.stroke();
      g.restore();
      if (py < r.y - 2 || py > r.y + r.h + 2) {
        // Punkt oberhalb/unterhalb: Pfeil am Rand
        const ey = py < r.y ? r.y + 12 : r.y + r.h - 12;
        g.save();
        g.translate(px, ey);
        g.rotate(py < r.y ? -Math.PI / 2 : Math.PI / 2);
        g.fillStyle = c;
        g.beginPath();
        g.moveTo(9, 0);
        g.lineTo(-5, -7);
        g.lineTo(-5, 7);
        g.closePath();
        g.fill();
        g.restore();
        return;
      }
      const k = tracePop.running ? clamp(tracePop.value, 0.4, 1.3) : 1;
      const active = dragSlot !== null;
      g.save();
      g.translate(px, py);
      g.scale(k, k);
      g.beginPath();
      g.arc(0, 0, active ? 17 : 14, 0, Math.PI * 2);
      g.fillStyle = withAlpha(c, active ? 0.28 : 0.18);
      g.fill();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.25)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1;
      g.beginPath();
      g.arc(0, 0, 7.5, 0, Math.PI * 2);
      g.fillStyle = c;
      g.fill();
      g.shadowColor = 'transparent';
      g.lineWidth = 2.4;
      g.strokeStyle = theme.dark ? '#141b26' : '#ffffff';
      g.stroke();
      g.restore();
      if (plan) tag(plan.x, plan.y, plan.label, c, plan.align, 12, true);
    }

    /* ---------- Treffer: Graph, Spurpunkt, Marken ---------- */
    function distToPaths(paths: Float64Array[], px: number, py: number): number {
      let best = Infinity;
      for (const a of paths) {
        for (let i = 0; i + 3 < a.length; i += 2) {
          const x0 = a[i]!;
          const y0 = a[i + 1]!;
          const x1 = a[i + 2]!;
          const y1 = a[i + 3]!;
          if (Math.max(x0, x1) < px - 30 || Math.min(x0, x1) > px + 30) continue;
          const dx = x1 - x0;
          const dy = y1 - y0;
          const len = dx * dx + dy * dy;
          const t = len > 0 ? clamp(((px - x0) * dx + (py - y0) * dy) / len, 0, 1) : 0;
          best = Math.min(best, Math.hypot(px - (x0 + t * dx), py - (y0 + t * dy)));
        }
      }
      return best;
    }

    type Hit = { k: 'trace' } | { k: 'curve'; slot: Slot } | { k: 'marker'; m: Marker };

    function hitAt(px: number, py: number, touch: boolean): Hit | null {
      const r = plot.rect;
      if (px < r.x || px > r.x + r.w || py < r.y || py > r.y + r.h) return null;
      const rad = touch ? 22 : 12;
      const t = traceInfo();
      if (t && Number.isFinite(t.y)) {
        const [tx, ty] = plot.toPx(t.x, t.y);
        if (Math.hypot(tx - px, ty - py) <= rad + 2) return { k: 'trace' };
      }
      if (analysis && !morphing()) {
        let best: Marker | null = null;
        let bd = touch ? 18 : 10;
        for (const m of analysis.markers) {
          if (!markerOn(m)) continue;
          const [mx, my] = plot.toPx(m.x, m.y);
          const d = Math.hypot(mx - px, my - py);
          if (d < bd) {
            bd = d;
            best = m;
          }
        }
        if (best) return { k: 'marker', m: best };
      }
      let bestSlot: Slot | null = null;
      let bd = touch ? 18 : 9;
      for (const s of SLOTS) {
        if (!state[s].fn) continue;
        const c = cache[s];
        if (!c) continue;
        const d = distToPaths(c.px, px, py);
        if (d < bd) {
          bd = d;
          bestSlot = s;
        }
      }
      return bestSlot ? { k: 'curve', slot: bestSlot } : null;
    }

    /** Beim Ziehen an besonderen Punkten desselben Graphen einrasten. */
    function snapX(s: Slot, x: number): number {
      if (!analysis) return x;
      const px = plot.px(x);
      let best = x;
      let bd = 8;
      for (const m of analysis.markers) {
        if (!markerOn(m)) continue;
        if (m.slot !== s && !(m.kind === 'cross' && m.other === s)) continue;
        const d = Math.abs(plot.px(m.x) - px);
        if (d < bd) {
          bd = d;
          best = m.x;
        }
      }
      return best;
    }

    function moveTrace(s: Slot, x: number, pop = false): void {
      traceX = x;
      selected = null;
      if (pop) tracePop.play();
      ctx.set({ sp: s, tx: clamp(Math.round(x * 100) / 100, -50, 50) });
      ctx.requestRender();
    }

    surface.addTarget({
      contains: (px: number, py: number) => !ctx.locked && hitAt(px, py, false) !== null,
      pointerDown: (q: { px: number; py: number; type?: string }) => {
        if (ctx.locked) return false;
        const hit = hitAt(q.px, q.py, q.type === 'touch');
        if (!hit) return false;
        if (hit.k === 'marker') {
          const m = hit.m;
          traceX = m.x;
          tracePop.play();
          ctx.set({ sp: m.slot, tx: clamp(Math.round(m.x * 100) / 100, -50, 50) });
          selected = m;
          dragSlot = m.slot;
        } else if (hit.k === 'curve') {
          dragSlot = hit.slot;
          moveTrace(hit.slot, plot.toWorld(q.px, q.py)[0], true);
        } else dragSlot = traceSlot();
        surface.setCursor('grabbing');
        ctx.requestRender();
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (!dragSlot) return;
        const r = plot.rect;
        const x = plot.toWorld(clamp(q.px, r.x, r.x + r.w), q.py)[0];
        moveTrace(dragSlot, snapX(dragSlot, x));
      },
      pointerUp: () => {
        dragSlot = null;
        surface.setCursor('');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const hit = q ? hitAt(q.px, q.py, false) : null;
        const hs = hit?.k === 'curve' ? hit.slot : null;
        if (hs !== hoverSlot) {
          hoverSlot = hs;
          ctx.requestRender();
        }
        if (q) surface.setCursor(hit ? (hit.k === 'marker' ? 'pointer' : 'grab') : '');
      },
      wheel: () => false,
    });

    /* ---------- Karten rechts bzw. unten ---------- */
    interface Block {
      h: number;
      draw(x: number, y: number, w: number): void;
    }

    function titleBlock(label: string, color?: string): Block {
      const fs = narrow() ? 11 : 12;
      return { h: fs + 9, draw: (x, y) => text(surface.g, label.toUpperCase(), x, y + fs / 2 + 2, { font: `750 ${fs}px ${ctx.theme.font}`, color: color ?? ctx.theme.muted, align: 'left' }) };
    }

    function noteBlock(str: string, maxW: number, color?: string, size?: number, weight = 600): Block {
      const fs = size ?? (narrow() ? 11.5 : 12.5);
      const font = `${weight} ${fs}px ${ctx.theme.font}`;
      const rows = wrap(str, maxW, font);
      return {
        h: rows.length * fs * 1.32 + 3,
        draw: (x, y) => rows.forEach((rw, i) => text(surface.g, rw, x, y + fs * 0.72 + 2 + i * fs * 1.32, { font, color: color ?? ctx.theme.muted, align: 'left' })),
      };
    }

    function errorText(e: ParseError): string {
      if (e.code === 'unknownName' && e.b) return tr('e_unknownNameHint', { a: e.a ?? '', b: e.b });
      return tr(`e_${e.code}`, { a: e.a ?? '', b: e.b ?? '' });
    }

    /** Zeile einer Funktion: Plakette, „f(x) =“ und gesetzter Term bzw. Fehler. */
    function termBlock(s: Slot, maxW: number): Block[] {
      const st = state[s];
      const g = surface.g;
      const theme = ctx.theme;
      const c = colOf(s);
      const small = narrow();
      const fs = small ? 15 : 16.5;
      const head: Box = row([tbox(s, itFont(fs), fs, fs * 0.04), tbox('(', upFont(fs, 500), fs), tbox('x', itFont(fs), fs, fs * 0.06), tbox(') = ', upFont(fs, 500), fs)]);
      const lead = 28;
      const avail = maxW - lead - head.w;
      const traceMark = traceSlot() === s && !!st.fn;
      const rowH = (b: Box | null) => Math.max(26, b ? b.asc + b.desc + 10 : 26);
      const bg = (x: number, y: number, w: number, h: number) => {
        if (!traceMark) return;
        g.fillStyle = withAlpha(c, theme.dark ? 0.14 : 0.07);
        roundRect(g, x - 6, y, w + 12, h, 8);
        g.fill();
      };
      if (st.res.ok === true) {
        const box = layFit(st.res.term.node, fs, avail);
        const plain = box ? null : termText(st.res.term.node, lang);
        const h = rowH(box);
        return [
          {
            h: h + 2,
            draw: (x, y, w) => {
              bg(x, y, w, h);
              const base = y + h / 2 + (box ? (box.asc - box.desc) / 2 : fs * 0.3);
              nameBadge(x + 11, y + h / 2, s, c, 10.5);
              head.paint(x + lead, base, c);
              if (box) box.paint(x + lead + head.w, base, theme.text);
              else {
                // Sehr lange Terme: als Text, notfalls gekürzt
                let str = plain!;
                g.font = upFont(12);
                while (str.length > 4 && g.measureText(str).width > avail) str = `${str.slice(0, -2)}…`.replace(/……$/, '…');
                text(g, str, x + lead + head.w, base, { font: upFont(12), color: theme.text, align: 'left', baseline: 'alphabetic' });
              }
            },
          },
        ];
      }
      if (st.res.ok === 'empty') {
        return [
          {
            h: 28,
            draw: (x, y) => {
              nameBadge(x + 11, y + 14, s, c, 10.5, 0.55);
              head.paint(x + lead, y + 14 + fs * 0.3, withAlpha(c, 0.6));
              text(g, ctx.t('empty'), x + lead + head.w, y + 14 + fs * 0.3, { font: `italic 500 ${small ? 12.5 : 13}px ${theme.font}`, color: theme.muted, align: 'left', baseline: 'alphabetic' });
            },
          },
        ];
      }
      // Fehler: Eingabe mit markierter Stelle und Erklärung
      const e = st.res.error;
      const src = st.src;
      const efs = small ? 13 : 14;
      const font = `600 ${efs}px ${theme.font}`;
      g.font = font;
      let shownSrc = src;
      let offset = 0;
      const maxSrcW = maxW - lead - head.w;
      while (g.measureText(shownSrc).width > maxSrcW && shownSrc.length > 8) {
        // Lange Eingabe: Ausschnitt um die Fehlerstelle
        if (e.pos - offset > shownSrc.length / 2) {
          shownSrc = shownSrc.slice(1);
          offset++;
        } else shownSrc = shownSrc.slice(0, -1);
      }
      const msg = noteBlock(errorText(e), maxW - lead, red(), small ? 11.5 : 12, 650);
      return [
        {
          h: 30,
          draw: (x, y) => {
            const base = y + 15 + efs * 0.32;
            nameBadge(x + 11, y + 15, s, c, 10.5);
            head.paint(x + lead, base, c);
            const x0 = x + lead + head.w;
            g.font = font;
            const before = g.measureText(shownSrc.slice(0, Math.max(0, e.pos - offset))).width;
            const segTxt = shownSrc.slice(Math.max(0, e.pos - offset), Math.max(0, e.end - offset)) || ' ';
            const sw = Math.max(efs * 0.55, g.measureText(segTxt).width);
            g.fillStyle = withAlpha(red(), theme.dark ? 0.28 : 0.16);
            roundRect(g, x0 + before - 2, base - efs * 0.88, sw + 4, efs * 1.22, 4);
            g.fill();
            text(g, shownSrc, x0, base, { font, color: theme.text, align: 'left', baseline: 'alphabetic' });
            // Wellenlinie unter der Fehlerstelle
            g.save();
            g.strokeStyle = red();
            g.lineWidth = 1.8;
            g.lineCap = 'round';
            g.beginPath();
            const n = Math.max(4, Math.round(sw / 3));
            for (let i = 0; i <= n; i++) {
              const xx = x0 + before - 1 + ((sw + 2) * i) / n;
              const yy = base + efs * 0.3 + (i % 2 ? 2 : -0.5);
              if (i === 0) g.moveTo(xx, yy);
              else g.lineTo(xx, yy);
            }
            g.stroke();
            g.restore();
          },
        },
        { h: msg.h + 4, draw: (x, y, w) => msg.draw(x + lead, y, w - lead) },
      ];
    }

    function termsCard(w: number): Block[] {
      const bs: Block[] = [titleBlock(ctx.t('termsTitle'))];
      for (const s of SLOTS) bs.push(...termBlock(s, w));
      const famSlot = SLOTS.find((s) => !!family(s));
      if (famSlot) bs.push(noteBlock(tr('family', { a: nf(p.a, 1) }), w, colOf(famSlot), narrow() ? 11 : 11.5));
      return bs;
    }

    function traceCard(w: number): Block[] {
      const s = traceSlot();
      const theme = ctx.theme;
      if (!s) return [titleBlock(ctx.t('traceTitle')), noteBlock(ctx.t('traceOff'), w)];
      const c = colOf(s);
      const bs: Block[] = [titleBlock(ctx.t('traceTitle'), c)];
      const fn = state[s].fn;
      if (!fn) return [...bs, noteBlock(tr('traceNone', { f: `${s}(x)` }), w)];
      const x = traceX;
      const y = fn(x);
      const fs = narrow() ? 15 : 16;
      const sep = lang === 'de' ? ' | ' : ', ';
      if (Number.isFinite(y)) {
        const named = traceMarker && traceMarker.kind !== 'hole' && traceMarker.kind !== 'zero';
        const line = named ? markerText(traceMarker!) : `P${rel(x, y) === '≈' ? ' ≈ ' : ''}(${nf(x)}${sep}${nf(y)})`;
        bs.push({ h: fs * 1.6, draw: (xx, yy) => text(surface.g, line, xx, yy + fs * 0.8, { font: `750 ${fs}px ${theme.font}`, color: c, align: 'left' }) });
      } else bs.push(noteBlock(tr('undefinedAt', { f: s, x: nf(x) }), w, c, fs - 2, 700));
      // Werte der anderen Funktionen an derselben Stelle
      const others = SLOTS.filter((o) => o !== s && state[o].fn);
      for (const o of others) {
        const v = state[o].fn!(x);
        const str = Number.isFinite(v) ? `${o}(${nf(x)}) ${rel(x, v)} ${nf(v)}` : tr('undefinedAt', { f: o, x: nf(x) });
        bs.push(noteBlock(str, w, colOf(o), narrow() ? 12 : 12.5, 650));
      }
      if (p.tg && Number.isFinite(y)) {
        const m = derivative(fn, x);
        bs.push(noteBlock(m === null ? ctx.t('noSlope') : tr('slope', { rel: rel(m), m: nf(m) }), w, theme.text, narrow() ? 12 : 12.5));
      }
      const r = plot.rect;
      const px = plot.px(x);
      if (px < r.x || px > r.x + r.w) bs.push(noteBlock(ctx.t('outside'), w));
      else if (narrow() && !ctx.locked) bs.push({ h: 6, draw: () => {} }, noteBlock(ctx.t('tapHint'), w, theme.muted, 11));
      return bs;
    }

    /** Wertetabelle mit so vielen Zeilen, wie in die Höhe passen. */
    function tableCard(w: number, maxH: number, pad: number): Block[] {
      const g = surface.g;
      const theme = ctx.theme;
      const cols = SLOTS.filter((s) => state[s].fn);
      const bs: Block[] = [titleBlock(ctx.t('tableTitle'))];
      if (!cols.length) return bs;
      const fs = narrow() ? 12 : 12.5;
      const rh = fs * 1.62;
      const avail = maxH - pad * 2 - (bs[0]!.h + rh) + 4;
      const nRows = Math.max(1, Math.min(14, Math.floor(avail / rh)));
      const xs = Array.from({ length: nRows }, (_, i) => p.x0 + i * p.dx);
      const cell = (v: number) => (Number.isFinite(v) ? nf(v) : ctx.t('notDef'));
      const values = xs.map((x) => cols.map((s) => cell(state[s].fn!(x))));
      const fontB = `750 ${fs}px ${theme.font}`;
      const font = `600 ${fs}px ${theme.font}`;
      // Spalten: x und je Funktion, rechtsbündig
      g.font = font;
      const xw = Math.max(g.measureText('x').width, ...xs.map((x) => g.measureText(nf(x)).width));
      const cw = cols.map((s, j) => Math.max(g.measureText(`${s}(x)`).width, ...values.map((v) => g.measureText(v[j]!).width)));
      const total = xw + cw.reduce((a, b) => a + b, 0);
      const spare = Math.max(8, (w - total) / (cols.length + 0.5));
      const colX: number[] = [];
      let cx = xw;
      for (const cc of cw) {
        cx += spare + cc;
        colX.push(cx);
      }
      const tx = traceSlot() ? traceX : null;
      bs.push({
        h: rh,
        draw: (x, y) => {
          text(g, 'x', x + xw, y + rh / 2, { font: `italic 700 ${fs * 1.1}px ${theme.mathFont}`, color: theme.muted, align: 'right' });
          cols.forEach((s, j) => text(g, `${s}(x)`, x + colX[j]!, y + rh / 2, { font: fontB, color: colOf(s), align: 'right' }));
        },
      });
      xs.forEach((xv, i) => {
        const cur = tx !== null && Math.abs(xv - tx) < 1e-9;
        bs.push({
          h: rh,
          draw: (x, y, ww) => {
            if (cur) {
              g.fillStyle = withAlpha(colOf(traceSlot()!), theme.dark ? 0.2 : 0.1);
              roundRect(g, x - 5, y + 1, ww + 10, rh - 1, 5);
              g.fill();
            }
            g.strokeStyle = theme.dark ? '#253041' : '#edf0f4';
            g.lineWidth = 1;
            g.beginPath();
            g.moveTo(x, Math.round(y) + 0.5);
            g.lineTo(x + ww, Math.round(y) + 0.5);
            g.stroke();
            text(g, nf(xv), x + xw, y + rh / 2 + 0.5, { font: fontB, color: theme.text, align: 'right' });
            cols.forEach((_, j) => {
              const v = values[i]![j]!;
              text(g, v, x + colX[j]!, y + rh / 2 + 0.5, { font, color: v === ctx.t('notDef') ? theme.muted : theme.text, align: 'right' });
            });
          },
        });
      });
      return bs;
    }

    const blocksH = (bs: Block[]) => bs.reduce((a, b) => a + b.h, 0);

    function drawBlocks(R: Rect, bs: Block[], pad: number, accent?: string, tint = 0): void {
      card(R, accent, tint);
      let y = R.y + pad - 2;
      for (const b of bs) {
        if (y + b.h > R.y + R.h + 2) break;
        b.draw(R.x + pad, y, R.w - 2 * pad);
        y += b.h;
      }
    }

    function drawPanel(R: Rect): void {
      const small = narrow();
      const pad = small ? 10 : 13;
      const gp = small ? 8 : 10;
      const inner = R.w - 2 * pad;
      let y = R.y;
      const tc = termsCard(inner);
      const th = blocksH(tc) + pad * 2 - 2;
      drawBlocks({ x: R.x, y, w: R.w, h: th }, tc, pad);
      y += th + gp;
      const s = traceSlot();
      const accent = s ? colOf(s) : undefined;
      if (small && p.tab && valid().length) {
        // Handy: Spur und Tabelle nebeneinander
        const lw = Math.round((R.w - gp) * 0.44);
        const rw = R.w - gp - lw;
        const rest = R.y + R.h - y;
        const sc = traceCard(lw - 2 * pad);
        drawBlocks({ x: R.x, y, w: lw, h: rest }, sc, pad, accent, 0.04);
        const tb = tableCard(rw - 2 * pad, rest, pad);
        drawBlocks({ x: R.x + lw + gp, y, w: rw, h: rest }, tb, pad);
        return;
      }
      const sc = traceCard(inner);
      const sh = blocksH(sc) + pad * 2 - 2;
      drawBlocks({ x: R.x, y, w: R.w, h: sh }, sc, pad, accent, 0.04);
      y += sh + gp;
      if (!p.tab || !valid().length) return;
      const rest = R.y + R.h - y;
      if (rest < 80) return;
      const tb = tableCard(inner, rest, pad);
      drawBlocks({ x: R.x, y, w: R.w, h: Math.min(rest, blocksH(tb) + pad * 2 - 2) }, tb, pad);
    }

    /* ---------- Hinweis in leerer Zeichenfläche ---------- */
    function drawEmptyNote(): void {
      const any = SLOTS.some((s) => state[s].res.ok !== 'empty');
      if (valid().length || SLOTS.some((s) => state[s].stale)) return;
      const r = plot.rect;
      const g = surface.g;
      const theme = ctx.theme;
      const nErr = SLOTS.filter((s) => state[s].res.ok === false).length;
      const msg = any ? ctx.t(`${nErr > 1 ? 'allErrorsN' : 'allErrors'}${narrow() ? 'Narrow' : ''}`) : ctx.t('emptyPlot');
      const fs = narrow() ? 12.5 : 13.5;
      const font = `650 ${fs}px ${theme.font}`;
      const rows = wrap(msg, Math.min(300, r.w - 150), font);
      g.font = font;
      const w = Math.max(...rows.map((q) => g.measureText(q).width)) + 32;
      const h = rows.length * fs * 1.4 + 22;
      const box = { x: r.x + (r.w - w) / 2, y: r.y + r.h * 0.72 - h / 2, w, h };
      card(box, any ? red() : colOf('f'), 0.05);
      rows.forEach((q, i) => text(g, q, box.x + w / 2, box.y + 11 + fs * 0.7 + i * fs * 1.4, { font, color: any ? red() : theme.text }));
    }

    /* ---------- Ergebnisse ---------- */
    const esc = (str: string) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const varHtml = (str: string) => esc(str).replace(/(?<![A-Za-zäöü])([xab])(?![A-Za-zäöü])/g, '<var>$1</var>');
    const span = (s: Slot, html: string) => `<span style="color: var(--series-${SERIES[s] + 1})">${html}</span>`;

    function updateTermReadouts(): void {
      const rows = SLOTS.map((s) => {
        const st = state[s];
        if (st.res.ok === 'empty') return null;
        const head = span(s, `<strong>${s}</strong>(<var>x</var>) =`);
        if (st.res.ok === true) return `${head} ${varHtml(termText(st.res.term.node, lang))}`;
        return `${head} <span style="color: var(--series-2)">${esc(errorText(st.res.error))}</span>`;
      }).filter((v): v is string => v !== null);
      ctx.readout('terms', rows.length ? { html: rows.join('<br>') } : ctx.t('emptyPlot'));
      // Wertetabelle (11 Zeilen)
      const cols = SLOTS.filter((s) => state[s].fn);
      if (!cols.length) ctx.readout('table', null);
      else {
        const head = `<tr><th><var>x</var></th>${cols.map((s) => `<th>${span(s, `${s}(<var>x</var>)`)}</th>`).join('')}</tr>`;
        const body = Array.from({ length: 11 }, (_, i) => {
          const x = p.x0 + i * p.dx;
          const cur = traceSlot() !== null && Math.abs(x - traceX) < 1e-9;
          return `<tr${cur ? ' class="is-current"' : ''}><td>${esc(nf(x))}</td>${cols.map((s) => {
            const v = state[s].fn!(x);
            return `<td>${Number.isFinite(v) ? esc(nf(v)) : '–'}</td>`;
          }).join('')}</tr>`;
        }).join('');
        ctx.readout('table', { html: `<table class="mini-table">${head}${body}</table>` });
      }
      // Spur
      const t = traceInfo();
      if (!t) ctx.readout('trace', traceSlot() ? tr('traceNone', { f: `${traceSlot()}(x)` }) : ctx.t('traceOff'));
      else {
        const parts = SLOTS.filter((s) => state[s].fn).map((s) => {
          const v = state[s].fn!(t.x);
          const body = Number.isFinite(v) ? `${s}(${nf(t.x)}) ${rel(t.x, v)} ${nf(v)}` : tr('undefinedAt', { f: s, x: nf(t.x) });
          return span(s, s === t.slot ? `<strong>${esc(body)}</strong>` : esc(body));
        });
        if (p.tg && Number.isFinite(t.y)) {
          const m = derivative(t.fn, t.x);
          parts.push(esc(m === null ? ctx.t('noSlope') : tr('slope', { rel: rel(m), m: nf(m) })));
        }
        ctx.readout('trace', { html: parts.join(' · ') });
      }
    }

    /** „= 2“, „≈ 1,41“ oder „= π/2 ≈ 1,57“ (Winkelfunktionen). */
    function xFull(x: number, trig: boolean): string {
      const pi = trig ? xNice(x, true) : '';
      if (pi.includes('π')) return `= ${pi} ≈ ${nf(x)}`;
      return `${rel(x)} ${nf(x)}`;
    }

    /** Punkt „(1 | 2)“, „≈ (1,41 | 0,5)“ oder „(π/2 | 2) ≈ (1,57 | 2)“. */
    function ptFull(x: number, y: number, trig: boolean): string {
      const sep = lang === 'de' ? ' | ' : ', ';
      const pi = trig ? xNice(x, true) : '';
      const dec = `(${nf(x)}${sep}${nf(y)})`;
      if (pi.includes('π')) return `(${pi}${sep}${nf(y)})${isRounded(y) || isRounded(x) ? ` ≈ ${dec}` : ''}`;
      return `${rel(x, y) === '≈' ? '≈ ' : ''}${dec}`;
    }

    /** Ergebnisse zu den besonderen Punkten (hängen vom Ausschnitt ab). */
    let pointsKey = '';
    function updatePointReadouts(an: Analysis): void {
      const key = `${an.key}|${lang}`;
      if (key === pointsKey) return;
      pointsKey = key;
      const sep = ctx.t('sep');
      const list = (s: Slot, items: string[]) => span(s, `<strong>${s}</strong>: ${items.length ? esc(items.join(sep)) : esc(ctx.t('none'))}`);
      const vs = valid();
      if (!vs.length) {
        for (const k of ['nst', 'ext', 'sct', 'gaps']) ctx.readout(k, null);
        return;
      }
      ctx.readout('nst', {
        html: vs
          .map((s) => {
            const z = an.zeros[s];
            if (z === 'all') return span(s, esc(tr('allZero', { f: s })));
            const trig = state[s].trig;
            return list(s, (z ?? []).map((r) => `x ${xFull(r.x, trig)}${r.touch ? ` ${ctx.t('touchNote')}` : ''}`));
          })
          .join('<br>'),
      });
      ctx.readout('ext', {
        html: vs.map((s) => list(s, (an.extrema[s] ?? []).map((e) => `${ctx.t(e.kind === 'max' ? 'maxWord' : 'minWord')} ${ptFull(e.x, e.y, state[s].trig)}`))).join('<br>'),
      });
      ctx.readout(
        'sct',
        vs.length < 2
          ? null
          : {
              html: an.crosses
                .map((c) => {
                  const name = `${c.a} ∩ ${c.b}`;
                  if (c.same) return esc(tr('same', { a: c.a, b: c.b }));
                  const pts = c.pts.map((q) => `${ptFull(q.x, q.y, state[c.a].trig || state[c.b].trig)}${q.touch ? ` ${ctx.t('touchNote')}` : ''}`);
                  return `<strong>${esc(name)}</strong>: ${esc(pts.length ? pts.join(sep) : ctx.t('none'))}`;
                })
                .join('<br>'),
            },
      );
      const gapRows = vs
        .map((s) => {
          const c = cache[s];
          const items: string[] = [];
          for (const b of c?.breaks ?? []) {
            const bx = Math.abs(b.x - Math.round(b.x * 1e6) / 1e6) < 1e-7 ? Math.round(b.x * 1e6) / 1e6 : b.x;
            const full = xFull(bx, state[s].trig);
            items.push(tr(b.kind, { rel: full.slice(0, 1), x: full.slice(2) }));
          }
          for (const h of an.holes[s]) items.push(tr('holeAt', { x: nf(h.x), y: nf(h.y) }));
          return items.length ? list(s, items) : null;
        })
        .filter((v): v is string => v !== null);
      ctx.readout('gaps', gapRows.length ? { html: gapRows.join('<br>') } : null);
    }

    /* ---------- Aktionen ---------- */
    function fitView(): void {
      const b = plot.bounds;
      const fs = valid().map((s) => state[s].fn!);
      const must = analyze().markers.filter(markerOn).map((m) => m.y);
      const r = fitRange(fs, b.xMin, b.xMax, 400, must);
      if (!r) return;
      const q = (v: number, up: boolean) => (up ? Math.ceil(v * 2) / 2 : Math.floor(v * 2) / 2);
      ctx.set({ x1: q(b.xMin, true), x2: q(b.xMax, false), y1: q(r[0], false), y2: q(r[1], true), eq: false });
    }

    /* ---------- Hauptzeichnung ---------- */
    function render(): void {
      const reg = regions();
      plot.resize();
      const key = `${surface.width}x${surface.height}`;
      if (key !== viewKey) {
        viewKey = key;
        viewPending = 'now';
      }
      if (viewPending) {
        const target = windowView();
        if (viewPending === 'tween' && !reduced) {
          viewFrom = currentView();
          viewTo = target;
          viewTw.play();
        } else {
          viewTw.finish();
          viewFrom = viewTo = target;
          plot.setRange(target.x, target.y);
        }
        viewPending = null;
      }
      if (viewTw.running) {
        const v = mixView(viewFrom, viewTo, viewTw.value);
        plot.setRange(v.x, v.y);
      } else if (viewTo !== viewFrom) {
        plot.setRange(viewTo.x, viewTo.y);
        viewFrom = viewTo;
      }
      plot.setAxes({ x: { pi: p.pi } });
      for (const s of SLOTS) {
        const m = state[s].morph;
        if (m && performance.now() - m.start >= MORPH_MS) {
          state[s].morph = null;
          markPop.play();
        }
      }
      surface.begin();
      plot.begin();
      plot.grid();
      plot.axes();
      drawGraphs();
      // Zahlen an den Achsen über den Graphen (sonst verdecken z. B. Sinuskurven die Vielfachen von π)
      plot.axes();
      const avoid: [number, number][] = [];
      tracePxRect = null;
      traceMarker = null;
      const plan = planTraceLabel();
      const t = traceInfo();
      if (t && Number.isFinite(t.y)) avoid.push(plot.toPx(t.x, t.y));
      const labelRects = drawMarkers(avoid);
      if (tracePxRect) labelRects.push(tracePxRect);
      drawTrace(plan);
      drawNames(avoid, labelRects);
      drawEmptyNote();
      plot.end();
      drawPanel(reg.panel);
      const an = analyze();
      if (!morphing()) updatePointReadouts(an);
      if (viewTw.running || morphing() || markPop.running || tracePop.running) ctx.requestRender();
    }

    return {
      update(changed, source) {
        const termsChanged = SLOTS.some((s) => changed.has(s));
        if (source === 'init' || source === 'replace' || termsChanged) {
          readTerms(source === 'input' || source === 'replace');
          if (source !== 'input') selected = null;
        }
        if (changed.has('a') || changed.has('b')) for (const s of SLOTS) bindSlot(s);
        if (source === 'init' || source === 'replace') {
          traceX = p.tx;
          viewPending = 'now';
          markPop.play();
        } else {
          if (changed.has('tx') && source !== 'sim') traceX = p.tx;
          if (['x1', 'x2', 'y1', 'y2', 'eq'].some((k) => changed.has(k))) viewPending = 'tween';
          if (['nst', 'ext', 'sct', 'asy'].some((k) => changed.has(k)) && source === 'input') markPop.play();
          if (changed.has('sp') && source === 'input') {
            selected = null;
            tracePop.play();
          }
        }
        ctx.setAction('fit', { enabled: !ctx.locked });
        ctx.setAction('home', { enabled: !ctx.locked });
        updateTermReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'fit') fitView();
        else if (id === 'home') ctx.set({ x1: -6, x2: 6, y1: -4, y2: 4, eq: true });
        ctx.requestRender();
      },

      resetView() {
        viewPending = 'now';
      },

      render,
      destroy: () => surface.destroy(),
    };
  },
});
