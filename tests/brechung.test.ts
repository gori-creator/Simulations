import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import {
  acceptanceAngle,
  apparentDepth,
  brewsterAngle,
  cauchyIndex,
  criticalAngle,
  fiberDelivery,
  fresnel,
  gemEdges,
  gemOutline,
  indexFromSeries,
  lightSpeed,
  lightSpeedMs,
  MEDIA,
  minDeviation,
  nearestSample,
  normalReflectance,
  plateEdges,
  plateShift,
  prismEdges,
  prismPath,
  readAngle,
  reflectance,
  refractionAngle,
  SAMPLES,
  slopeThroughOrigin,
  toDeg,
  toRad,
  traceFiber,
  traceShape,
  wavelengthIn,
  type V2,
} from '../src/simulations/physik/brechung/model';

const FIBER = { d: 1, L1: 6, L2: 4 };

describe('Modell: Brechung und Totalreflexion', () => {
  it('Brechungsgesetz: Luft → Wasser bei α = 40° gibt β = 28,90°', () => {
    // sin β = sin 40° / 1,33 = 0,4833
    expect(Math.sin(toRad(refractionAngle(1, 1.33, 40)!))).toBeCloseTo(0.4833, 4);
    expect(refractionAngle(1, 1.33, 40)!).toBeCloseTo(28.9, 2);
    // Luft → Glas bei 50°: sin β = 0,766/1,52 → β = 30,26°
    expect(refractionAngle(1, 1.52, 50)!).toBeCloseTo(30.26, 2);
    // Glas → Luft bei 30°: sin β = 1,52 · 0,5 = 0,76 → β = 49,46°
    expect(refractionAngle(1.52, 1, 30)!).toBeCloseTo(49.46, 2);
  });

  it('Grenzwinkel: Wasser 48,75°, Glas 41,14°, Diamant 24,41° (jeweils gegen Luft)', () => {
    expect(criticalAngle(MEDIA.wasser, 1)!).toBeCloseTo(48.75, 2);
    expect(criticalAngle(MEDIA.glas, 1)!).toBeCloseTo(41.14, 2);
    expect(criticalAngle(MEDIA.diamant, 1)!).toBeCloseTo(24.41, 2);
    // Kein Grenzwinkel beim Übergang ins optisch dichtere Medium oder bei gleichen Stoffen
    expect(criticalAngle(1, 1.33)).toBeNull();
    expect(criticalAngle(1.33, 1.33)).toBeNull();
    // Am Grenzwinkel ist β = 90°
    expect(refractionAngle(1.52, 1, criticalAngle(1.52, 1)!)!).toBeCloseTo(90, 6);
  });

  it('Totalreflexion: Wasser → Luft bei α = 50° hat keinen Brechungswinkel, R = 1', () => {
    expect(refractionAngle(1.33, 1, 50)).toBeNull();
    const f = fresnel(1.33, 1, 50);
    expect(f.total).toBe(true);
    expect(f.R).toBe(1);
    expect(f.T).toBe(0);
    expect(reflectance(1.52, 1, 60)).toBe(1);
  });

  it('Lichtgeschwindigkeit in Wasser: 299 792 458 m/s / 1,33 = 2,254 · 10⁸ m/s', () => {
    expect(lightSpeedMs(1.33) / 1e8).toBeCloseTo(2.254, 3);
    expect(lightSpeed(1.33)).toBeCloseTo(225_408, 0);
    // Wellenlänge im Wasser: 589 nm / 1,33 = 442,9 nm
    expect(wavelengthIn(589, 1.33)).toBeCloseTo(442.86, 2);
  });

  it('Reflexionsgrad bei senkrechtem Einfall Luft → Glas: 4,26 %', () => {
    // ((1,52 − 1)/2,52)² = 0,04258
    expect(normalReflectance(1, 1.52)).toBeCloseTo(0.04258, 5);
    expect(fresnel(1, 1.52, 0).R).toBeCloseTo(0.04258, 5);
    expect(fresnel(1, 1.52, 0).rs).toBeCloseTo(fresnel(1, 1.52, 0).rp, 12);
    // gleich groß in Gegenrichtung
    expect(fresnel(1.52, 1, 0).R).toBeCloseTo(0.04258, 5);
  });

  it('Brewster-Winkel Luft → Glas: arctan(1,52) = 56,66°, dort R_p = 0', () => {
    expect(brewsterAngle(1, 1.52)).toBeCloseTo(56.66, 2);
    expect(fresnel(1, 1.52, brewsterAngle(1, 1.52)).rp).toBeCloseTo(0, 12);
    expect(fresnel(1, 1.52, brewsterAngle(1, 1.52)).rs).toBeGreaterThan(0.1);
    // Brewster-Winkel und gebrochener Strahl stehen senkrecht aufeinander: α_B + β = 90°
    const b = refractionAngle(1, 1.52, brewsterAngle(1, 1.52))!;
    expect(brewsterAngle(1, 1.52) + b).toBeCloseTo(90, 9);
  });

  it('Energieerhaltung R + T = 1 für viele zufällige Stoffe und Winkel', () => {
    const rnd = seededRandom(7);
    for (let i = 0; i < 2000; i++) {
      const n1 = 1 + rnd() * 1.6;
      const n2 = 1 + rnd() * 1.6;
      const a = rnd() * 89.9;
      const f = fresnel(n1, n2, a);
      expect(f.rs + f.ts).toBeCloseTo(1, 9);
      expect(f.rp + f.tp).toBeCloseTo(1, 9);
      expect(f.R + f.T).toBeCloseTo(1, 9);
      // Snellius: n₁ · sin α = n₂ · sin β, sofern keine Totalreflexion
      const b = refractionAngle(n1, n2, a);
      if (b !== null) expect(n1 * Math.sin(toRad(a))).toBeCloseTo(n2 * Math.sin(toRad(b)), 9);
      else expect((n1 / n2) * Math.sin(toRad(a))).toBeGreaterThan(1);
    }
  });

  it('gleiche Stoffe: β = α und keine Reflexion; α = 0: kein Knick', () => {
    for (const a of [0, 15, 40, 75, 89]) {
      expect(refractionAngle(1.33, 1.33, a)!).toBeCloseTo(a, 9);
      expect(fresnel(1.33, 1.33, a).R).toBeCloseTo(0, 12);
    }
    expect(refractionAngle(1, 2.42, 0)).toBe(0);
  });

  it('planparallele Platte: austretender Strahl parallel, Versatz Δ = d · sin(α − β)/cos β', () => {
    // Glas, d = 2 cm, α = 40°: β = 25,02°, Δ = 0,570 cm
    expect(plateShift(40, 1.52, 1, 2)).toBeCloseTo(0.57, 2);
    expect(plateShift(0, 1.52, 1, 2)).toBe(0);
    const rnd = seededRandom(3);
    for (let i = 0; i < 50; i++) {
      const a = 1 + rnd() * 80;
      const n = 1.1 + rnd();
      const d: V2 = [Math.sin(toRad(a)), -Math.cos(toRad(a))];
      const res = traceShape(plateEdges(2), n, 1, [-3 * d[0], 1 - 3 * d[1]], d, { minI: 0.001 });
      const out = res.segs.find((s) => !s.inside && s.tag === null && s.parent >= 0 && res.segs[s.parent]!.tag === 'bottom')!;
      const od = [out.b[0] - out.a[0], out.b[1] - out.a[1]];
      const l = Math.hypot(od[0]!, od[1]!);
      expect(od[0]! / l).toBeCloseTo(d[0], 9);
      expect(od[1]! / l).toBeCloseTo(d[1], 9);
      // Abstand der beiden Geraden = Δ
      const q = out.a;
      const cross = Math.abs((q[0] - 0) * d[1] - (q[1] - 1) * d[0]);
      expect(cross).toBeCloseTo(plateShift(a, n, 1, 2), 9);
    }
  });

  it('Prisma (γ = 60°, n = 1,52, α = 50°): δ = 38,93°, kleinste Ablenkung 38,93°', () => {
    const path = prismPath(60, 50, 1.52)!;
    expect(path.beta1).toBeCloseTo(30.26, 2);
    expect(path.delta).toBeCloseTo(50 + path.beta2 - 60, 12);
    expect(path.delta).toBeCloseTo(38.93, 2);
    // δ_min = 2 · arcsin(1,52 · sin 30°) − 60° = 38,93°; symmetrischer Durchgang bei α = 49,46°
    expect(minDeviation(60, 1.52)!).toBeCloseTo(38.93, 2);
    expect(prismPath(60, (minDeviation(60, 1.52)! + 60) / 2, 1.52)!.delta).toBeCloseTo(minDeviation(60, 1.52)!, 9);
    // Totalreflexion an der zweiten Fläche bei kleinem Einfallswinkel
    expect(prismPath(60, 10, 1.52)).toBeNull();
  });

  it('Cauchy-Näherung für Kronglas: n(589 nm) ≈ 1,517, Rot weniger gebrochen als Violett', () => {
    expect(cauchyIndex(589)).toBeCloseTo(1.5167, 4);
    expect(cauchyIndex(660)).toBeLessThan(cauchyIndex(589));
    expect(cauchyIndex(410)).toBeGreaterThan(cauchyIndex(589));
    expect(prismPath(60, 50, cauchyIndex(410))!.delta).toBeGreaterThan(prismPath(60, 50, cauchyIndex(660))!.delta);
  });

  it('scheinbare Hebung: senkrecht h′ = h/1,33 = 0,752 m, bei α = 30° 0,648 m', () => {
    expect(apparentDepth(1, 1.33, 1, 0)!).toBeCloseTo(0.752, 3);
    expect(apparentDepth(1, 1.33, 1, 30)!).toBeCloseTo(0.648, 3);
    expect(apparentDepth(1, 1.33, 1, 50)).toBeNull();
    expect(apparentDepth(2, 1, 1, 30)!).toBeCloseTo(2, 12);
  });

  it('Messreihe: Brechzahl aus der Steigung von sin β über sin α', () => {
    expect(slopeThroughOrigin([[1, 2], [2, 4]])).toBeCloseTo(2, 12);
    expect(slopeThroughOrigin([])).toBeNull();
    // Glycerin (1,47) mit am Winkelmesser abgelesenen β (auf 0,5° gerundet)
    const rows = [30, 50, 70].map((a) => [a, readAngle(refractionAngle(1, 1.47, a)!)] as [number, number]);
    expect(rows.map((r) => r[1])).toEqual([20, 31.5, 39.5]);
    const n = indexFromSeries(rows)!;
    expect(n).toBeCloseTo(1.47, 1);
    expect(SAMPLES[nearestSample(n)]!.de).toBe('Glycerin');
    expect(indexFromSeries([[0, 0]])).toBeNull();
    // exakte Werte für alle Proben
    for (const s of SAMPLES) expect(indexFromSeries([20, 45, 70].map((a) => [a, refractionAngle(1, s.n, a)!] as [number, number]))!).toBeCloseTo(s.n, 9);
  });

  it('Glasfaser: Akzeptanzwinkel und Verluste in engen Biegungen', () => {
    // Glas (1,52) in Plexiglas-Mantel (1,49): sin θ = √(1,52² − 1,49²) = 0,3005 → 17,49°
    expect(acceptanceAngle(1.52, 1.49)!).toBeCloseTo(17.49, 2);
    expect(acceptanceAngle(1.52, 1)).toBe(90);
    expect(acceptanceAngle(1.33, 1.52)).toBeNull();
    // gerades Licht: nur der Eintrittsverlust (4,26 %) fehlt
    expect(traceFiber({ ...FIBER, R: 10 }, 0, 1.52, 1).delivered).toBeCloseTo(1 - 0.04258, 4);
    // Plexiglas bei 40°: enge Biegung verliert Licht, weite nicht
    const tight = fiberDelivery({ ...FIBER, R: 1 }, 40, 1.49, 1);
    const wide = fiberDelivery({ ...FIBER, R: 10 }, 40, 1.49, 1);
    expect(tight).toBeLessThan(0.5);
    expect(wide).toBeGreaterThan(0.9);
    // Kern = Mantel: kein Licht kommt (über Reflexion) an
    expect(fiberDelivery({ ...FIBER, R: 6 }, 30, 1.49, 1.49)).toBeLessThan(0.05);
  });

  it('Strahlverfolger erhält die Energie (nichts geht verloren außer abgeschnittenen Restanteilen)', () => {
    const res = traceShape(prismEdges(4), 1.52, 1, [-2, 2], [1, 0], { minI: 1e-6, maxSegs: 4000 });
    const free = res.segs.filter((s) => s.tag === null).reduce((a, s) => a + s.I, 0);
    expect(free).toBeCloseTo(1, 4);
    // Umlenkprisma aus Glas: 45° > 41,1° → Totalreflexion an der Schrägfläche
    expect(res.segs.find((s) => s.inside && s.tag === 'hyp')!.tir).toBe(true);
    // aus Wasser: 45° < 48,75° → das Licht tritt dort aus
    const w = traceShape(prismEdges(4), 1.33, 1, [-2, 2], [1, 0]);
    expect(w.segs.find((s) => s.inside && s.tag === 'hyp')!.tir).toBe(false);
  });

  it('Brillant: Diamant schickt mehr Licht nach oben zurück als Glas', () => {
    const top = gemOutline()[0]![1];
    const share = (n: number) => [-0.36, 0, 0.36].reduce((s, x) => s + (traceShape(gemEdges(), n, 1, [x, top + 1], [0, -1], { minI: 0.002, maxSegs: 700 }).left.top ?? 0), 0) / 3;
    expect(share(2.42)).toBeGreaterThan(share(1.52) + 0.1);
    const lost = (n: number) => [-0.36, 0, 0.36].reduce((s, x) => s + (traceShape(gemEdges(), n, 1, [x, top + 1], [0, -1], { minI: 0.002, maxSegs: 700 }).left.bottom ?? 0), 0) / 3;
    expect(lost(1.52)).toBeGreaterThan(0.3);
    expect(lost(2.42)).toBeLessThan(0.15);
    // Unterteil 40,75°: senkrechtes Licht trifft dort unter 40,75° auf – mehr als 24,4°, weniger als 41,1°
    expect(toDeg(Math.atan(-gemOutline()[3]![1]))).toBeCloseTo(40.75, 9);
  });
});
