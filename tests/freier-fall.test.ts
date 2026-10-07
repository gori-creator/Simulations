import { describe, expect, it } from 'vitest';
import {
  dragDistance,
  dragFallTime,
  dragSpeed,
  fallDistance,
  fallSpeed,
  fallTime,
  impactSpeed,
  PLANETS,
  reactionTime,
  stats,
  strobeGaps,
  TERMINAL,
} from '../src/simulations/physik/freier-fall/model';

describe('Modell: freier Fall', () => {
  it('berechnet Fallstrecke, Geschwindigkeit, Fallzeit und Aufprallgeschwindigkeit', () => {
    expect(fallDistance(9.81, 2)).toBeCloseTo(19.62, 9);
    expect(fallSpeed(9.81, 2)).toBeCloseTo(19.62, 9);
    expect(fallTime(20, 9.81)).toBeCloseTo(2.019, 3);
    expect(impactSpeed(20, 9.81)).toBeCloseTo(19.81, 2);
    // v = g·t und s = ½·g·t² passen zusammen: v² = 2·g·s
    const t = fallTime(45, 9.81);
    expect(fallSpeed(9.81, t) ** 2).toBeCloseTo(2 * 9.81 * 45, 9);
    // auf dem Mond dauert der Fall √(9,81/1,62) ≈ 2,46-mal so lange
    expect(fallTime(20, PLANETS.mond) / fallTime(20, PLANETS.erde)).toBeCloseTo(Math.sqrt(9.81 / 1.62), 9);
  });

  it('liefert Stroboskop-Abstände im Verhältnis 1 : 3 : 5 : 7', () => {
    const gaps = strobeGaps(9.81, 0.1, 4);
    expect(gaps[0]).toBeCloseTo(0.04905, 9);
    expect(gaps.map((x) => Math.round(x / gaps[0]!))).toEqual([1, 3, 5, 7]);
    // Summe der Abstände = Fallstrecke nach n·Δt
    expect(gaps.reduce((a, b) => a + b, 0)).toBeCloseTo(fallDistance(9.81, 0.4), 9);
    expect(strobeGaps(9.81, 0.1, 0)).toEqual([]);
  });

  it('nähert sich mit Luftwiderstand der Endgeschwindigkeit', () => {
    const g = 9.81;
    const vEnd = TERMINAL.feather;
    expect(dragSpeed(g, vEnd, 0.001)).toBeCloseTo(fallSpeed(g, 0.001), 5);
    expect(dragSpeed(g, vEnd, 5)).toBeCloseTo(vEnd, 9);
    // danach fast gleichförmig: Δs ≈ v_E · Δt
    expect(dragDistance(g, vEnd, 6) - dragDistance(g, vEnd, 5)).toBeCloseTo(vEnd, 6);
    // stimmt mit numerischer Integration von a = g − (g/v_E²)·v² überein
    let v = 0;
    let s = 0;
    const h = 1e-5;
    for (let i = 0; i < 100000; i++) {
      const a = g - (g / (vEnd * vEnd)) * v * v;
      s += v * h + 0.5 * a * h * h;
      v += a * h;
    }
    expect(dragDistance(g, vEnd, 1)).toBeCloseTo(s, 4);
    expect(dragSpeed(g, vEnd, 1)).toBeCloseTo(v, 4);
  });

  it('berechnet die Fallzeit in der Fallröhre mit und ohne Luft', () => {
    const g = 9.81;
    expect(dragFallTime(1.5, g, Infinity)).toBeCloseTo(fallTime(1.5, g), 12);
    const tf = dragFallTime(1.5, g, TERMINAL.feather);
    expect(dragDistance(g, TERMINAL.feather, tf)).toBeCloseTo(1.5, 9);
    expect(tf).toBeGreaterThan(2.5);
    // Die Stahlkugel merkt auf 1,5 m kaum etwas von der Luft
    const tb = dragFallTime(1.5, g, TERMINAL.ball);
    expect(tb / fallTime(1.5, g)).toBeCloseTo(1, 3);
    expect(tb).toBeGreaterThan(fallTime(1.5, g));
  });

  it('rechnet die Fangstrecke des Lineals in die Reaktionszeit um', () => {
    expect(reactionTime(0.2, 9.81)).toBeCloseTo(0.2019, 4);
    expect(reactionTime(0.5, 9.81)).toBeCloseTo(0.3193, 4);
    expect(reactionTime(-1, 9.81)).toBe(0);
    const st = stats([0.2, 0.25, 0.15])!;
    expect(st.mean).toBeCloseTo(0.2, 12);
    expect([st.min, st.max]).toEqual([0.15, 0.25]);
    expect(stats([])).toBeNull();
  });
});
