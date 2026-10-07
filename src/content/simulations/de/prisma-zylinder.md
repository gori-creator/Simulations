---
description: Interaktive 3D-Simulation zu Prisma und Zylinder – Volumen V = G · h durch Stapeln von Schichten, Oberfläche durch Abrollen, der Zylinder als Grenzfall des Prismas.
---

## Worum geht es?

Ein (gerades) **Prisma** hat zwei gleiche, parallele **Grundflächen** – die Grund- und die Deckfläche – und Rechtecke als Seitenflächen. Beim **Zylinder** ist die Grundfläche ein Kreis. Die Seitenflächen zusammen heißen **Mantel**.

**Volumen.** Man denkt sich den Körper in Schichten von $1\,\text{cm}$ Dicke zerlegt. Jede Schicht hat das Volumen $G \cdot 1\,\text{cm}$. Ist der Körper $h = 4\,\text{cm}$ hoch, gibt es 4 solche Schichten, bei $h = 4{,}5\,\text{cm}$ viereinhalb. Also

$$
V = G \cdot h \qquad \text{Zylinder: } V = \pi r^2 \cdot h
$$

**Oberfläche.** Rollt man den Körper einmal über den Boden, hinterlässt jede Seitenfläche ihren Abdruck. Zusammen ergeben die Abdrücke ein Rechteck: Seine Länge ist der **Umfang** $u$ der Grundfläche, seine Breite die Höhe $h$. Mit Grund- und Deckfläche entsteht das Netz:

$$
M = u \cdot h, \qquad O = 2 \cdot G + M \qquad \text{Zylinder: } O = 2\pi r^2 + 2\pi r \cdot h
$$

**Der Zylinder als Grenzfall.** Ein regelmäßiges $n$-Eck mit Umkreisradius $r$ besteht aus $n$ gleichschenkligen Dreiecken. Je mehr Ecken es hat, desto mehr gleicht es dem Kreis: $G$ nähert sich $\pi r^2$ und $u$ nähert sich $2\pi r$. Das Prisma wird dabei immer mehr zum Zylinder.

## Ausprobieren

1. Drücke **Schichten stapeln** und beobachte die Rechnung im Bild: Wie hängt das Volumen von der Anzahl der Schichten ab?
2. Verdopple die Körperhöhe $h$. Was passiert mit $V$? Verdopple dann den Radius $r$ – warum wird das Volumen jetzt viermal so groß?
3. Wähle **Oberfläche: abrollen** und drücke **Abrollen**. Die farbige Startfläche zeigt, wann eine volle Umdrehung erreicht ist. [Sechseckprisma abrollen](?mode=oberflaeche&roll=45)
4. Erhöhe die Eckenzahl $n$ und schalte den Vergleichszylinder ein. [Fast ein Zylinder](?n=24&ghost=1)
5. Rolle einen Zylinder ab: Die Länge des Rechtecks ist der Kreisumfang. [Zylindernetz](?mode=oberflaeche&base=kreis&r=1.5&h=4&roll=100)

## Aufgaben

### Aufgabe 1: Dreiecksprisma

