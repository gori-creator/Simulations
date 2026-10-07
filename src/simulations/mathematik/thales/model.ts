/** Rechenlogik „Satz des Thales“. */
export type Point = readonly [number, number];

/** Winkel bei C im Dreieck ABC in Grad. */
export function angleAt(c: Point, a: Point, b: Point): number {
  const ux = a[0] - c[0];
  const uy = a[1] - c[1];
  const vx = b[0] - c[0];
  const vy = b[1] - c[1];
  const lu = Math.hypot(ux, uy);
  const lv = Math.hypot(vx, vy);
  if (lu < 1e-12 || lv < 1e-12) return NaN;
  const cos = Math.max(-1, Math.min(1, (ux * vx + uy * vy) / (lu * lv)));
  return (Math.acos(cos) * 180) / Math.PI;
}

/** Lage eines Punktes zum Kreis um m mit Radius r. */
export function positionToCircle(p: Point, m: Point, r: number, tolerance = 1e-6): 'on' | 'inside' | 'outside' {
  const d = Math.hypot(p[0] - m[0], p[1] - m[1]);
  if (Math.abs(d - r) <= tolerance * Math.max(1, r)) return 'on';
  return d < r ? 'inside' : 'outside';
}
