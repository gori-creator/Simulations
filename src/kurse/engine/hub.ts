import type { Lang } from '../../i18n/config';
import { getCourse, lessonsOf } from '../index';
import { ks } from '../strings';
import { bitSvg } from './bit';
import { exportCode, importCode, isUnlocked, levelFor, nextLesson, type Progress } from './progress';
import { storeFor } from './store';

/**
 * Karte eines Kurses: zeigt den Spielstand aus dem Browser an (Sterne,
 * gesperrte Lektionen, Stufe, Abzeichen) und bietet Sichern/Laden per Code.
 * Ohne JavaScript bleibt die Karte eine normale Liste mit Links.
 */
export function initHub(root: HTMLElement): void {
  const lang = (root.dataset.lang === 'en' ? 'en' : 'de') satisfies Lang;
  const course = getCourse(root.dataset.course!);
  const store = storeFor(course.id);
  const lessons = lessonsOf(course).filter((l) => l.status === 'ready');
  const q = <T extends Element>(selector: string) => root.querySelector<T>(selector);

  function render(p: Progress): void {
    const info = levelFor(p.xp);
    const done = lessons.filter((l) => p.lessons[l.id]).length;

    // Bit und Stufe
    const bit = q<HTMLElement>('[data-hub-bit]');
    if (bit) bit.innerHTML = bitSvg(done === 0 ? 'wink' : 'happy', info.level, ks(lang, 'navLabel'));
    q('[data-hub-level]')!.textContent = ks(lang, 'levelName', { n: info.level, name: info.name[lang] });
    q('[data-hub-xp]')!.textContent = info.max ? `${ks(lang, 'xp', { n: p.xp })} · ${ks(lang, 'levelMax')}` : `${ks(lang, 'xp', { n: p.xp })} · ${ks(lang, 'levelNext', { n: info.need - info.into, next: info.level + 1 })}`;
    const fill = q<HTMLElement>('[data-hub-bar]');
    fill?.style.setProperty('--p', `${info.max ? 100 : Math.round((100 * info.into) / info.need)}%`);
    q('[data-hub-done]')!.textContent = ks(lang, 'overall', { done, total: lessons.length });
    const streak = q<HTMLElement>('[data-hub-streak]')!;
    streak.hidden = p.streak.days < 2;
    streak.textContent = `🔥 ${ks(lang, 'streak', { n: p.streak.days })}`;

    // Weiter-Knopf
    const nextId = nextLesson(p, course);
    const go = q<HTMLAnchorElement>('[data-hub-go]')!;
    const goLabel = q('[data-hub-go-label]')!;
    if (nextId) {
      const node = q<HTMLAnchorElement>(`[data-lesson="${nextId}"]`);
      const title = node?.dataset.title ?? '';
      go.href = node?.href ?? go.href;
      goLabel.textContent = done === 0 ? ks(lang, 'startAt', { title }) : ks(lang, 'continueAt', { title });
    } else {
      goLabel.textContent = ks(lang, 'allDone');
      go.href = q<HTMLAnchorElement>('[data-lesson]')?.href ?? go.href;
    }

    // Lektionen
    for (const node of root.querySelectorAll<HTMLAnchorElement>('[data-lesson]')) {
      const id = node.dataset.lesson!;
      const record = p.lessons[id];
      const open = isUnlocked(p, course, id);
      node.classList.toggle('is-done', !!record);
      node.classList.toggle('is-locked', !open);
      node.classList.toggle('is-next', id === nextId);
      if (open) node.removeAttribute('aria-disabled');
      else node.setAttribute('aria-disabled', 'true');
      const state = node.querySelector('[data-state]');
      if (state) state.textContent = record ? ks(lang, 'stars', { n: record.stars }) : open ? '' : `${ks(lang, 'locked')} – ${ks(lang, 'lockedHint')}`;
      node.querySelectorAll('[data-star]').forEach((star, i) => star.classList.toggle('is-on', !!record && i < record.stars));
    }

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
    const p = importCode(input.value);
    if (msg) msg.textContent = p ? ks(lang, 'loadOk') : ks(lang, 'loadBad');
    if (!p) return;
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