Die Grundfläche eines Prismas ist ein gleichschenkliges Dreieck mit der Grundseite $g = 4\,\text{cm}$ und der Höhe $h_g = 3\,\text{cm}$; die Schenkel sind etwa $3{,}6\,\text{cm}$ lang. Das Prisma ist $h = 5\,\text{cm}$ hoch. Berechne Volumen und Oberfläche. [Aufgabe laden](?base=dreieck&g=4&hg=3&h=5&calc=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$G = \tfrac{1}{2} \cdot 4\,\text{cm} \cdot 3\,\text{cm} = 6\,\text{cm}^2$, also $V = G \cdot h = 6\,\text{cm}^2 \cdot 5\,\text{cm} = 30\,\text{cm}^3$.

$u \approx 4\,\text{cm} + 2 \cdot 3{,}6\,\text{cm} = 11{,}2\,\text{cm}$, $M = u \cdot h \approx 56\,\text{cm}^2$ und $O = 2 \cdot G + M \approx 12\,\text{cm}^2 + 56\,\text{cm}^2 = 68\,\text{cm}^2$.

</details>

### Aufgabe 2: Zylinder

Ein Zylinder hat den Radius $r = 2\,\text{cm}$ und die Höhe $h = 4\,\text{cm}$. Berechne Volumen und Oberfläche. [Aufgabe laden](?base=kreis&r=2&h=4&calc=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$V = \pi \cdot (2\,\text{cm})^2 \cdot 4\,\text{cm} = 16\pi\,\text{cm}^3 \approx 50{,}27\,\text{cm}^3$

$O = 2 \cdot \pi \cdot (2\,\text{cm})^2 + 2\pi \cdot 2\,\text{cm} \cdot 4\,\text{cm} = 8\pi\,\text{cm}^2 + 16\pi\,\text{cm}^2 = 24\pi\,\text{cm}^2 \approx 75{,}40\,\text{cm}^2$

</details>

### Aufgabe 3: Das Sechseck

Beim regelmäßigen Sechseck ist jede Seite genau so lang wie der Umkreisradius. Begründe das. Berechne damit den Mantel eines Sechseckprismas mit $r = 2\,\text{cm}$ und $h = 4\,\text{cm}$. [Aufgabe laden](?mode=oberflaeche&calc=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Das Sechseck besteht aus sechs Dreiecken mit dem Winkel $360^\circ : 6 = 60^\circ$ an der Spitze. Die beiden anderen Winkel sind gleich groß, also auch je $60^\circ$ – die Dreiecke sind gleichseitig, die Seite ist so lang wie der Radius.

$u = 6 \cdot 2\,\text{cm} = 12\,\text{cm}$, $M = u \cdot h = 12\,\text{cm} \cdot 4\,\text{cm} = 48\,\text{cm}^2$. [Abrollen zeigen](?mode=oberflaeche&roll=100)

</details>

### Aufgabe 4: Eine Getränkedose

Eine Dose hat den Durchmesser $7\,\text{cm}$ und die Höhe $11\,\text{cm}$. Wie viel Papier braucht man (ohne Überlappung) für das Etikett, das den Mantel bedeckt? Passt ein halber Liter hinein?

<details>
<summary>Lösung anzeigen</summary>

$M = 2\pi r \cdot h = \pi \cdot 7\,\text{cm} \cdot 11\,\text{cm} \approx 241{,}9\,\text{cm}^2$.

$V = \pi \cdot (3{,}5\,\text{cm})^2 \cdot 11\,\text{cm} \approx 423{,}3\,\text{cm}^3 \approx 0{,}42\,\text{l}$ – ein halber Liter ($500\,\text{cm}^3$) passt nicht hinein.

</details>

### Aufgabe 5: Wann ist das Prisma fast ein Zylinder?

Ein Prisma mit regelmäßigem $n$-Eck und ein Zylinder haben denselben Radius und dieselbe Höhe. Ab welcher Eckenzahl hat das Prisma mehr als $99\,\%$ des Zylindervolumens? Probiere mit der Simulation. [Aufgabe laden](?n=6&ghost=1&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Bei $n = 6$ sind es etwa $82{,}7\,\%$, bei $n = 12$ etwa $95{,}5\,\%$. Ab $n = 26$ Ecken sind es mehr als $99\,\%$ (bei $n = 25$ erst $98{,}95\,\%$). [n = 26](?n=26&ghost=1)

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Bayern Jahrgangsstufe 8, Lernbereich 7 (Kreis und Zylinder): Prismen und Zylinder mit Netz, Oberfläche und Volumen. Sinnvoll im Anschluss an die Kreisberechnung (siehe Simulation zur Kreiszahl π).
- **Zwei Zugänge:** „Schichten stapeln“ begründet $V = G \cdot h$ (anschlussfähig an das Würfelzählen beim Quader), „Abrollen“ begründet $M = u \cdot h$. Die Rechnung im Bild lässt sich ausschalten (`calc=0`).
- **Typische Fehlvorstellungen:**
  - Mantel und Volumen werden verwechselt ($u \cdot h$ statt $G \cdot h$) – auch bei den Einheiten $\text{cm}^2$ und $\text{cm}^3$.
  - Beim Zylinder wird mit dem Durchmesser statt mit dem Radius gerechnet.
  - Bei der Oberfläche wird nur eine Grundfläche gezählt.
  - Verdoppelt man den Radius, verdoppelt sich das Volumen – tatsächlich wird es viermal so groß.
- **Zur Darstellung:** Beim Abrollen kippt das Prisma jeweils über eine Kante; der Zylinder rollt ohne zu rutschen, sodass sein Abdruck nach einer vollen Umdrehung genau $2\pi r$ lang ist. Das Dreieck ist gleichschenklig; die Länge der Schenkel wird berechnet und gerundet angezeigt.
