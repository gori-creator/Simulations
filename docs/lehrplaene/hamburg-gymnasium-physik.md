# Hamburg · Gymnasium · Physik – Lehrplan-Aufbereitung mit Simulationszuordnung

# Teil A – Überblick

| Merkmal | Bildungspläne Sekundarstufe I und Studienstufe |
|---|---|
| Bundesland | Hamburg |
| Schulart | Gymnasium, Physik in den Jahrgangsstufen 7–12 (in 5/6 Teil des Fachs Naturwissenschaften und Technik, NWT, nicht abgebildet) |
| Fach | Physik |
| Name des Lehrplans (Sek. I) | „Bildungsplan Gymnasium Sekundarstufe I, Physik“, Herausgeber: Freie und Hansestadt Hamburg, Behörde für Schule und Berufsbildung |
| Jahr / Stand (Sek. I) | Hamburg 2024 (Redaktion 2022) |
| Name des Lehrplans (Studienstufe) | „Bildungsplan Studienstufe, Physik“, Behörde für Schule und Berufsbildung (auf dem Titelblatt steht zusätzlich der Text „-Fach- Bildungsplan Gymnasium Sekundarstufe I“) |
| Jahr / Stand (Studienstufe) | Hamburg 2022 |
| Dateien (von der Projektleitung geliefert, nicht im Repository) | `physik-data.pdf` (46 Seiten) und `physik-gyo-2022-data.pdf` (34 Seiten) |
| Link laut Dokument | „www.hamburg.de/bildungsplaene“ (letzte Seite); in `sourceUrl` `https://www.hamburg.de/bildungsplaene`, kein Link zur einzelnen Datei |
| G8/G9 | G8 am Gymnasium: Sek. I bis 10 (Einführung in die Oberstufe in 10), Studienstufe hier 11 und 12 |
| Niveaus / Wahl | Studienstufe: grundlegendes und erhöhtes Anforderungsniveau (eA kursiv); Wahlthema Gravitation und Astrophysik |
| Struktur | Sek. I: drei Themenfelder (E-Lehre, Mechanik, Strahlung und Materie) mit acht Themen, laut Übersicht 7/8, 8/9 und 10 (Kap. 2.3, S. 29–46); Optik ist vollständig in NWT 5/6 verschoben. Studienstufe: vier Themenbereiche mit zehn Themen, alle für S1–S4 ohne feste Reihenfolge (Kap. 2.3, S. 21–34) |

| Stufe (Lehrplan) | JSON-Jahrgang | Lernbereiche | Unterbereiche | Bereiche mit Simulation (Unterbereiche bzw. Lernbereiche ohne Unterbereiche) | zugeordnete Simulationen (verschieden) |
|---|---|---|---|---|---|
| Jahrgangsstufe 7 (Themen für 7/8) | 7 | 2 | 0 | 2 | 6 |
| Jahrgangsstufe 8 (Themen für 7/8 und 8/9) | 8 | 6 | 0 | 6 | 11 |
| Jahrgangsstufe 9 (Themen für 8/9) | 9 | 4 | 0 | 4 | 9 |
| Jahrgangsstufe 10 | 10 | 2 | 0 | 1 | 6 |
| Studienstufe (Jahrgangsstufen 11/12) | 11, 12 | 10 | 0 | 9 | 15 |

Insgesamt verwendet: **30 von 36** fertigen Simulationen für Physik.

Nicht zugeordnet (Grund siehe Teil D): `doppler-effekt`, `licht-schatten`, `reflexion`, `brechung`, `linsen`, `gasgesetze`

# Teil B – Lehrplan im Detail

Simulationen stehen bei allen Jahrgängen einer Stufe, sofern nicht in Klammern einzelne Jahrgänge genannt sind (dann passt die Simulation nach ihren Klassenstufen nur dort).

