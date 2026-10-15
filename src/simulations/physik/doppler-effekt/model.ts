/**
 * Rechenlogik „Doppler-Effekt“.
 *
 * Eine Schallquelle (Frequenz f_Q) fährt mit der Geschwindigkeit v_Q gleichförmig
 * auf einer geraden Straße (x-Achse). Ein Beobachter steht im Abstand d neben der
 * Straße oder bewegt sich selbst parallel zur Straße. Die Luft ruht, der Schall
 * breitet sich in ihr mit c nach allen Seiten aus.
 *
 * Grundformeln (Bewegung auf der Verbindungslinie, Geschwindigkeiten als Beträge):
 *
 *   bewegte Quelle:      f_B = f_Q · c / (c ∓ v_Q)     (− auf den Beobachter zu, + weg)
 *   bewegter Beobachter: f_B = f_Q · (c ± v_B) / c     (+ auf die Quelle zu, − weg)
 *   allgemein:           f_B = f_Q · (c + v_B,r) / (c − v_Q,r)
 *
 * v_Q,r ist die Komponente der Quellengeschwindigkeit zum Beobachter hin (zum
 * Zeitpunkt der Aussendung), v_B,r die Komponente der Beobachtergeschwindigkeit
 * zur Quelle hin. Bei seitlichem Abstand ändert sich v_Q,r beim Vorbeifahren
 * stetig – der Ton gleitet von hoch nach tief.
 *
 * Exakte Herleitung: Der Schall, der den Beobachter zur Zeit t erreicht, wurde
 * zur Zeit τ ausgesandt mit |B(t) − S(τ)| = c · (t − τ) (Laufzeitgleichung).
 * Die Phase der Quelle ist 2π · f_Q · τ, also hört der Beobachter
 * f_B = f_Q · dτ/dt = f_Q · (c − n·v_B) / (c − n·v_Q), n = Einheitsvektor von S(τ) nach B(t).
 *
 * Für v_Q > c gibt es an Orten im Machschen Kegel zwei Aussendezeitpunkte
 * (zwei Töne gleichzeitig, einer davon „rückwärts“), außerhalb keinen (Stille).
 * Der Kegel hat den halben Öffnungswinkel α mit sin α = c / v_Q.
 *
 * Einheiten: Wege in m, Zeiten in s, Geschwindigkeiten in m/s, Frequenzen in Hz.
 */

/** Schallgeschwindigkeit in Luft (ca. 15 °C), wie im Unterricht üblich. */
export const C_AIR = 340;
/** Breite des gezeigten Straßenabschnitts in m (unabhängig von der Bildschirmgröße). */
export const WORLD_WIDTH = 240;

/** Bewegte Quelle auf der Verbindungslinie: f_B = f_Q · c / (c − v_Q); v_Q > 0: auf den Beobachter zu. */
export function movingSource(fQ: number, vQ: number, c = C_AIR): number {
  return (fQ * c) / (c - vQ);
}

/** Bewegter Beobachter, ruhende Quelle: f_B = f_Q · (c + v_B) / c; v_B > 0: auf die Quelle zu. */
export function movingObserver(fQ: number, vB: number, c = C_AIR): number {
  return (fQ * (c + vB)) / c;
}

/**
 * Allgemeine Dopplerformel mit Radialkomponenten:
 * f_B = f_Q · (c + v_B,r) / (c − v_Q,r). v_Q,r > 0: Quelle nähert sich, v_B,r > 0: Beobachter nähert sich.
 */
export function doppler(fQ: number, vQr: number, vBr: number, c = C_AIR): number {
  return (fQ * (c + vBr)) / (c - vQr);
}

/** Wellenlänge vor der Quelle: λ_v = (c − v_Q) / f_Q (null für v_Q ≥ c: dort laufen keine Wellen voraus). */
export function wavelengthAhead(fQ: number, vQ: number, c = C_AIR): number | null {
  return vQ < c ? (c - vQ) / fQ : null;
}

/** Wellenlänge hinter der Quelle: λ_h = (c + v_Q) / f_Q. */
export function wavelengthBehind(fQ: number, vQ: number, c = C_AIR): number {
  return (c + vQ) / fQ;
}

/** Machzahl Ma = v_Q / c. */
export function machNumber(vQ: number, c = C_AIR): number {
  return vQ / c;
}

