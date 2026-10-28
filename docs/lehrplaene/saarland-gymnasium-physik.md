# Saarland · Gymnasium · Physik – Lehrplan-Aufbereitung mit Simulationszuordnung

# Teil A – Überblick

| Merkmal | Lehrpläne neunjähriges Gymnasium (7–10) und gymnasiale Oberstufe |
|---|---|
| Bundesland | Saarland |
| Schulart | Gymnasium (neunjähriges Gymnasium), Physik in den Klassenstufen 7–13 |
| Fach | Physik |
| Name der Lehrpläne (Sek. I) | „Physik, Lehrplan, Neunjähriges Gymnasium“: Klassenstufe 7 (alle Zweige); 8 NW-Zweig und zweistündig (sprachlicher Zweig); 9 NW-Zweig und Informatik-Zweig; 10 NW-Zweig, Informatik-Zweig und zweistündig (außer Informatik-Zweig) |
| Jahr / Stand (Sek. I) | 7: 2023; 8 und 9: 2024; 10: 2026 |
| Name der Lehrpläne (Oberstufe) | „Lehrplan Physik, Gymnasiale Oberstufe, Einführungsphase“; „Lehrplan Physik, Hauptphase, Grundkurs“ und „Leistungskurs“ |
| Jahr / Stand (Oberstufe) | jeweils Juli 2023 |
| Dateien (von der Projektleitung geliefert, nicht im Repository) | `LP_PH_gym9_7_2023.pdf`, `LP_PH_gym9_8_NW_Zweig_2024.pdf`, `LP_PH_gym9_8_spr_Zweig_2024.pdf`, `LP_PH_gym9_9_nw_Zweig_2024.pdf`, `LP_PH_gym9_9_inf_Zweig_2024.pdf`, `LP_PH_gym9_10_nw_Zweig_2026.pdf`, `LP_PH_gym9_10_inf_Zweig_2026.pdf`, `LP_PH_gym9_10_zweistuendig_ohne_Infozweig_2026.pdf`, `LP_Ph_EP_GOS_2023.pdf`, `LP_Ph_HP_GK_2023.pdf`, `LP_Ph_HP_LK_2023.pdf` |
| Link laut Dokument | kein Link zum Ministerium oder zur Datei; in `sourceUrl` die Startseite des Ministeriums für Bildung und Kultur, `https://www.saarland.de/mbk` (Vermerk im Pull Request) |
| G8/G9 | G9: Sek. I bis 10, Oberstufe hier Einführungsphase 11 und Hauptphase 12/13 |
| Niveaus / Wahl | Sek. I: je Zweig eigener Lehrplan, abgebildet ist der naturwissenschaftliche Zweig (NW-Zweig). Hauptphase: Grund- und Leistungskurs |
| Struktur | Sek. I: Themenfelder mit Zeitanteilen ohne Nummern, dazu „Umgang mit Messdaten in der Physik“ und ein Wahlthema oder Praktikum. Einführungsphase: zwei Themenfelder. Hauptphase: nummerierte Themenfelder 1–4 nach Halbjahren |

| Stufe (Lehrplan) | JSON-Jahrgang | Lernbereiche | Unterbereiche | Bereiche mit Simulation (Unterbereiche bzw. Lernbereiche ohne Unterbereiche) | zugeordnete Simulationen (verschieden) |
|---|---|---|---|---|---|
| Klassenstufe 7 | 7 | 3 | 0 | 3 | 6 |
| Klassenstufe 8 (NW-Zweig) | 8 | 6 | 0 | 4 | 6 |
| Klassenstufe 9 (NW-Zweig) | 9 | 3 | 0 | 2 | 5 |
| Klassenstufe 10 (NW-Zweig) | 10 | 5 | 0 | 5 | 6 |
| Einführungsphase (hier Klassenstufe 11) | 11 | 2 | 0 | 2 | 8 |
| Hauptphase, 1./2. Halbjahr (hier Klassenstufe 12) | 12 | 7 | 0 | 6 | 11 |
| Hauptphase, 3./4. Halbjahr (hier Klassenstufe 13) | 13 | 4 | 0 | 3 | 6 |

