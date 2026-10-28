# Brandenburg · Gymnasium · Physik – Lehrplan-Aufbereitung mit Simulationszuordnung

# Teil A – Überblick

| Merkmal | Sekundarstufe I (Rahmenlehrplan 7–10) und gymnasiale Oberstufe |
|---|---|
| Bundesland | Brandenburg (die Rahmenlehrpläne gelten gemeinsam für Berlin und Brandenburg; Aufbereitung aus der Berliner Fassung übernommen) |
| Schulart | Gymnasium, Physik in den Jahrgangsstufen 7–12 (in 5/6 ist Physik Teil des Fachs Naturwissenschaften und nicht abgebildet) |
| Fach | Physik |
| Name des Lehrplans (Sek. I) | „Rahmenlehrplan für die Jahrgangsstufen 7–10, Teil C Physik“ (gelieferte Datei ohne Titelblatt und Impressum) |
| Jahr / Stand (Sek. I) | in der gelieferten Datei nicht angegeben |
| Name des Lehrplans (Oberstufe) | „Rahmenlehrplan für die gymnasiale Oberstufe, Teil C Physik“, erarbeitet vom LISUM, Herausgeber: Senatsverwaltung für Bildung, Jugend und Familie Berlin und Ministerium für Bildung, Jugend und Sport des Landes Brandenburg |
| Jahr / Stand (Oberstufe) | 2021; gültig für die Qualifikationsphase ab dem Schuljahr 2023/24 |
| Dateien (von der Projektleitung geliefert, nicht im Repository) | `sek_1_berlin_physik.pdf` (53 Seiten) und `rlp_go_teil_c_physik_2021.pdf` (44 Seiten) |
| Link laut Dokument | kein Link zur Datei; in `sourceUrl` die Startseite des Bildungsservers Berlin-Brandenburg `https://bildungsserver.berlin-brandenburg.de/` (Vermerk im Pull Request) |
| G8/G9 | G8 am Gymnasium: Abitur nach Jahrgangsstufe 12, Qualifikationsphase 11/12 (Q1–Q4). Die Einführungsphase des Oberstufenlehrplans gilt für dreijährige Oberstufen (in Brandenburg Gesamtschulen und berufliche Gymnasien) und ist nicht abgebildet |
| Niveaus / Wahl | Sek. I: Standards nach Niveaustufen (Gymnasium in Brandenburg wie in Berlin: 7 = E, 8 = F, 9 = G, 10 = H), Inhalte der Themenfelder je Doppeljahrgangsstufe verbindlich. Oberstufe: Grund- und Leistungskurs (LK-Inhalte zusätzlich), Reihenfolge der Themenfelder verbindlich |
| Struktur | Sek. I: Themenfelder 3.1–3.6 für 7/8 und 3.7–3.13 für 9/10 (3.5 und 3.6 auch in 9/10 möglich; Kap. 3, S. 27–52). Oberstufe: Wahlpflichtthemen der Einführungsphase 3.1.1–3.1.5 (S. 17–22) und Themenfelder der Qualifikationsphase 3.2.1–3.2.7 (S. 23–44) |

| Stufe (Lehrplan) | JSON-Jahrgang | Lernbereiche | Unterbereiche | Bereiche mit Simulation (Unterbereiche bzw. Lernbereiche ohne Unterbereiche) | zugeordnete Simulationen (verschieden) |
|---|---|---|---|---|---|
| Doppeljahrgangsstufe 7/8 | 7, 8 | 6 | 0 | 6 | 10 |
| Doppeljahrgangsstufe 9/10 | 9, 10 | 9 | 0 | 9 | 19 |
| Qualifikationsphase Q1/Q2 (Jahrgangsstufe 11) | 11 | 4 | 0 | 4 | 8 |
| Qualifikationsphase Q3/Q4 (Jahrgangsstufe 12) | 12 | 3 | 0 | 3 | 7 |

Insgesamt verwendet: **32 von 36** fertigen Simulationen für Physik.

Nicht zugeordnet (Grund siehe Teil D): `stoesse`, `schiefer-wurf`, `doppler-effekt`, `licht-schatten`

