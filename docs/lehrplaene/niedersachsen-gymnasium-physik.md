# Niedersachsen · Gymnasium · Physik – Lehrplan-Aufbereitung mit Simulationszuordnung

# Teil A – Überblick

| Merkmal | Sekundarbereich I | Gymnasiale Oberstufe |
|---|---|---|
| Bundesland | Niedersachsen | Niedersachsen |
| Schulart | Gymnasium, Schuljahrgänge 5–10 | gymnasiale Oberstufe von Gymnasium und Gesamtschule, Berufliches Gymnasium, Abendgymnasium, Kolleg |
| Fach | Physik | Physik |
| Name des Lehrplans | „Kerncurriculum für das Gymnasium, Schuljahrgänge 5–10, Physik“ (Titel laut Kopfzeile des Auszugs), Niedersächsisches Kultusministerium | „Kerncurriculum für das Gymnasium – gymnasiale Oberstufe, die Gesamtschule – gymnasiale Oberstufe, das Berufliche Gymnasium, das Abendgymnasium, das Kolleg: Physik“, Niedersächsisches Kultusministerium |
| Jahr / Stand | **im gelieferten Auszug nicht angegeben** (Titelseite und Impressum fehlen; siehe Teil E) | herausgegeben 2022; berücksichtigt die Bildungsstandards Physik der KMK vom 18.06.2020 |
| Datei (von der Projektleitung geliefert, nicht im Repository) | `physik_sek_1_niedersachsen.pdf` (31 Seiten, Auszug S. 12–42: Kap. 2.1–2.3) | `KC-PH_SII_Druck.pdf` (55 Seiten) |
| Link laut Dokument | keiner im Auszug | „http://www.cuvo.nibis.de“; in `sourceUrl` als `https://cuvo.nibis.de/` (ungeprüft, siehe Mathematik) |
| G8/G9 | G9 (Doppeljahrgänge 5/6, 7/8, 9/10) | Einführungsphase = Schuljahrgang 11, Qualifikationsphase = 12/13 (siehe Teil E) |
| Niveaus / Wahl | keine; die Fachkonferenz legt die Reihenfolge der Themenbereiche in den Doppeljahrgängen fest | Einführungsphase: Dynamik verbindlich, im zweiten Halbjahr ein Wahlmodul; Qualifikationsphase: gA und eA in gemeinsamen Tabellen |
| Struktur | Themenbereiche je Doppeljahrgang (Kap. 2.3.3, ohne Nummern) | 6 Inhaltsbereiche: Dynamik (Einführungsphase), Elektrizität, Schwingungen und Wellen, Quantenobjekte, Atomhülle, Atomkern |

| Stufe (Lehrplan) | JSON-Jahrgang | Lernbereiche | Unterbereiche | Unterbereiche mit Simulation | zugeordnete Simulationen (verschieden) |
|---|---|---|---|---|---|
| Doppeljahrgang 5/6 | 5, 6 | 3 | 0 | 0 | 5 |
| Doppeljahrgang 7/8 | 7, 8 | 3 | 0 | 0 | 6 |
| Doppeljahrgang 9/10 | 9, 10 | 4 | 0 | 0 | 4 |
| Einführungsphase | 11 | 2 | 8 | 4 | 6 |
| Qualifikationsphase – grundlegendes und erhöhtes Anforderungsniveau | 12, 13 | 5 | 14 | 12 | 15 |

Insgesamt verwendet: **31 von 36** fertigen Simulationen für Physik.

Nicht zugeordnet (Grund siehe Teil D): `hebelgesetz`, `schiefe-ebene`, `stoesse`, `planetenbahnen`, `doppler-effekt`

# Teil B – Lehrplan im Detail

Simulationen stehen bei allen Jahrgängen einer Stufe, sofern nicht in Klammern einzelne Jahrgänge genannt sind (dann passt die Simulation nach ihren Klassenstufen nur dort).

## Doppeljahrgang 5/6  
*Double grade 5/6*  
Jahrgangsstufe(n) im JSON: 5, 6  
(Quelle: KC Physik Sek. I (Auszug), Kap. 2.3.2 und 2.3.3, S. 26–33)