## Jahrgangsstufe 7 (Themen für 7/8)  
*Grade 7 (topics for 7/8)*  
Jahrgangsstufe(n) im JSON: 7  
(Quelle: Bildungsplan Gymnasium Sek. I Physik (2024), Kap. 2.3, Übersicht S. 29, Themen S. 30–33)

> Jahrgangsstufe 7: Die Übersicht des Bildungsplans ordnet die Themen den Jahrgangsstufen 7/8, 8/9 und 10 zu; in 7 stehen die Themen für 7/8. Optik wird vollständig im Fach Naturwissenschaften und Technik (NWT) in 5/6 unterrichtet. Die Nummern sind die des Bildungsplans (Themenfeld.Thema).

### 1.1 Elektrostatik und der Stromkreis als System (7/8)
*EN: Electrostatics and the circuit as a system (7/8)*

- Kurz (DE): Reibungselektrizität und zwei Ladungsarten, Elektron und einfaches Atommodell, Leiter und Nichtleiter, Spannung als elektrischer Druckunterschied, Strom im geschlossenen Stromkreis.
- Kurz (EN): Static electricity and two kinds of charge, the electron and a simple atomic model, conductors and insulators, voltage as an electrical pressure difference, current in a closed circuit.
- Simulationen: `einfacher-stromkreis`, `reihe-parallel`

### 2.1 Bewegung, Kraft und Energie (7/8)
*EN: Motion, force and energy (7/8)*

- Kurz (DE): Geschwindigkeit aus Tempo und Richtung, gleichförmige Bewegung, t-s- und t-v-Diagramme, Zusatzgeschwindigkeit und Kraft, Verformung und Kraftmessung, Trägheit und Wechselwirkung, einfache Maschinen, Energiebilanzen.
- Kurz (EN): Velocity from speed and direction, uniform motion, distance-time and velocity-time graphs, change of velocity and force, deformation and measuring force, inertia and interaction, simple machines, energy balances.
- Simulationen: `bewegungsdiagramme`, `hookesches-gesetz`, `hebelgesetz`, `energieerhaltung`

## Jahrgangsstufe 8 (Themen für 7/8 und 8/9)  
*Grade 8 (topics for 7/8 and 8/9)*  
Jahrgangsstufe(n) im JSON: 8  
(Quelle: Bildungsplan Gymnasium Sek. I Physik (2024), Kap. 2.3, Übersicht S. 29, Themen S. 30–42)

> Jahrgangsstufe 8: Die Themen für 7/8 und für 8/9 überschneiden sich in Jahrgangsstufe 8; deshalb stehen hier beide. Die Reihenfolge der Themen ist zu beachten. Die Nummern sind die des Bildungsplans (Themenfeld.Thema).

### 1.1 Elektrostatik und der Stromkreis als System (7/8)
*EN: Electrostatics and the circuit as a system (7/8)*

- Kurz (DE): Reibungselektrizität und zwei Ladungsarten, Elektron und einfaches Atommodell, Leiter und Nichtleiter, Spannung als elektrischer Druckunterschied, Strom im geschlossenen Stromkreis.
- Kurz (EN): Static electricity and two kinds of charge, the electron and a simple atomic model, conductors and insulators, voltage as an electrical pressure difference, current in a closed circuit.
- Simulationen: `einfacher-stromkreis`, `reihe-parallel`

### 2.1 Bewegung, Kraft und Energie (7/8)
*EN: Motion, force and energy (7/8)*

- Kurz (DE): Geschwindigkeit aus Tempo und Richtung, gleichförmige Bewegung, t-s- und t-v-Diagramme, Zusatzgeschwindigkeit und Kraft, Verformung und Kraftmessung, Trägheit und Wechselwirkung, einfache Maschinen, Energiebilanzen.
- Kurz (EN): Velocity from speed and direction, uniform motion, distance-time and velocity-time graphs, change of velocity and force, deformation and measuring force, inertia and interaction, simple machines, energy balances.
- Simulationen: `bewegungsdiagramme`, `hookesches-gesetz`, `hebelgesetz`, `energieerhaltung`, `kraefteaddition`, `schiefe-ebene`

