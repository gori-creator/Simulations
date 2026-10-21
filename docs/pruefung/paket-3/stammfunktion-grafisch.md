# Prüfprotokoll: `stammfunktion-grafisch` – Vom Graphen zur Stammfunktion

Prüfer: Paket 3 (Befunde Abschnitt B, Paket 6) · Datum: 21.10.2026 · Stand: Commit `0f21aca` (Ausgangsstand) · Bilder: Scratchpad `shots/sf/`

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-6.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung.

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. Regenbecken V(t) = −t³/6 + 2t² − 3,5t + 20: V(1) = −1/6 + 2 − 3,5 + 20 = 55/3 ≈ 18,33; V(10) = −1000/6 + 200 − 35 + 20 = 55/3; V(7) = −343/6 + 98 − 24,5 + 20 = 109/3 ≈ 36,33 ⇒ Minimum bei t = 1 h **und** am Rand t = 10 h ✓ (Befund bestätigt).
  2. Sparkonto K(t) = 200 + 100t − 10t²: K(5) = 450 €, K(10) = 200 €, K(12) = −40 € (alter Bereich), Nullstelle 5 + √45 ≈ 11,7 ⇒ Bereich auf [0; 10] gekürzt ✓.
  3. Parkhaus r(t) = 100 sin(π(t − 7)/10): r > 0 für 7 < t < 17, r < 0 davor und danach (6–7 und 17–20 Uhr); r(6) = 100 · sin(−π/10) ≈ −30,9 Autos/h ✓ (Bild).
  4. Aufgabe 2: C = 4 − (1 − 2) = 5, F(2) = 8 − 4 + 5 = 9 ✓.
- **Begriffe:** „Wachstumskonstante k“, „Faktor b (Periode 2π/b)“. EN „terrace point“ kommt nicht vor (bereits „saddle point“) – keine Änderung.
- **Trenner:** `ivp`, `feat`, `area`, `sit` mit „;“; `at` jetzt „f(2) = 3 = Steigung von F an der Stelle 2; F(2) ≈ 0,67“.
- **Tests:** `tests/stammfunktion-grafisch.test.ts`: Sparkonto-Test auf [0; 10] (K(10) = 200, nie unter 200 €), Regenbecken V(10) = V(1) = 55/3.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgabe 1 (Skizzieren):** Link DE/EN jetzt `?mode=draw&fn=par&show=0&_hide=1`. Im Modus „draw“ steht F in `fn` und in der Karte als „F(x) = ?“, `ivp` nennt nur den Anfangswert („F(0) = 0; C = ?; F(x) = ?“) bis „Lösung aufdecken“. „Lösung aufdecken“ setzt zusätzlich „Werte zeigen“ ein.
- **Aufgabe 4:** Zeitraum 0 ≤ t ≤ 10 h in der Aufgabe, Lösung mit Randminimum (DE und EN).
- **Weitere Aufgabenlinks mit show=0 (A2–A5, EN 2–4) geladen:** Neu verdeckt: Pille „V(t) = …“ über dem F-Graphen und innere Intervallgrenzen der Vorzeichentabelle (vorher „]1; 4[“ usw. sichtbar, verriet in Aufgabe 4 die Lösung). Markierungen HP/TP/WP im Graphen bleiben sichtbar (Lage grob ablesbar, Werkzeug).
- **Texte:** Parkhaus DE/EN „Zwischen 7 und 17 Uhr fahren mehr Autos ein als aus, davor und danach umgekehrt.“ (EN „6 a.m.“, „7 a.m. and 5 p.m.“); Aufzug DE/EN „die Höhenänderung (abwärts negativ)“.

## 3. Geräte
- 1360 hell/dunkel, 390, EN 1360: kein Überlauf, keine Konsolenfehler. **Behoben:** Anwendungskarte im Richtungsfeld sagte „Am Ende (t = 0 Monate)“, obwohl der Anfangspunkt gemeint ist ⇒ „Start (t = 0 Monate): K = 200 €.“ (kurz gehalten, sonst passt die Karte nicht mehr in die Bühne).

## 4. Barrierefreiheit
- Keine Änderung nötig.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/stammfunktion-grafisch/model.ts` | Sparkonto Bereich [0; 10], Stützstellen 0, 2, 4, 5, 6, 8, 10 |
| `src/simulations/mathematik/stammfunktion-grafisch/index.ts` | F im Skizziermodus und bei show=0 verdeckt; `at`-Text; Trenner „;“; Wachstumskonstante; Faktor b; Parkhaus-, Aufzug-Hinweis; Vorzeichentabelle verdeckt innere Grenzen; Anwendungskarte „Start“ im Richtungsfeld |
| `src/content/simulations/{de,en}/stammfunktion-grafisch.md` | Aufgabe 1 Link; Aufgabe 4 Zeitraum und Randminimum |
| `tests/stammfunktion-grafisch.test.ts` | Sparkonto und Regenbecken angepasst/ergänzt |

## 6. Für den Kern
– 

## 7. Rückfragen
- Befund 6: Kein Aufgabenlink hängt vom Ende 12 Monate ab (Link „Sparkonto“ und Beispiel mit `dc` gehen nur auf das Richtungsfeld), deshalb Bereich geändert statt Text.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests grün, Build ok.
