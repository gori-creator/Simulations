import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';
import type { KartenProps } from '../games/karten';

const cards: KartenProps = {
  a: L('Okay zu teilen', 'Okay to share'),
  b: L('Lieber nicht', 'Better not'),
  aIcon: '👍',
  bIcon: '🔒',
  done: L('{n} von {total} – du passt gut auf deine Daten auf!', '{n} of {total} – you take good care of your data!'),
  cards: [
    { emoji: '🦊', text: L('Dein Lieblingstier', 'Your favourite animal'), answer: 'a', why: L('Das verrät nicht, wer du bist. Kein Problem.', 'That doesn’t reveal who you are. No problem.') },
    { emoji: '🏠', text: L('Deine Adresse', 'Your home address'), answer: 'b', why: L('Damit könnte jemand herausfinden, wo du wohnst. Das bleibt privat.', 'Someone could find out where you live. Keep it private.') },
    { emoji: '🔑', text: L('Dein Passwort', 'Your password'), answer: 'b', why: L('Ein Passwort gibst du niemandem – auch keiner KI.', 'You never give your password to anyone – not to an AI either.') },
    { emoji: '❓', text: L('Eine Frage zu deinen Mathe-Hausaufgaben (ohne Namen)', 'A question about your maths homework (no name)'), answer: 'a', why: L('Eine Frage ohne persönliche Angaben ist in Ordnung.', 'A question without personal details is fine.') },
    { emoji: '📸', text: L('Ein Foto von deinem Gesicht', 'A photo of your face'), answer: 'b', why: L('Fotos von dir sind persönliche Daten. Sie können gespeichert und weiterverwendet werden.', 'Photos of you are personal data. They can be stored and reused.') },
    { emoji: '📱', text: L('Die Handynummer deiner Freundin', 'Your friend’s phone number'), answer: 'b', why: L('Das sind ihre Daten. Die darfst du nicht einfach weitergeben.', 'That’s her data. You mustn’t simply pass it on.') },
    { emoji: '🎨', text: L('Deine Lieblingsfarbe', 'Your favourite colour'), answer: 'a', why: L('Harmlos – damit kann niemand etwas anfangen.', 'Harmless – nobody can do anything with that.') },
    { emoji: '🏥', text: L('Eine Krankheit, die du hast', 'An illness you have'), answer: 'b', why: L('Gesundheitsdaten sind besonders geschützt. Die gehören nicht in einen Chat.', 'Health data is specially protected. It doesn’t belong in a chat.') },
  ],
};

const lesson: LessonContent = {
  steps: [
    { kind: 'say', mood: 'think', text: L('Viele KI-Apps speichern, was du eintippst. Manche lernen sogar daraus. Darum lohnt es sich zu überlegen, was du verrätst.', 'Many AI apps store what you type. Some even learn from it. So it’s worth thinking about what you give away.') },
    { kind: 'game', game: 'karten', props: cards, intro: L('Was würdest du einer KI-App erzählen? Entscheide bei jeder Karte.', 'What would you tell an AI app? Decide for each card.') },
    {
      kind: 'choice',
      question: L('Was ist die beste Faustregel?', 'What’s the best rule of thumb?'),
      options: [
        { text: L('Nichts eintippen, was ich nicht auch auf ein Plakat in der Schule schreiben würde.', 'Don’t type anything I wouldn’t also write on a poster at school.'), correct: true, feedback: L('Super Regel! Die merke ich mir auch.', 'Great rule! I’ll remember it too.') },
        { text: L('Alles ist okay, die App ist ja nett.', 'Everything’s fine, the app is friendly.'), feedback: L('Freundlich klingen heißt nicht, dass deine Daten sicher sind.', 'Sounding friendly doesn’t mean your data is safe.') },
        { text: L('Nur nachts nichts teilen.', 'Just don’t share anything at night.'), feedback: L('Die Uhrzeit spielt keine Rolle.', 'The time of day doesn’t matter.') },
      ],
    },
    {
      kind: 'info',
      title: L('Deine Rechte', 'Your rights'),
      text: L(
        'In Europa schützt die Datenschutz-Grundverordnung (DSGVO) deine Daten. Du darfst fragen, was eine Firma über dich gespeichert hat, und verlangen, dass sie es löscht. Viele KI-Apps sind erst ab 13 Jahren erlaubt – frag bei Unsicherheit deine Eltern oder Lehrkräfte.',
        'In Europe the General Data Protection Regulation (GDPR) protects your data. You may ask what a company has stored about you and demand that it deletes it. Many AI apps are only allowed from age 13 – if unsure, ask your parents or teachers.',
      ),
    },
    { kind: 'say', mood: 'wow', text: L('Du hast das ganze KI-Abenteuer geschafft! Aus mir, einem Roboter ohne Wissen, ist mit deiner Hilfe ein kluger Lerner geworden. Danke, Trainerin oder Trainer!', 'You’ve completed the whole AI adventure! With your help I went from a robot with no knowledge to a smart learner. Thank you, trainer!') },
    { kind: 'say', mood: 'happy', text: L('Jetzt weißt du: KI lernt aus Daten, sie rechnet mit Zahlen, sie kann sich irren – und du kannst sie prüfen. Bleib neugierig!', 'Now you know: AI learns from data, it calculates with numbers, it can be wrong – and you can check it. Stay curious!') },
  ],
};

export default lesson;
