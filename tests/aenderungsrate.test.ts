import { describe, expect, it } from 'vitest';
import {
  BACK_KNOTS,
  boxes,
  distance,
  DOUBLING,
  emptyAt,
  errorLadder,
  leftSum,
  meanRate,
  monotony,
  nextDouble,
  ownSituation,
  partialSums,
  polylineSituation,
  rateExtent,
  riemannSum,
  ruleSums,
  sampleHeights,
  samplePoint,
  segmentArea,
  signChanges,
  signedAreas,
  SITS,
  stockExtent,
  type Situation,
} from '../src/simulations/mathematik/aenderungsrate/model';

const OWN = ownSituation([2, 4, 0, -3, 1]);

/** einfacher reproduzierbarer Zufall */
function rnd(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

describe('Modell: Integral als Gesamtänderung – Prüfwerte der Leitung', () => {
  it('Auto: 100 m Beschleunigung, 600 m konstant, 100 m Bremsen – insgesamt 800 m', () => {
    expect(SITS.car.change(10)).toBe(100);
    expect(SITS.car.change(25)).toBe(400);
    expect(SITS.car.change(40)).toBe(700);
    expect(SITS.car.change(50)).toBe(800);
    expect(SITS.car.change(60)).toBe(800);
  });
  it('Auto auf [0; 10] mit Δt = 5 s: links 50 m, rechts 150 m, Mitte 100 m (exakt, da linear)', () => {
    expect(riemannSum(SITS.car, 10, 2, 'l')).toBe(50);
    expect(riemannSum(SITS.car, 10, 2, 'r')).toBe(150);
    expect(riemannSum(SITS.car, 10, 2, 'm')).toBe(100);
    expect(SITS.car.change(10)).toBe(100);
    expect(sampleHeights(SITS.car, 10, 2, 'l')).toEqual([0, 10]);
    expect(sampleHeights(SITS.car, 10, 2, 'r')).toEqual([10, 20]);
    expect(sampleHeights(SITS.car, 10, 2, 'm')).toEqual([5, 15]);
  });
});

describe('Modell: Situationen', () => {
  it('Tank: größte Füllmenge nach 20 min (+40 L), nach 40 min wieder Ausgangsmenge', () => {
    expect(SITS.tank.change(20)).toBe(40);
    expect(SITS.tank.change(30)).toBeCloseTo(30, 12);
    expect(SITS.tank.change(40)).toBeCloseTo(0, 12);
    expect(SITS.tank.rate(20)).toBe(0);
  });
  it('Tank: bis 40 min fließen 40 L zu und 40 L ab – insgesamt 80 L bewegt', () => {
    expect(distance(SITS.tank, 20)).toBeCloseTo(40, 12);
    expect(distance(SITS.tank, 30)).toBeCloseTo(50, 12);
    expect(distance(SITS.tank, 40)).toBeCloseTo(80, 12);
  });
  it('Radfahrt: s(30) = 150 + 180/π ≈ 207,3 m, s(60) = 300 m, s(120) = 600 m', () => {
    expect(SITS.bike.change(30)).toBeCloseTo(150 + 180 / Math.PI, 12);
    expect(SITS.bike.change(30)).toBeCloseTo(207.3, 1);
    expect(SITS.bike.change(60)).toBeCloseTo(300, 12);
    expect(SITS.bike.change(120)).toBeCloseTo(600, 12);
    // Durchschnittsgeschwindigkeit über volle Perioden: 5 m/s
    expect(meanRate(SITS.bike, 120)).toBeCloseTo(5, 12);
    expect(rateExtent(SITS.bike).lo).toBeCloseTo(2, 4);
    expect(rateExtent(SITS.bike).hi).toBeCloseTo(8, 4);
  });
  it('Vor und zurück: 60 m vorwärts, 30 m rückwärts – Gesamtänderung 30 m, Weg 90 m', () => {
    const s = SITS.back;
    expect(s.T).toBe(40);
    expect(s.rate(10)).toBe(4);
    expect(s.rate(30)).toBe(-2);
    expect(s.change(5)).toBe(10);
    expect(s.change(15)).toBe(50);
    expect(s.change(20)).toBe(60);
    expect(s.change(25)).toBe(55);
    expect(s.change(40)).toBe(30);
    expect(distance(s, 40)).toBe(90);
    expect(distance(s, 20)).toBe(60);
    const a = signedAreas(s, 40);
    expect(a.pos).toBeCloseTo(60, 12);
    expect(a.neg).toBeCloseTo(-30, 12);
    // weitester Punkt bei t = 20 s
    const e = signChanges(s);
    expect(e).toHaveLength(1);
    expect(e[0]!.kind).toBe('max');
    expect(e[0]!.t).toBeCloseTo(20, 6);
    expect(BACK_KNOTS.at(-1)![0]).toBe(40);
  });
  it('Durchschnittsgeschwindigkeit des Autos: 800 m / 60 s ≈ 13,3 m/s, nach 10 s 10 m/s', () => {
    expect(meanRate(SITS.car, 60)).toBeCloseTo(40 / 3, 12);
    expect(meanRate(SITS.car, 10)).toBe(10);
    expect(meanRate(SITS.car, 0)).toBe(0);
  });
});

describe('Modell: Rechtecksummen', () => {
  it('Rechtecksummen: links, rechts, Mitte (Tank bis 20 min, 2 Streifen: 60 L, 20 L, 40 L)', () => {
    expect(leftSum(SITS.tank, 20, 2)).toBe(60);
    expect(riemannSum(SITS.tank, 20, 2, 'r')).toBe(20);
    // lineare Rate: Mittelpunktsregel ist exakt
    expect(riemannSum(SITS.tank, 20, 2, 'm')).toBeCloseTo(40, 12);
    expect(Math.abs(leftSum(SITS.tank, 20, 200) - 40)).toBeLessThan(0.3);
    // Auto, 6 Streifen à 10 s: 0 + 20 + 20 + 20 + 20 + 0 = 80 m/s → 800 m
    expect(riemannSum(SITS.car, 60, 6, 'l')).toBe(800);
    expect(riemannSum(SITS.car, 60, 6, 'r')).toBe(800);
    // Auto bis 25 s, 5 Streifen (Δt = 5 s): links 0 + 10 + 20 + 20 + 20 → 350 m
    expect(riemannSum(SITS.car, 25, 5, 'l')).toBe(350);
    expect(riemannSum(SITS.car, 25, 5, 'r')).toBe(450);
    expect(riemannSum(SITS.car, 25, 5, 'm')).toBe(400);
  });
  it('Grenzfälle: keine Streifen oder t = 0 ergeben 0', () => {
    expect(riemannSum(SITS.car, 25, 0)).toBe(0);
    expect(riemannSum(SITS.car, 0, 5)).toBe(0);
    expect(partialSums(SITS.car, 0, 3)).toEqual([0]);
    expect(sampleHeights(SITS.car, 25, 0)).toEqual([]);
    expect(boxes(SITS.car, 25, 0)).toEqual([]);
  });
  it('Stelle tᵢ: links, rechts, Mitte', () => {
    expect(samplePoint(2, 5, 'l')).toBe(10);
    expect(samplePoint(2, 5, 'r')).toBe(15);
    expect(samplePoint(2, 5, 'm')).toBe(12.5);
  });
  it('Fehler der linken Summe halbiert sich etwa bei doppelter Streifenzahl', () => {
    const e = (n: number) => Math.abs(leftSum(SITS.tank, 20, n) - 40);
    expect(e(4)).toBeCloseTo(10, 12);
    expect(e(8)).toBeCloseTo(5, 12);
    expect(e(16)).toBeCloseTo(2.5, 12);
  });
  it('Fehlerleiter 1, 2, 4, …, 64: links halbiert sich der Fehler genau (lineare Rate)', () => {
    const lad = errorLadder(SITS.tank, 20, 'l');
    expect(lad.map((x) => x.n)).toEqual([...DOUBLING]);
    expect(lad[0]!.err).toBeCloseTo(40, 12);
    for (let i = 1; i < lad.length; i++) expect(lad[i]!.err / lad[i - 1]!.err).toBeCloseTo(0.5, 12);
    // Mitte bei linearer Rate: immer exakt
    for (const x of errorLadder(SITS.tank, 20, 'm')) expect(x.err).toBeCloseTo(0, 10);
  });
  it('Mittelsumme bei gekrümmter Rate: Fehler etwa ein Viertel bei doppelter Streifenzahl', () => {
    const lad = errorLadder(SITS.bike, 45, 'm', [8, 16, 32, 64]);
    for (let i = 1; i < lad.length; i++) expect(lad[i]!.err / lad[i - 1]!.err).toBeCloseTo(0.25, 2);
  });
  it('Verdoppeln: 0 → 1 → 2 → … → 64, nicht darüber', () => {
    expect(nextDouble(0)).toBe(1);
    expect(nextDouble(1)).toBe(2);
    expect(nextDouble(5)).toBe(10);
    expect(nextDouble(32)).toBe(64);
    expect(nextDouble(40)).toBe(64);
    expect(nextDouble(64)).toBe(64);
  });
  it('Teilsummen enden bei der Rechtecksumme', () => {
    const ps = partialSums(SITS.tank, 20, 2);
    expect(ps).toEqual([0, 40, 60]);
    expect(partialSums(SITS.bike, 90, 7, 'm').at(-1)).toBeCloseTo(riemannSum(SITS.bike, 90, 7, 'm'), 12);
  });
  it('Alle drei Summen auf einen Blick; Rechtecke mit Höhe an der Stützstelle', () => {
    const r = ruleSums(SITS.car, 25, 5);
    expect(r).toEqual({ l: 350, r: 450, m: 400, exact: 400 });
    const b = boxes(SITS.car, 25, 5, 'm');
    expect(b).toHaveLength(5);
    expect(b[0]).toEqual({ l: 0, r: 5, h: 5, at: 2.5 });
    expect(b[4]!.r).toBe(25);
  });
  it('Monotonie: wachsend, fallend, konstant oder keins', () => {
    expect(monotony(SITS.car, 0, 10)).toBe('inc');
    expect(monotony(SITS.car, 0, 25)).toBe('inc');
    expect(monotony(SITS.car, 15, 35)).toBe('const');
    expect(monotony(SITS.tank, 0, 40)).toBe('dec');
    expect(monotony(SITS.car, 0, 60)).toBe(null);
    expect(monotony(SITS.car, 5, 5)).toBe(null);
  });
});

describe('Modell: Zu- und Abfluss, Extremstellen, eigene Rate', () => {
  it('Zu- und Abfluss: Tank bis 40 min +40 L und −40 L', () => {
    const a = signedAreas(SITS.tank, 40);
    expect(a.pos).toBeCloseTo(40, 3);
    expect(a.neg).toBeCloseTo(-40, 3);
    expect(signedAreas(SITS.car, 60).neg).toBe(0);
    expect(signedAreas(SITS.car, 0)).toEqual({ pos: 0, neg: 0 });
  });
  it('Vorzeichenwechsel der Rate: Extremstellen des Bestands', () => {
    const tank = signChanges(SITS.tank);
    expect(tank).toHaveLength(1);
    expect(tank[0]!.kind).toBe('max');
    expect(tank[0]!.t).toBeCloseTo(20, 6);
    // Auto steht am Ende: Rate 0, aber kein Vorzeichenwechsel
    expect(signChanges(SITS.car)).toHaveLength(0);
    expect(signChanges(SITS.bike)).toHaveLength(0);
    const own = signChanges(OWN);
    expect(own.map((x) => x.kind)).toEqual(['max', 'min']);
    expect(own[0]!.t).toBeCloseTo(20, 6);
    expect(own[1]!.t).toBeCloseTo(37.5, 6);
  });
  it('Eigene Rate (Streckenzug): Trapezflächen', () => {
    expect(OWN.T).toBe(40);
    expect(OWN.rate(5)).toBe(3);
    expect(OWN.rate(35)).toBe(-1);
    expect(OWN.change(10)).toBe(30);
    expect(OWN.change(20)).toBe(50);
    expect(OWN.change(30)).toBe(35);
    expect(OWN.change(37.5)).toBeCloseTo(23.75, 12);
    expect(OWN.change(40)).toBe(25);
  });
  it('Eigene Rate: Betrag 30 + 20 + 15 + 11,25 + 1,25 = 77,5 L; außerhalb [0; T] begrenzt', () => {
    expect(distance(OWN, 40)).toBeCloseTo(77.5, 12);
    expect(OWN.change(50)).toBe(25);
    expect(OWN.rate(-3)).toBe(2);
    expect(OWN.rate(55)).toBe(1);
  });
  it('Flächen unter einer Strecke: Trapez und zwei Dreiecke', () => {
    expect(segmentArea(2, 4, 10)).toBe(30);
    expect(segmentArea(0, -3, 10)).toBe(-15);
    expect(segmentArea(-3, 1, 10)).toBe(-10);
    expect(segmentArea(-3, 1, 10, true)).toBeCloseTo(11.25 + 1.25, 12);
    expect(segmentArea(5, 5, 0)).toBe(0);
  });
  it('Bestand: Bereich und Tank leer (eigene Rate mit V(0) = 30 L bleibt über 53 L)', () => {
    const e = stockExtent(OWN, 30);
    expect(e.hi).toBeCloseTo(80, 6);
    expect(e.lo).toBe(30);
    expect(stockExtent(SITS.back, 0).hi).toBeCloseTo(60, 6);
    expect(emptyAt(OWN, 30)).toBe(null);
    // Tank mit 0 L Anfangsmenge wird nie leer (V(40) = 0, nicht darunter)
    expect(emptyAt(SITS.tank, 0)).toBe(null);
    // nur Abfluss −2 L/min bei 10 L: nach 5 min leer
    const drain = polylineSituation([
      [0, -2],
      [20, -2],
    ]);
    expect(emptyAt(drain, 10)).toBeCloseTo(5, 6);
    expect(emptyAt(drain, -1)).toBe(0);
  });
});

describe('Modell: Plausibilität über viele Zufallswerte', () => {
  const all: [string, Situation][] = [
    ['car', SITS.car],
    ['tank', SITS.tank],
    ['bike', SITS.bike],
    ['back', SITS.back],
    ['own', OWN],
  ];
  it('Änderung = numerisches Integral der Rate; Ableitung der Änderung = Rate', () => {
    const r = rnd(7);
    for (const [, s] of all) {
      const kinks = s.kinks ?? [];
      for (let i = 0; i < 20; i++) {
        const t = r() * s.T;
        expect(riemannSum(s, t, 20000, 'm')).toBeCloseTo(s.change(t), 2);
        const h = 1e-5;
        if ([10, 20, 30, 40, 50, ...kinks].every((b) => Math.abs(t - b) > 1e-3)) expect((s.change(t + h) - s.change(t - h)) / (2 * h)).toBeCloseTo(s.rate(t), 4);
      }
    }
  });
  it('Betrag: exakt hinterlegtes ∫|r| stimmt mit der Mittelpunktsregel überein, ∫|r| ≥ |∫r|', () => {
    const r = rnd(11);
    for (const [, s] of all) {
      for (let i = 0; i < 15; i++) {
        const t = r() * s.T;
        let num = 0;
        const steps = 20000;
        for (let k = 0; k < steps; k++) num += Math.abs(s.rate(((k + 0.5) * t) / steps)) * (t / steps);
        expect(distance(s, t)).toBeCloseTo(num, 2);
        expect(distance(s, t)).toBeGreaterThanOrEqual(Math.abs(s.change(t)) - 1e-9);
      }
    }
  });
  it('Mittelsumme konvergiert mit wachsendem n gegen das exakte Integral', () => {
    const r = rnd(23);
    for (const [, s] of all) {
      for (let i = 0; i < 10; i++) {
        const t = 1 + r() * (s.T - 1);
        const exact = s.change(t);
        const e = (n: number) => Math.abs(riemannSum(s, t, n, 'm') - exact);
        expect(e(4096)).toBeLessThan(1e-3 * Math.max(1, Math.abs(exact)));
        expect(e(4096)).toBeLessThanOrEqual(e(16) + 1e-9);
      }
    }
  });
  it('Monotone Rate: linke und rechte Summe schließen das Integral ein', () => {
    const r = rnd(5);
    const check = (s: Situation, t: number, n: number) => {
      const { l, r: rr, exact } = ruleSums(s, t, n);
      const m = monotony(s, 0, t);
      if (m === 'inc' || m === 'const') {
        expect(l).toBeLessThanOrEqual(exact + 1e-9);
        expect(rr).toBeGreaterThanOrEqual(exact - 1e-9);
      } else if (m === 'dec') {
        expect(rr).toBeLessThanOrEqual(exact + 1e-9);
        expect(l).toBeGreaterThanOrEqual(exact - 1e-9);
      }
      return m;
    };
    for (let i = 0; i < 40; i++) {
      // Auto beschleunigt bzw. fährt konstant bis 40 s
      expect(check(SITS.car, 0.5 + r() * 39.5, 1 + Math.floor(r() * 30))).not.toBe(null);
      // Tank: fallende Rate
      expect(check(SITS.tank, 0.5 + r() * 39.5, 1 + Math.floor(r() * 30))).toBe('dec');
      // zufällige wachsende eigene Rate
      const v = [0, 0, 0, 0, 0].map(() => r() * 2);
      const inc = ownSituation(v.map((_, k) => v.slice(0, k + 1).reduce((a, b) => a + b, -5)));
      expect(check(inc, 1 + r() * 39, 1 + Math.floor(r() * 30))).not.toBe('dec');
    }
  });
});
