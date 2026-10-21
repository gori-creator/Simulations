import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import {
  area,
  armDistance,
  circleIntersections,
  dist,
  FAMILY,
  givenParts,
  isSsW,
  lineCircleRoots,
  pieces,
  rayCircleParams,
  sideFromSWS,
  sidesFromWSW,
  solve,
  solveSSS,
  solveSSW,
  solveSWS,
  solveWSW,
  solveWWW,
  sssExcess,
  sssGap,
  sswAnalysis,
  stepPlan,
  thirdAngle,
  triangleInequality,
  type Case,
} from '../src/simulations/mathematik/dreieckskonstruktion/model';

const one = (s: ReturnType<typeof solve>) => {
  if (s.kind !== 'one' && s.kind !== 'many') throw new Error(`erwartet genau eine Lösung, nicht ${s.kind}`);
  return s.c;
};

describe('Modell: Dreieckskonstruktion – SSS', () => {
  it('Prüfwert 3-4-5: γ = 90°, α ≈ 36,87°, β ≈ 53,13°, C = (3,2 | 2,4)', () => {
    const C = one(solveSSS(3, 4, 5));
    expect(C[0]).toBeCloseTo(3.2, 12);
    expect(C[1]).toBeCloseTo(2.4, 12);
    const q = pieces(5, C);
    expect(q.a).toBeCloseTo(3, 10);
    expect(q.b).toBeCloseTo(4, 10);
    expect(q.ga).toBeCloseTo(90, 9);
    expect(q.al).toBeCloseTo(36.87, 2);
    expect(q.be).toBeCloseTo(53.13, 2);
    expect(q.al + q.be + q.ga).toBeCloseTo(180, 9);
    expect(area(5, C)).toBeCloseTo(6, 10);
  });

  it('gleichseitiges Dreieck: alle Winkel 60°', () => {
    const q = pieces(6, one(solveSSS(6, 6, 6)));
    expect(q.al).toBeCloseTo(60, 9);
    expect(q.be).toBeCloseTo(60, 9);
    expect(q.ga).toBeCloseTo(60, 9);
  });

  it('Prüfwert 2, 3, 6: keine Lösung (2 + 3 < 6), Lücke 1 cm zwischen den Kreisen', () => {
    expect(triangleInequality(2, 3, 6)).toBe(false);
    expect(solveSSS(2, 3, 6)).toEqual({ kind: 'none', reason: 'triangle' });
    expect(sssExcess(2, 3, 6)).toBeCloseTo(1, 12);
    // Kreis um A (r = b = 3) endet bei x = 3, Kreis um B (r = a = 2) beginnt bei x = 4
    expect(sssGap(2, 3, 6)).toEqual([3, 4]);
  });

  it('Grenzfall a + b = c: Kreise berühren sich auf [AB] – kein echtes Dreieck', () => {
    expect(triangleInequality(3, 4, 7)).toBe(false);
    expect(solveSSS(3, 4, 7)).toEqual({ kind: 'none', reason: 'flat' });
    // auch mit Rundungsfehlern der Regler (0,1 + 0,2 ≠ 0,3 im Rechner)
    expect(solveSSS(3.1, 2.9, 6).kind).toBe('none');
    expect(triangleInequality(3, 4, 6.9)).toBe(true);
  });

  it('andere Seite zu lang: Lücke auf der richtigen Seite', () => {
    // b = 9 > a + c = 8: Kreis um A umschließt den Kreis um B
    expect(solveSSS(2, 9, 6).kind).toBe('none');
    expect(sssGap(2, 9, 6)).toEqual([8, 9]);
    // a = 9 > b + c = 8: Kreis um B umschließt den Kreis um A (links von A)
    const g = sssGap(9, 2, 6)!;
    expect(g[0]).toBeCloseTo(-3, 12);
    expect(g[1]).toBeCloseTo(-2, 12);
    expect(sssGap(5, 4.5, 6)).toBeNull();
  });
});

