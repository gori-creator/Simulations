/**
 * Rechenlogik „Licht und Schatten“.
 *
 * Teil 1 (Versuch auf der optischen Bank): Eine Lampe beleuchtet eine runde
 * Scheibe (Gegenstand), dahinter steht ein Schirm. Lampe und Scheibe sind
 * Kreisscheiben parallel zum Schirm; eine punktförmige Lampe hat den Radius 0.
 * Längen in cm, x-Achse entlang der optischen Bank, y nach oben, z zum
 * Betrachter.
 *
 * Teil 2 (Sonnen- und Mondfinsternis): schematisches, nicht maßstäbliches
 * Modell von Sonne, Erde und Mond in der Bahnebene (Blick von oben).
 */

/* ------------------------------------------------------------------ */
/* Allgemeine Geometrie                                                */
/* ------------------------------------------------------------------ */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Fläche der Schnittmenge zweier Kreise mit den Radien r1, r2 und dem Mittelpunktsabstand d. */
export function circleOverlap(r1: number, r2: number, d: number): number {
  if (r1 <= 0 || r2 <= 0) return 0;
  if (d >= r1 + r2) return 0;
  if (d <= Math.abs(r1 - r2)) return Math.PI * Math.min(r1, r2) ** 2;
  // halbe Öffnungswinkel der beiden Kreisabschnitte
  const a1 = Math.acos(Math.min(1, Math.max(-1, (d * d + r1 * r1 - r2 * r2) / (2 * d * r1))));
  const a2 = Math.acos(Math.min(1, Math.max(-1, (d * d + r2 * r2 - r1 * r1) / (2 * d * r2))));
  return r1 * r1 * (a1 - Math.sin(2 * a1) / 2) + r2 * r2 * (a2 - Math.sin(2 * a2) / 2);
}

/**
 * Sichtbarer Anteil einer leuchtenden Kreisscheibe (Radius R) hinter einer
 * verdeckenden Kreisscheibe (Radius r) im Mittelpunktsabstand d – beide in
 * derselben Ebene oder als Winkelgrößen am Himmel. Eine punktförmige
 * Lichtquelle (R = 0) ist entweder ganz sichtbar (1) oder ganz verdeckt (0).
 */
export function visibleFraction(R: number, r: number, d: number): number {
  if (R <= 1e-9) return d < r ? 0 : 1;
  return clamp01(1 - circleOverlap(R, r, d) / (Math.PI * R * R));
}

/* ------------------------------------------------------------------ */
/* Versuch: Lampe – Scheibe – Schirm                                   */
/* ------------------------------------------------------------------ */

/** Leuchtende Kreisscheibe (Lampe) oder verdeckende Kreisscheibe (Gegenstand), parallel zum Schirm. */
export interface Disc {
  /** Lage auf der optischen Bank in cm. */
  x: number;
  /** Höhe des Mittelpunkts über der optischen Achse in cm. */
  y: number;
  /** Radius in cm (Lampe: 0 = punktförmig). */
  r: number;
}

/**
 * Wie viel Licht der Lampe kommt im Punkt (px, py, pz) an (0 … 1)?
 * Dazu wird die Scheibe vom Punkt aus auf die Ebene der Lampe projiziert
 * (Zentralprojektion zwischen parallelen Ebenen: aus dem Kreis wird wieder
 * ein Kreis) und mit der Lampenscheibe verglichen.
 */
export function litFraction(lamp: Disc, blocker: Disc, px: number, py: number, pz = 0): number {
  if (px <= blocker.x || blocker.x <= lamp.x) return 1;
  const k = (px - lamp.x) / (px - blocker.x);
  const qy = py + (blocker.y - py) * k;
  const qz = pz - pz * k;
  return visibleFraction(lamp.r, blocker.r * k, Math.hypot(qy - lamp.y, qz));
}

/** Höhe y an der Stelle x auf dem Strahl durch die Punkte (x1 | y1) und (x2 | y2). */
export function rayY(x1: number, y1: number, x2: number, y2: number, x: number): number {
  return y1 + ((y2 - y1) * (x - x1)) / (x2 - x1);
}

export interface Interval {
  lo: number;
  hi: number;
}

export interface ScreenShadow {
  /** Kernschatten auf dem Schirm (kein Licht der Lampe) oder `null`. */
  umbra: Interval | null;
  /** Gesamter Schatten einschließlich Halbschatten (äußere Grenze). */
  outer: Interval;
  /** Hinter der Spitze des Kernschattenkegels: in der Mitte nur Halbschatten. */
  beyondApex: boolean;
  /** Lage der Spitze des Kernschattenkegels (nur wenn die Lampe größer ist als der Gegenstand). */
  apex: number | null;
}

