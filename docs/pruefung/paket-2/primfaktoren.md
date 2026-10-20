# Prüfprotokoll: `primfaktoren` – Primfaktorzerlegung und Teilbarkeit

Prüfer: Paket 2 · Datum: 20.10.2026 · Stand: Commit `f6387a0` (vor den Korrekturen) · Bogen: `scratchpad/pruefung/primfaktoren/primfaktoren.png` (außerhalb des Repos)

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. 360 = 18 · 20; 18 = 3 · 6 = 3 · 2 · 3; 20 = 4 · 5 = 2 · 2 · 5 → 360 = 2 · 2 · 2 · 3 · 3 · 5 = 2³ · 3² · 5 ✓ (Baum und Ergebnisliste). Teilerzahl (3+1)(2+1)(1+1) = 24 ✓ („360 hat 24 Teiler“).
  2. ggT/kgV von 24 = 2³ · 3 und 36 = 2² · 3²: ggT = 2² · 3 = 12, kgV = 2³ · 3² = 72; Probe 12 · 72 = 864 = 24 · 36 ✓. Mengenbild: Schnittmenge 2, 2, 3; links 2, rechts 3 ✓.
  3. Sieb bis 100: gesiebt wird mit 2, 3, 5, 7 (11² = 121 > 100), neu gestrichen 49 + 16 + 6 + 3 = 74 Zahlen, dazu die 1 → 100 − 75 = 25 Primzahlen ✓. Erste neu gestrichene Zahl je Schritt ist p² (4, 9, 25, 49) ✓.
  4. 200 = 2³ · 5², 128 = 2⁷: ggT = 2³ = 8, kgV = 2⁷ · 5² = 3200 ✓; 999 = 27 · 37 = 3³ · 37 mit 8 Teilern ✓; 852 = 4 · 213 = 2² · 3 · 71 ✓.
- **Sonderfälle:** Eingabe 1 ist nicht möglich (Regler ab 2); im Sieb wird die 1 eigens grau gestrichen mit „1 ist keine Primzahl.“ ✓. n = 2 (untere Grenze) und n = 997: „… ist eine Primzahl.“, nur ein Knoten, Teiler {1, n} ✓. n = 999 (obere Grenze) ✓. 512 mit „kleinster Primfaktor“: Tiefe 9, auch auf dem Handy lesbar ✓. Teilerfremd (8, 15): „ggT = 1 (teilerfremd)“, kgV 120 ✓. Sieb bis 150: 35 Primzahlen ✓. Keine Division durch 0 möglich (alle Zahlen ≥ 2).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** nur natürliche Zahlen, keine Rundung, keine Zahlen ≥ 10 000 → keine Tausenderpunkte nötig.
- **Begriffe wie im Unterricht:** Primzahl, zusammengesetzt, Faktorbaum, Quersumme, Endziffer, ggT(a; b) mit Semikolon, Teilermenge T₂₄, Vielfachenmenge V₂₄ ✓. Teilbarkeitsregeln für 2, 3, 4, 5, 6, 9, 10, 25; die Regel für 8 (letzte drei Ziffern) und 11 fehlen (siehe Rückfragen).
- **Neue/ergänzte Tests:** `tests/primfaktoren.test.ts`, Block „Sonderfälle und Zusammenhänge“: 1 und 0 keine Primzahl, keine gerade Zahl außer 2 prim (bis 999), 999 = 3³ · 37, 997 prim; Sieb: erste neue Streichung = p², Abbruch bei p² > max (20/100/120/150), 35 Primzahlen bis 150, Streichzahlen 49/16/6/3; ggT · kgV = a · b für viele Paare, teilerfremd, ggT(200; 199) = 1; alle Aufgaben-Ergebnisse aus dem Lernmaterial.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 84 = 2² · 3 · 7, 126 = 2 · 3² · 7, 500 = 2² · 5³ ✓; A2 852: 2 ✓, 3 ✓ (QS 15), 4 ✓ (52 = 4 · 13), 6 ✓, 9 ✗ ✓; A3 Primzahlen 53, 59, 61, 67 ✓ (51 = 3 · 17, 57 = 3 · 19); A4 ggT(60; 84) = 12, kgV = 420 ✓; A5 kgV(12; 18) = 36 → 8:36 Uhr ✓; A6 Begründung a ≤ 10 ✓. „Ausprobieren“: 783 = 3³ · 29 (QS 18) ✓, 512 = 2⁹ ✓, Primzahlen ab 5 in 6 Spalten = 6k ± 1 ✓.
- **„Beispiel laden“ geklickt:** alle Beispiele und alle Links aus dem Lernmaterial geladen (Bilder `shots/`): ohne Konsolenfehler, Inhalte passend.
- **Texte vereinfacht/korrigiert:**
  - DE: „Die 2 ist die einzige gerade Primzahl.“ ergänzt; Sieb: „p · p ist das erste neu gestrichene Vielfache“ ergänzt (bereitet Aufgabe 6 vor); „Rechts siehst du …“ → „Daneben (auf dem Handy darunter) …“, weil die Regeln auf schmalen Geräten unter dem Baum stehen.
  - EN war stark gekürzt (4 statt 8 Ausprobier-Schritte, 3 statt 6 Aufgaben, ohne „Load task“-Links) → vollständig parallel zu DE neu geschrieben.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle Ansichten vollständig; auf schmalen Geräten stehen die Teilbarkeitsregeln als Plaketten unter dem Baum, Sieb und Mengenbild passen.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** keine. Lange kgV-Zeile (200 und 128) wird verkleinert, bleibt lesbar.
