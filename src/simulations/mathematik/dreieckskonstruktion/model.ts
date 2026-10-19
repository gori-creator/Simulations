/**
 * Rechenlogik „Kongruenzsätze und Dreieckskonstruktionen“ (Jahrgangsstufe 7).
 *
 * Bezeichnungen wie im Unterricht: Ecken A, B, C gegen den Uhrzeigersinn,
 * Seiten a = [BC], b = [CA], c = [AB] (jeweils der Ecke gegenüber), Winkel
 * α bei A, β bei B, γ bei C. Längen in cm, Winkel in Grad.
 *
 * Konstruiert wird immer von der Grundseite c = [AB] aus: A = (0 | 0),
 * B = (c | 0), C liegt oberhalb (y > 0).
 *
 * Kongruenzsätze: Ein Dreieck ist (bis auf Lage) eindeutig festgelegt durch
 * - SSS: drei Seiten (wenn die Dreiecksungleichung gilt),
 * - SWS: zwei Seiten und den eingeschlossenen Winkel,
 * - WSW: eine Seite und die beiden anliegenden Winkel (Summe < 180°),
 * - SsW: zwei Seiten und den Winkel, der der größeren Seite gegenüberliegt.
 * Liegt der Winkel der kleineren Seite gegenüber (SSW), gibt es keine, eine
 * oder zwei Lösungen. Drei Winkel (WWW) legen nur die Form fest, nicht die
 * Größe: ähnliche, aber nicht kongruente Dreiecke.
 *
 * Die Rechnungen (Kosinus-/Sinussatz) dienen nur der Kontrolle und dem
 * Zeichnen; in Jahrgangsstufe 7 wird konstruiert und gemessen.
 */

export type Pt = readonly [number, number];
export type Case = 'sss' | 'sws' | 'wsw' | 'ssw' | 'www';

/** Gegebene Stücke (nicht alle werden in jedem Fall benutzt). */
export interface Given {
  a: number;
  b: number;
  c: number;
  al: number;
  be: number;
}

/**
 * Ergebnis einer Konstruktion:
 * - one: genau ein Dreieck (C),
 * - two: zwei verschiedene Dreiecke (C und C2, nur bei SSW),
 * - none: kein Dreieck (mit Grund),
 * - many: unendlich viele (WWW, nur die Form ist festgelegt).
 */
export type Solution =
  | { kind: 'one'; c: Pt }
  | { kind: 'two'; c: Pt; c2: Pt }
  | { kind: 'none'; reason: NoneReason }
  | { kind: 'many'; c: Pt };

/**
 * Gründe, warum es kein Dreieck gibt:
 * - triangle: Dreiecksungleichung verletzt (Kreise erreichen sich nicht),
 * - flat: Grenzfall a + b = c (Kreise berühren sich auf der Grundseite, C läge auf [AB]),
 * - angles: α + β > 180° (Schenkel laufen auseinander),
 * - parallel: α + β = 180° (Schenkel sind parallel),
 * - short: SSW, a ist kürzer als der Abstand von B zum Schenkel,
 * - touchA: SSW mit a = c und α ≥ 90° (Kreis trifft den Schenkel nur in A).
 */
export type NoneReason = 'triangle' | 'flat' | 'angles' | 'parallel' | 'short' | 'touchA';

export const rad = (deg: number) => (deg * Math.PI) / 180;
export const deg = (r: number) => (r * 180) / Math.PI;
const EPS = 1e-9;

export function dist(p: Pt, q: Pt): number {
  return Math.hypot(q[0] - p[0], q[1] - p[1]);
}

/** Punkt auf dem Strahl von A aus unter dem Winkel `deg` zur Grundseite. */
export function onRayA(len: number, angleDeg: number): Pt {
  return [len * Math.cos(rad(angleDeg)), len * Math.sin(rad(angleDeg))];
}

/** Punkt auf dem Strahl von B = (c | 0) aus, der mit [BA] den Winkel β einschließt. */
export function onRayB(c: number, len: number, betaDeg: number): Pt {
  return [c - len * Math.cos(rad(betaDeg)), len * Math.sin(rad(betaDeg))];
}

