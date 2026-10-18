import { describe, expect, it } from 'vitest';
import { inverse, ratio, roles, sides, trig, type Fn } from '../src/simulations/mathematik/sin-cos-tan-dreieck/model';

describe('Modell: Sinus, Kosinus und Tangens im rechtwinkligen Dreieck', () => {
  it('α = 30°, c = 6 cm: Gegenkathete 3 cm, sin 30° = 0,5', () => {
    const s = sides({ alpha: 30, c: 6 });
    expect(s.a).toBeCloseTo(3, 12);
    expect(s.b).toBeCloseTo(3 * Math.sqrt(3), 12);
    expect(ratio({ alpha: 30, c: 6 }, 'a', 'sin')).toBeCloseTo(0.5, 12);
  });
  it('Schulbuchwerte: sin 35° ≈ 0,574, cos 35° ≈ 0,819, tan 45° = 1, tan 70° ≈ 2,747', () => {
    expect(trig('sin', 35)).toBeCloseTo(0.5736, 4);
    expect(trig('cos', 35)).toBeCloseTo(0.8192, 4);
    expect(trig('tan', 45)).toBeCloseTo(1, 12);
    expect(trig('tan', 70)).toBeCloseTo(2.7475, 4);
  });
  it('Bezugswinkel β: Gegenkathete und Ankathete tauschen', () => {
    const t = { alpha: 35, c: 6 };
    const ra = roles(t, 'a');
    const rb = roles(t, 'b');
    expect(rb.opp).toBe(ra.adj);
    expect(rb.adj).toBe(ra.opp);
    expect(rb.angle).toBe(55);
    expect(ratio(t, 'b', 'cos')).toBeCloseTo(trig('cos', 55), 12);
  });
  it('Verhältnis hängt nur vom Winkel ab (ähnliche Dreiecke)', () => {
    for (const f of ['sin', 'cos', 'tan'] as Fn[]) {
      for (const c of [2, 4.5, 10]) expect(ratio({ alpha: 40, c }, 'a', f)).toBeCloseTo(trig(f, 40), 12);
    }
  });
  it('Umkehrung: aus dem Verhältnis den Winkel', () => {
    expect(inverse('sin', 0.5)).toBeCloseTo(30, 10);
    expect(inverse('cos', 0.5)).toBeCloseTo(60, 10);
    expect(inverse('tan', 1)).toBeCloseTo(45, 10);
    // Leiter: 5 m lang, 4,70 m hoch → α ≈ 70°
    expect(inverse('sin', 4.7 / 5)).toBeCloseTo(70.05, 1);
  });
  it('Plausibilität: Zusammenhänge für zufällige Winkel', () => {
    for (let i = 0; i < 100; i++) {
      const al = 1 + Math.random() * 88;
      const c = 2 + Math.random() * 8;
      const t = { alpha: al, c };
      const s = sides(t);
      expect(s.a ** 2 + s.b ** 2).toBeCloseTo(c * c, 9);
      expect(ratio(t, 'a', 'tan')).toBeCloseTo(ratio(t, 'a', 'sin') / ratio(t, 'a', 'cos'), 9);
      expect(ratio(t, 'a', 'sin') ** 2 + ratio(t, 'a', 'cos') ** 2).toBeCloseTo(1, 12);
      expect(ratio(t, 'a', 'sin')).toBeCloseTo(ratio(t, 'b', 'cos'), 12);
    }
  });
});
