import { describe, expect, it } from 'vitest';
import {
  ageAtZ,
  ageGyr,
  betaFromZ,
  C_KMS,
  cmbTemp,
  comovingMpc,
  distanceFromModulus,
  distanceModulus,
  E2,
  fitThroughOrigin,
  GALAXY_LINES,
  HUBBLE_1929,
  hubbleDistance,
  hubbleRadiusMpc,
  hubbleTimeGyr,
  hubbleVelocity,
  lookbackGyr,
  makeDots,
  MODERN,
  MPC_MLY,
  observe,
  omegaK,
  planck,
  q0,
  relVelocity,
  scaleHistory,
  shifted,
  sumSquares,
  wavelengthRGB,
  wienPeak,
  zClassic,
  zFromLambda,
  zFromScale,
  zRelativistic,
  zFromComoving,
  modelKind,
  type Cosmo,
} from '../src/simulations/physik/hubble/model';

const LCDM: Cosmo = { H0: 70, Om: 0.3, OL: 0.7, Or: 0 };
const EDS: Cosmo = { H0: 70, Om: 1, OL: 0, Or: 0 };
const EMPTY: Cosmo = { H0: 70, Om: 0, OL: 0, Or: 0 };

describe('Hubble: Prüfwerte aus dem Auftrag', () => {
  it('H₀ = 70 km/(s·Mpc): Galaxie in 100 Mpc → 7000 km/s, z ≈ 0,023', () => {
    const v = hubbleVelocity(100, 70);
    expect(v).toBe(7000);
    expect(zClassic(v)).toBeCloseTo(0.02335, 4);
    expect(zRelativistic(v)).toBeCloseTo(0.0236, 3);
    expect(hubbleDistance(7000, 70)).toBe(100);
  });
  it('Hubble-Zeit 1/H₀ ≈ 14,0 Mrd. Jahre (genau 13,97)', () => {
    expect(hubbleTimeGyr(70)).toBeCloseTo(13.97, 2);
    expect(hubbleTimeGyr(100)).toBeCloseTo(9.778, 2);
  });
  it('Hubble-Radius c/H₀ ≈ 4283 Mpc; 1 Mpc ≈ 3,26 Mio. Lichtjahre', () => {
    expect(hubbleRadiusMpc(70)).toBeCloseTo(4282.7, 0);
    expect(MPC_MLY).toBeCloseTo(3.2616, 3);
  });
});

describe('Hubble: Rotverschiebung', () => {
  it('Hα (656,28 nm) bei z = 0,1 → 721,9 nm, Rückrechnung', () => {
    const ha = GALAXY_LINES.find((l) => l.id === 'Ha')!;
    expect(shifted(ha.lambda, 0.1)).toBeCloseTo(721.908, 3);
    expect(zFromLambda(721.908, 656.28)).toBeCloseTo(0.1, 6);
  });
  it('relativistisch: v → c ergibt z → ∞; β aus z umkehrbar', () => {
    expect(zRelativistic(C_KMS)).toBe(Infinity);
    for (const z of [0.01, 0.5, 3, 10]) expect(zRelativistic(C_KMS * betaFromZ(z))).toBeCloseTo(z, 9);
    expect(betaFromZ(1)).toBeCloseTo(0.6, 12);
  });
  it('kosmologisch: a = 0,5 ↔ z = 1; Hintergrundstrahlung z = 1090 → a ≈ 1/1091', () => {
    expect(zFromScale(0.5)).toBe(1);
    expect(zFromScale(1 / 1091)).toBeCloseTo(1090, 6);
  });
  it('Spektralfarben: 650 nm rot, 450 nm blau, 300 nm unsichtbar', () => {
    const [r1, , b1] = wavelengthRGB(650);
    expect(r1).toBeGreaterThan(200);
    expect(b1).toBe(0);
    const [, , b2] = wavelengthRGB(450);
    expect(b2).toBeGreaterThan(200);
    expect(wavelengthRGB(300)).toEqual([0, 0, 0]);
  });
});

