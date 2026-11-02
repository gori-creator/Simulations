import type { Localized } from '../../../i18n/config';
import { clear, h } from '../../engine/dom';
import { meter, solved } from '../../engine/ui';
import type { GameMount } from '../../types';

/**
 * Turing-Test: Man liest einen kurzen Chat zwischen der Jury und „X“ und
 * entscheidet: Mensch oder Maschine? Danach die Auflösung mit Begründung.
 * Mit `scored: false` zählen falsche Tipps nicht als Fehler – es geht darum
 * zu merken, wie schwer (oder leicht) die Entscheidung ist.
 */
export interface TuringRound {
  lines: { who: 'judge' | 'x'; text: Localized }[];
  answer: 'human' | 'machine';
  why: Localized;
}

export interface TuringProps {
  rounds: TuringRound[];
  scored?: boolean;
  /** Satz am Ende; {n} = richtig, {total} = alle. */
  done: Localized;
}

const game: GameMount<TuringProps> = (host, ctx, props) => {
  const { tx } = ctx;
  let index = 0;
  let right = 0;
  const marks: boolean[] = [];
  const score = meter(tx({ de: 'Richtig erkannt', en: 'Correctly identified' }));
  score.set(0, props.rounds.length, `0 / ${props.rounds.length}`);
  const stage = h('div', { class: 'kturing' });
  host.append(h('div', { class: 'kpanel' }, stage, h('div', { class: 'khint' }, score.el)));

  const label = (a: 'human' | 'machine') => (a === 'human' ? `🧑 ${tx({ de: 'Mensch', en: 'Human' })}` : `🤖 ${tx({ de: 'Maschine', en: 'Machine' })}`);

  function show(): void {
    clear(stage);
    const round = props.rounds[index]!;
    const chat = h('div', { class: 'kchat__log kchat__log--static', attrs: { role: 'group', 'aria-label': tx({ de: `Chat ${index + 1}`, en: `Chat ${index + 1}` }) } });
    for (const line of round.lines) {
      chat.append(h('div', { class: `kchat__msg kchat__msg--${line.who === 'judge' ? 'me' : 'bot'}` }, h('span', { class: 'kchat__who', text: line.who === 'judge' ? tx({ de: 'Jury', en: 'Judge' }) : 'X' }), h('p', { text: tx(line.text) })));
    }
    const why = h('p', { class: 'kcard__why', attrs: { hidden: true } });
    const human = h('button', { class: 'kbtn kbtn--a kcard__btn', attrs: { type: 'button' }, text: label('human') });
    const machine = h('button', { class: 'kbtn kbtn--b kcard__btn', attrs: { type: 'button' }, text: label('machine') });
    const next = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button', hidden: true }, text: index < props.rounds.length - 1 ? tx({ de: 'Nächster Chat →', en: 'Next chat →' }) : tx({ de: 'Auswerten', en: 'See result' }) });
    const pick = (guess: 'human' | 'machine') => {
      const ok = guess === round.answer;
      marks.push(ok);
      if (ok) right += 1;
      else if (props.scored !== false) ctx.mistake();
      human.disabled = true;
      machine.disabled = true;
      (guess === 'human' ? human : machine).setAttribute('aria-pressed', 'true');
      why.textContent = `${ok ? '✓' : '✗'} X = ${label(round.answer)}. ${tx(round.why)}`;
      why.hidden = false;
      stage.classList.toggle('is-right', ok);
      stage.classList.toggle('is-wrong', !ok);
      ctx.say(round.why, ok ? 'happy' : 'think');
      score.set(right, props.rounds.length, `${right} / ${props.rounds.length}`);
      next.hidden = false;
      next.focus();
    };
    human.addEventListener('click', () => pick('human'));
    machine.addEventListener('click', () => pick('machine'));
    next.addEventListener('click', () => {
      index += 1;
      if (index < props.rounds.length) show();
      else end();
    });
    stage.classList.remove('is-right', 'is-wrong');
    stage.append(h('span', { class: 'kcard__count', text: `${index + 1} / ${props.rounds.length}` }), chat, why, h('div', { class: 'kcard__actions' }, human, machine, next));
    if (index > 0) human.focus();
  }

  function end(): void {
    clear(stage);
    stage.classList.remove('is-right', 'is-wrong');
    const list = h('ul', { class: 'kscore' });
    props.rounds.forEach((round, i) => list.append(h('li', {}, `${marks[i] ? '✓' : '✗'} ${tx({ de: 'Chat', en: 'Chat' })} ${i + 1}: ${label(round.answer)}`)));
    stage.append(list, solved(`${right} / ${props.rounds.length}`));
    ctx.say(tx(props.done).replace('{n}', String(right)).replace('{total}', String(props.rounds.length)), right >= props.rounds.length - 1 ? 'wow' : 'happy');
    ctx.finish();
  }

  show();
};

export default game;
