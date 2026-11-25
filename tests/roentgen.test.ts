import { describe, expect, it } from 'vitest';
import {
  ANODES,
  braggAngle,
  braggLambda,
  bremsstrahlung,
  comptonLambda,
  lambdaMin,
  lambdaOf,
  lineStrength,
  moseleyKa,
  recoilAngle,
} from '../src/simulations/physik/roentgen/model';

describe('Röntgenröhre', () => {
  it('Duane-Hunt: bei 25 kV beginnt das Spektrum bei rund 50 pm', () => {
    expect(lambdaMin(25)).toBeCloseTo(49.6, 1);
    expect(bremsstrahlung(49, 25, 29)).toBe(0);
    expect(bremsstrahlung(60, 25, 29)).toBeGreaterThan(0);
  });

  it('Linien erst oberhalb der K-Schwelle', () => {
    expect(lineStrength(15, ANODES.mo!)).toBe(0);
    expect(lineStrength(30, ANODES.mo!)).toBeGreaterThan(0);
  });

  it('Kupfer-Kα bei etwa 154 pm', () => {
    expect(lambdaOf(ANODES.cu!.Ka)).toBeCloseTo(154.2, 0);
  });

  it('Moseley trifft Kupfer und Molybdän auf wenige Prozent', () => {
    expect(moseleyKa(29) / ANODES.cu!.Ka).toBeCloseTo(1, 1);
    expect(moseleyKa(42) / ANODES.mo!.Ka).toBeCloseTo(1, 1);
  });
});

describe('Bragg-Reflexion', () => {
  it('Hin- und Rückrechnung', () => {
    const l = braggLambda(12);
    expect(braggAngle(l)).toBeCloseTo(12, 10);
    expect(braggAngle(1000)).toBeNull();
  });
});

describe('Compton-Effekt', () => {
  it('Verschiebung 0 bei 0°, λ_C bei 90°, 2λ_C bei 180°', () => {
    expect(comptonLambda(70, 0)).toBeCloseTo(70, 10);
    expect(comptonLambda(70, 90) - 70).toBeCloseTo(2.4263, 4);
    expect(comptonLambda(70, 180) - 70).toBeCloseTo(4.8526, 4);
  });

  it('Elektron fliegt bei Rückstreuung nach vorn, sonst schräg nach unten', () => {
    expect(recoilAngle(70, 180)).toBeCloseTo(0, 6);
    const a = recoilAngle(70, 90);
    expect(a).toBeLessThan(0);
    expect(a).toBeGreaterThan(-90);
  });
});
