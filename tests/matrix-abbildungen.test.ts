import { describe as group, expect, it } from 'vitest';
import {
  apply,
  charPoly,
  classify,
  describe,
  det,
  dominant,
  eigen,
  equal,
  figure,
  inverse,
  isStochastic,
  iterate,
  kernel,
  matrixOf,
  morphMat,
  mul,
  power,
  projection,
  reflection,
  rotation,
  signedArea,
  singular,
  sinAngle,
  stationary,
  type Mat,
  type TypeParams,
} from '../src/simulations/mathematik/matrix-abbildungen/model';

const rot = (deg: number): Mat => {
  const r = (deg * Math.PI) / 180;
  return { a: Math.cos(r), b: -Math.sin(r), c: Math.sin(r), d: Math.cos(r) };
};
const P0: TypeParams = { phi: 0, al: 0, kx: 1, ky: 1, k: 0, sd: 'x', r: 1 };
const close = (m: Mat, n: Mat) => {
  expect(m.a).toBeCloseTo(n.a, 9);
  expect(m.b).toBeCloseTo(n.b, 9);
  expect(m.c).toBeCloseTo(n.c, 9);
  expect(m.d).toBeCloseTo(n.d, 9);
};

group('Modell: Matrizen als lineare Abbildungen', () => {
  it('Spalten sind die Bilder von e₁ und e₂', () => {
    const m: Mat = { a: 2, b: 1, c: 0, d: 3 };
    expect(apply(m, [1, 0])).toEqual([2, 0]);
    expect(apply(m, [0, 1])).toEqual([1, 3]);
    expect(det(m)).toBe(6);
  });
  it('Drehung um 90°: det = 1, keine reellen Eigenwerte', () => {
    const m = rot(90);
    expect(det(m)).toBeCloseTo(1, 12);
    expect(eigen(m)).toEqual([]);
    expect(classify(m)).toBe('rotation');
  });
  it('Spiegelung an der x-Achse: det = −1, Eigenwerte 1 und −1', () => {
    const m: Mat = { a: 1, b: 0, c: 0, d: -1 };
    expect(classify(m)).toBe('reflection');
    expect(eigen(m).map((e) => e.value).sort()).toEqual([-1, 1]);
  });
  it('Scherung (1 1; 0 1): det = 1, ein Eigenwert 1 mit Eigenrichtung e₁', () => {
    const m: Mat = { a: 1, b: 1, c: 0, d: 1 };
    expect(classify(m)).toBe('shear');
    const e = eigen(m);
    expect(e.length).toBe(1);
    expect(e[0]!.value).toBe(1);
    expect(Math.abs(e[0]!.vector[1])).toBeLessThan(1e-12);
  });
  it('Projektion auf die x-Achse: det = 0', () => {
    expect(classify({ a: 1, b: 0, c: 0, d: 0 })).toBe('projection');
  });
  it('Eigenvektoren von (2 1; 1 2): λ = 3 und λ = 1', () => {
    const e = eigen({ a: 2, b: 1, c: 1, d: 2 });
    expect(e[0]!.value).toBeCloseTo(3, 12);
    expect(e[1]!.value).toBeCloseTo(1, 12);
  });
  it('Plausibilität: A·v = λv, det(AB) = det A · det B', () => {
    for (let i = 0; i < 100; i++) {
      const r = () => Math.round((Math.random() * 6 - 3) * 10) / 10;
      const m: Mat = { a: r(), b: r(), c: r(), d: r() };
      const n: Mat = { a: r(), b: r(), c: r(), d: r() };
      expect(det(mul(m, n))).toBeCloseTo(det(m) * det(n), 9);
      for (const e of eigen(m)) {
        const av = apply(m, e.vector);
        expect(av[0]).toBeCloseTo(e.value * e.vector[0], 6);
        expect(av[1]).toBeCloseTo(e.value * e.vector[1], 6);
      }
    }
  });
});

