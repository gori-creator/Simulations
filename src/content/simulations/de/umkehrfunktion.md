---
description: "Interaktive Simulation für die Oberstufe: Umkehrfunktionen als Spiegelung an y = x – der Graph klappt wie eine Folie um, eine waagrechte Gerade prüft die Umkehrbarkeit, Definitions- und Wertemenge tauschen sichtbar die Rollen, und das Steigungsdreieck zeigt (f⁻¹)′(b) = 1/f′(a)."
---

## Worum geht es?

Eine Funktion $f$ ordnet jedem $x$ genau ein $y = f(x)$ zu. Die **Umkehrfunktion** $f^{-1}$ geht den Weg rückwärts: Sie ordnet jedem Funktionswert wieder sein $x$ zu. Aus $f(3) = 5$ wird $f^{-1}(5) = 3$.

**Wann geht das?** Nur wenn jeder Funktionswert **genau einmal** vorkommt. Im Bild heißt das: Jede waagrechte Gerade schneidet den Graphen **höchstens einmal**. Sicher ist das der Fall, wenn $f$ **streng monoton** ist. Bei $f(x) = x^2$ auf ganz $\mathbb{R}$ geht es nicht, denn $f(-2) = f(2) = 4$. Schränkt man die Definitionsmenge auf einen streng monotonen Teil ein, klappt es: Für $x \geq 0$ ist $f^{-1}(x) = \sqrt{x}$, für $x \leq 0$ ist $f^{-1}(x) = -\sqrt{x}$. Monotonie ist **hinreichend, aber nicht notwendig**: $f(x) = \frac{1}{x}$ ist auf $\mathbb{R}\setminus\{0\}$ nicht monoton und trotzdem umkehrbar – sie ist sogar zu sich selbst invers.

**Rechnerisch** bestimmt man $f^{-1}$ in zwei Schritten:

1. $y = f(x)$ nach $x$ auflösen,
2. $x$ und $y$ tauschen.

*Beispiel:* $y = 2x - 1 \;\Rightarrow\; x = \frac{y + 1}{2} \;\Rightarrow\; f^{-1}(x) = \frac{x + 1}{2}$.

**Grafisch** ist das Tauschen von $x$ und $y$ die **Spiegelung an der Winkelhalbierenden $y = x$**: Aus $P(a \mid b)$ wird $P'(b \mid a)$. Die Strecke $PP'$ steht senkrecht auf $y = x$, ihr Mittelpunkt $M\left(\frac{a+b}{2} \,\middle|\, \frac{a+b}{2}\right)$ liegt auf $y = x$. Dabei tauschen auch **Definitions- und Wertemenge** die Rollen: $D_{f^{-1}} = W_f$ und $W_{f^{-1}} = D_f$. So entsteht der **natürliche Logarithmus**: $f(x) = e^x$ hat $D_f = \mathbb{R}$ und $W_f = \mathbb{R}^+$, also ist $\ln x$ nur für $x > 0$ definiert und nimmt alle reellen Werte an.

**Ableitung der Umkehrfunktion.** Spiegelt man die Tangente in $P$ mit, tauschen die Katheten des Steigungsdreiecks: Aus $\frac{\Delta y}{\Delta x} = m$ wird $\frac{\Delta x}{\Delta y} = \frac{1}{m}$. Also gilt für $b = f(a)$ und $f'(a) \neq 0$:

$$
\left(f^{-1}\right)'(b) = \frac{1}{f'(a)} .
$$

Für $f(x) = e^x$ folgt daraus $(\ln x)' = \frac{1}{e^{\ln x}} = \frac{1}{x}$. Ist $f'(a) = 0$ (waagrechte Tangente), hat $f^{-1}$ in $(b \mid a)$ eine **senkrechte Tangente** und ist dort nicht differenzierbar – zum Beispiel $f(x) = 0{,}5x^3$ an der Stelle $0$.

## Ausprobieren

