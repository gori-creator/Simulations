# Prüfprotokoll: `funktion-zuordnung` – Funktion oder nicht? Zuordnungen und ihre Graphen

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `cbe3b03` (Basis), Korrekturen in diesem Commit · Bogen: `scratchpad/pruefung/funktion-zuordnung/funktion-zuordnung.png` (nicht im Repo)

## Ergebnis
korrigiert (Rechenlogik und Einstufungen fachlich richtig; EN-Lernmaterial war deutlich kürzer als DE und ist jetzt gleichwertig; Urteilstext „höchstens ein y“ präzisiert)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. Kreis $x^2 + y^2 = 9$ bei $x = 1$: $y^2 = 9 - 1 = 8$, $y = \pm\sqrt 8 \approx \pm 2{,}83$. Anzeige „2 Schnittpunkte – ≈ (1 | −2,83); ≈ (1 | 2,83)“ ✓. Per Ziehen am Handy bei $x = 2{,}45$: $\sqrt{9 - 6{,}0025} = \sqrt{2{,}9975} \approx 1{,}73$ ✓.
  2. Liegende Parabel $x = 0{,}5y^2 - 2$ bei $x = 0$: $y^2 = 4$, $y = \pm 2$ → (0 | −2); (0 | 2) ✓; bei $x = -3$: $y^2 = -2$ → kein Schnittpunkt ✓.
  3. S-Kurve $x = 0{,}25y^3 - 2y$: Umkehrstellen bei $y = \pm\sqrt{8/3} \approx \pm 1{,}633$, dort $x = 0{,}25 \cdot 4{,}354 - 3{,}266 \approx \mp 2{,}18$ → drei Schnittpunkte genau für $-2{,}18 < x < 2{,}18$ (Leiste 1 | 3 | 1 ✓). Bei $x = 3$: $y \approx 3{,}396$ ($0{,}25 \cdot 39{,}17 - 6{,}79 \approx 3{,}00$), Anzeige „≈ 3,4“ ✓. Bei $x = 0$: $y(0{,}25y^2 - 2) = 0$ → $y = 0$, $y = \pm\sqrt 8$ ✓.
  4. Parabel $f(x) = 0{,}5x^2 - 2$: $f(0) = -2$, $f(2) = 0$, $W = \{y \mid y \ge -2\}$ ✓. Hyperbel $f(4) = 2 : 4 = 0{,}5$, $D = W = \mathbb R \setminus \{0\}$ ✓.
  5. Treppe $\lfloor x \rfloor$: bei $x = 2$ Wert 2 (voller Punkt (2 | 2), hohler Punkt (2 | 1)) ✓ – volle Punkte am linken Stufenende, hohle am rechten, im Bild korrekt.
  6. Pfeildiagramm „Quadrat ↦ Zahl“ (A = {0; …; 4}): 1 → −1; 1 und 4 → −2; 2 (mehrere Pfeile), 2 und 3 ohne Pfeil → keine Funktion ✓. „x ↦ 2x + 1“ umgekehrt: 1↦0, 3↦1, 5↦2, 7↦3 = $(x-1):2$ ✓ Funktion. „Monat ↦ Kind“: März ohne Pfeil, Mai mit zwei Pfeilen → keine Funktion ✓.
