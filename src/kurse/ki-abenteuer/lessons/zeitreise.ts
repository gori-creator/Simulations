import { L } from '../../../curriculum/helpers';
import type { ZeitstrahlProps } from '../../gemeinsam/games/zeitstrahl';
import type { LessonContent } from '../../types';

const timeline: ZeitstrahlProps = {
  events: [
    { year: 1943, icon: '⚡', text: L('Das erste künstliche Neuron wird beschrieben.', 'The first artificial neuron is described.') },
    { year: 1950, icon: '🎭', text: L('Alan Turing erfindet seinen Test: Mensch oder Maschine?', 'Alan Turing invents his test: human or machine?') },
    { year: 1956, icon: '🔌', text: L('Das Fach bekommt seinen Namen: Künstliche Intelligenz.', 'The field gets its name: artificial intelligence.') },
    { year: 1961, icon: '🔥', text: L('MENACE lernt Tic-Tac-Toe mit Streichholzschachteln.', 'MENACE learns noughts and crosses with matchboxes.') },
    { year: 1966, icon: '💭', text: L('ELIZA, einer der ersten Chatbots, antwortet mit Regeln.', 'ELIZA, one of the first chatbots, answers with rules.') },
    { year: 1997, icon: '♟️', text: L('Der Computer Deep Blue schlägt den Schachweltmeister.', 'The computer Deep Blue beats the world chess champion.') },
    { year: 2011, icon: '📱', text: L('Ein Sprachassistent kommt aufs Handy.', 'A voice assistant arrives on the phone.') },
    { year: 2016, icon: '⚪', text: L('AlphaGo besiegt einen der besten Go-Spieler.', 'AlphaGo beats one of the best Go players.') },
    { year: 2022, icon: '🤖', text: L('ChatGPT erscheint und wird in Wochen weltberühmt.', 'ChatGPT is released and becomes world-famous within weeks.') },
    { year: 2024, icon: '🇪🇺', text: L('Die EU beschließt Regeln für KI.', 'The EU passes rules for AI.') },
  ],
  done: L('Die ganze Geschichte in der richtigen Reihenfolge – du bist ein echter KI-Profi!', 'The whole story in the right order – you’re a real AI pro!'),
};

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'wow', text: L('Die große Abschlussmission! Wir reisen durch die Zeit – vom ersten künstlichen Neuron bis heute. Erinnerst du dich an deine Wissenskarten?', 'The big final mission! We travel through time – from the first artificial neuron to today. Do you remember your knowledge cards?') },
    { kind: 'game', game: 'zeitstrahl', props: timeline, intro: L('Tippe die Ereignisse vom ältesten zum neuesten an.', 'Tap the events from oldest to newest.') },
    {
      kind: 'choice',
      question: L('Was steckt hinter fast jeder modernen KI?', 'What is behind almost every modern AI?'),
      options: [
        { text: L('Viele Beispiele, viele Zahlen und Lernen aus Fehlern.', 'Lots of examples, lots of numbers and learning from mistakes.'), correct: true, feedback: L('Genau! Das hast du alles selbst ausprobiert.', 'Exactly! You tried all of it yourself.') },
        { text: L('Ein kleiner Mensch im Computer.', 'A tiny person inside the computer.'), feedback: L('Haha, nein – nur Rechnungen.', 'Haha, no – just calculations.') },
        { text: L('Ein echtes Gehirn.', 'A real brain.'), feedback: L('Künstliche Neuronen sind nur Rechenbausteine, die vom Gehirn inspiriert sind.', 'Artificial neurons are just computing units inspired by the brain.') },
      ],
    },
    {
      kind: 'choice',
      question: L('Eine KI sagt etwas sehr überzeugend. Was weißt du jetzt?', 'An AI says something very convincingly. What do you know now?'),
      options: [
        { text: L('Überzeugend klingen heißt nicht, dass es stimmt – prüfen!', 'Sounding convincing doesn’t mean it’s true – check!'), correct: true, feedback: L('Genau. Das ist vielleicht das Wichtigste aus dem ganzen Kurs.', 'Exactly. That may be the most important thing from the whole course.') },
        { text: L('Was eine KI sagt, ist immer richtig.', 'What an AI says is always right.'), feedback: L('Du hast gesehen, wie KIs Fehler machen und Dinge erfinden.', 'You’ve seen how AIs make mistakes and invent things.') },
      ],
    },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Was Bit wirklich ist', 'What Bit really is'),
      text: L('Ich habe die ganze Zeit „ich denke“ und „ich lerne“ gesagt. In Wahrheit bin ich ein Programm, das Zahlen verändert. Das ist erstaunlich viel – aber kein Denken wie deins. Du weißt jetzt, wie KI funktioniert. Damit kannst du sie klug benutzen und mitreden, wofür wir sie einsetzen wollen.', 'All this time I’ve said “I think” and “I learn”. In truth I’m a program that changes numbers. That’s amazingly much – but not thinking like yours. You now know how AI works. With that you can use it wisely and have a say in what we want to use it for.'),
    },
    { kind: 'say', mood: 'wow', text: L('Danke, dass du mich trainiert hast! Die nächsten Kapitel der KI-Geschichte schreiben Menschen, die das verstehen – vielleicht ja du. Wenn du mehr willst: Im KI-Labor rechnen wir das alles mit echter Mathematik nach.', 'Thank you for training me! The next chapters of AI history will be written by people who understand this – maybe you. If you want more: in the AI Lab we work it all out with real maths.') },
  ],
};

export default lesson;
