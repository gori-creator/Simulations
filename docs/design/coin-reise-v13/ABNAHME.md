# Prüfung und Abnahme

## Bereits geprüft

- V13-Gestaltung vor dem Logo-Wechsel: acht Browser-Prüfgruppen ohne Fehler, DE/EN bei 320, 390, 700, 768, 1024, 1360 und 1600 px. Originalnachweis: `referenz/v13-browser-qa.json`.
- Darunter Fachlinks/Sprachwechsel/Fokus, Filter, Experimentbedienung, Sockel, linke Münzbahn, responsive Wechsel und vier Schwenkstellungen der Skulptur.
- Simulation und Skulptur gegenüber V12 unverändert; das letzte Logo-Update betrifft PNG-Assets, Kopfbereich/Favicon und Münzemblem. Für dieses Update wurde keine neue mathematische Logik geschrieben.
- Die aktuelle dunkle Variante wurde vom Nutzer ausdrücklich bestätigt. Die erneute Prüfung von Assets, Export und Paket steht in `referenz/uebergabe-pruefung.json`.

Die bisherigen Layouttests stammen vor dem Logo-Wechsel. Sie sind keine Behauptung einer erneuten vollständigen Suite nach jeder Asset-Änderung. Safari, Firefox und echte Mobilgeräte sind noch nicht getestet. Die neue produktive Astro-Integration benötigt eigene Prüfungen.

## Nach Integration prüfen

- `npm run verify`: Astro-/TypeScript-Prüfung, Vitest, Build gemäß Projektvorgabe.
- Keine horizontalen Überläufe in DE/EN bei 320–1600 px; Header/Logo/Nav bleiben bedienbar.
- Logo vollständig und dunkel auf hellem Grund; helle Münzprägung; Favicon ohne weißen Kasten.
- Skulptursockel vollständig; Orbit-Ringe bleiben räumlich lesbar; Satelliten laufen; keine schmale Seitenlage.
- Münze folgt beim Scrollen ohne Sprünge einer zusammenhängenden Bahn. Desktop links bis Seitenende, mobil am Experiment; nach Suche, Filter und Resize weiter korrekt.
- Motion-Pause und `prefers-reduced-motion` stoppen bzw. reduzieren Bewegung; Hintergrundtabs verbrauchen keine unnötigen Frames.
- Hügelbahn/Looping/eigene Bahn, Start/Pause/Reset, Reibung/Masse/Starthöhe, Ziehbedienung, Regleralternative und Tastatur funktionieren.
- Link zur vollständigen Energieerhaltung übernimmt die Parameter; Sprachwechsel und Original-Fachseiten funktionieren auch mit BASE_URL-Unterpfad.
- Vollständiger Katalog aus aktuellem Curriculum, Suche und Fach-/Klassenfilter; Originalkarten ohne fehlende Bilder.
- Keine externen Laufzeitrequests, keine localhost-Verweise in der Produktion; keine Entwurfs-/Variantenbedienung in der Produktnavigation.
- Bestehende Themen-/Regionseinstellungen und Seiten außerhalb der Startseite bleiben funktionsfähig.
