import { L } from '../../../curriculum/helpers';
import type { KartenProps } from '../../gemeinsam/games/karten';
import type { LessonContent } from '../../types';

const cards: KartenProps = {
  a: L('Vorsicht, prüfen!', 'Careful, check!'),
  b: L('Spricht eher für echt', 'Rather suggests real'),
  aIcon: '🚩',
  bIcon: '✅',
  cards: [
    { emoji: '😱', text: L('Das Bild ist super aufregend und alle sollen es sofort teilen.', 'The picture is super exciting and everyone is supposed to share it right away.'), answer: 'a', why: L('Fälschungen sollen oft Wut oder Angst machen, damit man nicht nachdenkt.', 'Fakes often try to cause anger or fear so you don’t think.') },
    { emoji: '📰', text: L('Mehrere bekannte Nachrichtenseiten berichten darüber, mit Fotos aus anderen Blickwinkeln.', 'Several well-known news sites report on it, with photos from other angles.'), answer: 'b', why: L('Unabhängige Quellen, die dasselbe zeigen, sprechen für ein echtes Ereignis.', 'Independent sources showing the same thing suggest a real event.') },
    { emoji: '🆕', text: L('Gepostet von einem Konto, das erst gestern erstellt wurde.', 'Posted by an account created only yesterday.'), answer: 'a', why: L('Neue, unbekannte Konten verbreiten öfter Falsches.', 'New, unknown accounts spread false things more often.') },
    { emoji: '🔎', text: L('Die Bildersuche zeigt: Dasselbe Foto gab es schon vor Jahren – zu einem ganz anderen Ereignis.', 'Image search shows: the same photo existed years ago – for a completely different event.'), answer: 'a', why: L('Auch echte Fotos werden falsch benutzt. Das ist auch ein Fake.', 'Real photos get misused too. That’s also a fake.') },
    { emoji: '🏷️', text: L('Unter dem Bild steht „mit KI erzeugt“.', 'Below the picture it says “made with AI”.'), answer: 'a', why: L('Ehrlich gekennzeichnet – aber es ist kein echtes Foto.', 'Honestly labelled – but it’s not a real photo.') },
    { emoji: '📸', text: L('Der Fotograf und der Ort sind angegeben, und das Foto passt zu anderen Bildern von dort.', 'The photographer and the place are given, and the photo matches other pictures from there.'), answer: 'b', why: L('Nachprüfbare Angaben sind ein gutes Zeichen.', 'Checkable details are a good sign.') },
  ],
  done: L('{n} von {total} richtig! Merke: nicht nur aufs Bild schauen, sondern auf Quelle und Zusammenhang.', '{n} of {total} right! Remember: don’t just look at the picture, look at the source and the context.'),
};

const lesson: LessonContent = {
  takeaway: L('Bilder und Videos können täuschend echt erfunden sein. Prüfe die Quelle, bevor du etwas glaubst oder teilst.', 'Pictures and videos can be invented and still look real. Check the source before you believe or share something.'),
  steps: [
    { kind: 'say', mood: 'think', text: L('2023 ging ein Bild um die Welt: der Papst in einer weißen Daunenjacke. Viele hielten es für echt. Es war mit KI erzeugt.', 'In 2023 a picture went around the world: the Pope in a white puffer jacket. Many people thought it was real. It was made with AI.') },
    {
      kind: 'predict',
      question: L('Woran erkennst du heute am sichersten ein gefälschtes Bild?', 'What is the surest way today to spot a fake picture?'),
      options: [
        { text: L('An Fehlern wie sechs Fingern', 'Mistakes like six fingers') },
        { text: L('An der Quelle und am Zusammenhang', 'The source and the context') },
        { text: L('Man erkennt es gar nicht', 'You can’t tell at all') },
      ],
      reveal: L('Bildfehler werden immer seltener. Prüfen, woher ein Bild kommt, hilft dagegen immer.', 'Image glitches are getting rarer. Checking where a picture comes from always helps, though.'),
    },
    { kind: 'game', game: 'karten', props: cards, intro: L('Ein Bild geht viral. Was ist ein Warnzeichen – und was spricht für echt?', 'A picture goes viral. What is a warning sign – and what suggests it’s real?') },
    {
      kind: 'choice',
      question: L('Du bist unsicher, ob ein Bild echt ist. Was tust du?', 'You’re unsure whether a picture is real. What do you do?'),
      options: [
        { text: L('Erst mal nicht teilen und nachprüfen – oder jemanden fragen.', 'Don’t share it for now and check – or ask someone.'), correct: true, feedback: L('Genau! Nicht teilen ist nie falsch, wenn man unsicher ist.', 'Exactly! Not sharing is never wrong when you’re unsure.') },
        { text: L('Schnell an alle schicken, bevor es andere tun.', 'Quickly send it to everyone before others do.'), feedback: L('So verbreiten sich Fälschungen. Erst prüfen!', 'That’s how fakes spread. Check first!') },
      ],
    },
    {
      kind: 'info',
      title: L('Gesetze gegen Täuschung', 'Laws against deception'),
      text: L('In der EU müssen mit KI erzeugte Bilder und Videos, die echt aussehen, gekennzeichnet werden. Gefälschte Bilder von echten Menschen können außerdem Rechte verletzen – zum Beispiel das Recht am eigenen Bild.', 'In the EU, AI-generated pictures and videos that look real must be labelled. Fake pictures of real people can also violate rights – for example the right to one’s own image.'),
    },
    { kind: 'say', mood: 'wink', text: L('Jetzt weißt du, wie KI Bilder und Texte macht. In der letzten Welt geht es um uns: Was macht KI mit dir?', 'Now you know how AI makes pictures and texts. The last world is about us: what does AI do to you?') },
  ],
};

export default lesson;
