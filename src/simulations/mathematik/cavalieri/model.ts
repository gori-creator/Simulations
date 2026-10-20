/**
 * Prinzip von Cavalieri: Haben zwei Körper gleiche Höhe und in jeder Höhe z
 * gleich große Querschnitte, dann haben sie das gleiche Volumen.
 *
 * Verglichen werden jeweils zwei Körper:
 * - gerader und schiefer bzw. gekrümmter Zylinder, Prisma, Kegel, Pyramide
 *   (Körper 2 entsteht aus Körper 1, indem jede Scheibe waagerecht verschoben
 *   wird; die Querschnitte bleiben deckungsgleich),
 * - Halbkugel und „Restkörper“ (Zylinder mit Radius r und Höhe r, aus dem ein
 *   auf der Spitze stehender Kegel herausgenommen ist): Querschnitte π(r² − z²).
 *
 * Dazu der Scheibenstapel: Der Körper wird in n gleich dicke Scheiben zerlegt;
 * jede Scheibe ist ein gerades Stück (Zylinder, Quader, Ring) mit dem größten
 * Querschnitt ihres Bereichs. Ihr Gesamtvolumen nähert sich für n → ∞ dem
 * Volumen des Körpers.
 */

export type BodyKind = 'zyl' | 'prisma' | 'kegel' | 'pyr' | 'kugel';

/** Maße in cm: Radius r (Zylinder, Kegel, Kugel), Grundkante a (Prisma, Pyramide), Höhe h (bei der Kugel gilt h = r). */
export interface Dims {
  r: number;
  a: number;
  h: number;
}

/** Verschiebung von Körper 2: s = seitliche Verschiebung der Deckfläche bzw. Spitze, k = Ausbauchung in halber Höhe (beides in cm). */
export interface Shear {
  s: number;
  k: number;
}

/** Querschnitt in einer Höhe: Mittelpunkt (seitliche Lage), Außenmaß und Innenmaß (Loch, nur beim Restkörper). */
export interface Section {
  /** Seitliche Lage des Mittelpunkts (in x₂-Richtung). */
  c: number;
  /** Radius des Kreises bzw. halbe Seitenlänge des Quadrats. */
  outer: number;
  /** Radius des Lochs (Kreisring); sonst 0. */
  inner: number;
}

/** Hat der Körper quadratische Querschnitte? */
export const isSquare = (kind: BodyKind) => kind === 'prisma' || kind === 'pyr';

/** Höhe des Körpers (bei Halbkugel und Restkörper: r). */
export function bodyHeight(kind: BodyKind, d: Dims): number {
  return kind === 'kugel' ? d.r : d.h;
}

/** Größtes Außenmaß (Radius bzw. halbe Grundkante). */
export function baseExtent(kind: BodyKind, d: Dims): number {
  return isSquare(kind) ? d.a / 2 : d.r;
}

/**
 * Seitliche Verschiebung der Körperachse in der relativen Höhe t = z/h:
 * c(t) = s · t + 4k · t · (1 − t). Für k = 0 eine Gerade (schiefer Körper),
 * sonst eine Parabel durch c(0) = 0 und c(1) = s mit c(½) = s/2 + k.
 */
export function axisOffset(sh: Shear, t: number): number {
  return sh.s * t + 4 * sh.k * t * (1 - t);
}

/** Kleinste und größte Achsverschiebung zwischen Boden und Deckfläche. */
export function axisRange(sh: Shear): [number, number] {
  const vals = [0, sh.s];
  // Scheitel der Parabel c(t) = (s + 4k) t − 4k t²
  if (sh.k !== 0) {
    const t = (sh.s + 4 * sh.k) / (8 * sh.k);
    if (t > 0 && t < 1) vals.push(axisOffset(sh, t));
  }
  return [Math.min(...vals), Math.max(...vals)];
}

/**
 * Querschnitt von Körper `which` (1 oder 2) in der Höhe z. Körper 1 ist der
 * gerade Körper bzw. die Halbkugel, Körper 2 der verschobene Körper bzw. der
 * Restkörper.
 */
