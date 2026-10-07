import type { Lang, Localized } from '../i18n/config';
import type { Clock } from './clock';
import type { Formatter } from './format';
import type { Theme } from './theme';

/* ------------------------------------------------------------------ */
/* Parameter                                                           */
/* ------------------------------------------------------------------ */

export type ParamValue = number | boolean | string;
export type ParamValues = Record<string, ParamValue>;

interface BaseParam<K extends string> {
  key: K;
  label: Localized;
  /** Kurzer Erklärtext unter dem Regler. */
  help?: Localized;
  /** ID einer Gruppe aus `SimulationDefinition.groups`. */
  group?: string;
  /** Nur anzeigen (und in Links speichern), wenn die Bedingung erfüllt ist. */
  visibleIf?: (values: ParamValues) => boolean;
}

export interface NumberParam<K extends string = string> extends BaseParam<K> {
  type: 'number';
  min: number;
  max: number;
  step: number;
  default: number;
  /** Einheit hinter dem Wert, z. B. "°" oder "m/s". */
  unit?: string;
  /**
   * Eigene Anzeige des Werts (z. B. Vielfache von π). Ist sie gesetzt, wird
   * statt eines Eingabefelds nur der formatierte Wert angezeigt.
   */
  display?: (value: number, lang: Lang) => string;
}

export interface BooleanParam<K extends string = string> extends BaseParam<K> {
  type: 'boolean';
  default: boolean;
}

export interface ChoiceOption<V extends string = string> {
  value: V;
  label: Localized;
}

export interface ChoiceParam<K extends string = string, V extends string = string> extends BaseParam<K> {
  type: 'choice';
  options: readonly ChoiceOption<V>[];
  default: V;
}

export type ParamDef = NumberParam | BooleanParam | ChoiceParam;

type ValueOf<D> = D extends { type: 'number' }
  ? number
  : D extends { type: 'boolean' }
    ? boolean
    : D extends ChoiceParam<string, infer V>
      ? V
      : never;

/** Leitet aus einer Parameterliste den Typ der Werte ab, z. B. `{ m: number; showGrid: boolean }`. */
export type ValuesOf<P extends readonly ParamDef[]> = { [D in P[number] as D['key']]: ValueOf<D> };

/* ------------------------------------------------------------------ */
/* Ergebnisse / Messwerte                                              */
/* ------------------------------------------------------------------ */

export interface ReadoutDef {
  key: string;
  label: Localized;
  /** Wird beim Teilen mit „Ergebnisse verdecken“ ausgeblendet (Aufgabenmodus). */
  spoiler?: boolean;
}

/** Text (wird escaped) oder vertrauenswürdiges HTML aus dem Simulationscode. `null` blendet die Zeile aus. */
export type ReadoutValue = string | { html: string } | null;

/* ------------------------------------------------------------------ */
/* Simulation                                                          */
/* ------------------------------------------------------------------ */

export interface Preset<V> {
  id: string;
  label: Localized;
  /** Werte, die von den Standardwerten abweichen. */
  values: Partial<V>;
}

export interface ParamGroup {
  id: string;
  label: Localized;
}

export interface StageLayout {
  /** Seitenverhältnis Breite/Höhe der Bühne (Standard 16/10). */
  aspect?: number;
  /** Seitenverhältnis auf schmalen Bildschirmen (< 640 px). */
  aspectNarrow?: number;
}

export interface SimContext<V> {
  /** Container, in den die Simulation zeichnet. */
  readonly stage: HTMLElement;
  readonly lang: Lang;
  /** Aktuelle Parameterwerte (nur lesen – Änderungen über `set`). */
  readonly params: Readonly<V>;
  /** Sind die Regler gesperrt (geteilter Link mit „Regler sperren“)? */
  readonly locked: boolean;
  /** Aktuelles Farbschema (hell/dunkel). */
  readonly theme: Theme;
  /** Zahlenformatierung passend zur Sprache. */
  readonly fmt: Formatter;
  /** Uhr für animierte Simulationen. */
  readonly clock: Clock;
  /** Parameter ändern (z. B. beim Ziehen eines Punktes). Werte werden auf min/max/step gerundet. */
  set(values: Partial<V>): void;
  /** Ein Ergebnis anzeigen oder (mit `null`) ausblenden. */
  readout(key: string, value: ReadoutValue): void;
  /** Simulationseigener Text aus `strings`. */
  t(key: string): string;
  /** Neu zeichnen (wird zusammengefasst, höchstens einmal pro Frame). */
  requestRender(): void;
}

export interface SimInstance {
  /** Parameter haben sich geändert (beim Start: alle Schlüssel). */
  update?(changed: ReadonlySet<string>): void;
  /** Zeichnen. Wird nach `update`, bei Größenänderung und während der Animation aufgerufen. */
  render(): void;
  /** Animationsschritt in Sekunden (nur wenn `animated`). */
  tick?(dt: number): void;
  /** Zeit/Animation auf den Anfang setzen. */
  resetTime?(): void;
  /** Zoom/Verschiebung der Ansicht zurücksetzen. */
  resetView?(): void;
  destroy?(): void;
}

export interface SimulationDefinition<P extends readonly ParamDef[] = readonly ParamDef[]> {
  id: string;
  params: P;
  groups?: ParamGroup[];
  readouts?: ReadoutDef[];
  presets?: Preset<ValuesOf<P>>[];
  /** Zeigt Abspielen/Anhalten in der Werkzeugleiste. */
  animated?: boolean;
  /** Zeigt unter der Bühne den Hinweis, dass Punkte gezogen werden können. */
  dragHint?: boolean;
  layout?: StageLayout;
  /** Zusätzliche Texte der Simulation, abrufbar über `ctx.t(key)`. */
  strings?: Localized<Record<string, string>>;
  mount(ctx: SimContext<ValuesOf<P>>): SimInstance;
}

/**
 * Definiert eine Simulation. Die Funktion tut zur Laufzeit nichts, sorgt aber
 * dafür, dass `ctx.params` und `presets` exakt typisiert sind.
 */
export function defineSimulation<const P extends readonly ParamDef[]>(
  definition: SimulationDefinition<P>,
): SimulationDefinition<P> {
  return definition;
}