> Doppeljahrgang 5/6: Das Kerncurriculum nennt die Kompetenzen „am Ende von Schuljahrgang 6“; die Lernbereiche stehen deshalb bei 5 und 6 gleich. Die Fachkonferenz legt fest, in welcher Reihenfolge die Themenbereiche unterrichtet werden. Jede Simulation steht bei den Jahrgängen, für die sie gedacht ist. Die Nummern sind von uns vergeben und laufen über alle Doppeljahrgänge durch.

### 1 Dauermagnete
*EN: Permanent magnets*

- Kurz (DE): Magnete ziehen manche Stoffe an, haben Nord- und Südpol, die sich nicht trennen lassen; Erde als Magnet, Kompass und das Modell der Elementarmagnete.
- Kurz (EN): Magnets attract some materials and have north and south poles that cannot be separated; the Earth as a magnet, the compass and the model of elementary magnets.
- Simulationen: –

### 2 Stromkreise
*EN: Electric circuits*

- Kurz (DE): Einfache Stromkreise nach Schaltplan aufbauen, Reihen- und Parallelschaltung unterscheiden, Leiter und Isolatoren, Spannungsangaben, Gefahren der Elektrizität und der Elektromagnet.
- Kurz (EN): Building simple circuits from a diagram, telling series and parallel circuits apart, conductors and insulators, voltage ratings, dangers of electricity and the electromagnet.
- Simulationen: `einfacher-stromkreis`

### 3 Phänomenorientierte Optik
*EN: Phenomenon-based optics*

- Kurz (DE): Sehen mit dem Sender-Empfänger-Modell, geradlinige Ausbreitung, Schatten, Finsternisse und Mondphasen; Reflexion, Streuung und Brechung; Bilder an Spiegel, Lochblende und Sammellinse; weißes Licht als Farbgemisch.
- Kurz (EN): Seeing with the sender–receiver model, straight-line propagation, shadows, eclipses and lunar phases; reflection, scattering and refraction; images in mirrors, pinholes and converging lenses; white light as a mixture of colours.
- Simulationen: `licht-schatten`, `reflexion`, `brechung`, `linsen`

## Doppeljahrgang 7/8  
*Double grade 7/8*  
Jahrgangsstufe(n) im JSON: 7, 8  
(Quelle: KC Physik Sek. I (Auszug), Kap. 2.3.2 und 2.3.3, S. 26–37)

> Doppeljahrgang 7/8: Das Kerncurriculum nennt die Kompetenzen „am Ende von Schuljahrgang 8“; die Lernbereiche stehen deshalb bei 7 und 8 gleich. Die Fachkonferenz legt fest, in welcher Reihenfolge die Themenbereiche unterrichtet werden. Jede Simulation steht bei den Jahrgängen, für die sie gedacht ist. Die Nummern sind von uns vergeben und laufen über alle Doppeljahrgänge durch.

### 4 Einführung des Energiebegriffs
*EN: Introducing the concept of energy*

- Kurz (DE): Energie in Übertragungsketten und Flussdiagrammen beschreiben, Einheit Joule, qualitative Energiebilanzen und Energieerhaltung mit dem Energiestrom in die Umgebung.
- Kurz (EN): Describing energy in transfer chains and flow diagrams, the joule, qualitative energy balances and conservation of energy including the flow to the surroundings.
- Simulationen: –

### 5 Elektrik I
*EN: Electricity I*

- Kurz (DE): Stromkreise als Energieüberträger, Elektronen im Metall, Stromstärke, Spannung und Leistung messen, Knoten- und Maschenregel, Widerstand und ohmsches Gesetz.
- Kurz (EN): Circuits as energy carriers, electrons in metals, measuring current, voltage and power, the junction and loop rules, resistance and Ohm’s law.
- Simulationen: `einfacher-stromkreis`, `ohmsches-gesetz`, `reihe-parallel`

### 6 Bewegung, Masse und Kraft
*EN: Motion, mass and force*

- Kurz (DE): Geradlinige Bewegungen in t-s- und t-v-Diagrammen, Trägheit und Masse, Kraft als Ursache von Bewegungsänderung und Verformung, hookesches Gesetz, Gewichtskraft sowie Kräfte als Pfeile addieren.
- Kurz (EN): Straight-line motion in t–s and t–v graphs, inertia and mass, force as the cause of changes in motion and deformation, Hooke’s law, weight and adding forces as arrows.
- Simulationen: `bewegungsdiagramme`, `hookesches-gesetz`, `kraefteaddition`

