# Auftrag: Lehrplan-Lücken schließen – Mathematik

Stand 22.11.2026. Für eine eigene Claude-Sitzung. Die andere Sitzung baut parallel die Physik-Lücken (`docs/agenten/AUFTRAG-LUECKEN-PHYSIK.md`).

## Ziel

Zehn **neue** Simulationen (Mathematik), die die meisten noch offenen Lehrplan-Themen schließen. Grundlage: `docs/SIMULATIONEN-PLAN.md` (Teil A) und `docs/LEHRPLAN-LUECKEN.md`. Die Reihenfolge unten ist die empfohlene (meiste Lücken zuerst).

## Pflichtlektüre (vor der ersten Zeile Code)

- `CLAUDE.md`, `docs/agenten/AUFTRAG.md` (besonders Abschnitt 3 „Schöne Animationen“), `docs/agenten/SPICKZETTEL.md`, `docs/agenten/ZUSAMMENARBEIT.md`, `docs/NEUE-SIMULATION.md`
- **`docs/agenten/QUALITAETSSICHERUNG.md` – verbindlich.** Bauen und Prüfen getrennt (Bau-Agent im eigenen Worktree, Leitung prüft mit frischem Blick und rechnet mindestens drei Werte nach).
- Je Simulation 2–3 Vorbilder **vollständig** lesen (`index.ts`, `model.ts`, Lernmaterial DE), z. B. `mathematik/lgs-grafisch`, `mathematik/matrix-abbildungen`, `mathematik/ableitungsfunktion`, `mathematik/stammfunktion-grafisch`, `mathematik/signifikanztest`, `mathematik/funktionenscharen`. Für Räumliches `src/sim-core/view3d.ts`.

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

1. Eintrag in `src/curriculum/mathematik.ts` im passenden Bereich und Thema (innerhalb eines Bereichs nach Klassenstufe sortiert), Status `ready`, `grades`, `kmk`, `keywords`, `summary`. Die Kennung wie unten vorgeschlagen, bei Bedarf anpassen.
2. In **jedem** Länder-Lehrplan des Fachs (`src/curriculum/lehrplaene/*-mathematik.ts`) zuordnen – mindestens bei den Lernbereichen unten, sonst überall, wo es fachlich passt. Passt die Simulation in einem Land nirgends, Ausnahme mit Grund in `NOT_IN_CURRICULUM` (`tests/curriculum.test.ts`). Klassenstufen müssen passen (ein Test prüft das).
3. `npm run lehrplan:luecken` ausführen (aktualisiert `docs/LEHRPLAN-LUECKEN.md`) und die Zahl der Lücken im Bericht nennen.
4. KMK-Zuordnungen und fachliche Texte sorgfältig; Unsicheres als Entwurf kennzeichnen.

## Zweige, Pull Requests, Zusammenarbeit

- Eigener Zweig je Simulation von `main`: `mathe/luecken-<id>`. **Ein Pull Request pro Simulation** nach `main`.
- Vor jedem Pull Request: `main` einmischen, `npm run lehrplan:luecken` erneut, `npm run verify` grün (0 Fehler/Warnungen/Hinweise, alle Tests, Build), Bildtests in GitHub grün.
- **Nie selbst mergen.** Gemergt wird nur, wenn die Person ausdrücklich „merge“ schreibt.
- Nur die eigenen Dateien ändern (Mathematik). Gemeinsame Dateien (`docs/BILDER.md`, `docs/LEHRPLAN-LUECKEN.md`, `src/sim-core/`, `src/i18n/ui.ts`, `tests/curriculum.test.ts`) nur klein und gezielt ändern; `docs/LEHRPLAN-LUECKEN.md` nie von Hand, immer neu erzeugen (bei Konflikten: `main` einmischen, neu erzeugen).
- In `docs/SIMULATIONEN-PLAN.md` (Teil A) hinter der fertigen Simulation „✅ fertig (PR …)“ ergänzen.

## Bericht an die Person

Kurz, deutsch, ohne Fachjargon, für das Handy (`QUALITAETSSICHERUNG.md` Abschnitt 7): was fertig ist, was die Simulation zeigt, welche Werte nachgerechnet wurden, wie viele Lehrplan-Lücken jetzt noch offen sind, Bild-Prompts (falls angefordert), ehrliche Restpunkte.

## Die zehn Simulationen (Mathematik)

### 1. Übergangsmatrizen (Markov-Ketten) (`uebergangsmatrizen`, Klasse 11–13)

**Idee:** Zustandsgraph und Matrix, Verteilung Schritt für Schritt, Matrixpotenzen, stabile Verteilung (Fixvektor).

**Schließt 6 Lücken:**

