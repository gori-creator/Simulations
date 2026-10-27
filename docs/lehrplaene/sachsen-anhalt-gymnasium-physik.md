# Sachsen-Anhalt · Gymnasium · Physik – Lehrplan-Aufbereitung mit Simulationszuordnung

# Teil A – Überblick

| Merkmal | Sekundarstufe I und gymnasiale Oberstufe (ein Dokument) |
|---|---|
| Bundesland | Sachsen-Anhalt |
| Schulart | Gymnasium, Physik in den Schuljahrgängen 6–12 |
| Fach | Physik |
| Name des Lehrplans | „Fachlehrplan Gymnasium Physik“, Herausgeber: Ministerium für Bildung des Landes Sachsen-Anhalt; „Der Lehrplan für das Gymnasium ist eine Einheit aus Grundsatzband und Fachlehrplänen“ (der Grundsatzband lag nicht vor und wird nicht gebraucht) |
| Jahr / Stand | Stand 01.08.2022; „In Kraft seit 2016, Anpassung 2022“ (überarbeitet auf Grundlage der Bildungsstandards Physik für die Allgemeine Hochschulreife von 2020) |
| Dateien (von der Projektleitung geliefert, nicht im Repository) | `sachsen_anhalt_physik_1.pdf` (50 Seiten, S. 1–50: Titel bis Schuljahrgang 10, Kompetenzschwerpunkt Gravitation) und `sachsen_anhalt_physik_2.pdf` (56 Seiten, S. 51–106: Klimaphysik, Experimentalpraktikum und Schuljahrgänge 11/12). Zusammen das vollständige Dokument; die Seitenzahlen schließen lückenlos an |
| Link laut Dokument | „Quelle: Landesportal Sachsen-Anhalt (http://www.lisa.sachsen-anhalt.de)“ in der Fußzeile; in `sourceUrl` als `https://www.lisa.sachsen-anhalt.de/` (siehe Mathematik) |
| G8/G9 | G8: Abitur nach Schuljahrgang 12; Schuljahrgang 10 ist die Einführungsphase, 11/12 die Qualifikationsphase |
| Niveaus / Wahl | Qualifikationsphase: grundlegendes Anforderungsniveau (gA; das dreistündige Wahlpflichtfach entspricht ihm), erhöhtes Anforderungsniveau (eA) und zweistündiges Wahlpflichtfach (WPF), je mit eigenen Kompetenzschwerpunkten |
| Struktur | Schuljahrgänge 6, 7/8, 9, 10, 11/12 → (in 11/12: Themenbereich →) Kompetenzschwerpunkt mit Sach-, Erkenntnisgewinnungs-, Kommunikations- und Bewertungskompetenz, grundlegenden Wissensbeständen und verbindlichen Schülerexperimenten; keine Nummern |

| Stufe (Lehrplan) | JSON-Jahrgang | Lernbereiche | Unterbereiche | Bereiche mit Simulation (Unterbereiche bzw. Lernbereiche ohne Unterbereiche) | zugeordnete Simulationen (verschieden) |
|---|---|---|---|---|---|
| Schuljahrgang 6 | 6 | 5 | 0 | 3 | 5 |
| Schuljahrgänge 7/8 | 7, 8 | 6 | 0 | 5 | 9 |
| Schuljahrgang 9 | 9 | 2 | 0 | 2 | 7 |
| Schuljahrgang 10 (Einführungsphase) | 10 | 5 | 0 | 3 | 4 |
| Schuljahrgänge 11/12 (Qualifikationsphase) – grundlegendes und erhöhtes Anforderungsniveau, zweistündiges Wahlpflichtfach | 11, 12 | 11 | 30 | 24 | 22 |

Insgesamt verwendet: **35 von 36** fertigen Simulationen für Physik.

Nicht zugeordnet (Grund siehe Teil D): `doppler-effekt`

# Teil B – Lehrplan im Detail

Simulationen stehen bei allen Jahrgängen einer Stufe, sofern nicht in Klammern einzelne Jahrgänge genannt sind (dann passt die Simulation nach ihren Klassenstufen nur dort).

## Schuljahrgang 6  
*Grade 6*  
Jahrgangsstufe(n) im JSON: 6  
(Quelle: Fachlehrplan Gymnasium Physik (Stand 01.08.2022), Kap. 3.2, S. 25–32)

> Schuljahrgang 6: Physik beginnt in Sachsen-Anhalt in Klasse 6. Lernbereiche sind die Kompetenzschwerpunkte des Fachlehrplans; er nummeriert sie nicht, die Nummern sind von uns vergeben.

### 1 Die Naturwissenschaft Physik
*EN: Physics as a natural science*

- Kurz (DE): Teilgebiete der Physik kennenlernen, Länge, Zeit, Volumen, Masse und Temperatur als Größen mit Einheiten, Längen und Zeiten messen.
- Kurz (EN): Getting to know the branches of physics, length, time, volume, mass and temperature as quantities with units, measuring lengths and times.
- Simulationen: –

### 2 Strahlenoptik
*EN: Ray optics*

- Kurz (DE): Licht als Strahl: Schatten und Finsternisse, Reflexionsgesetz am Spiegel, Brechung und Totalreflexion qualitativ, Bilder an Sammellinse und Lochkamera.
- Kurz (EN): Light as rays: shadows and eclipses, the law of reflection at a mirror, refraction and total internal reflection qualitatively, images formed by a converging lens and a pinhole camera.
- Simulationen: `licht-schatten`, `reflexion`, `brechung`, `linsen`

### 3 Eigenschaften und Bewegung von Körpern und Teilchen
*EN: Properties and motion of bodies and particles*

- Kurz (DE): Masse, Volumen und Dichte, Aggregatzustände im Teilchenmodell, Brown’sche Bewegung; gleichförmige und ungleichförmige Bewegung mit Geschwindigkeit und s(t)-Diagramm.
- Kurz (EN): Mass, volume and density, states of matter in the particle model, Brownian motion; uniform and non-uniform motion with speed and distance-time graphs.
- Simulationen: `teilchenmodell`

### 4 Temperatur und Wärme
*EN: Temperature and heat*

- Kurz (DE): Temperatur messen, Ausdehnung beim Erwärmen mit dem Teilchenmodell erklären, Wärmeleitung, -strömung und -strahlung, Anomalie des Wassers.
- Kurz (EN): Measuring temperature, explaining thermal expansion with the particle model, conduction, convection and radiation, the anomaly of water.
- Simulationen: `teilchenmodell`

### 5 Magnetismus
*EN: Magnetism*

- Kurz (DE): Dauermagnete mit Nord- und Südpol, magnetische Stoffe, Magnetfeld im Feldlinienmodell, Erdmagnetfeld und Kompass.
- Kurz (EN): Permanent magnets with north and south poles, magnetic materials, the magnetic field in the field-line model, Earth’s magnetic field and the compass.
- Simulationen: –

## Schuljahrgänge 7/8  
*Grades 7/8*  
Jahrgangsstufe(n) im JSON: 7, 8  
(Quelle: Fachlehrplan Gymnasium Physik (Stand 01.08.2022), Kap. 3.3, S. 33–42)

> Schuljahrgänge 7/8: Der Fachlehrplan beschreibt beide Jahrgänge gemeinsam; die Lernbereiche stehen deshalb bei 7 und 8 gleich, und beide werden als eine Stufe gezeigt. Lernbereiche sind die Kompetenzschwerpunkte des Fachlehrplans; er nummeriert sie nicht, die Nummern sind von uns vergeben.

### 1 Kräfte und ihre Wirkungen
*EN: Forces and their effects*

- Kurz (DE): Gewichtskraft und Masse, Kräfte als Pfeile addieren und zerlegen, Hooke’sches Gesetz, Hebelgesetz und Goldene Regel, mechanische Arbeit, Energieerhaltung und Wirkungsgrad.
- Kurz (EN): Weight and mass, adding and resolving forces as arrows, Hooke’s law, the law of the lever and the golden rule of mechanics, mechanical work, conservation of energy and efficiency.
- Simulationen: `hookesches-gesetz`, `hebelgesetz`, `kraefteaddition`, `energieerhaltung`

### 2 Elektrischer Strom und seine Wirkungen
*EN: Electric current and its effects*

- Kurz (DE): Ladung und elektrisches Feld, einfache Stromkreise aufbauen, Stromstärke und Spannung messen, Wärme-, Licht- und magnetische Wirkung des Stroms.
- Kurz (EN): Charge and electric field, building simple circuits, measuring current and voltage, heating, lighting and magnetic effects of current.
- Simulationen: `einfacher-stromkreis`

### 3 Wärme und Aggregatzustände
*EN: Heat and states of matter*

- Kurz (DE): Zustandsänderungen im Teilchenmodell, spezifische Wärmekapazität, Wärmeaustausch und Mischungsrechnung, Sonnenkollektor und Treibhaus.
- Kurz (EN): Changes of state in the particle model, specific heat capacity, heat exchange and mixing calculations, solar collectors and greenhouses.
- Simulationen: `teilchenmodell`

### 4 Druck und Auftrieb
*EN: Pressure and buoyancy*

- Kurz (DE): Druck bei festen Körpern, in Flüssigkeiten und Gasen, Auftrieb nach Archimedes, Schwimmen, Schweben und Sinken, dynamischer Auftrieb.
- Kurz (EN): Pressure in solids, liquids and gases, Archimedes’ principle, floating, hovering and sinking, dynamic lift.
- Simulationen: –

### 5 Verhalten von Gasen und technische Anwendungen
*EN: Behaviour of gases and technical applications*

- Kurz (DE): Druck, Volumen und Temperatur eines Gases bei konstant gehaltener Größe, Volumenarbeit, erster Hauptsatz; Verbrennungsmotor, Kühlschrank oder Wärmepumpe.
- Kurz (EN): Pressure, volume and temperature of a gas with one quantity held constant, work done by a gas, the first law of thermodynamics; combustion engines, refrigerators or heat pumps.
- Simulationen: `gasgesetze`

### 6 Stromkreise und Elektromagnetismus
*EN: Circuits and electromagnetism*

- Kurz (DE): Ohm’sches Gesetz und Widerstand, Reihen- und Parallelschaltung, elektrische Arbeit und Leistung, Elektromagnet und Gleichstrommotor.
- Kurz (EN): Ohm’s law and resistance, series and parallel circuits, electrical work and power, electromagnets and the DC motor.
- Simulationen: `ohmsches-gesetz`, `reihe-parallel`

## Schuljahrgang 9  
*Grade 9*  
Jahrgangsstufe(n) im JSON: 9  
(Quelle: Fachlehrplan Gymnasium Physik (Stand 01.08.2022), Kap. 3.4, S. 43–46)

> Schuljahrgang 9. Lernbereiche sind die Kompetenzschwerpunkte des Fachlehrplans; er nummeriert sie nicht, die Nummern sind von uns vergeben.

### 1 Elektromagnetische Induktion und Leitungsvorgänge
*EN: Electromagnetic induction and conduction*

- Kurz (DE): Induktion durch Bewegung oder veränderliches Magnetfeld, Lenz’sches Gesetz, Generator und Transformator; Leitung in Metallen und Halbleitern mit Diode, LED und Solarzelle.
- Kurz (EN): Induction by motion or a changing magnetic field, Lenz’s law, generator and transformer; conduction in metals and semiconductors with diodes, LEDs and solar cells.
- Simulationen: `induktion`

### 2 Mechanik der Punktmasse
*EN: Mechanics of a point mass*

- Kurz (DE): Newton’sche Axiome, Kräftezerlegung an der geneigten Ebene, gleichmäßig beschleunigte Bewegung mit Diagrammen und freiem Fall, Kreisbewegung, Energie, Leistung und Reibung.
- Kurz (EN): Newton’s laws, resolving forces on an inclined plane, uniformly accelerated motion with graphs and free fall, circular motion, energy, power and friction.
- Simulationen: `bewegungsdiagramme`, `freier-fall`, `kraefteaddition`, `schiefe-ebene`, `kreisbewegung`, `energieerhaltung`

## Schuljahrgang 10 (Einführungsphase)  
*Grade 10 (introductory phase)*  
Jahrgangsstufe(n) im JSON: 10  
(Quelle: Fachlehrplan Gymnasium Physik (Stand 01.08.2022), Kap. 3.5, S. 47–53)

> Schuljahrgang 10 ist in Sachsen-Anhalt die Einführungsphase der gymnasialen Oberstufe (Abitur nach Klasse 12). Lernbereiche sind die Kompetenzschwerpunkte des Fachlehrplans; er nummeriert sie nicht, die Nummern sind von uns vergeben.

### 1 Geometrische Optik
*EN: Geometrical optics*

- Kurz (DE): Lichtgeschwindigkeit, Reflexion, Brechungsgesetz quantitativ, Totalreflexion und Lichtleiter, Abbildungsgleichung an Sammellinsen und Fernrohr.
- Kurz (EN): Speed of light, reflection, the law of refraction quantitatively, total internal reflection and optical fibres, the lens equation for converging lenses and the telescope.
- Simulationen: `brechung`, `linsen`

### 2 Radioaktivität und Kernenergie
*EN: Radioactivity and nuclear energy*

- Kurz (DE): Aufbau des Atomkerns, Strahlungsarten, Aktivität, Halbwertszeit und Zerfallsgesetz, Zerfall als Zufallsprozess, Strahlenschutz, Kernspaltung oder Kernfusion.
- Kurz (EN): Structure of the nucleus, types of radiation, activity, half-life and the decay law, decay as a random process, radiation protection, nuclear fission or fusion.
- Simulationen: `radioaktiver-zerfall`

### 3 Gravitation
*EN: Gravitation*

- Kurz (DE): Gravitationsfeld und Gravitationsgesetz, Kepler’sche Gesetze, Bahnen von Satelliten und Planeten, erste kosmische Geschwindigkeit.
- Kurz (EN): Gravitational field and the law of gravitation, Kepler’s laws, orbits of satellites and planets, the first cosmic velocity.
- Simulationen: `planetenbahnen`

### 4 Klimaphysik
*EN: Climate physics*

- Kurz (DE): Elektromagnetisches Spektrum, Strahlungshaushalt der Erde, Albedo, Stefan-Boltzmann-Gesetz, natürlicher und menschengemachter Treibhauseffekt.
- Kurz (EN): The electromagnetic spectrum, Earth’s radiation budget, albedo, the Stefan–Boltzmann law, the natural and the man-made greenhouse effect.
- Simulationen: –

### 5 Experimentalpraktikum
*EN: Experimental practical*

- Kurz (DE): Experimente selbst planen, durchführen und auswerten, mit Blick auf Messabweichungen und das Verallgemeinern zu Gesetzen.
- Kurz (EN): Planning, carrying out and evaluating experiments independently, with attention to measurement errors and generalising to laws.
- Simulationen: –

## Schuljahrgänge 11/12 (Qualifikationsphase) – grundlegendes und erhöhtes Anforderungsniveau, zweistündiges Wahlpflichtfach  
*Grades 11/12 (qualification phase) – basic and higher level, two-hour elective*  
Jahrgangsstufe(n) im JSON: 11, 12  
(Quelle: Fachlehrplan Gymnasium Physik (Stand 01.08.2022), Kap. 3.6.1, S. 54–72, 3.6.2, S. 73–96, und 3.6.3, S. 97–106)

> Qualifikationsphase (Schuljahrgänge 11/12): Der Fachlehrplan beschreibt beide Jahrgänge gemeinsam, gegliedert in Themenbereiche mit Kompetenzschwerpunkten, getrennt nach grundlegendem (gA) und erhöhtem Anforderungsniveau (eA) sowie dem zweistündigen Wahlpflichtfach (WPF). Die Lernbereiche stehen deshalb bei 11 und 12 gleich, und beide werden als eine Stufe gezeigt. Das dreistündige Wahlpflichtfach entspricht dem grundlegenden Niveau. Die Nummern sind von uns vergeben.

### gA-1 Schwingungen und Wellen (grundlegendes Anforderungsniveau)
*EN: Oscillations and waves (basic level)*

- Kurz (DE): Mechanik als Grundlage, dazu mechanische Schwingungen und Wellen und das Licht als Welle.
- Kurz (EN): Mechanics as a foundation, plus mechanical oscillations and waves and light as a wave.
- Simulationen: `bewegungsdiagramme`, `freier-fall`, `schiefer-wurf`, `kreisbewegung`, `energieerhaltung`, `stoesse`, `federpendel`, `fadenpendel`, `resonanz`, `wellen-ausbreitung`, `interferenz`, `stehende-wellen`, `doppelspalt`
- Unterbereiche:
  - gA-1.1 Grundlagenkurs Mechanik · *Foundation course in mechanics* – Kurz: Bewegungen mit Anfangsbedingungen und ihre Überlagerung bei Würfen, Kreisbewegung, Energieerhaltung, Impuls und Impulserhaltung. · *EN: Motion with initial conditions and its superposition in projectile motion, circular motion, conservation of energy, momentum and its conservation.* – Simulationen: `bewegungsdiagramme` (11), `freier-fall` (11), `schiefer-wurf` (11), `kreisbewegung` (11), `energieerhaltung` (11), `stoesse` (11)
  - gA-1.2 Mechanische Schwingungen und Wellen · *Mechanical oscillations and waves* – Kurz: Kenngrößen harmonischer Schwingungen am Federschwinger, erzwungene Schwingungen und Resonanz; Ausbreitung, Interferenz und stehende Wellen. · *EN: Parameters of harmonic oscillations on a spring oscillator, forced oscillations and resonance; propagation, interference and standing waves.* – Simulationen: `federpendel`, `fadenpendel`, `resonanz`, `wellen-ausbreitung`, `interferenz`, `stehende-wellen`
  - gA-1.3 Welleneigenschaften des Lichtes · *Wave properties of light* – Kurz: Licht als elektromagnetische Welle, Interferenz an Doppelspalt und Gitter, Wellenlänge bestimmen, Farben, Dispersion und Polarisation. · *EN: Light as an electromagnetic wave, interference at a double slit and a grating, determining wavelength, colours, dispersion and polarisation.* – Simulationen: `doppelspalt`

### gA-2 Elektrodynamik (grundlegendes Anforderungsniveau)
*EN: Electrodynamics (basic level)*

- Kurz (DE): Elektrisches und magnetisches Feld und elektromagnetische Induktion.
- Kurz (EN): Electric and magnetic fields and electromagnetic induction.
- Simulationen: `feldlinien`, `kondensator`, `lorentzkraft`, `induktion`
- Unterbereiche:
  - gA-2.1 Elektrisches Feld · *Electric field* – Kurz: Feldlinienbilder und Feldstärke, Plattenkondensator mit Kapazität und Energie, Auf- und Entladen, Bewegung geladener Teilchen im Feld. · *EN: Field-line patterns and field strength, the parallel-plate capacitor with capacitance and energy, charging and discharging, motion of charged particles in the field.* – Simulationen: `feldlinien`, `kondensator`
  - gA-2.2 Magnetisches Feld · *Magnetic field* – Kurz: Magnetfelder von Magnet, Leiter und Spule, magnetische Flussdichte, Lorentzkraft und Kreisbahnen geladener Teilchen. · *EN: Magnetic fields of magnets, conductors and coils, magnetic flux density, the Lorentz force and circular paths of charged particles.* – Simulationen: `lorentzkraft`
  - gA-2.3 Elektromagnetische Induktion · *Electromagnetic induction* – Kurz: Induktionsspannung und magnetischer Fluss, Induktionsgesetz und Lenz’sche Regel, Transformator, Energie im Schwingkreis qualitativ. · *EN: Induced voltage and magnetic flux, the law of induction and Lenz’s rule, the transformer, energy in an LC circuit qualitatively.* – Simulationen: `induktion`

### gA-3 Quantenphysik (grundlegendes Anforderungsniveau)
*EN: Quantum physics (basic level)*

- Kurz (DE): Quantenobjekte wie Photon und Elektron und das quantenphysikalische Atommodell.
- Kurz (EN): Quantum objects such as photons and electrons and the quantum model of the atom.
- Simulationen: `photoeffekt`, `elektronenbeugung`, `linienspektren`
- Unterbereiche:
  - gA-3.1 Eigenschaften von Quantenobjekten · *Properties of quantum objects* – Kurz: Photoeffekt und Photonen, Planck’sches Wirkungsquantum, Elektronen als Welle nach de Broglie, Wesenszüge der Quantenphysik am Doppelspalt. · *EN: The photoelectric effect and photons, Planck’s constant, electrons as waves after de Broglie, key features of quantum physics at the double slit.* – Simulationen: `photoeffekt` (12), `elektronenbeugung` (12)
  - gA-3.2 Quantenphysikalisches Atommodell · *Quantum model of the atom* – Kurz: Energiestufen des Wasserstoffatoms, Orbitale, Emission und Absorption und die Entstehung von Linienspektren. · *EN: Energy levels of the hydrogen atom, orbitals, emission and absorption and how line spectra arise.* – Simulationen: `linienspektren` (12)

### gA-4 Praktika (grundlegendes Anforderungsniveau)
*EN: Practicals (basic level)*

- Kurz (DE): Experimentieren und Aufgabenlösen als eigene Kompetenzschwerpunkte.
- Kurz (EN): Experimenting and problem solving as focal points in their own right.
- Simulationen: –
- Unterbereiche:
  - gA-4.1 Experimentalpraktikum · *Experimental practical* – Kurz: Eigene Experimente planen und auswerten, Messunsicherheiten abschätzen. · *EN: Planning and evaluating experiments independently, estimating measurement uncertainties.* – Simulationen: –
  - gA-4.2 Aufgabenpraktikum · *Problem-solving practical* – Kurz: Strategien zum Lösen physikalischer Aufgaben üben: Bilanzen, Analogien, Vereinfachen und passende Modelle wählen. · *EN: Practising strategies for physics problems: balances, analogies, simplifying and choosing suitable models.* – Simulationen: –

### eA-1 Schwingungen und Wellen (erhöhtes Anforderungsniveau)
*EN: Oscillations and waves (higher level)*

- Kurz (DE): Schwingungen, Wellen und Licht vertieft, dazu ein Aufbaukurs Mechanik mit Stößen.
- Kurz (EN): Oscillations, waves and light in more depth, plus an advanced course in mechanics with collisions.
- Simulationen: `fadenpendel`, `federpendel`, `resonanz`, `wellen-ausbreitung`, `interferenz`, `stehende-wellen`, `doppelspalt`, `bewegungsdiagramme`, `freier-fall`, `kraefteaddition`, `schiefe-ebene`, `schiefer-wurf`, `energieerhaltung`, `stoesse`
- Unterbereiche:
  - eA-1.1 Mechanische Schwingungen · *Mechanical oscillations* – Kurz: Harmonischer Oszillator mit linearem Kraftgesetz, Faden- und Federpendel, gedämpfte Schwingungen, Eigenfrequenz, erzwungene Schwingungen und Resonanzkurve. · *EN: The harmonic oscillator with a linear restoring force, simple pendulum and spring oscillator, damped oscillations, natural frequency, forced oscillations and the resonance curve.* – Simulationen: `fadenpendel`, `federpendel`, `resonanz`
  - eA-1.2 Mechanische Wellen · *Mechanical waves* – Kurz: Harmonische Wellen mathematisch beschreiben, Huygens’sches Prinzip, Interferenz, Polarisation, stehende Wellen und Schall. · *EN: Describing harmonic waves mathematically, Huygens’ principle, interference, polarisation, standing waves and sound.* – Simulationen: `wellen-ausbreitung`, `interferenz`, `stehende-wellen`
  - eA-1.3 Welleneigenschaften des Lichtes · *Wave properties of light* – Kurz: Wie im grundlegenden Niveau, zusätzlich Interferometer, Röntgenstrahlung und Spektralanalyse. · *EN: As at the basic level, plus interferometers, X-rays and spectral analysis.* – Simulationen: `doppelspalt`
  - eA-1.4 Aufbaukurs Mechanik · *Advanced course in mechanics* – Kurz: Kräfte an der geneigten Ebene mit Reibung, Bewegungsgesetze mit Infinitesimalrechnung, Würfe, Energie- und Impulsbilanzen bei elastischen und unelastischen Stößen. · *EN: Forces on an inclined plane with friction, laws of motion using calculus, projectile motion, energy and momentum balances in elastic and inelastic collisions.* – Simulationen: `bewegungsdiagramme` (11), `freier-fall` (11), `kraefteaddition` (11), `schiefe-ebene` (11), `schiefer-wurf` (11), `energieerhaltung` (11), `stoesse` (11)

### eA-2 Elektrodynamik (erhöhtes Anforderungsniveau)
*EN: Electrodynamics (higher level)*

- Kurz (DE): Felder und Induktion vertieft, dazu Wechselstrom und elektromagnetische Schwingungen.
- Kurz (EN): Fields and induction in more depth, plus alternating current and electromagnetic oscillations.
- Simulationen: `feldlinien`, `kondensator`, `lorentzkraft`, `induktion`
- Unterbereiche:
  - eA-2.1 Elektrisches Feld · *Electric field* – Kurz: Wie im grundlegenden Niveau, zusätzlich Coulomb’sches Gesetz, Potenzial, radiales Feld, Auf- und Entladen quantitativ und Millikan-Versuch. · *EN: As at the basic level, plus Coulomb’s law, potential, the radial field, charging and discharging quantitatively and Millikan’s experiment.* – Simulationen: `feldlinien`, `kondensator`
  - eA-2.2 Magnetisches Feld · *Magnetic field* – Kurz: Lorentzkraft quantitativ, Hall-Effekt, spezifische Ladung des Elektrons, Flussdichte einer Spule und Massenspektrograph. · *EN: The Lorentz force quantitatively, the Hall effect, the specific charge of the electron, flux density of a coil and the mass spectrograph.* – Simulationen: `lorentzkraft`
  - eA-2.3 Elektromagnetische Induktion · *Electromagnetic induction* – Kurz: Induktionsgesetz in differenzieller Form, Wirbelströme, Generator und belasteter Transformator, Selbstinduktion und Induktivität. · *EN: The law of induction in differential form, eddy currents, generator and loaded transformer, self-induction and inductance.* – Simulationen: `induktion`
  - eA-2.4 Wechselstromwiderstände und elektromagnetische Schwingungen · *AC resistance and electromagnetic oscillations* – Kurz: Effektivwerte, induktiver und kapazitiver Widerstand mit Zeigerdiagramm, Schwingkreis und Thomson’sche Gleichung. · *EN: RMS values, inductive and capacitive reactance with phasor diagrams, the LC circuit and Thomson’s equation.* – Simulationen: –

### eA-3 Ausgewählte Gebiete der nichtklassischen Physik (erhöhtes Anforderungsniveau)
*EN: Selected topics in non-classical physics (higher level)*

- Kurz (DE): Spezielle Relativitätstheorie, Quantenobjekte und quantenphysikalisches Atommodell.
- Kurz (EN): Special relativity, quantum objects and the quantum model of the atom.
- Simulationen: `photoeffekt`, `elektronenbeugung`, `linienspektren`
- Unterbereiche:
  - eA-3.1 Spezielle Relativitätstheorie · *Special relativity* – Kurz: Einstein’sche Postulate, Relativität der Gleichzeitigkeit, Zeitdilatation und Längenkontraktion, relativistische Masse und Energie. · *EN: Einstein’s postulates, relativity of simultaneity, time dilation and length contraction, relativistic mass and energy.* – Simulationen: –
  - eA-3.2 Eigenschaften von Quantenobjekten · *Properties of quantum objects* – Kurz: Wie im grundlegenden Niveau, zusätzlich Photonenimpuls, Elektronenbeugungsröhre, Compton-Effekt, Unbestimmtheitsrelation und Wellenfunktion. · *EN: As at the basic level, plus photon momentum, the electron diffraction tube, the Compton effect, the uncertainty principle and the wave function.* – Simulationen: `photoeffekt` (12), `elektronenbeugung` (12)
  - eA-3.3 Quantenphysikalisches Atommodell · *Quantum model of the atom* – Kurz: Potenzialtopf, Energiestufen und Orbitale des Wasserstoffatoms, Franck-Hertz-Versuch, Linien- und Röntgenspektren. · *EN: The potential well, energy levels and orbitals of the hydrogen atom, the Franck–Hertz experiment, line spectra and X-ray spectra.* – Simulationen: `linienspektren` (12)

### eA-4 Praktika (erhöhtes Anforderungsniveau)
*EN: Practicals (higher level)*

- Kurz (DE): Experimentieren und Aufgabenlösen als eigene Kompetenzschwerpunkte.
- Kurz (EN): Experimenting and problem solving as focal points in their own right.
- Simulationen: –
- Unterbereiche:
  - eA-4.1 Experimentalpraktikum · *Experimental practical* – Kurz: Eigene Experimente planen und auswerten, Messunsicherheiten abschätzen. · *EN: Planning and evaluating experiments independently, estimating measurement uncertainties.* – Simulationen: –
  - eA-4.2 Aufgabenpraktikum · *Problem-solving practical* – Kurz: Strategien zum Lösen physikalischer Aufgaben üben, auch mit Kraftansätzen und der Wahl eines geeigneten Bezugssystems. · *EN: Practising strategies for physics problems, including force approaches and choosing a suitable frame of reference.* – Simulationen: –

### WPF-1 Elektrische und magnetische Felder (zweistündiges Wahlpflichtfach)
*EN: Electric and magnetic fields (two-hour elective)*

- Kurz (DE): Feldbegriff, Körper in statischen Feldern und Induktion in knapper Form.
- Kurz (EN): The field concept, bodies in static fields and induction in brief.
- Simulationen: `feldlinien`, `kondensator`, `lorentzkraft`, `induktion`
- Unterbereiche:
  - WPF-1.1 Das Feldkonzept zur Beschreibung von Wechselwirkungen · *The field concept for describing interactions* – Kurz: Elektrische und magnetische Felder mit Feldlinien beschreiben, Plattenkondensator als Energiespeicher. · *EN: Describing electric and magnetic fields with field lines, the parallel-plate capacitor as an energy store.* – Simulationen: `feldlinien`, `kondensator`
  - WPF-1.2 Körper in statischen Feldern · *Bodies in static fields* – Kurz: Kräfte auf geladene Teilchen in elektrischen und magnetischen Feldern, Lorentzkraft und Bahnformen. · *EN: Forces on charged particles in electric and magnetic fields, the Lorentz force and the resulting paths.* – Simulationen: `lorentzkraft`
  - WPF-1.3 Veränderliche elektromagnetische Felder · *Changing electromagnetic fields* – Kurz: Induktion durch Änderung des magnetischen Flusses, Generatorprinzip und Induktionsgesetz. · *EN: Induction by a changing magnetic flux, the generator principle and the law of induction.* – Simulationen: `induktion`

### WPF-2 Mechanische und elektromagnetische Schwingungen und Wellen (zweistündiges Wahlpflichtfach)
*EN: Mechanical and electromagnetic oscillations and waves (two-hour elective)*

- Kurz (DE): Mechanische Schwingungen und Wellen bis zum Licht als Welle.
- Kurz (EN): Mechanical oscillations and waves up to light as a wave.
- Simulationen: `fadenpendel`, `wellen-ausbreitung`, `doppelspalt`, `stehende-wellen`
- Unterbereiche:
  - WPF-2.1 Schwingungen · *Oscillations* – Kurz: Kenngrößen mechanischer Schwingungen am Fadenpendel, Energieumwandlungen auch im Schwingkreis. · *EN: Parameters of mechanical oscillations on a simple pendulum, energy conversions, also in an LC circuit.* – Simulationen: `fadenpendel`
  - WPF-2.2 Wellen · *Waves* – Kurz: Harmonische Wellen, Licht als elektromagnetische Welle, Interferenz an Doppelspalt und Gitter, stehende Wellen. · *EN: Harmonic waves, light as an electromagnetic wave, interference at a double slit and a grating, standing waves.* – Simulationen: `wellen-ausbreitung`, `doppelspalt`, `stehende-wellen`

### WPF-3 Quantenphysik und Materie (zweistündiges Wahlpflichtfach)
*EN: Quantum physics and matter (two-hour elective)*

- Kurz (DE): Wesenszüge der Quantenphysik und Atomvorstellungen.
- Kurz (EN): Key features of quantum physics and models of the atom.
- Simulationen: `photoeffekt`, `linienspektren`
- Unterbereiche:
  - WPF-3.1 Quantenobjekte · *Quantum objects* – Kurz: Wesenszüge der Quantenphysik im Überblick, Energie und Wellenlänge von Quantenobjekten, Planck’sches Wirkungsquantum. · *EN: Overview of key features of quantum physics, energy and wavelength of quantum objects, Planck’s constant.* – Simulationen: `photoeffekt` (12)
  - WPF-3.2 Atomvorstellungen · *Models of the atom* – Kurz: Energiestufen und Orbitale des Wasserstoffatoms, Absorptions- und Emissionslinien. · *EN: Energy levels and orbitals of the hydrogen atom, absorption and emission lines.* – Simulationen: `linienspektren` (12)

# Teil C – JSON

Die vollständige JSON-Datei liegt separat bei: `sachsen-anhalt-gymnasium-physik.json` (erzeugt aus `src/curriculum/lehrplaene/sachsen-anhalt-gymnasium-physik.ts`, dieselben Daten).

# Teil D – Lücken und Vorschläge

## D.1 Nicht zugeordnete Simulationen (Ausnahmen in `NOT_IN_CURRICULUM`)

| Simulation | Grund |
|---|---|
| `doppler-effekt` | Der Doppler-Effekt kommt im Fachlehrplan nicht vor, auch nicht bei den Schallwellen im erhöhten Anforderungsniveau (Kenngrößen, Hörbereiche, Ultraschall, Schallgeschwindigkeit). |

## D.2 Lernbereiche und Unterbereiche ohne passende Simulation

- **6:** 1 Die Naturwissenschaft Physik; 5 Magnetismus
- **7/8:** 4 Druck und Auftrieb
- **10:** 4 Klimaphysik; 5 Experimentalpraktikum
- **11/12:** gA-4 und eA-4 Praktika; eA-2.4 Wechselstromwiderstände und elektromagnetische Schwingungen; eA-3.1 Spezielle Relativitätstheorie

## D.3 Vorschläge für neue Simulationen

| Vorschlag (Titel) | Idee | schließt Lücke in |
|---|---|---|
| Magnetfelder sichtbar machen | Kompassnadeln und Eisenfeilspäne um Stab- und Hufeisenmagnete, Erdmagnetfeld | 6: 5 |
| Schweredruck und Auftrieb | Körper eintauchen, Druck in der Tiefe und Auftriebskraft messen, Schwimmen, Schweben, Sinken | 7/8: 4 |
| Strahlungshaushalt der Erde | Albedo und Treibhausgase ändern, Gleichgewichtstemperatur nach Stefan-Boltzmann | 10: 4 |
| Schwingkreis und Wechselstrom | Spule und Kondensator, Zeigerdiagramm, Thomson’sche Gleichung | eA-2.4 |
| Lichtuhr und Zeitdilatation | Bewegte Lichtuhr, Weg des Lichts und Lorentz-Faktor | eA-3.1 |

# Teil E – Einordnung und Unklarheiten

1. **Ein Dokument in zwei Dateien, G8.** Der Fachlehrplan umfasst die Schuljahrgänge 6–12; geliefert wurde er in zwei Dateien, die zusammen die Seiten 1–106 lückenlos enthalten. Schuljahrgang 10 ist die Einführungsphase, 11/12 die Qualifikationsphase; das Abitur folgt nach Klasse 12.
2. **Doppeljahrgänge aus dem Lehrplan.** Die Schuljahrgänge 7/8 und 11/12 beschreibt der Lehrplan jeweils gemeinsam. Sie stehen mit gleichen Lernbereichen bei beiden Jahrgängen und erscheinen auf der Seite als eine Stufe; eine Simulation steht nur bei den Jahrgängen, die in ihre Klassenstufen fallen.
3. **Nummern selbst vergeben.** Die Kompetenzschwerpunkte sind nicht nummeriert. In der Sek. I sind sie in der Reihenfolge des Lehrplans durchgezählt. In der Qualifikationsphase sind die Themenbereiche die Lernbereiche und die Kompetenzschwerpunkte die Unterbereiche, mit den Präfixen gA- (grundlegendes Anforderungsniveau), eA- (erhöhtes Anforderungsniveau) und WPF- (zweistündiges Wahlpflichtfach); das Niveau steht auch im Titel. Das dreistündige Wahlpflichtfach entspricht laut Lehrplan dem grundlegenden Niveau und ist nicht eigens abgebildet.
4. **Praktika.** Experimental- und Aufgabenpraktikum sind im Lehrplan eigene Kompetenzschwerpunkte (10 und 11/12) und stehen deshalb als Lernbereiche da, ohne Simulation.
5. **Nicht abgebildet:** die Aufteilung in Sach-, Erkenntnisgewinnungs-, Kommunikations- und Bewertungskompetenz, die verbindlichen Schülerexperimente (in die Kurzbeschreibungen eingeflossen) und die Bezüge zu fächerübergreifenden Themen.
6. **`sourceUrl`** wie in Mathematik: `https://www.lisa.sachsen-anhalt.de/` (Lehrplan: „http://www.lisa.sachsen-anhalt.de“), Erreichbarkeit hier nicht prüfbar.
7. **Erweiterte Klassenstufen** (in `src/curriculum/physik.ts`), weil Sachsen-Anhalt das Thema in diesem Jahrgang unterrichtet:

   | ID | bisher | neu | Lernbereich | Fundstelle |
   |---|---|---|---|---|
   | `energieerhaltung` | 9–11 | 8–11 | 7/8 1 Kräfte und ihre Wirkungen | Kap. 3.3: Energieerhaltungssatz der Mechanik in abgeschlossenen Systemen formulieren |
   | `gasgesetze` | 9–13 | 8–13 | 7/8 5 Verhalten von Gasen | Kap. 3.3: Zustandsänderungen bei konstanter Temperatur, konstantem Druck und konstantem Volumen |
   | `induktion` | 10–13 | 9–13 | 9 1 Elektromagnetische Induktion | Kap. 3.4: Induktionsgesetz, Generator- und Transformatorprinzip, Lenz’sches Gesetz |
   | `kreisbewegung` | 10–11 | 9–11 | 9 2 Mechanik der Punktmasse | Kap. 3.4: gleichförmige Kreisbewegung als beschleunigte Bewegung, Radialkraft |
   | `planetenbahnen` | 11–13 | 10–13 | 10 3 Gravitation | Kap. 3.5: Kepler’sche Gesetze und Gravitationsgesetz, Bahnen und Umlaufzeiten |

   Folgeänderungen für Sortierung und Bereichsgrenzen: Thema „Energie und Impuls“ ab 8; Thema „Kreisbewegung und Gravitation“ ab 9 und deshalb jetzt vor „Würfe“ (ab 10); Thema „Felder“ ab 9 mit `induktion` vor `lorentzkraft`; Thema „Gase“ ab 8.
8. **Bewusst nicht erweitert:** `bewegungsdiagramme` (7–11): In Klasse 6 werden nur s(t)-Diagramme gleichförmiger Bewegungen gezeichnet; die Simulation zeigt vor allem beschleunigte Bewegungen und steht deshalb bei 9 und 11/12 (wie in Sachsen).
9. **Unsichere Zuordnungen (Entwurf, bitte am Lehrplan prüfen):**
   - `brechung` und `linsen` bei 6: Brechung und Totalreflexion sind dort nur qualitativ verlangt, die Linsengleichung erst in 10.
   - `teilchenmodell` bei 6 (3 und 4) und 7/8 (3): Aggregatzustände und Ausdehnung im Teilchenmodell.
   - `energieerhaltung` bei 9 2 und gA-1.1: mechanische Energie in beiden Stufen.
   - `fadenpendel` bei gA-1.2: Der gA-Teil verlangt Energieumwandlungen „am horizontalen Federschwinger oder am Fadenpendel“, die Periodendauer nur am Federschwinger.
   - `elektronenbeugung` bei gA-3.1: Der gA-Teil nennt de Broglie und den Doppelspalt (Jönsson), die Elektronenbeugungsröhre erst der eA-Teil.
   - `freier-fall` bei gA-1.1 und eA-1.4: als gleichmäßig beschleunigte Bewegung mit Anfangsbedingungen (senkrechter Wurf).
10. **Verhältnis zu Sachsen** ([gori-creator/Simulations#73](https://github.com/gori-creator/Simulations/pull/73), noch offen): `induktion` (9–13, vor `lorentzkraft`, Thema „Felder“ ab 9) und `planetenbahnen` (10–13) sind dort gleich erweitert. Bei `energieerhaltung` und Thema „Energie und Impuls“ gilt nach beiden Merges der weitere Bereich (ab 7).
