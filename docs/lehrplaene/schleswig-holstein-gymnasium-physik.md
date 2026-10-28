# Schleswig-Holstein · Gymnasium · Physik – Lehrplan-Aufbereitung mit Simulationszuordnung

# Teil A – Überblick

| Merkmal | Sekundarstufe I und Sekundarstufe II (ein Dokument) |
|---|---|
| Bundesland | Schleswig-Holstein |
| Schulart | Gymnasium (die Fachanforderungen gelten für alle allgemeinbildenden Schulen); Physik in der Sek. I (hier 7–10) und in den Jahrgangsstufen 11–13 |
| Fach | Physik |
| Name des Lehrplans | „Fachanforderungen Physik, Allgemeinbildende Schulen, Sekundarstufe I, Sekundarstufe II“, Herausgeber: Ministerium für Bildung, Wissenschaft und Kultur des Landes Schleswig-Holstein |
| Jahr / Stand | 4. überarbeitete Auflage, Kiel, Juni 2026 |
| Datei (von der Projektleitung geliefert, nicht im Repository) | `Fachanforderungen_Physik_Sekundarstufe_2026.pdf` (88 Seiten; Sek. I Teil II, S. 16–47; Sek. II Teil III, S. 48–81) |
| Link laut Dokument | „www.fachanforderungen.de“ (Bestellungen) und „www.schleswig-holstein.de“; in `sourceUrl` `https://www.fachanforderungen.de/`; kein Link zur einzelnen Datei (Vermerk im Pull Request) |
| G8/G9 | G9: Abitur nach Jahrgangsstufe 13; Einführungsphase 11, Qualifikationsphase 12/13 |
| Niveaus / Wahl | Sek. I: drei Anforderungsebenen (ESA, MSA, Allgemeine Hochschulreife), am Gymnasium gelten alle. Sek. II: grundlegendes und erhöhtes Anforderungsniveau in einer Tabelle (erhöht grau und fett); Physik kann auch das Profilseminar ersetzen oder nicht durchgängig belegt werden (dann reduziert) |
| Struktur | Sek. I: fünf Themen und Inhalte (Energie, Elektrizitätslehre und Magnetismus, Elektromagnetische Strahlung, Mechanik, Radioaktivität) mit Themen in Block I und Block II, ohne Jahrgangszuordnung (Kap. II.2.1, II.3). Sek. II: vier Inhaltsbereiche (Mechanik, Felder, Schwingungen und Wellen, Quantenphysik und Materie) mit Themen; Mechanik in der Einführungsphase (Kap. III.2.3, III.3); keine Nummern |

| Stufe (Lehrplan) | JSON-Jahrgang | Lernbereiche | Unterbereiche | Bereiche mit Simulation (Unterbereiche bzw. Lernbereiche ohne Unterbereiche) | zugeordnete Simulationen (verschieden) |
|---|---|---|---|---|---|
| Sekundarstufe I (hier Jahrgangsstufen 7–10) | 7, 8, 9, 10 | 5 | 19 | 12 | 15 |
| Einführungsphase (Jahrgangsstufe 11) | 11 | 4 | 12 | 10 | 21 |
| Qualifikationsphase (Jahrgangsstufen 12/13) | 12, 13 | 4 | 9 | 10 | 18 |

Insgesamt verwendet: **35 von 36** fertigen Simulationen für Physik.

Nicht zugeordnet (Grund siehe Teil D): `hebelgesetz`

# Teil B – Lehrplan im Detail

Simulationen stehen bei allen Jahrgängen einer Stufe, sofern nicht in Klammern einzelne Jahrgänge genannt sind (dann passt die Simulation nach ihren Klassenstufen nur dort).

## Sekundarstufe I (hier Jahrgangsstufen 7–10)  
*Lower secondary (here grades 7–10)*  
Jahrgangsstufe(n) im JSON: 7, 8, 9, 10  
(Quelle: Fachanforderungen Physik (2026), Kap. II.2.1, S. 21–35, und Kap. II.3, S. 38)

> Sekundarstufe I (hier Jahrgangsstufen 7 bis 10): Die Fachanforderungen verzichten ausdrücklich auf eine Zuordnung der Inhalte zu Jahrgangsstufen; der Einstieg in den Physikunterricht ist von Schule zu Schule verschieden. Vorgegeben ist nur, dass die Themen aus Block I vor denen aus Block II unterrichtet werden. Die Lernbereiche stehen deshalb bei 7 bis 10 gleich und werden als eine Stufe gezeigt (Annahme, Entwurf, bitte am Lehrplan prüfen). Lernbereiche sind die fünf Themen und Inhalte, Unterbereiche ihre Themen; die Nummern sind von uns vergeben.

