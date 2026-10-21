---
description: "Interaktive Simulation für die 11. Klasse: das Verhalten von Funktionen für x → +∞ und x → −∞ untersuchen – ein Punkt läuft logarithmisch nach außen, die Ansicht zoomt mit, eine Lupe zeigt den winzigen Abstand zur waagrechten Asymptote, die Wertetabelle füllt sich, und ein ziehbarer ε-Schlauch macht den Grenzwert anschaulich; dazu Gegenbeispiele ohne Grenzwert."
---

## Worum geht es?

Wie verhält sich $f(x)$, wenn $x$ immer größer wird ($x \to +\infty$) oder immer kleiner ($x \to -\infty$)? Es gibt zwei typische Fälle:

- **$f(x)$ kommt einer Zahl $L$ beliebig nahe.** Man schreibt $\lim\limits_{x \to +\infty} f(x) = L$ und nennt $L$ den **Grenzwert**. Die Gerade $y = L$ ist eine **waagrechte Asymptote** des Graphen.
- **$f(x)$ wächst über jede Schranke** (oder fällt unter jede Schranke). Man schreibt $f(x) \to +\infty$ bzw. $f(x) \to -\infty$. Einen Grenzwert gibt es dann nicht.

**Was heißt „beliebig nahe“?** Lege um die Asymptote einen **ε-Schlauch**: alle Punkte mit $L - \varepsilon < y < L + \varepsilon$. Egal wie schmal der Schlauch ist – ab einer Stelle $x_\varepsilon$ bleibt der Graph darin, also $\lvert f(x) - L\rvert < \varepsilon$ für alle $x > x_\varepsilon$. Je kleiner $\varepsilon$, desto weiter draußen liegt $x_\varepsilon$.

**Grenzwerte erkennen:** Oft hilft eine Umformung, zum Beispiel

$$
f(x) = \frac{2x + 1}{x - 1} = 2 + \frac{3}{x - 1} .
$$

Für $x \to \pm\infty$ geht $\frac{3}{x - 1} \to 0$, also $f(x) \to 2$. Für $x > 1$ ist $\lvert f(x) - 2\rvert = \frac{3}{x - 1}$; aus $\frac{3}{x - 1} < 0{,}5$ folgt $x > 7$. Also ist $x_\varepsilon = 7$ für $\varepsilon = 0{,}5$.

**Gradregel für gebrochen-rationale Funktionen** (Z: Zähler, N: Nenner):

| Fall | Grenzverhalten für $x \to \pm\infty$ | Beispiel |
| --- | --- | --- |
| Grad Z < Grad N | $f(x) \to 0$ | $\frac{2x}{x^2 + 1} \to 0$ |
| Grad Z = Grad N | Quotient der Leitkoeffizienten | $\frac{3x^2 + 1}{x^2 + 1} \to \frac{3}{1} = 3$ |
| Grad Z > Grad N | $f(x) \to +\infty$ oder $-\infty$ | $0{,}1x^3 - x \to \pm\infty$ |

Der Graph **darf** die Asymptote schneiden – $\frac{\sin x}{x}$ tut das bei jedem $x = k\pi$. Wichtig ist nur, dass er ihr beliebig nahe kommt. Und die Grenzwerte für $+\infty$ und $-\infty$ können verschieden sein: $\frac{2^x}{2^x + 1}$ hat rechts die Asymptote $y = 1$, links $y = 0$.

## Ausprobieren

