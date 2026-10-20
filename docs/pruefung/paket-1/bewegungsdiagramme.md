# Prüfprotokoll: `bewegungsdiagramme` – Gleichförmige und beschleunigte Bewegung (t-s- und t-v-Diagramme)

Prüfer: Paket 1 (Vertretung) · Datum: 20.10.2026 · Stand: Commit `b8001b3` · Bogen: `scratchpad/boegen/bewegungsdiagramme.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Bewegungsgesetz ohne „+ −“, Hinweis auf den Stillstand beim Bremsen, km/h mit Vorzeichen, kein Zeilenumbruch zwischen Zahl und Einheit, Lernmaterial EN auf DE-Umfang ergänzt, Tests ergänzt; eine Rückfrage zu Aufgabe 2)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Beispiel „Bremsen bis zum Stillstand“ (v₀ = 20 m/s, a = −4 m/s², T = 8 s): t_B = 20/4 s = 5 s; s_B = 20²/(2 · 4) m = 400/8 m = 50 m; Durchschnittsgeschwindigkeit 50 m / 8 s = 6,25 m/s → Anzeige „Bremszeit … = 5 s · Bremsweg … = 50 m“, „Δs = 50 m in 8 s“, „v̄ = 6,25 m/s“ ✓; t-v-Graph endet bei 5 s auf 0 und bleibt dort, t-a-Graph springt bei 5 s von −4 auf 0 ✓. Bei t = 3,22 s: v = 20 − 4 · 3,22 = 7,12 m/s → „7,1 m/s“ ✓, 7,12 · 3,6 = 25,6 km/h → „26 km/h“ ✓; s = 20 · 3,22 − 2 · 3,22² = 64,4 − 20,74 = 43,66 m → „43,6 m“ ✓.
  2. Beispiel „Anfahren mit 2 m/s²“ bei t = 6,13 s (Bild): v = 2 · 6,13 = 12,27 m/s → Steigungsdreieck der Tangente „v = Δs/Δt = 24,53 m / 2 s = 12,27 m/s“ ✓ (Δs = v · Δt = 12,27 · 2 = 24,53 m); ganze Fahrt s = ½ · 2 · 10² = 100 m, v̄ = 10 m/s ✓; Abstände im Stroboskop 1 : 3 : 5 : 7 (1, 3, 5, 7 m) ✓.
  3. Beispiel „Anfahren – Fahren – Bremsen“: a₁ = 15/5 = 3 m/s², a₂ = 0, a₃ = −15/5 = −3 m/s²; Δs = ½ · 15 · 5 + 15 · 10 + ½ · 15 · 5 = 37,5 + 150 + 37,5 = 225 m; v̄ = 225/20 = 11,25 m/s → Tabelle und „Ganze Fahrt“ ✓. „Hin und zurück“: 16 + 16 − 16 − 16 = 0 m Ortsänderung, Weg 64 m, Anzeige „Δs = 0 m … zurückgelegter Weg 64 m (Richtungswechsel!)“ ✓.
  4. Einheiten: 10 m/s · 3,6 = 36 km/h, 12,5 m/s → 45 km/h, 20 m/s → 72 km/h ✓.
- **Sonderfälle:** v = 0 (Auto steht, kein Dreieck, keine Bremsangabe) ✓; a = 0 im Modus „beschleunigt“ = gleichförmig ✓; Bremsen ohne Stillstand innerhalb T (20 m/s, −2 m/s², 5 s → v = 10 m/s, ein Abschnitt) ✓; Stillstand genau bei T ✓; Reglergrenzen v₀ = 40 m/s, a = −8 m/s² → 5 s, 100 m, v wird nie negativ ✓; rückwärts (v₀ < 0) bremst ein positives a ebenso bis zum Stillstand ✓; aus dem Stand mit a < 0 fährt das Auto rückwärts los (so im Hilfetext und Modell gewollt) ✓. Keine Division durch 0 (T ≥ 1 s, Abschnittsdauern ≥ 0,5 s, Bremszeit nur bei a ≠ 0).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** über `fmt` ✓. Korrigiert:
  - Bewegungsgesetz zeigte bei negativen Werten „50 m + −5 m/s · t“ bzw. „20 m/s · t + −2 m/s² · t²“ → jetzt „50 m − 5 m/s · t“, „− 2 m/s² · t²“, „20 m/s − 4 m/s² · t“.
  - Beim Bremsen bis zum Stillstand gilt v(t) = v₀ + a · t nur bis t_B; das Bewegungsgesetz nennt jetzt „Das gilt bis zum Stillstand bei t = 5 s, danach v = 0 und a = 0.“
  - km/h wurde als Betrag angezeigt („v = −5 m/s (18 km/h)“, las sich wie eine falsche Umrechnung) → jetzt mit Vorzeichen „(−18 km/h)“, in Ergebnis und Bild.
  - Zwischen Zahl und Einheit brach die Zeile auf dem Handy um („(13 / km/h)“, „+ 20 / m/s“) → geschütztes Leerzeichen in `tr` und `unit`.
- **Begriffe wie im Unterricht:** Ort s, Ortsänderung Δs (mit Vorzeichen) und zurückgelegter Weg werden sauber getrennt; Geschwindigkeit, Beschleunigung, Steigungsdreieck, Tangente, Durchschnittsgeschwindigkeit ✓. Hinweis auf „x“ und „Zeit-Ort-Diagramm“ im Lernmaterial ✓. EN-Bildbeschreibung „distance–time“ → „position–time“ (es wird der Ort aufgetragen).
- **Neue/ergänzte Tests:** 3 neue Tests in `tests/bewegungsdiagramme.test.ts` (Lösungen aller sechs Aufgaben, Steigung im t-s-Diagramm = v und Fläche unter dem t-v-Graphen = Δs, Sonderfälle und Reglergrenzen); jetzt 9 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 54 : 3,6 = 15 m/s, 15 · 8 = 120 m ✓. A2 s₀ = −50 m, (100 − (−50)) m / 12 s = 12,5 m/s, s = 0 bei 50/12,5 = 4 s ✓. A3 2,5 · 6 = 15 m/s, ½ · 2,5 · 36 = 45 m, 27,8/2,5 = 11,1 s ✓. A4 400/10 = 40 m nach 4 s, 1600/10 = 160 m nach 8 s (Link mit T = 10 s zeigt den Stillstand) ✓. A5 3/0/−3 m/s², 225 m, 11,25 m/s ✓. A6 Δs = 0, Weg 64 m, a(8 s) = −2 m/s² ✓. Keine Abweichungen.
- **„Beispiel laden“ geklickt:** alle sechs (Gleichförmig, Rückwärts, Anfahren, Bremsen, Anfahren – Fahren – Bremsen, Hin und zurück) mit „Losfahren“ abgespielt – passen; ebenso Aufgabenlinks A2, A6 und der Link „Vorhersage“ (`pre=0`).
- **Texte vereinfacht/korrigiert:** DE in Ordnung. EN war stark gekürzt (Einführung ohne Formelblöcke, 4 statt 6 Ausprobieren-Punkte, 3 statt 6 Aufgaben, knappe Unterrichtsideen) → auf DE-Umfang ergänzt; Beschreibung „distance–time“ → „position–time“.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle in Ordnung; auf dem Handy werden die Pillen gekürzt („Δs = …“, kurze Steigungsformel), Tacho ohne km/h.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein waagerechter Überlauf. Kleinigkeit: bei „Hin und zurück“ am Ende liegt die Beschriftung „Δv = 5 m/s“ am rechten Rand dicht am Graphen, bleibt aber lesbar. Im Canvas keine tiefgestellten Indizes (Indizes nur in HTML-Ergebnissen und Reglerbeschriftungen).
- **Touch (Ziehen) und Maus:** mit der Maus geprüft: Zeitmarke im t-s-Diagramm ziehen spult die Zeit (t = 0 → 3,12 s) ✓; Punkt v₀ im t-v-Diagramm ziehen (20 → 13,5 m/s), Bremszeit und Diagramme passen sich an, nach dem Loslassen werden die Achsen eingepasst ✓.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (laut JSON)
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut JSON in Ordnung; alle ziehbaren Größen auch über Regler einstellbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Canvas-Beschreibung DE/EN vorhanden; Momentanwerte, Bewegungsgesetz, ganze Fahrt, Bremsen und Abschnittstabelle stehen als Text in den Ergebnissen.
- **Farben:** Graphen und Hinweise aus `ctx.theme` (`series[0]`, `[3]`, `[4]`); s blau, v orange, a violett, jeweils zusätzlich durch die Achsenbeschriftung unterschieden. Feste Farben nur in der gezeichneten Szene (Himmel, Straße, Maßband, Ersatz-Auto).

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/bewegungsdiagramme/index.ts` | Bewegungsgesetz mit Rechenzeichen statt „+ −“ (`plus`); Hinweis „gilt bis zum Stillstand bei t = …“ beim Bremsen (DE/EN) |
| `src/simulations/physik/bewegungsdiagramme/index.ts` | km/h mit Vorzeichen in Ergebnis „Momentan“ und Tacho im Bild |
| `src/simulations/physik/bewegungsdiagramme/index.ts` | geschütztes Leerzeichen zwischen Zahl und Einheit in `tr` und `unit` |
| `src/simulations/physik/bewegungsdiagramme/index.ts` | EN-Bildbeschreibung „position–time“ |
| `src/content/simulations/en/bewegungsdiagramme.md` | auf DE-Umfang ergänzt (Einführung, 6 Ausprobieren-Punkte, 6 Aufgaben, Unterrichtsideen) |
| `tests/bewegungsdiagramme.test.ts` | 3 neue Tests (Aufgaben, Steigung/Fläche, Sonderfälle und Reglergrenzen) |

## 6. Für den Kern (nicht selbst ändern)
- Geschütztes Leerzeichen zwischen Zahl und Einheit wäre allgemein sinnvoll (z. B. in `fmt` oder in der Ergebnis-Ausgabe des Hosts); hier wie in `teilchenmodell` lokal in `tr` gelöst.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Aufgabe 2 („lies im t-s-Diagramm ab: Startort, Geschwindigkeit …“) wird im Aufgabenmodus (`_hide=1`) vom Ergebnis „Bewegungsgesetz“ („s(t) = −50 m + 12,5 m/s · t“) und von den Pillen im Bild („s = −50 m“, „v = 12,5 m/s“) sofort beantwortet. „Bewegungsgesetz“ als `spoiler` markieren und die Pillen im Aufgabenmodus ausblenden? Oder die Aufgabe als Ablese-Übung mit Kontrolle so lassen?
- Aus dem Stand mit a < 0 fährt das Auto rückwärts an (gewollt, steht im Hilfetext). Für Jgst. 7–8 evtl. ungewohnt – in Ordnung so?

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2895/2895 grün (125 Dateien), Build ok.
