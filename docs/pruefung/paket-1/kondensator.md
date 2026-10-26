# Prüfprotokoll: `kondensator` – Lade- und Entladekurve des Kondensators

Prüfer: Paket 1 · Datum: 21.10.2026 · Stand: Commit `daa3906` · Bogen: `scratchpad/boegen/kondensator.png` (außerhalb des Repos)

## Ergebnis
korrigiert. Die Rechenlogik ist fehlerfrei. Behoben wurden:
- Gleitkommafehler: τ wurde als „1,000 s“ statt „1,00 s“ angezeigt.
- Uneinheitliche Rundung: t½ stand als „0,693 s“, als „0,6931 s“ und bei kleinem τ als „0,007 s“.
- Der Aufgabenmodus verriet τ, I und W im Bild.
- „2 Entladen“ lag auf iPad quer und Handy auf der Leitung der Quelle.
- Material: Einheiten µF/nF/pF ergänzt, neue Aufgabe 4 (2τ, 5τ, Q).
- 3 Tests ergänzt.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. **Start** (10 kΩ, 100 µF, 10 V):
     - τ = 10⁴ Ω · 10⁻⁴ F = 1,00 s
     - I₀ = 10 V / 10⁴ Ω = 1,00 mA
     - t½ = 1 s · ln 2 = 0,693 s
     - W = ½ · 10⁻⁴ F · (10 V)² = 5,00 mJ
     - Alle vier Ergebnisse ✓.
  2. **Ende des Ladevorgangs** (t = 5,00 s = 5τ): U_C = 10 V · (1 − e⁻⁵) = 10 · 0,99326 = 9,93 V; I = 1 mA · e⁻⁵ = 6,74 µA ≈ 6,7 µA; W = ½ · 10⁻⁴ · 9,933² = 4,93 mJ. Die Anzeige im Bild ist identisch ✓.
  3. **Nach τ:** Laden 1 − e⁻¹ = 63,2 % → „63 %“. Strom e⁻¹ = 36,8 % → „37 %“ ✓. Der Punkt der Tangente liegt bei (τ, U₀) ✓.
  4. **Reglergrenze klein** (1 kΩ, 10 µF, 1 V): τ = 10³ · 10⁻⁵ = 0,0100 s; t½ = 0,00693 s; I₀ = 1 V / 1 kΩ = 1,00 mA; W = ½ · 10⁻⁵ · 1² = 5,00 µJ ✓. Die Zeitlupe zeigt 1 : 200, also 2 s echte Zeit pro τ ✓.
  5. **Reglergrenze groß** (100 kΩ, 1000 µF, 12 V): τ = 10⁵ · 10⁻³ = 100 s; t½ = 69,3 s; I₀ = 12 V / 100 kΩ = 120 µA; W = ½ · 10⁻³ · 144 = 72,0 mJ ✓. Der Zeitraffer zeigt ×50 ✓.
  6. **Umschalten mitten im Laden** (bei ≈ 8,5 V): I₀ = ΔU/R = −8,5 V / 10 kΩ = −850 µA ✓. Die Tangente trifft 0 V bei τ, „37 %“ ✓.
  7. **Halbwertszeit beim Entladen:** Bei t½ = 0,693 s liegt die Marke bei 5 V, bei 2 t½ = 1,39 s bei 2,5 V ✓.
- **Sonderfälle:**
  - t = 0: Laden beginnt bei U_C = 0 mit I = I₀; Entladen beginnt bei U₀ ✓.
  - t ≫ τ: Endwert, I → 0. Der Vorgang endet bei tEnd ≥ 5τ ✓.
  - τ = 0 und R = 0 (im Modell): keine Division durch 0 ✓ (Test). Eine negative Zeit wird wie t = 0 behandelt.
  - R klein bzw. groß sowie die Reglergrenzen sind in Punkt 4 und 5 geprüft.
  - Physik: Das Pluszeichen der Quelle (lange Platte) liegt über R an der oberen Platte, die sich positiv lädt. Der Pfeil der technischen Stromrichtung kehrt sich beim Entladen um. Die Elektronen laufen entgegen der technischen Stromrichtung ✓.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:**
  - Bisheriger Fehler: τ wurde als `10e3 · 100e-6 = 0,9999999…` gerechnet, die Stellenwahl ergab deshalb „1,000 s“.
  - Bisherige Rundung von t½: Ergebnis „0,6931 s“, Rechenkarte „0,693 s“, bei kleinem τ „0,007 s“.
  - Jetzt wird τ exakt aus kΩ · µF / 1000 gerechnet.
  - Alle Zeiten haben einheitlich drei geltende Ziffern: 100 s, 1,00 s, 0,693 s, 0,0100 s, 0,00693 s.
  - Strom: mA bzw. µA. Energie: mJ bzw. µJ. Minus als „−“ ✓.
