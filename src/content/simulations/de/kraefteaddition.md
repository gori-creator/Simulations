---
description: "Interaktive Simulation zum Addieren und Zerlegen von Kräften – Kräfteparallelogramm, Kräfte aneinanderhängen, Resultierende, Gleichgewicht und Gegenkraft, Zerlegung in Komponenten und die Seilkraft bei einer Lampe an zwei Seilen oder einer Wäscheleine."
---

## Worum geht es?

Eine **Kraft** hat einen Betrag (in Newton), eine Richtung und einen Angriffspunkt. Man zeichnet sie als **Kraftpfeil**: Die Länge gibt den Betrag an (z. B. $1\,\text{cm} \mathrel{\widehat{=}} 1\,\text{N}$), die Pfeilspitze die Richtung.

Greifen mehrere Kräfte am selben Punkt an, kann man sie durch **eine** Kraft mit derselben Wirkung ersetzen, die **Resultierende** (Ersatzkraft) $F_R$.

- **Gleiche Richtung:** $F_R = F_1 + F_2$.
- **Entgegengesetzte Richtung:** $F_R = F_1 - F_2$, in Richtung der größeren Kraft.
- **Beliebige Richtungen – Kräfteparallelogramm:** Man ergänzt die beiden Kraftpfeile zu einem Parallelogramm. Die Diagonale vom Angriffspunkt aus ist die Resultierende.
- **Kräfte aneinanderhängen:** Gleichwertig ist es, die Pfeile parallel zu verschieben und Fuß an Spitze zu hängen. $F_R$ reicht vom Anfang des ersten bis zur Spitze des letzten Pfeils. Die Reihenfolge ist egal, so lassen sich auch drei und mehr Kräfte addieren (**Krafteck**).

Stehen zwei Kräfte **senkrecht** aufeinander, liefert der Satz des Pythagoras den Betrag:

$$
F_R = \sqrt{F_1^2 + F_2^2} \qquad \text{z. B. } \sqrt{(4\,\text{N})^2 + (3\,\text{N})^2} = 5\,\text{N}
$$

Allgemein gilt für den Winkel $\gamma$ zwischen den Kräften $F_R^2 = F_1^2 + F_2^2 + 2\,F_1 F_2 \cos\gamma$. Kräfte addiert man also wie Pfeile, nicht wie Zahlen: $4\,\text{N}$ und $3\,\text{N}$ ergeben je nach Richtung alles zwischen $1\,\text{N}$ und $7\,\text{N}$.

**Kräftegleichgewicht:** Ein Körper ist im Gleichgewicht, wenn die Resultierende aller Kräfte null ist. Die **Gegenkraft**, die zwei Kräften das Gleichgewicht hält, ist genauso groß wie $F_R$, zeigt aber in die Gegenrichtung. Hängt man alle Kräfte aneinander, schließt sich das Krafteck.

**Kraft zerlegen:** Umgekehrt kann man eine Kraft in zwei **Komponenten** entlang vorgegebener Richtungen zerlegen. Dazu zieht man durch die Pfeilspitze Parallelen zu den beiden Richtungen. Für senkrechte Richtungen gilt $F_1 = F \cdot \cos\alpha$ und $F_2 = F \cdot \sin\alpha$. Die Komponenten können zusammen größer sein als die Kraft selbst!

**Lampe an zwei Seilen:** Die beiden Seilkräfte müssen zusammen der Gewichtskraft $F_G$ das Gleichgewicht halten. Laufen beide Seile unter dem Winkel $\alpha$ gegen die Waagerechte, trägt jedes Seil mit seinem senkrechten Anteil die halbe Last:

$$
2 \cdot F_S \cdot \sin\alpha = F_G \qquad\Longrightarrow\qquad F_S = \frac{F_G}{2 \cdot \sin\alpha}
$$

