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
  mirrorDir,
  mirrorImage,
  mirrorNormal,
  neededMirror,
  reflectAcross,
  reflectedAngle,
  reflectionPoint,
  reflectVector,
  seesInMirror,
  wedgeImages,
  type V2,
} from '../src/simulations/physik/reflexion/model';

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const dot = (a: V2, b: V2) => a[0] * b[0] + a[1] * b[1];
const len = (a: V2) => Math.hypot(a[0], a[1]);
const angleBetween = (a: V2, b: V2) => deg(Math.acos(Math.max(-1, Math.min(1, dot(a, b) / (len(a) * len(b))))));
const sub = (a: V2, b: V2): V2 => [a[0] - b[0], a[1] - b[1]];

/** Lage zwischen den Spiegeln wie in der Simulation (Abstand r, Anteil f des Winkels von Spiegel 1 aus). */
const wedgePoint = (r: number, f: number, w: number): V2 => {
  const a = rad(90 + w / 2 - f * w);
  return [r * Math.cos(a), r * Math.sin(a)];
};

describe('Modell: Reflexion – Reflexionsgesetz', () => {
  it('misst Einfalls- und Reflexionswinkel zum Lot', () => {
    expect(incidence(40, 0)).toBe(40);
    expect(reflectedAngle(40, 0)).toBe(-40);
    expect(glancingAngle(40)).toBe(50);
    expect(glancingAngle(-25)).toBe(65);
  });

  it('dreht den reflektierten Strahl um den doppelten Winkel, wenn der Spiegel gedreht wird', () => {
    expect(incidence(40, 15)).toBe(25);
    expect(reflectedAngle(40, 15)).toBe(-10);
    for (const phi of [-30, -5, 10, 45]) expect(reflectedAngle(40, phi) - reflectedAngle(40, 0)).toBe(2 * phi);
  });

  it('erkennt, ob das Licht die spiegelnde Vorderseite trifft', () => {
    expect(hitsFront(40, 0)).toBe(true);
    expect(hitsFront(85, -10)).toBe(false);
    expect(hitsFront(-85, -10)).toBe(true);
  });

  it('liefert Richtungen von der Senkrechten aus (positiv nach links)', () => {
    const up = dirFromVertical(0);
    expect(up[0]).toBeCloseTo(0, 12);
    expect(up[1]).toBeCloseTo(1, 12);
    const left = dirFromVertical(90);
    expect(left[0]).toBeCloseTo(-1, 12);
    expect(left[1]).toBeCloseTo(0, 12);
  });

  it('spiegelt Richtungsvektoren so, dass Einfallswinkel = Reflexionswinkel', () => {
    const n: V2 = [-Math.sin(rad(20)), Math.cos(rad(20))];
    const d: V2 = [Math.cos(rad(-35)), Math.sin(rad(-35))];
    const r = reflectVector(d, n);
    expect(len(r)).toBeCloseTo(1, 12);
    expect(angleBetween([-d[0], -d[1]], n)).toBeCloseTo(angleBetween(r, n), 9);
    // Senkrechter Einfall: Licht läuft in sich zurück
    const back = reflectVector([0, -1], [0, 1]);
    expect(back[0]).toBeCloseTo(0, 12);
    expect(back[1]).toBeCloseTo(1, 12);
  });
});

describe('Modell: Reflexion – Spiegelbild', () => {
  it('liegt gleich weit hinter dem Spiegel wie der Gegenstand davor (b = g)', () => {
    expect(mirrorImage([-25, 18])).toEqual([25, 18]);
  });

  it('findet den Auftreffpunkt auf der Sehlinie zum Bildpunkt', () => {
    const eye: V2 = [-50, 32];
    const tip: V2 = [-25, 18];
    const q = reflectionPoint(tip, eye);
    expect(q[0]).toBe(0);
    expect(q[1]).toBeCloseTo(32 - 14 * (50 / 75), 12);
    // Reflexionsgesetz am Auftreffpunkt (Lot waagerecht)
    expect(angleBetween(sub(tip, q), [-1, 0])).toBeCloseTo(angleBetween(sub(eye, q), [-1, 0]), 9);
  });

  it('braucht für die ganze Kerze nur den Teil h · e / (e + g) des Spiegels', () => {
    const [lo, hi] = neededMirror([-25, 0], [-25, 18], [-50, 32]);
    expect(lo).toBeCloseTo(32 / 3, 12);
    expect(hi - lo).toBeCloseTo((18 * 50) / 75, 12);
  });

  it('Ganzkörperspiegel: halbe Körpergröße genügt – unabhängig vom Abstand', () => {
    for (const d of [30, 100, 250]) {
      const [lo, hi] = neededMirror([-d, 0], [-d, 175], [-d, 163]);
      expect(lo).toBeCloseTo(163 / 2, 9);
      expect(hi).toBeCloseTo((175 + 163) / 2, 9);
      expect(hi - lo).toBeCloseTo(175 / 2, 9);
    }
  });

  it('prüft, ob das Auge einen Punkt im Spiegel sieht', () => {
    const eye: V2 = [-50, 32];
    expect(seesInMirror([-25, 18], eye, 4, 44)).toBe(true);
    expect(seesInMirror([-25, 0], eye, 14, 24)).toBe(false);
    expect(seesInMirror([-25, 18], eye, 14, 24)).toBe(true);
    // Gegenstand hinter dem Spiegel: nicht sichtbar
    expect(seesInMirror([5, 18], eye, 0, 50)).toBe(false);
  });
});