- **Begriffe wie im Unterricht:** Zeitkonstante, Halbwertszeit, Anfangsstrom, Kapazität, Quellenspannung, technische Stromrichtung, Tangentenmethode ✓.
- **Neue/ergänzte Tests:** 3 neue Tests in `tests/kondensator.test.ts`, jetzt 9 Tests:
  - Sonderfälle t = 0, t ≫ τ, τ = 0, R = 0, negative Zeit
  - Reglergrenzen für τ, I₀ und W
  - Aufgabenwerte A2–A4 und Umschalten mitten im Vorgang

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:**
  - A1: τ = 1,0 s, I₀ = 1,0 mA, U_C(τ) = 6,32 V ✓.
  - A2: 0,693 s und 1,39 s ✓.
  - A3: 5 mJ und 1,25 mJ ✓.
  - Neu A4: 8,65 V (86 %), 9,93 V (99,3 %), Q = 1 mC.
  - Ausprobieren 5: nach 3 Halbwertszeiten bleibt ein Achtel ✓.
- **Aufgabenmodus:**
  - Bisher:
    - Mit `_hide=1` und „Werte im Bild“ an standen τ, I, U_C, „63 %“ und W in Bild und Rechenkarte.
    - Mit `val=0` zeigten die Diagramme weiter „τ = 1,000 s“ (Lösung A1).
    - Die Rechenkarte zeigte U_C, I und W (am Ende 4,93 mJ ≈ Lösung A3).
  - Jetzt prüfen alle Anzeigen `ctx.hidden` (deckt `_hide` und den Schalter `val` als `resultsParam` ab):
    - Die Rechenkarte zeigt nur die Ansätze mit „?“.
    - Die Diagramme zeigen nur „τ“.
    - Die Prozentangaben und die Pillen verschwinden.
  - Zusätzlich lädt A1 mit `tan=0`.
- **„Beispiel laden“ geklickt:** alle fünf geladen (Laden, Entladen, 47 kΩ, 20 µF, Halbwertszeit ablesen). Außerdem alle Aufgaben- und Ausprobieren-Links (`?tan=1`, `?R=20`, `?C=200`, `?sw=discharge&half=1&tan=0`). Sie passen zu den Beschreibungen.
- **Texte vereinfacht/korrigiert:**
  - DE:
    - Einheiten µF/nF/pF ergänzt.
    - Hinweis, dass C vom Bau abhängt (Plattenkondensator C = ε₀ · ε_r · A/d).
    - A1-Link mit `tan=0`.
    - A4 neu.
  - EN: A1-Link angepasst. EN ist sonst fachlich richtig und bleibt kürzer (Projektregel).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:**
  - Das Layout wählt bereits nach Breite und Höhe (`w ≥ 640 || w ≥ 1,3 h`). iPad quer steht nebeneinander und ist gut lesbar.
  - Die Diagramme haben auf allen Geräten ausreichende Größe.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:**
  - Kein Überlauf.
  - „2 Entladen“ lag auf iPad quer und Handy auf der linken Leitung und neben dem „+“ der Quelle. Wenn der Platz links nicht reicht, steht es jetzt rechts unter dem Kontakt. Das ist auf beiden Geräten geprüft.
  - Rest (nicht geändert): Bei τ = 100 s mit Halbwertszeit liegt „37 %“ im I-Diagramm dicht an den t½-Linien. Es ist lesbar, weil die Beschriftung einen Rand hat.
