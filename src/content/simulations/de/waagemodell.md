---
description: "Interaktives Waagemodell für lineare Gleichungen: x-Päckchen und Gewichtsstücke auf einer Balkenwaage, Äquivalenzumformungen als Handlungen, Umformungskette, Probe und die Grenzen des Modells."
---

## Worum geht es?

Eine **Gleichung** wie $3x + 2 = x + 8$ kann man sich als **Balkenwaage im Gleichgewicht** vorstellen: Links liegen drei Päckchen, die jeweils $x$ wiegen, und zwei Gewichtsstücke zu je $1$, rechts ein Päckchen und acht Gewichtsstücke. Beide Seiten sind gleich schwer – das bedeutet das Gleichheitszeichen.

Gesucht ist das Gewicht $x$ eines Päckchens. Man verändert die Waage so, dass sie **im Gleichgewicht bleibt**, bis auf einer Seite nur noch ein Päckchen liegt:

$$
\begin{aligned}
3x + 2 &= x + 8 &&\mid -x\\
2x + 2 &= 8 &&\mid -2\\
2x &= 6 &&\mid :2\\
x &= 3
\end{aligned}
$$

Solche Umformungen, die die Lösungsmenge nicht verändern, heißen **Äquivalenzumformungen**:

- auf **beiden Seiten dieselbe Zahl oder denselben Term** addieren oder subtrahieren,
- **beide Seiten** mit derselben Zahl multiplizieren oder durch dieselbe Zahl (außer $0$) dividieren.

Am Rand notiert man, was man auf beiden Seiten tut, z. B. $\mid -x$. Das Ergebnis schreibt man als **Lösungsmenge** $L = \{3\}$. Mit der **Probe** in der Ausgangsgleichung prüft man es: $3 \cdot 3 + 2 = 11$ und $3 + 8 = 11$.

**Sonderfälle:** Fällt $x$ ganz heraus, bleibt eine Aussage ohne Variable übrig. Ist sie falsch (z. B. $3 = 5$), hat die Gleichung **keine Lösung**: $L = \{\,\}$. Ist sie wahr (z. B. $4 = 4$), ist **jede Zahl** Lösung: $L = \mathbb{Q}$.

**Grenzen des Modells:** Gewichte sind immer positiv. Gleichungen mit negativer Lösung (z. B. $x + 9 = 3x + 13$, also $x = -2$) oder mit Minuszeichen in den Termen lassen sich mit einer Waage nicht darstellen. Auch $2x = 3$ lässt sich im Modell nicht weiter teilen – rechnerisch ist $x = 1{,}5$.

## Ausprobieren

1. Tippe **nur links** auf ein Päckchen. Was passiert mit der Waage? Wie stellst du das Gleichgewicht wieder her?
2. Löse $3x + 2 = x + 8$ mit den Knöpfen **Beide Seiten − x**, **Beide Seiten − 1** und **Beide Seiten : 2**. Beobachte die Umformungskette rechts.
3. Öffne die Päckchen: Wie schwer ist eines? Stimmt die Probe?
4. Teile beide Seiten von [4x + 2 = 2x + 6](?a=4&b=2&c=2&d=6) durch 2. Warum bleibt die Waage im Gleichgewicht?
5. [Keine Lösung?](?a=2&b=3&c=2&d=5) Nimm auf beiden Seiten alle Päckchen weg. Was bleibt übrig?
6. [Grenze des Modells](?a=1&b=9&c=3&d=13): Warum kann die Waage hier nie im Gleichgewicht sein?
7. Drücke **Neue Gleichung** für eine zufällige Aufgabe.

## Aufgaben

### Aufgabe 1: Am Waagemodell lösen

[Aufgabe laden](?a=5&b=2&c=2&d=14&_hide=1) Löse $5x + 2 = 2x + 14$. Schreibe die Umformungskette auf und mache die Probe.

<details>
<summary>Lösung anzeigen</summary>

$$
\begin{aligned}
5x + 2 &= 2x + 14 &&\mid -2x\\
3x + 2 &= 14 &&\mid -2\\
3x &= 12 &&\mid :3\\
x &= 4
\end{aligned}
$$

$L = \{4\}$. Probe: $5 \cdot 4 + 2 = 22$ und $2 \cdot 4 + 14 = 22$.

</details>

### Aufgabe 2: Das x steht rechts

[Aufgabe laden](?a=1&b=12&c=4&d=3&_hide=1) Löse $x + 12 = 4x + 3$.

<details>
<summary>Lösung anzeigen</summary>

$x + 12 = 4x + 3 \mid -x$ ergibt $12 = 3x + 3 \mid -3$, also $9 = 3x \mid :3$ und $3 = x$. $L = \{3\}$.

</details>

