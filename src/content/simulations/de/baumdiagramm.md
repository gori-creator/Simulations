---
description: "Kugeln aus einer Urne ziehen – mit oder ohne Zurücklegen. Der Baum wächst mit Brüchen an den Ästen, beide Varianten lassen sich nebeneinander vergleichen, die Pfadregeln laufen Schritt für Schritt ab, und in der Simulation nähert sich die relative Häufigkeit der Wahrscheinlichkeit."
---

## Worum geht es?

Bei einem **mehrstufigen Zufallsexperiment** wird ein einfaches Experiment mehrmals hintereinander ausgeführt – hier: Aus einer Urne mit $3$ roten und $2$ blauen Kugeln wird zweimal gezogen. Ein **Baumdiagramm** zeigt alle möglichen Abläufe: Jede Stufe ist ein Zug, jeder Ast ein mögliches Ergebnis dieses Zuges, jeder **Pfad** von links nach rechts ein Ergebnis des ganzen Experiments.

An die Äste schreibt man die Wahrscheinlichkeiten. Beim ersten Zug sind das $\frac35$ (rot) und $\frac25$ (blau). Beim zweiten Zug kommt es darauf an:

- **Mit Zurücklegen:** Die Urne ist wieder wie vorher, die Äste tragen wieder $\frac35$ und $\frac25$.
- **Ohne Zurücklegen:** Es sind nur noch $4$ Kugeln da. Wurde zuerst Rot gezogen, ist Rot jetzt $\frac24$, Blau $\frac24$.

**1. Pfadregel (Produktregel):** Die Wahrscheinlichkeit eines Pfades ist das Produkt der Wahrscheinlichkeiten entlang des Pfades:

$$
\text{ohne Zurücklegen: } P(\text{rot, rot}) = \frac35 \cdot \frac24 = \frac{6}{20} = \frac{3}{10}, \qquad \text{mit Zurücklegen: } P(\text{rot, rot}) = \frac35 \cdot \frac35 = \frac{9}{25}.
$$

**2. Pfadregel (Summenregel):** Die Wahrscheinlichkeit eines Ereignisses ist die Summe der Wahrscheinlichkeiten aller Pfade, die zu ihm gehören:

$$
P(\text{beide gleichfarbig}) = P(rr) + P(bb) = \frac{3}{10} + \frac{1}{10} = \frac25 \quad (\text{ohne Zurücklegen}).
$$

An jeder Verzweigung ergeben die Äste zusammen $1$, und alle Pfade zusammen ebenfalls $1$. Daraus folgt der Weg über das **Gegenereignis**: Hat das Gegenereignis weniger Pfade, rechnet man $P(E) = 1 - P(\overline{E})$, z. B. $P(\text{mindestens eine rote}) = 1 - P(bb) = 1 - \frac{1}{10} = \frac{9}{10}$.

**Sonderfälle ohne Zurücklegen:**

- Ist eine Farbe aufgebraucht, hat ihr Ast die Wahrscheinlichkeit $0$ – im Baum als gestrichelter Stummel „0/…“ gezeichnet.
- Nach so vielen Zügen, wie Kugeln in der Urne sind, ist sie **leer**; mehr Züge sind nicht möglich.

**Simulation:** Wird das Experiment oft wiederholt, liegen die relativen Häufigkeiten meist nahe bei den Wahrscheinlichkeiten (empirisches Gesetz der großen Zahlen). Der helle Trichter zeigt, in welchem Bereich die relative Häufigkeit nach $N$ Durchgängen in etwa $95\,\%$ der Fälle liegt.

## Ausprobieren

1. Ziehe **einmal**: Die Kugeln fliegen aus der Urne, der Pfad leuchtet im Baum auf. Was ändert sich in der Urne beim zweiten Zug? [Ziehen](?mode=draw&rep=0)
2. Vergleiche beide Bäume nebeneinander. Welche Brüche sind gleich, welche nicht? [Mit und ohne Zurücklegen](?mode=compare&ev=custom&sel=rr)
3. Lass die Rechnung für „beide gleichfarbig“ ablaufen: Erst entstehen die Produkte, dann die Summe. [Pfadregeln](?mode=rules&ev=same)
4. Bei „mindestens eine rote“ hat das Gegenereignis nur einen Pfad – sieh dir an, wie die Rechnung dann aussieht. [Gegenereignis](?mode=rules&ev=minR)
5. Starte **1000-mal ziehen** und beobachte, wie sich die Kurve in den Trichter legt. [Simulation](?mode=sim&ev=same)
6. Wähle **selbst antippen** und tippe Pfade an. So kannst du beliebige Ereignisse zusammenstellen. [Selbst wählen](?ev=custom)
7. Stelle eine kleine Urne mit $2$ roten und $1$ blauen Kugel ein und ziehe dreimal. Wo endet ein Ast mit $0$? [Kleine Urne](?r=2&b=1&n=3)

## Aufgaben

### Aufgabe 1: Pfadwahrscheinlichkeiten