- **Touch (Ziehen) und Maus:** kein Ziehen; Antippen von Knoten (zerlegen/auswählen) und Siebzellen (Zerlegung als Hinweis) funktioniert.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Baum, Sieb und Zuordnen springen ohne Animation ans Ziel).
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** alle Funktionen über Knöpfe erreichbar („Zerlegen“, „Nächste Primzahl“, „Faktoren zuordnen“); nur die Auswahl eines Knotens für die Regeltafel und der Hinweis an einer Siebzelle gehen ausschließlich per Zeiger (die Wurzel bzw. die Ergebnisliste decken das Wesentliche ab).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** alle Bedienelemente benannt ✓. Die Zeichenfläche hatte nur eine feste allgemeine Beschreibung → jetzt je Ansicht mit Inhalt, z. B. „Faktorbaum von 360: 360 = 2 · 2 · 2 · 3 · 3 · 5“, „Sieb des Eratosthenes bis 100: 25 Primzahlen“, „Mengenbild …: ggT 12, kgV 72“; solange das Ergebnis noch nicht im Bild steht, ohne Ergebnis.
- **Farben, Kontrast:** Schrift auf farbigen Kugeln war fest als `#10161f`/`#ffffff` gesetzt → jetzt `ctx.theme.bg` (gleiche Werte, aber aus dem Theme). Teilbar/nicht teilbar zusätzlich mit ✓/✗, gemeinsame Teiler fett → nicht nur über Farbe.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/primfaktoren/index.ts` | Legende im Sieb: Nach Ende der Streich-Animation wurde der aktuelle Schritt („Vielfache von 3“) wieder grau, obwohl er erledigt war → `doneStep = stage >= s`. |
| `src/simulations/mathematik/primfaktoren/index.ts` | Beschreibung der Zeichenfläche passt sich Ansicht und Ergebnis an (neue Texte `alt*` in DE/EN). |
| `src/simulations/mathematik/primfaktoren/index.ts` | Schriftfarbe auf farbigen Flächen aus `ctx.theme.bg` statt fester Hex-Werte. |
| `src/content/simulations/de/primfaktoren.md` | 2 als einzige gerade Primzahl, Sieb ab p · p, Hinweis „auf dem Handy darunter“. |
| `src/content/simulations/en/primfaktoren.md` | Vollständig an DE angeglichen (alle Schritte, alle 6 Aufgaben, „Load task“-Links, Unterrichtsideen). |
| `tests/primfaktoren.test.ts` | Neuer Block mit Sonderfällen, Sieb-Eigenschaften, ggT · kgV = a · b und Aufgaben-Ergebnissen. |

## 6. Für den Kern (nicht selbst ändern)
- `Surface` bietet keine Methode, die Beschreibung der Zeichenfläche nachträglich zu ändern; hier wird `surface.canvas.setAttribute('aria-label', …)` direkt genutzt. Eine kleine Methode (z. B. `surface.setLabel()`) wäre für alle Simulationen sauberer.
- Viele Simulationen nutzen feste Farben `#10161f`/`#ffffff` für Schrift auf farbigen Flächen; ein Theme-Wert wie `onSeries` würde das vereinheitlichen.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Teilbarkeitsregel für 8 (letzte drei Ziffern) und ggf. 11 (alternierende Quersumme) fehlen in der Regeltafel. Für Jgst. 5 in Bayern reichen 2, 3, 4, 5, 6, 9, 10, 25; ob 8 ergänzt werden soll (zusätzliche Zeile in der Tafel, Platz auf dem Handy knapp), bitte entscheiden.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2887/2887 grün (125 Dateien), Build ok.
