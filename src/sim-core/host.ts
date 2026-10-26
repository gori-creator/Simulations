import { isLang, type Lang } from '../i18n/config';
import { t } from '../i18n/utils';
import { registry } from '../simulations/registry';
import { Clock } from './clock';
import { Controls } from './controls';
import { exportStagePng } from './export';
import { bindUnitsHtml, Formatter, withUnit } from './format';
import { ImageStore } from './images';
import { KeyTargetLayer } from './key-targets';
import { defaultValues, dragHintKey, resolveHint, sanitize, stepDecimals, valuesEqual } from './params';
import { hatsInHtml, plainSubText, setSubLabel, setSubReadout } from './rich-label';
import { hidesSpoilerControls, isReadoutHidden, isReadoutTaskHidden, isTaskHidden, spoilerChanges, type TaskModeState } from './task-mode';
import { onThemeChange, readTheme, type Theme } from './theme';
import type {
  ParamDef,
  ParamValue,
  ParamValues,
  ReadoutValue,
  SimContext,
  SimInstance,
  SimulationDefinition,
  UpdateSource,
} from './types';
import { decodeState, encodeState, type ShareFlags } from './url-state';

/**
 * Verbindet eine Simulation mit der Seite: Regler, Ergebnisse, Beispiele,
 * Abspielen, Teilen (Link + QR-Code), Vollbild, Bildexport und die
 * Speicherung des Zustands in der Adresse.
 *
 * Die zugehörige HTML-Struktur kommt aus components/SimulationShell.astro.
 */
export async function mountSimulation(root: HTMLElement): Promise<void> {
  const id = root.dataset.simId ?? '';
  const lang: Lang = isLang(root.dataset.lang) ? root.dataset.lang : 'de';
  const status = root.querySelector<HTMLElement>('[data-sim-status]');
  try {
    const loader = registry[id];
    if (!loader) throw new Error(`Keine Umsetzung für Simulation "${id}" registriert.`);
    const definition = await loader();
    new SimulationHost(root, definition, lang).start();
    status?.remove();
  } catch (error) {
    console.error(error);
    if (status) {
      status.textContent = t(lang, 'sim.loadError');
      status.classList.add('sim__status--error');
    }
  }
}

const SOURCE_RANK: Record<UpdateSource, number> = { sim: 0, input: 1, replace: 2, init: 3 };

/** Bei gemischten Änderungen in einem Durchlauf zählt die „stärkere“ Herkunft. */
function strongerSource(a: UpdateSource, b: UpdateSource): UpdateSource {
  return SOURCE_RANK[a] >= SOURCE_RANK[b] ? a : b;
}

interface ReadoutRow {
  root: HTMLElement;
  value: HTMLElement;
  reveal?: HTMLButtonElement;
  last?: string;
  spoiler: boolean;
  /** `ignoresResultsParam` aus der Definition: Schalter `resultsParam` verdeckt es nicht. */
  ignoresResultsParam: boolean;
}

const SUPERSCRIPT: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '−': '⁻', '-': '⁻', '+': '⁺' };

/**
 * Text für die Ansage: ohne `aria-hidden`-Teile, Hochzahlen als ², ³ … (sonst
 * „x2“), Indizes abgesetzt, Leerraum zusammengefasst. Tabellen werden nicht
 * vorgelesen (leer), dafür sind sie zu lang.
 */
function spokenText(element: HTMLElement, lang: Lang): string {
  if (element.querySelector('table')) return '';
  const copy = element.cloneNode(true) as HTMLElement;
  for (const hidden of copy.querySelectorAll('[aria-hidden="true"]')) hidden.remove();
  for (const sup of copy.querySelectorAll('sup')) {
    const raw = sup.textContent ?? '';
    const mapped = [...raw].map((ch) => SUPERSCRIPT[ch]);
    sup.replaceWith(mapped.every(Boolean) ? mapped.join('') : ` ${lang === 'de' ? 'hoch' : 'to the power of'} ${raw} `);
  }
  for (const sub of copy.querySelectorAll('sub')) sub.replaceWith(` ${sub.textContent ?? ''} `);
  return (copy.textContent ?? '').replace(/\s+/g, ' ').trim();
}

