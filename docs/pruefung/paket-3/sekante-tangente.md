# Prüfprotokoll: `sekante-tangente` – Von der Sekante zur Tangente

Prüfer: Paket 3 · Datum: 21.10.2026 · Stand: Commit `54edc80` (Ausgangsstand) · Bogen: `/tmp/boegen3/sekante-tangente.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Lehrbuchwerte f(x) = x², x₀ = 1: h = 1: (4 − 1)/1 = 3; h = 0,5: (2,25 − 1)/0,5 = 2,5; h = 0,1: (1,21 − 1)/0,1 = 2,1; allgemein m_s = 2 + h ⇒ Tabelle 3 | 2,1 | 2,01 | 2,001 ✓, f′(1) = 2 ✓, Tangente y = 2x − 1.
  2. Negatives h (Beispiel „h negativ“): x₀ = 1, h = −1,5: f(−0,5) = 0,25 ⇒ m_s = (0,25 − 1)/(−1,5) = 0,5 = 2 + h ✓, Δy = −0,75 ✓; Tabelle für h = −1; −0,1; −0,01; −0,001: 1 | 1,9 | 1,99 | 1,999 ✓ (Grenzwert von links ebenfalls 2).
  3. Kubische Funktion (Aufgabe 3): x₀ = 1,15, h = 0,8: f(1,95) = 0,25 · 7,414875 − 1,95 = −0,09628; f(1,15) = 0,25 · 1,520875 − 1,15 = −0,76978 ⇒ m_s = 0,67350/0,8 = 0,8419 ✓ (Anzeige „≈ 0,842“); f′(1,15) = 0,75 · 1,3225 − 1 = −0,0081 ✓ („≈ −0,008“); waagrechte Tangenten bei ±2/√3 ≈ ±1,1547 ✓.
  4. Sinus: x₀ = 0,5, h = 1: sin 1,5 − sin 0,5 = 0,997495 − 0,479426 = 0,518069 ✓; cos 0,5 = 0,877583 ✓; Tabelle h = 0,001: ≈ cos 0,5 − 0,0005 · sin 0,5 = 0,87734 ⇒ „0,8773“ ✓.
  5. e-Funktion: x₀ = 0, h = 0,1: (1,105171 − 1)/0,1 = 1,0517 ✓; h = 1,2: (3,320117 − 1)/1,2 = 1,9334 ✓; f′(0) = 1 ✓.
- **Sonderfälle** (0, negativ, Reglergrenzen, Division durch 0, sehr groß/klein): h = 0 (Regler, Link, Ziehen von Q bis |h| < 0,001): Karte „nicht definiert (Division durch 0)“, nur die Tangente, kein Steigungsdreieck ✓; `differenceQuotient` gibt für h = 0 jetzt ausdrücklich NaN zurück (vorher implizit 0/0). Negative h: Tabelle mit Vorzeichen des eingestellten h ✓, „h → 0“ läuft von links bis −0,001 ✓. Reglergrenzen h = ±3, x₀ je Funktion geklemmt ✓. **Ergänzt:** Knick bei |x| (neue Funktion „f(x) = |x| (Knick)“ und Beispiel „Knick bei |x|“): bei x₀ = 0 rechts immer 1, links immer −1; Karte „f′(0) existiert nicht: Knick …“, keine Tangente (Legende „Tangente: keine (Knick)“), bei h = 0 eigener Hinweis; Ableitungsgraph wird am Knick getrennt (keine senkrechte Verbindungslinie).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma und „−“ über `fmt` ✓. **Behoben:**
  - Doppeltes Minus „−0,096 − −0,77“ ⇒ „−0,096 − (−0,770)“.
  - „≈“ stand immer, auch bei exakten Werten („≈ 2,5“, „f′(1) ≈ 2“) ⇒ „=“ bei exakten, „≈“ bei gerundeten Werten (Karte, Legende, Δy- und h-Beschriftung, Tangentenkarte); das „=“ vor den eingesetzten Zahlen wird „≈“, sobald eine davon gerundet ist.
  - Gerundete Werte ohne Endnullen täuschten Exaktheit vor: Tabelle „1“ für 0,99998 (sin bei x₀ = 0, h = 0,01) ⇒ „1,0000“; eingesetzte Werte wie „0,01“ für sin 0,01 ⇒ „0,0100“.
  - h wurde im Nenner auf 2 Stellen gerundet (gezogenes h = 0,047 erschien als „0,05“, obwohl gerechnet wurde mit 0,047) ⇒ immer bis zu 3 Stellen (Schrittweite 0,001).
- **Begriffe wie im Unterricht:** Sekante, Tangente, Differenzenquotient, mittlere/lokale Änderungsrate, h-Methode, Steigungsdreieck, Ableitung ✓. Ergänzt: „nicht differenzierbar“, „Knick“, „von rechts/von links“.
- **Neue/ergänzte Tests:** neue Datei `tests/sekante-tangente.test.ts` (8 Tests): Lehrbuchwerte x² (3; 2,5; 2,1; 2,01; 2,001), negatives h (0,5; 1,9; −3; −4,001), h = 0 ⇒ NaN, Grenzwert von beiden Seiten für alle vier glatten Funktionen, Werte aus dem Lernmaterial (±2/√3, sin, e-Funktion), Knick bei |x| (±1, nicht differenzierbar bei 0), „=“/„≈“-Erkennung. Die bisherigen Tests in `tests/new-models.test.ts` bleiben unverändert.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 3; 2,5; 2,1 ⇒ 2 ✓. A2 m_s = −4 + h, h = 1: −3, h = −1: −5 ⇒ f′(−2) = −4 ✓. A3 ±2/√3 ≈ ±1,15 ✓. A4 cos x ✓. A5 (neu) e − 1 ≈ 1,718; (e^0,1 − 1)/0,1 ≈ 1,052 ⇒ f′(0) = 1, Tangente y = x + 1 ✓. A6 (neu) |x|: 1 und −1 ⇒ keine Tangente ✓. Keine Rechenfehler im Bestand.
- **„Beispiel laden“ geklickt:** alle 6 Beispiele (davon „Knick bei |x|“ neu) und alle Links des Lernmaterials in DE und EN (simshot, 1440/1024/768/360, hell/dunkel). Die Lösungs-Links zeigen jeweils den beschriebenen Zustand. **Behoben:** Bei eingeschaltetem Ableitungsgraphen stand in der Legende „f′(x) = cos x“ – genau die Antwort auf Ausprobieren 5 und Aufgabe 4 ⇒ Legende zeigt nur noch „Ableitung f′“, der Term steht in der verdeckbaren Karte „Tangentensteigung“. Aufgabe 1 entspricht dem Startzustand, die Tabelle zeigt dort 3 und 2,1 ⇒ Aufgabentext „Rechne zuerst von Hand und vergleiche dann mit der Tabelle“.
- **Texte vereinfacht/korrigiert:**
  - EN war stark gekürzt (2 von 4 Aufgaben, Lösungen ohne Rechnung, h-Methode in einem Satz, Ausprobieren gekürzt, Ideen nur 2 Punkte) ⇒ vollständig auf den Stand der DE-Fassung gebracht (Dezimalpunkt).
  - DE/EN: Absatz „h = 0 nicht einsetzen (0/0)“, Kürzen nur für h ≠ 0, Tangentengleichung y = 2x − 1, Abschnitt „Knick bei |x|“, Ausprobieren 3 (h = 0) und 6 (|x|), Aufgabe 2 mit negativem h, Aufgaben 5 und 6 neu, Hinweis zu −0,008 in Aufgabe 3, Idee „beidseitiger Grenzwert“, Stolperstein „Kürzen durch h“; Stolperstein Sekante/Tangente nennt jetzt die Linienarten statt „Farben“.
  - Lehrplanbezug mit `src/curriculum/lehrplaene/bayern-gymnasium-mathematik.ts` abgeglichen: Jgst. 11, Lernbereich 4.1 „Lokales und globales Differenzieren“ (Sekanten- und Tangentensteigung, mittlere und lokale Änderungsrate, Ableitungsfunktion, Tangentengleichung) ✓, passt zu `grades: [11, 11]`.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Handy: Bild oben, alle drei Karten darunter ✓. iPad hoch: Karten unter dem Bild ✓. iPad quer, Laptop, 1920, Beamer: Karten in der Seitenleiste (beim iPad quer erst nach dem Scrollen der Leiste, wie bei den anderen Simulationen) ✓. Dunkelmodus lesbar ✓.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf (Bogen, simshot). **Behoben:**
  - Bei negativem h verdeckte „h = −1,5“ die Beschriftung P und „Q“ lag auf „Δy“ ⇒ P/Q werden auf der jeweils abgewandten Seite beschriftet, Q unterhalb, wenn Q tiefer liegt, „h = …“ steht rechtsbündig links neben P.
  - Koordinaten des Ableitungspunkts „(0,5 | 0,88)“ waren am Handy links abgeschnitten ⇒ am linken Rand rechts vom Punkt oder (wenn dort Q liegt) weggelassen.
  - Kleinigkeit offen: „x₀“ bzw. „x₀ + h“ unter der x-Achse kann eine Achsenzahl berühren (z. B. bei x₀ = 0), unkritisch.
- **Touch (Ziehen) und Maus:** P und Q mit der Maus gezogen (P: x₀ = −0,95 ⇒ m_s = (0,3025 − 0,9025)/1,5 = −0,4 ✓; Q bis kurz vor P ⇒ h = 0,047, m_s = 2,047 ✓); Q rastet bei |h| < 0,001 auf h = 0 ein. Touch über `addHandle` des Kerns. Zieh-Hinweis „markierte Punkte“ passt (P und Q sind ziehbar).

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Bogen) und eigene Messung (`reducedMotion: 'reduce'`, zwei Bilder im Abstand von 1,5 s gleich) nach „h → 0“ (springt sofort auf h = 0,001), „h zurücksetzen“, allen 6 Beispielen und „h → 0“ bei negativem h: 10/10 still.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung; alles über Regler, Auswahl und Knöpfe erreichbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente. Alt-Text (DE/EN) beschreibt jetzt P, Q, Sekante (durchgezogen), Tangente (gestrichelt), Steigungsdreieck und Ableitungsgraph.
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** **Behoben:** Legendenfläche war feste rgba-Farbe ⇒ `theme.bg` mit Deckkraft. **Behoben (nur Farbe):** Die Legende unterschied Sekante (orange) und Tangente (grün) nur über die Textfarbe, bei h = 0 war die Tangente durchgezogen wie sonst die Sekante ⇒ Legende mit Linienmuster (Sekante durchgezogen, Tangente gestrichelt), Tangente immer gestrichelt. Zusätzlich unterscheiden Beschriftungen P/Q und „Sekante“/„Tangente“ in der Legende.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/sekante-tangente/model.ts` | Funktion `abs` (|x|, Knick bei 0), `differenceQuotient` mit h = 0 ⇒ NaN, `isDifferentiable`, `isExactAt`/`roundTo` für „=“/„≈“ |
| `src/simulations/mathematik/sekante-tangente/index.ts` | Doppelminus in Klammern, „=“/„≈“ nach Exaktheit, feste Stellenzahl bei gerundeten Werten (Tabelle, eingesetzte Werte), h immer bis 3 Stellen |
| `src/simulations/mathematik/sekante-tangente/index.ts` | Auswahl „f(x) = \|x\| (Knick)“, Beispiel „Knick bei \|x\|“, Karten und Legende ohne Tangente am Knick, Ableitungsgraph am Knick getrennt |
| `src/simulations/mathematik/sekante-tangente/index.ts` | Legende: Theme-Fläche, Linienmuster, Tangente immer gestrichelt, Ableitung ohne Term (kein Vorwegnehmen der Lösung) |
| `src/simulations/mathematik/sekante-tangente/index.ts` | Beschriftungen P/Q/h bei negativem h ohne Überdeckung, Koordinaten des Ableitungspunkts nicht mehr abgeschnitten, Alt-Text DE/EN ausführlicher |
| `src/content/simulations/de/sekante-tangente.md` | h = 0 und Kürzen, Tangentengleichung, Knick bei \|x\|, Ausprobieren 3 und 6, A2 mit negativem h, A5/A6 neu, Lehrplanbezug nach Lehrplandatei |
| `src/content/simulations/en/sekante-tangente.md` | auf den Stand der DE-Fassung gebracht |
| `tests/sekante-tangente.test.ts` | neu, 8 Tests |