/** Halber Öffnungswinkel des Machschen Kegels (Bogenmaß): sin α = c / v_Q; null für v_Q ≤ c. */
export function machAngle(vQ: number, c = C_AIR): number | null {
  return vQ > c ? Math.asin(c / vQ) : null;
}

/** Bewegung von Quelle und Beobachter (Draufsicht, Straße = x-Achse). */
export interface Motion {
  /** Frequenz der Quelle in Hz. */
  f: number;
  /** Schallgeschwindigkeit in m/s. */
  c: number;
  /** Startpunkt der Quelle (x zur Zeit 0) in m. */
  x0: number;
  /** Geschwindigkeit der Quelle in +x-Richtung in m/s. */
  vq: number;
  /** Startpunkt des Beobachters (x zur Zeit 0) in m. */
  bx: number;
  /** Abstand des Beobachters von der Straße in m. */
  d: number;
  /** Geschwindigkeit des Beobachters in m/s, positiv in −x-Richtung (der heranfahrenden Quelle entgegen). */
  vb: number;
}

/** Ort der Quelle zur Zeit t (sie sendet ab t = 0). */
export function sourcePos(m: Motion, t: number): [number, number] {
  return [m.x0 + m.vq * t, 0];
}

/** Ort des Beobachters zur Zeit t. */
export function observerPos(m: Motion, t: number): [number, number] {
  return [m.bx - m.vb * t, m.d];
}

/** Ein beim Beobachter ankommendes Signal. */
export interface Arrival {
  /** Aussendezeitpunkt τ in s. */
  tau: number;
  /** Gehörte Frequenz f_Q · dτ/dt in Hz (negativ: das Signal kommt zeitlich rückwärts an). */
  f: number;
  /** Abstand zwischen Aussendeort und Beobachter in m (= c · (t − τ)). */
  dist: number;
  /** Radialkomponenten v_Q,r (Quelle zum Beobachter hin) und v_B,r (Beobachter zur Quelle hin) in m/s. */
  vQr: number;
  vBr: number;
}

/**
 * Alle Signale, die den Beobachter zur Zeit t erreichen: Lösungen τ ∈ [0; t] der
 * Laufzeitgleichung |B(t) − S(τ)| = c · (t − τ), nach τ sortiert.
 * Unterschall: höchstens eine Lösung; Überschall: bis zu zwei.
 */
export function arrivals(m: Motion, t: number): Arrival[] {
  const [bx, by] = observerPos(m, t);
  const px = bx - m.x0;
  const py = by;
  const v = m.vq;
  const c = m.c;
  // |P − V·τ|² = c²·(t − τ)²  →  a·τ² + b·τ + k = 0
  const a = v * v - c * c;
  const b = -2 * px * v + 2 * c * c * t;
  const k = px * px + py * py - c * c * t * t;
  const roots: number[] = [];
  if (Math.abs(a) < 1e-9 * c * c) {
    if (Math.abs(b) > 1e-12) roots.push(-k / b);
  } else {
    const disc = b * b - 4 * a * k;
    if (disc >= 0) {
      const s = Math.sqrt(disc);
      // numerisch stabile Form
      const q = -0.5 * (b + (b >= 0 ? s : -s));
      if (q !== 0) roots.push(q / a, k / q);
      else roots.push(-b / (2 * a));
    }
  }
  const out: Arrival[] = [];
  const eps = 1e-9;
  for (const tau of roots.sort((p, q) => p - q)) {
    if (!(tau >= -eps && tau <= t + eps)) continue;
    const tt = Math.min(Math.max(tau, 0), t);
    if (out.some((o) => Math.abs(o.tau - tt) < 1e-12)) continue;
    const [sx, sy] = sourcePos(m, tt);
    const dx = bx - sx;
    const dy = by - sy;
    const dist = Math.hypot(dx, dy);
    // Richtung von der Quelle (beim Aussenden) zum Beobachter
    const nx = dist > 1e-9 ? dx / dist : 1;
    const vQr = nx * m.vq;
    // Beobachter bewegt sich mit (−v_B, 0); Komponente zur Quelle hin: −n · (−v_B, 0)
    const vBr = nx * m.vb;
    const den = c - vQr;
    const f = Math.abs(den) < 1e-9 ? Infinity : (m.f * (c + vBr)) / den;
    out.push({ tau: tt, f, dist, vQr, vBr });
  }
  return out;
}

