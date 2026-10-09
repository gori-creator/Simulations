# Warteschlange: geplante Simulationen

Stand der Übergabe: 08.10.2026, 20:30 UTC. Offen ist jede Simulation, die in `src/curriculum/*.ts` noch als `planned(...)` steht (Gegenprobe: `grep -c "planned('" src/curriculum/*.ts`).
Arbeitsweise: siehe `docs/agenten/UEBERGABE.md`.

## Reihenfolge
P01 M01 M23 P03 M05 P02 M06 P04 M03 (fertig) | M07 P05 M11 (läuft) | P06 M24 M12 P07 M16 M25 P08 M17 M02 P09 M13 M08 P10 M18 M26 M09 M14 P11 M04 M10 M15 M19 M20 M21 M22

## Gruppen

### Physik
- P01 fertig — bewegungsdiagramme, freier-fall, hookesches-gesetz
- P02 fertig — hebelgesetz, kraefteaddition, schiefe-ebene
- P03 fertig — einfacher-stromkreis, ohmsches-gesetz, reihe-parallel
- P04 fertig — licht-schatten, reflexion, linsen
- P05 läuft (stoesse, kreisbewegung gemergt; planetenbahnen in Arbeit) — stoesse, kreisbewegung, planetenbahnen
- P06 offen — federpendel, resonanz, wellen-ausbreitung
- P07 offen — doppler-effekt, interferenz, stehende-wellen
- P08 offen — teilchenmodell, gasgesetze, radioaktiver-zerfall
- P09 offen — feldlinien, kondensator, lorentzkraft
- P10 offen — induktion, doppelspalt, photoeffekt
- P11 offen — linienspektren, elektronenbeugung

### Mathematik
- M01 fertig — stellenwerte, zahlengerade, primfaktoren
- M02 offen — zehnerpotenzen, einheiten, massstab
- M03 fertig — brueche-vergleichen, dezimalbrueche, brueche-rechnen
- M04 offen — prozentstreifen, quadratwurzel, proportional
- M05 fertig — termbaum, waagemodell, lgs-grafisch
- M06 fertig — koordinaten-lage, winkel-messen, umfang-flaeche (Testgruppe Spickzettel: Qualität gleich gut → verkürzte Leseliste für alle weiteren Gruppen)
- M07 läuft (vierecke, spiegelung gemergt; mittelsenkrechte in Arbeit) — vierecke, spiegelung, mittelsenkrechte
- M08 offen — winkel-geradenkreuzung, winkelsumme, flaechen-zerlegen
- M09 offen — dreieckskonstruktion, besondere-linien, strahlensaetze
- M10 offen — vergroessern, sin-cos-tan-dreieck, sinussatz-kosinussatz
- M11 läuft (gleichungen-grafisch gemergt; funktion-zuordnung, funktionsplotter in Arbeit) — gleichungen-grafisch, funktion-zuordnung, funktionsplotter
- M12 offen — hyperbel, parabel-drei-punkte, extremwert-parabel
- M13 offen — potenzfunktionen, logarithmus, e-funktion
- M14 offen — ganzrationale-funktionen, transformationen, grenzverhalten
- M15 offen — polstellen-asymptoten, umkehrfunktion, newton-verfahren
- M16 offen — zaehlprinzip, diagramme, boxplot
- M17 offen — baumdiagramm, geburtstagsproblem, vierfeldertafel
- M18 offen — bedingte-wahrscheinlichkeit, binomialverteilung, signifikanztest
- M19 offen — normalverteilung, taylor-polynome, fourier-reihen
- M20 offen — ableitungsfunktion, kurvendiskussion, funktionenscharen
- M21 offen — stammfunktion-grafisch, hauptsatz, aenderungsrate
- M22 offen — extremwertprobleme, matrix-abbildungen
- M23 fertig — koerpernetze, quader-volumen, prisma-zylinder (3D-Kern `src/sim-core/view3d.ts`)
- M24 offen — pyramide-kegel-kugel, cavalieri, rotationskoerper (3D)
- M25 offen — koordinaten-3d, vektoren-3d, skalar-vektorprodukt (3D)
- M26 offen — geraden-ebenen, lage-abstaende, kugeln (3D)

## Ideen je Simulation (an Agenten weitergeben)

