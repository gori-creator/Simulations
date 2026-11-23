import { describe, expect, it } from 'vitest';
import { checkFoci, directorCirclePoint, ellipseTangent, focalAngles, hyperbolaTangent, makeTask, parabolaTangent, rayLineParam, reflect, taskCurve, taskEquation, taskFoci, coneEccentricity, coneSection, coneSectionKind, dist, ellipse, ellipsePoint, focalCurve, focalFromCoef, focalRadius, hyperbola, hyperbolaPoint, kindOf, parabola, parabolaFromDirectrix, parabolaPoint, circularSpeed, escapeSpeed, orbitFromLaunch, simulateOrbit, sweptArea, keplerE, classifyGeneral, implicitSegments } from '../src/simulations/mathematik/kegelschnitte/model';

describe('Kegelschnitte: Lehrbuchwerte', () => {
  it('Ellipse a = 5, b = 3 → e = 4, Brennpunkte (±4 | 0), Abstandssumme 10', () => {
    const E = ellipse(5, 3);
    expect(E.e).toBe(4);
    expect(E.foci).toEqual([
      [-4, 0],
      [4, 0],
    ]);
    for (const t of [0, 0.7, 2, 3.5, 5.9]) {
      const P = ellipsePoint(E, t);
      expect(dist(P, E.foci[0]) + dist(P, E.foci[1])).toBeCloseTo(10, 12);
    }
    expect(E.eps).toBeCloseTo(0.8, 12);
  });
  it('Parabel y = x²/4 → Brennpunkt (0 | 1), Leitlinie y = −1', () => {
    const P = parabola(focalFromCoef(1 / 4));
    expect(P.focus).toEqual([0, 1]);
    expect(P.directrix).toBe(-1);
    for (const x of [-3, -1, 0, 2, 5]) {
      const Q = parabolaPoint(P, x);
      expect(Q[1]).toBeCloseTo((x * x) / 4, 12);
      expect(dist(Q, P.focus)).toBeCloseTo(Q[1] - P.directrix, 12);
    }
  });
  it('Hyperbel a = 3, b = 4 → e = 5, Abstandsdifferenz 6, Asymptoten ±4/3', () => {
    const H = hyperbola(3, 4);
    expect(H.e).toBe(5);
    expect(H.slope).toBeCloseTo(4 / 3, 12);
    for (const u of [-1.5, 0, 0.8, 2]) {
      for (const side of [1, -1] as const) {
        const P = hyperbolaPoint(H, u, side);
        expect(Math.abs(dist(P, H.foci[0]) - dist(P, H.foci[1]))).toBeCloseTo(6, 10);
        expect((P[0] * P[0]) / 9 - (P[1] * P[1]) / 16).toBeCloseTo(1, 10);
      }
    }
  });
});

describe('Kegelschnitte: Ortslinien und Exzentrizität', () => {
  it('Parabel-Konstruktion: P liegt auf der Mittelsenkrechten von F und Q', () => {
    const P = parabola(1.5);
    for (const qx of [-4, -1, 0.5, 3]) {
      const r = parabolaFromDirectrix(P, qx);
      expect(dist(r.point, P.focus)).toBeCloseTo(dist(r.point, r.Q), 12);
      expect(r.point[0]).toBe(qx);
    }
  });
  it('Brennpunkt-Leitlinien-Definition: Abstand zu F = ε · Abstand zur Leitlinie', () => {
    for (const eps of [0.5, 1, 1.8]) {
      for (const th of [0.3, 1.2, 2.5]) {
        const r = focalRadius(eps, 2, th);
        if (r === null) continue;
        const x = r * Math.cos(th);
        expect(r).toBeCloseTo(eps * (x + 2), 10);
      }
    }
    expect(focalRadius(1, 2, 0)).toBeNull();
    expect(focalCurve(1.5, 1).length).toBeGreaterThan(0);
  });
  it('Art aus ε', () => {
    expect(kindOf(0)).toBe('circle');
    expect(kindOf(0.6)).toBe('ellipse');
    expect(kindOf(1)).toBe('parabola');
    expect(kindOf(2)).toBe('hyperbola');
  });
  it('Ellipse aus Brennpunkt-Leitlinie stimmt mit a, b überein', () => {
    // a = 5, b = 3: ε = 0,8, Abstand F–Leitlinie = a/ε − e = 6,25 − 4 = 2,25
    const E = ellipse(5, 3);
    const d = E.directrix! - E.e;
    const rPeri = focalRadius(E.eps, d, Math.PI)!; // Richtung zum näheren Scheitel
    expect(rPeri).toBeCloseTo(E.a - E.e, 10);
  });
});

