---
description: "Interaktive Simulation für die 11. Klasse: das Verhalten von Funktionen für x → +∞ und x → −∞ untersuchen – mit laufendem Punkt, mitzoomender Ansicht, Wertetabelle, waagrechter Asymptote und einem ziehbaren ε-Streifen; dazu Gegenbeispiele ohne Grenzwert."
---

## Worum geht es?

Wie verhält sich $f(x)$, wenn $x$ immer größer wird ($x \to +\infty$) oder immer kleiner ($x \to -\infty$)? Es gibt zwei typische Fälle:

- **$f(x)$ nähert sich einer Zahl $a$ beliebig genau an.** Man schreibt $\lim\limits_{x \to +\infty} f(x) = a$ und nennt $a$ den **Grenzwert**. Die Gerade $y = a$ ist dann eine **waagrechte Asymptote** des Graphen.
- **$f(x)$ wächst über jede Schranke** (oder fällt unter jede Schranke). Man schreibt $f(x) \to +\infty$ bzw. $f(x) \to -\infty$; einen Grenzwert gibt es dann nicht.

**Was heißt „beliebig genau“?** Lege um die Asymptote einen Streifen der Breite $\varepsilon$ nach oben und unten. Egal wie schmal der Streifen ist: Ab einer bestimmten Stelle $x_\varepsilon$ bleibt der Graph im Streifen, d. h. $\lvert f(x) - a\rvert < \varepsilon$ für alle $x > x_\varepsilon$. Je kleiner $\varepsilon$, desto weiter draußen liegt $x_\varepsilon$.

**Grenzwerte erkennen:** Oft hilft eine Umformung, zum Beispiel

$$
f(x) = \frac{2x + 1}{x - 1} = 2 + \frac{3}{x - 1}
$$

Für $x \to \pm\infty$ geht $\frac{3}{x - 1} \to 0$, also $f(x) \to 2$. Bei gebrochen-rationalen Funktionen mit gleichem Zählergrad und Nennergrad ist der Grenzwert der Quotient der Leitkoeffizienten.

Der Graph **darf** die Asymptote schneiden – wie bei $f(x) = \frac{\sin x}{x}$. Wichtig ist nur, dass er ihr beliebig nahe kommt.

## Ausprobieren

1. Starte „x nach außen laufen lassen“. Die Ansicht zoomt mit, und die Wertetabelle füllt sich. Wie nah kommt $f(x)$ an $2$ heran?
2. Ziehe den Rand des ε-Streifens nach innen. Wo liegt $x_\varepsilon$ für $\varepsilon = 0{,}5$, wo für $\varepsilon = 0{,}05$? [Schmaler Streifen](?eps=0.05)
3. [$\frac{1}{x} + 1$ für $x \to -\infty$](?f=inv&dir=m&eps=0.25): Nähert sich der Graph von oben oder von unten?
4. [$\frac{\sin x}{x}$](?f=osc&eps=0.1): Der Graph schneidet die Asymptote immer wieder. Gibt es trotzdem einen Grenzwert?
5. [$2^x$](?f=exp&dir=m&eps=0.25): Vergleiche $x \to -\infty$ mit [$x \to +\infty$](?f=exp).
6. [$0{,}1x^3 - x$](?f=poly): Warum gibt es hier keinen ε-Streifen, in dem der Graph bleibt?

## Aufgaben

### Aufgabe 1: Grenzwert bestimmen

Bestimme $\lim\limits_{x \to +\infty} \frac{3x^2 + 1}{x^2 + 1}$ und gib die Asymptote an. [Aufgabe laden](?f=rat2&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Umformen: $\frac{3x^2 + 1}{x^2 + 1} = \frac{3(x^2 + 1) - 2}{x^2 + 1} = 3 - \frac{2}{x^2 + 1}$. Der Bruch geht gegen $0$, also ist der Grenzwert $3$ und $y = 3$ die waagrechte Asymptote. Der Graph liegt immer unterhalb. [Lösung zeigen](?f=rat2&eps=0.2)

</details>

### Aufgabe 2: Wie weit draußen?

Ab welchem $x$ gilt für $f(x) = 2 + \frac{3}{x - 1}$ die Ungleichung $\lvert f(x) - 2\rvert < 0{,}5$? Und ab welchem $x$ gilt $\lvert f(x) - 2\rvert < 0{,}05$?

<details>
<summary>Lösung anzeigen</summary>

Für $x > 1$ ist $\lvert f(x) - 2\rvert = \frac{3}{x - 1}$. Aus $\frac{3}{x - 1} < 0{,}5$ folgt $x - 1 > 6$, also $x > 7$. Aus $\frac{3}{x - 1} < 0{,}05$ folgt $x - 1 > 60$, also $x > 61$. [ε = 0,5](?eps=0.5) · [ε = 0,05](?eps=0.05)

</details>

### Aufgabe 3: Von beiden Seiten

Untersuche $f(x) = \frac{1}{x} + 1$ für $x \to +\infty$ und $x \to -\infty$. Von welcher Seite nähert sich der Graph jeweils der Asymptote?

<details>
<summary>Lösung anzeigen</summary>

In beiden Fällen ist der Grenzwert $1$. Für $x \to +\infty$ ist $\frac{1}{x} > 0$, der Graph liegt **oberhalb** von $y = 1$; für $x \to -\infty$ ist $\frac{1}{x} < 0$, der Graph liegt **unterhalb**. [x → +∞](?f=inv&eps=0.25) · [x → −∞](?f=inv&dir=m&eps=0.25)

</details>

### Aufgabe 4: Kein Grenzwert

Begründe, dass $f(x) = 0{,}1x^3 - x$ für $x \to +\infty$ keinen Grenzwert hat.

<details>
<summary>Lösung anzeigen</summary>

Für große $x$ bestimmt $0{,}1x^3$ das Verhalten: $f(x) = 0{,}1x^3\left(1 - \frac{10}{x^2}\right)$. Die Klammer geht gegen $1$, $0{,}1x^3$ wächst über jede Schranke. Also gilt $f(x) \to +\infty$ – der Graph verlässt jeden Streifen. [Zeigen](?f=poly)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 11, Lernbereiche „Spezielle Eigenschaften von Funktionen“ und „Gebrochen-rationale Funktionen – Grenzwerte und Asymptoten“ (LehrplanPLUS Gymnasium Bayern, bitte am Lehrplan prüfen, wie weit der ε-Streifen dort vertieft wird). Der Streifen eignet sich als anschauliche Vorstellung, ohne die formale Definition in den Vordergrund zu stellen.
- **Erkunden:** Mit „Grenzwert zeigen“ aus vermuten die Lernenden den Grenzwert zuerst anhand der Wertetabelle und prüfen ihn dann mit dem Streifen.
- **Modell:** $x_\varepsilon$ wird numerisch bestimmt; Werte in der Tabelle sind gerundet, sehr kleine Werte erscheinen als Zehnerpotenz.
- **Häufige Stolpersteine:**
  - „Eine Asymptote wird nie geschnitten.“ – Bei $\frac{\sin x}{x}$ schneidet der Graph sie unendlich oft.
  - „$f(x) \to \infty$ ist auch ein Grenzwert.“ – Dann existiert kein (endlicher) Grenzwert.
  - Beim Einsetzen großer Zahlen in den Taschenrechner werden Rundungen als exakte Werte gedeutet.