# Teil B – Lehrplan im Detail

Simulationen stehen bei allen Jahrgängen einer Stufe, sofern nicht in Klammern einzelne Jahrgänge genannt sind (dann passt die Simulation nach ihren Klassenstufen nur dort).

## Doppeljahrgangsstufe 7/8  
*Grades 7/8*  
Jahrgangsstufe(n) im JSON: 7, 8  
(Quelle: Rahmenlehrplan 7–10, Teil C Physik, Kap. 3, S. 27–38 (Themenfelder 3.1–3.6))

> Doppeljahrgangsstufe 7/8: Die Inhalte der Themenfelder sind in der Doppeljahrgangsstufe verbindlich; die Lernbereiche stehen deshalb bei 7 und 8 gleich und werden als eine Stufe gezeigt. Die Themenfelder 3.5 und 3.6 (Elektrizität) können je nach Stundentafel auch in 9/10 unterrichtet werden. Die Themenfelder sind im Rahmenlehrplan nummeriert.

### 3.1 Thermisches Verhalten von Körpern
*EN: Thermal behaviour of bodies*

- Kurz (DE): Ausdehnung fester, flüssiger und gasförmiger Körper bei Temperaturänderung, Dichte, Druck und Temperatur eines Gases, Aggregatzustände im Teilchenmodell.
- Kurz (EN): Expansion of solids, liquids and gases with temperature, density, pressure and temperature of a gas, states of matter in the particle model.
- Simulationen: `teilchenmodell`, `gasgesetze`
- Jahrgänge je Simulation: `teilchenmodell`, `gasgesetze` (8)

### 3.2 Wechselwirkung und Kraft
*EN: Interaction and force*

- Kurz (DE): Kraft als Wechselwirkung zweier Körper, Kraftpfeil, Kräfte messen, Gewichtskraft und hookesches Gesetz.
- Kurz (EN): Force as an interaction between two bodies, force arrows, measuring forces, weight and Hooke’s law.
- Simulationen: `hookesches-gesetz`, `kraefteaddition`
- Jahrgänge je Simulation: `hookesches-gesetz`, `kraefteaddition` (8)

### 3.3 Mechanische Energie und Arbeit
*EN: Mechanical energy and work*

- Kurz (DE): Energieformen, potenzielle Energie, mechanische Arbeit und Leistung, Goldene Regel der Mechanik und Energieerhaltungssatz.
- Kurz (EN): Forms of energy, potential energy, mechanical work and power, the golden rule of mechanics and conservation of energy.
- Simulationen: `energieerhaltung`, `hebelgesetz`, `schiefe-ebene`
- Jahrgänge je Simulation: `energieerhaltung`, `hebelgesetz`, `schiefe-ebene` (8)

### 3.4 Thermische Energie und Wärme
*EN: Thermal energy and heat*

- Kurz (DE): Thermische Energie und Wärme, Temperaturausgleich, Schmelz- und Verdampfungswärme, Wärmeleitung, -strömung und -strahlung im Teilchenmodell.
- Kurz (EN): Thermal energy and heat, temperature equalisation, latent heat of melting and vaporisation, conduction, convection and radiation in the particle model.
- Simulationen: `teilchenmodell`

### 3.5 Elektrischer Strom und elektrische Ladung
*EN: Electric current and electric charge*

- Kurz (DE): Einfache Stromkreise mit Energiequelle, Schalter und Energiewandler, Wirkungen des Stroms, Ladung und Elektroskop, Modell der elektrischen Feldlinie, Strom als bewegte Ladung.
- Kurz (EN): Simple circuits with source, switch and converter, effects of current, charge and the electroscope, the model of electric field lines, current as moving charge.
- Simulationen: `einfacher-stromkreis`

### 3.6 Elektrische Stromstärke, Spannung, Widerstand und Leistung
*EN: Electric current, voltage, resistance and power*

