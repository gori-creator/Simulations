import type { Sample } from './knn';

/**
 * Lektion „Frag die Nachbarn“: Kaninchen (A) und Meerschweinchen (B) nach
 * x = Ohrlänge und y = Gewicht. Ein Zwergkaninchen mit kurzen Ohren liegt
 * mitten bei den Meerschweinchen – mit nur einem Nachbarn führt es Bit in die Irre.
 */
export type Pet = 'rabbit' | 'guinea';

const A = (x: number, y: number): Sample<Pet> => ({ x, y, label: 'rabbit' });
const B = (x: number, y: number): Sample<Pet> => ({ x, y, label: 'guinea' });

export const PETS: Sample<Pet>[] = [
  A(6, 6), A(7, 7), A(7.5, 5.5), A(8, 6.5), A(6.5, 8), A(8.5, 8), A(7, 4.8), A(5.8, 7.2), A(8.8, 6.8),
  B(2, 3), B(3, 2), B(2.5, 4.5), B(3.5, 3.5), B(1.5, 2), B(4, 2.8), B(3, 5.2), B(4.2, 4.5), B(2, 5.8),
  // Zwergkaninchen (Ausreißer)
  A(4.6, 3.6),
];

/** Neue Tiere, deren Art Bit herausfinden soll (mit richtiger Lösung). */
export const MYSTERY: Sample<Pet>[] = [B(4.8, 3.9), A(7.2, 6.2), B(2.8, 3.0), A(5.4, 5.8)];
