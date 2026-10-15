import { describe, expect, it } from 'vitest';
import {
  arrivals,
  C_AIR,
  doppler,
  firstArrival,
  isBoom,
  machAngle,
  machNumber,
  mainArrival,
  movingObserver,
  movingSource,
  ringPeriods,
  sampleFrequency,
  wavefronts,
  wavelengthAhead,
  wavelengthBehind,
  type Motion,
} from '../src/simulations/physik/doppler-effekt/model';

const base: Motion = { f: 440, c: 340, x0: -130, vq: 34, bx: 40, d: 20, vb: 0 };

describe('Modell: Doppler-Effekt – Grundformeln', () => {
  it('bewegte Quelle (440 Hz, 34 m/s): vorn 488,9 Hz, hinten 400 Hz', () => {
    expect(movingSource(440, 34, 340)).toBeCloseTo(488.888_9, 3);
    expect(movingSource(440, -34, 340)).toBeCloseTo(400, 9);
  });

  it('bewegter Beobachter (34 m/s auf ruhende Quelle zu): 484 Hz, weg: 396 Hz', () => {
    expect(movingObserver(440, 34, 340)).toBeCloseTo(484, 9);
    expect(movingObserver(440, -34, 340)).toBeCloseTo(396, 9);
  });

  it('allgemeine Formel enthält beide Sonderfälle; beide aufeinander zu', () => {
    expect(doppler(440, 34, 0)).toBeCloseTo(movingSource(440, 34), 9);
    expect(doppler(440, 0, 34)).toBeCloseTo(movingObserver(440, 34), 9);
    expect(doppler(440, 34, 34)).toBeCloseTo((440 * 374) / 306, 9);
  });

  it('bewegte Quelle und bewegter Beobachter sind nicht gleichwertig', () => {
    expect(movingSource(440, 34)).not.toBeCloseTo(movingObserver(440, 34), 1);
  });

  it('Wellenlängen vorn und hinten', () => {
    expect(wavelengthAhead(440, 34)).toBeCloseTo(306 / 440, 12);
    expect(wavelengthBehind(440, 34)).toBeCloseTo(374 / 440, 12);
    expect(wavelengthAhead(440, 0)).toBeCloseTo(340 / 440, 12);
    // ruhender Beobachter: f = c / λ
    expect(C_AIR / wavelengthAhead(440, 34)!).toBeCloseTo(movingSource(440, 34), 9);
    expect(C_AIR / wavelengthBehind(440, 34)).toBeCloseTo(400, 9);
    expect(wavelengthAhead(440, 340)).toBeNull();
    expect(wavelengthAhead(440, 500)).toBeNull();
  });

  it('Machzahl und Machscher Kegel: Mach 2 → α = 30°', () => {
    expect(machNumber(680)).toBeCloseTo(2, 12);
    expect((machAngle(680)! * 180) / Math.PI).toBeCloseTo(30, 9);
    expect(machAngle(340)).toBeNull();
    expect(machAngle(100)).toBeNull();
    expect((machAngle(340 * Math.SQRT2)! * 180) / Math.PI).toBeCloseTo(45, 9);
  });
});

