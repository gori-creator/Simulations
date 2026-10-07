/**
 * Rechenlogik „Ganze Zahlen an der Zahlengeraden“: Addition und Subtraktion
 * im Pfeil- und Laufmodell, Gegenzahl, Betrag, passender Ausschnitt der
 * Zahlengeraden und Texte zu den Sachsituationen.
 */

export type Op = 'plus' | 'minus';
export type Scene = 'gerade' | 'thermo' | 'meer' | 'konto';
export type Lang = 'de' | 'en';

const MINUS = '−';

/** Ergebnis von a + b bzw. a − b. */
export function compute(a: number, op: Op, b: number): number {
  return op === 'plus' ? a + b : a - b;
}

/** Tatsächliche Änderung: Subtrahieren heißt, die Gegenzahl zu addieren. */
export function change(op: Op, b: number): number {
  return op === 'plus' ? b : opposite(b);
}

/** Gegenzahl (an der 0 gespiegelt). */
export function opposite(x: number): number {
  return x === 0 ? 0 : -x;
}

/** Betrag: Abstand von der 0. */
export function absolute(x: number): number {
  return Math.abs(x);
}

/**
 * Laufmodell: Das Rechenzeichen gibt die Blickrichtung an (+ nach rechts,
 * − umdrehen, also nach links), das Vorzeichen der zweiten Zahl, ob vorwärts
 * (positiv) oder rückwärts (negativ) gegangen wird.
 */
export interface WalkPlan {
  /** Blickrichtung nach dem Rechenzeichen: +1 rechts (positive Richtung), −1 links. */
  facing: 1 | -1;
  /** Muss sich die Figur umdrehen? */
  turn: boolean;
  /** Anzahl der Schritte. */
  steps: number;
  /** Rückwärts gehen? */
  backward: boolean;
  /** Bewegung pro Schritt auf der Zahlengeraden (+1 oder −1; 0 ohne Schritte). */
  dir: 1 | -1 | 0;
}

export function walkPlan(op: Op, b: number): WalkPlan {
  const facing = op === 'plus' ? 1 : -1;
  const backward = b < 0;
  const steps = Math.abs(b);
  const d = change(op, b);
  return { facing, turn: op === 'minus', steps, backward, dir: d > 0 ? 1 : d < 0 ? -1 : 0 };
}

/** Zahl mit echtem Minuszeichen. */
export function num(x: number): string {
  return x < 0 ? `${MINUS}${Math.abs(x)}` : String(x);
}

/** Zahl hinter einem Rechenzeichen: negative Zahlen in Klammern („−3 − (−4)“). */
export function operand(x: number): string {
  return x < 0 ? `(${num(x)})` : String(x);
}

/** Term als Text, z. B. „2 − (−4)“. */
export function termText(a: number, op: Op, b: number): string {
  return `${num(a)} ${op === 'plus' ? '+' : MINUS} ${operand(b)}`;
}

/**
 * Umformung nach den Rechenregeln: a − b = a + (−b) und a + (−b) = a − b.
 * `null`, wenn es nichts umzuformen gibt (Addition einer nichtnegativen Zahl).
 */
export function rewrite(a: number, op: Op, b: number): string | null {
  if (op === 'minus') return `${num(a)} + ${operand(opposite(b))}`;
  if (b < 0) return `${num(a)} ${MINUS} ${operand(opposite(b))}`;
  return null;
}

/**
 * Sichtbarer Ausschnitt der Zahlengeraden: enthält 0, Start, Ergebnis und
 * weitere wichtige Stellen, auf Fünfer gerundet und mindestens `minSpan` breit.
 */
export function viewRange(values: readonly number[], minSpan = 10): [number, number] {
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  // etwas Rand, außer direkt an der 0
  let lo = min < 0 ? Math.floor((min - 1) / 5) * 5 : 0;
  let hi = max > 0 ? Math.ceil((max + 1) / 5) * 5 : 0;
  while (hi - lo < minSpan) {
    if (Math.abs(lo) < Math.abs(hi)) lo -= 5;
    else hi += 5;
  }
  return [lo, hi];
}

/** Zufällige Aufgabe mit Ergebnis im Bereich −20 … 20. */
export function randomTask(rand: () => number): { a: number; op: Op; b: number } {
  for (;;) {
    const a = Math.round(rand() * 30) - 15;
    const b = Math.round(rand() * 30) - 15;
    const op: Op = rand() < 0.5 ? 'plus' : 'minus';
    const r = compute(a, op, b);
    if (b !== 0 && Math.abs(r) <= 20 && (a < 0 || b < 0 || r < 0)) return { a, op, b };
  }
}