/** Das „gewöhnliche“ Signal: das zuletzt ausgesandte (bei Unterschall das einzige); null bei Stille. */
export function mainArrival(m: Motion, t: number): Arrival | null {
  const list = arrivals(m, t);
  return list.length ? list[list.length - 1]! : null;
}

/** Eine gezeichnete Wellenfront (Kreis um den Aussendeort). */
export interface Wavefront {
  /** Aussendezeitpunkt in s. */
  t0: number;
  /** Mittelpunkt (Ort der Quelle beim Aussenden) in m. */
  cx: number;
  /** Radius c · (t − t0) in m. */
  r: number;
}

/**
 * Wellenfronten zur Zeit t, ausgesandt zu den Zeiten 0, Δt, 2Δt, … ≤ t.
 * Neueste zuerst. maxR begrenzt den Radius (weiter außen ist nichts mehr zu sehen).
 */
export function wavefronts(m: Motion, t: number, dt: number, maxR = Infinity): Wavefront[] {
  const out: Wavefront[] = [];
  if (t < 0 || dt <= 0) return out;
  for (let k = Math.floor(t / dt + 1e-9); k >= 0; k--) {
    const t0 = k * dt;
    const r = m.c * (t - t0);
    if (r > maxR) break;
    out.push({ t0, cx: m.x0 + m.vq * t0, r });
  }
  return out;
}

/**
 * Wie viele Schwingungen liegen zwischen zwei gezeichneten Wellenfronten?
 * Etwa alle 0,05 s eine Front, bei schneller Quelle dichter (mind. ~30 Fronten
 * auf dem Weg durch das Bild), immer eine ganze Zahl von Perioden.
 */
export function ringPeriods(fQ: number, vQ: number, width = WORLD_WIDTH): number {
  const want = Math.min(0.05, width / (30 * Math.max(vQ, 1)));
  return Math.max(1, Math.round(fQ * want));
}

/**
 * Erster Zeitpunkt, zu dem beim Beobachter Schall ankommt (bis tMax), sonst null.
 * Bei Überschall ist das der Durchgang des Machschen Kegels (Überschallknall),
 * sofern die Quelle schon lange genug unterwegs ist.
 */
export function firstArrival(m: Motion, tMax: number): number | null {
  const has = (t: number) => arrivals(m, t).length > 0;
  if (has(0)) return 0;
  const n = 400;
  let lo = 0;
  let hi: number | null = null;
  for (let i = 1; i <= n; i++) {
    const t = (tMax * i) / n;
    if (has(t)) {
      hi = t;
      break;
    }
    lo = t;
  }
  if (hi === null) return null;
  let up: number = hi;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + up) / 2;
    if (has(mid)) up = mid;
    else lo = mid;
  }
  return up;
}

/**
 * Ist die erste Ankunft ein Überschallknall? Das ist der Fall, wenn dort zwei
 * Signale zusammenfallen (Doppelwurzel), nicht wenn nur die allererste
 * Wellenfront (τ = 0) ankommt.
 */
export function isBoom(m: Motion, tFirst: number): boolean {
  if (m.vq <= m.c) return false;
  const later = arrivals(m, tFirst + 1e-6 * Math.max(1, tFirst));
  return later.length >= 2 && later[0]!.tau > 1e-6;
}

/** Verlauf f_B(t) für die Diagramme: gewöhnliches und (bei Überschall) rückwärts gehörtes Signal. */
export interface Sample {
  t: number;
  /** gewöhnliches Signal (null: Stille). */
  f: number | null;
  /** zweites, rückwärts ankommendes Signal (nur Überschall). */
  rev: number | null;
}

export function sampleFrequency(m: Motion, t0: number, t1: number, n: number): Sample[] {
  const out: Sample[] = [];
  for (let i = 0; i <= n; i++) {
    const t = t0 + ((t1 - t0) * i) / n;
    const list = arrivals(m, t);
    const main = list.length ? list[list.length - 1]! : null;
    const rev = list.length >= 2 ? list[0]! : null;
    out.push({ t, f: main && Number.isFinite(main.f) ? main.f : null, rev: rev && Number.isFinite(rev.f) ? Math.abs(rev.f) : null });
  }
  return out;
}
