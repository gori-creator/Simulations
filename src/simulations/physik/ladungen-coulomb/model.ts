/**
 * Elektrische Ladungen: Reibungselektrizität, Elektroskop und das
 * Coulomb’sche Gesetz F = k · Q₁ · Q₂ / r².
 */

/** Coulomb-Konstante k = 1/(4π ε₀) in N m²/C² */
export const K = 8.9875517923e9;
export const E_CHARGE = 1.602176634e-19;

/** Coulombkraft in N (positiv: Abstoßung, negativ: Anziehung). */
export function coulomb(q1: number, q2: number, r: number): number {
  return (K * q1 * q2) / (r * r);
}

/**
 * Reibungselektrizität (vereinfacht): Beim Reiben gehen Elektronen vom Stoff
 * mit der kleineren „Elektronenaffinität“ auf den anderen über. Reihenfolge
 * nach der triboelektrischen Reihe (von „gibt leicht Elektronen ab“ zu
 * „nimmt leicht Elektronen auf“).
 */
export const TRIBO = ['hair', 'glass', 'wool', 'silk', 'paper', 'wood', 'amber', 'rubber', 'pvc'] as const;
export type Material = (typeof TRIBO)[number];

/** Ladung nach dem Reiben (in Elementarladungen, Vorzeichen) für Stoff a gegen Stoff b. */
export function rubCharge(a: Material, b: Material, electrons: number): { a: number; b: number } {
  const ia = TRIBO.indexOf(a);
  const ib = TRIBO.indexOf(b);
  if (ia === ib) return { a: 0, b: 0 };
  // Wer weiter links steht, gibt Elektronen ab und wird positiv
  const n = electrons;
  return ia < ib ? { a: n, b: -n } : { a: -n, b: n };
}

/** Ausschlag eines Elektroskops (Winkel in rad) – vereinfacht ∝ √|Q|, begrenzt auf 60°. */
export function electroscopeAngle(q: number, qMax: number): number {
  return Math.min(Math.PI / 3, (Math.PI / 3) * Math.sqrt(Math.abs(q) / qMax));
}

/* ------------------------------------------------------------------ */
/* Influenz                                                            */
/* ------------------------------------------------------------------ */

/**
 * Influenz (vereinfacht): Ein geladener Stab im Abstand d (m) verschiebt in
 * einer ungeladenen Metallkugel Ladung. Der verschobene Anteil wächst mit
 * der Stabladung und fällt mit dem Abstand wie 1/d²; höchstens so viel, wie
 * der Stab trägt. Liefert die getrennte Ladung (gleiches Vorzeichen wie
 * der Stab, auf der abgewandten Seite).
 */
export function inducedCharge(qRod: number, d: number, d0 = 0.05): number {
  const f = Math.min(1, (d0 / Math.max(d, d0)) ** 2);
  return qRod * 0.8 * f;
}

/* ------------------------------------------------------------------ */
/* Feld von Punktladungen                                              */
/* ------------------------------------------------------------------ */

export interface PointCharge {
  x: number;
  y: number;
  q: number;
}

/** Elektrisches Feld (Richtung und Betrag in beliebigen Einheiten, k · q / r²). */
export function fieldAt(x: number, y: number, charges: readonly PointCharge[]): [number, number] {
  let ex = 0;
  let ey = 0;
  for (const c of charges) {
    const dx = x - c.x;
    const dy = y - c.y;
    const r2 = dx * dx + dy * dy;
    if (r2 < 1e-12) continue;
    const r = Math.sqrt(r2);
    const e = c.q / r2;
    ex += (e * dx) / r;
    ey += (e * dy) / r;
  }
  return [ex, ey];
}

/**
 * Feldlinie ab einem Startpunkt in Feldrichtung (dir = +1) oder dagegen (−1),
 * mit fester Schrittweite. Bricht nahe einer Ladung oder außerhalb der Box ab.
 */
