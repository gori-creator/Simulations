# Auftrag: Lehrplan-Lücken schließen – Physik

Stand 22.11.2026. Für eine eigene Claude-Sitzung. Die andere Sitzung baut parallel die Mathematik-Lücken (`docs/agenten/AUFTRAG-LUECKEN-MATHE.md`).

## Ziel

Zehn **neue** Simulationen (Physik), die die meisten noch offenen Lehrplan-Themen schließen. Grundlage: `docs/SIMULATIONEN-PLAN.md` (Teil A) und `docs/LEHRPLAN-LUECKEN.md`. Die Reihenfolge unten ist die empfohlene (meiste Lücken zuerst).

## Pflichtlektüre (vor der ersten Zeile Code)

- `CLAUDE.md`, `docs/agenten/AUFTRAG.md` (besonders Abschnitt 3 „Schöne Animationen“), `docs/agenten/SPICKZETTEL.md`, `docs/agenten/ZUSAMMENARBEIT.md`, `docs/NEUE-SIMULATION.md`
- **`docs/agenten/QUALITAETSSICHERUNG.md` – verbindlich.** Bauen und Prüfen getrennt (Bau-Agent im eigenen Worktree, Leitung prüft mit frischem Blick und rechnet mindestens drei Werte nach).
- Je Simulation 2–3 Vorbilder **vollständig** lesen (`index.ts`, `model.ts`, Lernmaterial DE), z. B. `physik/bewegungsdiagramme`, `physik/freier-fall`, `physik/hookesches-gesetz`, `physik/induktion`, `physik/feldlinien`, `physik/radioaktiver-zerfall`. Für Räumliches `src/sim-core/view3d.ts`.

## Qualitätsmaßstab: nicht zu dünn

- Jede neue Simulation muss **mindestens so gut** sein wie die bisherigen 129. Zum Vergleich: `index.ts` + `model.ts` haben bei den fertigen Simulationen im Mittel etwa **2.200 Zeilen**, das untere Viertel etwa 1.600. Eine Simulation, die deutlich darunter liegt, ist fast immer zu dünn (zu wenig Ansichten, Interaktion, Animation oder Sonderfälle) – dann ausbauen statt abgeben. Zeilen sind kein Selbstzweck: kein aufgeblähter Code, sondern mehr Inhalt.
- Pro Simulation: mindestens **zwei Ansichten oder Modi**, etwas zum **Ziehen oder Antippen** im Bild (mit Regler bzw. `ctx.setKeyTargets` für die Tastatur), **weiche Übergänge** (`Tween`), Einstiegsanimation, **Beispiele** (`examples`), aussagekräftige **Ergebnisse** (`readouts`) mit Formeln, Sonderfälle sichtbar.
- Fachlogik vollständig in `model.ts`, Tests in `tests/<id>.test.ts` mit **Lehrbuchwerten** (die Prüfwerte unten sind Pflicht), Sonderfällen und Zufallsprüfungen.
- Bauzeit typisch 20–35 Minuten pro Simulation (mit Agent); deutlich schneller heißt meist: Prüfschritte ausgelassen.
- Screenshot-Runden nach `QUALITAETSSICHERUNG.md` 4.2: Desktop hell/dunkel 1360, Tablet 1024 und 700, Handy 390 hell/dunkel, Aktionen, Extremwerte.
- Lernmaterial DE (60–110 Zeilen) und EN, Lösungen selbst nachgerechnet, Links nur mit gültigen Werten. Ton bei „Ideen für den Unterricht“: Anregung, nie belehrend.
- Eigene `thumb.svg` (Vorschaubild).

## Bilder

Fotos oder gerenderte Bilder dürfen angefordert werden, wo sie die Simulation deutlich aufwerten (z. B. Geräte, Himmelsobjekte, Alltagsgegenstände):

