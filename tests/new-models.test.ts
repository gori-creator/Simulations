import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core/anim';
import { expand, piecesFirst } from '../src/simulations/mathematik/binomische-formeln/model';
import { binomialMean, binomialPmf, binomialSd, statsFromCounts } from '../src/simulations/mathematik/galtonbrett/model';
import { drawOutcome, funnelHalfWidth, probabilities } from '../src/simulations/mathematik/gesetz-grosse-zahlen/model';
import { estimatePi, insideQuarterCircle } from '../src/simulations/mathematik/monte-carlo-pi/model';
import { arrangementAB, arrangementC, interpolate } from '../src/simulations/mathematik/pythagoras/model';
import { differenceQuotient, FUNCTIONS } from '../src/simulations/mathematik/sekante-tangente/model';
import { angleAt, positionToCircle } from '../src/simulations/mathematik/thales/model';
import { openedDoors, playRound, remainingDoor, winProbabilities } from '../src/simulations/mathematik/ziegenproblem/model';

describe('Thales', () => {
  it('liefert 90° für Punkte auf dem Kreis', () => {
    for (const phi of [10, 45, 100, 200, 300]) {
      const r = (phi * Math.PI) / 180;
      expect(angleAt([3 * Math.cos(r), 3 * Math.sin(r)], [-3, 0], [3, 0])).toBeCloseTo(90, 9);
    }
  });
  it('unterscheidet innen und außen', () => {
    expect(angleAt([0, 1], [-3, 0], [3, 0])).toBeGreaterThan(90);
    expect(angleAt([0, 5], [-3, 0], [3, 0])).toBeLessThan(90);
    expect(positionToCircle([0, 1], [0, 0], 3)).toBe('inside');
    expect(positionToCircle([0, 3], [0, 0], 3)).toBe('on');
    expect(positionToCircle([4, 0], [0, 0], 3)).toBe('outside');
  });
});

describe('Binomische Formeln', () => {
  it('setzt das Quadrat lückenlos aus vier Teilen zusammen', () => {
    const area = piecesFirst(5, 2).reduce((s, p) => s + p.w * p.h, 0);
    expect(area).toBe(49);
  });
  it('rechnet alle drei Formeln richtig aus', () => {
    for (const [a, b] of [[5, 2], [7.5, 3], [4, 4]] as const) {
      for (const f of ['1', '2', '3'] as const) {
        const e = expand(f, a, b);
        expect(e.terms.reduce((s, t) => s + t, 0)).toBeCloseTo(e.left);
        expect(e.right).toBeCloseTo(e.left);
      }
    }
  });
});

describe('Gesetz der großen Zahlen', () => {
  it('nähert sich der Wahrscheinlichkeit an', () => {
    const rand = seededRandom(42);
    const probs = probabilities('tack', 0.6);
    let hits = 0;
    const n = 20000;
    for (let i = 0; i < n; i++) if (drawOutcome(probs, rand) === 0) hits++;
    expect(Math.abs(hits / n - 0.6)).toBeLessThan(funnelHalfWidth(0.6, n) * 1.5);
  });
  it('hat Wahrscheinlichkeiten, die sich zu 1 addieren', () => {
    for (const e of ['coin', 'die', 'tack'] as const) expect(probabilities(e, 0.3).reduce((s, p) => s + p, 0)).toBeCloseTo(1);
  });
});

describe('Pythagoras (Ergänzungsbeweis)', () => {
  const area = (t: readonly (readonly [number, number])[]) =>
    Math.abs((t[1]![0] - t[0]![0]) * (t[2]![1] - t[0]![1]) - (t[2]![0] - t[0]![0]) * (t[1]![1] - t[0]![1])) / 2;

  it('überführt jedes Dreieck starr in seine Zielposition', () => {
    const from = arrangementC(3, 4);
    const to = arrangementAB(3, 4);
    from.forEach((t, i) => {
      const end = interpolate(t, to[i]!, 1);
      end.forEach((p, j) => {
        expect(p[0]).toBeCloseTo(to[i]![j]![0], 9);
        expect(p[1]).toBeCloseTo(to[i]![j]![1], 9);
      });
      expect(area(interpolate(t, to[i]!, 0.37))).toBeCloseTo(6, 9);
    });
  });
});

describe('Ziegenproblem', () => {
  it('öffnet nie die Autotür und nie die gewählte Tür', () => {
    const rand = seededRandom(7);
    for (let i = 0; i < 500; i++) {
      const doors = 3 + (i % 5);
      const car = Math.floor(rand() * doors);
      const chosen = Math.floor(rand() * doors);
      const rest = remainingDoor(doors, car, chosen, rand);
      const opened = openedDoors(doors, chosen, rest);
      expect(opened).not.toContain(car);
      expect(opened).not.toContain(chosen);
      expect(opened).toHaveLength(doors - 2);
    }
  });
  it('Wechseln gewinnt auf lange Sicht in etwa 2/3 der Fälle', () => {
    const rand = seededRandom(1);
    let wins = 0;
    const n = 30000;
    for (let i = 0; i < n; i++) if (playRound(3, rand).switchWins) wins++;
    expect(wins / n).toBeCloseTo(winProbabilities(3).switch, 1);
  });
});

describe('Monte-Carlo-π', () => {
  it('schätzt π ungefähr', () => {
    const rand = seededRandom(3);
    let hits = 0;
    const n = 50000;
    for (let i = 0; i < n; i++) if (insideQuarterCircle(rand(), rand())) hits++;
    expect(estimatePi(hits, n)).toBeCloseTo(Math.PI, 1);
  });
});

describe('Sekante → Tangente', () => {
  it('nähert sich für kleine h der Ableitung', () => {
    for (const def of Object.values(FUNCTIONS)) {
      expect(differenceQuotient(def.f, 0.7, 1e-6)).toBeCloseTo(def.df(0.7), 4);
    }
  });
});

describe('Galtonbrett', () => {
  it('Binomialverteilung summiert sich zu 1 und hat die richtigen Kennwerte', () => {
    const n = 12;
    const p = 0.3;
    const pmf = Array.from({ length: n + 1 }, (_, k) => binomialPmf(n, k, p));
    expect(pmf.reduce((s, x) => s + x, 0)).toBeCloseTo(1, 12);
    const stats = statsFromCounts(pmf.map((x) => x * 1e6));
    expect(stats.mean).toBeCloseTo(binomialMean(n, p), 6);
    expect(stats.sd).toBeCloseTo(binomialSd(n, p), 6);
  });
});
