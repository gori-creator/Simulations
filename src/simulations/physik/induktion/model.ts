/**
 * Rechenlogik „Elektromagnetische Induktion“ (ohne Zeichnen).
 *
 * Induktionsgesetz: Ändert sich der magnetische Fluss Φ = B · A · cos φ durch
 * eine Spule mit n Windungen, wird die Spannung
 *
 *   U_ind = −n · dΦ/dt
 *
 * induziert. Das Minuszeichen ist die Lenzsche Regel: Der Induktionsstrom ist
 * so gerichtet, dass er seiner Ursache entgegenwirkt.
 *
 * Drei Versuche:
 * 1. Magnet in Spule: Der Fluss hängt vom Abstand des Stabmagneten ab
 *    (Feld auf der Achse eines Zylindermagneten).
 * 2. Leiterschleife im Feld: Ein Stab der Länge l gleitet mit v auf Schienen
 *    durch ein homogenes Feld B; die Fläche A = l · x wächst, U = B · l · v.
 * 3. Generator: Eine Spule dreht sich mit ω = 2π f im homogenen Feld,
 *    Φ = B · A · cos(ω t), U = n · B · A · ω · sin(ω t), Û = n · B · A · ω.
 *
 * Einheiten: SI (T, m, m², s, V, Wb).
 */

/** Spannung am bewegten Leiter: U = B · l · v. */
export function motionalVoltage(B: number, l: number, v: number): number {
  return B * l * v;
}

/** Strom im Kreis mit Widerstand R. */
export function current(U: number, R: number): number {
  return R > 0 ? U / R : 0;
}

/** Kraft auf den stromdurchflossenen Stab: F = B · I · l (bremst nach Lenz). */
export function brakingForce(B: number, I: number, l: number): number {
  return B * I * l;
}

/** Magnetischer Fluss Φ = B · A · cos φ. */
export function flux(B: number, A: number, phi = 0): number {
  return B * A * Math.cos(phi);
}

/** Generator: Scheitelspannung Û = n · B · A · ω mit ω = 2π f. */
export function generatorPeak(n: number, B: number, A: number, f: number): number {
  return n * B * A * 2 * Math.PI * f;
}

/** Generator: Momentanspannung U(t) = Û · sin(ω t) (Fluss Φ = B · A · cos(ω t)). */
export function generatorVoltage(n: number, B: number, A: number, f: number, t: number): number {
  return generatorPeak(n, B, A, f) * Math.sin(2 * Math.PI * f * t);
}

/** Effektivwert einer Sinusspannung: U_eff = Û / √2. */
export function rms(peak: number): number {
  return peak / Math.SQRT2;
}

/* ------------------------------------------------------------------ */
/* Stabmagnet und Spule                                                */
/* ------------------------------------------------------------------ */

/** Daten des Stabmagneten (Zylinder) und der Spule. */
export const MAGNET = {
  /** Remanenz in T (Neodym, gerundet). */
  Br: 1.2,
  /** Länge und Radius in m. */
  length: 0.08,
  radius: 0.012,
};
/** Spulenradius in m (Fläche A = π r²). */
export const COIL_RADIUS = 0.02;
export const COIL_AREA = Math.PI * COIL_RADIUS * COIL_RADIUS;

/**
 * Feld auf der Achse eines Zylindermagneten im Abstand z vor seiner Stirnfläche
 * (z > 0 außerhalb): B = Br/2 · [(z + L)/√((z + L)² + R²) − z/√(z² + R²)].
 */
export function axialField(z: number, Br = MAGNET.Br, L = MAGNET.length, R = MAGNET.radius): number {
  return (Br / 2) * ((z + L) / Math.hypot(z + L, R) - z / Math.hypot(z, R));
}

/** Fluss durch die Spule (n Windungen zusammen: n · Φ), Magnet im Abstand z von der Spulenmitte. */
export function coilLinkage(z: number, n: number, A = COIL_AREA): number {
  return n * axialField(z) * A;
}

/** Induzierte Spannung für Magnet bei z mit Geschwindigkeit dz/dt (positiv: Magnet entfernt sich). */
export function magnetVoltage(z: number, dzdt: number, n: number, A = COIL_AREA): number {
  const h = 1e-5;
  const dPhidz = (coilLinkage(z + h, n, A) - coilLinkage(z - h, n, A)) / (2 * h);
  return -dPhidz * dzdt;
}

/** Numerische Ableitung einer Messreihe U = −n · ΔΦ/Δt (zentrale Differenz). */
export function inducedFromSamples(phi0: number, phi1: number, dt: number, n = 1): number {
  return dt > 0 ? (-n * (phi1 - phi0)) / dt : 0;
}