- HB 11/12 LA – Schwerpunkt Lineare Algebra (LA 2 bis LA 4)
- HH 12 7 – Lineare Algebra (Wahlpflichtmodul)
- HE 12 Q2.4.1 – Beschreiben von Übergangsprozessen mithilfe von Zustands- beziehungsweise Übergangsgraphen, Zustandsvektoren und Übergangsmatrizen
- HE 12 Q2.4.3 – Markov-Ketten
- HE 12 Q2.4.4 – Bestimmen und Interpretieren von Matrixeinträgen bei Potenzen von Matrizen
- HE 12 Q2.4.5 – Langfristige Entwicklung von Übergangsprozessen (nur LK)

**Prüfwerte (vorher von Hand nachrechnen, dann in die Tests):** Zwei Zustände, M = ((0,9 | 0,2), (0,1 | 0,8)) (Spalten = „von“): Start (1 | 0) → nach 1 Schritt (0,9 | 0,1); Fixvektor (2/3 | 1/3).

### 2. Ableitungsregeln (`ableitungsregeln`, Klasse 11–12)

**Idee:** Summen-, Faktor-, Potenz-, Produkt- und Kettenregel am Graphen: Teile einzeln ableiten und zusammensetzen, auch sin, cos und eˣ.

**Schließt 6 Lücken:**

- BW 11 3.4.1 (2)–(3) – Funktionsterme ableiten
- BW 12/13 3.5.1 (3)–(4) – weitere Ableitungsregeln anwenden
- BW 12/13 3.6.1 (2)–(3) – weitere Ableitungsregeln anwenden
- HE 11 E.2.4 – Ableitungsregeln
- HE 11 E.4.3 – Produkt- und Kettenregel
- HE 11 E.5.3 – Ableitung von f(x) = a·sin[b·(x − c)] + d beziehungsweise f(x) = a·cos[b·(x − c)] + d

**Prüfwerte (vorher von Hand nachrechnen, dann in die Tests):** (x²·sin x)′ = 2x·sin x + x²·cos x; bei x = π: −π² ≈ −9,870. (e^{2x+1})′ = 2·e^{2x+1}.

### 3. Integrationsregeln (`integrationsregeln`, Klasse 12)

**Idee:** Stammfunktionen aus den Ableitungsregeln, lineare Verkettung, Formansatz, partielle Integration und Substitution mit Probe durch Ableiten.

**Schließt 6 Lücken:**

- HE 12 Q1.1.4 – Entwickeln der Integrationsregeln mithilfe der Ableitungsregeln
- HE 12 Q1.1.5 – Integrieren von e^(ax+b), sin[b·(x − c)], cos[b·(x − c)]
- HE 12 Q1.1.6 – Integrieren von (ax + b)^r mit r ∈ ℚ \ {−1}, Integrieren von g(x) = f′(x)·e^f(x) (nur LK)
- HE 12 Q1.4.1 – Ermitteln einer Stammfunktion durch Formansatz mit Koeffizientenvergleich
- HE 12 Q1.4.2 – Partielle Integration (nur LK)
- HE 12 Q1.4.3 – Integration durch Substitution (nur LK)

**Prüfwerte (vorher von Hand nachrechnen, dann in die Tests):** ∫₀¹ x·eˣ dx = 1 (partiell); ∫ cos(2x) dx = ½ sin(2x) + C; ∫₀^π sin x dx = 2.

### 4. Gauß-Verfahren (`gauss-verfahren`, Klasse 11–13)

**Idee:** Gleichungssystem Schritt für Schritt auf Stufenform bringen; eine, keine oder unendlich viele Lösungen, geometrisch als Ebenen.

**Schließt 5 Lücken:**

- BW 12/13 3.6.1 (9)–(10) – lineare Gleichungssysteme untersuchen
- HB 11/12 LA – Schwerpunkt Lineare Algebra (LA 2 bis LA 4)
- HH 12 7 – Lineare Algebra (Wahlpflichtmodul)
- HE 12 Q2.3.1 – Systematisches Lösen von linearen Gleichungssystemen (auch über- und unterbestimmte)
- NW 12/13 Q-G.6 – Lineare Gleichungssysteme

**Prüfwerte (vorher von Hand nachrechnen, dann in die Tests):** x + y + z = 6, 2y + 5z = −4, 2x + 5y − z = 27 → (5 | 3 | −2); ein System mit Zeile 0 = 1 → keine Lösung; eines mit Nullzeile → unendlich viele.

### 5. Richtungsfeld und Differenzialgleichungen (`richtungsfeld`, Klasse 12)

**Idee:** Richtungsfeld zeichnen, Lösungskurven durch Startpunkte, Wachstum und Schwingung (2. Ordnung).

**Schließt 5 Lücken:**

- HE 12 Q1.5.1 – Beschreiben und Entwickeln von Modellen für Wachstums- und Zerfallsprozesse mithilfe von Differenzialgleichungen
- HE 12 Q1.5.2 – Lösungsverfahren für Differenzialgleichungen erster Ordnung
- HE 12 Q1.5.3 – Untersuchen von Differenzialgleichungen zweiter Ordnung (nur LK)
- SN 11/12 GK-W6 – Differentialgleichungen (Wahlbereich Grundkurs)
- SN 11/12 LK-W6 – Differentialgleichungen (Wahlbereich Leistungskurs)

