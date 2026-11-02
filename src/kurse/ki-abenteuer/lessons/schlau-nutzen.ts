import { L } from '../../../curriculum/helpers';
import type { SortierenProps } from '../../gemeinsam/games/sortieren';
import type { LessonContent } from '../../types';

const sort: SortierenProps = {
  bins: [
    { id: 'gut', icon: '👍', label: L('hilft beim Lernen', 'helps you learn') },
    { id: 'weg', icon: '😴', label: L('Lernen fällt aus', 'no learning happens') },
    { id: 'gefahr', icon: '⚠️', label: L('riskant', 'risky') },
  ],
  items: [
    { icon: '🧮', text: L('Die KI erklärt mir eine Matheaufgabe, die ich nicht verstehe – dann rechne ich ähnliche Aufgaben selbst.', 'The AI explains a maths problem I don’t understand – then I solve similar problems myself.'), bin: 'gut', why: L('Erklären lassen und selbst üben: So lernst du wirklich.', 'Getting an explanation and practising yourself: that’s how you really learn.') },
    { icon: '📝', text: L('Die KI schreibt meinen Aufsatz, ich gebe ihn ab.', 'The AI writes my essay, I hand it in.'), bin: 'weg', why: L('Dann lernst du nichts – und oft ist es auch nicht erlaubt.', 'Then you learn nothing – and often it’s not allowed either.') },
    { icon: '❓', text: L('Ich lasse mir von der KI Übungsfragen zu meinem Thema stellen.', 'I have the AI ask me practice questions on my topic.'), bin: 'gut', why: L('Sich abfragen lassen ist eine der besten Lernmethoden.', 'Being quizzed is one of the best ways to learn.') },
    { icon: '🏠', text: L('Ich erzähle der KI meine Adresse und schicke Fotos von meinen Freunden.', 'I tell the AI my address and send photos of my friends.'), bin: 'gefahr', why: L('Persönliche Daten und Fotos anderer gehören nicht in einen Chatbot.', 'Personal data and photos of others don’t belong in a chatbot.') },
    { icon: '🔢', text: L('Die KI nennt eine Jahreszahl für mein Referat – ich schreibe sie ungeprüft ab.', 'The AI gives a year for my presentation – I copy it without checking.'), bin: 'gefahr', why: L('KI kann Zahlen und Fakten erfinden. Immer in einer zweiten Quelle prüfen!', 'AI can make up numbers and facts. Always check in a second source!') },
    { icon: '✍️', text: L('Ich schreibe selbst und lasse mir danach Tipps geben, was ich verbessern kann.', 'I write it myself and afterwards ask for tips on what to improve.'), bin: 'gut', why: L('Erst selbst denken, dann Rückmeldung – sehr gut.', 'Think for yourself first, then feedback – very good.') },
    { icon: '📋', text: L('Die KI löst alle Hausaufgaben, ich schreibe die Lösungen ab.', 'The AI solves all my homework, I copy the solutions.'), bin: 'weg', why: L('Spätestens in der Klassenarbeit fehlt dir dann das Können.', 'By the time of the test you’ll be missing the skills.') },
  ],
  done: L('{n} von {total} richtig! Faustregel: KI als Lernhilfe, nicht als Ersatz fürs eigene Denken.', '{n} of {total} right! Rule of thumb: AI as a learning aid, not a replacement for your own thinking.'),
};

const lesson: LessonContent = {
  takeaway: L('KI kann beim Lernen helfen – wenn du selbst denkst und sie nicht für dich denken lässt.', 'AI can help you learn – if you think for yourself and don’t let it think for you.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Viele Jugendliche nutzen Chatbots für die Schule. Das kann super helfen – oder dafür sorgen, dass man gar nichts mehr lernt. Es kommt darauf an, wie.', 'Lots of young people use chatbots for school. That can help a great deal – or mean you don’t learn anything any more. It depends on how.') },
    { kind: 'game', game: 'sortieren', props: sort, intro: L('Sortiere: Hilft das beim Lernen, fällt das Lernen aus – oder ist es riskant?', 'Sort: does it help you learn, does learning not happen – or is it risky?') },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Warum die KI nicht für dich lernen kann', 'Why AI can’t learn for you'),
      text: L('Lernen passiert in deinem Kopf, wenn du selbst nachdenkst, übst und Fehler machst. Ein Chatbot kann erklären, abfragen und Tipps geben. Aber wenn er alles erledigt, trainiert er – nicht du.', 'Learning happens in your head when you think, practise and make mistakes yourself. A chatbot can explain, quiz you and give tips. But if it does everything, it’s the one training – not you.'),
    },
    {
      kind: 'choice',
      question: L('Deine Schule hat Regeln für KI bei Hausaufgaben. Was gilt?', 'Your school has rules for AI in homework. What applies?'),
      options: [
        { text: L('Die Regeln der Schule und der Lehrkraft – im Zweifel fragen.', 'The rules of the school and the teacher – ask if in doubt.'), correct: true, feedback: L('Genau. Ehrlich sagen, wenn man KI benutzt hat, ist fair.', 'Exactly. Saying honestly when you used AI is fair.') },
        { text: L('Egal, merkt ja keiner.', 'Doesn’t matter, nobody notices.'), feedback: L('Darum geht es nicht – es geht um dein Lernen und um Fairness.', 'That’s not the point – it’s about your learning and about fairness.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('Jetzt fehlt nur noch die große Abschlussmission: Bits Zeitreise durch die Geschichte der KI!', 'Only the big final mission is left: Bit’s time travel through the history of AI!') },
  ],
};

export default lesson;