describe('Hubble: Ausgleichsgerade und Daten', () => {
  it('exakte Punkte v = 70·d ergeben H = 70, R² = 1', () => {
    const pts = [10, 50, 120, 300].map((d) => ({ d, v: 70 * d }));
    const f = fitThroughOrigin(pts)!;
    expect(f.H).toBeCloseTo(70, 12);
    expect(f.r2).toBeCloseTo(1, 12);
    expect(f.sigma).toBeCloseTo(0, 12);
    expect(sumSquares(pts, 70)).toBeCloseTo(0, 6);
    expect(sumSquares(pts, 71)).toBeGreaterThan(0);
  });
  it('H = Σdv/Σd² (Handrechnung mit drei Punkten)', () => {
    // (1|60), (2|150), (3|200): Σdv = 60 + 300 + 600 = 960, Σd² = 14 → 68,571…
    expect(fitThroughOrigin([{ d: 1, v: 60 }, { d: 2, v: 150 }, { d: 3, v: 200 }])!.H).toBeCloseTo(960 / 14, 12);
    expect(fitThroughOrigin([])).toBeNull();
  });
  it('Hubbles Daten von 1929 ergeben etwa 400 – 550 km/(s·Mpc), heutige etwa 65 – 75', () => {
    const old = fitThroughOrigin(HUBBLE_1929)!.H;
    expect(old).toBeGreaterThan(400);
    expect(old).toBeLessThan(550);
    const now = fitThroughOrigin(MODERN)!.H;
    expect(now).toBeGreaterThan(65);
    expect(now).toBeLessThan(75);
  });
  it('Beobachtungen: reproduzierbar, gemessene Daten ergeben H₀ nahe dem eingestellten Wert', () => {
    expect(observe(5, 70)).toEqual(observe(5, 70));
    const obs = Array.from({ length: 60 }, (_, i) => observe(i + 1, 70));
    const f = fitThroughOrigin(obs.map((o) => ({ d: o.dMeas, v: o.vMeas })))!;
    expect(f.H).toBeGreaterThan(64);
    expect(f.H).toBeLessThan(76);
    for (const o of obs) {
      expect(o.dTrue).toBeGreaterThanOrEqual(10);
      expect(o.dTrue).toBeLessThanOrEqual(400);
      expect(o.vMeas).toBeCloseTo(o.vTrue, 6);
    }
    // ohne Streuung exakt
    const exact = observe(3, 70, 1, 0);
    expect(exact.dMeas).toBeCloseTo(exact.dTrue, 9);
    expect(exact.vTrue).toBeCloseTo(70 * exact.dTrue, 9);
  });
});

describe('Hubble: Standardkerzen', () => {
  it('10 pc → Modul 0; 100 Mpc → 35; Umkehrung', () => {
    expect(distanceModulus(1e-5)).toBeCloseTo(0, 12);
    expect(distanceModulus(100)).toBeCloseTo(35, 12);
    expect(distanceFromModulus(15.7, -19.3)).toBeCloseTo(100, 9);
  });
});

