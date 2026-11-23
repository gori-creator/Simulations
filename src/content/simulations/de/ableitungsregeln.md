---
description: "Ableitungs-Werkstatt: Summen-, Faktor-, Potenz-, Produkt-, Quotienten- und Kettenregel Schritt für Schritt – mit farbigen Teilen, Graph und Kontrolle der eigenen Ableitung."
---

## Worum geht es?

Mit wenigen **Ableitungsregeln** lässt sich jeder Term ableiten, der aus Potenzen, $\sin$, $\cos$, $e^x$ und $\ln$ zusammengesetzt ist. Entscheidend ist, die **äußerste Rechenart** zu erkennen – sie bestimmt die Regel:

| Aufbau | Regel |
| --- | --- |
| $u(x) \pm v(x)$ | Summenregel: $(u \pm v)' = u' \pm v'$ |
| $c \cdot u(x)$ | Faktorregel: $(c \cdot u)' = c \cdot u'$ |
| $x^n$ | Potenzregel: $(x^n)' = n \cdot x^{n-1}$ |
| $u(x) \cdot v(x)$ | Produktregel: $(u \cdot v)' = u' \cdot v + u \cdot v'$ |
| $\dfrac{u(x)}{v(x)}$ | Quotientenregel: $\left(\dfrac uv\right)' = \dfrac{u' v - u v'}{v^2}$ |
| $g(h(x))$ | Kettenregel: $\big(g(h(x))\big)' = g'(h(x)) \cdot h'(x)$ |

Dazu kommen die **Grundableitungen** $(\sin x)' = \cos x$, $(\cos x)' = -\sin x$, $(e^x)' = e^x$, $(\ln x)' = \tfrac1x$.

Beispiel: $f(x) = x^2 \cdot \sin x$ ist ein Produkt mit $u = x^2$, $v = \sin x$. Also $u' = 2x$, $v' = \cos x$ und

$$
f'(x) = 2x \cdot \sin x + x^2 \cdot \cos x.
$$

Bei der Kettenregel sucht man die **innere Funktion** $h$ (was „in der Klammer steht“) und die **äußere Funktion** $g$: Für $f(x) = e^{2x+1}$ ist $h(x) = 2x + 1$, $g(z) = e^z$, also $f'(x) = e^{2x+1} \cdot 2$.

In der Simulation sind die Teile farbig: $u$ und $v$ bzw. äußere und innere Funktion. Der Graph zeigt $f$ und $f'$; an der Stelle $x_0$ siehst du die Tangente. Ihre Steigung stimmt mit dem Wert $f'(x_0)$ überein – so kannst du jede Regel am Bild überprüfen.

## Ausprobieren

1. Ein Produkt: Welche Farbe hat $u$, welche $v$? Schalte „Alle Schritte“ ein. [Produkt laden](?f=x%5E2*sin(x)&mode=rule&x0=3.15)
2. Ziehe den Punkt auf $f$. Warum liegt der rote Punkt auf $f'$ immer genau auf der Höhe der Tangentensteigung? [Beispiel](?f=x%5E3-3x&mode=rule&x0=1)
3. Kettenregel: Ändere die innere Funktion von $2x + 1$ auf $3x + 1$. Was ändert sich an der Ableitung? [Kette](?f=e%5E(2x%2B1)&mode=rule&x0=-1)
4. Verschobener Sinus $f(x) = 2\sin(3(x-1)) + 1$: Welche Parameter tauchen in der Ableitung noch auf? [Sinus](?f=2*sin(3*(x-1))%2B1&mode=rule&x0=1)
5. Gib selbst einen Term ein, z. B. $\ln(x^2 + 1)$ oder $\sqrt{x^2 + 4}$, und lass dir alle Schritte zeigen. [Alle Schritte](?f=x%5E2*e%5E(-x)&mode=steps&x0=2)

## Aufgaben

### Aufgabe 1: Summe und Faktor