describe('Modell: Reflexion – Winkelspiegel', () => {
  it('stellt die Spiegel symmetrisch zur Senkrechten mit Normalen nach innen', () => {
    const a = mirrorDir('A', 90);
    expect(a[0]).toBeCloseTo(-Math.SQRT1_2, 12);
    expect(a[1]).toBeCloseTo(Math.SQRT1_2, 12);
    expect(dot(a, mirrorNormal('A', 90))).toBeCloseTo(0, 12);
    expect(inFront([0, 5], 'A', 90)).toBe(true);
    expect(inFront([0, 5], 'B', 90)).toBe(true);
    expect(inFront([-5, 0], 'A', 90)).toBe(false);
  });

  it('spiegelt Punkte an der Spiegelgeraden (Abstand vom Scharnier bleibt gleich)', () => {
    const p: V2 = [1, 4];
    const q = reflectAcross(p, 'A', 90);
    expect(len(q)).toBeCloseTo(len(p), 12);
    // Spiegel 1 liegt bei 90°-Öffnung auf y = −x
    expect(q[0]).toBeCloseTo(-4, 12);
    expect(q[1]).toBeCloseTo(-1, 12);
  });

  it('zählt die Bilder: 360° : φ − 1, wenn 360° : φ gerade ist', () => {
    for (const [w, n] of [
      [180, 1],
      [120, 2],
      [90, 3],
      [72, 4],
      [60, 5],
      [45, 7],
      [40, 8],
      [36, 9],
      [30, 11],
    ] as [number, number][]) {
      if ((360 / w) % 2 === 0) expect(imageCountRule(w)).toBe(n);
      // auf der Winkelhalbierenden gilt die Regel immer
      expect(wedgeImages(w, wedgePoint(5, 0.5, w))).toHaveLength(n);
      if ((360 / w) % 2 === 0) expect(wedgeImages(w, wedgePoint(5, 0.27, w))).toHaveLength(n);
    }
  });

  it('ungerades 360° : φ – abseits der Winkelhalbierenden ein Bild mehr', () => {
    expect(wedgeImages(120, wedgePoint(5, 0.3, 120))).toHaveLength(3);
    expect(wedgeImages(72, wedgePoint(5, 0.36, 72))).toHaveLength(5);
  });

  it('legt alle Bilder auf den Kreis um das Scharnier und erkennt seitenverkehrte', () => {
    const p = wedgePoint(4.5, 0.4, 60);
    const imgs = wedgeImages(60, p);
    for (const img of imgs) expect(len(img.pos)).toBeCloseTo(4.5, 9);
    const odd = imgs.filter((i) => isReversed(i)).length;
    expect(odd).toBe(3);
    expect(imgs.filter((i) => !isReversed(i))).toHaveLength(2);
  });

  it('kennt bei 90° beide Wege zum gegenüberliegenden Bild', () => {
    const imgs = wedgeImages(90, wedgePoint(5, 0.36, 90));
    const twice = imgs.find((i) => i.seq.length === 2)!;
    expect(twice.alts.map((s) => s.join(''))).toEqual(expect.arrayContaining(['AB', 'BA']));
    // Drehung um 180°: Bild gegenüber der Figur
    const p = wedgePoint(5, 0.36, 90);
    expect(twice.pos[0]).toBeCloseTo(-p[0], 9);
    expect(twice.pos[1]).toBeCloseTo(-p[1], 9);
  });

  it('konstruiert den Lichtweg über den Spiegel ins Auge (Reflexionsgesetz am Auftreffpunkt)', () => {
    const w = 90;
    const p = wedgePoint(5, 0.36, w);
    const eye = wedgePoint(8.4, 0.62, w);
    const imgs = wedgeImages(w, p);
    const one = imgs.find((i) => i.seq.join('') === 'A')!;
    const path = lightPath(w, p, one, eye, 10)!;
    expect(path.pts).toHaveLength(3);
    const [, q, e] = path.pts as [V2, V2, V2];
    expect(e).toEqual(eye);
    // q liegt auf Spiegel 1, und die Winkel zur Normalen sind gleich
    const u = mirrorDir('A', w);
    expect(Math.abs(u[0] * q[1] - u[1] * q[0])).toBeCloseTo(0, 9);
    const n = mirrorNormal('A', w);
    expect(angleBetween(sub(p, q), n)).toBeCloseTo(angleBetween(sub(eye, q), n), 9);
    // Das Auge blickt in Richtung des Bildes
    const toImg = sub(one.pos, eye);
    const toQ = sub(q, eye);
    expect(Math.abs(toImg[0] * toQ[1] - toImg[1] * toQ[0])).toBeCloseTo(0, 9);
  });

  it('nimmt beim flachen Spiegel (180°) den Weg über die passende Spiegelhälfte', () => {
    const p: V2 = [3, 2];
    const eye: V2 = [4, 6];
    const [img] = wedgeImages(180, p);
    expect(img!.pos[0]).toBeCloseTo(3, 9);
    expect(img!.pos[1]).toBeCloseTo(-2, 9);
    const path = lightPath(180, p, img!, eye, 10);
    expect(path).not.toBeNull();
    expect(path!.seq).toEqual(['B']);
    expect(path!.pts[1]![0]).toBeCloseTo(3.25, 9);
  });

  it('meldet, wenn der Weg am kurzen Spiegel vorbeiginge', () => {
    const w = 90;
    const p = wedgePoint(5, 0.36, w);
    const eye = wedgePoint(8.4, 0.62, w);
    const one = wedgeImages(w, p).find((i) => i.seq.join('') === 'A')!;
    expect(lightPath(w, p, one, eye, 1)).toBeNull();
  });
});
