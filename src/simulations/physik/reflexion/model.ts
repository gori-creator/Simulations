/**
 * Rechenlogik „Reflexion am ebenen Spiegel“.
 *
 * Teil 1: Reflexionsgesetz auf der optischen Scheibe (Winkel in Grad, von
 * der Senkrechten aus gemessen, positiv nach links).
 * Teil 2: Spiegelbild eines Gegenstands vor einem senkrechten Spiegel bei
 * x = 0 (Längen in cm, der Gegenstand steht links vom Spiegel bei x < 0).
 * Teil 3: Winkelspiegel aus zwei Spiegeln, die sich im Ursprung treffen.
 */

export type V2 = [number, number];

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const dot = (a: V2, b: V2) => a[0] * b[0] + a[1] * b[1];
const cross = (a: V2, b: V2) => a[0] * b[1] - a[1] * b[0];

/* ------------------------------------------------------------------ */
/* Reflexionsgesetz                                                    */
/* ------------------------------------------------------------------ */

/**
 * Einfallswinkel α (mit Vorzeichen) zwischen einfallendem Strahl und Lot.
 * `laser`: Richtung, aus der das Licht kommt (Winkel zur Senkrechten),
 * `tilt`: Drehung des Spiegels (und damit des Lots) gegen die Waagerechte.
 */
export function incidence(laser: number, tilt: number): number {
  return laser - tilt;
}

/** Trifft das Licht die spiegelnde Vorderseite? (|α| < 90°) */
export function hitsFront(laser: number, tilt: number): boolean {
  return Math.abs(incidence(laser, tilt)) < 90;
}

/**
 * Richtung des reflektierten Strahls (Winkel zur Senkrechten, positiv nach
 * links): spiegelbildlich zum einfallenden Strahl bezüglich des Lots.
 * Dreht man den Spiegel um φ, dreht sich der reflektierte Strahl um 2φ.
 */
export function reflectedAngle(laser: number, tilt: number): number {
  return 2 * tilt - laser;
}

/** Winkel zwischen Strahl und Spiegelfläche (nicht zum Lot!). */
export function glancingAngle(alpha: number): number {
  return 90 - Math.abs(alpha);
}

/** Richtungsvektor zu einem Winkel von der Senkrechten (positiv nach links). */
export function dirFromVertical(angleDeg: number): V2 {
  return [-Math.sin(rad(angleDeg)), Math.cos(rad(angleDeg))];
}

/** Reflexion eines Richtungsvektors an einer Fläche mit Normale n (Einheitsvektor). */
export function reflectVector(d: V2, n: V2): V2 {
  const k = 2 * dot(d, n);
  return [d[0] - k * n[0], d[1] - k * n[1]];
}

/* ------------------------------------------------------------------ */
/* Spiegelbild am senkrechten Spiegel (x = 0)                          */
/* ------------------------------------------------------------------ */

/** Bildpunkt: gleich weit hinter dem Spiegel wie der Gegenstand davor (b = g). */
export function mirrorImage(p: V2): V2 {
  return [-p[0], p[1]];
}

/**
 * Auftreffpunkt auf dem Spiegel für Licht, das von `p` über den Spiegel ins
 * Auge `eye` gelangt: Schnitt der Sehlinie Auge → Bildpunkt mit dem Spiegel.
 */
export function reflectionPoint(p: V2, eye: V2): V2 {
  const img = mirrorImage(p);
  const t = (0 - eye[0]) / (img[0] - eye[0]);
  return [0, eye[1] + (img[1] - eye[1]) * t];
}

/** Sieht das Auge den Punkt `p` im Spiegel, der von y = bottom bis y = top reicht? */
export function seesInMirror(p: V2, eye: V2, bottom: number, top: number): boolean {
  if (p[0] >= 0 || eye[0] >= 0) return false;
  const y = reflectionPoint(p, eye)[1];
  return y >= bottom - 1e-9 && y <= top + 1e-9;
}

/**
 * Welcher Teil des Spiegels wird gebraucht, damit das Auge den ganzen
 * Gegenstand (von `foot` bis `tip`) sieht? Rückgabe [unten, oben].
 */
export function neededMirror(foot: V2, tip: V2, eye: V2): [number, number] {
  const a = reflectionPoint(foot, eye)[1];
  const b = reflectionPoint(tip, eye)[1];
  return [Math.min(a, b), Math.max(a, b)];
}

/* ------------------------------------------------------------------ */
/* Winkelspiegel                                                       */
/* ------------------------------------------------------------------ */

export type MirrorId = 'A' | 'B';

/** Richtung der beiden Spiegel (Halbgeraden vom Scharnier im Ursprung) bei Öffnungswinkel w. */
export function mirrorDir(id: MirrorId, w: number): V2 {
  const a = id === 'A' ? 90 + w / 2 : 90 - w / 2;
  return [Math.cos(rad(a)), Math.sin(rad(a))];
}