### 1 Energie
*EN: Energy*

- Kurz (DE): Qualitativer Energiebegriff mit Energieformen und Wärmetransport (Block I), quantitativer Energiebegriff und Energieversorgung (Block II).
- Kurz (EN): Qualitative concept of energy with forms of energy and heat transfer (block I), quantitative concept of energy and energy supply (block II).
- Simulationen: `energieerhaltung`
- Unterbereiche:
  - 1.1 Qualitativer Energiebegriff (Block I) · *Qualitative concept of energy (block I)* – Kurz: Energieformen im Alltag, Umwandlung, Erhaltung und Entwertung, Wärmeleitung, Konvektion und Wärmestrahlung, Wärmedämmung. · *EN: Forms of energy in everyday life, conversion, conservation and degradation, conduction, convection and radiation, insulation.* – Simulationen: `energieerhaltung`
  - 1.2 Quantitativer Energiebegriff (Block II) · *Quantitative concept of energy (block II)* – Kurz: Potenzielle, kinetische, elektrische und thermische Energie berechnen, Energieerhaltung, Wirkungsgrad und Leistung. · *EN: Calculating potential, kinetic, electrical and thermal energy, conservation of energy, efficiency and power.* – Simulationen: `energieerhaltung`
  - 1.3 Herausforderungen der Energieversorgung (Block II) · *Challenges of energy supply (block II)* – Kurz: Arten der Energieversorgung vergleichen und bewerten, Transport und Speicherung, regenerative Energien und verantwortungsvoller Umgang mit Energie. · *EN: Comparing and evaluating energy supply, transport and storage, renewable energy and responsible use of energy.* – Simulationen: –

### 2 Elektrizitätslehre und Magnetismus
*EN: Electricity and magnetism*

- Kurz (DE): Einfache Stromkreise und Permanentmagnetismus (Block I), Stromstärke, Spannung und Elektromagnetismus (Block II).
- Kurz (EN): Simple circuits and permanent magnetism (block I), current, voltage and electromagnetism (block II).
- Simulationen: `einfacher-stromkreis`, `reihe-parallel`, `ohmsches-gesetz`, `induktion`
- Unterbereiche:
  - 2.1 Einfache elektrische Stromkreise (Block I) · *Simple electric circuits (block I)* – Kurz: Leiter und Isolatoren, Schaltzeichen und Schaltpläne, Reihen- und Parallelschaltung, Transport von Ladung und Energie. · *EN: Conductors and insulators, circuit symbols and diagrams, series and parallel circuits, transport of charge and energy.* – Simulationen: `einfacher-stromkreis` (7, 8, 9), `reihe-parallel` (7, 8, 9)
  - 2.2 Permanentmagnetismus (Block I) · *Permanent magnetism (block I)* – Kurz: Magnetische Pole, Anziehung und Abstoßung, Magnetisierbarkeit und Magnetfelder. · *EN: Magnetic poles, attraction and repulsion, magnetisability and magnetic fields.* – Simulationen: –
  - 2.3 Stromstärke und Spannung (Block II) · *Current and voltage (block II)* – Kurz: Stromstärke und Spannung messen und berechnen, Ladung, Energie und Leistung, Knoten- und Maschenregel, Widerstand und Ohm’sches Gesetz. · *EN: Measuring and calculating current and voltage, charge, energy and power, the junction and loop rules, resistance and Ohm’s law.* – Simulationen: `reihe-parallel` (7, 8, 9), `einfacher-stromkreis` (7, 8, 9), `ohmsches-gesetz` (8, 9)
  - 2.4 Elektromagnetismus (Block II) · *Electromagnetism (block II)* – Kurz: Magnetfeld von Leiter und Spule, Induktion, Elektromotor, Generator, Transformator und Hochspannungsleitung. · *EN: Magnetic field of a wire and a coil, induction, electric motor, generator, transformer and power lines.* – Simulationen: `induktion` (9, 10)

### 3 Elektromagnetische Strahlung
*EN: Electromagnetic radiation*

