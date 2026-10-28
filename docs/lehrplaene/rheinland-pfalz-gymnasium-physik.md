# Rheinland-Pfalz · Gymnasium · Physik – Lehrplan-Aufbereitung mit Simulationszuordnung

# Teil A – Überblick

| Merkmal | Sekundarstufe I (Mittelstufe) und gymnasiale Oberstufe (Mainzer Studienstufe) |
|---|---|
| Bundesland | Rheinland-Pfalz |
| Schulart | Gymnasium, Physik in der Mittelstufe (hier 7–10) und in den Jahrgangsstufen 11–13 |
| Fach | Physik |
| Name des Lehrplans (Sek. I) | Kap. 4 „Lehrplan Physik“ aus dem Rahmenlehrplan Naturwissenschaften (Klassenstufen 5–10) mit den Themenfeldern 1–12; die gelieferte Datei ist ein Auszug (S. 91–123) ohne Titelblatt, Herausgeber und Stand. Das Fach Naturwissenschaften (Orientierungsstufe) ist nicht Teil der Datei und nicht abgebildet |
| Jahr / Stand (Sek. I) | im Auszug nicht angegeben (Entwurf, bitte am Lehrplan prüfen) |
| Name des Lehrplans (Oberstufe) | „Lehrplan Physik, Grund- und Leistungsfach in der gymnasialen Oberstufe (Mainzer Studienstufe)“, Ministerium für Bildung Rheinland-Pfalz, auf Grundlage der Bildungsstandards Physik für die Allgemeine Hochschulreife (KMK 2020) |
| Jahr / Stand (Oberstufe) | Erscheinungstermin 2022 |
| Dateien (von der Projektleitung geliefert, nicht im Repository) | `rp_physik_sek_1.pdf` (33 Seiten, S. 91–123 des Rahmenlehrplans) und `Lehrplan_Physik-Web.pdf` (80 Seiten, Oberstufe) |
| Link laut Dokument | Sek. I: keiner. Oberstufe: „www.bm.rlp.de“. In `sourceUrl` steht `https://bm.rlp.de/`; kein Link zur einzelnen Datei (Vermerk im Pull Request) |
| G8/G9 | G9: Abitur nach Jahrgangsstufe 13; Einführungsphase 11, Qualifikationsphase 12/13 |
| Niveaus / Wahl | Sek. I: Differenzierungsmöglichkeiten je Themenfeld (Grundverständnis und Vertiefung), keine getrennten Kurse. Oberstufe: Grundfach und Leistungsfach mit Pflicht- und Wahlpflichtbausteinen (GF: 3 + 1 in der Einführungsphase, 9 + 5 in der Qualifikationsphase; LF: 3 + 2 und 11 + 7) |
| Struktur | Sek. I: zwölf nummerierte Themenfelder in fester Reihenfolge über drei Lernjahre, je mit Intention, Kompetenzen, Basiskonzepten, Fachbegriffen und Differenzierung. Oberstufe: Einführungs- und Qualifikationsphase → Grund- bzw. Leistungsfach → Pflicht- und Wahlpflichtbausteine (nicht nummeriert) |

| Stufe (Lehrplan) | JSON-Jahrgang | Lernbereiche | Unterbereiche | Bereiche mit Simulation (Unterbereiche bzw. Lernbereiche ohne Unterbereiche) | zugeordnete Simulationen (verschieden) |
|---|---|---|---|---|---|
| Mittelstufe (Klassenstufen 7–10) | 7, 8, 9, 10 | 12 | 0 | 8 | 20 |
| Einführungsphase (Jahrgangsstufe 11) – Grundfach und Leistungsfach | 11 | 4 | 11 | 11 | 10 |
| Qualifikationsphase (Jahrgangsstufen 12/13) – Grundfach und Leistungsfach | 12, 13 | 4 | 65 | 35 | 17 |

Insgesamt verwendet: **36 von 36** fertigen Simulationen für Physik.

Nicht zugeordnet: keine.

# Teil B – Lehrplan im Detail

Simulationen stehen bei allen Jahrgängen einer Stufe, sofern nicht in Klammern einzelne Jahrgänge genannt sind (dann passt die Simulation nach ihren Klassenstufen nur dort).

## Mittelstufe (Klassenstufen 7–10)  
*Lower secondary (grades 7–10)*  
Jahrgangsstufe(n) im JSON: 7, 8, 9, 10  
(Quelle: Rahmenlehrplan Naturwissenschaften, Kap. 4 Lehrplan Physik, Kap. 4.3 Themenfelder 1–12, S. 99–123)

> Klassenstufen 7 bis 10 (Mittelstufe): Der Rahmenlehrplan verteilt die zwölf Themenfelder in fester Reihenfolge auf drei Lernjahre, nennt aber keine Klassenstufen. Die Lernbereiche stehen deshalb bei 7, 8, 9 und 10 gleich und werden als eine Stufe gezeigt (Annahme, Entwurf, bitte am Lehrplan prüfen). Die Themenfelder sind im Lehrplan nummeriert.

### 1 Akustische Phänomene
*EN: Acoustic phenomena*

- Kurz (DE): Schall im Basiskonzept Wechselwirkung: schwingende Körper als Schallquellen, Amplitude und Frequenz, Sender-Träger-Empfänger-Modell, Schallgeschwindigkeit und Lärmschutz; Echo und Resonanz als Vertiefung.
- Kurz (EN): Sound and interaction: vibrating bodies as sound sources, amplitude and frequency, the sender–carrier–receiver model, the speed of sound and noise protection; echo and resonance as extensions.
- Simulationen: `wellen-ausbreitung`, `resonanz`
- Jahrgänge je Simulation: `wellen-ausbreitung` (10), `resonanz` (10)

### 2 Optische Phänomene an Grenzflächen
*EN: Optical phenomena at boundaries*

- Kurz (DE): Licht im Basiskonzept Wechselwirkung: Reflexion, Brechung und Absorption, Schatten im Strahlenmodell, Strahlenverläufe auch bei Linsen; Totalreflexion als Vertiefung.
- Kurz (EN): Light and interaction: reflection, refraction and absorption, shadows in the ray model, ray paths also through lenses; total internal reflection as an extension.
- Simulationen: `licht-schatten`, `reflexion`, `brechung`, `linsen`
- Jahrgänge je Simulation: `licht-schatten` (7), `reflexion` (7, 8), `brechung`, `linsen`

### 3 Thermische Ausdehnung in Experiment und Modell
*EN: Thermal expansion in experiment and model*

- Kurz (DE): Temperatur im Basiskonzept Materie: Volumen- und Längenänderung bei Erwärmung im Experiment, Deutung mit dem Teilchenmodell und seine Grenzen; Gase und absoluter Nullpunkt als Vertiefung.
- Kurz (EN): Temperature and matter: changes in volume and length on heating in experiments, explanation with the particle model and its limits; gases and absolute zero as an extension.
- Simulationen: `teilchenmodell`, `gasgesetze`
- Jahrgänge je Simulation: `teilchenmodell` (7, 8, 9), `gasgesetze` (8, 9, 10)

