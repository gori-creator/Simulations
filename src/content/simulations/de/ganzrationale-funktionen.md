---
description: "Interaktive Simulation für die 10. und 11. Klasse: Nullstellen einer ganzrationalen Funktion als Perlen ziehen, Vielfachheiten antippen und verschmelzen lassen – mit Linearfaktorform und exakter Normalform, Vorzeichentabelle, Lupe für das Verhalten an den Nullstellen und dem Blick aus der Ferne auf das Randverhalten."
---

## Worum geht es?

Eine **ganzrationale Funktion** (Polynomfunktion), die in **Linearfaktoren** zerfällt, lässt sich so schreiben:

$$
f(x) = a \cdot (x - x_1)^{m_1} \cdot (x - x_2)^{m_2} \cdot (x - x_3)^{m_3}
$$

Dabei sind $x_1, x_2, x_3$ die **Nullstellen**, $m_1, m_2, m_3$ ihre **Vielfachheiten** und $a \neq 0$ der **Leitkoeffizient**. Der **Grad** ist $n = m_1 + m_2 + m_3$. Fallen zwei Nullstellen zusammen, addieren sich ihre Vielfachheiten: $(x - 1) \cdot (x - 1)^2 = (x - 1)^3$. Multipliziert man aus, entsteht die **Normalform**, zum Beispiel

$$
0{,}5 \cdot (x + 2)(x - 0{,}5)(x - 3) = 0{,}5x^3 - 0{,}75x^2 - 2{,}75x + 1{,}5 .
$$

Der **y-Achsenabschnitt** ist das Absolutglied: $f(0) = 0{,}5 \cdot 2 \cdot (-0{,}5) \cdot (-3) = 1{,}5$.

| Vielfachheit $m$ | Graph an der Nullstelle | Vorzeichenwechsel? | nahe $x_0$ wie … |
| --- | --- | --- | --- |
| 1 (einfach) | schneidet die $x$-Achse | ja | eine Gerade |
| 2 (doppelt) | berührt die $x$-Achse | nein | eine Parabel |
| 3 (dreifach) | schmiegt sich an und schneidet (Terrassenpunkt) | ja | eine kubische Parabel |
| 4 (vierfach) | berührt, sehr flach | nein | $x^4$ |

Der Grund steht in der letzten Spalte: Nahe einer Nullstelle $x_0$ ändern sich die übrigen Faktoren kaum. Dort gilt $f(x) \approx c \cdot (x - x_0)^m$, wobei $c$ das Produkt aus $a$ und den übrigen Faktoren an der Stelle $x_0$ ist. Für $f(x) = 0{,}2 \cdot (x + 3) \cdot x^2 \cdot (x - 3)$ ist nahe $0$ also $c = 0{,}2 \cdot 3 \cdot (-3) = -1{,}8$ und $f(x) \approx -1{,}8x^2$: eine nach unten geöffnete Parabel.

In der **Vorzeichentabelle** bekommt jeder Faktor eine Zeile: $(x - x_0)^m$ ist rechts von $x_0$ positiv, links davon $(-1)^m$, also bei ungeradem $m$ negativ. Das Vorzeichen von $f$ ist das Produkt der Spalte (mit dem Vorzeichen von $a$).

**Randverhalten:** Klammert man $x^n$ aus, gilt $\frac{f(x)}{a \cdot x^n} = \left(1 - \frac{x_1}{x}\right)^{m_1} \cdots \to 1$ für $|x| \to \infty$. Für große $|x|$ zählt also nur der Summand $a x^n$. Im Beispiel oben ist bei $x = 100$ schon $\frac{f(100)}{0{,}5 \cdot 100^3} = 1{,}02 \cdot 0{,}995 \cdot 0{,}97 \approx 0{,}984$. Für $x \to +\infty$ hat $f(x)$ das Vorzeichen von $a$; bei geradem $n$ verhalten sich beide Enden gleich, bei ungeradem $n$ gegensätzlich.

## Ausprobieren

