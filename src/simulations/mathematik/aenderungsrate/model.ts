/**
 * Rechenlogik „Integral als Gesamtänderung“ (Jgst. 13).
 *
 * Kennt man die Änderungsrate r(t) einer Größe (Geschwindigkeit, Zufluss),
 * so ist die Änderung der Größe im Zeitraum [0; t] das Integral:
 *   B(t) = B(0) + ∫₀ᵗ r(u) du   („Rekonstruktion des Bestands“)
 * Näherung durch Rechtecke: Σ r(tᵢ) · Δt.
 */

export type SitKey = 'car' | 'tank' | 'bike';

export interface Situation {
  rate: (t: number) => number;
  /** exakte Änderung ∫₀ᵗ r(u) du */
  change: (t: number) => number;
  T: number;
}

const PI = Math.PI;

export const SITS: Record<SitKey, Situation> = {
  // Auto: 10 s beschleunigen auf 20 m/s, 30 s konstant, 10 s bremsen, 10 s stehen
  car: {
    rate: (t) => (t <= 10 ? 2 * t : t <= 40 ? 20 : t <= 50 ? 20 - 2 * (t - 40) : 0),
    change: (t) => {
      if (t <= 10) return t * t;
      if (t <= 40) return 100 + 20 * (t - 10);
      if (t <= 50) {
        const u = t - 40;
        return 700 + 20 * u - u * u;
      }
      return 800;
    },
    T: 60,
  },
  // Wassertank: Zufluss 4 L/min, linear abnehmend, ab 20 min Abfluss
  tank: { rate: (t) => 4 - 0.2 * t, change: (t) => 4 * t - 0.1 * t * t, T: 40 },
  // Radfahrt mit schwankender Geschwindigkeit
  bike: { rate: (t) => 5 + 3 * Math.sin((PI * t) / 30), change: (t) => 5 * t + (90 / PI) * (1 - Math.cos((PI * t) / 30)), T: 120 },
};

/** Linke Rechtecksumme mit n Streifen auf [0; t]. */
export function leftSum(s: Situation, t: number, n: number): number {
  if (n <= 0 || t <= 0) return 0;
  const dt = t / n;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += s.rate(i * dt) * dt;
  return sum;
}
