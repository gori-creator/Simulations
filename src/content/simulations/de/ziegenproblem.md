## Worum geht es?

In einer Spielshow gibt es drei Türen. Hinter einer steht ein **Auto**, hinter den beiden anderen je eine **Ziege**.

1. Du wählst eine Tür. Sie wird mit „Deine Wahl“ markiert.
2. Die Moderatorin weiß, wo das Auto steht. Sie öffnet eine **andere** Tür, hinter der eine Ziege steht.
3. Du darfst bei deiner Tür **bleiben** oder zur „anderen Tür“ **wechseln**.

Viele denken: Zwei Türen sind übrig, also ist es 50 : 50. Das stimmt aber nicht!

- **Bleiben** gewinnt nur, wenn die erste Wahl richtig war: Wahrscheinlichkeit $\frac{1}{3}$.
- **Wechseln** gewinnt genau dann, wenn die erste Wahl falsch war: Wahrscheinlichkeit $\frac{2}{3}$.

Denn war die erste Wahl falsch, bleibt nach dem Öffnen nur noch die Tür mit dem Auto übrig. Die Moderatorin darf ja keine Tür mit dem Auto öffnen.

Bei $n$ Türen öffnet die Moderatorin alle Türen bis auf deine und eine weitere. Dann gewinnt Bleiben mit $\frac{1}{n}$ und Wechseln mit $\frac{n-1}{n}$.

### Die Spielregeln sind entscheidend

Die Rechnung setzt voraus, dass die Moderatorin **immer** eine Ziegentür öffnet, **nie** deine Tür und **immer** den Wechsel anbietet. Ändert man diese Regeln, ändern sich auch die Wahrscheinlichkeiten (siehe Aufgabe 4 und 6).

### Häufigkeit und Wahrscheinlichkeit

Unter **Ergebnisse** steht, wie oft du gewonnen hast, zum Beispiel „Wechseln: 7 von 10 gewonnen (70 %)“. Das ist eine **relative Häufigkeit**. Sie hängt vom Zufall ab und ist bei jeder Serie anders. Die **Wahrscheinlichkeit** $\frac{2}{3}$ ist dagegen ein fester Wert. Bei vielen Spielen pendelt sich die relative Häufigkeit in ihrer Nähe ein (empirisches Gesetz der großen Zahlen). Im Modus **Viele Spiele simulieren** siehst du das im Diagramm: Die Kurven nähern sich den gestrichelten Linien „Wechseln: 2/3“ und „Bleiben: 1/3“.

## Ausprobieren

1. Spiele zehnmal und **bleibe** immer. Spiele dann zehnmal und **wechsle** immer. Vergleiche unter **Ergebnisse**.
2. Probiere es mit zehn Türen: Nach deiner Wahl bleiben nur zwei Türen geschlossen. Würdest du wechseln? [10 Türen](?doors=10)
3. Lass im Modus **Viele Spiele simulieren** 1000 Spiele laufen. Wo pendeln sich die Gewinnanteile ein? [Simulation](?mode=simulate)
4. Überlege zuerst: Welche Gewinnanteile erwartest du bei vier Türen? Prüfe dann mit der Simulation. [4 Türen simulieren](?mode=simulate&doors=4)

## Aufgaben

### Aufgabe 1: Baumdiagramm

Begründe mit einem Baumdiagramm, dass Wechseln mit Wahrscheinlichkeit $\frac{2}{3}$ gewinnt.

<details>
<summary>Lösung anzeigen</summary>

Erste Stufe: Die erste Wahl ist mit $\frac{1}{3}$ das Auto, mit $\frac{2}{3}$ eine Ziege.

- Erste Wahl Auto ($\frac{1}{3}$): Wechseln führt sicher zu einer Ziege.
- Erste Wahl Ziege ($\frac{2}{3}$): Die Moderatorin muss die andere Ziege zeigen. Wechseln führt sicher zum Auto.

Also $P(\text{Gewinn beim Wechseln}) = \frac{2}{3} \cdot 1 = \frac{2}{3}$.

</details>

### Aufgabe 2: Simulation auswerten

Simuliere 1000 Spiele mit drei Türen. Wie weit weichen die Gewinnanteile von $\frac{1}{3}$ und $\frac{2}{3}$ ab? Wiederhole mehrmals. [Simulation öffnen](?mode=simulate)

<details>
<summary>Lösung anzeigen</summary>

Die Gewinnanteile liegen meist innerhalb von etwa drei Prozentpunkten um $33{,}3\,\%$ bzw. $66{,}7\,\%$. Bei 1000 Spielen liegen etwa 95 % aller Serien im Bereich $\pm 1{,}96 \cdot \sqrt{\frac{1}{3} \cdot \frac{2}{3} : 1000} \approx \pm 0{,}029$, also etwa zwischen $63{,}7\,\%$ und $69{,}6\,\%$ beim Wechseln.

</details>

### Aufgabe 3: Zehn Türen

Wie groß sind die Gewinnwahrscheinlichkeiten bei zehn Türen? Warum hilft dieses Beispiel, das Ergebnis bei drei Türen zu verstehen? [10 Türen](?doors=10)

