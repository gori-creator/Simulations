/**
 * Doppelpendel als Beispiel für deterministisches Chaos: Bewegungsgleichungen
 * (Punktmassen an masselosen Stangen), RK4-Schritt, Energie.
 */

export const G = 9.81;

/** Zustand [θ₁, θ₂, ω₁, ω₂] (Winkel gegen die Senkrechte, rad). */
export type State = [number, number, number, number];

export interface Pendulum {
  m1: number;
  m2: number;
  l1: number;
  l2: number;
}

/** Ableitung des Zustands (Standardform der Bewegungsgleichungen). */
export function deriv(s: State, P: Pendulum, g = G): State {
  const [t1, t2, w1, w2] = s;
  const { m1, m2, l1, l2 } = P;
  const d = t1 - t2;
  const den = 2 * m1 + m2 - m2 * Math.cos(2 * d);
  const a1 = (-g * (2 * m1 + m2) * Math.sin(t1) - m2 * g * Math.sin(t1 - 2 * t2) - 2 * Math.sin(d) * m2 * (w2 * w2 * l2 + w1 * w1 * l1 * Math.cos(d))) / (l1 * den);
  const a2 = (2 * Math.sin(d) * (w1 * w1 * l1 * (m1 + m2) + g * (m1 + m2) * Math.cos(t1) + w2 * w2 * l2 * m2 * Math.cos(d))) / (l2 * den);
  return [w1, w2, a1, a2];
}

/** Ein Runge-Kutta-Schritt 4. Ordnung. */
export function step(s: State, P: Pendulum, h: number): State {
  const add = (a: State, b: State, k: number): State => [a[0] + k * b[0], a[1] + k * b[1], a[2] + k * b[2], a[3] + k * b[3]];
  const k1 = deriv(s, P);
  const k2 = deriv(add(s, k1, h / 2), P);
  const k3 = deriv(add(s, k2, h / 2), P);
  const k4 = deriv(add(s, k3, h), P);
  return [0, 1, 2, 3].map((i) => s[i]! + (h / 6) * (k1[i]! + 2 * k2[i]! + 2 * k3[i]! + k4[i]!)) as State;
}

/** Gesamtenergie (J), Nullniveau am Aufhängepunkt. */
export function energy(s: State, P: Pendulum, g = G): number {
  const [t1, t2, w1, w2] = s;
  const { m1, m2, l1, l2 } = P;
  const v1sq = (l1 * w1) ** 2;
  const v2sq = (l1 * w1) ** 2 + (l2 * w2) ** 2 + 2 * l1 * l2 * w1 * w2 * Math.cos(t1 - t2);
  const T = 0.5 * m1 * v1sq + 0.5 * m2 * v2sq;
  const V = -(m1 + m2) * g * l1 * Math.cos(t1) - m2 * g * l2 * Math.cos(t2);
  return T + V;
}

/** Positionen der beiden Massen (Aufhängung im Ursprung, y nach oben). */
export function positions(s: State, P: Pendulum): [[number, number], [number, number]] {
  const x1 = P.l1 * Math.sin(s[0]);
  const y1 = -P.l1 * Math.cos(s[0]);
  return [
    [x1, y1],
    [x1 + P.l2 * Math.sin(s[1]), y1 - P.l2 * Math.cos(s[1])],
  ];
}