- Kurz (DE): Stromstärke und Spannung als Größen messen, ohmsches Gesetz und Widerstand, Reihen- und Parallelschaltung, elektrische Energie und Leistung.
- Kurz (EN): Measuring current and voltage, Ohm’s law and resistance, series and parallel circuits, electrical energy and power.
- Simulationen: `reihe-parallel`, `einfacher-stromkreis`, `ohmsches-gesetz`
- Jahrgänge je Simulation: `reihe-parallel`, `einfacher-stromkreis`, `ohmsches-gesetz` (8)

## Doppeljahrgangsstufe 9/10  
*Grades 9/10*  
Jahrgangsstufe(n) im JSON: 9, 10  
(Quelle: Rahmenlehrplan 7–10, Teil C Physik, Kap. 3, S. 29 und S. 35–52 (Themenfelder 3.5–3.13))

> Doppeljahrgangsstufe 9/10: Die Inhalte der Themenfelder sind in der Doppeljahrgangsstufe verbindlich; die Lernbereiche stehen deshalb bei 9 und 10 gleich und werden als eine Stufe gezeigt. Die Themenfelder 3.5 und 3.6 stehen hier ebenfalls, weil sie je nach Stundentafel in 7/8 oder 9/10 unterrichtet werden. Die Themenfelder sind im Rahmenlehrplan nummeriert.

### 3.5 Elektrischer Strom und elektrische Ladung
*EN: Electric current and electric charge*

- Kurz (DE): Einfache Stromkreise mit Energiequelle, Schalter und Energiewandler, Wirkungen des Stroms, Ladung und Elektroskop, Modell der elektrischen Feldlinie, Strom als bewegte Ladung.
- Kurz (EN): Simple circuits with source, switch and converter, effects of current, charge and the electroscope, the model of electric field lines, current as moving charge.
- Simulationen: `einfacher-stromkreis`
- Jahrgänge je Simulation: `einfacher-stromkreis` (9)

### 3.6 Elektrische Stromstärke, Spannung, Widerstand und Leistung
*EN: Electric current, voltage, resistance and power*

- Kurz (DE): Stromstärke und Spannung als Größen messen, ohmsches Gesetz und Widerstand, Reihen- und Parallelschaltung, elektrische Energie und Leistung.
- Kurz (EN): Measuring current and voltage, Ohm’s law and resistance, series and parallel circuits, electrical energy and power.
- Simulationen: `ohmsches-gesetz`, `reihe-parallel`, `einfacher-stromkreis`
- Jahrgänge je Simulation: `ohmsches-gesetz` (9), `reihe-parallel` (9), `einfacher-stromkreis` (9)

### 3.7 Gleichförmige und beschleunigte Bewegungen
*EN: Uniform and accelerated motion*

- Kurz (DE): Bezugssystem, Momentan- und Durchschnittsgeschwindigkeit, Beschleunigung, Bewegungsgesetze mit s(t)- und v(t)-Diagrammen, freier Fall.
- Kurz (EN): Frames of reference, instantaneous and average speed, acceleration, laws of motion with s(t) and v(t) graphs, free fall.
- Simulationen: `bewegungsdiagramme`, `freier-fall`

### 3.8 Kraft und Beschleunigung
*EN: Force and acceleration*

- Kurz (DE): Trägheits-, Wechselwirkungs- und Grundgesetz der Dynamik, Zerlegen und Addieren von Kräften, Reibung und Radialkraft (qualitativ).
- Kurz (EN): The laws of inertia, interaction and the fundamental law of dynamics, resolving and adding forces, friction and centripetal force (qualitative).
- Simulationen: `kraefteaddition`, `schiefe-ebene`, `kreisbewegung`

### 3.9 Magnetfelder und elektromagnetische Induktion
*EN: Magnetic fields and electromagnetic induction*

- Kurz (DE): Dauer- und Elektromagnete, magnetische Feldlinien, Kräfte auf stromführende Leiter, Elektromotor, Induktionsgesetz (qualitativ), Generator und Transformator.
- Kurz (EN): Permanent magnets and electromagnets, magnetic field lines, forces on current-carrying wires, the electric motor, the law of induction (qualitative), generator and transformer.
- Simulationen: `induktion`

### 3.10 Radioaktivität und Kernphysik
*EN: Radioactivity and nuclear physics*

