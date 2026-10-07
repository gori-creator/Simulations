import { describe, expect, it } from 'vitest';
import {
  Camera3D,
  closestOnLine,
  convexHull2D,
  foldNet,
  intersectRayPlane,
  lightIntensity,
  mesh3d,
  meshTopology,
  mixColor,
  parseColor,
  pointInPolygon,
  shade,
  vec3,
  type Mesh3D,
  type Vec3,
} from '../src/sim-core/view3d';

const rect = { x: 0, y: 0, w: 800, h: 500 };

/** Zeigen alle Flächen nach außen (vom Mittelpunkt weg)? */
function outward(mesh: Mesh3D): boolean {
  const center = vec3.centroid(mesh.vertices);
  return mesh.faces.every((face) => {
    const pts = face.map((i) => mesh.vertices[i]!);
    return vec3.dot(vec3.normal(pts), vec3.sub(vec3.centroid(pts), center)) > 0;
  });
}

/** Volumen eines geschlossenen Netzes (Divergenzsatz, Flächen in Dreiecke zerlegt). */
function volume(mesh: Mesh3D): number {
  let v = 0;
  for (const face of mesh.faces) {
    const a = mesh.vertices[face[0]!]!;
    for (let i = 1; i < face.length - 1; i++) {
      const b = mesh.vertices[face[i]!]!;
      const c = mesh.vertices[face[i + 1]!]!;
      v += vec3.dot(a, vec3.cross(b, c)) / 6;
    }
  }
  return v;
}

describe('vec3', () => {
  it('rechnet mit Vektoren', () => {
    expect(vec3.cross([1, 0, 0], [0, 1, 0])).toEqual([0, 0, 1]);
    expect(vec3.dot([1, 2, 3], [4, 5, 6])).toBe(32);
    expect(vec3.length(vec3.normalize([3, 4, 12]))).toBeCloseTo(1, 12);
    expect(vec3.normalize([0, 0, 0])).toEqual([0, 0, 0]);
  });

  it('bestimmt Normale und Flächeninhalt von Vielecken', () => {
    const square: Vec3[] = [
      [0, 0, 0],
      [2, 0, 0],
      [2, 3, 0],
      [0, 3, 0],
    ];
    expect(vec3.normal(square)).toEqual([0, 0, 1]);
    expect(vec3.area(square)).toBeCloseTo(6, 12);
    expect(vec3.normal([...square].reverse())).toEqual([0, 0, -1]);
  });

  it('dreht um beliebige Achsen (Rechte-Hand-Regel)', () => {
    const p = vec3.rotate([1, 0, 0], [0, 0, 0], [0, 0, 1], Math.PI / 2);
    expect(p[0]).toBeCloseTo(0, 12);
    expect(p[1]).toBeCloseTo(1, 12);
    const q = vec3.rotate([2, 1, 0], [1, 1, 0], [0, 1, 0], Math.PI / 2);
    expect(q[0]).toBeCloseTo(1, 12);
    expect(q[2]).toBeCloseTo(-1, 12);
  });
});