Insgesamt verwendet: **34 von 36** fertigen Simulationen für Physik.

Nicht zugeordnet (Grund siehe Teil D): `schiefer-wurf`, `doppler-effekt`

# Teil B – Lehrplan im Detail

Simulationen stehen bei allen Jahrgängen einer Stufe, sofern nicht in Klammern einzelne Jahrgänge genannt sind (dann passt die Simulation nach ihren Klassenstufen nur dort).

## Klassenstufe 7  
*Grade 7*  
Jahrgangsstufe(n) im JSON: 7  
(Quelle: Lehrplan Physik 7 (2023), Themenfelder ab S. 8)

> Klassenstufe 7 (neunjähriges Gymnasium). „Umgang mit Messdaten in der Physik“ wird in allen Themenfeldern eingeübt. Die Nummern sind von uns vergeben.

### 1 Grundlagen der Elektrizität
*EN: Basics of electricity*

- Kurz (DE): Magnetismus, elektrischer Stromkreis, Spannung und Stromstärke, Wirkungen des Stroms, ohmsches Gesetz, sicherer Umgang mit Elektrizität.
- Kurz (EN): Magnetism, the electric circuit, voltage and current, effects of current, Ohm’s law, using electricity safely.
- Simulationen: `einfacher-stromkreis`, `reihe-parallel`, `ohmsches-gesetz`

### 2 Grundlagen der Optik
*EN: Basics of optics*

- Kurz (DE): Lichtausbreitung und Schatten, Lochkamera, Reflexion.
- Kurz (EN): Propagation of light and shadows, the pinhole camera, reflection.
- Simulationen: `licht-schatten`, `reflexion`

### 3 Grundlagen der Mechanik
*EN: Basics of mechanics*

- Kurz (DE): Masse und Dichte, Bewegungen beschreiben.
- Kurz (EN): Mass and density, describing motion.
- Simulationen: `bewegungsdiagramme`

## Klassenstufe 8 (NW-Zweig)  
*Grade 8 (science branch)*  
Jahrgangsstufe(n) im JSON: 8  
(Quelle: Lehrplan Physik 8, NW-Zweig (2024), Themenfelder ab S. 9)

> Klassenstufe 8 (neunjähriges Gymnasium), abgebildet ist der naturwissenschaftliche Zweig (NW-Zweig); andere Zweige haben eigene Lehrpläne mit teils anderen Themen. „Umgang mit Messdaten in der Physik“ wird in allen Themenfeldern eingeübt. Die Nummern sind von uns vergeben.

### 1 Kraft
*EN: Force*

- Kurz (DE): Kraftmessung, Gewichtskraft, Kraft als Vektor, Reibungskraft, Kraftwandler.
- Kurz (EN): Measuring force, weight, force as a vector, friction, force converters.
- Simulationen: `hookesches-gesetz`, `kraefteaddition`, `hebelgesetz`

### 2 Mechanische Energie
*EN: Mechanical energy*

- Kurz (DE): Arbeit, Energie und Leistung.
- Kurz (EN): Work, energy and power.
- Simulationen: `energieerhaltung`

### 3 Druck
*EN: Pressure*

- Kurz (DE): Druck als Zustand, Schweredruck in Flüssigkeiten, Luftdruck, Auftrieb.
- Kurz (EN): Pressure as a state, hydrostatic pressure, air pressure, buoyancy.
- Simulationen: –

### 4 Temperatur
*EN: Temperature*

- Kurz (DE): Temperaturmessung, Zustandsgleichung für ideale Gase.
- Kurz (EN): Measuring temperature, the equation of state for ideal gases.
- Simulationen: `teilchenmodell`, `gasgesetze`

### 5 Thermische Energie und Wärme
*EN: Thermal energy and heat*

- Kurz (DE): Spezifische Wärmekapazität, Ausbreitung von Wärme.
- Kurz (EN): Specific heat capacity, heat transfer.
- Simulationen: `teilchenmodell`

