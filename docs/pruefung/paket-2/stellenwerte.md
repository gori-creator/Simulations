# Prüfprotokoll: `stellenwerte` – Stellenwertsystem und Runden

Prüfer: Paket 2 · Datum: 20.10.2026 · Stand: Commit `847c0a7` (vor den Korrekturen) · Bogen: `scratchpad/pruefung/stellenwerte/stellenwerte.png` (außerhalb des Repos)

## Ergebnis
korrigiert (fachlich in Ordnung; Überschrift am Zahlenstrahl auf dem Handy, Beschreibung der Zeichenfläche, englisches Lernmaterial, Text „schwarze Stecknadel“)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. $3\,996$ auf Zehner: Einerziffer $6 \ge 5$ → aufrunden, $399$ Zehner $+ 1 = 400$ Zehner → $4\,000$ (Übertrag über Zehner, Hunderter, Tausender) ✓. Nachbarzahlen $3\,990$ / $4\,000$, Mitte $3\,995$, Bogen zeigt nach rechts zu $4\,000$ ✓.
  2. $45\,499$ auf Tausender: Hunderterziffer $4$ → abrunden, $45\,000$ ✓; $45\,500$: Hunderterziffer $5$ → $46\,000$ ✓ (genau die Mitte, Aufrunden nach Vereinbarung). Anzeige „Die Hunderterziffer 4/5 entscheidet.“ ✓.
  3. $6\,849\,513$ auf T / ZT / Mio: Ziffern rechts daneben $5$, $9$, $8$ → $6\,850\,000$, $6\,850\,000$, $7\,000\,000$ ✓.
  4. Bündeln $999\,999 + 1$ E: sechsmal „10 → 1 der nächsten Stelle“ (E→Z→H→T→ZT→HT→Mio), Ergebnis $1\,000\,000$, Anzeige „eine Million“ ✓. Entbündeln $1\,000 - 1$ E: T→H→Z→E je „1 = 10“, Ergebnis $999$ ✓.
  5. Zahlwort $30\,408\,015$: dreißig Millionen vierhundertachttausendfünfzehn ✓; EN thirty million four hundred and eight thousand and fifteen ✓.
- **Stellenwerttafel:** E, Z, H, T, ZT, HT, Mio, ZMio, HMio, Mrd, ZMrd, HMrd in vier farbigen Dreiergruppen (Einer, Tausender, Millionen, Milliarden) ✓; Ziffer mit Wert per Tipp („5 ZT = 50 000“) ✓; führende leere Stellen gestrichelt.
- **Große Zahlen:** $1$ Million $= 1\,000\,000$; Gliederung DE mit schmalem geschütztem Leerzeichen (U+202F) in Dreiergruppen, EN mit Komma ✓ (Test ergänzt).
- **Zahlenstrahl:** oben der Abschnitt der nächsthöheren Stelle in Zehnteln, unten Lupe zwischen den Nachbarzahlen; untere/obere Nachbarzahl als Pille, das Ergebnis farbig, Mitte gestrichelt, die entscheidende Ziffer unter dem Zehntel markiert ✓ (geprüft bei 3 996/Z, 45 499/T, 4 253 500/T, 1 000 000 000/HMio).
- **Sonderfälle:** $0$ (div10/times10 gesperrt, „null“), Höchstwert $999\,999\,999\,999$ (Plus gesperrt, Runden auf HMrd ergibt $1\,000\,000\,000\,000$, „eine Billion“), Minus bei leerer Tafel gesperrt (kein negatives Ergebnis), Rundung auf eine Stelle über der Zahl → $0$ bzw. nächste Zehnerpotenz ✓. Keine Division durch 0 möglich.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** nur natürliche Zahlen; Minus-Knopf mit „−“ ✓; „≈“ beim Runden ✓.
- **Begriffe wie im Unterricht:** Stellenwerttafel, Bündeln/Entbündeln, Rundungsstelle, Nachbarzahlen, ab-/aufrunden ✓.
- **Neue/ergänzte Tests:** `tests/stellenwerte.test.ts`: 3 996 → 4 000 mit Nachbarzahlen, 45 499/45 500 auf Tausender mit entscheidender Ziffer, Aufgaben 3, 5 (Grenzen 3 449/3 450/3 549/3 550), 6 (schrittweise vs. direkt), $1\,000\,000$ mit U+202F, Zahlwort von Aufgabe 1 in DE und EN.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** 1 (Zahlwort), 2 ($700\,000$; sieben Milliarden), 3 (s. o.), 4 ($10\,000$ Hunderter; $1\,000\,000$ Tausender), 5 ($3\,450$ bis $3\,549$), 6 (Mia $72\,000$, Tom $71\,000$ richtig) – alle Lösungen stimmen.
- **„Beispiel laden“ geklickt:** alle Links des DE-Materials und die Beispiele (999 999, 1 000, Mitte, Übertrag, Milliarde, Zehner) geladen; Aufgabe 3 mit `show=0` blendet das Ergebnis bis „Runden“ aus ✓.
- **Texte vereinfacht/korrigiert:**
  - DE: „Ziehe die schwarze Stecknadel“ → „die Stecknadel mit der Zahl“ (im dunklen Modus ist sie hell).
  - EN: war deutlich kürzer (3 statt 6 Aufgaben, 4 statt 7 Versuche, ohne Lösungsweg). An DE angeglichen: gleiche Erklärung, 7 Versuche, 6 Aufgaben mit Lösungen und Links, Unterrichtsideen und Stolpersteine.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** auf dem Handy zweizeilige Tafel (Mrd/Mio oben, T/E unten), alles sichtbar; Beamer gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** Auf dem Handy (360 px, EN) überlappte die Überschrift „Rounding to the nearest thousand“ das Ergebnis „≈ 30,408,000“ → behoben (Überschrift wird verkleinert, bis beides passt; auch „Runden auf Hundertmilliarden“ geprüft). Bei 12-stelligen Zahlen auf dem Handy liegt die Stecknadel-Beschriftung nahe der rechten Randbeschriftung der oberen Linie (lesbar, Randfall).