- Kurz (DE): Arten radioaktiver Strahlung, Nachweis und Absorption, Aktivität und Halbwertszeit, Strahlung in der Umwelt, biologische Wirkung und Kernspaltung.
- Kurz (EN): Types of radiation, detection and absorption, activity and half-life, radiation in the environment, biological effects and nuclear fission.
- Simulationen: `radioaktiver-zerfall`

### 3.11 Energieumwandlungen in Natur und Technik
*EN: Energy conversion in nature and technology*

- Kurz (DE): Potenzielle und kinetische Energie berechnen, Wärme und spezifische Wärmekapazität, Wirkungsgrad und Energieflussschemen.
- Kurz (EN): Calculating potential and kinetic energy, heat and specific heat capacity, efficiency and energy flow diagrams.
- Simulationen: `energieerhaltung`

### 3.12 Mechanische Schwingungen und Wellen
*EN: Mechanical oscillations and waves*

- Kurz (DE): Kenngrößen harmonischer Schwingungen, Fadenpendel und Federschwinger, Dämpfung und Resonanz, Kenngrößen mechanischer Wellen, Reflexion, Brechung, Beugung und Interferenz.
- Kurz (EN): Parameters of harmonic oscillations, the simple pendulum and the spring oscillator, damping and resonance, parameters of mechanical waves, reflection, refraction, diffraction and interference.
- Simulationen: `fadenpendel`, `federpendel`, `resonanz`, `wellen-ausbreitung`, `interferenz`
- Jahrgänge je Simulation: `fadenpendel` (10), `federpendel` (10), `resonanz` (10), `wellen-ausbreitung` (10), `interferenz` (10)

### 3.13 Optische Geräte
*EN: Optical instruments*

- Kurz (DE): Modell Lichtstrahl, Reflexions- und Brechungsgesetz, Totalreflexion, Bildentstehung an der Sammellinse mit Linsengleichung, Spektrum am Prisma und Farbaddition.
- Kurz (EN): The light-ray model, laws of reflection and refraction, total internal reflection, image formation by a converging lens with the lens equation, the spectrum from a prism and additive colour mixing.
- Simulationen: `reflexion`, `brechung`, `linsen`

## Qualifikationsphase Q1/Q2 (Jahrgangsstufe 11)  
*Qualification phase Q1/Q2 (grade 11)*  
Jahrgangsstufe(n) im JSON: 11  
(Quelle: Rahmenlehrplan gymnasiale Oberstufe, Teil C Physik (2021), Kap. 3.2.1–3.2.4, S. 23–35)

> Qualifikationsphase, 1. und 2. Kurshalbjahr (Q1, Q2; am Gymnasium mit Abitur nach Klasse 12: Jahrgangsstufe 11). Die Reihenfolge der Themenfelder ist für Grund- und Leistungskurs verbindlich; der Leistungskurs behandelt zusätzliche Inhalte. Die Themenfelder sind im Rahmenlehrplan nummeriert.

### 3.2.1 Gravitationsfeld, elektrisches und magnetisches Feld (Q1)
*EN: Gravitational, electric and magnetic fields (Q1)*

- Kurz (DE): Gravitationsgesetz und Gravitationsfeld mit Feldlinienbildern, Keplersche Gesetze und Satellitenbahnen, elektrisches Feld mit Kondensator und Kapazität, Magnetfeld von Spulen; Messunsicherheiten.
- Kurz (EN): The law of gravitation and gravitational fields with field line patterns, Kepler’s laws and satellite orbits, the electric field with capacitor and capacitance, the magnetic field of coils; measurement uncertainty.
- Simulationen: `planetenbahnen`, `feldlinien`, `kondensator`

### 3.2.2 Bewegung von geladenen Teilchen in Feldern (Q2)
*EN: Motion of charged particles in fields (Q2)*

- Kurz (DE): Beschleunigung und Ablenkung geladener Teilchen im elektrischen Feld, Lorentzkraft und Kreisbahnen im Magnetfeld, Teilchen in senkrecht zueinander stehenden Feldern.
- Kurz (EN): Acceleration and deflection of charged particles in electric fields, the Lorentz force and circular paths in magnetic fields, particles in perpendicular fields.
- Simulationen: `lorentzkraft`

