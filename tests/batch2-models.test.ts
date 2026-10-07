import { describe, expect, it } from 'vitest';
import { characteristicTime, exponential, linearComparison, timeToReach } from '../src/simulations/mathematik/exponentielles-wachstum/model';
import { decimalExpansion, mixed, reduce } from '../src/simulations/mathematik/bruchteile/model';
import { polygonBounds, rearrangedWidth, sectorTarget } from '../src/simulations/mathematik/kreiszahl-pi/model';
import { exactIntegral, FUNCTIONS, strips, sumOf } from '../src/simulations/mathematik/ober-untersummen/model';
import { criticalAngle, reflectance, refractionAngle } from '../src/simulations/physik/brechung/model';
import { buildTrack, LOOP_RADIUS, normalAcceleration, stepCart, type CartState } from '../src/simulations/physik/energieerhaltung/model';
import { energies, exactPeriod, smallAnglePeriod, step } from '../src/simulations/physik/fadenpendel/model';
import { dragFlight, footballDrag, sampleAt, vacuumFlight, vacuumState } from '../src/simulations/physik/schiefer-wurf/model';

describe('Modell: schiefer Wurf', () => {
  it('berechnet Weite, Höhe und Flugzeit ohne Luftwiderstand', () => {
    const f = vacuumFlight({ v0: 10, angle: 45, h0: 0, g: 9.81 });
    expect(f.range).toBeCloseTo(100 / 9.81, 6);
    expect(f.maxHeight).toBeCloseTo(50 / (2 * 9.81), 6);
    expect(f.time).toBeCloseTo((2 * 10 * Math.SQRT1_2) / 9.81, 6);
  });

  it('berechnet den waagerechten Wurf aus der Höhe', () => {
    const f = vacuumFlight({ v0: 5, angle: 0, h0: 20, g: 9.81 });
    expect(f.time).toBeCloseTo(Math.sqrt(40 / 9.81), 6);
    expect(f.range).toBeCloseTo(5 * Math.sqrt(40 / 9.81), 6);
    expect(vacuumState({ v0: 5, angle: 0, h0: 20, g: 9.81 }, f.time).y).toBeCloseTo(0, 6);
  });

  it('stimmt ohne Luftreibung numerisch mit den Formeln überein und wird mit Reibung kürzer', () => {
    const launch = { v0: 20, angle: 35, h0: 1.5, g: 9.81 };
    const exact = vacuumFlight(launch);
    const free = dragFlight(launch, 0).flight;
    expect(free.range).toBeCloseTo(exact.range, 2);
    expect(free.maxHeight).toBeCloseTo(exact.maxHeight, 2);
    const withAir = dragFlight(launch, footballDrag(1.2)).flight;
    expect(withAir.range).toBeLessThan(exact.range * 0.95);
    expect(footballDrag(0)).toBe(0);
  });

  it('interpoliert Stützstellen', () => {
    const { samples, flight } = dragFlight({ v0: 10, angle: 60, h0: 0, g: 9.81 }, 0);
    const mid = sampleAt(samples, flight.time / 2);
    expect(mid.x).toBeCloseTo(flight.range / 2, 2);
    expect(sampleAt(samples, 1e9).y).toBe(0);
  });
});

describe('Modell: Fadenpendel', () => {
  it('hat bei kleinen Winkeln die Periode 2π√(l/g)', () => {
    expect(smallAnglePeriod(1, 9.81)).toBeCloseTo(2.006, 3);
    expect(exactPeriod(1, 9.81, 0.01) / smallAnglePeriod(1, 9.81)).toBeCloseTo(1, 4);
    expect(exactPeriod(1, 9.81, Math.PI / 2) / smallAnglePeriod(1, 9.81)).toBeCloseTo(1.18034, 4);
  });

  it('erhält ohne Dämpfung die Energie und schwingt mit der exakten Periode', () => {
    const l = 1.2;
    const g = 9.81;
    const amp = (60 * Math.PI) / 180;
    let s: [number, number] = [amp, 0];
    const e0 = energies(s, l, g, 1);
    let t = 0;
    let crossings: number[] = [];
    const h = 0.0005;
    while (t < 6) {
      const prev = s;
      s = step(s, l, g, 0, h);
      t += h;
      if (prev[0] > 0 && s[0] <= 0) crossings.push(t - (h * s[0]) / (s[0] - prev[0]));
    }
    const e1 = energies(s, l, g, 1);
    expect(e1.pot + e1.kin).toBeCloseTo(e0.pot + e0.kin, 6);
    expect(crossings[1]! - crossings[0]!).toBeCloseTo(exactPeriod(l, g, amp), 3);
    crossings = [];
  });

  it('verliert mit Dämpfung Energie', () => {
    let s: [number, number] = [0.5, 0];
    for (let i = 0; i < 4000; i++) s = step(s, 1, 9.81, 0.3, 0.001);
    const e = energies(s, 1, 9.81, 1);
    expect(e.pot + e.kin).toBeLessThan(energies([0.5, 0], 1, 9.81, 1).pot * 0.5);
  });
});

