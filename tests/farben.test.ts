import { describe, expect, it } from 'vitest';
import {
  additiveMix,
  checkTask,
  colorName,
  coneFromMix,
  coneResponse,
  filterPasses,
  LIGHTS,
  makeTask,
  objectColor,
  prismDeviation,
  REFLECT,
  refractiveIndex,
  spectralName,
  subtractiveMix,
} from '../src/simulations/physik/farben/model';

describe('Farben', () => {
  it('Blau wird stärker gebrochen als Rot (Dispersion)', () => {
    expect(refractiveIndex(400)).toBeGreaterThan(refractiveIndex(700));
    const apex = (60 * Math.PI) / 180;
    const a = (50 * Math.PI) / 180;
    const dBlue = prismDeviation(refractiveIndex(400), apex, a);
    const dRed = prismDeviation(refractiveIndex(700), apex, a);
    expect(dBlue).toBeGreaterThan(dRed);
    // Ablenkung bei n ≈ 1,51 und 60° um 38–40°
    expect((dRed * 180) / Math.PI).toBeGreaterThan(36);
    expect((dBlue * 180) / Math.PI).toBeLessThan(44);
  });

  it('additive Mischung: Rot + Grün = Gelb, alle drei = Weiß', () => {
    expect(colorName(additiveMix(1, 1, 0))).toBe('yellow');
    expect(colorName(additiveMix(1, 0, 1))).toBe('magenta');
    expect(colorName(additiveMix(0, 1, 1))).toBe('cyan');
    expect(colorName(additiveMix(1, 1, 1))).toBe('white');
    expect(colorName(additiveMix(0, 0, 0))).toBe('black');
    expect(colorName(additiveMix(1, 0.5, 0))).toBe('orange');
  });

  it('subtraktive Mischung: Cyan + Gelb = Grün, alle drei = Schwarz', () => {
    expect(colorName(subtractiveMix(1, 0, 1))).toBe('green');
    expect(colorName(subtractiveMix(0, 1, 1))).toBe('red');
    expect(colorName(subtractiveMix(1, 1, 0))).toBe('blue');
    expect(colorName(subtractiveMix(1, 1, 1))).toBe('black');
    expect(colorName(subtractiveMix(0, 0, 0))).toBe('white');
  });

  it('Filter lassen nur ihre Farbe durch', () => {
    expect(filterPasses('red', 650)).toBe(true);
    expect(filterPasses('red', 450)).toBe(false);
    expect(filterPasses('yellow', 530)).toBe(true);
    expect(filterPasses('yellow', 450)).toBe(false);
    expect(filterPasses('cyan', 650)).toBe(false);
  });
});

describe('Körperfarben', () => {
  it('ein roter Apfel ist im grünen Licht schwarz, im roten Licht rot', () => {
    expect(colorName(objectColor(LIGHTS.green, REFLECT.apple))).toBe('black');
    expect(colorName(objectColor(LIGHTS.red, REFLECT.apple))).toBe('red');
    expect(colorName(objectColor(LIGHTS.white, REFLECT.leaf))).toBe('green');
    expect(colorName(objectColor(LIGHTS.blue, REFLECT.paper))).toBe('blue');
    expect(colorName(objectColor(LIGHTS.white, REFLECT.coal))).toBe('black');
  });
});

describe('Farbensehen', () => {
  it('Zapfen: L am empfindlichsten bei langen, S bei kurzen Wellenlängen', () => {
    expect(coneResponse(564)[0]).toBeCloseTo(1, 12);
    expect(coneResponse(420)[2]).toBeCloseTo(1, 12);
    expect(coneResponse(650)[0]).toBeGreaterThan(coneResponse(650)[1]);
    expect(coneResponse(450)[2]).toBeGreaterThan(coneResponse(450)[0]);
  });

  it('Gelb 580 nm und eine Rot-Grün-Mischung reizen die Zapfen ähnlich (Metamerie)', () => {
    const y = coneResponse(580);
    const m = coneFromMix(1, 0.6, 0);
    const ratio = (c: readonly number[]) => c[0]! / c[1]!;
    expect(Math.abs(ratio(y) - ratio(m))).toBeLessThan(0.35);
    expect(m[2]).toBeLessThan(0.05);
  });

  it('Farbbereiche der Wellenlängen', () => {
    expect(spectralName(450)).toBe('cyan');
    expect(spectralName(530)).toBe('green');
    expect(spectralName(650)).toBe('red');
    expect(spectralName(300)).toBe('uv');
    expect(spectralName(900)).toBe('ir');
  });
});

describe('Übung Farben', () => {
  it('jede Aufgabe ist mit ihrer Antwort richtig, mit einer falschen nicht', () => {
    for (let n = 1; n <= 200; n++) {
      const t = makeTask(n);
      expect(checkTask(t, String(t.answer))).toBe(true);
      expect(checkTask(t, String(t.answer + 1))).toBe(false);
      if (t.choices) {
        expect(t.answer).toBeGreaterThanOrEqual(1);
        expect(t.answer).toBeLessThanOrEqual(t.choices.length);
        expect(new Set(t.choices.map((c) => c.de)).size).toBe(t.choices.length);
      }
    }
    expect(checkTask(makeTask(1), 'gelb')).toBeNull();
  });
});
