import { describe, expect, it } from 'vitest';
import {
  compile,
  derivative,
  findExtrema,
  findHoles,
  findIntersections,
  findZeros,
  fitRange,
  paramsIn,
  parseTerm,
  stripPrefix,
  suggestName,
  termText,
  traceFunction,
  type Env,
  type Fn1,
  type ParseError,
} from '../src/simulations/mathematik/funktionsplotter/model';

const ENV: Env = { a: 2, b: -1 };

/** Term lesen und als Funktion von x liefern (Test schlägt bei Fehlern fehl). */
function fn(src: string, env: Env = ENV): Fn1 {
  const r = parseTerm(src);
  if (r.ok !== true) throw new Error(`Term „${src}“ nicht lesbar: ${JSON.stringify(r)}`);
  const c = compile(r.term.node);
  return (x) => c(x, env);
}

function err(src: string): ParseError {
  const r = parseTerm(src);
  if (r.ok !== false) throw new Error(`Term „${src}“ sollte ein Fehler sein`);
  return r.error;
}

const text = (src: string, lang: 'de' | 'en' = 'de') => {
  const r = parseTerm(src);
  if (r.ok !== true) throw new Error(src);
  return termText(r.term.node, lang);
};

describe('Funktionsplotter: Terme lesen', () => {
  it('rechnet Punkt vor Strich, Potenz vor Punkt, Vorzeichen richtig', () => {
    expect(fn('2 + 3 · 4')(0)).toBe(14);
    expect(fn('-x^2')(3)).toBe(-9);
    expect(fn('(-x)^2')(3)).toBe(9);
    expect(fn('2^3^2')(0)).toBe(512);
    expect(fn('x²')(-4)).toBe(16);
    expect(fn('x⁻¹')(4)).toBe(0.25);
    expect(fn('2^-x')(1)).toBe(0.5);
    expect(fn('e^-x²')(0)).toBe(1);
    expect(fn('x − −2')(1)).toBe(3);
    expect(fn('12 : 4 : 3')(0)).toBe(1);
  });

  it('versteht implizites Mal, Dezimalkomma und Konstanten', () => {
    expect(fn('2x')(3)).toBe(6);
    expect(fn('0,5x² − 2')(2)).toBe(0);
    expect(fn('0.5x^2-2')(2)).toBe(0);
    expect(fn('3(x + 1)')(1)).toBe(6);
    expect(fn('(x + 1)(x − 1)')(3)).toBe(8);
    expect(fn('2πx')(1)).toBeCloseTo(2 * Math.PI, 12);
    expect(fn('pi')(0)).toBeCloseTo(Math.PI, 15);
    expect(fn('ex')(2)).toBeCloseTo(2 * Math.E, 12);
    expect(fn('e^x')(1)).toBeCloseTo(Math.E, 15);
    expect(fn('a x² + b')(3)).toBe(17);
    expect(fn('ab')(0)).toBe(-2);
  });

  it('wertet Funktionen aus – mit und ohne Klammern', () => {
    expect(fn('sin(x)')(Math.PI / 2)).toBeCloseTo(1, 15);
    expect(fn('sin x')(Math.PI / 2)).toBeCloseTo(1, 15);
    expect(fn('sin 2x')(Math.PI / 4)).toBeCloseTo(1, 15);
    expect(fn('2 sin x cos x')(0.3)).toBeCloseTo(Math.sin(0.6), 14);
    expect(fn('sin²x + cos²x')(1.234)).toBeCloseTo(1, 14);
    expect(fn('sin^2(x)')(1)).toBeCloseTo(Math.sin(1) ** 2, 15);
    expect(fn('sqrt(x)')(9)).toBe(3);
    expect(fn('√x')(16)).toBe(4);
    expect(fn('√(x + 7)')(9)).toBe(4);
    expect(fn('wurzel(x)')(4)).toBe(2);
    expect(fn('|x − 1|')(-2)).toBe(3);
    expect(fn('2|x| + 1')(-2)).toBe(5);
    expect(fn('||x| − 3|')(1)).toBe(2);
    expect(fn('abs(x)')(-5)).toBe(5);
    expect(fn('exp(x)')(0)).toBe(1);
    expect(fn('ln(x)')(Math.E)).toBeCloseTo(1, 15);
    expect(fn('lg(x)')(1000)).toBeCloseTo(3, 14);
    expect(fn('log(x)')(100)).toBeCloseTo(2, 14);
    expect(fn('log_2(x)')(8)).toBeCloseTo(3, 14);
    expect(fn('log₂(x)')(32)).toBeCloseTo(5, 14);
    expect(fn('SIN(X)')(0)).toBe(0);
  });

  it('liefert NaN außerhalb der Definitionsmenge', () => {
    expect(fn('sqrt(x)')(-1)).toBeNaN();
    expect(fn('ln x')(0)).toBeNaN();
    expect(fn('1/x')(0)).toBeNaN();
    expect(fn('x^0,5')(-4)).toBeNaN();
    expect(fn('x^(1/3)')(-8)).toBeNaN();
    expect(fn('(-2)^3')(0)).toBe(-8);
    expect(fn('x^-1')(0)).toBeNaN();
  });

  it('überliest „y =“ und „f(x) =“', () => {
    expect(stripPrefix('y = x²')).toBe('    x²');
    expect(fn('f(x) = 2x + 1')(1)).toBe(3);
    expect(fn('Y=x')(5)).toBe(5);
    expect(parseTerm('   ').ok).toBe('empty');
    expect(parseTerm('y =').ok).toBe('empty');
  });

  it('schreibt Terme lesbar zurück', () => {
    expect(text('0.5x^2-2')).toBe('0,5x² − 2');
    expect(text('0.5x^2-2', 'en')).toBe('0.5x² − 2');
    expect(text('sin 2x')).toBe('sin(2x)');
    expect(text('2*sin(x)')).toBe('2 · sin(x)');
    expect(text('2sin(x)')).toBe('2 sin(x)');
    expect(text('sqrt(x+1)')).toBe('√(x + 1)');
    expect(text('abs(x-1)')).toBe('|x − 1|');
    expect(text('(x^2-1)/(x-2)')).toBe('(x² − 1)/(x − 2)');
    expect(text('log_2(x)')).toBe('log₂(x)');
    expect(text('e^(-x)')).toBe('e^(−x)');
  });

  it('meldet Fehler mit Stelle und Grund', () => {
    expect(err('2x +')).toMatchObject({ code: 'expectOperand', a: '+' });
    expect(err('(x + 1')).toMatchObject({ code: 'unclosed', pos: 0 });
    expect(err('x + 1)')).toMatchObject({ code: 'unexpectedClose', pos: 5 });
    expect(err('(x + 1]')).toMatchObject({ code: 'mismatch' });
    expect(err('()')).toMatchObject({ code: 'emptyParens' });
    expect(err('sinus(x)')).toMatchObject({ code: 'unknownName', a: 'sinus', b: 'sin', pos: 0, end: 5 });
    expect(err('arcsin(x)')).toMatchObject({ code: 'unknownName', a: 'arcsin' });
    expect(err('2t')).toMatchObject({ code: 'otherVar', a: 't', pos: 1 });
    expect(err('tx')).toMatchObject({ code: 'otherVar', a: 't', pos: 0 });
    expect(err('x + y')).toMatchObject({ code: 'yVar', pos: 4 });
    expect(err('x² = 4')).toMatchObject({ code: 'equals', pos: 3 });
    expect(err('2 3')).toMatchObject({ code: 'missingOp', a: '2', b: '3' });
    expect(err('x2')).toMatchObject({ code: 'varDigit', a: 'x', b: '2' });
    expect(err('(x+1)2')).toMatchObject({ code: 'missingOp', a: ')', b: '2' });
    expect(err('*x')).toMatchObject({ code: 'startOperator' });
    expect(err('x + * 2')).toMatchObject({ code: 'expectOperand', a: '+' });
    expect(err('sin')).toMatchObject({ code: 'fnNoArg', a: 'sin' });
    expect(err('sin + 1')).toMatchObject({ code: 'fnNoArg' });
    expect(err('|x')).toMatchObject({ code: 'absUnclosed' });
    expect(err('||')).toMatchObject({ code: 'emptyAbs' });
    expect(err('2,')).toMatchObject({ code: 'decimal' });
    expect(err('x # 2')).toMatchObject({ code: 'badChar', a: '#' });
    expect(err('log_1(x)')).toMatchObject({ code: 'logBase' });
    expect(err('('.repeat(30) + 'x' + ')'.repeat(30))).toMatchObject({ code: 'tooDeep' });
  });

  it('schlägt Funktionsnamen vor und findet Parameter', () => {
    expect(suggestName('Sinus')).toBe('sin');
    expect(suggestName('sqr')).toBe('sqrt');
    expect(suggestName('cso')).toBe('cos');
    expect(suggestName('xyzzy')).toBe('');
    expect(paramsIn('a·x² + b')).toEqual(['a', 'b']);
    expect(paramsIn('tan(x) + abs(x)')).toEqual([]);
    expect(paramsIn('a x + sinus')).toEqual(['a']);
    expect(parseTerm('b·sin(a·x)').ok === true && (parseTerm('b·sin(a·x)') as { term: { params: string[] } }).term.params).toEqual(['a', 'b']);
  });
});

