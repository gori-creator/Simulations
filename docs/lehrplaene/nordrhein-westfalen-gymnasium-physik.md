# Nordrhein-Westfalen · Gymnasium · Physik – Lehrplan-Aufbereitung mit Simulationszuordnung

# Teil A – Überblick

| Merkmal | Sekundarstufe I | Gymnasiale Oberstufe |
|---|---|---|
| Bundesland | Nordrhein-Westfalen | Nordrhein-Westfalen |
| Schulart | Gymnasium (Sekundarstufe I) | gymnasiale Oberstufe von Gymnasium und Gesamtschule |
| Fach | Physik | Physik |
| Name des Lehrplans | „Kernlehrplan für die Sekundarstufe I – Gymnasium in Nordrhein-Westfalen, Physik“, Schriftenreihe „Schule in NRW“, Heft 3411, Ministerium für Schule und Bildung NRW | „Kernlehrplan für die Sekundarstufe II – Gymnasium/Gesamtschule in Nordrhein-Westfalen, Physik“, Ministerium für Schule und Bildung NRW |
| Jahr / Stand | 1. Auflage 2019; RdErl. vom 23.06.2019 (526-6.03.13.02-143664), in Kraft ab 01.08.2019 für die Klassen 5 und 6 aufsteigend | RdErl. vom 07.08.2026 (526-2026-0003217), ABl. NRW. 08/26; in Kraft ab 01.08.2027 beginnend mit der Einführungsphase. Der bisherige Kernlehrplan (Heft 4721, 31.05.2022) tritt mit Ablauf des 31.07.2027 auslaufend außer Kraft und ist hier nicht abgebildet |
| Datei (von der Projektleitung geliefert, nicht im Repository) | `g9_ph_klp_3411_2019_06_23.pdf` (48 Seiten) | `gost_klp_ph_2026_08_24.pdf` (58 Seiten) |
| Link laut Dokument | „www.lehrplannavigator.nrw.de“ (Online-Fassung) | „https://www.schulentwicklung.nrw.de/lehrplaene/“ (Lehrplannavigator); in `sourceUrl` verwendet |
| G8/G9 | G9 (Sekundarstufe I bis Klasse 10, „neues G9“) | G9 (Einführungsphase = Jahrgangsstufe 11, Qualifikationsphase = 12/13, siehe Teil E) |
| Niveaus / Wahl | keine; in der Erprobungsstufe dürfen Biologie und Physik integriert unterrichtet werden | Qualifikationsphase: Grundkurs und Leistungskurs mit **verschiedenen** Inhaltsfeldern |
| Struktur | Erprobungsstufe: Inhaltsfelder 1–4; bis zum Ende der Sek. I: Inhaltsfelder 5–11 (nummeriert) → inhaltliche Schwerpunkte (ohne Nummern) | Einführungsphase: 2 Inhaltsfelder; Qualifikationsphase: 4 Inhaltsfelder Grundkurs, 4 Inhaltsfelder Leistungskurs (ohne Nummern) → inhaltliche Schwerpunkte |

| Stufe (Lehrplan) | JSON-Jahrgang | Lernbereiche | Unterbereiche | Unterbereiche mit Simulation | zugeordnete Simulationen (verschieden) |
|---|---|---|---|---|---|
| Erprobungsstufe – Inhaltsfelder 1–4 | 5, 6 | 4 | 11 | 3 | 3 |
| Bis zum Ende der Sekundarstufe I – Inhaltsfelder 5–11 | 7, 8, 9, 10 | 7 | 20 | 12 | 18 |
| Einführungsphase | 11 | 2 | 6 | 5 | 9 |
| Qualifikationsphase – Grundkurs und Leistungskurs | 12, 13 | 8 | 21 | 17 | 15 |

Insgesamt verwendet: **35 von 36** fertigen Simulationen für Physik.

Nicht zugeordnet (Grund siehe Teil D): `doppler-effekt`

# Teil B – Lehrplan im Detail

Simulationen stehen bei allen Jahrgängen einer Stufe, sofern nicht in Klammern einzelne Jahrgänge genannt sind (dann passt die Simulation nach ihren Klassenstufen nur dort).

## Erprobungsstufe – Inhaltsfelder 1–4  
*Orientation stage – content areas 1–4*  
Jahrgangsstufe(n) im JSON: 5, 6  
(Quelle: Kernlehrplan Sek. I Physik (Heft 3411), Kap. 2.2, S. 20–29)

> Erprobungsstufe (Klassen 5 und 6): Der Kernlehrplan nennt die Kompetenzerwartungen „bis zum Ende der Erprobungsstufe“; die Lernbereiche stehen deshalb bei 5 und 6 gleich. Jede Simulation steht bei dem Jahrgang, für den sie gedacht ist; beim anderen führt ein Verweis dorthin. Die Inhaltsfelder sind im Lehrplan nummeriert, die Nummern der Schwerpunkte sind von uns vergeben.

### 1 Temperatur und Wärme
*EN: Temperature and heat*

- Kurz (DE): Temperatur messen und von Wärme unterscheiden, Wärme wandert auf drei Wegen, Stoffe dehnen sich aus und wechseln den Aggregatzustand – erklärt mit einem einfachen Teilchenmodell.
- Kurz (EN): Measuring temperature and telling it apart from heat, three ways heat travels, materials expand and change state – explained with a simple particle model.
- Simulationen: `teilchenmodell`
- Unterbereiche:
  - 1.1 Thermische Energie · *Thermal energy* – Kurz: Wärme, Temperatur und Temperaturmessung, die Celsiusskala. · *EN: Heat, temperature and measuring temperature, the Celsius scale.* – Simulationen: –
  - 1.2 Wärmetransport · *Heat transfer* – Kurz: Wärmemitführung, Wärmeleitung und Wärmestrahlung, Temperaturausgleich und Wärmedämmung. · *EN: Convection, conduction and radiation, temperature equalisation and insulation.* – Simulationen: –
  - 1.3 Wirkungen von Wärme · *Effects of heat* – Kurz: Aggregatzustände und ihre Übergänge sowie Wärmeausdehnung, gedeutet mit Teilchen; die Anomalie des Wassers. · *EN: States of matter and changes of state as well as thermal expansion, interpreted with particles; the anomaly of water.* – Simulationen: `teilchenmodell` (6)