describe('Kegelschnitte: Doppelkegel', () => {
  it('Schnittart nach dem Neigungswinkel', () => {
    expect(coneSectionKind(30, 0)).toBe('circle');
    expect(coneSectionKind(30, 40)).toBe('ellipse');
    expect(coneSectionKind(30, 60)).toBe('parabola');
    expect(coneSectionKind(30, 75)).toBe('hyperbola');
    expect(coneEccentricity(30, 60)).toBeCloseTo(1, 12);
    expect(coneEccentricity(30, 0)).toBe(0);
  });
  it('Schnittpunkte liegen auf Kegel und Ebene', () => {
    const alpha = 30;
    const beta = 40;
    const h = 1;
    const ta = Math.tan((alpha * Math.PI) / 180);
    const m = Math.tan((beta * Math.PI) / 180);
    const parts = coneSection(alpha, beta, h, 10);
    expect(parts.length).toBeGreaterThan(0);
    for (const part of parts)
      for (const [x, y, z] of part) {
        expect(x * x + y * y).toBeCloseTo((z * ta) ** 2, 8);
        expect(z).toBeCloseTo(h + m * x, 8);
      }
    // Ellipse: nur ein geschlossenes Stück auf der oberen Hälfte
    expect(parts.every((p) => p.every((q) => q[2] > 0))).toBe(true);
    // Hyperbel: Stücke auf beiden Hälften
    const hyp = coneSection(30, 75, 1, 10);
    expect(hyp.some((p) => p[0]![2] > 0) && hyp.some((p) => p[0]![2] < 0)).toBe(true);
  });
});

describe('Kegelschnitte: Tangente und Spiegelung', () => {
  it('Ellipse: Strahl aus F₁ wird in P zu F₂ gespiegelt (a = 5, b = 3)', () => {
    const E = ellipse(5, 3);
    for (const t of [0.3, 1, 2.2, 4]) {
      const P = ellipsePoint(E, t);
      const T = ellipseTangent(E, t);
      const d: [number, number] = [P[0] - E.foci[0][0], P[1] - E.foci[0][1]];
      const r = reflect(d, T);
      // r zeigt von P genau auf F₂
      const toF2: [number, number] = [E.foci[1][0] - P[0], E.foci[1][1] - P[1]];
      const cross = r[0] * toF2[1] - r[1] * toF2[0];
      expect(Math.abs(cross) / (Math.hypot(...r) * Math.hypot(...toF2))).toBeLessThan(1e-9);
      expect(r[0] * toF2[0] + r[1] * toF2[1]).toBeGreaterThan(0);
      const [w1, w2] = focalAngles(P, E.foci[0], E.foci[1], T);
      expect(w1).toBeCloseTo(w2, 9);
    }
  });
  it('Parabel: senkrecht einfallende Strahlen gehen durch den Brennpunkt (Parabolspiegel)', () => {
    const Pb = parabola(1.5);
    for (const x of [-4, -1, 0.5, 3]) {
      const P = parabolaPoint(Pb, x);
      const r = reflect([0, -1], parabolaTangent(Pb, x));
      const s = rayLineParam(P, r, [0, 0], [1, 0.0]);
      // Strahl trifft die y-Achse genau bei y = f
      const k = -P[0] / r[0];
      expect(P[1] + k * r[1]).toBeCloseTo(1.5, 9);
      expect(s === null || s >= 0).toBe(true);
    }
  });
  it('Hyperbel: Tangente halbiert den Winkel F₁PF₂', () => {
    const H = hyperbola(3, 4);
    for (const u of [-1, 0.4, 1.3]) {
      const P = hyperbolaPoint(H, u, 1);
      const [w1, w2] = focalAngles(P, H.foci[0], H.foci[1], hyperbolaTangent(H, u, 1));
      expect(w1).toBeCloseTo(w2, 9);
    }
  });
  it('Hyperbel: Licht aus F₂ wird am rechten Ast so gespiegelt, als käme es aus F₁', () => {
    const H = hyperbola(3, 4);
    for (const u of [-1.1, -0.3, 0.6, 1.1]) {
      const P = hyperbolaPoint(H, u, 1);
      const r = reflect([P[0] - H.foci[1][0], P[1] - H.foci[1][1]], hyperbolaTangent(H, u, 1));
      const fromF1: [number, number] = [P[0] - H.foci[0][0], P[1] - H.foci[0][1]];
      const cross = r[0] * fromF1[1] - r[1] * fromF1[0];
      expect(Math.abs(cross) / (Math.hypot(...r) * Math.hypot(...fromF1))).toBeLessThan(1e-9);
      expect(r[0] * fromF1[0] + r[1] * fromF1[1]).toBeGreaterThan(0);
    }
  });
  it('Strahl-Geraden-Schnitt: von (0|0) nach rechts trifft x = 3 bei s = 3', () => {
    expect(rayLineParam([0, 0], [1, 0], [3, -1], [0, 1])).toBeCloseTo(3, 12);
    expect(rayLineParam([0, 0], [-1, 0], [3, -1], [0, 1])).toBeNull();
  });
});