### 3.2.3 Elektromagnetische Induktion (Q2)
*EN: Electromagnetic induction (Q2)*

- Kurz (DE): Magnetischer Fluss und Induktionsgesetz, Lenzsche Regel, Selbstinduktion und technische Anwendungen; im LK auch in differenzieller Form.
- Kurz (EN): Magnetic flux and the law of induction, Lenz’s law, self-induction and technical applications; in the LK also in differential form.
- Simulationen: `induktion`

### 3.2.4 Schwingungen (Q2)
*EN: Oscillations (Q2)*

- Kurz (DE): Harmonische Schwingungen von Feder- und Fadenpendel, Dämpfung, erzwungene Schwingung und Resonanz, elektromagnetischer Schwingkreis.
- Kurz (EN): Harmonic oscillation of spring and simple pendulums, damping, forced oscillation and resonance, the electromagnetic oscillating circuit.
- Simulationen: `fadenpendel`, `federpendel`, `resonanz`

## Qualifikationsphase Q3/Q4 (Jahrgangsstufe 12)  
*Qualification phase Q3/Q4 (grade 12)*  
Jahrgangsstufe(n) im JSON: 12  
(Quelle: Rahmenlehrplan gymnasiale Oberstufe, Teil C Physik (2021), Kap. 3.2.5–3.2.7, S. 36–44)

> Qualifikationsphase, 3. und 4. Kurshalbjahr (Q3, Q4; am Gymnasium mit Abitur nach Klasse 12: Jahrgangsstufe 12). Die Themenfelder sind im Rahmenlehrplan nummeriert.

### 3.2.5 Wellen (Q3)
*EN: Waves (Q3)*

- Kurz (DE): Ausbreitung und Kenngrößen von Wellen, stehende Wellen, Beugung, Brechung und Interferenz, Interferenz von Licht an Doppelspalt und Gitter.
- Kurz (EN): Propagation and parameters of waves, standing waves, diffraction, refraction and interference, interference of light at a double slit and a grating.
- Simulationen: `wellen-ausbreitung`, `stehende-wellen`, `interferenz`, `doppelspalt`

### 3.2.6 Quantenobjekte (Q3)
*EN: Quantum objects (Q3)*

- Kurz (DE): Fotoeffekt mit Einfluss von Intensität und Frequenz, Photonen, Elektronenbeugung, stochastische Vorhersagbarkeit am Doppelspalt und Grundaspekte der Quantenphysik.
- Kurz (EN): The photoelectric effect with the influence of intensity and frequency, photons, electron diffraction, stochastic predictability at the double slit and basic aspects of quantum physics.
- Simulationen: `photoeffekt`, `elektronenbeugung`, `doppelspalt`

### 3.2.7 Atome (Q4)
*EN: Atoms (Q4)*

- Kurz (DE): Energieniveaus und Linienspektren, quantenmechanisches Atommodell mit Nachweiswahrscheinlichkeiten und optische Spektralanalyse.
- Kurz (EN): Energy levels and line spectra, the quantum model of the atom with detection probabilities and optical spectral analysis.
- Simulationen: `linienspektren`

# Teil C – JSON

Die vollständige JSON-Datei liegt separat bei: `brandenburg-gymnasium-physik.json` (erzeugt aus `src/curriculum/lehrplaene/brandenburg-gymnasium-physik.ts`, dieselben Daten).

# Teil D – Lücken und Vorschläge

## D.1 Nicht zugeordnete Simulationen (Ausnahmen in `NOT_IN_CURRICULUM`)

| Simulation | Grund |
|---|---|
| `stoesse` | Impuls und Stöße stehen nur in den Wahlpflichtthemen der Einführungsphase (3.1.x), die für die dreijährige Oberstufe (in Brandenburg Gesamtschulen und berufliche Gymnasien) gilt, nicht für das Gymnasium mit Abitur nach 12. |
| `schiefer-wurf` | Würfe stehen ebenso nur in den Wahlpflichtthemen der Einführungsphase. |
| `doppler-effekt` | Der Doppler-Effekt steht in keinem der beiden Rahmenlehrpläne. |
| `licht-schatten` | Lichtausbreitung und Schatten gehören zum Fach Naturwissenschaften 5/6 und kommen im Rahmenlehrplan Physik 7–10 nicht vor. |

