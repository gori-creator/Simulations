import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import {
  angleFromSides,
  angles,
  areaSAS,
  circumcenter,
  circumradius,
  cosCorrection,
  cosineFigure,
  dist,
  foot,
  isFlat,
  lakeDistance,
  lawFor,
  lawOfCosines,
  minAngle,
  placeB,
  placeSolved,
  polygonArea,
  randomTriangle,
  sides,
  sineProof,
  sineQuotients,
  sineRuleSide,
  solve,
  survey,
  type Given,
  type Tri,
} from '../src/simulations/mathematik/sinussatz-kosinussatz/model';

const DEG = Math.PI / 180;
const G = (g: Partial<Given>): Given => ({ a: 5, b: 5, c: 5, al: 60, be: 60, ga: 60, ...g });

describe('Modell: Sinussatz und Kosinussatz – Prüfwerte', () => {
  it('Kosinussatz (SWS): a = 7, b = 5, γ = 60° → c² = 49 + 25 − 35 = 39, c ≈ 6,245; Fläche ≈ 15,155', () => {
    expect(lawOfCosines(7, 5, 60) ** 2).toBeCloseTo(39, 12);
    expect(lawOfCosines(7, 5, 60)).toBeCloseTo(6.245, 3);
    expect(cosCorrection(7, 5, 60)).toBeCloseTo(35, 12);
    expect(areaSAS(7, 5, 60)).toBeCloseTo(15.155, 3);
    const r = solve('sws', G({ a: 7, b: 5, ga: 60 }));
    expect(r.kind).toBe('ok');
    if (r.kind !== 'ok') return;
    expect(r.tris).toHaveLength(1);
    expect(r.tris[0]!.c).toBeCloseTo(Math.sqrt(39), 12);
    expect(r.tris[0]!.al + r.tris[0]!.be + r.tris[0]!.ga).toBeCloseTo(180, 10);
  });

  it('Sinussatz (WSW): α = 40°, β = 60°, c = 10 → γ = 80°, a ≈ 6,527, b ≈ 8,794, 2r ≈ 10,154', () => {
    const r = solve('wsw', G({ c: 10, al: 40, be: 60 }));
    expect(r.kind).toBe('ok');
    if (r.kind !== 'ok') return;
    const s = r.tris[0]!;
    expect(s.ga).toBeCloseTo(80, 12);
    expect(s.a).toBeCloseTo(6.527, 3);
    expect(s.b).toBeCloseTo(8.794, 3);
    expect(10 / Math.sin(80 * DEG)).toBeCloseTo(10.154, 3);
    expect(2 * circumradius(placeSolved(s))).toBeCloseTo(10.154, 3);
    expect(sineRuleSide(10, 80, 40)).toBeCloseTo(s.a, 12);
  });

  it('SSS 4, 5, 6: Winkel gegenüber 6 ≈ 82,82° (cos = 0,125), gegenüber 4 ≈ 41,41° (cos = 0,75), gegenüber 5 ≈ 55,77°', () => {
    expect(Math.cos(angleFromSides(4, 5, 6) * DEG)).toBeCloseTo(0.125, 12);
    expect(angleFromSides(4, 5, 6)).toBeCloseTo(82.82, 2);
    expect(Math.cos(angleFromSides(5, 6, 4) * DEG)).toBeCloseTo(0.75, 12);
    expect(angleFromSides(5, 6, 4)).toBeCloseTo(41.41, 2);
    const r = solve('sss', G({ a: 4, b: 5, c: 6 }));
    expect(r.kind).toBe('ok');
    if (r.kind !== 'ok') return;
    const s = r.tris[0]!;
    expect(s.al).toBeCloseTo(41.41, 2);
    expect(s.be).toBeCloseTo(55.77, 2);
    expect(s.ga).toBeCloseTo(82.82, 2);
  });

  it('γ = 90°: Kosinussatz wird zum Pythagoras (3, 4 → 5), Korrektur 0', () => {
    expect(lawOfCosines(3, 4, 90)).toBeCloseTo(5, 12);
    expect(cosCorrection(3, 4, 90)).toBeCloseTo(0, 12);
    const t: Tri = [
      [0, 4],
      [3, 0],
      [0, 0],
    ];
    expect(sides(t)).toEqual([3, 4, 5]);
    expect(angles(t)[2]).toBeCloseTo(90, 10);
    expect(circumradius(t)).toBeCloseTo(2.5, 12);
  });

  it('SSW: a = 4, c = 6, α = 30° → sin γ = 0,75 → γ ≈ 48,59° oder 131,41° (zwei Dreiecke)', () => {
    const r = solve('ssw', G({ a: 4, c: 6, al: 30 }));
    expect(r.kind).toBe('ok');
    if (r.kind !== 'ok') return;
    expect(r.sinG).toBeCloseTo(0.75, 12);
    expect(r.tris).toHaveLength(2);
    expect(r.tris[0]!.ga).toBeCloseTo(48.59, 2);
    expect(r.tris[1]!.ga).toBeCloseTo(131.41, 2);
    expect(r.tris[0]!.be).toBeCloseTo(101.41, 2);
    expect(r.tris[1]!.be).toBeCloseTo(18.59, 2);
    // b über den Sinussatz: b = a · sin β : sin α
    expect(r.tris[0]!.b).toBeCloseTo(7.842, 3);
    expect(r.tris[1]!.b).toBeCloseTo(2.550, 3);
    // beide Dreiecke haben wirklich die gegebenen Stücke
    for (const s of r.tris) {
      const t = placeSolved(s);
      const [a, , c] = sides(t);
      expect(a).toBeCloseTo(4, 10);
      expect(c).toBeCloseTo(6, 10);
      expect(angles(t)[0]).toBeCloseTo(30, 9);
    }
  });

  it('Vermessung: Standlinie 200 m, Winkel 70° und 60° → 50°, Entfernungen ≈ 226,1 m und ≈ 245,3 m (nicht 245,4)', () => {
    const v = survey(200, 70, 60);
    expect(v.tau).toBeCloseTo(50, 12);
    expect(v.at).toBeCloseTo(226.1, 1);
    expect(v.bt).toBeCloseTo(245.34, 2);
    expect(v.width).toBeCloseTo(212.5, 1);
    expect(Math.hypot(v.along, v.width)).toBeCloseTo(v.at, 10);
  });

  it('See (SWS): 300 m, 400 m, 50° → |AB| ≈ 309,4 m', () => {
    expect(lakeDistance(300, 400, 50) ** 2).toBeCloseTo(250000 - 240000 * Math.cos(50 * DEG), 6);
    expect(lakeDistance(300, 400, 50)).toBeCloseTo(309.4, 1);
  });
});

