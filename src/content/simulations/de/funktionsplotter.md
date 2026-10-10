---
description: "Funktionsplotter für eigene Terme: bis zu drei Graphen mit Zoom, Spurpunkt, Wertetabelle, näherungsweise markierten Nullstellen, Schnitt- und Extrempunkten, Polstellen, Definitionslücken und Funktionenscharen."
---

## Worum geht es?

Ein **Funktionsplotter** zeichnet zu einem Funktionsterm den Graphen. Du gibst bis zu drei Terme $f(x)$, $g(x)$ und $h(x)$ ein. Die Simulation zeigt jeden Term noch einmal sauber gesetzt – so siehst du sofort, **wie deine Eingabe verstanden wurde** – und zeichnet den Graphen. Bei einem Tippfehler wird die Stelle markiert und erklärt, was fehlt.

| Eingabe | bedeutet | Hinweis |
| --- | --- | --- |
| `2x`, `3(x+1)` | $2x$, $3(x+1)$ | Der Malpunkt darf fehlen. |
| `x^2`, `x²`, `2^x`, `x^(1/2)` | $x^2$, $x^2$, $2^x$, $x^{\frac{1}{2}}$ | Hochzahlen mit `^`, längere in Klammern |
| `0,5x` oder `0.5x` | $0{,}5x$ | Komma oder Punkt |
| `1/(x-1)` | $\dfrac{1}{x-1}$ | Nenner in Klammern setzen! |
| `sqrt(x)` oder `√x` | $\sqrt{x}$ | |
| `abs(x-1)` oder Betragsstriche | $\lvert x-1 \rvert$ | |
| `sin(x)`, `cos x`, `tan(2x)` | $\sin x$, $\cos x$, $\tan 2x$ | Winkel im Bogenmaß |
| `e^x`, `exp(x)`, `ln(x)`, `lg(x)`, `log_2(x)` | $e^x$, $\ln x$, $\lg x$, $\log_2 x$ | |
| `pi` oder `π`, `e` | $\pi \approx 3{,}14$, $e \approx 2{,}72$ | Konstanten |
| `a`, `b` | Parameter | Dafür erscheinen Regler. |

Es gelten die üblichen **Rechenregeln**: Potenz vor Punkt vor Strich, sonst von links nach rechts. Deshalb bedeutet `1/2x` dasselbe wie $\frac{1}{2} \cdot x$ – wer $\frac{1}{2x}$ meint, schreibt `1/(2x)`. Und `-x^2` ist $-x^2$ (erst quadrieren), nicht $(-x)^2$.

Auf Wunsch markiert die Simulation **besondere Punkte** im sichtbaren Ausschnitt:

- **Nullstellen** (auch Berührstellen wie bei $x^2$): Dort ist $f(x) = 0$.
- **Schnittpunkte** zweier Graphen: Ihre $x$-Werte sind die Lösungen der Gleichung $f(x) = g(x)$.
- **Hochpunkte H und Tiefpunkte T**.
- **Polstellen** (gestrichelte senkrechte Asymptote), **Definitionslücken** (Loch im Graphen) und **Ränder der Definitionsmenge** wie bei $\sqrt{x}$.

Die Werte sind **Näherungen**: Der Rechner tastet den Graphen ab und grenzt die Stellen durch Intervallhalbierung immer weiter ein. Angezeigt wird auf zwei Nachkommastellen gerundet, erkennbar am Zeichen $\approx$. Exakte Werte wie $\sqrt{2}$ findet man nur durch Rechnen.

**Keine senkrechten Striche an Polstellen:** Ein einfacher Plotter verbindet den letzten Punkt links einer Polstelle mit dem ersten rechts davon – es entsteht ein senkrechter Strich, der **nicht** zum Graphen gehört. Hier wird zwischen je zwei Punkten geprüft, ob der Graph dazwischen „springt“; dann wird nicht verbunden.

Mit der **Spur** fährst du mit einem Punkt am Graphen entlang und liest seine Koordinaten ab; an besonderen Punkten rastet sie ein. Die **Wertetabelle** zeigt die Funktionswerte ab einem Startwert mit wählbarer Schrittweite $\Delta x$.

## Ausprobieren