group('Matrizen aus Abbildungstypen', () => {
  it('Drehung um 90° ergibt genau (0 −1; 1 0), det 1, keine reellen Eigenwerte', () => {
    const m = matrixOf('rot', { ...P0, phi: 90 }, P0 as never);
    expect(m).toEqual({ a: 0, b: -1, c: 1, d: 0 });
    expect(det(m)).toBe(1);
    expect(eigen(m)).toEqual([]);
    const cp = charPoly(m);
    expect(cp.real).toEqual([]);
    expect(cp.re).toBe(0);
    expect(cp.im).toBeCloseTo(1, 12);
    expect(describe(m)).toEqual({ kind: 'rotation', angle: 90 });
  });
  it('Spiegelung an y = x (α = 45°) ergibt (0 1; 1 0) mit λ = ±1', () => {
    const m = reflection(45);
    expect(m).toEqual({ a: 0, b: 1, c: 1, d: 0 });
    expect(det(m)).toBe(-1);
    expect(eigen(m).map((e) => e.value).sort((u, v) => u - v)).toEqual([-1, 1]);
    const d = describe(m);
    expect(d.kind).toBe('reflection');
    expect(d.axis).toBeCloseTo(45, 9);
  });
  it('Spiegelung an der Achse α = 30°: Achse bleibt fest, Normale wird umgedreht', () => {
    const m = reflection(30);
    const u: [number, number] = [Math.cos(Math.PI / 6), Math.sin(Math.PI / 6)];
    const n: [number, number] = [-u[1], u[0]];
    expect(apply(m, u)[0]).toBeCloseTo(u[0], 12);
    expect(apply(m, u)[1]).toBeCloseTo(u[1], 12);
    expect(apply(m, n)[0]).toBeCloseTo(-n[0], 12);
    expect(describe(m).axis).toBeCloseTo(30, 9);
  });
  it('Scherung k = 1 in x-Richtung: λ = 1 doppelt, nur Eigenrichtung (1 | 0)', () => {
    const m = matrixOf('shear', { ...P0, k: 1, sd: 'x' }, P0 as never);
    expect(m).toEqual({ a: 1, b: 1, c: 0, d: 1 });
    expect(charPoly(m).real).toEqual([1]);
    expect(eigen(m)).toEqual([{ value: 1, vector: [1, 0] }]);
    expect(describe(m)).toEqual({ kind: 'shear', shear: 1, shearDir: 'x' });
  });
  it('Projektion auf die Gerade α = 45°: (0,5 0,5; 0,5 0,5), A² = A, senkrecht', () => {
    const m = projection(45);
    close(m, { a: 0.5, b: 0.5, c: 0.5, d: 0.5 });
    expect(det(m)).toBeCloseTo(0, 12);
    const d = describe(m);
    expect(d.proj).toBe('orth');
    expect(d.axis).toBeCloseTo(45, 9);
    expect(kernel(m)![0]).toBeCloseTo(-Math.SQRT1_2, 9);
  });
  it('Schatten (1 −1; 0 0) ist eine schräge Parallelprojektion auf die x-Achse', () => {
    const m: Mat = { a: 1, b: -1, c: 0, d: 0 };
    const d = describe(m);
    expect(d.kind).toBe('projection');
    expect(d.proj).toBe('oblique');
    expect(d.axis).toBe(0);
    // Punkt (2 | 1) wirft den Schatten (1 | 0)
    expect(apply(m, [2, 1])).toEqual([1, 0]);
  });
  it('Drehstreckung φ = 90°, r = 2: (0 −2; 2 0), det = r² = 4', () => {
    const m = matrixOf('rs', { ...P0, phi: 90, r: 2 }, P0 as never);
    expect(m).toEqual({ a: 0, b: -2, c: 2, d: 0 });
    expect(det(m)).toBe(4);
    expect(describe(m)).toEqual({ kind: 'rotscale', angle: 90, factor: 2 });
  });
  it('Streckung kx = 2, ky = 0,5 bleibt flächentreu (det 1), ist aber keine Scherung', () => {
    const m = matrixOf('scale', { ...P0, kx: 2, ky: 0.5 }, P0 as never);
    expect(det(m)).toBe(1);
    expect(classify(m)).toBe('scaling');
  });
  it('Drehung um 60° hat λ = ½ ± ½√3 · i', () => {
    const cp = charPoly(rotation(60));
    expect(cp.re).toBeCloseTo(0.5, 12);
    expect(cp.im).toBeCloseTo(Math.sqrt(3) / 2, 12);
  });
});

