# Prüfprotokoll: `newton-verfahren` – Newton-Verfahren

Prüfer: Paket 3 · Datum: 21.10.2026 · Stand: Commit `c4cee10` (Ausgangsstand) · Bogen: `/tmp/boegen3/newton-verfahren.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. √2 aus f(x) = x² − 2, f′(x) = 2x, x₀ = 1: x₁ = 1 − (−1)/2 = 1,5; x₂ = 1,5 − 0,25/3 = 17/12 ≈ 1,416667; x₃ = 17/12 − (1/144)/(17/6) = 17/12 − 1/408 = 577/408 ≈ 1,4142157 (√2 = 1,4142136) ✓ (Karte, Tabelle, Ergebnisse). Richtige Stellen 0 → 2 → 5 → 11 ✓ (1,5 | 1,41… | 1,41421… | 11 Stellen). C = 1/(2√2) = 0,35355 ⇒ „C ≈ 0,354“ ✓.
  2. Newtons Beispiel x³ − 2x − 5, x₀ = 2: f(2) = −1, f′(2) = 10 ⇒ x₁ = 2,1; f(2,1) = 9,261 − 4,2 − 5 = 0,061, f′(2,1) = 3 · 4,41 − 2 = 11,23 ⇒ x₂ = 2,1 − 0,005432 = 2,094568 ✓; Bild/Ergebnis x₃ ≈ 2,09455148, f(x₃) ≈ 1,7 · 10⁻⁹ ✓; Nullstelle 2,0945514815 ✓.
  3. cos x − x, x₀ = 1: f(1) = 0,5403 − 1 = −0,4597, f′(1) = −0,8415 − 1 = −1,8415 ⇒ x₁ = 1 − 0,2496 = 0,7504 (genau 0,750364) ✓; x₂ ≈ 0,739113, x₃ ≈ 0,739085 ✓.
  4. Zyklus x³ − 2x + 2: x₀ = 0: x₁ = 0 − 2/(−2) = 1, x₂ = 1 − 1/1 = 0 ✓; x₀ = −2: f = −2, f′ = 10 ⇒ x₁ = −1,8 → −1,76929 ✓. Waagrechte Tangente x³ − 3x + 1 bei x₀ = 1: f′(1) = 0, f(1) = −1 ✓. Sprung x₀ = 0,95: f = −0,992625, f′ = −0,2925 ⇒ x₁ = 0,95 − 3,3936 = −2,4436, Konvergenz gegen −1,879385 statt der nächsten Nullstelle 1,532089 ✓.
  5. Doppelte Nullstelle (x − 1)²(x + 2), x₀ = 2: x₁ = 2 − 4/9 = 14/9; x₂ = 14/9 − (800/729)/(345/81) = 1,2979; x₃ = 1,1554 ⇒ Fehler 1 → 0,56 → 0,30 → 0,16, Faktor (m − 1)/m = ½ ✓ (Bild: x₈ ≈ 1,0051).
- **Sonderfälle** (0, negativ, Reglergrenzen, Division durch 0, sehr groß/klein): f′(xₙ) = 0 (x² − 2 bei 0, x³ − 3x + 1 bei ±1): waagrechte Tangente bis zum Rand mit Pfeilen, Karte „Division durch 0“, Abbruch ✓. Negative Startwerte (x² − 2 → −√2) ✓, Reglergrenzen −3 und 4 ✓, Davonlaufen (|x| > 10⁶) und Zyklen bis Länge 4 werden erkannt ✓. **Behoben:** Start genau auf der doppelten Nullstelle (x³ − 3x + 2, x₀ = 1, f = f′ = 0) galt als „waagrechte Tangente, wähle einen anderen Startwert“ bzw. die Karte zeigte „x₂ = 1 − 0/0 = 1“. Jetzt: f(xₙ) = 0 ⇒ Nullstelle gefunden, kein Teilen, „Nächster Schritt“ gesperrt (`model.ts`, `index.ts`).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma und „−“ über `fmt` ✓. **Behoben:**
  - „=“ vor gerundeten eingesetzten Zahlen: Karte und Ergebnis „Letzter Schritt“ zeigten z. B. „x₃ = 2,094568 − 0,000186/11,161647 ≈ 2,094551“ ⇒ jetzt „≈“, sobald ein eingesetzter Wert gerundet ist (exakte Schritte wie „x₁ = 1 − (−1)/2 = 1,5“ bleiben „=“). Ergebnis „Verlauf“: „x* ≈ 1“ bei der doppelten Nullstelle ⇒ „x* = 1“.
  - Gerundete Werte ohne „≈“: „nächste Nullstelle wäre 1,5321“ (Sprungkarte) und Einzugsbereichskarte („● 1,414“) ⇒ jetzt mit „≈“.
  - Zehnerpotenzen mit Endnull: „6 · 10⁻⁶“ ⇒ „6,0 · 10⁻⁶“ (Mantisse immer mit einer Nachkommastelle).
  - Die Tabelle schreibt xₙ bewusst mit fester Stellenzahl (z. B. „1,500000000“), damit die fett gedruckten richtigen Stellen untereinander stehen – so gelassen.
- **Begriffe wie im Unterricht:** Startwert, Näherungswert, Iteration, Tangente, Steigungsdreieck, Heron-Verfahren, quadratische Konvergenz, doppelte Nullstelle, Einzugsbereich, Zyklus ✓. **Ergänzt** im Lernmaterial: Abbruchkriterium (|xₙ₊₁ − xₙ| klein, Probe f(xₙ) ≈ 0).
- **Neue/ergänzte Tests:** `tests/newton-verfahren.test.ts` um 2 Tests ergänzt (jetzt 16): Aufgabenwerte (x₄ ändert die 6 Stellen von x₃ nicht, x₂/x₃ für cos x = x stimmen in 4 Stellen überein, e₂ ≈ 0,00245, e₃-Schätzung 2,1 · 10⁻⁶, tatsächlich 2,12 · 10⁻⁶, danach 1,6 · 10⁻¹², Fehlerfolge 1; 0,56; 0,30; 0,16); Sonderfälle (Reglergrenzen, f′ = 0 bei x = −1, Start auf der doppelten Nullstelle, negativer Startwert).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 1,5; 17/12 ≈ 1,41667 ✓. A2 Tangente t(x) = f(xₙ) + f′(xₙ)(x − xₙ) ⇒ Formel ✓. A3 2,094551 ✓. A4 0,7391 ✓. A5 f′(1) = 0; Zyklus 0 → 1 → 0, x₀ = −2: −1,8 → −1,769 ✓. A6 e₃ ≈ 0,00245²/2,828 = 2,1 · 10⁻⁶, tatsächlich 2,12 · 10⁻⁶, e₄ ≈ 1,6 · 10⁻¹² ✓; doppelte Nullstelle 1 → 0,56 → 0,30 → 0,16 ✓. Keine Rechenfehler.
- **„Beispiel laden“ geklickt:** alle 6 Beispiele und alle 15 Links des Lernmaterials (simshot, 1440/1024/768/360, hell/dunkel, DE und EN). Aufgaben-Links mit `show=0&_hide=1`: Werte, Nullstellen, Tabelle und Ergebnisse verdeckt („?“). Die Lage der Punkte auf der x-Achse ist sichtbar (grobes Ablesen, gewollt). Die Karte „Newton = Heron“ zeigt in Aufgabe 1 die Heron-Formel – keine Lösung, eher Hilfe.
- **Texte vereinfacht/korrigiert:**
  - EN war stark gekürzt (3 von 6 Aufgaben, Ausprobieren zusammengefasst, Herleitung und Konvergenz nur angerissen, Ideen ohne Einsatz/Einzugsbereiche) ⇒ vollständig auf den Stand der DE-Fassung gebracht (Dezimalpunkt).
  - DE/EN: Absatz „Wann hört man auf?“ (Abbruchkriterium), Stolperstein „zu früh aufhören“ (auch bei doppelter Nullstelle trügerisch), A3/A4-Lösung begründen jetzt, warum die Stellen sicher sind. Ausprobieren 6 erklärt die neuen Buchstaben A/B/C der Einzugsbereiche.
  - Lehrplanbezug (Ideen für den Unterricht) mit `src/curriculum/lehrplaene/bayern-gymnasium-mathematik.ts` abgeglichen: Jgst. 11, Lernbereich 4.2 „Anwendung der Differentialrechnung bei der Untersuchung ganzrationaler Funktionen“ nennt das Newton-Verfahren ⇒ „bitte am Lehrplan prüfen“ durch diese Angabe ersetzt. Heron-Verfahren steht dort in Jgst. 9 ✓ (Text „aus der 9. Klasse“ stimmt).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Handy: Bild oben, drei Karten darunter ✓. Laptop/1920/Beamer: drei Karten ✓. **Behoben:** Am iPad hoch (768) und quer (1024) fehlte die Erklärkarte (z. B. „Newton = Heron“), weil die Tabelle pauschal Platz für 3 Zeilen reservierte; die Tabelle war dabei halb leer. Jetzt richtet sich die Reserve nach der tatsächlichen Zeilenzahl, die Erklärkarte weicht erst bei sehr wenig Platz, und die Tabellenzeilen werden bei Platzmangel enger (bis 17 px) statt eine Zeile wegzuscrollen (vorher war z. B. in Aufgabe 6 Zeile 0 versteckt, obwohl Platz frei war).
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf (Bogen, simshot). Kleinigkeit offen: Die Beschriftung des neuesten xₙ kann eine Achsenzahl überdecken (z. B. „x₂“ über „1,5“), unkritisch. Der Bogen fotografiert während der Einstiegsanimation; eigene Fotos nach 4–6 s.
- **Touch (Ziehen) und Maus:** Startwert x₀ mit der Maus gezogen (Folge rechnet live nach) ✓, Antippen der x-Achse setzt x₀ ✓; Touch über `addHandle`/`TapTarget` des Kerns. Zieh-Hinweis „markierte Punkte“ passt (x₀ ist der einzige ziehbare Punkt).

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Bogen) und eigene Messung (`reducedMotion: 'reduce'`, zwei Bilder im Abstand von 1,5 s gleich) nach Start, 1× und 2× „Nächster Schritt“, „Alles abspielen“ (√2 und doppelte Nullstelle), „Neu starten“, allen 6 Beispielen, Funktionswechsel, Einzugsbereiche an, Antippen: 15/15 still. **Behoben:** „Alles abspielen“ lief bei reduzierter Bewegung weiter Schritt für Schritt (alle 0,7 s ein neues Bild); jetzt erscheinen sofort alle sinnvollen Schritte.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung; alles über Regler, Auswahl und Knöpfe erreichbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente. Alt-Text (DE/EN) um die Einzugsbereiche mit Buchstaben ergänzt.
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** **Behoben:** Karten-, Pillen- und Tabellenflächen, Ränder, Schatten, Glanzlichter und der Tabellen-Verlauf waren feste Hex-/rgba-Werte ⇒ jetzt aus `theme.bg`/`theme.text` gemischt. **Behoben (nur Farbe):** Die Einzugsbereiche (grün, türkis, lila) waren nur über die Farbe den Nullstellen zuzuordnen ⇒ jeder Bereich trägt unten einen Buchstaben A/B/C (Nullstellen von links) bzw. „–“ (keine Nullstelle), dieselben Buchstaben stehen an den Nullstellen und in der Karte. Sonst unterscheiden sich die Elemente zusätzlich durch Form und Beschriftung (Lot gestrichelt, Tangente mit „Steigung f′(xₙ)“, Zyklus mit Pfeilen und Beschriftung, Nullstellen als Ringe).

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/newton-verfahren/index.ts` | Theme-Farben statt fester Hex-/rgba-Werte (Karten, Pillen, Schatten, Glanz, Tabellenverlauf) |
| `src/simulations/mathematik/newton-verfahren/index.ts` | „≈“ statt „=“ vor gerundeten eingesetzten Zahlen (Karte, Ergebnisse), „≈“ bei gerundeten Nullstellen, „x* = 1“, Mantisse mit Endnull |
| `src/simulations/mathematik/newton-verfahren/index.ts` | Einzugsbereiche mit Buchstaben A/B/C/„–“ im Bild, an den Nullstellen und in der Karte; Alt-Text ergänzt |
| `src/simulations/mathematik/newton-verfahren/index.ts` | iPad: Erklärkarte bleibt, Tabellenreserve nach Zeilenzahl, engere Zeilen statt Wegscrollen |
| `src/simulations/mathematik/newton-verfahren/index.ts` | reduzierte Bewegung: „Alles abspielen“ zeigt sofort das Ende; Start auf der Nullstelle ohne „0/0“, „Nächster Schritt“ dann gesperrt |
| `src/simulations/mathematik/newton-verfahren/model.ts` | `newtonStep`: f(x) = 0 ⇒ Wert bleibt (kein Abbruch wegen f′ = 0 auf der doppelten Nullstelle) |
| `src/content/simulations/en/newton-verfahren.md` | auf den Stand der DE-Fassung gebracht |
| `src/content/simulations/de/newton-verfahren.md` | Abbruchkriterium, Stolperstein „zu früh aufhören“, Begründung in A3/A4, Buchstaben der Einzugsbereiche, Lehrplanbezug nach Lehrplandatei |
| `tests/newton-verfahren.test.ts` | 2 Tests ergänzt (16 insgesamt) |

## 6. Für den Kern (nicht selbst ändern)
- Wie bei `grenzverhalten`/`logarithmus`: eine gemeinsame Hilfe für „=“/„≈“ (`fmt.approx`) und für Zehnerpotenzen mit fester Mantisse würde die eigenen `eqs`/`shownExact`/`numSrc` ersetzen.
- Der Prüfbogen fotografiert während der Einstiegsanimation (hier nur Schritt 1 halb gezeichnet). Eine Wartezeit von etwa 4 s vor dem Foto würde den Endzustand zeigen.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- **Lehrplan:** Die Lehrplandatei ordnet `newton-verfahren` Jgst. 11, Lernbereich 4.2 zu; das passt zu `grades: [11, 11]` und zum Lernmaterial. Ob die quadratische Konvergenz (e_{n+1} ≈ C · e_n²) und die Einzugsbereiche im LehrplanPLUS vorkommen oder Vertiefung sind, kann ich nicht belegen – das Lernmaterial führt beides als Beobachtung bzw. „für Interessierte“.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3091/3091 grün (134 Dateien), Build ok.
