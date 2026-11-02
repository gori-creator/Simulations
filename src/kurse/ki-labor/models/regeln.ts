import type { Localized } from '../../../i18n/config';

/**
 * Lektion „Wissen in Regeln“: ein kleines Expertensystem nach dem Vorbild
 * des Zoo-Beispiels von Patrick Winston. Fakten + Wenn-dann-Regeln,
 * Vorwärtsverkettung: Immer die erste Regel feuern, deren Bedingungen alle
 * bekannt sind und deren Folgerung noch neu ist – bis nichts mehr geht.
 */
export type Fact = string;

export interface Rule {
  id: string;
  if: Fact[];
  then: Fact;
}

export const FACT_NAMES: Record<Fact, Localized> = {
  fell: { de: 'hat Fell', en: 'has fur' },
  milch: { de: 'gibt Milch', en: 'gives milk' },
  federn: { de: 'hat Federn', en: 'has feathers' },
  fliegt: { de: 'fliegt', en: 'flies' },
  'fliegt-nicht': { de: 'fliegt nicht', en: 'does not fly' },
  eier: { de: 'legt Eier', en: 'lays eggs' },
  fleisch: { de: 'frisst Fleisch', en: 'eats meat' },
  krallen: { de: 'hat Krallen', en: 'has claws' },
  zaehne: { de: 'spitze Zähne', en: 'pointed teeth' },
  hufe: { de: 'hat Hufe', en: 'has hooves' },
  gelbbraun: { de: 'gelbbraun', en: 'tawny' },
  flecken: { de: 'dunkle Flecken', en: 'dark spots' },
  streifen: { de: 'schwarze Streifen', en: 'black stripes' },
  beine: { de: 'lange Beine', en: 'long legs' },
  hals: { de: 'langer Hals', en: 'long neck' },
  schwimmt: { de: 'schwimmt', en: 'swims' },
  schwarzweiss: { de: 'schwarz-weiß', en: 'black and white' },
  weit: { de: 'fliegt sehr weit', en: 'flies very far' },
  saeugetier: { de: 'Säugetier', en: 'mammal' },
  vogel: { de: 'Vogel', en: 'bird' },
  raubtier: { de: 'Raubtier', en: 'carnivore' },
  huftier: { de: 'Huftier', en: 'ungulate' },
  gepard: { de: 'Gepard', en: 'cheetah' },
  tiger: { de: 'Tiger', en: 'tiger' },
  giraffe: { de: 'Giraffe', en: 'giraffe' },
  zebra: { de: 'Zebra', en: 'zebra' },
  pinguin: { de: 'Pinguin', en: 'penguin' },
  albatros: { de: 'Albatros', en: 'albatross' },
  strauss: { de: 'Strauß', en: 'ostrich' },
};

/** Tiere, die das System erkennen kann (Endergebnisse). */
export const ANIMALS: Fact[] = ['gepard', 'tiger', 'giraffe', 'zebra', 'pinguin', 'albatros', 'strauss'];

export const RULES: Rule[] = [
  { id: 'R1', if: ['fell'], then: 'saeugetier' },
  { id: 'R2', if: ['milch'], then: 'saeugetier' },
  { id: 'R3', if: ['federn'], then: 'vogel' },
  { id: 'R4', if: ['fliegt', 'eier'], then: 'vogel' },
  { id: 'R5', if: ['saeugetier', 'fleisch'], then: 'raubtier' },
  { id: 'R6', if: ['saeugetier', 'zaehne', 'krallen'], then: 'raubtier' },
  { id: 'R7', if: ['saeugetier', 'hufe'], then: 'huftier' },
  { id: 'R8', if: ['raubtier', 'gelbbraun', 'flecken'], then: 'gepard' },
  { id: 'R9', if: ['raubtier', 'gelbbraun', 'streifen'], then: 'tiger' },
  { id: 'R10', if: ['huftier', 'hals', 'beine', 'flecken'], then: 'giraffe' },
  { id: 'R11', if: ['huftier', 'streifen'], then: 'zebra' },
  { id: 'R12', if: ['vogel', 'fliegt-nicht', 'schwimmt', 'schwarzweiss'], then: 'pinguin' },
  { id: 'R13', if: ['vogel', 'weit'], then: 'albatros' },
];

export interface Case {
  id: string;
  icon: string;
  facts: Fact[];
  /** Richtiges Ergebnis. */
  answer: Fact;
}

export const CASES: Case[] = [
  { id: 'gepard', icon: '🐆', facts: ['fell', 'fleisch', 'gelbbraun', 'flecken'], answer: 'gepard' },
  { id: 'zebra', icon: '🦓', facts: ['milch', 'hufe', 'streifen'], answer: 'zebra' },
  { id: 'giraffe', icon: '🦒', facts: ['fell', 'hufe', 'hals', 'beine', 'flecken'], answer: 'giraffe' },
  { id: 'strauss', icon: '🐦', facts: ['federn', 'fliegt-nicht', 'beine', 'hals', 'schwarzweiss', 'eier'], answer: 'strauss' },
  { id: 'pinguin', icon: '🐧', facts: ['federn', 'fliegt-nicht', 'schwimmt', 'schwarzweiss', 'eier'], answer: 'pinguin' },
  { id: 'albatros', icon: '🕊️', facts: ['federn', 'fliegt', 'eier', 'weit'], answer: 'albatros' },
];

export interface Firing {
  rule: Rule;
  fact: Fact;
}

/** Ein Schritt Vorwärtsverkettung: erste passende Regel mit neuer Folgerung (oder null). */
export function step(known: ReadonlySet<Fact>, rules: readonly Rule[] = RULES): Firing | null {
  for (const rule of rules) {
    if (known.has(rule.then)) continue;
    if (rule.if.every((f) => known.has(f))) return { rule, fact: rule.then };
  }
  return null;
}

/** Vorwärtsverkettung bis zum Ende: alle Fakten und die Kette der Begründungen. */
export function infer(facts: readonly Fact[], rules: readonly Rule[] = RULES): { known: Set<Fact>; trace: Firing[] } {
  const known = new Set(facts);
  const trace: Firing[] = [];
  for (let guard = 0; guard < 100; guard++) {
    const fired = step(known, rules);
    if (!fired) break;
    known.add(fired.fact);
    trace.push(fired);
  }
  return { known, trace };
}

/** Welche Tiere das System für diesen Fall folgert. */
export function conclusions(facts: readonly Fact[], rules: readonly Rule[] = RULES): Fact[] {
  const { known } = infer(facts, rules);
  return ANIMALS.filter((a) => known.has(a));
}

export interface RuleCheck {
  case: Case;
  result: Fact[];
  ok: boolean;
}

/** Neue Regel für den Strauß prüfen: Jeder Fall muss genau sein richtiges Tier ergeben. */
export function checkStraussRule(conditions: readonly Fact[]): RuleCheck[] {
  const rules = [...RULES, { id: 'R14', if: [...conditions], then: 'strauss' }];
  return CASES.map((c) => {
    const result = conclusions(c.facts, rules);
    return { case: c, result, ok: result.length === 1 && result[0] === c.answer };
  });
}

/** Bedingungen, aus denen man die Strauß-Regel bauen darf. */
export const BUILDER_FACTS: Fact[] = ['vogel', 'saeugetier', 'federn', 'fliegt-nicht', 'schwimmt', 'schwarzweiss', 'beine', 'hals', 'eier', 'hufe'];
