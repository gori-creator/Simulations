import { seeded } from '../../engine/dom';

/**
 * Welt „Maschinen sehen“: Faltung mit 3×3-Filtern auf Graustufenbildern
 * (Werte 0…1) und ein lineares Erkennungsmodell „Kreis oder Kreuz“ (8×8),
 * an dem sich gegnerische Beispiele zeigen lassen.
 */
export type Img = number[][];
export type Kernel = number[][];

/** Bild aus Zeichen: '#' = 1, '+' = 0,5, sonst 0. */
export function fromRows(rows: readonly string[]): Img {
  return rows.map((r) => [...r].map((c) => (c === '#' ? 1 : c === '+' ? 0.5 : 0)));
}

export const IMAGES: Record<'haus' | 'sieben' | 'gesicht', Img> = {
  haus: fromRows([
    '................',
    '.......##.......',
    '......####......',
    '.....##++##.....',
    '....##++++##....',
    '...##++++++##...',
    '..############..',
    '..#..........#..',
    '..#.###......#..',
    '..#.#+#..###.#..',
    '..#.###..#.#.#..',
    '..#......#.#.#..',
    '..#......#.#.#..',
    '..############..',
    '................',
    '................',
  ]),
  sieben: fromRows([
    '................',
    '................',
    '...##########...',
    '...##########...',
    '..........###...',
    '.........###....',
    '........###.....',
    '.......###......',
    '......###.......',
    '.....###........',
    '.....###........',
    '....###.........',
    '....###.........',
    '....###.........',
    '................',
    '................',
  ]),
  gesicht: fromRows([
    '................',
    '.....######.....',
    '...##++++++##...',
    '..#++++++++++#..',
    '.#++##++++##++#.',
    '.#++##++++##++#.',
    '#++++++++++++++#',
    '#++++++++++++++#',
    '#++#++++++++#++#',
    '#+++#++++++#+++#',
    '.#+++######+++#.',
    '.#++++++++++++#.',
    '..#++++++++++#..',
    '...##++++++##...',
    '.....######.....',
    '................',
  ]),
};

export const KERNELS: Record<'identitaet' | 'weich' | 'senkrecht' | 'waagerecht' | 'schaerfen', Kernel> = {
  identitaet: [[0, 0, 0], [0, 1, 0], [0, 0, 0]],
  weich: [[1, 2, 1], [2, 4, 2], [1, 2, 1]].map((r) => r.map((v) => v / 16)),
  senkrecht: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],
  waagerecht: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]],
  schaerfen: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]],
};

/** Faltung (genauer: Kreuzkorrelation, wie in neuronalen Netzen üblich), Rand mit 0 aufgefüllt. */
export function convolve(img: Img, k: Kernel): Img {
  const H = img.length;
  const W = img[0]!.length;
  const out: Img = Array.from({ length: H }, () => Array<number>(W).fill(0));
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let s = 0;
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) s += (img[y + j]?.[x + i] ?? 0) * k[j + 1]![i + 1]!;
      out[y]![x] = s;
    }
  return out;
}

/** Testbilder nur mit waagerechten bzw. senkrechten Linien. */
export const LINES_H: Img = fromRows(['........', '########', '........', '........', '########', '........', '........', '########']);
export const LINES_V: Img = LINES_H[0]!.map((_, x) => LINES_H.map((row) => row[x]!));

const energy = (img: Img) => img.flat().reduce((s, v) => s + v * v, 0);

/** Findet der Filter waagerechte Kanten (stark auf waagerechten, schwach auf senkrechten Linien, Summe 0)? */
export function detectsHorizontal(k: Kernel): boolean {
  const sum = k.flat().reduce((a, b) => a + b, 0);
  const eh = energy(convolve(LINES_H, k));
  const ev = energy(convolve(LINES_V, k));
  return Math.abs(sum) < 1e-9 && eh > 0 && eh >= 4 * ev;
}

// ---------- Kreis oder Kreuz (8 × 8) ----------

export const SIZE = 8;

const CIRCLE = fromRows(['........', '..####..', '.#....#.', '.#....#.', '.#....#.', '.#....#.', '..####..', '........']);
const CROSS = fromRows(['........', '.#....#.', '..#..#..', '...##...', '...##...', '..#..#..', '.#....#.', '........']);

function shifted(img: Img, dx: number, dy: number): Img {
  return img.map((row, y) => row.map((_, x) => img[y - dy]?.[x - dx] ?? 0));
}

/** Trainingsbeispiele: verschobene, verrauschte Kreise (0) und Kreuze (1). */
export function examples(n = 160, seed = 4): { img: Img; label: 0 | 1 }[] {
  const rnd = seeded(seed);
  return Array.from({ length: n }, (_, k) => {
    const label = (k % 2) as 0 | 1;
    const base = shifted(label ? CROSS : CIRCLE, Math.floor(rnd() * 3) - 1, Math.floor(rnd() * 3) - 1);
    return { img: base.map((row) => row.map((v) => Math.min(1, Math.max(0, v + (rnd() - 0.5) * 0.3)))), label };
  });
}

export interface Linear {
  w: number[];
  b: number;
}

const sig = (z: number) => 1 / (1 + Math.exp(-z));

/** Logistische Regression per Gradientenabstieg. */
export function trainLinear(data = examples(), steps = 300, lr = 0.5): Linear {
  const w = Array<number>(SIZE * SIZE).fill(0);
  let b = 0;
  for (let s = 0; s < steps; s++) {
    const gw = Array<number>(SIZE * SIZE).fill(0);
    let gb = 0;
    for (const { img, label } of data) {
      const x = img.flat();
      const p = sig(x.reduce((acc, v, i) => acc + v * w[i]!, b));
      const d = p - label;
      for (let i = 0; i < x.length; i++) gw[i]! += d * x[i]!;
      gb += d;
    }
    for (let i = 0; i < w.length; i++) w[i]! -= (lr * gw[i]!) / data.length + lr * 0.001 * w[i]!;
    b -= (lr * gb) / data.length;
  }
  return { w, b };
}

/** Wahrscheinlichkeit „Kreuz“. */
export function pCross(m: Linear, img: Img): number {
  return sig(img.flat().reduce((acc, v, i) => acc + v * m.w[i]!, m.b));
}

/** Startbild: ein sauberer Kreis. */
export const START_CIRCLE: Img = CIRCLE.map((r) => [...r]);

/** Gezielte Störung (FGSM): jedes Pixel um ε in Richtung sign(w) verschieben. */
export function fgsm(m: Linear, img: Img, eps: number): Img {
  return img.map((row, y) => row.map((v, x) => Math.min(1, Math.max(0, v + eps * Math.sign(m.w[y * SIZE + x]!)))));
}

/** Kleinstes ε (in Schritten von 0,01), das die Entscheidung kippt. */
export function minEps(m: Linear, img: Img): number {
  for (let e = 0; e <= 1.0001; e += 0.01) if (pCross(m, fgsm(m, img, e)) >= 0.5) return Math.round(e * 100) / 100;
  return 1;
}
