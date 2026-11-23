import { describe, expect, it } from 'vitest';
import {
  align,
  angDiff,
  breakMagnet,
  compassAngle,
  dipoleField,
  earthField,
  fieldRatio,
  forceOn,
  induced,
  inclination,
  interaction,
  mag,
  magnetization,
  magnetsField,
  makeDomains,
  paperclips,
  poles,
  rng,
  seeds,
  shake,
  THINGS,
  thingOrder,
  traceLine,
  type Magnet,
} from '../src/simulations/physik/magnete/model';

const bar = (x: number, ang = 0, len = 6): Magnet => ({ x, y: 0, ang, len, q: 1 });

describe('Pole und Kräfte', () => {
  it('ungleiche Pole ziehen sich an, gleiche stoßen sich ab', () => {
    // N von a zeigt nach rechts zu S von b → Anziehung
    expect(interaction([bar(-5), bar(5)], 0, 1)).toBe(1);
    // b umgedreht: N trifft auf N → Abstoßung
    expect(interaction([bar(-5), bar(5, Math.PI)], 0, 1)).toBe(-1);
    // S trifft auf S → Abstoßung
    expect(interaction([bar(-5, Math.PI), bar(5)], 0, 1)).toBe(-1);
  });
  it('Eisen wird von beiden Polen angezogen', () => {
    for (const ang of [0, Math.PI]) {
      const a = bar(-5, ang);
      const iron = induced([a], 4, 0, 4, 40);
      expect(iron.q).toBeGreaterThan(0);
      expect(interaction([a, iron], 0, 1)).toBe(1);
    }
  });
  it('actio = reactio: die Kräfte sind entgegengesetzt gleich', () => {
    const ms = [bar(-4, 0.3), { x: 5, y: 2, ang: 2, len: 5, q: 1.5 }];
    const a = forceOn(ms, 0).F;
    const b = forceOn(ms, 1).F;
    expect(a[0] + b[0]).toBeCloseTo(0, 12);
    expect(a[1] + b[1]).toBeCloseTo(0, 12);
  });
  it('näher heißt stärker', () => {
    const near = mag(forceOn([bar(-4), bar(4)], 1).F);
    const far = mag(forceOn([bar(-6), bar(6)], 1).F);
    expect(near).toBeGreaterThan(far);
  });
  it('ein schräg stehender Magnet wird in Feldrichtung gedreht', () => {
    // Magnet rechts, um +30° gedreht, im Feld eines links liegenden → Drehmoment zurück (negativ)
    const t = forceOn([bar(-8), { x: 8, y: 0, ang: Math.PI / 6, len: 4, q: 1 }], 1).torque;
    expect(t).toBeLessThan(0);
  });
});

describe('Feld', () => {
  it('Dipol: auf der Achse ∝ 1/r³, seitlich halb so stark und entgegengesetzt', () => {
    const b1 = dipoleField(1, 0, 2, 0)[0];
    const b2 = dipoleField(1, 0, 4, 0)[0];
    expect(b1 / b2).toBeCloseTo(8, 12);
    expect(b1).toBeCloseTo(2 / 8, 12);
    const side = dipoleField(1, 0, 0, 2)[0];
    expect(side / b1).toBeCloseTo(-0.5, 12);
  });
  it('Stabmagnet: in großer Entfernung wie ein Dipol (Faktor 8 bei doppeltem Abstand)', () => {
    const m = [bar(0, 0, 2)];
    const r = mag(magnetsField(m, 60, 0)) / mag(magnetsField(m, 120, 0));
    expect(r).toBeCloseTo(8, 1);
  });
  it('symmetrisch: oben und unten gespiegelt', () => {
    const m = [bar(0)];
    const a = magnetsField(m, 2, 3);
    const b = magnetsField(m, 2, -3);
    expect(a[0]).toBeCloseTo(b[0], 12);
    expect(a[1]).toBeCloseTo(-b[1], 12);
  });
  it('Feldlinien laufen vom Nord- zum Südpol', () => {
    const m = [bar(0)];
    const [n, s] = poles(m[0]!);
    const line = traceLine((x, y) => magnetsField(m, x, y), n.x, n.y + 0.5, { step: 0.05, maxSteps: 4000, box: { x0: -30, x1: 30, y0: -30, y1: 30 }, stops: [{ x: s.x, y: s.y, r: 0.4 }] });
    const end = line.at(-1)!;
    expect(Math.hypot(end[0] - s.x, end[1] - s.y)).toBeLessThan(0.45);
    expect(seeds(m, 12)).toHaveLength(12);
  });
});

