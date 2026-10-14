import { describe, expect, it } from 'vitest';
import {
  crossSection,
  discs,
  discVolume,
  effectiveInterval,
  FN_IDS,
  hornLimit,
  integralF2,
  knownSolid,
  piForm,
  radiusRange,
  volume,
  type FnParams,
} from '../src/simulations/mathematik/rotationskoerper/model';

const P: FnParams = { r: 2, m: 0.5, c: 1, k: 1 };
const with_ = (q: Partial<FnParams>): FnParams => ({ ...P, ...q });

/** Numerisches Integral von f² mit der Simpsonregel (unabhängige Kontrolle). */
function simpsonVolume(f: (x: number) => number, a: number, b: number, n = 2000): number {
  const h = (b - a) / n;
  let s = f(a) ** 2 + f(b) ** 2;
  for (let i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * f(a + i * h) ** 2;
  return (Math.PI * s * h) / 3;
}

describe('Modell: Rotationskörper – exakte Volumina', () => {
  it('konstante Funktion f = r ergibt den Zylinder π r² h', () => {
    expect(volume('zyl', with_({ r: 3 }), 1, 6)).toBeCloseTo(Math.PI * 9 * 5, 10);
    const ks = knownSolid('zyl', with_({ r: 3 }), 1, 6);
    expect(ks.name).toBe('zylinder');
    expect(ks.volume).toBeCloseTo(45 * Math.PI, 10);
  });

  it('f(x) = x auf [0; h] ergibt den Kegel π h³ : 3', () => {
    const h = 5;
    expect(volume('kegel', with_({ m: 1 }), 0, h)).toBeCloseTo((Math.PI * h ** 3) / 3, 10);
    const ks = knownSolid('kegel', with_({ m: 1 }), 0, h);
    expect(ks.name).toBe('kegel');
    expect(ks.volume).toBeCloseTo((Math.PI * h ** 3) / 3, 10);
  });

  it('Halbkreis mit r = 2 ergibt die Kugel 32π : 3', () => {
    expect(volume('kugel', with_({ r: 2 }), -2, 2)).toBeCloseTo((32 * Math.PI) / 3, 10);
    const ks = knownSolid('kugel', with_({ r: 2 }), -2, 2);
    expect(ks.name).toBe('kugel');
    expect(ks.volume).toBeCloseTo((4 / 3) * Math.PI * 8, 10);
  });

  it('√x auf [0; 4] ergibt das Paraboloid 8π', () => {
    expect(volume('para', with_({ k: 1 }), 0, 4)).toBeCloseTo(8 * Math.PI, 10);
    const ks = knownSolid('para', with_({ k: 1 }), 0, 4);
    expect(ks.name).toBe('paraboloid');
    expect(ks.volume).toBeCloseTo(8 * Math.PI, 10);
  });

  it('Sinusbogen auf [0; π] ergibt π² : 2', () => {
    expect(volume('sin', with_({ k: 1 }), 0, Math.PI)).toBeCloseTo(Math.PI ** 2 / 2, 10);
    expect(piForm(volume('sin', with_({ k: 1 }), 0, Math.PI))).toEqual({ num: 1, den: 2, pow: 2 });
  });

  it('1/x auf [1; b] ergibt π(1 − 1/b), Grenzwert π', () => {
    expect(volume('horn', with_({ k: 1 }), 1, 4)).toBeCloseTo(Math.PI * 0.75, 10);
    expect(hornLimit(with_({ k: 1 }), 1)).toBeCloseTo(Math.PI, 12);
    expect(volume('horn', with_({ k: 1 }), 1, 1e9)).toBeCloseTo(Math.PI, 6);
  });

  it('Kegelstumpf: Integral stimmt mit ⅓πh(R² + Rr + r²) überein', () => {
    // f(x) = 0,5x + 1 auf [0; 4]: r = 1, R = 3, h = 4
    const V = volume('stumpf', P, 0, 4);
    expect(V).toBeCloseTo(((Math.PI * 4) / 3) * (9 + 3 + 1), 10);
    const ks = knownSolid('stumpf', P, 0, 4);
    expect(ks.name).toBe('kegelstumpf');
    expect(ks.volume).toBeCloseTo(V, 10);
  });

  it('Doppelkegel bei Vorzeichenwechsel, Kugelabschnitt und Kugelschicht', () => {
    const dk = knownSolid('kegel', with_({ m: 1 }), -2, 3);
    expect(dk.name).toBe('doppelkegel');
    expect(dk.volume).toBeCloseTo(volume('kegel', with_({ m: 1 }), -2, 3), 10);
    const seg = knownSolid('kugel', with_({ r: 3 }), 1, 3);
    expect(seg.name).toBe('kugelabschnitt');
    expect(seg.volume).toBeCloseTo(volume('kugel', with_({ r: 3 }), 1, 3), 10);
    const layer = knownSolid('kugel', with_({ r: 3 }), -1, 2);
    expect(layer.name).toBe('kugelschicht');
    expect(layer.volume).toBeCloseTo(volume('kugel', with_({ r: 3 }), -1, 2), 10);
    const ps = knownSolid('para', with_({ k: 1.5 }), 1, 5);
    expect(ps.name).toBe('paraboloidstumpf');
    expect(ps.volume).toBeCloseTo(volume('para', with_({ k: 1.5 }), 1, 5), 10);
  });

  it('Stammfunktionen stimmen für alle Funktionen mit der Simpsonregel überein', () => {
    const cases: [(typeof FN_IDS)[number], number, number][] = [
      ['zyl', -1, 3],
      ['kegel', -2, 3],
      ['stumpf', 0, 4],
      ['kugel', -1.5, 2],
      ['para', 0.5, 6],
      ['sin', 0.3, 2.8],
      ['horn', 0.5, 7],
    ];
    const p = with_({ r: 2, m: 0.7, c: 0.5, k: 1.3 });
    for (const [id, a, b] of cases) {
      const f = (x: number) => Math.sqrt(crossSection(id, p, x) / Math.PI);
      expect(volume(id, p, a, b)).toBeCloseTo(simpsonVolume(f, a, b), 6);
      expect(integralF2(id, p, a, b)).toBeGreaterThan(0);
    }
  });
});

describe('Modell: Rotationskörper – Scheibenmethode', () => {
  it('Querschnitt A(x) = π f(x)²', () => {
    expect(crossSection('kugel', with_({ r: 2 }), 1)).toBeCloseTo(3 * Math.PI, 12);
    expect(crossSection('zyl', with_({ r: 3 }), 0.4)).toBeCloseTo(9 * Math.PI, 12);
  });

  it('beim Zylinder ist jede Scheibensumme exakt', () => {
    for (const n of [1, 3, 10]) for (const kind of ['mid', 'lower', 'upper'] as const) expect(discVolume('zyl', P, 0, 4, n, kind)).toBeCloseTo(16 * Math.PI, 10);
  });

  it('Kegel mit 4 Scheiben: Werte von Hand nachgerechnet', () => {
    // f(x) = x auf [0; 4], Δx = 1: innen r = 0, 1, 2, 3; außen r = 1, 2, 3, 4
    const p = with_({ m: 1 });
    expect(discVolume('kegel', p, 0, 4, 4, 'lower')).toBeCloseTo(14 * Math.PI, 10);
    expect(discVolume('kegel', p, 0, 4, 4, 'upper')).toBeCloseTo(30 * Math.PI, 10);
    // Mittelpunkte 0,5; 1,5; 2,5; 3,5 → Σ r² = 21
    expect(discVolume('kegel', p, 0, 4, 4, 'mid')).toBeCloseTo(21 * Math.PI, 10);
  });

  it('innere und äußere Scheiben schließen das Volumen ein und konvergieren', () => {
    const p = with_({ r: 2 });
    const V = volume('kugel', p, -2, 2);
    let prevGap = Infinity;
    for (const n of [2, 4, 8, 16, 32, 64, 256]) {
      const lo = discVolume('kugel', p, -2, 2, n, 'lower');
      const hi = discVolume('kugel', p, -2, 2, n, 'upper');
      expect(lo).toBeLessThanOrEqual(V + 1e-9);
      expect(hi).toBeGreaterThanOrEqual(V - 1e-9);
      expect(hi - lo).toBeLessThan(prevGap);
      prevGap = hi - lo;
    }
    // Differenz = π · (Gesamtänderung von f²) · Δx = π · 8 · 4/256
    expect(prevGap).toBeCloseTo((Math.PI * 8 * 4) / 256, 10);
    // Mittelpunktsumme: Fehler fällt etwa mit 1/n²
    const e16 = Math.abs(discVolume('para', with_({ k: 1 }), 0, 4, 16, 'mid') - 8 * Math.PI);
    const e64 = Math.abs(discVolume('sin', with_({ k: 1 }), 0, Math.PI, 64, 'mid') - Math.PI ** 2 / 2);
    expect(e16).toBeLessThan(1e-9); // f² = x linear → Mittelpunktsumme exakt
    expect(e64).toBeLessThan(1e-3);
  });

  it('Radien der Scheiben berücksichtigen innere Extremstellen und Nullstellen', () => {
    expect(radiusRange('sin', P, 1, 2)).toEqual([Math.sin(1), 1]);
    const [lo, hi] = radiusRange('kegel', with_({ m: 1 }), -1, 2);
    expect(lo).toBe(0);
    expect(hi).toBe(2);
    const list = discs('kugel', with_({ r: 2 }), -2, 2, 4, 'upper');
    expect(list.map((d) => d.r)).toEqual([Math.sqrt(3), 2, 2, Math.sqrt(3)]);
    expect(list[3]!.x1).toBe(2);
  });

  it('wirksames Intervall bleibt im Definitionsbereich', () => {
    expect(effectiveInterval('sin', P, 0, 3.15)).toEqual([0, Math.PI]);
    expect(effectiveInterval('kugel', with_({ r: 2 }), -3, 5)).toEqual([-2, 2]);
    expect(effectiveInterval('horn', P, 0, 4)).toEqual([0.25, 4]);
    const [a, b] = effectiveInterval('para', P, 2, 2);
    expect(b - a).toBeCloseTo(0.1, 12);
    expect(effectiveInterval('zyl', P, 5, 1)).toEqual([1, 5]);
  });

  it('exakte Werte als Vielfache von π', () => {
    expect(piForm((32 * Math.PI) / 3)).toEqual({ num: 32, den: 3, pow: 1 });
    expect(piForm(8 * Math.PI)).toEqual({ num: 8, den: 1, pow: 1 });
    expect(piForm(Math.sqrt(2))).toBeNull();
  });
});
