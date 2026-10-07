import type { Lang } from '../i18n/config';
import { Formatter } from './format';
import { isVisible, stepDecimals } from './params';
import type { ChoiceParam, NumberParam, ParamDef, ParamGroup, ParamValue, ParamValues } from './types';

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
}

interface ControlView {
  def: ParamDef;
  root: HTMLElement;
  sync(value: ParamValue): void;
  setDisabled(disabled: boolean): void;
}

export class Controls {
  private views: ControlView[] = [];
  private fmt: Formatter;

  constructor(private readonly options: ControlsOptions) {
    this.fmt = new Formatter(options.lang);
    this.build();
  }

  /** Werte und Sichtbarkeit aktualisieren. */
  sync(values: ParamValues): void {
    for (const view of this.views) {
      const value = values[view.def.key];
      if (value !== undefined) view.sync(value);
      view.root.hidden = !isVisible(view.def, values);
    }
    for (const fieldset of this.options.container.querySelectorAll<HTMLElement>('[data-group]')) {
      fieldset.hidden = !fieldset.querySelector('.ctl:not([hidden])');
    }
  }

  setDisabled(disabled: boolean): void {
    for (const view of this.views) view.setDisabled(disabled);
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
        title.textContent = group.label[lang];
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
    }
  }

  private helpText(def: ParamDef): HTMLElement | null {
    if (!def.help) return null;
    const p = document.createElement('p');
    p.className = 'ctl__help';
    p.textContent = def.help[this.options.lang];
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
    label.textContent = def.label[lang];
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
      text.setAttribute('aria-label', def.label[lang]);
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
      const parse = () => Number(input.value.trim().replace(/−/g, '-').replace(',', '.'));
      input.addEventListener('change', () => {
        const value = parse();
        if (Number.isFinite(value)) commit(value);
        else input.value = this.fmt.num(current, decimals);
      });
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          input.dispatchEvent(new Event('change'));
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
        if (text && document.activeElement !== text) text.value = this.fmt.num(n, decimals);
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
    text.textContent = def.label[lang];
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

  private choiceView(def: ChoiceParam): ControlView {
    const { lang, idPrefix, onInput } = this.options;
    const root = document.createElement('fieldset');
    root.className = 'ctl ctl--choice';
    const legend = document.createElement('legend');
    legend.className = 'ctl__label';
    legend.textContent = def.label[lang];
    const group = document.createElement('div');
    group.className = 'segmented';
    const inputs: HTMLInputElement[] = [];
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
      span.textContent = option.label[lang];
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
    };
  }
}