### 4 Dynamische Phänomene
*EN: Dynamic phenomena*

- Kurz (DE): Bewegungsänderungen im Basiskonzept Wechselwirkung: Geschwindigkeit mit Betrag und Richtung, Trägheit, Kraft als Maß der Wechselwirkung, Kraftpfeilpaare und Kräftegleichgewicht; Impuls als Vertiefung.
- Kurz (EN): Changes of motion and interaction: velocity with magnitude and direction, inertia, force as a measure of interaction, pairs of force arrows and equilibrium; momentum as an extension.
- Simulationen: `bewegungsdiagramme`, `hookesches-gesetz`, `kraefteaddition`, `stoesse`
- Jahrgänge je Simulation: `bewegungsdiagramme`, `hookesches-gesetz`, `kraefteaddition` (8, 9, 10), `stoesse` (10)

### 5 Atombau und ionisierende Strahlung
*EN: Atomic structure and ionising radiation*

- Kurz (DE): Radioaktivität im Basiskonzept Materie: Kern-Hülle-Modell, elektrische Ladung, radioaktiver Zerfall und Halbwertszeit, Kernspaltung, Nutzen, Gefahren und Strahlenschutz.
- Kurz (EN): Radioactivity and matter: the nucleus–shell model, electric charge, radioactive decay and half-life, nuclear fission, benefits, risks and radiation protection.
- Simulationen: `radioaktiver-zerfall`
- Jahrgänge je Simulation: `radioaktiver-zerfall` (9, 10)

### 6 Spannung und Induktion
*EN: Voltage and induction*

- Kurz (DE): Elektrizität im Basiskonzept Energie: geschlossener Stromkreis, Spannung als Antrieb, Leistung und Energie (ΔE = P · Δt), Maschenregel und Generator mit Induktion.
- Kurz (EN): Electricity and energy: the closed circuit, voltage as the drive, power and energy (ΔE = P · Δt), the loop rule and the generator with induction.
- Simulationen: `einfacher-stromkreis`, `reihe-parallel`, `induktion`
- Jahrgänge je Simulation: `einfacher-stromkreis` (7, 8, 9), `reihe-parallel` (7, 8, 9), `induktion` (9, 10)

### 7 Kosmos und Forschung
*EN: Cosmos and research*

- Kurz (DE): Physik als sich weiter entwickelnde Wissenschaft: Methode der Erkenntnisgewinnung, Recherche und Präsentation zu Themen moderner Physik wie Sternen, Raumfahrt oder Exoplaneten.
- Kurz (EN): Physics as an evolving science: the scientific method, research and presentation on topics of modern physics such as stars, space travel or exoplanets.
- Simulationen: –

### 8 Wärmetransporte und ihre Beeinflussung
*EN: Heat transport and how to influence it*

- Kurz (DE): Thermische Energieströme im Basiskonzept System: Temperaturdifferenz als Antrieb, thermischer Widerstand, Kühlung und Wärmedämmung, Wärmepumpe und Wärmekraftmaschine.
- Kurz (EN): Thermal energy flows and systems: temperature difference as the drive, thermal resistance, cooling and insulation, heat pumps and heat engines.
- Simulationen: –

### 9 Gesetzmäßigkeiten im elektrischen Stromkreis
*EN: Laws of the electric circuit*

- Kurz (DE): Elektrizität im Basiskonzept System: Spannung, Stromstärke und Widerstand messen und berechnen, Knotenregel, U-I-Kennlinien, Leistung und Sicherheit im Umgang mit Strom.
- Kurz (EN): Electricity and systems: measuring and calculating voltage, current and resistance, the junction rule, I–V characteristics, power and electrical safety.
- Simulationen: `einfacher-stromkreis`, `reihe-parallel`, `ohmsches-gesetz`
- Jahrgänge je Simulation: `einfacher-stromkreis` (7, 8, 9), `reihe-parallel` (7, 8, 9), `ohmsches-gesetz` (8, 9)

### 10 Energiebilanzen und Wirkungsgrade
*EN: Energy balances and efficiency*

- Kurz (DE): Maschinen im Basiskonzept Energie: Energieerhaltung, Energieflussdiagramme, ΔE = P · Δt = F · Δs, Wirkungsgrad und einfache Maschinen wie lose Rolle und Flaschenzug.
- Kurz (EN): Machines and energy: conservation of energy, energy flow diagrams, ΔE = P · Δt = F · Δs, efficiency and simple machines such as pulleys and block and tackle.
- Simulationen: `energieerhaltung`, `hebelgesetz`, `schiefe-ebene`
- Jahrgänge je Simulation: `energieerhaltung`, `hebelgesetz`, `schiefe-ebene` (8, 9, 10)

### 11 Sensoren im Alltag
*EN: Sensors in everyday life*

- Kurz (DE): Physikalische Grundprinzipien alltäglicher Technik: wie Sensoren und Signalwandler mit bekannten Wechselwirkungen Messgrößen in elektrische Signale umwandeln, etwa Mikrofon, CCD oder NTC.
- Kurz (EN): Basic physics of everyday technology: how sensors and transducers use known interactions to turn quantities into electrical signals, for example microphone, CCD or thermistor.
- Simulationen: –

### 12 Praxis und Forschung
*EN: Practice and research*

- Kurz (DE): Selbstständig und fragengeleitet experimentieren: Hypothesen aufstellen, Experimente planen, durchführen und auswerten, mit Inhalten aus früheren oder neuen Themenfeldern.
- Kurz (EN): Independent, question-led experimenting: forming hypotheses, planning, carrying out and evaluating experiments, with content from earlier or new topic fields.
- Simulationen: –

## Einführungsphase (Jahrgangsstufe 11) – Grundfach und Leistungsfach  
*Introductory phase (grade 11) – basic and advanced course*  
Jahrgangsstufe(n) im JSON: 11  
(Quelle: Lehrplan Physik Grund- und Leistungsfach (2022), Kap. 4.3, S. 24–26, und Kap. 5.3, S. 51–54)

> Einführungsphase der Mainzer Studienstufe (Jahrgangsstufe 11). Lernbereiche sind die Pflicht- und Wahlpflichtbausteine; im Grundfach (GF) ist einer, im Leistungsfach (LF) sind zwei der Wahlpflichtbausteine zu wählen. Der Lehrplan nummeriert die Bausteine nicht; die Nummern sind von uns vergeben.

### GF-P Pflichtbausteine (Grundfach)
*EN: Compulsory modules (basic course)*

