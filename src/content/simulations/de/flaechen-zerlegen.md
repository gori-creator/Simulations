---
description: "Interaktive Simulation für die 6. Klasse: Flächeninhalt von Parallelogramm, Dreieck und Trapez durch Zerlegen, Verschieben und Ergänzen herleiten – mit Kästchenzählen als Kontrolle und der Scherung: gleiche Grundseite und gleiche Höhe ergeben gleichen Flächeninhalt."
---

## Worum geht es?

Den Flächeninhalt eines **Rechtecks** kennst du schon: Länge mal Breite. Parallelogramm, Dreieck und Trapez lassen sich durch **Zerlegen**, **Verschieben** und **Ergänzen** auf das Rechteck zurückführen. Dabei ändert sich der Flächeninhalt nicht – es wird nichts weggenommen und nichts hinzugefügt.

Wichtig sind immer zwei Größen: die **Grundseite** $g$ und die zugehörige **Höhe** $h$. Die Höhe ist der **Abstand** der gegenüberliegenden Ecke (bzw. Seite) von der Grundseite. Sie steht **senkrecht** auf der Grundseite. Liegt ihr Fußpunkt außerhalb, verlängert man die Grundseite.

**Parallelogramm:** Schneidet man entlang der Höhe ein Dreieck ab und schiebt es auf die andere Seite, entsteht ein Rechteck mit der Länge $g$ und der Breite $h$:

$$
A_{\text{Parallelogramm}} = g \cdot h
$$

Ist das Parallelogramm stark geneigt, reicht ein Schnitt nicht – dann zerlegt man es in mehrere Streifen.

**Dreieck:** Eine Kopie des Dreiecks wird um $180^\circ$ um den Mittelpunkt $M$ einer Seite gedreht. Beide zusammen ergänzen sich zu einem Parallelogramm mit derselben Grundseite und derselben Höhe. Das Dreieck ist die Hälfte davon:

$$
A_{\text{Dreieck}} = \frac{g \cdot h}{2} = g \cdot h : 2
$$

**Trapez** mit den parallelen Grundseiten $a$ und $c$: Die gedrehte Kopie ergänzt es zu einem Parallelogramm mit der Grundseite $a + c$. Oder man zerlegt es entlang einer Diagonalen in zwei Dreiecke mit derselben Höhe $h$:

$$
A_{\text{Trapez}} = \frac{(a + c) \cdot h}{2} = \frac{a \cdot h}{2} + \frac{c \cdot h}{2}
$$

Beispiel: $a = 7\,\text{cm}$, $c = 3\,\text{cm}$, $h = 4\,\text{cm}$ ergibt $A = (7 + 3) \cdot 4 : 2\,\text{cm}^2 = 20\,\text{cm}^2$.

In der Simulation ist ein Kästchen $1\,\text{cm}$ breit, also $1\,\text{cm}^2$ groß. Mit „Kästchen zählen“ kannst du jedes Ergebnis nachprüfen.

## Ausprobieren

1. Drücke bei [diesem Parallelogramm](?g=6&h=4&s=2) „Zerlegen und verschieben“. Welches Teil wandert wohin? Warum passt es genau?
2. Lass danach die Kästchen zählen. Stimmt die Anzahl mit $g \cdot h$ überein?
3. Zerlege ein [stark geneigtes Parallelogramm](?g=3&h=4&s=7). Wo liegt der Fußpunkt der Höhe? In wie viele Teile wird es zerlegt?
4. Verdopple das [Dreieck](?fig=tri) und lege das Parallelogramm danach zum Rechteck um. Welche Kästchen gehören zum Dreieck, welche zur Kopie?
5. Drücke beim [Dreieck](?fig=tri&sch=1) „Spitze verschieben“ oder ziehe die Spitze $C$ selbst. Was ändert sich an der Form, was am Flächeninhalt?
6. Vergleiche beim [Trapez](?fig=trap) beide Wege: [Kopie drehen](?fig=trap&sz=erg) und [in zwei Dreiecke zerlegen](?fig=trap&sz=drei). Führen sie zum selben Ergebnis?
7. Stelle beim Trapez [c = 0 cm](?fig=trap&c=0) und [c = a](?fig=trap&a=5&c=5) ein. Welche Figuren entstehen, und was wird aus der Formel?

## Aufgaben

### Aufgabe 1: Parallelogramm

[Aufgabe laden](?g=5&h=3&s=2&show=0&_hide=1) Bestimme den Flächeninhalt des Parallelogramms. Zerlege es dann zur Kontrolle.

<details>
<summary>Lösung anzeigen</summary>

$g = 5\,\text{cm}$, $h = 3\,\text{cm}$, also $A = 5\,\text{cm} \cdot 3\,\text{cm} = 15\,\text{cm}^2$. Das Rechteck nach dem Verschieben besteht aus $15$ Kästchen. [Lösung zeigen](?g=5&h=3&s=2&sp=rect)

</details>

### Aufgabe 2: Dreieck

[Aufgabe laden](?fig=tri&g=8&h=5&s=3&show=0&_hide=1) Berechne den Flächeninhalt des Dreiecks.

<details>
<summary>Lösung anzeigen</summary>