/**
 * Überschuss der längsten Seite über die Summe der beiden anderen:
 * max(c − a − b, b − a − c, a − b − c). Negativ ⇔ Dreieck möglich,
 * 0 ⇔ Grenzfall (flaches „Dreieck“), positiv ⇔ die Kreise erreichen sich nicht.
 */
export function sssExcess(a: number, b: number, c: number): number {
  return Math.max(c - a - b, b - a - c, a - b - c);
}

/** Dreiecksungleichung (streng): Jede Seite ist kürzer als die Summe der beiden anderen. */
export function triangleInequality(a: number, b: number, c: number): boolean {
  return sssExcess(a, b, c) < -EPS;
}

/** SSS: C aus |AC| = b und |BC| = a (Schnitt der Kreise um A und B). */
export function solveSSS(a: number, b: number, c: number): Solution {
  const ex = sssExcess(a, b, c);
  if (ex >= -EPS) return { kind: 'none', reason: ex <= EPS ? 'flat' : 'triangle' };
  const x = (b * b + c * c - a * a) / (2 * c);
  const y = Math.sqrt(Math.max(0, b * b - x * x));
  return { kind: 'one', c: [x, y] };
}

/** SWS: c, α und b; C liegt auf dem freien Schenkel von α im Abstand b von A. */
export function solveSWS(b: number, al: number): Solution {
  if (al <= 0 || al >= 180) return { kind: 'none', reason: 'angles' };
  return { kind: 'one', c: onRayA(b, al) };
}

/** Kontrollrechnung SWS (Kosinussatz): a² = b² + c² − 2·b·c·cos α. */
export function sideFromSWS(b: number, c: number, al: number): number {
  return Math.sqrt(Math.max(0, b * b + c * c - 2 * b * c * Math.cos(rad(al))));
}

/** Dritter Winkel aus der Winkelsumme: γ = 180° − α − β (kann ≤ 0 sein). */
export function thirdAngle(al: number, be: number): number {
  return 180 - al - be;
}

/** WSW: c, α und β; C ist der Schnittpunkt der beiden freien Schenkel. */
export function solveWSW(c: number, al: number, be: number): Solution {
  const ga = thirdAngle(al, be);
  if (ga <= EPS) return { kind: 'none', reason: Math.abs(ga) <= EPS ? 'parallel' : 'angles' };
  // Sinussatz: b / sin β = c / sin γ
  const b = (c * Math.sin(rad(be))) / Math.sin(rad(ga));
  return { kind: 'one', c: onRayA(b, al) };
}

/** Kontrollrechnung WSW (Sinussatz): a = c·sin α : sin γ, b = c·sin β : sin γ. */
export function sidesFromWSW(c: number, al: number, be: number): { a: number; b: number; ga: number } | null {
  const ga = thirdAngle(al, be);
  if (ga <= EPS) return null;
  const k = c / Math.sin(rad(ga));
  return { a: k * Math.sin(rad(al)), b: k * Math.sin(rad(be)), ga };
}

/**
 * Beide Lösungen t (mit Vorzeichen) der Gleichung t² − 2·c·cos α · t + c² − a² = 0:
 * Abstände von A auf der Geraden des Schenkels (t < 0: hinter A, auf der Verlängerung),
 * deren Punkt von B = (c | 0) den Abstand a hat. Absteigend sortiert.
 */
export function lineCircleRoots(c: number, a: number, al: number): number[] {
  const p = c * Math.cos(rad(al));
  const disc = a * a - c * c * Math.sin(rad(al)) ** 2;
  if (disc < -1e-9) return [];
  const r = Math.sqrt(Math.max(0, disc));
  if (r < 1e-7) return [p];
  return [p + r, p - r];
}

/** Nur die Lösungen t > 0, also die Punkte auf dem Schenkel selbst (größere zuerst). */
export function rayCircleParams(c: number, a: number, al: number): number[] {
  return lineCircleRoots(c, a, al).filter((t) => t > 1e-7);
}

/** Abstand von B zum freien Schenkel von α (bei α ≥ 90° ist A der nächste Punkt). */
export function armDistance(c: number, al: number): number {
  return al < 90 ? c * Math.sin(rad(al)) : c;
}