describe('Modell: Löser – Sonderfälle', () => {
  it('welcher Satz: SSS/SWS → Kosinussatz, WSW/SSW → Sinussatz', () => {
    expect(lawFor('sss')).toBe('cos');
    expect(lawFor('sws')).toBe('cos');
    expect(lawFor('wsw')).toBe('sin');
    expect(lawFor('ssw')).toBe('sin');
  });
  it('SSS ohne Dreieck: 2 + 3 ≤ 6 und der Grenzfall 2 + 3 = 5', () => {
    expect(solve('sss', G({ a: 2, b: 3, c: 6 }))).toMatchObject({ kind: 'none', reason: 'triangle' });
    expect(solve('sss', G({ a: 2, b: 3, c: 5 }))).toMatchObject({ kind: 'none', reason: 'triangle' });
  });
  it('WSW ohne Dreieck: α + β ≥ 180°', () => {
    expect(solve('wsw', G({ c: 5, al: 100, be: 80 }))).toMatchObject({ kind: 'none', reason: 'angles' });
    expect(solve('wsw', G({ c: 5, al: 120, be: 70 }))).toMatchObject({ kind: 'none', reason: 'angles' });
  });
  it('SSW: zu kurz (sin γ > 1), genau rechtwinklig (sin γ = 1), a ≥ c (eine Lösung)', () => {
    const short = solve('ssw', G({ a: 2, c: 6, al: 30 }));
    expect(short).toMatchObject({ kind: 'none', reason: 'short' });
    expect(short.sinG).toBeCloseTo(1.5, 12);
    const right = solve('ssw', G({ a: 3, c: 6, al: 30 }));
    expect(right.kind).toBe('ok');
    if (right.kind === 'ok') {
      expect(right.tris).toHaveLength(1);
      expect(right.tris[0]!.ga).toBe(90);
      expect(right.tris[0]!.b).toBeCloseTo(6 * Math.cos(30 * DEG), 10);
    }
    const big = solve('ssw', G({ a: 7, c: 6, al: 30 }));
    expect(big.kind).toBe('ok');
    if (big.kind === 'ok') {
      expect(big.tris).toHaveLength(1);
      expect(big.tris[0]!.ga).toBeLessThan(90);
    }
    // gleichschenklig a = c: die zweite „Lösung“ entartet
    const iso = solve('ssw', G({ a: 5, c: 5, al: 40 }));
    expect(iso.kind === 'ok' && iso.tris.length).toBe(1);
  });
  it('SSW mit stumpfem α: nur für a > c ein Dreieck', () => {
    expect(solve('ssw', G({ a: 5, c: 6, al: 120 }))).toMatchObject({ kind: 'none', reason: 'obtuse' });
    const ok = solve('ssw', G({ a: 9, c: 6, al: 120 }));
    expect(ok.kind).toBe('ok');
    if (ok.kind === 'ok') {
      expect(ok.tris).toHaveLength(1);
      expect(ok.tris[0]!.ga).toBeCloseTo(Math.asin((6 * Math.sin(120 * DEG)) / 9) / DEG, 10);
    }
  });
});

