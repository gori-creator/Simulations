---
description: "Interaktive Simulation für die Oberstufe: gebrochen-rationale Funktionen aus Linearfaktoren – Zähler- und Nennernullstellen ziehen, Definitionsmenge, Polstellen mit und ohne Vorzeichenwechsel, behebbare Lücken und waagrechte oder schräge Asymptoten per Polynomdivision."
---

## Worum geht es?

Eine **gebrochen-rationale Funktion** ist ein Quotient zweier ganzrationaler Funktionen, zum Beispiel

$$f(x) = \frac{(x-1)(x+1)}{x-2}.$$

Die Nullstellen des Nenners gehören nicht zur Definitionsmenge – dort hat $f$ eine **Definitionslücke**. Was dort passiert, hängt vom Zähler ab:

- **Polstelle:** Der Zähler ist an dieser Stelle nicht null. Der Graph schmiegt sich an eine **senkrechte Asymptote**, die Funktionswerte gehen gegen $+\infty$ oder $-\infty$. Ist der Nennerfaktor einfach (allgemein: ungerade oft vorhanden), wechselt das Vorzeichen (**mit VZW**); bei einem doppelten Faktor wie $(x-1)^2$ nicht (**ohne VZW**).
- **Behebbare Lücke:** Zähler und Nenner haben denselben Linearfaktor. Nach dem Kürzen ist die Funktion dort stetig fortsetzbar – im Graphen bleibt nur ein **Loch**.

Für $x \to \pm\infty$ entscheidet der **Grad** von Zähler ($m$) und Nenner ($n$):

| Grade | Verhalten für $x \to \pm\infty$ |
|---|---|
| $m < n$ | waagrechte Asymptote $y = 0$ |
| $m = n$ | waagrechte Asymptote $y = \frac{\text{Leitkoeffizient Zähler}}{\text{Leitkoeffizient Nenner}}$ |
| $m = n + 1$ | schräge Asymptote (Polynomdivision) |
| $m > n + 1$ | ganzrationale Näherungskurve |

*Beispiel:* $\frac{x^2-1}{x-2} = x + 2 + \frac{3}{x-2}$. Der Bruch $\frac{3}{x-2}$ geht für $x \to \pm\infty$ gegen $0$, also ist $y = x + 2$ schräge Asymptote.

## Ausprobieren

1. [Eine Polstelle](?zn=1&z1=1&pn=1&p1=-2): Ziehe die grüne Nullstelle und die rote Nennermarke. Was ändert sich an der Asymptote $y = 1$?
2. [Doppelte Polstelle](?zn=0&a=2&pn=2&p1=1&p2=1): Warum zeigen beide Äste nach oben?
3. [Behebbare Lücke](?zn=2&z1=1&z2=-1&pn=1&p1=1): Ziehe die Nennermarke von $x = 1$ weg und wieder zurück. Was passiert mit dem Graphen?
4. [Schräge Asymptote](?zn=2&z1=1&z2=-1&pn=1&p1=2): Drücke „Punkt entlanglaufen lassen“ und beobachte den Abstand zur Asymptote.
5. [Zählergrad 3](?zn=3&z1=-2&z2=0&z3=2&pn=1&p1=-1&a=0.5): Welche Kurve nähert den Graphen für große $|x|$ an?

## Aufgaben

### Aufgabe 1: Steckbrief

Untersuche $f(x) = \frac{x-1}{x+2}$: Definitionsmenge, Nullstelle, Polstelle (mit oder ohne VZW) und Asymptote. [Aufgabe laden](?zn=1&z1=1&pn=1&p1=-2&asy=0&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$D = \mathbb{R} \setminus \{-2\}$; Nullstelle $x = 1$; Polstelle $x = -2$ mit VZW; Zählergrad = Nennergrad, also waagrechte Asymptote $y = \frac{1}{1} = 1$. [Lösung zeigen](?zn=1&z1=1&pn=1&p1=-2)

</details>

### Aufgabe 2: Loch oder Pol?

Untersuche $f(x) = \frac{x^2-1}{x-1}$ an der Stelle $x = 1$. [Aufgabe laden](?zn=2&z1=1&z2=-1&pn=1&p1=1&asy=0&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\frac{x^2-1}{x-1} = \frac{(x-1)(x+1)}{x-1} = x + 1$ für $x \neq 1$. Bei $x = 1$ liegt eine behebbare Lücke, der Graph ist die Gerade $y = x + 1$ mit einem Loch bei $(1 \mid 2)$. [Lösung zeigen](?zn=2&z1=1&z2=-1&pn=1&p1=1)

</details>

### Aufgabe 3: Polynomdivision

Bestimme die Asymptote von $f(x) = \frac{x^2-1}{x-2}$. [Aufgabe laden](?zn=2&z1=1&z2=-1&pn=1&p1=2&asy=0&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$(x^2 - 1) : (x - 2) = x + 2$ Rest $3$, also $f(x) = x + 2 + \frac{3}{x-2}$. Schräge Asymptote: $y = x + 2$. [Lösung zeigen](?zn=2&z1=1&z2=-1&pn=1&p1=2)

</details>

### Aufgabe 4: Funktion gesucht

Gib eine gebrochen-rationale Funktion an mit einer Polstelle ohne VZW bei $x = 1$ und der waagrechten Asymptote $y = 2$.

<details>
<summary>Lösung anzeigen</summary>

Zum Beispiel $f(x) = \frac{2x^2}{(x-1)^2}$: Nennerfaktor doppelt → ohne VZW; gleiche Grade, Leitkoeffizienten $2$ und $1$ → $y = 2$. [Zeigen](?zn=2&z1=0&z2=0&a=2&pn=2&p1=1&p2=1)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 11 (gebrochen-rationale Funktionen, Grenzwerte und Asymptoten) und 12 (Untersuchung gebrochen-rationaler Funktionen), LehrplanPLUS Gymnasium Bayern.
- **Entdeckend:** Die Lernenden ziehen eine Zählernullstelle auf eine Nennernullstelle und beschreiben, was mit dem Graphen passiert – daraus entsteht der Begriff der behebbaren Lücke.
- **Steckbriefaufgaben** (Aufgabe 4) eignen sich gut als Partnerarbeit: Eine Person gibt Eigenschaften vor, die andere baut die Funktion in der Simulation nach.
- **Häufige Stolpersteine:**
  - Jede Nennernullstelle wird automatisch als Polstelle bezeichnet (Kürzen vergessen).
  - Die Lücke wird nach dem Kürzen „vergessen“ – die Definitionsmenge ändert sich durch Kürzen nicht.
  - Bei gleichem Grad wird $y = 1$ statt des Quotienten der Leitkoeffizienten angegeben.
