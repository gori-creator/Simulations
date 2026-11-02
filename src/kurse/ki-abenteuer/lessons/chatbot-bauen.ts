import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Chatbots lernen erst aus riesigen Textmengen und dann aus Bewertungen von Menschen. Freundlich heißt nicht richtig.', 'Chatbots learn first from huge amounts of text and then from people’s ratings. Friendly doesn’t mean correct.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Wie entsteht eigentlich ein Chatbot wie ChatGPT? Ich zeige es dir an mir selbst. Es passiert in zwei großen Schritten.', 'How is a chatbot like ChatGPT actually made? I’ll show you using myself. It happens in two big steps.') },
    { kind: 'say', mood: 'think', text: L('Schritt 1: Ich lese. Sehr, sehr viel. Echte Chatbots lesen Milliarden Sätze aus dem Internet und aus Büchern. Dabei zählen sie, welche Wörter aufeinander folgen.', 'Step 1: I read. A lot. Real chatbots read billions of sentences from the internet and from books. While doing so they count which words follow each other.') },
    { kind: 'game', game: 'chatbot', intro: L('Erst lese ich, dann bekomme ich deine Daumen. Pass auf, wie sich meine Antworten verändern!', 'First I read, then I get your thumbs. Watch how my answers change!') },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Nachplappern, nicht wissen', 'Repeating, not knowing'),
      text: L('Nach Schritt 1 sage ich, was in meinen Texten am häufigsten stand – auch wenn es falsch ist. In Schritt 2 haben Menschen meine Antworten bewertet. Daraus lerne ich, welche Art Antwort gewünscht ist. Ob etwas wahr ist, prüfe ich dabei nicht.', 'After step 1 I say what appeared most often in my texts – even if it’s wrong. In step 2 people rated my answers. From that I learn which kind of answer is wanted. I don’t check whether something is true.'),
    },
    {
      kind: 'choice',
      question: L('Viele Leute schreiben im Internet etwas Falsches. Was macht ein Chatbot daraus?', 'Lots of people write something wrong on the internet. What does a chatbot make of it?'),
      options: [
        { text: L('Er kann das Falsche wiederholen, weil es oft vorkam.', 'It may repeat the wrong thing because it appeared often.'), correct: true, feedback: L('Genau. Darum: Antworten von Chatbots immer prüfen!', 'Exactly. That’s why: always check chatbots’ answers!') },
        { text: L('Er merkt sofort, dass es falsch ist.', 'It notices immediately that it’s wrong.'), feedback: L('Leider nicht – er zählt nur, was häufig vorkommt.', 'Sadly not – it only counts what appears often.') },
      ],
    },
    {
      kind: 'choice',
      question: L('Wer bestimmt, ob ein Chatbot nett oder frech antwortet?', 'Who decides whether a chatbot answers kindly or cheekily?'),
      options: [
        { text: L('Die Menschen, die seine Antworten bewerten und Regeln dafür aufschreiben.', 'The people who rate its answers and write rules for that.'), correct: true, feedback: L('Genau – du hast es gerade selbst gemacht.', 'Exactly – you just did it yourself.') },
        { text: L('Der Chatbot selbst, je nach Laune.', 'The chatbot itself, depending on its mood.'), feedback: L('Ein Chatbot hat keine Laune. Er folgt seinem Training.', 'A chatbot has no moods. It follows its training.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('Texte kann ich jetzt. Und Bilder? Die malen Bildgeneratoren auf eine überraschende Art: aus Rauschen!', 'Now I can do texts. And pictures? Image generators paint them in a surprising way: from noise!') },
  ],
};

export default lesson;
