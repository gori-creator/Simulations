import { describe, expect, it } from 'vitest';
import { angleDeg, angleInPlane, contributions, cross, crossScheme, crossTerms, dot, dotAndArea, exactTo, normForm, handedness, hasSolution, norm, orthogonal, parallelogramArea, perpPart, perpUnit, projection, projLength, pyramidVolume, relation, rotateFrom, shearC, spatHeight, spatVolume, TASKS, taskCloseness, taskSolved, taskValue, triangleArea, triple, unit } from '../src/simulations/mathematik/skalar-vektorprodukt/model';

describe('Modell: Skalarprodukt', () => {
  it('a · b = a₁b₁ + a₂b₂ + a₃b₃', () => {
    expect(dot([1, 2, 0], [0, 1, 2])).toBe(2);
    expect(dot([1, 2, 3], [4, -5, 6])).toBe(12);
  });
  it('Winkel aus cos φ = a·b / (|a|·|b|)', () => {
    expect(angleDeg([1, 0, 0], [0, 1, 0])).toBeCloseTo(90, 12);
    expect(angleDeg([1, 0, 0], [1, 1, 0])).toBeCloseTo(45, 12);
    expect(angleDeg([1, 2, 0], [0, 1, 2])).toBeCloseTo((Math.acos(0.4) * 180) / Math.PI, 10);
    expect(angleDeg([1, 2, 0], [-2, -1, 2])).toBeGreaterThan(90);
    expect(angleDeg([1, 0, 0], [-3, 0, 0])).toBeCloseTo(180, 12);
    expect(Number.isNaN(angleDeg([0, 0, 0], [1, 0, 0]))).toBe(true);
  });
  it('senkrecht genau bei a · b = 0', () => {
    expect(orthogonal([1, 2, 0], [-2, 1, 2])).toBe(true);
    expect(orthogonal([1, 2, 0], [0, 1, 2])).toBe(false);
  });
  it('Projektion von b auf a', () => {
    expect(projection([3, 4, 0], [1, 0, 0])).toEqual([3, 0, 0]);
    expect(projLength([0, 1, 2], [1, 2, 0])).toBeCloseTo(2 / Math.sqrt(5), 12);
    expect(projLength([-2, -1, 2], [1, 2, 0])).toBeLessThan(0);
    // b − Projektion steht senkrecht auf a
    const a = [1, 2, 0] as const;
    const b = [0, 1, 2] as const;
    const f = projection(b, a);
    expect(dot([b[0] - f[0], b[1] - f[1], b[2] - f[2]], a)).toBeCloseTo(0, 12);
  });
});

describe('Modell: Vektorprodukt und Spatprodukt', () => {
  it('a × b über Kreuz', () => {
    expect(cross([1, 2, 0], [0, 1, 2])).toEqual([4, -2, 1]);
    expect(cross([1, 0, 0], [0, 1, 0])).toEqual([0, 0, 1]);
    expect(crossTerms([1, 2, 0], [0, 1, 2])).toEqual([
      [4, 0],
      [0, 2],
      [1, 0],
    ]);
  });
  it('a × b steht senkrecht auf a und b, b × a = −(a × b)', () => {
    const a = [2, -1, 3] as const;
    const b = [0.5, 4, -2] as const;
    const n = cross(a, b);
    expect(dot(n, a)).toBeCloseTo(0, 12);
    expect(dot(n, b)).toBeCloseTo(0, 12);
    expect(cross(b, a)).toEqual(n.map((v) => -v));
  });
  it('|a × b| = |a|·|b|·sin φ = Parallelogrammfläche', () => {
    const a = [1, 2, 0] as const;
    const b = [0, 1, 2] as const;
    const phi = (angleDeg(a, b) * Math.PI) / 180;
    expect(parallelogramArea(a, b)).toBeCloseTo(norm(a) * norm(b) * Math.sin(phi), 12);
    expect(parallelogramArea([0, 3, 0], [0, 0, 2])).toBe(6);
    expect(triangleArea([0, 3, 0], [0, 0, 2])).toBe(3);
    expect(parallelogramArea([1, 2, 3], [2, 4, 6])).toBe(0);
  });
  it('Spatprodukt: Volumen von Spat und Pyramide', () => {
    expect(triple([1, 2, 0], [0, 1, 2], [1, -1, 2])).toBe(8);
    expect(spatVolume([1, 0, 0], [0, 2, 0], [0, 0, 3])).toBe(6);
    expect(pyramidVolume([1, 0, 0], [0, 2, 0], [0, 0, 3])).toBe(1);
    expect(handedness([1, 0, 0], [0, 1, 0], [0, 0, 1])).toBe('right');
    expect(handedness([0, 1, 0], [1, 0, 0], [0, 0, 1])).toBe('left');
    expect(handedness([1, 0, 0], [0, 1, 0], [1, 1, 0])).toBe('flat');
  });
});