### 6 Wahlthema oder Praktikum
*EN: Elective topic or practical*

- Kurz (DE): Wahlthema oder Praktikum nach Wahl der Lehrkraft.
- Kurz (EN): Elective topic or practical chosen by the teacher.
- Simulationen: –

## Klassenstufe 9 (NW-Zweig)  
*Grade 9 (science branch)*  
Jahrgangsstufe(n) im JSON: 9  
(Quelle: Lehrplan Physik 9, NW-Zweig (2024), Themenfelder ab S. 9)

> Klassenstufe 9 (neunjähriges Gymnasium), abgebildet ist der naturwissenschaftliche Zweig (NW-Zweig); andere Zweige haben eigene Lehrpläne mit teils anderen Themen. „Umgang mit Messdaten in der Physik“ wird in allen Themenfeldern eingeübt. Die Nummern sind von uns vergeben.

### 1 Brechung, Abbildungen und Spektralfarben
*EN: Refraction, images and spectral colours*

- Kurz (DE): Brechung und Totalreflexion, Abbildungen durch Linsen, optische Geräte zur Vergrößerung des Sehwinkels, Spektralfarben und elektromagnetisches Spektrum.
- Kurz (EN): Refraction and total internal reflection, images formed by lenses, optical instruments that enlarge the visual angle, spectral colours and the electromagnetic spectrum.
- Simulationen: `brechung`, `linsen`

### 2 Gesetze des elektrischen Stromkreises
*EN: Laws of the electric circuit*

- Kurz (DE): Ladung und elektrisches Feld, Strom und Spannung, elektrische Arbeit und Leistung, Reihen- und Parallelschaltung von Widerständen, Halbleiter und Dioden.
- Kurz (EN): Charge and the electric field, current and voltage, electrical work and power, series and parallel resistors, semiconductors and diodes.
- Simulationen: `einfacher-stromkreis`, `reihe-parallel`, `ohmsches-gesetz`

### 3 Wahlthema oder Praktikum
*EN: Elective topic or practical*

- Kurz (DE): Vorschläge: Innenwiderstand, spezifischer Widerstand, Transistorschaltungen.
- Kurz (EN): Suggestions: internal resistance, resistivity, transistor circuits.
- Simulationen: –

## Klassenstufe 10 (NW-Zweig)  
*Grade 10 (science branch)*  
Jahrgangsstufe(n) im JSON: 10  
(Quelle: Lehrplan Physik 10, NW-Zweig (2026), Themenfelder ab S. 8)

> Klassenstufe 10 (neunjähriges Gymnasium), abgebildet ist der naturwissenschaftliche Zweig (NW-Zweig); andere Zweige haben eigene Lehrpläne mit teils anderen Themen. „Umgang mit Messdaten in der Physik“ wird in allen Themenfeldern eingeübt. Die Nummern sind von uns vergeben.

### 1 Elektromagnetische Wechselwirkung
*EN: Electromagnetic interaction*

- Kurz (DE): Stromdurchflossene Leiter im Magnetfeld, elektromagnetische Induktion, Transformator.
- Kurz (EN): Current-carrying conductors in a magnetic field, electromagnetic induction, the transformer.
- Simulationen: `lorentzkraft`, `induktion`

### 2 Nachhaltige Energieversorgung
*EN: Sustainable energy supply*

- Kurz (DE): Energieumwandlung und Energieerhaltung, Kraftwerke, Energiespeicherung und Energieentwertung.
- Kurz (EN): Energy conversion and conservation, power stations, energy storage and dissipation.
- Simulationen: `energieerhaltung`

### 3 Thermodynamik und Klimaphysik
*EN: Thermodynamics and climate physics*

- Kurz (DE): Zustandsänderungen von Gasen, Kreisprozesse, Klimaphysik.
- Kurz (EN): Changes of state of gases, thermodynamic cycles, climate physics.
- Simulationen: `gasgesetze`

### 4 Ionisierende Strahlung
*EN: Ionising radiation*