/** Normale der spiegelnden Seite (zeigt in den Raum zwischen den Spiegeln). */
export function mirrorNormal(id: MirrorId, w: number): V2 {
  const h = rad(w / 2);
  return id === 'A' ? [Math.cos(h), Math.sin(h)] : [-Math.cos(h), Math.sin(h)];
}

/** Liegt p vor der spiegelnden Seite des Spiegels? */
export function inFront(p: V2, id: MirrorId, w: number): boolean {
  return dot(p, mirrorNormal(id, w)) > 1e-9;
}

/** Spiegelung eines Punktes an der Geraden des Spiegels. */
export function reflectAcross(p: V2, id: MirrorId, w: number): V2 {
  const u = mirrorDir(id, w);
  const k = 2 * dot(p, u);
  return [k * u[0] - p[0], k * u[1] - p[1]];
}

export interface MirrorImage {
  pos: V2;
  /** Reihenfolge der Spiegel, an denen das Licht reflektiert wird (vom Gegenstand aus). */
  seq: MirrorId[];
  /**
   * Alle Spiegelfolgen, die zu diesem Bild führen (z. B. bei 90° „1 dann 2“
   * und „2 dann 1“ für dasselbe Bild). Die erste ist `seq`.
   */
  alts: MirrorId[][];
}

/**
 * Alle Bilder im Winkelspiegel: Ein Bild entsteht durch Spiegelung an einem
 * Spiegel, solange der zu spiegelnde Punkt vor dessen spiegelnder Seite
 * liegt; danach ist der andere Spiegel an der Reihe. Fallen zwei Bilder
 * zusammen (z. B. bei 90°), werden sie nur einmal gezählt.
 */
export function wedgeImages(w: number, p: V2): MirrorImage[] {
  const out: MirrorImage[] = [];
  for (const start of ['A', 'B'] as MirrorId[]) {
    let q: V2 = p;
    let m: MirrorId = start;
    const seq: MirrorId[] = [];
    for (let k = 0; k < 60; k++) {
      if (!inFront(q, m, w)) break;
      q = reflectAcross(q, m, w);
      seq.push(m);
      const dup = out.find((o) => Math.hypot(o.pos[0] - q[0], o.pos[1] - q[1]) < 1e-6);
      if (dup) dup.alts.push([...seq]);
      else out.push({ pos: q, seq: [...seq], alts: [[...seq]] });
      m = m === 'A' ? 'B' : 'A';
    }
  }
  return out;
}

/** Faustregel für die Anzahl der Bilder: 360° / w − 1 (genau, wenn 360° / w eine gerade Zahl ist). */
export function imageCountRule(w: number): number {
  return 360 / w - 1;
}

/**
 * Lichtweg vom Gegenstand über die Spiegel ins Auge für ein Bild (oder
 * `null`, wenn das Auge dieses Bild nicht sehen kann, weil der Weg neben
 * einem Spiegel der Länge `len` vorbeiginge). Führen mehrere Spiegelfolgen
 * zum selben Bild, wird die erste genommen, deren Weg möglich ist.
 */
export function lightPath(w: number, p: V2, img: MirrorImage, eye: V2, len: number): { pts: V2[]; seq: MirrorId[] } | null {
  for (const seq of img.alts.length ? img.alts : [img.seq]) {
    const pts = pathFor(w, p, seq, eye, len);
    if (pts) return { pts, seq };
  }
  return null;
}

/** Lichtweg für eine bestimmte Spiegelfolge (siehe `lightPath`). */
export function pathFor(w: number, p: V2, seq: MirrorId[], eye: V2, len: number): V2[] | null {
  // Zwischenbilder I0 = Gegenstand, I1 … Ik
  const imgs: V2[] = [p];
  for (const m of seq) imgs.push(reflectAcross(imgs[imgs.length - 1]!, m, w));
  if (!inFront(eye, 'A', w) || !inFront(eye, 'B', w)) return null;
  const pts: V2[] = [eye];
  let from: V2 = eye;
  for (let j = seq.length; j >= 1; j--) {
    const m = seq[j - 1]!;
    const u = mirrorDir(m, w);
    const target = imgs[j]!;
    const d: V2 = [target[0] - from[0], target[1] - from[1]];
    const den = cross(u, d);
    if (Math.abs(den) < 1e-12) return null;
    const s = -cross(u, from) / den;
    if (s <= 1e-9 || s >= 1 - 1e-9) return null;
    const q: V2 = [from[0] + s * d[0], from[1] + s * d[1]];
    const t = dot(q, u);
    if (t < 0 || t > len) return null;
    pts.push(q);
    from = q;
  }
  pts.push(p);
  return pts.reverse();
}

/** Ist das Bild seitenverkehrt? (ungerade Zahl von Spiegelungen) */
export function isReversed(img: MirrorImage): boolean {
  return img.seq.length % 2 === 1;
}

/** Winkel in Grad (Hilfsfunktion für Anzeigen). */
export function angleOf(v: V2): number {
  return deg(Math.atan2(v[1], v[0]));
}