describe('Prüfwerte aus dem Auftrag', () => {
  it('(1|0|0) · (1|1|0) = 1, Winkel 45°', () => {
    expect(dot([1, 0, 0], [1, 1, 0])).toBe(1);
    expect(angleDeg([1, 0, 0], [1, 1, 0])).toBeCloseTo(45, 12);
  });
  it('(1|0|0) × (0|1|0) = (0|0|1)', () => {
    expect(cross([1, 0, 0], [0, 1, 0])).toEqual([0, 0, 1]);
  });
  it('(1|2|3) × (4|5|6) = (−3|6|−3), Fläche √54 ≈ 7,35', () => {
    expect(cross([1, 2, 3], [4, 5, 6])).toEqual([-3, 6, -3]);
    expect(parallelogramArea([1, 2, 3], [4, 5, 6])).toBeCloseTo(Math.sqrt(54), 12);
    expect(parallelogramArea([1, 2, 3], [4, 5, 6])).toBeCloseTo(7.348, 3);
  });
});

describe('Modell: Erweiterungen', () => {
  it('Drehung in der Ebene aus a und Bezugsvektor', () => {
    const b = rotateFrom([1, 0, 0], [0, 1, 0], 45, Math.SQRT2);
    expect(b[0]).toBeCloseTo(1, 12);
    expect(b[1]).toBeCloseTo(1, 12);
    expect(b[2]).toBeCloseTo(0, 12);
    expect(angleDeg([1, 2, 0], rotateFrom([1, 2, 0], [0, 1, 2], 120, 3))).toBeCloseTo(120, 10);
    expect(norm(rotateFrom([1, 2, 0], [0, 1, 2], 120, 3))).toBeCloseTo(3, 12);
    // Bezugsvektor parallel zu a: trotzdem eine senkrechte Richtung
    expect(angleDeg([0, 0, 2], rotateFrom([0, 0, 2], [0, 0, 5], 90, 1))).toBeCloseTo(90, 10);
    expect(angleInPlane([1, 0, 0], [0, 1, 0], [1, 1, 0])).toBeCloseTo(45, 12);
    expect(angleInPlane([1, 0, 0], [0, 1, 0], [-1, -1, 0])).toBeCloseTo(135, 12);
  });
  it('a · b = |a||b| cos φ und |a × b| = |a||b| sin φ', () => {
    const r = dotAndArea(2, 3, 60);
    expect(r.dot).toBeCloseTo(3, 12);
    expect(r.area).toBeCloseTo(3 * Math.sqrt(3), 12);
    expect(dotAndArea(2, 3, 90).dot).toBeCloseTo(0, 12);
    expect(dotAndArea(1, 1, 45).dot).toBeCloseTo(dotAndArea(1, 1, 45).area, 12);
  });
  it('Summanden, Senkrechtanteil, Lage', () => {
    expect(contributions([1, 2, 3], [4, -5, 6])).toEqual([4, -10, 18]);
    expect(dot(perpPart([3, 4, 0], [1, 0, 0]), [1, 0, 0])).toBeCloseTo(0, 12);
    unit([0, 3, 4]).forEach((v, i) => expect(v).toBeCloseTo([0, 0.6, 0.8][i]!, 12));
    expect(perpUnit([1, 0, 0], [2, 0, 0])[0]).toBeCloseTo(0, 12);
    expect(relation([0, 0, 0], [1, 0, 0])).toBe('zero');
    expect(relation([1, 2, 3], [2, 4, 6])).toBe('parallel');
    expect(relation([1, 2, 3], [-1, -2, -3])).toBe('antiparallel');
    expect(relation([1, 0, 0], [0, 5, 0])).toBe('perpendicular');
    expect(relation([1, 0, 0], [1, 1, 0])).toBe('acute');
    expect(relation([1, 0, 0], [-1, 1, 0])).toBe('obtuse');
  });
  it('Schema über Kreuz', () => {
    const s = crossScheme([1, 2, 3], [4, 5, 6]);
    expect(s.map((q) => q.value)).toEqual([-3, 6, -3]);
    expect(s[0]).toEqual({ rows: [1, 2], plus: 12, minus: 15, value: -3 });
    expect(s[2]!.rows).toEqual([0, 1]);
  });
  it('Höhe und Scherung nach Cavalieri erhalten das Volumen', () => {
    const a = [2, 0, 0] as const;
    const b = [0, 3, 0] as const;
    const c = [1, 1, 2] as const;
    expect(spatHeight(a, b, c)).toEqual([0, 0, 2]);
    for (const t of [0, 0.3, 1]) expect(spatVolume(a, b, shearC(a, b, c, t))).toBeCloseTo(12, 12);
    expect(shearC(a, b, c, 1)).toEqual([0, 0, 2]);
    expect(shearC([1, 0, 0], [2, 0, 0], c, 1)).toEqual(c);
  });
});

