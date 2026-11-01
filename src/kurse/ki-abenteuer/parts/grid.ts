import { h } from '../../engine/dom';

/**
 * Kästchenraster zum Ausmalen: antippen schaltet um, Ziehen malt weiter
 * (erstes Kästchen bestimmt, ob gemalt oder radiert wird). Tastatur:
 * Pfeiltasten bewegen, Leertaste/Enter schaltet um.
 */
export interface PaintGrid {
  el: HTMLElement;
  get(): number[];
  set(cells: readonly number[]): void;
  /** Markiert Kästchen (z. B. falsche) mit einer Klasse. */
  mark(flags: readonly boolean[], cls: string): void;
}

export function paintGrid(size: number, label: string, onChange: (cells: number[]) => void, readonly = false): PaintGrid {
  const cells = new Array<number>(size * size).fill(0);
  const el = h('div', { class: `kgrid${readonly ? ' is-readonly' : ''}`, attrs: { role: 'grid', 'aria-label': label } });
  el.style.setProperty('--n', String(size));
  let focus = 0;
  let painting: number | null = null;

  const buttons = cells.map((_, i) => {
    const b = h(readonly ? 'span' : 'button', {
      class: 'kgrid__cell',
      attrs: readonly ? { role: 'gridcell' } : { type: 'button', role: 'gridcell', 'aria-pressed': 'false', tabindex: i === 0 ? 0 : -1, 'aria-label': `${Math.floor(i / size) + 1}/${(i % size) + 1}` },
    });
    return b;
  });
  el.append(...buttons);

  const apply = (i: number, v: number) => {
    if (cells[i] === v) return;
    cells[i] = v;
    sync(i);
    onChange([...cells]);
  };
  const sync = (i: number) => {
    buttons[i]!.classList.toggle('is-on', cells[i] === 1);
    if (!readonly) buttons[i]!.setAttribute('aria-pressed', String(cells[i] === 1));
  };

  if (!readonly) {
    const indexAt = (event: PointerEvent) => {
      const target = document.elementFromPoint(event.clientX, event.clientY);
      const i = buttons.indexOf(target as HTMLElement);
      return i;
    };
    el.addEventListener('pointerdown', (event) => {
      const i = buttons.indexOf(event.target as HTMLElement);
      if (i < 0) return;
      event.preventDefault();
      painting = cells[i] ? 0 : 1;
      apply(i, painting);
      el.setPointerCapture(event.pointerId);
    });
    el.addEventListener('pointermove', (event) => {
      if (painting === null) return;
      const i = indexAt(event);
      if (i >= 0) apply(i, painting);
    });
    const stop = () => (painting = null);
    el.addEventListener('pointerup', stop);
    el.addEventListener('pointercancel', stop);
    // Klick ohne Zeiger (Tastatur)
    el.addEventListener('click', (event) => {
      if ((event as PointerEvent).pointerType) return;
      const i = buttons.indexOf(event.target as HTMLElement);
      if (i >= 0 && event.detail === 0) apply(i, cells[i] ? 0 : 1);
    });
    el.addEventListener('keydown', (event) => {
      const moves: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -size, ArrowDown: size };
      const m = moves[event.key];
      if (m === undefined) return;
      event.preventDefault();
      const next = focus + m;
      if (next < 0 || next >= cells.length) return;
      if ((m === -1 && focus % size === 0) || (m === 1 && focus % size === size - 1)) return;
      buttons[focus]!.setAttribute('tabindex', '-1');
      focus = next;
      buttons[focus]!.setAttribute('tabindex', '0');
      buttons[focus]!.focus();
    });
  }

  return {
    el,
    get: () => [...cells],
    set(next) {
      next.forEach((v, i) => {
        cells[i] = v;
        sync(i);
      });
      onChange([...cells]);
    },
    mark(flags, cls) {
      buttons.forEach((b, i) => b.classList.toggle(cls, !!flags[i]));
    },
  };
}
