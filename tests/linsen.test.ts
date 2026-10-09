import { describe, expect, it } from 'vitest';
import {
  blurRadius,
  constructionRays,
  describeImage,
  imageDistance,
  imageHeight,
  isSharp,
  power,
  rayThrough,
  rayY,
  refract,
  scaleRatio,
  screenScale,
  zoneOf,
} from '../src/simulations/physik/linsen/model';

describe('Modell: Linsen – Linsengleichung', () => {
  it('berechnet die Bildweite aus 1/f = 1/g + 1/b', () => {
    expect(imageDistance(10, 15)).toBeCloseTo(30, 12);
    expect(imageDistance(10, 20)).toBeCloseTo(20, 12); // g = 2f ⇒ b = 2f
    expect(imageDistance(10, 35)).toBeCloseTo(14, 12);
    expect(imageDistance(10, 6)).toBeCloseTo(-15, 12); // Lupe: virtuelles Bild
    expect(imageDistance(-10, 20)).toBeCloseTo(-20 / 3, 12); // Zerstreuungslinse
    expect(imageDistance(10, 10)).toBeNull(); // g = f: kein Bild
  });

  it('erfüllt die Linsengleichung für viele Werte', () => {
    for (const f of [-15, -4, 4, 7.5, 20]) {
      for (const g of [2, 5.5, 12, 33, 50]) {
        const b = imageDistance(f, g);
        if (b === null) continue;
        expect(1 / g + 1 / b).toBeCloseTo(1 / f, 12);
      }
    }
  });

  it('liefert Bildgröße und Abbildungsmaßstab B : G = |b| : g', () => {
    expect(imageHeight(10, 15, 5)).toBeCloseTo(-10, 12); // umgekehrt, doppelt so groß
    expect(imageHeight(10, 6, 4)).toBeCloseTo(10, 12); // aufrecht
    expect(scaleRatio(10, 35)).toBeCloseTo(0.4, 12);
    expect(scaleRatio(10, 20)).toBeCloseTo(1, 12);
    expect(imageHeight(10, 10, 5)).toBeNull();
  });

  it('beschreibt das Bild je nach Gegenstandsweite', () => {
    expect(describeImage(10, 35, 5)).toMatchObject({ kind: 'real', upright: false, size: 'smaller' });
    expect(describeImage(10, 20, 5)).toMatchObject({ kind: 'real', upright: false, size: 'same' });
    expect(describeImage(10, 15, 5)).toMatchObject({ kind: 'real', upright: false, size: 'larger' });
    expect(describeImage(10, 10, 5)).toMatchObject({ kind: 'none', b: null });
    expect(describeImage(10, 6, 5)).toMatchObject({ kind: 'virtual', upright: true, size: 'larger' });
    for (const g of [2, 10, 30, 50]) expect(describeImage(-10, g, 5)).toMatchObject({ kind: 'virtual', upright: true, size: 'smaller' });
  });

  it('ordnet die Bereiche zu (Kamera, Projektor, Lupe)', () => {
    expect(zoneOf(10, 35)).toBe('far');
    expect(zoneOf(10, 20)).toBe('twice');
    expect(zoneOf(10, 15)).toBe('mid');
    expect(zoneOf(10, 10)).toBe('focal');
    expect(zoneOf(10, 6)).toBe('near');
    expect(zoneOf(-10, 6)).toBe('diverging');
  });

  it('rechnet die Brechkraft in Dioptrien', () => {
    expect(power(10)).toBeCloseTo(10, 12);
    expect(power(-25)).toBeCloseTo(-4, 12);
  });
});

describe('Modell: Linsen – Strahlen', () => {
  it('bricht so, dass ein achsenparalleler Strahl durch den Brennpunkt geht', () => {
    const slope = refract(3, 0, 10);
    expect(3 + slope * 10).toBeCloseTo(0, 12);
    // Strahl durch die Linsenmitte bleibt ungebrochen
    expect(refract(0, 0.25, 10)).toBe(0.25);
  });

  it('Konstruktionsstrahlen: Parallelstrahl durch F′, Mittelpunktstrahl ungebrochen, Brennpunktstrahl danach parallel', () => {
    const [par, mid, foc] = constructionRays(10, 15, 5);
    expect(par!.id).toBe('par');
    expect(rayY(par!, 10)).toBeCloseTo(0, 12);
    expect(mid!.hit).toBe(0);
    expect(mid!.slopeIn).toBeCloseTo(mid!.slopeOut, 12);
    expect(foc!.slopeOut).toBeCloseTo(0, 12);
    // der Brennpunktstrahl kommt durch F (x = −10) auf der Gegenstandsseite
    expect(5 + foc!.slopeIn * (15 - 10)).toBeCloseTo(0, 12);
  });

  it('alle drei Strahlen schneiden sich im Bildpunkt (auch rückwärts verlängert beim virtuellen Bild)', () => {
    for (const [f, g, G] of [
      [10, 15, 5],
      [10, 35, 8],
      [8, 5, 3],
      [-10, 20, 8],
      [-6, 4, 2],
    ] as [number, number, number][]) {
      const b = imageDistance(f, g)!;
      const B = imageHeight(f, g, G)!;
      for (const r of constructionRays(f, g, G)) expect(rayY(r, b)).toBeCloseTo(B, 9);
    }
  });

  it('bei der Zerstreuungslinse scheint der Parallelstrahl vom Brennpunkt vor der Linse zu kommen', () => {
    const [par] = constructionRays(-10, 20, 8);
    expect(rayY(par!, -10)).toBeCloseTo(0, 12);
  });

  it('g = f: kein Brennpunktstrahl, die übrigen Strahlen laufen parallel', () => {
    const rays = constructionRays(10, 10, 4);
    expect(rays.map((r) => r.id)).toEqual(['par', 'mid']);
    expect(rays[0]!.slopeOut).toBeCloseTo(rays[1]!.slopeOut, 12);
  });

  it('jedes Lichtbündel durch die ganze Linse läuft im Bildpunkt zusammen', () => {
    const b = imageDistance(10, 15)!;
    const B = imageHeight(10, 15, 5)!;
    for (const hit of [-4, -1.5, 0, 2, 4]) expect(rayY(rayThrough(10, 15, 5, hit), b)).toBeCloseTo(B, 9);
  });
});

describe('Modell: Linsen – Schirmbild', () => {
  it('ist in der Bildweite scharf, davor und dahinter unscharf (ähnliche Dreiecke)', () => {
    expect(blurRadius(3, 30, 30)).toBe(0);
    expect(blurRadius(3, 25, 30)).toBeCloseTo(0.5, 12);
    expect(blurRadius(3, 45, 30)).toBeCloseTo(1.5, 12);
    expect(blurRadius(3, 20, null)).toBe(3); // parallele Strahlen
    expect(blurRadius(3, 15, -15)).toBeCloseTo(6, 12); // auseinanderlaufendes Bündel
  });

  it('kleinere Blende: größere Schärfentiefe', () => {
    expect(isSharp(3, 33, 30)).toBe(false);
    expect(isSharp(0.5, 33, 30)).toBe(true);
    expect(isSharp(3, 30, 30)).toBe(true);
    expect(isSharp(3, 30, -10)).toBe(false);
    expect(isSharp(3, 30, null)).toBe(false);
  });

  it('vergrößert das Schirmbild mit s : g (scharf: b : g)', () => {
    expect(screenScale(30, 15)).toBe(2);
    expect(screenScale(imageDistance(10, 15)!, 15)).toBeCloseTo(scaleRatio(10, 15)!, 12);
  });
});
