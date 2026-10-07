import { chemie } from './chemie';
import { mathematik } from './mathematik';
import { physik } from './physik';
import type { Area, GradeSpan, SimulationEntry, Subject, SubjectId, Topic } from './types';

export type * from './types';

/** Reihenfolge der Fächer in Navigation und Übersichten. */
export const SUBJECTS: Subject[] = [mathematik, physik, chemie];

export function getSubject(id: SubjectId): Subject {
  const subject = SUBJECTS.find((s) => s.id === id);
  if (!subject) throw new Error(`Unbekanntes Fach: ${id}`);
  return subject;
}

export function getArea(subjectId: SubjectId, areaId: string): Area {
  const area = getSubject(subjectId).areas.find((a) => a.id === areaId);
  if (!area) throw new Error(`Unbekannter Bereich: ${subjectId}/${areaId}`);
  return area;
}

export function getTopic(subjectId: SubjectId, areaId: string, topicId: string): Topic {
  const topic = getArea(subjectId, areaId).topics.find((t) => t.id === topicId);
  if (!topic) throw new Error(`Unbekanntes Thema: ${subjectId}/${areaId}/${topicId}`);
  return topic;
}

let cache: SimulationEntry[] | undefined;

/** Alle Simulationen (fertig und geplant) in Lehrplan-Reihenfolge. */
export function allSimulations(): SimulationEntry[] {
  cache ??= SUBJECTS.flatMap((subject) =>
    subject.areas.flatMap((area) =>
      area.topics.flatMap((topic) =>
        topic.simulations.map((sim) => ({ ...sim, subject: subject.id, area: area.id, topic: topic.id })),
      ),
    ),
  );
  return cache;
}

export function readySimulations(): SimulationEntry[] {
  return allSimulations().filter((s) => s.status === 'ready');
}

export function getSimulation(id: string): SimulationEntry {
  const sim = allSimulations().find((s) => s.id === id);
  if (!sim) throw new Error(`Unbekannte Simulation: ${id}`);
  return sim;
}

export function simulationsOf(filter: { subject?: SubjectId; area?: string; topic?: string }): SimulationEntry[] {
  return allSimulations().filter(
    (s) =>
      (!filter.subject || s.subject === filter.subject) &&
      (!filter.area || s.area === filter.area) &&
      (!filter.topic || s.topic === filter.topic),
  );
}

/** Fortschritt (fertig / gesamt) für Fortschrittsanzeigen. */
export function progressOf(sims: SimulationEntry[]): { ready: number; total: number } {
  return { ready: sims.filter((s) => s.status === 'ready').length, total: sims.length };
}

/** Klassenstufen-Bänder für Filter. */
export const GRADE_BANDS = [
  { id: '5-6', span: [5, 6] },
  { id: '7-8', span: [7, 8] },
  { id: '9-10', span: [9, 10] },
  { id: '11-13', span: [11, 13] },
  { id: 'uni', span: [14, 14] },
] as const satisfies readonly { id: string; span: GradeSpan }[];

export type GradeBandId = (typeof GRADE_BANDS)[number]['id'];

/** Überschneiden sich zwei Klassenstufen-Bereiche? (`uni` zählt als Stufe 14.) */
export function gradesOverlap(a: GradeSpan, b: GradeSpan, aUni = false): boolean {
  const aTo = aUni ? Math.max(a[1], 14) : a[1];
  return a[0] <= b[1] && b[0] <= aTo;
}
