# Bremen · Gymnasium · Physik – Lehrplan-Aufbereitung mit Simulationszuordnung

# Teil A – Überblick

| Merkmal | Bildungspläne Gymnasium Sekundarstufe I (Naturwissenschaften 5–9) und Gymnasiale Oberstufe |
|---|---|
| Bundesland | Bremen |
| Schulart | Gymnasium (Abitur nach Jahrgangsstufe 12), Physik in den Jahrgangsstufen 7–12 (in 5/6 Teil des Fachs Naturwissenschaft, nicht abgebildet) |
| Fach | Physik |
| Name des Bildungsplans (Sek. I) | „Die Sekundarstufe I im Land Bremen – Naturwissenschaften (Naturwissenschaft, Biologie, Chemie, Physik) – Bildungsplan für das Gymnasium“, Teil Physik |
| Jahr / Stand (Sek. I) | Stand 08/2026 (Datei vom 01.08.2026) |
| Name des Bildungsplans (Oberstufe) | „Die Gymnasiale Oberstufe im Land Bremen – Physik – Bildungsplan für die Gymnasiale Oberstufe – Einführungsphase und Qualifikationsphase –“ |
| Jahr / Stand (Oberstufe) | Stand Juli 2026 |
| Dateien (von der Projektleitung geliefert, nicht im Repository) | `20260801_NaWi_BP_GY_final.pdf` (63 Seiten, Physik S. 50–63) und `GyO_Physik_2026.pdf` (41 Seiten) |
| Link laut Dokument | „http://www.bildung.bremen.de“ (Herausgeber) und „http://www.lis.bremen.de“ (Bezugsadresse); in `sourceUrl` `https://www.bildung.bremen.de`, kein Link zur einzelnen Datei |
| G8/G9 | Gymnasium: Sek. I 5–9, Einführungsphase 10, Qualifikationsphase 11/12 |
| Niveaus / Wahl | Oberstufe: Grund- und Leistungskurs ([LK: …]); Kernbausteine verbindlich, Erweiterungsbausteine als Ergänzung |
| Struktur | Sek. I: fünf Rahmenthemen für 7/8/9 in festgelegter Reihenfolge (Kap. 2, S. 52–54; Standards am Ende von 9, S. 55–63). Einführungsphase: E1 Mechanik, E2 Energie (Kap. 3.1). Qualifikationsphase: Kernbausteine 1–8 in drei Inhaltsbereichen (Kap. 3.2) |

| Stufe (Lehrplan) | JSON-Jahrgang | Lernbereiche | Unterbereiche | Bereiche mit Simulation (Unterbereiche bzw. Lernbereiche ohne Unterbereiche) | zugeordnete Simulationen (verschieden) |
|---|---|---|---|---|---|
| Jahrgangsstufen 7–9 | 7, 8, 9 | 5 | 0 | 5 | 14 |
| Einführungsphase (Jahrgangsstufe 10) | 10 | 2 | 0 | 2 | 9 |
| Qualifikationsphase (Jahrgangsstufen 11/12) | 11, 12 | 8 | 0 | 6 | 16 |

Insgesamt verwendet: **35 von 36** fertigen Simulationen für Physik.

Nicht zugeordnet (Grund siehe Teil D): `hebelgesetz`

# Teil B – Lehrplan im Detail

Simulationen stehen bei allen Jahrgängen einer Stufe, sofern nicht in Klammern einzelne Jahrgänge genannt sind (dann passt die Simulation nach ihren Klassenstufen nur dort).

## Jahrgangsstufen 7–9  
*Grades 7–9*  
Jahrgangsstufe(n) im JSON: 7, 8, 9  
(Quelle: Bildungsplan Naturwissenschaften Gymnasium, Physik, Kap. 2 (S. 52–54) und 3 (S. 55–63))

> Jahrgangsstufen 7 bis 9: Fünf Rahmenthemen in der vom Bildungsplan festgelegten Reihenfolge, alle für 7/8/9 ausgewiesen; die Lernbereiche stehen deshalb bei 7, 8 und 9 gleich und werden als eine Stufe gezeigt. In 5/6 ist Physik Teil des Fachs Naturwissenschaft. Die Nummern sind die des Bildungsplans.

### 1 Sichtbare und unsichtbare Strahlung
*EN: Visible and invisible radiation*

