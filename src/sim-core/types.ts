import type { Lang, Localized } from '../i18n/config';
import type { Clock } from './clock';
import type { Formatter } from './format';
import type { ImageStore } from './images';
import type { KeyTarget } from './key-targets';
import type { Theme } from './theme';

/* ------------------------------------------------------------------ */
/* Parameter                                                           */
/* ------------------------------------------------------------------ */

export type ParamValue = number | boolean | string;
export type ParamValues = Record<string, ParamValue>;

/** Funktionstyp, der sich wie eine Methode verhält (bivariant), damit genau typisierte Definitionen zuweisbar bleiben. */
type Bivariant<A, R> = { bivarianceHack(arg: A): R }['bivarianceHack'];

/**
 * Fester Text oder Text abhängig von den aktuellen Parameterwerten,
 * z. B. `(v) => (v.mode === 'test' ? L('…', '…') : L('…', '…'))`.
 * Gibt die Funktion `null` zurück, wird der Text ausgeblendet.
 */
export type DynamicText<V = ParamValues> = Localized | Bivariant<Readonly<V>, Localized | null>;

interface BaseParam<K extends string> {
  key: K;
  label: Localized;
  /**
   * Kurzer Erklärtext unter dem Regler. Fester Text oder Funktion der aktuellen
   * Werte (`(v) => L(…)`, `null` blendet ihn aus); der Host aktualisiert ihn bei jeder Änderung.
   */
  help?: DynamicText;
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
  /**
   * Zusatzangabe hinter der Beschriftung in Klammern, z. B. `L('T½ = 55,6 s', 'T½ = 55.6 s')`
   * → „Rn-220 (T½ = 55,6 s)“. Im Aufgabenmodus (`ctx.hidden`) wird sie weggelassen.
   */
  detail?: Localized;
}

export interface ChoiceParam<K extends string = string, V extends string = string> extends BaseParam<K> {
  type: 'choice';
  options: readonly ChoiceOption<V>[];
  default: V;
}

/**
 * Freier Text (z. B. ein Term wie „3 · (x + 2)²“). Wird wie die anderen
 * Parameter in der Adresse gespeichert; die Simulation prüft den Inhalt selbst.
 */
export interface TextParam<K extends string = string> extends BaseParam<K> {
  type: 'text';
  default: string;
  /** Höchstlänge in Zeichen (Standard: 80). */
  maxLength?: number;
  /** Platzhalter im leeren Eingabefeld. */
  placeholder?: Localized;
}

export type ParamDef = NumberParam | BooleanParam | ChoiceParam | TextParam;

type ValueOf<D> = D extends { type: 'number' }
  ? number
  : D extends { type: 'boolean' }
    ? boolean
    : D extends { type: 'text' }
      ? string
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

/** Knopf für eine Aktion der Simulation (z. B. „Würfeln“, „Tür öffnen“). */
export interface ActionDef {
  id: string;
  label: Localized;
  /** Hervorgehobener Knopf. */
  primary?: boolean;
  /** Nur anzeigen, wenn die Bedingung erfüllt ist (z. B. abhängig vom Modus). */
  visibleIf?: (values: ParamValues) => boolean;
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
  /** Optionale Bilder aus `images` (siehe src/assets/sims/). */
  readonly images: ImageStore;
  /**
   * Aufgabenmodus: `true`, solange Lösungen verdeckt sein sollen – also bei
   * geteiltem Link mit „Ergebnisse verdecken“ (`_hide=1`), solange noch
   * mindestens ein angezeigtes `spoiler`-Ergebnis verdeckt ist (erst wenn alle
   * aufgedeckt sind, wird es `false`), oder solange der Schalter `resultsParam`
   * aus ist. Für einzelne Werte im Bild `isHidden(key)` verwenden.
   * Damit lassen sich Etiketten im Bild gezielt ausblenden. Bei einem Wechsel
   * zeichnet der Host neu und ruft `hiddenChange` auf.
   */
  readonly hidden: boolean;
  /** Ist das `spoiler`-Ergebnis `key` gerade verdeckt (für feinere Steuerung als `hidden`)? */
  isHidden(key: string): boolean;
  /**
   * Antippbare Objekte für die Tastatur melden (optional). Die Bühne wird dann
   * per Tab erreichbar, Pfeiltasten wählen, Enter/Leertaste ruft `activate` auf.
   * Darf bei jeder Änderung (auch in `render`) neu aufgerufen werden; die
   * Auswahl bleibt über die `id` erhalten. Leere Liste schaltet es ab.
   */
  setKeyTargets(targets: readonly KeyTarget[]): void;
  /** ID des per Tastatur ausgewählten Objekts, solange die Bühne den Fokus hat (sonst `null`). */
  readonly keyFocus: string | null;
  /** Parameter ändern (z. B. beim Ziehen eines Punktes). Werte werden auf min/max/step gerundet. */
  set(values: Partial<V>): void;
  /** Ein Ergebnis anzeigen oder (mit `null`) ausblenden. */
  readout(key: string, value: ReadoutValue): void;
  /**
   * Text für Bildschirmleser ansagen (höflich, unsichtbar), z. B. eine Meldung,
   * die nur auf der Zeichenfläche steht („Hinter Tür 3 steht eine Ziege …“).
   * Geänderte Ergebnisse sagt der Host nach Eingaben schon selbst an.
   */
  announce(message: string): void;
  /** Simulationseigener Text aus `strings`. */
  t(key: string): string;
  /** Aktions-Knopf aktivieren/deaktivieren oder umbenennen. */
  setAction(id: string, state: { enabled?: boolean; label?: string }): void;
  /** Neu zeichnen (wird zusammengefasst, höchstens einmal pro Frame). */
  requestRender(): void;
}

