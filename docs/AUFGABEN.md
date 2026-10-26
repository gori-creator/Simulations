# Offene Aufgaben (Stand 26.10.2026)

Zentrale Aufgabenliste. Wer eine Aufgabe übernimmt, trägt sich in der Spalte „Wer“ ein; Erledigtes wird abgehakt und kurz mit PR-Nummer vermerkt. Ältere Pläne: `docs/FAHRPLAN.md` (Phasen bis zur Veröffentlichung), `docs/agenten/WARTESCHLANGE.md` (Bau der Simulationen, abgeschlossen).

Für jede Aufgabe gilt: `CLAUDE.md` lesen, eigener Zweig von `main`, `npm run verify` mit 0 Fehlern, Pull Request nach `main`, **nicht selbst mergen** (Abnahme durch die Projektleitung).

## Läuft gerade

| Aufgabe | Wer | Stand |
| --- | --- | --- |
| Neues Design und Startseiten-Animation (`docs/agenten/AUFTRAG-DESIGN-STARTSEITE.md`) | Codex-Agent (ohne GitHub, Abgabe als ZIP und Patch) | läuft |

## Erledigt

- [x] **Prüfrunde Physik** (PR #45, #52/#53, 26.10.): alle Protokolle und Nachbesserungen in `main`, zuletzt Fadenpendel und Brechung (`docs/pruefung/SAMMLUNG.md`).
- [x] **Automatische Bildtests** (PR #51/#54, 26.10.): Referenzbild je Simulation, Vergleich in GitHub Actions (`docs/BILDTESTS.md`).
- [x] **Barrierefreiheit der Seiten** (PR #44, 25.10.): 19 Seiten hell/dunkel geprüft (axe, Tastatur, Zoom, reduzierte Bewegung), 10 Funde behoben.

## Barrierefreiheit in den Simulationen (Folgeaufgabe aus PR #44)

Betrifft `src/sim-core/` und einzelne Simulationen; Details in der Beschreibung von PR #44 („Nur aufgelistet“).

- [x] Pro Simulation prüfen, ob alle ziehbaren Punkte als Tastatur-Ziel angemeldet sind (`key-targets.ts`). Alle gezogenen Werte haben Regler; Antippen-Aktionen in 17 Simulationen sind jetzt Tastatur-Ziele, 3D-Ansichten und verschiebbare Koordinatensysteme per Pfeiltasten/Plus/Minus bedienbar (PR „Barrierefreiheit in den Simulationen“). Zeitmarken per Tastatur (Ziele „Zeitmarke zurück/vor“) seit 26.10. in Bewegungsdiagramme, Fadenpendel, Federpendel und Wellenausbreitung; offen noch in Doppler-Effekt, Schiefer Wurf, Freier Fall und Änderungsrate (dort nur Abspielen/Anhalten).
- [x] Namen der Zeichenflächen (`surface.ts`) beschreibend machen statt allgemein. Fast alle waren schon beschreibend; die vier kürzesten ergänzt.
- [x] Messwerte: nach Loslassen bzw. Tastatur-Änderung höflich vorlesen (statt `aria-live="off"`). Geänderte Ergebnisse werden angesagt; neu `ctx.announce()`.
- [x] `dragHint` mit aktuellen Werten statt festem Text (unsichtbarer Zusatz mit den Regler-Werten).
- [x] Klären, ob `_hide=1` auch die zugehörigen Regler ausblenden soll (Prüfungs-Links). Empfehlung im PR: nicht alle Regler, nur als `spoiler` gekennzeichnete; Entscheidung der Projektleitung steht aus.
- [x] `fmt.approx` im Kern ergänzen; Simulationen, die „≈“ selbst bauen, darauf umstellen (`fmt.isExact`, `fmt.rel`, `fmt.approx`; 18 Simulationen).
- [x] Prüfbogen: reduzierte Bewegung auch nach „Start“ prüfen (auch nach Aktionsknöpfen).
- [x] Fest eingetragene Farben in Simulationen auf `ctx.theme` umstellen bzw. Kontrast im Dunkelmodus prüfen. Kontrast gemessen; Schrift auf Farbflächen über `textOn()` (rund 30 Simulationen). Materialfarben (Kupfer, Holz …) bewusst unverändert, damit das Aussehen gleich bleibt.
- [ ] Theme-Reihenfarben Orange/Grün im hellen Modus als Textfarbe unter 4,5 : 1 auf Weiß – beim neuen Design entscheiden.

## Rechtliches (vor der echten Veröffentlichung)

Keine Rechtsberatung – vor dem Start von einer kundigen Person prüfen lassen.

- [ ] **Impressum** (`src/content/pages/{de,en}/imprint.md`): Platzhalter durch echte Angaben ersetzen (Name, Anschrift, E-Mail der verantwortlichen Person; bei Minderjährigen eher Elternteil oder Schule). **Angaben kommen von der Projektleitung.**
- [ ] **Datenschutzerklärung** (`src/content/pages/{de,en}/privacy.md`): verantwortliche Stelle eintragen; Abschnitt „Hosting“ für GitHub Pages ausformulieren (GitHub Inc., USA; IP-Adresse in Server-Protokollen; Rechtsgrundlage Art. 6 Abs. 1 lit. f DSGVO; Drittlandübermittlung/Data Privacy Framework). Hinweis „Vorlage“ erst entfernen, wenn alles geprüft ist. → Abschnitt „Hosting“ ausformuliert (PR #49, 25.10., Entwurf, rechtliche Prüfung offen); verantwortliche Stelle trägt die Projektleitung ein.
- [ ] **Lizenz** festlegen und als `LICENSE` ablegen. Vorschlag: MIT für den Code, CC BY 4.0 für Texte und Bilder, damit Lehrkräfte Material weitergeben und anpassen dürfen. **Entscheidung der Projektleitung.**
- [x] **Bildrechte** dokumentieren (26.10., Entwurf in `docs/BILDER.md`, Abschnitt „Herkunft und Rechte“; offen für die Projektleitung: festhalten, welcher Bildgenerator verwendet wurde, und dessen Bedingungen prüfen): Bilder sind selbst mit KI erzeugt (Prompts in `docs/BILDER.md`/`docs/BILDER-WUNSCHLISTE.md`); keine Marken, keine Logos. Vorbild-Bilder fremder Designer nicht ins Repository legen.
- [ ] Bis Impressum und Datenschutz fertig sind, ggf. wieder `SITE_LIVE: 'false'` in `.github/workflows/deploy.yml` (zeigt nur eine Platzhalterseite).

## Sicherheit

Die Seite ist rein statisch (kein Server, keine Datenbank, keine Logins) – das Risiko ist gering.

- [x] **Pakete aktualisieren** (PR #48, 25.10.): `npm audit` meldet `undici` (hoch) und `fast-uri` (mittel). Mit `npm audit fix` beheben, prüfen, ob sie nur beim Bauen gebraucht werden, `npm run verify`. → Behoben (dazu `zod`); alle drei nur beim Bauen bzw. in der Typprüfung, nicht auf der fertigen Seite.
- [x] **Content-Security-Policy** (PR #48, 25.10.) als `<meta http-equiv="Content-Security-Policy">` im Layout (`src/layouts/BaseLayout.astro`): nur eigene Skripte, Styles, Bilder und Schriften; keine externen Quellen. Prüfen, dass Inline-Skripte (Bundesland, Dunkelmodus) weiter laufen (Hash oder Nonce). → Über Astro (`security.csp`) mit Prüfsummen; alle 416 Seiten ohne Verstoß.
- [ ] **GitHub-Konto absichern** (Projektleitung): Zwei-Faktor-Anmeldung; unter Settings → Branches Schutzregel für `main` (nur per Pull Request, Prüfungen müssen grün sein).
- [x] Dependabot (26.10.): `.github/dependabot.yml` sucht wöchentlich nach npm-Updates und monatlich nach Updates der GitHub-Aktionen (je als Pull Request). Die Sicherheitswarnungen selbst schaltet die Projektleitung unter Settings → Code security ein.

## Inhalte und Funktionen

- [x] **9 Bilder neu erzeugen und einbauen** (26.10.): Flaschenöffner, Eisberg, Becherglas, Urne, Leiter, Asphalt, Fluchtstab, Lupe (ersetzt die alte bei Maßstab), Sparbuch – alle eingebaut, Beschreibung in `docs/BILDER.md` („Nachgelieferte Bilder“).
- [x] **Ladezeit für Schulnetze** (PR #48, 25.10.): Seitengröße messen (JavaScript, Bilder), große Bilder verkleinern (Ziel ≤ 300 KB, aktuell u. a. Baumkrone, Baum, Erde, Asphalt darüber), Bilder erst bei Bedarf laden, Vorher-/Nachher-Zahlen im PR. → Service Worker lädt nicht mehr die ganze Seite vorab (vorher 23 MB je Gerät), Fachseiten halb so groß, 9 Bilder verkleinert, Test für ≤ 300 KB.
- [ ] **Design einbauen**, sobald der Codex-Agent abgegeben hat: Abgabe prüfen, Patch anwenden, Sichtprüfung hell/dunkel, PC/Handy, PR.
- [ ] **Chemie:** Plan für die ersten 10 Simulationen (Klasse 7–13, KMK-Bildungsstandards), dann die ersten zwei vollständig bauen (`docs/NEUE-SIMULATION.md`).
- [ ] **Weitere Bundesländer:** Lehrpläne Mathematik und Physik (Gymnasium) für Nordrhein-Westfalen und Niedersachsen nach dem Muster in `src/curriculum/lehrplaene/`, nur amtliche Quellen, Unsicheres als Entwurf.
- [x] **Automatische Bildtests** (`docs/FAHRPLAN.md`, 1.6): Referenzfotos je Simulation, Vergleich bei jeder Änderung. Eigene GitHub-Aktion „Bildtests“, Anleitung in `docs/BILDTESTS.md`.
- [ ] Freiwillig: Ideen für später (Vorhersage-Frage vor dem Start, „Für morgen, 5 Minuten“ für Lehrkräfte, Suche nach Formeln) – erst nach dem Design.
