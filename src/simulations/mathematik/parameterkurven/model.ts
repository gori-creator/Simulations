/**
 * Kurven in Parameterdarstellung (x(t) | y(t)) und in Polarkoordinaten r(φ),
 * dazu der schräge Wurf als Parabelbahn mit dem Parameter Zeit.
 */

export type Pt = [number, number];
export const G = 9.81;

/* ---------- schräger Wurf ---------- */

/** Ort nach der Zeit t: x = v₀·cos α·t, y = h + v₀·sin α·t − g/2·t². */
export function throwPos(v0: number, alphaDeg: number, h: number, t: number, g = G): Pt {
  const a = (alphaDeg * Math.PI) / 180;
  return [v0 * Math.cos(a) * t, h + v0 * Math.sin(a) * t - 0.5 * g * t * t];
}

/** Flugzeit bis zum Aufprall auf y = 0. */
export function flightTime(v0: number, alphaDeg: number, h: number, g = G): number {
  const vy = v0 * Math.sin((alphaDeg * Math.PI) / 180);
  return (vy + Math.sqrt(vy * vy + 2 * g * h)) / g;
}

/** Scheitelpunkt der Bahn (bei α ≤ 0 der Abwurfpunkt). */
export function apex(v0: number, alphaDeg: number, h: number, g = G): Pt {
  const a = (alphaDeg * Math.PI) / 180;
  const vy = v0 * Math.sin(a);
  if (vy <= 0) return [0, h];
  const t = vy / g;
  return throwPos(v0, alphaDeg, h, t, g);
}

/**
 * Bahngleichung nach Elimination von t: y = h + tan α·x − g/(2·v₀²·cos²α)·x².
 * Rückgabe der Koeffizienten (c, b, a) von y = c + b·x + a·x²; null bei α = 90°.
 */
export function trajectory(v0: number, alphaDeg: number, h: number, g = G): { c: number; b: number; a: number } | null {
  const al = (alphaDeg * Math.PI) / 180;
  const cos = Math.cos(al);
  if (Math.abs(cos) < 1e-9 || v0 <= 0) return null;
  return { c: h, b: Math.tan(al), a: -g / (2 * v0 * v0 * cos * cos) };
}

/* ---------- Parameterkurven ---------- */

export type CurveKind = 'kreis' | 'ellipse' | 'lissajous' | 'zykloide' | 'gerade';

export function curvePoint(kind: CurveKind, a: number, b: number, phiDeg: number, t: number): Pt {
  const ph = (phiDeg * Math.PI) / 180;
  switch (kind) {
    case 'kreis':
      return [a * Math.cos(t), a * Math.sin(t)];
    case 'ellipse':
      return [a * Math.cos(t), b * Math.sin(t)];
    case 'lissajous':
      return [4 * Math.sin(a * t + ph), 4 * Math.sin(b * t)];
    case 'zykloide':
      return [a * (t - Math.sin(t)), a * (1 - Math.cos(t))];
    case 'gerade':
      return [-4 + a * t, 1 + b * t];
  }
}

/** Sinnvoller Parameterbereich je Kurve. */
export function curveRange(kind: CurveKind): [number, number] {
  if (kind === 'zykloide') return [0, 4 * Math.PI];
  if (kind === 'gerade') return [-3, 3];
  return [0, 2 * Math.PI];
}

/* ---------- Polarkoordinaten ---------- */

export type PolarKind = 'kreis' | 'spirale' | 'rose' | 'kardioide' | 'lemniskate';

/** r(φ); NaN, wo die Kurve nicht definiert ist (Lemniskate). */
export function polarR(kind: PolarKind, a: number, k: number, phi: number): number {
  switch (kind) {
    case 'kreis':
      return a;
    case 'spirale':
      return (a / (2 * Math.PI)) * phi;
    case 'rose':
      return a * Math.cos(k * phi);
    case 'kardioide':
      return (a / 2) * (1 + Math.cos(phi));
    case 'lemniskate': {
      const c = Math.cos(2 * phi);
      return c < 0 ? Number.NaN : a * Math.sqrt(c);
    }
  }
}

export function polarRange(kind: PolarKind): [number, number] {
  return kind === 'spirale' ? [0, 6 * Math.PI] : [0, 2 * Math.PI];
}

export function polarToCart(r: number, phi: number): Pt {
  return [r * Math.cos(phi), r * Math.sin(phi)];
}

/** Kartesisch → polar, φ in [0, 2π). */
export function cartToPolar(x: number, y: number): { r: number; phi: number } {
  let phi = Math.atan2(y, x);
  if (phi < 0) phi += 2 * Math.PI;
  return { r: Math.hypot(x, y), phi };
}
