## Worum geht es?

Wirft man einen Würfel $n$-mal und erhält dabei $k$-mal eine Sechs, dann ist

- $k$ die **absolute Häufigkeit** und
- $h_n = \dfrac{k}{n}$ die **relative Häufigkeit** der Sechs.

Beispiel: $17$ Sechsen bei $100$ Würfen ergeben $h_{100} = \dfrac{17}{100} = 0{,}17 = 17\,\%$.

Bei wenigen Würfen schwankt $h_n$ stark. Je öfter man wirft, desto mehr **stabilisiert** sich die relative Häufigkeit – und zwar in der Nähe der **Wahrscheinlichkeit** $p$ (Münze: $p = 0{,}5$, Würfel: $p = \frac{1}{6} \approx 0{,}167$). Das nennt man das **empirische Gesetz der großen Zahlen**.

Eine Garantie gibt es dabei nicht: Meistens liegt $h_n$ bei mehr Würfen näher an $p$, aber nicht immer. Auch nach vielen Würfen kann $h_n$ wieder etwas weiter weg sein – große Abweichungen werden nur immer unwahrscheinlicher.

Umgekehrt nutzt man das, um unbekannte Wahrscheinlichkeiten zu **schätzen**: Beim Reißnagel kann man $p$ für „Spitze oben“ nicht ausrechnen – aber nach sehr vielen Würfen ist $h_n$ ein guter Schätzwert für $p$.

**Wichtig:** Der Zufall „gleicht nichts aus“. Ein Würfel hat kein Gedächtnis – nach fünf Würfen ohne Sechs ist die Sechs beim nächsten Wurf nicht wahrscheinlicher. Die relative Häufigkeit nähert sich $p$, weil sich frühe Ausreißer auf immer mehr Würfe verteilen.

### Der Trichter

Der grüne Trichter zeigt den Bereich $p \pm 1{,}96 \cdot \sqrt{\dfrac{p(1-p)}{n}}$. In ihm liegt die relative Häufigkeit nach $n$ Würfen bei etwa 95 % aller Versuchsreihen. Er wird mit wachsendem $n$ immer enger – für viermal so viele Würfe halb so breit.

## Ausprobieren

1. Wirf den Würfel einzeln und beobachte, wie stark die Kurve am Anfang springt. Warum ist das so?
2. Wirf 1000-mal oder drücke **Abspielen**. Wo pendelt sich die Kurve ein?
3. Vergleiche mit der Münze: Ist die Kurve schneller „ruhig“? [Münze](?exp=coin)
4. Schätze die Wahrscheinlichkeit beim Reißnagel, ohne sie vorher anzuzeigen. [Reißnagel](?exp=tack&showP=0)
5. Schalte die logarithmische Achse aus. Was siehst du dann besser, was schlechter? [Lineare Achse](?logScale=0)
6. **20 Versuchsreihen:** Wie in einer Klasse werfen 20 Personen gleichzeitig. Am Anfang liegen die Kurven weit auseinander, mit wachsendem n rücken sie zusammen. Wie viele bleiben im Trichter? [Münze](?mode=many&exp=coin) · [Würfel](?mode=many&exp=die)
7. **Üben:** Wie oft erwartest du ein Ergebnis? Wie groß ist die Wahrscheinlichkeit beim Reißnagel ungefähr? [Üben](?mode=quiz&q=1)

## Aufgaben

### Aufgabe 1: Erwartung

Wie oft erwartest du ungefähr eine Sechs, wenn du $600$-mal würfelst? Ist es verdächtig, wenn es nur $92$ Sechsen sind?

<details>
<summary>Lösung anzeigen</summary>

Erwartet sind etwa $600 \cdot \frac{1}{6} = 100$ Sechsen. $92$ Sechsen sind **nicht** verdächtig: Das ist eine relative Häufigkeit von etwa $0{,}153$. Der Trichter reicht bei $n = 600$ ungefähr von $0{,}137$ bis $0{,}196$ – $0{,}153$ liegt also im üblichen Schwankungsbereich.

</details>

### Aufgabe 2: Reißnagel schätzen

