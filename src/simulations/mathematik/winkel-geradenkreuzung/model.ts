/**
 * Rechenlogik „Winkel an Geradenkreuzungen“ (Jahrgangsstufe 7).
 *
 * Richtungen werden in Grad gegen den Uhrzeigersinn angegeben (0° zeigt nach
 * rechts). Eine Gerade hat keine Pfeilrichtung, ihre Richtung ist deshalb nur
 * bis auf Vielfache von 180° bestimmt (Normierung auf 0° … 180°).
 *
 * Einfache Kreuzung: Zwei Geraden g und h schneiden sich im Punkt S. Der
 * Schnittwinkel α wird gegen den Uhrzeigersinn von g nach h gemessen. Die vier
 * Winkel heißen – gegen den Uhrzeigersinn – α, β, γ, δ:
 *   α zwischen g (Richtung φ) und h (Richtung φ + α),
 *   β zwischen h und g (Gegenrichtung), γ gegenüber von α, δ gegenüber von β.
 *
 * Doppelkreuzung: Die Geraden g (unten) und h (oben) werden von der Geraden s
 * geschnitten. An jeder Kreuzung liegen vier Winkel; Index 1 an g, Index 2 an h.
 * Der Winkel α liegt jeweils zwischen dem „rechten“ Teil der Geraden und dem
 * nach oben (zu h hin) zeigenden Teil von s. Gegen den Uhrzeigersinn folgen
 * β (links von s, oberhalb der Geraden), γ (links, unterhalb) und δ (rechts,
 * unterhalb).
 */

/** Rest modulo 360 im Bereich [0, 360). */
export function norm360(deg: number): number {
  const r = deg % 360;
  return r < 0 ? r + 360 : r;
}

/** Richtung einer Geraden, normiert auf [0, 180). */
export function norm180(deg: number): number {
  const r = deg % 180;
  const v = r < 0 ? r + 180 : r;
  // −0 bzw. Rundungsreste knapp unter 180 vermeiden
  return Math.abs(v - 180) < 1e-9 ? 0 : v + 0;
}

/** Die vier Winkel an einer Kreuzung. */
export interface CrossingAngles {
  alpha: number;
  beta: number;
  gamma: number;
  delta: number;
}

/**
 * Winkel zwischen zwei Geraden mit den Richtungen `dirG` und `dirH`:
 * α (von g gegen den Uhrzeigersinn nach h) und sein Nebenwinkel β = 180° − α.
 * Sind die Geraden parallel (gleiche Richtung modulo 180°), gibt es keinen
 * Schnittpunkt: Ergebnis `null`.
 */
export function anglesFromDirections(dirG: number, dirH: number): { alpha: number; beta: number } | null {
  const alpha = norm180(dirH - dirG);
  if (alpha < 1e-9) return null;
  return { alpha, beta: 180 - alpha };
}

/**
 * Alle vier Winkel bei Schnittwinkel α: Scheitelwinkel sind gleich groß
 * (γ = α, δ = β), Nebenwinkel ergänzen sich zu 180° (β = 180° − α).
 * Bei 0° bzw. 180° (und Vielfachen) sind die Geraden parallel: `null`.
 */
export function crossingAngles(alpha: number): CrossingAngles | null {
  const a = norm180(alpha);
  if (a < 1e-9) return null;
  return { alpha: a, beta: 180 - a, gamma: a, delta: 180 - a };
}

/* ------------------------------------------------------------------ */
/* Doppelkreuzung                                                      */
/* ------------------------------------------------------------------ */

export type Letter = 'a' | 'b' | 'c' | 'd';
export type Crossing = 1 | 2;
/** Winkel-Kennung: Buchstabe (a = α, b = β, c = γ, d = δ) und Kreuzung (1 an g, 2 an h). */
export type AngleId = 'a1' | 'b1' | 'c1' | 'd1' | 'a2' | 'b2' | 'c2' | 'd2';
export const ANGLE_IDS: readonly AngleId[] = ['a1', 'b1', 'c1', 'd1', 'a2', 'b2', 'c2', 'd2'];

/** Lage eines Winkels: an welcher Kreuzung, rechts/links von s, ober-/unterhalb der Geraden. */
export interface AnglePos {
  crossing: Crossing;
  right: boolean;
  above: boolean;
  /** Liegt der Winkel zwischen g und h („innen“)? */
  inner: boolean;
}