- Kurz (DE): Strahlungsarten, Nachweis, Halbwertszeit und Wirkung ionisierender Strahlung.
- Kurz (EN): Types of radiation, detection, half-life and effects of ionising radiation.
- Simulationen: `radioaktiver-zerfall`

### 5 Wahlthema oder Praktikum
*EN: Elective topic or practical*

- Kurz (DE): Vorschläge: Astronomie, Transistoren in der Informationstechnik, Energiebedarf von Autos.
- Kurz (EN): Suggestions: astronomy, transistors in information technology, energy needs of cars.
- Simulationen: `planetenbahnen`

## Einführungsphase (hier Klassenstufe 11)  
*Introductory phase (here grade 11)*  
Jahrgangsstufe(n) im JSON: 11  
(Quelle: Lehrplan Physik Einführungsphase (2023), Themenfelder ab S. 4)

> Einführungsphase der gymnasialen Oberstufe (hier Klassenstufe 11), Lehrplan von 2023. Die Nummern sind von uns vergeben.

### 1 Kraft und Bewegung
*EN: Force and motion*

- Kurz (DE): Trägheitssatz und gleichförmige Bewegung, gleichmäßig beschleunigte Bewegung, Grundgesetz der Mechanik, freier Fall und senkrechter Wurf, Wechselwirkungsprinzip und Stöße, gleichförmige Kreisbewegung.
- Kurz (EN): The law of inertia and uniform motion, uniformly accelerated motion, Newton’s second law, free fall and vertical projection, action and reaction and collisions, uniform circular motion.
- Simulationen: `bewegungsdiagramme`, `freier-fall`, `kraefteaddition`, `schiefe-ebene`, `energieerhaltung`, `stoesse`, `kreisbewegung`

### 2 Kernenergie und Radioaktivität
*EN: Nuclear energy and radioactivity*

- Kurz (DE): Kern-Hülle-Modell, Kernbindungsenergie, Kernkraftwerke, Radioaktivität.
- Kurz (EN): The nucleus–shell model, nuclear binding energy, nuclear power stations, radioactivity.
- Simulationen: `radioaktiver-zerfall`

## Hauptphase, 1./2. Halbjahr (hier Klassenstufe 12)  
*Main phase, half-years 1/2 (here grade 12)*  
Jahrgangsstufe(n) im JSON: 12  
(Quelle: Lehrpläne Physik Hauptphase GK und LK (2023), Übersicht S. 4–5, Themenfelder 1–3.2)

> Hauptphase, 1. und 2. Halbjahr (hier Klassenstufe 12): Themenfelder für Grund- und Leistungskurs; LK = nur im Leistungskurs. Die Nummern sind die des Lehrplans.

### 1.1 Gravitationsfeld
*EN: Gravitational field*

- Kurz (DE): Gravitationsgesetz und Gravitationsfeld, Bahndaten von Himmelskörpern nur für Kreisbahnen, ohne Keplersche Gesetze.
- Kurz (EN): The law of gravitation and the gravitational field, orbital data of celestial bodies for circular orbits only, without Kepler’s laws.
- Simulationen: `planetenbahnen`

### 1.2 Elektrisches Feld
*EN: Electric field*

- Kurz (DE): Feldlinien und Feldstärke, Plattenkondensator und Kapazität, Energie im elektrischen Feld.
- Kurz (EN): Field lines and field strength, the parallel-plate capacitor and capacitance, energy in the electric field.
- Simulationen: `feldlinien`, `kondensator`

### 1.3 Magnetisches Feld
*EN: Magnetic field*

- Kurz (DE): Magnetfelder von Leitern und Spulen, magnetische Flussdichte.
- Kurz (EN): Magnetic fields of conductors and coils, magnetic flux density.
- Simulationen: –

### 1.4 Bewegung von Ladungsträgern in Feldern
*EN: Motion of charge carriers in fields*

- Kurz (DE): Geladene Teilchen im elektrischen und magnetischen Feld, Lorentzkraft.
- Kurz (EN): Charged particles in electric and magnetic fields, the Lorentz force.
- Simulationen: `lorentzkraft`