/**
 * SsW bzw. SSW: c, α und a (die Seite gegenüber von α). Der Kreis um B mit
 * Radius a schneidet den freien Schenkel von α in keinem, einem oder zwei
 * Punkten. Ist a > c (größere Seite gegenüber), gibt es genau eine Lösung.
 */
export function solveSSW(c: number, a: number, al: number): Solution {
  if (al <= 0 || al >= 180) return { kind: 'none', reason: 'angles' };
  const ts = rayCircleParams(c, a, al);
  if (ts.length === 0) {
    // Kreis trifft den Schenkel nur in A (a = c, α ≥ 90°) oder erreicht ihn gar nicht
    return { kind: 'none', reason: Math.abs(a - c) < 1e-7 ? 'touchA' : 'short' };
  }
  if (ts.length === 1) return { kind: 'one', c: onRayA(ts[0]!, al) };
  return { kind: 'two', c: onRayA(ts[0]!, al), c2: onRayA(ts[1]!, al) };
}

/** Art des SSW-Falls, wie man ihn im Unterricht unterscheidet. */
export type SswKind = 'SsW' | 'touch' | 'two' | 'none';

/**
 * Analyse für SSW: Abstand h von B zum Schenkel, Art der Lösung und – falls der
 * Kreis die Gerade des Schenkels ein zweites Mal hinter A trifft – dieser Punkt
 * (er liegt auf der Verlängerung über A hinaus und liefert kein Dreieck).
 */
export function sswAnalysis(c: number, a: number, al: number): { h: number; kind: SswKind; behind: Pt | null; foot: Pt } {
  const h = armDistance(c, al);
  const s = solveSSW(c, a, al);
  const foot = al < 90 ? onRayA(c * Math.cos(rad(al)), al) : ([0, 0] as Pt);
  const roots = lineCircleRoots(c, a, al);
  const neg = roots.filter((t) => t < -1e-7);
  const behind = neg.length ? onRayA(neg[0]!, al) : null;
  if (s.kind === 'two') return { h, kind: 'two', behind, foot };
  if (s.kind === 'none') return { h, kind: 'none', behind, foot };
  return { h, kind: isSsW(a, c) ? 'SsW' : 'touch', behind, foot };
}

/** WWW: α und β (γ folgt); jede Grundseite liefert ein ähnliches Dreieck. */
export function solveWWW(c: number, al: number, be: number): Solution {
  const s = solveWSW(c, al, be);
  return s.kind === 'one' ? { kind: 'many', c: s.c } : s;
}

/** Streckfaktoren der weiteren ähnlichen Dreiecke bei WWW. */
export const FAMILY = [1.6, 0.55] as const;

export function solve(cs: Case, g: Given): Solution {
  switch (cs) {
    case 'sss':
      return solveSSS(g.a, g.b, g.c);
    case 'sws':
      return solveSWS(g.b, g.al);
    case 'wsw':
      return solveWSW(g.c, g.al, g.be);
    case 'ssw':
      return solveSSW(g.c, g.a, g.al);
    case 'www':
      return solveWWW(g.c, g.al, g.be);
  }
}

/** Ist SSW hier der „sichere“ Fall SsW (gegebener Winkel liegt der größeren Seite gegenüber)? */
export function isSsW(a: number, c: number): boolean {
  return a >= c - EPS;
}

/** Welche Stücke sind im jeweiligen Fall gegeben? */
export function givenParts(cs: Case): { a: boolean; b: boolean; c: boolean; al: boolean; be: boolean; ga: boolean } {
  return {
    a: cs === 'sss' || cs === 'ssw',
    b: cs === 'sss' || cs === 'sws',
    c: cs !== 'www',
    al: cs !== 'sss',
    be: cs === 'wsw' || cs === 'www',
    ga: cs === 'www',
  };
}

/** Innenwinkel bei p im Dreieck p, q, r (Grad). */
export function angleAt(p: Pt, q: Pt, r: Pt): number {
  const u = [q[0] - p[0], q[1] - p[1]];
  const v = [r[0] - p[0], r[1] - p[1]];
  const cosv = (u[0]! * v[0]! + u[1]! * v[1]!) / (Math.hypot(u[0]!, u[1]!) * Math.hypot(v[0]!, v[1]!));
  return deg(Math.acos(Math.max(-1, Math.min(1, cosv))));
}

