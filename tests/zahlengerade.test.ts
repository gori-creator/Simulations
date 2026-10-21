import { describe, expect, it } from 'vitest';
import {
  absolute,
  change,
  compute,
  opposite,
  randomTask,
  rewrite,
  story,
  termText,
  viewRange,
  walkPlan,
} from '../src/simulations/mathematik/zahlengerade/model';
import { seededRandom } from '../src/sim-core/anim';

describe('Modell: Zahlengerade – Rechnen', () => {
  it('addiert und subtrahiert ganze Zahlen', () => {
    expect(compute(-3, 'plus', 7)).toBe(4);
    expect(compute(5, 'plus', -8)).toBe(-3);
    expect(compute(2, 'minus', -4)).toBe(6);
    expect(compute(-15, 'minus', -10)).toBe(-5);
    expect(compute(4, 'minus', 9)).toBe(-5);
    expect(compute(-20, 'minus', 20)).toBe(-40);
  });

  it('subtrahiert, indem die Gegenzahl addiert wird', () => {
    for (const a of [-7, 0, 3]) {
      for (const b of [-5, 0, 6]) {
        expect(compute(a, 'minus', b)).toBe(compute(a, 'plus', opposite(b)));
        expect(change('minus', b)).toBe(opposite(b));
      }
    }
  });

  it('kennt Gegenzahl und Betrag', () => {
    expect(opposite(-3)).toBe(3);
    expect(opposite(4)).toBe(-4);
    expect(Object.is(opposite(0), 0)).toBe(true);
    expect(absolute(-12)).toBe(12);
    expect(absolute(5)).toBe(5);
  });
});

describe('Modell: Zahlengerade – Laufmodell', () => {
  it('plus: Blick nach rechts, positive Zahl vorwärts', () => {
    expect(walkPlan('plus', 7)).toEqual({ facing: 1, turn: false, steps: 7, backward: false, dir: 1 });
  });

  it('plus und negative Zahl: rückwärts, also nach links', () => {
    expect(walkPlan('plus', -4)).toEqual({ facing: 1, turn: false, steps: 4, backward: true, dir: -1 });
  });

  it('minus: umdrehen; negative Zahl rückwärts ergibt nach rechts', () => {
    expect(walkPlan('minus', -4)).toEqual({ facing: -1, turn: true, steps: 4, backward: true, dir: 1 });
    expect(walkPlan('minus', 3)).toEqual({ facing: -1, turn: true, steps: 3, backward: false, dir: -1 });
    expect(walkPlan('minus', 0).dir).toBe(0);
  });

  it('landet immer beim Ergebnis', () => {
    for (const op of ['plus', 'minus'] as const) {
      for (const a of [-9, 0, 4]) {
        for (const b of [-6, -1, 0, 5]) {
          const w = walkPlan(op, b);
          expect(a + w.dir * w.steps).toBe(compute(a, op, b));
        }
      }
    }
  });
});

describe('Modell: Zahlengerade – Darstellung', () => {
  it('schreibt Terme mit Klammern um negative Zahlen', () => {
    expect(termText(2, 'minus', -4)).toBe('2 − (−4)');
    expect(termText(-3, 'plus', 7)).toBe('−3 + 7');
    expect(rewrite(2, 'minus', -4)).toBe('2 + 4');
    expect(rewrite(4, 'minus', 9)).toBe('4 + (−9)');
    expect(rewrite(5, 'plus', -8)).toBe('5 − 8');
    expect(rewrite(5, 'plus', 8)).toBeNull();
  });

  it('wählt einen passenden Ausschnitt mit der 0', () => {
    expect(viewRange([-3, 4])).toEqual([-5, 5]);
    expect(viewRange([12, 17])).toEqual([0, 20]);
    expect(viewRange([-40, -20])).toEqual([-45, 0]);
    const [lo, hi] = viewRange([0, 0]);
    expect(hi - lo).toBeGreaterThanOrEqual(10);
    expect(lo).toBeLessThanOrEqual(0);
    expect(hi).toBeGreaterThanOrEqual(0);
  });

  it('erzeugt zufällige Aufgaben mit ganzen Zahlen', () => {
    const rand = seededRandom(7);
    for (let i = 0; i < 50; i++) {
      const t = randomTask(rand);
      expect(Math.abs(compute(t.a, t.op, t.b))).toBeLessThanOrEqual(20);
      expect(Math.abs(t.a)).toBeLessThanOrEqual(15);
      expect(t.b).not.toBe(0);
    }
  });
});

