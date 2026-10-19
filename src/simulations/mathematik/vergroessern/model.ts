/**
 * Rechenlogik „Ähnliche Figuren: Wie wachsen Fläche und Volumen?“ (Jgst. 9).
 *
 * Wird eine Figur bzw. ein Körper mit dem Streckfaktor k vergrößert
 * (k > 1) oder verkleinert (0 < k < 1), so entsteht eine ähnliche Figur:
 *   Längen · k,   Flächeninhalte (auch Oberflächen) · k²,   Volumina · k³.
 *
 * Anschauliche Begründung (Hauptanimation der Simulation): Das Bild lässt sich
 * mit Kopien des Originals auslegen – eine Strecke mit k, eine Fläche mit k²,
 * ein Körper mit k³ Kopien. Bei nicht ganzzahligem k entstehen am Rand
 * Bruchstücke; ihre Anteile addieren sich genau zu k, k² bzw. k³.
 * Beim Verkleinern (k < 1) wird umgekehrt das Original mit Kopien des Bildes
 * ausgelegt: Es passen 1/k², bzw. 1/k³ Bilder hinein.
 *
 * Dazu kommen der Rückwärts-Schluss (Faktor gegeben → k = √Faktor bzw. ∛Faktor)
 * und drei Anwendungen: Pizza, Modell im Maßstab 1 : m und das Verhältnis von
 * Oberfläche zu Volumen bei Würfeln.
 */

export type Dims = readonly [number, number, number];
export type Pt = readonly [number, number];

/* ------------------------------------------------------------------ */
/* Grundgesetze                                                        */
/* ------------------------------------------------------------------ */

/** Länge des Bildes einer Strecke der Länge L. */
export function scaleLength(L: number, k: number): number {
  return L * k;
}
/** Flächeninhalt des Bildes einer Figur mit Flächeninhalt A. */
export function scaleArea(A: number, k: number): number {
  return A * k * k;
}
/** Volumen des Bildes eines Körpers mit Volumen V. */
export function scaleVolume(V: number, k: number): number {
  return V * k ** 3;
}

/** Faktor, mit dem sich eine Größe der Dimension d (1 Länge, 2 Fläche, 3 Volumen) ändert: k^d. */
export function factor(k: number, d: 1 | 2 | 3): number {
  return k ** d;
}

/**
 * Rückwärts: Um welchen Faktor f hat sich eine Fläche (d = 2) bzw. ein
 * Volumen (d = 3) geändert? Dann ist k = √f bzw. k = ∛f.
 */
export function kFromFactor(f: number, d: 1 | 2 | 3): number {
  if (!(f > 0)) return NaN;
  if (d === 1) return f;
  if (d === 2) return Math.sqrt(f);
  return Math.cbrt(f);
}

/**
 * Ist f eine d-te Potenz einer ganzen Zahl (bzw. der Kehrwert einer solchen)?
 * Liefert dann die Wurzel (z. B. 27 → 3, 0,125 → 0,5), sonst null.
 */
export function exactRoot(f: number, d: 2 | 3): number | null {
  if (!(f > 0)) return null;
  const big = f >= 1 ? f : 1 / f;
  const r = Math.round(kFromFactor(big, d));
  if (r >= 1 && Math.abs(r ** d - big) < 1e-9 * big) return f >= 1 ? r : 1 / r;
  return null;
}

/** Ist v (fast) der Kehrwert einer ganzen Zahl n ≥ 2? Liefert n, sonst null (für „· 1/8“). */
export function reciprocalInt(v: number): number | null {
  if (!(v > 0) || v >= 1) return null;
  const n = Math.round(1 / v);
  return n >= 2 && Math.abs(1 / n - v) < 1e-9 ? n : null;
}

/* ------------------------------------------------------------------ */
/* Auslegen mit Kopien                                                 */
/* ------------------------------------------------------------------ */

/** Zerlegung der Strecke [0, L] in Einheitsabschnitte (letzter ggf. kürzer). */
export function unitCuts(L: number): number[] {
  const out: number[] = [];
  let x = 0;
  while (x < L - 1e-9) {
    const s = Math.min(1, L - x);
    out.push(s);
    x += s;
  }
  return out;
}

/** Zellen eines Quaders mit den Maßen d (Ecke im Ursprung, Einheitszellen): [Ecke, Größe]. */
export function cells(d: Dims): { at: [number, number, number]; size: [number, number, number] }[] {
  const cx = unitCuts(d[0]);
  const cy = unitCuts(d[1]);
  const cz = unitCuts(d[2]);
  const out: { at: [number, number, number]; size: [number, number, number] }[] = [];
  let z = 0;
  for (const sz of cz) {
    let y = 0;
    for (const sy of cy) {
      let x = 0;
      for (const sx of cx) {
        out.push({ at: [x, y, z], size: [sx, sy, sz] });
        x += sx;
      }
      y += sy;
    }
    z += sz;
  }
  return out;
}

/** Anzahl der vollständigen Einheitswürfel im Raster. */
export function fullCubes(d: Dims): number {
  return Math.floor(d[0] + 1e-9) * Math.floor(d[1] + 1e-9) * Math.floor(d[2] + 1e-9);
}