- Kurz (DE): Kinematik, Dynamik und Erhaltungsgrößen der Mechanik.
- Kurz (EN): Kinematics, dynamics and conserved quantities in mechanics.
- Simulationen: `bewegungsdiagramme`, `freier-fall`, `kreisbewegung`, `kraefteaddition`, `energieerhaltung`, `stoesse`
- Unterbereiche:
  - GF-P.1 Kinematik · *Kinematics* – Kurz: Ort, Zeit, Geschwindigkeit und Beschleunigung; gleichförmige und gleichmäßig beschleunigte lineare Bewegung sowie gleichförmige Kreisbewegung, in Diagrammen dargestellt. · *EN: Position, time, velocity and acceleration; uniform and uniformly accelerated linear motion and uniform circular motion, shown in graphs.* – Simulationen: `bewegungsdiagramme`, `freier-fall`, `kreisbewegung`
  - GF-P.2 Dynamik · *Dynamics* – Kurz: Ursachen für Bewegungsänderungen, Wechselwirkungsprinzip und Trägheit, mit Impuls- oder Kraftbegriff. · *EN: Causes of changes in motion, the interaction principle and inertia, using momentum or force.* – Simulationen: `kraefteaddition`, `kreisbewegung`
  - GF-P.3 Erhaltungsgrößen der Mechanik · *Conserved quantities in mechanics* – Kurz: Energie- und Impulserhaltung als Methode des Bilanzierens, Reibung bei realen Vorgängen und die vektorielle Betrachtung des Impulses. · *EN: Conservation of energy and momentum as a method of balancing, friction in real processes and the vector nature of momentum.* – Simulationen: `energieerhaltung`, `stoesse`

### GF-W Wahlpflichtbausteine (Grundfach, einer zu wählen)
*EN: Elective modules (basic course, choose one)*

- Kurz (DE): Wurfbewegungen oder Gravitation.
- Kurz (EN): Projectile motion or gravitation.
- Simulationen: `schiefer-wurf`, `freier-fall`, `planetenbahnen`, `kreisbewegung`
- Unterbereiche:
  - GF-W.1 Wurfbewegungen · *Projectile motion* – Kurz: Superpositionsprinzip, senkrechter und waagerechter Wurf. · *EN: The superposition principle, vertical and horizontal projection.* – Simulationen: `schiefer-wurf`, `freier-fall`
  - GF-W.2 Gravitation · *Gravitation* – Kurz: Gravitationsgesetz und Satellitenbewegung. · *EN: The law of gravitation and satellite motion.* – Simulationen: `planetenbahnen`, `kreisbewegung`

### LF-P Pflichtbausteine (Leistungsfach)
*EN: Compulsory modules (advanced course)*

- Kurz (DE): Kinematik mit Fehlerbetrachtung, Dynamik und Erhaltungsgrößen der Mechanik.
- Kurz (EN): Kinematics with error analysis, dynamics and conserved quantities in mechanics.
- Simulationen: `bewegungsdiagramme`, `freier-fall`, `kreisbewegung`, `kraefteaddition`, `schiefe-ebene`, `energieerhaltung`, `stoesse`
- Unterbereiche:
  - LF-P.1 Kinematik · *Kinematics* – Kurz: Beschreibende Größen einer Bewegung und ihre funktionalen Zusammenhänge, idealisierte Bewegungsformen, Analyse einer realen Bewegung und Fehlerbetrachtung. · *EN: Quantities describing motion and their functional relations, idealised forms of motion, analysing a real motion and error analysis.* – Simulationen: `bewegungsdiagramme`, `freier-fall`, `kreisbewegung`
  - LF-P.2 Dynamik · *Dynamics* – Kurz: Ursachen für Bewegungsänderungen, Wechselwirkungsprinzip und Trägheit, ausgebaut zum Wechselwirkungskonzept. · *EN: Causes of changes in motion, the interaction principle and inertia, built up into the concept of interaction.* – Simulationen: `kraefteaddition`, `schiefe-ebene`, `kreisbewegung`
  - LF-P.3 Erhaltungsgrößen der Mechanik · *Conserved quantities in mechanics* – Kurz: Energie- und Impulserhaltung bilanzieren, Reibung und vektorielle Behandlung des Impulses. · *EN: Balancing energy and momentum, friction and the vector treatment of momentum.* – Simulationen: `energieerhaltung`, `stoesse`

### LF-W Wahlpflichtbausteine (Leistungsfach, zwei zu wählen)
*EN: Elective modules (advanced course, choose two)*

- Kurz (DE): Wurfbewegungen, Gravitation oder Rotation starrer Körper.
- Kurz (EN): Projectile motion, gravitation or rotation of rigid bodies.
- Simulationen: `schiefer-wurf`, `freier-fall`, `planetenbahnen`, `kreisbewegung`, `hebelgesetz`
- Unterbereiche:
  - LF-W.1 Wurfbewegungen · *Projectile motion* – Kurz: Superpositionsprinzip, senkrechter, waagerechter und schiefer Wurf. · *EN: The superposition principle, vertical, horizontal and oblique projection.* – Simulationen: `schiefer-wurf`, `freier-fall`
  - LF-W.2 Gravitation · *Gravitation* – Kurz: Gravitationsgesetz, Satellitenbewegung, Energie im Gravitationsfeld und Fluchtgeschwindigkeit. · *EN: The law of gravitation, satellite motion, energy in the gravitational field and escape velocity.* – Simulationen: `planetenbahnen`, `kreisbewegung`
  - LF-W.3 Rotation starrer Körper · *Rotation of rigid bodies* – Kurz: Trägheitsmoment, Drehimpuls, Drehmoment und Rotationsenergie in Analogie zur Translation. · *EN: Moment of inertia, angular momentum, torque and rotational energy by analogy with translation.* – Simulationen: `hebelgesetz`

## Qualifikationsphase (Jahrgangsstufen 12/13) – Grundfach und Leistungsfach  
*Qualification phase (grades 12/13) – basic and advanced course*  
Jahrgangsstufe(n) im JSON: 12, 13  
(Quelle: Lehrplan Physik Grund- und Leistungsfach (2022), Kap. 4.4, S. 27–46, und Kap. 5.4, S. 55–75)

> Qualifikationsphase der Mainzer Studienstufe (Jahrgangsstufen 12 und 13). Der Lehrplan gibt keine Reihenfolge vor; die Lernbereiche stehen deshalb bei 12 und 13 gleich und werden als eine Stufe gezeigt. Im Grundfach (GF) sind alle neun Pflichtbausteine und fünf Wahlpflichtbausteine, im Leistungsfach (LF) alle elf Pflichtbausteine und sieben Wahlpflichtbausteine zu behandeln. Die Nummern sind von uns vergeben.

### GF-P Pflichtbausteine (Grundfach)
*EN: Compulsory modules (basic course)*

