import type { Sample } from './knn';

/**
 * Lektion „Aus Beispielen lernen“: Äpfel und Birnen mit zwei Merkmalen.
 * x = Form (0 = länglich wie eine Birne, 1 = ganz rund), y = Farbe (0 = rot, 0,5 = gelb, 1 = grün).
 */
export type Fruit = 'apple' | 'pear';
export type Color = 'red' | 'yellow' | 'green';

export interface FruitSample extends Sample<Fruit> {
  id: string;
  color: Color;
}

/** Beispiele, die man Bit zeigen kann. */
export const EXAMPLES: FruitSample[] = [
  { id: 'apfel-rot', label: 'apple', color: 'red', x: 0.92, y: 0.0 },
  { id: 'birne-gruen', label: 'pear', color: 'green', x: 0.42, y: 0.95 },
  { id: 'apfel-gruen', label: 'apple', color: 'green', x: 0.88, y: 1.0 },
  { id: 'birne-gelb', label: 'pear', color: 'yellow', x: 0.4, y: 0.55 },
  { id: 'apfel-gelb', label: 'apple', color: 'yellow', x: 0.9, y: 0.5 },
  { id: 'birne-rot', label: 'pear', color: 'red', x: 0.45, y: 0.1 },
];

/** Früchte für Bits Probe (nicht unter den Beispielen). */
export const TESTS: FruitSample[] = [
  { id: 't-apfel-gruen', label: 'apple', color: 'green', x: 0.85, y: 0.9 },
  { id: 't-birne-rot', label: 'pear', color: 'red', x: 0.4, y: 0.15 },
  { id: 't-apfel-rot', label: 'apple', color: 'red', x: 0.95, y: 0.05 },
  { id: 't-birne-gelb', label: 'pear', color: 'yellow', x: 0.45, y: 0.5 },
  { id: 't-apfel-gelb', label: 'apple', color: 'yellow', x: 0.93, y: 0.45 },
  { id: 't-birne-gruen', label: 'pear', color: 'green', x: 0.38, y: 1.0 },
];
