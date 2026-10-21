---
description: Interaktive Simulation zur Monte-Carlo-Methode – zufällige Punkte im Quadrat liefern einen immer genaueren Schätzwert für die Kreiszahl π.
---

## Worum geht es?

Man kann die Kreiszahl $\pi$ mit **Zufall** bestimmen. Dazu setzt man zufällige Punkte in das Einheitsquadrat (Seitenlänge 1) und zählt, wie viele davon im **Viertelkreis** mit Radius 1 liegen.

Die Flächen verhalten sich so:

$$
\frac{A_\text{Viertelkreis}}{A_\text{Quadrat}} = \frac{\frac{1}{4} \pi \cdot 1^2}{1^2} = \frac{\pi}{4}
$$

Fallen die Punkte gleichmäßig zufällig, so landet ungefähr der Anteil $\frac{\pi}{4} \approx 78{,}5\,\%$ im Viertelkreis. Liegen von $n$ Punkten $k$ im Kreis, gilt also

$$
\frac{k}{n} \approx \frac{\pi}{4} \quad\Rightarrow\quad \pi \approx 4 \cdot \frac{k}{n}.
$$

Ein Punkt $(x \mid y)$ liegt im Viertelkreis, wenn sein Abstand zum Ursprung höchstens 1 ist: $x^2 + y^2 \le 1$ (Satz des Pythagoras). In der Simulation sind Punkte im Kreis rund, Punkte außerhalb kleine Quadrate.

Der Schätzwert ist selbst zufällig. Zwei Durchgänge mit gleich vielen Punkten liefern fast immer verschiedene Werte. Mit wachsendem $n$ wird die Streuung kleiner, aber nur langsam: Die typische Abweichung von $\pi$ ist ungefähr proportional zu $\frac{1}{\sqrt{n}}$.

Solche Verfahren, bei denen man mit vielen Zufallsversuchen etwas berechnet, heißen **Monte-Carlo-Methoden** – nach dem Spielcasino in Monaco. Sie werden z. B. in Physik, Klimaforschung und Finanzmathematik eingesetzt.

## Ausprobieren

1. Setze einzelne Punkte. Wie stark ändert sich der Schätzwert am Anfang?
2. Setze 1000 Punkte oder drücke **Abspielen**. Wie viele Nachkommastellen stimmen? Vergleicht eure Werte in der Klasse – fast jede Person erhält einen anderen Schätzwert.
3. Wechsle zum ganzen Kreis im Quadrat. Warum steht dort derselbe Faktor 4? [Ganzer Kreis](?shape=full)
4. Stelle 1000 Punkte pro Sekunde ein, drücke **Abspielen** und beobachte den Trichter. Verlässt die Kurve ihn manchmal? [Schnell](?speed=1000)

## Aufgaben

### Aufgabe 1: Woher kommt die 4?

Erkläre, warum man den Anteil der Punkte im Kreis mit 4 multiplizieren muss.

<details>
<summary>Lösung anzeigen</summary>

Der Anteil der Punkte im Kreis schätzt das Flächenverhältnis $\frac{\pi}{4}$ (Viertelkreis zu Quadrat). Multipliziert man mit 4, erhält man einen Schätzwert für $\pi$.

</details>

### Aufgabe 2: Gleicher Faktor beim ganzen Kreis

Beim ganzen Kreis mit Radius 1 liegen die Punkte in einem Quadrat mit Seitenlänge 2. Zeige, dass das Flächenverhältnis wieder $\frac{\pi}{4}$ ist.

<details>
<summary>Lösung anzeigen</summary>

$$\frac{A_\text{Kreis}}{A_\text{Quadrat}} = \frac{\pi \cdot 1^2}{2^2} = \frac{\pi}{4}$$

[In der Simulation zeigen](?shape=full)

</details>

### Aufgabe 3: Wie genau wird es?

Für einen Schätzwert, der mit etwa 95 % Sicherheit höchstens $0{,}01$ von $\pi$ abweicht, braucht man ungefähr $100\,000$ Punkte. Wie viele Punkte braucht man ungefähr, damit die Abweichung höchstens $0{,}001$ beträgt?

<details>
<summary>Lösung anzeigen</summary>

Die typische Abweichung schrumpft mit $\frac{1}{\sqrt{n}}$. Genauer: Mit etwa 95 % Sicherheit ist die Abweichung höchstens

$$
1{,}96 \cdot 4 \cdot \sqrt{\frac{\frac{\pi}{4}\left(1 - \frac{\pi}{4}\right)}{n}} \approx \frac{3{,}22}{\sqrt{n}}.
$$

Für $n = 100\,000$ ergibt das $\frac{3{,}22}{316{,}2} \approx 0{,}010$. Für eine zehnmal kleinere Abweichung braucht man $10^2 = 100$-mal so viele Punkte, also etwa $10$ Millionen. Monte-Carlo-Verfahren sind deshalb für $\pi$ eher langsam – ihr Vorteil zeigt sich bei Problemen, die man kaum anders lösen kann.

</details>

### Aufgabe 4: Klassen-Experiment

Jede Person setzt 1000 Punkte und notiert $k$ und $n$. Wie kombiniert man alle Ergebnisse der Klasse zu einem besseren Schätzwert?

<details>
<summary>Lösung anzeigen</summary>

Man addiert alle Treffer und alle Punkte: $\pi \approx 4 \cdot \frac{k_1 + k_2 + \ldots}{n_1 + n_2 + \ldots}$. Bei 25 Personen sind das $25\,000$ Punkte. Die typische Abweichung ist dann etwa $\sqrt{25} = 5$-mal kleiner als bei einer Person. Einzelne Personen können trotzdem näher an $\pi$ liegen als die ganze Klasse – das ist Zufall.

</details>

## Ideen für den Unterricht

- **Einsatz:** Bayern Jahrgangsstufe 10 (Simulation von Zufallsexperimenten, Kreiszahl). Verknüpft Stochastik, Flächeninhalt des Kreises und den Satz des Pythagoras.
- **Darstellung:** Die ersten $120\,000$ Punkte werden gezeichnet, gezählt wird unbegrenzt. Der Trichter zeigt für jedes $n$ den Bereich, in dem etwa 95 % der Schätzwerte nach $n$ Punkten liegen ($\pi \pm \frac{3{,}22}{\sqrt{n}}$). Er beruht auf einer Näherung durch die Normalverteilung und ist für kleine $n$ (unter etwa 50) nur grob. Eine einzelne Kurve darf ihn zwischendurch verlassen: Im Mittel liegt sie bei etwa 5 % aller $n$ außerhalb.
- **Häufige Stolpersteine:**
  - „Mit mehr Punkten wird der Wert bei jedem Schritt genauer.“ – Der Schätzwert schwankt weiter, nur immer weniger.
  - „Bei 1000 Punkten stimmen immer zwei Nachkommastellen.“ – Die typische Abweichung liegt bei 1000 Punkten um $0{,}05$; oft stimmt nur die erste Nachkommastelle.
  - Zufallszahlen am Computer sind „echt zufällig“ – tatsächlich sind es Pseudozufallszahlen, die für solche Zwecke aber gut genug sind.
- **Schätzwerte sammeln:** Spannend ist es, jede Gruppe 1000 Punkte setzen zu lassen und die Schätzwerte an der Tafel zu sammeln. Die Werte streuen sichtbar um $\pi$ – ein guter Einstieg in die Frage, wie genau eine Schätzung ist.