export function section(kind: BodyKind, d: Dims, which: 1 | 2, z: number, sh: Shear = { s: 0, k: 0 }): Section {
  const H = bodyHeight(kind, d);
  const zz = Math.max(0, Math.min(H, z));
  const t = H > 0 ? zz / H : 0;
  if (kind === 'kugel') {
    if (which === 1) return { c: 0, outer: Math.sqrt(Math.max(0, d.r * d.r - zz * zz)), inner: 0 };
    // Restkörper: Zylinder mit Radius r ohne Kegel (Spitze unten, Radius in der Höhe z ist z)
    return { c: 0, outer: d.r, inner: zz };
  }
  const base = baseExtent(kind, d);
  const outer = kind === 'kegel' || kind === 'pyr' ? base * (1 - t) : base;
  return { c: which === 2 ? axisOffset(sh, t) : 0, outer, inner: 0 };
}

/** Flächeninhalt eines Querschnitts. */
export function sectionArea(kind: BodyKind, sec: Section): number {
  if (isSquare(kind)) return (2 * sec.outer) ** 2;
  return Math.PI * (sec.outer * sec.outer - sec.inner * sec.inner);
}

/** Querschnittsfläche A(z) (für beide Körper gleich). */
export function areaAt(kind: BodyKind, d: Dims, z: number, which: 1 | 2 = 1, sh?: Shear): number {
  return sectionArea(kind, section(kind, d, which, z, sh));
}

/** Grundfläche G = A(0). */
export function baseArea(kind: BodyKind, d: Dims): number {
  return areaAt(kind, d, 0);
}

/**
 * Exaktes Volumen: Zylinder πr²h, Prisma a²h, Kegel ⅓πr²h, Pyramide ⅓a²h,
 * Halbkugel bzw. Restkörper πr³ − ⅓πr³ = ⅔πr³.
 */
export function volume(kind: BodyKind, d: Dims): number {
  switch (kind) {
    case 'zyl':
      return Math.PI * d.r * d.r * d.h;
    case 'prisma':
      return d.a * d.a * d.h;
    case 'kegel':
      return (Math.PI * d.r * d.r * d.h) / 3;
    case 'pyr':
      return (d.a * d.a * d.h) / 3;
    case 'kugel':
      return (2 / 3) * Math.PI * d.r ** 3;
  }
}

/** Teile der Kugelrechnung: Zylinder πr³, Kegel ⅓πr³, Halbkugel ⅔πr³, Kugel ⁴⁄₃πr³. */
export function sphereParts(r: number): { cylinder: number; cone: number; hemisphere: number; sphere: number } {
  const c = Math.PI * r ** 3;
  return { cylinder: c, cone: c / 3, hemisphere: (2 * c) / 3, sphere: (4 * c) / 3 };
}

/* ------------------------------------------------------------------ */
/* Scheibenstapel                                                      */
/* ------------------------------------------------------------------ */

/**
 * Eine Scheibe zwischen den Höhen z0 und z1. Unten (Index 0) und oben
 * (Index 1) können Mittelpunkt und Maße verschieden sein (glatter Körper,
 * Kegelstumpf-Stücke); beim Stapel sind sie gleich (gerade Scheibe).
 */
export interface Slab {
  z0: number;
  z1: number;
  c0: number;
  c1: number;
  o0: number;
  o1: number;
  i0: number;
  i1: number;
  /** Nummer der Scheibe im Stapel (für abwechselnde Färbung). */
  index: number;
}

/**
 * Scheibenstapel aus n gleich dicken, geraden Scheiben (n = Infinity: glatter
 * Körper aus `smooth` dünnen Stücken, die Boden- und Deckfläche verbinden).
 * Jede Scheibe hat das größte Außen- und das kleinste Innenmaß ihres Bereichs
 * (sie umschließt den Körper); der Mittelpunkt liegt auf der Achse in halber
 * Scheibenhöhe.
 */
export function buildSlabs(kind: BodyKind, d: Dims, which: 1 | 2, n: number, sh: Shear = { s: 0, k: 0 }, smooth = 64): Slab[] {
  const H = bodyHeight(kind, d);
  const out: Slab[] = [];
  if (!Number.isFinite(n)) {
    for (let i = 0; i < smooth; i++) {
      const z0 = (H * i) / smooth;
      const z1 = (H * (i + 1)) / smooth;
      const a = section(kind, d, which, z0, sh);
      const b = section(kind, d, which, z1, sh);
      out.push({ z0, z1, c0: a.c, c1: b.c, o0: a.outer, o1: b.outer, i0: a.inner, i1: b.inner, index: i });
    }
    return out;
  }
  const m = Math.max(1, Math.round(n));
  for (let i = 0; i < m; i++) {
    const z0 = (H * i) / m;
    const z1 = (H * (i + 1)) / m;
    const a = section(kind, d, which, z0, sh);
    const b = section(kind, d, which, z1, sh);
    const mid = section(kind, d, which, (z0 + z1) / 2, sh);
    const o = Math.max(a.outer, b.outer);
    const inner = Math.min(a.inner, b.inner);
    out.push({ z0, z1, c0: mid.c, c1: mid.c, o0: o, o1: o, i0: inner, i1: inner, index: i });
  }
  return out;
}