- Kurz (DE): Licht- und Wärmestrahlung im Strahlenmodell, Schatten, Reflexion und Temperatur (Block I), Brechung und Linsen, Spektrum und Klimaphysik (Block II).
- Kurz (EN): Light and thermal radiation in the ray model, shadows, reflection and temperature (block I), refraction and lenses, spectrum and climate physics (block II).
- Simulationen: `licht-schatten`, `reflexion`, `teilchenmodell`, `brechung`, `linsen`
- Unterbereiche:
  - 3.1 Ausbreitung von Licht- und Wärmestrahlung, Strahlenmodell (Block I) · *Propagation of light and thermal radiation, ray model (block I)* – Kurz: Licht- und Wärmeausbreitung im Strahlenmodell, selbstleuchtende und beleuchtete Körper, Sender-Empfänger-Modell des Sehens. · *EN: Propagation of light and heat in the ray model, luminous and illuminated bodies, the sender–receiver model of vision.* – Simulationen: `licht-schatten` (7)
  - 3.2 Wechselwirkung von Strahlung und Materie (Block I) · *Interaction of radiation and matter (block I)* – Kurz: Schatten, Finsternisse und Mondphasen, Lochblende, Reflexionsgesetz, Temperatur, Ausdehnung und Aggregatzustände im einfachen Teilchenmodell. · *EN: Shadows, eclipses and phases of the moon, the pinhole camera, the law of reflection, temperature, expansion and states of matter in the simple particle model.* – Simulationen: `licht-schatten` (7), `reflexion` (7, 8), `teilchenmodell` (7, 8, 9)
  - 3.3 Lichtbrechung und optische Abbildungen (Block II) · *Refraction and optical images (block II)* – Kurz: Brechung an Grenzflächen und Totalreflexion, Sammel- und Zerstreuungslinsen, Brennweite, Bildkonstruktion und optische Geräte. · *EN: Refraction at boundaries and total internal reflection, converging and diverging lenses, focal length, image construction and optical instruments.* – Simulationen: `brechung`, `linsen`
  - 3.4 Spektrum und Wellenlänge (Block II) · *Spectrum and wavelength (block II)* – Kurz: Spektralfarben, Farbaddition und -subtraktion, Absorption und Transmission, nicht sichtbare Bereiche und Sensoren. · *EN: Spectral colours, additive and subtractive mixing, absorption and transmission, invisible ranges and sensors.* – Simulationen: –
  - 3.5 Klimaphysik (Block II) · *Climate physics (block II)* – Kurz: Strahlungshaushalt der Erde, Albedo, natürlicher und anthropogener Treibhauseffekt und Rückkopplungen. · *EN: The Earth’s radiation budget, albedo, the natural and anthropogenic greenhouse effect and feedbacks.* – Simulationen: –

### 4 Mechanik
*EN: Mechanics*

- Kurz (DE): Dichte, Kinematik und Statik (Block I) sowie Dynamik (Block II).
- Kurz (EN): Density, kinematics and statics (block I) and dynamics (block II).
- Simulationen: `bewegungsdiagramme`, `hookesches-gesetz`, `kraefteaddition`, `energieerhaltung`, `stoesse`
- Unterbereiche:
  - 4.1 Dichte (Block I) · *Density (block I)* – Kurz: Masse, Volumen und Dichte, Schwimmen, Schweben und Sinken. · *EN: Mass, volume and density, floating, hovering and sinking.* – Simulationen: –
  - 4.2 Kinematik (Block I) · *Kinematics (block I)* – Kurz: Geschwindigkeit als gerichtete Größe, Durchschnitts- und Momentangeschwindigkeit, gleichförmige und ungleichförmige Bewegung in Zeit-Weg- und Zeit-Geschwindigkeits-Diagrammen. · *EN: Velocity as a vector, average and instantaneous speed, uniform and non-uniform motion in distance–time and velocity–time graphs.* – Simulationen: `bewegungsdiagramme`
  - 4.3 Statik (Block I) · *Statics (block I)* – Kurz: Kräfte mit Federn messen, Gewichtskraft und Ortsfaktor, Kraft als gerichtete Größe und Kräfteaddition. · *EN: Measuring forces with springs, weight and gravitational field strength, force as a vector and adding forces.* – Simulationen: `hookesches-gesetz`, `kraefteaddition` (8, 9, 10)
  - 4.4 Dynamik (Block II) · *Dynamics (block II)* – Kurz: Trägheitsprinzip, Kraft als Ursache von Geschwindigkeitsänderungen, Reibung und Energiebilanzen, qualitativ; Impuls als Ergänzung. · *EN: The principle of inertia, force as the cause of changes in velocity, friction and energy balances, qualitatively; momentum as an extension.* – Simulationen: `energieerhaltung`, `stoesse` (10)

### 5 Radioaktivität und ionisierende Strahlung
*EN: Radioactivity and ionising radiation*