- **Touch (Ziehen) und Maus:** Es gibt kein Ziehen. Der Schalter lässt sich mit der Maus antippen, mit Hover-Markierung ✓.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (springt sofort ans Ende des Vorgangs).
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut JSON in Ordnung. Der antippbare Schalter ist zusätzlich über den Knopf „Umschalten“ und die Auswahl „Schalter“ bedienbar, deshalb ohne `setKeyTargets`.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** Keine Bedienelemente ohne Namen. Die Beschreibung der Zeichenfläche ist vorhanden. Die Werte stehen zusätzlich als Text in den Ergebnissen.
- **Farben:**
  - Alle Farben kommen aus `ctx.theme.series`.
  - Die Plattenladung wird zusätzlich durch „+“ und „−“ gezeigt.
  - U und I stehen in getrennten, beschrifteten Diagrammen.
  - Damit ist nichts nur über Rot/Grün unterscheidbar ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/kondensator/index.ts` | τ exakt aus kΩ · µF; Zeiten einheitlich mit drei geltenden Ziffern (Ergebnis, Rechenkarte, Diagramm, Uhr) |
| `src/simulations/physik/kondensator/index.ts` | Aufgabenmodus über `ctx.hidden`: Rechenkarte mit „?“ (auch U_C, I, W), Diagramme nur „τ“, Prozentangaben und Pillen aus |
| `src/simulations/physik/kondensator/index.ts` | „2 Entladen“ weicht bei Platzmangel nach rechts unten aus |
| `src/content/simulations/de/kondensator.md` | Einheiten µF/nF/pF, Hinweis Plattenkondensator, A1-Link `tan=0`, neue A4 |
| `src/content/simulations/en/kondensator.md` | A1-Link `tan=0` |
| `tests/kondensator.test.ts` | 3 neue Tests (Sonderfälle, Reglergrenzen, Aufgabenwerte/Umschalten) |

## 6. Für den Kern (nicht selbst ändern)
- Die Simulation hat eigene Helfer `richText` und `parts` mit der Schreibweise `U_[C]` für Indizes. Ein Umbau auf `subText` aus dem Kern wäre einheitlicher. Hier ist er nicht nötig, weil die Darstellung stimmt.
- Wird ein einzelnes Spoiler-Ergebnis aufgedeckt, wird `ctx.hidden` für das ganze Bild falsch. Deshalb erscheinen nach „Aufdecken“ von τ auch I, U_C und W im Bild. Das ist bekanntes Verhalten des Kerns. Hier ist es vertretbar, weil die Aufgabe ohnehin gelöst ist.

## 7. Entscheidungen
- **U_C, I und W in der Rechenkarte sind im Aufgabenmodus verdeckt:** Diese Werte zeigen am Ende des Vorgangs die Lösungen von A3 und A4. Die Pillen im Schaltbild waren mit `val=0` schon verdeckt, die Rechenkarte war hier inkonsequent. Die Uhr t bleibt sichtbar.
- **Kurven, τ-Linie und Tangente bleiben im Aufgabenmodus:** Ablesen am Graphen ist ungenau und erwünscht. Nur die exakte Zahl „τ = 1,00 s“ entfällt. A1 lädt zusätzlich ohne Tangente, damit gerechnet und nicht abgelesen wird.
- **Drei geltende Ziffern für alle Zeiten:** Das passt zum Material (0,693 s; 1,39 s) und vermeidet „0,007 s“ bei t½ = 0,00693 s. „0,0100 s“ an der Reglergrenze ist dafür in Kauf genommen.
- **Plattenkondensator nur als Satz im Material, keine neue Anzeige:** Die Simulation behandelt die Lade- und Entladekurve. C = ε₀ · ε_r · A/d, E = U/d und Dielektrikum gehören zu einer eigenen Simulation. Der Hinweis erklärt nur, woher C kommt.
- **Neue A4 (2τ, 5τ, Q) nur auf Deutsch:** Sie deckt die Faustregeln „63 % nach τ, über 99 % nach 5τ“ und Q = C · U ab. Nach Projektregel wird EN nicht nachübersetzt.
- **Kein `setKeyTargets` für den Schalter:** Er ist über den Knopf „Umschalten“ und die Auswahl voll per Tastatur bedienbar.
- **I₀ in der Rechenkarte als ΔU/R mit Vorzeichen:** Das bleibt so, weil es beim Umschalten mitten im Vorgang und beim Entladen fachlich richtig ist (negativer Strom). Das Ergebnisfeld nennt den Betrag U₀/R.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3395/3395 grün (148 Dateien), Build ok.
