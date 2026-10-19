/**
 * Rechenlogik „Ableitungsfunktion grafisch“ (Jgst. 11).
 *
 * Für jede Stelle x ist f'(x) die Steigung der Tangente an den Graphen von f.
 * Trägt man diese Steigungen auf, entsteht der Graph der Ableitungsfunktion:
 * - f steigt ⇔ f' > 0, f fällt ⇔ f' < 0
 * - waagrechte Tangente (Extremum, Terrassenpunkt) ⇔ Nullstelle von f'
 * - Wendestelle von f ⇔ Extremstelle von f'
 */

export type FnKey = 'par' | 'cub' | 'quart' | 'sin' | 'exp';

export interface Fn {
  f: (x: number) => number;
  d1: (x: number) => number;
  d2: (x: number) => number;
  x: [number, number];
}

export const FNS: Record<FnKey, Fn> = {
  par: { f: (x) => 0.5 * x * x - 2, d1: (x) => x, d2: () => 1, x: [-4, 4] },
  cub: { f: (x) => (x ** 3 - 6 * x) / 4, d1: (x) => (3 * x * x - 6) / 4, d2: (x) => 1.5 * x, x: [-3.5, 3.5] },
  quart: { f: (x) => 0.1 * x ** 4 - x * x + 1, d1: (x) => 0.4 * x ** 3 - 2 * x, d2: (x) => 1.2 * x * x - 2, x: [-3.6, 3.6] },
  sin: { f: Math.sin, d1: Math.cos, d2: (x) => -Math.sin(x), x: [-6.5, 6.5] },
  exp: { f: Math.exp, d1: Math.exp, d2: Math.exp, x: [-4, 2] },
};

/** Nullstellen von g auf [a, b] (Vorzeichenwechsel, Halbierung); berührende Nullstellen werden über |g| klein erkannt. */
export function zeros(g: (x: number) => number, a: number, b: number, n = 2000): number[] {
  const out: number[] = [];
  let x0 = a;
  let y0 = g(a);
  if (Math.abs(y0) < 1e-12) out.push(a);
  for (let i = 1; i <= n; i++) {
    const x1 = a + ((b - a) * i) / n;
    const y1 = g(x1);
    if (Math.abs(y1) < 1e-12) out.push(x1);
    else if (y0 * y1 < 0) {
      let lo = x0;
      let hi = x1;
      for (let k = 0; k < 60; k++) {
        const m = (lo + hi) / 2;
        if (g(lo) * g(m) <= 0) hi = m;
        else lo = m;
      }
      out.push((lo + hi) / 2);
    }
    x0 = x1;
    y0 = y1;
  }
  return out.filter((x, i) => i === 0 || Math.abs(x - out[i - 1]!) > 1e-6);
}

/** Art einer Nullstelle von f' (Hoch-, Tiefpunkt oder Terrassenpunkt) über den Vorzeichenwechsel. */
export function extremumKind(fn: Fn, x: number, h = 1e-4): 'max' | 'min' | 'saddle' {
  const l = fn.d1(x - h);
  const r = fn.d1(x + h);
  if (l > 0 && r < 0) return 'max';
  if (l < 0 && r > 0) return 'min';
  return 'saddle';
}

/** Steigung der Sekante durch (x | f(x)) und (x + h | f(x + h)) – nähert f'(x) für kleines h. */
export function secantSlope(fn: Fn, x: number, h: number): number {
  return (fn.f(x + h) - fn.f(x)) / h;
}
