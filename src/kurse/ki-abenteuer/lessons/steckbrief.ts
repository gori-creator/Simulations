import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Ein ehrlicher Steckbrief sagt, wofür eine KI gedacht ist, womit sie geübt hat und wo sie Fehler macht.', 'An honest model card says what an AI is meant for, what it practised on and where it makes mistakes.'),
  steps: [
    { kind: 'say', mood: 'wow', text: L('Große Neuigkeit: Ich werde veröffentlicht! Bald sollen Menschen mich benutzen, um Äpfel und Birnen zu sortieren.', 'Big news: I’m being released! Soon people will use me to sort apples and pears.') },
    { kind: 'say', mood: 'think', text: L('Aber woher sollen sie wissen, was ich kann – und was nicht? Dafür gibt es einen Steckbrief, wie bei einem Medikament der Beipackzettel.', 'But how will they know what I can do – and what I can’t? That’s what a model card is for, like the leaflet that comes with medicine.') },
    { kind: 'game', game: 'steckbrief', intro: L('Lies meinen Prüfbericht und füll meinen Steckbrief ehrlich aus.', 'Read my test report and fill in my model card honestly.') },
    {
      kind: 'choice',
      question: L('Warum ist es wichtig, auch die Schwächen hineinzuschreiben?', 'Why is it important to include the weaknesses too?'),
      options: [
        { text: L('Damit niemand Bit dort einsetzt, wo er sich oft irrt.', 'So nobody uses Bit where he is often wrong.'), correct: true, feedback: L('Genau. Ehrlichkeit schützt die Menschen, die mich benutzen.', 'Exactly. Honesty protects the people who use me.') },
        { text: L('Ist nicht wichtig – Hauptsache, viele benutzen ihn.', 'It doesn’t matter – the main thing is that many people use him.'), feedback: L('Wer meine Schwächen nicht kennt, vertraut mir vielleicht zu sehr.', 'People who don’t know my weaknesses may trust me too much.') },
        { text: L('Damit Bit traurig ist.', 'So Bit is sad.'), feedback: L('Ich bin nicht traurig – ich bin ein Programm. Es geht um die Menschen.', 'I’m not sad – I’m a program. It’s about the people.') },
      ],
    },
    {
      kind: 'info',
      title: L('Steckbriefe für echte KIs', 'Model cards for real AIs'),
      text: L('Viele Firmen und Forschende veröffentlichen zu ihren KI-Modellen solche Steckbriefe („Model Cards“): Wofür ist das Modell gedacht? Mit welchen Daten wurde es trainiert? Wie gut ist es – und für wen schlechter? Nicht alle tun es, und nicht immer ehrlich genug.', 'Many companies and researchers publish such cards (“model cards”) for their AI models: what is the model meant for? Which data was it trained on? How good is it – and for whom is it worse? Not all of them do it, and not always honestly enough.'),
    },
    { kind: 'say', mood: 'wink', text: L('Mission geschafft! In der nächsten Welt schauen wir in mein Gehirn.', 'Mission complete! In the next world we look inside my brain.') },
  ],
};

export default lesson;
