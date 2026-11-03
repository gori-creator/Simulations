import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Empfehlungen zeigen mehr von dem, was du schon angeschaut hast. So kann eine Filterblase entstehen.', 'Recommendations show more of what you have already watched. That is how a filter bubble can form.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Warum zeigt dir eine Video-App genau diese Videos? Niemand sucht sie von Hand aus. Ein Programm – ein Empfehlungs-Algorithmus – rechnet aus, was du wahrscheinlich anschaust.', 'Why does a video app show you exactly these videos? Nobody picks them by hand. A program – a recommendation algorithm – calculates what you’ll probably watch.') },
    {
      kind: 'predict',
      question: L('Du schaust drei Tiervideos an. Was passiert mit deinem Feed?', 'You watch three animal videos. What happens to your feed?'),
      options: [
        { text: L('Nichts', 'Nothing') },
        { text: L('Mehr Tiervideos', 'More animal videos') },
        { text: L('Weniger Tiervideos', 'Fewer animal videos') },
      ],
      reveal: L('Probier es aus – und schau rechts, was der Algorithmus vorhat.', 'Try it – and look on the right at what the algorithm is planning.'),
    },
    { kind: 'game', game: 'feed', intro: L('Tippe Videos an, die du anschauen würdest. Rechts siehst du, was der Algorithmus daraus lernt.', 'Tap videos you would watch. On the right you see what the algorithm learns from it.') },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Wofür wird der Algorithmus belohnt?', 'What is the algorithm rewarded for?'),
      text: L('Die meisten Apps verdienen Geld, wenn du lange bleibst – zum Beispiel mit Werbung. Darum lernt der Algorithmus vor allem, was dich festhält. Ob dir das guttut, ob es wahr ist oder ob du Neues entdeckst, zählt für ihn nicht automatisch.', 'Most apps earn money when you stay a long time – for example through advertising. That’s why the algorithm mainly learns what keeps you hooked. Whether that’s good for you, whether it’s true or whether you discover new things doesn’t automatically count for it.'),
    },
    {
      kind: 'choice',
      question: L('Was hilft gegen die Filterblase?', 'What helps against the filter bubble?'),
      options: [
        { text: L('Bewusst auch mal etwas anderes suchen und anschauen.', 'Deliberately searching for and watching something different sometimes.'), correct: true, feedback: L('Genau! Du kannst den Algorithmus mit deinem Verhalten mitsteuern.', 'Exactly! You can help steer the algorithm with your behaviour.') },
        { text: L('Immer nur das anschauen, was vorgeschlagen wird.', 'Only ever watching what’s suggested.'), feedback: L('Dann wird die Blase immer enger.', 'Then the bubble gets tighter and tighter.') },
        { text: L('Gar nichts, das ist Zufall.', 'Nothing, it’s random.'), feedback: L('Das ist kein Zufall – der Algorithmus rechnet mit deinen Klicks.', 'It’s not random – the algorithm calculates with your clicks.') },
      ],
    },
    {
      kind: 'choice',
      question: L('Du merkst, dass du schon eine Stunde scrollst, obwohl du nur kurz schauen wolltest. Was ist eine gute Idee?', 'You notice you’ve been scrolling for an hour although you only wanted a quick look. What’s a good idea?'),
      options: [
        { text: L('Eine Pause machen oder eine Zeitgrenze in der App einstellen.', 'Take a break or set a time limit in the app.'), correct: true, feedback: L('Genau. Viele Handys haben dafür eine Bildschirmzeit-Einstellung.', 'Exactly. Many phones have a screen-time setting for this.') },
        { text: L('Weiterscrollen, gleich kommt bestimmt was Tolles.', 'Keep scrolling, something great is bound to come soon.'), feedback: L('Genau darauf ist der Feed gebaut – es kommt immer „gleich“ etwas.', 'That’s exactly what the feed is built for – something is always “coming soon”.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('Algorithmen bestimmen mit, was du siehst. Als Nächstes prüfen wir, ob man KI-Antworten einfach glauben kann.', 'Algorithms help decide what you see. Next we check whether you can simply believe AI answers.') },
  ],
};

export default lesson;
