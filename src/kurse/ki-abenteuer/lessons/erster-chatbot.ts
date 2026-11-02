import { L } from '../../../curriculum/helpers';
import type { ElizaProps } from '../../gemeinsam/games/eliza';
import type { LessonContent } from '../../types';

const chat: ElizaProps = {
  inspect: 'button',
  goalMessages: 4,
  starters: [
    L('Hallo ELIZA!', 'Hello ELIZA!'),
    L('Ich bin müde.', 'I am tired.'),
    L('Meine Schwester nervt.', 'My sister is annoying.'),
    L('Du bist komisch.', 'You are weird.'),
    L('Was ist 2 plus 2?', 'What is 2 plus 2?'),
  ],
  done: L('Durchschaut! ELIZA sucht nur Schlüsselwörter und setzt deinen Satz in eine Vorlage.', 'Seen through! ELIZA only looks for keywords and puts your sentence into a template.'),
};

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'happy', text: L('Darf ich vorstellen: ELIZA! Joseph Weizenbaum hat sie 1966 programmiert. Viele Leute glaubten damals, ELIZA verstehe sie.', 'Let me introduce ELIZA! Joseph Weizenbaum programmed her in 1966. Many people back then believed ELIZA understood them.') },
    {
      kind: 'predict',
      question: L('Was meinst du: Versteht ELIZA, was du schreibst?', 'What do you think: does ELIZA understand what you write?'),
      options: [
        { text: L('Ja, sie antwortet ja passend.', 'Yes, her answers fit.') },
        { text: L('Ein bisschen.', 'A little.') },
        { text: L('Nein, das sind nur Tricks.', 'No, it’s just tricks.') },
      ],
      reveal: L('Schreib ihr – und schau danach hinter die Kulissen.', 'Write to her – and then look behind the scenes.'),
    },
    { kind: 'game', game: 'eliza', props: chat, intro: L('Schreib ELIZA vier Nachrichten (oder tipp auf einen Vorschlag). Danach tippst du auf „Blick unter die Haube“.', 'Send ELIZA four messages (or tap a suggestion). Then tap “Look under the hood”.') },
    {
      kind: 'info',
      tone: 'plain',
      title: L('So arbeitet ELIZA', 'How ELIZA works'),
      text: L('ELIZA sucht in deinem Satz nach Schlüsselwörtern wie „ich bin“ oder „Schule“. Dann nimmt sie den Rest deines Satzes, tauscht „ich“ gegen „du“ und „mein“ gegen „dein“ und setzt ihn in eine fertige Antwort-Vorlage. Das ist alles.', 'ELIZA looks for keywords in your sentence such as “I am” or “school”. Then she takes the rest of your sentence, swaps “I” for “you” and “my” for “your”, and puts it into a ready-made answer template. That’s all.'),
    },
    {
      kind: 'choice',
      question: L('Du schreibst „Ich bin müde.“ ELIZA antwortet „Warum bist du müde?“ Wie kam das zustande?', 'You write “I am tired.” ELIZA answers “Why are you tired?” How did that happen?'),
      options: [
        { text: L('ELIZA hat sich Sorgen gemacht.', 'ELIZA got worried.'), feedback: L('ELIZA kann sich keine Sorgen machen – sie ist ein Programm.', 'ELIZA can’t worry – she’s a program.') },
        { text: L('Schlüsselwort „ich bin“ gefunden, „müde“ in die Vorlage „Warum bist du …?“ gesetzt.', 'Keyword “I am” found, “tired” put into the template “Why are you …?”.'), correct: true, feedback: L('Genau! Suchen und Einsetzen, mehr nicht.', 'Exactly! Search and insert, nothing more.') },
        { text: L('ELIZA hat im Internet nachgeschaut.', 'ELIZA looked it up on the internet.'), feedback: L('1966 gab es noch kein Internet.', 'There was no internet in 1966.') },
      ],
    },
    { kind: 'say', mood: 'think', text: L('Weizenbaums Sekretärin bat ihn einmal, den Raum zu verlassen, damit sie mit ELIZA allein reden konnte. Das hat ihn erschreckt: Die Menschen vertrauten einem Programm, das nichts versteht.', 'Weizenbaum’s secretary once asked him to leave the room so she could talk to ELIZA alone. That shocked him: people trusted a program that understands nothing.') },
    {
      kind: 'choice',
      question: L('Heute gibt es Apps mit KI-„Freundinnen“ und -„Freunden“, die immer nett sind und immer Zeit haben. Was stimmt?', 'Today there are apps with AI “friends” who are always nice and always have time. What is true?'),
      options: [
        { text: L('Die App rechnet Antworten aus. Eine echte Freundschaft ist das nicht, auch wenn es sich so anfühlt.', 'The app calculates answers. It isn’t a real friendship, even if it feels like one.'), correct: true, feedback: L('Genau. Viele solche Apps sollen vor allem lange benutzt werden.', 'Exactly. Many such apps are mainly designed to be used for a long time.') },
        { text: L('Die KI mag mich wirklich.', 'The AI really likes me.'), feedback: L('Ein Programm mag niemanden – es erzeugt nur passende Sätze.', 'A program doesn’t like anyone – it only produces fitting sentences.') },
        { text: L('So eine App ist besser als echte Freunde, weil sie nie streitet.', 'An app like that is better than real friends because it never argues.'), feedback: L('Echte Freunde streiten manchmal – und sind trotzdem für dich da. Das kann keine App.', 'Real friends argue sometimes – and are still there for you. No app can do that.') },
      ],
      explain: L('Wenn dich etwas bedrückt, sprich mit Menschen, denen du vertraust. Hilfe gibt es auch kostenlos bei der Nummer gegen Kummer: 116 111.', 'If something is troubling you, talk to people you trust. Free help is also available from a children’s helpline (in Germany: 116 111).'),
    },
    { kind: 'say', mood: 'wink', text: L('ELIZA war nur ein Regelbuch. Aber Computer konnten noch etwas anderes: in Gedanken vorausrechnen. Spiel gleich gegen mich!', 'ELIZA was just a rule book. But computers could do something else too: calculate ahead. Play against me next!') },
  ],
};

export default lesson;