export function fieldLine(
  x0: number,
  y0: number,
  charges: readonly PointCharge[],
  dir: 1 | -1,
  step: number,
  maxSteps: number,
  box: { x0: number; y0: number; x1: number; y1: number },
  stopR: number,
): [number, number][] {
  const pts: [number, number][] = [[x0, y0]];
  let x = x0;
  let y = y0;
  for (let i = 0; i < maxSteps; i++) {
    // Mittelpunktsverfahren mit normierter Richtung
    const [ax, ay] = fieldAt(x, y, charges);
    const na = Math.hypot(ax, ay) || 1;
    const mx = x + (dir * step * ax) / na / 2;
    const my = y + (dir * step * ay) / na / 2;
    const [bx, by] = fieldAt(mx, my, charges);
    const nb = Math.hypot(bx, by) || 1;
    x += (dir * step * bx) / nb;
    y += (dir * step * by) / nb;
    pts.push([x, y]);
    if (x < box.x0 || x > box.x1 || y < box.y0 || y > box.y1) break;
    if (charges.some((c) => Math.hypot(x - c.x, y - c.y) < stopR)) break;
  }
  return pts;
}

/* ------------------------------------------------------------------ */
/* Atom: elektrische Kraft und Gravitation                            */
/* ------------------------------------------------------------------ */

export const G_GRAV = 6.674e-11;
export const M_E = 9.109e-31;
export const M_P = 1.6726e-27;

/** Gravitationskraft F = G · m₁ · m₂ / r² in N. */
export function gravity(m1: number, m2: number, r: number): number {
  return (G_GRAV * m1 * m2) / (r * r);
}

/** Verhältnis elektrische Kraft zu Gravitation zwischen Elektron und Proton (unabhängig von r). */
export function electricToGravity(): number {
  return (K * E_CHARGE * E_CHARGE) / (G_GRAV * M_E * M_P);
}

/* ------------------------------------------------------------------ */
/* Übung                                                               */
/* ------------------------------------------------------------------ */

export type Loc = { de: string; en: string };
export type TaskKind = 'F' | 'r2' | 'sign' | 'count' | 'q3' | 'rub' | 'Fr' | 'ratio';

export interface ChargeTask {
  kind: TaskKind;
  text: Loc;
  answer: number;
  unit: string;
  tol: number;
  solution: Loc;
}

