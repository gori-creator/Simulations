import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'sad', text: L('Oh nein! Beim Beschriften meiner Früchte ist etwas schiefgegangen. Drei Früchte haben das falsche Schild.', 'Oh no! Something went wrong when my fruit was labelled. Three fruits have the wrong label.') },
    { kind: 'say', mood: 'think', text: L('Ich lerne diesmal anders: Bei einer neuen Frucht schaue ich, welche bekannte Frucht am nächsten liegt. Falsche Schilder bringen mich so durcheinander.', 'This time I learn differently: for a new fruit I look at which known fruit is closest. Wrong labels confuse me that way.') },
    { kind: 'game', game: 'aufraeumen', intro: L('Finde die drei falsch beschrifteten Früchte und tippe sie an. Sie liegen mitten in der falschen Gruppe.', 'Find the three wrongly labelled fruits and tap them. They sit in the middle of the wrong group.') },
    {
      kind: 'choice',
      question: L('Was passiert, wenn eine KI aus falschen Daten lernt?', 'What happens when an AI learns from wrong data?'),
      options: [
        { text: L('Sie merkt es und lernt trotzdem richtig.', 'It notices and learns correctly anyway.'), feedback: L('Leider nein. Ich habe den Fehlern geglaubt.', 'Sadly not. I believed the mistakes.') },
        { text: L('Sie lernt die Fehler mit und macht später falsche Vorhersagen.', 'It learns the mistakes too and later makes wrong predictions.'), correct: true, feedback: L('Genau – du hast es im Bild gesehen.', 'Exactly – you saw it in the picture.') },
        { text: L('Gar nichts, Daten sind immer richtig.', 'Nothing, data is always right.'), feedback: L('Daten werden von Menschen gesammelt – und Menschen machen Fehler.', 'Data is collected by people – and people make mistakes.') },
      ],
    },
    {
      kind: 'info',
      title: L('Müll rein, Müll raus', 'Garbage in, garbage out'),
      text: L(
        'Fachleute sagen: „Garbage in, garbage out“ – aus schlechten Daten wird eine schlechte KI. Darum kontrollieren Menschen Trainingsdaten, bevor eine KI daraus lernt. Das ist viel Arbeit, aber sehr wichtig.',
        'Experts say: “garbage in, garbage out” – bad data makes a bad AI. That’s why people check training data before an AI learns from it. It’s a lot of work, but very important.',
      ),
    },
    { kind: 'say', mood: 'wow', text: L('Bereich 2 geschafft! Du weißt jetzt: Gute Daten und gute Merkmale sind das Wichtigste. Als Nächstes lerne ich richtig – auf drei verschiedene Arten.', 'Chapter 2 done! You now know: good data and good features matter most. Next I’ll learn properly – in three different ways.') },
  ],
};

export default lesson;
