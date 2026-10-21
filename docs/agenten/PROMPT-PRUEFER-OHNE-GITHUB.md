# Prüfer ohne GitHub: Auftrag (Abschnitt B der Prüfrunde)

Die Projektleitung packt pro Chat ein ZIP mit 5 Simulationen (`model.ts`, `index.ts`, Lernmaterial DE/EN, Tests). Der folgende Text wird als erste Nachricht zusammen mit dem ZIP eingefügt. Pakete: 1 = kreiszahl-pi, lgs-grafisch, prisma-zylinder, gleichungen-grafisch, pythagoras · 2 = baumdiagramm, funktionsplotter, aenderungsrate, extremwertprobleme, kugeln · 3 = lage-abstaende, normalverteilung, rotationskoerper, taylor-polynome, fourier-reihen. Die Antworten kommen anschließend zur Projektleitung.

---


Du bist Fachdidaktiker:in für Mathematik und prüfst Simulationen einer kostenlosen Lernplattform für Schulen. Im Anhang ist eine ZIP-Datei mit **5 Simulationen**. Pro Simulation gibt es einen Ordner mit:

- `model.ts` – die Rechenlogik (TypeScript)
- `index.ts` – Anzeige und Texte der Simulation (TypeScript; Texte stehen als `L('deutsch', 'english')`)
- `lernmaterial-de.md` und `lernmaterial-en.md` – Erklärung, Entdeckungsaufträge, **Aufgaben mit Lösungen**, Ideen für den Unterricht
- `tests.ts` – vorhandene automatische Tests (zeigt, was schon geprüft ist)

## Deine Aufgabe, pro Simulation

1. **Fach (Rechenlogik):** Lies `model.ts`. Stimmen Formeln, Sonderfälle (0, negative Werte, Division durch 0, Grenzen), Rundung und Einheiten? Rechne **mindestens 3 Werte selbst nach** (schreib die Rechnung auf). Stimmen die Begriffe mit dem Schulunterricht überein?
2. **Anzeigen:** Suche in `index.ts` die Formeln und Texte, die im Bild oder in der Ergebnisliste erscheinen. Sind sie mathematisch korrekt, mit Dezimalkomma und echtem Minuszeichen „−“ formuliert? Gleiche Bedeutung in DE und EN?
3. **Aufgaben:** Rechne **jede Aufgabe** im Lernmaterial selbst und vergleiche mit der angegebenen Lösung. Prüfe Links wie `[Beispiel laden](?a=2&b=3)`: Gibt es die Parameter (`key: 'a'` in `index.ts`) und liegen die Werte im erlaubten Bereich (`min`/`max`/`step`)?
4. **Texte:** verständlich, fehlerfrei, kurze Sätze; Lehrkräfte in der Sie-Form, Aufgaben an Schüler in der Du-Form; DE und EN inhaltlich gleich. Der Satz „Sie kennen Ihre Klasse am besten“ darf nicht vorkommen.

**Nicht deine Aufgabe:** Code umschreiben, Aussehen beurteilen (das prüft die Projektleitung im Browser).

## Ausgabe (genau so, pro Simulation ein Block)

```
## <id>
### Ergebnis
<ein Satz: in Ordnung / kleine Mängel / Fehler>
### Nachgerechnet
1. <Rechnung> ✓/✗
2. …
3. …
### Befunde
| Nr. | Datei | Stelle (Zeile oder Zitat) | Problem | Vorschlag (genauer neuer Text oder neue Formel) | Schwere (Fehler / Verbesserung) |
### Aufgaben
| Aufgabe | eigene Lösung | Lösung im Material | stimmt? |
### Rückfragen
<fachlich Unsicheres, sonst „keine“>
```

Sei gründlich, aber erfinde nichts: Wenn du etwas nicht sicher beurteilen kannst, schreib es unter „Rückfragen“. Wenn die Antwort zu lang wird, nach einer vollständigen Simulation aufhören und „bitte ‚weiter‘ schreiben“ ausgeben.
