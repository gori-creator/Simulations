# Hessen · Gymnasium · Physik – Lehrplan-Aufbereitung mit Simulationszuordnung

# Teil A – Überblick

| Merkmal | Sekundarstufe I | Gymnasiale Oberstufe |
|---|---|---|
| Bundesland | Hessen | Hessen |
| Schulart | Gymnasium (Sekundarstufe I) | gymnasiale Oberstufe (gilt laut Dokument auch für das berufliche Gymnasium) |
| Fach | Physik | Physik |
| Name des Lehrplans | „Bildungsstandards und Inhaltsfelder – Das neue Kerncurriculum für Hessen, Sekundarstufe I – Gymnasium, PHYSIK“, Hessisches Kultusministerium | „Kerncurriculum gymnasiale Oberstufe PHYSIK“, Hessisches Ministerium für Kultus, Bildung und Chancen (HMKB) |
| Jahr / Stand | im Dokument nicht angegeben (siehe Teil E) | Ausgabe 2024, Stand 01.08.2025; KC seit Schuljahr 2016/17 in Kraft, 2024 wegen Abiturrelevanz von Q4 angepasst |
| gültig für | Sekundarstufe I bis Ende Jahrgangsstufe 9/10, in zwei Stufen ohne feste Jahrgangszuordnung | Einführungsphase (E1/E2) und Qualifikationsphase (Q1–Q4) |
| G8/G9 | keine ausdrückliche Unterscheidung; Endpunkt „Jahrgangsstufe 9/10“ | keine Angabe; nur Kurshalbjahre. Im JSON angenommen: E = 11, Q1/Q2 = 12, Q3/Q4 = 13 (G9) |
| Niveaus / Wahl | keine Niveaus; zwei Stufen („nach ca. der Hälfte des Stundenkontingents“ / „zusätzlich … nach Abschluss der Jahrgangsstufe 9/10“) | Qualifikationsphase: grundlegendes Niveau (GK + LK) und erhöhtes Niveau (nur LK); verbindliche und nicht verbindliche Themenfelder; neun verbindliche Themenfelder fürs Abitur |
| Struktur | 9 Inhaltsfelder → inhaltliche Schwerpunkte je Stufe (ohne Nummern im Original) | Kurshalbjahr → Themenfeld (nummeriert, z. B. Q2.3) → inhaltliche Aspekte (ohne Nummern im Original) |

| Jahrgangsstufe (Lehrplan) | JSON-Jahrgang | Lernbereiche | Unterbereiche | Unterbereiche mit Simulation | zugeordnete Simulationen (verschieden) |
|---|---|---|---|---|---|
| Stufe 1 – „nach ca. der Hälfte des Stundenkontingents“ | 6, 7, 8 | 9 | 24 | 8 | 6 |
| Stufe 2 – „zusätzlich dazu nach Abschluss der Jahrgangsstufe 9/10“ | 9, 10 | 9 | 28 | 12 | 13 |
| Einführungsphase E1/E2 – „Mechanik“ | 11 | 7 | 24 | 13 | 8 |
| Qualifikationsphase Q1 – „Elektrisches und magnetisches Feld“ | 12 | 2 | 15 | 7 | 3 |
| Qualifikationsphase Q2 – „Schwingungen, Induktion und mechanische Wellen“ | 12 | 3 | 24 | 14 | 7 |
| Qualifikationsphase Q3 – „Elektromagnetische Wellen und Quantenphysik“ | 13 | 3 | 12 | 8 | 5 |
| Qualifikationsphase Q4 – „Struktur von Materie, Raum und Zeit“ | 13 | 6 | 28 | 3 | 2 |

Insgesamt verwendet: **35 von 36** Simulationen der Liste für Physik.

Nicht zugeordnet (passt zu keinem Lernbereich dieses Lehrplans oder nur „irgendwie verwandt“): `doppler-effekt`

# Teil B – Lehrplan im Detail

## Stufe 1 – „nach ca. der Hälfte des Stundenkontingents“  
*Stage 1 – “after about half of the allotted teaching time”*  
Jahrgangsstufe(n) im JSON: 6, 7, 8  
(Quelle: „Bildungsstandards und Inhaltsfelder – Das neue Kerncurriculum für Hessen, Sekundarstufe I – Gymnasium, PHYSIK“ (Datei kc_physik_uesekii_201102-uea.pdf), S. 22–27 (Kap. 6), 28–37 (Kap. 7.1/7.2); Internet laut Impressum: www.kultusministerium.hessen.de)

> Stufe 1 der Übersicht in Kap. 7.2 („nach ca. der Hälfte des Stundenkontingents“). Der Lehrplan ordnet diese Stufe keiner Jahrgangsstufe zu; Kap. 7.1 bezieht sich auf die Jahrgangsstufen 6/8 und sagt, dass sich dafür keine Kompetenzerwartungen sinnvoll formulieren lassen. Der Eintrag bei Jahrgangsstufe 6, 7 und 8 ist deshalb eine Annahme. Codes: erste Ziffer = Inhaltsfeld (Reihenfolge wie im Lehrplan), zweite = inhaltlicher Schwerpunkt; die Nummerierung stammt nicht aus dem Lehrplan.

### 1 Haus der Naturwissenschaften
*EN: House of the natural sciences*

- Kurz (DE): Wie Naturwissenschaft arbeitet: Körper und ihre Eigenschaften beschreiben, physikalische Größen messen und zwischen Beobachtung und Deutung unterscheiden.
- Kurz (EN): How science works: describing bodies and their properties, measuring physical quantities and distinguishing observation from interpretation.
- Simulationen: –
- Unterbereiche:
  - 1.1 Körper und deren Eigenschaften · *Bodies and their properties* – Kurz: Gegenstände nach messbaren Eigenschaften beschreiben und ordnen. · *EN: Describing and classifying objects by measurable properties.* – Simulationen: –
  - 1.2 Physikalische Größen und ihre Messung · *Physical quantities and their measurement* – Kurz: Größen mit Einheiten messen und Versuche planen und protokollieren. · *EN: Measuring quantities with units and planning and recording experiments.* – Simulationen: –

### 2 Erweiterung der Sinne
*EN: Extension of the senses*

- Kurz (DE): Sehen und Hören mit dem Sender-Empfänger-Modell erklären, Schatten und das Verhalten von Licht an Grenzflächen untersuchen sowie Erscheinungen im System Sonne–Erde–Mond deuten.
- Kurz (EN): Explaining seeing and hearing with the sender–receiver model, investigating shadows and the behaviour of light at boundaries, and interpreting phenomena of the Sun–Earth–Moon system.
- Simulationen: `licht-schatten`, `reflexion`, `brechung`
- Unterbereiche:
  - 2.1 Wahrnehmung der Umgebung mit den Sinnesorganen · *Perceiving the surroundings with the sense organs* – Kurz: Wie Auge und Ohr Licht und Schall wahrnehmen. · *EN: How eye and ear perceive light and sound.* – Simulationen: –
  - 2.2 Sender-Empfänger-Modell · *Sender–receiver model* – Kurz: Lichtquelle bzw. Schallquelle, Ausbreitung und Empfänger unterscheiden. · *EN: Distinguishing source, propagation and receiver of light or sound.* – Simulationen: –
  - 2.3 Schatten als Abwesenheit von Licht · *Shadow as the absence of light* – Kurz: Schattenentstehung mit geradliniger Lichtausbreitung erklären. · *EN: Explaining shadows with the rectilinear propagation of light.* – Simulationen: `licht-schatten`
  - 2.4 Verhalten von Licht an Grenzflächen · *Behaviour of light at boundaries* – Kurz: Reflexion und Brechung von Licht experimentell untersuchen. · *EN: Investigating reflection and refraction of light experimentally.* – Simulationen: `reflexion`, `brechung`
  - 2.5 Astronomische Phänomene durch Konstellationen von Sonne-Erde-Mond · *Astronomical phenomena due to Sun–Earth–Moon constellations* – Kurz: Mondphasen, Finsternisse u. Ä. mit Modellen erklären. · *EN: Explaining lunar phases, eclipses and similar phenomena with models.* – Simulationen: –

### 3 Energie in Umwelt und Technik
*EN: Energy in the environment and technology*

- Kurz (DE): Ein anschaulicher Energiebegriff: Energie wird transportiert und geht als nutzlose Wärme an die Umgebung (Entwertung); Energiesparen im Haushalt.
- Kurz (EN): An intuitive concept of energy: energy is transported and dissipated as useless heat to the surroundings; saving energy at home.
- Simulationen: –
- Unterbereiche:
  - 3.1 Anschaulicher Energiebegriff · *Intuitive concept of energy* – Kurz: Energie als Größe, die in vielen Formen vorkommt und Vorgänge antreibt. · *EN: Energy as a quantity that occurs in many forms and drives processes.* – Simulationen: –
  - 3.2 Energietransport · *Energy transport* – Kurz: Wege, auf denen Energie von einem Ort zum anderen gelangt. · *EN: Ways in which energy gets from one place to another.* – Simulationen: –
  - 3.3 Energiestrom in die Umgebung als Entwertung von Energie · *Energy flow to the surroundings as degradation of energy* – Kurz: Verstehen, dass Energie nicht verschwindet, aber an Nutzbarkeit verliert. · *EN: Understanding that energy does not vanish but becomes less usable.* – Simulationen: –

### 4 Elektrizität im Alltag
*EN: Electricity in everyday life*

- Kurz (DE): Elektrischer Strom als Energietransport, Bauteile und Aufbau einfacher Stromkreise, Leiter und Isolatoren sowie sicherer Umgang mit Elektrizität.
- Kurz (EN): Electric current as energy transport, components and setup of simple circuits, conductors and insulators, and safe handling of electricity.
- Simulationen: `einfacher-stromkreis`
- Unterbereiche:
  - 4.1 elektrischer Strom als Transportform von Energie · *Electric current as a means of transporting energy* – Kurz: Mit einem Modell erklären, wie der Stromkreis Energie überträgt. · *EN: Explaining with a model how a circuit transfers energy.* – Simulationen: `einfacher-stromkreis`
  - 4.2 Elemente des elektrischen Stromkreises · *Elements of the electric circuit* – Kurz: Quelle, Leitung, Schalter und Verbraucher sowie Schaltskizzen. · *EN: Source, wires, switch and load, and circuit diagrams.* – Simulationen: `einfacher-stromkreis`
  - 4.3 Gefahren beim Umgang mit Elektrizität im Alltag · *Dangers of electricity in everyday life* – Kurz: Gefahren erkennen und sicheres Verhalten begründen. · *EN: Recognising dangers and justifying safe behaviour.* – Simulationen: –

### 5 Wettererscheinungen und Klima
*EN: Weather phenomena and climate*

- Kurz (DE): Temperatur und ihre Messung, Teilchenmodell der Materie, Aggregatzustände, Wärmeausdehnung und Anomalie des Wassers sowie ein erster Druckbegriff.
- Kurz (EN): Temperature and its measurement, the particle model of matter, states of matter, thermal expansion and the anomaly of water, and a first idea of pressure.
- Simulationen: `teilchenmodell`
- Unterbereiche:
  - 5.1 Temperatur und deren Messung · *Temperature and its measurement* – Kurz: Thermometer verstehen und kalibrieren. · *EN: Understanding and calibrating thermometers.* – Simulationen: `teilchenmodell`
  - 5.2 Modelle des Aufbaus der Materie · *Models of the structure of matter* – Kurz: Stoffe mit einem Teilchenmodell beschreiben. · *EN: Describing substances with a particle model.* – Simulationen: `teilchenmodell`
  - 5.3 Aggregatzustände und deren Übergänge · *States of matter and their transitions* – Kurz: Schmelzen, Verdampfen usw. mit dem Teilchenmodell erklären. · *EN: Explaining melting, evaporation etc. with the particle model.* – Simulationen: `teilchenmodell`
  - 5.4 Stoffe bei Temperaturänderung · *Substances when temperature changes* – Kurz: Ausdehnung von festen, flüssigen und gasförmigen Stoffen untersuchen. · *EN: Investigating the expansion of solids, liquids and gases.* – Simulationen: –
  - 5.5 Anomalie des Wassers und seine Bedeutung für das irdische Leben · *Anomaly of water and its importance for life on Earth* – Kurz: Dichteverhalten von Wasser bei 4 °C und Folgen für Gewässer. · *EN: Density behaviour of water at 4 °C and consequences for lakes.* – Simulationen: –
  - 5.6 Druck als „Gepresstsein“ der Materie · *Pressure as the 'compressed state' of matter* – Kurz: Anschauliche Vorstellung von Druck. · *EN: An intuitive idea of pressure.* – Simulationen: –