- Kurz (DE): Ionisierende Strahlung, radioaktiver Zerfall und Kernenergie (Block II).
- Kurz (EN): Ionising radiation, radioactive decay and nuclear energy (block II).
- Simulationen: `radioaktiver-zerfall`
- Unterbereiche:
  - 5.1 Ionisierende Strahlung (Block II) · *Ionising radiation (block II)* – Kurz: α-, β- und γ-Strahlung, Nachweis, Abschirmung, Nutzung und biologische Wirkung. · *EN: Alpha, beta and gamma radiation, detection, shielding, uses and biological effects.* – Simulationen: –
  - 5.2 Radioaktiver Zerfall (Block II) · *Radioactive decay (block II)* – Kurz: Kernbausteine und Isotope, Aktivität, Halbwertszeit, Zerfallsgesetz und Zerfallsreihen, Lagerung radioaktiver Abfälle. · *EN: Nucleons and isotopes, activity, half-life, the decay law and decay chains, storage of radioactive waste.* – Simulationen: `radioaktiver-zerfall` (9, 10)
  - 5.3 Kernenergie (Block II) · *Nuclear energy (block II)* – Kurz: Kernspaltung und Kettenreaktion, Kernfusion in Reaktoren und Sonne, Chancen und Risiken. · *EN: Nuclear fission and chain reactions, fusion in reactors and the Sun, opportunities and risks.* – Simulationen: –

## Einführungsphase (Jahrgangsstufe 11)  
*Introductory phase (grade 11)*  
Jahrgangsstufe(n) im JSON: 11  
(Quelle: Fachanforderungen Physik (2026), Kap. III.2.3, S. 60–72, und Kap. III.3, S. 73)

> Einführungsphase der Oberstufe (G9: Jahrgangsstufe 11). In der Einführungsphase wird Dynamik einschließlich Kinematik unterrichtet, höchstens in der Hälfte der Lernzeit; Felder, Schwingungen und Wellen sowie Quantenphysik beginnen schon hier und gehen in der Qualifikationsphase weiter. Inhalte über das grundlegende Niveau hinaus sind für das erhöhte Niveau verbindlich. Die Nummern sind von uns vergeben.

### M Mechanik: Dynamik inklusive Kinematik
*EN: Mechanics: dynamics including kinematics*

- Kurz (DE): Bewegungen beschreiben, Kraft und Trägheit, Reibung, Energie- und Impulserhaltung.
- Kurz (EN): Describing motion, force and inertia, friction, conservation of energy and momentum.
- Simulationen: `bewegungsdiagramme`, `freier-fall`, `schiefer-wurf`, `kraefteaddition`, `schiefe-ebene`, `energieerhaltung`, `kreisbewegung`, `stoesse`
- Unterbereiche:
  - M.1 Kinematik · *Kinematics* – Kurz: Ort, Zeit, Geschwindigkeit und Beschleunigung, gleichförmige und gleichmäßig beschleunigte Bewegung, freier Fall und waagerechter Wurf. · *EN: Position, time, velocity and acceleration, uniform and uniformly accelerated motion, free fall and horizontal projection.* – Simulationen: `bewegungsdiagramme`, `freier-fall`, `schiefer-wurf`
  - M.2 Dynamik · *Dynamics* – Kurz: Masse, Kraft und Beschleunigung, Trägheitsprinzip, Reibungskraft, Energieerhaltung und iterative Vorhersage realer Bewegungen; Kreisbewegungen können hier beginnen. · *EN: Mass, force and acceleration, the principle of inertia, friction, conservation of energy and iterative prediction of real motion; circular motion can start here.* – Simulationen: `kraefteaddition`, `schiefe-ebene`, `energieerhaltung`, `kreisbewegung`
  - M.3 Impuls und Impulserhaltung · *Momentum and its conservation* – Kurz: Impuls als Erhaltungsgröße bei Stößen und Wechselwirkungen. · *EN: Momentum as a conserved quantity in collisions and interactions.* – Simulationen: `stoesse`

### F Elektrische und magnetische Felder
*EN: Electric and magnetic fields*