1. Lade [Parabel und Sinus](?f=x%5E2%20-%202&g=2sin%28x%29). Ziehe den Spurpunkt am Graphen entlang oder tippe auf den grünen Graphen. Welche Lösungen hat die Gleichung $x^2 - 2 = 2 \sin x$ ungefähr?
2. Tippe bei $h(x)$ den Term `1/x` ein. Wo ist der Graph nicht definiert? Schiebe den Ausschnitt mit der Maus oder dem Finger und zoome mit den Knöpfen.
3. Mache absichtlich Fehler: `2x+`, `sinus(x)` oder `x2`. Was meldet die Simulation?
4. Lade die [Parabelschar](?f=a%20x%5E2&g=&a=0.5&sch=1&sct=0) $f_a(x) = a x^2$ und verändere $a$. Was passiert für $a < 0$, für $a = 0$ und für große $a$?
5. Vergleiche [x² und 2ˣ](?f=x%5E2&g=2%5Ex&nst=0&x1=-3&x2=5&y1=-2&y2=18&eq=0&tx=3). Wie viele Schnittpunkte gibt es? Welche Funktion wächst auf lange Sicht schneller? Zoome heraus.
6. Lade [drei Sinuskurven](?f=sin%28x%29&g=2sin%28x%29&h=sin%282x%29&nst=0&sct=0&pi=1&x1=-6.5&x2=6.5&y1=-3&y2=3&eq=0) mit der $x$-Achse in Vielfachen von $\pi$. Woran erkennst du die Amplitude, woran die Periode?
7. Untersuche die [Tangensfunktion](?f=tan%28x%29&g=&pi=1&x1=-6.5&x2=6.5): Wo liegen Nullstellen, wo Polstellen?
8. Gib [(x² − 1)/(x − 1)](?f=%28x%5E2%20-%201%29%2F%28x%20-%201%29&g=) ein. Der Graph sieht aus wie eine Gerade – doch was ist bei $x = 1$?
9. *(Ab Jahrgangsstufe 11)* Schalte die [Tangente](?f=x%5E3%20-%203x&g=&tg=1&tx=2) ein und ziehe den Spurpunkt. Wo ist die Tangente waagrecht?

## Aufgaben

### Aufgabe 1: Nullstellen näherungsweise

[Aufgabe laden](?f=x%5E3%20-%202x%20-%201&g=&nst=0&ext=0&_hide=1) Bestimme mit der Spur die Nullstellen von $f(x) = x^3 - 2x - 1$ auf zwei Nachkommastellen. Eine davon ist ganzzahlig – zeige durch Einsetzen, dass sie exakt stimmt.

<details>
<summary>Lösung anzeigen</summary>

$x_1 = -1$ (exakt: $(-1)^3 - 2 \cdot (-1) - 1 = -1 + 2 - 1 = 0$), $x_2 \approx -0{,}62$ und $x_3 \approx 1{,}62$. Nach Abspalten von $(x + 1)$ bleibt $x^2 - x - 1 = 0$ mit den exakten Lösungen $\frac{1 \pm \sqrt{5}}{2}$. [In der Simulation zeigen](?f=x%5E3%20-%202x%20-%201&g=&nst=1)

</details>

### Aufgabe 2: Eine Gleichung grafisch lösen

[Aufgabe laden](?f=2%5Ex&g=3%20-%20x&nst=0&sct=0&_hide=1) Löse $2^x = 3 - x$ grafisch. Begründe, warum es keine weitere Lösung geben kann.

<details>
<summary>Lösung anzeigen</summary>

Die Graphen schneiden sich in $S(1 \mid 2)$, also $x = 1$. Probe: $2^1 = 2$ und $3 - 1 = 2$. Weitere Lösungen gibt es nicht, weil $2^x$ immer steigt und $3 - x$ immer fällt – die Graphen können sich nur einmal treffen. [Zeigen](?f=2%5Ex&g=3%20-%20x&nst=0&sct=1)

</details>

### Aufgabe 3: Was hat der Plotter verstanden?

[Aufgabe laden](?f=1%2F2x&g=1%2F%282x%29&nst=0&sct=0) Lea will $\frac{1}{2x}$ zeichnen und tippt `1/2x` ein, Tom tippt `1/(2x)`. Welcher Graph gehört zu wem? Wer hat recht?

<details>
<summary>Lösung anzeigen</summary>

`1/2x` wird von links nach rechts gerechnet: $\frac{1}{2} \cdot x$ – eine Ursprungsgerade mit Steigung $\frac{1}{2}$ (blau). Nur `1/(2x)` ergibt $\frac{1}{2x}$, eine Hyperbel mit Polstelle bei $x = 0$ (grün). Tom hat recht; die gesetzte Formel in der Karte „Terme“ zeigt den Unterschied.

</details>

### Aufgabe 4: Eine Parabelschar

[Aufgabe laden](?f=x%5E2%20-%202x%20%2B%20a&g=&a=0&sch=1&nst=0&_hide=1) Für welche Werte von $a$ hat der Graph von $f_a(x) = x^2 - 2x + a$ zwei, eine oder keine Nullstelle? Probiere mit dem Regler und begründe rechnerisch.

<details>
<summary>Lösung anzeigen</summary>

