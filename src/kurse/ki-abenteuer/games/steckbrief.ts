import { L } from '../../../curriculum/helpers';
import type { Localized } from '../../../i18n/config';
import { clear, h } from '../../engine/dom';
import { solved } from '../../engine/ui';
import type { GameMount } from '../../types';

/**
 * Spiel „Bits Steckbrief“: Bit wird veröffentlicht. Für jedes Feld des
 * Steckbriefs (Model Card) die ehrliche Angabe wählen. Grundlage sind Bits
 * Prüfergebnisse, die oben stehen.
 */
interface Field {
  label: Localized;
  options: { text: Localized; ok?: boolean; why: Localized }[];
}

const FIELDS: Field[] = [
  {
    label: L('Wofür ist Bit gedacht?', 'What is Bit meant for?'),
    options: [
      { text: L('Äpfel und Birnen auf Fotos unterscheiden.', 'Telling apples from pears in photos.'), ok: true, why: L('Genau dafür wurde Bit trainiert – nicht für mehr.', 'That’s exactly what Bit was trained for – nothing more.') },
      { text: L('Jedes Obst der Welt erkennen.', 'Recognising every fruit in the world.'), why: L('Bit hat nie eine Banane gesehen. Das wäre geschummelt.', 'Bit has never seen a banana. That would be cheating.') },
      { text: L('Schulnoten vergeben.', 'Giving school grades.'), why: L('Damit hat Bits Training nichts zu tun.', 'Bit’s training has nothing to do with that.') },
    ],
  },
  {
    label: L('Womit wurde Bit trainiert?', 'What was Bit trained with?'),
    options: [
      { text: L('Mit 200 Fotos, alle bei Tageslicht aufgenommen.', 'With 200 photos, all taken in daylight.'), ok: true, why: L('Ehrlich – und wichtig, denn das erklärt Bits Schwäche im Dunkeln.', 'Honest – and important, because it explains Bit’s weakness in the dark.') },
      { text: L('Mit allen Fotos aus dem Internet.', 'With all the photos on the internet.'), why: L('Das stimmt nicht. Übertreiben macht einen Steckbrief wertlos.', 'That’s not true. Exaggerating makes a model card worthless.') },
      { text: L('Das ist geheim.', 'That’s a secret.'), why: L('Ein guter Steckbrief verrät, woher die Daten kommen.', 'A good model card says where the data came from.') },
    ],
  },
  {
    label: L('Wie gut ist Bit?', 'How good is Bit?'),
    options: [
      { text: L('Fehlerfrei.', 'Never wrong.'), why: L('In der Probe lag Bit 2-mal daneben.', 'In the test Bit was wrong twice.') },
      { text: L('18 von 20 neuen Fotos richtig (90 %).', '18 of 20 new photos right (90%).'), ok: true, why: L('Genau: gemessen an Fotos, die Bit beim Üben nie gesehen hat.', 'Exactly: measured on photos Bit never saw while practising.') },
      { text: L('Besser als jeder Mensch.', 'Better than any person.'), why: L('Das wurde nie gemessen.', 'That was never measured.') },
    ],
  },
  {
    label: L('Wo macht Bit Fehler?', 'Where does Bit make mistakes?'),
    options: [
      { text: L('Nirgends.', 'Nowhere.'), why: L('Beide Fehler in der Probe waren dunkle Fotos.', 'Both mistakes in the test were dark photos.') },
      { text: L('Bei dunklen Fotos – die gab es im Training nicht.', 'With dark photos – there were none in training.'), ok: true, why: L('Ehrlich zugeben, wo ein Modell schwach ist, schützt Menschen vor falschem Vertrauen.', 'Admitting honestly where a model is weak protects people from misplaced trust.') },
      { text: L('Nur wenn die Nutzer Fehler machen.', 'Only when users make mistakes.'), why: L('Die Fehler lagen bei Bit, nicht bei den Nutzern.', 'The mistakes were Bit’s, not the users’.') },
    ],
  },
];

const game: GameMount<void> = (host, ctx) => {
  const { tx } = ctx;
  const chosen: (number | null)[] = FIELDS.map(() => null);
  const wrong = new Set<string>();
  let finished = false;

  const report = h('div', { class: 'kbox' }, h('p', { class: 'kbox__title', text: `🧪 ${tx(L('Bits Prüfbericht', 'Bit’s test report'))}` }), h('ul', { class: 'ktrace' }, h('li', { text: tx(L('Training: 200 Fotos von Äpfeln und Birnen, alle bei Tageslicht', 'Training: 200 photos of apples and pears, all in daylight')) }), h('li', { text: tx(L('Probe: 20 neue Fotos – 18 richtig, 2 falsch', 'Test: 20 new photos – 18 right, 2 wrong')) }), h('li', { text: tx(L('Die 2 Fehler: beide Fotos im Dunkeln aufgenommen', 'The 2 mistakes: both photos taken in the dark')) })));
  const card = h('div', { class: 'kmodelcard' });
  host.append(h('div', { class: 'kpanel' }, report), h('div', { class: 'kpanel' }, h('p', { class: 'kpanel__title', text: `🪪 ${tx(L('Steckbrief: Bit (Version 1)', 'Model card: Bit (version 1)'))}` }), card));

  function render(): void {
    clear(card);
    FIELDS.forEach((f, i) => {
      const row = h('fieldset', { class: 'kmodelcard__field' }, h('legend', { text: tx(f.label) }));
      f.options.forEach((o, k) => {
        const b = h('button', { class: `kchoice__opt${chosen[i] === k ? ' is-right' : ''}${wrong.has(`${i}-${k}`) ? ' is-wrong' : ''}`, attrs: { type: 'button' }, text: tx(o.text) });
        b.disabled = chosen[i] !== null || wrong.has(`${i}-${k}`);
        b.addEventListener('click', () => {
          if (!o.ok) {
            ctx.mistake();
            wrong.add(`${i}-${k}`);
            b.classList.add('is-wrong');
            b.disabled = true;
            ctx.say(o.why, 'sad');
            return;
          }
          chosen[i] = k;
          ctx.say(o.why, 'happy');
          render();
        });
        row.append(b);
      });
      card.append(row);
    });
    if (!finished && chosen.every((c) => c !== null)) {
      finished = true;
      ctx.say(L('Mein Steckbrief ist ehrlich – jetzt weiß jeder, wofür er mich benutzen kann und wann besser nicht.', 'My model card is honest – now everyone knows what they can use me for and when better not to.'), 'wow');
      host.append(solved(tx(L('Steckbrief fertig!', 'Model card done!'))));
      ctx.finish();
    }
  }

  render();
};

export default game;