- Kurz (DE): Elektrische und magnetische Felder, Induktion, Schwingungen und Wellen sowie Quantenobjekte und Atomvorstellung.
- Kurz (EN): Electric and magnetic fields, induction, oscillations and waves, and quantum objects and the atom.
- Simulationen: `feldlinien`, `kondensator`, `lorentzkraft`, `induktion`, `fadenpendel`, `federpendel`, `wellen-ausbreitung`, `stehende-wellen`, `interferenz`, `doppelspalt`, `photoeffekt`, `elektronenbeugung`, `linienspektren`
- Unterbereiche:
  - GF-P.1 Feldkonzept für statische elektrische und magnetische Felder · *Field concept for static electric and magnetic fields* – Kurz: Eigenschaften statischer Felder, Feldlinienbilder, Superposition von Feldern, elektrische Feldstärke, magnetische Flussdichte und das Magnetfeld einer Spule. · *EN: Properties of static fields, field line patterns, superposition of fields, electric field strength, magnetic flux density and the field of a coil.* – Simulationen: `feldlinien` (12)
  - GF-P.2 Energie und Energiespeicherung im elektrischen Feld · *Energy and energy storage in the electric field* – Kurz: Spannung und Feldstärke im Plattenkondensator, Kapazität, Energie des Feldes sowie Auf- und Entladen des Kondensators. · *EN: Voltage and field strength in a parallel-plate capacitor, capacitance, field energy and charging and discharging the capacitor.* – Simulationen: `kondensator` (12)
  - GF-P.3 Wechselwirkung von geladenen Körpern mit statischen Feldern · *Interaction of charged bodies with static fields* – Kurz: Kraft auf Ladungen im elektrischen Feld, Bewegung im Längs- und Querfeld, Lorentzkraft und Bewegung im homogenen Magnetfeld. · *EN: Force on charges in an electric field, motion in longitudinal and transverse fields, the Lorentz force and motion in a uniform magnetic field.* – Simulationen: `lorentzkraft`
  - GF-P.4 Veränderliche elektromagnetische Felder · *Changing electromagnetic fields* – Kurz: Magnetischer Fluss, Induktionsgesetz mit mittlerer Änderungsrate, Richtung des Induktionsstroms und eine technische Anwendung. · *EN: Magnetic flux, the law of induction with the average rate of change, the direction of the induced current and a technical application.* – Simulationen: `induktion`
  - GF-P.5 Harmonische Schwingungen · *Harmonic oscillations* – Kurz: Elongation, Amplitude, Periodendauer und Frequenz, Schwingkreis in Analogie zum mechanischen Oszillator, Periodendauer an einem Beispiel. · *EN: Displacement, amplitude, period and frequency, the LC circuit by analogy with the mechanical oscillator, period of oscillation in one example.* – Simulationen: `fadenpendel` (12), `federpendel` (12)
  - GF-P.6 Harmonische Wellen · *Harmonic waves* – Kurz: Erzeugung, Ausbreitung und Energietransport, Wellenlänge, Geschwindigkeit und Frequenz, transversal und longitudinal, Polarisation, Brechung, Reflexion und Beugung. · *EN: Generation, propagation and energy transport, wavelength, speed and frequency, transverse and longitudinal, polarisation, refraction, reflection and diffraction.* – Simulationen: `wellen-ausbreitung` (12)
  - GF-P.7 Superposition von Wellen · *Superposition of waves* – Kurz: Stehende Wellen und Wellenlängenbestimmung, Interferenz am Doppelspalt, Spektrum weißen Lichts und Überblick über elektromagnetische Wellen. · *EN: Standing waves and measuring wavelength, double-slit interference, the spectrum of white light and an overview of electromagnetic waves.* – Simulationen: `stehende-wellen`, `interferenz`, `doppelspalt`
  - GF-P.8 Quantenobjekte I · *Quantum objects I* – Kurz: Elektronen und Photonen am Doppelspalt, Energie und Frequenz, Impuls und Wellenlänge, Grundaspekte der Quantentheorie und ein Näherungswert für h. · *EN: Electrons and photons at the double slit, energy and frequency, momentum and wavelength, basic aspects of quantum theory and an estimate of h.* – Simulationen: `photoeffekt`, `elektronenbeugung`
  - GF-P.9 Quantenmechanische Atomvorstellung I · *Quantum view of the atom I* – Kurz: Quantisierte Absorption und Emission am Wasserstoffatom, Energiestufenmodell und Orbitalmodell. · *EN: Quantised absorption and emission in the hydrogen atom, the energy level model and the orbital model.* – Simulationen: `linienspektren`

### GF-W Wahlpflichtbausteine (Grundfach, fünf zu wählen)
*EN: Elective modules (basic course, choose five)*

