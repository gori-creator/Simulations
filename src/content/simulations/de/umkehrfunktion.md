---
description: "Interaktive Simulation für die Oberstufe: Umkehrfunktionen als Spiegelung an der Geraden y = x – mit ziehbarem Punkt und Spiegelpunkt, Animation, Rechenweg für x², eˣ, 1/x u. a. und dem Gegenbeispiel x² auf ganz ℝ."
---

## Worum geht es?

Eine Funktion $f$ ordnet jedem $x$ genau ein $y$ zu. Die **Umkehrfunktion** $f^{-1}$ geht den Weg rückwärts: Sie ordnet jedem Funktionswert $y$ wieder das zugehörige $x$ zu.

Das klappt nur, wenn jeder Funktionswert **nur einmal** vorkommt. Das ist sicher der Fall, wenn $f$ **streng monoton** ist. Bei $f(x) = x^2$ auf ganz $\mathbb{R}$ geht es nicht: $f(-2) = f(2) = 4$. Schränkt man die Definitionsmenge auf $x \geq 0$ ein, ist $f$ umkehrbar – die Umkehrfunktion ist die **Wurzelfunktion** $f^{-1}(x) = \sqrt{x}$.

**So bestimmt man die Umkehrfunktion:**

1. $y = f(x)$ nach $x$ auflösen,
2. $x$ und $y$ vertauschen.

*Beispiel:* $y = 2x - 1 \;\Rightarrow\; x = \frac{y+1}{2} \;\Rightarrow\; f^{-1}(x) = \frac{x+1}{2}$.

**Graphisch:** Das Vertauschen von $x$ und $y$ ist eine **Spiegelung an der Geraden $y = x$**. Aus dem Punkt $P(a \mid b)$ wird $P'(b \mid a)$. Definitions- und Wertemenge tauschen dabei die Rollen: $D_{f^{-1}} = W_f$ und $W_{f^{-1}} = D_f$.

So entsteht auch der **natürliche Logarithmus** $\ln x$ als Umkehrfunktion der e-Funktion.

## Ausprobieren

1. [Wurzelfunktion](?fn=sq&dom=pos&x=1.5): Ziehe $P$. Wo liegt $P'$? Was haben $P$, $P'$ und die Gerade $y = x$ miteinander zu tun?
2. Drücke „An y = x spiegeln“ und beobachte, wie der Graph über die Spiegelachse klappt.
3. [x² auf ganz ℝ](?fn=sq&dom=all&x=1.5): Warum ist das Spiegelbild kein Funktionsgraph?
4. [x² für x ≤ 0](?fn=sq&dom=neg&x=-1.5): Welche Umkehrfunktion gehört jetzt dazu?
5. [eˣ und ln x](?fn=exp&x=1): Lies $\ln e$ und $\ln 1$ am Graphen ab.
6. [1/x](?fn=hyp&x=2): Warum fallen die beiden Graphen zusammen?

## Aufgaben

### Aufgabe 1: Umkehrfunktion berechnen

Bestimme die Umkehrfunktion von $f(x) = 0{,}5x^3$. [Aufgabe laden](?fn=cube&x=1.5&show=0&inv=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$y = 0{,}5x^3 \Rightarrow x^3 = 2y \Rightarrow x = \sqrt[3]{2y}$, also $f^{-1}(x) = \sqrt[3]{2x}$. [Lösung zeigen](?fn=cube&x=1.5)

</details>

### Aufgabe 2: Punkte spiegeln

Der Punkt $P(1{,}5 \mid 2{,}25)$ liegt auf dem Graphen von $f(x) = x^2$ ($x \geq 0$). Gib den zugehörigen Punkt auf dem Graphen von $f^{-1}$ an und prüfe ihn.

<details>
<summary>Lösung anzeigen</summary>

$P'(2{,}25 \mid 1{,}5)$; Probe: $\sqrt{2{,}25} = 1{,}5$. [Zeigen](?fn=sq&dom=pos&x=1.5)

</details>

### Aufgabe 3: Definitions- und Wertemenge

Gib für $f(x) = e^x$ und $f^{-1}(x) = \ln x$ jeweils Definitions- und Wertemenge an. [Aufgabe laden](?fn=exp&x=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$D_f = \mathbb{R}$, $W_f = \mathbb{R}^+$; also $D_{f^{-1}} = \mathbb{R}^+$, $W_{f^{-1}} = \mathbb{R}$. [Lösung zeigen](?fn=exp&x=1)

</details>

### Aufgabe 4: Umkehrbar machen

$f(x) = x^2$ ist auf $\mathbb{R}$ nicht umkehrbar. Gib zwei verschiedene Möglichkeiten an, die Definitionsmenge so einzuschränken, dass $f$ umkehrbar wird, und nenne jeweils $f^{-1}$.

<details>
<summary>Lösung anzeigen</summary>

$x \geq 0$: $f^{-1}(x) = \sqrt{x}$; $x \leq 0$: $f^{-1}(x) = -\sqrt{x}$. [Erste Möglichkeit](?fn=sq&dom=pos&x=1.5), [zweite Möglichkeit](?fn=sq&dom=neg&x=-1.5)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 12 (Wurzelfunktion als Umkehrfunktion, natürliche Logarithmusfunktion), LehrplanPLUS Gymnasium Bayern.
- **Handlungsorientiert:** Graphen auf Folie zeichnen und die Folie entlang der Geraden $y = x$ umklappen – danach mit der Animation vergleichen.
- **Verknüpfung:** Das Gegenbeispiel $x^2$ auf ganz $\mathbb{R}$ eignet sich als Anlass, Monotonie als hinreichende Bedingung für Umkehrbarkeit zu begründen.
- **Häufige Stolpersteine:**
  - $f^{-1}(x)$ wird mit $\frac{1}{f(x)}$ verwechselt.
  - Das Vertauschen von $x$ und $y$ wird vergessen.
  - Die Einschränkung der Definitionsmenge (z. B. $x \geq 0$) wird nicht mitgedacht.
