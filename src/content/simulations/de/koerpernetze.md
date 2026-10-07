---
description: Interaktive 3D-Simulation zu Körpernetzen – Würfel, Quader, Prisma, Pyramide und Zylinder falten, Würfelnetze prüfen und die Oberfläche aus dem Netz bestimmen.
---

## Worum geht es?

Schneidet man einen Körper entlang einiger Kanten auf und klappt ihn flach auseinander, entsteht ein **Netz**. Das Netz besteht aus allen Begrenzungsflächen des Körpers, die an Kanten zusammenhängen. Umgekehrt lässt sich ein Netz zum Körper **falten**.

Der **Oberflächeninhalt** $O$ ist die Summe der Flächeninhalte aller Flächen – man kann ihn also direkt am Netz bestimmen:

| Körper | Flächen im Netz | Oberflächeninhalt |
| --- | --- | --- |
| Würfel (Kante $a$) | 6 gleiche Quadrate | $O = 6 \cdot a^2$ |
| Quader ($a$, $b$, $c$) | 3 Paare gleicher Rechtecke | $O = 2 \cdot (ab + ac + bc)$ |
| Prisma | Grund- und Deckfläche $G$, Mantel $M$ | $O = 2 \cdot G + M$ |
| Quadratische Pyramide | Quadrat, 4 gleiche Dreiecke | $O = a^2 + 4 \cdot \tfrac{1}{2} \cdot a \cdot h_a$ |
| Zylinder ($r$, $h$) | 2 Kreise, 1 Rechteck | $O = 2 \cdot \pi r^2 + 2\pi r \cdot h$ |

Beim Zylinder ist der Mantel ein Rechteck, dessen eine Seite so lang ist wie der **Kreisumfang** $u = 2\pi r$ – sonst würde er beim Aufrollen nicht genau einmal um den Kreis passen.

**Würfelnetze:** Es gibt genau **11** verschiedene Würfelnetze (Drehungen und Spiegelungen zählen nicht als neu). Nicht jede Anordnung von sechs Quadraten gehört dazu. Hilfreich ist: Gegenüberliegende Flächen eines Würfels liegen im Netz **nie nebeneinander**; in einer Reihe aus drei Quadraten sind das erste und das dritte gegenüber.

## Ausprobieren

1. Drücke **Falten** und beobachte, wie aus dem Kreuz ein Würfel wird. Drehe die Ansicht, indem du auf der Zeichenfläche ziehst.
2. Ist Netz Nr. 3 ein Würfelnetz? Überlege zuerst, dann falte. [Netz Nr. 3 laden](?net=3&pairs=0)
3. Schalte **Gegenüberliegende Flächen gleich färben** ein und blättere durch die Netze. Liegen zwei gleich gefärbte Flächen jemals nebeneinander?
4. Tippe auf eine Fläche: Unter „Angetippte Fläche“ steht ihr Flächeninhalt; beim Würfel und Quader wird die gegenüberliegende Fläche gestrichelt markiert.
5. Rolle den Zylindermantel langsam mit dem Regler **Faltung** auf. Die rote Kante wickelt sich genau einmal um den Grundkreis. [Zylinder halb gerollt](?body=zylinder&f=55)
6. Verändere bei der Pyramide die Höhe $h_a$ der Seitendreiecke. Wie verändert sich die Spitze? [Pyramide](?body=pyramide&a=3&ha=4&f=100)

## Aufgaben

### Aufgabe 1: Würfelnetz oder nicht?

