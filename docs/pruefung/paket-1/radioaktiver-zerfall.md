# Prüfprotokoll: `radioaktiver-zerfall` – Radioaktiver Zerfall und Halbwertszeit

Prüfer: Paket 1 · Datum: 21.10.2026 · Stand: Commit `1ee2413` · Bogen: `scratchpad/boegen/radioaktiver-zerfall.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Aufgabenmodus verriet die Lösungen von A1, A2, A4 und A5 in Bild und Ergebnissen; Zählrate auf dem Handy über dem Lautsprecher-Symbol; Legende im log-Diagramm über den Messpunkten; Kern-Beobachten nicht per Tastatur erreichbar; „Fast alle Kerne zerfallen“ auch bei N = 0; Schwankung ~√N fehlte im Material; EN hatte 3 statt 5 Aufgaben; 4 Tests ergänzt). Rechenlogik und Nukliddaten fehlerfrei.

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Rn-220: λ = ln 2 / 55,6 s = 0,6931 / 55,6 = 0,01247 1/s → Anzeige „≈ 0,0125 1/s“ ✓. 1 g: 6,022 · 10²³ / 220 = 2,74 · 10²¹ Kerne, A = 0,01247 · 2,74 · 10²¹ = 3,41 · 10¹⁹ Bq → „2,7 · 10²¹“, „3,4 · 10¹⁹ Bq“ ✓.
  2. C-14 (Beispiel, 1000 Kerne): t = 9860 a → 9860 / 5730 = 1,721 T½ ✓; Theorie 1000 · 2^(−1,721) = 303,6 (Messwert 307) ✓. λ = 0,6931 / 5730 = 1,210 · 10⁻⁴ 1/a ✓; 1 g: 6,022 · 10²³ / 14 = 4,30 · 10²² Kerne; A = 1,210 · 10⁻⁴ / 3,156 · 10⁷ s · 4,30 · 10²² = 1,65 · 10¹¹ Bq → „1,6 · 10¹¹ Bq“ ✓.
  3. U-238: λ = 0,6931 / 4,47 = 0,155 1/(10⁹ a) ✓; Zeitraffer 4,47 · 10⁹ a / 6 = 7,45 · 10⁸ a → „1 s ≙ 7,5 · 10⁸ a“ ✓; spezifische Aktivität 0,6931 / (4,47 · 10⁹ · 3,156 · 10⁷ s) · 6,022 · 10²³ / 238 = 4,91 · 10⁻¹⁸ · 2,53 · 10²¹ = 1,24 · 10⁴ Bq → „12 000 Bq“ ✓ (Tabellenwert 12,4 kBq/g).
  4. Rn-220, 2500 Kerne, log: t = 112,3 s → 112,3 / 55,6 = 2,02 T½ ✓; Restanteil 25,4 % → t = 55,6 s · log₂(1/0,254) = 55,6 · 1,977 = 109,9 s ≈ „109,8 s“ (Anzeige rechnet mit ungerundetem Anteil) ✓; A = 0,01247 · 636 = 7,93 1/s ✓.
  5. I-131: λ = 0,6931 / 8,02 d = 0,0864 1/d ✓; Zeitraffer 8,02 / 6 = 1,34 → „1 s ≙ 1,3 d“ ✓.
- **Nukliddaten:** Rn-220 55,6 s (α → Po-216), I-131 8,02 d (β⁻ + γ → Xe-131), Cs-137 30,1 a (β⁻ → Ba-137, γ über Ba-137m, im Material erklärt), C-14 5730 a (β⁻ → N-14), U-238 4,47 · 10⁹ a (α → Th-234) – alle wie in Schultabellen ✓; Tochterkerne erfüllen die Erhaltung von A und Z (Test).
- **Sonderfälle:** N₀ ist im Präparat-Versuch 100…2500 (Regler), N₀ = 1 entspricht dem Versuch „Ein einzelner Kern“. t = 0: „Noch kein Kern zerfallen“, Theorie = N₀ ✓. Alle zerfallen (N = 0, z. B. 100 Kerne nach 5 T½): Versuch stoppt, „Zeit aus dem Restanteil“ meldet „aus Restanteil 0 keine Zeit“ ✓, Messpunkt N = 0 auf der log-Achse ausgelassen ✓; das Etikett sagte aber „Fast alle Kerne zerfallen“ → jetzt „Alle Kerne zerfallen“. Ende nach 10 T½ (≈ 0,1 % übrig). Sehr lange Zeiten: `remainingFraction` → 0 ohne Fehler, `ageFromFraction` für winzige Anteile endlich, für 0 oder > 1 NaN (Tests). Division durch 0: keine (λ, p bei 0 abgefangen).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma und echtes Minus überall (auch Zehnerpotenzen `10⁻⁴`), Tausender mit schmalem Leerzeichen ab 10 000, Zeiten je Nuklid mit fester Stellenzahl. In Ordnung.
- **Begriffe wie im Unterricht:** Mutterkern/Tochterkern, Halbwertszeit, Zerfallskonstante, Aktivität (Bq), Zählrohr/Zählrate, Zerfallsreihe, mittlere Lebensdauer ✓. Die statistische Schwankung (~√N) fehlte → im Material ergänzt.
- **Neue/ergänzte Tests:** 4 neue Tests in `tests/radioaktiver-zerfall.test.ts` (alle Aufgabenwerte A1–A5; Sonderfälle t = 0, ein Kern, p = 0/1, sehr lange Zeiten, Ende nach 10 T½; Streuung ½√N₀ für 100 und 2500 Kerne über viele Durchläufe; Halbwertszeiten der Nuklide), jetzt 22 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 24 d ≈ 3 · 8,02 d → 1000 · ⅛ = 125 (genau 125,6) ✓. A2 λ = 1,21 · 10⁻⁴ 1/a, A = 0,121 1/a, 1/0,121 = 8,3 a, 0,121 / 3,156 · 10⁷ s = 3,8 · 10⁻⁹ Bq ✓. A3 25 % = (½)² → 11 460 a ✓. A4 2 · 55,6 s = 111,2 s → T½ ≈ 56 s ✓. A5 50 % (gedächtnislos), τ = 1,44 T½ ✓. Neu A6: σ = √(N₀ · ½ · ½) = ½√N₀ → 100: 5 (10 % von 50), 2500: 25 (2 % von 1250).
- **Aufgabenmodus:** Mit `_hide=1` zeigten „Momentan“ (Theorie ≈ 125 → A1), „Nuklid und Zerfall“/„Aktivität“ und der Kopf des Aktivitätsdiagramms (λ und A → A2), T½ in der Gleichungskarte, der Zeitraffer und „t = … = 2,00 T½“ über dem Diagramm (→ A4) sowie „Dieser Kern“ („immer 50 %“ → A5) die Lösungen. Jetzt: „Momentan“ und „Aktivität und Zählrohr“ sind `spoiler`; bei `ctx.hidden` zeigen Karte und Ergebnis „T½ = ?“, λ ohne Zahlenwert, „A ≈ ? 1/…“, die Zeit nur in der Nuklid-Einheit, kein Zeitraffer, und der 50-%-Satz fehlt. A3-Link mit `theo=0`, damit die Marke „¼ N₀ bei 2 T½“ nicht die Lösung zeigt.
- **„Beispiel laden“ geklickt:** alle sechs (Rn-220 500, 100 Kerne, log 2500, C-14, Iod-131, ein Kern) und alle Aufgaben-/Ausprobieren-Links (DE und EN-Seite mit U-238) – passen zu den Beschreibungen.
- **Texte vereinfacht/korrigiert:** DE: Würfelbild im Abschnitt „Zufall“, Absatz „Zufällige Schwankung“ (½√N₀), Hinweis „N(t) wird nie ganz null, im echten Präparat zerfällt aber irgendwann der letzte Kern“, A4 präzisiert (625 Kerne, Vergleich mit der Auswahl, Rechnung 111 s : 2), neue A6 (vertiefend), Tastaturhinweis in Ausprobieren 4, Hinweis zum Aufgabenmodus in den Unterrichtsideen. EN hatte 3 statt 5 Aufgaben, 5 statt 7 Ausprobieren-Punkte und gekürzte Unterrichtsideen → vollständig auf DE-Umfang übersetzt.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Layout wählt bereits nach Breite und Höhe (`w ≥ 640 || w ≥ 1,3 h`); iPad quer nebeneinander, gut lesbar. Handy: Szene und Diagramme untereinander, Diagramme flach, aber lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Behoben: Zählrate „≈ 1,2 pro s“ lag auf dem Handy über dem Lautsprecher-Symbol (jetzt „/s“ früher und ggf. kleinere Schrift); im log-Diagramm lag die Legende oben rechts über Messpunkten und „½ N₀“ (jetzt unten links, wo die log-Achse frei ist).
- **Touch (Ziehen) und Maus:** keine Ziehpunkte; Antippen von Kern, „linear/log“, Lautsprecher und Einzelkern mit der Maus geprüft ✓.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut JSON in Ordnung. „linear/log“ und Lautsprecher sind auch als Schalter erreichbar, Einzelkern über „Nächster Kern“/Abspielen. Das Beobachten eines Kerns ging nur per Antippen → `ctx.setKeyTargets` mit einem Ziel „Einen zufälligen Kern beobachten“ (Rahmen um die Schale); geprüft: Tab zur Bühne, Enter markiert, Enter wählt einen Kern („Wann zerfällt er?“). Eigener `hint` erklärt Antippen und Tastatur.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; ausführliche Canvas-Beschreibung DE/EN.
- **Farben:** aus `ctx.theme.series`; Mutter-/Tochterkerne zusätzlich über Helligkeit und die Zahlen unter der Gleichung unterscheidbar, α/β/γ über Form (Heliumkern, Punkt, Welle) ✓. Szene (Schale, Zählrohr, Zähler) mit festen Sachfarben, dunkel angepasst.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/radioaktiver-zerfall/index.ts` | Aufgabenmodus: „Momentan“ und „Aktivität“ als `spoiler`; T½, λ, A, Zeitraffer, „= … T½“ und 50-%-Satz bei `ctx.hidden` verdeckt |
| `src/simulations/physik/radioaktiver-zerfall/index.ts` | Zählrate am Zähler überlappt den Lautsprecher nicht mehr |
| `src/simulations/physik/radioaktiver-zerfall/index.ts` | Legende im log-Diagramm unten links |
| `src/simulations/physik/radioaktiver-zerfall/index.ts` | „Alle Kerne zerfallen“ bei N = 0 |
| `src/simulations/physik/radioaktiver-zerfall/index.ts` | `setKeyTargets` (zufälligen Kern beobachten) und eigener `hint` |
| `src/content/simulations/de/radioaktiver-zerfall.md` | Schwankung ½√N₀, Würfelbild, A3-Link `theo=0`, A4 präzisiert, neue A6, Tastatur, Aufgabenmodus |
| `src/content/simulations/en/radioaktiver-zerfall.md` | vollständig auf DE-Umfang übersetzt (6 Aufgaben, 7 Ausprobieren-Punkte, Unterrichtsideen) |
| `tests/radioaktiver-zerfall.test.ts` | 4 neue Tests (Aufgabenwerte, Sonderfälle, Streuung, Nukliddaten) |

