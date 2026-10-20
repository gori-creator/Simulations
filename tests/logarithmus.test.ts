import { describe, expect, it } from 'vitest';
import {
  avoidOne,
  bracket,
  changeOfBase,
  flipAcrossDiagonal,
  isValidBase,
  lg,
  ln,
  log,
  logProperties,
  mirror,
  pow,
  powerLaw,
  powerTable,
  productLaw,
  quotientLaw,
  solveExponential,
} from '../src/simulations/mathematik/logarithmus/model';

/** Einfacher, reproduzierbarer Zufall (LCG) für die Plausibilitätsprüfungen. */
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}
const rand = rng(20261019);
/** Zufällige zulässige Basis zwischen 0,2 und 10 (ohne die Nähe von 1). */
function randomBase(): number {
  for (;;) {
    const b = 0.2 + rand() * 9.8;
    if (Math.abs(b - 1) > 0.02) return b;
  }
}

describe('Modell: Logarithmus – Lehrbuchwerte', () => {
  it('log₂ 8 = 3, log₂ 1 = 0, log₂ 0,5 = −1', () => {
    expect(log(2, 8)).toBe(3);
    expect(log(2, 1)).toBe(0);
    expect(log(2, 0.5)).toBe(-1);
  });

  it('log₁₀ 1000 = 3 und log₁₀ 0,01 = −2 (exakt, ohne Rundungsfehler)', () => {
    expect(log(10, 1000)).toBe(3);
    expect(log(10, 0.01)).toBe(-2);
    expect(lg(1000)).toBe(3);
  });

  it('log₃ 81 = 4 und ln e = 1', () => {
    expect(log(3, 81)).toBe(4);
    expect(ln(Math.E)).toBe(1);
    expect(log(Math.E, Math.E ** 2)).toBe(2);
  });

  it('log₀,₅ 4 = −2 (Basis kleiner als 1)', () => {
    expect(log(0.5, 4)).toBe(-2);
    expect(log(0.5, 0.25)).toBe(2);
  });

  it('log_b b = 1 und log_b 1 = 0 für viele Basen', () => {
    for (const b of [0.2, 0.25, 0.5, 0.95, 1.05, 1.5, 2, Math.E, 3, 7.5, 10]) {
      expect(log(b, b)).toBe(1);
      expect(log(b, 1)).toBe(0);
    }
    for (let i = 0; i < 200; i++) {
      const b = randomBase();
      expect(log(b, b)).toBe(1);
      expect(log(b, 1)).toBe(0);
    }
  });

  it('nicht ganzzahlige Ergebnisse, z. B. log₄ 8 = 1,5 und log₂ 10 ≈ 3,3219', () => {
    expect(log(4, 8)).toBeCloseTo(1.5, 12);
    expect(log(2, 10)).toBeCloseTo(3.321928, 6);
  });
});

describe('Modell: Logarithmus – nicht definiert', () => {
  it('für y ≤ 0 (denn bˣ > 0)', () => {
    expect(log(2, 0)).toBeNaN();
    expect(log(2, -4)).toBeNaN();
    expect(log(10, -0.01)).toBeNaN();
    expect(log(2, Number.POSITIVE_INFINITY)).toBeNaN();
  });

  it('für b ≤ 0 und b = 1', () => {
    expect(isValidBase(1)).toBe(false);
    expect(isValidBase(0)).toBe(false);
    expect(isValidBase(-2)).toBe(false);
    expect(isValidBase(Number.NaN)).toBe(false);
    expect(isValidBase(0.2)).toBe(true);
    expect(log(1, 5)).toBeNaN();
    expect(log(0, 5)).toBeNaN();
    expect(log(-2, 4)).toBeNaN();
    expect(pow(-2, 0.5)).toBeNaN();
    expect(logProperties(1)).toBeNull();
  });
});

describe('Modell: Basiswechsel und Exponentialgleichungen', () => {
  it('log₂ 10 = lg 10 / lg 2 ≈ 3,3219', () => {
    const r = changeOfBase(2, 10);
    expect(r.num).toBe(1);
    expect(r.den).toBeCloseTo(0.30103, 5);
    expect(r.x).toBeCloseTo(3.3219, 4);
  });

  it('2ˣ = 10 → x ≈ 3,32; 3ˣ = 50 → x ≈ 3,561', () => {
    expect(solveExponential(2, 10)).toBeCloseTo(3.32, 2);
    expect(solveExponential(3, 50)).toBeCloseTo(3.561, 3);
    expect(pow(3, solveExponential(3, 50)!)).toBeCloseTo(50, 10);
  });

  it('keine Lösung für c ≤ 0 oder unzulässige Basis', () => {
    expect(solveExponential(2, 0)).toBeNull();
    expect(solveExponential(2, -3)).toBeNull();
    expect(solveExponential(1, 3)).toBeNull();
    expect(Number.isNaN(changeOfBase(2, -1).x)).toBe(true);
  });

  it('Eingrenzen zwischen ganzen Zahlen: 2³ = 8 < 10 < 16 = 2⁴', () => {
    expect(bracket(2, 10)).toEqual({ lo: 3, hi: 4, powLo: 8, powHi: 16, exact: false });
    expect(bracket(3, 50)).toEqual({ lo: 3, hi: 4, powLo: 27, powHi: 81, exact: false });
    expect(bracket(2, 8)).toEqual({ lo: 3, hi: 4, powLo: 8, powHi: 16, exact: true });
    expect(bracket(2, 0.3)!.lo).toBe(-2);
    // Basis kleiner als 1: 0,5^(−4) = 16 ≥ 10 > 8 = 0,5^(−3)
    expect(bracket(0.5, 10)).toEqual({ lo: -4, hi: -3, powLo: 16, powHi: 8, exact: false });
    expect(bracket(2, -1)).toBeNull();
  });

  it('sehr kleine und große c und Basen nahe 1', () => {
    expect(solveExponential(10, 0.01)).toBe(-2);
    expect(solveExponential(1.05, 1000)).toBeCloseTo(141.58, 2);
    expect(solveExponential(0.95, 1000)).toBeCloseTo(-134.67, 2);
  });
});

