import { describe, expect, it } from 'vitest';
import {
  analyze,
  CLASSES,
  EXAMPLES,
  GRID_H,
  GRID_W,
  interiorAngles,
  isConvex,
  LEVEL,
  PARENTS,
  randomOf,
  requirements,
  validity,
  type Quad,
  type QuadClass,
} from '../src/simulations/mathematik/vierecke/model';
import { seededRandom } from '../src/sim-core/anim';

const Q = (...pts: [number, number][]): Quad => pts as unknown as Quad;

describe('Modell: Haus der Vierecke – Einordnung', () => {
  it('erkennt die Beispiele als genau ihre Art', () => {
    for (const k of CLASSES) expect(analyze(EXAMPLES[k]).best, k).toBe(k);
  });

  it('Quadrat: alle Arten des Hauses treffen zu', () => {
    const a = analyze(Q([0, 0], [4, 0], [4, 4], [0, 4]));
    expect(a.best).toBe('quadrat');
    expect(a.classes).toEqual(CLASSES);
    expect(a.axes).toHaveLength(4);
    expect(a.center).toEqual([2, 2]);
  });

  it('schräges Quadrat (nur auf Gitterpunkten) wird exakt erkannt', () => {
    const a = analyze(Q([0, 0], [3, 1], [2, 4], [-1, 3]));
    expect(a.best).toBe('quadrat');
    expect(a.right).toEqual([true, true, true, true]);
  });

  it('Rechteck: kein Drachenviereck, aber gleichschenkliges Trapez und Parallelogramm', () => {
    const a = analyze(Q([0, 0], [6, 0], [6, 3], [0, 3]));
    expect(a.best).toBe('rechteck');
    expect(a.classes).toEqual(['rechteck', 'parallelogramm', 'gltrapez', 'trapez', 'viereck']);
    expect(a.axes.map((x) => x.kind).sort()).toEqual(['ac', 'bd']);
    expect(a.diagEqual && a.diagBisect && !a.diagPerp).toBe(true);
  });

  it('Raute: Diagonalen sind Symmetrieachsen und stehen senkrecht', () => {
    const a = analyze(Q([0, 0], [5, 0], [8, 4], [3, 4]));
    expect(a.best).toBe('raute');
    expect(a.classes).toEqual(['raute', 'parallelogramm', 'drachen', 'trapez', 'viereck']);
    expect(a.axes.map((x) => x.kind).sort()).toEqual(['e', 'f']);
    expect(a.diagPerp && a.diagBisect && !a.diagEqual).toBe(true);
  });

  it('Parallelogramm: punktsymmetrisch, aber ohne Symmetrieachse', () => {
    const a = analyze(Q([0, 0], [6, 0], [8, 3], [2, 3]));
    expect(a.best).toBe('parallelogramm');
    expect(a.axes).toHaveLength(0);
    expect(a.center).toEqual([4, 1.5]);
    expect(a.sideGroups).toEqual([
      [0, 2],
      [1, 3],
    ]);
  });

  it('gleichschenkliges Trapez: eine Achse durch die Mitten der parallelen Seiten', () => {
    const a = analyze(Q([0, 0], [8, 0], [6, 3], [2, 3]));
    expect(a.best).toBe('gltrapez');
    expect(a.axes).toHaveLength(1);
    expect(a.axes[0]!.kind).toBe('ac');
    expect(a.axes[0]!.p).toEqual([4, 0]);
    expect(a.diagEqual).toBe(true);
    // Basiswinkel gleich groß
    expect(a.angles[0]).toBeCloseTo(a.angles[1], 10);
  });

  it('schräges gleichschenkliges Trapez (Achse durch b und d)', () => {
    // parallele Seiten b und d (senkrecht), Achse waagerecht
    const a = analyze(Q([0, 0], [3, 2], [3, 6], [0, 8]));
    expect(a.best).toBe('gltrapez');
    expect(a.axes[0]!.kind).toBe('bd');
  });

  it('Parallelogramm mit gleich langen Schenkeln ist kein gleichschenkliges Trapez', () => {
    const a = analyze(Q([0, 0], [6, 0], [8, 3], [2, 3]));
    expect(a.classes).not.toContain('gltrapez');
  });

  it('Drachenviereck: zwei Paare gleich langer Nachbarseiten, Diagonalen senkrecht', () => {
    const a = analyze(Q([0, 0], [3, -2], [8, 0], [3, 2]));
    expect(a.best).toBe('drachen');
    expect(a.axes.map((x) => x.kind)).toEqual(['e']);
    expect(a.diagPerp).toBe(true);
    expect(a.diagBisect).toBe(false);
  });

  it('nicht konvexes Drachenviereck (Pfeilform) ist achsensymmetrisch zur Diagonalen', () => {
    const q = Q([9, 2], [15, 12], [9, 8], [3, 12]);
    expect(validity(q)).toBe('ok');
    expect(isConvex(q)).toBe(false);
    const a = analyze(q);
    expect(a.best).toBe('drachen');
    expect(a.diagCross).toBeNull();
    // Innenwinkel bei C größer als 180°
    expect(a.angles[2]).toBeGreaterThan(180);
  });

  it('allgemeines Trapez und allgemeines Viereck', () => {
    expect(analyze(EXAMPLES.trapez).classes).toEqual(['trapez', 'viereck']);
    expect(analyze(EXAMPLES.viereck).classes).toEqual(['viereck']);
  });
});