## Doppeljahrgang 9/10  
*Double grade 9/10*  
Jahrgangsstufe(n) im JSON: 9, 10  
(Quelle: KC Physik Sek. I (Auszug), Kap. 2.3.2 und 2.3.3, S. 26–42)

> Doppeljahrgang 9/10: Das Kerncurriculum nennt die Kompetenzen „am Ende von Schuljahrgang 10“; die Lernbereiche stehen deshalb bei 9 und 10 gleich. Die Fachkonferenz legt fest, in welcher Reihenfolge die Themenbereiche unterrichtet werden. Jede Simulation steht bei den Jahrgängen, für die sie gedacht ist. Die Nummern sind von uns vergeben und laufen über alle Doppeljahrgänge durch.

### 7 Energieübertragung quantitativ
*EN: Energy transfer – quantitative*

- Kurz (DE): Temperatur und innere Energie, Phasenübergänge energetisch, Energieentwertung, Leistung, Arbeit und Wärme sowie Lage- und Bewegungsenergie mit dem Energieerhaltungssatz berechnen.
- Kurz (EN): Temperature and internal energy, phase changes in terms of energy, energy dissipation, power, work and heat, and calculating potential and kinetic energy with the law of conservation of energy.
- Simulationen: `energieerhaltung`, `teilchenmodell`

### 8 Elektrik II
*EN: Electricity II*

- Kurz (DE): Leiter und Halbleiter, pn-Übergang, Leuchtdiode und Solarzelle, Motor, Generator und Transformator als Energiewandler sowie Gleich- und Wechselstrom.
- Kurz (EN): Conductors and semiconductors, the pn junction, LEDs and solar cells, motor, generator and transformer as energy converters, and direct and alternating current.
- Simulationen: –

### 9 Atom- und Kernphysik
*EN: Atomic and nuclear physics*

- Kurz (DE): Kern-Hülle-Modell und Isotope, Kernstrahlung und ihre Wirkung, Zählrohr, Alpha-, Beta- und Gammastrahlung, Strahlenschutz, Halbwertszeit sowie Kernspaltung und Kettenreaktion.
- Kurz (EN): The nuclear model of the atom and isotopes, nuclear radiation and its effects, the Geiger counter, alpha, beta and gamma radiation, radiation protection, half-life, and nuclear fission and chain reactions.
- Simulationen: `radioaktiver-zerfall`

### 10 Energieübertragung in Kreisprozessen
*EN: Energy transfer in cyclic processes*

- Kurz (DE): Gasdruck im Teilchenmodell, Gesetze von Boyle-Mariotte und Gay-Lussac, Kelvin-Skala, Stirlingmotor und der höchstmögliche Wirkungsgrad.
- Kurz (EN): Gas pressure in the particle model, the laws of Boyle–Mariotte and Gay-Lussac, the Kelvin scale, the Stirling engine and the maximum possible efficiency.
- Simulationen: `gasgesetze`

## Einführungsphase  
*Introductory phase*  
Jahrgangsstufe(n) im JSON: 11  
(Quelle: KC Physik Sek. II (2022), Kap. 3.2, S. 27–32)

> Einführungsphase der gymnasialen Oberstufe (G9: Schuljahrgang 11). Verbindlich ist im ersten Halbjahr die Dynamik; für das zweite Halbjahr schlägt das Kerncurriculum Wahlmodule vor, die Schule kann auch ein eigenes planen. Die Codes und die Gliederung der Dynamik sind von uns.

### EF-1 Dynamik
*EN: Dynamics*

