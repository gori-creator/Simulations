/**
 * Lektion „Backpropagation“: ein Neuron als Rechengraph.
 * z = w·x + b,  a = σ(z),  L = (a − y)².
 * Rückwärts mit der Kettenregel: ∂L/∂a = 2(a − y), ∂a/∂z = a(1 − a),
 * ∂L/∂z = ∂L/∂a · ∂a/∂z, ∂L/∂w = ∂L/∂z · x, ∂L/∂b = ∂L/∂z.
 */
export const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

export interface Params {
  w: number;
  b: number;
}

export const SAMPLE = { x: 1.5, y: 0 };
export const START: Params = { w: 0.8, b: -0.2 };
export const ETA = 0.5;

export interface Pass {
  z: number;
  a: number;
  L: number;
  dLda: number;
  dadz: number;
  dLdz: number;
  dLdw: number;
  dLdb: number;
}

export function pass(p: Params, x = SAMPLE.x, y = SAMPLE.y): Pass {
  const z = p.w * x + p.b;
  const a = sigmoid(z);
  const L = (a - y) ** 2;
  const dLda = 2 * (a - y);
  const dadz = a * (1 - a);
  const dLdz = dLda * dadz;
  return { z, a, L, dLda, dadz, dLdz, dLdw: dLdz * x, dLdb: dLdz };
}

export function step(p: Params, eta = ETA): Params {
  const g = pass(p);
  return { w: p.w - eta * g.dLdw, b: p.b - eta * g.dLdb };
}

/** Numerische Ableitung zum Vergleich (zentraler Differenzenquotient). */
export function numericGrad(p: Params, h = 1e-5): { dw: number; db: number } {
  const L = (q: Params) => pass(q).L;
  return { dw: (L({ ...p, w: p.w + h }) - L({ ...p, w: p.w - h })) / (2 * h), db: (L({ ...p, b: p.b + h }) - L({ ...p, b: p.b - h })) / (2 * h) };
}