### Aufgabe 3: Vom Bild zur Gleichung

Links liegen 4 Päckchen und 1 Gewichtsstück, rechts 2 Päckchen und 9 Gewichtsstücke; die Waage ist im Gleichgewicht. Stelle die Gleichung auf und bestimme das Gewicht eines Päckchens.

<details>
<summary>Lösung anzeigen</summary>

$4x + 1 = 2x + 9 \mid -2x \Rightarrow 2x + 1 = 9 \mid -1 \Rightarrow 2x = 8 \mid :2 \Rightarrow x = 4$. [In der Simulation zeigen](?a=4&b=1&c=2&d=9)

</details>

### Aufgabe 4: Fehler finden

Max rechnet: $3x + 4 = x + 10 \mid -x$ ergibt $3x + 4 = 10$. Was hat er falsch gemacht? Was zeigt die Waage? [Ausgangsgleichung laden](?a=3&b=4&c=1&d=10)

<details>
<summary>Lösung anzeigen</summary>

Max hat nur rechts ein $x$ weggenommen – die Waage kippt. Richtig ist $2x + 4 = 10 \mid -4 \Rightarrow 2x = 6 \mid :2 \Rightarrow x = 3$.

</details>

### Aufgabe 5: Grenzen des Modells

Löse rechnerisch: (a) $2x + 7 = 4x + 3$ und (b) $x + 6 = 3x + 10$. Welche der beiden Gleichungen lässt sich am Waagemodell lösen?

<details>
<summary>Lösung anzeigen</summary>

(a) $2x + 7 = 4x + 3 \mid -2x \Rightarrow 7 = 2x + 3 \mid -3 \Rightarrow 4 = 2x \mid :2 \Rightarrow x = 2$. Das klappt auch an der [Waage](?a=2&b=7&c=4&d=3).

(b) $x + 6 = 3x + 10 \mid -x \Rightarrow 6 = 2x + 10 \mid -10 \Rightarrow -4 = 2x \mid :2 \Rightarrow x = -2$. Ein Päckchen mit negativem Gewicht gibt es nicht; schon der Schritt $\mid -10$ ist an der Waage unmöglich, weil links nur 6 Gewichtsstücke liegen. [Waage zeigen](?a=1&b=6&c=3&d=10)

</details>

### Aufgabe 6: Sonderfälle

Bestimme die Lösungsmenge: (a) $3x + 5 = 3x + 2$, (b) $2x + 4 = 2x + 4$.

<details>
<summary>Lösung anzeigen</summary>

(a) $\mid -3x$ ergibt $5 = 2$ – falsch, also $L = \{\,\}$. Die [Waage](?a=3&b=5&c=3&d=2) kippt für jedes Päckchengewicht nach links.

(b) $\mid -2x$ ergibt $4 = 4$ – immer wahr, also $L = \mathbb{Q}$.

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Bayern Jahrgangsstufe 7, Lernbereich 3 (Lineare Gleichungen: Gleichungen aufstellen und durch Äquivalenzumformungen lösen) – als anschaulicher Einstieg, bevor Gleichungen mit negativen Zahlen rein rechnerisch gelöst werden.
- **Bedienung:** Ein Antippen nimmt einen Gegenstand **nur auf einer Seite** weg – die Waage kippt und die Umformung wird rot markiert. Erst wenn auf der anderen Seite dasselbe weggenommen wird, entsteht eine gültige Zeile (aufeinanderfolgende gleichartige Schritte werden wie im Heft zusammengefasst, z. B. $\mid -2$). Die Knöpfe führen Umformungen auf beiden Seiten aus; „Beide Seiten : n“ schlägt einen passenden Teiler vor und teilt die Schalen sichtbar in gleiche Gruppen.
- **Geteilte Links** enthalten die Ausgangsgleichung. „Neue Gleichung“ erzeugt Aufgaben mit natürlicher Lösung von 1 bis 6.
- **Grenzen des Modells** (bewusst thematisieren): keine negativen Zahlen und keine Differenzen wie $3x - 2$, Lösungen nur positiv, Teilen nur, wenn es aufgeht; Addieren und Multiplizieren beider Seiten werden hier nicht angeboten, weil sie zum Lösen solcher Gleichungen nicht nötig sind.
- **Typische Fehlvorstellungen:**
  - Es wird nur auf einer Seite umgeformt (genau das zeigt die kippende Waage).
  - Beim Dividieren wird nur ein Teil einer Seite geteilt: $2x + 4 = 10 \mid :2$ ergibt nicht $x + 4 = 5$, sondern $x + 2 = 5$.
  - „Rüberbringen mit Vorzeichenwechsel“ als Regel ohne Verständnis – die Waage zeigt, dass eigentlich auf beiden Seiten subtrahiert wird.
