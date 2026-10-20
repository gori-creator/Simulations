import { describe, expect, it } from 'vitest';
import {
  bounceK,
  branchXRange,
  caseAt,
  caseIndex,
  curvature,
  FAM_KEYS,
  FAMS,
  inDom,
  intersections,
  isNice,
  K_MAX,
  K_MIN,
  kindBySign,
  nearestK,
  slope,
  sweepK,
  sweepLength,
  type FamKey,
} from '../src/simulations/mathematik/funktionenscharen/model';

describe('Modell: Funktionenscharen', () => {
  /* ---------- bisherige Tests (Worktree-Stand) ---------- */
  it('x³ − kx mit k = 3: H(−1 | 2), T(1 | −2); Ortskurve y = −2x³', () => {
    const e = FAMS.cub.extrema(3);
    expect(e[0]!.x).toBeCloseTo(-1, 12);
    expect(e[0]!.y).toBeCloseTo(2, 12);
    expect(e[1]!.y).toBeCloseTo(-2, 12);
    expect(FAMS.cub.locus(1)).toBe(-2);
    expect(FAMS.cub.extrema(-1)).toEqual([]);
  });
  it('x² − 2kx + k: Scheitel (k | k − k²), alle Parabeln durch (½ | ¼)', () => {
    expect(FAMS.par.extrema(2)).toEqual([{ x: 2, y: -2, kind: 'min' }]);
    for (const k of [-2, 0, 1, 3]) expect(FAMS.par.f(k, 0.5)).toBeCloseTo(0.25, 12);
  });
  it('x · e^(−kx): Hochpunkt (1/k | 1/(ke)) auf y = x/e', () => {
    const e = FAMS.exp.extrema(2)[0]!;
    expect(e.x).toBe(0.5);
    expect(e.y).toBeCloseTo(0.5 / Math.E, 12);
    expect(FAMS.exp.extrema(-1)[0]!.kind).toBe('min');
  });
  it('kx² − x⁴: Hochpunkte (±√(k/2) | k²/4) auf y = x⁴', () => {
    const e = FAMS.quart.extrema(2);
    expect(e[2]!.x).toBeCloseTo(1, 12);
    expect(e[2]!.y).toBe(1);
    expect(FAMS.quart.locus(1)).toBe(1);
  });
  it('Plausibilität: Extrempunkte liegen auf der Kurve, f′ = 0, Ortskurve und gemeinsame Punkte stimmen', () => {
    for (const key of FAM_KEYS) {
      const fam = FAMS[key];
      for (let i = 0; i < 40; i++) {
        const k = Math.round((Math.random() * 6 - 3) * 10) / 10;
        for (const e of fam.extrema(k)) {
          expect(fam.f(k, e.x)).toBeCloseTo(e.y, 9);
          expect(Math.abs(slope(fam, k, e.x))).toBeLessThan(1e-5);
          if (e.kind !== 'saddle' && !(key === 'quart' && e.x === 0)) expect(fam.locus(e.x)).toBeCloseTo(e.y, 9);
        }
        for (const [x, y] of fam.common) expect(fam.f(k, x)).toBeCloseTo(y, 12);
      }
    }
  });

  /* ---------- Tests der Vertretung ---------- */
  it('(x − k) · eˣ mit k = 1: T(0 | −1), W(−1 | −2/e); Ortskurven y = −eˣ und y = −2eˣ; kein gemeinsamer Punkt', () => {
    const e = FAMS.expk.extrema(1)[0]!;
    expect(e.x).toBe(0);
    expect(e.y).toBe(-1);
    const w = FAMS.expk.inflections(1)[0]!;
    expect(w.x).toBe(-1);
    expect(w.y).toBeCloseTo(-2 / Math.E, 12);
    expect(FAMS.expk.common).toEqual([]);
    expect(intersections(FAMS.expk, 1, 2, -6, 4)).toEqual([]);
  });
  it('Wendepunkte: x · e^(−kx) bei k = 1 in (2 | 2/e²), kx² − x⁴ bei k = 6 in (±1 | 5)', () => {
    const w = FAMS.exp.inflections(1)[0]!;
    expect(w.x).toBe(2);
    expect(w.y).toBeCloseTo(2 / Math.E ** 2, 12);
    const q = FAMS.quart.inflections(6);
    expect(q[1]!.x).toBeCloseTo(1, 12);
    expect(q[1]!.y).toBe(5);
    expect(FAMS.quart.wlocus!(1)).toBe(5);
    expect(FAMS.quart.inflections(-1)).toEqual([]);
  });
  it('Plausibilität Wendepunkte: auf der Kurve, f″ = 0 mit Vorzeichenwechsel, auf der Ortskurve', () => {
    for (const key of ['cub', 'exp', 'quart', 'expk'] as FamKey[]) {
      const fam = FAMS[key];
      for (const k of [-2.5, -1, 0.5, 1, 2.2]) {
        for (const w of fam.inflections(k)) {
          expect(fam.f(k, w.x)).toBeCloseTo(w.y, 9);
          expect(Math.abs(curvature(fam, k, w.x))).toBeLessThan(1e-3);
          expect(curvature(fam, k, w.x - 0.05) * curvature(fam, k, w.x + 0.05)).toBeLessThan(0);
          if (fam.wlocus) expect(fam.wlocus(w.x)).toBeCloseTo(w.y, 9);
        }
      }
    }
  });
  it('Schnittstellen zweier Scharkurven = gemeinsame Punkte', () => {
    expect(intersections(FAMS.par, 1, 2, -3, 4)[0]).toBeCloseTo(0.5, 9);
    const c = intersections(FAMS.cub, 1, 2, -3, 3.001);
    expect(c).toHaveLength(1);
    expect(Math.abs(c[0]!)).toBeLessThan(1e-9);
  });

  /* ---------- Prüfwerte der Leitung ---------- */
  it('cub: k = 3 → H(−1 | 2), T(1 | −2); Probe Ortskurve x = −1 → 2; k < 0 keine Extrema; Wendepunkt immer (0 | 0)', () => {
    const [h, t] = FAMS.cub.extrema(3);
    expect(h!.kind).toBe('max');
    expect(t!.kind).toBe('min');
    expect(t!.x).toBeCloseTo(1, 12);
    expect(FAMS.cub.locus(-1)).toBe(2);
    for (const k of [-3, -0.1]) expect(FAMS.cub.extrema(k)).toHaveLength(0);
    for (const k of [-3, -1, 0, 1, 3]) expect(FAMS.cub.inflections(k)).toEqual([{ x: 0, y: 0 }]);
    expect(FAMS.cub.extrema(0)).toEqual([{ x: 0, y: 0, kind: 'saddle' }]);
  });
  it('par: T(k | k − k²), Ortskurve y = x − x², gemeinsamer Punkt (0,5 | 0,25) – x² + k(1 − 2x) ist bei x = 0,5 unabhängig von k', () => {
    for (const k of [-3, -1.5, 0, 0.7, 3]) {
      const t = FAMS.par.extrema(k)[0]!;
      expect(t.x).toBe(k);
      expect(t.y).toBeCloseTo(k - k * k, 12);
      expect(FAMS.par.locus(t.x)).toBeCloseTo(t.y, 12);
    }
    expect(FAMS.par.kCoef!(0.5)).toBe(0);
    expect(FAMS.par.common).toEqual([[0.5, 0.25]]);
  });
  it('exp: k = 1 → H(1 | 1/e ≈ 0,3679), W(2 | 2/e² ≈ 0,2707); Ortskurven y = x/e und y = x/e²', () => {
    const h = FAMS.exp.extrema(1)[0]!;
    expect(h.x).toBe(1);
    expect(h.y).toBeCloseTo(0.3679, 4);
    expect(h.kind).toBe('max');
    const w = FAMS.exp.inflections(1)[0]!;
    expect(w.y).toBeCloseTo(0.2707, 4);
    expect(FAMS.exp.locus(1)).toBeCloseTo(1 / Math.E, 12);
    expect(FAMS.exp.wlocus!(2)).toBeCloseTo(2 / Math.E ** 2, 12);
    expect(FAMS.exp.extrema(0)).toEqual([]);
  });
  it('quart: k = 2 → H(±1 | 1), T(0 | 0); W(±1/√3 | 5/9); Ortskurven y = x⁴ und y = 5x⁴', () => {
    const e = FAMS.quart.extrema(2);
    expect(e.map((p) => p.kind)).toEqual(['max', 'min', 'max']);
    expect(e[0]!.x).toBeCloseTo(-1, 12);
    expect(e[1]).toEqual({ x: 0, y: 0, kind: 'min' });
    const w = FAMS.quart.inflections(2);
    expect(w[1]!.x).toBeCloseTo(1 / Math.sqrt(3), 12);
    expect(w[1]!.y).toBeCloseTo(5 / 9, 12);
    expect(FAMS.quart.wlocus!(w[1]!.x)).toBeCloseTo(5 / 9, 12);
    expect(FAMS.quart.locus(-1)).toBe(1);
    // k ≤ 0: nur der Hochpunkt (0 | 0)
    expect(FAMS.quart.extrema(0)).toEqual([{ x: 0, y: 0, kind: 'max' }]);
    expect(kindBySign(FAMS.quart, 0, 0)).toBe('max');
    expect(kindBySign(FAMS.quart, -2, 0)).toBe('max');
  });
  it('expk: T(k − 1 | −e^(k−1)), W(k − 2 | −2e^(k−2)); Ortskurve der Tiefpunkte y = −eˣ', () => {
    for (const k of [-2, 0, 1.5, 3]) {
      const t = FAMS.expk.extrema(k)[0]!;
      expect(t.x).toBeCloseTo(k - 1, 12);
      expect(t.y).toBeCloseTo(-Math.exp(k - 1), 12);
      expect(FAMS.expk.locus(t.x)).toBeCloseTo(t.y, 12);
      const w = FAMS.expk.inflections(k)[0]!;
      expect(w.x).toBeCloseTo(k - 2, 12);
      expect(w.y).toBeCloseTo(-2 * Math.exp(k - 2), 12);
    }
  });

  /* ---------- Ableitungen, Arten der Punkte ---------- */
  it('exakte Ableitungen stimmen mit den numerischen überein', () => {
    for (const key of FAM_KEYS) {
      const fam = FAMS[key];
      for (const k of [-2.7, -1, 0, 0.4, 2.5]) {
        for (const x of [-1.7, -0.3, 0.2, 1.1, 1.9]) {
          expect(fam.d1(k, x)).toBeCloseTo(slope(fam, k, x), 5);
          expect(fam.d2(k, x)).toBeCloseTo(curvature(fam, k, x), 2);
        }
      }
    }
  });
  it('Art der Extrempunkte passt zum Vorzeichenwechsel von f′', () => {
    for (const key of FAM_KEYS) {
      const fam = FAMS[key];
      for (const k of [-2.5, -1, -0.2, 0, 0.3, 1, 2.8]) {
        for (const e of fam.extrema(k)) expect(kindBySign(fam, k, e.x, 1e-4)).toBe(e.kind);
      }
    }
  });

  /* ---------- Äste ---------- */
  it('Äste: Punkte stimmen mit extrema() bzw. inflections() überein und liegen auf ihrer Ortskurve', () => {
    for (const key of FAM_KEYS) {
      const fam = FAMS[key];
      for (const k of [-2.9, -1.3, -0.4, 0.25, 1, 2.2, 3]) {
        const ex = fam.extrema(k);
        const ws = fam.inflections(k);
        for (const b of fam.branches) {
          if (!inDom(b.dom, k)) continue;
          const x = b.x(k);
          const y = b.y(k);
          expect(fam.f(k, x)).toBeCloseTo(y, 9);
          if (b.curve === 'E') {
            const hit = ex.find((e) => Math.abs(e.x - x) < 1e-9);
            expect(hit).toBeDefined();
            expect(hit!.kind).toBe(b.kind(k));
            expect(fam.locus(x)).toBeCloseTo(y, 9);
          } else {
            expect(ws.some((w) => Math.abs(w.x - x) < 1e-9)).toBe(true);
            if (fam.wlocus) expect(fam.wlocus(x)).toBeCloseTo(y, 9);
          }
          // Umkehrung: aus x wieder k
          expect(b.kOfX(x)).toBeCloseTo(k, 9);
        }
        // jeder wandernde Extrempunkt gehört zu einem Ast oder ist ein fester Punkt
        for (const e of ex) {
          const onBranch = fam.branches.some((b) => b.curve === 'E' && inDom(b.dom, k) && Math.abs(b.x(k) - e.x) < 1e-9);
          const onFixed = fam.fixed.some((q) => q.curve === 'E' && Math.abs(q.x - e.x) < 1e-12) || e.kind === 'saddle';
          expect(onBranch || onFixed).toBe(true);
        }
      }
    }
  });
  it('x-Bereich eines Astes: cub für k ∈ [0; 3] → Hochpunkte für x ∈ [−1; 0[, exp über k = 0 hinweg unbeschränkt', () => {
    const r = branchXRange(FAMS.cub.branches[0]!, -3, 3)!;
    expect(r[0]).toBeCloseTo(-1, 12);
    expect(r[1]).toBeCloseTo(0, 4);
    expect(branchXRange(FAMS.cub.branches[0]!, -3, -1)).toBeNull();
    const pos = branchXRange(FAMS.exp.branches[1]!, -1, 2)!;
    expect(pos[0]).toBeCloseTo(0.5, 12);
    expect(pos[1]).toBeGreaterThan(1e6);
    const neg = branchXRange(FAMS.exp.branches[0]!, -1, 2)!;
    expect(neg[0]).toBeLessThan(-1e6);
    expect(neg[1]).toBeCloseTo(-1, 12);
    expect(branchXRange(FAMS.par.branches[0]!, -1, 2)).toEqual([-1, 2]);
  });
  it('Ziehen: nächster Punkt auf dem Ast liefert das passende k', () => {
    // Hochpunkt von x³ − kx bei (−1 | 2) gehört zu k = 3
    expect(nearestK(FAMS.cub.branches[0]!, -1, 2)).toBeCloseTo(3, 4);
    // Tiefpunkt der Parabelschar bei (1,5 | −0,75) → k = 1,5
    expect(nearestK(FAMS.par.branches[0]!, 1.5, -0.75)).toBeCloseTo(1.5, 4);
    // Hochpunkt von x · e^(−kx) bei (0,5 | 0,5/e) → k = 2
    expect(nearestK(FAMS.exp.branches[1]!, 0.5, 0.5 / Math.E)).toBeCloseTo(2, 3);
    // leicht neben der Ortskurve: trotzdem das nächstgelegene k
    const k = nearestK(FAMS.expk.branches[0]!, 0.02, -1.3, 100, 100)!;
    expect(Math.abs(k - 1)).toBeLessThan(0.3);
  });

  /* ---------- gemeinsame Punkte ---------- */
  it('lineare Scharen: f_k₁(x) − f_k₂(x) = (k₁ − k₂) · b(x); gemeinsame Punkte genau bei b(x) = 0', () => {
    for (const key of FAM_KEYS) {
      const fam = FAMS[key];
      if (!fam.kCoef) continue;
      for (const [k1, k2] of [
        [-2, 1],
        [0.5, 3],
        [-1.3, -0.2],
      ] as [number, number][]) {
        for (const x of [-1.5, -0.4, 0, 0.5, 1.2]) expect(fam.f(k1, x) - fam.f(k2, x)).toBeCloseTo((k1 - k2) * fam.kCoef(x), 9);
      }
      for (const [x] of fam.common) expect(fam.kCoef(x)).toBeCloseTo(0, 12);
    }
    // (x − k) · eˣ: b(x) = −eˣ ist nie null
    for (const x of [-5, 0, 3]) expect(FAMS.expk.kCoef!(x)).toBeLessThan(0);
  });
  it('x · e^(−kx): zwei Scharkurven treffen sich nur in (0 | 0) und berühren sich dort (gemeinsame Tangente y = x)', () => {
    for (const [k1, k2] of [
      [1, 2],
      [-1, 0.5],
      [-2, -0.5],
    ] as [number, number][]) {
      // Differenz x · (e^(−k₁x) − e^(−k₂x)) wechselt bei 0 nicht das Vorzeichen: Berührpunkt
      expect(intersections(FAMS.exp, k1, k2, -3, 6.001)).toEqual([]);
      const s = Math.sign(FAMS.exp.f(k1, 0.7) - FAMS.exp.f(k2, 0.7));
      for (const x of [-2.5, -1, -0.01, 0.01, 1, 4]) expect(Math.sign(FAMS.exp.f(k1, x) - FAMS.exp.f(k2, x))).toBe(s);
      expect(FAMS.exp.f(k1, 0)).toBe(0);
      expect(FAMS.exp.d1(k1, 0)).toBe(1);
    }
  });

  it('Berühren statt Schneiden: im gemeinsamen Punkt haben alle Kurven dieselbe Steigung genau bei exp und quart', () => {
    for (const key of FAM_KEYS) {
      const fam = FAMS[key];
      for (const [x] of fam.common) {
        const same = [-2, -0.5, 1, 2.5].every((k) => Math.abs(fam.d1(k, x) - fam.d1(0.3, x)) < 1e-12);
        expect(same).toBe(fam.touch);
      }
    }
  });

  /* ---------- Fallunterscheidung ---------- */
  it('Fallunterscheidung nach k: cub (keine | Terrassenpunkt | H und T), exp (T | keine | H), quart (H | 2 H und T)', () => {
    expect(caseAt(FAMS.cub, -1).id).toBe('none');
    expect(caseAt(FAMS.cub, 0).id).toBe('tp');
    expect(caseAt(FAMS.cub, 0.1).id).toBe('ht');
    expect(caseAt(FAMS.exp, -0.5).id).toBe('t');
    expect(caseAt(FAMS.exp, 0).id).toBe('none');
    expect(caseAt(FAMS.exp, 2).id).toBe('h');
    expect(caseAt(FAMS.quart, -3).id).toBe('h0');
    expect(caseAt(FAMS.quart, 0).id).toBe('h0');
    expect(caseAt(FAMS.quart, 1).id).toBe('hth');
    expect(caseIndex(FAMS.cub, 2)).toBe(2);
    expect(caseAt(FAMS.par, 3).id).toBe('t');
  });
  it('Anzahl der Extrempunkte je Fall stimmt mit extrema() überein', () => {
    for (const key of FAM_KEYS) {
      const fam = FAMS[key];
      for (let i = 0; i <= 60; i++) {
        const k = Math.round((K_MIN + ((K_MAX - K_MIN) * i) / 60) * 10) / 10;
        const c = caseAt(fam, k);
        const ex = fam.extrema(k);
        expect(ex.filter((e) => e.kind === 'max').length).toBe(c.max);
        expect(ex.filter((e) => e.kind === 'min').length).toBe(c.min);
        expect(ex.filter((e) => e.kind === 'saddle').length).toBe(c.saddle);
      }
    }
  });

  /* ---------- Durchlauf ---------- */
  it('Durchlauf: von k₀ nach −3, dann bis 3 und zurück zu k₀, mit gleichmäßiger Geschwindigkeit', () => {
    expect(sweepK(0, 1.5)).toBe(1.5);
    expect(sweepLength(1.5)).toBe(4.5 + 6 + 1.5);
    expect(sweepK(4.5 / 12, 1.5)).toBeCloseTo(-3, 12);
    expect(sweepK(10.5 / 12, 1.5)).toBeCloseTo(3, 12);
    expect(sweepK(1, 1.5)).toBeCloseTo(1.5, 12);
    expect(sweepK(0.5, 1.5)).toBeCloseTo(-3 + 1.5, 12);
    // stetig: kleine Schritte in t ⇒ kleine Schritte in k
    let prev = sweepK(0, -0.7);
    for (let i = 1; i <= 500; i++) {
      const v = sweepK(i / 500, -0.7);
      expect(Math.abs(v - prev)).toBeLessThan((sweepLength(-0.7) / 500) * 1.0001);
      prev = v;
    }
  });
  it('Pendeln beim Abspielen: an den Rändern umkehren', () => {
    expect(bounceK(2.9, 1, 0.3)).toEqual({ k: expect.closeTo(2.8, 12), dir: -1 });
    expect(bounceK(-2.95, -1, 0.1)).toEqual({ k: expect.closeTo(-2.95, 12), dir: 1 });
    expect(bounceK(0, 1, 0.5)).toEqual({ k: 0.5, dir: 1 });
  });
  it('Hilfsfunktion isNice erkennt „runde“ Werte', () => {
    expect(isNice(0.25)).toBe(true);
    expect(isNice(1 / 3)).toBe(false);
    expect(isNice(-2)).toBe(true);
  });
});
