/**
 * Dynamische Systeme und Fraktale: Räuber-Beute-Modell (Lotka-Volterra),
 * logistische Gleichung mit Feigenbaum-Diagramm, Koch-Schneeflocke und
 * Sierpinski-Dreieck.
 */

export type Pt = [number, number];

/* ---------- Räuber-Beute ---------- */

export interface LvParams {
  /** Vermehrungsrate der Beute */
  a: number;
  /** Fressrate */
  b: number;
  /** Sterberate der Räuber */
  c: number;
  /** Umwandlung Beute → Räuber */
  d: number;
}

function lvRate(p: LvParams, x: number, y: number): Pt {
  return [p.a * x - p.b * x * y, p.d * x * y - p.c * y];
}

/** Lösung mit dem Runge-Kutta-Verfahren: Zeiten, Beute x, Räuber y. */
export function lotkaVolterra(p: LvParams, x0: number, y0: number, T: number, dt = 0.01): { t: number[]; x: number[]; y: number[] } {
  const t = [0];
  const xs = [x0];
  const ys = [y0];
  let x = x0;
  let y = y0;
  const n = Math.round(T / dt);
  for (let i = 1; i <= n; i++) {
    const k1 = lvRate(p, x, y);
    const k2 = lvRate(p, x + (dt / 2) * k1[0], y + (dt / 2) * k1[1]);
    const k3 = lvRate(p, x + (dt / 2) * k2[0], y + (dt / 2) * k2[1]);
    const k4 = lvRate(p, x + dt * k3[0], y + dt * k3[1]);
    x += (dt / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    y += (dt / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
    t.push(i * dt);
    xs.push(x);
    ys.push(y);
  }
  return { t, x: xs, y: ys };
}

/** Gleichgewicht (x*, y*) = (c/d, a/b). */
export function lvEquilibrium(p: LvParams): Pt {
  return [p.c / p.d, p.a / p.b];
}

/** Erhaltungsgröße V = d·x − c·ln x + b·y − a·ln y (bleibt längs einer Bahn konstant). */
export function lvInvariant(p: LvParams, x: number, y: number): number {
  return p.d * x - p.c * Math.log(x) + p.b * y - p.a * Math.log(y);
}

/* ---------- logistische Gleichung ---------- */

export function logistic(r: number, x0: number, n: number): number[] {
  const out = [x0];
  let x = x0;
  for (let i = 0; i < n; i++) {
    x = r * x * (1 - x);
    out.push(x);
  }
  return out;
}

/** Werte, die die Folge nach dem Einschwingen annimmt (für das Feigenbaum-Diagramm). */
export function attractor(r: number, skip = 400, keep = 120, x0 = 0.5): number[] {
  let x = x0;
  for (let i = 0; i < skip; i++) x = r * x * (1 - x);
  const out: number[] = [];
  for (let i = 0; i < keep; i++) {
    x = r * x * (1 - x);
    out.push(x);
  }
  return out;
}

/** Anzahl verschiedener Werte im Endverhalten (Periode; 0 = chaotisch/mehr als 64). */
export function period(r: number): number {
  const a = attractor(r, 2000, 128);
  const last = a[a.length - 1]!;
  for (let p = 1; p <= 64; p++) if (Math.abs(a[a.length - 1 - p]! - last) < 1e-6) return p;
  return 0;
}

/* ---------- Fraktale ---------- */

/** Koch-Schneeflocke nach n Schritten (geschlossener Linienzug, Startdreieck mit Seitenlänge 1). */
export function koch(n: number): Pt[] {
  const h = Math.sqrt(3) / 2;
  let pts: Pt[] = [
    [0, 0],
    [0.5, h],
    [1, 0],
  ];
  for (let k = 0; k < n; k++) {
    const next: Pt[] = [];
    for (let i = 0; i < pts.length; i++) {
      const A = pts[i]!;
      const B = pts[(i + 1) % pts.length]!;
      const dx = (B[0] - A[0]) / 3;
      const dy = (B[1] - A[1]) / 3;
      const P: Pt = [A[0] + dx, A[1] + dy];
      const Q: Pt = [A[0] + 2 * dx, A[1] + 2 * dy];
      // Spitze nach außen (bei diesem Umlaufsinn: Drehung um +60°)
      const c = Math.cos(Math.PI / 3);
      const s = Math.sin(Math.PI / 3);
      const T: Pt = [P[0] + dx * c - dy * s, P[1] + dx * s + dy * c];
      next.push(A, P, T, Q);
    }
    pts = next;
  }
  return pts;
}

export function kochPerimeter(n: number): number {
  return 3 * Math.pow(4 / 3, n);
}

/** Fläche der Koch-Schneeflocke (Startdreieck mit Seitenlänge 1). */
export function kochArea(n: number): number {
  const A0 = Math.sqrt(3) / 4;
  let A = A0;
  for (let k = 1; k <= n; k++) A += 3 * Math.pow(4, k - 1) * (A0 / Math.pow(9, k));
  return A;
}

/** Sierpinski-Dreieck: die übrig bleibenden Dreiecke nach n Schritten. */
export function sierpinski(n: number): Pt[][] {
  const h = Math.sqrt(3) / 2;
  let tris: Pt[][] = [
    [
      [0, 0],
      [1, 0],
      [0.5, h],
    ],
  ];
  for (let k = 0; k < n; k++) {
    const next: Pt[][] = [];
    for (const [A, B, C] of tris as [Pt, Pt, Pt][]) {
      const m = (P: Pt, Q: Pt): Pt => [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2];
      const AB = m(A, B);
      const BC = m(B, C);
      const CA = m(C, A);
      next.push([A, AB, CA], [AB, B, BC], [CA, BC, C]);
    }
    tris = next;
  }
  return tris;
}

/** Fraktale Dimension log(Anzahl Teile) / log(Vergrößerungsfaktor). */
export function similarityDimension(parts: number, factor: number): number {
  return Math.log(parts) / Math.log(factor);
}