describe('Modell: Dreieckskonstruktion – SWS und WSW', () => {
  it('Prüfwert SWS b = 4,5, c = 6, α = 50° → a = √(56,25 − 54·cos 50°) ≈ 4,641', () => {
    const C = one(solveSWS(4.5, 50));
    const q = pieces(6, C);
    expect(q.b).toBeCloseTo(4.5, 12);
    expect(q.al).toBeCloseTo(50, 9);
    expect(q.a).toBeCloseTo(Math.sqrt(56.25 - 54 * Math.cos((50 * Math.PI) / 180)), 12);
    expect(q.a).toBeCloseTo(4.641, 3);
    expect(sideFromSWS(4.5, 6, 50)).toBeCloseTo(q.a, 12);
  });

  it('SWS gleichseitig: b = c = 4, α = 60° → a = 4', () => {
    const C = one(solveSWS(4, 60));
    expect(C[0]).toBeCloseTo(2, 12);
    expect(C[1]).toBeCloseTo(2 * Math.sqrt(3), 12);
    expect(pieces(4, C).a).toBeCloseTo(4, 10);
  });

  it('Prüfwert WSW c = 6, α = 50°, β = 60° → γ = 70°, a ≈ 4,891, b ≈ 5,530', () => {
    const q = pieces(6, one(solveWSW(6, 50, 60)));
    expect(q.al).toBeCloseTo(50, 9);
    expect(q.be).toBeCloseTo(60, 9);
    expect(q.ga).toBeCloseTo(70, 9);
    expect(q.a).toBeCloseTo(4.891, 3);
    expect(q.b).toBeCloseTo(5.53, 3);
    const s = sidesFromWSW(6, 50, 60)!;
    expect(s.a).toBeCloseTo(q.a, 12);
    expect(s.b).toBeCloseTo(q.b, 12);
    expect(s.ga).toBe(70);
  });

  it('Prüfwert WSW α = 100°, β = 80°: keine Lösung (Schenkel parallel); α + β > 180° läuft auseinander', () => {
    expect(thirdAngle(100, 80)).toBe(0);
    expect(solveWSW(6, 100, 80)).toEqual({ kind: 'none', reason: 'parallel' });
    expect(solveWSW(6, 120, 70)).toEqual({ kind: 'none', reason: 'angles' });
    expect(sidesFromWSW(6, 120, 70)).toBeNull();
  });
});

