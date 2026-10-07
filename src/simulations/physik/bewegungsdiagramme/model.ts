/**
 * Rechenlogik „Bewegungsdiagramme“: geradlinige Bewegung, die aus Abschnitten
 * mit jeweils konstanter Beschleunigung besteht.
 *
 * In jedem Abschnitt gilt (τ = Zeit seit Beginn des Abschnitts):
 *   s(τ) = s₀ + v₀·τ + ½·a·τ²,   v(τ) = v₀ + a·τ,   a = konstant.
 *
 * Gleichförmige Bewegung (a = 0), gleichmäßig beschleunigte Bewegung und ein
 * „Fahrplan“ aus mehreren Abschnitten sind Sonderfälle davon.
 */

/** Ein Abschnitt mit konstanter Beschleunigung a (m/s²) und Dauer (s). */
export interface Segment {
  duration: number;
  a: number;
}

/** Bewegung: Startort s₀ (m), Anfangsgeschwindigkeit v₀ (m/s) und Abschnitte. */
export interface Motion {
  s0: number;
  v0: number;
  segments: Segment[];
}

/** Ein Abschnitt mit seinen Anfangswerten (vorberechnet). */
export interface Phase {
  /** Beginn und Ende in s. */
  t0: number;
  t1: number;
  /** Ort und Geschwindigkeit zu Beginn. */
  s0: number;
  v0: number;
  a: number;
}

export interface MotionState {
  t: number;
  s: number;
  v: number;
  a: number;
}

/** Abschnitte mit Anfangsort und -geschwindigkeit aneinanderreihen. */
export function buildPhases(motion: Motion): Phase[] {
  const phases: Phase[] = [];
  let t = 0;
  let s = motion.s0;
  let v = motion.v0;
  for (const seg of motion.segments) {
    if (!(seg.duration > 0)) continue;
    phases.push({ t0: t, t1: t + seg.duration, s0: s, v0: v, a: seg.a });
    s += v * seg.duration + 0.5 * seg.a * seg.duration ** 2;
    v += seg.a * seg.duration;
    t += seg.duration;
  }
  return phases;
}

/** Gesamtdauer der Bewegung in s. */
export function totalTime(phases: readonly Phase[]): number {
  return phases.length ? phases[phases.length - 1]!.t1 : 0;
}

/**
 * Zustand zur Zeit t. Vor dem Start bzw. nach dem Ende wird der Zustand am
 * Rand gehalten (danach steht der Körper bzw. fährt nicht weiter).
 */
export function stateAt(phases: readonly Phase[], t: number): MotionState {
  if (!phases.length) return { t, s: 0, v: 0, a: 0 };
  const first = phases[0]!;
  if (t <= first.t0) return { t, s: first.s0, v: first.v0, a: first.a };
  let phase = phases[phases.length - 1]!;
  for (const p of phases) {
    if (t <= p.t1) {
      phase = p;
      break;
    }
  }
  const tau = Math.min(t, phase.t1) - phase.t0;
  return { t, s: phase.s0 + phase.v0 * tau + 0.5 * phase.a * tau * tau, v: phase.v0 + phase.a * tau, a: phase.a };
}

/** Index des Abschnitts zur Zeit t (−1 ohne Abschnitte). */
export function phaseIndexAt(phases: readonly Phase[], t: number): number {
  for (let i = 0; i < phases.length; i++) if (t < phases[i]!.t1) return i;
  return phases.length - 1;
}

/** Ortsänderung Δs (mit Vorzeichen) zwischen 0 und t – entspricht der Fläche unter dem t-v-Graphen. */
export function displacement(phases: readonly Phase[], t: number): number {
  if (!phases.length) return 0;
  return stateAt(phases, t).s - phases[0]!.s0;
}

/**
 * Zurückgelegter Weg (immer ≥ 0) zwischen 0 und t: ∫|v| dt. Unterscheidet sich
 * von der Ortsänderung, wenn sich die Fahrtrichtung umkehrt.
 */
