# Prüfprotokoll: `reihe-parallel` – Reihen- und Parallelschaltung

Prüfer: Paket 1 (Vertretung) · Datum: 20.10.2026 · Stand: Commit `d53ea8c` · Bogen: `scratchpad/boegen/reihe-parallel.png` (außerhalb des Repos)

## Ergebnis
korrigiert (iPad quer jetzt im breiten Aufbau statt gestaucht, Beobachtungstext im Aufgabenmodus verdeckt, Beschriftungen in der gemischten Schaltung und bei herausgedrehter Lampe auf dem Handy entzerrt, Hinweis „mehrere Lampen durchgebrannt“, geschütztes Leerzeichen vor Einheiten, Lernmaterial EN auf DE-Umfang ergänzt, Tests ergänzt)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Gemischt, drei Lampen je 12 Ω an 6 V: R₂ ∥ R₃ = 12 · 12 / 24 = 6 Ω, R = 12 Ω + 6 Ω = 18 Ω, I = 6 V / 18 Ω = 0,333 A → „A₁ an Stelle 2: 0,33 A“ ✓; U₁ = 12 Ω · ⅓ A = 4 V, U₂ = U₃ = 6 Ω · ⅓ A = 2 V → „4,00 V“, „2,00 V“ ✓; Zweig I₂ = 2 V / 12 Ω = 0,167 A → „0,17 A“ ✓ (Knotenregel 0,17 + 0,17 ≈ 0,33). Lampe 3 heraus: Lampe 1 und 2 in Reihe, R = 24 Ω, I = 0,25 A, je 3 V ✓ (Anzeige „R = U/I = 24 Ω“).
  2. Drei Widerstände 20/30/60 Ω in Reihe an 6 V: R = 110 Ω, I = 6 V / 110 Ω = 0,0545 A → „0,055 A“ ✓; U₁ = 20 Ω · 0,0545 A = 1,09 V, U₃ = 60 Ω · 0,0545 A = 3,27 V ✓; Spannungsteiler U₃/U₁ = 3 = R₃/R₁ ✓.
  3. 20 Ω ∥ 30 Ω an 6 V: I₁ = 0,3 A, I₂ = 0,2 A, I = 0,5 A, 1/R = 1/20 + 1/30 = 5/60 → R = 12 Ω ✓; Stromteiler I₁/I₂ = 1,5 = R₂/R₁ ✓. Antippen der Messstelle 3 → „A₂ an Stelle 3: 0,50 A“ (zwei Lampen parallel, Zweig 2) ✓.
  4. Gemischt R₁ = 200 Ω, R₂ = R₃ = 5 Ω: R = 200 + 2,5 = 202,5 Ω ✓, I = 29,6 mA, Zweig 14,8 mA → „0,015 A“ ✓, U₂ = 0,074 V → „0,07 V“ ✓.
  5. Zwei 6-V-Lampen an 12 V: in Reihe je 6 V, P = 6 V · 0,5 A = 3 W = Nennleistung ✓; parallel je 12 V > 9 V → beide durchgebrannt, A₁ = 0 A, V an der Fassung 12 V ✓.