1. [Wurzelfunktion](?view=mirror&fn=sq&dom=pos&x=1.5): Ziehe $P$ auf dem Graphen – oder gleich $P'$. Was haben $P$, $P'$ und der Punkt $M$ mit der Geraden $y = x$ zu tun?
2. Drücke „An y = x spiegeln“: Der Graph klappt wie eine Folie um die Gerade $y = x$. Die gestrichelten Spuren zeigen, dass jeder Punkt senkrecht zu $y = x$ wandert. Beobachte auch die farbigen Intervalle an den Achsen und die Spalten der Wertetabelle.
3. [Gerade](?view=mirror&fn=lin&x=3): Drücke „Rechenweg Schritt für Schritt“. Beim Schritt „x und y tauschen“ klappt der Graph um.
4. [x² auf ganz ℝ](?view=test&fn=sq&dom=all&x=2): Lass die waagrechte Gerade wandern. Wie viele Schnittpunkte gibt es höchstens? Warum ist das Spiegelbild kein Funktionsgraph? Wechsle dann zu „steigender Ast“ und „fallender Ast“.
5. [0,5x³](?view=test&fn=cube&x=0): Die Tangente in $(0 \mid 0)$ ist waagrecht. Ist $f$ trotzdem streng monoton?
6. [eˣ und ln x](?view=deriv&fn=exp&x=1): Vergleiche die Steigungsdreiecke in $P$ und $P'$. Lass $P$ wandern: Wie hängen $m$ und $m'$ zusammen? Was wird aus einer [waagrechten Tangente](?view=deriv&fn=cube&x=0)?
7. [1/x](?view=mirror&fn=hyp&x=2): Warum fallen die Graphen von $f$ und $f^{-1}$ zusammen?
8. Ausblick: [Sinus eingeschränkt](?view=test&fn=sin&dom=pos&x=0.5). Auf $\left[-\frac{\pi}{2}; \frac{\pi}{2}\right]$ ist $\sin$ streng monoton steigend, die Umkehrfunktion heißt $\arcsin$.

## Aufgaben

### Aufgabe 1: Eine lineare Funktion umkehren