### 2 Elektrischer Strom und Magnetismus
*EN: Electric current and magnetism*

- Kurz (DE): Einfache Stromkreise planen, aufbauen und als Schaltplan zeichnen, Wirkungen des Stroms und Sicherheit sowie Magnete, Magnetfelder und das Erdmagnetfeld.
- Kurz (EN): Planning and building simple circuits and drawing circuit diagrams, effects of current and safety, as well as magnets, magnetic fields and the Earth’s magnetic field.
- Simulationen: `einfacher-stromkreis`
- Unterbereiche:
  - 2.1 Stromkreise und Schaltungen · *Circuits and connections* – Kurz: Spannungsquellen, Leiter und Nichtleiter, Reihen-, Parallel-, UND- und ODER-Schaltung, Elektronen als Ladungsträger im Leiter. · *EN: Voltage sources, conductors and insulators, series, parallel, AND and OR circuits, electrons as charge carriers in a conductor.* – Simulationen: `einfacher-stromkreis` (6)
  - 2.2 Wirkungen des elektrischen Stroms · *Effects of electric current* – Kurz: Wärme-, Licht- und magnetische Wirkung, Sicherungen und Gefahren durch Elektrizität. · *EN: Heating, lighting and magnetic effects, fuses and dangers of electricity.* – Simulationen: –
  - 2.3 Magnetische Kräfte und Felder · *Magnetic forces and fields* – Kurz: Anziehung und Abstoßung, Magnetpole, Feldlinienbilder, Magnetfeld der Erde und Kompass. · *EN: Attraction and repulsion, magnetic poles, field-line patterns, the Earth’s magnetic field and the compass.* – Simulationen: –
  - 2.4 Magnetisierung · *Magnetisation* – Kurz: Magnetisierbare Stoffe und das Modell der Elementarmagnete. · *EN: Magnetisable materials and the model of elementary magnets.* – Simulationen: –

### 3 Schall
*EN: Sound*

- Kurz (DE): Schall entsteht durch Schwingungen, breitet sich in Stoffen aus und wird reflektiert oder absorbiert; Tonhöhe, Lautstärke, Ultraschall und Lärmschutz.
- Kurz (EN): Sound is produced by vibrations, travels through materials and is reflected or absorbed; pitch, loudness, ultrasound and noise protection.
- Simulationen: –
- Unterbereiche:
  - 3.1 Schwingungen und Schallwellen · *Vibrations and sound waves* – Kurz: Tonhöhe und Lautstärke, Schallausbreitung im Teilchenmodell, Absorption und Reflexion. · *EN: Pitch and loudness, sound propagation in the particle model, absorption and reflection.* – Simulationen: –
  - 3.2 Schallquellen und Schallempfänger · *Sound sources and receivers* – Kurz: Sender-Empfänger-Modell, Ultraschall in Natur, Medizin und Technik, Lärm und Lärmschutz. · *EN: Sender–receiver model, ultrasound in nature, medicine and technology, noise and noise protection.* – Simulationen: –

### 4 Licht
*EN: Light*

- Kurz (DE): Licht breitet sich geradlinig aus; Sehen, Schatten und die Lochkamera mit dem Strahlenmodell erklären; wie Oberflächen Licht streuen, spiegeln oder verschlucken.
- Kurz (EN): Light travels in straight lines; explaining vision, shadows and the pinhole camera with the ray model; how surfaces scatter, reflect or absorb light.
- Simulationen: `licht-schatten`
- Unterbereiche:
  - 4.1 Ausbreitung von Licht · *Propagation of light* – Kurz: Lichtquellen und Lichtempfänger, das Modell des Lichtstrahls und Abbildungen mit der Lochkamera. · *EN: Light sources and receivers, the light-ray model and images formed by a pinhole camera.* – Simulationen: –
  - 4.2 Sichtbarkeit und die Erscheinung von Gegenständen · *Visibility and appearance of objects* – Kurz: Streuung, Reflexion, Transmission und Absorption an Oberflächen sowie Kern- und Halbschatten. · *EN: Scattering, reflection, transmission and absorption at surfaces, as well as umbra and penumbra.* – Simulationen: `licht-schatten` (6)

## Bis zum Ende der Sekundarstufe I – Inhaltsfelder 5–11  
*Up to the end of lower secondary – content areas 5–11*  
Jahrgangsstufe(n) im JSON: 7, 8, 9, 10  
(Quelle: Kernlehrplan Sek. I Physik (Heft 3411), Kap. 2.3, S. 30–45)

> Bis zum Ende der Sekundarstufe I (Klassen 7 bis 10): Der Kernlehrplan verteilt die Inhaltsfelder 5–11 nicht auf einzelne Jahrgänge; das regelt der schulinterne Lehrplan. Die Lernbereiche stehen deshalb bei 7, 8, 9 und 10 gleich, und jede Simulation steht bei den Jahrgängen, für die sie gedacht ist. Die Nummern der Schwerpunkte sind von uns vergeben.

### 5 Optische Instrumente
*EN: Optical instruments*

- Kurz (DE): Spiegelbilder mit dem Reflexionsgesetz, Brechung und Totalreflexion, Bilder an Sammellinsen, Auge und optische Geräte sowie Spektrum und Farbmischung.
- Kurz (EN): Mirror images with the law of reflection, refraction and total internal reflection, images formed by converging lenses, the eye and optical devices, as well as the spectrum and colour mixing.
- Simulationen: `reflexion`, `brechung`, `linsen`
- Unterbereiche:
  - 5.1 Spiegelungen · *Reflections* – Kurz: Reflexionsgesetz und Bildentstehung am ebenen Spiegel. · *EN: Law of reflection and image formation in a plane mirror.* – Simulationen: `reflexion` (7, 8)
  - 5.2 Lichtbrechung · *Refraction of light* – Kurz: Brechung an Grenzflächen, Totalreflexion und Lichtleiter, Bilder an Sammellinsen, im Auge und in optischen Instrumenten. · *EN: Refraction at boundaries, total internal reflection and optical fibres, images formed by converging lenses, in the eye and in optical instruments.* – Simulationen: `brechung`, `linsen`
  - 5.3 Licht und Farben · *Light and colours* – Kurz: Zerlegung von Licht am Prisma, Infrarot und Ultraviolett, Absorption und Farbmischung (RGB, CMYK). · *EN: Splitting light with a prism, infrared and ultraviolet, absorption and colour mixing (RGB, CMYK).* – Simulationen: –

