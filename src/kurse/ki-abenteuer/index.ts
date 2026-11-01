import { L } from '../../curriculum/helpers';
import type { Course, LessonMeta } from '../types';

/**
 * KI-Abenteuer: Grundlagenkurs „Wie funktioniert KI?“ ab Klasse 5.
 * Roter Faden: Bit, ein kleiner Roboter, wacht ohne Wissen auf und wird von
 * den Schülerinnen und Schülern trainiert. Konzept: docs/KI-KURS-KONZEPT.md.
 *
 * Inhalte der Lektionen: lessons/<id>.ts (Schritte), Spiele: games/<name>.ts.
 */
const lesson = (id: string, slug: [string, string], title: [string, string], teaser: [string, string], icon: string, minutes: number, status: LessonMeta['status'] = 'ready'): LessonMeta => ({
  id,
  status,
  slug: L(...slug),
  title: L(...title),
  teaser: L(...teaser),
  icon,
  minutes,
});

export const kiAbenteuer: Course = {
  id: 'ki-abenteuer',
  slug: L('ki-abenteuer', 'ai-adventure'),
  title: L('KI-Abenteuer', 'AI Adventure'),
  tagline: L('Trainiere Bit, den kleinen Roboter – und finde heraus, wie Künstliche Intelligenz wirklich lernt.', 'Train Bit, the little robot – and find out how artificial intelligence really learns.'),
  description: L(
    'Ein Kurs ab Klasse 5: In kurzen Spielen bringst du Bit bei, Muster zu erkennen, aus Beispielen zu lernen und Fehler zu finden. Ohne Anmeldung, der Spielstand bleibt auf deinem Gerät.',
    'A course from year 5: in short games you teach Bit to spot patterns, learn from examples and find mistakes. No sign-up; your progress stays on your device.',
  ),
  chapters: [
    {
      id: 'erwachen',
      title: L('Bit erwacht', 'Bit wakes up'),
      blurb: L('Was ist eigentlich KI? Regeln schreiben oder aus Beispielen lernen?', 'What is AI anyway? Writing rules or learning from examples?'),
      lessons: [
        lesson('hallo-bit', ['hallo-bit', 'hello-bit'], ['Hallo, ich bin Bit', 'Hello, I’m Bit'], ['Bit soll Katzen und Hunde auseinanderhalten. Reichen ein paar Regeln?', 'Bit has to tell cats from dogs. Are a few rules enough?'], '👋', 5),
        lesson('ki-im-alltag', ['ki-im-alltag', 'ai-in-everyday-life'], ['KI im Alltag', 'AI in everyday life'], ['Steckt im Taschenrechner KI? Und im Handy? Sortiere mit Bit.', 'Is there AI in a calculator? And in a phone? Sort it out with Bit.'], '📱', 5),
        lesson('aus-beispielen', ['aus-beispielen', 'learning-from-examples'], ['Aus Beispielen lernen', 'Learning from examples'], ['Zeig Bit Äpfel und Birnen. Wie viele Beispiele braucht er?', 'Show Bit apples and pears. How many examples does he need?'], '🍎', 6),
      ],
    },
    {
      id: 'daten',
      title: L('Daten und Muster', 'Data and patterns'),
      blurb: L('KI lernt aus Daten. Aber welche Daten helfen – und welche schaden?', 'AI learns from data. But which data help – and which do harm?'),
      lessons: [
        lesson('merkmale', ['merkmale', 'features'], ['Gute Merkmale', 'Good features'], ['Gewicht, Farbe oder Lieblingsessen? Finde heraus, was Bit wirklich hilft.', 'Weight, colour or favourite food? Find out what really helps Bit.'], '🔍', 6),
        lesson('grenze', ['grenze-finden', 'find-the-border'], ['Die Grenze finden', 'Find the border'], ['Zieh eine Linie zwischen zwei Gruppen – so trennt eine KI Daten.', 'Draw a line between two groups – that’s how an AI separates data.'], '📈', 7),
        lesson('aufraeumen', ['falsche-daten', 'bad-data'], ['Falsche Daten', 'Bad data'], ['Jemand hat Fehler in Bits Daten versteckt. Findest du sie?', 'Someone hid mistakes in Bit’s data. Can you find them?'], '🧹', 6),
      ],
    },
    {
      id: 'lernen',
      title: L('Bit lernt', 'Bit learns'),
      blurb: L('Drei Arten, wie eine Maschine aus Beispielen Entscheidungen lernt.', 'Three ways a machine learns to decide from examples.'),
      lessons: [
        lesson('nachbarn', ['frag-die-nachbarn', 'ask-the-neighbours'], ['Frag die Nachbarn', 'Ask the neighbours'], ['Bit schaut, was die ähnlichsten Beispiele sind – und entscheidet wie die Mehrheit.', 'Bit looks at the most similar examples – and goes with the majority.'], '🏘️', 7),
        lesson('fragenbaum', ['fragen-baum', 'question-tree'], ['Der Fragen-Baum', 'The question tree'], ['Mit wenigen Ja-Nein-Fragen zum richtigen Tier. Welche Frage zuerst?', 'Find the right animal with a few yes/no questions. Which question first?'], '🌳', 7),
        lesson('ueben-pruefen', ['ueben-und-pruefen', 'practice-and-test'], ['Üben und Prüfen', 'Practice and test'], ['Auswendig lernen oder verstehen? Bit schreibt eine Probe.', 'Memorise or understand? Bit takes a test.'], '📝', 6),
      ],
    },
    {
      id: 'netze',
      title: L('Bits Gehirn', 'Bit’s brain'),
      blurb: L('Neuronale Netze: Wie aus vielen kleinen Rechnern eine lernende Maschine wird.', 'Neural networks: how many tiny calculators become a learning machine.'),
      lessons: [
        lesson('neuron', ['ein-neuron', 'one-neuron'], ['Ein Neuron', 'One neuron'], ['Soll Bit ins Kino gehen? Ein künstliches Neuron wägt ab.', 'Should Bit go to the cinema? An artificial neuron weighs it up.'], '⚡', 7),
        lesson('neuron-lernt', ['neuron-lernt', 'neuron-learns'], ['Das Neuron lernt', 'The neuron learns'], ['Bei jedem Fehler dreht Bit ein bisschen an den Reglern. Schau zu, wie er besser wird.', 'After every mistake Bit turns his dials a little. Watch him get better.'], '🎯', 7),
        lesson('bergab', ['bergab-lernen', 'learning-downhill'], ['Bergab lernen', 'Learning downhill'], ['Große oder kleine Schritte? Bring Bit ins Tal der kleinsten Fehler.', 'Big steps or small ones? Guide Bit into the valley of the smallest error.'], '⛰️', 6),
      ],
    },
    {
      id: 'bilder-sprache',
      title: L('Bilder und Sprache', 'Pictures and language'),
      blurb: L('Wie eine KI Bilder sieht und Texte schreibt – mit nichts als Zahlen.', 'How an AI sees pictures and writes text – using nothing but numbers.'),
      lessons: [
        lesson('pixel', ['bilder-sind-zahlen', 'pictures-are-numbers'], ['Bilder sind Zahlen', 'Pictures are numbers'], ['Mal ein Bild aus Kästchen – für Bit ist es eine Liste von Zahlen.', 'Paint a picture from squares – to Bit it’s a list of numbers.'], '🟦', 6),
        lesson('zeichen', ['zeichen-erkennen', 'recognising-symbols'], ['Zeichen erkennen', 'Recognising symbols'], ['Bring Bit bei, Kreuz, Kreis und Strich zu erkennen – mit deinen eigenen Zeichnungen.', 'Teach Bit to recognise cross, circle and line – using your own drawings.'], '🎨', 8),
        lesson('naechstes-wort', ['das-naechste-wort', 'the-next-word'], ['Das nächste Wort', 'The next word'], ['Wie Chatbots schreiben: Bit rät immer nur das nächste Wort.', 'How chatbots write: Bit only ever guesses the next word.'], '💬', 7),
      ],
    },
    {
      id: 'wir',
      title: L('KI und wir', 'AI and us'),
      blurb: L('Fair, wahr, sicher? Was du im Umgang mit KI wissen solltest.', 'Fair, true, safe? What you should know when using AI.'),
      lessons: [
        lesson('fair', ['ist-das-fair', 'is-it-fair'], ['Ist das fair?', 'Is it fair?'], ['Bit hat nur Sneaker gesehen. Was passiert bei Sandalen?', 'Bit has only seen sneakers. What happens with sandals?'], '🤝', 6),
        lesson('stimmt-das', ['stimmt-das', 'is-that-true'], ['Stimmt das?', 'Is that true?'], ['KI klingt sicher, auch wenn sie sich irrt. Prüfe Bits Antworten.', 'AI sounds sure even when it’s wrong. Check Bit’s answers.'], '✅', 6),
        lesson('meine-daten', ['meine-daten', 'my-data'], ['Meine Daten', 'My data'], ['Was darf eine KI über dich wissen? Entscheide mit Bit.', 'What should an AI know about you? Decide together with Bit.'], '🔒', 5),
      ],
    },
  ],
};
