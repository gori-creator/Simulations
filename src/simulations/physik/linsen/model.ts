/**
 * Rechenlogik „Linsen und Bildentstehung“ (dünne Linse, achsennahe Strahlen).
 *
 * Längen in cm. Die Linse steht bei x = 0, der Gegenstand links bei x = −g
 * (Gegenstandsweite g > 0). Brennweite f > 0: Sammellinse, f < 0:
 * Zerstreuungslinse. Vorzeichen wie im Unterricht: Bildweite b > 0 bedeutet
 * ein reelles Bild rechts der Linse, b < 0 ein virtuelles Bild links.
 * Bildgröße B mit Vorzeichen: B > 0 aufrecht, B < 0 umgekehrt.
 */

export type V2 = [number, number];

const EPS = 1e-9;

/** Bildweite aus der Linsengleichung 1/f = 1/g + 1/b; `null`, wenn g = f (kein Bild, die Strahlen laufen parallel). */
export function imageDistance(f: number, g: number): number | null {
  if (Math.abs(g - f) < EPS) return null;
  return (f * g) / (g - f);
}

/** Bildgröße mit Vorzeichen: B = −G · b / g (negativ: umgekehrt). */
export function imageHeight(f: number, g: number, G: number): number | null {
  const b = imageDistance(f, g);
  return b === null ? null : (-G * b) / g;
}

/** Abbildungsmaßstab B : G = |b| : g (Beträge). */
export function scaleRatio(f: number, g: number): number | null {
  const b = imageDistance(f, g);
  return b === null ? null : Math.abs(b) / g;
}

export interface ImageInfo {
  /** Bildweite (null: kein Bild). */
  b: number | null;
  /** Bildgröße mit Vorzeichen (null: kein Bild). */
  B: number | null;
  kind: 'real' | 'virtual' | 'none';
  upright: boolean;
  size: 'larger' | 'smaller' | 'same' | 'none';
}

/** Eigenschaften des Bildes: reell/virtuell, aufrecht/umgekehrt, vergrößert/verkleinert. */
export function describeImage(f: number, g: number, G: number): ImageInfo {
  const b = imageDistance(f, g);
  if (b === null) return { b: null, B: null, kind: 'none', upright: false, size: 'none' };
  const B = (-G * b) / g;
  const m = Math.abs(b) / g;
  return {
    b,
    B,
    kind: b > 0 ? 'real' : 'virtual',
    upright: B > 0,
    size: Math.abs(m - 1) < 1e-6 ? 'same' : m > 1 ? 'larger' : 'smaller',
  };
}

/** Brechung an der dünnen Linse: Steigung nach der Linse für einen Strahl, der sie in der Höhe y mit der Steigung `slope` trifft. */
export function refract(y: number, slope: number, f: number): number {
  return slope - y / f;
}

export type RayId = 'par' | 'mid' | 'foc';

/** Ein Strahl vom Gegenstandspunkt (−g, G) zur Linse und weiter. */
export interface Ray {
  id: RayId;
  /** Höhe, in der der Strahl die Mittelebene der Linse trifft. */
  hit: number;
  slopeIn: number;
  slopeOut: number;
}

/**
 * Die drei Konstruktionsstrahlen vom Punkt (−g, G):
 * Parallelstrahl (wird zum Brennpunktstrahl), Mittelpunktstrahl (geht
 * ungebrochen durch die Linsenmitte) und Brennpunktstrahl (läuft danach
 * parallel zur Achse). Bei g = f fehlt der Brennpunktstrahl.
 */
export function constructionRays(f: number, g: number, G: number): Ray[] {
  const rays: Ray[] = [
    { id: 'par', hit: G, slopeIn: 0, slopeOut: refract(G, 0, f) },
    { id: 'mid', hit: 0, slopeIn: -G / g, slopeOut: -G / g },
  ];
  if (Math.abs(f - g) > EPS) {
    // Steigung so, dass der Strahl nach der Linse parallel läuft: m − (G + m·g)/f = 0
    const m = G / (f - g);
    const y = G + m * g;
    rays.push({ id: 'foc', hit: y, slopeIn: m, slopeOut: refract(y, m, f) });
  }
  return rays;
}

/** Ein beliebiger Strahl vom Punkt (−g, y0), der die Linse in der Höhe `hit` trifft. */
export function rayThrough(f: number, g: number, y0: number, hit: number): Ray {
  const slopeIn = (hit - y0) / g;
  return { id: 'mid', hit, slopeIn, slopeOut: refract(hit, slopeIn, f) };
}

/** Höhe eines Strahls bei x (x ≥ 0: nach der Linse, x ≤ 0: davor bzw. rückwärts verlängert). */
export function rayY(r: Ray, x: number): number {
  return r.hit + r.slopeOut * x;
}

/** Bereich der Gegenstandsweite – entscheidet über Art und Größe des Bildes. */
export type Zone = 'far' | 'twice' | 'mid' | 'focal' | 'near' | 'diverging';

export function zoneOf(f: number, g: number): Zone {
  if (f < 0) return 'diverging';
  const tol = 1e-6;
  if (Math.abs(g - 2 * f) < tol) return 'twice';
  if (Math.abs(g - f) < tol) return 'focal';
  if (g > 2 * f) return 'far';
  if (g > f) return 'mid';
  return 'near';
}

/**
 * Radius des Unschärfekreises auf einem Schirm im Abstand s hinter der Linse,
 * wenn die Linse mit dem Radius `a` geöffnet ist (Blende). Das Lichtbündel
 * eines Gegenstandspunkts läuft im Bildpunkt zusammen und dahinter wieder
 * auseinander (ähnliche Dreiecke).
 */
export function blurRadius(a: number, s: number, b: number | null): number {
  if (b === null) return a; // parallele Strahlen
  if (b > 0) return (a * Math.abs(s - b)) / b;
  return (a * (s - b)) / -b; // virtuelles Bild: Bündel läuft auseinander
}

/** Maßstab des (auch unscharfen) Schirmbildes: Der Strahl durch die Linsenmitte trifft den Schirm bei −y · s / g. */
export function screenScale(s: number, g: number): number {
  return s / g;
}

/** Gilt das Schirmbild als scharf? (Unschärfekreis kleiner als `tol`.) */
export function isSharp(a: number, s: number, b: number | null, tol = 0.15): boolean {
  return b !== null && b > 0 && blurRadius(a, s, b) <= tol;
}

/** Brechkraft in Dioptrien (Brennweite in cm). */
export function power(fCm: number): number {
  return 100 / fCm;
}