class SimulationHost {
  private readonly defs: readonly ParamDef[];
  private readonly defsByKey: Map<string, ParamDef>;
  private values: ParamValues;
  private flags: ShareFlags;
  private locked: boolean;
  private theme: Theme;
  private readonly fmt: Formatter;
  private readonly clock = new Clock();
  private images!: ImageStore;
  private actionButtons = new Map<string, HTMLButtonElement>();
  private readonly stage: HTMLElement;
  private instance: SimInstance | null = null;
  /** Tastaturbedienung der Zeichenfläche; entsteht erst, wenn die Simulation Objekte meldet. */
  private keyTargets: KeyTargetLayer | null = null;
  private viewKeysSet = false;
  private controls: Controls | null = null;
  private readouts = new Map<string, ReadoutRow>();
  private revealed = new Set<string>();
  /** Zuletzt an die Simulation gemeldeter Stand von `ctx.hidden`. */
  private lastHidden: boolean | null = null;
  /** Zuletzt an die Simulation gemeldeter Stand von `ctx.isHidden(key)` je `spoiler`-Ergebnis. */
  private lastSpoilerHidden = new Map<string, boolean>();
  private pending = new Set<string>();
  private pendingSource: UpdateSource = 'sim';
  private flushScheduled = false;
  private flushing = false;
  private frame = 0;
  private lastTime: number | null = null;
  private urlTimer = 0;
  /** Tipp unter der Bühne (`hint`/`dragHint`) und der allgemeine Text aus der Hülle. */
  private hintEl: HTMLElement | null = null;
  private dragHintText = '';
  private hintComposed = '';
  /** Ansage geänderter Ergebnisse für Bildschirmleser (höflich, nach Loslassen bzw. Tastatureingabe). */
  private liveEl: HTMLElement | null = null;
  private spoken = new Map<string, string>();
  private announceTimer = 0;

  constructor(
    private readonly root: HTMLElement,
    private readonly def: SimulationDefinition,
    private readonly lang: Lang,
  ) {
    this.defs = def.params;
    this.defsByKey = new Map(this.defs.map((d) => [d.key, d]));
    const state = decodeState(this.defs, location.search);
    this.values = state.values;
    this.flags = state.flags;
    this.locked = state.flags.lock;
    this.fmt = new Formatter(lang);
    this.theme = readTheme(root);
    this.stage = this.query('[data-sim-stage]');
  }

  start(): void {
    const { def, root } = this;
    if (def.layout?.aspect) root.style.setProperty('--sim-aspect', String(def.layout.aspect));
    if (def.layout?.aspectNarrow) root.style.setProperty('--sim-aspect-narrow', String(def.layout.aspectNarrow));

    this.buildControls();
    this.buildReadouts();
    this.buildPresets();
    this.bindToolbar();
    this.buildActions();
    this.bindShare();
    this.images = new ImageStore(def.id, def.images ?? {}, () => this.requestRender());
    this.bindMaterialLinks();
    this.applyLock();

    this.instance = def.mount(this.createContext());
    this.lastHidden = isTaskHidden(this.taskState());
    spoilerChanges(this.taskState(), this.spoilerKeys(), this.lastSpoilerHidden);
    this.instance.update?.(new Set(this.defs.map((d) => d.key)), 'init');
    this.controls?.sync(this.values);
    this.syncHint();
    this.requestRender();

    onThemeChange(() => {
      this.theme = readTheme(root);
      this.requestRender();
    });
    // Schriften (z. B. KaTeX_Math für Beschriftungen) laden nebenbei. Danach neu zeichnen,
    // sonst bleibt Text je nach Ladereihenfolge in der Ersatzschrift stehen.
    document.fonts?.addEventListener('loadingdone', () => this.requestRender());
    this.clock.onChange((playing) => {
      this.updatePlayButton(playing);
      this.lastTime = null;
      if (playing) this.requestRender();
    });
    this.bindAnnounce();
    root.classList.add('sim--ready');
  }

  /* ---------- Kontext für die Simulation ---------- */

