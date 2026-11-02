import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'think', text: L('2016 untersuchte die Redaktion ProPublica ein Programm, das in US-Gerichten die Rückfallgefahr Angeklagter schätzt. Fehlalarme trafen Schwarze Angeklagte fast doppelt so oft. Der Hersteller hielt dagegen: Die Punktzahlen seien für beide Gruppen gleich zuverlässig. Beide hatten recht – wie geht das?', 'In 2016 the newsroom ProPublica examined a program that estimates defendants’ risk of reoffending in US courts. False alarms hit Black defendants almost twice as often. The vendor countered: the scores were equally reliable for both groups. Both were right – how can that be?') },
    {
      kind: 'info',
      title: L('Drei Fairness-Maße', 'Three fairness measures'),
      text: L(
        'Gleiche Annahmequoten: Beide Gruppen werden gleich oft angenommen. Gleiche Chancen: Wer tatsächlich zuverlässig ist, wird in beiden Gruppen gleich oft angenommen (gleiche Trefferquote). Kalibrierung: Eine Punktzahl bedeutet in beiden Gruppen dasselbe Risiko. 2016 zeigten mehrere Forschende: Unterscheiden sich die Grundraten, lassen sich diese Maße – außer in Sonderfällen – nicht alle zugleich erfüllen.',
        'Equal acceptance rates: both groups are accepted equally often. Equal opportunity: people who are actually reliable are accepted equally often in both groups (equal true positive rate). Calibration: a score means the same risk in both groups. In 2016 several researchers showed: if the base rates differ, these measures cannot – except in special cases – all be satisfied at once.',
      ),
    },
    { kind: 'game', game: 'fairness', intro: L('Ein Programm vergibt Punkte für Kreditanträge. Verschiebe die Schwellen und beobachte die Kennzahlen beider Gruppen.', 'A program scores loan applications. Move the thresholds and watch both groups’ figures.') },
    {
      kind: 'choice',
      question: L('Warum haben die Gruppen hier überhaupt verschiedene Grundraten?', 'Why do the groups have different base rates here at all?'),
      options: [
        { text: L('In echten Daten spiegeln sich oft frühere Benachteiligungen – etwa bei Einkommen oder Wohnort. Ein Modell lernt diese Muster mit.', 'Real data often reflect past disadvantages – e.g. in income or place of residence. A model learns these patterns too.'), correct: true, feedback: L('Genau – darum ist „das Modell rechnet nur“ keine Ausrede.', 'Exactly – which is why “the model just calculates” is no excuse.') },
        { text: L('Weil eine Gruppe von Natur aus schlechter ist.', 'Because one group is worse by nature.'), feedback: L('Nein. Unterschiede in Daten sagen etwas über Lebensumstände, nicht über den Wert von Menschen.', 'No. Differences in data say something about circumstances, not about the worth of people.') },
        { text: L('Das ist ein Rechenfehler.', 'That’s a calculation error.'), feedback: L('Die Zahlen sind so gewählt; in echten Daten kommt so etwas häufig vor.', 'The numbers were chosen that way; in real data this often happens.') },
      ],
    },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Wer entscheidet?', 'Who decides?'),
      text: L(
        'Welches Fairness-Maß gelten soll, kann keine Formel entscheiden. Das ist eine Wertfrage, die Gesellschaft, Gesetzgebung und Betroffene beantworten müssen. Wichtig ist, dass solche Systeme offenlegen, wie sie entscheiden, überprüft werden können und dass Menschen widersprechen können.',
        'Which fairness measure should apply can’t be decided by a formula. It is a question of values that society, lawmakers and the people affected must answer. What matters is that such systems disclose how they decide, can be audited, and that people can object.',
      ),
    },
    { kind: 'say', mood: 'wink', text: L('Genau dafür gibt es seit 2024 in Europa ein Gesetz. Schauen wir es uns an.', 'That’s exactly why Europe has had a law since 2024. Let’s look at it.') },
  ],
};

export default lesson;