### 6 Sterne und Weltall
*EN: Stars and the universe*

- Kurz (DE): Mondphasen, Finsternisse und Jahreszeiten modellhaft erklären, Planeten und andere Himmelskörper, Lichtjahr, Gravitation und die Entwicklung von Sternen.
- Kurz (EN): Explaining lunar phases, eclipses and seasons with models, planets and other celestial bodies, the light year, gravity and the life cycle of stars.
- Simulationen: `licht-schatten`
- Unterbereiche:
  - 6.1 Sonnensystem · *Solar system* – Kurz: Mondphasen, Mond- und Sonnenfinsternisse, Jahreszeiten und Planeten. · *EN: Lunar phases, lunar and solar eclipses, seasons and planets.* – Simulationen: `licht-schatten` (7)
  - 6.2 Universum · *Universe* – Kurz: Himmelsobjekte, Entfernungen in Lichtjahren und typische Stadien der Sternentwicklung. · *EN: Celestial objects, distances in light years and typical stages of stellar evolution.* – Simulationen: –

### 7 Bewegung, Kraft und Energie
*EN: Motion, force and energy*

- Kurz (DE): Bewegungen mit Geschwindigkeit und Beschleunigung beschreiben, Kräfte als Pfeile addieren, einfache Maschinen mit der Goldenen Regel, Energieformen, Energieerhaltung und Leistung.
- Kurz (EN): Describing motion with velocity and acceleration, adding forces as arrows, simple machines and the golden rule of mechanics, forms of energy, conservation of energy and power.
- Simulationen: `bewegungsdiagramme`, `hookesches-gesetz`, `hebelgesetz`, `kraefteaddition`, `schiefe-ebene`, `freier-fall`, `energieerhaltung`
- Unterbereiche:
  - 7.1 Bewegungen · *Motion* – Kurz: Mittlere und momentane Geschwindigkeit, Beschleunigung und Orts-Zeit-Diagramme. · *EN: Average and instantaneous velocity, acceleration and position–time graphs.* – Simulationen: `bewegungsdiagramme`, `freier-fall` (9, 10)
  - 7.2 Kraft · *Force* – Kurz: Kräfte ändern Bewegungen oder verformen Körper; Kraft und Gegenkraft, Gewichtskraft und Masse, Kräfteaddition und Reibung. · *EN: Forces change motion or deform bodies; action and reaction, weight and mass, adding forces and friction.* – Simulationen: `hookesches-gesetz`, `kraefteaddition` (8, 9, 10), `schiefe-ebene` (8, 9, 10)
  - 7.3 Goldene Regel der Mechanik · *Golden rule of mechanics* – Kurz: Einfache Maschinen wandeln Kräfte; was an Kraft gespart wird, muss an Weg zugelegt werden. · *EN: Simple machines change forces; what is saved in force must be added in distance.* – Simulationen: `hebelgesetz`, `schiefe-ebene` (8, 9, 10)
  - 7.4 Energieformen · *Forms of energy* – Kurz: Lageenergie, Bewegungsenergie und Spannenergie. · *EN: Potential energy, kinetic energy and elastic energy.* – Simulationen: `energieerhaltung` (9, 10)
  - 7.5 Energieumwandlung · *Energy conversion* – Kurz: Energieumwandlungsketten, Energieerhaltung und Leistung, auch im Vergleich mit der eigenen Körperleistung. · *EN: Chains of energy conversion, conservation of energy and power, also compared with one’s own physical power.* – Simulationen: `energieerhaltung` (9, 10)

### 8 Druck und Auftrieb
*EN: Pressure and buoyancy*

- Kurz (DE): Druck und Dichte in Flüssigkeiten und Gasen im Teilchenmodell, Schweredruck, Luftdruck und Auftrieb nach Archimedes.
- Kurz (EN): Pressure and density in liquids and gases in the particle model, hydrostatic pressure, air pressure and buoyancy according to Archimedes.
- Simulationen: `gasgesetze`
- Unterbereiche:
  - 8.1 Druck in Flüssigkeiten und Gasen · *Pressure in liquids and gases* – Kurz: Dichte, Schweredruck, Auftrieb und Archimedisches Prinzip, Luftdruck; Druck als Folge von Teilchenstößen. · *EN: Density, hydrostatic pressure, buoyancy and Archimedes’ principle, air pressure; pressure as a result of particle collisions.* – Simulationen: `gasgesetze` (9, 10)
  - 8.2 Druckmessung · *Measuring pressure* – Kurz: Druck und Kraftwirkungen, Druck in Pascal angeben und messen. · *EN: Pressure and the effects of force, stating and measuring pressure in pascals.* – Simulationen: –

### 9 Elektrizität
*EN: Electricity*

- Kurz (DE): Ladungen und elektrische Felder, Spannung, Stromstärke und Widerstand in Reihen- und Parallelschaltungen, Sicherheit im Haushalt sowie elektrische Energie, Leistung und Kosten.
- Kurz (EN): Charges and electric fields, voltage, current and resistance in series and parallel circuits, safety at home, and electrical energy, power and costs.
- Simulationen: `einfacher-stromkreis`, `ohmsches-gesetz`, `reihe-parallel`
- Unterbereiche:
  - 9.1 Elektrostatik · *Electrostatics* – Kurz: Elektrische Ladungen und Felder, Elektroskop, Spannung durch Ladungstrennung. · *EN: Electric charges and fields, the electroscope, voltage from separating charges.* – Simulationen: –
  - 9.2 Elektrische Stromkreise · *Electric circuits* – Kurz: Elektronen-Atomrumpf-Modell, Strom als Ladungstransport, Widerstand und Ohmsches Gesetz, Reihen- und Parallelschaltung, Sicherheitsvorrichtungen. · *EN: Electron–ion-core model, current as transport of charge, resistance and Ohm’s law, series and parallel circuits, safety devices.* – Simulationen: `einfacher-stromkreis` (7, 8, 9), `ohmsches-gesetz` (8, 9), `reihe-parallel` (8, 9)
  - 9.3 Elektrische Energie und Leistung · *Electrical energy and power* – Kurz: Energie und Leistung elektrischer Geräte berechnen und Energiekosten ermitteln. · *EN: Calculating the energy and power of electrical appliances and working out energy costs.* – Simulationen: –