describe('Modell: Achterbahn', () => {
  const g = 9.81;
  const total = (track: ReturnType<typeof buildTrack>, st: CartState) => g * track.at(st.s).y + 0.5 * st.v * st.v + st.w;

  it('findet die Startstelle zu einer Höhe', () => {
    const track = buildTrack('tal');
    expect(track.at(track.startAt(10)).y).toBeCloseTo(10, 1);
    expect(track.minHeight).toBeCloseTo(0, 6);
  });

  it.each(['tal', 'huegel', 'looping'] as const)('erhält die Energie ohne Reibung (%s)', (id) => {
    const track = buildTrack(id);
    let st: CartState = { s: track.startAt(track.maxHeight - 2), v: 0, w: 0 };
    const e0 = total(track, st);
    for (let i = 0; i < 4000; i++) st = stepCart(track, st, g, 0, 0.002);
    expect(total(track, st)).toBeCloseTo(e0, 0);
    expect(Math.abs(total(track, st) - e0) / e0).toBeLessThan(0.01);
  });

  it('wandelt mit Reibung Energie um, ohne dass die Gesamtenergie wächst', () => {
    const track = buildTrack('huegel');
    let st: CartState = { s: track.startAt(20), v: 0, w: 0 };
    const e0 = total(track, st);
    for (let i = 0; i < 6000; i++) st = stepCart(track, st, g, 0.03, 0.002);
    expect(st.w).toBeGreaterThan(1);
    expect(Math.abs(total(track, st) - e0) / e0).toBeLessThan(0.01);
  });

  it('durchfährt den Looping mit genug Starthöhe sicher', () => {
    const track = buildTrack('looping');
    let st: CartState = { s: track.startAt(26), v: 0, w: 0 };
    let minN = Infinity;
    for (let i = 0; i < 5000; i++) {
      st = stepCart(track, st, g, 0, 0.002);
      const p = track.at(st.s);
      if (p.y > LOOP_RADIUS * 1.5) minN = Math.min(minN, normalAcceleration(track, st.s, st.v, g));
    }
    expect(minN).toBeGreaterThan(0);
  });
});

describe('Modell: Brechung', () => {
  it('berechnet Brechungs- und Grenzwinkel', () => {
    expect(refractionAngle(1, 1.33, 45)).toBeCloseTo(32.12, 2);
    expect(refractionAngle(1.33, 1, 60)).toBeNull();
    expect(criticalAngle(1.33, 1)).toBeCloseTo(48.75, 2);
    expect(criticalAngle(1, 1.5)).toBeNull();
  });

  it('berechnet den reflektierten Anteil', () => {
    expect(reflectance(1, 1.33, 0)).toBeCloseTo((0.33 / 2.33) ** 2, 6);
    expect(reflectance(1.33, 1, 70)).toBe(1);
    expect(reflectance(1, 1.5, 89)).toBeGreaterThan(0.8);
  });
});

describe('Modell: Bruchteile', () => {
  it('kürzt und schreibt als gemischte Zahl', () => {
    expect(reduce(6, 8)).toEqual({ z: 3, n: 4 });
    expect(reduce(0, 5)).toEqual({ z: 0, n: 1 });
    expect(mixed(7, 3)).toEqual({ whole: 2, rest: 1 });
  });

  it('findet Vorperiode und Periode', () => {
    expect(decimalExpansion(3, 8)).toEqual({ integer: 0, pre: '375', period: '' });
    expect(decimalExpansion(1, 3)).toEqual({ integer: 0, pre: '', period: '3' });
    expect(decimalExpansion(1, 6)).toEqual({ integer: 0, pre: '1', period: '6' });
    expect(decimalExpansion(22, 7)).toEqual({ integer: 3, pre: '', period: '142857' });
    expect(decimalExpansion(4, 2)).toEqual({ integer: 2, pre: '', period: '' });
  });
});

