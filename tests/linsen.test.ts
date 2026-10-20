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

describe('Modell: Linsen – Sonderfälle und Aufgaben des Lernmaterials', () => {
  it('Sonderfälle: g sehr groß ⇒ b → f; g knapp über f ⇒ b sehr groß; g = 2f ⇒ b = 2f, B = −G', () => {
    expect(imageDistance(10, 1e6)!).toBeCloseTo(10, 3);
    expect(imageDistance(20, 21)).toBeCloseTo(420, 9); // Reglerwerte f = 20, g = 21
    expect(imageDistance(20, 40)).toBeCloseTo(40, 12);
    expect(imageHeight(20, 40, 6)).toBeCloseTo(-6, 12);
    expect(zoneOf(20, 40)).toBe('twice');
    // Reglergrenzen: f = 4, g = 50 (stark verkleinert) und f = 20, g = 2 (Lupe)
    expect(imageDistance(4, 50)).toBeCloseTo(200 / 46, 12);
    expect(imageDistance(20, 2)).toBeCloseTo(-40 / 18, 12);
    expect(describeImage(20, 2, 12)).toMatchObject({ kind: 'virtual', upright: true, size: 'larger' });
  });

  it('Brechkraft: f = 8 cm ⇒ 12,5 dpt, f = 5 cm ⇒ 20 dpt, f = −10 cm ⇒ −10 dpt', () => {
    expect(power(8)).toBeCloseTo(12.5, 12);
    expect(power(5)).toBeCloseTo(20, 12);
    expect(power(-10)).toBeCloseTo(-10, 12);
  });

  it('Aufgabe 1: f = 10 cm, g = 25 cm, G = 4 cm ⇒ b = 50/3 cm, B = 8/3 cm, reell, umgekehrt, verkleinert', () => {
    expect(imageDistance(10, 25)).toBeCloseTo(50 / 3, 12);
    expect(imageHeight(10, 25, 4)).toBeCloseTo(-8 / 3, 12);
    expect(describeImage(10, 25, 4)).toMatchObject({ kind: 'real', upright: false, size: 'smaller' });
  });

  it('Aufgabe 2: f = 10 cm, b = 50 cm ⇒ g = 12,5 cm, B = 12 cm bei G = 3 cm', () => {
    expect(imageDistance(10, 12.5)).toBeCloseTo(50, 12);
    expect(Math.abs(imageHeight(10, 12.5, 3)!)).toBeCloseTo(12, 12);
  });

  it('Aufgabe 3: Lupe f = 8 cm, g = 6 cm ⇒ b = −24 cm, B = 12 cm aufrecht', () => {
    expect(imageDistance(8, 6)).toBeCloseTo(-24, 12);
    expect(imageHeight(8, 6, 3)).toBeCloseTo(12, 12);
  });

  it('Aufgabe 4: Kamera f = 5 cm ⇒ b ≈ 5,6 cm (g = 50 cm) bzw. ≈ 6,7 cm (g = 20 cm); die Links zeigen ein scharfes Schirmbild', () => {
    expect(imageDistance(5, 50)).toBeCloseTo(50 / 9, 12);
    expect(imageDistance(5, 20)).toBeCloseTo(20 / 3, 12);
    expect(isSharp(3, 5.5, imageDistance(5, 50))).toBe(true);
    expect(isSharp(3, 6.5, imageDistance(5, 20))).toBe(true);
  });

  it('Aufgabe 5: Zerstreuungslinse f = −10 cm, g = 15 cm ⇒ b = −6 cm, B = 2 cm', () => {
    expect(imageDistance(-10, 15)).toBeCloseTo(-6, 12);
    expect(imageHeight(-10, 15, 5)).toBeCloseTo(2, 12);
  });

  it('Ausprobieren 8: kleine Blende (d = 1 cm) macht das Bild bei s = 34 cm scharf, große (d = 6 cm) nicht', () => {
    const b = imageDistance(10, 15);
    expect(isSharp(0.5, 34, b)).toBe(true);
    expect(isSharp(3, 34, b)).toBe(false);
    expect(20 * blurRadius(3, 25, b)).toBeCloseTo(10, 12); // Startzustand: Unschärfekreis 10 mm
  });
});
