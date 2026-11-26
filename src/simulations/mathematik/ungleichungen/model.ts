/**
 * Lineare Ungleichungen a·x + b ⋚ c·x + d: Lösen durch Äquivalenzumformungen,
 * mit Umkehren des Relationszeichens beim Teilen durch eine negative Zahl.
 */

export type Rel = 'lt' | 'le' | 'gt' | 'ge';

export const REL_SYMBOL: Record<Rel, string> = {
  lt: '<',
  le: '≤',
  gt: '>',
  ge: '≥',
};

/** Relationszeichen umkehren (beim Multiplizieren/Teilen mit einer negativen Zahl). */
export function flip(rel: Rel): Rel {
  return rel === 'lt' ? 'gt' : rel === 'gt' ? 'lt' : rel === 'le' ? 'ge' : 'le';
}

/** Gilt l ⋚ r? (mit kleiner Toleranz für Rundungsfehler bei Gleichheit) */
export function holds(l: number, r: number, rel: Rel): boolean {
  const eps = 1e-9;
  switch (rel) {
    case 'lt':
      return l < r - eps;
    case 'le':
      return l <= r + eps;
    case 'gt':
      return l > r + eps;
    case 'ge':
      return l >= r - eps;
  }
}

export type Solution = { kind: 'bound'; rel: Rel; x: number } | { kind: 'all' } | { kind: 'none' };

export interface Steps {
  /** Koeffizient von x nach dem Sammeln: a − c */
  k: number;
  /** rechte Seite nach dem Sammeln: d − b */
  m: number;
  /** Relationszeichen nach dem Teilen durch k */
  rel: Rel;
  /** wurde das Zeichen umgedreht? */
  flipped: boolean;
}

export function steps(a: number, b: number, c: number, d: number, rel: Rel): Steps {
  const k = a - c;
  const m = d - b;
  return { k, m, rel: k < 0 ? flip(rel) : rel, flipped: k < 0 };
}

export function solve(a: number, b: number, c: number, d: number, rel: Rel): Solution {
  const s = steps(a, b, c, d, rel);
  if (Math.abs(s.k) < 1e-12) return holds(0, s.m, rel) ? { kind: 'all' } : { kind: 'none' };
  const x = s.m / s.k;
  return { kind: 'bound', rel: s.rel, x: x === 0 ? 0 : x };
}

/** Liegt x in der Lösungsmenge? */
export function inSolution(sol: Solution, x: number): boolean {
  if (sol.kind === 'all') return true;
  if (sol.kind === 'none') return false;
  return holds(x, sol.x, sol.rel);
}

/* ------------------------------------------------------------------ */
/* Zusammengesetzte Ungleichungen (und/oder)                           */
/* ------------------------------------------------------------------ */

/** Untere Schranke: lo < x (offen) oder lo ≤ x (geschlossen). */
export interface Combined {
  lo: number;
  loClosed: boolean;
  hi: number;
  hiClosed: boolean;
  op: 'und' | 'oder';
}

/** Erfüllt x die Bedingung „x über lo“ und/oder „x unter hi“? */
export function inCombined(c: Combined, x: number): boolean {
  const a = c.loClosed ? x >= c.lo - 1e-9 : x > c.lo + 1e-9;
  const b = c.hiClosed ? x <= c.hi + 1e-9 : x < c.hi - 1e-9;
  return c.op === 'und' ? a && b : a || b;
}

/** Art der Lösungsmenge: Intervall, leer, alle Zahlen oder zwei Strahlen (nur bei „oder“ und lo > hi ist alles). */
export function combinedKind(c: Combined): 'interval' | 'empty' | 'all' | 'two' {
  if (c.op === 'und') {
    if (c.lo < c.hi) return 'interval';
    if (c.lo === c.hi && c.loClosed && c.hiClosed) return 'interval';
    return 'empty';
  }
  // „x > lo oder x < hi“: deckt alles ab, sobald sich die Strahlen treffen
  if (c.lo < c.hi) return 'all';
  if (c.lo === c.hi && (c.loClosed || c.hiClosed)) return 'all';
  return 'two';
}

/** Anzahl der ganzen Zahlen in der Lösungsmenge (nur für Intervalle sinnvoll, sonst −1 für unendlich). */
export function countIntegers(c: Combined): number {
  const k = combinedKind(c);
  if (k === 'empty') return 0;
  if (k !== 'interval') return -1;
  const from = c.loClosed ? Math.ceil(c.lo - 1e-9) : Math.floor(c.lo + 1e-9) + 1;
  const to = c.hiClosed ? Math.floor(c.hi + 1e-9) : Math.ceil(c.hi - 1e-9) - 1;
  return Math.max(0, to - from + 1);
}

