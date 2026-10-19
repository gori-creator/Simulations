---
description: "Interaktive Simulation für das Studium: Fourier-Reihen von Rechteck, Sägezahn, Dreieck und gleichgerichtetem Sinus – Teilschwingung für Teilschwingung aufgebaut, mit Amplitudenspektrum, Prüfstelle und Gibbs-Phänomen."
---

## Worum geht es?

Jede (hinreichend gutartige) $2\pi$-periodische Funktion lässt sich als Summe von Sinus- und Kosinusschwingungen schreiben – als **Fourier-Reihe**:

$$f(x) \approx \frac{a_0}{2} + \sum_{k=1}^{N} \bigl(a_k \cos kx + b_k \sin kx\bigr), \qquad a_k = \frac{1}{\pi}\int_{-\pi}^{\pi} f(x)\cos kx\,dx, \quad b_k = \frac{1}{\pi}\int_{-\pi}^{\pi} f(x)\sin kx\,dx.$$

Die Schwingung mit $k = 1$ heißt **Grundschwingung**, die übrigen sind **Oberschwingungen**. Die Amplituden $\sqrt{a_k^2 + b_k^2}$ bilden das **Amplitudenspektrum** – so „sieht“ man, aus welchen Frequenzen ein Signal besteht.

*Beispiel Rechtecksignal:* $f(x) = \frac{4}{\pi}\left(\sin x + \frac{1}{3}\sin 3x + \frac{1}{5}\sin 5x + \ldots\right)$ – nur ungerade Vielfache, Amplituden wie $\frac{1}{k}$.

**Glatt oder sprunghaft?** Signale mit Sprüngen (Rechteck, Sägezahn) haben Amplituden, die nur wie $\frac{1}{k}$ abnehmen; die Reihe konvergiert langsam. Beim Dreieck (nur Knicke) fallen sie wie $\frac{1}{k^2}$ – schon wenige Glieder sehen fast perfekt aus.

**Gibbs-Phänomen:** An einer Sprungstelle schießt die Partialsumme über – beim Rechteck auf etwa $1{,}179$ statt $1$. Mit wachsendem $N$ wird der Überschwinger schmaler, aber nicht niedriger: Es bleiben rund $9\,\%$ der Sprunghöhe.

## Ausprobieren

1. [Rechteck](?sig=sq&n=1): Drücke mehrmals „Nächste Teilschwingung“. Warum ändert sich bei geraden $k$ nichts?
2. Drücke „Aufbau abspielen“ und beobachte die Ecken des Rechtecks.
3. [Gibbs-Phänomen](?sig=sq&n=30&x=0.1): Ziehe die Prüfstelle nahe an den Sprung. Wird der Überschwinger mit größerem $N$ kleiner?
4. [Dreieck](?sig=tri&n=3): Vergleiche das Spektrum mit dem des Rechtecks.
5. [Gleichgerichteter Wechselstrom](?sig=half&n=6): Welche Rolle spielt der konstante Anteil $\frac{1}{\pi}$?

## Aufgaben

### Aufgabe 1: Partialsumme berechnen

Berechne die Partialsumme $S_3$ des Rechtecksignals an der Stelle $x = 1{,}2$. [Aufgabe laden](?sig=sq&n=3&x=1.2&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$S_3(1{,}2) = \frac{4}{\pi}\left(\sin 1{,}2 + \frac{1}{3}\sin 3{,}6\right) \approx 1{,}2732 \cdot (0{,}9320 - 0{,}1475) \approx 0{,}999$ – schon sehr nahe am Zielwert $1$. [Zeigen](?sig=sq&n=3&x=1.2)

</details>

### Aufgabe 2: Symmetrie

Warum enthält die Reihe des Rechtecks nur Sinus-, die des Dreiecks nur Kosinusglieder?

<details>
<summary>Lösung anzeigen</summary>

Das Rechteck ist punktsymmetrisch (ungerade Funktion): alle $a_k = 0$. Das Dreieck ist achsensymmetrisch (gerade Funktion): alle $b_k = 0$. [Rechteck](?sig=sq&n=5), [Dreieck](?sig=tri&n=5)

</details>

### Aufgabe 3: Eine berühmte Reihe

Setze $x = \frac{\pi}{2}$ in die Reihe des Rechtecks ein. Welche Reihe für $\frac{\pi}{4}$ entsteht?

<details>
<summary>Lösung anzeigen</summary>

$1 = \frac{4}{\pi}\left(1 - \frac{1}{3} + \frac{1}{5} - \frac{1}{7} + \ldots\right)$, also $\frac{\pi}{4} = 1 - \frac{1}{3} + \frac{1}{5} - \ldots$ (Leibniz-Reihe).

</details>

## Ideen für den Unterricht

*Nur als Anregung gedacht – Sie kennen Ihre Klasse am besten.*

- **Einsatz:** Analysis bzw. Mathematik für Ingenieure im Studium; als Ausblick auch in einem Seminar der Oberstufe (Akustik, Signalverarbeitung).
- **Fächerverbindend:** Klangfarben von Instrumenten unterscheiden sich in ihrem Spektrum – Verbindung zur Physik (Akustik) und Informatik (Kompression).
- **Häufige Stolpersteine:**
  - Der konstante Anteil ist $\frac{a_0}{2}$, nicht $a_0$.
  - Man erwartet, dass das Gibbs-Überschwingen mit $N$ verschwindet.
  - Konvergenz an der Sprungstelle: Die Reihe liefert dort den Mittelwert der einseitigen Grenzwerte.