describe('Camera3D', () => {
  it('bildet den Zielpunkt auf die Mitte ab', () => {
    const cam = new Camera3D({ rect, target: [1, 2, 3], radius: 2 });
    const p = cam.project([1, 2, 3]);
    expect(p.x).toBeCloseTo(400, 9);
    expect(p.y).toBeCloseTo(250, 9);
    expect(p.k).toBeCloseTo(1, 12);
  });

  it('zeigt in der Standardansicht x₂ nach rechts, x₃ nach oben und x₁ nach links vorn', () => {
    const cam = new Camera3D({ rect, radius: 2 });
    const o = cam.project([0, 0, 0]);
    const x1 = cam.project([1, 0, 0]);
    const x2 = cam.project([0, 1, 0]);
    const x3 = cam.project([0, 0, 1]);
    expect(x2.x).toBeGreaterThan(o.x);
    expect(x3.y).toBeLessThan(o.y);
    expect(x3.x).toBeCloseTo(o.x, 9);
    expect(x1.x).toBeLessThan(o.x);
    expect(x1.y).toBeGreaterThan(o.y);
    expect(x1.depth).toBeLessThan(o.depth); // x₁ zeigt zum Betrachter
  });

  it('verkleinert weiter entfernte Punkte nur perspektivisch', () => {
    const persp = new Camera3D({ rect, radius: 1, azimuth: 0, elevation: 0 });
    const near = persp.project([0.5, 1, 0]);
    const far = persp.project([-0.5, 1, 0]);
    expect(Math.abs(near.x - 400)).toBeGreaterThan(Math.abs(far.x - 400));
    const ortho = new Camera3D({ rect, radius: 1, azimuth: 0, elevation: 0, projection: 'orthographic' });
    expect(Math.abs(ortho.project([0.5, 1, 0]).x - 400)).toBeCloseTo(Math.abs(ortho.project([-0.5, 1, 0]).x - 400), 9);
    expect(ortho.project([0.5, 1, 0]).depth).toBeLessThan(ortho.project([-0.5, 1, 0]).depth);
  });

  it('passt die Szenen-Kugel in den Bildbereich und zoomt', () => {
    const cam = new Camera3D({ rect, radius: 2, fill: 1 });
    expect(cam.scale).toBeCloseTo(125, 9);
    cam.zoom = 2;
    cam.update();
    expect(cam.scale).toBeCloseTo(250, 9);
  });

  it('findet über den Sichtstrahl den Weltpunkt wieder (perspektivisch und orthografisch)', () => {
    for (const projection of ['perspective', 'orthographic'] as const) {
      const cam = new Camera3D({ rect, radius: 3, azimuth: 40, elevation: 30, projection });
      const p: Vec3 = [1.2, -0.7, 0];
      const q = cam.project(p);
      const hit = intersectRayPlane(cam.ray(q.x, q.y), [0, 0, 0], [0, 0, 1])!;
      expect(vec3.distance(hit, p)).toBeLessThan(1e-9);
      const onAxis = closestOnLine(cam.ray(q.x, q.y), [0, -0.7, 0], [1, 0, 0])!;
      expect(vec3.distance(onAxis, p)).toBeLessThan(1e-9);
    }
  });

  it('erkennt Vorder- und Rückseiten', () => {
    const cam = new Camera3D({ rect, radius: 2, azimuth: 30, elevation: 20 });
    expect(cam.facing([0, 0, 1], [0, 0, 1])).toBe(true);
    expect(cam.facing([0, 0, -1], [0, 0, 0])).toBe(false);
    expect(cam.facing([1, 0, 0], [1, 0, 0])).toBe(true);
    expect(cam.facing([-1, 0, 0], [-1, 0, 0])).toBe(false);
  });
});

describe('mesh3d', () => {
  it('erzeugt geschlossene Körper mit nach außen zeigenden Flächen und richtigem Volumen', () => {
    const box = mesh3d.box([0, 0, 0], [2, 3, 4]);
    expect(box.faces).toHaveLength(6);
    expect(outward(box)).toBe(true);
    expect(volume(box)).toBeCloseTo(24, 9);
    expect(meshTopology(box)).toMatchObject({ closed: true });
    expect(meshTopology(box).edges).toHaveLength(12);

    const prism = mesh3d.prism(mesh3d.regularPolygon(6, 1), 0, 2);
    expect(outward(prism)).toBe(true);
    expect(volume(prism)).toBeCloseTo(((3 * Math.sqrt(3)) / 2) * 2, 9);
    expect(meshTopology(prism).edges).toHaveLength(18);

    const pyramid = mesh3d.pyramid(mesh3d.regularPolygon(4, Math.SQRT2), [0, 0, 3]);
    expect(outward(pyramid)).toBe(true);
    expect(volume(pyramid)).toBeCloseTo((4 * 3) / 3, 9);

    const cylinder = mesh3d.cylinder(1, 2, 256);
    expect(volume(cylinder)).toBeCloseTo(2 * Math.PI, 2);
    const cone = mesh3d.cone(1, 3, 256);
    expect(volume(cone)).toBeCloseTo(Math.PI, 2);
    const sphere = mesh3d.sphere(1, 96, 64);
    expect(outward(sphere)).toBe(true);
    expect(volume(sphere)).toBeCloseTo((4 / 3) * Math.PI, 1);
    expect(meshTopology(sphere).closed).toBe(true);
  });

  it('legt eine Seite des regelmäßigen Vielecks unten waagerecht', () => {
    const tri = mesh3d.regularPolygon(3, 1);
    expect(tri[0]![1]).toBeCloseTo(tri[1]![1], 12);
    expect(tri[0]![1]).toBeLessThan(tri[2]![1]);
    const circle = mesh3d.circle([1, 1, 1], [0, 0, 1], 2, 16);
    for (const p of circle) expect(vec3.distance(p, [1, 1, 1])).toBeCloseTo(2, 12);
  });
});

