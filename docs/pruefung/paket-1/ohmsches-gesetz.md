# Prüfprotokoll: `ohmsches-gesetz` – Ohmsches Gesetz

Prüfer: Paket 1 (Vertretung) · Datum: 20.10.2026 · Stand: Commit `dd1914b` · Bogen: `scratchpad/boegen/ohmsches-gesetz.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Messreihen gingen beim Verstellen der Regler verloren, iPad quer jetzt nebeneinander statt gestaucht untereinander, Messtabelle und Hinweis zur Strombegrenzung im Aufgabenmodus verdeckt, Beschriftungen am Draht und Skalen 1 V/100 mA entzerrt, geschütztes Leerzeichen vor Einheiten, Lernmaterial EN auf DE-Umfang ergänzt, Tests ergänzt)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Festwiderstand 47 Ω, 6 V: I = 6 V / 47 Ω = 0,1277 A → „0,128 A“, Zeiger im Bereich 300 mA ✓; R = 6,00 V / 0,128 A ≈ 47 Ω ✓. Automatische Messreihe 0, 2, …, 12 V: 12 V / 47 Ω = 0,255 A ✓, Ausgleichsgerade „R ≈ 47 Ω (aus 7 Messpunkten)“ ✓. Farbringe gelb-violett-schwarz-gold-braun = 470 · 0,1 Ω = 47 Ω, 1 % ✓.
  2. Konstantandraht l = 1 m, A = 0,1 mm², 12 V: R = 0,49 Ω·mm²/m · 1 m / 0,1 mm² = 4,9 Ω; I wäre 12 V / 4,9 Ω = 2,45 A > 2 A → Strombegrenzung, U = 4,9 Ω · 2 A = 9,8 V ✓ (Anzeige „U = 9,80 V · I = 2,00 A“, Display „I-Begrenzung“, rote Leuchte). l = 2 m, A = 0,2 mm²: R = 0,49 · 2 / 0,2 = 4,9 Ω, bei 4 V I = 0,816 A ✓; Durchmesser d = √(4 · 0,2 mm² / π) = 0,50 mm ✓.
  3. Glühlampe 12 V / 0,25 A: R(12 V) = 12 V / 0,25 A = 48 Ω ✓; kalte Wendel R = 48 Ω / (2700 K / 293 K)^1,2 = 48 / 14,4 = 3,34 Ω → „3,3 Ω“ ✓ (Verhältnis heiß/kalt ≈ 14, typisch für Wolfram); bei 2 V I = 0,110 A → R = 18,2 Ω ✓; Wendel bei 12 V 2700 K = 2427 °C → „≈ 2430 °C“ ✓. Kennlinie monoton steigend, flacher werdend ✓.
  4. Unbekannter Widerstand B bei 8 V: I = 8 V / 82 Ω = 0,0976 A → „0,098 A“ ✓. Drehknopf mit der Maus gezogen: 8,3 V → I = 8,3 / 47 = 0,177 A ✓.
- **Sonderfälle:** U = 0 → I = 0, „U = 0 V · I = 0 A“, R-Anzeige ausgeblendet, kein Division durch 0 (R = Bauteilwert bzw. R_kalt) ✓; negative Spannung nicht einstellbar (Netzgerät 0 … 12 V, Modell begrenzt auf 0), Polung also nicht umkehrbar – für Widerstand/Draht/Lampe fachlich ohne Bedeutung ✓; kleinster Draht 0,1 m / 0,5 mm² → R = 0,098 Ω, Begrenzung schon bei 0,196 V ✓; größter Strom ohne Begrenzung 12 V / 10 Ω = 1,2 A, Bereich 3 A ✓; Messbereiche wählen sich mit Hysterese selbst, „Messbereich überschritten“ nur kurz beim Umschalten (Punkt am Gerät) ✓.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** U mit 2, I mit 3 (unter 1 A) bzw. 2 Nachkommastellen, kleine Ströme auf der Skala in mA; Dezimalkomma über `fmt`, auch im LCD des Netzgeräts ✓. Zwischen Zahl und Einheit jetzt geschütztes Leerzeichen.
- **Begriffe wie im Unterricht:** Amperemeter in Reihe, Voltmeter parallel (Schaltplan und Aufbau stimmen überein), Stromstärke, Spannung, Widerstand, Kennlinie, Ursprungsgerade, spezifischer Widerstand, Ausgleichsgerade ✓. „R = U/I ist die Definition, das ohmsche Gesetz sagt R = konstant“ korrekt getrennt ✓. ρ(Konstantan) = 0,49 Ω·mm²/m ✓.
- **Neue/ergänzte Tests:** 2 neue Tests in `tests/ohmsches-gesetz.test.ts` (alle 6 Aufgaben des Lernmaterials; Sonderfälle U = 0, negative Spannung, kleinster Draht, 1,2 A an 10 Ω, Messbereiche); jetzt 10 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 8 V / 0,098 A ≈ 82 Ω ✓; A2 6 V / 100 Ω = 60 mA ✓; A3 47 Ω · 0,2 A = 9,4 V ✓; A4 18 Ω und 48 Ω ✓; A5 4,9 Ω ✓; A6 2,4 A > 2 A → 9,8 V ✓. Alle Links mit simshot geladen, Werte stimmen.
- **„Beispiel laden“ geklickt:** alle sechs (47 Ω, 150 Ω, Glühlampe, Konstantandraht, unbekannter Widerstand, U-I-Diagramm) – passen; Messreihe automatisch für Widerstand (I-U und U-I) und Glühlampe angesehen.
- **Aufgabenmodus:** Die Messtabelle zeigte mit der Spalte „U / I in Ω“ die Lösung von A1 und A4 sofort → jetzt `spoiler` (U und I bleiben über „Messgeräte zeigen“ und die Zeiger sichtbar). A6 hatte keinen Aufgabenmodus, der Hinweis „Strombegrenzung aktiv …“ nahm die Erklärung vorweg → Link mit `_hide=1`, Hinweis als `spoiler`.
- **Texte vereinfacht/korrigiert:** DE: Voltmeter „vergleicht die beiden Anschlüsse“ → „misst die Spannung zwischen seinen beiden Anschlüssen“. EN war stark gekürzt (2 statt 6 Aufgaben, 4 statt 5 Ausprobieren-Punkte, knappe Einführung und Unterrichtsideen) → auf DE-Umfang ergänzt.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** in Ordnung. iPad quer (Bühne ≈ 620 × 390 px) nutzte das Handy-Layout untereinander, Aufbau winzig → Layout jetzt nach Breite und Höhe (`w < 640 && w < 1,3·h`), Aufbau und Diagramm nebeneinander.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein waagerechter Überlauf. Bei kurzem Draht lagen „l = …“ und „A = … mm²“ auf Klemme und Kabeln → bei kurzem Draht rechts an der Leiste. Skalen 1 V („0,2 0,4 0,6 0,8“) und 100 mA („20 40 60 80 100“) drängten sich im runden Zifferblatt → Hauptstriche bei 0, Mitte, Ende mit 10 Teilstrichen.
- **Touch (Ziehen) und Maus:** Drehknopf mit der Maus gezogen (6 → 8,3 V), Zeiger schwingen gedämpft ein ✓.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Zeiger springen, Achsen ohne Nachführung, Hinweispfeil ohne Pulsieren)
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut JSON in Ordnung; Drehknopf auch über den Regler „Spannung am Netzgerät“.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Canvas-Beschreibung vorhanden; Messwerte und Tabelle als Text in den Ergebnissen.
- **Farben:** Diagramm und Messreihen aus `ctx.theme`, Messreihen zusätzlich mit Legende beschriftet; Kabel, Geräte und Farbringe haben feste Material-/Normfarben. Strombegrenzung nicht nur über die rote Leuchte, sondern auch Text „I-Begrenzung“ und Ergebnis.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/ohmsches-gesetz/index.ts` | `updateReadouts` legte bei jedem Reglerwert eine neue Messreihe an; ab der siebten wurde die älteste mit ihren Messwerten verworfen (z. B. R von 47 auf 56 Ω schieben löschte die 47-Ω-Messung) → nur noch nachsehen |
| `src/simulations/physik/ohmsches-gesetz/index.ts` | `narrow()` nach Breite und Höhe (iPad quer nebeneinander) |
| `src/simulations/physik/ohmsches-gesetz/index.ts` | Ergebnisse „Messtabelle“ und „Netzgerät“ als `spoiler` |
| `src/simulations/physik/ohmsches-gesetz/index.ts` | `tr` und Widerstands-Bruch: geschütztes Leerzeichen zwischen Zahl und Einheit |
| `src/simulations/physik/ohmsches-gesetz/index.ts` | Draht: Beschriftungen bei kurzem Draht rechts; Skalen 1 V und 100 mA mit Hauptstrichen bei 0/Mitte/Ende |
| `src/content/simulations/de/ohmsches-gesetz.md` | Voltmeter-Satz; A6-Link mit `_hide=1` |
| `src/content/simulations/en/ohmsches-gesetz.md` | auf DE-Umfang ergänzt (Einführung, 5 Ausprobieren-Punkte, 6 Aufgaben, Unterrichtsideen) |
| `tests/ohmsches-gesetz.test.ts` | 2 neue Tests mit den nachgerechneten Werten und Sonderfällen |

## 6. Für den Kern (nicht selbst ändern)
- Geschütztes Leerzeichen zwischen Zahl und Einheit wieder lokal in `tr` gelöst (wie `teilchenmodell`); ein zentraler Helfer bleibt sinnvoll.
- Der Hinweis unter der Bühne „Die markierten Punkte lassen sich mit Maus oder Finger ziehen“ (`dragHint`) passt hier nur halb: Ziehbar ist der Drehknopf, nicht ein Punkt. Ein eigener Hinweistext pro Simulation wäre hilfreich.
- Im Aufgabenmodus kann eine Simulation nicht erfahren, ob `_hide` aktiv ist; sonst ließe sich nur die Spalte „U / I“ verbergen statt der ganzen Messtabelle.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Die Messgeräte wählen den Messbereich automatisch; „Messbereich überschritten“ und falsche Polung (Zeiger schlägt nach links aus) lassen sich daher nicht vorführen. Im Lernmaterial steht der Hinweis zum Einstellen von Hand. So belassen?
- Glühlampenmodell (Strahlung + Wärmeleitung, R ~ T^1,2, R_kalt ≈ 3,3 Ω) ist plausibel und als Modell gekennzeichnet. So belassen?

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2897/2897 grün (125 Dateien), Build ok.