/**
 * Schatten der Scheibe auf einem Schirm an der Stelle `screenX` (Schnitt in
 * der Zeichenebene). Die Grenzen entstehen durch Randstrahlen:
 * oberer Lampenrand → oberer Scheibenrand (Kernschatten oben),
 * unterer Lampenrand → oberer Scheibenrand (Halbschatten oben) usw.
 */
export function shadowOnScreen(lamp: Disc, blocker: Disc, screenX: number): ScreenShadow {
  const R = lamp.r;
  const r = blocker.r;
  const at = (ls: number, bs: number) => rayY(lamp.x, lamp.y + ls * R, blocker.x, blocker.y + bs * r, screenX);
  const uHi = at(1, 1);
  const uLo = at(-1, -1);
  const outer = { lo: at(1, -1), hi: at(-1, 1) };
  const apex = R > r ? lamp.x + ((blocker.x - lamp.x) * R) / (R - r) : null;
  const umbra = uHi > uLo + 1e-9 ? { lo: uLo, hi: uHi } : null;
  return { umbra, outer, beyondApex: umbra === null && R > 0, apex };
}

/**
 * Schattengröße bei punktförmiger Lampe (Strahlensatz):
 * S / G = (Abstand Lampe–Schirm) / (Abstand Lampe–Gegenstand).
 */
export function pointShadowSize(objectSize: number, lampToObject: number, lampToScreen: number): number {
  return (objectSize * lampToScreen) / lampToObject;
}

/** Schnitt zweier Intervalle (oder `null`). */
export function intersect(a: Interval | null, b: Interval | null): Interval | null {
  if (!a || !b) return null;
  const lo = Math.max(a.lo, b.lo);
  const hi = Math.min(a.hi, b.hi);
  return hi > lo ? { lo, hi } : null;
}

/* ------------------------------------------------------------------ */
/* Additive Farbmischung farbiger Lampen                               */
/* ------------------------------------------------------------------ */

export type RGB = readonly [number, number, number];

/**
 * Farbe des Lichts an einer Stelle: Summe der Lampenfarben, jeweils mit dem
 * Anteil, der dort ankommt (additive Farbmischung, z. B. Rot + Grün = Gelb).
 */
export function mixLight(colors: readonly RGB[], fractions: readonly number[]): [number, number, number] {
  const out: [number, number, number] = [0, 0, 0];
  colors.forEach((c, i) => {
    const f = fractions[i] ?? 0;
    out[0] += c[0] * f;
    out[1] += c[1] * f;
    out[2] += c[2] * f;
  });
  return [Math.min(1, out[0]), Math.min(1, out[1]), Math.min(1, out[2])];
}

/* ------------------------------------------------------------------ */
/* Sonne, Erde, Mond (schematisch)                                     */
/* ------------------------------------------------------------------ */

/**
 * Schematische Maße (nicht maßstäblich!). Wichtig ist nur: Sonne und Mond
 * erscheinen von der Erde aus ungefähr gleich groß, der Kernschatten des
 * Mondes reicht gerade bis zur Erde, und der Kernschatten der Erde ist am
 * Ort des Mondes etwa doppelt so breit wie der Mond.
 */
export const SPACE = {
  sunX: -110,
  sunR: 16,
  earthR: 6,
  orbitR: 20,
  moonR: 2.4,
} as const;

export type Vec3 = [number, number, number];

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export const SUN: Vec3 = [SPACE.sunX, 0, 0];
export const EARTH: Vec3 = [0, 0, 0];

/**
 * Lage des Mondes. `pos` ist der Winkel (in Grad) zwischen den Richtungen
 * Erde → Sonne und Erde → Mond, gezählt in Umlaufrichtung (von oben gesehen
 * gegen den Uhrzeigersinn): 0° Neumond, 90° erstes Viertel, 180° Vollmond.
 */
export function moonPosition(pos: number): Vec3 {
  const a = ((180 + pos) * Math.PI) / 180;
  return [SPACE.orbitR * Math.cos(a), SPACE.orbitR * Math.sin(a), 0];
}

/**
 * Ort des Beobachters auf der Erdoberfläche. `ob` ist der Winkel (in Grad)
 * vom Punkt, an dem die Sonne senkrecht steht (Mittag); positiv in
 * Drehrichtung der Erde, also später am Tag (15° ≙ 1 Stunde).
 */
export function observerPosition(ob: number): Vec3 {
  const a = ((180 + ob) * Math.PI) / 180;
  return [SPACE.earthR * Math.cos(a), SPACE.earthR * Math.sin(a), 0];
}

/** Ungefähre Ortszeit des Beobachters in Stunden (12 = Mittag). */
export function localTime(ob: number): number {
  return 12 + ob / 15;
}