### 6 Fortbewegung und Mobilität
*EN: Locomotion and mobility*

- Kurz (DE): Bewegungen mit Weg, Zeit und Geschwindigkeit beschreiben und Geschwindigkeiten messen.
- Kurz (EN): Describing motion with distance, time and speed and measuring speeds.
- Simulationen: `bewegungsdiagramme`
- Unterbereiche:
  - 6.1 Weg, Zeit und Geschwindigkeit · *Distance, time and speed* – Kurz: Geschwindigkeiten messen und Bewegungen in Diagrammen darstellen. · *EN: Measuring speeds and representing motion in diagrams.* – Simulationen: `bewegungsdiagramme`

### 7 Technik im Dienst des Menschen
*EN: Technology in the service of people*

- Kurz (DE): Eigenschaften von Magneten, Modell der Elementarmagnete und Magnetfelder.
- Kurz (EN): Properties of magnets, the model of elementary magnets and magnetic fields.
- Simulationen: –
- Unterbereiche:
  - 7.1 Magnetismus · *Magnetism* – Kurz: Magnete untersuchen, Feldlinien zeichnen und mit Elementarmagneten erklären. · *EN: Investigating magnets, drawing field lines and explaining them with elementary magnets.* – Simulationen: –

### 8 Zukunftssichere Energieversorgung
*EN: Sustainable energy supply*

- Kurz (DE): Regenerative und erschöpfbare Energieträger unterscheiden und Energiekosten im Alltag deuten.
- Kurz (EN): Distinguishing renewable and finite energy sources and interpreting everyday energy costs.
- Simulationen: –
- Unterbereiche:
  - 8.1 Unterscheidung zwischen regenerativen und erschöpfbaren Energien · *Distinguishing renewable and finite energy sources* – Kurz: Energieträger nach Verfügbarkeit einordnen und eigenes Verhalten bewerten. · *EN: Classifying energy sources by availability and evaluating one's own behaviour.* – Simulationen: –

### 9 Physik in der Verantwortung
*EN: Physics and responsibility*

- Kurz (DE): Verantwortung für die Umwelt und die Rolle der Physik bei Natur- und Umweltereignissen.
- Kurz (EN): Responsibility for the environment and the role of physics in natural and environmental events.
- Simulationen: –
- Unterbereiche:
  - 9.1 Verantwortung gegenüber der Umwelt · *Responsibility towards the environment* – Kurz: Umwelt- und Gesundheitsaspekte beim Experimentieren und im Alltag berücksichtigen. · *EN: Taking environmental and health aspects into account in experiments and everyday life.* – Simulationen: –
  - 9.2 Rolle der Physik bei Umwelt- und Naturereignissen · *Role of physics in environmental and natural events* – Kurz: Physikalische Informationen aus Meldungen zu Ereignissen entnehmen. · *EN: Extracting physical information from reports on events.* – Simulationen: –

## Stufe 2 – „zusätzlich dazu nach Abschluss der Jahrgangsstufe 9/10“  
*Stage 2 – “additionally, after completing grade 9/10”*  
Jahrgangsstufe(n) im JSON: 9, 10  
(Quelle: „Bildungsstandards und Inhaltsfelder – Das neue Kerncurriculum für Hessen, Sekundarstufe I – Gymnasium, PHYSIK“ (Datei kc_physik_uesekii_201102-uea.pdf), S. 19–27 (Kap. 6), 29–37 (Kap. 7.2); Internet laut Impressum: www.kultusministerium.hessen.de)

> Stufe 2 der Übersicht in Kap. 7.2: zusätzliche Schwerpunkte bis zum Ende der Jahrgangsstufe 9/10 (Übergang in die Sekundarstufe II); die Inhalte von Stufe 1 werden vorausgesetzt. Doppeljahrgangsstufe 9/10: bei Jahrgangsstufe 9 und 10 gleich eingetragen. Nummerierung nicht aus dem Lehrplan.

### 1 Haus der Naturwissenschaften
*EN: House of the natural sciences*

- Kurz (DE): Physik im Verbund mit Chemie und Biologie einordnen, historische und aktuelle Erkenntniswege kennen und Messgenauigkeit beurteilen.
- Kurz (EN): Placing physics alongside chemistry and biology, knowing historical and current ways of gaining knowledge, and judging measurement accuracy.
- Simulationen: –
- Unterbereiche:
  - 1.1 Besonderheiten und Gemeinsamkeiten der Physik, Chemie und Biologie · *Particularities and commonalities of physics, chemistry and biology* – Kurz: Arbeitsweisen der drei Naturwissenschaften vergleichen. · *EN: Comparing the methods of the three natural sciences.* – Simulationen: –
  - 1.2 Historische und aktuelle Erkenntniswege der Physik · *Historical and current ways of gaining knowledge in physics* – Kurz: An Beispielen zeigen, wie physikalisches Wissen entsteht; Messfehler einschätzen. · *EN: Showing with examples how physical knowledge arises; estimating measurement errors.* – Simulationen: –

### 2 Erweiterung der Sinne
*EN: Extension of the senses*

- Kurz (DE): Ausbreitung von Licht und Schall vergleichen, optische Phänomene erklären und optische Abbildungen (z. B. mit Linsen) erzeugen; Schallgeschwindigkeit bestimmen.
- Kurz (EN): Comparing the propagation of light and sound, explaining optical phenomena and producing optical images (e.g. with lenses); determining the speed of sound.
- Simulationen: `reflexion`, `brechung`, `linsen`
- Unterbereiche:
  - 2.1 Schall, Licht und ihre Ausbreitung · *Sound, light and their propagation* – Kurz: Ausbreitung von Licht und Schall vergleichen, auch die Schallgeschwindigkeit. · *EN: Comparing how light and sound propagate, including the speed of sound.* – Simulationen: –
  - 2.2 Optische Phänomene · *Optical phenomena* – Kurz: Phänomene wie Spiegelbilder, Brechung und Totalreflexion physikalisch erklären. · *EN: Explaining phenomena such as mirror images, refraction and total internal reflection.* – Simulationen: `reflexion`, `brechung`
  - 2.3 Optische Abbildungen · *Optical images* – Kurz: Bilder mit Linsen und optischen Instrumenten erzeugen und zeichnerisch konstruieren. · *EN: Forming images with lenses and optical instruments and constructing them graphically.* – Simulationen: `linsen`

### 3 Energie in Umwelt und Technik
*EN: Energy in the environment and technology*

- Kurz (DE): Energie wird quantifiziert: Energieformen und Umwandlungsketten, Energieerhaltung und Wirkungsgrade.
- Kurz (EN): Energy is quantified: forms of energy and conversion chains, conservation of energy and efficiency.
- Simulationen: `energieerhaltung`
- Unterbereiche:
  - 3.1 Energie als quantifizierbare Größe · *Energy as a quantifiable quantity* – Kurz: Energien berechnen und in Joule angeben. · *EN: Calculating energies and stating them in joules.* – Simulationen: `energieerhaltung`
  - 3.2 Energieformen und ihre Umwandlung · *Forms of energy and their conversion* – Kurz: Umwandlungsketten aufstellen und Wirkungsgrade bestimmen. · *EN: Setting up conversion chains and determining efficiencies.* – Simulationen: `energieerhaltung`
  - 3.3 Prinzip der Energieerhaltung und dessen Anwendung · *Principle of conservation of energy and its application* – Kurz: Energieerhaltung nutzen, um Vorgänge vorherzusagen. · *EN: Using conservation of energy to predict processes.* – Simulationen: `energieerhaltung`

### 4 Elektrizität im Alltag
*EN: Electricity in everyday life*

- Kurz (DE): Stromstärke, Spannung und Widerstand quantitativ; komplexere Schaltungen als Systeme; elektrostatische Erscheinungen durch Ladungen erklären.
- Kurz (EN): Current, voltage and resistance quantitatively; more complex circuits as systems; explaining electrostatic phenomena by charges.
- Simulationen: `ohmsches-gesetz`, `reihe-parallel`
- Unterbereiche:
  - 4.1 Einfluss von Widerständen auf die Stärke des elektrischen Stroms · *Influence of resistors on the strength of the electric current* – Kurz: Zusammenhang von Spannung, Stromstärke und Widerstand untersuchen. · *EN: Investigating the relationship between voltage, current and resistance.* – Simulationen: `ohmsches-gesetz`
  - 4.2 Stromkreise als Systeme · *Circuits as systems* – Kurz: Reihen- und Parallelschaltungen als Ganzes betrachten; Strom als Ladung pro Zeit, Spannung als Energie pro Ladung. · *EN: Viewing series and parallel circuits as a whole; current as charge per time, voltage as energy per charge.* – Simulationen: `reihe-parallel`
  - 4.3 elektrostatische Phänomene · *Electrostatic phenomena* – Kurz: Aufladung, Anziehung und Abstoßung mit Ladungen erklären. · *EN: Explaining charging, attraction and repulsion with charges.* – Simulationen: –

### 5 Wettererscheinungen und Klima
*EN: Weather phenomena and climate*

- Kurz (DE): Wärmeübertragung, Druck als Zustandsgröße und Druck- bzw. Temperaturunterschiede als Antrieb von Wetter und Klima; Einfluss des Menschen auf das Klima.
- Kurz (EN): Heat transfer, pressure as a state variable and differences in pressure and temperature as drivers of weather and climate; human influence on climate.
- Simulationen: `gasgesetze`
- Unterbereiche:
  - 5.1 Übertragung thermischer Energie · *Transfer of thermal energy* – Kurz: Wärmeleitung, Wärmeströmung und Wärmestrahlung untersuchen. · *EN: Investigating conduction, convection and radiation.* – Simulationen: –
  - 5.2 Druck als physikalische Zustandsgröße · *Pressure as a physical state variable* – Kurz: Druck in Abhängigkeit von anderen Größen darstellen. · *EN: Representing pressure as a function of other quantities.* – Simulationen: `gasgesetze`
  - 5.3 Druck- und Temperaturunterschiede · *Pressure and temperature differences* – Kurz: Wettererscheinungen als Ausgleich von Unterschieden erklären. · *EN: Explaining weather phenomena as the equalising of differences.* – Simulationen: –

### 6 Fortbewegung und Mobilität
*EN: Locomotion and mobility*

- Kurz (DE): Kräfte als Wechselwirkung, Trägheit, Wirkungen von Kräften (Bewegungsänderung, Verformung) und Leistung von Mensch und Technik.
- Kurz (EN): Forces as interaction, inertia, effects of forces (change of motion, deformation) and power of humans and machines.
- Simulationen: `hookesches-gesetz`, `kraefteaddition`
- Unterbereiche:
  - 6.1 Wechselwirkung von Körpern · *Interaction of bodies* – Kurz: Kräfte treten immer paarweise zwischen zwei Körpern auf. · *EN: Forces always occur in pairs between two bodies.* – Simulationen: –
  - 6.2 Trägheit eines Körpers · *Inertia of a body* – Kurz: Trägheit als Beharrungsvermögen; Bedeutung für die Verkehrssicherheit. · *EN: Inertia as resistance to changes in motion; importance for road safety.* – Simulationen: –
  - 6.3 Wirkungen von Kräften · *Effects of forces* – Kurz: Kräfte ändern Bewegungen und verformen Körper; Kräfte darstellen und messen. · *EN: Forces change motion and deform bodies; representing and measuring forces.* – Simulationen: `hookesches-gesetz`, `kraefteaddition`
  - 6.4 Menschliche und technische Leistungen und deren Vergleich · *Human and technical power and their comparison* – Kurz: Eigene körperliche Leistung bestimmen und mit Maschinen vergleichen. · *EN: Determining one's own physical power and comparing it with machines.* – Simulationen: –

