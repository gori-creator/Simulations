import { L } from '../../../curriculum/helpers';
import type { SortierenProps } from '../../gemeinsam/games/sortieren';
import type { LessonContent } from '../../types';

const sort: SortierenProps = {
  bins: [
    { id: 'verboten', icon: '⛔', label: L('verboten', 'prohibited') },
    { id: 'hoch', icon: '⚠️', label: L('hohes Risiko', 'high risk') },
    { id: 'transparenz', icon: '🏷️', label: L('Transparenzpflicht', 'transparency duty') },
    { id: 'minimal', icon: '✅', label: L('minimales Risiko', 'minimal risk') },
  ],
  items: [
    { icon: '🧮', text: L('Ein Staat vergibt Punkte für „gutes Verhalten“ der Bürger und benachteiligt Menschen mit wenig Punkten.', 'A state awards points for citizens’ “good behaviour” and disadvantages people with few points.'), bin: 'verboten', why: L('„Social Scoring“ ist in der EU verboten.', '“Social scoring” is prohibited in the EU.') },
    { icon: '😠', text: L('Eine Schule lässt per Kamera die Gefühle der Schülerinnen und Schüler erkennen.', 'A school uses cameras to recognise students’ emotions.'), bin: 'verboten', why: L('Emotionserkennung in Schulen und am Arbeitsplatz ist verboten (Ausnahmen nur aus medizinischen oder Sicherheitsgründen).', 'Emotion recognition in schools and workplaces is prohibited (exceptions only for medical or safety reasons).') },
    { icon: '🧸', text: L('Ein sprechendes Spielzeug überredet Kinder gezielt zu gefährlichen Mutproben.', 'A talking toy deliberately persuades children to do dangerous dares.'), bin: 'verboten', why: L('Manipulation, die die Schutzbedürftigkeit von Kindern ausnutzt und schaden kann, ist verboten.', 'Manipulation that exploits children’s vulnerability and can cause harm is prohibited.') },
    { icon: '📝', text: L('Eine KI bewertet Abiturklausuren.', 'An AI grades final school exams.'), bin: 'hoch', why: L('Bildung (Prüfungen, Zulassung) zählt zu den Hochrisiko-Bereichen: Es gelten strenge Pflichten zu Daten, Dokumentation und menschlicher Aufsicht.', 'Education (exams, admission) is a high-risk area: strict duties apply on data, documentation and human oversight.') },
    { icon: '💼', text: L('Eine KI sortiert Bewerbungen vor.', 'An AI pre-sorts job applications.'), bin: 'hoch', why: L('Beschäftigung und Personalauswahl sind Hochrisiko-Bereiche.', 'Employment and recruitment are high-risk areas.') },
    { icon: '🏦', text: L('Eine KI prüft, ob jemand einen Kredit bekommt.', 'An AI checks whether someone gets a loan.'), bin: 'hoch', why: L('Kreditwürdigkeit entscheidet über Lebenschancen – Hochrisiko.', 'Creditworthiness decides about life chances – high risk.') },
    { icon: '💬', text: L('Ein Chatbot beantwortet Fragen im Kundenservice.', 'A chatbot answers questions in customer service.'), bin: 'transparenz', why: L('Er muss sich als KI zu erkennen geben.', 'It must disclose that it is an AI.') },
    { icon: '🎬', text: L('Ein täuschend echtes KI-Video einer Politikerin.', 'A deceptively real AI video of a politician.'), bin: 'transparenz', why: L('Deepfakes müssen als künstlich erzeugt gekennzeichnet werden.', 'Deepfakes must be labelled as artificially generated.') },
    { icon: '📧', text: L('Ein Spamfilter im E-Mail-Programm.', 'A spam filter in an email program.'), bin: 'minimal', why: L('Geringes Risiko – keine besonderen Pflichten.', 'Low risk – no special obligations.') },
    { icon: '🎮', text: L('Gegner in einem Videospiel, die von einer KI gesteuert werden.', 'Opponents in a video game controlled by an AI.'), bin: 'minimal', why: L('Minimales Risiko.', 'Minimal risk.') },
  ],
  done: L('{n} von {total} richtig eingeordnet. Je höher das Risiko für Menschen, desto strenger die Regeln.', '{n} of {total} sorted correctly. The higher the risk to people, the stricter the rules.'),
};