### 10 Ionisierende Strahlung und Kernenergie
*EN: Ionising radiation and nuclear energy*

- Kurz (DE): Atomaufbau, Alpha-, Beta-, Gamma- und Röntgenstrahlung, Zerfall und Halbwertszeit, Wirkung und Schutz sowie Kernspaltung, Kernfusion und Kernkraftwerke.
- Kurz (EN): Atomic structure, alpha, beta, gamma and X-radiation, decay and half-life, effects and protection, as well as nuclear fission, fusion and nuclear power plants.
- Simulationen: `radioaktiver-zerfall`, `lorentzkraft`
- Unterbereiche:
  - 10.1 Atomaufbau und ionisierende Strahlung · *Atomic structure and ionising radiation* – Kurz: Strahlungsarten, Ablenkung geladener Teilchen im Magnetfeld (qualitativ), radioaktiver Zerfall als Zufallsprozess und Halbwertszeit. · *EN: Types of radiation, deflection of charged particles in a magnetic field (qualitative), radioactive decay as a random process and half-life.* – Simulationen: `radioaktiver-zerfall` (9, 10), `lorentzkraft` (10)
  - 10.2 Wechselwirkung von Strahlung mit Materie · *Interaction of radiation with matter* – Kurz: Nachweis und Absorption von Strahlung, biologische Wirkung, Medizin und Strahlenschutz. · *EN: Detection and absorption of radiation, biological effects, medicine and radiation protection.* – Simulationen: –
  - 10.3 Kernenergie · *Nuclear energy* – Kurz: Kernspaltung, Kernfusion, Kernkraftwerke und Endlagerung. · *EN: Nuclear fission, nuclear fusion, nuclear power plants and final disposal.* – Simulationen: –

### 11 Energieversorgung
*EN: Energy supply*

- Kurz (DE): Induktion in Generator und Transformator, Elektromotor, Wechselspannung, Kraftwerke und erneuerbare Energien, Übertragung, Wirkungsgrad und Nachhaltigkeit.
- Kurz (EN): Induction in generators and transformers, electric motors, alternating voltage, power stations and renewable energy, transmission, efficiency and sustainability.
- Simulationen: `induktion`
- Unterbereiche:
  - 11.1 Induktion und Elektromagnetismus · *Induction and electromagnetism* – Kurz: Magnetfelder von Leiter und Spule, Elektromotor, Generator, Wechselspannung und Transformator. · *EN: Magnetic fields of wires and coils, electric motors, generators, alternating voltage and transformers.* – Simulationen: `induktion` (10)
  - 11.2 Bereitstellung und Nutzung von Energie · *Providing and using energy* – Kurz: Kraftwerke und regenerative Anlagen, Energieübertragung mit Hochspannung, Entwertung, Wirkungsgrad, Speicherung und Nachhaltigkeit. · *EN: Power stations and renewable plants, high-voltage transmission, energy dissipation, efficiency, storage and sustainability.* – Simulationen: –

## Einführungsphase  
*Introductory phase*  
Jahrgangsstufe(n) im JSON: 11  
(Quelle: Kernlehrplan Sek. II Physik (2026), Kap. 2.2)

> Einführungsphase der gymnasialen Oberstufe (G9: Jahrgangsstufe 11). Die Inhaltsfelder sind im Lehrplan nicht nummeriert; die Codes sind von uns vergeben. Kernlehrplan Sekundarstufe II von 2026, in Kraft ab 1. August 2027 beginnend mit der Einführungsphase; der Kernlehrplan von 2022 läuft aus und ist hier nicht abgebildet.

### EF-1 Grundlagen der Mechanik
*EN: Foundations of mechanics*

- Kurz (DE): Bewegungen mit Diagrammen und Gleichungen beschreiben, mit den Newton’schen Gesetzen und Kräften erklären und mit Energie- und Impulserhaltung bilanzieren.
- Kurz (EN): Describing motion with graphs and equations, explaining it with Newton’s laws and forces, and accounting for it with conservation of energy and momentum.
- Simulationen: `bewegungsdiagramme`, `freier-fall`, `schiefer-wurf`, `kraefteaddition`, `schiefe-ebene`, `energieerhaltung`, `stoesse`
- Unterbereiche:
  - EF-1.1 Kinematik · *Kinematics* – Kurz: Gleichförmige und gleichmäßig beschleunigte Bewegung, freier Fall, waagerechter Wurf und vektorielle Größen. · *EN: Uniform and uniformly accelerated motion, free fall, horizontal projection and vector quantities.* – Simulationen: `bewegungsdiagramme`, `freier-fall`, `schiefer-wurf`
  - EF-1.2 Dynamik · *Dynamics* – Kurz: Newton’sche Gesetze, beschleunigende Kräfte, Kräftegleichgewicht mit Komponentenzerlegung und Reibung. · *EN: Newton’s laws, accelerating forces, equilibrium of forces using components, and friction.* – Simulationen: `kraefteaddition`, `schiefe-ebene`
  - EF-1.3 Erhaltungssätze · *Conservation laws* – Kurz: Impuls und mechanische Energie (Lage-, Bewegungs-, Spannenergie), Energiebilanzen und eindimensionale Stöße. · *EN: Momentum and mechanical energy (potential, kinetic, elastic), energy balances and one-dimensional collisions.* – Simulationen: `energieerhaltung`, `stoesse`

