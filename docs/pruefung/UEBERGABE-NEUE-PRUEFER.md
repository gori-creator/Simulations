# Übergabe der Prüfrunde an neue Accounts (Stand 21.10.2026, mittags)

Verfasst von der Projektleitung. Die bisherigen Prüfer haben ihr Nutzungslimit erreicht. Die restlichen **45 Simulationen** übernehmen neue Accounts. Für jeden Account gibt es unten einen eigenen Abschnitt; **lies nur deinen** und dazu die allgemeinen Regeln.

## Stand

| Paket | Prüfer bisher | fertig | offen |
|---|---|---|---|
| 1 (Physik + Mathe ab 13) | Vertretung | 19 von 44 | 25 |
| 2 (Mathe 5–8) | Prüfer 2 | 36 von 43 | 7 |
| 3 (Mathe 9–12) | Prüfer 3 | 29 von 42 | 13 |

„Fertig“ heißt: Protokoll in `docs/pruefung/paket-<N>/<id>.md` liegt auf dem Paket-Zweig. Gezählt am 21.10. um 12:45 Uhr.

## Allgemeine Regeln (für alle)

1. Lies zuerst `CLAUDE.md`, `docs/agenten/QUALITAETSSICHERUNG.md`, `docs/pruefung/BRIEFING-PRUEFER.md` (die Arbeitsweise pro Simulation gilt unverändert), `docs/pruefung/PLAN.md` und `docs/pruefung/VORLAGE.md`.
2. **Sieh dir 2 fertige Protokolle deines Pakets an**, damit Tiefe und Stil gleich bleiben (z. B. die beiden zuletzt geschriebenen in `docs/pruefung/paket-<N>/`).
3. **Zweig:** Lege deinen eigenen Zweig vom bisherigen Paket-Zweig an und hole `main` dazu (Befehl steht in deinem Abschnitt). Push nur auf deinen Zweig.
4. **Reihenfolge:** wie in deiner Liste, von oben nach unten.
5. **Pro Simulation:** Prüfbogen, Fach (mindestens 3 Werte von Hand nachrechnen, ins Protokoll), Aufgaben und Texte (jede Aufgabe selbst rechnen, jedes Beispiel laden), Geräte, Barrierefreiheit, Fehler beheben, `npm run verify` mit 0/0/0, Protokoll schreiben, Haken in `docs/pruefung/pakete.md`.
6. **Nicht ändern:** `src/sim-core/`, `src/i18n/ui.ts`, `src/curriculum/*.ts`, Seiten und Layouts. Was dort nötig wäre, kommt ins Protokoll unter „Für den Kern“.
7. **Abgabe:** je 8 Simulationen ein Pull Request nach `main`, Titel „Prüfrunde Paket <N>, Rest <k>: <id>, …“. **Nicht selbst mergen**, die Projektleitung nimmt ab.
8. **Limit:** Wenn dein Nutzungslimit naht: committen, pushen und im PR notieren, bei welcher Simulation du stehst.
9. **Neu seit dem ursprünglichen Briefing:**
   - Ein boolescher Schalter, der Lösungen im Bild verbirgt, gehört in `resultsParam` (siehe `src/sim-core/types.ts`). Prüfe, ob das bei deiner Simulation passt.
   - Kurzbeschreibungen (`summary` im Lehrplan) sind schon vereinfacht; nicht anfassen.
   - Der Satz „Sie kennen Ihre Klasse am besten“ ist überall entfernt und darf nicht wiederkommen.

---

## Account A: Physik-Rest aus Paket 1 (17 Simulationen)

**Zweig:**
```
git fetch origin
git checkout -b pruefung/paket-1-physik origin/pruefen/paket-1
git merge origin/main
```
**Port:** 4540 · **Protokolle:** `docs/pruefung/paket-1/<id>.md`

1. `doppler-effekt`
2. `federpendel`
3. `wellen-ausbreitung`
4. `feldlinien`
5. `kondensator`
6. `doppelspalt`
7. `induktion`
8. `interferenz`
9. `lorentzkraft`
10. `planetenbahnen`
11. `resonanz`
12. `stehende-wellen`
13. `linienspektren`
14. `photoeffekt`
15. `elektronenbeugung`
16. `brechung` (frisch überarbeitet, T04 Teil 2; Abnahmebericht in der Commit-Nachricht von `96ca417`)
17. `fadenpendel` (ebenso)

---

## Account B: Rest von Paket 2 und Mathematik ab Jgst. 13 aus Paket 1 (15 Simulationen)

**Zweig:**
```
git fetch origin
git checkout -b pruefung/paket-2-rest origin/pruefung/paket-2
git merge origin/main
```
**Port:** 4550 · **Protokolle:** Paket-2-Simulationen nach `docs/pruefung/paket-2/<id>.md`, die übrigen nach `docs/pruefung/paket-1/<id>.md`

Aus Paket 2:
1. `kreiszahl-pi`
2. `lgs-grafisch`
3. `prisma-zylinder`
4. `gleichungen-grafisch`
5. `pythagoras`
6. `baumdiagramm`
7. `funktionsplotter`

Aus Paket 1 (Mathematik ab Jgst. 13):
8. `aenderungsrate`
9. `extremwertprobleme`
10. `kugeln`
11. `lage-abstaende`
12. `normalverteilung`
13. `rotationskoerper`
14. `taylor-polynome`
15. `fourier-reihen`

---

## Account C: Rest von Paket 3 (13 Simulationen)

**Zweig:**
```
git fetch origin
git checkout -b pruefung/paket-3-rest origin/pruefung/paket-3-teil-4
git merge origin/main
```
**Port:** 4560 · **Protokolle:** `docs/pruefung/paket-3/<id>.md`

1. `binomialverteilung`
2. `e-funktion`
3. `koordinaten-3d`
4. `signifikanztest`
5. `skalar-vektorprodukt`
6. `umkehrfunktion`
7. `vektoren-3d`
8. `funktionenscharen`
9. `geraden-ebenen`
10. `hauptsatz`
11. `ober-untersummen`
12. `stammfunktion-grafisch`
13. `matrix-abbildungen`

**Hinweis:** Prüfer 3 hatte bei `polstellen-asymptoten` aufgehört (Zweig `pruefung/paket-3-teil-4`, noch ohne PR). Falls dort eine halbfertige Simulation liegt, zuerst sie abschließen.

---

## Nur zwei Accounts verfügbar?

Dann übernimmt Account C zusätzlich die Mathe-ab-13-Liste aus Abschnitt B (8 Simulationen, Protokolle nach `paket-1/`), und Account B macht nur die 7 aus Paket 2 und danach Physik ab Nummer 10 aus Abschnitt A, nach Absprache mit A.