- Kurz (DE): Verbindlich im ersten Halbjahr: freier Fall und waagerechter Wurf, Newton’sche Axiome, Kreisbewegung, Energieerhaltung in der Mechanik und ein Werturteil zur Energienutzung.
- Kurz (EN): Mandatory in the first half-year: free fall and horizontal projection, Newton’s laws, circular motion, conservation of energy in mechanics and a value judgement on energy use.
- Simulationen: `freier-fall`, `schiefer-wurf`, `bewegungsdiagramme`, `kreisbewegung`, `energieerhaltung`
- Unterbereiche:
  - EF-1.1 Freier Fall und waagerechter Wurf · *Free fall and horizontal projection* – Kurz: t-s- und t-v-Zusammenhänge, Fallbeschleunigung und Idealisierungen. · *EN: Time–distance and time–velocity relationships, gravitational acceleration and idealisations.* – Simulationen: `freier-fall`, `schiefer-wurf`, `bewegungsdiagramme`
  - EF-1.2 Grundgleichung der Mechanik und newtonsche Axiome · *Fundamental equation of mechanics and Newton’s laws* – Kurz: F = m · a, Krafteinheit und die drei Axiome. · *EN: F = m · a, the unit of force and the three laws.* – Simulationen: –
  - EF-1.3 Gleichförmige Kreisbewegung · *Uniform circular motion* – Kurz: Umlaufdauer, Bahngeschwindigkeit, Zentripetalbeschleunigung und Zentripetalkraft. · *EN: Period, orbital speed, centripetal acceleration and centripetal force.* – Simulationen: `kreisbewegung`
  - EF-1.4 Energieerhaltung in der Mechanik · *Conservation of energy in mechanics* – Kurz: Kinetische Energie und Energieerhaltungssatz als Alternative zur Kraftbetrachtung; ein Werturteil zur Energienutzung. · *EN: Kinetic energy and the law of conservation of energy as an alternative to forces; a value judgement on energy use.* – Simulationen: `energieerhaltung`

### EF-2 Wahlmodule (Vorschläge)
*EN: Optional modules (suggestions)*

- Kurz (DE): Für das zweite Halbjahr ein Wahlmodul von etwa 16 Stunden; das Kerncurriculum schlägt vier vor, die Schule kann ein eigenes planen.
- Kurz (EN): For the second half-year one optional module of about 16 lessons; the core curriculum suggests four, and schools may plan their own.
- Simulationen: `radioaktiver-zerfall`
- Unterbereiche:
  - EF-2.1 Akustik · *Acoustics* – Kurz: Schallgeschwindigkeit, Ton, Klang und Geräusch, Frequenz und Amplitude, Schalldruckpegel, Intervalle und Klangfarbe. · *EN: Speed of sound, tone, sound and noise, frequency and amplitude, sound pressure level, intervals and timbre.* – Simulationen: –
  - EF-2.2 Atom- und Kernphysik · *Atomic and nuclear physics* – Kurz: Ausgleich für Lernende aus anderen Bildungsgängen: Kern-Hülle-Modell, Kernstrahlung, Zählrohr und Halbwertszeit. · *EN: Catch-up for students from other school types: nuclear model, nuclear radiation, Geiger counter and half-life.* – Simulationen: `radioaktiver-zerfall`
  - EF-2.3 Optische Abbildungen · *Optical imaging* – Kurz: Bilder an Linsen, Brennweite, Abbildungsgleichung und optische Geräte. · *EN: Images formed by lenses, focal length, the lens equation and optical instruments.* – Simulationen: –
  - EF-2.4 Strahlungsphysik · *Radiation physics* – Kurz: Strahlungsgesetze, Strahlungsgleichgewicht, selektive Absorption und der Treibhauseffekt. · *EN: Radiation laws, radiative equilibrium, selective absorption and the greenhouse effect.* – Simulationen: –

## Qualifikationsphase – grundlegendes und erhöhtes Anforderungsniveau  
*Qualification phase – basic and higher level*  
Jahrgangsstufe(n) im JSON: 12, 13  
(Quelle: KC Physik Sek. II (2022), Kap. 3.3, S. 33–46)

> Qualifikationsphase (G9: Schuljahrgänge 12 und 13). Das Kerncurriculum verlangt nur, dass im ersten Jahr mindestens Elektrizität sowie Schwingungen und Wellen behandelt werden; die übrigen Inhaltsbereiche verteilt es nicht. Die Lernbereiche stehen deshalb als Doppeljahrgang bei 12 und 13 gleich. „Nur eA“ kennzeichnet das erhöhte Anforderungsniveau. Die Codes und die Unterteilung der Inhaltsbereiche (nach den Tabellen des Kerncurriculums) sind von uns.

