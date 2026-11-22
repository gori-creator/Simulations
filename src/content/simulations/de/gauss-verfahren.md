---
description: "Gauß-Verfahren Schritt für Schritt: Gleichungssystem auf Stufenform bringen, vorgemacht oder mit eigenen Zeilenumformungen – mit eindeutiger, keiner oder unendlich vielen Lösungen und den Gleichungen als Ebenen im Raum."
---

## Worum geht es?

Ein **lineares Gleichungssystem** (LGS) wie

$$
\begin{aligned}
\text{I:}\quad & x + y + z = 6\\
\text{II:}\quad & 2y + 5z = -4\\
\text{III:}\quad & 2x + 5y - z = 27
\end{aligned}
$$

löst man systematisch mit dem **Gauß-Verfahren**. Man schreibt nur die Zahlen auf – die **erweiterte Koeffizientenmatrix** – und formt die Zeilen um, bis unter den führenden Zahlen nur noch Nullen stehen (**Stufenform**). Erlaubt sind drei Umformungen, die die Lösungsmenge nicht ändern:

- zwei Zeilen **tauschen** ($\text{I} \leftrightarrow \text{III}$),
- eine Zeile mit einer Zahl $\ne 0$ **malnehmen** ($2 \cdot \text{II}$),
- zu einer Zeile ein Vielfaches einer anderen **addieren** ($\text{III} - 2 \cdot \text{I}$).

Im Beispiel: $\text{III} - 2\cdot\text{I}$ ergibt $3y - 3z = 15$, danach $2\cdot\text{III} - 3\cdot\text{II}$ ergibt $-21z = 42$. Jetzt **rückwärts einsetzen**: $z = -2$, aus II folgt $y = 3$, aus I folgt $x = 5$. Also $L = \{(5 \mid 3 \mid -2)\}$.

Am Ende sieht man, wie viele Lösungen es gibt:

| Letzte Zeile der Stufenform | Bedeutung |
| --- | --- |
| $-21z = 42$ (jede Stufe besetzt) | genau eine Lösung |
| $0 = 1$ | Widerspruch – **keine** Lösung |
| $0 = 0$ | eine Unbekannte ist frei wählbar – **unendlich viele** Lösungen |

**Geometrisch** ist jede Gleichung mit drei Unbekannten eine **Ebene** im Raum. Drei Ebenen schneiden sich in einem Punkt, in einer Geraden – oder haben keinen gemeinsamen Punkt. In der Simulation drehen sich die Ebenen bei jeder Umformung, der gemeinsame Punkt bleibt aber stehen: Genau deshalb ändern die Umformungen die Lösungsmenge nicht.

## Ausprobieren

1. Gehe mit „Weiter“ durch das Beispiel. Welche Ebene dreht sich bei $\text{III} - 2\cdot\text{I}$? [Beispiel](?lgs=x%20%2B%20y%20%2B%20z%20%3D%206%3B%202y%20%2B%205z%20%3D%20-4%3B%202x%20%2B%205y%20-%20z%20%3D%2027&k=0)
2. Schalte „Ohne Brüche rechnen“ aus und vergleiche die Zwischenschritte: Wann entstehen Brüche? [Mit Brüchen](?lgs=2x%20%2B%203y%20-%20z%20%3D%205%3B%203x%20-%202y%20%2B%202z%20%3D%203%3B%205x%20%2B%20y%20-%203z%20%3D%20-2&int=0&k=0)
3. Hier gibt es keine Lösung: Wo entsteht der Widerspruch, und wie liegen die Ebenen? [Keine Lösung](?lgs=x%20%2B%20y%20%2B%20z%20%3D%201%3B%20x%20-%20y%20%2B%202z%20%3D%203%3B%202x%20%2B%203z%20%3D%205&k=9)
4. Drei Ebenen mit einer gemeinsamen Geraden: Welche Unbekannte wird zum Parameter? [Schnittgerade](?lgs=x%20%2B%20y%20%2B%20z%20%3D%206%3B%20x%20-%20y%20%2B%202z%20%3D%203%3B%202x%20%2B%203z%20%3D%209&k=9)
5. Forme selbst um: Tippe z. B. „III − 2·I“ und drücke „Umformen“. [Selbst umformen](?lgs=x%20%2B%20y%20%2B%20z%20%3D%206%3B%202y%20%2B%205z%20%3D%20-4%3B%202x%20%2B%205y%20-%20z%20%3D%2027&mode=self&op=III%20-%202%C2%B7I)

