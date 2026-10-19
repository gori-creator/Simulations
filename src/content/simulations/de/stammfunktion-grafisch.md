---
description: "Interaktive Simulation für die 12. und 13. Klasse: vom Graphen einer Funktion zum Graphen einer Stammfunktion – orientierte Fläche, Integrationskonstante C und die Zusammenhänge zwischen Nullstellen, Extrem- und Wendestellen."
---

## Worum geht es?

Eine Funktion $F$ heißt **Stammfunktion** von $f$, wenn $F'(x) = f(x)$ gilt. Die Werte von $f$ sind also die **Steigungen** von $F$.

Wie skizziert man $F$, wenn nur der Graph von $f$ gegeben ist?

- Wo $f(x) > 0$ ist, **steigt** $F$; wo $f(x) < 0$ ist, **fällt** $F$.
- Wo $f$ eine Nullstelle mit Vorzeichenwechsel hat, hat $F$ eine **Extremstelle** (von $+$ nach $-$: Hochpunkt).
- Wo $f$ eine Extremstelle hat, hat $F$ eine **Wendestelle** – dort ist $F$ am steilsten.
- Der Zuwachs von $F$ zwischen $0$ und $x$ ist die **orientierte Fläche** zwischen dem Graphen von $f$ und der $x$-Achse: $F(x) - F(0) = \int_0^x f(t)\,dt$. Flächen oberhalb der $x$-Achse zählen (von links nach rechts gelesen) positiv, unterhalb negativ.

Stammfunktionen sind nicht eindeutig: Mit $F$ ist auch $F + C$ eine Stammfunktion. Alle Stammfunktionen entstehen durch Verschieben in $y$-Richtung; die **Integrationskonstante** $C$ legt z. B. den Wert $F(0)$ fest.

## Ausprobieren

1. [Parabel](?fn=par&x=-2.9&c=0): Drücke „P durchlaufen lassen“. Wo hat $F$ Hoch- und Tiefpunkte?
2. Ziehe den hohlen Punkt bei $x = 0$ im unteren Bild nach oben oder unten. Was bleibt gleich, was ändert sich?
3. [Kosinus](?fn=cos&x=-6&c=0): Welche Funktion entsteht unten?
4. [Polynom 3. Grades](?fn=cub&x=-3&c=0): Vergleiche die Extremstellen von $f$ mit den Wendestellen von $F$.
5. [Gerade](?fn=lin&x=-3.5&c=-1): Warum ist die Stammfunktion einer Geraden eine Parabel?

## Aufgaben

### Aufgabe 1: Skizzieren

Skizziere eine Stammfunktion von $f(x) = x^2 - 1$ mit $F(0) = 0$, bevor du sie aufdeckst. [Aufgabe laden](?fn=par&x=-2.9&c=0&show=0&fam=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f$ ist positiv für $|x| > 1$ und negativ für $|x| < 1$. Also steigt $F$, hat bei $x = -1$ einen Hochpunkt, fällt bis $x = 1$ (Tiefpunkt) und steigt dann wieder; Wendestelle bei $x = 0$ (Tiefpunkt von $f$). $F(x) = \frac{1}{3}x^3 - x$. [Lösung zeigen](?fn=par&x=2&c=0&full=1)

</details>

### Aufgabe 2: Fläche ablesen

Bestimme $F(2)$ für $f(x) = 0{,}25x^3 - x$ und $F(0) = 1$. [Aufgabe laden](?fn=cub&x=2&c=1&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$\int_0^2 (0{,}25t^3 - t)\,dt = \frac{16}{16} - 2 = -1$, also $F(2) = 1 + (-1) = 0$. [Lösung zeigen](?fn=cub&x=2&c=1)

</details>

### Aufgabe 3: Wahr oder falsch?

„Hat $f$ bei $x_0$ einen Hochpunkt, so hat auch $F$ bei $x_0$ einen Hochpunkt.“

<details>
<summary>Lösung anzeigen</summary>

Falsch. Ein Hochpunkt von $f$ bedeutet: Die Steigung von $F$ ist dort am größten – $F$ hat bei $x_0$ eine Wendestelle. [Beispiel](?fn=gauss&x=1&full=1)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 12 (vom Graphen auf eine Stammfunktion schließen), LehrplanPLUS Gymnasium Bayern; als Vorbereitung auf den Hauptsatz.
- **Gegenstück:** Zusammen mit „Ableitungsfunktion grafisch“ einsetzen – dieselben Zusammenhänge in umgekehrter Richtung.
- **Häufige Stolpersteine:**
  - Hochpunkte von $f$ werden mit Hochpunkten von $F$ verwechselt.
  - Die Integrationskonstante wird vergessen bzw. man glaubt, es gäbe nur eine Stammfunktion.
  - Flächen links von $0$: Beim Integrieren „rückwärts“ kehrt sich das Vorzeichen um.