describe('Modell: Haus der Vierecke – Grundlagen', () => {
  it('Innenwinkelsumme 360° – auch bei nicht konvexen Vierecken und im Uhrzeigersinn', () => {
    const qs = [EXAMPLES.viereck, Q([9, 2], [15, 12], [9, 8], [3, 12]), Q([0, 0], [0, 4], [5, 5], [6, 1])];
    for (const q of qs) {
      const s = interiorAngles(q).reduce((x, y) => x + y, 0);
      expect(s).toBeCloseTo(360, 9);
    }
    expect(interiorAngles(Q([0, 0], [0, 4], [4, 4], [4, 0]))).toEqual([90, 90, 90, 90]);
  });

  it('erkennt ungültige Vierecke', () => {
    expect(validity(Q([0, 0], [0, 0], [4, 4], [0, 4]))).toBe('same');
    expect(validity(Q([0, 0], [2, 0], [4, 0], [0, 4]))).toBe('collinear');
    expect(validity(Q([0, 0], [4, 4], [4, 0], [0, 4]))).toBe('crossed');
    expect(validity(EXAMPLES.quadrat)).toBe('ok');
  });

  it('das Haus ist stimmig: zu jeder Art gehören auch alle Oberbegriffe', () => {
    const rand = seededRandom(7);
    for (let n = 0; n < 4000; n++) {
      const pts = Array.from({ length: 4 }, () => [Math.floor(rand() * 9), Math.floor(rand() * 9)] as [number, number]);
      const q = pts as unknown as Quad;
      if (validity(q) !== 'ok') continue;
      const a = analyze(q);
      for (const k of a.classes) for (const parent of PARENTS[k]) expect(a.classes, `${k} → ${parent}`).toContain(parent);
      // die speziellste Art ist eindeutig: Alle anderen zutreffenden Arten sind Oberbegriffe von ihr
      const above = new Set<QuadClass>();
      const walk = (k: QuadClass) => PARENTS[k].forEach((p) => (above.add(p), walk(p)));
      walk(a.best);
      expect(a.classes.filter((k) => k !== a.best).every((k) => above.has(k))).toBe(true);
      // Parallelogramm ⇔ Diagonalen halbieren sich ⇔ punktsymmetrisch
      expect(a.classes.includes('parallelogramm')).toBe(a.diagBisect);
    }
  });

  it('Stockwerke: Oberbegriffe liegen weiter unten im Haus', () => {
    for (const k of CLASSES) for (const p of PARENTS[k]) expect(LEVEL[p]).toBeGreaterThan(LEVEL[k]);
  });
});

describe('Modell: Haus der Vierecke – Aufgaben', () => {
  it('nennt die Bedingungen der Definition mit Fortschritt', () => {
    const a = analyze(Q([0, 0], [6, 0], [8, 3], [2, 3]));
    expect(requirements('parallelogramm', a).every((r) => r.ok)).toBe(true);
    const rr = requirements('raute', a);
    expect(rr[0]).toMatchObject({ id: 'sides4', ok: false, have: 2, need: 4 });
    const rq = requirements('quadrat', analyze(Q([0, 0], [6, 0], [6, 3], [0, 3])));
    expect(rq.map((r) => r.ok)).toEqual([false, true]);
    expect(requirements('viereck', a)).toEqual([]);
  });

  it('erzeugt zufällige Vierecke genau der gewünschten Art im Karopapier', () => {
    const rand = seededRandom(42);
    for (const k of CLASSES) {
      for (let n = 0; n < 25; n++) {
        const q = randomOf(k, rand);
        const a = analyze(q);
        expect(a.best, k).toBe(k);
        expect(validity(q)).toBe('ok');
        for (const [x, y] of q) {
          expect(x).toBeGreaterThanOrEqual(0);
          expect(x).toBeLessThanOrEqual(GRID_W);
          expect(y).toBeGreaterThanOrEqual(0);
          expect(y).toBeLessThanOrEqual(GRID_H);
        }
      }
    }
  });

  it('allgemeine Startvierecke haben keine besonderen Eigenschaften', () => {
    const rand = seededRandom(3);
    for (let n = 0; n < 30; n++) {
      const a = analyze(randomOf('viereck', rand));
      expect(a.classes).toEqual(['viereck']);
      expect(a.right.some(Boolean)).toBe(false);
      expect(a.maxEqual).toBe(1);
    }
  });
});
