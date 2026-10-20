# Prüfprotokoll: `exponentielles-wachstum` – Exponentielles Wachstum und Zerfall

Prüfer: Paket 3 · Datum: 20.10.2026 · Stand: Commit `8b45f4b` (Ausgangsstand) · Bogen: `/tmp/boegen3/exponentielles-wachstum.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Seerosen (a = 1, p = 100): b = 1 + 100/100 = 2, f(10) = 2¹⁰ = 1024 m² = Teichgröße ⇒ „Teich voll“ nach 10 Tagen ✓, f(9) = 512 m² (halb). T_d = log₂ 2 = 1 ⇒ jetzt „T_d = log_b 2 = 1 Tag“ (vorher „≈ 1 Tage“). Startbild: 1/1024 = 0,098 % ⇒ „1 m² von 1024 m² bedeckt (0,1 %)“ ✓.
  2. Zinseszins (a = 1000, p = 5): f(10) = 1000 · 1,05¹⁰ = 1628,89 € ✓; T_d = lg 2 / lg 1,05 = 0,30103 / 0,021189 = 14,2067 ⇒ „≈ 14,21 Jahre“ ✓. Gezogen auf t ≈ 10,3: 1000 · 1,05^10,3 = 1000 · e^(10,3 · 0,048790) = 1652,9 ⇒ „≈ 1653 €“, linear 1000 + 50 · 10,3 = 1515 € ✓. Rand t = 40: 1000 · 1,05⁴⁰ = 7039,99 ⇒ „≈ 7040 €“, g(40) = 3000 ⇒ „= 3000 €“ ✓.
  3. Iod-131 (a = 1000, p = −8): b = 1 − 0,08 = 0,92 ⇒ „b = 1 + p/100 = 0,92 (−8 % pro Schritt)“ ✓; T½ = lg 0,5 / lg 0,92 = −0,30103 / −0,036212 = 8,3130 ⇒ „≈ 8,31 Tage“ ✓ (positiv, obwohl p negativ). f(24) = 1000 · 0,92²⁴ = 1000 · e^(−2,00117) = 135,2 ⇒ „≈ 135,2 Kerne“ ✓.
  4. Frei (a = 2, p = 50): T_d = lg 2 / lg 1,5 = 0,30103 / 0,176091 = 1,7095 ⇒ „≈ 1,71 Schritte“ ✓; Tabelle 2 · 1,5³ = 6,75, 2 · 1,5⁴ = 10,125 ⇒ jetzt „10,13“ (vorher „10,1“, dann ging „· 1,5“ von Zeile zu Zeile nicht auf).
  - Modell: b = 1 + p/100, f = a · bᵗ, lineare Vergleichsgerade mit gleicher Änderung im ersten Schritt, T = ln 2 / ln b bzw. ln 0,5 / ln b (= log_b 2 bzw. log_b 0,5) ✓. Zerfallszeitpunkte der 400 Kerne τ = ln U / ln b (U gleichverteilt) ⇒ P(τ > t) = bᵗ ✓.
- **Sonderfälle** (0, negativ, Reglergrenzen, Division durch 0, sehr groß/klein): p = 0 ⇒ b = 1, „b = 1: keine Änderung“, keine Treppe ✓ (kein Teilen durch ln 1 = 0). p = −60 (Grenze) ⇒ b = 0,4 > 0 ✓. p = −50 und p = 100 sind die einzigen ganzzahligen p mit exakter Verdopplungs-/Halbwertszeit (Test). Zerfall mit p > 0: Kerne zerfallen nicht, das Schild sagte trotzdem „noch 1000 von 1000 Kernen“, während der Graph wächst ⇒ jetzt „p ≥ 0: kein Zerfall“. Lineare Vergleichsgerade wird bei Abnahme negativ (siehe Rückfragen). Logarithmische Achse: Werte werden bei 10⁻⁹ abgeschnitten, kein Fehler.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma und „−“ über `fmt` ✓. **Behoben:** „≈“ stand immer, auch bei exakten Werten (T_d = 1, f(0) = a, g(t) bei ganzen t) ⇒ jetzt „=“ bei exakten, „≈“ bei gerundeten Werten; Verdopplungs-/Halbwertszeit gerundet mit zwei Stellen samt Endnullen (`fmt.fixed`). Einzahl „1 Tag/1 Jahr/1 Schritt“ statt „1 Tage“. Kontostand im Bild immer mit Cent („1000,00 €“, vorher „1050 €“ neben „1129,7 €“). Achsenbeschriftung „t in Tagen/Jahren/Schritten“ (vorher „t in Tage“).
- **Begriffe wie im Unterricht:** Anfangswert, Wachstumsfaktor, prozentuale Änderung, Verdopplungs-/Halbwertszeit, exponentielle Abnahme – passend. **Behoben:** Die Ergebnisse schrieben T_d = ln 2 / ln b; „ln“ kommt in Bayern erst in Jahrgangsstufe 11. Jetzt „T_d = log_b 2“ bzw. „T_½ = log_b 0,5“ (mit Tief­stellung), im Lernmaterial zusätzlich „= lg 2 / lg b“ und der Hinweis, dass jeder Logarithmus geht.
- **Neue/ergänzte Tests:** `tests/exponentielles-wachstum.test.ts` neu (14 Tests): Wachstumsfaktor auch bei negativem p, f(t), lineare Vergleichsgerade, Verdopplungs-/Halbwertszeit (exakt und gerundet, „nach T½ genau die Hälfte“), p = 0 und b ≤ 0, `timeToReach` als Umkehrung, Aufgaben 1–4, `isExactTo` und `displayDecimals`.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 9 Tage ✓; A2 1628,89 €, T_d ≈ 14,2 Jahre, linear 1500 € ✓; A3 (½)³ = 12,5 %, b = 0,5^(1/8) = 0,91700 ⇒ 8,3 % Abnahme ✓; A4 ln 2 / ln 1,02 = 35,003, / ln 1,05 = 14,207, / ln 1,1 = 7,273 ⇒ 35,0; 14,2; 7,3 ✓. Keine Abweichungen.
- **„Beispiel laden“ geklickt:** alle 5 Beispiele und alle Links (Ausprobieren 2–4, Lösungslinks A1, A2) mit simshot (360, 768, 1024, 1440, hell/dunkel, DE/EN). Die Links stehen in den Lösungen bzw. bei „Ausprobieren“; Funktionsterm und Verdopplungszeit sind Spoiler-Ergebnisse. Beispiel „Iod-131 (Halbwertszeit 8 Tage)“ ergibt mit p = −8 tatsächlich 8,31 Tage ⇒ Beschriftung „Halbwertszeit ≈ 8 Tage“, im Lernmaterial erklärt.
- **Texte vereinfacht/korrigiert:**
  - EN war stark gekürzt (2 von 4 Aufgaben, 3 von 4 Ausprobieren, Lösungen in einem Satz, fast keine Ideen für den Unterricht) ⇒ vollständig auf den Stand der DE-Fassung gebracht, mit Dezimalpunkt.
  - Neu (DE/EN): negativer Prozentsatz bei Abnahme („−8 % ⇒ b = 0,92, nicht 0,08“), Herleitung T_d = log_b 2 aus b^T = 2, Hinweis „≈“/„=“, Stolperstein „Prozentsatz und Wachstumsfaktor verwechselt“, „nach zwei Halbwertszeiten ist noch ein Viertel übrig“, Idee zur Wertetabelle (Faktoren gegen Differenzen).
  - „Spiele die Seerosen ab“ ⇒ „Starte die Seerosen mit „Abspielen““. Interner Hinweis auf `docs/BILDER.md` aus den Unterrichtsideen entfernt (die Bilder sind vorhanden).
  - Alt-Text der Zeichenfläche beschreibt jetzt Bildteil (je Beispiel), Graph, ziehbaren Punkt, Treppe und Vergleichsgerade.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** **Behoben:** Auf dem iPad (hoch und quer, Zeichenfläche knapp unter 700 px breit) standen Bild und Graph untereinander im flachen Querformat; der Teich war dadurch winzig. Jetzt entscheidet das Seitenverhältnis (Breite ≥ 1,2 · Höhe ⇒ nebeneinander), am iPad steht der Teich groß links. Handy: untereinander wie vorher. Dunkelmodus gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. **Behoben:** Die Faktoren „· 1,5“ der Wertetabelle ragten am Laptop über den Rand des Bildteils hinaus; die Tabelle ist jetzt mittig, die Faktoren stehen innerhalb, die Schrift wird am Handy kleiner statt zu überlappen. Bei logarithmischer Achse überdeckt die oberste Teilung „100000“ fast die Achsenbeschriftung „€“ und die x-Achsenbeschriftung fehlt (siehe „Für den Kern“).
- **Touch (Ziehen) und Maus:** Zeitpunkt mit Maus und Touch (CDP) gezogen: kein Sprung beim ersten Schritt (2 px ⇒ t = 0,2), 100 px ⇒ t ≈ 10,3, Begrenzung bei t = 40 ✓. `dragHint` passt (der markierte Punkt ist ziehbar).

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Bogen) und eigene Messung (`reducedMotion: 'reduce'`, zwei Bilder im Abstand von 1,5 s gleich) nach allen 5 Beispielen. **Behoben:** Nach „Abspielen“ glitt der Zeitpunkt gleichmäßig weiter, zerfallende Kerne bekamen einen aufblitzenden Ring. Jetzt springt t bei reduzierter Bewegung etwa einmal pro Sekunde um ganze Zeitschritte (rund 10 Sprünge), der Ring entfällt. „Abspielen“ ist von Hand gestartet, darum bleibt die Zeit dort nicht stehen (wie bei `galtonbrett`).
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung; t ist auch über „Abspielen“/„Zurücksetzen“ erreichbar, alle Größen über Regler.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente; Alt-Text (DE/EN) erweitert; Ergebnisse als Text.
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** **Behoben:** Schild-Hintergrund (Pille) und Hintergrund des Bildteils waren feste rgba-Werte ⇒ jetzt `theme.bg`/`theme.text`; der Ring der zerfallenden Kerne war fest orange ⇒ `theme.series[3]`. Die lineare Vergleichsgerade unterschied sich nur über die Farbe ⇒ jetzt gestrichelt und mit „linear“ beschriftet. Fest bleiben nur Bildfarben (Münzen gold, Kerne gelb, Ersatzgrafik für Teich/Seerosen, falls die Fotos fehlen). Intakte und zerfallene Kerne unterscheiden sich zusätzlich in der Größe.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/exponentielles-wachstum/index.ts` | „=“/„≈“, Endnullen, Einzahl der Zeiteinheit, `log_b`-Schreibweise in den Ergebnissen, Cent beim Kontostand, Achse „t in Tagen“ |
| `src/simulations/mathematik/exponentielles-wachstum/index.ts` | Aufteilung nach Seitenverhältnis (iPad nebeneinander); Wertetabelle mittig, 2 Stellen, Faktoren innerhalb, EN „×“ |
| `src/simulations/mathematik/exponentielles-wachstum/index.ts` | lineare Gerade gestrichelt + beschriftet; Theme-Farben für Schild, Hintergrund, Ring; Zerfall mit p ≥ 0: „kein Zerfall“ |
| `src/simulations/mathematik/exponentielles-wachstum/index.ts` | reduzierte Bewegung: Sprünge statt Gleiten, kein Ring; Beispiel „Halbwertszeit ≈ 8 Tage“; Alt-Text erweitert |
| `src/simulations/mathematik/exponentielles-wachstum/model.ts` | `isExactTo`, `displayDecimals` |
| `src/content/simulations/de/exponentielles-wachstum.md` | negativer Prozentsatz, log_b/lg, „≈“/„=“, Iod-131-Hinweis, Stolpersteine, Tabellenidee |
| `src/content/simulations/en/exponentielles-wachstum.md` | auf den Stand der DE-Fassung gebracht |
| `tests/exponentielles-wachstum.test.ts` | neu, 14 Tests |