describe('Funktionsplotter: Abtasten ohne senkrechte Verbindungslinien', () => {
  it('trennt 1/x an der Polstelle und meldet einen Pol', () => {
    const t = traceFunction(fn('1/x'), -5, 5, -5, 5, 600);
    expect(t.segments).toHaveLength(2);
    expect(t.breaks).toHaveLength(1);
    expect(t.breaks[0]!.kind).toBe('pole');
    expect(Math.abs(t.breaks[0]!.x)).toBeLessThan(1e-6);
  });

  it('trennt tan an jeder Polstelle', () => {
    const t = traceFunction(fn('tan(x)'), -5, 5, -4, 4, 600);
    // Pole bei ±π/2 und ±3π/2
    const poles = t.breaks.filter((b) => b.kind === 'pole').map((b) => b.x);
    expect(poles).toHaveLength(4);
    for (const [p, q] of poles.map((v, i) => [v, [-1.5, -0.5, 0.5, 1.5][i]! * Math.PI])) expect(p).toBeCloseTo(q!, 6);
    expect(t.segments).toHaveLength(5);
  });

  it('beginnt √x genau bei 0 (Rand der Definitionsmenge)', () => {
    const t = traceFunction(fn('sqrt(x)'), -3, 3, -2, 2, 300);
    expect(t.segments).toHaveLength(1);
    expect(t.segments[0]![0]).toBeLessThan(1e-9);
    expect(t.segments[0]![0]).toBeGreaterThanOrEqual(0);
    expect(t.breaks).toEqual([expect.objectContaining({ kind: 'edge' })]);
  });

  it('erkennt ln bei 0 als senkrechte Asymptote', () => {
    const t = traceFunction(fn('ln(x)'), -2, 4, -3, 3, 300);
    expect(t.breaks[0]!.kind).toBe('pole');
  });

  it('erkennt Sprünge (x/|x|) und verbindet steile stetige Graphen', () => {
    const jump = traceFunction(fn('x/|x|'), -2, 2, -2, 2, 401);
    expect(jump.segments).toHaveLength(2);
    expect(jump.breaks.map((b) => b.kind)).toEqual(['jump']);
    const steep = traceFunction(fn('50x'), -2, 2, -2, 2, 400);
    expect(steep.segments).toHaveLength(1);
    expect(steep.breaks).toHaveLength(0);
    const exp = traceFunction(fn('e^x'), -3, 6, -1, 8, 300);
    expect(exp.segments).toHaveLength(1);
  });
});

