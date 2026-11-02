import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Wörter, die in ähnlichen Sätzen vorkommen, liegen für die KI nah beieinander. So kann sie mit Bedeutungen rechnen.', 'Words that appear in similar sentences lie close together for the AI. That is how it can calculate with meanings.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Für mich sind Wörter erst einmal nur Buchstaben. Woher soll ich wissen, dass „Hund“ und „Katze“ etwas gemeinsam haben, „Hund“ und „Bus“ aber nicht?', 'To me, words are just letters at first. How would I know that “dog” and “cat” have something in common, but “dog” and “bus” don’t?') },
    { kind: 'say', mood: 'think', text: L('Mein Trick: Ich lese sehr viele Sätze. Wörter, die in ähnlichen Sätzen vorkommen („Der … bellt“, „Die … schläft“), bekommen auf meiner Karte nahe Plätze.', 'My trick: I read lots and lots of sentences. Words that appear in similar sentences (“The … barks”, “The … sleeps”) get places close together on my map.') },
    { kind: 'game', game: 'wortkarte', intro: L('Hier ist meine Wörter-Landkarte. Wo wohnen die neuen Wörter?', 'Here is my word map. Where do the new words live?') },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Wörter sind Zahlen', 'Words are numbers'),
      text: L('Jeder Platz auf der Karte ist eine Liste von Zahlen. Echte Sprachmodelle benutzen nicht zwei, sondern Hunderte Zahlen pro Wort. Verstehen tun sie die Wörter trotzdem nicht so wie du – sie wissen nur, welche Wörter oft zusammen vorkommen.', 'Every place on the map is a list of numbers. Real language models use not two but hundreds of numbers per word. Still, they don’t understand words the way you do – they only know which words often appear together.'),
    },
    {
      kind: 'choice',
      question: L('In Bits Texten steht oft „Ärzte und ihre Patienten“ und „Krankenschwestern und ihre Patienten“, fast nie „Ärztinnen“. Was passiert?', 'Bit’s texts often say “doctors and their patients” and “nurses and their patients”, but hardly ever “female doctors”. What happens?'),
      options: [
        { text: L('Bit übernimmt das Bild aus den Texten – auch wenn es nicht fair ist.', 'Bit takes over the picture from the texts – even if it isn’t fair.'), correct: true, feedback: L('Genau. Ich lerne, was in den Texten steht – auch Vorurteile.', 'Exactly. I learn what is in the texts – prejudices included.') },
        { text: L('Bit weiß, dass es viele Ärztinnen gibt.', 'Bit knows there are many female doctors.'), feedback: L('Woher? Ich kenne nur meine Texte.', 'How? I only know my texts.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('Ich kann Bilder lesen, Wörter zählen und Wörter auf Karten legen. Als Nächstes lerne ich etwas ganz anderes: durch Belohnung!', 'I can read pictures, count words and place words on maps. Next I learn something completely different: from rewards!') },
  ],
};

export default lesson;