group('Verkettung und Inverse', () => {
  it('A = (1 2; 3 4), B = (0 1; 1 0): AB = (2 1; 4 3), BA = (3 4; 1 2)', () => {
    const A: Mat = { a: 1, b: 2, c: 3, d: 4 };
    const B: Mat = { a: 0, b: 1, c: 1, d: 0 };
    expect(mul(A, B)).toEqual({ a: 2, b: 1, c: 4, d: 3 });
    expect(mul(B, A)).toEqual({ a: 3, b: 4, c: 1, d: 2 });
    expect(equal(mul(A, B), mul(B, A))).toBe(false);
    expect(det(mul(A, B))).toBe(det(A) * det(B));
  });
  it('Zwei Spiegelungen (Achsen 0° und 60°) ergeben eine Drehung um 120°', () => {
    const m = mul(reflection(60), reflection(0));
    close(m, rotation(120));
    expect(describe(m).kind).toBe('rotation');
    expect(describe(m).angle).toBeCloseTo(120, 9);
    // andere Reihenfolge: Drehung um −120°
    expect(describe(mul(reflection(0), reflection(60))).angle).toBeCloseTo(-120, 9);
  });
  it('Inverse von (2 1; 1 1) ist (1 −1; −1 2)', () => {
    const A: Mat = { a: 2, b: 1, c: 1, d: 1 };
    expect(inverse(A)).toEqual({ a: 1, b: -1, c: -1, d: 2 });
    expect(mul(A, inverse(A)!)).toEqual({ a: 1, b: 0, c: 0, d: 1 });
  });
  it('Singuläre Matrix (1 2; 0,5 1) hat keine Inverse; Kern-Richtung (−2 | 1)', () => {
    const A: Mat = { a: 1, b: 2, c: 0.5, d: 1 };
    expect(inverse(A)).toBeNull();
    const k = kernel(A)!;
    const img = apply(A, k);
    expect(Math.hypot(img[0], img[1])).toBeLessThan(1e-12);
    expect(k[0] / k[1]).toBeCloseTo(-2, 12);
  });
  it('Plausibilität: A · A⁻¹ = E für zufällige reguläre Matrizen', () => {
    for (let i = 0; i < 100; i++) {
      const r = () => Math.round((Math.random() * 8 - 4) * 100) / 100;
      const m: Mat = { a: r(), b: r(), c: r(), d: r() };
      const inv = inverse(m);
      if (!inv || Math.abs(det(m)) < 0.05) continue;
      close(mul(m, inv), { a: 1, b: 0, c: 0, d: 1 });
      close(mul(inv, m), { a: 1, b: 0, c: 0, d: 1 });
    }
  });
});

group('Iteration, Übergangsmatrix und Fixvektor', () => {
  it('Kundenwanderung (0,9 0,2; 0,1 0,8): stationäre Verteilung (2/3 | 1/3)', () => {
    const A: Mat = { a: 0.9, b: 0.2, c: 0.1, d: 0.8 };
    expect(isStochastic(A)).toBe(true);
    const s = stationary(A)!;
    expect(s[0]).toBeCloseTo(2 / 3, 12);
    expect(s[1]).toBeCloseTo(1 / 3, 12);
    const As = apply(A, s);
    expect(As[0]).toBeCloseTo(s[0], 12);
    // Eigenwerte 1 und 0,7
    const cp = charPoly(A);
    expect(cp.real[0]).toBeCloseTo(1, 12);
    expect(cp.real[1]).toBeCloseTo(0.7, 12);
    // aus (1 | 0) nach einem Schritt (0,9 | 0,1), nach zwei (0,83 | 0,17), langfristig → (2/3 | 1/3)
    const it = iterate(A, [1, 0], 60);
    expect(it[1]![0]).toBeCloseTo(0.9, 12);
    expect(it[2]![0]).toBeCloseTo(0.83, 12);
    expect(it[60]![0]).toBeCloseTo(2 / 3, 6);
  });
  it('Population (0 1; 0,5 0,5): Fixvektor (1 | 1), aus (4 | 0) langfristig (4/3 | 4/3)', () => {
    const A: Mat = { a: 0, b: 1, c: 0.5, d: 0.5 };
    expect(isStochastic(A)).toBe(false);
    const dom = dominant(A)!;
    expect(dom.value).toBeCloseTo(1, 12);
    expect(dom.vector[0]).toBeCloseTo(dom.vector[1], 12);
    const it = iterate(A, [4, 0], 50);
    expect(it[1]).toEqual([0, 2]);
    expect(it[2]).toEqual([2, 1]);
    expect(it[50]![0]).toBeCloseTo(4 / 3, 6);
    expect(it[50]![1]).toBeCloseTo(4 / 3, 6);
  });
  it('Wachsende Population (0 2; 0,5 0,5): λ ≈ 1,281, Verhältnis Jung : Alt ≈ 2 : 1,281', () => {
    const A: Mat = { a: 0, b: 2, c: 0.5, d: 0.5 };
    const dom = dominant(A)!;
    expect(dom.value).toBeCloseTo((0.5 + Math.sqrt(4.25)) / 2, 12);
    expect(dom.vector[0] / dom.vector[1]).toBeCloseTo(2 / dom.value, 9);
  });
  it('Potenz: Aⁿ·x = iterate', () => {
    const A: Mat = { a: 1, b: 1, c: 1, d: 0 };
    const p5 = power(A, 5);
    expect(p5).toEqual({ a: 8, b: 5, c: 5, d: 3 }); // Fibonacci
    expect(apply(p5, [1, 0])).toEqual(iterate(A, [1, 0], 5)[5]);
  });
});

