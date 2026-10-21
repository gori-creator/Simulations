# Prüfprotokoll: `gesetz-grosse-zahlen` – Gesetz der großen Zahlen

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `766fc69` (vor den Korrekturen) · Bogen: `scratchpad/pruefung/gesetz-grosse-zahlen/gesetz-grosse-zahlen.png` (außerhalb des Repos)

## Ergebnis
korrigiert (fachlich in Ordnung; Reißnagel-Aufgabe verriet p über den Regler, Anzeige der absoluten Abweichung ergänzt, Beschriftungen auf dem Handy, englisches Lernmaterial vervollständigt, eigene Tests)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. Relative Häufigkeit $h = k : n$. Münze, 100 Würfe, 45-mal „Zahl“: $45 : 100 = 0{,}45 = 45\,\%$ ✓ (Anzeige „h = 45 / 100 = 0,45 = 45 %“), $|h - p| = |0{,}45 - 0{,}5| = 0{,}05$ ✓, $|k - n\cdot p| = |45 - 50| = 5$ ✓. Würfel, 2100 Würfe, 384 Sechsen: $384 : 2100 = 0{,}18286 \approx 0{,}1829$ ✓.
  2. Trichter Aufgabe 1: $p = \frac16$, $n = 600$: $\sqrt{\frac{1/6 \cdot 5/6}{600}} = \sqrt{0{,}000231} = 0{,}01521$; $1{,}96 \cdot 0{,}01521 = 0{,}0298$ → $0{,}1667 \pm 0{,}0298 = 0{,}137 \ldots 0{,}196$ ✓; $92 : 600 = 0{,}153$ liegt darin ✓; Erwartung $600 \cdot \frac16 = 100$ ✓.
  3. Trichter Aufgabe 2: $p = 0{,}6$, $n = 1000$: $1{,}96 \cdot \sqrt{0{,}24 / 1000} = 1{,}96 \cdot 0{,}01549 = 0{,}0304$ → $0{,}57 \ldots 0{,}63$ ✓. Viermal so viele Würfe → Breite durch $\sqrt{4} = 2$ geteilt ✓.
  4. Würfel, 1100 Würfe, 184 Sechsen: $n \cdot p = 1100 : 6 = 183{,}33$; $|184 - 183{,}33| = 0{,}67$ ✓ (Anzeige).
