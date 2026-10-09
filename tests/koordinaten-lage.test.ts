import { describe, expect, it } from 'vitest';
import {
  circleLine,
  distance,
  foot,
  intersection,
  isExactLength,
  judge,
  lineRelation,
  makeTask,
  measured,
  pointCircle,
  pointLineDistance,
  pointText,
  readOptions,
  samePoint,
  X_MAX,
  Y_MAX,
  type Pt,
} from '../src/simulations/mathematik/koordinaten-lage/model';
import { seededRandom } from '../src/sim-core/anim';

describe('Modell: Koordinaten und Lagebeziehungen – Geraden', () => {
  it('erkennt senkrechte Geraden exakt und bestimmt den Schnittpunkt', () => {
    const rel = lineRelation([2, 2], [8, 5], [4, 7], [6, 3]);
    expect(rel.kind).toBe('perpendicular');
    if (rel.kind !== 'perpendicular') return;
    expect(rel.s[0]).toBeCloseTo(5.6, 12);
    expect(rel.s[1]).toBeCloseTo(3.8, 12);
  });

  it('erkennt parallele Geraden und ihren Abstand', () => {
    const rel = lineRelation([1, 1], [7, 4], [2, 5], [6, 7]);
    expect(rel.kind).toBe('parallel');
    if (rel.kind !== 'parallel') return;
    // |(6, 3) × (1, 4)| / |(6, 3)| = 21 / √45
    expect(rel.distance).toBeCloseTo(21 / Math.sqrt(45), 12);
    // waagerechte Parallelen: Abstand = Unterschied der y-Werte
    const h = lineRelation([0, 1], [5, 1], [2, 4], [9, 4]);
    expect(h.kind === 'parallel' && h.distance).toBe(3);
  });

  it('erkennt identische Geraden (vier Punkte auf einer Geraden)', () => {
    expect(lineRelation([2, 2], [8, 5], [4, 3], [10, 6]).kind).toBe('identical');
  });

  it('gibt bei schneidenden Geraden den kleineren Schnittwinkel an', () => {
    const rel = lineRelation([0, 0], [1, 0], [0, 0], [1, 1]);
    expect(rel.kind).toBe('intersecting');
    if (rel.kind === 'intersecting') expect(rel.angle).toBeCloseTo(45, 10);
    const obtuse = lineRelation([0, 0], [1, 0], [0, 0], [-1, 1]);
    if (obtuse.kind === 'intersecting') expect(obtuse.angle).toBeCloseTo(45, 10);
    expect(intersection([0, 0], [1, 0], [3, 3], [3, 4])).toEqual([3, 0]);
    expect(intersection([0, 0], [1, 0], [0, 2], [5, 2])).toBeNull();
  });

  it('berechnet Lotfußpunkt und Abstand eines Punktes von einer Geraden', () => {
    expect(pointLineDistance([5, 7], [1, 2], [9, 2])).toBe(5);
    expect(foot([5, 7], [1, 2], [9, 2])).toEqual([5, 2]);
    const f = foot([9, 1], [2, 2], [8, 5]);
    // Der Lotfußpunkt liegt auf g, und [PF] steht senkrecht auf g
    expect((f[0] - 2) * 3 - (f[1] - 2) * 6).toBeCloseTo(0, 12);
    expect((9 - f[0]) * 6 + (1 - f[1]) * 3).toBeCloseTo(0, 12);
    expect(distance([9, 1], f)).toBeCloseTo(pointLineDistance([9, 1], [2, 2], [8, 5]), 12);
  });
});