### EF-2 Kreisbewegung, Gravitation und physikalische Weltbilder
*EN: Circular motion, gravitation and physical world views*

- Kurz (DE): Kreisbewegung und Zentripetalkraft, Newtons Gravitationsgesetz und die Kepler’schen Gesetze sowie der Weg vom geozentrischen Weltbild zur speziellen Relativitätstheorie.
- Kurz (EN): Circular motion and centripetal force, Newton’s law of gravitation and Kepler’s laws, and the path from the geocentric world view to special relativity.
- Simulationen: `kreisbewegung`, `planetenbahnen`
- Unterbereiche:
  - EF-2.1 Kreisbewegung · *Circular motion* – Kurz: Gleichförmige Kreisbewegung und Zentripetalkraft, auch quantitativ. · *EN: Uniform circular motion and centripetal force, also quantitatively.* – Simulationen: `kreisbewegung`
  - EF-2.2 Gravitation · *Gravitation* – Kurz: Schwerkraft, Newton’sches Gravitationsgesetz, Kepler’sche Gesetze und Gravitationsfeld. · *EN: Gravity, Newton’s law of gravitation, Kepler’s laws and the gravitational field.* – Simulationen: `planetenbahnen`
  - EF-2.3 Wandel physikalischer Weltbilder · *Changing physical world views* – Kurz: Geo- und heliozentrisches Weltbild, Grundprinzipien der speziellen Relativitätstheorie und Zeitdilatation an der Lichtuhr. · *EN: Geocentric and heliocentric world views, basic principles of special relativity and time dilation with the light clock.* – Simulationen: –

## Qualifikationsphase – Grundkurs und Leistungskurs  
*Qualification phase – basic and advanced course*  
Jahrgangsstufe(n) im JSON: 12, 13  
(Quelle: Kernlehrplan Sek. II Physik (2026), Kap. 2.3.1 (Grundkurs) und 2.3.2 (Leistungskurs))

> Qualifikationsphase (G9: Jahrgangsstufen 12 und 13). Der Kernlehrplan nennt Inhaltsfelder für den Grundkurs (GK) und eigene für den Leistungskurs (LK), aber keine Verteilung auf Halbjahre; die Lernbereiche stehen deshalb bei 12 und 13 gleich. Die Codes sind von uns vergeben. Kernlehrplan Sekundarstufe II von 2026 (aufsteigend in Kraft ab 1. August 2027 mit der Einführungsphase).

### GK-1 Klassische Wellen und geladene Teilchen in Feldern (Grundkurs)
*EN: Classical waves and charged particles in fields (basic course)*

- Kurz (DE): Federpendel, harmonische Schwingungen und Wellen mit Huygens, Interferenz und stehenden Wellen; elektrische und magnetische Felder und die Bahn von Elektronen im Fadenstrahlrohr.
- Kurz (EN): Spring pendulum, harmonic oscillations and waves with Huygens, interference and standing waves; electric and magnetic fields and the path of electrons in the fine-beam tube.
- Simulationen: `federpendel`, `wellen-ausbreitung`, `interferenz`, `stehende-wellen`, `doppelspalt`, `feldlinien`, `lorentzkraft`
- Unterbereiche:
  - GK-1.1 Klassische Wellen · *Classical waves* – Kurz: Federpendel, harmonische Schwingungen und Wellen, Huygens’sches Prinzip, Reflexion, Brechung, Beugung, Superposition, stehende Wellen, Polarisation sowie Doppelspalt und Gitter mit Licht. · *EN: Spring pendulum, harmonic oscillations and waves, Huygens’ principle, reflection, refraction, diffraction, superposition, standing waves, polarisation, and double slit and grating with light.* – Simulationen: `federpendel` (12), `wellen-ausbreitung` (12), `interferenz`, `stehende-wellen`, `doppelspalt`
  - GK-1.2 Teilchen in Feldern · *Particles in fields* – Kurz: Elektrische und magnetische Felder, Feldstärke, Spannung und Flussdichte, Feldlinienbilder, Millikan-Versuch und Bahnformen geladener Teilchen in homogenen Feldern. · *EN: Electric and magnetic fields, field strength, voltage and flux density, field-line patterns, the Millikan experiment and paths of charged particles in uniform fields.* – Simulationen: `feldlinien` (12), `lorentzkraft`

### GK-2 Quantenobjekte (Grundkurs)
*EN: Quantum objects (basic course)*

- Kurz (DE): Licht hat Teilchen-, Elektronen haben Welleneigenschaften: Photoeffekt, De-Broglie-Wellenlänge, Interferenz von Elektronen und die Deutung von Quantenobjekten.
- Kurz (EN): Light has particle properties and electrons have wave properties: photoelectric effect, de Broglie wavelength, electron interference and the interpretation of quantum objects.
- Simulationen: `photoeffekt`, `elektronenbeugung`
- Unterbereiche:
  - GK-2.1 Teilchenaspekte von Photonen · *Particle aspects of photons* – Kurz: Energiequantelung von Licht und Photoeffekt. · *EN: Quantisation of light energy and the photoelectric effect.* – Simulationen: `photoeffekt`
  - GK-2.2 Wellenaspekt von Elektronen · *Wave aspect of electrons* – Kurz: De-Broglie-Wellenlänge und Interferenz von Elektronen. · *EN: De Broglie wavelength and interference of electrons.* – Simulationen: `elektronenbeugung`
  - GK-2.3 Photon und Elektron als Quantenobjekte · *Photon and electron as quantum objects* – Kurz: Wellen- und Teilchenmodell, Wahrscheinlichkeitsdeutung, „Welcher-Weg“-Information und Kopenhagener Deutung. · *EN: Wave and particle models, probability interpretation, which-way information and the Copenhagen interpretation.* – Simulationen: –

### GK-3 Elektrodynamik und Energieübertragung (Grundkurs)
*EN: Electrodynamics and energy transmission (basic course)*

