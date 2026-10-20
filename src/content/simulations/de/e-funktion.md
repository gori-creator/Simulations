---
description: "Interaktive Simulation zur natürlichen Exponentialfunktion: Warum gerade die Basis e? Für y = bˣ ist f′(x) : f(x) = ln b, nur bei b = e fallen f und f′ zusammen. Dazu die Tangente an y = eˣ mit Steigungsdreieck und (1 + 1/n)ⁿ als Zinseszins."
---

## Worum geht es?

Jede Exponentialfunktion $f(x) = b^x$ mit $b > 1$ wächst – und zwar umso schneller, je größer ihr Funktionswert schon ist. Genauer: Die **Ableitung** ist ein festes Vielfaches der Funktion selbst,

$$
f(x) = b^x \quad\Longrightarrow\quad f'(x) = \ln b \cdot b^x, \qquad \frac{f'(x)}{f(x)} = \ln b \;\text{ für alle } x.
$$

Für $b = 2$ ist der Faktor $\ln 2 \approx 0{,}693$: Der Graph von $f'$ liegt **unter** dem von $f$. Für $b = 3$ ist $\ln 3 \approx 1{,}099$: $f'$ liegt **über** $f$. Dazwischen gibt es genau eine Basis, für die der Faktor $1$ ist – die **eulersche Zahl**

$$
e = 2{,}718281828\ldots \qquad\text{mit}\qquad (e^x)' = e^x .
$$

Die Funktion $f(x) = e^x$ heißt **natürliche Exponentialfunktion**. Sie ist ihre eigene Ableitung: An jeder Stelle ist die Steigung so groß wie der Funktionswert. Im Punkt $(0 \mid 1)$ hat ihr Graph die Steigung $1$, die Tangente dort ist $y = x + 1$.

**Tangente und Steigungsdreieck.** Die Tangente im Punkt $P(x_0 \mid e^{x_0})$ lautet

$$
t:\; y = e^{x_0} \cdot (x - x_0 + 1).
$$

Sie schneidet die $x$-Achse immer bei $x_0 - 1$. Das Dreieck aus diesem Schnittpunkt, dem Fußpunkt $(x_0 \mid 0)$ und $P$ hat also die **Grundseite 1** und die **Höhe $f(x_0)$** – seine Steigung ist genau der Funktionswert.

**Wo kommt e her?** Legt man $1\,€$ zu $100\,\%$ Jahreszins an und verzinst $n$-mal im Jahr mit je $\frac{100\,\%}{n}$, hat man nach einem Jahr

$$
\left(1 + \frac{1}{n}\right)^{n} \;€: \quad n = 1:\ 2\,€, \quad n = 12:\ 2{,}6130\,€, \quad n = 365:\ 2{,}7146\,€ .
$$

Die Folge wächst, bleibt aber unter $e$ und nähert sich $e$ beliebig an.

**Steckbrief von $f(x) = e^x$:** $D = \mathbb{R}$, $W = \mathbb{R}^+$, keine Nullstelle, Schnittpunkt mit der $y$-Achse $(0 \mid 1)$, Asymptote $y = 0$ für $x \to -\infty$, streng monoton steigend, linksgekrümmt, $f' = f$, Stammfunktion $F(x) = e^x + C$. Die **Umkehrfunktion** ist der natürliche Logarithmus $\ln x$: $\ln(e^x) = x$ und $e^{\ln x} = x$ für $x > 0$; ihr Graph entsteht durch Spiegelung an $y = x$.

## Ausprobieren

