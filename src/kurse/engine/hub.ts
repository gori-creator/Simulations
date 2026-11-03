import type { Lang, Localized } from '../../i18n/config';
import { getCourse, lessonsOf } from '../index';
import { loadLesson } from '../loaders';
import { ks } from '../strings';
import { clear, h } from './dom';
import { guideSvg } from './guide';
import { dayKey, daysBetween, exportCode, finishReview, importCode, isUnlocked, levelFor, mergeProgress, nextLesson, type Progress } from './progress';
import { pickQuestions, questionsOf, type ReviewQuestion } from './review';
import { storeFor } from './store';

/** Fragen je Wiederholung und Tage, nach denen Wiederholen wieder „dran“ ist. */
const REVIEW_COUNT = 5;
const REVIEW_AFTER_DAYS = 3;

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
    const today = dayKey(new Date());
    for (const world of root.querySelectorAll<HTMLElement>('[data-world]')) {
      const ids = [...world.querySelectorAll<HTMLElement>('[data-lesson]')].map((n) => n.dataset.lesson!);
      const n = ids.filter((id) => p.lessons[id]).length;
      world.classList.toggle('is-complete', ids.length > 0 && n === ids.length);
      const count = world.querySelector('[data-world-count]');
      if (count) count.textContent = ks(lang, 'worldProgress', { done: n, total: ids.length });

      // Spickzettel: Merksätze geschaffter Lektionen
      const notes = [...world.querySelectorAll<HTMLElement>('[data-note]')];
      let open = 0;
      for (const note of notes) {
        const has = !!p.lessons[note.dataset.note!] || p.free;
        note.classList.toggle('is-done', has);
        if (has) open += 1;
      }
      const notesCount = world.querySelector('[data-notes-count]');
      if (notesCount) notesCount.textContent = `(${open}/${notes.length})`;

      // Wiederholen: ab einer geschafften Lektion; „dran“ ohne Wiederholung oder nach ein paar Tagen
      const review = world.querySelector<HTMLButtonElement>('[data-review]');
      const record = p.reviews[world.dataset.world!];
      if (review) review.disabled = n === 0 && !p.free;
      const due = world.querySelector<HTMLElement>('[data-review-due]');
      if (due) due.hidden = n === 0 || (!!record && daysBetween(record.last, today) < REVIEW_AFTER_DAYS);
      const info = world.querySelector<HTMLElement>('[data-review-info]');
      if (info) {
        if (!record) info.textContent = '';
        else {
          const ago = daysBetween(record.last, today);
          const when = ago <= 0 ? ks(lang, 'reviewToday') : ago === 1 ? ks(lang, 'reviewYesterday') : ks(lang, 'reviewDays', { n: ago });
          info.textContent = `${ks(lang, 'reviewBest', { best: record.best, total: record.total })} · ${when}`;
        }
      }
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
    try {
      localStorage.removeItem(`kurs:${course.id}:ichkann`);
    } catch {
      // nichts zu löschen
    }
    render(store.load());
    renderCan();
  });

  // ---------- Wiederholen (Dialog) ----------
  const dialog = q<HTMLDialogElement>('[data-review-dialog]');
  const body = q<HTMLElement>('[data-review-body]');
  const heading = q<HTMLElement>('[data-review-heading]');
  const tx = (text: Localized) => text[lang];

  async function openReview(button: HTMLButtonElement): Promise<void> {
    if (!dialog || !body) return;
    const worldId = button.dataset.review!;
    const chapter = course.chapters.find((c) => c.id === worldId);
    if (!chapter) return;
    const p = store.load();
    const ids = chapter.lessons.filter((l) => l.status === 'ready' && (p.lessons[l.id] || p.free)).map((l) => l.id);
    if (heading) heading.textContent = button.dataset.reviewTitle ?? '';
    clear(body);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    if (ids.length === 0) {
      body.append(h('p', { text: ks(lang, 'reviewEmpty') }));
      return;
    }
    body.append(h('p', { class: 'kreview__loading', text: ks(lang, 'loading', { name: course.guideName }) }));
    const contents = await Promise.all(ids.map(async (id) => ({ id, content: await loadLesson(course.id, id) })));
    const questions = pickQuestions(questionsOf(contents), REVIEW_COUNT);
    let index = 0;
    let correct = 0;

    const showQuestion = (question: ReviewQuestion) => {
      clear(body);
      const feedback = h('p', { class: 'kreview__feedback', attrs: { 'aria-live': 'polite' } });
      const next = h('button', { class: 'btn btn--primary', attrs: { type: 'button', hidden: true }, text: index < questions.length - 1 ? `${ks(lang, 'reviewNext')} →` : ks(lang, 'reviewFinish') });
      const options = h('div', { class: 'kchoice', attrs: { role: 'group', 'aria-label': tx(question.question) } });
      for (const option of question.options) {
        const b = h('button', { class: 'kchoice__opt', attrs: { type: 'button' }, text: tx(option.text) });
        b.addEventListener('click', () => {
          for (const other of options.querySelectorAll<HTMLButtonElement>('button')) other.disabled = true;
          if (option.correct) correct += 1;
          b.classList.add(option.correct ? 'is-right' : 'is-wrong');
          if (!option.correct) {
            const right = question.options.findIndex((o) => o.correct);
            options.querySelectorAll<HTMLButtonElement>('button')[right]?.classList.add('is-right');
          }
          feedback.textContent = `${option.correct ? '✅' : '💡'} ${option.feedback ? tx(option.feedback) : ''}`.trim();
          next.hidden = false;
          next.focus();
        });
        options.append(b);
      }
      next.addEventListener('click', () => {
        index += 1;
        if (index < questions.length) showQuestion(questions[index]!);
        else showResult();
      });
      body.append(
        h('p', { class: 'kreview__intro', text: index === 0 ? ks(lang, 'reviewIntro') : '' }),
        h('p', { class: 'kreview__count', text: ks(lang, 'reviewQuestion', { n: index + 1, total: questions.length }) }),
        h('p', { class: 'kreview__question', text: tx(question.question) }),
        options,
        feedback,
        h('div', { class: 'kreview__actions' }, next),
      );
      options.querySelector<HTMLButtonElement>('button')?.focus();
    };

    const showResult = () => {
      const result = finishReview(store.load(), course, worldId, correct, questions.length, dayKey(new Date()));
      store.save(result.progress);
      clear(body);
      const share = correct / questions.length;
      body.append(
        h('p', { class: 'kreview__score', text: ks(lang, 'reviewResult', { n: correct, total: questions.length }) }),
        h('p', { text: share === 1 ? ks(lang, 'reviewPerfect') : share >= 0.6 ? ks(lang, 'reviewGood') : ks(lang, 'reviewTry') }),
      );
      if (result.xpGained > 0) body.append(h('p', { class: 'kend__xp', text: ks(lang, 'xpGained', { n: result.xpGained }) }));
      for (const badge of result.newBadges) body.append(h('div', { class: 'kbadge kbadge--new' }, h('span', { class: 'kbadge__icon', text: badge.icon }), h('span', {}, h('small', { text: ks(lang, 'newBadge') }), h('strong', { text: tx(badge.title) }), h('span', { text: tx(badge.text) }))));
      const again = h('button', { class: 'btn', attrs: { type: 'button' }, text: `↺ ${ks(lang, 'again')}` });
      again.addEventListener('click', () => void openReview(button));
      const done = h('button', { class: 'btn btn--primary', attrs: { type: 'button' }, text: ks(lang, 'close') });
      done.addEventListener('click', () => dialog.close());
      body.append(h('div', { class: 'kreview__actions' }, again, done));
      done.focus();
      render(result.progress);
    };

    if (questions.length === 0) {
      clear(body);
      body.append(h('p', { text: ks(lang, 'reviewEmpty') }));
      return;
    }
    showQuestion(questions[0]!);
  }

  root.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-review]');
    if (button && !button.disabled) void openReview(button);
  });
  q<HTMLButtonElement>('[data-review-close]')?.addEventListener('click', () => dialog?.close());
  dialog?.addEventListener('click', (event) => {
    // Klick auf den abgedunkelten Rand schließt
    if (event.target === dialog) dialog.close();
  });

  // Gerade geschaffte Station feiern: Knoten hüpft, Weg zur nächsten Station füllt sich, Blick dorthin
  function celebrate(): void {
    let info: { lesson: string; first: boolean; t: number } | null = null;
    try {
      const key = `kurs:geschafft:${course.id}`;
      const raw = sessionStorage.getItem(key);
      sessionStorage.removeItem(key);
      info = raw ? (JSON.parse(raw) as { lesson: string; first: boolean; t: number }) : null;
    } catch {
      info = null;
    }
    if (!info || Date.now() - info.t > 30 * 60 * 1000) return;
    const node = q<HTMLAnchorElement>(`[data-lesson="${CSS.escape(info.lesson)}"]`);
    const item = node?.closest<HTMLElement>('.ktrail__item');
    if (!node || !item) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
    if (reduced) return;
    item.classList.add('is-just-done');
    if (info.first) item.classList.add('is-first');
    window.setTimeout(() => item.classList.remove('is-just-done', 'is-first'), 2600);
  }

  // ---------- „Ich kann …“: Selbsteinschätzung je Welt (nur in diesem Browser) ----------
  const canKey = `kurs:${course.id}:ichkann`;
  const readCan = (): Set<string> => {
    try {
      const raw = JSON.parse(localStorage.getItem(canKey) ?? '[]');
      return new Set(Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []);
    } catch {
      return new Set();
    }
  };
  const renderCan = () => {
    const checked = readCan();
    for (const box of root.querySelectorAll<HTMLInputElement>('[data-can]')) box.checked = checked.has(box.dataset.can!);
    for (const world of root.querySelectorAll<HTMLElement>('[data-world]')) {
      const boxes = [...world.querySelectorAll<HTMLInputElement>('[data-can]')];
      const count = world.querySelector('[data-can-count]');
      if (count) count.textContent = `(${boxes.filter((b) => b.checked).length}/${boxes.length})`;
    }
  };
  root.addEventListener('change', (event) => {
    const box = (event.target as Element).closest<HTMLInputElement>('[data-can]');
    if (!box) return;
    const checked = readCan();
    if (box.checked) checked.add(box.dataset.can!);
    else checked.delete(box.dataset.can!);
    try {
      localStorage.setItem(canKey, JSON.stringify([...checked]));
    } catch {
      // ohne Speicher gilt das Häkchen nur bis zum Neuladen
    }
    renderCan();
  });
  renderCan();

  // ---------- Urkunde (Druckansicht; der Name wird nicht gespeichert) ----------
  const cert = q<HTMLElement>('[data-cert]');
  q<HTMLButtonElement>('[data-cert-print]')?.addEventListener('click', () => {
    if (!cert) return;
    const p = store.load();
    const info = levelFor(p.xp, course.levels);
    const done = lessons.filter((l) => p.lessons[l.id]).length;
    const complete = done === lessons.length && lessons.length > 0;
    const stars = Object.values(p.lessons).reduce((n, r) => n + r.stars, 0);
    const cards = lessons.filter((l) => l.card && p.lessons[l.id]).length;
    const worlds = course.chapters.filter((c) => c.lessons.every((l) => l.status !== 'ready' || p.lessons[l.id]) && c.lessons.some((l) => l.status === 'ready'));
    const name = (q<HTMLInputElement>('[data-cert-name]')?.value ?? '').trim();
    const set = (sel: string, text: string) => {
      const el = cert.querySelector<HTMLElement>(sel);
      if (el) el.textContent = text;
    };
    const guide = cert.querySelector<HTMLElement>('[data-cert-guide]');
    if (guide) guide.innerHTML = guideSvg(course.guide, complete ? 'wow' : 'happy', info.level, course.guideName);
    set('[data-cert-kind]', complete ? ks(lang, 'certDone') : ks(lang, 'certProgress'));
    set('[data-cert-who]', name || '_______________________');
    set('[data-cert-text]', complete ? ks(lang, 'certDoneText', { course: course.title[lang], audience: course.audience[lang] }) : ks(lang, 'certProgressText', { course: course.title[lang], audience: course.audience[lang], done, total: lessons.length }));
    const facts = cert.querySelector<HTMLElement>('[data-cert-facts]');
    if (facts) {
      clear(facts);
      for (const text of [ks(lang, 'certLessons', { done, total: lessons.length }), ks(lang, 'certStars', { n: stars }), ks(lang, 'certCards', { n: cards }), ks(lang, 'certBadges', { n: p.badges.length }), ks(lang, 'levelName', { n: info.level, name: info.name[lang] })]) facts.append(h('li', { text }));
    }
    set('[data-cert-worlds]', worlds.length ? ks(lang, 'certWorlds', { list: worlds.map((c) => `${c.icon} ${c.title[lang]}`).join(' · ') }) : ks(lang, 'certNoWorlds'));
    set('[data-cert-foot]', ks(lang, 'certFoot', { date: new Date().toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) }));
    // Beim Drucken steht nur die Urkunde auf der Seite (direkt unter <body>)
    if (cert.parentElement !== document.body) document.body.append(cert);
    document.documentElement.classList.add('is-printing-cert');
    const done_ = () => document.documentElement.classList.remove('is-printing-cert');
    addEventListener('afterprint', done_, { once: true });
    window.print();
    // Manche Browser kennen „afterprint“ nicht zuverlässig
    window.setTimeout(done_, 1500);
  });

  render(store.load());
  root.classList.add('is-ready');
  celebrate();
  // Zurück aus einer Lektion (Seite aus dem Verlauf): Stand neu lesen
  addEventListener('pageshow', () => render(store.load()));
}