- Kurz (DE): Induktionsgesetz, Generator und Transformator, Fernübertragung von Energie, Kondensator laden und entladen sowie die elektromagnetische Schwingung.
- Kurz (EN): Law of induction, generator and transformer, long-distance transmission of energy, charging and discharging a capacitor, and electromagnetic oscillation.
- Simulationen: `induktion`, `kondensator`
- Unterbereiche:
  - GK-3.1 Elektrodynamik · *Electrodynamics* – Kurz: Magnetischer Fluss, elektromagnetische Induktion und Induktionsgesetz, Wechselspannung, Auf- und Entladung des Kondensators. · *EN: Magnetic flux, electromagnetic induction and the law of induction, alternating voltage, charging and discharging a capacitor.* – Simulationen: `induktion`, `kondensator` (12)
  - GK-3.2 Energieübertragung · *Energy transmission* – Kurz: Generator und Transformator, Freileitungen und die elektromagnetische Schwingung. · *EN: Generator and transformer, overhead power lines and electromagnetic oscillation.* – Simulationen: `induktion`

### GK-4 Strahlung und Materie (Grundkurs)
*EN: Radiation and matter (basic course)*

- Kurz (DE): Elektromagnetisches Spektrum und ionisierende Strahlung, Linienspektren und Energieniveaus der Atomhülle sowie Kernumwandlungen, Zerfallsgesetz, Kernspaltung und Kernfusion.
- Kurz (EN): Electromagnetic spectrum and ionising radiation, line spectra and energy levels of the atomic shell, as well as nuclear transformations, the decay law, fission and fusion.
- Simulationen: `linienspektren`, `radioaktiver-zerfall`
- Unterbereiche:
  - GK-4.1 Strahlung · *Radiation* – Kurz: Spektrum elektromagnetischer Strahlung, ionisierende Strahlung, Geiger-Müller-Zählrohr und biologische Wirkungen. · *EN: Spectrum of electromagnetic radiation, ionising radiation, the Geiger–Müller counter and biological effects.* – Simulationen: –
  - GK-4.2 Atomphysik · *Atomic physics* – Kurz: Linienspektren, Energieniveauschema, Franck-Hertz-Versuch, Kern-Hülle-Modell und Röntgenstrahlung. · *EN: Line spectra, energy level diagrams, the Franck–Hertz experiment, the nuclear model of the atom and X-rays.* – Simulationen: `linienspektren`
  - GK-4.3 Kernphysik · *Nuclear physics* – Kurz: Nukleonen, Zerfallsprozesse und Kernumwandlungen, Zerfallsgesetz und Halbwertszeit, Kernspaltung und -fusion. · *EN: Nucleons, decay processes and nuclear transformations, the decay law and half-life, fission and fusion.* – Simulationen: `radioaktiver-zerfall`

### LK-1 Ladungen, Felder und Induktion (Leistungskurs)
*EN: Charges, fields and induction (advanced course)*

- Kurz (DE): Elektrische und magnetische Felder mit Coulomb’schem Gesetz, Potential und Kondensator, Bahnen geladener Teilchen in Feldern sowie Induktion und Selbstinduktion.
- Kurz (EN): Electric and magnetic fields with Coulomb’s law, potential and capacitors, paths of charged particles in fields, as well as induction and self-induction.
- Simulationen: `feldlinien`, `kondensator`, `lorentzkraft`, `induktion`
- Unterbereiche:
  - LK-1.1 Elektrische Ladungen und Felder · *Electric charges and fields* – Kurz: Ladungen, Feldstärke, Coulomb’sches Gesetz, Potential und Spannung, Kondensator und Kapazität mit Lade- und Entladekurven; magnetische Flussdichte. · *EN: Charges, field strength, Coulomb’s law, potential and voltage, capacitor and capacitance with charging and discharging curves; magnetic flux density.* – Simulationen: `feldlinien` (12), `kondensator` (12)
  - LK-1.2 Bewegungen in Feldern · *Motion in fields* – Kurz: Geladene Teilchen in elektrischen Längs- und Querfeldern, Lorentzkraft und gekreuzte Felder. · *EN: Charged particles in longitudinal and transverse electric fields, the Lorentz force and crossed fields.* – Simulationen: `lorentzkraft`
  - LK-1.3 Elektromagnetische Induktion · *Electromagnetic induction* – Kurz: Magnetischer Fluss, Induktionsgesetz, Lenz’sche Regel, Selbstinduktion und Induktivität. · *EN: Magnetic flux, the law of induction, Lenz’s law, self-induction and inductance.* – Simulationen: `induktion`

### LK-2 Schwingende Systeme und Wellen (Leistungskurs)
*EN: Oscillating systems and waves (advanced course)*

- Kurz (DE): Mechanische und elektromagnetische Schwingungen mit Differentialgleichungen, Dämpfung und Resonanz, Wellenphänomene, Interferenz an Spalt und Gitter, Michelson-Interferometer und Hertz’scher Dipol.
- Kurz (EN): Mechanical and electromagnetic oscillations with differential equations, damping and resonance, wave phenomena, interference at slits and gratings, the Michelson interferometer and the Hertzian dipole.
- Simulationen: `wellen-ausbreitung`, `interferenz`, `stehende-wellen`, `doppelspalt`, `federpendel`, `fadenpendel`, `resonanz`
- Unterbereiche:
  - LK-2.1 Schwingungen und Wellen · *Oscillations and waves* – Kurz: Harmonische Schwingungen und ihre Kenngrößen, Wellengleichung, Huygens’sches Prinzip, Reflexion, Brechung, Beugung, Polarisation, Superposition und Michelson-Interferometer. · *EN: Harmonic oscillations and their parameters, the wave equation, Huygens’ principle, reflection, refraction, diffraction, polarisation, superposition and the Michelson interferometer.* – Simulationen: `wellen-ausbreitung` (12), `interferenz`, `stehende-wellen`, `doppelspalt`
  - LK-2.2 Schwingende Systeme · *Oscillating systems* – Kurz: Federpendel, Fadenpendel, gedämpfte und erzwungene Schwingungen und Resonanz, Schwingkreis und Hertz’scher Dipol. · *EN: Spring and simple pendulum, damped and forced oscillations and resonance, the LC circuit and the Hertzian dipole.* – Simulationen: `federpendel` (12), `fadenpendel` (12), `resonanz`