## D.2 Lern- und Unterbereiche ohne passende Simulation

Keine: Jedes Themenfeld hat mindestens eine Simulation.

## D.3 Vorschläge für neue Simulationen

| Vorschlag (Titel) | Idee | schließt Lücke in |
|---|---|---|
| Teilchen im Plattenkondensator | Elektron mit Anfangsgeschwindigkeit in ein elektrisches Feld schießen, Ablenkung und Bahnparabel ablesen | 11, 3.2.2 (bisher nur `lorentzkraft`) |
| Kernzerfall und Kernspaltung | Zerfallsreihen und Kettenreaktion schrittweise | 9/10, 3.10 |

# Teil E – Einordnung und Unklarheiten

1. **Zwei Lehrpläne, G8.** Für 7–10 gilt der Rahmenlehrplan Teil C Physik 7–10, für die Qualifikationsphase der Rahmenlehrplan für die gymnasiale Oberstufe, Teil C Physik (2021). Beide gelten gemeinsam für Berlin und Brandenburg; für das Gymnasium ordnet der Rahmenlehrplan 7–10 in beiden Ländern 7 = E, 8 = F, 9 = G, 10 = H zu. Am Gymnasium führt die Schulzeit nach 12 Jahren zum Abitur.
2. **Sek. I als Doppeljahrgangsstufen.** Die Inhalte der Themenfelder sind je Doppeljahrgangsstufe verbindlich, deshalb stehen die Lernbereiche bei 7 und 8 sowie bei 9 und 10 gleich. Die Themenfelder 3.5 und 3.6 (Elektrizität) können laut Übersicht (S. 29) auch in 9/10 unterrichtet werden; sie stehen deshalb in beiden Stufen. Die Codes sind die Kapitelnummern des Rahmenlehrplans.
3. **Oberstufe.** Q1/Q2 sind am Gymnasium die Jahrgangsstufe 11, Q3/Q4 die Jahrgangsstufe 12. Die Wahlpflichtthemen der Einführungsphase (3.1.1–3.1.5: unter anderem Würfe, Kreisbewegung, Impuls, Energie) gelten für Schulen mit dreijähriger Oberstufe und sind nicht abgebildet (Annahme, bitte prüfen). Am Gymnasium übernimmt Jahrgangsstufe 10 diese Rolle.
4. **`sourceUrl`.** Die Dokumente nennen keinen Link zur Datei. Verwendet ist die Startseite des Bildungsservers Berlin-Brandenburg, `https://bildungsserver.berlin-brandenburg.de/`. Erreichbarkeit hier nicht geprüft.
5. **Erweiterte Klassenstufen:** keine eigenen; die Erweiterung von `reflexion` (6–8 → 6–10) steht in `docs/lehrplaene/berlin-gymnasium-physik.md`, Teil E.
6. **Umsetzung:** `brandenburg-gymnasium-physik.ts` übernimmt alle Jahrgangsstufen aus `berlin-gymnasium-physik.ts`.
7. **Unsichere Zuordnungen (Entwurf, bitte am Lehrplan prüfen):**
   - `gasgesetze` bei 3.1: Dichte, Druck und Temperatur eines Gases werden qualitativ behandelt; die Gasgesetze als Formeln nennt der Lehrplan nicht.
   - `hebelgesetz` und `schiefe-ebene` bei 3.3: nur über die Goldene Regel der Mechanik und kraftumformende Einrichtungen.
   - `schiefe-ebene` und `kreisbewegung` bei 3.8: Kräfte und Bewegungsänderungen; die Kreisbewegung nur qualitativ.
   - `doppelspalt` bei 3.2.5 und 3.2.6: einmal als Interferenz von Licht, einmal als stochastisches Verhalten von Quantenobjekten.