describe('Kegelschnitte: Leitkreis', () => {
  it('Ellipse a = 5, e = 4: |PF₁| + |PF₂| = 10 und |PF₂| = |PQ|', () => {
    const F1: [number, number] = [-4, 0];
    const F2: [number, number] = [4, 0];
    for (const phi of [0, 0.8, 2, 3.1, 4.5]) {
      const c = directorCirclePoint(F1, F2, 10, phi)!;
      expect(dist(c.P, F2)).toBeCloseTo(dist(c.P, c.Q), 9);
      expect(dist(c.P, F1) + dist(c.P, F2)).toBeCloseTo(10, 9);
      const [x, y] = c.P;
      expect((x * x) / 25 + (y * y) / 9).toBeCloseTo(1, 9);
    }
  });
  it('Hyperbel a = 3, e = 5: ||PF₁| − |PF₂|| = 6, P auf x²/9 − y²/16 = 1', () => {
    const F1: [number, number] = [-5, 0];
    const F2: [number, number] = [5, 0];
    let n = 0;
    for (let phi = -3; phi <= 3; phi += 0.37) {
      const c = directorCirclePoint(F1, F2, 6, phi);
      if (!c) continue;
      n++;
      expect(Math.abs(dist(c.P, F1) - dist(c.P, F2))).toBeCloseTo(6, 8);
      expect((c.P[0] ** 2) / 9 - (c.P[1] ** 2) / 16).toBeCloseTo(1, 8);
    }
    expect(n).toBeGreaterThan(10);
  });
});

describe('Kegelschnitte: Übungsaufgaben', () => {
  const f = (v: number) => String(Math.round(v * 1000) / 1000).replace('.', ',');
  it('gleiche Nummer → gleiche Aufgabe, alle Arten kommen vor', () => {
    expect(makeTask(17)).toEqual(makeTask(17));
    const kinds = new Set(Array.from({ length: 40 }, (_, i) => makeTask(i + 1).kind));
    expect(kinds.size).toBe(3);
  });
  it('Brennpunkte liegen auf der Kurve passend (Ellipse: Summe 2a an allen Kurvenpunkten)', () => {
    for (let n = 1; n <= 60; n++) {
      const T = makeTask(n);
      const F = taskFoci(T);
      for (const part of taskCurve(T, 6)) {
        for (const P of part.filter((_, i) => i % 15 === 0)) {
          if (T.kind === 'ellipse') expect(dist(P, F[0]!) + dist(P, F[1]!)).toBeCloseTo(2 * T.a, 8);
          if (T.kind === 'hyperbola') expect(Math.abs(dist(P, F[0]!) - dist(P, F[1]!))).toBeCloseTo(2 * T.a, 8);
          if (T.kind === 'parabola') expect(dist(P, F[0]!)).toBeCloseTo(Math.abs(P[1] - (T.cy - T.f)), 8);
        }
      }
    }
  });
  it('Gleichungen mit Komma und Verschiebung', () => {
    expect(taskEquation({ kind: 'ellipse', cx: 1, cy: -2, a: 5, b: 4, f: 0, vertical: false }, f)).toBe('(x − 1)²/25 + (y + 2)²/16 = 1');
    expect(taskEquation({ kind: 'hyperbola', cx: 0, cy: 0, a: 1.5, b: 2, f: 0, vertical: true }, f)).toBe('y²/2,25 − x²/4 = 1');
    expect(taskEquation({ kind: 'parabola', cx: -2, cy: -1, a: 0, b: 0, f: 0.5, vertical: true }, f)).toBe('y = 0,5 · (x + 2)² − 1');
  });
  it('Prüfen: Reihenfolge egal, Toleranz 0,25', () => {
    const T = makeTask(5);
    const F = taskFoci(T);
    const g = F.map((q) => [q[0] + 0.1, q[1] - 0.1] as [number, number]).reverse();
    expect(checkFoci(T, g).ok).toBe(true);
    expect(checkFoci(T, F.map((q) => [q[0] + 1, q[1]] as [number, number])).ok).toBe(false);
  });
});