### 1.2 Widerstand, Energie und Leistung, Induktion (8/9)
*EN: Resistance, energy and power, induction (8/9)*

- Kurz (DE): Elektrischer Widerstand und ohmsches Gesetz, Schaltpläne, Spannungen, Ströme und Leistung von Haushaltsgeräten, elektrische Energie, Generator und Transformator.
- Kurz (EN): Electrical resistance and Ohm’s law, circuit diagrams, voltage, current and power of household appliances, electrical energy, generator and transformer.
- Simulationen: `einfacher-stromkreis`, `reihe-parallel`, `ohmsches-gesetz`

### 3.1 Atomkerne, Kräfte und Radioaktivität (8/9)
*EN: Atomic nuclei, forces and radioactivity (8/9)*

- Kurz (DE): Aufbau des Atomkerns, Isotope und Kernkräfte, Strahlungsarten, Spontanzerfall, Aktivität und Halbwertszeit, Absorption, biologische Wirkung und Strahlenschutz, Nutzen und Gefahren.
- Kurz (EN): Structure of the nucleus, isotopes and nuclear forces, types of radiation, spontaneous decay, activity and half-life, absorption, biological effects and radiation protection, benefits and dangers.
- Simulationen: `radioaktiver-zerfall`

### 3.2 Thermische Energie, Strahlungshaushalt und Treibhauseffekt (8/9)
*EN: Thermal energy, radiation budget and greenhouse effect (8/9)*

- Kurz (DE): Temperatur als Maß für die Bewegungsenergie der Teilchen, Wärmetransport, elektromagnetisches Spektrum, Strahlungsgleichgewicht der Erde, Atmosphäre und Treibhauseffekt.
- Kurz (EN): Temperature as a measure of the kinetic energy of particles, heat transfer, the electromagnetic spectrum, the Earth’s radiation balance, the atmosphere and the greenhouse effect.
- Simulationen: `teilchenmodell`

### 2.2 Beschleunigte Bewegung und Energieerhaltung (8/9)
*EN: Accelerated motion and conservation of energy (8/9)*

- Kurz (DE): Kraftstoß und Beschleunigung, gleichmäßig beschleunigte Bewegung und freier Fall, Reibung, Bewegungsdiagramme mit Messwerterfassung, kinetische und potenzielle Energie, Energieerhaltung.
- Kurz (EN): Impulse and acceleration, uniformly accelerated motion and free fall, friction, motion graphs from measured data, kinetic and potential energy, conservation of energy.
- Simulationen: `bewegungsdiagramme`, `energieerhaltung`

## Jahrgangsstufe 9 (Themen für 8/9)  
*Grade 9 (topics for 8/9)*  
Jahrgangsstufe(n) im JSON: 9  
(Quelle: Bildungsplan Gymnasium Sek. I Physik (2024), Kap. 2.3, Übersicht S. 29, Themen S. 34–42)

> Jahrgangsstufe 9: Themen für 8/9. Alle für den Mittleren Schulabschluss nötigen Inhalte sind bis zum Ende von Jahrgangsstufe 9 eingeführt. Die Nummern sind die des Bildungsplans (Themenfeld.Thema).

### 1.2 Widerstand, Energie und Leistung, Induktion (8/9)
*EN: Resistance, energy and power, induction (8/9)*

- Kurz (DE): Elektrischer Widerstand und ohmsches Gesetz, Schaltpläne, Spannungen, Ströme und Leistung von Haushaltsgeräten, elektrische Energie, Generator und Transformator.
- Kurz (EN): Electrical resistance and Ohm’s law, circuit diagrams, voltage, current and power of household appliances, electrical energy, generator and transformer.
- Simulationen: `einfacher-stromkreis`, `reihe-parallel`, `ohmsches-gesetz`, `induktion`

### 3.1 Atomkerne, Kräfte und Radioaktivität (8/9)
*EN: Atomic nuclei, forces and radioactivity (8/9)*

