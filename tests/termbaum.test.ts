import { describe, expect, it } from 'vitest';
import {
  add,
  describe as describeTerm,
  evaluateAll,
  evaluationOrder,
  fromNumber,
  kindOf,
  parseTerm,
  q,
  readyNodes,
  show,
  showText,
  termText,
  toNumber,
  typeset,
  boxText,
  type NodeValue,
  type ParsedTerm,
  type Q,
} from '../src/simulations/mathematik/termbaum/model';

function parse(src: string): ParsedTerm {
  const r = parseTerm(src);
  if (!r.ok) throw new Error(`${src}: ${r.error.code}`);
  return r.term;
}

function valueOf(src: string, vars: Record<string, number> = {}): string {
  const term = parse(src);
  const subst = Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, fromNumber(v)]));
  const v: NodeValue = evaluateAll(term, subst)[term.root.id]!;
  return v.ok ? showText(v.value, term.decimal, 'de') : v.error;
}

function errorOf(src: string): string {
  const r = parseTerm(src);
  return r.ok ? 'ok' : r.error.code;
}

describe('Termbaum: rationale Zahlen', () => {
  it('rechnet exakt mit Brüchen', () => {
    expect(add(q(1, 3), q(1, 6))).toEqual(q(1, 2));
    expect(q(6, -4)).toEqual({ n: -3n, d: 2n });
    expect(toNumber(q(3, 4))).toBe(0.75);
    expect(fromNumber(2.5)).toEqual(q(5, 2));
    expect(fromNumber(-3)).toEqual(q(-3));
  });

  it('zeigt Zahlen als ganze Zahl, Dezimalzahl oder Bruch', () => {
    expect(show(q(27), false, 'de')).toEqual({ kind: 'int', neg: false, text: '27' });
    expect(show(q(-5, 2), true, 'de')).toEqual({ kind: 'dec', neg: true, text: '2,5' });
    expect(show(q(1, 8), true, 'en')).toEqual({ kind: 'dec', neg: false, text: '0.125' });
    expect(show(q(1, 3), true, 'de')).toEqual({ kind: 'frac', neg: false, num: '1', den: '3' });
    expect(showText(q(-3, 4), false, 'de')).toBe('−3/4');
  });
});

describe('Termbaum: Parser', () => {
  it('beachtet Punkt vor Strich und Klammern', () => {
    expect(valueOf('3 + 4 · 5')).toBe('23');
    expect(valueOf('(3 + 4) · 5')).toBe('35');
    expect(valueOf('(12 − 4) · 3 + 6 : 2')).toBe('27');
    expect(valueOf('20 - 8 - 2')).toBe('10');
    expect(valueOf('48 : 6 : 2')).toBe('4');
    expect(valueOf('2 * [3 + (4 - 1)]')).toBe('12');
  });

  it('beachtet Potenz vor Punkt und Vorzeichenregeln', () => {
    expect(valueOf('2 · 3^2')).toBe('18');
    expect(valueOf('2^3^2')).toBe('512');
    expect(valueOf('−3²')).toBe('−9');
    expect(valueOf('(−3)²')).toBe('9');
    expect(valueOf('−3 + 5')).toBe('2');
    expect(valueOf('2^(−1)')).toBe('1/2');
    expect(valueOf('10³')).toBe('1000');
  });

  it('kennt Brüche, Dezimalzahlen und Variablen', () => {
    expect(valueOf('1/2 + 1/3')).toBe('5/6');
    expect(valueOf('(3/4)²')).toBe('9/16');
    expect(valueOf('0,5 · 3')).toBe('1,5');
    expect(valueOf('1,2 + 1/3')).toBe('23/15');
    expect(valueOf('3x + 1', { x: 2 })).toBe('7');
    expect(valueOf('2(x + 1)²', { x: -3 })).toBe('8');
    expect(valueOf('ab - b', { a: 2.5, b: 2 })).toBe('3');
    expect(valueOf('x/2 + 1', { x: 3 })).toBe('5/2');
  });

  it('erkennt die Termart an der zuletzt ausgeführten Rechnung', () => {
    expect(kindOf(parse('3 + 4 · 5').root)).toBe('sum');
    expect(kindOf(parse('(3 + 4) · 5').root)).toBe('product');
    expect(kindOf(parse('12 − 4 · 2').root)).toBe('difference');
    expect(kindOf(parse('(a + b) : 2').root)).toBe('quotient');
    expect(kindOf(parse('(a + b)²').root)).toBe('power');
    expect(kindOf(parse('−3²').root)).toBe('negation');
    expect(kindOf(parse('(−3)²').root)).toBe('power');
    expect(kindOf(parse('3/4').root)).toBe('number');
    expect(kindOf(parse('2x').root)).toBe('product');
  });

  it('meldet Eingabefehler mit verständlichem Grund', () => {
    expect(errorOf('')).toBe('empty');
    expect(errorOf('3 +')).toBe('expectOperand');
    expect(errorOf('3 + * 4')).toBe('expectOperand');
    expect(errorOf('· 4')).toBe('startOperator');
    expect(errorOf('5 · −3')).toBe('signAfterOp');
    expect(errorOf('2^−1')).toBe('signInExponent');
    expect(errorOf('(3 + 4')).toBe('unclosed');
    expect(errorOf('3 + 4)')).toBe('unexpectedClose');
    expect(errorOf('[3 + 4)')).toBe('mismatch');
    expect(errorOf('3 4')).toBe('missingOp');
    expect(errorOf('x2')).toBe('missingOp');
    expect(errorOf('2 + q')).toBe('unknownVar');
    expect(errorOf('3 + 4 = 7')).toBe('equals');
    expect(errorOf('3 & 4')).toBe('badChar');
    expect(errorOf('3, + 4')).toBe('decimal');
    expect(errorOf('()')).toBe('emptyParens');
    expect(errorOf('1/0')).toBe('zeroDen');
    expect(errorOf('--3')).toBe('doubleSign');
    expect(errorOf('1+2+3+4+5+6+7+8+9+10+11+12+13+14+15+16+17')).toBe('tooLong');
  });

  it('meldet Rechenfehler am Knoten', () => {
    expect(valueOf('5 : (3 − 3)')).toBe('divZero');
    expect(valueOf('0^0')).toBe('zeroPowZero');
    expect(valueOf('4^(1/2)')).toBe('fracExp');
    expect(valueOf('10^99')).toBe('tooBig');
    expect(valueOf('1^300')).toBe('1');
    expect(valueOf('(1 : 0) + 2')).toBe('blocked');
  });
});

