import type { Rect } from './surface';

/**
 * Tastaturbedienung für antippbare Objekte auf der Zeichenfläche
 * (z. B. Bilder im Winkelspiegel, Türen, Karten).
 *
 * Eine Simulation meldet ihre Objekte mit `ctx.setKeyTargets([...])`. Dann
 * wird die Bühne per Tab erreichbar: Pfeiltasten wechseln die Auswahl,
 * Pos1/Ende springen an den Anfang/das Ende, Enter/Leertaste löst aus.
 * Die Auswahl wird mit einem Rahmen markiert und ihr Name per `aria-live`
 * angesagt. Gibt es genau ein Objekt, ist es beim Fokussieren gleich
 * ausgewählt (ein Enter genügt). Ohne gemeldete Objekte ändert sich nichts.
 */
export interface KeyTarget {
  /** Stabile ID (die Auswahl bleibt erhalten, wenn die Liste neu gemeldet wird). */
  id: string;
  /** Name für Bildschirmleser, z. B. „Bild 3“. */
  label: string;
  /** Lage in Pixeln der Bühne (wie bei `Surface`) für die Markierung; ohne Angabe kein Rahmen. */
  rect?: Rect;
  /** Wird übersprungen. */
  disabled?: boolean;
  /** Wie Antippen. */
  activate(): void;
}

export type KeyResult = 'move' | 'activate' | null;

/**
 * Tastatur für die Ansicht selbst (3D-Ansicht drehen, Koordinatensystem
 * verschieben, zoomen). `View3D` und `Plot` melden sich hier an; die Bühne wird
 * dann per Tab erreichbar. Pfeiltasten bewegen die Ansicht – gibt es zugleich
 * antippbare Objekte, mit gedrückter Umschalttaste. Plus/Minus zoomen.
 */
export interface ViewKeys {
  /** Pfeiltaste: Richtung je −1, 0 oder 1 (x nach rechts, y nach unten). */
  move(dx: number, dy: number): void;
  /** Plus (Faktor > 1) bzw. Minus (< 1). */
  zoom(factor: number): void;
  /** Hinweis für Bildschirmleser, z. B. „Pfeiltasten drehen die Ansicht …“. */
  hint: string;
}

/** Auswahl-Logik ohne DOM (testbar). */
export class KeyTargetNav {
  private targets: KeyTarget[] = [];
  private selectedId: string | null = null;

  get list(): readonly KeyTarget[] {
    return this.targets;
  }

  get selected(): KeyTarget | null {
    return this.targets.find((t) => t.id === this.selectedId) ?? null;
  }

  /** Neue Liste übernehmen; die Auswahl bleibt bei gleicher ID erhalten, sonst nächstes freies Objekt. */
  setTargets(targets: readonly KeyTarget[]): void {
    const oldIndex = this.selectedId === null ? -1 : this.targets.findIndex((t) => t.id === this.selectedId);
    this.targets = [...targets];
    const current = this.selected;
    if (current && !current.disabled) return;
    if (this.selectedId === null) return;
    this.selectedId = this.firstEnabledFrom(Math.max(0, oldIndex), 1)?.id ?? null;
  }

  /**
   * Beim Fokussieren der Bühne: Gibt es genau ein (aktives) Objekt und ist
   * noch nichts ausgewählt, wird es gleich ausgewählt, damit ein einziges
   * Enter auslöst. Bei mehreren Objekten bleibt es beim Pfeiltasten-Wählen.
   * Gibt zurück, ob sich die Auswahl geändert hat.
   */
  focus(): boolean {
    const only = this.targets.length === 1 ? this.targets[0]! : null;
    if (!only || only.disabled || this.selectedId === only.id) return false;
    this.selectedId = only.id;
    return true;
  }

  /**
   * Taste verarbeiten. Gibt zurück, was passiert ist (`null`: Taste nicht
   * zuständig, Standardverhalten des Browsers bleibt).
   */
  key(key: string): KeyResult {
    if (!this.targets.some((t) => !t.disabled)) return null;
    const index = this.targets.findIndex((t) => t.id === this.selectedId);
    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown':
        return this.select(index < 0 ? this.firstEnabledFrom(0, 1) : this.firstEnabledFrom(index + 1, 1));
      case 'ArrowLeft':
      case 'ArrowUp':
        return this.select(index < 0 ? this.firstEnabledFrom(this.targets.length - 1, -1) : this.firstEnabledFrom(index - 1, -1));
      case 'Home':
        return this.select(this.firstEnabledFrom(0, 1));
      case 'End':
        return this.select(this.firstEnabledFrom(this.targets.length - 1, -1));
      case 'Enter':
      case ' ': {
        const target = this.selected;
        if (!target || target.disabled) return this.select(this.firstEnabledFrom(0, 1));
        target.activate();
        return 'activate';
      }
      default:
        return null;
    }
  }

  /** Erstes aktives Objekt ab `start` in Richtung `dir` (mit Umlauf). */
  private firstEnabledFrom(start: number, dir: 1 | -1): KeyTarget | null {
    const n = this.targets.length;
    for (let k = 0; k < n; k++) {
      const target = this.targets[(((start + dir * k) % n) + n) % n]!;
      if (!target.disabled) return target;
    }
    return null;
  }

  private select(target: KeyTarget | null): KeyResult {
    if (!target) return null;
    this.selectedId = target.id;
    return 'move';
  }
}

