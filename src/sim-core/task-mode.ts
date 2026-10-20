/**
 * Aufgabenmodus („Ergebnisse verdecken“): Rechenregeln ohne DOM, damit sie
 * sich testen lassen. Der Host (host.ts) verwendet sie für die Ergebnisliste
 * und für `ctx.hidden`/`ctx.isHidden()`.
 */
export interface TaskModeState {
  /** Geteilter Link mit `_hide=1` (bzw. Link im Lernmaterial). */
  hideFlag: boolean;
  /** Der Schalter `resultsParam` der Simulation steht auf „aus“. */
  resultsOff: boolean;
  /** Schlüssel der Ergebnisse, die mit „Aufdecken“ sichtbar gemacht wurden. */
  revealed: ReadonlySet<string>;
}

/**
 * Sind die Lösungen im Bild zu verdecken? Ja, solange der Schalter
 * `resultsParam` aus ist oder der Aufgabenmodus aktiv ist und noch kein
 * Ergebnis aufgedeckt wurde. Wer ein Ergebnis aufdeckt, will die Lösung sehen.
 */
export function isTaskHidden(state: TaskModeState): boolean {
  return state.resultsOff || (state.hideFlag && state.revealed.size === 0);
}

/** Ist ein einzelnes `spoiler`-Ergebnis verdeckt? */
export function isReadoutHidden(state: TaskModeState, key: string): boolean {
  return state.resultsOff || (state.hideFlag && !state.revealed.has(key));
}