- Kurz (DE): Vertiefungen und Erweiterungen von Teilchen in Feldern bis zur Kosmologie, dazu ein individuelles Thema.
- Kurz (EN): Extensions from particles in fields to cosmology, plus an individual topic.
- Simulationen: `lorentzkraft`, `resonanz`, `wellen-ausbreitung`, `stehende-wellen`, `interferenz`, `doppelspalt`, `elektronenbeugung`, `photoeffekt`, `linienspektren`, `radioaktiver-zerfall`, `gasgesetze`
- Unterbereiche:
  - GF-W.1 Anwendungsbeispiele für Teilchen in Feldern · *Applications of particles in fields* – Kurz: Fadenstrahlrohr zur Bestimmung von e/m, Elektronenablenkröhre, Teilchenbeschleuniger, Hall-Effekt. · *EN: Fine-beam tube for e/m, electron deflection tube, particle accelerators, Hall effect.* – Simulationen: `lorentzkraft`
  - GF-W.2 Schwingungsphänomene · *Oscillation phenomena* – Kurz: Gedämpfte, erzwungene und gekoppelte Schwingungen und Resonanz. · *EN: Damped, forced and coupled oscillations and resonance.* – Simulationen: `resonanz`
  - GF-W.3 Akustik · *Acoustics* – Kurz: Schall als Longitudinalwelle, Schwebung, stehende Wellen und Resonanz, Fourieranalyse von Klängen. · *EN: Sound as a longitudinal wave, beats, standing waves and resonance, Fourier analysis of sounds.* – Simulationen: `wellen-ausbreitung` (12), `stehende-wellen`
  - GF-W.4 Licht als Wellenphänomen · *Light as a wave phenomenon* – Kurz: Interferenz und Polarisation in Natur und Technik. · *EN: Interference and polarisation in nature and technology.* – Simulationen: `interferenz`, `doppelspalt`
  - GF-W.5 Elektromagnetische Wellen · *Electromagnetic waves* – Kurz: Rückkopplung, offener Schwingkreis, Ausbreitung und Modulation, Anwendungen und Spektrum. · *EN: Feedback, the open oscillating circuit, propagation and modulation, applications and the spectrum.* – Simulationen: –
  - GF-W.6 Wechselstromkreise · *AC circuits* – Kurz: Effektivwerte, Impedanz und Phasenverschiebung, Wirk- und Blindleistung. · *EN: RMS values, impedance and phase shift, real and reactive power.* – Simulationen: –
  - GF-W.7 Elektronik · *Electronics* – Kurz: Grundschaltungen, Eigen- und Störstellenleitung, Diode und Transistor. · *EN: Basic circuits, intrinsic and extrinsic conduction, diode and transistor.* – Simulationen: –
  - GF-W.8 Festkörperphysik · *Solid-state physics* – Kurz: Bändermodell und Eigenschaften von Festkörpern. · *EN: The band model and properties of solids.* – Simulationen: –
  - GF-W.9 Quantenobjekte II · *Quantum objects II* – Kurz: Deutungen der Quantentheorie, Unbestimmtheitsrelation und experimentelle Belege wie Elektronenbeugung und Hallwachs-Effekt. · *EN: Interpretations of quantum theory, the uncertainty principle and experimental evidence such as electron diffraction and the Hallwachs effect.* – Simulationen: `elektronenbeugung`, `photoeffekt`
  - GF-W.10 Quantenmechanische Atomvorstellung II · *Quantum view of the atom II* – Kurz: Franck-Hertz-Versuch, Resonanzabsorption, Lumineszenz, Laser und Spektralanalyse. · *EN: The Franck–Hertz experiment, resonance absorption, luminescence, lasers and spectral analysis.* – Simulationen: `linienspektren`
  - GF-W.11 Kernphysik · *Nuclear physics* – Kurz: Radionuklide, Zerfall, Spaltung und Fusion, Absorptions- und Zerfallsgesetz, Bindungsenergie. · *EN: Radionuclides, decay, fission and fusion, the laws of absorption and decay, binding energy.* – Simulationen: `radioaktiver-zerfall`
  - GF-W.12 Strahlenbiophysik · *Radiation biophysics* – Kurz: Dosis, biologische Wirkung, Strahlenschutz und medizinische Anwendungen. · *EN: Dose, biological effects, radiation protection and medical uses.* – Simulationen: –
  - GF-W.13 Elementarteilchenphysik · *Particle physics* – Kurz: Fundamentalteilchen und Wechselwirkungen, Standardmodell und offene Fragen. · *EN: Fundamental particles and interactions, the Standard Model and open questions.* – Simulationen: –
  - GF-W.14 Entropie · *Entropy* – Kurz: Entropie als Energieträger, Entropieerzeugung und Carnot-Wirkungsgrad. · *EN: Entropy as an energy carrier, entropy production and Carnot efficiency.* – Simulationen: –
  - GF-W.15 Thermodynamische Maschinen · *Thermodynamic machines* – Kurz: Gesetze des idealen Gases, Wärmepumpe und Stirlingmotor, Carnot-Wirkungsgrad. · *EN: Ideal gas laws, heat pump and Stirling engine, Carnot efficiency.* – Simulationen: `gasgesetze`
  - GF-W.16 Energiebereitstellung · *Energy supply* – Kurz: Grundprinzip und Vergleich von Techniken der Energiebereitstellung, Nachhaltigkeit. · *EN: Basic principle and comparison of energy supply technologies, sustainability.* – Simulationen: –
  - GF-W.17 Relativistische Kinematik · *Relativistic kinematics* – Kurz: Relativität der Gleichzeitigkeit, Zeitdilatation und Längenkontraktion, Raum-Zeit-Diagramme. · *EN: Relativity of simultaneity, time dilation and length contraction, spacetime diagrams.* – Simulationen: –
  - GF-W.18 Relativistische Dynamik · *Relativistic dynamics* – Kurz: Masse-Energie-Äquivalenz, Grenzgeschwindigkeit und Zeit im Gravitationsfeld. · *EN: Mass–energy equivalence, the speed limit and time in a gravitational field.* – Simulationen: –
  - GF-W.19 Astrophysik · *Astrophysics* – Kurz: Zustandsgrößen der Sonne, Sternentwicklung und Standardsonnenmodell. · *EN: Properties of the Sun, stellar evolution and the standard solar model.* – Simulationen: –
  - GF-W.20 Kosmologie · *Cosmology* – Kurz: Struktur und Entwicklung des Universums, Urknall und Hintergrundstrahlung. · *EN: Structure and evolution of the universe, the Big Bang and background radiation.* – Simulationen: –
  - GF-W.21 Chaos und Fraktale – Nichtlineare dynamische Systeme · *Chaos and fractals – non-linear dynamical systems* – Kurz: Chaosphänomene, Merkmale chaotischer Systeme und fraktale Strukturen. · *EN: Chaotic phenomena, features of chaotic systems and fractal structures.* – Simulationen: –
  - GF-W.22 Strömungsphysik · *Fluid dynamics* – Kurz: Strömungsarten, Kontinuitätsgleichung, Bernoulli-Gleichung und dynamischer Auftrieb. · *EN: Types of flow, the continuity equation, Bernoulli’s equation and dynamic lift.* – Simulationen: –
  - GF-W.23 Physik als sich weiterentwickelnde Wissenschaft · *Physics as an evolving science* – Kurz: Wissenschaftliche Revolutionen und physikalische Arbeitsweisen im historischen und gesellschaftlichen Zusammenhang. · *EN: Scientific revolutions and ways of working in physics in their historical and social context.* – Simulationen: –
  - GF-W.24 Individuelles Thema · *Individual topic* – Kurz: Frei gewählte Inhalte, vor allem zur Bewertungskompetenz, etwa Nachhaltigkeit oder Klimawandel. · *EN: Freely chosen content, mainly for evaluation skills, for example sustainability or climate change.* – Simulationen: –

### LF-P Pflichtbausteine (Leistungsfach)
*EN: Compulsory modules (advanced course)*

