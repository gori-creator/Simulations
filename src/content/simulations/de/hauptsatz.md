---
description: "Interaktive Simulation für Oberstufe und Studium: Integralfunktion und Hauptsatz der Differential- und Integralrechnung – Fläche von a bis x, ein Streifen der Breite h → 0 und die Berechnung mit F(b) − F(a)."
---

## Worum geht es?

Hält man die untere Grenze $a$ fest und lässt die obere Grenze $x$ variieren, wird das Integral zu einer Funktion von $x$, der **Integralfunktion**

$$I_a(x) = \int_a^x f(t)\,dt.$$

Sie gibt die orientierte Fläche zwischen dem Graphen von $f$ und der $x$-Achse von $a$ bis $x$ an. Bei $x = a$ ist sie immer $0$.

**Hauptsatz der Differential- und Integralrechnung**

1. $I_a'(x) = f(x)$. *Idee:* Wächst $x$ um $h$, kommt ein schmaler Streifen dazu, dessen Fläche ungefähr $f(x) \cdot h$ ist. Also ist $\frac{I_a(x+h) - I_a(x)}{h} \approx f(x)$, und für $h \to 0$ wird daraus Gleichheit.
2. Ist $F$ irgendeine Stammfunktion von $f$, dann gilt
$$\int_a^b f(x)\,dx = F(b) - F(a).$$

Damit werden Flächenberechnungen zu Rechnungen mit Stammfunktionen – das ist der Kern der Integralrechnung.

## Ausprobieren

1. [Parabel](?fn=par&a=-1&x=2&h=0.8): Drücke „h gegen 0 gehen lassen“. Was passiert mit der Sekante im unteren Bild?
2. Ziehe die untere Grenze $a$. Wie verändert sich der Graph der Integralfunktion? Was bleibt gleich?
3. [f(x) = x](?fn=lin&a=0&x=3&h=1): Berechne die Dreiecksfläche und vergleiche mit $I_0(3)$.
4. [cos x von 0 bis π](?fn=cos&a=0&x=3.15&h=0.6): Warum ist das Integral fast $0$?
5. Ziehe $x$ links von $a$. Warum ändert sich das Vorzeichen?

## Aufgaben

### Aufgabe 1: Mit Stammfunktion berechnen

Berechne $\int_{-1}^{2} (0{,}5x^2 - 1)\,dx$. [Aufgabe laden](?fn=par&a=-1&x=2&h=0.8&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$F(x) = \frac{1}{6}x^3 - x$; $F(2) - F(-1) = \left(\frac{8}{6} - 2\right) - \left(-\frac{1}{6} + 1\right) = -\frac{2}{3} - \frac{5}{6} = -1{,}5$. [Lösung zeigen](?fn=par&a=-1&x=2&h=0.8)

</details>

### Aufgabe 2: Fläche unter cos

Berechne $\int_0^{\pi/2} \cos x\,dx$ und $\int_0^{\pi} \cos x\,dx$ und deute das Ergebnis.

<details>
<summary>Lösung anzeigen</summary>

$\sin\frac{\pi}{2} - \sin 0 = 1$; $\sin \pi - \sin 0 = 0$: Die Flächen oberhalb und unterhalb der $x$-Achse heben sich auf (Flächenbilanz). [Zeigen](?fn=cos&a=0&x=3.15&h=0.6)

</details>

### Aufgabe 3: Integralfunktion untersuchen

Wo hat $I_{-1}(x) = \int_{-1}^x (0{,}5t^2 - 1)\,dt$ Extremstellen?

<details>
<summary>Lösung anzeigen</summary>

$I_{-1}'(x) = f(x) = 0{,}5x^2 - 1 = 0 \Rightarrow x = \pm\sqrt{2}$, mit Vorzeichenwechsel: Hochpunkt bei $-\sqrt{2}$, Tiefpunkt bei $\sqrt{2}$. [Zeigen](?fn=par&a=-1&x=1.4&h=0.3)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 12/13 (Integralfunktion, Hauptsatz; Integral als Flächenbilanz), LehrplanPLUS Gymnasium Bayern, sowie Analysis im ersten Studienjahr.
- **Beweisidee nachvollziehen:** Die Streifenanimation entspricht dem Grenzwert des Differenzenquotienten – gut als Tafelskizze vorbereiten.
- **Häufige Stolpersteine:**
  - Integralfunktion und Stammfunktion werden gleichgesetzt (nicht jede Stammfunktion ist eine Integralfunktion, z. B. $x^2 + 1$ zu $2x$).
  - Bei $F(b) - F(a)$ wird die Reihenfolge vertauscht.
  - Integral und Flächeninhalt werden verwechselt, wenn $f$ das Vorzeichen wechselt.