/** Verbindet `KeyTargetNav` mit der Bühne: Fokus, Tasten, Markierung, Ansage. */
export class KeyTargetLayer {
  readonly nav = new KeyTargetNav();
  private readonly ring: HTMLElement;
  private readonly live: HTMLElement;
  private focused = false;
  private active = false;
  private view: ViewKeys | null = null;

  constructor(
    private readonly stage: HTMLElement,
    private readonly label: string,
    /** Nach Auswahl oder Auslösen (Host: Änderungen übernehmen, neu zeichnen). */
    private readonly onChange: (activated: boolean) => void,
  ) {
    this.ring = document.createElement('div');
    this.ring.className = 'sim__keyfocus';
    this.ring.hidden = true;
    this.ring.setAttribute('aria-hidden', 'true');
    this.live = document.createElement('span');
    this.live.className = 'visually-hidden';
    this.live.setAttribute('aria-live', 'polite');
    stage.append(this.ring, this.live);

    stage.addEventListener('keydown', (event) => {
      if (event.target !== stage || event.altKey || event.ctrlKey || event.metaKey) return;
      if (this.active && !event.shiftKey) {
        const result = this.nav.key(event.key);
        if (result) {
          event.preventDefault();
          if (result === 'move') this.announce();
          this.updateRing();
          this.onChange(result === 'activate');
          return;
        }
      }
      if (this.view && this.viewKey(event.key)) {
        event.preventDefault();
        this.onChange(false);
      }
    });
    stage.addEventListener('focus', () => {
      this.focused = true;
      // Nur ein Objekt: gleich auswählen, damit ein Enter genügt
      this.nav.focus();
      this.updateRing();
      this.onChange(false);
      // Beim ersten Fokus die aktuelle Auswahl bzw. den Hinweis ansagen
      if (this.nav.selected) this.announce();
    });
    stage.addEventListener('blur', () => {
      this.focused = false;
      this.updateRing();
      this.onChange(false);
    });
  }

  /** Objekte melden (leere Liste: Tastaturbedienung aus). */
  setTargets(targets: readonly KeyTarget[]): void {
    this.nav.setTargets(targets);
    // Wird die Liste bei fokussierter Bühne auf ein Objekt kürzer: ebenfalls gleich auswählen
    if (this.focused && this.nav.focus()) this.announce();
    const active = targets.length > 0;
    if (active !== this.active) {
      this.active = active;
      this.syncStage();
    }
    this.updateRing();
  }

  /** Tastatur für die Ansicht an- (bzw. mit `null` ab-)melden. */
  setView(view: ViewKeys | null): void {
    this.view = view;
    this.syncStage();
  }

  /** Bühne fokussierbar machen, solange es Objekte oder eine bewegliche Ansicht gibt. */
  private syncStage(): void {
    const on = this.active || this.view !== null;
    if (on) {
      this.stage.tabIndex = 0;
      const label = this.active ? (this.view ? `${this.label} ${this.view.hint}` : this.label) : (this.view?.hint ?? '');
      this.stage.setAttribute('aria-label', label);
      this.stage.classList.add('sim__stage--keys');
    } else {
      this.stage.removeAttribute('tabindex');
      this.stage.removeAttribute('aria-label');
      this.stage.classList.remove('sim__stage--keys');
    }
  }

  /** Pfeiltasten und Plus/Minus für die Ansicht; `true`, wenn die Taste verarbeitet wurde. */
  private viewKey(key: string): boolean {
    const view = this.view!;
    const dir: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const d = dir[key];
    if (d) view.move(d[0], d[1]);
    else if (key === '+' || key === '=') view.zoom(1.25);
    else if (key === '-' || key === '_') view.zoom(0.8);
    else return false;
    return true;
  }

  get selectedId(): string | null {
    return this.active && this.focused ? (this.nav.selected?.id ?? null) : null;
  }

  private announce(): void {
    const target = this.nav.selected;
    if (!target) return;
    const list = this.nav.list;
    this.live.textContent = `${target.label} (${list.indexOf(target) + 1}/${list.length})`;
  }

  private updateRing(): void {
    const rect = this.active && this.focused ? this.nav.selected?.rect : undefined;
    this.ring.hidden = !rect;
    if (!rect) return;
    const pad = 4;
    Object.assign(this.ring.style, {
      left: `${rect.x - pad}px`,
      top: `${rect.y - pad}px`,
      width: `${rect.w + 2 * pad}px`,
      height: `${rect.h + 2 * pad}px`,
    });
  }
}