- Kurz (DE): Felder mit Energiespeicherung in Kondensator und Spule, Induktion, Schwingungen und Wellen, Quantenphysik, Atom- und Kernphysik sowie Energie und Entropie.
- Kurz (EN): Fields with energy storage in capacitor and coil, induction, oscillations and waves, quantum physics, atomic and nuclear physics, and energy and entropy.
- Simulationen: `feldlinien`, `kondensator`, `lorentzkraft`, `induktion`, `fadenpendel`, `federpendel`, `resonanz`, `wellen-ausbreitung`, `stehende-wellen`, `interferenz`, `doppelspalt`, `photoeffekt`, `elektronenbeugung`, `linienspektren`, `radioaktiver-zerfall`, `gasgesetze`
- Unterbereiche:
  - LF-P.1 Feldkonzept für statische elektrische und magnetische Felder · *Field concept for static electric and magnetic fields* – Kurz: Wie im Grundfach, zusätzlich Influenz und Polarisation, Magnetisierung und Coulomb-Gesetz. · *EN: As in the basic course, plus induction of charge and polarisation, magnetisation and Coulomb’s law.* – Simulationen: `feldlinien` (12)
  - LF-P.2 Energie und Energiespeicherung im elektrischen und magnetischen Feld · *Energy and energy storage in electric and magnetic fields* – Kurz: Potential und Spannung, Kondensator mit Kapazität, Energie und Auf- und Entladung; Spule mit Flussdichte, Induktivität und Feldenergie. · *EN: Potential and voltage, the capacitor with capacitance, energy and charging and discharging; the coil with flux density, inductance and field energy.* – Simulationen: `kondensator` (12)
  - LF-P.3 Wechselwirkung von geladenen Körpern mit statischen Feldern · *Interaction of charged bodies with static fields* – Kurz: Wie im Grundfach, zusätzlich Hall-Effekt, Kreisbahnen im Magnetfeld (quantitativ) und gekreuzte Felder. · *EN: As in the basic course, plus the Hall effect, circular paths in a magnetic field (quantitative) and crossed fields.* – Simulationen: `lorentzkraft`
  - LF-P.4 Veränderliche elektromagnetische Felder I · *Changing electromagnetic fields I* – Kurz: Induktionsgesetz auch in differentieller Form, Richtung des Induktionsstroms, Selbstinduktion und Ein- und Ausschaltvorgänge an der Spule. · *EN: The law of induction also in differential form, direction of the induced current, self-induction and switching a coil on and off.* – Simulationen: `induktion`
  - LF-P.5 Harmonische Schwingungen · *Harmonic oscillations* – Kurz: Kenngrößen der Schwingung, Schwingkreis, lineares Kraftgesetz, Fadenpendel mit Kleinwinkelnäherung und Herleitung der Schwingungsdauer. · *EN: Parameters of oscillation, the LC circuit, the linear force law, the simple pendulum with the small-angle approximation and deriving the period.* – Simulationen: `fadenpendel` (12), `federpendel` (12)
  - LF-P.6 Schwingungen und Wellen · *Oscillations and waves* – Kurz: Gedämpfte, erzwungene und gekoppelte Schwingungen mit Resonanz; Erzeugung, Größen und mathematische Beschreibung harmonischer Wellen. · *EN: Damped, forced and coupled oscillations with resonance; generation, quantities and mathematical description of harmonic waves.* – Simulationen: `resonanz`, `wellen-ausbreitung` (12)
  - LF-P.7 Harmonische Wellen und ihre Superposition · *Harmonic waves and their superposition* – Kurz: Brechung, Reflexion und Beugung, stehende Wellen, Interferenz an Doppelspalt und Einzelspalt, Wellenlängenbestimmung und Interferometer. · *EN: Refraction, reflection and diffraction, standing waves, interference at double and single slits, measuring wavelength and the interferometer.* – Simulationen: `stehende-wellen`, `interferenz`, `doppelspalt`
  - LF-P.8 Quantenobjekte I · *Quantum objects I* – Kurz: Wie im Grundfach, zusätzlich Delayed-Choice-Experiment, Koinzidenzmethode, stochastische Deutung mit |Ψ|² und Ort-Impuls-Unbestimmtheit. · *EN: As in the basic course, plus the delayed-choice experiment, the coincidence method, the probabilistic interpretation with |Ψ|² and position–momentum uncertainty.* – Simulationen: `photoeffekt`, `elektronenbeugung`
  - LF-P.9 Quantenmechanische Atomvorstellung I · *Quantum view of the atom I* – Kurz: Quantisierte Absorption und Emission, Röntgenspektrum, Energiestufenmodell, Potentialtopf, Orbitalmodell und Ausblick auf Mehrelektronensysteme. · *EN: Quantised absorption and emission, the X-ray spectrum, the energy level model, the potential well, the orbital model and an outlook on many-electron systems.* – Simulationen: `linienspektren`
  - LF-P.10 Kernphysik · *Nuclear physics* – Kurz: Kernmodell, Bindungsenergie, Zerfall, Spaltung und Fusion, Absorptions- und Zerfallsgesetz und quantenmechanische Bezüge. · *EN: Nuclear model, binding energy, decay, fission and fusion, the laws of absorption and decay and links to quantum mechanics.* – Simulationen: `radioaktiver-zerfall`
  - LF-P.11 Energie und Entropie · *Energy and entropy* – Kurz: Energieströme und Energieträger, Entropie, Entropieerzeugung, thermodynamische Maschinen und Carnot-Wirkungsgrad. · *EN: Energy flows and carriers, entropy, entropy production, thermodynamic machines and Carnot efficiency.* – Simulationen: `gasgesetze`

### LF-W Wahlpflichtbausteine (Leistungsfach, sieben zu wählen)
*EN: Elective modules (advanced course, choose seven)*

