import { describe, expect, it } from 'vitest';
import { exactTrig, quadrant, tanDefined } from '../src/simulations/mathematik/einheitskreis/model';

/** Wandelt die exakte Schreibweise (z. B. „−√3/2“) in eine Zahl um. */
function evalExact(text: string): number {
  const sign = text.startsWith('−') ? -1 : 1;
  const body = text.replace('−', '');
  const [num, den = '1'] = body.split('/');
  const n = num!.startsWith('√') ? Math.sqrt(Number(num!.slice(1))) : Number(num);
  return (sign * n) / Number(den);
}

describe('einheitskreis: exakte Werte', () => {
  const angles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];

  it('stimmen für alle besonderen Winkel mit Math.sin/cos/tan überein', () => {
    for (const deg of angles) {
      const r = (deg * Math.PI) / 180;
      expect(evalExact(exactTrig(deg, 'sin')!)).toBeCloseTo(Math.sin(r), 12);
      expect(evalExact(exactTrig(deg, 'cos')!)).toBeCloseTo(Math.cos(r), 12);
      if (tanDefined(deg)) expect(evalExact(exactTrig(deg, 'tan')!)).toBeCloseTo(Math.tan(r), 12);
    }
  });

  it('nutzt das echte Minuszeichen', () => {
    for (const deg of angles) {
      for (const fn of ['sin', 'cos', 'tan'] as const) expect(exactTrig(deg, fn)).not.toContain('-');
    }
  });

  it('kennt 360° wie 0° und liefert null für andere Winkel', () => {
    expect(exactTrig(360, 'cos')).toBe('1');
    expect(exactTrig(360, 'sin')).toBe('0');
    expect(exactTrig(30.5, 'sin')).toBeNull();
    expect(exactTrig(40, 'tan')).toBeNull();
  });

  it('Aufgaben im Lernmaterial: sin 120° = √3/2, cos 120° = −1/2, sin 150° = 1/2', () => {
    expect(exactTrig(120, 'sin')).toBe('√3/2');
    expect(exactTrig(120, 'cos')).toBe('−1/2');
    expect(exactTrig(150, 'sin')).toBe('1/2');
  });
});

describe('einheitskreis: Quadrant und Tangens', () => {
  it('ordnet die Quadranten zu, Achsen ergeben 0', () => {
    expect(quadrant(30)).toBe(1);
    expect(quadrant(150)).toBe(2);
    expect(quadrant(225)).toBe(3);
    expect(quadrant(330)).toBe(4);
    for (const deg of [0, 90, 180, 270, 360]) expect(quadrant(deg)).toBe(0);
    expect(quadrant(0.5)).toBe(1);
    expect(quadrant(359.5)).toBe(4);
  });

  it('Tangens ist bei 90° und 270° nicht definiert, sonst schon', () => {
    expect(tanDefined(90)).toBe(false);
    expect(tanDefined(270)).toBe(false);
    for (const deg of [0, 45, 89.5, 90.5, 180, 269.5, 360]) expect(tanDefined(deg)).toBe(true);
  });
});