- Kurz (DE): Modell Lichtstrahl, Sehvorgang, Mondphasen und Finsternisse, Reflexion und Brechung, Linsen und Linsengleichung, Auge, Farben, Wärmestrahlung und Wärmetransport im Teilchenmodell.
- Kurz (EN): The light-ray model, how we see, phases of the moon and eclipses, reflection and refraction, lenses and the lens equation, the eye, colours, thermal radiation and heat transfer in the particle model.
- Simulationen: `licht-schatten`, `reflexion`, `brechung`, `linsen`, `teilchenmodell`
- Jahrgänge je Simulation: `licht-schatten` (7), `reflexion`, `brechung`, `linsen`, `teilchenmodell`

### 2 Kräfte und Bewegung
*EN: Forces and motion*

- Kurz (DE): Geschwindigkeit und Zeit-Weg-Diagramme, Masse und Gewichtskraft, Kräfte als Pfeile, Kraft als Ursache von Bewegungsänderung und Verformung, Trägheit und Reibung, Energie, Arbeit und Leistung.
- Kurz (EN): Velocity and distance–time graphs, mass and weight, forces as arrows, force as the cause of change in motion and deformation, inertia and friction, energy, work and power.
- Simulationen: `bewegungsdiagramme`, `hookesches-gesetz`, `energieerhaltung`, `kraefteaddition`
- Jahrgänge je Simulation: `bewegungsdiagramme`, `hookesches-gesetz`, `energieerhaltung`, `kraefteaddition` (8, 9)

### 3 Elektrizität – Elektrostatik und Stromkreise
*EN: Electricity – electrostatics and circuits*

- Kurz (DE): Elektrostatische Grundphänomene und Ladung, Spannung, Stromstärke und Widerstand, Kennlinien, Reihen- und Parallelschaltung, elektrische Leistung und Energie, Sicherheit.
- Kurz (EN): Basic electrostatic phenomena and charge, voltage, current and resistance, characteristic curves, series and parallel circuits, electrical power and energy, safety.
- Simulationen: `einfacher-stromkreis`, `reihe-parallel`, `ohmsches-gesetz`

### 4 Elektromagnetismus
*EN: Electromagnetism*

- Kurz (DE): Magnetische Grundphänomene und Elementarmagnete, Magnetfelder von Magneten, Erde und Spule, Elektromagnet und Elektromotor, Induktion, Generator und Transformator.
- Kurz (EN): Basic magnetic phenomena and elementary magnets, magnetic fields of magnets, the Earth and coils, the electromagnet and electric motor, induction, generator and transformer.
- Simulationen: `induktion`
- Jahrgänge je Simulation: `induktion` (9)

### 5 Strahlung und Radioaktivität
*EN: Radiation and radioactivity*

- Kurz (DE): Elektromagnetisches Spektrum, Atomkern, radioaktiver Zerfall und Strahlungsarten, Nachweis, Halbwertszeit und Aktivität, Kernspaltung und Kernfusion, Strahlenschutz und Kernenergie.
- Kurz (EN): The electromagnetic spectrum, the nucleus, radioactive decay and types of radiation, detection, half-life and activity, fission and fusion, radiation protection and nuclear energy.
- Simulationen: `radioaktiver-zerfall`
- Jahrgänge je Simulation: `radioaktiver-zerfall` (8, 9)

## Einführungsphase (Jahrgangsstufe 10)  
*Introductory phase (grade 10)*  
Jahrgangsstufe(n) im JSON: 10  
(Quelle: Bildungsplan Physik Gymnasiale Oberstufe, Kap. 3.1, S. 14–18)

> Einführungsphase der gymnasialen Oberstufe (am Gymnasium Jahrgangsstufe 10) mit den Inhaltsbereichen Mechanik und Energie. Die Codes sind die des Bildungsplans.

### E1 Mechanik
*EN: Mechanics*

- Kurz (DE): Gleichförmige und gleichmäßig beschleunigte Bewegung, freier Fall, Wurfbewegungen, Addition und Zerlegung von Kräften an der schiefen Ebene, Impuls und Impulserhaltung, Kreisbewegung und Zentripetalkraft, Messunsicherheiten.
- Kurz (EN): Uniform and uniformly accelerated motion, free fall, projectile motion, adding and resolving forces on an inclined plane, momentum and its conservation, circular motion and centripetal force, measurement uncertainty.
- Simulationen: `bewegungsdiagramme`, `freier-fall`, `kraefteaddition`, `schiefe-ebene`, `kreisbewegung`, `stoesse`, `schiefer-wurf`