<details>
<summary>Lösung anzeigen</summary>

Bleiben: $\frac{1}{10}$, Wechseln: $\frac{9}{10}$. Die erste Wahl trifft fast nie. Die Moderatorin öffnet dann acht Ziegentüren und lässt ausgerechnet eine Tür übrig. Das ist fast immer die mit dem Auto. Bei drei Türen ist es dasselbe Prinzip, nur weniger auffällig.

</details>

### Aufgabe 4: Die Moderatorin weiß nichts (Knobelaufgabe)

Angenommen, die Moderatorin weiß **nicht**, wo das Auto steht. Sie öffnet zufällig eine der beiden anderen Türen. Zufällig steht dahinter eine Ziege. Lohnt sich das Wechseln jetzt?

<details>
<summary>Lösung anzeigen</summary>

Nein, jetzt ist es tatsächlich $\frac{1}{2}$ zu $\frac{1}{2}$. Es gibt sechs gleich wahrscheinliche Fälle (je $\frac{1}{6}$):

- erste Wahl Auto, eine der zwei Ziegentüren geöffnet (2 Fälle): Bleiben gewinnt,
- erste Wahl Ziege, die andere Ziege geöffnet (2 Fälle): Wechseln gewinnt,
- erste Wahl Ziege, das Auto geöffnet (2 Fälle): Diese scheiden aus, weil eine Ziege gezeigt wurde.

Von den 4 verbleibenden Fällen gewinnt Wechseln in 2. Das Wissen der Moderatorin macht also den Unterschied. Die Simulation spielt immer nach den ursprünglichen Regeln. Diese Variante kannst du mit drei Spielkarten nachspielen.

</details>

### Aufgabe 5: Häufigkeit oder Wahrscheinlichkeit?

Lea wechselt in 10 Spielen immer und gewinnt nur 5-mal. Sie sagt: „Wechseln bringt also nur 50 %, nicht $\frac{2}{3}$.“ Was meinst du dazu?

<details>
<summary>Lösung anzeigen</summary>

$\frac{5}{10} = 50\,\%$ ist eine relative Häufigkeit aus nur 10 Spielen. Sie schwankt stark: Bei 10 Spielen ist der Bereich aus Aufgabe 2 etwa $\pm 1{,}96 \cdot \sqrt{\frac{1}{3} \cdot \frac{2}{3} : 10} \approx \pm 0{,}29$ groß. 50 % liegt also gut im Rahmen. Höchstens 5 Gewinne bei 10 Spielen kommen beim Wechseln mit einer Wahrscheinlichkeit von etwa 21 % vor, also in ungefähr jeder fünften Serie. Erst viele Spiele zeigen zuverlässig, dass Wechseln besser ist.

</details>

### Aufgabe 6: Vier Türen, nur eine wird geöffnet (Knobelaufgabe)

Es gibt vier Türen. Nach deiner Wahl öffnet die Moderatorin nur **eine** Ziegentür. Du darfst bleiben oder zu einer der **zwei** anderen geschlossenen Türen wechseln. Berechne beide Gewinnwahrscheinlichkeiten.

<details>
<summary>Lösung anzeigen</summary>

Bleiben: $\frac{1}{4} = 25\,\%$. Wechseln: Mit $\frac{3}{4}$ war die erste Wahl falsch. Dann steht das Auto hinter einer der zwei anderen geschlossenen Türen, und du triffst es mit $\frac{1}{2}$. Also $P(\text{Gewinn beim Wechseln}) = \frac{3}{4} \cdot \frac{1}{2} = \frac{3}{8} = 37{,}5\,\%$. Wechseln lohnt sich auch hier, aber weniger als in der Simulation. Dort bleibt nur eine andere Tür übrig, und Wechseln gewinnt mit $\frac{3}{4}$.

</details>

## Ideen für den Unterricht

- **Einsatz:** Mittelstufe (mehrstufige Zufallsexperimente, Simulationen). Gut als Einstieg: Lassen Sie die Klasse vorher abstimmen, ob sie wechseln würde.
- **Spielmodus:** Die Türen lassen sich direkt antippen, auch am Smartboard. Jede Gruppe kann zehn Spiele mit „Bleiben“ und zehn mit „Wechseln“ machen. Sammeln Sie danach die Ergebnisse der ganzen Klasse.
- **Simulationsmodus:** Tausende Spiele laufen in Sekunden. Hier lässt sich gut über den Unterschied zwischen relativer Häufigkeit und Wahrscheinlichkeit sprechen (Aufgabe 5).
- **Zum Begreifen:** Mit zehn Türen wird das Ergebnis für viele sofort einleuchtend (Aufgabe 3).
- **Häufige Stolpersteine:**
  - „Zwei Türen übrig, also 50 : 50.“ Die Moderatorin wählt nicht zufällig.
  - Die Bedeutung der Spielregeln wird übersehen (Aufgabe 4 und 6).
- **Historisches:** Das Problem wurde 1990 durch eine Kolumne von Marilyn vos Savant berühmt. Selbst viele Fachleute hielten die richtige Lösung zunächst für falsch.