### 7 Technik im Dienst des Menschen
*EN: Technology in the service of people*

- Kurz (DE): Kraftwandler wie Hebel und Rollen, Auftrieb in Flüssigkeiten und Gasen sowie die magnetische Wirkung des Stroms und elektromagnetische Energiewandler.
- Kurz (EN): Force converters such as levers and pulleys, buoyancy in liquids and gases, and the magnetic effect of current and electromagnetic energy converters.
- Simulationen: `hebelgesetz`, `schiefe-ebene`
- Unterbereiche:
  - 7.1 Kraft wandelnde Systeme · *Force-converting systems* – Kurz: Gesetzmäßigkeiten an Hebel, Rolle und schiefer Ebene untersuchen; Gleichgewicht. · *EN: Investigating laws for levers, pulleys and inclined planes; equilibrium.* – Simulationen: `hebelgesetz`, `schiefe-ebene`
  - 7.2 Phänomen Auftrieb · *Phenomenon of buoyancy* – Kurz: Schwimmen, Schweben und Sinken experimentell untersuchen und erklären. · *EN: Investigating and explaining floating, hovering and sinking.* – Simulationen: –
  - 7.3 Magnetische Wirkung des elektrischen Stroms · *Magnetic effect of electric current* – Kurz: Elektromagnete und elektromagnetische Energiewandler wie Motoren verstehen. · *EN: Understanding electromagnets and electromagnetic energy converters such as motors.* – Simulationen: –

### 8 Zukunftssichere Energieversorgung
*EN: Sustainable energy supply*

- Kurz (DE): Erzeugung elektrischer Energie in Kraftwerken, Speicherung und Transport (Transformation der Spannung) sowie Versorgungsnetze.
- Kurz (EN): Generating electrical energy in power plants, storage and transport (voltage transformation), and supply grids.
- Simulationen: `induktion`
- Unterbereiche:
  - 8.1 Umwandlung verschiedener Energieformen in elektrische Energie · *Converting various forms of energy into electrical energy* – Kurz: Generatoren und andere Wandler erklären. · *EN: Explaining generators and other converters.* – Simulationen: `induktion`
  - 8.2 Großenergieanlagen · *Large-scale power plants* – Kurz: Kraftwerkstypen vergleichen. · *EN: Comparing types of power plant.* – Simulationen: –
  - 8.3 Speicherung und Transport von Energie · *Storage and transport of energy* – Kurz: Speicher und Hochspannungsübertragung mit Transformatoren untersuchen. · *EN: Investigating storage and high-voltage transmission with transformers.* – Simulationen: –
  - 8.4 Energieversorgungsnetze · *Energy supply grids* – Kurz: Zentrale und dezentrale Versorgung bewerten. · *EN: Evaluating centralised and decentralised supply.* – Simulationen: –

### 9 Physik in der Verantwortung
*EN: Physics and responsibility*

- Kurz (DE): Radioaktiver Zerfall und ionisierende Strahlung: Wirkung, Gefahren, Schutz sowie Chancen und Risiken von Technologien.
- Kurz (EN): Radioactive decay and ionising radiation: effects, dangers, protection, and opportunities and risks of technologies.
- Simulationen: `radioaktiver-zerfall`
- Unterbereiche:
  - 9.1 radioaktive Zerfallsprozesse · *Radioactive decay processes* – Kurz: Zerfall mit Atommodellen beschreiben und Zerfallsdaten auswerten. · *EN: Describing decay with atomic models and evaluating decay data.* – Simulationen: `radioaktiver-zerfall`
  - 9.2 Auswirkungen verschiedener Strahlungsarten · *Effects of different types of radiation* – Kurz: Alpha-, Beta- und Gammastrahlung, Gefährdungen und Schutzmaßnahmen. · *EN: Alpha, beta and gamma radiation, hazards and protective measures.* – Simulationen: –
  - 9.3 Konsequenzen der Nutzung physikalischer Forschungsergebnisse · *Consequences of using the results of physics research* – Kurz: Chancen und Risiken technologischer Entwicklungen abwägen. · *EN: Weighing opportunities and risks of technological developments.* – Simulationen: –

