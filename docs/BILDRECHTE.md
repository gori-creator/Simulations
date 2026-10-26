# Bildrechte und fremde Bestandteile (Entwurf)

> **Entwurf, keine Rechtsberatung.** Dieses Dokument hält fest, woher die Bilder und fremden Bestandteile der Seite stammen und was beim Prüfen aufgefallen ist. Vor der echten Veröffentlichung sollte jemand mit Rechtskenntnis die Punkte unter „Offen“ ansehen.
>
> Stand: 26.10.2026 – alle Bilder einzeln angesehen.

## Übersicht

| Art | Wo | Herkunft | Anzahl |
| --- | --- | --- | --- |
| Fotos und gerenderte Gegenstände der Simulationen | `src/assets/sims/<id>/` | **Selbst mit einem KI-Bildgenerator erzeugt**; zu jedem Bild gibt es den Prompt (siehe unten) | 198 Dateien (einige Bilder liegen byte-gleich in mehreren Ordnern) |
| Eingangsbilder, die nicht eingebaut sind | `docs/bilder-eingang/` | ebenso KI-erzeugt; nur im Repository, **nicht auf der Seite** | 20 |
| Vorschaubilder der Karten | `src/simulations/<fach>/<id>/thumb.svg` | im Projekt gezeichnet (SVG) | 113 |
| Website-Symbol und App-Symbole | `public/favicon.svg`, `public/icons/` | im Projekt gezeichnet | 5 |
| Alle übrigen Grafiken in den Simulationen | Canvas-Code in `src/simulations/` | im Projekt programmiert | – |
| Referenzbilder der Bildtests | `tests/bildtests/referenz/` | Bildschirmfotos der eigenen Seite | 258 |

**Wo die Prompts stehen:** Jedes Bild in `src/assets/sims/` ist in der Tabelle in `docs/BILDER.md` aufgeführt; das prüft ein Test in `tests/simulations.test.ts`. Den Prompt findet man an einer dieser Stellen:

1. in `docs/BILDER.md` unter der Überschrift mit dem Dateinamen (`### \`auto.webp\``),
2. in `docs/BILDER-WUNSCHLISTE.md` beim Eintrag mit dem Dateipfad (`**Datei:**`) oder in einer der Prompt-Tabellen (`alufolie.png`, `brett-eis.png` …),
3. bei Kopien beim Original. Beispiele: Die Tischkante liegt in neun Ordnern, der Apfel in Zehnerpotenzen und Proportionalität.

Am 26.10.2026 hatte jedes Bild einen Prompt.

## Prüfung der Bilder (26.10.2026)

Ich habe alle 218 Bilder angesehen (198 eingebaute und 20 im Eingang) und dabei auf Folgendes geachtet: Personen, Schrift, Logos, Marken, echte Geldstücke, erkennbare Werke anderer.

**Ergebnis:**

- **Keine Personen.**
- **Keine Logos und keine Markennamen.**
- **Keine echten Münzen oder Geldscheine.** Die Münzen sind Fantasie-Münzen ohne Währungsangabe.
- **Schrift** gibt es nur, wo sie zum Gegenstand gehört, und ohne Bezug zu einem Hersteller:
  - Skalen auf Lineal, Messgeräten und dem Resonanz-Rad
  - die „1“ auf der Fantasie-Münze
  - der Aufdruck „DC 3–6V“ auf dem kleinen Motor (Stromkreis)
- **Erde, Mond, Sonne, Sternenhimmel:** ebenfalls KI-erzeugt (Prompts in `docs/BILDER.md`). Es sind keine Fotos von Raumfahrtagenturen.

**Grenzfälle**, die man kennen sollte:

| Bild | Befund | Einschätzung |
| --- | --- | --- |
| `ziegenproblem/auto.webp` | Rotes Auto, dessen Front an ein reales Kompaktmodell erinnert; im Kühlergrill ein runder, leerer Fleck an der Stelle eines Emblems | Kein Logo, kein Name. Wer ganz sicher gehen will, erzeugt es neu mit „generic, no recognizable car model“. |
| `docs/bilder-eingang/doppler-effekt/krankenwagen.webp` | Kastenwagen, der einem bekannten Transportermodell ähnelt | **Nicht eingebaut**; eingebaut ist eine eigene Draufsicht ohne erkennbares Modell. |
| `proportional/taxi.webp`, `aenderungsrate/auto.webp`, `kreisbewegung/auto-oben.webp`, `zehnerpotenzen/flugzeug.webp` | allgemeine Fahrzeugformen | ohne Emblem, Kennzeichen oder Bemalung einer Fluggesellschaft |

