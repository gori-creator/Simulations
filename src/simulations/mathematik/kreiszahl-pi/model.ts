/** Rechenlogik „Kreisumfang, Kreisfläche und die Zahl π“. */

/**
 * Archimedes: Umfang des einbeschriebenen bzw. umbeschriebenen n-Ecks geteilt
 * durch den Durchmesser – untere und obere Schranke für π.
 */
export function polygonBounds(n: number): { lower: number; upper: number } {
  return { lower: n * Math.sin(Math.PI / n), upper: n * Math.tan(Math.PI / n) };
}

/**
 * Ziellage von Sektor i (von n) beim Umlegen der Kreisfläche zu einem
 * „Parallelogramm“: Spitze und Drehung (zusätzlich zur Ausgangslage).
 * Sektoren mit geradem Index zeigen mit der Spitze nach oben, die anderen nach unten.
 * Die Seitenkanten benachbarter Sektoren liegen genau aufeinander.
 */
export function sectorTarget(i: number, n: number, r: number): { apex: [number, number]; rotation: number } {
  const delta = (2 * Math.PI) / n;
  const original = (i + 0.5) * delta;
  const up = i % 2 === 0;
  const target = up ? -Math.PI / 2 : Math.PI / 2;
  const half = r * Math.sin(delta / 2);
  return {
    apex: [i * half, up ? r * Math.cos(delta / 2) : 0],
    rotation: target - original,
  };
}

/** Breite der umgelegten Figur: n·r·sin(π/n) → π·r. */
export function rearrangedWidth(n: number, r: number): number {
  return n * r * Math.sin(Math.PI / n);
}
