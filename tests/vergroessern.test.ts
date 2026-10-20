import { describe, expect, it } from 'vitest';
import { seededRandom } from '../src/sim-core';
import {
  BODIES,
  boxSurface,
  boxVolume,
  cells,
  clipHalfPlane,
  cubeOV,
  exactRoot,
  factor,
  FIGS,
  fullCubes,
  kFromFactor,
  modelFactors,
  pizzaArea,
  pizzaFactor,
  polyArea,
  reciprocalInt,
  scaleArea,
  scaleDims,
  scaleLength,
  scaleVolume,
  splitCube,
  splitEdge,
  tiling2D,
  tiling3D,
  totalFrac,
  unitCuts,
  type FigId,
} from '../src/simulations/mathematik/vergroessern/model';

describe('Modell: Ähnliche Figuren – Länge, Fläche, Volumen', () => {
  it('k = 2: 1 cm → 2 cm, 1 cm² → 4 cm², 1 cm³ → 8 cm³', () => {
    expect(scaleLength(1, 2)).toBe(2);
    expect(scaleArea(1, 2)).toBe(4);
    expect(scaleVolume(1, 2)).toBe(8);
  });
  it('k = 3 und k = 0,5 (Schulbuchwerte)', () => {
    expect(scaleArea(1, 3)).toBe(9);
    expect(scaleVolume(1, 3)).toBe(27);
    expect(scaleArea(1, 0.5)).toBe(0.25);
    expect(scaleVolume(1, 0.5)).toBe(0.125);
    expect(factor(3, 2)).toBe(9);
    expect(factor(3, 3)).toBe(27);
  });
  it('Einheitswürfel mit k = 2: 8 Würfel, Oberfläche 6 cm² → 24 cm²', () => {
    const d = scaleDims(BODIES.w, 2);
    expect(boxVolume(d)).toBe(8);
    expect(boxSurface(BODIES.w)).toBe(6);
    expect(boxSurface(d)).toBe(24);
    expect(totalFrac(tiling3D(BODIES.w, 2))).toBe(8);
    expect(tiling3D(BODIES.w, 2)).toHaveLength(8);
  });
  it('Quader 2 × 1 × 1 cm mit k = 1,5 → 3 × 1,5 × 1,5 cm, V = 6,75 cm³ = 2 · 3,375', () => {
    const d = scaleDims(BODIES.q, 1.5);
    expect([...d].sort((a, b) => b - a)).toEqual([3, 1.5, 1.5]);
    expect(boxVolume(d)).toBeCloseTo(6.75, 12);
    expect(boxVolume(d)).toBeCloseTo(2 * 3.375, 12);
    expect(totalFrac(tiling3D(BODIES.q, 1.5))).toBeCloseTo(3.375, 12);
    // Oberfläche 10 cm² → 22,5 cm² (· 2,25)
    expect(boxSurface(BODIES.q)).toBe(10);
    expect(boxSurface(d)).toBeCloseTo(22.5, 12);
  });
  it('Quader 1 × 2 × 1 mit k = 2 hat 16 cm³', () => {
    expect(scaleVolume(2, 2)).toBe(16);
    expect(scaleArea(2, 3)).toBe(18);
  });

  it('Zerlegung in Einheitsabschnitte', () => {
    expect(unitCuts(3)).toEqual([1, 1, 1]);
    expect(unitCuts(1.5)).toEqual([1, 0.5]);
    expect(unitCuts(0.5)).toEqual([0.5]);
    const c23 = unitCuts(2.3);
    expect(c23).toHaveLength(3);
    expect(c23[2]).toBeCloseTo(0.3, 12);
  });
  it('Zellen füllen den Quader lückenlos', () => {
    for (const d of [
      [2, 2, 2],
      [1.5, 1.5, 1.5],
      [4, 8, 4],
      [0.5, 1, 0.5],
      [3.5, 7, 3.5],
    ] as const) {
      const cs = cells(d);
      const vol = cs.reduce((s, c) => s + c.size[0] * c.size[1] * c.size[2], 0);
      expect(vol).toBeCloseTo(d[0] * d[1] * d[2], 9);
      expect(cs.filter((c) => c.size.every((s) => s === 1)).length).toBe(fullCubes(d));
    }
    expect(fullCubes([4, 4, 4])).toBe(64);
    expect(fullCubes([1.5, 1.5, 1.5])).toBe(1);
  });

  it('Auslegen der Flächen: Quadrat k = 2 → 4 Kopien, Dreieck k = 2 → 4 (davon 1 umgedreht), k = 3 → 9', () => {
    expect(tiling2D('q', 2)).toHaveLength(4);
    const t2 = tiling2D('d', 2);
    expect(t2).toHaveLength(4);
    expect(t2.filter((p) => p.rot !== 0)).toHaveLength(1);
    const t3 = tiling2D('d', 3);
    expect(t3).toHaveLength(9);
    expect(t3.filter((p) => p.rot !== 0)).toHaveLength(3);
    expect(totalFrac(tiling2D('r', 3))).toBe(9);
    // Kreis: k = 2 → vier Viertelkreise, jeder so groß wie der kleine Kreis
    const c = tiling2D('k', 2);
    expect(c).toHaveLength(4);
    for (const p of c) expect(polyArea(p.poly) / Math.PI).toBeCloseTo(1, 3);
  });
  it('Bruchstücke am Rand: Quadrat k = 1,5 → 1 + 0,5 + 0,5 + 0,25 = 2,25', () => {
    const t = tiling2D('q', 1.5);
    expect(t.map((p) => p.frac).sort()).toEqual([0.25, 0.5, 0.5, 1]);
    expect(totalFrac(t)).toBe(2.25);
  });
  it('Anteile der Stücke stimmen mit ihren Flächen überein (alle Figuren)', () => {
    for (const fig of ['q', 'r', 'd', 'k'] as FigId[]) {
      for (const m of [1, 1.3, 2, 2.5, 3.7, 4]) {
        const t = tiling2D(fig, m);
        expect(totalFrac(t)).toBeCloseTo(m * m, 9);
        const area = t.reduce((s, p) => s + polyArea(p.poly), 0);
        // Kreis: Sektoren als Vielecke angenähert
        expect(area / (FIGS[fig].area * m * m)).toBeCloseTo(1, fig === 'k' ? 3 : 9);
        for (const p of t) if (fig !== 'k') expect(polyArea(p.poly)).toBeCloseTo(p.frac * FIGS[fig].area, 9);
      }
    }
  });
  it('Halbebene abschneiden', () => {
    const sq: [number, number][] = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ];
    expect(polyArea(clipHalfPlane(sq, [1, 0], 0.5))).toBeCloseTo(0.5, 12);
    expect(polyArea(clipHalfPlane(sq, [1, 1], 1))).toBeCloseTo(0.5, 12);
    expect(clipHalfPlane(sq, [1, 0], -1)).toHaveLength(0);
  });

  it('Verkleinern k = 0,5: 4 Bilder passen in die Fläche, 8 Bilder in den Körper', () => {
    expect(totalFrac(tiling2D('q', 1 / 0.5))).toBe(4);
    expect(totalFrac(tiling3D(BODIES.w, 1 / 0.5))).toBe(8);
    expect(reciprocalInt(0.25)).toBe(4);
    expect(reciprocalInt(0.125)).toBe(8);
    expect(reciprocalInt(0.3)).toBeNull();
    expect(reciprocalInt(2)).toBeNull();
  });

  it('Rückwärts: Volumenfaktor 8 → k = 2, 27 → k = 3; Flächenfaktor 2 → k = √2 ≈ 1,414', () => {
    expect(kFromFactor(8, 3)).toBe(2);
    expect(kFromFactor(27, 3)).toBe(3);
    expect(kFromFactor(2, 2)).toBeCloseTo(1.414, 3);
    expect(kFromFactor(2, 2)).toBeCloseTo(Math.SQRT2, 14);
    expect(kFromFactor(9, 2)).toBe(3);
    expect(kFromFactor(0.125, 3)).toBeCloseTo(0.5, 14);
    expect(kFromFactor(0, 3)).toBeNaN();
    expect(exactRoot(27, 3)).toBe(3);
    expect(exactRoot(64, 3)).toBe(4);
    expect(exactRoot(0.125, 3)).toBe(0.5);
    expect(exactRoot(2, 2)).toBeNull();
    expect(exactRoot(16, 2)).toBe(4);
    expect(exactRoot(10, 3)).toBeNull();
  });

  it('Pizza: 30 cm statt 20 cm → (30 : 20)² = 2,25-mal so viel', () => {
    expect(pizzaFactor(20, 30)).toBeCloseTo(2.25, 14);
    expect(pizzaArea(30) / pizzaArea(20)).toBeCloseTo(2.25, 14);
    expect(pizzaArea(20)).toBeCloseTo(314.159, 2);
    // zwei 20-cm-Pizzen sind weniger als eine 30-cm-Pizza
    expect(2 * pizzaArea(20)).toBeLessThan(pizzaArea(30));
  });
  it('Modell 1 : 10 → Länge 1/10, Oberfläche (Lack) 1/100, Volumen (Masse) 1/1000', () => {
    const f = modelFactors(10);
    expect(f.len).toBeCloseTo(0.1, 15);
    expect(f.area).toBeCloseTo(0.01, 15);
    expect(f.vol).toBeCloseTo(0.001, 15);
    expect(modelFactors(87).area).toBeCloseTo(1 / 7569, 15);
  });
  it('Oberfläche zu Volumen beim Würfel: O : V = 6/a → a = 1: 6; a = 2: 3; a = 3: 2', () => {
    expect(cubeOV(1).ratio).toBe(6);
    expect(cubeOV(2).ratio).toBe(3);
    expect(cubeOV(3).ratio).toBe(2);
    expect(cubeOV(2).O).toBe(24);
    expect(cubeOV(2).V).toBe(8);
  });
  it('Würfel zerteilen: a = 2 in 8 Würfel → Oberfläche 24 → 48 cm², Volumen bleibt 8 cm³', () => {
    const s = splitCube(2, splitEdge(2));
    expect(s).toEqual({ n: 8, O0: 24, O1: 48, V: 8 });
    const s3 = splitCube(3, splitEdge(3));
    expect(s3.n).toBe(27);
    expect(s3.O1).toBe(162);
    expect(splitEdge(1.5)).toBe(0.75);
    expect(splitCube(1.5, 0.75).O1).toBeCloseTo(2 * 6 * 1.5 * 1.5, 12);
  });

  it('Plausibilität (Zufallswerte): Anteile = k² bzw. k³, Rückwärts ergibt wieder k, O : V ändert sich mit 1/k', () => {
    const rnd = seededRandom(9);
    for (let i = 0; i < 200; i++) {
      const k = 0.2 + Math.round(rnd() * 38) / 10;
      const fig = (['q', 'r', 'd', 'k'] as FigId[])[Math.floor(rnd() * 4)]!;
      const m = Math.max(k, 1 / k);
      expect(totalFrac(tiling2D(fig, m))).toBeCloseTo(m * m, 9);
      expect(totalFrac(tiling3D(BODIES.q, m))).toBeCloseTo(m ** 3, 9);
      expect(kFromFactor(factor(k, 2), 2)).toBeCloseTo(k, 12);
      expect(kFromFactor(factor(k, 3), 3)).toBeCloseTo(k, 12);
      const d = scaleDims(BODIES.q, k);
      expect(boxSurface(d) / boxSurface(BODIES.q)).toBeCloseTo(k * k, 9);
      expect(boxVolume(d) / boxVolume(BODIES.q)).toBeCloseTo(k ** 3, 9);
      // Verhältnis O : V wird mit k durch k geteilt
      expect(boxSurface(d) / boxVolume(d)).toBeCloseTo(boxSurface(BODIES.q) / boxVolume(BODIES.q) / k, 9);
    }
  });

  it('Reglergrenzen k = 0,2 und k = 4: Auslegen ergibt 25 bzw. 16 Kopien (Fläche) und 125 bzw. 64 (Körper)', () => {
    // beim Verkleinern wird das Original mit 1/k-fach so großen Kopien ausgelegt (m = 1/k)
    for (const f of ['q', 'r', 'd', 'k'] as FigId[]) {
      expect(totalFrac(tiling2D(f, 4))).toBeCloseTo(16, 9);
      expect(totalFrac(tiling2D(f, 5, 0.2))).toBeCloseTo(25, 9);
    }
    for (const b of [BODIES.w, BODIES.q]) {
      expect(totalFrac(tiling3D(b, 4))).toBeCloseTo(64, 9);
      expect(totalFrac(tiling3D(b, 5))).toBeCloseTo(125, 9);
    }
    // Zahlen der Ergebnisanzeige an den Grenzen
    expect(scaleArea(1, 0.2)).toBeCloseTo(0.04, 12);
    expect(scaleVolume(1, 0.2)).toBeCloseTo(0.008, 12);
    expect(reciprocalInt(0.2 ** 2)).toBe(25);
    expect(reciprocalInt(0.2 ** 3)).toBe(125);
    expect(scaleVolume(2, 4)).toBe(128);
  });
  it('Würfel zerteilen über den ganzen Regler (a = 0,5 … 5): ganze Anzahl, Volumen bleibt, Oberfläche · (a/e)', () => {
    for (let a = 0.5; a <= 5 + 1e-9; a += 0.5) {
      const e = splitEdge(a);
      const s = splitCube(a, e);
      const per = a / e;
      expect(Math.abs(per - Math.round(per))).toBeLessThan(1e-9);
      expect(per).toBeGreaterThanOrEqual(2);
      expect(s.n * e ** 3).toBeCloseTo(a ** 3, 9);
      expect(s.O1).toBeCloseTo(per * s.O0, 9);
    }
  });
  it('Pizza an den Reglergrenzen: 10 cm → 40 cm ergibt 16-fache Fläche, gleich groß ergibt 1', () => {
    expect(pizzaFactor(10, 40)).toBe(16);
    expect(pizzaFactor(40, 10)).toBe(1 / 16);
    expect(pizzaFactor(25, 25)).toBe(1);
    expect(pizzaArea(40) / pizzaArea(10)).toBeCloseTo(16, 12);
  });
  it('Rückwärts an den Reglergrenzen: Faktor 64 → k = 4 bzw. 8, Faktor 0,1 → k < 1', () => {
    expect(kFromFactor(64, 3)).toBeCloseTo(4, 12);
    expect(kFromFactor(64, 2)).toBe(8);
    expect(exactRoot(64, 2)).toBe(8);
    expect(kFromFactor(0.1, 2)).toBeCloseTo(0.3162, 4);
    expect(kFromFactor(0.1, 3)).toBeCloseTo(0.4642, 4);
    expect(exactRoot(0.1, 3)).toBeNull();
  });
});