Der Scheitel liegt bei $S(1 \mid a - 1)$. Für $a < 1$ liegt er unter der $x$-Achse: zwei Nullstellen. Für $a = 1$ berührt die Parabel die $x$-Achse in $x = 1$: eine Nullstelle. Für $a > 1$: keine. Rechnerisch: Diskriminante $D = 4 - 4a$. [Grenzfall zeigen](?f=x%5E2%20-%202x%20%2B%20a&g=&a=1&nst=1)

</details>

### Aufgabe 5: Polstelle oder Lücke?

[Aufgabe laden](?f=%28x%5E2%20-%204%29%2F%28x%20-%202%29&g=%28x%20%2B%202%29%2F%28x%20-%202%29&asy=0&nst=0&sct=0&_hide=1) Beide Funktionen sind bei $x = 2$ nicht definiert. Beschreibe, wie sich die Graphen dort unterscheiden, und erkläre den Unterschied am Term.

<details>
<summary>Lösung anzeigen</summary>

$f(x) = \frac{x^2 - 4}{x - 2} = \frac{(x - 2)(x + 2)}{x - 2} = x + 2$ für $x \neq 2$: Der Graph ist eine Gerade mit einem **Loch** bei $(2 \mid 4)$ – eine hebbare Definitionslücke. Bei $g$ lässt sich nicht kürzen; der Zähler ist bei $x = 2$ nicht null. Die Werte wachsen über alle Grenzen: **Polstelle** mit senkrechter Asymptote $x = 2$. [Zeigen](?f=%28x%5E2%20-%204%29%2F%28x%20-%202%29&g=%28x%20%2B%202%29%2F%28x%20-%202%29&asy=1&nst=0&sct=0)

</details>

### Aufgabe 6: Tangente (ab Jahrgangsstufe 11)

[Aufgabe laden](?f=x%5E3%20-%203x&g=&tg=0&tx=2&ext=0&nst=0) Berechne für $f(x) = x^3 - 3x$ die Steigung $f'(2)$ und die Gleichung der Tangente bei $x = 2$. Überprüfe anschließend mit „Tangente im Spurpunkt“. An welchen Stellen ist die Tangente waagrecht?

<details>
<summary>Lösung anzeigen</summary>

$f'(x) = 3x^2 - 3$, also $f'(2) = 9$ und mit $f(2) = 2$: $t(x) = 9(x - 2) + 2 = 9x - 16$. Waagrechte Tangenten bei $f'(x) = 0$, also $x = \pm 1$: Hochpunkt $H(-1 \mid 2)$, Tiefpunkt $T(1 \mid -2)$. [Tangente als g(x) zeigen](?f=x%5E3%20-%203x&g=9x%20-%2016&tg=1&tx=2&ext=1)

</details>

## Hinweise für Lehrkräfte

- **Einsatz:** Jahrgangsstufe 8, Lernbereich 1 „Funktion und Term“ (Graphen mit einem Funktionenplotter erstellen und untersuchen), danach als Werkzeug durch alle Jahrgangsstufen: quadratische Funktionen und Scharen (9), Potenz-, Exponential- und Sinusfunktionen (10), gebrochen-rationale Funktionen und Ableitung (11–13), auch im Studium.
- **Sicher und datensparsam:** Die Terme werden von einem eigenen Leseprogramm ausgewertet (kein `eval`, keine Übertragung). Geteilte Links enthalten die Terme, den Ausschnitt und alle Einstellungen; mit `_hide=1` werden die Ergebnislisten verdeckt, die Marken im Bild schaltet man in Aufgabenlinks einzeln ab (`nst=0`, `sct=0`, `ext=0`, `asy=0`).
- **Numerik:** Alle besonderen Punkte sind Näherungen im sichtbaren Ausschnitt. Sehr flache Extrempunkte (z. B. bei $x^{10}$) oder sehr dicht liegende Nullstellen können übersehen werden; hebbare Lücken werden an Stellen eines Viertelrasters gesucht. Potenzen mit negativer Basis sind nur für ganzzahlige Exponenten definiert (wie im Unterricht): `x^(1/3)` ist für $x < 0$ nicht definiert.
- **Typische Fehlvorstellungen:**
  - „Der senkrechte Strich an der Polstelle gehört zum Graphen.“ – Er entsteht nur, wenn ein Plotter Punkte blind verbindet.
  - „Der Rechner liefert exakte Werte.“ – Er rundet; $1{,}41$ ist nicht $\sqrt{2}$.
  - `1/2x` statt `1/(2x)`, `-x^2` statt `(-x)^2`, `sin(x)` im Gradmaß erwartet.
  - „Der Graph hört am Bildrand auf.“ – Herauszoomen zeigt den weiteren Verlauf.
