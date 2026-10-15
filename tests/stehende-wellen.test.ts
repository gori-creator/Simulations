import { describe, expect, it } from 'vitest';
import {
  antinodes,
  DAMPING,
  DrivenString,
  drivenDisplacement,
  eigenFrequency,
  eigenNu,
  eigenWavelength,
  fundamental,
  harmonic,
  modeShape,
  nodes,
  pipeBc,
  reflectionAmplitude,
  reflectionAntinodes,
  reflectionNodes,
  refFrequency,
  resonanceAmplitude,
  travelling,
} from '../src/simulations/physik/stehende-wellen/model';

describe('Modell: Stehende Wellen – Eigenfrequenzen', () => {
  it('Saite beidseitig fest: L = 0,65 m, c = 286 m/s → f₁ = 220 Hz, f₂ = 440 Hz', () => {
    expect(eigenFrequency('ff', 1, 0.65, 286)).toBeCloseTo(220, 9);
    expect(eigenFrequency('ff', 2, 0.65, 286)).toBeCloseTo(440, 9);
    expect(eigenFrequency('ff', 3, 0.65, 286)).toBeCloseTo(660, 9);
    expect(eigenWavelength('ff', 1, 0.65)).toBeCloseTo(1.3, 12);
  });

  it('gedackte Pfeife: L = 0,5 m, c = 340 m/s → f₁ = 170 Hz, nur ungerade Vielfache', () => {
    const bc = pipeBc('closed');
    expect(bc).toBe('fl');
    expect(fundamental(bc, 0.5, 340)).toBeCloseTo(170, 9);
    const f = [1, 2, 3, 4].map((n) => eigenFrequency(bc, n, 0.5, 340));
    expect(f[1]).toBeCloseTo(510, 9);
    expect(f[2]).toBeCloseTo(850, 9);
    for (const fn of f) expect(Math.round(fn / 170) % 2).toBe(1);
    expect([1, 2, 3].map((n) => harmonic(bc, n))).toEqual([1, 3, 5]);
    expect(eigenWavelength(bc, 1, 0.5)).toBeCloseTo(2, 12); // L = λ/4
  });

  it('offene Pfeife wie beidseitig lose: alle Vielfachen', () => {
    expect(pipeBc('open')).toBe('ll');
    expect(eigenFrequency('ll', 1, 0.5, 340)).toBeCloseTo(340, 9);
    expect(eigenFrequency('ll', 2, 0.5, 340)).toBeCloseTo(680, 9);
  });

  it('Bezugsfrequenz und dimensionslose Frequenz', () => {
    expect(refFrequency(0.65, 286)).toBeCloseTo(220, 9);
    expect(eigenNu('ff', 3)).toBe(3);
    expect(eigenNu('fl', 2)).toBe(1.5);
    expect(eigenFrequency('fl', 2, 0.65, 286)).toBeCloseTo(1.5 * refFrequency(0.65, 286), 9);
  });
});

describe('Modell: Stehende Wellen – Knoten und Bäuche', () => {
  it('beidseitig fest: Knoten bei x = k · λ/2, n + 1 Knoten und n Bäuche', () => {
    const L = 0.65;
    const lam = eigenWavelength('ff', 3, L);
    const k = nodes('ff', 3).map((x) => x * L);
    expect(k).toHaveLength(4);
    k.forEach((x, i) => expect(x).toBeCloseTo((i * lam) / 2, 12));
    expect(antinodes('ff', 3)).toHaveLength(3);
    for (const x of nodes('ff', 3)) expect(modeShape('ff', 3, x)).toBeCloseTo(0, 10);
    for (const x of antinodes('ff', 3)) expect(Math.abs(modeShape('ff', 3, x))).toBeCloseTo(1, 12);
  });

  it('fest–lose: Knoten am festen, Bauch am losen Ende', () => {
    for (const n of [1, 2, 3, 4]) {
      const k = nodes('fl', n);
      const b = antinodes('fl', n);
      expect(k[0]).toBe(0);
      expect(b[b.length - 1]).toBeCloseTo(1, 12);
      expect(k).toHaveLength(n);
      expect(b).toHaveLength(n);
      for (const x of k) expect(modeShape('fl', n, x)).toBeCloseTo(0, 10);
      for (const x of b) expect(Math.abs(modeShape('fl', n, x))).toBeCloseTo(1, 12);
    }
  });

  it('lose–lose: Bäuche an beiden Enden', () => {
    expect(antinodes('ll', 2)).toEqual([0, 0.5, 1]);
    expect(nodes('ll', 2)).toEqual([0.25, 0.75]);
  });
});

