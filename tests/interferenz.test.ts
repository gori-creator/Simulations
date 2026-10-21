import { describe, expect, it } from 'vitest';
import {
  circularWave,
  classify,
  farFieldAngle,
  frequency,
  hyperbola,
  maxLines,
  maxOrder,
  minLines,
  paths,
  phaseRad,
  phasorSum,
  resultantAmplitude,
  WAVE_SPEED,
} from '../src/simulations/physik/interferenz/model';

describe('Modell: Interferenz zweier Kreiswellen', () => {
  it('berechnet Wegstrecken und Gangunterschied', () => {
    // d = 6 cm, P = (3 | 4): s₁ = √(36 + 16), s₂ = 4
    const p = paths(3, 4, 6);
    expect(p.s1).toBeCloseTo(Math.sqrt(52), 12);
    expect(p.s2).toBeCloseTo(4, 12);
    expect(p.ds).toBeCloseTo(Math.sqrt(52) - 4, 12);
    // auf der Mittelsenkrechten ist Δs = 0
    expect(paths(0, 7.3, 4).ds).toBeCloseTo(0, 12);
  });

  it('Δs = λ/2 → Auslöschung, Δs = λ → Verstärkung (gleichphasig)', () => {
    expect(resultantAmplitude(1, 2)).toBeCloseTo(0, 12);
    expect(resultantAmplitude(2, 2)).toBeCloseTo(2, 12);
    expect(resultantAmplitude(0, 2, 0, 1.5)).toBeCloseTo(3, 12);
    // Δs = λ/4: A = 2ŷ · cos 45° = √2 ŷ
    expect(resultantAmplitude(0.5, 2)).toBeCloseTo(Math.SQRT2, 12);
  });

  it('gegenphasige Erreger: Mittellinie ist Knotenlinie', () => {
    expect(resultantAmplitude(0, 2, Math.PI)).toBeCloseTo(0, 12);
    expect(resultantAmplitude(1, 2, Math.PI)).toBeCloseTo(2, 12);
    const nodes = minLines(6, 2, Math.PI);
    expect(nodes.some((l) => Math.abs(l.ds) < 1e-12)).toBe(true);
    expect(maxLines(6, 2, Math.PI).some((l) => Math.abs(l.ds) < 1e-12)).toBe(false);
  });

  it('d = 3λ → Maxima k = −3 … 3 (7 Bauchlinien inkl. Verbindungsachse)', () => {
    const max = maxLines(6, 2);
    expect(max.map((l) => l.k)).toEqual([-3, -2, -1, 0, 1, 2, 3]);
    expect(max.filter((l) => l.axis).map((l) => l.k)).toEqual([-3, 3]);
    expect(maxOrder(6, 2)).toBe(3);
    // Knotenlinien Δs = (k + ½) · λ: k = −3 … 2, also 6 Stück
    const min = minLines(6, 2);
    expect(min.map((l) => l.ds)).toEqual([-5, -3, -1, 1, 3, 5]);
    expect(min.every((l) => !l.axis)).toBe(true);
  });

  it('d < λ/2: keine Knotenlinie, nur das Maximum 0. Ordnung', () => {
    expect(minLines(0.8, 2)).toHaveLength(0);
    expect(maxLines(0.8, 2).map((l) => l.k)).toEqual([0]);
  });

  it('Phasenverschiebung verschiebt alle Linien um −Δφ/2π · λ', () => {
    const max = maxLines(6, 2, Math.PI / 2);
    // Δs = (k − ¼) · 2 cm, |Δs| ≤ 6
    expect(max.map((l) => l.ds)).toEqual([-4.5, -2.5, -0.5, 1.5, 3.5, 5.5]);
  });

  it('Hyperbelpunkte erfüllen s₁ − s₂ = Δs', () => {
    for (const ds of [-2.5, 0, 1, 3.9]) {
      for (const [x, y] of hyperbola(8, ds, -5, 12, 40)) {
        expect(paths(x, y, 8).ds).toBeCloseTo(ds, 9);
      }
    }
    // entartet: Verbindungsachse rechts von E₂
    const ray = hyperbola(6, 6, 0, 10, 10, 20);
    expect(ray[0]).toEqual([3, 0]);
    expect(ray[1]).toEqual([20, 0]);
  });

  it('Fernfeld: sin α = Δs/d ist die Richtung der Asymptote', () => {
    // d = 3λ: sin α₁ = 1/3
    expect(farFieldAngle(2, 6)).toBeCloseTo(Math.asin(1 / 3), 12);
    expect(farFieldAngle(6, 6)).toBeCloseTo(Math.PI / 2, 12);
    expect(farFieldAngle(7, 6)).toBeNull();
    // weit draußen nähert sich die Hyperbel dieser Richtung
    const pts = hyperbola(6, 2, 0, 2000, 10);
    const [x, y] = pts[pts.length - 1]!;
    expect(Math.atan2(x, y)).toBeCloseTo(Math.asin(1 / 3), 3);
  });

  it('Zeigeraddition und Einordnung', () => {
    expect(phasorSum(1, 1, 0)).toBeCloseTo(2, 12);
    expect(phasorSum(1, 1, Math.PI)).toBeCloseTo(0, 12);
    expect(phasorSum(3, 4, Math.PI / 2)).toBeCloseTo(5, 12);
    expect(classify(1)).toBe('max');
    expect(classify(0.001)).toBe('min');
    expect(classify(0.5)).toBe('partial');
  });

  it('Frequenz und Wellenfront', () => {
    expect(frequency(2)).toBeCloseTo(WAVE_SPEED / 2, 12);
    // vor der Front ist alles in Ruhe, weit dahinter volle Amplitude
    expect(circularWave(3, 7, 2)).toBeCloseTo(0, 12);
    expect(circularWave(3, 1.25, 2)).toBeCloseTo(Math.sin(2 * Math.PI * (3 - 0.625)), 12);
  });
});