1. Ziehe den Punkt $(1 \mid b)$ langsam nach oben. Beobachte die rot gestrichelte Ableitung und die Wertetabelle: Die letzte Spalte $f' : f$ ist in jeder Zeile gleich. [Beispiel laden](?b=2)
2. Stelle $b = 3$ ein. Liegt $f'$ jetzt über oder unter $f$? Vergleiche mit der Steigung der orangen Tangente in $(0 \mid 1)$. [Beispiel laden](?b=3)
3. Klicke auf **Basis e suchen**: Die Basis läuft von $1{,}5$ bis $4$ und wieder zurück. Bei $b = e$ rastet sie ein, die Graphen von $f$ und $f'$ fallen zusammen. [Beispiel laden](?b=2.72)
4. Wechsle zur **Tangente** und ziehe $P$. Wo schneidet die Tangente die $x$-Achse? Wie hoch ist das Steigungsdreieck? [Beispiel laden](?view=tangent&x0=1)
5. Klicke auf **Punkt entlangfahren** und achte auf die Grundseite des Dreiecks.
6. Schalte die **Umkehrfunktion** ein: Der Graph von $e^x$ klappt an $y = x$ zum Graphen von $\ln x$ um, aus $P(1 \mid e)$ wird $P'(e \mid 1)$. [Beispiel laden](?view=tangent&x0=1&inv=1)
7. Wechsle zu **e entsteht** und klicke auf **n wachsen lassen**. Wie viele Nachkommastellen von $e$ stimmen bei $n = 1000$, wie viele bei $n = 1\,000\,000$? [Beispiel laden](?view=limit&ns=0)

## Aufgaben

### Aufgabe 1: Ableitung von 2ˣ

Bestimme mit dem Steigungsdreieck an der Tangente in $(0 \mid 1)$ die Steigung des Graphen von $f(x) = 2^x$ an der Stelle $0$. Berechne damit $f'(1)$ und $f'(3)$. [Aufgabe laden](?b=2&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Das Dreieck hat die Grundseite $1$ und die Höhe $\ln 2 \approx 0{,}69$, also $f'(0) = \ln 2 \approx 0{,}693$. Wegen $f'(x) = \ln 2 \cdot 2^x$ ist $f'(1) = 2 \ln 2 \approx 1{,}386$ und $f'(3) = 8 \ln 2 \approx 5{,}545$. [In der Simulation zeigen](?b=2)

</details>

### Aufgabe 2: Größer oder kleiner?

Ohne Rechner: Liegt der Graph der Ableitung von $f(x) = 3^x$ über oder unter dem von $f$? Begründe mit der Lage von $3$ und $e$.

<details>
<summary>Lösung anzeigen</summary>

$3 > e$, also $\ln 3 > \ln e = 1$. Damit ist $f'(x) = \ln 3 \cdot 3^x > 3^x = f(x)$ für alle $x$: Der Graph von $f'$ liegt überall **über** dem von $f$ (Faktor $\ln 3 \approx 1{,}099$). [In der Simulation zeigen](?b=3)

</details>

### Aufgabe 3: Tangente an der Stelle 2

Stelle die Gleichung der Tangente an $y = e^x$ im Punkt $P(2 \mid e^2)$ auf und bestimme ihre Nullstelle. [Aufgabe laden](?view=tangent&x0=2&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

$m = f'(2) = e^2 \approx 7{,}389$. $t: y = e^2 \cdot (x - 2 + 1) = e^2 \cdot (x - 1) \approx 7{,}389x - 7{,}389$. Nullstelle: $x = 1 = x_0 - 1$. [In der Simulation zeigen](?view=tangent&x0=2)

</details>

### Aufgabe 4: Tangente durch den Ursprung

In welchem Punkt $P$ geht die Tangente an $y = e^x$ durch den Ursprung? Gib ihre Gleichung an.

<details>
<summary>Lösung anzeigen</summary>

Die Tangente schneidet die $x$-Achse bei $x_0 - 1$. Das ist $0$ für $x_0 = 1$, also $P(1 \mid e)$ und $t: y = e \cdot x \approx 2{,}718x$. [In der Simulation zeigen](?view=tangent&x0=1)

</details>

### Aufgabe 5: Zinseszins

a) Berechne $\left(1 + \frac{1}{4}\right)^4$ (vierteljährliche Verzinsung) und vergleiche mit $n = 12$.
b) Um wie viel liegt die tägliche Verzinsung ($n = 365$) noch unter $e$?
c) Realistischer: $5\,\%$ Jahreszins, monatlich verzinst. Vergleiche $\left(1 + \frac{0{,}05}{12}\right)^{12}$ mit $e^{0{,}05}$.

