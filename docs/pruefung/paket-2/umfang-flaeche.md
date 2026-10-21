# Prüfprotokoll: `umfang-flaeche` – Umfang und Flächeninhalt von Rechtecken

Prüfer: Paket 2 · Datum: 20.10.2026 · Stand: Commit `57184fa` (vor den Korrekturen) · Bogen: `scratchpad/pruefung/umfang-flaeche/umfang-flaeche.png` (außerhalb des Repos)

## Ergebnis
korrigiert (fachlich in Ordnung; Vergleichstext bei Primzahl-Flächeninhalt, Beschreibung der Zeichenfläche, englisches Lernmaterial)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. $a = 7$ cm, $b = 3$ cm: $A = 7 \cdot 3 = 21$ cm² (3 Reihen mit je 7 Einheitsquadraten), $U = 2 \cdot 7 + 2 \cdot 3 = 14 + 6 = 20$ cm; Anzeige „Einmal herum: 7 + 3 + 7 + 3 = 20“ ✓.
  2. Gleicher Umfang $U = 20$ cm: $a + b = 10$, Rechtecke $1 \times 9$ … $9 \times 1$ mit $A = 9, 16, 21, 24, 25, 24, 21, 16, 9$ cm²; größter Flächeninhalt beim Quadrat $5 \times 5 = 25$ cm², $9 \times 1$ nur $9$ cm² ✓ (Säulendiagramm, Tabelle, Stern beim Quadrat).
  3. Gleicher Flächeninhalt $A = 12$ cm²: $1 \times 12 \to U = 2 \cdot 13 = 26$ cm, $2 \times 6 \to 2 \cdot 8 = 16$ cm, $3 \times 4 \to 2 \cdot 7 = 14$ cm ✓; $A = 24$ cm²: kleinster Umfang $4 \times 6 \to 20$ cm, größter $1 \times 24 \to 50$ cm ✓.
  4. L-Form $8 \times 6$ ohne $3 \times 4$: waagerecht $8 \cdot 2 + 5 \cdot 4 = 16 + 20 = 36$ cm², senkrecht (Bildschirm) und ergänzt $48 - 12 = 36$ cm²; Seiten $8 + 2 + 3 + 4 + 5 + 6 = 28$ cm $= 2 \cdot (8 + 6)$ ✓. L-Form $10 \times 6$ ohne $3 \times 4$ senkrecht: $7 \cdot 6 + 3 \cdot 2 = 42 + 6 = 48$ cm² $= 60 - 12$ ✓.