const lesson: LessonContent = {
  takeaway: L('Der AI Act regelt nach Risiko: verboten, hohes Risiko mit Pflichten, Transparenzpflichten, sonst kaum Vorgaben.', 'The AI Act regulates by risk: banned, high risk with obligations, transparency duties, otherwise hardly any rules.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('Seit dem 1. August 2024 gilt in der EU die KI-Verordnung, der AI Act – das erste umfassende KI-Gesetz der Welt. Ihre Pflichten treten schrittweise in Kraft. Sie fragt nicht, welche Technik benutzt wird, sondern wofür.', 'Since 1 August 2024 the EU’s AI Regulation, the AI Act, has been in force – the world’s first comprehensive AI law. Its obligations take effect step by step. It doesn’t ask which technique is used, but what it is used for.') },
    {
      kind: 'info',
      title: L('Ein Gesetz nach Risiko', 'A law by risk'),
      text: L(
        'Unannehmbares Risiko: verboten. Hohes Risiko (z. B. Bildung, Arbeit, Kredit, kritische Infrastruktur, Strafverfolgung): erlaubt, aber mit Pflichten wie guter Datenqualität, Dokumentation, Protokollen und menschlicher Aufsicht. Begrenztes Risiko: Transparenzpflichten (Chatbots, Deepfakes). Minimales Risiko: keine besonderen Pflichten. Für große Allzweckmodelle wie Sprachmodelle gibt es eigene Regeln.',
        'Unacceptable risk: prohibited. High risk (e.g. education, employment, credit, critical infrastructure, law enforcement): allowed, but with duties such as good data quality, documentation, logs and human oversight. Limited risk: transparency duties (chatbots, deepfakes). Minimal risk: no special obligations. Large general-purpose models such as language models have their own rules.',
      ),
    },
    { kind: 'game', game: 'sortieren', props: sort, intro: L('Ordne jede Anwendung der passenden Stufe zu.', 'Assign each application to the right level.') },
    {
      kind: 'info',
      tone: 'plain',
      title: L('Ein Entwurf, kein Rechtsrat', 'A draft, not legal advice'),
      text: L(
        'Die Einordnung hier ist vereinfacht. Ob eine Anwendung im Einzelfall verboten oder hochriskant ist, hängt von Details ab, und Teile des Gesetzes werden noch durch Leitlinien und Normen ausgefüllt.',
        'The classification here is simplified. Whether an application is prohibited or high-risk in a given case depends on details, and parts of the law are still being filled in by guidelines and standards.',
      ),
    },
    {
      kind: 'choice',
      question: L('Warum regelt der AI Act Anwendungen statt Techniken?', 'Why does the AI Act regulate applications rather than techniques?'),
      options: [
        { text: L('Dieselbe Technik kann harmlos (Spamfilter) oder folgenreich (Bewerberauswahl) sein – entscheidend ist, was sie mit Menschen macht.', 'The same technique can be harmless (spam filter) or consequential (job candidate selection) – what matters is what it does to people.'), correct: true, feedback: L('Genau.', 'Exactly.') },
        { text: L('Weil Techniken geheim sind.', 'Because techniques are secret.'), feedback: L('Viele sind öffentlich – darum geht es nicht.', 'Many are public – that’s not the point.') },
        { text: L('Weil KI-Techniken alle gleich sind.', 'Because all AI techniques are the same.'), feedback: L('Du kennst inzwischen sehr verschiedene.', 'By now you know very different ones.') },
      ],
    },
    { kind: 'say', mood: 'wink', text: L('Eine letzte Mission fehlt noch: der ganze Zeitstrahl – und deine eigene Position.', 'One last mission is left: the whole timeline – and your own position.') },
  ],
};

export default lesson;
