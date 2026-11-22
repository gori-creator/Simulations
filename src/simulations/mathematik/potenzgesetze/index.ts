import { defineSimulation, drawCard, ease, Plot, roundRect, Surface, Tween, withAlpha, type Rect } from '../../../sim-core';
import { monoPowerForm, monoText, monoValue, nodeText, parseTerm, powQ, q, qText, sameTerm, simplify, sup, type Law, type Mono, type Step } from './model';

const L = (de: string, en: string) => ({ de, en });
type Loc = { de: string; en: string };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type LawView = 'mul' | 'div' | 'powpow' | 'prodpow';

const LAWS: Record<Law, { name: Loc; formula: string }> = {
  mulSame: { name: L('Gleiche Basis malnehmen', 'Multiplying, same base'), formula: 'aᵐ · aⁿ = aᵐ⁺ⁿ' },
  divSame: { name: L('Gleiche Basis teilen', 'Dividing, same base'), formula: 'aᵐ : aⁿ = aᵐ⁻ⁿ' },
  powPow: { name: L('Potenz potenzieren', 'Power of a power'), formula: '(aᵐ)ⁿ = aᵐ·ⁿ' },
  prodPow: { name: L('Produkt potenzieren', 'Power of a product'), formula: '(a · b)ⁿ = aⁿ · bⁿ' },
  quotPow: { name: L('Quotient potenzieren', 'Power of a quotient'), formula: '(a : b)ⁿ = aⁿ : bⁿ' },
  root: { name: L('Wurzel als Potenz', 'Root as a power'), formula: 'ⁿ√a = a^(1/n)' },
  neg: { name: L('Negativer Exponent', 'Negative exponent'), formula: 'a⁻ⁿ = 1 / aⁿ' },
  zero: { name: L('Exponent null', 'Exponent zero'), formula: 'a⁰ = 1' },
  factor: { name: L('Primfaktoren', 'Prime factors'), formula: '8 = 2³' },
};

/**
 * Potenz- und Wurzelgesetze: Die Gesetze werden mit Faktor-Kacheln sichtbar
 * (zusammenschieben, kürzen, gruppieren), eine Treppe erklärt a⁰ = 1 und
 * negative Exponenten, der Graph von y = aˣ zeigt gebrochene Exponenten als
 * Wurzeln, und ein Termumformer vereinfacht Terme Schritt für Schritt mit
 * dem jeweils angewandten Gesetz.
 */