- Prompt (Englisch, keine Texte, Logos, Marken, Personen; Größe, Hintergrund deckend/transparent, genaue Lage des Motivs) in `docs/BILDER.md` eintragen – Zeile ans Ende der Tabelle „Übersicht“ und Abschnitt ans Dateiende (siehe `AUFTRAG.md`, Abschnitt Bilder).
- Im Bericht an die Person die Prompts **gleich mitliefern**, damit sie die Bilder erzeugen und nach `incoming/<id>/` hochladen kann.
- Die Simulation muss **ohne** Bilder vollständig und schön sein (gezeichnete Ersatzgrafik). Bilder werden eingebaut, sobald sie hochgeladen sind.

## Lehrplan-Einträge (Pflicht je Simulation)

1. Eintrag in `src/curriculum/physik.ts` im passenden Bereich und Thema (innerhalb eines Bereichs nach Klassenstufe sortiert), Status `ready`, `grades`, `kmk`, `keywords`, `summary`. Die Kennung wie unten vorgeschlagen, bei Bedarf anpassen.
2. In **jedem** Länder-Lehrplan des Fachs (`src/curriculum/lehrplaene/*-physik.ts`) zuordnen – mindestens bei den Lernbereichen unten, sonst überall, wo es fachlich passt. Passt die Simulation in einem Land nirgends, Ausnahme mit Grund in `NOT_IN_CURRICULUM` (`tests/curriculum.test.ts`). Klassenstufen müssen passen (ein Test prüft das).
3. `npm run lehrplan:luecken` ausführen (aktualisiert `docs/LEHRPLAN-LUECKEN.md`) und die Zahl der Lücken im Bericht nennen.
4. KMK-Zuordnungen und fachliche Texte sorgfältig; Unsicheres als Entwurf kennzeichnen.

## Zweige, Pull Requests, Zusammenarbeit

- Eigener Zweig je Simulation von `main`: `physik/luecken-<id>`. **Ein Pull Request pro Simulation** nach `main`.
- Vor jedem Pull Request: `main` einmischen, `npm run lehrplan:luecken` erneut, `npm run verify` grün (0 Fehler/Warnungen/Hinweise, alle Tests, Build), Bildtests in GitHub grün.
- Neue Simulationen haben noch keine Referenzbilder („Referenzbild fehlt“). Deshalb in die Commit-Nachricht des Simulations-Commits `[bilder erneuern]` schreiben; dann erzeugt die Aktion „Bildtests“ die Bilder beim Push selbst (`docs/BILDTESTS.md`, Weg 1).
- **Nie selbst mergen.** Gemergt wird nur, wenn die Person ausdrücklich „merge“ schreibt.
- Nur die eigenen Dateien ändern (Physik). Gemeinsame Dateien (`docs/BILDER.md`, `docs/LEHRPLAN-LUECKEN.md`, `src/sim-core/`, `src/i18n/ui.ts`, `tests/curriculum.test.ts`) nur klein und gezielt ändern; `docs/LEHRPLAN-LUECKEN.md` nie von Hand, immer neu erzeugen (bei Konflikten: `main` einmischen, neu erzeugen).
- In `docs/SIMULATIONEN-PLAN.md` (Teil A) hinter der fertigen Simulation „✅ fertig (PR …)“ ergänzen.

## Bericht an die Person

Kurz, deutsch, ohne Fachjargon, für das Handy (`QUALITAETSSICHERUNG.md` Abschnitt 7): was fertig ist, was die Simulation zeigt, welche Werte nachgerechnet wurden, wie viele Lehrplan-Lücken jetzt noch offen sind, Bild-Prompts (falls angefordert), ehrliche Restpunkte.

## Die zehn Simulationen (Physik)

### 1. Zeitdilatation und Längenkontraktion (`zeitdilatation`, Klasse 11–13)

**Idee:** Lichtuhr im fahrenden Zug, Gleichzeitigkeit, Massenzunahme und E = m·c².

**Schließt 12 Lücken:**

