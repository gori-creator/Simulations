import { clear, h } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';
import { BUILDER_FACTS, CASES, checkStraussRule, conclusions, FACT_NAMES, infer, RULES, step, type Fact } from '../models/regeln';

/**
 * Spiel „Wissen in Regeln“: (1) Vorwärtsverkettung Schritt für Schritt am
 * Gepard nachvollziehen, (2) der Strauß wird nicht erkannt, (3) eine neue
 * Regel bauen, die den Strauß erkennt, ohne andere Fälle kaputtzumachen.
 */
const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const name = (f: Fact) => tx(FACT_NAMES[f]!);
  const ruleText = (r: { id: string; if: Fact[]; then: Fact }) => `${r.id}: ${tx({ de: 'WENN', en: 'IF' })} ${r.if.map(name).join(` ${tx({ de: 'UND', en: 'AND' })} `)} ${tx({ de: 'DANN', en: 'THEN' })} ${name(r.then)}`;

  const rulesBox = h('ol', { class: 'krules' });
  for (const r of RULES) rulesBox.append(h('li', { class: 'krules__rule', attrs: { 'data-rule': r.id }, text: ruleText(r) }));
  const work = h('div', { class: 'kpanel' });
  host.append(h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: `📜 ${tx({ de: 'Wissensbasis (13 Regeln)', en: 'Knowledge base (13 rules)' })}` }), rulesBox), work);

  const mark = (id: string | null) => {
    for (const li of rulesBox.querySelectorAll<HTMLElement>('[data-rule]')) li.classList.toggle('is-firing', li.dataset.rule === id);
  };

  // Teil 1: Gepard Schritt für Schritt
  function partOne(): void {
    clear(work);
    const cheetah = CASES.find((c) => c.id === 'gepard')!;
    const known = new Set<Fact>(cheetah.facts);
    const facts = h('div', { class: 'kfacts' });
    const trace = h('ol', { class: 'ktrace' });
    const btn = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: `▶ ${tx({ de: 'Nächste Regel anwenden', en: 'Apply next rule' })}` });
    const renderFacts = () => {
      clear(facts);
      for (const f of known) facts.append(h('span', { class: `kfact${cheetah.facts.includes(f) ? '' : ' is-derived'}`, text: name(f) }));
    };
    btn.addEventListener('click', () => {
      const fired = step(known);
      if (!fired) {
        mark(null);
        btn.disabled = true;
        const result = conclusions(cheetah.facts);
        work.append(h('p', { class: 'kvote', text: `${tx({ de: 'Keine Regel feuert mehr. Ergebnis', en: 'No more rules fire. Result' })}: ${result.map(name).join(', ')} 🐆` }));
        ctx.say({ de: 'Und das Beste: Das System kann begründen, wie es darauf kam – Regel für Regel. Das kann ein neuronales Netz nicht so einfach.', en: 'And the best part: the system can explain how it got there – rule by rule. A neural network can’t do that so easily.' }, 'wow');
        const go = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: `${tx({ de: 'Neuer Fall', en: 'New case' })} →` });
        go.addEventListener('click', partTwo);
        work.append(go);
        go.focus();
        return;
      }
      known.add(fired.fact);
      mark(fired.rule.id);
      trace.append(h('li', { text: `${fired.rule.id} ✓ → ${name(fired.fact)}` }));
      renderFacts();
      ctx.say({ de: `${fired.rule.id} feuert: Alle Bedingungen sind bekannt, also gilt jetzt „${name(fired.fact)}“.`, en: `${fired.rule.id} fires: all conditions are known, so “${name(fired.fact)}” now holds.` }, 'think');
    });
    renderFacts();
    work.append(h('p', { class: 'kpanel__title', text: `🐆 ${tx({ de: 'Fall 1: Beobachtete Fakten', en: 'Case 1: observed facts' })}` }), facts, h('div', { class: 'krow' }, btn), h('p', { class: 'khint', text: tx({ de: 'Begründungskette:', en: 'Chain of reasoning:' }) }), trace);
    btn.focus();
  }

  // Teil 2: Strauß wird nicht erkannt
  function partTwo(): void {
    clear(work);
    mark(null);
    const ostrich = CASES.find((c) => c.id === 'strauss')!;
    const { trace } = infer(ostrich.facts);
    work.append(
      h('p', { class: 'kpanel__title', text: `🐦 ${tx({ de: 'Fall 2: ein großer Vogel', en: 'Case 2: a large bird' })}` }),
      h('div', { class: 'kfacts' }, ...ostrich.facts.map((f) => h('span', { class: 'kfact', text: name(f) }))),
      h('ol', { class: 'ktrace' }, ...trace.map((t) => h('li', { text: `${t.rule.id} ✓ → ${name(t.fact)}` }))),
      h('p', { class: 'kvote', text: `${tx({ de: 'Ergebnis', en: 'Result' })}: ${tx({ de: 'unbekannt', en: 'unknown' })} ❓` }),
    );
    ctx.say({ de: 'Das System weiß nur „Vogel“. Einen Strauß kennt es nicht – niemand hat ihm eine Regel dafür gegeben. Bau du eine!', en: 'The system only knows “bird”. It doesn’t know an ostrich – nobody gave it a rule for that. Build one!' }, 'sad');
    partThree();
  }

  // Teil 3: Regel bauen und gegen alle Fälle testen
  function partThree(): void {
    const chosen = new Set<Fact>();
    const chips = h('div', { class: 'kfacts kfacts--pick', attrs: { role: 'group', 'aria-label': tx({ de: 'Bedingungen der neuen Regel', en: 'Conditions of the new rule' }) } });
    const preview = h('p', { class: 'kformula' });
    const table = h('div', { class: 'ktable-wrap' });
    const test = h('button', { class: 'kbtn kbtn--main', attrs: { type: 'button' }, text: `🧪 ${tx({ de: 'Regel an allen Fällen testen', en: 'Test the rule on all cases' })}` });
    let done = false;
    const sync = () => {
      preview.textContent = `R14: ${tx({ de: 'WENN', en: 'IF' })} ${chosen.size ? [...chosen].map(name).join(` ${tx({ de: 'UND', en: 'AND' })} `) : '…'} ${tx({ de: 'DANN', en: 'THEN' })} ${name('strauss')}`;
      test.disabled = chosen.size === 0 || done;
    };
    for (const f of BUILDER_FACTS) {
      const b = h('button', { class: 'kfact kfact--btn', attrs: { type: 'button', 'aria-pressed': 'false' }, text: name(f) });
      b.addEventListener('click', () => {
        if (done) return;
        if (chosen.has(f)) chosen.delete(f);
        else chosen.add(f);
        b.setAttribute('aria-pressed', String(chosen.has(f)));
        sync();
      });
      chips.append(b);
    }
    test.addEventListener('click', () => {
      const checks = checkStraussRule([...chosen]);
      clear(table);
      table.append(
        h(
          'table',
          { class: 'ktable' },
          h('thead', {}, h('tr', {}, h('th', { text: tx({ de: 'Fall', en: 'Case' }) }), h('th', { text: tx({ de: 'Das System folgert', en: 'The system concludes' }) }), h('th', { text: '' }))),
          h('tbody', {}, ...checks.map((c) => h('tr', { class: c.ok ? 'is-right' : 'is-wrong' }, h('td', { text: `${c.case.icon} ${name(c.case.answer)}` }), h('td', { text: c.result.length ? c.result.map(name).join(' + ') : tx({ de: 'nichts', en: 'nothing' }) }), h('td', { text: c.ok ? '✓' : '✗' })))),
        ),
      );
      const bad = checks.filter((c) => !c.ok);
      if (bad.length === 0) {
        done = true;
        sync();
        ctx.say({ de: 'Alle Fälle stimmen! Aber stell dir vor, du müsstest das für jede Krankheit, jedes Bauteil, jede Ausnahme tun …', en: 'Every case is right! But imagine doing this for every disease, every part, every exception …' }, 'wow');
        work.append(solved(tx({ de: 'Wissensbasis repariert!', en: 'Knowledge base repaired!' })));
        ctx.finish();
        return;
      }
      ctx.mistake();
      const wrongStrauss = bad.find((c) => c.case.id === 'strauss');
      if (wrongStrauss) ctx.say({ de: 'Der Strauß wird noch nicht erkannt. Prüfe: Hat er wirklich alle Bedingungen deiner Regel?', en: 'The ostrich is still not recognised. Check: does it really have every condition of your rule?' }, 'think');
      else ctx.say({ de: `Zu allgemein! Jetzt hält das System auch ${bad.map((c) => c.case.icon).join(' ')} für einen Strauß. Was unterscheidet den Strauß davon?`, en: `Too general! Now the system also thinks ${bad.map((c) => c.case.icon).join(' ')} is an ostrich. What makes the ostrich different?` }, 'think');
    });
    work.append(h('p', { class: 'kpanel__title', text: `🛠️ ${tx({ de: 'Neue Regel: Wähle die Bedingungen', en: 'New rule: choose the conditions' })}` }), chips, preview, h('div', { class: 'krow' }, test), table);
    sync();
  }

  partOne();
};

export default game;
