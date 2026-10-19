---
description: "Interaktive Simulation für die 12. und 13. Klasse: Funktionenscharen mit Parameter k – Extrempunkte in Abhängigkeit von k, Ortskurve, gemeinsame Punkte aller Scharkurven und Fallunterscheidung, mit ziehbaren Extrempunkten."
---

## Worum geht es?

Eine **Funktionenschar** fasst unendlich viele Funktionen zusammen, die sich nur in einem **Parameter** $k$ unterscheiden, zum Beispiel $f_k(x) = x^3 - kx$. Für jedes $k$ erhält man einen eigenen Graphen.

Typische Fragen:

- **Fallunterscheidung:** Für welche $k$ gibt es Extrempunkte? Bei $f_k(x) = x^3 - kx$ ist $f_k'(x) = 3x^2 - k$. Für $k < 0$ gibt es keine Nullstelle, für $k = 0$ einen Terrassenpunkt, für $k > 0$ einen Hoch- und einen Tiefpunkt bei $x = \pm\sqrt{\frac{k}{3}}$.
- **Ortskurve:** Auf welcher Kurve wandern die Extrempunkte, wenn $k$ sich ändert? Man löst $x = \sqrt{\frac{k}{3}}$ nach $k$ auf ($k = 3x^2$) und setzt in $y = f_k(x)$ ein: $y = x^3 - 3x^2 \cdot x = -2x^3$.
- **Gemeinsame Punkte:** Gibt es Punkte, durch die alle Scharkurven gehen? Aus $f_{k_1}(x) = f_{k_2}(x)$ für $k_1 \neq k_2$ folgt hier $x = 0$, also der Punkt $(0 \mid 0)$.

## Ausprobieren

1. [x³ − kx](?fam=cub&k=1.5): Ziehe den Hochpunkt. Auf welcher Kurve bewegt er sich?
2. Drücke „k durchlaufen lassen“. Wann verschwinden die Extrempunkte?
3. [Parabelschar](?fam=par&k=1): Alle Parabeln gehen durch einen Punkt. Welchen?
4. [x · e^(−kx)](?fam=exp&k=1): Was passiert mit dem Extrempunkt, wenn $k$ negativ wird?
5. [kx² − x⁴](?fam=quart&k=2): Wie ändert sich die Form zwischen $k < 0$ und $k > 0$?

## Aufgaben

### Aufgabe 1: Extrempunkte in Abhängigkeit von k

Bestimme die Extrempunkte von $f_k(x) = x^2 - 2kx + k$ und die Ortskurve. [Aufgabe laden](?fam=par&k=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f_k'(x) = 2x - 2k = 0 \Rightarrow x = k$, $f_k(k) = k - k^2$, also Tiefpunkt $T(k \mid k - k^2)$. Ortskurve: $k = x$ einsetzen: $y = x - x^2$. [Lösung zeigen](?fam=par&k=1)

</details>

### Aufgabe 2: Gemeinsamer Punkt

Zeige, dass alle Graphen von $f_k(x) = x^2 - 2kx + k$ durch den Punkt $\left(\frac{1}{2} \mid \frac{1}{4}\right)$ gehen.

<details>
<summary>Lösung anzeigen</summary>

$f_k\left(\frac{1}{2}\right) = \frac{1}{4} - k + k = \frac{1}{4}$ – unabhängig von $k$. [Zeigen](?fam=par&k=-1)

</details>

### Aufgabe 3: Fallunterscheidung

Für welche $k$ hat $f_k(x) = kx^2 - x^4$ drei Extrempunkte? Gib sie an. [Aufgabe laden](?fam=quart&k=2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f_k'(x) = 2kx - 4x^3 = 2x(k - 2x^2)$. Für $k > 0$: $x = 0$ (Tiefpunkt) und $x = \pm\sqrt{\frac{k}{2}}$ (Hochpunkte $\left(\pm\sqrt{\frac{k}{2}} \mid \frac{k^2}{4}\right)$). Für $k \leq 0$ nur der Hochpunkt $(0 \mid 0)$. [Lösung zeigen](?fam=quart&k=2)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 12 (ganzrationale Funktionen mit Parametern) und 13 (Funktionenscharen in Anwendungen), LehrplanPLUS Gymnasium Bayern.
- **Vermuten, dann rechnen:** Erst die Ortskurve mit „k durchlaufen lassen“ als Spur sichtbar machen, dann rechnerisch bestätigen.
- **Häufige Stolpersteine:**
  - Beim Ableiten wird $k$ wie eine Variable behandelt.
  - Die Fallunterscheidung (z. B. $k < 0$) wird vergessen; Wurzeln aus negativen Zahlen.
  - Bei der Ortskurve wird $x$ nicht nach $k$ aufgelöst, sondern $k$ einfach weggelassen.
