---
description: Interaktive Simulation zum Ziegenproblem (Monty-Hall-Problem) – selbst spielen oder tausende Spiele simulieren und herausfinden, ob sich Wechseln lohnt.
---

## Worum geht es?

In einer Spielshow gibt es drei Türen. Hinter einer steht ein **Auto**, hinter den beiden anderen je eine **Ziege**.

1. Du wählst eine Tür.
2. Die Moderatorin, die weiß, wo das Auto steht, öffnet eine **andere** Tür, hinter der eine Ziege steht.
3. Du darfst bei deiner Tür **bleiben** oder zur anderen geschlossenen Tür **wechseln**.

Viele denken: Zwei Türen sind übrig, also ist es 50 : 50. Das stimmt aber nicht!

- **Bleiben** gewinnt nur, wenn die erste Wahl richtig war: Wahrscheinlichkeit $\frac{1}{3}$.
- **Wechseln** gewinnt genau dann, wenn die erste Wahl falsch war: Wahrscheinlichkeit $\frac{2}{3}$.

Denn war die erste Wahl falsch, bleibt nach dem Öffnen nur noch die Tür mit dem Auto übrig – die Moderatorin kann ja keine Tür mit dem Auto öffnen.

Bei $n$ Türen öffnet die Moderatorin alle Türen bis auf deine und eine weitere. Dann gewinnt Bleiben mit $\frac{1}{n}$ und Wechseln mit $\frac{n-1}{n}$.

### Die Spielregeln sind entscheidend

Die Rechnung setzt voraus, dass die Moderatorin **immer** eine Ziegentür öffnet, **nie** deine Tür und **immer** den Wechsel anbietet. Ändert man diese Regeln, ändern sich auch die Wahrscheinlichkeiten (siehe Aufgabe 4).

## Ausprobieren

1. Spiele zehnmal und **bleibe** immer. Spiele dann zehnmal und **wechsle** immer. Vergleiche unter **Ergebnisse**.
2. Probiere es mit zehn Türen: Nach deiner Wahl bleiben nur zwei Türen geschlossen. Würdest du wechseln? [10 Türen](?doors=10)
3. Lass im Modus **Viele Spiele simulieren** 1000 Spiele laufen. Wo pendeln sich die Gewinnanteile ein? [Simulation](?mode=simulate)

## Aufgaben

### Aufgabe 1: Baumdiagramm

Begründe mit einem Baumdiagramm, dass Wechseln mit Wahrscheinlichkeit $\frac{2}{3}$ gewinnt.

<details>
<summary>Lösung anzeigen</summary>

Erste Stufe: Die erste Wahl ist mit $\frac{1}{3}$ das Auto, mit $\frac{2}{3}$ eine Ziege.

- Erste Wahl Auto ($\frac{1}{3}$): Wechseln führt sicher zu einer Ziege.
- Erste Wahl Ziege ($\frac{2}{3}$): Die Moderatorin muss die andere Ziege zeigen – Wechseln führt sicher zum Auto.

Also $P(\text{Gewinn beim Wechseln}) = \frac{2}{3} \cdot 1 = \frac{2}{3}$.

</details>

### Aufgabe 2: Simulation auswerten

Simuliere 1000 Spiele mit drei Türen. Wie weit weichen die Gewinnanteile von $\frac{1}{3}$ und $\frac{2}{3}$ ab? Wiederhole mehrmals.

<details>
<summary>Lösung anzeigen</summary>

Die Gewinnanteile liegen meist innerhalb von etwa drei Prozentpunkten um $33{,}3\,\%$ bzw. $66{,}7\,\%$. Bei 1000 Spielen ist die typische Schwankung (95 %) etwa $\pm 1{,}96 \cdot \sqrt{\frac{1}{3} \cdot \frac{2}{3} / 1000} \approx \pm 0{,}03$. [Simulation öffnen](?mode=simulate)

</details>

### Aufgabe 3: Zehn Türen

Wie groß sind die Gewinnwahrscheinlichkeiten bei zehn Türen? Warum hilft dieses Beispiel, das Ergebnis bei drei Türen zu verstehen?

<details>
<summary>Lösung anzeigen</summary>

Bleiben: $\frac{1}{10}$, Wechseln: $\frac{9}{10}$. Die erste Wahl trifft fast nie. Die Moderatorin öffnet dann acht Ziegentüren und lässt ausgerechnet eine Tür übrig – fast immer die mit dem Auto. Bei drei Türen ist es dasselbe Prinzip, nur weniger auffällig. [10 Türen](?doors=10)

</details>

### Aufgabe 4: Andere Regeln (Knobelaufgabe)

Angenommen, die Moderatorin weiß **nicht**, wo das Auto steht, und öffnet zufällig eine der beiden anderen Türen. Zufällig steht dahinter eine Ziege. Lohnt sich das Wechseln jetzt?

<details>
<summary>Lösung anzeigen</summary>

Nein, jetzt ist es tatsächlich $\frac{1}{2}$ zu $\frac{1}{2}$. Mögliche gleichwahrscheinliche Fälle (je $\frac{1}{6}$): erste Wahl Auto und eine von zwei Ziegentüren geöffnet (2 Fälle), erste Wahl Ziege und die andere Ziege geöffnet (2 Fälle), erste Wahl Ziege und das Auto geöffnet (2 Fälle – diese scheiden aus, weil eine Ziege gezeigt wurde). Von den 4 verbleibenden Fällen gewinnt Wechseln in 2. Die Information der Moderatorin macht also den Unterschied.

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Bayern Jahrgangsstufe 10 (mehrstufige Zufallsexperimente, Simulationen). Gut als Einstieg: Die Klasse stimmt vorher ab, ob sie wechseln würde.
- **Spielmodus:** Türen können direkt angetippt werden – auch am Smartboard. Im Simulationsmodus laufen tausende Spiele in Sekunden.
- **Bilder:** Bühne, Türen, Ziege und Auto werden gezeichnet; optional können Bilder ergänzt werden (siehe `docs/BILDER.md`).
- **Typische Fehlvorstellungen:**
  - „Zwei Türen übrig, also 50 : 50.“ – Die Moderatorin wählt nicht zufällig.
  - Die Bedeutung der Spielregeln wird übersehen (Aufgabe 4).
- **Historisches:** Das Problem wurde 1990 durch eine Kolumne von Marilyn vos Savant berühmt; selbst viele Fachleute hielten die richtige Lösung zunächst für falsch.