- BY 11 3.2 – Einblick in die spezielle Relativitätstheorie
- HE 13 Q4.4.1 – Relativitätspostulate
- HE 13 Q4.4.2 – Relativistische Massenzunahme (nur phänomenologisch)
- HE 13 Q4.4.4 – Herleitung der relativistischen Massenzunahme (nur LK)
- NW 11 EF-2.3 – Wandel physikalischer Weltbilder
- RP 12/13 GF-W.17 – Relativistische Kinematik
- RP 12/13 GF-W.18 – Relativistische Dynamik
- RP 12/13 LF-W.15 – Relativistische Kinematik
- RP 12/13 LF-W.16 – Relativistische Dynamik
- SN 11 GK-W3 – Relativität von Zeit und Raum (Wahlbereich Grundkurs)
- SN 11 LK-W1 – Einblick in die Relativitätstheorie (Wahlbereich Leistungskurs)
- ST 11/12 eA-3.1 – Spezielle Relativitätstheorie

**Prüfwerte (vorher von Hand nachrechnen, dann in die Tests):** v = 0,6 c → γ = 1,25; 10 s Eigenzeit → 12,5 s; 100 m Ruhelänge → 80 m; v = 0,8 c → γ = 5/3.

### 2. Energieversorgung (`energieversorgung`, Klasse 7–13)

**Idee:** Kraftwerke und erneuerbare Quellen, Strommix über den Tag, Speicher, Netz und Hochspannung.

**Schließt 10 Lücken:**

- BY 11 3.3 – Energieversorgung
- HE 6–8 8.1 – Unterscheidung zwischen regenerativen und erschöpfbaren Energien
- HE 9/10 8.2 – Großenergieanlagen
- HE 9/10 8.3 – Speicherung und Transport von Energie
- HE 9/10 8.4 – Energieversorgungsnetze
- NW 7–10 11.2 – Bereitstellung und Nutzung von Energie
- RP 12/13 GF-W.16 – Energiebereitstellung
- RP 12/13 LF-W.14 – Energiebereitstellung
- SN 9 W2 – Energie von Wind und Sonne (Wahlbereich)
- SH 7–10 1.3 – Herausforderungen der Energieversorgung (Block II)

**Prüfwerte (vorher von Hand nachrechnen, dann in die Tests):** Eigene Plausibilitätswerte festlegen, z. B. 1 kW Leistung über 3 h → 3 kWh; Wirkungsgrad 40 % bei 100 MW Wärme → 40 MW elektrisch. Quellen für Strommix-Zahlen nennen oder als Beispielwerte kennzeichnen.

### 3. Messen und Messunsicherheit (`messunsicherheit`, Klasse 5–13)

**Idee:** Größen mit Einheiten messen, Messreihe, Mittelwert, Streuung und Fehlerbalken, Ausgleichsgerade.

**Schließt 10 Lücken:**

- BW 7/8 3.1.1 – Denk- und Arbeitsweisen der Physik
- BW 9/10 3.2.1 – Denk- und Arbeitsweisen der Physik
- HE 6–8 1.2 – Physikalische Größen und ihre Messung
- HE 9/10 1.2 – Historische und aktuelle Erkenntniswege der Physik
- SN 12 GK-2 – Praktikum Optik und Schwingungen (Grundkurs)
- SN 12 LK-3 – Praktikum Optik und Schwingungen (Leistungskurs)
- ST 6 1 – Die Naturwissenschaft Physik
- ST 10 5 – Experimentalpraktikum
- ST 11/12 gA-4.1 – Experimentalpraktikum
- ST 11/12 eA-4.1 – Experimentalpraktikum

**Prüfwerte (vorher von Hand nachrechnen, dann in die Tests):** Messreihe 9,8 / 10,1 / 9,9 / 10,2 / 10,0 → Mittelwert 10,0; empirische Standardabweichung ≈ 0,158; Unsicherheit des Mittelwerts ≈ 0,071.

### 4. Magnete und Kompass (`magnete`, Klasse 5–7)

