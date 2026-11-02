import type { Lang } from '../../i18n/config';
import { getCourse, lessonsOf } from '../index';
import { ks } from '../strings';
import { guideSvg } from './guide';
import { exportCode, importCode, isUnlocked, levelFor, mergeProgress, nextLesson, type Progress } from './progress';
import { storeFor } from './store';

/**
 * Karte eines Kurses: zeigt den Spielstand aus dem Browser an (Sterne,
 * gesperrte Lektionen, Welten, Stufe, Wissenskarten, Abzeichen) und bietet
 * Sichern/Laden per Code. Ohne JavaScript bleibt die Karte eine Liste mit Links.
 */
export function initHub(root: HTMLElement): void {
  const lang = (root.dataset.lang === 'en' ? 'en' : 'de') satisfies Lang;
  const course = getCourse(root.dataset.course!);
  const store = storeFor(course.id);
  const lessons = lessonsOf(course).filter((l) => l.status === 'ready');
  const q = <T extends Element>(selector: string) => root.querySelector<T>(selector);

  function render(p: Progress): void {
    const info = levelFor(p.xp, course.levels);
    const done = lessons.filter((l) => p.lessons[l.id]).length;

    // Figur und Stufe
    const guide = q<HTMLElement>('[data-hub-bit]');
    if (guide) guide.innerHTML = guideSvg(course.guide, done === 0 ? 'wink' : 'happy', info.level, course.guideName);
    q('[data-hub-level]')!.textContent = ks(lang, 'levelName', { n: info.level, name: info.name[lang] });
    q('[data-hub-xp]')!.textContent = info.max ? `${ks(lang, 'xp', { n: p.xp })} · ${ks(lang, 'levelMax')}` : `${ks(lang, 'xp', { n: p.xp })} · ${ks(lang, 'levelNext', { n: info.need - info.into, next: info.level + 1 })}`;
    q<HTMLElement>('[data-hub-bar]')?.style.setProperty('--p', `${info.max ? 100 : Math.round((100 * info.into) / info.need)}%`);
    q('[data-hub-done]')!.textContent = ks(lang, 'overall', { done, total: lessons.length });
    const streak = q<HTMLElement>('[data-hub-streak]')!;
    streak.hidden = p.streak.days < 2;
    streak.textContent = `🔥 ${ks(lang, 'streak', { n: p.streak.days })}`;

    // Weiter-Knopf
    const nextId = nextLesson(p, course);
    const go = q<HTMLAnchorElement>('[data-hub-go]');
    const goLabel = q('[data-hub-go-label]');
    if (go && goLabel) {
      if (nextId) {
        const node = q<HTMLAnchorElement>(`[data-lesson="${nextId}"]`);
        const title = node?.dataset.title ?? '';
        go.href = node?.href ?? go.href;
        goLabel.textContent = done === 0 ? ks(lang, 'startAt', { title }) : ks(lang, 'continueAt', { title });
      } else {
        goLabel.textContent = ks(lang, 'allDone');
        go.href = q<HTMLAnchorElement>('[data-lesson]')?.href ?? go.href;
      }
    }

    // Lektionen auf dem Pfad
    for (const node of root.querySelectorAll<HTMLAnchorElement>('[data-lesson]')) {
      const id = node.dataset.lesson!;
      const record = p.lessons[id];
      const open = isUnlocked(p, course, id);
      const item = node.closest('.ktrail__item');
      for (const el of [node, item]) {
        el?.classList.toggle('is-done', !!record);
        el?.classList.toggle('is-locked', !open);
        el?.classList.toggle('is-next', id === nextId);
      }
      if (open) node.removeAttribute('aria-disabled');
      else node.setAttribute('aria-disabled', 'true');
      const state = node.querySelector('[data-state]');
      if (state) state.textContent = record ? ks(lang, 'stars', { n: record.stars }) : open ? '' : `${ks(lang, 'locked')} – ${ks(lang, 'lockedHint')}`;
      node.querySelectorAll('[data-star]').forEach((star, i) => star.classList.toggle('is-on', !!record && i < record.stars));
    }

    // Welten
    for (const world of root.querySelectorAll<HTMLElement>('[data-world]')) {
      const ids = [...world.querySelectorAll<HTMLElement>('[data-lesson]')].map((n) => n.dataset.lesson!);
      const n = ids.filter((id) => p.lessons[id]).length;
      world.classList.toggle('is-complete', ids.length > 0 && n === ids.length);
      const count = world.querySelector('[data-world-count]');
      if (count) count.textContent = ks(lang, 'worldProgress', { done: n, total: ids.length });
    }

    // Wissenskarten
    const cards = root.querySelectorAll<HTMLElement>('[data-card]');
    let owned = 0;
    for (const card of cards) {
      const has = !!p.lessons[card.dataset.card!];
      card.classList.toggle('is-earned', has);
      if (has) owned += 1;
    }
    const albumCount = q('[data-album-count]');
    if (albumCount) albumCount.textContent = ks(lang, 'albumCount', { n: owned, total: cards.length });

    // Abzeichen
    let earned = 0;
    for (const badge of root.querySelectorAll<HTMLElement>('[data-badge]')) {
      const has = p.badges.includes(badge.dataset.badge!);
      badge.classList.toggle('is-earned', has);
      if (has) earned += 1;
    }
    const count = q('[data-hub-badges]');
    if (count) count.textContent = `${earned} / ${root.querySelectorAll('[data-badge]').length}`;

    // Einstellungen
    const free = q<HTMLInputElement>('[data-hub-free]');
    if (free) free.checked = p.free;
    const code = q<HTMLInputElement>('[data-hub-code]');
    if (code) code.value = exportCode(p);
  }

  // Gesperrte Lektion angetippt: Hinweis statt Navigation
  const toast = q<HTMLElement>('[data-hub-toast]');
  let toastTimer = 0;
  root.addEventListener('click', (event) => {
    const node = (event.target as Element).closest<HTMLAnchorElement>('[data-lesson]');
    if (!node?.classList.contains('is-locked')) return;
    event.preventDefault();
    if (!toast) return;
    toast.textContent = `🔒 ${ks(lang, 'lockedHint')}`;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => (toast.hidden = true), 2600);
  });

  q<HTMLInputElement>('[data-hub-free]')?.addEventListener('change', (event) => {
    const p = store.load();
    p.free = (event.target as HTMLInputElement).checked;
    store.save(p);
    render(p);
  });

  const copyBtn = q<HTMLButtonElement>('[data-hub-copy]');
  copyBtn?.addEventListener('click', async () => {
    const code = q<HTMLInputElement>('[data-hub-code]')!;
    code.select();
    try {
      await navigator.clipboard.writeText(code.value);
    } catch {
      // Ohne Zwischenablage bleibt der Code markiert und lässt sich von Hand kopieren
      return;
    }
    copyBtn.textContent = ks(lang, 'saveCopied');
    setTimeout(() => (copyBtn.textContent = ks(lang, 'saveCopy')), 1800);
  });

  const msg = q<HTMLElement>('[data-hub-msg]');
  q<HTMLButtonElement>('[data-hub-load]')?.addEventListener('click', () => {
    const input = q<HTMLInputElement>('[data-hub-import]')!;
    const imported = importCode(input.value);
    if (msg) msg.textContent = imported ? ks(lang, 'loadOk') : ks(lang, 'loadBad');
    if (!imported) return;
    // Zusammenführen statt Überschreiben: nichts geht verloren
    const p = mergeProgress(store.load(), imported);
    store.save(p);
    input.value = '';
    render(p);
  });

  q<HTMLButtonElement>('[data-hub-reset]')?.addEventListener('click', () => {
    if (!confirm(ks(lang, 'resetConfirm'))) return;
    store.clear();
    render(store.load());
  });

  render(store.load());
  root.classList.add('is-ready');
  // Zurück aus einer Lektion (Seite aus dem Verlauf): Stand neu lesen
  addEventListener('pageshow', () => render(store.load()));
}
