/**
 * Simulationsseite: das Lernmaterial lebendiger machen (SimulationView.astro).
 *
 * Alles hier ist Zugabe; ohne Skript bleibt das Lernmaterial normaler Fließtext.
 * - Jeder Abschnitt (## Überschrift bis zur nächsten) wird ein eigener Block mit
 *   einer kleinen Illustration neben der Überschrift (Bild aus
 *   src/assets/abschnitte/ oder ein gezeichnetes Symbol).
 * - „Ausprobieren“: Die Schritte lassen sich abhaken, mit Fortschrittsbalken.
 *   Gespeichert wird nur im Browser (localStorage, je Simulation).
 * - „Aufgaben“: jede Aufgabe (### bis zur nächsten) als Karte.
 * - Inhaltsverzeichnis rechts: markiert den Abschnitt, der gerade zu sehen ist.
 * - Abschnitte gleiten beim Scrollen herein (nicht bei reduzierter Bewegung).
 */
import { SECTION_KEYS, type SectionKey } from './page-art';

/** Gezeichnete Symbole (24 × 24, Linien), falls keine Illustration vorliegt. */
const ICONS: Record<SectionKey, string> = {
  'worum-geht-es': 'M9 18h6 M10 21h4 M12 3a6 6 0 0 0-3.6 10.8c.6.5 1.1 1.3 1.1 2.1V16h5v-.1c0-.8.5-1.6 1.1-2.1A6 6 0 0 0 12 3z',
  ausprobieren: 'M4 7h10 M18 7h2 M16 5v4 M4 17h4 M12 17h8 M10 15v4',
  aufgaben: 'M7 3h8l4 4v14H7z M15 3v4h4 M10 13l2 2 4-4',
  unterricht: 'M3 5h18v11H3z M8 21l4-5 4 5 M7 12c2-4 4-4 5-2s3 2 5-2',
  'weiter-lernen': 'M4 19c4 0 4-6 8-6s4-6 8-6 M17 4l3 3-3 3',
};

const svgIcon = (key: SectionKey) =>
  `<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="${ICONS[key]}"/></svg>`;

function storageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* privater Modus o. Ä.: Fortschritt gilt dann nur bis zum Neuladen */
  }
}

