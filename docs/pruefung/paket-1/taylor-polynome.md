# Prüfprotokoll: `taylor-polynome` – Taylorpolynome

Prüfer: Paket 1 (Befunde B) · Datum: 21.10.2026 · Stand: Commit `0ed8bd9` · Bogen: `scratchpad/shots/t-*.png` (außerhalb des Repos)

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-3.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung.

## Ergebnis
korrigiert (Hinweis „Warum ist Tₙ = Tₙ₋₁?“ nannte immer die sin-Regel; „0,01“ fest mit Komma; Aufgabe „Wie viele Summanden?“ verwechselte Grad und Anzahl der Summanden; Kommentarwert 0,2444 falsch). Rechenlogik fehlerfrei.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Relative Kleinwinkelgrenze (selbst per Bisektion): (φ − sin φ)/sin φ = 0,01 → φ ≈ 0,24410 rad ≈ 13,99° ≈ 14,0° (Kommentar sagte 0,2444) ✓, Bild „φ < 14°“.
  2. Start sin x, T₃, x = 2: sin 2 − (2 − 8/6) = 0,9093 − 0,6667 = 0,2426 ✓ (Ergebnis „≈ 0,2426“).
  3. e − T₈(1) = 3,06 · 10⁻⁶ > 5 · 10⁻⁷, e − T₉(1) = 3,03 · 10⁻⁷ < 5 · 10⁻⁷ → Grad 9 = 10 Summanden, T₉(1) ≈ 2,718282 ✓.
  4. φ = 20° = 20π/180 ≈ 0,3491 rad, sin φ ≈ 0,3420, φ − sin φ ≈ 0,0070 (2,06 %) ✓.
- **Sonderfälle:** sin um 0 bei geradem n (T₄ = T₃), cos um 0 bei ungeradem n (T₃ = T₂), cos um a ≈ π (allgemeiner Text), Polstelle x = 1 der geometrischen Reihe – Hinweise passen jetzt jeweils.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** „0,01“ in drei Bildtexten jetzt über `fmt.num(0.01, 2)` (EN „0.01“); Ergebnis „φ = 20° ≈ 0,3491 rad“ mit Einheit.
- **Begriffe wie im Unterricht:** Grad, Summand, Koeffizient, Entwicklungsstelle ✓.
- **Neue/ergänzte Tests:** keine (nur Texte und ein Kommentar geändert; Rechenlogik unverändert).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** Aufgabe „T₄(1) für eˣ“: 65/24 ≈ 2,708333, Fehler 0,009948, Lagrange e/5! ≈ 0,022652 ✓; Lösung jetzt „Grad n = 9, das sind 10 Summanden“ (EN „degree n = 9, i.e. 10 terms“).
- **„Beispiel laden“ geklickt:** „Sonderfall: sin x bei geradem n“, „cos x um π“, Pendel, „1/(1 − x) an x = 1“, Aufgabenlink e (Aufdecken-Karten) ✓.
- **Texte korrigiert:** Hinweis „Warum ist Tₙ = Tₙ₋₁?“ allgemein „Die n-te Ableitung ist an der Stelle a gleich 0 …“; sin-Zusatz nur bei sin und a = 0, cos-Zusatz („alle ungeraden Ableitungen 0“) nur bei cos und a = 0. Polstelle: „wachsen über alle Grenzen (bei a = 0: 1, 2, 3, …)“.

## 3. Geräte
- **1360 px hell/dunkel, 390 px:** Hinweiskarte, Kleinwinkelansicht und Taschenrechner angesehen; nichts abgeschnitten, kein Überlauf, keine Konsolenfehler. Tablet und Beamer nicht erneut geprüft (Layout unverändert).
- **Touch/Maus:** nicht geändert.

## 4. Barrierefreiheit
- **Reduzierte Bewegung, Tastatur, Namen:** in diesem Durchgang unverändert (keine Bedienelemente geändert).
- **Farben:** nur Theme-Farben, keine neuen.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/taylor-polynome/index.ts` | Hinweis Tₙ = Tₙ₋₁ abhängig von Funktion und a; „0,01“ über `fmt.num`; Polstellentext; „rad“ im Ergebnis |
| `src/simulations/mathematik/taylor-polynome/model.ts` | Kommentar φ ≈ 0,2441 ≈ 14,0° |
| `src/content/simulations/{de,en}/taylor-polynome.md` | Lösung: Grad 9 = 10 Summanden |

## 6. Für den Kern (nicht selbst ändern)
–

## 7. Entscheidungen
- **„(sin 0 = 0)“ auch beim cos-Zusatz:** Die ungeraden Ableitungen von cos sind ±sin, deshalb gilt dieselbe Begründung.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3371/3371 grün (148 Dateien), Build ok.
