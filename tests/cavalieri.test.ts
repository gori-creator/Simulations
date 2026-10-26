import { describe, expect, it } from 'vitest';
import {
  areaAt,
  axisOffset,
  axisRange,
  baseArea,
  buildSlabs,
  isExactTo,
  section,
  sectionArea,
  slabIndexAt,
  sphereParts,
  splitSlabs,
  stackVolume,
  stackVolumeFormula,
  volume,
  type BodyKind,
  type Dims,
} from '../src/simulations/mathematik/cavalieri/model';

const D: Dims = { r: 3, a: 4, h: 5 };
const KINDS: BodyKind[] = ['zyl', 'prisma', 'kegel', 'pyr', 'kugel'];

describe('Modell: Prinzip von Cavalieri – Volumina', () => {
  it('Zylinder r = 3 cm, h = 5 cm: V = 45π cm³', () => {
    expect(volume('zyl', D)).toBeCloseTo(45 * Math.PI, 12);
    expect(baseArea('zyl', D)).toBeCloseTo(9 * Math.PI, 12);
  });
  it('Prisma a = 4 cm, h = 5 cm: V = 80 cm³; Pyramide: ⅓ davon', () => {
    expect(volume('prisma', D)).toBeCloseTo(80, 12);
    expect(volume('pyr', D)).toBeCloseTo(80 / 3, 12);
  });
  it('Kegel r = 3 cm, h = 5 cm: V = 15π cm³', () => {
    expect(volume('kegel', D)).toBeCloseTo(15 * Math.PI, 12);
  });
  it('Halbkugel = Zylinder − Kegel = ⅔πr³, Kugel = ⁴⁄₃πr³', () => {
    const p = sphereParts(3);
    expect(p.cylinder - p.cone).toBeCloseTo(p.hemisphere, 12);
    expect(p.hemisphere).toBeCloseTo(18 * Math.PI, 12);
    expect(p.sphere).toBeCloseTo(36 * Math.PI, 12);
    expect(volume('kugel', D)).toBeCloseTo(18 * Math.PI, 12);
  });
});

describe('Modell: Prinzip von Cavalieri – Querschnitte', () => {
  it('gleiche Querschnitte in jeder Höhe, egal wie verschoben oder gebogen', () => {
    for (const kind of KINDS) {
      for (const sh of [
        { s: 0, k: 0 },
        { s: 2.5, k: 0 },
        { s: -3, k: 1.5 },
        { s: 1, k: -2 },
      ]) {
        for (let i = 0; i <= 20; i++) {
          const z = (i / 20) * (kind === 'kugel' ? D.r : D.h);
          expect(areaAt(kind, D, z, 2, sh), `${kind} z=${z}`).toBeCloseTo(areaAt(kind, D, z, 1), 12);
        }
      }
    }
  });
  it('Kugel: Kreisring π(r² − z²) = Kreisfläche der Halbkugel; bei z = r beide 0', () => {
    for (const z of [0, 0.5, 1.5, 2, 2.9]) {
      const disc = section('kugel', D, 1, z);
      const ring = section('kugel', D, 2, z);
      expect(sectionArea('kugel', disc)).toBeCloseTo(Math.PI * (9 - z * z), 12);
      expect(sectionArea('kugel', ring)).toBeCloseTo(Math.PI * 9 - Math.PI * z * z, 12);
      expect(ring.inner).toBeCloseTo(z, 12);
    }
    expect(areaAt('kugel', D, 3, 1)).toBeCloseTo(0, 12);
    expect(areaAt('kugel', D, 3, 2)).toBeCloseTo(0, 12);
    expect(areaAt('kugel', D, 0, 1)).toBeCloseTo(9 * Math.PI, 12);
  });
  it('Kegel und Pyramide: Querschnitt schrumpft mit (1 − z/h)², Spitze hat Fläche 0', () => {
    expect(areaAt('kegel', D, 2.5)).toBeCloseTo(9 * Math.PI * 0.25, 12);
    expect(areaAt('pyr', D, 2.5)).toBeCloseTo(4, 12);
    expect(areaAt('kegel', D, 5)).toBeCloseTo(0, 12);
    expect(areaAt('pyr', D, 5)).toBeCloseTo(0, 12);
  });
  it('Höhen außerhalb des Körpers werden auf 0 … h begrenzt', () => {
    expect(areaAt('zyl', D, -1)).toBeCloseTo(9 * Math.PI, 12);
    expect(areaAt('kegel', D, 7)).toBeCloseTo(0, 12);
  });
  it('Achse: c(0) = 0, c(1) = s, c(½) = s/2 + k', () => {
    const sh = { s: 2, k: 1.5 };
    expect(axisOffset(sh, 0)).toBe(0);
    expect(axisOffset(sh, 1)).toBeCloseTo(2, 12);
    expect(axisOffset(sh, 0.5)).toBeCloseTo(2.5, 12);
    const [lo, hi] = axisRange(sh);
    expect(lo).toBe(0);
    // Scheitel bei t = (s + 4k)/(8k) = 8/12, c = 2·⅔ + 6·⅔·⅓ = 8/3
    expect(hi).toBeCloseTo(8 / 3, 12);
    expect(axisRange({ s: -3, k: 0 })).toEqual([-3, 0]);
  });
});

