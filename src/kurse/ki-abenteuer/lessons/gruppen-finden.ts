import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Auch ohne Etiketten findet eine KI Gruppen ähnlicher Dinge. Was die Gruppen bedeuten, entscheiden Menschen.', 'Even without labels an AI can find groups of similar things. What the groups mean is up to people.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Bisher hast du mir immer gesagt, was was ist: „Das ist ein Apfel, das eine Birne.“ Diese Schilder heißen Etiketten. Aber was, wenn niemand Zeit hat, alles zu beschriften?', 'So far you always told me what is what: “This is an apple, that a pear.” These signs are called labels. But what if nobody has time to label everything?') },
    {
      kind: 'predict',
      question: L('Kann Bit Gruppen finden, ohne dass ihm jemand sagt, was was ist?', 'Can Bit find groups without anyone telling him what is what?'),
      options: [
        { text: L('Nein, ohne Etiketten geht gar nichts.', 'No, nothing works without labels.') },
        { text: L('Ja, er kann ähnliche Dinge zusammenlegen.', 'Yes, he can put similar things together.') },
      ],
      reveal: L('Probier es mit mir aus. Ich kenne nur Größe und Süße der Früchte – keine Namen.', 'Try it with me. I only know the size and sweetness of the fruits – no names.'),
    },
    { kind: 'game', game: 'gruppen', intro: L('Drei Fähnchen stehen auf der Karte. Drück abwechselnd 1️⃣ und 2️⃣ – bis sich nichts mehr ändert.', 'Three flags are on the map. Press 1️⃣ and 2️⃣ in turn – until nothing changes any more.') },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Bit weiß nicht, was eine Melone ist', 'Bit doesn’t know what a melon is'),
      text: L('Ich habe nur gerechnet: Abstände messen, Mittelpunkte suchen. Dass die Gruppen „Heidelbeeren“, „Zitronen“ und „Melonen“ heißen, weißt nur du. Man nennt das Lernen ohne Etiketten (unüberwachtes Lernen).', 'I only calculated: measuring distances, finding middle points. That the groups are called “blueberries”, “lemons” and “melons” only you know. This is called learning without labels (unsupervised learning).'),
    },
    {
      kind: 'choice',
      question: L('Wo hilft Lernen ohne Etiketten im Alltag?', 'Where does learning without labels help in everyday life?'),
      options: [
        { text: L('Eine Foto-App legt Bilder derselben Person zusammen, ohne die Namen zu kennen.', 'A photo app puts pictures of the same person together without knowing their names.'), correct: true, feedback: L('Genau! Den Namen tippst du dann selbst ein.', 'Exactly! You type in the name yourself afterwards.') },
        { text: L('Ein Taschenrechner rechnet 2 + 2.', 'A calculator computes 2 + 2.'), feedback: L('Dafür braucht man gar kein Lernen.', 'That needs no learning at all.') },
        { text: L('Ein Wecker klingelt um 7 Uhr.', 'An alarm clock rings at 7.'), feedback: L('Das ist eine feste Regel, kein Lernen.', 'That’s a fixed rule, not learning.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('Jetzt kenne ich zwei Arten zu lernen: mit Etiketten und ohne. Eine dritte kommt später: Lernen durch Belohnung!', 'Now I know two ways of learning: with labels and without. A third comes later: learning from rewards!') },
  ],
};

export default lesson;