export function anglePos(id: AngleId): AnglePos {
  const letter = id[0] as Letter;
  const crossing = (id[1] === '1' ? 1 : 2) as Crossing;
  const right = letter === 'a' || letter === 'd';
  const above = letter === 'a' || letter === 'b';
  // g liegt unten: innen heißt oberhalb von g; h liegt oben: innen heißt unterhalb von h
  const inner = crossing === 1 ? above : !above;
  return { crossing, right, above, inner };
}

/**
 * Größen der acht Winkel. `w` ist α₁ (Winkel zwischen g und s), `v` ist α₂
 * (Winkel zwischen h und s). Bei g ∥ h gilt v = w.
 */
export function doubleAngles(w: number, v: number): Record<AngleId, number> {
  return { a1: w, b1: 180 - w, c1: w, d1: 180 - w, a2: v, b2: 180 - v, c2: v, d2: 180 - v };
}

/** Sind g und h parallel? (beide schneiden s unter demselben Winkel) */
export function isParallel(w: number, v: number, eps = 1e-9): boolean {
  return Math.abs(norm180(w) - norm180(v)) < eps;
}

/** Winkelbeziehungen an Geradenkreuzungen. */
export type Relation = 'scheitel' | 'neben' | 'stufen' | 'wechsel' | 'nachbar';

/**
 * Beziehung zweier (verschiedener) Winkel:
 * - gleiche Kreuzung: Scheitelwinkel (gegenüber) oder Nebenwinkel (benachbart),
 * - verschiedene Kreuzungen:
 *   Stufenwinkel (F-Figur): gleiche Lage an beiden Kreuzungen,
 *   Wechselwinkel (Z-Figur): verschiedene Seiten von s, beide innen oder beide außen,
 *   Nachbarwinkel (E-Figur): gleiche Seite von s, beide innen oder beide außen.
 * Für die übrigen Paare (z. B. α₁ und β₂) gibt es keinen eigenen Namen: `null`.
 */
export function relation(x: AngleId, y: AngleId): Relation | null {
  if (x === y) return null;
  const p = anglePos(x);
  const q = anglePos(y);
  if (p.crossing === q.crossing) return p.right !== q.right && p.above !== q.above ? 'scheitel' : 'neben';
  if (p.right === q.right && p.above === q.above) return 'stufen';
  if (p.inner === q.inner) return p.right === q.right ? 'nachbar' : 'wechsel';
  return null;
}

/** Ergänzen sich die beiden Winkel einer Beziehung zu 180° (statt gleich groß zu sein)? */
export function isSupplementary(rel: Relation): boolean {
  return rel === 'neben' || rel === 'nachbar';
}

/** Gilt die Beziehung immer oder nur bei parallelen Geraden? */
export function needsParallel(rel: Relation): boolean {
  return rel === 'stufen' || rel === 'wechsel' || rel === 'nachbar';
}

/** Partner eines Winkels in einer Beziehung (an der anderen Kreuzung bzw. bei Scheitel/Neben an derselben). */
export function partner(x: AngleId, rel: Relation): AngleId {
  const candidates = ANGLE_IDS.filter((y) => relation(x, y) === rel);
  // Nebenwinkel gibt es zwei: den gegen den Uhrzeigersinn folgenden zuerst
  if (rel === 'neben') {
    const order: Letter[] = ['a', 'b', 'c', 'd'];
    const i = order.indexOf(x[0] as Letter);
    return `${order[(i + 1) % 4]}${x[1]}` as AngleId;
  }
  return candidates[0]!;
}

/** Größe des Partners aus der Größe des Ausgangswinkels (gleich groß bzw. 180° − x). */
export function valueVia(rel: Relation, x: number): number {
  return isSupplementary(rel) ? 180 - x : x;
}

/** Gilt die Beziehung bei den aktuellen Winkeln (w an g, v an h)? */
export function relationHolds(x: AngleId, y: AngleId, w: number, v: number): boolean {
  const rel = relation(x, y);
  if (!rel) return false;
  const vals = doubleAngles(w, v);
  const expected = valueVia(rel, vals[x]);
  return Math.abs(expected - vals[y]) < 1e-9;
}

/** Ein Begründungsschritt: aus `from` folgt `to` über die Beziehung `rel`. */
export interface Step {
  from: AngleId;
  to: AngleId;
  rel: Relation;
}

