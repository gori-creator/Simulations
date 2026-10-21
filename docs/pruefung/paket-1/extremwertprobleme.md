# Prüfprotokoll: `extremwertprobleme` – Extremwertprobleme

Prüfer: Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-2.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung · Datum: 21.10.2026 · Stand: Commit `0ed8bd9`, darauf dieser Durchgang (Zweig `befunde-b-2`) · Bogen: Screenshots im Scratchpad (`befb2/`, außerhalb des Repos)

## Ergebnis
korrigiert (Einheiten LE/FE zweisprachig, Text zum Optimum, Randverhalten statt Werte außerhalb von D, Texte DE/EN)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet:**
  1. *(selbst)* Dose, $V = 1000$ cm³, $r = 3$ cm: $O = 2\pi \cdot 9 + 2000/3 \approx 56{,}55 + 666{,}67 = 723{,}2$ cm² ✓. Optimum $r = \sqrt[3]{500/\pi} \approx 5{,}42$ cm, $O = 6\pi r^2 \approx 553{,}6$ cm²; $553{,}6 / 723{,}2 \approx 76{,}5\,\%$ ✓. Der Wert ist Optimum durch aktuellen Wert (`quality` beim Minimum = best/cur), der neue Satz „Das Optimum beträgt 76,5 % des aktuellen Werts.“ hat also den richtigen Bezug.
  2. Schachtel: $V(2) = 2 \cdot 26 \cdot 16 = 832$ cm³, $832 / 1056{,}3 \approx 78{,}8\,\%$ ✓.
  3. Rechteck: $A(0{,}8) = 2{,}4\,e^{-0{,}4} \approx 1{,}609$, $A(2) = 6/e \approx 2{,}207$ ✓.
- **Einheiten:** `META.rect` hatte `ux: 'LE', uz: 'FE'` auch im Englischen → `L('LE', 'units')`, `L('FE', 'square units')`, Ausgabe über den Helfer `U`; ebenso die fest eingetragene „FE“ im Lösungsweg. Die übrigen Einheiten (cm, cm², cm³, m, s) sind in beiden Sprachen gleich.
- **Randwerte:** „V(0) = V(10) = 0“ bei $D = ]0; 10[$ → „V(x) → 0 für x → 0 und x → 10“ (Lösungsweg im Bild und DE-Text). Ebenso beim Kegel („V(r) → 0 für r → 0 und r → R“) und beim Rechteck („A(u) → 0 für u → 0 und u → ∞“, vorher „A(0) = 0“ bei $u > 0$).

## 2. Aufgaben und Texte (DE und EN)
- DE Aufgabe 3: „Eine Ecke liegt im Ursprung, die gegenüberliegende Ecke $P(u \mid f(u))$ …“.
- EN: „where he enters the water“ → „where the lifeguard enters the water“.

## 3. Geräte (Prüfbogen)
- **1360 px hell/dunkel, 390 px hell/dunkel; Dose, Kegel, Rechteck und Rettungsschwimmer (EN):** keine Überlappungen, kein Überlauf.
- Der lange Satz zum Optimum war in der Karte „Jetzt“ abgeschnitten → in der Karte die Kurzform „Optimum: 76,5 % des aktuellen Werts“ (Schrift wird bei Bedarf kleiner), der ganze Satz steht in der Ergebnisliste.

## 4. Barrierefreiheit
- Unverändert.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/extremwertprobleme/index.ts` | Einheiten zweisprachig (`U`), Text zum Optimum (Karte kurz, Liste ganz), Randverhalten bei Schachtel, Kegel und Rechteck, EN „the lifeguard“ |
| `src/content/simulations/de/extremwertprobleme.md` | Rechteck-Formulierung, Randverhalten bei Schachtel und Rechteck |

## 6. Für den Kern (nicht selbst ändern)
- keine

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Die Ergebnisliste trennt Wert und Anteil mit „ · “ („V(2) = 832 cm³ · 78,8 % des Maximums“). Nicht geändert, weil nicht im Befund; bei Bedarf wie in `kugeln` auf „;“ umstellen.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3370/3370 grün (148 Dateien), Build ok.