/** Winkelradius einer Kugel (Radius r, Mittelpunkt c) vom Punkt p aus gesehen (Bogenmaß). */
export function angularRadius(c: Vec3, r: number, p: Vec3): number {
  const d = len(sub(c, p));
  return d <= r ? Math.PI / 2 : Math.asin(r / d);
}

/** Winkel zwischen den Blickrichtungen von p zu a und zu b (Bogenmaß). */
export function angleBetween(a: Vec3, b: Vec3, p: Vec3): number {
  const u = sub(a, p);
  const v = sub(b, p);
  const c = dot(u, v) / (len(u) * len(v));
  return Math.acos(Math.min(1, Math.max(-1, c)));
}

/**
 * Wie viel Sonnenlicht kommt im Punkt p an, wenn ein Körper (Mittelpunkt c,
 * Radius r) davor stehen kann? Sonne und Körper werden als Scheiben am Himmel
 * verglichen (Winkelradien), 1 = volles Sonnenlicht, 0 = Kernschatten.
 */
export function sunlightAt(p: Vec3, c: Vec3, r: number): number {
  const toSun = len(sub(SUN, p));
  const toBody = len(sub(c, p));
  if (toBody >= toSun) return 1;
  return visibleFraction(angularRadius(SUN, SPACE.sunR, p), angularRadius(c, r, p), angleBetween(SUN, c, p));
}

export type SolarKind = 'none' | 'partial' | 'total' | 'annular';

export interface SolarView {
  /** Winkelradius der Sonne und des Mondes (Bogenmaß). */
  sunR: number;
  moonR: number;
  /** Abstand der Scheibenmitten am Himmel, mit Vorzeichen (positiv: Mond rechts der Sonne). */
  offset: number;
  /** Bedeckter Anteil der Sonnenscheibe (0 … 1). */
  covered: number;
  kind: SolarKind;
}

/** Was sieht ein Beobachter auf der Erde, wenn er zur Sonne blickt? */
export function solarView(pos: number, ob: number): SolarView {
  const o = observerPosition(ob);
  const m = moonPosition(pos);
  const sunR = angularRadius(SUN, SPACE.sunR, o);
  const moonR = angularRadius(m, SPACE.moonR, o);
  const angS = Math.atan2(SUN[1] - o[1], SUN[0] - o[0]);
  const angM = Math.atan2(m[1] - o[1], m[0] - o[0]);
  let delta = angM - angS;
  delta = Math.atan2(Math.sin(delta), Math.cos(delta));
  // Blickrichtung zur Sonne, „oben“ senkrecht zur Bahnebene: rechts liegt im Uhrzeigersinn.
  const offset = -delta;
  const d = Math.abs(delta);
  // Mond hinter dem Beobachter oder weit weg von der Sonne: keine Finsternis
  const behind = Math.cos(delta) <= 0;
  const covered = behind ? 0 : 1 - visibleFraction(sunR, moonR, d);
  let kind: SolarKind = 'none';
  if (!behind && d < sunR + moonR) {
    if (d <= moonR - sunR) kind = 'total';
    else if (d <= sunR - moonR) kind = 'annular';
    else kind = 'partial';
  }
  return { sunR, moonR, offset, covered, kind };
}

/** Steht die Sonne für den Beobachter über dem Horizont (Tagseite)? */
export function sunUp(ob: number): boolean {
  return Math.abs(ob) < 90;
}

export interface ShadowCone {
  /** Halber Öffnungswinkel des Kernschattenkegels (Bogenmaß). */
  umbraAngle: number;
  /** Abstand der Kegelspitze vom Mittelpunkt des Körpers. */
  umbraLength: number;
  /** Halber Öffnungswinkel des Halbschattenkegels (Bogenmaß). */
  penumbraAngle: number;
  /** Abstand des (gedachten) Scheitels des Halbschattenkegels vor dem Körper. */
  penumbraBack: number;
}

/**
 * Schattenkegel einer Kugel (Radius rb) im Licht einer größeren Kugel
 * (Radius rs) im Mittelpunktsabstand D: äußere gemeinsame Tangenten begrenzen
 * den Kernschatten, innere den Halbschatten.
 */
export function shadowCone(rs: number, rb: number, D: number): ShadowCone {
  const su = (rs - rb) / D;
  const sp = (rs + rb) / D;
  const umbraAngle = Math.asin(Math.max(1e-9, su));
  const penumbraAngle = Math.asin(Math.min(1, sp));
  return { umbraAngle, umbraLength: rb / Math.sin(umbraAngle), penumbraAngle, penumbraBack: rb / Math.sin(penumbraAngle) };
}