/** Flächeninhalt eines Vielecks (Gaußsche Trapezformel, Betrag). */
export function polyArea(poly: readonly Pt[]): number {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!;
    const b = poly[(i + 1) % poly.length]!;
    s += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(s) / 2;
}

/**
 * Schneidet ein konvexes Vieleck mit der Halbebene n·p ≤ c ab
 * (Sutherland-Hodgman für eine Kante).
 */
export function clipHalfPlane(poly: readonly Pt[], n: Pt, c: number): Pt[] {
  const out: Pt[] = [];
  const val = (p: Pt) => n[0] * p[0] + n[1] * p[1] - c;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!;
    const b = poly[(i + 1) % poly.length]!;
    const va = val(a);
    const vb = val(b);
    if (va <= 1e-12) out.push(a);
    if ((va < -1e-12 && vb > 1e-12) || (va > 1e-12 && vb < -1e-12)) {
      const t = va / (va - vb);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}

/** Ebene Figuren der Simulation (Maße des Originals in cm). */
export type FigId = 'q' | 'r' | 'd' | 'k';
export interface FigSpec {
  /** charakteristische Länge (Seite bzw. Radius) in cm */
  len: number;
  /** Breite und Höhe des umschließenden Rechtecks in cm */
  w: number;
  h: number;
  /** Flächeninhalt in cm² */
  area: number;
}
const SQRT3 = Math.sqrt(3);
export const FIGS: Record<FigId, FigSpec> = {
  /** Quadrat mit Seite 1 cm */
  q: { len: 1, w: 1, h: 1, area: 1 },
  /** Rechteck 2 cm × 1 cm */
  r: { len: 2, w: 2, h: 1, area: 2 },
  /** gleichseitiges Dreieck mit Seite 2 cm: A = √3 cm² ≈ 1,73 cm² */
  d: { len: 2, w: 2, h: SQRT3, area: SQRT3 },
  /** Kreis mit Radius 1 cm: A = π cm² */
  k: { len: 1, w: 2, h: 2, area: Math.PI },
};

/** Ein Stück beim Auslegen: Vieleck (cm), Anteil an einer Kopie, Drehung gegenüber dem Original. */
export interface Piece {
  poly: Pt[];
  /** Flächenanteil in Kopien (1 = ganze Kopie) */
  frac: number;
  /** 0 oder π (auf dem Kopf stehendes Dreieck) */
  rot: number;
  /** Reihe (für die Reihenfolge der Animation) */
  row: number;
}

/**
 * Legt eine Figur, die m-mal so groß ist wie die Einheitsfigur u (Maße in cm,
 * linke untere Ecke im Ursprung), mit Kopien von u aus.
 * Rechteck/Quadrat: Raster; Dreieck: Dreiecksgitter (auch umgedrehte Kopien);
 * Kreis: Sektoren, deren Fläche je einer Kopie entspricht (Mittelpunkt bei
 * (m·r, m·r)).
 * Die Summe aller Anteile ist m².
 */
export function tiling2D(fig: FigId, m: number, unit = 1): Piece[] {
  const s = FIGS[fig];
  const pieces: Piece[] = [];
  if (fig === 'q' || fig === 'r') {
    const w = s.w * unit;
    const h = s.h * unit;
    let y = 0;
    let row = 0;
    for (const sy of unitCuts(m)) {
      let x = 0;
      for (const sx of unitCuts(m)) {
        pieces.push({
          poly: [
            [x * w, y * h],
            [(x + sx) * w, y * h],
            [(x + sx) * w, (y + sy) * h],
            [x * w, (y + sy) * h],
          ],
          frac: sx * sy,
          rot: 0,
          row,
        });
        x += sx;
      }
      y += sy;
      row++;
    }
    return pieces;
  }
  if (fig === 'd') {
    // Gitterkoordinaten (u, v): Punkt = a·(u + v/2, v·√3/2), a = Seite der Kopie
    const a = s.len * unit;
    const P = (u: number, v: number): Pt => [a * (u + v / 2), (a * v * SQRT3) / 2];
    const rows = Math.ceil(m - 1e-9);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i + j < m - 1e-9; i++) {
        // aufrechtes Dreieck (i, j)
        const up: Pt[] = [
          [i, j],
          [i + 1, j],
          [i, j + 1],
        ];
        const cu = clipHalfPlane(up, [1, 1], m);
        if (cu.length >= 3) pieces.push({ poly: cu.map(([u, v]) => P(u, v)), frac: polyArea(cu) / 0.5, rot: 0, row: j });
        // umgedrehtes Dreieck rechts daneben
        if (i + j + 1 < m - 1e-9) {
          const dn: Pt[] = [
            [i + 1, j],
            [i + 1, j + 1],
            [i, j + 1],
          ];
          const cd = clipHalfPlane(dn, [1, 1], m);
          if (cd.length >= 3) pieces.push({ poly: cd.map(([u, v]) => P(u, v)), frac: polyArea(cd) / 0.5, rot: Math.PI, row: j });
        }
      }
    }
    return pieces;
  }
  // Kreis: Sektoren mit dem Flächeninhalt einer Kopie
  const r = s.len * unit;
  const R = m * r;
  const total = m * m;
  const n = Math.ceil(total - 1e-9);
  for (let i = 0; i < n; i++) {
    const frac = Math.min(1, total - i);
    const a0 = (2 * Math.PI * i) / total;
    const a1 = (2 * Math.PI * (i + frac)) / total;
    const poly: Pt[] = [[R, R]];
    const steps = Math.max(2, Math.ceil(((a1 - a0) / (2 * Math.PI)) * 160));
    for (let t = 0; t <= steps; t++) {
      const a = a0 + ((a1 - a0) * t) / steps;
      // im Uhrzeigersinn ab „12 Uhr“
      poly.push([R + R * Math.sin(a), R + R * Math.cos(a)]);
    }
    pieces.push({ poly, frac, rot: 0, row: i });
  }
  return pieces;
}