bewegungsdiagramme: Fahrzeug auf Straße mit Maßstab; Modi gleichförmig / gleichmäßig beschleunigt / Fahrplan aus 3 Abschnitten (je v₀ bzw. a, Dauer); live t-s-, t-v-, t-a-Diagramme mit Zeitcursor; Stroboskop-Marken; Fläche unter t-v = Weg schattiert; Steigungsdreieck im t-s-Diagramm = v.
freier-fall: Fallrohr/Turm, Kugel und Feder mit/ohne Luft (Vakuum), Stroboskop (Abstände 1:3:5:7), s = ½gt², v = gt, Diagramme, Ort (Erde/Mond/Mars/Jupiter); Modus „Reaktionszeit mit fallendem Lineal“ (antippen zum Fangen).
hookesches-gesetz: Feder(n) mit Massestücken (antippen zum Anhängen), Federhärte D, gedämpftes Nachschwingen, Messpunkte ins F-s-Diagramm (Messtabelle), Ursprungsgerade; Elastizitätsgrenze (bleibende Verformung); Reihe/Parallel zweier Federn.
hebelgesetz: Balken mit Lochraster, Gewichte per Antippen auf beide Seiten, kippt animiert; Drehmomente M = F·a, Gleichgewicht; einseitiger Hebel (Schubkarre, Flaschenöffner, Kraftmesser).
kraefteaddition: Kraftpfeile vom Angriffspunkt ziehen, Kräfteparallelogramm animiert, Resultierende; Zerlegung in Komponenten entlang wählbarer Richtungen; Gleichgewicht; Anwendung Lampe an zwei Seilen (Seilkraft wächst bei flachem Winkel).
schiefe-ebene: Klotz auf Ebene (Winkel, Masse, Haft-/Gleitreibung), Zerlegung F_G → Hangabtrieb/Normalkraft, „Loslassen“ → rutscht mit a; Grenzwinkel der Haftreibung; Zugkraft.
einfacher-stromkreis: Schaltung mit Batterie, Schalter (antippen), Lampe/Motor/Klingel; Elektronenfluss animiert, technische Stromrichtung; offener/geschlossener Kreis, Kurzschluss-Warnung; Leiter/Nichtleiter-Test.
ohmsches-gesetz: regelbare Spannungsquelle, Widerstand bzw. Glühlampe (nicht linear) bzw. Draht (R = ρl/A), Messgeräte; Messpunkte ins U-I-Diagramm; R = U/I.
reihe-parallel: 2–3 Lampen/Widerstände in Reihe vs. parallel, Ampere-/Voltmeter, Helligkeit, Ersatzwiderstand, Lampe herausdrehen.
licht-schatten: punktförmige/ausgedehnte Lichtquellen ziehen, Gegenstand, Schirm, Rand-Lichtstrahlen, Kern- und Halbschatten; Modus Sonnen-/Mondfinsternis (schematisch).
reflexion: ebener Spiegel, Strahl ziehen, Einfallslot, α = α′; Spiegelbild-Konstruktion eines Gegenstands (virtuelles Bild, Sehstrahlen zum Auge); Winkelspiegel mit Mehrfachbildern.
linsen: Sammel-/Zerstreuungslinse, Gegenstandspfeil ziehen, Konstruktionsstrahlen (Parallel-, Mittelpunkt-, Brennpunktstrahl), Bild reell/virtuell, Linsengleichung, Abbildungsmaßstab; Beispiele Lupe, Projektor, Kamera, Auge.
stoesse: Luftkissenbahn, zwei Gleiter (Massen, Geschwindigkeiten), elastisch/unelastisch/teilelastisch, Impuls- und Energiebalken vorher/nachher, Zeitlupe, Schwerpunkt.
kreisbewegung: Draufsicht Kugel an Schnur/Karussell, r, f bzw. T, m; v-, a- und Kraftpfeile; F_Z = mv²/r; „Schnur reißt“ → tangentialer Flug; Kurvenfahrt (Haftreibung).
planetenbahnen: Gravitation (Verlet/rk4), Anfangsgeschwindigkeit per Pfeil ziehen, Ellipse mit Brennpunkten, 2. Kepler: gleiche Flächen in gleichen Zeiten schattiert, 3. Kepler-Tabelle; Bilder Sonne/Planet optional.
federpendel: senkrechtes Federpendel (D, m, Amplitude, Dämpfung), y(t)/v(t)/a(t), Zeigerdiagramm (Projektion der Kreisbewegung), Energie, T = 2π√(m/D).
resonanz: erzwungene gedämpfte Schwingung (Federpendel mit Motor-Exzenter oder Pohlsches Rad), Erregerfrequenz, Einschwingen, Resonanzkurve sammelt Punkte, Phasenverschiebung, Resonanzkatastrophe.
wellen-ausbreitung: Teilchenkette, transversal/longitudinal, ein Teilchen markiert, λ, f, c = λ·f, Momentaufnahme y(x) und y(t).
doppler-effekt: bewegte Quelle mit Wellenfronten, Beobachter vorne/hinten, Frequenzen, Überschall → Machkegel.
interferenz: zwei Kreiswellen (Wellenwanne als Intensitätsbild), Quellen ziehen, Gangunterschied an einem Punkt, Knoten-/Bauchlinien (Hyperbeln), Phasendifferenz.
stehende-wellen: hin- und rücklaufende Welle → stehende Welle, feste/lose Enden, Knoten/Bäuche, Eigenschwingungen einer Saite.
teilchenmodell: Teilchen in Box, Temperatur ↔ Geschwindigkeit, fest/flüssig/gasförmig, Brownsche Bewegung (großes Teilchen), Diffusion zweier Farben.
gasgesetze: Zylinder mit Kolben und Teilchen, p, V, T; isotherm/isobar/isochor; p-V-Diagramm mit Spur; pV = nRT.
radioaktiver-zerfall: viele Kerne zerfallen zufällig, N(t) vs. Exponentialkurve, Halbwertszeit, Isotope, Aktivität, Zählrohr-Impulse.
feldlinien: Punktladungen setzen/ziehen (+/−), Feldlinien, Äquipotentiallinien, Probeladung mit Kraftpfeil, Feldstärke als Farbe.
kondensator: RC-Kreis, Umschalter Laden/Entladen, U(t), I(t), τ = RC, Tangente bei t = 0, Halbwertszeit, Energie.
lorentzkraft: Fadenstrahlrohr in Helmholtzspulen (Beschleunigungsspannung, Spulenstrom), leuchtende Kreisbahn, r = √(2Um/e)/B, e/m-Bestimmung; Linke-Hand-Regel-Ansicht.
induktion: Magnet in Spule (ziehen), Leiterschleife im Feld (Fläche ändert sich), Generator (rotierende Schleife → Sinusspannung); U_ind(t)-Diagramm; Lenzsche Regel.
doppelspalt: Licht durch Doppelspalt/Gitter, λ (Farbe nach Wellenlänge), Spaltabstand, Spaltanzahl, Schirmabstand; Intensitätsverteilung, Maxima sin α = kλ/g; Wellenfronten nahe den Spalten.
photoeffekt: Fotozelle, Licht mit f und Intensität, Elektronen, Gegenfeldmethode, E_kin-f-Diagramm (Einstein-Gerade, Steigung h), Metalle mit Austrittsarbeiten.
linienspektren: Bohrsches Modell Wasserstoff, Übergänge senden Photonen, Balmer-Linien, Emission/Absorption, Spektren anderer Elemente (Na, Hg, He – nur gesicherte Wellenlängen).
elektronenbeugung: Elektronenbeugungsröhre (Graphit), Ringradien vs. Beschleunigungsspannung, λ = h/√(2meU), zwei Netzebenenabstände, leuchtender Schirm.

