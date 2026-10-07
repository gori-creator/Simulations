/**
 * Hilfen für Animationen, die durch Ereignisse ausgelöst werden (z. B. eine Tür
 * öffnet sich, Teile fliegen an ihren Platz). Die Simulation fragt in
 * `render()` den Fortschritt ab und ruft `ctx.requestRender()`, solange eine
 * Animation läuft.
 */

export const ease = {
  linear: (t: number) => t,
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  outCubic: (t: number) => 1 - (1 - t) ** 3,
  inCubic: (t: number) => t * t * t,
  outBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
  },
  outBounce: (t: number) => {
    const n = 7.5625;
    const d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
    return n * (t -= 2.625 / d) * t + 0.984375;
  },
} as const;

export type Easing = (t: number) => number;

/** Bevorzugt die Person reduzierte Bewegung (Betriebssystem-Einstellung)? */
export function prefersReducedMotion(): boolean {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Ein zeitlich begrenzter Übergang von 0 nach 1. */
export class Tween {
  private start = -Infinity;
  private duration: number;

  constructor(
    durationMs: number,
    private readonly easing: Easing = ease.inOutCubic,
  ) {
    this.duration = durationMs;
  }

  /** Startet (neu). Bei „reduzierter Bewegung“ springt der Übergang sofort ans Ende. */
  play(durationMs = this.duration): this {
    this.duration = prefersReducedMotion() ? 0 : durationMs;
    this.start = performance.now();
    return this;
  }

  /** Sofort ans Ende springen. */
  finish(): this {
    this.start = -Infinity;
    return this;
  }

  /** Roher Fortschritt 0…1. */
  get t(): number {
    if (this.duration <= 0) return 1;
    return Math.min(1, Math.max(0, (performance.now() - this.start) / this.duration));
  }

  /** Fortschritt mit Easing. */
  get value(): number {
    return this.easing(this.t);
  }

  get running(): boolean {
    return this.t < 1;
  }
}

/** Lineare Interpolation zwischen zwei Punkten. */
export function mixPoint(a: readonly [number, number], b: readonly [number, number], t: number): [number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** Einfacher, reproduzierbarer Zufallsgenerator (für Tests und gleiche Abläufe). */
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    // mulberry32
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