### LK-3 Quantenphysik (Leistungskurs)
*EN: Quantum physics (advanced course)*

- Kurz (DE): Photoeffekt und Planck’sches Wirkungsquantum, Bremsstrahlung, Bragg-Reflexion und Elektronenbeugung, Wellenfunktion, Delayed-Choice-Experiment und Unbestimmtheitsrelation.
- Kurz (EN): Photoelectric effect and Planck’s constant, bremsstrahlung, Bragg reflection and electron diffraction, the wave function, the delayed-choice experiment and the uncertainty principle.
- Simulationen: `photoeffekt`, `elektronenbeugung`
- Unterbereiche:
  - LK-3.1 Teilchenaspekte von Photonen · *Particle aspects of photons* – Kurz: Energiequantelung von Licht, Photoeffekt und Bremsstrahlung. · *EN: Quantisation of light energy, the photoelectric effect and bremsstrahlung.* – Simulationen: `photoeffekt`
  - LK-3.2 Photonen und Elektronen als Quantenobjekte · *Photons and electrons as quantum objects* – Kurz: Doppelspaltexperiment, Bragg-Reflexion, Elektronenbeugung, Wahrscheinlichkeitsdeutung, Delayed-Choice-Experiment und Kopenhagener Deutung. · *EN: Double-slit experiment, Bragg reflection, electron diffraction, probability interpretation, the delayed-choice experiment and the Copenhagen interpretation.* – Simulationen: `elektronenbeugung`

### LK-4 Atom- und Kernphysik (Leistungskurs)
*EN: Atomic and nuclear physics (advanced course)*

- Kurz (DE): Atommodelle bis zum Potentialtopf, Energieniveaus und Röntgenstrahlung, Arten und Nachweis ionisierender Strahlung, Zerfallsgesetz und Altersbestimmung sowie Kernspaltung und Kernfusion.
- Kurz (EN): Atomic models up to the potential well, energy levels and X-rays, types and detection of ionising radiation, the decay law and dating, as well as nuclear fission and fusion.
- Simulationen: `linienspektren`, `radioaktiver-zerfall`
- Unterbereiche:
  - LK-4.1 Atomaufbau · *Atomic structure* – Kurz: Atommodelle, eindimensionaler Potentialtopf, Energieniveauschema, Linienspektren, Franck-Hertz-Versuch und Röntgenstrahlung. · *EN: Atomic models, the one-dimensional potential well, energy level diagrams, line spectra, the Franck–Hertz experiment and X-rays.* – Simulationen: `linienspektren`
  - LK-4.2 Ionisierende Strahlung · *Ionising radiation* – Kurz: Strahlungsarten, ihr Nachweis, ihre Eigenschaften und ihre Absorption. · *EN: Types of radiation, their detection, properties and absorption.* – Simulationen: –
  - LK-4.3 Radioaktiver Zerfall · *Radioactive decay* – Kurz: Kernaufbau, Zerfallsreihen, Zerfallsgesetz, Halbwertszeit und Altersbestimmung mit C-14. · *EN: Nuclear structure, decay series, the decay law, half-life and carbon-14 dating.* – Simulationen: `radioaktiver-zerfall`
  - LK-4.4 Kernspaltung und -fusion · *Nuclear fission and fusion* – Kurz: Bindungsenergien, Massendefekt und Kettenreaktion. · *EN: Binding energies, mass defect and chain reaction.* – Simulationen: –

# Teil C – JSON

Die vollständige JSON-Datei liegt separat bei: `nordrhein-westfalen-gymnasium-physik.json` (erzeugt aus `src/curriculum/lehrplaene/nordrhein-westfalen-gymnasium-physik.ts`, dieselben Daten).

# Teil D – Lücken und Vorschläge

## D.1 Nicht zugeordnete Simulationen (Ausnahmen in `NOT_IN_CURRICULUM`)

| Simulation | Grund |
|---|---|
| `doppler-effekt` | Der Doppler-Effekt kommt in keinem der beiden Kernlehrpläne vor (Sek. I: Schall nur in der Erprobungsstufe ohne Doppler-Effekt; Oberstufe: keine Akustik). |

## D.2 Lernbereiche und Unterbereiche ohne passende Simulation

- **Erprobungsstufe:** Inhaltsfeld 3 Schall vollständig; 1.1 Thermische Energie; 1.2 Wärmetransport; 2.2 Wirkungen des elektrischen Stroms; 2.3 Magnetische Kräfte und Felder; 2.4 Magnetisierung; 4.1 Ausbreitung von Licht (Lochkamera)
- **Klassen 7–10:** 5.3 Licht und Farben; 6.2 Universum; 8.2 Druckmessung; 9.1 Elektrostatik; 9.3 Elektrische Energie und Leistung; 10.2 Wechselwirkung von Strahlung mit Materie; 10.3 Kernenergie; 11.2 Bereitstellung und Nutzung von Energie
- **Einführungsphase:** EF-2.3 Wandel physikalischer Weltbilder (spezielle Relativitätstheorie, Lichtuhr)
- **Qualifikationsphase:** GK-2.3 Photon und Elektron als Quantenobjekte; GK-4.1 Strahlung; LK-4.2 Ionisierende Strahlung; LK-4.4 Kernspaltung und -fusion

## D.3 Vorschläge für neue Simulationen