describe('Modell: Prinzip von Cavalieri – Scheibenstapel', () => {
  it('Zylinder- und Prismenstapel haben für jedes n genau das Körpervolumen', () => {
    for (const n of [1, 3, 12, 40]) {
      expect(stackVolume('zyl', buildSlabs('zyl', D, 2, n, { s: 3, k: -1 }))).toBeCloseTo(45 * Math.PI, 9);
      expect(stackVolume('prisma', buildSlabs('prisma', D, 1, n))).toBeCloseTo(80, 9);
    }
  });
  it('Kegelstapel: G · h · (n + 1)(2n + 1)/(6n²), nähert sich ⅓ · G · h', () => {
    for (const n of [1, 2, 5, 12, 49]) {
      const v = stackVolume('kegel', buildSlabs('kegel', D, 1, n));
      expect(v).toBeCloseTo(stackVolumeFormula('kegel', D, n), 9);
      expect(v).toBeGreaterThan(volume('kegel', D));
    }
    expect(stackVolumeFormula('kegel', D, 1)).toBeCloseTo(45 * Math.PI, 9); // eine Scheibe = Zylinder
    expect(stackVolumeFormula('pyr', D, 100000)).toBeCloseTo(80 / 3, 3);
  });
  it('Halbkugel- und Restkörperstapel sind für jedes n gleich groß (Cavalieri für Stapel)', () => {
    for (const n of [1, 4, 10, 33]) {
      const a = stackVolume('kugel', buildSlabs('kugel', D, 1, n));
      const b = stackVolume('kugel', buildSlabs('kugel', D, 2, n));
      expect(a).toBeCloseTo(b, 9);
      expect(a).toBeCloseTo(stackVolumeFormula('kugel', D, n), 9);
    }
    expect(stackVolumeFormula('kugel', D, 1)).toBeCloseTo(27 * Math.PI, 9);
    expect(stackVolumeFormula('kugel', D, 1e6)).toBeCloseTo(18 * Math.PI, 3);
  });
  it('glatter Körper (n = ∞) aus Stücken: Volumen wie der Körper', () => {
    expect(stackVolume('kegel', buildSlabs('kegel', D, 2, Infinity, { s: 2, k: 0 }))).toBeCloseTo(15 * Math.PI, 9);
    expect(stackVolume('pyr', buildSlabs('pyr', D, 2, Infinity, { s: -1, k: 1 }))).toBeCloseTo(80 / 3, 9);
    expect(stackVolume('kugel', buildSlabs('kugel', D, 1, Infinity, undefined, 400))).toBeCloseTo(18 * Math.PI, 2);
    expect(stackVolumeFormula('zyl', D, Infinity)).toBeCloseTo(45 * Math.PI, 12);
  });
  it('Schnitt teilt Scheiben, ohne Volumen zu verlieren', () => {
    const slabs = buildSlabs('kegel', D, 2, Infinity, { s: 2, k: 1 });
    const { below, above } = splitSlabs(slabs, 1.73);
    expect(below.at(-1)!.z1).toBeCloseTo(1.73, 12);
    expect(above[0]!.z0).toBeCloseTo(1.73, 12);
    expect(stackVolume('kegel', below) + stackVolume('kegel', above)).toBeCloseTo(stackVolume('kegel', slabs), 9);
    const stack = buildSlabs('zyl', D, 1, 5);
    const parts = splitSlabs(stack, 2);
    expect(parts.below.length).toBe(2);
    expect(parts.above.length).toBe(3);
  });
  it('findet die Scheibe in der Höhe z', () => {
    expect(slabIndexAt('zyl', D, 5, 0)).toBe(0);
    expect(slabIndexAt('zyl', D, 5, 2.2)).toBe(2);
    expect(slabIndexAt('zyl', D, 5, 5)).toBe(4);
  });
});