- Kurz (DE): Feldkonzept, Körper in statischen Feldern und veränderliche elektromagnetische Felder.
- Kurz (EN): The field concept, bodies in static fields and changing electromagnetic fields.
- Simulationen: `feldlinien`, `kondensator`, `lorentzkraft`, `kreisbewegung`, `planetenbahnen`, `induktion`
- Unterbereiche:
  - F.1 Das Feldkonzept zur Beschreibung von Wechselwirkungen · *The field concept for describing interactions* – Kurz: Elektrisches, Magnet- und Gravitationsfeld, Ladung und Influenz, Feldstärke, Feld- und Äquipotenziallinien, Coulomb- und Gravitationsgesetz, Potenzial, Plattenkondensator mit Kapazität, Energie und Auf- und Entladung, magnetische Flussdichte. · *EN: Electric, magnetic and gravitational fields, charge and induced charge, field strength, field lines and equipotentials, Coulomb’s law and the law of gravitation, potential, the parallel-plate capacitor with capacitance, energy and charging and discharging, magnetic flux density.* – Simulationen: `feldlinien`, `kondensator`
  - F.2 Körper in statischen Feldern · *Bodies in static fields* – Kurz: Ladungen im elektrischen und magnetischen Feld, Lorentzkraft und Hall-Effekt, Kreisbewegungen mit Zentripetalkraft, auch im Gravitationsfeld, e/m-Bestimmung, Beschleuniger und Massenspektrometer. · *EN: Charges in electric and magnetic fields, the Lorentz force and the Hall effect, circular motion with centripetal force, also in gravitational fields, measuring e/m, accelerators and mass spectrometers.* – Simulationen: `lorentzkraft`, `kreisbewegung`, `planetenbahnen`
  - F.3 Veränderliche elektromagnetische Felder · *Changing electromagnetic fields* – Kurz: Magnetischer Fluss und Induktionsgesetz, Induktivität und Selbstinduktion, Ein- und Ausschaltvorgänge, technische Anwendungen und Schwingkreise. · *EN: Magnetic flux and the law of induction, inductance and self-induction, switching on and off, technical applications and LC circuits.* – Simulationen: `induktion`

### W Mechanische und elektromagnetische Schwingungen und Wellen
*EN: Mechanical and electromagnetic oscillations and waves*

- Kurz (DE): Schwingungen, Ausbreitung und Überlagerung von Wellen sowie Spektren.
- Kurz (EN): Oscillations, propagation and superposition of waves, and spectra.
- Simulationen: `fadenpendel`, `federpendel`, `resonanz`, `wellen-ausbreitung`, `doppler-effekt`, `interferenz`, `doppelspalt`, `stehende-wellen`
- Unterbereiche:
  - W.1 Mechanische und elektromagnetische Schwingungen · *Mechanical and electromagnetic oscillations* – Kurz: Kenngrößen, Schwingungsgleichung und lineares Kraftgesetz, gedämpfte und erzwungene Schwingungen mit Resonanz, energetischer Vergleich. · *EN: Parameters, the equation of oscillation and the linear force law, damped and forced oscillations with resonance, energy comparison.* – Simulationen: `fadenpendel`, `federpendel`, `resonanz`
  - W.2 Eigenschaften und Ausbreitung von Wellen · *Properties and propagation of waves* – Kurz: Wellenlänge, Frequenz und Geschwindigkeit, Huygens’sches Prinzip, Beugung und Brechung, Transversal- und Longitudinalwellen, Dopplereffekt (qualitativ) und Polarisation. · *EN: Wavelength, frequency and speed, Huygens’ principle, diffraction and refraction, transverse and longitudinal waves, the Doppler effect (qualitative) and polarisation.* – Simulationen: `wellen-ausbreitung`, `doppler-effekt`
  - W.3 Überlagerung von Wellen · *Superposition of waves* – Kurz: Superposition und Interferenz an Doppelspalt, Gitter und Einzelspalt, Interferometer und stehende Wellen. · *EN: Superposition and interference at double slits, gratings and single slits, interferometers and standing waves.* – Simulationen: `interferenz`, `doppelspalt`, `stehende-wellen`
  - W.4 Spektren · *Spectra* – Kurz: Farben, elektromagnetisches Spektrum, Emissions- und Absorptionsspektren, diskrete und kontinuierliche Spektren. · *EN: Colours, the electromagnetic spectrum, emission and absorption spectra, discrete and continuous spectra.* – Simulationen: –

### Q Quantenphysik und Materie
*EN: Quantum physics and matter*

- Kurz (DE): Quantenobjekte und Atomvorstellungen.
- Kurz (EN): Quantum objects and models of the atom.
- Simulationen: `doppelspalt`
- Unterbereiche:
  - Q.1 Quantenobjekte · *Quantum objects* – Kurz: Grundaspekte der Quantentheorie, Doppelspalt mit Photonen und Elektronen, Photoeffekt, de-Broglie-Wellenlänge, Röntgenbremsspektrum, Bragg-Reflexion, Compton-Effekt und Unbestimmtheit. · *EN: Basic aspects of quantum theory, the double slit with photons and electrons, the photoelectric effect, the de Broglie wavelength, the X-ray bremsstrahlung spectrum, Bragg reflection, the Compton effect and uncertainty.* – Simulationen: `doppelspalt`
  - Q.2 Atomvorstellungen · *Models of the atom* – Kurz: Quantenmechanisches Atommodell, Orbitale und Energieniveaus des Wasserstoffatoms, Linienspektren, Potenzialtopf, charakteristische Röntgenstrahlung und Pauli-Prinzip. · *EN: The quantum model of the atom, orbitals and energy levels of hydrogen, line spectra, the potential well, characteristic X-rays and the Pauli principle.* – Simulationen: –