- **Einheitsquadrate zählen:** „Auslegen und zählen“ legt die erste Reihe Stück für Stück und kopiert sie nach oben (7 × 4 → 28 Quadrate geprüft); `unitCells` liefert genau $a \cdot b$ bzw. bei der L-Form $ab - cd$ Quadrate (Test).
- **Sonderfälle:** $a = b = 1$ (kleinstes Quadrat, $U = 4$ cm, $A = 1$ cm²); L-Form bei $a$ oder $b < 2$ → Hinweis „mindestens 2 cm“, gezeigt wird das Rechteck; Ausschnitt wird auf 1 cm Rand begrenzt; $U$ nur gerade (Schritt 2, URL-Werte werden aufs Raster gerundet), daher immer mindestens ein Rechteck; $A = 1$ und Primzahlen (nur ein Rechteck, s. Korrekturen). Keine Division durch 0.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** cm und cm² überall sauber getrennt (Formeln, Karten, Tabelle, Achsen, Legende „= 1 cm²“); nur ganze Zahlen; Minus in der L-Form als „−“ ✓.
- **Begriffe wie im Unterricht:** Länge $a$, Breite $b$, Flächeninhalt $A$, Umfang $U$ (EN $P$), Einheitsquadrat, Zerlegen/Ergänzen ✓.
- **Neue/ergänzte Tests:** `tests/umfang-flaeche.test.ts`, Block „Prüfwerte und Aufgaben“: 7 × 3, $U = 20$ (Tabelle, Quadrat 5 × 5, 9 × 1), $A = 12$/$24$/$1$, Aufgaben 1, 2, 4, 5 (Zerlegung, Seiten, Einheitsquadrate).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** 1 ($24$ cm², $22$ cm), 2a ($a = 5$ cm, $25$ cm²), 2b ($b = 3$ cm, $U = 18$ cm), 3 (Gegenbeispiel 10 × 1 vs. 4 × 4), 4 (Quadrat 6 m × 6 m, $36$ m²; $35$, $11$ m²), 5 (s. o.) – alle Lösungen stimmen. Tabelle $U = 16$ cm stimmt.
- **„Beispiel laden“ geklickt:** alle Links des DE-Materials (Ausprobieren 2–8, Aufgaben laden/zeigen) und die Beispiele per `simshot` geladen; `show=0` blendet Ergebnisse aus, `_hide=1` verdeckt die Ergebnisliste ✓. „Alle Rechtecke durchgehen“ und „Ameise laufen lassen“ angesehen.
- **Texte vereinfacht/korrigiert:**
  - EN war deutlich kürzer (6 statt 8 Versuche, 4 statt 5 Aufgaben – Aufgabe 2b und „Stimmt das?“ fehlten, Unterrichtsideen gekürzt). An DE angeglichen; Hinweis ergänzt, dass der Umfang im Deutschen $U$ heißt.
  - DE unverändert.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle Ansichten vollständig, Karten auf dem Tablet vorhanden, auf dem Handy unter dem Rechenpapier; Beamer gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** keine gefunden (auch Handy 360 px mit L-Form 10 × 6 und gleichem Umfang).
- **Touch (Ziehen) und Maus:** Ecke mit Finger (CDP-Touch) und Maus von 5 × 3 auf 7 × 4 gezogen → rastet auf ganze cm ein, Seite scrollt nicht mit ✓.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Auslegen, Ameise, Durchgehen springen sofort ans Ende)
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Reihenfolge laut JSON sinnvoll; alle Funktionen auch über Regler/Schalter erreichbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen. Die Zeichenfläche hatte eine feste Beschreibung („… Rechteck …“ auch bei L-Form und Vergleich) → jetzt dynamisch mit Figur, Maßen und – sobald im Bild sichtbar – Flächeninhalt und Umfang.
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** Reihen über `ctx.theme.series`; Papier-, Karten- und Gitterfarben fest pro hell/dunkel (wie bei anderen Simulationen). Bestes Rechteck zusätzlich mit ★ und Text markiert.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/umfang-flaeche/index.ts` | Vergleich bei gleichem Flächeninhalt: bei $A = 1$ oder Primzahl (nur ein Rechteck) statt „1 × 13 bzw. 13 × 1 hat den kleinsten Umfang (28 cm), der Streifen 1 × 13 den größten (28 cm)“ jetzt „Bei A = 13 cm² gibt es nur ein Rechteck … 13 ist eine Primzahl.“ (DE/EN) |
| `src/simulations/mathematik/umfang-flaeche/index.ts` | Beschreibung der Zeichenfläche (`aria-label`) je nach Thema und Figur, Ergebnisse erst, wenn sie im Bild stehen |
| `src/content/simulations/en/umfang-flaeche.md` | an DE angeglichen (8 Versuche, 5 Aufgaben mit Lösungen und Links, Unterrichtsideen, Stolpersteine, Ausblick) |
| `tests/umfang-flaeche.test.ts` | Prüfwerte und Aufgaben (5 neue Tests) |

## 6. Für den Kern (nicht selbst ändern)
- Keine.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Ausprobieren 1 fragt „Welcher Wert wächst schneller …?“ – das vergleicht Maßzahlen von cm und cm², was der Stolperstein „Umfang und Flächeninhalt kann man vergleichen“ gerade vermeiden will. Vorschlag: „Welche Maßzahl wächst schneller …?“ oder Frage streichen. Nicht geändert.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2876/2876 grün (davon `umfang-flaeche` 23), Build ok.