## 6. Für den Kern (nicht selbst ändern)
- Wie bei `newton-verfahren`/`grenzverhalten`: eine gemeinsame Hilfe für „=“/„≈“ und für „gerundet mit Endnullen, exakt ohne“ (`fmt.approx`) würde die eigenen `eq`/`val`/`isExactAt` ersetzen.
- Eine Legende mit Linienmuster als Teil von `Plot` (z. B. `plot.legend([{ label, color, dash }])`) wäre für viele Analysis-Simulationen nützlich (Sekante/Tangente, f/f′).
- `src/curriculum/mathematik.ts`: Stichwörter für `sekante-tangente` könnten um „Differenzierbarkeit“/„Knick“ ergänzt werden, falls die |x|-Erweiterung bleibt.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- **|x| als neue Funktion:** Ich habe „f(x) = |x| (Knick)“ samt Beispiel, Aufgabe 6 und Abschnitt im Lernmaterial ergänzt (Prüfauftrag nannte den Knick bei |x|). Die Kurzbeschreibung von Lernbereich 4.1 in der Lehrplandatei nennt Differenzierbarkeit nicht ausdrücklich; ob „nicht differenzierbar/Knick“ in Jgst. 11 behandelt wird oder Vertiefung ist, bitte am LehrplanPLUS prüfen. Bestehende Parameter-Schlüssel sind unverändert (nur ein neuer Wert `fn=abs`); die Erweiterung lässt sich bei Bedarf ohne Folgen für geteilte Links wieder entfernen.
- **Tangente bei h = 0:** war bisher durchgezogen, jetzt wie sonst gestrichelt (einheitlich mit der Legende). Falls die durchgezogene Linie bei h = 0 als Hervorhebung gewollt war, bitte Bescheid geben.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3099/3099 grün (135 Dateien), Build ok.
