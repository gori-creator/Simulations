import { describe, expect, it } from 'vitest';
import { counts, dual, PLATONIC, solid } from '../src/simulations/mathematik/platonische-koerper/model';

describe('Platonische Körper', () => {
  it('haben die richtigen Anzahlen', () => {
    const expected = { tetra: [4, 6, 4, 3, 3], hexa: [8, 12, 6, 4, 3], okta: [6, 12, 8, 3, 4], dodeka: [20, 30, 12, 5, 3], ikosa: [12, 30, 20, 3, 5] } as const;
    for (const id of PLATONIC) {
      const c = counts(solid(id));
      const [e, k, f, sides, deg] = expected[id as keyof typeof expected];
      expect([c.e, c.k, c.f], id).toEqual([e, k, f]);
      expect(c.faceSides, id).toEqual([sides]);
      expect(c.vertexDegrees, id).toEqual([deg]);
      expect(c.e - c.k + c.f, id).toBe(2);
    }
  });

  it('erfüllen den Eulerschen Polyedersatz auch für Prisma und Pyramide', () => {
    for (let n = 3; n <= 10; n++) {
      const pr = counts(solid('prisma', n));
      expect([pr.e, pr.k, pr.f]).toEqual([2 * n, 3 * n, n + 2]);
      const py = counts(solid('pyramide', n));
      expect([py.e, py.k, py.f]).toEqual([n + 1, 2 * n, n + 1]);
    }
  });

  it('bildet duale Körper', () => {
    const d = counts(dual(solid('hexa')));
    expect([d.e, d.k, d.f]).toEqual([6, 12, 8]);
    const d2 = counts(dual(solid('ikosa')));
    expect([d2.e, d2.k, d2.f]).toEqual([20, 30, 12]);
  });

  it('hat nach außen orientierte Flächen', () => {
    for (const id of PLATONIC) {
      const p = solid(id);
      for (const f of p.faces) {
        const [a, b, c] = f.map((i) => p.vertices[i]!);
        const u = [b![0] - a![0], b![1] - a![1], b![2] - a![2]];
        const v = [c![0] - a![0], c![1] - a![1], c![2] - a![2]];
        const n = [u[1]! * v[2]! - u[2]! * v[1]!, u[2]! * v[0]! - u[0]! * v[2]!, u[0]! * v[1]! - u[1]! * v[0]!];
        expect(n[0]! * a![0] + n[1]! * a![1] + n[2]! * a![2], id).toBeGreaterThan(0);
      }
    }
  });
});