<details>
<summary>Lösung anzeigen</summary>

a) $1{,}25^4 = 2{,}4414$; bei $n = 12$ sind es $2{,}6130$. [Zeigen](?view=limit&ns=3)

b) $e - 2{,}7146 \approx 0{,}0037$. [Zeigen](?view=limit&ns=19)

c) $\left(1 + \frac{0{,}05}{12}\right)^{12} \approx 1{,}05116$ und $e^{0{,}05} \approx 1{,}05127$: Aus $1000\,€$ werden $1051{,}16\,€$ bzw. bei „stetiger“ Verzinsung $1051{,}27\,€$ – der Unterschied ist sehr klein. (Diese Teilaufgabe rechnet man von Hand; die Simulation zeigt nur $100\,\%$.)

</details>

### Aufgabe 6: Spiegeln

Der Punkt $P(2 \mid e^2)$ liegt auf dem Graphen von $e^x$. Welcher Punkt liegt dann auf dem Graphen von $\ln x$? Berechne damit $\ln(7{,}389)$ näherungsweise. [Aufgabe laden](?view=tangent&x0=2&inv=1&info=0&_hide=1)

<details>
<summary>Lösung anzeigen</summary>

Spiegeln an $y = x$ vertauscht die Koordinaten: $P'(e^2 \mid 2) \approx (7{,}389 \mid 2)$, also $\ln(7{,}389) \approx 2$ (genau: $\ln(e^2) = 2$). [In der Simulation zeigen](?view=tangent&x0=2&inv=1)

</details>

## Ideen für den Unterricht

- **Einsatz:** Jahrgangsstufe 12, Lernbereich „Natürliche Exponentialfunktion“ (LehrplanPLUS Bayern, Gymnasium; Zuordnung bitte am Lehrplan prüfen). Die Ansicht „Die besondere Basis“ eignet sich als Einstieg: Die Frage „Gibt es eine Exponentialfunktion, die mit ihrer Ableitung übereinstimmt?“ lässt sich durch Ziehen am Punkt $(1 \mid b)$ erforschen, bevor $e$ benannt wird.
- **Ableitung von $b^x$:** Die Formel $f'(x) = \ln b \cdot b^x$ setzt die Kettenregel ($b^x = e^{x \ln b}$) voraus. Ohne sie kann man den konstanten Faktor auch rein numerisch entdecken: Die Wertetabelle berechnet $f'$ mit dem Differenzenquotienten.
- **Zinseszins:** Die Ansicht „e entsteht“ zeigt eine anschauliche Bedeutung von $e$ (stetige Verzinsung). Dass die Folge $\left(1 + \frac{1}{n}\right)^n$ wirklich gegen $e$ konvergiert, wird hier nur sichtbar gemacht, nicht bewiesen.
- **Häufige Stolpersteine:**
  - „$e^x$ und $x^e$ sind dasselbe.“ – Bei $e^x$ steht die Variable im Exponenten; $(x^e)' = e \cdot x^{e-1}$.
  - „Die Ableitung von $2^x$ ist $x \cdot 2^{x-1}$.“ – Die Potenzregel gilt nur für $x^n$, nicht für Exponentialfunktionen.
  - „Der Graph von $e^x$ schneidet irgendwann die $x$-Achse.“ – $e^x > 0$ für alle $x$; die $x$-Achse ist Asymptote.
  - Beim Spiegeln an $y = x$ wird oft an der $x$-Achse gespiegelt; die Umkehrfunktion vertauscht $x$ und $y$.
- **Aufgabenmodus:** Mit `info=0` und **Teilen → Ergebnisse verdecken** werden Werte im Bild und in den Ergebnissen verdeckt; Graphen, Tangente und Dreieck bleiben zum Ablesen sichtbar.
