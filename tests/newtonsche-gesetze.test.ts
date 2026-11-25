import { describe, expect, it } from 'vitest';
import {
  boxDeceleration,
  checkTask,
  liftAcceleration,
  liftDuration,
  makeTask,
  motion,
  parseAnswer,
  pulleyAcceleration,
  pushedBox,
  pushOff,
  ropeForce,
  scaleReading,
  slopeThroughOrigin,
  stepBox,
} from '../src/simulations/physik/newtonsche-gesetze/model';

describe('Newton’sche Gesetze', () => {
  it('F = m · a: Zuggewicht beschleunigt beide Massen', () => {
    // 0,1 kg ziehen 0,4 kg Wagen ohne Reibung: a = 0,981 / 0,5
    expect(pulleyAcceleration(0.4, 0.1, 0, 9.81)).toBeCloseTo(1.962, 6);
    // doppelte Zugmasse: nicht doppelte Beschleunigung, weil die Gesamtmasse wächst
    expect(pulleyAcceleration(0.4, 0.2, 0, 9.81)).toBeCloseTo(3.27, 2);
  });

  it('Reibung bremst; zu wenig Zugkraft: keine Bewegung', () => {
    expect(pulleyAcceleration(0.4, 0.1, 0.1, 9.81)).toBeCloseTo((0.981 - 0.3924) / 0.5, 6);
    expect(pulleyAcceleration(1, 0.1, 0.2)).toBe(0);
  });

  it('Seilkraft ist kleiner als die Gewichtskraft des Zuggewichts', () => {
    const a = pulleyAcceleration(0.4, 0.1, 0);
    expect(ropeForce(0.1, a)).toBeCloseTo(0.4 * a, 10);
  });

  it('Trägheit: lose Kiste wird höchstens mit μ g gebremst', () => {
    expect(boxDeceleration(8, 0.3, 9.81)).toBeCloseTo(2.943, 6);
    expect(boxDeceleration(2, 0.3, 9.81)).toBe(2);
  });

  it('Wechselwirkung: gleiche Kraft, Impulse entgegengesetzt gleich', () => {
    const r = pushOff(1, 3, 6, 0.5);
    expect(r.v1).toBe(-3);
    expect(r.v2).toBe(1);
    expect(1 * r.v1 + 3 * r.v2).toBe(0);
  });

  it('Bewegungsgesetze', () => {
    expect(motion(2, 3)).toEqual({ s: 9, v: 6 });
  });
});

describe('Kräfte und Bewegung: Kiste schieben', () => {
  it('Haftreibung hält, solange F ≤ μ_H · m · g', () => {
    const r = pushedBox(150, 40, 0.5, 0.3, 0, 10);
    expect(r.sticking).toBe(true);
    expect(r.a).toBe(0);
    expect(r.friction).toBe(-150);
  });

  it('rutscht los: Gleitreibung bestimmt die resultierende Kraft', () => {
    const r = pushedBox(250, 40, 0.5, 0.3, 0, 10);
    expect(r.sticking).toBe(false);
    expect(r.friction).toBe(-120);
    expect(r.a).toBeCloseTo(130 / 40, 12);
  });

  it('gleichförmig, wenn Schub und Gleitreibung gleich groß sind', () => {
    expect(pushedBox(120, 40, 0.3, 0.3, 1, 10).a).toBeCloseTo(0, 12);
  });

  it('ohne Schub bremst die Reibung bis zum Stillstand und nicht darüber hinaus', () => {
    let s = { x: 0, v: 3 };
    for (let i = 0; i < 2000; i++) s = stepBox(s, 0, 40, 0.5, 0.3, 0.001, 10);
    expect(s.v).toBe(0);
    // v² = 2 a s mit a = μ g = 3 → s = 1,5 m
    expect(s.x).toBeCloseTo(1.5, 2);
  });

  it('ohne Reibung und ohne Schub: gleichförmig weiter (Trägheitsgesetz)', () => {
    let s = { x: 0, v: 2 };
    for (let i = 0; i < 1000; i++) s = stepBox(s, 0, 40, 0, 0, 0.001);
    expect(s.v).toBe(2);
    expect(s.x).toBeCloseTo(2, 9);
  });
});

