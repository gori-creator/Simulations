/**
 * Methode der kleinen Schritte: Bewegungen mit veränderlicher Kraft
 * schrittweise berechnen (wie in einer Tabellenkalkulation) und mit der
 * genauen Lösung vergleichen.
 */

export const G = 9.81;

export interface Step {
  t: number;
  /** Ort (m) */
  s: number;
  /** Geschwindigkeit (m/s) */
  v: number;
  /** Beschleunigung (m/s²) */
  a: number;
}

export type Method = 'euler' | 'cromer';

/**
 * Schrittweise Rechnung: a aus dem aktuellen Zustand, dann
 * Euler:   s_neu = s + v · Δt,      v_neu = v + a · Δt
 * Cromer:  v_neu = v + a · Δt,      s_neu = s + v_neu · Δt  (stabil für Schwingungen)
 */
export function integrate(accel: (s: number, v: number) => number, s0: number, v0: number, dt: number, tEnd: number, method: Method): Step[] {
  const out: Step[] = [];
  let s = s0;
  let v = v0;
  let t = 0;
  const n = Math.round(tEnd / dt);
  for (let k = 0; k <= n; k++) {
    const a = accel(s, v);
    out.push({ t, s, v, a });
    if (method === 'euler') {
      const sn = s + v * dt;
      v = v + a * dt;
      s = sn;
    } else {
      v = v + a * dt;
      s = s + v * dt;
    }
    t = (k + 1) * dt;
  }
  return out;
}

/** Fall mit Luftwiderstand F = k v²: Beschleunigung a = g − (k/m) v². */
export function fallAccel(m: number, k: number): (s: number, v: number) => number {
  return (_s, v) => G - (k / m) * v * Math.abs(v);
}

/** Endgeschwindigkeit v_E = √(m g / k). */
export function terminalVelocity(m: number, k: number): number {
  return Math.sqrt((m * G) / k);
}

/** Genaue Lösung für den Fall aus der Ruhe: v(t) = v_E · tanh(g t / v_E), s(t) = v_E² / g · ln cosh(g t / v_E). */
export function fallExact(m: number, k: number, t: number): { s: number; v: number } {
  const vE = terminalVelocity(m, k);
  const x = (G * t) / vE;
  return { v: vE * Math.tanh(x), s: ((vE * vE) / G) * Math.log(Math.cosh(x)) };
}

/** Federpendel: a = −(D/m) · s. */
export function springAccel(m: number, D: number): (s: number, v: number) => number {
  return (s) => (-D / m) * s;
}

/** Genaue Lösung des Federpendels aus der Auslenkung s₀ in Ruhe. */
export function springExact(m: number, D: number, s0: number, t: number): { s: number; v: number } {
  const w = Math.sqrt(D / m);
  return { s: s0 * Math.cos(w * t), v: -s0 * w * Math.sin(w * t) };
}