- **Sonderfälle:** Lampe heraus in Reihe → alles aus, an der Lücke volle Spannung ✓; parallel → übrige Zweige unverändert (gleiche Leistung), Hauptstrom kleiner ✓; alle Zweige offen → I = 0, R = ∞, Anzeige „Stromkreis unterbrochen – kein Strom“ ✓; gemischt Lampe 1 heraus → alles aus; Lampe 2 und 3 heraus → Kreis offen, 6 V an den Fassungen ✓. R = 0 bzw. Kurzschluss eines Zweigs ist nicht einstellbar (R ≥ 5 Ω, U ≥ 1 V), keine Division durch 0. Gleiche Widerstände: n · R in Reihe, R/n parallel ✓.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** U mit 2 Nachkommastellen, I mit 2 bzw. unter 0,1 A mit 3; Dezimalkomma über `fmt`; keine negativen Werte. Zwischen Zahl und Einheit jetzt geschütztes Leerzeichen (Texte, Anzeigen am Messgerät, Ersatzwiderstand).
- **Begriffe wie im Unterricht:** Reihen-/Parallelschaltung, Zweig, Verzweigungspunkt (Knoten), Hauptleitung, Knotenregel, Ersatzwiderstand, Strommesser in Reihe, Spannungsmesser parallel, Nennspannung ✓. Lampenmodell (fester Widerstand 12 Ω, Helligkeit über Leistung/Wendeltemperatur) ist im Lernmaterial als Modell gekennzeichnet.
- **Neue/ergänzte Tests:** 2 neue Tests in `tests/reihe-parallel.test.ts` (alle Aufgaben A1–A5; Spannungs- und Stromteiler, gleiche Widerstände, gemischte Schaltung 200/5/5 Ω, herausgedrehte Lampen in allen Schaltungen, alle Zweige offen, Durchbrenngrenze); jetzt 9 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 24 Ω, 0,25 A, je 3 V ✓; A2 je 0,5 A, 1,5 A, 4 Ω ✓; A3 0,3 A, 0,2 A, 0,5 A, 12 Ω ✓; A4 4 V / 2 V / 2 V, ohne Lampe 3 je 3 V ✓; A5 Reihe ✓; A6 Begründung ✓. Alle Links (Aufgabe laden, Nachmessen, Zeigen) mit simshot geladen, Werte stimmen.
- **„Beispiel laden“ geklickt:** alle sechs (zwei in Reihe, zwei parallel, drei in Reihe, gemischt, Widerstände parallel, 12 V) – passen.
- **Aufgabenmodus:** Der Ergebnistext „Beobachtung“ beantwortete A4 sofort („Durch Lampe 1 fließt der ganze Strom … Lampe 1 leuchtet am hellsten“) → jetzt `spoiler` (Ersatzwiderstand und Tabelle waren schon verdeckt).
- **Texte vereinfacht/korrigiert:** Bei zwei durchgebrannten Lampen hieß es „Eine Lampe ist durchgebrannt“ → eigener Text „Mehrere Lampen sind durchgebrannt …“ (DE/EN). DE-Stolperstein „Strom wird verbraucht“ um die Richtigstellung ergänzt. EN war stark gekürzt (2 statt 6 Aufgaben, 4 statt 7 Ausprobieren-Punkte, ohne gemischte Schaltung) → auf DE-Umfang ergänzt.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** in Ordnung. iPad quer (Bühne ≈ 620 × 390 px) nutzte den Handy-Aufbau, Schaltung klein, in der gemischten Schaltung lagen V₂-Anzeige und Lampe 3 übereinander → Layout jetzt nach Breite und Höhe (`w < 640 && w < 1,3·h`).
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein waagerechter Überlauf. Gemischt (breit): Anzeige von V₂ stieß an Lampe 3 → steht jetzt unter dem Messgerät. Handy, drei Lampen parallel mit herausgedrehter Lampe 2: Schild „herausgedreht“ lag unter der Anzeige von V₁ → tiefer gesetzt.
- **Touch (Ziehen) und Maus:** Lampe mit der Maus angetippt → herausgedreht (Parameter `x1` gesetzt, Hauptstrom 0,50 A); Messstelle 3 angetippt → A₂ eingesetzt ✓. Ziehen wird nicht angeboten.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut JSON in Ordnung; alles im Bild Antippbare (Lampen, Messstellen) auch über Schalter/Auswahl in den Einstellungen erreichbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Canvas-Beschreibung vorhanden; Messwerte und Tabelle als Text in den Ergebnissen.
- **Farben:** aus `ctx.theme`; Strommesser (orange, „A“) und Spannungsmesser (violett, „V“) zusätzlich über Buchstaben unterscheidbar; „durchgebrannt“/„herausgedreht“ als Text. Farbringe der Widerstände sind Normfarben.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/reihe-parallel/index.ts` | `narrow()` nach Breite und Höhe (iPad quer breiter Aufbau) |
| `src/simulations/physik/reihe-parallel/index.ts` | Ergebnis „Beobachtung“ als `spoiler` |
| `src/simulations/physik/reihe-parallel/index.ts` | geschütztes Leerzeichen zwischen Zahl und Einheit (`tr`, Messgeräte-Anzeigen, Ersatzwiderstand) |
| `src/simulations/physik/reihe-parallel/index.ts` | gemischt: V-Anzeige unter dem Messgerät; Handy: Schild „herausgedreht“ tiefer |
| `src/simulations/physik/reihe-parallel/index.ts` | neuer Text `burntNote2` für mehrere durchgebrannte Lampen |
| `src/content/simulations/de/reihe-parallel.md` | Stolperstein ergänzt |
| `src/content/simulations/en/reihe-parallel.md` | auf DE-Umfang ergänzt (Einführung mit gemischter Schaltung, 7 Ausprobieren-Punkte, 6 Aufgaben, Unterrichtsideen) |
| `tests/reihe-parallel.test.ts` | 2 neue Tests mit den nachgerechneten Werten und Sonderfällen |

## 6. Für den Kern (nicht selbst ändern)
- Geschütztes Leerzeichen zwischen Zahl und Einheit wieder lokal in `tr` gelöst; ein zentraler Helfer bleibt sinnvoll.
- Im Aufgabenmodus kann die Simulation nicht erfahren, ob `_hide` aktiv ist; sonst ließe sich nur der erklärende Teil der Beobachtung verbergen statt des ganzen Textes.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Kurzschluss eines Zweigs bzw. R = 0 lässt sich nicht einstellen (R ≥ 5 Ω, nur „herausdrehen“). Für Jgst. 8–9 wäre „Lampe überbrücken“ (Kurzschluss in der Reihenschaltung: andere Lampe heller) ein häufiger Versuch. Als Erweiterung aufnehmen?
- Bei 2 V (gemischte Schaltung, Lampen 2 und 3) glühen die Lampen nur sehr schwach (Modell P ~ T⁴, sichtbar ab ≈ 800 K). Fachlich plausibel, so belassen?

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2899/2899 grün (125 Dateien), Build ok.
