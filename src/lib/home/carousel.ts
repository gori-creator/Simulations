/**
 * Startseite: Karussell „Entdecken“ (src/components/home/HomeCarousel.astro).
 *
 * Die Karten stehen auf der Innenseite eines Zylinders um den Betrachter:
 * Karte i ist um (i − pos) · STEP gedreht. Gedreht wird nur `pos` (CSS-Variable
 * `--pos` am Ring), Karten weit außerhalb des Blickfelds werden ausgeblendet.
 * Bedienung: Ziehen, waagerechtes Scrollen (Trackpad, Umschalt + Mausrad),
 * Pfeiltasten, Knöpfe, Klick auf eine Seitenkarte. Die Karte in der Mitte ist
 * ein normaler Link zur Simulation.
 *
 * Auf schmalen Bildschirmen und bei reduzierter Bewegung bleibt es bei der
 * flachen, wischbaren Reihe aus dem HTML.
 */

/** Winkel zwischen zwei Karten (Grad) und wie viele Karten je Seite sichtbar sind. */
const STEP = 19;
const VISIBLE = 6;
/** Abstand zwischen den Karten auf dem Rad (px). */
const GAP = 28;

export function initCarousel(root: HTMLElement): () => void {
  const stage = root.querySelector<HTMLElement>('[data-carousel-stage]');
  const ring = root.querySelector<HTMLElement>('[data-carousel-ring]');
  const items = [...root.querySelectorAll<HTMLElement>('.home-carousel__item')];
  const meta = root.querySelector<HTMLElement>('[data-carousel-meta]');
  const title = root.querySelector<HTMLAnchorElement>('[data-carousel-title]');
  const bar = root.querySelector<HTMLElement>('[data-carousel-bar]');
  const count = root.querySelector<HTMLElement>('[data-carousel-count]');
  const prev = root.querySelector<HTMLButtonElement>('[data-carousel-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-carousel-next]');
  if (!stage || !ring || items.length === 0) return () => {};

  const n = items.length;
  const wide = matchMedia('(min-width: 720px)');
  const listeners: [EventTarget, string, EventListener, AddEventListenerOptions?][] = [];
  const on = (target: EventTarget, type: string, listener: EventListener, options?: AddEventListenerOptions) => {
    target.addEventListener(type, listener, options);
    listeners.push([target, type, listener, options]);
  };

  // Start bei der dritten Karte, damit links und rechts Karten stehen
  const START = Math.min(2, n - 1);
  let pos = START;
  let target = START;
  let current = -1;
  let frame = 0;
  let active = false;

  const clamp = (v: number) => Math.max(0, Math.min(n - 1, v));

  /** Halbmesser so, dass benachbarte Karten genau GAP Abstand haben. */
  function layout(): void {
    const card = items[0]?.offsetWidth || 240;
    const radius = (card + GAP) / (2 * Math.sin(((STEP / 2) * Math.PI) / 180));
    ring!.style.setProperty('--step', `${STEP}deg`);
    ring!.style.setProperty('--r', `${radius.toFixed(1)}px`);
  }

  function render(): void {
    ring!.style.setProperty('--pos', pos.toFixed(4));
    const index = Math.round(pos);
    if (index === current) return;
    current = index;
    items.forEach((item, i) => {
      const far = Math.abs(i - pos) > VISIBLE + 0.5;
      item.classList.toggle('is-far', far);
      item.classList.toggle('is-current', i === index);
      // Nur die Karte in der Mitte ist per Tab erreichbar; die übrigen über die Pfeiltasten
      item.querySelector('a')?.setAttribute('tabindex', i === index ? '0' : '-1');
    });
    const item = items[index];
    const link = item?.querySelector('a');
    if (meta) meta.textContent = item?.dataset.meta ?? '';
    if (title && link) {
      title.textContent = item?.dataset.title ?? '';
      title.href = link.href;
    }
    if (bar) bar.style.width = `${((index + 1) / n) * 100}%`;
    if (count) count.textContent = `${index + 1} / ${n}`;
    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === n - 1;
  }

  function tick(): void {
    const diff = target - pos;
    pos = Math.abs(diff) < 0.001 ? target : pos + diff * 0.14;
    render();
    frame = pos === target ? 0 : requestAnimationFrame(tick);
  }

  function goTo(value: number, snap = true): void {
    target = clamp(snap ? Math.round(value) : value);
    if (!frame) frame = requestAnimationFrame(tick);
  }

  // Ziehen (Maus, Finger, Stift); ein kurzer Klick bleibt ein Klick
  let dragStart: { x: number; target: number; t: number } | null = null;
  let dragged = false;
  let lastX = 0;
  let lastT = 0;
  let velocity = 0;
  const pxPerCard = () => (items[0]?.offsetWidth || 240) + GAP;

  on(stage, 'pointerdown', (event) => {
    const e = event as PointerEvent;
    if (!active || e.button !== 0) return;
    dragStart = { x: e.clientX, target, t: e.timeStamp };
    dragged = false;
    lastX = e.clientX;
    lastT = e.timeStamp;
    velocity = 0;
  });
  on(window, 'pointermove', (event) => {
    const e = event as PointerEvent;
    if (!dragStart) return;
    const dx = e.clientX - dragStart.x;
    if (!dragged && Math.abs(dx) > 6) {
      dragged = true;
      stage.classList.add('is-dragging');
      stage.setPointerCapture?.(e.pointerId);
    }
    if (!dragged) return;
    const dt = Math.max(1, e.timeStamp - lastT);
    velocity = (e.clientX - lastX) / dt;
    lastX = e.clientX;
    lastT = e.timeStamp;
    goTo(dragStart.target - dx / pxPerCard(), false);
  });
  const endDrag = () => {
    if (!dragStart) return;
    if (dragged) goTo(target - velocity * 3);
    dragStart = null;
    stage.classList.remove('is-dragging');
  };
  // Bilder nicht als Datei ziehen lassen (sonst bricht das Ziehen des Rads ab)
  on(stage, 'dragstart', (event) => event.preventDefault());
  on(window, 'pointerup', endDrag);
  on(window, 'pointercancel', endDrag);

  // Klick: Seitenkarte holt sie in die Mitte, nach dem Ziehen wird nichts geöffnet
  on(
    ring,
    'click',
    (event) => {
      if (!active) return;
      const item = (event.target as Element).closest<HTMLElement>('.home-carousel__item');
      if (!item) return;
      const index = Number(item.dataset.index);
      if (dragged || index !== Math.round(target)) {
        event.preventDefault();
        if (!dragged) goTo(index);
      }
      dragged = false;
    },
    { capture: true },
  );

  // Waagerecht scrollen (Trackpad) oder Umschalt + Mausrad; senkrechtes Scrollen bleibt der Seite
  let wheelSnap = 0;
  on(
    stage,
    'wheel',
    (event) => {
      const e = event as WheelEvent;
      if (!active) return;
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!delta) return;
      e.preventDefault();
      goTo(target + delta / pxPerCard(), false);
      clearTimeout(wheelSnap);
      wheelSnap = window.setTimeout(() => goTo(target), 140);
    },
    { passive: false },
  );

  on(root, 'keydown', (event) => {
    const e = event as KeyboardEvent;
    if (!active) return;
    const step = { ArrowLeft: -1, ArrowRight: 1, Home: -n, End: n }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    goTo(Math.round(target) + step);
    // Fokus folgt der Karte in der Mitte
    requestAnimationFrame(() => items[Math.round(target)]?.querySelector('a')?.focus({ preventScroll: true }));
  });

  if (prev) on(prev, 'click', () => goTo(Math.round(target) - 1));
  if (next) on(next, 'click', () => goTo(Math.round(target) + 1));

  function setMode(): void {
    active = wide.matches;
    root.classList.toggle('is-3d', active);
    if (active) {
      layout();
      current = -1;
      render();
    } else {
      for (const item of items) {
        item.classList.remove('is-far', 'is-current');
        item.querySelector('a')?.removeAttribute('tabindex');
      }
    }
  }
  setMode();
  on(wide, 'change', setMode);
  on(window, 'resize', () => active && layout());

  return () => {
    cancelAnimationFrame(frame);
    clearTimeout(wheelSnap);
    for (const [t, type, listener, options] of listeners) t.removeEventListener(type, listener, options);
  };
}
