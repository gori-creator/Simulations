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

  it('behandelt Sonderfälle und Reglergrenzen', () => {
    // h = 0: keine Fallzeit, keine Aufprallgeschwindigkeit – auch mit Luftwiderstand
    expect(fallTime(0, 9.81)).toBe(0);
    expect(impactSpeed(0, 9.81)).toBe(0);
    expect(dragFallTime(0, 9.81, TERMINAL.feather)).toBe(0);
    expect(dragDistance(9.81, TERMINAL.ball, 0)).toBe(0);
    expect(dragSpeed(9.81, TERMINAL.ball, 0)).toBe(0);
    // Reglergrenzen: h = 1 m auf dem Jupiter, h = 100 m auf dem Mond
    expect(fallTime(1, PLANETS.jupiter)).toBeCloseTo(0.284, 3);
    expect(impactSpeed(1, PLANETS.jupiter)).toBeCloseTo(7.04, 2);
    expect(fallTime(100, PLANETS.mond)).toBeCloseTo(11.11, 2);
    expect(impactSpeed(100, 9.81)).toBeCloseTo(44.29, 2);
    // kleinster Blitzabstand auf dem Jupiter: erster Abstand 3,1 cm
    expect(strobeGaps(PLANETS.jupiter, 0.05, 1)[0]).toBeCloseTo(0.031, 3);
    // sehr lange Fallzeit mit Luftwiderstand ohne Überlauf: fast gleichförmig mit v_E
    const tLong = dragFallTime(1000, 9.81, TERMINAL.feather);
    expect(Number.isFinite(tLong)).toBe(true);
    expect(tLong).toBeCloseTo(1000 / TERMINAL.feather + (TERMINAL.feather / 9.81) * Math.LN2, 6);
  });

  it('bestätigt die Werte der Aufgaben im Lernmaterial', () => {
    const g = PLANETS.erde;
    // Aufgabe 1: 20 m → 2,02 s; 19,8 m/s ≈ 71 km/h
    expect(fallTime(20, g)).toBeCloseTo(2.02, 2);
    expect(impactSpeed(20, g)).toBeCloseTo(19.8, 1);
    expect(Math.round(impactSpeed(20, g) * 3.6)).toBe(71);
    // Aufgabe 2: Δt = 0,4 s → 0,78 m; 2,35 m; 3,92 m; 5,49 m, Zuwachs g·Δt² ≈ 1,57 m
    const gaps = strobeGaps(g, 0.4, 4);
    expect(gaps.map((x) => Math.round(x * 100) / 100)).toEqual([0.78, 2.35, 3.92, 5.49]);
    expect(gaps[1]! - gaps[0]!).toBeCloseTo(g * 0.16, 9);
    // Aufgabe 3: Mond 4,97 s, etwa 2,5-mal so lange
    expect(fallTime(20, PLANETS.mond)).toBeCloseTo(4.97, 2);
    expect(fallTime(20, PLANETS.mond) / fallTime(20, g)).toBeCloseTo(2.46, 2);
    // Aufgabe 4: 2 s → 19,6 m; Reglerwert 19,5 m ergibt knapp 2 s
    expect(fallDistance(g, 2)).toBeCloseTo(19.62, 2);
    expect(fallTime(19.5, g)).toBeCloseTo(1.99, 2);
    // Aufgabe 5: 18 cm → 0,19 s; Reaktionsweg bei 50 km/h ≈ 2,7 m
    const rt = reactionTime(0.18, g);
    expect(rt).toBeCloseTo(0.192, 3);
    expect((50 / 3.6) * rt).toBeCloseTo(2.66, 2);
    // Aufgabe 7: Apfel aus 5 m → 9,9 m/s ≈ 36 km/h
    expect(impactSpeed(5, g)).toBeCloseTo(9.9, 1);
    expect(Math.round(impactSpeed(5, g) * 3.6)).toBe(36);
    // Fallröhre: Kugel nach 0,55 s, Feder nach 2,54 s unten
    expect(dragFallTime(1.5, g, TERMINAL.ball)).toBeCloseTo(0.55, 2);
    expect(dragFallTime(1.5, g, TERMINAL.feather)).toBeCloseTo(2.54, 2);
    // Lineal 50 cm: länger als 319 ms gilt als durchgerutscht
    expect(Math.round(reactionTime(0.5, g) * 1000)).toBe(319);
  });
});