| Vorschlag (Titel) | Idee | schließt Lücke in |
|---|---|---|
| Schall: Tonhöhe und Lautstärke | Schwingende Saite bzw. Lautsprecher, Schwingungsbild auf dem „Oszilloskop“, Frequenz und Amplitude ändern. | 3.1, 3.2 |
| Lochkamera | Lochgröße und Abstand ändern, Bild konstruieren. | 4.1 |
| Wärmetransport und Dämmung | Leitung, Mitführung und Strahlung an einem Haus vergleichen. | 1.1, 1.2 |
| Magnetfelder und Elektromagnet | Kompassnadeln um Magnete, Leiter und Spule. | 2.3, 2.4, 11.1 |
| Farben und Spektrum | Prisma, additive und subtraktive Farbmischung (RGB, CMYK). | 5.3 |
| Schweredruck und Auftrieb | Körper eintauchen, Druck in der Tiefe und Auftriebskraft messen. | 8.1, 8.2 |
| Stromkosten im Haushalt | Geräte mit Leistung und Laufzeit, Energie und Kosten berechnen. | 9.3, 11.2 |
| Lichtuhr und Zeitdilatation | Bewegte Lichtuhr, Weg des Lichts und γ-Faktor. | EF-2.3 |
| Doppelspalt mit einzelnen Quanten | Einzelne Photonen/Elektronen treffen nacheinander auf, Weginformation an/aus. | GK-2.3, LK-3.2 |
| Absorption ionisierender Strahlung | Alpha, Beta, Gamma durch Papier, Aluminium und Blei; Zählrate messen. | 10.2, GK-4.1, LK-4.2 |
| Kettenreaktion und Bindungsenergie | Neutronen spalten Kerne; Bindungsenergie pro Nukleon. | 10.3, LK-4.4 |

# Teil E – Einordnung und Unklarheiten

Festlegung der Projektleitung (27.10.2026): Nennt der Lehrplan keine genauen Jahrgänge, werden Doppeljahrgangsstufen verwendet; in der Oberstufe gilt der Kernlehrplan von 2026, obwohl er erst ab 01.08.2027 in Kraft tritt.

1. **Klassen 7–10 ohne Verteilung.** Der Kernlehrplan nennt für die Inhaltsfelder 5–11 nur „bis zum Ende der Sekundarstufe I“. Sie stehen deshalb bei den Klassen 7, 8, 9 und 10 gleich; jede Simulation steht nur bei den Jahrgängen, für die sie gedacht ist. Eine Teilung in die Doppeljahrgangsstufen 7/8 und 9/10 gibt der Lehrplan nicht her (keine Stufen, keine Verteilung der Inhaltsfelder); wann welches Inhaltsfeld unterrichtet wird, legt der schulinterne Lehrplan fest.
2. **Oberstufe ohne Jahrgänge.** Einführungsphase = Jahrgangsstufe 11 (G9). Der Lehrplan verteilt die Qualifikationsphase nicht auf Halbjahre; sie steht deshalb als Doppeljahrgangsstufe 12/13 mit gleichen Lernbereichen.
3. **Fassung der Oberstufe.** Abgebildet ist der Kernlehrplan von 2026, der ab 01.08.2027 mit der Einführungsphase gilt (ausdrücklich so von der Projektleitung festgelegt). Bis dahin unterrichten die Schulen nach dem Kernlehrplan von 2022, der hier nicht vorliegt.
4. **Grund- und Leistungskurs getrennt.** Anders als in Mathematik haben GK und LK in Physik verschiedene Inhaltsfelder. Beide stehen bei 12 und 13; „(Grundkurs)“ bzw. „(Leistungskurs)“ steht im Titel. Codes GK-1 … GK-4, LK-1 … LK-4 und EF-1, EF-2 sowie alle Nummern der Schwerpunkte sind von uns vergeben; die Nummern der Inhaltsfelder 1–11 der Sek. I stammen aus dem Lehrplan.
5. **Erweiterte Klassenstufen** (in `src/curriculum/physik.ts`, mit den unteren Grenzen von Thema und Bereich), weil NRW das Thema in der Erprobungsstufe unterrichtet:

   | ID | bisher | neu | Lernbereich | Fundstelle |
   |---|---|---|---|---|
   | `teilchenmodell` | 7–9 | 6–9 | 1.3 Wirkungen von Wärme (Klasse 6) | Sek. I, Kap. 2.2, Inhaltsfeld 1: Aggregatzustände und Übergänge mit einem einfachen Teilchenmodell erklären; Temperaturverläufe in Diagramme übertragen |
   | `einfacher-stromkreis` | 7–9 | 6–9 | 2.1 Stromkreise und Schaltungen (Klasse 6) | Sek. I, Kap. 2.2, Inhaltsfeld 2: einfache Stromkreise aufbauen, Schaltsymbole und Schaltpläne |

   Damit beginnen auch das Thema „Teilchenmodell“ (6–8), das Thema „Stromkreise“ (6–9) und die Bereiche „Wärme“ und „Elektrizität“ (6–13) bei Klasse 6.
6. **Unsichere Zuordnungen (Entwurf, bitte am Lehrplan prüfen):**
   - `gasgesetze` bei 8.1 (Klassen 9/10): Die Gasgesetze selbst stehen nicht im Lehrplan; die Simulation erklärt aber den Druck eines Gases im Teilchenbild aus Teilchenstößen, wie es Inhaltsfeld 8 verlangt.
   - `lorentzkraft` bei 10.1 (Klasse 10): Inhaltsfeld 10 verlangt, Bewegungen geladener Teilchen im Magnetfeld mit der Lorentzkraft qualitativ zu beschreiben; die Simulation geht mit der e/m-Bestimmung darüber hinaus.
   - `freier-fall` bei 7.1 (Klassen 9/10): Der Lehrplan nennt Beschleunigung, aber den freien Fall erst in der Einführungsphase.
   - `schiefe-ebene` bei 7.2 und 7.3: als Kräftezerlegung mit Reibung und als einfache Maschine.
   - `licht-schatten` bei 6.1 (Klasse 7) für Sonnen- und Mondfinsternis.
   - `schiefer-wurf` bei EF-1.1: Der Lehrplan nennt nur den waagerechten Wurf; die Simulation hat ihn als Beispiel (α = 0°).
   - `doppelspalt` nur bei den Wellen (GK-1.1, LK-2.1), nicht bei den Quantenobjekten, weil die Simulation keine einzelnen Photonen zeigt.
   - `reflexion` nur bei 5.1 (Reflexionsgesetz), nicht bei 4.2 (gerichtete Reflexion in der Erprobungsstufe).
7. **Nicht abgebildet:** Kompetenzbereiche (Umgang mit Fachwissen, Erkenntnisgewinnung, Kommunikation, Bewertung) und Basiskonzepte; die Schlüsselexperimente des Grundkurses sind in die Kurzbeschreibungen eingeflossen.