export function pathLength(phases: readonly Phase[], t: number): number {
  let sum = 0;
  for (const p of phases) {
    if (t <= p.t0) break;
    const end = Math.min(t, p.t1) - p.t0;
    // Umkehrpunkt (v = 0) innerhalb des Abschnitts?
    const cuts = [0, end];
    if (p.a !== 0) {
      const tau = -p.v0 / p.a;
      if (tau > 0 && tau < end) cuts.splice(1, 0, tau);
    }
    for (let i = 0; i + 1 < cuts.length; i++) {
      const a = cuts[i]!;
      const b = cuts[i + 1]!;
      sum += Math.abs(p.v0 * (b - a) + 0.5 * p.a * (b * b - a * a));
    }
  }
  return sum;
}

/** Kleinster und größter Wert einer Größe über die ganze Bewegung. */
export function extent(phases: readonly Phase[], key: 's' | 'v' | 'a'): [number, number] {
  if (!phases.length) return [0, 0];
  let min = Infinity;
  let max = -Infinity;
  const take = (x: number) => {
    min = Math.min(min, x);
    max = Math.max(max, x);
  };
  for (const p of phases) {
    const d = p.t1 - p.t0;
    if (key === 'a') take(p.a);
    else if (key === 'v') {
      take(p.v0);
      take(p.v0 + p.a * d);
    } else {
      take(p.s0);
      take(p.s0 + p.v0 * d + 0.5 * p.a * d * d);
      // Scheitel der Parabel (Umkehrpunkt) innerhalb des Abschnitts
      if (p.a !== 0) {
        const tau = -p.v0 / p.a;
        if (tau > 0 && tau < d) take(p.s0 + p.v0 * tau + 0.5 * p.a * tau * tau);
      }
    }
  }
  return [min, max];
}

/* ------------------------------------------------------------------ */
/* Die drei Arten von Bewegungen in der Simulation                      */
/* ------------------------------------------------------------------ */

/** Gleichförmige Bewegung: konstante Geschwindigkeit v über die Dauer T. */
export function uniformMotion(s0: number, v: number, duration: number): Motion {
  return { s0, v0: v, segments: [{ duration, a: 0 }] };
}

/** Bremst das Fahrzeug? (Beschleunigung entgegen der Fahrtrichtung) */
export function isBraking(v0: number, a: number): boolean {
  return v0 * a < 0;
}

/**
 * Gleichmäßig beschleunigte Bewegung über die Dauer T. Beim Bremsen
 * (a entgegen der Fahrtrichtung) hält das Fahrzeug an, sobald v = 0 erreicht
 * ist, und bleibt dann stehen – es fährt nicht von selbst rückwärts. Aus dem
 * Stand (v₀ = 0) fährt es in Richtung von a los.
 */
export function acceleratedMotion(s0: number, v0: number, a: number, duration: number): Motion {
  if (isBraking(v0, a)) {
    const stop = v0 / -a;
    if (stop < duration) {
      return { s0, v0, segments: [{ duration: stop, a }, { duration: duration - stop, a: 0 }] };
    }
  }
  return { s0, v0, segments: [{ duration, a }] };
}

/** Bremsen bis zum Stillstand: Bremszeit t_B = |v₀|/|a| und Bremsweg s_B = v₀²/(2|a|). */
export function brakingInfo(v0: number, a: number): { time: number; distance: number } | null {
  if (!isBraking(v0, a)) return null;
  return { time: Math.abs(v0 / a), distance: (v0 * v0) / (2 * Math.abs(a)) };
}

/** Ein Abschnitt des Fahrplans: Geschwindigkeit am Ende (m/s) und Dauer (s). */
export interface Leg {
  v: number;
  duration: number;
}

/**
 * Fahrplan: In jedem Abschnitt ändert sich die Geschwindigkeit gleichmäßig von
 * der Geschwindigkeit am Ende des vorigen Abschnitts auf den Zielwert.
 * Die Beschleunigung ist a = Δv / Δt.
 */
export function scheduleMotion(s0: number, v0: number, legs: readonly Leg[]): Motion {
  let v = v0;
  const segments: Segment[] = [];
  for (const leg of legs) {
    if (!(leg.duration > 0)) continue;
    segments.push({ duration: leg.duration, a: (leg.v - v) / leg.duration });
    v = leg.v;
  }
  return { s0, v0, segments };
}

/** Geschwindigkeit von m/s in km/h. */
export function toKmh(v: number): number {
  return v * 3.6;
}