### E2 Energie
*EN: Energy*

- Kurz (DE): Energieerhaltung und Energieentwertung mit den Hauptsätzen der Thermodynamik, Wärme und Arbeit, Wirkungsgrad von Wärmekraftmaschinen und Wärmepumpen, Verfahren der Energiegewinnung.
- Kurz (EN): Conservation and dissipation of energy with the laws of thermodynamics, heat and work, efficiency of heat engines and heat pumps, ways of generating energy.
- Simulationen: `energieerhaltung`, `gasgesetze`

## Qualifikationsphase (Jahrgangsstufen 11/12)  
*Qualification phase (grades 11/12)*  
Jahrgangsstufe(n) im JSON: 11, 12  
(Quelle: Bildungsplan Physik Gymnasiale Oberstufe, Kap. 3.2, S. 19–36)

> Qualifikationsphase (am Gymnasium Jahrgangsstufen 11 und 12): Kernbausteine ohne vorgegebene Reihenfolge; die Lernbereiche stehen deshalb bei 11 und 12 gleich und werden als eine Stufe gezeigt. Erweiterungsbausteine ergänzen die Kernbausteine. LK = nur im Leistungskurs. Die Nummern sind die des Bildungsplans.

### 1 Elektrisches Feld
*EN: Electric field*

- Kurz (DE): Feldlinienmodell und Feldlinienbilder, Feldstärke, Plattenkondensator mit Kapazität und Energie, Auf- und Entladen; Erweiterung: Gravitationsfeld mit Satelliten- und Planetenbahnen (ohne Keplersche Gesetze).
- Kurz (EN): The field line model and field line patterns, field strength, the parallel-plate capacitor with capacitance and energy, charging and discharging; extension: the gravitational field with satellite and planetary orbits (without Kepler’s laws).
- Simulationen: `planetenbahnen`, `feldlinien`, `kondensator`

### 2 Magnetisches Feld
*EN: Magnetic field*

- Kurz (DE): Magnetische Feldlinienbilder und Flussdichte, Lorentzkraft und Kreisbahnen, Teilchen in senkrecht zueinander stehenden Feldern, Induktionsgesetz; LK: differenzielle Form und Selbstinduktion.
- Kurz (EN): Magnetic field line patterns and flux density, the Lorentz force and circular paths, particles in perpendicular fields, the law of induction; LK: differential form and self-induction.
- Simulationen: `induktion`, `lorentzkraft`

### 3 Mechanische Schwingungen & Wellen
*EN: Mechanical oscillations and waves*

- Kurz (DE): Feder- und Fadenpendel, erzwungene Schwingung, Dämpfung und Resonanz, Wellenausbreitung, Überlagerung und stehende Wellen; Erweiterung: Akustik und Doppler-Effekt.
- Kurz (EN): Spring and simple pendulums, forced oscillation, damping and resonance, wave propagation, superposition and standing waves; extension: acoustics and the Doppler effect.
- Simulationen: `fadenpendel`, `federpendel`, `resonanz`, `wellen-ausbreitung`, `doppler-effekt`, `interferenz`, `stehende-wellen`

### 4 Elektromagnetische Schwingungen
*EN: Electromagnetic oscillations*

- Kurz (DE): Harmonische elektromagnetische Schwingungen, Schwingkreis, Ausbreitung und Spektrum elektromagnetischer Wellen.
- Kurz (EN): Harmonic electromagnetic oscillations, the oscillating circuit, propagation and spectrum of electromagnetic waves.
- Simulationen: –

### 5 Wellenoptik
*EN: Wave optics*

- Kurz (DE): Licht als Welle, Huygenssches Prinzip und Beugung, Interferenz an Doppelspalt und Gitter, Polarisation; LK: Einzelspalt und Interferometer.
- Kurz (EN): Light as a wave, Huygens’ principle and diffraction, interference at a double slit and a grating, polarisation; LK: single slit and interferometer.
- Simulationen: `interferenz`, `doppelspalt`

### 6 Quantenobjekte
*EN: Quantum objects*

