import { describe, expect, it } from 'vitest';
import { foldNet, vec3, type Vec3 } from '../src/sim-core/view3d';
import {
  buildNet,
  checkCubeNet,
  CUBE_NETS,
  cubeNet,
  cuboidNet,
  cylinderNet,
  CYLINDER_STRIPS,
  mapNetPoint,
  prismNet,
  pyramidHeight,
  pyramidNet,
  surfaceArea,
  type Cell,
} from '../src/simulations/mathematik/koerpernetze/model';

/** Form eines Netzes ohne Lage: alle Drehungen und Spiegelungen, kleinste Schreibweise. */
function canonical(cells: readonly Cell[]): string {
  const variants: string[] = [];
  const transforms: ((c: Cell) => Cell)[] = [
    ([x, y]) => [x, y],
    ([x, y]) => [-y, x],
    ([x, y]) => [-x, -y],
    ([x, y]) => [y, -x],
    ([x, y]) => [-x, y],
    ([x, y]) => [y, x],
    ([x, y]) => [x, -y],
    ([x, y]) => [-y, -x],
  ];
  for (const t of transforms) {
    const moved = cells.map(t);
    const mx = Math.min(...moved.map((c) => c[0]));
    const my = Math.min(...moved.map((c) => c[1]));
    variants.push(
      moved
        .map(([x, y]) => `${x - mx},${y - my}`)
        .sort()
        .join(' '),
    );
  }
  return variants.sort()[0]!;
}

const params = { net: 1, a: 3, b: 2, c: 1.5, h: 4, ha: 4, r: 1.5 };
const close = (a: Vec3, b: Vec3) => vec3.distance(a, b) < 1e-9;

describe('Würfelnetze', () => {
  const checks = CUBE_NETS.map((cells) => checkCubeNet(cubeNet(cells, 2), 2));

  it('enthält genau die 11 verschiedenen Würfelnetze und 4 falsche Netze', () => {
    const valid = CUBE_NETS.filter((_, i) => checks[i]!.valid);
    expect(valid).toHaveLength(11);
    expect(new Set(valid.map(canonical)).size).toBe(11);
    expect(new Set(CUBE_NETS.map(canonical)).size).toBe(15);
    for (const cells of CUBE_NETS) expect(cells).toHaveLength(6);
  });

  it('erkennt falsche Netze an überlappenden und fehlenden Flächen', () => {
    for (const i of [2, 6, 9, 12]) {
      expect(checks[i]!.valid, `Netz ${i + 1}`).toBe(false);
      expect(checks[i]!.overlaps.length, `Netz ${i + 1}`).toBeGreaterThan(0);
      expect(checks[i]!.missing.length, `Netz ${i + 1}`).toBe(checks[i]!.overlaps.length);
    }
  });

  it('nummeriert gegenüberliegende Flächen mit der Augensumme 7', () => {
    for (const check of checks.filter((c) => c.valid)) {
      expect([...check.pips].sort()).toEqual([1, 2, 3, 4, 5, 6]);
      expect([0, 1, 2].map((g) => check.groups.filter((x) => x === g).length)).toEqual([2, 2, 2]);
      for (let g = 0; g < 3; g++) {
        const pips = check.pips.filter((_, i) => check.groups[i] === g);
        expect(pips[0]! + pips[1]!).toBe(7);
      }
    }
  });

  it('hängt jede Fläche über eine gemeinsame Kante an', () => {
    const faces = cubeNet(CUBE_NETS[0]!, 1);
    expect(faces.filter((f) => f.parent === -1)).toHaveLength(1);
    for (const f of faces) {
      if (!f.hinge) continue;
      const parent = faces[f.parent]!;
      for (const p of f.hinge) {
        expect(f.points.some((q) => q[0] === p[0] && q[1] === p[1])).toBe(true);
        expect(parent.points.some((q) => q[0] === p[0] && q[1] === p[1])).toBe(true);
      }
    }
  });
});