describe('Modell: Dreieckskonstruktion – SSW und SsW', () => {
  it('Prüfwert c = 6, α = 30°, a = 4: zwei Lösungen, b ≈ 7,842 oder b ≈ 2,550', () => {
    const s = solveSSW(6, 4, 30);
    expect(s.kind).toBe('two');
    if (s.kind !== 'two') return;
    const p1 = pieces(6, s.c);
    const p2 = pieces(6, s.c2);
    expect(p1.b).toBeCloseTo(3 * Math.sqrt(3) + Math.sqrt(7), 12);
    expect(p1.b).toBeCloseTo(7.842, 3);
    expect(p2.b).toBeCloseTo(2.55, 3);
    expect(p1.a).toBeCloseTo(4, 10);
    expect(p2.a).toBeCloseTo(4, 10);
    expect(p1.al).toBeCloseTo(30, 9);
    expect(p2.al).toBeCloseTo(30, 9);
    // Die Winkel bei C ergänzen sich zu 180° (gleichschenkliges Dreieck B C₁ C₂)
    expect(p1.ga + p2.ga).toBeCloseTo(180, 9);
    expect(sswAnalysis(6, 4, 30).kind).toBe('two');
  });

  it('Prüfwert c = 6, α = 30°, a = 3: genau eine Lösung, rechter Winkel bei C, b ≈ 5,196', () => {
    expect(armDistance(6, 30)).toBeCloseTo(3, 12);
    const s = solveSSW(6, 3, 30);
    const q = pieces(6, one(s));
    expect(q.b).toBeCloseTo(6 * Math.cos(Math.PI / 6), 6);
    expect(q.b).toBeCloseTo(5.196, 3);
    expect(q.ga).toBeCloseTo(90, 4);
    const an = sswAnalysis(6, 3, 30);
    expect(an.kind).toBe('touch');
    expect(an.h).toBeCloseTo(3, 12);
    expect(dist(an.foot, one(s))).toBeLessThan(1e-6);
  });

  it('Prüfwert c = 6, α = 30°, a = 2: keine Lösung (a < h = 3)', () => {
    expect(solveSSW(6, 2, 30)).toEqual({ kind: 'none', reason: 'short' });
    expect(rayCircleParams(6, 2, 30)).toHaveLength(0);
    expect(sswAnalysis(6, 2, 30).kind).toBe('none');
  });

  it('SsW (a ≥ c): genau eine Lösung, der zweite Schnittpunkt liegt hinter A', () => {
    expect(isSsW(6, 5)).toBe(true);
    const s = solveSSW(5, 6, 50);
    const q = pieces(5, one(s));
    expect(q.a).toBeCloseTo(6, 9);
    expect(q.al).toBeCloseTo(50, 9);
    const an = sswAnalysis(5, 6, 50);
    expect(an.kind).toBe('SsW');
    expect(an.behind).not.toBeNull();
    // hinter A: auf der Verlängerung, also x und y negativ
    expect(an.behind![1]).toBeLessThan(0);
    expect(dist(an.behind!, [5, 0])).toBeCloseTo(6, 9);
    // eine positive und eine negative Wurzel
    const r = lineCircleRoots(5, 6, 50);
    expect(r[0]!).toBeGreaterThan(0);
    expect(r[1]!).toBeLessThan(0);
  });

  it('SSW a = c: gleichschenklig (α < 90°) bzw. kein Dreieck (α ≥ 90°)', () => {
    const q = pieces(6, one(solveSSW(6, 6, 40)));
    expect(q.al).toBeCloseTo(40, 9);
    expect(q.ga).toBeCloseTo(40, 9);
    expect(solveSSW(6, 6, 100)).toEqual({ kind: 'none', reason: 'touchA' });
  });

  it('stumpfer Winkel gegenüber der kleineren Seite: keine Lösung', () => {
    expect(solveSSW(7, 4, 120).kind).toBe('none');
    expect(armDistance(7, 120)).toBe(7);
    // gegenüber der größeren Seite dagegen genau eine
    expect(solveSSW(4, 7, 120).kind).toBe('one');
  });

  it('Lehrbuchbeispiel c = 7, α = 35°, a = 4,5: b₁ ≈ 7,77 cm, b₂ ≈ 3,70 cm', () => {
    const s = solveSSW(7, 4.5, 35);
    if (s.kind !== 'two') throw new Error('erwartet zwei Lösungen');
    expect(pieces(7, s.c).b).toBeCloseTo(7.766, 2);
    expect(pieces(7, s.c2).b).toBeCloseTo(3.702, 2);
  });
});

