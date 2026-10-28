---
description: "Interaktive Simulation für die Oberstufe: das Integral als Gesamtänderung – aus der Geschwindigkeit den Weg, aus der Zuflussrate die Füllmenge rekonstruieren, mit laufender Zeit, Rechtecksummen (links, rechts, Mitte), gestapelten Streifen, Fehler beim Verdoppeln, Vor- und Rückwärtsfahrt und einer selbst gezogenen Rate."
---

## Worum geht es?

Oft kennt man nicht eine Größe selbst, sondern wie schnell sie sich ändert: die **Geschwindigkeit** eines Autos, die **Zuflussrate** in einen Tank. Wie groß ist dann die **Gesamtänderung**?

Ist die Rate konstant, rechnet man „Rate mal Zeit“: $20\,\tfrac{\text{m}}{\text{s}} \cdot 30\,\text{s} = 600\,\text{m}$ – das ist die Fläche eines Rechtecks unter dem Graphen. Auch die Einheit passt: $\tfrac{\text{m}}{\text{s}} \cdot \text{s} = \text{m}$ bzw. $\tfrac{\text{L}}{\text{min}} \cdot \text{min} = \text{L}$. Ändert sich die Rate, zerlegt man die Zeit in $n$ Streifen der Breite $\Delta t$ und addiert $r(t_i) \cdot \Delta t$. Die Stelle $t_i$ liegt am **linken Rand**, am **rechten Rand** oder in der **Mitte** des Streifens. Für $n \to \infty$ wird daraus das Integral:

$$B(t) = B(0) + \int_0^t r(u)\,du.$$

Die **Fläche unter dem Graphen der Änderungsrate** ist die Gesamtänderung des Bestands. Flächen **unterhalb** der Zeitachse (Abfluss, Rückwärtsfahrt) zählen **negativ** – der Bestand nimmt ab. Wer alle Flächen positiv zählt, berechnet $\int_0^t |r(u)|\,du$: bei einer Fahrt den **insgesamt zurückgelegten Weg** (Wegzähler), beim Tank die insgesamt geflossene Wassermenge.

**Rate und Bestand hängen zusammen:** Die Steigung von $B$ ist die Rate, $B'(t) = r(t)$. Wechselt $r$ das Vorzeichen von $+$ nach $-$, hat der Bestand ein **Maximum**, von $-$ nach $+$ ein **Minimum**.

## Ausprobieren

1. [Autofahrt](?sit=car&t=25): Drücke „Ablauf abspielen“. Wann wächst die Fläche am schnellsten – und wann ist der Weg-Graph am steilsten?
2. [Rechtecke](?sit=car&t=25&n=5): Drücke „Rechtecke stapeln“: Aus jedem Rechteck oben wird eine Stufe unten. Drücke dann mehrmals „Streifen verdoppeln“ und beobachte die Karte „Fehler beim Verdoppeln“.
3. [Links, rechts, Mitte](?sit=tank&t=20&n=2&rule=l): Stelle die Höhe der Rechtecke auf „rechter Rand“ und „Mitte“. Warum ist die Mittelsumme hier exakt?
4. [Wassertank](?sit=tank&t=30&v0=30): Ab wann fließt Wasser ab? Wann ist der Tank am vollsten – und was macht die Rate dort?
5. [Vor und zurück](?sit=back&t=40): Vergleiche Position und Wegzähler. Wo sieht man im Diagramm den Unterschied?
6. [Eigene Zuflussrate](?sit=own&t=40&v0=30): Ziehe die fünf Punkte. Erzeuge eine Rate, bei der der Tank am Ende genauso voll ist wie am Anfang.
7. [Radfahrt](?sit=bike&t=90&n=32&rule=m): Warum steigt der Weg immer, obwohl die Geschwindigkeit schwankt?

## Aufgaben

### Aufgabe 1: Weg nach 25 Sekunden