**Prüfwerte (vorher von Hand nachrechnen, dann in die Tests):** y′ = 0,5·y, y(0) = 2 → y(2) = 2·e ≈ 5,437; Euler mit h = 0,5 liefert 2·1,25⁴ ≈ 4,883 (Abweichung sichtbar machen).

### 6. Prognose- und Konfidenzintervalle (`konfidenzintervall`, Klasse 12–13)

**Idee:** Viele Stichproben ziehen, Intervalle sehen, die p treffen oder verfehlen; Konfidenzellipse, nötiger Stichprobenumfang.

**Schließt 5 Lücken:**

- HE 13 Q3.4.1 – Prognoseintervalle für relative Häufigkeiten
- HE 13 Q3.4.2 – Konfidenzintervalle für Wahrscheinlichkeiten
- HE 13 Q3.4.3 – Konfidenzdiagramme (Konfidenzellipse) (nur LK)
- HE 13 Q3.4.4 – Stichprobenumfänge (nur LK)
- NW 12/13 Q-S.5 – Beurteilende Statistik

**Prüfwerte (vorher von Hand nachrechnen, dann in die Tests):** n = 100, h = 0,4, 95 % (c = 1,96), Wald-Intervall: [0,304; 0,496]; Prognoseintervall p = 0,5, n = 100: [0,402; 0,598].

### 7. Komplexe Zahlen (`komplexe-zahlen`, Klasse 10–13)

**Idee:** Gaußsche Zahlenebene, Rechnen als Verschieben und Drehstrecken, Polarform, Lösungen von x² = −1, Matrixdarstellung.

**Schließt 5 Lücken:**

- HE 13 Q4.3.1 – Algebraische Form
- HE 13 Q4.3.2 – Polarform
- HE 13 Q4.3.3 – Lösen von Gleichungen in der Menge ℂ der komplexen Zahlen
- HE 13 Q4.3.4 – Darstellen der komplexen Zahlen mit 2x2-Matrizen (nur LK)
- SN 10 W1 – Komplexe Zahlen (Wahlbereich)

**Prüfwerte (vorher von Hand nachrechnen, dann in die Tests):** (1 + i)·(1 − i) = 2; (1 + i)² = 2i; |3 + 4i| = 5, arg ≈ 53,13°; Lösungen von z² = −4: ±2i.

### 8. Potenz- und Wurzelgesetze (`potenzgesetze`, Klasse 9–10)

**Idee:** Potenzgesetze sichtbar machen, negative und gebrochene Exponenten als Wurzeln.

**Schließt 3 Lücken:**

- BW 9/10 3.3.1 (1)–(3) – mit Potenzen umgehen
- HE 7/8 1.2.3 – Potenzen mit rationalen Exponenten
- NW 9/10 9.3 – Gesetze und Regeln

**Prüfwerte (vorher von Hand nachrechnen, dann in die Tests):** 2³·2⁴ = 2⁷ = 128; 8^(2/3) = 4; 4^(−1/2) = 0,5; √2·√8 = 4.

### 9. Wachstumsmodelle (`wachstumsmodelle`, Klasse 10–12)

**Idee:** Linear, exponentiell, beschränkt und logistisch im Vergleich, explizit und rekursiv.

**Schließt 3 Lücken:**

- HE 12 Q1.3.5 – Logistisches Wachstum (nur LK)
- HE 12 Q1.5.1 – Beschreiben und Entwickeln von Modellen für Wachstums- und Zerfallsprozesse mithilfe von Differenzialgleichungen
- SN 10 W2 – Logistisches Wachstum (Wahlbereich)

**Prüfwerte (vorher von Hand nachrechnen, dann in die Tests):** Logistisch, S = 100, B(0) = 10, k so, dass B(t) = 100/(1 + 9·e^(−0,5t)): B(0) = 10, Wendepunkt bei B = 50 (t = 2·ln 9 ≈ 4,394).

### 10. Kegelschnitte als Ortslinien (`kegelschnitte`, Klasse 9–12)

**Idee:** Parabel, Ellipse und Hyperbel als Ortslinien und als Schnitt eines Kegels; Gärtnerkonstruktion.

**Schließt 3 Lücken:**

- NI 9/10 18.4 – Parabel als Ortslinie
- SN 11/12 GK-W1 – Kegelschnitte (Wahlbereich Grundkurs)
- SN 11/12 LK-W1 – Kegelschnitte (Wahlbereich Leistungskurs)

**Prüfwerte (vorher von Hand nachrechnen, dann in die Tests):** Ellipse a = 5, b = 3 → e = 4, Brennpunkte (±4 | 0), Abstandssumme 10; Parabel y = x²/4 → Brennpunkt (0 | 1), Leitlinie y = −1.