- Kurz (DE): Aufbau des Atomkerns, Isotope und Kernkräfte, Strahlungsarten, Spontanzerfall, Aktivität und Halbwertszeit, Absorption, biologische Wirkung und Strahlenschutz, Nutzen und Gefahren.
- Kurz (EN): Structure of the nucleus, isotopes and nuclear forces, types of radiation, spontaneous decay, activity and half-life, absorption, biological effects and radiation protection, benefits and dangers.
- Simulationen: `radioaktiver-zerfall`

### 3.2 Thermische Energie, Strahlungshaushalt und Treibhauseffekt (8/9)
*EN: Thermal energy, radiation budget and greenhouse effect (8/9)*

- Kurz (DE): Temperatur als Maß für die Bewegungsenergie der Teilchen, Wärmetransport, elektromagnetisches Spektrum, Strahlungsgleichgewicht der Erde, Atmosphäre und Treibhauseffekt.
- Kurz (EN): Temperature as a measure of the kinetic energy of particles, heat transfer, the electromagnetic spectrum, the Earth’s radiation balance, the atmosphere and the greenhouse effect.
- Simulationen: `teilchenmodell`

### 2.2 Beschleunigte Bewegung und Energieerhaltung (8/9)
*EN: Accelerated motion and conservation of energy (8/9)*

- Kurz (DE): Kraftstoß und Beschleunigung, gleichmäßig beschleunigte Bewegung und freier Fall, Reibung, Bewegungsdiagramme mit Messwerterfassung, kinetische und potenzielle Energie, Energieerhaltung.
- Kurz (EN): Impulse and acceleration, uniformly accelerated motion and free fall, friction, motion graphs from measured data, kinetic and potential energy, conservation of energy.
- Simulationen: `bewegungsdiagramme`, `freier-fall`, `energieerhaltung`

## Jahrgangsstufe 10  
*Grade 10*  
Jahrgangsstufe(n) im JSON: 10  
(Quelle: Bildungsplan Gymnasium Sek. I Physik (2024), Kap. 2.3, Übersicht S. 29, Themen S. 43–46)

> Jahrgangsstufe 10: Einführung in die Oberstufe am Gymnasium; die Inhalte entsprechen zum Teil schon der Oberstufe. Die Nummern sind die des Bildungsplans (Themenfeld.Thema).

### 1.3 Magnetfelder und Elektromagnetismus
*EN: Magnetic fields and electromagnetism*

- Kurz (DE): Magnetfelder von geradem Leiter und Spule, Feldlinienmodell und Feldkonzept, Elektromagnet, Relais und Elektromotor, Transport und Speicherung elektrischer Energie.
- Kurz (EN): Magnetic fields of a straight conductor and a coil, the field line model and field concept, electromagnet, relay and electric motor, transport and storage of electrical energy.
- Simulationen: –

### 2.3 Überlagerte Bewegungen, Kreisbewegung, Impuls und Impulserhaltung, Schwingungen
*EN: Superposed motion, circular motion, momentum and its conservation, oscillations*

- Kurz (DE): Waagerechter und senkrechter Wurf mit Superpositionsprinzip, Impuls und Impulserhaltung mit Stößen, Kreisbewegung und Zentripetalkraft, Bezugssysteme, harmonische Schwingungen; optional Satellitenbahnen.
- Kurz (EN): Horizontal and vertical projection with the superposition principle, momentum and its conservation with collisions, circular motion and centripetal force, frames of reference, harmonic oscillation; optionally satellite orbits.
- Simulationen: `kreisbewegung`, `schiefer-wurf`, `stoesse`, `planetenbahnen`, `fadenpendel`, `federpendel`

## Studienstufe (Jahrgangsstufen 11/12)  
*Studienstufe (grades 11/12)*  
Jahrgangsstufe(n) im JSON: 11, 12  
(Quelle: Bildungsplan Studienstufe Physik (2022), Kap. 2.3, S. 21–34)

