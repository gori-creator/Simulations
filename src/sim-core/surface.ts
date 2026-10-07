import type { Lang } from '../i18n/config';
import type { Theme } from './theme';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Was eine Zeichenfläche vom Simulationskontext braucht. */
export interface SurfaceHost {
  readonly stage: HTMLElement;
  readonly lang: Lang;
  readonly theme: Theme;
  requestRender(): void;
}

export interface SurfacePointer {
  id: number;
  /** Position in CSS-Pixeln relativ zur Zeichenfläche. */
  px: number;
  py: number;
  type: string;
  event: PointerEvent;
}

/** Ein Bereich der Zeichenfläche, der auf Zeiger reagiert (z. B. ein Koordinatensystem). */
export interface PointerTarget {
  contains(px: number, py: number): boolean;
  pointerDown(p: SurfacePointer): boolean;
  pointerMove(p: SurfacePointer): void;
  pointerUp(p: SurfacePointer): void;
  hover(p: SurfacePointer | null): void;
  wheel(px: number, py: number, deltaY: number): boolean;
  resize?(): void;
}

/**
 * Canvas-Zeichenfläche: kümmert sich um scharfe Darstellung auf
 * hochauflösenden Displays, Größenänderungen und die Verteilung von
 * Maus-/Touch-/Stift-Eingaben an Koordinatensysteme.
 */
export class Surface {
  readonly canvas: HTMLCanvasElement;
  readonly g: CanvasRenderingContext2D;
  width = 0;
  height = 0;
  dpr = 1;

  private targets: PointerTarget[] = [];
  private active = new Map<number, PointerTarget>();
  private hovered: PointerTarget | null = null;
  private observer: ResizeObserver;
  private cleanup: (() => void)[] = [];

  constructor(readonly host: SurfaceHost, label?: string) {
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'sim-canvas';
    if (label) {
      this.canvas.setAttribute('role', 'img');
      this.canvas.setAttribute('aria-label', label);
    }
    host.stage.append(this.canvas);
    const g = this.canvas.getContext('2d');
    if (!g) throw new Error('Canvas 2D wird nicht unterstützt.');
    this.g = g;

    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(host.stage);
    this.resize();
    this.bindPointer();
  }

  get theme(): Theme {
    return this.host.theme;
  }

  get lang(): Lang {
    return this.host.lang;
  }

  /** Ganze Fläche löschen; zu Beginn jedes Frames aufrufen. */
  begin(): CanvasRenderingContext2D {
    const g = this.g;
    g.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    g.fillStyle = this.theme.bg;
    g.fillRect(0, 0, this.width, this.height);
    return g;
  }

  addTarget(target: PointerTarget): void {
    this.targets.push(target);
  }

  setCursor(cursor: string): void {
    this.canvas.style.cursor = cursor;
  }

  destroy(): void {
    this.observer.disconnect();
    for (const fn of this.cleanup) fn();
    this.canvas.remove();
  }

  private resize(): void {
    const rect = this.host.stage.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    if (width === this.width && height === this.height && dpr === this.dpr) return;
    this.width = width;
    this.height = height;
    this.dpr = dpr;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    for (const target of this.targets) target.resize?.();
    this.host.requestRender();
  }

  private toPointer(event: PointerEvent): SurfacePointer {
    const rect = this.canvas.getBoundingClientRect();
    return {
      id: event.pointerId,
      px: event.clientX - rect.left,
      py: event.clientY - rect.top,
      type: event.pointerType,
      event,
    };
  }

  private targetAt(px: number, py: number): PointerTarget | null {
    for (let i = this.targets.length - 1; i >= 0; i--) {
      const target = this.targets[i]!;
      if (target.contains(px, py)) return target;
    }
    return null;
  }

  private bindPointer(): void {
    const canvas = this.canvas;
    const on = <K extends keyof HTMLElementEventMap>(
      type: K,
      handler: (event: HTMLElementEventMap[K]) => void,
      options?: AddEventListenerOptions,
    ) => {
      canvas.addEventListener(type, handler, options);
      this.cleanup.push(() => canvas.removeEventListener(type, handler, options));
    };

    on('pointerdown', (event) => {
      if (event.button > 0) return;
      const p = this.toPointer(event);
      const target = this.targetAt(p.px, p.py);
      if (target?.pointerDown(p)) {
        this.active.set(p.id, target);
        canvas.setPointerCapture(p.id);
        event.preventDefault();
      }
    });

    on('pointermove', (event) => {
      const p = this.toPointer(event);
      const target = this.active.get(p.id);
      if (target) {
        target.pointerMove(p);
        return;
      }
      if (event.pointerType === 'touch') return;
      const under = this.targetAt(p.px, p.py);
      if (under !== this.hovered) this.hovered?.hover(null);
      this.hovered = under;
      if (under) under.hover(p);
      else this.setCursor('');
    });

    const end = (event: PointerEvent) => {
      const p = this.toPointer(event);
      const target = this.active.get(p.id);
      if (!target) return;
      this.active.delete(p.id);
      target.pointerUp(p);
      if (canvas.hasPointerCapture(p.id)) canvas.releasePointerCapture(p.id);
    };
    on('pointerup', end);
    on('pointercancel', end);
    on('pointerleave', () => {
      this.hovered?.hover(null);
      this.hovered = null;
    });

    on(
      'wheel',
      (event) => {
        // Nur mit Strg/⌘ (oder Trackpad-Pinch, das ctrlKey setzt) oder im
        // Vollbild zoomen – sonst würde das Scrollen der Seite blockiert.
        const fullscreen = !!this.host.stage.closest('.sim--fullscreen');
        if (!event.ctrlKey && !event.metaKey && !fullscreen) return;
        const rect = canvas.getBoundingClientRect();
        const px = event.clientX - rect.left;
        const py = event.clientY - rect.top;
        const target = this.targetAt(px, py);
        const delta = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
        if (target?.wheel(px, py, delta)) event.preventDefault();
      },
      { passive: false },
    );
  }
}

/**
 * Klickbarer Bereich ohne Koordinatensystem (z. B. Türen, Karten, Knöpfe im
 * Canvas). `hit` liefert eine ID oder `null`; `onTap` wird beim Antippen mit
 * dieser ID aufgerufen.
 */
export class TapTarget implements PointerTarget {
  private hovered: string | null = null;

  constructor(
    private readonly surface: Surface,
    private readonly options: {
      hit: (px: number, py: number) => string | null;
      onTap: (id: string) => void;
      onHover?: (id: string | null) => void;
    },
  ) {
    surface.addTarget(this);
  }

  contains(px: number, py: number): boolean {
    return this.options.hit(px, py) !== null;
  }

  pointerDown(p: SurfacePointer): boolean {
    const id = this.options.hit(p.px, p.py);
    if (id === null) return false;
    this.options.onTap(id);
    this.surface.host.requestRender();
    return true;
  }

  pointerMove(): void {}

  pointerUp(): void {}

  hover(p: SurfacePointer | null): void {
    const id = p ? this.options.hit(p.px, p.py) : null;
    this.surface.setCursor(id ? 'pointer' : '');
    if (id !== this.hovered) {
      this.hovered = id;
      this.options.onHover?.(id);
      this.surface.host.requestRender();
    }
  }

  wheel(): boolean {
    return false;
  }
}