describe('Modell: Dreieckskonstruktion – WWW und Ablauf', () => {
  it('WWW: ähnliche Dreiecke mit gleichen Winkeln, Seiten im Verhältnis k', () => {
    const s = solveWWW(4, 50, 60);
    expect(s.kind).toBe('many');
    const C = one(s);
    const q0 = pieces(4, C);
    for (const k of FAMILY) {
      const qk = pieces(4 * k, [C[0] * k, C[1] * k]);
      expect(qk.al).toBeCloseTo(q0.al, 9);
      expect(qk.be).toBeCloseTo(q0.be, 9);
      expect(qk.ga).toBeCloseTo(70, 9);
      expect(qk.a / q0.a).toBeCloseTo(k, 9);
    }
    expect(solve('www', { a: 1, b: 1, c: 4, al: 100, be: 90 }).kind).toBe('none');
  });

  it('gegebene Stücke je Fall', () => {
    expect(givenParts('sss')).toMatchObject({ a: true, b: true, c: true, al: false, be: false });
    expect(givenParts('sws')).toMatchObject({ a: false, b: true, c: true, al: true, be: false });
    expect(givenParts('wsw')).toMatchObject({ a: false, b: false, c: true, al: true, be: true });
    expect(givenParts('ssw')).toMatchObject({ a: true, b: false, c: true, al: true, be: false });
    expect(givenParts('www')).toMatchObject({ c: false, al: true, be: true, ga: true });
  });

  it('Konstruktionsablauf: Länge und letzter Schritt passen zur Lösung', () => {
    const g = { a: 5, b: 4.5, c: 6, al: 50, be: 60 };
    expect(stepPlan('sss', solve('sss', g))).toEqual(['base', 'circA', 'circB', 'cut', 'join', 'measure']);
    expect(stepPlan('sss', solveSSS(2, 3, 6))).toEqual(['base', 'circA', 'circB', 'cutNo', 'end']);
    expect(stepPlan('ssw', solveSSW(6, 4, 30))).toContain('cut2');
    expect(stepPlan('ssw', solveSSW(6, 3, 30))).toContain('cut1');
    expect(stepPlan('ssw', solveSSW(6, 2, 30)).at(-1)).toBe('end');
    expect(stepPlan('wsw', solveWSW(6, 100, 80)).at(-1)).toBe('end');
    expect(stepPlan('www', solve('www', g))).toContain('fam2');
    for (const cs of ['sss', 'sws', 'wsw', 'ssw', 'www'] as Case[]) expect(stepPlan(cs, solve(cs, g))[0]).toBe('base');
  });

  it('Kreisschnitt: zwei Punkte, oberer zuerst; keine bei zu großem Abstand', () => {
    const s = circleIntersections([0, 0], 5, [6, 0], 5);
    expect(s).toHaveLength(2);
    expect(s[0]![1]).toBeCloseTo(4, 10);
    expect(circleIntersections([0, 0], 1, [6, 0], 1)).toHaveLength(0);
    expect(circleIntersections([0, 0], 3, [6, 0], 3)).toHaveLength(1);
  });
});

describe('Modell: Dreieckskonstruktion – Plausibilität über Zufallswerte', () => {
  const rnd = seededRandom(20261019);
  const r1 = (lo: number, hi: number) => Math.round((lo + rnd() * (hi - lo)) * 10) / 10;
  const r0 = (lo: number, hi: number) => Math.round(lo + rnd() * (hi - lo));

  it('jede gefundene Lösung hat genau die gegebenen Stücke und Winkelsumme 180°', () => {
    let checked = 0;
    for (let i = 0; i < 2000; i++) {
      const g = { a: r1(1, 12), b: r1(1, 12), c: r1(2, 10), al: r0(10, 170), be: r0(10, 170) };
      for (const cs of ['sss', 'sws', 'wsw', 'ssw'] as Case[]) {
        const s = solve(cs, g);
        const sols = s.kind === 'two' ? [s.c, s.c2] : s.kind === 'one' ? [s.c] : [];
        for (const C of sols) {
          checked++;
          expect(C[1]).toBeGreaterThan(0);
          const q = pieces(g.c, C);
          expect(q.al + q.be + q.ga).toBeCloseTo(180, 6);
          const gp = givenParts(cs);
          if (gp.a) expect(q.a).toBeCloseTo(g.a, 6);
          if (gp.b) expect(q.b).toBeCloseTo(g.b, 6);
          if (gp.al) expect(q.al).toBeCloseTo(g.al, 6);
          if (gp.be) expect(q.be).toBeCloseTo(g.be, 6);
        }
        // konstruierbar genau dann, wenn die Bedingung des Kongruenzsatzes erfüllt ist
        if (cs === 'sss') expect(s.kind === 'one').toBe(sssExcess(g.a, g.b, g.c) < -1e-9);
        if (cs === 'wsw') expect(s.kind === 'one').toBe(g.al + g.be < 180);
        if (cs === 'ssw') {
          // SsW: a > c → immer genau eine Lösung
          if (g.a > g.c) expect(s.kind).toBe('one');
          // a < h → keine Lösung, h < a < c (spitzes α) → zwei
          const h = armDistance(g.c, g.al);
          if (g.a < h - 1e-9) expect(s.kind).toBe('none');
          if (g.al < 90 && g.a > h + 1e-9 && g.a < g.c - 1e-9) expect(s.kind).toBe('two');
        }
      }
    }
    expect(checked).toBeGreaterThan(3000);
  });

  it('Kosinussatz-Kontrolle stimmt mit der Konstruktion überein (SWS)', () => {
    for (let i = 0; i < 300; i++) {
      const b = r1(1, 12);
      const c = r1(2, 10);
      const al = r0(10, 170);
      expect(pieces(c, one(solveSWS(b, al))).a).toBeCloseTo(sideFromSWS(b, c, al), 9);
    }
  });
});