## 6. Für den Kern (nicht selbst ändern)
- Logarithmische y-Achse (`Plot`): Liegt y = 0 außerhalb des Bereichs, fehlt die x-Achsenbeschriftung („t in Jahren“ nicht sichtbar, Beispiel „Logarithmische Achse“), und die oberste Teilung (z. B. „100000“) stößt an die y-Achsenbeschriftung.
- `formatNumber` gruppiert nie (`useGrouping: false`): „100000“ statt „100 000“ an der Achse. Für Zahlen ab 5 Stellen wäre ein schmales Leerzeichen üblich.
- Wie bei `cavalieri`: gemeinsame Hilfe für „=“/„≈“ mit Endnullen (`fmt.approx`) würde die eigene `isExactTo` ersetzen.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- **Lineare Vergleichsgerade bei Abnahme:** g(t) = a + a · p/100 · t wird negativ (Iod-131 mit Vergleich: ab t = 12,5 Tagen, „linear: g(t) = −2200 Kerne“ bei t = 40). Soll g bei 0 enden (lineare Abnahme bis „alles zerfallen“) oder als reine Funktion weiterlaufen?
- **Iod-131 und ganze Prozent:** Der Regler p hat Schrittweite 1, darum ist T½ = 8,31 Tage statt der echten 8,02 Tage (dafür wäre p = −8,3 nötig). Schrittweite 0,1 wäre möglich, macht den Regler aber feiner. Bitte entscheiden.
- **Zinseszins zwischen den Jahren:** Graph, Münzen und „Kontostand“ wachsen stetig (z. B. 1129,73 € nach 2,5 Jahren), bei jährlicher Verzinsung springt der Kontostand aber nur zum Jahresende. Als Modell üblich; ggf. im Text erwähnen oder als Treppe zeichnen?

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2952/2952 grün (129 Dateien), Build ok.