## Aufgaben

### Aufgabe 1: Stufenform

Bringe $x + y = 3$, $x - y = 1$ auf Stufenform und löse.

<details>
<summary>Lösung anzeigen</summary>

$\text{II} - \text{I}$: $-2y = -2$, also $y = 1$ und $x = 2$. $L = \{(2 \mid 1)\}$ – die beiden Geraden schneiden sich in $(2 \mid 1)$. [In der Simulation zeigen](?lgs=x%20%2B%20y%20%3D%203%3B%20x%20-%20y%20%3D%201&k=9)

</details>

### Aufgabe 2: Drei Unbekannte

Löse das System aus dem Beispiel selbst mit eigenen Umformungen. [Aufgabe laden](?lgs=x%20%2B%20y%20%2B%20z%20%3D%206%3B%202y%20%2B%205z%20%3D%20-4%3B%202x%20%2B%205y%20-%20z%20%3D%2027&mode=self&show=0)

<details>
<summary>Lösung anzeigen</summary>

$\text{III} - 2\cdot\text{I}$, dann $2\cdot\text{III} - 3\cdot\text{II}$: Stufenform mit $-21z = 42$. Rückwärts: $z = -2$, $y = 3$, $x = 5$.

</details>

### Aufgabe 3: Wie viele Lösungen?

Untersuche $x + y + z = 1$, $x - y + 2z = 3$, $2x + 3z = 5$.

<details>
<summary>Lösung anzeigen</summary>

$\text{II} - \text{I}$ und $\text{III} - 2\cdot\text{I}$ ergeben $-2y + z = 2$ und $-2y + z = 3$. Zieht man diese voneinander ab, bleibt $0 = 1$: keine Lösung. Die drei Ebenen haben keinen gemeinsamen Punkt. [In der Simulation zeigen](?lgs=x%20%2B%20y%20%2B%20z%20%3D%201%3B%20x%20-%20y%20%2B%202z%20%3D%203%3B%202x%20%2B%203z%20%3D%205&k=9)

</details>

### Aufgabe 4: Unendlich viele Lösungen

Bestimme die Lösungsmenge von $x + y + z = 6$, $x - y + 2z = 3$, $2x + 3z = 9$.

<details>
<summary>Lösung anzeigen</summary>

In der Stufenform entsteht die Zeile $0 = 0$. Mit $z = t$ folgt $y = \tfrac32 + \tfrac12 t$ und $x = \tfrac92 - \tfrac32 t$. Die Lösungen bilden eine Gerade – die Schnittgerade der drei Ebenen. [In der Simulation zeigen](?lgs=x%20%2B%20y%20%2B%20z%20%3D%206%3B%20x%20-%20y%20%2B%202z%20%3D%203%3B%202x%20%2B%203z%20%3D%209&k=9)

</details>

## Ideen für den Unterricht

- **Einsatz:** zum Einführen des systematischen Verfahrens (Matrixschreibweise) und zum Deuten der Lösungsvielfalt; der Übungsmodus eignet sich für Partnerarbeit („Welche Umformung als Nächstes?“).
- **Geometrie:** Die drehenden Ebenen zeigen anschaulich, warum Zeilenumformungen die Lösungsmenge erhalten.
- **Häufige Stolpersteine:**
  - Vorzeichenfehler beim Abziehen, besonders auf der rechten Seite.
  - Eine Zeile mit 0 malnehmen – dabei geht eine Gleichung verloren.
  - $0 = 0$ als „keine Lösung“ deuten.
- **Bezug zum Lehrplan:** In manchen Kursen genügt die Stufenform, in anderen wird bis zur Diagonalform (Gauß-Jordan) gerechnet – beides ist einstellbar.