describe('Funktionsplotter: besondere Punkte', () => {
  it('findet Nullstellen genau (auch glatte Werte) und Berührstellen', () => {
    const z = findZeros(fn('0,5x² − 2'), -6, 6).roots;
    expect(z.map((r) => r.x)).toEqual([-2, 2]);
    expect(z.every((r) => !r.touch)).toBe(true);
    const sq = findZeros(fn('x² − 2'), -6, 6).roots.map((r) => r.x);
    expect(sq[0]).toBeCloseTo(-Math.SQRT2, 12);
    expect(sq[1]).toBeCloseTo(Math.SQRT2, 12);
    const t = findZeros(fn('(x − 1)²'), -6, 6).roots;
    expect(t).toEqual([{ x: 1, touch: true }]);
    expect(findZeros(fn('x² + 0,01'), -6, 6).roots).toEqual([]);
    const s = findZeros(fn('sin(x)'), -7, 7).roots.map((r) => r.x);
    expect(s).toHaveLength(5);
    expect(s[0]).toBeCloseTo(-2 * Math.PI, 12);
    expect(s[2]).toBe(0);
  });

  it('hält Polstellen und Sprünge nicht für Nullstellen', () => {
    expect(findZeros(fn('1/x'), -5, 5).roots).toEqual([]);
    expect(findZeros(fn('x/|x|'), -5, 5).roots).toEqual([]);
    const tz = findZeros(fn('tan(x)'), -4, 4).roots.map((r) => r.x);
    expect(tz).toHaveLength(3);
    expect(tz[0]).toBeCloseTo(-Math.PI, 12);
    expect(findZeros(fn('x − x'), -5, 5).everywhere).toBe(true);
  });

  it('findet Hoch- und Tiefpunkte (auch am Knick), aber keine an Polstellen', () => {
    const e = findExtrema(fn('x³ − 3x'), -3, 3);
    expect(e).toHaveLength(2);
    expect(e[0]).toMatchObject({ kind: 'max' });
    expect(e[0]!.x).toBeCloseTo(-1, 6);
    expect(e[0]!.y).toBeCloseTo(2, 10);
    expect(e[1]!.x).toBeCloseTo(1, 6);
    expect(e[1]!.y).toBeCloseTo(-2, 10);
    const v = findExtrema(fn('0,5x² − 2'), -6, 6);
    expect(v).toEqual([{ x: 0, y: -2, kind: 'min' }]);
    expect(findExtrema(fn('|x − 1| + 2'), -4, 4)).toEqual([{ x: 1, y: 2, kind: 'min' }]);
    expect(findExtrema(fn('1/x²'), -4, 4)).toEqual([]);
    expect(findExtrema(fn('tan(x)'), -4, 4)).toEqual([]);
    expect(findExtrema(fn('sin²x + cos²x'), -4, 4)).toEqual([]);
    expect(findExtrema(fn('x³'), -4, 4)).toEqual([]);
  });

  it('findet Schnittpunkte und erkennt gleiche Graphen', () => {
    const s = findIntersections(fn('x³ − 3x'), fn('x'), -4, 4);
    expect(s.points.map((p) => p.x)).toEqual([-2, 0, 2]);
    expect(s.points.map((p) => p.y)).toEqual([-2, 0, 2]);
    const t = findIntersections(fn('x²'), fn('2x − 1'), -4, 4);
    expect(t.points).toEqual([{ x: 1, y: 1, touch: true }]);
    expect(findIntersections(fn('2x'), fn('x + x'), -4, 4).same).toBe(true);
    const ex = findIntersections(fn('x²'), fn('2^x'), -3, 5).points.map((p) => p.x);
    expect(ex).toHaveLength(3);
    expect(ex[0]).toBeCloseTo(-0.7666646959621, 9);
    expect(ex[1]).toBe(2);
    expect(ex[2]).toBe(4);
  });

  it('findet hebbare Definitionslücken', () => {
    expect(findHoles(fn('(x² − 1)/(x − 1)'), -4, 4)).toEqual([{ x: 1, y: 2 }]);
    expect(findHoles(fn('sin(x)/x'), -4, 4)).toEqual([{ x: 0, y: 1 }]);
    expect(findHoles(fn('1/x'), -4, 4)).toEqual([]);
  });

  it('berechnet Ableitungen und erkennt Knicke', () => {
    expect(derivative(fn('x²'), 3)).toBeCloseTo(6, 6);
    expect(derivative(fn('sin(x)'), 0)).toBeCloseTo(1, 8);
    expect(derivative(fn('|x|'), 0)).toBeNull();
    expect(derivative(fn('sqrt(x)'), -1)).toBeNull();
  });

  it('passt den y-Bereich an (mittlere Werte und besondere Punkte)', () => {
    const r = fitRange([fn('x²')], -3, 3)!;
    expect(r[0]).toBeLessThan(0);
    expect(r[1]).toBeGreaterThan(5);
    expect(r[1]).toBeLessThan(8);
    // x³ − 12x auf [−6; 6]: nicht bis ±144, aber Hoch- und Tiefpunkt (±16) im Bild
    const c = fitRange([fn('x³ − 12x')], -6, 6, 400, [16, -16])!;
    expect(c[0]).toBeLessThan(-16);
    expect(c[1]).toBeGreaterThan(16);
    expect(c[1]).toBeLessThan(40);
    const p = fitRange([fn('1/x')], -4, 4)!;
    expect(p[1] - p[0]).toBeLessThan(20);
    expect(fitRange([fn('sqrt(x)')], -4, -1)).toBeNull();
  });
});
