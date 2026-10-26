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
  pointKind,
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

describe('Modell: Stehende Wellen – Prüfwerte, Aufgaben und Grenzen (Prüfrunde)', () => {
  it('Aufgabenwerte: Gitarre, Knoten bei 660 Hz, Pfeifen, Melde, Kundtsches Rohr', () => {
    // A1: λ₁ = 1,3 m, f₁ = 220 Hz; λ₃ = 0,433 m, f₃ = 660 Hz
    expect(eigenWavelength('ff', 3, 0.65)).toBeCloseTo(0.4333, 4);
    // A2: λ = 286/660 = 0,4333 m → Knoten 0; 0,217; 0,433; 0,65 m, Bäuche 0,108; 0,325; 0,542 m
    const lam = 286 / 660;
    expect(reflectionNodes('fix', lam, 0.65).map((d) => +d.toFixed(3))).toEqual([0, 0.217, 0.433, 0.65]);
    expect(reflectionAntinodes('fix', lam, 0.65).map((d) => +d.toFixed(3))).toEqual([0.108, 0.325, 0.542]);
    // A3: offen 340, 680, 1020 Hz; gedackt 170, 510, 850 Hz
    expect([1, 2, 3].map((n) => eigenFrequency(pipeBc('open'), n, 0.5, 340))).toEqual([340, 680, 1020].map((x) => expect.closeTo(x, 9)));
    expect([1, 2, 3].map((n) => eigenFrequency(pipeBc('closed'), n, 0.5, 340))).toEqual([170, 510, 850].map((x) => expect.closeTo(x, 9)));
    // A4: f₁ = 100 Hz, bei 300 Hz drei Bäuche, Knotenabstand 0,4 m; dazwischen keine Resonanz
    expect(refFrequency(1.2, 240)).toBeCloseTo(100, 9);
    expect(antinodes('ff', 3)).toHaveLength(3);
    expect(eigenWavelength('ff', 3, 1.2) / 2).toBeCloseTo(0.4, 12);
    expect(resonanceAmplitude(150 / 100)).toBeLessThan(1.2);
    // A6: Kundtsches Rohr (beidseitig geschlossen), L = 0,51 m, n = 6 → 2000 Hz, Knotenabstand 8,5 cm
    expect(eigenFrequency(pipeBc('shut'), 6, 0.51, 340)).toBeCloseTo(2000, 9);
    expect(eigenWavelength(pipeBc('shut'), 6, 0.51) / 2).toBeCloseTo(0.085, 12);
  });

  it('Reglergrenzen: tiefste und höchste Grundfrequenz, große n', () => {
    // L = 1,5 m, c = 100 m/s, fest–lose: f₁ = 100/6 = 16,7 Hz; n = 6 → 11 · f₁ = 183,3 Hz
    expect(fundamental('fl', 1.5, 100)).toBeCloseTo(16.667, 3);
    expect(eigenFrequency('fl', 6, 1.5, 100)).toBeCloseTo(183.333, 3);
    // L = 0,3 m, c = 500 m/s: f₁ = 833,3 Hz, f₆ = 5000 Hz
    expect(fundamental('ff', 0.3, 500)).toBeCloseTo(833.333, 3);
    expect(eigenFrequency('ff', 6, 0.3, 500)).toBeCloseTo(5000, 9);
    for (const bc of ['ff', 'fl', 'll'] as const) {
      expect(nodes(bc, 6).every((x) => x >= 0 && x <= 1)).toBe(true);
      expect(antinodes(bc, 6).every((x) => x >= 0 && x <= 1)).toBe(true);
    }
    // f = 10 Hz, c = 500 m/s: λ = 50 m ≫ L = 0,3 m → nur der Knoten am Ende, kein Bauch auf dem Seil
    expect(reflectionNodes('fix', 50, 0.3)).toEqual([0]);
    expect(reflectionAntinodes('fix', 50, 0.3)).toEqual([]);
    expect(reflectionNodes('free', 50, 0.3)).toEqual([]);
  });

  it('Punkt P: Knoten, Bauch oder dazwischen (Spielraum 1 % von λ)', () => {
    const lam = 286 / 660;
    // Start: d = 0,11 m ≈ λ/4 = 0,108 m → Bauch, A = 2 · |sin(2π · 0,254)| = 2,00 ŷ
    expect(pointKind('fix', 0.11, lam)).toBe('anti');
    expect(reflectionAmplitude('fix', 0.11, lam)).toBeCloseTo(1.9994, 3);
    // d = 0,22 m ≈ λ/2 = 0,217 m (nächster Reglerwert) → Knoten am festen, Bauch am losen Ende
    expect(pointKind('fix', 0.22, lam)).toBe('node');
    expect(pointKind('free', 0.22, lam)).toBe('anti');
    expect(pointKind('fix', 0.16, lam)).toBe('mid');
    // f = 1500 Hz, c = 100 m/s: d/λ = 1,65 → A = 2 · |sin(3,3π)| = 1,62 ŷ, dazwischen
    expect(reflectionAmplitude('fix', 0.11, 100 / 1500)).toBeCloseTo(1.618, 3);
    expect(pointKind('fix', 0.11, 100 / 1500)).toBe('mid');
  });
});