describe('Netze der übrigen Körper', () => {
  it('faltet den Quader zu den richtigen Eckpunkten', () => {
    const folded = foldNet(cuboidNet(4, 3, 2), 1).flat();
    for (const x1 of [-1.5, 1.5]) for (const x2 of [-2, 2]) for (const z of [0, 2]) expect(folded.some((p) => close(p, [x1, x2, z]))).toBe(true);
    expect(Math.max(...folded.map((p) => p[2]))).toBeCloseTo(2, 9);
  });

  it('faltet das Prisma zum Dach mit gleichseitigem Querschnitt', () => {
    const a = 2;
    const folded = foldNet(prismNet(a, 5), 1);
    const ridge = Math.sqrt(3);
    // die beiden Seitenrechtecke treffen sich am First
    const top = Math.max(...folded.flat().map((p) => p[2]));
    expect(top).toBeCloseTo(ridge, 9);
    expect(folded[1]!.filter((p) => Math.abs(p[2] - ridge) < 1e-9 && Math.abs(p[1]) < 1e-9)).toHaveLength(2);
    expect(folded[2]!.filter((p) => Math.abs(p[2] - ridge) < 1e-9 && Math.abs(p[1]) < 1e-9)).toHaveLength(2);
  });

  it('faltet die Pyramide zu einer gemeinsamen Spitze', () => {
    const a = 3;
    const ha = 4;
    const folded = foldNet(pyramidNet(a, ha), 1);
    const apex: Vec3 = [0, 0, pyramidHeight(a, ha)];
    for (let i = 1; i <= 4; i++) expect(folded[i]!.some((p) => vec3.distance(p, apex) < 1e-9)).toBe(true);
    expect(pyramidHeight(6, 5)).toBeCloseTo(4, 12);
  });

  it('rollt den Zylindermantel einmal um den Grundkreis', () => {
    const r = 1.5;
    const h = 2;
    const faces = cylinderNet(r, h);
    expect(faces).toHaveLength(CYLINDER_STRIPS + 2);
    const folded = foldNet(faces, 1);
    const center = vec3.centroid(folded[0]!);
    // alle Mantelecken liegen auf dem Zylinder um den Grundkreis
    const radius = vec3.distance(folded[0]![0]!, center);
    for (let i = 1; i <= CYLINDER_STRIPS; i++) {
      for (const p of folded[i]!) expect(Math.hypot(p[0] - center[0], p[1] - center[1])).toBeCloseTo(radius, 6);
    }
    // Deckkreis liegt oben, genau über dem Grundkreis
    const top = vec3.centroid(folded[CYLINDER_STRIPS + 1]!);
    expect(top[2]).toBeCloseTo(h, 9);
    expect(Math.hypot(top[0] - center[0], top[1] - center[1])).toBeLessThan(1e-9);
    // Umfang des n-Ecks = Länge des Mantels
    expect(radius * 2 * CYLINDER_STRIPS * Math.sin(Math.PI / CYLINDER_STRIPS)).toBeCloseTo(2 * Math.PI * r, 9);
  });

  it('berechnet die Oberflächen', () => {
    expect(surfaceArea('wuerfel', params)).toBe(54);
    expect(surfaceArea('quader', params)).toBeCloseTo(2 * (6 + 4.5 + 3), 12);
    expect(surfaceArea('pyramide', params)).toBe(9 + 24);
    expect(surfaceArea('prisma', { ...params, a: 2, h: 5 })).toBeCloseTo(2 * Math.sqrt(3) + 30, 12);
    expect(surfaceArea('zylinder', { ...params, r: 1, h: 2 })).toBeCloseTo(6 * Math.PI, 12);
  });

  it('stimmt die Summe der Netzflächen mit der Oberfläche überein', () => {
    for (const body of ['wuerfel', 'quader', 'prisma', 'pyramide', 'zylinder'] as const) {
      const net = buildNet(body, params);
      const sum = net.faces.reduce((s, f) => s + f.area, 0);
      expect(sum, body).toBeCloseTo(net.surface, 9);
      if (body !== 'zylinder') {
        const measured = net.faces.reduce((s, f) => s + vec3.area(f.points.map(([x, y]) => [x, y, 0] as Vec3)), 0);
        expect(measured, body).toBeCloseTo(net.surface, 9);
      }
    }
  });

  it('bildet Netzpunkte mit der Fläche ab', () => {
    const faces = cuboidNet(4, 3, 2);
    const folded = foldNet(faces, 1);
    const front = faces[1]!;
    const mid = mapNetPoint(front.points, folded[1]!, [1.5 + 1, 0]);
    expect(mid[0]).toBeCloseTo(1.5, 9);
    expect(mid[2]).toBeCloseTo(1, 9);
  });
});
