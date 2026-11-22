---
description: "Komplexe Zahlen in der Gaußschen Zahlenebene: Addieren als Verschieben, Malnehmen als Drehstrecken, Polarform, Lösungen von z² = −4 und zⁿ = w und die Darstellung als 2×2-Matrix."
---

## Worum geht es?

Die Gleichung $x^2 = -4$ hat keine reelle Lösung. Mit einer neuen Zahl $i$, für die $i^2 = -1$ gilt, ändert sich das: $(2i)^2 = 4 \cdot i^2 = -4$, also sind $\pm 2i$ die Lösungen.

Eine **komplexe Zahl** $z = a + b\,i$ besteht aus dem **Realteil** $a$ und dem **Imaginärteil** $b$. In der **Gaußschen Zahlenebene** ist sie der Punkt $(a \mid b)$ – oder der Pfeil vom Ursprung dorthin.

**Rechnen:**

- **Addieren** heißt Pfeile aneinanderhängen: $(2 + i) + (1 + 3i) = 3 + 4i$.
- **Malnehmen** rechnet man aus wie bei Klammern, mit $i^2 = -1$: $(1 + i)(1 - i) = 1 - i^2 = 2$ und $(1 + i)^2 = 1 + 2i + i^2 = 2i$.
- Geometrisch ist Malnehmen eine **Drehstreckung**: Die Beträge werden multipliziert, die Winkel addiert. Mal $i$ dreht um $90°$.
- **Teilen:** mit dem konjugierten Nenner $\bar w$ erweitern, dann ist der Nenner reell.

**Polarform:** Jede Zahl lässt sich durch ihren Abstand zum Ursprung, den **Betrag** $r = |z| = \sqrt{a^2 + b^2}$, und ihren Winkel, das **Argument** $\varphi$, angeben:

$$
z = r\,(\cos\varphi + i\sin\varphi) = r\,e^{i\varphi}.
$$

Beispiel: $|3 + 4i| = 5$ und $\varphi \approx 53{,}13°$.

**Gleichungen:** Die p-q-Formel funktioniert auch bei negativer Diskriminante, denn $\sqrt{-16} = 4i$. So hat $z^2 - 2z + 5 = 0$ die Lösungen $1 \pm 2i$. Die Gleichung $z^n = w$ hat genau $n$ Lösungen. Sie liegen als Ecken eines regelmäßigen $n$-Ecks auf einem Kreis.

**Matrizen:** Die Zahl $a + bi$ wirkt wie die Matrix $\begin{pmatrix} a & -b \\ b & a \end{pmatrix}$: Sie dreht um $\varphi$ und streckt mit $r$. Das Produkt zweier solcher Matrizen gehört zum Produkt der Zahlen.

## Ausprobieren

1. Ziehe $w$ auf $i$. Was passiert bei „z · w“ mit $z$? [Mal i](?mode=ops&op=mul&z=3%20%2B%20i&w=i)
2. Rechne $(1 + i)(1 - i)$ und $(1 + i)^2$ und beobachte die Winkel. [Produkt](?mode=ops&op=mul&z=1%20%2B%20i&w=1%20-%20i)
3. Potenzen von $1{,}1 \cdot e^{i \cdot 30°}$ bilden eine Spirale. Nach wie vielen Schritten ist man wieder auf der positiven reellen Achse? [Spirale](?mode=ops&op=pow&z=1%2C1%E2%88%A030%C2%B0&n=12)
4. Ändere bei $z^2 + pz + q = 0$ den Wert $q$ von $0$ auf $4$. Wann werden die Lösungen nicht reell? [Gleichung](?mode=equation&eq=quad&p=0&q=4)
5. Einheitswurzeln: Ziehe $n$ von 3 bis 12. [z⁶ = 1](?mode=equation&eq=root&w=1&n=6)

## Aufgaben

### Aufgabe 1: Malnehmen

Berechne $(1 + i)(1 - i)$ und $(1 + i)^2$.

<details>
<summary>Lösung anzeigen</summary>

$(1 + i)(1 - i) = 1 - i^2 = 2$ und $(1 + i)^2 = 1 + 2i - 1 = 2i$. Geometrisch: $|1 + i| = \sqrt2$, Winkel $45°$. Beim Quadrieren wird der Betrag $2$ und der Winkel $90°$. [In der Simulation zeigen](?mode=ops&op=mul&z=1%20%2B%20i&w=1%20%2B%20i)

</details>

### Aufgabe 2: Polarform

Bestimme Betrag und Argument von $3 + 4i$.

<details>
<summary>Lösung anzeigen</summary>

$r = \sqrt{9 + 16} = 5$, $\tan\varphi = \tfrac43$, also $\varphi \approx 53{,}13°$. [In der Simulation zeigen](?mode=polar&z=3%20%2B%204i)

</details>

### Aufgabe 3: Gleichung in ℂ

Löse $z^2 + 4 = 0$ und $z^2 - 2z + 5 = 0$.

<details>
<summary>Lösung anzeigen</summary>

$z^2 = -4$ ergibt $z = \pm 2i$. Bei der zweiten Gleichung ist $D = 1 - 5 = -4$, also $z = 1 \pm 2i$. [In der Simulation zeigen](?mode=equation&eq=quad&p=-2&q=5)

</details>

### Aufgabe 4: Dritte Wurzeln

Wie viele Lösungen hat $z^3 = 8$, und wo liegen sie?

<details>
<summary>Lösung anzeigen</summary>

Drei Lösungen mit dem Betrag $2$ und den Winkeln $0°$, $120°$, $240°$: $2$ und $-1 \pm \sqrt3\,i$. Sie bilden ein gleichseitiges Dreieck. [In der Simulation zeigen](?mode=equation&eq=root&w=8&n=3)

</details>

## Ideen für den Unterricht

- **Einsatz:** Zahlbereichserweiterung nach $\mathbb{R}$; Wiederholung der p-q-Formel; Verbindung zur Trigonometrie und zu Matrizen als Abbildungen.
- **Häufige Stolpersteine:**
  - $i^2 = -1$ beim Ausmultiplizieren vergessen.
  - Das Argument im falschen Quadranten ablesen ($\tan\varphi$ allein reicht nicht).
  - Beim Teilen nicht mit dem konjugierten Nenner erweitern.
- **Bezug zum Lehrplan:** Komplexe Zahlen sind meist ein Wahl- oder Vertiefungsthema – bitte am eigenen Lehrplan prüfen.
