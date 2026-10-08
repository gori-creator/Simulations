import { defineSimulation, ease, prefersReducedMotion, roundRect, Surface, TapTarget, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  bracketDepths,
  children,
  conventionalNext,
  describe,
  evaluateAll,
  evaluationOrder,
  fromNumber,
  isInner,
  KIND_NAMES,
  kindOf,
  leavesOf,
  opClass,
  PART_NAMES,
  parseTerm,
  readyNodes,
  reasonFor,
  show,
  showText,
  subtree,
  termText,
  typeset,
  usesVariable,
  VARIABLES,
  type Box,
  type InnerNode,
  type Kind,
  type NodeValue,
  type OpClass,
  type ParsedTerm,
  type ParseError,
  type Q,
  type Reason,
  type TermNode,
  type VarName,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const STEP_MS = 950;
const AUTO_PAUSE_MS = 380;
const PULSE_MS = 5000;

const variable = (key: VarName, value: number) =>
  ({
    key,
    type: 'number',
    group: 'vars',
    label: L(`Variable ${key}`, `Variable ${key}`),
    min: -10,
    max: 10,
    step: 0.5,
    default: value,
    visibleIf: (v: Record<string, unknown>) => usesVariable(String(v.term ?? ''), key),
  }) as const;

/** Geometrie eines Knotens im Baum. */
interface NodeGeo {
  node: TermNode;
  x: number;
  y: number;
  /** Halbe Breite und Höhe (Zahlkarten) bzw. Radius (Rechnungen). */
  hw: number;
  hh: number;
}

/** Gesetzter Text (Kopfzeile): Maße und Zeichenfunktion. */
interface Laid {
  w: number;
  asc: number;
  desc: number;
  paint(x: number, base: number): void;
}

/**
 * Termbaum: Ein Term wird in seine Rechnungen zerlegt. Oben stehen die Zahlen,
 * unten das Ergebnis (wie im Schulbuch). Schritt für Schritt wandern die Werte
 * durch den Baum – in der Rechenreihenfolge oder in einer selbst gewählten.
 */
export default defineSimulation({
  id: 'termbaum',
  layout: { aspect: 1.45, aspectNarrow: 0.72 },
  groups: [
    { id: 'vars', label: L('Variablen belegen', 'Values of the variables') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'term',
      type: 'text',
      label: L('Term', 'Expression'),
      default: '(12 − 4) · 3 + 6 : 2',
      maxLength: 60,
      placeholder: L('z. B. 3 + 4 · 5', 'e.g. 3 + 4 · 5'),
      help: L(
        'Rechenzeichen + − · (oder *) : und ^ für Potenzen, Klammern ( ) [ ]. Brüche wie 3/4, Dezimalzahlen wie 0,5, Variablen a, b, c, n, x, y, z.',
        'Operators + − · (or *) : and ^ for powers, brackets ( ) [ ]. Fractions like 3/4, decimals like 0.5, variables a, b, c, n, x, y, z.',
      ),
    },
    variable('a', 3),
    variable('b', 2),
    variable('c', 4),
    variable('n', 5),
    variable('x', 2),
    variable('y', 3),
    variable('z', 1),
    { key: 'names', type: 'boolean', group: 'view', label: L('Termarten an den Rechnungen', 'Names of the operations'), default: true },
    { key: 'order', type: 'boolean', group: 'view', label: L('Rechenreihenfolge vorab nummerieren', 'Number the order of operations in advance'), default: false },
    { key: 'top', type: 'boolean', group: 'view', label: L('Ergebnis oben (Baum umgedreht)', 'Result at the top (tree upside down)'), default: false },
  ],
  actions: [
    { id: 'step', label: L('Nächster Rechenschritt', 'Next step'), primary: true },
    { id: 'all', label: L('Alles ausrechnen', 'Evaluate all') },
    { id: 'clear', label: L('Von vorn', 'Start over') },
  ],
  readouts: [
    { key: 'kind', label: L('Termart', 'Type of expression'), spoiler: true },
    { key: 'parts', label: L('Glieder', 'Parts'), spoiler: true },
    { key: 'words', label: L('Gliederung in Worten', 'Structure in words'), spoiler: true },
    { key: 'chain', label: L('Rechenweg', 'Working') },
    { key: 'value', label: L('Termwert', 'Value'), spoiler: true },
    { key: 'table', label: L('Wertetabelle', 'Table of values'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Klammer, Punkt, Strich', 'Brackets, ×÷, +−'), values: {} },
    { id: 'point', label: L('Punkt vor Strich', 'Multiply first'), values: { term: '3 + 4 · 5' } },
    { id: 'brackets', label: L('Mit Klammer', 'With brackets'), values: { term: '(3 + 4) · 5' } },
    { id: 'power', label: L('−3² oder (−3)²?', '−3² or (−3)²?'), values: { term: '−3² + (−3)²' } },
    { id: 'fractions', label: L('Brüche', 'Fractions'), values: { term: '(1/2 + 1/3) · 6' } },
    { id: 'variable', label: L('Term mit Variable', 'With a variable'), values: { term: '2x² − 3x + 1', x: 2 } },
  ],
  strings: {
    de: {
      canvas: 'Termbaum: oben die Zahlen des Terms, darunter die Rechnungen bis zum Ergebnis',
      hint: 'Tippe auf eine leuchtende Rechnung oder auf „Nächster Rechenschritt“.',
      hintVars: 'Eingesetzt: {vars}. Tippe auf eine leuchtende Rechnung.',
      step: 'Schritt {k} ({reason}): {calc}',
      other: '{calc} – auch erlaubt: Die Teilterme hängen nicht voneinander ab. Nach der Regel wäre {next} zuerst dran.',
      notReady: 'Noch nicht möglich: Zuerst muss {child} ausgerechnet werden.',
      leaf: '{leaf} ist eine Zahl – hier gibt es nichts zu rechnen.',
      leafVar: 'Für {v} wird {value} eingesetzt.',
      done: 'Fertig! Der Term ist {kind}: zuletzt wurde {verb}.',
      doneNumber: 'Der Term ist nur eine Zahl.',
      fail: '{calc}: {msg}',
      bracket: 'Klammer zuerst',
      power: 'Potenz vor Punkt vor Strich',
      sign: 'Gegenzahl bilden',
      point: 'Punkt vor Strich',
      leftToRight: 'von links nach rechts',
      last: 'letzte Rechnung',
      divZero: 'Durch 0 kann man nicht teilen. Der Term hat keinen Wert.',
      zeroPowZero: '0⁰ ist nicht festgelegt. Der Term hat keinen Wert.',
      fracExp: 'Hier sind nur ganze Zahlen als Exponent möglich.',
      tooBig: 'Das Ergebnis wird zu groß.',
      e_empty: 'Gib einen Term ein, z. B. 3 + 4 · 5.',
      e_badChar: 'Das Zeichen „{a}“ gibt es in Termen nicht.',
      e_equals: 'Gib nur einen Term ein – ohne „=“.',
      e_unknownVar: 'Variable „{a}“: erlaubt sind a, b, c, n, x, y und z.',
      e_decimal: 'Nach dem Komma fehlen die Nachkommastellen.',
      e_numTooLong: 'Die Zahl ist zu lang (höchstens 9 Ziffern).',
      e_expectOperand: 'Nach „{a}“ fehlt eine Zahl, eine Variable oder eine Klammer.',
      e_startOperator: 'Vor „{a}“ fehlt eine Zahl.',
      e_signAfterOp: 'Ein Vorzeichen direkt nach „{a}“ geht nicht – setze eine Klammer, z. B. 5 · (−3).',
      e_doubleSign: 'Zwei Vorzeichen hintereinander – setze eine Klammer, z. B. −(−3).',
      e_signInExponent: 'Negative Exponenten in Klammern setzen, z. B. 2^(−1).',
      e_missingOp: 'Zwischen „{a}“ und „{b}“ fehlt ein Rechenzeichen.',
      e_unclosed: 'Zur Klammer „{a}“ fehlt die schließende Klammer.',
      e_unexpectedClose: 'Zur Klammer „{a}“ gibt es keine öffnende Klammer.',
      e_mismatch: 'Die Klammer „{a}“ wird mit „{b}“ geschlossen.',
      e_emptyParens: 'In der Klammer steht nichts.',
      e_zeroDen: 'Ein Bruch mit dem Nenner 0 ist nicht erlaubt.',
      e_tooLong: 'Der Term hat zu viele Zahlen für die Darstellung (höchstens 16).',
      e_tooDeep: 'Der Term ist zu tief verschachtelt für die Darstellung.',
      verb_sum: 'addiert',
      verb_difference: 'subtrahiert',
      verb_product: 'multipliziert',
      verb_quotient: 'dividiert',
      verb_power: 'potenziert',
      verb_negation: 'die Gegenzahl gebildet',
      art_sum: 'eine Summe',
      art_difference: 'eine Differenz',
      art_product: 'ein Produkt',
      art_quotient: 'ein Quotient',
      art_power: 'eine Potenz',
      art_negation: 'eine Gegenzahl',
      kindText: '{kind} – die letzte Rechnung ist „{op}“.',
      kindNumber: 'eine einzelne Zahl (keine Rechnung)',
      kindVariable: 'eine einzelne Variable',
      valueFor: 'für {vars}: {value}',
      undefinedValue: 'nicht definiert',
      tableNone: 'nur bei Termen mit genau einer Variablen',
      all: 'Alles ausrechnen',
      pause: 'Anhalten',
    },
    en: {
      canvas: 'Expression tree: the numbers of the expression at the top, the operations below down to the result',
      hint: 'Tap a glowing operation or press “Next step”.',
      hintVars: 'Substituted: {vars}. Tap a glowing operation.',
      step: 'Step {k} ({reason}): {calc}',
      other: '{calc} – also fine: the parts do not depend on each other. By the rules, {next} would come first.',
      notReady: 'Not yet: {child} has to be worked out first.',
      leaf: '{leaf} is a number – nothing to work out here.',
      leafVar: '{value} is substituted for {v}.',
      done: 'Done! The expression is {kind}: the last step was {verb}.',
      doneNumber: 'The expression is just a number.',
      fail: '{calc}: {msg}',
      bracket: 'brackets first',
      power: 'powers before × ÷ before + −',
      sign: 'take the opposite',
      point: '× and ÷ before + and −',
      leftToRight: 'from left to right',
      last: 'last operation',
      divZero: 'You cannot divide by 0. The expression has no value.',
      zeroPowZero: '0⁰ is not defined. The expression has no value.',
      fracExp: 'Only whole-number exponents are possible here.',
      tooBig: 'The result gets too large.',
      e_empty: 'Type an expression, e.g. 3 + 4 · 5.',
      e_badChar: 'The character “{a}” does not belong in an expression.',
      e_equals: 'Type an expression only – without “=”.',
      e_unknownVar: 'Variable “{a}”: allowed are a, b, c, n, x, y and z.',
      e_decimal: 'Digits are missing after the decimal point.',
      e_numTooLong: 'The number is too long (at most 9 digits).',
      e_expectOperand: 'After “{a}” a number, a variable or a bracket is missing.',
      e_startOperator: 'A number is missing before “{a}”.',
      e_signAfterOp: 'A sign right after “{a}” is not allowed – use brackets, e.g. 5 · (−3).',
      e_doubleSign: 'Two signs in a row – use brackets, e.g. −(−3).',
      e_signInExponent: 'Put negative exponents in brackets, e.g. 2^(−1).',
      e_missingOp: 'An operator is missing between “{a}” and “{b}”.',
      e_unclosed: 'The bracket “{a}” is never closed.',
      e_unexpectedClose: 'The bracket “{a}” has no opening bracket.',
      e_mismatch: 'The bracket “{a}” is closed with “{b}”.',
      e_emptyParens: 'There is nothing inside the brackets.',
      e_zeroDen: 'A fraction with denominator 0 is not allowed.',
      e_tooLong: 'The expression has too many numbers to display (at most 16).',
      e_tooDeep: 'The expression is nested too deeply to display.',
      verb_sum: 'an addition',
      verb_difference: 'a subtraction',
      verb_product: 'a multiplication',
      verb_quotient: 'a division',
      verb_power: 'raising to a power',
      verb_negation: 'taking the opposite',
      art_sum: 'a sum',
      art_difference: 'a difference',
      art_product: 'a product',
      art_quotient: 'a quotient',
      art_power: 'a power',
      art_negation: 'an opposite',
      kindText: '{kind} – the last operation is “{op}”.',
      kindNumber: 'a single number (no operation)',
      kindVariable: 'a single variable',
      valueFor: 'for {vars}: {value}',
      undefinedValue: 'not defined',
      tableNone: 'only for expressions with exactly one variable',
      all: 'Evaluate all',
      pause: 'Pause',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const lang = ctx.lang;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const reduced = prefersReducedMotion();

    /* ---------- Zustand ---------- */
    let term: ParsedTerm | null = null;
    /** Letzter gültiger Term: bleibt bei Eingabefehlern blass sichtbar. */
    let lastValid: ParsedTerm | null = null;
    const shownTerm = () => term ?? lastValid;
    let error: ParseError | null = null;
    let values: NodeValue[] = [];
    let order: number[] = [];
    let depths: number[] = [];
    /** Ausgerechnete Rechnungen in der Reihenfolge, in der sie ausgeführt wurden. */
    let done: number[] = [];
    let anim: { id: number; start: number } | null = null;
    let auto = false;
    let autoAt = 0;
    let shake: { id: number; start: number } | null = null;
    let status: { text: string; tone: 'info' | 'ok' | 'warn' | 'error'; color?: string } | null = null;
    let hovered: number | null = null;
    /** Nach dem Antippen bleibt der Teilterm kurz hervorgehoben (Touch hat kein Überfahren). */
    let tapFocus: { id: number; until: number } | null = null;
    /** Deckkraft des ganzen Baums (blass bei Eingabefehlern). */
    let dimAll = 1;
    let highlightId: number | null = null;
    let pulseUntil = 0;
    const appear = new Tween(520, ease.outCubic);
    let geo: NodeGeo[] = [];
    let geoKey = '';

    const doneSet = () => new Set(done);
    const subst = (): Partial<Record<VarName, Q>> => Object.fromEntries((term?.vars ?? []).map((v) => [v, fromNumber(p[v])])) as Partial<Record<VarName, Q>>;
    const valueMap = (upto = done.length) => {
      const map = new Map<number, Q>();
      for (const id of done.slice(0, upto)) {
        const v = values[id];
        if (v?.ok) map.set(id, v.value);
      }
      return map;
    };
    const failedNode = () => done.find((id) => values[id] && !values[id]!.ok) ?? null;
    const finished = () => !!term && (failedNode() !== null || term.nodes.every((n) => !isInner(n) || done.includes(n.id)));

    function classColor(cls: OpClass | 'var' | 'leaf'): string {
      const s = ctx.theme.series;
      return { line: s[0]!, point: s[2]!, power: s[3]!, sign: s[5]!, var: s[4]!, leaf: ctx.theme.text }[cls];
    }
    const colorOf = (node: TermNode) => (isInner(node) ? classColor(opClass(node)) : node.kind === 'var' ? classColor('var') : classColor('leaf'));

    /* ---------- Text-Bausteine ---------- */
    const numText = (v: Q) => showText(v, term?.decimal ?? false, lang);
    const opSymbol = (node: InnerNode) => (node.kind === 'neg' ? '−' : ({ '+': '+', '-': '−', '*': '·', ':': ':', '/': ':', '^': '^' } as const)[node.op]);

    /** Rechnung als Text, z. B. „8 · 3 = 24“. */
    function calcText(node: InnerNode): string {
      const kids = children(node).map((c) => values[c.id]);
      const res = values[node.id];
      const arg = (v: NodeValue | undefined) => {
        if (!v?.ok) return '?';
        const t = numText(v.value);
        return v.value.n < 0n || t.includes('/') ? `(${t})` : t;
      };
      let lhs: string;
      if (node.kind === 'neg') lhs = `−${arg(kids[0])}`;
      else if (node.op === '^') {
        const e = kids[1]?.ok ? numText(kids[1].value) : '?';
        lhs = /^[0-9]+$/.test(e) ? `${arg(kids[0])}${e.replace(/[0-9]/g, (c) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(c)]!)}` : `${arg(kids[0])}^${e}`;
      } else {
        const first = kids[0]?.ok ? numText(kids[0].value) : '?';
        lhs = `${first} ${opSymbol(node)} ${arg(kids[1])}`;
      }
      return res?.ok ? `${lhs} = ${numText(res.value)}` : lhs;
    }

    /* ---------- Satz der Kopfzeile ---------- */
    function layoutBox(box: Box, size: number, highlight: ReadonlySet<number> | null, rects: { node: number; r: Rect }[]): Laid {
      const g = surface.g;
      const theme = ctx.theme;
      const nodeById = (id: number) => term?.nodes[id];
      switch (box.t) {
        case 'text': {
          const isVar = box.role === 'var';
          const font =
            box.role === 'var'
              ? `italic ${size * 1.12}px ${theme.mathFont}`
              : box.role === 'paren'
                ? `400 ${size * 1.04}px ${theme.font}`
                : box.role === 'op'
                  ? `500 ${size}px ${theme.font}`
                  : `${box.role === 'value' ? 700 : 600} ${size}px ${theme.font}`;
          g.font = font;
          const tw = g.measureText(box.s).width;
          const binary = box.role === 'op' && box.cls !== 'sign';
          const padL = binary ? size * 0.3 : box.role === 'paren' ? size * 0.04 : box.role === 'op' ? size * 0.02 : 0;
          const padR = binary ? size * 0.3 : box.role === 'paren' ? size * 0.04 : box.role === 'op' ? size * 0.06 : isVar ? size * 0.06 : 0;
          const w = tw + padL + padR;
          return {
            w,
            asc: size * 0.78,
            desc: size * 0.26,
            paint: (x, base) => {
              const node = nodeById(box.node);
              let color = theme.text;
              if (box.role === 'op' && box.cls) color = classColor(box.cls);
              else if (box.role === 'var') color = classColor('var');
              else if (box.role === 'paren') color = theme.muted;
              else if (box.role === 'value' && node) color = colorOf(node);
              if (box.fresh) {
                g.save();
                g.fillStyle = withAlpha(color, theme.dark ? 0.24 : 0.14);
                roundRect(g, x - 3, base - size * 0.86, w + 6, size * 1.18, 6);
                g.fill();
                g.restore();
              }
              const dim = highlight && !highlight.has(box.node);
              g.globalAlpha = dim ? 0.38 : 1;
              text(g, box.s, x + padL, base, { font, color, align: 'left', baseline: 'alphabetic' });
              g.globalAlpha = 1;
              rects.push({ node: box.node, r: { x, y: base - size * 0.8, w, h: size * 1.08 } });
            },
          };
        }
        case 'row': {
          const first = box.items[0];
          const last = box.items[box.items.length - 1];
          const bracketed = box.items.length === 3 && first?.t === 'text' && first.role === 'paren' && last?.t === 'text' && last.role === 'paren';
          if (bracketed) {
            // Klammern so hoch wie ihr Inhalt (z. B. um Brüche)
            const mid = layoutBox(box.items[1]!, size, highlight, rects);
            const ps = Math.max(size, (mid.asc + mid.desc) * 0.92);
            const open = layoutBox(first, ps, highlight, rects);
            const close = layoutBox(last, ps, highlight, rects);
            const shift = (ps - size) * 0.3;
            return {
              w: open.w + mid.w + close.w,
              asc: Math.max(mid.asc, open.asc - shift),
              desc: Math.max(mid.desc, open.desc + shift),
              paint: (x, base) => {
                open.paint(x, base + shift);
                mid.paint(x + open.w, base);
                close.paint(x + open.w + mid.w, base + shift);
              },
            };
          }
          const items = box.items.map((b) => layoutBox(b, size, highlight, rects));
          return {
            w: items.reduce((s, i) => s + i.w, 0),
            asc: Math.max(...items.map((i) => i.asc)),
            desc: Math.max(...items.map((i) => i.desc)),
            paint: (x, base) => {
              let cx = x;
              for (const i of items) {
                i.paint(cx, base);
                cx += i.w;
              }
            },
          };
        }
        case 'frac': {
          const s2 = Math.max(11, size * 0.78);
          const num = layoutBox(box.num, s2, highlight, rects);
          const den = layoutBox(box.den, s2, highlight, rects);
          const pad = size * 0.14;
          const w = Math.max(num.w, den.w) + pad * 2;
          const axis = size * 0.3;
          const gap = size * 0.1;
          const bar = Math.max(1.5, size * 0.06);
          return {
            w,
            asc: axis + gap + num.desc + num.asc,
            desc: gap + den.asc + den.desc - axis,
            paint: (x, base) => {
              const by = base - axis;
              num.paint(x + (w - num.w) / 2, by - gap - num.desc - bar / 2);
              den.paint(x + (w - den.w) / 2, by + gap + den.asc + bar / 2);
              const node = nodeById(box.node);
              const dim = highlight && !highlight.has(box.node);
              g.globalAlpha = dim ? 0.38 : 1;
              g.fillStyle = box.bar ? classColor(box.bar) : box.role === 'value' && node ? colorOf(node) : theme.text;
              g.fillRect(x + pad * 0.4, by - bar / 2, w - pad * 0.8, bar);
              g.globalAlpha = 1;
              rects.push({ node: box.node, r: { x, y: by - 2, w, h: 4 } });
            },
          };
        }
        case 'sup': {
          const base = layoutBox(box.base, size, highlight, rects);
          const exp = layoutBox(box.exp, Math.max(10, size * 0.62), highlight, rects);
          const raise = size * 0.4;
          const gap = box.base.t === 'text' && box.base.role === 'var' ? -size * 0.06 : size * 0.03;
          return {
            w: base.w + exp.w + gap,
            asc: Math.max(base.asc, raise + exp.asc),
            desc: base.desc,
            paint: (x, b) => {
              base.paint(x, b);
              exp.paint(x + base.w + gap, b - raise);
              rects.push({ node: box.node, r: { x: x + base.w, y: b - raise - exp.asc, w: exp.w, h: exp.asc + exp.desc } });
            },
          };
        }
      }
    }

    /** Box in eine vorgegebene Breite einpassen (Schrift ggf. verkleinern). */
    function fitBox(box: Box, size: number, maxW: number, highlight: ReadonlySet<number> | null, rects: { node: number; r: Rect }[]): { laid: Laid; size: number } {
      let s = size;
      let laid = layoutBox(box, s, highlight, []);
      if (laid.w > maxW) {
        s = Math.max(11, (s * maxW) / laid.w);
        laid = layoutBox(box, s, highlight, []);
      }
      return { laid: layoutBox(box, s, highlight, rects), size: s };
    }

    /* ---------- Ergebnisse ---------- */
    function boxHtml(box: Box): string {
      const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
      switch (box.t) {
        case 'text':
          if (box.role === 'var') return `<var>${esc(box.s)}</var>`;
          if (box.role === 'op') return box.cls === 'sign' ? '−' : ` ${esc(box.s)} `;
          return box.fresh ? `<strong>${esc(box.s)}</strong>` : esc(box.s);
        case 'row':
          return box.items.map(boxHtml).join('');
        case 'frac': {
          const f = `<span class="frac"><span>${boxHtml(box.num)}</span><span>${boxHtml(box.den)}</span></span>`;
          return box.fresh ? `<strong>${f}</strong>` : f;
        }
        case 'sup':
          return `${boxHtml(box.base)}<sup>${boxHtml(box.exp)}</sup>`;
      }
    }

    function substText(): string {
      return (term?.vars ?? []).map((v) => `${v} = ${numText(fromNumber(p[v]))}`).join(', ');
    }

    function updateReadouts(): void {
      if (!term) {
        for (const key of ['kind', 'parts', 'words', 'value', 'table']) ctx.readout(key, null);
        ctx.readout('chain', error ? errorMessage(error) : null);
        return;
      }
      const root = term.root;
      const kind = kindOf(root);
      if (kind === 'number' || kind === 'variable') {
        ctx.readout('kind', ctx.t(kind === 'number' ? 'kindNumber' : 'kindVariable'));
        ctx.readout('parts', null);
        ctx.readout('words', null);
      } else {
        const name = KIND_NAMES[kind][lang];
        ctx.readout('kind', tr('kindText', { kind: lang === 'de' ? name : name[0]!.toUpperCase() + name.slice(1), op: opSymbol(root as InnerNode) }));
        const names = PART_NAMES[kind];
        if (names && root.kind === 'op') {
          const part = (n: TermNode, i: 0 | 1) => {
            const k = kindOf(n);
            const sub = k === 'number' || k === 'variable' ? '' : ` <span style="color: var(--muted)">(${KIND_NAMES[k][lang]})</span>`;
            return `${names[i][lang]}: ${boxHtml(typeset({ ...n, brackets: [] }, { lang, decimal: term!.decimal }))}${sub}`;
          };
          ctx.readout('parts', { html: `${part(root.left, 0)}<br>${part(root.right, 1)}` });
        } else ctx.readout('parts', null);
        const sentence = describe(root, lang);
        ctx.readout('words', sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.');
      }
      // Rechenweg
      const o = { lang, decimal: term.decimal } as const;
      const s = subst();
      const why = (t: string) => ` <small style="color: var(--muted)">(${t})</small>`;
      const lines: string[] = [boxHtml(typeset(root, o))];
      if (term.vars.length) lines.push(`= ${boxHtml(typeset(root, { ...o, subst: s }))}${why(substText())}`);
      const nodeDepths = depths;
      done.forEach((id, i) => {
        const v = values[id];
        if (!v?.ok) {
          lines.push(`<span style="color: var(--series-2)">${ctx.t(v ? (v.error as string) : 'divZero')}</span>`);
          return;
        }
        const remaining = term!.nodes.filter((n): n is InnerNode => isInner(n) && !done.slice(0, i + 1).includes(n.id));
        const reason = reasonFor(term!.nodes[id] as InnerNode, remaining, nodeDepths[id] ?? 0);
        const box = typeset(root, { ...o, subst: s, values: valueMap(i + 1), fresh: id });
        lines.push(`= ${boxHtml(box)}${why(ctx.t(reason))}`);
      });
      ctx.readout('chain', { html: lines.map((l) => `<div>${l}</div>`).join('') });
      // Termwert
      const rv = values[root.id];
      const valueText = rv?.ok ? html(rv.value) : ctx.t('undefinedValue');
      ctx.readout('value', { html: term.vars.length ? tr('valueFor', { vars: substText(), value: valueText }) : valueText });
      // Wertetabelle bei genau einer Variablen
      if (term.vars.length === 1) {
        const v = term.vars[0]!;
        const center = Math.round(p[v]);
        const from = Math.max(-10, Math.min(6, center - 2));
        const xs = Array.from({ length: 5 }, (_, i) => from + i);
        const cells = xs.map((xv) => {
          const r = evaluateAll(term!, { [v]: fromNumber(xv) })[root.id];
          const cur = xv === p[v];
          const val = r?.ok ? html(r.value) : '–';
          return [cur ? `<strong>${numText(fromNumber(xv))}</strong>` : numText(fromNumber(xv)), cur ? `<strong>${val}</strong>` : val];
        });
        ctx.readout('table', {
          html: `<table class="mini-table"><tr><th><var>${v}</var></th>${cells.map((c) => `<td>${c[0]}</td>`).join('')}</tr><tr><th>T</th>${cells.map((c) => `<td>${c[1]}</td>`).join('')}</tr></table>`,
        });
      } else ctx.readout('table', term.vars.length ? ctx.t('tableNone') : null);
    }

    function html(v: Q): string {
      const s = show(v, term?.decimal ?? false, lang);
      const body = s.kind === 'frac' ? `<span class="frac"><span>${s.num}</span><span>${s.den}</span></span>` : s.text;
      return s.neg ? `−${body}` : body;
    }

    function errorMessage(e: ParseError): string {
      return tr(`e_${e.code}`, { a: e.a ?? '', b: e.b ?? '' });
    }

    /* ---------- Aktionen ---------- */
    function syncActions(): void {
      const canStep = !!term && !finished();
      ctx.setAction('step', { enabled: canStep });
      ctx.setAction('all', { enabled: canStep || auto, label: ctx.t(auto ? 'pause' : 'all') });
      ctx.setAction('clear', { enabled: done.length > 0 });
    }

    function finishAnim(): void {
      anim = null;
    }

    function evaluate(node: InnerNode, explain = true): void {
      if (!term) return;
      finishAnim();
      const expected = conventionalNext(term, doneSet(), depths);
      const remaining = term.nodes.filter((n): n is InnerNode => isInner(n) && !done.includes(n.id) && n.id !== node.id);
      const reason: Reason = reasonFor(node, remaining, depths[node.id] ?? 0);
      done = [...done, node.id];
      anim = { id: node.id, start: performance.now() };
      pulseUntil = performance.now() + PULSE_MS;
      const v = values[node.id];
      const color = classColor(opClass(node));
      if (!v?.ok) {
        auto = false;
        status = { text: tr('fail', { calc: calcText(node), msg: ctx.t(v ? v.error : 'divZero') }), tone: 'error' };
      } else if (explain && expected && expected.id !== node.id) {
        status = { text: tr('other', { calc: calcText(node), next: termText({ ...expected, brackets: [] }, lang, term.decimal) }), tone: 'warn', color };
      } else if (!remaining.length) {
        const kind = kindOf(term.root) as Exclude<Kind, 'number' | 'variable'>;
        status = { text: `${tr('step', { k: done.length, reason: ctx.t(reason), calc: calcText(node) })} · ${tr('done', { kind: ctx.t(`art_${kind}`), verb: ctx.t(`verb_${kind}`) })}`, tone: 'ok', color };
      } else {
        status = { text: tr('step', { k: done.length, reason: ctx.t(reason), calc: calcText(node) }), tone: 'info', color };
      }
      updateReadouts();
      syncActions();
      ctx.requestRender();
    }

    function stepNext(): void {
      if (!term || finished()) return;
      const next = conventionalNext(term, doneSet(), depths);
      if (next) evaluate(next, false);
    }

    function resetEvaluation(): void {
      done = [];
      anim = null;
      auto = false;
      shake = null;
      pulseUntil = performance.now() + PULSE_MS;
      status = null;
    }

    /* ---------- Baum-Geometrie ---------- */
    const narrow = () => surface.width < 560;

    interface Regions {
      header: Rect;
      tree: Rect;
      footer: Rect;
    }

    function regions(): Regions {
      const w = surface.width;
      const h = surface.height;
      const pad = narrow() ? 10 : 16;
      const headerH = narrow() ? 74 : 104;
      const footerH = narrow() ? 40 : 46;
      return {
        header: { x: pad, y: pad, w: w - pad * 2, h: headerH },
        tree: { x: pad, y: pad + headerH + 8, w: w - pad * 2, h: h - headerH - footerH - pad * 2 - 16 },
        footer: { x: pad, y: h - pad - footerH, w: w - pad * 2, h: footerH },
      };
    }

    /** Maße und Schrift für die Knoten (abhängig vom Platz). */
    function metrics(scale: number) {
      const small = narrow();
      const leafFont = Math.max(11, (small ? 15 : 19) * scale);
      return {
        leafFont,
        opR: Math.max(11, (small ? 15 : 20) * scale),
        chipH: leafFont * 1.75,
        pillFont: Math.max(11, (small ? 13 : 15.5) * Math.min(1.25, scale)),
      };
    }

    function leafLabelWidth(node: TermNode, font: number): { w: number; h: number } {
      const g = surface.g;
      const theme = ctx.theme;
      if (node.kind === 'num' && node.frac) {
        g.font = `700 ${font * 0.85}px ${theme.font}`;
        const w = Math.max(g.measureText(node.frac.num).width, g.measureText(node.frac.den).width) + (node.negative ? font * 0.7 : 0);
        return { w: w + font * 1.0, h: font * 2.5 };
      }
      if (node.kind === 'var') {
        g.font = `italic ${font * 1.15}px ${theme.mathFont}`;
        return { w: Math.max(g.measureText(node.name).width + font * 1.1, font * 1.9), h: font * 1.75 };
      }
      g.font = `700 ${font}px ${theme.font}`;
      const label = termText({ ...node, brackets: [] }, lang);
      return { w: Math.max(g.measureText(label).width + font * 1.1, font * 1.9), h: font * 1.75 };
    }

    function computeGeometry(): void {
      const term = shownTerm();
      if (!term) {
        geo = [];
        return;
      }
      const key = `${surface.width}x${surface.height}|${term.nodes.length}|${termText(term.root, lang)}|${p.top}|${lang}|${p.names}`;
      if (key === geoKey) return;
      geoKey = key;
      const { tree } = regions();
      const leaves = leavesOf(term.root);
      const gapX = narrow() ? 10 : 18;
      const rows = term.height + 1;
      // Maßstab so wählen, dass der Baum die Fläche gut füllt – in der Breite und in der Höhe
      const maxScale = narrow() ? 1.2 : 1.45;
      const widthAt = (s: number) => {
        const m = metrics(s);
        const minSlot = m.opR * 2.7;
        return leaves.reduce((sum, l) => sum + Math.max(minSlot, leafLabelWidth(l, m.leafFont).w + gapX), 0);
      };
      const heightAt = (s: number) => {
        const m = metrics(s);
        const row = m.opR * 2 + m.pillFont * 1.7 + 12;
        return (rows - 1) * row + m.chipH / 2 + m.opR + m.pillFont * 2.2;
      };
      let scale = maxScale;
      for (let iter = 0; iter < 4; iter++) {
        const fx = (tree.w * 0.94) / widthAt(scale);
        const fy = tree.h / heightAt(scale);
        const f = Math.min(fx, fy);
        if (f >= 1) break;
        scale = Math.max(0.55, scale * f);
      }
      const m = metrics(scale);
      const minSlot = m.opR * 2.7;
      const sizes = leaves.map((l) => leafLabelWidth(l, m.leafFont));
      const slots = sizes.map((z) => Math.max(minSlot, z.w + gapX));
      // Übrige Breite gleichmäßig verteilen (höchstens 1,6-fach), damit der Baum nicht gedrängt wirkt
      const spare = tree.w * 0.94 - slots.reduce((s2, z) => s2 + z, 0);
      const extra = spare > 0 ? Math.min(spare / slots.length, minSlot * 0.6) : 0;
      const wide = slots.map((z) => z + extra);
      const total = wide.reduce((s2, z) => s2 + z, 0);
      let cx = tree.x + (tree.w - total) / 2;
      const xs = new Map<number, number>();
      leaves.forEach((l, i) => {
        xs.set(l.id, cx + wide[i]! / 2);
        cx += wide[i]!;
      });
      const maxChip = Math.max(...sizes.map((z) => z.h), m.chipH);
      const reserveTop = maxChip / 2 + 4;
      const reserveBottom = m.opR + m.pillFont * 2.1 + 6;
      const usable = tree.h - reserveTop - reserveBottom;
      const rowH = rows > 1 ? Math.min((narrow() ? 92 : 124) * Math.max(0.85, Math.min(1, scale)), usable / (rows - 1)) : 0;
      const used = rowH * (rows - 1) + reserveTop + reserveBottom;
      const top = tree.y + (tree.h - used) / 2 + reserveTop;
      const heightOf = new Map<number, number>();
      const visit = (node: TermNode): number => {
        const kids = children(node);
        const h = kids.length ? 1 + Math.max(...kids.map(visit)) : 0;
        heightOf.set(node.id, h);
        if (kids.length) xs.set(node.id, kids.reduce((s, k) => s + xs.get(k.id)!, 0) / kids.length);
        return h;
      };
      visit(term.root);
      const totalH = rowH * (rows - 1);
      geo = term.nodes.map((node) => {
        const level = heightOf.get(node.id)!;
        const yDown = top + level * rowH;
        const y = p.top ? top + totalH - level * rowH + (reserveBottom - reserveTop) : yDown;
        const leafIndex = leaves.indexOf(node);
        const size = leafIndex >= 0 ? sizes[leafIndex]! : { w: m.opR * 2, h: m.opR * 2 };
        return { node, x: xs.get(node.id)!, y, hw: size.w / 2, hh: size.h / 2 };
      });
      metricsNow = m;
    }
    let metricsNow = metrics(1);

    /* ---------- Antippen ---------- */
    function nodeAt(px: number, py: number): number | null {
      let best: number | null = null;
      let bestD = Infinity;
      for (const gn of geo) {
        const inner = isInner(gn.node);
        const pad = 8;
        const dx = Math.abs(px - gn.x);
        const dy = Math.abs(py - gn.y);
        const hit = inner ? Math.hypot(dx, dy) <= gn.hw + pad : dx <= gn.hw + pad && dy <= gn.hh + pad;
        if (hit && dx + dy < bestD) {
          best = gn.node.id;
          bestD = dx + dy;
        }
      }
      return best;
    }

    new TapTarget(surface, {
      hit: (px, py) => {
        const id = term ? nodeAt(px, py) : null;
        return id === null ? null : String(id);
      },
      onHover: (id) => {
        hovered = id === null ? null : Number(id);
      },
      onTap: (id) => {
        if (!term) return;
        const node = term.nodes[Number(id)]!;
        tapFocus = { id: node.id, until: performance.now() + 1800 };
        if (!isInner(node)) {
          status =
            node.kind === 'var'
              ? { text: tr('leafVar', { v: node.name, value: numText(fromNumber(p[node.name])) }), tone: 'info', color: classColor('var') }
              : { text: tr('leaf', { leaf: termText({ ...node, brackets: [] }, lang) }), tone: 'info' };
          return;
        }
        if (done.includes(node.id)) {
          const i = done.indexOf(node.id);
          const remaining = term.nodes.filter((n): n is InnerNode => isInner(n) && !done.slice(0, i + 1).includes(n.id));
          status = { text: tr('step', { k: i + 1, reason: ctx.t(reasonFor(node, remaining, depths[node.id] ?? 0)), calc: calcText(node) }), tone: 'info', color: classColor(opClass(node)) };
          return;
        }
        if (finished()) return;
        const missing = children(node).find((c) => isInner(c) && !done.includes(c.id));
        if (missing) {
          shake = { id: node.id, start: performance.now() };
          status = { text: tr('notReady', { child: termText({ ...missing, brackets: [] }, lang, term.decimal) }), tone: 'warn' };
          return;
        }
        auto = false;
        evaluate(node);
      },
    });

    /* ---------- Zeichnen ---------- */
    function pill(x: number, y: number, label: string, color: string, size: number, scale = 1, alpha = 1, strong = false): Rect {
      const g = surface.g;
      const theme = ctx.theme;
      const fs = size * scale;
      g.font = `700 ${fs}px ${theme.font}`;
      const w = g.measureText(label).width + fs * 0.95;
      const h = fs * 1.55;
      g.save();
      g.globalAlpha = alpha;
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 6 * scale;
      g.shadowOffsetY = 1.5 * scale;
      g.fillStyle = theme.dark ? '#18202c' : '#ffffff';
      roundRect(g, x - w / 2, y - h / 2, w, h, h / 2);
      g.fill();
      g.shadowColor = 'transparent';
      g.fillStyle = withAlpha(color, strong ? (theme.dark ? 0.32 : 0.2) : theme.dark ? 0.2 : 0.11);
      g.fill();
      g.strokeStyle = withAlpha(color, 0.75);
      g.lineWidth = strong ? 2 : 1.4;
      g.stroke();
      text(g, label, x, y + 0.5, { font: `700 ${fs}px ${theme.font}`, color: theme.dark ? '#f3f6fa' : color });
      g.restore();
      return { x: x - w / 2, y: y - h / 2, w, h };
    }

    /** Wert als Pille; Brüche gestapelt. */
    function valuePill(x: number, y: number, v: Q, color: string, size: number, scale = 1, alpha = 1, strong = false): void {
      const s = show(v, term?.decimal ?? false, lang);
      if (s.kind !== 'frac') {
        pill(x, y, s.neg ? `−${s.text}` : s.text, color, size, scale, alpha, strong);
        return;
      }
      const g = surface.g;
      const theme = ctx.theme;
      const fs = size * scale * 0.86;
      g.font = `700 ${fs}px ${theme.font}`;
      const fw = Math.max(g.measureText(s.num).width, g.measureText(s.den).width);
      const minus = s.neg ? fs * 0.7 : 0;
      const w = fw + minus + fs * 1.1;
      const h = fs * 2.55;
      g.save();
      g.globalAlpha = alpha;
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 6 * scale;
      g.shadowOffsetY = 1.5 * scale;
      g.fillStyle = theme.dark ? '#18202c' : '#ffffff';
      roundRect(g, x - w / 2, y - h / 2, w, h, Math.min(12, h / 3));
      g.fill();
      g.shadowColor = 'transparent';
      g.fillStyle = withAlpha(color, strong ? (theme.dark ? 0.32 : 0.2) : theme.dark ? 0.2 : 0.11);
      g.fill();
      g.strokeStyle = withAlpha(color, 0.75);
      g.lineWidth = strong ? 2 : 1.4;
      g.stroke();
      const ink = theme.dark ? '#f3f6fa' : color;
      const fx = x + minus / 2;
      if (s.neg) text(g, '−', x - w / 2 + fs * 0.55 + minus / 2 - fs * 0.15, y, { font: `700 ${fs}px ${theme.font}`, color: ink });
      text(g, s.num, fx, y - fs * 0.6, { font: `700 ${fs}px ${theme.font}`, color: ink });
      text(g, s.den, fx, y + fs * 0.66, { font: `700 ${fs}px ${theme.font}`, color: ink });
      g.fillStyle = ink;
      g.fillRect(fx - fw / 2 - 1, y - 0.75, fw + 2, 1.5);
      g.restore();
    }

    function pillHeight(v: Q | null, size: number): number {
      if (!v) return size * 1.55;
      return show(v, term?.decimal ?? false, lang).kind === 'frac' ? size * 0.86 * 2.55 : size * 1.55;
    }

    /** Punkt auf der (gebogenen) Kante von a nach b. */
    function edgePoint(a: { x: number; y: number }, b: { x: number; y: number }, t: number): [number, number] {
      const my = (a.y + b.y) / 2;
      const u = 1 - t;
      const x = u * u * u * a.x + 3 * u * u * t * a.x + 3 * u * t * t * b.x + t * t * t * b.x;
      const y = u * u * u * a.y + 3 * u * u * t * my + 3 * u * t * t * my + t * t * t * b.y;
      return [x, y];
    }

    function drawHeader(r: Rect, highlight: ReadonlySet<number> | null): void {
      const g = surface.g;
      const theme = ctx.theme;
      const small = narrow();
      if (!term && error) {
        // Eingabe mit markierter Fehlerstelle
        const src = String(p.term);
        const size = small ? 19 : 26;
        g.font = `600 ${size}px ${theme.font}`;
        const shown = src.length ? src : ' ';
        const w = Math.min(r.w, g.measureText(shown).width);
        const fs = g.measureText(shown).width > r.w ? (size * r.w) / g.measureText(shown).width : size;
        g.font = `600 ${fs}px ${theme.font}`;
        const x0 = r.x + (r.w - w) / 2;
        const base = r.y + r.h * 0.42;
        text(g, shown, x0, base, { font: `600 ${fs}px ${theme.font}`, color: theme.text, align: 'left', baseline: 'alphabetic' });
        const before = g.measureText(src.slice(0, error.pos)).width;
        const ch = src.slice(error.pos, error.pos + 1) || ' ';
        const cw = Math.max(fs * 0.5, g.measureText(ch).width);
        const red = ctx.theme.series[1]!;
        g.fillStyle = withAlpha(red, 0.16);
        roundRect(g, x0 + before - 2, base - fs * 0.85, cw + 4, fs * 1.2, 4);
        g.fill();
        g.strokeStyle = red;
        g.lineWidth = 2.5;
        g.lineCap = 'round';
        g.beginPath();
        for (let i = 0; i <= 8; i++) {
          const x = x0 + before - 1 + ((cw + 2) * i) / 8;
          const y = base + fs * 0.3 + (i % 2 ? 2.5 : -0.5);
          if (i === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.stroke();
        return;
      }
      if (!term) return;
      const o = { lang, decimal: term.decimal } as const;
      const rects: { node: number; r: Rect }[] = [];
      const size1 = small ? 23 : 32;
      const box1 = typeset(term.root, o);
      const fit1 = fitBox(box1, size1, r.w - 8, highlight, rects);
      const base1 = r.y + (small ? 28 : 40);
      const x1 = r.x + (r.w - fit1.laid.w) / 2;
      // Hervorhebung des Teilterms unter dem Zeiger
      if (highlightId !== null && highlight) {
        fit1.laid.paint(-10000, -10000);
        const own = rects.filter((q) => highlight.has(q.node));
        rects.length = 0;
        if (own.length) {
          const minX = Math.min(...own.map((q) => q.r.x)) + 10000 + x1;
          const maxX = Math.max(...own.map((q) => q.r.x + q.r.w)) + 10000 + x1;
          const minY = Math.min(...own.map((q) => q.r.y)) + 10000 + base1;
          const maxY = Math.max(...own.map((q) => q.r.y + q.r.h)) + 10000 + base1;
          const node = term.nodes[highlightId]!;
          g.fillStyle = withAlpha(colorOf(node), theme.dark ? 0.2 : 0.12);
          roundRect(g, minX - 4, minY - 3, maxX - minX + 8, maxY - minY + 6, 8);
          g.fill();
          g.strokeStyle = withAlpha(colorOf(node), 0.55);
          g.lineWidth = 1.5;
          g.stroke();
        }
      }
      fit1.laid.paint(x1, base1);
      // Zweite Zeile: aktueller Stand der Rechnung
      const s = subst();
      const size2 = small ? 16 : 21;
      const base2 = base1 + fit1.laid.desc + (small ? 26 : 36);
      const failed = failedNode();
      if (done.length || term.vars.length) {
        const lastOk = failed === null ? done.length : done.indexOf(failed);
        const box2 = typeset(term.root, { ...o, subst: s, values: valueMap(lastOk), fresh: failed === null ? done[done.length - 1] : undefined });
        const prefix = '= ';
        g.font = `600 ${size2}px ${theme.font}`;
        const pw = g.measureText(prefix).width;
        const fit2 = fitBox(box2, size2, r.w - pw - 8, null, []);
        const x2 = r.x + (r.w - fit2.laid.w - pw) / 2;
        text(g, prefix, x2, base2, { font: `600 ${fit2.size}px ${theme.font}`, color: theme.muted, align: 'left', baseline: 'alphabetic' });
        fit2.laid.paint(x2 + pw, base2);
      } else {
        // Platzhalter: Hier erscheint der Rechenweg
        text(g, '= ?', r.x + r.w / 2, base2 - size2 * 0.3, { font: `600 ${size2}px ${theme.font}`, color: withAlpha(theme.muted, 0.55) });
      }
    }

    function drawTree(highlight: ReadonlySet<number> | null, now: number): void {
      if (!term) return;
      const g = surface.g;
      const theme = ctx.theme;
      const m = metricsNow;
      const dir = p.top ? -1 : 1;
      const ds = doneSet();
      const ready = new Set(readyNodes(term, ds).map((n) => n.id));
      const failed = failedNode();
      const byId = new Map(geo.map((gn) => [gn.node.id, gn]));
      const appearT = appear.value;
      const stepOrder = new Map(order.map((id, i) => [id, i + 1]));
      const doneOrder = new Map(done.map((id, i) => [id, i + 1]));
      const animT = anim ? Math.min(1, (now - anim.start) / (reduced ? 1 : STEP_MS)) : 1;
      const leafXs = geo.filter((gn) => !isInner(gn.node)).map((gn) => gn.x);
      const slotW = leafXs.length > 1 ? (Math.max(...leafXs) - Math.min(...leafXs)) / (leafXs.length - 1) : 200;
      const fade = (id: number) => (highlight && !highlight.has(id) ? 0.3 : 1) * dimAll;
      const levelAppear = (gn: NodeGeo) => {
        if (appearT >= 1) return 1;
        const level = Math.abs(gn.y - geo[term!.root.id]!.y);
        const total = Math.max(1, Math.abs(geo[term!.root.id]!.y - Math.min(...geo.map((q) => (p.top ? -q.y : q.y))) * (p.top ? -1 : 1)));
        const delay = 0.55 * (1 - level / Math.max(total, 1));
        return ease.outBack(Math.max(0, Math.min(1, (appearT - delay * 0.6) / 0.5)));
      };
      const anchorOut = (gn: NodeGeo) => {
        // Austrittspunkt eines Werts: unter der Zahlkarte bzw. an der Wert-Pille
        if (!isInner(gn.node)) return { x: gn.x, y: gn.y + dir * gn.hh };
        return { x: gn.x, y: gn.y + dir * (gn.hw + 4 + pillHeight(values[gn.node.id]?.ok ? (values[gn.node.id] as { value: Q }).value : null, m.pillFont) / 2) };
      };

      // Kanten
      g.lineCap = 'round';
      for (const gn of geo) {
        if (!isInner(gn.node)) continue;
        for (const c of children(gn.node)) {
          const cg = byId.get(c.id)!;
          const a = isInner(c) ? { x: cg.x, y: cg.y + dir * cg.hw } : { x: cg.x, y: cg.y + dir * cg.hh };
          const b = { x: gn.x, y: gn.y - dir * gn.hw };
          const flowing = anim && anim.id === gn.node.id;
          const passed = ds.has(gn.node.id) && !flowing;
          const color = colorOf(gn.node);
          g.globalAlpha = Math.min(fade(gn.node.id), levelAppear(gn)) * (passed ? 0.9 : 0.55);
          g.strokeStyle = passed ? color : theme.dark ? '#4a5566' : '#b8c1ce';
          g.lineWidth = passed ? 2.6 : 2;
          g.beginPath();
          const my = (a.y + b.y) / 2;
          g.moveTo(a.x, a.y);
          g.bezierCurveTo(a.x, my, b.x, my, b.x, b.y);
          g.stroke();
          if (flowing) {
            // Kante füllt sich mit Farbe, während der Wert wandert
            const t = Math.min(1, animT / 0.55);
            g.globalAlpha = 0.9;
            g.strokeStyle = color;
            g.lineWidth = 2.6;
            g.beginPath();
            g.moveTo(a.x, a.y);
            for (let i = 1; i <= 16; i++) {
              const [x, y] = edgePoint(a, b, (t * i) / 16);
              g.lineTo(x, y);
            }
            g.stroke();
          }
          g.globalAlpha = 1;
        }
      }

      // Knoten
      for (const gn of geo) {
        const node = gn.node;
        const k = levelAppear(gn);
        if (k <= 0.01) continue;
        const alpha = fade(node.id);
        g.save();
        g.globalAlpha = alpha;
        let sx = 0;
        if (shake && shake.id === node.id) {
          const st = (now - shake.start) / 450;
          if (st < 1) sx = Math.sin(st * Math.PI * 6) * 6 * (1 - st);
        }
        g.translate(gn.x + sx, gn.y);
        g.scale(k, k);
        if (!isInner(node)) {
          // Zahlkarte
          const isVar = node.kind === 'var';
          const color = isVar ? classColor('var') : theme.text;
          g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.13)';
          g.shadowBlur = 8;
          g.shadowOffsetY = 2;
          g.fillStyle = theme.dark ? '#1b2431' : '#ffffff';
          roundRect(g, -gn.hw, -gn.hh, gn.hw * 2, gn.hh * 2, Math.min(10, gn.hh));
          g.fill();
          g.shadowColor = 'transparent';
          if (isVar) {
            g.fillStyle = withAlpha(color, theme.dark ? 0.16 : 0.08);
            g.fill();
          }
          g.strokeStyle = hovered === node.id ? withAlpha(isVar ? color : theme.series[0]!, 0.9) : isVar ? withAlpha(color, 0.6) : theme.dark ? '#3a4454' : '#cfd6e0';
          g.lineWidth = hovered === node.id ? 2.2 : 1.3;
          g.stroke();
          const f = m.leafFont;
          if (node.kind === 'num' && node.frac) {
            const fs = f * 0.85;
            const ox = node.negative ? f * 0.3 : 0;
            if (node.negative) text(g, '−', -gn.hw + f * 0.55, 0, { font: `700 ${fs}px ${theme.font}`, color });
            text(g, node.frac.num, ox, -fs * 0.62, { font: `700 ${fs}px ${theme.font}`, color });
            text(g, node.frac.den, ox, fs * 0.68, { font: `700 ${fs}px ${theme.font}`, color });
            g.font = `700 ${fs}px ${theme.font}`;
            const fw = Math.max(g.measureText(node.frac.num).width, g.measureText(node.frac.den).width);
            g.fillStyle = color;
            g.fillRect(ox - fw / 2 - 1, -0.8, fw + 2, 1.6);
          } else if (isVar) {
            text(g, node.name, 0, -1, { font: `italic ${f * 1.15}px ${theme.mathFont}`, color });
          } else {
            text(g, termText({ ...node, brackets: [] }, lang), 0, 0.5, { font: `700 ${f}px ${theme.font}`, color });
          }
        } else {
          // Rechnung: Kreis mit Rechenzeichen
          const color = colorOf(node);
          const isDone = ds.has(node.id) && !(anim && anim.id === node.id && animT < 0.55);
          const isFailed = failed === node.id && isDone;
          const r = gn.hw;
          const pulsing = ready.has(node.id) && !finished();
          if (pulsing) {
            const ph = reduced || now > pulseUntil ? 0.5 : 0.5 + 0.5 * Math.sin(now / 260);
            g.beginPath();
            g.arc(0, 0, r + 4 + ph * 4, 0, Math.PI * 2);
            g.fillStyle = withAlpha(color, 0.1 + ph * 0.12);
            g.fill();
          }
          if (anim && anim.id === node.id && animT >= 0.5 && animT < 0.9) {
            const t = (animT - 0.5) / 0.4;
            g.beginPath();
            g.arc(0, 0, r + 6 + t * 16, 0, Math.PI * 2);
            g.strokeStyle = withAlpha(color, 0.6 * (1 - t));
            g.lineWidth = 3;
            g.stroke();
          }
          g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.16)';
          g.shadowBlur = 8;
          g.shadowOffsetY = 2;
          g.beginPath();
          g.arc(0, 0, r, 0, Math.PI * 2);
          const fill = isFailed ? theme.series[1]! : color;
          if (isDone) {
            const grad = g.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
            grad.addColorStop(0, withAlpha(fill, 0.78));
            grad.addColorStop(1, fill);
            g.fillStyle = grad;
          } else g.fillStyle = theme.dark ? '#1b2431' : '#ffffff';
          g.fill();
          g.shadowColor = 'transparent';
          g.strokeStyle = isFailed ? theme.series[1]! : color;
          g.lineWidth = hovered === node.id ? 3 : 2.2;
          g.stroke();
          const ink = isDone ? '#ffffff' : color;
          if (node.kind === 'op' && node.op === '^') {
            // Symbol für Potenz: Basis mit kleiner Hochzahl
            g.strokeStyle = ink;
            g.lineWidth = 1.8;
            const b = r * 0.36;
            g.strokeRect(-b * 1.05, -b * 0.55, b * 1.25, b * 1.25);
            g.strokeRect(b * 0.38, -b * 1.25, b * 0.72, b * 0.72);
          } else if (opSymbol(node) === '·') {
            g.beginPath();
            g.arc(0, 0, Math.max(2.2, r * 0.13), 0, Math.PI * 2);
            g.fillStyle = ink;
            g.fill();
          } else {
            text(g, opSymbol(node), 0, r * 0.02, { font: `700 ${r * 1.1}px ${theme.font}`, color: ink });
          }
        }
        g.restore();
      }

      // Termarten und Nummern
      for (const gn of geo) {
        const node = gn.node;
        if (!isInner(node)) continue;
        const alpha = fade(node.id) * levelAppear(gn);
        const color = colorOf(node);
        const raw = KIND_NAMES[kindOf(node)][lang];
        const name = raw.charAt(0).toUpperCase() + raw.slice(1);
        const fs = Math.max(11, m.pillFont * 0.78);
        surface.g.font = `700 ${fs}px ${theme.font}`;
        const fits = surface.g.measureText(name).width + gn.hw + 8 <= slotW * 1.35;
        if (p.names && alpha > 0.05 && fits) {
          g.globalAlpha = alpha;
          const isRoot = node.id === term.root.id;
          // Rechts neben dem Knoten: Dort verlaufen keine Kanten (am rechten Rand links davon)
          const ny = gn.y;
          surface.g.font = `${isRoot ? 800 : 700} ${fs}px ${theme.font}`;
          const right = gn.x + gn.hw + 7 + surface.g.measureText(name).width <= surface.width - 6;
          const nx = right ? gn.x + gn.hw + 7 : gn.x - gn.hw - 7 - surface.g.measureText(name).width;
          surface.g.font = `${isRoot ? 800 : 700} ${fs}px ${theme.font}`;
          const tw = surface.g.measureText(name).width;
          g.lineWidth = 4;
          g.lineJoin = 'round';
          g.strokeStyle = theme.bg;
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          g.strokeText(name, nx, ny);
          g.fillStyle = color;
          g.fillText(name, nx, ny);
          if (isRoot && finished()) {
            g.strokeStyle = color;
            g.lineWidth = 1.5;
            g.beginPath();
            const ux = nx;
            g.moveTo(ux, ny + fs * 0.62);
            g.lineTo(ux + tw, ny + fs * 0.62);
            g.stroke();
          }
          g.globalAlpha = 1;
        }
        const num = doneOrder.get(node.id) ?? (p.order ? stepOrder.get(node.id) : undefined);
        if (num !== undefined && alpha > 0.05) {
          const bx = gn.x - gn.hw * 0.85 - 6;
          const by = gn.y - dir * gn.hw * 0.75;
          const br = Math.max(8, m.pillFont * 0.62);
          const isDone = doneOrder.has(node.id);
          g.globalAlpha = alpha;
          g.beginPath();
          g.arc(bx, by, br, 0, Math.PI * 2);
          g.fillStyle = isDone ? theme.text : theme.bg;
          g.fill();
          g.strokeStyle = isDone ? theme.text : theme.muted;
          g.lineWidth = 1.3;
          g.stroke();
          text(g, String(num), bx, by + 0.5, { font: `800 ${br * 1.15}px ${theme.font}`, color: isDone ? theme.bg : theme.muted });
          g.globalAlpha = 1;
        }
      }

      // Werte (Pillen) unter den Rechnungen bzw. Variablen
      for (const gn of geo) {
        const node = gn.node;
        const alpha = fade(node.id) * Math.min(1, levelAppear(gn));
        if (alpha < 0.05) continue;
        if (node.kind === 'var') {
          const v = values[node.id];
          if (v?.ok) {
            const ph = pillHeight(v.value, m.pillFont * 0.88);
            valuePill(gn.x, gn.y + dir * (gn.hh + ph / 2 + 3), v.value, classColor('var'), m.pillFont * 0.88, 1, alpha);
          }
          continue;
        }
        if (!isInner(node) || !ds.has(node.id)) continue;
        const v = values[node.id];
        let scale = 1;
        if (anim && anim.id === node.id) {
          if (animT < 0.55) continue;
          scale = reduced ? 1 : ease.outBack(Math.min(1, (animT - 0.55) / 0.45));
        }
        const isRoot = node.id === term.root.id;
        if (v?.ok) {
          const ph = pillHeight(v.value, m.pillFont);
          valuePill(gn.x, gn.y + dir * (gn.hw + 4 + ph / 2), v.value, colorOf(node), m.pillFont * (isRoot ? 1.12 : 1), Math.max(0.01, scale), alpha, isRoot);
        } else if (v && v.error !== 'blocked') {
          pill(gn.x, gn.y + dir * (gn.hw + 4 + m.pillFont * 0.8), lang === 'de' ? 'nicht definiert' : 'undefined', theme.series[1]!, m.pillFont * 0.85, Math.max(0.01, scale), alpha, true);
        }
      }

      // Wandernde Werte
      if (anim && animT < 0.6) {
        const node = term.nodes[anim.id]!;
        const gn = byId.get(node.id)!;
        const t = ease.inOutCubic(Math.min(1, animT / 0.55));
        for (const c of children(node)) {
          const cg = byId.get(c.id)!;
          const v = values[c.id];
          if (!v?.ok) continue;
          const a = anchorOut(cg);
          const b = { x: gn.x, y: gn.y };
          const [x, y] = edgePoint(a, b, t);
          valuePill(x, y, v.value, colorOf(c.kind === 'num' ? node : c), m.pillFont, 1 - 0.25 * t, animT > 0.5 ? (0.6 - animT) * 10 : 1, false);
        }
      }
    }

    function drawFooter(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const small = narrow();
      let msg = status;
      if (!msg && term) {
        msg = term.vars.length ? { text: tr('hintVars', { vars: substText() }), tone: 'info' } : { text: ctx.t('hint'), tone: 'info' };
        if (!isInner(term.root)) msg = { text: ctx.t('doneNumber'), tone: 'info' };
      }
      if (!term && error) msg = { text: errorMessage(error), tone: 'error' };
      if (!msg) return;
      const color = msg.tone === 'error' ? theme.series[1]! : msg.tone === 'warn' ? theme.series[3]! : msg.tone === 'ok' ? (msg.color ?? theme.series[2]!) : (msg.color ?? theme.muted);
      let fs = small ? 12 : 14;
      g.font = `600 ${fs}px ${theme.font}`;
      // Zeilenumbruch auf höchstens zwei Zeilen
      const maxW = r.w - 36;
      const words = msg.text.split(' ');
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
      if (lines.length > 2) {
        fs *= 0.9;
        g.font = `600 ${fs}px ${theme.font}`;
      }
      const shown = lines.slice(0, 3);
      const lh = fs * 1.3;
      const w = Math.min(r.w, Math.max(...shown.map((l) => g.measureText(l).width)) + 36);
      const h = Math.max(r.h - 6, shown.length * lh + 12);
      const x = r.x + (r.w - w) / 2;
      const y = r.y + r.h - h;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.1)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      g.fillStyle = theme.dark ? '#18202c' : '#ffffff';
      roundRect(g, x, y, w, h, 12);
      g.fill();
      g.shadowColor = 'transparent';
      g.fillStyle = withAlpha(color, theme.dark ? 0.16 : 0.08);
      g.fill();
      g.strokeStyle = withAlpha(color, 0.5);
      g.lineWidth = 1.2;
      g.stroke();
      g.fillStyle = color;
      roundRect(g, x + 8, y + 8, 4, h - 16, 2);
      g.fill();
      g.restore();
      shown.forEach((l, i) => text(g, l, x + 20, y + h / 2 + (i - (shown.length - 1) / 2) * lh, { font: `600 ${fs}px ${theme.font}`, color: theme.text, align: 'left' }));
    }

    /* ---------- Aktualisieren ---------- */

    function reparse(): void {
      const r = parseTerm(String(p.term));
      if (r.ok) {
        term = r.term;
        error = null;
        lastValid = term;
        order = evaluationOrder(term).map((s) => s.id);
        depths = bracketDepths(term);
        geoKey = '';
        resetEvaluation();
        appear.play();
      } else {
        term = null;
        error = r.error;
        resetEvaluation();
      }
    }

    function recompute(): void {
      if (term) values = evaluateAll(term, subst());
    }

    return {
      update(changed) {
        if (changed.has('term')) reparse();
        recompute();
        if (changed.has('top') || changed.has('names')) geoKey = '';
        // Neue Variablenwerte: Meldung zur letzten Rechnung passt nicht mehr
        if (term && VARIABLES.some((v) => changed.has(v)) && !changed.has('term')) status = null;
        updateReadouts();
        syncActions();
      },

      action(id) {
        if (!term) return;
        if (id === 'step') {
          auto = false;
          stepNext();
        } else if (id === 'all') {
          auto = !auto;
          if (auto) {
            if (!anim) stepNext();
            autoAt = 0;
          }
          syncActions();
        } else if (id === 'clear') {
          resetEvaluation();
          updateReadouts();
          syncActions();
        }
      },

      render() {
        const now = performance.now();
        computeGeometry();
        surface.begin();
        const g = surface.g;
        const theme = ctx.theme;
        const reg = regions();
        // Hintergrund: Kopfzeile als Karte, Baum auf feinem Punktraster
        g.save();
        g.fillStyle = theme.dark ? 'rgba(255,255,255,0.03)' : 'rgba(16,24,40,0.028)';
        roundRect(g, reg.header.x - 4, reg.header.y - 4, reg.header.w + 8, reg.header.h + 4, 14);
        g.fill();
        g.restore();
        const dot = theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(16,24,40,0.07)';
        g.fillStyle = dot;
        const step = 22;
        for (let y = reg.tree.y + 6; y < reg.tree.y + reg.tree.h; y += step) {
          for (let x = reg.tree.x + ((reg.tree.w % step) / 2); x < reg.tree.x + reg.tree.w; x += step) g.fillRect(x, y, 1.5, 1.5);
        }
        const focusId = hovered ?? (tapFocus && now < tapFocus.until ? tapFocus.id : null);
        const highlight = term && focusId !== null && term.nodes[focusId] ? new Set(subtree(term.nodes[focusId]!).map((n) => n.id)) : null;
        highlightId = focusId;
        drawHeader(reg.header, highlight);
        if (term) drawTree(highlight, now);
        else if (lastValid) {
          // Letzten gültigen Baum blass im Hintergrund lassen
          const keep = term;
          term = lastValid;
          values = evaluateAll(term, subst());
          const savedDone = done;
          done = [];
          dimAll = 0.16;
          drawTree(null, now);
          dimAll = 1;
          done = savedDone;
          term = keep;
        }
        drawFooter(reg.footer);

        // Ablauf der Animation
        let busy = appear.running;
        if (anim) {
          const t = (now - anim.start) / (reduced ? 1 : STEP_MS);
          if (t >= 1) {
            anim = null;
            autoAt = now + (reduced ? 600 : AUTO_PAUSE_MS);
          }
          busy = true;
        }
        if (auto && !anim) {
          if (finished()) {
            auto = false;
            syncActions();
          } else if (now >= autoAt) stepNext();
          busy = true;
        }
        if (shake && now - shake.start < 500) busy = true;
        if (tapFocus && now < tapFocus.until + 50) busy = true;
        if (term && !finished() && now < pulseUntil && !reduced) busy = true;
        if (busy) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