describe('Interferenz: Prüfwerte, Aufgaben und Sonderfälle (Prüfrunde)', () => {
  it('360° ist gleichphasig: gleiche Linien und Ordnungen wie 0°', () => {
    expect(phaseRad(360)).toBe(0);
    expect(phaseRad(180)).toBeCloseTo(Math.PI, 12);
    expect(phaseRad(-90)).toBeCloseTo((3 * Math.PI) / 2, 12);
    expect(maxLines(6, 2, phaseRad(360)).map((l) => l.k)).toEqual([-3, -2, -1, 0, 1, 2, 3]);
  });

  it('Aufgaben 1, 2 und 4: P = (3 | 8), d = 6 cm', () => {
    const p = paths(3, 8, 6);
    expect(p.s1).toBeCloseTo(10, 12);
    expect(p.s2).toBeCloseTo(8, 12);
    expect(resultantAmplitude(p.ds, 2)).toBeCloseTo(2, 12);
    // λ = 1,6 cm: Δs/λ = 1,25 → A = 2 · |cos(1,25π)| = √2
    expect(resultantAmplitude(p.ds, 1.6)).toBeCloseTo(Math.SQRT2, 12);
    // gegenphasig: Auslöschung in P, 6 Bauchlinien Δs = ±1, ±3, ±5
    expect(resultantAmplitude(p.ds, 2, Math.PI)).toBeCloseTo(0, 12);
    expect(maxLines(6, 2, Math.PI).map((l) => l.ds)).toEqual([-5, -3, -1, 1, 3, 5]);
  });

  it('Aufgabe 3: d = 7 cm, λ = 2 cm → 7 Bauch-, 8 Knotenlinien (2 auf der Achse)', () => {
    expect(maxLines(7, 2)).toHaveLength(7);
    expect(maxOrder(7, 2)).toBe(3);
    const min = minLines(7, 2);
    expect(min.map((l) => l.ds)).toEqual([-7, -5, -3, -1, 1, 3, 5, 7]);
    expect(min.filter((l) => l.axis)).toHaveLength(2);
  });

  it('Anzahl der Bauchlinien bei Gleichphasigkeit: 2 · ⌊d/λ⌋ + 1', () => {
    const cases: [number, number][] = [[6, 2], [7, 2], [4, 1.2], [12, 1.5], [14, 1], [0.5, 4], [0.8, 2.4], [5, 2], [4.2, 1.4]];
    for (const [d, lam] of cases) {
      expect(maxLines(d, lam)).toHaveLength(2 * maxOrder(d, lam) + 1);
    }
  });

  it('Aufgaben 5 und 6: Fernfeldwinkel', () => {
    const deg = (r: number | null) => ((r ?? NaN) * 180) / Math.PI;
    expect(deg(farFieldAngle(1.2, 4))).toBeCloseTo(17.46, 2);
    expect(deg(farFieldAngle(2.4, 4))).toBeCloseTo(36.87, 2);
    expect(deg(farFieldAngle(3.6, 4))).toBeCloseTo(64.16, 2);
    expect(farFieldAngle(4.8, 4)).toBeNull();
    // α₁ = 23,6° bei d = 5 cm → λ ≈ 2,0 cm → f = 10 Hz
    expect(5 * Math.sin((23.6 * Math.PI) / 180)).toBeCloseTo(2.0, 2);
    expect(frequency(2)).toBeCloseTo(10, 12);
  });

  it('Aufgabe 7: 90° Vorsprung von E₂ verschiebt die Mitte zu E₁', () => {
    const max = maxLines(6, 2, phaseRad(90));
    expect(max.map((l) => l.ds)).toEqual([-4.5, -2.5, -0.5, 1.5, 3.5, 5.5]);
    expect(max.find((l) => l.k === 0)!.ds).toBeCloseTo(-0.5, 12);
  });

  it('Sonderfälle: d < λ/2 gegenphasig, d ≤ 0, Reglergrenzen', () => {
    // d < λ/2 gegenphasig: nur die Knotenlinie in der Mitte, keine Bauchlinie
    expect(minLines(0.8, 2.4, Math.PI).map((l) => l.ds)).toEqual([0]);
    expect(maxLines(0.8, 2.4, Math.PI)).toHaveLength(0);
    // ohne Abstand keine Linien (kein Absturz)
    expect(maxLines(0, 2)).toEqual([]);
    expect(minLines(-1, 2)).toEqual([]);
    expect(paths(0, 5, 0).ds).toBe(0);
    // Reglergrenzen: d = 14 cm, λ = 1 cm → 29 Bauch-, 28 Knotenlinien
    expect(maxLines(14, 1)).toHaveLength(29);
    expect(minLines(14, 1)).toHaveLength(28);
    // d = 0,5 cm, λ = 4 cm → nur k = 0
    expect(maxLines(0.5, 4).map((l) => l.k)).toEqual([0]);
    expect(minLines(0.5, 4)).toHaveLength(0);
  });

  it('Startzustand: P = (3 | 10) → Δs = 0,83 λ, A ≈ 1,72 ŷ', () => {
    const p = paths(3, 10, 6);
    expect(p.s1).toBeCloseTo(Math.sqrt(136), 12);
    expect(p.ds / 2).toBeCloseTo(0.831, 3);
    expect(resultantAmplitude(p.ds, 2)).toBeCloseTo(1.7245, 3);
  });
});