Leite $f(x) = 3x^4 - 2x + 7$ ab. [Aufgabe laden](?f=3x%5E4-2x%2B7&mode=check&show=0&x0=1&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Summen-, Faktor- und Potenzregel: $f'(x) = 3 \cdot 4x^3 - 2 + 0 = 12x^3 - 2$. [In der Simulation zeigen](?f=3x%5E4-2x%2B7&mode=rule&x0=1)

</details>

### Aufgabe 2: Produktregel

Bestimme die Steigung von $f(x) = x^2 \sin x$ an der Stelle $x = \pi$. [Aufgabe laden](?f=x%5E2*sin(x)&mode=check&show=0&x0=3.15&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f'(x) = 2x\sin x + x^2\cos x$, also $f'(\pi) = 2\pi \cdot 0 + \pi^2 \cdot (-1) = -\pi^2 \approx -9{,}87$. [In der Simulation zeigen](?f=x%5E2*sin(x)&mode=rule&x0=3.15)

</details>

### Aufgabe 3: Kettenregel mit e

Leite $f(x) = e^{2x+1}$ ab und berechne $f'(-0{,}5)$.

<details>
<summary>Lösung anzeigen</summary>

Innere Funktion $h(x) = 2x + 1$, $h'(x) = 2$; äußere $g(z) = e^z$. Also $f'(x) = 2e^{2x+1}$ und $f'(-0{,}5) = 2e^0 = 2$. [In der Simulation zeigen](?f=e%5E(2x%2B1)&mode=rule&x0=-0.5)

</details>

### Aufgabe 4: Verschobener Sinus

$f(x) = 2\sin(3(x-1)) + 1$. Wo ist die Steigung am größten und wie groß ist sie?

<details>
<summary>Lösung anzeigen</summary>

$f'(x) = 2 \cdot \cos(3(x-1)) \cdot 3 = 6\cos(3(x-1))$. Der Kosinus ist höchstens 1, also ist die größte Steigung $6$, zum Beispiel bei $x = 1$. Die Verschiebung $+1$ in $y$-Richtung fällt beim Ableiten weg. [In der Simulation zeigen](?f=2*sin(3*(x-1))%2B1&mode=rule&x0=1)

</details>

### Aufgabe 5: Quotientenregel

Leite $f(x) = \dfrac{x+1}{x^2+1}$ ab. Welche Steigung hat der Graph bei $x = 0$?

<details>
<summary>Lösung anzeigen</summary>

$u = x + 1$, $u' = 1$, $v = x^2 + 1$, $v' = 2x$: $f'(x) = \dfrac{(x^2+1) - (x+1)\cdot 2x}{(x^2+1)^2} = \dfrac{-x^2 - 2x + 1}{(x^2+1)^2}$. Bei $x = 0$: $f'(0) = 1$. [In der Simulation zeigen](?f=(x%2B1)%2F(x%5E2%2B1)&mode=rule&x0=0)

</details>

### Aufgabe 6: Selbst prüfen

Leite $f(x) = (2x + 1)^3$ ab, gib dein Ergebnis in der Simulation ein und drücke „Prüfen“. [Aufgabe laden](?f=(2x%2B1)%5E3&mode=check&show=0&x0=0)

<details>
<summary>Lösung anzeigen</summary>

Kettenregel: $f'(x) = 3(2x+1)^2 \cdot 2 = 6(2x+1)^2$. Auch ausmultipliziert ($24x^2 + 24x + 6$) erkennt die Simulation es als richtig.

</details>

## Ideen für den Unterricht

- **Einsatz:** Nach der Einführung der Ableitungsfunktion zum Erarbeiten oder Üben der Regeln (Einführungsphase bzw. Qualifikationsphase). Der Graph hilft, Rechenfehler zu entdecken: Passt die Tangente nicht zum roten Punkt, stimmt etwas nicht.
- **Regel erkennen:** Ein Spiel daraus machen – Terme zeigen und zuerst nur die *äußerste* Regel nennen lassen, bevor gerechnet wird.
- **Übungsmodus:** Die Simulation vergleicht die eigene Ableitung an vielen Stellen mit der richtigen. Auch andere, gleichwertige Schreibweisen gelten als richtig.
- **Häufige Stolpersteine:**
  - Die innere Ableitung wird vergessen, z. B. $(\sin 3x)' = \cos 3x$ statt $3\cos 3x$.
  - Produktregel wie Summenregel behandelt: $(u v)' = u' v'$.
  - Bei der Quotientenregel die Reihenfolge im Zähler vertauscht (Vorzeichenfehler).
  - Additive Konstanten wie $+1$ beim Sinus mit abgeleitet.
- **Bezug zum Lehrplan:** Welche Regeln (z. B. die Quotientenregel) verbindlich sind, ist unterschiedlich – bitte am eigenen Lehrplan prüfen.