## 6. Für den Kern (nicht selbst ändern)
- `setKeyTargets`: Bei nur einem Ziel sollte der Fokus es gleich auswählen. Jetzt markiert das erste Enter nur, erst das zweite löst aus (Tipp-Text erklärt das).
- Optionen einer Auswahl (`choice`) lassen sich im Aufgabenmodus nicht verdecken: Die Nuklid-Auswahl nennt die Halbwertszeit („Radon-220 (55,6 s)“). A4 nutzt das jetzt bewusst zum Vergleich.

## 7. Entscheidungen
- **„Momentan“ und „Aktivität und Zählrohr“ als `spoiler`:** Sie enthalten die Theoriewerte bzw. λ und A und damit direkt die Lösungen von A1 und A2. Normal bleiben sie sichtbar.
- **Zählerstände unter der Gleichung und Messpunkte bleiben im Aufgabenmodus:** Das ist die Messung zum Nachprüfen (wie die Kurven bei `freier-fall`); A1/A4/A6 sollen ja gerade mit dem Versuch verglichen werden.
- **T½ im Aufgabenmodus verdeckt, obwohl die Auswahl sie nennt:** Sonst zeigt die Diagrammzeile „t = 111 s = 2,00 T½“ die Lösung von A4 ohne Ablesen. Die Auswahl dient als Vergleichswert (A4 neu formuliert).
- **Theorie-50-%-Marke im Diagramm „nicht zerfallen“ bleibt bei A5:** Sie zeigt den Anteil frischer Kerne, nicht die bedingte Wahrscheinlichkeit, nach der A5 fragt; verdeckt wird nur der Satz „immer 50 % – egal, wie lange“.
- **Schwankung als ½√N₀ (Standardabweichung der Binomialverteilung bei p = ½), nicht als „√N“:** fachlich genauer für „N nach einer Halbwertszeit“; als vertiefende A6 und kurzer Absatz, Mittelstufe kann ihn überspringen. Test sichert 5 bzw. 25 ab.
- **C-14 bleibt bei 5730 a** (Schulbuch- und Tabellenwert; neuere Messung 5700 ± 30 a liegt innerhalb der Rundung).
- **Tastatur: ein Ziel „zufälligen Kern beobachten“ statt bis zu 2500 einzelner Kerne:** Pfeiltasten über Hunderte Kerne wären unbrauchbar; fachlich ist jeder Kern gleich.
- **Legende im log-Modus unten links:** Dort liegen bei abnehmendem N nie Messpunkte; über den T½-Marken bleibt genug Abstand.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2974/2974 grün (131 Dateien), Build ok (380 Seiten).
