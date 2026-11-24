/**
 * Rechenlogik „Elektromagnetischer Schwingkreis“: Kondensator C, Spule L und
 * Widerstand R in Reihe. Zur Zeit t = 0 ist der Kondensator auf U₀ geladen,
 * es fließt noch kein Strom. Die Ladung q(t) folgt
 *   L · q'' + R · q' + q / C = 0.
 * Dazu die Selbstinduktion beim Ein- und Ausschalten einer Spule.
 */

/** Eigenkreisfrequenz ω₀ = 1/√(LC) in 1/s. */
export function omega0(L: number, C: number): number {
  return 1 / Math.sqrt(L * C);
}

/** Thomson-Gleichung: T = 2π · √(L · C) in s (ungedämpft). */
export function thomsonPeriod(L: number, C: number): number {
  return 2 * Math.PI * Math.sqrt(L * C);
}

/** Abklingkonstante δ = R / (2L) in 1/s. */
export function decay(R: number, L: number): number {
  return R / (2 * L);
}

export type DampingCase = 'none' | 'weak' | 'critical' | 'strong';

/** Art der Dämpfung: ungedämpft, schwach (schwingt), aperiodischer Grenzfall, Kriechfall. */
export function dampingCase(L: number, C: number, R: number): DampingCase {
  if (R <= 0) return 'none';
  const d = decay(R, L);
  const w0 = omega0(L, C);
  if (Math.abs(d - w0) < 1e-9 * w0) return 'critical';
  return d < w0 ? 'weak' : 'strong';
}

/** Gedämpfte Periodendauer T_d = 2π / √(ω₀² − δ²); bei Grenz- und Kriechfall unendlich. */
export function dampedPeriod(L: number, C: number, R: number): number {
  const d = decay(R, L);
  const w0 = omega0(L, C);
  return d < w0 ? (2 * Math.PI) / Math.sqrt(w0 * w0 - d * d) : Infinity;
}

/** Ladung q(t) und Strom i(t) = dq/dt für q(0) = q₀, i(0) = 0. */
export function lcState(L: number, C: number, R: number, q0: number, t: number): { q: number; i: number } {
  const w0 = omega0(L, C);
  const d = decay(R, L);
  if (d < w0 * (1 - 1e-9)) {
    const w = Math.sqrt(w0 * w0 - d * d);
    const e = Math.exp(-d * t);
    const q = q0 * e * (Math.cos(w * t) + (d / w) * Math.sin(w * t));
    const i = -q0 * e * ((w0 * w0) / w) * Math.sin(w * t);
    return { q, i };
  }
  if (d <= w0 * (1 + 1e-9)) {
    const e = Math.exp(-d * t);
    return { q: q0 * e * (1 + d * t), i: -q0 * d * d * t * e };
  }
  const b = Math.sqrt(d * d - w0 * w0);
  const s1 = -d + b;
  const s2 = -d - b;
  const e1 = Math.exp(s1 * t);
  const e2 = Math.exp(s2 * t);
  return { q: (q0 / (s2 - s1)) * (s2 * e1 - s1 * e2), i: ((q0 * s1 * s2) / (s2 - s1)) * (e1 - e2) };
}

/** Energie im Kondensator q²/(2C) und in der Spule L·i²/2 (in J). */
export function energies(L: number, C: number, q: number, i: number): { el: number; mag: number } {
  return { el: (q * q) / (2 * C), mag: 0.5 * L * i * i };
}

/** Federpendel mit derselben Periode: Federhärte D = m · ω₀² (Masse m in kg). */
export function springForSamePeriod(L: number, C: number, m: number): number {
  const w = omega0(L, C);
  return m * w * w;
}

// ───────────────────────── Selbstinduktion ─────────────────────────

/**
 * Zwei gleiche Zweige an der Spannung U₀: Lampe mit Spule (Induktivität L) und
 * Lampe mit Widerstand; jeder Zweig hat den Widerstand R.
 * Einschalten: Im Spulenzweig steigt der Strom mit τ = L/R an, im anderen sofort.
 * Ausschalten: Der Spulenstrom fließt im Kreis durch beide Zweige weiter (2R)
 * und klingt mit τ = L/(2R) ab; die Lampe ohne Spule wird dabei rückwärts durchflossen.
 */
export interface SwitchState {
  /** Strom im Spulenzweig (A) */
  iCoil: number;
  /** Strom im Widerstandszweig (A), positiv in Richtung der Quelle */
  iRes: number;
  /** Spannung an der Spule u_L = L · di/dt (V) */
  uL: number;
}

export function switchOn(U0: number, R: number, L: number, t: number): SwitchState {
  const I0 = U0 / R;
  const tau = L / R;
  const e = Math.exp(-t / tau);
  return { iCoil: I0 * (1 - e), iRes: I0, uL: U0 * e };
}

/** Ausschalten nach vollem Strom I₀ = U₀/R (t ab dem Öffnen des Schalters). */
export function switchOff(U0: number, R: number, L: number, t: number): SwitchState {
  const I0 = U0 / R;
  const tau = L / (2 * R);
  const i = I0 * Math.exp(-t / tau);
  return { iCoil: i, iRes: -i, uL: -2 * R * i };
}

/** Zeitkonstante beim Einschalten τ = L/R in s. */
export function timeConstant(L: number, R: number): number {
  return L / R;
}

/** Energie im Magnetfeld der Spule W = ½ · L · I² in J. */
export function fieldEnergy(L: number, I: number): number {
  return 0.5 * L * I * I;
}