### Q-1 Elektrizität
*EN: Electricity*

- Kurz (DE): Elektrische Felder und Spannung, Plattenkondensator mit Lade- und Entladekurven, Magnetfelder, Elektronen in Feldern und elektromagnetische Induktion.
- Kurz (EN): Electric fields and voltage, the parallel-plate capacitor with charging and discharging curves, magnetic fields, electrons in fields and electromagnetic induction.
- Simulationen: `feldlinien`, `kondensator`, `lorentzkraft`, `induktion`
- Unterbereiche:
  - Q-1.1 Elektrisches Feld und Spannung · *Electric field and voltage* – Kurz: Feldlinienbilder, Feldstärke, faradayscher Käfig, Spannung als Energie pro Ladung; nur eA: coulombsches Gesetz und Potenzial. · *EN: Field-line patterns, field strength, the Faraday cage, voltage as energy per charge; higher level only: Coulomb’s law and potential.* – Simulationen: `feldlinien` (12)
  - Q-1.2 Kondensator · *Capacitor* – Kurz: Feld im Plattenkondensator, geladene Körper im Feld, Auf- und Entladen als Exponentialfunktion, Kapazität und Feldenergie. · *EN: The field in a parallel-plate capacitor, charged bodies in the field, charging and discharging as exponential functions, capacitance and field energy.* – Simulationen: `kondensator` (12)
  - Q-1.3 Magnetfeld und Elektronen in Feldern · *Magnetic field and electrons in fields* – Kurz: Kraft auf stromdurchflossene Leiter, Flussdichte, Elektronen unter Lorentzkraft, im Querfeld und im Wien-Filter; nur eA: e/m mit dem Fadenstrahlrohr. · *EN: Force on current-carrying wires, flux density, electrons under the Lorentz force, in a transverse field and in a Wien filter; higher level only: e/m with the fine-beam tube.* – Simulationen: `lorentzkraft`
  - Q-1.4 Hallsonde, Spulenfeld und Induktion · *Hall probe, coil field and induction* – Kurz: Flussdichte mit der Hallsonde messen, Feld einer Spule, Induktionsspannung und Induktionsgesetz, Wechselspannung; nur eA: Selbstinduktion und Energie des Magnetfelds. · *EN: Measuring flux density with a Hall probe, the field of a coil, induced voltage and the law of induction, alternating voltage; higher level only: self-induction and magnetic field energy.* – Simulationen: `induktion`

### Q-2 Schwingungen und Wellen
*EN: Oscillations and waves*

- Kurz (DE): Harmonische Schwingungen an Feder- und Fadenpendel, Resonanz und Schwingkreis, harmonische Wellen, Polarisation sowie Interferenz an stehenden Wellen, Doppelspalt, Gitter und Michelson-Interferometer.
- Kurz (EN): Harmonic oscillations of spring and simple pendulums, resonance and the LC circuit, harmonic waves, polarisation, and interference in standing waves, double slits, gratings and the Michelson interferometer.
- Simulationen: `federpendel`, `fadenpendel`, `resonanz`, `wellen-ausbreitung`, `interferenz`, `stehende-wellen`, `doppelspalt`
- Unterbereiche:
  - Q-2.1 Harmonische Schwingungen · *Harmonic oscillations* – Kurz: Auslenkung, Amplitude, Periodendauer und Frequenz, Feder-Masse-Pendel und Fadenpendel; nur eA: lineares Kraftgesetz, Dämpfung und Resonanz. · *EN: Displacement, amplitude, period and frequency, spring–mass and simple pendulum; higher level only: linear force law, damping and resonance.* – Simulationen: `federpendel` (12), `fadenpendel` (12), `resonanz`
  - Q-2.2 Schwingkreis und harmonische Wellen · *LC circuit and harmonic waves* – Kurz: Elektromagnetischer Schwingkreis, Ausbreitung harmonischer Wellen, Wellenlänge und Frequenz, Reflexion, Brechung, Beugung, longitudinale und transversale Wellen und Polarisation. · *EN: The electromagnetic LC circuit, propagation of harmonic waves, wavelength and frequency, reflection, refraction, diffraction, longitudinal and transverse waves and polarisation.* – Simulationen: `wellen-ausbreitung` (12)
  - Q-2.3 Interferenz · *Interference* – Kurz: Stehende Welle, Michelson-Interferometer, Doppelspalt und Gitter, Wellenlänge von Licht und Ultraschall bestimmen; nur eA: Einzelspalt und Bragg-Reflexion. · *EN: Standing waves, the Michelson interferometer, double slit and grating, measuring the wavelength of light and ultrasound; higher level only: single slit and Bragg reflection.* – Simulationen: `interferenz`, `stehende-wellen`, `doppelspalt`

