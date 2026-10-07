/**
 * Rechenlogik „Satz des Pythagoras“: Ergänzungsbeweis mit vier
 * kongruenten Dreiecken im Quadrat der Seitenlänge a + b.
 *
 * Jedes Dreieck ist als [R, A, B] gegeben: R = rechter Winkel,
 * A = Ende der Kathete a, B = Ende der Kathete b. Beide Anordnungen
 * haben dieselbe Orientierung, daher gibt es zu jedem Dreieck eine
 * Drehung + Verschiebung von Anordnung 1 nach Anordnung 2.
 */
export type Point = readonly [number, number];
export type Triangle = readonly [Point, Point, Point];

/** Anordnung 1: Die Dreiecke liegen in den Ecken, in der Mitte bleibt c². */
export function arrangementC(a: number, b: number): Triangle[] {
  const s = a + b;
  return [
    [[0, 0], [a, 0], [0, b]],
    [[s, 0], [s, a], [a, 0]],
    [[s, s], [b, s], [s, a]],
    [[0, s], [0, b], [b, s]],
  ];
}

/** Anordnung 2: Die Dreiecke bilden zwei Rechtecke, frei bleiben a² und b². */
export function arrangementAB(a: number, b: number): Triangle[] {
  const s = a + b;
  return [
    [[a, a], [a, 0], [s, a]],
    [[s, 0], [s, a], [a, 0]],
    [[a, s], [0, s], [a, a]],
    [[0, a], [a, a], [0, s]],
  ];
}

function centroid(t: Triangle): [number, number] {
  return [(t[0][0] + t[1][0] + t[2][0]) / 3, (t[0][1] + t[1][1] + t[2][1]) / 3];
}

function direction(t: Triangle): number {
  return Math.atan2(t[1][1] - t[0][1], t[1][0] - t[0][0]);
}

/** Dreieck auf dem Weg von `from` nach `to` (starre Bewegung), Fortschritt 0…1. */
export function interpolate(from: Triangle, to: Triangle, progress: number): Triangle {
  const c1 = centroid(from);
  const c2 = centroid(to);
  let delta = direction(to) - direction(from);
  while (delta > Math.PI) delta -= 2 * Math.PI;
  while (delta < -Math.PI) delta += 2 * Math.PI;
  const angle = delta * progress;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const cx = c1[0] + (c2[0] - c1[0]) * progress;
  const cy = c1[1] + (c2[1] - c1[1]) * progress;
  return from.map(([x, y]) => {
    const dx = x - c1[0];
    const dy = y - c1[1];
    return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos] as const;
  }) as unknown as Triangle;
}
