import { L } from '../helpers';
import type { StateCurriculum } from './types';

/** Startseite des Hessischen Kultusministeriums; dort stehen die Kerncurricula (Sek. I und gymnasiale Oberstufe). */
const SOURCE = 'https://kultus.hessen.de';

// Hinweise je Jahrgangsstufe: Annahmen der Aufbereitung sichtbar machen (siehe docs/lehrplaene/hessen-gymnasium-physik.md, Teil E).
const STUFE_1 = L(
  'Stufe 1 („nach ca. der Hälfte des Stundenkontingents“): Das Kerncurriculum ordnet sie keiner Jahrgangsstufe zu; die Einordnung bei Jahrgangsstufe 6–8 ist eine Annahme. Ab wann Physik unterrichtet wird, regelt die Stundentafel. Jede Simulation steht bei den Jahrgangsstufen, für die sie gedacht ist; bei den anderen führt ein Verweis dorthin. Die Nummern (Inhaltsfeld.Schwerpunkt) sind von uns vergeben.',
  'Stage 1 (“after about half of the allotted teaching time”): the core curriculum does not assign it to a grade; placing it in grades 6–8 is an assumption. When physics starts depends on the timetable. Each simulation is listed under the grades it is designed for; the other grades link to it. The numbers (content area.focus) are our own.',
);

const STUFE_2 = L(
  'Stufe 2: zusätzliche Schwerpunkte bis zum Ende der Jahrgangsstufe 9/10; die Inhalte von Stufe 1 (Jahrgangsstufe 6–8) werden vorausgesetzt. Die Lernbereiche stehen bei 9 und 10 gleich. Jede Simulation steht bei der Jahrgangsstufe, für die sie gedacht ist; bei der anderen führt ein Verweis dorthin. Die Nummern (Inhaltsfeld.Schwerpunkt) sind von uns vergeben.',
  'Stage 2: additional focal points up to the end of grade 9/10; stage 1 content (grades 6–8) is assumed. The units are the same for grades 9 and 10. Each simulation is listed under the grade it is designed for; the other grade links to it. The numbers (content area.focus) are our own.',
);

const E_PHASE = L(
  'Einführungsphase E1/E2 „Mechanik“. Verbindlich sind die Themenfelder E.1–E.3. Das Kerncurriculum nennt nur Kurshalbjahre; die Zuordnung zu Jahrgangsstufe 11 ist eine Annahme (G9).',
  'Introductory phase E1/E2 “Mechanics”. Topic areas E.1–E.3 are mandatory. The core curriculum only names course half-years; assigning them to grade 11 is an assumption (G9).',
);

const Q1_Q2 = L(
  'Qualifikationsphase Q1 „Elektrisches und magnetisches Feld“ und Q2 „Schwingungen, Induktion und mechanische Wellen“. Verbindlich sind Q1.1–Q1.2 und Q2.1–Q2.3. Die Zuordnung zu Jahrgangsstufe 12 ist eine Annahme (G9). „Nur LK“ kennzeichnet das erhöhte Niveau.',
  'Qualification phase Q1 “Electric and magnetic field” and Q2 “Oscillations, induction and mechanical waves”. Q1.1–Q1.2 and Q2.1–Q2.3 are mandatory. Assigning them to grade 12 is an assumption (G9). “Advanced course only” marks the higher level.',
);

const Q3_Q4 = L(
  'Qualifikationsphase Q3 „Elektromagnetische Wellen und Quantenphysik“ und Q4 „Struktur von Materie, Raum und Zeit“. Verbindlich sind Q3.1–Q3.3 und Q4.1. Die Zuordnung zu Jahrgangsstufe 13 ist eine Annahme (G9). „Nur LK“ kennzeichnet das erhöhte Niveau.',
  'Qualification phase Q3 “Electromagnetic waves and quantum physics” and Q4 “Structure of matter, space and time”. Q3.1–Q3.3 and Q4.1 are mandatory. Assigning them to grade 13 is an assumption (G9). “Advanced course only” marks the higher level.',
);

/**
 * Physik am hessischen Gymnasium nach den Kerncurricula des Landes Hessen:
 * „Bildungsstandards und Inhaltsfelder – Das neue Kerncurriculum für Hessen,
 * Sekundarstufe I – Gymnasium, Physik“ (zwei Stufen bis Jahrgangsstufe 9/10)
 * und „Kerncurriculum gymnasiale Oberstufe Physik“ (Ausgabe 2024, Stand 01.08.2025).
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/hessen-gymnasium-physik.{json,md}.
 * Annahmen (Teil E): Stufe 1 = Jgst. 6–8, Stufe 2 = Jgst. 9/10 (der Lehrplan
 * nennt keine Jahrgangsstufen); die Sek-I-Codes (Inhaltsfeld.Schwerpunkt) sind
 * selbst vergeben. Die Oberstufe nennt nur Kurshalbjahre: E = Jgst. 11,
 * Q1/Q2 = 12, Q3/Q4 = 13 (G9-Zählung).
 *
 * Überschriften der Lernbereiche entsprechen dem Kerncurriculum; die
 * Kurzbeschreibungen sind eigene Zusammenfassungen. Verbindlich ist der
 * Originaltext.
 */