Welche der 15 Netze lassen sich zu einem Würfel falten? Entscheide zuerst ohne Falten und prüfe dann mit der Simulation. [Aufgabe laden](?pairs=0&areas=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Die Netze 3, 7, 10 und 13 sind **keine** Würfelnetze, alle übrigen (11 Stück) schon.

- Nr. 3: Beide „Deckel“ liegen auf derselben Seite des Viererstreifens – sie landen übereinander.
- Nr. 7: Fünf Quadrate in einer Reihe – das fünfte liegt auf dem ersten.
- Nr. 10: Vier Quadrate bilden ein Quadrat aus $2 \times 2$ Feldern – das geht beim Würfel nie.
- Nr. 13: Eine Treppe aus drei Quadraten oben, zwei darunter und einem rechts – das linke obere Quadrat und das untere Ende der Spalte landen auf derselben Würfelseite.

</details>

### Aufgabe 2: Spielwürfel

Bei einem Spielwürfel ergeben die Augenzahlen gegenüberliegender Seiten zusammen immer 7. Im Netz Nr. 9 liegt die Sechs am linken Ende der Dreierreihe (an diesem Feld hängt oben und unten je ein weiteres Quadrat). Wo muss die Eins stehen? Überlege, dann schalte die Würfelaugen ein. [Netz laden](?net=9&pairs=0&areas=0)

<details>
<summary>Lösung anzeigen</summary>

Die Eins liegt der Sechs gegenüber. In einer Reihe aus drei Quadraten ist das nicht das Nachbarfeld, sondern das übernächste – also das rechte Ende der Dreierreihe. Die beiden Quadrate oben und unten an der Sechs liegen einander gegenüber (2 und 5), ebenso das Feld zwischen Sechs und Eins und das Quadrat ganz links oben (3 und 4). [Würfelaugen zeigen](?net=9&dice=1&f=100)

</details>

### Aufgabe 3: Oberfläche eines Quaders

Ein Quader ist $4\,\text{cm}$ lang, $3\,\text{cm}$ breit und $2\,\text{cm}$ hoch. Berechne seine Oberfläche mithilfe des Netzes. [Aufgabe laden](?body=quader&a=4&b=3&c=2&areas=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Das Netz besteht aus je zwei Rechtecken mit $4 \cdot 3 = 12\,\text{cm}^2$, $4 \cdot 2 = 8\,\text{cm}^2$ und $3 \cdot 2 = 6\,\text{cm}^2$:

$$O = 2 \cdot (12 + 8 + 6)\,\text{cm}^2 = 52\,\text{cm}^2$$

</details>

### Aufgabe 4: Pyramide

Eine quadratische Pyramide hat die Grundkante $a = 3\,\text{cm}$; die Seitendreiecke haben die Höhe $h_a = 4\,\text{cm}$. Berechne den Oberflächeninhalt. [Aufgabe laden](?body=pyramide&a=3&ha=4&areas=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$O = a^2 + 4 \cdot \tfrac{1}{2} \cdot a \cdot h_a = 9\,\text{cm}^2 + 4 \cdot 6\,\text{cm}^2 = 33\,\text{cm}^2$.

</details>

### Aufgabe 5: Der Zylindermantel

Ein Zylinder hat den Radius $r = 1{,}5\,\text{cm}$ und die Höhe $h = 4\,\text{cm}$. Wie lang ist das Rechteck des Mantels? Berechne den Mantel und die Oberfläche. [Aufgabe laden](?body=zylinder&r=1.5&h=4&areas=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Die Länge ist der Kreisumfang $u = 2\pi r = 3\pi\,\text{cm} \approx 9{,}42\,\text{cm}$.

$M = u \cdot h \approx 9{,}42\,\text{cm} \cdot 4\,\text{cm} \approx 37{,}70\,\text{cm}^2$, $\quad G = \pi r^2 \approx 7{,}07\,\text{cm}^2$

$O = 2 \cdot G + M \approx 14{,}14\,\text{cm}^2 + 37{,}70\,\text{cm}^2 \approx 51{,}84\,\text{cm}^2$

</details>

### Aufgabe 6: Rückwärts gedacht

Ein Würfel hat den Oberflächeninhalt $150\,\text{cm}^2$. Wie lang ist eine Kante?

<details>
<summary>Lösung anzeigen</summary>

Eine Fläche hat $150\,\text{cm}^2 : 6 = 25\,\text{cm}^2$, also ist $a = 5\,\text{cm}$, denn $5 \cdot 5 = 25$. [Würfel mit a = 5 cm](?a=5&f=100)

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Bayern Jahrgangsstufe 5 (Lernbereich 4.2: Oberfläche von Quadern, Würfel- und Quadernetze), Jahrgangsstufe 6 (Lernbereich 2.1: Oberflächen einfacher Körper) und Jahrgangsstufe 8 (Lernbereich 7: Netz und Oberfläche von Prisma und Zylinder). Pyramide und Zylinder eignen sich auch als Ausblick.
- **Raumvorstellung zuerst:** Lassen Sie vor dem Falten Vermutungen äußern (z. B. mit verdeckten Ergebnissen über „Teilen“). Die gezeigten Flächeninhalte und Maße lassen sich ausschalten.
- **Typische Fehlvorstellungen:**
  - „Jedes Netz aus sechs Quadraten ist ein Würfelnetz.“ – Die Netze 3, 7, 10 und 13 zeigen das Gegenteil.
  - Gegenüberliegende Flächen werden im Netz nebeneinander gesucht.
  - Beim Zylinder wird als Länge des Mantelrechtecks der Durchmesser statt des Umfangs angenommen.
  - Bei der Pyramide werden die Höhe $h_a$ der Seitendreiecke und die Körperhöhe $h$ verwechselt; es gilt $h = \sqrt{h_a^2 - \left(\tfrac{a}{2}\right)^2}$ (Satz des Pythagoras, ab Jahrgangsstufe 9). Damit sich die Pyramide schließt, muss $h_a > \tfrac{a}{2}$ sein.
- **Zur Darstellung:** Der Zylindermantel wird aus 61 schmalen Streifen aufgerollt, die Kreise sind 61-Ecke mit demselben Umfang; der Unterschied zum echten Kreis ist kleiner als ein Promille. Das Prisma hat ein gleichseitiges Dreieck als Grundfläche.