group('Geometrie: Fläche, Ellipse, Testvektor, Animation', () => {
  it('Flächeninhalt der Bildfigur = |det A| · Flächeninhalt der Figur, Vorzeichen = Orientierung', () => {
    const A: Mat = { a: 2, b: 1, c: 1, d: 2 };
    for (const key of ['f', 'house', 'rocket'] as const) {
      const poly = figure(key).fills[0]!;
      expect(signedArea(poly.map((v) => apply(A, v)))).toBeCloseTo(3 * signedArea(poly), 9);
      expect(signedArea(poly.map((v) => apply(reflection(0), v)))).toBeCloseTo(-signedArea(poly), 9);
    }
    // Fläche des F von Hand (vor dem Maßstab 0,65): Stamm 0,45·2,3 + Mittelbalken 0,65·0,45 + oberer Balken 0,95·0,45 = 1,755
    expect(signedArea(figure('f').fills[0]!)).toBeCloseTo((0.45 * 2.3 + 0.65 * 0.45 + 0.95 * 0.45) * 0.65 ** 2, 9);
  });
  it('Einheitskreis → Ellipse: σ₁ · σ₂ = |det A|; (2 0; 0 0,5) hat Halbachsen 2 und 0,5', () => {
    expect(singular({ a: 2, b: 0, c: 0, d: 0.5 })).toEqual([2, 0.5]);
    const A: Mat = { a: 2, b: 1, c: 1, d: 2 };
    const [s1, s2] = singular(A);
    expect(s1 * s2).toBeCloseTo(3, 9);
    expect(s1).toBeCloseTo(3, 9);
  });
  it('sin∠(v, Av) ist genau in Eigenrichtungen 0', () => {
    const A: Mat = { a: 2, b: 1, c: 1, d: 2 };
    expect(sinAngle(A, [1, 1])).toBeCloseTo(0, 12);
    expect(sinAngle(A, [1, -1])).toBeCloseTo(0, 12);
    expect(Math.abs(sinAngle(A, [1, 0]))).toBeGreaterThan(0.1);
    expect(sinAngle(rotation(90), [1, 0])).toBeCloseTo(1, 12);
  });
  it('Animation: Start E, Ende A; Drehung bleibt unterwegs eine Drehung (det konstant 1)', () => {
    const A: Mat = { a: 2, b: 1, c: 0, d: 1 };
    close(morphMat(A, 0), { a: 1, b: 0, c: 0, d: 1 });
    close(morphMat(A, 1), A);
    const R = rotation(180);
    for (const t of [0.25, 0.5, 0.75]) expect(det(morphMat(R, t))).toBeCloseTo(1, 9);
    close(morphMat(R, 1), R);
    close(morphMat(rotation(90), 0.5), rot(45));
  });
});