/* ------------------------------------------------------------------ */
/* Sachsituationen                                                     */
/* ------------------------------------------------------------------ */

interface Words {
  start: (a: number) => string;
  change: (op: Op, b: number) => string;
  result: (r: number) => string;
}

const DE: Record<Exclude<Scene, 'gerade'>, Words> = {
  thermo: {
    start: (a) => `Es ist ${num(a)} °C.`,
    change: (op, b) => {
      const d = change(op, b);
      if (d === 0) return 'Die Temperatur bleibt gleich.';
      return `Es wird ${Math.abs(d)} °C ${d > 0 ? 'wärmer' : 'kälter'}.`;
    },
    result: (r) => `Jetzt ist es ${num(r)} °C.`,
  },
  meer: {
    start: (a) => (a === 0 ? 'Der Pinguin ist auf Höhe des Meeresspiegels.' : `Der Pinguin ist ${Math.abs(a)} m ${a > 0 ? 'über' : 'unter'} dem Meeresspiegel.`),
    change: (op, b) => {
      const d = change(op, b);
      if (d === 0) return 'Er bleibt auf gleicher Höhe.';
      return d > 0 ? `Er steigt ${Math.abs(d)} m nach oben.` : `Er taucht ${Math.abs(d)} m nach unten.`;
    },
    result: (r) => (r === 0 ? 'Jetzt ist er genau auf Meereshöhe.' : `Jetzt ist er ${Math.abs(r)} m ${r > 0 ? 'über' : 'unter'} dem Meeresspiegel.`),
  },
  konto: {
    start: (a) => (a === 0 ? 'Das Konto steht auf 0 €.' : a > 0 ? `Guthaben: ${a} €.` : `Schulden: ${Math.abs(a)} € (Kontostand ${num(a)} €).`),
    change: (op, b) => {
      if (b === 0) return 'Es wird nichts gebucht.';
      if (op === 'plus') return b > 0 ? `${b} € werden eingezahlt.` : `Neue Schulden von ${Math.abs(b)} € kommen dazu.`;
      return b > 0 ? `${b} € werden abgebucht.` : `Schulden von ${Math.abs(b)} € werden gestrichen.`;
    },
    result: (r) => `Neuer Kontostand: ${num(r)} €.`,
  },
};

const EN: Record<Exclude<Scene, 'gerade'>, Words> = {
  thermo: {
    start: (a) => `It is ${num(a)} °C.`,
    change: (op, b) => {
      const d = change(op, b);
      if (d === 0) return 'The temperature stays the same.';
      return `It gets ${Math.abs(d)} °C ${d > 0 ? 'warmer' : 'colder'}.`;
    },
    result: (r) => `Now it is ${num(r)} °C.`,
  },
  meer: {
    start: (a) => (a === 0 ? 'The penguin is at sea level.' : `The penguin is ${Math.abs(a)} m ${a > 0 ? 'above' : 'below'} sea level.`),
    change: (op, b) => {
      const d = change(op, b);
      if (d === 0) return 'It stays at the same height.';
      return d > 0 ? `It climbs ${Math.abs(d)} m up.` : `It dives ${Math.abs(d)} m down.`;
    },
    result: (r) => (r === 0 ? 'Now it is exactly at sea level.' : `Now it is ${Math.abs(r)} m ${r > 0 ? 'above' : 'below'} sea level.`),
  },
  konto: {
    start: (a) => (a === 0 ? 'The balance is €0.' : a > 0 ? `Credit: €${a}.` : `Debt: €${Math.abs(a)} (balance ${MINUS}€${Math.abs(a)}).`),
    change: (op, b) => {
      if (b === 0) return 'Nothing is booked.';
      if (op === 'plus') return b > 0 ? `€${b} is paid in.` : `A new debt of €${Math.abs(b)} is added.`;
      return b > 0 ? `€${b} is taken out.` : `A debt of €${Math.abs(b)} is cancelled.`;
    },
    result: (r) => `New balance: ${r < 0 ? `${MINUS}€${Math.abs(r)}` : `€${r}`}.`,
  },
};

/** Sätze zur Sachsituation: Ausgangslage, Änderung, Ergebnis. */
export function story(scene: Exclude<Scene, 'gerade'>, a: number, op: Op, b: number, lang: Lang): { start: string; change: string; result: string } {
  const w = (lang === 'de' ? DE : EN)[scene];
  return { start: w.start(a), change: w.change(op, b), result: w.result(compute(a, op, b)) };
}
