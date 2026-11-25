import { describe, expect, it } from 'vitest';
import { elongation, lonRate, PLANETS, synodic, T_ALIGN } from '../src/simulations/physik/schleifenbahn/model';

describe('Schleifenbahnen', () => {
  const mars = PLANETS.mars!;

  it('Opposition: Mars steht der Sonne gegenüber und läuft rückwärts', () => {
    expect(elongation(mars, T_ALIGN)).toBeGreaterThan(170);
    expect(lonRate(mars, T_ALIGN)).toBeLessThan(0);
  });

  it('weit weg von der Opposition: rechtläufig', () => {
    expect(lonRate(mars, T_ALIGN + synodic(mars) / 2)).toBeGreaterThan(0);
  });

  it('synodische Periode von Mars etwa 2,1 Jahre, Jupiter etwa 1,1 Jahre', () => {
    expect(synodic(mars)).toBeCloseTo(2.135, 2);
    expect(synodic(PLANETS.jupiter!)).toBeCloseTo(1.092, 2);
  });

  it('Venus: in unterer Konjunktion rückläufig, Elongation nie über 47°', () => {
    const v = PLANETS.venus!;
    expect(lonRate(v, T_ALIGN)).toBeLessThan(0);
    let max = 0;
    for (let t = 0; t < 2; t += 0.01) max = Math.max(max, elongation(v, t));
    expect(max).toBeLessThan(48);
    expect(max).toBeGreaterThan(44);
  });
});