> Studienstufe (am Gymnasium mit Abitur nach Klasse 12: Jahrgangsstufen 11 und 12): Der Bildungsplan ordnet alle Themen den Semestern S1–S4 zu, ohne Reihenfolge; die Lernbereiche stehen deshalb bei 11 und 12 gleich und werden als eine Stufe gezeigt. Gravitation und Astrophysik ist ein Wahlthema. eA = nur auf erhöhtem Anforderungsniveau. Die Nummern sind die des Bildungsplans (Themenbereich.Thema).

### 1.1 Das Feldkonzept zur Beschreibung von Wechselwirkungen
*EN: The field concept for describing interactions*

- Kurz (DE): Elektrische Feldtypen und Feldlinienbilder, Feldstärke und Spannung, Coulombsches Gesetz, Plattenkondensator mit Kapazität und Energie, Auf- und Entladen, magnetische Flussdichte von Spulen.
- Kurz (EN): Types of electric field and field line patterns, field strength and voltage, Coulomb’s law, the parallel-plate capacitor with capacitance and energy, charging and discharging, magnetic flux density of coils.
- Simulationen: `feldlinien`, `kondensator`

### 1.2 Körper in statischen Feldern
*EN: Bodies in static fields*

- Kurz (DE): Kräfte und Bahnen geladener Teilchen im elektrischen Feld, Lorentzkraft und Kreisbahnen im Magnetfeld, Hall-Effekt, Teilchen in senkrecht zueinander stehenden Feldern.
- Kurz (EN): Forces on and paths of charged particles in electric fields, the Lorentz force and circular paths in magnetic fields, the Hall effect, particles in perpendicular fields.
- Simulationen: `lorentzkraft`

### 1.3 Veränderliche elektromagnetische Felder
*EN: Changing electromagnetic fields*

- Kurz (DE): Magnetischer Fluss und Induktionsgesetz, Lenzsche Regel, technische Anwendungen; eA: differenzielle Form, Induktivität und Selbstinduktion.
- Kurz (EN): Magnetic flux and the law of induction, Lenz’s law, technical applications; eA: differential form, inductance and self-induction.
- Simulationen: `induktion`

### 2.1 Schwingungen
*EN: Oscillations*

- Kurz (DE): Lineares Kraftgesetz und harmonische Schwingung, schwache Dämpfung, Resonanz bei erzwungenen Schwingungen, elektromagnetischer Schwingkreis im Vergleich.
- Kurz (EN): Linear force law and harmonic oscillation, weak damping, resonance in forced oscillation, the electromagnetic oscillating circuit by comparison.
- Simulationen: `fadenpendel`, `federpendel`, `resonanz`

### 2.2 Eigenschaften und Ausbreitung von Wellen
*EN: Properties and propagation of waves*

- Kurz (DE): Erzeugung und Ausbreitung harmonischer Wellen, Transversal- und Longitudinalwellen, Ausbreitungsgeschwindigkeit und Wellenlänge, Beugung, Reflexion und Brechung, Polarisation, elektromagnetisches Spektrum.
- Kurz (EN): Generation and propagation of harmonic waves, transverse and longitudinal waves, speed and wavelength, diffraction, reflection and refraction, polarisation, the electromagnetic spectrum.
- Simulationen: `wellen-ausbreitung`

### 2.3 Überlagerung von Wellen
*EN: Superposition of waves*

- Kurz (DE): Superposition und Interferenz, Doppelspalt mit ein- und mehrfarbigem Licht, Wellenlängenbestimmung, Einzelspalt und Interferometer, stehende Wellen.
- Kurz (EN): Superposition and interference, the double slit with monochromatic and white light, measuring wavelength, single slit and interferometer, standing waves.
- Simulationen: `interferenz`, `doppelspalt`, `stehende-wellen`

### 3.1 Quantenobjekte
*EN: Quantum objects*

