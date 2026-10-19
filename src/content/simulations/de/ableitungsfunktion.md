---
description: "Interaktive Simulation für die 11. Klasse: grafisches Ableiten – ein Punkt läuft über den Graphen, seine Tangentensteigung zeichnet den Graphen der Ableitungsfunktion; Extremstellen, Wendestellen und Monotonie im Zusammenhang."
---

## Worum geht es?

An jeder Stelle $x$ hat der Graph von $f$ eine **Tangente**; ihre Steigung ist die Ableitung $f'(x)$. Ordnet man jedem $x$ diese Steigung zu, erhält man eine neue Funktion – die **Ableitungsfunktion** $f'$.

Man kann ihren Graphen skizzieren, ohne zu rechnen:

- Wo $f$ **steigt**, ist $f'(x) > 0$ – der Graph von $f'$ liegt oberhalb der $x$-Achse.
- Wo $f$ **fällt**, ist $f'(x) < 0$.
- Wo $f$ eine **waagrechte Tangente** hat (Hoch-, Tief- oder Terrassenpunkt), hat $f'$ eine **Nullstelle**. Bei einem Extremum wechselt $f'$ dabei das Vorzeichen.
- Wo $f$ am steilsten steigt oder fällt (**Wendestelle**), hat $f'$ ein **Extremum**.

*Beispiele:* Die Ableitung einer Parabel ist eine Gerade, die Ableitung von $\sin x$ ist $\cos x$, und $e^x$ ist seine eigene Ableitung.

## Ausprobieren

1. [Polynom 3. Grades](?fn=cub&x=-2.5): Ziehe $P$ langsam nach rechts. Beobachte das Steigungsdreieck und den Punkt im unteren Bild.
2. Drücke „P durchlaufen lassen“. Wo liegen die Nullstellen von $f'$? Vergleiche mit dem oberen Graphen.
3. [Parabel](?fn=par&x=-3): Warum ist der Graph von $f'$ eine Gerade?
4. [Sinus](?fn=sin&x=-6): Welche bekannte Funktion entsteht unten?
5. [Polynom 4. Grades](?fn=quart&x=-3.4): Wo hat $f'$ seine Extremstellen? Was passiert dort mit $f$?
6. [e-Funktion](?fn=exp&x=-3.5&full=1): Was fällt beim Vergleich von $f$ und $f'$ auf?

## Aufgaben

### Aufgabe 1: Skizzieren

Skizziere den Graphen der Ableitung von $f(x) = \frac{1}{4}(x^3 - 6x)$, bevor du ihn aufdeckst. [Aufgabe laden](?fn=cub&x=-3.4&show=0&full=0&marks=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$f$ steigt, fällt zwischen den Extremstellen $x = \pm\sqrt{2} \approx \pm 1{,}41$ und steigt wieder. Also ist $f'$ eine nach oben geöffnete Parabel mit Nullstellen bei $\pm\sqrt{2}$ und Tiefpunkt bei $x = 0$ (Wendestelle von $f$): $f'(x) = \frac{3}{4}x^2 - 1{,}5$. [Lösung zeigen](?fn=cub&x=0&full=1)

</details>

### Aufgabe 2: Steigung ablesen

Bestimme die Steigung von $f(x) = 0{,}5x^2 - 2$ an der Stelle $x = 2$ mit dem Steigungsdreieck und vergleiche mit $f'(x) = x$. [Aufgabe laden](?fn=par&x=2&show=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Das Steigungsdreieck geht $1$ nach rechts und $2$ nach oben: $m = 2 = f'(2)$. [Lösung zeigen](?fn=par&x=2)

</details>

### Aufgabe 3: Rückwärts denken

Der Graph von $f'$ ist eine Gerade durch den Ursprung mit positiver Steigung. Was weißt du über $f$?

<details>
<summary>Lösung anzeigen</summary>

Für $x < 0$ ist $f' < 0$, $f$ fällt; für $x > 0$ steigt $f$. Bei $x = 0$ hat $f$ einen Tiefpunkt. $f$ ist eine nach oben geöffnete Parabel (z. B. $0{,}5x^2 + c$). [Zeigen](?fn=par&x=0&full=1)

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Jahrgangsstufe 11 (Ableitungsfunktion, Monotonie und Extremstellen; Ableitung von Sinus und Kosinus grafisch plausibel machen), LehrplanPLUS Gymnasium Bayern.
- **Vorhersagen:** Mit ausgeschalteten Termen und ohne vollständigen Graphen skizzieren die Lernenden $f'$ zuerst auf Papier und prüfen dann, indem sie $P$ ziehen.
- **Partnerspiel:** Eine Person beschreibt nur das Steigungsverhalten, die andere skizziert $f$.
- **Häufige Stolpersteine:**
  - Hochpunkt von $f$ wird mit Hochpunkt von $f'$ verwechselt.
  - Der Funktionswert $f(x)$ wird mit der Steigung $f'(x)$ verwechselt (negative Werte heißen nicht „fällt“).
  - Wendestellen werden übersehen, weil dort nichts „Besonderes“ am Graphen zu sehen ist.