stellenwerte: Stellenwerttafel mit Ziffernplättchen, Zahl am Zahlenstrahl (zoombar), Runden auf eine Stelle (Nachbarn hervorgehoben), große Zahlen (Million, Milliarde) anschaulich.
zahlengerade: ganze Zahlen, Addition/Subtraktion als Pfeile (Pfeilmodell), Figur läuft animiert; Kontexte Thermometer, Kontostand, Höhe über/unter NN.
primfaktoren: Primfaktorbaum mit Animation, Sieb des Eratosthenes, Teilbarkeitsregeln, ggT/kgV über gemeinsame Faktoren.
zehnerpotenzen: Zoom durch Größenordnungen (Zehnerpotenzen) mit gezeichneten Objekten, Potenzen als wiederholte Multiplikation, wissenschaftliche Schreibweise.
einheiten: Einheitentafel mit wanderndem Komma; Länge, Masse, Zeit, Fläche (×100), Volumen (×1000).
massstab: gezeichnete Karte mit Maßstab, Messwerkzeug (Strecke ziehen), Umrechnung Karte ↔ Wirklichkeit, Zoom.
brueche-vergleichen: zwei Brüche als Streifen/Kreise, Erweitern/Kürzen als Feiner-/Gröberschneiden (animiert), Vergleich über gemeinsamen Nenner, Zahlenstrahl.
dezimalbrueche: schriftliche Division animiert, Reste wiederholen sich → Periode; Nenner mit nur 2 und 5 → endlich.
brueche-rechnen: Rechteckmodell für Multiplikation (Überlagerung), Division als „Wie oft passt …?“.
prozentstreifen: Prozentstreifen mit Grundwert, Prozentwert, Prozentsatz; ziehen; Rabatt, Mehrwertsteuer, Zinsen.
quadratwurzel: Heron-Verfahren: Rechtecke werden zum Quadrat (animiert), Intervallschachtelung am Zahlenstrahl, √2 irrational.
proportional: direkt (Ursprungsgerade) vs. indirekt (Hyperbel, Rechtecke gleicher Fläche), Wertetabelle, Dreisatz.
termbaum: Term → Baum, Auswertung von unten nach oben animiert, Rechenreihenfolge, Beispielterme.
waagemodell: Balkenwaage mit x-Päckchen und Gewichten, Äquivalenzumformungen als Aktionen, Waage kippt animiert bei Ungleichheit.
lgs-grafisch: zwei Geraden (ziehbar), Schnittpunkt, Fälle eine/keine/unendlich viele Lösungen, Gleichungsformen.
koordinaten-lage: Koordinatensystem, Punkte setzen/ablesen, Geraden, Strecken, Kreise; parallel/senkrecht; kleines Punkte-Spiel.
winkel-messen: Geodreieck/Winkelmesser über Winkel ziehen, Winkel schätzen (Spiel), Winkelarten.
umfang-flaeche: Rechteck auf Kästchenpapier ziehen, Einheitsquadrate zählen (Animation), gleicher Umfang – verschiedene Fläche.
vierecke: Viereck mit ziehbaren Ecken, automatische Einordnung, Haus der Vierecke hebt passende Klassen hervor; Eigenschaften.
spiegelung: Achsen- und Punktspiegelung einer Figur, Achse/Zentrum ziehen, Konstruktionslinien, Symmetrie erkennen.
mittelsenkrechte: Mittelsenkrechte als Ortslinie gleicher Abstände, Winkelhalbierende, Zirkelkonstruktion animiert.
winkel-geradenkreuzung: Scheitel-, Neben-, Stufen-, Wechselwinkel an Parallelen mit Querschnitt, ziehbar, Farbcode.
winkelsumme: Dreieckswinkel abreißen und an Gerade legen (animiert), Vielecke zerlegen: (n − 2) · 180°.
flaechen-zerlegen: Parallelogramm → Rechteck (Abschneiden und Verschieben animiert), Dreieck verdoppeln, Trapez.
dreieckskonstruktion: SSS, SWS, WSW, SsW mit Schritt-für-Schritt-Konstruktion (Zirkel animiert), Mehrdeutigkeit bei SSW.
besondere-linien: Mittelsenkrechten/Umkreis, Winkelhalbierende/Inkreis, Seitenhalbierende/Schwerpunkt, Höhen; Euler-Gerade; Dreieck ziehbar.
strahlensaetze: zwei Strahlen mit Parallelen, Verhältnisse, Anwendung Baumhöhe/Flussbreite messen.
vergroessern: Streckfaktor k: Längen ×k, Flächen ×k², Volumen ×k³ (Würfel bauen sich auf).
sin-cos-tan-dreieck: rechtwinkliges Dreieck ziehen, Seitenverhältnisse, Steigungswinkel/Rampe als Anwendung.
sinussatz-kosinussatz: allgemeines Dreieck, beide Sätze live, Vermessungsaufgabe.
gleichungen-grafisch: f(x) = g(x) über Schnittpunkte, wählbare Funktionen, Hineinzoomen zur Näherung.
funktion-zuordnung: Zuordnungen als Pfeildiagramm, senkrechter Linientest am Graphen.
funktionsplotter: eigene Terme (sicherer Parser, kein eval), mehrere Funktionen, Zoom/Verschieben, Spur, Wertetabelle.
hyperbel: y = a/(x − b) + c, Asymptoten, Verschieben.
parabel-drei-punkte: drei Punkte ziehen, Parabel hindurch, zugehöriges LGS.
extremwert-parabel: Zaun mit festem Umfang → Rechteck maximaler Fläche, Flächenfunktion als Parabel, Scheitel.
potenzfunktionen: y = a·xⁿ (n ganz, auch negativ), Symmetrie, Familien.
logarithmus: 2^x = 8 fragen, logarithmische Skala, Graph als Spiegelbild der Exponentialfunktion, Rechenschieber.
e-funktion: Exponentialfunktionen mit Tangenten, Ableitung = Funktion für Basis e, (1 + 1/n)ⁿ.
ganzrationale-funktionen: Nullstellen ziehen, Vielfachheit, Randverhalten, faktorisierte Form.
transformationen: a·f(b(x − c)) + d für verschiedene Grundfunktionen, animiert.
grenzverhalten: x → ±∞, Asymptoten, ε-Schlauch.
polstellen-asymptoten: gebrochen-rationale Funktionen aus Linearfaktoren, Lücke vs. Pol, schiefe Asymptoten.
umkehrfunktion: Graph an y = x spiegeln (animiert), eingeschränkter Definitionsbereich.
newton-verfahren: Tangentenschritte animiert, Konvergenztabelle, Problemfälle.
zaehlprinzip: Kombinationen (Outfits/Codes) als Baum, Produktregel.
diagramme: gleiche Daten als Säulen-/Balken-/Kreis-/Liniendiagramm, irreführende Achsen umschalten.
boxplot: Datenpunkte am Zahlenstrahl ziehen, Mittelwert/Median/Quartile/Boxplot live.
baumdiagramm: Urne mit/ohne Zurücklegen, Baum mit Pfadregeln, Simulation.
geburtstagsproblem: Klassen simulieren, Wahrscheinlichkeitskurve, Kalenderdarstellung.
vierfeldertafel: Vierfeldertafel ↔ Baum ↔ Mengendiagramm synchron.
bedingte-wahrscheinlichkeit: medizinischer Test (Sensitivität, Spezifität, Prävalenz), 1000 Symbole (natürliche Häufigkeiten), positiver Vorhersagewert.
binomialverteilung: Histogramm B(n, p), μ, σ, kumuliert.
signifikanztest: H₀, Entscheidungsregel, Fehler 1./2. Art als schattierte Flächen.
normalverteilung: Gaußkurve (μ, σ), Flächen, σ-Regeln, Näherung der Binomialverteilung.
taylor-polynome: Näherungen von sin, e^x, ln(1 + x) mit Grad-Regler.
fourier-reihen: Rechteck/Sägezahn/Dreieck nähern, Epizykel-Animation.
ableitungsfunktion: Tangentensteigung wird zu f′ aufgezeichnet.
kurvendiskussion: Monotonie, Extrem- und Wendestellen, Vorzeichentabellen.
funktionenscharen: f_a, Ortskurve der Extrempunkte.
stammfunktion-grafisch: vom f-Graphen zu F mit Konstante, Richtungsfeld.
hauptsatz: Integralfunktion I_a(x) als wachsende Fläche.
aenderungsrate: Geschwindigkeit → Weg, Zuflussrate → Volumen.
extremwertprobleme: Schachtel aus Blatt (Ecken ausschneiden), Volumenfunktion; Dose mit minimaler Oberfläche.
matrix-abbildungen: 2D-Abbildungen transformieren Gitter und Figur, Eigenvektoren, Determinante als Flächenfaktor.
koerpernetze: Netze von Würfel, Quader, Prisma, Pyramide, Zylinder falten sich in 3D auf/zu (drehbare Ansicht), Oberfläche.
quader-volumen: Quader mit Einheitswürfeln Schicht für Schicht füllen (3D).
prisma-zylinder: 3D-Prisma/Zylinder, Volumen = G·h (Schichten stapeln), Abwicklung für Oberfläche.
pyramide-kegel-kugel: 3D-Körper, Umschüttversuch (Kegel → Zylinder: 1/3), Volumen-/Oberflächenformeln.
cavalieri: Münzstapel/Scheiben scheren, gleiche Querschnitte → gleiches Volumen (3D).
rotationskoerper: Fläche um x-Achse rotieren (3D), Scheibenmethode V = π∫f²dx.
koordinaten-3d: räumliches Koordinatensystem, Punkte, Quader, drehbare Ansicht.
vektoren-3d: Vektoraddition und Vervielfachung in 3D.
skalar-vektorprodukt: Winkel, Projektion, Kreuzprodukt als Parallelogrammfläche mit Normalenvektor.
geraden-ebenen: Gerade in Parameterform, Ebene in Parameter-/Normalenform (3D).
lage-abstaende: Lagebeziehungen von Geraden/Ebenen, Abstände (3D).
kugeln: Kugel mit Ebene/Gerade, Schnittkreis, Tangentialebene (3D).
