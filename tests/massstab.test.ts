import { describe, expect, it } from 'vitest';
import {
  bestUnit,
  decimalIn,
  enlargement,
  imageFromReal,
  lengthText,
  mapMmFromMetres,
  randomCalcTask,
  realFromImage,
  realUmFromMapMm,
  reduction,
  routePiecesMm,
  scaleFromLengths,
  scaleText,
  shortestRoute,
  solve,
  UM,
  unitChain,
  type RoadGraph,
} from '../src/simulations/mathematik/massstab/model';
import { ROADS, POIS, WORLD } from '../src/simulations/mathematik/massstab/landscape';
import { seededRandom } from '../src/sim-core';

const cm = (v: number) => Math.round(v * UM.cm);

describe('Modell: Maßstab – Karte und Wirklichkeit', () => {
  it('1 : 25 000: 4 cm auf der Karte = 100 000 cm = 1 km', () => {
    const r = realFromImage(cm(4), reduction(25000))!;
    expect(r.exact).toBe(true);
    expect(r.um).toBe(100000 * UM.cm);
    expect(r.um).toBe(UM.km);
    expect(lengthText(r.um, 'de', 'cm')).toBe('100 000 cm');
    expect(lengthText(r.um, 'de')).toBe('1 km');
  });

  it('1 : 25 000: 1 km entspricht 4 cm, 2,5 km entsprechen 10 cm', () => {
    expect(imageFromReal(UM.km, reduction(25000))).toEqual({ um: cm(4), exact: true });
    expect(imageFromReal(2.5 * UM.km, reduction(25000))).toEqual({ um: cm(10), exact: true });
  });

  it('1 : 50 000: 3 cm = 1,5 km', () => {
    const r = realFromImage(cm(3), reduction(50000))!;
    expect(r.um).toBe(1.5 * UM.km);
    expect(lengthText(r.um, 'de')).toBe('1,5 km');
    expect(lengthText(r.um, 'en')).toBe('1.5 km');
  });

  it('1 : 100: 5 cm = 5 m; 1 : 5 000: 1 cm = 50 m', () => {
    expect(lengthText(realFromImage(cm(5), reduction(100))!.um, 'de')).toBe('5 m');
    expect(realFromImage(cm(1), reduction(5000))!.um).toBe(50 * UM.m);
  });

  it('Vergrößerung 10 : 1: 2 cm im Bild = 2 mm in Wirklichkeit', () => {
    const r = realFromImage(cm(2), enlargement(10))!;
    expect(r).toEqual({ um: 2 * UM.mm, exact: true });
    expect(lengthText(r.um, 'de')).toBe('2 mm');
  });

  it('Vergrößerung 50 : 1: 0,4 mm in Wirklichkeit → 2 cm im Bild', () => {
    const b = imageFromReal(400, enlargement(50))!;
    expect(b).toEqual({ um: cm(2), exact: true });
    expect(lengthText(400, 'de')).toBe('0,4 mm');
  });

  it('Maßstab bestimmen: 6 cm auf der Karte entsprechen 3 km → 1 : 50 000', () => {
    const s = scaleFromLengths(cm(6), 3 * UM.km)!;
    expect(s.exact).toBe(true);
    expect(s.scale).toEqual({ image: 1, real: 50000 });
    expect(scaleText(s.scale, 'de')).toBe('1 : 50 000');
    expect(scaleText(s.scale, 'en')).toBe('1 : 50,000');
    // Vergrößerung erkennen: 2 cm Bild, 2 mm echt → 10 : 1
    expect(scaleFromLengths(cm(2), 2 * UM.mm)!.scale).toEqual({ image: 10, real: 1 });
  });

  it('Kartenlänge aus der Entfernung, auf 1 mm gerundet', () => {
    expect(mapMmFromMetres(1000, 25000)).toBe(40);
    expect(mapMmFromMetres(3000, 50000)).toBe(60);
    expect(mapMmFromMetres(400, 5000)).toBe(80);
    expect(mapMmFromMetres(1012, 25000)).toBe(40); // 4,048 cm → 4,0 cm
    expect(mapMmFromMetres(1013, 25000)).toBe(41); // 4,052 cm → 4,1 cm
    expect(realUmFromMapMm(41, 25000)).toBe(1_025_000_000);
  });

  it('Einheitenkette 100 000 cm = 1 000 m = 1 km', () => {
    const chain = unitChain(UM.km, 'cm').map((s) => s.text('de'));
    expect(chain).toEqual(['100 000 cm', '1 000 m', '1 km']);
    expect(unitChain(7 * UM.mm, 'cm').map((s) => s.text('de'))).toEqual(['0,7 cm', '7 mm']);
    expect(unitChain(50 * UM.m, 'cm').map((s) => s.text('de'))).toEqual(['5 000 cm', '50 m']);
  });

  it('Dezimaldarstellung ist exakt', () => {
    expect(decimalIn(1_625_000_000, 'km', 'de').text).toBe('1,625');
    expect(decimalIn(400, 'mm', 'de').text).toBe('0,4');
    expect(decimalIn(0, 'm', 'de').text).toBe('0');
    expect(bestUnit(0)).toBe('mm');
    expect(bestUnit(999_999)).toBe('cm');
    expect(bestUnit(UM.m)).toBe('m');
  });

  it('Grenzfälle: Strecke 0 und ungültige Werte', () => {
    expect(realFromImage(0, reduction(25000))).toEqual({ um: 0, exact: true });
    expect(mapMmFromMetres(0, 25000)).toBe(0);
    expect(mapMmFromMetres(-5, 25000)).toBe(0);
    expect(mapMmFromMetres(100, 0)).toBe(0);
    expect(realFromImage(-1, reduction(100))).toBeNull();
    expect(realFromImage(10, reduction(0))).toBeNull();
    expect(realFromImage(Number.NaN, reduction(100))).toBeNull();
    expect(imageFromReal(10, { image: 1, real: -3 })).toBeNull();
    expect(scaleFromLengths(0, UM.km)).toBeNull();
    expect(scaleFromLengths(cm(3), 0)).toBeNull();
    expect(solve('scale', cm(5), 0, 1)).toBeNull();
  });

  it('nicht aufgehende Aufgaben werden als gerundet gekennzeichnet', () => {
    const m = imageFromReal(UM.km, reduction(30000))!;
    expect(m.exact).toBe(false);
    expect(decimalIn(m.um, 'cm', 'de', 2).text).toBe('3,33');
    const s = scaleFromLengths(cm(7), 2 * UM.km)!;
    expect(s.exact).toBe(false);
    expect(s.scale.real).toBe(28571);
  });

  it('Rechenaufgaben: alle drei Richtungen passen zusammen', () => {
    expect(solve('real', cm(6), 0, 50000)).toEqual({ mapUm: cm(6), realUm: 3 * UM.km, n: 50000, exact: true });
    expect(solve('map', 0, UM.km, 25000)!.mapUm).toBe(cm(4));
    expect(solve('scale', cm(6), 3 * UM.km, 0)!.n).toBe(50000);
  });

  it('Plausibilität: Karte → Wirklichkeit → Karte über viele Zufallswerte', () => {
    const rnd = seededRandom(42);
    for (let i = 0; i < 2000; i++) {
      const mapMm = 1 + Math.floor(rnd() * 400);
      const n = [100, 1000, 5000, 10000, 25000, 50000, 100000, 200000][Math.floor(rnd() * 8)]!;
      const real = realFromImage(mapMm * UM.mm, reduction(n))!;
      expect(real.exact).toBe(true);
      const back = imageFromReal(real.um, reduction(n))!;
      expect(back).toEqual({ um: mapMm * UM.mm, exact: true });
      expect(scaleFromLengths(mapMm * UM.mm, real.um)!.scale.real).toBe(n);
      // Vergrößerung hin und zurück
      const z = [2, 5, 10, 20, 50][Math.floor(rnd() * 5)]!;
      const img = imageFromReal(mapMm * 10, enlargement(z))!;
      expect(realFromImage(img.um, enlargement(z))!.um).toBe(mapMm * 10);
    }
  });

  it('Zufallsaufgaben sind gut rechenbar', () => {
    const rnd = seededRandom(7);
    for (let i = 0; i < 300; i++) {
      const t = randomCalcTask(rnd);
      expect(t.mapMm % 5).toBe(0);
      const real = realUmFromMapMm(t.mapMm, t.n);
      expect(real).toBeGreaterThanOrEqual(UM.m);
      expect(solve('scale', t.mapMm * UM.mm, real, 0)!.n).toBe(t.n);
    }
  });

  it('Wegstrecke: kürzester Weg im Netz und abschnittsweise Messung', () => {
    const g: RoadGraph = {
      nodes: [
        { x: 0, y: 0 },
        { x: 1000, y: 0 },
        { x: 1000, y: 1000 },
        { x: 0, y: 1000 },
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
      ],
    };
    const route = shortestRoute(g, { x: 200, y: -10 }, { x: 1000, y: 600 });
    expect(route[0]).toEqual({ x: 200, y: 0 });
    expect(route[route.length - 1]).toEqual({ x: 1000, y: 600 });
    expect(route).toHaveLength(3);
    const pieces = routePiecesMm(route, 25000);
    expect(pieces.mm).toEqual([32, 24]);
    expect(pieces.total).toBe(56);
  });

  it('Landschaft: Prüfstrecken und zusammenhängendes Straßennetz', () => {
    const poi = (id: string) => POIS.find((p) => p.id === id)!;
    const d = (a: string, b: string) => Math.hypot(poi(a).x - poi(b).x, poi(a).y - poi(b).y);
    expect(d('church', 'station')).toBeCloseTo(1000, 6);
    expect(d('church', 'tower')).toBeCloseTo(3000, 6);
    expect(d('church', 'beach')).toBeCloseTo(2500, 6);
    expect(d('church', 'school')).toBeCloseTo(400, 6);
    expect(d('school', 'hall')).toBeCloseTo(500, 6);
    expect(mapMmFromMetres(d('church', 'station'), 25000)).toBe(40);
    for (const p of POIS) {
      expect(p.x).toBeGreaterThan(0);
      expect(p.x).toBeLessThan(WORLD.w);
      expect(p.y).toBeGreaterThan(0);
      expect(p.y).toBeLessThan(WORLD.h);
    }
    // von jedem Ort zu jedem anderen gibt es einen Weg, mindestens so lang wie die Luftlinie
    for (const a of POIS)
      for (const b of POIS) {
        if (a === b) continue;
        const r = shortestRoute(ROADS, a, b);
        expect(r.length).toBeGreaterThan(1);
        const len = r.slice(1).reduce((s, p, i) => s + Math.hypot(p.x - r[i]!.x, p.y - r[i]!.y), 0);
        expect(len).toBeGreaterThanOrEqual(Math.hypot(r[0]!.x - r[r.length - 1]!.x, r[0]!.y - r[r.length - 1]!.y) - 1e-6);
      }
  });
});
