/**
 * Rechenlogik „Ähnliche Figuren: Wie wachsen Fläche und Volumen?“ (Jgst. 9).
 *
 * Wird eine Figur bzw. ein Körper mit dem Streckfaktor k vergrößert
 * (k > 1) oder verkleinert (0 < k < 1), so gilt:
 *   Längen  · k,   Flächeninhalte · k²,   Volumina · k³.
 *
 * Für die Darstellung wird der vergrößerte Körper in ein Raster aus
 * Einheitszellen zerlegt; am Rand entstehen bei nicht ganzzahligen Maßen
 * kleinere Zellen.
 */

export type Dims = readonly [number, number, number];

export function scaleLength(L: number, k: number): number {
  return L * k;
}
export function scaleArea(A: number, k: number): number {
  return A * k * k;
}
export function scaleVolume(V: number, k: number): number {
  return V * k ** 3;
}

/** Zerlegung der Strecke [0, L] in Einheitsabschnitte (letzter ggf. kürzer). */
export function unitCuts(L: number): number[] {
  const out: number[] = [];
  let x = 0;
  while (x < L - 1e-9) {
    const s = Math.min(1, L - x);
    out.push(s);
    x += s;
  }
  return out;
}

/** Zellen eines Quaders mit den Maßen d (Ecke im Ursprung): [Ecke, Größe]. */
export function cells(d: Dims): { at: [number, number, number]; size: [number, number, number] }[] {
  const cx = unitCuts(d[0]);
  const cy = unitCuts(d[1]);
  const cz = unitCuts(d[2]);
  const out: { at: [number, number, number]; size: [number, number, number] }[] = [];
  let z = 0;
  for (const sz of cz) {
    let y = 0;
    for (const sy of cy) {
      let x = 0;
      for (const sx of cx) {
        out.push({ at: [x, y, z], size: [sx, sy, sz] });
        x += sx;
      }
      y += sy;
    }
    z += sz;
  }
  return out;
}

/** Anzahl der vollständigen Einheitswürfel im Raster. */
export function fullCubes(d: Dims): number {
  return Math.floor(d[0] + 1e-9) * Math.floor(d[1] + 1e-9) * Math.floor(d[2] + 1e-9);
}
