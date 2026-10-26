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
  /**
   * Schlüssel der `spoiler`-Ergebnisse, die gerade angezeigt werden (also nicht
   * per `ctx.readout(key, null)` ausgeblendet sind). Nur sie lassen sich
   * aufdecken; ohne Angabe zählt nur, ob überhaupt etwas aufgedeckt wurde.
   */
  spoilers?: readonly string[];
}

/**
 * Sind die Lösungen im Bild zu verdecken? Ja, solange der Schalter
 * `resultsParam` aus ist oder der Aufgabenmodus (`_hide=1`) aktiv ist und noch
 * mindestens ein angezeigtes `spoiler`-Ergebnis verdeckt ist. Erst wenn alle
 * aufgedeckt sind, zeigt das Bild alle Werte. Ein einzelnes Aufdecken verrät
 * also nicht die übrigen Lösungen; dafür gibt es `isReadoutHidden` (`ctx.isHidden`).
 * Solange nichts aufgedeckt wurde, bleibt es verdeckt (auch wenn gerade kein
 * Spoiler angezeigt wird).
 */
export function isTaskHidden(state: TaskModeState): boolean {
  if (state.resultsOff) return true;
  if (!state.hideFlag) return false;
  if (state.revealed.size === 0) return true;
  return (state.spoilers ?? []).some((key) => !state.revealed.has(key));
}

/** Ist ein einzelnes `spoiler`-Ergebnis verdeckt? */
export function isReadoutHidden(state: TaskModeState, key: string): boolean {
  return state.resultsOff || (state.hideFlag && !state.revealed.has(key));
}
