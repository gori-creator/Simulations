import {
  defineSimulation,
  drawArrowHead,
  drawCard,
  ease,
  MINUS,
  Plot,
  prefersReducedMotion,
  roundRect,
  softShadow,
  subText,
  Surface,
  TapTarget,
  text,
  Tween,
  withAlpha,
  type Rect,
} from '../../../sim-core';
import {
  classify,
  inverse,
  isStochastic,
  matPow,
  mulMV,
  parseMatrix,
  parseVector,
  paths,
  series,
  toFraction,
  total,
  type ChainInfo,
  type Mat,
  type Vec,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Loc = { de: string; en: string };
type P = [number, number];

/* ------------------------------------------------------------------ */
/* Beispiele (Szenarien)                                               */
/* ------------------------------------------------------------------ */

type ScenId = 'wetter' | 'kunden' | 'waehler' | 'studium' | 'kaefer' | 'eigen';

interface Scenario {
  /** Namen der Zustände. */
  names: Loc[];
  /** Kurzzeichen der Zustände (im Graphen und an der Matrix). */
  short: string[];
  /** Übergangsmatrix, Spalte j = von Zustand j. */
  m: Mat;
  /** Startvektor. */
  x0: Vec;
  /** Anteile (in %) oder Anzahlen. */
  unit: 'share' | 'count';
  /** Einheit bei Anzahlen (z. B. „Kunden“). */
  unitName?: Loc;
  /** Kurze Geschichte zum Beispiel. */
  story: Loc;
}

const SCEN: Record<Exclude<ScenId, 'eigen'>, Scenario> = {
  wetter: {
    names: [L('Sonne', 'Sun'), L('Regen', 'Rain')],
    short: ['S', 'R'],
    m: [
      [0.9, 0.2],
      [0.1, 0.8],
    ],
    x0: [1, 0],
    unit: 'share',
    story: L('Auf einen Sonnentag folgt mit 90 % wieder Sonne, auf Regen mit 80 % wieder Regen.', 'A sunny day is followed by sun with 90 %, a rainy day by rain with 80 %.'),
  },
  kunden: {
    names: [L('Anbieter A', 'Provider A'), L('Anbieter B', 'Provider B'), L('Anbieter C', 'Provider C')],
    short: ['A', 'B', 'C'],
    m: [
      [0.8, 0.2, 0.1],
      [0.1, 0.7, 0.2],
      [0.1, 0.1, 0.7],
    ],
    x0: [400, 350, 250],
    unit: 'count',
    unitName: L('Kunden', 'customers'),
    story: L('1000 Kunden, drei Anbieter: Jedes Jahr wechselt ein Teil der Kunden.', '1000 customers, three providers: every year some of them switch.'),
  },
  waehler: {
    names: [L('Partei A', 'Party A'), L('Partei B', 'Party B'), L('Partei C', 'Party C'), L('Nichtwähler', 'Non-voters')],
    short: ['A', 'B', 'C', 'N'],
    m: [
      [0.8, 0.1, 0.05, 0.1],
      [0.08, 0.75, 0.1, 0.1],
      [0.04, 0.05, 0.75, 0.1],
      [0.08, 0.1, 0.1, 0.7],
    ],
    x0: [0.35, 0.3, 0.15, 0.2],
    unit: 'share',
    story: L('Wählerwanderung von Wahl zu Wahl, Anteile in Prozent.', 'Voter migration from election to election, shares in per cent.'),
  },
  studium: {
    names: [L('im Studium', 'studying'), L('Abschluss', 'degree'), L('Abbruch', 'drop-out')],
    short: ['S', 'A', 'B'],
    m: [
      [0.6, 0, 0],
      [0.3, 1, 0],
      [0.1, 0, 1],
    ],
    x0: [1, 0, 0],
    unit: 'share',
    story: L('Pro Jahr schließen 30 % ab, 10 % brechen ab. Abschluss und Abbruch verlässt man nicht mehr (absorbierend).', 'Each year 30 % graduate and 10 % drop out. Nobody leaves degree or drop-out again (absorbing).'),
  },
  kaefer: {
    names: [L('Eier', 'eggs'), L('Larven', 'larvae'), L('Käfer', 'beetles')],
    short: ['E', 'L', 'K'],
    m: [
      [0, 0, 6],
      [0.5, 0, 0],
      [0, 1 / 3, 0],
    ],
    x0: [600, 0, 0],
    unit: 'count',
    unitName: L('Tiere', 'animals'),
    story: L('Aus der Hälfte der Eier werden Larven, aus einem Drittel der Larven Käfer, jeder Käfer legt 6 Eier und stirbt.', 'Half of the eggs become larvae, a third of the larvae become beetles, each beetle lays 6 eggs and dies.'),
  },
};

const EIGEN_NAMES = ['1', '2', '3', '4'].map((k) => L(`Zustand ${k}`, `state ${k}`));

/* ------------------------------------------------------------------ */
/* Zahlen                                                              */
/* ------------------------------------------------------------------ */

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const MAX_N = 30;
const MIN_N = -10;

/**
 * Übergangsmatrizen (Markov-Ketten): Zustandsgraph, Matrix und Verteilung
 * Schritt für Schritt, Matrixpotenzen, stabile Verteilung (Fixvektor),
 * absorbierende und zyklische Prozesse, Rechnen rückwärts mit der Inversen.
 */
export default defineSimulation({
  id: 'uebergangsmatrizen',
  dragHint: false,
  hint: (v: { readonly view?: unknown }) =>
    v.view === 'pow'
      ? L('Tipp: Tippe ein Feld der Matrix Mⁿ an – der Graph zeigt den Weg dazu.', 'Tip: tap an entry of Mⁿ – the graph shows the matching path.')
      : L('Tipp: Tippe einen Zustand im Graphen an, um dort mit allem zu starten. Ein Feld der Matrix antippen hebt den Pfeil hervor.', 'Tip: tap a state in the graph to start with everything there. Tapping a matrix entry highlights its arrow.'),
  layout: { aspect: 1.62, aspectNarrow: 0.44 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'sc',
      type: 'choice',
      label: L('Beispiel', 'Example'),
      options: [
        { value: 'wetter', label: L('Wetter (2 Zustände)', 'Weather (2 states)') },
        { value: 'kunden', label: L('Kundenwanderung (3)', 'Customers switching (3)') },
        { value: 'waehler', label: L('Wählerwanderung (4)', 'Voter migration (4)') },
        { value: 'studium', label: L('Studium: absorbierend', 'Studies: absorbing') },
        { value: 'kaefer', label: L('Käfer-Population: zyklisch', 'Beetle population: cyclic') },
        { value: 'eigen', label: L('Eigene Matrix', 'Own matrix') },
      ],
      default: 'kunden',
    },
    {
      key: 'view',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'step', label: L('Schritt für Schritt', 'Step by step') },
        { value: 'pow', label: L('Matrixpotenz Mⁿ', 'Matrix power Mⁿ') },
        { value: 'fix', label: L('Langfristig: stabile Verteilung', 'Long run: stable distribution') },
        { value: 'back', label: L('Rückwärts mit M⁻¹', 'Backwards with M⁻¹') },
      ],
      default: 'step',
    },
    {
      key: 'n',
      type: 'number',
      label: L('Schritt n', 'Step n'),
      min: MIN_N,
      max: MAX_N,
      step: 1,
      default: 0,
      help: L('Negative n rechnen rückwärts: Wie sah es vor n Schritten aus?', 'Negative n go backwards: what did it look like n steps ago?'),
    },
    {
      key: 'st',
      type: 'choice',
      label: L('Start', 'Start'),
      options: [
        { value: 'mix', label: L('wie im Beispiel', 'as in the example') },
        { value: '1', label: L('alles in Zustand 1', 'everything in state 1') },
        { value: '2', label: L('alles in Zustand 2', 'everything in state 2') },
        { value: '3', label: L('alles in Zustand 3', 'everything in state 3') },
        { value: '4', label: L('alles in Zustand 4', 'everything in state 4') },
      ],
      default: 'mix',
    },
    {
      key: 'mx',
      type: 'text',
      label: L('Matrix M (zeilenweise)', 'Matrix M (row by row)'),
      default: '0,7 0,2 0,1; 0,2 0,6 0,3; 0,1 0,2 0,6',
      maxLength: 80,
      placeholder: L('z. B. 0,9 0,2; 0,1 0,8', 'e.g. 0.9 0.2; 0.1 0.8'),
      help: L(
        'Zeilen mit ; trennen, Zahlen einer Zeile mit Leerzeichen. Spalte j enthält, wohin es von Zustand j geht (Spaltensumme 1). Brüche wie 1/3 sind erlaubt. 2 × 2 bis 4 × 4.',
        'Separate rows with ; and numbers in a row with spaces. Column j holds where state j goes to (column sum 1). Fractions like 1/3 are fine. 2 × 2 to 4 × 4.',
      ),
      visibleIf: (v) => v.sc === 'eigen',
    },
    {
      key: 'x0',
      type: 'text',
      label: L('Startvektor x₀', 'Start vector x₀'),
      default: '100; 0; 0',
      maxLength: 60,
      placeholder: L('z. B. 0,5; 0,5', 'e.g. 0.5; 0.5'),
      help: L('Einträge mit ; trennen. Summe 1 bedeutet Anteile, sonst Anzahlen.', 'Separate entries with ;. A sum of 1 means shares, otherwise counts.'),
      visibleIf: (v) => v.sc === 'eigen',
    },
    { key: 'ci', type: 'number', label: L('Eintrag: Zeile i (nach)', 'Entry: row i (to)'), min: 1, max: 4, step: 1, default: 1, visibleIf: (v) => v.view === 'pow' },
    { key: 'cj', type: 'number', label: L('Eintrag: Spalte j (von)', 'Entry: column j (from)'), min: 1, max: 4, step: 1, default: 2, visibleIf: (v) => v.view === 'pow' },
    { key: 'lab', type: 'boolean', group: 'view', label: L('Wahrscheinlichkeiten an den Pfeilen', 'Probabilities on the arrows'), default: true },
    { key: 'flow', type: 'boolean', group: 'view', label: L('Pfeildicke zeigt, wie viel fließt', 'Arrow width shows how much flows'), default: true },
    { key: 'chart', type: 'boolean', group: 'view', label: L('Verlauf über die Schritte', 'Course over the steps'), default: true },
  ],
  actions: [
    { id: 'next', label: L('Schritt weiter', 'Next step'), primary: true },
    { id: 'prev', label: L('Schritt zurück', 'Step back') },
    { id: 'run', label: L('Abspielen', 'Play') },
    { id: 'zero', label: L('Zurück auf n = 0', 'Back to n = 0') },
  ],
  readouts: [
    { key: 'xn', label: L('Zustand nach n Schritten', 'State after n steps') },
    { key: 'calc', label: L('Rechnung', 'Calculation') },
    { key: 'cell', label: L('Eintrag von Mⁿ', 'Entry of Mⁿ') },
    { key: 'kind', label: L('Art des Prozesses', 'Kind of process') },
    { key: 'fix', label: L('Langfristig', 'In the long run'), spoiler: true },
  ],
  presets: [
    { id: 'weather', label: L('Wetter: ein Schritt', 'Weather: one step'), values: { sc: 'wetter', view: 'step', n: 1 } },
    { id: 'customers', label: L('Kunden: 5 Jahre', 'Customers: 5 years'), values: { sc: 'kunden', view: 'step', n: 5 } },
    { id: 'square', label: L('M²: zwei Tage auf einmal', 'M²: two days at once'), values: { sc: 'wetter', view: 'pow', n: 2, ci: 1, cj: 2 } },
    { id: 'stable', label: L('Stabile Verteilung', 'Stable distribution'), values: { sc: 'kunden', view: 'fix', n: 20 } },
    { id: 'absorb', label: L('Absorbierend: Studium', 'Absorbing: studies'), values: { sc: 'studium', view: 'fix', n: 12 } },
    { id: 'cycle', label: L('Zyklus: Käfer', 'Cycle: beetles'), values: { sc: 'kaefer', view: 'step', n: 2 } },
    { id: 'back', label: L('Rückwärts rechnen', 'Calculating backwards'), values: { sc: 'wetter', view: 'back', n: -2 } },
  ],
  strings: {
    de: {
      canvas: 'Zustandsgraph mit Pfeilen für die Übergänge, daneben die Rechnung mit der Übergangsmatrix und der Verlauf der Verteilung über die Schritte.',
      from: 'von',
      to: 'nach',
      stepTitle: 'Ein Schritt: x_{n+1} = M · x_n',
      powTitle: 'n Schritte auf einmal: M^n',
      fixTitle: 'Langfristig: Wohin läuft die Verteilung?',
      backTitle: 'Rückwärts: x_{n−1} = M⁻¹ · x_n',
      chartTitle: 'Verlauf der Verteilung',
      chartShare: 'Anteil',
      cellText: 'Wahrscheinlichkeit, in {n} Schritten von {j} nach {i} zu kommen',
      cellText1: 'Wahrscheinlichkeit, in einem Schritt von {j} nach {i} zu kommen',
      paths: 'Wege der Länge {n}:',
      pathsMore: '… und {k} weitere',
      sum: 'Summe',
      noPaths: 'kein Weg dieser Länge',
      fixEq: '(M − E) · x = 0  und  x₁ + … + x_k = 1',
      fixVec: 'stabile Verteilung',
      limitTitle: 'Grenzmatrix (Mⁿ für großes n)',
      absorbText: 'Absorbierend: Wer dort ist, bleibt. Das Ergebnis hängt vom Start ab.',
      periodText: 'Mⁿ kommt nicht zur Ruhe: Der Prozess wiederholt sich alle {p} Schritte.',
      periodText0: 'Mⁿ kommt nicht zur Ruhe, der Prozess pendelt.',
      popText: 'Keine Übergangsmatrix: Spaltensummen ≠ 1 (Populationsmatrix).',
      growth: 'Gesamtbestand ändert sich langfristig pro Schritt um den Faktor {f}.',
      cycleText: 'M^{p} = E: Nach {p} Schritten ist alles wie am Anfang.',
      fixCheck: 'Probe: M · x = x',
      invNone: 'M ist nicht invertierbar (det M = 0): Rückwärts gibt es keine eindeutige Antwort.',
      negWarn: 'Negative Einträge: So einen Vorgänger kann es nicht geben – zu weit zurückgerechnet.',
      invOk: 'Probe: M · x_{n−1} = x_n',
      bad: 'Die Matrix lässt sich nicht lesen.',
      badSquare: 'Jede Zeile braucht gleich viele Zahlen wie es Zeilen gibt.',
      badSize: 'Bitte 2 × 2 bis 4 × 4.',
      badVec: 'Der Startvektor passt nicht zur Matrix ({k} Einträge nötig).',
      notStoch: 'Spaltensummen ≠ 1: keine Übergangsmatrix',
      tapState: 'Start: alles in {s}',
      total: 'Gesamt {t}',
      share: 'Anteil',
      stepN: 'n = {n}',
      regular: 'Regulär: Mⁿ nähert sich einer Matrix mit lauter gleichen Spalten. Egal wo man startet, es läuft auf dieselbe Verteilung hinaus.',
      regularShort: 'regulär – eine stabile Verteilung, unabhängig vom Start',
      absorbShort: 'absorbierend – Endzustand hängt vom Start ab',
      periodShort: 'zyklisch – keine Grenzverteilung',
      popShort: 'Populationsmatrix – Bestand wächst oder schrumpft',
      sumKeep: 'Summe bleibt {t}',
      noFix: 'keine eindeutige stabile Verteilung',
    },
    en: {
      canvas: 'State graph with arrows for the transitions, next to it the calculation with the transition matrix and the course of the distribution over the steps.',
      from: 'from',
      to: 'to',
      stepTitle: 'One step: x_{n+1} = M · x_n',
      powTitle: 'n steps at once: M^n',
      fixTitle: 'In the long run: where does it go?',
      backTitle: 'Backwards: x_{n−1} = M⁻¹ · x_n',
      chartTitle: 'Course of the distribution',
      chartShare: 'share',
      cellText: 'probability of getting from {j} to {i} in {n} steps',
      cellText1: 'probability of getting from {j} to {i} in one step',
      paths: 'paths of length {n}:',
      pathsMore: '… and {k} more',
      sum: 'sum',
      noPaths: 'no path of this length',
      fixEq: '(M − E) · x = 0  and  x₁ + … + x_k = 1',
      fixVec: 'stable distribution',
      limitTitle: 'Limit matrix (Mⁿ for large n)',
      absorbText: 'Absorbing: whoever gets there stays. The result depends on the start.',
      periodText: 'Mⁿ never settles: the process repeats every {p} steps.',
      periodText0: 'Mⁿ never settles, the process oscillates.',
      popText: 'Not a transition matrix: column sums ≠ 1 (population matrix).',
      growth: 'In the long run the total changes by the factor {f} per step.',
      cycleText: 'M^{p} = E: after {p} steps everything is back to the start.',
      fixCheck: 'Check: M · x = x',
      invNone: 'M is not invertible (det M = 0): going backwards has no unique answer.',
      negWarn: 'Negative entries: such a predecessor cannot exist – calculated too far back.',
      invOk: 'Check: M · x_{n−1} = x_n',
      bad: 'The matrix cannot be read.',
      badSquare: 'Every row needs as many numbers as there are rows.',
      badSize: 'Please 2 × 2 to 4 × 4.',
      badVec: 'The start vector does not fit the matrix ({k} entries needed).',
      notStoch: 'column sums ≠ 1: not a transition matrix',
      tapState: 'Start: everything in {s}',
      total: 'total {t}',
      share: 'share',
      stepN: 'n = {n}',
      regular: 'Regular: Mⁿ approaches a matrix with identical columns. Wherever you start, you end up with the same distribution.',
      regularShort: 'regular – one stable distribution, whatever the start',
      absorbShort: 'absorbing – the end depends on the start',
      periodShort: 'cyclic – no limit distribution',
      popShort: 'population matrix – total grows or shrinks',
      sumKeep: 'sum stays {t}',
      noFix: 'no unique stable distribution',
    },
  },
  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const reduced = prefersReducedMotion();

    /* -------------------------------------------------------------- */
    /* Zustand des Modells                                             */
    /* -------------------------------------------------------------- */

    interface Model {
      ok: true;
      m: Mat;
      k: number;
      names: string[];
      short: string[];
      x0: Vec;
      unit: 'share' | 'count';
      unitName: string;
      stochastic: boolean;
      info: ChainInfo;
      inv: Mat | null;
      story: string;
    }
    interface Bad {
      ok: false;
      message: string;
    }

    function buildModel(): Model | Bad {
      const lang = ctx.lang;
      let sc: Scenario;
      if (p.sc === 'eigen') {
        const r = parseMatrix(p.mx);
        if (!r.m) {
          const msg = r.error === 'square' ? tr('badSquare') : r.error === 'size' ? tr('badSize') : tr('bad');
          return { ok: false, message: msg };
        }
        const k = r.m.length;
        const v = parseVector(p.x0, k);
        if (!v.x) return { ok: false, message: tr('badVec', { k }) };
        const share = Math.abs(total(v.x) - 1) < 1e-9 && v.x.every((e) => e >= 0);
        sc = {
          names: EIGEN_NAMES.slice(0, k),
          short: ['1', '2', '3', '4'].slice(0, k),
          m: r.m,
          x0: v.x,
          unit: share ? 'share' : 'count',
          story: L('', ''),
        };
      } else sc = SCEN[p.sc];
      const k = sc.m.length;
      const t0 = total(sc.x0);
      let x0 = sc.x0;
      if (p.st !== 'mix') {
        const j = Number(p.st) - 1;
        if (j < k) x0 = sc.m.map((_, i) => (i === j ? (sc.unit === 'share' ? 1 : t0) : 0));
      }
      return {
        ok: true,
        m: sc.m,
        k,
        names: sc.names.map((n) => n[lang]),
        short: sc.short,
        x0,
        unit: sc.unit,
        unitName: sc.unitName ? sc.unitName[lang] : '',
        stochastic: isStochastic(sc.m),
        info: classify(sc.m),
        inv: inverse(sc.m),
        story: sc.story[lang],
      };
    }

    let model: Model | Bad = buildModel();
    /** Zustände von MIN_N bis MAX_N + 1 (null, wo es rückwärts nicht geht). */
    let all: Map<number, Vec | null> = new Map();
    /** Größter Einzelwert von n = 0 bis 30 (Maßstab der Füllstände bei Anzahlen). */
    let maxVal = 1;

    function rebuild(): void {
      model = buildModel();
      all = new Map();
      if (!model.ok) return;
      for (const s of series(model.m, model.x0, MIN_N, MAX_N + 1)) all.set(s.n, s.x);
      maxVal = 1e-9;
      for (let n = 0; n <= MAX_N; n++) for (const v of all.get(n) ?? []) if (Number.isFinite(v)) maxVal = Math.max(maxVal, Math.abs(v));
    }
    rebuild();

    const stateOf = (n: number): Vec | null => all.get(n) ?? null;
    const color = (i: number) => th().series[[0, 1, 2, 3][i] ?? 0]!;
    const cellI = () => (model.ok ? clamp(Math.round(p.ci), 1, model.k) - 1 : 0);
    const cellJ = () => (model.ok ? clamp(Math.round(p.cj), 1, model.k) - 1 : 0);

    /* -------------------------------------------------------------- */
    /* Animation                                                       */
    /* -------------------------------------------------------------- */

    /** Übergang zwischen zwei Schritten (Teilchen fließen, Füllstände ändern sich). */
    const stepTw = new Tween(950, ease.inOutCubic);
    let fromN = p.n;
    let toN = p.n;
    /** Einblenden beim Laden und beim Wechsel des Beispiels. */
    const introTw = new Tween(900, ease.outCubic);
    /** Wechsel der Ansicht (Karte blendet über). */
    const viewTw = new Tween(450, ease.outCubic);
    /** Hervorhebung des gewählten Eintrags. */
    const pickTw = new Tween(500, ease.outBack);
    let runTimer: number | null = null;
    let hover: number | null = null;
    let hoverCell: [number, number] | null = null;
    introTw.play();

    function stopRun(): void {
      if (runTimer !== null) window.clearTimeout(runTimer);
      runTimer = null;
      ctx.setAction('run', { label: ctx.lang === 'de' ? 'Abspielen' : 'Play' });
    }

    function runStep(): void {
      if (p.n >= MAX_N || !model.ok) return stopRun();
      ctx.set({ n: p.n + 1 });
      runTimer = window.setTimeout(runStep, reduced ? 250 : 1150);
    }

    /** Aktuell angezeigte (überblendete) Verteilung. */
    function shownState(): Vec | null {
      const a = stateOf(fromN);
      const b = stateOf(toN);
      if (!stepTw.running || !a || !b) return b ?? a;
      const t = stepTw.value;
      return a.map((v, i) => lerp(v, b[i]!, t));
    }

    /** Angezeigtes n (für die Marke im Diagramm). */
    const shownN = () => (stepTw.running ? lerp(fromN, toN, stepTw.value) : toN);

    /* -------------------------------------------------------------- */
    /* Layout                                                          */
    /* -------------------------------------------------------------- */

    const wide = () => surface.width >= 560 && surface.width >= surface.height * 1.15;

    function regions(): { graph: Rect; card: Rect; chart: Rect | null } {
      const w = surface.width;
      const h = surface.height;
      const pad = 10;
      if (wide()) {
        const gw = Math.round(w * 0.47);
        const right: Rect = { x: gw + pad, y: pad, w: w - gw - 2 * pad, h: h - 2 * pad };
        if (!p.chart) return { graph: { x: pad, y: pad, w: gw - pad, h: h - 2 * pad }, card: right, chart: null };
        const ch = Math.round(right.h * 0.44);
        return {
          graph: { x: pad, y: pad, w: gw - pad, h: h - 2 * pad },
          card: { x: right.x, y: right.y, w: right.w, h: right.h - ch - pad },
          chart: { x: right.x, y: right.y + right.h - ch, w: right.w, h: ch },
        };
      }
      const gh = Math.round(h * 0.4);
      const rest = h - gh - 3 * pad;
      if (!p.chart) return { graph: { x: pad, y: pad, w: w - 2 * pad, h: gh }, card: { x: pad, y: gh + 2 * pad, w: w - 2 * pad, h: rest }, chart: null };
      const ch = Math.round(rest * 0.4);
      return {
        graph: { x: pad, y: pad, w: w - 2 * pad, h: gh },
        card: { x: pad, y: gh + 2 * pad, w: w - 2 * pad, h: rest - ch - pad },
        chart: { x: pad, y: h - pad - ch, w: w - 2 * pad, h: ch },
      };
    }

    /* -------------------------------------------------------------- */
    /* Zahlen formatieren                                              */
    /* -------------------------------------------------------------- */

    /** Wert eines Zustands (Anteil in %, sonst Anzahl). */
    function valueText(v: number, m: Model, dec = 1): string {
      if (m.unit === 'share') return `${fmt.num(v * 100, dec)} %`;
      return fmt.num(v, dec);
    }
    /** Eintrag einer Matrix (Wahrscheinlichkeit, bis 3 Nachkommastellen). */
    function probText(v: number, dec = 3): string {
      if (Math.abs(v) < 5e-10) return '0';
      const f = toFraction(v, 12, 1e-9);
      if (f && f[1] > 1 && Math.abs(Math.round(v * 1000) / 1000 - v) > 1e-9 && f[1] <= 9) return `${f[0] < 0 ? MINUS : ''}${Math.abs(f[0])}/${f[1]}`;
      return fmt.num(v, dec);
    }
    function fracText(v: number): string {
      const f = toFraction(v, 64, 1e-7);
      if (f && f[1] > 1) return `${f[0] < 0 ? MINUS : ''}${Math.abs(f[0])}/${f[1]}`;
      return fmt.num(v, 4);
    }

    /* -------------------------------------------------------------- */
    /* Graph: Knoten und Pfeile                                        */
    /* -------------------------------------------------------------- */

    interface Node {
      c: P;
      r: number;
    }
    interface Edge {
      from: number;
      to: number;
      loop: boolean;
      /** kubische Bézierkurve */
      b: [P, P, P, P];
    }

    /**
     * Lage der Knoten: Schleifen zeigen nach außen (bei 2 und 4 Zuständen
     * waagerecht, bei 3 nach oben, links, rechts), daneben bleibt Platz für
     * die Namen.
     */
    function nodesFor(R: Rect, k: number): Node[] {
      const top = R.y + 8;
      const bottom = R.y + R.h - 4;
      const h = bottom - top;
      const rad = clamp(Math.min(R.w / (k === 2 ? 8.6 : 7.2), k === 2 ? h / 3.6 : k === 3 ? (h - 26) / 6.1 : (h - 40) / 5.4), 18, 54);
      const loopW = rad * 2.3;
      const xl = R.x + loopW + 4;
      const xr = R.x + R.w - loopW - 4;
      if (k === 2) {
        const cy = top + h * 0.5;
        const dx = Math.min((xr - xl) / 2, rad * 3.4);
        const cx = R.x + R.w / 2;
        return [
          { c: [cx - dx, cy], r: rad },
          { c: [cx + dx, cy], r: rad },
        ];
      }
      if (k === 3) {
        const yTop = top + loopW + 2;
        const yBot = bottom - rad - 20;
        const dx = Math.min((xr - xl) / 2, (yBot - yTop) * 1.05);
        const cx = R.x + R.w / 2;
        return [
          { c: [cx, yTop], r: rad },
          { c: [cx - dx, yBot], r: rad },
          { c: [cx + dx, yBot], r: rad },
        ];
      }
      const yTop = top + rad + 18;
      const yBot = bottom - rad - 20;
      const dx = Math.min((xr - xl) / 2, (yBot - yTop) * 0.95);
      const cx = R.x + R.w / 2;
      return [
        { c: [cx - dx, yTop], r: rad },
        { c: [cx + dx, yTop], r: rad },
        { c: [cx + dx, yBot], r: rad },
        { c: [cx - dx, yBot], r: rad },
      ];
    }

    /** Richtung der Schleife eines Knotens (Bogenmaß). */
    function loopAngle(k: number, i: number, nodes: Node[], R: Rect): number {
      if (k === 3 && i === 0) return -Math.PI / 2;
      return nodes[i]!.c[0] < R.x + R.w / 2 ? Math.PI : 0;
    }

    function edgesFor(nodes: Node[], m: Mat, R: Rect): Edge[] {
      const out: Edge[] = [];
      const k = nodes.length;
      for (let j = 0; j < k; j++) {
        for (let i = 0; i < k; i++) {
          const v = m[i]![j]!;
          if (Math.abs(v) < 1e-12) continue;
          const a = nodes[j]!;
          const b = nodes[i]!;
          if (i === j) {
            // Schleife nach außen (vom Mittelpunkt des Graphen weg)
            const ang = loopAngle(k, j, nodes, R);
            const sp = 0.55;
            const s0: P = [a.c[0] + Math.cos(ang - sp) * a.r, a.c[1] + Math.sin(ang - sp) * a.r];
            const s1: P = [a.c[0] + Math.cos(ang + sp) * (a.r + 3), a.c[1] + Math.sin(ang + sp) * (a.r + 3)];
            const far = a.r * 2.15;
            const c0: P = [a.c[0] + Math.cos(ang - 0.75) * far, a.c[1] + Math.sin(ang - 0.75) * far];
            const c1: P = [a.c[0] + Math.cos(ang + 0.75) * far, a.c[1] + Math.sin(ang + 0.75) * far];
            out.push({ from: j, to: i, loop: true, b: [s0, c0, c1, s1] });
            continue;
          }
          const dx = b.c[0] - a.c[0];
          const dy = b.c[1] - a.c[1];
          const d = Math.hypot(dx, dy);
          const ux = dx / d;
          const uy = dy / d;
          // Bogen nach rechts (in Laufrichtung): Hin- und Rückweg liegen getrennt
          const nx = -uy;
          const ny = ux;
          const bend = d * 0.17;
          const off = 0.32;
          const s0: P = [a.c[0] + (ux * Math.cos(off) - nx * Math.sin(off)) * a.r, a.c[1] + (uy * Math.cos(off) - ny * Math.sin(off)) * a.r];
          const s1: P = [b.c[0] - (ux * Math.cos(off) + nx * Math.sin(off)) * (b.r + 3), b.c[1] - (uy * Math.cos(off) + ny * Math.sin(off)) * (b.r + 3)];
          const mid: P = [(s0[0] + s1[0]) / 2 - nx * bend, (s0[1] + s1[1]) / 2 - ny * bend];
          const c0: P = [s0[0] + ((mid[0] - s0[0]) * 2) / 3, s0[1] + ((mid[1] - s0[1]) * 2) / 3];
          const c1: P = [s1[0] + ((mid[0] - s1[0]) * 2) / 3, s1[1] + ((mid[1] - s1[1]) * 2) / 3];
          out.push({ from: j, to: i, loop: false, b: [s0, c0, c1, s1] });
        }
      }
      return out;
    }

    function bez(b: [P, P, P, P], t: number): P {
      const u = 1 - t;
      const w0 = u * u * u;
      const w1 = 3 * u * u * t;
      const w2 = 3 * u * t * t;
      const w3 = t * t * t;
      return [w0 * b[0][0] + w1 * b[1][0] + w2 * b[2][0] + w3 * b[3][0], w0 * b[0][1] + w1 * b[1][1] + w2 * b[2][1] + w3 * b[3][1]];
    }
    function bezAngle(b: [P, P, P, P], t: number): number {
      const e = 0.002;
      const a = bez(b, Math.max(0, t - e));
      const c = bez(b, Math.min(1, t + e));
      return Math.atan2(c[1] - a[1], c[0] - a[0]);
    }

    /** Pfeil entlang einer Kurve (Spitze bei t = 1, etwas vor dem Ende). */
    function drawEdge(g: CanvasRenderingContext2D, e: Edge, col: string, width: number, alpha: number, grow: number, glow: boolean): void {
      const steps = 40;
      const end = clamp(grow, 0, 1);
      if (end <= 0.01) return;
      const headLen = clamp(7 + width * 1.6, 9, 20);
      // Linie endet vor der Spitze
      g.save();
      g.globalAlpha = alpha;
      g.strokeStyle = col;
      g.lineWidth = width;
      g.lineCap = 'round';
      if (glow) {
        g.shadowColor = withAlpha(col, th().dark ? 0.7 : 0.45);
        g.shadowBlur = 12;
      }
      g.beginPath();
      // Länge abschätzen, um die Spitze freizulassen
      let len = 0;
      let prev = bez(e.b, 0);
      const pts: P[] = [prev];
      for (let s = 1; s <= steps; s++) {
        const q = bez(e.b, (s / steps) * end);
        len += Math.hypot(q[0] - prev[0], q[1] - prev[1]);
        pts.push(q);
        prev = q;
      }
      let cut = len - headLen * 0.75;
      g.moveTo(pts[0]![0], pts[0]![1]);
      let acc = 0;
      for (let s = 1; s < pts.length; s++) {
        const a = pts[s - 1]!;
        const b = pts[s]!;
        const seg = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (end >= 0.999 && acc + seg > cut) {
          const f = clamp((cut - acc) / seg, 0, 1);
          g.lineTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f);
          cut = -1;
          break;
        }
        g.lineTo(b[0], b[1]);
        acc += seg;
      }
      g.stroke();
      g.restore();
      if (end >= 0.999) {
        const tip = bez(e.b, 1);
        g.save();
        g.globalAlpha = alpha;
        drawArrowHead(g, tip[0], tip[1], bezAngle(e.b, 0.985), headLen, col);
        g.restore();
      }
    }

    /* -------------------------------------------------------------- */
    /* Graph zeichnen                                                  */
    /* -------------------------------------------------------------- */

    let lastNodes: Node[] = [];

    function drawGraph(g: CanvasRenderingContext2D, R: Rect, m: Model): void {
      const t = th();
      drawCard(g, R, t, t.series[0]);
      const narrowFont0 = R.w < 340 ? 11 : 12;
      // Geschichte oben (umbrochen), darunter der Graph
      const story = m.story ? m.story : tr('stepN', { n: fmt.num(p.n, 0) });
      const storyLines = wrap(g, story, R.w - 28, `500 ${narrowFont0}px ${t.font}`);
      storyLines.forEach((ln, k) => text(g, ln, R.x + 14, R.y + 16 + k * (narrowFont0 + 4), { font: `500 ${narrowFont0}px ${t.font}`, color: t.muted, align: 'left' }));
      const gr: Rect = { x: R.x, y: R.y + 6 + storyLines.length * (narrowFont0 + 4), w: R.w, h: R.h - 6 - storyLines.length * (narrowFont0 + 4) - 18 };
      const nodes = nodesFor(gr, m.k);
      lastNodes = nodes;
      const edges = edgesFor(nodes, m.m, gr);
      const intro = introTw.value;
      const x = shownState() ?? m.x0;
      const tot = total(x);
      const ref = m.unit === 'share' ? 1 : maxVal;
      const narrowFont = R.w < 340 ? 11 : 12;


      // Gewählter Eintrag (Pfeil j → i)
      const si = cellI();
      const sj = cellJ();
      const pickOn = p.view === 'pow' || hoverCell !== null || pickTw.running;
      const hi = hoverCell ?? [si, sj];

      // Pfeile (Fluss bzw. Wahrscheinlichkeit)
      const flowRef = Math.max(1e-9, Math.abs(tot));
      const xFrom = stateOf(fromN) ?? x;
      edges.forEach((e, idx) => {
        const prob = m.m[e.to]![e.from]!;
        const flow = Math.abs(prob * (xFrom[e.from] ?? 0)) / flowRef;
        const wBase = p.flow ? 1.6 + 11 * clamp(flow, 0, 1) : 1.6 + 5 * clamp(Math.abs(prob), 0, 1);
        const isPick = pickOn && e.to === hi[0] && e.from === hi[1];
        const col = color(e.from);
        const delay = idx * 0.04;
        const grow = clamp((intro - 0.25 - delay) / 0.55, 0, 1);
        const dim = pickOn && !isPick && p.view !== 'step' ? 0.35 : pickOn && !isPick ? 0.55 : 0.85;
        drawEdge(g, e, col, isPick ? wBase + 2 : wBase, dim, grow, isPick);
      });

      // Teilchen während eines Schritts
      if (stepTw.running && Math.abs(toN - fromN) === 1) {
        const a = stateOf(Math.min(fromN, toN));
        const back = toN < fromN;
        if (a) {
          const tt = stepTw.t;
          edges.forEach((e, idx) => {
            const amount = Math.abs(m.m[e.to]![e.from]! * (a[e.from] ?? 0)) / flowRef;
            if (amount < 1e-4) return;
            const count = clamp(Math.round(amount * 26), 1, 10);
            const col = color(e.from);
            for (let c = 0; c < count; c++) {
              const d = (c / count) * 0.38 + (idx % 3) * 0.02;
              let s = clamp((tt - d) / 0.6, 0, 1);
              if (s <= 0 || s >= 1) continue;
              s = ease.inOutCubic(s);
              const q = bez(e.b, back ? 1 - s : s);
              g.save();
              g.fillStyle = col;
              g.shadowColor = withAlpha(col, 0.6);
              g.shadowBlur = 6;
              g.globalAlpha = Math.sin(Math.PI * s) * 0.9 + 0.1;
              g.beginPath();
              g.arc(q[0], q[1], 4 + amount * 5, 0, Math.PI * 2);
              g.fill();
              g.restore();
            }
          });
        }
      }

      // Beschriftungen der Pfeile
      if (p.lab) {
        edges.forEach((e, idx) => {
          const grow = clamp((intro - 0.45 - idx * 0.03) / 0.4, 0, 1);
          if (grow <= 0) return;
          const prob = m.m[e.to]![e.from]!;
          const isPick = pickOn && e.to === hi[0] && e.from === hi[1];
          let q = bez(e.b, e.loop ? 0.5 : 0.45);
          if (e.loop) {
            const c = nodes[e.from]!.c;
            const ang = Math.atan2(q[1] - c[1], q[0] - c[0]);
            q = [q[0] + Math.cos(ang) * 9, q[1] + Math.sin(ang) * 9];
          }
          const s = probText(prob, 2);
          const font = `${isPick ? 700 : 600} ${R.w < 340 ? 11 : 12}px ${t.font}`;
          g.save();
          g.font = font;
          const tw = g.measureText(s).width + 10;
          g.globalAlpha = grow;
          g.fillStyle = t.dark ? '#141b26' : '#ffffff';
          g.strokeStyle = withAlpha(color(e.from), isPick ? 0.95 : 0.45);
          g.lineWidth = isPick ? 2 : 1;
          roundRect(g, q[0] - tw / 2, q[1] - 9, tw, 18, 9);
          g.fill();
          g.stroke();
          g.restore();
          g.save();
          g.globalAlpha = grow;
          text(g, s, q[0], q[1] + 0.5, { font, color: isPick ? color(e.from) : t.text });
          g.restore();
        });
      }

      // Knoten
      const fixed = m.info.fixed;
      nodes.forEach((nd, i) => {
        const pop = clamp((intro - i * 0.08) / 0.5, 0, 1);
        if (pop <= 0) return;
        const r = nd.r * Math.max(0, ease.outBack(pop));
        if (r < 4) return;
        const col = color(i);
        const v = x[i] ?? 0;
        const neg = v < -1e-9;
        const frac = clamp(Math.abs(v) / ref, 0, 1);
        const [cx, cy] = nd.c;
        // Schatten und Grundfläche
        g.save();
        softShadow(g, t.dark, 16, 5);
        g.fillStyle = t.dark ? '#1b2433' : '#ffffff';
        g.beginPath();
        g.arc(cx, cy, r, 0, Math.PI * 2);
        g.fill();
        g.restore();
        // Füllstand
        g.save();
        g.beginPath();
        g.arc(cx, cy, r - 2, 0, Math.PI * 2);
        g.clip();
        const level = cy + r - 2 * r * (neg ? 0 : frac);
        const grad = g.createLinearGradient(0, level, 0, cy + r);
        grad.addColorStop(0, withAlpha(col, t.dark ? 0.55 : 0.42));
        grad.addColorStop(1, withAlpha(col, t.dark ? 0.85 : 0.72));
        g.fillStyle = grad;
        // leichte Welle an der Oberfläche
        const wave = stepTw.running ? Math.sin(performance.now() / 160 + i) * 2.2 : 0;
        g.beginPath();
        g.moveTo(cx - r, cy + r);
        g.lineTo(cx - r, level + wave);
        g.quadraticCurveTo(cx, level - wave * 1.5, cx + r, level - wave);
        g.lineTo(cx + r, cy + r);
        g.closePath();
        g.fill();
        // Ziel (stabile Verteilung) als gestrichelte Linie
        if (fixed && (p.view === 'fix' || p.view === 'step') && m.unit === 'share' && m.stochastic) {
          const fl = cy + r - 2 * r * clamp(fixed[i]!, 0, 1);
          g.setLineDash([5, 4]);
          g.strokeStyle = withAlpha(col, 0.95);
          g.lineWidth = 1.6;
          g.beginPath();
          g.moveTo(cx - r, fl);
          g.lineTo(cx + r, fl);
          g.stroke();
          g.setLineDash([]);
        }
        g.restore();
        // Rand
        const isSel = hover === i || (pickOn && (hi[0] === i || hi[1] === i));
        g.save();
        g.strokeStyle = neg ? t.series[1]! : col;
        g.lineWidth = isSel ? 3.5 : 2.4;
        if (neg) g.setLineDash([5, 4]);
        g.beginPath();
        g.arc(cx, cy, r, 0, Math.PI * 2);
        g.stroke();
        g.restore();
        // Kurzzeichen oben im Kreis, Wert darunter
        const big = r > 34 ? 15 : 13;
        text(g, m.short[i]!, cx, cy - r * 0.32, { font: `700 ${big}px ${t.font}`, color: col });
        const val = valueText(v, m, m.unit === 'share' ? 1 : Math.abs(v) < 100 ? 1 : 0);
        g.save();
        g.font = `700 ${big}px ${t.font}`;
        g.lineWidth = 4;
        g.strokeStyle = t.dark ? 'rgba(20,27,38,0.75)' : 'rgba(255,255,255,0.85)';
        g.lineJoin = 'round';
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.strokeText(val, cx, cy + r * 0.2);
        g.fillStyle = neg ? t.series[1]! : t.text;
        g.fillText(val, cx, cy + r * 0.2);
        g.restore();
        // Name unter bzw. über dem Knoten
        // Name: neben dem Kreis, wenn die Schleife nach oben zeigt, sonst darüber bzw. darunter
        if (m.k === 3 && i === 0) text(g, m.names[i]!, cx + r + 10, cy, { font: `600 ${narrowFont}px ${t.font}`, color: t.muted, align: 'left' });
        else if (m.k === 4 && i < 2) text(g, m.names[i]!, cx, cy - r - 10, { font: `600 ${narrowFont}px ${t.font}`, color: t.muted });
        else text(g, m.names[i]!, cx, cy + r + 13, { font: `600 ${narrowFont}px ${t.font}`, color: t.muted });
      });

      // Summe unten
      if (m.stochastic) {
        const s = m.unit === 'share' ? `${fmt.num(tot * 100, 1)} %` : `${fmt.num(tot, 1)}${m.unitName ? ` ${m.unitName}` : ''}`;
        text(g, tr('sumKeep', { t: s }), R.x + R.w - 12, R.y + R.h - 12, { font: `500 ${narrowFont}px ${t.font}`, color: t.muted, align: 'right' });
      } else {
        text(g, tr('total', { t: fmt.num(tot, 1) }), R.x + R.w - 12, R.y + R.h - 12, { font: `600 ${narrowFont}px ${t.font}`, color: t.muted, align: 'right' });
      }
    }

    /* -------------------------------------------------------------- */
    /* Matrizen und Vektoren als Bild                                  */
    /* -------------------------------------------------------------- */

    interface Cell {
      s: string;
      color?: string;
      bold?: boolean;
      bg?: string;
      key?: [number, number];
    }
    interface MatBox {
      w: number;
      h: number;
      colW: number[];
      rowH: number;
    }
    let cellRects: { r: Rect; i: number; j: number }[] = [];

    function measureMat(g: CanvasRenderingContext2D, cells: Cell[][], size: number): MatBox {
      g.save();
      g.font = `600 ${size}px ${th().font}`;
      const cols = cells[0]?.length ?? 0;
      const colW = Array.from({ length: cols }, (_, j) => Math.max(...cells.map((row) => g.measureText(row[j]!.s).width)) + size * 0.9);
      g.restore();
      const rowH = size * 1.6;
      return { w: colW.reduce((a, b) => a + b, 0) + size * 0.9, h: rowH * cells.length + size * 0.4, colW, rowH };
    }

    function drawMat(g: CanvasRenderingContext2D, cells: Cell[][], box: MatBox, x: number, y: number, size: number, opts: { colHead?: Cell[]; rowHead?: Cell[]; alpha?: number } = {}): void {
      const t = th();
      g.save();
      g.globalAlpha = opts.alpha ?? 1;
      // Klammern
      const br = size * 0.45;
      g.strokeStyle = t.text;
      g.lineWidth = 1.6;
      g.lineCap = 'round';
      const y0 = y + 2;
      const y1 = y + box.h - 2;
      g.beginPath();
      g.moveTo(x + br, y0);
      g.quadraticCurveTo(x, y0, x, y0 + br * 1.3);
      g.lineTo(x, y1 - br * 1.3);
      g.quadraticCurveTo(x, y1, x + br, y1);
      g.moveTo(x + box.w - br, y0);
      g.quadraticCurveTo(x + box.w, y0, x + box.w, y0 + br * 1.3);
      g.lineTo(x + box.w, y1 - br * 1.3);
      g.quadraticCurveTo(x + box.w, y1, x + box.w - br, y1);
      g.stroke();
      // Einträge
      let cx = x + size * 0.45;
      box.colW.forEach((cw, j) => {
        cells.forEach((row, i) => {
          const c = row[j]!;
          const cy = y + size * 0.2 + i * box.rowH + box.rowH / 2;
          if (c.bg) {
            g.fillStyle = c.bg;
            roundRect(g, cx + 1, cy - box.rowH / 2 + 1, cw - 2, box.rowH - 2, 6);
            g.fill();
          }
          if (c.key) cellRects.push({ r: { x: cx, y: cy - box.rowH / 2, w: cw, h: box.rowH }, i: c.key[0], j: c.key[1] });
          text(g, c.s, cx + cw / 2, cy + 0.5, { font: `${c.bold ? 700 : 500} ${size}px ${t.font}`, color: c.color ?? t.text });
        });
        if (opts.colHead) {
          const h = opts.colHead[j]!;
          text(g, h.s, cx + cw / 2, y - size * 0.75, { font: `700 ${size - 1}px ${t.font}`, color: h.color ?? t.muted });
        }
        cx += cw;
      });
      if (opts.rowHead) {
        cells.forEach((_, i) => {
          const h = opts.rowHead![i]!;
          const cy = y + size * 0.2 + i * box.rowH + box.rowH / 2;
          text(g, h.s, x - size * 0.55, cy, { font: `700 ${size - 1}px ${t.font}`, color: h.color ?? t.muted, align: 'right' });
        });
      }
      g.restore();
    }

    /** Text mit Indizes (x_n …) links ausgerichtet; liefert die Breite. */
    function sub(g: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, color: string, weight = 600, align: CanvasTextAlign = 'left'): number {
      return subText(g, s, x, y, { size, family: th().font, color, weight, align, baseline: 'middle' });
    }

    function wrap(g: CanvasRenderingContext2D, s: string, maxW: number, font: string): string[] {
      g.save();
      g.font = font;
      const words = s.split(' ');
      const lines: string[] = [];
      let line = '';
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (g.measureText(test).width > maxW && line) {
          lines.push(line);
          line = w;
        } else line = test;
      }
      if (line) lines.push(line);
      g.restore();
      return lines;
    }

    function paragraph(g: CanvasRenderingContext2D, s: string, x: number, y: number, maxW: number, size: number, color: string, weight = 500): number {
      const font = `${weight} ${size}px ${th().font}`;
      const lines = wrap(g, s, maxW, font);
      lines.forEach((ln, k) => text(g, ln, x, y + k * size * 1.35, { font, color, align: 'left' }));
      return lines.length * size * 1.35;
    }

    /* -------------------------------------------------------------- */
    /* Karte mit der Rechnung                                          */
    /* -------------------------------------------------------------- */

    function headCells(m: Model): Cell[] {
      return m.short.map((s, i) => ({ s, color: color(i) }));
    }

    function vecCells(x: Vec | null, m: Model, dec: number, colorize = true): Cell[][] {
      return m.short.map((_, i) => [{ s: x ? valueText(x[i]!, m, dec) : '?', color: x && x[i]! < -1e-9 ? th().series[1] : colorize ? color(i) : undefined, bold: true }]);
    }

    function drawCardTitle(g: CanvasRenderingContext2D, R: Rect, title: string): number {
      const t = th();
      const size = R.w < 340 ? 13 : 14;
      sub(g, title, R.x + 16, R.y + 20, size, t.text, 700);
      return R.y + 38;
    }

    /** Legt Teile nebeneinander und verkleinert die Schrift, bis alles passt. */
    function fitSize(R: Rect, build: (size: number) => number, start: number, min = 10): number {
      for (let s = start; s > min; s -= 0.5) if (build(s) <= R.w - 32) return s;
      return min;
    }

    function drawStepCard(g: CanvasRenderingContext2D, R: Rect, m: Model): void {
      const t = th();
      let y = drawCardTitle(g, R, tr('stepTitle'));
      const n = toN;
      const xn = stateOf(n);
      const xn1 = stateOf(n + 1);
      const si = cellI();
      const sj = cellJ();
      const hi = hoverCell;
      const dec = m.unit === 'share' ? 1 : 1;
      const mCells = (): Cell[][] =>
        m.m.map((row, i) =>
          row.map((v, j) => ({
            s: probText(v, 3),
            key: [i, j] as [number, number],
            bold: hi ? hi[0] === i && hi[1] === j : false,
            bg: hi && hi[0] === i && hi[1] === j ? withAlpha(color(j), t.dark ? 0.3 : 0.18) : hi && hi[0] === i ? withAlpha(t.text, 0.05) : undefined,
            color: hi && hi[0] === i && hi[1] === j ? color(j) : undefined,
          })),
        );
      const measureAll = (size: number) => {
        const a = measureMat(g, mCells(), size);
        const b = measureMat(g, vecCells(xn, m, dec), size);
        const c = measureMat(g, vecCells(xn1, m, dec), size);
        return { a, b, c, w: size * 1.4 + a.w + size * 1.4 + b.w + size * 1.6 + c.w };
      };
      const size = fitSize(R, (s) => measureAll(s).w, R.w < 340 ? 13 : 15);
      const { a, b, c, w } = measureAll(size);
      const top = y + size * 2.3;
      let x = R.x + (R.w - w) / 2 + size * 1.2;
      // Spaltenköpfe: von
      text(g, tr('from'), x + a.w / 2, top - size * 1.85, { font: `500 ${size - 2}px ${t.font}`, color: t.muted });
      drawMat(g, mCells(), a, x, top, size, { colHead: headCells(m), rowHead: headCells(m) });
      x += a.w + size * 0.7;
      text(g, '·', x, top + a.h / 2, { font: `700 ${size + 4}px ${t.font}`, color: t.text });
      x += size * 0.7;
      sub(g, `x_{${fmt.num(n, 0)}}`, x + b.w / 2, top - size * 0.75, size - 1, t.muted, 700, 'center');
      drawMat(g, vecCells(xn, m, dec), b, x, top, size);
      x += b.w + size * 0.8;
      text(g, '=', x, top + a.h / 2, { font: `700 ${size + 2}px ${t.font}`, color: t.text });
      x += size * 0.8;
      sub(g, `x_{${fmt.num(n + 1, 0)}}`, x + c.w / 2, top - size * 0.75, size - 1, t.muted, 700, 'center');
      drawMat(g, vecCells(xn1, m, dec), c, x, top, size);
      y = top + Math.max(a.h, b.h) + size * 0.9;

      // Eine Zeile ausgerechnet (gewählte Zeile i)
      const row = hi ? hi[0] : si;
      if (xn && xn1) {
        const parts = m.m[row]!.map((v, j) => `${probText(v, 3)} · ${valueText(xn[j]!, m, dec)}`);
        const line = `${m.short[row]}: ${parts.join(' + ')} = ${valueText(xn1[row]!, m, dec)}`;
        const font = `600 ${size - 1}px ${t.font}`;
        g.save();
        g.font = font;
        const lw = g.measureText(line).width;
        g.restore();
        if (lw <= R.w - 32) {
          text(g, line, R.x + R.w / 2, y, { font, color: color(row) });
          y += size * 1.6;
        } else y += paragraph(g, line, R.x + 16, y, R.w - 32, size - 1, color(row), 600) + size * 0.4;
      }
      // Erklärung des gewählten Eintrags
      const ci = hi ? hi[0] : si;
      const cj = hi ? hi[1] : sj;
      if (y < R.y + R.h - 20) {
        const v = m.m[ci]![cj]!;
        const msg = `M${sub2(ci, cj)} = ${probText(v, 3)}: ${tr('cellText1', { i: m.names[ci]!, j: m.names[cj]! })}`;
        paragraph(g, msg, R.x + 16, y, R.w - 32, size - 2, t.muted);
      }
    }

    /** Index „₁₂“ für einen Eintrag (1-basiert). */
    function sub2(i: number, j: number): string {
      const d = '₀₁₂₃₄₅₆₇₈₉';
      return `${d[i + 1]}${d[j + 1]}`;
    }

    function drawPowCard(g: CanvasRenderingContext2D, R: Rect, m: Model): void {
      const t = th();
      let y = drawCardTitle(g, R, tr('powTitle').replace('^n', `^${fmt.num(toN, 0)}`));
      const n = toN;
      const mp = matPow(m.m, n);
      const si = cellI();
      const sj = cellJ();
      const sel = hoverCell ?? [si, sj];
      if (!mp) {
        paragraph(g, tr('invNone'), R.x + 16, y + 6, R.w - 32, 13, t.series[1]!);
        return;
      }
      const cells: Cell[][] = mp.map((row, i) =>
        row.map((v, j) => {
          const on = sel[0] === i && sel[1] === j;
          return { s: probText(v, 3), key: [i, j] as [number, number], bold: on, color: on ? color(j) : undefined, bg: on ? withAlpha(color(j), t.dark ? 0.32 : 0.18) : undefined };
        }),
      );
      const size = fitSize(R, (s) => measureMat(g, cells, s).w + s * 6, R.w < 340 ? 14 : 16);
      const box = measureMat(g, cells, size);
      const top = y + size * 2.3;
      const x = R.x + (R.w - box.w) / 2 + size;
      text(g, tr('from'), x + box.w / 2, top - size * 1.85, { font: `500 ${size - 2}px ${t.font}`, color: t.muted });
      text(g, tr('to'), x - size * 1.9, top + box.h / 2, { font: `500 ${size - 2}px ${t.font}`, color: t.muted, align: 'right' });
      // Auftakt: Eintrag ploppt
      const pop = pickTw.running ? pickTw.value : 1;
      g.save();
      drawMat(g, cells, box, x, top, size, { colHead: headCells(m), rowHead: headCells(m), alpha: 0.5 + 0.5 * pop });
      g.restore();
      y = top + box.h + size;
      const v = mp[sel[0]]![sel[1]]!;
      const msg = `${fmt.num(n, 0) === '1' ? tr('cellText1', { i: m.names[sel[0]]!, j: m.names[sel[1]]! }) : tr('cellText', { n: fmt.num(n, 0), i: m.names[sel[0]]!, j: m.names[sel[1]]! })}: ${probText(v, 3)}`;
      y += paragraph(g, msg, R.x + 16, y, R.w - 32, size - 2, color(sel[1]), 600) + 4;
      // Wege auflisten (nur für stochastische Matrizen und kleine n)
      if (n >= 1 && n <= 4 && y < R.y + R.h - 30) {
        const list = paths(m.m, sel[1], sel[0], n);
        const room = Math.max(0, Math.floor((R.y + R.h - 16 - y) / ((size - 2) * 1.35)) - 1);
        text(g, tr('paths', { n: fmt.num(n, 0) }), R.x + 16, y, { font: `600 ${size - 2}px ${t.font}`, color: t.muted, align: 'left' });
        y += (size - 2) * 1.35;
        if (list.length === 0) text(g, tr('noPaths'), R.x + 16, y, { font: `500 ${size - 2}px ${t.font}`, color: t.muted, align: 'left' });
        const show = list.slice(0, Math.max(1, Math.min(room, 4)));
        show.forEach((pth, k) => {
          const route = pth.path.map((s) => m.short[s]).join(' → ');
          const factors = pth.path.slice(1).map((s, q) => probText(m.m[s]![pth.path[q]!]!, 3)).join(' · ');
          const line = `${route}:  ${factors} = ${fmt.num(pth.p, 4)}`;
          text(g, line, R.x + 16, y + k * (size - 2) * 1.35, { font: `500 ${size - 2}px ${t.font}`, color: k === 0 ? t.text : t.muted, align: 'left' });
        });
        if (list.length > show.length) text(g, tr('pathsMore', { k: list.length - show.length }), R.x + 16, y + show.length * (size - 2) * 1.35, { font: `500 ${size - 2}px ${t.font}`, color: t.muted, align: 'left' });
      }
    }

    function drawFixCard(g: CanvasRenderingContext2D, R: Rect, m: Model): void {
      const t = th();
      let y = drawCardTitle(g, R, tr('fixTitle'));
      const info = m.info;
      const size = R.w < 340 ? 12 : 13;
      if (info.kind === 'regular' && info.fixed) {
        text(g, tr('fixEq'), R.x + 16, y + 2, { font: `500 ${size}px ${t.font}`, color: t.muted, align: 'left' });
        y += size * 1.9;
        const cells: Cell[][] = info.fixed.map((v, i) => [{ s: fracText(v), color: color(i), bold: true }]);
        const box = measureMat(g, cells, size + 2);
        const x = R.x + 16 + 30;
        sub(g, 'x* =', R.x + 16, y + box.h / 2, size + 1, t.text, 700);
        drawMat(g, cells, box, x + 6, y, size + 2, { rowHead: undefined });
        // daneben in Prozent bzw. Anzahl
        const tot = total(m.x0);
        info.fixed.forEach((v, i) => {
          const s = m.unit === 'share' ? `≈ ${fmt.num(v * 100, 1)} %` : `→ ${fmt.num(v * tot, 1)}`;
          const cy = y + (size + 2) * 0.2 + i * box.rowH + box.rowH / 2;
          text(g, `${m.short[i]}  ${s}`, x + 6 + box.w + 14, cy, { font: `600 ${size}px ${t.font}`, color: color(i), align: 'left' });
        });
        y += box.h + size;
        paragraph(g, tr('regular'), R.x + 16, y, R.w - 32, size - 1, t.muted);
        return;
      }
      if (info.kind === 'absorbing' && info.limit) {
        text(g, tr('limitTitle'), R.x + 16, y + 2, { font: `600 ${size}px ${t.font}`, color: t.muted, align: 'left' });
        y += size * 2.2;
        const cells: Cell[][] = info.limit.map((row) => row.map((v, j) => ({ s: probText(v, 3), color: Math.abs(v) > 1e-9 ? color(j) : t.muted })));
        const box = measureMat(g, cells, size + 1);
        const x = R.x + (R.w - box.w) / 2 + size;
        drawMat(g, cells, box, x, y, size + 1, { colHead: headCells(m), rowHead: headCells(m) });
        y += box.h + size * 0.9;
        paragraph(g, tr('absorbText'), R.x + 16, y, R.w - 32, size - 1, t.muted);
        return;
      }
      if (info.kind === 'periodic') {
        paragraph(g, info.period ? tr('periodText', { p: info.period }) : tr('periodText0'), R.x + 16, y + 4, R.w - 32, size, t.text, 600);
        return;
      }
      // Population
      y += paragraph(g, tr('popText'), R.x + 16, y + 4, R.w - 32, size, t.text, 600) + 10;
      if (info.period) {
        const sup = String(info.period).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]!);
        paragraph(g, tr('cycleText', { p: info.period }).replace(`M^${info.period}`, `M${sup}`), R.x + 16, y, R.w - 32, size, t.series[2]!, 600);
        return;
      }
      const gf = growthFactorOf(m);
      if (gf !== null) paragraph(g, tr('growth', { f: fmt.num(gf, 3) }), R.x + 16, y, R.w - 32, size - 1, t.muted);
    }

    let gfCache: { key: string; v: number | null } = { key: '', v: null };
    function growthFactorOf(m: Model): number | null {
      const key = JSON.stringify([m.m, m.x0]);
      if (gfCache.key !== key) {
        let x = m.x0;
        const totals = [total(x)];
        for (let k = 0; k < 240; k++) {
          x = mulMV(m.m, x);
          totals.push(total(x));
        }
        const a = totals[totals.length - 13]!;
        const b = totals[totals.length - 1]!;
        gfCache = { key, v: a > 0 && b > 0 ? Math.pow(b / a, 1 / 12) : null };
      }
      return gfCache.v;
    }

    function drawBackCard(g: CanvasRenderingContext2D, R: Rect, m: Model): void {
      const t = th();
      let y = drawCardTitle(g, R, tr('backTitle'));
      if (!m.inv) {
        paragraph(g, tr('invNone'), R.x + 16, y + 6, R.w - 32, 13, t.series[1]!, 600);
        return;
      }
      const n = toN;
      const xn = stateOf(n);
      const xp = stateOf(n - 1);
      const invCells: Cell[][] = m.inv.map((row) => row.map((v) => ({ s: fmt.num(v, 3), color: v < -1e-9 ? t.series[1] : undefined })));
      const measureAll = (size: number) => {
        const a = measureMat(g, invCells, size);
        const b = measureMat(g, vecCells(xn, m, 1), size);
        const c = measureMat(g, vecCells(xp, m, 1), size);
        return { a, b, c, w: a.w + size * 1.4 + b.w + size * 1.6 + c.w };
      };
      const size = fitSize(R, (s) => measureAll(s).w, R.w < 340 ? 13 : 15);
      const { a, b, c, w } = measureAll(size);
      const top = y + size * 1.3;
      let x = R.x + (R.w - w) / 2;
      sub(g, 'M⁻¹', x + a.w / 2, top - size * 0.75, size - 1, t.muted, 700, 'center');
      drawMat(g, invCells, a, x, top, size);
      x += a.w + size * 0.7;
      text(g, '·', x, top + a.h / 2, { font: `700 ${size + 4}px ${t.font}`, color: t.text });
      x += size * 0.7;
      sub(g, `x_{${fmt.num(n, 0)}}`, x + b.w / 2, top - size * 0.75, size - 1, t.muted, 700, 'center');
      drawMat(g, vecCells(xn, m, 1), b, x, top, size);
      x += b.w + size * 0.8;
      text(g, '=', x, top + a.h / 2, { font: `700 ${size + 2}px ${t.font}`, color: t.text });
      x += size * 0.8;
      sub(g, `x_{${fmt.num(n - 1, 0)}}`, x + c.w / 2, top - size * 0.75, size - 1, t.muted, 700, 'center');
      drawMat(g, vecCells(xp, m, 1), c, x, top, size);
      y = top + a.h + size * 0.9;
      const neg = xp ? xp.some((v) => v < -1e-9) : false;
      paragraph(g, neg ? tr('negWarn') : tr('invOk'), R.x + 16, y, R.w - 32, size - 2, neg ? t.series[1]! : t.muted, neg ? 600 : 500);
    }

    /* -------------------------------------------------------------- */
    /* Diagramm: Verlauf über die Schritte                             */
    /* -------------------------------------------------------------- */

    let chartRect: Rect = { x: 0, y: 0, w: 10, h: 10 };
    const plot = new Plot(surface, {
      x: [0, 10],
      y: [0, 1],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: () => ({ x: chartRect.x + 6, y: chartRect.y + 26, w: chartRect.w - 12, h: chartRect.h - 32 }),
      xAxis: { label: 'n', format: (v: number) => fmt.num(v, 0) },
      yAxis: { label: '', format: (v: number) => (model.ok && model.unit === 'share' ? `${fmt.num(v * 100, 0)} %` : fmt.num(v, 0)) },
    });

    function drawChart(g: CanvasRenderingContext2D, R: Rect, m: Model): void {
      const t = th();
      chartRect = R;
      drawCard(g, R, t);
      text(g, tr('chartTitle'), R.x + 14, R.y + 15, { font: `600 ${R.w < 340 ? 12 : 13}px ${t.font}`, color: t.text, align: 'left' });
      const n0 = Math.min(0, toN, fromN);
      const n1 = clamp(Math.max(14, toN + 2, fromN + 2), 2, MAX_N + 1);
      let lo = 0;
      let hi = m.unit === 'share' ? 1 : 0;
      for (let n = n0; n <= n1; n++) {
        const v = stateOf(n);
        if (!v) continue;
        for (const e of v) {
          lo = Math.min(lo, e);
          hi = Math.max(hi, e);
        }
      }
      if (hi - lo < 1e-9) hi = lo + 1;
      plot.setRangePadded([n0, n1], [lo, hi], { left: 46, bottom: 26, top: 12, right: 14 });
      plot.resize();
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      // Stabile Verteilung als gestrichelte Linien
      const info = m.info;
      if (info.fixed && info.kind === 'regular') {
        const tot = total(m.x0);
        info.fixed.forEach((v, i) => plot.hline(m.unit === 'share' ? v : v * tot, { color: withAlpha(color(i), 0.7), width: 1.4, dash: [6, 5] }));
      }
      // Linien bis zum angezeigten n
      const until = shownN();
      for (let i = 0; i < m.k; i++) {
        const pts: P[] = [];
        for (let n = n0; n <= n1; n++) {
          const v = stateOf(n);
          if (!v) continue;
          pts.push([n, v[i]!]);
        }
        // Zukunft blass, Vergangenheit kräftig
        plot.polyline(pts, { color: withAlpha(color(i), 0.25), width: 1.5 });
        const done = pts.filter((q) => q[0] <= until + 1e-9);
        if (done.length > 1) plot.polyline(done, { color: color(i), width: 2.4 });
        // Teilstück bis zum überblendeten Punkt
        const last = done[done.length - 1];
        const nextP = pts.find((q) => q[0] > until + 1e-9);
        if (last && nextP && stepTw.running) {
          const f = clamp((until - last[0]) / (nextP[0] - last[0]), 0, 1);
          plot.segment(last, [lerp(last[0], nextP[0], f), lerp(last[1], nextP[1], f)], { color: color(i), width: 2.4 });
        }
        for (const q of done) plot.point(q[0], q[1], { color: color(i), radius: q[0] === toN ? 4.5 : 2.6 });
      }
      // Marke beim aktuellen n
      plot.vline(until, { color: withAlpha(t.text, 0.45), width: 1.2, dash: [3, 4] });
      plot.end();
    }

    /* -------------------------------------------------------------- */
    /* Bedienung: antippen                                             */
    /* -------------------------------------------------------------- */

    function hitNode(px: number, py: number): number | null {
      for (let i = 0; i < lastNodes.length; i++) {
        const nd = lastNodes[i]!;
        if (Math.hypot(px - nd.c[0], py - nd.c[1]) <= nd.r + 6) return i;
      }
      return null;
    }
    function hitCell(px: number, py: number): [number, number] | null {
      for (const c of cellRects) if (px >= c.r.x && px <= c.r.x + c.r.w && py >= c.r.y && py <= c.r.y + c.r.h) return [c.i, c.j];
      return null;
    }

    function tapState(i: number): void {
      if (ctx.locked || !model.ok) return;
      stopRun();
      ctx.set({ st: String(i + 1) as '1', n: 0 });
    }
    function tapCell(i: number, j: number): void {
      if (ctx.locked || !model.ok) return;
      ctx.set({ ci: i + 1, cj: j + 1 });
      pickTw.play();
      ctx.requestRender();
    }

    new TapTarget(surface, {
      hit: (px, py) => {
        const c = hitCell(px, py);
        if (c) return `c${c[0]}${c[1]}`;
        const nd = hitNode(px, py);
        return nd === null ? null : `n${nd}`;
      },
      onTap: (id) => {
        if (id.startsWith('n')) tapState(Number(id.slice(1)));
        else tapCell(Number(id[1]), Number(id[2]));
      },
      onHover: (id) => {
        const nh = id && id.startsWith('n') ? Number(id.slice(1)) : null;
        const ch: [number, number] | null = id && id.startsWith('c') ? [Number(id[1]), Number(id[2])] : null;
        if (nh !== hover || JSON.stringify(ch) !== JSON.stringify(hoverCell)) {
          hover = nh;
          hoverCell = ch;
          ctx.requestRender();
        }
      },
    });

    function updateKeyTargets(): void {
      if (!model.ok) return ctx.setKeyTargets([]);
      const m = model;
      const targets = lastNodes.map((nd, i) => ({
        id: `n${i}`,
        label: tr('tapState', { s: m.names[i]! }),
        rect: { x: nd.c[0] - nd.r, y: nd.c[1] - nd.r, w: nd.r * 2, h: nd.r * 2 },
        disabled: ctx.locked,
        activate: () => tapState(i),
      }));
      const cells = cellRects.map((c) => ({
        id: `c${c.i}${c.j}`,
        label: `M${sub2(c.i, c.j)}`,
        rect: c.r,
        disabled: ctx.locked,
        activate: () => tapCell(c.i, c.j),
      }));
      ctx.setKeyTargets([...targets, ...cells]);
    }

    /* -------------------------------------------------------------- */
    /* Ergebnisse                                                      */
    /* -------------------------------------------------------------- */

    function vecHtml(x: Vec | null, m: Model): string {
      if (!x) return '–';
      return `(${x.map((v) => valueText(v, m, m.unit === 'share' ? 1 : 2)).join(' | ')})`;
    }

    function updateReadouts(): void {
      if (!model.ok) {
        ['xn', 'calc', 'cell', 'kind', 'fix'].forEach((k) => ctx.readout(k, null));
        return;
      }
      const m = model;
      const n = p.n;
      const xn = stateOf(n);
      ctx.readout('xn', { html: `<var>x</var><sub>${fmt.num(n, 0)}</sub> = ${vecHtml(xn, m)}` });
      if (p.view === 'step' || p.view === 'back') {
        const prev = stateOf(n - 1);
        ctx.readout(
          'calc',
          p.view === 'step'
            ? { html: `<var>x</var><sub>${fmt.num(n + 1, 0)}</sub> = <var>M</var> · <var>x</var><sub>${fmt.num(n, 0)}</sub> = ${vecHtml(stateOf(n + 1), m)}` }
            : m.inv
              ? { html: `<var>x</var><sub>${fmt.num(n - 1, 0)}</sub> = <var>M</var><sup>${MINUS}1</sup> · <var>x</var><sub>${fmt.num(n, 0)}</sub> = ${vecHtml(prev, m)}` }
              : tr('invNone'),
        );
      } else ctx.readout('calc', null);
      if (p.view === 'pow') {
        const mp = matPow(m.m, n);
        const i = cellI();
        const j = cellJ();
        ctx.readout('cell', mp ? { html: `(<var>M</var><sup>${fmt.num(n, 0)}</sup>)<sub>${i + 1}${j + 1}</sub> = ${probText(mp[i]![j]!, 4)} (${m.short[j]} → ${m.short[i]})` } : tr('invNone'));
      } else ctx.readout('cell', null);
      const info = m.info;
      ctx.readout('kind', info.kind === 'regular' ? tr('regularShort') : info.kind === 'absorbing' ? tr('absorbShort') : info.kind === 'periodic' ? tr('periodShort') : tr('popShort'));
      if (info.kind === 'regular' && info.fixed) {
        ctx.readout('fix', { html: `<var>x</var>* = (${info.fixed.map((v) => fracText(v)).join(' | ')})` });
      } else if (info.kind === 'absorbing' && info.limit) {
        const lim = mulMV(info.limit, m.x0);
        ctx.readout('fix', { html: `→ ${vecHtml(lim, m)}` });
      } else if (info.kind === 'population' && info.period) {
        const sup = String(info.period).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]!);
        ctx.readout('fix', tr('cycleText', { p: info.period }).replace(`M^${info.period}`, `M${sup}`));
      } else if (info.kind === 'population') {
        const gf = growthFactorOf(m);
        ctx.readout('fix', gf !== null ? tr('growth', { f: fmt.num(gf, 3) }) : null);
      } else ctx.readout('fix', tr('noFix'));
    }

    function updateActions(): void {
      const ok = model.ok;
      ctx.setAction('next', { enabled: ok && p.n < MAX_N });
      ctx.setAction('prev', { enabled: ok && p.n > MIN_N && (p.n > 0 || (model.ok && model.inv !== null)) });
      ctx.setAction('zero', { enabled: ok && p.n !== 0 });
      ctx.setAction('run', { enabled: ok && p.n < MAX_N });
    }

    /* -------------------------------------------------------------- */
    /* Zeichnen                                                        */
    /* -------------------------------------------------------------- */

    function drawBad(g: CanvasRenderingContext2D, msg: string): void {
      const t = th();
      const R: Rect = { x: 10, y: 10, w: surface.width - 20, h: surface.height - 20 };
      drawCard(g, R, t, t.series[1]);
      text(g, msg, R.x + R.w / 2, R.y + R.h / 2 - 10, { font: `600 15px ${t.font}`, color: t.series[1]! });
      text(g, '0,9 0,2; 0,1 0,8', R.x + R.w / 2, R.y + R.h / 2 + 16, { font: `500 13px ${t.font}`, color: t.muted });
    }

    function drawRightCard(g: CanvasRenderingContext2D, R: Rect, m: Model): void {
      const t = th();
      drawCard(g, R, t, t.series[p.view === 'fix' ? 2 : p.view === 'back' ? 1 : p.view === 'pow' ? 4 : 0]);
      g.save();
      g.beginPath();
      g.rect(R.x, R.y, R.w, R.h);
      g.clip();
      g.globalAlpha = viewTw.running ? viewTw.value : 1;
      if (p.view === 'step') drawStepCard(g, R, m);
      else if (p.view === 'pow') drawPowCard(g, R, m);
      else if (p.view === 'fix') drawFixCard(g, R, m);
      else drawBackCard(g, R, m);
      g.restore();
      // Hinweis auf fehlende Übergangsmatrix
      if (!m.stochastic && p.view !== 'fix') {
        text(g, tr('notStoch'), R.x + R.w - 14, R.y + R.h - 14, { font: `500 11px ${t.font}`, color: t.muted, align: 'right' });
      }
    }

    return {
      update(changed, source) {
        if (changed.has('sc') || changed.has('mx') || changed.has('x0') || changed.has('st') || source === 'init') {
          const scChanged = changed.has('sc') || changed.has('mx');
          rebuild();
          if (scChanged && source === 'input') {
            stopRun();
            ctx.set({ n: 0, st: 'mix' });
          }
          if (scChanged || source === 'init' || source === 'replace') introTw.play();
          fromN = p.n;
          toN = p.n;
        }
        if (changed.has('n')) {
          const next = p.n;
          if (next !== toN) {
            fromN = shownN();
            fromN = Math.round(fromN) === fromN ? fromN : toN;
            toN = next;
            if (source === 'replace' || source === 'init' || Math.abs(toN - fromN) > 1) {
              stepTw.play(source === 'replace' || source === 'init' ? 1 : 700);
            } else stepTw.play();
          }
        }
        if (changed.has('view')) viewTw.play();
        if (changed.has('ci') || changed.has('cj')) pickTw.play();
        if (source === 'replace') stopRun();
        updateReadouts();
        updateActions();
      },
      action(id) {
        if (ctx.locked || !model.ok) return;
        if (id === 'next') {
          stopRun();
          if (p.n < MAX_N) ctx.set({ n: p.n + 1 });
        } else if (id === 'prev') {
          stopRun();
          if (p.n > MIN_N) ctx.set({ n: p.n - 1 });
        } else if (id === 'zero') {
          stopRun();
          ctx.set({ n: 0 });
        } else if (id === 'run') {
          if (runTimer !== null) return stopRun();
          ctx.setAction('run', { label: ctx.lang === 'de' ? 'Anhalten' : 'Stop' });
          if (p.n >= 20) ctx.set({ n: 0 });
          runTimer = window.setTimeout(runStep, reduced ? 100 : 200);
        }
      },
      render() {
        const g = surface.begin();
        cellRects = [];
        if (!model.ok) {
          drawBad(g, model.message);
          ctx.setKeyTargets([]);
          return;
        }
        const m = model;
        const R = regions();
        drawGraph(g, R.graph, m);
        drawRightCard(g, R.card, m);
        if (R.chart) drawChart(g, R.chart, m);
        updateKeyTargets();
        if (stepTw.running || introTw.running || viewTw.running || pickTw.running) ctx.requestRender();
      },
      destroy() {
        stopRun();
        surface.destroy();
      },
    };
  },
});

