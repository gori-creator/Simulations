import { L } from '../../../curriculum/helpers';
import type { LessonContent } from '../../types';

const lesson: LessonContent = {
  takeaway: L('Expertensysteme verketten Wenn-dann-Regeln vorwärts bis zum Ergebnis. Ihr Wissen muss von Hand eingegeben werden – das begrenzt sie.', 'Expert systems chain if-then rules forward to a result. Their knowledge has to be entered by hand – and that limits them.'),
  steps: [
    { kind: 'say', mood: 'happy', text: L('In den 1970ern hieß die Idee: Intelligenz ist Wissen. Also befragt man Fachleute, schreibt ihr Wissen als Wenn-dann-Regeln auf und lässt den Computer daraus schließen. So entstehen Expertensysteme.', 'In the 1970s the idea was: intelligence is knowledge. So you interview experts, write their knowledge down as if-then rules and let the computer reason from them. That’s how expert systems came about.') },
    {
      kind: 'info',
      title: L('Daten, Information, Wissen', 'Data, information, knowledge'),
      text: L(
        '„39,7“ sind Daten – nur Zeichen. „Die Körpertemperatur beträgt 39,7 °C“ ist Information – Daten mit Bedeutung. „Wer über 39 °C hat, hat hohes Fieber und sollte ärztlich untersucht werden“ ist Wissen – Information, mit der man handeln kann. Expertensysteme speichern solches Wissen ausdrücklich als Regeln.',
        '“39.7” is data – just symbols. “The body temperature is 39.7 °C” is information – data with meaning. “Anyone above 39 °C has a high fever and should see a doctor” is knowledge – information you can act on. Expert systems store such knowledge explicitly as rules.',
      ),
    },
    { kind: 'game', game: 'regeln', intro: L('Hier ist eine kleine Wissensbasis für Tiere. Lass das System zuerst Schritt für Schritt einen Gepard erkennen.', 'Here is a small knowledge base about animals. First let the system recognise a cheetah step by step.') },
    {
      kind: 'info',
      title: L('Vorwärts und rückwärts schließen', 'Forward and backward chaining'),
      text: L(
        'Unser System schließt vorwärts: von den Fakten zu den Folgerungen, bis keine Regel mehr feuert. Man kann auch rückwärts schließen: von einer Vermutung („Ist es ein Tiger?“) zu den Bedingungen, die man dafür prüfen muss. MYCIN arbeitete rückwärts und fragte gezielt nach Laborwerten – und es gab zu jeder Regel einen Sicherheitsfaktor, weil medizinisches Wissen selten ganz sicher ist.',
        'Our system chains forward: from facts to conclusions until no rule fires any more. You can also chain backward: from a hypothesis (“is it a tiger?”) to the conditions you need to check. MYCIN chained backward and asked specifically for lab results – and each rule had a certainty factor, because medical knowledge is rarely completely certain.',
      ),
    },
    {
      kind: 'choice',
      question: L('Was ist die große Stärke eines Expertensystems?', 'What is the great strength of an expert system?'),
      options: [
        { text: L('Es kann jede Entscheidung Schritt für Schritt begründen.', 'It can justify every decision step by step.'), correct: true, feedback: L('Ja: Die Kette der gefeuerten Regeln ist die Erklärung.', 'Yes: the chain of fired rules is the explanation.') },
        { text: L('Es lernt neue Tiere von selbst.', 'It learns new animals by itself.'), feedback: L('Gerade nicht – du musstest die Strauß-Regel von Hand bauen.', 'Precisely not – you had to build the ostrich rule by hand.') },
        { text: L('Es kommt mit unvollständigen Beschreibungen gut zurecht.', 'It copes well with incomplete descriptions.'), feedback: L('Fehlt eine Bedingung, feuert die Regel einfach nicht.', 'If a condition is missing, the rule simply doesn’t fire.') },
      ],
    },
    {
      kind: 'choice',
      question: L('Warum scheiterten Expertensysteme trotzdem oft in der Praxis?', 'Why did expert systems still often fail in practice?'),
      options: [
        { text: L('Computer waren zu langsam für Wenn-dann-Regeln.', 'Computers were too slow for if-then rules.'), feedback: L('Regeln prüfen ging schon damals schnell genug.', 'Checking rules was fast enough even then.') },
        { text: L('Wissen in Regeln zu fassen ist mühsam, nie vollständig und bricht bei Ausnahmen.', 'Capturing knowledge in rules is laborious, never complete and breaks on exceptions.'), correct: true, feedback: L('Genau: Man nennt das den Engpass beim Wissenserwerb.', 'Exactly: this is called the knowledge acquisition bottleneck.') },
        { text: L('Fachleute wollten ihr Wissen nicht verraten.', 'Experts refused to share their knowledge.'), feedback: L('Das kam vor, war aber nicht das Hauptproblem.', 'That happened, but it wasn’t the main problem.') },
      ],
      explain: L('Viel Wissen von Fachleuten ist unausgesprochen („Bauchgefühl“) und lässt sich schwer in Regeln fassen. Die Lösung der nächsten Jahrzehnte: Das Wissen nicht aufschreiben, sondern aus Beispielen lernen lassen.', 'Much expert knowledge is implicit (“gut feeling”) and hard to put into rules. The answer of the following decades: don’t write the knowledge down – let it be learned from examples.'),
    },
    { kind: 'say', mood: 'wink', text: L('Regeln sind die eine Säule der klassischen KI. Die andere heißt Suche: Probleme als Wege durch einen riesigen Raum von Möglichkeiten. Darum geht es in der nächsten Welt.', 'Rules are one pillar of classical AI. The other is search: problems as paths through a huge space of possibilities. That’s the next world.') },
  ],
};

export default lesson;
