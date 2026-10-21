import { describe, expect, it } from 'vitest';
import {
  areaRatio,
  axisFraction,
  DATASETS,
  effectiveCut,
  exactAngles,
  iconCount,
  largestRemainder,
  lieFactor,
  minPositiveIndex,
  niceStep,
  percent,
  percentsOf,
  perceivedCutRatio,
  pieAngles,
  ranks,
  realRatio,
  reduceFraction,
  roundedPercents,
  shares,
  suggestCut,
  tally,
  total,
  unevenFraction,
  unevenTicks,
  valueAxis,
  wrongBase,
} from '../src/simulations/mathematik/diagramme/model';

describe('Modell: Diagramme – Anteile und Kreiswinkel', () => {
  it('6 von 24 sind 25 % und im Kreisdiagramm 90°', () => {
    expect(percent(6, 24)).toBeCloseTo(25, 12);
    expect(pieAngles([6, 18])).toEqual([90, 270]);
    expect(exactAngles([6, 18])[0]).toBeCloseTo(90, 12);
  });

  it('Lieblingssport der 6b: 8, 6, 4, 3, 3 von 24 → 120°, 90°, 60°, 45°, 45°', () => {
    const v = DATASETS.sport.defaults;
    expect(total(v)).toBe(24);
    expect(pieAngles(v)).toEqual([120, 90, 60, 45, 45]);
    expect(shares(v)[0]).toBeCloseTo(1 / 3, 12);
  });

  it('gerundete Winkel ergeben immer genau 360°', () => {
    for (const v of [[1, 1, 1], [1, 1, 1, 1, 1, 1, 1], [40, 55, 35, 60, 90, 120, 105], [14, 17, 19, 16, 21, 23, 20], [1, 2, 3, 4, 5, 6, 7], [95, 100, 92]]) {
      const a = pieAngles(v);
      expect(total(a)).toBe(360);
      a.forEach((x, i) => expect(Math.abs(x - exactAngles(v)[i]!)).toBeLessThan(1));
    }
    // 360 : 7 = 51,43 … → drei Sektoren bekommen 52°, vier 51°
    expect(pieAngles([1, 1, 1, 1, 1, 1, 1]).sort()).toEqual([51, 51, 51, 51, 52, 52, 52]);
  });

  it('Prozent mit fester Summe 100 (Verfahren der größten Reste)', () => {
    expect(roundedPercents([1, 1, 1])).toEqual([34, 33, 33]);
    expect(total(roundedPercents([1, 1, 1], 1))).toBeCloseTo(100, 9);
    expect(largestRemainder([0, 0], 360)).toEqual([0, 0]);
  });

  it('kürzt Brüche', () => {
    expect(reduceFraction(8, 24)).toEqual([1, 3]);
    expect(reduceFraction(6, 24)).toEqual([1, 4]);
    expect(reduceFraction(0, 24)).toEqual([0, 1]);
  });

  it('leere Daten: Anteile 0', () => {
    expect(shares([0, 0, 0])).toEqual([0, 0, 0]);
    expect(percent(3, 0)).toBe(0);
  });
});

describe('Modell: Diagramme – Achsen und Täuschungen', () => {
  it('schöne Schrittweiten und Achsenende', () => {
    expect(niceStep(3)).toBe(5);
    expect(niceStep(20)).toBe(20);
    expect(valueAxis(8)).toEqual({ start: 0, top: 8, step: 2 });
    expect(valueAxis(100)).toEqual({ start: 0, top: 100, step: 20 });
    expect(valueAxis(100, 90)).toEqual({ start: 90, top: 100, step: 2 });
    expect(valueAxis(120).top).toBeGreaterThanOrEqual(120);
  });

  it('abgeschnittene Achse ab 90: 95 und 100 wirken wie 1 : 2 statt 0,95 : 1', () => {
    expect(perceivedCutRatio(95, 100, 90)).toBeCloseTo(0.5, 12);
    expect(realRatio(95, 100)).toBeCloseTo(0.95, 12);
    expect(axisFraction(95, 90, 100)).toBeCloseTo(0.5, 12);
    expect(lieFactor(0.5, 0.95)).toBeCloseTo(1.9, 12);
    expect(perceivedCutRatio(95, 100, 0)).toBeCloseTo(0.95, 12);
  });

  it('Vorschlag und Grenze für den Achsenbeginn', () => {
    expect(suggestCut([95, 100, 92])).toBe(90);
    expect(suggestCut([8, 6, 4, 3, 3])).toBe(2);
    expect(suggestCut([40, 55, 35])).toBe(30);
    expect(effectiveCut([95, 100, 92], 120)).toBe(91);
    expect(effectiveCut([8, 6, 4, 3, 3], 90)).toBe(2);
    expect(effectiveCut([0, 5], 3)).toBe(0);
  });

  it('ungleiche Achsenabstände 0, 10, 20, 50, 100, 200 stauchen große Werte', () => {
    const t = unevenTicks(120);
    expect(t).toEqual([0, 10, 20, 50, 100, 200]);
    expect(unevenFraction(20, t)).toBeCloseTo(2 / 5, 12);
    expect(unevenFraction(150, t)).toBeCloseTo(4.5 / 5, 12);
    // 40 und 120 (echt 1 : 3) wirken fast gleich hoch
    const ratio = unevenFraction(40, t) / unevenFraction(120, t);
    expect(ratio).toBeGreaterThan(0.6);
    expect(realRatio(40, 120)).toBeCloseTo(1 / 3, 12);
    expect(unevenFraction(-3, t)).toBe(0);
    expect(unevenFraction(999, t)).toBe(1);
  });

  it('Flächen-Piktogramm: doppelte Höhe ergibt vierfache Fläche', () => {
    expect(areaRatio(8, 4)).toBeCloseTo(4, 12);
    expect(areaRatio(4, 8)).toBeCloseTo(0.25, 12);
  });

  it('Kreisdiagramm mit falschem Grundwert: 120 % statt 100 %', () => {
    const v = DATASETS.sport.defaults;
    expect(wrongBase(24)).toBe(20);
    const p = percentsOf(v, wrongBase(total(v)));
    expect(p).toEqual([40, 30, 20, 15, 15]);
    expect(total(p)).toBeCloseTo(120, 12);
  });
});