- Kurz (DE): Fotoeffekt, Photonen und Elektronen als Quantenobjekte, Elektronenbeugung, Doppelspalt mit Elektronen.
- Kurz (EN): The photoelectric effect, photons and electrons as quantum objects, electron diffraction, the double slit with electrons.
- Simulationen: `doppelspalt`, `photoeffekt`, `elektronenbeugung`
- Jahrgänge je Simulation: `doppelspalt`, `photoeffekt` (12), `elektronenbeugung` (12)

### 7 Quantenphysik der Atomhülle
*EN: Quantum physics of the atomic shell*

- Kurz (DE): Energieniveaus und Linienspektren, quantenmechanische Atomvorstellung.
- Kurz (EN): Energy levels and line spectra, the quantum view of the atom.
- Simulationen: `linienspektren`
- Jahrgänge je Simulation: `linienspektren` (12)

### 8 Struktur der Materie (LK)
*EN: Structure of matter (LK)*

- Kurz (DE): LK: Bausteine der Materie, Kernmasse und Kernradius, Paarbildung, Quarks und Teilchenzoo.
- Kurz (EN): LK: building blocks of matter, nuclear mass and radius, pair production, quarks and the particle zoo.
- Simulationen: –

# Teil C – JSON

Die vollständige JSON-Datei liegt separat bei: `bremen-gymnasium-physik.json` (erzeugt aus `src/curriculum/lehrplaene/bremen-gymnasium-physik.ts`, dieselben Daten).

# Teil D – Lücken und Vorschläge

## D.1 Nicht zugeordnete Simulationen (Ausnahmen in `NOT_IN_CURRICULUM`)

| Simulation | Grund |
|---|---|
| `hebelgesetz` | Hebel, Drehmoment und einfache Maschinen stehen in keinem der beiden Bildungspläne. |

## D.2 Lern- und Unterbereiche ohne passende Simulation

- **11/12:** 4 Elektromagnetische Schwingungen; 8 Struktur der Materie (nur LK).

## D.3 Vorschläge für neue Simulationen

| Vorschlag (Titel) | Idee | schließt Lücke in |
|---|---|---|
| Elektromagnetischer Schwingkreis | Kondensator und Spule koppeln, Spannung und Strom über der Zeit, Thomson-Formel | 11/12, 4 |
| Wärmekraftmaschine | Stirling-Kreisprozess im p-V-Diagramm, Wirkungsgrad aus den Temperaturen | 10, E2 |

# Teil E – Einordnung und Unklarheiten

1. **Gymnasium mit Abitur nach 12.** Die Sek. I endet mit Jahrgangsstufe 9; die Oberstufe umfasst drei Jahrgänge. Eingetragen sind Einführungsphase = 10 und Qualifikationsphase = 11/12.
2. **Sek. I.** In 5/6 ist Physik Teil des Fachs Naturwissenschaft und hier nicht abgebildet. Für 7–9 legt der Bildungsplan fünf Rahmenthemen in fester Reihenfolge fest, alle für „7/8/9“; deshalb eine Stufe 7–9. Die Nummern (1)–(5) sind die des Bildungsplans.
3. **Qualifikationsphase.** Die Kernbausteine haben keine vorgegebene Reihenfolge, deshalb eine Stufe 11/12. Erweiterungsbausteine (z. B. Gravitationsfeld, Akustik und Doppler-Effekt) sind in den Kurzbeschreibungen als „Erweiterung“ genannt.
4. **Voraussetzung.** Der Oberstufenplan setzt voraus, dass „Strahlung und Radioaktivität“ vor der Einführungsphase behandelt wurde; das passt zu Rahmenthema (5) in 7–9.
5. **`sourceUrl`.** Eingetragen ist `https://www.bildung.bremen.de` (im Dokument als http angegeben). Erreichbarkeit hier nicht geprüft.
6. **Erweiterte Klassenstufen:** keine.
7. **Unsichere Zuordnungen (Entwurf, bitte am Bildungsplan prüfen):**
   - `hookesches-gesetz` bei 7–9, (2): Kraft als Ursache von Verformung, Federkraftmesser im Kommentar; das Hookesche Gesetz ist nicht genannt.
   - `licht-schatten` bei 7–9, (1): Mondphasen und Finsternisse.
   - `gasgesetze` bei 10, E2: Hauptsätze und Wärmekraftmaschinen; die Gasgesetze selbst sind nicht genannt.
   - `planetenbahnen` (Erweiterung zu 1, ohne Keplersche Gesetze) und `doppler-effekt` (Erweiterung zu 3): nur in Erweiterungsbausteinen.