export const hessenGymnasiumPhysik: StateCurriculum = {
  id: 'hessen-gymnasium-physik',
  subject: 'physik',
  slug: L('hessen-gymnasium', 'hesse-gymnasium'),
  state: L('Hessen', 'Hesse'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Kerncurriculum',
  grades: [
    {
      grade: 6,
      sourceUrl: SOURCE,
      note: STUFE_1,
      units: [
        {
          code: '1',
          title: L('Haus der Naturwissenschaften', 'House of the natural sciences'),
          summary: L(
            'Wie Naturwissenschaft arbeitet: Körper und ihre Eigenschaften beschreiben, physikalische Größen messen und zwischen Beobachtung und Deutung unterscheiden.',
            'How science works: describing bodies and their properties, measuring physical quantities and distinguishing observation from interpretation.',
          ),
          parts: [
            {
              code: '1.1',
              title: L('Körper und deren Eigenschaften', 'Bodies and their properties'),
              summary: L(
                'Gegenstände nach messbaren Eigenschaften beschreiben und ordnen.',
                'Describing and classifying objects by measurable properties.',
              ),
            },
            {
              code: '1.2',
              title: L('Physikalische Größen und ihre Messung', 'Physical quantities and their measurement'),
              summary: L(
                'Größen mit Einheiten messen und Versuche planen und protokollieren.',
                'Measuring quantities with units and planning and recording experiments.',
              ),
            },
          ],
        },
        {
          code: '2',
          title: L('Erweiterung der Sinne', 'Extension of the senses'),
          summary: L(
            'Sehen und Hören mit dem Sender-Empfänger-Modell erklären, Schatten und das Verhalten von Licht an Grenzflächen untersuchen sowie Erscheinungen im System Sonne–Erde–Mond deuten.',
            'Explaining seeing and hearing with the sender–receiver model, investigating shadows and the behaviour of light at boundaries, and interpreting phenomena of the Sun–Earth–Moon system.',
          ),
          parts: [
            {
              code: '2.1',
              title: L('Wahrnehmung der Umgebung mit den Sinnesorganen', 'Perceiving the surroundings with the sense organs'),
              summary: L('Wie Auge und Ohr Licht und Schall wahrnehmen.', 'How eye and ear perceive light and sound.'),
            },
            {
              code: '2.2',
              title: L('Sender-Empfänger-Modell', 'Sender–receiver model'),
              summary: L(
                'Lichtquelle bzw. Schallquelle, Ausbreitung und Empfänger unterscheiden.',
                'Distinguishing source, propagation and receiver of light or sound.',
              ),
            },
            {
              code: '2.3',
              title: L('Schatten als Abwesenheit von Licht', 'Shadow as the absence of light'),
              summary: L(
                'Schattenentstehung mit geradliniger Lichtausbreitung erklären.',
                'Explaining shadows with the rectilinear propagation of light.',
              ),
              simulations: ['licht-schatten'],
            },
            {
              code: '2.4',
              title: L('Verhalten von Licht an Grenzflächen', 'Behaviour of light at boundaries'),
              summary: L(
                'Reflexion und Brechung von Licht experimentell untersuchen.',
                'Investigating reflection and refraction of light experimentally.',
              ),
              simulations: ['reflexion'],
            },
            {
              code: '2.5',
              title: L(
                'Astronomische Phänomene durch Konstellationen von Sonne-Erde-Mond',
                'Astronomical phenomena due to Sun–Earth–Moon constellations',
              ),
              summary: L(
                'Mondphasen, Finsternisse u. Ä. mit Modellen erklären.',
                'Explaining lunar phases, eclipses and similar phenomena with models.',
              ),
            },
          ],
        },
        {
          code: '3',
          title: L('Energie in Umwelt und Technik', 'Energy in the environment and technology'),
          summary: L(
            'Ein anschaulicher Energiebegriff: Energie wird transportiert und geht als nutzlose Wärme an die Umgebung (Entwertung); Energiesparen im Haushalt.',
            'An intuitive concept of energy: energy is transported and dissipated as useless heat to the surroundings; saving energy at home.',
          ),
          parts: [
            {
              code: '3.1',
              title: L('Anschaulicher Energiebegriff', 'Intuitive concept of energy'),
              summary: L(
                'Energie als Größe, die in vielen Formen vorkommt und Vorgänge antreibt.',
                'Energy as a quantity that occurs in many forms and drives processes.',
              ),
            },
            {
              code: '3.2',
              title: L('Energietransport', 'Energy transport'),
              summary: L('Wege, auf denen Energie von einem Ort zum anderen gelangt.', 'Ways in which energy gets from one place to another.'),
            },
            {
              code: '3.3',
              title: L('Energiestrom in die Umgebung als Entwertung von Energie', 'Energy flow to the surroundings as degradation of energy'),
              summary: L(
                'Verstehen, dass Energie nicht verschwindet, aber an Nutzbarkeit verliert.',
                'Understanding that energy does not vanish but becomes less usable.',
              ),
            },
          ],
        },
        {
          code: '4',
          title: L('Elektrizität im Alltag', 'Electricity in everyday life'),
          summary: L(
            'Elektrischer Strom als Energietransport, Bauteile und Aufbau einfacher Stromkreise, Leiter und Isolatoren sowie sicherer Umgang mit Elektrizität.',
            'Electric current as energy transport, components and setup of simple circuits, conductors and insulators, and safe handling of electricity.',
          ),
          parts: [
            {
              code: '4.1',
              title: L('Elektrischer Strom als Transportform von Energie', 'Electric current as a means of transporting energy'),
              summary: L(
                'Mit einem Modell erklären, wie der Stromkreis Energie überträgt.',
                'Explaining with a model how a circuit transfers energy.',
              ),
            },
            {
              code: '4.2',
              title: L('Elemente des elektrischen Stromkreises', 'Elements of the electric circuit'),
              summary: L('Quelle, Leitung, Schalter und Verbraucher sowie Schaltskizzen.', 'Source, wires, switch and load, and circuit diagrams.'),
            },
            {
              code: '4.3',
              title: L('Gefahren beim Umgang mit Elektrizität im Alltag', 'Dangers of electricity in everyday life'),
              summary: L('Gefahren erkennen und sicheres Verhalten begründen.', 'Recognising dangers and justifying safe behaviour.'),
            },
          ],
        },
        {
          code: '5',
          title: L('Wettererscheinungen und Klima', 'Weather phenomena and climate'),
          summary: L(
            'Temperatur und ihre Messung, Teilchenmodell der Materie, Aggregatzustände, Wärmeausdehnung und Anomalie des Wassers sowie ein erster Druckbegriff.',
            'Temperature and its measurement, the particle model of matter, states of matter, thermal expansion and the anomaly of water, and a first idea of pressure.',
          ),
          parts: [
            {
              code: '5.1',
              title: L('Temperatur und deren Messung', 'Temperature and its measurement'),
              summary: L('Thermometer verstehen und kalibrieren.', 'Understanding and calibrating thermometers.'),
            },
            {
              code: '5.2',
              title: L('Modelle des Aufbaus der Materie', 'Models of the structure of matter'),
              summary: L('Stoffe mit einem Teilchenmodell beschreiben.', 'Describing substances with a particle model.'),
            },
            {
              code: '5.3',
              title: L('Aggregatzustände und deren Übergänge', 'States of matter and their transitions'),
              summary: L(
                'Schmelzen, Verdampfen usw. mit dem Teilchenmodell erklären.',
                'Explaining melting, evaporation etc. with the particle model.',
              ),
            },
            {
              code: '5.4',
              title: L('Stoffe bei Temperaturänderung', 'Substances when temperature changes'),
              summary: L(
                'Ausdehnung von festen, flüssigen und gasförmigen Stoffen untersuchen.',
                'Investigating the expansion of solids, liquids and gases.',
              ),
            },
            {
              code: '5.5',
              title: L('Anomalie des Wassers und seine Bedeutung für das irdische Leben', 'Anomaly of water and its importance for life on Earth'),
              summary: L(
                'Dichteverhalten von Wasser bei 4 °C und Folgen für Gewässer.',
                'Density behaviour of water at 4 °C and consequences for lakes.',
              ),
            },
            {
              code: '5.6',
              title: L('Druck als „Gepresstsein“ der Materie', 'Pressure as the \'compressed state\' of matter'),
              summary: L('Anschauliche Vorstellung von Druck.', 'An intuitive idea of pressure.'),
            },
          ],
        },
        {
          code: '6',
          title: L('Fortbewegung und Mobilität', 'Locomotion and mobility'),
          summary: L(
            'Bewegungen mit Weg, Zeit und Geschwindigkeit beschreiben und Geschwindigkeiten messen.',
            'Describing motion with distance, time and speed and measuring speeds.',
          ),
          parts: [
            {
              code: '6.1',
              title: L('Weg, Zeit und Geschwindigkeit', 'Distance, time and speed'),
              summary: L(
                'Geschwindigkeiten messen und Bewegungen in Diagrammen darstellen.',
                'Measuring speeds and representing motion in diagrams.',
              ),
            },
          ],
        },
        {
          code: '7',
          title: L('Technik im Dienst des Menschen', 'Technology in the service of people'),
          summary: L(
            'Eigenschaften von Magneten, Modell der Elementarmagnete und Magnetfelder.',
            'Properties of magnets, the model of elementary magnets and magnetic fields.',
          ),
          parts: [
            {
              code: '7.1',
              title: L('Magnetismus', 'Magnetism'),
              summary: L(
                'Magnete untersuchen, Feldlinien zeichnen und mit Elementarmagneten erklären.',
                'Investigating magnets, drawing field lines and explaining them with elementary magnets.',
              ),
            },
          ],
        },
        {
          code: '8',
          title: L('Zukunftssichere Energieversorgung', 'Sustainable energy supply'),
          summary: L(
            'Regenerative und erschöpfbare Energieträger unterscheiden und Energiekosten im Alltag deuten.',
            'Distinguishing renewable and finite energy sources and interpreting everyday energy costs.',
          ),
          parts: [
            {
              code: '8.1',
              title: L('Unterscheidung zwischen regenerativen und erschöpfbaren Energien', 'Distinguishing renewable and finite energy sources'),
              summary: L(
                'Energieträger nach Verfügbarkeit einordnen und eigenes Verhalten bewerten.',
                'Classifying energy sources by availability and evaluating one\'s own behaviour.',
              ),
            },
          ],
        },
        {
          code: '9',
          title: L('Physik in der Verantwortung', 'Physics and responsibility'),
          summary: L(
            'Verantwortung für die Umwelt und die Rolle der Physik bei Natur- und Umweltereignissen.',
            'Responsibility for the environment and the role of physics in natural and environmental events.',
          ),
          parts: [
            {
              code: '9.1',
              title: L('Verantwortung gegenüber der Umwelt', 'Responsibility towards the environment'),
              summary: L(
                'Umwelt- und Gesundheitsaspekte beim Experimentieren und im Alltag berücksichtigen.',
                'Taking environmental and health aspects into account in experiments and everyday life.',
              ),
            },
            {
              code: '9.2',
              title: L('Rolle der Physik bei Umwelt- und Naturereignissen', 'Role of physics in environmental and natural events'),
              summary: L(
                'Physikalische Informationen aus Meldungen zu Ereignissen entnehmen.',
                'Extracting physical information from reports on events.',
              ),
            },
          ],
        },
      ],
    },
    {
      grade: 7,
      sourceUrl: SOURCE,
      note: STUFE_1,
      units: [
        {
          code: '1',
          title: L('Haus der Naturwissenschaften', 'House of the natural sciences'),
          summary: L(
            'Wie Naturwissenschaft arbeitet: Körper und ihre Eigenschaften beschreiben, physikalische Größen messen und zwischen Beobachtung und Deutung unterscheiden.',
            'How science works: describing bodies and their properties, measuring physical quantities and distinguishing observation from interpretation.',
          ),
          parts: [
            {
              code: '1.1',
              title: L('Körper und deren Eigenschaften', 'Bodies and their properties'),
              summary: L(
                'Gegenstände nach messbaren Eigenschaften beschreiben und ordnen.',
                'Describing and classifying objects by measurable properties.',
              ),
            },
            {
              code: '1.2',
              title: L('Physikalische Größen und ihre Messung', 'Physical quantities and their measurement'),
              summary: L(
                'Größen mit Einheiten messen und Versuche planen und protokollieren.',
                'Measuring quantities with units and planning and recording experiments.',
              ),
            },
          ],
        },
        {
          code: '2',
          title: L('Erweiterung der Sinne', 'Extension of the senses'),
          summary: L(
            'Sehen und Hören mit dem Sender-Empfänger-Modell erklären, Schatten und das Verhalten von Licht an Grenzflächen untersuchen sowie Erscheinungen im System Sonne–Erde–Mond deuten.',
            'Explaining seeing and hearing with the sender–receiver model, investigating shadows and the behaviour of light at boundaries, and interpreting phenomena of the Sun–Earth–Moon system.',
          ),
          parts: [
            {
              code: '2.1',
              title: L('Wahrnehmung der Umgebung mit den Sinnesorganen', 'Perceiving the surroundings with the sense organs'),
              summary: L('Wie Auge und Ohr Licht und Schall wahrnehmen.', 'How eye and ear perceive light and sound.'),
            },
            {
              code: '2.2',
              title: L('Sender-Empfänger-Modell', 'Sender–receiver model'),
              summary: L(
                'Lichtquelle bzw. Schallquelle, Ausbreitung und Empfänger unterscheiden.',
                'Distinguishing source, propagation and receiver of light or sound.',
              ),
            },
            {
              code: '2.3',
              title: L('Schatten als Abwesenheit von Licht', 'Shadow as the absence of light'),
              summary: L(
                'Schattenentstehung mit geradliniger Lichtausbreitung erklären.',
                'Explaining shadows with the rectilinear propagation of light.',
              ),
              simulations: ['licht-schatten'],
            },
            {
              code: '2.4',
              title: L('Verhalten von Licht an Grenzflächen', 'Behaviour of light at boundaries'),
              summary: L(
                'Reflexion und Brechung von Licht experimentell untersuchen.',
                'Investigating reflection and refraction of light experimentally.',
              ),
              simulations: ['reflexion'],
            },
            {
              code: '2.5',
              title: L(
                'Astronomische Phänomene durch Konstellationen von Sonne-Erde-Mond',
                'Astronomical phenomena due to Sun–Earth–Moon constellations',
              ),
              summary: L(
                'Mondphasen, Finsternisse u. Ä. mit Modellen erklären.',
                'Explaining lunar phases, eclipses and similar phenomena with models.',
              ),
            },
          ],
        },
        {
          code: '3',
          title: L('Energie in Umwelt und Technik', 'Energy in the environment and technology'),
          summary: L(
            'Ein anschaulicher Energiebegriff: Energie wird transportiert und geht als nutzlose Wärme an die Umgebung (Entwertung); Energiesparen im Haushalt.',
            'An intuitive concept of energy: energy is transported and dissipated as useless heat to the surroundings; saving energy at home.',
          ),
          parts: [
            {
              code: '3.1',
              title: L('Anschaulicher Energiebegriff', 'Intuitive concept of energy'),
              summary: L(
                'Energie als Größe, die in vielen Formen vorkommt und Vorgänge antreibt.',
                'Energy as a quantity that occurs in many forms and drives processes.',
              ),
            },
            {
              code: '3.2',
              title: L('Energietransport', 'Energy transport'),
              summary: L('Wege, auf denen Energie von einem Ort zum anderen gelangt.', 'Ways in which energy gets from one place to another.'),
            },
            {
              code: '3.3',
              title: L('Energiestrom in die Umgebung als Entwertung von Energie', 'Energy flow to the surroundings as degradation of energy'),
              summary: L(
                'Verstehen, dass Energie nicht verschwindet, aber an Nutzbarkeit verliert.',
                'Understanding that energy does not vanish but becomes less usable.',
              ),
            },
          ],
        },
        {
          code: '4',
          title: L('Elektrizität im Alltag', 'Electricity in everyday life'),
          summary: L(
            'Elektrischer Strom als Energietransport, Bauteile und Aufbau einfacher Stromkreise, Leiter und Isolatoren sowie sicherer Umgang mit Elektrizität.',
            'Electric current as energy transport, components and setup of simple circuits, conductors and insulators, and safe handling of electricity.',
          ),
          parts: [
            {
              code: '4.1',
              title: L('Elektrischer Strom als Transportform von Energie', 'Electric current as a means of transporting energy'),
              summary: L(
                'Mit einem Modell erklären, wie der Stromkreis Energie überträgt.',
                'Explaining with a model how a circuit transfers energy.',
              ),
              simulations: ['einfacher-stromkreis'],
            },
            {
              code: '4.2',
              title: L('Elemente des elektrischen Stromkreises', 'Elements of the electric circuit'),
              summary: L('Quelle, Leitung, Schalter und Verbraucher sowie Schaltskizzen.', 'Source, wires, switch and load, and circuit diagrams.'),
              simulations: ['einfacher-stromkreis'],
            },
            {
              code: '4.3',
              title: L('Gefahren beim Umgang mit Elektrizität im Alltag', 'Dangers of electricity in everyday life'),
              summary: L('Gefahren erkennen und sicheres Verhalten begründen.', 'Recognising dangers and justifying safe behaviour.'),
            },
          ],
        },
        {
          code: '5',
          title: L('Wettererscheinungen und Klima', 'Weather phenomena and climate'),
          summary: L(
            'Temperatur und ihre Messung, Teilchenmodell der Materie, Aggregatzustände, Wärmeausdehnung und Anomalie des Wassers sowie ein erster Druckbegriff.',
            'Temperature and its measurement, the particle model of matter, states of matter, thermal expansion and the anomaly of water, and a first idea of pressure.',
          ),
          parts: [
            {
              code: '5.1',
              title: L('Temperatur und deren Messung', 'Temperature and its measurement'),
              summary: L('Thermometer verstehen und kalibrieren.', 'Understanding and calibrating thermometers.'),
              simulations: ['teilchenmodell'],
            },
            {
              code: '5.2',
              title: L('Modelle des Aufbaus der Materie', 'Models of the structure of matter'),
              summary: L('Stoffe mit einem Teilchenmodell beschreiben.', 'Describing substances with a particle model.'),
              simulations: ['teilchenmodell'],
            },
            {
              code: '5.3',
              title: L('Aggregatzustände und deren Übergänge', 'States of matter and their transitions'),
              summary: L(
                'Schmelzen, Verdampfen usw. mit dem Teilchenmodell erklären.',
                'Explaining melting, evaporation etc. with the particle model.',
              ),
              simulations: ['teilchenmodell'],
            },
            {
              code: '5.4',
              title: L('Stoffe bei Temperaturänderung', 'Substances when temperature changes'),
              summary: L(
                'Ausdehnung von festen, flüssigen und gasförmigen Stoffen untersuchen.',
                'Investigating the expansion of solids, liquids and gases.',
              ),
            },
            {
              code: '5.5',
              title: L('Anomalie des Wassers und seine Bedeutung für das irdische Leben', 'Anomaly of water and its importance for life on Earth'),
              summary: L(
                'Dichteverhalten von Wasser bei 4 °C und Folgen für Gewässer.',
                'Density behaviour of water at 4 °C and consequences for lakes.',
              ),
            },
            {
              code: '5.6',
              title: L('Druck als „Gepresstsein“ der Materie', 'Pressure as the \'compressed state\' of matter'),
              summary: L('Anschauliche Vorstellung von Druck.', 'An intuitive idea of pressure.'),
            },
          ],
        },
        {
          code: '6',
          title: L('Fortbewegung und Mobilität', 'Locomotion and mobility'),
          summary: L(
            'Bewegungen mit Weg, Zeit und Geschwindigkeit beschreiben und Geschwindigkeiten messen.',
            'Describing motion with distance, time and speed and measuring speeds.',
          ),
          parts: [
            {
              code: '6.1',
              title: L('Weg, Zeit und Geschwindigkeit', 'Distance, time and speed'),
              summary: L(
                'Geschwindigkeiten messen und Bewegungen in Diagrammen darstellen.',
                'Measuring speeds and representing motion in diagrams.',
              ),
              simulations: ['bewegungsdiagramme'],
            },
          ],
        },
        {
          code: '7',
          title: L('Technik im Dienst des Menschen', 'Technology in the service of people'),
          summary: L(
            'Eigenschaften von Magneten, Modell der Elementarmagnete und Magnetfelder.',
            'Properties of magnets, the model of elementary magnets and magnetic fields.',
          ),
          parts: [
            {
              code: '7.1',
              title: L('Magnetismus', 'Magnetism'),
              summary: L(
                'Magnete untersuchen, Feldlinien zeichnen und mit Elementarmagneten erklären.',
                'Investigating magnets, drawing field lines and explaining them with elementary magnets.',
              ),
            },
          ],
        },
        {
          code: '8',
          title: L('Zukunftssichere Energieversorgung', 'Sustainable energy supply'),
          summary: L(
            'Regenerative und erschöpfbare Energieträger unterscheiden und Energiekosten im Alltag deuten.',
            'Distinguishing renewable and finite energy sources and interpreting everyday energy costs.',
          ),
          parts: [
            {
              code: '8.1',
              title: L('Unterscheidung zwischen regenerativen und erschöpfbaren Energien', 'Distinguishing renewable and finite energy sources'),
              summary: L(
                'Energieträger nach Verfügbarkeit einordnen und eigenes Verhalten bewerten.',
                'Classifying energy sources by availability and evaluating one\'s own behaviour.',
              ),
            },
          ],
        },
        {
          code: '9',
          title: L('Physik in der Verantwortung', 'Physics and responsibility'),
          summary: L(
            'Verantwortung für die Umwelt und die Rolle der Physik bei Natur- und Umweltereignissen.',
            'Responsibility for the environment and the role of physics in natural and environmental events.',
          ),
          parts: [
            {
              code: '9.1',
              title: L('Verantwortung gegenüber der Umwelt', 'Responsibility towards the environment'),
              summary: L(
                'Umwelt- und Gesundheitsaspekte beim Experimentieren und im Alltag berücksichtigen.',
                'Taking environmental and health aspects into account in experiments and everyday life.',
              ),
            },
            {
              code: '9.2',
              title: L('Rolle der Physik bei Umwelt- und Naturereignissen', 'Role of physics in environmental and natural events'),
              summary: L(
                'Physikalische Informationen aus Meldungen zu Ereignissen entnehmen.',
                'Extracting physical information from reports on events.',
              ),
            },
          ],
        },
      ],
    },
    {
      grade: 8,
      sourceUrl: SOURCE,
      note: STUFE_1,
      units: [
        {
          code: '1',
          title: L('Haus der Naturwissenschaften', 'House of the natural sciences'),
          summary: L(
            'Wie Naturwissenschaft arbeitet: Körper und ihre Eigenschaften beschreiben, physikalische Größen messen und zwischen Beobachtung und Deutung unterscheiden.',
            'How science works: describing bodies and their properties, measuring physical quantities and distinguishing observation from interpretation.',
          ),
          parts: [
            {
              code: '1.1',
              title: L('Körper und deren Eigenschaften', 'Bodies and their properties'),
              summary: L(
                'Gegenstände nach messbaren Eigenschaften beschreiben und ordnen.',
                'Describing and classifying objects by measurable properties.',
              ),
            },
            {
              code: '1.2',
              title: L('Physikalische Größen und ihre Messung', 'Physical quantities and their measurement'),
              summary: L(
                'Größen mit Einheiten messen und Versuche planen und protokollieren.',
                'Measuring quantities with units and planning and recording experiments.',
              ),
            },
          ],
        },
        {
          code: '2',
          title: L('Erweiterung der Sinne', 'Extension of the senses'),
          summary: L(
            'Sehen und Hören mit dem Sender-Empfänger-Modell erklären, Schatten und das Verhalten von Licht an Grenzflächen untersuchen sowie Erscheinungen im System Sonne–Erde–Mond deuten.',
            'Explaining seeing and hearing with the sender–receiver model, investigating shadows and the behaviour of light at boundaries, and interpreting phenomena of the Sun–Earth–Moon system.',
          ),
          parts: [
            {
              code: '2.1',
              title: L('Wahrnehmung der Umgebung mit den Sinnesorganen', 'Perceiving the surroundings with the sense organs'),
              summary: L('Wie Auge und Ohr Licht und Schall wahrnehmen.', 'How eye and ear perceive light and sound.'),
            },
            {
              code: '2.2',
              title: L('Sender-Empfänger-Modell', 'Sender–receiver model'),
              summary: L(
                'Lichtquelle bzw. Schallquelle, Ausbreitung und Empfänger unterscheiden.',
                'Distinguishing source, propagation and receiver of light or sound.',
              ),
            },
            {
              code: '2.3',
              title: L('Schatten als Abwesenheit von Licht', 'Shadow as the absence of light'),
              summary: L(
                'Schattenentstehung mit geradliniger Lichtausbreitung erklären.',
                'Explaining shadows with the rectilinear propagation of light.',
              ),
            },
            {
              code: '2.4',
              title: L('Verhalten von Licht an Grenzflächen', 'Behaviour of light at boundaries'),
              summary: L(
                'Reflexion und Brechung von Licht experimentell untersuchen.',
                'Investigating reflection and refraction of light experimentally.',
              ),
              simulations: ['reflexion', 'brechung'],
            },
            {
              code: '2.5',
              title: L(
                'Astronomische Phänomene durch Konstellationen von Sonne-Erde-Mond',
                'Astronomical phenomena due to Sun–Earth–Moon constellations',
              ),
              summary: L(
                'Mondphasen, Finsternisse u. Ä. mit Modellen erklären.',
                'Explaining lunar phases, eclipses and similar phenomena with models.',
              ),
            },
          ],
        },
        {
          code: '3',
          title: L('Energie in Umwelt und Technik', 'Energy in the environment and technology'),
          summary: L(
            'Ein anschaulicher Energiebegriff: Energie wird transportiert und geht als nutzlose Wärme an die Umgebung (Entwertung); Energiesparen im Haushalt.',
            'An intuitive concept of energy: energy is transported and dissipated as useless heat to the surroundings; saving energy at home.',
          ),
          parts: [
            {
              code: '3.1',
              title: L('Anschaulicher Energiebegriff', 'Intuitive concept of energy'),
              summary: L(
                'Energie als Größe, die in vielen Formen vorkommt und Vorgänge antreibt.',
                'Energy as a quantity that occurs in many forms and drives processes.',
              ),
            },
            {
              code: '3.2',
              title: L('Energietransport', 'Energy transport'),
              summary: L('Wege, auf denen Energie von einem Ort zum anderen gelangt.', 'Ways in which energy gets from one place to another.'),
            },
            {
              code: '3.3',
              title: L('Energiestrom in die Umgebung als Entwertung von Energie', 'Energy flow to the surroundings as degradation of energy'),
              summary: L(
                'Verstehen, dass Energie nicht verschwindet, aber an Nutzbarkeit verliert.',
                'Understanding that energy does not vanish but becomes less usable.',
              ),
            },
          ],
        },
        {
          code: '4',
          title: L('Elektrizität im Alltag', 'Electricity in everyday life'),
          summary: L(
            'Elektrischer Strom als Energietransport, Bauteile und Aufbau einfacher Stromkreise, Leiter und Isolatoren sowie sicherer Umgang mit Elektrizität.',
            'Electric current as energy transport, components and setup of simple circuits, conductors and insulators, and safe handling of electricity.',
          ),
          parts: [
            {
              code: '4.1',
              title: L('Elektrischer Strom als Transportform von Energie', 'Electric current as a means of transporting energy'),
              summary: L(
                'Mit einem Modell erklären, wie der Stromkreis Energie überträgt.',
                'Explaining with a model how a circuit transfers energy.',
              ),
              simulations: ['einfacher-stromkreis'],
            },
            {
              code: '4.2',
              title: L('Elemente des elektrischen Stromkreises', 'Elements of the electric circuit'),
              summary: L('Quelle, Leitung, Schalter und Verbraucher sowie Schaltskizzen.', 'Source, wires, switch and load, and circuit diagrams.'),
              simulations: ['einfacher-stromkreis'],
            },
            {
              code: '4.3',
              title: L('Gefahren beim Umgang mit Elektrizität im Alltag', 'Dangers of electricity in everyday life'),
              summary: L('Gefahren erkennen und sicheres Verhalten begründen.', 'Recognising dangers and justifying safe behaviour.'),
            },
          ],
        },
        {
          code: '5',
          title: L('Wettererscheinungen und Klima', 'Weather phenomena and climate'),
          summary: L(
            'Temperatur und ihre Messung, Teilchenmodell der Materie, Aggregatzustände, Wärmeausdehnung und Anomalie des Wassers sowie ein erster Druckbegriff.',
            'Temperature and its measurement, the particle model of matter, states of matter, thermal expansion and the anomaly of water, and a first idea of pressure.',
          ),
          parts: [
            {
              code: '5.1',
              title: L('Temperatur und deren Messung', 'Temperature and its measurement'),
              summary: L('Thermometer verstehen und kalibrieren.', 'Understanding and calibrating thermometers.'),
              simulations: ['teilchenmodell'],
            },
            {
              code: '5.2',
              title: L('Modelle des Aufbaus der Materie', 'Models of the structure of matter'),
              summary: L('Stoffe mit einem Teilchenmodell beschreiben.', 'Describing substances with a particle model.'),
              simulations: ['teilchenmodell'],
            },
            {
              code: '5.3',
              title: L('Aggregatzustände und deren Übergänge', 'States of matter and their transitions'),
              summary: L(
                'Schmelzen, Verdampfen usw. mit dem Teilchenmodell erklären.',
                'Explaining melting, evaporation etc. with the particle model.',
              ),
              simulations: ['teilchenmodell'],
            },
            {
              code: '5.4',
              title: L('Stoffe bei Temperaturänderung', 'Substances when temperature changes'),
              summary: L(
                'Ausdehnung von festen, flüssigen und gasförmigen Stoffen untersuchen.',
                'Investigating the expansion of solids, liquids and gases.',
              ),
            },
            {
              code: '5.5',
              title: L('Anomalie des Wassers und seine Bedeutung für das irdische Leben', 'Anomaly of water and its importance for life on Earth'),
              summary: L(
                'Dichteverhalten von Wasser bei 4 °C und Folgen für Gewässer.',
                'Density behaviour of water at 4 °C and consequences for lakes.',
              ),
            },
            {
              code: '5.6',
              title: L('Druck als „Gepresstsein“ der Materie', 'Pressure as the \'compressed state\' of matter'),
              summary: L('Anschauliche Vorstellung von Druck.', 'An intuitive idea of pressure.'),
            },
          ],
        },
        {
          code: '6',
          title: L('Fortbewegung und Mobilität', 'Locomotion and mobility'),
          summary: L(
            'Bewegungen mit Weg, Zeit und Geschwindigkeit beschreiben und Geschwindigkeiten messen.',
            'Describing motion with distance, time and speed and measuring speeds.',
          ),
          parts: [
            {
              code: '6.1',
              title: L('Weg, Zeit und Geschwindigkeit', 'Distance, time and speed'),
              summary: L(
                'Geschwindigkeiten messen und Bewegungen in Diagrammen darstellen.',
                'Measuring speeds and representing motion in diagrams.',
              ),
              simulations: ['bewegungsdiagramme'],
            },
          ],
        },
        {
          code: '7',
          title: L('Technik im Dienst des Menschen', 'Technology in the service of people'),
          summary: L(
            'Eigenschaften von Magneten, Modell der Elementarmagnete und Magnetfelder.',
            'Properties of magnets, the model of elementary magnets and magnetic fields.',
          ),
          parts: [
            {
              code: '7.1',
              title: L('Magnetismus', 'Magnetism'),
              summary: L(
                'Magnete untersuchen, Feldlinien zeichnen und mit Elementarmagneten erklären.',
                'Investigating magnets, drawing field lines and explaining them with elementary magnets.',
              ),
            },
          ],
        },
        {
          code: '8',
          title: L('Zukunftssichere Energieversorgung', 'Sustainable energy supply'),
          summary: L(
            'Regenerative und erschöpfbare Energieträger unterscheiden und Energiekosten im Alltag deuten.',
            'Distinguishing renewable and finite energy sources and interpreting everyday energy costs.',
          ),
          parts: [
            {
              code: '8.1',
              title: L('Unterscheidung zwischen regenerativen und erschöpfbaren Energien', 'Distinguishing renewable and finite energy sources'),
              summary: L(
                'Energieträger nach Verfügbarkeit einordnen und eigenes Verhalten bewerten.',
                'Classifying energy sources by availability and evaluating one\'s own behaviour.',
              ),
            },
          ],
        },
        {
          code: '9',
          title: L('Physik in der Verantwortung', 'Physics and responsibility'),
          summary: L(
            'Verantwortung für die Umwelt und die Rolle der Physik bei Natur- und Umweltereignissen.',
            'Responsibility for the environment and the role of physics in natural and environmental events.',
          ),
          parts: [
            {
              code: '9.1',
              title: L('Verantwortung gegenüber der Umwelt', 'Responsibility towards the environment'),
              summary: L(
                'Umwelt- und Gesundheitsaspekte beim Experimentieren und im Alltag berücksichtigen.',
                'Taking environmental and health aspects into account in experiments and everyday life.',
              ),
            },
            {
              code: '9.2',
              title: L('Rolle der Physik bei Umwelt- und Naturereignissen', 'Role of physics in environmental and natural events'),
              summary: L(
                'Physikalische Informationen aus Meldungen zu Ereignissen entnehmen.',
                'Extracting physical information from reports on events.',
              ),
            },
          ],
        },
      ],
    },
    {
      grade: 9,
      sourceUrl: SOURCE,
      note: STUFE_2,
      units: [
        {
          code: '1',
          title: L('Haus der Naturwissenschaften', 'House of the natural sciences'),
          summary: L(
            'Physik im Verbund mit Chemie und Biologie einordnen, historische und aktuelle Erkenntniswege kennen und Messgenauigkeit beurteilen.',
            'Placing physics alongside chemistry and biology, knowing historical and current ways of gaining knowledge, and judging measurement accuracy.',
          ),
          parts: [
            {
              code: '1.1',
              title: L(
                'Besonderheiten und Gemeinsamkeiten der Physik, Chemie und Biologie',
                'Particularities and commonalities of physics, chemistry and biology',
              ),
              summary: L('Arbeitsweisen der drei Naturwissenschaften vergleichen.', 'Comparing the methods of the three natural sciences.'),
            },
            {
              code: '1.2',
              title: L('Historische und aktuelle Erkenntniswege der Physik', 'Historical and current ways of gaining knowledge in physics'),
              summary: L(
                'An Beispielen zeigen, wie physikalisches Wissen entsteht; Messfehler einschätzen.',
                'Showing with examples how physical knowledge arises; estimating measurement errors.',
              ),
            },
          ],
        },
        {
          code: '2',
          title: L('Erweiterung der Sinne', 'Extension of the senses'),
          summary: L(
            'Ausbreitung von Licht und Schall vergleichen, optische Phänomene erklären und optische Abbildungen (z. B. mit Linsen) erzeugen; Schallgeschwindigkeit bestimmen.',
            'Comparing the propagation of light and sound, explaining optical phenomena and producing optical images (e.g. with lenses); determining the speed of sound.',
          ),
          parts: [
            {
              code: '2.1',
              title: L('Schall, Licht und ihre Ausbreitung', 'Sound, light and their propagation'),
              summary: L(
                'Ausbreitung von Licht und Schall vergleichen, auch die Schallgeschwindigkeit.',
                'Comparing how light and sound propagate, including the speed of sound.',
              ),
            },
            {
              code: '2.2',
              title: L('Optische Phänomene', 'Optical phenomena'),
              summary: L(
                'Phänomene wie Spiegelbilder, Brechung und Totalreflexion physikalisch erklären.',
                'Explaining phenomena such as mirror images, refraction and total internal reflection.',
              ),
              simulations: ['brechung'],
            },
            {
              code: '2.3',
              title: L('Optische Abbildungen', 'Optical images'),
              summary: L(
                'Bilder mit Linsen und optischen Instrumenten erzeugen und zeichnerisch konstruieren.',
                'Forming images with lenses and optical instruments and constructing them graphically.',
              ),
              simulations: ['linsen'],
            },
          ],
        },
        {
          code: '3',
          title: L('Energie in Umwelt und Technik', 'Energy in the environment and technology'),
          summary: L(
            'Energie wird quantifiziert: Energieformen und Umwandlungsketten, Energieerhaltung und Wirkungsgrade.',
            'Energy is quantified: forms of energy and conversion chains, conservation of energy and efficiency.',
          ),
          parts: [
            {
              code: '3.1',
              title: L('Energie als quantifizierbare Größe', 'Energy as a quantifiable quantity'),
              summary: L('Energien berechnen und in Joule angeben.', 'Calculating energies and stating them in joules.'),
              simulations: ['energieerhaltung'],
            },
            {
              code: '3.2',
              title: L('Energieformen und ihre Umwandlung', 'Forms of energy and their conversion'),
              summary: L('Umwandlungsketten aufstellen und Wirkungsgrade bestimmen.', 'Setting up conversion chains and determining efficiencies.'),
              simulations: ['energieerhaltung'],
            },
            {
              code: '3.3',
              title: L('Prinzip der Energieerhaltung und dessen Anwendung', 'Principle of conservation of energy and its application'),
              summary: L('Energieerhaltung nutzen, um Vorgänge vorherzusagen.', 'Using conservation of energy to predict processes.'),
              simulations: ['energieerhaltung'],
            },
          ],
        },
        {
          code: '4',
          title: L('Elektrizität im Alltag', 'Electricity in everyday life'),
          summary: L(
            'Stromstärke, Spannung und Widerstand quantitativ; komplexere Schaltungen als Systeme; elektrostatische Erscheinungen durch Ladungen erklären.',
            'Current, voltage and resistance quantitatively; more complex circuits as systems; explaining electrostatic phenomena by charges.',
          ),
          parts: [
            {
              code: '4.1',
              title: L(
                'Einfluss von Widerständen auf die Stärke des elektrischen Stroms',
                'Influence of resistors on the strength of the electric current',
              ),
              summary: L(
                'Zusammenhang von Spannung, Stromstärke und Widerstand untersuchen.',
                'Investigating the relationship between voltage, current and resistance.',
              ),
              simulations: ['ohmsches-gesetz'],
            },
            {
              code: '4.2',
              title: L('Stromkreise als Systeme', 'Circuits as systems'),
              summary: L(
                'Reihen- und Parallelschaltungen als Ganzes betrachten; Strom als Ladung pro Zeit, Spannung als Energie pro Ladung.',
                'Viewing series and parallel circuits as a whole; current as charge per time, voltage as energy per charge.',
              ),
              simulations: ['reihe-parallel'],
            },
            {
              code: '4.3',
              title: L('Elektrostatische Phänomene', 'Electrostatic phenomena'),
              summary: L('Aufladung, Anziehung und Abstoßung mit Ladungen erklären.', 'Explaining charging, attraction and repulsion with charges.'),
            },
          ],
        },
        {
          code: '5',
          title: L('Wettererscheinungen und Klima', 'Weather phenomena and climate'),
          summary: L(
            'Wärmeübertragung, Druck als Zustandsgröße und Druck- bzw. Temperaturunterschiede als Antrieb von Wetter und Klima; Einfluss des Menschen auf das Klima.',
            'Heat transfer, pressure as a state variable and differences in pressure and temperature as drivers of weather and climate; human influence on climate.',
          ),
          parts: [
            {
              code: '5.1',
              title: L('Übertragung thermischer Energie', 'Transfer of thermal energy'),
              summary: L('Wärmeleitung, Wärmeströmung und Wärmestrahlung untersuchen.', 'Investigating conduction, convection and radiation.'),
            },
            {
              code: '5.2',
              title: L('Druck als physikalische Zustandsgröße', 'Pressure as a physical state variable'),
              summary: L('Druck in Abhängigkeit von anderen Größen darstellen.', 'Representing pressure as a function of other quantities.'),
              simulations: ['gasgesetze'],
            },
            {
              code: '5.3',
              title: L('Druck- und Temperaturunterschiede', 'Pressure and temperature differences'),
              summary: L(
                'Wettererscheinungen als Ausgleich von Unterschieden erklären.',
                'Explaining weather phenomena as the equalising of differences.',
              ),
            },
          ],
        },
        {
          code: '6',
          title: L('Fortbewegung und Mobilität', 'Locomotion and mobility'),
          summary: L(
            'Kräfte als Wechselwirkung, Trägheit, Wirkungen von Kräften (Bewegungsänderung, Verformung) und Leistung von Mensch und Technik.',
            'Forces as interaction, inertia, effects of forces (change of motion, deformation) and power of humans and machines.',
          ),
          parts: [
            {
              code: '6.1',
              title: L('Wechselwirkung von Körpern', 'Interaction of bodies'),
              summary: L('Kräfte treten immer paarweise zwischen zwei Körpern auf.', 'Forces always occur in pairs between two bodies.'),
            },
            {
              code: '6.2',
              title: L('Trägheit eines Körpers', 'Inertia of a body'),
              summary: L(
                'Trägheit als Beharrungsvermögen; Bedeutung für die Verkehrssicherheit.',
                'Inertia as resistance to changes in motion; importance for road safety.',
              ),
            },
            {
              code: '6.3',
              title: L('Wirkungen von Kräften', 'Effects of forces'),
              summary: L(
                'Kräfte ändern Bewegungen und verformen Körper; Kräfte darstellen und messen.',
                'Forces change motion and deform bodies; representing and measuring forces.',
              ),
              simulations: ['kraefteaddition', 'hookesches-gesetz'],
            },
            {
              code: '6.4',
              title: L('Menschliche und technische Leistungen und deren Vergleich', 'Human and technical power and their comparison'),
              summary: L(
                'Eigene körperliche Leistung bestimmen und mit Maschinen vergleichen.',
                'Determining one\'s own physical power and comparing it with machines.',
              ),
            },
          ],
        },
        {
          code: '7',
          title: L('Technik im Dienst des Menschen', 'Technology in the service of people'),
          summary: L(
            'Kraftwandler wie Hebel und Rollen, Auftrieb in Flüssigkeiten und Gasen sowie die magnetische Wirkung des Stroms und elektromagnetische Energiewandler.',
            'Force converters such as levers and pulleys, buoyancy in liquids and gases, and the magnetic effect of current and electromagnetic energy converters.',
          ),
          parts: [
            {
              code: '7.1',
              title: L('Kraft wandelnde Systeme', 'Force-converting systems'),
              summary: L(
                'Gesetzmäßigkeiten an Hebel, Rolle und schiefer Ebene untersuchen; Gleichgewicht.',
                'Investigating laws for levers, pulleys and inclined planes; equilibrium.',
              ),
              simulations: ['schiefe-ebene', 'hebelgesetz'],
            },
            {
              code: '7.2',
              title: L('Phänomen Auftrieb', 'Phenomenon of buoyancy'),
              summary: L(
                'Schwimmen, Schweben und Sinken experimentell untersuchen und erklären.',
                'Investigating and explaining floating, hovering and sinking.',
              ),
            },
            {
              code: '7.3',
              title: L('Magnetische Wirkung des elektrischen Stroms', 'Magnetic effect of electric current'),
              summary: L(
                'Elektromagnete und elektromagnetische Energiewandler wie Motoren verstehen.',
                'Understanding electromagnets and electromagnetic energy converters such as motors.',
              ),
            },
          ],
        },
        {
          code: '8',
          title: L('Zukunftssichere Energieversorgung', 'Sustainable energy supply'),
          summary: L(
            'Erzeugung elektrischer Energie in Kraftwerken, Speicherung und Transport (Transformation der Spannung) sowie Versorgungsnetze.',
            'Generating electrical energy in power plants, storage and transport (voltage transformation), and supply grids.',
          ),
          parts: [
            {
              code: '8.1',
              title: L('Umwandlung verschiedener Energieformen in elektrische Energie', 'Converting various forms of energy into electrical energy'),
              summary: L('Generatoren und andere Wandler erklären.', 'Explaining generators and other converters.'),
            },
            {
              code: '8.2',
              title: L('Großenergieanlagen', 'Large-scale power plants'),
              summary: L('Kraftwerkstypen vergleichen.', 'Comparing types of power plant.'),
            },
            {
              code: '8.3',
              title: L('Speicherung und Transport von Energie', 'Storage and transport of energy'),
              summary: L(
                'Speicher und Hochspannungsübertragung mit Transformatoren untersuchen.',
                'Investigating storage and high-voltage transmission with transformers.',
              ),
            },
            {
              code: '8.4',
              title: L('Energieversorgungsnetze', 'Energy supply grids'),
              summary: L('Zentrale und dezentrale Versorgung bewerten.', 'Evaluating centralised and decentralised supply.'),
            },
          ],
        },
        {
          code: '9',
          title: L('Physik in der Verantwortung', 'Physics and responsibility'),
          summary: L(
            'Radioaktiver Zerfall und ionisierende Strahlung: Wirkung, Gefahren, Schutz sowie Chancen und Risiken von Technologien.',
            'Radioactive decay and ionising radiation: effects, dangers, protection, and opportunities and risks of technologies.',
          ),
          parts: [
            {
              code: '9.1',
              title: L('Radioaktive Zerfallsprozesse', 'Radioactive decay processes'),
              summary: L(
                'Zerfall mit Atommodellen beschreiben und Zerfallsdaten auswerten.',
                'Describing decay with atomic models and evaluating decay data.',
              ),
              simulations: ['radioaktiver-zerfall'],
            },
            {
              code: '9.2',
              title: L('Auswirkungen verschiedener Strahlungsarten', 'Effects of different types of radiation'),
              summary: L(
                'Alpha-, Beta- und Gammastrahlung, Gefährdungen und Schutzmaßnahmen.',
                'Alpha, beta and gamma radiation, hazards and protective measures.',
              ),
            },
            {
              code: '9.3',
              title: L('Konsequenzen der Nutzung physikalischer Forschungsergebnisse', 'Consequences of using the results of physics research'),
              summary: L(
                'Chancen und Risiken technologischer Entwicklungen abwägen.',
                'Weighing opportunities and risks of technological developments.',
              ),
            },
          ],
        },
      ],
    },
    {
      grade: 10,
      sourceUrl: SOURCE,
      note: STUFE_2,
      units: [
        {
          code: '1',
          title: L('Haus der Naturwissenschaften', 'House of the natural sciences'),
          summary: L(
            'Physik im Verbund mit Chemie und Biologie einordnen, historische und aktuelle Erkenntniswege kennen und Messgenauigkeit beurteilen.',
            'Placing physics alongside chemistry and biology, knowing historical and current ways of gaining knowledge, and judging measurement accuracy.',
          ),
          parts: [
            {
              code: '1.1',
              title: L(
                'Besonderheiten und Gemeinsamkeiten der Physik, Chemie und Biologie',
                'Particularities and commonalities of physics, chemistry and biology',
              ),
              summary: L('Arbeitsweisen der drei Naturwissenschaften vergleichen.', 'Comparing the methods of the three natural sciences.'),
            },
            {
              code: '1.2',
              title: L('Historische und aktuelle Erkenntniswege der Physik', 'Historical and current ways of gaining knowledge in physics'),
              summary: L(
                'An Beispielen zeigen, wie physikalisches Wissen entsteht; Messfehler einschätzen.',
                'Showing with examples how physical knowledge arises; estimating measurement errors.',
              ),
            },
          ],
        },
        {
          code: '2',
          title: L('Erweiterung der Sinne', 'Extension of the senses'),
          summary: L(
            'Ausbreitung von Licht und Schall vergleichen, optische Phänomene erklären und optische Abbildungen (z. B. mit Linsen) erzeugen; Schallgeschwindigkeit bestimmen.',
            'Comparing the propagation of light and sound, explaining optical phenomena and producing optical images (e.g. with lenses); determining the speed of sound.',
          ),
          parts: [
            {
              code: '2.1',
              title: L('Schall, Licht und ihre Ausbreitung', 'Sound, light and their propagation'),
              summary: L(
                'Ausbreitung von Licht und Schall vergleichen, auch die Schallgeschwindigkeit.',
                'Comparing how light and sound propagate, including the speed of sound.',
              ),
            },
            {
              code: '2.2',
              title: L('Optische Phänomene', 'Optical phenomena'),
              summary: L(
                'Phänomene wie Spiegelbilder, Brechung und Totalreflexion physikalisch erklären.',
                'Explaining phenomena such as mirror images, refraction and total internal reflection.',
              ),
              simulations: ['brechung'],
            },
            {
              code: '2.3',
              title: L('Optische Abbildungen', 'Optical images'),
              summary: L(
                'Bilder mit Linsen und optischen Instrumenten erzeugen und zeichnerisch konstruieren.',
                'Forming images with lenses and optical instruments and constructing them graphically.',
              ),
              simulations: ['linsen'],
            },
          ],
        },
        {
          code: '3',
          title: L('Energie in Umwelt und Technik', 'Energy in the environment and technology'),
          summary: L(
            'Energie wird quantifiziert: Energieformen und Umwandlungsketten, Energieerhaltung und Wirkungsgrade.',
            'Energy is quantified: forms of energy and conversion chains, conservation of energy and efficiency.',
          ),
          parts: [
            {
              code: '3.1',
              title: L('Energie als quantifizierbare Größe', 'Energy as a quantifiable quantity'),
              summary: L('Energien berechnen und in Joule angeben.', 'Calculating energies and stating them in joules.'),
              simulations: ['energieerhaltung'],
            },
            {
              code: '3.2',
              title: L('Energieformen und ihre Umwandlung', 'Forms of energy and their conversion'),
              summary: L('Umwandlungsketten aufstellen und Wirkungsgrade bestimmen.', 'Setting up conversion chains and determining efficiencies.'),
              simulations: ['energieerhaltung'],
            },
            {
              code: '3.3',
              title: L('Prinzip der Energieerhaltung und dessen Anwendung', 'Principle of conservation of energy and its application'),
              summary: L('Energieerhaltung nutzen, um Vorgänge vorherzusagen.', 'Using conservation of energy to predict processes.'),
              simulations: ['energieerhaltung'],
            },
          ],
        },
        {
          code: '4',
          title: L('Elektrizität im Alltag', 'Electricity in everyday life'),
          summary: L(
            'Stromstärke, Spannung und Widerstand quantitativ; komplexere Schaltungen als Systeme; elektrostatische Erscheinungen durch Ladungen erklären.',
            'Current, voltage and resistance quantitatively; more complex circuits as systems; explaining electrostatic phenomena by charges.',
          ),
          parts: [
            {
              code: '4.1',
              title: L(
                'Einfluss von Widerständen auf die Stärke des elektrischen Stroms',
                'Influence of resistors on the strength of the electric current',
              ),
              summary: L(
                'Zusammenhang von Spannung, Stromstärke und Widerstand untersuchen.',
                'Investigating the relationship between voltage, current and resistance.',
              ),
            },
            {
              code: '4.2',
              title: L('Stromkreise als Systeme', 'Circuits as systems'),
              summary: L(
                'Reihen- und Parallelschaltungen als Ganzes betrachten; Strom als Ladung pro Zeit, Spannung als Energie pro Ladung.',
                'Viewing series and parallel circuits as a whole; current as charge per time, voltage as energy per charge.',
              ),
            },
            {
              code: '4.3',
              title: L('Elektrostatische Phänomene', 'Electrostatic phenomena'),
              summary: L('Aufladung, Anziehung und Abstoßung mit Ladungen erklären.', 'Explaining charging, attraction and repulsion with charges.'),
            },
          ],
        },
        {
          code: '5',
          title: L('Wettererscheinungen und Klima', 'Weather phenomena and climate'),
          summary: L(
            'Wärmeübertragung, Druck als Zustandsgröße und Druck- bzw. Temperaturunterschiede als Antrieb von Wetter und Klima; Einfluss des Menschen auf das Klima.',
            'Heat transfer, pressure as a state variable and differences in pressure and temperature as drivers of weather and climate; human influence on climate.',
          ),
          parts: [
            {
              code: '5.1',
              title: L('Übertragung thermischer Energie', 'Transfer of thermal energy'),
              summary: L('Wärmeleitung, Wärmeströmung und Wärmestrahlung untersuchen.', 'Investigating conduction, convection and radiation.'),
            },
            {
              code: '5.2',
              title: L('Druck als physikalische Zustandsgröße', 'Pressure as a physical state variable'),
              summary: L('Druck in Abhängigkeit von anderen Größen darstellen.', 'Representing pressure as a function of other quantities.'),
              simulations: ['gasgesetze'],
            },
            {
              code: '5.3',
              title: L('Druck- und Temperaturunterschiede', 'Pressure and temperature differences'),
              summary: L(
                'Wettererscheinungen als Ausgleich von Unterschieden erklären.',
                'Explaining weather phenomena as the equalising of differences.',
              ),
            },
          ],
        },
        {
          code: '6',
          title: L('Fortbewegung und Mobilität', 'Locomotion and mobility'),
          summary: L(
            'Kräfte als Wechselwirkung, Trägheit, Wirkungen von Kräften (Bewegungsänderung, Verformung) und Leistung von Mensch und Technik.',
            'Forces as interaction, inertia, effects of forces (change of motion, deformation) and power of humans and machines.',
          ),
          parts: [
            {
              code: '6.1',
              title: L('Wechselwirkung von Körpern', 'Interaction of bodies'),
              summary: L('Kräfte treten immer paarweise zwischen zwei Körpern auf.', 'Forces always occur in pairs between two bodies.'),
            },
            {
              code: '6.2',
              title: L('Trägheit eines Körpers', 'Inertia of a body'),
              summary: L(
                'Trägheit als Beharrungsvermögen; Bedeutung für die Verkehrssicherheit.',
                'Inertia as resistance to changes in motion; importance for road safety.',
              ),
            },
            {
              code: '6.3',
              title: L('Wirkungen von Kräften', 'Effects of forces'),
              summary: L(
                'Kräfte ändern Bewegungen und verformen Körper; Kräfte darstellen und messen.',
                'Forces change motion and deform bodies; representing and measuring forces.',
              ),
              simulations: ['kraefteaddition', 'hookesches-gesetz'],
            },
            {
              code: '6.4',
              title: L('Menschliche und technische Leistungen und deren Vergleich', 'Human and technical power and their comparison'),
              summary: L(
                'Eigene körperliche Leistung bestimmen und mit Maschinen vergleichen.',
                'Determining one\'s own physical power and comparing it with machines.',
              ),
            },
          ],
        },
        {
          code: '7',
          title: L('Technik im Dienst des Menschen', 'Technology in the service of people'),
          summary: L(
            'Kraftwandler wie Hebel und Rollen, Auftrieb in Flüssigkeiten und Gasen sowie die magnetische Wirkung des Stroms und elektromagnetische Energiewandler.',
            'Force converters such as levers and pulleys, buoyancy in liquids and gases, and the magnetic effect of current and electromagnetic energy converters.',
          ),
          parts: [
            {
              code: '7.1',
              title: L('Kraft wandelnde Systeme', 'Force-converting systems'),
              summary: L(
                'Gesetzmäßigkeiten an Hebel, Rolle und schiefer Ebene untersuchen; Gleichgewicht.',
                'Investigating laws for levers, pulleys and inclined planes; equilibrium.',
              ),
              simulations: ['schiefe-ebene', 'hebelgesetz'],
            },
            {
              code: '7.2',
              title: L('Phänomen Auftrieb', 'Phenomenon of buoyancy'),
              summary: L(
                'Schwimmen, Schweben und Sinken experimentell untersuchen und erklären.',
                'Investigating and explaining floating, hovering and sinking.',
              ),
            },
            {
              code: '7.3',
              title: L('Magnetische Wirkung des elektrischen Stroms', 'Magnetic effect of electric current'),
              summary: L(
                'Elektromagnete und elektromagnetische Energiewandler wie Motoren verstehen.',
                'Understanding electromagnets and electromagnetic energy converters such as motors.',
              ),
            },
          ],
        },
        {
          code: '8',
          title: L('Zukunftssichere Energieversorgung', 'Sustainable energy supply'),
          summary: L(
            'Erzeugung elektrischer Energie in Kraftwerken, Speicherung und Transport (Transformation der Spannung) sowie Versorgungsnetze.',
            'Generating electrical energy in power plants, storage and transport (voltage transformation), and supply grids.',
          ),
          parts: [
            {
              code: '8.1',
              title: L('Umwandlung verschiedener Energieformen in elektrische Energie', 'Converting various forms of energy into electrical energy'),
              summary: L('Generatoren und andere Wandler erklären.', 'Explaining generators and other converters.'),
              simulations: ['induktion'],
            },
            {
              code: '8.2',
              title: L('Großenergieanlagen', 'Large-scale power plants'),
              summary: L('Kraftwerkstypen vergleichen.', 'Comparing types of power plant.'),
            },
            {
              code: '8.3',
              title: L('Speicherung und Transport von Energie', 'Storage and transport of energy'),
              summary: L(
                'Speicher und Hochspannungsübertragung mit Transformatoren untersuchen.',
                'Investigating storage and high-voltage transmission with transformers.',
              ),
            },
            {
              code: '8.4',
              title: L('Energieversorgungsnetze', 'Energy supply grids'),
              summary: L('Zentrale und dezentrale Versorgung bewerten.', 'Evaluating centralised and decentralised supply.'),
            },
          ],
        },
        {
          code: '9',
          title: L('Physik in der Verantwortung', 'Physics and responsibility'),
          summary: L(
            'Radioaktiver Zerfall und ionisierende Strahlung: Wirkung, Gefahren, Schutz sowie Chancen und Risiken von Technologien.',
            'Radioactive decay and ionising radiation: effects, dangers, protection, and opportunities and risks of technologies.',
          ),
          parts: [
            {
              code: '9.1',
              title: L('Radioaktive Zerfallsprozesse', 'Radioactive decay processes'),
              summary: L(
                'Zerfall mit Atommodellen beschreiben und Zerfallsdaten auswerten.',
                'Describing decay with atomic models and evaluating decay data.',
              ),
              simulations: ['radioaktiver-zerfall'],
            },
            {
              code: '9.2',
              title: L('Auswirkungen verschiedener Strahlungsarten', 'Effects of different types of radiation'),
              summary: L(
                'Alpha-, Beta- und Gammastrahlung, Gefährdungen und Schutzmaßnahmen.',
                'Alpha, beta and gamma radiation, hazards and protective measures.',
              ),
            },
            {
              code: '9.3',
              title: L('Konsequenzen der Nutzung physikalischer Forschungsergebnisse', 'Consequences of using the results of physics research'),
              summary: L(
                'Chancen und Risiken technologischer Entwicklungen abwägen.',
                'Weighing opportunities and risks of technological developments.',
              ),
            },
          ],
        },
      ],
    },
    {
      grade: 11,
      sourceUrl: SOURCE,
      note: E_PHASE,
      units: [
        {
          code: 'E.1',
          title: L('Bewegungen und ihre Beschreibung', 'Motion and its description'),
          summary: L(
            'Verbindliches Themenfeld. Gleichförmige und gleichmäßig beschleunigte Bewegungen untersuchen, in t-s-, t-v- und t-a-Diagrammen darstellen und durch Bewegungsgesetze beschreiben, z. B. beim freien Fall.',
            'Mandatory topic area. Investigating uniform and uniformly accelerated motion, representing it in t-s, t-v and t-a diagrams and describing it with equations of motion, e.g. free fall.',
          ),
          parts: [
            {
              code: 'E.1.1',
              title: L('Untersuchung von Bewegungen', 'Investigation of motion'),
              summary: L('Bewegungen messen und Messdaten auswerten.', 'Measuring motion and evaluating the data.'),
              simulations: ['bewegungsdiagramme'],
            },
            {
              code: 'E.1.2',
              title: L('t-s-, t-v- und t-a-Diagramme', 't-s, t-v and t-a diagrams'),
              summary: L('Bewegungen in Diagrammen darstellen und deuten.', 'Representing and interpreting motion in diagrams.'),
              simulations: ['bewegungsdiagramme'],
            },
            {
              code: 'E.1.3',
              title: L('Gleichförmige Bewegung', 'Uniform motion'),
              summary: L('Geschwindigkeit definieren und im Versuch messen.', 'Defining velocity and measuring it experimentally.'),
              simulations: ['bewegungsdiagramme'],
            },
            {
              code: 'E.1.4',
              title: L(
                'Gleichmäßig beschleunigte Bewegung ohne Anfangsgeschwindigkeit und Anfangsort',
                'Uniformly accelerated motion without initial velocity and initial position',
              ),
              summary: L(
                'Beschleunigung, Durchschnitts- vs. Momentangeschwindigkeit; freier Fall mit Bestimmung von g.',
                'Acceleration, average vs. instantaneous velocity; free fall including determining g.',
              ),
              simulations: ['bewegungsdiagramme', 'freier-fall'],
            },
            {
              code: 'E.1.5',
              title: L('Idealisierung', 'Idealisation'),
              summary: L(
                'Massepunkt und Vernachlässigung der Reibung als Modellannahmen.',
                'Point mass and neglect of friction as model assumptions.',
              ),
            },
            {
              code: 'E.1.6',
              title: L(
                'Zeit-Ort- und Zeit-Geschwindigkeit-Gesetze und deren Zusammenhang',
                'Time–position and time–velocity laws and their relationship',
              ),
              summary: L('Bewegungsgesetze aus Diagrammen herleiten und verknüpfen.', 'Deriving and linking the laws of motion from diagrams.'),
              simulations: ['bewegungsdiagramme'],
            },
          ],
        },
        {
          code: 'E.2',
          title: L('Newton’sche Axiome und Erhaltungssätze', 'Newton\'s laws and conservation laws'),
          summary: L(
            'Verbindliches Themenfeld. Die drei Newton’schen Axiome sowie Energie- und Impulserhaltung, angewandt auf elastische und unelastische Stöße.',
            'Mandatory topic area. Newton\'s three laws and conservation of energy and momentum, applied to elastic and inelastic collisions.',
          ),
          parts: [
            {
              code: 'E.2.1',
              title: L('Die drei Newton’schen Axiome', 'Newton\'s three laws'),
              summary: L(
                'Trägheitsgesetz, Grundgleichung F = m·a, Wechselwirkungsprinzip und Inertialsysteme.',
                'Law of inertia, F = m·a, action–reaction principle and inertial frames.',
              ),
            },
            {
              code: 'E.2.2',
              title: L('Energie und Energieerhaltung', 'Energy and conservation of energy'),
              summary: L(
                'Kinetische und potenzielle Energie, Erhaltung in reibungsfreien abgeschlossenen Systemen.',
                'Kinetic and potential energy, conservation in frictionless closed systems.',
              ),
              simulations: ['energieerhaltung'],
            },
            {
              code: 'E.2.3',
              title: L('Impuls und Impulserhaltung', 'Momentum and conservation of momentum'),
              summary: L(
                'Elastische und unelastische Stöße, Rückstoß und Impuls als Erhaltungsgröße.',
                'Elastic and inelastic collisions, recoil and momentum as a conserved quantity.',
              ),
              simulations: ['stoesse'],
            },
          ],
        },
        {
          code: 'E.3',
          title: L('Waagerechter Wurf und Kreisbewegung', 'Horizontal projectile motion and circular motion'),
          summary: L(
            'Verbindliches Themenfeld. Bewegungen überlagern (waagerechter Wurf) und gleichförmige Kreisbewegungen mit Bahn- und Winkelgeschwindigkeit sowie Zentripetalkraft beschreiben.',
            'Mandatory topic area. Superposing motions (horizontal projectile) and describing uniform circular motion with linear and angular velocity and centripetal force.',
          ),
          parts: [
            {
              code: 'E.3.1',
              title: L('Bezugssysteme, Superpositionsprinzip', 'Reference frames, superposition principle'),
              summary: L(
                'Waagerechten Wurf als Überlagerung zweier Bewegungen darstellen.',
                'Representing horizontal projectile motion as a superposition of two motions.',
              ),
              simulations: ['schiefer-wurf'],
            },
            {
              code: 'E.3.2',
              title: L('Bahn- und Winkelgeschwindigkeit bei Kreisbewegungen', 'Linear and angular velocity in circular motion'),
              summary: L('Beide Geschwindigkeiten definieren und vergleichen.', 'Defining and comparing both velocities.'),
              simulations: ['kreisbewegung'],
            },
            {
              code: 'E.3.3',
              title: L('Kreisbewegung', 'Circular motion'),
              summary: L(
                'Zentripetalkraft als Ursache, z. B. bei Kurvenfahrten; Scheinkräfte.',
                'Centripetal force as the cause, e.g. when cornering; fictitious forces.',
              ),
              simulations: ['kreisbewegung'],
            },
          ],
        },
        {
          code: 'E.4',
          title: L('Weitere Bewegungen', 'Further types of motion'),
          summary: L(
            'Nicht verbindliches Themenfeld. Schiefer Wurf, Bewegungen mit Reibung und numerische Simulation von Bewegungen.',
            'Optional topic area. Oblique projectile motion, motion with friction and numerical simulation of motion.',
          ),
          parts: [
            {
              code: 'E.4.1',
              title: L('Schiefer Wurf', 'Oblique projectile motion'),
              summary: L('Flugbahnen bei schrägem Abwurf beschreiben.', 'Describing trajectories for oblique launch.'),
              simulations: ['schiefer-wurf'],
            },
            {
              code: 'E.4.2',
              title: L('Reibung', 'Friction'),
              summary: L(
                'Bewegung mit Reibung; freier Fall mit Luftwiderstand und Grenzgeschwindigkeit.',
                'Motion with friction; free fall with air resistance and terminal velocity.',
              ),
            },
            {
              code: 'E.4.3',
              title: L('Numerische Simulation', 'Numerical simulation'),
              summary: L(
                'Bewegungen schrittweise mit Differenzenquotienten (z. B. Tabellenkalkulation) berechnen.',
                'Calculating motion step by step with difference quotients (e.g. spreadsheet).',
              ),
            },
          ],
        },
        {
          code: 'E.5',
          title: L('Gravitation', 'Gravitation'),
          summary: L(
            'Nicht verbindliches Themenfeld. Gravitationsfeld und Gravitationsgesetz sowie Planetenbewegung mit den Kepler’schen Gesetzen.',
            'Optional topic area. Gravitational field and law of gravitation, planetary motion and Kepler\'s laws.',
          ),
          parts: [
            {
              code: 'E.5.1',
              title: L('Massenanziehung', 'Mass attraction'),
              summary: L('Gravitationsfeld, Gravitationsgesetz und Gewichtskraft.', 'Gravitational field, law of gravitation and weight.'),
            },
            {
              code: 'E.5.2',
              title: L('Planetenbewegung', 'Planetary motion'),
              summary: L(
                'Kepler’sche Gesetze und Entwicklung des astronomischen Weltbilds.',
                'Kepler\'s laws and the development of the astronomical world view.',
              ),
              simulations: ['planetenbahnen'],
            },
          ],
        },
        {
          code: 'E.6',
          title: L('Grundlagen der Thermodynamik', 'Foundations of thermodynamics'),
          summary: L(
            'Nicht verbindliches Themenfeld. Innere Energie, reversible und irreversible Vorgänge, Hauptsätze der Thermodynamik und Entropie.',
            'Optional topic area. Internal energy, reversible and irreversible processes, laws of thermodynamics and entropy.',
          ),
          parts: [
            {
              code: 'E.6.1',
              title: L('Wärmeenergie als innere Energie', 'Thermal energy as internal energy'),
              summary: L(
                'Begriff der inneren Energie und sein historischer Hintergrund.',
                'Concept of internal energy and its historical background.',
              ),
            },
            {
              code: 'E.6.2',
              title: L('Reversible und irreversible Vorgänge', 'Reversible and irreversible processes'),
              summary: L('Umkehrbare und nicht umkehrbare Prozesse unterscheiden.', 'Distinguishing reversible and irreversible processes.'),
            },
            {
              code: 'E.6.3',
              title: L('Erster und zweiter Hauptsatz der Thermodynamik', 'First and second law of thermodynamics'),
              summary: L('Energieerhaltung und Richtung von Wärmeprozessen.', 'Conservation of energy and the direction of heat processes.'),
            },
            {
              code: 'E.6.4',
              title: L('Entropieerzeugung und Wirkungsgrad', 'Entropy generation and efficiency'),
              summary: L(
                'Entropie als Maß für die Richtung natürlicher Abläufe; Grenzen des Wirkungsgrads.',
                'Entropy as a measure of the direction of natural processes; limits of efficiency.',
              ),
            },
          ],
        },
        {
          code: 'E.7',
          title: L('Drehbewegungen', 'Rotational motion'),
          summary: L(
            'Nicht verbindliches Themenfeld. Drehmoment, Drehimpuls als Erhaltungsgröße und Trägheitsmoment an Anwendungsbeispielen.',
            'Optional topic area. Torque, angular momentum as a conserved quantity and moment of inertia with applications.',
          ),
          parts: [
            {
              code: 'E.7.1',
              title: L('Drehmoment', 'Torque'),
              summary: L('Wirkung von Kräften auf drehbare Körper.', 'Effect of forces on rotatable bodies.'),
              simulations: ['hebelgesetz'],
            },
            {
              code: 'E.7.2',
              title: L('Drehimpuls', 'Angular momentum'),
              summary: L('Drehimpuls als Erhaltungsgröße; Präzession.', 'Angular momentum as a conserved quantity; precession.'),
            },
            {
              code: 'E.7.3',
              title: L('Trägheitsmoment', 'Moment of inertia'),
              summary: L('Anwendungsbeispiele wie die Pirouette.', 'Applications such as a pirouette.'),
            },
          ],
        },
      ],
    },
    {
      grade: 12,
      sourceUrl: SOURCE,
      note: Q1_Q2,
      units: [
        {
          code: 'Q1.1',
          title: L('Elektrisches Feld', 'Electric field'),
          summary: L(
            'Verbindliches Themenfeld. Feldbegriff, Feldlinienbilder und Feldstärke, Kondensator als Energiespeicher mit Auf- und Entladung, Coulomb-Gesetz und Bewegung geladener Teilchen im Feld.',
            'Mandatory topic area. Field concept, field-line patterns and field strength, capacitor as energy store with charging and discharging, Coulomb\'s law and motion of charged particles in the field.',
          ),
          parts: [
            {
              code: 'Q1.1.1',
              title: L('Begriff des Feldes am Beispiel von elektrischen Feldern', 'Concept of a field using electric fields'),
              summary: L(
                'Feldlinienbilder (Plattenkondensator, Punktladung, Dipol), Ladungserhaltung und Influenz.',
                'Field-line patterns (parallel plates, point charge, dipole), charge conservation and induction of charge.',
              ),
              simulations: ['feldlinien'],
            },
            {
              code: 'Q1.1.2',
              title: L('Elektrische Feldstärke', 'Electric field strength'),
              summary: L(
                'Feldstärke definieren; radialsymmetrisches Feld; grafische Superposition.',
                'Defining field strength; radial field; graphical superposition.',
              ),
              simulations: ['feldlinien'],
            },
            {
              code: 'Q1.1.3',
              title: L(
                'Kondensator als Energiespeicher: elektrisches Feld, Kapazität, elektrische Energie',
                'Capacitor as energy store: electric field, capacitance, electrical energy',
              ),
              summary: L(
                'Kapazität, Feldenergie und zeitlicher Verlauf beim Laden und Entladen.',
                'Capacitance, field energy and time behaviour during charging and discharging.',
              ),
              simulations: ['kondensator'],
            },
            {
              code: 'Q1.1.4',
              title: L('Coulomb’sches Gesetz', 'Coulomb\'s law'),
              summary: L('Kraft zwischen Punktladungen.', 'Force between point charges.'),
            },
            {
              code: 'Q1.1.5',
              title: L(
                'Kräfte auf Körper in homogenen elektrischen Feldern, Bahnformen (qualitativ), Energiebetrachtung',
                'Forces on bodies in uniform electric fields, trajectories (qualitative), energy considerations',
              ),
              summary: L(
                'Millikan-Versuch, Beschleunigung geladener Teilchen und Ablenkung quer zum Feld.',
                'Millikan experiment, acceleration of charged particles and deflection across the field.',
              ),
            },
            {
              code: 'Q1.1.6',
              title: L(
                'Begriff des Feldes am Beispiel von elektrischen Feldern (nur LK)',
                'Concept of a field using electric fields (advanced course only)',
              ),
              summary: L(
                'Flächenladungsdichte und quantitative Superposition von Feldern.',
                'Surface charge density and quantitative superposition of fields.',
              ),
              simulations: ['feldlinien'],
            },
            {
              code: 'Q1.1.7',
              title: L(
                'Kondensator als Energiespeicher: elektrisches Feld, Kapazität, elektrische Energie (nur LK)',
                'Capacitor as energy store: electric field, capacitance, electrical energy (advanced course only)',
              ),
              summary: L(
                'Dielektrikum, Herleitungen und Differenzialgleichung der Entladung.',
                'Dielectric, derivations and differential equation of discharge.',
              ),
              simulations: ['kondensator'],
            },
            {
              code: 'Q1.1.8',
              title: L('Spannung als Potenzialdifferenz (nur LK)', 'Voltage as potential difference (advanced course only)'),
              summary: L('Elektrisches Potenzial und Äquipotenziallinien.', 'Electric potential and equipotential lines.'),
            },
            {
              code: 'Q1.1.9',
              title: L(
                'Kräfte auf Körper in homogenen elektrischen Feldern, Bahnformen, Energiebetrachtung (nur LK)',
                'Forces on bodies in uniform electric fields, trajectories, energy considerations (advanced course only)',
              ),
              summary: L(
                'Quantitative Ablenkung (Vergleich mit waagerechtem Wurf), Linearbeschleuniger.',
                'Quantitative deflection (comparison with horizontal projectile), linear accelerator.',
              ),
            },
          ],
        },
        {
          code: 'Q1.2',
          title: L('Magnetisches Feld', 'Magnetic field'),
          summary: L(
            'Verbindliches Themenfeld. Magnetische Feldlinienbilder und Flussdichte, Feld einer langen Spule sowie Lorentzkraft und Kreisbahnen geladener Teilchen (Fadenstrahlrohr, e/m).',
            'Mandatory topic area. Magnetic field-line patterns and flux density, field of a long solenoid, and Lorentz force and circular paths of charged particles (fine-beam tube, e/m).',
          ),
          parts: [
            {
              code: 'Q1.2.1',
              title: L('Begriff des Feldes am Beispiel von magnetischen Feldern', 'Concept of a field using magnetic fields'),
              summary: L('Feldlinien von Dauermagnet, geradem Leiter und Spule.', 'Field lines of permanent magnet, straight wire and solenoid.'),
            },
            {
              code: 'Q1.2.2',
              title: L('Magnetische Flussdichte', 'Magnetic flux density'),
              summary: L(
                'Flussdichte definieren und im Inneren einer langen Spule bestimmen.',
                'Defining flux density and determining it inside a long solenoid.',
              ),
            },
            {
              code: 'Q1.2.3',
              title: L(
                'Kräfte auf Körper in homogenen magnetischen Feldern, Bahnformen (qualitativ)',
                'Forces on bodies in uniform magnetic fields, trajectories (qualitative)',
              ),
              summary: L(
                'Lorentzkraft als Zentripetalkraft und Kreisbahn im Fadenstrahlrohr.',
                'Lorentz force as centripetal force and circular path in the fine-beam tube.',
              ),
              simulations: ['lorentzkraft'],
            },
            {
              code: 'Q1.2.4',
              title: L(
                'Quantitative Betrachtung von Bahnformen in homogenen Feldern (nur LK)',
                'Quantitative treatment of trajectories in uniform fields (advanced course only)',
              ),
              summary: L('Gekreuzte Felder und Geschwindigkeitsfilter.', 'Crossed fields and velocity filter.'),
              simulations: ['lorentzkraft'],
            },
            {
              code: 'Q1.2.5',
              title: L('Hall-Effekt (nur LK)', 'Hall effect (advanced course only)'),
              summary: L('Spannung quer zum Strom im Magnetfeld erklären.', 'Explaining the voltage across a conductor in a magnetic field.'),
            },
            {
              code: 'Q1.2.6',
              title: L('Teilchenbeschleuniger (nur LK)', 'Particle accelerators (advanced course only)'),
              summary: L('Funktionsprinzip z. B. von Zyklotron und Synchrotron.', 'Working principle of e.g. cyclotron and synchrotron.'),
            },
          ],
        },
        {
          code: 'Q2.1',
          title: L('Mechanische Schwingungen', 'Mechanical oscillations'),
          summary: L(
            'Verbindliches Themenfeld. Harmonische Schwingungen am Feder- und Fadenpendel mit ihren Kenngrößen, Schwingungsgleichung, Energieumwandlung und Dämpfung; im LK erzwungene Schwingungen und Resonanz.',
            'Mandatory topic area. Harmonic oscillations of spring and simple pendulums with their parameters, equation of motion, energy conversion and damping; in the advanced course forced oscillations and resonance.',
          ),
          parts: [
            {
              code: 'Q2.1.1',
              title: L(
                'Mechanische harmonische Schwingungen: charakteristische Größen und ihre Zusammenhänge',
                'Mechanical harmonic oscillations: characteristic quantities and their relationships',
              ),
              summary: L(
                'Elongation, Amplitude, Periodendauer, Frequenz und Energie (qualitativ).',
                'Displacement, amplitude, period, frequency and energy (qualitative).',
              ),
              simulations: ['federpendel', 'fadenpendel'],
            },
            {
              code: 'Q2.1.2',
              title: L('Zeitlicher Verlauf einer harmonischen Schwingung', 'Time course of a harmonic oscillation'),
              summary: L(
                'Lineare Rückstellkraft, Periodendauer von Feder- und Fadenpendel, Schwingungsgleichung.',
                'Linear restoring force, period of spring and simple pendulum, equation of motion.',
              ),
              simulations: ['federpendel', 'fadenpendel'],
            },
            {
              code: 'Q2.1.3',
              title: L('Gedämpfte mechanische Schwingungen', 'Damped mechanical oscillations'),
              summary: L('Abnahme der Amplitude qualitativ beschreiben.', 'Describing the decrease in amplitude qualitatively.'),
            },
            {
              code: 'Q2.1.4',
              title: L('Zeitlicher Verlauf einer harmonischen Schwingung (nur LK)', 'Time course of a harmonic oscillation (advanced course only)'),
              summary: L(
                'Differenzialgleichung der ungedämpften Schwingung mit Lösungsansatz.',
                'Differential equation of undamped oscillation with trial solution.',
              ),
              simulations: ['federpendel'],
            },
            {
              code: 'Q2.1.5',
              title: L('Gedämpfte Schwingungen (nur LK)', 'Damped oscillations (advanced course only)'),
              summary: L('Dämpfungsverläufe (ohne Herleitung) beschreiben.', 'Describing damping behaviour (without derivation).'),
            },
            {
              code: 'Q2.1.6',
              title: L('Erzwungene Schwingungen (nur LK)', 'Forced oscillations (advanced course only)'),
              summary: L(
                'Eigenfrequenz, Resonanz, Resonanzkurven und Resonanzkatastrophe.',
                'Natural frequency, resonance, resonance curves and resonance disaster.',
              ),
              simulations: ['resonanz'],
            },
          ],
        },
        {
          code: 'Q2.2',
          title: L('Induktion und elektromagnetische Schwingungen', 'Induction and electromagnetic oscillations'),
          summary: L(
            'Verbindliches Themenfeld. Induktion durch Änderung des magnetischen Flusses, Lenz’sche Regel, Selbstinduktion und der elektromagnetische Schwingkreis.',
            'Mandatory topic area. Induction through change of magnetic flux, Lenz\'s law, self-induction and the electromagnetic oscillating circuit.',
          ),
          parts: [
            {
              code: 'Q2.2.1',
              title: L(
                'Induktion aufgrund einer zeitlichen Änderung des magnetischen Flusses',
                'Induction due to a change of magnetic flux over time',
              ),
              summary: L(
                'Magnetischer Fluss und Induktionsgesetz mit mittlerer Änderungsrate.',
                'Magnetic flux and law of induction with average rate of change.',
              ),
              simulations: ['induktion'],
            },
            {
              code: 'Q2.2.2',
              title: L(
                'Zusammenhang zwischen der Richtung des Induktionsstroms und seiner Wirkung (Lenz’sche Regel)',
                'Relationship between the direction of the induced current and its effect (Lenz\'s law)',
              ),
              summary: L('Richtung des Induktionsstroms begründen.', 'Justifying the direction of the induced current.'),
              simulations: ['induktion'],
            },
            {
              code: 'Q2.2.3',
              title: L(
                'Selbstinduktion und Induktivität einer langen Spule (phänomenologisch)',
                'Self-induction and inductance of a long solenoid (phenomenological)',
              ),
              summary: L('Selbstinduktion an Spulen beobachten und beschreiben.', 'Observing and describing self-induction in coils.'),
            },
            {
              code: 'Q2.2.4',
              title: L('Beispiel für eine technische Anwendung der Induktion', 'Example of a technical application of induction'),
              summary: L('Z. B. Generator oder Transformator erklären.', 'Explaining e.g. a generator or transformer.'),
            },
            {
              code: 'Q2.2.5',
              title: L('Elektromagnetische harmonische Schwingungen', 'Electromagnetic harmonic oscillations'),
              summary: L(
                'Schwingkreis: Kenngrößen, Energieumwandlung, Thomson’sche Gleichung.',
                'LC circuit: parameters, energy conversion, Thomson\'s formula.',
              ),
            },
            {
              code: 'Q2.2.6',
              title: L(
                'Induktion aufgrund einer zeitlichen Änderung des magnetischen Flusses (nur LK)',
                'Induction due to a change of magnetic flux over time (advanced course only)',
              ),
              summary: L(
                'Induktionsgesetz in differenzieller Form, auch nichtlineare Fälle.',
                'Law of induction in differential form, including non-linear cases.',
              ),
              simulations: ['induktion'],
            },
            {
              code: 'Q2.2.7',
              title: L('Selbstinduktion und Induktivität (nur LK)', 'Self-induction and inductance (advanced course only)'),
              summary: L('Ein- und Ausschaltvorgänge, Definition der Induktivität.', 'Switch-on and switch-off processes, definition of inductance.'),
            },
            {
              code: 'Q2.2.8',
              title: L(
                'Energie des Feldes einer stromdurchflossenen Spule (nur LK)',
                'Energy of the field of a current-carrying coil (advanced course only)',
              ),
              summary: L('Magnetische Feldenergie (ohne Herleitung).', 'Magnetic field energy (without derivation).'),
            },
            {
              code: 'Q2.2.9',
              title: L(
                'Vergleich von mechanischen und elektromagnetischen Schwingungen unter energetischen Aspekten (nur LK)',
                'Comparison of mechanical and electromagnetic oscillations in terms of energy (advanced course only)',
              ),
              summary: L('Analogien zwischen Pendel und Schwingkreis.', 'Analogies between pendulum and LC circuit.'),
            },
            {
              code: 'Q2.2.10',
              title: L('Gedämpfte Schwingungen (nur LK)', 'Damped oscillations (advanced course only)'),
              summary: L('Dämpfung im Schwingkreis.', 'Damping in the LC circuit.'),
            },
            {
              code: 'Q2.2.11',
              title: L(
                'Erzwungene Schwingungen, Resonanz (qualitativ) (nur LK)',
                'Forced oscillations, resonance (qualitative) (advanced course only)',
              ),
              summary: L('Resonanz im elektromagnetischen Schwingkreis.', 'Resonance in the electromagnetic circuit.'),
              simulations: ['resonanz'],
            },
          ],
        },
        {
          code: 'Q2.3',
          title: L('Mechanische Wellen', 'Mechanical waves'),
          summary: L(
            'Verbindliches Themenfeld. Entstehung und Kenngrößen harmonischer Wellen, Longitudinal- und Transversalwellen, typische Wellenphänomene, Interferenz und stehende Wellen.',
            'Mandatory topic area. Formation and parameters of harmonic waves, longitudinal and transverse waves, typical wave phenomena, interference and standing waves.',
          ),
          parts: [
            {
              code: 'Q2.3.1',
              title: L(
                'Harmonische Wellen: charakteristische Größen und ihre Zusammenhänge',
                'Harmonic waves: characteristic quantities and their relationships',
              ),
              summary: L('Erzeugung, Ausbreitung, Wellenlänge, Frequenz und c = λ·f.', 'Generation, propagation, wavelength, frequency and c = λ·f.'),
              simulations: ['wellen-ausbreitung'],
            },
            {
              code: 'Q2.3.2',
              title: L(
                'Definition einer harmonischen Welle als räumlich und zeitlich periodischer Vorgang',
                'Definition of a harmonic wave as a process periodic in space and time',
              ),
              summary: L(
                'Darstellung im t-y- und x-y-Diagramm, Longitudinal- und Transversalwellen, Polarisation.',
                'Representation in t-y and x-y diagrams, longitudinal and transverse waves, polarisation.',
              ),
              simulations: ['wellen-ausbreitung'],
            },
            {
              code: 'Q2.3.3',
              title: L(
                'Brechung, Reflexion, Beugung als charakteristische Wellenphänomene',
                'Refraction, reflection, diffraction as characteristic wave phenomena',
              ),
              summary: L(
                'Wellenphänomene z. B. in der Wellenwanne; Huygens’sches Prinzip.',
                'Wave phenomena e.g. in a ripple tank; Huygens\' principle.',
              ),
            },
            {
              code: 'Q2.3.4',
              title: L('Überlagerung von Wellen', 'Superposition of waves'),
              summary: L(
                'Interferenz zweier Erreger, Gangunterschied, Lage von Maxima und Minima.',
                'Interference of two sources, path difference, positions of maxima and minima.',
              ),
              simulations: ['interferenz'],
            },
            {
              code: 'Q2.3.5',
              title: L('Stehende Wellen', 'Standing waves'),
              summary: L(
                'Eindimensionale stehende Wellen und Wellenlängenbestimmung.',
                'One-dimensional standing waves and determining the wavelength.',
              ),
              simulations: ['stehende-wellen'],
            },
            {
              code: 'Q2.3.6',
              title: L(
                'Harmonische Wellen: charakteristische Größen und ihre Zusammenhänge (nur LK)',
                'Harmonic waves: characteristic quantities and their relationships (advanced course only)',
              ),
              summary: L('Wellengleichung für die räumliche und zeitliche Entwicklung.', 'Wave equation for development in space and time.'),
              simulations: ['wellen-ausbreitung'],
            },
            {
              code: 'Q2.3.7',
              title: L(
                'Behandlung des Phasensprungs bei Reflexion, festes und loses Ende bei stehenden Wellen (nur LK)',
                'Phase jump on reflection, fixed and free end for standing waves (advanced course only)',
              ),
              summary: L('Reflexion am festen und losen Ende.', 'Reflection at fixed and free ends.'),
              simulations: ['stehende-wellen'],
            },
          ],
        },
      ],
    },
    {
      grade: 13,
      sourceUrl: SOURCE,
      note: Q3_Q4,
      units: [
        {
          code: 'Q3.1',
          title: L('Elektromagnetische Wellen', 'Electromagnetic waves'),
          summary: L(
            'Verbindliches Themenfeld. Spektrum elektromagnetischer Wellen, Polarisation und Totalreflexion, Interferenz am Doppelspalt und Gitter sowie stehende elektromagnetische Wellen.',
            'Mandatory topic area. Spectrum of electromagnetic waves, polarisation and total internal reflection, interference at double slit and grating, and standing electromagnetic waves.',
          ),
          parts: [
            {
              code: 'Q3.1.1',
              title: L('Spektrum elektromagnetischer Wellen', 'Spectrum of electromagnetic waves'),
              summary: L('Frequenzbereiche und technische Anwendungen im Überblick.', 'Overview of frequency ranges and technical applications.'),
            },
            {
              code: 'Q3.1.2',
              title: L('Charakteristische Wellenphänomene', 'Characteristic wave phenomena'),
              summary: L(
                'Lineare Polarisation von Licht und Totalreflexion (Glasfaser).',
                'Linear polarisation of light and total internal reflection (optical fibre).',
              ),
            },
            {
              code: 'Q3.1.3',
              title: L('Überlagerung von elektromagnetischen Wellen', 'Superposition of electromagnetic waves'),
              summary: L(
                'Doppelspalt und Gitter, Wellenlängenbestimmung, Spektren, stehende Wellen.',
                'Double slit and grating, wavelength measurement, spectra, standing waves.',
              ),
              simulations: ['doppelspalt'],
            },
            {
              code: 'Q3.1.4',
              title: L(
                'Brechung, Reflexion, Beugung bei elektromagnetischen Wellen (nur LK)',
                'Refraction, reflection, diffraction of electromagnetic waves (advanced course only)',
              ),
              summary: L('Brechungsgesetz mit Wellenmodell.', 'Law of refraction with the wave model.'),
            },
            {
              code: 'Q3.1.5',
              title: L('Überlagerung von elektromagnetischen Wellen (nur LK)', 'Superposition of electromagnetic waves (advanced course only)'),
              summary: L('Einzelspalt und Interferometer.', 'Single slit and interferometer.'),
            },
          ],
        },
        {
          code: 'Q3.2',
          title: L('Welle-Teilchen-Dualismus', 'Wave–particle duality'),
          summary: L(
            'Verbindliches Themenfeld. Fotoeffekt und Photonenenergie, Energie-Masse-Äquivalenz und De-Broglie-Wellen; im LK Elektronenbeugung und Compton-Effekt.',
            'Mandatory topic area. Photoelectric effect and photon energy, mass–energy equivalence and de Broglie waves; in the advanced course electron diffraction and the Compton effect.',
          ),
          parts: [
            {
              code: 'Q3.2.1',
              title: L(
                'Zusammenhänge der Größen Energie, Impuls, Frequenz und Wellenlänge zur Beschreibung von Quantenobjekten',
                'Relationships between energy, momentum, frequency and wavelength for describing quantum objects',
              ),
              summary: L(
                'Fotoeffekt mit Gegenfeldmethode, Planck’sches Wirkungsquantum, Photonenimpuls, De-Broglie-Gleichung.',
                'Photoelectric effect with counter-field method, Planck\'s constant, photon momentum, de Broglie equation.',
              ),
              simulations: ['photoeffekt', 'elektronenbeugung'],
            },
            {
              code: 'Q3.2.2',
              title: L(
                'Elektronenbeugung an Kristallen, Bragg-Bedingung (nur LK)',
                'Electron diffraction by crystals, Bragg condition (advanced course only)',
              ),
              summary: L('Beugungsbilder von Elektronen deuten.', 'Interpreting electron diffraction patterns.'),
              simulations: ['elektronenbeugung'],
            },
            {
              code: 'Q3.2.3',
              title: L('Compton-Effekt (nur LK)', 'Compton effect (advanced course only)'),
              summary: L('Streuung von Photonen an Elektronen.', 'Scattering of photons by electrons.'),
            },
          ],
        },
        {
          code: 'Q3.3',
          title: L('Atomvorstellungen', 'Models of the atom'),
          summary: L(
            'Verbindliches Themenfeld. Bohr’sches Atommodell, Energieniveaus des Wasserstoffatoms, Franck-Hertz-Versuch, Emission und Absorption sowie Linienspektren.',
            'Mandatory topic area. Bohr model, energy levels of hydrogen, Franck–Hertz experiment, emission and absorption, and line spectra.',
          ),
          parts: [
            {
              code: 'Q3.3.1',
              title: L('Quantisierung', 'Quantisation'),
              summary: L(
                'Bohr’sche Postulate, Energieniveaus von Wasserstoff und Franck-Hertz-Versuch.',
                'Bohr\'s postulates, energy levels of hydrogen and Franck–Hertz experiment.',
              ),
              simulations: ['linienspektren'],
            },
            {
              code: 'Q3.3.2',
              title: L(
                'Emission und Absorption, Zusammenhang zwischen diskretem Spektrum und Energieniveauschema',
                'Emission and absorption, relationship between discrete spectrum and energy-level diagram',
              ),
              summary: L(
                'Linienspektren im Energieniveauschema deuten; Rydberg-Formel.',
                'Interpreting line spectra in the energy-level diagram; Rydberg formula.',
              ),
              simulations: ['linienspektren'],
            },
            {
              code: 'Q3.3.3',
              title: L('Quantisierung (nur LK)', 'Quantisation (advanced course only)'),
              summary: L(
                'Wasserstoffähnliche Atome, Ausblick auf Mehrelektronensysteme und Pauli-Prinzip.',
                'Hydrogen-like atoms, outlook on multi-electron systems and the Pauli principle.',
              ),
              simulations: ['linienspektren'],
            },
            {
              code: 'Q3.3.4',
              title: L('Röntgenstrahlung (nur LK)', 'X-rays (advanced course only)'),
              summary: L(
                'Kontinuierliches und charakteristisches Röntgenspektrum, Röntgenröhre, Moseley-Gesetz.',
                'Continuous and characteristic X-ray spectrum, X-ray tube, Moseley\'s law.',
              ),
            },
          ],
        },
        {
          code: 'Q4.1',
          title: L('Quantenobjekte', 'Quantum objects'),
          summary: L(
            'Verbindliches Themenfeld. Quantenmechanisches Atommodell (Orbitale, Potenzialtopf), Grundaspekte der Quantentheorie am Doppelspalt mit Einzelquanten und quantenphysikalisches Weltbild.',
            'Mandatory topic area. Quantum-mechanical atomic model (orbitals, potential well), basic aspects of quantum theory using the double slit with single quanta, and the quantum world view.',
          ),
          parts: [
            {
              code: 'Q4.1.1',
              title: L('Qualitative Betrachtung eines quantenmechanischen Atommodells', 'Qualitative treatment of a quantum-mechanical atomic model'),
              summary: L(
                'Orbitale als Aufenthaltswahrscheinlichkeit; Elektron als stehende Welle im Potenzialtopf.',
                'Orbitals as probability of presence; electron as standing wave in a potential well.',
              ),
            },
            {
              code: 'Q4.1.2',
              title: L(
                'Grundlegende Aspekte der Quantentheorie: stochastische Vorhersagbarkeit, Interferenz und Superposition, Determiniertheit der Zufallsverteilung, Komplementarität',
                'Basic aspects of quantum theory: stochastic predictability, interference and superposition, determinacy of the random distribution, complementarity',
              ),
              summary: L(
                'Doppelspalt mit einzelnen Elektronen und Photonen; Weginformation vs. Interferenz.',
                'Double slit with single electrons and photons; which-path information vs. interference.',
              ),
            },
            {
              code: 'Q4.1.3',
              title: L(
                'Quantenphysikalisches Weltbild hinsichtlich der Begriffe Realität, Lokalität, Kausalität, Determinismus',
                'Quantum world view regarding reality, locality, causality, determinism',
              ),
              summary: L(
                'Grenzen klassischer Begriffe in der Quantenphysik diskutieren.',
                'Discussing the limits of classical concepts in quantum physics.',
              ),
            },
            {
              code: 'Q4.1.4',
              title: L(
                'Quantitative Betrachtung eines quantenmechanischen Atommodells (nur LK)',
                'Quantitative treatment of a quantum-mechanical atomic model (advanced course only)',
              ),
              summary: L(
                'Energiewerte und Wellenfunktionen im unendlich tiefen Potenzialtopf.',
                'Energy values and wave functions in the infinitely deep potential well.',
              ),
            },
            {
              code: 'Q4.1.5',
              title: L(
                'Stochastische Deutung mittels des Quadrats der quantenmechanischen Wellenfunktion (qualitativ) (nur LK)',
                'Stochastic interpretation via the square of the wave function (qualitative) (advanced course only)',
              ),
              summary: L(
                'Betragsquadrat als Wahrscheinlichkeitsmaß; Delayed-choice-Experiment.',
                'Squared magnitude as probability measure; delayed-choice experiment.',
              ),
            },
            {
              code: 'Q4.1.6',
              title: L('Orts-Impuls-Unbestimmtheit (nur LK)', 'Position–momentum uncertainty (advanced course only)'),
              summary: L('Ort und Impuls können nicht gleichzeitig scharf sein.', 'Position and momentum cannot both be sharply defined.'),
            },
            {
              code: 'Q4.1.7',
              title: L(
                'Koinzidenzmethode zum Nachweis einzelner Photonen anhand eines Beispiels (nur LK)',
                'Coincidence method for detecting single photons using an example (advanced course only)',
              ),
              summary: L(
                'Unteilbarkeit von Photonen, z. B. am Mach-Zehnder-Interferometer.',
                'Indivisibility of photons, e.g. with a Mach–Zehnder interferometer.',
              ),
            },
          ],
        },
        {
          code: 'Q4.2',
          title: L('Technische Anwendungen der Quantenphysik', 'Technical applications of quantum physics'),
          summary: L(
            'Nicht verbindliches Themenfeld. Funktionsweise des Lasers; im LK Tunneleffekt und Rastertunnelmikroskop.',
            'Optional topic area. How lasers work; in the advanced course tunnelling and the scanning tunnelling microscope.',
          ),
          parts: [
            {
              code: 'Q4.2.1',
              title: L('Laser', 'Laser'),
              summary: L(
                'Metastabile Niveaus, Besetzungsinversion, stimulierte Emission, Aufbau und Anwendungen.',
                'Metastable levels, population inversion, stimulated emission, design and applications.',
              ),
            },
            {
              code: 'Q4.2.2',
              title: L('Rastertunnelmikroskop (nur LK)', 'Scanning tunnelling microscope (advanced course only)'),
              summary: L('Tunneleffekt sowie Aufbau und Anwendungen.', 'Tunnelling effect, design and applications.'),
            },
          ],
        },
        {
          code: 'Q4.3',
          title: L('Kernphysik', 'Nuclear physics'),
          summary: L(
            'Nicht verbindliches Themenfeld. Radioaktive Strahlung, Zerfallsgesetz und Halbwertszeit, Bindungsenergie, Kernspaltung und -fusion.',
            'Optional topic area. Radioactive radiation, decay law and half-life, binding energy, nuclear fission and fusion.',
          ),
          parts: [
            {
              code: 'Q4.3.1',
              title: L('Radioaktive Strahlung', 'Radioactive radiation'),
              summary: L(
                'Strahlungsarten, Nachweis, Wirkung, Anwendungen und Gefahren.',
                'Types of radiation, detection, effects, applications and dangers.',
              ),
            },
            {
              code: 'Q4.3.2',
              title: L('Zerfallsgesetze', 'Laws of decay'),
              summary: L('Aktivität, Halbwertszeit, Zerfallskonstante, C14-Methode.', 'Activity, half-life, decay constant, carbon-14 dating.'),
              simulations: ['radioaktiver-zerfall'],
            },
            {
              code: 'Q4.3.3',
              title: L('Bindungsenergie', 'Binding energy'),
              summary: L('Massendefekt, Bindungsenergie pro Nukleon, Kernreaktionen.', 'Mass defect, binding energy per nucleon, nuclear reactions.'),
            },
            {
              code: 'Q4.3.4',
              title: L('Zerfallsgesetze (nur LK)', 'Laws of decay (advanced course only)'),
              summary: L('Zerfallsreihen.', 'Decay chains.'),
              simulations: ['radioaktiver-zerfall'],
            },
            {
              code: 'Q4.3.5',
              title: L(
                'Potenzialtopfmodell für Kerne (nur qualitativ) (nur LK)',
                'Potential-well model for nuclei (qualitative only) (advanced course only)',
              ),
              summary: L(
                'Getrennte Töpfe für Protonen und Neutronen; Alpha-Zerfall durch Tunneln.',
                'Separate wells for protons and neutrons; alpha decay by tunnelling.',
              ),
            },
          ],
        },
        {
          code: 'Q4.4',
          title: L('Spezielle Relativitätstheorie', 'Special relativity'),
          summary: L(
            'Nicht verbindliches Themenfeld. Relativitätspostulate, Zeitdilatation und Längenkontraktion mit Minkowski-Diagrammen sowie relativistische Massenzunahme.',
            'Optional topic area. Postulates of relativity, time dilation and length contraction with Minkowski diagrams, and relativistic mass increase.',
          ),
          parts: [
            {
              code: 'Q4.4.1',
              title: L('Relativitätspostulate', 'Postulates of relativity'),
              summary: L(
                'Relativitätsprinzip, Konstanz von c, Zeitdilatation, Längenkontraktion, Minkowski-Diagramme.',
                'Principle of relativity, constancy of c, time dilation, length contraction, Minkowski diagrams.',
              ),
            },
            {
              code: 'Q4.4.2',
              title: L('Relativistische Massenzunahme (nur phänomenologisch)', 'Relativistic mass increase (phenomenological only)'),
              summary: L('Phänomen der Massenzunahme bei hohen Geschwindigkeiten.', 'The phenomenon of mass increase at high speeds.'),
            },
            {
              code: 'Q4.4.3',
              title: L(
                'Lorentztransformation und Addition von Geschwindigkeiten (nur LK)',
                'Lorentz transformation and addition of velocities (advanced course only)',
              ),
              summary: L('Umrechnung zwischen bewegten Bezugssystemen.', 'Transforming between moving reference frames.'),
            },
            {
              code: 'Q4.4.4',
              title: L(
                'Herleitung der relativistischen Massenzunahme (nur LK)',
                'Derivation of the relativistic mass increase (advanced course only)',
              ),
              summary: L('Massenzunahme aus Grundprinzipien ableiten.', 'Deriving the mass increase from basic principles.'),
            },
          ],
        },
        {
          code: 'Q4.5',
          title: L('Festkörperphysik', 'Solid-state physics'),
          summary: L(
            'Nicht verbindliches Themenfeld. Leiter, Halbleiter und Isolatoren im Bändermodell, Dotierung, Diode und Transistor.',
            'Optional topic area. Conductors, semiconductors and insulators in the band model, doping, diode and transistor.',
          ),
          parts: [
            {
              code: 'Q4.5.1',
              title: L('Leiter, Nichtleiter und Halbleiter', 'Conductors, non-conductors and semiconductors'),
              summary: L('Bändermodell (qualitativ) und Dotierung.', 'Band model (qualitative) and doping.'),
            },
            {
              code: 'Q4.5.2',
              title: L('Diode und Transistor', 'Diode and transistor'),
              summary: L(
                'p-n-Übergang, Kennlinie, Gleichrichter, Transistor als Schalter.',
                'p-n junction, characteristic curve, rectifier, transistor as switch.',
              ),
            },
            {
              code: 'Q4.5.3',
              title: L('Quantenphysikalische Erklärung der Energiebänder (nur LK)', 'Quantum explanation of energy bands (advanced course only)'),
              summary: L('Fermienergie (qualitativ).', 'Fermi energy (qualitative).'),
            },
            {
              code: 'Q4.5.4',
              title: L('Verstärkerschaltung (nur LK)', 'Amplifier circuit (advanced course only)'),
              summary: L('Transistor als Verstärker im Experiment.', 'Transistor as amplifier in experiment.'),
            },
            {
              code: 'Q4.5.5',
              title: L('Supraleitung (nur qualitativ) (nur LK)', 'Superconductivity (qualitative only) (advanced course only)'),
              summary: L('Phänomen der Supraleitung.', 'The phenomenon of superconductivity.'),
            },
          ],
        },
        {
          code: 'Q4.6',
          title: L('Astrophysik', 'Astrophysics'),
          summary: L(
            'Nicht verbindliches Themenfeld. Sonnensystem und Himmelsmechanik, Kosmologie mit Rotverschiebung und Urknall sowie Struktur des Universums; im LK Energie der Sonne und Sternentwicklung.',
            'Optional topic area. Solar system and celestial mechanics, cosmology with redshift and Big Bang, and the structure of the universe; in the advanced course the Sun\'s energy and stellar evolution.',
          ),
          parts: [
            {
              code: 'Q4.6.1',
              title: L('Unser Sonnensystem', 'Our solar system'),
              summary: L(
                'Sonne, Planeten, Kometen, Gravitationsgesetz, Kepler’sche Gesetze, Gezeiten.',
                'Sun, planets, comets, law of gravitation, Kepler\'s laws, tides.',
              ),
              simulations: ['planetenbahnen'],
            },
            {
              code: 'Q4.6.2',
              title: L('Kosmologie', 'Cosmology'),
              summary: L('Galaxien, Rotverschiebung und Urknall.', 'Galaxies, redshift and Big Bang.'),
            },
            {
              code: 'Q4.6.3',
              title: L('Struktur des Universums', 'Structure of the universe'),
              summary: L(
                'Größe und Alter, Hintergrundstrahlung, dunkle Materie und Energie.',
                'Size and age, background radiation, dark matter and energy.',
              ),
            },
            {
              code: 'Q4.6.4',
              title: L('Energieumwandlung in der Sonne (nur LK)', 'Energy conversion in the Sun (advanced course only)'),
              summary: L('Proton-Proton-Reaktion und weitere Fusionsprozesse.', 'Proton–proton chain and other fusion processes.'),
            },
            {
              code: 'Q4.6.5',
              title: L('Sterntypen, Sternentstehung und -entwicklung (nur LK)', 'Star types, star formation and evolution (advanced course only)'),
              summary: L('Hauptreihensterne und Lebenszyklus eines Sterns.', 'Main-sequence stars and the life cycle of a star.'),
            },
          ],
        },
      ],
    },
  ],
};