describe('Modell: Geometrie am Dreieck', () => {
  const T: Tri = [
    [1, 1],
    [10, 1],
    [4, 6],
  ];
  it('Beispiel der Simulation: A(1|1), B(10|1), C(4|6)', () => {
    const [a, b, c] = sides(T);
    expect(a).toBeCloseTo(Math.sqrt(61), 12);
    expect(b).toBeCloseTo(Math.sqrt(34), 12);
    expect(c).toBe(9);
    expect(angles(T)[2]).toBeCloseTo(81.16, 2);
    expect(2 * circumradius(T)).toBeCloseTo(9.11, 2);
  });
  it('Gleichseitig: alle Winkel 60°, 2r = a : sin 60°', () => {
    const t: Tri = [
      [0, 0],
      [2, 0],
      [1, Math.sqrt(3)],
    ];
    angles(t).forEach((w) => expect(w).toBeCloseTo(60, 10));
    expect(2 * circumradius(t)).toBeCloseTo(2 / Math.sin(Math.PI / 3), 12);
  });
  it('Beweisidee: h_c = b · sin α = a · sin β', () => {
    const pr = sineProof(T);
    expect(pr.hc).toBeCloseTo(5, 12);
    expect(pr.viaB).toBeCloseTo(5, 12);
    expect(pr.viaA).toBeCloseTo(5, 12);
    expect(pr.foot[0]).toBeCloseTo(4, 12);
    // stumpfer Winkel bei B: Fußpunkt außerhalb von [AB], Gleichung gilt trotzdem
    const o: Tri = [
      [1, 1],
      [7, 1],
      [10, 4],
    ];
    const po = sineProof(o);
    expect(po.t).toBeGreaterThan(1);
    expect(po.viaA).toBeCloseTo(po.hc, 12);
    expect(po.viaB).toBeCloseTo(po.hc, 12);
  });
  it('Lotfußpunkt und Abschnitt b · cos γ', () => {
    const f = foot(T[0], T[2], T[1]);
    const [, b] = sides(T);
    expect(dist(T[2], f.at)).toBeCloseTo(b * Math.cos(angles(T)[2] * DEG), 10);
  });
  it('Flächenbild: Rechtecke bei C haben den Inhalt ab · cos γ, die Teile des Quadrats über c passen', () => {
    const [a, b, c] = sides(T);
    const ga = angles(T)[2];
    const f = cosineFigure(T);
    expect(f.corrA.area).toBeCloseTo(a * b * Math.cos(ga * DEG), 10);
    expect(f.corrB.area).toBeCloseTo(a * b * Math.cos(ga * DEG), 10);
    expect(polygonArea(f.corrA.pts)).toBeCloseTo(Math.abs(f.corrA.area), 10);
    expect(polygonArea(f.sq[0])).toBeCloseTo(a * a, 10);
    expect(polygonArea(f.sq[2])).toBeCloseTo(c * c, 10);
    expect(f.restA.area + f.corrA.area).toBeCloseTo(a * a, 10);
    expect(f.splitC).not.toBeNull();
    const [nearA, nearB] = f.splitC!;
    expect(nearA.area).toBeCloseTo(f.restB.area, 10);
    expect(nearB.area).toBeCloseTo(f.restA.area, 10);
    expect(nearA.area + nearB.area).toBeCloseTo(c * c, 10);
    // Quadrate liegen außen: Mittelpunkt des Quadrats über c auf der anderen Seite von AB als C
    const m = f.sq[2].reduce((s, p) => [s[0] + p[0] / 4, s[1] + p[1] / 4], [0, 0]);
    expect(m[1]).toBeLessThan(1);
  });
  it('Flächenbild bei stumpfem γ: Korrektur negativ, Rechtecke außerhalb, Summe stimmt', () => {
    const t: Tri = [
      [0.5, 1],
      [11.5, 1],
      [4, 3.5],
    ];
    const [a, b, c] = sides(t);
    const ga = angles(t)[2];
    expect(ga).toBeGreaterThan(90);
    const f = cosineFigure(t);
    expect(f.corrA.area).toBeLessThan(0);
    expect(c * c).toBeCloseTo(a * a + b * b - 2 * f.corrA.area, 9);
    expect(f.splitC![0].area + f.splitC![1].area).toBeCloseTo(c * c, 9);
  });
  it('placeB: |CB| = a und Winkel bei C = γ, Seite bleibt erhalten', () => {
    const C: Pt2 = [2, 1];
    const A: Pt2 = [5, 6];
    for (const orient of [1, -1]) {
      for (const g of [30, 60, 90, 120, 150]) {
        const B = placeB(C, A, 6, g, orient);
        const t: Tri = [A, B, C];
        expect(dist(C, B)).toBeCloseTo(6, 12);
        expect(angles(t)[2]).toBeCloseTo(g, 9);
        expect(Math.sign((A[0] - C[0]) * (B[1] - C[1]) - (A[1] - C[1]) * (B[0] - C[0]))).toBe(-orient);
      }
    }
  });
  it('Flache Dreiecke werden erkannt', () => {
    expect(
      isFlat([
        [0, 0],
        [6, 0],
        [3, 0.05],
      ]),
    ).toBe(true);
    expect(isFlat(T)).toBe(false);
  });
});