1. Drücke „x nach außen laufen lassen“. P läuft von $x = 2$ bis $x = 10\,000$, jede Zehnerpotenz gleich schnell. Die Ansicht zoomt mit, die Tabelle füllt sich, und sobald der Abstand im Bild zu klein wird, öffnet sich eine Lupe. Wie nah kommt $f(x)$ an $2$ heran? [Start](?f=rat&eps=0.5)
2. Ziehe den Rand des Schlauchs nach innen oder drücke mehrmals „ε verkleinern“. Wohin gleitet $x_\varepsilon$? [Schmaler Schlauch](?f=rat&eps=0.05)
3. [$\frac{1}{x} + 1$ für $x \to -\infty$](?f=inv&dir=m&eps=0.25): Nähert sich der Graph von oben oder von unten? Schalte die Richtung um.
4. [$\frac{\sin x}{x}$](?f=osc&eps=0.1): Der Graph schneidet die Asymptote immer wieder. Gibt es trotzdem einen Grenzwert? Welche Rolle spielen die gestrichelten Kurven $y = \pm\frac{1}{\lvert x\rvert}$?
5. [$\frac{2^x}{2^x + 1}$](?f=logi&dir=m&eps=0.2): Vergleiche $x \to -\infty$ mit [$x \to +\infty$](?f=logi&dir=p&eps=0.2).
6. [$x \cdot 2^{-x}$](?f=xexp&eps=0.25): Der Zähler $x$ wächst, trotzdem geht $f(x)$ gegen $0$. Wer „gewinnt“?
7. [$0{,}1x^3 - x$](?f=poly): Verschiebe den Probe-Schlauch „L = 3 ?“ nach oben. Gibt es einen Wert $L$, um den der Graph im Schlauch bleibt?

## Aufgaben

### Aufgabe 1: Grenzwert finden