### 2 Elektromagnetische Induktion
*EN: Electromagnetic induction*

- Kurz (DE): Induktionsgesetz; LK: Selbstinduktion und Energie des magnetischen Feldes.
- Kurz (EN): The law of induction; LK: self-induction and the energy of the magnetic field.
- Simulationen: `induktion`

### 3.1 Mechanische Schwingungen
*EN: Mechanical oscillations*

- Kurz (DE): Harmonische Schwingungen von Feder- und Fadenpendel, gedämpfte Schwingungen; LK: erzwungene Schwingung und Resonanz.
- Kurz (EN): Harmonic oscillation of spring and simple pendulums, damped oscillation; LK: forced oscillation and resonance.
- Simulationen: `fadenpendel`, `federpendel`, `resonanz`

### 3.2 Mechanische Wellen
*EN: Mechanical waves*

- Kurz (DE): Ausbreitung und Kenngrößen von Wellen, Überlagerung und Interferenz, stehende Wellen.
- Kurz (EN): Propagation and parameters of waves, superposition and interference, standing waves.
- Simulationen: `wellen-ausbreitung`, `interferenz`, `stehende-wellen`

## Hauptphase, 3./4. Halbjahr (hier Klassenstufe 13)  
*Main phase, half-years 3/4 (here grade 13)*  
Jahrgangsstufe(n) im JSON: 13  
(Quelle: Lehrpläne Physik Hauptphase GK und LK (2023), Übersicht S. 5, Themenfelder 3.3–4)

> Hauptphase, 3. und 4. Halbjahr (hier Klassenstufe 13). LK = nur im Leistungskurs. Die Nummern sind die des Lehrplans.

### 3.3 Elektromagnetische Schwingungen
*EN: Electromagnetic oscillations*

- Kurz (DE): Elektromagnetischer Schwingkreis mit Thomsonscher Schwingungsgleichung; LK: Dämpfung, erzwungene Schwingung und Resonanz.
- Kurz (EN): The electromagnetic oscillating circuit with Thomson’s formula; LK: damping, forced oscillation and resonance.
- Simulationen: `resonanz`

### 3.4 Elektromagnetische Wellen
*EN: Electromagnetic waves*

- Kurz (DE): Entstehung und Eigenschaften elektromagnetischer Wellen.
- Kurz (EN): Generation and properties of electromagnetic waves.
- Simulationen: –

### 3.5 Wellenmodell des Lichts
*EN: Wave model of light*

- Kurz (DE): Beugung und Interferenz von Licht an Doppelspalt und Gitter.
- Kurz (EN): Diffraction and interference of light at a double slit and a grating.
- Simulationen: `doppelspalt`, `interferenz`

### 4 Quanten und Atome
*EN: Quanta and atoms*

- Kurz (DE): Photoeffekt und Photonenmodell, Materiewellen, Wahrscheinlichkeitsverhalten von Quantenobjekten, Emission und Absorption, quantenmechanisches Atommodell; LK: Röntgenstrahlung, Unbestimmtheitsrelation, Potenzialtopf.
- Kurz (EN): The photoelectric effect and the photon model, matter waves, probabilistic behaviour of quantum objects, emission and absorption, the quantum model of the atom; LK: X-rays, the uncertainty relation, the potential well.
- Simulationen: `photoeffekt`, `elektronenbeugung`, `doppelspalt`, `linienspektren`

# Teil C – JSON

Die vollständige JSON-Datei liegt separat bei: `saarland-gymnasium-physik.json` (erzeugt aus `src/curriculum/lehrplaene/saarland-gymnasium-physik.ts`, dieselben Daten).

# Teil D – Lücken und Vorschläge

## D.1 Nicht zugeordnete Simulationen (Ausnahmen in `NOT_IN_CURRICULUM`)

| Simulation | Grund |
|---|---|
| `schiefer-wurf` | Die Einführungsphase behandelt nur den senkrechten Wurf; laut Hauptphase steht der waagerechte Wurf „aus der Einführungsphase nicht zur Verfügung“ und dient nur als qualitativer Vergleichsversuch. |
| `doppler-effekt` | Der Doppler-Effekt steht in keinem der Lehrpläne. |