describe('Modell: Kreiszahl', () => {
  it('schließt π mit Vielecken ein', () => {
    expect(polygonBounds(6).lower).toBeCloseTo(3, 10);
    expect(polygonBounds(6).upper).toBeCloseTo(2 * Math.sqrt(3), 10);
    const b = polygonBounds(96);
    expect(b.lower).toBeLessThan(Math.PI);
    expect(b.upper).toBeGreaterThan(Math.PI);
    expect(b.upper - b.lower).toBeLessThan(0.002);
  });

  it('legt Sektoren lückenlos aneinander', () => {
    expect(rearrangedWidth(2000, 1)).toBeCloseTo(Math.PI, 5);
    const n = 12;
    const r = 2;
    const delta = (2 * Math.PI) / n;
    // Rechte Kante von Sektor 0 und linke Kante von Sektor 1 liegen auf derselben Geraden
    const s0 = sectorTarget(0, n, r);
    const s1 = sectorTarget(1, n, r);
    const end0 = [s0.apex[0] + r * Math.cos(delta + s0.rotation), s0.apex[1] + r * Math.sin(delta + s0.rotation)];
    const end1 = [s1.apex[0] + r * Math.cos(delta + s1.rotation), s1.apex[1] + r * Math.sin(delta + s1.rotation)];
    // end0 liegt auf der Strecke von s1.apex nach end1 (gleiche Richtung)
    const cross = (end0[0]! - s1.apex[0]) * (end1[1]! - s1.apex[1]) - (end0[1]! - s1.apex[1]) * (end1[0]! - s1.apex[0]);
    expect(Math.abs(cross)).toBeLessThan(1e-9);
  });
});

describe('Modell: exponentielles Wachstum', () => {
  it('berechnet Werte und Verdopplungs- bzw. Halbwertszeiten', () => {
    expect(exponential(3, 100, 4)).toBe(48);
    expect(linearComparison(3, 100, 4)).toBe(15);
    expect(characteristicTime(100)).toBeCloseTo(1, 10);
    expect(characteristicTime(-50)).toBeCloseTo(1, 10);
    expect(characteristicTime(5)).toBeCloseTo(14.2067, 3);
    expect(timeToReach(1, 100, 1024)).toBeCloseTo(10, 10);
    expect(characteristicTime(0)).toBeNaN();
  });
});

describe('Modell: Rechtecksummen', () => {
  const sq = FUNCTIONS.x2;
  it('liefert die bekannten Unter- und Obersummen für x² auf [0; 1]', () => {
    const n = 4;
    expect(sumOf(strips(sq.f, 0, 1, n, 'lower'))).toBeCloseTo(((n - 1) * n * (2 * n - 1)) / (6 * n ** 3), 10);
    expect(sumOf(strips(sq.f, 0, 1, n, 'upper'))).toBeCloseTo((n * (n + 1) * (2 * n + 1)) / (6 * n ** 3), 10);
    expect(sumOf(strips(sq.f, 0, 1, 1, 'mid'))).toBeCloseTo(0.25, 10);
    expect(exactIntegral(sq, 0, 1)).toBeCloseTo(1 / 3, 10);
  });

  it('nähert sich dem Integral und zählt Flächen unter der x-Achse negativ', () => {
    const lower = sumOf(strips(sq.f, 0, 2, 400, 'lower'));
    const upper = sumOf(strips(sq.f, 0, 2, 400, 'upper'));
    expect(lower).toBeLessThan(8 / 3);
    expect(upper).toBeGreaterThan(8 / 3);
    expect(upper - lower).toBeLessThan(0.021);
    expect(sumOf(strips(Math.sin, Math.PI, 2 * Math.PI, 200, 'mid'))).toBeCloseTo(-2, 3);
    expect(sumOf(strips((x) => 2 * x + 1, 0, 3, 1, 'trapez'))).toBeCloseTo(12, 10);
  });
});