  private createContext(): SimContext<ParamValues> {
    const host = this;
    const strings = this.def.strings;
    return {
      stage: this.stage,
      lang: this.lang,
      get params() {
        return host.values;
      },
      get locked() {
        return host.locked;
      },
      get theme() {
        return host.theme;
      },
      fmt: this.fmt,
      clock: this.clock,
      get images() {
        return host.images;
      },
      get hidden() {
        return isTaskHidden(host.taskState());
      },
      isHidden: (key) => isReadoutHidden(this.taskState(), key),
      get taskMode() {
        return host.flags.hide;
      },
      isHiddenByTask: (key) => isReadoutTaskHidden(this.taskState(), key),
      setKeyTargets: (targets) => {
        if (!this.keyTargets && !targets.length) return;
        this.keyLayer().setTargets(targets);
      },
      setViewKeys: (keys) => {
        // Nur die erste Ansicht (Hauptansicht) bekommt die Pfeiltasten
        if (keys && this.viewKeysSet) return;
        this.viewKeysSet = keys !== null;
        if (!this.keyTargets && !keys) return;
        this.keyLayer().setView(keys);
      },
      get keyFocus() {
        return host.keyTargets?.selectedId ?? null;
      },
      set: (values) => this.set(values, 'sim'),
      readout: (key, value) => this.readout(key, value),
      announce: (message) => this.say(message),
      t: (key) => strings?.[this.lang]?.[key] ?? strings?.de?.[key] ?? key,
      setAction: (id, state) => {
        const button = this.actionButtons.get(id);
        if (!button) return;
        if (state.enabled !== undefined) button.disabled = !state.enabled;
        if (state.label !== undefined) setSubLabel(button, state.label);
      },
      requestRender: () => this.requestRender(),
    };
  }

  private set(values: Partial<ParamValues>, source: UpdateSource): void {
    const before = this.pending.size;
    for (const [key, raw] of Object.entries(values)) {
      const def = this.defsByKey.get(key);
      if (!def || raw === undefined) continue;
      const value = sanitize(def, raw);
      if (valuesEqual(this.values[key]!, value)) continue;
      this.values[key] = value;
      this.pending.add(key);
    }
    if (this.pending.size > before) this.pendingSource = strongerSource(this.pendingSource, source);
    if (this.pending.size) this.scheduleFlush();
  }

  private replaceAll(values: ParamValues): void {
    this.set(values, 'replace');
  }

  private scheduleFlush(): void {
    if (this.flushScheduled || this.flushing) return;
    this.flushScheduled = true;
    queueMicrotask(() => this.flush());
  }

  private flush(): void {
    this.flushScheduled = false;
    this.flushing = true;
    let guard = 0;
    while (this.pending.size && guard++ < 10) {
      const changed = new Set(this.pending);
      const source = this.pendingSource;
      this.pending.clear();
      this.pendingSource = 'sim';
      this.instance?.update?.(changed, source);
    }
    this.flushing = false;
    this.applyHide();
    this.controls?.sync(this.values);
    this.syncHint();
    this.syncActions();
    this.scheduleUrlUpdate();
    this.requestRender();
  }

  /* ---------- Zeichnen und Animation ---------- */

  private requestRender(): void {
    if (this.frame) return;
    this.frame = requestAnimationFrame((now) => this.loop(now));
  }

  private loop(now: number): void {
    this.frame = 0;
    if (this.clock.playing && this.instance?.tick) {
      const dt = this.lastTime === null ? 0 : Math.min((now - this.lastTime) / 1000, 0.05);
      this.lastTime = now;
      const simDt = dt * this.clock.speed;
      this.clock.time += simDt;
      this.instance.tick(simDt);
      if (this.pending.size) this.flush();
    }
    this.instance?.render();
    if (this.clock.playing) this.requestRender();
  }

  /* ---------- Regler ---------- */

  private buildControls(): void {
    const container = this.query('[data-sim-controls]');
    this.controls = new Controls({
      container,
      lang: this.lang,
      defs: this.defs,
      groups: this.def.groups,
      idPrefix: `sim-${this.def.id}`,
      onInput: (key: string, value: ParamValue) => this.set({ [key]: value }, 'input'),
      taskHidden: isTaskHidden(this.taskState()),
      spoilerKeys: new Set(this.def.resultsParam ? [this.def.resultsParam] : []),
    });
    this.controls.setSpoilersHidden(hidesSpoilerControls(this.taskState()));
  }