/** Ein Block beim Auslegen eines Körpers: Ecke, Größe (cm), Anteil an einer Kopie, Schicht. */
export interface Block {
  at: [number, number, number];
  size: [number, number, number];
  frac: number;
  layer: number;
}

/**
 * Legt einen Quader, der m-mal so groß ist wie der Einheitsquader u (Maße in cm),
 * mit Kopien von u aus – Schicht für Schicht von unten. Summe der Anteile: m³.
 */
export function tiling3D(u: Dims, m: number): Block[] {
  const out: Block[] = [];
  const cuts = unitCuts(m);
  let z = 0;
  cuts.forEach((sz, layer) => {
    let y = 0;
    for (const sy of cuts) {
      let x = 0;
      for (const sx of cuts) {
        out.push({ at: [x * u[0], y * u[1], z * u[2]], size: [sx * u[0], sy * u[1], sz * u[2]], frac: sx * sy * sz, layer });
        x += sx;
      }
      y += sy;
    }
    z += sz;
  });
  return out;
}

/** Summe der Anteile (zum Zählen: „2,25 Kopien“). */
export function totalFrac(list: readonly { frac: number }[]): number {
  return list.reduce((s, p) => s + p.frac, 0);
}

/* ------------------------------------------------------------------ */
/* Körper                                                              */
/* ------------------------------------------------------------------ */

/** Ausgangskörper: Würfel 1 cm × 1 cm × 1 cm oder Quader 1 cm × 2 cm × 1 cm (Tiefe × Breite × Höhe). */
export type ObjId = 'w' | 'q';
export const BODIES: Record<ObjId, Dims> = { w: [1, 1, 1], q: [1, 2, 1] };

export function boxVolume(d: Dims): number {
  return d[0] * d[1] * d[2];
}
/** Oberfläche eines Quaders: O = 2(ab + bc + ca). */
export function boxSurface(d: Dims): number {
  return 2 * (d[0] * d[1] + d[1] * d[2] + d[2] * d[0]);
}
export function scaleDims(d: Dims, k: number): Dims {
  return [d[0] * k, d[1] * k, d[2] * k];
}

/* ------------------------------------------------------------------ */
/* Anwendungen                                                         */
/* ------------------------------------------------------------------ */

/** Flächeninhalt einer runden Pizza mit Durchmesser d: A = π·(d/2)². */
export function pizzaArea(d: number): number {
  return (Math.PI * d * d) / 4;
}
/** Wie viel mehr Pizza? Flächenfaktor (d₂ : d₁)². */
export function pizzaFactor(d1: number, d2: number): number {
  return (d2 / d1) ** 2;
}

/** Modell im Maßstab 1 : m: Faktoren für Länge, Fläche (Lack), Volumen (bei gleichem Material auch Masse). */
export function modelFactors(m: number): { len: number; area: number; vol: number } {
  return { len: 1 / m, area: 1 / m ** 2, vol: 1 / m ** 3 };
}

/** Würfel mit Kante a: Oberfläche 6a², Volumen a³, Verhältnis O : V = 6/a (in 1/cm). */
export function cubeOV(a: number): { O: number; V: number; ratio: number } {
  return { O: 6 * a * a, V: a ** 3, ratio: 6 / a };
}

/**
 * Würfel mit Kante a in kleine Würfel der Kante e zerteilen (a/e ganzzahlig):
 * Anzahl (a/e)³, Volumen bleibt, Oberfläche wächst auf (a/e)·6a².
 */
export function splitCube(a: number, e: number): { n: number; O0: number; O1: number; V: number } {
  const per = Math.round(a / e);
  return { n: per ** 3, O0: 6 * a * a, O1: per ** 3 * 6 * e * e, V: a ** 3 };
}

/** Kantenlänge der kleinen Würfel beim Zerteilen: 1 cm bei ganzzahligem a ≥ 2, sonst a/2 (8 Teile). */
export function splitEdge(a: number): number {
  return Math.abs(a - Math.round(a)) < 1e-9 && a >= 2 ? 1 : a / 2;
}
