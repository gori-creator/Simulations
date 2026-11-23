import { describe, expect, it } from 'vitest';
import {
  absMag,
  appMag,
  evolutionTrack,
  L_SUN,
  luminosity,
  luminosityW,
  lyFromParallax,
  msLifetime,
  msLuminosity,
  msLumAtT,
  msRadius,
  msTemperature,
  parsecFromParallax,
  planck,
  population,
  R_SUN,
  radiusFrom,
  regionOf,
  remnant,
  spectralClass,
  starById,
  starRGB,
  STARS,
  T_SUN,
  temperatureFrom,
  trackAt,
  wienPeakNm,
} from '../src/simulations/physik/hr-diagramm/model';

describe('Stefan-Boltzmann', () => {
  it('Sonne: T ≈ 5778 K, L = 1 L☉', () => {
    expect(Math.abs(T_SUN - 5778)).toBeLessThan(10);
    expect(luminosity(1, T_SUN)).toBeCloseTo(1, 12);
    expect(luminosityW(R_SUN, T_SUN) / L_SUN).toBeCloseTo(1, 10);
  });
  it('doppelte Temperatur bei gleichem Radius → 16-fache Leuchtkraft', () => {
    expect(luminosity(1, 2 * T_SUN)).toBeCloseTo(16, 10);
    expect(luminosity(3, 8000) / luminosity(3, 4000)).toBeCloseTo(16, 10);
  });
  it('doppelter Radius → 4-fache Leuchtkraft; Umkehrungen', () => {
    expect(luminosity(2, 5000) / luminosity(1, 5000)).toBeCloseTo(4, 12);
    expect(radiusFrom(luminosity(7, 4200), 4200)).toBeCloseTo(7, 10);
    expect(temperatureFrom(luminosity(0.3, 12000), 0.3)).toBeCloseTo(12000, 6);
  });
});

describe('Spektrum', () => {
  it('Wien: Sonne ≈ 502 nm, 3000 K ≈ 966 nm', () => {
    expect(wienPeakNm(T_SUN)).toBeCloseTo(502, 0);
    expect(wienPeakNm(3000)).toBeCloseTo(966, 0);
  });
  it('Planck: Maximum der Sonne ≈ 1, heißere Sterne strahlen bei jeder Wellenlänge mehr', () => {
    expect(planck(wienPeakNm(T_SUN), T_SUN)).toBeCloseTo(1, 10);
    for (const l of [300, 500, 800, 1500]) expect(planck(l, 8000)).toBeGreaterThan(planck(l, 5000));
  });
  it('Spektralklassen und Farben', () => {
    expect(spectralClass(5772)).toBe('G');
    expect(spectralClass(40000)).toBe('O');
    expect(spectralClass(9600)).toBe('A');
    expect(spectralClass(3000)).toBe('M');
    const [r1, , b1] = starRGB(3000);
    const [r2, , b2] = starRGB(20000);
    expect(r1).toBeGreaterThan(b1);
    expect(b2).toBeGreaterThan(r2);
  });
});

describe('Entfernung', () => {
  it('Parallaxe 0,1″ → 10 pc ≈ 32,6 Lj', () => {
    expect(parsecFromParallax(0.1)).toBeCloseTo(10, 12);
    expect(lyFromParallax(0.1)).toBeCloseTo(32.6, 1);
    expect(lyFromParallax(1)).toBeCloseTo(3.26, 2);
  });
  it('Helligkeiten: Sonne M = 4,83; in 10 pc gilt m = M', () => {
    expect(absMag(1)).toBeCloseTo(4.83, 12);
    expect(absMag(100)).toBeCloseTo(4.83 - 5, 12);
    expect(appMag(2, 10)).toBeCloseTo(2, 12);
    expect(appMag(2, 100)).toBeCloseTo(7, 12);
  });
});

