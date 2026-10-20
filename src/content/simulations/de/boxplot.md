---
description: "Datenpunkte auf dem Zahlenstrahl ziehen oder ergänzen: Rangliste, Median, Quartile, Boxplot und Mittelwert folgen live – Schritt für Schritt oder im Vergleich zweier Gruppen."
---

## Worum geht es?

Bei einer Mathe-Probe, beim Taschengeld oder beim Weitsprung entstehen viele einzelne Werte – die **Urliste**. Um sie zu beschreiben, fasst man sie in wenigen **Kenngrößen** zusammen.

**Mittelwert** (arithmetisches Mittel): Alle Werte addieren und durch die Anzahl $n$ teilen.

$$
\bar{x} = \frac{x_1 + x_2 + \ldots + x_n}{n}
$$

Für die Punkte der Klasse 7a sind das $\bar{x} = \frac{295}{15} \approx 19{,}67$ Punkte. Anschaulich ist der Mittelwert der **Schwerpunkt**: Legt man die Punkte als gleich schwere Kugeln auf den Zahlenstrahl, bleibt er genau über dem Mittelwert im Gleichgewicht (rotes Dreieck).

**Median** (Zentralwert): Die Werte der Größe nach ordnen (**Rangliste**). Der Median steht genau in der Mitte. Bei $n = 15$ Werten ist es der $8.$ Wert. Bei gerader Anzahl gibt es zwei mittlere Werte; der Median ist ihr Mittelwert, bei $n = 12$ also $\frac{6.\text{ Wert} + 7.\text{ Wert}}{2}$. Mindestens die Hälfte der Werte ist kleiner oder gleich dem Median, mindestens die Hälfte größer oder gleich.

**Quartile:** Der Median teilt die geordnete Liste in eine untere und eine obere Hälfte (bei ungerader Anzahl gehört der Median selbst zu keiner Hälfte). Das **untere Quartil** $Q_1$ ist der Median der unteren Hälfte, das **obere Quartil** $Q_3$ der Median der oberen Hälfte. In manchen Schulbüchern und Programmen werden die Quartile etwas anders festgelegt – bei kleinen Datensätzen können die Werte dann leicht abweichen.

**Streuung:** Die **Spannweite** ist $\text{Maximum} - \text{Minimum}$, der **Quartilsabstand** ist $Q_3 - Q_1$.

Der **Boxplot** zeigt die fünf Kennwerte Minimum, $Q_1$, Median, $Q_3$ und Maximum auf einen Blick: Die **Box** reicht von $Q_1$ bis $Q_3$, der Strich in der Box ist der Median, die **Antennen** (Whisker) reichen bis zum Minimum und Maximum. Box und Antennen teilen die Daten grob in **vier Viertel** – in der Box liegt etwa die mittlere Hälfte der Werte.

**Ausreißer:** Oft kennzeichnet man Werte, die mehr als das $1{,}5$-Fache des Quartilsabstands außerhalb der Box liegen, als Ausreißer. Die Antennen enden dann beim letzten Wert davor. Ein einziger Ausreißer kann den Mittelwert deutlich verschieben – den Median kaum.

## Ausprobieren

1. Ziehe den höchsten Punkt ganz nach rechts. Was passiert mit dem Mittelwert, was mit dem Median? [Beispiel laden](?ctx=test)
2. Klicke auf **Schritt für Schritt** und verfolge, wie der Boxplot aus der geordneten Liste entsteht.
3. Beim Taschengeld bekommt ein Kind $90\,€$. Warum liegt der Mittelwert über fast allen anderen Werten? Schalte die Ausreißer-Kennzeichnung an und aus. [Taschengeld](?ctx=geld&out=1)
4. Beim Weitsprung gibt es $12$ Werte. Wo steht der Median in der geordneten Liste? Füge durch Antippen des Zahlenstrahls einen 13. Wert hinzu – was ändert sich? [Weitsprung](?ctx=sprung)
5. Vergleiche die Klassen 7a und 7b: Median und Mittelwert sind gleich. Woran sieht man trotzdem einen großen Unterschied? [Vergleich](?mode=cmp&pct=1)
6. Beim Schulweg ist die rechte Antenne viel länger als die linke. Was sagt das über die Daten? [Schulweg](?ctx=weg&pct=1)
7. Schaffst du es, dass Median und Mittelwert genau gleich sind? Und dass der Mittelwert größer als $Q_3$ ist? [Eigene Daten](?ctx=own)

## Aufgaben

### Aufgabe 1: Kennwerte der Probe

