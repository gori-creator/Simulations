import type { Localized } from '../../../i18n/config';
import { h } from '../../engine/dom';
import { meter, solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { elizaReply, newElizaState } from '../models/eliza';

/**
 * Chat mit ELIZA (Nachbau des Chatbots von 1966). Optional „Blick unter die
 * Haube“: Unter jeder Antwort steht, welche Regel gefeuert hat, welche Vorlage
 * benutzt wurde und welcher Satzteil gespiegelt eingesetzt wurde.
 * Nichts wird gespeichert oder gesendet.
 */
export interface ElizaProps {
  /** 'always': Regeln immer sichtbar (Oberstufe); 'button': erst per Knopf (Klasse 5–10). */
  inspect: 'always' | 'button';
  /** So viele eigene Nachrichten bis zum Ziel. */
  goalMessages: number;
  /** So viele verschiedene Regeln sollen antworten (ohne „keine Regel passt“). */
  goalRules?: number;
  /** Vorschläge zum Antippen. */
  starters: Localized[];
  /** Satz der Figur, wenn das Ziel erreicht ist. */
  done: Localized;
}

const game: GameMount<ElizaProps> = (host, ctx, props) => {
  const { tx } = ctx;
  const state = newElizaState();
  const rulesSeen = new Set<string>();
  let sent = 0;
  let inspecting = props.inspect === 'always';
  let inspectedOnce = inspecting;
  let finished = false;

  const log = h('div', { class: 'kchat__log', attrs: { role: 'log', 'aria-live': 'polite', 'aria-label': tx({ de: 'Chat mit ELIZA', en: 'Chat with ELIZA' }) } });
  const input = h('input', { class: 'input kchat__input', attrs: { type: 'text', maxlength: 200, autocomplete: 'off', 'aria-label': tx({ de: 'Deine Nachricht an ELIZA', en: 'Your message to ELIZA' }), placeholder: tx({ de: 'Schreib etwas …', en: 'Type something …' }) } });
  const send = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'submit' }, text: tx({ de: 'Senden', en: 'Send' }) });
  const form = h('form', { class: 'kchat__form' }, input, send);
  const starters = h('div', { class: 'krow kchat__starters' });
  const toggle = h('button', { class: 'kbtn', attrs: { type: 'button', 'aria-pressed': String(inspecting) }, text: `🔍 ${tx({ de: 'Blick unter die Haube', en: 'Look under the hood' })}` });
  const msgMeter = meter(tx({ de: 'Deine Nachrichten', en: 'Your messages' }));
  const ruleMeter = props.goalRules ? meter(tx({ de: 'Verschiedene Regeln entdeckt', en: 'Different rules discovered' })) : null;

  const panel = h('div', { class: `kpanel kchat${inspecting ? ' is-inspecting' : ''}` }, log, starters, form);
  const side = h('div', { class: 'khint kchat__meters' }, msgMeter.el, ruleMeter?.el);
  host.append(panel, h('div', { class: 'kpanel' }, props.inspect === 'button' ? h('div', { class: 'krow' }, toggle) : null, side));

  function bubble(text: string, who: 'me' | 'bot', extra?: HTMLElement, help = false): void {
    const msg = h('div', { class: `kchat__msg kchat__msg--${who}${help ? ' kchat__msg--help' : ''}` }, h('span', { class: 'kchat__who', text: who === 'me' ? tx({ de: 'Du', en: 'You' }) : 'ELIZA' }), h('p', { text }), extra);
    log.append(msg);
    log.scrollTop = log.scrollHeight;
  }

  function update(): void {
    msgMeter.set(Math.min(sent, props.goalMessages), props.goalMessages, `${Math.min(sent, props.goalMessages)} / ${props.goalMessages}`, sent >= props.goalMessages);
    const nRules = rulesSeen.size;
    if (ruleMeter && props.goalRules) ruleMeter.set(Math.min(nRules, props.goalRules), props.goalRules, `${Math.min(nRules, props.goalRules)} / ${props.goalRules}`, nRules >= props.goalRules);
    const ok = sent >= props.goalMessages && (!props.goalRules || nRules >= props.goalRules) && inspectedOnce;
    if (ok && !finished) {
      finished = true;
      ctx.say(props.done, 'wow');
      host.append(solved(tx({ de: 'ELIZA durchschaut!', en: 'You saw through ELIZA!' })));
      ctx.finish();
    } else if (!finished && sent >= props.goalMessages && !inspectedOnce) {
      ctx.say({ de: 'Jetzt tipp auf „Blick unter die Haube“ und schau, was ELIZA wirklich macht.', en: 'Now tap “Look under the hood” and see what ELIZA really does.' }, 'wink');
    }
  }

  function talk(text: string): void {
    const clean = text.trim().slice(0, 200);
    if (!clean) return;
    bubble(clean, 'me');
    sent += 1;
    const answer = elizaReply(clean, ctx.lang, state);
    if (answer.rule.id !== 'sonst' && !answer.rule.safety) rulesSeen.add(answer.rule.id);
    const detail = h(
      'p',
      { class: 'kchat__rule' },
      h('strong', { text: `⚙️ ${tx({ de: 'Regel', en: 'Rule' })}: ${tx(answer.rule.label)}` }),
      ' · ',
      `${tx({ de: 'Vorlage', en: 'Template' })}: „${answer.template}“`,
      answer.captured ? ` · ${tx({ de: 'eingesetzt', en: 'inserted' })}: „${answer.reflected}“ (${tx({ de: 'aus', en: 'from' })} „${answer.captured}“)` : '',
    );
    window.setTimeout(() => {
      bubble(answer.reply, 'bot', detail, answer.rule.safety);
      update();
    }, ctx.reducedMotion ? 0 : 350);
  }

  for (const starter of props.starters) {
    const b = h('button', { class: 'kbtn kchat__starter', attrs: { type: 'button' }, text: tx(starter) });
    b.addEventListener('click', () => talk(tx(starter)));
    starters.append(b);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    talk(input.value);
    input.value = '';
    input.focus();
  });

  toggle.addEventListener('click', () => {
    inspecting = !inspecting;
    inspectedOnce = inspectedOnce || inspecting;
    toggle.setAttribute('aria-pressed', String(inspecting));
    panel.classList.toggle('is-inspecting', inspecting);
    if (inspecting) ctx.say({ de: 'Unter jeder Antwort steht jetzt die Regel. Kein Verstehen – nur Suchen und Einsetzen.', en: 'Under every answer you now see the rule. No understanding – just searching and inserting.' }, 'think');
    update();
  });

  bubble(tx({ de: 'Hallo, ich bin ELIZA. Was beschäftigt dich?', en: 'Hello, I am ELIZA. What is on your mind?' }), 'bot', h('p', { class: 'kchat__rule', text: `⚙️ ${tx({ de: 'Begrüßung (fest eingebaut)', en: 'greeting (built in)' })}` }));
  update();
};

export default game;
