/**
 * Prisma und Zylinder: Grundfläche G, Umfang u der Grundfläche, Volumen
 * V = G · h, Mantel M = u · h und Oberfläche O = 2 · G + M. Dazu das Abrollen
 * eines Prismas bzw. Zylinders auf dem Boden: Jede Seitenfläche hinterlässt
 * ihren Abdruck, zusammen ergeben sie den Mantel (Rechteck u × h).
 */

export type Pt = readonly [number, number];
export type BaseId = 'dreieck' | 'neck' | 'kreis';

export interface BaseShape {
  /** Eckpunkte (gegen den Uhrzeigersinn, Schwerpunkt im Ursprung); beim Kreis ein feines Vieleck zum Zeichnen. */
  points: Pt[];
  /** Grundflächeninhalt. */
  area: number;
  /** Umfang der Grundfläche. */
  perimeter: number;
  /** Seitenlängen (beim Kreis leer). */
  sides: number[];
}

/** Gleichschenkliges Dreieck mit Grundseite g und Höhe h_g (Grundseite vorn). */
export function triangleBase(g: number, hg: number): BaseShape {
  const leg = Math.hypot(g / 2, hg);
  return {
    points: [
      [hg / 3, -g / 2],
      [hg / 3, g / 2],
      [(-2 * hg) / 3, 0],
    ],
    area: (g * hg) / 2,
    perimeter: g + 2 * leg,
    sides: [g, leg, leg],
  };
}

/** Seitenlänge, Inkreisradius, Flächeninhalt und Umfang des regelmäßigen n-Ecks mit Umkreisradius r. */
export function regularPolygon(n: number, r: number): { side: number; apothem: number; area: number; perimeter: number } {
  const side = 2 * r * Math.sin(Math.PI / n);
  const apothem = r * Math.cos(Math.PI / n);
  return { side, apothem, area: n * 0.5 * side * apothem, perimeter: n * side };
}

/** Regelmäßiges n-Eck mit Umkreisradius r, eine Seite vorn (senkrecht zur x₁-Achse). */
export function polygonBase(n: number, r: number): BaseShape {
  const q = regularPolygon(n, r);
  const points = Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / n + (i * 2 * Math.PI) / n;
    return [r * Math.cos(a), r * Math.sin(a)] as Pt;
  });
  return { points, area: q.area, perimeter: q.perimeter, sides: Array(n).fill(q.side) };
}

/** Kreis mit Radius r (zum Zeichnen als feines Vieleck). */
export function circleBase(r: number, segments = 72): BaseShape {
  const points = Array.from({ length: segments }, (_, i) => {
    const a = -Math.PI / segments + (i * 2 * Math.PI) / segments;
    return [r * Math.cos(a), r * Math.sin(a)] as Pt;
  });
  return { points, area: Math.PI * r * r, perimeter: 2 * Math.PI * r, sides: [] };
}

export interface Solid {
  base: BaseShape;
  h: number;
  volume: number;
  mantle: number;
  surface: number;
}

export function solid(base: BaseShape, h: number): Solid {
  const mantle = base.perimeter * h;
  return { base, h, volume: base.area * h, mantle, surface: 2 * base.area + mantle };
}

/** Schichten von je 1 Längeneinheit Höhe (die oberste ggf. dünner): Unter- und Oberkante. */
export function slices(h: number): [number, number][] {
  const out: [number, number][] = [];
  for (let z = 0; z < h - 1e-9; z += 1) out.push([z, Math.min(h, z + 1)]);
  return out;
}

/* ------------------------------------------------------------------ */
/* Abrollen                                                            */
/* ------------------------------------------------------------------ */

export interface RollPose {
  /** Lage der Querschnitts-Ecken (u entlang des Bodens, w nach oben). */
  points: Pt[];
  /** Drehwinkel des Körpers (im Uhrzeigersinn) seit dem Start. */
  angle: number;
  /** Bis hierhin abgedruckte Länge auf dem Boden. */
  printed: number;
  /** Anzahl der Seitenflächen, die schon auf dem Boden lagen. */
  faces: number;
}

const rotate = ([x, y]: Pt, a: number, [cx, cy]: Pt = [0, 0]): Pt => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
};

/**
 * Lage eines Prismenquerschnitts (konvexes Vieleck, gegen den Uhrzeigersinn)
 * beim Abrollen nach rechts, nachdem sich der Körper um `theta` (0 … 2π)
 * gedreht hat. Zu Beginn liegt die Seite 0 auf dem Boden und beginnt bei u = 0.
 * Der Körper kippt jeweils um die rechte Ecke der aufliegenden Seite.
 */
export function rollPolygon(poly: readonly Pt[], theta: number): RollPose {
  const n = poly.length;
  const dir = (i: number) => {
    const a = poly[i % n]!;
    const b = poly[(i + 1) % n]!;
    return Math.atan2(b[1] - a[1], b[0] - a[0]);
  };
  const len = (i: number) => Math.hypot(poly[(i + 1) % n]![0] - poly[i % n]![0], poly[(i + 1) % n]![1] - poly[i % n]![1]);
  const t = Math.max(0, Math.min(2 * Math.PI, theta));
  let start = 0; // Weg bis zum Anfang der aufliegenden Seite
  let turned = 0; // bisherige Drehung
  for (let i = 0; i < n; i++) {
    // Außenwinkel an der Ecke i + 1
    let ext = dir(i + 1) - dir(i);
    while (ext <= 0) ext += 2 * Math.PI;
    while (ext > 2 * Math.PI) ext -= 2 * Math.PI;
    const s = len(i);
    if (t <= turned + ext + 1e-12 || i === n - 1) {
      const phi = Math.min(ext, t - turned);
      // Seite i liegt auf dem Boden von start bis start + s
      const base = -dir(i);
      const v0 = poly[i]!;
      const placed = poly.map((p) => {
        const q = rotate([p[0] - v0[0], p[1] - v0[1]], base);
        return [q[0] + start, q[1]] as Pt;
      });
      const pivot: Pt = [start + s, 0];
      const points = placed.map((p) => rotate(p, -phi, pivot));
      // landet die nächste Seite, ist auch sie abgedruckt (nach einer vollen Drehung ist der Mantel komplett)
      const done = phi >= ext - 1e-9 && i < n - 1;
      return { points, angle: turned + phi, printed: start + s + (done ? len(i + 1) : 0), faces: i + 1 + (done ? 1 : 0) };
    }
    turned += ext;
    start += s;
  }
  return { points: [...poly], angle: 0, printed: 0, faces: 0 };
}

/** Kreis mit Radius r nach einer Drehung um `theta`: Mittelpunkt und abgedruckte Länge r · θ. */
export function rollCircle(r: number, theta: number): { center: Pt; angle: number; printed: number } {
  const t = Math.max(0, Math.min(2 * Math.PI, theta));
  return { center: [r * t, r], angle: t, printed: r * t };
}