**Idee:** Pole, Anziehung und Abstoßung, Feldlinien mit Kompassnadeln, Elementarmagnete, Erdmagnetfeld.

**Schließt 8 Lücken:**

- BW 7/8 3.1.8 – Magnetismus
- BY 7 1.1 – Magnetismus und Dichte (Entwurf: Überschrift nicht aus dem Original übernommen)
- HE 6–8 7.1 – Magnetismus
- NI 5/6 1 – Dauermagnete
- NW 5/6 2.3 – Magnetische Kräfte und Felder
- NW 5/6 2.4 – Magnetisierung
- ST 6 5 – Magnetismus
- SH 7–10 2.2 – Permanentmagnetismus (Block I)

**Prüfwerte (vorher von Hand nachrechnen, dann in die Tests):** Qualitativ: gleiche Pole stoßen ab, ungleiche ziehen an; Kompassnadel zeigt mit Nordpol zum Südpol des Magneten; Feld eines Stabmagneten symmetrisch. Feldberechnung (Dipol) mit Test: Feld auf der Achse ∝ 1/r³.

### 5. Sterne und Hertzsprung-Russell-Diagramm (`hr-diagramm`, Klasse 7–13)

**Idee:** Leuchtkraft und Temperatur, Lebensweg eines Sterns, Entfernung in Lichtjahren, Parallaxe.

**Schließt 8 Lücken:**

- BW 12/13 3.5.7 – Astrophysik (Basisfach mit Schwerpunkt Astrophysik)
- BY 13 A4 – Sterne (nur Astrophysik)
- HH 11/12 4.2 – Aspekte der Astrophysik (Wahlthema)
- HE 13 Q4.6.4 – Energieumwandlung in der Sonne (nur LK)
- HE 13 Q4.6.5 – Sterntypen, Sternentstehung und -entwicklung (nur LK)
- NW 7–10 6.2 – Universum
- RP 12/13 GF-W.19 – Astrophysik
- RP 12/13 LF-W.17 – Astrophysik

**Prüfwerte (vorher von Hand nachrechnen, dann in die Tests):** Sonne: T ≈ 5778 K, L = 1 L☉; Stefan-Boltzmann L = 4πR²σT⁴ → doppelte Temperatur bei gleichem Radius = 16-fache Leuchtkraft; Parallaxe 0,1″ → 10 pc ≈ 32,6 Lj.

### 6. Diode und Transistor (`diode-transistor`, Klasse 9–13)

**Idee:** Kennlinien aufnehmen, Gleichrichter, Transistor als Schalter und Verstärker.

**Schließt 8 Lücken:**

- BY 10 5.1 – Halbleiterbauelemente in Experimenten
- HE 13 Q4.5.2 – Diode und Transistor
- HE 13 Q4.5.4 – Verstärkerschaltung (nur LK)
- RP 12/13 GF-W.7 – Elektronik
- RP 12/13 LF-W.7 – Elektronik
- SN 9 1 – Grundlagen der Elektronik
- SN 11 GK-W1 – Leitungsvorgänge in Halbleitern (Wahlbereich Grundkurs)
- SN 11 LK-W2 – Leitungsvorgänge in Halbleitern (Wahlbereich Leistungskurs)

**Prüfwerte (vorher von Hand nachrechnen, dann in die Tests):** Shockley: I = I_S·(e^{U/U_T} − 1), U_T = 25,85 mV bei 300 K; Siliziumdiode leitet merklich ab ≈ 0,6–0,7 V; Transistor B = 100, I_B = 0,1 mA → I_C = 10 mA.

### 7. Dichte, Schwimmen und Auftrieb (`dichte-auftrieb`, Klasse 7–8)

**Idee:** Körper ins Wasser legen: Schwimmen, Schweben, Sinken; Archimedes, Heißluftballon.

**Schließt 7 Lücken:**

