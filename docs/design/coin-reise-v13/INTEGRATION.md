# Integration in das bestehende Astro-Projekt

## Integrationspunkte im mitgelieferten Projektstand

| Ziel | Umsetzung |
|---|---|
| `src/pages/[lang]/index.astro` | Startseite aus Hero, Experiment und Katalog zusammensetzen |
| `src/config/site.ts` | Sichtbaren Namen Scitura in DE/EN setzen; vorhandene Domain/URL-Werte nicht erfinden |
| `src/components/Logo.astro`, `Header.astro`, `Footer.astro` | Ausgewähltes dunkles Logo und Scitura-Schriftzug verwenden |
| `src/layouts/BaseLayout.astro` | Metadaten, Favicons und Sprachalternativen integrieren |
| `public/favicon.svg`, `public/icons/`, `public/manifest.webmanifest` | Vorhandene Icon-/Manifestverweise konsistent auf neue Assets umstellen; PNG nicht als SVG ausgeben |
| `src/i18n/ui.ts` | Sichtbare Texte in bestehende Übersetzungsstruktur übernehmen |
| `src/lib/routes.ts` | Links mit `href()`/`withBase()` einschließlich Unterpfad-Hosting bilden |
| `src/curriculum/`, `SimCard.astro` | Aktuellen Katalog und Originalkarten verwenden, keine feste Zahl 129 einbauen |
| `src/simulations/physik/energieerhaltung/` | Bestehende Rechenlogik und Grafik weiterverwenden |

Die konkreten Dateien im aktuellen Zielrepository zuerst prüfen. Die Tabelle beschreibt die bekannte Ausgangsbasis, keinen Auftrag zum Überschreiben neuerer Architektur.

## Technische Grenzen des Prototyps

- `index.html` ist eine komplette Seite. Nicht als zweite HTML-Seite in `BaseLayout` einfügen; Inhalt in passende Komponenten zerlegen.
- `style.css` enthält globale Selektoren wie `header`, `nav`, `button` sowie iterative Ergänzungen. Für Produktion sinnvoll konsolidieren und auf Startseite/Komponenten begrenzen, damit Simulationsseiten nicht ungewollt verändert werden.
- `catalog.js` enthält einen Snapshot von 129 Simulationen (93 Mathematik, 36 Physik). Im Zielprojekt stets den aktuellen Lehrplan nutzen. Vorschau-Bilder stammen aus den vorhandenen Karten.
- Der Prototyp enthält root-relative Links, einen lokalen `file:`-Fallback auf Port 4176 und einen Sprachwechsel per Queryparameter. Das ist Vorschau-Verhalten. Produktiv das bestehende Sprachrouting sowie BASE_URL verwenden; keine localhost-Links veröffentlichen.
- `stage.ts` greift für die Vorschau auf interne Sim-Core-Dateien zu. Bei der Integration die Projektregel zum öffentlichen Import aus `src/sim-core/index.ts` beachten und nötige Exporte gezielt ergänzen. Keine zweite Energieerhaltungsphysik implementieren.
- Die Skripte erwarten die IDs und Startreihenfolge: `catalog.js`, `variants.js`, `app.js`, `sculpture.js`, `stage.js`. Bei Komponentenzerlegung explizite Initialisierung und Teardown herstellen; doppelte Listener/Animationsschleifen verhindern.
- Entwurfsnummer, Varianten-Footer und Debug-Inspektionshilfen sind für den Prototyp. Nicht ungeprüft als Produkt-UI veröffentlichen.
- Die Skulptur hat einen SVG-Fallback; reduzierte Bewegung, Pause, Sichtbarkeit und Seitenwechsel berücksichtigen. Animationen auf echten Mobilgeräten auf Laufzeit und Darstellung prüfen.
- Die dunklen PNG-Logoassets sind final ausgewählt, aber Rasterdateien. Eine spätere echte Vektorisierung soll dieselbe Form erhalten; kein neues Logo entwerfen. Favicons in kleinen Größen separat visuell prüfen.
- Die eingebettete Achterbahn nutzt Bilder aus dem Originalprojekt. Die bestehende Bilddokumentation und Ersatzgrafiken beibehalten.

## Reproduzierbare Vorschau

Node.js gemäß Projektanforderung (Ausgangsbasis >=22.12.0). Aus dem Repository-Root:

```sh
npm ci
npm run build
# Optional: Katalog und Stage-Bundle nach Änderungen am Original regenerieren:
node docs/design/coin-reise-v13/build-preview.cjs
# Vorhandenen dist-Build mit der Design-Startseite in einen separaten Ordner kopieren:
node docs/design/coin-reise-v13/export-preview.cjs
node .scitura-preview/preview-server.cjs
```

`build-preview.cjs` benötigt esbuild. Im Ausgangsprojekt ist es transitiv über den Build verfügbar; falls das aktuelle Projekt es nicht auflöst, ausdrücklich als passende Entwicklungsabhängigkeit aufnehmen. Für die bereits mitgelieferten Bundles und `export-preview.cjs` werden keine zusätzlichen Pakete benötigt.

Der Export schreibt ausschließlich nach `.scitura-preview/` und niemals in `dist/` oder `src/`. Ein existierender Zielordner wird aus Vorsicht nicht automatisch gelöscht: Für einen neuen Export einen anderen, noch nicht bestehenden Zielpfad als Argument angeben. Ausgaben nicht ins Git-Repository aufnehmen. Alternativ die fertige Vorschau-ZIP nutzen.

## Reihenfolge für den Main Manager

1. Ausgangsbranch und aktuelle uncommitted Änderungen prüfen; bestehende Arbeit erhalten.
2. Logo/Markenname und Seitenstruktur integrieren.
3. WebGL-Skulptur und Münzpfad in Initialisierung/Teardown einbinden.
4. Echte Energieerhaltungssimulation integrieren und Parameter-/Linkübergabe prüfen.
5. Aktuellen Katalog, Sprachwechsel, Fächerlinks, Suche/Filter anschließen.
6. Responsive Darstellung, Zugänglichkeit, reduced-motion, dunkles Theme (falls vorhanden) und BASE_URL prüfen.
7. `npm run verify` sowie gezielte Browserprüfung aus `ABNAHME.md` durchführen; Ergebnis und offene Einschränkungen dokumentieren.

Es wurde kein produktiver Astro-Umbau und keine Veröffentlichung im Rahmen dieser Designübergabe vorgenommen.
