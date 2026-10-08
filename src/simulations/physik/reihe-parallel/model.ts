/**
 * Rechenlogik „Reihen- und Parallelschaltung“.
 *
 * Eine ideale Spannungsquelle (Spannung U) versorgt zwei oder drei
 * Bauteile (gleiche Glühlampen 6 V / 0,5 A oder Widerstände R₁ … R₃):
 *  - Reihenschaltung: R = R₁ + R₂ (+ R₃), überall dieselbe Stromstärke,
 *  - Parallelschaltung: 1/R = 1/R₁ + 1/R₂ (+ 1/R₃), an allen Zweigen dieselbe Spannung,
 *  - gemischt: Bauteil 1 in Reihe mit der Parallelschaltung aus 2 und 3.
 *
 * Glühlampen werden – wie meist im Unterricht – als Widerstände mit festem
 * Wert beschrieben (R = 12 Ω). Ein herausgedrehtes (oder durchgebranntes)
 * Bauteil unterbricht seinen Zweig.
 */

export type Circuit = 'series' | 'parallel' | 'mixed';

/** Nenndaten der Glühlampen. */
export const LAMP_U = 6;
export const LAMP_I = 0.5;
export const LAMP_R = LAMP_U / LAMP_I;
export const LAMP_P = LAMP_U * LAMP_I;
/** Ab dieser Spannung an einer Lampe brennt die Wendel durch (1,5-fache Nennspannung). */
export const BURN_U = 1.5 * LAMP_U;

export interface PartResult {
  /** Spannung am Bauteil in V. */
  U: number;
  /** Stromstärke durch das Bauteil in A. */
  I: number;
  /** Leistung in W. */
  P: number;
}

export interface CircuitResult {
  /** Gesamtstromstärke (Hauptleitung) in A. */
  I: number;
  /** Ersatzwiderstand in Ω (unendlich, wenn der Kreis unterbrochen ist). */
  R: number;
  parts: PartResult[];
}

/** Anzahl der Bauteile einer Schaltung. */
export function partCount(circuit: Circuit, n: number): number {
  return circuit === 'mixed' ? 3 : Math.max(2, Math.min(3, Math.round(n)));
}

/** Ersatzwiderstand parallel geschalteter Widerstände (fehlende = unendlich). */
export function parallelR(values: readonly number[]): number {
  let g = 0;
  for (const r of values) if (Number.isFinite(r) && r > 0) g += 1 / r;
  return g > 0 ? 1 / g : Infinity;
}

/** Ersatzwiderstand hintereinander geschalteter Widerstände. */
export function seriesR(values: readonly number[]): number {
  return values.reduce((sum, r) => sum + r, 0);
}

/**
 * Stromstärken und Spannungen. `R` enthält die Widerstände der Bauteile;
 * `open[i]` markiert ein herausgedrehtes Bauteil.
 */
