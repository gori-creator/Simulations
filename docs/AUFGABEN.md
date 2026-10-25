# Offene Aufgaben (Stand 25.10.2026)

Zentrale Aufgabenliste. Wer eine Aufgabe übernimmt, trägt sich in der Spalte „Wer“ ein; Erledigtes wird abgehakt und kurz mit PR-Nummer vermerkt. Ältere Pläne: `docs/FAHRPLAN.md` (Phasen bis zur Veröffentlichung), `docs/agenten/WARTESCHLANGE.md` (Bau der Simulationen, abgeschlossen).

Für jede Aufgabe gilt: `CLAUDE.md` lesen, eigener Zweig von `main`, `npm run verify` mit 0 Fehlern, Pull Request nach `main`, **nicht selbst mergen** (Abnahme durch die Projektleitung).

## Läuft gerade

| Aufgabe | Wer | Stand |
| --- | --- | --- |
| Prüfrunde Physik abschließen (Abschnitt A, `docs/pruefung/UEBERGABE-NEUE-PRUEFER.md`) | Claude-Agent | 16 von 17 Protokollen auf `pruefen/paket-1`, noch nicht in `main` |
| Barrierefreiheit der Seite (Tastatur, Bildschirmleser, Kontraste, Zoom, reduzierte Bewegung) | Claude-Agent | läuft |
| Neues Design und Startseiten-Animation (`docs/agenten/AUFTRAG-DESIGN-STARTSEITE.md`) | Codex-Agent (ohne GitHub, Abgabe als ZIP und Patch) | läuft |

## Rechtliches (vor der echten Veröffentlichung)

Keine Rechtsberatung – vor dem Start von einer kundigen Person prüfen lassen.

- [ ] **Impressum** (`src/content/pages/{de,en}/imprint.md`): Platzhalter durch echte Angaben ersetzen (Name, Anschrift, E-Mail der verantwortlichen Person; bei Minderjährigen eher Elternteil oder Schule). **Angaben kommen von der Projektleitung.**
- [ ] **Datenschutzerklärung** (`src/content/pages/{de,en}/privacy.md`): verantwortliche Stelle eintragen; Abschnitt „Hosting“ für GitHub Pages ausformulieren (GitHub Inc., USA; IP-Adresse in Server-Protokollen; Rechtsgrundlage Art. 6 Abs. 1 lit. f DSGVO; Drittlandübermittlung/Data Privacy Framework). Hinweis „Vorlage“ erst entfernen, wenn alles geprüft ist.
- [ ] **Lizenz** festlegen und als `LICENSE` ablegen. Vorschlag: MIT für den Code, CC BY 4.0 für Texte und Bilder, damit Lehrkräfte Material weitergeben und anpassen dürfen. **Entscheidung der Projektleitung.**
- [ ] **Bildrechte** dokumentieren: Bilder sind selbst mit KI erzeugt (Prompts in `docs/BILDER.md`/`docs/BILDER-WUNSCHLISTE.md`); keine Marken, keine Logos. Vorbild-Bilder fremder Designer nicht ins Repository legen.
- [ ] Bis Impressum und Datenschutz fertig sind, ggf. wieder `SITE_LIVE: 'false'` in `.github/workflows/deploy.yml` (zeigt nur eine Platzhalterseite).

## Sicherheit

Die Seite ist rein statisch (kein Server, keine Datenbank, keine Logins) – das Risiko ist gering.

- [ ] **Pakete aktualisieren:** `npm audit` meldet `undici` (hoch) und `fast-uri` (mittel). Mit `npm audit fix` beheben, prüfen, ob sie nur beim Bauen gebraucht werden, `npm run verify`.
- [ ] **Content-Security-Policy** als `<meta http-equiv="Content-Security-Policy">` im Layout (`src/layouts/BaseLayout.astro`): nur eigene Skripte, Styles, Bilder und Schriften; keine externen Quellen. Prüfen, dass Inline-Skripte (Bundesland, Dunkelmodus) weiter laufen (Hash oder Nonce).
- [ ] **GitHub-Konto absichern** (Projektleitung): Zwei-Faktor-Anmeldung; unter Settings → Branches Schutzregel für `main` (nur per Pull Request, Prüfungen müssen grün sein).
- [ ] Optional: Dependabot für Sicherheitsupdates einschalten (Settings → Code security).

## Inhalte und Funktionen

- [ ] **9 Bilder neu erzeugen** (Projektleitung mit Bildgenerator, Prompts: `docs/agenten/PROMPT-BILDER-NACHLIEFERUNG.md`; Einbau: `docs/agenten/AUFTRAG-BILDER-NACHLIEFERUNG.md`): Flaschenöffner, Eisberg, Becherglas, Urne, Leiter, Oberfläche Gummi/Asphalt, Fluchtstab, Lupe, Sparbuch – Gründe in `docs/BILDER-WUNSCHLISTE.md` (Abschnitt „Stand 22.10.2026“). Danach einbauen wie in PR #41.
- [ ] **Ladezeit für Schulnetze:** Seitengröße messen (JavaScript, Bilder), große Bilder verkleinern (Ziel ≤ 300 KB, aktuell u. a. Baumkrone, Baum, Erde, Asphalt darüber), Bilder erst bei Bedarf laden, Vorher-/Nachher-Zahlen im PR.
- [ ] **Design einbauen**, sobald der Codex-Agent abgegeben hat: Abgabe prüfen, Patch anwenden, Sichtprüfung hell/dunkel, PC/Handy, PR.
- [ ] **Chemie:** Plan für die ersten 10 Simulationen (Klasse 7–13, KMK-Bildungsstandards), dann die ersten zwei vollständig bauen (`docs/NEUE-SIMULATION.md`).
- [ ] **Weitere Bundesländer:** Lehrpläne Mathematik und Physik (Gymnasium) für Nordrhein-Westfalen und Niedersachsen nach dem Muster in `src/curriculum/lehrplaene/`, nur amtliche Quellen, Unsicheres als Entwurf.
- [ ] **Automatische Bildtests** (`docs/FAHRPLAN.md`, 1.6): Referenzfotos je Simulation, Vergleich bei jeder Änderung.
- [ ] Freiwillig: Ideen für später (Vorhersage-Frage vor dem Start, „Für morgen, 5 Minuten“ für Lehrkräfte, Suche nach Formeln) – erst nach dem Design.
