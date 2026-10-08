import { describe, expect, it } from 'vitest';
import {
  dirFromVertical,
  glancingAngle,
  hitsFront,
  imageCountRule,
  incidence,
  inFront,
  isReversed,
  lightPath,
  mirrorImage,
  neededMirror,
  reflectAcross,
  reflectedAngle,
  reflectionPoint,
  reflectVector,
  seesInMirror,
  wedgeImages,
  type V2,
} from '../src/simulations/physik/reflexion/model';

describe('Modell: Reflexionsgesetz', () => {
  it('Einfallswinkel = Reflexionswinkel (zum Lot gemessen)', () => {
    expect(incidence(40, 0)).toBe(40);
    expect(reflectedAngle(40, 0)).toBe(-40);
    // Vektorrechnung bestätigt die Winkelrechnung
    const d = dirFromVertical(40);
    const out = reflectVector([-d[0], -d[1]], [0, 1]);
    const back = dirFromVertical(reflectedAngle(40, 0));
    expect(out[0]).toBeCloseTo(back[0], 12);
    expect(out[1]).toBeCloseTo(back[1], 12);
  });

  it('dreht man den Spiegel um φ, dreht sich der reflektierte Strahl um 2φ', () => {
    const before = reflectedAngle(40, 0);
    const after = reflectedAngle(40, 15);
    expect(after - before).toBe(30);
    expect(incidence(40, 15)).toBe(25);
  });

  it('Winkel zur Spiegelfläche ist 90° − α', () => {
    expect(glancingAngle(25)).toBe(65);
    expect(glancingAngle(-30)).toBe(60);
  });

  it('erkennt Licht, das die Rückseite trifft', () => {
    expect(hitsFront(40, 0)).toBe(true);
    expect(hitsFront(80, -20)).toBe(false);
  });
});

describe('Modell: Spiegelbild am ebenen Spiegel', () => {
  it('Bild liegt gleich weit hinter dem Spiegel (b = g) und ist gleich groß', () => {
    expect(mirrorImage([-25, 18])).toEqual([25, 18]);
    expect(mirrorImage([-25, 0])).toEqual([25, 0]);
  });

  it('Auftreffpunkt: Einfallswinkel = Reflexionswinkel am Spiegel', () => {
    const obj: V2 = [-25, 18];
    const eye: V2 = [-55, 34];
    const P = reflectionPoint(obj, eye);
    expect(P[0]).toBe(0);
    // Steigungen der beiden Teilstrahlen sind betragsgleich (Spiegel senkrecht)
    const s1 = (P[1] - obj[1]) / (P[0] - obj[0]);
    const s2 = (eye[1] - P[1]) / (eye[0] - P[0]);
    expect(s1).toBeCloseTo(-s2, 12);
  });

  it('sieht nur, was über den Spiegel ins Auge gelangt', () => {
    const eye: V2 = [-50, 32];
    expect(seesInMirror([-25, 18], eye, 4, 44)).toBe(true);
    expect(seesInMirror([-25, 0], eye, 14, 24)).toBe(false);
    expect(seesInMirror([-25, 18], eye, 14, 24)).toBe(true);
  });

  it('nötiger Spiegelteil: Gegenstandshöhe · Augenabstand / (Augenabstand + Bildabstand)', () => {
    const [lo, hi] = neededMirror([-25, 0], [-25, 18], [-55, 34]);
    expect(hi - lo).toBeCloseTo((18 * 55) / 80, 12);
    // klassisch: Ganzkörperspiegel muss halb so groß sein wie die Person (Auge = Gegenstand)
    const [a, b] = neededMirror([-60, 0], [-60, 170], [-60, 160]);
    expect(b - a).toBeCloseTo(85, 12);
  });
});

describe('Modell: Winkelspiegel', () => {
  const p = (r: number, deg: number): V2 => [r * Math.cos((deg * Math.PI) / 180), r * Math.sin((deg * Math.PI) / 180)];

  it('Spiegelung an einer Spiegelgeraden ist umkehrbar', () => {
    const q: V2 = [1.3, 4.2];
    const back = reflectAcross(reflectAcross(q, 'A', 70), 'A', 70);
    expect(back[0]).toBeCloseTo(q[0], 12);
    expect(back[1]).toBeCloseTo(q[1], 12);
  });

  it('zählt die Bilder: 360° / α − 1 bei geraden Teilern', () => {
    for (const [w, n] of [
      [90, 3],
      [60, 5],
      [45, 7],
      [180, 1],
    ] as const) {
      expect(wedgeImages(w, p(5, 97)).length, `${w}°`).toBe(n);
      expect(imageCountRule(w)).toBe(n);
    }
  });

  it('120°: auf der Winkelhalbierenden 2 Bilder, daneben 3', () => {
    expect(wedgeImages(120, p(5, 90)).length).toBe(2);
    expect(wedgeImages(120, p(5, 110)).length).toBe(3);
  });

  it('ungerade Spiegelungszahl → seitenverkehrt', () => {
    const imgs = wedgeImages(90, p(5, 110));
    expect(imgs.filter(isReversed).length).toBe(2);
    expect(imgs.filter((i) => !isReversed(i)).length).toBe(1);
  });

  it('der Lichtweg trifft die Spiegel und führt ins Auge', () => {
    const fig = p(5, 110);
    const eye = p(8, 80);
    const imgs = wedgeImages(90, fig);
    for (const img of imgs) {
      const path = lightPath(90, fig, img, eye, 10);
      expect(path, img.seq.join('')).not.toBeNull();
      expect(path!.length).toBe(img.seq.length + 2);
      expect(path![0]).toEqual(fig);
      expect(path![path!.length - 1]).toEqual(eye);
    }
  });

  it('kein Lichtweg, wenn er neben einem zu kurzen Spiegel vorbeiginge', () => {
    const fig = p(8, 100);
    const eye = p(8, 80);
    const img = wedgeImages(90, fig).find((i) => i.seq.length === 2)!;
    expect(lightPath(90, fig, img, eye, 1)).toBeNull();
    expect(inFront(eye, 'A', 90) && inFront(eye, 'B', 90)).toBe(true);
  });
});
