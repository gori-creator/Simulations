/**
 * Startseite: Filter für den Simulationskatalog (Fach, Suche, Klassenstufe).
 * Die Karten selbst sind die normalen Simulationskarten (SimCard) aus dem
 * aktuellen Lehrplan; gefiltert wird über ihre data-Attribute wie im Katalog
 * (src/views/CatalogView.astro).
 */
export function initCatalog(root: HTMLElement): () => void {
  const cards = [...root.querySelectorAll<HTMLElement>('[data-sim-card]')];
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
  let subject = 'all';

  // Groß/klein, Akzente und ß egal („Große Zahlen“ findet auch „grosse zahlen“)
  const normalize = (s: string) =>
    s
      .toLocaleLowerCase(lang)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/ß/g, 'ss');

  function apply(): void {
    const words = normalize(search.value.trim()).split(/\s+/).filter(Boolean);
    const [from, to] = grade.value ? grade.value.split('-').map(Number) : [];
    let shown = 0;
    for (const card of cards) {
      const d = card.dataset;
      const match =
        (subject === 'all' || d.subject === subject) &&
        (from === undefined || (Number(d.gradeFrom) <= (to ?? from) && from <= Number(d.gradeTo))) &&
        words.every((w) => normalize(d.search ?? '').includes(w));
      card.hidden = !match;
      if (match) shown++;
    }
    count.textContent = (count.dataset.template ?? '{n}').replace('{n}', String(shown)).replace('{total}', String(total));
    empty.hidden = shown > 0;
    const chemistry = subject === 'chemie';
    emptyTitle.textContent = (chemistry ? empty.dataset.chemTitle : empty.dataset.title) ?? '';
    emptyText.textContent = (chemistry ? empty.dataset.chemText : empty.dataset.text) ?? '';
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
  apply();

  return () => {
    for (const button of subjects) button.removeEventListener('click', onSubject);
    search.removeEventListener('input', apply);
    grade.removeEventListener('change', apply);
    clear.removeEventListener('click', onClear);
  };
}