export function initMaterial(): void {
  const article = document.querySelector<HTMLElement>('[data-sim-material]');
  if (!article) return;
  const art = JSON.parse(article.dataset.art ?? '{}') as Partial<Record<SectionKey, string | null>>;
  const labels = JSON.parse(article.dataset.labels ?? '{}') as { tried: string; markTried: string };
  const simId = article.dataset.simId ?? '';
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('motion-paused');

  /* ---------- Symbol neben „Weiter lernen“ (fehlt dort ein Bild) ---------- */
  for (const slot of document.querySelectorAll<HTMLElement>('[data-art-key]')) {
    if (!slot.querySelector('img')) slot.innerHTML = svgIcon(slot.dataset.artKey as SectionKey);
  }

  /* ---------- Abschnitte bilden ---------- */
  const sections: HTMLElement[] = [];
  const headings = [...article.querySelectorAll<HTMLHeadingElement>(':scope > h2')];
  headings.forEach((h2, index) => {
    const key: SectionKey = SECTION_KEYS[index] ?? 'worum-geht-es';
    const section = document.createElement('section');
    section.className = `mat-section mat-section--${key}`;
    section.dataset.key = key;
    h2.before(section);
    // Überschrift und alles bis zur nächsten ## in den Abschnitt
    let node: ChildNode | null = h2;
    while (node && !(node !== h2 && node instanceof HTMLHeadingElement && node.tagName === 'H2')) {
      const next: ChildNode | null = node.nextSibling;
      section.append(node);
      node = next;
    }
    // Kopf mit Illustration
    const head = document.createElement('div');
    head.className = 'mat-section__head';
    const icon = document.createElement('span');
    icon.className = 'mat-icon';
    icon.setAttribute('aria-hidden', 'true');
    const src = art[key];
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.width = 84;
      img.height = 84;
      img.decoding = 'async';
      icon.append(img);
    } else icon.innerHTML = svgIcon(key);
    h2.before(head);
    head.append(icon, h2);
    sections.push(section);
  });

  /* ---------- Ausprobieren: abhaken mit Fortschritt ---------- */
  const trySection = sections.find((s) => s.dataset.key === 'ausprobieren');
  const list = trySection?.querySelector<HTMLOListElement>(':scope > ol');
  if (trySection && list) {
    const items = [...list.children].filter((el): el is HTMLLIElement => el instanceof HTMLLIElement);
    const storeKey = `scitura-tried-${simId}`;
    const done = new Set<number>(JSON.parse(storageGet(storeKey) ?? '[]') as number[]);
    const bar = document.createElement('div');
    bar.className = 'mat-progress';
    bar.innerHTML = '<span class="mat-progress__track"><span class="mat-progress__fill"></span></span><span class="mat-progress__text" aria-live="polite"></span>';
    list.before(bar);
    list.classList.add('mat-checklist');
    const update = () => {
      const n = items.filter((_, i) => done.has(i)).length;
      bar.querySelector<HTMLElement>('.mat-progress__fill')!.style.width = `${(100 * n) / Math.max(1, items.length)}%`;
      bar.querySelector<HTMLElement>('.mat-progress__text')!.textContent = labels.tried.replace('{n}', String(n)).replace('{total}', String(items.length));
      bar.classList.toggle('is-complete', n === items.length);
    };
    items.forEach((li, i) => {
      const box = document.createElement('button');
      box.type = 'button';
      box.className = 'mat-check';
      box.setAttribute('aria-label', labels.markTried);
      box.setAttribute('aria-pressed', String(done.has(i)));
      li.classList.toggle('is-done', done.has(i));
      box.addEventListener('click', () => {
        if (done.has(i)) done.delete(i);
        else done.add(i);
        box.setAttribute('aria-pressed', String(done.has(i)));
        li.classList.toggle('is-done', done.has(i));
        storageSet(storeKey, JSON.stringify([...done]));
        update();
      });
      li.prepend(box);
    });
    update();
  }

  /* ---------- Aufgaben als Karten ---------- */
  const taskSection = sections.find((s) => s.dataset.key === 'aufgaben');
  if (taskSection) {
    // Aufgabenkopf: ### Überschrift oder (mit „Aufgabe laden“) ein div.task-head darum
    const isHead = (node: ChildNode | null): node is HTMLElement =>
      node instanceof HTMLElement && (node.tagName === 'H3' || node.tagName === 'H2' || node.classList.contains('task-head'));
    for (const head of [...taskSection.querySelectorAll<HTMLElement>(':scope > h3, :scope > .task-head')]) {
      const card = document.createElement('div');
      card.className = 'mat-task';
      head.before(card);
      let node: ChildNode | null = head;
      while (node && !(node !== head && isHead(node))) {
        const next: ChildNode | null = node.nextSibling;
        card.append(node);
        node = next;
      }
    }
  }

  /* ---------- Inhaltsverzeichnis: aktuellen Abschnitt markieren ---------- */
  const tocLinks = [...document.querySelectorAll<HTMLAnchorElement>('.aside-box--toc a')];
  if (tocLinks.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!hit) return;
        const id = hit.target.querySelector('h2')?.id;
        for (const a of tocLinks) {
          const on = a.hash === `#${id}`;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        }
      },
      { rootMargin: '-25% 0px -65% 0px' },
    );
    for (const section of sections) spy.observe(section);
  }

  /* ---------- Einblenden beim Scrollen (nur Abschnitte unterhalb des sichtbaren Bereichs) ---------- */
  if (!calm && 'IntersectionObserver' in window) {
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          reveal.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    const blocks = [...sections, ...document.querySelectorAll<HTMLElement>('.sim-next')];
    for (const block of blocks) {
      if (block.getBoundingClientRect().top < innerHeight) continue;
      block.classList.add('reveal');
      reveal.observe(block);
    }
  }
}
