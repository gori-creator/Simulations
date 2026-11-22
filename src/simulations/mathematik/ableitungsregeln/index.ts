import { defineSimulation, drawCard, ease, Plot, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { derive, evaluate, hasX, mainStep, NotSupported, numericSlope, parse, sameFunction, simplify, substitute, toText, type Expr, type Part, type RuleId, type Step } from './model';

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
      ],
      default: 'rule',
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
    { id: 'practice', label: L('Übung: (2x + 1)³ selbst ableiten', 'Practice: differentiate (2x + 1)³'), values: { f: '(2x+1)^3', mode: 'check', g: '', show: false, x0: 0 } },
  ],
  strings: {
    de: {
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
    const solutionVisible = () => p.mode !== 'check' || p.show;

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
        if (p.parts && top && p.mode !== 'check') {
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
      },
      resetView() {
        fitRange();
        plot.resetView();
      },
      render() {
        const g = surface.begin();
        const R = regions();
        drawCardBody(g, R.card);
        drawPlot(g, R.plot);
        if (buildTw.running || verdictTw.running) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
