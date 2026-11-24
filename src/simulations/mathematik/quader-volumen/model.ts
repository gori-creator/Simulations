/**
 * Volumen von Quadern mit Einheitswürfeln: Ein Quader mit Länge a, Breite b
 * und Höhe c (ganze Zahlen) wird Würfel für Würfel gefüllt – erst eine Reihe
 * (a Würfel), dann eine Schicht (b Reihen), dann alle c Schichten:
 * V = a · b · c.
 */

export type Stage = 'leer' | 'reihe' | 'schicht' | 'voll';
export type UnitId = 'cm' | 'dm' | 'm';

/** Anzahl der Einheitswürfel in einem Füllstand. */
export function stageCount(stage: Stage, a: number, b: number, c: number): number {
  switch (stage) {
    case 'leer':
      return 0;
    case 'reihe':
      return a;
    case 'schicht':
      return a * b;
    case 'voll':
      return a * b * c;
  }
}

/** Füllstand zu einer Anzahl von Würfeln (oder `null`, wenn sie dazwischen liegt). */
export function stageOf(n: number, a: number, b: number, c: number): Stage | null {
  const stages: Stage[] = ['leer', 'reihe', 'schicht', 'voll'];
  // vom größten zum kleinsten, damit z. B. bei b = 1 „Schicht“ vor „Reihe“ gewinnt
  for (const s of [...stages].reverse()) if (stageCount(s, a, b, c) === n) return s;
  return null;
}

/** Lage des k-ten Würfels (Füllreihenfolge): Spalte entlang a, Reihe entlang b, Schicht nach oben. */
export function cubeCell(k: number, a: number, b: number): { col: number; row: number; layer: number } {
  return { col: k % a, row: Math.floor(k / a) % b, layer: Math.floor(k / (a * b)) };
}

export interface DropItem {
  /** Würfel mit Nummer from … to − 1 fallen gemeinsam. */
  from: number;
  to: number;
  kind: 'cube' | 'row' | 'layer';
  /** Beginn und Dauer in Sekunden. */
  start: number;
  duration: number;
}

/**
 * Zeitplan zum Füllen von `from` bis `to` Würfeln: In der ersten Reihe fällt
 * jeder Würfel einzeln, danach kommen ganze Reihen und schließlich ganze
 * Schichten. Zwischen den Abschnitten gibt es eine kurze Pause.
 */
export function fillPlan(a: number, b: number, c: number, from: number, to: number): DropItem[] {
  const items: DropItem[] = [];
  const row = a;
  const layer = a * b;
  const total = Math.min(to, a * b * c);
  let k = Math.max(0, from);
  let t = 0;
  let last: DropItem['kind'] | null = null;
  const timing = {
    cube: { gap: Math.min(0.3, 2.4 / a), duration: 0.5 },
    row: { gap: Math.min(0.45, 2.6 / Math.max(1, b - 1)), duration: 0.55 },
    layer: { gap: Math.min(0.6, 3.4 / Math.max(1, c - 1)), duration: 0.65 },
  };
  while (k < total) {
    const kind: DropItem['kind'] = k < row ? 'cube' : k < layer ? 'row' : 'layer';
    const size = kind === 'cube' ? 1 : kind === 'row' ? row - (k % row) : layer - (k % layer);
    const end = Math.min(total, k + size);
    if (last && last !== kind) t += 0.35;
    items.push({ from: k, to: end, kind, start: t, duration: timing[kind].duration });
    t += timing[kind].gap;
    last = kind;
    k = end;
  }
  return items;
}

/** Gesamtdauer eines Zeitplans in Sekunden. */
export function planDuration(items: readonly DropItem[]): number {
  return items.reduce((m, i) => Math.max(m, i.start + i.duration), 0);
}

export function volume(a: number, b: number, c: number): number {
  return a * b * c;
}

/**
 * Das Volumen in anderen Einheiten: 1 dm³ = 1000 cm³ = 1 l, 1 m³ = 1000 dm³,
 * 1 cm³ = 1 ml.
 */
export function convertVolume(v: number, unit: UnitId): { cm3: number; dm3: number; m3: number; l: number; ml: number } {
  const dm3 = unit === 'cm' ? v / 1000 : unit === 'dm' ? v : v * 1000;
  return { cm3: dm3 * 1000, dm3, m3: dm3 / 1000, l: dm3, ml: dm3 * 1000 };
}

/** Oberfläche des Quaders: O = 2 · (a · b + a · c + b · c). */
export function surfaceArea(a: number, b: number, c: number): number {
  return 2 * (a * b + a * c + b * c);
}

// ───────────────────────── Üben ─────────────────────────

export interface CuboidTask {
  /** Volumen, Oberfläche, fehlende Höhe aus dem Volumen oder Volumen in Litern */
  kind: 'V' | 'O' | 'edge' | 'litre';
  a: number;
  b: number;
  c: number;
  unit: UnitId;
  answer: number;
}

/** Reproduzierbare Aufgabe Nr. q; die Art wechselt reihum: V, O, Höhe, Liter. */
export function cuboidTask(q: number, rand: () => number): CuboidTask {
  const kinds: CuboidTask['kind'][] = ['V', 'O', 'edge', 'litre'];
  const kind = kinds[(q - 1) % 4]!;
  const dim = (max: number) => 1 + Math.floor(rand() * max);
  if (kind === 'litre') {
    const unit: UnitId = rand() < 0.6 ? 'dm' : 'm';
    const max = unit === 'm' ? 3 : 8;
    const a = dim(max);
    const b = dim(max);
    const c = dim(max);
    return { kind, a, b, c, unit, answer: convertVolume(volume(a, b, c), unit).l };
  }
  const unit: UnitId = (['cm', 'dm', 'm'] as const)[Math.floor(rand() * 3)]!;
  const a = 2 + Math.floor(rand() * 7);
  const b = 2 + Math.floor(rand() * 5);
  const c = 2 + Math.floor(rand() * 6);
  const answer = kind === 'V' ? volume(a, b, c) : kind === 'O' ? surfaceArea(a, b, c) : c;
  return { kind, a, b, c, unit, answer };
}

/** Erste Zahl in der Eingabe (Punkte und Leerzeichen als Tausendertrennung erlaubt, Komma als Dezimalzeichen). */
export function parseAmount(text: string): number | null {
  const t = text.replace(/\s/g, '').replace(/(\d)\.(?=\d{3}(?:\D|$))/g, '$1');
  const m = t.match(/\d+(?:[.,]\d+)?/);
  return m ? Number(m[0].replace(',', '.')) : null;
}

export function checkCuboid(task: CuboidTask, text: string): { ok: boolean; got: number | null } {
  const got = parseAmount(text);
  return { ok: got !== null && Math.abs(got - task.answer) < 0.01, got };
}