Ordne die Punkte der Klasse 7a und bestimme Minimum, $Q_1$, Median, $Q_3$, Maximum und Mittelwert. [Aufgabe laden](?ctx=test&show=0&box=0&mean=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Geordnet: $9;\ 12;\ 14;\ 16;\ 17;\ 18;\ 19;\ 20;\ 21;\ 22;\ 23;\ 24;\ 25;\ 27;\ 28$. Median: $8.$ Wert $= 20$. Untere Hälfte $9 \ldots 19$ (7 Werte), $Q_1 = 16$; obere Hälfte $21 \ldots 28$, $Q_3 = 24$. Minimum $9$, Maximum $28$. Mittelwert $\frac{295}{15} \approx 19{,}67$. [In der Simulation zeigen](?ctx=test)

</details>

### Aufgabe 2: Gerade Anzahl

Bestimme Median und Quartile der $12$ Sprungweiten im Herbst. [Aufgabe laden](?ctx=sprung&show=0&box=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Geordnet: $2{,}9;\ 3{,}1;\ 3{,}2;\ 3{,}4;\ 3{,}5;\ 3{,}6;\ 3{,}7;\ 3{,}8;\ 3{,}9;\ 4{,}0;\ 4{,}1;\ 4{,}4$. Median $= \frac{3{,}6 + 3{,}7}{2} = 3{,}65\,\text{m}$. Untere Hälfte: 6 Werte, $Q_1 = \frac{3{,}2 + 3{,}4}{2} = 3{,}3\,\text{m}$. Obere Hälfte: $Q_3 = \frac{3{,}9 + 4{,}0}{2} = 3{,}95\,\text{m}$. [In der Simulation zeigen](?ctx=sprung)

</details>

### Aufgabe 3: Der Ausreißer

Berechne beim Taschengeld Mittelwert und Median – einmal mit, einmal ohne die $90\,€$. Welche Kenngröße beschreibt das „typische“ Taschengeld besser? [Aufgabe laden](?ctx=geld&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Mit: $\bar{x} = \frac{355}{11} \approx 32{,}27\,€$, Median $25\,€$. Ohne: $\bar{x} = \frac{265}{10} = 26{,}50\,€$, Median $\frac{25 + 25}{2} = 25\,€$. Der Median ändert sich gar nicht, der Mittelwert um fast $6\,€$. Für das „typische“ Taschengeld passt hier der Median besser. Ausreißer-Grenze: $Q_3 + 1{,}5 \cdot (Q_3 - Q_1) = 35 + 1{,}5 \cdot 15 = 57{,}5$ – die $90\,€$ liegen darüber. [In der Simulation zeigen](?ctx=geld&out=1)

</details>

### Aufgabe 4: Boxplot lesen

Im Schulweg-Boxplot ist $Q_1 = 11$, Median $= 15$, $Q_3 = 22{,}5$ und Maximum $= 45$ Minuten. Welche Aussagen stimmen? (a) Etwa die Hälfte braucht höchstens $15$ Minuten. (b) Etwa ein Viertel braucht mehr als $22{,}5$ Minuten. (c) Zwischen $22{,}5$ und $45$ Minuten liegen mehr Kinder als zwischen $11$ und $15$. [Aufgabe laden](?ctx=weg&rank=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

(a) und (b) stimmen. (c) stimmt nicht: In beiden Abschnitten liegt etwa ein Viertel der Werte. Die lange Antenne zeigt nur, dass die Werte dort **weiter auseinander** liegen, nicht, dass es mehr sind. [In der Simulation zeigen](?ctx=weg&pct=1)

</details>

### Aufgabe 5: Zwei Klassen vergleichen

Beide Klassen haben in der Probe den Median $20$ und den Mittelwert $19{,}67$. Vergleiche die Quartilsabstände. In welcher Klasse wäre eine Förderstunde für die schwächeren Schülerinnen und Schüler dringender? [Aufgabe laden](?mode=cmp&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

7a: $Q_3 - Q_1 = 24 - 16 = 8$; 7b: $27 - 13 = 14$. In der 7b streuen die Ergebnisse viel stärker: Ein Viertel der Klasse hat höchstens $13$ Punkte (in der 7a: höchstens $16$). Eine Förderstunde wäre dort wohl dringender. [In der Simulation zeigen](?mode=cmp&pct=1)

</details>

### Aufgabe 6: Daten erfinden

Erfinde fünf Werte mit Median $10$ und Mittelwert $20$. Prüfe deine Lösung, indem du die Werte bei „Eigene Daten“ eingibst. [Aufgabe laden](?ctx=own)

<details>
<summary>Lösung anzeigen</summary>

Der mittlere Wert muss $10$ sein, die Summe $5 \cdot 20 = 100$. Zum Beispiel $5;\ 8;\ 10;\ 12;\ 65$ – der große Wert zieht den Mittelwert nach oben. [In der Simulation zeigen](?ctx=own&d=5%3B8%3B10%3B12%3B65)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 7, Lernbereich „Kenngrößen von Daten“ (LehrplanPLUS Bayern, Gymnasium): Mittelwert und Median vergleichen, Spannweite und Quartile, Boxplots erstellen und deuten. Als Einstieg eignet sich vielleicht das Ziehen eines einzelnen Punktes; „Schritt für Schritt“ kann die Konstruktion an der Tafel begleiten.
- **Eigene Daten:** Die Klasse könnte selbst Daten erheben (Schulweg, Schlafdauer, Weitsprung) und sie in das Feld „Werte“ eintippen. Im Vergleichsmodus lassen sich zwei Erhebungen nebeneinander betrachten.
- **Quartile:** Die Simulation bildet die Quartile als Mediane der beiden Hälften (Median bei ungerader Anzahl ausgeschlossen). Falls im Schulbuch eine andere Festlegung steht, kann ein kurzer Hinweis Verwirrung vermeiden.
- **Häufige Stolpersteine:**
  - Der Median wird aus der **ungeordneten** Urliste abgelesen.
  - Bei gerader Anzahl wird nur einer der beiden mittleren Werte genommen.
  - Eine lange Antenne oder breite Box wird als „mehr Werte“ gedeutet – richtig ist: gleich viele Werte, nur weiter gestreut.
  - Mittelwert und Median werden gleichgesetzt; bei schiefen Daten oder Ausreißern unterscheiden sie sich deutlich.
  - Die Box wird als Bereich „aller normalen Werte“ verstanden; sie enthält aber nur etwa die mittlere Hälfte.
