# Prüfprotokoll: `gasgesetze` – Gasgesetze

Prüfer: Paket 1 · Datum: 21.10.2026 · Stand: Commit `fcdbd9a` · Bogen: `scratchpad/boegen/gasgesetze.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Aufgabenmodus verriet die Lösungen von A1–A4 in Ergebnissen und Bild; Link zu A3 stellte 105 kPa statt der 250 kPa aus der Aufgabe ein; automatische Messreihe nahm Werte bis 0,05 K neben dem Ziel auf („ϑ = 100 °C, T = 373,10 K“); unpassender Ziehen-Tipp; Reglerhilfe „Kolben am Griff ziehen“ auch im isochoren Versuch; Einheiten Pa/hPa/bar fehlten im Material; EN stark gekürzt; 3 Tests ergänzt). Rechenlogik fehlerfrei.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Start (1 mol, 0 °C, 22,4 L): p = n · R · T / V = 8,3145 · 273,15 / 22,4 = 2271,1 / 22,4 = 101,39 ≈ 101,4 kPa; p · V = 101,4 · 22,4 ≈ 2271 J ✓ (Anzeige „101,4 kPa“, „≈ 2271 J“).
  2. A2: V = 30 L → 2271,1 / 30 = 75,70 kPa; V = 15 L → 151,41 kPa ✓ (Anzeige 75,7 bzw. 151,4 kPa).
  3. Isochor, Reglergrenze n = 2 mol, ϑ = −50 °C, V = 10 L: p = 2 · 8,3145 · 223,15 / 10 = 371,08 kPa; p/T = 371,08 / 223,15 = 1,663 kPa/K ✓.
  4. Isobar am Anschlag (n = 2, 200 °C, Gewicht 60 kPa): freies V = 2 · 8,3145 · 473,15 / 60 = 131,1 L > 50 L → Kolben oben, p = 7867,9 / 50 = 157,36 ≈ 157,4 kPa ✓, Hinweis „Anschlag oben“ erscheint.
  5. Größter Druck (isotherm, n = 2, 250 °C, V = 10 L): 2 · 8,3145 · 523,15 / 10 = 869,9 kPa ✓, Manometer-Messbereich 1000 kPa.
  6. Mittlere Geschwindigkeit N₂ bei 0 °C: √(8 · 8,3145 · 273,15 / (π · 0,028014)) = √206 440 ≈ 454 m/s → Anzeige „450 m/s“ (auf 10 gerundet) ✓.
  7. Gay-Lussac 0 → 100 °C bei 101,3 kPa: 22,42 L → 30,63 L, Faktor 373,15/273,15 = 1,366 ✓.
- **Sonderfälle:** V nur 10–50 L, ϑ −50…250 °C, n 0,5–2 mol, Gewicht 50–300 kPa: keine Division durch 0 möglich. T → 0 K: Druck, Volumen, Modell-kT und mittlere Geschwindigkeit werden 0, kein NaN (Test). Kleinster Druck 18,6 kPa (n = 0,5, −50 °C, 50 L), größter 870 kPa – beide im Manometer-Messbereich (Test). Isobar am oberen/unteren Anschlag: p folgt aus V, Hinweis in Bild und „Gesetz“ ✓. Ausgleichsgerade mit < 2 verschiedenen Werten → „fehlen noch Messwerte“ ✓.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** p 1 Stelle, V 1 Stelle (Tabelle isobar 2), T 2 Stellen, p·V ganze J, V/T 4 und p/T 3 Stellen – einheitlich über `fmt.fixed`; „−273,15 °C“ mit echtem Minus ✓. Automatische Messreihe: nahm Werte schon 0,05 K vor dem Ziel auf → Tabelle „100 | 373,10“. Jetzt rastet der Zustand vor dem Aufnehmen auf den Zielwert ein.
- **Begriffe wie im Unterricht:** isotherm/isobar/isochor, Boyle-Mariotte, Gay-Lussac, Amontons, allgemeine Gasgleichung, Stoffmenge, absoluter Nullpunkt, Linearisierung, Teilchenbild ✓. Umrechnung Pa/hPa/kPa/bar und L/m³ fehlte → im Material ergänzt.
- **Neue/ergänzte Tests:** 3 neue Tests in `tests/gasgesetze.test.ts` (Aufgabenwerte A1–A3, A5, A6 einschließlich des neuen A3-Links; Reglergrenzen und Messbereich; Grenzfall 0 K); jetzt 21 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 8,3145 · 373,15 / 101,3 = 30,63 ≈ 30,6 L ✓. A2 75,7 / 151,4 kPa ✓. A3 250 · 323,15 / 283,15 = 285,3 ≈ 285 kPa (+14 %) ✓. A4 automatische Messreihe mit Rauschen: ϑ₀ ≈ −274 °C, ohne Rauschen −273 °C ✓. A5 3000 / (8,3145 · 300,15) = 1,202 mol; N = 7,24 · 10²³ ✓. Neu A6: 1013 hPa · 60/20 = 3039 hPa ≈ 304 kPa ≈ 3,0 bar.
- **Aufgabenmodus:** Mit `_hide=1` standen alle Zustandswerte offen: A2 zeigte sofort „p = 75,7 kPa“ (Pille, Gleichungskarte, Ergebnis „Zustand“), A4 „ϑ₀ ≈ −274 °C“ im Diagramm. Jetzt: „Zustand“, „Gesetz“, „Allgemeine Gasgleichung“, „Druck im Teilchenbild“ sind `spoiler`; im Bild zeigen Druck-Pille (isotherm/isochor) bzw. Volumen-Pille (isobar), p · V, n · R · T, V/T bzw. p/T, „p · V ≈ … J“, Steigung und ϑ₀ ein „?“; „aus Stößen ≈ …“ entfällt. Manometer, Glasskala und Diagramm bleiben ablesbar.
- **„Beispiel laden“ geklickt:** alle sechs Beispiele sowie alle Ausprobieren- und Aufgaben-Links geladen (DE; EN-A3-Link geprüft: 285.3 kPa). A3-Link stellte vorher 1 mol in 22,4 L ein (105 kPa bei 10 °C) → jetzt `n=1.2&V=11.3`: 250,0 kPa bei 10 °C, 285,3 kPa bei 50 °C.
- **Texte vereinfacht/korrigiert:** DE: Absatz „Einheiten“ (bar, hPa, kPa, Pa; L, dm³, m³; warum kPa · L = J), Ausprobieren 4 mit Vergleichsfaktor, A1-Lösung klarer formuliert („Faktor 1,37“ statt „nicht etwa das Hundertfache“), neue A6 (Spritze, Einheiten). EN hatte 3 statt 5 Aufgaben, 5 statt 7 Ausprobieren-Punkte und kaum Unterrichtsideen → vollständig auf DE-Umfang übersetzt (jetzt je 6 Aufgaben).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** iPad quer nutzt bereits das Nebeneinander-Layout (`w ≥ 640 || w ≥ 1,3 h`), gut lesbar; Gleichungskarte bricht dort sauber um. Handy: Szene, Diagramm und Gleichung untereinander, lesbar. Dunkel in Ordnung.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Rest (nicht geändert): Glasskala-Zahl „20“ wird teils von Teilchen bzw. dem Wasserspiegel des Wärmebads überdeckt; Hinweis „Messwerte aufnehmen …“ liegt im Diagramm auf Gitterlinien.
- **Touch (Ziehen) und Maus:** Kolbengriff mit der Maus von 22,4 L auf 10,0 L gezogen → p = 227,1 kPa (= 2271,1/10) ✓. Thermometer ziehbar. Tipp unter der Bühne lautete „Die markierten Punkte lassen sich ziehen“ → eigener `hint` (Griff, Thermometer, Reiter).

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut JSON in Ordnung. Griff, Thermometer und Diagramm-Reiter auf der Zeichenfläche entsprechen den Reglern V, ϑ und „Diagramm“ → kein `setKeyTargets` nötig.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Canvas-Beschreibung vorhanden; alle Werte zusätzlich als Text in den Ergebnissen.
- **Farben:** nur `ctx.theme.series`/Theme; Größen zusätzlich über Buchstaben (p, V, T, n) und Beschriftungen unterschieden, nicht allein über Farbe ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/gasgesetze/index.ts` | Aufgabenmodus: vier Ergebnisse als `spoiler`, abhängige Größe und Produkte im Bild als „?“, ϑ₀ und Steigung verdeckt |
| `src/simulations/physik/gasgesetze/index.ts` | automatische Messreihe rastet vor dem Aufnehmen auf den Zielwert ein (ϑ und T in der Tabelle passen zusammen) |
| `src/simulations/physik/gasgesetze/index.ts` | eigener `hint` statt `dragHint`; Reglerhilfe V „Im isothermen Versuch auch: …“ |
| `src/content/simulations/de/gasgesetze.md` | Absatz Einheiten, Ausprobieren 4, A1-Lösung, A3-Links (n = 1,2, V = 11,3), neue A6 |
| `src/content/simulations/en/gasgesetze.md` | vollständig auf DE-Umfang übersetzt |
| `tests/gasgesetze.test.ts` | 3 neue Tests (Aufgabenwerte, Reglergrenzen/Messbereich, 0 K) |