### Q-3 Quantenobjekte
*EN: Quantum objects*

- Kurz (DE): Interferenz von Quantenobjekten und ihre stochastische Deutung, De-Broglie-Wellenlänge, Elektronenbeugung, einzelne Photonen und das Photonenmodell mit der planckschen Konstante.
- Kurz (EN): Interference of quantum objects and its stochastic interpretation, the de Broglie wavelength, electron diffraction, single photons and the photon model with Planck’s constant.
- Simulationen: `elektronenbeugung`, `photoeffekt`
- Unterbereiche:
  - Q-3.1 Interferenz von Quantenobjekten · *Interference of quantum objects* – Kurz: Doppelspalt mit Quantenobjekten, De-Broglie-Gleichung, Elektronenbeugungsröhre und Doppelspalt mit einzelnen Photonen und Elektronen. · *EN: Double slit with quantum objects, the de Broglie equation, the electron diffraction tube and double slits with single photons and electrons.* – Simulationen: `elektronenbeugung`
  - Q-3.2 Komplementarität und Unbestimmtheit · *Complementarity and uncertainty* – Kurz: Nur eA: Mach-Zehnder-Interferometer, Delayed-Choice-Experiment, Zustand, Präparation, Superposition und Unbestimmtheit. · *EN: Higher level only: the Mach–Zehnder interferometer, delayed-choice experiment, state, preparation, superposition and uncertainty.* – Simulationen: –
  - Q-3.3 Photonen und plancksche Konstante · *Photons and Planck’s constant* – Kurz: h mit Leuchtdioden bestimmen; nur eA: Photoeffekt mit der Vakuum-Fotozelle und Röntgenbremsspektrum. · *EN: Determining h with LEDs; higher level only: photoelectric effect with a vacuum photocell and the X-ray bremsstrahlung spectrum.* – Simulationen: `photoeffekt`

### Q-4 Atomhülle
*EN: Atomic shell*

- Kurz (DE): Quantisierte Energie im Potenzialtopf, Linienspektren, Franck-Hertz-Versuch, Energieniveauschemata, Balmerformel, Fluoreszenz und Orbitale.
- Kurz (EN): Quantised energy in a potential well, line spectra, the Franck–Hertz experiment, energy level diagrams, the Balmer formula, fluorescence and orbitals.
- Simulationen: `linienspektren`
- Unterbereiche:
  - Q-4.1 Energiequantisierung und Linienspektren · *Energy quantisation and line spectra* – Kurz: Eindimensionaler Potenzialtopf, quantenhafte Emission in Linienspektren, Resonanzabsorption und Franck-Hertz-Versuch. · *EN: The one-dimensional potential well, quantised emission in line spectra, resonance absorption and the Franck–Hertz experiment.* – Simulationen: `linienspektren`
  - Q-4.2 Energieniveauschemata und Orbitale · *Energy level diagrams and orbitals* – Kurz: Spektrallinien aus Energieniveaus berechnen, Balmerformel, Fluoreszenz und Orbitale des Wasserstoffatoms. · *EN: Calculating spectral lines from energy levels, the Balmer formula, fluorescence and orbitals of the hydrogen atom.* – Simulationen: `linienspektren`

### Q-5 Atomkern
*EN: Atomic nucleus*

