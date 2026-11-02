import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';
import type { KartenProps } from '../../gemeinsam/games/karten';

const cards: KartenProps = {
  a: L('KI', 'AI'),
  b: L('keine KI', 'not AI'),
  aIcon: '🧠',
  bIcon: '⚙️',
  done: L('{n} von {total} richtig! Jetzt weißt du, wo KI steckt.', '{n} of {total} correct! Now you know where AI hides.'),
  cards: [
    { emoji: '🧮', text: L('Ein Taschenrechner rechnet 7 · 8 aus.', 'A calculator works out 7 × 8.'), answer: 'b', why: L('Er folgt festen Rechenregeln. Gelernt hat er nichts.', 'It follows fixed rules for maths. It hasn’t learned anything.') },
    { emoji: '📱', text: L('Das Handy entsperrt sich, wenn es dein Gesicht sieht.', 'The phone unlocks when it sees your face.'), answer: 'a', why: L('Gesichter erkennen hat die KI an sehr vielen Fotos gelernt.', 'The AI learned to recognise faces from a huge number of photos.') },
    { emoji: '🚦', text: L('Eine Ampel wird alle 60 Sekunden grün.', 'A traffic light turns green every 60 seconds.'), answer: 'b', why: L('Das ist ein fester Zeitplan, den ein Mensch eingestellt hat.', 'That’s a fixed timetable set by a person.') },
    { emoji: '📺', text: L('Eine Video-App schlägt dir Videos vor, die dir gefallen könnten.', 'A video app suggests videos you might like.'), answer: 'a', why: L('Die KI lernt aus dem, was du und andere angeschaut haben.', 'The AI learns from what you and others have watched.') },
    { emoji: '⏰', text: L('Der Wecker klingelt um 7 Uhr.', 'The alarm clock rings at 7 o’clock.'), answer: 'b', why: L('Er tut genau das, was du eingestellt hast – sonst nichts.', 'It does exactly what you set – nothing else.') },
    { emoji: '🗣️', text: L('Ein Sprachassistent versteht die Frage „Wie wird das Wetter?“', 'A voice assistant understands the question “What will the weather be like?”'), answer: 'a', why: L('Gesprochene Sprache zu verstehen hat er aus vielen Aufnahmen gelernt.', 'It learned to understand speech from many recordings.') },
    { emoji: '🌍', text: L('Eine App übersetzt einen Satz ins Spanische.', 'An app translates a sentence into Spanish.'), answer: 'a', why: L('Heutige Übersetzer haben aus Millionen übersetzten Texten gelernt.', 'Today’s translators learned from millions of translated texts.') },
    { emoji: '💡', text: L('Das Licht geht an, wenn du den Schalter drückst.', 'The light comes on when you press the switch.'), answer: 'b', why: L('Schalter an, Strom fließt. Da gibt es nichts zu lernen.', 'Switch on, current flows. Nothing to learn there.') },
    { emoji: '📧', text: L('Das E-Mail-Programm schiebt Werbe-Mails in den Spam-Ordner.', 'The email program moves junk mail to the spam folder.'), answer: 'a', why: L('Spamfilter lernen aus Mails, die Menschen als Spam markiert haben.', 'Spam filters learn from emails people have marked as spam.') },
  ],
};

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'happy', text: L('Weißt du, wo überall KI steckt? Viele denken: in jedem Gerät mit Strom. Stimmt das?', 'Do you know where AI is hiding? Many people think: in every device that uses electricity. Is that true?') },
    { kind: 'say', mood: 'think', text: L('Mein Tipp: KI ist dabei, wenn ein Gerät etwas aus Beispielen gelernt hat. Feste Abläufe sind keine KI.', 'My tip: AI is involved when a device has learned something from examples. Fixed routines are not AI.') },
    { kind: 'game', game: 'karten', props: cards, intro: L('Sortiere die Karten: KI oder keine KI?', 'Sort the cards: AI or not AI?') },
    {
      kind: 'choice',
      question: L('Woran erkennst du am ehesten, dass KI im Spiel ist?', 'What best tells you that AI is involved?'),
      options: [
        { text: L('Das Gerät braucht Strom.', 'The device needs electricity.'), feedback: L('Der Wecker braucht auch Strom – und ist keine KI.', 'The alarm clock needs electricity too – and it isn’t AI.') },
        { text: L('Es erkennt etwas, das es aus vielen Beispielen gelernt hat.', 'It recognises something it learned from many examples.'), correct: true, feedback: L('Genau: Gesichter, Sprache, Vorlieben – alles gelernt.', 'Exactly: faces, speech, preferences – all learned.') },
        { text: L('Es hat einen Bildschirm.', 'It has a screen.'), feedback: L('Ein Taschenrechner hat auch einen Bildschirm.', 'A calculator has a screen too.') },
      ],
    },
    {
      kind: 'info',
      title: L('Ist KI immer schlau?', 'Is AI always smart?'),
      text: L(
        'Nein. Jede KI kann nur das, wofür sie trainiert wurde. Eine KI, die Gesichter erkennt, kann keine Mathe-Aufgaben lösen. Und sie kann sich irren – zum Beispiel, wenn ein Foto sehr dunkel ist.',
        'No. Every AI can only do what it was trained for. An AI that recognises faces can’t solve maths problems. And it can be wrong – for example when a photo is very dark.',
      ),
    },
    { kind: 'say', mood: 'wow', text: L('Ich will auch so viel lernen! Nächstes Mal zeigst du mir Beispiele – mal sehen, wie schnell ich bin.', 'I want to learn that much too! Next time you’ll show me examples – let’s see how fast I am.') },
  ],
};

export default lesson;
