/**
 * Nächste-Nachbarn-Verfahren (k-NN) für zwei Merkmale: Ein neuer Punkt bekommt
 * die Gruppe, die unter seinen k nächsten Beispielen am häufigsten ist.
 * Bei Gleichstand entscheidet das nächste Beispiel unter den Gleichstands-Gruppen.
 */
export interface Sample<L extends string = string> {
  x: number;
  y: number;
  label: L;
}

export function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Die k nächsten Beispiele, nach Abstand sortiert (bei gleichem Abstand: Reihenfolge der Liste). */
export function nearest<L extends string>(point: { x: number; y: number }, examples: readonly Sample<L>[], k: number): Sample<L>[] {
  return examples
    .map((e, i) => ({ e, i, d: distance(point, e) }))
    .sort((a, b) => a.d - b.d || a.i - b.i)
    .slice(0, Math.max(1, k))
    .map((x) => x.e);
}

/** Gruppe für einen Punkt; ohne Beispiele null. */
export function classify<L extends string>(point: { x: number; y: number }, examples: readonly Sample<L>[], k = 1): L | null {
  if (examples.length === 0) return null;
  const near = nearest(point, examples, k);
  const votes = new Map<L, number>();
  for (const e of near) votes.set(e.label, (votes.get(e.label) ?? 0) + 1);
  const top = Math.max(...votes.values());
  // Gleichstand: die Gruppe des nächsten Beispiels unter den Spitzenreitern
  return near.find((e) => votes.get(e.label) === top)!.label;
}

/** Anteil richtig eingeordneter Punkte (0…1). */
export function accuracy<L extends string>(tests: readonly Sample<L>[], examples: readonly Sample<L>[], k = 1, leaveOneOut = false): number {
  if (tests.length === 0) return 0;
  let right = 0;
  for (const t of tests) {
    const pool = leaveOneOut ? examples.filter((e) => e !== t) : examples;
    if (classify(t, pool, k) === t.label) right += 1;
  }
  return right / tests.length;
}