Bei $\alpha = 30^\circ$ ist jede Seilkraft genau so groß wie $F_G$, bei flachen Seilen um ein Vielfaches größer. Eine Wäscheleine mit Wäsche lässt sich deshalb nie ganz gerade spannen.

## Ausprobieren

1. Ziehe die Pfeilspitzen von $F_1$ und $F_2$. Wann ist die Resultierende am größten, wann am kleinsten? [Gleiche Richtung](?w2=0) · [Entgegengesetzt](?w2=180)
2. Blende das Ergebnis aus, konstruiere die Resultierende im Heft und drücke dann **Konstruieren**. [Ohne Ergebnis](?f1=5&w1=20&f2=4&w2=110&res=0)
3. Hänge drei Kräfte aneinander. Ändert sich die Resultierende, wenn du die Reihenfolge der Kräfte vertauschst? [Drei Kräfte](?n3=1&cons=poly)
4. Schalte die Gegenkraft ein. Wie liegt sie im Kräfteparallelogramm, wie im Krafteck? [Gegenkraft](?eq=1) · [Krafteck](?n3=1&cons=poly&eq=1)
5. Zerlege eine Kraft in zwei Richtungen und drehe die Richtungen auseinander. [Zerlegen](?mode=split) · [Fast entgegengesetzte Richtungen](?mode=split&f=6&w=-90&d1=170&d2=10)
6. Ziehe die Lampe nach oben und beobachte Federwaagen und Diagramm. [Lampe](?mode=lamp) · [Wäscheleine](?mode=lamp&obj=line&m=1.5&a=5)

## Aufgaben

### Aufgabe 1: Senkrecht aufeinander