/**
 * Woher eine Änderung kommt:
 * - `init`: Start der Simulation (Werte ggf. aus einem geteilten Link)
 * - `input`: die Person hat einen Regler/Schalter bedient
 * - `replace`: Beispiel, Zurücksetzen oder Link im Lernmaterial (vollständiger Zustand)
 * - `sim`: die Simulation selbst hat `ctx.set` aufgerufen (z. B. beim Ziehen)
 *
 * Abgeleitete Werte (z. B. beim Umschalten einer Darstellungsform) nur bei
 * `input` umrechnen – sonst würden vollständig vorgegebene Zustände überschrieben.
 */
export type UpdateSource = 'init' | 'input' | 'replace' | 'sim';

export interface SimInstance {
  /** Parameter haben sich geändert (beim Start: alle Schlüssel). */
  update?(changed: ReadonlySet<string>, source: UpdateSource): void;
  /** Zeichnen. Wird nach `update`, bei Größenänderung und während der Animation aufgerufen. */
  render(): void;
  /** Animationsschritt in Sekunden (nur wenn `animated`). */
  tick?(dt: number): void;
  /** Ein Aktions-Knopf wurde gedrückt. */
  action?(id: string): void;
  /** Zeit/Animation auf den Anfang setzen. */
  resetTime?(): void;
  /** Zoom/Verschiebung der Ansicht zurücksetzen. */
  resetView?(): void;
  /** `ctx.hidden` hat sich geändert (z. B. Ergebnis aufgedeckt). Neu gezeichnet wird ohnehin. */
  hiddenChange?(hidden: boolean): void;
  destroy?(): void;
}

export interface SimulationDefinition<P extends readonly ParamDef[] = readonly ParamDef[]> {
  id: string;
  params: P;
  groups?: ParamGroup[];
  readouts?: ReadoutDef[];
  /**
   * Boolescher Parameter (z. B. `show`), der Lösungen im Bild ein- und ausblendet.
   * Ist er aus, werden auch die `spoiler`-Ergebnisse unter der Bühne verdeckt;
   * „Aufdecken“ schaltet ihn wieder ein.
   */
  resultsParam?: P[number]['key'];
  presets?: Preset<ValuesOf<P>>[];
  /** Zeigt Abspielen/Anhalten in der Werkzeugleiste. */
  animated?: boolean;
  /** Zeigt unter der Bühne den Hinweis, dass Punkte gezogen werden können. */
  dragHint?: boolean;
  /**
   * Eigener Tipp unter der Bühne, z. B. „Tippe auf ein Bild …“. Ersetzt den
   * allgemeinen Hinweis von `dragHint` und wird auch ohne `dragHint` gezeigt.
   * Auch als Funktion der aktuellen Werte möglich (`(v) => L(…)`, z. B. ein Tipp
   * je Modus); der Host aktualisiert ihn bei jeder Änderung. Gibt sie `null`
   * zurück, erscheint der allgemeine Hinweis von `dragHint` bzw. gar keiner.
   */
  hint?: DynamicText<ValuesOf<P>>;
  layout?: StageLayout;
  /** Zusätzliche Texte der Simulation, abrufbar über `ctx.t(key)`. */
  strings?: Localized<Record<string, string>>;
  /** Knöpfe unter der Bühne. */
  actions?: ActionDef[];
  /** Optionale Bilder: Schlüssel → Dateiname in src/assets/sims/<id>/ (Liste in docs/BILDER.md). */
  images?: Record<string, string>;
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