## Was das für die Rechte bedeutet

- **KI-Bilder und Urheberrecht:** Nach deutschem Recht schützt das Urheberrecht nur „persönliche geistige Schöpfungen“ von Menschen (§ 2 Abs. 2 UrhG). Bilder, die ein Generator aus einem kurzen Text erzeugt, sind deshalb nach überwiegender Ansicht **nicht urheberrechtlich geschützt**.
  - Für das Projekt heißt das: Wir dürfen sie nutzen, ohne jemanden um Erlaubnis zu fragen.
  - Allerdings hat auch niemand ein ausschließliches Recht an ihnen.
  - Eine Lizenz wie CC BY wirkt für diese Bilder daher nur eingeschränkt (siehe Aufgabe „Lizenz“).
- **Nutzungsbedingungen des Generators:** Maßgeblich ist außerdem, was der verwendete Dienst erlaubt, etwa zur Nutzung in einem frei zugänglichen Bildungsangebot oder zur Kennzeichnung. **Welcher Generator verwendet wurde, ist im Repository nicht festgehalten**; siehe „Offen“.
- **Kennzeichnung als KI-Bild:** Die EU-KI-Verordnung (Art. 50) verlangt eine Kennzeichnung vor allem bei täuschend echten Darstellungen realer Personen, Orte oder Ereignisse („Deepfakes“). Unsere Bilder zeigen Alltagsgegenstände ohne Personen. Ein freiwilliger Hinweis auf der Seite „Über das Projekt“ ist trotzdem transparent und kostet nichts. Vorschlag: „Die Fotos in den Simulationen sind mit KI erzeugt.“
- **Marken und Designs:** Erkennbare Markenzeichen gibt es keine. Ähnlichkeiten in der Form (Autos) sind ein kleines Restrisiko; siehe Grenzfälle.

## Fremde Bestandteile ohne Bilder

| Bestandteil | Wofür | Lizenz | Hinweis |
| --- | --- | --- | --- |
| KaTeX (mit seinen Formel-Schriften) | Formeln | MIT | Die MIT-Lizenz verlangt, den Lizenzhinweis weiterzugeben. Die Schriften werden mit der Seite ausgeliefert. |
| qrcode-generator | QR-Code zum Teilen | MIT | ebenso |
| Astro | Bau der Seite | MIT | nur beim Bauen, nicht in der ausgelieferten Seite (außer kleinem Laufzeitcode) |

Die Seite selbst lädt **keine** Schriften, Skripte oder Bilder von fremden Servern; die Grundschrift ist die Systemschrift des Geräts.

## Regeln für neue Bilder

- **Nur selbst erzeugte Bilder** oder Bilder mit einer Lizenz, die die freie Nutzung erlaubt. Die Quelle bzw. Lizenz wird beim Bild in `docs/BILDER.md` eingetragen.
- **Prompt eintragen** (`docs/BILDER.md` oder Wunschliste), sonst ist später nicht nachvollziehbar, woher das Bild stammt.
- Keine Personen, keine Logos, keine Markennamen, keine echten Münzen, keine erkennbaren Fahrzeug- oder Gerätemodelle (im Prompt: „generic, no brand, no logo, no text“).
- **Keine Vorbild-Bilder fremder Designer ins Repository legen.** Das gilt auch für Bildschirmfotos anderer Webseiten als Stilvorlage.
- Die allgemeinen Regeln zu Stil und Dateigröße stehen in `docs/BILDER.md`.

## Offen (Projektleitung)

- [ ] **Generator eintragen:** welcher Dienst und welches Konto die Bilder erzeugt hat; dazu kurz festhalten, was dessen Nutzungsbedingungen zur Nutzung und Kennzeichnung sagen. Am besten hier in dieser Datei.
- [ ] **Hinweis „mit KI erzeugt“** auf der Seite „Über das Projekt“: ja oder nein?
- [ ] **Lizenzhinweise** für KaTeX und qrcode-generator auf der Seite nennen, z. B. auf „Über das Projekt“. Das hängt mit der Entscheidung zur Lizenz zusammen (`docs/AUFGABEN.md`).
- [ ] Optional: `ziegenproblem/auto.webp` als ganz allgemeines Auto neu erzeugen.
