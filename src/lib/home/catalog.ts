/**
 * Startseite: Simulationskatalog (HomeCatalog.astro).
 *
 * Grundansicht sind Themenreihen (je Bereich eine seitlich wischbare Reihe).
 * Die Fachknöpfe blenden die Reihen der anderen Fächer aus. Sobald gesucht oder
 * nach Klassenstufe gefiltert wird, erscheint stattdessen ein Raster mit den
 * Treffern; gefiltert wird über die data-Attribute der Karten wie im Katalog
 * (src/views/CatalogView.astro).
 *
 * Dazu: Pfeile zum Blättern in den Reihen und eine sanfte Einblendung der
 * Reihen (nicht bei reduzierter oder pausierter Bewegung).
 */
import { matchesWords, normalizeSearch, searchWords } from '../search';

export function initCatalog(root: HTMLElement): () => void {
  const grid = root.querySelector<HTMLElement>('[data-catalog-grid]')!;
  const cards = [...grid.querySelectorAll<HTMLElement>('[data-sim-card]')];
  const rowsBox = root.querySelector<HTMLElement>('[data-catalog-rows]')!;
  const rows = [...root.querySelectorAll<HTMLElement>('[data-row]')];
  const subjects = [...root.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const search = root.querySelector<HTMLInputElement>('[data-catalog-search]')!;
  const grade = root.querySelector<HTMLSelectElement>('[data-catalog-grade]')!;
  const count = root.querySelector<HTMLElement>('[data-catalog-count]')!;
  const empty = root.querySelector<HTMLElement>('[data-catalog-empty]')!;
  const emptyTitle = empty.querySelector<HTMLElement>('[data-empty-title]')!;
  const emptyText = empty.querySelector<HTMLElement>('[data-empty-text]')!;
  const clear = empty.querySelector<HTMLButtonElement>('[data-catalog-clear]')!;
  const total = cards.length;
  const lang = document.documentElement.lang || 'de';
  const cleanup: (() => void)[] = [];
  let subject = 'all';

  // Vereinheitlichter Suchtext je Karte (Regel in lib/search.ts, gleich wie im Katalog)
  const texts = new Map(cards.map((card) => [card, normalizeSearch(card.dataset.search ?? '', lang)]));

  /* ---------- Filter und Ansicht ---------- */
  function apply(): void {
    const words = searchWords(search.value, lang);
    const [from, to] = grade.value ? grade.value.split('-').map(Number) : [];
    const asGrid = words.length > 0 || from !== undefined;
    let shown = 0;
    if (asGrid) {
      for (const card of cards) {
        const d = card.dataset;
        const match =
          (subject === 'all' || d.subject === subject) &&
          (from === undefined || (Number(d.gradeFrom) <= (to ?? from) && from <= Number(d.gradeTo))) &&
          matchesWords(texts.get(card) ?? '', words);
        card.hidden = !match;
        if (match) shown++;
      }
    } else {
      for (const row of rows) {
        const visible = subject === 'all' || row.dataset.subject === subject;
        row.hidden = !visible;
        if (visible) shown += row.querySelectorAll('[data-sim-card]').length;
      }
    }
    grid.hidden = !asGrid || shown === 0;
    rowsBox.hidden = asGrid || shown === 0;
    count.textContent = (count.dataset.template ?? '{n}').replace('{n}', String(shown)).replace('{total}', String(total));
    empty.hidden = shown > 0;
    const chemistry = subject === 'chemie';
    emptyTitle.textContent = (chemistry ? empty.dataset.chemTitle : empty.dataset.title) ?? '';
    emptyText.textContent = (chemistry ? empty.dataset.chemText : empty.dataset.text) ?? '';
    if (!asGrid) for (const row of rows) updateArrows(row);
  }

  function choose(id: string): void {
    subject = id;
    for (const button of subjects) button.setAttribute('aria-pressed', String(button.dataset.filter === id));
    apply();
  }

  const onSubject = (event: Event) => choose((event.currentTarget as HTMLButtonElement).dataset.filter ?? 'all');
  const onClear = () => {
    search.value = '';
    grade.value = '';
    choose('all');
  };
  for (const button of subjects) button.addEventListener('click', onSubject);
  search.addEventListener('input', apply);
  grade.addEventListener('change', apply);
  clear.addEventListener('click', onClear);
  cleanup.push(() => {
    for (const button of subjects) button.removeEventListener('click', onSubject);
    search.removeEventListener('input', apply);
    grade.removeEventListener('change', apply);
    clear.removeEventListener('click', onClear);
  });

  /* ---------- Blättern in den Reihen ---------- */
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const calm = () => reduce.matches || document.documentElement.classList.contains('motion-paused');

  function updateArrows(row: HTMLElement): void {
    const track = row.querySelector<HTMLElement>('[data-row-track]')!;
    const max = track.scrollWidth - track.clientWidth;
    row.querySelector<HTMLButtonElement>('[data-row-prev]')!.disabled = track.scrollLeft <= 2;
    row.querySelector<HTMLButtonElement>('[data-row-next]')!.disabled = track.scrollLeft >= max - 2;
    row.classList.toggle('is-scrollable', max > 2);
  }

  for (const row of rows) {
    const track = row.querySelector<HTMLElement>('[data-row-track]')!;
    const page = (dir: number) => () => track.scrollBy({ left: dir * track.clientWidth * 0.85, behavior: calm() ? 'auto' : 'smooth' });
    const prev = page(-1);
    const next = page(1);
    const onScroll = () => updateArrows(row);
    row.querySelector('[data-row-prev]')!.addEventListener('click', prev);
    row.querySelector('[data-row-next]')!.addEventListener('click', next);
    track.addEventListener('scroll', onScroll, { passive: true });
    cleanup.push(() => {
      row.querySelector('[data-row-prev]')!.removeEventListener('click', prev);
      row.querySelector('[data-row-next]')!.removeEventListener('click', next);
      track.removeEventListener('scroll', onScroll);
    });
  }
  const onResize = () => rows.forEach(updateArrows);
  window.addEventListener('resize', onResize, { passive: true });
  cleanup.push(() => window.removeEventListener('resize', onResize));

  /* ---------- Einblenden beim Scrollen ---------- */
  if (!calm() && 'IntersectionObserver' in window) {
    root.classList.add('reveal-rows');
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-in');
          reveal.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    for (const row of rows) reveal.observe(row);
    cleanup.push(() => reveal.disconnect());
  }

  apply();

  return () => {
    for (const fn of cleanup) fn();
  };
}