/* ------------------------------------------------------------------ */
/* Ungleichungen im Alltag                                             */
/* ------------------------------------------------------------------ */

export type Loc = { de: string; en: string };
export type ScenarioId = 'handy' | 'fitness' | 'sparen' | 'taxi' | 'aufzug';

export interface Scenario {
  id: ScenarioId;
  /** linke Seite a·x + b und rechte Seite c·x + d mit Relationszeichen */
  a: number;
  b: number;
  c: number;
  d: number;
  rel: Rel;
  xMax: number;
  /** nur ganze x sinnvoll (Wochen, Kisten) */
  integer: boolean;
  xLabel: Loc;
  yLabel: Loc;
  left: Loc;
  right: Loc;
  question: Loc;
}

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  handy: {
    id: 'handy',
    a: 0.09,
    b: 5,
    c: 0,
    d: 15,
    rel: 'gt',
    xMax: 200,
    integer: true,
    xLabel: { de: 'Minuten', en: 'minutes' },
    yLabel: { de: '€', en: '€' },
    left: {
      de: 'Tarif A: 5 € + 0,09 € pro Minute',
      en: 'Plan A: €5 + €0.09 per minute',
    },
    right: { de: 'Flatrate: 15 €', en: 'Flat rate: €15' },
    question: {
      de: 'Ab wie vielen Minuten ist die Flatrate günstiger?',
      en: 'From how many minutes is the flat rate cheaper?',
    },
  },
  fitness: {
    id: 'fitness',
    a: 20,
    b: 60,
    c: 30,
    d: 0,
    rel: 'lt',
    xMax: 12,
    integer: true,
    xLabel: { de: 'Monate', en: 'months' },
    yLabel: { de: '€', en: '€' },
    left: {
      de: 'Studio A: 60 € Aufnahme + 20 € im Monat',
      en: 'Gym A: €60 joining fee + €20 a month',
    },
    right: { de: 'Studio B: 30 € im Monat', en: 'Gym B: €30 a month' },
    question: {
      de: 'Ab wie vielen Monaten ist Studio A günstiger?',
      en: 'From how many months is gym A cheaper?',
    },
  },
  sparen: {
    id: 'sparen',
    a: 6,
    b: 40,
    c: 0,
    d: 150,
    rel: 'ge',
    xMax: 30,
    integer: true,
    xLabel: { de: 'Wochen', en: 'weeks' },
    yLabel: { de: '€', en: '€' },
    left: {
      de: 'Erspartes: 40 € + 6 € pro Woche',
      en: 'Savings: €40 + €6 per week',
    },
    right: { de: 'Fahrrad: 150 €', en: 'Bike: €150' },
    question: {
      de: 'Nach wie vielen Wochen reicht das Geld?',
      en: 'After how many weeks is there enough money?',
    },
  },
  taxi: {
    id: 'taxi',
    a: 2.2,
    b: 4,
    c: 0,
    d: 25,
    rel: 'le',
    xMax: 15,
    integer: false,
    xLabel: { de: 'km', en: 'km' },
    yLabel: { de: '€', en: '€' },
    left: { de: 'Taxi: 4 € + 2,20 € pro km', en: 'Taxi: €4 + €2.20 per km' },
    right: { de: 'Budget: 25 €', en: 'Budget: €25' },
    question: {
      de: 'Wie weit kann man höchstens fahren?',
      en: 'How far can you go at most?',
    },
  },
  aufzug: {
    id: 'aufzug',
    a: 25,
    b: 80,
    c: 0,
    d: 630,
    rel: 'le',
    xMax: 30,
    integer: true,
    xLabel: { de: 'Kisten', en: 'boxes' },
    yLabel: { de: 'kg', en: 'kg' },
    left: {
      de: 'Person 80 kg + Kisten zu je 25 kg',
      en: 'Person 80 kg + boxes of 25 kg each',
    },
    right: { de: 'Aufzug: höchstens 630 kg', en: 'Lift: at most 630 kg' },
    question: {
      de: 'Wie viele Kisten darf die Person höchstens mitnehmen?',
      en: 'How many boxes can the person take at most?',
    },
  },
};

/**
 * Antwort auf die Alltagsfrage: kleinste bzw. größte zulässige Zahl
 * (bei ganzen Zahlen gerundet). `bound` ist die genaue Grenze.
 */