/** Volumen einer Scheibe (gerade Scheibe exakt; Stücke mit verschiedenen Enden nach der Prismatoid-Formel). */
export function slabVolume(kind: BodyKind, s: Slab): number {
  const dz = s.z1 - s.z0;
  const area = (o: number, i: number) => (isSquare(kind) ? 4 * o * o : Math.PI * (o * o - i * i));
  const om = (s.o0 + s.o1) / 2;
  const im = (s.i0 + s.i1) / 2;
  // Simpson-Regel: exakt für Querschnitte, die quadratisch von z abhängen
  return (dz / 6) * (area(s.o0, s.i0) + 4 * area(om, im) + area(s.o1, s.i1));
}

/** Gesamtvolumen eines Stapels. */
export function stackVolume(kind: BodyKind, slabs: readonly Slab[]): number {
  return slabs.reduce((sum, s) => sum + slabVolume(kind, s), 0);
}

/**
 * Volumen des Stapels aus n Scheiben, geschlossen berechnet:
 * - Zylinder, Prisma: genau G · h (jede Scheibe ist ein Stück des Körpers),
 * - Kegel, Pyramide: G · h · (n + 1)(2n + 1) / (6n²) → ⅓ · G · h,
 * - Halbkugel bzw. Restkörper: πr³ · (1 − (n − 1)(2n − 1) / (6n²)) → ⅔πr³.
 */
export function stackVolumeFormula(kind: BodyKind, d: Dims, n: number): number {
  const G = baseArea(kind, d);
  const H = bodyHeight(kind, d);
  if (!Number.isFinite(n)) return volume(kind, d);
  if (kind === 'zyl' || kind === 'prisma') return G * H;
  if (kind === 'kegel' || kind === 'pyr') return (G * H * (n + 1) * (2 * n + 1)) / (6 * n * n);
  return Math.PI * d.r ** 3 * (1 - ((n - 1) * (2 * n - 1)) / (6 * n * n));
}

/**
 * Teilt die Scheiben an der Höhe zc: Stücke unterhalb (bis zc) und oberhalb
 * (ab zc). Eine durchgeschnittene Scheibe wird in zwei Stücke zerlegt; bei
 * Stücken mit verschiedenen Enden werden Lage und Maße linear geteilt.
 */
export function splitSlabs(slabs: readonly Slab[], zc: number): { below: Slab[]; above: Slab[] } {
  const below: Slab[] = [];
  const above: Slab[] = [];
  const eps = 1e-9;
  for (const s of slabs) {
    if (s.z1 <= zc + eps) below.push(s);
    else if (s.z0 >= zc - eps) above.push(s);
    else {
      const u = (zc - s.z0) / (s.z1 - s.z0);
      const c = s.c0 + (s.c1 - s.c0) * u;
      const o = s.o0 + (s.o1 - s.o0) * u;
      const i = s.i0 + (s.i1 - s.i0) * u;
      below.push({ ...s, z1: zc, c1: c, o1: o, i1: i });
      above.push({ ...s, z0: zc, c0: c, o0: o, i0: i });
    }
  }
  return { below, above };
}

/** Index der Scheibe, die in der Höhe z liegt (oberste Scheibe für z = h). */
export function slabIndexAt(kind: BodyKind, d: Dims, n: number, z: number): number {
  const H = bodyHeight(kind, d);
  const m = Math.max(1, Math.round(n));
  return Math.max(0, Math.min(m - 1, Math.floor((z / H) * m)));
}

/**
 * Ist der Wert auf `decimals` Nachkommastellen genau darstellbar? Dann steht
 * in der Anzeige „=“, sonst „≈“ (mit Endnullen, z. B. „≈ 113,10“).
 */
export function isExactTo(value: number, decimals: number): boolean {
  const f = value * 10 ** decimals;
  return Math.abs(f - Math.round(f)) < 1e-9 * Math.max(1, Math.abs(f));
}