- Kurz (DE): Zählrohr und Zerfallsgesetz, Zerfallsreihen auf der Nuklidkarte, Eigenschaften der Strahlungsarten, Energiespektren und die Bragg-Kurve in der Strahlentherapie.
- Kurz (EN): The Geiger counter and the decay law, decay series on the chart of nuclides, properties of the types of radiation, energy spectra and the Bragg curve in radiotherapy.
- Simulationen: `radioaktiver-zerfall`
- Unterbereiche:
  - Q-5.1 Zerfallsgesetz und Nuklidkarte · *Decay law and chart of nuclides* – Kurz: Geiger-Müller-Zählrohr, Zerfallsgesetz als Exponentialfunktion, Zerfallsreihen und Strahlungsarten; nur eA: Modellierung mit dem Differenzenverfahren. · *EN: The Geiger–Müller counter, the decay law as an exponential function, decay series and types of radiation; higher level only: modelling with the difference method.* – Simulationen: `radioaktiver-zerfall`
  - Q-5.2 Energiespektren und Anwendungen · *Energy spectra and applications* – Kurz: Halbleiterdetektor, Alpha-Spektrum einer Zerfallsreihe, Bragg-Kurve; nur eA: Nukleonen im Potenzialtopf. · *EN: Semiconductor detectors, the alpha spectrum of a decay series, the Bragg curve; higher level only: nucleons in a potential well.* – Simulationen: –

# Teil C – JSON

Die vollständige JSON-Datei liegt separat bei: `niedersachsen-gymnasium-physik.json` (erzeugt aus `src/curriculum/lehrplaene/niedersachsen-gymnasium-physik.ts`, dieselben Daten).

# Teil D – Lücken und Vorschläge

## D.1 Nicht zugeordnete Simulationen (Ausnahmen in `NOT_IN_CURRICULUM`)

| Simulation | Grund |
|---|---|
| `hebelgesetz` | Hebel und einfache Maschinen stehen in keinem der beiden Kerncurricula. |
| `schiefe-ebene` | Schiefe Ebene, Kräftezerlegung und Reibung stehen nicht im Kerncurriculum. In 7/8 gibt es nur die zeichnerische Ersatzkraft zweier Kräfte. |
| `stoesse` | Impuls und Stöße stehen nicht im Kerncurriculum. Der Impuls kommt nur als mögliche Herangehensweise in 7/8 vor und im eA bei Quantenobjekten. |
| `planetenbahnen` | Gravitationsgesetz und Kepler’sche Gesetze stehen nicht im Kerncurriculum. Die Dynamik der Einführungsphase endet bei der Kreisbewegung. |
| `doppler-effekt` | Der Doppler-Effekt steht nicht im Kerncurriculum, auch nicht im Wahlmodul Akustik. |

## D.2 Lernbereiche und Unterbereiche ohne passende Simulation

- **5/6:** 1 Dauermagnete
- **7/8:** 4 Einführung des Energiebegriffs (`energieerhaltung` ist ab Klasse 9 gedacht)
- **9/10:** 8 Elektrik II (Halbleiter, Motor, Generator als „black box“)
- **Einführungsphase:** EF-1.2 Grundgleichung und newtonsche Axiome; Wahlmodule EF-2.1 Akustik, EF-2.3 Optische Abbildungen (`linsen` ist bis Klasse 10 gedacht), EF-2.4 Strahlungsphysik
- **Qualifikationsphase:** Q-3.2 Komplementarität und Unbestimmtheit; Q-5.2 Energiespektren und Anwendungen

## D.3 Vorschläge für neue Simulationen

| Vorschlag (Titel) | Idee | schließt Lücke in |
|---|---|---|
| Magnete und Kompass | Feldlinien um Stab- und Hufeisenmagnet, Kompassnadeln, Elementarmagnete | 1 |
| Energieflussdiagramm | Energieketten zusammenstecken, Entwertung als Pfeil in die Umgebung | 4 |
| Kennlinie der Leuchtdiode | Diode, LDR, NTC, Solarzelle | 8 |
| Newtons zweites Gesetz | Wagen mit Zugkraft, F = m · a messen | EF-1.2 |
| Mach-Zehnder-Interferometer | einzelne Photonen, Weginformation an/aus | Q-3.2 |
| Treibhauseffekt im Modell | Strahlungsgleichgewicht, selektive Absorption | EF-2.4 |

# Teil E – Einordnung und Unklarheiten

