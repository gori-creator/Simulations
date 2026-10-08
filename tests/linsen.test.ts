import { describe, expect, it } from 'vitest';
import { blurRadius, constructionIntersection, focalFor, imageCase, imageDistance, lensImage, rayAtScreen, refractSlope } from '../src/simulations/physik/linsen/model';

describe('Modell: Linsen und Bildentstehung', () => {
  it('Linsengleichung 1/f = 1/g + 1/b', () => {
    expect(imageDistance(10, 25)).toBeCloseTo(50 / 3, 12);
    expect(imageDistance(10, 20)).toBeCloseTo(20, 12); // g = 2f → b = 2f
    expect(imageDistance(10, 15)).toBeCloseTo(30, 12);
    expect(imageDistance(10, 6)).toBeCloseTo(-15, 12); // virtuelles Bild
    expect(imageDistance(10, 10)).toBe(Infinity); // g = f: kein Bild
    const f = 8;
    const g = 45;
    const b = imageDistance(f, g);
    expect(1 / g + 1 / b).toBeCloseTo(1 / f, 12);
  });

  it('Bildgröße und Abbildungsmaßstab: B / G = b / g', () => {
    const img = lensImage(10, 25, 5);
    expect(img.B).toBeCloseTo((-5 * (50 / 3)) / 25, 12);
    expect(img.scale).toBeCloseTo(2 / 3, 12);
    expect(img.real).toBe(true);
    expect(img.inverted).toBe(true);
    const twoF = lensImage(10, 20, 8);
    expect(twoF.scale).toBeCloseTo(1, 12);
    expect(twoF.B).toBeCloseTo(-8, 12);
  });

  it('Lupe: virtuelles, aufrechtes, vergrößertes Bild', () => {
    const img = lensImage(10, 6, 3);
    expect(img.real).toBe(false);
    expect(img.inverted).toBe(false);
    expect(img.B).toBeCloseTo(7.5, 12);
    expect(img.scale).toBeCloseTo(2.5, 12);
  });

  it('Zerstreuungslinse: immer virtuell, aufrecht, verkleinert', () => {
    for (const g of [2, 10, 20, 50]) {
      const img = lensImage(-10, g, 5);
      expect(img.real, `g = ${g}`).toBe(false);
      expect(img.inverted).toBe(false);
      expect(img.scale).toBeLessThan(1);
      expect(img.b).toBeGreaterThan(-10); // zwischen F′ und Linse
    }
  });

  it('kein Bild bei g = f', () => {
    expect(lensImage(10, 10, 5).none).toBe(true);
  });

  it('ordnet die typischen Fälle zu', () => {
    expect(imageCase(10, 30)).toBe('far');
    expect(imageCase(10, 20)).toBe('twoF');
    expect(imageCase(10, 15)).toBe('between');
    expect(imageCase(10, 10)).toBe('focus');
    expect(imageCase(10, 5)).toBe('inside');
    expect(imageCase(-10, 30)).toBe('diverging');
  });

  it('Auge: Brennweite passt sich an, damit b gleich bleibt (Akkommodation)', () => {
    expect(focalFor(40, 10)).toBeCloseTo(8, 12);
    expect(imageDistance(focalFor(25, 10), 25)).toBeCloseTo(10, 12);
    // nahe Gegenstände brauchen eine kürzere Brennweite (stärker gekrümmte Linse)
    expect(focalFor(15, 10)).toBeLessThan(focalFor(60, 10));
  });

  it('alle Strahlen eines Punktes treffen sich im Bildpunkt (dünne Linse)', () => {
    const f = 10;
    const g = 25;
    const G = 5;
    const img = lensImage(f, g, G);
    for (const yl of [-11, -6, 0, 3.5, 11]) {
      expect(rayAtScreen(-g, G, yl, f, img.b)).toBeCloseTo(img.B, 9);
    }
    // Mittelpunktstrahl wird nicht abgelenkt
    expect(refractSlope(0.3, 0, f)).toBe(0.3);
    // Parallelstrahl geht durch F′
    expect(4 + refractSlope(0, 4, f) * f).toBeCloseTo(0, 12);
  });

  it('Konstruktion: Parallel- und Mittelpunktstrahl schneiden sich im Bildpunkt', () => {
    const [x, y] = constructionIntersection(10, 15, 4)!;
    const img = lensImage(10, 15, 4);
    expect(x).toBeCloseTo(img.b, 12);
    expect(y).toBeCloseTo(img.B, 12);
  });

  it('Unschärfekreis: null im Bildpunkt, wächst mit dem Abstand vom Bildpunkt', () => {
    const b = imageDistance(10, 25);
    expect(blurRadius(11, b, b)).toBe(0);
    expect(blurRadius(11, b, 30)).toBeCloseTo((11 * (30 - b)) / b, 12);
    expect(blurRadius(11, b, b - 2)).toBeCloseTo(blurRadius(11, b, b + 2), 12);
  });
});