- Kurz (DE): Vertiefungen und Erweiterungen von Teilchen in Feldern bis zur Kosmologie, dazu ein individuelles Thema.
- Kurz (EN): Extensions from particles in fields to cosmology, plus an individual topic.
- Simulationen: `lorentzkraft`, `doppler-effekt`, `wellen-ausbreitung`, `stehende-wellen`, `interferenz`, `doppelspalt`, `elektronenbeugung`, `photoeffekt`, `linienspektren`, `radioaktiver-zerfall`
- Unterbereiche:
  - LF-W.1 Anwendungsbeispiele für Teilchen in Feldern · *Applications of particles in fields* – Kurz: Fadenstrahlrohr, Elektronenablenkröhre, Teilchenbeschleuniger, Massenspektrometer und MHD-Generator. · *EN: Fine-beam tube, electron deflection tube, particle accelerators, mass spectrometer and MHD generator.* – Simulationen: `lorentzkraft`
  - LF-W.2 Veränderliche elektromagnetische Felder II · *Changing electromagnetic fields II* – Kurz: Maxwell-Gleichungen, Felder und Bezugssysteme, Lorentz-Transformation. · *EN: Maxwell’s equations, fields and frames of reference, the Lorentz transformation.* – Simulationen: –
  - LF-W.3 Akustik · *Acoustics* – Kurz: Schall als Longitudinalwelle, Dopplereffekt, Schwebung, stehende Wellen und Resonanz, Fourieranalyse. · *EN: Sound as a longitudinal wave, the Doppler effect, beats, standing waves and resonance, Fourier analysis.* – Simulationen: `doppler-effekt` (12), `wellen-ausbreitung` (12), `stehende-wellen`
  - LF-W.4 Licht als Wellenphänomen · *Light as a wave phenomenon* – Kurz: Interferenz und Polarisation in Natur und Technik. · *EN: Interference and polarisation in nature and technology.* – Simulationen: `interferenz`, `doppelspalt`
  - LF-W.5 Elektromagnetische Wellen · *Electromagnetic waves* – Kurz: Rückkopplung, offener Schwingkreis, Ausbreitung und Modulation, Anwendungen und Spektrum. · *EN: Feedback, the open oscillating circuit, propagation and modulation, applications and the spectrum.* – Simulationen: –
  - LF-W.6 Wechselstromkreise · *AC circuits* – Kurz: Effektivwerte, Impedanz und Phasenverschiebung, Wirk- und Blindleistung. · *EN: RMS values, impedance and phase shift, real and reactive power.* – Simulationen: –
  - LF-W.7 Elektronik · *Electronics* – Kurz: Grundschaltungen, Eigen- und Störstellenleitung, Diode und Transistor. · *EN: Basic circuits, intrinsic and extrinsic conduction, diode and transistor.* – Simulationen: –
  - LF-W.8 Festkörperphysik · *Solid-state physics* – Kurz: Bändermodell und Eigenschaften von Festkörpern. · *EN: The band model and properties of solids.* – Simulationen: –
  - LF-W.9 Quantenobjekte II · *Quantum objects II* – Kurz: Deutungen der Quantentheorie und experimentelle Belege wie Elektronenbeugung und Hallwachs-Effekt. · *EN: Interpretations of quantum theory and experimental evidence such as electron diffraction and the Hallwachs effect.* – Simulationen: `elektronenbeugung`, `photoeffekt`
  - LF-W.10 Wechselwirkung von Quantenobjekten · *Interaction of quantum objects* – Kurz: Compton- und Hallwachs-Effekt, Paarerzeugung, Elektronenbeugung, Bragg-Reflexion und Entstehung der Röntgenstrahlung. · *EN: Compton and Hallwachs effects, pair production, electron diffraction, Bragg reflection and how X-rays arise.* – Simulationen: `photoeffekt`, `elektronenbeugung`
  - LF-W.11 Quantenmechanische Atomvorstellung II · *Quantum view of the atom II* – Kurz: Franck-Hertz-Versuch, Resonanzabsorption, Lumineszenz, Laser und Spektralanalyse. · *EN: The Franck–Hertz experiment, resonance absorption, luminescence, lasers and spectral analysis.* – Simulationen: `linienspektren`
  - LF-W.12 Strahlenbiophysik · *Radiation biophysics* – Kurz: Dosis, biologische Wirkung, Strahlenschutz, Dosis-Effekt-Kurven und medizinische Anwendungen. · *EN: Dose, biological effects, radiation protection, dose–effect curves and medical uses.* – Simulationen: `radioaktiver-zerfall`
  - LF-W.13 Elementarteilchenphysik · *Particle physics* – Kurz: Standardmodell, fundamentale Wechselwirkungen, experimentelle Befunde und offene Fragen. · *EN: The Standard Model, fundamental interactions, experimental findings and open questions.* – Simulationen: –
  - LF-W.14 Energiebereitstellung · *Energy supply* – Kurz: Grundprinzip und Vergleich von Techniken der Energiebereitstellung, Nachhaltigkeit. · *EN: Basic principle and comparison of energy supply technologies, sustainability.* – Simulationen: –
  - LF-W.15 Relativistische Kinematik · *Relativistic kinematics* – Kurz: Relativität der Gleichzeitigkeit, Zeitdilatation und Längenkontraktion, Raum-Zeit-Diagramme. · *EN: Relativity of simultaneity, time dilation and length contraction, spacetime diagrams.* – Simulationen: –
  - LF-W.16 Relativistische Dynamik · *Relativistic dynamics* – Kurz: Masse-Energie-Äquivalenz, Grenzgeschwindigkeit und Zeit im Gravitationsfeld. · *EN: Mass–energy equivalence, the speed limit and time in a gravitational field.* – Simulationen: –
  - LF-W.17 Astrophysik · *Astrophysics* – Kurz: Zustandsgrößen der Sonne, Sternentwicklung und Standardsonnenmodell. · *EN: Properties of the Sun, stellar evolution and the standard solar model.* – Simulationen: –
  - LF-W.18 Kosmologie · *Cosmology* – Kurz: Struktur und Entwicklung des Universums, Urknall und Hintergrundstrahlung. · *EN: Structure and evolution of the universe, the Big Bang and background radiation.* – Simulationen: –
  - LF-W.19 Chaos und Fraktale – Nichtlineare dynamische Systeme · *Chaos and fractals – non-linear dynamical systems* – Kurz: Chaosphänomene, Merkmale chaotischer Systeme und fraktale Strukturen. · *EN: Chaotic phenomena, features of chaotic systems and fractal structures.* – Simulationen: –
  - LF-W.20 Strömungsphysik · *Fluid dynamics* – Kurz: Strömungsarten, Kontinuitätsgleichung, Bernoulli-Gleichung und dynamischer Auftrieb. · *EN: Types of flow, the continuity equation, Bernoulli’s equation and dynamic lift.* – Simulationen: –
  - LF-W.21 Individuelles Thema · *Individual topic* – Kurz: Frei gewählte Inhalte, vor allem zur Bewertungskompetenz, etwa Nachhaltigkeit oder Klimawandel. · *EN: Freely chosen content, mainly for evaluation skills, for example sustainability or climate change.* – Simulationen: –

# Teil C – JSON

Die vollständige JSON-Datei liegt separat bei: `rheinland-pfalz-gymnasium-physik.json` (erzeugt aus `src/curriculum/lehrplaene/rheinland-pfalz-gymnasium-physik.ts`, dieselben Daten).

# Teil D – Lücken und Vorschläge

## D.1 Nicht zugeordnete Simulationen (Ausnahmen in `NOT_IN_CURRICULUM`)

Keine. Alle 36 fertigen Simulationen stehen bei mindestens einem Jahrgang.

## D.2 Lern- und Unterbereiche ohne passende Simulation

- **7–10:** 7 Kosmos und Forschung (Recherche und Präsentation), 8 Wärmetransporte und ihre Beeinflussung, 11 Sensoren im Alltag, 12 Praxis und Forschung (selbstständiges Experimentieren)
- **12/13, Wahlpflichtbausteine Grundfach:** Elektromagnetische Wellen, Wechselstromkreise, Elektronik, Festkörperphysik, Strahlenbiophysik, Elementarteilchenphysik, Entropie, Energiebereitstellung, Relativistische Kinematik und Dynamik, Astrophysik, Kosmologie, Chaos und Fraktale, Strömungsphysik, Physik als sich weiterentwickelnde Wissenschaft, Individuelles Thema
- **12/13, Wahlpflichtbausteine Leistungsfach:** Veränderliche elektromagnetische Felder II, Elektromagnetische Wellen, Wechselstromkreise, Elektronik, Festkörperphysik, Elementarteilchenphysik, Energiebereitstellung, Relativistische Kinematik und Dynamik, Astrophysik, Kosmologie, Chaos und Fraktale, Strömungsphysik, Individuelles Thema

Alle Pflichtbausteine haben mindestens eine Simulation.

