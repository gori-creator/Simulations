---
description: Interaktive Simulation zum empirischen Gesetz der großen Zahlen – Münze, Würfel oder Reißnagel tausendfach werfen und die relative Häufigkeit beobachten.
---

## Worum geht es?

Wirft man einen Würfel $n$-mal und erhält dabei $k$-mal eine Sechs, dann ist

- $k$ die **absolute Häufigkeit** und
- $h_n = \dfrac{k}{n}$ die **relative Häufigkeit** der Sechs.

Bei wenigen Würfen schwankt $h_n$ stark. Je öfter man wirft, desto mehr **stabilisiert** sich die relative Häufigkeit – und zwar in der Nähe der **Wahrscheinlichkeit** $p$. Das nennt man das **empirische Gesetz der großen Zahlen**.

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

## Aufgaben

### Aufgabe 1: Erwartung

Wie oft erwartest du ungefähr eine Sechs, wenn du $600$-mal würfelst? Ist es verdächtig, wenn es nur $92$ Sechsen sind?

<details>
<summary>Lösung anzeigen</summary>

Erwartet sind etwa $600 \cdot \frac{1}{6} = 100$ Sechsen. $92$ Sechsen sind **nicht** verdächtig: Das ist eine relative Häufigkeit von etwa $0{,}153$. Der Trichter reicht bei $n = 600$ ungefähr von $0{,}137$ bis $0{,}196$ – $0{,}153$ liegt also im üblichen Schwankungsbereich.

</details>

### Aufgabe 2: Reißnagel schätzen

Wirf den Reißnagel 1000-mal, ohne die Wahrscheinlichkeit einzublenden. Gib einen Schätzwert für $p$ („Spitze oben“) an und vergleiche dann mit dem eingestellten Wert. [Aufgabe laden](?exp=tack&showP=0&pTack=0.6&_hide=1)

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

Beobachte bei vielen Würfen die Differenz $k - n \cdot p$ (absolute Abweichung) und $h_n - p$ (relative Abweichung). Was fällt auf?

<details>
<summary>Lösung anzeigen</summary>

Die **relative** Abweichung wird typischerweise immer kleiner. Die **absolute** Abweichung $k - n \cdot p$ wird dagegen typischerweise sogar größer (etwa proportional zu $\sqrt{n}$). Das Gesetz der großen Zahlen sagt also nicht, dass sich die Anzahlen „ausgleichen“.

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Bayern Jahrgangsstufe 8 (Laplace-Experimente: relative Häufigkeit und empirisches Gesetz der großen Zahlen); in anderen Ländern teils schon ab Klasse 6. Der Reißnagel ist das klassische Beispiel für eine Wahrscheinlichkeit, die man nur experimentell bestimmen kann.
- **Bilder:** Würfel, Münze und Reißnagel werden gezeichnet; optional können Fotos ergänzt werden (siehe `docs/BILDER.md`).
- **Typische Fehlvorstellungen:**
  - Spielerfehlschluss („jetzt ist die Sechs dran“).
  - „Bei 600 Würfen kommen genau 100 Sechsen.“
  - Die Wahrscheinlichkeit wird mit der relativen Häufigkeit einer kurzen Versuchsreihe gleichgesetzt.
- **Trichter:** Die Grenzen beruhen auf der Normalverteilungsnäherung und sind für kleine $n$ nur grob – in der Unterstufe genügt die Deutung „fast alle Versuchsreihen liegen darin“.
