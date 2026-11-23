---
description: "Potenz- und Wurzelgesetze zum Anschauen: Faktor-Kacheln für aᵐ · aⁿ, aᵐ : aⁿ und (aᵐ)ⁿ, eine Treppe für a⁰ und negative Exponenten, gebrochene Exponenten als Wurzeln und ein Termumformer mit Schritten."
---

## Worum geht es?

Eine **Potenz** $a^n$ ist eine Kurzschrift für ein Produkt gleicher Faktoren: $2^3 = 2 \cdot 2 \cdot 2 = 8$. Daraus folgen die **Potenzgesetze** – man muss sie nicht auswendig lernen, man kann sie durch Abzählen der Faktoren sehen:

| Gesetz | Warum? | Beispiel |
| --- | --- | --- |
| $a^m \cdot a^n = a^{m+n}$ | $m$ Faktoren und $n$ Faktoren hintereinander | $2^3 \cdot 2^4 = 2^7 = 128$ |
| $a^m : a^n = a^{m-n}$ | gleiche Faktoren oben und unten kürzen sich | $a^6 : a^2 = a^4$ |
| $(a^m)^n = a^{m \cdot n}$ | $n$ Gruppen mit je $m$ Faktoren | $(a^2)^3 = a^6$ |
| $(a \cdot b)^n = a^n \cdot b^n$ | Faktoren umsortieren | $(2 \cdot 3)^3 = 2^3 \cdot 3^3$ |

**Null und negative Exponenten:** Geht man auf der Treppe $2^3 = 8$, $2^2 = 4$, $2^1 = 2$ eine Stufe tiefer, teilt man durch 2. So kommt man zu $2^0 = 1$ und weiter zu $2^{-1} = \tfrac12$, $2^{-2} = \tfrac14$. Allgemein:

$$
a^0 = 1, \qquad a^{-n} = \frac{1}{a^n}.
$$

**Gebrochene Exponenten** sind Wurzeln: Weil $(a^{1/n})^n = a^{n/n} = a$ ist, gilt $a^{1/n} = \sqrt[n]{a}$ und

$$
a^{m/n} = \sqrt[n]{a^m} = \left(\sqrt[n]{a}\right)^m.
$$

Beispiele: $8^{2/3} = (\sqrt[3]{8})^2 = 2^2 = 4$ und $4^{-1/2} = \tfrac{1}{\sqrt4} = 0{,}5$. Auch Wurzeln lassen sich so zusammenfassen: $\sqrt2 \cdot \sqrt8 = 2^{1/2} \cdot 2^{3/2} = 2^2 = 4$.

## Ausprobieren

1. Schau zu, wie $2^3$ und $2^4$ zu $2^7$ zusammenrutschen. Was passiert, wenn du $m = 0$ setzt? [Malnehmen](?mode=laws&law=mul&a=2&m=3&n=4)
2. Beim Teilen kürzen sich Kacheln. Stelle $m < n$ ein: Wo bleiben die Kacheln jetzt übrig? [Teilen](?mode=laws&law=div&a=2&m=2&n=5&sym=1)
3. Wie viele Kacheln hat $(a^2)^3$? Und warum ist das nicht $a^5$? [Potenz potenzieren](?mode=laws&law=powpow&a=2&m=2&n=3&sym=1)
4. Gehe die Treppe hinunter. Warum muss $2^0 = 1$ sein? [Treppe](?mode=ladder&a=2)
5. Stelle $8^{1/3}$, $8^{2/3}$ und $8^{-1/3}$ ein. Wo liegen die Punkte auf dem Graphen? [Wurzeln](?mode=roots&a=8&pm=2&pn=3)
6. Lass dir $(a^2 \cdot b)^3 : (a^4 \cdot b^2)$ Schritt für Schritt vereinfachen. [Term](?mode=terms&t=(a%5E2%20%C2%B7%20b)%5E3%20%3A%20(a%5E4%20%C2%B7%20b%5E2))
7. Vergleiche y = x², x³, x⁻¹ und x^(1/2). Welche Graphen sind symmetrisch? [Potenzfunktionen](?mode=fn&fm=3&fd=1&fam=1&fx=1.5)
8. Reise in Zehnerpotenzen vom Proton bis zur Milchstraße. [Zehnerpotenzen](?mode=sci&zx=0)
9. Zehn Aufgaben im Kopf: Wie lang wird deine Serie? [Kopfrechnen](?mode=drill&dq=1)

## Aufgaben

### Aufgabe 1

Berechne $2^3 \cdot 2^4$, $\dfrac{a^7}{a^3}$ und $(x^2)^3$.

<details>
<summary>Lösung anzeigen</summary>

$2^7 = 128$, $a^4$ und $x^6$. [In der Simulation zeigen](?mode=terms&t=2%5E3%20%C2%B7%202%5E4)

</details>

### Aufgabe 2

Berechne ohne Taschenrechner: $8^{2/3}$, $4^{-1/2}$, $\sqrt2 \cdot \sqrt8$.

<details>
<summary>Lösung anzeigen</summary>

$8^{2/3} = (\sqrt[3]8)^2 = 4$, $4^{-1/2} = \tfrac12$, $\sqrt2 \cdot \sqrt8 = \sqrt{16} = 4$. [In der Simulation zeigen](?mode=terms&t=%E2%88%9A2%20%C2%B7%20%E2%88%9A8)

</details>

### Aufgabe 3: Selbst vereinfachen

Vereinfache $(x^2)^3 : x^4$, gib dein Ergebnis ein und drücke „Prüfen“. [Aufgabe laden](?mode=terms&t=(x%5E2)%5E3%20%3A%20x%5E4&g=&show=0)

<details>
<summary>Lösung anzeigen</summary>

$(x^2)^3 = x^6$, dann $x^6 : x^4 = x^2$.

</details>

### Aufgabe: Größenordnungen

Die Erde hat einen Durchmesser von etwa $1{,}27 \cdot 10^7\,\text{m}$, ein Mensch ist etwa $1{,}7\,\text{m}$ groß. Wie viele Menschen müsste man ungefähr aufeinanderstellen, um den Erddurchmesser zu erreichen?

<details>
<summary>Lösung anzeigen</summary>

$\frac{1{,}27 \cdot 10^7}{1{,}7} \approx 0{,}75 \cdot 10^7 = 7{,}5 \cdot 10^6$, also etwa siebeneinhalb Millionen Menschen. Die Größenordnung unterscheidet sich um etwa $10^7$. [In der Simulation zeigen](?mode=sci&zx=7.4)

</details>

## Ideen für den Unterricht

- **Einsatz:** Herleiten der Gesetze durch Abzählen von Faktoren; die Treppe motiviert $a^0 = 1$ und negative Exponenten ohne Auswendiglernen.
- **Häufige Fehler** (stehen auch in der Simulation):
  - $a^m \cdot a^n = a^{m \cdot n}$ statt $a^{m+n}$.
  - $a^0 = 0$.
  - $(a + b)^n = a^n + b^n$ – das Gesetz gilt nur für Produkte.
  - $a^{-n}$ als negative Zahl deuten.
- **Bezug zum Lehrplan:** Ob gebrochene Exponenten schon in Klasse 9 oder erst später kommen, ist unterschiedlich – bitte am eigenen Lehrplan prüfen.
