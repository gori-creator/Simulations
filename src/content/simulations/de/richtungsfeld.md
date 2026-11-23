---
description: "Richtungsfeld und Differenzialgleichungen: Lösungskurven durch einen ziehbaren Startpunkt, Euler, Heun und Runge-Kutta im Vergleich mit der exakten Lösung – für Wachstum, Zerfall, logistisches Wachstum und Schwingungen."
---

## Worum geht es?

Eine **Differenzialgleichung** (DGL) verbindet eine Funktion mit ihrer Ableitung. Beispiel: Ein Bestand wächst in jedem Moment um 50 % seines aktuellen Werts pro Zeiteinheit:

$$
y'(x) = 0{,}5 \cdot y(x).
$$

Gesucht ist nicht eine Zahl, sondern eine **Funktion**. Zusammen mit einem Startwert, z. B. $y(0) = 2$, ist sie eindeutig: $y(x) = 2 \cdot e^{0{,}5x}$. Also $y(2) = 2e \approx 5{,}437$.

**Richtungsfeld:** Die rechte Seite $f(x, y)$ gibt an jeder Stelle $(x \mid y)$ die Steigung der Lösungskurve an. Zeichnet man an vielen Punkten kleine Striche mit dieser Steigung, entsteht das Richtungsfeld. Jede Lösungskurve schmiegt sich an die Striche an – in der Simulation zeigen fließende Teilchen, wohin das Feld „strömt“.

**Euler-Verfahren:** Vom Startpunkt geht man ein Stück $h$ auf der Tangente weiter:

$$
y_{n+1} = y_n + h \cdot f(x_n, y_n).
$$

Mit $h = 0{,}5$ ergibt sich $y(2) \approx 2 \cdot 1{,}25^4 \approx 4{,}883$ – deutlich zu klein, weil die Kurve nach oben gekrümmt ist. Kleinere Schritte helfen. Genauer sind **Heun** (Mittel aus zwei Steigungen) und **Runge-Kutta** (vier Steigungen).

Wichtige Modelle aus der Schule:

| DGL | Modell | Lösung |
| --- | --- | --- |
| $y' = k \cdot y$ | exponentielles Wachstum/Zerfall | $y = y_0 e^{kx}$ |
| $y' = k \cdot (S - y)$ | beschränktes Wachstum, Abkühlung | $y = S - (S - y_0)e^{-kx}$ |
| $y' = k \cdot y \cdot (S - y)$ | logistisches Wachstum | S-förmige Kurve mit Grenze $S$ |
| $y'' = -\omega^2 y$ | Schwingung | $y = A \cos(\omega x - \varphi)$ |

Bei der **Schwingung** (2. Ordnung) hängt die Beschleunigung $y''$ von der Auslenkung ab. Hier braucht man zwei Startwerte: $y(x_0)$ und $y'(x_0)$. Die Phasenebene zeigt $y$ und $y'$ gleichzeitig – ungedämpft ein geschlossener Ring, gedämpft eine Spirale.

## Ausprobieren