describe('Planetenbahnen', () => {
  it('Kreis-, Ellipsen-, Parabel- und Hyperbelstart', () => {
    const r = 4;
    const vk = circularSpeed(1, r);
    expect(orbitFromLaunch(r, vk, 1).kind).toBe('circle');
    expect(orbitFromLaunch(r, 1.2 * vk, 1).kind).toBe('ellipse');
    expect(orbitFromLaunch(r, escapeSpeed(1, r), 1, 1e-6).kind).toBe('parabola');
    expect(orbitFromLaunch(r, 1.6 * vk, 1).kind).toBe('hyperbola');
    expect(escapeSpeed(1, r) / vk).toBeCloseTo(Math.SQRT2, 12);
  });
  it('Perihel, Aphel und Umlaufzeit (3. Keplersches Gesetz)', () => {
    const o = orbitFromLaunch(4, 0.8 * 0.5, 1);
    // Start langsamer als Kreisbahn: Startpunkt ist das Aphel
    expect(o.rApo).toBeCloseTo(4, 9);
    expect(o.rPeri + o.rApo!).toBeCloseTo(2 * o.a, 9);
    expect(o.T).toBeCloseTo(2 * Math.PI * Math.sqrt(o.a ** 3), 9);
  });
  it('numerische Bahn kehrt nach einer Umlaufzeit zurück und hält den Flächensatz', () => {
    const o = orbitFromLaunch(4, 0.6, 1);
    const run = simulateOrbit(4, 0.6, 1, o.T!, o.T! / 20000);
    const last = run.pos.at(-1)!;
    expect(Math.hypot(last[0] - 4, last[1])).toBeLessThan(1e-3);
    const n = run.pos.length - 1;
    const q = Math.floor(n / 4);
    const a1 = sweptArea(run.pos, 0, q);
    const a2 = sweptArea(run.pos, q, 2 * q);
    expect(a1 / a2).toBeCloseTo(1, 3);
    expect(sweptArea(run.pos, 0, n)).toBeCloseTo(Math.PI * o.a * o.a * Math.sqrt(1 - o.e * o.e), 2);
  });
  it('Kepler-Gleichung', () => {
    for (const e of [0, 0.3, 0.9]) {
      const E = keplerE(1.2, e);
      expect(E - e * Math.sin(E)).toBeCloseTo(1.2, 12);
    }
  });
});

describe('allgemeine Kegelschnittgleichung', () => {
  const G = (A: number, B: number, C: number, D: number, E: number, F: number) => ({ A, B, C, D, E, F });
  it('erkennt die Arten', () => {
    expect(classifyGeneral(G(1, 0, 1, 0, 0, -4)).kind).toBe('circle');
    expect(classifyGeneral(G(1, 0, 4, 0, 0, -4)).kind).toBe('ellipse');
    expect(classifyGeneral(G(1, 0, 0, 0, -1, 0)).kind).toBe('parabola');
    expect(classifyGeneral(G(0, 1, 0, 0, 0, -1)).kind).toBe('hyperbola');
    expect(classifyGeneral(G(1, 0, -1, 0, 0, 0)).kind).toBe('lines');
    expect(classifyGeneral(G(1, 0, 1, 0, 0, 0)).kind).toBe('point');
    expect(classifyGeneral(G(1, 0, 1, 0, 0, 4)).kind).toBe('empty');
  });
  it('Drehwinkel und Mittelpunkt', () => {
    const h = classifyGeneral(G(0, 1, 0, 0, 0, -1));
    expect(h.angle).toBeCloseTo(Math.PI / 4, 12);
    // A = 1, B = 1, C = 2: Hauptachse bei −22,5°
    expect(classifyGeneral(G(1, 1, 2, 0, 0, -4)).angle).toBeCloseTo(-Math.PI / 8, 12);
    // (x − 2)² + (y + 1)² = 9  →  x² + y² − 4x + 2y − 4 = 0
    const c = classifyGeneral(G(1, 0, 1, -4, 2, -4));
    expect(c.center![0]).toBeCloseTo(2, 12);
    expect(c.center![1]).toBeCloseTo(-1, 12);
  });
  it('Marching Squares liefert Punkte auf der Kurve', () => {
    const segs = implicitSegments((x, y) => x * x + y * y - 4, [-3, 3], [-3, 3], 60, 60);
    expect(segs.length).toBeGreaterThan(50);
    for (const [a] of segs) expect(Math.abs(Math.hypot(a[0], a[1]) - 2)).toBeLessThan(0.02);
  });
});
