import { describe, expect, it } from 'vitest';
import { FixedStepper } from '../src/sim-core/clock';
import { mod, rk4, solveQuadratic } from '../src/sim-core/numeric';
import { minorStep, niceStep, piStep, ticksIn } from '../src/sim-core/ticks';

describe('solveQuadratic', () => {
  it('findet zwei, eine oder keine Lösung', () => {
    expect(solveQuadratic(1, -2, -3)).toEqual([-1, 3]);
    expect(solveQuadratic(1, -4, 4)).toEqual([2]);
    expect(solveQuadratic(1, 0, 1)).toEqual([]);
  });

  it('behandelt lineare und Sonderfälle', () => {
    expect(solveQuadratic(0, 2, -4)).toEqual([2]);
    expect(solveQuadratic(0, 0, 1)).toEqual([]);
    expect(solveQuadratic(1, 0, -4)).toEqual([-2, 2]);
    expect(solveQuadratic(2, 4, 0)).toEqual([-2, 0]);
  });
});

describe('rk4', () => {
  it('hält die Energie eines harmonischen Oszillators fast konstant', () => {
    const f = (_t: number, [pos, vel]: readonly number[]) => [vel!, -pos!];
    let y = [1, 0];
    const h = 0.01;
    for (let i = 0; i < 1000; i++) y = rk4(f, i * h, y, h);
    const energy = 0.5 * (y[0]! ** 2 + y[1]! ** 2);
    expect(energy).toBeCloseTo(0.5, 6);
    expect(y[0]).toBeCloseTo(Math.cos(10), 5);
  });
});

describe('FixedStepper', () => {
  it('rechnet unabhängig von der Bildrate in festen Schritten', () => {
    const stepper = new FixedStepper(0.01);
    let steps = 0;
    stepper.run(0.016, () => steps++);
    stepper.run(0.016, () => steps++);
    stepper.run(0.016, () => steps++);
    expect(steps).toBe(4);
  });
});

describe('Achseneinteilung', () => {
  it('wählt schöne Schrittweiten', () => {
    expect(niceStep(0.7)).toBe(1);
    expect(niceStep(1.7)).toBe(2);
    expect(niceStep(3)).toBe(5);
    expect(niceStep(7)).toBe(10);
    expect(niceStep(0.03)).toBeCloseTo(0.05);
    expect(minorStep(2)).toBe(1);
    expect(minorStep(5)).toBe(1);
    expect(minorStep(1)).toBe(0.5);
  });

  it('erzeugt Teilstriche im Intervall', () => {
    expect(ticksIn(-2.5, 2.5, 1)).toEqual([-2, -1, 0, 1, 2]);
    expect(ticksIn(0, 1, 0.25)).toEqual([0, 0.25, 0.5, 0.75, 1]);
    expect(ticksIn(1, 0, 1)).toEqual([]);
  });

  it('wählt π-Schritte', () => {
    expect(piStep(1)).toBeCloseTo(Math.PI / 2);
    expect(piStep(3)).toBeCloseTo(Math.PI);
    expect(piStep(0.2)).toBeCloseTo(Math.PI / 12);
  });

  it('rechnet Reste auch für negative Zahlen', () => {
    expect(mod(-30, 360)).toBe(330);
    expect(mod(370, 360)).toBe(10);
  });
});