describe('Modell: Prinzip von Cavalieri – Aufgaben aus dem Lernmaterial', () => {
  it('Aufgabe 1: schiefer Zylinder r = 2 cm, h = 6 cm: V = 24π ≈ 75,40 cm³', () => {
    expect(volume('zyl', { r: 2, a: 4, h: 6 })).toBeCloseTo(75.398, 3);
    expect(areaAt('zyl', { r: 2, a: 4, h: 6 }, 4, 2, { s: 3, k: 0 })).toBeCloseTo(4 * Math.PI, 12);
  });
  it('Aufgabe 2: Pyramide a = 6 cm, h = 5 cm: A(2) = 12,96 cm², V = 60 cm³ (exakt)', () => {
    const d = { r: 3, a: 6, h: 5 };
    expect(2 * section('pyr', d, 2, 2, { s: 3, k: 0 }).outer).toBeCloseTo(3.6, 12);
    expect(areaAt('pyr', d, 2, 2, { s: 3, k: 0 })).toBeCloseTo(12.96, 12);
    expect(volume('pyr', d)).toBeCloseTo(60, 12);
    expect(isExactTo(volume('pyr', d), 2)).toBe(true);
  });
  it('Aufgabe 4: Kugel r = 3 cm: A(2) = 5π ≈ 15,71 cm², V = 36π ≈ 113,10 cm³', () => {
    expect(areaAt('kugel', D, 2, 1)).toBeCloseTo(5 * Math.PI, 12);
    expect(areaAt('kugel', D, 2, 2)).toBeCloseTo(5 * Math.PI, 12);
    expect(sphereParts(3).sphere).toBeCloseTo(113.097, 3);
  });
  it('Aufgabe 5: Kegelstapel mit 4 Scheiben = 21,09375π ≈ 66,27 cm³, etwa 41 % zu groß', () => {
    const v = stackVolumeFormula('kegel', D, 4);
    expect(v).toBeCloseTo(21.09375 * Math.PI, 9);
    expect(stackVolume('kegel', buildSlabs('kegel', D, 1, 4))).toBeCloseTo(v, 9);
    expect(v / volume('kegel', D) - 1).toBeCloseTo(0.40625, 9);
  });
});

describe('Anzeige: „=“ nur bei exakten Werten', () => {
  it('erkennt exakte und gerundete Werte', () => {
    expect(isExactTo(80, 2)).toBe(true);
    expect(isExactTo(12.96, 2)).toBe(true);
    expect(isExactTo(3 * (1 - 0.4) * 2, 2)).toBe(true); // 3,6000000000000005
    expect(isExactTo(0, 2)).toBe(true);
    expect(isExactTo(50.625, 2)).toBe(false);
    expect(isExactTo(36 * Math.PI, 2)).toBe(false);
    expect(isExactTo(80 / 3, 2)).toBe(false);
    expect(isExactTo(5 / 12, 2)).toBe(false);
  });
  it('Prisma: V = a² · h ist für alle Reglerwerte exakt auf zwei Stellen oder wird als „≈“ erkannt', () => {
    for (let a = 1; a <= 6; a += 0.5) {
      for (let h = 2; h <= 8; h += 0.5) {
        const v = volume('prisma', { r: 3, a, h });
        expect(isExactTo(v, 2)).toBe(Math.abs(v * 100 - Math.round(v * 100)) < 1e-6);
      }
    }
  });
});
