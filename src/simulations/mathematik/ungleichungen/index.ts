import { defineSimulation, drawArrowHead, Plot, prefersReducedMotion, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import {
  checkTask,
  combinedKind,
  countIntegers,
  holds,
  inCombined,
  inHalfPlane,
  inSolution,
  makeTask,
  REL_SYMBOL,
  SCENARIOS,
  scenarioAnswer,
  solve,
  steps,
  type Combined,
  type IneqTask,
  type Rel,
  type ScenarioId,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const X_RANGE: [number, number] = [-10, 10];

/**
 * Lineare Ungleichungen: beide Seiten als Geraden, Lösungsbereich farbig,
 * Lösungsmenge am Zahlenstrahl und die Umformungsschritte.
 */
export default defineSimulation({
  id: 'ungleichungen',
  animated: true,
  layout: { aspect: 1.25, aspectNarrow: 0.62 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        {
          value: 'loesen',
          label: L('Lösen: Geraden und Umformungen', 'Solve: lines and steps'),
        },
        {
          value: 'waage',
          label: L('Waage: Zahlen durchprobieren', 'Balance: try out numbers'),
        },
        {
          value: 'doppelt',
          label: L('Zwei Bedingungen: und/oder', 'Two conditions: and/or'),
        },
        {
          value: 'alltag',
          label: L('Alltag: Tarife, Sparen, Aufzug', 'Everyday: plans, saving, lift'),
        },
        {
          value: 'halbebene',
          label: L('Zwei Variablen: Halbebene', 'Two variables: half-plane'),
        },
        { value: 'ueben', label: L('Üben: Aufgaben', 'Practice: tasks') },
      ],
      default: 'loesen',
      display: 'menu',
    },
    {
      key: 'a',
      type: 'number',
      label: L('links: Faktor a vor x', 'left: coefficient a of x'),
      min: -5,
      max: 5,
      step: 0.5,
      default: 2,
      visibleIf: (v) => v.mode === 'loesen' || v.mode === 'waage',
    },
    {
      key: 'b',
      type: 'number',
      label: L('links: Zahl b', 'left: number b'),
      min: -10,
      max: 10,
      step: 0.5,
      default: 1,
      visibleIf: (v) => v.mode === 'loesen' || v.mode === 'waage',
    },
    {
      key: 'rel',
      type: 'choice',
      label: L('Zeichen', 'Sign'),
      options: [
        { value: 'lt', label: L('<', '<') },
        { value: 'le', label: L('≤', '≤') },
        { value: 'gt', label: L('>', '>') },
        { value: 'ge', label: L('≥', '≥') },
      ],
      default: 'lt',
      display: 'buttons',
      visibleIf: (v) => v.mode === 'loesen' || v.mode === 'waage' || v.mode === 'halbebene',
    },
    {
      key: 'c',
      type: 'number',
      label: L('rechts: Faktor c vor x', 'right: coefficient c of x'),
      min: -5,
      max: 5,
      step: 0.5,
      default: 0,
      visibleIf: (v) => v.mode === 'loesen' || v.mode === 'waage',
    },
    {
      key: 'd',
      type: 'number',
      label: L('rechts: Zahl d', 'right: number d'),
      min: -10,
      max: 10,
      step: 0.5,
      default: 7,
      visibleIf: (v) => v.mode === 'loesen' || v.mode === 'waage',
    },
    {
      key: 't',
      type: 'number',
      label: L('Probe: x einsetzen', 'Check: substitute x'),
      min: -10,
      max: 10,
      step: 0.5,
      default: 1,
      visibleIf: (v) => v.mode === 'loesen' || v.mode === 'waage',
    },
    /* Zwei Bedingungen */
    {
      key: 'lo',
      type: 'number',
      label: L('untere Grenze', 'lower bound'),
      min: -8,
      max: 8,
      step: 0.5,
      default: -2,
      visibleIf: (v) => v.mode === 'doppelt',
    },
    {
      key: 'lr',
      type: 'choice',
      label: L('Grenze unten', 'Lower bound'),
      options: [
        { value: 'lt', label: L('< (ohne Grenze)', '< (excluded)') },
        { value: 'le', label: L('≤ (mit Grenze)', '≤ (included)') },
      ],
      default: 'lt',
      display: 'buttons',
      visibleIf: (v) => v.mode === 'doppelt',
    },
    {
      key: 'hi',
      type: 'number',
      label: L('obere Grenze', 'upper bound'),
      min: -8,
      max: 8,
      step: 0.5,
      default: 3,
      visibleIf: (v) => v.mode === 'doppelt',
    },
    {
      key: 'hr',
      type: 'choice',
      label: L('Grenze oben', 'Upper bound'),
      options: [
        { value: 'lt', label: L('< (ohne Grenze)', '< (excluded)') },
        { value: 'le', label: L('≤ (mit Grenze)', '≤ (included)') },
      ],
      default: 'le',
      display: 'buttons',
      visibleIf: (v) => v.mode === 'doppelt',
    },
    {
      key: 'op',
      type: 'choice',
      label: L('Verknüpfung', 'Connective'),
      options: [
        { value: 'und', label: L('und (beides gilt)', 'and (both hold)') },
        { value: 'oder', label: L('oder (eins reicht)', 'or (one is enough)') },
      ],
      default: 'und',
      display: 'buttons',
      visibleIf: (v) => v.mode === 'doppelt',
    },
    /* Alltag */
    {
      key: 'sc',
      type: 'choice',
      label: L('Situation', 'Situation'),
      options: [
        {
          value: 'handy',
          label: L('Handytarif oder Flatrate', 'Phone plan or flat rate'),
        },
        { value: 'fitness', label: L('Zwei Fitnessstudios', 'Two gyms') },
        {
          value: 'sparen',
          label: L('Sparen für ein Fahrrad', 'Saving for a bike'),
        },
        { value: 'taxi', label: L('Taxi mit Budget', 'Taxi on a budget') },
        {
          value: 'aufzug',
          label: L('Aufzug mit Höchstlast', 'Lift with maximum load'),
        },
      ],
      default: 'handy',
      display: 'menu',
      visibleIf: (v) => v.mode === 'alltag',
    },
    {
      key: 'mh',
      type: 'number',
      label: L('Minuten im Monat', 'Minutes per month'),
      min: 0,
      max: 200,
      step: 1,
      default: 60,
      visibleIf: (v) => v.mode === 'alltag' && v.sc === 'handy',
    },
    {
      key: 'mf',
      type: 'number',
      label: L('Monate', 'Months'),
      min: 0,
      max: 12,
      step: 1,
      default: 3,
      visibleIf: (v) => v.mode === 'alltag' && v.sc === 'fitness',
    },
    {
      key: 'ws',
      type: 'number',
      label: L('Wochen', 'Weeks'),
      min: 0,
      max: 30,
      step: 1,
      default: 10,
      visibleIf: (v) => v.mode === 'alltag' && v.sc === 'sparen',
    },
    {
      key: 'km',
      type: 'number',
      label: L('Strecke in km', 'Distance in km'),
      min: 0,
      max: 15,
      step: 0.5,
      default: 5,
      visibleIf: (v) => v.mode === 'alltag' && v.sc === 'taxi',
    },
    {
      key: 'kb',
      type: 'number',
      label: L('Anzahl Kisten', 'Number of boxes'),
      min: 0,
      max: 30,
      step: 1,
      default: 10,
      visibleIf: (v) => v.mode === 'alltag' && v.sc === 'aufzug',
    },
    /* Halbebene */
    {
      key: 'm',
      type: 'number',
      label: L('Steigung m', 'Slope m'),
      min: -3,
      max: 3,
      step: 0.25,
      default: 0.5,
      visibleIf: (v) => v.mode === 'halbebene',
    },
    {
      key: 'n',
      type: 'number',
      label: L('y-Achsenabschnitt n', 'y-intercept n'),
      min: -5,
      max: 5,
      step: 0.5,
      default: 1,
      visibleIf: (v) => v.mode === 'halbebene',
    },
    {
      key: 'px',
      type: 'number',
      label: L('Punkt: x', 'Point: x'),
      min: -6,
      max: 6,
      step: 0.5,
      default: 2,
      visibleIf: (v) => v.mode === 'halbebene',
    },
    {
      key: 'py',
      type: 'number',
      label: L('Punkt: y', 'Point: y'),
      min: -6,
      max: 6,
      step: 0.5,
      default: 1,
      visibleIf: (v) => v.mode === 'halbebene',
    },
    /* Übung */
    {
      key: 'qn',
      type: 'number',
      label: L('Aufgabe Nr.', 'Task no.'),
      min: 1,
      max: 999,
      step: 1,
      default: 1,
      visibleIf: (v) => v.mode === 'ueben',
    },
    {
      key: 'qa',
      type: 'text',
      label: L('Deine Antwort', 'Your answer'),
      default: '',
      maxLength: 10,
      placeholder: L('Nummer oder Zahl', 'number'),
      visibleIf: (v) => v.mode === 'ueben',
    },
  ],
  hint: (v) =>
    v.mode === 'waage'
      ? L(
          'Die Waage vergleicht beide Seiten für eine Zahl x. Drücke „Alle Zahlen durchprobieren“: Grün markiert, wo die Ungleichung stimmt.',
          'The balance compares both sides for one number x. Press “Try all numbers”: green marks where the inequality holds.',
        )
      : v.mode === 'doppelt'
        ? L(
            '„und“: Beide Bedingungen müssen gelten – die Strahlen überlappen. „oder“: Eine reicht – die Strahlen werden zusammengelegt.',
            '“and”: both conditions must hold – the rays overlap. “or”: one is enough – the rays are combined.',
          )
        : v.mode === 'alltag'
          ? L('Ziehe den Punkt oder bewege den Regler. Wo erfüllt die Situation die Bedingung?', 'Drag the point or move the slider. Where does the situation meet the condition?')
          : v.mode === 'halbebene'
            ? L('Alle Punkte auf einer Seite der Geraden erfüllen die Ungleichung. Ziehe den Punkt.', 'All points on one side of the line satisfy the inequality. Drag the point.')
            : v.mode === 'ueben'
              ? L('Gib die Zahl oder die Nummer der Antwort ein und drücke „Prüfen“.', 'Enter the number or the number of the answer and press “Check”.')
              : L(
                  'Wo liegt die linke Gerade unter (oder über) der rechten? Ziehe den Probepunkt. Teilt man durch eine negative Zahl, dreht sich das Zeichen um.',
                  'Where is the left line below (or above) the right one? Drag the test point. Dividing by a negative number reverses the sign.',
                ),
  actions: [
    {
      id: 'scan',
      label: L('Alle Zahlen durchprobieren', 'Try all numbers'),
      primary: true,
      visibleIf: (v) => v.mode === 'waage',
    },
    {
      id: 'clear',
      label: L('Markierungen löschen', 'Clear marks'),
      visibleIf: (v) => v.mode === 'waage',
    },
    {
      id: 'check',
      label: L('Prüfen', 'Check'),
      primary: true,
      visibleIf: (v) => v.mode === 'ueben',
    },
    {
      id: 'next',
      label: L('Nächste Aufgabe', 'Next task'),
      visibleIf: (v) => v.mode === 'ueben',
    },
  ],
  readouts: [
    { key: 'ineq', label: L('Ungleichung', 'Inequality') },
    { key: 'sol', label: L('Lösungsmenge', 'Solution set'), spoiler: true },
    { key: 'chk', label: L('Probe', 'Check') },
    { key: 'info', label: L('Erklärung', 'Explanation') },
  ],
  presets: [
    {
      id: 'einfach',
      label: L('2x + 1 < 7', '2x + 1 < 7'),
      values: { mode: 'loesen', a: 2, b: 1, rel: 'lt', c: 0, d: 7, t: 1 },
    },
    {
      id: 'dreh',
      label: L('Zeichen dreht sich: −2x + 4 ≥ 0', 'Sign reverses: −2x + 4 ≥ 0'),
      values: { mode: 'loesen', a: -2, b: 4, rel: 'ge', c: 0, d: 0, t: 0 },
    },
    {
      id: 'beide',
      label: L('3x − 2 > x + 4', '3x − 2 > x + 4'),
      values: { mode: 'loesen', a: 3, b: -2, rel: 'gt', c: 1, d: 4, t: 5 },
    },
    {
      id: 'tarif',
      label: L('Tarifvergleich', 'Comparing tariffs'),
      values: { mode: 'loesen', a: 0.5, b: 2, rel: 'lt', c: 1, d: 0, t: 6 },
    },
    {
      id: 'immer',
      label: L('Immer wahr: x + 1 > x', 'Always true: x + 1 > x'),
      values: { mode: 'loesen', a: 1, b: 1, rel: 'gt', c: 1, d: 0, t: 2 },
    },
    {
      id: 'nie',
      label: L('Nie wahr: 2x < 2x − 3', 'Never true: 2x < 2x − 3'),
      values: { mode: 'loesen', a: 2, b: 0, rel: 'lt', c: 2, d: -3, t: 0 },
    },
    {
      id: 'waage',
      label: L('Waage: 2x + 1 < 7 durchprobieren', 'Balance: try out 2x + 1 < 7'),
      values: { mode: 'waage', a: 2, b: 1, rel: 'lt', c: 0, d: 7, t: -4 },
    },
    {
      id: 'waageDreh',
      label: L('Waage: −x + 2 ≤ 2x − 4', 'Balance: −x + 2 ≤ 2x − 4'),
      values: { mode: 'waage', a: -1, b: 2, rel: 'le', c: 2, d: -4, t: 0 },
    },
    {
      id: 'zwischen',
      label: L('−2 < x ≤ 3', '−2 < x ≤ 3'),
      values: { mode: 'doppelt', lo: -2, lr: 'lt', hi: 3, hr: 'le', op: 'und' },
    },
    {
      id: 'oder',
      label: L('x < −3 oder x > 4', 'x < −3 or x > 4'),
      values: {
        mode: 'doppelt',
        lo: 4,
        lr: 'lt',
        hi: -3,
        hr: 'lt',
        op: 'oder',
      },
    },
    {
      id: 'leer',
      label: L('x > 5 und x < 1: leer', 'x > 5 and x < 1: empty'),
      values: { mode: 'doppelt', lo: 5, lr: 'lt', hi: 1, hr: 'lt', op: 'und' },
    },
    {
      id: 'handy',
      label: L('Handytarif oder Flatrate', 'Phone plan or flat rate'),
      values: { mode: 'alltag', sc: 'handy', mh: 60 },
    },
    {
      id: 'fitness',
      label: L('Zwei Fitnessstudios', 'Two gyms'),
      values: { mode: 'alltag', sc: 'fitness', mf: 3 },
    },
    {
      id: 'sparen',
      label: L('Sparen für ein Fahrrad', 'Saving for a bike'),
      values: { mode: 'alltag', sc: 'sparen', ws: 10 },
    },
    {
      id: 'taxi',
      label: L('Taxi mit 25 € Budget', 'Taxi with a €25 budget'),
      values: { mode: 'alltag', sc: 'taxi', km: 5 },
    },
    {
      id: 'aufzug',
      label: L('Aufzug mit Höchstlast', 'Lift with maximum load'),
      values: { mode: 'alltag', sc: 'aufzug', kb: 10 },
    },
    {
      id: 'unter',
      label: L('Halbebene y < 0,5x + 1', 'Half-plane y < 0.5x + 1'),
      values: { mode: 'halbebene', m: 0.5, n: 1, rel: 'lt', px: 2, py: 1 },
    },
    {
      id: 'ueber',
      label: L('Halbebene y ≥ −x + 2', 'Half-plane y ≥ −x + 2'),
      values: { mode: 'halbebene', m: -1, n: 2, rel: 'ge', px: 3, py: 0 },
    },
    {
      id: 'quiz',
      label: L('Üben: sechs Aufgabenarten', 'Practice: six kinds of tasks'),
      values: { mode: 'ueben', qn: 1, qa: '' },
    },
  ],
  strings: {
    de: {
      canvas: 'Zwei Geraden für die linke und die rechte Seite der Ungleichung, der Bereich der Lösungen ist farbig; darunter die Lösungsmenge am Zahlenstrahl und die Umformungsschritte',
      setBound: 'L = {x | x {r} {v}}',
      setAll: 'L = ℝ (immer erfüllt)',
      setNone: 'L = { } (nie erfüllt)',
      chkYes: '{l} {r} {rr} ✓ stimmt',
      chkNo: '{l} {r} {rr} ✗ stimmt nicht',
      left: 'links',
      right: 'rechts',
      collectX: '| {op}   (x nach links)',
      collectN: '| {op}   (Zahlen nach rechts)',
      divide: '| : {k}',
      flipNote: 'Zeichen umdrehen!',
      allLine: 'Die x fallen weg: {s} ist {w}.',
      wTrue: 'immer wahr',
      wFalse: 'nie wahr',
      solLabel: 'Lösungsmenge',
      canvasW: 'Eine Waage vergleicht linke und rechte Seite für eine Zahl x; darunter ein Zahlenstrahl, auf dem ausprobierte Zahlen grün (stimmt) oder rot (stimmt nicht) markiert sind',
      canvasD: 'Drei Zahlenstrahlen: die erste Bedingung, die zweite Bedingung und darunter die Lösungsmenge der Verknüpfung',
      canvasA: 'Koordinatensystem mit zwei Geraden für eine Alltagssituation; der Bereich, in dem die Bedingung erfüllt ist, ist farbig',
      canvasH: 'Koordinatensystem mit einer Geraden; die Halbebene, deren Punkte die Ungleichung erfüllen, ist farbig, dazu ein ziehbarer Punkt',
      canvasQ: 'Übungsaufgabe zu Ungleichungen mit Rückmeldung und Punktestand',
      wLeft: 'linke Seite',
      wRight: 'rechte Seite',
      wOk: 'stimmt',
      wNot: 'stimmt nicht',
      wScan: 'Probiert: {k} Zahlen, davon {g} Lösungen',
      wInfo: 'Die schwerere Seite sinkt. Die Ungleichung stimmt, wenn die Waage so steht, wie das Zeichen es verlangt.',
      dCond1: 'Bedingung 1: x {r} {v}',
      dCond2: 'Bedingung 2: x {r} {v}',
      dRes: 'Lösungsmenge ({op})',
      dUnd: 'und',
      dOder: 'oder',
      dInterval: 'L = {a}{lo}; {hi}{b}',
      dAll: 'L = ℝ (alle Zahlen)',
      dEmpty: 'L = { } (keine Zahl erfüllt beides)',
      dTwo: 'L = {x | x {r1} {v1} oder x {r2} {v2}}',
      dCount: 'Ganze Zahlen darin: {n}',
      dCountInf: 'Ganze Zahlen darin: unendlich viele',
      dInfoUnd: 'Bei „und“ zählt nur der Teil, in dem sich beide Strahlen überlappen.',
      dInfoOder: 'Bei „oder“ reicht es, wenn eine der beiden Bedingungen gilt.',
      aAt: 'Bei {x} {u}: links {l}, rechts {r}',
      aYes: 'Bedingung erfüllt ✓',
      aNo: 'Bedingung nicht erfüllt ✗',
      aMin: 'ab {v} {u}',
      aMax: 'höchstens {v} {u}',
      aInfo: 'Die Grenze ist der Schnittpunkt der beiden Geraden. Bei ganzen Zahlen (Monate, Kisten) muss man passend auf- oder abrunden.',
      hBoundStrict: 'Gerade gestrichelt: Punkte darauf gehören nicht dazu.',
      hBoundClosed: 'Gerade durchgezogen: Punkte darauf gehören dazu.',
      hPoint: 'P({x} | {y}): {l} {r} {rr}',
      qTitle: 'Aufgabe {n}',
      qYour: 'Deine Antwort: {a}',
      qHow: 'Gib die Nummer der richtigen Antwort ein.',
      qHowNum: 'Gib die Zahl ein (Minus und Komma sind erlaubt).',
      qBad: 'Bitte eine Zahl eingeben.',
      qOk: 'Richtig!',
      qNo: 'Leider falsch. Versuch es noch einmal.',
      qSol: 'Lösung',
      qScore: '{k} von {n} richtig, {s} in Folge',
    },
    en: {
      canvas: 'Two lines for the left and right side of the inequality, the region of solutions is shaded; below, the solution set on the number line and the steps of the transformation',
      setBound: 'S = {x | x {r} {v}}',
      setAll: 'S = ℝ (always true)',
      setNone: 'S = { } (never true)',
      chkYes: '{l} {r} {rr} ✓ true',
      chkNo: '{l} {r} {rr} ✗ false',
      left: 'left',
      right: 'right',
      collectX: '| {op}   (x to the left)',
      collectN: '| {op}   (numbers to the right)',
      divide: '| : {k}',
      flipNote: 'reverse the sign!',
      allLine: 'The x terms cancel: {s} is {w}.',
      wTrue: 'always true',
      wFalse: 'never true',
      solLabel: 'Solution set',
      canvasW: 'A balance compares the left and right side for one number x; below, a number line on which tried numbers are marked green (true) or red (false)',
      canvasD: 'Three number lines: the first condition, the second condition and below the solution set of the combination',
      canvasA: 'Coordinate system with two lines for an everyday situation; the region where the condition holds is shaded',
      canvasH: 'Coordinate system with a line; the half-plane whose points satisfy the inequality is shaded, plus a draggable point',
      canvasQ: 'Practice task on inequalities with feedback and score',
      wLeft: 'left side',
      wRight: 'right side',
      wOk: 'true',
      wNot: 'false',
      wScan: 'Tried: {k} numbers, {g} of them solutions',
      wInfo: 'The heavier side goes down. The inequality holds if the balance tips the way the sign demands.',
      dCond1: 'Condition 1: x {r} {v}',
      dCond2: 'Condition 2: x {r} {v}',
      dRes: 'Solution set ({op})',
      dUnd: 'and',
      dOder: 'or',
      dInterval: 'S = {a}{lo}, {hi}{b}',
      dAll: 'S = ℝ (all numbers)',
      dEmpty: 'S = { } (no number satisfies both)',
      dTwo: 'S = {x | x {r1} {v1} or x {r2} {v2}}',
      dCount: 'Integers in it: {n}',
      dCountInf: 'Integers in it: infinitely many',
      dInfoUnd: 'With “and” only the part where both rays overlap counts.',
      dInfoOder: 'With “or” it is enough if one of the two conditions holds.',
      aAt: 'At {x} {u}: left {l}, right {r}',
      aYes: 'condition met ✓',
      aNo: 'condition not met ✗',
      aMin: 'from {v} {u}',
      aMax: 'at most {v} {u}',
      aInfo: 'The boundary is where the two lines cross. For whole numbers (months, boxes) round up or down as appropriate.',
      hBoundStrict: 'Dashed line: points on it are not included.',
      hBoundClosed: 'Solid line: points on it are included.',
      hPoint: 'P({x} | {y}): {l} {r} {rr}',
      qTitle: 'Task {n}',
      qYour: 'Your answer: {a}',
      qHow: 'Enter the number of the correct answer.',
      qHowNum: 'Enter the number (minus sign allowed).',
      qBad: 'Please enter a number.',
      qOk: 'Correct!',
      qNo: 'Not quite. Try again.',
      qSol: 'Solution',
      qScore: '{k} of {n} correct, {s} in a row',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const rel = () => p.rel as Rel;
    const sym = (r: Rel) => REL_SYMBOL[r];
    const n = (v: number) => fmt.num(v === 0 ? 0 : v, 2);

    /** Term k·x + m lesbar („2x + 1“, „−x“, „3“). */
    function term(k: number, m: number): string {
      let s = '';
      if (k !== 0) s = k === 1 ? 'x' : k === -1 ? '−x' : `${n(k)}x`;
      if (m !== 0 || s === '') {
        if (s === '') s = n(m);
        else s += m < 0 ? ` − ${n(-m)}` : ` + ${n(m)}`;
      }
      return s;
    }
    const xTerm = (k: number) => (k === 1 ? 'x' : k === -1 ? '−x' : `${n(k)}x`);
    const signed = (v: number, unit = '') => (v < 0 ? `− ${n(-v)}${unit}` : `+ ${n(v)}${unit}`);

    /** Bereich des Koordinatensystems je Ansicht (Alltag/Halbebene: Platz für Text darunter bzw. daneben). */
    const regionPlot = (w: number, h: number): Rect => {
      const narrow = w < 560;
      if (p.mode === 'alltag') return { x: 0, y: 0, w, h: Math.round(h * (narrow ? 0.6 : 0.68)) };
      if (p.mode === 'halbebene') return narrow ? { x: 0, y: 0, w, h: Math.round(h * 0.7) } : { x: 0, y: 0, w: Math.round(w * 0.66), h };
      return { x: 0, y: 0, w, h: Math.round(h * (narrow ? 0.56 : 0.6)) };
    };
    const plot = new Plot(surface, {
      x: X_RANGE,
      y: [-10, 10],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: regionPlot,
    });
    const f = (x: number) => p.a * x + p.b;
    const g = (x: number) => p.c * x + p.d;

    plot.addHandle({
      get: () => [p.t, f(p.t)],
      set: (x) => ctx.set({ t: Math.max(-10, Math.min(10, Math.round(x * 2) / 2)) }),
      axis: 'x',
      enabled: () => !ctx.locked && p.mode === 'loesen',
      color: () => ctx.theme.series[0]!,
    });

    /* Alltag: Wert auf der x-Achse je Situation */
    const SC_KEY: Record<ScenarioId, 'mh' | 'mf' | 'ws' | 'km' | 'kb'> = {
      handy: 'mh',
      fitness: 'mf',
      sparen: 'ws',
      taxi: 'km',
      aufzug: 'kb',
    };
    const sc = () => SCENARIOS[p.sc as ScenarioId];
    const scX = () => p[SC_KEY[p.sc as ScenarioId]];
    const fa = (x: number) => sc().a * x + sc().b;
    const ga = (x: number) => sc().c * x + sc().d;
    plot.addHandle({
      get: () => [scX(), fa(scX())],
      set: (x) => {
        const s0 = sc();
        const step = s0.integer ? 1 : 0.5;
        ctx.set({
          [SC_KEY[s0.id]]: Math.max(0, Math.min(s0.xMax, Math.round(x / step) * step)),
        } as Record<string, number>);
      },
      axis: 'x',
      enabled: () => !ctx.locked && p.mode === 'alltag',
      color: () => ctx.theme.series[0]!,
    });

    /* Halbebene: ziehbarer Punkt */
    const H_RANGE: [number, number] = [-6, 6];
    const clampH = (v: number) => Math.max(-6, Math.min(6, Math.round(v * 2) / 2));
    plot.addHandle({
      get: () => [p.px, p.py],
      set: (x, y) => ctx.set({ px: clampH(x), py: clampH(y) }),
      axis: 'both',
      enabled: () => !ctx.locked && p.mode === 'halbebene',
      color: () => ctx.theme.series[3]!,
    });

    /* Waage: ausprobierte Zahlen (in halben Schritten, als 2·x gespeichert) */
    const stamps = new Set<number>();
    let scanX = X_RANGE[0];
    let scanning = false;
    const curX = () => (scanning ? scanX : p.t);

    /* Übung */
    let task: IneqTask = makeTask(1);
    let verdict: boolean | null = null;
    let tries = 0;
    let badInput = false;
    let score = { right: 0, all: 0, streak: 0 };

    function setRange(): void {
      if (p.mode === 'alltag') {
        const s0 = sc();
        const top = Math.max(fa(s0.xMax), ga(s0.xMax), fa(0), ga(0)) * 1.12;
        plot.setRangePadded([0, s0.xMax], [0, top], {
          left: 48,
          right: 16,
          top: 14,
          bottom: 24,
        });
        plot.setAxes({
          x: { label: s0.xLabel[ctx.lang], minStep: s0.integer ? 1 : 0.5 },
          y: { label: s0.yLabel[ctx.lang] },
        });
        return;
      }
      if (p.mode === 'halbebene') {
        plot.setRangePadded(H_RANGE, H_RANGE, {
          left: 14,
          right: 14,
          top: 14,
          bottom: 14,
        });
        plot.setAxes({
          x: { label: 'x', minStep: 1 },
          y: { label: 'y', minStep: 1 },
        });
        return;
      }
      const vals = [f(X_RANGE[0]), f(X_RANGE[1]), g(X_RANGE[0]), g(X_RANGE[1])];
      let lo = Math.max(-40, Math.min(-2, ...vals));
      let hi = Math.min(40, Math.max(2, ...vals));
      if (hi - lo < 6) {
        lo -= 3;
        hi += 3;
      }
      plot.setRangePadded(X_RANGE, [lo, hi], {
        left: 40,
        right: 14,
        top: 14,
        bottom: 22,
      });
      plot.setAxes({ x: { label: 'x', minStep: 1 }, y: { label: 'y' } });
    }

    function updateReadouts(): void {
      ctx.readout('info', null);
      if (p.mode === 'doppelt') return readoutsCombined();
      if (p.mode === 'alltag') return readoutsEveryday();
      if (p.mode === 'halbebene') return readoutsHalf();
      if (p.mode === 'ueben') {
        for (const k of ['ineq', 'sol', 'chk']) ctx.readout(k, null);
        ctx.readout('info', tr('qScore', { k: score.right, n: score.all, s: score.streak }));
        return;
      }
      const sol = solve(p.a, p.b, p.c, p.d, rel());
      ctx.readout('ineq', `${term(p.a, p.b)} ${sym(rel())} ${term(p.c, p.d)}`);
      ctx.readout(
        'sol',
        sol.kind === 'all'
          ? ctx.t('setAll')
          : sol.kind === 'none'
            ? ctx.t('setNone')
            : tr('setBound', {
                r: sym(sol.rel),
                v: fmt.approx(sol.x, 2).replace(/^= /, ''),
              }),
      );
      const l = f(p.t);
      const r = g(p.t);
      ctx.readout(
        'chk',
        tr(holds(l, r, rel()) ? 'chkYes' : 'chkNo', {
          l: n(l),
          r: sym(rel()),
          rr: n(r),
        }),
      );
      if (p.mode === 'waage') {
        const good = [...stamps].filter((k) => inSolution(sol, k / 2)).length;
        ctx.readout('info', `${tr('wScan', { k: stamps.size, g: good })}. ${ctx.t('wInfo')}`);
      }
    }

    /* ---------- Zwei Bedingungen ---------- */
    const combined = (): Combined => ({
      lo: p.lo,
      loClosed: p.lr === 'le',
      hi: p.hi,
      hiClosed: p.hr === 'le',
      op: p.op as 'und' | 'oder',
    });
    const lowSym = () => (p.lr === 'le' ? '≥' : '>');
    const highSym = () => (p.hr === 'le' ? '≤' : '<');

    function combinedSetText(): string {
      const c = combined();
      const k = combinedKind(c);
      if (k === 'all') return ctx.t('dAll');
      if (k === 'empty') return ctx.t('dEmpty');
      if (k === 'two')
        return tr('dTwo', {
          r1: highSym(),
          v1: n(c.hi),
          r2: lowSym(),
          v2: n(c.lo),
        });
      const de = ctx.lang === 'de';
      return tr('dInterval', {
        a: c.loClosed ? '[' : de ? ']' : '(',
        lo: n(c.lo),
        hi: n(c.hi),
        b: c.hiClosed ? ']' : de ? '[' : ')',
      });
    }

    function readoutsCombined(): void {
      const c = combined();
      const k = combinedKind(c);
      const statement =
        p.op === 'und' && k === 'interval'
          ? `${n(c.lo)} ${c.loClosed ? '≤' : '<'} x ${highSym()} ${n(c.hi)}`
          : `x ${lowSym()} ${n(c.lo)} ${ctx.t(p.op === 'und' ? 'dUnd' : 'dOder')} x ${highSym()} ${n(c.hi)}`;
      ctx.readout('ineq', statement);
      ctx.readout('sol', combinedSetText());
      const cnt = countIntegers(c);
      ctx.readout('chk', cnt < 0 ? ctx.t('dCountInf') : tr('dCount', { n: cnt }));
      ctx.readout('info', ctx.t(p.op === 'und' ? 'dInfoUnd' : 'dInfoOder'));
    }

    /* ---------- Alltag ---------- */
    const money = (v: number) => (sc().yLabel.de === '€' ? (ctx.lang === 'de' ? `${fmt.fixed(v, 2)} €` : `€${fmt.fixed(v, 2)}`) : `${fmt.num(v, 0)} kg`);

    function readoutsEveryday(): void {
      const s0 = sc();
      ctx.readout('ineq', `${term(s0.a, s0.b)} ${sym(s0.rel)} ${term(s0.c, s0.d)}`);
      const ans = scenarioAnswer(s0);
      ctx.readout(
        'sol',
        tr(ans.side === 'min' ? 'aMin' : 'aMax', {
          v: s0.integer ? String(ans.best) : fmt.num(ans.best, 2),
          u: s0.xLabel[ctx.lang],
        }),
      );
      const x = scX();
      const ok = holds(fa(x), ga(x), s0.rel);
      ctx.readout('chk', `${tr('aAt', { x: fmt.num(x, s0.integer ? 0 : 1), u: s0.xLabel[ctx.lang], l: money(fa(x)), r: money(ga(x)) })} – ${ctx.t(ok ? 'aYes' : 'aNo')}`);
      ctx.readout('info', ctx.t('aInfo'));
    }

    /* ---------- Halbebene ---------- */
    const hf = (x: number) => p.m * x + p.n;

    function readoutsHalf(): void {
      ctx.readout('ineq', `y ${sym(rel())} ${term(p.m, p.n)}`);
      ctx.readout('sol', null);
      const ok = inHalfPlane(p.m, p.n, rel(), p.px, p.py);
      ctx.readout('chk', `${tr('hPoint', { x: n(p.px), y: n(p.py), l: n(p.py), r: sym(rel()), rr: n(hf(p.px)) })} ${ok ? '✓' : '✗'}`);
      ctx.readout('info', ctx.t(rel() === 'lt' || rel() === 'gt' ? 'hBoundStrict' : 'hBoundClosed'));
    }

    function drawPlot(): void {
      const th = ctx.theme;
      const sol = solve(p.a, p.b, p.c, p.d, rel());
      plot.begin();
      // Lösungsbereich als senkrechter Streifen
      const band = (from: number, to: number) =>
        plot.fillBetween(
          () => 1e4,
          () => -1e4,
          from,
          to,
          { fill: th.series[2]!, alpha: 0.12 },
        );
      if (sol.kind === 'all') band(X_RANGE[0] - 1, X_RANGE[1] + 1);
      else if (sol.kind === 'bound') {
        if (sol.rel === 'lt' || sol.rel === 'le') band(X_RANGE[0] - 1, Math.min(sol.x, X_RANGE[1] + 1));
        else band(Math.max(sol.x, X_RANGE[0] - 1), X_RANGE[1] + 1);
      }
      plot.grid({ minor: false });
      plot.axes();
      plot.fn(g, { color: th.series[1]!, width: 2.5 });
      plot.fn(f, { color: th.series[0]!, width: 2.5 });
      if (sol.kind === 'bound') {
        plot.vline(sol.x, { color: th.series[2]!, width: 1.5, dash: [5, 4] });
        plot.point(sol.x, f(sol.x), { color: th.series[2]!, radius: 5 });
      }
      // Probe
      const ok = holds(f(p.t), g(p.t), rel());
      plot.segment([p.t, f(p.t)], [p.t, g(p.t)], {
        color: ok ? th.series[2]! : th.muted,
        width: 2,
        dash: [3, 3],
      });
      plot.point(p.t, g(p.t), { color: th.series[1]!, radius: 4.5 });
      plot.end();
    }

    function drawBelow(): void {
      const g2 = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 560;
      const fs = narrow ? 12 : 14;
      const top = regionPlot(W, H).h;
      const sol = solve(p.a, p.b, p.c, p.d, rel());

      // Zahlenstrahl
      const x0 = plot.px(X_RANGE[0]);
      const x1 = plot.px(X_RANGE[1]);
      const ly = top + (narrow ? 34 : 40);
      text(g2, ctx.t('solLabel'), 14, top + 12, {
        font: `600 ${fs - 1}px ${th.font}`,
        color: th.muted,
        align: 'left',
      });
      g2.strokeStyle = th.axis;
      g2.lineWidth = 1.5;
      g2.beginPath();
      g2.moveTo(x0 - 6, ly);
      g2.lineTo(x1 + 6, ly);
      g2.stroke();
      drawArrowHead(g2, x1 + 10, ly, 0, 8, th.axis);
      for (let v = X_RANGE[0]; v <= X_RANGE[1]; v++) {
        const big = v % (narrow ? 5 : 2) === 0;
        g2.strokeStyle = big ? th.axis : th.grid;
        g2.lineWidth = 1;
        g2.beginPath();
        g2.moveTo(plot.px(v), ly - (big ? 5 : 3));
        g2.lineTo(plot.px(v), ly + (big ? 5 : 3));
        g2.stroke();
        if (big)
          text(g2, n(v), plot.px(v), ly + 15, {
            font: `500 ${fs - 2}px ${th.font}`,
            color: th.muted,
          });
      }
      const col = th.series[2]!;
      g2.strokeStyle = col;
      g2.lineWidth = 6;
      g2.lineCap = 'round';
      const seg = (a: number, b: number) => {
        g2.beginPath();
        g2.moveTo(a, ly);
        g2.lineTo(b, ly);
        g2.stroke();
      };
      if (sol.kind === 'all') {
        seg(x0, x1);
        drawArrowHead(g2, x1 + 12, ly, 0, 12, col);
        drawArrowHead(g2, x0 - 12, ly, Math.PI, 12, col);
      } else if (sol.kind === 'bound') {
        const bx = Math.max(x0 - 4, Math.min(x1 + 4, plot.px(sol.x)));
        const left = sol.rel === 'lt' || sol.rel === 'le';
        if (left) {
          if (bx > x0) seg(x0, bx);
          drawArrowHead(g2, x0 - 12, ly, Math.PI, 12, col);
        } else {
          if (bx < x1) seg(bx, x1);
          drawArrowHead(g2, x1 + 12, ly, 0, 12, col);
        }
        if (sol.x >= X_RANGE[0] && sol.x <= X_RANGE[1]) {
          const closed = sol.rel === 'le' || sol.rel === 'ge';
          g2.beginPath();
          g2.arc(bx, ly, 6.5, 0, Math.PI * 2);
          g2.fillStyle = closed ? col : th.bg;
          g2.fill();
          g2.lineWidth = 2.5;
          g2.strokeStyle = col;
          g2.stroke();
        }
      }
      g2.lineCap = 'butt';
      // Probepunkt auf dem Zahlenstrahl
      const ok = inSolution(sol, p.t);
      g2.fillStyle = ok ? th.series[0]! : th.muted;
      g2.beginPath();
      g2.moveTo(plot.px(p.t), ly - 9);
      g2.lineTo(plot.px(p.t) - 6, ly - 18);
      g2.lineTo(plot.px(p.t) + 6, ly - 18);
      g2.closePath();
      g2.fill();

      // Umformungsschritte
      const st = steps(p.a, p.b, p.c, p.d, rel());
      const lines: { t: string; note?: string; c: string; b?: boolean }[] = [];
      lines.push({
        t: `${term(p.a, p.b)} ${sym(rel())} ${term(p.c, p.d)}`,
        c: th.text,
        b: true,
      });
      if (p.c !== 0)
        lines.push({
          t: `${term(st.k, p.b)} ${sym(rel())} ${n(p.d)}`,
          note: tr('collectX', {
            op: p.c > 0 ? `− ${xTerm(p.c)}` : `+ ${xTerm(-p.c)}`,
          }),
          c: th.text,
        });
      if (st.k === 0) {
        lines.push({
          t: tr('allLine', {
            s: `${n(p.b)} ${sym(rel())} ${n(p.d)}`,
            w: ctx.t(holds(p.b, p.d, rel()) ? 'wTrue' : 'wFalse'),
          }),
          c: th.series[2]!,
          b: true,
        });
      } else {
        if (p.b !== 0)
          lines.push({
            t: `${xTerm(st.k)} ${sym(rel())} ${n(st.m)}`,
            note: tr('collectN', { op: signed(-p.b) }),
            c: th.text,
          });
        if (st.k !== 1)
          lines.push({
            t: `x ${sym(st.rel)} ${fmt.approx(st.m / st.k, 2).replace(/^= /, '')}`,
            note: tr('divide', { k: st.k < 0 ? `(${n(st.k)})` : n(st.k) }) + (st.flipped ? `  ${ctx.t('flipNote')}` : ''),
            c: st.flipped ? th.series[1]! : th.series[2]!,
            b: true,
          });
        else lines[lines.length - 1]!.c = th.series[2]!;
      }
      const sy = ly + (narrow ? 34 : 40);
      const lh = Math.min(fs * 1.9, (H - sy - 4) / Math.max(1, lines.length));
      const colX = narrow ? 14 : Math.max(14, plot.px(X_RANGE[0]));
      const noteX = colX + (narrow ? Math.min(W * 0.5, 190) : 250);
      lines.forEach((l, i) => {
        const y = sy + lh * (i + 0.5);
        text(g2, l.t, colX, y, {
          font: `${l.b ? 700 : 500} ${fs + 1}px ${th.font}`,
          color: l.c,
          align: 'left',
        });
        // Die Umformung steht in der Zeile, auf die sie angewendet wird (also eine Zeile höher).
        if (l.note)
          text(g2, l.note, noteX, y - lh, {
            font: `500 ${fs - 1}px ${th.font}`,
            color: l.c === th.series[1] ? th.series[1]! : th.muted,
            align: 'left',
          });
      });
    }

    /* ---------- Waage ---------- */
    /** Zahlenstrahl von −10 bis 10 in einem Rechteck; gibt die Umrechnung zurück. */
    function numberLine(x0: number, x1: number, y: number, fs: number, every: number): (v: number) => number {
      const g = surface.g;
      const th = ctx.theme;
      const X = (v: number) => x0 + ((v - X_RANGE[0]) / (X_RANGE[1] - X_RANGE[0])) * (x1 - x0);
      g.strokeStyle = th.axis;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(x0 - 6, y);
      g.lineTo(x1 + 6, y);
      g.stroke();
      drawArrowHead(g, x1 + 10, y, 0, 8, th.axis);
      for (let v = X_RANGE[0]; v <= X_RANGE[1]; v++) {
        const big = v % every === 0;
        g.strokeStyle = big ? th.axis : th.grid;
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(X(v), y - (big ? 5 : 3));
        g.lineTo(X(v), y + (big ? 5 : 3));
        g.stroke();
        if (big)
          text(g, n(v), X(v), y + 15, {
            font: `500 ${fs - 2}px ${th.font}`,
            color: th.muted,
          });
      }
      return X;
    }

    function drawBalance(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 560;
      const fs = narrow ? 12 : 14;
      const x = curX();
      const lv = p.a * x + p.b;
      const rv = p.c * x + p.d;
      const ok = holds(lv, rv, rel());
      const okCol = th.series[2]!;
      const badCol = th.series[3]!;

      // Waage
      const cx = W / 2;
      const baseY = H * (narrow ? 0.4 : 0.46);
      const pivotY = baseY - H * (narrow ? 0.2 : 0.24);
      const arm = Math.min(W / 2 - (narrow ? 96 : 150) / 2 - 10, 300);
      const ang = Math.max(-0.28, Math.min(0.28, Math.atan((rv - lv) / 10) * 0.5));
      // Ständer
      g.fillStyle = withAlpha(th.muted, 0.35);
      g.beginPath();
      g.moveTo(cx - 34, baseY);
      g.lineTo(cx + 34, baseY);
      g.lineTo(cx, pivotY);
      g.closePath();
      g.fill();
      // Balken
      const lx = cx - arm * Math.cos(ang);
      const ly = pivotY - arm * Math.sin(ang);
      const rx = cx + arm * Math.cos(ang);
      const ry = pivotY + arm * Math.sin(ang);
      g.strokeStyle = th.text;
      g.lineWidth = 4;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(lx, ly);
      g.lineTo(rx, ry);
      g.stroke();
      g.lineCap = 'butt';
      g.fillStyle = th.text;
      g.beginPath();
      g.arc(cx, pivotY, 5, 0, Math.PI * 2);
      g.fill();
      // Schalen mit Werten
      const pan = (px: number, py: number, label: string, value: number, col: string) => {
        const pw = narrow ? 96 : 150;
        const ph = narrow ? 44 : 52;
        g.strokeStyle = th.muted;
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(px, py);
        g.lineTo(px - pw / 2 + 8, py + 28);
        g.moveTo(px, py);
        g.lineTo(px + pw / 2 - 8, py + 28);
        g.stroke();
        roundRect(g, px - pw / 2, py + 28, pw, ph, 8);
        g.fillStyle = withAlpha(col, 0.16);
        g.fill();
        g.strokeStyle = col;
        g.lineWidth = 2;
        g.stroke();
        text(g, label, px, py + 28 + ph * 0.3, {
          font: `600 ${fs - 1}px ${th.font}`,
          color: th.muted,
        });
        text(g, n(value), px, py + 28 + ph * 0.7, {
          font: `800 ${fs + 3}px ${th.font}`,
          color: col,
        });
      };
      pan(lx, ly, p.a === 0 ? ctx.t('wLeft') : term(p.a, p.b), lv, th.series[0]!);
      pan(rx, ry, p.c === 0 ? ctx.t('wRight') : term(p.c, p.d), rv, th.series[1]!);
      // Ergebnis oben
      const cmp = Math.abs(lv - rv) < 1e-9 ? '=' : lv < rv ? '<' : '>';
      text(g, `x = ${n(x)}:  ${n(lv)} ${cmp} ${n(rv)}`, cx, narrow ? 18 : 22, {
        font: `700 ${fs + 2}px ${th.font}`,
        color: th.text,
      });
      text(g, `${term(p.a, p.b)} ${sym(rel())} ${term(p.c, p.d)}  →  ${ctx.t(ok ? 'wOk' : 'wNot')} ${ok ? '✓' : '✗'}`, cx, narrow ? 40 : 46, {
        font: `700 ${fs + 1}px ${th.font}`,
        color: ok ? okCol : badCol,
      });

      // Zahlenstrahl mit Markierungen
      const x0 = narrow ? 22 : 60;
      const x1 = W - (narrow ? 26 : 60);
      const y = H * (narrow ? 0.66 : 0.7);
      text(g, ctx.t('solLabel'), x0 - 6, y - 34, {
        font: `600 ${fs - 1}px ${th.font}`,
        color: th.muted,
        align: 'left',
      });
      const X = numberLine(x0, x1, y, fs, narrow ? 5 : 2);
      const sol = solve(p.a, p.b, p.c, p.d, rel());
      for (const k of stamps) {
        const v = k / 2;
        const good = inSolution(sol, v);
        g.beginPath();
        g.arc(X(v), y - 14, narrow ? 3.5 : 4.5, 0, Math.PI * 2);
        g.fillStyle = good ? okCol : withAlpha(badCol, 0.75);
        g.fill();
      }
      // Grenze erst zeigen, wenn genug ausprobiert wurde
      if (stamps.size >= 20 && sol.kind === 'bound' && sol.x >= X_RANGE[0] && sol.x <= X_RANGE[1]) {
        const closed = sol.rel === 'le' || sol.rel === 'ge';
        g.beginPath();
        g.arc(X(sol.x), y, 6.5, 0, Math.PI * 2);
        g.fillStyle = closed ? okCol : th.bg;
        g.fill();
        g.lineWidth = 2.5;
        g.strokeStyle = okCol;
        g.stroke();
      }
      // Zeiger für das aktuelle x
      g.fillStyle = th.series[0]!;
      g.beginPath();
      g.moveTo(X(x), y - 22);
      g.lineTo(X(x) - 6, y - 32);
      g.lineTo(X(x) + 6, y - 32);
      g.closePath();
      g.fill();
      // Legende
      const ly2 = y + (narrow ? 40 : 46);
      const leg = (lx2: number, col: string, label: string) => {
        g.beginPath();
        g.arc(lx2, ly2, 5, 0, Math.PI * 2);
        g.fillStyle = col;
        g.fill();
        text(g, label, lx2 + 10, ly2, {
          font: `500 ${fs - 1}px ${th.font}`,
          color: th.text,
          align: 'left',
        });
      };
      leg(x0, okCol, ctx.t('wOk'));
      leg(x0 + (narrow ? 90 : 120), withAlpha(badCol, 0.75), ctx.t('wNot'));
    }

    /* ---------- Zwei Bedingungen ---------- */
    function drawCombined(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 560;
      const fs = narrow ? 12 : 14;
      const c = combined();
      const x0 = narrow ? 22 : 60;
      const x1 = W - (narrow ? 26 : 60);
      const rowH = H / 3.4;
      const ray = (X: (v: number) => number, y: number, from: number, to: number, col: string, width: number) => {
        const a = Math.max(x0, Math.min(x1, X(from)));
        const b = Math.max(x0, Math.min(x1, X(to)));
        if (b <= a) return;
        g.strokeStyle = col;
        g.lineWidth = width;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(a, y);
        g.lineTo(b, y);
        g.stroke();
        g.lineCap = 'butt';
        if (to >= X_RANGE[1]) drawArrowHead(g, x1 + 12, y, 0, 12, col);
        if (from <= X_RANGE[0]) drawArrowHead(g, x0 - 12, y, Math.PI, 12, col);
      };
      const dot = (X: (v: number) => number, y: number, v: number, closed: boolean, col: string) => {
        g.beginPath();
        g.arc(X(v), y, 6.5, 0, Math.PI * 2);
        g.fillStyle = closed ? col : th.bg;
        g.fill();
        g.lineWidth = 2.5;
        g.strokeStyle = col;
        g.stroke();
      };
      const BIG = 1e3;
      // Bedingung 1: x > lo
      let y = rowH * 0.75;
      text(g, tr('dCond1', { r: lowSym(), v: n(c.lo) }), x0 - 6, y - 30, {
        font: `700 ${fs}px ${th.font}`,
        color: th.series[0]!,
        align: 'left',
      });
      let X = numberLine(x0, x1, y, fs, narrow ? 5 : 2);
      ray(X, y, c.lo, BIG, th.series[0]!, 5);
      dot(X, y, c.lo, c.loClosed, th.series[0]!);
      // Bedingung 2: x < hi
      y = rowH * 1.75;
      text(g, tr('dCond2', { r: highSym(), v: n(c.hi) }), x0 - 6, y - 30, {
        font: `700 ${fs}px ${th.font}`,
        color: th.series[1]!,
        align: 'left',
      });
      X = numberLine(x0, x1, y, fs, narrow ? 5 : 2);
      ray(X, y, -BIG, c.hi, th.series[1]!, 5);
      dot(X, y, c.hi, c.hiClosed, th.series[1]!);
      // Ergebnis
      y = rowH * 2.75;
      const col = th.series[2]!;
      text(g, tr('dRes', { op: ctx.t(p.op === 'und' ? 'dUnd' : 'dOder') }), x0 - 6, y - 30, { font: `700 ${fs}px ${th.font}`, color: col, align: 'left' });
      X = numberLine(x0, x1, y, fs, narrow ? 5 : 2);
      // Hilfslinien von oben
      g.setLineDash([3, 4]);
      g.strokeStyle = withAlpha(th.muted, 0.6);
      g.lineWidth = 1;
      for (const v of [c.lo, c.hi]) {
        g.beginPath();
        g.moveTo(X(v), rowH * 0.75 + 8);
        g.lineTo(X(v), y - 8);
        g.stroke();
      }
      g.setLineDash([]);
      const k = combinedKind(c);
      if (k === 'interval') {
        ray(X, y, c.lo, c.hi, col, 7);
        dot(X, y, c.lo, c.loClosed, col);
        dot(X, y, c.hi, c.hiClosed, col);
      } else if (k === 'all') {
        ray(X, y, -BIG, BIG, col, 7);
      } else if (k === 'two') {
        ray(X, y, -BIG, c.hi, col, 7);
        ray(X, y, c.lo, BIG, col, 7);
        dot(X, y, c.hi, c.hiClosed, col);
        dot(X, y, c.lo, c.loClosed, col);
      } else {
        text(g, '∅', W / 2, y - 20, {
          font: `700 ${fs + 6}px ${th.font}`,
          color: col,
        });
      }
      // ganze Zahlen im Ergebnis markieren
      if (k === 'interval') {
        for (let v = Math.ceil(c.lo); v <= Math.floor(c.hi); v++) {
          if (!inCombined(c, v)) continue;
          g.beginPath();
          g.arc(X(v), y - 16, 3, 0, Math.PI * 2);
          g.fillStyle = col;
          g.fill();
        }
      }
      text(g, combinedSetText(), W / 2, H - (narrow ? 18 : 22), {
        font: `700 ${fs + 2}px ${th.font}`,
        color: th.text,
      });
    }

    /* ---------- Alltag ---------- */
    function drawEveryday(): void {
      const th = ctx.theme;
      const s0 = sc();
      const sol = solve(s0.a, s0.b, s0.c, s0.d, s0.rel);
      const hidden = ctx.hidden;
      plot.begin();
      if (!hidden && sol.kind === 'bound') {
        const left = sol.rel === 'lt' || sol.rel === 'le';
        const from = left ? 0 : Math.max(0, sol.x);
        const to = left ? Math.min(s0.xMax, sol.x) : s0.xMax;
        if (to > from)
          plot.fillBetween(
            () => 1e6,
            () => 0,
            from,
            to,
            { fill: th.series[2]!, alpha: 0.12 },
          );
      }
      plot.grid({ minor: false });
      plot.axes();
      plot.fn(ga, { color: th.series[1]!, width: 2.5, from: 0, to: s0.xMax });
      plot.fn(fa, { color: th.series[0]!, width: 2.5, from: 0, to: s0.xMax });
      if (!hidden && sol.kind === 'bound' && sol.x >= 0 && sol.x <= s0.xMax) {
        plot.vline(sol.x, { color: th.series[2]!, width: 1.5, dash: [5, 4] });
        plot.point(sol.x, fa(sol.x), { color: th.series[2]!, radius: 5 });
      }
      const x = scX();
      const ok = holds(fa(x), ga(x), s0.rel);
      plot.segment([x, fa(x)], [x, ga(x)], {
        color: ok ? th.series[2]! : th.muted,
        width: 2,
        dash: [3, 3],
      });
      plot.point(x, ga(x), { color: th.series[1]!, radius: 4.5 });
      plot.end();

      // Text unter dem Diagramm
      const g = surface.g;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 560;
      const fs = narrow ? 12 : 14;
      let y = regionPlot(W, H).h + (narrow ? 14 : 18);
      const lx = narrow ? 14 : 56;
      const line = (str: string, col: string, weight = 600) => {
        text(g, str, lx, y, {
          font: `${weight} ${fs}px ${th.font}`,
          color: col,
          align: 'left',
        });
        y += fs * 1.6;
      };
      line(`— ${s0.left[ctx.lang]}`, th.series[0]!);
      line(`— ${s0.right[ctx.lang]}`, th.series[1]!);
      line(s0.question[ctx.lang], th.text, 700);
      line(`${tr('aAt', { x: fmt.num(x, s0.integer ? 0 : 1), u: s0.xLabel[ctx.lang], l: money(fa(x)), r: money(ga(x)) })}`, th.muted, 500);
      line(ctx.t(ok ? 'aYes' : 'aNo'), ok ? th.series[2]! : th.series[3]!, 700);
    }

    /* ---------- Halbebene ---------- */
    function drawHalf(): void {
      const th = ctx.theme;
      const r = rel();
      const below = r === 'lt' || r === 'le';
      const strict = r === 'lt' || r === 'gt';
      plot.begin();
      plot.fillBetween(hf, () => (below ? -1e4 : 1e4), H_RANGE[0] - 1, H_RANGE[1] + 1, { fill: th.series[2]!, alpha: 0.16 });
      plot.grid({ minor: false });
      plot.axes();
      // einige Gitterpunkte als Probe
      for (let gx = -5; gx <= 5; gx += 2) {
        for (let gy = -5; gy <= 5; gy += 2) {
          const ok = inHalfPlane(p.m, p.n, r, gx, gy);
          plot.point(gx, gy, {
            color: ok ? th.series[2]! : th.muted,
            radius: 2.5,
            hollow: !ok,
          });
        }
      }
      plot.fn(hf, {
        color: th.series[0]!,
        width: 2.5,
        dash: strict ? [8, 6] : undefined,
      });
      const ok = inHalfPlane(p.m, p.n, r, p.px, p.py);
      plot.segment([p.px, p.py], [p.px, hf(p.px)], {
        color: ok ? th.series[2]! : th.muted,
        width: 1.5,
        dash: [3, 3],
      });
      plot.point(p.px, hf(p.px), { color: th.series[0]!, radius: 3.5 });
      plot.point(p.px, p.py, { color: ok ? th.series[2]! : th.series[3]!, radius: 5 });
      plot.end();

      const g = surface.g;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 560;
      const fs = narrow ? 12 : 14;
      const reg = regionPlot(W, H);
      const x = narrow ? 14 : reg.w + 16;
      let y = narrow ? reg.h + 18 : 40;
      const maxW = narrow ? W - 28 : W - reg.w - 28;
      const line = (str: string, col: string, weight = 600, size = fs) => {
        g.font = `${weight} ${size}px ${th.font}`;
        for (const part of wrap(g, str, maxW)) {
          text(g, part, x, y, {
            font: `${weight} ${size}px ${th.font}`,
            color: col,
            align: 'left',
          });
          y += size * 1.45;
        }
        y += 4;
      };
      line(`y ${sym(r)} ${term(p.m, p.n)}`, th.series[0]!, 800, fs + 4);
      line(ctx.t(strict ? 'hBoundStrict' : 'hBoundClosed'), th.muted, 500);
      line(`${tr('hPoint', { x: n(p.px), y: n(p.py), l: n(p.py), r: sym(r), rr: n(hf(p.px)) })}`, th.text, 600);
      line(`${ok ? '✓' : '✗'} ${ctx.t(ok ? 'wOk' : 'wNot')}`, ok ? th.series[2]! : th.series[3]!, 800, fs + 2);
    }

    /* ---------- Übung ---------- */
    function wrap(g: CanvasRenderingContext2D, str: string, maxW: number): string[] {
      const lines: string[] = [];
      let cur = '';
      for (const w of str.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          lines.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) lines.push(cur);
      return lines;
    }

    function drawQuiz(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 600;
      const pad = narrow ? 18 : 36;
      const maxW = W - 2 * pad;
      let y = pad;
      g.textAlign = 'left';
      g.textBaseline = 'top';
      g.font = `700 ${narrow ? 13 : 15}px ${th.font}`;
      g.fillStyle = th.series[0]!;
      g.fillText(tr('qTitle', { n: p.qn }), pad, y);
      y += narrow ? 26 : 32;
      const fs = narrow ? 16 : 20;
      g.font = `600 ${fs}px ${th.font}`;
      g.fillStyle = th.text;
      for (const line of wrap(g, task.text[ctx.lang], maxW)) {
        g.fillText(line, pad, y);
        y += fs * 1.35;
      }
      y += 8;
      if (task.choices) {
        g.font = `600 ${narrow ? 14 : 16}px ${th.font}`;
        task.choices.forEach((c, i) => {
          g.fillStyle = p.qa.trim() === String(i + 1) ? th.series[0]! : th.text;
          g.fillText(`${i + 1}  ${c[ctx.lang]}`, pad + 12, y);
          y += narrow ? 22 : 26;
        });
        y += 6;
      }
      g.font = `500 ${narrow ? 13 : 15}px ${th.font}`;
      g.fillStyle = th.muted;
      const ans = p.qa.trim();
      g.fillText(ans ? tr('qYour', { a: ans }) : ctx.t(task.choices ? 'qHow' : 'qHowNum'), pad, y);
      y += 28;
      if (badInput) {
        g.fillStyle = th.series[3]!;
        g.fillText(ctx.t('qBad'), pad, y);
        y += 26;
      }
      if (verdict !== null) {
        g.font = `800 ${narrow ? 20 : 26}px ${th.font}`;
        g.fillStyle = verdict ? th.series[2]! : th.series[3]!;
        for (const line of wrap(g, ctx.t(verdict ? 'qOk' : 'qNo'), maxW)) {
          g.fillText(line, pad, y);
          y += narrow ? 26 : 34;
        }
        y += 4;
        if (verdict || tries >= 2) {
          g.font = `500 ${narrow ? 13 : 15}px ${th.font}`;
          g.fillStyle = th.text;
          for (const line of wrap(g, `${ctx.t('qSol')}: ${task.solution[ctx.lang]}`, maxW)) {
            g.fillText(line, pad, y);
            y += (narrow ? 13 : 15) * 1.4;
          }
        }
      }
      const cnt = Math.min(10, score.all);
      for (let i = 0; i < 10; i++) {
        g.beginPath();
        g.arc(W / 2 - 90 + i * 20, H - 22, 6, 0, Math.PI * 2);
        g.fillStyle = i < cnt ? (i < score.right ? th.series[2]! : th.series[3]!) : withAlpha(th.muted, 0.25);
        g.fill();
      }
    }

    function runCheck(): void {
      const res = checkTask(task, p.qa);
      if (res === null) {
        badInput = true;
        return;
      }
      badInput = false;
      verdict = res;
      tries += 1;
      if (tries === 1)
        score = {
          right: score.right + (res ? 1 : 0),
          all: score.all + 1,
          streak: res ? score.streak + 1 : 0,
        };
    }

    const canvasKey = () =>
      p.mode === 'waage' ? 'canvasW' : p.mode === 'doppelt' ? 'canvasD' : p.mode === 'alltag' ? 'canvasA' : p.mode === 'halbebene' ? 'canvasH' : p.mode === 'ueben' ? 'canvasQ' : 'canvas';

    return {
      update(changed, source) {
        if (source === 'init' || source === 'replace' || ['mode', 'a', 'b', 'c', 'd', 'rel'].some((k) => changed.has(k))) {
          stamps.clear();
          scanning = false;
          if (p.mode === 'waage') stamps.add(Math.round(p.t * 2));
        }
        if (changed.has('t') && p.mode === 'waage') stamps.add(Math.round(p.t * 2));
        if (source === 'init' || source === 'replace' || changed.has('qn')) {
          task = makeTask(p.qn);
          verdict = null;
          tries = 0;
          badInput = false;
        }
        if (changed.has('qa')) {
          if (verdict === false) verdict = null;
          badInput = false;
        }
        surface.canvas.setAttribute('aria-label', ctx.t(canvasKey()));
        setRange();
        updateReadouts();
      },
      action(id) {
        if (id === 'scan') {
          stamps.clear();
          if (prefersReducedMotion()) {
            for (let k = X_RANGE[0] * 2; k <= X_RANGE[1] * 2; k++) stamps.add(k);
          } else {
            scanX = X_RANGE[0];
            scanning = true;
            stamps.add(scanX * 2);
            ctx.clock.play();
          }
        } else if (id === 'clear') {
          stamps.clear();
          scanning = false;
        } else if (id === 'check') runCheck();
        else if (id === 'next') {
          ctx.set({ qn: p.qn >= 999 ? 1 : p.qn + 1, qa: '' });
          return;
        }
        updateReadouts();
        ctx.requestRender();
      },
      tick(dt) {
        if (p.mode !== 'waage') return;
        if (!scanning) {
          // Start ohne Knopf: ebenfalls alle Zahlen durchgehen
          stamps.clear();
          scanX = X_RANGE[0];
          scanning = true;
        }
        const before = Math.floor(scanX * 2);
        scanX = Math.min(X_RANGE[1], scanX + Math.min(dt, 0.05) * 3);
        for (let k = before; k <= Math.floor(scanX * 2); k++) stamps.add(k);
        if (scanX >= X_RANGE[1]) {
          scanning = false;
          ctx.clock.pause();
          scanX = X_RANGE[0];
        }
        updateReadouts();
      },
      resetTime() {
        scanning = false;
        scanX = X_RANGE[0];
      },
      render() {
        surface.begin();
        plot.resize();
        if (p.mode === 'waage') return drawBalance();
        if (p.mode === 'doppelt') return drawCombined();
        if (p.mode === 'alltag') return drawEveryday();
        if (p.mode === 'halbebene') return drawHalf();
        if (p.mode === 'ueben') return drawQuiz();
        drawPlot();
        drawBelow();
      },
      destroy: () => surface.destroy(),
    };
  },
});