## Qualifikationsphase (Jahrgangsstufen 12/13)  
*Qualification phase (grades 12/13)*  
Jahrgangsstufe(n) im JSON: 12, 13  
(Quelle: Fachanforderungen Physik (2026), Kap. III.2.3.2–2.3.4, S. 63–72, und Kap. III.3, S. 73)

> Qualifikationsphase der Oberstufe (G9: Jahrgangsstufen 12 und 13). Die Fachanforderungen lassen verschiedene Reihenfolgen zu; die Lernbereiche stehen deshalb bei 12 und 13 gleich und werden als eine Stufe gezeigt. Vertiefungsthemen oder Kontexte sind nur Beispiele. Die Nummern sind von uns vergeben.

### F Elektrische und magnetische Felder
*EN: Electric and magnetic fields*

- Kurz (DE): Feldkonzept, Körper in statischen Feldern und veränderliche elektromagnetische Felder.
- Kurz (EN): The field concept, bodies in static fields and changing electromagnetic fields.
- Simulationen: `feldlinien`, `kondensator`, `lorentzkraft`, `planetenbahnen`, `induktion`
- Unterbereiche:
  - F.1 Das Feldkonzept zur Beschreibung von Wechselwirkungen · *The field concept for describing interactions* – Kurz: Elektrisches, Magnet- und Gravitationsfeld, Ladung und Influenz, Feldstärke, Feld- und Äquipotenziallinien, Coulomb- und Gravitationsgesetz, Potenzial, Plattenkondensator mit Kapazität, Energie und Auf- und Entladung, magnetische Flussdichte. · *EN: Electric, magnetic and gravitational fields, charge and induced charge, field strength, field lines and equipotentials, Coulomb’s law and the law of gravitation, potential, the parallel-plate capacitor with capacitance, energy and charging and discharging, magnetic flux density.* – Simulationen: `feldlinien` (12), `kondensator` (12)
  - F.2 Körper in statischen Feldern · *Bodies in static fields* – Kurz: Ladungen im elektrischen und magnetischen Feld, Lorentzkraft und Hall-Effekt, Kreisbewegungen mit Zentripetalkraft, auch im Gravitationsfeld, e/m-Bestimmung, Beschleuniger und Massenspektrometer. · *EN: Charges in electric and magnetic fields, the Lorentz force and the Hall effect, circular motion with centripetal force, also in gravitational fields, measuring e/m, accelerators and mass spectrometers.* – Simulationen: `lorentzkraft`, `planetenbahnen`
  - F.3 Veränderliche elektromagnetische Felder · *Changing electromagnetic fields* – Kurz: Magnetischer Fluss und Induktionsgesetz, Induktivität und Selbstinduktion, Ein- und Ausschaltvorgänge, technische Anwendungen und Schwingkreise. · *EN: Magnetic flux and the law of induction, inductance and self-induction, switching on and off, technical applications and LC circuits.* – Simulationen: `induktion`

### W Mechanische und elektromagnetische Schwingungen und Wellen
*EN: Mechanical and electromagnetic oscillations and waves*

- Kurz (DE): Schwingungen, Ausbreitung und Überlagerung von Wellen sowie Spektren.
- Kurz (EN): Oscillations, propagation and superposition of waves, and spectra.
- Simulationen: `fadenpendel`, `federpendel`, `resonanz`, `wellen-ausbreitung`, `doppler-effekt`, `interferenz`, `doppelspalt`, `stehende-wellen`, `linienspektren`
- Unterbereiche:
  - W.1 Mechanische und elektromagnetische Schwingungen · *Mechanical and electromagnetic oscillations* – Kurz: Kenngrößen, Schwingungsgleichung und lineares Kraftgesetz, gedämpfte und erzwungene Schwingungen mit Resonanz, energetischer Vergleich. · *EN: Parameters, the equation of oscillation and the linear force law, damped and forced oscillations with resonance, energy comparison.* – Simulationen: `fadenpendel` (12), `federpendel` (12), `resonanz`
  - W.2 Eigenschaften und Ausbreitung von Wellen · *Properties and propagation of waves* – Kurz: Wellenlänge, Frequenz und Geschwindigkeit, Huygens’sches Prinzip, Beugung und Brechung, Transversal- und Longitudinalwellen, Dopplereffekt (qualitativ) und Polarisation. · *EN: Wavelength, frequency and speed, Huygens’ principle, diffraction and refraction, transverse and longitudinal waves, the Doppler effect (qualitative) and polarisation.* – Simulationen: `wellen-ausbreitung` (12), `doppler-effekt` (12)
  - W.3 Überlagerung von Wellen · *Superposition of waves* – Kurz: Superposition und Interferenz an Doppelspalt, Gitter und Einzelspalt, Interferometer und stehende Wellen. · *EN: Superposition and interference at double slits, gratings and single slits, interferometers and standing waves.* – Simulationen: `interferenz`, `doppelspalt`, `stehende-wellen`
  - W.4 Spektren · *Spectra* – Kurz: Farben, elektromagnetisches Spektrum, Emissions- und Absorptionsspektren, diskrete und kontinuierliche Spektren. · *EN: Colours, the electromagnetic spectrum, emission and absorption spectra, discrete and continuous spectra.* – Simulationen: `linienspektren`