  /** Regler, die die Lösung verraten (`spoiler`, Schalter `resultsParam`). */
  private isSpoilerParam(def: ParamDef): boolean {
    return !!def.spoiler || def.key === this.def.resultsParam;
  }

  private buildPresets(): void {
    const presets = this.def.presets ?? [];
    if (!presets.length) return;
    const wrap = this.query('[data-sim-presets]');
    const list = this.query('[data-sim-preset-list]');
    for (const preset of presets) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chip';
      setSubLabel(button, preset.label[this.lang]);
      button.addEventListener('click', () => {
        if (this.locked) return;
        this.replaceAll({ ...defaultValues(this.defs), ...(preset.values as ParamValues) });
      });
      list.append(button);
    }
    wrap.hidden = false;
  }

  private applyLock(): void {
    this.controls?.setDisabled(this.locked);
    this.root.classList.toggle('sim--locked', this.locked);
    const banner = this.root.querySelector<HTMLElement>('[data-sim-lock]');
    if (banner) banner.hidden = !this.locked;
    for (const chip of this.root.querySelectorAll<HTMLButtonElement>('[data-sim-preset-list] .chip')) chip.disabled = this.locked;
    this.syncHint();
    this.requestRender();
  }

  /* ---------- Ergebnisse ---------- */

  private buildReadouts(): void {
    const defs = this.def.readouts ?? [];
    if (!defs.length) return;
    const list = this.query('[data-sim-readouts]');
    for (const def of defs) {
      const row = document.createElement('div');
      row.className = 'readout';
      row.hidden = true;
      const dt = document.createElement('dt');
      setSubLabel(dt, def.label[this.lang]);
      const dd = document.createElement('dd');
      const value = document.createElement('span');
      value.className = 'readout__value';
      dd.append(value);
      const entry: ReadoutRow = { root: row, value, spoiler: !!def.spoiler, ignoresResultsParam: !!def.ignoresResultsParam };
      if (def.spoiler) {
        const reveal = document.createElement('button');
        reveal.type = 'button';
        reveal.className = 'readout__reveal';
        reveal.textContent = t(this.lang, 'sim.reveal');
        reveal.addEventListener('click', () => {
          this.revealed.add(def.key);
          const param = this.def.resultsParam;
          // Ergebnisse mit `ignoresResultsParam` lassen den Schalter, wie er ist
          if (param && this.values[param] === false && !def.ignoresResultsParam) this.set({ [param]: true }, 'input');
          this.applyHide();
        });
        dd.append(reveal);
        entry.reveal = reveal;
      }
      row.append(dt, dd);
      list.append(row);
      this.readouts.set(def.key, entry);
    }
    this.query('[data-sim-readouts-wrap]').hidden = false;
    // Unsichtbare Ansage für Bildschirmleser (die Liste selbst bleibt still, sonst redet sie beim Ziehen ständig)
    list.after(this.live());
    this.applyHide();
  }

  /**
   * Ergebnisse ansagen, die sich durch eine Eingabe geändert haben: nach dem
   * Loslassen auf der Bühne, nach Tastatureingaben (Regler, Bühne) und nach
   * Beispielen oder Aktionen – nicht während des Ziehens. Verdeckte Ergebnisse
   * (Aufgabenmodus) werden nie angesagt.
   */
  private keyLayer(): KeyTargetLayer {
    this.keyTargets ??= new KeyTargetLayer(this.stage, t(this.lang, 'sim.keyTargets'), (activated) => {
      if (activated && this.pending.size) this.flush();
      this.requestRender();
    });
    return this.keyTargets;
  }

  /** Unsichtbarer, höflicher Ansagebereich (einmal pro Simulation). */
  private live(): HTMLElement {
    if (!this.liveEl) {
      const live = document.createElement('p');
      live.className = 'visually-hidden';
      live.setAttribute('aria-live', 'polite');
      this.root.append(live);
      this.liveEl = live;
    }
    return this.liveEl;
  }

  /** Text ansagen (gleicher Text erneut: kurz leeren, damit er wieder gelesen wird). */
  private say(message: string): void {
    const live = this.live();
    if (live.textContent === message) live.textContent = '';
    window.setTimeout(() => (live.textContent = message), 30);
  }

  private bindAnnounce(): void {
    if (!this.liveEl) return;
    const later = () => this.scheduleAnnounce();
    const stage = this.root.querySelector<HTMLElement>('[data-sim-stage]');
    stage?.addEventListener('pointerup', later);
    stage?.addEventListener('keyup', later);
    for (const sel of ['[data-sim-controls]', '[data-sim-preset-list]', '[data-sim-actions]']) {
      const el = this.root.querySelector<HTMLElement>(sel);
      el?.addEventListener('change', later);
      el?.addEventListener('click', later);
    }
    // Stand nach dem ersten Zeichnen merken, damit beim Laden nichts angesagt wird
    requestAnimationFrame(() => requestAnimationFrame(() => (this.spoken = this.readoutTexts())));
  }

  private scheduleAnnounce(): void {
    clearTimeout(this.announceTimer);
    this.announceTimer = window.setTimeout(() => this.announce(), 700);
  }

  /** Sichtbare Ergebnisse als „Beschriftung: Wert“. */
  private readoutTexts(): Map<string, string> {
    const texts = new Map<string, string>();
    for (const [key, row] of this.readouts) {
      if (row.root.hidden || row.value.hidden) continue;
      const dt = row.root.querySelector('dt');
      const label = dt ? spokenText(dt, this.lang) : '';
      const value = spokenText(row.value, this.lang);
      if (value) texts.set(key, label ? `${label}: ${value}` : value);
    }
    return texts;
  }

  private announce(): void {
    if (!this.liveEl || !this.readouts.size) return;
    const now = this.readoutTexts();
    const changed = [...now].filter(([key, text]) => this.spoken.get(key) !== text).map(([, text]) => text);
    this.spoken = now;
    // Läuft die Zeit, ändern sich die Werte ständig – dann nichts ungefragt ansagen
    if (this.clock.playing) return;
    if (changed.length) this.say(changed.join('; '));
  }

  /**
   * Verdeckt „spoiler“-Ergebnisse, solange der Aufgabenmodus aktiv ist oder der
   * Schalter `resultsParam` der Simulation („Ergebnisse anzeigen“) aus ist.
   */
  private applyHide(): void {
    const state = this.taskState();
    // Zusatzangaben der Auswahl-Optionen (z. B. Halbwertszeiten) im Aufgabenmodus verbergen
    this.controls?.setTaskHidden(isTaskHidden(state));
    // Regler, die die Lösung verraten, im Aufgabenmodus ausblenden
    this.controls?.setSpoilersHidden(hidesSpoilerControls(state));
    for (const [key, row] of this.readouts) {
      if (!row.reveal) continue;
      const hidden = isReadoutHidden(state, key);
      row.value.hidden = hidden;
      row.reveal.hidden = !hidden;
    }
    // Simulation über den Wechsel informieren und neu zeichnen (z. B. Etiketten im Bild)
    if (!this.instance) return;
    this.syncSpoilers();
    this.syncTaskHidden();
    this.requestRender();
  }

  /**
   * Meldet jeden Wechsel von `ctx.isHidden(key)` einzeln über `spoilerChange`
   * (Aufdecken eines Ergebnisses, Schalter `resultsParam`, Link im Lernmaterial).
   */
  private syncSpoilers(): void {
    for (const [key, hidden] of spoilerChanges(this.taskState(), this.spoilerKeys(), this.lastSpoilerHidden)) {
      this.instance?.spoilerChange?.(key, hidden);
    }
  }

  /** Schlüssel aller `spoiler`-Ergebnisse (auch gerade ausgeblendeter). */
  private spoilerKeys(): string[] {
    return [...this.readouts].filter(([, row]) => row.spoiler).map(([key]) => key);
  }

  /** Meldet einen Wechsel von `ctx.hidden` (Auswahl-Zusätze, `hiddenChange`, neu zeichnen). */
  private syncTaskHidden(): void {
    if (!this.instance) return;
    const hidden = isTaskHidden(this.taskState());
    if (hidden === this.lastHidden) return;
    this.lastHidden = hidden;
    this.controls?.setTaskHidden(hidden);
    this.controls?.setSpoilersHidden(hidesSpoilerControls(this.taskState()));
    this.instance.hiddenChange?.(hidden);
    this.requestRender();
  }

  private taskState(): TaskModeState {
    const param = this.def.resultsParam;
    return {
      hideFlag: this.flags.hide,
      resultsOff: !!param && this.values[param] === false,
      revealed: this.revealed,
      // Nur angezeigte Spoiler zählen: ausgeblendete lassen sich nicht aufdecken
      spoilers: [...this.readouts].filter(([, row]) => row.spoiler && !row.root.hidden).map(([key]) => key),
      ignoresResultsParam: new Set([...this.readouts].filter(([, row]) => row.ignoresResultsParam).map(([key]) => key)),
    };
  }

  private readout(key: string, value: ReadoutValue): void {
    const row = this.readouts.get(key);
    if (!row) return;
    const visible = value !== null;
    if (row.root.hidden === visible) {
      row.root.hidden = !visible;
      // Ein Spoiler erscheint oder verschwindet: `ctx.hidden` kann sich ändern
      if (row.spoiler) this.syncTaskHidden();
    }
    if (value === null) return;
    const text = typeof value === 'string' ? `t:${value}` : `h:${value.html}`;
    if (text === row.last) return;
    row.last = text;
    // Zahl und Einheit nicht trennen (geschütztes Leerzeichen, siehe format.ts);
    // reiner Text setzt „_“ wie die Beschriftungen als Index („F_max“)
    if (typeof value === 'string') setSubReadout(row.value, value);
    else row.value.innerHTML = bindUnitsHtml(hatsInHtml(value.html));
  }

  /* ---------- Aktionen ---------- */

  private buildActions(): void {
    const actions = this.def.actions ?? [];
    if (!actions.length) return;
    const wrap = this.query('[data-sim-actions]');
    for (const action of actions) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = action.primary ? 'btn btn--primary' : 'btn';
      setSubLabel(button, action.label[this.lang]);
      button.dataset.simAction = action.id;
      button.addEventListener('click', () => {
        this.instance?.action?.(action.id);
        if (this.pending.size) this.flush();
        this.requestRender();
      });
      wrap.append(button);
      this.actionButtons.set(action.id, button);
    }
    wrap.hidden = false;
    this.syncActions();
  }

  /**
   * Tipp unter der Bühne: eigener `hint` (fest oder abhängig von den Werten),
   * sonst der allgemeine Hinweis von `dragHint`, sonst keiner; bei gesperrten
   * Links (`_lock=1`) gar keiner.
   */
  private syncHint(): void {
    const el = this.hintEl;
    if (!el) return;
    const text = resolveHint(this.def, this.values, this.lang, this.dragHintText, this.locked);
    // Für Bildschirmleser: Hinweis auf die Regler und die aktuellen Werte (unsichtbar)
    const extra = text && this.def.dragHint ? this.valuesSummary() : '';
    const composed = `${text}\u0000${extra}`;
    if (composed !== this.hintComposed) {
      this.hintComposed = composed;
      // `_` als Index wie bei den Beschriftungen; Wörter wie „log_2“ bleiben (Option `prose`)
      setSubLabel(el, text, { prose: true });
      if (extra) {
        const span = document.createElement('span');
        span.className = 'visually-hidden';
        span.textContent = ` ${extra}`;
        el.append(span);
      }
    }
    el.hidden = !text;
  }

  /** „Mit der Tastatur … Aktuelle Werte: a = 2, …“ – nur sichtbare Zahlen-Regler. */
  private valuesSummary(): string {
    const parts: string[] = [];
    const spoilersHidden = hidesSpoilerControls(this.taskState());
    for (const def of this.defs) {
      if (def.type !== 'number' || def.visibleIf?.(this.values) === false) continue;
      // Ausgeblendete Regler, die die Lösung verraten, nicht vorlesen
      if (spoilersHidden && this.isSpoilerParam(def)) continue;
      const value = this.values[def.key] as number;
      const shown = def.display ? def.display(value, this.lang) : this.fmt.num(value, stepDecimals(def.step));
      const label = plainSubText(def.label[this.lang]).replace(/\s+/g, ' ').trim();
      parts.push(`${label}: ${def.unit && !def.display ? withUnit(shown, def.unit) : shown}`);
    }
    if (!parts.length) return '';
    return `${t(this.lang, 'sim.keyboardHint')} ${t(this.lang, 'sim.currentValues')}: ${parts.join('; ')}.`;
  }

  /** Sichtbarkeit der Aktions-Knöpfe an die aktuellen Werte anpassen. */
  private syncActions(): void {
    for (const action of this.def.actions ?? []) {
      const button = this.actionButtons.get(action.id);
      if (button && action.visibleIf) button.hidden = !action.visibleIf(this.values);
    }
  }

  /* ---------- Werkzeugleiste ---------- */

  private bindToolbar(): void {
    const on = (action: string, handler: () => void) => {
      for (const el of this.root.querySelectorAll<HTMLButtonElement>(`[data-action="${action}"]`)) {
        el.addEventListener('click', handler);
      }
    };
    if (this.def.animated) this.query('[data-sim-anim]').hidden = false;
    if (this.def.hint || this.def.dragHint) {
      this.hintEl = this.query('[data-sim-hint]');
      // Allgemeiner Text: „markierte Punkte“ (aus der Hülle) bzw. für Drehknöpfe/Schieber
      const key = dragHintKey(this.def.dragHint);
      this.dragHintText = key ? t(this.lang, key) : '';
      this.syncHint();
    }

    on('play', () => this.clock.toggle());
    on('reset-time', () => {
      this.clock.reset();
      this.instance?.resetTime?.();
      this.requestRender();
    });
    on('reset', () => {
      if (this.locked) return;
      this.clock.pause();
      this.clock.reset();
      this.instance?.resetTime?.();
      this.instance?.resetView?.();
      this.replaceAll(defaultValues(this.defs));
      this.requestRender();
    });
    on('unlock', () => {
      this.locked = false;
      this.flags = { ...this.flags, lock: false };
      this.applyLock();
      this.scheduleUrlUpdate();
    });
    on('image', () => {
      void exportStagePng(this.stage, `${this.def.id}.png`, this.theme.bg);
    });
    on('fullscreen', () => this.toggleFullscreen());

    document.addEventListener('fullscreenchange', () => {
      const active = document.fullscreenElement === this.root;
      this.root.classList.toggle('sim--fullscreen', active);
      this.updateFullscreenButton(active);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.root.classList.contains('sim--maximized')) this.toggleMaximized(false);
    });
  }

  private updatePlayButton(playing: boolean): void {
    const button = this.root.querySelector<HTMLButtonElement>('[data-action="play"]');
    if (!button) return;
    button.setAttribute('aria-pressed', String(playing));
    const label = button.querySelector('[data-label]');
    if (label) label.textContent = t(this.lang, playing ? 'sim.pause' : 'sim.play');
    button.classList.toggle('is-playing', playing);
  }

  private toggleFullscreen(): void {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else if (this.root.classList.contains('sim--maximized')) {
      this.toggleMaximized(false);
    } else if (this.root.requestFullscreen && document.fullscreenEnabled) {
      this.root.requestFullscreen().catch(() => this.toggleMaximized(true));
    } else {
      this.toggleMaximized(true);
    }
  }

  /** Ersatz für Geräte ohne Fullscreen-API (z. B. iPhone): Simulation füllt das Fenster. */
  private toggleMaximized(on: boolean): void {
    this.root.classList.toggle('sim--maximized', on);
    this.root.classList.toggle('sim--fullscreen', on);
    document.documentElement.classList.toggle('has-maximized-sim', on);
    this.updateFullscreenButton(on);
  }

  private updateFullscreenButton(active: boolean): void {
    const button = this.root.querySelector<HTMLButtonElement>('[data-action="fullscreen"]');
    if (!button) return;
    const label = t(this.lang, active ? 'sim.exitFullscreen' : 'sim.fullscreen');
    button.title = label;
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-pressed', String(active));
  }

  /* ---------- Teilen ---------- */

  private shareUrl(flags: ShareFlags): string {
    const query = encodeState(this.defs, this.values, flags);
    return `${location.origin}${location.pathname}${query ? `?${query}` : ''}`;
  }

  private bindShare(): void {
    const dialog = this.root.querySelector<HTMLDialogElement>('[data-sim-share]');
    if (!dialog) return;
    const lock = dialog.querySelector<HTMLInputElement>('[data-share-lock]')!;
    const hide = dialog.querySelector<HTMLInputElement>('[data-share-hide]')!;
    const url = dialog.querySelector<HTMLInputElement>('[data-share-url]')!;
    const copy = dialog.querySelector<HTMLButtonElement>('[data-share-copy]')!;
    const qr = dialog.querySelector<HTMLElement>('[data-share-qr]')!;
    const large = dialog.querySelector<HTMLButtonElement>('[data-share-qr-large]')!;
    const overlay = this.root.querySelector<HTMLElement>('[data-qr-overlay]')!;
    const hasSpoilers = (this.def.readouts ?? []).some((r) => r.spoiler);
    const hideRow = hide.closest<HTMLElement>('.share__option');
    if (hideRow) hideRow.hidden = !hasSpoilers;

    // Der QR-Code-Generator wird erst beim ersten Teilen geladen.
    const loadQr = () => import('./qr').then((m) => m.qrSvg);
    const refresh = () => {
      const link = this.shareUrl({ lock: lock.checked, hide: hide.checked && hasSpoilers });
      url.value = link;
      void loadQr().then((qrSvg) => {
        if (url.value === link) qr.innerHTML = qrSvg(link, { title: t(this.lang, 'share.qr') });
      });
      return link;
    };

    for (const button of this.root.querySelectorAll<HTMLButtonElement>('[data-action="share"]')) {
      button.addEventListener('click', () => {
        refresh();
        dialog.showModal();
        url.select();
      });
    }
    lock.addEventListener('change', refresh);
    hide.addEventListener('change', refresh);
    copy.addEventListener('click', async () => {
      const link = refresh();
      try {
        await navigator.clipboard.writeText(link);
      } catch {
        // Ohne Zwischenablage-Recht: Link markieren, damit er mit Strg+C kopiert werden kann.
        url.select();
        return;
      }
      const label = copy.querySelector('[data-label]') ?? copy;
      label.textContent = t(this.lang, 'share.copied');
      setTimeout(() => (label.textContent = t(this.lang, 'share.copy')), 1800);
    });
    large.addEventListener('click', async () => {
      const link = refresh();
      const qrSvg = await loadQr();
      overlay.querySelector<HTMLElement>('[data-qr-large]')!.innerHTML = qrSvg(link);
      overlay.querySelector<HTMLElement>('[data-qr-url]')!.textContent = link;
      dialog.close();
      overlay.hidden = false;
      overlay.focus();
    });
    const closeOverlay = () => {
      overlay.hidden = true;
    };
    overlay.addEventListener('click', closeOverlay);
    overlay.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') closeOverlay();
    });
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  }

  /* ---------- Adresse (URL) ---------- */

  private scheduleUrlUpdate(): void {
    clearTimeout(this.urlTimer);
    this.urlTimer = window.setTimeout(() => {
      const query = encodeState(this.defs, this.values, { lock: this.locked, hide: this.flags.hide });
      const next = `${location.pathname}${query ? `?${query}` : ''}${location.hash}`;
      if (next !== `${location.pathname}${location.search}${location.hash}`) {
        try {
          history.replaceState(history.state, '', next);
        } catch {
          // In eingebetteten Ansichten (z. B. iframe-Vorschau) kann das verboten sein.
        }
      }
    }, 250);
  }

  /** Links im Lernmaterial wie `[Beispiel](?m=2&b=1)` laden den Zustand ohne Neuladen. */
  private bindMaterialLinks(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as Element | null;
      const link = target?.closest<HTMLAnchorElement>('[data-sim-material] a[href^="?"]');
      if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
      event.preventDefault();
      const state = decodeState(this.defs, link.getAttribute('href') ?? '');
      // Steuerparameter des Links übernehmen (z. B. _hide=1 für Ableseaufgaben)
      this.flags = state.flags;
      this.locked = state.flags.lock;
      this.revealed.clear();
      this.applyLock();
      this.applyHide();
      this.replaceAll(state.values);
      this.scheduleUrlUpdate();
      this.root.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    });
  }

  private query<T extends HTMLElement = HTMLElement>(selector: string): T {
    const el = this.root.querySelector<T>(selector);
    if (!el) throw new Error(`Element ${selector} fehlt in der Simulations-Hülle.`);
    return el;
  }
}