Zwei Kräfte $F_1 = 6\,\text{N}$ (nach rechts) und $F_2 = 8\,\text{N}$ (nach oben) greifen am selben Punkt an. Bestimme die Resultierende zeichnerisch und rechnerisch. [Aufgabe laden](?f1=6&f2=8&res=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$F_R = \sqrt{(6\,\text{N})^2 + (8\,\text{N})^2} = 10\,\text{N}$, etwa $53^\circ$ gegen die Waagerechte. [Lösung zeigen](?f1=6&f2=8)

</details>

### Aufgabe 2: Zwei Schlepper

Zwei Schlepper ziehen ein Schiff mit je $5\,\text{kN}$, unter $30^\circ$ nach links und rechts von der Fahrtrichtung. Wie groß ist die Zugkraft in Fahrtrichtung? (In der Simulation: $1\,\text{N} \mathrel{\widehat{=}} 1\,\text{kN}$) [Aufgabe laden](?f1=5&w1=30&f2=5&w2=-30&res=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Das Parallelogramm ist eine Raute. $F_R = 2 \cdot 5\,\text{kN} \cdot \cos 30^\circ \approx 8{,}7\,\text{kN}$ – weniger als $10\,\text{kN}$, weil die Seitenanteile sich aufheben. [Lösung zeigen](?f1=5&w1=30&f2=5&w2=-30)

</details>

### Aufgabe 3: Gleichgewicht

Auf einen Ring wirken $F_1 = 4\,\text{N}$ nach rechts und $F_2 = 3\,\text{N}$ nach oben. Welche dritte Kraft hält den Ring im Gleichgewicht? Stelle sie in der Simulation ein. [Aufgabe laden](?n3=1&f3=0&cons=poly&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Die Gegenkraft zur Resultierenden: $5\,\text{N}$, Richtung $180^\circ + 37^\circ = 217^\circ$, also $-143^\circ$ (nach links unten). Dann schließt sich das Krafteck. [Lösung zeigen](?n3=1&f3=5&w3=-143&cons=poly)

</details>

### Aufgabe 4: Kraft zerlegen

Ein Schlitten wird mit $8\,\text{N}$ an einer Schnur gezogen, die $30^\circ$ gegen die Waagerechte ansteigt. Welcher Anteil zieht den Schlitten vorwärts, welcher hebt ihn an? [Aufgabe laden](?mode=split&f=8&w=30&res=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Vorwärts: $8\,\text{N} \cdot \cos 30^\circ \approx 6{,}9\,\text{N}$, nach oben: $8\,\text{N} \cdot \sin 30^\circ = 4\,\text{N}$. [Lösung zeigen](?mode=split&f=8&w=30)

</details>

### Aufgabe 5: Lampe

Eine Lampe mit $m = 2\,\text{kg}$ hängt an zwei Seilen, die $10^\circ$ gegen die Waagerechte geneigt sind. Wie groß ist die Kraft in jedem Seil? [Aufgabe laden](?mode=lamp&a=10&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$F_G = 2\,\text{kg} \cdot 9{,}81\,\tfrac{\text{N}}{\text{kg}} \approx 19{,}6\,\text{N}$, also $F_S = \frac{19{,}6\,\text{N}}{2 \cdot \sin 10^\circ} \approx 56{,}5\,\text{N}$ – fast das Dreifache der Gewichtskraft.

</details>

### Aufgabe 6: Straff gespannt

Bei welchem Seilwinkel ist jede Seilkraft so groß wie die Gewichtskraft? Warum reißt eine straff gespannte Wäscheleine eher als eine durchhängende?

<details>
<summary>Lösung anzeigen</summary>

$F_S = F_G$ gilt für $\sin\alpha = \tfrac12$, also $\alpha = 30^\circ$. Je flacher die Leine, desto kleiner $\sin\alpha$ und desto größer die Seilkraft. Bei $5^\circ$ ist sie schon fast sechsmal so groß wie die Gewichtskraft der Wäsche. [Wäscheleine](?mode=lamp&obj=line&m=1.5&a=5)

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Kraft als gerichtete Größe, Kräfteaddition und -zerlegung, Kräftegleichgewicht (Klasse 8–10). Ohne Trigonometrie lässt sich alles zeichnerisch mit Maßstab lösen; das Karoraster zeigt den Maßstab („1 Kästchen ≙ … N“). Pythagoras, Sinus und Kosinus erscheinen in den Ergebnissen für höhere Klassen.
- **Aufgabenmodus:** Mit `res=0` werden Parallelogramm, Krafteck und Komponenten ausgeblendet; **Konstruieren** bzw. **Zerlegen** zeigt die Konstruktion Schritt für Schritt. `_hide=1` verdeckt zusätzlich die Zahlenwerte unter den Ergebnissen, `vals=0` die Beträge an den Pfeilen.
- **Richtungen** werden als Winkel gegen die Waagerechte nach rechts angegeben (gegen den Uhrzeigersinn positiv, $-180^\circ$ bis $180^\circ$). Beim Ziehen rasten Winkel auf Vielfache von $15^\circ$ und Beträge auf halbe Newton ein.
- **Modell Lampe/Wäscheleine:** Seile und Federwaagen sind masselos, die Last hängt in der Mitte zwischen gleich hohen Aufhängepunkten. Die Federwaagen haben einen Messbereich von $100\,\text{N}$. Bei sehr steilen Seilen rücken die Aufhängepunkte in der Zeichnung zusammen, damit die Lampe in der Szene bleibt; der Winkel stimmt immer.
- **Typische Fehlvorstellungen:**
  - „Kräfte addieren sich immer zu $F_1 + F_2$.“ – nur bei gleicher Richtung.
  - „Die Resultierende ist eine zusätzliche Kraft.“ – Sie **ersetzt** die Einzelkräfte, sie wirkt nicht zusätzlich.
  - „Komponenten sind immer kleiner als die Kraft.“ – Bei fast entgegengesetzten Richtungen werden sie sehr groß.
  - „Ein straff gespanntes Seil trägt mehr.“ – Es wird stärker belastet; die Seilkraft wächst, je flacher das Seil ist.
