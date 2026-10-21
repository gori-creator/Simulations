import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import {
  openedDoors,
  playRound,
  playRoundUninformed,
  relationSign,
  remainingDoor,
  winProbabilities,
} from '../src/simulations/mathematik/ziegenproblem/model';

/** Zufallsquelle, die nacheinander genau die angegebenen Werte liefert. */
function scripted(values: number[]): () => number {
  let i = 0;
  return () => values[i++]!;
}

/** Wert in [0; 1), der bei Math.floor(r · n) genau den Index k ergibt. */
const pick = (k: number, n: number) => (k + 0.5) / n;

describe('Ziegenproblem – Rechenlogik', () => {
  it('liefert 1/n und (n − 1)/n, zusammen 1', () => {
    expect(winProbabilities(3).stay).toBeCloseTo(1 / 3, 12);
    expect(winProbabilities(3).switch).toBeCloseTo(2 / 3, 12);
    expect(winProbabilities(4)).toEqual({ stay: 0.25, switch: 0.75 });
    expect(winProbabilities(10)).toEqual({ stay: 0.1, switch: 0.9 });
    for (let n = 3; n <= 10; n++) {
      const p = winProbabilities(n);
      expect(p.stay + p.switch).toBeCloseTo(1, 12);
    }
  });

  it('lässt bei falscher erster Wahl genau die Autotür geschlossen', () => {
    for (let n = 3; n <= 10; n++) {
      for (let car = 0; car < n; car++) {
        for (let chosen = 0; chosen < n; chosen++) {
          if (chosen === car) continue;
          expect(remainingDoor(n, car, chosen, Math.random)).toBe(car);
          expect(openedDoors(n, chosen, car)).toHaveLength(n - 2);
        }
      }
    }
  });

  it('zählt alle gleich wahrscheinlichen Fälle aus: Wechseln gewinnt in (n − 1)/n', () => {
    for (const n of [3, 4, 10]) {
      let switchWins = 0;
      let stayWins = 0;
      for (let car = 0; car < n; car++) {
        for (let chosen = 0; chosen < n; chosen++) {
          // Bei richtiger erster Wahl ist egal, welche Ziegentür zu bleibt
          const r = playRound(n, scripted([pick(car, n), pick(chosen, n), 0.5]));
          if (r.switchWins) switchWins++;
          if (r.stayWins) stayWins++;
          expect(r.stayWins).not.toBe(r.switchWins);
        }
      }
      expect(switchWins / (n * n)).toBeCloseTo(winProbabilities(n).switch, 12);
      expect(stayWins / (n * n)).toBeCloseTo(winProbabilities(n).stay, 12);
    }
  });

  it('Simulation mit 10 Türen: Wechseln gewinnt in etwa 90 % der Spiele', () => {
    const rand = seededRandom(5);
    let wins = 0;
    const n = 20000;
    for (let i = 0; i < n; i++) if (playRound(10, rand).switchWins) wins++;
    expect(Math.abs(wins / n - 0.9)).toBeLessThan(0.01);
  });
});

describe('Ziegenproblem – Variante ohne Wissen der Moderation (Aufgabe 4)', () => {
  it('zählt die Fälle aus: Unter den gültigen Spielen gewinnen Bleiben und Wechseln je zur Hälfte', () => {
    for (const n of [3, 4, 10]) {
      let valid = 0;
      let switchWins = 0;
      let stayWins = 0;
      let total = 0;
      for (let car = 0; car < n; car++) {
        for (let chosen = 0; chosen < n; chosen++) {
          for (let k = 0; k < n - 1; k++) {
            const r = playRoundUninformed(n, scripted([pick(car, n), pick(chosen, n), pick(k, n - 1)]));
            total++;
            if (!r.valid) continue;
            valid++;
            if (r.switchWins) switchWins++;
            if (r.stayWins) stayWins++;
          }
        }
      }
      // gültig, wenn das Auto hinter der gewählten oder der verbleibenden Tür steht: 2/n
      expect(valid / total).toBeCloseTo(2 / n, 12);
      expect(switchWins / valid).toBeCloseTo(0.5, 12);
      expect(stayWins / valid).toBeCloseTo(0.5, 12);
    }
  });

  it('3 Türen: 6 gleich wahrscheinliche Fälle, 2 scheiden aus, Wechseln gewinnt in 2 von 4', () => {
    let valid = 0;
    let switchWins = 0;
    // Auto fest hinter Tür 0 (Symmetrie), erste Wahl 0, 1, 2; Moderation öffnet eine der zwei anderen
    for (let chosen = 0; chosen < 3; chosen++) {
      for (let k = 0; k < 2; k++) {
        const r = playRoundUninformed(3, scripted([pick(0, 3), pick(chosen, 3), pick(k, 2)]));
        if (r.valid) {
          valid++;
          if (r.switchWins) switchWins++;
        }
      }
    }
    expect(valid).toBe(4);
    expect(switchWins).toBe(2);
  });
});