describe('Termbaum: Rechenreihenfolge', () => {
  const order = (src: string) => {
    const term = parse(src);
    return evaluationOrder(term).map((s) => `${termText(term.nodes[s.id]!, 'de')}:${s.reason}`);
  };

  it('rechnet Klammern zuerst, Potenz vor Punkt vor Strich, sonst von links nach rechts', () => {
    expect(order('(12 − 4) · 3 + 6 : 2')).toEqual(['(12 − 4):bracket', '(12 − 4) · 3:point', '6 : 2:point', '(12 − 4) · 3 + 6 : 2:last']);
    expect(order('4 · 5 + 2³')).toEqual(['2³:power', '4 · 5:point', '4 · 5 + 2³:last']);
    expect(order('20 − 8 − 2')).toEqual(['20 − 8:leftToRight', '20 − 8 − 2:last']);
    expect(order('−3²')).toEqual(['3²:power', '−3²:last']);
    expect(order('2 · [3 + (4 − 1)]')).toEqual(['(4 − 1):bracket', '[3 + (4 − 1)]:bracket', '2 · [3 + (4 − 1)]:last']);
  });

  it('weiß, welche Rechnungen schon möglich sind', () => {
    const term = parse('(1 + 2) · (3 + 4)');
    expect(readyNodes(term, new Set()).map((n) => termText(n, 'de'))).toEqual(['(1 + 2)', '(3 + 4)']);
  });
});

describe('Termbaum: Darstellung und Gliederung', () => {
  it('setzt teilweise ausgerechnete Terme richtig (mit Klammern um negative Zahlen)', () => {
    const term = parse('(2 − 5) · 3 + 1');
    const minus = term.root.kind === 'op' && term.root.left.kind === 'op' ? term.root.left.left : null;
    const values = new Map<number, Q>([[minus!.id, q(-3)]]);
    expect(boxText(typeset(term.root, { lang: 'de', decimal: false, values }))).toBe('−3 · 3 + 1');
    const t2 = parse('4 + (2 − 5)²');
    const inner = t2.nodes.find((n) => termText(n, 'de') === '(2 − 5)')!;
    expect(boxText(typeset(t2.root, { lang: 'de', decimal: false, values: new Map([[inner.id, q(-3)]]) }))).toBe('4 + (−3)²');
  });

  it('setzt Variablen ein (mit Malpunkt und Klammern)', () => {
    const term = parse('3x + xy');
    const subst = { x: q(-2), y: q(5) };
    expect(boxText(typeset(term.root, { lang: 'de', decimal: false, subst }))).toBe('3 · (−2) + (−2) · 5');
    expect(termText(term.root, 'de')).toBe('3x + xy');
    expect(termText(parse('0.5*a').root, 'de')).toBe('0,5 · a');
  });

  it('gliedert Terme in Worten', () => {
    expect(describeTerm(parse('(12 + 4) − 3 · 2').root, 'de')).toBe('die Differenz aus der Summe aus 12 und 4 und dem Produkt aus 3 und 2');
    expect(describeTerm(parse('(a + b)²').root, 'de')).toBe('das Quadrat der Summe aus a und b');
    expect(describeTerm(parse('5²').root, 'de')).toBe('das Quadrat von 5');
    expect(describeTerm(parse('(2 · 3) : 4').root, 'de')).toBe('der Quotient aus dem Produkt aus 2 und 3 und 4');
    expect(describeTerm(parse('2³').root, 'de')).toBe('die 3. Potenz von 2');
    expect(describeTerm(parse('(12 + 4) − 3 · 2').root, 'en')).toBe('the difference of the sum of 12 and 4 and the product of 3 and 2');
    expect(describeTerm(parse('((1 + 2) · 3 + 4) · 5').root, 'de', 2)).toBe('das Produkt aus der Summe aus „(1 + 2) · 3“ und 4 und 5');
  });
});