Wirf den Reißnagel 1000-mal, ohne die Wahrscheinlichkeit einzublenden. Gib einen Schätzwert für $p$ („Spitze oben“) an und vergleiche dann mit dem eingestellten Wert (schalte dazu „Wahrscheinlichkeit p einzeichnen“ ein). [Aufgabe laden](?exp=tack&showP=0&pTack=0.6&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Der Schätzwert ist die relative Häufigkeit nach 1000 Würfen. Eingestellt ist $p = 0{,}6$; nach 1000 Würfen liegt $h$ meist zwischen etwa $0{,}57$ und $0{,}63$.

</details>

### Aufgabe 3: Hat der Würfel ein Gedächtnis?

Lena sagt: „Ich habe fünfmal keine Sechs gewürfelt, jetzt muss bald eine kommen!“ Nimm Stellung.

<details>
<summary>Lösung anzeigen</summary>

Lena irrt (das ist der sogenannte **Spielerfehlschluss**). Die Würfe sind unabhängig – die Wahrscheinlichkeit für eine Sechs ist bei jedem Wurf $\frac{1}{6}$, egal was vorher geschah. Dass sich die relative Häufigkeit $p$ nähert, liegt nicht an einem Ausgleich, sondern daran, dass frühere Abweichungen bei großem $n$ kaum noch ins Gewicht fallen.

</details>

### Aufgabe 4: Absolute und relative Abweichung

Beobachte bei vielen Würfen die Abweichung der Anzahl $|k - n \cdot p|$ und die Abweichung der relativen Häufigkeit $|h_n - p|$. Beide stehen unter **Ergebnisse**. Was fällt auf?

<details>
<summary>Lösung anzeigen</summary>

Die Abweichung $|h_n - p|$ wird typischerweise immer kleiner. Die Abweichung der Anzahl $|k - n \cdot p|$ wird dagegen typischerweise sogar größer (etwa wie $\sqrt{n}$). Das Gesetz der großen Zahlen sagt also nicht, dass sich die Anzahlen „ausgleichen“.

</details>

### Aufgabe 5: Erwartung und Wirklichkeit

Ein Würfel wird $600$-mal geworfen. Wie oft erwartest du eine Sechs? Fällt die Sechs genau so oft? In welchem Bereich liegt die Anzahl ungefähr in 95 % aller Versuchsreihen?

<details>
<summary>Lösung anzeigen</summary>

Erwartet: $n \cdot p = 600 \cdot \frac{1}{6} = 100$. Meist ist es nicht genau $100$. Der Trichter für die relative Häufigkeit hat die halbe Breite $1{,}96 \cdot \sqrt{\frac{\frac{1}{6} \cdot \frac{5}{6}}{600}} \approx 0{,}030$. Für die Anzahl heißt das etwa $100 \pm 600 \cdot 0{,}030 = 100 \pm 18$, also zwischen etwa $82$ und $118$. [20 Versuchsreihen](?mode=many&exp=die)

</details>

## Ideen für den Unterricht

- **Einsatz:** Etwa Klasse 6 bis 8 (Laplace-Experimente: relative Häufigkeit und empirisches Gesetz der großen Zahlen). Der Reißnagel ist das klassische Beispiel für eine Wahrscheinlichkeit, die man nur experimentell bestimmen kann.
- **Bilder:** Würfel, Münze, Reißnagel und Tisch werden als Fotos gezeigt; fehlt ein Bild, zeichnet die Simulation eine Ersatzgrafik.
- **Ganze Klasse:** Der Teil „20 Versuchsreihen“ zeigt, was passiert, wenn jede Person in der Klasse eine eigene Reihe wirft. Gut für die Frage, warum einzelne Ergebnisse stark streuen, der Durchschnitt aber nicht.
- **Üben:** Ungerade Aufgaben fragen die erwartete Anzahl $n \cdot p$, gerade das Schätzen einer Wahrscheinlichkeit aus einer Versuchsreihe (der Verlauf ist dazu eingezeichnet).
- **Häufige Stolpersteine:**
  - Spielerfehlschluss („jetzt ist die Sechs dran“).
  - „Bei 600 Würfen kommen genau 100 Sechsen.“
  - Die Wahrscheinlichkeit wird mit der relativen Häufigkeit einer kurzen Versuchsreihe gleichgesetzt.
- **Trichter:** Die Grenzen beruhen auf der Normalverteilungsnäherung und sind für kleine $n$ nur grob – in der Unterstufe genügt die Deutung „fast alle Versuchsreihen liegen darin“.