describe('Modell: Stehende Wellen – Reflexion', () => {
  it('festes Ende: Knoten bei d = k · λ/2, Überlagerung dort immer 0', () => {
    const lam = 0.4;
    const ks = reflectionNodes('fix', lam, 1);
    expect(ks.map((d) => +d.toFixed(10))).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1]);
    for (const d of ks) expect(reflectionAmplitude('fix', d, lam)).toBeCloseTo(0, 9);
    expect(reflectionAmplitude('fix', lam / 4, lam)).toBeCloseTo(2, 12);
  });

  it('loses Ende: Bauch am Ende, Knoten bei d = λ/4 + k · λ/2', () => {
    const lam = 0.4;
    expect(reflectionAmplitude('free', 0, lam)).toBeCloseTo(2, 12);
    expect(reflectionNodes('free', lam, 0.5).map((d) => +d.toFixed(10))).toEqual([0.1, 0.3, 0.5]);
    expect(reflectionAntinodes('free', lam, 0.5).map((d) => +d.toFixed(10))).toEqual([0, 0.2, 0.4]);
  });

  it('hinlaufende + reflektierte Welle ergeben nach Durchlauf der Fronten die stehende Welle', () => {
    const nu = 3; // λ̂ = 2/3
    const tau = 3;
    for (const theta of [0, 0.7, 2.1, 4]) {
      for (const xh of [0, 0.2, 1 / 3, 0.5, 2 / 3, 0.9, 1]) {
        const fix = travelling('fix', nu, xh, tau, theta);
        const d = 1 - xh;
        const kd = Math.PI * nu * d;
        const u = theta - Math.PI * nu;
        expect(fix.yh + fix.yr).toBeCloseTo(2 * Math.sin(kd) * Math.cos(u), 9);
        const free = travelling('free', nu, xh, tau, theta);
        expect(free.yh + free.yr).toBeCloseTo(2 * Math.cos(kd) * Math.sin(u), 9);
      }
    }
  });

  it('vor Ankunft der Front ist das Seil in Ruhe, vor der Reflexion gibt es keine rücklaufende Welle', () => {
    const w = travelling('fix', 2, 0.8, 0.2, 1.3);
    expect(Math.abs(w.yh)).toBe(0);
    expect(Math.abs(w.yr)).toBe(0);
    const w2 = travelling('fix', 2, 0.2, 0.6, 1.3);
    expect(Math.abs(w2.yh)).toBeGreaterThan(0);
    expect(Math.abs(w2.yr)).toBe(0);
  });
});

describe('Modell: Stehende Wellen – Resonanz (Melde)', () => {
  it('Resonanzüberhöhung bei ν = n, klein dazwischen', () => {
    const peak = resonanceAmplitude(2);
    expect(peak).toBeGreaterThan(7);
    expect(peak).toBeCloseTo(1 / Math.sinh(DAMPING / 2), 0);
    expect(resonanceAmplitude(1.5)).toBeLessThan(2);
    expect(resonanceAmplitude(1)).toBeGreaterThan(resonanceAmplitude(0.8) * 3);
    // sehr langsam: Seil folgt dem Erreger
    expect(resonanceAmplitude(0.01)).toBeCloseTo(1, 2);
  });

  it('Randwerte des eingeschwungenen Profils', () => {
    for (const theta of [0.3, 1.2]) {
      expect(drivenDisplacement(1.37, 0, theta)).toBeCloseTo(Math.sin(theta), 9);
      expect(drivenDisplacement(1.37, 1, theta)).toBeCloseTo(0, 9);
    }
  });

  it('finite Differenzen schwingen sich auf die eingeschwungene Amplitude ein', () => {
    for (const nu of [1, 1.5]) {
      const s = new DrivenString(120);
      s.rest();
      const steps = Math.round(40 / s.dt); // 40 T₁ ≫ Abklingzeit
      let m = 0;
      for (let i = 0; i < steps; i++) {
        s.step(nu);
        if (i > steps - Math.round(2 / nu / s.dt)) m = Math.max(m, s.maxAbs());
      }
      expect(m / resonanceAmplitude(nu)).toBeGreaterThan(0.93);
      expect(m / resonanceAmplitude(nu)).toBeLessThan(1.07);
    }
  });

  it('der eingeschwungene Startzustand bleibt eingeschwungen', () => {
    const s = new DrivenString(120);
    s.theta = 0.4;
    s.setSteady(2);
    const a0 = resonanceAmplitude(2);
    let m = 0;
    const steps = Math.round(3 / s.dt);
    for (let i = 0; i < steps; i++) {
      s.step(2);
      m = Math.max(m, s.maxAbs());
    }
    expect(m / a0).toBeGreaterThan(0.95);
    expect(m / a0).toBeLessThan(1.05);
  });
});