## Einführungsphase E1/E2 – „Mechanik“  
*Introductory phase E1/E2 – “Mechanics”*  
Jahrgangsstufe(n) im JSON: 11  
(Quelle: „Kerncurriculum gymnasiale Oberstufe PHYSIK, Ausgabe 2024 (Stand 01.08.2025)“ (Datei kernkurriculum_gymnasiale_oberstufe-physik.pdf), S. 27, 29–31; Internet laut Impressum: https://kultus.hessen.de)

> Kurshalbjahre E1/E2 „Mechanik“. Verbindlich: Themenfelder E.1–E.3 (mindestens eines davon im zweiten Kurshalbjahr); E.4–E.7 sind nicht verbindlich. Keine Unterscheidung nach Grund-/Leistungskurs in der Einführungsphase. Die Zuordnung zu Jahrgangsstufe 11 ist eine Annahme (G9-Zählung) – der Lehrplan nennt nur Kurshalbjahre. Nummerierung der Unterbereiche (dritte Stelle) nicht aus dem Lehrplan.

### E.1 Bewegungen und ihre Beschreibung
*EN: Motion and its description*

- Kurz (DE): [verbindlich] Gleichförmige und gleichmäßig beschleunigte Bewegungen untersuchen, in t-s-, t-v- und t-a-Diagrammen darstellen und durch Bewegungsgesetze beschreiben, z. B. beim freien Fall.
- Kurz (EN): [mandatory] Investigating uniform and uniformly accelerated motion, representing it in t-s, t-v and t-a diagrams and describing it with equations of motion, e.g. free fall.
- Simulationen: `bewegungsdiagramme`, `freier-fall`
- Unterbereiche:
  - E.1.1 Untersuchung von Bewegungen · *Investigation of motion* – Kurz: Bewegungen messen und Messdaten auswerten. · *EN: Measuring motion and evaluating the data.* – Simulationen: `bewegungsdiagramme`
  - E.1.2 t-s-, t-v- und t-a-Diagramme · *t-s, t-v and t-a diagrams* – Kurz: Bewegungen in Diagrammen darstellen und deuten. · *EN: Representing and interpreting motion in diagrams.* – Simulationen: `bewegungsdiagramme`
  - E.1.3 gleichförmige Bewegung · *uniform motion* – Kurz: Geschwindigkeit definieren und im Versuch messen. · *EN: Defining velocity and measuring it experimentally.* – Simulationen: `bewegungsdiagramme`
  - E.1.4 gleichmäßig beschleunigte Bewegung ohne Anfangsgeschwindigkeit und Anfangsort · *uniformly accelerated motion without initial velocity and initial position* – Kurz: Beschleunigung, Durchschnitts- vs. Momentangeschwindigkeit; freier Fall mit Bestimmung von g. · *EN: Acceleration, average vs. instantaneous velocity; free fall including determining g.* – Simulationen: `bewegungsdiagramme`, `freier-fall`
  - E.1.5 Idealisierung · *Idealisation* – Kurz: Massepunkt und Vernachlässigung der Reibung als Modellannahmen. · *EN: Point mass and neglect of friction as model assumptions.* – Simulationen: –
  - E.1.6 Zeit-Ort- und Zeit-Geschwindigkeit-Gesetze und deren Zusammenhang · *Time–position and time–velocity laws and their relationship* – Kurz: Bewegungsgesetze aus Diagrammen herleiten und verknüpfen. · *EN: Deriving and linking the laws of motion from diagrams.* – Simulationen: `bewegungsdiagramme`

### E.2 Newton’sche Axiome und Erhaltungssätze
*EN: Newton's laws and conservation laws*

- Kurz (DE): [verbindlich] Die drei Newton’schen Axiome sowie Energie- und Impulserhaltung, angewandt auf elastische und unelastische Stöße.
- Kurz (EN): [mandatory] Newton's three laws and conservation of energy and momentum, applied to elastic and inelastic collisions.
- Simulationen: `energieerhaltung`, `stoesse`
- Unterbereiche:
  - E.2.1 die drei Newton’schen Axiome · *Newton's three laws* – Kurz: Trägheitsgesetz, Grundgleichung F = m·a, Wechselwirkungsprinzip und Inertialsysteme. · *EN: Law of inertia, F = m·a, action–reaction principle and inertial frames.* – Simulationen: –
  - E.2.2 Energie und Energieerhaltung · *Energy and conservation of energy* – Kurz: Kinetische und potenzielle Energie, Erhaltung in reibungsfreien abgeschlossenen Systemen. · *EN: Kinetic and potential energy, conservation in frictionless closed systems.* – Simulationen: `energieerhaltung`
  - E.2.3 Impuls und Impulserhaltung · *Momentum and conservation of momentum* – Kurz: Elastische und unelastische Stöße, Rückstoß und Impuls als Erhaltungsgröße. · *EN: Elastic and inelastic collisions, recoil and momentum as a conserved quantity.* – Simulationen: `stoesse`

### E.3 Waagerechter Wurf und Kreisbewegung
*EN: Horizontal projectile motion and circular motion*

- Kurz (DE): [verbindlich] Bewegungen überlagern (waagerechter Wurf) und gleichförmige Kreisbewegungen mit Bahn- und Winkelgeschwindigkeit sowie Zentripetalkraft beschreiben.
- Kurz (EN): [mandatory] Superposing motions (horizontal projectile) and describing uniform circular motion with linear and angular velocity and centripetal force.
- Simulationen: `schiefer-wurf`, `kreisbewegung`
- Unterbereiche:
  - E.3.1 Bezugssysteme, Superpositionsprinzip · *Reference frames, superposition principle* – Kurz: Waagerechten Wurf als Überlagerung zweier Bewegungen darstellen. · *EN: Representing horizontal projectile motion as a superposition of two motions.* – Simulationen: `schiefer-wurf`
  - E.3.2 Bahn- und Winkelgeschwindigkeit bei Kreisbewegungen · *Linear and angular velocity in circular motion* – Kurz: Beide Geschwindigkeiten definieren und vergleichen. · *EN: Defining and comparing both velocities.* – Simulationen: `kreisbewegung`
  - E.3.3 Kreisbewegung · *Circular motion* – Kurz: Zentripetalkraft als Ursache, z. B. bei Kurvenfahrten; Scheinkräfte. · *EN: Centripetal force as the cause, e.g. when cornering; fictitious forces.* – Simulationen: `kreisbewegung`

### E.4 Weitere Bewegungen
*EN: Further types of motion*

- Kurz (DE): [nicht verbindlich] Schiefer Wurf, Bewegungen mit Reibung und numerische Simulation von Bewegungen.
- Kurz (EN): [optional] Oblique projectile motion, motion with friction and numerical simulation of motion.
- Simulationen: `schiefer-wurf`
- Unterbereiche:
  - E.4.1 schiefer Wurf · *oblique projectile motion* – Kurz: Flugbahnen bei schrägem Abwurf beschreiben. · *EN: Describing trajectories for oblique launch.* – Simulationen: `schiefer-wurf`
  - E.4.2 Reibung · *Friction* – Kurz: Bewegung mit Reibung; freier Fall mit Luftwiderstand und Grenzgeschwindigkeit. · *EN: Motion with friction; free fall with air resistance and terminal velocity.* – Simulationen: –
  - E.4.3 numerische Simulation · *numerical simulation* – Kurz: Bewegungen schrittweise mit Differenzenquotienten (z. B. Tabellenkalkulation) berechnen. · *EN: Calculating motion step by step with difference quotients (e.g. spreadsheet).* – Simulationen: –

### E.5 Gravitation
*EN: Gravitation*

- Kurz (DE): [nicht verbindlich] Gravitationsfeld und Gravitationsgesetz sowie Planetenbewegung mit den Kepler’schen Gesetzen.
- Kurz (EN): [optional] Gravitational field and law of gravitation, planetary motion and Kepler's laws.
- Simulationen: `planetenbahnen`
- Unterbereiche:
  - E.5.1 Massenanziehung · *Mass attraction* – Kurz: Gravitationsfeld, Gravitationsgesetz und Gewichtskraft. · *EN: Gravitational field, law of gravitation and weight.* – Simulationen: –
  - E.5.2 Planetenbewegung · *Planetary motion* – Kurz: Kepler’sche Gesetze und Entwicklung des astronomischen Weltbilds. · *EN: Kepler's laws and the development of the astronomical world view.* – Simulationen: `planetenbahnen`

### E.6 Grundlagen der Thermodynamik
*EN: Foundations of thermodynamics*

- Kurz (DE): [nicht verbindlich] Innere Energie, reversible und irreversible Vorgänge, Hauptsätze der Thermodynamik und Entropie.
- Kurz (EN): [optional] Internal energy, reversible and irreversible processes, laws of thermodynamics and entropy.
- Simulationen: –
- Unterbereiche:
  - E.6.1 Wärmeenergie als innere Energie · *Thermal energy as internal energy* – Kurz: Begriff der inneren Energie und sein historischer Hintergrund. · *EN: Concept of internal energy and its historical background.* – Simulationen: –
  - E.6.2 reversible und irreversible Vorgänge · *reversible and irreversible processes* – Kurz: Umkehrbare und nicht umkehrbare Prozesse unterscheiden. · *EN: Distinguishing reversible and irreversible processes.* – Simulationen: –
  - E.6.3 erster und zweiter Hauptsatz der Thermodynamik · *first and second law of thermodynamics* – Kurz: Energieerhaltung und Richtung von Wärmeprozessen. · *EN: Conservation of energy and the direction of heat processes.* – Simulationen: –
  - E.6.4 Entropieerzeugung und Wirkungsgrad · *Entropy generation and efficiency* – Kurz: Entropie als Maß für die Richtung natürlicher Abläufe; Grenzen des Wirkungsgrads. · *EN: Entropy as a measure of the direction of natural processes; limits of efficiency.* – Simulationen: –

### E.7 Drehbewegungen
*EN: Rotational motion*

- Kurz (DE): [nicht verbindlich] Drehmoment, Drehimpuls als Erhaltungsgröße und Trägheitsmoment an Anwendungsbeispielen.
- Kurz (EN): [optional] Torque, angular momentum as a conserved quantity and moment of inertia with applications.
- Simulationen: `hebelgesetz`
- Unterbereiche:
  - E.7.1 Drehmoment · *Torque* – Kurz: Wirkung von Kräften auf drehbare Körper. · *EN: Effect of forces on rotatable bodies.* – Simulationen: `hebelgesetz`
  - E.7.2 Drehimpuls · *Angular momentum* – Kurz: Drehimpuls als Erhaltungsgröße; Präzession. · *EN: Angular momentum as a conserved quantity; precession.* – Simulationen: –
  - E.7.3 Trägheitsmoment · *Moment of inertia* – Kurz: Anwendungsbeispiele wie die Pirouette. · *EN: Applications such as a pirouette.* – Simulationen: –

## Qualifikationsphase Q1 – „Elektrisches und magnetisches Feld“  
*Qualification phase Q1 – “Electric and magnetic field”*  
Jahrgangsstufe(n) im JSON: 12  
(Quelle: „Kerncurriculum gymnasiale Oberstufe PHYSIK, Ausgabe 2024 (Stand 01.08.2025)“ (Datei kernkurriculum_gymnasiale_oberstufe-physik.pdf), S. 27, 32–35; Internet laut Impressum: https://kultus.hessen.de)

> Kurshalbjahr Q1 „Elektrisches und magnetisches Feld“. Verbindlich: Themenfelder Q1.1 und Q1.2. Die Zuordnung zu Jahrgangsstufe 12 ist eine Annahme (G9-Zählung) – der Lehrplan nennt nur Kurshalbjahre. In der Qualifikationsphase gilt: Unterbereiche ohne Zusatz gehören zum grundlegenden Niveau (Grund- und Leistungskurs), „Nur LK“ markiert das erhöhte Niveau. Nummerierung der Unterbereiche (dritte Stelle) nicht aus dem Lehrplan.

### Q1.1 Elektrisches Feld
*EN: Electric field*

- Kurz (DE): [verbindlich] Feldbegriff, Feldlinienbilder und Feldstärke, Kondensator als Energiespeicher mit Auf- und Entladung, Coulomb-Gesetz und Bewegung geladener Teilchen im Feld.
- Kurz (EN): [mandatory] Field concept, field-line patterns and field strength, capacitor as energy store with charging and discharging, Coulomb's law and motion of charged particles in the field.
- Simulationen: `feldlinien`, `kondensator`
- Unterbereiche:
  - Q1.1.1 Begriff des Feldes am Beispiel von elektrischen Feldern · *Concept of a field using electric fields* – Kurz: Feldlinienbilder (Plattenkondensator, Punktladung, Dipol), Ladungserhaltung und Influenz. · *EN: Field-line patterns (parallel plates, point charge, dipole), charge conservation and induction of charge.* – Simulationen: `feldlinien`
  - Q1.1.2 elektrische Feldstärke · *electric field strength* – Kurz: Feldstärke definieren; radialsymmetrisches Feld; grafische Superposition. · *EN: Defining field strength; radial field; graphical superposition.* – Simulationen: `feldlinien`
  - Q1.1.3 Kondensator als Energiespeicher: elektrisches Feld, Kapazität, elektrische Energie · *Capacitor as energy store: electric field, capacitance, electrical energy* – Kurz: Kapazität, Feldenergie und zeitlicher Verlauf beim Laden und Entladen. · *EN: Capacitance, field energy and time behaviour during charging and discharging.* – Simulationen: `kondensator`
  - Q1.1.4 Coulomb’sches Gesetz · *Coulomb's law* – Kurz: Kraft zwischen Punktladungen. · *EN: Force between point charges.* – Simulationen: –
  - Q1.1.5 Kräfte auf Körper in homogenen elektrischen Feldern, Bahnformen (qualitativ), Energiebetrachtung · *Forces on bodies in uniform electric fields, trajectories (qualitative), energy considerations* – Kurz: Millikan-Versuch, Beschleunigung geladener Teilchen und Ablenkung quer zum Feld. · *EN: Millikan experiment, acceleration of charged particles and deflection across the field.* – Simulationen: –
  - Q1.1.6 Begriff des Feldes am Beispiel von elektrischen Feldern **[nur LK]** · *Concept of a field using electric fields* – Kurz: Nur LK (erhöhtes Niveau): Flächenladungsdichte und quantitative Superposition von Feldern. · *EN: Advanced course only (higher level): Surface charge density and quantitative superposition of fields.* – Simulationen: `feldlinien`
  - Q1.1.7 Kondensator als Energiespeicher: elektrisches Feld, Kapazität, elektrische Energie **[nur LK]** · *Capacitor as energy store: electric field, capacitance, electrical energy* – Kurz: Nur LK (erhöhtes Niveau): Dielektrikum, Herleitungen und Differenzialgleichung der Entladung. · *EN: Advanced course only (higher level): Dielectric, derivations and differential equation of discharge.* – Simulationen: `kondensator`
  - Q1.1.8 Spannung als Potenzialdifferenz **[nur LK]** · *Voltage as potential difference* – Kurz: Nur LK (erhöhtes Niveau): Elektrisches Potenzial und Äquipotenziallinien. · *EN: Advanced course only (higher level): Electric potential and equipotential lines.* – Simulationen: –
  - Q1.1.9 Kräfte auf Körper in homogenen elektrischen Feldern, Bahnformen, Energiebetrachtung **[nur LK]** · *Forces on bodies in uniform electric fields, trajectories, energy considerations* – Kurz: Nur LK (erhöhtes Niveau): Quantitative Ablenkung (Vergleich mit waagerechtem Wurf), Linearbeschleuniger. · *EN: Advanced course only (higher level): Quantitative deflection (comparison with horizontal projectile), linear accelerator.* – Simulationen: –

### Q1.2 Magnetisches Feld
*EN: Magnetic field*

- Kurz (DE): [verbindlich] Magnetische Feldlinienbilder und Flussdichte, Feld einer langen Spule sowie Lorentzkraft und Kreisbahnen geladener Teilchen (Fadenstrahlrohr, e/m).
- Kurz (EN): [mandatory] Magnetic field-line patterns and flux density, field of a long solenoid, and Lorentz force and circular paths of charged particles (fine-beam tube, e/m).
- Simulationen: `lorentzkraft`
- Unterbereiche:
  - Q1.2.1 Begriff des Feldes am Beispiel von magnetischen Feldern · *Concept of a field using magnetic fields* – Kurz: Feldlinien von Dauermagnet, geradem Leiter und Spule. · *EN: Field lines of permanent magnet, straight wire and solenoid.* – Simulationen: –
  - Q1.2.2 magnetische Flussdichte · *magnetic flux density* – Kurz: Flussdichte definieren und im Inneren einer langen Spule bestimmen. · *EN: Defining flux density and determining it inside a long solenoid.* – Simulationen: –
  - Q1.2.3 Kräfte auf Körper in homogenen magnetischen Feldern, Bahnformen (qualitativ) · *Forces on bodies in uniform magnetic fields, trajectories (qualitative)* – Kurz: Lorentzkraft als Zentripetalkraft und Kreisbahn im Fadenstrahlrohr. · *EN: Lorentz force as centripetal force and circular path in the fine-beam tube.* – Simulationen: `lorentzkraft`
  - Q1.2.4 quantitative Betrachtung von Bahnformen in homogenen Feldern **[nur LK]** · *quantitative treatment of trajectories in uniform fields* – Kurz: Nur LK (erhöhtes Niveau): Gekreuzte Felder und Geschwindigkeitsfilter. · *EN: Advanced course only (higher level): Crossed fields and velocity filter.* – Simulationen: `lorentzkraft`
  - Q1.2.5 Hall-Effekt **[nur LK]** · *Hall effect* – Kurz: Nur LK (erhöhtes Niveau): Spannung quer zum Strom im Magnetfeld erklären. · *EN: Advanced course only (higher level): Explaining the voltage across a conductor in a magnetic field.* – Simulationen: –
  - Q1.2.6 Teilchenbeschleuniger **[nur LK]** · *Particle accelerators* – Kurz: Nur LK (erhöhtes Niveau): Funktionsprinzip z. B. von Zyklotron und Synchrotron. · *EN: Advanced course only (higher level): Working principle of e.g. cyclotron and synchrotron.* – Simulationen: –

## Qualifikationsphase Q2 – „Schwingungen, Induktion und mechanische Wellen“  
*Qualification phase Q2 – “Oscillations, induction and mechanical waves”*  
Jahrgangsstufe(n) im JSON: 12  
(Quelle: „Kerncurriculum gymnasiale Oberstufe PHYSIK, Ausgabe 2024 (Stand 01.08.2025)“ (Datei kernkurriculum_gymnasiale_oberstufe-physik.pdf), S. 27, 36–39; Internet laut Impressum: https://kultus.hessen.de)

> Kurshalbjahr Q2 „Schwingungen, Induktion und mechanische Wellen“. Verbindlich: Themenfelder Q2.1–Q2.3. Die Zuordnung zu Jahrgangsstufe 12 ist eine Annahme (G9-Zählung) – der Lehrplan nennt nur Kurshalbjahre. In der Qualifikationsphase gilt: Unterbereiche ohne Zusatz gehören zum grundlegenden Niveau (Grund- und Leistungskurs), „Nur LK“ markiert das erhöhte Niveau. Nummerierung der Unterbereiche (dritte Stelle) nicht aus dem Lehrplan.

### Q2.1 Mechanische Schwingungen
*EN: Mechanical oscillations*

- Kurz (DE): [verbindlich] Harmonische Schwingungen am Feder- und Fadenpendel mit ihren Kenngrößen, Schwingungsgleichung, Energieumwandlung und Dämpfung; im LK erzwungene Schwingungen und Resonanz.
- Kurz (EN): [mandatory] Harmonic oscillations of spring and simple pendulums with their parameters, equation of motion, energy conversion and damping; in the advanced course forced oscillations and resonance.
- Simulationen: `federpendel`, `fadenpendel`, `resonanz`
- Unterbereiche:
  - Q2.1.1 mechanische harmonische Schwingungen: charakteristische Größen und ihre Zusammenhänge · *mechanical harmonic oscillations: characteristic quantities and their relationships* – Kurz: Elongation, Amplitude, Periodendauer, Frequenz und Energie (qualitativ). · *EN: Displacement, amplitude, period, frequency and energy (qualitative).* – Simulationen: `federpendel`, `fadenpendel`
  - Q2.1.2 zeitlicher Verlauf einer harmonischen Schwingung · *time course of a harmonic oscillation* – Kurz: Lineare Rückstellkraft, Periodendauer von Feder- und Fadenpendel, Schwingungsgleichung. · *EN: Linear restoring force, period of spring and simple pendulum, equation of motion.* – Simulationen: `federpendel`, `fadenpendel`
  - Q2.1.3 gedämpfte mechanische Schwingungen · *damped mechanical oscillations* – Kurz: Abnahme der Amplitude qualitativ beschreiben. · *EN: Describing the decrease in amplitude qualitatively.* – Simulationen: –
  - Q2.1.4 zeitlicher Verlauf einer harmonischen Schwingung **[nur LK]** · *time course of a harmonic oscillation* – Kurz: Nur LK (erhöhtes Niveau): Differenzialgleichung der ungedämpften Schwingung mit Lösungsansatz. · *EN: Advanced course only (higher level): Differential equation of undamped oscillation with trial solution.* – Simulationen: `federpendel`
  - Q2.1.5 gedämpfte Schwingungen **[nur LK]** · *damped oscillations* – Kurz: Nur LK (erhöhtes Niveau): Dämpfungsverläufe (ohne Herleitung) beschreiben. · *EN: Advanced course only (higher level): Describing damping behaviour (without derivation).* – Simulationen: –
  - Q2.1.6 erzwungene Schwingungen **[nur LK]** · *forced oscillations* – Kurz: Nur LK (erhöhtes Niveau): Eigenfrequenz, Resonanz, Resonanzkurven und Resonanzkatastrophe. · *EN: Advanced course only (higher level): Natural frequency, resonance, resonance curves and resonance disaster.* – Simulationen: `resonanz`

### Q2.2 Induktion und elektromagnetische Schwingungen
*EN: Induction and electromagnetic oscillations*

- Kurz (DE): [verbindlich] Induktion durch Änderung des magnetischen Flusses, Lenz’sche Regel, Selbstinduktion und der elektromagnetische Schwingkreis.
- Kurz (EN): [mandatory] Induction through change of magnetic flux, Lenz's law, self-induction and the electromagnetic oscillating circuit.
- Simulationen: `induktion`, `resonanz`
- Unterbereiche:
  - Q2.2.1 Induktion aufgrund einer zeitlichen Änderung des magnetischen Flusses · *Induction due to a change of magnetic flux over time* – Kurz: Magnetischer Fluss und Induktionsgesetz mit mittlerer Änderungsrate. · *EN: Magnetic flux and law of induction with average rate of change.* – Simulationen: `induktion`
  - Q2.2.2 Zusammenhang zwischen der Richtung des Induktionsstroms und seiner Wirkung (Lenz’sche Regel) · *Relationship between the direction of the induced current and its effect (Lenz's law)* – Kurz: Richtung des Induktionsstroms begründen. · *EN: Justifying the direction of the induced current.* – Simulationen: `induktion`
  - Q2.2.3 Selbstinduktion und Induktivität einer langen Spule (phänomenologisch) · *Self-induction and inductance of a long solenoid (phenomenological)* – Kurz: Selbstinduktion an Spulen beobachten und beschreiben. · *EN: Observing and describing self-induction in coils.* – Simulationen: –
  - Q2.2.4 Beispiel für eine technische Anwendung der Induktion · *Example of a technical application of induction* – Kurz: Z. B. Generator oder Transformator erklären. · *EN: Explaining e.g. a generator or transformer.* – Simulationen: –
  - Q2.2.5 elektromagnetische harmonische Schwingungen · *electromagnetic harmonic oscillations* – Kurz: Schwingkreis: Kenngrößen, Energieumwandlung, Thomson’sche Gleichung. · *EN: LC circuit: parameters, energy conversion, Thomson's formula.* – Simulationen: –
  - Q2.2.6 Induktion aufgrund einer zeitlichen Änderung des magnetischen Flusses **[nur LK]** · *Induction due to a change of magnetic flux over time* – Kurz: Nur LK (erhöhtes Niveau): Induktionsgesetz in differenzieller Form, auch nichtlineare Fälle. · *EN: Advanced course only (higher level): Law of induction in differential form, including non-linear cases.* – Simulationen: `induktion`
  - Q2.2.7 Selbstinduktion und Induktivität **[nur LK]** · *Self-induction and inductance* – Kurz: Nur LK (erhöhtes Niveau): Ein- und Ausschaltvorgänge, Definition der Induktivität. · *EN: Advanced course only (higher level): Switch-on and switch-off processes, definition of inductance.* – Simulationen: –
  - Q2.2.8 Energie des Feldes einer stromdurchflossenen Spule **[nur LK]** · *Energy of the field of a current-carrying coil* – Kurz: Nur LK (erhöhtes Niveau): Magnetische Feldenergie (ohne Herleitung). · *EN: Advanced course only (higher level): Magnetic field energy (without derivation).* – Simulationen: –
  - Q2.2.9 Vergleich von mechanischen und elektromagnetischen Schwingungen unter energetischen Aspekten **[nur LK]** · *Comparison of mechanical and electromagnetic oscillations in terms of energy* – Kurz: Nur LK (erhöhtes Niveau): Analogien zwischen Pendel und Schwingkreis. · *EN: Advanced course only (higher level): Analogies between pendulum and LC circuit.* – Simulationen: –
  - Q2.2.10 gedämpfte Schwingungen **[nur LK]** · *damped oscillations* – Kurz: Nur LK (erhöhtes Niveau): Dämpfung im Schwingkreis. · *EN: Advanced course only (higher level): Damping in the LC circuit.* – Simulationen: –
  - Q2.2.11 erzwungene Schwingungen, Resonanz (qualitativ) **[nur LK]** · *forced oscillations, resonance (qualitative)* – Kurz: Nur LK (erhöhtes Niveau): Resonanz im elektromagnetischen Schwingkreis. · *EN: Advanced course only (higher level): Resonance in the electromagnetic circuit.* – Simulationen: `resonanz`

### Q2.3 Mechanische Wellen
*EN: Mechanical waves*

- Kurz (DE): [verbindlich] Entstehung und Kenngrößen harmonischer Wellen, Longitudinal- und Transversalwellen, typische Wellenphänomene, Interferenz und stehende Wellen.
- Kurz (EN): [mandatory] Formation and parameters of harmonic waves, longitudinal and transverse waves, typical wave phenomena, interference and standing waves.
- Simulationen: `wellen-ausbreitung`, `interferenz`, `stehende-wellen`
- Unterbereiche:
  - Q2.3.1 harmonische Wellen: charakteristische Größen und ihre Zusammenhänge · *harmonic waves: characteristic quantities and their relationships* – Kurz: Erzeugung, Ausbreitung, Wellenlänge, Frequenz und c = λ·f. · *EN: Generation, propagation, wavelength, frequency and c = λ·f.* – Simulationen: `wellen-ausbreitung`
  - Q2.3.2 Definition einer harmonischen Welle als räumlich und zeitlich periodischer Vorgang · *Definition of a harmonic wave as a process periodic in space and time* – Kurz: Darstellung im t-y- und x-y-Diagramm, Longitudinal- und Transversalwellen, Polarisation. · *EN: Representation in t-y and x-y diagrams, longitudinal and transverse waves, polarisation.* – Simulationen: `wellen-ausbreitung`
  - Q2.3.3 Brechung, Reflexion, Beugung als charakteristische Wellenphänomene · *Refraction, reflection, diffraction as characteristic wave phenomena* – Kurz: Wellenphänomene z. B. in der Wellenwanne; Huygens’sches Prinzip. · *EN: Wave phenomena e.g. in a ripple tank; Huygens' principle.* – Simulationen: –
  - Q2.3.4 Überlagerung von Wellen · *Superposition of waves* – Kurz: Interferenz zweier Erreger, Gangunterschied, Lage von Maxima und Minima. · *EN: Interference of two sources, path difference, positions of maxima and minima.* – Simulationen: `interferenz`
  - Q2.3.5 stehende Wellen · *standing waves* – Kurz: Eindimensionale stehende Wellen und Wellenlängenbestimmung. · *EN: One-dimensional standing waves and determining the wavelength.* – Simulationen: `stehende-wellen`
  - Q2.3.6 harmonische Wellen: charakteristische Größen und ihre Zusammenhänge **[nur LK]** · *harmonic waves: characteristic quantities and their relationships* – Kurz: Nur LK (erhöhtes Niveau): Wellengleichung für die räumliche und zeitliche Entwicklung. · *EN: Advanced course only (higher level): Wave equation for development in space and time.* – Simulationen: `wellen-ausbreitung`
  - Q2.3.7 Behandlung des Phasensprungs bei Reflexion, festes und loses Ende bei stehenden Wellen **[nur LK]** · *Phase jump on reflection, fixed and free end for standing waves* – Kurz: Nur LK (erhöhtes Niveau): Reflexion am festen und losen Ende. · *EN: Advanced course only (higher level): Reflection at fixed and free ends.* – Simulationen: `stehende-wellen`

## Qualifikationsphase Q3 – „Elektromagnetische Wellen und Quantenphysik“  
*Qualification phase Q3 – “Electromagnetic waves and quantum physics”*  
Jahrgangsstufe(n) im JSON: 13  
(Quelle: „Kerncurriculum gymnasiale Oberstufe PHYSIK, Ausgabe 2024 (Stand 01.08.2025)“ (Datei kernkurriculum_gymnasiale_oberstufe-physik.pdf), S. 28, 40–42; Internet laut Impressum: https://kultus.hessen.de)

> Kurshalbjahr Q3 „Elektromagnetische Wellen und Quantenphysik“. Verbindlich: Themenfelder Q3.1–Q3.3. Die Zuordnung zu Jahrgangsstufe 13 ist eine Annahme (G9-Zählung) – der Lehrplan nennt nur Kurshalbjahre. In der Qualifikationsphase gilt: Unterbereiche ohne Zusatz gehören zum grundlegenden Niveau (Grund- und Leistungskurs), „Nur LK“ markiert das erhöhte Niveau. Nummerierung der Unterbereiche (dritte Stelle) nicht aus dem Lehrplan.

### Q3.1 Elektromagnetische Wellen
*EN: Electromagnetic waves*

- Kurz (DE): [verbindlich] Spektrum elektromagnetischer Wellen, Polarisation und Totalreflexion, Interferenz am Doppelspalt und Gitter sowie stehende elektromagnetische Wellen.
- Kurz (EN): [mandatory] Spectrum of electromagnetic waves, polarisation and total internal reflection, interference at double slit and grating, and standing electromagnetic waves.
- Simulationen: `brechung`, `doppelspalt`
- Unterbereiche:
  - Q3.1.1 Spektrum elektromagnetischer Wellen · *Spectrum of electromagnetic waves* – Kurz: Frequenzbereiche und technische Anwendungen im Überblick. · *EN: Overview of frequency ranges and technical applications.* – Simulationen: –
  - Q3.1.2 charakteristische Wellenphänomene · *characteristic wave phenomena* – Kurz: Lineare Polarisation von Licht und Totalreflexion (Glasfaser). · *EN: Linear polarisation of light and total internal reflection (optical fibre).* – Simulationen: `brechung`
  - Q3.1.3 Überlagerung von elektromagnetischen Wellen · *Superposition of electromagnetic waves* – Kurz: Doppelspalt und Gitter, Wellenlängenbestimmung, Spektren, stehende Wellen. · *EN: Double slit and grating, wavelength measurement, spectra, standing waves.* – Simulationen: `doppelspalt`
  - Q3.1.4 Brechung, Reflexion, Beugung bei elektromagnetischen Wellen **[nur LK]** · *Refraction, reflection, diffraction of electromagnetic waves* – Kurz: Nur LK (erhöhtes Niveau): Brechungsgesetz mit Wellenmodell. · *EN: Advanced course only (higher level): Law of refraction with the wave model.* – Simulationen: `brechung`
  - Q3.1.5 Überlagerung von elektromagnetischen Wellen **[nur LK]** · *Superposition of electromagnetic waves* – Kurz: Nur LK (erhöhtes Niveau): Einzelspalt und Interferometer. · *EN: Advanced course only (higher level): Single slit and interferometer.* – Simulationen: –

### Q3.2 Welle-Teilchen-Dualismus
*EN: Wave–particle duality*

- Kurz (DE): [verbindlich] Fotoeffekt und Photonenenergie, Energie-Masse-Äquivalenz und De-Broglie-Wellen; im LK Elektronenbeugung und Compton-Effekt.
- Kurz (EN): [mandatory] Photoelectric effect and photon energy, mass–energy equivalence and de Broglie waves; in the advanced course electron diffraction and the Compton effect.
- Simulationen: `photoeffekt`, `elektronenbeugung`
- Unterbereiche:
  - Q3.2.1 Zusammenhänge der Größen Energie, Impuls, Frequenz und Wellenlänge zur Beschreibung von Quantenobjekten · *Relationships between energy, momentum, frequency and wavelength for describing quantum objects* – Kurz: Fotoeffekt mit Gegenfeldmethode, Planck’sches Wirkungsquantum, Photonenimpuls, De-Broglie-Gleichung. · *EN: Photoelectric effect with counter-field method, Planck's constant, photon momentum, de Broglie equation.* – Simulationen: `photoeffekt`, `elektronenbeugung`
  - Q3.2.2 Elektronenbeugung an Kristallen, Bragg-Bedingung **[nur LK]** · *Electron diffraction by crystals, Bragg condition* – Kurz: Nur LK (erhöhtes Niveau): Beugungsbilder von Elektronen deuten. · *EN: Advanced course only (higher level): Interpreting electron diffraction patterns.* – Simulationen: `elektronenbeugung`
  - Q3.2.3 Compton-Effekt **[nur LK]** · *Compton effect* – Kurz: Nur LK (erhöhtes Niveau): Streuung von Photonen an Elektronen. · *EN: Advanced course only (higher level): Scattering of photons by electrons.* – Simulationen: –

### Q3.3 Atomvorstellungen
*EN: Models of the atom*

- Kurz (DE): [verbindlich] Bohr’sches Atommodell, Energieniveaus des Wasserstoffatoms, Franck-Hertz-Versuch, Emission und Absorption sowie Linienspektren.
- Kurz (EN): [mandatory] Bohr model, energy levels of hydrogen, Franck–Hertz experiment, emission and absorption, and line spectra.
- Simulationen: `linienspektren`
- Unterbereiche:
  - Q3.3.1 Quantisierung · *Quantisation* – Kurz: Bohr’sche Postulate, Energieniveaus von Wasserstoff und Franck-Hertz-Versuch. · *EN: Bohr's postulates, energy levels of hydrogen and Franck–Hertz experiment.* – Simulationen: `linienspektren`
  - Q3.3.2 Emission und Absorption, Zusammenhang zwischen diskretem Spektrum und Energieniveauschema · *Emission and absorption, relationship between discrete spectrum and energy-level diagram* – Kurz: Linienspektren im Energieniveauschema deuten; Rydberg-Formel. · *EN: Interpreting line spectra in the energy-level diagram; Rydberg formula.* – Simulationen: `linienspektren`
  - Q3.3.3 Quantisierung **[nur LK]** · *Quantisation* – Kurz: Nur LK (erhöhtes Niveau): Wasserstoffähnliche Atome, Ausblick auf Mehrelektronensysteme und Pauli-Prinzip. · *EN: Advanced course only (higher level): Hydrogen-like atoms, outlook on multi-electron systems and the Pauli principle.* – Simulationen: `linienspektren`
  - Q3.3.4 Röntgenstrahlung **[nur LK]** · *X-rays* – Kurz: Nur LK (erhöhtes Niveau): Kontinuierliches und charakteristisches Röntgenspektrum, Röntgenröhre, Moseley-Gesetz. · *EN: Advanced course only (higher level): Continuous and characteristic X-ray spectrum, X-ray tube, Moseley's law.* – Simulationen: –

## Qualifikationsphase Q4 – „Struktur von Materie, Raum und Zeit“  
*Qualification phase Q4 – “Structure of matter, space and time”*  
Jahrgangsstufe(n) im JSON: 13  
(Quelle: „Kerncurriculum gymnasiale Oberstufe PHYSIK, Ausgabe 2024 (Stand 01.08.2025)“ (Datei kernkurriculum_gymnasiale_oberstufe-physik.pdf), S. 28, 43–47; Internet laut Impressum: https://kultus.hessen.de)

> Kurshalbjahr Q4 „Struktur von Materie, Raum und Zeit“. Verbindlich: Themenfeld Q4.1; Q4.2–Q4.6 sind nicht verbindlich. Die Zuordnung zu Jahrgangsstufe 13 ist eine Annahme (G9-Zählung) – der Lehrplan nennt nur Kurshalbjahre. In der Qualifikationsphase gilt: Unterbereiche ohne Zusatz gehören zum grundlegenden Niveau (Grund- und Leistungskurs), „Nur LK“ markiert das erhöhte Niveau. Nummerierung der Unterbereiche (dritte Stelle) nicht aus dem Lehrplan.

### Q4.1 Quantenobjekte
*EN: Quantum objects*

- Kurz (DE): [verbindlich] Quantenmechanisches Atommodell (Orbitale, Potenzialtopf), Grundaspekte der Quantentheorie am Doppelspalt mit Einzelquanten und quantenphysikalisches Weltbild.
- Kurz (EN): [mandatory] Quantum-mechanical atomic model (orbitals, potential well), basic aspects of quantum theory using the double slit with single quanta, and the quantum world view.
- Simulationen: –
- Unterbereiche:
  - Q4.1.1 qualitative Betrachtung eines quantenmechanischen Atommodells · *qualitative treatment of a quantum-mechanical atomic model* – Kurz: Orbitale als Aufenthaltswahrscheinlichkeit; Elektron als stehende Welle im Potenzialtopf. · *EN: Orbitals as probability of presence; electron as standing wave in a potential well.* – Simulationen: –
  - Q4.1.2 grundlegende Aspekte der Quantentheorie: stochastische Vorhersagbarkeit, Interferenz und Superposition, Determiniertheit der Zufallsverteilung, Komplementarität · *basic aspects of quantum theory: stochastic predictability, interference and superposition, determinacy of the random distribution, complementarity* – Kurz: Doppelspalt mit einzelnen Elektronen und Photonen; Weginformation vs. Interferenz. · *EN: Double slit with single electrons and photons; which-path information vs. interference.* – Simulationen: –
  - Q4.1.3 quantenphysikalisches Weltbild hinsichtlich der Begriffe Realität, Lokalität, Kausalität, Determinismus · *quantum world view regarding reality, locality, causality, determinism* – Kurz: Grenzen klassischer Begriffe in der Quantenphysik diskutieren. · *EN: Discussing the limits of classical concepts in quantum physics.* – Simulationen: –
  - Q4.1.4 quantitative Betrachtung eines quantenmechanischen Atommodells **[nur LK]** · *quantitative treatment of a quantum-mechanical atomic model* – Kurz: Nur LK (erhöhtes Niveau): Energiewerte und Wellenfunktionen im unendlich tiefen Potenzialtopf. · *EN: Advanced course only (higher level): Energy values and wave functions in the infinitely deep potential well.* – Simulationen: –
  - Q4.1.5 stochastische Deutung mittels des Quadrats der quantenmechanischen Wellenfunktion (qualitativ) **[nur LK]** · *stochastic interpretation via the square of the wave function (qualitative)* – Kurz: Nur LK (erhöhtes Niveau): Betragsquadrat als Wahrscheinlichkeitsmaß; Delayed-choice-Experiment. · *EN: Advanced course only (higher level): Squared magnitude as probability measure; delayed-choice experiment.* – Simulationen: –
  - Q4.1.6 Orts-Impuls-Unbestimmtheit **[nur LK]** · *Position–momentum uncertainty* – Kurz: Nur LK (erhöhtes Niveau): Ort und Impuls können nicht gleichzeitig scharf sein. · *EN: Advanced course only (higher level): Position and momentum cannot both be sharply defined.* – Simulationen: –
  - Q4.1.7 Koinzidenzmethode zum Nachweis einzelner Photonen anhand eines Beispiels **[nur LK]** · *Coincidence method for detecting single photons using an example* – Kurz: Nur LK (erhöhtes Niveau): Unteilbarkeit von Photonen, z. B. am Mach-Zehnder-Interferometer. · *EN: Advanced course only (higher level): Indivisibility of photons, e.g. with a Mach–Zehnder interferometer.* – Simulationen: –

### Q4.2 Technische Anwendungen der Quantenphysik
*EN: Technical applications of quantum physics*

- Kurz (DE): [nicht verbindlich] Funktionsweise des Lasers; im LK Tunneleffekt und Rastertunnelmikroskop.
- Kurz (EN): [optional] How lasers work; in the advanced course tunnelling and the scanning tunnelling microscope.
- Simulationen: –
- Unterbereiche:
  - Q4.2.1 Laser · *Laser* – Kurz: Metastabile Niveaus, Besetzungsinversion, stimulierte Emission, Aufbau und Anwendungen. · *EN: Metastable levels, population inversion, stimulated emission, design and applications.* – Simulationen: –
  - Q4.2.2 Rastertunnelmikroskop **[nur LK]** · *Scanning tunnelling microscope* – Kurz: Nur LK (erhöhtes Niveau): Tunneleffekt sowie Aufbau und Anwendungen. · *EN: Advanced course only (higher level): Tunnelling effect, design and applications.* – Simulationen: –

### Q4.3 Kernphysik
*EN: Nuclear physics*

- Kurz (DE): [nicht verbindlich] Radioaktive Strahlung, Zerfallsgesetz und Halbwertszeit, Bindungsenergie, Kernspaltung und -fusion.
- Kurz (EN): [optional] Radioactive radiation, decay law and half-life, binding energy, nuclear fission and fusion.
- Simulationen: `radioaktiver-zerfall`
- Unterbereiche:
  - Q4.3.1 radioaktive Strahlung · *radioactive radiation* – Kurz: Strahlungsarten, Nachweis, Wirkung, Anwendungen und Gefahren. · *EN: Types of radiation, detection, effects, applications and dangers.* – Simulationen: –
  - Q4.3.2 Zerfallsgesetze · *Laws of decay* – Kurz: Aktivität, Halbwertszeit, Zerfallskonstante, C14-Methode. · *EN: Activity, half-life, decay constant, carbon-14 dating.* – Simulationen: `radioaktiver-zerfall`
  - Q4.3.3 Bindungsenergie · *Binding energy* – Kurz: Massendefekt, Bindungsenergie pro Nukleon, Kernreaktionen. · *EN: Mass defect, binding energy per nucleon, nuclear reactions.* – Simulationen: –
  - Q4.3.4 Zerfallsgesetze **[nur LK]** · *Laws of decay* – Kurz: Nur LK (erhöhtes Niveau): Zerfallsreihen. · *EN: Advanced course only (higher level): Decay chains.* – Simulationen: `radioaktiver-zerfall`
  - Q4.3.5 Potenzialtopfmodell für Kerne (nur qualitativ) **[nur LK]** · *Potential-well model for nuclei (qualitative only)* – Kurz: Nur LK (erhöhtes Niveau): Getrennte Töpfe für Protonen und Neutronen; Alpha-Zerfall durch Tunneln. · *EN: Advanced course only (higher level): Separate wells for protons and neutrons; alpha decay by tunnelling.* – Simulationen: –

### Q4.4 Spezielle Relativitätstheorie
*EN: Special relativity*

- Kurz (DE): [nicht verbindlich] Relativitätspostulate, Zeitdilatation und Längenkontraktion mit Minkowski-Diagrammen sowie relativistische Massenzunahme.
- Kurz (EN): [optional] Postulates of relativity, time dilation and length contraction with Minkowski diagrams, and relativistic mass increase.
- Simulationen: –
- Unterbereiche:
  - Q4.4.1 Relativitätspostulate · *Postulates of relativity* – Kurz: Relativitätsprinzip, Konstanz von c, Zeitdilatation, Längenkontraktion, Minkowski-Diagramme. · *EN: Principle of relativity, constancy of c, time dilation, length contraction, Minkowski diagrams.* – Simulationen: –
  - Q4.4.2 relativistische Massenzunahme (nur phänomenologisch) · *relativistic mass increase (phenomenological only)* – Kurz: Phänomen der Massenzunahme bei hohen Geschwindigkeiten. · *EN: The phenomenon of mass increase at high speeds.* – Simulationen: –
  - Q4.4.3 Lorentztransformation und Addition von Geschwindigkeiten **[nur LK]** · *Lorentz transformation and addition of velocities* – Kurz: Nur LK (erhöhtes Niveau): Umrechnung zwischen bewegten Bezugssystemen. · *EN: Advanced course only (higher level): Transforming between moving reference frames.* – Simulationen: –
  - Q4.4.4 Herleitung der relativistischen Massenzunahme **[nur LK]** · *Derivation of the relativistic mass increase* – Kurz: Nur LK (erhöhtes Niveau): Massenzunahme aus Grundprinzipien ableiten. · *EN: Advanced course only (higher level): Deriving the mass increase from basic principles.* – Simulationen: –

### Q4.5 Festkörperphysik
*EN: Solid-state physics*

- Kurz (DE): [nicht verbindlich] Leiter, Halbleiter und Isolatoren im Bändermodell, Dotierung, Diode und Transistor.
- Kurz (EN): [optional] Conductors, semiconductors and insulators in the band model, doping, diode and transistor.
- Simulationen: –
- Unterbereiche:
  - Q4.5.1 Leiter, Nichtleiter und Halbleiter · *Conductors, non-conductors and semiconductors* – Kurz: Bändermodell (qualitativ) und Dotierung. · *EN: Band model (qualitative) and doping.* – Simulationen: –
  - Q4.5.2 Diode und Transistor · *Diode and transistor* – Kurz: p-n-Übergang, Kennlinie, Gleichrichter, Transistor als Schalter. · *EN: p-n junction, characteristic curve, rectifier, transistor as switch.* – Simulationen: –
  - Q4.5.3 quantenphysikalische Erklärung der Energiebänder **[nur LK]** · *quantum explanation of energy bands* – Kurz: Nur LK (erhöhtes Niveau): Fermienergie (qualitativ). · *EN: Advanced course only (higher level): Fermi energy (qualitative).* – Simulationen: –
  - Q4.5.4 Verstärkerschaltung **[nur LK]** · *Amplifier circuit* – Kurz: Nur LK (erhöhtes Niveau): Transistor als Verstärker im Experiment. · *EN: Advanced course only (higher level): Transistor as amplifier in experiment.* – Simulationen: –
  - Q4.5.5 Supraleitung (nur qualitativ) **[nur LK]** · *Superconductivity (qualitative only)* – Kurz: Nur LK (erhöhtes Niveau): Phänomen der Supraleitung. · *EN: Advanced course only (higher level): The phenomenon of superconductivity.* – Simulationen: –

### Q4.6 Astrophysik
*EN: Astrophysics*

- Kurz (DE): [nicht verbindlich] Sonnensystem und Himmelsmechanik, Kosmologie mit Rotverschiebung und Urknall sowie Struktur des Universums; im LK Energie der Sonne und Sternentwicklung.
- Kurz (EN): [optional] Solar system and celestial mechanics, cosmology with redshift and Big Bang, and the structure of the universe; in the advanced course the Sun's energy and stellar evolution.
- Simulationen: `planetenbahnen`
- Unterbereiche:
  - Q4.6.1 unser Sonnensystem · *our solar system* – Kurz: Sonne, Planeten, Kometen, Gravitationsgesetz, Kepler’sche Gesetze, Gezeiten. · *EN: Sun, planets, comets, law of gravitation, Kepler's laws, tides.* – Simulationen: `planetenbahnen`
  - Q4.6.2 Kosmologie · *Cosmology* – Kurz: Galaxien, Rotverschiebung und Urknall. · *EN: Galaxies, redshift and Big Bang.* – Simulationen: –
  - Q4.6.3 Struktur des Universums · *Structure of the universe* – Kurz: Größe und Alter, Hintergrundstrahlung, dunkle Materie und Energie. · *EN: Size and age, background radiation, dark matter and energy.* – Simulationen: –
  - Q4.6.4 Energieumwandlung in der Sonne **[nur LK]** · *Energy conversion in the Sun* – Kurz: Nur LK (erhöhtes Niveau): Proton-Proton-Reaktion und weitere Fusionsprozesse. · *EN: Advanced course only (higher level): Proton–proton chain and other fusion processes.* – Simulationen: –
  - Q4.6.5 Sterntypen, Sternentstehung und -entwicklung **[nur LK]** · *Star types, star formation and evolution* – Kurz: Nur LK (erhöhtes Niveau): Hauptreihensterne und Lebenszyklus eines Sterns. · *EN: Advanced course only (higher level): Main-sequence stars and the life cycle of a star.* – Simulationen: –

# Teil C – JSON

Die vollständige JSON-Datei liegt separat bei: `hessen-gymnasium-physik.json` (validiert, nur IDs aus der Liste).

# Teil D – Lücken und Vorschläge

## D.1 Lernbereiche ohne passende Simulation

- **Stufe 1:** 1 Haus der Naturwissenschaften; 3 Energie in Umwelt und Technik; 7 Technik im Dienst des Menschen; 8 Zukunftssichere Energieversorgung; 9 Physik in der Verantwortung
- **Stufe 2:** 1 Haus der Naturwissenschaften
- **E1/E2:** E.6 Grundlagen der Thermodynamik
- **Q4:** Q4.1 Quantenobjekte; Q4.2 Technische Anwendungen der Quantenphysik; Q4.4 Spezielle Relativitätstheorie; Q4.5 Festkörperphysik

## D.2 Unterbereiche ohne passende Simulation (in Lernbereichen, die sonst abgedeckt sind)

- **Stufe 1:** 2.1 Wahrnehmung der Umgebung mit den Sinnesorganen; 2.2 Sender-Empfänger-Modell; 2.5 Astronomische Phänomene durch Konstellationen von Sonne-Erde-Mond; 4.3 Gefahren beim Umgang mit Elektrizität im Alltag; 5.4 Stoffe bei Temperaturänderung; 5.5 Anomalie des Wassers und seine Bedeutung für das irdische Leben; 5.6 Druck als „Gepresstsein“ der Materie
- **Stufe 2:** 2.1 Schall, Licht und ihre Ausbreitung; 4.3 elektrostatische Phänomene; 5.1 Übertragung thermischer Energie; 5.3 Druck- und Temperaturunterschiede; 6.1 Wechselwirkung von Körpern; 6.2 Trägheit eines Körpers; 6.4 Menschliche und technische Leistungen und deren Vergleich; 7.2 Phänomen Auftrieb; 7.3 Magnetische Wirkung des elektrischen Stroms; 8.2 Großenergieanlagen; 8.3 Speicherung und Transport von Energie; 8.4 Energieversorgungsnetze; 9.2 Auswirkungen verschiedener Strahlungsarten; 9.3 Konsequenzen der Nutzung physikalischer Forschungsergebnisse
- **E1/E2:** E.1.5 Idealisierung; E.2.1 die drei Newton’schen Axiome; E.4.2 Reibung; E.4.3 numerische Simulation; E.5.1 Massenanziehung; E.7.2 Drehimpuls; E.7.3 Trägheitsmoment
- **Q1:** Q1.1.4 Coulomb’sches Gesetz; Q1.1.5 Kräfte auf Körper in homogenen elektrischen Feldern, Bahnformen (qualitativ), Energiebetrachtung; Q1.1.8 Spannung als Potenzialdifferenz; Q1.1.9 Kräfte auf Körper in homogenen elektrischen Feldern, Bahnformen, Energiebetrachtung; Q1.2.1 Begriff des Feldes am Beispiel von magnetischen Feldern; Q1.2.2 magnetische Flussdichte; Q1.2.5 Hall-Effekt; Q1.2.6 Teilchenbeschleuniger
- **Q2:** Q2.1.3 gedämpfte mechanische Schwingungen; Q2.1.5 gedämpfte Schwingungen; Q2.2.3 Selbstinduktion und Induktivität einer langen Spule (phänomenologisch); Q2.2.4 Beispiel für eine technische Anwendung der Induktion; Q2.2.5 elektromagnetische harmonische Schwingungen; Q2.2.7 Selbstinduktion und Induktivität; Q2.2.8 Energie des Feldes einer stromdurchflossenen Spule; Q2.2.9 Vergleich von mechanischen und elektromagnetischen Schwingungen unter energetischen Aspekten; Q2.2.10 gedämpfte Schwingungen; Q2.3.3 Brechung, Reflexion, Beugung als charakteristische Wellenphänomene
- **Q3:** Q3.1.1 Spektrum elektromagnetischer Wellen; Q3.1.5 Überlagerung von elektromagnetischen Wellen; Q3.2.3 Compton-Effekt; Q3.3.4 Röntgenstrahlung
- **Q4:** Q4.3.1 radioaktive Strahlung; Q4.3.3 Bindungsenergie; Q4.3.5 Potenzialtopfmodell für Kerne (nur qualitativ); Q4.6.2 Kosmologie; Q4.6.3 Struktur des Universums; Q4.6.4 Energieumwandlung in der Sonne; Q4.6.5 Sterntypen, Sternentstehung und -entwicklung

## D.3 Vorschläge für neue Simulationen

| Vorschlag (Titel) | Idee | schließt Lücke in |
|---|---|---|
| Mess-Labor: Messen und Messfehler | Größen virtuell messen, Messreihen aufnehmen und den Einfluss von Messfehlern auf das Ergebnis untersuchen. | Stufe 1/2: 1 |
| Sehen und Hören: Sender–Empfänger | Lichtstrahlen bzw. Schallwellen von der Quelle zum Auge/Ohr verfolgen; Reflexion an Gegenständen sichtbar machen. | Stufe 1: 2.1, 2.2 |
| Mondphasen und Finsternisse | Sonne, Erde und Mond im Modell bewegen und Mondphasen, Sonnen- und Mondfinsternis aus Sicht der Erde sehen. | Stufe 1: 2.5 |
| Schallausbreitung und Schallgeschwindigkeit | Laufzeitmessung mit Echo oder zwei Mikrofonen; Vergleich mit Licht. | Stufe 2: 2.1 |
| Energieflussdiagramme | Energieketten (z. B. Wasserkocher, Fahrrad) zusammenbauen und Entwertung als Pfeil in die Umgebung zeigen. | Stufe 1: 3 |
| Elektrische Sicherheit | Fehlerfälle im Haushalt (Kurzschluss, defektes Gerät) durchspielen und Schutzmaßnahmen auslösen. | Stufe 1: 4.3 |
| Elektrostatik: Ladungen trennen | Körper reiben, aufladen und Anziehung/Abstoßung beobachten. | Stufe 2: 4.3 |
| Wärmeausdehnung und Anomalie des Wassers | Volumen verschiedener Stoffe bzw. Dichte von Wasser in Abhängigkeit von der Temperatur verfolgen (See im Winter). | Stufe 1: 5.4, 5.5 |
| Wärmeübertragung | Leitung, Strömung und Strahlung am Haus-Modell vergleichen und dämmen. | Stufe 2: 5.1, 5.3 |
| Trägheit und Wechselwirkung | Auffahrunfall mit/ohne Gurt, Kräftepaare zwischen zwei Wagen. | Stufe 2: 6.1, 6.2 |
| Leistung messen | Treppenlauf/Hubarbeit: eigene Leistung berechnen und mit Geräten vergleichen. | Stufe 2: 6.4 |
| Magnetfelder und Elektromagnet | Kompassnadeln um Stab- und Hufeisenmagnet, Leiter und Spule; Elektromotor-Prinzip. | Stufe 1: 7.1; Stufe 2: 7.3 |
| Auftrieb: Schwimmen, Schweben, Sinken | Körper verschiedener Dichte in Flüssigkeiten tauchen und Kräfte vergleichen. | Stufe 2: 7.2 |
| Energieversorgung und Transformator | Kraftwerk–Trafo–Leitung–Haushalt aufbauen und Verluste bei verschiedenen Spannungen vergleichen. | Stufe 1: 8.1; Stufe 2: 8.2–8.4 |
| Strahlungsarten und Abschirmung | Alpha-, Beta- und Gammastrahlung durch Papier, Aluminium und Blei schicken; Abstandsgesetz. | Stufe 2: 9.2 |
| Newton’sches Grundgesetz | Wagen mit variabler Masse und Zugkraft, F = m·a messen. | E1/E2: E.2.1 |
| Fall mit Luftreibung / numerische Simulation | Bewegung schrittweise berechnen (Differenzenverfahren) und Grenzgeschwindigkeit beobachten. | E1/E2: E.4.2, E.4.3 |
| Gravitationsfeld | Feldlinien und Feldstärke um Massen; Gewichtskraft auf verschiedenen Himmelskörpern. | E1/E2: E.5.1 |
| Thermodynamik: Wärmekraftmaschine | Kreisprozess und Wirkungsgrad; reversible vs. irreversible Vorgänge. | E1/E2: E.6 |
| Drehimpuls und Trägheitsmoment | Pirouette: Arme anziehen, Drehzahl steigt; Präzession eines Kreisels. | E1/E2: E.7.2, E.7.3 |
| Elektronen im Plattenkondensator | Ablenkung und Beschleunigung geladener Teilchen im elektrischen Feld, Vergleich mit waagerechtem Wurf; Millikan-Versuch. | Q1: Q1.1.5, Q1.1.9 |
| Magnetfeld von Leiter und Spule | Flussdichte in Abhängigkeit von Stromstärke, Windungszahl und Länge messen. | Q1: Q1.2.1, Q1.2.2 |
| Hall-Effekt und Teilchenbeschleuniger | Hall-Spannung messen; Zyklotron im Takt beschleunigen. | Q1: Q1.2.5, Q1.2.6 |
| Elektromagnetischer Schwingkreis | LC-Kreis mit Energieanzeige (elektrisch/magnetisch), Thomson-Formel, Dämpfung. | Q2: Q2.2.5, Q2.2.9, Q2.2.10 |
| Wellenwanne: Huygens und Beugung | Wellenfronten an Spalt und Hindernis; Elementarwellen sichtbar machen. | Q2: Q2.3.3 |
| Elektromagnetisches Spektrum | Interaktive Skala von Radio bis Gamma mit Anwendungen. | Q3: Q3.1.1 |
| Einzelspalt und Interferometer | Intensitätsverteilung am Einzelspalt; Michelson-Interferometer. | Q3: Q3.1.5 |
| Compton-Effekt | Streuwinkel einstellen und Wellenlängenänderung beobachten. | Q3: Q3.2.3 |
| Röntgenspektrum | Röhrenspannung und Anodenmaterial variieren; Bremsspektrum und charakteristische Linien. | Q3: Q3.3.4 |
| Potenzialtopf und Orbitale | Stehende De-Broglie-Wellen im Potenzialtopf, Energieniveaus und Aufenthaltswahrscheinlichkeit. | Q4: Q4.1.1, Q4.1.4, Q4.1.5 |
| Doppelspalt mit einzelnen Quanten | Einzelne Elektronen/Photonen treffen nacheinander auf den Schirm; Weginformation an/aus. | Q4: Q4.1.2, Q4.1.3, Q4.1.7 |
| Laser | Besetzungsinversion und stimulierte Emission im Drei-Niveau-System. | Q4: Q4.2 |
| Bindungsenergie pro Nukleon | Kurve interaktiv erkunden; Spaltung und Fusion energetisch vergleichen. | Q4: Q4.3.3 |
| Minkowski-Diagramme | Zwei Bezugssysteme, Zeitdilatation und Längenkontraktion grafisch. | Q4: Q4.4 |
| Diode und Transistor | Kennlinien aufnehmen, Gleichrichter und Transistorschalter. | Q4: Q4.5 |
| Hubble-Diagramm | Rotverschiebung und Entfernung von Galaxien auftragen, Alter des Universums abschätzen. | Q4: Q4.6.2, Q4.6.3 |

# Teil E – Unklarheiten

1. **Keine Jahrgangszuordnung in der Sek I.** Kap. 7.2 gliedert in zwei Stufen („nach ca. der Hälfte des Stundenkontingents“ und „zusätzlich dazu nach Abschluss der Jahrgangsstufe 9/10“). Kap. 7.1 nennt „Jahrgangsstufen 6/8“, sagt aber, dass sich dafür keine Kompetenzerwartungen sinnvoll formulieren lassen. Die JSON-Zuordnung (Stufe 1 → 6, 7, 8; Stufe 2 → 9, 10) ist eine Annahme. Ab welcher Klasse Physik unterrichtet wird, steht nicht im Dokument (Verweis auf die Stundentafel).
2. **Keine Nummerierung im Sek-I-Lehrplan.** Inhaltsfelder und Schwerpunkte sind im Original nicht nummeriert. Die Codes (Inhaltsfeld 1–9 in Dokumentreihenfolge, Schwerpunkt .1, .2, …) sind von mir vergeben und beginnen in jeder Stufe neu.
3. **Erscheinungsjahr Sek I fehlt.** Im Dokument steht kein Jahr; der Dateiname („…_201102…“) deutet auf Februar 2011 hin. Das ist nicht aus dem Text belegt.
4. **G8/G9.** Weder Sek-I- noch Oberstufen-Dokument unterscheiden ausdrücklich zwischen G8 und G9.
5. **Kompetenzspalte gekürzt.** Zu jedem Schwerpunkt nennt die Tabelle „Bezüge zu Kompetenzbereichen“ (Erkenntnisgewinnung, Kommunikation, Bewertung, Nutzung fachlicher Konzepte). Diese sind nicht als eigene Bereiche aufgenommen; inhaltlich relevante Hinweise daraus (z. B. Thermometer kalibrieren, Schallgeschwindigkeit bestimmen, Spannungstransformation) sind in die Kurzbeschreibungen eingeflossen. Die Basiskonzepte (Sek I: Materie, Wechselwirkung, System, Energie; Oberstufe: z. B. Erhaltung und Gleichgewicht) sind nicht abgebildet.
6. **Oberstufe ohne Jahrgangsangaben.** Der Lehrplan nennt nur Kurshalbjahre. Die JSON-Zuordnung E → 11, Q1/Q2 → 12, Q3/Q4 → 13 ist eine Annahme (G9-Zählung). Bei G8 wäre es E → 10, Q1/Q2 → 11, Q3/Q4 → 12. Bitte vor dem Einbau bestätigen.
7. **Q3.1 ohne Niveau-Überschrift.** Bei Q3.1 fehlt im Dokument die Überschrift „grundlegendes Niveau“ vor den ersten Spiegelstrichen (S. 41); sie wurden als grundlegendes Niveau (GK + LK) behandelt. In der Einführungsphase gibt es keine GK/LK-Unterscheidung.
8. **Titel der Unterbereiche in der Oberstufe.** Übernommen sind die Spiegelstriche der ersten Ebene; die zweite Ebene ist in der Kurzbeschreibung zusammengefasst. Bei Q4.1.6 („Orts-Impuls-Unbestimmtheit …“) wurde die Überschrift vor „in der Form:“ gekürzt. Viele Formeln fehlen im PDF-Text; sie wurden für die Titel nicht benötigt.
9. **„am Beispiel“ vs. „zum Beispiel“.** Laut Lehrplan sind Inhalte mit „am Beispiel“ verbindlich, „zum Beispiel“-Nennungen nur Anregungen. In den Kurzbeschreibungen wurde das nicht durchgehend unterschieden.
10. **Erlass-Schwerpunkte.** Durch Erlass können Schwerpunkte und Konkretisierungen für das Abitur festgelegt werden. Diese liegen nicht vor.
11. **GK/LK und Verbindlichkeit im JSON.** Wie in Mathematik: „Nur LK (erhöhtes Niveau):“ im `summary` der Unterbereiche, „[verbindlich]“ / „[nicht verbindlich]“ im Summary des Themenfelds.
12. **Unsichere Simulationszuordnungen (bitte prüfen):** `induktion` (Kl. 11–13) ist in der Sek I bei der Umwandlung in elektrische Energie (Generator) zugeordnet. `gasgesetze` (geplant, Kl. 9–13) ist bei „Druck als physikalische Zustandsgröße“ zugeordnet. `teilchenmodell` ist auch bei „Temperatur und deren Messung“ zugeordnet. `hebelgesetz` ist bei „Drehmoment“ (E.7) zugeordnet. `brechung` (Sek-I-Simulation) ist bei Totalreflexion/Brechung in Q3.1 zugeordnet. `schiefer-wurf` ist beim waagerechten Wurf (E.3) zugeordnet, weil der Titel beide Würfe nennt. Ob `resonanz` auch gedämpfte freie Schwingungen zeigt, ist offen; deshalb nicht bei Q2.1.3 zugeordnet. `licht-schatten` wurde nicht für Mond-/Sonnenfinsternisse verwendet, weil unklar ist, ob die Simulation das abdeckt.
13. **Bewusst nicht zugeordnet:** `doppler-effekt` ist im hessischen KC nicht ausdrücklich genannt (die Rotverschiebung in Q4.6 ist kosmologisch). `freier-fall` ist nur in E.1 zugeordnet, nicht in der Sek I, weil der freie Fall dort nicht ausdrücklich genannt wird.
14. **Klassenstufen der Plattform weichen teilweise ab**, z. B. `bewegungsdiagramme` (Kl. 7–10) wird auch in E.1 genutzt, `energieerhaltung` (Kl. 9–10) auch in E.2, `kreisbewegung`/`schiefer-wurf`/`stoesse` (Kl. 10–11) in der Einführungsphase. Zugeordnet wurde nach Inhalt.