- **Fachliche Prüfpunkte:** Funktion = jedem $x \in D$ genau ein $y$ ✓ (`isFunction` verlangt `missing = []` **und** `multi = []`, also genau ein Pfeil, nicht „höchstens“/„mindestens“). Element links ohne Pfeil ⇒ keine Funktion ✓ (Abzeichen „?“, gestrichelter Rand, Hinweis „kein Pfeil“). Mehrere x auf dasselbe y erlaubt ✓ (eigener Hinweis „… ist erlaubt“). Linientest: Kreis, liegende Parabel, S-Kurve ⇒ keine Funktion; Parabel, Hyperbel, Treppe, Halbkreis ⇒ Funktion ✓. Offene/gefüllte Punkte der Treppe korrekt ✓. Wertetabelle zeigt bei zwei Werten „−1; 1“ in einer Zelle, rot ✓. Senkrechte Gerade $x = 2$ und Betragsfunktion sind **nicht** als Graph eingebaut → im Lernmaterial als Papieraufgabe ergänzt (Aufgabe 7), Ausbau siehe Rückfragen.
- **Sonderfälle:** Hyperbel bei $x = 0$: keine Schnittstelle, Text „0 gehört nicht zur Definitionsmenge“ ✓. Kreis/Halbkreis bei $x = \pm 3$: genau ein Punkt (0) ✓. Liegende Parabel bei $x = -2$: ein Punkt ✓. Reglergrenzen ±6 ✓. Alle Pfeile löschen → alle Elemente „?“, keine Funktion ✓. Kubische Gleichung: Diskriminante und trigonometrische Form richtig (Tests mit $(y-1)(y-2)(y+3)$ und doppelter Lösung).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** `fmt.num`/`fmt.point`, „≈“ nur bei gerundeten Werten, Minus als „−“, DE „(1 | 2,83)“, EN „(1, 2.83)“ ✓.
- **Begriffe wie im Unterricht:** Zuordnung, Funktion, Definitionsmenge $D$, Wertemenge $W$ (EN: domain $D$, range $R$), senkrechter Linientest ✓.
- **Neue/ergänzte Tests:** `tests/funktion-zuordnung.test.ts`: „genau ein Pfeil“ (fehlender Pfeil ⇒ keine Funktion; gemeinsames Ziel erlaubt; Wertemenge nur getroffene Elemente) und nachgerechnete Werte (Kreis/liegende Parabel ±√8, Parabel −1,5, Treppe negativ und an Sprungstelle, Halbkreis an den Rändern).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** Aufgaben 1–6 richtig, keine Abweichungen. Aufgabe 2: zwei Änderungen genügen (3→5 entfernen, 4→3 setzen) ✓ (auch als Test). Aufgabe 3 (a) ja, (b) nein ✓. Aufgabe 4: $x = 0$ → $(0 \mid \pm 2)$ ✓. Aufgabe 5 ✓. Aufgabe 6 ✓.
- **„Beispiel laden“ geklickt:** alle Ausprobier- und Aufgabenlinks (`ex=square`, `ex=square&rev=1`, `ex=lin`, `ex=own`, `ex=own&show=0&_hide=1`, `ex=month&rev=1`, Kreis, Halbkreis, Treppe, S-Kurve mit Abtasten, liegende Parabel Aufgabe/Lösung, Parabel Aufgabe/Lösung, Hyperbel) – alle ok, Aufgabenlinks verbergen Urteil und D/W.
- **Texte korrigiert:**
  - EN war nur halb so lang (3 statt 6 Aufgaben, 5 statt 8 Ausprobier-Punkte, Aufgabe „number ↦ its double“ fehlte, keine Wertetabellen-, Reparier- und Sprungstellen-Aufgabe, gekürzte Unterrichtsideen) → vollständig an DE angeglichen.
  - Tabelle „Graph“: „höchstens ein Punkt“ → „über jeder Stelle $x$ aus $D$ genau ein Punkt (jede senkrechte Gerade trifft ihn höchstens einmal)“.
  - Ausdrücklich: Element links ohne Pfeil ⇒ auf der Menge links keine Funktion.
  - Aufgabe 1 um (e) Person ↦ Geburtstag (Funktion) und (f) Geburtstag ↦ Person (keine) ergänzt.
  - Neue Aufgabe 7: senkrechte Gerade $x = 2$ (keine Funktion), waagrechte Gerade $y = 2$ (Funktion), $f(x) = |x|$ (Funktion, $W = \{y \mid y \ge 0\}$).
  - Simulation: Urteil „Jedem x ist höchstens ein y zugeordnet“ → „Jedem x aus D ist genau ein y zugeordnet“ (DE/EN).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle Ansichten vollständig, Karten (Tabelle, Graph, Urteil) auf dem Tablet vorhanden.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** keine gefunden. Ergebnis „Definitions- und Wertemenge“ im Pfeildiagramm stand ohne Trenner („D = {…} W = {…}“, weil Leerzeichen zusammenfallen) → jetzt mit Komma.
- **Touch (Ziehen) und Maus:** Ziehen der Testlinie am Handy (390 px) geprüft: x springt von 1 auf 2,45, Anzeige und Leiste folgen ✓. Pfeile per Tippen links/rechts und Ziehen setzbar (Code geprüft, Gummiband, Treffer mit Toleranz).

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Umkehr-Animation und Abtasten entfallen, Abtasten markiert sofort die ganze Leiste).
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Bedienelemente der Seite in sinnvoller Reihenfolge; Pfeile setzen geht nur per Zeiger (Ersatz: Beispiele/Umkehren per Taste).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Zeichenfläche beschrieben; Ergebnisse (Zuordnung, Wertetabelle als Tabelle, Urteil, D/W) als Text.
- **Farben:** nur `ctx.theme` (Serien, Kartenhintergründe fest pro hell/dunkel wie in anderen Simulationen). Rot/Grün nie allein: Abzeichen „?“/Anzahl, gestrichelter Rand, Text „1 Schnittpunkt/2 Schnittpunkte“, Zahl in der Leiste, Haken/Kreuz im Urteil ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/funktion-zuordnung/index.ts` | Urteil Funktionsgraph: „jedem x aus D genau ein y“ (DE/EN); Ergebnis D/W im Pfeildiagramm mit Komma getrennt |
| `src/content/simulations/de/funktion-zuordnung.md` | Tabelle Graph präzisiert, „kein Pfeil ⇒ keine Funktion“, Aufgabe 1 (e)/(f), neue Aufgabe 7 (Gerade x = 2, y = 2, Betrag), Hinweis für Lehrkräfte |
| `src/content/simulations/en/funktion-zuordnung.md` | vollständig an DE angeglichen (8 Ausprobier-Punkte, 7 Aufgaben, Unterrichtsideen) |
| `tests/funktion-zuordnung.test.ts` | 2 neue Tests (genau ein Pfeil, nachgerechnete Werte) |

## 6. Für den Kern (nicht selbst ändern)
- `dragHint`-Text „Die markierten Punkte lassen sich mit Maus oder Finger ziehen.“ passt hier nicht ganz (gezogen werden Pfeile bzw. die senkrechte Gerade). Eine optionale, simulationseigene Formulierung des Hinweises wäre hilfreich.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Ausbau: Sollen eine senkrechte Gerade $x = 2$ (unendlich viele Schnittpunkte – passt nicht zu `curveYs` als Liste) und die Betragsfunktion $f(x) = |x|$ als weitere Graphen in die Auswahl? Bisher nur als Papieraufgabe 7 behandelt.
- Wertetabelle: Bei zwei Werten zu einem $x$ steht „−1; 1“ in **einer** Spalte. Die im Unterricht übliche Form (zwei Spalten mit demselben $x$) wäre ein kleiner Umbau der Tabelle; Aufgabe 3 (b) zeigt diese Form im Lernmaterial.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3021/3021 grün (130 Dateien), Build ok.