describe('Modell: Rechengesetze (Zufallswerte)', () => {
  it('Produktregel log(u·v) = log u + log v', () => {
    const r = productLaw(2, 4, 8);
    expect(r).toMatchObject({ lu: 2, lv: 3, sum: 5, result: 5, value: 32 });
    expect(productLaw(10, 20, 50).result).toBe(3);
    for (let i = 0; i < 300; i++) {
      const b = randomBase();
      const u = 0.1 + rand() * 99.9;
      const v = 0.1 + rand() * 99.9;
      const p = productLaw(b, u, v);
      expect(p.result).toBeCloseTo(p.sum, 9);
    }
  });

  it('Quotientenregel log(u/v) = log u − log v', () => {
    expect(quotientLaw(2, 32, 4)).toMatchObject({ lu: 5, lv: 2, diff: 3, result: 3, value: 8 });
    for (let i = 0; i < 300; i++) {
      const b = randomBase();
      const u = 0.1 + rand() * 99.9;
      const v = 0.1 + rand() * 99.9;
      const q = quotientLaw(b, u, v);
      expect(q.result).toBeCloseTo(q.diff, 9);
    }
  });

  it('Potenzregel log(uʳ) = r · log u', () => {
    expect(powerLaw(2, 4, 3)).toMatchObject({ lu: 2, prod: 6, result: 6, value: 64 });
    expect(powerLaw(10, 2, 3).prod).toBeCloseTo(0.90309, 5);
    for (let i = 0; i < 300; i++) {
      const b = randomBase();
      const u = 0.1 + rand() * 20;
      const r = -3 + rand() * 7;
      const q = powerLaw(b, u, r);
      expect(q.result).toBeCloseTo(q.prod, 8);
    }
  });
});

describe('Modell: Umkehrung', () => {
  it('b^(log_b y) = y und log_b(bˣ) = x (Zufallswerte)', () => {
    for (let i = 0; i < 400; i++) {
      const b = randomBase();
      const y = 0.01 + rand() * 500;
      expect(pow(b, log(b, y)) / y).toBeCloseTo(1, 10);
      const x = -4 + rand() * 8;
      expect(log(b, pow(b, x))).toBeCloseTo(x, 9);
    }
  });

  it('Spiegelung an y = x und Zwischenstellungen beim Umklappen', () => {
    expect(mirror([3, 8])).toEqual([3, 8].reverse());
    const [x0, y0] = flipAcrossDiagonal([3, 8], 0);
    expect(x0).toBeCloseTo(3, 12);
    expect(y0).toBeCloseTo(8, 12);
    const [x1, y1] = flipAcrossDiagonal([3, 8], 1);
    expect(x1).toBeCloseTo(8, 12);
    expect(y1).toBeCloseTo(3, 12);
    // Halbzeit: Punkt liegt auf y = x (Lotfußpunkt)
    const [xm, ym] = flipAcrossDiagonal([3, 8], 0.5);
    expect(xm).toBeCloseTo(5.5, 12);
    expect(ym).toBeCloseTo(5.5, 12);
    // Der Weg verläuft senkrecht zu y = x: x + y bleibt gleich
    for (const t of [0.1, 0.3, 0.7, 0.9]) {
      const [x, y] = flipAcrossDiagonal([-1, 0.5], t);
      expect(x + y).toBeCloseTo(-0.5, 12);
    }
  });

  it('Punkte des Exponentialgraphen landen auf dem Logarithmusgraphen', () => {
    for (const b of [0.2, 0.5, 2, Math.E, 10]) {
      for (const x of [-2, -0.5, 0, 1, 1.7]) {
        const [mx, my] = mirror([x, pow(b, x)]);
        expect(log(b, mx)).toBeCloseTo(my, 10);
      }
    }
  });
});

describe('Modell: Steckbrief, Tabelle, Basis nahe 1', () => {
  it('Steckbrief der Logarithmusfunktion', () => {
    expect(logProperties(2)).toEqual({ domain: 'R+', range: 'R', zero: [1, 0], unitPoint: [2, 1], asymptote: 0, monotony: 'inc' });
    expect(logProperties(0.5)!.monotony).toBe('dec');
    expect(logProperties(0.95)!.monotony).toBe('dec');
    expect(logProperties(1.05)!.monotony).toBe('inc');
  });

  it('Wertetabelle der Zweierpotenzen', () => {
    expect(powerTable(2, [-2, -1, 0, 1, 2, 3])).toEqual([
      { x: -2, y: 0.25 },
      { x: -1, y: 0.5 },
      { x: 0, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 4 },
      { x: 3, y: 8 },
    ]);
  });

  it('b = 1 wird beim Ziehen übersprungen', () => {
    expect(avoidOne(1, 1.05)).toBeCloseTo(0.95, 12);
    expect(avoidOne(1, 0.95)).toBeCloseTo(1.05, 12);
    expect(avoidOne(1.05, 1.1)).toBe(1.05);
    expect(avoidOne(0.95, 0.9)).toBe(0.95);
    expect(avoidOne(2, 1)).toBe(2);
  });
});
