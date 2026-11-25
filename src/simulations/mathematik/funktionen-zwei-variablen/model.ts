/**
 * Funktionen mit zwei Veränderlichen z = f(x, y): Wertefläche, Schnittkurven
 * parallel zu den Koordinatenebenen und partielle Ableitungen.
 */

export type FnId = 'paraboloid' | 'sattel' | 'welle' | 'glocke' | 'ebene';

interface Fn {
  f: (x: number, y: number) => number;
  fx: (x: number, y: number) => number;
  fy: (x: number, y: number) => number;
  term: string;
  fxTerm: string;
  fyTerm: string;
}

export const FUNCTIONS: Record<FnId, Fn> = {
  paraboloid: {
    f: (x, y) => 0.5 * (x * x + y * y),
    fx: (x) => x,
    fy: (_x, y) => y,
    term: 'f(x, y) = ½·(x² + y²)',
    fxTerm: 'fₓ = x',
    fyTerm: 'f_y = y',
  },
  sattel: {
    f: (x, y) => 0.5 * (x * x - y * y),
    fx: (x) => x,
    fy: (_x, y) => -y,
    term: 'f(x, y) = ½·(x² − y²)',
    fxTerm: 'fₓ = x',
    fyTerm: 'f_y = −y',
  },
  welle: {
    f: (x, y) => Math.sin(x) * Math.cos(y),
    fx: (x, y) => Math.cos(x) * Math.cos(y),
    fy: (x, y) => -Math.sin(x) * Math.sin(y),
    term: 'f(x, y) = sin x · cos y',
    fxTerm: 'fₓ = cos x · cos y',
    fyTerm: 'f_y = −sin x · sin y',
  },
  glocke: {
    f: (x, y) => 2 * Math.exp(-(x * x + y * y) / 2),
    fx: (x, y) => -x * 2 * Math.exp(-(x * x + y * y) / 2),
    fy: (x, y) => -y * 2 * Math.exp(-(x * x + y * y) / 2),
    term: 'f(x, y) = 2·e^(−(x² + y²)/2)',
    fxTerm: 'fₓ = −x · f(x, y)',
    fyTerm: 'f_y = −y · f(x, y)',
  },
  ebene: {
    f: (x, y) => 0.5 * x - 0.3 * y + 1,
    fx: () => 0.5,
    fy: () => -0.3,
    term: 'f(x, y) = 0,5x − 0,3y + 1',
    fxTerm: 'fₓ = 0,5',
    fyTerm: 'f_y = −0,3',
  },
};

export type V3 = [number, number, number];

/** Gitternetz der Wertefläche über [−R, R]² mit n × n Feldern. */
export function surfaceMesh(id: FnId, R: number, n: number): { vertices: V3[]; faces: number[][] } {
  const fn = FUNCTIONS[id].f;
  const vertices: V3[] = [];
  for (let j = 0; j <= n; j++)
    for (let i = 0; i <= n; i++) {
      const x = -R + (2 * R * i) / n;
      const y = -R + (2 * R * j) / n;
      vertices.push([x, y, fn(x, y)]);
    }
  const faces: number[][] = [];
  const at = (i: number, j: number) => j * (n + 1) + i;
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) faces.push([at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j + 1)]);
  return { vertices, faces };
}

/** Schnittkurve mit der Ebene y = y0 (Richtung 'x') bzw. x = x0 (Richtung 'y'). */
export function section(id: FnId, dir: 'x' | 'y', c: number, R: number, n = 80): V3[] {
  const fn = FUNCTIONS[id].f;
  const out: V3[] = [];
  for (let k = 0; k <= n; k++) {
    const t = -R + (2 * R * k) / n;
    out.push(dir === 'x' ? [t, c, fn(t, c)] : [c, t, fn(c, t)]);
  }
  return out;
}

/** Numerische partielle Ableitung (zur Kontrolle der Formeln). */
export function numericPartial(id: FnId, dir: 'x' | 'y', x: number, y: number, h = 1e-5): number {
  const f = FUNCTIONS[id].f;
  return dir === 'x' ? (f(x + h, y) - f(x - h, y)) / (2 * h) : (f(x, y + h) - f(x, y - h)) / (2 * h);
}

/** Art eines kritischen Punkts (Gradient 0) über die Hesse-Determinante (numerisch). */
export function criticalKind(id: FnId, x: number, y: number): 'max' | 'min' | 'sattel' | 'unklar' | null {
  const F = FUNCTIONS[id];
  if (Math.abs(F.fx(x, y)) > 1e-6 || Math.abs(F.fy(x, y)) > 1e-6) return null;
  const h = 1e-4;
  const fxx = (F.fx(x + h, y) - F.fx(x - h, y)) / (2 * h);
  const fyy = (F.fy(x, y + h) - F.fy(x, y - h)) / (2 * h);
  const fxy = (F.fx(x, y + h) - F.fx(x, y - h)) / (2 * h);
  const D = fxx * fyy - fxy * fxy;
  if (D > 1e-9) return fxx < 0 ? 'max' : 'min';
  if (D < -1e-9) return 'sattel';
  return 'unklar';
}