describe('Kompass', () => {
  it('Nordpol der Nadel zeigt zum Südpol des Magneten', () => {
    // Magnet: Nordpol rechts. Links vom Südpol zeigt die Nadel nach rechts (90°).
    const [bx, by] = magnetsField([bar(0)], -6, 0);
    expect((compassAngle(bx, by) * 180) / Math.PI).toBeCloseTo(90, 6);
    // Rechts vom Nordpol zeigt die Nadel vom Magneten weg (auch 90°, also nach rechts)
    const [cx, cy] = magnetsField([bar(0)], 6, 0);
    expect((compassAngle(cx, cy) * 180) / Math.PI).toBeCloseTo(90, 6);
  });
  it('ohne Magnet zeigt die Nadel nach Norden', () => {
    expect(compassAngle(0, 0, 1)).toBe(0);
  });
});

describe('Elementarmagnete', () => {
  it('ungeordnet kaum magnetisch, geordnet voll magnetisch', () => {
    const ds = makeDomains(20, 10, 3);
    expect(magnetization(ds).M).toBeLessThan(0.15);
    align(ds, 0, 1);
    expect(magnetization(ds).M).toBeCloseTo(1, 12);
    expect(magnetization(ds).mx).toBeCloseTo(1, 12);
  });
  it('Streichen macht magnetisch, Erschüttern wieder weniger', () => {
    const ds = makeDomains(20, 10, 5);
    for (let i = 0; i < 6; i++) align(ds, Math.PI, 0.5);
    const M1 = magnetization(ds).M;
    expect(M1).toBeGreaterThan(0.9);
    shake(ds, Math.PI, rng(9));
    expect(magnetization(ds).M).toBeLessThan(M1 * 0.5);
  });
  it('Büroklammern und kürzeste Drehung', () => {
    expect(paperclips(0.1)).toBe(0);
    expect(paperclips(1)).toBe(8);
    expect(paperclips(0.6)).toBe(4);
    expect(angDiff(0.1, 2 * Math.PI - 0.1)).toBeCloseTo(-0.2, 12);
  });
  it('zerbrochener Magnet: jedes Stück hat wieder Nord- und Südpol', () => {
    const parts = breakMagnet(bar(0, 0, 12), 3);
    expect(parts).toHaveLength(3);
    for (const p of parts) {
      const [n, s] = poles(p);
      expect(n.q).toBeGreaterThan(0);
      expect(s.q).toBeLessThan(0);
      expect(n.x).toBeGreaterThan(s.x);
    }
  });
});

describe('Erdmagnetfeld', () => {
  it('Inklination: Äquator 0°, 45° → 63,4°, Pol 90°', () => {
    expect(inclination(0)).toBeCloseTo(0, 12);
    expect(inclination(45)).toBeCloseTo(63.435, 3);
    expect(inclination(89.999)).toBeCloseTo(90, 2);
    // Mitte Deutschlands (≈ 51°): etwa 68°
    expect(inclination(51)).toBeCloseTo(68.0, 0);
  });
  it('an den Polen doppelt so stark wie am Äquator', () => {
    expect(fieldRatio(90)).toBeCloseTo(2, 12);
    expect(fieldRatio(0)).toBe(1);
  });
  it('Kompass auf der Nordhalbkugel zeigt nach Norden (zum magnetischen Südpol)', () => {
    // Punkt am Äquator rechts der Erde (x = 1, y = 0): Feld zeigt nach oben (Norden)
    const [bx, by] = earthField(1, 0, 0);
    expect(by).toBeGreaterThan(0);
    expect(Math.abs(bx)).toBeLessThan(1e-12);
    // Oberhalb des Nordpols zeigt das Feld nach unten in die Erde
    expect(earthField(0, 1, 0)[1]).toBeLessThan(0);
  });
});

describe('Gegenstände', () => {
  it('Eisen ja, Aluminium nein, Mischung fest', () => {
    expect(THINGS.find((t) => t.id === 'nail')!.magnetic).toBe(true);
    expect(THINGS.find((t) => t.id === 'foil')!.magnetic).toBe(false);
    expect(THINGS.filter((t) => t.magnetic)).toHaveLength(6);
    expect(thingOrder(1).map((t) => t.id)).toEqual(thingOrder(1).map((t) => t.id));
    expect(new Set(thingOrder(2).map((t) => t.id)).size).toBe(THINGS.length);
  });
});
