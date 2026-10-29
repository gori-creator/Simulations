# Auftrag an Codex: Vorschaubilder im neuen Stil (hellblau-schematisch)

Stand: 29.10.2026. Drei Schritte, jeweils als Befehl zum Einfügen in Codex. Schritt 2 erledigt Claude (Projektleitung).

Die erste Fassung im Navy-3D-Render-Stil (glühend, Glas, Podeste) ist verworfen. Die 25 Bilder dieser Fassung in `incoming/vorschau/` werden nicht eingebaut.

---

## Schritt 1 · Probe mit fünf Bildern (Codex)

```text
Repository gori-creator/Simulations, Zweig claude/exciting-gauss-noh1h9. Erst den Zweig frisch holen (git pull).

Lies docs/VORSCHAUBILDER.md, zweite Fassung vom 29.10.2026, Stil „hellblau-schematisch“.

Erzeuge mit deinem Bildwerkzeug genau diese fünf Vorschaubilder. Den Prompt jeweils wörtlich aus dem Abschnitt der Simulation in docs/VORSCHAUBILDER.md nehmen (die Zeile mit „> Clean schematic illustration …“):
- bruchteile.png
- pythagoras.png
- lineare-funktion.png
- fadenpendel.png
- brechung.png

Vorgaben:
- 16:9 quer, mindestens 1600 × 900 px, deckend (kein transparenter Hintergrund)
- alle fünf im selben Verlauf nacheinander, damit Linienstärke und Farben gleich bleiben

Vor dem Speichern jedes Bild gegen die Liste „Aussortieren, wenn …“ in docs/VORSCHAUBILDER.md prüfen und bei einem Treffer neu erzeugen:
- keine Schrift, Zahlen oder Pseudo-Schrift
- Mengen und Geometrie stimmen
- physikalisch richtig
- kein Glühen, kein 3D-Render-Look
- heller Hintergrund
- Motiv vollständig

Speichere die Dateien unter incoming/vorschau/<name>.png. Gleichnamige alte Dateien dort überschreiben.

Keinen Anwendungscode ändern und keine anderen Dateien anfassen. Ein Commit „Vorschaubilder: Probe im neuen Stil (5 Bilder)“, Push auf claude/exciting-gauss-noh1h9.

Am Ende kurz berichten: welche Bilder du neu erzeugen musstest und warum, und was bei den Vorgaben schwierig war.
```

---

## Schritt 2 · Abnahme der Probe (Claude)

An Claude schreiben:

```text
Die fünf Probebilder im neuen Stil liegen in incoming/vorschau/. Bitte ansehen, probeweise in die Karten einbauen und mir zeigen, wie sie auf der Seite wirken. Sag mir, welche zwei oder drei als Stilvorlage für den Rest taugen und ob am gemeinsamen Stil-Prompt noch etwas geändert werden muss.
```

Claude passt danach bei Bedarf den Stil in `docs/VORSCHAUBILDER.md` an und nennt die Stilvorlagen, zum Beispiel `incoming/vorschau/pythagoras.png`.

---

## Schritt 3 · Alle übrigen Bilder (Codex)

Erst starten, wenn Schritt 2 abgenommen ist. `<VORLAGEN>` durch die Dateien ersetzen, die Claude in Schritt 2 genannt hat.

```text
Repository gori-creator/Simulations, Zweig claude/exciting-gauss-noh1h9. Erst den Zweig frisch holen (git pull) und docs/VORSCHAUBILDER.md neu lesen; der Stil kann sich nach der Probe geändert haben.

Erzeuge die Vorschaubilder für alle übrigen Simulationen in docs/VORSCHAUBILDER.md, also alle außer den fünf Probebildern. Den Prompt jeweils wörtlich aus dem Abschnitt der Simulation nehmen, Dateiname genau wie dort angegeben.

Stilvorlage: Gib bei jedem Bild diese Probebilder als Referenz mit („im selben Stil wie diese Bilder: gleiche Linienstärke, gleiche Farben, gleicher heller Hintergrund mit feinem Raster“): <VORLAGEN>

Vorgaben:
- 16:9 quer, mindestens 1600 × 900 px, deckend
- in Blöcken von etwa 10 Bildern nacheinander erzeugen

Jedes Bild gegen die Liste „Aussortieren, wenn …“ in docs/VORSCHAUBILDER.md prüfen und bei einem Treffer neu erzeugen. Besonders achten auf:
- Pseudo-Schrift auf Linealen, Skalen und Bildschirmen
- falsche Mengen
- Glühen oder dunklen Hintergrund
- Abweichungen vom Stil der Vorlagen (dickere Linien, andere Blautöne, 3D-Look)

Speichern unter incoming/vorschau/<name>.png. Gleichnamige alte Dateien der ersten Fassung überschreiben, alle übrigen alten Dateien der ersten Fassung in incoming/vorschau/ löschen.

Nach jedem Block ein Commit („Vorschaubilder neuer Stil: <erste>–<letzte>“) und Push auf claude/exciting-gauss-noh1h9. Keinen Anwendungscode ändern.

Am Ende eine Liste:
- welche Bilder fehlen oder trotz mehrerer Versuche nicht sauber wurden, mit Grund
- welche Motive sich schlecht schematisch darstellen ließen
```

Danach an Claude: „Alle Vorschaubilder im neuen Stil sind hochgeladen, bitte angleichen und einbauen.“