## 6. Für den Kern (nicht selbst ändern)
- Reglerhilfe (`help`) kann nicht vom Zustand abhängen; hier wäre „Kolben am Griff ziehen“ nur im isothermen Versuch richtig (jetzt allgemein umformuliert).
- Ein dynamischer `hint` je Modus wäre auch hier hilfreich (Griff nur isotherm ziehbar).

## 7. Entscheidungen
- **Im Aufgabenmodus nur die abhängige Größe verdecken** (p bei isotherm/isochor, V bei isobar) sowie alle daraus gebildeten Produkte/Quotienten: Die vorgegebenen Größen (V, ϑ, n bzw. p) sind Angaben der Aufgabe und bleiben sichtbar. Manometerzeiger, Glasskala und Diagrammachsen bleiben – ungenaues Ablesen ist erwünscht und dient der Kontrolle.
- **„Zustand“, „Gesetz“, „Allgemeine Gasgleichung“, „Druck im Teilchenbild“ als `spoiler`:** Sie enthalten jeweils die gesuchte Zahl. Ohne `_hide=1` ändert sich nichts. Die Messtabelle bleibt offen: Messwerte aufzunehmen ist ein bewusster Schritt der Schülerin/des Schülers.
- **A3-Link mit n = 1,2 mol und V = 11,3 L** statt Aufgabe zu ändern: So stellt die Simulation genau die 250 kPa aus der Aufgabe ein (250,0 kPa), der Reifen-Kontext bleibt.
- **Einheiten im Lernmaterial statt Umschalter in der Simulation:** kPa und L sind für die Gasgleichung praktisch (kPa · L = J); hPa/bar werden über den neuen Absatz und A6 geübt. Keine neuen Parameter.
- **Automatische Messreihe rastet ein**, manuelle Messwerte nicht: Beim Aufnehmen von Hand während des Angleichens sieht man bewusst den aktuellen (noch nicht ganz eingestellten) Zustand.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2988/2988 grün (133 Dateien), Build ok.