## D.3 Vorschläge für neue Simulationen

| Vorschlag (Titel) | Idee | schließt Lücke in |
|---|---|---|
| Wärmedämmung im Modell | Wandaufbau aus Schichten wählen, Temperaturdifferenz und Dicke ändern, Wärmestrom und Temperaturverlauf ablesen | 7–10 TF 8 |
| Wechselstrom mit Spule und Kondensator | Frequenz ändern, Strom und Spannung als Zeiger und Kurven, Phasenverschiebung und Impedanz | Wechselstromkreise (GF, LF) |
| Zeitdilatation mit der Lichtuhr | Lichtuhr im bewegten System, Geschwindigkeit regeln, Zeitdilatation und Raum-Zeit-Diagramm | Relativistische Kinematik (GF, LF) |

# Teil E – Einordnung und Unklarheiten

1. **Zwei Lehrpläne, G9.** Für die Mittelstufe gilt der Physikteil des Rahmenlehrplans Naturwissenschaften (Themenfelder 1–12), für die Mainzer Studienstufe der Lehrplan Physik Grund- und Leistungsfach von 2022. Abitur nach Jahrgangsstufe 13.
2. **Sek. I als Stufe 7–10 (Annahme, Entwurf, bitte am Lehrplan prüfen).** Der gelieferte Auszug verteilt die zwölf Themenfelder in fester Reihenfolge auf ein erstes, zweites und drittes Lernjahr, nennt aber keine Klassenstufen. Er gilt für mehrere Schularten; der Text erwähnt Lernende, die nach Klasse 9 abgehen, und dass diese das zweite Lernjahr noch erreichen. Deshalb stehen die Themenfelder wie in Nordrhein-Westfalen bei 7, 8, 9 und 10 gleich und werden als eine Stufe „7–10“ gezeigt. Laut Übersichtstabelle gehören die Themenfelder 1–4 zum ersten und 5–7 zum zweiten Lernjahr; im dritten liegen nach dem Text 9–12, Themenfeld 8 ist in der Tabelle nicht eindeutig zuzuordnen. Bitte prüfen, ob am Gymnasium eine feste Zuordnung der Lernjahre zu Klassenstufen gilt; dann ließe sich die Stufe aufteilen.
3. **Auszug ohne Titelblatt.** Die Sek.-I-Datei beginnt mit Kap. 4.1 (S. 91) und endet mit Themenfeld 12 (S. 123). Titel, Herausgeber und Stand des Rahmenlehrplans stehen nicht darin; die Verweise auf S. 192 ff. und S. 195 ff. (Übersichten zu Basiskonzepten und Kompetenzen) zeigen auf Seiten außerhalb des Auszugs. Für die Zuordnung reichen die Themenfelder.
4. **Oberstufe.** Einführungsphase = Jahrgangsstufe 11, Qualifikationsphase = 12/13; der Lehrplan gibt keine Reihenfolge innerhalb der Qualifikationsphase vor, deshalb eine Stufe „12/13“. Die Bausteine sind im Lehrplan nicht nummeriert; je Phase gibt es die Lernbereiche GF-P, GF-W, LF-P und LF-W (Pflicht- bzw. Wahlpflichtbausteine des Grund- bzw. Leistungsfachs) mit fortlaufend nummerierten Bausteinen in der Reihenfolge des Lehrplans. Gleichnamige Bausteine in Grund- und Leistungsfach haben teils unterschiedliche Inhalte; die Kurzbeschreibungen folgen dem jeweiligen Baustein. Die Planungsbeispiele (Kap. 4.2, 5.2) sind nicht abgebildet.
5. **`sourceUrl`.** Kein Dokument nennt einen Link zur Datei. Verwendet ist die Startseite des Ministeriums für Bildung, `https://bm.rlp.de/` (im Oberstufenlehrplan „www.bm.rlp.de“). Erreichbarkeit hier nicht geprüft.
6. **Erweiterte Klassenstufen:** keine. Alle Zuordnungen passen zu den bestehenden Klassenstufen der Simulationen; Simulationen, deren Klassenstufen nur einen Teil von 7–10 abdecken, stehen nur bei diesen Jahrgängen (siehe Teil B).
7. **Unsichere Zuordnungen (Entwurf, bitte am Lehrplan prüfen):**
   - `wellen-ausbreitung` und `resonanz` bei TF 1: Schall als Welle und Resonanz nennt der Lehrplan unter den Differenzierungsmöglichkeiten („Vertiefungen … Echo und Resonanz“), nicht als verbindliche Kompetenz. Beide passen nach Klassenstufen nur bei 10.
   - `gasgesetze` bei TF 3: „quantitative Untersuchung bei Gasen mit der Folgerung nach einem absoluten Nullpunkt“ steht als Vertiefung.
   - `stoesse` bei TF 4: Der Impuls ist in der Mittelstufe nur eine Vertiefungsmöglichkeit; verbindlich ist er in der Einführungsphase.
   - `hebelgesetz` und `schiefe-ebene` bei TF 10: Der Lehrplan nennt als einfache Maschinen lose Rolle und Flaschenzug; Hebel und schiefe Ebene sind weitere einfache Maschinen, aber nicht genannt. `hebelgesetz` steht zusätzlich beim Wahlpflichtbaustein „Rotation starrer Körper“ (Drehmoment) des Leistungsfachs.
   - `schiefe-ebene` bei LF-P.2 Dynamik: Kräftezerlegung als Anwendung des Wechselwirkungsprinzips; nicht ausdrücklich genannt.
   - `reihe-parallel` bei TF 6: Die Maschenregel steht dort als einfache Messung, Reihen- und Parallelschaltung als solche erst in TF 9 (verzweigte Stromkreise als Vertiefung).
   - `photoeffekt` bei GF-P.8 und LF-P.8: Der Baustein verlangt einen Näherungswert für h „mit einer experimentellen Methode“; der Photoeffekt ist dafür das übliche Verfahren, wird aber nur in Quantenobjekte II und Wechselwirkung von Quantenobjekten (Hallwachs-Effekt) genannt.
   - `planetenbahnen` bei GF-W.2 und LF-W.2 Gravitation: Gravitationsgesetz und Satellitenbewegung stehen dort, die Keplerschen Gesetze nicht ausdrücklich. In der Mittelstufe (TF 7 Kosmos und Forschung) ist die Simulation bewusst nicht zugeordnet, weil das Themenfeld vor allem Recherche und Präsentation verlangt.
   - `gasgesetze` bei LF-P.11 Energie und Entropie: Thermodynamische Maschinen werden dort entropisch betrachtet; die Gasgesetze nennt nur der Wahlpflichtbaustein des Grundfachs.
   - `doppler-effekt` nur bei LF-W.3 Akustik: Im Grundfach nennt der Baustein Akustik den Dopplereffekt nicht.
