---
description: "Interaktive Simulation für die 10. und 11. Klasse: Nullstellen einer ganzrationalen Funktion ziehen, Vielfachheiten wählen und sehen, wann der Graph die x-Achse schneidet, berührt oder einen Terrassenpunkt hat – mit Linearfaktoren, Normalform, Vorzeichenbereichen und Randverhalten."
---

## Worum geht es?

Eine **ganzrationale Funktion** (Polynomfunktion) lässt sich – wenn sie genügend Nullstellen hat – in **Linearfaktoren** schreiben:

$$
f(x) = a \cdot (x - x_1)^{m_1} \cdot (x - x_2)^{m_2} \cdot (x - x_3)^{m_3}
$$

Dabei sind $x_1, x_2, x_3$ die Nullstellen, $m_1, m_2, m_3$ ihre **Vielfachheiten** und $a \neq 0$ der **Leitkoeffizient**. Der **Grad** ist $n = m_1 + m_2 + m_3$. Multipliziert man aus, erhält man die **Normalform** $f(x) = a x^n + \ldots$

**Verhalten an einer Nullstelle:**

| Vielfachheit | Graph an der Nullstelle | Vorzeichenwechsel? |
| --- | --- | --- |
| einfach ($m = 1$) | schneidet die $x$-Achse | ja |
| doppelt ($m = 2$) | berührt die $x$-Achse (Berührpunkt) | nein |
| dreifach ($m = 3$) | schmiegt sich an und schneidet (Terrassenpunkt) | ja |

Allgemein: Bei **ungerader** Vielfachheit wechselt das Vorzeichen, bei **gerader** nicht.

**Randverhalten:** Für sehr große $|x|$ bestimmt der Summand $a x^n$ das Verhalten. Für $x \to +\infty$ hat $f(x)$ das Vorzeichen von $a$. Ist $n$ gerade, verhalten sich beide Enden gleich; ist $n$ ungerade, gehen sie in verschiedene Richtungen.

## Ausprobieren

1. Ziehe die Nullstellen auf der $x$-Achse. Wie ändern sich Graph, Term und Normalform? Der Punkt rechts auf dem Graphen ändert den Leitkoeffizienten $a$.
2. [Doppelte Nullstelle](?z=2&x1=-2&m1=2&x2=2&m2=1&a=0.5): Was passiert mit dem Vorzeichen bei $x = -2$? Vergleiche mit einer [dreifachen Nullstelle](?z=2&x1=1&m1=3&x2=-3&m2=1&a=0.3).
3. Schiebe zwei einfache Nullstellen aufeinander. Was entsteht? Achte auf die Liste der Nullstellen.
4. Ändere das Vorzeichen von $a$. Welche der vier Skizzen beim Randverhalten wird hervorgehoben?
5. [Grad 4](?z=3&x1=-3&m1=1&x2=0&m2=2&x3=3&m3=1&a=0.2): Woran erkennt man am Graphen, dass der Grad gerade ist?

## Aufgaben

### Aufgabe 1: Eigenschaften ablesen

Gegeben ist $f(x) = -0{,}4 \cdot (x + 3)(x + 0{,}5)(x - 2{,}5)$. Gib Grad, Nullstellen und Randverhalten an. [Aufgabe laden](?a=-0.4&x1=-3&x2=-0.5&x3=2.5&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Grad 3 (drei einfache Linearfaktoren), Nullstellen $-3$, $-0{,}5$ und $2{,}5$, jeweils mit Vorzeichenwechsel. Wegen $a < 0$ und ungeradem Grad gilt: $x \to -\infty$: $f(x) \to +\infty$; $x \to +\infty$: $f(x) \to -\infty$. [Lösung zeigen](?a=-0.4&x1=-3&x2=-0.5&x3=2.5)

</details>

### Aufgabe 2: Welcher Term passt?

Ein Graph berührt die $x$-Achse bei $x = -2$, schneidet sie bei $x = 2$ und kommt von links unten. Gib einen passenden Term an. [Aufgabe laden](?z=2&x1=-2&m1=2&x2=2&m2=1&a=0.5&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Berührpunkt bei $-2$: doppelte Nullstelle; Schnittpunkt bei $2$: einfache Nullstelle. Grad 3, links unten bedeutet $a > 0$: z. B. $f(x) = 0{,}5\,(x + 2)^2 (x - 2)$. [Lösung zeigen](?z=2&x1=-2&m1=2&x2=2&m2=1&a=0.5)

</details>

### Aufgabe 3: Normalform

Multipliziere $f(x) = 0{,}3 \cdot (x - 1)^3 (x + 3)$ aus.

<details>
<summary>Lösung anzeigen</summary>

$(x - 1)^3 = x^3 - 3x^2 + 3x - 1$; mal $(x + 3)$: $x^4 - 6x^2 + 8x - 3$; mal $0{,}3$: $f(x) = 0{,}3x^4 - 1{,}8x^2 + 2{,}4x - 0{,}9$. [Zeigen](?z=2&x1=1&m1=3&x2=-3&m2=1&a=0.3)

</details>

### Aufgabe 4: Vorzeichentabelle

Erstelle für $f(x) = 0{,}2\,(x + 3)\,x^2\,(x - 3)$ eine Vorzeichentabelle. Wo ist $f(x) < 0$?

<details>
<summary>Lösung anzeigen</summary>

Grad 4, $a > 0$: ganz links positiv. Bei $-3$ (einfach) Wechsel zu negativ, bei $0$ (doppelt) kein Wechsel, bei $3$ (einfach) Wechsel zu positiv. Also $f(x) < 0$ für $-3 < x < 0$ und $0 < x < 3$. [Zeigen](?z=3&x1=-3&m1=1&x2=0&m2=2&x3=3&m3=1&a=0.2)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 10, Lernbereich „Ganzrationale Funktionen“ (LehrplanPLUS Gymnasium Bayern): Nullstellen und Vielfachheit, Faktorisieren, Verhalten im Unendlichen. Mit „Term und Eigenschaften zeigen“ aus eignet sich die Simulation für „Graph → Term“-Aufgaben.
- **Partnerarbeit:** Eine Person stellt im Geheimen einen Graphen ein (Eigenschaften aus), die andere bestimmt den Term.
- **Modell:** Nullstellen liegen auf halben Einheiten zwischen $-4$ und $4$, die $y$-Achse passt sich weich an. Gezeigt werden nur Funktionen, die vollständig in Linearfaktoren zerfallen.
- **Häufige Stolpersteine:**
  - Das Vorzeichen in der Klammer: Die Nullstelle von $(x + 2)$ ist $-2$.
  - „Der Graph schneidet an jeder Nullstelle die Achse.“ – Bei gerader Vielfachheit berührt er sie nur.
  - Beim Randverhalten wird nur auf $a$ geachtet und der Grad vergessen.