describe('Farben und Beleuchtung', () => {
  it('liest Farben und hellt auf bzw. dunkelt ab', () => {
    expect(parseColor('#2563eb')).toEqual([37, 99, 235]);
    expect(parseColor('#fff')).toEqual([255, 255, 255]);
    expect(parseColor('rgb(1, 2, 3)')).toEqual([1, 2, 3]);
    expect(shade('#808080', 1)).toBe('rgb(255,255,255)');
    expect(shade('#808080', -1)).toBe('rgb(0,0,0)');
    expect(shade('#808080', 0, 0.5)).toBe('rgba(128,128,128,0.500)');
    expect(mixColor('#000000', '#ffffff', 0.5)).toBe('rgb(128,128,128)');
  });

  it('beleuchtet zum Licht geneigte Flächen heller', () => {
    const top = lightIntensity([0, 0.94, 0.34]);
    const right = lightIntensity([0.87, -0.17, 0.47]);
    expect(top).toBeGreaterThan(right);
    expect(top).toBeLessThanOrEqual(1);
    expect(lightIntensity([0, -1, 0])).toBeCloseTo(0.45, 12);
  });
});

describe('Ebene Hilfen', () => {
  it('bestimmt die konvexe Hülle', () => {
    const hull = convexHull2D([
      [0, 0],
      [2, 0],
      [1, 1],
      [2, 2],
      [0, 2],
      [1, 0],
    ]);
    expect(hull).toHaveLength(4);
  });

  it('testet Punkte in Vielecken', () => {
    const square = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ] as const;
    expect(pointInPolygon(5, 5, square)).toBe(true);
    expect(pointInPolygon(15, 5, square)).toBe(false);
  });
});

describe('foldNet', () => {
  it('klappt eine Fläche um die Kante nach oben', () => {
    const faces = [
      { points: [[0, 0], [1, 0], [1, 1], [0, 1]] as [number, number][], parent: -1 },
      { points: [[1, 0], [2, 0], [2, 1], [1, 1]] as [number, number][], parent: 0, hinge: [[1, 0], [1, 1]] as [[number, number], [number, number]] },
    ];
    const flat = foldNet(faces, 0);
    expect(flat[1]![1]).toEqual([2, 0, 0]);
    const folded = foldNet(faces, 1);
    expect(folded[1]![1]![0]).toBeCloseTo(1, 12);
    expect(folded[1]![1]![2]).toBeCloseTo(1, 12);
    expect(folded[0]).toEqual(flat[0]);
  });

  it('faltet ein Kreuz-Netz zum Würfel', () => {
    const cells: [number, number][] = [
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
      [1, 2],
      [1, 3],
    ];
    const sq = ([x, y]: [number, number]) => [[x, y], [x + 1, y], [x + 1, y + 1], [x, y + 1]] as [number, number][];
    const shared = (a: [number, number], b: [number, number]): [[number, number], [number, number]] =>
      a[0] === b[0] ? [[a[0], Math.max(a[1], b[1])], [a[0] + 1, Math.max(a[1], b[1])]] : [[Math.max(a[0], b[0]), a[1]], [Math.max(a[0], b[0]), a[1] + 1]];
    const parents = [2, 2, -1, 2, 2, 4];
    const faces = cells.map((c, i) => ({ points: sq(c), parent: parents[i]!, hinge: parents[i]! >= 0 ? shared(c, cells[parents[i]!]!) : undefined }));
    const folded = foldNet(faces, 1);
    const centers = folded.map((pts) => vec3.centroid(pts).map((v) => Math.round(v * 1000) / 1000).join(','));
    expect(new Set(centers).size).toBe(6);
    for (const pts of folded) for (const p of pts) expect(p[2]).toBeGreaterThan(-1e-9);
  });
});