describe('Modell: Entdeckungsaufgaben', () => {
  it('Lösungen werden erkannt, der Nullvektor nie', () => {
    expect(taskSolved('perp', [1, -2, 5])).toBe(true);
    expect(taskSolved('perp', [0, 0, 0])).toBe(false);
    expect(taskSolved('perp', TASKS.perp.start)).toBe(false);
    expect(taskSolved('angle', [-1, 0, 1])).toBe(true);
    expect(taskSolved('angle', [0, -1, -1])).toBe(true);
    expect(taskSolved('angle', TASKS.angle.start)).toBe(false);
    expect(taskSolved('area', [5, 3, 0])).toBe(true);
    expect(taskSolved('area', [0, 0, -3])).toBe(true);
    expect(taskValue('area', [1, 1.5, 2])).toBeCloseTo(5, 12);
    expect(taskSolved('vol', [3, -1, -2])).toBe(true);
    expect(taskSolved('vol', TASKS.vol.start)).toBe(false);
    expect(taskSolved('flat', [1, 1, 2])).toBe(true);
    expect(taskSolved('flat', [2, 0, 2])).toBe(false);
    expect(taskSolved('flat', TASKS.flat.start)).toBe(false);
  });
  it('Nähe zum Ziel und Liste der Lösungen', () => {
    expect(taskCloseness('perp', [1, -2, 0])).toBe(0);
    expect(taskCloseness('perp', [6, 6, 0])).toBe(1);
    expect(hasSolution([[1, 2, 3]], [1, 2, 3])).toBe(true);
    expect(hasSolution([[1, 2, 3]], [1, 2, 3.5])).toBe(false);
  });
});

describe('Anzeige: Beträge exakt, als Wurzel oder gerundet', () => {
  it('normForm unterscheidet Zahl, Wurzel und Näherung', () => {
    expect(normForm([2, 2, 1])).toEqual({ kind: 'num', value: 3, sq: 9 });
    expect(normForm([1, 2, 0]).kind).toBe('root'); // √5
    expect(normForm([1, 2, 0]).sq).toBe(5);
    expect(normForm([0.5, 0.5, 0]).kind).toBe('root'); // √0,5
    expect(normForm([1.5, 2, 0]).kind).toBe('num'); // 2,5
    expect(normForm([0.1, 0.123, 0]).kind).toBe('approx');
  });
  it('„=“ nur bei exakt darstellbaren Werten', () => {
    // cos φ = −4 / (√5 · 3) ≈ −0,596
    expect(exactTo(-4 / (Math.sqrt(5) * 3), 3)).toBe(false);
    expect(exactTo(0.5, 3)).toBe(true);
    expect(exactTo(2.24)).toBe(true);
    expect(exactTo(Math.sqrt(5))).toBe(false);
  });
  it('Aufgabe „Winkel 120°“: jede Lösung bildet mit −a genau 60° (Kegel um −a)', () => {
    const a = TASKS.angle.a;
    const minusA = [-a[0], -a[1], -a[2]] as const;
    // (−1 | 0 | ±1) und (0 | −1 | 1) bilden mit a = (1 | 1 | 0) je 120°
    for (const b of [[-1, 0, 1], [-1, 0, -1], [0, -1, 1]] as const) {
      expect(angleDeg(a, b)).toBeCloseTo(120, 9);
      expect(angleDeg(minusA, b)).toBeCloseTo(60, 9);
      expect(taskSolved('angle', b)).toBe(true);
    }
  });
});