/** Radius des Kern- bzw. Halbschattens im Abstand x hinter dem Mittelpunkt des Körpers. */
export function coneRadii(cone: ShadowCone, x: number): { umbra: number; penumbra: number } {
  return {
    umbra: Math.max(0, (cone.umbraLength - x) * Math.tan(cone.umbraAngle)),
    penumbra: (x + cone.penumbraBack) * Math.tan(cone.penumbraAngle),
  };
}

export type LunarKind = 'none' | 'penumbral' | 'partial' | 'total';

/** Steht der Mond (ganz oder teilweise) im Schatten der Erde? */
export function lunarEclipse(pos: number): { kind: LunarKind; umbraR: number; penumbraR: number; offset: number } {
  const m = moonPosition(pos);
  const cone = shadowCone(SPACE.sunR, SPACE.earthR, -SPACE.sunX);
  const { umbra, penumbra } = coneRadii(cone, m[0]);
  const offset = Math.abs(m[1]);
  let kind: LunarKind = 'none';
  if (m[0] > 0) {
    if (offset + SPACE.moonR <= umbra) kind = 'total';
    else if (offset - SPACE.moonR < umbra) kind = 'partial';
    else if (offset - SPACE.moonR < penumbra) kind = 'penumbral';
  }
  return { kind, umbraR: umbra, penumbraR: penumbra, offset };
}

export type PhaseId = 'new' | 'waxCrescent' | 'firstQuarter' | 'waxGibbous' | 'full' | 'wanGibbous' | 'lastQuarter' | 'wanCrescent';

/** Name der Mondphase zum Winkel `pos` (0° Neumond, 180° Vollmond). */
export function moonPhase(pos: number): PhaseId {
  const p = ((pos % 360) + 360) % 360;
  if (p < 10 || p > 350) return 'new';
  if (p < 80) return 'waxCrescent';
  if (p <= 100) return 'firstQuarter';
  if (p < 170) return 'waxGibbous';
  if (p <= 190) return 'full';
  if (p < 260) return 'wanGibbous';
  if (p <= 280) return 'lastQuarter';
  return 'wanCrescent';
}

/** Beleuchteter Anteil der von der Erde aus sichtbaren Mondscheibe (0 bei Neumond, 1 bei Vollmond). */
export function illuminatedFraction(pos: number): number {
  return (1 - Math.cos((pos * Math.PI) / 180)) / 2;
}

/** Wie sieht die Sonnenfinsternis an verschiedenen Orten der Tagseite aus? (Mittag = 0°, Schritt in Grad) */
export function solarZones(pos: number, step = 0.5): { ob: number; kind: SolarKind }[] {
  const out: { ob: number; kind: SolarKind }[] = [];
  for (let ob = -90 + step / 2; ob < 90; ob += step) out.push({ ob, kind: solarView(pos, ob).kind });
  return out;
}

export type P2 = [number, number];

/**
 * Gemeinsame Tangenten zweier Kreise (Mittelpunkte c1, c2, Radien r1, r2).
 * `outer`: beide Kreise auf derselben Seite (begrenzen den Kernschatten),
 * `inner`: Kreise auf verschiedenen Seiten (begrenzen den Halbschatten).
 * Jede Tangente als Paar der Berührpunkte [auf Kreis 1, auf Kreis 2].
 */
export function commonTangents(c1: P2, r1: number, c2: P2, r2: number): { outer: [P2, P2][]; inner: [P2, P2][] } {
  const dx = c2[0] - c1[0];
  const dy = c2[1] - c1[1];
  const D = Math.hypot(dx, dy);
  const phi = Math.atan2(dy, dx);
  const outer: [P2, P2][] = [];
  const inner: [P2, P2][] = [];
  // äußere Tangenten: n · (c2 − c1) = r2 − r1, Berührpunkte c − r · n
  const go = Math.acos(Math.min(1, Math.max(-1, (r2 - r1) / D)));
  // innere Tangenten: n · (c2 − c1) = −(r1 + r2), Berührpunkte c1 − r1 · n und c2 + r2 · n
  const gi = Math.acos(Math.min(1, Math.max(-1, -(r1 + r2) / D)));
  for (const s of [1, -1]) {
    const a = phi + s * go;
    const n: P2 = [Math.cos(a), Math.sin(a)];
    outer.push([
      [c1[0] - r1 * n[0], c1[1] - r1 * n[1]],
      [c2[0] - r2 * n[0], c2[1] - r2 * n[1]],
    ]);
    const b = phi + s * gi;
    const m: P2 = [Math.cos(b), Math.sin(b)];
    inner.push([
      [c1[0] - r1 * m[0], c1[1] - r1 * m[1]],
      [c2[0] + r2 * m[0], c2[1] + r2 * m[1]],
    ]);
  }
  return { outer, inner };
}