export function solve(circuit: Circuit, U: number, R: readonly number[], open: readonly boolean[] = []): CircuitResult {
  const n = R.length;
  const eff = R.map((r, i) => (open[i] ? Infinity : r));
  const parts: PartResult[] = R.map(() => ({ U: 0, I: 0, P: 0 }));
  const done = (I: number, Rtot: number): CircuitResult => {
    for (const p of parts) p.P = p.U * p.I;
    return { I, R: Rtot, parts };
  };
  if (circuit === 'series') {
    const Rtot = seriesR(eff);
    if (!Number.isFinite(Rtot)) {
      // Genau eine Unterbrechung: An ihr liegt die volle Spannung der Quelle.
      const gaps = eff.map((r, i) => (Number.isFinite(r) ? -1 : i)).filter((i) => i >= 0);
      if (gaps.length === 1) parts[gaps[0]!] = { U, I: 0, P: 0 };
      return done(0, Infinity);
    }
    const I = U / Rtot;
    eff.forEach((r, i) => {
      parts[i] = { U: I * r, I, P: 0 };
    });
    return done(I, Rtot);
  }
  if (circuit === 'parallel') {
    let I = 0;
    eff.forEach((r, i) => {
      const Ii = Number.isFinite(r) ? U / r : 0;
      parts[i] = { U, I: Ii, P: 0 };
      I += Ii;
    });
    // An einem offenen Zweig liegt trotzdem die volle Spannung (z. B. an der leeren Fassung).
    return done(I, I > 0 ? U / I : Infinity);
  }
  // gemischt: Bauteil 1 in Reihe mit (2 ∥ 3)
  const Rp = parallelR(eff.slice(1, n));
  const Rtot = eff[0]! + Rp;
  if (!Number.isFinite(Rtot)) {
    // Kreis offen: keine Stromstärke. Gibt es genau eine Unterbrechung, liegt an ihr die volle Spannung.
    const firstOpen = !Number.isFinite(eff[0]!);
    const blockOpen = !Number.isFinite(Rp);
    if (firstOpen && !blockOpen) parts[0] = { U, I: 0, P: 0 };
    else if (!firstOpen && blockOpen) for (let i = 1; i < n; i++) parts[i] = { U, I: 0, P: 0 };
    return done(0, Infinity);
  }
  const I = U / Rtot;
  const Up = I * Rp;
  parts[0] = { U: I * eff[0]!, I, P: 0 };
  for (let i = 1; i < n; i++) parts[i] = { U: Up, I: Number.isFinite(eff[i]!) ? Up / eff[i]! : 0, P: 0 };
  return done(I, Rtot);
}

/* ---------- Messstellen für den Strommesser ---------- */

/** Was ein Strommesser an einer Stelle misst: Gesamtstrom oder Strom durch ein Bauteil. */
export type SlotMeasure = { kind: 'main' } | { kind: 'part'; index: number };

/**
 * Messstellen (nummeriert ab 1) je Schaltung:
 *  - Reihe: vor dem ersten Bauteil, zwischen den Bauteilen, nach dem letzten,
 *  - parallel: Hauptleitung (hin), jeder Zweig, Hauptleitung (zurück),
 *  - gemischt: vor Bauteil 1, zwischen 1 und Verzweigung, Zweig 2, Zweig 3, Rückleitung.
 */
export function ammeterSlots(circuit: Circuit, n: number): SlotMeasure[] {
  const count = partCount(circuit, n);
  if (circuit === 'series') return Array.from({ length: count + 1 }, () => ({ kind: 'main' }) as SlotMeasure);
  if (circuit === 'parallel') return [{ kind: 'main' }, ...Array.from({ length: count }, (_, i) => ({ kind: 'part', index: i }) as SlotMeasure), { kind: 'main' }];
  return [{ kind: 'main' }, { kind: 'main' }, { kind: 'part', index: 1 }, { kind: 'part', index: 2 }, { kind: 'main' }];
}

export function slotCurrent(slot: SlotMeasure, res: CircuitResult): number {
  return slot.kind === 'main' ? res.I : (res.parts[slot.index]?.I ?? 0);
}

/* ---------- Glühlampen ---------- */

export const ROOM_T = 293;
export const NOMINAL_T = 2700;

/** Temperatur der Wendel (Strahlung: P ~ T⁴). */
export function filamentTemperature(P: number): number {
  if (!(P > 0)) return ROOM_T;
  return Math.max(ROOM_T, NOMINAL_T * (P / LAMP_P) ** 0.25);
}

/** Sichtbares Leuchten 0…1 (unter etwa 800 K nicht sichtbar). */
export function glowOf(T: number): number {
  const x = (T - 800) / (NOMINAL_T - 800);
  return x <= 0 ? 0 : Math.min(1.4, x * x);
}

/** Brennt eine Lampe bei dieser Spannung durch? */
export function burnsOut(U: number): boolean {
  return U > BURN_U + 1e-9;
}