/** Alle sechs Stücke des Dreiecks ABC mit A = (0 | 0), B = (c | 0). */
export function pieces(c: number, C: Pt): { a: number; b: number; c: number; al: number; be: number; ga: number } {
  const A: Pt = [0, 0];
  const B: Pt = [c, 0];
  return { a: dist(B, C), b: dist(A, C), c, al: angleAt(A, B, C), be: angleAt(B, C, A), ga: angleAt(C, A, B) };
}

/** Flächeninhalt (Grundseite c, Höhe = y-Koordinate von C). */
export function area(c: number, C: Pt): number {
  return 0.5 * c * Math.abs(C[1]);
}

/** Schnittpunkte zweier Kreise (0, 1 oder 2 Punkte), der obere zuerst. */
export function circleIntersections(c1: Pt, r1: number, c2: Pt, r2: number): Pt[] {
  const d = dist(c1, c2);
  if (d < 1e-12 || d > r1 + r2 + 1e-9 || d < Math.abs(r1 - r2) - 1e-9) return [];
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r1 * r1 - a * a));
  const ex = (c2[0] - c1[0]) / d;
  const ey = (c2[1] - c1[1]) / d;
  const px = c1[0] + a * ex;
  const py = c1[1] + a * ey;
  if (h < 1e-9) return [[px, py]];
  const s: Pt[] = [
    [px - h * ey, py + h * ex],
    [px + h * ey, py - h * ex],
  ];
  return s.sort((u, v) => v[1] - u[1]);
}

/**
 * Lücke auf der Grundlinie zwischen den beiden Kreisen bei verletzter
 * Dreiecksungleichung: Kreis um A überdeckt [−b, b], Kreis um B [c − a, c + a]
 * (jeweils auf der x-Achse). Gibt das Intervall [x0, x1] zwischen den nächsten
 * Kreispunkten zurück (Länge = sssExcess), sonst null.
 */
export function sssGap(a: number, b: number, c: number): [number, number] | null {
  if (sssExcess(a, b, c) < -EPS) return null;
  if (c - a - b >= b - a - c && c - a - b >= a - b - c) return [b, c - a];
  if (b - a - c >= a - b - c) return [c + a, b];
  return [c - a, -b];
}

/** Schritte einer Konstruktion (ohne Texte), je nach Fall und Lösung. */
export type StepKind =
  | 'base'
  | 'circA'
  | 'circB'
  | 'cut'
  | 'cutNo'
  | 'join'
  | 'angA'
  | 'armA'
  | 'circArm'
  | 'joinB'
  | 'angB'
  | 'armB'
  | 'circBArm'
  | 'cut2'
  | 'cut1'
  | 'cut0'
  | 'join2'
  | 'fam1'
  | 'fam2'
  | 'measure'
  | 'end';

/**
 * Ablauf der Konstruktion wie im Heft. Der letzte Schritt ist „measure“ (fehlende
 * Stücke messen), bei WWW und ohne Lösung „end“ (Ergebnis festhalten).
 */
export function stepPlan(cs: Case, s: Solution): StepKind[] {
  const ok = s.kind !== 'none';
  switch (cs) {
    case 'sss':
      return ok ? ['base', 'circA', 'circB', 'cut', 'join', 'measure'] : ['base', 'circA', 'circB', 'cutNo', 'end'];
    case 'sws':
      return ['base', 'angA', 'armA', 'circArm', 'joinB', 'measure'];
    case 'wsw':
      return ok ? ['base', 'angA', 'armA', 'angB', 'armB', 'measure'] : ['base', 'angA', 'armA', 'angB', 'armB', 'end'];
    case 'ssw': {
      const head: StepKind[] = ['base', 'angA', 'armA', 'circBArm'];
      if (s.kind === 'two') return [...head, 'cut2', 'join2', 'measure'];
      if (s.kind === 'one') return [...head, 'cut1', 'joinB', 'measure'];
      return [...head, 'cut0', 'end'];
    }
    case 'www':
      return ok ? ['base', 'angA', 'armA', 'angB', 'armB', 'fam1', 'fam2', 'end'] : ['base', 'angA', 'armA', 'angB', 'armB', 'end'];
  }
}