/**
 * Kürzeste Begründungskette vom gegebenen Winkel zum gesuchten Winkel
 * (g ∥ h vorausgesetzt). Bevorzugt werden direkte Beziehungen, dann Wege über
 * schon bekannte Winkel (`known`), dann Scheitel-/Nebenwinkel vor Stufenwinkeln
 * usw. Ergebnis: leere Liste, wenn `target === given`.
 */
export function explain(given: AngleId, target: AngleId, known: readonly AngleId[] = []): Step[] {
  if (given === target) return [];
  const direct = relation(given, target);
  if (direct) return [{ from: given, to: target, rel: direct }];
  // Zwei Schritte über einen Zwischenwinkel: zuerst über bekannte Winkel
  const rank: Record<Relation, number> = { scheitel: 0, stufen: 1, neben: 2, wechsel: 3, nachbar: 4 };
  let best: Step[] | null = null;
  let bestScore = Infinity;
  for (const mid of ANGLE_IDS) {
    if (mid === given || mid === target) continue;
    const r1 = relation(given, mid);
    const r2 = relation(mid, target);
    if (!r1 || !r2) continue;
    const score = (known.includes(mid) ? 0 : 100) + rank[r1] * 10 + rank[r2];
    if (score < bestScore) {
      bestScore = score;
      best = [
        { from: given, to: mid, rel: r1 },
        { from: mid, to: target, rel: r2 },
      ];
    }
  }
  return best ?? [];
}

/** Wert am Ende einer Begründungskette, ausgehend vom gegebenen Wert. */
export function chainValue(steps: readonly Step[], start: number): number {
  return steps.reduce((v, s) => valueVia(s.rel, v), start);
}

/* ------------------------------------------------------------------ */
/* Geometrie (für die Zeichnung)                                       */
/* ------------------------------------------------------------------ */

export type Pt = [number, number];

/** Einheitsvektor in Richtung `deg` (mathematisch, y nach oben). */
export function dir(deg: number): Pt {
  const r = (deg * Math.PI) / 180;
  return [Math.cos(r), Math.sin(r)];
}

/**
 * Lage der Doppelkreuzung: s geht durch den Mittelpunkt M = (0 | 0) mit der
 * Richtung σ (zu h hin), S₁ = M − d·e(σ) liegt auf g, S₂ = M + d·e(σ) auf h.
 * g hat die Richtung σ − w, h die Richtung σ − v.
 */
export function doubleLayout(sigma: number, w: number, v: number, d: number): { S1: Pt; S2: Pt; dirS: number; dirG: number; dirH: number } {
  const [ux, uy] = dir(sigma);
  return {
    S1: [-d * ux, -d * uy],
    S2: [d * ux, d * uy],
    dirS: sigma,
    dirG: norm180(sigma - w),
    dirH: norm180(sigma - v),
  };
}

/**
 * Schnittpunkt zweier Geraden (Punkt + Richtung in Grad), `null` bei Parallelen.
 */
export function intersect(p: Pt, dirP: number, q: Pt, dirQ: number): Pt | null {
  const [ax, ay] = dir(dirP);
  const [bx, by] = dir(dirQ);
  const den = ax * by - ay * bx;
  if (Math.abs(den) < 1e-12) return null;
  const t = ((q[0] - p[0]) * by - (q[1] - p[1]) * bx) / den;
  return [p[0] + t * ax, p[1] + t * ay];
}

/* ------------------------------------------------------------------ */
/* Aufgaben                                                            */
/* ------------------------------------------------------------------ */

export interface Task {
  given: AngleId;
  value: number;
  sigma: number;
}

/** Zufällige Aufgabe: ein Winkel zwischen 25° und 155° (in 5°-Schritten, nicht 90°), Lage von s. */
export function makeTask(rand: () => number, prev?: Task): Task {
  for (let i = 0; i < 20; i++) {
    let value = 25 + 5 * Math.floor(rand() * 27);
    if (value === 90) value = 85;
    const given = ANGLE_IDS[Math.floor(rand() * 8)]!;
    const sigma = 55 + 5 * Math.floor(rand() * 15);
    const t = { given, value, sigma };
    if (!prev || prev.given !== t.given || prev.value !== t.value) return t;
  }
  return { given: 'a1', value: 50, sigma: 70 };
}

/** α₁ (Winkel an g) aus dem gegebenen Winkel: gleich groß oder 180° − Wert. */
export function alphaFromGiven(given: AngleId, value: number): number {
  const l = given[0] as Letter;
  return l === 'a' || l === 'c' ? value : 180 - value;
}
