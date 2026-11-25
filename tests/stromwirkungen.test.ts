import { describe, expect, it } from 'vitest';
import { bodyCurrent, current, danger, fuseBlows, power } from '../src/simulations/physik/stromwirkungen/model';

describe('Stromwirkungen und Sicherung', () => {
  it('mehr Spannung → mehr Strom', () => {
    expect(current(12, 'lampe', false)).toBeGreaterThan(current(6, 'lampe', false));
  });

  it('Kurzschluss: sehr großer Strom, Sicherung brennt durch', () => {
    const I = current(6, 'lampe', true);
    expect(I).toBeGreaterThan(10);
    expect(fuseBlows(I, 2)).toBe(true);
    expect(fuseBlows(current(6, 'lampe', false), 2)).toBe(false);
    expect(power(6, 'lampe', true)).toBe(0);
  });
});

describe('Gefahren', () => {
  it('Batterie ungefährlich, Steckdose lebensgefährlich', () => {
    expect(danger(bodyCurrent(1.5, false))).toBe('none');
    expect(danger(bodyCurrent(230, false))).toBe('deadly');
  });

  it('nasse Haut erhöht den Strom', () => {
    expect(bodyCurrent(24, true)).toBeGreaterThan(bodyCurrent(24, false));
    expect(danger(bodyCurrent(24, true))).toBe('cramp');
  });
});
