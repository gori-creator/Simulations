import { beforeAll, describe, expect, it } from 'vitest';

let headOutline: (seconds: number, directions?: number) => number[];

beforeAll(async () => {
  // motion.ts fragt beim Laden prefers-reduced-motion ab
  globalThis.matchMedia ??= ((query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} })) as unknown as typeof matchMedia;
  ({ headOutline } = await import('../src/lib/home/sculpture'));
});

describe('Startseite: Skulptur', () => {
  it('der Kopf ist in jeder Stellung des Schwenks rund (Umriss ±1 %)', () => {
    for (let t = 0; t < 48; t += 1.5) {
      const support = headOutline(t);
      const max = Math.max(...support);
      const min = Math.min(...support);
      expect(min / max).toBeGreaterThan(0.99);
      // Breite gleich Höhe
      const n = support.length;
      const width = support[0]! + support[n / 2]!;
      const height = support[n / 4]! + support[(3 * n) / 4]!;
      expect(width / height).toBeCloseTo(1, 2);
    }
  });
});