- **Touch (Ziehen) und Maus:** Stecknadel per Ziehen bewegt (4 253 718 → 4 253 360, Bogen springt auf „abrunden“) ✓; +/− und Spaltenüberschriften per Klick ✓.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Schritte werden sofort ausgeführt).
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Zahl und Rundungsstelle über Eingabefeld und Regler, Aktionen als Knöpfe ✓. Die +/−-Knöpfe, Spaltenüberschriften und die Stecknadel in der Zeichenfläche sind nur mit Zeiger bedienbar (gleichwertiger Weg über die Regler vorhanden).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen. Die Beschreibung der Zeichenfläche war fest; jetzt mit aktueller Zahl, Rundungsstelle, Nachbarzahlen und – erst nach dem Aufdecken – dem Ergebnis.
- **Farben:** Gruppenfarben und Akzent aus `ctx.theme`; Gruppen zusätzlich beschriftet, Rundungsstelle zusätzlich umrandet und gestrichelt abgetrennt, nichts nur über Rot/Grün. Einzelne feste Werte (Schatten, Schrift auf Akzentfläche `#10161f`/`#ffffff`) wie in anderen Simulationen – siehe „Für den Kern“.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/stellenwerte/index.ts` | Überschrift am Zahlenstrahl schrumpft, bis sie neben „≈ Ergebnis“ passt (Überlappung auf dem Handy) |
| `src/simulations/mathematik/stellenwerte/index.ts` | Beschreibung der Zeichenfläche (aria-label) passt sich an Zahl, Rundungsstelle, Nachbarzahlen und aufgedecktes Ergebnis an (DE/EN) |
| `src/content/simulations/de/stellenwerte.md` | „schwarze Stecknadel“ → „Stecknadel mit der Zahl“ |
| `src/content/simulations/en/stellenwerte.md` | an DE angeglichen (Erklärung, 7 Versuche, 6 Aufgaben, Unterrichtsideen) |
| `tests/stellenwerte.test.ts` | Prüfwerte 3 996, 45 499/45 500, Aufgaben 1, 3, 5, 6, schmales Leerzeichen |

## 6. Für den Kern (nicht selbst ändern)
- Zahlfeld in der Seitenleiste ist für große Zahlen zu schmal („425371“ statt 4253718, auf dem Handy noch weniger) und zeigt keine Dreiergliederung; der Regler 0 … 999 999 999 999 ist praktisch unbenutzbar. Vorschlag: breiteres Eingabefeld bzw. Option „ohne Regler“ für Zahl-Parameter.
- Theme ohne Farbe „Schrift auf Akzentfläche“: Simulationen nutzen dafür feste `#10161f`/`#ffffff` (auch hier).
- Zeichenfläche bietet keine Tastaturbedienung für Treffer im Canvas (hier +/− der Tafel, Spaltenüberschriften).

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Kurzzeichen in der Tafel „Mio“/„Mrd“ ohne Punkt (sonst ZMio, HMrd …); in Schulbüchern auch „M, ZM, HM“ oder „Mio.“ Bitte bei Bedarf festlegen.
- Bei gesperrtem Ergebnis (`show=0`) zeigen Zahlenstrahl und Ergebnisfeld „Nachbarzahlen“ beide Kandidaten und die entscheidende Ziffer; das Ergebnis selbst bleibt verborgen. Didaktisch gewollt?

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2871/2871 grün (125 Dateien), Build ok.
