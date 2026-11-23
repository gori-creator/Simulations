---
description: "Integrations-Werkstatt: Stammfunktionen mit Potenz-, Summen-, Faktorregel, linearer Substitution, Substitution und partieller Integration – mit Formansatz, Probe durch Ableiten und der Fläche F(b) − F(a)."
---

## Worum geht es?

Integrieren heißt, eine **Stammfunktion** $F$ zu finden: eine Funktion mit $F'(x) = f(x)$. Weil jede Konstante beim Ableiten wegfällt, ist mit $F$ auch $F + C$ eine Stammfunktion. Man schreibt

$$
\int f(x)\,dx = F(x) + C .
$$

Die Integrationsregeln sind die **umgedrehten Ableitungsregeln**:

| Aufbau von $f$ | Regel |
| --- | --- |
| $x^n$ (mit $n \ne -1$) | Potenzregel: $\int x^n\,dx = \dfrac{x^{n+1}}{n+1}$ |
| $\dfrac1x$ | $\int \dfrac1x\,dx = \ln\lvert x\rvert$ |
| $e^x$, $\sin x$, $\cos x$ | $\int e^x\,dx = e^x$, $\int \sin x\,dx = -\cos x$, $\int \cos x\,dx = \sin x$ |
| $u \pm v$, $c \cdot u$ | Summen- und Faktorregel: einzeln integrieren, Faktor bleibt stehen |
| $g(ax + b)$ | lineare Substitution: $\int g(ax+b)\,dx = \dfrac1a\, G(ax+b)$ |
| $g(u(x)) \cdot u'(x)$ | Substitution: $\int g(u(x))\,u'(x)\,dx = G(u(x))$ |
| $\dfrac{u'(x)}{u(x)}$ | logarithmische Integration: $\ln\lvert u(x)\rvert$ |
| $u \cdot v'$ | partielle Integration: $\int u\,v'\,dx = u\,v - \int u'\,v\,dx$ |

Bei der linearen Substitution teilt man durch die innere Ableitung $a$, weil die Kettenregel beim Ableiten wieder mit $a$ malnimmt. Beispiel: $\int \cos(2x)\,dx = \tfrac12 \sin(2x) + C$.

Bei der **partiellen Integration** wählt man $u$ so, dass $u'$ einfacher wird (meist das Polynom), und $v'$ so, dass man $v$ kennt. Beispiel $\int x\,e^x\,dx$: $u = x$, $v' = e^x$, also $u' = 1$, $v = e^x$ und

$$
\int x\,e^x\,dx = x\,e^x - \int 1 \cdot e^x\,dx = x\,e^x - e^x + C .
$$

Mit der Stammfunktion berechnet man **bestimmte Integrale** (Hauptsatz):

$$
\int_a^b f(x)\,dx = F(b) - F(a).
$$

Die Simulation zeigt beides: oben die Fläche unter $f$ zwischen $a$ und $b$ (über der $x$-Achse grün, darunter rot), unten den Graphen von $F + C$. Der Höhenunterschied $F(b) - F(a)$ ist genau der Wert des Integrals – egal, wie groß $C$ ist.

**Probe:** Jede Stammfunktion lässt sich durch Ableiten prüfen. Die Simulation macht diese Probe immer mit.

## Ausprobieren

1. Starte mit $\int_0^1 x\,e^x\,dx$. Welche Farbe hat $u$, welche $v'$? Welcher Wert kommt heraus? [Partielle Integration](?f=x*e%5Ex&mode=rule&a=0&b=1)
2. Ziehe die Grenzen $a$ und $b$ im oberen Graphen. Beobachte, wie sich der Höhenunterschied unten mitverändert. [sin x](?f=sin(x)&mode=rule&a=0&b=3.14)
3. Verschiebe $C$ (Regler oder Punkt im unteren Graphen). Warum ändert sich das Integral nicht? [Schar](?f=2x&mode=rule&a=0&b=2&family=1)
4. Lineare Substitution: Ändere $\cos(2x)$ in $\cos(3x)$. Welcher Faktor steht vor dem Sinus? [cos(2x)](?f=cos(2x)&mode=rule&a=0&b=0.8)
5. Formansatz: Für $(x^2+1)\,e^x$ setzt man $F(x) = (\alpha x^2 + \beta x + \gamma)\,e^x$ an und vergleicht die Koeffizienten. [Formansatz](?f=(x%5E2%2B1)*e%5Ex&mode=ansatz&a=-2&b=0)

## Aufgaben

### Aufgabe 1: Potenzregel

Berechne $\displaystyle\int_0^3 x^2\,dx$. [Aufgabe laden](?f=x%5E2&mode=check&show=0&a=0&b=3&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$F(x) = \tfrac13 x^3$, also $F(3) - F(0) = 9 - 0 = 9$. [In der Simulation zeigen](?f=x%5E2&mode=rule&a=0&b=3)

</details>

### Aufgabe 2: Lineare Substitution

Bestimme eine Stammfunktion von $f(x) = \cos(2x)$ und von $g(x) = e^{2x+1}$.

<details>
<summary>Lösung anzeigen</summary>

$F(x) = \tfrac12 \sin(2x)$ und $G(x) = \tfrac12 e^{2x+1}$ – jeweils durch die innere Ableitung $2$ teilen. Probe: $F'(x) = \tfrac12 \cos(2x) \cdot 2 = \cos(2x)$. [In der Simulation zeigen](?f=cos(2x)&mode=rule&a=0&b=0.8)

</details>

### Aufgabe 3: Partielle Integration

Berechne $\displaystyle\int_0^1 x\,e^x\,dx$.

<details>
<summary>Lösung anzeigen</summary>

$u = x$, $v' = e^x$: $\int x\,e^x\,dx = x\,e^x - e^x$. Also $F(1) - F(0) = (e - e) - (0 - 1) = 1$. [In der Simulation zeigen](?f=x*e%5Ex&mode=rule&a=0&b=1)

</details>

### Aufgabe 4: Substitution

Bestimme $\displaystyle\int \frac{x}{x^2+1}\,dx$.

<details>
<summary>Lösung anzeigen</summary>

Mit $u(x) = x^2 + 1$ ist $u'(x) = 2x$, der Zähler ist $\tfrac12 u'$. Also $\int \frac{x}{x^2+1}\,dx = \tfrac12 \ln(x^2 + 1) + C$. [In der Simulation zeigen](?f=x%2F(x%5E2%2B1)&mode=rule&a=0&b=2)

</details>

### Aufgabe 5: Selbst prüfen

Bestimme eine Stammfunktion von $(2x+1)^3$, gib sie ein und drücke „Prüfen“. [Aufgabe laden](?f=(2x%2B1)%5E3&mode=check&show=0&a=0&b=1)

<details>
<summary>Lösung anzeigen</summary>

$F(x) = \tfrac18 (2x+1)^4$. Auch ausmultipliziert oder mit einer anderen Konstante gilt es als richtig – die Probe durch Ableiten entscheidet.

</details>

## Ideen für den Unterricht

- **Einsatz:** Nach dem Hauptsatz zum Erarbeiten der Regeln als Umkehrung der Ableitungsregeln; später zum Üben von Substitution, partieller Integration und Formansatz.
- **Probe als Gewohnheit:** Die Werkstatt leitet jede gefundene Stammfunktion zur Kontrolle ab. Diese Probe sollten Lernende auch auf dem Papier machen.
- **Konstante $C$:** Mit „Schar F + C zeigen“ sieht man, dass alle Stammfunktionen parallel verschoben sind und das bestimmte Integral nicht von $C$ abhängt.
- **Häufige Stolpersteine:**
  - Bei $\int \cos(2x)\,dx$ mit $2$ malnehmen statt durch $2$ teilen.
  - Die Potenzregel auf $\frac1x$ anwenden ($n = -1$).
  - Bei der partiellen Integration $u$ und $v'$ ungünstig wählen, sodass das Restintegral schwerer wird.
  - Vorzeichen bei $\int \sin x\,dx = -\cos x$.
- **Bezug zum Lehrplan:** Welche Verfahren (Substitution, partielle Integration, Formansatz) verbindlich sind, ist unterschiedlich – bitte am eigenen Lehrplan prüfen.