- Kurz (DE): Elektron und Photon als Quantenobjekte, stochastische Vorhersagbarkeit, Fotoeffekt und h-Bestimmung, De-Broglie-Beziehung, Unbestimmtheit; eA: Verschränkung.
- Kurz (EN): Electron and photon as quantum objects, stochastic predictability, the photoelectric effect and measuring h, the de Broglie relation, uncertainty; eA: entanglement.
- Simulationen: `doppelspalt`, `photoeffekt`, `elektronenbeugung`
- Jahrgänge je Simulation: `doppelspalt`, `photoeffekt` (12), `elektronenbeugung` (12)

### 3.2 Atomvorstellungen
*EN: Models of the atom*

- Kurz (DE): Energiestufenmodell, Emission und Absorption von Photonen, Linienspektren, Röntgenspektrum, Orbitale und Nachweiswahrscheinlichkeiten.
- Kurz (EN): The energy level model, emission and absorption of photons, line spectra, the X-ray spectrum, orbitals and detection probabilities.
- Simulationen: `linienspektren`
- Jahrgänge je Simulation: `linienspektren` (12)

### 4.1 Planetenbewegungen (Wahlthema)
*EN: Planetary motion (elective topic)*

- Kurz (DE): Gravitationskraft und Gravitationsfeld, Keplersche Gesetze, Bahnen, Umlaufzeiten und Zentralkörpermassen; eA: Gravitationspotenzial und Fluchtgeschwindigkeiten.
- Kurz (EN): Gravitational force and field, Kepler’s laws, orbits, periods and central masses; eA: gravitational potential and escape velocities.
- Simulationen: `planetenbahnen`

### 4.2 Aspekte der Astrophysik (Wahlthema)
*EN: Aspects of astrophysics (elective topic)*

- Kurz (DE): Himmelsbeobachtung und Instrumente, Raumzeit, Sternentwicklung und schwarze Löcher, Gravitationswellen, Skalen im Universum, Strahlungsbilanzen von Planeten.
- Kurz (EN): Observing the sky and instruments, spacetime, stellar evolution and black holes, gravitational waves, scales in the universe, radiation budgets of planets.
- Simulationen: –

# Teil C – JSON

Die vollständige JSON-Datei liegt separat bei: `hamburg-gymnasium-physik.json` (erzeugt aus `src/curriculum/lehrplaene/hamburg-gymnasium-physik.ts`, dieselben Daten).

# Teil D – Lücken und Vorschläge

## D.1 Nicht zugeordnete Simulationen (Ausnahmen in `NOT_IN_CURRICULUM`)

| Simulation | Grund |
|---|---|
| `licht-schatten`, `reflexion`, `brechung` | „Das Themenfeld Optik wurde vollständig in NWT verschoben“ (Sek. I, S. 29); NWT 5/6 ist kein Physikunterricht und nicht abgebildet. |
| `linsen` | Strahlenoptik in NWT 5/6; in der Studienstufe kommen Linsen und Spiegel nur im Wahlthema Astrophysik vor, dafür passt die Simulation nach Klassenstufen (bis 10) nicht. |
| `doppler-effekt` | Der Doppler-Effekt steht in keinem der beiden Bildungspläne. |
| `gasgesetze` | Gasgesetze stehen nicht im Bildungsplan; die Sek. I behandelt nur Temperatur und absoluten Nullpunkt im Teilchenmodell. |

## D.2 Lern- und Unterbereiche ohne passende Simulation

- **10:** 1.3 Magnetfelder und Elektromagnetismus (Magnetfeld von Leiter und Spule, Elektromotor).
- **11/12:** 4.2 Aspekte der Astrophysik (Wahlthema).

## D.3 Vorschläge für neue Simulationen

| Vorschlag (Titel) | Idee | schließt Lücke in |
|---|---|---|
| Magnetfeld von Leiter und Spule | Strom und Windungszahl regeln, Feldlinienbild und Kompassnadeln zeigen, Elektromagnet ein- und ausschalten | 10, 1.3 |
| Strahlungsbilanz der Erde | Albedo und Treibhausgase regeln, Gleichgewichtstemperatur nach Stefan-Boltzmann ablesen | 8/9, 3.2 und 11/12, 4.2 |