function rng(seed: number): () => number {
  let s = (seed * 2654435761) >>> 0 || 1;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;
const de = (x: number, d = 2) => round(x, d).toString().replace('.', ',').replace('-', '−');
const en = (x: number, d = 2) => round(x, d).toString().replace('-', '−');

const RUB_NAMES: Record<Material, Loc> = {
  hair: { de: 'Haare', en: 'hair' },
  glass: { de: 'Glas', en: 'glass' },
  wool: { de: 'Wolle', en: 'wool' },
  silk: { de: 'Seide', en: 'silk' },
  paper: { de: 'Papier', en: 'paper' },
  wood: { de: 'Holz', en: 'wood' },
  amber: { de: 'Bernstein', en: 'amber' },
  rubber: { de: 'Gummi', en: 'rubber' },
  pvc: { de: 'Kunststoff', en: 'plastic' },
};

/** Übungsaufgabe Nummer n; die Arten wechseln reihum, Zahlen zufällig, aber fest je Nummer. */
export function makeTask(n: number): ChargeTask {
  const r = rng(n * 157 + 3);
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)]!;
  const kinds: TaskKind[] = ['sign', 'F', 'r2', 'count', 'rub', 'q3', 'Fr', 'ratio'];
  const kind = kinds[(n - 1) % kinds.length]!;
  if (kind === 'sign') {
    const s1 = pick([1, -1]);
    const s2 = pick([1, -1]);
    const a = s1 * s2 > 0 ? 1 : 2;
    const w = (s: number, l: 'de' | 'en') => (s > 0 ? (l === 'de' ? 'positiv' : 'positive') : l === 'de' ? 'negativ' : 'negative');
    return {
      kind,
      text: { de: `Eine Kugel ist ${w(s1, 'de')}, die andere ${w(s2, 'de')} geladen. Stoßen sie sich ab (1) oder ziehen sie sich an (2)?`, en: `One sphere is charged ${w(s1, 'en')}, the other ${w(s2, 'en')}. Do they repel (1) or attract (2)?` },
      answer: a,
      unit: '',
      tol: 0,
      solution: { de: a === 1 ? 'Gleichnamige Ladungen stoßen sich ab.' : 'Ungleichnamige Ladungen ziehen sich an.', en: a === 1 ? 'Like charges repel.' : 'Unlike charges attract.' },
    };
  }
  if (kind === 'F') {
    const q1 = pick([1, 2, 3]);
    const q2 = pick([1, 2, 4]);
    const rc = pick([10, 20, 30]);
    const F = (K * q1 * 1e-6 * q2 * 1e-6) / (rc / 100) ** 2;
    return {
      kind,
      text: { de: `Zwei Ladungen mit ${de(q1)} µC und ${de(q2)} µC sind ${de(rc)} cm voneinander entfernt. Wie groß ist die Kraft in N? (k ≈ 9 · 10⁹ N m²/C²)`, en: `Two charges of ${en(q1)} µC and ${en(q2)} µC are ${en(rc)} cm apart. How large is the force in N? (k ≈ 9 · 10⁹ N m²/C²)` },
      answer: F,
      unit: 'N',
      tol: 0.02,
      solution: { de: `F = k · Q₁ · Q₂ : r² = 8,99 · 10⁹ · ${de(q1)} · 10⁻⁶ · ${de(q2)} · 10⁻⁶ : (${de(rc / 100)})² ≈ ${de(F, 2)} N`, en: `F = k · Q₁ · Q₂ / r² = 8.99 · 10⁹ · ${en(q1)} · 10⁻⁶ · ${en(q2)} · 10⁻⁶ / (${en(rc / 100)})² ≈ ${en(F, 2)} N` },
    };
  }
  if (kind === 'r2') {
    const f = pick([2, 3, 4]);
    const F0 = pick([8, 9, 16, 36]);
    const F = F0 / (f * f);
    return {
      kind,
      text: { de: `Zwei Ladungen stoßen sich mit ${de(F0)} N ab. Der Abstand wird ${f === 2 ? 'verdoppelt' : f === 3 ? 'verdreifacht' : 'vervierfacht'}. Wie groß ist die Kraft jetzt in N?`, en: `Two charges repel with ${en(F0)} N. The distance is ${f === 2 ? 'doubled' : f === 3 ? 'tripled' : 'quadrupled'}. How large is the force now in N?` },
      answer: F,
      unit: 'N',
      tol: 0.01,
      solution: { de: `F ~ 1/r²: ${f}-facher Abstand → Kraft durch ${f * f}: ${de(F0)} N : ${f * f} = ${de(F, 2)} N`, en: `F ∝ 1/r²: ${f} times the distance → force divided by ${f * f}: ${en(F0)} N / ${f * f} = ${en(F, 2)} N` },
    };
  }
  if (kind === 'count') {
    const nE = pick([1, 2, 5]);
    const exp = pick([10, 12]);
    const Q = nE * 10 ** exp * E_CHARGE;
    return {
      kind,
      text: { de: `Ein Stab hat ${de(nE)} · 10^${exp} Elektronen zu viel. Wie groß ist seine Ladung in nC? (e = 1,6 · 10⁻¹⁹ C)`, en: `A rod has ${en(nE)} · 10^${exp} excess electrons. What is its charge in nC? (e = 1.6 · 10⁻¹⁹ C)` },
      answer: Q * 1e9,
      unit: 'nC',
      tol: 0.02,
      solution: { de: `Q = N · e = ${de(nE)} · 10^${exp} · 1,6 · 10⁻¹⁹ C ≈ ${de(Q * 1e9, 3)} nC (negativ)`, en: `Q = N · e = ${en(nE)} · 10^${exp} · 1.6 · 10⁻¹⁹ C ≈ ${en(Q * 1e9, 3)} nC (negative)` },
    };
  }
  if (kind === 'rub') {
    const pairs: [Material, Material][] = [
      ['pvc', 'wool'],
      ['glass', 'silk'],
      ['rubber', 'hair'],
      ['amber', 'wool'],
    ];
    const [a, b] = pick(pairs);
    const c = rubCharge(a, b, 1);
    const ans = c.a < 0 ? 1 : 2;
    return {
      kind,
      text: { de: `Ein Stab aus ${RUB_NAMES[a].de} wird mit ${RUB_NAMES[b].de} gerieben. Wird der Stab negativ (1) oder positiv (2)?`, en: `A ${RUB_NAMES[a].en} rod is rubbed with ${RUB_NAMES[b].en}. Does the rod become negative (1) or positive (2)?` },
      answer: ans,
      unit: '',
      tol: 0,
      solution: {
        de: ans === 1 ? `Der Stab nimmt Elektronen auf und wird negativ, ${RUB_NAMES[b].de} wird positiv.` : `Der Stab gibt Elektronen ab und wird positiv, ${RUB_NAMES[b].de} wird negativ.`,
        en: ans === 1 ? `The rod takes electrons and becomes negative, the ${RUB_NAMES[b].en} becomes positive.` : `The rod gives off electrons and becomes positive, the ${RUB_NAMES[b].en} becomes negative.`,
      },
    };
  }
  if (kind === 'q3') {
    const f1 = pick([2, 3]);
    const f2 = pick([1, 2]);
    const F0 = pick([2, 4, 5]);
    const F = F0 * f1 * f2;
    return {
      kind,
      text: { de: `Zwei Ladungen ziehen sich mit ${de(F0)} N an. Q₁ wird ${f1}-mal so groß${f2 > 1 ? `, Q₂ ${f2}-mal so groß` : ''}, der Abstand bleibt gleich. Wie groß ist die Kraft jetzt in N?`, en: `Two charges attract with ${en(F0)} N. Q₁ becomes ${f1} times as large${f2 > 1 ? `, Q₂ ${f2} times as large` : ''}, the distance stays the same. How large is the force now in N?` },
      answer: F,
      unit: 'N',
      tol: 0.01,
      solution: { de: `F ~ Q₁ · Q₂: ${de(F0)} N · ${f1} · ${f2} = ${de(F)} N`, en: `F ∝ Q₁ · Q₂: ${en(F0)} N · ${f1} · ${f2} = ${en(F)} N` },
    };
  }
  if (kind === 'Fr') {
    const q = pick([2, 3, 5]);
    const F = pick([0.9, 3.6, 8.1]);
    const rr = Math.sqrt((K * (q * 1e-6) ** 2) / F);
    return {
      kind,
      text: { de: `Zwei gleiche Ladungen von je ${de(q)} µC stoßen sich mit ${de(F)} N ab. Wie weit sind sie voneinander entfernt, in cm? (k ≈ 9 · 10⁹ N m²/C²)`, en: `Two equal charges of ${en(q)} µC each repel with ${en(F)} N. How far apart are they, in cm? (k ≈ 9 · 10⁹ N m²/C²)` },
      answer: rr * 100,
      unit: 'cm',
      tol: 0.02,
      solution: { de: `r = √(k · Q² : F) = √(8,99 · 10⁹ · (${de(q)} · 10⁻⁶)² : ${de(F)}) m ≈ ${de(rr * 100, 1)} cm`, en: `r = √(k · Q² / F) = √(8.99 · 10⁹ · (${en(q)} · 10⁻⁶)² / ${en(F)}) m ≈ ${en(rr * 100, 1)} cm` },
    };
  }
  const exp = Math.round(Math.log10(electricToGravity()));
  return {
    kind: 'ratio',
    text: { de: 'Im Wasserstoffatom: Die elektrische Kraft zwischen Elektron und Proton ist etwa 10^x-mal so groß wie die Gravitation. Wie groß ist x?', en: 'In a hydrogen atom the electric force between electron and proton is about 10^x times the gravitational force. What is x?' },
    answer: exp,
    unit: '',
    tol: 0.03,
    solution: { de: `F_el : F_G = k · e² : (G · m_e · m_p) ≈ 2,3 · 10³⁹ – also x ≈ ${exp}. Gravitation spielt im Atom keine Rolle.`, en: `F_el / F_G = k · e² / (G · m_e · m_p) ≈ 2.3 · 10³⁹ – so x ≈ ${exp}. Gravity plays no role in the atom.` },
  };
}

export function parseAnswer(input: string): number | null {
  const s = input.trim().replace(/\s/g, '').replace('−', '-').replace(',', '.').replace(/[a-zA-Zµ/²³°]+$/, '');
  if (!s || !/^-?\d*\.?\d+(e-?\d+)?$/.test(s)) return null;
  return Number(s);
}

export function checkTask(task: ChargeTask, input: string): boolean | null {
  const x = parseAnswer(input);
  if (x === null) return null;
  if (task.tol === 0) return x === task.answer;
  return Math.abs(x - task.answer) <= task.tol * Math.abs(task.answer) + 1e-9;
}