Bestimme $\lim\limits_{x \to +\infty} \frac{2x}{x^2 + 1}$, ohne die Lösung anzusehen. Nutze die Wertetabelle und den Lauf nach außen. [Aufgabe laden](?f=low&dir=p&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Zähler und Nenner durch $x^2$ teilen: $\frac{2x}{x^2 + 1} = \frac{\frac{2}{x}}{1 + \frac{1}{x^2}} \to \frac{0}{1} = 0$. Grad Z = 1 < Grad N = 2, also Grenzwert $0$; Asymptote $y = 0$. Für $x > 0$ liegt der Graph oberhalb. [Lösung zeigen](?f=low&dir=p&eps=0.5)

</details>

### Aufgabe 2: Wie weit draußen?

Für $f(x) = \frac{2x + 1}{x - 1}$: Ab welchem $x$ gilt $\lvert f(x) - 2\rvert < 0{,}5$, ab welchem $\lvert f(x) - 2\rvert < 0{,}1$? Berechne auch $f(10)$ und $f(100)$.

<details>
<summary>Lösung anzeigen</summary>

Für $x > 1$ ist $\lvert f(x) - 2\rvert = \frac{3}{x - 1}$. Aus $\frac{3}{x - 1} < 0{,}5$ folgt $x - 1 > 6$, also $x > 7$. Aus $\frac{3}{x - 1} < 0{,}1$ folgt $x - 1 > 30$, also $x > 31$. $f(10) = \frac{21}{9} \approx 2{,}333$ und $f(100) = \frac{201}{99} \approx 2{,}0303$. [ε = 0,5](?f=rat&eps=0.5) · [ε = 0,1](?f=rat&eps=0.1)

</details>

### Aufgabe 3: Von unten

Zeige $\frac{3x^2 + 1}{x^2 + 1} = 3 - \frac{2}{x^2 + 1}$ und bestimme $x_\varepsilon$ für $\varepsilon = 0{,}2$. Warum liegt der Graph immer unterhalb der Asymptote?

<details>
<summary>Lösung anzeigen</summary>

$3x^2 + 1 = 3(x^2 + 1) - 2$, daraus folgt die Umformung. $\frac{2}{x^2 + 1} < 0{,}2 \iff x^2 + 1 > 10 \iff \lvert x\rvert > 3$. Also $x_\varepsilon = 3$ für $x \to +\infty$ und $x_\varepsilon = -3$ für $x \to -\infty$. Da $\frac{2}{x^2 + 1} > 0$ ist, gilt immer $f(x) < 3$. [Zeigen](?f=rat2&eps=0.2)

</details>

### Aufgabe 4: Exponentialfunktion

Bestimme für $f(x) = 2^x$ und $x \to -\infty$ die Stelle $x_\varepsilon$ für $\varepsilon = 0{,}25$. Was passiert für $x \to +\infty$?

<details>
<summary>Lösung anzeigen</summary>

$2^x < 0{,}25 = 2^{-2} \iff x < -2$, also $x_\varepsilon = -2$; Asymptote $y = 0$. Für $x \to +\infty$ gilt $2^x \to +\infty$: kein Grenzwert, keine Asymptote auf dieser Seite. [x → −∞](?f=exp&dir=m&eps=0.25) · [x → +∞](?f=exp&dir=p)

</details>

### Aufgabe 5: Schneiden erlaubt

Begründe mit $\lvert \sin x\rvert \le 1$, dass $\lim\limits_{x \to +\infty} \frac{\sin x}{x} = 0$ gilt. Ab welchem $x$ ist $\lvert f(x)\rvert < 0{,}1$ sicher erfüllt? Vergleiche mit dem $x_\varepsilon$ der Simulation.

<details>
<summary>Lösung anzeigen</summary>

$\left\lvert\frac{\sin x}{x}\right\rvert \le \frac{1}{\lvert x\rvert} \to 0$, also Grenzwert $0$. Sicher gilt $\frac{1}{\lvert x\rvert} < 0{,}1$ für $\lvert x\rvert > 10$. Die genaue Stelle liegt früher, bei $x_\varepsilon \approx 8{,}42$ (dort ist $\lvert \sin x\rvert = 0{,}1 \cdot x$). Der Graph schneidet die Asymptote bei jedem $x = k\pi$. [Zeigen](?f=osc&eps=0.1)

</details>

### Aufgabe 6: Kein Grenzwert

Begründe, dass $f(x) = 0{,}1x^3 - x$ für $x \to +\infty$ keinen Grenzwert hat. Gib eine Stelle an, ab der $f(x) > 100$ gilt.

<details>
<summary>Lösung anzeigen</summary>

$f(x) = x^3\left(0{,}1 - \frac{1}{x^2}\right)$: Die Klammer geht gegen $0{,}1$, $x^3$ wächst über jede Schranke, also $f(x) \to +\infty$. Jeder Schlauch wird verlassen; der Probe-Schlauch um $3$ mit $\varepsilon = 0{,}5$ zum Beispiel ab $x \approx 4{,}27$. $f(11) = 133{,}1 - 11 = 122{,}1 > 100$, und $f$ wächst für $x > 2$ weiter; genauer gilt $f(x) > 100$ ab $x \approx 10{,}33$. [Zeigen](?f=poly&dir=p&c=3&eps=0.5)

</details>

## Ideen für den Unterricht

- **Einsatz:** Jahrgangsstufe 11, Grenzwerte im Unendlichen und waagrechte Asymptoten (LehrplanPLUS Gymnasium Bayern; wie weit die ε-Vorstellung dort ausgeführt wird, bitte am Lehrplan prüfen). Der Schlauch ist als anschauliches Bild gedacht, nicht als formale Definition.
- **Grenzwert finden:** Mit „Grenzwert und Asymptote zeigen“ aus sind Asymptote, Schlauch und Abstände verdeckt. Die Lernenden vermuten den Grenzwert aus Tabelle und Lauf, begründen ihn mit einer Umformung und prüfen dann mit „Grenzwert aufdecken“.
- **ε-Spiel zu zweit:** Eine Person wählt ein ε, die andere sagt $x_\varepsilon$ voraus (bei $\frac{2x + 1}{x - 1}$ ist $x_\varepsilon = 1 + \frac{3}{\varepsilon}$); die Simulation prüft.
- **Modell:** $x_\varepsilon$ wird, wo möglich, exakt berechnet, sonst numerisch ($\frac{\sin x}{x}$, $x \cdot 2^{-x}$). Gezeigt wird jeweils die Stelle, ab der die Bedingung für alle weiteren $x$ gilt. Exakte Werte stehen mit „=“, gerundete mit „≈“ (z. B. $x_\varepsilon \approx 8{,}42$ bei $\frac{\sin x}{x}$).
- **Häufige Stolpersteine:**
  - „Eine Asymptote wird nie geschnitten.“ – Bei $\frac{\sin x}{x}$ schneidet der Graph sie unendlich oft.
  - „$f(x) \to \infty$ ist auch ein Grenzwert.“ – Dann gibt es keinen (endlichen) Grenzwert.
  - Für große $x$ zeigt der Taschenrechner oft genau $L$ an (z. B. $2$). Das wird als „$f(x) = L$“ gelesen, obwohl der Abstand nur sehr klein ist – die Lupe zeigt, dass er nie ganz verschwindet.
  - Die Grenzwerte für $+\infty$ und $-\infty$ werden stillschweigend gleichgesetzt.