In der Urne liegen $3$ rote und $2$ blaue Kugeln. Es wird zweimal ohne Zurücklegen gezogen. Berechne die Wahrscheinlichkeiten aller vier Pfade und prüfe, ob sie zusammen $1$ ergeben. [Aufgabe laden](?show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$P(rr) = \frac35 \cdot \frac24 = \frac{3}{10}$, $P(rb) = \frac35 \cdot \frac24 = \frac{3}{10}$, $P(br) = \frac25 \cdot \frac34 = \frac{3}{10}$, $P(bb) = \frac25 \cdot \frac14 = \frac{1}{10}$. Summe: $\frac{3 + 3 + 3 + 1}{10} = 1$ ✓. [In der Simulation zeigen](?show=1)

</details>

### Aufgabe 2: Mit und ohne Zurücklegen

Wie groß ist die Wahrscheinlichkeit, zwei Kugeln gleicher Farbe zu ziehen – mit und ohne Zurücklegen? Erkläre den Unterschied. [Aufgabe laden](?mode=compare&ev=same&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Ohne Zurücklegen: $\frac{3}{10} + \frac{1}{10} = \frac25 = 40\,\%$. Mit Zurücklegen: $\frac{9}{25} + \frac{4}{25} = \frac{13}{25} = 52\,\%$. Ohne Zurücklegen fehlt beim zweiten Zug eine Kugel der zuerst gezogenen Farbe – gleiche Farben werden seltener. [In der Simulation zeigen](?mode=compare&ev=same)

</details>

### Aufgabe 3: Mindestens eine rote

Es wird dreimal mit Zurücklegen gezogen. Berechne $P(\text{mindestens eine rote Kugel})$ geschickt. [Aufgabe laden](?mode=rules&n=3&rep=1&ev=minR&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Über das Gegenereignis „keine rote“: $1 - \left(\frac25\right)^3 = 1 - \frac{8}{125} = \frac{117}{125} = 93{,}6\,\%$. Direkt müsste man sieben Pfade addieren. [In der Simulation zeigen](?mode=rules&n=3&rep=1&ev=minR)

</details>

### Aufgabe 4: Sicher mindestens eine rote?

Jetzt dreimal **ohne** Zurücklegen. Begründe, warum $P(\text{mindestens eine rote}) = 1$ ist. [Aufgabe laden](?mode=rules&n=3&ev=minR&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Es gibt nur $2$ blaue Kugeln. Nach zwei blauen ist Blau aufgebraucht (Ast „0/3“), der dritte Zug ist sicher rot. Das Gegenereignis „keine rote“ ist unmöglich, also $P = 1 - 0 = 1$. [In der Simulation zeigen](?mode=rules&n=3&ev=minR)

</details>

### Aufgabe 5: Drei Farben

Die Urne enthält $2$ rote, $3$ blaue und $1$ grüne Kugel. Es wird zweimal ohne Zurücklegen gezogen. Mit welcher Wahrscheinlichkeit haben die beiden Kugeln verschiedene Farben? [Aufgabe laden](?r=2&b=3&g=1&ev=diff&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Gegenereignis „gleiche Farbe“: $\frac26 \cdot \frac15 + \frac36 \cdot \frac25 = \frac{2}{30} + \frac{6}{30} = \frac{8}{30}$ (zwei grüne gibt es nicht). Also $P = 1 - \frac{8}{30} = \frac{11}{15} \approx 73{,}3\,\%$. [In der Simulation zeigen](?mode=rules&r=2&b=3&g=1&ev=diff)

</details>

### Aufgabe 6: Eine kleine Urne

In einer Urne liegen $2$ rote und $1$ blaue Kugel. Es werden alle drei nacheinander gezogen. Mit welcher Wahrscheinlichkeit kommt die blaue Kugel zuletzt? [Aufgabe laden](?r=2&b=1&n=3&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Der Pfad $rrb$: $\frac23 \cdot \frac12 \cdot 1 = \frac13$. Alle drei Pfade sind gleich wahrscheinlich – die blaue Kugel landet mit gleicher Wahrscheinlichkeit an jeder Stelle. [In der Simulation zeigen](?r=2&b=1&n=3)

</details>

## Ideen für den Unterricht

- **Einsatz:** Jahrgangsstufe 8 (Laplace-Experimente, Baumdiagramm) und Jahrgangsstufe 10, Lernbereich „Zusammengesetzte Zufallsexperimente und stochastische Simulationen“ (LehrplanPLUS Bayern, Gymnasium).
- **Echte Urne daneben:** Zuerst einige Male mit einer echten Urne ziehen, dann mit der Ansicht „Simulation“ vergleichen – sie ersetzt die vielen Wiederholungen.
- **Bruchdarstellung:** Die Äste zeigen bewusst ungekürzte Brüche (z. B. $\frac24$), damit der Inhalt der Urne erkennbar bleibt; erst die Produkte werden gekürzt.
- **Häufige Stolpersteine:**
  - Ohne Zurücklegen werden im zweiten Zug dieselben Wahrscheinlichkeiten wie im ersten verwendet.
  - Wahrscheinlichkeiten entlang eines Pfades werden addiert statt multipliziert.
  - Pfade wie $rb$ und $br$ werden als dasselbe Ergebnis gezählt und nur einmal addiert.
  - Bei „mindestens einmal“ werden nicht alle passenden Pfade erfasst; das Gegenereignis ist oft einfacher.