### Q Quantenphysik und Materie
*EN: Quantum physics and matter*

- Kurz (DE): Quantenobjekte und Atomvorstellungen.
- Kurz (EN): Quantum objects and models of the atom.
- Simulationen: `photoeffekt`, `elektronenbeugung`, `doppelspalt`, `linienspektren`
- Unterbereiche:
  - Q.1 Quantenobjekte · *Quantum objects* – Kurz: Grundaspekte der Quantentheorie, Doppelspalt mit Photonen und Elektronen, Photoeffekt, de-Broglie-Wellenlänge, Röntgenbremsspektrum, Bragg-Reflexion, Compton-Effekt und Unbestimmtheit. · *EN: Basic aspects of quantum theory, the double slit with photons and electrons, the photoelectric effect, the de Broglie wavelength, the X-ray bremsstrahlung spectrum, Bragg reflection, the Compton effect and uncertainty.* – Simulationen: `photoeffekt`, `elektronenbeugung`, `doppelspalt`
  - Q.2 Atomvorstellungen · *Models of the atom* – Kurz: Quantenmechanisches Atommodell, Orbitale und Energieniveaus des Wasserstoffatoms, Linienspektren, Potenzialtopf, charakteristische Röntgenstrahlung und Pauli-Prinzip. · *EN: The quantum model of the atom, orbitals and energy levels of hydrogen, line spectra, the potential well, characteristic X-rays and the Pauli principle.* – Simulationen: `linienspektren`

### V Mögliche Vertiefungsthemen oder Kontexte
*EN: Possible topics for deeper study or contexts*

- Kurz (DE): Beispiele, auch für ein Profilseminar: Astronomie, Astrophysik, Relativitätstheorie, Kernphysik, Elementarteilchenphysik, Festkörperphysik, Thermodynamik, Klimaphysik, Biophysik, Ozean und Klima, Medizin und Sensorik, Elektromobilität.
- Kurz (EN): Examples, also for a profile seminar: astronomy, astrophysics, relativity, nuclear physics, particle physics, solid-state physics, thermodynamics, climate physics, biophysics, ocean and climate, medicine and sensors, electric mobility.
- Simulationen: `planetenbahnen`, `radioaktiver-zerfall`, `gasgesetze`

# Teil C – JSON

Die vollständige JSON-Datei liegt separat bei: `schleswig-holstein-gymnasium-physik.json` (erzeugt aus `src/curriculum/lehrplaene/schleswig-holstein-gymnasium-physik.ts`, dieselben Daten).

# Teil D – Lücken und Vorschläge

## D.1 Nicht zugeordnete Simulationen (Ausnahmen in `NOT_IN_CURRICULUM`)

| Simulation | Grund |
|---|---|
| `hebelgesetz` | Hebel, Drehmoment und einfache Maschinen stehen nicht in den Fachanforderungen; die Statik der Sek. I behandelt nur Kräfte als gerichtete Größen und ihre Addition, die Oberstufe den Drehimpuls nur kurz. |

## D.2 Lern- und Unterbereiche ohne passende Simulation

- **7–10:** 1.3 Herausforderungen der Energieversorgung, 2.2 Permanentmagnetismus, 3.4 Spektrum und Wellenlänge, 3.5 Klimaphysik, 4.1 Dichte, 5.1 Ionisierende Strahlung, 5.3 Kernenergie

- **11:** W.4 Spektren und Q.2 Atomvorstellungen – `linienspektren` passt nach Klassenstufen (12–13) erst in die Qualifikationsphase; dort sind beide abgedeckt.

## D.3 Vorschläge für neue Simulationen

| Vorschlag (Titel) | Idee | schließt Lücke in |
|---|---|---|
| Schwimmen, Schweben, Sinken | Körper mit Masse und Volumen in Flüssigkeiten verschiedener Dichte legen, Auftrieb und Gewicht als Pfeile | 7–10 4.1 |
| Treibhauseffekt im Modell | Einstrahlung, Albedo und CO₂-Anteil regeln, Strahlungsgleichgewicht und Temperatur ablesen | 7–10 3.5 |
| Magnetfelder sichtbar machen | Stab- und Hufeisenmagnete verschieben, Kompassnadeln und Feldlinien zeigen | 7–10 2.2 |

