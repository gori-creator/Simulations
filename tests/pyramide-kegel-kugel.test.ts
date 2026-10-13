import { describe, expect, it } from 'vitest';
import {
  bowlVessel,
  capacity,
  clipBelow,
  cone,
  emptyTilt,
  invertedPyramidVessel,
  levelForVolume,
  orientOutward,
  polygonBySide,
  polygonPoints,
  pyramid,
  solidOf,
  solidVolume,
  sphere,
  unrollCone,
  volumeBelow,
} from '../src/simulations/mathematik/pyramide-kegel-kugel/model';

describe('Modell: Pyramide, Kegel und Kugel – Formeln', () => {
  it('quadratische Pyramide a = 6 cm, h = 4 cm (Cheops-Form)', () => {
    const p = pyramid(4, 6, 4);
    expect(p.G).toBeCloseTo(36, 12);
    expect(p.base.rho).toBeCloseTo(3, 12);
    expect(p.base.R).toBeCloseTo(3 * Math.SQRT2, 12);
    expect(p.ha).toBeCloseTo(5, 12); // 4² + 3² = 5²
    expect(p.s).toBeCloseTo(Math.sqrt(34), 12); // 4² + (3√2)² = 34
    expect(p.s ** 2).toBeCloseTo(p.ha ** 2 + 3 ** 2, 12); // Dreieck in der Seitenfläche
    expect(p.V).toBeCloseTo(48, 12);
    expect(p.M).toBeCloseTo(60, 12);
    expect(p.O).toBeCloseTo(96, 12);
  });

  it('regelmäßiges Sechseck: Seite = Umkreisradius, G = 6 · gleichseitiges Dreieck', () => {
    const q = polygonBySide(6, 2);
    expect(q.R).toBeCloseTo(2, 12);
    expect(q.rho).toBeCloseTo(Math.sqrt(3), 12);
    expect(q.area).toBeCloseTo(6 * (Math.sqrt(3) / 4) * 4, 12);
    expect(q.perimeter).toBe(12);
  });

  it('Eckpunkte: erste Seite senkrecht zur x₂-Achse auf der gewünschten Seite', () => {
    for (const n of [3, 4, 5, 8]) {
      const q = polygonBySide(n, 2);
      for (const side of [1, -1] as const) {
        const pts = polygonPoints(n, q.R, side);
        expect(Math.hypot(pts[1]![0] - pts[0]![0], pts[1]![1] - pts[0]![1])).toBeCloseTo(2, 12);
        expect(pts[0]![1]).toBeCloseTo(side * q.rho, 12);
        expect(pts[1]![1]).toBeCloseTo(side * q.rho, 12);
      }
    }
  });

  it('Kegel r = 3 cm, h = 4 cm: s = 5 cm, α = 216°', () => {
    const k = cone(3, 4);
    expect(k.s).toBeCloseTo(5, 12);
    expect(k.V).toBeCloseTo(12 * Math.PI, 12);
    expect(k.M).toBeCloseTo(15 * Math.PI, 12);
    expect(k.O).toBeCloseTo(24 * Math.PI, 12);
    expect(k.sectorDeg).toBeCloseTo(216, 12);
    // Sektorfläche α/360° · π s² ist der Mantel
    expect((k.sectorDeg / 360) * Math.PI * k.s ** 2).toBeCloseTo(k.M, 12);
  });

  it('Kugel: V = 4/3 πr³, O = 4πr², Archimedes (Zylinder = Kegel + Halbkugel)', () => {
    const s = sphere(2);
    expect(s.V).toBeCloseTo((32 / 3) * Math.PI, 12);
    expect(s.O).toBeCloseTo(16 * Math.PI, 12);
    const a = s.archimedes;
    expect(a.cone + a.hemisphere).toBeCloseTo(a.cylinder, 12);
    expect(2 * a.hemisphere).toBeCloseTo(s.V, 12);
    expect(s.V / s.cylV).toBeCloseTo(2 / 3, 12);
    expect(s.O / s.cylO).toBeCloseTo(2 / 3, 12);
    // „Kugel aus Pyramiden“: V = ⅓ · O · r
    expect(s.O * 2 / 3).toBeCloseTo(s.V, 12);
    // bei r = 3 sind V und O zahlenmäßig gleich
    expect(sphere(3).V).toBeCloseTo(sphere(3).O, 12);
  });

  it('Kegelmantel abwickeln: Bogenlänge bleibt 2πr, am Ende flach mit Winkel α', () => {
    const k = cone(3, 4);
    for (const t of [0, 0.3, 0.7, 1]) {
      const u = unrollCone(3, k.s, t);
      expect(u.rho * u.wrap).toBeCloseTo(2 * Math.PI * 3, 12);
      expect(Math.hypot(u.rho, u.height)).toBeCloseTo(k.s, 12);
    }
    expect(unrollCone(3, k.s, 0).height).toBeCloseTo(4, 12);
    expect(unrollCone(3, k.s, 1).height).toBeCloseTo(0, 12);
    expect(unrollCone(3, k.s, 1).wrap).toBeCloseTo(k.sector, 12);
  });
});

