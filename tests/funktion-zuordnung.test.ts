import { describe, expect, it } from 'vitest';
import {
  analyze,
  countProfile,
  curvePaths,
  curveYs,
  CURVES,
  depressedCubic,
  exampleMapping,
  IS_FUNCTION,
  REVERSE_RULE,
  reverseMapping,
  targetsOf,
  toggleArrow,
  WITNESS,
} from '../src/simulations/mathematik/funktion-zuordnung/model';

describe('Modell: Funktion oder nicht?', () => {
  it('erkennt „Zahl → Quadrat“ als Funktion und die Umkehrung als keine', () => {
    const m = exampleMapping('square');
    const a = analyze(m);
    expect(a.isFunction).toBe(true);
    expect(a.out).toEqual([1, 1, 1, 1, 1]);
    // Bei 1 und 4 kommen zwei Pfeile an – das ist erlaubt
    expect(a.shared.map((j) => m.b[j]!.value)).toEqual([1, 4]);
    // Wertemenge {0; 1; 4}
    expect(a.range.map((j) => m.b[j]!.value)).toEqual([0, 1, 4]);
    const r = reverseMapping(m, REVERSE_RULE.square);
    const ar = analyze(r);
    expect(ar.isFunction).toBe(false);
    expect(ar.multi.map((i) => r.a[i]!.value)).toEqual([1, 4]);
    expect(ar.missing.map((i) => r.a[i]!.value)).toEqual([2, 3]);
    expect(targetsOf(r, 4).map((j) => r.b[j]!.value)).toEqual([-2, 2]);
  });

  it('x ↦ 2x + 1 ist umkehrbar: auch die Umkehrung ist eine Funktion', () => {
    const m = exampleMapping('lin');
    expect(analyze(m).isFunction).toBe(true);
    expect(analyze(reverseMapping(m)).isFunction).toBe(true);
  });

  it('Kind → Geburtsmonat ist eine Funktion, Monat → Kind nicht', () => {
    const m = exampleMapping('month');
    expect(analyze(m).isFunction).toBe(true);
    const r = analyze(reverseMapping(m));
    expect(r.isFunction).toBe(false);
    expect(r.missing).toEqual([1]); // März: kein Kind
    expect(r.multi).toEqual([2]); // Mai: zwei Kinder
  });

  it('setzt und entfernt Pfeile', () => {
    const m = exampleMapping('own');
    expect(analyze(m).isFunction).toBe(false);
    let arrows = toggleArrow(m.arrows, 2, 4); // 3 → 5 entfernen
    arrows = toggleArrow(arrows, 3, 2); // 4 → 3 setzen
    expect(arrows).toEqual([
      [0, 1],
      [1, 3],
      [2, 0],
      [3, 2],
    ]);
    expect(analyze({ ...m, arrows }).isFunction).toBe(true);
  });

  it('löst reduzierte kubische Gleichungen', () => {
    // y³ − 7y + 6 = (y − 1)(y − 2)(y + 3)
    expect(depressedCubic(-7, 6).map((v) => Math.round(v * 1e9) / 1e9)).toEqual([-3, 1, 2]);
    // y³ − 3y − 2 = (y + 1)²(y − 2): doppelte Lösung
    expect(depressedCubic(-3, -2).map((v) => Math.round(v * 1e9) / 1e9)).toEqual([-1, 2]);
    // y³ + y − 2: nur y = 1
    expect(depressedCubic(1, -2)).toHaveLength(1);
    expect(depressedCubic(1, -2)[0]).toBeCloseTo(1, 12);
  });

  it('zählt Schnittpunkte beim senkrechten Linientest', () => {
    expect(curveYs('parab', 2)).toEqual([0]);
    expect(curveYs('hyp', 0)).toEqual([]);
    expect(curveYs('hyp', 4)).toEqual([0.5]);
    expect(curveYs('step', 2)).toEqual([2]);
    expect(curveYs('step', 1.99)).toEqual([1]);
    expect(curveYs('semi', 0)).toEqual([3]);
    expect(curveYs('semi', 3.5)).toEqual([]);
    expect(curveYs('circle', 0)).toEqual([-3, 3]);
    expect(curveYs('circle', 3)).toEqual([0]);
    expect(curveYs('sideways', 0)).toEqual([-2, 2]);
    expect(curveYs('sideways', -2)).toEqual([0]);
    expect(curveYs('scurve', 0)).toHaveLength(3);
    expect(curveYs('scurve', 3)).toHaveLength(1);
    // Jeder gefundene Punkt liegt auf der S-Kurve x = 0,25y³ − 2y
    for (const y of curveYs('scurve', 1)) expect(0.25 * y ** 3 - 2 * y).toBeCloseTo(1, 10);
    // Umkehrstellen bei y = ±√(8/3): dort berührt die Gerade (zwei Schnittpunkte), außerhalb nur einer
    const turn = 0.25 * Math.sqrt(8 / 3) ** 3 - 2 * Math.sqrt(8 / 3);
    expect(curveYs('scurve', turn + 1e-6)).toHaveLength(3);
    expect(curveYs('scurve', turn - 1e-3)).toHaveLength(1);
    // x = 0: y = 0 und y = ±√8
    expect(curveYs('scurve', 0).map((v) => Math.round(v * 1e9) / 1e9)).toEqual([-2.828427125, 0, 2.828427125]);
  });

  it('passt zur Einstufung als Funktionsgraph', () => {
    for (const id of CURVES) {
      const counts = countProfile(id, -6.5, 6.5, 520);
      expect(Math.max(...counts) <= 1).toBe(IS_FUNCTION[id]);
      if (!IS_FUNCTION[id]) expect(curveYs(id, WITNESS[id]!).length).toBeGreaterThan(1);
      // Alle Punkte der gezeichneten Linienzüge erfüllen die Gleichung des Graphen
      for (const path of curvePaths(id)) {
        for (const [x, y] of path.slice(1, -1)) {
          if (id === 'step') continue;
          expect(curveYs(id, x).some((v) => Math.abs(v - y) < 1e-6)).toBe(true);
        }
      }
    }
  });
});
