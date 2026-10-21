# Prüfprotokoll: `binomische-formeln` – Binomische Formeln am Quadrat

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `27a49a6` (vor den Korrekturen) · Bogen: `scratchpad/pruefung/binomische-formeln/binomische-formeln.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Rechnung und Flächenmodell fachlich richtig; Meldung bei a ≤ b war fachlich falsch und auf dem Handy abgeschnitten, englisches Lernmaterial unvollständig, eigene Tests ergänzt)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung), a = 5, b = 3:**
  1. 1. Formel: $(5 + 3)^2 = 8^2 = 64$; $a^2 + 2ab + b^2 = 25 + 2 \cdot 5 \cdot 3 + 9 = 25 + 30 + 9 = 64$ ✓ (Anzeige „(5 + 3)² = 64 = 25 + 30 + 9“).
  2. 2. Formel: $(5 - 3)^2 = 2^2 = 4$; $25 - 30 + 9 = 4$ ✓ (Anzeige „(5 − 3)² = 4 = 25 − 30 + 9“).
  3. 3. Formel: $(5 + 3)(5 - 3) = 8 \cdot 2 = 16$; $25 - 9 = 16$ ✓ (Anzeige „(5 + 3)(5 − 3) = 16 = 25 − 9“).
  4. Reglergrenze $a = 10$, $b = 0{,}5$, 3. Formel: $10{,}5 \cdot 9{,}5 = 99{,}75 = 100 - 0{,}25$ ✓. $a = 10$, $b = 6$, 1. Formel: $16^2 = 256 = 100 + 120 + 36$ ✓.
  5. Kopfrechnen (Tests): $51^2 = (50 + 1)^2 = 2500 + 100 + 1 = 2601$; $49 \cdot 51 = (50 - 1)(50 + 1) = 2500 - 1 = 2499$ ✓.
- **Flächenmodell:**
  - 1. Formel: Quadrat $(a + b)^2$ aus $a^2$, zwei Rechtecken $a \cdot b$ und $b^2$, lückenlos und ohne Überlappung (neuer Test) ✓. Beim Zerlegen rücken die Teile auseinander, Bemaßungen a, b ✓.
  - 2. Formel: gestricheltes Quadrat $a^2$; die zwei Streifen $a \cdot b$ (rechts, oben) überlappen sich im Quadrat $b^2$, das beim Zerlegen doppelt erscheint und mit „doppelt abgezogen“ beschriftet ist; übrig bleibt $(a - b)^2$ ✓. Hinweis „muss einmal wieder dazu“ ✓.
  - 3. Formel: aus $a^2$ wird $b^2$ entfernt; der obere Streifen $(a - b) \times b$ wird um 90° gedreht und rechts an das Rechteck $a \times (a - b)$ gelegt → Rechteck $(a + b)(a - b)$ (geprüft: Mittelpunkt $(a + b/2,\ (a - b)/2)$, Lage $[a, a + b] \times [0, a - b]$) ✓.
- **Sonderfälle:** $b = 0$ über den Regler nicht erreichbar ($b \ge 0{,}5$), im Test: alle Formeln liefern $a^2$ ✓. $a = b$: 2. und 3. Formel ergeben 0 ✓. $b > a$: vorher stand bei „Mit Zahlen“ „Für diese Formel muss a größer als b sein.“ – fachlich falsch, die Formeln gelten für alle Zahlen. Jetzt: Rechnung mit Zahlen wird immer gezeigt (z. B. „(3 − 3)² = 0 = 9 − 18 + 9“, „(2 + 5)(2 − 5) = −21 = 4 − 25“); die Zeichenfläche sagt „Das Flächenmodell braucht a > b. Die Formel gilt trotzdem.“ (zweizeilig, Größe passt sich an; vorher auf dem Handy links und rechts abgeschnitten), der Hinweis erklärt es.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** keine Einheiten (Längen ohne Einheit, passend). Dezimalkomma über `fmt.num` („0,5“, „99,75“) ✓, „−“ in Text und negativen Zahlen ✓. Bei Schrittweite 0,5 sind alle Werte Vielfache von 0,25, also mit 2 Nachkommastellen exakt.
- **Begriffe wie im Unterricht:** binomische Formeln, ausmultiplizieren, faktorisieren, Seitenlänge ✓.
- **Neue/ergänzte Tests:** `tests/binomische-formeln.test.ts` (8 Tests: Prüfwerte a = 5, b = 3; Kopfrechnen 51², 49², 49 · 51, 53², 21 · 19; typischer Fehler $(a+b)^2 \ne a^2 + b^2$; b = 0; a = b; b > a; alle Reglerwerte; Zerlegung der 1. Formel). Die bestehenden Tests in `tests/new-models.test.ts` bleiben unverändert.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** 1: $53^2 = 2809$, $49^2 = 2401$, $21 \cdot 19 = 399$ ✓. 2: $(x+4)^2 = x^2 + 8x + 16$, $(2x-3)^2 = 4x^2 - 12x + 9$, $(5+y)(5-y) = 25 - y^2$ ✓. 3: $49 - 29 = 20 = 2 \cdot 5 \cdot 2$ ✓. 4: $(x+5)^2$, $(7+y)(7-y)$, $(3a - 2b)^2 = 9a^2 - 12ab + 4b^2$ ✓. Keine Abweichungen.
- **Typischer Fehler sichtbar:** Aufgabe 3 und der Einstiegstext; in der Simulation sind die zwei Rechtecke $a \cdot b$ beim Zerlegen eigene Teile.
- **„Beispiel laden“ geklickt:** alle vier Beispiel-Knöpfe (setzen auf Standardwerte zurück, „a = 8, b = 3“ also 1. Formel) und alle Links (2. Formel, 3. Formel, Aufgabe 3) ✓.
- **Texte:** DE: „unter der Bühne“ → „unter der Zeichenfläche“; Grenzen des Modells um a ≤ b mit Beispiel ergänzt, Lehrkräfte in Sie-Form. EN war deutlich kürzer (Ausprobieren Punkt 4, Aufgabe 3 „Fehler finden“, dritter Faktorisierungsterm, Lösungswege fehlten; „Grade 7/8“) → inhaltsgleich zur deutschen Fassung neu geschrieben. Alt-Text der Zeichenfläche beschreibt jetzt das Flächenmodell genauer.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alles vorhanden, Figur und Beschriftungen gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Behoben: Meldung bei a ≤ b auf dem Handy abgeschnitten. Bei der 2. Formel liegt „doppelt abgezogen“ auf dem Handy knapp an der Kante des b²-Quadrats, noch lesbar.
- **Touch (Ziehen) und Maus:** kein Ziehen angeboten; Animation über den Knopf, auch mitten in der Animation umkehrbar.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (laut Bogen; Animation nur auf Knopfdruck über `Tween`).
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** unauffällig.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** alle Bedienelemente benannt ✓; Alt-Text präzisiert (statisch, beschreibt nicht den aktuellen Zustand – die Ergebnisse tun das).
- **Farben:** nur `ctx.theme` ✓; Formel-Anzeige färbt a², 2ab, b² wie die Teilflächen. Unterscheidung zusätzlich über Beschriftung der Flächen, nicht allein über Farbe ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/binomische-formeln/index.ts` | „Mit Zahlen“ auch bei a ≤ b (Formeln gelten immer); Meldung auf der Zeichenfläche fachlich richtig, zweizeilig, Größe angepasst; eigener Hinweis bei a ≤ b; Alt-Text präzisiert |
| `src/content/simulations/de/binomische-formeln.md` | „Zeichenfläche“ statt „Bühne“; Grenzen des Modells (a ≤ b) mit Beispiel |
| `src/content/simulations/en/binomische-formeln.md` | inhaltsgleich zur deutschen Fassung neu |
| `tests/binomische-formeln.test.ts` | neu (8 Tests) |

## 6. Für den Kern (nicht selbst ändern)
- keine

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- keine. Anregung (nicht umgesetzt): Bei der 3. Formel ist die Figur einfarbig (violett), während die Formel-Anzeige a² blau färbt; ein farblich abgesetztes a² wäre möglich, aber kein Fehler.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2962/2962 grün (128 Dateien), Build ok.
