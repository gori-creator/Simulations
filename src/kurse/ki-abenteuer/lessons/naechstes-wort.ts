import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Ein Sprachmodell sagt das nächste Wort aus Zählungen voraus. Das klingt richtig, muss aber nicht wahr sein.', 'A language model predicts the next word from counts. It sounds right but doesn’t have to be true.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Hast du schon mal mit einem Chatbot geschrieben? Weißt du, wie der seine Antworten schreibt?', 'Have you ever chatted with a chatbot? Do you know how it writes its answers?') },
    { kind: 'say', mood: 'think', text: L('Er rät immer nur das nächste Wort. Dann das nächste. Und so weiter. Ich zeige dir das im Kleinen: Ich habe elf Sätze gelesen und gezählt, welches Wort auf welches folgt.', 'It only ever guesses the next word. Then the next one. And so on. I’ll show you in miniature: I read eleven sentences and counted which word follows which.') },
    { kind: 'game', game: 'woerter', intro: L('Bau mit mir zwei Sätze. Wähle die Wörter selbst oder lass mich würfeln.', 'Build two sentences with me. Choose the words yourself or let me roll the dice.') },
    {
      kind: 'choice',
      question: L('Bit hat einen Satz geschrieben, der richtig klingt. Ist er deshalb auch wahr?', 'Bit wrote a sentence that sounds right. Does that make it true?'),
      options: [
        { text: L('Ja, sonst hätte Bit ihn nicht geschrieben.', 'Yes, otherwise Bit wouldn’t have written it.'), feedback: L('Ich weiß nur, welche Wörter oft zusammen stehen – nicht, was wahr ist.', 'I only know which words often go together – not what’s true.') },
        { text: L('Nicht unbedingt – Bit baut Wörter zusammen, ohne zu prüfen, ob es stimmt.', 'Not necessarily – Bit puts words together without checking whether it’s true.'), correct: true, feedback: L('Genau! „Bit ist sehr weit weg“ klingt gut, ist aber Unsinn.', 'Exactly! “Bit is very far away” sounds fine but is nonsense.') },
      ],
    },
    {
      kind: 'info',
      title: L('Große Sprachmodelle', 'Large language models'),
      text: L(
        'Chatbots wie ChatGPT funktionieren im Kern genauso: Sie sagen das nächste Wort voraus. Sie haben aber Milliarden Texte gelesen und schauen nicht nur auf das letzte Wort, sondern auf den ganzen Text davor. Darum klingen sie so gut. Trotzdem können sie Dinge erfinden, die nicht stimmen.',
        'Chatbots like ChatGPT work the same way at their core: they predict the next word. But they have read billions of texts and look not just at the last word but at the whole text before it. That’s why they sound so good. Even so, they can make up things that aren’t true.',
      ),
    },
    { kind: 'say', mood: 'wow', text: L('Bereich 5 geschafft! Jetzt weißt du, wie ich sehe und schreibe. Im letzten Bereich geht es um uns: Ist KI fair? Darf man ihr glauben?', 'Chapter 5 done! Now you know how I see and write. The last chapter is about us: is AI fair? Can you believe it?') },
  ],
};

export default lesson;