## D.2 Lern- und Unterbereiche ohne passende Simulation

- **8:** Druck (Schweredruck, Luftdruck, Auftrieb); Wahlthema oder Praktikum.
- **9:** Wahlthema oder Praktikum.
- **12:** 1.3 Magnetisches Feld.
- **13:** 3.4 Elektromagnetische Wellen.

## D.3 Vorschläge für neue Simulationen

| Vorschlag (Titel) | Idee | schließt Lücke in |
|---|---|---|
| Schwimmen, Schweben, Sinken | Körper mit Masse und Volumen in Flüssigkeiten verschiedener Dichte, Auftrieb und Gewichtskraft als Pfeile | 8, Druck |
| Magnetfeld von Leiter und Spule | Strom und Windungszahl regeln, Feldlinienbild und Flussdichte | 12, 1.3 |

# Teil E – Einordnung und Unklarheiten

1. **Neunjähriges Gymnasium, Zweige.** Ab Klasse 8 gibt es je Zweig eigene Lehrpläne (naturwissenschaftlicher Zweig, sprachlicher Zweig mit zweistündigem Physikunterricht, Informatik-Zweig). Abgebildet ist der NW-Zweig (Annahme, bitte prüfen), weil er die meisten Physik-Inhalte hat. Die anderen Zweige verschieben Themen: Im zweistündigen Lehrplan 8 kommen Brechung und Linsen schon in 8, der Informatik-Zweig hat in 9 und 10 Halbleiterschaltungstechnik und in 9 keine Optik, und in 10 behandelt der zweistündige Lehrplan noch einmal die Gesetze des Stromkreises. Für 9 im sprachlichen Zweig wurde kein Lehrplan geliefert.
2. **Oberstufe (Annahme, bitte prüfen).** Einführungsphase = 11, Hauptphase 1./2. Halbjahr = 12, 3./4. Halbjahr = 13. Die Oberstufenlehrpläne sind von 2023 und nennen keine Klassenstufen.
3. **Nummern.** Sek. I und Einführungsphase: Die Themenfelder haben im Lehrplan keine Nummern; die Nummern sind selbst vergeben. Hauptphase: die Nummern des Lehrplans. „Umgang mit Messdaten in der Physik“ (Messunsicherheiten) gilt in allen Klassenstufen und steht nicht als eigener Lernbereich.
4. **`sourceUrl`.** Die Lehrpläne nennen keinen Link zur Datei und keine Adresse des Ministeriums. Eingetragen ist `https://www.saarland.de/mbk`. Erreichbarkeit hier nicht geprüft.
5. **Erweiterte Klassenstufen** (in `src/curriculum/physik.ts`):

   | ID | bisher | neu | Lernbereich | Fundstelle |
   |---|---|---|---|---|
   | `ohmsches-gesetz` | 8–9 | 7–9 | 7, 1 Grundlagen der Elektrizität | Lehrplan Physik 7, Themenfeld „Grundlagen der Elektrizität“: Ohm’sches Gesetz |

6. **Unsichere Zuordnungen (Entwurf, bitte am Lehrplan prüfen):**
   - `schiefe-ebene` bei 11, 1: nur als Versuchshinweis (schiefe Ebene mit Auslauf).
   - `gasgesetze` bei 8, 4 und 10, 3: Zustandsgleichung idealer Gase in 8, Zustandsänderungen in 10.
   - `planetenbahnen` bei 10, 5 (nur im Wahlthema Astronomie) und 12, 1.1 (im GK ausdrücklich ohne Keplersche Gesetze, nur Kreisbahnen).
   - `resonanz` bei 12, 3.1 und 13, 3.3: erzwungene Schwingungen und Resonanz nur im Leistungskurs.
   - `lorentzkraft` bei 10, 1: stromdurchflossene Leiter im Magnetfeld; die Simulation zeigt bewegte Ladungen.