1. [Drei einfache Nullstellen](?a=0.5&z=3&x1=-2&m1=1&x2=0.5&m2=1&x3=3&m3=1): Ziehe die Perlen auf der $x$-Achse. Tippe eine Perle an – jeder Ring steht für eine Vielfachheit mehr. Wie ändern sich Graph, Term und Vorzeichentabelle?
2. Vergleiche eine [doppelte](?z=2&x1=-2&m1=2&x2=2&m2=1&a=0.5), eine [dreifache](?z=2&x1=1&m1=3&x2=-3&m2=1&a=0.3) und eine [vierfache Nullstelle](?z=2&x1=1&m1=4&x2=-3&m2=1&a=0.1). Wann wechselt das Vorzeichen?
3. Schiebe zwei Perlen aufeinander, bis sie verschmelzen. Was passiert mit den Ringen und mit dem Term? [Alle drei fallen zusammen](?z=3&x1=1&m1=1&x2=1&m2=2&x3=1&m3=1&a=0.5): Welche Funktion entsteht?
4. Ziehe den Griff für $a$ auf dem Graphen nach oben und nach unten, auch unter die $x$-Achse. Welche Pfeile des Randverhaltens drehen sich um? [a negativ](?z=3&x1=-3&m1=1&x2=-0.5&m2=1&x3=2.5&m3=1&a=-0.4)
5. [Lupe einschalten](?z=3&x1=-3&m1=1&x2=0&m2=2&x3=3&m3=1&a=0.2&near=1): Zeige mit der Maus nacheinander auf die Perlen (auf dem Tablet: eine Perle kurz verschieben). Wie sieht der Graph in der Lupe jeweils aus? Vergleiche mit den gestrichelten Näherungen.
6. Drücke „Blick aus der Ferne“. Die Ansicht zoomt 20-fach heraus. Warum sind $f$ und die gestrichelte Kurve $a x^n$ kaum noch zu unterscheiden?
7. [Grad 9](?z=3&x1=-2&m1=3&x2=1&m2=4&x3=3&m3=2&a=0.1&near=1) und [Grad 12](?z=3&x1=-4&m1=4&x2=0&m2=4&x3=4&m3=4&a=-3): Lies an der Vorzeichentabelle ab, wo $f$ negativ ist.

## Aufgaben

### Aufgabe 1: Eigenschaften ablesen

