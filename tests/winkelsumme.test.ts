import { describe, expect, it } from 'vitest';
import {
  angleSum,
  classify,
  crossings,
  earClip,
  exteriorAngles,
  fanValid,
  fanVertex,
  formatPoints,
  interiorAngles,
  isRegular,
  isSimple,
  orientation,
  parsePoints,
  reflexVertices,
  regularExterior,
  regularInterior,
  regularOnGrid,
  regularPolygon,
  resample,
  roundToSum,
  sum,
  thirdAngle,
  triangleAngles,
  triangleCount,
  triangulate,
  type Pt,
} from '../src/simulations/mathematik/winkelsumme/model';

/** Reproduzierbarer Zufall (Park-Miller). */
function rng(seed: number): () => number {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** Zufälliges konvexes Vieleck: Punkte auf einem Kreis mit zufälligen, sortierten Winkeln. */
function randomConvex(r: () => number, n: number): Pt[] {
  const angs = Array.from({ length: n }, () => r() * 2 * Math.PI).sort((a, b) => a - b);
  const R = 1 + r() * 5;
  return angs.map((a) => [8 + R * Math.cos(a), 5 + R * Math.sin(a)] as Pt);
}

describe('Modell: Innenwinkelsumme – Dreieck', () => {
  it('berechnet die Winkel aus Koordinaten: A(0|0), B(4|0), C(0|3)', () => {
    const [a, b, c] = triangleAngles([0, 0], [4, 0], [0, 3])!;
    expect(a).toBeCloseTo(90, 10);
    expect(b).toBeCloseTo(36.87, 2);
    expect(c).toBeCloseTo(53.13, 2);
    expect(a + b + c).toBeCloseTo(180, 10);
  });

  it('gleichseitiges Dreieck: je 60°', () => {
    const angles = triangleAngles([0, 0], [2, 0], [1, Math.sqrt(3)])!;
    for (const v of angles) expect(v).toBeCloseTo(60, 10);
  });

  it('dritter Winkel: α = 50°, β = 70° → γ = 60°', () => {
    expect(thirdAngle(50, 70)).toBe(60);
    expect(thirdAngle(90, 45)).toBe(45);
  });

  it('Winkelsumme 180° für viele Zufallsdreiecke (beide Umlaufrichtungen)', () => {
    const r = rng(7);
    let checked = 0;
    for (let k = 0; k < 2000; k++) {
      const A: Pt = [r() * 16, r() * 10];
      const B: Pt = [r() * 16, r() * 10];
      const C: Pt = [r() * 16, r() * 10];
      const t = triangleAngles(A, B, C);
      if (!t) continue;
      checked++;
      expect(sum(t)).toBeCloseTo(180, 8);
      for (const v of t) expect(v).toBeGreaterThan(0);
      // gleiche Winkel bei umgekehrtem Umlaufsinn
      const t2 = triangleAngles(A, C, B)!;
      expect(t2[0]).toBeCloseTo(t[0], 8);
      expect(t2[1]).toBeCloseTo(t[2], 8);
    }
    expect(checked).toBeGreaterThan(1900);
  });

  it('Grenzfälle: Punkte auf einer Geraden bzw. aufeinander → kein Dreieck', () => {
    expect(triangleAngles([0, 0], [2, 1], [4, 2])).toBeNull();
    expect(triangleAngles([1, 1], [1, 1], [3, 2])).toBeNull();
  });

  it('sehr spitzes und sehr stumpfes Dreieck', () => {
    const spitz = triangleAngles([0, 0], [16, 0], [16, 0.5])!;
    expect(spitz[0]).toBeCloseTo((Math.atan(0.5 / 16) * 180) / Math.PI, 10);
    expect(spitz[1]).toBeCloseTo(90, 10);
    const stumpf = triangleAngles([0, 0], [16, 0], [8, 0.5])!;
    expect(stumpf[2]).toBeGreaterThan(170);
    expect(sum(stumpf)).toBeCloseTo(180, 10);
  });

  it('Außenwinkel am Dreieck = Summe der beiden nicht anliegenden Innenwinkel', () => {
    const r = rng(3);
    for (let k = 0; k < 200; k++) {
      const P: Pt[] = [
        [r() * 16, r() * 10],
        [r() * 16, r() * 10],
        [r() * 16, r() * 10],
      ];
      const inn = interiorAngles(P);
      if (!inn) continue;
      const ext = exteriorAngles(P)!;
      expect(ext[0]).toBeCloseTo(inn[1]! + inn[2]!, 8);
      expect(ext[1]).toBeCloseTo(inn[0]! + inn[2]!, 8);
      expect(ext[2]).toBeCloseTo(inn[0]! + inn[1]!, 8);
      expect(sum(ext)).toBeCloseTo(360, 8);
    }
  });
});

describe('Modell: Innenwinkelsumme – Vieleck', () => {
  it('Winkelsumme (n − 2) · 180°: 4 → 360°, 5 → 540°, 6 → 720°, 10 → 1440°', () => {
    expect(angleSum(3)).toBe(180);
    expect(angleSum(4)).toBe(360);
    expect(angleSum(5)).toBe(540);
    expect(angleSum(6)).toBe(720);
    expect(angleSum(10)).toBe(1440);
    for (let n = 3; n <= 10; n++) expect(triangleCount(n)).toBe(n - 2);
  });

  it('regelmäßiges n-Eck: 5 → 108°, 6 → 120°, 8 → 135°; Außenwinkel 360° : n', () => {
    expect(regularInterior(5)).toBe(108);
    expect(regularInterior(6)).toBe(120);
    expect(regularInterior(8)).toBe(135);
    expect(regularInterior(3)).toBe(60);
    expect(regularExterior(5)).toBe(72);
    expect(regularExterior(8)).toBe(45);
    for (let n = 3; n <= 10; n++) {
      const P = regularPolygon(n, 8, 5, 4);
      const a = interiorAngles(P)!;
      for (const v of a) expect(v).toBeCloseTo(regularInterior(n), 9);
      for (const e of exteriorAngles(P)!) expect(e).toBeCloseTo(regularExterior(n), 9);
      expect(isRegular(P)).toBe(true);
      // auf 4 Stellen gerundet auf dem Karopapier: Winkel bis auf 0,01° genau
      const G = regularOnGrid(n);
      for (const v of interiorAngles(G)!) expect(Math.abs(v - regularInterior(n))).toBeLessThan(0.01);
      for (const p of G) {
        expect(p[0]).toBeGreaterThanOrEqual(0);
        expect(p[0]).toBeLessThanOrEqual(16);
        expect(p[1]).toBeGreaterThanOrEqual(0);
        expect(p[1]).toBeLessThanOrEqual(12);
      }
    }
  });

  it('Innenwinkelsumme und Außenwinkelsumme für Zufallsvielecke (konvex)', () => {
    const r = rng(11);
    for (let k = 0; k < 500; k++) {
      const n = 3 + Math.floor(r() * 8);
      const P = randomConvex(r, n);
      if (!isSimple(P)) continue;
      expect(classify(P)).toBe('convex');
      expect(sum(interiorAngles(P)!)).toBeCloseTo(angleSum(n), 7);
      expect(sum(exteriorAngles(P)!)).toBeCloseTo(360, 7);
      // auch im Uhrzeigersinn
      const Q = [...P].reverse();
      expect(orientation(Q)).toBe(-1);
      expect(sum(interiorAngles(Q)!)).toBeCloseTo(angleSum(n), 7);
      expect(sum(exteriorAngles(Q)!)).toBeCloseTo(360, 7);
      // Zerlegung von der ersten Ecke aus geht bei konvexen Vielecken immer
      expect(fanValid(P, 0)).toBe(true);
      expect(triangulate(P)!.tris).toHaveLength(n - 2);
    }
  });

  it('nicht konvexes Viereck (einspringende Ecke): Summe trotzdem 360°', () => {
    // „Pfeilspitze“: Ecke D zeigt nach innen
    const P: Pt[] = [
      [2, 1],
      [14, 1],
      [8, 9],
      [8, 4],
    ];
    expect(classify(P)).toBe('concave');
    const a = interiorAngles(P)!;
    expect(a[3]).toBeGreaterThan(180);
    expect(reflexVertices(P)).toEqual([3]);
    expect(sum(a)).toBeCloseTo(360, 9);
    const ext = exteriorAngles(P)!;
    expect(ext[3]).toBeLessThan(0);
    expect(ext[3]).toBeCloseTo(180 - a[3]!, 9);
    expect(sum(ext)).toBeCloseTo(360, 9);
    // Fächer von A aus geht nicht (Diagonale AC läge außen), von D aus schon
    expect(fanValid(P, 0)).toBe(false);
    expect(fanVertex(P)).toBe(1);
    expect(fanValid(P, 3)).toBe(true);
  });

  it('nicht konvexes Zehneck: Summe 1440°, Zerlegung in 8 Dreiecke', () => {
    // Stern mit 5 Zacken
    const P: Pt[] = Array.from({ length: 10 }, (_, i) => {
      const a = (Math.PI / 2) + (i * Math.PI) / 5;
      const R = i % 2 ? 2 : 4.6;
      return [8 + R * Math.cos(a), 5 + R * Math.sin(a)] as Pt;
    });
    expect(classify(P)).toBe('concave');
    expect(sum(interiorAngles(P)!)).toBeCloseTo(1440, 8);
    expect(reflexVertices(P)).toHaveLength(5);
    const t = triangulate(P)!;
    expect(t.tris).toHaveLength(8);
    // Die Dreiecke füllen das Vieleck genau aus (Flächen addieren sich)
    const area = (q: readonly Pt[]) => {
      let s = 0;
      for (let i = 0; i < q.length; i++) s += q[i]![0] * q[(i + 1) % q.length]![1] - q[i]![1] * q[(i + 1) % q.length]![0];
      return Math.abs(s) / 2;
    };
    const triArea = sum(t.tris.map(([a, b, c]) => area([P[a]!, P[b]!, P[c]!])));
    expect(triArea).toBeCloseTo(area(P), 9);
  });

  it('Ohrenschneiden für ein Vieleck ohne Fächer-Ecke', () => {
    // Kamm: von keiner Ecke aus sind alle anderen sichtbar
    const P: Pt[] = [
      [0, 0],
      [16, 0],
      [16, 10],
      [13, 10],
      [13, 2],
      [11, 2],
      [11, 10],
      [5, 10],
      [5, 2],
      [3, 2],
    ].map((p) => p as unknown as Pt);
    expect(classify(P)).toBe('concave');
    expect(fanVertex(P)).toBeNull();
    const t = triangulate(P)!;
    expect(t.fan).toBeNull();
    expect(t.tris).toHaveLength(8);
    expect(earClip(P)).toHaveLength(8);
    expect(sum(interiorAngles(P)!)).toBeCloseTo(1440, 9);
  });

  it('überschlagenes Vieleck wird erkannt (keine Innenwinkel)', () => {
    const bow: Pt[] = [
      [2, 2],
      [12, 8],
      [12, 2],
      [2, 8],
    ];
    expect(classify(bow)).toBe('crossed');
    expect(isSimple(bow)).toBe(false);
    expect(interiorAngles(bow)).toBeNull();
    expect(triangulate(bow)).toBeNull();
    const x = crossings(bow);
    expect(x).toHaveLength(1);
    expect(x[0]![0]).toBeCloseTo(7, 9);
    expect(x[0]![1]).toBeCloseTo(5, 9);
  });

  it('entartete Vielecke', () => {
    expect(classify([
      [1, 1],
      [1, 1],
      [4, 3],
    ])).toBe('degenerate');
    expect(classify([
      [0, 0],
      [2, 1],
      [4, 2],
    ])).toBe('degenerate');
  });
});

describe('Modell: Innenwinkelsumme – Hilfsfunktionen', () => {
  it('rundet so, dass die Summe stimmt', () => {
    const v = [36.87, 53.13, 90];
    expect(sum(roundToSum(v, 0))).toBe(180);
    const w = [60.04, 60.04, 59.92];
    const r = roundToSum(w, 1, 180);
    expect(sum(r)).toBeCloseTo(180, 9);
    for (let i = 0; i < 3; i++) expect(Math.abs(r[i]! - w[i]!)).toBeLessThan(0.1 + 1e-9);
    // drei gleiche Drittel
    expect(sum(roundToSum([60.0333, 60.0333, 59.9334], 1, 180))).toBeCloseTo(180, 9);
  });

  it('Prüfwerte: Startdreieck A(2|1,5), B(13,5|2,5), C(8|10,5) → 51,3° + 60,5° + 68,2° = 180°', () => {
    const a = triangleAngles([2, 1.5], [13.5, 2.5], [8, 10.5])!;
    // α = arctan(9/6) − arctan(1/11,5) ≈ 56,31° − 4,97° = 51,34°
    expect(a[0]).toBeCloseTo(51.34, 2);
    expect(a[1]).toBeCloseTo(60.46, 2);
    expect(roundToSum(a, 1, 180)).toEqual([51.3, 60.5, 68.2]);
  });

  it('summentreue Rundung, wo einfaches Runden 180,1° ergäbe: C(0|5)', () => {
    const a = triangleAngles([2, 1.5], [13.5, 2.5], [0, 5])!;
    const naive = a.map((v) => Math.round(v * 10) / 10);
    expect(sum(naive)).toBeCloseTo(180.1, 9);
    const r = roundToSum(a, 1, 180);
    expect(sum(r)).toBeCloseTo(180, 9);
    expect(r).toEqual([114.8, 15.4, 49.8]);
    // ganzzahlig: 59,6° + 60,2° + 60,2° → 60° + 60° + 60°
    expect(roundToSum([59.6, 60.2, 60.2], 0, 180)).toEqual([60, 60, 60]);
    // Außenwinkel eines nicht konvexen Vierecks (einer negativ) summieren sich zu 360,0°
    const e = exteriorAngles([
      [2, 1],
      [14, 1],
      [8, 9],
      [8, 4.5],
    ])!;
    expect(sum(roundToSum(e, 1, 360))).toBeCloseTo(360, 9);
  });

  it('nicht konvexes Sechseck aus dem Beispiel: Summe 720°, Innenwinkel bei D über 180°', () => {
    const P = parsePoints('2,1;14,1;14,11;8,6.5;2,11;4,6')!;
    const a = interiorAngles(P)!;
    expect(classify(P)).toBe('concave');
    expect(sum(a)).toBeCloseTo(720, 9);
    expect(reflexVertices(P)).toEqual([3, 5]);
    // D(8|6,5): Seiten nach C (+6|+4,5) und E (−6|+4,5); außen liegen 2 · arctan(6 : 4,5) ≈ 106,26°, innen 360° − 106,26° ≈ 253,74°
    expect(a[3]).toBeCloseTo(360 - 2 * ((Math.atan(6 / 4.5) * 180) / Math.PI), 9);
    expect(triangulate(P)!.tris).toHaveLength(4);
  });

  it('liest und schreibt Eckenlisten', () => {
    const P = parsePoints('3,2;11,1.5;13.5,6.5')!;
    expect(P).toEqual([
      [3, 2],
      [11, 1.5],
      [13.5, 6.5],
    ]);
    expect(formatPoints(P)).toBe('3,2;11,1.5;13.5,6.5');
    expect(parsePoints('1,1;2,2')).toBeNull();
    expect(parsePoints('1,1;2,2;20,3')).toBeNull();
    expect(parsePoints('1,1;2,2;3,13')).toBeNull();
    expect(parsePoints('a,b;1,1;2,2')).toBeNull();
    expect(parsePoints(formatPoints(regularOnGrid(10)))).toHaveLength(10);
  });

  it('verteilt Punkte gleichmäßig auf dem Rand', () => {
    const sq: Pt[] = [
      [0, 0],
      [4, 0],
      [4, 4],
      [0, 4],
    ];
    const r = resample(sq, 8);
    expect(r).toHaveLength(8);
    expect(r[1]).toEqual([2, 0]);
    expect(r[4]).toEqual([4, 4]);
  });
});