export default defineSimulation({
  id: 'potenzgesetze',
  layout: { aspect: 1.6, aspectNarrow: 0.55 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'laws', label: L('Gesetze mit Kacheln', 'Laws with tiles') },
        { value: 'ladder', label: L('Treppe: a⁰ und negative Exponenten', 'Ladder: a⁰ and negative exponents') },
        { value: 'roots', label: L('Gebrochene Exponenten und Wurzeln', 'Fractional exponents and roots') },
        { value: 'terms', label: L('Terme vereinfachen', 'Simplifying terms') },
      ],
      default: 'laws',
    },
    {
      key: 'law',
      type: 'choice',
      label: L('Gesetz', 'Law'),
      options: [
        { value: 'mul', label: L('aᵐ · aⁿ = aᵐ⁺ⁿ', 'aᵐ · aⁿ = aᵐ⁺ⁿ') },
        { value: 'div', label: L('aᵐ : aⁿ = aᵐ⁻ⁿ', 'aᵐ : aⁿ = aᵐ⁻ⁿ') },
        { value: 'powpow', label: L('(aᵐ)ⁿ = aᵐ·ⁿ', '(aᵐ)ⁿ = aᵐ·ⁿ') },
        { value: 'prodpow', label: L('(a · b)ⁿ = aⁿ · bⁿ', '(a · b)ⁿ = aⁿ · bⁿ') },
      ],
      default: 'mul',
      visibleIf: (v) => v.mode === 'laws',
    },
    { key: 'a', type: 'number', label: L('Basis a', 'Base a'), min: 2, max: 10, step: 1, default: 2, visibleIf: (v) => v.mode !== 'terms' },
    { key: 'b', type: 'number', label: L('Basis b', 'Base b'), min: 2, max: 10, step: 1, default: 3, visibleIf: (v) => v.mode === 'laws' && v.law === 'prodpow' },
    { key: 'm', type: 'number', label: L('Exponent m', 'Exponent m'), min: 0, max: 8, step: 1, default: 3, visibleIf: (v) => v.mode === 'laws' && v.law !== 'prodpow' },
    { key: 'n', type: 'number', label: L('Exponent n', 'Exponent n'), min: 0, max: 8, step: 1, default: 4, visibleIf: (v) => v.mode === 'laws' },
    { key: 'sym', type: 'boolean', label: L('Mit Buchstaben statt Zahlen', 'With letters instead of numbers'), default: false, visibleIf: (v) => v.mode === 'laws' },
    { key: 'pm', type: 'number', label: L('Zähler des Exponenten', 'Numerator of the exponent'), min: -6, max: 6, step: 1, default: 2, visibleIf: (v) => v.mode === 'roots' },
    { key: 'pn', type: 'number', label: L('Nenner des Exponenten', 'Denominator of the exponent'), min: 1, max: 6, step: 1, default: 3, visibleIf: (v) => v.mode === 'roots' },
    {
      key: 't',
      type: 'text',
      label: L('Term', 'Term'),
      default: '(a^2 · b)^3 : (a^4 · b^2)',
      maxLength: 60,
      placeholder: L('z. B. a^3 · a^4 oder √2 · √8', 'e.g. a^3 · a^4 or √2 · √8'),
      help: L(
        'Potenzen mit ^ (auch ^(2/3) oder ^(-1)), Wurzeln mit √ oder root(3, a), Malpunkt · oder *, geteilt : oder /. Nur Produkte und Quotienten, keine Summen.',
        'Powers with ^ (also ^(2/3) or ^(-1)), roots with √ or root(3, a), times · or *, divided : or /. Only products and quotients, no sums.',
      ),
      visibleIf: (v) => v.mode === 'terms',
    },
    { key: 'g', type: 'text', label: L('Deine Vereinfachung', 'Your simplification'), default: '', maxLength: 40, placeholder: L('z. B. a^2 · b', 'e.g. a^2 · b'), visibleIf: (v) => v.mode === 'terms' },
    { key: 'show', type: 'boolean', label: L('Ergebnis zeigen', 'Show result'), default: true },
  ],
  resultsParam: 'show',
  actions: [
    { id: 'play', label: L('Abspielen', 'Play'), primary: true, visibleIf: (v) => v.mode !== 'terms' },
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'terms' },
  ],
  readouts: [
    { key: 'term', label: L('Term', 'Term') },
    { key: 'res', label: L('Ergebnis', 'Result'), spoiler: true },
  ],
  presets: [
    { id: 'mul', label: L('2³ · 2⁴ = 2⁷', '2³ · 2⁴ = 2⁷'), values: { mode: 'laws', law: 'mul', a: 2, m: 3, n: 4, sym: false } },
    { id: 'div', label: L('a⁶ : a² – kürzen', 'a⁶ : a² – cancelling'), values: { mode: 'laws', law: 'div', a: 2, m: 6, n: 2, sym: true } },
    { id: 'divneg', label: L('a² : a⁵ – negativer Exponent', 'a² : a⁵ – negative exponent'), values: { mode: 'laws', law: 'div', a: 2, m: 2, n: 5, sym: true } },
    { id: 'divzero', label: L('a³ : a³ = a⁰ = 1', 'a³ : a³ = a⁰ = 1'), values: { mode: 'laws', law: 'div', a: 3, m: 3, n: 3, sym: true } },
    { id: 'powpow', label: L('(a²)³ = a⁶', '(a²)³ = a⁶'), values: { mode: 'laws', law: 'powpow', a: 2, m: 2, n: 3, sym: true } },
    { id: 'prodpow', label: L('(2 · 3)³ = 2³ · 3³', '(2 · 3)³ = 2³ · 3³'), values: { mode: 'laws', law: 'prodpow', a: 2, b: 3, n: 3, sym: false } },
    { id: 'ladder', label: L('Treppe für Basis 2', 'Ladder for base 2'), values: { mode: 'ladder', a: 2 } },
    { id: 'root', label: L('8^(2/3) = 4', '8^(2/3) = 4'), values: { mode: 'roots', a: 8, pm: 2, pn: 3 } },
    { id: 'rootneg', label: L('4^(−1/2) = 0,5', '4^(−1/2) = 0.5'), values: { mode: 'roots', a: 4, pm: -1, pn: 2 } },
    { id: 'sqrt', label: L('√2 · √8 = 4', '√2 · √8 = 4'), values: { mode: 'terms', t: '√2 · √8', g: '' } },
    { id: 'term', label: L('(a² · b)³ : (a⁴ · b²)', '(a² · b)³ : (a⁴ · b²)'), values: { mode: 'terms', t: '(a^2 · b)^3 : (a^4 · b^2)', g: '' } },
    { id: 'practice', label: L('Übung: (x²)³ : x⁴ selbst vereinfachen', 'Practice: simplify (x²)³ : x⁴'), values: { mode: 'terms', t: '(x^2)^3 : x^4', g: '', show: false } },
  ],
  strings: {
    de: {
      canvas: 'Potenzgesetze zum Anschauen: Faktor-Kacheln, die zusammengeschoben, gekürzt oder gruppiert werden, eine Treppe der Exponenten, der Graph von y = aˣ und ein Termumformer mit Schritten.',
      factors: '{k} Faktoren',
      cancel: 'Gleiche Faktoren oben und unten kürzen sich.',
      groups: '{n} Gruppen mit je {m} Faktoren',
      regroup: 'Umsortieren: erst alle a, dann alle b.',
      value: 'Wert',
      ladderTitle: 'Jede Stufe nach unten: durch a teilen',
      ladderWhy: 'Teilen durch a heißt: Exponent um 1 kleiner. So kommt man von a¹ = a zu a⁰ = 1 und weiter zu a⁻¹ = 1/a.',
      rootTitle: 'a^(m/n) = ⁿ√(aᵐ) = (ⁿ√a)ᵐ',
      rootWhy: 'Warum? (a^(1/n))ⁿ = a^(n/n) = a¹ = a – also ist a^(1/n) die n-te Wurzel.',
      exact: 'genau',
      approx: 'ungefähr',
      graph: 'Graph von y = {a}ˣ',
      steps: 'Schritte (von innen nach außen)',
      noSteps: 'Hier ist nichts umzuformen.',
      result: 'Ergebnis',
      powerForm: 'Potenzform',
      rootForm: 'mit Wurzeln',
      yours: 'Deine Vereinfachung',
      right: 'Richtig! Dein Term ist gleichwertig.',
      wrong: 'Noch nicht gleichwertig.',
      typeHere: 'Gib unter „Deine Vereinfachung“ dein Ergebnis ein und drücke „Prüfen“.',
      allLaws: 'Alle Gesetze (farbig: hier benutzt)',
      parseErr: 'Der Term lässt sich ab Zeichen {p} nicht lesen.',
      parseEmpty: 'Bitte einen Term eingeben, z. B. a^3 · a^4.',
      parseZero: 'Durch 0 teilen (oder 0 als Basis) geht nicht.',
      negRoot: 'Wurzeln aus negativen Zahlen gibt es hier nicht.',
      hidden: 'Ergebnis verdeckt',
      check: 'Probe mit Zahlen',
    },
    en: {
      canvas: 'Laws of exponents made visible: factor tiles that are pushed together, cancelled or grouped, a ladder of exponents, the graph of y = aˣ and a term simplifier with steps.',
      factors: '{k} factors',
      cancel: 'Equal factors on top and bottom cancel.',
      groups: '{n} groups of {m} factors',
      regroup: 'Reorder: first all a, then all b.',
      value: 'value',
      ladderTitle: 'Each step down: divide by a',
      ladderWhy: 'Dividing by a lowers the exponent by 1. That is how a¹ = a leads to a⁰ = 1 and on to a⁻¹ = 1/a.',
      rootTitle: 'a^(m/n) = ⁿ√(aᵐ) = (ⁿ√a)ᵐ',
      rootWhy: 'Why? (a^(1/n))ⁿ = a^(n/n) = a¹ = a – so a^(1/n) is the n-th root.',
      exact: 'exactly',
      approx: 'approximately',
      graph: 'graph of y = {a}ˣ',
      steps: 'Steps (from inside out)',
      noSteps: 'Nothing to transform here.',
      result: 'Result',
      powerForm: 'power form',
      rootForm: 'with roots',
      yours: 'Your simplification',
      right: 'Correct! Your term is equivalent.',
      wrong: 'Not equivalent yet.',
      typeHere: 'Enter your result under “Your simplification” and press “Check”.',
      allLaws: 'All laws (coloured: used here)',
      parseErr: 'The term cannot be read from character {p} on.',
      parseEmpty: 'Please enter a term, e.g. a^3 · a^4.',
      parseZero: 'Division by 0 (or 0 as a base) is not possible.',
      negRoot: 'Roots of negative numbers are not covered here.',
      hidden: 'result hidden',
      check: 'Check with numbers',
    },
  },
  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const N = (v: number, d = 4) => fmt.num(v, d);
    const S = (n: number) => sup(String(n).replace('-', '−'));
    /** Zahl groß: mit Tausenderpunkten, sehr groß als Zehnerpotenz. */
    const big = (v: number) => (Math.abs(v) < 1e9 ? fmt.num(v, 6) : `${N(v / 10 ** Math.floor(Math.log10(v)), 3)} · 10${S(Math.floor(Math.log10(v)))}`);

    /* -------------------------------------------------------------- */
    /* Zustand                                                         */
    /* -------------------------------------------------------------- */

    const law = () => p.law as LawView;
    const A = () => (p.sym ? 'a' : String(p.a));
    const B = () => (p.sym ? 'b' : String(p.b));

    type TermState = { ok: true; mono: Mono; steps: Step[]; node: unknown } | { ok: false; msg: string };
    let term: TermState = readTerm();
    let verdict: { ok: boolean } | null = null;

    function readTerm(): TermState {
      const r = parseTerm(p.t);
      if (!r.ok) return { ok: false, msg: r.msg === 'empty' ? tr('parseEmpty') : r.msg === 'zero' ? tr('parseZero') : tr('parseErr', { p: r.pos + 1 }) };
      try {
        const s = simplify(r.node);
        return { ok: true, mono: s.mono, steps: s.steps, node: r.node };
      } catch {
        return { ok: false, msg: tr('negRoot') };
      }
    }

    /* -------------------------------------------------------------- */
    /* Animation, Layout, Farben                                       */
    /* -------------------------------------------------------------- */

    const anim = new Tween(2200, ease.inOutCubic);
    const verdictTw = new Tween(500, ease.outBack);
    anim.play();
    const k = () => anim.value;

    const wide = () => surface.width >= 640 && surface.width >= surface.height * 1.2;
    function regions(): { main: Rect; card: Rect } {
      const W = surface.width;
      const H = surface.height;
      const pad = 10;
      if (wide()) {
        const mw = Math.round(W * 0.6);
        return { main: { x: pad, y: pad, w: mw - pad, h: H - 2 * pad }, card: { x: mw + pad, y: pad, w: W - mw - 2 * pad, h: H - 2 * pad } };
      }
      const mh = Math.round(H * 0.55);
      return { main: { x: pad, y: pad, w: W - 2 * pad, h: mh }, card: { x: pad, y: mh + 2 * pad, w: W - 2 * pad, h: H - mh - 3 * pad } };
    }
    const COL = {
      a: () => th().series[0]!,
      b: () => th().series[1]!,
      res: () => th().series[4]!,
      good: () => th().series[2]!,
      warn: () => th().series[3]!,
      aux: () => th().series[5]!,
    };

    let plotArea: Rect = { x: 0, y: 0, w: 100, h: 100 };
    const plot = new Plot(surface, {
      x: [-3, 3],
      y: [-1, 9],
      equalAspect: false,
      zoom: false,
      pan: false,
      controls: false,
      region: () => plotArea,
      xAxis: { label: 'x' },
      yAxis: { label: 'y' },
    });

    /* -------------------------------------------------------------- */
    /* Text                                                            */
    /* -------------------------------------------------------------- */

    interface Seg {
      s: string;
      c?: string;
      w?: number;
    }
    function segLine(g: CanvasRenderingContext2D, segs: Seg[], x: number, y: number, maxW: number, size: number, alpha = 1): number {
      let s = size;
      const width = (z: number) =>
        segs.reduce((sum, sg) => {
          g.font = `${sg.w ?? 500} ${z}px ${th().font}`;
          return sum + g.measureText(sg.s).width;
        }, 0);
      while (s > 10.5 && width(s) > maxW) s -= 0.5;
      g.save();
      g.globalAlpha *= alpha;
      g.textBaseline = 'middle';
      g.textAlign = 'left';
      let cx = x;
      let cy = y;
      for (const sg of segs) {
        g.font = `${sg.w ?? 500} ${s}px ${th().font}`;
        for (const wd of g.measureText(sg.s).width > maxW * 0.5 ? sg.s.split(/(?<= )/) : [sg.s]) {
          const ww = g.measureText(wd).width;
          if (cx + ww > x + maxW && cx > x + 20) {
            cx = x + 12;
            cy += s * 1.4;
          }
          g.fillStyle = sg.c ?? th().text;
          g.fillText(wd, cx, cy);
          cx += ww;
        }
      }
      g.restore();
      return cy - y + s * 1.45;
    }

    /* -------------------------------------------------------------- */
    /* Kacheln                                                         */
    /* -------------------------------------------------------------- */

    /** Eine Faktor-Kachel mit Beschriftung. */
    function tile(g: CanvasRenderingContext2D, x: number, y: number, s: number, label: string, col: string, alpha = 1, crossed = 0): void {
      const t = th();
      g.save();
      g.globalAlpha *= alpha;
      g.fillStyle = withAlpha(col, t.dark ? 0.3 : 0.16);
      g.strokeStyle = col;
      g.lineWidth = 2;
      roundRect(g, x - s / 2, y - s / 2, s, s, s * 0.18);
      g.fill();
      g.stroke();
      g.fillStyle = col;
      g.font = `${p.sym ? 'italic ' : ''}700 ${s * (label.length > 1 ? 0.42 : 0.52)}px ${t.font}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(label, x, y + 1);
      if (crossed > 0) {
        g.strokeStyle = withAlpha(COL.warn(), crossed);
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(x - s * 0.42, y + s * 0.42);
        g.lineTo(x - s * 0.42 + s * 0.84 * crossed, y + s * 0.42 - s * 0.84 * crossed);
        g.stroke();
      }
      g.restore();
    }

    function drawLaws(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      const tt = k();
      const m = p.m;
      const n = p.n;
      const maxTiles = law() === 'powpow' ? m * n : law() === 'prodpow' ? 2 * n : m + n;
      const s = clamp(Math.min((R.w - 60) / Math.max(6, law() === 'powpow' ? m * n + n : maxTiles + 1), R.h / 7), 16, 46);
      const gap = s * 0.18;
      const cx = R.x + R.w / 2;
      const head = (txt: string, y: number, col = t.text) => segLine(g, [{ s: txt, c: col, w: 800 }], R.x + 18, y, R.w - 36, Math.min(22, s * 0.6 + 6));
      if (law() === 'mul') {
        // zwei Reihen → eine Reihe
        const y1 = R.y + R.h * 0.24;
        const y2 = R.y + R.h * 0.4;
        const yRes = R.y + R.h * 0.58;
        head(`${A()}${S(m)} · ${A()}${S(n)}`, R.y + 26);
        const total = m + n;
        const rowW = (c: number) => c * (s + gap) - gap;
        const startRes = cx - rowW(total) / 2 + s / 2;
        for (let i = 0; i < m; i++) {
          const x0 = cx - rowW(m) / 2 + s / 2 + i * (s + gap);
          const x1 = startRes + i * (s + gap);
          tile(g, lerp(x0, x1, tt), lerp(y1, yRes, tt), s, A(), COL.a());
        }
        for (let i = 0; i < n; i++) {
          const x0 = cx - rowW(n) / 2 + s / 2 + i * (s + gap);
          const x1 = startRes + (m + i) * (s + gap);
          tile(g, lerp(x0, x1, tt), lerp(y2, yRes, tt), s, A(), COL.b());
        }
        if (tt < 0.3) {
          segLine(g, [{ s: tr('factors', { k: m }), c: COL.a(), w: 600 }], R.x + 18, y1 - s * 0.9, R.w - 36, 12);
          segLine(g, [{ s: tr('factors', { k: n }), c: COL.b(), w: 600 }], R.x + 18, y2 - s * 0.9, R.w - 36, 12);
        }
        if (tt > 0.95) segLine(g, [{ s: `= ${A()}${S(m)}${S(n) ? '⁺' + S(n).replace('⁻', '') : ''} = ${A()}${S(total)}  (${tr('factors', { k: total })})`, c: COL.res(), w: 800 }], R.x + 18, yRes + s * 1.1, R.w - 36, 16);
        return;
      }
      if (law() === 'div') {
        // Bruch: m oben, n unten, Paare kürzen
        head(`${A()}${S(m)} : ${A()}${S(n)}`, R.y + 26);
        const yTop = R.y + R.h * 0.38;
        const yBot = R.y + R.h * 0.62;
        const rowW = (c: number) => c * (s + gap) - gap;
        const pairs = Math.min(m, n);
        const cut = clamp(tt * 1.6, 0, 1);
        const fade = clamp(tt * 1.6 - 0.6, 0, 1);
        const lineW = Math.max(rowW(Math.max(m, n, 1)), s * 2) + 20;
        g.save();
        g.strokeStyle = t.text;
        g.lineWidth = 2.4;
        g.beginPath();
        g.moveTo(cx - lineW / 2, (yTop + yBot) / 2);
        g.lineTo(cx + lineW / 2, (yTop + yBot) / 2);
        g.stroke();
        g.restore();
        for (let i = 0; i < m; i++) {
          const x = cx - rowW(m) / 2 + s / 2 + i * (s + gap);
          tile(g, x, yTop, s, A(), COL.a(), i < pairs ? 1 - fade * 0.75 : 1, i < pairs ? cut : 0);
        }
        for (let i = 0; i < n; i++) {
          const x = cx - rowW(n) / 2 + s / 2 + i * (s + gap);
          tile(g, x, yBot, s, A(), COL.b(), i < pairs ? 1 - fade * 0.75 : 1, i < pairs ? cut : 0);
        }
        if (m === 0) segLine(g, [{ s: '1', c: t.text, w: 800 }], cx - 5, yTop, 30, 20);
        if (n === 0) segLine(g, [{ s: '1', c: t.text, w: 800 }], cx - 5, yBot, 30, 20);
        if (tt > 0.95) {
          const d = m - n;
          const res = d === 0 ? `${A()}⁰ = 1` : d > 0 ? `${A()}${S(d)}` : `${A()}${S(d)} = 1 / ${A()}${S(-d)}`;
          segLine(g, [{ s: `= ${A()}${S(m)}⁻${S(n).replace('⁻', '')} = ${res}`, c: COL.res(), w: 800 }], R.x + 18, R.y + R.h * 0.84, R.w - 36, 16);
          segLine(g, [{ s: tr('cancel'), c: t.muted }], R.x + 18, R.y + R.h * 0.93, R.w - 36, 12.5);
        }
        return;
      }
      if (law() === 'powpow') {
        head(`(${A()}${S(m)})${S(n)}`, R.y + 26);
        const groupW = m * (s + gap) - gap + 16;
        const totalW = n * groupW + (n - 1) * 10;
        const scaleFit = Math.min(1, (R.w - 40) / Math.max(1, totalW));
        const ss = s * scaleFit;
        const gW = m * (ss + gap * scaleFit) - gap * scaleFit + 16 * scaleFit;
        const y0 = R.y + R.h * 0.42;
        const yRes = R.y + R.h * 0.68;
        const all = n * m;
        const resW = all * (ss + gap * scaleFit) - gap * scaleFit;
        for (let gi = 0; gi < n; gi++) {
          const gx = cx - (n * gW + (n - 1) * 10 * scaleFit) / 2 + gi * (gW + 10 * scaleFit);
          // Klammer um die Gruppe
          g.save();
          g.globalAlpha = 1 - tt;
          g.strokeStyle = withAlpha(t.text, 0.5);
          g.lineWidth = 1.5;
          roundRect(g, gx, y0 - ss * 0.75, gW, ss * 1.5, 8);
          g.stroke();
          g.restore();
          for (let i = 0; i < m; i++) {
            const x0 = gx + 8 * scaleFit + ss / 2 + i * (ss + gap * scaleFit);
            const x1 = cx - resW / 2 + ss / 2 + (gi * m + i) * (ss + gap * scaleFit);
            tile(g, lerp(x0, x1, tt), lerp(y0, yRes, tt), ss, A(), gi % 2 ? COL.b() : COL.a());
          }
        }
        if (tt < 0.3) segLine(g, [{ s: tr('groups', { n, m }), c: t.muted, w: 600 }], R.x + 18, y0 - ss * 1.4, R.w - 36, 12.5);
        if (tt > 0.95) segLine(g, [{ s: `= ${A()}${S(m)}·${S(n).replace('⁻', '')} = ${A()}${S(m * n)}`, c: COL.res(), w: 800 }], R.x + 18, yRes + ss * 1.2, R.w - 36, 16);
        return;
      }
      // (a·b)ⁿ: n Paare → a…a b…b
      head(`(${A()} · ${B()})${S(n)}`, R.y + 26);
      const pairW = 2 * (s + gap) + 12;
      const y0 = R.y + R.h * 0.4;
      const yA = R.y + R.h * 0.62;
      const resW = n * (s + gap) - gap;
      for (let i = 0; i < n; i++) {
        const px = cx - (n * pairW) / 2 + i * pairW + 6;
        g.save();
        g.globalAlpha = 1 - tt;
        g.strokeStyle = withAlpha(t.text, 0.5);
        g.lineWidth = 1.5;
        roundRect(g, px - 4, y0 - s * 0.72, pairW - 4, s * 1.44, 8);
        g.stroke();
        g.restore();
        const xa0 = px + s / 2;
        const xb0 = px + s / 2 + s + gap;
        const xa1 = cx - resW - 10 + s / 2 + i * (s + gap);
        const xb1 = cx + 10 + s / 2 + i * (s + gap);
        tile(g, lerp(xa0, xa1, tt), lerp(y0, yA, tt), s, A(), COL.a());
        tile(g, lerp(xb0, xb1, tt), lerp(y0, yA, tt), s, B(), COL.b());
      }
      if (tt > 0.95) segLine(g, [{ s: `= ${A()}${S(n)} · ${B()}${S(n)}`, c: COL.res(), w: 800 }], R.x + 18, yA + s * 1.2, R.w - 36, 16);
      if (tt > 0.3 && tt < 0.95) segLine(g, [{ s: tr('regroup'), c: t.muted }], R.x + 18, R.y + R.h * 0.9, R.w - 36, 12.5);
    }

    /* -------------------------------------------------------------- */
    /* Treppe                                                          */
    /* -------------------------------------------------------------- */

    function drawLadder(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      const a = p.a;
      const rows = [4, 3, 2, 1, 0, -1, -2, -3];
      const top = R.y + 44;
      const h = (R.h - 64) / rows.length;
      const x0 = R.x + 30;
      const reveal = k() * (rows.length + 0.5);
      segLine(g, [{ s: tr('ladderTitle'), c: t.muted, w: 700 }], R.x + 18, R.y + 22, R.w - 36, 13);
      rows.forEach((e, i) => {
        const y = top + h * (i + 0.5);
        const a1 = clamp(reveal - i, 0, 1);
        if (a1 <= 0) return;
        const val = powQ(q(a), q(e)).exact!;
        const stepW = (R.w - 80) * (0.5 + 0.5 * ((rows.length - 1 - i) / (rows.length - 1)));
        g.save();
        g.globalAlpha = a1;
        g.fillStyle = withAlpha(e >= 0 ? COL.a() : COL.b(), t.dark ? 0.22 : 0.12);
        roundRect(g, x0, y - h * 0.42, stepW, h * 0.84, 7);
        g.fill();
        g.restore();
        const col = e === 0 ? COL.res() : e > 0 ? COL.a() : COL.b();
        segLine(g, [{ s: `${a}${S(e)}`, c: col, w: 800 }], x0 + 10, y, 70, Math.min(20, h * 0.5), a1);
        segLine(g, [{ s: `= ${e < 0 ? `1/${a}${S(-e)} = ` : ''}${qText(val)}`, c: t.text, w: 600 }], x0 + 80, y, stepW - 84, Math.min(17, h * 0.45), a1);
        if (i < rows.length - 1 && reveal > i + 1) {
          // Pfeil „: a“
          const ax = x0 + stepW + 14;
          g.save();
          g.strokeStyle = withAlpha(t.text, 0.55);
          g.lineWidth = 1.6;
          g.beginPath();
          g.moveTo(ax, y + 4);
          g.quadraticCurveTo(ax + 16, y + h / 2, ax, y + h - 4);
          g.stroke();
          g.restore();
          segLine(g, [{ s: `: ${a}`, c: t.muted, w: 700 }], ax + 14, y + h / 2, 60, 12);
        }
      });
    }

    /* -------------------------------------------------------------- */
    /* Graph y = aˣ mit gebrochenem Exponenten                         */
    /* -------------------------------------------------------------- */

    function drawRoots(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      const a = p.a;
      const e = q(p.pm, p.pn);
      const ev = e.n / e.d;
      const val = a ** ev;
      const xMax = Math.max(1.6, Math.abs(ev) + 0.7);
      const yMax = Math.max(val, a, 1) * 1.6;
      plotArea = { x: R.x + 8, y: R.y + 34, w: R.w - 16, h: R.h - 42 };
      plot.setRange([-xMax, xMax], [-yMax * 0.06, yMax]);
      plot.resize();
      plot.begin();
      plot.grid({ minor: true });
      plot.axes();
      plot.fn((x) => a ** x, { color: COL.a(), width: 2.6 });
      // ganze Exponenten als Punkte
      for (let x = -Math.floor(xMax); x <= Math.floor(xMax); x++) plot.point(x, a ** x, { color: withAlpha(COL.a(), 0.7), radius: 3 });
      // n-tel Unterteilung zwischen 0 und 1 (bzw. bis ev)
      const steps = Math.round(Math.abs(ev) * e.d);
      const tt = k();
      for (let j = 1; j <= steps; j++) {
        const x = (Math.sign(ev) * j) / e.d;
        if (j / steps > tt + 1e-9) break;
        plot.point(x, a ** x, { color: withAlpha(COL.b(), 0.8), radius: 3.2 });
        plot.segment([x - Math.sign(ev) / e.d, 0], [x, 0], { color: withAlpha(COL.b(), 0.5), width: 4 });
      }
      if (tt > 0.95) {
        plot.segment([ev, 0], [ev, val], { color: withAlpha(COL.res(), 0.6), width: 1.4, dash: [4, 4] });
        plot.segment([0, val], [ev, val], { color: withAlpha(COL.res(), 0.6), width: 1.4, dash: [4, 4] });
        plot.point(ev, val, { color: COL.res(), radius: 6 });
        plot.text(ev, val, `${a}^(${qText(e)}) = ${N(val, 4)}`, { color: COL.res(), size: 13, weight: 'bold', offset: [ev >= 0 ? -10 : 10, -14], align: ev >= 0 ? 'right' : 'left', halo: true });
      }
      plot.text(Math.min(xMax * 0.9, Math.log(yMax * 0.9) / Math.log(a)), Math.min(a ** (xMax * 0.9), yMax * 0.9), `y = ${a}ˣ`, { color: COL.a(), size: 13, weight: 'bold', align: 'right', offset: [-6, 0], halo: true, math: true });
      plot.end();
      segLine(g, [{ s: tr('graph', { a }), c: t.muted, w: 700 }], R.x + 18, R.y + 18, R.w - 36, 13);
    }

    /* -------------------------------------------------------------- */
    /* Termumformer (Hauptfläche: Schritte als Karten)                 */
    /* -------------------------------------------------------------- */

    function drawTermSteps(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      const x = R.x + 18;
      const maxW = R.w - 36;
      let y = R.y + 26;
      const parsed = parseTerm(p.t);
      y += segLine(g, [{ s: parsed.ok ? nodeText(parsed.node) : p.t, c: t.text, w: 800 }], x, y, maxW, 19);
      if (!term.ok) {
        segLine(g, [{ s: term.msg, c: COL.warn(), w: 600 }], x, y + 4, maxW, 14);
        return;
      }
      y += 6;
      y += segLine(g, [{ s: tr('steps'), c: t.muted, w: 700 }], x, y, maxW, 13);
      if (!term.steps.length) y += segLine(g, [{ s: tr('noSteps'), c: t.muted }], x, y, maxW, 13);
      const reveal = k() * (term.steps.length + 0.4);
      term.steps.forEach((st, i) => {
        const a = clamp(reveal - i, 0, 1);
        if (a <= 0 || y > R.y + R.h - 70) return;
        const info = LAWS[st.law];
        const h = 50;
        g.save();
        g.globalAlpha = a;
        g.fillStyle = withAlpha(COL.a(), t.dark ? 0.14 : 0.07);
        roundRect(g, x - 6, y - 4, maxW + 12, h, 10);
        g.fill();
        g.restore();
        segLine(g, [{ s: `${info.name[ctx.lang]}: `, c: COL.a(), w: 700 }, { s: info.formula, c: t.muted }], x, y + 9, maxW, 12.5, a);
        segLine(g, [{ s: `${st.from} = `, c: t.text, w: 600 }, { s: p.show || verdict?.ok ? st.to : '…', c: COL.res(), w: 700 }], x, y + 30, maxW, 14.5, a);
        y += h + 8;
      });
      // Übersicht aller Gesetze, wenn Platz ist
      const used = new Set(term.steps.map((st) => st.law));
      const list: Law[] = ['mulSame', 'divSame', 'powPow', 'prodPow', 'quotPow', 'zero', 'neg', 'root'];
      const lh = 19;
      const boxH = lh * (list.length + 1.4);
      const by = R.y + R.h - boxH - 10;
      if (by < y + 10) return;
      g.save();
      g.strokeStyle = withAlpha(t.text, 0.18);
      g.setLineDash([4, 4]);
      roundRect(g, x - 6, by, maxW + 12, boxH, 10);
      g.stroke();
      g.restore();
      segLine(g, [{ s: tr('allLaws'), c: t.muted, w: 700 }], x, by + lh * 0.75, maxW, 12.5);
      list.forEach((lw, i) => {
        const on = used.has(lw);
        const yy = by + lh * (i + 1.7);
        segLine(g, [{ s: LAWS[lw].formula, c: on ? COL.a() : t.muted, w: on ? 800 : 600 }], x + 4, yy, maxW * 0.42, 13);
        segLine(g, [{ s: LAWS[lw].name[ctx.lang], c: on ? t.text : t.muted, w: on ? 600 : 500 }], x + maxW * 0.45, yy, maxW * 0.55, 12.5);
      });
    }

    /* -------------------------------------------------------------- */
    /* Karte                                                           */
    /* -------------------------------------------------------------- */

    function drawCardBody(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      drawCard(g, R, t, COL.a());
      const x = R.x + 16;
      const maxW = R.w - 32;
      const size = R.w < 330 ? 13 : R.w < 440 ? 14 : 15;
      let y = R.y + 22;
      const line = (segs: Seg[], d = 0) => (y += segLine(g, segs, x, y, maxW, size + d));
      if (p.mode === 'laws') {
        const m = p.m;
        const n = p.n;
        const a = p.a;
        const map: Record<LawView, Law> = { mul: 'mulSame', div: 'divSame', powpow: 'powPow', prodpow: 'prodPow' };
        const info = LAWS[map[law()]];
        line([{ s: info.name[ctx.lang], c: t.muted, w: 700 }], -1);
        line([{ s: info.formula, c: COL.res(), w: 800 }], 4);
        y += 6;
        if (law() === 'mul') {
          line([{ s: `${A()}${S(m)} · ${A()}${S(n)} = ${A()}${S(m + n)}`, c: t.text, w: 700 }], 1);
          if (!p.sym && p.show) line([{ s: `${big(a ** m)} · ${big(a ** n)} = ${big(a ** (m + n))}`, c: t.muted }], -1);
        } else if (law() === 'div') {
          const d = m - n;
          line([{ s: `${A()}${S(m)} : ${A()}${S(n)} = ${A()}${S(d)}`, c: t.text, w: 700 }], 1);
          if (d < 0) line([{ s: `${A()}${S(d)} = 1 / ${A()}${S(-d)}`, c: COL.b(), w: 700 }]);
          if (d === 0) line([{ s: `${A()}⁰ = 1`, c: COL.res(), w: 700 }]);
          if (!p.sym && p.show) line([{ s: `${big(a ** m)} : ${big(a ** n)} = ${qText(powQ(q(a), q(d)).exact!)}`, c: t.muted }], -1);
        } else if (law() === 'powpow') {
          line([{ s: `(${A()}${S(m)})${S(n)} = ${A()}${S(m * n)}`, c: t.text, w: 700 }], 1);
          line([{ s: `= ${Array.from({ length: n }, () => `${A()}${S(m)}`).join(' · ')}`, c: t.muted }], -1.5);
          if (!p.sym && p.show) line([{ s: `= ${big(a ** (m * n))}`, c: t.muted }], -1);
        } else {
          line([{ s: `(${A()} · ${B()})${S(n)} = ${A()}${S(n)} · ${B()}${S(n)}`, c: t.text, w: 700 }], 1);
          if (!p.sym && p.show) line([{ s: `${big((p.a * p.b) ** n)} = ${big(p.a ** n)} · ${big(p.b ** n)}`, c: t.muted }], -1);
        }
        y += 8;
        line([{ s: ctx.lang === 'de' ? 'Vorsicht, typische Fehler:' : 'Careful, typical mistakes:', c: t.muted, w: 700 }], -2);
        const traps: Record<LawView, string[]> = {
          mul: [`${A()}${S(m)} · ${A()}${S(n)} ≠ ${A()}${S(m * n)}`, `${A()}${S(m)} + ${A()}${S(n)} ≠ ${A()}${S(m + n)}`],
          div: [`${A()}${S(m)} : ${A()}${S(n)} ≠ ${A()}^(${m} : ${n})`, `${A()}⁰ ≠ 0`],
          powpow: [`(${A()}${S(m)})${S(n)} ≠ ${A()}${S(m + n)}`, `${A()}^(${m}${S(n)}) ≠ (${A()}${S(m)})${S(n)}`],
          prodpow: [`(${A()} + ${B()})${S(n)} ≠ ${A()}${S(n)} + ${B()}${S(n)}`],
        };
        for (const tx of traps[law()]) line([{ s: `✗  ${tx}`, c: COL.warn(), w: 600 }], -1.5);
        return;
      }
      if (p.mode === 'ladder') {
        line([{ s: 'a⁰ = 1,   a⁻ⁿ = 1 / aⁿ', c: COL.res(), w: 800 }], 3);
        y += 4;
        line([{ s: tr('ladderWhy'), c: t.text }], -1.5);
        y += 6;
        const a = p.a;
        line([{ s: `${a}² : ${a}⁵ = ${a}⁻³ = 1/${a ** 3}`, c: t.text, w: 600 }], -1);
        line([{ s: `${a}³ : ${a}³ = ${a}⁰ = 1`, c: t.text, w: 600 }], -1);
        line([{ s: `${a}⁻¹ · ${a} = ${a}⁰ = 1`, c: t.text, w: 600 }], -1);
        return;
      }
      if (p.mode === 'roots') {
        const a = p.a;
        const e = q(p.pm, p.pn);
        const r = powQ(q(a), e);
        line([{ s: tr('rootTitle'), c: COL.res(), w: 800 }], 1);
        y += 4;
        const base = `${a}^(${qText(e)})`;
        line([{ s: base, c: t.text, w: 800 }], 3);
        if (e.d > 1) {
          const idx = e.d === 2 ? '√' : `${sup(String(e.d))}√`;
          const m = Math.abs(e.n);
          const inner = m === 1 ? `${idx}${a}` : `${idx}(${a}${S(m)}) = (${idx}${a})${S(m)}`;
          line([{ s: `= ${e.n < 0 ? `1 / ${m === 1 ? `${idx}${a}` : `(${inner})`}` : inner}`, c: t.text }], -0.5);
          const root = powQ(q(a), q(1, e.d));
          line([{ s: `${idx}${a} = ${root.exact ? qText(root.exact) : `≈ ${N(root.value, 4)}`}`, c: COL.b(), w: 600 }], -1);
        }
        if (p.show) line([{ s: r.exact ? `= ${qText(r.exact)}  (${tr('exact')})` : `≈ ${N(r.value, 5)}  (${tr('approx')})`, c: COL.res(), w: 800 }], 2);
        y += 6;
        line([{ s: tr('rootWhy'), c: t.muted }], -2);
        return;
      }
      // Terme
      line([{ s: tr('result'), c: t.muted, w: 700 }], -1);
      if (!term.ok) return void line([{ s: term.msg, c: COL.warn(), w: 600 }], -1);
      const revealRes = p.show || !!verdict?.ok;
      if (revealRes) {
        line([{ s: monoText(term.mono), c: COL.res(), w: 800 }], 4);
        const pf = monoPowerForm(term.mono);
        if (pf !== monoText(term.mono)) line([{ s: `${tr('powerForm')}: ${pf}`, c: t.muted }], -1.5);
        const rf = monoText(term.mono, true);
        if (rf !== monoText(term.mono)) line([{ s: `${tr('rootForm')}: ${rf}`, c: t.muted }], -1.5);
        // Probe mit Zahlen
        const vars = Object.fromEntries([...term.mono.pow.keys()].filter((v) => /[a-z]/.test(v)).map((v, i) => [v, [2, 3, 5][i] ?? 7]));
        const r0 = parseTerm(p.t);
        if (Object.keys(vars).length && r0.ok) {
          const left = monoValue(simplify(r0.node).mono, vars);
          line([{ s: `${tr('check')} (${Object.entries(vars).map(([kk, v]) => `${kk} = ${v}`).join(', ')}): ${N(left, 4)}`, c: t.muted }], -2);
        }
      } else line([{ s: tr('hidden'), c: t.muted }], -1);
      y += 8;
      // eigene Vereinfachung
      line([{ s: tr('yours'), c: t.muted, w: 700 }], -1);
      if (!p.g.trim()) line([{ s: tr('typeHere'), c: t.muted }], -2);
      else {
        const r = parseTerm(p.g);
        line([{ s: p.g, c: r.ok ? t.text : COL.warn(), w: 700 }]);
        if (verdict) {
          const a = verdictTw.running ? clamp(verdictTw.value, 0, 1) : 1;
          const col = verdict.ok ? COL.good() : COL.warn();
          g.save();
          g.globalAlpha = a;
          g.fillStyle = withAlpha(col, t.dark ? 0.2 : 0.1);
          roundRect(g, x - 8, y - size * 0.4, maxW + 16, size * 2.3, 10);
          g.fill();
          g.restore();
          segLine(g, [{ s: verdict.ok ? tr('right') : tr('wrong'), c: col, w: 800 }], x, y + size * 0.75, maxW, size, a);
          y += size * 2.6;
        }
      }
    }

    /* -------------------------------------------------------------- */
    /* Ergebnisse und Ablauf                                           */
    /* -------------------------------------------------------------- */

    function updateReadouts(): void {
      if (p.mode === 'terms') {
        ctx.readout('term', p.t);
        ctx.readout('res', term.ok ? monoText(term.mono) : term.msg);
        return;
      }
      if (p.mode === 'roots') {
        const e = q(p.pm, p.pn);
        const r = powQ(q(p.a), e);
        ctx.readout('term', `${p.a}^(${qText(e)})`);
        ctx.readout('res', r.exact ? qText(r.exact) : `≈ ${N(r.value, 5)}`);
        return;
      }
      if (p.mode === 'ladder') {
        ctx.readout('term', `${p.a}⁰, ${p.a}⁻¹, ${p.a}⁻²`);
        ctx.readout('res', `1, 1/${p.a}, 1/${p.a * p.a}`);
        return;
      }
      const m = p.m;
      const n = p.n;
      const txt: Record<LawView, [string, string]> = {
        mul: [`${A()}${S(m)} · ${A()}${S(n)}`, `${A()}${S(m + n)}`],
        div: [`${A()}${S(m)} : ${A()}${S(n)}`, `${A()}${S(m - n)}`],
        powpow: [`(${A()}${S(m)})${S(n)}`, `${A()}${S(m * n)}`],
        prodpow: [`(${A()} · ${B()})${S(n)}`, `${A()}${S(n)} · ${B()}${S(n)}`],
      };
      ctx.readout('term', txt[law()][0]);
      ctx.readout('res', txt[law()][1]);
    }

    function runCheck(): void {
      const a = parseTerm(p.t);
      const b = parseTerm(p.g);
      if (!a.ok || !b.ok) {
        verdict = null;
        ctx.requestRender();
        return;
      }
      verdict = { ok: sameTerm(a.node, b.node) };
      verdictTw.play();
      ctx.requestRender();
    }

    return {
      update(changed, source) {
        if (changed.has('t') || source === 'init' || source === 'replace') term = readTerm();
        if (changed.has('t') || changed.has('g')) verdict = null;
        if (['mode', 'law', 'm', 'n', 'a', 'b', 'pm', 'pn', 't', 'sym'].some((x) => changed.has(x)) || source === 'init' || source === 'replace') anim.play(changed.has('m') || changed.has('n') ? 1400 : 2200);
        updateReadouts();
      },
      action(id) {
        if (id === 'play') anim.play();
        if (id === 'check') runCheck();
      },
      render() {
        const g = surface.begin();
        const R = regions();
        drawCard(g, R.main, th());
        if (p.mode === 'laws') drawLaws(g, R.main);
        else if (p.mode === 'ladder') drawLadder(g, R.main);
        else if (p.mode === 'roots') drawRoots(g, R.main);
        else drawTermSteps(g, R.main);
        drawCardBody(g, R.card);
        if (anim.running || verdictTw.running) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
