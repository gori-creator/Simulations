import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Mehrere Nachbarn fragen ist sicherer als einen: Ein einzelner Ausreißer bestimmt dann nicht alles.', 'Asking several neighbours is safer than asking one: a single outlier can’t decide everything.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Willkommen in der Welt „Bit lernt“! Heute frage ich meine Nachbarn um Rat.', 'Welcome to the world “Bit learns”! Today I ask my neighbours for advice.') },
    { kind: 'say', mood: 'think', text: L('Im Tierheim sind neue Tiere angekommen: Kaninchen oder Meerschweinchen? Ich vergleiche sie mit Tieren, die ich schon kenne – nach Ohrlänge und Gewicht.', 'New animals have arrived at the shelter: rabbits or guinea pigs? I compare them with animals I already know – by ear length and weight.') },
    { kind: 'game', game: 'nachbarn', intro: L('Wähle, wie viele Nachbarn ich frage, und tipp ein Fragezeichen an. Dann drück „Alle prüfen“.', 'Choose how many neighbours I ask and tap a question mark. Then press “Check all”.') },
    {
      kind: 'choice',
      question: L('Warum hat Bit mit drei Nachbarn besser entschieden als mit einem?', 'Why did Bit decide better with three neighbours than with one?'),
      options: [
        { text: L('Ein einzelner seltsamer Nachbar kann ihn nicht mehr täuschen.', 'A single odd neighbour can’t fool him any more.'), correct: true, feedback: L('Genau! Die Mehrheit gleicht Ausreißer aus.', 'Exactly! The majority evens out oddballs.') },
        { text: L('Drei ist eine Glückszahl.', 'Three is a lucky number.'), feedback: L('Mit Glück hat das nichts zu tun – mit Abstimmen schon.', 'It has nothing to do with luck – it’s about voting.') },
        { text: L('Er hat die Lösung vorher gesehen.', 'He saw the answer beforehand.'), feedback: L('Nein, ich kenne nur die anderen Tiere.', 'No, I only know the other animals.') },
      ],
    },
    {
      kind: 'info',
      title: L('Das Nächste-Nachbarn-Verfahren', 'The nearest-neighbour method'),
      text: L(
        'So lernen manche KIs wirklich: Sie merken sich alle Beispiele. Kommt etwas Neues, suchen sie die ähnlichsten Beispiele und übernehmen die Mehrheit. Fachleute nennen das „k nächste Nachbarn“ – k ist die Zahl der Nachbarn.',
        'Some AIs really learn this way: they remember all examples. When something new comes along, they look for the most similar examples and go with the majority. Experts call this “k nearest neighbours” – k is the number of neighbours.',
      ),
    },
    { kind: 'say', mood: 'wow', text: L('Ähnliche Dinge gehören meist zusammen. Das ist eine der einfachsten Ideen in der KI – und sie funktioniert erstaunlich gut.', 'Similar things usually belong together. That’s one of the simplest ideas in AI – and it works surprisingly well.') },
  ],
};

export default lesson;
