import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'happy', text: L('Willkommen in meiner dritten Lernwelt! Hier sagt mir niemand die richtige Antwort. Ich probiere etwas aus und bekomme danach eine Belohnung – oder eben nicht.', 'Welcome to my third learning world! Here nobody tells me the right answer. I try something and get a reward afterwards – or not.') },
    { kind: 'say', mood: 'think', text: L('In meiner Stadt gibt es drei Eisdielen. Manchmal ist das Eis lecker, manchmal nicht. Welche ist die beste? Das weiß niemand – ich muss es herausfinden.', 'There are three ice-cream shops in my town. Sometimes the ice cream is yummy, sometimes not. Which is the best? Nobody knows – I have to find out.') },
    {
      kind: 'predict',
      question: L('Was ist die beste Strategie?', 'What is the best strategy?'),
      options: [
        { text: L('Bei der ersten leckeren Eisdiele bleiben', 'Stick with the first yummy shop') },
        { text: L('Jeden Tag eine zufällige', 'A random one every day') },
        { text: L('Meistens die beste bisher, manchmal eine andere', 'Mostly the best so far, sometimes another') },
      ],
      reveal: L('Probier es 20 Tage lang aus – dann vergleiche ich die Strategien.', 'Try it for 20 days – then I’ll compare the strategies.'),
    },
    { kind: 'game', game: 'eisdiele', intro: L('20 Tage, jeden Tag ein Eis. Wähle die Eisdiele!', '20 days, one ice cream every day. Choose the shop!') },
    {
      kind: 'info',
      title: L('Ausprobieren oder Bewährtes?', 'Try something new or stick with it?'),
      text: L('Wer immer nur Bewährtes nimmt, verpasst vielleicht etwas Besseres. Wer immer nur Neues probiert, isst oft schlechtes Eis. Lernende Programme lösen das so: meistens das Beste bisher, ab und zu etwas Neues. So arbeiten zum Beispiel Apps, die dir Videos oder Lieder vorschlagen.', 'If you only ever take what works, you may miss something better. If you only ever try new things, you often get bad ice cream. Learning programs solve it like this: mostly the best so far, now and then something new. Apps that suggest videos or songs to you work like this, for example.'),
    },
    {
      kind: 'choice',
      question: L('Du hast bei einer Eisdiele einmal ein schlechtes Eis bekommen. Ist sie deshalb schlecht?', 'You once got a bad ice cream at a shop. Does that make it bad?'),
      options: [
        { text: L('Nicht unbedingt – ein einziges Mal kann Pech sein.', 'Not necessarily – a single time can be bad luck.'), correct: true, feedback: L('Genau! Erst viele Versuche zeigen, wie gut sie wirklich ist.', 'Exactly! Only many tries show how good it really is.') },
        { text: L('Ja, nie wieder hingehen!', 'Yes, never go there again!'), feedback: L('Dann verpasst du vielleicht die beste Eisdiele der Stadt.', 'Then you might miss the best shop in town.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('Bei der Eisdiele zählt nur ein Schritt. Im nächsten Spiel brauche ich viele Schritte bis zur Belohnung – in einem Labyrinth!', 'At the ice-cream shop only one step counts. In the next game I need many steps to reach the reward – in a maze!') },
  ],
};

export default lesson;
