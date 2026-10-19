/**
 * Rechenlogik „Matrizen als lineare Abbildungen“ (Jgst. 12–14 / Studium).
 *
 * A = (a b; c d) bildet x auf A·x ab. Die Spalten von A sind die Bilder der
 * Einheitsvektoren e₁ und e₂. det A = ad − bc ist der Faktor, mit dem sich
 * Flächeninhalte ändern (negativ: Orientierung kehrt sich um, 0: alles
 * landet auf einer Geraden oder im Ursprung). Eigenvektoren werden nur
 * gestreckt: A·v = λ·v.
 */

export type Vec = [number, number];
export interface Mat {
  a: number;
  b: number;
  c: number;
  d: number;
}

export const IDENTITY: Mat = { a: 1, b: 0, c: 0, d: 1 };

export function apply(m: Mat, v: Vec): Vec {
  return [m.a * v[0] + m.b * v[1], m.c * v[0] + m.d * v[1]];
}

export function det(m: Mat): number {
  return m.a * m.d - m.b * m.c;
}

export function mul(m: Mat, n: Mat): Mat {
  return { a: m.a * n.a + m.b * n.c, b: m.a * n.b + m.b * n.d, c: m.c * n.a + m.d * n.c, d: m.c * n.b + m.d * n.d };
}

/** Lineare Überblendung von E nach A (für die Animation). */
export function lerpMat(m: Mat, n: Mat, t: number): Mat {
  return { a: m.a + (n.a - m.a) * t, b: m.b + (n.b - m.b) * t, c: m.c + (n.c - m.c) * t, d: m.d + (n.d - m.d) * t };
}

/** Reelle Eigenwerte mit Eigenvektoren (normiert); leer bei komplexen Eigenwerten. */
export function eigen(m: Mat): { value: number; vector: Vec }[] {
  const tr = m.a + m.d;
  const D = det(m);
  const disc = tr * tr - 4 * D;
  if (disc < -1e-12) return [];
  const s = Math.sqrt(Math.max(0, disc));
  const values = disc <= 1e-12 ? [tr / 2] : [(tr + s) / 2, (tr - s) / 2];
  const out: { value: number; vector: Vec }[] = [];
  for (const l of values) {
    // (A − λE)v = 0
    let v: Vec;
    if (Math.abs(m.b) > 1e-12) v = [m.b, l - m.a];
    else if (Math.abs(m.c) > 1e-12) v = [l - m.d, m.c];
    else v = Math.abs(m.a - l) < 1e-12 ? [1, 0] : [0, 1];
    const n = Math.hypot(v[0], v[1]);
    out.push({ value: l, vector: [v[0] / n, v[1] / n] });
    // Vielfaches der Einheitsmatrix: jede Richtung ist Eigenrichtung – zweite Richtung ergänzen
    if (disc <= 1e-12 && Math.abs(m.b) < 1e-12 && Math.abs(m.c) < 1e-12) out.push({ value: l, vector: [0, 1] });
  }
  return out;
}

export type Kind = 'identity' | 'rotation' | 'reflection' | 'scaling' | 'shear' | 'projection' | 'general';

/** Grobe Einordnung der Abbildung. */
export function classify(m: Mat, eps = 1e-9): Kind {
  const D = det(m);
  const near = (x: number, y: number) => Math.abs(x - y) < eps;
  if (near(m.a, 1) && near(m.b, 0) && near(m.c, 0) && near(m.d, 1)) return 'identity';
  if (Math.abs(D) < eps) return 'projection';
  const orth = near(m.a * m.b + m.c * m.d, 0) && near(m.a * m.a + m.c * m.c, 1) && near(m.b * m.b + m.d * m.d, 1);
  if (orth) return D > 0 ? 'rotation' : 'reflection';
  if (near(m.b, 0) && near(m.c, 0)) return 'scaling';
  if (near(D, 1) && ((near(m.a, 1) && near(m.d, 1)) || near(m.a + m.d, 2)) && (near(m.b, 0) || near(m.c, 0))) return 'shear';
  return 'general';
}
