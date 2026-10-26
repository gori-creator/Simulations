import type { Lang } from '../i18n/config';
import { bindUnits, Formatter } from './format';
import { isVisible, resolveText, stepDecimals } from './params';
import { plainSubText, setSubLabel } from './rich-label';
import type { ChoiceOption, ChoiceParam, NumberParam, ParamDef, ParamGroup, ParamValue, ParamValues, TextParam } from './types';

/**
 * Erzeugt aus den Parameter-Definitionen einer Simulation automatisch die
 * Bedienelemente (Schieberegler, Schalter, Auswahlfelder).
 */
export interface ControlsOptions {
  container: HTMLElement;
  lang: Lang;
  defs: readonly ParamDef[];
  groups?: ParamGroup[];
  idPrefix: string;
  onInput: (key: string, value: ParamValue) => void;
  /** Aufgabenmodus zu Beginn (`ctx.hidden`): verbirgt Zusatzangaben der Auswahl-Optionen. */
  taskHidden?: boolean;
}

/**
 * Beschriftung einer Auswahl-Option: „Rn-220 (T½ = 55,6 s)“, im Aufgabenmodus
 * ohne die Zusatzangabe `detail` („Rn-220“). Zahl und Einheit bleiben zusammen.
 */
export function choiceOptionLabel(option: ChoiceOption, lang: Lang, taskHidden: boolean): string {
  const label = option.label[lang];
  const detail = option.detail?.[lang]?.trim();
  return detail && !taskHidden ? `${label} (${bindUnits(detail)})` : label;
}

/**
 * Hilfetexte setzen `_` als Index wie die Beschriftungen („v_K“ → v mit
 * tiefgestelltem K), lassen aber Wörter wie die Eingabe-Schreibweise „log_2“
 * im Funktionsplotter stehen (siehe `parseSubText`, Option `prose`).
 */
const HELP_TEXT = { prose: true } as const;

interface ControlView {
  def: ParamDef;
  root: HTMLElement;
  sync(value: ParamValue): void;
  setDisabled(disabled: boolean): void;
  /** Aufgabenmodus an/aus (nur Auswahlen mit Zusatzangaben). */
  setTaskHidden?(hidden: boolean): void;
}

export class Controls {
  private views: ControlView[] = [];
  /** Hilfetexte, die von den aktuellen Werten abhängen (`help` als Funktion). */
  private dynamicHelp: { def: ParamDef; element: HTMLElement; last: string }[] = [];
  private fmt: Formatter;
  private taskHidden: boolean;

  constructor(private readonly options: ControlsOptions) {
    this.fmt = new Formatter(options.lang);
    this.taskHidden = options.taskHidden ?? false;
    this.build();
  }

  /** Werte und Sichtbarkeit aktualisieren. */
  sync(values: ParamValues): void {
    for (const view of this.views) {
      const value = values[view.def.key];
      if (value !== undefined) view.sync(value);
      view.root.hidden = !isVisible(view.def, values);
    }
    for (const entry of this.dynamicHelp) {
      const text = resolveText(entry.def.help, values, this.options.lang) ?? '';
      if (entry.last !== text) {
        entry.last = text;
        setSubLabel(entry.element, text, HELP_TEXT);
      }
      entry.element.hidden = !text;
    }
    for (const fieldset of this.options.container.querySelectorAll<HTMLElement>('[data-group]')) {
      fieldset.hidden = !fieldset.querySelector('.ctl:not([hidden])');
    }
  }

  setDisabled(disabled: boolean): void {
    for (const view of this.views) view.setDisabled(disabled);
  }

  /** Aufgabenmodus (`ctx.hidden`) an/aus: Zusatzangaben der Auswahl-Optionen verbergen bzw. zeigen. */
  setTaskHidden(hidden: boolean): void {
    if (hidden === this.taskHidden) return;
    this.taskHidden = hidden;
    for (const view of this.views) view.setTaskHidden?.(hidden);
  }

  private build(): void {
    const { container, defs, groups = [], lang } = this.options;
    container.textContent = '';
    const order: (ParamGroup | null)[] = [null, ...groups];
    for (const group of order) {
      const members = defs.filter((d) => (d.group ?? null) === (group?.id ?? null));
      if (!members.length) continue;
      const fieldset = document.createElement('div');
      fieldset.className = 'ctl-group';
      fieldset.dataset.group = group?.id ?? '';
      if (group) {
        const titleId = `${this.options.idPrefix}-group-${group.id}`;
        const title = document.createElement('div');
        title.className = 'ctl-group__title';
        title.id = titleId;
        setSubLabel(title, group.label[lang]);
        fieldset.setAttribute('role', 'group');
        fieldset.setAttribute('aria-labelledby', titleId);
        fieldset.append(title);
      }
      for (const def of members) {
        const view = this.createView(def);
        this.views.push(view);
        fieldset.append(view.root);
      }
      container.append(fieldset);
    }
  }