describe('Modell: Dreieckskonstruktion – Prüfrunde Paket 2 (Reglergrenzen, Lernmaterial)', () => {
  it('SWS am Reglerrand α = 170°: a = √(56,25 − 54·cos 170°) ≈ 10,461, β ≈ 4,3°, γ ≈ 5,7°', () => {
    const q = pieces(6, one(solveSWS(4.5, 170)));
    expect(q.a).toBeCloseTo(Math.sqrt(56.25 - 54 * Math.cos((170 * Math.PI) / 180)), 9);
    expect(q.a).toBeCloseTo(10.461, 3);
    expect(q.be).toBeCloseTo(4.284, 2);
    expect(q.ga).toBeCloseTo(5.716, 2);
  });

  it('SsW-Link c = 6, α = 30°, a = 7: b = 6·cos 30° + √(49 − 9) ≈ 11,521, γ = arcsin(3/7) ≈ 25,38°', () => {
    const s = solveSSW(6, 7, 30);
    expect(s.kind).toBe('one');
    const q = pieces(6, one(s));
    expect(q.b).toBeCloseTo(6 * Math.cos(Math.PI / 6) + Math.sqrt(40), 9);
    expect(q.b).toBeCloseTo(11.521, 3);
    expect(q.ga).toBeCloseTo((Math.asin(3 / 7) * 180) / Math.PI, 6);
    expect(isSsW(7, 6)).toBe(true);
  });

  it('Aufgabe 4: γ₁ + γ₂ = 180°, sin γ = c·sin α : a = 0,75', () => {
    const s = solveSSW(6, 4, 30);
    if (s.kind !== 'two') throw new Error('zwei Lösungen erwartet');
    const g1 = pieces(6, s.c).ga;
    const g2 = pieces(6, s.c2).ga;
    expect(g1).toBeCloseTo((Math.asin(0.75) * 180) / Math.PI, 6);
    expect(g1 + g2).toBeCloseTo(180, 6);
    expect(g1).toBeCloseTo(48.59, 2);
  });

  it('Reglergrenzen: c = 2 mit a = b = 1 ist flach, c = 10 mit a = b = 12 gleichschenklig (α = β ≈ 65,38°)', () => {
    expect(solveSSS(1, 1, 2)).toEqual({ kind: 'none', reason: 'flat' });
    const q = pieces(10, one(solveSSS(12, 12, 10)));
    expect(q.al).toBeCloseTo(q.be, 9);
    expect(q.al).toBeCloseTo((Math.acos(5 / 12) * 180) / Math.PI, 9);
  });

  it('WSW am Reglerrand: α = β = 10° liefert ein flaches, aber gültiges Dreieck; 170° + 10° parallel', () => {
    const q = pieces(6, one(solveWSW(6, 10, 10)));
    expect(q.ga).toBeCloseTo(160, 6);
    expect(solveWSW(6, 170, 10)).toEqual({ kind: 'none', reason: 'parallel' });
  });
});
