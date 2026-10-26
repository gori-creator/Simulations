import type { Subject } from '../types';
import type { CurriculumUnit } from './types';

/**
 * Lernbereiche einer Stufe, die mehrere Jahrgänge umfasst (z. B. Nordrhein-Westfalen:
 * Erprobungsstufe 5/6, Physik 7–10, Qualifikationsphase 12/13), für einen Jahrgang.
 *
 * Die Lernbereiche stehen bei allen Jahrgängen der Stufe gleich; eine Simulation
 * bleibt nur dort stehen, wo der Jahrgang in ihre Klassenstufen fällt (wie bei
 * den Doppeljahrgangsstufen in Hessen). Unbekannte oder nicht fertige IDs und
 * Simulationen aus einem anderen Fach brechen den Build ab.
 */
export function unitsForGrade(subject: Subject, grade: number, units: CurriculumUnit[]): CurriculumUnit[] {
  const sims = new Map(
    subject.areas.flatMap((area) => area.topics.flatMap((topic) => topic.simulations.map((sim) => [sim.id, sim] as const))),
  );
  const filter = (unit: CurriculumUnit): CurriculumUnit => {
    const { simulations, parts, ...rest } = unit;
    const result: CurriculumUnit = { ...rest };
    if (parts) result.parts = parts.map(filter);
    const kept = (simulations ?? []).filter((id) => {
      const sim = sims.get(id);
      if (!sim || sim.status !== 'ready') throw new Error(`${subject.id}: keine fertige Simulation „${id}“ (Lernbereich ${unit.code})`);
      return sim.grades[0] <= grade && grade <= sim.grades[1];
    });
    if (kept.length > 0) result.simulations = kept;
    return result;
  };
  return units.map(filter);
}