describe('Ziegenproblem – Anzeige und Lernmaterial', () => {
  it('setzt „=“ nur bei exakten Prozentwerten', () => {
    expect(relationSign(1 / 3)).toBe('≈');
    expect(relationSign(2 / 3)).toBe('≈');
    expect(relationSign(1 / 4)).toBe('=');
    expect(relationSign(1 / 8)).toBe('=');
    expect(relationSign(1 / 6)).toBe('≈');
    expect(relationSign(1 / 7)).toBe('≈');
    expect(relationSign(1 / 10)).toBe('=');
    expect(relationSign(9 / 10)).toBe('=');
  });

  it('Aufgabe 2: typische Schwankung bei 1000 Spielen etwa ± 3 Prozentpunkte', () => {
    const band = 1.96 * Math.sqrt(((1 / 3) * (2 / 3)) / 1000);
    expect(band).toBeCloseTo(0.0292, 4);
  });

  it('Aufgabe 2/5: Bereich ±0,029 (1000 Spiele) bzw. ±0,29 (10 Spiele), höchstens 5 Gewinne in 10 Spielen ≈ 21 %', () => {
    const band = (n: number) => 1.96 * Math.sqrt(((1 / 3) * (2 / 3)) / n);
    expect(2 / 3 - band(1000)).toBeCloseTo(0.637, 3);
    expect(2 / 3 + band(1000)).toBeCloseTo(0.696, 3);
    expect(band(10)).toBeCloseTo(0.29, 2);
    const binom = (n: number, k: number): number => (k === 0 ? 1 : (binom(n, k - 1) * (n - k + 1)) / k);
    let atMost5 = 0;
    for (let k = 0; k <= 5; k++) atMost5 += binom(10, k) * (2 / 3) ** k * (1 / 3) ** (10 - k);
    expect(atMost5).toBeCloseTo(12585 / 59049, 12);
    expect(atMost5).toBeCloseTo(0.213, 3);
  });

  it('Aufgabe 6: vier Türen, nur eine geöffnet – Wechseln (zufällig zu einer der zwei) gewinnt mit 3/8', () => {
    // Auto hinter Tür 0 (Symmetrie); alle Fälle gleich wahrscheinlich auszählen
    let weight = 0;
    let win = 0;
    for (let chosen = 0; chosen < 4; chosen++) {
      const goats = [0, 1, 2, 3].filter((d) => d !== chosen && d !== 0);
      for (const opened of goats) {
        const rest = [0, 1, 2, 3].filter((d) => d !== chosen && d !== opened);
        for (const target of rest) {
          const w = (1 / 4) * (1 / goats.length) * (1 / rest.length);
          weight += w;
          if (target === 0) win += w;
        }
      }
    }
    expect(weight).toBeCloseTo(1, 12);
    expect(win).toBeCloseTo(3 / 8, 12);
  });

  it('Aufgabe 3: bei zehn Türen öffnet die Moderation acht Türen', () => {
    expect(openedDoors(10, 0, 5)).toHaveLength(8);
    expect(winProbabilities(10)).toEqual({ stay: 0.1, switch: 0.9 });
  });
});
