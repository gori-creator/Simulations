/**
 * Rechenlogik „Fourier-Reihen“ (Studium).
 *
 * Eine 2π-periodische Funktion wird als Summe von Sinus- und Kosinus-
 * schwingungen dargestellt:
 *   f(x) ≈ a₀/2 + Σ_{k=1}^{N} (aₖ cos kx + bₖ sin kx)
 * Für die vier Beispielsignale sind die Koeffizienten bekannt. An Sprung-
 * stellen schießt die Partialsumme um rund 9 % der Sprunghöhe über
 * (Gibbs-Phänomen) – unabhängig davon, wie groß N ist.
 */

export type SigKey = 'sq' | 'saw' | 'tri' | 'half';

const PI = Math.PI;

/** Zielfunktion auf einer Periode (−π, π], periodisch fortgesetzt. */
export function target(sig: SigKey, x: number): number {
  const t = ((((x + PI) % (2 * PI)) + 2 * PI) % (2 * PI)) - PI;
  switch (sig) {
    case 'sq':
      return t === 0 || Math.abs(t) === PI ? 0 : Math.sign(t);
    case 'saw':
      return Math.abs(t) === PI ? 0 : t / PI;
    case 'tri':
      return 1 - (2 * Math.abs(t)) / PI;
    case 'half':
      return Math.max(Math.sin(t), 0);
  }
}

/** a₀ (konstanter Anteil ist a₀/2). */
export function a0(sig: SigKey): number {
  return sig === 'half' ? 2 / PI : 0;
}

/** Koeffizienten aₖ, bₖ für k ≥ 1. */
export function coef(sig: SigKey, k: number): { a: number; b: number } {
  switch (sig) {
    case 'sq':
      return { a: 0, b: k % 2 === 1 ? 4 / (PI * k) : 0 };
    case 'saw':
      return { a: 0, b: ((k % 2 === 1 ? 1 : -1) * 2) / (PI * k) };
    case 'tri':
      return { a: k % 2 === 1 ? 8 / (PI * PI * k * k) : 0, b: 0 };
    case 'half':
      if (k === 1) return { a: 0, b: 0.5 };
      return { a: k % 2 === 0 ? -2 / (PI * (k * k - 1)) : 0, b: 0 };
  }
}

/** Amplitude der k-ten Teilschwingung √(aₖ² + bₖ²). */
export function amplitude(sig: SigKey, k: number): number {
  const c = coef(sig, k);
  return Math.hypot(c.a, c.b);
}

/** k-te Teilschwingung an der Stelle x. */
export function harmonic(sig: SigKey, k: number, x: number): number {
  const c = coef(sig, k);
  return c.a * Math.cos(k * x) + c.b * Math.sin(k * x);
}

/** Partialsumme S_N(x). */
export function partial(sig: SigKey, N: number, x: number): number {
  let y = a0(sig) / 2;
  for (let k = 1; k <= N; k++) y += harmonic(sig, k, x);
  return y;
}

/** Größter Wert der Partialsumme auf (0, π) (für das Gibbs-Phänomen). */
export function maxPartial(sig: SigKey, N: number, samples = 4000): number {
  let m = -Infinity;
  for (let i = 1; i < samples; i++) m = Math.max(m, partial(sig, N, (PI * i) / samples));
  return m;
}