describe('Hubble: Friedmann-Modelle', () => {
  it('leeres Universum: Alter = 1/H₀; Einstein-de-Sitter: 2/3 · 1/H₀ ≈ 9,31 Gyr', () => {
    expect(ageGyr(EMPTY)!).toBeCloseTo(hubbleTimeGyr(70), 2);
    expect(ageGyr(EDS)!).toBeCloseTo((2 / 3) * hubbleTimeGyr(70), 2);
    expect(ageGyr(EDS)!).toBeCloseTo(9.31, 1);
  });
  it('Ω_m = 0,3, Ω_Λ = 0,7: Alter ≈ 0,964/H₀ ≈ 13,47 Gyr, beschleunigt (q₀ = −0,55)', () => {
    expect(ageGyr(LCDM)!).toBeCloseTo(13.47, 1);
    expect(q0(LCDM)).toBeCloseTo(-0.55, 12);
    expect(omegaK(LCDM)).toBeCloseTo(0, 12);
    expect(E2(LCDM, 1)).toBeCloseTo(1, 12);
  });
  it('Einstein-de-Sitter: Alter bei z = 1 ist 1/2^{3/2} des heutigen', () => {
    expect(ageAtZ(EDS, 1)! / ageGyr(EDS)!).toBeCloseTo(Math.pow(2, -1.5), 3);
    expect(lookbackGyr(EDS, 0)!).toBeCloseTo(0, 6);
  });
  it('a(t): Urknall beim berechneten Alter; geschlossenes Modell stürzt zusammen', () => {
    const h = scaleHistory(EDS, -20, 20, 0.005);
    expect(h.bang).not.toBeNull();
    expect(-h.bang!).toBeCloseTo(ageGyr(EDS)!, 1);
    expect(h.crunch).toBeNull();
    const closed = scaleHistory({ H0: 70, Om: 3, OL: 0, Or: 0 }, -20, 80, 0.005);
    expect(closed.crunch).not.toBeNull();
    expect(closed.aMax).not.toBeNull();
    // Ω_m = 3: a_max = Ω_m/(Ω_m − 1) = 1,5
    expect(closed.aMax!).toBeCloseTo(1.5, 1);
  });
  it('Modell ohne Urknall (Ω_Λ groß, „Bounce“) liefert kein Alter', () => {
    expect(ageGyr({ H0: 70, Om: 0.1, OL: 2, Or: 0 })).toBeNull();
  });
  it('mitbewegte Entfernung: kleine z → c·z/H₀; Einstein-de-Sitter geschlossen ausrechenbar', () => {
    expect(comovingMpc(LCDM, 0.001)).toBeCloseTo((C_KMS * 0.001) / 70, 0);
    // EdS: D_C = 2c/H₀ · (1 − 1/√(1+z)); z = 3 → c/H₀
    expect(comovingMpc(EDS, 3)).toBeCloseTo(hubbleRadiusMpc(70), 0);
  });
});

describe('Hubble: Entfernung ↔ Rotverschiebung', () => {
  it('Einstein-de-Sitter: D = c/H₀ ↔ z = 3; kleine Entfernung ↔ z ≈ H₀·D/c', () => {
    expect(zFromComoving(EDS, hubbleRadiusMpc(70))).toBeCloseTo(3, 2);
    expect(zFromComoving(LCDM, 10)).toBeCloseTo((70 * 10) / C_KMS, 4);
    expect(zFromComoving(LCDM, 0)).toBe(0);
  });
  it('Modellart: ΛCDM flach und beschleunigt, Ω_m = 3 geschlossen und gebremst', () => {
    expect(modelKind(LCDM)).toEqual({ curvature: 'flat', accelerating: true, bang: true });
    expect(modelKind({ H0: 70, Om: 3, OL: 0, Or: 0 })).toEqual({ curvature: 'closed', accelerating: false, bang: true });
    expect(modelKind(EMPTY).curvature).toBe('open');
  });
});

describe('Hubble: Hintergrundstrahlung', () => {
  it('T₀ = 2,7255 K → λ_max ≈ 1,063 mm; bei z = 1090 ≈ 2973 K', () => {
    expect(wienPeak(2.7255) * 1000).toBeCloseTo(1.063, 3);
    expect(cmbTemp(1090)).toBeCloseTo(2973.5, 0);
  });
  it('Planck-Kurve hat ihr Maximum bei λ_max', () => {
    const T = 3000;
    const lm = wienPeak(T);
    expect(planck(lm, T)).toBeGreaterThan(planck(lm * 0.9, T));
    expect(planck(lm, T)).toBeGreaterThan(planck(lm * 1.1, T));
  });
});

describe('Hubble: Rosinenkuchen', () => {
  it('Jeder Heimatpunkt sieht v ∝ Abstand (kein Mittelpunkt)', () => {
    const dots = makeDots(4);
    expect(dots).toHaveLength(81);
    for (const home of [dots[0]!, dots[40]!, dots[77]!]) {
      for (const d of dots) {
        const [vx, vy] = relVelocity(d, home, 1.5, 0.2);
        const dist = Math.hypot(d.x - home.x, d.y - home.y) * 1.5;
        expect(Math.hypot(vx, vy)).toBeCloseTo((0.2 / 1.5) * dist * 1.5, 9);
      }
    }
  });
});