describe('Modell: Umschüttversuch – Körper abschneiden', () => {
  const cube = orientOutward([
    [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]],
    [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]],
    [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]],
    [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]],
    [[0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 0, 1]],
    [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]],
  ]);

  it('Volumen eines Würfels und seines unteren Teils', () => {
    expect(solidVolume(cube)).toBeCloseTo(1, 12);
    expect(solidVolume(clipBelow(cube, 0.3))).toBeCloseTo(0.3, 12);
    expect(volumeBelow(cube, -1)).toBe(0);
    expect(volumeBelow(cube, 2)).toBeCloseTo(1, 12);
    expect(levelForVolume(cube, 0.65)).toBeCloseTo(0.65, 9);
  });

  it('umgedrehte Pyramide: halbe Höhe = ein Achtel des Volumens; Gefäßvolumen ⅓ · G · h', () => {
    const q = polygonBySide(4, 6);
    const v = invertedPyramidVessel(polygonPoints(4, q.R, 1), 4, 1);
    expect(v.volume).toBeCloseTo(48, 9);
    expect(volumeBelow(solidOf(v.vertices, v.faces), 2)).toBeCloseTo(6, 9);
    expect(levelForVolume(solidOf(v.vertices, v.faces), 24)).toBeCloseTo(4 * Math.cbrt(0.5), 7);
    expect(v.lip[1]).toBeCloseTo(3, 12);
    expect(v.lip[2]).toBeCloseTo(4, 12);
  });

  it('Kippen: Fassungsvermögen nimmt ab, leer ab dem Neigungswinkel der Ausgussseite', () => {
    const q = polygonBySide(4, 6);
    const v = invertedPyramidVessel(polygonPoints(4, q.R, 1), 4, 1);
    const pose = (tilt: number) => ({ offset: [0, 0, 0] as const, tilt, dir: 1 as const });
    expect(capacity(v, pose(0))).toBeCloseTo(48, 9);
    let last = Infinity;
    for (let t = 0; t <= 1.2; t += 0.1) {
      const c = capacity(v, pose(t));
      expect(c).toBeLessThanOrEqual(last + 1e-9);
      last = c;
    }
    // Ausgussseite ist um atan(h/ρ) gegen die Waagerechte geneigt
    expect(emptyTilt(v, 1)).toBeCloseTo(Math.atan2(4, 3), 4);
  });

  it('Halbkugelschale: Volumen nähert ⅔πr³, leer ab 90° Kippung', () => {
    const b = bowlVessel(2, -1, 48, 12);
    expect(b.volume / ((2 / 3) * Math.PI * 8)).toBeGreaterThan(0.97);
    expect(b.volume / ((2 / 3) * Math.PI * 8)).toBeLessThan(1);
    // (das Vielflach ist am Rand minimal schräg, daher etwas weniger als 90°)
    const t = emptyTilt(b, -1);
    expect(t).toBeGreaterThan((82 * Math.PI) / 180);
    expect(t).toBeLessThanOrEqual(Math.PI / 2 + 1e-9);
    // um 30° gekippt: Kugelabschnitt der Höhe r − r · sin 30° = r/2, also V = π · (r/2)² · (3r − r/2) / 3
    const capExact = (Math.PI * 1 * (6 - 1)) / 3;
    expect(capacity(b, { offset: [0, 0, 0], tilt: Math.PI / 6, dir: -1 }) / capExact).toBeCloseTo(1, 1);
  });
});
