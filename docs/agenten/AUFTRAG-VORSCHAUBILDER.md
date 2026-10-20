# Auftrag: Schwarze Vorschaubilder beheben (Mängelliste Punkt 1)

Briefing der Projektleitung (Physik-Sitzung) für eine **eigene Claude-Code-Sitzung mit GitHub-Zugriff**. Diese Datei komplett als erste Nachricht einfügen oder auf sie verweisen.

---

## Rahmen

- **Repository:** `gori-creator/Simulations`. Lies zuerst `CLAUDE.md`, `docs/agenten/ZUSAMMENARBEIT.md`, `docs/agenten/QUALITAETSSICHERUNG.md` und `docs/agenten/MAENGELLISTE.md` (Punkt 1).
- **Zweig:** Lege einen eigenen Zweig von `claude/sleepy-goodall-ddchwy` an (dort liegt der neueste Stand der Mängelliste). Push nur auf diesen eigenen Zweig. Am Ende einen Pull Request nach `main` stellen. Nicht selbst mergen, sondern der Projektleitung Bescheid geben.
- **Nicht anfassen:** `docs/BILDER-WUNSCHLISTE.md` und `docs/BILDER.md` (daran arbeitet die Projektleitung), `src/curriculum/*.ts` außer dem Feld `thumb`, alle Simulationen außer ihrer `thumb.svg`.
- **Sprache:** Kommentare und Commit-Nachrichten auf Deutsch, Bezeichner auf Englisch. Commit-Nachrichten enden mit der Co-Authored-By-Zeile deiner Sitzung.
- **Arbeitsweise:** gründlich statt schnell. Erst Ursache bestätigen, dann der Fix an der zentralen Stelle, dann ein Test, dann die Sichtprüfung aller Karten.

## Problem

Auf der Startseite, den Fachseiten und im Katalog zeigen 16 Mathe-Karten statt eines Vorschaubilds eine **schwarze Fläche**:

ableitungsfunktion, aenderungsrate, extremwertprobleme, fourier-reihen, funktionenscharen, hauptsatz, kurvendiskussion, matrix-abbildungen, newton-verfahren, normalverteilung, polstellen-asymptoten, sin-cos-tan-dreieck, sinussatz-kosinussatz, stammfunktion-grafisch, taylor-polynome, umkehrfunktion

## Ursache (von der Projektleitung gefunden, bitte bestätigen)

- `src/components/SimThumb.astro` bettet `src/simulations/<fach>/<id>/thumb.svg` ein und entfernt dabei per Regex das **komplette** `<svg …>`-Starttag (`svg.replace(/^[\s\S]*?<svg[^>]*>/, '')`).
- Genau diese 16 Dateien haben ihre Darstellungsattribute am Wurzel-`<svg>` (`fill="none"`, `stroke="currentColor"`, `stroke-linecap`, `stroke-linejoin` …).
- Fallen diese Attribute weg, gilt die Voreinstellung `fill` = schwarz. Dadurch werden alle Pfade schwarz gefüllt.
- Prüfbefehl, der genau diese 16 liefert:
  ```sh
  for f in src/simulations/*/*/thumb.svg; do head -c 300 "$f" | grep -q '<svg[^>]*\(fill=\|stroke=\)' && basename "$(dirname "$f")"; done
  ```

## Aufgaben

1. **Kernfix:** Die Extraktion in eine kleine Funktion auslagern, zum Beispiel `src/lib/thumb.ts` mit `extractThumb(svg: string): string`.
   - Sie gibt den Inhalt zurück, eingewickelt in `<g …>` mit den Darstellungsattributen des Wurzel-`<svg>`.
   - Entfernt werden dabei `xmlns`, `xmlns:*`, `viewBox`, `width`, `height`, `class`, `id`, `style` und `preserveAspectRatio`.
   - Die Funktion muss robust sein gegen beliebige Reihenfolge, einfache oder doppelte Anführungszeichen, Zeilenumbrüche, einen XML-Kopf und Kommentare vor `<svg>`.
   - `SimThumb.astro` nutzt diese Funktion.
2. **Test** (`tests/thumbs.test.ts`):
   - Für jede `thumb.svg` gilt: `viewBox="0 0 320 180"`.
   - Es gibt keine festen Farben, also keine `#…`, `rgb(` und keine Farbnamen außer `none` und `currentColor`.
   - Der extrahierte Inhalt enthält die Wurzelattribute.
   - Dazu Einzeltests für `extractThumb` mit kleinen Beispielen.
3. **Sichtprüfung:** Dev-Server starten mit `npx astro dev --port 4460` und danach wieder stoppen.
   - Screenshots von Startseite, Fachseite Mathematik, Fachseite Physik und Katalog.
   - Jeweils bei 1360 px hell, 1360 px dunkel und 390 px.
   - Werkzeug: `scripts/agenten/simshot.cjs` (Kopf der Datei lesen) oder Playwright. In der Cloud-Umgebung: `executablePath: '/opt/pw-browsers/chromium'`.
   - **Alle 129 Karten ansehen**, vorher und nachher.
4. **Gestaltung:**
   - Wirkt eines der 16 Bilder nach dem Fix schwach, unklar, überladen oder stilfremd, die `thumb.svg` im Stil der guten vorhandenen überarbeiten.
   - Stilregeln: schlicht, eine klare Idee des Themas, Strichstärke 4–5, Flächen mit `fill-opacity`, nur `currentColor`, Format 320 × 180.
   - Simulationen mit `thumb: 'generic'` ohne eigene `thumb.svg` im Bericht auflisten. Sind es höchstens 15, ihnen eigene Vorschaubilder zeichnen.
5. **Prüfen und abgeben:**
   - `npm run verify` ergibt 0 Fehler, 0 Warnungen und 0 Hinweise, alle Tests sind grün.
   - Konsistenztests nicht abschwächen.
   - Pushen und einen PR nach `main` stellen. In der PR-Beschreibung stehen Ursache, Fix, Test, die neu gezeichneten Vorschaubilder und vorher/nachher-Screenshots (als Datei oder Beschreibung).
   - In `docs/agenten/MAENGELLISTE.md` Punkt 1 mit ✅ markieren und einen kurzen Befund ergänzen.

## Abnahme durch die Projektleitung

- Keine Karte ist mehr schwarz, weder hell noch dunkel.
- Die Vorschaubilder sind thematisch passend und im einheitlichen Stil.
- Der Test schlägt an, wenn man einer `thumb.svg` das Attribut `fill="none"` vom Wurzelelement entfernt und den Fix rückgängig macht.
- `verify` ist grün.
