# Auftrag: 9 nachgelieferte Bilder einbauen und testen

Briefing der Projektleitung (Stand 25.10.2026) für eine eigene Claude-Sitzung mit GitHub-Zugriff.

## Rahmen

- Repository `gori-creator/Simulations`. Lies zuerst `CLAUDE.md`, `docs/BILDER.md` (Einbindung über `images:` in `defineSimulation`, immer mit gezeichneter Ersatzgrafik) und `docs/agenten/QUALITAETSSICHERUNG.md`.
- **Vorbild für die Arbeitsweise:** PR #41 (84 Bilder in 46 Simulationen) und die Einbauhinweise in `docs/bilder-einbau/gruppe-1.md` bis `gruppe-4.md` – dort steht, wie die bisherigen Bilder zugeschnitten, eingefärbt, gekachelt und vermessen wurden.
- Eigener Zweig von `main`, Push nur dorthin, am Ende Pull Request nach `main`. **Nicht selbst mergen.**
- Nicht anfassen: `src/sim-core/`, Simulationen außer den unten genannten, Param-Keys und Presets.

## Die Bilder

Erzeugt nach `docs/agenten/PROMPT-BILDER-NACHLIEFERUNG.md` (dort auch, was beim ersten Versuch falsch war). Der Nutzer lädt sie mit diesen Dateinamen hoch, gedacht ist der Ordner `incoming/` auf dem Zweig `claude/sleepy-goodall-ddchwy`. **Suche auch auf `main`** (Ordner `incoming/` oder Hauptordner). Tragen sie keine sprechenden Namen (z. B. `exec-….png`), ordne sie per Sichtprüfung zu (Kontaktbogen mit Nummern erstellen, dann Bilder ansehen).

| Datei | Ziel | Einbaustelle und Hinweise |
| --- | --- | --- |
| `flaschenoeffner.png` | `src/assets/sims/hebelgesetz/` | Hebel im Alltag → Flaschenöffner (`drawOpener`). Auflage links auf dem Kronkorken, Zahn unter dem rechten Rand: Drehachse und Lastarm müssen zur Rechnung passen. |
| `eisberg.png` | `src/assets/sims/zahlengerade/` | Meeresspiegel (`drawSea`). Wasserlinie auf Höhe 0, Spitze erreicht den Pinguin (bis +10 m), Skala nicht verdecken. |
| `becherglas.png` | `src/assets/sims/teilchenmodell/` | Diffusion (`drawBeaker`). Glas muss in der Mitte durchsichtig sein, Teilchen bleiben sichtbar (auch unterste Reihe). |
| `urne.png` | `src/assets/sims/baumdiagramm/` | `drawUrn`. Innen durchsichtig, Kugeln sichtbar, auch im Dunkelmodus. |
| `leiter.png` | `src/assets/sims/sin-cos-tan-dreieck/` | Leiter anlehnen (`drawLadder`). Gedreht und auf Leiterlänge skaliert; Sprossenabstand passend (etwa 0,28 m). |
| `brett-asphalt.png` | `src/assets/sims/schiefe-ebene/` | Oberfläche der Ebene beim Materialpaar „Gummi auf Asphalt“ (`rubber`), gekachelt wie `brett-stahl`/`brett-eis` (siehe `gruppe-1.md`). |
| `fluchtstab.png` | `src/assets/sims/strahlensaetze/` | Baumhöhe, Stab bei Z (`drawBaum`). Farbbänder müssen erkennbar sein. |
| `lupe.png` | `src/assets/sims/massstab/` | Ersetzt die vorhandene `massstab/lupe.webp`, wenn sie klarer ist (Lupe im Feld „In Wirklichkeit“). Bei `dezimalbrueche` gibt es keine passende Stelle – dort nicht einbauen. |
| `sparbuch.png` | `src/assets/sims/prozentstreifen/` | Zinsen (`drawBook`). Zeilen der Simulation liegen auf der Seite. |

Genaue Code-Stellen und Formate: `docs/BILDER-WUNSCHLISTE.md` (Einträge A12, A14, B14, B35, B42, C2, C9, C10, C14).

## Arbeitsschritte

1. **Bilder prüfen:** passt Ansicht, Seitenverhältnis, Durchsichtigkeit (Glas, Lupe, Urne), kein Text, keine Logos? Unbrauchbares nicht einbauen, sondern mit Grund melden.
2. **Aufbereiten:** freistellen (echte Transparenz), auf den Gegenstand zuschneiden, als WebP (Qualität etwa 85, möglichst ≤ 300 KB) ablegen.
3. **Einbauen** an der Einbaustelle, gezeichnete Grafik bleibt als Ersatz. Farben sonst nur über `ctx.theme`.
4. **Aufräumen:** alte, unbrauchbare Fassungen dieser Bilder aus `docs/bilder-eingang/` löschen, Rohdateien aus `incoming/` bzw. dem Hauptordner entfernen. Jede Datei in `src/assets/sims/` muss in `docs/BILDER.md` stehen und in der Simulation deklariert sein (sonst schlagen Tests fehl).
5. **Dokumentieren:** Zeilen in die Übersicht von `docs/BILDER.md` (Format „| Simulation | Schlüssel | Datei | Größe | Hintergrund |“); in `docs/BILDER-WUNSCHLISTE.md` die Tabelle „Stand 22.10.2026“ aktualisieren; in `docs/AUFGABEN.md` den Punkt „9 Bilder neu erzeugen“ abhaken.
6. **Testen:**
   - `npm run verify` mit 0 Fehlern, 0 Warnungen, 0 Hinweisen, alle Tests grün.
   - Sichtprüfung jeder betroffenen Simulation vorher und nachher: `npx astro dev --port 4590 &`, Screenshots mit `node scripts/agenten/simshot.cjs` (Kopf der Datei lesen) bei 1360 px hell, 1360 px dunkel und 390 px. Achte auf Verzerrung, Größe, Lesbarkeit der Beschriftungen und den Dunkelmodus. Server danach stoppen.
   - Bei Hebel (Flaschenöffner) und schiefer Ebene: die betroffene Einstellung wirklich auswählen (Beispiel oder Auswahl), nicht nur die Startansicht prüfen.
7. **Abgabe:** PR nach `main` mit Liste „eingebaut / nicht eingebaut (Grund)“ und den wichtigsten Vorher-/Nachher-Bildern.
