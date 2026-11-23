/**
 * Reihenfolge auf der Startseite: Wer zufällig hineinklickt, soll zuerst auf
 * die eindrucksvollsten Simulationen stoßen – viel Bewegung, echte Experimente,
 * überraschende Ergebnisse. Die Liste ist von Hand gewählt (Mathematik und
 * Physik im Wechsel) und bestimmt
 * - die Reihenfolge im Karussell „Entdecken“ (HomeCarousel.astro),
 * - die Reihenfolge der Themenreihen und der Karten in jeder Reihe (HomeCatalog.astro).
 * Nicht genannte Simulationen folgen in der Reihenfolge des Lehrplans.
 * Die Bereichsseiten bleiben nach Klassenstufe geordnet.
 * tests/showcase.test.ts prüft, dass jede ID fertig ist und ein Vorschaubild hat.
 */
export const SHOWCASE_IDS = [
  'energieerhaltung',
  'zehnerpotenzen',
  'doppelspalt',
  'galtonbrett',
  'planetenbahnen',
  'fourier-reihen',
  'magnete',
  'rotationskoerper',
  'hr-diagramm',
  'ziegenproblem',
  'brechung',
  'matrix-abbildungen',
  'teilchenmodell',
  'monte-carlo-pi',
  'hubble',
  'koordinaten-3d',
  'schiefer-wurf',
  'kegelschnitte',
  'stehende-wellen',
  'aenderungsrate',
  'dichte-auftrieb',
  'geburtstagsproblem',
  'zeitdilatation',
  'taylor-polynome',
  'linienspektren',
  'pyramide-kegel-kugel',
  'fadenpendel',
  'massstab',
  'radioaktiver-zerfall',
  'richtungsfeld',
  'gasgesetze',
  'komplexe-zahlen',
  'energieversorgung',
  'extremwertprobleme',
  'doppler-effekt',
  'newton-verfahren',
  'schall',
  'sinussatz-kosinussatz',
  'lorentzkraft',
  'thales',
  'photoeffekt',
  'vektoren-3d',
  'diode-transistor',
  'normalverteilung',
  'interferenz',
  'einheiten',
  'linsen',
  'wachstumsmodelle',
  'elektronenbeugung',
  'besondere-linien',
  'magnetfeld-spule',
  'lineare-funktion',
] as const;

const RANK = new Map<string, number>(SHOWCASE_IDS.map((id, i) => [id, i]));

/** Platz in der Liste (nicht genannte: unendlich). */
export function showcaseRank(id: string): number {
  return RANK.get(id) ?? Number.POSITIVE_INFINITY;
}

/** Stabil sortiert: genannte nach ihrem Platz zuerst, die übrigen in der bisherigen Reihenfolge. */
export function byShowcase<T extends { id: string }>(list: readonly T[]): T[] {
  return list
    .map((item, i) => ({ item, i, r: showcaseRank(item.id) }))
    .sort((a, b) => (a.r === b.r ? a.i - b.i : a.r - b.r))
    .map((x) => x.item);
}