Das Auto beschleunigt $10\,\text{s}$ gleichmäßig auf $20\,\tfrac{\text{m}}{\text{s}}$ und fährt dann konstant. Wie weit ist es nach $25\,\text{s}$ gefahren? [Aufgabe laden](?sit=car&t=25&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Dreieck bis $10\,\text{s}$: $\frac{1}{2} \cdot 10\,\text{s} \cdot 20\,\tfrac{\text{m}}{\text{s}} = 100\,\text{m}$; dann $15\,\text{s} \cdot 20\,\tfrac{\text{m}}{\text{s}} = 300\,\text{m}$. Zusammen $s(25) = 400\,\text{m}$. [In der Simulation zeigen](?sit=car&t=25)

</details>

### Aufgabe 2: Drei Rechtecksummen

Schätze den Weg in den ersten $10\,\text{s}$ mit $2$ Streifen ($\Delta t = 5\,\text{s}$): einmal mit der Höhe am linken Rand, am rechten Rand und in der Mitte. [Aufgabe laden](?sit=car&t=10&n=2&rule=l&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Es gilt $v(t) = 2t$. Links: $5 \cdot (0 + 10) = 50\,\text{m}$, rechts: $5 \cdot (10 + 20) = 150\,\text{m}$, Mitte: $5 \cdot (5 + 15) = 100\,\text{m}$. Exakt sind es $100\,\text{m}$: Die Mittelsumme trifft genau, weil die Rate eine Gerade ist (die Dreiecke oberhalb und unterhalb gleichen sich aus). Links und rechts schließen den exakten Wert ein, weil $v$ wächst. [In der Simulation zeigen](?sit=car&t=10&n=2&rule=m)

</details>

### Aufgabe 3: Wassertank

Die Zuflussrate ist $r(t) = 4 - 0{,}2t$ (in L/min), zu Beginn sind $30\,\text{L}$ im Tank. Wie viel Wasser ist nach $30$ Minuten im Tank? Wann ist er am vollsten? [Aufgabe laden](?sit=tank&t=30&v0=30&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$V(30) = 30 + \int_0^{30}(4 - 0{,}2u)\,du = 30 + \left[4u - 0{,}1u^2\right]_0^{30} = 30 + 30 = 60\,\text{L}$. Am vollsten, wo $r$ von $+$ nach $-$ wechselt: $r(t) = 0 \iff t = 20$, also $V(20) = 30 + 40 = 70\,\text{L}$. Die Fläche besteht aus $+40\,\text{L}$ (Zufluss) und $-10\,\text{L}$ (Abfluss). [In der Simulation zeigen](?sit=tank&t=30&v0=30)

</details>

### Aufgabe 4: Vor und zurück

Ein Auto fährt $20\,\text{s}$ vorwärts (anfahren in $5\,\text{s}$ auf $4\,\tfrac{\text{m}}{\text{s}}$, $10\,\text{s}$ konstant, $5\,\text{s}$ bremsen) und dann $20\,\text{s}$ rückwärts (genauso, aber mit höchstens $2\,\tfrac{\text{m}}{\text{s}}$). Wo steht es nach $40\,\text{s}$, und wie viele Meter zeigt der Wegzähler? [Aufgabe laden](?sit=back&t=40&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Vorwärts: Trapez $10 + 40 + 10 = 60\,\text{m}$. Rückwärts: $5 + 20 + 5 = 30\,\text{m}$, also Fläche $-30\,\text{m}$. Gesamtänderung $\int_0^{40} v\,dt = 60 - 30 = 30\,\text{m}$: Das Auto steht $30\,\text{m}$ vor dem Start. Der Wegzähler zeigt $\int_0^{40} |v|\,dt = 60 + 30 = 90\,\text{m}$. Am weitesten entfernt ist es bei $t = 20\,\text{s}$ ($60\,\text{m}$). [In der Simulation zeigen](?sit=back&t=40)

</details>

### Aufgabe 5: Fehler halbieren

Für den Tank bis $t = 20$ (exakt $40\,\text{L}$ Zufluss) ergibt die linke Summe mit $4$ Streifen $50\,\text{L}$. Wie groß ist der Fehler mit $8$ und mit $16$ Streifen? [Aufgabe laden](?sit=tank&t=20&n=4&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Fehler $10\,\text{L}$, dann $5\,\text{L}$, dann $2{,}5\,\text{L}$. Bei einer geradlinigen Rate halbiert sich der Fehler genau: Jeder Streifen enthält ein Dreieck zu viel. Halbiert man $\Delta t$, haben diese Dreiecke halbe Breite und halbe Höhe, also ein Viertel der Fläche – es gibt aber doppelt so viele. [In der Simulation zeigen](?sit=tank&t=20&n=16)

</details>

### Aufgabe 6: Maximum und Minimum

Die Zuflussrate verläuft stückweise linear (als Streckenzug) durch $(0 \mid 2)$, $(10 \mid 4)$, $(20 \mid 0)$, $(30 \mid -3)$ und $(40 \mid 1)$ (Zeit in min, Rate in L/min); am Anfang sind $30\,\text{L}$ im Tank. Wann ist der Tank am vollsten, wann zwischendurch am leersten? Wie viel ist am Ende drin? [Aufgabe laden](?sit=own&t=40&v0=30&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Trapez- und Dreiecksflächen: $0$–$10$: $30\,\text{L}$, $10$–$20$: $20\,\text{L}$, $20$–$30$: $-15\,\text{L}$. Zwischen $30$ und $40$ wechselt $r$ bei $t = 37{,}5$ von $-$ nach $+$: $-11{,}25\,\text{L}$ und $+1{,}25\,\text{L}$. Maximum bei $t = 20$: $V = 80\,\text{L}$; Minimum bei $t = 37{,}5$: $V = 53{,}75\,\text{L}$; am Ende $V(40) = 55\,\text{L}$. [In der Simulation zeigen](?sit=own&t=40&v0=30)

</details>

## Ideen für den Unterricht

- **Einsatz:** Oberstufe, Integralrechnung: Rekonstruktion eines Bestands aus der Änderungsrate, Flächeninhalt und bestimmtes Integral. Geeignet als Einstieg (Fläche = Gesamtänderung mit der laufenden Zeit), zum Üben (verdeckte Werte) und zur Vertiefung (Fehlerordnung der Rechtecksummen).
- **Vom Rechteck zum Integral:** Mit „Rechtecke stapeln“ und „Streifen verdoppeln“ lässt sich der Grenzübergang $n \to \infty$ vorführen; die Fehler-Karte macht ihn messbar.
- **Einheiten als Kontrolle:** „Rate mal Zeit“ ergibt immer die Einheit des Bestands – eine schöne Probe für eigene Rechnungen.
- **Physik-Bezug:** $s(t)$ aus $v(t)$ wie im $t$-$v$-Diagramm der Mechanik; „vor und zurück“ trennt Ortsänderung und zurückgelegten Weg.
- **Partnerarbeit:** Eine Person zieht bei der eigenen Rate fünf Punkte und nennt $V(0)$, die andere skizziert den Bestand – dann aufdecken.
- **Häufige Stolpersteine:**
  - Der Funktionswert der Rate wird als Bestand gelesen („20 m/s, also 20 m“).
  - Negative Raten werden als positive Flächen gezählt – oder der zurückgelegte Weg mit der Gesamtänderung verwechselt.
  - Das Maximum des Bestands wird beim Maximum der Rate gesucht statt bei ihrem Vorzeichenwechsel.
  - Der Anfangsbestand $B(0)$ wird vergessen.
