import { defineSimulation, drawCard, ease, Plot, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { derivative, evaluate, hasX, mul, parse, sameFunction, simplify, sub, toText, type Expr } from '../../../sim-core/expr';
import { definite, expAnsatz, integrate, NotIntegrable, simpson, type Ansatz, type IntRule, type IntStep } from './model';

const L = (de: string, en: string) => ({ de, en });
type Loc = { de: string; en: string };

/* ------------------------------------------------------------------ */
/* Regeln: Name und Formel                                              */
/* ------------------------------------------------------------------ */

const RULES: Record<IntRule, { name: Loc; formula: string }> = {
  const: { name: L('Konstante', 'Constant'), formula: '∫ c dx = c · x' },
  power: { name: L('Potenzregel', 'Power rule'), formula: '∫ xⁿ dx = xⁿ⁺¹ / (n + 1)' },
  recip: { name: L('Integral von 1/x', 'Integral of 1/x'), formula: '∫ 1/x dx = ln|x|' },
  exp: { name: L('Integral von eˣ', 'Integral of eˣ'), formula: '∫ eˣ dx = eˣ' },
  sin: { name: L('Integral von sin', 'Integral of sin'), formula: '∫ sin x dx = −cos x' },
  cos: { name: L('Integral von cos', 'Integral of cos'), formula: '∫ cos x dx = sin x' },
  sqrt: { name: L('Integral von √x', 'Integral of √x'), formula: '∫ √x dx = ⅔ · x^(3/2)' },
  sum: { name: L('Summenregel', 'Sum rule'), formula: '∫ (u ± v) dx = ∫ u dx ± ∫ v dx' },
  factor: { name: L('Faktorregel', 'Constant multiple rule'), formula: '∫ c · u dx = c · ∫ u dx' },
  linear: { name: L('Lineare Substitution', 'Linear substitution'), formula: '∫ g(ax + b) dx = G(ax + b) / a' },
  subst: { name: L('Substitution', 'Substitution'), formula: '∫ g(u(x)) · u′(x) dx = G(u(x))' },
  logsubst: { name: L('Logarithmische Integration', 'Logarithmic integration'), formula: '∫ u′/u dx = ln|u|' },
  parts: { name: L('Partielle Integration', 'Integration by parts'), formula: '∫ u · v′ dx = u · v − ∫ u′ · v dx' },
};

/** Woher kommt die Regel? Jede Integrationsregel ist eine umgedrehte Ableitungsregel. */
const ORIGIN: Record<IntRule, { rule: Loc; formula: string }> = {
  const: { rule: L('Ableitung von c · x', 'derivative of c · x'), formula: '(c · x)′ = c' },
  power: { rule: L('Potenzregel', 'power rule'), formula: '(xⁿ⁺¹)′ = (n + 1) · xⁿ' },
  recip: { rule: L('Ableitung von ln', 'derivative of ln'), formula: '(ln|x|)′ = 1/x' },
  exp: { rule: L('Ableitung von eˣ', 'derivative of eˣ'), formula: '(eˣ)′ = eˣ' },
  sin: { rule: L('Ableitung von cos', 'derivative of cos'), formula: '(−cos x)′ = sin x' },
  cos: { rule: L('Ableitung von sin', 'derivative of sin'), formula: '(sin x)′ = cos x' },
  sqrt: { rule: L('Potenzregel', 'power rule'), formula: '(x^(3/2))′ = 3/2 · √x' },
  sum: { rule: L('Summenregel', 'sum rule'), formula: '(U ± V)′ = U′ ± V′' },
  factor: { rule: L('Faktorregel', 'constant multiple rule'), formula: '(c · U)′ = c · U′' },
  linear: { rule: L('Kettenregel', 'chain rule'), formula: '(G(ax + b))′ = g(ax + b) · a' },
  subst: { rule: L('Kettenregel', 'chain rule'), formula: '(G(u(x)))′ = g(u(x)) · u′(x)' },
  logsubst: { rule: L('Kettenregel mit ln', 'chain rule with ln'), formula: '(ln|u|)′ = u′ / u' },
  parts: { rule: L('Produktregel', 'product rule'), formula: '(u · v)′ = u′ · v + u · v′' },
};

/** Grundintegrale (eine Zeile ohne weitere Teile). */
const BASIC: IntRule[] = ['const', 'power', 'recip', 'exp', 'sin', 'cos', 'sqrt'];

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const GREEK = ['γ', 'β', 'α', 'δ'];

/**
 * Integrations-Werkstatt: Zu einem eingegebenen Term wird eine Stammfunktion
 * nach Regeln gesucht (Potenz-, Summen-, Faktorregel, lineare Substitution,
 * Substitution, logarithmische und partielle Integration) oder per
 * Formansatz mit Koeffizientenvergleich bestimmt. Oben der Graph von f mit der
 * Fläche zwischen a und b, unten die Stammfunktion F + C: Der Höhenunterschied
 * F(b) − F(a) ist genau das Integral (Hauptsatz). Im Übungsmodus wird eine
 * selbst gefundene Stammfunktion durch Ableiten geprüft.
 */
export default defineSimulation({
  id: 'integrationsregeln',
  dragHint: true,
  layout: { aspect: 1.55, aspectNarrow: 0.37 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'f',
      type: 'text',
      label: L('Funktion f(x)', 'Function f(x)'),
      default: 'x·e^x',
      maxLength: 60,
      placeholder: L('z. B. x·e^x', 'e.g. x·e^x'),
      help: L(
        'Rechenzeichen + − · / ^, Klammern, Dezimalkomma. Funktionen sin, cos, e^(…) bzw. exp, ln, sqrt (oder √). Malpunkte dürfen fehlen: 2x, 3sin(x).',
        'Operators + − · / ^, brackets, decimals. Functions sin, cos, e^(…) or exp, ln, sqrt (or √). You may leave out multiplication dots: 2x, 3sin(x).',
      ),
    },
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'rule', label: L('Regel für den ganzen Term', 'Rule for the whole term') },
        { value: 'steps', label: L('Alle Schritte', 'All steps') },
        { value: 'ansatz', label: L('Formansatz (Polynom · e-Funktion)', 'Ansatz (polynomial · exponential)') },
        { value: 'check', label: L('Selbst integrieren und prüfen', 'Integrate yourself and check') },
      ],
      default: 'rule',
    },
    {
      key: 'g',
      type: 'text',
      label: L('Deine Stammfunktion F(x)', 'Your antiderivative F(x)'),
      default: '',
      maxLength: 80,
      placeholder: L('z. B. x·e^x − e^x', 'e.g. x·e^x − e^x'),
      visibleIf: (v) => v.mode === 'check',
    },
    { key: 'a', type: 'number', label: L('untere Grenze a', 'lower limit a'), min: -5, max: 5, step: 0.01, default: 0 },
    { key: 'b', type: 'number', label: L('obere Grenze b', 'upper limit b'), min: -5, max: 5, step: 0.01, default: 1 },
    {
      key: 'C',
      type: 'number',
      label: L('Konstante C', 'Constant C'),
      min: -5,
      max: 5,
      step: 0.25,
      default: 0,
      help: L('F + C ist für jedes C eine Stammfunktion. Am Integral F(b) − F(a) ändert C nichts.', 'F + C is an antiderivative for every C. It does not change the integral F(b) − F(a).'),
    },
    { key: 'area', type: 'boolean', group: 'view', label: L('Fläche und Integral von a bis b', 'Area and integral from a to b'), default: true },
    { key: 'family', type: 'boolean', group: 'view', label: L('Schar F + C zeigen', 'Show family F + C'), default: false },
    { key: 'show', type: 'boolean', group: 'view', label: L('Lösung zeigen (F im Graphen)', 'Show solution (F in the graph)'), default: true, visibleIf: (v) => v.mode === 'check' },
  ],
  resultsParam: 'show',
  actions: [
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'check' },
    { id: 'reveal', label: L('Lösung zeigen', 'Show solution'), visibleIf: (v) => v.mode === 'check' },
  ],
  readouts: [
    { key: 'f', label: L('Funktion', 'Function') },
    { key: 'rule', label: L('Regel', 'Rule') },
    { key: 'F', label: L('Stammfunktion', 'Antiderivative'), spoiler: true },
    { key: 'int', label: L('Integral von a bis b', 'Integral from a to b'), spoiler: true },
  ],
  presets: [
    { id: 'power', label: L('Potenzregel: ∫ x² dx von 0 bis 3', 'Power rule: ∫ x² dx from 0 to 3'), values: { f: 'x^2', mode: 'rule', a: 0, b: 3 } },
    { id: 'sum', label: L('Summe und Faktor: 3x² − 4x + 1', 'Sum and factor: 3x² − 4x + 1'), values: { f: '3x^2 - 4x + 1', mode: 'steps', a: 0, b: 2 } },
    { id: 'sine', label: L('∫ sin x dx von 0 bis π', '∫ sin x dx from 0 to π'), values: { f: 'sin(x)', mode: 'rule', a: 0, b: 3.14 } },
    { id: 'linear', label: L('Lineare Substitution: cos(2x)', 'Linear substitution: cos(2x)'), values: { f: 'cos(2x)', mode: 'rule', a: 0, b: 0.8 } },
    { id: 'exp', label: L('Lineare Substitution: e^(2x + 1)', 'Linear substitution: e^(2x + 1)'), values: { f: 'e^(2x+1)', mode: 'rule', a: -1, b: 0 } },
    { id: 'recip', label: L('∫ 1/x dx von 1 bis e', '∫ 1/x dx from 1 to e'), values: { f: '1/x', mode: 'rule', a: 1, b: 2.72 } },
    { id: 'subst', label: L('Substitution: 2x · e^(x²)', 'Substitution: 2x · e^(x²)'), values: { f: '2x·e^(x^2)', mode: 'rule', a: 0, b: 1 } },
    { id: 'log', label: L('u′/u: x/(x² + 1)', 'u′/u: x/(x² + 1)'), values: { f: 'x/(x^2+1)', mode: 'rule', a: 0, b: 2 } },
    { id: 'parts', label: L('Partielle Integration: x · eˣ', 'By parts: x · eˣ'), values: { f: 'x·e^x', mode: 'rule', a: 0, b: 1 } },
    { id: 'partsSin', label: L('Partielle Integration: x · sin x', 'By parts: x · sin x'), values: { f: 'x·sin(x)', mode: 'rule', a: 0, b: 3.14 } },
    { id: 'ln', label: L('∫ ln x dx (Trick: 1 · ln x)', '∫ ln x dx (trick: 1 · ln x)'), values: { f: 'ln(x)', mode: 'rule', a: 1, b: 2.72 } },
    { id: 'ansatz', label: L('Formansatz: (x² + 1) · eˣ', 'Ansatz: (x² + 1) · eˣ'), values: { f: '(x^2+1)·e^x', mode: 'ansatz', a: -2, b: 0 } },
    { id: 'family', label: L('Schar der Stammfunktionen', 'Family of antiderivatives'), values: { f: '2x', mode: 'rule', a: 0, b: 2, family: true } },
    { id: 'practice', label: L('Übung: ∫ (2x + 1)³ dx selbst', 'Practice: ∫ (2x + 1)³ dx yourself'), values: { f: '(2x+1)^3', mode: 'check', g: '', show: false, a: 0, b: 1 } },
  ],
  strings: {
    de: {
      canvas: 'Links die Stammfunktion Schritt für Schritt, rechts oben der Graph von f mit der Fläche zwischen a und b, rechts unten die Stammfunktion F + C mit dem Höhenunterschied F(b) − F(a).',
      given: 'f(x) =',
      anti: 'F(x) =',
      plusC: ' + C',
      insert: 'eingesetzt',
      result: 'Stammfunktion',
      basic: 'Grundintegral – direkt aus der Tabelle.',
      steps: 'Alle Schritte (von außen nach innen)',
      more: '… und {k} weitere Schritte',
      parts: 'Teile',
      inner: 'innere Funktion',
      innerD: 'innere Ableitung',
      outerG: 'Stammfunktion außen',
      factorK: 'Faktor',
      check: 'Probe: F′(x) = f(x) ✓',
      checkBad: 'Probe misslungen',
      rest: 'Restintegral',
      definite: 'Integral',
      undefinedInt: 'Zwischen a und b ist f nicht überall definiert – das Integral gibt es so nicht.',
      empty: 'a = b: Das Integral ist 0.',
      numeric: 'numerisch {v}',
      yours: 'Deine Stammfunktion',
      typeHere: 'Gib rechts unter „Deine Stammfunktion“ einen Term ein und drücke „Prüfen“.',
      right: 'Richtig! Die Ableitung deiner Funktion ist f.',
      rightC: 'Richtig! Sie unterscheidet sich von unserer Lösung nur um die Konstante {c}.',
      notYet: 'Noch nicht richtig.',
      wrong: 'Probe: Deine Funktion abgeleitet ergibt bei x = {x} den Wert {a}, f({x}) ist aber {b}.',
      wrongGraph: 'Leite deine Funktion zur Probe selbst ab.',
      hint: 'Tipp: {rule}',
      parseError: 'Der Term lässt sich ab Zeichen {p} nicht lesen.',
      parseEmpty: 'Bitte einen Term eingeben, z. B. x·e^x.',
      notIntegrable: 'Für diesen Term findet die Werkstatt keine Regel. Manche Funktionen wie e^(x²) haben gar keine Stammfunktion aus bekannten Funktionen.',
      gError: 'Deine Stammfunktion lässt sich nicht lesen.',
      ansatzNo: 'Der Formansatz passt hier nicht. Er ist für f(x) = Polynom · e^(ax + b) gedacht, z. B. (x² + 1) · eˣ oder x · e^(−2x).',
      ansatz: 'Ansatz: Die Stammfunktion hat dieselbe Form wie f',
      why: 'Warum? Umkehrung der {rule}:',
      probeA: 'Probe: F′(x) = f(x) ✓ – der Vergleich stimmt für alle x.',
      sameAs: 'zusammengefasst',
      ansatzF: 'Ableiten mit Produkt- und Kettenregel',
      compare: 'Koeffizientenvergleich mit f',
      solve: 'Lösen von oben nach unten',
      fLabel: 'f',
      FLabel: 'F + C',
      gLabel: 'deine',
      area: 'Fläche',
      balance: 'Bilanz',
      approxInfo: 'Das bestimmte Integral gibt es trotzdem – näherungsweise mit vielen schmalen Streifen berechnet:',
      plus: 'über der x-Achse zählt positiv',
      minus: 'unter der x-Achse negativ',
      diff: 'F(b) − F(a)',
    },
    en: {
      canvas: 'On the left the antiderivative step by step, top right the graph of f with the area between a and b, bottom right the antiderivative F + C with the height difference F(b) − F(a).',
      given: 'f(x) =',
      anti: 'F(x) =',
      plusC: ' + C',
      insert: 'substituted',
      result: 'Antiderivative',
      basic: 'Basic integral – straight from the table.',
      steps: 'All steps (from outside in)',
      more: '… and {k} more steps',
      parts: 'Parts',
      inner: 'inner function',
      innerD: 'inner derivative',
      outerG: 'outer antiderivative',
      factorK: 'factor',
      check: 'Check: F′(x) = f(x) ✓',
      checkBad: 'Check failed',
      rest: 'remaining integral',
      definite: 'Integral',
      undefinedInt: 'f is not defined everywhere between a and b – this integral does not exist.',
      empty: 'a = b: the integral is 0.',
      numeric: 'numerically {v}',
      yours: 'Your antiderivative',
      typeHere: 'Enter a term under “Your antiderivative” and press “Check”.',
      right: 'Correct! The derivative of your function is f.',
      rightC: 'Correct! It differs from our solution only by the constant {c}.',
      notYet: 'Not quite yet.',
      wrong: 'Check: the derivative of your function gives {a} at x = {x}, but f({x}) is {b}.',
      wrongGraph: 'Differentiate your function yourself to check.',
      hint: 'Hint: {rule}',
      parseError: 'The term cannot be read from character {p} on.',
      parseEmpty: 'Please enter a term, e.g. x·e^x.',
      notIntegrable: 'The workshop finds no rule for this term. Some functions like e^(x²) have no antiderivative made of known functions at all.',
      gError: 'Your antiderivative cannot be read.',
      ansatzNo: 'The ansatz does not fit here. It is meant for f(x) = polynomial · e^(ax + b), e.g. (x² + 1) · eˣ or x · e^(−2x).',
      ansatz: 'Ansatz: the antiderivative has the same form as f',
      why: 'Why? Reversing the {rule}:',
      probeA: 'Check: F′(x) = f(x) ✓ – the comparison holds for all x.',
      sameAs: 'combined',
      ansatzF: 'Differentiate with product and chain rule',
      compare: 'Compare coefficients with f',
      solve: 'Solve from the top down',
      fLabel: 'f',
      FLabel: 'F + C',
      gLabel: 'yours',
      area: 'area',
      balance: 'balance',
      approxInfo: 'The definite integral still exists – approximated with many thin strips:',
      plus: 'above the x-axis counts positive',
      minus: 'below the x-axis negative',
      diff: 'F(b) − F(a)',
    },
  },
  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const T = (e: Expr) => toText(e, ctx.lang);
    const N = (v: number, d = 3) => fmt.num(Math.abs(v) < 5e-13 ? 0 : v, d);

    /* -------------------------------------------------------------- */
    /* Zustand                                                         */
    /* -------------------------------------------------------------- */

    type State =
      | { ok: true; f: Expr; fs: Expr; F: Expr; steps: IntStep[]; probe: boolean; ansatz: Ansatz | null }
      | { ok: false; f?: Expr; msg: string; pos?: number; ansatz: Ansatz | null };
    let st: State = analyse();
    /** Eigene Stammfunktion im Übungsmodus. */
    let mine: { e: Expr | null; error: boolean } = { e: null, error: false };
    /** Ergebnis der letzten Prüfung. */
    let verdict: { ok: boolean; at?: number; c?: number } | null = null;
    /** Integral von a bis b (oder null, wenn f dort nicht überall definiert ist). */
    let integral: { value: number; numeric: number; Fa: number; Fb: number } | null = null;

    function analyse(): State {
      const r = parse(p.f);
      if (!r.ok) return { ok: false, msg: r.msg === 'empty' ? tr('parseEmpty') : tr('parseError', { p: r.pos + 1 }), pos: r.pos, ansatz: null };
      let ansatz: Ansatz | null = null;
      try {
        ansatz = expAnsatz(r.e);
      } catch {
        ansatz = null;
      }
      try {
        const res = integrate(r.e);
        const F = simplify(res.F);
        return { ok: true, f: r.e, fs: simplify(r.e), F, steps: res.steps, probe: sameFunction(derivative(F), r.e).equal, ansatz };
      } catch (e) {
        if (e instanceof NotIntegrable) return { ok: false, f: r.e, msg: tr('notIntegrable'), ansatz };
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

    /** f ist auf [a, b] überall definiert und endlich? */
    function definedOn(f: Expr, a: number, b: number): boolean {
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      for (let k = 0; k <= 400; k++) {
        const v = evaluate(f, lo + ((hi - lo) * k) / 400);
        if (!Number.isFinite(v) || Math.abs(v) > 1e7) return false;
      }
      return true;
    }
    /** Nur numerischer Wert, wenn es keine Stammfunktion gibt (z. B. e^(x²)). */
    let approx: number | null = null;
    function computeIntegral(): void {
      integral = null;
      approx = null;
      if (!st.ok) {
        if (st.f && definedOn(st.f, p.a, p.b)) approx = simpson(st.f, p.a, p.b);
        return;
      }
      if (!definedOn(st.f, p.a, p.b)) return;
      const Fa = evaluate(st.F, p.a);
      const Fb = evaluate(st.F, p.b);
      if (!Number.isFinite(Fa) || !Number.isFinite(Fb)) return;
      integral = { value: definite(st.F, p.a, p.b), numeric: simpson(st.f, p.a, p.b), Fa, Fb };
    }
    computeIntegral();

    /* -------------------------------------------------------------- */
    /* Animation                                                       */
    /* -------------------------------------------------------------- */

    /** Neuer Term: Karte baut sich auf, F wird von links gezeichnet. */
    const buildTw = new Tween(1200, ease.outCubic);
    /** Fläche läuft von a nach b, gleichzeitig wächst F(x) − F(a). */
    const sweepTw = new Tween(1400, ease.inOutCubic);
    /** Ergebnis der Prüfung ploppt auf. */
    const verdictTw = new Tween(520, ease.outBack);
    buildTw.play();
    sweepTw.play();

    /* -------------------------------------------------------------- */
    /* Layout                                                          */
    /* -------------------------------------------------------------- */

    const wide = () => surface.width >= 600 && surface.width >= surface.height * 1.2;
    function regions(): { card: Rect; top: Rect; bottom: Rect } {
      const w = surface.width;
      const h = surface.height;
      const pad = 10;
      if (wide()) {
        const cw = Math.round(w * 0.46);
        const pw = w - cw - 2 * pad;
        const ph = (h - 3 * pad) / 2;
        return {
          card: { x: pad, y: pad, w: cw - pad, h: h - 2 * pad },
          top: { x: cw + pad, y: pad, w: pw, h: ph },
          bottom: { x: cw + pad, y: 2 * pad + ph, w: pw, h: ph },
        };
      }
      const ch = Math.round(h * 0.47);
      const ph = (h - ch - 4 * pad) / 2;
      return {
        card: { x: pad, y: pad, w: w - 2 * pad, h: ch },
        top: { x: pad, y: ch + 2 * pad, w: w - 2 * pad, h: ph },
        bottom: { x: pad, y: ch + 3 * pad + ph, w: w - 2 * pad, h: ph },
      };
    }

    /* -------------------------------------------------------------- */
    /* Farben                                                          */
    /* -------------------------------------------------------------- */

    const COL = {
      f: () => th().series[0]!,
      F: () => th().series[1]!,
      pos: () => th().series[2]!,
      neg: () => th().series[3]!,
      u: () => th().series[2]!,
      v: () => th().series[4]!,
      inner: () => th().series[5]!,
      mine: () => th().series[3]!,
    };
    const ruleColor = (r: IntRule) =>
      r === 'parts' ? COL.u() : r === 'subst' || r === 'logsubst' || r === 'linear' ? COL.inner() : r === 'sum' || r === 'factor' ? COL.v() : COL.F();

    /* -------------------------------------------------------------- */
    /* Graphen                                                         */
    /* -------------------------------------------------------------- */

    let topRect: Rect = { x: 0, y: 0, w: 100, h: 100 };
    let botRect: Rect = { x: 0, y: 0, w: 100, h: 100 };
    const inset = (R: Rect) => ({ x: R.x + 4, y: R.y + 4, w: R.w - 8, h: R.h - 8 });
    const plotF = new Plot(surface, { x: [-5, 5], y: [-4, 4], equalAspect: false, region: () => inset(topRect), xAxis: { label: 'x' }, yAxis: { label: 'y' } });
    const plotA = new Plot(surface, { x: [-5, 5], y: [-4, 4], equalAspect: false, region: () => inset(botRect), xAxis: { label: 'x' }, yAxis: { label: 'y' } });

    /** Sichtbarer y-Bereich: robust gegen Polstellen und steile Kurven. */
    function robustRange(fns: ((x: number) => number)[], x0: number, x1: number, focus: number[], core?: [number, number]): [number, number] {
      const [lo0, hi0] = robustRangeAll(fns, x0, x1, focus);
      if (!core || core[0] === core[1]) return [lo0, hi0];
      // Kern: Werte zwischen a und b sollen gut sichtbar sein, der Rest nur, soweit es passt
      let clo = 0;
      let chi = 0;
      for (let k = 0; k <= 120; k++) {
        const x = core[0] + ((core[1] - core[0]) * k) / 120;
        for (const f of fns) {
          const v = f(x);
          if (Number.isFinite(v) && Math.abs(v) < 1e6) {
            clo = Math.min(clo, v);
            chi = Math.max(chi, v);
          }
        }
      }
      const span = Math.max(1, chi - clo);
      return [Math.max(lo0, clo - 0.9 * span), Math.min(hi0, chi + 0.9 * span)];
    }
    function robustRangeAll(fns: ((x: number) => number)[], x0: number, x1: number, focus: number[]): [number, number] {
      const vals: number[] = [];
      for (let k = 0; k <= 240; k++) {
        const x = x0 + ((x1 - x0) * k) / 240;
        for (const f of fns) {
          const v = f(x);
          if (Number.isFinite(v)) vals.push(v);
        }
      }
      if (vals.length < 10) return [-4, 4];
      vals.sort((a, b) => a - b);
      let lo = vals[Math.floor(vals.length * 0.06)]!;
      let hi = vals[Math.floor(vals.length * 0.94)]!;
      for (const v of focus) {
        if (Number.isFinite(v)) {
          lo = Math.min(lo, v);
          hi = Math.max(hi, v);
        }
      }
      lo = Math.min(lo, 0);
      hi = Math.max(hi, 0);
      if (hi - lo < 2) {
        const m = (hi + lo) / 2;
        lo = m - 1;
        hi = m + 1;
      }
      if (hi - lo > 40) {
        const fin = focus.filter(Number.isFinite);
        const c = fin.length ? fin.reduce((s, v) => s + v, 0) / fin.length : (lo + hi) / 2;
        lo = Math.max(lo, c - 16);
        hi = Math.min(hi, c + 20);
        lo = Math.min(lo, 0);
        hi = Math.max(hi, 0);
      }
      const pad = (hi - lo) * 0.16;
      return [lo - pad, hi + pad];
    }

    /** x-Bereich: Grenzen a und b gut sichtbar, mindestens von −1 bis 1. */
    function xRange(): [number, number] {
      const lo = Math.min(p.a, p.b);
      const hi = Math.max(p.a, p.b);
      const span = Math.max(4, hi - lo + 2.5);
      const mid = (lo + hi) / 2;
      let x0 = mid - span / 2;
      let x1 = mid + span / 2;
      if (x0 > -1) {
        x1 += -1 - x0;
        x0 = -1;
      }
      return [Math.max(-6, Math.min(x0, -0.5)), Math.min(6, Math.max(x1, 1))];
    }

    let xr: [number, number] = [-5, 5];
    function fitRanges(): void {
      xr = xRange();
      if (!st.ok) {
        const f = st.f;
        if (f) plotF.setRange(xr, robustRange([(x) => evaluate(f, x)], xr[0], xr[1], [], [Math.min(p.a, p.b), Math.max(p.a, p.b)]));
        else plotF.setRange(xr, [-4, 4]);
        plotA.setRange(xr, [-4, 4]);
        return;
      }
      const s = st;
      plotF.setRange(xr, robustRange([(x) => evaluate(s.f, x)], xr[0], xr[1], [evaluate(s.f, p.a), evaluate(s.f, p.b)], p.area ? [Math.min(p.a, p.b), Math.max(p.a, p.b)] : undefined));
      fitA();
    }
    function fitA(): void {
      if (!st.ok) return;
      const s = st;
      const fns: ((x: number) => number)[] = [(x) => evaluate(s.F, x) + p.C];
      const focus = [evaluate(s.F, p.a) + p.C, evaluate(s.F, p.b) + p.C];
      if (p.family) {
        fns.push((x) => evaluate(s.F, x) + p.C - 2, (x) => evaluate(s.F, x) + p.C + 2);
      }
      plotA.setRange(xr, robustRange(fns, xr[0], xr[1], focus, p.area ? [Math.min(p.a, p.b), Math.max(p.a, p.b)] : undefined));
    }
    fitRanges();

    // Ziehbare Grenzen a und b (auf der x-Achse des oberen Graphen)
    const limitHandle = (key: 'a' | 'b') =>
      plotF.addHandle({
        get: () => [p[key], 0],
        set: (x) => ctx.set({ [key]: Math.round(clamp(x, -5, 5) * 20) / 20 }),
        enabled: () => !ctx.locked && p.area,
        color: () => (key === 'a' ? COL.inner() : COL.v()),
        axis: 'x',
      });
    limitHandle('a');
    limitHandle('b');
    // Verschieben der Stammfunktion: C ziehen (unterer Graph)
    const cX = () => {
      const [x0, x1] = xr;
      return x0 + (x1 - x0) * 0.12;
    };
    plotA.addHandle({
      get: () => [cX(), st.ok ? safe(evaluate(st.F, cX())) + p.C : 0],
      set: (_x, y) => {
        if (!st.ok) return;
        const base = evaluate(st.F, cX());
        if (!Number.isFinite(base)) return;
        ctx.set({ C: Math.round(clamp(y - base, -5, 5) * 4) / 4 });
      },
      enabled: () => !ctx.locked && st.ok && solutionVisible(),
      color: () => COL.F(),
      axis: 'y',
    });

    function safe(v: number): number {
      return Number.isFinite(v) ? v : 0;
    }

    /** Lösung (F) sichtbar? Im Übungsmodus nur nach „Lösung zeigen“. */
    const solutionVisible = () => p.mode !== 'check' || p.show;

    /** Wie weit ist die Fläche schon „gelaufen“? (x zwischen a und b) */
    const sweepX = () => p.a + (p.b - p.a) * sweepTw.value;

    function drawTop(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      topRect = R;
      drawCard(g, R, t);
      plotF.resize();
      plotF.begin();
      plotF.grid({ minor: true });
      plotF.axes();
      const f = st.ok ? st.f : st.f;
      if (f) {
        const fx = (x: number) => evaluate(f, x);
        if (p.area && (integral || approx !== null) && p.a !== p.b) {
          const lo = Math.min(p.a, sweepX());
          const hi = Math.max(p.a, sweepX());
          // positive und negative Anteile getrennt einfärben
          plotF.fillBetween((x) => Math.max(0, fx(x)), () => 0, lo, hi, { fill: COL.pos(), alpha: t.dark ? 0.34 : 0.26 });
          plotF.fillBetween((x) => Math.min(0, fx(x)), () => 0, lo, hi, { fill: COL.neg(), alpha: t.dark ? 0.34 : 0.26 });
          // Streifen wie bei Riemann-Summen, ganz zart
          const n = 12;
          for (let k = 1; k < n; k++) {
            const x = p.a + ((p.b - p.a) * k) / n;
            if ((x - lo) * (x - hi) > 0) continue;
            plotF.segment([x, 0], [x, fx(x)], { color: withAlpha(t.text, 0.12), width: 1 });
          }
        }
        plotF.fn(fx, { color: COL.f(), width: 2.8 });
        if (p.area) {
          for (const key of ['a', 'b'] as const) {
            const x = p[key];
            const y = fx(x);
            if (Number.isFinite(y)) plotF.segment([x, 0], [x, y], { color: withAlpha(key === 'a' ? COL.inner() : COL.v(), 0.85), width: 1.6, dash: [4, 4] });
            plotF.text(x, 0, key, { color: key === 'a' ? COL.inner() : COL.v(), size: 13, weight: 'bold', offset: [0, 16], halo: true, math: true });
          }
          if ((integral || approx !== null) && Math.abs(p.b - p.a) > 0.15) {
            const mid = (p.a + p.b) / 2;
            const ym = fx(mid);
            const shown = integral ? (sweepTw.running && st.ok ? definite(st.F, p.a, sweepX()) : integral.value) : sweepTw.running ? simpson(f, p.a, sweepX(), 80) : approx!;
            // wechselt f zwischen a und b das Vorzeichen, ist es eine Flächenbilanz
            let pos = false;
            let neg = false;
            for (let k = 0; k <= 60; k++) {
              const v = fx(p.a + ((p.b - p.a) * k) / 60);
              if (v > 1e-9) pos = true;
              if (v < -1e-9) neg = true;
            }
            plotF.text(mid, Number.isFinite(ym) ? ym / 2 : 0, `${pos && neg ? tr('balance') : tr('area')} ${integral ? '' : '≈ '}${N(shown, 3)}`, { color: t.text, size: 12, weight: '600', halo: true });
          }
        }
        // Beschriftung am rechten Rand
        const xs = plotF.bounds;
        const lx = xs.xMax - (xs.xMax - xs.xMin) * 0.05;
        const v = fx(lx);
        if (Number.isFinite(v) && v > xs.yMin && v < xs.yMax) plotF.text(lx, v, 'f', { color: COL.f(), size: 14, weight: 'bold', align: 'right', offset: [0, -12], halo: true, math: true });
      }
      plotF.end();
    }

    function drawBottom(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      botRect = R;
      drawCard(g, R, t);
      plotA.resize();
      plotA.begin();
      plotA.grid({ minor: true });
      plotA.axes();
      const xs = plotA.bounds;
      if (st.ok) {
        const s = st;
        const Fx = (x: number) => evaluate(s.F, x) + p.C;
        const reveal = buildTw.value;
        const toX = xs.xMin + (xs.xMax - xs.xMin) * clamp((reveal - 0.2) / 0.8, 0, 1);
        if (solutionVisible()) {
          // Schar F + C (blass)
          if (p.family) {
            for (let c = -3; c <= 3; c++) {
              if (c === 0) continue;
              plotA.fn((x) => Fx(x) + c, { color: withAlpha(COL.F(), 0.28), width: 1.4, to: toX });
            }
          }
          plotA.fn(Fx, { color: COL.F(), width: 2.6, to: toX });
        }
        // eigene Stammfunktion (um C verschoben wie F, damit man vergleichen kann)
        if (p.mode === 'check' && mine.e) {
          const e = mine.e;
          plotA.fn((x) => evaluate(e, x) + p.C, { color: COL.mine(), width: 2.2, dash: [8, 5] });
        }
        // Höhenunterschied F(b) − F(a)
        if (p.area && integral && solutionVisible() && reveal > 0.5) {
          const xa = p.a;
          const xb = sweepX();
          const ya = Fx(xa);
          const yb = Fx(xb);
          if (Number.isFinite(ya) && Number.isFinite(yb)) {
            const col = yb - ya >= 0 ? COL.pos() : COL.neg();
            plotA.segment([xa, ya], [xb, ya], { color: withAlpha(t.text, 0.35), width: 1.2, dash: [4, 4] });
            plotA.segment([xb, ya], [xb, yb], { color: col, width: 3.2 });
            plotA.point(xa, ya, { color: COL.inner(), radius: 4.5 });
            plotA.point(xb, yb, { color: sweepTw.running ? col : COL.v(), radius: 4.5 });
            const right = (xb - xs.xMin) / (xs.xMax - xs.xMin) > 0.6;
            if (Math.abs(yb - ya) > 1e-9) plotA.text(xb, (ya + yb) / 2, `${tr('diff')} = ${N(yb - ya, 3)}`, { color: col, size: 12, weight: 'bold', offset: [right ? -8 : 8, 0], align: right ? 'right' : 'left', halo: true });
          }
        }
        // C-Griff beschriften
        if (solutionVisible() && reveal >= 0.999) {
          const y = Fx(cX());
          if (Number.isFinite(y)) plotA.text(cX(), y, `C = ${N(p.C, 2)}`, { color: COL.F(), size: 11, weight: '600', offset: [0, -16], halo: true });
          const lx = xs.xMax - (xs.xMax - xs.xMin) * 0.05;
          const v = Fx(lx);
          if (Number.isFinite(v) && v > xs.yMin && v < xs.yMax) plotA.text(lx, v, tr('FLabel'), { color: COL.F(), size: 14, weight: 'bold', align: 'right', offset: [0, 14], halo: true, math: true });
        }
      }
      plotA.end();
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
        // sehr lange Teile an Leerzeichen aufteilen
        const words = g.measureText(sg.s).width > maxW * 0.6 ? sg.s.split(/(?<= )/) : [sg.s];
        for (const wd of words) {
          const w = g.measureText(wd).width;
          if (cx + w > x + maxW && cx > x + 20) {
            cx = x + 18;
            cy += s * 1.4;
          }
          g.fillStyle = sg.c ?? th().text;
          g.fillText(wd, cx, cy);
          cx += w;
        }
      }
      g.restore();
      return cy - y + s * 1.45;
    }

    function wrapTerm(e: Expr): string {
      const s = T(e);
      return e.k === 'add' || e.k === 'sub' || (e.k === 'num' && e.v < 0) || e.k === 'neg' ? `(${s})` : s;
    }

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

    /** Integralzeichen mit Grenzen (klein unten/oben); liefert die Breite. */
    function integralSign(g: CanvasRenderingContext2D, x: number, y: number, size: number, lo: string | null, hi: string | null, col: string, alpha = 1): number {
      g.save();
      g.globalAlpha = alpha;
      g.fillStyle = col;
      g.textBaseline = 'middle';
      g.textAlign = 'left';
      g.font = `400 ${size * 1.55}px ${th().font}`;
      g.fillText('∫', x, y);
      const w0 = g.measureText('∫').width;
      let w = w0;
      if (lo !== null && hi !== null) {
        g.font = `600 ${size * 0.62}px ${th().font}`;
        g.fillText(hi, x + w0 * 0.85, y - size * 0.62);
        g.fillText(lo, x + w0 * 0.45, y + size * 0.72);
        w = Math.max(w0, w0 * 0.85 + g.measureText(hi).width, w0 * 0.45 + g.measureText(lo).width) + 2;
      }
      g.restore();
      return w + 4;
    }

    /** ∫ (Integrand) dx als eine Zeile; liefert die Höhe. */
    function integralLine(g: CanvasRenderingContext2D, x: number, y: number, maxW: number, size: number, integrand: Seg[], tail: Seg[], alpha = 1, lo: string | null = null, hi: string | null = null): number {
      const w = integralSign(g, x, y, size, lo, hi, th().text, alpha);
      return segLine(g, [...integrand, { s: ' dx', c: th().muted }, ...tail], x + w, y, maxW - w, size, alpha);
    }

    /** f(x) mit farbigen Teilen der obersten Regel. */
    function coloredF(step: IntStep | undefined, f: Expr): Seg[] {
      if (!step) return [{ s: T(f), c: COL.f(), w: 600 }];
      const e = step.expr;
      const info = step.info ?? {};
      switch (step.rule) {
        case 'sum':
          if (e.k === 'add' || e.k === 'sub') return [{ s: T(e.a), c: COL.u(), w: 700 }, { s: e.k === 'sub' ? ' − ' : ' + ' }, { s: wrapTerm(e.b), c: COL.v(), w: 700 }];
          break;
        case 'parts':
          if (info.u && info.dv && info.dv.k !== 'num') return [{ s: wrapTerm(info.u), c: COL.u(), w: 700 }, { s: ' · ' }, { s: wrapTerm(info.dv), c: COL.v(), w: 700 }];
          if (info.u) return [{ s: '1', c: COL.v(), w: 700 }, { s: ' · ' }, { s: T(info.u), c: COL.u(), w: 700 }];
          break;
        case 'linear':
        case 'subst':
        case 'logsubst':
          if (info.inner) {
            const all = T(e);
            const inn = T(info.inner);
            const i = all.indexOf(inn);
            if (i >= 0) return [{ s: all.slice(0, i), c: COL.f(), w: 600 }, { s: inn, c: COL.inner(), w: 700 }, { s: all.slice(i + inn.length), c: COL.f(), w: 600 }];
          }
          break;
        default:
          break;
      }
      return [{ s: T(f), c: COL.f(), w: 600 }];
    }

    /** Stammfunktion eines Teilterms (für die Anzeige der Summen- und Faktorregel). */
    function Fof(e: Expr): Expr | null {
      try {
        return integrate(e).F;
      } catch {
        return null;
      }
    }

    /** Zeilen mit den Teilen der obersten Regel. */
    function partRows(step: IntStep): { left: Seg[]; right: Seg[] }[] {
      const e = step.expr;
      const info = step.info ?? {};
      const muted = th().muted;
      switch (step.rule) {
        case 'sum': {
          if (e.k !== 'add' && e.k !== 'sub') return [];
          const A = Fof(e.a);
          const B = Fof(e.b);
          return [
            { left: [{ s: `u = ${T(e.a)}`, c: COL.u(), w: 700 }], right: [{ s: '∫ u dx = ', c: muted }, { s: A ? T(A) : '?', c: COL.u(), w: 600 }] },
            { left: [{ s: `v = ${T(e.b)}`, c: COL.v(), w: 700 }], right: [{ s: '∫ v dx = ', c: muted }, { s: B ? T(B) : '?', c: COL.v(), w: 600 }] },
          ];
        }
        case 'factor': {
          const k = info.k ?? 1;
          let u: Expr | null = null;
          if (e.k === 'mul') u = hasX(e.a) ? e.a : e.b;
          else if (e.k === 'div') u = e.a;
          else if (e.k === 'neg') u = e.a;
          const U = u ? Fof(u) : null;
          return [
            { left: [{ s: `c = ${N(k, 4)}`, c: muted, w: 700 }], right: [{ s: tr('factorK'), c: muted }] },
            ...(u ? [{ left: [{ s: `u = ${T(u)}`, c: COL.u(), w: 700 }], right: [{ s: '∫ u dx = ', c: muted }, { s: U ? T(U) : '?', c: COL.u(), w: 600 }] }] : []),
          ];
        }
        case 'linear': {
          const rows: { left: Seg[]; right: Seg[] }[] = [];
          if (info.inner) rows.push({ left: [{ s: `h(x) = ${T(info.inner)}`, c: COL.inner(), w: 700 }], right: [{ s: `${tr('inner')}, a = `, c: muted }, { s: N(info.a ?? 1, 4), c: COL.inner(), w: 700 }] });
          rows.push({ left: [{ s: `1 / a = ${N(1 / (info.a ?? 1), 4)}`, c: muted, w: 600 }], right: [{ s: tr('innerD') + ' ' + (ctx.lang === 'de' ? 'ausgleichen' : 'compensated'), c: muted }] });
          return rows;
        }
        case 'subst':
        case 'logsubst': {
          if (!info.inner) return [];
          const du = simplify(derivative(info.inner));
          return [
            { left: [{ s: `u(x) = ${T(info.inner)}`, c: COL.inner(), w: 700 }], right: [{ s: `u′(x) = ${T(du)}`, c: COL.inner(), w: 600 }] },
            { left: [{ s: `${tr('factorK')} k = ${N(info.k ?? 1, 4)}`, c: muted, w: 600 }], right: [{ s: step.rule === 'logsubst' ? 'f = k · u′ / u' : 'f = k · g(u) · u′', c: muted }] },
          ];
        }
        case 'parts': {
          if (!info.u || !info.du || !info.dv || !info.v) return [];
          return [
            { left: [{ s: `u = ${T(info.u)}`, c: COL.u(), w: 700 }], right: [{ s: `u′ = ${T(simplify(info.du))}`, c: COL.u(), w: 600 }] },
            { left: [{ s: `v′ = ${T(info.dv)}`, c: COL.v(), w: 700 }], right: [{ s: `v = ${T(simplify(info.v))}`, c: COL.v(), w: 600 }] },
          ];
        }
        default:
          return [];
      }
    }

    /** Regel mit eingesetzten Teilen (farbig). */
    function inserted(step: IntStep): Seg[] {
      const info = step.info ?? {};
      switch (step.rule) {
        case 'parts':
          if (info.u && info.v && info.rest) {
            return [
              { s: wrapTerm(info.u), c: COL.u(), w: 700 },
              { s: ' · ' },
              { s: wrapTerm(simplify(info.v)), c: COL.v(), w: 700 },
              { s: ' − ∫ ' },
              { s: wrapTerm(info.rest), c: th().text, w: 600 },
              { s: ' dx', c: th().muted },
            ];
          }
          return [];
        case 'linear':
        case 'subst':
        case 'logsubst':
          return [{ s: T(step.result), c: COL.F(), w: 700 }];
        default:
          return [];
      }
    }

    /* -------------------------------------------------------------- */
    /* Karte zeichnen                                                  */
    /* -------------------------------------------------------------- */

    function drawCardBody(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      drawCard(g, R, t, COL.f());
      const x = R.x + 16;
      const maxW = R.w - 32;
      const size = R.w < 360 ? 13.5 : R.w < 520 ? 15 : 16.5;
      let y = R.y + 24;
      const reveal = buildTw.value;
      const fade = (k: number) => clamp((reveal - k * 0.1) / 0.3, 0, 1);

      if (p.mode === 'ansatz') {
        drawAnsatz(g, R, x, y, maxW, size, fade);
        return;
      }

      if (!st.ok) {
        y += segLine(g, [{ s: tr('given'), c: t.muted, w: 600 }, { s: ` ${p.f}`, c: t.text, w: 600 }], x, y, maxW, size);
        if (st.pos !== undefined) {
          g.save();
          g.font = `600 ${size}px ${t.font}`;
          const before = g.measureText(`${tr('given')} ${p.f.slice(0, st.pos)}`).width;
          g.fillStyle = withAlpha(t.series[3]!, 0.25);
          roundRect(g, x + before - 1, y - size * 2.1, Math.max(8, g.measureText(p.f[st.pos] ?? ' ').width + 2), size * 1.4, 3);
          g.fill();
          g.restore();
        }
        y += 6;
        y += segLine(g, [{ s: st.msg, c: t.series[3], w: 600 }], x, y, maxW, size - 1);
        if (approx !== null && p.area && p.a !== p.b) {
          y += 8;
          y += segLine(g, [{ s: tr('approxInfo'), c: t.muted }], x, y, maxW, size - 1.5);
          const w = integralSign(g, x, y + 6, size - 1, N(p.a, 2), N(p.b, 2), t.text);
          segLine(g, [{ s: 'f(x) dx ≈ ', c: t.text }, { s: N(approx, 4), c: approx >= 0 ? COL.pos() : COL.neg(), w: 700 }], x + w + 4, y + 6, maxW - w - 4, size - 0.5);
        }
        return;
      }
      const s = st;
      const top = s.steps[0];
      // ∫ f(x) dx mit farbigen Teilen
      y += integralLine(g, x, y + 4, maxW, size + 1.5, coloredF(top, s.f), [], fade(0));
      y += 6;
      if (!top) return;

      if (p.mode === 'check') {
        drawCheck(g, R, x, y, maxW, size, top);
        return;
      }

      if (p.mode === 'rule') {
        const ruleCol = ruleColor(top.rule);
        const cw = chip(g, RULES[top.rule].name[ctx.lang], x, y + 4, ruleCol, size - 1.5, fade(1));
        const fw = segWidth(g, [{ s: RULES[top.rule].formula }], size - 1.5);
        if (cw + 10 + fw <= maxW) {
          segLine(g, [{ s: RULES[top.rule].formula, c: t.muted }], x + cw + 10, y + 4, maxW - cw - 10, size - 1.5, fade(1));
          y += size * 2;
        } else {
          y += size * 1.9;
          y += segLine(g, [{ s: RULES[top.rule].formula, c: t.muted }], x, y, maxW, size - 1.5, fade(1));
        }
        const rows = partRows(top);
        rows.forEach((r, k) => {
          const a = fade(2 + k);
          const half = maxW * 0.5;
          const h1 = segLine(g, r.left, x, y, half - 8, size - 0.5, a);
          const h2 = segLine(g, [{ s: '→  ', c: t.muted }, ...r.right], x + half, y, half, size - 0.5, a);
          y += Math.max(h1, h2) + 2;
        });
        if (BASIC.includes(top.rule)) y += segLine(g, [{ s: tr('basic'), c: t.muted }], x, y, maxW, size - 1, fade(2));
        y += 4;
        const ins = inserted(top);
        if (ins.length) y += segLine(g, [{ s: `${tr('insert')}:  `, c: t.muted }, { s: 'F(x) = ', c: t.text }, ...ins], x, y, maxW, size - 0.5, fade(4));
        // Restintegral der partiellen Integration
        if (top.rule === 'parts' && top.info?.rest) {
          const R2 = Fof(top.info.rest);
          if (R2) y += segLine(g, [{ s: `${tr('rest')}:  ∫ ${wrapTerm(top.info.rest)} dx = `, c: t.muted }, { s: T(R2), c: t.text, w: 600 }], x, y, maxW, size - 1, fade(5));
          if (R2 && top.info.u && top.info.v) {
            const raw = simplify(sub(mul(top.info.u, top.info.v), R2));
            if (T(raw) !== T(s.F)) y += segLine(g, [{ s: 'F(x) = ', c: t.text }, { s: T(raw), c: t.text }, { s: `  (${tr('sameAs')}: `, c: t.muted }, { s: T(s.F), c: COL.F(), w: 600 }, { s: ')', c: t.muted }], x, y, maxW, size - 1, fade(5));
          }
        }
        // Herkunft der Regel, wenn Platz ist
        const yRes = R.y + R.h - resultHeight(size);
        if (yRes - y > size * 4.2) drawOrigin(g, x, Math.max(y + 10, yRes - size * 4.4), maxW, size, top, fade(5.5));
        drawResult(g, R, x, Math.max(y + 8, yRes), maxW, size, fade(6));
        return;
      }

      // Alle Schritte
      y += segLine(g, [{ s: tr('steps'), c: t.muted, w: 600 }], x, y, maxW, size - 1.5, fade(1));
      const lineH = (size - 1) * 1.6;
      const room = Math.max(1, Math.floor((R.y + R.h - resultHeight(size) - y) / lineH));
      const shown = s.steps.slice(0, room);
      shown.forEach((stp, k) => {
        const a = fade(2 + k * 0.6);
        const ix = x + Math.min(stp.depth, 4) * 14;
        const col = ruleColor(stp.rule);
        const cw = chip(g, RULES[stp.rule].name[ctx.lang], ix, y + lineH / 2 - 2, col, size - 3.5, a);
        const h = segLine(g, [{ s: `∫ ${wrapTerm(stp.expr)} dx = `, c: t.text }, { s: T(stp.result), c: col, w: 700 }], ix + cw + 8, y + lineH / 2 - 2, x + maxW - ix - cw - 8, size - 2, a);
        y += Math.max(lineH, h + 2);
      });
      if (s.steps.length > shown.length) segLine(g, [{ s: tr('more', { k: s.steps.length - shown.length }), c: t.muted }], x, y, maxW, size - 2, fade(3));
      drawResult(g, R, x, R.y + R.h - resultHeight(size), maxW, size, fade(4));
    }

    /** „Warum?“: die Ableitungsregel, die hinter der Integrationsregel steckt. */
    function drawOrigin(g: CanvasRenderingContext2D, x: number, y: number, maxW: number, size: number, step: IntStep, alpha: number): void {
      const t = th();
      const o = ORIGIN[step.rule];
      g.save();
      g.globalAlpha = alpha;
      g.strokeStyle = withAlpha(t.text, 0.18);
      g.setLineDash([4, 4]);
      roundRect(g, x - 8, y - size * 0.95, maxW + 16, size * 3.4, 10);
      g.stroke();
      g.restore();
      const h = segLine(g, [{ s: tr('why', { rule: o.rule[ctx.lang] }), c: t.muted, w: 600 }], x, y, maxW, size - 1.5, alpha);
      segLine(g, [{ s: o.formula, c: ruleColor(step.rule), w: 700 }], x + 12, y + h, maxW - 12, size - 0.5, alpha);
    }

    /** Platz für das Ergebnisfeld unten (Stammfunktion, Probe, Integral). */
    const resultHeight = (size: number) => size * (p.area ? 6.2 : 4.2);

    function drawResult(g: CanvasRenderingContext2D, R: Rect, x: number, y: number, maxW: number, size: number, alpha: number): void {
      if (!st.ok) return;
      const t = th();
      g.save();
      g.globalAlpha = alpha;
      const box: Rect = { x: x - 8, y: y - size * 0.9, w: maxW + 16, h: R.y + R.h - (y - size * 0.9) - 10 };
      g.fillStyle = withAlpha(COL.F(), t.dark ? 0.14 : 0.07);
      roundRect(g, box.x, box.y, box.w, box.h, 10);
      g.fill();
      g.restore();
      let yy = y + 4;
      yy += segLine(g, [{ s: `${tr('result')}:  `, c: t.muted }, { s: `${tr('anti')} ${T(st.F)}`, c: COL.F(), w: 700 }, { s: tr('plusC'), c: COL.F(), w: 500 }], x, yy, maxW, size + 0.5, alpha);
      yy += segLine(g, [{ s: st.probe ? tr('check') : tr('checkBad'), c: st.probe ? COL.pos() : t.series[3], w: 600 }], x, yy - 2, maxW, size - 2.5, alpha) - 2;
      if (p.area) drawDefinite(g, x, yy + 2, maxW, size - 0.5, alpha);
    }

    /** ∫ₐᵇ f(x) dx = F(b) − F(a) = … */
    function drawDefinite(g: CanvasRenderingContext2D, x: number, y: number, maxW: number, size: number, alpha: number): void {
      const t = th();
      if (!st.ok) return;
      if (!integral) {
        segLine(g, [{ s: tr('undefinedInt'), c: t.series[3], w: 600 }], x, y + 2, maxW, size - 1.5, alpha);
        return;
      }
      if (p.a === p.b) {
        segLine(g, [{ s: tr('empty'), c: t.muted }], x, y + 2, maxW, size - 1.5, alpha);
        return;
      }
      const w = integralSign(g, x, y + 4, size - 1, N(p.a, 2), N(p.b, 2), t.text, alpha);
      const col = integral.value >= 0 ? COL.pos() : COL.neg();
      segLine(
        g,
        [
          { s: 'f(x) dx = ', c: t.text },
          { s: `${N(integral.Fb, 3)} − ${integral.Fa < 0 ? `(${N(integral.Fa, 3)})` : N(integral.Fa, 3)}`, c: t.muted },
          { s: ' = ' },
          { s: N(integral.value, 4), c: col, w: 700 },
        ],
        x + w + 4,
        y + 4,
        maxW - w - 4,
        size - 0.5,
        alpha,
      );
    }

    /* -------------------------------------------------------------- */
    /* Formansatz                                                      */
    /* -------------------------------------------------------------- */

    /** Polynom mit Koeffizientennamen (α x² + β x + γ). */
    function namePoly(n: number): string {
      const parts: string[] = [];
      for (let k = n; k >= 0; k--) {
        const c = GREEK[k] ?? `c${k}`;
        parts.push(k === 0 ? c : k === 1 ? `${c}x` : `${c}x${k === 2 ? '²' : '³'}`);
      }
      return parts.join(' + ');
    }
    /** Zahlen-Polynom als Text. */
    function numPoly(c: number[]): string {
      const out: string[] = [];
      for (let k = c.length - 1; k >= 0; k--) {
        const v = c[k]!;
        if (Math.abs(v) < 1e-12) continue;
        const pw = k === 0 ? '' : k === 1 ? 'x' : `x${k === 2 ? '²' : '³'}`;
        const abs = Math.abs(v);
        const coef = k > 0 && Math.abs(abs - 1) < 1e-12 ? '' : N(abs, 4);
        const sign = v < 0 ? (out.length ? ' − ' : '−') : out.length ? ' + ' : '';
        out.push(sign + coef + pw);
      }
      return out.length ? out.join('') : '0';
    }

    function drawAnsatz(g: CanvasRenderingContext2D, R: Rect, x: number, y0: number, maxW: number, size: number, fade: (k: number) => number): void {
      const t = th();
      let y = y0;
      const A = st.ansatz;
      const fExpr = st.ok ? st.f : st.f;
      y += integralLine(g, x, y + 4, maxW, size + 1.5, [{ s: fExpr ? T(fExpr) : p.f, c: COL.f(), w: 600 }], [], fade(0));
      y += 6;
      if (!A) {
        segLine(g, [{ s: tr('ansatzNo'), c: t.muted }], x, y, maxW, size - 1, fade(1));
        return;
      }
      const ex = T(A.expPart);
      const n = A.degree;
      const lh = size + 0.5;
      // 1. Ansatz
      y += segLine(g, [{ s: `1. ${tr('ansatz')}`, c: t.muted, w: 600 }], x, y, maxW, lh - 1, fade(1));
      y += segLine(g, [{ s: 'F(x) = (', c: t.text }, { s: namePoly(n), c: COL.u(), w: 700 }, { s: `) · ${ex}`, c: t.text }], x + 12, y, maxW - 12, lh, fade(1.5));
      // 2. Ableiten
      y += segLine(g, [{ s: `2. ${tr('ansatzF')}`, c: t.muted, w: 600 }], x, y + 2, maxW, lh - 1, fade(2.5)) + 2;
      const aS = N(A.a, 4);
      const terms: string[] = [];
      for (let k = n; k >= 0; k--) {
        const c = GREEK[k]!;
        const next = k + 1 <= n ? `${k + 1 === 1 ? '' : k + 1}${GREEK[k + 1]}` : '';
        const aPart = A.a === 1 ? c : `${aS}${c}`;
        const inner = next ? `(${aPart} + ${next})` : aPart;
        terms.push(k === 0 ? inner : k === 1 ? `${inner}x` : `${inner}x${k === 2 ? '²' : '³'}`);
      }
      y += segLine(g, [{ s: "F′(x) = (", c: t.text }, { s: terms.join(' + '), c: COL.u(), w: 600 }, { s: `) · ${ex}`, c: t.text }], x + 12, y, maxW - 12, lh - 0.5, fade(3));
      // 3. Koeffizientenvergleich
      y += segLine(g, [{ s: `3. ${tr('compare')}: f(x) = (`, c: t.muted, w: 600 }, { s: numPoly(A.p), c: COL.f(), w: 700 }, { s: `) · ${ex}`, c: t.muted }], x, y + 2, maxW, lh - 1, fade(4)) + 2;
      A.equations.forEach((eq, i) => {
        const k = eq.power;
        const c = GREEK[k]!;
        const next = k + 1 <= n ? ` + ${k + 1 === 1 ? '' : k + 1}${GREEK[k + 1]}` : '';
        const pw = k === 0 ? 'x⁰' : k === 1 ? 'x¹' : k === 2 ? 'x²' : 'x³';
        const lhs = `${A.a === 1 ? '' : aS}${c}${next} = ${N(eq.rhs, 4)}`;
        const val = A.q[k]!;
        const a = fade(4.6 + i * 0.7);
        const h1 = segLine(g, [{ s: `${pw}:  `, c: t.muted, w: 600 }, { s: lhs, c: t.text }], x + 12, y, maxW * 0.62 - 12, lh - 0.5, a);
        const h2 = segLine(g, [{ s: '⇒  ', c: t.muted }, { s: `${c} = ${N(val, 4)}`, c: COL.u(), w: 700 }], x + maxW * 0.62, y, maxW * 0.38, lh - 0.5, a);
        y += Math.max(h1, h2) + 2;
      });
      y += segLine(g, [{ s: `4. ${tr('probeA')}`, c: COL.pos(), w: 600 }], x, y + 4, maxW, lh - 1.5, fade(5 + n * 0.7));
      // Ergebnis
      const yy = Math.max(y + 10, R.y + R.h - size * (p.area ? 4.6 : 2.8));
      const a = fade(5 + n * 0.7);
      g.save();
      g.globalAlpha = a;
      g.fillStyle = withAlpha(COL.F(), t.dark ? 0.14 : 0.07);
      roundRect(g, x - 8, yy - size * 0.9, maxW + 16, R.y + R.h - (yy - size * 0.9) - 10, 10);
      g.fill();
      g.restore();
      const h = segLine(g, [{ s: 'F(x) = (', c: COL.F(), w: 700 }, { s: numPoly(A.q), c: COL.F(), w: 700 }, { s: `) · ${ex}${tr('plusC')}`, c: COL.F(), w: 700 }], x, yy + 2, maxW, size + 0.5, a);
      if (p.area) drawDefinite(g, x, yy + h + 2, maxW, size - 0.5, a);
    }

    /* -------------------------------------------------------------- */
    /* Übungsmodus                                                     */
    /* -------------------------------------------------------------- */

    function drawCheck(g: CanvasRenderingContext2D, R: Rect, x: number, y0: number, maxW: number, size: number, top: IntStep): void {
      const t = th();
      let y = y0 + 4;
      y += segLine(g, [{ s: `${tr('yours')}: `, c: t.muted, w: 600 }, { s: mine.e ? `${tr('anti')} ${T(simplify(mine.e))}` : mine.error ? tr('gError') : '…', c: mine.error ? t.series[3] : COL.mine(), w: 700 }], x, y, maxW, size);
      y += 6;
      if (!mine.e && !mine.error) y += segLine(g, [{ s: tr('typeHere'), c: t.muted }], x, y, maxW, size - 1.5);
      if (verdict) {
        const a = verdictTw.running ? verdictTw.value : 1;
        const ok = verdict.ok;
        const col = ok ? COL.pos() : t.series[3]!;
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
        const msg = ok ? (verdict.c !== undefined && Math.abs(verdict.c) > 1e-6 ? tr('rightC', { c: N(verdict.c, 3) }) : tr('right')) : tr('notYet');
        segLine(g, [{ s: msg, c: col, w: 700 }], x + 44, y + bh / 2, maxW - 50, size - 1, a);
        y += bh + 10;
        if (!ok && verdict.at !== undefined && st.ok && mine.e) {
          const at = verdict.at;
          y += segLine(g, [{ s: tr('wrong', { x: N(at, 2), a: N(evaluate(derivative(mine.e), at), 3), b: N(evaluate(st.f, at), 3) }), c: col, w: 600 }], x, y, maxW, size - 1.5);
        }
        if (!ok) {
          y += segLine(g, [{ s: tr('hint', { rule: `${RULES[top.rule].name[ctx.lang]}: ${RULES[top.rule].formula}` }), c: t.muted }], x, y, maxW, size - 1.5);
          segLine(g, [{ s: tr('wrongGraph'), c: t.muted }], x, y + 2, maxW, size - 1.5);
        }
      }
      if (p.show) drawResult(g, R, x, R.y + R.h - resultHeight(size), maxW, size, 1);
    }

    function runCheck(): void {
      if (!st.ok) return;
      readMine();
      if (!mine.e) {
        verdict = null;
        ctx.requestRender();
        return;
      }
      const r = sameFunction(derivative(mine.e), st.f);
      let c: number | undefined;
      if (r.equal) {
        const diff = evaluate(mine.e, 0.5) - evaluate(st.F, 0.5);
        if (Number.isFinite(diff)) c = diff;
      }
      verdict = { ok: r.equal, at: r.at, c };
      verdictTw.play();
      ctx.requestRender();
    }

    /* -------------------------------------------------------------- */
    /* Ergebnisse                                                      */
    /* -------------------------------------------------------------- */

    function esc(s: string): string {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function updateReadouts(): void {
      if (!st.ok) {
        ctx.readout('f', st.msg);
        ['rule', 'F'].forEach((k) => ctx.readout(k, null));
        ctx.readout('int', approx !== null ? `≈ ${N(approx, 4)} (${tr('numeric', { v: N(approx, 4) })})` : null);
        return;
      }
      ctx.readout('f', { html: `<var>f</var>(<var>x</var>) = ${esc(T(st.fs))}` });
      const top = st.steps[0];
      ctx.readout('rule', top ? `${RULES[top.rule].name[ctx.lang]}: ${RULES[top.rule].formula}` : '–');
      ctx.readout('F', { html: `<var>F</var>(<var>x</var>) = ${esc(T(st.F))} + <var>C</var>` });
      if (!integral) ctx.readout('int', tr('undefinedInt'));
      else ctx.readout('int', `${N(integral.value, 4)} (${tr('numeric', { v: N(integral.numeric, 4) })})`);
    }

    /* -------------------------------------------------------------- */
    /* Ablauf                                                          */
    /* -------------------------------------------------------------- */

    return {
      update(changed, source) {
        if (changed.has('f') || source === 'init') {
          st = analyse();
          verdict = null;
          buildTw.play(source === 'init' || source === 'replace' ? 1300 : 900);
        }
        if (changed.has('mode')) buildTw.play(700);
        if (changed.has('g')) {
          readMine();
          verdict = null;
        }
        if (changed.has('show') && p.show) buildTw.play(900);
        if (changed.has('f') || changed.has('a') || changed.has('b') || source === 'init' || source === 'replace') {
          computeIntegral();
          fitRanges();
          if (changed.has('f') || source !== 'input') sweepTw.play();
        }
        if (changed.has('area') && p.area) sweepTw.play();
        if (changed.has('family')) fitA();
        if (changed.has('C') && st.ok) {
          // nur nachführen, wenn F aus dem Bild läuft
          const b = plotA.bounds;
          const v = evaluate(st.F, cX()) + p.C;
          if (Number.isFinite(v) && (v < b.yMin || v > b.yMax)) fitA();
        }
        updateReadouts();
      },
      action(id) {
        if (ctx.locked) return;
        if (id === 'check') runCheck();
        if (id === 'reveal') ctx.set({ show: true });
      },
      resetView() {
        fitRanges();
        plotF.resetView();
        plotA.resetView();
      },
      render() {
        const g = surface.begin();
        const R = regions();
        drawCardBody(g, R.card);
        drawTop(g, R.top);
        drawBottom(g, R.bottom);
        if (buildTw.running || verdictTw.running || sweepTw.running) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