type Pt2 = [number, number];

describe('Modell: Plausibilität über viele Zufallsdreiecke', () => {
  it('Sinussatz (= 2r), Kosinussatz, Winkelsumme, Umkreis, Fläche', () => {
    const rnd = seededRandom(20261019);
    let n = 0;
    while (n < 300) {
      const t: Tri = [
        [rnd() * 12, rnd() * 8],
        [rnd() * 12, rnd() * 8],
        [rnd() * 12, rnd() * 8],
      ];
      if (minAngle(t) < 5) continue;
      n++;
      const [a, b, c] = sides(t);
      const w = angles(t);
      expect(w[0] + w[1] + w[2]).toBeCloseTo(180, 9);
      const q = sineQuotients(t);
      expect(q[1]).toBeCloseTo(q[0], 8);
      expect(q[2]).toBeCloseTo(q[0], 8);
      expect(q[0]).toBeCloseTo(2 * circumradius(t), 8);
      expect(lawOfCosines(a, b, w[2])).toBeCloseTo(c, 9);
      expect(lawOfCosines(b, c, w[0])).toBeCloseTo(a, 9);
      expect(areaSAS(a, b, w[2])).toBeCloseTo(polygonArea(t), 9);
      const U = circumcenter(t);
      t.forEach((P) => expect(dist(U, P)).toBeCloseTo(circumradius(t), 8));
      const f = cosineFigure(t);
      expect(a * a + b * b - f.corrA.area - f.corrB.area).toBeCloseTo(c * c, 8);
    }
  });
  it('Löser rekonstruiert zufällige Dreiecke in allen vier Fällen', () => {
    const rnd = seededRandom(7);
    let n = 0;
    while (n < 200) {
      const t = randomTriangle(rnd);
      if (minAngle(t) < 10) continue;
      n++;
      const [a, b, c] = sides(t);
      const [al, be, ga] = angles(t);
      const given: Given = { a, b, c, al, be, ga };
      for (const k of ['sss', 'sws', 'wsw'] as const) {
        const r = solve(k, given);
        expect(r.kind).toBe('ok');
        if (r.kind !== 'ok') continue;
        const s = r.tris[0]!;
        expect(s.a).toBeCloseTo(a, 8);
        expect(s.b).toBeCloseTo(b, 8);
        expect(s.c).toBeCloseTo(c, 8);
        expect(s.ga).toBeCloseTo(ga, 7);
      }
      // SSW: eine der Lösungen ist das Ausgangsdreieck
      const r = solve('ssw', given);
      expect(r.kind).toBe('ok');
      if (r.kind === 'ok') expect(r.tris.some((s) => Math.abs(s.b - b) < 1e-7 && Math.abs(s.ga - ga) < 1e-6)).toBe(true);
    }
  });
  it('Zufallsdreieck: im Bereich, nicht zu spitz', () => {
    const rnd = seededRandom(3);
    for (let i = 0; i < 50; i++) {
      const t = randomTriangle(rnd);
      for (const P of t) {
        expect(P[0]).toBeGreaterThanOrEqual(0);
        expect(P[0]).toBeLessThanOrEqual(12);
        expect(P[1]).toBeGreaterThanOrEqual(0);
        expect(P[1]).toBeLessThanOrEqual(8);
      }
      expect(minAngle(t)).toBeGreaterThanOrEqual(25);
    }
  });
});