- **Sonderfälle:** $n = 0$: Anzeige „–“, keine Abweichung, keine Kurve; `funnelHalfWidth(p, 0)` liefert 1 statt Division durch 0 ✓. Reißnagel $p$ von 0,05 bis 0,95 ✓. Über 200 000 Würfe wird der Verlauf nicht weiter gespeichert, der Endpunkt bleibt richtig. 1000 Würfe auf Knopfdruck und 500 Würfe/s laufen flüssig ✓.
- **Zufall:** `drawOutcome` (Inversionsmethode) ist fair: Grenzen getestet, Würfel mit festem Startwert gleichverteilt. Die Simulation selbst nutzt `Math.random`.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma über `fmt` ✓, „−“ ✓. Vorher stand „≈“ auch bei exakten Werten („h = 1 / 1 ≈ 1“) → jetzt „=“, wenn der Wert aufgeht (17/100 = 0,17 = 17 %).
- **Diagramm:** logarithmische n-Achse mit 1, 10, 100, … beschriftet; im Ursprung stand nur „0“ (vom Kern, gehört zu h), obwohl dort $n = 1$ liegt → „1“ ergänzt. Lineare Achse ✓.
- **Begriffe:** absolute/relative Häufigkeit, Wahrscheinlichkeit, empirisches Gesetz der großen Zahlen, Spielerfehlschluss ✓. Formulierung „keine Garantie, meistens immer näher“ ergänzt.
- **Neue/ergänzte Tests:** `tests/gesetz-grosse-zahlen.test.ts` (Wahrscheinlichkeiten, Grenzen von `drawOutcome`, Fairness mit festem Startwert, $|h-p|$ klein bei großem $n$ und $|k-np|$ größer als bei $n = 100$, Trichterwerte der Aufgaben, $n = 0$).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** 1–4 ✓ (siehe oben). Aufgabe 4 verlangte, $k - n\cdot p$ zu beobachten, das wurde aber nirgends angezeigt → Ergebnis „Abweichung |k − n · p|“ ergänzt. „Relative Abweichung“ (missverständlich, üblich wäre $(h-p)/p$) ersetzt durch „Abweichung der relativen Häufigkeit“.
- **„Beispiel laden“ geklickt:** alle Links (Münze, Reißnagel, Lineare Achse, Aufgabe 2) und alle vier Beispiel-Knöpfe. Befund bei Aufgabe 2 und „Reißnagel (p unbekannt)“: Der Regler „Wahrscheinlichkeit für ‚Spitze oben‘“ zeigte den gesuchten Wert 0,6 an → Regler und Trichter-Schalter sind nur noch sichtbar, wenn „Wahrscheinlichkeit p einzeichnen“ an ist. Die Aufgabe sagt jetzt, dass man zum Vergleichen diesen Schalter einschaltet.
- **Texte:** Beispiel 17/100 = 0,17 = 17 %, Werte von $p$ für Münze und Würfel und der Hinweis „keine Garantie“ ergänzt. Bilder-Hinweis an die vorhandenen Fotos angepasst. „unbekannt (eingeblendet unter Anzeige)“ → „unbekannt (einblendbar unter „Anzeige“)“. Das englische Lernmaterial war deutlich kürzer (Aufgaben 2 und 4 und zwei Ausprobier-Punkte fehlten) → inhaltsgleich zur deutschen Fassung neu geschrieben.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alles vorhanden und gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Behoben: „Werfen, um zu beginnen“ war auf dem Handy abgeschnitten (jetzt zweizeilig). Die Prozentangaben über den Balken überlappten auf dem Handy (Schriftgröße passt sich jetzt der Balkenbreite an) und wurden von der gestrichelten p-Linie durchgestrichen (jetzt mit Hintergrund-Rand).
- **Touch (Ziehen) und Maus:** kein Ziehen angeboten.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Wurf-Animation springt über `Tween` sofort ans Ende; automatisches Werfen nur nach „Abspielen“).
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** unauffällig.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** alle Bedienelemente benannt ✓; Alt-Text beschreibt Experiment und Diagramm ✓.
- **Farben:** Diagramm und Balken aus `ctx.theme` (Ereignis blau, sonst grau, p grün gestrichelt), nicht allein über Rot/Grün ✓. Würfel, Münze und Ersatzgrafiken nutzen feste Gegenstandsfarben (weißer Würfel, rotes Auge der Eins), bewusst belassen.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/gesetz-grosse-zahlen/index.ts` | Ergebnis „Abweichung \|k − n · p\|“ (`absDiff`); „=“ statt „≈“ bei exakten Werten, h zusätzlich in %; Regler `pTack` und Schalter `funnel` nur bei eingezeichnetem p sichtbar; „1“ am Ursprung der log. Achse; Starttext zweizeilig auf schmaler Fläche; Prozentangaben der Balken mit angepasster Größe und Hintergrund-Rand; Text „unbekannt (einblendbar …)“ |
| `src/content/simulations/de/gesetz-grosse-zahlen.md` | Beispiel 17/100, p-Werte, „keine Garantie“, Hinweis in Aufgabe 2, Begriffe in Aufgabe 4, Bilder-Hinweis |
| `src/content/simulations/en/gesetz-grosse-zahlen.md` | inhaltsgleich zur deutschen Fassung neu |
| `tests/gesetz-grosse-zahlen.test.ts` | neu (5 Tests) |

## 6. Für den Kern (nicht selbst ändern)
- `Plot.axes()` beschriftet den Ursprung immer mit „0“. Bei logarithmischer x-Achse liegt dort $n = 1$; eine Option wie `origin: false` wäre sauberer (hier behelfsweise „1“ daneben gezeichnet).

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- keine

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2954/2954 grün (127 Dateien), Build ok.