Bestimme die Umkehrfunktion von $f(x) = 2x - 1$ und berechne $f^{-1}(5)$. [Aufgabe laden](?view=mirror&fn=lin&x=3&show=0&inv=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$y = 2x - 1 \Rightarrow y + 1 = 2x \Rightarrow x = \frac{y + 1}{2}$, also $f^{-1}(x) = \frac{x + 1}{2}$. Dann ist $f^{-1}(5) = \frac{6}{2} = 3$; Probe: $f(3) = 6 - 1 = 5$. Die Steigungen sind $2$ und $\frac{1}{2} = 0{,}5$. [Lösung zeigen](?view=mirror&fn=lin&x=3)

</details>

### Aufgabe 2: Kubische Funktion

Bestimme die Umkehrfunktion von $f(x) = 0{,}5x^3$ und prüfe sie am Punkt $P(2 \mid f(2))$. [Aufgabe laden](?view=mirror&fn=cube&x=2&show=0&inv=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$y = 0{,}5x^3 \Rightarrow x^3 = 2y \Rightarrow x = \sqrt[3]{2y}$, also $f^{-1}(x) = \sqrt[3]{2x}$ mit $D_{f^{-1}} = \mathbb{R}$. Probe: $f(2) = 0{,}5 \cdot 8 = 4$ und $f^{-1}(4) = \sqrt[3]{8} = 2$; der Spiegelpunkt ist $P'(4 \mid 2)$. [Lösung zeigen](?view=mirror&fn=cube&x=2)

</details>

### Aufgabe 3: Umkehrbar machen

Begründe, dass $f(x) = x^2$ auf $\mathbb{R}$ nicht umkehrbar ist. Gib zwei Einschränkungen der Definitionsmenge an, auf denen $f$ umkehrbar ist, und jeweils $f^{-1}$ mit Definitions- und Wertemenge. [Aufgabe laden](?view=test&fn=sq&dom=all&x=2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f(-2) = f(2) = 4$: Die Gerade $y = 4$ schneidet den Graphen zweimal. Für $x \geq 0$ ist $f$ streng monoton steigend, $f^{-1}(x) = \sqrt{x}$ mit $D_{f^{-1}} = \mathbb{R}_0^+$ und $W_{f^{-1}} = \mathbb{R}_0^+$. Für $x \leq 0$ ist $f$ streng monoton fallend, $f^{-1}(x) = -\sqrt{x}$ mit $D_{f^{-1}} = \mathbb{R}_0^+$ und $W_{f^{-1}} = \mathbb{R}_0^-$. [Erste Möglichkeit](?view=test&fn=sq&dom=pos&x=2), [zweite Möglichkeit](?view=test&fn=sq&dom=neg&x=-2)

</details>

### Aufgabe 4: e-Funktion und Logarithmus

Gib für $f(x) = e^x$ und $f^{-1}(x) = \ln x$ jeweils Definitions- und Wertemenge an. Welcher Punkt des Graphen von $\ln$ gehört zu $P(1 \mid e)$? [Aufgabe laden](?view=mirror&fn=exp&x=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$D_f = \mathbb{R}$, $W_f = \mathbb{R}^+$, also $D_{f^{-1}} = \mathbb{R}^+$ und $W_{f^{-1}} = \mathbb{R}$. Zu $P(1 \mid e)$ gehört $P'(e \mid 1)$, denn $\ln e = 1$. [Lösung zeigen](?view=mirror&fn=exp&x=1)

</details>

### Aufgabe 5: Ableitung der Wurzelfunktion

$f(x) = x^2$ mit $x \geq 0$, $P(1{,}5 \mid 2{,}25)$. Berechne $f'(1{,}5)$ und daraus die Steigung von $f^{-1}(x) = \sqrt{x}$ an der Stelle $2{,}25$. Prüfe mit $(\sqrt{x})' = \frac{1}{2\sqrt{x}}$. [Aufgabe laden](?view=deriv&fn=sq&dom=pos&x=1.5&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f'(x) = 2x$, also $f'(1{,}5) = 3$. Damit ist $\left(f^{-1}\right)'(2{,}25) = \frac{1}{3} \approx 0{,}333$. Probe: $\frac{1}{2\sqrt{2{,}25}} = \frac{1}{2 \cdot 1{,}5} = \frac{1}{3}$. Im Steigungsdreieck werden aus $\Delta x$ und $\Delta y$ beim Spiegeln $\Delta y$ und $\Delta x$. [Lösung zeigen](?view=deriv&fn=sq&dom=pos&x=1.5)

</details>

### Aufgabe 6: Senkrechte Tangente

Begründe ohne Rechnung, dass $f^{-1}(x) = \sqrt[3]{2x}$ im Ursprung nicht differenzierbar ist, obwohl $f(x) = 0{,}5x^3$ dort differenzierbar ist. Berechne außerdem $\left(f^{-1}\right)'(4)$. [Aufgabe laden](?view=deriv&fn=cube&x=0&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f'(0) = 1{,}5 \cdot 0^2 = 0$: Die Tangente an $f$ in $(0 \mid 0)$ ist waagrecht, gespiegelt wird sie senkrecht – $\frac{1}{0}$ gibt es nicht. Für $b = 4$ ist $a = 2$ und $f'(2) = 1{,}5 \cdot 4 = 6$, also $\left(f^{-1}\right)'(4) = \frac{1}{6} \approx 0{,}167$. [Senkrechte Tangente zeigen](?view=deriv&fn=cube&x=0) · [Stelle 4 zeigen](?view=deriv&fn=cube&x=2)

</details>

## Ideen für den Unterricht

- **Einsatz:** Oberstufe: Wurzelfunktion (Umkehrbarkeit über strenge Monotonie) und natürliche Logarithmusfunktion samt Ableitung. Der Sinus mit $\arcsin$ ist als Ausblick gedacht.
- **Ablauf:** Die drei Ansichten lassen sich als Abfolge nutzen: erst „Umkehrbar?“ (waagrechte Gerade), dann „Spiegeln an y = x“ (Rechenweg und Umklappen), zuletzt „Ableitung von f⁻¹“ als Weg zu $(\ln x)' = \frac{1}{x}$.
- **Handlungsorientiert:** Einen Graphen auf Folie zeichnen und die Folie entlang $y = x$ umdrehen – danach mit der Animation vergleichen. Mit „Lösungen zeigen“ aus (`show=0`) und ohne Graph von $f^{-1}$ (`inv=0`) eignen sich die Bilder als Übungsaufgaben.
- **Häufige Stolpersteine:**
  - $f^{-1}(x)$ wird mit $\frac{1}{f(x)}$ verwechselt – das Hochzeichen $-1$ bedeutet hier „Umkehrung“, nicht „Kehrwert“.
  - Nach dem Auflösen wird das Tauschen von $x$ und $y$ vergessen.
  - Die Einschränkung der Definitionsmenge (z. B. $x \geq 0$) wird nicht mitgedacht, und dann fehlt das Vorzeichen bei $-\sqrt{x}$.
  - „Streng monoton“ wird mit „$f' > 0$“ gleichgesetzt: $0{,}5x^3$ ist streng monoton steigend, obwohl $f'(0) = 0$ ist.
  - Bei $\left(f^{-1}\right)'(b) = \frac{1}{f'(a)}$ wird $f'$ an der falschen Stelle ($b$ statt $a$) eingesetzt.