Gegeben ist $f(x) = -0{,}4 \cdot (x + 3)(x + 0{,}5)(x - 2{,}5)$. Gib Grad, Nullstellen, Randverhalten und $f(0)$ an. [Aufgabe laden](?z=3&x1=-3&m1=1&x2=-0.5&m2=1&x3=2.5&m3=1&a=-0.4&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Grad 3, einfache Nullstellen $-3$, $-0{,}5$ und $2{,}5$ (jeweils mit Vorzeichenwechsel). Wegen $a < 0$ und ungeradem Grad: $x \to -\infty$: $f(x) \to +\infty$; $x \to +\infty$: $f(x) \to -\infty$. $f(0) = -0{,}4 \cdot 3 \cdot 0{,}5 \cdot (-2{,}5) = 1{,}5$. [Lösung zeigen](?z=3&x1=-3&m1=1&x2=-0.5&m2=1&x3=2.5&m3=1&a=-0.4&yi=1)

</details>

### Aufgabe 2: Welcher Term passt?

Ein Graph dritten Grades berührt die $x$-Achse bei $x = -2$, schneidet sie bei $x = 2$ und geht durch den Punkt $(1 \mid -4{,}5)$. Bestimme den Term in Linearfaktorform und in Normalform. [Aufgabe laden](?z=2&x1=-2&m1=2&x2=2&m2=1&a=0.5&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Berührpunkt: doppelte Nullstelle, Schnittpunkt: einfache Nullstelle, also $f(x) = a \cdot (x + 2)^2 (x - 2)$. Punktprobe: $f(1) = a \cdot 9 \cdot (-1) = -4{,}5$, also $a = 0{,}5$. Ausmultipliziert: $(x + 2)^2 (x - 2) = (x^2 + 4x + 4)(x - 2) = x^3 + 2x^2 - 4x - 8$, also $f(x) = 0{,}5x^3 + x^2 - 2x - 4$. [Lösung zeigen](?z=2&x1=-2&m1=2&x2=2&m2=1&a=0.5)

</details>

### Aufgabe 3: Ausmultiplizieren

Multipliziere $f(x) = 0{,}3 \cdot (x - 1)^3 (x + 3)$ aus. Prüfe mit „Ausmultiplizieren Schritt für Schritt“.

<details>
<summary>Lösung anzeigen</summary>

$(x - 1)^3 = x^3 - 3x^2 + 3x - 1$; mal $(x + 3)$: $x^4 - 6x^2 + 8x - 3$; mal $0{,}3$: $f(x) = 0{,}3x^4 - 1{,}8x^2 + 2{,}4x - 0{,}9$. [Zeigen](?z=2&x1=1&m1=3&x2=-3&m2=1&a=0.3)

</details>

### Aufgabe 4: Vorzeichentabelle

Erstelle für $f(x) = 0{,}2 \cdot (x + 3) \cdot x^2 \cdot (x - 3)$ eine Vorzeichentabelle mit einer Zeile pro Faktor. Wo ist $f(x) < 0$? Berechne $f(1)$ und gib das Randverhalten an. [Aufgabe laden](?z=3&x1=-3&m1=1&x2=0&m2=2&x3=3&m3=1&a=0.2&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

| | $x < -3$ | $-3 < x < 0$ | $0 < x < 3$ | $x > 3$ |
| --- | --- | --- | --- | --- |
| $x + 3$ | $-$ | $+$ | $+$ | $+$ |
| $x^2$ | $+$ | $+$ | $+$ | $+$ |
| $x - 3$ | $-$ | $-$ | $-$ | $+$ |
| $f(x)$ | $+$ | $-$ | $-$ | $+$ |

Also $f(x) < 0$ für $-3 < x < 0$ und für $0 < x < 3$; bei $0$ kein Vorzeichenwechsel (doppelte Nullstelle). $f(1) = 0{,}2 \cdot 4 \cdot 1 \cdot (-2) = -1{,}6$. Normalform $0{,}2x^4 - 1{,}8x^2$: Grad 4 gerade, $a > 0$, also $f(x) \to +\infty$ für $x \to \pm\infty$. [Zeigen](?z=3&x1=-3&m1=1&x2=0&m2=2&x3=3&m3=1&a=0.2)

</details>

### Aufgabe 5: Lupe an der doppelten Nullstelle

Begründe für die Funktion aus Aufgabe 4, dass sich der Graph nahe $x = 0$ wie die Parabel $y = -1{,}8x^2$ verhält. Vergleiche $f(0{,}1)$ mit $-1{,}8 \cdot 0{,}1^2$.

<details>
<summary>Lösung anzeigen</summary>

Nahe $0$ ist $(x + 3)(x - 3) \approx 3 \cdot (-3) = -9$, also $f(x) \approx 0{,}2 \cdot (-9) \cdot x^2 = -1{,}8x^2$. Genau: $f(0{,}1) = 0{,}2 \cdot 3{,}1 \cdot 0{,}01 \cdot (-2{,}9) = -0{,}01798$, die Näherung liefert $-0{,}018$. [Lupe zeigen](?z=3&x1=-3&m1=1&x2=0&m2=2&x3=3&m3=1&a=0.2&near=1)

</details>

### Aufgabe 6: Wahr oder falsch?

a) „Eine ganzrationale Funktion vom Grad 4 hat vier Nullstellen.“ b) „Wenn $a > 0$ ist, gilt $f(x) \to +\infty$ für $x \to -\infty$.“

<details>
<summary>Lösung anzeigen</summary>

a) Falsch: höchstens vier. $f(x) = 0{,}5 \cdot (x - 1)^4$ hat nur die Nullstelle $1$ (vierfach), $x^4 + 1$ hat gar keine. [Beispiel](?z=3&x1=1&m1=1&x2=1&m2=2&x3=1&m3=1&a=0.5) b) Nur bei geradem Grad. Bei ungeradem Grad und $a > 0$ gilt $f(x) \to -\infty$ für $x \to -\infty$.

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 10, Lernbereich „Ganzrationale Funktionen“ im LehrplanPLUS Gymnasium Bayern (Nullstellen mit Vielfachheit, Randverhalten); in Jahrgangsstufe 11 zur Wiederholung vor der Kurvendiskussion. Ob Vorzeichentabellen mit einer Zeile pro Faktor dort üblich sind, bitte am Lehrplan und im eingeführten Schulbuch prüfen.
- **Term erraten:** Mit „Term und Eigenschaften zeigen“ aus erscheint nur der Graph. Paare können sich gegenseitig Graphen einstellen und den Term bestimmen lassen; „Term aufdecken“ löst auf.
- **Von der Lupe zur Fernsicht:** Die Lupe zeigt, warum der Graph an einer Nullstelle schneidet oder berührt (er verhält sich dort wie eine Potenz $c \cdot (x - x_0)^m$), der Blick aus der Ferne, warum nur $a x^n$ das Randverhalten bestimmt. Beides lässt sich gut nacheinander besprechen.
- **Modell:** Nullstellen auf halben Einheiten zwischen $-4$ und $4$, Vielfachheiten bis 4. Gezeigt werden nur Funktionen, die vollständig in Linearfaktoren zerfallen; Funktionen wie $x^2 + 1$ kommen nicht vor.
- **Häufige Stolpersteine:**
  - Vorzeichen in der Klammer: Die Nullstelle von $(x + 2)$ ist $-2$.
  - „Der Graph schneidet an jeder Nullstelle die Achse.“ – Bei gerader Vielfachheit berührt er sie nur.
  - Beim Randverhalten wird nur auf $a$ geachtet und der Grad vergessen (oder umgekehrt).
  - Beim Ausmultiplizieren wird $a$ nur mit dem ersten Faktor multipliziert.
