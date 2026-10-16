import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { drawLabStand, scaledSprite } from '../src/sim-core';

/** Zeichenkontext, der nur die Aufrufe mitschreibt (Tests laufen ohne Browser). */
function fakeContext(log: string[]): CanvasRenderingContext2D {
  return new Proxy({} as Record<string, unknown>, {
    get(target, key: string) {
      if (key in target) return target[key];
      return (...args: unknown[]) => log.push(`${key}(${args.filter((a) => typeof a === 'number').join(',')})`);
    },
    set(target, key: string, value) {
      target[key] = value;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
}

let created = 0;
beforeEach(() => {
  created = 0;
  vi.stubGlobal('document', {
    createElement: () => {
      created++;
      const log: string[] = [];
      return { width: 0, height: 0, getContext: () => fakeContext(log) };
    },
  });
});
afterEach(() => vi.unstubAllGlobals());

const img = () => ({ width: 183, height: 520 }) as unknown as HTMLImageElement;

describe('scaledSprite', () => {
  it('rendert jede Größe nur einmal und in Gerätepixeln', () => {
    const source = img();
    const a = scaledSprite(source, 20, 30, 2);
    const b = scaledSprite(source, 20, 30, 2);
    expect(a).toBe(b);
    expect(created).toBe(1);
    expect([a.width, a.height]).toEqual([40, 60]);
    scaledSprite(source, 20, 30, 2, { flipX: true });
    expect(created).toBe(2);
  });
});

describe('drawLabStand', () => {
  const opts = { rodX: 50, armY: 40, armTo: 200, floorY: 400, scale: 0.6, dpr: 1, dark: false };

  it('lehnt zu kurze Stative ab (dann zeichnet die Simulation ihre Ersatzgrafik)', () => {
    const log: string[] = [];
    expect(drawLabStand(fakeContext(log), img(), { ...opts, floorY: 60 })).toBe(false);
    expect(log).toEqual([]);
    expect(created).toBe(0);
  });

  it('rendert vorab und verwendet das Ergebnis bei gleicher Größe wieder', () => {
    const source = img();
    const log: string[] = [];
    expect(drawLabStand(fakeContext(log), source, opts)).toBe(true);
    const first = created;
    expect(first).toBeGreaterThan(0);
    drawLabStand(fakeContext(log), source, { ...opts, rodX: 80, armTo: 230 });
    expect(created).toBe(first);
    expect(log.filter((l) => l.startsWith('drawImage'))).toHaveLength(2);
  });

  it('spiegelt das Stativ, wenn der Ausleger nach links zeigt', () => {
    const log: string[] = [];
    drawLabStand(fakeContext(log), img(), { ...opts, rodX: 300, armTo: 120 });
    expect(log).toContain('scale(-1,1)');
  });
});
