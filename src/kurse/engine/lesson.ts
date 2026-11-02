import type { Lang, Localized } from '../../i18n/config';
import { getCourse, getLesson } from '../index';
import { loadGame, loadLesson } from '../loaders';
import { ks } from '../strings';
import type { GameCtx, GameInstance, KnowledgeCard, Mood, Step } from '../types';
import { clear, h } from './dom';
import { guideSvg } from './guide';
import { dayKey, finishLesson, levelFor, type FinishResult } from './progress';
import { storeFor } from './store';

/**
 * Lektionsseite: spielt die Schritte einer Lektion nacheinander ab (die Figur
 * erzählt, Fragen, Vermutungen, Spiele) und schreibt am Ende Sterne, XP,
 * Abzeichen und die Wissenskarte in den Spielstand. Das HTML-Gerüst kommt aus
 * src/views/LektionView.astro.
 */
export function initLesson(root: HTMLElement): void {
  const lang = (root.dataset.lang === 'en' ? 'en' : 'de') satisfies Lang;
  const courseId = root.dataset.course!;
  const lessonId = root.dataset.lesson!;
  const mapHref = root.dataset.mapHref!;
  const nextHref = root.dataset.nextHref || '';
  const course = getCourse(courseId);
  const meta = getLesson(courseId, lessonId);
  const store = storeFor(courseId);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tx = (text: Localized) => text[lang];
  const numberFormat = (digits: number) => new Intl.NumberFormat(lang === 'de' ? 'de-DE' : 'en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits });

  const q = <T extends Element>(selector: string) => root.querySelector<T>(selector)!;
  const guideBox = q<HTMLElement>('[data-bit]');
  const bubble = q<HTMLElement>('[data-bubble]');
  const play = q<HTMLElement>('[data-play]');
  const dots = q<HTMLElement>('[data-dots]');
  const nextBtn = q<HTMLButtonElement>('[data-next]');
  const levelPill = q<HTMLElement>('[data-level]');

  let steps: Step[] = [];
  let index = 0;
  let mistakes = 0;
  let game: GameInstance | void = undefined;
  let token = 0;

  const setLevelPill = () => {
    const xp = store.load().xp;
    const info = levelFor(xp, course.levels);
    levelPill.textContent = `${ks(lang, 'level', { n: info.level })} · ${ks(lang, 'xp', { n: xp })}`;
  };

  function setMood(mood: Mood): void {
    const level = levelFor(store.load().xp, course.levels).level;
    if (!guideBox.firstElementChild || guideBox.dataset.level !== String(level)) {
      guideBox.innerHTML = guideSvg(course.guide, mood, level, course.guideName);
      guideBox.dataset.level = String(level);
    }
    guideBox.firstElementChild?.setAttribute('data-mood', mood);
  }

  function say(text: Localized | string, mood: Mood = 'happy'): void {
    setMood(mood);
    bubble.textContent = typeof text === 'string' ? text : tx(text);
    bubble.classList.remove('is-new');
    // Neu einblenden (Animation in kurs.css)
    void bubble.offsetWidth;
    bubble.classList.add('is-new');
  }

  function setNext(enabled: boolean, label = ks(lang, 'next')): void {
    nextBtn.disabled = !enabled;
    nextBtn.textContent = label;
    nextBtn.hidden = false;
  }

  function renderDots(): void {
    clear(dots);
    steps.forEach((_, i) => {
      dots.append(h('span', { class: `kdots__dot${i < index ? ' is-done' : i === index ? ' is-current' : ''}` }));
    });
    dots.setAttribute('aria-label', ks(lang, 'stepOf', { n: Math.min(index + 1, steps.length), total: steps.length }));
  }

  function focusLater(el: HTMLElement | null | undefined): void {
    if (!el) return;
    requestAnimationFrame(() => el.focus({ preventScroll: false }));
  }

  /** Wissenskarte (auch für das Ende der Lektion). */
  function cardEl(card: KnowledgeCard, label: string, fresh: boolean): HTMLElement {
    return h(
      'article',
      { class: `kcardx kcardx--big${fresh ? ' is-fresh' : ''}` },
      h('span', { class: 'kcardx__tag', text: label }),
      h('span', { class: 'kcardx__year', text: String(card.year) }),
      h('h3', { class: 'kcardx__title', text: tx(card.title) }),
      h('p', { class: 'kcardx__text', text: tx(card.text) }),
      h('span', { class: 'kcardx__icon', attrs: { 'aria-hidden': 'true' }, text: meta.icon }),
    );
  }

  async function renderStep(): Promise<void> {
    const my = ++token;
    game?.destroy?.();
    game = undefined;
    clear(play);
    play.className = 'klesson__play';
    renderDots();
    const step = steps[index]!;
    const label = ks(lang, 'next');

    if (step.kind === 'say') {
      say(step.text, step.mood ?? 'happy');
      play.classList.add('is-empty');
      setNext(true, label);
      focusLater(nextBtn);
      return;
    }

    if (step.kind === 'info') {
      const plain = step.tone === 'plain';
      say(step.title, plain ? 'think' : 'wink');
      const head = plain ? `🔧 ${ks(lang, 'plain')}: ${tx(step.title)}` : `💡 ${ks(lang, 'forCurious')}: ${tx(step.title)}`;
      const box = h('details', { class: `kinfo${plain ? ' kinfo--plain' : ''}`, attrs: { open: true } }, h('summary', {}, head), h('p', { text: tx(step.text) }));
      if (step.formula) {
        const formula = typeof step.formula === 'string' ? step.formula : tx(step.formula);
        box.append(h('p', { class: 'kformula', attrs: { role: 'math', 'aria-label': formula }, text: formula }));
      }
      play.append(box);
      setNext(true, label);
      focusLater(nextBtn);
      return;
    }

    if (step.kind === 'predict') {
      say(step.question, 'think');
      setNext(false, label);
      const list = h('div', { class: 'kchoice kchoice--predict', attrs: { role: 'group', 'aria-label': tx(step.question) } });
      const note = h('p', { class: 'kchoice__explain', attrs: { hidden: true } });
      list.append(h('p', { class: 'kchoice__tag', text: `🤔 ${ks(lang, 'predictTag')}` }));
      for (const option of step.options) {
        const button = h('button', { class: 'kchoice__opt', attrs: { type: 'button' }, text: tx(option.text) });
        button.addEventListener('click', () => {
          if (button.disabled) return;
          for (const b of list.querySelectorAll('button')) b.disabled = b !== button;
          button.classList.add('is-picked');
          button.setAttribute('aria-pressed', 'true');
          say(option.feedback ?? step.reveal ?? L(ks('de', 'predictNote'), ks('en', 'predictNote')), 'wink');
          note.textContent = step.reveal ? tx(step.reveal) : ks(lang, 'predictNote');
          note.hidden = false;
          setNext(true, label);
          focusLater(nextBtn);
        });
        list.append(button);
      }
      play.append(list, note);
      focusLater(list.querySelector('button'));
      return;
    }

    if (step.kind === 'choice') {
      say(step.question, step.mood ?? 'think');
      setNext(false, label);
      const list = h('div', { class: 'kchoice', attrs: { role: 'group', 'aria-label': tx(step.question) } });
      const explain = h('p', { class: 'kchoice__explain', attrs: { hidden: true } });
      let solved = false;
      for (const option of step.options) {
        const button = h('button', { class: 'kchoice__opt', attrs: { type: 'button' }, text: tx(option.text) });
        button.addEventListener('click', () => {
          if (solved || button.disabled) return;
          if (option.correct) {
            solved = true;
            button.classList.add('is-right');
            for (const b of list.querySelectorAll('button')) b.disabled = b !== button;
            button.setAttribute('aria-pressed', 'true');
            say(option.feedback ?? L(ks('de', 'correct'), ks('en', 'correct')), 'wow');
            if (step.explain) {
              explain.textContent = tx(step.explain);
              explain.hidden = false;
            }
            setNext(true, label);
            focusLater(nextBtn);
          } else {
            mistakes += 1;
            button.classList.add('is-wrong');
            button.disabled = true;
            say(option.feedback ?? L(ks('de', 'tryAgain'), ks('en', 'tryAgain')), 'sad');
          }
        });
        list.append(button);
      }
      play.append(list, explain);
      focusLater(list.querySelector('button'));
      return;
    }

    // Spiel
    say(step.intro ?? L('', ''), step.mood ?? 'happy');
    setNext(false, label);
    play.classList.add('is-game');
    const host = h('div', { class: 'kgame', attrs: { tabindex: -1, 'data-game': step.game } });
    play.append(host);
    try {
      const mount = await loadGame(courseId, step.game);
      if (my !== token) return;
      const ctx: GameCtx = {
        lang,
        tx,
        say,
        mistake: () => {
          mistakes += 1;
        },
        finish: () => {
          if (my !== token) return;
          setNext(true, label);
          nextBtn.classList.add('is-ready');
        },
        num: (value, digits = 0) => numberFormat(digits).format(value).replace('-', '−'),
        percent: (share) => `${numberFormat(0).format(Math.round(share * 100))}${lang === 'de' ? ' %' : '%'}`,
        reducedMotion,
      };
      game = (mount as (host: HTMLElement, ctx: GameCtx, props: unknown) => GameInstance | void)(host, ctx, step.props);
      focusLater(host);
    } catch (error) {
      console.error(error);
      host.textContent = ks(lang, 'loadError');
    }
  }

  function confetti(): void {
    if (reducedMotion) return;
    const layer = h('div', { class: 'kconfetti', attrs: { 'aria-hidden': 'true' } });
    for (let i = 0; i < 36; i++) {
      const piece = h('span');
      piece.style.setProperty('--x', `${Math.random() * 100}%`);
      piece.style.setProperty('--d', `${0.9 + Math.random() * 1.2}s`);
      piece.style.setProperty('--delay', `${Math.random() * 0.4}s`);
      piece.style.setProperty('--r', `${Math.random() * 720 - 360}deg`);
      piece.style.setProperty('--c', `var(--kc-${1 + (i % 6)})`);
      layer.append(piece);
    }
    root.append(layer);
    setTimeout(() => layer.remove(), 2800);
  }

  function renderEnd(result: FinishResult): void {
    game?.destroy?.();
    game = undefined;
    clear(play);
    play.className = 'klesson__play is-end';
    index = steps.length;
    renderDots();
    const p = result.progress;
    const info = levelFor(p.xp, course.levels);
    say(result.stars === 3 ? course.voice.perfect : course.voice.done, result.stars === 3 ? 'wow' : 'happy');

    const stars = h('div', { class: 'kend__stars', attrs: { role: 'img', 'aria-label': ks(lang, 'stars', { n: result.stars }) } });
    for (let i = 1; i <= 3; i++) {
      const star = h('span', { class: `kend__star${i <= result.stars ? ' is-on' : ''}`, text: '★' });
      star.style.setProperty('--i', String(i));
      stars.append(star);
    }
    const mistakeText = mistakes === 0 ? ks(lang, 'mistakes0') : mistakes === 1 ? ks(lang, 'mistakes1') : ks(lang, 'mistakesN', { n: mistakes });
    const xpLine = result.xpGained > 0 ? h('p', { class: 'kend__xp', text: ks(lang, 'xpGained', { n: result.xpGained }) }) : h('p', { class: 'kend__muted', text: ks(lang, 'noXp') });
    const bar = h('div', { class: 'kbar', attrs: { role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': info.need || 1, 'aria-valuenow': info.max ? 1 : info.into, 'aria-label': ks(lang, 'levelName', { n: info.level, name: tx(info.name) }) } }, h('span', { class: 'kbar__fill' }));
    (bar.firstElementChild as HTMLElement).style.setProperty('--p', `${info.max ? 100 : Math.round((100 * info.into) / info.need)}%`);
    const levelLine = h('p', { class: 'kend__level' }, h('strong', { text: ks(lang, 'levelName', { n: info.level, name: tx(info.name) }) }), ' · ', info.max ? ks(lang, 'levelMax') : ks(lang, 'levelNext', { n: info.need - info.into, next: info.level + 1 }));
    const summary = h('section', { class: 'kend', attrs: { 'aria-live': 'polite' } }, h('h2', { class: 'kend__title', text: ks(lang, 'lessonDone') }), stars, h('p', { class: 'kend__muted', text: mistakeText }), xpLine, levelLine, bar);
    if (result.levelAfter > result.levelBefore) {
      summary.append(h('p', { class: 'kend__levelup', text: `🎉 ${ks(lang, 'levelUp', { name: tx(info.name) })}` }));
    }
    for (const badge of result.newBadges) {
      summary.append(h('div', { class: 'kbadge kbadge--new' }, h('span', { class: 'kbadge__icon', text: badge.icon }), h('span', {}, h('small', { text: ks(lang, 'newBadge') }), h('strong', { text: tx(badge.title) }), h('span', { text: tx(badge.text) }))));
    }
    const actions = h('div', { class: 'kend__actions' });
    if (nextHref) actions.append(h('a', { class: 'btn btn--primary btn--lg', attrs: { href: nextHref }, text: `${ks(lang, 'nextLesson')} →` }));
    actions.append(h('a', { class: `btn btn--lg${nextHref ? '' : ' btn--primary'}`, attrs: { href: mapHref }, text: ks(lang, 'back') }));
    const again = h('button', { class: 'btn btn--lg btn--ghost', attrs: { type: 'button' }, text: `↺ ${ks(lang, 'again')}` });
    again.addEventListener('click', () => {
      index = 0;
      mistakes = 0;
      nextBtn.hidden = false;
      void renderStep();
    });
    actions.append(again);
    summary.append(actions);
    const wrap = h('div', { class: `kend-wrap${meta.card ? ' has-card' : ''}` }, summary);
    if (meta.card) wrap.append(cardEl(meta.card, result.firstTime ? `🃏 ${ks(lang, 'cardNew')}` : ks(lang, 'cardAgain'), result.firstTime));
    play.append(wrap);
    nextBtn.hidden = true;
    setLevelPill();
    confetti();
    focusLater(summary.querySelector<HTMLElement>('.kend__actions a, .kend__actions button'));
  }

  nextBtn.addEventListener('click', () => {
    if (nextBtn.disabled) return;
    nextBtn.classList.remove('is-ready');
    if (index < steps.length - 1) {
      index += 1;
      void renderStep();
      return;
    }
    const result = finishLesson(store.load(), course, lessonId, mistakes, dayKey(new Date()));
    store.save(result.progress);
    renderEnd(result);
  });

  setLevelPill();
  setMood('happy');
  loadLesson(courseId, lessonId)
    .then((content) => {
      steps = content.steps;
      root.classList.add('is-ready');
      q('[data-loading]')?.remove();
      void renderStep();
    })
    .catch((error) => {
      console.error(error);
      bubble.textContent = ks(lang, 'loadError');
    });
}

/** Kurzschreibweise ohne Import aus dem Lehrplan (hält das Paket klein). */
function L(de: string, en: string): Localized {
  return { de, en };
}