$A = 8\,\text{cm} \cdot 5\,\text{cm} : 2 = 40\,\text{cm}^2 : 2 = 20\,\text{cm}^2$. Zwei solche Dreiecke ergeben ein Parallelogramm mit $40\,\text{cm}^2$. [Lösung zeigen](?fig=tri&g=8&h=5&s=3&st=erg)

</details>

### Aufgabe 3: Ein stumpfwinkliges Dreieck

[Aufgabe laden](?fig=tri&g=4&h=3&s=7&show=0&_hide=1) Das Dreieck hat die Ecken $A(0 \mid 0)$, $B(4 \mid 0)$ und $C(7 \mid 3)$. Mia rechnet $7 \cdot 3 : 2 = 10{,}5$. Was hat sie falsch gemacht?

<details>
<summary>Lösung anzeigen</summary>

Die Grundseite ist $[AB]$ mit $g = 4\,\text{cm}$, nicht $7\,\text{cm}$. Die Höhe ist $h = 3\,\text{cm}$, ihr Fußpunkt $(7 \mid 0)$ liegt außerhalb der Grundseite. Also $A = 4 \cdot 3 : 2\,\text{cm}^2 = 6\,\text{cm}^2$. [Lösung zeigen](?fig=tri&g=4&h=3&s=7&st=erg)

</details>

### Aufgabe 4: Trapez auf zwei Wegen

[Aufgabe laden](?fig=trap&a=9&c=5&h=4&s=2&show=0&_hide=1) Berechne den Flächeninhalt mit der Trapezformel und durch Zerlegen in zwei Dreiecke.

<details>
<summary>Lösung anzeigen</summary>

Formel: $A = (9 + 5) \cdot 4 : 2\,\text{cm}^2 = 28\,\text{cm}^2$. Zwei Dreiecke: $9 \cdot 4 : 2 + 5 \cdot 4 : 2 = 18 + 10 = 28$, also $28\,\text{cm}^2$. [Lösung zeigen](?fig=trap&a=9&c=5&h=4&s=2&sz=drei)

</details>

### Aufgabe 5: Gleich groß, verschieden geformt

Finde Parallelogramme mit ganzzahligen Seiten (in cm) und dem Flächeninhalt $24\,\text{cm}^2$ (Grundseite höchstens $10\,\text{cm}$, Höhe höchstens $8\,\text{cm}$). Wie viele verschiedene Parallelogramme gibt es, wenn man auch den Versatz ändern darf?

<details>
<summary>Lösung anzeigen</summary>

$g \cdot h = 24$ mit $g \le 10$ und $h \le 8$: $g = 3$, $h = 8$; $g = 4$, $h = 6$; $g = 6$, $h = 4$; $g = 8$, $h = 3$. Zu jedem Paar gibt es unendlich viele Parallelogramme: Verschiebt man die obere Seite parallel zur Grundseite, bleibt der Flächeninhalt $24\,\text{cm}^2$. [Beispiel zeigen](?g=4&h=6&s=5&sch=1)

</details>

### Aufgabe 6: Rückwärts rechnen

Ein Trapez hat die Grundseiten $a = 8\,\text{cm}$ und $c = 4\,\text{cm}$ und den Flächeninhalt $30\,\text{cm}^2$. Wie hoch ist es?

<details>
<summary>Lösung anzeigen</summary>

$(8 + 4) \cdot h : 2 = 30$, also $6 \cdot h = 30$ und $h = 5\,\text{cm}$. [Lösung zeigen](?fig=trap&a=8&c=4&h=5&s=2)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 6, Lernbereich 2 „Flächeninhalt und Volumen“ (LehrplanPLUS Gymnasium Bayern): Flächeninhalt von Parallelogramm, Dreieck und Trapez durch Zerlegen und Ergänzen herleiten. Die Zuordnung bitte am Lehrplan prüfen. Gut als Einstieg am Whiteboard: erst vermuten lassen, dann zerlegen.
- **Ablauf:** Zum Parallelogramm passt die Reihenfolge Parallelogramm → Rechteck, danach Dreieck → Parallelogramm und zuletzt das Trapez mit zwei Wegen. Mit „Flächeninhalt sofort zeigen“ aus erscheint das Ergebnis erst nach dem Zerlegen oder Zählen.
- **Scherung:** „Spitze verschieben“ macht sichtbar, dass nur Grundseite und Höhe zählen. Daraus lässt sich die Frage ableiten, warum die schräge Seite in keiner Formel vorkommt.
- **Modell:** Alle Ecken liegen auf Gitterpunkten, die Grundseite liegt waagerecht. Die Höhe wird von der linken oberen Ecke aus eingezeichnet; beim Trapez ist $h$ der Abstand der beiden parallelen Seiten.
- **Häufige Stolpersteine:**
  - Die schräge Seite wird als Höhe genommen – die Höhe steht senkrecht auf der Grundseite.
  - Beim Dreieck wird das „$: 2$“ vergessen; das verdoppelte Dreieck erinnert daran.
  - Bei stumpfwinkligen Dreiecken oder stark geneigten Parallelogrammen liegt der Fußpunkt außerhalb – die Grundseite muss verlängert werden, ihre Länge bleibt aber $g$.
  - Beim Trapez werden $a$ und $c$ multipliziert statt addiert.