- BY 7 1.1 – Magnetismus und Dichte (Entwurf: Überschrift nicht aus dem Original übernommen)
- HE 6–8 1.1 – Körper und deren Eigenschaften
- HE 9/10 7.2 – Phänomen Auftrieb
- SN 8 1 – Mechanik der Flüssigkeiten und Gase
- SN 8 W1 – Vom Ballonfahren (Wahlbereich)
- ST 7/8 4 – Druck und Auftrieb
- SH 7–10 4.1 – Dichte (Block I)

**Prüfwerte (vorher von Hand nachrechnen, dann in die Tests):** Holzklotz 10 cm³, ρ = 0,6 g/cm³ in Wasser: taucht zu 60 % ein; Auftrieb eines 100 cm³-Körpers vollständig in Wasser ≈ 0,981 N.

### 8. Expandierendes Universum (`hubble`, Klasse 11–13)

**Idee:** Rotverschiebung und Hubble-Beziehung, Alter des Universums, Hintergrundstrahlung.

**Schließt 7 Lücken:**

- BW 12/13 3.5.7 – Astrophysik (Basisfach mit Schwerpunkt Astrophysik)
- BY 13 A5 – Großstrukturen im Weltall (nur Astrophysik)
- HH 11/12 4.2 – Aspekte der Astrophysik (Wahlthema)
- HE 13 Q4.6.2 – Kosmologie
- HE 13 Q4.6.3 – Struktur des Universums
- RP 12/13 GF-W.20 – Kosmologie
- RP 12/13 LF-W.18 – Kosmologie

**Prüfwerte (vorher von Hand nachrechnen, dann in die Tests):** H₀ = 70 km/(s·Mpc): Galaxie in 100 Mpc → 7000 km/s, z ≈ 0,023; Hubble-Zeit 1/H₀ ≈ 14,0 Mrd. Jahre.

### 9. Magnetfeld von Leiter und Spule (`magnetfeld-spule`, Klasse 8–12)

**Idee:** Feld um Leiter und in Spulen, Flussdichte, Elektromagnet, Relais und Elektromotor.

**Schließt 7 Lücken:**

- HH 10 1.3 – Magnetfelder und Elektromagnetismus
- HE 9/10 7.3 – Magnetische Wirkung des elektrischen Stroms
- HE 12 Q1.2.1 – Begriff des Feldes am Beispiel von magnetischen Feldern
- HE 12 Q1.2.2 – Magnetische Flussdichte
- SL 12 1.3 – Magnetisches Feld
- SN 11 GK-3 – Magnetisches Feld (Grundkurs)
- SN 11 LK-6 – Magnetisches Feld (Leistungskurs)

**Prüfwerte (vorher von Hand nachrechnen, dann in die Tests):** Lange Spule: B = μ₀·N·I/l, N = 500, I = 2 A, l = 0,25 m → B ≈ 5,03 mT; gerader Leiter I = 10 A, r = 2 cm → B = 0,1 mT.

### 10. Schall: Tonhöhe und Lautstärke (`schall`, Klasse 5–11)

**Idee:** Schwingung auf dem Oszilloskop, Frequenz und Amplitude, Schallausbreitung, Sender und Empfänger, Lärm.

**Schließt 7 Lücken:**

- BW 7/8 3.1.2 – Einführung in die Physik: Akustik
- HE 6–8 2.1 – Wahrnehmung der Umgebung mit den Sinnesorganen
- HE 6–8 2.2 – Sender-Empfänger-Modell
- HE 9/10 2.1 – Schall, Licht und ihre Ausbreitung
- NI 11 EF-2.1 – Akustik
- NW 5/6 3.1 – Schwingungen und Schallwellen
- NW 5/6 3.2 – Schallquellen und Schallempfänger

**Prüfwerte (vorher von Hand nachrechnen, dann in die Tests):** f = 440 Hz, c = 343 m/s → λ ≈ 0,780 m; Periode 2,27 ms; doppelte Amplitude → +6 dB Schalldruckpegel.
