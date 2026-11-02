import { seeded } from '../../engine/dom';

/**
 * Lektion „Netz-Spielplatz“: ein kleines mehrschichtiges Netz (2 Eingänge,
 * 1–2 verborgene Schichten mit je 1–8 Neuronen, 1 Ausgang mit Sigmoid),
 * trainiert mit Backpropagation und Gradientenabstieg auf der
 * Kreuzentropie. Dazu vier Datensätze in [−1, 1]².
 */
export type Act = 'tanh' | 'relu' | 'sigmoid';

const act = {
  tanh: { f: Math.tanh, d: (y: number) => 1 - y * y },
  relu: { f: (x: number) => (x > 0 ? x : 0), d: (y: number) => (y > 0 ? 1 : 0) },
  sigmoid: { f: (x: number) => 1 / (1 + Math.exp(-x)), d: (y: number) => y * (1 - y) },
} as const;

export interface Net {
  sizes: number[];
  act: Act;
  /** W[l][j][i]: Gewicht von Neuron i (Schicht l) zu Neuron j (Schicht l+1). */
  W: number[][][];
  B: number[][];
}

export function createNet(hidden: number[], activation: Act, seed = 1): Net {
  const sizes = [2, ...hidden, 1];
  const rnd = seeded(seed);
  const W: number[][][] = [];
  const B: number[][] = [];
  for (let l = 0; l < sizes.length - 1; l++) {
    const fanIn = sizes[l]!;
    const scale = Math.sqrt((activation === 'relu' ? 2 : 1) / fanIn);
    W.push(Array.from({ length: sizes[l + 1]! }, () => Array.from({ length: fanIn }, () => (rnd() * 2 - 1) * scale * 1.7)));
    B.push(Array.from({ length: sizes[l + 1]! }, () => (activation === 'relu' ? 0.1 : 0)));
  }
  return { sizes, act: activation, W, B };
}

/** Vorwärts: Aktivierungen aller Schichten (letzte = Wahrscheinlichkeit Klasse 1). */
export function forward(net: Net, x: number, y: number): number[][] {
  const outs: number[][] = [[x, y]];
  for (let l = 0; l < net.W.length; l++) {
    const prev = outs[l]!;
    const last = l === net.W.length - 1;
    const f = last ? act.sigmoid.f : act[net.act].f;
    outs.push(net.W[l]!.map((row, j) => f(row.reduce((s, w, i) => s + w * prev[i]!, net.B[l]![j]!))));
  }
  return outs;
}

export function predictProb(net: Net, x: number, y: number): number {
  return forward(net, x, y).at(-1)![0]!;
}

export interface Sample {
  x: number;
  y: number;
  label: 0 | 1;
}

/** Eine Epoche Mini-Batch-Gradientenabstieg; liefert den mittleren Verlust. */
export function trainEpoch(net: Net, data: readonly Sample[], lr: number, batch = 10, random: () => number = Math.random): number {
  const order = data.map((_, i) => i);
  for (let k = order.length - 1; k > 0; k--) {
    const j = Math.floor(random() * (k + 1));
    [order[k], order[j]] = [order[j]!, order[k]!];
  }
  let lossSum = 0;
  for (let start = 0; start < order.length; start += batch) {
    const gW = net.W.map((m) => m.map((r) => r.map(() => 0)));
    const gB = net.B.map((r) => r.map(() => 0));
    const idx = order.slice(start, start + batch);
    for (const i of idx) {
      const s = data[i]!;
      const outs = forward(net, s.x, s.y);
      const p = Math.min(1 - 1e-7, Math.max(1e-7, outs.at(-1)![0]!));
      lossSum += -(s.label * Math.log(p) + (1 - s.label) * Math.log(1 - p));
      // Sigmoid + Kreuzentropie: Fehler am Ausgang ist einfach p − y
      let delta = [p - s.label];
      for (let l = net.W.length - 1; l >= 0; l--) {
        const prev = outs[l]!;
        for (let j = 0; j < delta.length; j++) {
          gB[l]![j]! += delta[j]!;
          for (let q = 0; q < prev.length; q++) gW[l]![j]![q]! += delta[j]! * prev[q]!;
        }
        if (l > 0) {
          const d = act[net.act].d;
          delta = prev.map((a, q) => d(a) * delta.reduce((sum, dj, j) => sum + dj * net.W[l]![j]![q]!, 0));
        }
      }
    }
    for (let l = 0; l < net.W.length; l++) {
      for (let j = 0; j < net.W[l]!.length; j++) {
        net.B[l]![j]! -= (lr * gB[l]![j]!) / idx.length;
        for (let q = 0; q < net.W[l]![j]!.length; q++) net.W[l]![j]![q]! -= (lr * gW[l]![j]![q]!) / idx.length;
      }
    }
  }
  return lossSum / data.length;
}

export function accuracy(net: Net, data: readonly Sample[]): number {
  return data.filter((s) => (predictProb(net, s.x, s.y) >= 0.5 ? 1 : 0) === s.label).length / data.length;
}

// ---------- Datensätze ----------

export type DatasetId = 'kreis' | 'xor' | 'spirale' | 'linie';

function gen(id: DatasetId, n: number, seed: number): Sample[] {
  const rnd = seeded(seed);
  const out: Sample[] = [];
  for (let k = 0; k < n; k++) {
    const label = (k % 2) as 0 | 1;
    let x = 0;
    let y = 0;
    if (id === 'kreis') {
      const r = label ? rnd() * 0.45 : 0.62 + rnd() * 0.33;
      const a = rnd() * Math.PI * 2;
      x = r * Math.cos(a);
      y = r * Math.sin(a);
    } else if (id === 'xor') {
      x = (rnd() * 0.85 + 0.08) * (rnd() < 0.5 ? -1 : 1);
      y = (rnd() * 0.85 + 0.08) * (rnd() < 0.5 ? -1 : 1);
      // Klasse 1, wenn x und y verschiedenes Vorzeichen haben
      if ((x * y < 0 ? 1 : 0) !== label) y = -y;
    } else if (id === 'spirale') {
      const t = rnd() * 2.6 * Math.PI;
      const r = 0.08 + (t / (2.6 * Math.PI)) * 0.85;
      const a = t + (label ? Math.PI : 0);
      x = r * Math.cos(a) + (rnd() - 0.5) * 0.06;
      y = r * Math.sin(a) + (rnd() - 0.5) * 0.06;
    } else {
      x = rnd() * 2 - 1;
      y = rnd() * 2 - 1;
      if ((y > 0.3 * x + 0.1 ? 1 : 0) !== label) {
        x = -x;
        y = -y;
        if ((y > 0.3 * x + 0.1 ? 1 : 0) !== label) y = 0.3 * x + 0.1 + (label ? 0.15 : -0.15);
      }
    }
    out.push({ x, y, label });
  }
  return out;
}

export function dataset(id: DatasetId): { train: Sample[]; test: Sample[] } {
  return { train: gen(id, 200, 101), test: gen(id, 100, 202) };
}