  private createView(def: ParamDef): ControlView {
    switch (def.type) {
      case 'number':
        return this.numberView(def);
      case 'boolean':
        return this.booleanView(def);
      case 'choice':
        return this.choiceView(def);
      case 'text':
        return this.textView(def);
    }
  }

  private helpText(def: ParamDef): HTMLElement | null {
    if (!def.help) return null;
    const p = document.createElement('p');
    p.className = 'ctl__help';
    if (typeof def.help === 'function') {
      // Text hängt von den Werten ab: wird in `sync` gesetzt (bis dahin ausgeblendet)
      p.hidden = true;
      this.dynamicHelp.push({ def, element: p, last: '' });
      return p;
    }
    setSubLabel(p, def.help[this.options.lang], HELP_TEXT);
    return p;
  }

  private displayNumber(def: NumberParam, value: number): string {
    if (def.display) return def.display(value, this.options.lang);
    const text = this.fmt.num(value, Math.max(stepDecimals(def.step), 0));
    return def.unit ? `${text} ${def.unit}` : text;
  }

  private numberView(def: NumberParam): ControlView {
    const { lang, idPrefix, onInput } = this.options;
    const id = `${idPrefix}-${def.key}`;
    const root = document.createElement('div');
    root.className = 'ctl ctl--number';

    const head = document.createElement('div');
    head.className = 'ctl__head';
    const label = document.createElement('label');
    label.htmlFor = id;
    label.className = 'ctl__label';
    setSubLabel(label, def.label[lang]);
    head.append(label);

    const range = document.createElement('input');
    range.type = 'range';
    range.id = id;
    range.className = 'ctl__range';
    range.min = String(def.min);
    range.max = String(def.max);
    range.step = String(def.step);

    let text: HTMLInputElement | null = null;
    let output: HTMLOutputElement | null = null;
    if (def.display) {
      output = document.createElement('output');
      output.className = 'ctl__value';
      output.htmlFor.add(id);
      head.append(output);
    } else {
      text = document.createElement('input');
      text.type = 'text';
      text.inputMode = 'decimal';
      text.className = 'ctl__number';
      text.setAttribute('aria-label', plainSubText(def.label[lang]));
      text.autocomplete = 'off';
      text.spellcheck = false;
      const wrap = document.createElement('span');
      wrap.className = 'ctl__number-wrap';
      wrap.append(text);
      if (def.unit) {
        const unit = document.createElement('span');
        unit.className = 'ctl__unit';
        unit.textContent = def.unit;
        wrap.append(unit);
      }
      head.append(wrap);
    }

    root.append(head, range);
    const help = this.helpText(def);
    if (help) root.append(help);

    let current = def.default;
    const decimals = stepDecimals(def.step);
    const commit = (value: number) => {
      if (Number.isFinite(value)) onInput(def.key, value);
    };

    range.addEventListener('input', () => commit(Number(range.value)));
    if (text) {
      const input = text;
      // Leerzeichen (auch schmale, z. B. aus kopierten „125 000“) zählen nicht
      const parse = () => Number(input.value.replace(/[\s\u00A0\u202F]/g, '').replace(/−/g, '-').replace(',', '.'));
      // Getippten Text (z. B. „25 000“ oder „2,50“) auf die Anzeigeform des
      // übernommenen Werts zurücksetzen. Erst nach der Übernahme (Microtask),
      // damit `current` den gerundeten und begrenzten Wert enthält.
      const reformat = () =>
        queueMicrotask(() => {
          const shown = this.fmt.plain(current, decimals);
          if (input.value !== shown) input.value = shown;
        });
      input.addEventListener('change', () => {
        const value = parse();
        if (Number.isFinite(value)) commit(value);
        else input.value = this.fmt.plain(current, decimals);
      });
      input.addEventListener('blur', reformat);
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          input.dispatchEvent(new Event('change'));
          reformat();
        } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
          event.preventDefault();
          const factor = event.shiftKey ? 10 : 1;
          commit(current + (event.key === 'ArrowUp' ? 1 : -1) * def.step * factor);
        }
      });
    }

    return {
      def,
      root,
      sync: (value) => {
        const n = Number(value);
        current = n;
        if (Number(range.value) !== n) range.value = String(n);
        const percent = ((n - def.min) / (def.max - def.min)) * 100;
        range.style.setProperty('--fill', `${percent}%`);
        // Eingabefeld ohne Tausendertrennung, damit sich der Wert bearbeiten lässt
        if (text && document.activeElement !== text) text.value = this.fmt.plain(n, decimals);
        if (output) output.value = this.displayNumber(def, n);
        range.setAttribute('aria-valuetext', this.displayNumber(def, n));
      },
      setDisabled: (disabled) => {
        range.disabled = disabled;
        if (text) text.disabled = disabled;
      },
    };
  }

  private booleanView(def: ParamDef & { type: 'boolean' }): ControlView {
    const { lang, idPrefix, onInput } = this.options;
    const root = document.createElement('div');
    root.className = 'ctl ctl--boolean';
    const label = document.createElement('label');
    label.className = 'switch';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `${idPrefix}-${def.key}`;
    input.className = 'switch__input';
    input.setAttribute('role', 'switch');
    const track = document.createElement('span');
    track.className = 'switch__track';
    track.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span');
    text.className = 'switch__label';
    setSubLabel(text, def.label[lang]);
    label.append(input, track, text);
    root.append(label);
    const help = this.helpText(def);
    if (help) root.append(help);
    input.addEventListener('change', () => onInput(def.key, input.checked));
    return {
      def,
      root,
      sync: (value) => {
        input.checked = value === true;
      },
      setDisabled: (disabled) => {
        input.disabled = disabled;
      },
    };
  }

  /** Eingabefeld für freien Text; jede Eingabe wird sofort übernommen. */
  private textView(def: TextParam): ControlView {
    const { lang, idPrefix, onInput } = this.options;
    const id = `${idPrefix}-${def.key}`;
    const root = document.createElement('div');
    root.className = 'ctl ctl--text';
    const head = document.createElement('div');
    head.className = 'ctl__head';
    const label = document.createElement('label');
    label.htmlFor = id;
    label.className = 'ctl__label';
    setSubLabel(label, def.label[lang]);
    head.append(label);
    const input = document.createElement('input');
    input.type = 'text';
    input.id = id;
    input.className = 'ctl__text';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.setAttribute('autocapitalize', 'off');
    input.maxLength = def.maxLength ?? 80;
    if (def.placeholder) input.placeholder = def.placeholder[lang];
    root.append(head, input);
    const help = this.helpText(def);
    if (help) root.append(help);
    input.addEventListener('input', () => onInput(def.key, input.value));
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') input.blur();
    });
    return {
      def,
      root,
      sync: (value) => {
        const text = String(value);
        if (document.activeElement !== input && input.value !== text) input.value = text;
      },
      setDisabled: (disabled) => {
        input.disabled = disabled;
      },
    };
  }

  private choiceView(def: ChoiceParam): ControlView {
    const { lang, idPrefix, onInput } = this.options;
    const root = document.createElement('fieldset');
    root.className = 'ctl ctl--choice';
    const legend = document.createElement('legend');
    legend.className = 'ctl__label';
    setSubLabel(legend, def.label[lang]);
    const group = document.createElement('div');
    group.className = 'segmented';
    const inputs: HTMLInputElement[] = [];
    const detailed: { option: ChoiceOption; span: HTMLElement }[] = [];
    for (const option of def.options) {
      const label = document.createElement('label');
      label.className = 'segmented__option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `${idPrefix}-${def.key}`;
      input.value = option.value;
      input.className = 'segmented__input';
      input.addEventListener('change', () => {
        if (input.checked) onInput(def.key, option.value);
      });
      const span = document.createElement('span');
      setSubLabel(span, choiceOptionLabel(option, lang, this.taskHidden));
      if (option.detail) detailed.push({ option, span });
      label.append(input, span);
      group.append(label);
      inputs.push(input);
    }
    root.append(legend, group);
    const help = this.helpText(def);
    if (help) root.append(help);
    return {
      def,
      root,
      sync: (value) => {
        for (const input of inputs) input.checked = input.value === value;
      },
      setDisabled: (disabled) => {
        for (const input of inputs) input.disabled = disabled;
      },
      setTaskHidden: (hidden) => {
        for (const { option, span } of detailed) setSubLabel(span, choiceOptionLabel(option, lang, hidden));
      },
    };
  }
}
