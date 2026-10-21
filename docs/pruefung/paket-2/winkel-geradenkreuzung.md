# Prüfprotokoll: `winkel-geradenkreuzung` – Winkel an Geradenkreuzungen

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `bdff4ef` (Merge waagemodell), darauf dieser Durchgang · Bogen: `scratchpad/pruefung/winkel-geradenkreuzung/winkel-geradenkreuzung.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Rechenlogik fehlerfrei; Lösungen im Aufgabenmodus und bei Aufgabe 5 wurden vorab verraten, englisches Lernmaterial war unvollständig)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Kreuzung α = 65°: Scheitelwinkel γ = α = 65°, Nebenwinkel β = 180° − 65° = 115°, δ = β = 115°; Summe 65° + 115° + 65° + 115° = 360°. Anzeige „α = γ = 65°, β = δ = 115°“ ✓.
  2. Doppelkreuzung g ∥ h, α₁ = 62° (Beispiel Wechselwinkel): γ₁ = 62°, β₁ = δ₁ = 118°; Stufenwinkel α₂ = 62°, Wechselwinkel γ₂ = α₂ = 62° = α₁, Nachbarwinkel α₁ + δ₂ = 62° + 118° = 180°. Tabelle und „α₁ = γ₂ = 62°“ ✓.
  3. Nicht parallel α₁ = 50°, α₂ = 58°: Stufenwinkel ungleich, Unterschied 58° − 50° = 8°; Wechselwinkel α₁ = 50° ≠ γ₂ = 58°; Nachbarwinkel α₁ + δ₂ = 50° + 122° = 172° ≠ 180°. Anzeige „g ∦ h: Unterschied 8°“, nach dem Verschieben Keil „8°“ ✓.
  4. Aufgabe β₂ = 70° (g ∥ h): α₂ = 180° − 70° = 110°, α₁ = α₂ = 110°. Kette der Simulation beim Antippen von α₁: δ₂ = β₂ = 70° (Scheitelwinkel), α₁ = 180° − 70° = 110° (Nachbarwinkel) ✓.
  5. Umkehrung α₁ = 75°, δ₂ = 105°: α₂ = 180° − 105° = 75° = α₁ ⇒ g ∥ h ✓.
- **Sonderfälle:** Querlinie senkrecht (s = 90°, α₁ = 90°): alle acht Winkel 90°, Punkt für den rechten Winkel ✓. Senkrechte Geraden (w = 90°): alle vier Winkel 90°, Hinweis „g ⊥ h“ ✓. Fast parallel (w = 8°, Reglergrenze 1°): Beschriftung neben das schmale Winkelfeld gerückt ✓. Querlinie fast parallel zu g (α₁ = 4°, s = 30°): rechnerisch richtig, Zeichnung eng (siehe 3.). 0° und 180° sind nicht einstellbar (Regler 1…179°, beim Ziehen bleibt der Winkel am Rand stehen, `edgeSafe`); das Modell gibt bei Parallelen `null` zurück statt durch 0 zu teilen (`intersect`, `crossingAngles`).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Grad über `fmt.num(v, 0)`, ganze Grad; „180° − …“ mit echtem Minus ✓.
- **Begriffe wie im Unterricht:** Scheitel-, Neben-, Stufen- (F), Wechsel- (Z) und Nachbarwinkel (E); α, β, γ, δ gegen den Uhrzeigersinn, Index 1 an g, Index 2 an h. Das Lernmaterial nennt andere übliche Namen (entgegengesetzte Winkel, E-/U-Winkel, jetzt auch α′ statt α₂).
- **Neue/ergänzte Tests:** „Umkehrung“: Für alle ganzzahligen α₁, α₂ (1…179°) gilt die Stufen-, Wechsel- bzw. Nachbarwinkel-Beziehung genau dann, wenn g ∥ h; dazu der Prüfwert α₁ = 75°, δ₂ = 105°. Insgesamt 19/19 grün.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 (α = 38° → γ = 38°, β = δ = 142°), A2 (x + 3x = 180° → 45° und 135°), A3 (62° und 118°), A4 (α₁ = 110°), A5 (8° Unterschied → nicht parallel), A6 (α₂ = 75° → parallel): alle Lösungen richtig.
- **„Beispiel laden“ geklickt:** alle Links aus DE und EN geladen und angesehen. Auffällig war A5 (`vals=0`): α₂ = 58° steht im Aufgabentext, die Simulation zeigte aber „h: ?“. Gleichzeitig zeigte sie schon „g ∦ h: Unterschied 8°“, „α₁ ≠ α₂“ und „hier sind g und h nicht parallel“, also die Lösung. Behoben (siehe 5.).
- **Texte vereinfacht/korrigiert:** Das EN-Lernmaterial war stark gekürzt (3 statt 6 Aufgaben, 5 statt 7 Ausprobier-Schritte, die Spalte „Lage“ fehlte). Es ist jetzt an DE angeglichen. Der Hinweis zu den Begriffen ist in DE und EN um U-Winkel und die Schreibweise α′ ergänzt.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Alle Ansichten sind vollständig, die Karten sind auf dem iPad vorhanden. Auf dem Handy fällt die dritte Karte („Merke“/„Lage“) aus Platzgründen weg. Das ist unkritisch, weil der Inhalt auch im Lernmaterial steht.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Der Punkt für den rechten Winkel berührte bei 90° die Beschriftung („β₁“ sah aus wie „β₁₃“) – behoben. Extremfall Querlinie fast parallel zu g (α₁ < 5°): g und h liegen eng beieinander, die Beschriftungen „γ₁ 4°“ und „α₂ 4°“ sind am Rand teils angeschnitten. Das betrifft nur Extremwerte und wurde nicht geändert.
- **Touch (Ziehen) und Maus:** Die Griffe auf g und h (Kreuzung) sowie auf g, h und s (Doppelkreuzung) laufen über Zeigerereignisse, also für Maus und Finger gleich. Beim Ziehen ändern sich die Werte wie erwartet (z. B. h-Griff → α = 122°; s-Griff dreht s, g bleibt liegen, α₁ 50° → 92°). Ziehen an h schaltet „g ∥ h“ bewusst aus.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Die Tab-Reihenfolge ist laut JSON regulär, und alle Einstellungen sind über Regler und Auswahl bedienbar. Winkel in der Zeichenfläche lassen sich aber nur per Zeiger antippen; im Aufgabenmodus hilft per Tastatur nur „Alle aufdecken“ (siehe 6.).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen. Der Alt-Text beschreibt Kreuzung, Doppelkreuzung und Seitenleiste.
- **Farben:** nur aus `ctx.theme`. Winkel sind immer zusätzlich mit Buchstabe und Größe beschriftet; „parallel ✓“, „g ∦ h“ und „≠“ stehen als Text und Zeichen da. Nichts ist nur über Rot/Grün unterscheidbar ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/winkel-geradenkreuzung/index.ts` | Aufgabenmodus: Die Ergebnistabelle „Winkel“ zeigte sofort alle acht Lösungen. Jetzt zeigt sie nur den gegebenen und die aufgedeckten Winkel. |
| `src/simulations/mathematik/winkel-geradenkreuzung/index.ts` | Doppelkreuzung ohne Winkelgrößen bei g ∦ h: α₂ gilt als gegeben (eigener Regler) und wird angezeigt. Das Urteil „parallel/nicht parallel“ in Karte und Gleichung ist durch eine neutrale Frage ersetzt. |
| `src/simulations/mathematik/winkel-geradenkreuzung/index.ts` | Punkt des rechten Winkels näher an den Scheitel gerückt (überlappte die Beschriftung). |
| `src/content/simulations/en/winkel-geradenkreuzung.md` | an DE angeglichen (alle 6 Aufgaben, 7 Schritte, Tabelle mit Lage, Unterrichtsideen) |
| `src/content/simulations/{de,en}/winkel-geradenkreuzung.md` | Begriffe: U-Winkel und Schreibweise α′ ergänzt |
| `tests/winkel-geradenkreuzung.test.ts` | Test „Umkehrung“ (Beziehung erfüllt ⇔ parallel) |

## 6. Für den Kern (nicht selbst ändern)
- Winkel in Zeichenflächen lassen sich nur per Zeiger antippen. Eine allgemeine Tastaturauswahl für Ziele in der Zeichenfläche (z. B. Pfeiltasten und Enter über `Surface`) würde Aufgabenmodi wie diesen auch per Tastatur bedienbar machen.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Die Simulation schreibt α₁ … δ₂ statt α, β, γ, δ und α′, β′, γ′, δ′. Beide Schreibweisen sind in Schulbüchern üblich. Nicht umgestellt, nur ein Hinweis im Lernmaterial ergänzt. Bitte entscheiden, ob die Simulation auf α′ umgestellt werden soll.
- Die Simulation zählt auch die **äußeren** Paare zu den Nachbarwinkeln (z. B. δ₁ und α₂) bzw. zu den Wechselwinkeln (z. B. γ₁ und α₂). Das ist mathematisch richtig (bei g ∥ h Summe 180° bzw. gleich groß). Manche Schulbücher nennen aber nur die inneren Paare „Nachbarwinkel“. Bitte fachlich bestätigen.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3003/3003 grün, Build ok.