describe('Modell: Doppler-Effekt – Laufzeit und Vorbeifahrt', () => {
  it('Beobachter auf der Straße: vorher 488,9 Hz, nachher 400 Hz', () => {
    const m: Motion = { ...base, d: 0 };
    // Quelle passiert x = 40 bei t = 5 s
    expect(mainArrival(m, 4)!.f).toBeCloseTo(488.888_9, 3);
    expect(mainArrival(m, 7)!.f).toBeCloseTo(400, 3);
  });

  it('erfüllt die Laufzeitgleichung |B − S(τ)| = c · (t − τ)', () => {
    for (const t of [1, 3.5, 5, 6.2]) {
      const a = mainArrival(base, t)!;
      const sx = base.x0 + base.vq * a.tau;
      expect(Math.hypot(base.bx - sx, base.d)).toBeCloseTo(base.c * (t - a.tau), 6);
      expect(a.dist).toBeCloseTo(base.c * (t - a.tau), 6);
    }
  });

  it('seitlicher Abstand: Ton gleitet stetig, f_Q genau bei senkrechtem Schalleinfall', () => {
    const s = sampleFrequency(base, 0, 9, 900).filter((q) => q.f !== null);
    for (let i = 1; i < s.length; i++) expect(s[i]!.f!).toBeLessThanOrEqual(s[i - 1]!.f! + 1e-9);
    // Aussendung genau auf Höhe des Beobachters (x = 40 bei τ = 5 s) → Ankunft bei t = 5 + 20/340
    expect(mainArrival(base, 5 + 20 / 340)!.f).toBeCloseTo(440, 6);
    // Radialkomponente stimmt mit der Formel überein
    const a = mainArrival(base, 3)!;
    expect(a.f).toBeCloseTo(doppler(440, a.vQr, a.vBr), 9);
    expect(a.vQr).toBeLessThan(34);
    expect(a.vQr).toBeGreaterThan(30);
  });

  it('vor der ersten Wellenfront ist es still', () => {
    const m: Motion = { ...base, x0: 0, bx: 100, d: 0 };
    // Front startet bei t = 0 in x = 0 und braucht 100/340 s
    expect(arrivals(m, 0.2)).toHaveLength(0);
    expect(firstArrival(m, 2)).toBeCloseTo(100 / 340, 6);
  });

  it('bewegter Beobachter, ruhende Quelle: 484 Hz', () => {
    const m: Motion = { ...base, vq: 0, x0: -60, bx: 110, d: 0, vb: 34 };
    expect(mainArrival(m, 2)!.f).toBeCloseTo(484, 6);
    // nach dem Vorbeigehen entfernt er sich: 396 Hz
    expect(mainArrival(m, 6)!.f).toBeCloseTo(396, 6);
  });

  it('Überschall: Stille, dann Knall, danach zwei Signale', () => {
    const m: Motion = { ...base, vq: 680 };
    const tb = firstArrival(m, 1)!;
    expect(tb).toBeGreaterThan(0);
    expect(isBoom(m, tb)).toBe(true);
    // Kegel erreicht den Beobachter, wenn die Quelle bei x = 40 + d / tan α ist
    const xs = 40 + 20 / Math.tan(Math.PI / 6);
    expect(tb).toBeCloseTo((xs - m.x0) / 680, 4);
    const list = arrivals(m, tb + 0.05);
    expect(list).toHaveLength(2);
    expect(list[0]!.f).toBeLessThan(0);
    expect(list[1]!.f).toBeGreaterThan(0);
    expect(arrivals(m, tb - 0.01)).toHaveLength(0);
  });

  it('Unterschall: höchstens ein Signal, kein Knall', () => {
    for (let t = 0; t < 9; t += 0.25) expect(arrivals(base, t).length).toBeLessThanOrEqual(1);
    const tf = firstArrival(base, 9)!;
    expect(isBoom(base, tf)).toBe(false);
  });

  it('v_Q = c: Fronten stauen sich vor der Quelle', () => {
    const m: Motion = { ...base, vq: 340 };
    const fr = wavefronts(m, 0.3, 0.05);
    const fronts = fr.map((w) => w.cx + w.r);
    for (const x of fronts) expect(x).toBeCloseTo(m.x0 + 340 * 0.3, 9);
  });
});

describe('Modell: Doppler-Effekt – gezeichnete Wellenfronten', () => {
  it('Abstand vorn (c − v_Q)·Δt, hinten (c + v_Q)·Δt', () => {
    const dt = 0.05;
    const fr = wavefronts(base, 1, dt);
    expect(fr[0]!.t0).toBeCloseTo(1, 12);
    const ahead = fr[2]!.cx + fr[2]!.r - (fr[1]!.cx + fr[1]!.r);
    const behind = fr[1]!.cx - fr[1]!.r - (fr[2]!.cx - fr[2]!.r);
    expect(ahead).toBeCloseTo((340 - 34) * dt, 9);
    expect(behind).toBeCloseTo((340 + 34) * dt, 9);
    expect(wavefronts(base, 1, dt, 100).every((w) => w.r <= 100)).toBe(true);
  });

  it('ganze Zahl von Perioden zwischen zwei Fronten', () => {
    expect(ringPeriods(440, 34)).toBe(22);
    expect(Number.isInteger(ringPeriods(250, 680))).toBe(true);
    expect(ringPeriods(440, 680)).toBeLessThan(22);
    expect(ringPeriods(200, 0)).toBe(10);
  });
});