1. Ziehe den Startpunkt. Warum laufen sich die Lösungskurven nie über den Weg? [Wachstum](?order=1&f=0%2C5%C2%B7y&x0=0&y0=2&x1=2&method=euler&h=0.5)
2. Verkleinere $h$ von 0,5 auf 0,1. Wie ändert sich die Abweichung von Euler? Halbiert sie sich ungefähr?
3. Abkühlung: Wohin streben alle Kurven? [Abkühlung](?order=1&f=0%2C1%C2%B7(20%20-%20y)&x0=0&y0=90&x1=30&method=euler&h=2&family=1)
4. Logistisch: Wo ist die Kurve am steilsten? [Logistisch](?order=1&f=0%2C05%C2%B7y%C2%B7(10%20-%20y)&x0=0&y0=0.5&x1=15&method=rk4&h=1&family=1)
5. $y' = x - y$ hat keine Formel aus der Schule. Schalte „Waagerechte Stellen“ ein: Wo sind die Striche waagerecht? [x − y](?order=1&f=x%20-%20y&x0=-2&y0=3&x1=3&method=euler&h=0.5&family=1&iso=1)
6. Schwingung mit Dämpfung: Ändere die Dämpfung und beobachte die Spirale. [Gedämpft](?order=2&f2=-4y%20-%200%2C5y'&x0=0&y0=2&v0=0&x1=8&method=rk4&h=0.2)
7. Räuber und Beute: Warum hinken die Räuber der Beute immer hinterher? [Räuber und Beute](?view=sys&sk=lv&la=1&lc=0.8&lx=60&ly=5)
8. Epidemie: Ab welchem Anteil Geimpfter startet die Welle nicht mehr? Vergleiche mit $1 - 1/R_0$. [Epidemie](?view=sys&sk=sir&r0=2.5&imm=0)
9. Fallschirm: Stelle $k = 0{,}3$ ein. Wie schnell landet man mit offenem Schirm? [Fall](?view=sys&sk=fall&kd=0.004)
10. Rätsel: Welches Feld passt zur Gleichung? [Rätsel](?view=quiz&qn=1)

## Aufgaben

### Aufgabe 1: Euler von Hand

Berechne für $y' = 0{,}5y$, $y(0) = 2$ mit $h = 0{,}5$ die ersten beiden Euler-Schritte.

<details>
<summary>Lösung anzeigen</summary>

$y_1 = 2 + 0{,}5 \cdot 1 = 2{,}5$ und $y_2 = 2{,}5 + 0{,}5 \cdot 1{,}25 = 3{,}125$. Jeder Schritt multipliziert mit $1{,}25$. [In der Simulation zeigen](?order=1&f=0%2C5%C2%B7y&x0=0&y0=2&x1=2&method=euler&h=0.5)

</details>

### Aufgabe 2: Abkühlung

Tee hat 90 °C, der Raum 20 °C, $y' = 0{,}1 \cdot (20 - y)$. Wann ist der Tee 55 °C warm?

<details>
<summary>Lösung anzeigen</summary>

$y = 20 + 70 e^{-0{,}1x}$; $55 = 20 + 70e^{-0{,}1x}$ ergibt $e^{-0{,}1x} = 0{,}5$, also $x = 10 \ln 2 \approx 6{,}9$ Minuten. [In der Simulation zeigen](?order=1&f=0%2C1%C2%B7(20%20-%20y)&x0=0&y0=90&x1=6.9&method=rk4&h=0.5)

</details>

### Aufgabe 3: Schwingung

Für $y'' = -4y$ mit $y(0) = 2$, $y'(0) = 0$: Welche Periode hat die Schwingung?

<details>
<summary>Lösung anzeigen</summary>

$\omega = 2$, also $y = 2\cos(2x)$ mit der Periode $T = \pi \approx 3{,}14$. [In der Simulation zeigen](?order=2&f2=-4y&x0=0&y0=2&v0=0&x1=3.1&method=rk4&h=0.1)

</details>

### Aufgabe 4: Herdenimmunität

Bei Masern ist $R_0 \approx 15$. Welcher Anteil muss immun sein, damit sich die Krankheit nicht ausbreitet?

<details>
<summary>Lösung anzeigen</summary>

Die Welle wächst nur, solange $S/N > 1/R_0$ ist. Also braucht man $1 - 1/15 \approx 93\,\%$ Immune. In der Simulation geht $R_0$ bis 6: Dort reichen $1 - 1/6 \approx 83\,\%$. [Ausprobieren](?view=sys&sk=sir&r0=6&imm=85)

</details>

## Ideen für den Unterricht

- **Einsatz:** Einstieg in Differenzialgleichungen über das Richtungsfeld; Vergleich der Wachstumsmodelle; numerische Verfahren als Fortsetzung der Tangente.
- **Euler-Fehler untersuchen:** Abweichung bei $h$, $h/2$, $h/4$ notieren – bei Euler halbiert sie sich ungefähr, bei Runge-Kutta schrumpft sie viel schneller.
- **Häufige Stolpersteine:**
  - Die Lösung einer DGL ist eine Funktion, keine Zahl.
  - Ohne Startwert ist die Lösung nicht eindeutig (ganze Schar).
  - Euler mit großem $h$ kann sogar das Verhalten verfälschen (z. B. Schwingungen, die wachsen).
- **Bezug zum Lehrplan:** Differenzialgleichungen sind oft Wahl- oder Vertiefungsthema – bitte am eigenen Lehrplan prüfen.
