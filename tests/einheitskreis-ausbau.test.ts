import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import { angleTask, checkAngle, exactTrig, relatedAngle, solveTrig, SPECIAL_ANGLES } from '../src/simulations/mathematik/einheitskreis/model';

describe('Modell: Einheitskreis – Symmetrien', () => {
  it('liefert die zugehörigen Winkel', () => {
    expect(relatedAngle(30, 'y')).toBe(150);
    expect(relatedAngle(30, 'o')).toBe(210);
    expect(relatedAngle(30, 'x')).toBe(330);
    expect(relatedAngle(200, 'y')).toBe(340);
    expect(relatedAngle(0, 'x')).toBe(0);
  });
  it('erfüllt sin(180° − α) = sin α und cos(180° + α) = −cos α', () => {
    for (const a of [10, 75, 130, 250]) {
      const r = (d: number) => (d * Math.PI) / 180;
      expect(Math.sin(r(relatedAngle(a, 'y')))).toBeCloseTo(Math.sin(r(a)), 12);
      expect(Math.cos(r(relatedAngle(a, 'o')))).toBeCloseTo(-Math.cos(r(a)), 12);
      expect(Math.cos(r(relatedAngle(a, 'x')))).toBeCloseTo(Math.cos(r(a)), 12);
    }
  });
});

describe('Modell: Einheitskreis – Gleichungen', () => {
  it('löst sin α = 0,5 und cos α = −0,5', () => {
    expect(solveTrig('sin', 0.5).map((x) => Math.round(x * 1e6) / 1e6)).toEqual([30, 150]);
    expect(solveTrig('cos', -0.5).map((x) => Math.round(x * 1e6) / 1e6)).toEqual([120, 240]);
    expect(solveTrig('sin', -0.5).map((x) => Math.round(x * 1e6) / 1e6)).toEqual([210, 330]);
  });
  it('hat bei ±1 nur eine Lösung und bei |c| > 1 keine', () => {
    expect(solveTrig('sin', 1)).toEqual([90]);
    expect(solveTrig('cos', -1)).toEqual([180]);
    expect(solveTrig('cos', 1)).toEqual([0]);
    expect(solveTrig('sin', 1.2)).toEqual([]);
  });
  it('sin α = 0 hat 0° und 180°', () => {
    expect(solveTrig('sin', 0).map((x) => Math.round(x * 1e6) / 1e6)).toEqual([0, 180]);
  });
});

describe('Modell: Einheitskreis – Üben', () => {
  it('erzeugt eindeutig lösbare Aufgaben', () => {
    for (let q = 1; q <= 300; q++) {
      const t = angleTask(q, seededRandom(q * 4099 + 7));
      expect(SPECIAL_ANGLES).toContain(t.answer);
      expect(checkAngle(t, t.answer)).toBe(true);
      // genau ein besonderer Winkel passt
      expect(SPECIAL_ANGLES.filter((d) => checkAngle(t, d)).length).toBe(1);
      if (t.kind === 'values') expect(t.value).toBe(exactTrig(t.answer, t.fn!));
    }
  });
});