describe('Hauptreihe und Lebensweg', () => {
  it('Sonne auf der Hauptreihe: L = 1, R = 1, 10 Mrd. Jahre', () => {
    expect(msLuminosity(1)).toBe(1);
    expect(msRadius(1)).toBe(1);
    expect(msTemperature(1)).toBeCloseTo(T_SUN, 6);
    expect(msLifetime(1)).toBeCloseTo(10, 12);
  });
  it('schwere Sterne leben kürzer', () => {
    expect(msLuminosity(2)).toBeCloseTo(16, 12);
    expect(msLifetime(2)).toBeCloseTo(1.25, 12);
    expect(msLifetime(10)).toBeLessThan(0.1);
    expect(msLifetime(0.5)).toBeGreaterThan(50);
  });
  it('Hauptreihe bei gegebener Temperatur', () => {
    expect(msLumAtT(T_SUN)).toBeCloseTo(1, 3);
  });
  it('Lebensweg: Sonne endet als Weißer Zwerg, 20 M☉ als Supernova', () => {
    const t = evolutionTrack(1);
    expect(t[0]!.L).toBeCloseTo(1, 10);
    expect(t.at(-1)!.phase).toBe('wd');
    expect(t.at(-1)!.t).toBe(1);
    expect(evolutionTrack(20).at(-1)!.phase).toBe('sn');
    expect(remnant(1)).toBe('wd');
    expect(remnant(15)).toBe('ns');
    expect(remnant(30)).toBe('bh');
    // Zeitanteile wachsen
    for (let i = 1; i < t.length; i++) expect(t[i]!.t).toBeGreaterThanOrEqual(t[i - 1]!.t);
    const mid = trackAt(t, 0.5);
    expect(mid.phase).toBe('ms');
    expect(trackAt(t, 1).phase).toBe('wd');
  });
});

describe('Sterne', () => {
  it('Sirius A: Radius ≈ 1,7 R☉; Sirius B ist ein Weißer Zwerg', () => {
    const s = starById('sirius')!;
    expect(radiusFrom(s.L, s.T)).toBeCloseTo(1.7, 1);
    const b = starById('siriusb')!;
    expect(regionOf(b.T, b.L)).toBe('wd');
    expect(radiusFrom(b.L, b.T)).toBeLessThan(0.02);
  });
  it('Gebiete im Diagramm', () => {
    expect(regionOf(5772, 1)).toBe('ms');
    const bet = starById('betelgeuse')!;
    expect(regionOf(bet.T, bet.L)).toBe('supergiant');
    expect(radiusFrom(bet.L, bet.T)).toBeGreaterThan(500);
    const ald = starById('aldebaran')!;
    expect(regionOf(ald.T, ald.L)).toBe('giant');
    expect(STARS.length).toBeGreaterThan(12);
  });
  it('erzeugte Population: gleiche Werte bei gleichem Startwert, alle endlich', () => {
    const a = population(300, 4);
    expect(a).toEqual(population(300, 4));
    expect(a.every((s) => s.T > 1000 && s.T < 60000 && s.L > 0 && Number.isFinite(s.L))).toBe(true);
  });
});

describe('Übung', () => {
  it('erfundene Sterne liegen im angegebenen Gebiet', async () => {
    const { quizStar } = await import('../src/simulations/physik/hr-diagramm/model');
    const seen = new Set<string>();
    for (let n = 1; n <= 80; n++) {
      const q = quizStar(n);
      expect(regionOf(q.T, q.L)).toBe(q.region);
      expect(luminosity(q.R, q.T)).toBeCloseTo(q.L, 10);
      seen.add(q.region);
    }
    expect(seen.size).toBe(4);
    expect(quizStar(3)).toEqual(quizStar(3));
  });
});

describe('Helligkeit und Oberfläche', () => {
  it('Sonne strahlt etwa 63 MW pro m²; Sirius in 2,64 pc erscheint hell', async () => {
    const m = await import('../src/simulations/physik/hr-diagramm/model');
    expect(m.surfaceFluxMW(m.T_SUN)).toBeCloseTo(63.1, 0);
    const sir = m.starById('sirius')!;
    const app = m.appMag(m.absMag(sir.L), 1 / 0.379);
    // Literatur: −1,46 mag; das einfache Modell (alles Licht sichtbar) gibt etwa −1,3
    expect(app).toBeLessThan(-1);
    expect(app).toBeGreaterThan(-1.7);
    expect(m.nakedEye(app)).toBe(true);
    // Proxima ist mit bloßem Auge nicht zu sehen
    const prox = m.starById('proxima')!;
    expect(m.nakedEye(m.appMag(m.absMag(prox.L), 1 / 0.768))).toBe(false);
    expect(m.sunsInside(10)).toBe(1000);
  });
});