describe('Modell: Zahlengerade – Sachsituationen', () => {
  it('beschreibt Guthaben und Schulden', () => {
    const s = story('konto', -15, 'minus', -10, 'de');
    expect(s.start).toContain('Schulden: 15 €');
    expect(s.change).toBe('Schulden von 10 € werden gestrichen.');
    expect(s.result).toBe('Neuer Kontostand: −5 €.');
    expect(story('konto', 3, 'plus', -8, 'de').change).toBe('Neue Schulden von 8 € kommen dazu.');
  });

  it('beschreibt Temperatur und Höhe über die tatsächliche Änderung', () => {
    expect(story('thermo', 4, 'minus', 9, 'de').change).toBe('Es wird um 9 °C kälter.');
    expect(story('thermo', -3, 'minus', -5, 'de').change).toBe('Es wird um 5 °C wärmer.');
    expect(story('meer', 6, 'plus', -14, 'de').result).toBe('Jetzt ist er 8 m unter dem Meeresspiegel.');
    expect(story('meer', 6, 'plus', -14, 'en').change).toBe('It dives 14 m down.');
  });
});

describe('Modell: Zahlengerade – Prüfwerte (Prüfrunde)', () => {
  it('rechnet die Prüfwerte richtig', () => {
    expect(compute(-4, 'plus', 7)).toBe(3);
    expect(compute(2, 'minus', 9)).toBe(-7);
    expect(compute(-6, 'minus', -2)).toBe(-4);
    expect(compute(-3, 'minus', -5)).toBe(2);
    expect(compute(5, 'plus', -8)).toBe(-3);
  });

  it('Pfeilmodell: positive Änderung nach rechts, negative nach links', () => {
    expect(walkPlan('plus', 7).dir).toBe(1);
    expect(walkPlan('plus', -8).dir).toBe(-1);
    expect(walkPlan('minus', 9).dir).toBe(-1);
    // −3 − (−5): Subtrahieren der negativen Zahl = Addieren der Gegenzahl → nach rechts
    expect(walkPlan('minus', -5).dir).toBe(1);
    expect(change('minus', -5)).toBe(5);
  });

  it('schreibt Terme mit echtem Minus und Klammern', () => {
    expect(termText(5, 'plus', -8)).toBe('5 + (−8)');
    expect(termText(-6, 'minus', -2)).toBe('−6 − (−2)');
    expect(rewrite(-3, 'minus', -5)).toBe('−3 + 5');
    expect(rewrite(2, 'minus', 9)).toBe('2 + (−9)');
    expect(termText(-4, 'plus', 7)).not.toContain('-');
  });

  it('Sachsituationen: Vorzeichen und Einheiten', () => {
    expect(story('thermo', 3, 'minus', 5, 'de').result).toBe('Jetzt ist es −2 °C.');
    expect(story('thermo', 3, 'minus', 5, 'en').result).toBe('Now it is −2 °C.');
    expect(story('meer', -120, 'plus', 0, 'de').start).toBe('Der Pinguin ist 120 m unter dem Meeresspiegel.');
    expect(story('meer', 0, 'plus', 0, 'de').result).toBe('Jetzt ist er genau auf Meereshöhe.');
    expect(story('konto', 10, 'minus', 25, 'de').result).toBe('Neuer Kontostand: −15 €.');
    expect(story('konto', 10, 'minus', 25, 'en').result).toBe('New balance: −€15.');
    expect(story('konto', 0, 'plus', 0, 'de').change).toBe('Es wird nichts gebucht.');
  });
});
