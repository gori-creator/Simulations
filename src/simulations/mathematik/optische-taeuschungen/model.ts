/**
 * Optische Täuschungen: Geometrie der Figuren (Müller-Lyer, Ebbinghaus,
 * Zöllner, Hering) und Auswertung der eigenen Schätzung.
 */

export type Pt = [number, number];

/** Abweichung der Schätzung in Prozent (positiv = zu groß eingestellt). */
export function deviation(setPercent: number): number {
  return setPercent - 100;
}

/** Müller-Lyer: Pfeilspitzen an den Enden einer Strecke (nach innen oder außen). */
export function arrowHeads(x1: number, x2: number, y: number, len: number, outward: boolean): [Pt, Pt][] {
  const d = len * Math.SQRT1_2;
  const s = outward ? 1 : -1;
  return [
    [
      [x1, y],
      [x1 - s * d, y - d],
    ],
    [
      [x1, y],
      [x1 - s * d, y + d],
    ],
    [
      [x2, y],
      [x2 + s * d, y - d],
    ],
    [
      [x2, y],
      [x2 + s * d, y + d],
    ],
  ];
}

/** Ebbinghaus: Mittelpunkte von n Kreisen auf einem Ring mit Radius R um (cx, cy). */
export function ring(cx: number, cy: number, R: number, n: number): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (2 * Math.PI * i) / n;
    return [cx + R * Math.cos(a), cy + R * Math.sin(a)] as Pt;
  });
}

/** Zöllner: kurze Schraffurstriche entlang einer Strecke, abwechselnd geneigt. */
export function hatches(a: Pt, b: Pt, count: number, len: number, angleDeg: number, flip: boolean): [Pt, Pt][] {
  const out: [Pt, Pt][] = [];
  const dir = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const ang = dir + ((flip ? -1 : 1) * angleDeg * Math.PI) / 180;
  for (let i = 1; i < count; i++) {
    const t = i / count;
    const m: Pt = [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
    const dx = (Math.cos(ang) * len) / 2;
    const dy = (Math.sin(ang) * len) / 2;
    out.push([
      [m[0] - dx, m[1] - dy],
      [m[0] + dx, m[1] + dy],
    ]);
  }
  return out;
}

/** Steigungswinkel einer Strecke in Grad (zum Nachweis der Parallelität). */
export function angleDeg(a: Pt, b: Pt): number {
  return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
}
