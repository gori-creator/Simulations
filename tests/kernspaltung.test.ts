import { describe, expect, it } from 'vitest';
import {
  bindingPerNucleon,
  chain,
  channelBalanced,
  channelEnergy,
  CHANNELS,
  checkTask,
  coalEquivalent,
  collisionsNeeded,
  curve,
  E_THERMAL,
  energyAfter,
  fissionEnergy,
  fusionEnergy,
  householdYears,
  makeTask,
  massDefect,
  multiplication,
  remaining,
  stableZ,
  uraniumHeat,
  WASTE,
  xi,
} from '../src/simulations/physik/kernspaltung/model';

describe('Kernspaltung', () => {
  it('Bindungsenergie pro Nukleon: Maximum bei Eisen (≈ 8,8 MeV)', () => {
    let best = 20;
    for (let A = 20; A <= 240; A++) if (bindingPerNucleon(A) > bindingPerNucleon(best)) best = A;
    expect(best).toBeGreaterThan(50);
    expect(best).toBeLessThan(70);
    expect(bindingPerNucleon(56)).toBeCloseTo(8.8, 0);
    expect(bindingPerNucleon(235)).toBeCloseTo(7.6, 0);
  });

  it('stabile Kerne: mehr Neutronen bei großen Kernen', () => {
    expect(Math.abs(stableZ(56) - 26)).toBeLessThanOrEqual(1);
    expect(stableZ(238)).toBeLessThan(238 / 2);
  });

  it('Spaltung liefert etwa 170–200 MeV, Fusion D+T etwa 17,6 MeV', () => {
    expect(fissionEnergy()).toBeGreaterThan(150);
    expect(fissionEnergy()).toBeLessThan(210);
    expect(fusionEnergy()).toBeCloseTo(17.6, 0);
    expect(curve(4)).toBeCloseTo(7.07, 2);
  });

  it('Kettenreaktion: k = 1 bleibt konstant, k > 1 wächst exponentiell', () => {
    expect(chain(100, 1, 10)).toBe(100);
    expect(chain(1, 2, 10)).toBe(1024);
    expect(multiplication(2.5, 0.4)).toBeCloseTo(1, 12);
  });
});

describe('Spaltkanäle, Massendefekt, Kraftwerk', () => {
  it('alle Spaltkanäle erhalten Nukleonen- und Protonenzahl', () => {
    for (const c of CHANNELS) expect(channelBalanced(c)).toBe(true);
  });
  it('jede Spaltung setzt etwa 150–210 MeV frei', () => {
    for (const c of CHANNELS) {
      const e = channelEnergy(c);
      expect(e).toBeGreaterThan(150);
      expect(e).toBeLessThan(210);
    }
  });
  it('Massendefekt: D-T etwa 17,6 MeV, Sonne etwa 0,7 % der Masse', () => {
    expect(massDefect('dt').E).toBeCloseTo(17.6, 1);
    expect(massDefect('sonne').share).toBeGreaterThan(0.006);
    expect(massDefect('sonne').share).toBeLessThan(0.008);
    expect(massDefect('spaltung').E).toBeGreaterThan(150);
  });
  it('1 g Uran-235 liefert etwa 23 MWh, so viel wie fast 3 t Kohle', () => {
    const J = uraniumHeat(1);
    expect(J / 3.6e9).toBeGreaterThan(21);
    expect(J / 3.6e9).toBeLessThan(24);
    expect(coalEquivalent(J) / 1000).toBeCloseTo(2.8, 0);
    expect(householdYears(J)).toBeGreaterThan(1.5);
  });
});

describe('Übung', () => {
  it('ist reproduzierbar und wechselt die Aufgabenarten', () => {
    expect(makeTask(8)).toEqual(makeTask(8));
    expect(new Set(Array.from({ length: 16 }, (_, i) => makeTask(i + 1).kind)).size).toBe(8);
  });
  it('erkennt die hinterlegte Antwort', () => {
    for (let i = 1; i <= 120; i++) {
      const t = makeTask(i);
      const v = t.tol === 0 ? String(t.answer) : String(Math.round(t.answer * 1000) / 1000).replace('.', ',');
      expect(checkTask(t, v)).toBe(true);
      expect(checkTask(t, String(t.answer * 3 + 1))).toBe(false);
      if (t.choices) expect(t.answer).toBeLessThanOrEqual(t.choices.length);
    }
    expect(checkTask(makeTask(1), 'MeV')).toBeNull();
  });
  it('Texte: deutsch mit Komma, englisch mit Punkt', () => {
    for (let i = 1; i <= 120; i++) {
      const t = makeTask(i);
      expect(t.text.en + t.solution.en).not.toMatch(/\d,\d/);
      expect(t.text.de + t.solution.de).not.toMatch(/\d\.\d/);
    }
  });
});

describe('Moderator und Abfall', () => {
  it('Wasserstoff braucht etwa 18, Graphit etwa 115 Stöße', () => {
    expect(Math.round(collisionsNeeded(1))).toBe(18);
    expect(Math.round(collisionsNeeded(12))).toBeGreaterThan(110);
    expect(Math.round(collisionsNeeded(12))).toBeLessThan(120);
    expect(collisionsNeeded(207)).toBeGreaterThan(1500);
    expect(xi(1)).toBe(1);
    expect(energyAfter(1, collisionsNeeded(1))).toBeCloseTo(E_THERMAL, 9);
  });
  it('Halbwertszeiten: nach einer Halbwertszeit die Hälfte', () => {
    for (const w of WASTE) expect(remaining(w.T, w.T)).toBeCloseTo(0.5, 9);
    expect(remaining(30.1, 100)).toBeCloseTo(0.1, 1);
  });
  it('neue Übungsarten haben eine gültige Antwort', () => {
    for (let n = 1; n <= 80; n++) {
      const t = makeTask(n);
      if (t.kind === 'moderator' || t.kind === 'halflife') expect(checkTask(t, String(t.answer).replace('.', ','))).toBe(true);
    }
  });
});
