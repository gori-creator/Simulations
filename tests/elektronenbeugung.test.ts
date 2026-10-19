import { describe, expect, it } from 'vitest';
import {
  braggAngle,
  D1,
  D2,
  deBroglie,
  deBroglieRelativistic,
  electronSpeed,
  fitOrigin,
  kineticEnergy,
  latticeFromRing,
  latticeFromSlope,
  momentum,
  noisy,
  pickTarget,
  ringRadius,
  ringRadiusApprox,
  SCREEN_DISTANCE,
  SHARES,
} from '../src/simulations/physik/elektronenbeugung/model';
import { seededRandom } from '../src/sim-core';

describe('Modell: Elektronenbeugung an Graphit', () => {
  it('U = 4 kV: v ≈ 3,75 · 10⁷ m/s, p ≈ 3,42 · 10⁻²³ kg·m/s, λ ≈ 19,4 pm', () => {
    expect(electronSpeed(4000) / 1e7).toBeCloseTo(3.751, 3);
    expect(momentum(4000) / 1e-23).toBeCloseTo(3.4166, 3);
    expect(deBroglie(4000) * 1e12).toBeCloseTo(19.39, 2);
    expect(kineticEnergy(4000)).toBeCloseTo(6.409e-16, 18);
  });

  it('Faustformel λ ≈ 1,226 nm / √(U/V)', () => {
    for (const U of [100, 2000, 5000, 8000]) expect(deBroglie(U) * Math.sqrt(U) * 1e9).toBeCloseTo(1.2264, 3);
  });

  it('doppelte Spannung → Wellenlänge durch √2 geteilt', () => {
    expect(deBroglie(2000) / deBroglie(8000)).toBeCloseTo(2, 12);
    expect(deBroglie(3000) / deBroglie(6000)).toBeCloseTo(Math.SQRT2, 12);
  });

  it('relativistische Korrektur bei 4 kV nur etwa 0,2 %', () => {
    const rel = deBroglieRelativistic(4000) / deBroglie(4000);
    expect(rel).toBeLessThan(1);
    expect(1 - rel).toBeCloseTo(0.00196, 4);
  });

  it('Bragg: 2 d sin θ = λ; keine Reflexion für λ > 2d', () => {
    const th = braggAngle(D1, deBroglie(4000))!;
    expect(2 * D1 * Math.sin(th)).toBeCloseTo(deBroglie(4000), 20);
    expect(th).toBeCloseTo(0.04553, 4);
    expect(braggAngle(1e-10, 3e-10)).toBeNull();
    expect(braggAngle(1e-10, 0)).toBeNull();
  });

  it('Ringradien bei 4 kV und L = 13,5 cm: r₁ ≈ 12,3 mm, r₂ ≈ 21,5 mm', () => {
    expect(SCREEN_DISTANCE).toBe(0.135);
    expect(ringRadius(4000, D1)! * 1000).toBeCloseTo(12.32, 1);
    expect(ringRadius(4000, D2)! * 1000).toBeCloseTo(21.48, 1);
    // Kleinwinkelnäherung r ≈ Lλ/d weicht weniger als 1 % ab
    expect(Math.abs(ringRadiusApprox(4000, D1) / ringRadius(4000, D1)! - 1)).toBeLessThan(0.01);
    expect(ringRadius(4000, D2)! / ringRadius(4000, D1)!).toBeCloseTo(D1 / D2, 1);
  });

  it('r ∝ 1/√U: bei vierfacher Spannung halber Radius (Kleinwinkel)', () => {
    expect(ringRadiusApprox(2000, D1) / ringRadiusApprox(8000, D1)).toBeCloseTo(2, 12);
  });

  it('rechnet aus Ringradius bzw. Steigung auf den Netzebenenabstand zurück', () => {
    const r = ringRadiusApprox(5000, D1);
    expect(latticeFromRing(r, 5000)).toBeCloseTo(D1, 20);
    const pts = [2000, 3000, 4000, 5000, 6000, 7000, 8000].map((U) => [1 / Math.sqrt(U), ringRadiusApprox(U, D2)] as const);
    const k = fitOrigin(pts)!;
    expect(latticeFromSlope(k) * 1e9).toBeCloseTo(0.123, 6);
    expect(fitOrigin([])).toBeNull();
  });

  it('Messrauschen und Zufallsziele sind plausibel', () => {
    const rand = seededRandom(7);
    expect(noisy(10, 0, rand)).toBe(10);
    let sum = 0;
    for (let i = 0; i < 2000; i++) sum += noisy(10, 0.02, rand);
    expect(sum / 2000).toBeCloseTo(10, 1);
    const count = [0, 0, 0, 0];
    for (let i = 0; i < 20000; i++) count[pickTarget(rand)]!++;
    expect(SHARES[0] + SHARES[1] + SHARES[2] + SHARES[3]).toBeCloseTo(1, 12);
    expect(count[1]! / 20000).toBeCloseTo(SHARES[1], 1);
    expect(count[2]! / 20000).toBeCloseTo(SHARES[2], 1);
  });
});