Festlegung der Projektleitung (27.10.2026): Nennt der Lehrplan keine genauen Jahrgänge, werden Doppeljahrgangsstufen verwendet.

1. **Ausgabe Sek. I unbekannt.** Die gelieferte Datei ist ein Auszug: Seiten 12–42, Kap. 2.1–2.3, ohne Titelseite und Impressum. Titel und Doppeljahrgänge stehen in der Kopfzeile bzw. im Text, Ausgabe und Stand nicht. **Bitte nachreichen**, wenn bekannt.
2. **Sekundarbereich I.** Das Kerncurriculum gliedert selbst in Doppeljahrgänge. Die Fachkonferenz legt die Reihenfolge der Themenbereiche fest. Die Lernbereiche stehen deshalb bei beiden Jahrgängen eines Doppeljahrgangs gleich.
3. **Titel der Themenbereiche.** Übernommen sind die Überschriften aus Kap. 2.3.3. Die Tabellen in Kap. 2.3.2 nennen teils andere Namen:
   - „Mechanik“ entspricht „Bewegung, Masse und Kraft“.
   - „Thermodynamik“ entspricht „Energieübertragung in Kreisprozessen“.
   - „Energie“ sowie „Magnetismus und Elektrizität“ verteilen sich auf mehrere Themenbereiche.
4. **Oberstufe.**
   - Einführungsphase = Schuljahrgang 11 (G9).
   - Qualifikationsphase = Doppeljahrgang 12/13. Das Kerncurriculum verlangt nur, dass im ersten Jahr mindestens Elektrizität sowie Schwingungen und Wellen behandelt werden.
   - Die Wahlmodule der Einführungsphase sind Vorschläge und stehen als eigener Lernbereich EF-2.
5. **Unterteilung der Oberstufe.**
   - Die Inhaltsbereiche haben im Original keine Unterüberschriften, aber mehrere Tabellen. Die Unterbereiche folgen diesen Tabellen; Titel und Nummern sind von uns.
   - Die Dynamik ist nach den Zeilen der Tabelle gegliedert.
   - gA und eA stehen gemeinsam, „nur eA“ kennzeichnet das erhöhte Niveau.
6. **Erweiterte Klassenstufen** (in `src/curriculum/physik.ts`, mit dem Thema „Strahlenoptik“, das schon bei 6 beginnt):

   | ID | bisher | neu | Lernbereich | Fundstelle |
   |---|---|---|---|---|
   | `brechung` | 8–10 | 6–10 | 3 Phänomenorientierte Optik (5/6) | Sek. I Kap. 2.3.3: Reflexion, Streuung und Brechung von Lichtbündeln an ebenen Grenzflächen |
   | `linsen` | 8–10 | 6–10 | 3 Phänomenorientierte Optik (5/6) | Sek. I Kap. 2.3.3: Bilder an Sammellinsen, Sammel- und Zerstreuungslinsen |

   Folge für Nordrhein-Westfalen: Dort stehen `brechung` und `linsen` jetzt auch bei Klasse 7 (Inhaltsfeld 5, Klassen 7–10).
7. **Unsichere Zuordnungen (Entwurf, bitte am Lehrplan prüfen):**
   - `brechung` und `linsen` bei 5/6: Das Kerncurriculum verlangt dort nur Phänomene; die Simulationen gehen mit Totalreflexion und Bildkonstruktion weiter.
   - `teilchenmodell` bei 7 (Klasse 9): Phasenübergang energetisch, Energie-Temperatur-Diagramm.
   - `gasgesetze` bei 10: passt genau (Boyle-Mariotte, Gay-Lussac, Kelvin-Skala). Der Stirling-Kreisprozess fehlt in der Simulation.
   - `schiefer-wurf` bei EF-1.1: nur der waagerechte Wurf ist verlangt.
   - `fadenpendel` bei Q-2.1: steht in der Spalte der prozessbezogenen Kompetenzen („wenden diese Verfahren auf das Fadenpendel an“).
8. **Nicht abgebildet:** die prozessbezogenen Kompetenzen (Erkenntnisgewinnung, Kommunikation, Bewertung) und die Basiskonzepte. Die Beispiele zur Medienbildung sind ebenfalls nicht abgebildet.