export function scenarioAnswer(s: Scenario): {
  bound: number;
  best: number;
  side: 'min' | 'max';
} {
  const sol = solve(s.a, s.b, s.c, s.d, s.rel);
  if (sol.kind !== 'bound') return { bound: NaN, best: NaN, side: 'min' };
  const side = sol.rel === 'gt' || sol.rel === 'ge' ? 'min' : 'max';
  let best = sol.x;
  if (s.integer) {
    if (side === 'min') best = sol.rel === 'ge' ? Math.ceil(sol.x - 1e-9) : Math.floor(sol.x + 1e-9) + 1;
    else best = sol.rel === 'le' ? Math.floor(sol.x + 1e-9) : Math.ceil(sol.x - 1e-9) - 1;  } else {
    // sonst auf zwei Stellen, aber immer auf der sicheren Seite der Grenze
    best = side === 'max' ? Math.floor(sol.x * 100 + 1e-9) / 100 : Math.ceil(sol.x * 100 - 1e-9) / 100;
  }
  return { bound: sol.x, best, side };
}

/* ------------------------------------------------------------------ */
/* Ungleichungen mit zwei Variablen: Halbebenen                        */
/* ------------------------------------------------------------------ */

/** Liegt der Punkt (x|y) in der Halbebene y ⋚ m·x + n? */
export function inHalfPlane(m: number, n: number, rel: Rel, x: number, y: number): boolean {
  return holds(y, m * x + n, rel);
}

/* ------------------------------------------------------------------ */
/* Übung                                                               */
/* ------------------------------------------------------------------ */

export type TaskKind = 'solve' | 'flip' | 'test' | 'count' | 'word' | 'line';

export interface IneqTask {
  kind: TaskKind;
  text: Loc;
  answer: number;
  /** zulässige Abweichung (absolut) */
  tol: number;
  choices: Loc[] | null;
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

/** Zahl mit Minuszeichen „−“ und Dezimalkomma (de) bzw. -punkt (en). */
export function numText(x: number, lang: 'de' | 'en'): string {
  const r = Math.round(x * 100) / 100;
  const s = Math.abs(r).toString();
  return (r < 0 ? '−' : '') + (lang === 'de' ? s.replace('.', ',') : s);
}

/** Term k·x + m als Text („2x + 1“, „−x“, „3“). */
export function termText(k: number, m: number, lang: 'de' | 'en'): string {
  let s = '';
  if (k !== 0) s = k === 1 ? 'x' : k === -1 ? '−x' : `${numText(k, lang)}x`;
  if (m !== 0 || s === '') {
    if (s === '') s = numText(m, lang);
    else s += m < 0 ? ` − ${numText(-m, lang)}` : ` + ${numText(m, lang)}`;
  }
  return s;
}

const RELS: Rel[] = ['lt', 'le', 'gt', 'ge'];
const REL_CHOICES: Loc[] = RELS.map((r) => ({
  de: `x ${REL_SYMBOL[r]} …`,
  en: `x ${REL_SYMBOL[r]} …`,
}));

/** Übungsaufgabe Nummer n (gleiche Nummer → gleiche Aufgabe). */
export function makeTask(n: number): IneqTask {
  const r = rng(n * 97 + 13);
  const int = (lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
  const nz = (lo: number, hi: number) => {
    let v = 0;
    while (v === 0) v = int(lo, hi);
    return v;
  };
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)]!;
  const kinds: TaskKind[] = ['solve', 'flip', 'test', 'count', 'word', 'line'];
  const kind = kinds[(n - 1) % kinds.length]!;
  const t = (lang: 'de' | 'en', k: number, m: number) => termText(k, m, lang);

