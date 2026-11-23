import { defineSimulation, drawCard, ease, Plot, prefersReducedMotion, roundRect, Surface, TapTarget, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { matchRound, ruleQuiz, stationaryPoints, type RuleChoice, derive, evaluate, hasX, mainStep, NotSupported, numericSlope, parse, sameFunction, simplify, substitute, toText, type Expr, type Part, type RuleId, type Step } from './model';

const L = (de: string, en: string) => ({ de, en });
type Loc = { de: string; en: string };

/* ------------------------------------------------------------------ */
/* Regeln: Name, Formel, Farbe                                          */
/* ------------------------------------------------------------------ */

const RULES: Record<RuleId, { name: Loc; formula: string }> = {
  const: { name: L('Konstante', 'Constant'), formula: '(c)′ = 0' },
  x: { name: L('Ableitung von x', 'Derivative of x'), formula: '(x)′ = 1' },
  sum: { name: L('Summenregel', 'Sum rule'), formula: '(u ± v)′ = u′ ± v′' },
  factor: { name: L('Faktorregel', 'Constant multiple rule'), formula: '(c · u)′ = c · u′' },
  power: { name: L('Potenzregel', 'Power rule'), formula: '(xⁿ)′ = n · xⁿ⁻¹' },
  product: { name: L('Produktregel', 'Product rule'), formula: '(u · v)′ = u′ · v + u · v′' },
  quotient: { name: L('Quotientenregel', 'Quotient rule'), formula: '(u / v)′ = (u′ · v − u · v′) / v²' },
  chain: { name: L('Kettenregel', 'Chain rule'), formula: '(g(h(x)))′ = g′(h(x)) · h′(x)' },
  sin: { name: L('Ableitung von sin', 'Derivative of sin'), formula: '(sin x)′ = cos x' },
  cos: { name: L('Ableitung von cos', 'Derivative of cos'), formula: '(cos x)′ = −sin x' },
  tan: { name: L('Ableitung von tan', 'Derivative of tan'), formula: '(tan x)′ = 1 / cos² x' },
  exp: { name: L('Ableitung von eˣ', 'Derivative of eˣ'), formula: '(eˣ)′ = eˣ' },
  ln: { name: L('Ableitung von ln', 'Derivative of ln'), formula: '(ln x)′ = 1 / x' },
  sqrt: { name: L('Ableitung von √x', 'Derivative of √x'), formula: '(√x)′ = 1 / (2√x)' },
  abs: { name: L('Ableitung von |x|', 'Derivative of |x|'), formula: '(|x|)′ = x / |x|' },
  expA: { name: L('Ableitung von aˣ', 'Derivative of aˣ'), formula: '(aˣ)′ = aˣ · ln a' },
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * Ableitungs-Werkstatt: Ein eingegebener Term wird nach Summen-, Faktor-,
 * Potenz-, Produkt-, Quotienten- und Kettenregel abgeleitet. Die Teile
 * (u und v, äußere und innere Funktion) sind farbig, der Graph zeigt f, f′
 * und die Tangente an einer ziehbaren Stelle. Im Übungsmodus prüft die
 * Simulation eine selbst gefundene Ableitung.
 */
export default defineSimulation({
  id: 'ableitungsregeln',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.56 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'f',
      type: 'text',
      label: L('Funktion f(x)', 'Function f(x)'),
      default: 'x^2·sin(x)',
      visibleIf: (v) => v.mode !== 'quiz' && v.mode !== 'match',
      maxLength: 60,
      placeholder: L('z. B. x^2·sin(x)', 'e.g. x^2·sin(x)'),
      help: L(
        'Rechenzeichen + − · / ^, Klammern, Dezimalkomma. Funktionen sin, cos, tan, e^(…) bzw. exp, ln, sqrt (oder √). Malpunkte dürfen fehlen: 2x, 3sin(x).',
        'Operators + − · / ^, brackets, decimals. Functions sin, cos, tan, e^(…) or exp, ln, sqrt (or √). You may leave out multiplication dots: 2x, 3sin(x).',
      ),
    },
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'rule', label: L('Regel für den ganzen Term', 'Rule for the whole term') },
        { value: 'steps', label: L('Alle Schritte', 'All steps') },
        { value: 'check', label: L('Selbst ableiten und prüfen', 'Differentiate yourself and check') },
        { value: 'graph', label: L('Graph von f′ entsteht', 'Building the graph of f′') },
        { value: 'quiz', label: L('Übung: Welche Regel zuerst?', 'Practice: which rule first?') },
        { value: 'match', label: L('Übung: f und f′ zuordnen', 'Practice: match f and f′') },
      ],
      default: 'rule',
    },
    { key: 'qn', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'quiz' || v.mode === 'match' },
    {
      key: 'qa',
      type: 'choice',
      label: L('Deine Antwort', 'Your answer'),
      options: [
        { value: 'sum', label: L('Summenregel', 'Sum rule') },
        { value: 'factor', label: L('Faktorregel', 'Constant multiple rule') },
        { value: 'power', label: L('Potenzregel', 'Power rule') },
        { value: 'product', label: L('Produktregel', 'Product rule') },
        { value: 'quotient', label: L('Quotientenregel', 'Quotient rule') },
        { value: 'chain', label: L('Kettenregel', 'Chain rule') },
        { value: 'basic', label: L('Grundableitung', 'Basic derivative') },
      ],
      default: 'sum',
      visibleIf: (v) => v.mode === 'quiz',
    },
    {
      key: 'ma',
      type: 'choice',
      label: L('Graph von f′', 'Graph of f′'),
      options: [
        { value: '0', label: L('A', 'A') },
        { value: '1', label: L('B', 'B') },
        { value: '2', label: L('C', 'C') },
        { value: '3', label: L('D', 'D') },
      ],
      default: '0',
      visibleIf: (v) => v.mode === 'match',
    },
    {
      key: 'g',
      type: 'text',
      label: L('Deine Ableitung f′(x)', 'Your derivative f′(x)'),
      default: '',
      maxLength: 80,
      placeholder: L('z. B. 2x·sin(x) + x^2·cos(x)', 'e.g. 2x·sin(x) + x^2·cos(x)'),
      visibleIf: (v) => v.mode === 'check',
    },
    { key: 'x0', type: 'number', label: L('Stelle x₀', 'Point x₀'), min: -5, max: 5, step: 0.05, default: 1, help: L('An dieser Stelle zeigt der Graph die Tangente an f und den Wert f′(x₀).', 'At this point the graph shows the tangent to f and the value f′(x₀).') },
    { key: 'parts', type: 'boolean', group: 'view', label: L('Teilfunktionen im Graphen', 'Parts in the graph'), default: true },
    { key: 'tan', type: 'boolean', group: 'view', label: L('Tangente und Steigungsdreieck', 'Tangent and slope triangle'), default: true },
    { key: 'show', type: 'boolean', group: 'view', label: L('Lösung zeigen (f′ im Graphen)', 'Show solution (f′ in the graph)'), default: true, visibleIf: (v) => v.mode === 'check' },
  ],
  resultsParam: 'show',
  actions: [
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'check' },
    { id: 'reveal', label: L('Lösung zeigen', 'Show solution'), visibleIf: (v) => v.mode === 'check' },
    { id: 'trace', label: L('Tangente laufen lassen', 'Run the tangent'), primary: true, visibleIf: (v) => v.mode === 'graph' },
    { id: 'qcheck', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'quiz' || v.mode === 'match' },
    { id: 'qnext', label: L('Nächste Aufgabe', 'Next task'), visibleIf: (v) => v.mode === 'quiz' || v.mode === 'match' },
  ],
  readouts: [
    { key: 'f', label: L('Funktion', 'Function') },
    { key: 'rule', label: L('Regel', 'Rule') },
    { key: 'fp', label: L('Ableitung', 'Derivative'), spoiler: true },
    { key: 'at', label: L('Steigung an der Stelle x₀', 'Slope at x₀'), spoiler: true },
  ],
  presets: [
    { id: 'power', label: L('Potenzregel: x⁵', 'Power rule: x⁵'), values: { f: 'x^5', mode: 'rule', x0: 1 } },
    { id: 'sum', label: L('Summe und Faktor: 3x⁴ − 2x + 7', 'Sum and factor: 3x⁴ − 2x + 7'), values: { f: '3x^4 - 2x + 7', mode: 'rule', x0: 1 } },
    { id: 'product', label: L('Produktregel: x² · sin(x)', 'Product rule: x² · sin(x)'), values: { f: 'x^2·sin(x)', mode: 'rule', x0: 3.15 } },
    { id: 'chain', label: L('Kettenregel: e^(2x + 1)', 'Chain rule: e^(2x + 1)'), values: { f: 'e^(2x+1)', mode: 'rule', x0: -1 } },
    { id: 'sine', label: L('Sinus verschoben: 2 sin(3(x − 1)) + 1', 'Shifted sine: 2 sin(3(x − 1)) + 1'), values: { f: '2·sin(3·(x−1)) + 1', mode: 'rule', x0: 1 } },
    { id: 'quot', label: L('Quotientenregel: (x + 1)/(x² + 1)', 'Quotient rule: (x + 1)/(x² + 1)'), values: { f: '(x+1)/(x^2+1)', mode: 'rule', x0: 0 } },
    { id: 'mix', label: L('Produkt mit Kette: x² · e^(−x)', 'Product with chain: x² · e^(−x)'), values: { f: 'x^2·e^(-x)', mode: 'steps', x0: 2 } },
    { id: 'graphx3', label: L('Graph von f′: x³ − 3x', 'Graph of f′: x³ − 3x'), values: { f: 'x^3 - 3x', mode: 'graph', x0: -2 } },
    { id: 'graphsin', label: L('Graph von f′: sin(x)', 'Graph of f′: sin(x)'), values: { f: 'sin(x)', mode: 'graph', x0: 0 } },
    { id: 'quiz', label: L('Übung: Welche Regel zuerst?', 'Practice: which rule first?'), values: { mode: 'quiz', qn: 1 } },
    { id: 'match', label: L('Übung: f und f′ zuordnen', 'Practice: match f and f′'), values: { mode: 'match', qn: 1 } },
    { id: 'practice', label: L('Übung: (2x + 1)³ selbst ableiten', 'Practice: differentiate (2x + 1)³'), values: { f: '(2x+1)^3', mode: 'check', g: '', show: false, x0: 0 } },
  ],
  strings: {
    de: {
      graphT: 'Vom Graphen von f zum Graphen von f′',
      graphG: 'Die Steigung der Tangente an f ist der Wert von f′. Steigt f, ist f′ positiv; fällt f, ist f′ negativ.',
      graphAt: 'bei x = {x}: Steigung {m}',
      graphUp: 'f steigt → f′ > 0', graphDown: 'f fällt → f′ < 0', graphFlat: 'waagerechte Tangente → f′ = 0',
      graphMax: 'Hochpunkt bei x ≈ {x}', graphMin: 'Tiefpunkt bei x ≈ {x}', graphSad: 'Sattelpunkt bei x ≈ {x}',
      graphRule: 'Hoch- und Tiefpunkte von f sind Nullstellen von f′ mit Vorzeichenwechsel.',
      graphNone: 'Keine waagerechte Tangente im Bild.',
      quizT: 'Welche Regel brauchst du zuerst?', quizHow: 'Schau, was ganz außen steht: eine Summe, ein Produkt, ein Bruch oder eine verkettete Funktion? Wähle und tippe auf „Prüfen“.',
      quizOk: 'Richtig!', quizNo: 'Leider nicht – zuerst kommt die {r}.', quizScore: '{k} von {n} richtig', basicName: 'Grundableitung',
      matchT: 'Welcher Graph gehört zu f′?', matchHow: 'Tippe auf A, B, C oder D und dann auf „Prüfen“. Tipp: Wo hat f waagerechte Tangenten? Dort hat f′ Nullstellen.',
      matchOk: 'Richtig – {c} ist der Graph von f′.', matchNo: 'Noch nicht – richtig ist {c}.',
      canvas: 'Links die Ableitung Schritt für Schritt mit farbig markierten Teilen, rechts die Graphen von f und f′ mit Tangente an einer ziehbaren Stelle.',
      given: 'f(x) =',
      deriv: 'f′(x) =',
      insert: 'eingesetzt',
      simplified: 'vereinfacht',
      outerOf: 'äußere Funktion',
      innerOf: 'innere Funktion',
      factorC: 'konstanter Faktor',
      noRule: 'Konstante: Die Ableitung ist 0.',
      basic: 'Grundableitung – keine Kettenregel nötig.',
      steps: 'Alle Schritte (von außen nach innen)',
      more: '… und {k} weitere Schritte',
      yours: 'Deine Ableitung',
      typeHere: 'Gib rechts unter „Deine Ableitung“ einen Term ein und drücke „Prüfen“.',
      right: 'Richtig! Deine Ableitung stimmt überall mit f′ überein.',
      notYet: 'Noch nicht richtig.',
      wrong: 'An der Stelle x = {x} liefert deine Ableitung {a}, richtig wäre {b}.',
      wrongGraph: 'Vergleiche die Graphen: Wo liegt deine Kurve neben f′?',
      hint: 'Tipp: {rule}',
      parseError: 'Der Term lässt sich ab Zeichen {p} nicht lesen.',
      parseEmpty: 'Bitte einen Term eingeben, z. B. x^2·sin(x).',
      notSupported: 'Terme wie x^x (x in Basis und Hochzahl) werden hier nicht abgeleitet.',
      noX: 'Der Term enthält kein x: Er ist konstant, die Ableitung ist 0.',
      gError: 'Deine Ableitung lässt sich nicht lesen.',
      slope: 'Steigung {m}',
      check: 'Probe: Differenzenquotient {m}',
      at: 'f′({x}) = {m}',
      hidden: 'Lösung verdeckt',
      fLabel: 'f',
      fpLabel: 'f′',
      gLabel: 'deine',
    },
    en: {
      graphT: 'From the graph of f to the graph of f′',
      graphG: 'The slope of the tangent to f is the value of f′. Where f rises, f′ is positive; where f falls, f′ is negative.',
      graphAt: 'at x = {x}: slope {m}',
      graphUp: 'f rises → f′ > 0', graphDown: 'f falls → f′ < 0', graphFlat: 'horizontal tangent → f′ = 0',
      graphMax: 'maximum at x ≈ {x}', graphMin: 'minimum at x ≈ {x}', graphSad: 'saddle point at x ≈ {x}',
      graphRule: 'Maxima and minima of f are zeros of f′ where the sign changes.',
      graphNone: 'No horizontal tangent in view.',
      quizT: 'Which rule do you need first?', quizHow: 'Look at what is outermost: a sum, a product, a fraction or a composite function? Choose and tap “Check”.',
      quizOk: 'Correct!', quizNo: 'Not quite – first comes the {r}.', quizScore: '{k} of {n} correct', basicName: 'basic derivative',
      matchT: 'Which graph belongs to f′?', matchHow: 'Tap A, B, C or D and then “Check”. Hint: where does f have horizontal tangents? There f′ has zeros.',
      matchOk: 'Correct – {c} is the graph of f′.', matchNo: 'Not yet – the right one is {c}.',
      canvas: 'On the left the derivative step by step with coloured parts, on the right the graphs of f and f′ with the tangent at a draggable point.',
      given: 'f(x) =',
      deriv: 'f′(x) =',
      insert: 'substituted',
      simplified: 'simplified',
      outerOf: 'outer function',
      innerOf: 'inner function',
      factorC: 'constant factor',
      noRule: 'Constant: the derivative is 0.',
      basic: 'Basic derivative – no chain rule needed.',
      steps: 'All steps (from outside in)',
      more: '… and {k} more steps',
      yours: 'Your derivative',
      typeHere: 'Enter a term under “Your derivative” and press “Check”.',
      right: 'Correct! Your derivative agrees with f′ everywhere.',
      notYet: 'Not quite yet.',
      wrong: 'At x = {x} your derivative gives {a}, the correct value is {b}.',
      wrongGraph: 'Compare the graphs: where does your curve leave f′?',
      hint: 'Hint: {rule}',
      parseError: 'The term cannot be read from character {p} on.',
      parseEmpty: 'Please enter a term, e.g. x^2·sin(x).',
      notSupported: 'Terms like x^x (x in base and exponent) are not differentiated here.',
      noX: 'The term contains no x: it is constant, the derivative is 0.',
      gError: 'Your derivative cannot be read.',
      slope: 'slope {m}',
      check: 'check: difference quotient {m}',
      at: 'f′({x}) = {m}',
      hidden: 'solution hidden',
      fLabel: 'f',
      fpLabel: 'f′',
      gLabel: 'yours',
    },
  },
  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const T = (e: Expr) => toText(e, ctx.lang);

    /* -------------------------------------------------------------- */
    /* Zustand                                                         */
    /* -------------------------------------------------------------- */

    type State =
      | { ok: true; f: Expr; fs: Expr; d: Expr; steps: Step[] }
      | { ok: false; msg: string; pos?: number };
    let st: State = analyse();
    /** Eigene Ableitung im Übungsmodus. */
    let mine: { e: Expr | null; error: boolean } = { e: null, error: false };
    /** Ergebnis der letzten Prüfung. */
    let verdict: { ok: boolean; at?: number } | null = null;

    function analyse(): State {
      const r = parse(p.f);
      if (!r.ok) return { ok: false, msg: r.msg === 'empty' ? tr('parseEmpty') : tr('parseError', { p: r.pos + 1 }), pos: r.pos };
      try {
        const res = derive(r.e);
        return { ok: true, f: r.e, fs: simplify(r.e), d: res.d, steps: res.steps };
      } catch (e) {
        if (e instanceof NotSupported) return { ok: false, msg: tr('notSupported') };
        throw e;
      }
    }
    function readMine(): void {
      if (!p.g.trim()) {
        mine = { e: null, error: false };
        return;
      }
      const r = parse(p.g);
      mine = r.ok ? { e: r.e, error: false } : { e: null, error: true };
    }
    readMine();

    /* -------------------------------------------------------------- */
    /* Animation                                                       */
    /* -------------------------------------------------------------- */

    /** Neuer Term: Karte baut sich auf, f′ wird von links gezeichnet. */
    const buildTw = new Tween(1100, ease.outCubic);
    /** Ergebnis der Prüfung ploppt auf. */
    const verdictTw = new Tween(520, ease.outBack);
    buildTw.play();

    /* -------------------------------------------------------------- */
    /* Layout                                                          */
    /* -------------------------------------------------------------- */

    const wide = () => surface.width >= 600 && surface.width >= surface.height * 1.2;
    function regions(): { card: Rect; plot: Rect } {
      const w = surface.width;
      const h = surface.height;
      const pad = 10;
      if (wide()) {
        const cw = Math.round(w * 0.47);
        return { card: { x: pad, y: pad, w: cw - pad, h: h - 2 * pad }, plot: { x: cw + pad, y: pad, w: w - cw - 2 * pad, h: h - 2 * pad } };
      }
      const ch = Math.round(h * 0.47);
      return { card: { x: pad, y: pad, w: w - 2 * pad, h: ch }, plot: { x: pad, y: ch + 2 * pad, w: w - 2 * pad, h: h - ch - 3 * pad } };
    }

    /* -------------------------------------------------------------- */
    /* Farben der Teile                                                */
    /* -------------------------------------------------------------- */

    const COL = {
      f: () => th().series[0]!,
      fp: () => th().series[1]!,
      u: () => th().series[2]!,
      v: () => th().series[4]!,
      outer: () => th().series[3]!,
      inner: () => th().series[5]!,
      mine: () => th().series[3]!,
    };
    const partColor = (role: Part['role']) => (role === 'u' ? COL.u() : role === 'v' ? COL.v() : role === 'outer' ? COL.outer() : role === 'inner' ? COL.inner() : th().muted);

    /* -------------------------------------------------------------- */
    /* Graph                                                           */
    /* -------------------------------------------------------------- */

    let plotRect: Rect = { x: 0, y: 0, w: 100, h: 100 };
    const plot = new Plot(surface, {
      x: [-5, 5],
      y: [-4, 4],
      equalAspect: false,
      region: () => ({ x: plotRect.x + 4, y: plotRect.y + 4, w: plotRect.w - 8, h: plotRect.h - 8 }),
      xAxis: { label: 'x' },
      yAxis: { label: 'y' },
    });

    /** Sichtbarer Bereich passend zu f und f′ (robust gegen Polstellen). */
    function fitRange(): void {
      if (!st.ok) return plot.setRange([-5, 5], [-4, 4]);
      const vals: number[] = [];
      for (let k = 0; k <= 240; k++) {
        const x = -5 + (10 * k) / 240;
        for (const e of [st.f, st.d]) {
          const v = evaluate(e, x);
          if (Number.isFinite(v)) vals.push(v);
        }
      }
      if (vals.length < 10) return plot.setRange([-5, 5], [-4, 4]);
      vals.sort((a, b) => a - b);
      let lo = vals[Math.floor(vals.length * 0.06)]!;
      let hi = vals[Math.floor(vals.length * 0.94)]!;
      lo = Math.min(lo, 0);
      hi = Math.max(hi, 0);
      if (hi - lo < 2) {
        const m = (hi + lo) / 2;
        lo = m - 1;
        hi = m + 1;
      }
      // sehr steile Kurven (e^x): Ausschnitt um f(x₀) statt alles zeigen
      if (hi - lo > 36) {
        const c0 = evaluate(st.f, p.x0);
        const c = Number.isFinite(c0) ? clamp(c0, lo, hi) : (lo + hi) / 2;
        lo = Math.max(lo, c - 12);
        hi = Math.min(hi, c + 24);
        lo = Math.min(lo, 0);
        hi = Math.max(hi, 0);
      }
      const pad = (hi - lo) * 0.18;
      plot.setRange([-5, 5], [lo - pad, hi + pad]);
    }
    fitRange();

    // Ziehbarer Punkt P auf f
    plot.addHandle({
      get: () => [p.x0, st.ok ? safe(evaluate(st.f, p.x0)) : 0],
      set: (x) => ctx.set({ x0: clamp(x, -5, 5) }),
      enabled: () => !ctx.locked && st.ok,
      color: () => COL.f(),
      axis: 'x',
    });

    function safe(v: number): number {
      return Number.isFinite(v) ? v : 0;
    }

    /** Lösung (f′) sichtbar? Im Übungsmodus nur nach „Lösung zeigen“. */
    const solutionVisible = () => (p.mode === 'check' ? p.show : p.mode === 'quiz' ? quizVerdict !== null : true);

    function drawPlot(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      plotRect = R;
      drawCard(g, R, t);
      plot.resize();
      plot.begin();
      plot.grid({ minor: true });
      plot.axes();
      if (st.ok) {
        const s = st;
        const top = mainStep(s.steps);
        const reveal = buildTw.value;
        const xs = plot.bounds;
        const toX = xs.xMin + (xs.xMax - xs.xMin) * clamp((reveal - 0.25) / 0.75, 0, 1);
        // Teilfunktionen blass
        if (p.parts && top && p.mode !== 'check' && solutionVisible()) {
          for (const part of top.parts) {
            if (part.role === 'c' || part.role === 'outer' || !hasX(part.expr)) continue;
            plot.fn((x) => evaluate(part.expr, x), { color: withAlpha(partColor(part.role), 0.55), width: 1.6, dash: [6, 5] });
          }
        }
        // f
        plot.fn((x) => evaluate(s.f, x), { color: COL.f(), width: 2.8 });
        // f′ (von links gezeichnet)
        if (solutionVisible()) plot.fn((x) => evaluate(s.d, x), { color: COL.fp(), width: 2.4, to: toX });
        // eigene Ableitung
        if (p.mode === 'check' && mine.e) {
          const e = mine.e;
          plot.fn((x) => evaluate(e, x), { color: COL.mine(), width: 2.2, dash: [8, 5] });
        }
        // Tangente in P
        const x0 = p.x0;
        const y0 = evaluate(s.f, x0);
        const m = evaluate(s.d, x0);
        if (Number.isFinite(y0) && Number.isFinite(m) && p.tan) {
          plot.line([x0, y0], [x0 + 1, y0 + m], { color: withAlpha(t.text, 0.55), width: 1.6 });
          if (solutionVisible()) {
            // Steigungsdreieck (Breite 1)
            plot.segment([x0, y0], [x0 + 1, y0], { color: withAlpha(COL.fp(), 0.85), width: 1.8 });
            plot.segment([x0 + 1, y0], [x0 + 1, y0 + m], { color: withAlpha(COL.fp(), 0.85), width: 1.8 });
            plot.text(x0 + 0.5, y0, '1', { color: COL.fp(), size: 12, weight: '600', offset: [0, m >= 0 ? 12 : -12], halo: true });
            plot.text(x0 + 1, y0 + m / 2, fmt.num(m, 2), { color: COL.fp(), size: 12, weight: 'bold', offset: [8, 0], align: 'left', halo: true });
            // Punkt auf f′ und Verbindung
            if (reveal >= 0.999) {
              plot.segment([x0, y0], [x0, m], { color: withAlpha(COL.fp(), 0.5), width: 1.2, dash: [3, 4] });
              plot.point(x0, m, { color: COL.fp(), radius: 4.5 });
            }
          }
        }
        // Beschriftungen der Kurven am rechten Rand
        const lx = xs.xMax - (xs.xMax - xs.xMin) * 0.04;
        const lab = (e: Expr, s2: string, col: string, dy: number) => {
          const v = evaluate(e, lx);
          if (!Number.isFinite(v) || v < xs.yMin || v > xs.yMax) return;
          plot.text(lx, v, s2, { color: col, size: 13, weight: 'bold', align: 'right', offset: [0, dy], halo: true, math: true });
        };
        lab(s.f, 'f', COL.f(), -12);
        if (solutionVisible() && reveal >= 0.999) lab(s.d, 'f′', COL.fp(), 14);
      }
      plot.end();
    }

    /* -------------------------------------------------------------- */
    /* Karte: Text mit farbigen Teilen                                 */
    /* -------------------------------------------------------------- */

    interface Seg {
      s: string;
      c?: string;
      w?: number;
    }

    function segWidth(g: CanvasRenderingContext2D, segs: Seg[], size: number): number {
      let w = 0;
      for (const sg of segs) {
        g.font = `${sg.w ?? 500} ${size}px ${th().font}`;
        w += g.measureText(sg.s).width;
      }
      return w;
    }
    /** Zeile aus Teilen; zu breit → Schrift kleiner, notfalls Umbruch an Teilen. Liefert die Höhe. */
    function segLine(g: CanvasRenderingContext2D, segs: Seg[], x: number, y: number, maxW: number, size: number, alpha = 1): number {
      let s = size;
      while (s > 10.5 && segWidth(g, segs, s) > maxW) s -= 0.5;
      g.save();
      g.globalAlpha = alpha;
      g.textBaseline = 'middle';
      g.textAlign = 'left';
      let cx = x;
      let cy = y;
      for (const sg of segs) {
        g.font = `${sg.w ?? 500} ${s}px ${th().font}`;
        const w = g.measureText(sg.s).width;
        if (cx + w > x + maxW && cx > x + 20) {
          cx = x + 18;
          cy += s * 1.4;
        }
        g.fillStyle = sg.c ?? th().text;
        g.fillText(sg.s, cx, cy);
        cx += w;
      }
      g.restore();
      return cy - y + s * 1.45;
    }

    function wrapTerm(e: Expr): string {
      const s = T(e);
      return e.k === 'add' || e.k === 'sub' || (e.k === 'num' && e.v < 0) || e.k === 'neg' ? `(${s})` : s;
    }
    /** Äußere Funktion mit z statt x (g(z) = sin z). */
    const zText = (e: Expr) => T(e).replace(/x/g, 'z');

    /** f(x) mit farbigen Teilen der obersten Regel. */
    function coloredF(step: Step | undefined, f: Expr): Seg[] {
      if (!step || !same0(step.expr, f)) return [{ s: T(f), c: COL.f(), w: 600 }];
      const parts = step.parts;
      const u = parts.find((q) => q.role === 'u');
      const v = parts.find((q) => q.role === 'v');
      const c = parts.find((q) => q.role === 'c');
      switch (step.rule) {
        case 'product':
          return [{ s: wrapTerm(u!.expr), c: COL.u(), w: 700 }, { s: ' · ' }, { s: wrapTerm(v!.expr), c: COL.v(), w: 700 }];
        case 'quotient':
          return [{ s: wrapTerm(u!.expr), c: COL.u(), w: 700 }, { s: ' / ' }, { s: wrapTerm(v!.expr), c: COL.v(), w: 700 }];
        case 'sum':
          return [{ s: T(u!.expr), c: COL.u(), w: 700 }, { s: f.k === 'sub' ? ' − ' : ' + ' }, { s: wrapTerm(v!.expr), c: COL.v(), w: 700 }];
        case 'factor':
          if (c && u) return [{ s: c.expr.k === 'num' && c.expr.v === -1 ? '−' : `${wrapTerm(c.expr)} · ` , c: th().muted, w: 700 }, { s: wrapTerm(u.expr), c: COL.u(), w: 700 }];
          return [{ s: T(f), c: COL.f(), w: 600 }];
        case 'chain': {
          const inner = parts.find((q) => q.role === 'inner')!;
          const outerT = zText(parts.find((q) => q.role === 'outer')!.expr);
          // innere Funktion farbig in die äußere einsetzen
          const idx = outerT.indexOf('z');
          const pre = outerT.slice(0, idx);
          const post = outerT.slice(idx + 1);
          const innerT = T(inner.expr);
          const needPar = !pre.endsWith('(') && (inner.expr.k !== 'x' && inner.expr.k !== 'num');
          return [
            { s: pre + (needPar ? '(' : ''), c: COL.outer(), w: 700 },
            { s: innerT, c: COL.inner(), w: 700 },
            { s: (needPar ? ')' : '') + post, c: COL.outer(), w: 700 },
          ];
        }
        default:
          return [{ s: T(f), c: COL.f(), w: 600 }];
      }
    }

    /** Regel mit den vereinfachten Teilen eingesetzt (farbig). */
    function inserted(step: Step): Seg[] {
      const q = (role: Part['role']) => step.parts.find((x) => x.role === role);
      const sd = (e: Expr | undefined) => (e ? simplify(e) : null);
      const w = (e: Expr | null) => (e ? wrapTerm(e) : '');
      const u = q('u');
      const v = q('v');
      const c = q('c');
      const o = q('outer');
      const inn = q('inner');
      switch (step.rule) {
        case 'product':
          return [{ s: w(sd(u!.d)), c: COL.u(), w: 700 }, { s: ' · ' }, { s: w(v!.expr), c: COL.v() }, { s: ' + ' }, { s: w(u!.expr), c: COL.u() }, { s: ' · ' }, { s: w(sd(v!.d)), c: COL.v(), w: 700 }];
        case 'quotient':
          return [{ s: '(' }, { s: w(sd(u!.d)), c: COL.u(), w: 700 }, { s: ' · ' }, { s: w(v!.expr), c: COL.v() }, { s: ' − ' }, { s: w(u!.expr), c: COL.u() }, { s: ' · ' }, { s: w(sd(v!.d)), c: COL.v(), w: 700 }, { s: ') / ' }, { s: `${w(v!.expr)}²`, c: COL.v() }];
        case 'chain': {
          const outerAtInner = simplify(substitute(o!.d!, inn!.expr));
          return [{ s: w(outerAtInner), c: COL.outer(), w: 700 }, { s: ' · ' }, { s: w(sd(inn!.d)), c: COL.inner(), w: 700 }];
        }
        case 'sum':
          return [{ s: T(sd(u!.d)!), c: COL.u(), w: 700 }, { s: step.expr.k === 'sub' ? ' − ' : ' + ' }, { s: w(sd(v!.d)), c: COL.v(), w: 700 }];
        case 'factor':
          return [{ s: w(simplify(c!.expr)), c: th().muted, w: 700 }, { s: ' · ' }, { s: w(sd(u!.d)), c: COL.u(), w: 700 }];
        default:
          return [];
      }
    }

    function same0(a: Expr, b: Expr): boolean {
      return a === b;
    }

    /** Zeilen für die Teile (u = …, u′ = …). */
    function partRows(step: Step): { label: string; e: string; d: string; c: string }[] {
      return step.parts
        .filter((q) => q.role !== 'c')
        .map((q) => {
          if (q.role === 'outer') return { label: `g(z) = ${zText(q.expr)}`, e: '', d: `g′(z) = ${zText(simplify(q.d!))}`, c: COL.outer() };
          if (q.role === 'inner') return { label: `h(x) = ${T(q.expr)}`, e: '', d: `h′(x) = ${T(simplify(q.d!))}`, c: COL.inner() };
          const n = q.role;
          return { label: `${n} = ${T(q.expr)}`, e: '', d: `${n}′ = ${T(simplify(q.d!))}`, c: partColor(n) };
        });
    }

    /* -------------------------------------------------------------- */
    /* Karte zeichnen                                                  */
    /* -------------------------------------------------------------- */

    function chip(g: CanvasRenderingContext2D, label: string, x: number, y: number, col: string, size: number, alpha = 1): number {
      g.save();
      g.globalAlpha = alpha;
      g.font = `700 ${size}px ${th().font}`;
      const w = g.measureText(label).width + 16;
      g.fillStyle = withAlpha(col, th().dark ? 0.24 : 0.14);
      roundRect(g, x, y - size * 0.85, w, size * 1.7, size * 0.85);
      g.fill();
      g.fillStyle = col;
      g.textBaseline = 'middle';
      g.fillText(label, x + 8, y + 0.5);
      g.restore();
      return w;
    }

    function drawCardBody(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      drawCard(g, R, t, COL.f());
      const x = R.x + 16;
      const maxW = R.w - 32;
      const size = R.w < 360 ? 13.5 : R.w < 520 ? 15 : 17;
      let y = R.y + 24;
      const reveal = buildTw.value;
      const fade = (k: number) => clamp((reveal - k * 0.1) / 0.3, 0, 1);

      if (!st.ok) {
        y += segLine(g, [{ s: tr('given'), c: t.muted, w: 600 }, { s: ` ${p.f}`, c: t.text, w: 600 }], x, y, maxW, size);
        // Fehlerstelle markieren
        if (st.pos !== undefined) {
          g.save();
          g.font = `600 ${size}px ${t.font}`;
          const before = g.measureText(`${tr('given')} ${p.f.slice(0, st.pos)}`).width;
          g.fillStyle = withAlpha(t.series[1]!, 0.25);
          roundRect(g, x + before - 1, y - size * 2.1, Math.max(8, g.measureText(p.f[st.pos] ?? ' ').width + 2), size * 1.4, 3);
          g.fill();
          g.restore();
        }
        y += 6;
        segLine(g, [{ s: st.msg, c: t.series[1], w: 600 }], x, y, maxW, size - 1);
        return;
      }
      const s = st;
      const line = (segs: Seg[], d = 0) => (y += segLine(g, segs, x, y, maxW, size + d));
      /** Fließtext mit Zeilenumbruch an Wortgrenzen (feste Schriftgröße). */
      const para = (text: string, c: string, d = 0, w = 500) => {
        const fs = Math.max(11, size + d);
        g.save();
        g.font = `${w} ${fs}px ${t.font}`;
        g.fillStyle = c;
        g.textBaseline = 'middle';
        g.textAlign = 'left';
        let cur = '';
        const flush = () => {
          g.fillText(cur, x, y);
          y += fs * 1.4;
          cur = '';
        };
        for (const word of text.split(' ')) {
          const next = cur ? `${cur} ${word}` : word;
          if (cur && g.measureText(next).width > maxW) {
            flush();
            cur = word;
          } else cur = next;
        }
        if (cur) flush();
        y += fs * 0.1;
        g.restore();
      };
      if (p.mode === 'graph') {
        const xt = traceX();
        const m = evaluate(s.d, xt);
        line([{ s: ctx.t('graphT'), c: COL.f(), w: 800 }], 0);
        line([{ s: `${tr('given')} `, c: t.muted, w: 600 }, { s: T(s.fs), c: COL.f(), w: 700 }], -1);
        line([{ s: `${tr('deriv')} `, c: t.muted, w: 600 }, { s: T(simplify(s.d)), c: COL.fp(), w: 700 }], -1);
        y += 4;
        line([{ s: tr('graphAt', { x: fmt.num(xt, 2), m: Number.isFinite(m) ? fmt.num(m, 2) : '–' }), c: COL.fp(), w: 700 }], -1);
        line([{ s: ctx.t(Math.abs(m) < 0.05 ? 'graphFlat' : m > 0 ? 'graphUp' : 'graphDown'), c: Math.abs(m) < 0.05 ? COL.outer() : m > 0 ? COL.u() : COL.fp(), w: 700 }], -1);
        y += 4;
        const sp = stationaryPoints(s.d, -5, 5);
        if (!sp.length) para(ctx.t('graphNone'), t.muted, -2);
        for (const q of sp.slice(0, 4)) line([{ s: tr(q.kind === 'max' ? 'graphMax' : q.kind === 'min' ? 'graphMin' : 'graphSad', { x: fmt.num(q.x, 2) }), c: COL.outer(), w: 600 }], -2);
        y += 4;
        para(ctx.t('graphRule'), t.text, -2, 600);
        y += 2;
        para(ctx.t('graphG'), t.muted, -2.5);
        return;
      }
      if (p.mode === 'quiz') {
        line([{ s: ctx.t('quizT'), c: COL.f(), w: 800 }], 0);
        line([{ s: `${tr('given')} `, c: t.muted, w: 600 }, { s: T(s.fs), c: t.text, w: 800 }], 3);
        y += 4;
        if (quizVerdict === null) para(ctx.t('quizHow'), t.muted, -2);
        else {
          line([{ s: quizVerdict ? ctx.t('quizOk') : tr('quizNo', { r: ruleName(quiz.answer) }), c: quizVerdict ? COL.u() : COL.fp(), w: 800 }], 1);
          if (quiz.answer !== 'basic') line([{ s: RULES[quiz.answer].formula, c: t.text, w: 600 }], -1);
          line([{ s: `${tr('deriv')} `, c: t.muted, w: 600 }, { s: T(simplify(s.d)), c: COL.fp(), w: 700 }], -1);
        }
        if (score.all) line([{ s: tr('quizScore', { k: score.right, n: score.all }), c: t.muted, w: 600 }], -2);
        return;
      }
      if (p.mode === 'match') {
        line([{ s: ctx.t('matchT'), c: COL.f(), w: 800 }], 0);
        line([{ s: `${tr('given')} `, c: t.muted, w: 600 }, { s: T(s.fs), c: COL.f(), w: 800 }], 1);
        const gh = Math.min(R.h * 0.38, 170);
        miniF(g, { x, y, w: maxW, h: gh }, s.f);
        y += gh + 16;
        if (matchVerdict === null) para(ctx.t('matchHow'), t.muted, -2.5);
        else {
          line([{ s: matchVerdict ? tr('matchOk', { c: 'ABCD'[match.target]! }) : tr('matchNo', { c: 'ABCD'[match.target]! }), c: matchVerdict ? COL.u() : COL.fp(), w: 800 }], 0);
          line([{ s: `${tr('deriv')} `, c: t.muted, w: 600 }, { s: T(simplify(s.d)), c: COL.fp(), w: 700 }], -1);
        }
        if (score.all) line([{ s: tr('quizScore', { k: score.right, n: score.all }), c: t.muted, w: 600 }], -2);
        return;
      }
      const top = mainStep(s.steps);
      // f(x) mit farbigen Teilen
      y += segLine(g, [{ s: `${tr('given')} `, c: t.muted, w: 600 }, ...coloredF(top, s.f)], x, y, maxW, size + 1.5, fade(0));
      y += 4;
      if (!top) {
        segLine(g, [{ s: hasX(s.f) ? tr('basic') : tr('noX'), c: t.muted }], x, y, maxW, size - 1, fade(1));
        return;
      }

      if (p.mode === 'check') {
        drawCheck(g, R, x, y, maxW, size, top);
        return;
      }

      if (p.mode === 'rule') {
        // Regel mit Formel
        const ruleCol = top.rule === 'chain' ? COL.outer() : top.rule === 'product' || top.rule === 'quotient' || top.rule === 'sum' ? COL.u() : COL.fp();
        const cw = chip(g, RULES[top.rule].name[ctx.lang], x, y + 4, ruleCol, size - 1.5, fade(1));
        y += 4;
        segLine(g, [{ s: RULES[top.rule].formula, c: t.muted, w: 500 }], x + cw + 10, y, maxW - cw - 10, size - 1.5, fade(1));
        y += size * 2;
        // Teile
        const rows = partRows(top);
        rows.forEach((r, k) => {
          const a = fade(2 + k);
          const half = maxW * 0.5;
          const h1 = segLine(g, [{ s: r.label, c: r.c, w: 700 }], x, y, half - 8, size - 0.5, a);
          const h2 = segLine(g, [{ s: '→  ', c: t.muted }, { s: r.d, c: r.c, w: 600 }], x + half, y, half, size - 0.5, a);
          y += Math.max(h1, h2) + 2;
        });
        if (top.rule === 'factor') {
          const c = top.parts.find((q) => q.role === 'c')!;
          y += segLine(g, [{ s: `c = ${T(simplify(c.expr))}  (${tr('factorC')})`, c: t.muted, w: 600 }], x, y, maxW, size - 0.5, fade(2));
        }
        if (rows.length === 0 && top.rule !== 'factor') y += segLine(g, [{ s: tr('basic'), c: t.muted }], x, y, maxW, size - 1, fade(2));
        y += 6;
        // eingesetzt
        const ins = inserted(top);
        if (ins.length) {
          const pre = top.expr === s.f ? `${tr('deriv')} ` : `(${T(top.expr)})′ = `;
          y += segLine(g, [{ s: `${tr('insert')}: `, c: t.muted, w: 500 }, { s: pre, c: t.text, w: 500 }, ...ins], x, y, maxW, size - 0.5, fade(4));
        }
        // Ergebnis
        drawResult(g, R, x, Math.max(y + 6, R.y + R.h - size * 3.6), maxW, size, fade(5));
        return;
      }

      // Alle Schritte
      y += segLine(g, [{ s: tr('steps'), c: t.muted, w: 600 }], x, y, maxW, size - 1.5, fade(1));
      const lineH = (size - 1) * 1.55;
      const room = Math.max(1, Math.floor((R.y + R.h - size * 3.8 - y) / lineH));
      const shown = s.steps.slice(0, room);
      shown.forEach((stp, k) => {
        const a = fade(2 + k * 0.6);
        const ix = x + Math.min(stp.depth, 4) * 14;
        const col = stp.rule === 'chain' ? COL.outer() : stp.rule === 'product' || stp.rule === 'quotient' ? COL.u() : stp.rule === 'sum' ? COL.v() : COL.fp();
        const cw = chip(g, RULES[stp.rule].name[ctx.lang], ix, y + lineH / 2 - 2, col, size - 3.5, a);
        const h = segLine(g, [{ s: `(${T(stp.expr)})′ = `, c: t.text, w: 500 }, { s: T(stp.result), c: col, w: 700 }], ix + cw + 8, y + lineH / 2 - 2, x + maxW - ix - cw - 8, size - 2, a);
        y += Math.max(lineH, h + 2);
      });
      if (s.steps.length > shown.length) segLine(g, [{ s: tr('more', { k: s.steps.length - shown.length }), c: t.muted }], x, y, maxW, size - 2, fade(3));
      drawResult(g, R, x, R.y + R.h - size * 3.6, maxW, size, fade(4));
    }

    function drawResult(g: CanvasRenderingContext2D, R: Rect, x: number, y: number, maxW: number, size: number, alpha: number): void {
      if (!st.ok) return;
      const t = th();
      g.save();
      g.globalAlpha = alpha;
      const box: Rect = { x: x - 8, y: y - size * 0.9, w: maxW + 16, h: R.y + R.h - (y - size * 0.9) - 10 };
      g.fillStyle = withAlpha(COL.fp(), t.dark ? 0.14 : 0.07);
      roundRect(g, box.x, box.y, box.w, box.h, 10);
      g.fill();
      g.restore();
      segLine(g, [{ s: `${tr('simplified')}:  `, c: t.muted, w: 500 }, { s: `${tr('deriv')} ${T(st.d)}`, c: COL.fp(), w: 700 }], x, y + 4, maxW, size + 1, alpha);
    }

    function drawCheck(g: CanvasRenderingContext2D, R: Rect, x: number, y0: number, maxW: number, size: number, top: Step): void {
      const t = th();
      let y = y0 + 4;
      y += segLine(g, [{ s: `${tr('yours')}: `, c: t.muted, w: 600 }, { s: mine.e ? `${tr('deriv')} ${T(simplify(mine.e))}` : mine.error ? tr('gError') : '…', c: mine.error ? t.series[1] : COL.mine(), w: 700 }], x, y, maxW, size);
      y += 6;
      if (!mine.e && !mine.error) {
        y += segLine(g, [{ s: tr('typeHere'), c: t.muted }], x, y, maxW, size - 1.5);
      }
      if (verdict) {
        const a = verdictTw.running ? verdictTw.value : 1;
        const ok = verdict.ok;
        const col = ok ? t.series[2]! : t.series[1]!;
        g.save();
        g.globalAlpha = clamp(a, 0, 1);
        const bh = size * 3.4;
        g.translate(x + maxW / 2, y + bh / 2);
        g.scale(0.85 + 0.15 * a, 0.85 + 0.15 * a);
        g.fillStyle = withAlpha(col, t.dark ? 0.2 : 0.1);
        g.strokeStyle = withAlpha(col, 0.6);
        roundRect(g, -maxW / 2, -bh / 2, maxW, bh, 12);
        g.fill();
        g.stroke();
        g.restore();
        text(g, ok ? '✓' : '✗', x + 22, y + bh / 2, { font: `800 ${size + 10}px ${t.font}`, color: col });
        segLine(g, [{ s: ok ? tr('right') : tr('notYet'), c: col, w: 700 }], x + 44, y + bh / 2, maxW - 50, size - 0.5, a);
        y += bh + 10;
        if (!ok && verdict.at !== undefined && st.ok && mine.e) {
          const at = verdict.at;
          y += segLine(g, [{ s: tr('wrong', { x: fmt.num(at, 2), a: fmt.num(evaluate(mine.e, at), 3), b: fmt.num(evaluate(st.d, at), 3) }), c: col, w: 600 }], x, y, maxW, size - 1.5);
        }
        if (!ok) {
          y += segLine(g, [{ s: tr('hint', { rule: `${RULES[top.rule].name[ctx.lang]}: ${RULES[top.rule].formula}` }), c: t.muted }], x, y, maxW, size - 1.5);
          segLine(g, [{ s: tr('wrongGraph'), c: t.muted }], x, y + 2, maxW, size - 1.5);
        }
      }
      if (p.show) drawResult(g, R, x, R.y + R.h - size * 3.6, maxW, size, 1);
    }

    /* -------------------------------------------------------------- */
    /* Ergebnisse                                                      */
    /* -------------------------------------------------------------- */


    /* -------------------------------------------------------------- */
    /* Übungen und Graph von f′                                        */
    /* -------------------------------------------------------------- */

    let quiz = ruleQuiz(p.qn);
    let quizVerdict: boolean | null = null;
    let match = matchRound(p.qn);
    let matchVerdict: boolean | null = null;
    let score = { right: 0, all: 0 };
    let matchBoxes: Rect[] = [];
    const ruleName = (c: RuleChoice) => (c === 'basic' ? ctx.t('basicName') : RULES[c].name[ctx.lang]);
    new TapTarget(surface, {
      hit: (px, py) => {
        if (p.mode !== 'match') return null;
        const k = matchBoxes.findIndex((b) => px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h);
        return k < 0 ? null : String(k);
      },
      onTap: (id) => {
        if (!ctx.locked) ctx.set({ ma: id as '0' | '1' | '2' | '3' });
      },
    });
    function check(): void {
      if (p.mode === 'quiz' && quizVerdict === null) {
        quizVerdict = p.qa === quiz.answer;
        score = { right: score.right + (quizVerdict ? 1 : 0), all: score.all + 1 };
        ctx.announce(quizVerdict ? ctx.t('quizOk') : tr('quizNo', { r: ruleName(quiz.answer) }));
        verdictTw.play();
      }
      if (p.mode === 'match' && matchVerdict === null) {
        matchVerdict = +p.ma === match.target;
        score = { right: score.right + (matchVerdict ? 1 : 0), all: score.all + 1 };
        ctx.announce(matchVerdict ? tr('matchOk', { c: 'ABCD'[match.target]! }) : tr('matchNo', { c: 'ABCD'[match.target]! }));
        verdictTw.play();
      }
      ctx.requestRender();
    }

    // Graph von f′: zweites Koordinatensystem unter f
    let dRect: Rect = { x: -1000, y: -1000, w: 10, h: 10 };
    const plotD = new Plot(surface, {
      x: [-5, 5],
      y: [-4, 4],
      equalAspect: false,
      zoom: false,
      pan: false,
      controls: false,
      region: () => (p.mode === 'graph' ? { x: dRect.x + 4, y: dRect.y + 4, w: dRect.w - 8, h: dRect.h - 8 } : { x: -1000, y: -1000, w: 10, h: 10 }),
      xAxis: { label: 'x' },
      yAxis: { label: 'f′' },
    });
    const traceTw = new Tween(7000, ease.linear);
    const traceX = () => (traceTw.running ? -5 + 10 * traceTw.value : p.x0);
    function fitD(): void {
      if (!st.ok) return;
      const vals: number[] = [];
      for (let k = 0; k <= 200; k++) {
        const v = evaluate(st.d, -3.5 + k * 0.035);
        if (Number.isFinite(v)) vals.push(v);
      }
      if (!vals.length) return;
      vals.sort((a, b) => a - b);
      let lo = Math.min(0, vals[Math.floor(vals.length * 0.02)]!);
      let hi = Math.max(0, vals[Math.floor(vals.length * 0.98)]!);
      if (hi - lo < 2) {
        lo -= 1;
        hi += 1;
      }
      const pad = (hi - lo) * 0.15;
      plotD.setRange([-5, 5], [lo - pad, hi + pad]);
    }
    function drawGraphMode(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      const top: Rect = { x: R.x, y: R.y, w: R.w, h: Math.round(R.h * 0.52) };
      dRect = { x: R.x, y: R.y + top.h + 8, w: R.w, h: R.h - top.h - 8 };
      plotRect = top;
      drawCard(g, top, t);
      drawCard(g, dRect, t);
      if (!st.ok) return;
      const s = st;
      const xt = traceX();
      const sp = stationaryPoints(s.d, -5, 5);
      // oben: f mit Tangente
      plot.resize();
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      plot.fn((x) => evaluate(s.f, x), { color: COL.f(), width: 2.8 });
      const y0 = evaluate(s.f, xt);
      const m = evaluate(s.d, xt);
      if (Number.isFinite(y0) && Number.isFinite(m)) {
        const ink = Math.abs(m) < 0.05 ? COL.outer() : m > 0 ? COL.u() : COL.fp();
        plot.line([xt, y0], [xt + 1, y0 + m], { color: withAlpha(ink, 0.85), width: 2 });
        plot.point(xt, y0, { color: ink, radius: 5 });
      }
      for (const q of sp) {
        const fy = evaluate(s.f, q.x);
        if (!Number.isFinite(fy)) continue;
        plot.point(q.x, fy, { color: COL.outer(), radius: 5, hollow: true });
        plot.text(q.x, fy, q.kind === 'max' ? 'H' : q.kind === 'min' ? 'T' : 'S', { color: COL.outer(), size: 12, weight: 'bold', offset: [0, q.kind === 'min' ? 16 : -14], halo: true });
      }
      plot.end();
      // unten: f′ entsteht
      fitD();
      plotD.resize();
      plotD.begin();
      plotD.grid({ minor: false });
      plotD.axes();
      plotD.fn((x) => evaluate(s.d, x), { color: withAlpha(COL.fp(), traceTw.running ? 0.15 : 0.35), width: 1.6 });
      plotD.fn((x) => evaluate(s.d, x), { color: COL.fp(), width: 2.8, to: xt });
      if (Number.isFinite(m)) {
        plotD.point(xt, m, { color: COL.fp(), radius: 5.5 });
        plotD.segment([xt, 0], [xt, m], { color: withAlpha(COL.fp(), 0.5), width: 1.2, dash: [3, 4] });
      }
      for (const q of sp) plotD.point(q.x, 0, { color: COL.outer(), radius: 5, hollow: true });
      plotD.end();
      // Verbindung über beide Diagramme
      const [px] = plot.toPx(xt, 0);
      g.save();
      g.strokeStyle = withAlpha(t.text, 0.25);
      g.setLineDash([4, 5]);
      g.beginPath();
      g.moveTo(px, top.y + 6);
      g.lineTo(px, dRect.y + dRect.h - 6);
      g.stroke();
      g.restore();
      g.save();
      g.font = `700 13px ${t.font}`;
      g.fillStyle = COL.f();
      g.fillText('f', top.x + 14, top.y + 22);
      g.fillStyle = COL.fp();
      g.fillText('f′', dRect.x + 14, dRect.y + 22);
      g.restore();
    }
    function drawMatch(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      drawCard(g, R, t);
      plotRect = { x: -1000, y: -1000, w: 10, h: 10 };
      plot.resize();
      const pad = 10;
      const cw = (R.w - 3 * pad) / 2;
      const ch = (R.h - 3 * pad) / 2;
      matchBoxes = [];
      match.candidates.forEach((e, k) => {
        const bx = R.x + pad + (k % 2) * (cw + pad);
        const by = R.y + pad + Math.floor(k / 2) * (ch + pad);
        matchBoxes.push({ x: bx, y: by, w: cw, h: ch });
        const chosen = String(k) === p.ma;
        const isRight = matchVerdict !== null && k === match.target;
        g.save();
        g.fillStyle = t.dark ? '#0f141c' : '#f7f9fc';
        roundRect(g, bx, by, cw, ch, 8);
        g.fill();
        g.strokeStyle = isRight ? COL.u() : chosen ? COL.fp() : withAlpha(t.text, 0.2);
        g.lineWidth = chosen || isRight ? 3 : 1;
        g.stroke();
        // Kurve: x von −4 bis 4, y passend skaliert
        const xs: number[] = [];
        const ys: number[] = [];
        for (let i = 0; i <= 120; i++) {
          const x = -4 + (8 * i) / 120;
          xs.push(x);
          ys.push(evaluate(e, x));
        }
        const fin = ys.filter(Number.isFinite).sort((a, b) => a - b);
        let lo = Math.min(-1, fin[Math.floor(fin.length * 0.05)] ?? -1);
        let hi = Math.max(1, fin[Math.floor(fin.length * 0.95)] ?? 1);
        const padY = (hi - lo) * 0.15;
        lo -= padY;
        hi += padY;
        const X = (x: number) => bx + ((x + 4) / 8) * cw;
        const Y = (y: number) => by + ch - ((y - lo) / (hi - lo)) * ch;
        g.beginPath();
        g.rect(bx, by, cw, ch);
        g.clip();
        g.strokeStyle = withAlpha(t.text, 0.35);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(bx, Y(0));
        g.lineTo(bx + cw, Y(0));
        g.moveTo(X(0), by);
        g.lineTo(X(0), by + ch);
        g.stroke();
        g.strokeStyle = COL.fp();
        g.lineWidth = 2.4;
        g.beginPath();
        let pen = false;
        xs.forEach((x, i) => {
          const y = ys[i]!;
          if (!Number.isFinite(y)) {
            pen = false;
            return;
          }
          if (pen) g.lineTo(X(x), Y(y));
          else g.moveTo(X(x), Y(y));
          pen = true;
        });
        g.stroke();
        g.font = `800 16px ${t.font}`;
        g.fillStyle = chosen ? COL.fp() : t.text;
        g.fillText('ABCD'[k]!, bx + 10, by + 22);
        g.restore();
      });
    }
    /** Kleiner Graph von f in der Karte (Übung „Paare“). */
    function miniF(g: CanvasRenderingContext2D, R: Rect, e: Expr): void {
      const t = th();
      g.save();
      g.fillStyle = t.dark ? '#0f141c' : '#f7f9fc';
      roundRect(g, R.x, R.y, R.w, R.h, 8);
      g.fill();
      const ys: number[] = [];
      for (let i = 0; i <= 120; i++) ys.push(evaluate(e, -4 + (8 * i) / 120));
      const fin = ys.filter(Number.isFinite).sort((a, b) => a - b);
      let lo = Math.min(-1, fin[Math.floor(fin.length * 0.05)] ?? -1);
      let hi = Math.max(1, fin[Math.floor(fin.length * 0.95)] ?? 1);
      const padY = (hi - lo) * 0.15;
      lo -= padY;
      hi += padY;
      const X = (x: number) => R.x + ((x + 4) / 8) * R.w;
      const Y = (y: number) => R.y + R.h - ((y - lo) / (hi - lo)) * R.h;
      g.beginPath();
      g.rect(R.x, R.y, R.w, R.h);
      g.clip();
      g.strokeStyle = withAlpha(t.text, 0.35);
      g.beginPath();
      g.moveTo(R.x, Y(0));
      g.lineTo(R.x + R.w, Y(0));
      g.moveTo(X(0), R.y);
      g.lineTo(X(0), R.y + R.h);
      g.stroke();
      g.strokeStyle = COL.f();
      g.lineWidth = 2.6;
      g.beginPath();
      let pen = false;
      ys.forEach((y, i) => {
        const x = -4 + (8 * i) / 120;
        if (!Number.isFinite(y)) {
          pen = false;
          return;
        }
        if (pen) g.lineTo(X(x), Y(y));
        else g.moveTo(X(x), Y(y));
        pen = true;
      });
      g.stroke();
      g.restore();
    }

    function updateReadouts(): void {
      if (!st.ok) {
        ctx.readout('f', st.msg);
        ['rule', 'fp', 'at'].forEach((k) => ctx.readout(k, null));
        return;
      }
      ctx.readout('f', { html: `<var>f</var>(<var>x</var>) = ${esc(T(st.fs))}` });
      const top = mainStep(st.steps);
      ctx.readout('rule', top ? `${RULES[top.rule].name[ctx.lang]}: ${RULES[top.rule].formula}` : tr('noX'));
      ctx.readout('fp', { html: `<var>f</var>′(<var>x</var>) = ${esc(T(st.d))}` });
      const m = evaluate(st.d, p.x0);
      const n = numericSlope(st.f, p.x0);
      ctx.readout('at', Number.isFinite(m) ? `${tr('at', { x: fmt.num(p.x0, 2), m: fmt.num(m, 4) })} (${tr('check', { m: Number.isFinite(n) ? fmt.num(n, 4) : '–' })})` : '–');
    }
    function esc(s: string): string {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function runCheck(): void {
      if (!st.ok) return;
      readMine();
      if (!mine.e) {
        verdict = null;
        ctx.requestRender();
        return;
      }
      const r = sameFunction(st.d, mine.e);
      verdict = { ok: r.equal, at: r.at };
      verdictTw.play();
      ctx.requestRender();
    }

    /* -------------------------------------------------------------- */
    /* Ablauf                                                          */
    /* -------------------------------------------------------------- */

    return {
      update(changed, source) {
        if (changed.has('qn') || changed.has('mode') || source === 'init' || source === 'replace') {
          quiz = ruleQuiz(p.qn);
          match = matchRound(p.qn);
          quizVerdict = null;
          matchVerdict = null;
          const want = p.mode === 'quiz' ? quiz.term : p.mode === 'match' ? match.f : null;
          if (want !== null && want !== p.f) {
            ctx.set({ f: want });
            return;
          }
        }
        if (changed.has('qa') && source === 'input') quizVerdict = null;
        if (changed.has('ma') && source === 'input') matchVerdict = null;
        if (changed.has('f') || source === 'init') {
          st = analyse();
          fitRange();
          verdict = null;
          buildTw.play(source === 'init' || source === 'replace' ? 1300 : 900);
        }
        if (changed.has('mode')) buildTw.play(700);
        if (changed.has('g')) {
          readMine();
          verdict = null;
        }
        if (changed.has('show') && p.show) buildTw.play(900);
        updateReadouts();
      },
      action(id) {
        if (ctx.locked) return;
        if (id === 'check') runCheck();
        if (id === 'reveal') ctx.set({ show: true });
        if (id === 'trace') {
          if (prefersReducedMotion()) ctx.set({ x0: 5 });
          else traceTw.play();
          ctx.requestRender();
        }
        if (id === 'qcheck') check();
        if (id === 'qnext') ctx.set({ qn: p.qn >= 999 ? 1 : p.qn + 1 });
      },
      resetView() {
        fitRange();
        plot.resetView();
      },
      render() {
        const g = surface.begin();
        const R = regions();
        drawCardBody(g, R.card);
        if (p.mode === 'graph') drawGraphMode(g, R.plot);
        else if (p.mode === 'match') drawMatch(g, R.plot);
        else {
          dRect = { x: -1000, y: -1000, w: 10, h: 10 };
          drawPlot(g, R.plot);
        }
        if (buildTw.running || verdictTw.running || traceTw.running) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