describe('Modell: Diagramme – Strichliste, Piktogramm, Rangfolge', () => {
  it('Strichliste bündelt je fünf', () => {
    expect(tally(8)).toEqual({ bundles: 1, rest: 3 });
    expect(tally(15)).toEqual({ bundles: 3, rest: 0 });
    expect(tally(0)).toEqual({ bundles: 0, rest: 0 });
  });

  it('Piktogramm: 90 min bei 1 Bildchen = 20 min sind 4,5 Bildchen', () => {
    expect(iconCount(90, 20)).toBeCloseTo(4.5, 12);
    expect(iconCount(-1, 5)).toBe(0);
  });

  it('Rangfolge zum Sortieren', () => {
    expect(ranks([8, 6, 4, 3, 3])).toEqual([0, 1, 2, 3, 4]);
    expect(ranks([95, 100, 92])).toEqual([1, 0, 2]);
  });

  it('Startwerte liegen im Reglerbereich und passen zum Raster', () => {
    for (const d of Object.values(DATASETS)) {
      expect(d.keys.length).toBe(d.defaults.length);
      for (const v of d.defaults) {
        expect(v).toBeGreaterThanOrEqual(d.min);
        expect(v).toBeLessThanOrEqual(d.max);
        expect(Math.abs(v / d.step - Math.round(v / d.step))).toBeLessThan(1e-9);
      }
    }
  });
});

describe('Modell: Diagramme – Prüfrunde (nachgerechnete Werte, Sonderfälle)', () => {
  it('8 von 30 sind 26,7 % und 96°', () => {
    expect(percent(8, 30)).toBeCloseTo(26.667, 3);
    expect(exactAngles([8, 22])[0]).toBeCloseTo(96, 12);
    expect(pieAngles([8, 22])).toEqual([96, 264]);
  });

  it('Wahl 95, 100, 92 von 287: Winkel 119°, 126°, 115° (Summe 360°), Prozent 33,1/34,8/32,1', () => {
    expect(exactAngles([95, 100, 92]).map((a) => Math.round(a * 10) / 10)).toEqual([119.2, 125.4, 115.4]);
    // Abgerundet 119 + 125 + 115 = 359; Reste 0,16 / 0,44 / 0,40 → der übrige Grad geht an Jonas
    expect(pieAngles([95, 100, 92])).toEqual([119, 126, 115]);
    expect(roundedPercents([95, 100, 92], 1)).toEqual([33.1, 34.8, 32.1]);
  });

  it('abgeschnittene Achse ab 40: 52 und 48 wirken wie 12 : 8 = 1,5-fach statt 1,08-fach', () => {
    expect(perceivedCutRatio(48, 52, 40)).toBeCloseTo(8 / 12, 12);
    expect(1 / perceivedCutRatio(48, 52, 40)).toBeCloseTo(1.5, 12);
    expect(1 / realRatio(48, 52)).toBeCloseTo(1.0833, 4);
    expect(lieFactor(8 / 12, 48 / 52)).toBeCloseTo((48 / 52) / (8 / 12), 12);
  });

  it('ein Wert 0: Sektor 0°, die übrigen teilen sich 360°', () => {
    expect(pieAngles([8, 6, 4, 3, 0])).toEqual([137, 103, 69, 51, 0]);
    expect(total(roundedPercents([8, 6, 4, 3, 0], 1))).toBeCloseTo(100, 9);
  });

  it('alle Werte 0: keine Winkel, keine Prozent, keine Division durch 0', () => {
    expect(pieAngles([0, 0, 0, 0, 0])).toEqual([0, 0, 0, 0, 0]);
    expect(roundedPercents([0, 0, 0])).toEqual([0, 0, 0]);
    expect(exactAngles([0, 0])).toEqual([0, 0]);
    expect(effectiveCut([0, 0, 0], 90)).toBe(0);
  });

  it('Flächen-Piktogramm vergleicht mit dem kleinsten Wert über 0', () => {
    expect(minPositiveIndex([8, 6, 0, 0, 0])).toBe(1);
    expect(minPositiveIndex([8, 6, 4, 3, 3])).toBe(3);
    expect(minPositiveIndex([0, 0])).toBe(-1);
  });
});