describe('Waage im Aufzug', () => {
  it('Anzeige in Ruhe, beim Anfahren nach oben und beim Bremsen', () => {
    expect(scaleReading(60, 0, 10)).toBe(60);
    expect(scaleReading(60, 2, 10)).toBeCloseTo(72, 12);
    expect(scaleReading(60, -2, 10)).toBeCloseTo(48, 12);
  });

  it('freier Fall: schwerelos, nie negativ', () => {
    expect(scaleReading(60, -10, 10)).toBe(0);
    expect(scaleReading(60, -12, 10)).toBe(0);
  });

  it('Fahrplan: Anfahren, gleichförmig, Bremsen; am Ende steht der Aufzug', () => {
    expect(liftAcceleration(0.5, 1, 1.5)).toBe(0);
    expect(liftAcceleration(2, 1, 1.5)).toBe(1.5);
    expect(liftAcceleration(4, 1, 1.5)).toBe(0);
    expect(liftAcceleration(6, 1, 1.5)).toBe(-1.5);
    expect(liftAcceleration(2, -1, 1.5)).toBe(-1.5);
    let v = 0;
    for (let t = 0; t < liftDuration(); t += 0.001) v += liftAcceleration(t, 1, 1.5) * 0.001;
    expect(v).toBeCloseTo(0, 2);
  });

  it('Seil reißt: freier Fall mit −g', () => {
    expect(liftAcceleration(3, 1, 1.5, true, 9.81)).toBe(-9.81);
  });
});

describe('Messreihe', () => {
  it('Ausgleichsgerade durch den Ursprung', () => {
    expect(slopeThroughOrigin([[1, 2], [2, 4], [3, 6]])).toBeCloseTo(2, 12);
    expect(slopeThroughOrigin([])).toBe(0);
  });
});

describe('Übung', () => {
  it('liest Zahlen mit Komma, Punkt, Minus und Einheit', () => {
    expect(parseAnswer('2,5')).toBe(2.5);
    expect(parseAnswer(' 2.5 ')).toBe(2.5);
    expect(parseAnswer('−3')).toBe(-3);
    expect(parseAnswer('12 N')).toBe(12);
    expect(parseAnswer('abc')).toBeNull();
    expect(parseAnswer('')).toBeNull();
  });

  it('jede Aufgabe ist mit ihrer eigenen Lösung richtig und mit einer falschen nicht', () => {
    for (let n = 1; n <= 200; n++) {
      const task = makeTask(n);
      expect(Number.isFinite(task.answer)).toBe(true);
      expect(task.text.de.length).toBeGreaterThan(20);
      expect(task.text.en.length).toBeGreaterThan(20);
      expect(checkTask(task, String(task.answer))).toBe(true);
      expect(checkTask(task, String(task.answer).replace('.', ','))).toBe(true);
      expect(checkTask(task, String(task.answer * 1.5 + 1))).toBe(false);
    }
  });

  it('gleiche Nummer, gleiche Aufgabe; Arten wechseln reihum', () => {
    expect(makeTask(7)).toEqual(makeTask(7));
    const kinds = new Set(Array.from({ length: 9 }, (_, i) => makeTask(i + 1).kind));
    expect(kinds.size).toBe(8);
  });

  it('deutsche Texte mit Dezimalkomma, englische mit Punkt', () => {
    for (let n = 1; n <= 50; n++) {
      const task = makeTask(n);
      expect(task.text.de).not.toMatch(/\d\.\d/);
      expect(task.text.en).not.toMatch(/\d,\d/);
    }
  });
});