# Teil E – Einordnung und Unklarheiten

1. **Zwei Bildungspläne, G8.** Für 7–10 gilt der Bildungsplan Gymnasium Sekundarstufe I, Physik (Hamburg 2024, Redaktion 2022), für die Oberstufe der Bildungsplan Studienstufe, Physik (2022). Laut Sek.-I-Plan hat die Einführung in die Oberstufe am Gymnasium in Jahrgangsstufe 10 zu erfolgen. Die Studienstufe habe ich als 11 und 12 eingetragen; die Dokumente nennen keine Jahrgangszahlen.
2. **Sek. I nach der Übersicht.** Die Übersicht (S. 29) ordnet die Themen 7/8 (1.1, 2.1), 8/9 (1.2, 3.1, 3.2, 2.2) und 10 (1.3, 2.3) zu. Weil sich 7/8 und 8/9 in Jahrgangsstufe 8 überschneiden, stehen bei 8 alle sechs Themen (Annahme, bitte prüfen). Die Abfolge der Themen ist laut Plan zu beachten. Die Nummern sind die des Bildungsplans (Themenfeld.Thema).
3. **Optik.** Optik ist vollständig in das Fach Naturwissenschaften und Technik (NWT) der Jahrgangsstufen 5 und 6 verschoben. Deshalb stehen die Simulationen zur Strahlenoptik nicht im Physik-Lehrplan; Wellenoptik (Doppelspalt, Interferenz) kommt in der Studienstufe vor.
4. **Studienstufe.** Alle Themen sind S1–S4 zugeordnet und müssen nicht in der dargestellten Reihenfolge behandelt werden; die Lernbereiche stehen deshalb bei 11 und 12 gleich und werden als eine Stufe gezeigt. Themenbereich 4 (Gravitation und Astrophysik) ist ein Wahlthema.
5. **Auffälligkeit im Dokument.** Auf dem Titelblatt des Bildungsplans Studienstufe Physik steht unter „Bildungsplan Studienstufe Physik“ zusätzlich „-Fach- Bildungsplan Gymnasium Sekundarstufe I“, vermutlich ein Rest der Vorlage. Inhalt und Gliederung gehören zur Studienstufe.
6. **`sourceUrl`.** Die Dokumente nennen „www.hamburg.de/bildungsplaene“, aber keinen Link zur Datei. Eingetragen ist `https://www.hamburg.de/bildungsplaene`. Erreichbarkeit hier nicht geprüft.
7. **Erweiterte Klassenstufen** (in `src/curriculum/physik.ts`):

   | ID | bisher | neu | Lernbereich | Fundstelle |
   |---|---|---|---|---|
   | `radioaktiver-zerfall` | 9–13 | 8–13 | 8, 3.1 Atomkerne, Kräfte und Radioaktivität | Bildungsplan Sek. I Physik, Übersicht S. 29: Thema 3.1 in 8/9 |

8. **Unsichere Zuordnungen (Entwurf, bitte am Bildungsplan prüfen):**
   - `schiefe-ebene` bei 2.1: nur über „einfache Maschinen“; genannt sind Hebel und Flaschenzug.
   - `kraefteaddition` bei 2.1: Zusatzgeschwindigkeit und Kraft als Pfeile (Vektordiagramme), die Kräfteaddition selbst ist nicht ausdrücklich genannt.
   - `teilchenmodell` bei 3.2: Temperatur als Maß für die Bewegungsenergie der Teilchen.
   - `induktion` bei 1.2: Generator und Transformator.
   - `planetenbahnen` bei 10, 2.3: nur optional (Gravitationskraft und Satellitenbahnen).
   - `fadenpendel` und `federpendel` bei 10, 2.3: harmonische Schwingungen.
