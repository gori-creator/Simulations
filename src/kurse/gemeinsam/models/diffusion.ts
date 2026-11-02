/**
 * Diffusion zum Anfassen: kleine 8×8-Bilder (Werte −1…1). Vorwärts wird
 * Rauschen beigemischt: xₜ = √ᾱₜ · x₀ + √(1 − ᾱₜ) · ε. Rückwärts schätzt ein
 * Entrauscher x̂₀ und geht einen Schritt zurück (deterministisch wie DDIM).
 * Unser Entrauscher ist der für diese wenigen Bilder bestmögliche: ein
 * gewichteter Mittelwert der Trainingsbilder. Darum entstehen genau diese
 * Bilder – echte Modelle lernen aus Millionen Bildern und erzeugen Neues.
 */
export const N = 8;
export type Pic = number[];

const P = (rows: string[]): Pic => rows.join('').split('').map((c) => (c === '#' ? 1 : -1));

export const PICTURES: { id: string; icon: string; pic: Pic }[] = [
  { id: 'herz', icon: '❤️', pic: P(['........', '.##..##.', '########', '########', '.######.', '..####..', '...##...', '........']) },
  { id: 'haus', icon: '🏠', pic: P(['...##...', '..####..', '.######.', '########', '.#....#.', '.#.##.#.', '.#.##.#.', '.######.']) },
  { id: 'smiley', icon: '🙂', pic: P(['..####..', '.#....#.', '#.#..#.#', '#......#', '#.#..#.#', '#..##..#', '.#....#.', '..####..']) },
  { id: 'baum', icon: '🌲', pic: P(['...##...', '..####..', '.######.', '..####..', '.######.', '########', '...##...', '...##...']) },
];

export const STEPS = 10;

/** ᾱₜ für t = 0 … STEPS (1 = kein Rauschen, nahe 0 = fast nur Rauschen). */
export const ALPHA_BAR: number[] = Array.from({ length: STEPS + 1 }, (_, t) => Math.cos(((t / STEPS) * Math.PI) / 2 * 0.985) ** 2);

export function noisy(x0: Pic, t: number, eps: Pic): Pic {
  const a = ALPHA_BAR[t]!;
  return x0.map((v, i) => Math.sqrt(a) * v + Math.sqrt(1 - a) * eps[i]!);
}

export function gaussian(random: () => number): Pic {
  return Array.from({ length: N * N }, () => {
    const u = Math.max(1e-9, random());
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
  });
}

/** Bestmögliche Schätzung von x₀ aus xₜ für die gegebenen Bilder. */
export function denoise(xt: Pic, t: number, pics: readonly Pic[]): Pic {
  const a = ALPHA_BAR[t]!;
  const logw = pics.map((p) => -p.reduce((s, v, i) => s + (xt[i]! - Math.sqrt(a) * v) ** 2, 0) / (2 * Math.max(1e-6, 1 - a)));
  const m = Math.max(...logw);
  const w = logw.map((l) => Math.exp(l - m));
  const sum = w.reduce((x, y) => x + y, 0);
  return xt.map((_, i) => pics.reduce((s, p, k) => s + (w[k]! / sum) * p[i]!, 0));
}

/** Ein Schritt zurück von t nach t − 1. */
export function reverseStep(xt: Pic, t: number, pics: readonly Pic[]): Pic {
  const a = ALPHA_BAR[t]!;
  const aPrev = ALPHA_BAR[t - 1]!;
  const x0 = denoise(xt, t, pics);
  const eps = xt.map((v, i) => (v - Math.sqrt(a) * x0[i]!) / Math.sqrt(Math.max(1e-6, 1 - a)));
  return x0.map((v, i) => Math.sqrt(aPrev) * v + Math.sqrt(1 - aPrev) * eps[i]!);
}

/** Ganzer Weg vom reinen Rauschen (t = STEPS) zum Bild (t = 0). */
export function generate(pics: readonly Pic[], random: () => number): Pic[] {
  let x = gaussian(random);
  const path = [x];
  for (let t = STEPS; t >= 1; t--) {
    x = reverseStep(x, t, pics);
    path.push(x);
  }
  return path;
}

/** Welchem Trainingsbild ähnelt ein Ergebnis am meisten? */
export function closest(x: Pic): { id: string; icon: string; dist: number } {
  return PICTURES.map((p) => ({ id: p.id, icon: p.icon, dist: Math.sqrt(p.pic.reduce((s, v, i) => s + (v - x[i]!) ** 2, 0) / x.length) })).sort((a, b) => a.dist - b.dist)[0]!;
}