# Teil E – Einordnung und Unklarheiten

1. **Ein Dokument, G9.** Die Fachanforderungen gelten schulartübergreifend für Sek. I und Sek. II. Abgebildet ist das Gymnasium mit G9 (Abitur nach Jahrgangsstufe 13).
2. **Sek. I als eine Stufe 7–10 (Annahme, Entwurf, bitte am Lehrplan prüfen).** Die Fachanforderungen verzichten ausdrücklich auf eine Zuordnung der Inhalte zu Jahrgangsstufen; der Einstieg in den Physikunterricht ist von Schule zu Schule verschieden, ein früher Einstieg wird empfohlen. Verbindlich ist nur, dass die Themen aus Block I vor denen aus Block II kommen; bei zweistündigem Unterricht in vier aufeinanderfolgenden Jahrgangsstufen ist Block I bis zum Ende des zweiten Lernjahres abzuschließen. Die Themen stehen deshalb wie in Nordrhein-Westfalen bei 7 bis 10 gleich; der Block steht im Titel jedes Unterbereichs. Ob Physik an manchen Schulen schon in 5 oder 6 beginnt, sagen die Fachanforderungen nicht; dann wäre die Stufe nach unten zu erweitern.
3. **Oberstufe.** Einführungsphase = 11, Qualifikationsphase = 12/13. Mechanik (Dynamik inklusive Kinematik) gehört nach Kap. III.3 in die Einführungsphase und soll höchstens die Hälfte ihrer Lernzeit einnehmen; die drei anderen Inhaltsbereiche stehen in der Tabelle unter „Einführungsphase und Qualifizierungsphase“. Sie stehen deshalb bei 11 und bei 12/13 mit gleichem Inhalt; Mechanik nur bei 11. Die Reihenfolge in der Qualifikationsphase ist frei, deshalb eine Stufe „12/13“. Die „Möglichen Vertiefungsthemen oder Kontexte“ sind nur Beispiele und stehen als eigener Lernbereich V bei 12/13.
4. **Lernbereiche und Nummern.** Sek. I: die fünf Themen und Inhalte (1–5) mit ihren Themen als Unterbereiche. Oberstufe: M Mechanik, F Felder, W Schwingungen und Wellen, Q Quantenphysik und Materie mit den Themen aus Kap. III.3 als Unterbereichen; Mechanik ist nach den Zwischenüberschriften der Tabelle in Kap. III.2.3.1 gegliedert (Kinematik, Dynamik, Impuls). Die Nummern sind selbst vergeben.
5. **`sourceUrl`.** Das Dokument nennt keinen Link zur Datei. Verwendet ist `https://www.fachanforderungen.de/`, die Adresse, die das Impressum für Bestellungen nennt. Erreichbarkeit hier nicht geprüft.
6. **Erweiterte Klassenstufen:** keine.
7. **Unsichere Zuordnungen (Entwurf, bitte am Lehrplan prüfen):**
   - `stoesse` bei 7–10 4.4: Der Impuls kann in der Sek. I „zusätzlich eingeführt“ werden; verbindlich ist er erst in der Oberstufe (M.3). Nach Klassenstufen nur bei 10.
   - `schiefe-ebene` bei 11 M.2: Kräftezerlegung und Reibung an der schiefen Ebene; die schiefe Ebene selbst ist nicht genannt.
   - `kreisbewegung` bei 11 M.2: Kreisbewegungen stehen unter F.2 Körper in statischen Feldern, „können auch schon im Rahmen der Mechanik untersucht werden“.
   - `planetenbahnen` bei F.2 (Kreisbewegungen in Gravitationsfeldern) und V (Astronomie): Die Keplerschen Gesetze sind nicht genannt.
   - `gasgesetze` nur bei V (Thermodynamik als mögliches Vertiefungsthema): Die Sek. I behandelt die Ausdehnung von Materie nur qualitativ, die Gasgesetze stehen nirgends verbindlich.
   - `radioaktiver-zerfall` zusätzlich bei V (Kernphysik als mögliches Vertiefungsthema); verbindlich ist er in der Sek. I (5.2).
   - `doppelspalt` bei Q.1: Doppelspaltexperimente mit Photonen und Elektronen; die Simulation zeigt Licht am Doppelspalt und Gitter.
   - `teilchenmodell` bei 7–10 3.2: Temperatur und einfaches Teilchenmodell stehen in den Fachanforderungen im Abschnitt „Wechselwirkung von Strahlung und Materie“.