describe('Modell: Koordinaten und Lagebeziehungen – Kreis und Gerade', () => {
  it('erkennt eine Tangente exakt (waagerecht und schräg)', () => {
    const t = circleLine([5, 4], 3, [1, 1], [9, 1]);
    expect(t.kind).toBe('tangente');
    expect(t.points[0]).toEqual([5, 1]);
    // Gerade durch (0 | 0) und (4 | 3): Abstand von M(2 | 4) ist |4·4 − 3·2| / 5 = 2
    const s = circleLine([2, 4], 2, [0, 0], [4, 3]);
    expect(s.kind).toBe('tangente');
    expect(s.distance).toBeCloseTo(2, 12);
  });

  it('unterscheidet Passante und Sekante; Schnittpunkte liegen auf dem Kreis', () => {
    expect(circleLine([5, 4], 2.5, [1, 1], [9, 1]).kind).toBe('passante');
    const sek = circleLine([4, 5], 2.5, [2, 2], [8, 5]);
    expect(sek.kind).toBe('sekante');
    for (const q of sek.points) expect(distance(q, [4, 5])).toBeCloseTo(2.5, 10);
    // Gerade durch den Mittelpunkt: Sehne = Durchmesser
    const d = circleLine([5, 4], 3, [1, 4], [9, 4]);
    expect(d.kind).toBe('sekante');
    if (d.kind === 'sekante') expect(distance(d.points[0], d.points[1])).toBeCloseTo(6, 12);
  });

  it('entscheidet die Lage eines Punktes zum Kreis', () => {
    expect(pointCircle([5, 7], [5, 4], 3)).toBe('on');
    expect(pointCircle([5, 6], [5, 4], 3)).toBe('inside');
    expect(pointCircle([9, 4], [5, 4], 3.5)).toBe('outside');
    expect(pointCircle([8, 8], [5, 4], 5)).toBe('on');
  });
});

describe('Modell: Koordinaten und Lagebeziehungen – Messen und Schreibweise', () => {
  it('rundet gemessene Längen auf Millimeter', () => {
    expect(measured(Math.sqrt(45))).toBe(6.7);
    expect(isExactLength(5)).toBe(true);
    expect(isExactLength(2.5)).toBe(true);
    expect(isExactLength(Math.sqrt(2))).toBe(false);
  });

  it('schreibt Punkte wie in der Schule', () => {
    expect(pointText(3, 5, 'de')).toBe('(3 | 5)');
    expect(pointText(3, 5, 'en')).toBe('(3, 5)');
    expect(pointText(5.6, 3.8, 'de')).toBe('(5,6 | 3,8)');
  });
});

describe('Modell: Koordinaten und Lagebeziehungen – Punkte-Spiel', () => {
  it('bewertet Antworten und erkennt vertauschte Koordinaten', () => {
    expect(judge([3, 5], [3, 5])).toBe('correct');
    expect(judge([3, 5], [5, 3])).toBe('swapped');
    expect(judge([3, 5], [4, 5])).toBe('near');
    expect(judge([3, 5], [7, 1])).toBe('wrong');
    // bei gleichen Koordinaten gibt es kein „Vertauschen“
    expect(judge([4, 4], [4, 5])).toBe('near');
  });

  it('bietet beim Ablesen vier verschiedene Antworten mit genau einer richtigen an', () => {
    const rand = seededRandom(7);
    for (let i = 0; i < 200; i++) {
      const x = Math.floor(rand() * (X_MAX + 1));
      const y = Math.floor(rand() * (Y_MAX + 1));
      const opts = readOptions(x, y, rand);
      expect(opts.length).toBe(4);
      expect(opts.filter((o) => samePoint(o, [x, y])).length).toBe(1);
      for (const o of opts) {
        expect(o[0]).toBeGreaterThanOrEqual(0);
        expect(o[0]).toBeLessThanOrEqual(X_MAX);
        expect(o[1]).toBeGreaterThanOrEqual(0);
        expect(o[1]).toBeLessThanOrEqual(Y_MAX);
      }
      const keys = new Set(opts.map((o) => o.join('|')));
      expect(keys.size).toBe(4);
      // Die vertauschte Antwort ist dabei, wenn sie möglich ist
      if (x !== y && x <= Y_MAX) expect(opts.some((o) => samePoint(o, [y, x]))).toBe(true);
    }
  });

  it('erzeugt Aufgaben im sichtbaren Bereich ohne direkte Wiederholung', () => {
    const rand = seededRandom(3);
    let prev: Pt = [0, 0];
    let onAxis = 0;
    for (let i = 0; i < 300; i++) {
      const t = makeTask(rand, i % 2 ? 'read' : 'set', prev);
      expect(t.x).toBeGreaterThanOrEqual(0);
      expect(t.x).toBeLessThanOrEqual(X_MAX);
      expect(t.y).toBeGreaterThanOrEqual(0);
      expect(t.y).toBeLessThanOrEqual(Y_MAX);
      expect(samePoint([t.x, t.y], prev)).toBe(false);
      expect(t.options.length).toBe(t.kind === 'read' ? 4 : 0);
      if (t.x === 0 || t.y === 0) onAxis++;
      prev = [t.x, t.y];
    }
    // Punkte auf den Achsen kommen vor, aber nicht zu oft
    expect(onAxis).toBeGreaterThan(20);
    expect(onAxis).toBeLessThan(120);
  });
});