  if (kind === 'solve' || kind === 'flip') {
    // a·x + b ⋚ c·x + d mit ganzzahliger Lösung
    const k = kind === 'flip' ? -nz(1, 4) : nz(-4, 4);
    const x0 = int(-6, 6);
    const c = int(-2, 2);
    const a = k + c;
    const b = int(-8, 8);
    const d = k * x0 + b;
    const rel = pick(RELS);
    const s = steps(a, b, c, d, rel);
    const ineq = {
      de: `${t('de', a, b)} ${REL_SYMBOL[rel]} ${t('de', c, d)}`,
      en: `${t('en', a, b)} ${REL_SYMBOL[rel]} ${t('en', c, d)}`,
    };
    const sol = {
      de: `${t('de', s.k, 0)} ${REL_SYMBOL[rel]} ${numText(s.m, 'de')}; geteilt durch ${numText(s.k, 'de')}: x ${REL_SYMBOL[s.rel]} ${numText(x0, 'de')}${s.flipped ? ' (Zeichen umgedreht, weil durch eine negative Zahl geteilt wird)' : ''}`,
      en: `${t('en', s.k, 0)} ${REL_SYMBOL[rel]} ${numText(s.m, 'en')}; divided by ${numText(s.k, 'en')}: x ${REL_SYMBOL[s.rel]} ${numText(x0, 'en')}${s.flipped ? ' (sign reversed because we divide by a negative number)' : ''}`,
    };
    if (kind === 'solve') {
      return {
        kind,
        text: {
          de: `Löse ${ineq.de}. Gib die Grenze der Lösungsmenge ein (die Zahl, mit der x verglichen wird).`,
          en: `Solve ${ineq.en}. Enter the boundary of the solution set (the number x is compared with).`,
        },
        answer: x0,
        tol: 0.01,
        choices: null,
        solution: sol,
      };
    }
    return {
      kind,
      text: {
        de: `Löse ${ineq.de}. Welches Zeichen steht am Ende zwischen x und der Zahl?`,
        en: `Solve ${ineq.en}. Which sign ends up between x and the number?`,
      },
      answer: RELS.indexOf(s.rel) + 1,
      tol: 0,
      choices: REL_CHOICES,
      solution: sol,
    };
  }
  if (kind === 'test') {
    const a = nz(-3, 4);
    const b = int(-6, 6);
    const d = int(-6, 10);
    const rel = pick(RELS);
    const x = int(-4, 5);
    const l = a * x + b;
    const ok = holds(l, d, rel);
    return {
      kind,
      text: {
        de: `Ist x = ${numText(x, 'de')} eine Lösung von ${t('de', a, b)} ${REL_SYMBOL[rel]} ${numText(d, 'de')}?`,
        en: `Is x = ${numText(x, 'en')} a solution of ${t('en', a, b)} ${REL_SYMBOL[rel]} ${numText(d, 'en')}?`,
      },
      answer: ok ? 1 : 2,
      tol: 0,
      choices: [
        { de: 'ja', en: 'yes' },
        { de: 'nein', en: 'no' },
      ],
      solution: {
        de: `Einsetzen: ${numText(l, 'de')} ${REL_SYMBOL[rel]} ${numText(d, 'de')} ist ${ok ? 'wahr' : 'falsch'}.`,
        en: `Substitute: ${numText(l, 'en')} ${REL_SYMBOL[rel]} ${numText(d, 'en')} is ${ok ? 'true' : 'false'}.`,
      },
    };
  }
  if (kind === 'count') {
    const lo = int(-6, 2);
    const hi = lo + int(2, 7);
    const c: Combined = {
      lo,
      hi,
      loClosed: r() < 0.5,
      hiClosed: r() < 0.5,
      op: 'und',
    };
    const cnt = countIntegers(c);
    const ls = c.loClosed ? '≤' : '<';
    const hs = c.hiClosed ? '≤' : '<';
    return {
      kind,
      text: {
        de: `Wie viele ganze Zahlen erfüllen ${numText(lo, 'de')} ${ls} x ${hs} ${numText(hi, 'de')}?`,
        en: `How many integers satisfy ${numText(lo, 'en')} ${ls} x ${hs} ${numText(hi, 'en')}?`,
      },
      answer: cnt,
      tol: 0,
      choices: null,
      solution: {
        de: `Von ${numText(c.loClosed ? lo : lo + 1, 'de')} bis ${numText(c.hiClosed ? hi : hi - 1, 'de')}: ${cnt} Zahlen. Bei < gehört die Grenze nicht dazu.`,
        en: `From ${numText(c.loClosed ? lo : lo + 1, 'en')} to ${numText(c.hiClosed ? hi : hi - 1, 'en')}: ${cnt} numbers. With < the boundary is not included.`,
      },
    };
  }
  if (kind === 'word') {
    const items: { s: Scenario; text: Loc }[] = [
      (() => {
        const start = pick([20, 30, 40]);
        const rate = pick([5, 6, 8]);
        const goal = pick([120, 150, 200]);
        const s: Scenario = { ...SCENARIOS.sparen, a: rate, b: start, d: goal };
        return {
          s,
          text: {
            de: `Mia hat ${start} € und spart jede Woche ${rate} €. Sie möchte ein Fahrrad für ${goal} €. Nach wie vielen Wochen reicht das Geld frühestens?`,
            en: `Mia has €${start} and saves €${rate} every week. She wants a bike for €${goal}. After how many weeks at the earliest is there enough money?`,
          },
        };
      })(),
      (() => {
        const p = pick([70, 80, 90]);
        const box = pick([20, 25, 30]);
        const max = pick([450, 630, 800]);
        const s: Scenario = { ...SCENARIOS.aufzug, a: box, b: p, d: max };
        return {
          s,
          text: {
            de: `Ein Aufzug trägt höchstens ${max} kg. Eine Person (${p} kg) lädt Kisten zu je ${box} kg ein. Wie viele Kisten darf sie höchstens mitnehmen?`,
            en: `A lift carries at most ${max} kg. A person (${p} kg) loads boxes of ${box} kg each. How many boxes can they take at most?`,
          },
        };
      })(),
      (() => {
        const base = pick([3, 5]);
        const per = pick([0.05, 0.1]);
        const flat = pick([10, 12, 15]);
        const s: Scenario = { ...SCENARIOS.handy, a: per, b: base, d: flat };
        return {
          s,
          text: {
            de: `Tarif A kostet ${base} € im Monat plus ${numText(per, 'de')} € pro Minute, die Flatrate ${flat} €. Ab wie vielen Minuten ist die Flatrate günstiger?`,
            en: `Plan A costs €${base} a month plus €${numText(per, 'en')} per minute, the flat rate €${flat}. From how many minutes is the flat rate cheaper?`,
          },
        };
      })(),
    ];
    const it = pick(items);
    const ans = scenarioAnswer(it.s);
    const fs = solve(it.s.a, it.s.b, it.s.c, it.s.d, it.s.rel);
    const fr: Rel = fs.kind === 'bound' ? fs.rel : it.s.rel;
    return {
      kind,
      text: it.text,
      answer: ans.best,
      tol: 0,
      choices: null,
      solution: {
        de: `${t('de', it.s.a, it.s.b)} ${REL_SYMBOL[it.s.rel]} ${numText(it.s.d, 'de')} ergibt x ${REL_SYMBOL[fr]} ${numText(ans.bound, 'de')}, also ${ans.side === 'min' ? 'mindestens' : 'höchstens'} ${ans.best}.`,
        en: `${t('en', it.s.a, it.s.b)} ${REL_SYMBOL[it.s.rel]} ${numText(it.s.d, 'en')} gives x ${REL_SYMBOL[fr]} ${numText(ans.bound, 'en')}, so ${ans.side === 'min' ? 'at least' : 'at most'} ${ans.best}.`,
      },
    };
  }
  // line: Zahlenstrahl lesen
  const v = int(-5, 5);
  const rel = pick(RELS);
  const left = rel === 'lt' || rel === 'le';
  const closed = rel === 'le' || rel === 'ge';
  return {
    kind: 'line',
    text: {
      de: `Am Zahlenstrahl ist bei ${numText(v, 'de')} ein ${closed ? 'gefüllter' : 'offener'} Kreis, der Strahl zeigt nach ${left ? 'links' : 'rechts'}. Welche Lösungsmenge ist das?`,
      en: `On the number line there is a ${closed ? 'filled' : 'hollow'} circle at ${numText(v, 'en')} and the ray points to the ${left ? 'left' : 'right'}. Which solution set is it?`,
    },
    answer: RELS.indexOf(rel) + 1,
    tol: 0,
    choices: RELS.map((q) => ({
      de: `x ${REL_SYMBOL[q]} ${numText(v, 'de')}`,
      en: `x ${REL_SYMBOL[q]} ${numText(v, 'en')}`,
    })),
    solution: {
      de: `x ${REL_SYMBOL[rel]} ${numText(v, 'de')}: ${closed ? 'gefüllt heißt, die Grenze gehört dazu' : 'offen heißt, die Grenze gehört nicht dazu'}.`,
      en: `x ${REL_SYMBOL[rel]} ${numText(v, 'en')}: ${closed ? 'filled means the boundary is included' : 'hollow means the boundary is not included'}.`,
    },
  };
}

/** Antwort prüfen: null bei unlesbarer Eingabe. Erlaubt Minus, Komma und „x <“ davor. */
export function checkTask(task: IneqTask, input: string): boolean | null {
  const s = input
    .trim()
    .replace(/\s/g, '')
    .replace(/^x?[<>≤≥=]+/, '')
    .replace('−', '-')
    .replace(',', '.')
    .replace(/[a-zA-Z€]+$/, '');
  if (!/^-?\d*\.?\d+$/.test(s)) return null;
  const x = Number(s);
  return Math.abs(x - task.answer) <= task.tol + 1e-9;
}
